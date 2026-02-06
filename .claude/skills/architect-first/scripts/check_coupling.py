#!/usr/bin/env python3
"""
Zero-Coupling Validation Script

Validates that modules/expansion-packs maintain zero-coupling principle:
- No hardcoded cross-module imports
- No hardcoded file paths to other modules
- Configuration-based integration only

Usage:
    python check_coupling.py [--path PROJECT_PATH] [--config CONFIG_FILE]
"""

import os
import re
import sys
import argparse
from pathlib import Path
from typing import List, Dict, Set, Tuple
import yaml


class CouplingViolation:
    """Represents a coupling violation found in code"""

    def __init__(
        self,
        file_path: str,
        line_number: int,
        line_content: str,
        violation_type: str,
        description: str,
    ):
        self.file_path = file_path
        self.line_number = line_number
        self.line_content = line_content.strip()
        self.violation_type = violation_type
        self.description = description

    def __str__(self):
        return (
            f"\n  {self.violation_type}: {self.file_path}:{self.line_number}\n"
            f"  {self.description}\n"
            f"  > {self.line_content}"
        )


class CouplingChecker:
    """Checks for coupling violations in codebase"""

    def __init__(self, project_path: Path, config_path: Path = None):
        self.project_path = project_path
        self.violations: List[CouplingViolation] = []
        self.config = self._load_config(config_path)

        # Modules to check for coupling (from config or defaults)
        self.modules = self.config.get("modules", [])
        if not self.modules:
            # Auto-detect expansion packs
            expansion_pack_dir = project_path / "expansion-packs"
            if expansion_pack_dir.exists():
                self.modules = [
                    d.name for d in expansion_pack_dir.iterdir() if d.is_dir()
                ]

        # File patterns to scan
        self.file_patterns = self.config.get(
            "file_patterns", ["*.py", "*.js", "*.ts", "*.yaml", "*.yml"]
        )

        # Exclude patterns
        self.exclude_patterns = self.config.get(
            "exclude_patterns",
            [
                "**/node_modules/**",
                "**/__pycache__/**",
                "**/venv/**",
                "**/.venv/**",
                "**/dist/**",
                "**/build/**",
            ],
        )

    def _load_config(self, config_path: Path = None) -> Dict:
        """Load configuration file if exists"""
        if config_path and config_path.exists():
            with open(config_path, "r") as f:
                return yaml.safe_load(f) or {}

        # Try default config location
        default_config = self.project_path / ".coupling-check.yaml"
        if default_config.exists():
            with open(default_config, "r") as f:
                return yaml.safe_load(f) or {}

        return {}

    def _should_exclude(self, file_path: Path) -> bool:
        """Check if file should be excluded from scanning"""
        path_str = str(file_path)
        for pattern in self.exclude_patterns:
            if Path(path_str).match(pattern):
                return True
        return False

    def _find_files_to_scan(self) -> List[Path]:
        """Find all files to scan for coupling violations"""
        files = []
        for pattern in self.file_patterns:
            for file_path in self.project_path.rglob(pattern):
                if file_path.is_file() and not self._should_exclude(file_path):
                    files.append(file_path)
        return files

    def _check_hardcoded_imports(self, file_path: Path, content: str):
        """Check for hardcoded imports to other modules"""
        lines = content.split("\n")

        for line_num, line in enumerate(lines, 1):
            # Python imports
            if re.match(r"^\s*(from|import)\s+", line):
                for module in self.modules:
                    # Check if importing from another module directly
                    if re.search(rf"\bfrom\s+{module}\b", line) or re.search(
                        rf"\bimport\s+{module}\b", line
                    ):
                        self.violations.append(
                            CouplingViolation(
                                str(file_path),
                                line_num,
                                line,
                                "HARDCODED_IMPORT",
                                f"Direct import of module '{module}'. "
                                f"Use plugin/config-based loading instead.",
                            )
                        )

            # JavaScript/TypeScript imports
            if re.search(r"(import|require)\s*\(?\s*['\"]", line):
                for module in self.modules:
                    if module in line:
                        self.violations.append(
                            CouplingViolation(
                                str(file_path),
                                line_num,
                                line,
                                "HARDCODED_IMPORT",
                                f"Direct import of module '{module}'. "
                                f"Use plugin/config-based loading instead.",
                            )
                        )

    def _check_hardcoded_paths(self, file_path: Path, content: str):
        """Check for hardcoded file paths to other modules"""
        lines = content.split("\n")

        for line_num, line in enumerate(lines, 1):
            # Look for file path patterns
            path_patterns = [
                r'["\']([^"\']*(?:expansion-packs|modules)/([^"\']+))["\']',
                r"Path\(['\"]([^'\"]*(?:expansion-packs|modules)/[^'\"]+)['\"]\)",
            ]

            for pattern in path_patterns:
                matches = re.finditer(pattern, line)
                for match in matches:
                    path_str = match.group(1)
                    # Check if path references another module
                    for module in self.modules:
                        if module in path_str:
                            self.violations.append(
                                CouplingViolation(
                                    str(file_path),
                                    line_num,
                                    line,
                                    "HARDCODED_PATH",
                                    f"Hardcoded path to module '{module}': {path_str}. "
                                    f"Use configuration-based path resolution.",
                                )
                            )

    def _check_shared_state(self, file_path: Path, content: str):
        """Check for shared global state between modules"""
        lines = content.split("\n")

        # Patterns that suggest shared state
        shared_state_patterns = [
            (r"\bglobal\s+\w+", "Global variable usage"),
            (r"^\s*[A-Z_]+\s*=\s*", "Module-level constant that might be shared"),
        ]

        for line_num, line in enumerate(lines, 1):
            for pattern, description in shared_state_patterns:
                if re.search(pattern, line):
                    # Check if it references other modules
                    for module in self.modules:
                        if module.lower() in line.lower():
                            self.violations.append(
                                CouplingViolation(
                                    str(file_path),
                                    line_num,
                                    line,
                                    "SHARED_STATE",
                                    f"{description} referencing '{module}'.",
                                )
                            )

    def check_file(self, file_path: Path):
        """Check a single file for coupling violations"""
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            self._check_hardcoded_imports(file_path, content)
            self._check_hardcoded_paths(file_path, content)
            self._check_shared_state(file_path, content)

        except Exception as e:
            print(f"Warning: Could not scan {file_path}: {e}", file=sys.stderr)

    def run(self) -> int:
        """Run coupling check on entire project"""
        print("🔍 Checking for coupling violations...")
        print(f"   Project: {self.project_path}")
        print(f"   Modules: {', '.join(self.modules)}")
        print()

        files = self._find_files_to_scan()
        print(f"📁 Scanning {len(files)} files...")
        print()

        for file_path in files:
            self.check_file(file_path)

        return self._report_results()

    def _report_results(self) -> int:
        """Report results and return exit code"""
        if not self.violations:
            print("✅ No coupling violations found!")
            print("   Zero-coupling principle maintained.")
            return 0

        print(f"❌ Found {len(self.violations)} coupling violation(s):")

        # Group violations by type
        by_type: Dict[str, List[CouplingViolation]] = {}
        for violation in self.violations:
            if violation.violation_type not in by_type:
                by_type[violation.violation_type] = []
            by_type[violation.violation_type].append(violation)

        # Report by type
        for violation_type, violations in by_type.items():
            print(f"\n{violation_type} ({len(violations)}):")
            for violation in violations:
                print(violation)

        print("\n" + "=" * 80)
        print("REMEDIATION STEPS:")
        print("=" * 80)
        print()
        print("1. Remove hardcoded imports:")
        print("   - Use plugin/adapter pattern")
        print("   - Load modules via configuration")
        print("   - Implement dependency injection")
        print()
        print("2. Externalize paths to YAML configuration:")
        print("   - Define module paths in config file")
        print("   - Use configuration loader to resolve paths")
        print("   - Never hardcode cross-module paths")
        print()
        print("3. Eliminate shared state:")
        print("   - Use message passing between modules")
        print("   - Implement clean interfaces")
        print("   - Each module maintains its own state")
        print()
        print("See: references/stop-rules-guide.md (Stop Rule 3)")
        print()

        return 1  # Exit code 1 indicates violations found


def main():
    parser = argparse.ArgumentParser(
        description="Check for coupling violations in codebase"
    )
    parser.add_argument(
        "--path",
        type=Path,
        default=Path.cwd(),
        help="Project path to scan (default: current directory)",
    )
    parser.add_argument(
        "--config", type=Path, help="Configuration file path (YAML)"
    )

    args = parser.parse_args()

    checker = CouplingChecker(args.path, args.config)
    exit_code = checker.run()
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
