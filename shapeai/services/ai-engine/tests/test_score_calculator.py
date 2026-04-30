import pytest
from app.pipeline.score_calculator import BodyScores, calculate_scores


def _lm(x=0.5, y=0.5):
    return {"x": x, "y": y, "z": 0.0, "visibility": 0.9}


@pytest.fixture
def balanced_front():
    return {
        "nose": _lm(0.50, 0.10),
        "left_shoulder": _lm(0.35, 0.30),
        "right_shoulder": _lm(0.65, 0.30),
        "left_hip": _lm(0.38, 0.60),
        "right_hip": _lm(0.62, 0.60),
        "left_knee": _lm(0.39, 0.80),
        "right_knee": _lm(0.61, 0.80),
        "left_wrist": _lm(0.25, 0.55),
        "left_elbow": _lm(0.30, 0.45),
    }


@pytest.fixture
def balanced_back():
    return {
        "left_shoulder": _lm(0.35, 0.30),
        "right_shoulder": _lm(0.65, 0.30),
    }


def test_returns_body_scores(balanced_front, balanced_back):
    result = calculate_scores(balanced_front, balanced_back)
    assert isinstance(result, BodyScores)


def test_all_scores_in_range(balanced_front, balanced_back):
    d = calculate_scores(balanced_front, balanced_back).to_dict()
    for key, val in d.items():
        assert 0 <= val <= 100, f"{key}={val} out of [0,100]"


def test_to_dict_has_eight_keys(balanced_front, balanced_back):
    d = calculate_scores(balanced_front, balanced_back).to_dict()
    expected = {"shoulders", "chest", "back", "arms", "core", "legs", "posture_score", "symmetry_score"}
    assert set(d.keys()) == expected


def test_symmetric_pose_high_symmetry(balanced_front, balanced_back):
    # Equal L/R y-coords → symmetry should be high
    scores = calculate_scores(balanced_front, balanced_back)
    assert scores.symmetry_score >= 50


def test_wide_shoulders_high_score(balanced_back):
    # Very wide shoulders in front view
    front_wide = {
        "nose": _lm(0.50, 0.10),
        "left_shoulder": _lm(0.20, 0.30),
        "right_shoulder": _lm(0.80, 0.30),
        "left_hip": _lm(0.40, 0.60),
        "right_hip": _lm(0.60, 0.60),
        "left_knee": _lm(0.40, 0.80),
        "right_knee": _lm(0.60, 0.80),
        "left_wrist": _lm(0.25, 0.55),
        "left_elbow": _lm(0.30, 0.45),
    }
    scores = calculate_scores(front_wide, balanced_back)
    assert scores.shoulders > 50
