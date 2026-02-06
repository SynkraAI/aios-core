#!/usr/bin/env python3
"""
Architecture Documentation Validator

Validates that architectural documentation is complete before implementation.
Checks for required sections, diagrams, and documentation completeness.

Usage:
    python architecture_validator.py [--path ARCH_DOC_PATH]
"""

import os
import sys
import argparse
import re
from pathlib import Path
from typing import List, Dict, Set, Tuple


class ValidationIssue:
    """Represents a validation issue"""

    def __init__(self, severity: str, category: str, message: str, location: str = ""):
        self.severity = severity  # error, warning, info
        self.category = category
        self.message = message
        self.location = location

    def __str__(self):
        icon = {"error": "❌", "warning": "⚠️", "info": "ℹ️"}[self.severity]
        loc = f" ({self.location})" if self.location else ""
        return f"{icon} [{self.category}] {self.message}{loc}"


class ArchitectureValidator:
    """Validates architecture documentation completeness"""

    def __init__(self, doc_path: Path):
        self.doc_path = doc_path
        self.content = ""
        self.issues: List[ValidationIssue] = []

        # Required sections in architecture doc
        self.required_sections = [
            "Overview",
            "Architecture",
            "Components",
            "Data Flow",
            "Integration",
            "Configuration",
        ]

        # Recommended sections
        self.recommended_sections = [
            "Deployment",
            "Security",
            "Performance",
            "Monitoring",
            "Testing",
        ]

    def _load_document(self) -> bool:
        """Load architecture document"""
        try:
            with open(self.doc_path, "r", encoding="utf-8") as f:
                self.content = f.read()
            return True
        except Exception as e:
            self.issues.append(
                ValidationIssue(
                    "error",
                    "DOCUMENT",
                    f"Could not load document: {e}",
                )
            )
            return False

    def _check_required_sections(self):
        """Check for required sections"""
        found_sections = set()

        # Find all markdown headers
        headers = re.findall(r"^#{1,3}\s+(.+)$", self.content, re.MULTILINE)

        for header in headers:
            header_clean = header.strip().lower()
            for required in self.required_sections:
                if required.lower() in header_clean:
                    found_sections.add(required)

        # Report missing sections
        missing = set(self.required_sections) - found_sections
        for section in missing:
            self.issues.append(
                ValidationIssue(
                    "error",
                    "REQUIRED_SECTION",
                    f"Missing required section: '{section}'",
                )
            )

        # Check recommended sections
        for recommended in self.recommended_sections:
            if not any(recommended.lower() in h.lower() for h in headers):
                self.issues.append(
                    ValidationIssue(
                        "warning",
                        "RECOMMENDED_SECTION",
                        f"Missing recommended section: '{recommended}'",
                    )
                )

    def _check_diagrams(self):
        """Check for architectural diagrams"""
        # Look for diagram indicators
        diagram_indicators = [
            r"!\[.*\]\(.*\.(?:png|jpg|svg|drawio)\)",  # Image links
            r"```(?:mermaid|plantuml|dot)",  # Diagram code blocks
            r"#{2,3}\s+.*[Dd]iagram",  # Diagram sections
        ]

        has_diagrams = any(
            re.search(pattern, self.content) for pattern in diagram_indicators
        )

        if not has_diagrams:
            self.issues.append(
                ValidationIssue(
                    "error",
                    "DIAGRAMS",
                    "No architectural diagrams found. Include at least: "
                    "system architecture, component interaction, and data flow diagrams.",
                )
            )

    def _check_component_documentation(self):
        """Check that components are documented"""
        # Look for components section
        components_match = re.search(
            r"#{1,3}\s+Components.*?\n(.*?)(?=\n#{1,3}|\Z)",
            self.content,
            re.DOTALL | re.IGNORECASE,
        )

        if not components_match:
            self.issues.append(
                ValidationIssue(
                    "error",
                    "COMPONENTS",
                    "Components section not found or empty",
                )
            )
            return

        components_section = components_match.group(1)

        # Check for component descriptions (bullets or numbered lists)
        component_items = re.findall(
            r"^[-*\d.]+\s+\*\*([^*:]+)\*\*:?\s*(.+)$",
            components_section,
            re.MULTILINE,
        )

        if len(component_items) < 2:
            self.issues.append(
                ValidationIssue(
                    "warning",
                    "COMPONENTS",
                    "Components section has few documented components. "
                    "Ensure all major components are listed and described.",
                )
            )

        # Check that each component has a description
        for name, description in component_items:
            if len(description.strip()) < 20:
                self.issues.append(
                    ValidationIssue(
                        "warning",
                        "COMPONENTS",
                        f"Component '{name}' has minimal description",
                        "Components",
                    )
                )

    def _check_data_flow(self):
        """Check data flow documentation"""
        data_flow_keywords = [
            "data flow",
            "flow diagram",
            "data pipeline",
            "workflow",
        ]

        has_data_flow = any(
            kw in self.content.lower() for kw in data_flow_keywords
        )

        if not has_data_flow:
            self.issues.append(
                ValidationIssue(
                    "error",
                    "DATA_FLOW",
                    "Data flow not documented. Include data flow diagram "
                    "or detailed description of how data moves through the system.",
                )
            )

    def _check_integration_points(self):
        """Check integration points documentation"""
        integration_keywords = [
            "integration",
            "api",
            "interface",
            "endpoint",
            "external",
        ]

        integration_match = re.search(
            r"#{1,3}\s+Integration.*?\n(.*?)(?=\n#{1,3}|\Z)",
            self.content,
            re.DOTALL | re.IGNORECASE,
        )

        if not integration_match:
            self.issues.append(
                ValidationIssue(
                    "warning",
                    "INTEGRATION",
                    "Integration section not found. Document external integrations.",
                )
            )
            return

        integration_section = integration_match.group(1)

        # Check for API/interface documentation
        if len(integration_section.strip()) < 100:
            self.issues.append(
                ValidationIssue(
                    "warning",
                    "INTEGRATION",
                    "Integration section is brief. Document all external integrations, "
                    "APIs, and interfaces in detail.",
                )
            )

    def _check_configuration(self):
        """Check configuration documentation"""
        config_match = re.search(
            r"#{1,3}\s+Configuration.*?\n(.*?)(?=\n#{1,3}|\Z)",
            self.content,
            re.DOTALL | re.IGNORECASE,
        )

        if not config_match:
            self.issues.append(
                ValidationIssue(
                    "error",
                    "CONFIGURATION",
                    "Configuration section not found. Must document configuration schema.",
                )
            )
            return

        config_section = config_match.group(1)

        # Check for YAML/config examples
        has_yaml_example = re.search(r"```ya?ml", config_section, re.IGNORECASE)

        if not has_yaml_example:
            self.issues.append(
                ValidationIssue(
                    "warning",
                    "CONFIGURATION",
                    "No YAML configuration example found. Include sample configuration.",
                )
            )

        # Check for configuration parameters documentation
        if "parameter" not in config_section.lower() and "option" not in config_section.lower():
            self.issues.append(
                ValidationIssue(
                    "warning",
                    "CONFIGURATION",
                    "Configuration parameters not documented. List all config options.",
                )
            )

    def _check_decision_documentation(self):
        """Check for documented architectural decisions"""
        decision_keywords = [
            "decision",
            "rationale",
            "trade-off",
            "alternative",
            "chose",
            "option",
        ]

        has_decisions = any(kw in self.content.lower() for kw in decision_keywords)

        if not has_decisions:
            self.issues.append(
                ValidationIssue(
                    "warning",
                    "DECISIONS",
                    "Architectural decisions not documented. Include decision rationale "
                    "and alternatives considered.",
                )
            )

    def _check_document_length(self):
        """Check if document has sufficient detail"""
        word_count = len(self.content.split())
        line_count = len(self.content.split("\n"))

        if word_count < 500:
            self.issues.append(
                ValidationIssue(
                    "warning",
                    "COMPLETENESS",
                    f"Document is brief ({word_count} words). "
                    "Ensure sufficient detail for implementation.",
                )
            )

        if line_count < 100:
            self.issues.append(
                ValidationIssue(
                    "info",
                    "COMPLETENESS",
                    f"Document is short ({line_count} lines). Consider adding more detail.",
                )
            )

    def _check_code_examples(self):
        """Check for code examples or technical details"""
        code_blocks = re.findall(r"```[\w]*\n", self.content)

        if len(code_blocks) < 2:
            self.issues.append(
                ValidationIssue(
                    "info",
                    "EXAMPLES",
                    "Few code examples found. Consider adding code snippets "
                    "to illustrate implementation.",
                )
            )

    def run(self) -> int:
        """Run validation"""
        print("🔍 Validating architecture documentation...")
        print(f"   Document: {self.doc_path}")
        print()

        # Load document
        if not self._load_document():
            self._report_results()
            return 1

        # Run all validations
        print("📋 Checking required sections...")
        self._check_required_sections()

        print("🎨 Checking diagrams...")
        self._check_diagrams()

        print("🧩 Checking component documentation...")
        self._check_component_documentation()

        print("🔄 Checking data flow documentation...")
        self._check_data_flow()

        print("🔌 Checking integration points...")
        self._check_integration_points()

        print("⚙️  Checking configuration documentation...")
        self._check_configuration()

        print("💡 Checking decision documentation...")
        self._check_decision_documentation()

        print("📏 Checking document completeness...")
        self._check_document_length()

        print("💻 Checking code examples...")
        self._check_code_examples()

        print()

        return self._report_results()

    def _report_results(self) -> int:
        """Report validation results"""
        if not self.issues:
            print("=" * 80)
            print("✅ ARCHITECTURE DOCUMENTATION VALID")
            print("=" * 80)
            print()
            print("All required sections present and documented.")
            print("Ready to proceed to implementation.")
            return 0

        # Categorize issues
        errors = [i for i in self.issues if i.severity == "error"]
        warnings = [i for i in self.issues if i.severity == "warning"]
        info = [i for i in self.issues if i.severity == "info"]

        print("=" * 80)
        print("VALIDATION RESULTS")
        print("=" * 80)
        print()
        print(f"Errors: {len(errors)}")
        print(f"Warnings: {len(warnings)}")
        print(f"Info: {len(info)}")
        print()

        # Report errors first
        if errors:
            print("ERRORS (must fix before implementation):")
            print("-" * 80)
            for issue in errors:
                print(f"  {issue}")
            print()

        # Then warnings
        if warnings:
            print("WARNINGS (should address):")
            print("-" * 80)
            for issue in warnings:
                print(f"  {issue}")
            print()

        # Then info
        if info:
            print("SUGGESTIONS:")
            print("-" * 80)
            for issue in info:
                print(f"  {issue}")
            print()

        print("=" * 80)

        if errors:
            print("❌ VALIDATION FAILED")
            print()
            print("Architecture documentation incomplete.")
            print("Fix all errors before proceeding to implementation.")
            print()
            print("See: references/stop-rules-guide.md (Stop Rule 4)")
            return 1
        elif warnings:
            print("⚠️  VALIDATION PASSED WITH WARNINGS")
            print()
            print("Consider addressing warnings for more complete documentation.")
            return 0
        else:
            print("✅ VALIDATION PASSED")
            return 0


def main():
    parser = argparse.ArgumentParser(
        description="Validate architecture documentation completeness"
    )
    parser.add_argument(
        "--path",
        type=Path,
        help="Path to architecture document (markdown file)",
        required=True,
    )

    args = parser.parse_args()

    if not args.path.exists():
        print(f"❌ Error: Document not found: {args.path}", file=sys.stderr)
        sys.exit(1)

    if not args.path.is_file():
        print(f"❌ Error: Not a file: {args.path}", file=sys.stderr)
        sys.exit(1)

    validator = ArchitectureValidator(args.path)
    exit_code = validator.run()
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
