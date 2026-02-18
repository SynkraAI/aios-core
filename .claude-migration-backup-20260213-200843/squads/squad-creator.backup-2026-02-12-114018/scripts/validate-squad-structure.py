#!/usr/bin/env python3
"""
Validate Squad Structure - Worker Script (Deterministic)

Phases 0-2 of validate-squad.md - 100% deterministic operations:
- Phase 0: Type Detection (scan config, count agents, check patterns)
- Phase 1: Structure Validation (files exist, YAML valid, required fields)
- Phase 2: Coverage Analysis (checklist coverage, orphan detection, data usage)

For full validation including quality analysis (Phases 3-6), use:
  ./scripts/validate-squad.sh {squad-name}

Usage:
    python scripts/validate-squad-structure.py {squad-name}
    python scripts/validate-squad-structure.py {squad-name} --output json
    python scripts/validate-squad-structure.py {squad-name} --verbose

Pattern: EXEC-W-001 (Worker - Deterministic)
"""

import os
import sys
import yaml
import json
import re
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple


# ============================================================================
# CONFIGURATION
# ============================================================================

THRESHOLDS = {
    "checklist_coverage_min": 0.30,  # 30%
    "orphan_tasks_max": 2,
    "data_usage_min": 0.50,  # 50%
    "security_patterns": {
        "api_key": r"(api[_-]?key|apikey)\s*[:=]\s*['\"][^'\"\$\{]{8,}",
        "secret": r"(secret|password)\s*[:=]\s*['\"][^'\"\$\{]{8,}",
        "aws_key": r"AKIA[A-Z0-9]{16}",
        "private_key": r"-----BEGIN.*(PRIVATE|RSA|DSA|EC).*KEY-----",
        "db_url": r"(postgres|mysql|mongodb|redis)://[^:]+:[^@]+@",
    }
}


# ============================================================================
# UTILITIES
# ============================================================================

def find_squads_root() -> Path:
    """Find the squads/ directory"""
    current = Path(__file__).parent.parent.parent  # scripts -> squad-creator -> squads
    if current.name == "squads" or (current / "squad-creator").exists():
        return current

    # Try from cwd
    cwd = Path.cwd()
    if (cwd / "squads").exists():
        return cwd / "squads"
    if cwd.name == "squads":
        return cwd

    raise FileNotFoundError("Could not find squads/ directory")


def count_files(directory: Path, patterns: List[str] = ["*.md", "*.yaml", "*.yml"]) -> int:
    """Count files matching patterns"""
    if not directory.exists():
        return 0
    count = 0
    for pattern in patterns:
        count += len(list(directory.glob(pattern)))
    return count


def read_yaml(file_path: Path) -> Optional[Dict]:
    """Read and parse YAML file"""
    if not file_path.exists():
        return None
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f)
    except Exception:
        return None


def grep_in_file(file_path: Path, pattern: str) -> List[str]:
    """Search for pattern in file"""
    if not file_path.exists():
        return []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return re.findall(pattern, content, re.MULTILINE | re.IGNORECASE)
    except Exception:
        return []


# ============================================================================
# PHASE 0: TYPE DETECTION
# ============================================================================

def detect_squad_type(squad_path: Path) -> Dict[str, Any]:
    """Detect squad type: expert, pipeline, or hybrid"""
    result = {
        "detected_type": "general",
        "confidence": 0,
        "signals": {},
        "scoring": {
            "expert": 0,
            "pipeline": 0,
            "hybrid": 0
        }
    }

    agents_dir = squad_path / "agents"
    tasks_dir = squad_path / "tasks"
    workflows_dir = squad_path / "workflows"

    # Count components
    agent_count = count_files(agents_dir, ["*.md"])
    task_count = count_files(tasks_dir, ["*.md"])
    workflow_count = count_files(workflows_dir, ["*.yaml", "*.yml", "*.md"])

    result["signals"]["agent_count"] = agent_count
    result["signals"]["task_count"] = task_count
    result["signals"]["workflow_count"] = workflow_count

    # Expert signals
    voice_dna_count = 0
    if agents_dir.exists():
        for agent_file in agents_dir.glob("*.md"):
            content = agent_file.read_text(encoding='utf-8', errors='ignore')
            if "voice_dna:" in content or "Voice DNA" in content:
                voice_dna_count += 1

    result["signals"]["voice_dna_count"] = voice_dna_count

    # Expert scoring
    if agent_count >= 5:
        result["scoring"]["expert"] += 2
    if voice_dna_count > 0:
        result["scoring"]["expert"] += 3

    # Pipeline scoring
    if workflow_count > 0:
        result["scoring"]["pipeline"] += 3
    if task_count > 0 and agent_count > 0:
        ratio = task_count / max(agent_count, 1)
        result["signals"]["task_agent_ratio"] = round(ratio, 2)
        if ratio > 3:
            result["scoring"]["pipeline"] += 2

    # Check for phase patterns
    phase_count = 0
    if tasks_dir.exists():
        for task_file in tasks_dir.glob("*.md"):
            content = task_file.read_text(encoding='utf-8', errors='ignore')
            if re.search(r"phase|stage|step\s+\d", content, re.IGNORECASE):
                phase_count += 1
    result["signals"]["phase_pattern_files"] = phase_count
    if phase_count > 3:
        result["scoring"]["pipeline"] += 2

    # Hybrid signals
    human_refs = 0
    for md_file in squad_path.rglob("*.md"):
        content = md_file.read_text(encoding='utf-8', errors='ignore')
        if re.search(r"human|manual|executor.*type", content, re.IGNORECASE):
            human_refs += 1
    result["signals"]["human_refs"] = human_refs
    if human_refs > 2:
        result["scoring"]["hybrid"] += 3

    # Determine winner
    max_score = max(result["scoring"].values())
    if result["scoring"]["expert"] == max_score and max_score >= 4:
        result["detected_type"] = "expert"
        result["confidence"] = min(result["scoring"]["expert"], 10)
    elif result["scoring"]["pipeline"] == max_score and max_score >= 4:
        result["detected_type"] = "pipeline"
        result["confidence"] = min(result["scoring"]["pipeline"], 10)
    elif result["scoring"]["hybrid"] >= 3:
        result["detected_type"] = "hybrid"
        result["confidence"] = min(result["scoring"]["hybrid"], 10)
    else:
        result["detected_type"] = "general"
        result["confidence"] = 5

    return result


# ============================================================================
# PHASE 1: STRUCTURE VALIDATION
# ============================================================================

def validate_structure(squad_path: Path) -> Dict[str, Any]:
    """Validate squad structure - Phase 1"""
    result = {
        "passed": True,
        "checks": [],
        "blocking_issues": [],
        "warnings": []
    }

    # T1-CFG-001: config.yaml exists
    config_path = squad_path / "config.yaml"
    if config_path.exists():
        result["checks"].append({"id": "T1-CFG-001", "status": "pass", "message": "config.yaml exists"})

        # T1-CFG-002: Valid YAML
        config = read_yaml(config_path)
        if config:
            result["checks"].append({"id": "T1-CFG-002", "status": "pass", "message": "config.yaml is valid YAML"})

            # T1-CFG-003: Required fields
            required = ["name", "version"]
            for field in required:
                # Check top level or under squad_config/pack
                found = False
                if field in config:
                    found = True
                elif "squad_config" in config and field in config["squad_config"]:
                    found = True
                elif "pack" in config and field in config["pack"]:
                    found = True

                if found:
                    result["checks"].append({"id": f"T1-CFG-003-{field}", "status": "pass", "message": f"Has '{field}' field"})
                else:
                    result["checks"].append({"id": f"T1-CFG-003-{field}", "status": "fail", "message": f"Missing '{field}' field"})
                    result["blocking_issues"].append(f"config.yaml missing required field: {field}")
                    result["passed"] = False
        else:
            result["checks"].append({"id": "T1-CFG-002", "status": "fail", "message": "config.yaml has invalid YAML"})
            result["blocking_issues"].append("config.yaml has invalid YAML syntax")
            result["passed"] = False
    else:
        result["checks"].append({"id": "T1-CFG-001", "status": "fail", "message": "config.yaml not found"})
        result["blocking_issues"].append("config.yaml not found")
        result["passed"] = False

    # T1-ENT-001: Entry agent exists
    agents_dir = squad_path / "agents"
    if agents_dir.exists():
        agent_files = list(agents_dir.glob("*.md"))
        if agent_files:
            result["checks"].append({"id": "T1-ENT-001", "status": "pass", "message": f"Found {len(agent_files)} agents"})
        else:
            result["checks"].append({"id": "T1-ENT-001", "status": "fail", "message": "No agent files found"})
            result["blocking_issues"].append("No agent files in agents/")
            result["passed"] = False
    else:
        result["checks"].append({"id": "T1-DIR-001", "status": "fail", "message": "agents/ directory not found"})
        result["blocking_issues"].append("agents/ directory not found")
        result["passed"] = False

    # T1-SEC: Security scan
    security_issues = []
    for pattern_name, pattern in THRESHOLDS["security_patterns"].items():
        for file in squad_path.rglob("*.md"):
            matches = grep_in_file(file, pattern)
            if matches:
                # Filter out obvious examples/placeholders
                real_matches = [m for m in matches if not any(x in str(m).lower() for x in
                    ["example", "placeholder", "your-", "xxx", "{{", "${"])]
                if real_matches:
                    security_issues.append({
                        "pattern": pattern_name,
                        "file": str(file.relative_to(squad_path)),
                        "count": len(real_matches)
                    })

    if security_issues:
        result["checks"].append({"id": "T1-SEC-001", "status": "fail", "message": f"Found {len(security_issues)} security issues"})
        result["blocking_issues"].extend([f"Security: {i['pattern']} in {i['file']}" for i in security_issues])
        result["passed"] = False
    else:
        result["checks"].append({"id": "T1-SEC-001", "status": "pass", "message": "No security issues found"})

    return result


# ============================================================================
# PHASE 2: COVERAGE ANALYSIS
# ============================================================================

def analyze_coverage(squad_path: Path) -> Dict[str, Any]:
    """Analyze coverage metrics - Phase 2"""
    result = {
        "passed": True,
        "metrics": {},
        "checks": [],
        "warnings": []
    }

    tasks_dir = squad_path / "tasks"
    checklists_dir = squad_path / "checklists"
    data_dir = squad_path / "data"
    agents_dir = squad_path / "agents"

    # T2-COV-001: Checklist coverage
    task_count = count_files(tasks_dir, ["*.md"])
    checklist_count = count_files(checklists_dir, ["*.md"])

    complex_tasks = 0
    if tasks_dir.exists():
        for task_file in tasks_dir.glob("*.md"):
            lines = len(task_file.read_text(encoding='utf-8', errors='ignore').split('\n'))
            if lines > 500:
                complex_tasks += 1

    result["metrics"]["task_count"] = task_count
    result["metrics"]["checklist_count"] = checklist_count
    result["metrics"]["complex_tasks"] = complex_tasks

    if complex_tasks > 0:
        coverage = checklist_count / complex_tasks
        result["metrics"]["checklist_coverage"] = round(coverage, 2)

        if coverage >= THRESHOLDS["checklist_coverage_min"]:
            result["checks"].append({"id": "T2-COV-001", "status": "pass",
                "message": f"Checklist coverage: {coverage:.0%}"})
        else:
            result["checks"].append({"id": "T2-COV-001", "status": "warn",
                "message": f"Low checklist coverage: {coverage:.0%} (min: {THRESHOLDS['checklist_coverage_min']:.0%})"})
            result["warnings"].append(f"Checklist coverage below threshold")
    else:
        result["metrics"]["checklist_coverage"] = 1.0
        result["checks"].append({"id": "T2-COV-001", "status": "pass",
            "message": "No complex tasks requiring checklists"})

    # T2-ORP-001: Orphan task detection
    orphan_tasks = []
    if tasks_dir.exists() and agents_dir.exists():
        # Get all task names
        task_names = {f.stem for f in tasks_dir.glob("*.md") if f.name.lower() not in ["readme.md", "changelog.md"]}

        # Get all tasks referenced in agents
        referenced_tasks = set()
        for agent_file in agents_dir.glob("*.md"):
            content = agent_file.read_text(encoding='utf-8', errors='ignore')
            # Match *task-name or tasks/task-name.md patterns
            refs = re.findall(r'\*([a-z0-9_-]+)|tasks/([a-z0-9_-]+)\.md', content, re.IGNORECASE)
            for ref in refs:
                referenced_tasks.add(ref[0] or ref[1])

        orphan_tasks = list(task_names - referenced_tasks)

    result["metrics"]["orphan_tasks"] = len(orphan_tasks)
    result["metrics"]["orphan_task_names"] = orphan_tasks[:5]  # First 5

    if len(orphan_tasks) <= THRESHOLDS["orphan_tasks_max"]:
        result["checks"].append({"id": "T2-ORP-001", "status": "pass",
            "message": f"Orphan tasks: {len(orphan_tasks)} (max: {THRESHOLDS['orphan_tasks_max']})"})
    else:
        result["checks"].append({"id": "T2-ORP-001", "status": "fail",
            "message": f"Too many orphan tasks: {len(orphan_tasks)}"})
        result["passed"] = False

    # T2-DAT-001: Data file usage
    if data_dir.exists():
        data_files = list(data_dir.glob("*"))
        data_file_names = {f.name for f in data_files if f.is_file()}

        # Check how many are referenced
        referenced_data = set()
        for md_file in squad_path.rglob("*.md"):
            if md_file.parent.name == "data":
                continue
            content = md_file.read_text(encoding='utf-8', errors='ignore')
            for data_name in data_file_names:
                if data_name in content:
                    referenced_data.add(data_name)

        total_data = len(data_file_names)
        used_data = len(referenced_data)

        result["metrics"]["data_files_total"] = total_data
        result["metrics"]["data_files_used"] = used_data

        if total_data > 0:
            usage = used_data / total_data
            result["metrics"]["data_usage"] = round(usage, 2)

            if usage >= THRESHOLDS["data_usage_min"]:
                result["checks"].append({"id": "T2-DAT-001", "status": "pass",
                    "message": f"Data usage: {usage:.0%}"})
            else:
                result["checks"].append({"id": "T2-DAT-001", "status": "warn",
                    "message": f"Low data usage: {usage:.0%}"})
                result["warnings"].append("Some data files are unused")

    return result


# ============================================================================
# MAIN
# ============================================================================

def validate_squad(squad_name: str, verbose: bool = False) -> Dict[str, Any]:
    """Run Phases 0-2 validation"""
    try:
        squads_root = find_squads_root()
    except FileNotFoundError as e:
        return {"error": str(e)}

    squad_path = squads_root / squad_name

    if not squad_path.exists():
        return {"error": f"Squad not found: {squad_name}", "path": str(squad_path)}

    results = {
        "squad_name": squad_name,
        "squad_path": str(squad_path),
        "timestamp": datetime.now().isoformat(),
        "validator": "validate-squad-structure.py (Worker)",
        "phases": {}
    }

    # Phase 0: Type Detection
    results["phases"]["phase_0_type_detection"] = detect_squad_type(squad_path)

    # Phase 1: Structure
    results["phases"]["phase_1_structure"] = validate_structure(squad_path)

    # Phase 2: Coverage
    results["phases"]["phase_2_coverage"] = analyze_coverage(squad_path)

    # Summary
    all_passed = all(p.get("passed", True) for p in results["phases"].values() if isinstance(p, dict))
    total_blocking = sum(len(p.get("blocking_issues", [])) for p in results["phases"].values() if isinstance(p, dict))
    total_warnings = sum(len(p.get("warnings", [])) for p in results["phases"].values() if isinstance(p, dict))

    results["summary"] = {
        "all_phases_passed": all_passed,
        "blocking_issues": total_blocking,
        "warnings": total_warnings,
        "detected_type": results["phases"]["phase_0_type_detection"]["detected_type"],
        "recommendation": "PROCEED to Phase 3-6" if all_passed else "FIX blocking issues before proceeding"
    }

    return results


def print_report(results: Dict[str, Any]) -> None:
    """Print human-readable report"""
    if "error" in results:
        print(f"ERROR: {results['error']}")
        return

    print("\n" + "=" * 60)
    print(f"VALIDATE-SQUAD-STRUCTURE: {results['squad_name']}")
    print("=" * 60)
    print(f"Path: {results['squad_path']}")
    print(f"Validator: {results['validator']}")
    print()

    # Phase 0
    p0 = results["phases"]["phase_0_type_detection"]
    print(f"PHASE 0: Type Detection")
    print(f"  Detected: {p0['detected_type']} (confidence: {p0['confidence']}/10)")
    print(f"  Signals: agents={p0['signals'].get('agent_count', 0)}, "
          f"tasks={p0['signals'].get('task_count', 0)}, "
          f"voice_dna={p0['signals'].get('voice_dna_count', 0)}")
    print()

    # Phase 1
    p1 = results["phases"]["phase_1_structure"]
    status1 = "✓ PASS" if p1["passed"] else "✗ FAIL"
    print(f"PHASE 1: Structure Validation [{status1}]")
    for check in p1["checks"]:
        icon = "✓" if check["status"] == "pass" else ("⚠" if check["status"] == "warn" else "✗")
        print(f"  {icon} [{check['id']}] {check['message']}")
    if p1["blocking_issues"]:
        print(f"  BLOCKING: {p1['blocking_issues']}")
    print()

    # Phase 2
    p2 = results["phases"]["phase_2_coverage"]
    status2 = "✓ PASS" if p2["passed"] else "✗ FAIL"
    print(f"PHASE 2: Coverage Analysis [{status2}]")
    print(f"  Tasks: {p2['metrics'].get('task_count', 0)}, "
          f"Checklists: {p2['metrics'].get('checklist_count', 0)}")
    print(f"  Checklist coverage: {p2['metrics'].get('checklist_coverage', 'N/A')}")
    print(f"  Orphan tasks: {p2['metrics'].get('orphan_tasks', 0)}")
    if p2["warnings"]:
        for w in p2["warnings"]:
            print(f"  ⚠ {w}")
    print()

    # Summary
    summary = results["summary"]
    status_final = "✓ READY" if summary["all_phases_passed"] else "✗ BLOCKED"
    print("=" * 60)
    print(f"SUMMARY: {status_final}")
    print(f"  Type: {summary['detected_type']}")
    print(f"  Blocking issues: {summary['blocking_issues']}")
    print(f"  Warnings: {summary['warnings']}")
    print(f"  Recommendation: {summary['recommendation']}")
    print("=" * 60)


def main():
    parser = argparse.ArgumentParser(
        description="Validate squad structure (Phases 0-2) - Worker script"
    )
    parser.add_argument("squad_name", help="Name of squad to validate")
    parser.add_argument("--output", "-o", choices=["text", "json"], default="text")
    parser.add_argument("--verbose", "-v", action="store_true")

    args = parser.parse_args()

    results = validate_squad(args.squad_name, args.verbose)

    if args.output == "json":
        print(json.dumps(results, indent=2))
    else:
        print_report(results)

    # Exit code
    if "error" in results:
        sys.exit(2)
    elif not results["summary"]["all_phases_passed"]:
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()
