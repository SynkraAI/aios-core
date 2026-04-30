import json
import os
from typing import TypedDict

import anthropic

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = (
    "Você é um especialista em avaliação física e composição corporal. "
    "Analise os scores de composição corporal e gere um relatório estruturado em JSON com os campos:\n"
    "- highlights: array de ReportSection com os 3 pontos fortes (score > 65)\n"
    "- development_areas: array de ReportSection com os 3 grupos mais deficitários (score < 55)\n\n"
    "Cada ReportSection tem: muscle_group (string em inglês), title (frase motivacional em PT-BR), "
    "description (2-3 frases técnicas em PT-BR), score (inteiro 0-100).\n"
    "Responda SOMENTE com JSON válido, sem markdown."
)


class ReportSection(TypedDict):
    muscle_group: str
    title: str
    description: str
    score: int


class Report(TypedDict):
    highlights: list
    development_areas: list


def _validate_section(section: dict) -> ReportSection:
    for field in ("muscle_group", "title", "description", "score"):
        if field not in section:
            raise ValueError(f"ReportSection missing required field: {field}")
    return ReportSection(
        muscle_group=str(section["muscle_group"]),
        title=str(section["title"]),
        description=str(section["description"]),
        score=int(section["score"]),
    )


def generate_report(scores: dict, profile: dict) -> Report:
    """Generate body analysis report via Claude with system-prompt caching."""
    user_prompt = (
        f"Scores de composição corporal:\n{json.dumps(scores, ensure_ascii=False)}\n\n"
        f"Perfil: {profile.get('sex', '?')}, {profile.get('age', '?')} anos, "
        f"objetivo: {profile.get('goal', 'geral')}, "
        f"{profile.get('height_cm', '?')}cm, {profile.get('weight_kg', '?')}kg\n\n"
        "Gere o relatório JSON com highlights e development_areas."
    )

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        system=[{"type": "text", "text": SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}],
        messages=[{"role": "user", "content": user_prompt}],
    )

    data = json.loads(response.content[0].text)
    return Report(
        highlights=[_validate_section(s) for s in data.get("highlights", [])],
        development_areas=[_validate_section(s) for s in data.get("development_areas", [])],
    )
