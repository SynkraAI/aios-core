#!/usr/bin/env python3
"""
Script: checklist_validator.py
Purpose: Validate checklist structure and completeness
Operations: 15+ deterministic checks

Validates:
- Checklist has proper YAML structure
- Check items have required fields (id, check, type)
- Type values are valid (blocking, recommended, warning, etc.)
- IDs are unique within the checklist
- Checklist has metadata (id, version, purpose)

Usage:
    python scripts/checklist_validator.py squads/{squad-name}/checklists/{checklist}.md
    python scripts/checklist_validator.py squads/{squad-name}/checklists/ --all
    python scripts/checklist_validator.py squads/{squad-name}/checklists/ --output json
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict


# Valid check types
VALID_CHECK_TYPES = [
    "blocking",
    "recommended",
    "warning",
    "info",
    "critical",
    "optional",
]

# Required fields for check items
CHECK_REQUIRED_FIELDS = ["id", "check", "type"]

# Recommended fields for check items
CHECK_RECOMMENDED_FIELDS = ["validation", "section"]


@dataclass
class CheckItem:
    """Represents a single check item"""
    id: str
    check: str
    type: str
    validation: Optional[str] = None
    section: Optional[str] = None
    raw_data: Dict = None


@dataclass
class ChecklistValidation:
    """Result of validating a checklist"""
    file_path: str
    valid: bool
    has_metadata: bool
    metadata: Dict[str, Any]
    check_count: int
    checks_by_type: Dict[str, int]
    issues: List[Dict[str, str]]
    warnings: List[Dict[str, str]]
    checks: List[CheckItem]


def extract_yaml_blocks(content: str) -> List[Tuple[str, int]]:
    """Extract all YAML blocks from markdown content."""
    blocks = []
    pattern = r'```yaml\s*\n(.*?)```'

    for match in re.finditer(pattern, content, re.DOTALL):
        yaml_content = match.group(1)
        line_num = content[:match.start()].count('\n') + 1
        blocks.append((yaml_content, line_num))

    return blocks


def parse_yaml_safely(content: str) -> Optional[Dict]:
    """Parse YAML content safely."""
    try:
        import yaml
        return yaml.safe_load(content)
    except Exception:
        return None


def extract_checks_from_yaml(yaml_data: Dict, source_block: int = 0) -> List[CheckItem]:
    """Extract check items from parsed YAML data."""
    checks = []

    if not isinstance(yaml_data, dict):
        return checks

    # Look for check arrays in various formats
    for key, value in yaml_data.items():
        if isinstance(value, list):
            for item in value:
                if isinstance(item, dict) and 'id' in item and 'check' in item:
                    checks.append(CheckItem(
                        id=str(item.get('id', '')),
                        check=str(item.get('check', '')),
                        type=str(item.get('type', 'unknown')),
                        validation=item.get('validation'),
                        section=item.get('section'),
                        raw_data=item
                    ))

    return checks


def extract_checklist_metadata(yaml_data: Dict) -> Dict[str, Any]:
    """Extract checklist metadata from YAML."""
    metadata = {}

    if not isinstance(yaml_data, dict):
        return metadata

    # Check for 'checklist' key
    if 'checklist' in yaml_data and isinstance(yaml_data['checklist'], dict):
        metadata = yaml_data['checklist'].copy()
    else:
        # Look for metadata fields at top level
        for field in ['id', 'version', 'purpose', 'created', 'updated', 'mode']:
            if field in yaml_data:
                metadata[field] = yaml_data[field]

    return metadata


def validate_check_item(check: CheckItem) -> Tuple[List[Dict], List[Dict]]:
    """Validate a single check item."""
    issues = []
    warnings = []

    # Check required fields
    if not check.id:
        issues.append({
            "code": "CKL-CHK-001",
            "message": "Check missing 'id' field",
            "severity": "error"
        })

    if not check.check:
        issues.append({
            "code": "CKL-CHK-002",
            "message": f"Check '{check.id}' missing 'check' description",
            "severity": "error"
        })

    # Validate type
    if check.type not in VALID_CHECK_TYPES and check.type != 'unknown':
        warnings.append({
            "code": "CKL-CHK-003",
            "message": f"Check '{check.id}' has non-standard type: {check.type}",
            "severity": "warning"
        })

    # Recommend validation field for blocking checks
    if check.type == 'blocking' and not check.validation:
        warnings.append({
            "code": "CKL-CHK-004",
            "message": f"Blocking check '{check.id}' should have 'validation' field",
            "severity": "warning"
        })

    return issues, warnings


def validate_checklist_file(file_path: Path) -> ChecklistValidation:
    """Validate a single checklist file."""
    issues = []
    warnings = []
    all_checks = []
    metadata = {}

    # Check file exists
    if not file_path.exists():
        return ChecklistValidation(
            file_path=str(file_path),
            valid=False,
            has_metadata=False,
            metadata={},
            check_count=0,
            checks_by_type={},
            issues=[{"code": "CKL-FILE-001", "message": "File not found", "severity": "error"}],
            warnings=[],
            checks=[]
        )

    # Read content
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return ChecklistValidation(
            file_path=str(file_path),
            valid=False,
            has_metadata=False,
            metadata={},
            check_count=0,
            checks_by_type={},
            issues=[{"code": "CKL-FILE-002", "message": f"Could not read file: {e}", "severity": "error"}],
            warnings=[],
            checks=[]
        )

    # Extract YAML blocks
    yaml_blocks = extract_yaml_blocks(content)

    if not yaml_blocks:
        warnings.append({
            "code": "CKL-YAML-001",
            "message": "No YAML blocks found in checklist",
            "severity": "warning"
        })

    # Process each YAML block
    for yaml_content, line_num in yaml_blocks:
        parsed = parse_yaml_safely(yaml_content)

        if parsed is None:
            issues.append({
                "code": "CKL-YAML-002",
                "message": f"Invalid YAML syntax at line {line_num}",
                "severity": "error"
            })
            continue

        # Extract metadata from first block with 'checklist' key
        if not metadata:
            block_metadata = extract_checklist_metadata(parsed)
            if block_metadata:
                metadata = block_metadata

        # Extract checks
        checks = extract_checks_from_yaml(parsed, line_num)
        all_checks.extend(checks)

    # Check for duplicate IDs
    ids_seen = set()
    for check in all_checks:
        if check.id in ids_seen:
            issues.append({
                "code": "CKL-DUP-001",
                "message": f"Duplicate check ID: {check.id}",
                "severity": "error"
            })
        ids_seen.add(check.id)

    # Validate each check
    for check in all_checks:
        check_issues, check_warnings = validate_check_item(check)
        issues.extend(check_issues)
        warnings.extend(check_warnings)

    # Check metadata
    has_metadata = bool(metadata.get('id') or metadata.get('purpose'))

    if not has_metadata:
        warnings.append({
            "code": "CKL-META-001",
            "message": "Checklist missing metadata (id, purpose)",
            "severity": "warning"
        })

    # Count checks by type
    checks_by_type = {}
    for check in all_checks:
        check_type = check.type
        checks_by_type[check_type] = checks_by_type.get(check_type, 0) + 1

    # Determine overall validity
    valid = len([i for i in issues if i["severity"] == "error"]) == 0

    return ChecklistValidation(
        file_path=str(file_path),
        valid=valid,
        has_metadata=has_metadata,
        metadata=metadata,
        check_count=len(all_checks),
        checks_by_type=checks_by_type,
        issues=issues,
        warnings=warnings,
        checks=all_checks
    )


def validate_checklist_directory(dir_path: Path) -> Dict[str, Any]:
    """Validate all checklists in a directory."""
    results = {
        "directory": str(dir_path),
        "total_files": 0,
        "valid_files": 0,
        "total_checks": 0,
        "checks_by_type": {},
        "files": [],
        "summary": {}
    }

    if not dir_path.exists():
        results["error"] = f"Directory not found: {dir_path}"
        return results

    # Find all markdown files
    for file_path in sorted(dir_path.glob("*.md")):
        if file_path.name.lower() == 'readme.md':
            continue

        validation = validate_checklist_file(file_path)
        results["total_files"] += 1

        if validation.valid:
            results["valid_files"] += 1

        results["total_checks"] += validation.check_count

        # Aggregate checks by type
        for check_type, count in validation.checks_by_type.items():
            results["checks_by_type"][check_type] = \
                results["checks_by_type"].get(check_type, 0) + count

        # Add file result (without full checks list for brevity)
        results["files"].append({
            "file": file_path.name,
            "valid": validation.valid,
            "check_count": validation.check_count,
            "checks_by_type": validation.checks_by_type,
            "issues_count": len(validation.issues),
            "warnings_count": len(validation.warnings),
        })

    # Summary
    results["summary"] = {
        "total_files": results["total_files"],
        "valid_files": results["valid_files"],
        "invalid_files": results["total_files"] - results["valid_files"],
        "total_checks": results["total_checks"],
        "blocking_checks": results["checks_by_type"].get("blocking", 0),
        "recommended_checks": results["checks_by_type"].get("recommended", 0),
    }

    return results


def print_file_report(validation: ChecklistValidation) -> None:
    """Print validation report for a single file."""
    status = "✓ VALID" if validation.valid else "✗ INVALID"
    print(f"\nChecklist Validation: {validation.file_path}")
    print("=" * 50)
    print(f"Status: {status}")
    print(f"Has Metadata: {'Yes' if validation.has_metadata else 'No'}")
    print(f"Total Checks: {validation.check_count}")

    if validation.checks_by_type:
        print("\nChecks by Type:")
        for check_type, count in sorted(validation.checks_by_type.items()):
            print(f"  {check_type}: {count}")

    if validation.issues:
        print("\nIssues:")
        for issue in validation.issues:
            print(f"  ✗ [{issue['code']}] {issue['message']}")

    if validation.warnings:
        print("\nWarnings:")
        for warning in validation.warnings:
            print(f"  ⚠ [{warning['code']}] {warning['message']}")


def print_directory_report(results: Dict[str, Any]) -> None:
    """Print validation report for a directory."""
    print(f"\nChecklist Directory Validation: {results['directory']}")
    print("=" * 60)

    if "error" in results:
        print(f"ERROR: {results['error']}")
        return

    s = results["summary"]
    print(f"Files: {s['valid_files']}/{s['total_files']} valid")
    print(f"Total Checks: {s['total_checks']}")
    print(f"  Blocking: {s['blocking_checks']}")
    print(f"  Recommended: {s['recommended_checks']}")

    print("\nPer-File Results:")
    print("-" * 60)
    for file_result in results["files"]:
        status = "✓" if file_result["valid"] else "✗"
        print(f"  {status} {file_result['file']}: {file_result['check_count']} checks, "
              f"{file_result['issues_count']} issues, {file_result['warnings_count']} warnings")


def main():
    parser = argparse.ArgumentParser(description="Validate checklist files")
    parser.add_argument("path", help="Path to checklist file or directory")
    parser.add_argument("--all", "-a", action="store_true",
                        help="Validate all checklists in directory")
    parser.add_argument("--output", choices=["text", "json"], default="text",
                        help="Output format")
    parser.add_argument("--detailed", "-d", action="store_true",
                        help="Show detailed check information")

    args = parser.parse_args()
    path = Path(args.path)

    if args.all or path.is_dir():
        # Validate directory
        dir_path = path if path.is_dir() else path.parent
        results = validate_checklist_directory(dir_path)

        if args.output == "json":
            print(json.dumps(results, indent=2))
        else:
            print_directory_report(results)

        # Exit code based on invalid files
        sys.exit(0 if results["summary"].get("invalid_files", 0) == 0 else 1)
    else:
        # Validate single file
        validation = validate_checklist_file(path)

        if args.output == "json":
            # Convert to dict, excluding checks list unless detailed
            output = {
                "file_path": validation.file_path,
                "valid": validation.valid,
                "has_metadata": validation.has_metadata,
                "metadata": validation.metadata,
                "check_count": validation.check_count,
                "checks_by_type": validation.checks_by_type,
                "issues": validation.issues,
                "warnings": validation.warnings,
            }
            if args.detailed:
                output["checks"] = [asdict(c) for c in validation.checks]
            print(json.dumps(output, indent=2))
        else:
            print_file_report(validation)

        sys.exit(0 if validation.valid else 1)


if __name__ == "__main__":
    main()
