#!/usr/bin/env python3
"""
Script: coherence-validator.py
Purpose: Validate systemic coherence across squad-creator configs
Pattern: EXEC-W-001 (Worker - Deterministic)

Validates:
1. Heuristic → Veto Condition mappings (SC_HE_* + AN_HE_*)
2. Axioma dimension → Quality gate integration
3. Executor type assignments (via decision tree criteria)
4. Cross-reference integrity between configs

Source configs:
- config/heuristics.yaml (SC_HE_001-003 + AN_HE_001-003)
- config/veto-conditions.yaml (SC_VC_001-010 + AN_VC_001-005)
- config/axioma-validator.yaml (D1-D10)
- config/quality-gates.yaml (QG-SC-*)
- config/task-anatomy.yaml

Agents covered:
- @pedro-valerio: SC_HE_*, SC_VC_* (build/process)
- @oalanicolas: AN_HE_*, AN_VC_* (extraction/research)

Usage:
    python scripts/coherence-validator.py
    python scripts/coherence-validator.py --output json
    python scripts/coherence-validator.py --strict
    python scripts/coherence-validator.py --fix  # Auto-fix suggestions

Version: 2.0
Last Updated: 2026-02-10
"""

import os
import sys
import yaml
import json
import re
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional, Set, Tuple


# ============================================================================
# CONFIGURATION
# ============================================================================

COHERENCE_RULES = {
    # Each heuristic MUST have at least one veto condition
    "heuristic_veto_coverage": {
        "min_veto_per_heuristic": 1,
        "severity": "error"
    },
    # Each axioma dimension MUST have a threshold
    "axioma_threshold_coverage": {
        "required_dimensions": ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10"],
        "severity": "error"
    },
    # Quality gates MUST reference valid heuristics or axiomas
    "gate_reference_validity": {
        "severity": "warning"
    },
    # Veto conditions MUST have unique codes
    "veto_code_uniqueness": {
        "severity": "error"
    },
    # Executor assignments MUST follow decision tree criteria
    "executor_consistency": {
        "valid_types": ["Worker", "Agent", "Hybrid", "Human"],
        "severity": "warning"
    }
}


# ============================================================================
# UTILITIES
# ============================================================================

def find_config_dir() -> Path:
    """Find the config/ directory relative to script"""
    script_dir = Path(__file__).parent
    config_dir = script_dir.parent / "config"

    if config_dir.exists():
        return config_dir

    # Try from cwd
    cwd = Path.cwd()
    for candidate in [
        cwd / "config",
        cwd / "squads/squad-creator/config",
        Path.home() / "Code/mmos/squads/squad-creator/config"
    ]:
        if candidate.exists():
            return candidate

    raise FileNotFoundError("Could not find config/ directory")


def load_yaml(file_path: Path) -> Optional[Dict]:
    """Load and parse YAML file"""
    if not file_path.exists():
        return None
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f)
    except Exception as e:
        return {"_error": str(e)}


def extract_ids(data: Dict, pattern: str) -> Set[str]:
    """Extract all IDs matching pattern from nested dict"""
    ids = set()

    def recurse(obj, path=""):
        if isinstance(obj, dict):
            for k, v in obj.items():
                if isinstance(k, str) and re.match(pattern, k):
                    ids.add(k)
                if isinstance(v, str) and re.match(pattern, v):
                    ids.add(v)
                recurse(v, f"{path}.{k}")
        elif isinstance(obj, list):
            for item in obj:
                recurse(item, path)
        elif isinstance(obj, str) and re.match(pattern, obj):
            ids.add(obj)

    recurse(data)
    return ids


# ============================================================================
# VALIDATORS
# ============================================================================

def validate_heuristic_veto_coverage(
    heuristics: Dict,
    veto_conditions: Dict
) -> Dict[str, Any]:
    """
    Validate that each heuristic has at least one veto condition.
    Rule: heuristic_veto_coverage

    Structure expected:
    - heuristics.yaml: heuristics_engine.SC_HE_001-003 + AN_HE_001-003
    - Each heuristic has veto_conditions[].maps_to pointing to SC_VC_* or AN_VC_*
    - veto-conditions.yaml: veto_engine.conditions.SC_VC_001-010 + AN_VC_001-005

    Agents:
    - @pedro-valerio: SC_HE_* → SC_VC_*
    - @oalanicolas: AN_HE_* → AN_VC_*
    """
    result = {
        "rule": "heuristic_veto_coverage",
        "passed": True,
        "checks": [],
        "issues": [],
        "suggestions": []
    }

    if not heuristics or not veto_conditions:
        result["checks"].append({
            "status": "skip",
            "message": "Missing heuristics.yaml or veto-conditions.yaml"
        })
        return result

    # Extract heuristic IDs from heuristics_engine (SC_HE_* + AN_HE_*)
    heuristic_ids = set()
    heuristics_with_veto_mapping = set()

    # Try heuristics_engine root (actual structure)
    heuristics_engine = heuristics.get("heuristics_engine", {})

    for key, value in heuristics_engine.items():
        # Match both SC_HE_* and AN_HE_*
        if key.startswith("SC_HE_") or key.startswith("AN_HE_"):
            heuristic_ids.add(key)
            # Check if this heuristic has veto_conditions mapping
            if isinstance(value, dict):
                veto_conds = value.get("veto_conditions", [])
                if isinstance(veto_conds, list) and len(veto_conds) > 0:
                    # Check if any veto condition has maps_to
                    for vc in veto_conds:
                        if isinstance(vc, dict) and vc.get("maps_to"):
                            heuristics_with_veto_mapping.add(key)
                            break

    # Fallback: try legacy structure (heuristics root)
    if not heuristic_ids:
        heuristics_data = heuristics.get("heuristics", {})
        if isinstance(heuristics_data, dict):
            for key in heuristics_data.keys():
                if key.startswith("SC_HE_") or key.startswith("AN_HE_"):
                    heuristic_ids.add(key)

    # Extract veto IDs from veto_engine.conditions (SC_VC_* + AN_VC_*)
    veto_ids = set()
    veto_engine = veto_conditions.get("veto_engine", {})
    conditions = veto_engine.get("conditions", {})

    for key in conditions.keys():
        # Match both SC_VC_* and AN_VC_*
        if key.startswith("SC_VC_") or key.startswith("AN_VC_"):
            veto_ids.add(key)

    # Fallback: try legacy structure
    if not veto_ids:
        veto_data = veto_conditions.get("veto_conditions", {})
        if isinstance(veto_data, dict):
            for key in veto_data.keys():
                if key.startswith("SC_VC_") or key.startswith("AN_VC_"):
                    veto_ids.add(key)

    # Check coverage - each heuristic should have at least one veto mapping
    uncovered = heuristic_ids - heuristics_with_veto_mapping

    if uncovered and len(heuristic_ids) > 0:
        result["passed"] = False
        for h_id in sorted(uncovered):
            result["issues"].append({
                "code": "COH-HV-001",
                "severity": "error",
                "message": f"Heuristic {h_id} has no veto_conditions.maps_to",
                "heuristic_id": h_id
            })
            result["suggestions"].append(f"Add veto_conditions with maps_to for {h_id}")

    # Validate that mapped vetos actually exist
    for key, value in heuristics_engine.items():
        # Match both SC_HE_* and AN_HE_*
        if (key.startswith("SC_HE_") or key.startswith("AN_HE_")) and isinstance(value, dict):
            veto_conds = value.get("veto_conditions", [])
            if isinstance(veto_conds, list):
                for vc in veto_conds:
                    if isinstance(vc, dict):
                        maps_to = vc.get("maps_to")
                        if maps_to and maps_to not in veto_ids:
                            result["passed"] = False
                            result["issues"].append({
                                "code": "COH-HV-002",
                                "severity": "error",
                                "message": f"Heuristic {key} maps to non-existent veto {maps_to}",
                                "heuristic_id": key,
                                "missing_veto": maps_to
                            })

    result["checks"].append({
        "status": "pass" if result["passed"] else "fail",
        "message": f"Heuristics: {len(heuristic_ids)}, With veto mapping: {len(heuristics_with_veto_mapping)}, Veto conditions: {len(veto_ids)}",
        "heuristics_found": sorted(list(heuristic_ids)),
        "vetos_found": sorted(list(veto_ids)),
        "coverage": len(heuristics_with_veto_mapping) / max(len(heuristic_ids), 1)
    })

    return result


def validate_axioma_threshold_coverage(
    axioma_validator: Dict
) -> Dict[str, Any]:
    """
    Validate that all 10 axioma dimensions have thresholds.
    Rule: axioma_threshold_coverage
    """
    result = {
        "rule": "axioma_threshold_coverage",
        "passed": True,
        "checks": [],
        "issues": [],
        "suggestions": []
    }

    if not axioma_validator:
        result["checks"].append({
            "status": "skip",
            "message": "Missing axioma-validator.yaml"
        })
        return result

    required = COHERENCE_RULES["axioma_threshold_coverage"]["required_dimensions"]

    # Find dimensions
    found_dimensions = set()
    dimensions_data = axioma_validator.get("axioma_validator", {}).get("dimensions", {})

    if isinstance(dimensions_data, dict):
        for key, value in dimensions_data.items():
            # Match D1_*, D2_*, etc (e.g., D1_truthfulness)
            if re.match(r"D\d+_", key):
                # Extract dimension number
                dim_match = re.match(r"(D\d+)", key)
                if dim_match:
                    found_dimensions.add(dim_match.group(1))
            # Also check for "id" field inside dimension
            if isinstance(value, dict) and "id" in value:
                found_dimensions.add(value["id"])

    # Also check for dimensions array
    if isinstance(dimensions_data, list):
        for d in dimensions_data:
            if isinstance(d, dict) and "id" in d:
                found_dimensions.add(d["id"])

    missing = set(required) - found_dimensions

    if missing:
        result["passed"] = False
        for dim in missing:
            result["issues"].append({
                "code": "COH-AX-001",
                "severity": "error",
                "message": f"Missing axioma dimension: {dim}",
                "dimension": dim
            })

    result["checks"].append({
        "status": "pass" if result["passed"] else "fail",
        "message": f"Dimensions defined: {len(found_dimensions)}/{len(required)}",
        "found": list(found_dimensions),
        "missing": list(missing) if missing else []
    })

    return result


def validate_gate_reference_validity(
    quality_gates: Dict,
    heuristics: Dict,
    axioma_validator: Dict
) -> Dict[str, Any]:
    """
    Validate that quality gates reference valid heuristics or axiomas.
    Rule: gate_reference_validity
    """
    result = {
        "rule": "gate_reference_validity",
        "passed": True,
        "checks": [],
        "issues": [],
        "suggestions": []
    }

    if not quality_gates:
        result["checks"].append({
            "status": "skip",
            "message": "Missing quality-gates.yaml"
        })
        return result

    # Collect valid references
    valid_heuristics = extract_ids(heuristics or {}, r"SC_HE_\d+")
    valid_axiomas = extract_ids(axioma_validator or {}, r"D\d+")
    valid_refs = valid_heuristics | valid_axiomas

    # Check gate references
    gates_data = quality_gates.get("quality_gates", {}).get("gates", [])
    if isinstance(gates_data, dict):
        gates_data = list(gates_data.values())

    invalid_refs = []
    for gate in gates_data:
        if isinstance(gate, dict):
            # Check heuristic_ref, axioma_ref, references fields
            refs = []
            for ref_field in ["heuristic_ref", "axioma_ref", "heuristic", "axioma", "references"]:
                ref_value = gate.get(ref_field)
                if isinstance(ref_value, str):
                    refs.append(ref_value)
                elif isinstance(ref_value, list):
                    refs.extend(ref_value)

            for ref in refs:
                if ref and not any(ref.startswith(valid) for valid in valid_refs):
                    # Check if it looks like an ID that should be validated
                    if re.match(r"(SC_|D\d|HO-)", ref):
                        invalid_refs.append({
                            "gate": gate.get("id", gate.get("code", "unknown")),
                            "invalid_ref": ref
                        })

    if invalid_refs:
        result["passed"] = False
        for inv in invalid_refs:
            result["issues"].append({
                "code": "COH-GR-001",
                "severity": "warning",
                "message": f"Gate {inv['gate']} references invalid: {inv['invalid_ref']}",
                "gate_id": inv["gate"],
                "invalid_reference": inv["invalid_ref"]
            })

    result["checks"].append({
        "status": "pass" if result["passed"] else "warn",
        "message": f"Invalid references found: {len(invalid_refs)}"
    })

    return result


def validate_veto_code_uniqueness(
    veto_conditions: Dict
) -> Dict[str, Any]:
    """
    Validate that veto condition codes are unique.
    Rule: veto_code_uniqueness

    Structure expected:
    - veto_engine.conditions.SC_VC_001-010 (Pedro Valério)
    - veto_engine.conditions.AN_VC_001-005 (OalaNicolas)
    """
    result = {
        "rule": "veto_code_uniqueness",
        "passed": True,
        "checks": [],
        "issues": [],
        "suggestions": []
    }

    if not veto_conditions:
        result["checks"].append({
            "status": "skip",
            "message": "Missing veto-conditions.yaml"
        })
        return result

    # Extract all veto codes from veto_engine.conditions
    veto_codes = []

    # Try veto_engine.conditions root (actual structure)
    veto_engine = veto_conditions.get("veto_engine", {})
    conditions = veto_engine.get("conditions", {})

    if isinstance(conditions, dict):
        for key in conditions.keys():
            # Match both SC_VC_* and AN_VC_*
            if key.startswith("SC_VC_") or key.startswith("AN_VC_"):
                veto_codes.append(key)

    # Fallback: try legacy structure
    if not veto_codes:
        veto_data = veto_conditions.get("veto_conditions", {})
        if isinstance(veto_data, list):
            for v in veto_data:
                if isinstance(v, dict):
                    code = v.get("code", v.get("id"))
                    if code:
                        veto_codes.append(code)
        elif isinstance(veto_data, dict):
            veto_codes = list(veto_data.keys())

    # Find duplicates
    seen = set()
    duplicates = []
    for code in veto_codes:
        if code in seen:
            duplicates.append(code)
        seen.add(code)

    if duplicates:
        result["passed"] = False
        for dup in duplicates:
            result["issues"].append({
                "code": "COH-VC-001",
                "severity": "error",
                "message": f"Duplicate veto code: {dup}",
                "veto_code": dup
            })
            result["suggestions"].append(f"Rename duplicate veto code: {dup}")

    # Validate we found something
    if len(seen) == 0:
        result["passed"] = False
        result["issues"].append({
            "code": "COH-VC-002",
            "severity": "error",
            "message": "No veto conditions found in veto_engine.conditions",
        })
        result["suggestions"].append("Check YAML structure: expected veto_engine.conditions.SC_VC_*")

    result["checks"].append({
        "status": "pass" if result["passed"] else "fail",
        "message": f"Unique veto codes: {len(seen)}, Duplicates: {len(duplicates)}",
        "veto_codes_found": sorted(list(seen))
    })

    return result


def validate_executor_consistency(
    task_anatomy: Dict
) -> Dict[str, Any]:
    """
    Validate executor type assignments follow decision tree criteria.
    Rule: executor_consistency
    """
    result = {
        "rule": "executor_consistency",
        "passed": True,
        "checks": [],
        "issues": [],
        "suggestions": []
    }

    if not task_anatomy:
        result["checks"].append({
            "status": "skip",
            "message": "Missing task-anatomy.yaml"
        })
        return result

    valid_types = COHERENCE_RULES["executor_consistency"]["valid_types"]

    # Check executor_type field definitions
    fields = task_anatomy.get("task_anatomy", {}).get("fields", {})
    if isinstance(fields, list):
        for field in fields:
            if isinstance(field, dict) and field.get("name") == "executor_type":
                allowed = field.get("allowed_values", field.get("enum", []))
                invalid = set(allowed) - set(valid_types)
                if invalid:
                    result["passed"] = False
                    result["issues"].append({
                        "code": "COH-EX-001",
                        "severity": "warning",
                        "message": f"Invalid executor types defined: {invalid}",
                        "invalid_types": list(invalid)
                    })

    result["checks"].append({
        "status": "pass" if result["passed"] else "warn",
        "message": f"Valid executor types: {valid_types}"
    })

    return result


def validate_cross_references(
    heuristics: Dict,
    veto_conditions: Dict,
    axioma_validator: Dict,
    quality_gates: Dict,
    task_anatomy: Dict
) -> Dict[str, Any]:
    """
    Validate all cross-references between configs are valid.
    Comprehensive integrity check.

    Structure expected:
    - heuristics_engine.SC_HE_001-003 + AN_HE_001-003
    - veto_engine.conditions.SC_VC_001-010 + AN_VC_001-005
    - axioma_validator.dimensions.D*_*
    - quality_gates.gates.QG_SC_*

    Agents:
    - @pedro-valerio: SC_HE_*, SC_VC_*
    - @oalanicolas: AN_HE_*, AN_VC_*
    """
    result = {
        "rule": "cross_reference_integrity",
        "passed": True,
        "checks": [],
        "issues": [],
        "suggestions": [],
        "reference_map": {}
    }

    # Extract IDs from actual structure
    all_ids = {
        "heuristics": set(),
        "veto_conditions": set(),
        "axiomas": set(),
        "gates": set(),
    }

    # Heuristics: heuristics_engine (SC_HE_* + AN_HE_*)
    if heuristics:
        heuristics_engine = heuristics.get("heuristics_engine", {})
        for key in heuristics_engine.keys():
            # Match both SC_HE_* and AN_HE_*
            if key.startswith("SC_HE_") or key.startswith("AN_HE_"):
                all_ids["heuristics"].add(key)

    # Veto conditions: veto_engine.conditions (SC_VC_* + AN_VC_*)
    if veto_conditions:
        veto_engine = veto_conditions.get("veto_engine", {})
        conditions = veto_engine.get("conditions", {})
        for key in conditions.keys():
            # Match both SC_VC_* and AN_VC_*
            if key.startswith("SC_VC_") or key.startswith("AN_VC_"):
                all_ids["veto_conditions"].add(key)

    # Axiomas: axioma_validator.dimensions.D*_*
    if axioma_validator:
        av = axioma_validator.get("axioma_validator", {})
        dimensions = av.get("dimensions", {})
        for key in dimensions.keys():
            if re.match(r"D\d+_", key):
                # Extract D1, D2, etc.
                dim_match = re.match(r"(D\d+)", key)
                if dim_match:
                    all_ids["axiomas"].add(dim_match.group(1))

    # Quality gates: quality_gates.gates.QG_SC_* (extract id field, not key)
    if quality_gates:
        qg = quality_gates.get("quality_gates", {})
        gates = qg.get("gates", {})
        for key, value in gates.items():
            if key.startswith("QG_SC_") or key.startswith("QG-SC-"):
                # Prefer the id field if present (e.g., "QG-SC-1.1")
                if isinstance(value, dict) and "id" in value:
                    all_ids["gates"].add(value["id"])
                else:
                    all_ids["gates"].add(key)

    result["reference_map"] = {k: sorted(list(v)) for k, v in all_ids.items()}

    # Calculate totals
    total_refs = sum(len(v) for v in all_ids.values())

    # Validate minimum counts (updated for SC_* + AN_* patterns)
    # SC_HE_001-003 + AN_HE_001-009 = 12 heuristics (3 SC + 9 AN)
    # SC_VC_001-010 + AN_VC_001-008 = 18 veto conditions (10 SC + 8 AN)
    expected_minimums = {
        "heuristics": 12,       # 3 SC_HE + 9 AN_HE
        "veto_conditions": 18,  # 10 SC_VC + 8 AN_VC
        "axiomas": 10,
        "gates": 10,
    }

    for category, minimum in expected_minimums.items():
        found = len(all_ids[category])
        if found < minimum:
            result["passed"] = False
            result["issues"].append({
                "code": f"COH-CR-{category[:2].upper()}",
                "severity": "warning",
                "message": f"{category}: found {found}, expected >= {minimum}",
                "found": found,
                "expected": minimum
            })

    result["checks"].append({
        "status": "pass" if result["passed"] else "warn",
        "message": f"Total unique IDs across configs: {total_refs}",
        "breakdown": {k: len(v) for k, v in all_ids.items()}
    })

    return result


# ============================================================================
# MAIN ORCHESTRATOR
# ============================================================================

def run_coherence_validation(config_dir: Path, strict: bool = False) -> Dict[str, Any]:
    """Run all coherence validations"""
    results = {
        "config_dir": str(config_dir),
        "timestamp": datetime.now().isoformat(),
        "validator": "coherence-validator.py",
        "strict_mode": strict,
        "configs_loaded": {},
        "validations": [],
        "summary": {
            "total_rules": 0,
            "passed": 0,
            "failed": 0,
            "warnings": 0,
            "skipped": 0
        }
    }

    # Load all configs
    config_files = {
        "heuristics": "heuristics.yaml",
        "veto_conditions": "veto-conditions.yaml",
        "axioma_validator": "axioma-validator.yaml",
        "quality_gates": "quality-gates.yaml",
        "task_anatomy": "task-anatomy.yaml"
    }

    configs = {}
    for key, filename in config_files.items():
        path = config_dir / filename
        data = load_yaml(path)
        configs[key] = data
        results["configs_loaded"][key] = {
            "file": filename,
            "exists": path.exists(),
            "valid": data is not None and "_error" not in (data or {})
        }

    # Run validations
    validations = [
        validate_heuristic_veto_coverage(
            configs["heuristics"],
            configs["veto_conditions"]
        ),
        validate_axioma_threshold_coverage(
            configs["axioma_validator"]
        ),
        validate_gate_reference_validity(
            configs["quality_gates"],
            configs["heuristics"],
            configs["axioma_validator"]
        ),
        validate_veto_code_uniqueness(
            configs["veto_conditions"]
        ),
        validate_executor_consistency(
            configs["task_anatomy"]
        ),
        validate_cross_references(
            configs["heuristics"],
            configs["veto_conditions"],
            configs["axioma_validator"],
            configs["quality_gates"],
            configs["task_anatomy"]
        )
    ]

    for v in validations:
        results["validations"].append(v)
        results["summary"]["total_rules"] += 1

        if v.get("checks") and v["checks"][0].get("status") == "skip":
            results["summary"]["skipped"] += 1
        elif v["passed"]:
            results["summary"]["passed"] += 1
        else:
            # Check severity
            has_error = any(i.get("severity") == "error" for i in v.get("issues", []))
            if has_error:
                results["summary"]["failed"] += 1
            else:
                results["summary"]["warnings"] += 1

    # Final status
    if strict:
        results["status"] = "PASS" if results["summary"]["failed"] == 0 and results["summary"]["warnings"] == 0 else "FAIL"
    else:
        results["status"] = "PASS" if results["summary"]["failed"] == 0 else "FAIL"

    return results


def print_report(results: Dict[str, Any]) -> None:
    """Print human-readable report"""
    print("\n" + "=" * 70)
    print("COHERENCE VALIDATOR - Squad-Creator Configs")
    print("=" * 70)
    print(f"Config dir: {results['config_dir']}")
    print(f"Strict mode: {results['strict_mode']}")
    print()

    # Configs loaded
    print("CONFIGS LOADED:")
    for name, info in results["configs_loaded"].items():
        status = "✓" if info["valid"] else ("⚠ missing" if not info["exists"] else "✗ invalid")
        print(f"  {status} {info['file']}")
    print()

    # Validations
    print("VALIDATIONS:")
    for v in results["validations"]:
        rule = v["rule"]
        passed = v["passed"]
        status_icon = "✓" if passed else "✗"

        # Get check summary
        check_msg = ""
        if v.get("checks"):
            check_msg = v["checks"][0].get("message", "")

        print(f"  {status_icon} {rule}")
        if check_msg:
            print(f"      {check_msg}")

        # Issues
        for issue in v.get("issues", []):
            severity_icon = "✗" if issue["severity"] == "error" else "⚠"
            print(f"      {severity_icon} [{issue['code']}] {issue['message']}")

        # Suggestions
        for sug in v.get("suggestions", []):
            print(f"      💡 {sug}")
    print()

    # Summary
    s = results["summary"]
    print("=" * 70)
    print(f"STATUS: {'✓ PASS' if results['status'] == 'PASS' else '✗ FAIL'}")
    print(f"  Rules: {s['total_rules']} | Passed: {s['passed']} | Failed: {s['failed']} | Warnings: {s['warnings']} | Skipped: {s['skipped']}")
    print("=" * 70)


def main():
    parser = argparse.ArgumentParser(
        description="Validate coherence across squad-creator configs"
    )
    parser.add_argument("--output", "-o", choices=["text", "json"], default="text",
                        help="Output format")
    parser.add_argument("--strict", action="store_true",
                        help="Treat warnings as errors")
    parser.add_argument("--fix", action="store_true",
                        help="Show auto-fix suggestions")
    parser.add_argument("--config-dir", type=str,
                        help="Path to config directory")

    args = parser.parse_args()

    try:
        if args.config_dir:
            config_dir = Path(args.config_dir)
        else:
            config_dir = find_config_dir()
    except FileNotFoundError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(2)

    results = run_coherence_validation(config_dir, args.strict)

    if args.output == "json":
        print(json.dumps(results, indent=2))
    else:
        print_report(results)

    # Exit code
    sys.exit(0 if results["status"] == "PASS" else 1)


if __name__ == "__main__":
    main()
