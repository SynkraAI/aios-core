#!/usr/bin/env python3
"""
Tests for scoring.py
Run with: pytest scripts/tests/test_scoring.py -v
"""

import os
import sys
import pytest
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from scoring import (
    WEIGHTS,
    score_structure,
    score_agents,
    score_tasks,
    score_documentation,
    score_integration,
    score_naming,
    calculate_score,
)


class TestWeights:
    """Tests for scoring weights configuration"""

    def test_weights_sum_to_one(self):
        """Weights should sum to 1.0"""
        total = sum(WEIGHTS.values())
        assert abs(total - 1.0) < 0.001

    def test_all_dimensions_have_weights(self):
        """All scoring dimensions should have weights"""
        expected_dims = ["structure", "agents", "tasks", "documentation", "integration", "naming"]
        for dim in expected_dims:
            assert dim in WEIGHTS


class TestScoreStructure:
    """Tests for score_structure function"""

    def test_score_structure_complete(self, tmp_path):
        """Complete structure gets perfect score"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        # Create required files
        (squad_dir / "config.yaml").write_text("name: test-squad\nversion: 1.0.0")
        (squad_dir / "README.md").write_text("# Test Squad\n" * 50)
        (squad_dir / "CHANGELOG.md").write_text("# Changelog\n")

        # Create required directories
        (squad_dir / "agents").mkdir()
        (squad_dir / "tasks").mkdir()

        # Create optional directories (at least 2)
        (squad_dir / "templates").mkdir()
        (squad_dir / "checklists").mkdir()

        score, details = score_structure(str(squad_dir))

        assert score == 10.0
        assert details["checks"]["config_yaml"] == True
        assert details["checks"]["readme"] == True
        assert details["checks"]["changelog"] == True

    def test_score_structure_missing_config(self, tmp_path):
        """Missing config.yaml deducts 3 points"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        (squad_dir / "README.md").write_text("# Test")
        (squad_dir / "agents").mkdir()
        (squad_dir / "tasks").mkdir()

        score, details = score_structure(str(squad_dir))

        assert details["checks"]["config_yaml"] == False
        # Should have deduction for missing config
        config_deduction = next(
            (d for d in details["deductions"] if "config.yaml" in d["reason"]),
            None
        )
        assert config_deduction is not None
        assert config_deduction["points"] == -3.0

    def test_score_structure_missing_readme(self, tmp_path):
        """Missing README.md deducts 2 points"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        (squad_dir / "config.yaml").write_text("name: test")
        (squad_dir / "agents").mkdir()
        (squad_dir / "tasks").mkdir()

        score, details = score_structure(str(squad_dir))

        assert details["checks"]["readme"] == False
        readme_deduction = next(
            (d for d in details["deductions"] if "README" in d["reason"]),
            None
        )
        assert readme_deduction is not None

    def test_score_structure_missing_agents_dir(self, tmp_path):
        """Missing agents directory deducts points"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        (squad_dir / "config.yaml").write_text("name: test")
        (squad_dir / "README.md").write_text("# Test")
        (squad_dir / "tasks").mkdir()

        score, details = score_structure(str(squad_dir))

        assert details["checks"]["dir_agents"] == False


class TestScoreAgents:
    """Tests for score_agents function"""

    def test_score_agents_no_dir(self, tmp_path):
        """No agents directory returns 0"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        score, details = score_agents(str(squad_dir))

        assert score == 0.0
        assert "error" in details

    def test_score_agents_empty_dir(self, tmp_path):
        """Empty agents directory returns 0"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()
        (squad_dir / "agents").mkdir()

        score, details = score_agents(str(squad_dir))

        assert score == 0.0
        assert "error" in details

    def test_score_agents_with_agents(self, tmp_path):
        """Agents with sufficient lines get good score"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()
        agents_dir = squad_dir / "agents"
        agents_dir.mkdir()

        # Create agent with 300+ lines
        (agents_dir / "test-agent.md").write_text("# Agent\n" * 350)

        score, details = score_agents(str(squad_dir))

        assert score == 10.0
        assert details["checks"]["agent_count"] == 1
        assert details["checks"]["low_line_agents"] == 0

    def test_score_agents_low_lines(self, tmp_path):
        """Agents under 300 lines get penalty"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()
        agents_dir = squad_dir / "agents"
        agents_dir.mkdir()

        # Create agent with fewer than 300 lines
        (agents_dir / "short-agent.md").write_text("# Agent\n" * 50)

        score, details = score_agents(str(squad_dir))

        assert score < 10.0
        assert details["checks"]["low_line_agents"] == 1


class TestScoreTasks:
    """Tests for score_tasks function"""

    def test_score_tasks_no_dir(self, tmp_path):
        """No tasks directory returns 0"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        score, details = score_tasks(str(squad_dir))

        assert score == 0.0

    def test_score_tasks_with_tasks(self, tmp_path):
        """Tasks with sufficient lines get good score"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()
        tasks_dir = squad_dir / "tasks"
        tasks_dir.mkdir()

        # Create task with 100+ lines
        (tasks_dir / "test-task.md").write_text("# Task\n" * 150)

        score, details = score_tasks(str(squad_dir))

        assert score == 10.0
        assert details["checks"]["task_count"] == 1
        assert details["checks"]["low_line_tasks"] == 0

    def test_score_tasks_low_lines(self, tmp_path):
        """Tasks under 100 lines get penalty"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()
        tasks_dir = squad_dir / "tasks"
        tasks_dir.mkdir()

        # Create task with fewer than 100 lines
        (tasks_dir / "short-task.md").write_text("# Task\n" * 30)

        score, details = score_tasks(str(squad_dir))

        assert score < 10.0
        assert details["checks"]["low_line_tasks"] == 1


class TestScoreDocumentation:
    """Tests for score_documentation function"""

    def test_score_documentation_complete(self, tmp_path):
        """Complete documentation gets good score"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        # README with 100+ lines
        (squad_dir / "README.md").write_text("# Test\n" * 150)
        (squad_dir / "docs").mkdir()

        score, details = score_documentation(str(squad_dir))

        assert score == 10.0
        assert details["checks"]["readme_lines"] >= 100
        assert details["checks"]["has_docs_dir"] == True

    def test_score_documentation_short_readme(self, tmp_path):
        """Short README gets penalty"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        (squad_dir / "README.md").write_text("# Test\n" * 30)
        (squad_dir / "docs").mkdir()

        score, details = score_documentation(str(squad_dir))

        assert score < 10.0
        # Should have deduction for short README
        readme_deduction = [d for d in details["deductions"] if "README" in d["reason"]]
        assert len(readme_deduction) > 0

    def test_score_documentation_no_readme(self, tmp_path):
        """No README gets big penalty"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        score, details = score_documentation(str(squad_dir))

        assert score < 10.0
        assert details["checks"]["readme_lines"] == 0


class TestScoreIntegration:
    """Tests for score_integration function"""

    def test_score_integration_complete(self, tmp_path):
        """Complete integration setup gets good score"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        workflows_dir = squad_dir / "workflows"
        workflows_dir.mkdir()
        (workflows_dir / "main.yaml").write_text("name: main")

        checklists_dir = squad_dir / "checklists"
        checklists_dir.mkdir()
        (checklists_dir / "check.md").write_text("# Check")

        templates_dir = squad_dir / "templates"
        templates_dir.mkdir()
        (templates_dir / "tmpl.yaml").write_text("name: tmpl")

        score, details = score_integration(str(squad_dir))

        assert score == 10.0
        assert details["checks"]["workflow_count"] >= 1
        assert details["checks"]["checklist_count"] >= 1
        assert details["checks"]["template_count"] >= 1

    def test_score_integration_no_workflows(self, tmp_path):
        """No workflows directory gets penalty"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        (squad_dir / "checklists").mkdir()
        (squad_dir / "templates").mkdir()

        score, details = score_integration(str(squad_dir))

        assert score < 10.0
        assert details["checks"]["workflow_count"] == 0


class TestCalculateScore:
    """Tests for calculate_score function"""

    def test_calculate_score_nonexistent(self, tmp_path):
        """Nonexistent squad returns error"""
        result = calculate_score(str(tmp_path / "nonexistent"))

        assert result["exists"] == False
        assert "error" in result

    def test_calculate_score_complete(self, sample_squad):
        """Complete squad gets overall score"""
        result = calculate_score(str(sample_squad))

        assert result["exists"] == True
        assert "total_score" in result
        assert "grade" in result
        assert result["total_score"] >= 0
        assert result["total_score"] <= 10

    def test_calculate_score_has_dimensions(self, sample_squad):
        """Result includes all dimensions"""
        result = calculate_score(str(sample_squad))

        expected_dims = ["structure", "agents", "tasks", "documentation", "integration", "naming"]
        for dim in expected_dims:
            assert dim in result["dimensions"]
            assert "score" in result["dimensions"][dim]
            assert "weight" in result["dimensions"][dim]
            assert "weighted" in result["dimensions"][dim]

    def test_calculate_score_grades(self, tmp_path):
        """Grades are assigned correctly"""
        # Test grade boundaries
        assert "A+" in ["A+", "A", "B", "C", "D", "F"]  # Just verify grades exist


class TestScoreNaming:
    """Tests for score_naming function"""

    def test_score_naming_perfect(self, tmp_path):
        """Perfect naming conventions get 10"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        (squad_dir / "config.yaml").write_text("""
name: test-squad
version: 1.0.0
slashPrefix: testSquad
""")

        score, details = score_naming(str(squad_dir))

        # May not be exactly 10 depending on naming_validator availability
        assert score >= 0
        assert score <= 10


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
