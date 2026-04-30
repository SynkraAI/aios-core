import logging
import os

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.pipeline.mediapipe_processor import process_image
from app.pipeline.plan_generator import generate_workout_plan
from app.pipeline.report_generator import generate_report
from app.pipeline.score_calculator import calculate_scores
from app.services.db_service import get_analysis, mark_failed, mark_photos_deleted
from app.services.s3_service import delete_both_photos, download_photo

logger = logging.getLogger(__name__)
router = APIRouter()

API_GATEWAY_URL = os.getenv("API_GATEWAY_URL", "http://localhost:3000")
INTERNAL_SECRET = os.getenv("INTERNAL_SECRET", "")


class AnalyzeRequest(BaseModel):
    analysis_id: str
    user_id: str


@router.post("/analyze")
async def analyze(request: AnalyzeRequest):
    analysis_id = request.analysis_id

    try:
        # 1. Fetch analysis + user profile
        analysis = get_analysis(analysis_id)
        if not analysis:
            raise ValueError(f"Analysis {analysis_id} not found")

        front_url: str = analysis["photo_front_url"]
        back_url: str = analysis["photo_back_url"]
        if not front_url or not back_url:
            raise ValueError("Missing photo URLs")

        # 2. Download photos
        front_bytes = download_photo(front_url)
        back_bytes = download_photo(back_url)

        # 3. MediaPipe processing
        landmarks_front = process_image(front_bytes)
        landmarks_back = process_image(back_bytes)

        # 4. Calculate scores
        scores = calculate_scores(landmarks_front, landmarks_back)
        scores_dict = scores.to_dict()

        # 5. LGPD: delete both photos BEFORE persisting result
        delete_both_photos(front_url, back_url)
        mark_photos_deleted(analysis_id)

        # 6. Generate report and workout plan
        profile = {
            "sex": analysis.get("sex"),
            "age": analysis.get("age"),
            "goal": analysis.get("goal"),
            "height_cm": analysis.get("height_cm"),
            "weight_kg": analysis.get("weight_kg"),
        }
        report = generate_report(scores_dict, profile)
        workout_plan = generate_workout_plan(scores_dict, profile)

        # 7. Callback to API Gateway
        async with httpx.AsyncClient(timeout=30) as http:
            resp = await http.post(
                f"{API_GATEWAY_URL}/internal/analyses/{analysis_id}/complete",
                json={
                    "scores": scores_dict,
                    "report": dict(report),
                    "workout_plan": dict(workout_plan),
                },
                headers={"x-internal-secret": INTERNAL_SECRET},
            )
            resp.raise_for_status()

        return {"status": "completed", "analysis_id": analysis_id}

    except Exception as exc:
        logger.error("[ai-engine] Pipeline failed for %s: %s", analysis_id, exc, exc_info=True)
        try:
            mark_failed(analysis_id)
        except Exception as db_err:
            logger.error("[ai-engine] Failed to mark %s as failed: %s", analysis_id, db_err)
        raise HTTPException(status_code=500, detail=str(exc))
