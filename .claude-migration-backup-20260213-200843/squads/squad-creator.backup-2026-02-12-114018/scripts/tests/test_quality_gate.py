#!/usr/bin/env python3
"""
Tests for quality_gate.py
Run with: pytest scripts/tests/ -v
"""

import os
import sys
import json
import tempfile
import pytest
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from quality_gate import (
    count_lines,
    count_yaml_items,
    check_agent_quality,
    check_task_quality,
    check_squad_quality,
    scan_squad,
    THRESHOLDS
)


class TestCountLines:
    """Tests for count_lines function"""

    def test_count_lines_simple_file(self, tmp_path):
        """Test counting lines in a simple file"""
        test_file = tmp_path / "test.txt"
        test_file.write_text("line1\nline2\nline3\n")
        assert count_lines(str(test_file)) == 4

    def test_count_lines_empty_file(self, tmp_path):
        """Test counting lines in empty file"""
        test_file = tmp_path / "empty.txt"
        test_file.write_text("")
        assert count_lines(str(test_file)) == 0

    def test_count_lines_nonexistent_file(self):
        """Test counting lines in nonexistent file"""
        assert count_lines("/nonexistent/file.txt") == 0

    def test_count_lines_large_file(self, tmp_path):
        """Test counting lines in larger file"""
        test_file = tmp_path / "large.txt"
        test_file.write_text("\n".join([f"line {i}" for i in range(500)]))
        assert count_lines(str(test_file)) == 500


class TestCheckAgentQuality:
    """Tests for check_agent_quality function"""

    def test_check_agent_quality_minimal(self, tmp_path):
        """Test agent quality check with minimal file"""
        agent_file = tmp_path / "minimal.md"
        agent_file.write_text("# Agent\n\nMinimal content\n")

        result = check_agent_quality(str(agent_file))

        assert result["file"] == "minimal.md"
        assert result["type"] == "agent"
        assert result["metrics"]["lines"] < THRESHOLDS["agent"]["min_lines"]
        assert len(result["issues"]) > 0  # Should have line count warning

    def test_check_agent_quality_with_yaml(self, tmp_path):
        """Test agent quality check with YAML content"""
        agent_content = '''# Test Agent

```yaml
agent:
  name: Test Agent
  id: test-agent

voice_dna:
  vocabulary:
    always_use:
      - term1
      - term2
      - term3
      - term4
      - term5
    never_use:
      - bad1
      - bad2
      - bad3

output_examples:
  - input: test1
    output: result1
  - input: test2
    output: result2
  - input: test3
    output: result3

objection_algorithms:
  - objection: obj1
    response: resp1
  - objection: obj2
    response: resp2
  - objection: obj3
    response: resp3
```
'''
        # Add enough lines to pass threshold
        agent_content += "\n" * 300

        agent_file = tmp_path / "test-agent.md"
        agent_file.write_text(agent_content)

        result = check_agent_quality(str(agent_file))

        assert result["metrics"].get("vocabulary_always", 0) == 5
        assert result["metrics"].get("vocabulary_never", 0) == 3
        assert result["metrics"].get("output_examples", 0) == 3
        assert result["metrics"].get("objection_algorithms", 0) == 3


class TestCheckTaskQuality:
    """Tests for check_task_quality function"""

    def test_check_task_quality_minimal(self, tmp_path):
        """Test task quality check with minimal file"""
        task_file = tmp_path / "minimal-task.md"
        task_file.write_text("# Task\n\nDo something\n")

        result = check_task_quality(str(task_file))

        assert result["file"] == "minimal-task.md"
        assert result["type"] == "task"
        assert result["metrics"]["lines"] < THRESHOLDS["task"]["min_lines"]

    def test_check_task_quality_sufficient(self, tmp_path):
        """Test task quality check with sufficient content"""
        task_content = "# Task\n\n" + "\n".join([f"Step {i}" for i in range(150)])

        task_file = tmp_path / "good-task.md"
        task_file.write_text(task_content)

        result = check_task_quality(str(task_file))

        assert result["metrics"]["lines"] >= THRESHOLDS["task"]["min_lines"]
        assert len([i for i in result["issues"] if "lines" in i.get("metric", "")]) == 0


class TestCheckSquadQuality:
    """Tests for check_squad_quality function"""

    def test_check_squad_quality_complete(self, tmp_path):
        """Test squad quality check with complete structure"""
        # Create squad structure
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        # Required files
        (squad_dir / "config.yaml").write_text("name: test-squad\n")
        (squad_dir / "README.md").write_text("# Test Squad\n")
        (squad_dir / "CHANGELOG.md").write_text("# Changelog\n")

        # Required directories with content
        agents_dir = squad_dir / "agents"
        agents_dir.mkdir()
        (agents_dir / "test-agent.md").write_text("# Agent\n" * 100)

        tasks_dir = squad_dir / "tasks"
        tasks_dir.mkdir()
        (tasks_dir / "test-task.md").write_text("# Task\n" * 50)

        result = check_squad_quality(str(squad_dir))

        assert result["squad_name"] == "test-squad"
        assert result["passed"] == True
        assert result["metrics"]["has_config_yaml"] == True
        assert result["metrics"]["has_README_md"] == True
        assert result["metrics"]["agent_count"] == 1
        assert result["metrics"]["task_count"] == 1

    def test_check_squad_quality_missing_files(self, tmp_path):
        """Test squad quality check with missing required files"""
        squad_dir = tmp_path / "incomplete-squad"
        squad_dir.mkdir()

        result = check_squad_quality(str(squad_dir))

        assert result["passed"] == False
        assert any(i["code"] == "QG-SQD-REQFILE" for i in result["issues"])

    def test_check_squad_quality_missing_dirs(self, tmp_path):
        """Test squad quality check with missing directories"""
        squad_dir = tmp_path / "no-dirs-squad"
        squad_dir.mkdir()
        (squad_dir / "config.yaml").write_text("name: test\n")
        (squad_dir / "README.md").write_text("# Test\n")

        result = check_squad_quality(str(squad_dir))

        assert result["passed"] == False
        assert any(i["code"] == "QG-SQD-REQDIR" for i in result["issues"])


class TestScanSquad:
    """Tests for scan_squad function"""

    def test_scan_squad_complete(self, tmp_path):
        """Test full squad scan"""
        # Create complete squad structure
        squad_dir = tmp_path / "full-squad"
        squad_dir.mkdir()

        (squad_dir / "config.yaml").write_text("name: full-squad\nversion: 1.0.0\n")
        (squad_dir / "README.md").write_text("# Full Squad\n\nDescription here.\n")

        agents_dir = squad_dir / "agents"
        agents_dir.mkdir()
        (agents_dir / "main-agent.md").write_text("# Agent\n" * 150)

        tasks_dir = squad_dir / "tasks"
        tasks_dir.mkdir()
        (tasks_dir / "main-task.md").write_text("# Task\n" * 60)

        results = scan_squad(str(squad_dir))

        assert results["exists"] == True
        assert results["squad_name"] == "full-squad"
        assert len(results["agent_checks"]) == 1
        assert len(results["task_checks"]) == 1

    def test_scan_squad_nonexistent(self):
        """Test scanning nonexistent squad"""
        results = scan_squad("/nonexistent/squad/path")

        assert results["exists"] == False
        assert "error" in results

    def test_scan_squad_strict_mode(self, tmp_path):
        """Test strict mode in squad scan"""
        squad_dir = tmp_path / "strict-squad"
        squad_dir.mkdir()
        (squad_dir / "config.yaml").write_text("name: test\n")
        (squad_dir / "README.md").write_text("# Test\n")

        agents_dir = squad_dir / "agents"
        agents_dir.mkdir()
        (agents_dir / "agent.md").write_text("# Small agent\n")

        tasks_dir = squad_dir / "tasks"
        tasks_dir.mkdir()
        (tasks_dir / "task.md").write_text("# Task\n")

        results = scan_squad(str(squad_dir), strict=True)

        assert results["strict_mode"] == True


class TestThresholds:
    """Tests for threshold constants"""

    def test_agent_thresholds_exist(self):
        """Test that agent thresholds are defined"""
        assert "agent" in THRESHOLDS
        assert THRESHOLDS["agent"]["min_lines"] == 300
        assert THRESHOLDS["agent"]["min_output_examples"] == 3

    def test_task_thresholds_exist(self):
        """Test that task thresholds are defined"""
        assert "task" in THRESHOLDS
        assert THRESHOLDS["task"]["min_lines"] == 100

    def test_squad_thresholds_exist(self):
        """Test that squad thresholds are defined"""
        assert "squad" in THRESHOLDS
        assert "config.yaml" in THRESHOLDS["squad"]["required_files"]
        assert "README.md" in THRESHOLDS["squad"]["required_files"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
