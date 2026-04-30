import io
import mediapipe as mp
import numpy as np
from PIL import Image

mp_pose = mp.solutions.pose


def process_image(image_bytes: bytes) -> dict:
    """Process image bytes with MediaPipe Pose; return normalized landmarks dict."""
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image_np = np.array(image)

    with mp_pose.Pose(
        static_image_mode=True,
        model_complexity=2,
        min_detection_confidence=0.5,
    ) as pose:
        results = pose.process(image_np)

    if not results.pose_landmarks:
        raise ValueError("No pose detected in image")

    landmarks: dict = {}
    for idx, lm in enumerate(results.pose_landmarks.landmark):
        name = mp_pose.PoseLandmark(idx).name.lower()
        landmarks[name] = {
            "x": lm.x,
            "y": lm.y,
            "z": lm.z,
            "visibility": lm.visibility,
        }

    return landmarks
