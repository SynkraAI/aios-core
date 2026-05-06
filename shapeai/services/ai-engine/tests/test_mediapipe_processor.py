import io
import pytest
from unittest.mock import MagicMock, patch

import mediapipe as mp
import numpy as np
from PIL import Image


def _make_fake_png() -> bytes:
    img = Image.fromarray(np.zeros((100, 100, 3), dtype=np.uint8))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def _mock_pose_context(results):
    """Return a context manager that yields a pose instance returning `results`."""
    pose_instance = MagicMock()
    pose_instance.process.return_value = results
    pose_instance.__enter__ = MagicMock(return_value=pose_instance)
    pose_instance.__exit__ = MagicMock(return_value=False)
    return pose_instance


def test_raises_when_no_pose_detected():
    from app.pipeline.mediapipe_processor import process_image

    results = MagicMock()
    results.pose_landmarks = None

    with patch("app.pipeline.mediapipe_processor.mp_pose.Pose", return_value=_mock_pose_context(results)):
        with pytest.raises(ValueError, match="No pose detected"):
            process_image(_make_fake_png())


def test_returns_landmark_dict_with_all_landmarks():
    from app.pipeline.mediapipe_processor import process_image

    n_landmarks = len(mp.solutions.pose.PoseLandmark)
    mock_lm = MagicMock(x=0.5, y=0.5, z=0.0, visibility=0.9)

    results = MagicMock()
    results.pose_landmarks = MagicMock()
    results.pose_landmarks.landmark = [mock_lm] * n_landmarks

    with patch("app.pipeline.mediapipe_processor.mp_pose.Pose", return_value=_mock_pose_context(results)):
        output = process_image(_make_fake_png())

    assert isinstance(output, dict)
    assert len(output) == n_landmarks
    first_key = list(output.keys())[0]
    assert set(output[first_key].keys()) == {"x", "y", "z", "visibility"}
