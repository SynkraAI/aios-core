import base64
import io
import json
import logging
import os
from typing import TypedDict

import anthropic
from PIL import Image

logger = logging.getLogger(__name__)
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

MAX_IMAGE_PX = 1024  # limita tamanho para reduzir tokens

VISION_PROMPT = """\
Você é um coach de fisiculturismo e avaliador físico com 20 anos de experiência.
Analise estas duas fotos corporais (frente e costas) e retorne SOMENTE um JSON válido, sem markdown.

Estrutura obrigatória:
{
  "body_fat_estimate": <float: percentual estimado de gordura, ex: 18.5>,
  "body_fat_category": <"muito_magro"|"magro"|"atlético"|"médio"|"acima_media"|"obeso">,
  "fat_distribution": <"uniforme"|"abdominal"|"membros_inferiores"|"flancos"|"generalizada">,
  "fat_areas": [<regiões com gordura localizada visível, ex: "abdomen", "flancos", "coxa", "glúteos", "peitoral_inferior">],
  "muscle_highlights": [<grupos musculares visivelmente mais desenvolvidos>],
  "muscle_deficits": [<grupos musculares menos desenvolvidos em relação ao restante do físico>],
  "proportional_notes": <string: análise de proporção e equilíbrio — ex: "Ombros e braços desenvolvidos criam desequilíbrio com peitoral menos volumoso">,
  "body_type": <"ectomorfo"|"mesomorfo"|"endomorfo"|"misto">,
  "overall_assessment": <string: avaliação em tom de coach profissional, 2-3 frases diretas e motivadoras>
}

Seja específico, honesto e construtivo. Analise simetria, proporções, gordura localizada e desenvolvimento relativo entre grupos musculares."""


class BodyComposition(TypedDict):
    body_fat_estimate: float
    body_fat_category: str
    fat_distribution: str
    fat_areas: list
    muscle_highlights: list
    muscle_deficits: list
    proportional_notes: str
    body_type: str
    overall_assessment: str


def _resize_image(image_bytes: bytes, max_px: int = MAX_IMAGE_PX) -> bytes:
    """Redimensiona para max_px no maior lado mantendo proporção."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    w, h = img.size
    if max(w, h) > max_px:
        ratio = max_px / max(w, h)
        img = img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return buf.getvalue()


def _to_base64(image_bytes: bytes) -> str:
    return base64.standard_b64encode(image_bytes).decode("utf-8")


def _fallback_composition(profile: dict) -> BodyComposition:
    """Fallback baseado no perfil quando a API de visão está indisponível."""
    sex = profile.get("sex", "M")
    height = float(profile.get("height_cm") or 170)
    weight = float(profile.get("weight_kg") or 75)
    bmi = weight / ((height / 100) ** 2)

    if sex == "F":
        fat = max(10.0, min(45.0, bmi * 0.8 + 7.0))
    else:
        fat = max(5.0, min(40.0, bmi * 0.7 - 3.0))

    if fat < 12:
        category = "muito_magro"
    elif fat < 17:
        category = "magro"
    elif fat < 22:
        category = "atlético"
    elif fat < 27:
        category = "médio"
    elif fat < 32:
        category = "acima_media"
    else:
        category = "obeso"

    return BodyComposition(
        body_fat_estimate=round(fat, 1),
        body_fat_category=category,
        fat_distribution="uniforme",
        fat_areas=[],
        muscle_highlights=[],
        muscle_deficits=[],
        proportional_notes="Análise visual não disponível. Estimativa baseada em dados do perfil.",
        body_type="misto",
        overall_assessment="Continue focado no seu objetivo. Com dados visuais limitados, concentre-se em consistência e progressão.",
    )


def analyze_body_vision(
    front_bytes: bytes, back_bytes: bytes, profile: dict
) -> BodyComposition:
    """Analisa composição corporal usando Claude Vision."""
    try:
        front_resized = _resize_image(front_bytes)
        back_resized = _resize_image(back_bytes)

        profile_context = (
            f"Perfil: sexo={profile.get('sex','?')}, "
            f"altura={profile.get('height_cm','?')}cm, "
            f"peso={profile.get('weight_kg','?')}kg, "
            f"objetivo={profile.get('goal','geral')}"
        )

        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/jpeg",
                                "data": _to_base64(front_resized),
                            },
                        },
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/jpeg",
                                "data": _to_base64(back_resized),
                            },
                        },
                        {
                            "type": "text",
                            "text": f"{VISION_PROMPT}\n\n{profile_context}",
                        },
                    ],
                }
            ],
        )

        raw = response.content[0].text.strip()
        raw = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        data = json.loads(raw)

        return BodyComposition(
            body_fat_estimate=float(data.get("body_fat_estimate", 20.0)),
            body_fat_category=str(data.get("body_fat_category", "médio")),
            fat_distribution=str(data.get("fat_distribution", "uniforme")),
            fat_areas=list(data.get("fat_areas", [])),
            muscle_highlights=list(data.get("muscle_highlights", [])),
            muscle_deficits=list(data.get("muscle_deficits", [])),
            proportional_notes=str(data.get("proportional_notes", "")),
            body_type=str(data.get("body_type", "misto")),
            overall_assessment=str(data.get("overall_assessment", "")),
        )

    except (anthropic.BadRequestError, anthropic.AuthenticationError,
            anthropic.PermissionDeniedError, json.JSONDecodeError) as exc:
        logger.warning("[vision_analyzer] Vision unavailable (%s), using fallback", exc)
        return _fallback_composition(profile)
