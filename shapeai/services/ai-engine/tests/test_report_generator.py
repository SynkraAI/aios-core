import json
import pytest
from unittest.mock import MagicMock, patch


def _mock_claude(json_payload: dict):
    content = MagicMock()
    content.text = json.dumps(json_payload)
    response = MagicMock()
    response.content = [content]
    return response


def test_generate_report_valid_structure():
    from app.pipeline.report_generator import generate_report

    payload = {
        "highlights": [
            {"muscle_group": "shoulders", "title": "Ombros fortes", "description": "Bom desenvolvimento.", "score": 80}
        ],
        "development_areas": [
            {"muscle_group": "core", "title": "Core fraco", "description": "Precisa melhorar.", "score": 40}
        ],
    }

    with patch("app.pipeline.report_generator.client") as mock_client:
        mock_client.messages.create.return_value = _mock_claude(payload)
        result = generate_report({"shoulders": 80, "core": 40}, {"sex": "male"})

    assert result["highlights"][0]["muscle_group"] == "shoulders"
    assert result["development_areas"][0]["score"] == 40


def test_generate_report_raises_on_missing_field():
    from app.pipeline.report_generator import generate_report

    bad_payload = {
        "highlights": [{"muscle_group": "shoulders", "title": "Test"}],  # missing description + score
        "development_areas": [],
    }

    with patch("app.pipeline.report_generator.client") as mock_client:
        mock_client.messages.create.return_value = _mock_claude(bad_payload)
        with pytest.raises(ValueError, match="missing required field"):
            generate_report({}, {})


def test_generate_report_raises_on_invalid_json():
    from app.pipeline.report_generator import generate_report

    content = MagicMock()
    content.text = "not valid json {"
    response = MagicMock()
    response.content = [content]

    with patch("app.pipeline.report_generator.client") as mock_client:
        mock_client.messages.create.return_value = response
        with pytest.raises(json.JSONDecodeError):
            generate_report({}, {})
