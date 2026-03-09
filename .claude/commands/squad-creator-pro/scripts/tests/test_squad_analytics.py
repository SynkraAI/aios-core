#!/usr/bin/env python3
"""Tests for squad-analytics.py."""

import importlib.util
from pathlib import Path

import pytest


SCRIPT_PATH = Path(__file__).parent.parent / "squad-analytics.py"

spec = importlib.util.spec_from_file_location("squad_analytics", SCRIPT_PATH)
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

MATURITY_DRAFT = squad_analytics.MATURITY_DRAFT
MATURITY_DEVELOPING = squad_analytics.MATURITY_DEVELOPING
MATURITY_OPERATIONAL = squad_analytics.MATURITY_OPERATIONAL


def _create_manifest(squad_dir: Path, version: str = "1.0.0") -> None:
    (squad_dir / "squad.yaml").write_text(
        f"""
name: {squad_dir.name}
version: {version}
description: Analytics test squad
domain: data
""".strip()
    )


def _create_usage_evidence(project_root: Path, squad_name: str, files: int = 3) -> None:
    output_dir = project_root / "outputs" / squad_name
    output_dir.mkdir(parents=True, exist_ok=True)
    for index in range(files):
        (output_dir / f"evidence-{index}.txt").write_text("ok")


class TestRecursiveCounting:
    def test_count_files_by_extension_recursive(self, tmp_path: Path) -> None:
        root = tmp_path / "content"
        nested = root / "nested"
        nested.mkdir(parents=True)

        (root / "a.py").write_text("print('a')")
        (nested / "b.py").write_text("print('b')")
        (nested / "c.ts").write_text("console.log('c')")

        assert count_files_by_extension(root, [".py"]) == 2
        assert count_files_by_extension(root, [".py", ".ts"]) == 3

    def test_count_files_by_extension_missing_dir(self, tmp_path: Path) -> None:
        assert count_files_by_extension(tmp_path / "missing", [".py"]) == 0

    def test_count_md_files_excludes_readme_template(self, tmp_path: Path) -> None:
        docs = tmp_path / "docs"
        docs.mkdir()

        (docs / "README.md").write_text("# ignore")
        (docs / "readme.md").write_text("# ignore")
        (docs / "template.md").write_text("# ignore")
        (docs / "actual.md").write_text("# keep")

        assert count_md_files(docs) == 1

    def test_list_files_returns_relative_stems(self, tmp_path: Path) -> None:
        workflows = tmp_path / "workflows"
        (workflows / "nested").mkdir(parents=True)

        (workflows / "main.yaml").write_text("steps: []")
        (workflows / "nested" / "child.yml").write_text("steps: []")

        files = list_files(workflows, [".yaml", ".yml"])
        assert files == ["main", "nested/child"]

    def test_list_files_sorted_and_excludes_readme(self, tmp_path: Path) -> None:
        docs = tmp_path / "docs"
        docs.mkdir()
        (docs / "z.md").write_text("# Z")
        (docs / "a.md").write_text("# A")
        (docs / "README.md").write_text("# ignore")

        files = list_files(docs, [".md"])
        assert files == ["a", "z"]


class TestSimpleYamlParse:
    def test_simple_yaml_parse_basic(self) -> None:
        parsed = simple_yaml_parse(
            """
name: test-squad
version: 1.0.0
description: Test description
""".strip()
        )
        assert parsed["name"] == "test-squad"
        assert parsed["version"] == "1.0.0"
        assert parsed["description"] == "Test description"

    def test_simple_yaml_parse_quoted_and_comments(self) -> None:
        parsed = simple_yaml_parse(
            """
# comment
name: "quoted-value"
other: 'single-quoted'
""".strip()
        )
        assert parsed["name"] == "quoted-value"
        assert parsed["other"] == "single-quoted"

    def test_simple_yaml_parse_skips_list_items(self) -> None:
        parsed = simple_yaml_parse(
            """
name: test
items:
  - item1
  - item2
version: 1.0.0
""".strip()
        )
        assert parsed["name"] == "test"
        assert parsed["version"] == "1.0.0"


class TestManifestAndQuality:
    def test_read_config_reads_squad_yaml(self, tmp_path: Path) -> None:
        squad = tmp_path / "alpha"
        squad.mkdir()
        _create_manifest(squad, "2.2.0")

        config = read_config(squad)

        assert config is not None
        assert config["name"] == "alpha"
        assert config["version"] == "2.2.0"

    def test_calculate_quality_score(self) -> None:
        counts = {
            "agents": 2,
            "tasks": 3,
            "workflows": 1,
            "templates": 1,
            "checklists": 1,
            "data": 1,
        }
        assert "⭐" in calculate_quality_score(counts, has_readme=True, has_config=True)

    def test_calculate_quality_score_tiers(self) -> None:
        high = {
            "agents": 1,
            "tasks": 1,
            "workflows": 1,
            "templates": 1,
            "checklists": 1,
            "data": 1,
        }
        medium = {
            "agents": 1,
            "tasks": 1,
            "workflows": 0,
            "templates": 0,
            "checklists": 0,
            "data": 0,
        }
        low = {
            "agents": 0,
            "tasks": 0,
            "workflows": 0,
            "templates": 0,
            "checklists": 0,
            "data": 0,
        }

        assert calculate_quality_score(high, has_readme=True, has_config=True) == "⭐⭐⭐"
        assert calculate_quality_score(medium, has_readme=True, has_config=True) == "⭐⭐"
        assert calculate_quality_score(low, has_readme=False, has_config=False) == "🔨"


class TestAnalyzeSquad:
    def test_analyze_squad_recursive_counts_and_auto_promotion(self, tmp_path: Path) -> None:
        project_root = tmp_path / "project"
        squad = project_root / "squads" / "alpha"

        (squad / "agents" / "nested").mkdir(parents=True)
        (squad / "tasks").mkdir(parents=True)
        (squad / "workflows").mkdir(parents=True)
        (squad / "templates" / "nested").mkdir(parents=True)
        (squad / "data").mkdir(parents=True)
        (squad / "scripts" / "jobs").mkdir(parents=True)

        _create_manifest(squad)
        (squad / "README.md").write_text("# readme")
        (squad / "agents" / "nested" / "agent.md").write_text("# agent")
        (squad / "tasks" / "task-1.md").write_text("# t1")
        (squad / "tasks" / "task-2.md").write_text("# t2")
        (squad / "tasks" / "task-3.md").write_text("# t3")
        (squad / "workflows" / "flow.yml").write_text("steps: []")
        (squad / "templates" / "nested" / "template.yaml").write_text("k: v")
        (squad / "data" / "data.json").write_text("{}")
        (squad / "scripts" / "jobs" / "run.py").write_text("print('ok')")

        _create_usage_evidence(project_root, "alpha", files=4)

        result = analyze_squad(squad)

        assert result["counts"]["agents"] == 1
        assert result["counts"]["templates"] == 1
        assert result["counts"]["scripts"] == 1
        assert result["maturity"] == MATURITY_OPERATIONAL
        assert result["validated"] is True
        assert result["auto_promoted"] is True

    def test_analyze_squad_manual_devalidation_blocks(self, tmp_path: Path) -> None:
        project_root = tmp_path / "project"
        squad = project_root / "squads" / "alpha"
        (squad / "tasks").mkdir(parents=True)

        _create_manifest(squad)
        (squad / "tasks" / "t1.md").write_text("1")
        (squad / "tasks" / "t2.md").write_text("2")
        (squad / "tasks" / "t3.md").write_text("3")
        _create_usage_evidence(project_root, "alpha", files=4)

        result = analyze_squad(squad, existing_validated=False, validated_explicit=True)

        assert result["maturity"] == MATURITY_DEVELOPING
        assert result["validated"] is False
        assert result["auto_promoted"] is False


class TestAnalyzeAllSquads:
    def test_analyze_all_squads_requires_squad_yaml(self, tmp_path: Path) -> None:
        squads_dir = tmp_path / "squads"
        squads_dir.mkdir()

        valid = squads_dir / "valid"
        valid.mkdir()
        _create_manifest(valid)

        legacy = squads_dir / "legacy"
        legacy.mkdir()
        (legacy / "config.yaml").write_text("name: legacy")

        results = analyze_all_squads(squads_dir)

        assert results["totals"]["squads"] == 1
        assert results["squads"][0]["name"] == "valid"

    def test_analyze_all_squads_respects_registry_manual_flags(self, tmp_path: Path) -> None:
        squads_dir = tmp_path / "squads"
        squads_dir.mkdir()

        squad = squads_dir / "alpha"
        (squad / "tasks").mkdir(parents=True)
        _create_manifest(squad)
        (squad / "tasks" / "t1.md").write_text("1")
        (squad / "tasks" / "t2.md").write_text("2")
        (squad / "tasks" / "t3.md").write_text("3")

        registry_dir = squads_dir
        (registry_dir / "squad-registry.yaml").write_text(
            """
squads:
  alpha:
    validated: false
    validated_explicit: true
""".strip()
        )

        project_root = squads_dir.parent
        _create_usage_evidence(project_root, "alpha", files=5)

        results = analyze_all_squads(squads_dir)
        alpha = results["squads"][0]

        assert alpha["maturity"] == MATURITY_DEVELOPING
        assert alpha["validated"] is False
        assert alpha["validated_explicit"] is True


class TestFormatTable:
    def test_format_table_includes_maturity_distribution(self, tmp_path: Path) -> None:
        squads_dir = tmp_path / "squads"
        squads_dir.mkdir()

        squad = squads_dir / "alpha"
        squad.mkdir()
        _create_manifest(squad)

        results = analyze_all_squads(squads_dir)
        table = format_table(results)

        assert "SQUAD ANALYTICS" in table
        assert "MATURITY DISTRIBUTION" in table
        assert "alpha" in table


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
