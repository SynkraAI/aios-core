#!/usr/bin/env python3
"""
Deterministic validator for workspace integration contracts in squads.

Checks:
1) workspace_integration.level exists and is valid
2) workspace references exist when level != none
3) workspace_first requires bootstrap + essentials scripts
4) canonical outputs in workspace/businesses/{slug}/...yaml have template pair in workspace/_templates/...
"""

from __future__ import annotations

import argparse
import datetime as dt
import re
import sys
from pathlib import Path
from typing import Dict, List, Set

import yaml

LEVELS = {"none", "read_only", "read_write", "workspace_first"}
CANONICAL_RE = re.compile(r"workspace/businesses/\{slug\}/([A-Za-z0-9_./-]+\.ya?ml)")
TEMPLATE_RE = re.compile(r"workspace/_templates/([A-Za-z0-9_./-]+\.ya?ml)")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate squad workspace contract")
    parser.add_argument("squad", help="Squad name (e.g., data) or path (squads/data)")
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Fail if canonical output does not have 1:1 template file",
    )
    parser.add_argument(
        "--report",
        type=str,
        default="",
        help="Optional output YAML report path",
    )
    return parser.parse_args()


def resolve_squad_path(repo_root: Path, squad_arg: str) -> Path:
    candidate = Path(squad_arg)
    if candidate.exists():
        return candidate.resolve()
    return (repo_root / "squads" / squad_arg).resolve()


def read_yaml(path: Path) -> Dict:
    if not path.exists():
        return {}
    raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    return raw if isinstance(raw, dict) else {}


def get_workspace_level(config: Dict) -> str:
    ws = config.get("workspace_integration")
    if isinstance(ws, dict):
        level = ws.get("level")
        if isinstance(level, str):
            return level.strip()
    legacy = config.get("workspace_integration_level")
    if isinstance(legacy, str):
        return legacy.strip()
    return ""


def get_template_namespace(config: Dict) -> str:
    ws = config.get("workspace_integration")
    if isinstance(ws, dict):
        namespace = ws.get("template_namespace")
        if isinstance(namespace, str):
            return namespace.strip().strip("/")
    return ""


def collect_text_files(squad_path: Path) -> List[Path]:
    files: List[Path] = []
    for sub in ("agents", "tasks", "workflows"):
        root = squad_path / sub
        if root.exists():
            files.extend(root.rglob("*"))
    files.append(squad_path / "config.yaml")
    files.append(squad_path / "README.md")
    return [p for p in files if p.is_file() and p.suffix in {".md", ".yaml", ".yml"}]


def main() -> int:
    args = parse_args()
    script_path = Path(__file__).resolve()
    repo_root = script_path.parents[3]
    squad_path = resolve_squad_path(repo_root, args.squad)

    issues: List[str] = []
    warnings: List[str] = []

    if not squad_path.exists():
        print(f"ERROR: squad path not found: {squad_path}", file=sys.stderr)
        return 1

    config = read_yaml(squad_path / "config.yaml")
    level = get_workspace_level(config)
    template_namespace = get_template_namespace(config)

    if level not in LEVELS:
        issues.append("workspace_integration.level missing or invalid")

    text_files = collect_text_files(squad_path)
    canonical_outputs: Set[str] = set()
    template_refs: Set[str] = set()

    has_workspace_ref = False
    for file in text_files:
        try:
            raw = file.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        if "workspace/" in raw:
            has_workspace_ref = True
        canonical_outputs.update(CANONICAL_RE.findall(raw))
        template_refs.update(TEMPLATE_RE.findall(raw))

    if level and level != "none" and not has_workspace_ref:
        issues.append("workspace level != none but no workspace/ references found")

    if level == "workspace_first":
        scripts_dir = squad_path / "scripts"
        has_bootstrap = any(scripts_dir.glob("bootstrap-*-workspace.sh"))
        has_essentials = any(scripts_dir.glob("validate-*-essentials.sh"))
        if not has_bootstrap:
            issues.append("workspace_first requires scripts/bootstrap-*-workspace.sh")
        if not has_essentials:
            issues.append("workspace_first requires scripts/validate-*-essentials.sh")

    template_scoped_outputs: List[str] = []
    if template_namespace:
        template_scoped_outputs = sorted(
            [rel for rel in canonical_outputs if rel.startswith(f"{template_namespace}/")]
        )
    else:
        template_scoped_outputs = sorted(canonical_outputs)

    outputs_to_validate: List[str] = list(template_scoped_outputs)
    if template_namespace and not template_scoped_outputs and canonical_outputs:
        warnings.append(
            "template_namespace does not match detected canonical outputs; "
            "falling back to validate all canonical outputs"
        )
        outputs_to_validate = sorted(canonical_outputs)

    missing_templates: List[str] = []
    for rel in outputs_to_validate:
        expected = repo_root / "workspace" / "_templates" / rel
        if not expected.exists():
            missing_templates.append(str(expected.relative_to(repo_root)))

    if args.strict and missing_templates:
        for item in missing_templates:
            issues.append(f"missing template for canonical output: {item}")
    elif missing_templates:
        for item in missing_templates:
            warnings.append(f"missing template for canonical output: {item}")

    report = {
        "workspace_contract_validation": {
            "generated_at": dt.datetime.now(dt.UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
            "squad_path": str(squad_path.relative_to(repo_root)),
            "workspace_level": level or "undefined",
            "template_namespace": template_namespace or None,
            "canonical_outputs_detected": sorted(canonical_outputs),
            "canonical_outputs_template_scoped": template_scoped_outputs,
            "canonical_outputs_validated": outputs_to_validate,
            "template_refs_detected": sorted(template_refs),
            "missing_templates": missing_templates,
            "issues": issues,
            "warnings": warnings,
            "result": "PASS" if not issues else "FAIL",
        }
    }

    if args.report:
        report_path = (repo_root / args.report).resolve()
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text(
            yaml.safe_dump(report, sort_keys=False, allow_unicode=False),
            encoding="utf-8",
        )

    print(yaml.safe_dump(report, sort_keys=False, allow_unicode=False).strip())
    return 0 if not issues else 1


if __name__ == "__main__":
    raise SystemExit(main())
