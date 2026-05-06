import io
import logging
import os
import urllib.request

import mediapipe as mp
import numpy as np
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision
from PIL import Image, ImageEnhance, ImageOps

logger = logging.getLogger(__name__)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "pose_landmarker.task")
MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/pose_landmarker/"
    "pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task"
)

LANDMARK_NAMES = [
    "nose", "left_eye_inner", "left_eye", "left_eye_outer",
    "right_eye_inner", "right_eye", "right_eye_outer",
    "left_ear", "right_ear", "mouth_left", "mouth_right",
    "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
    "left_wrist", "right_wrist", "left_pinky", "right_pinky",
    "left_index", "right_index", "left_thumb", "right_thumb",
    "left_hip", "right_hip", "left_knee", "right_knee",
    "left_ankle", "right_ankle", "left_heel", "right_heel",
    "left_foot_index", "right_foot_index",
]

# Sequência de preprocessamentos tentados em ordem crescente de agressividade
# Cada item é (label, confidence, transform_fn)
_ATTEMPTS = [
    ("original",           0.3, lambda img: img),
    ("exif+resize",        0.3, lambda img: _resize(img, 1024)),
    ("contrast+1.3",       0.3, lambda img: _enhance(img, contrast=1.3, sharp=1.2)),
    ("contrast+1.6",       0.2, lambda img: _enhance(img, contrast=1.6, sharp=1.4)),
    ("resize+contrast",    0.2, lambda img: _enhance(_resize(img, 800), contrast=1.5, sharp=1.3)),
    ("minima_confidence",  0.1, lambda img: _enhance(_resize(img, 640), contrast=1.8, sharp=1.5)),
]


def _ensure_model() -> None:
    if not os.path.exists(MODEL_PATH):
        print("[mediapipe] Baixando modelo pose_landmarker (~29MB)...")
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
        print("[mediapipe] Modelo baixado")


def _resize(img: Image.Image, max_px: int) -> Image.Image:
    w, h = img.size
    if max(w, h) <= max_px:
        return img
    ratio = max_px / max(w, h)
    return img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)


def _enhance(img: Image.Image, contrast: float = 1.0, sharp: float = 1.0) -> Image.Image:
    if contrast != 1.0:
        img = ImageEnhance.Contrast(img).enhance(contrast)
    if sharp != 1.0:
        img = ImageEnhance.Sharpness(img).enhance(sharp)
    return img


def _detect(image_np: np.ndarray, confidence: float):
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_np)
    base_options = mp_python.BaseOptions(model_asset_path=MODEL_PATH)
    options = vision.PoseLandmarkerOptions(
        base_options=base_options,
        running_mode=vision.RunningMode.IMAGE,
        min_pose_detection_confidence=confidence,
        min_pose_presence_confidence=confidence,
        min_tracking_confidence=confidence,
    )
    with vision.PoseLandmarker.create_from_options(options) as detector:
        return detector.detect(mp_image)


def process_image(image_bytes: bytes) -> dict:
    """Detecta pose com múltiplos preprocessamentos progressivos."""
    _ensure_model()

    # Abre e corrige rotação EXIF (fotos de celular frequentemente têm isso)
    base = ImageOps.exif_transpose(Image.open(io.BytesIO(image_bytes))).convert("RGB")

    for label, confidence, transform in _ATTEMPTS:
        try:
            img = transform(base)
            result = _detect(np.array(img), confidence)
            if result.pose_landmarks:
                logger.info("[mediapipe] Pose detected on attempt '%s'", label)
                landmarks: dict = {}
                for idx, lm in enumerate(result.pose_landmarks[0]):
                    name = LANDMARK_NAMES[idx] if idx < len(LANDMARK_NAMES) else f"landmark_{idx}"
                    landmarks[name] = {
                        "x": lm.x,
                        "y": lm.y,
                        "z": lm.z,
                        "visibility": lm.visibility,
                    }
                return landmarks
        except Exception as exc:
            logger.warning("[mediapipe] Attempt '%s' error: %s", label, exc)

    raise ValueError("No pose detected in image")
