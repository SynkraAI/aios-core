#!/usr/bin/env python3
"""
Tests for squad-analytics.py
Run with: pytest scripts/tests/test_squad_analytics.py -v
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
    "squad_analytics",
    Path(__file__).parent.parent / "squad-analytics.py"
)
squad_analytics = importlib.util.module_from_spec(spec)
spec.loader.exec_module(squad_analytics)

count_files_by_extension = squad_analytics.count_files_by_extension
count_md_files = squad_analytics.count_md_files
list_files = squad_analytics.list_files
simple_yaml_parse = squad_analytics.simple_yaml_parse
read_config = squad_analytics.read_config
analyze_squad = squad_analytics.analyze_squad
calculate_quality_score = squad_analytics.calculate_quality_score
analyze_all_squads = squad_analytics.analyze_all_squads
format_table = squad_analytics.format_table


class TestCountFilesByExtension:
    """Tests for count_files_by_extension function"""

    def test_count_files_empty_dir(self, tmp_path):
        """Empty directory returns 0"""
        empty_dir = tmp_path / "empty"
        empty_dir.mkdir()

        result = count_files_by_extension(empty_dir, [".py"])

        assert result == 0

    def test_count_files_with_matches(self, tmp_path):
        """Files matching extension are counted"""
        test_dir = tmp_path / "test"
        test_dir.mkdir()

        (test_dir / "script1.py").write_text("# Python")
        (test_dir / "script2.py").write_text("# Python")
        (test_dir / "script3.js").write_text("// JS")

        result = count_files_by_extension(test_dir, [".py"])

        assert result == 2

    def test_count_files_multiple_extensions(self, tmp_path):
        """Multiple extensions work correctly"""
        test_dir = tmp_path / "test"
        test_dir.mkdir()

        (test_dir / "file.py").write_text("PY")
        (test_dir / "file.js").write_text("JS")
        (test_dir / "file.sh").write_text("SH")

        result = count_files_by_extension(test_dir, [".py", ".js"])

        assert result == 2

    def test_count_files_nonexistent_dir(self, tmp_path):
        """Nonexistent directory returns 0"""
        result = count_files_by_extension(tmp_path / "nonexistent", [".py"])

        assert result == 0


class TestCountMdFiles:
    """Tests for count_md_files function"""

    def test_count_md_files_basic(self, tmp_path):
        """MD files are counted"""
        test_dir = tmp_path / "test"
        test_dir.mkdir()

        (test_dir / "file1.md").write_text("# F1")
        (test_dir / "file2.md").write_text("# F2")

        result = count_md_files(test_dir)

        assert result == 2

    def test_count_md_files_excludes_readme(self, tmp_path):
        """README.md is excluded"""
        test_dir = tmp_path / "test"
        test_dir.mkdir()

        (test_dir / "real-file.md").write_text("# Real")
        (test_dir / "README.md").write_text("# README")
        (test_dir / "readme.md").write_text("# readme")
        (test_dir / "template.md").write_text("# Template")

        result = count_md_files(test_dir)

        assert result == 1


class TestListFiles:
    """Tests for list_files function"""

    def test_list_files_basic(self, tmp_path):
        """Files are listed correctly"""
        test_dir = tmp_path / "test"
        test_dir.mkdir()

        (test_dir / "alpha.md").write_text("A")
        (test_dir / "beta.md").write_text("B")

        result = list_files(test_dir, [".md"])

        assert len(result) == 2
        assert "alpha" in result
        assert "beta" in result

    def test_list_files_sorted(self, tmp_path):
        """Files are returned sorted"""
        test_dir = tmp_path / "test"
        test_dir.mkdir()

        (test_dir / "zebra.md").write_text("Z")
        (test_dir / "alpha.md").write_text("A")

        result = list_files(test_dir, [".md"])

        assert result == ["alpha", "zebra"]

    def test_list_files_excludes_special(self, tmp_path):
        """Special files are excluded"""
        test_dir = tmp_path / "test"
        test_dir.mkdir()

        (test_dir / "real.md").write_text("R")
        (test_dir / "readme.md").write_text("README")

        result = list_files(test_dir, [".md"])

        assert "real" in result
        assert "readme" not in result


class TestSimpleYamlParse:
    """Tests for simple_yaml_parse function"""

    def test_simple_yaml_parse_basic(self):
        """Basic key-value pairs are parsed"""
        content = """
name: test-squad
version: 1.0.0
description: Test description
"""
        result = simple_yaml_parse(content)

        assert result["name"] == "test-squad"
        assert result["version"] == "1.0.0"
        assert result["description"] == "Test description"

    def test_simple_yaml_parse_quoted_values(self):
        """Quoted values have quotes stripped"""
        content = """
name: "quoted-value"
other: 'single-quoted'
"""
        result = simple_yaml_parse(content)

        assert result["name"] == "quoted-value"
        assert result["other"] == "single-quoted"

    def test_simple_yaml_parse_skips_comments(self):
        """Comments are skipped"""
        content = """
# This is a comment
name: value
# Another comment
version: 1.0.0
"""
        result = simple_yaml_parse(content)

        assert "name" in result
        assert result["name"] == "value"

    def test_simple_yaml_parse_skips_list_items(self):
        """List items (starting with -) are skipped"""
        content = """
name: test
items:
  - item1
  - item2
version: 1.0.0
"""
        result = simple_yaml_parse(content)

        assert "name" in result
        assert "version" in result
        # List items should not create keys


class TestReadConfig:
    """Tests for read_config function"""

    def test_read_config_exists(self, tmp_path):
        """Config is read when exists"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        (squad_dir / "config.yaml").write_text("""
name: test-squad
version: 2.0.0
""")

        result = read_config(squad_dir)

        assert result is not None
        assert result["name"] == "test-squad"
        assert result["version"] == "2.0.0"

    def test_read_config_not_exists(self, tmp_path):
        """Returns None when config doesn't exist"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        result = read_config(squad_dir)

        assert result is None


class TestCalculateQualityScore:
    """Tests for calculate_quality_score function"""

    def test_quality_score_complete(self):
        """Complete squad gets high score"""
        counts = {
            "agents": 5,
            "tasks": 10,
            "workflows": 3,
            "templates": 5,
            "checklists": 3,
            "data": 2,
        }
        result = calculate_quality_score(counts, has_readme=True, has_config=True)

        assert "⭐⭐⭐" in result

    def test_quality_score_minimal(self):
        """Minimal squad gets low score"""
        counts = {
            "agents": 0,
            "tasks": 0,
            "workflows": 0,
            "templates": 0,
            "checklists": 0,
            "data": 0,
        }
        result = calculate_quality_score(counts, has_readme=False, has_config=False)

        assert "🔨" in result or "⭐" not in result

    def test_quality_score_medium(self):
        """Medium squad gets medium score"""
        counts = {
            "agents": 2,
            "tasks": 3,
            "workflows": 0,
            "templates": 0,
            "checklists": 0,
            "data": 0,
        }
        result = calculate_quality_score(counts, has_readme=True, has_config=True)

        # Should have some stars but not maximum
        assert "⭐" in result


class TestAnalyzeSquad:
    """Tests for analyze_squad function"""

    def test_analyze_squad_complete(self, tmp_path):
        """Complete squad is analyzed correctly"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        (squad_dir / "config.yaml").write_text("""
name: test-squad
version: 1.5.0
description: Test description
short-title: Test
""")

        agents_dir = squad_dir / "agents"
        agents_dir.mkdir()
        (agents_dir / "agent1.md").write_text("# A1")
        (agents_dir / "agent2.md").write_text("# A2")

        tasks_dir = squad_dir / "tasks"
        tasks_dir.mkdir()
        (tasks_dir / "task1.md").write_text("# T1")

        (squad_dir / "README.md").write_text("# README")
        (squad_dir / "CHANGELOG.md").write_text("# Changes")

        result = analyze_squad(squad_dir)

        assert result["name"] == "test-squad"
        assert result["version"] == "1.5.0"
        assert result["counts"]["agents"] == 2
        assert result["counts"]["tasks"] == 1
        assert result["has_readme"] == True
        assert result["has_changelog"] == True
        assert result["has_config"] == True
        assert result["total"] == 3  # 2 agents + 1 task
        assert "quality_score" in result

    def test_analyze_squad_includes_components(self, tmp_path):
        """Component names are captured"""
        squad_dir = tmp_path / "test-squad"
        squad_dir.mkdir()

        agents_dir = squad_dir / "agents"
        agents_dir.mkdir()
        (agents_dir / "alpha-agent.md").write_text("# A")
        (agents_dir / "beta-agent.md").write_text("# B")

        result = analyze_squad(squad_dir)

        assert "alpha-agent" in result["components"]["agents"]
        assert "beta-agent" in result["components"]["agents"]


class TestAnalyzeAllSquads:
    """Tests for analyze_all_squads function"""

    def test_analyze_all_squads_empty(self, tmp_path):
        """Empty directory returns empty results"""
        squads_dir = tmp_path / "squads"
        squads_dir.mkdir()

        result = analyze_all_squads(squads_dir)

        assert result["totals"]["squads"] == 0
        assert len(result["squads"]) == 0

    def test_analyze_all_squads_multiple(self, tmp_path):
        """Multiple squads are analyzed"""
        squads_dir = tmp_path / "squads"
        squads_dir.mkdir()

        # Squad 1
        s1 = squads_dir / "squad-one"
        s1.mkdir()
        (s1 / "config.yaml").write_text("name: squad-one")
        (s1 / "agents").mkdir()
        (s1 / "agents" / "a1.md").write_text("A")
        (s1 / "agents" / "a2.md").write_text("A")

        # Squad 2
        s2 = squads_dir / "squad-two"
        s2.mkdir()
        (s2 / "config.yaml").write_text("name: squad-two")
        (s2 / "agents").mkdir()
        (s2 / "agents" / "a1.md").write_text("A")

        result = analyze_all_squads(squads_dir)

        assert result["totals"]["squads"] == 2
        assert result["totals"]["agents"] == 3
        assert len(result["squads"]) == 2

    def test_analyze_all_squads_skips_hidden(self, tmp_path):
        """Hidden directories are skipped"""
        squads_dir = tmp_path / "squads"
        squads_dir.mkdir()

        # Valid
        valid = squads_dir / "valid-squad"
        valid.mkdir()
        (valid / "agents").mkdir()

        # Hidden
        hidden = squads_dir / ".hidden-squad"
        hidden.mkdir()
        (hidden / "agents").mkdir()

        result = analyze_all_squads(squads_dir)

        assert result["totals"]["squads"] == 1


class TestFormatTable:
    """Tests for format_table function"""

    def test_format_table_has_header(self, tmp_path):
        """Table has header"""
        squads_dir = tmp_path / "squads"
        squads_dir.mkdir()

        valid = squads_dir / "test-squad"
        valid.mkdir()
        (valid / "config.yaml").write_text("name: test-squad")

        results = analyze_all_squads(squads_dir)
        output = format_table(results)

        assert "SQUAD ANALYTICS" in output
        assert "Squad" in output

    def test_format_table_shows_squads(self, tmp_path):
        """Table shows squad data"""
        squads_dir = tmp_path / "squads"
        squads_dir.mkdir()

        squad = squads_dir / "my-squad"
        squad.mkdir()
        (squad / "config.yaml").write_text("name: my-squad")
        (squad / "agents").mkdir()
        (squad / "agents" / "agent.md").write_text("A")

        results = analyze_all_squads(squads_dir)
        output = format_table(results)

        assert "my-squad" in output

    def test_format_table_shows_totals(self, tmp_path):
        """Table shows totals"""
        squads_dir = tmp_path / "squads"
        squads_dir.mkdir()

        squad = squads_dir / "test"
        squad.mkdir()
        (squad / "config.yaml").write_text("name: test")

        results = analyze_all_squads(squads_dir)
        output = format_table(results)

        assert "SUMMARY" in output or "Squads:" in output


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
