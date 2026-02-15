#!/usr/bin/env python3
"""
Tests for refresh-registry.py
Run with: pytest scripts/tests/test_refresh_registry.py -v
"""

import os
import sys
import pytest
from pathlib import Path
from datetime import datetime

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import using underscore version of module name
import importlib.util
spec = importlib.util.spec_from_file_location(
    "refresh_registry",
    Path(__file__).parent.parent / "refresh-registry.py"
)
refresh_registry = importlib.util.module_from_spec(spec)
spec.loader.exec_module(refresh_registry)

count_files = refresh_registry.count_files
read_config_yaml = refresh_registry.read_config_yaml
list_agents = refresh_registry.list_agents
scan_squad = refresh_registry.scan_squad
scan_all_squads = refresh_registry.scan_all_squads
format_for_registry = refresh_registry.format_for_registry


class TestCountFiles:
    """Tests for count_files function"""

    def test_count_files_empty_dir(self, tmp_path):
        """Empty directory returns 0"""
        empty_dir = tmp_path / "empty"
        empty_dir.mkdir()

        result = count_files(empty_dir, ["*.md"])

        assert result == 0

    def test_count_files_with_matches(self, tmp_path):
        """Files matching pattern are counted"""
        test_dir = tmp_path / "test"
        test_dir.mkdir()

        (test_dir / "file1.md").write_text("# F1")
        (test_dir / "file2.md").write_text("# F2")
        (test_dir / "file3.txt").write_text("TXT")

        result = count_files(test_dir, ["*.md"])

        assert result == 2

    def test_count_files_multiple_patterns(self, tmp_path):
        """Multiple patterns work correctly"""
        test_dir = tmp_path / "test"
        test_dir.mkdir()

        (test_dir / "file.md").write_text("MD")
        (test_dir / "file.yaml").write_text("YAML")
        (test_dir / "file.txt").write_text("TXT")

        result = count_files(test_dir, ["*.md", "*.yaml"])

        assert result == 2

    def test_count_files_nonexistent(self, tmp_path):
        """Nonexistent directory is handled"""
        # Function should handle this gracefully
        result = count_files(tmp_path / "nonexistent", ["*.md"])
        assert result == 0


class TestReadConfigYaml:
    """Tests for read_config_yaml function"""

    def test_read_config_yaml_exists(self, tmp_path):
        """Config is parsed when exists"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        (squad_dir / "config.yaml").write_text("""
name: test-squad
version: 1.0.0
description: Test description
slashPrefix: testSquad
short-title: Test
""")

        result = read_config_yaml(squad_dir)

        assert result is not None
        assert result["name"] == "test-squad"
        assert result["version"] == "1.0.0"

    def test_read_config_yaml_not_exists(self, tmp_path):
        """Returns None when config doesn't exist"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        result = read_config_yaml(squad_dir)

        assert result is None


class TestListAgents:
    """Tests for list_agents function"""

    def test_list_agents_with_agents(self, tmp_path):
        """Agents are listed correctly"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        agents_dir = squad_dir / "agents"
        agents_dir.mkdir()

        (agents_dir / "agent-one.md").write_text("# Agent 1")
        (agents_dir / "agent-two.md").write_text("# Agent 2")

        result = list_agents(squad_dir)

        assert len(result) == 2
        assert "agent-one" in result
        assert "agent-two" in result

    def test_list_agents_excludes_readme(self, tmp_path):
        """README.md is excluded from agent list"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        agents_dir = squad_dir / "agents"
        agents_dir.mkdir()

        (agents_dir / "real-agent.md").write_text("# Agent")
        (agents_dir / "README.md").write_text("# README")
        (agents_dir / "template.md").write_text("# Template")

        result = list_agents(squad_dir)

        assert len(result) == 1
        assert "real-agent" in result
        assert "README" not in result
        assert "template" not in result

    def test_list_agents_no_dir(self, tmp_path):
        """No agents directory returns empty list"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        result = list_agents(squad_dir)

        assert result == []


class TestScanSquad:
    """Tests for scan_squad function"""

    def test_scan_squad_complete(self, tmp_path):
        """Complete squad is scanned correctly"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        # Config
        (squad_dir / "config.yaml").write_text("""
name: test-squad
version: 2.0.0
description: A test squad
slashPrefix: testSquad
short-title: Test
""")

        # Agents
        agents_dir = squad_dir / "agents"
        agents_dir.mkdir()
        (agents_dir / "agent-one.md").write_text("# A1")
        (agents_dir / "agent-two.md").write_text("# A2")

        # Tasks
        tasks_dir = squad_dir / "tasks"
        tasks_dir.mkdir()
        (tasks_dir / "task.md").write_text("# Task")

        # README
        (squad_dir / "README.md").write_text("# README")
        (squad_dir / "CHANGELOG.md").write_text("# Changelog")

        result = scan_squad(squad_dir)

        assert result["name"] == "test-squad"
        assert result["has_config"] == True
        assert result["config"]["version"] == "2.0.0"
        assert result["counts"]["agents"] == 2
        assert result["counts"]["tasks"] == 1
        assert result["has_readme"] == True
        assert result["has_changelog"] == True
        assert len(result["agent_names"]) == 2

    def test_scan_squad_minimal(self, tmp_path):
        """Minimal squad still produces results"""
        squad_dir = tmp_path / "minimal-squad"
        squad_dir.mkdir()

        result = scan_squad(squad_dir)

        assert result["name"] == "minimal-squad"
        assert result["has_config"] == False
        assert result["counts"]["agents"] == 0
        assert result["total_components"] == 0


class TestScanAllSquads:
    """Tests for scan_all_squads function"""

    def test_scan_all_squads_empty(self, tmp_path):
        """Empty squads directory returns empty results"""
        squads_dir = tmp_path / "squads"
        squads_dir.mkdir()

        result = scan_all_squads(squads_dir)

        assert result["metadata"]["total_squads"] == 0
        assert len(result["squads"]) == 0

    def test_scan_all_squads_multiple(self, tmp_path):
        """Multiple squads are scanned"""
        squads_dir = tmp_path / "squads"
        squads_dir.mkdir()

        # Squad 1
        squad1 = squads_dir / "squad-one"
        squad1.mkdir()
        (squad1 / "config.yaml").write_text("name: squad-one\nversion: 1.0.0")
        (squad1 / "agents").mkdir()
        (squad1 / "agents" / "agent.md").write_text("# A")

        # Squad 2
        squad2 = squads_dir / "squad-two"
        squad2.mkdir()
        (squad2 / "config.yaml").write_text("name: squad-two\nversion: 1.0.0")
        (squad2 / "agents").mkdir()
        (squad2 / "agents" / "agent.md").write_text("# A")

        result = scan_all_squads(squads_dir)

        assert result["metadata"]["total_squads"] == 2
        assert "squad-one" in result["squads"]
        assert "squad-two" in result["squads"]
        assert result["summary"]["total_agents"] == 2

    def test_scan_all_squads_skips_invalid(self, tmp_path):
        """Invalid directories are skipped"""
        squads_dir = tmp_path / "squads"
        squads_dir.mkdir()

        # Valid squad
        valid = squads_dir / "valid-squad"
        valid.mkdir()
        (valid / "config.yaml").write_text("name: valid-squad")

        # Invalid - no config or agents
        invalid = squads_dir / "not-a-squad"
        invalid.mkdir()
        (invalid / "random.txt").write_text("random")

        # Hidden directory
        hidden = squads_dir / ".hidden"
        hidden.mkdir()

        result = scan_all_squads(squads_dir)

        assert result["metadata"]["total_squads"] == 1
        assert "valid-squad" in result["squads"]
        assert "not-a-squad" not in result["squads"]
        assert ".hidden" not in result["squads"]


class TestFormatForRegistry:
    """Tests for format_for_registry function"""

    def test_format_for_registry_structure(self, tmp_path):
        """Registry format has correct structure"""
        squads_dir = tmp_path / "squads"
        squads_dir.mkdir()

        squad = squads_dir / "test-squad"
        squad.mkdir()
        (squad / "config.yaml").write_text("""
name: test-squad
version: 1.0.0
description: Test
slashPrefix: testSquad
""")
        (squad / "agents").mkdir()

        scan_results = scan_all_squads(squads_dir)
        registry = format_for_registry(scan_results)

        assert "metadata" in registry
        assert "squads" in registry
        assert "summary" in registry
        assert registry["metadata"]["maintainer"] == "squad-creator"
        assert registry["metadata"]["generated_by"] == "scripts/refresh-registry.py"

    def test_format_for_registry_squad_fields(self, tmp_path):
        """Each squad in registry has required fields"""
        squads_dir = tmp_path / "squads"
        squads_dir.mkdir()

        squad = squads_dir / "test-squad"
        squad.mkdir()
        (squad / "config.yaml").write_text("""
name: test-squad
version: 2.0.0
description: Test description
slashPrefix: testSquad
""")
        (squad / "agents").mkdir()

        scan_results = scan_all_squads(squads_dir)
        registry = format_for_registry(scan_results)

        squad_data = registry["squads"]["test-squad"]
        assert "path" in squad_data
        assert "version" in squad_data
        assert "description" in squad_data
        assert "slashPrefix" in squad_data
        assert "counts" in squad_data
        assert "agent_names" in squad_data
        assert "domain" in squad_data  # Placeholder for LLM
        assert "keywords" in squad_data  # Placeholder for LLM


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
