#!/usr/bin/env python3
"""Tests for refresh-registry.py."""

import importlib.util
import subprocess
import sys
from pathlib import Path

import pytest


SCRIPT_PATH = Path(__file__).parent.parent / "refresh-registry.py"

spec = importlib.util.spec_from_file_location("refresh_registry", SCRIPT_PATH)
refresh_registry = importlib.util.module_from_spec(spec)
spec.loader.exec_module(refresh_registry)

count_files = refresh_registry.count_files
read_config_yaml = refresh_registry.read_config_yaml
list_agents = refresh_registry.list_agents
scan_squad = refresh_registry.scan_squad
scan_all_squads = refresh_registry.scan_all_squads
format_for_registry = refresh_registry.format_for_registry
merge_with_existing = refresh_registry.merge_with_existing

MATURITY_DRAFT = refresh_registry.MATURITY_DRAFT
MATURITY_DEVELOPING = refresh_registry.MATURITY_DEVELOPING
MATURITY_OPERATIONAL = refresh_registry.MATURITY_OPERATIONAL


def _create_manifest(squad_dir: Path, version: str = "1.0.0") -> None:
    (squad_dir / "squad.yaml").write_text(
        f"""
name: {squad_dir.name}
version: {version}
description: Test squad
slashPrefix: test
""".strip()
    )


def _create_usage_evidence(project_root: Path, squad_name: str, files: int = 3) -> None:
    output_dir = project_root / "outputs" / squad_name
    output_dir.mkdir(parents=True, exist_ok=True)
    for index in range(files):
        (output_dir / f"file-{index}.txt").write_text("ok")


class TestCountFiles:
    def test_count_files_recursive(self, tmp_path: Path) -> None:
        content = tmp_path / "content"
        nested = content / "nested"
        nested.mkdir(parents=True)
        (content / "a.md").write_text("# A")
        (nested / "b.md").write_text("# B")
        (nested / "c.yaml").write_text("k: v")

        assert count_files(content, ["*.md"]) == 2
        assert count_files(content, ["*.md", "*.yaml"]) == 3

    def test_count_files_missing_dir(self, tmp_path: Path) -> None:
        assert count_files(tmp_path / "missing", ["*.md"]) == 0


class TestManifestAndAgents:
    def test_read_config_yaml_reads_squad_yaml(self, tmp_path: Path) -> None:
        squad_dir = tmp_path / "alpha"
        squad_dir.mkdir()
        _create_manifest(squad_dir, "2.1.0")

        data = read_config_yaml(squad_dir)

        assert data is not None
        assert data["name"] == "alpha"
        assert data["version"] == "2.1.0"

    def test_read_config_yaml_missing_manifest(self, tmp_path: Path) -> None:
        squad_dir = tmp_path / "alpha"
        squad_dir.mkdir()

        assert read_config_yaml(squad_dir) is None

    def test_list_agents_recursive_and_filtered(self, tmp_path: Path) -> None:
        squad_dir = tmp_path / "alpha"
        agents_dir = squad_dir / "agents"
        nested_dir = agents_dir / "tier-2"
        nested_dir.mkdir(parents=True)

        (agents_dir / "README.md").write_text("# ignore")
        (agents_dir / "writer.md").write_text("# writer")
        (nested_dir / "reviewer.md").write_text("# reviewer")

        agents = list_agents(squad_dir)

        assert "writer" in agents
        assert "tier-2/reviewer" in agents
        assert "README" not in agents

    def test_list_agents_excludes_template_and_handles_missing_dir(self, tmp_path: Path) -> None:
        squad_dir = tmp_path / "alpha"
        agents_dir = squad_dir / "agents"
        agents_dir.mkdir(parents=True)
        (agents_dir / "template.md").write_text("# ignore")
        (agents_dir / "real.md").write_text("# keep")

        assert list_agents(squad_dir) == ["real"]
        assert list_agents(tmp_path / "missing") == []


class TestScanSquad:
    def test_scan_squad_counts_and_metadata(self, tmp_path: Path) -> None:
        project_root = tmp_path / "project"
        squads_dir = project_root / "squads"
        squad_dir = squads_dir / "alpha"

        (squad_dir / "agents").mkdir(parents=True)
        (squad_dir / "tasks").mkdir(parents=True)
        (squad_dir / "workflows").mkdir(parents=True)
        (squad_dir / "templates" / "nested").mkdir(parents=True)
        (squad_dir / "data").mkdir(parents=True)
        (squad_dir / "checklists").mkdir(parents=True)

        _create_manifest(squad_dir, "3.0.0")
        (squad_dir / "README.md").write_text("# readme")
        (squad_dir / "agents" / "a.md").write_text("# A")
        (squad_dir / "tasks" / "task.md").write_text("# Task")
        (squad_dir / "workflows" / "wf.yaml").write_text("steps: []")
        (squad_dir / "templates" / "nested" / "tpl.yml").write_text("k: v")
        (squad_dir / "data" / "data.json").write_text("{}")
        (squad_dir / "checklists" / "ck.md").write_text("- item")

        result = scan_squad(squad_dir, project_root=project_root)

        assert result["config"]["version"] == "3.0.0"
        assert result["counts"]["agents"] == 1
        assert result["counts"]["templates"] == 1
        assert result["counts"]["data_files"] == 1
        assert result["has_readme"] is True

    def test_scan_squad_manual_devalidation_blocks_auto_promotion(self, tmp_path: Path) -> None:
        project_root = tmp_path / "project"
        squad_dir = project_root / "squads" / "alpha"
        (squad_dir / "tasks").mkdir(parents=True)
        (squad_dir / "workflows").mkdir(parents=True)

        _create_manifest(squad_dir)
        (squad_dir / "tasks" / "t1.md").write_text("1")
        (squad_dir / "tasks" / "t2.md").write_text("2")
        (squad_dir / "tasks" / "t3.md").write_text("3")
        (squad_dir / "workflows" / "wf.yaml").write_text("steps: []")
        _create_usage_evidence(project_root, "alpha", files=4)

        result = scan_squad(
            squad_dir,
            project_root=project_root,
            existing_validated=False,
            validated_explicit=True,
        )

        assert result["maturity"] == MATURITY_DEVELOPING
        assert result["validated"] is False
        assert result["auto_promoted"] is False

    def test_scan_squad_auto_promotes_without_manual_block(self, tmp_path: Path) -> None:
        project_root = tmp_path / "project"
        squad_dir = project_root / "squads" / "alpha"
        (squad_dir / "tasks").mkdir(parents=True)

        _create_manifest(squad_dir)
        (squad_dir / "tasks" / "t1.md").write_text("1")
        (squad_dir / "tasks" / "t2.md").write_text("2")
        (squad_dir / "tasks" / "t3.md").write_text("3")
        _create_usage_evidence(project_root, "alpha", files=4)

        result = scan_squad(
            squad_dir,
            project_root=project_root,
            existing_validated=False,
            validated_explicit=False,
        )

        assert result["maturity"] == MATURITY_OPERATIONAL
        assert result["validated"] is True
        assert result["auto_promoted"] is True


class TestScanAllAndRegistry:
    def test_scan_all_squads_empty(self, tmp_path: Path) -> None:
        squads_dir = tmp_path / "squads"
        squads_dir.mkdir()

        result = scan_all_squads(squads_dir)

        assert result["metadata"]["total_squads"] == 0
        assert result["summary"]["total_agents"] == 0
        assert result["squads"] == {}

    def test_scan_all_squads_only_accepts_squad_yaml(self, tmp_path: Path) -> None:
        squads_dir = tmp_path / "squads"
        squads_dir.mkdir()

        valid = squads_dir / "valid"
        valid.mkdir()
        _create_manifest(valid)

        legacy = squads_dir / "legacy"
        legacy.mkdir()
        (legacy / "config.yaml").write_text("name: legacy")

        result = scan_all_squads(squads_dir)

        assert result["metadata"]["total_squads"] == 1
        assert "valid" in result["squads"]
        assert "legacy" not in result["squads"]

    def test_scan_all_squads_multiple_and_skips_hidden(self, tmp_path: Path) -> None:
        squads_dir = tmp_path / "squads"
        squads_dir.mkdir()

        alpha = squads_dir / "alpha"
        beta = squads_dir / "beta"
        hidden = squads_dir / ".hidden"
        alpha.mkdir()
        beta.mkdir()
        hidden.mkdir()
        _create_manifest(alpha)
        _create_manifest(beta)
        (alpha / "agents").mkdir()
        (beta / "agents").mkdir()
        (alpha / "agents" / "a.md").write_text("# A")
        (beta / "agents" / "b.md").write_text("# B")

        result = scan_all_squads(squads_dir)

        assert result["metadata"]["total_squads"] == 2
        assert set(result["squads"].keys()) == {"alpha", "beta"}
        assert result["summary"]["total_agents"] == 2

    def test_format_for_registry_contains_validation_fields(self, tmp_path: Path) -> None:
        squads_dir = tmp_path / "squads"
        squads_dir.mkdir()

        squad = squads_dir / "alpha"
        (squad / "tasks").mkdir(parents=True)
        _create_manifest(squad)
        (squad / "tasks" / "task.md").write_text("# Task")

        registry = format_for_registry(scan_all_squads(squads_dir))
        entry = registry["squads"]["alpha"]

        assert "validated" in entry
        assert "validated_explicit" in entry
        assert "auto_promoted" in entry

    def test_format_for_registry_structure(self, tmp_path: Path) -> None:
        squads_dir = tmp_path / "squads"
        squads_dir.mkdir()
        squad = squads_dir / "alpha"
        squad.mkdir()
        _create_manifest(squad)

        registry = format_for_registry(scan_all_squads(squads_dir))

        assert "metadata" in registry
        assert "squads" in registry
        assert "summary" in registry
        assert registry["metadata"]["maintainer"] == "squad-creator"
        assert registry["metadata"]["generated_by"] == "scripts/refresh-registry.py"

    def test_merge_preserves_explicit_false_and_keeps_consistency(self) -> None:
        fresh = {
            "squads": {
                "alpha": {
                    "maturity": MATURITY_OPERATIONAL,
                    "validated": True,
                    "validated_explicit": False,
                    "auto_promoted": True,
                    "counts": {"tasks": 3, "workflows": 1},
                }
            }
        }
        existing = {
            "squads": {
                "alpha": {
                    "validated": False,
                    "validated_explicit": True,
                }
            }
        }

        merged = merge_with_existing(fresh, existing)
        entry = merged["squads"]["alpha"]

        assert entry["validated"] is False
        assert entry["validated_explicit"] is True
        assert entry["maturity"] == MATURITY_DEVELOPING
        assert entry["auto_promoted"] is False


class TestCli:
    def test_summary_registry_format_does_not_crash(self, tmp_path: Path) -> None:
        squads_dir = tmp_path / "squads"
        squad = squads_dir / "alpha"
        squad.mkdir(parents=True)
        _create_manifest(squad)

        result = subprocess.run(
            [
                sys.executable,
                str(SCRIPT_PATH),
                "--squads-path",
                str(squads_dir),
                "--output",
                "summary",
                "--registry-format",
            ],
            capture_output=True,
            text=True,
            check=False,
        )

        assert result.returncode == 0
        assert "Scan Date:" in result.stdout
        assert "Total Squads:" in result.stdout


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
