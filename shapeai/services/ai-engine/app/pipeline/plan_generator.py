import json
import logging
import os
from typing import TypedDict

import anthropic

logger = logging.getLogger(__name__)
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = (
    "Você é um personal trainer especializado em prescrição de treinos. "
    "Gere um plano de treino de 4 semanas baseado nos scores de composição corporal.\n\n"
    'O JSON de resposta deve ter o campo "weeks": array de WorkoutWeek.\n'
    "Cada WorkoutWeek: { week_number (1-4), sessions: WorkoutSession[] }\n"
    "Cada WorkoutSession: { day (1-7), muscle_groups: string[], exercises: Exercise[] }\n"
    "Cada Exercise: { name: string, sets: number, reps: string, rest_seconds: number, notes?: string }\n\n"
    "Regras: exatamente 3 sessões/semana (dias 1, 3, 5). Máximo 4 exercícios por sessão. "
    "Priorize grupos com scores baixos. Responda SOMENTE com JSON válido, sem markdown."
)


class WorkoutPlan(TypedDict):
    weeks: list


def _validate_plan(data: dict) -> WorkoutPlan:
    if "weeks" not in data or not isinstance(data["weeks"], list) or not data["weeks"]:
        raise ValueError("WorkoutPlan missing or empty weeks array")
    for week in data["weeks"]:
        if "week_number" not in week or "sessions" not in week:
            raise ValueError("WorkoutWeek missing week_number or sessions")
    return WorkoutPlan(weeks=data["weeks"])


_EXERCISES_BY_GROUP = {
    "shoulders": [
        {"name": "Desenvolvimento com halteres", "sets": 4, "reps": "10-12", "rest_seconds": 90},
        {"name": "Elevação lateral", "sets": 3, "reps": "12-15", "rest_seconds": 60},
    ],
    "chest": [
        {"name": "Supino reto", "sets": 4, "reps": "8-10", "rest_seconds": 120},
        {"name": "Crucifixo", "sets": 3, "reps": "12-15", "rest_seconds": 60},
    ],
    "back": [
        {"name": "Remada curvada", "sets": 4, "reps": "8-10", "rest_seconds": 120},
        {"name": "Puxada na frente", "sets": 3, "reps": "10-12", "rest_seconds": 90},
    ],
    "arms": [
        {"name": "Rosca direta", "sets": 3, "reps": "12-15", "rest_seconds": 60},
        {"name": "Tríceps testa", "sets": 3, "reps": "12-15", "rest_seconds": 60},
    ],
    "core": [
        {"name": "Prancha abdominal", "sets": 3, "reps": "40s", "rest_seconds": 45},
        {"name": "Abdominal infra", "sets": 3, "reps": "15", "rest_seconds": 45},
    ],
    "legs": [
        {"name": "Agachamento livre", "sets": 4, "reps": "10-12", "rest_seconds": 120},
        {"name": "Leg press", "sets": 3, "reps": "12-15", "rest_seconds": 90},
    ],
}


def _fallback_plan(scores: dict) -> WorkoutPlan:
    """Rule-based 4-week plan prioritizing groups with lowest scores."""
    priority = sorted(scores.items(), key=lambda x: x[1])
    top3 = [k for k, _ in priority[:3] if k in _EXERCISES_BY_GROUP]
    rest3 = [k for k, _ in priority[3:] if k in _EXERCISES_BY_GROUP]

    def session(day: int, groups: list) -> dict:
        exercises = []
        for g in groups:
            exercises.extend(_EXERCISES_BY_GROUP.get(g, []))
        return {"day": day, "muscle_groups": groups, "exercises": exercises}

    base_week = [
        session(1, top3[:2] if len(top3) >= 2 else top3),
        session(3, top3[2:] + rest3[:1] if top3[2:] else rest3[:2]),
        session(5, rest3[1:3] if len(rest3) >= 2 else rest3),
    ]

    weeks = [{"week_number": w, "sessions": base_week} for w in range(1, 5)]
    return WorkoutPlan(weeks=weeks)


def generate_workout_plan(scores: dict, body_composition: dict, profile: dict) -> WorkoutPlan:
    """Generate 4-week workout plan via Claude with system-prompt caching."""
    fat_pct = body_composition.get("body_fat_estimate", 0)
    fat_areas = ", ".join(body_composition.get("fat_areas", [])) or "não identificadas"
    weaknesses = body_composition.get("weaknesses_summary", "")

    # Build muscle score summary for the plan (groups sorted by score ascending = priority)
    muscle_scores = body_composition.get("muscle_scores", {})
    priority_groups = sorted(
        [(k, v["score"]) for k, v in muscle_scores.items() if isinstance(v, dict) and "score" in v],
        key=lambda x: x[1]
    )
    priority_str = ", ".join(f"{k}={s}" for k, s in priority_groups) or "não disponível"

    user_prompt = (
        f"Scores musculares (menor = mais prioritário):\n{priority_str}\n\n"
        f"Gordura corporal: {fat_pct}%, gordura localizada: {fat_areas}\n"
        f"Pontos a desenvolver: {weaknesses}\n\n"
        f"Perfil: {profile.get('sex', '?')}, objetivo: {profile.get('goal', 'fitness geral')}, "
        f"altura: {profile.get('height_cm','?')}cm, peso: {profile.get('weight_kg','?')}kg\n\n"
        "Gere o plano de 4 semanas priorizando: (1) grupos musculares com scores mais baixos, "
        "(2) redução de gordura localizada se aplicável, (3) equilíbrio proporcional do físico."
    )

    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=8192,
            system=[{"type": "text", "text": SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}],
            messages=[{"role": "user", "content": user_prompt}],
        )
        if response.stop_reason == "max_tokens":
            logger.warning("[plan_generator] Response truncated (max_tokens), using fallback")
            return _fallback_plan(scores)
        raw = response.content[0].text.strip()
        raw = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        data = json.loads(raw)
        return _validate_plan(data)
    except (anthropic.BadRequestError, anthropic.AuthenticationError, anthropic.PermissionDeniedError) as exc:
        logger.warning("[plan_generator] Claude unavailable (%s), using rule-based fallback", exc)
        return _fallback_plan(scores)
