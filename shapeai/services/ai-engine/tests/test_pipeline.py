import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient


@pytest.fixture
def client():
    from app.main import app
    return TestClient(app)


def _analysis():
    return {
        "id": "analysis-id",
        "user_id": "user-id",
        "status": "processing",
        "photo_front_url": "https://s3.example.com/front.jpg",
        "photo_back_url": "https://s3.example.com/back.jpg",
        "sex": "male",
        "age": 25,
        "goal": "muscle",
        "height_cm": 180,
        "weight_kg": 80,
    }


def _landmarks():
    lm = {"x": 0.5, "y": 0.5, "z": 0.0, "visibility": 0.9}
    return {k: lm for k in [
        "nose", "left_shoulder", "right_shoulder",
        "left_hip", "right_hip", "left_knee", "right_knee",
        "left_wrist", "left_elbow",
    ]}


def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_analyze_success(client):
    mock_report = {"highlights": [], "development_areas": []}
    mock_plan = {"weeks": [{"week_number": 1, "sessions": []}]}
    mock_http_resp = MagicMock()
    mock_http_resp.raise_for_status = MagicMock()

    with (
        patch("app.routers.analysis.get_analysis", return_value=_analysis()),
        patch("app.routers.analysis.download_photo", return_value=b"img"),
        patch("app.routers.analysis.process_image", return_value=_landmarks()),
        patch("app.routers.analysis.delete_both_photos"),
        patch("app.routers.analysis.mark_photos_deleted"),
        patch("app.routers.analysis.generate_report", return_value=mock_report),
        patch("app.routers.analysis.generate_workout_plan", return_value=mock_plan),
        patch("app.routers.analysis.httpx.AsyncClient") as mock_http,
    ):
        mock_ctx = MagicMock()
        mock_ctx.post = AsyncMock(return_value=mock_http_resp)
        mock_http.return_value.__aenter__ = AsyncMock(return_value=mock_ctx)
        mock_http.return_value.__aexit__ = AsyncMock(return_value=False)

        resp = client.post("/analyze", json={"analysis_id": "analysis-id", "user_id": "user-id"})

    assert resp.status_code == 200
    assert resp.json()["status"] == "completed"


def test_analyze_marks_failed_on_s3_error(client):
    with (
        patch("app.routers.analysis.get_analysis", return_value=_analysis()),
        patch("app.routers.analysis.download_photo", side_effect=Exception("S3 down")),
        patch("app.routers.analysis.mark_failed") as mock_fail,
    ):
        resp = client.post("/analyze", json={"analysis_id": "analysis-id", "user_id": "user-id"})

    assert resp.status_code == 500
    mock_fail.assert_called_once_with("analysis-id")


def test_analyze_marks_failed_on_mediapipe_error(client):
    with (
        patch("app.routers.analysis.get_analysis", return_value=_analysis()),
        patch("app.routers.analysis.download_photo", return_value=b"img"),
        patch("app.routers.analysis.process_image", side_effect=ValueError("No pose detected")),
        patch("app.routers.analysis.mark_failed") as mock_fail,
    ):
        resp = client.post("/analyze", json={"analysis_id": "analysis-id", "user_id": "user-id"})

    assert resp.status_code == 500
    mock_fail.assert_called_once()


def test_analyze_returns_404_when_analysis_missing(client):
    with patch("app.routers.analysis.get_analysis", return_value=None):
        resp = client.post("/analyze", json={"analysis_id": "missing", "user_id": "user-id"})

    assert resp.status_code == 500
    assert "not found" in resp.json()["detail"].lower()
