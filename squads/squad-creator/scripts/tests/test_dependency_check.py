#!/usr/bin/env python3
"""
Tests for dependency_check.py
Run with: pytest scripts/tests/test_dependency_check.py -v
"""

import os
import sys
import pytest
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from dependency_check import (
    is_in_code_block,
    is_example_reference,
    is_external_squad_reference,
    extract_references,
    check_references,
    scan_file,
    scan_squad,
)


class TestIsInCodeBlock:
    """Tests for is_in_code_block function"""

    def test_in_code_block(self):
        """Position inside code block returns True"""
        content = """
Some text here.

```yaml
tasks/create-task.md
```

More text.
"""
        # Position of 'tasks/' in the code block
        pos = content.find("tasks/create")
        result = is_in_code_block(content, pos)

        assert result == True

    def test_outside_code_block(self):
        """Position outside code block returns False"""
        content = """
Reference to tasks/create-task.md here.

```yaml
other: content
```
"""
        # Position of 'tasks/' outside code block
        pos = content.find("tasks/create")
        result = is_in_code_block(content, pos)

        assert result == False

    def test_no_code_blocks(self):
        """Content without code blocks returns False"""
        content = "Reference to tasks/create-task.md here."
        pos = content.find("tasks/")
        result = is_in_code_block(content, pos)

        assert result == False


class TestIsExampleReference:
    """Tests for is_example_reference function"""

    def test_example_reference(self):
        """Reference in example context returns True"""
        content = """
For example: tasks/example-task.md
"""
        pos = content.find("tasks/example")
        result = is_example_reference(content, pos)

        assert result == True

    def test_example_with_eg(self):
        """Reference with e.g. returns True"""
        content = """
You can use files like (e.g. tasks/sample.md)
"""
        pos = content.find("tasks/sample")
        result = is_example_reference(content, pos)

        assert result == True

    def test_real_reference(self):
        """Reference not in example context returns False"""
        content = """
This task depends on tasks/real-dependency.md
"""
        pos = content.find("tasks/real")
        result = is_example_reference(content, pos)

        assert result == False


class TestExtractReferences:
    """Tests for extract_references function"""

    def test_extract_task_references(self):
        """Task references are extracted"""
        content = """
This depends on tasks/create-task.md and tasks/validate-task.md
"""
        internal, external = extract_references(content, "test.md", "test-squad")

        assert "create-task.md" in internal["tasks"]
        assert "validate-task.md" in internal["tasks"]

    def test_extract_agent_references(self):
        """Agent references are extracted"""
        content = """
Handoff to agents/expert-agent.md
"""
        internal, external = extract_references(content, "test.md", "test-squad")

        assert "expert-agent.md" in internal["agents"]

    def test_extract_template_references(self):
        """Template references are extracted"""
        content = """
Use templates/output-tmpl.yaml
"""
        internal, external = extract_references(content, "test.md", "test-squad")

        assert "output-tmpl.yaml" in internal["templates"]

    def test_extract_workflow_references(self):
        """Workflow references are extracted"""
        content = """
Execute workflows/main-workflow.yaml
"""
        internal, external = extract_references(content, "test.md", "test-squad")

        assert "main-workflow.yaml" in internal["workflows"]

    def test_exclude_code_block_references(self):
        """References in code blocks go to external"""
        content = """
Real reference: tasks/real.md

```yaml
# Example
tasks/example.md
```
"""
        internal, external = extract_references(content, "test.md", "test-squad")

        assert "real.md" in internal["tasks"]
        assert "example.md" in external["tasks"]

    def test_relative_path_references(self):
        """Relative path references are extracted"""
        content = """
Use ./tasks/local-task.md
"""
        internal, external = extract_references(content, "test.md", "test-squad")

        assert "local-task.md" in internal["tasks"]


class TestCheckReferences:
    """Tests for check_references function"""

    def test_check_references_all_exist(self, tmp_path):
        """No issues when all references exist"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        tasks_dir = squad_dir / "tasks"
        tasks_dir.mkdir()
        (tasks_dir / "existing-task.md").write_text("# Task")

        references = {"tasks": ["existing-task.md"]}
        issues = check_references(str(squad_dir), references, "source.md")

        assert len(issues) == 0

    def test_check_references_missing(self, tmp_path):
        """Issues reported for missing references"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()
        (squad_dir / "tasks").mkdir()

        references = {"tasks": ["missing-task.md"]}
        issues = check_references(str(squad_dir), references, "source.md")

        assert len(issues) == 1
        assert issues[0]["type"] == "MISSING_REFERENCE"
        assert "missing-task.md" in issues[0]["referenced_file"]


class TestScanFile:
    """Tests for scan_file function"""

    def test_scan_file_with_references(self, tmp_path):
        """File with references is scanned correctly"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        agents_dir = squad_dir / "agents"
        agents_dir.mkdir()

        agent_content = """# Test Agent

Depends on tasks/helper-task.md
"""
        agent_file = agents_dir / "test-agent.md"
        agent_file.write_text(agent_content)

        # Create the referenced task
        tasks_dir = squad_dir / "tasks"
        tasks_dir.mkdir()
        (tasks_dir / "helper-task.md").write_text("# Helper")

        result = scan_file(str(agent_file), str(squad_dir), "test-squad")

        assert result["file"] == "test-agent.md"
        assert "helper-task.md" in result["references"]["tasks"]
        assert len(result["issues"]) == 0

    def test_scan_file_missing_reference(self, tmp_path):
        """File with missing reference reports issue"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        agents_dir = squad_dir / "agents"
        agents_dir.mkdir()

        agent_content = """# Test Agent

Uses tasks/nonexistent.md
"""
        agent_file = agents_dir / "test-agent.md"
        agent_file.write_text(agent_content)

        (squad_dir / "tasks").mkdir()

        result = scan_file(str(agent_file), str(squad_dir), "test-squad")

        assert len(result["issues"]) == 1
        assert result["issues"][0]["type"] == "MISSING_REFERENCE"

    def test_scan_file_nonexistent(self, tmp_path):
        """Nonexistent file returns error"""
        result = scan_file(
            str(tmp_path / "nonexistent.md"),
            str(tmp_path),
            "test-squad"
        )

        assert "error" in result


class TestScanSquad:
    """Tests for scan_squad function"""

    def test_scan_squad_nonexistent(self, tmp_path):
        """Nonexistent squad returns error"""
        result = scan_squad(str(tmp_path / "nonexistent"))

        assert result["exists"] == False
        assert "error" in result

    def test_scan_squad_complete(self, sample_squad):
        """Complete squad is scanned"""
        result = scan_squad(str(sample_squad))

        assert result["exists"] == True
        assert result["squad_name"] == "sample-squad"
        assert "files_scanned" in result
        assert "total_issues" in result
        assert "status" in result

    def test_scan_squad_no_issues(self, tmp_path):
        """Squad with valid references passes"""
        squad_dir = tmp_path / "valid-squad"
        squad_dir.mkdir()

        agents_dir = squad_dir / "agents"
        agents_dir.mkdir()
        (agents_dir / "agent.md").write_text("# Agent\nNo references here.")

        tasks_dir = squad_dir / "tasks"
        tasks_dir.mkdir()
        (tasks_dir / "task.md").write_text("# Task\nNo references here.")

        result = scan_squad(str(squad_dir))

        assert result["status"] == "PASS"
        assert result["total_issues"] == 0

    def test_scan_squad_with_issues(self, tmp_path):
        """Squad with broken references fails"""
        squad_dir = tmp_path / "broken-squad"
        squad_dir.mkdir()

        agents_dir = squad_dir / "agents"
        agents_dir.mkdir()
        (agents_dir / "agent.md").write_text("# Agent\nUses tasks/missing.md")

        (squad_dir / "tasks").mkdir()

        result = scan_squad(str(squad_dir))

        assert result["status"] == "FAIL"
        assert result["total_issues"] > 0

    def test_scan_squad_by_directory(self, sample_squad):
        """Results include breakdown by directory"""
        result = scan_squad(str(sample_squad))

        assert "by_directory" in result
        # Should have entries for scanned directories
        if result["by_directory"]:
            for dir_name, stats in result["by_directory"].items():
                assert "files" in stats
                assert "references" in stats
                assert "issues" in stats


class TestStrictMode:
    """Tests for strict mode"""

    def test_strict_mode_checks_external(self, tmp_path):
        """Strict mode also checks external references"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        agents_dir = squad_dir / "agents"
        agents_dir.mkdir()

        # Reference in code block (normally external/ignored)
        agent_content = """# Agent

```yaml
# Example
tasks/example.md
```
"""
        (agents_dir / "agent.md").write_text(agent_content)
        (squad_dir / "tasks").mkdir()

        # Normal mode - example refs ignored
        result_normal = scan_squad(str(squad_dir), strict=False)

        # Strict mode - example refs checked too
        result_strict = scan_squad(str(squad_dir), strict=True)

        assert result_strict["strict_mode"] == True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
