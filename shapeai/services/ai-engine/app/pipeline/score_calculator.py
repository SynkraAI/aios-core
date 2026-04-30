from dataclasses import dataclass, asdict


@dataclass
class BodyScores:
    shoulders: int
    chest: int
    back: int
    arms: int
    core: int
    legs: int
    posture_score: int
    symmetry_score: int

    def to_dict(self) -> dict:
        return asdict(self)


def _clamp(value: float) -> int:
    return max(0, min(100, int(value)))


def _x(lm: dict, key: str) -> float:
    return lm.get(key, {}).get("x", 0.5)


def _y(lm: dict, key: str) -> float:
    return lm.get(key, {}).get("y", 0.5)


def calculate_scores(landmarks_front: dict, landmarks_back: dict) -> BodyScores:
    """Derive 8 BodyScores from MediaPipe landmark dicts for front and back photos."""
    # Shoulders: shoulder-width / hip-width ratio vs golden target ~1.3
    ls_x = _x(landmarks_front, "left_shoulder")
    rs_x = _x(landmarks_front, "right_shoulder")
    lh_x = _x(landmarks_front, "left_hip")
    rh_x = _x(landmarks_front, "right_hip")
    hip_w = max(abs(rh_x - lh_x), 0.01)
    shoulder_w = abs(rs_x - ls_x)
    shoulders = _clamp((shoulder_w / hip_w / 1.3) * 75 + 10)

    # Chest: estimated from shoulder development (correlated metric)
    chest = _clamp(shoulders * 0.85 + 10)

    # Back: back-view shoulder width
    bls_x = _x(landmarks_back, "left_shoulder")
    brs_x = _x(landmarks_back, "right_shoulder")
    back_w = abs(brs_x - bls_x)
    back = _clamp((back_w / 0.35) * 60 + 20)

    # Arms: wrist-elbow horizontal spread (proxy for arm size)
    lw_x = _x(landmarks_front, "left_wrist")
    le_x = _x(landmarks_front, "left_elbow")
    arms = _clamp(abs(lw_x - le_x) * 300 + 40)

    # Core: horizontal deviation of hip-center from shoulder-center
    shoulder_cx = (ls_x + rs_x) / 2
    hip_cx = (lh_x + rh_x) / 2
    core = _clamp((1 - abs(shoulder_cx - hip_cx) * 5) * 70 + 15)

    # Legs: knee width vs hip width
    lk_x = _x(landmarks_front, "left_knee")
    rk_x = _x(landmarks_front, "right_knee")
    knee_w = abs(rk_x - lk_x)
    legs = _clamp((knee_w / hip_w) * 80 + 20)

    # Posture: vertical alignment — nose → shoulder center → hip center
    nose_x = _x(landmarks_front, "nose")
    deviation = abs(nose_x - shoulder_cx) + abs(shoulder_cx - hip_cx)
    posture = _clamp((1 - deviation * 4) * 100)

    # Symmetry: average L/R y-coordinate difference for 4 joint pairs
    pairs = [
        ("left_shoulder", "right_shoulder"),
        ("left_hip", "right_hip"),
        ("left_knee", "right_knee"),
        ("left_wrist", "right_wrist"),
    ]
    diffs = [abs(_y(landmarks_front, l) - _y(landmarks_front, r)) for l, r in pairs]
    avg_diff = sum(diffs) / len(diffs)
    symmetry = _clamp((1 - avg_diff * 15) * 100)

    return BodyScores(
        shoulders=shoulders,
        chest=chest,
        back=back,
        arms=arms,
        core=core,
        legs=legs,
        posture_score=posture,
        symmetry_score=symmetry,
    )
