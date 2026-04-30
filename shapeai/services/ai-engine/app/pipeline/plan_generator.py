import json
import os
from typing import TypedDict

import anthropic

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = (
    "Você é um personal trainer especializado em prescrição de treinos. "
    "Gere um plano de treino de 4 semanas baseado nos scores de composição corporal.\n\n"
    'O JSON de resposta deve ter o campo "weeks": array de WorkoutWeek.\n'
    "Cada WorkoutWeek: { week_number (1-4), sessions: WorkoutSession[] }\n"
    "Cada WorkoutSession: { day (1-7), muscle_groups: string[], exercises: Exercise[] }\n"
    "Cada Exercise: { name: string, sets: number, reps: string, rest_seconds: number, notes?: string }\n\n"
    "Regras: 3-5 sessões/semana. Priorize grupos com scores baixos. Responda SOMENTE com JSON válido."
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


def generate_workout_plan(scores: dict, profile: dict) -> WorkoutPlan:
    """Generate 4-week workout plan via Claude with system-prompt caching."""
    user_prompt = (
        f"Scores do usuário:\n{json.dumps(scores, ensure_ascii=False)}\n\n"
        f"Perfil: {profile.get('sex', '?')}, {profile.get('age', '?')} anos, "
        f"objetivo: {profile.get('goal', 'fitness geral')}\n\n"
        "Gere o plano de 4 semanas priorizando grupos com scores mais baixos."
    )

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        system=[{"type": "text", "text": SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}],
        messages=[{"role": "user", "content": user_prompt}],
    )

    data = json.loads(response.content[0].text)
    return _validate_plan(data)
