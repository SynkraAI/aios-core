#!/usr/bin/env python3
"""
Script: security_scanner.py
Purpose: Scan squad directory for security issues (secrets, API keys, credentials)
Version: 1.0.0
Ported from: validate-squad.sh check_security()

Usage:
    python scripts/security_scanner.py squads/{squad-name}/
    python scripts/security_scanner.py squads/{squad-name}/ --output json
    python scripts/security_scanner.py squads/{squad-name}/ --strict  # No exclusions

Operations: 15+ security checks
- API keys and tokens
- Cloud credentials (AWS, GCP)
- Private keys (content and files)
- Database URLs with passwords
- Sensitive files (.env, credentials)
"""

import argparse
import json
import os
import re
import sys
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import List, Dict, Optional, Tuple

# =============================================================================
# SECURITY PATTERNS
# =============================================================================

SECURITY_CHECKS = {
    "SEC-001": {
        "name": "API Keys",
        "pattern": r"(api[_-]?key|apikey)\s*[:=]\s*['\"][^'\"\$\{]{8,}",
        "exclude": r"(\{\{|\$\{|process\.env|[Ee]xample|placeholder|grep|pattern|EXAMPLE|sk-1234|your-key|#.*api)",
        "severity": "critical",
        "category": "api_tokens"
    },
    "SEC-002": {
        "name": "Secrets/Passwords",
        "pattern": r"(secret|password)\s*[:=]\s*['\"][^'\"\$\{]{8,}",
        "exclude": r"(\{\{|\$\{|process\.env|[Ee]xample|placeholder|grep|pattern|EXAMPLE|secret_key|your-secret|#.*secret|#.*password|mySecret|super-secret|-secret-|-here)",
        "severity": "critical",
        "category": "api_tokens"
    },
    "SEC-003": {
        "name": "AWS Access Key",
        "pattern": r"AKIA[A-Z0-9]{16}",
        "exclude": r"(EXAMPLE|grep|pattern|\.sh:|\.md:.*grep|action:|check:|Match:)",
        "severity": "critical",
        "category": "cloud_credentials"
    },
    "SEC-004": {
        "name": "GCP Service Account",
        "pattern": r'"type"\s*:\s*"service_account"',
        "exclude": None,
        "severity": "critical",
        "category": "cloud_credentials"
    },
    "SEC-005": {
        "name": "Private Key Content",
        "pattern": r"-----BEGIN.*(PRIVATE|RSA|DSA|EC).*KEY-----",
        "exclude": r"(grep|pattern|action:|check:|Match:|example|#.*BEGIN|\"-----BEGIN)",
        "severity": "critical",
        "category": "private_keys"
    },
    "SEC-007": {
        "name": "Database URL with Password",
        "pattern": r"(postgres|mysql|mongodb|redis)://[^:]+:[^@]+@",
        "exclude": r"(\{\{|\[PASSWORD\]|[Ee]xample|localhost|user:pass|:password@|:secret@|grep|pattern)",
        "severity": "critical",
        "category": "database"
    },
    "SEC-009": {
        "name": "Bearer/JWT Token",
        "pattern": r"(bearer|jwt[_-]?secret)\s*[:=]\s*['\"][^'\"]{20,}",
        "exclude": r"(\{\{|\$\{|[Ee]xample|placeholder|super-secret|-here|action:|check:|Match:|#.*jwt)",
        "severity": "critical",
        "category": "api_tokens"
    },
    "SEC-010": {
        "name": "Supabase Service Role Key",
        "pattern": r"supabase.*service[_-]?role.*eyJ",
        "exclude": None,
        "severity": "critical",
        "category": "cloud_credentials"
    },
    "SEC-011": {
        "name": "GitHub Token",
        "pattern": r"gh[pousr]_[A-Za-z0-9_]{36,}",
        "exclude": r"([Ee]xample|placeholder)",
        "severity": "critical",
        "category": "api_tokens"
    },
    "SEC-012": {
        "name": "Slack Token",
        "pattern": r"xox[baprs]-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24}",
        "exclude": None,
        "severity": "critical",
        "category": "api_tokens"
    }
}

# File-based checks (not regex on content)
FILE_CHECKS = {
    "SEC-006": {
        "name": "Private Key Files",
        "patterns": ["*.pem", "*.key", "id_rsa", "id_rsa.*", "id_ecdsa", "id_ecdsa.*", "id_ed25519", "id_ed25519.*"],
        "severity": "critical",
        "category": "private_keys"
    },
    "SEC-008": {
        "name": ".env Files",
        "patterns": [".env", ".env.*", "*.env"],
        "severity": "critical",
        "category": "sensitive_files"
    },
    "SEC-013": {
        "name": "Credential Files",
        "patterns": ["credentials*.json", "service-account*.json", "secrets.yaml", "secrets.yml"],
        "severity": "critical",
        "category": "sensitive_files"
    }
}

# =============================================================================
# DATA CLASSES
# =============================================================================

@dataclass
class SecurityIssue:
    check_id: str
    name: str
    severity: str
    category: str
    file: str
    line: Optional[int] = None
    match: Optional[str] = None

@dataclass
class SecurityResult:
    squad_path: str
    status: str  # "pass" or "fail"
    issues_count: int
    critical_count: int
    warning_count: int
    checks_run: int
    checks_passed: int
    issues: List[SecurityIssue] = field(default_factory=list)
    summary_by_category: Dict[str, int] = field(default_factory=dict)

# =============================================================================
# SCANNER FUNCTIONS
# =============================================================================

def scan_file_content(file_path: Path, check_id: str, check: dict, strict: bool = False) -> List[SecurityIssue]:
    """Scan a single file for security issues."""
    issues = []

    # Skip test files (they contain intentional examples)
    if not strict and file_path.name.startswith("test_"):
        return issues

    try:
        content = file_path.read_text(encoding='utf-8', errors='ignore')
        lines = content.split('\n')

        pattern = re.compile(check["pattern"], re.IGNORECASE)
        exclude = re.compile(check["exclude"], re.IGNORECASE) if check.get("exclude") and not strict else None

        for line_num, line in enumerate(lines, 1):
            matches = pattern.findall(line)
            if matches:
                # Check exclusions
                if exclude and exclude.search(line):
                    continue

                # Found a real issue
                issues.append(SecurityIssue(
                    check_id=check_id,
                    name=check["name"],
                    severity=check["severity"],
                    category=check["category"],
                    file=str(file_path),
                    line=line_num,
                    match=line[:100] + "..." if len(line) > 100 else line
                ))
    except Exception as e:
        pass  # Skip files that can't be read

    return issues

def scan_for_files(squad_path: Path, check_id: str, check: dict) -> List[SecurityIssue]:
    """Scan for sensitive files by pattern."""
    issues = []

    for pattern in check["patterns"]:
        # Use glob to find matching files
        for file_path in squad_path.rglob(pattern):
            if file_path.is_file():
                issues.append(SecurityIssue(
                    check_id=check_id,
                    name=check["name"],
                    severity=check["severity"],
                    category=check["category"],
                    file=str(file_path)
                ))

    return issues

def scan_squad(squad_path: str, strict: bool = False) -> SecurityResult:
    """Run all security checks on a squad directory."""
    path = Path(squad_path)

    if not path.exists():
        return SecurityResult(
            squad_path=squad_path,
            status="error",
            issues_count=0,
            critical_count=0,
            warning_count=0,
            checks_run=0,
            checks_passed=0,
            issues=[SecurityIssue(
                check_id="SEC-000",
                name="Path Error",
                severity="critical",
                category="error",
                file=squad_path,
                match=f"Directory not found: {squad_path}"
            )]
        )

    all_issues = []
    checks_run = 0
    checks_passed = 0

    # Get all text files to scan
    text_extensions = {'.md', '.yaml', '.yml', '.json', '.py', '.js', '.ts', '.sh', '.txt', '.env'}
    files_to_scan = [
        f for f in path.rglob('*')
        if f.is_file()
        and f.suffix in text_extensions
        and '__pycache__' not in str(f)
        and '.git' not in str(f)
    ]

    # Run content-based checks
    for check_id, check in SECURITY_CHECKS.items():
        checks_run += 1
        check_issues = []

        for file_path in files_to_scan:
            check_issues.extend(scan_file_content(file_path, check_id, check, strict))

        if not check_issues:
            checks_passed += 1
        else:
            all_issues.extend(check_issues)

    # Run file-based checks
    for check_id, check in FILE_CHECKS.items():
        checks_run += 1
        check_issues = scan_for_files(path, check_id, check)

        if not check_issues:
            checks_passed += 1
        else:
            all_issues.extend(check_issues)

    # Calculate summary
    critical_count = sum(1 for i in all_issues if i.severity == "critical")
    warning_count = sum(1 for i in all_issues if i.severity == "warning")

    summary_by_category = {}
    for issue in all_issues:
        summary_by_category[issue.category] = summary_by_category.get(issue.category, 0) + 1

    return SecurityResult(
        squad_path=squad_path,
        status="fail" if all_issues else "pass",
        issues_count=len(all_issues),
        critical_count=critical_count,
        warning_count=warning_count,
        checks_run=checks_run,
        checks_passed=checks_passed,
        issues=all_issues,
        summary_by_category=summary_by_category
    )

# =============================================================================
# OUTPUT FORMATTERS
# =============================================================================

def format_text(result: SecurityResult) -> str:
    """Format result as human-readable text."""
    lines = []
    lines.append("")
    lines.append(f"Security Scan: {Path(result.squad_path).name}")
    lines.append("=" * 60)

    status_icon = "✓" if result.status == "pass" else "✗"
    lines.append(f"Status: {status_icon} {result.status.upper()}")
    lines.append(f"Checks: {result.checks_passed}/{result.checks_run} passed")
    lines.append(f"Issues: {result.issues_count} ({result.critical_count} critical, {result.warning_count} warnings)")

    if result.summary_by_category:
        lines.append("")
        lines.append("By Category:")
        for category, count in sorted(result.summary_by_category.items()):
            lines.append(f"  {category}: {count}")

    if result.issues:
        lines.append("")
        lines.append("Issues Found:")
        lines.append("-" * 60)

        for issue in result.issues:
            icon = "✗" if issue.severity == "critical" else "⚠"
            lines.append(f"  {icon} [{issue.check_id}] {issue.name}")
            lines.append(f"    File: {issue.file}")
            if issue.line:
                lines.append(f"    Line: {issue.line}")
            if issue.match:
                # Redact potential secrets
                redacted = re.sub(r'[a-zA-Z0-9]{20,}', '[REDACTED]', issue.match)
                lines.append(f"    Match: {redacted}")
            lines.append("")
    else:
        lines.append("")
        lines.append("✓ No security issues found!")

    return "\n".join(lines)

def format_json(result: SecurityResult) -> str:
    """Format result as JSON."""
    # Convert dataclasses to dict
    data = asdict(result)
    # Convert issues list
    data["issues"] = [asdict(i) if hasattr(i, '__dataclass_fields__') else i for i in result.issues]
    return json.dumps(data, indent=2)

# =============================================================================
# MAIN
# =============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Scan squad directory for security issues",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python security_scanner.py squads/copy/
    python security_scanner.py squads/copy/ --output json
    python security_scanner.py squads/copy/ --strict
        """
    )
    parser.add_argument("squad_path", help="Path to squad directory")
    parser.add_argument("--output", "-o", choices=["text", "json"], default="text", help="Output format")
    parser.add_argument("--strict", action="store_true", help="Disable exclusion patterns (catch more, may have false positives)")

    args = parser.parse_args()

    result = scan_squad(args.squad_path, args.strict)

    if args.output == "json":
        print(format_json(result))
    else:
        print(format_text(result))

    # Exit with error code if issues found
    sys.exit(1 if result.status == "fail" else 0)

if __name__ == "__main__":
    main()
