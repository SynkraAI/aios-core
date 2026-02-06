#!/usr/bin/env python3
"""
Risk Mitigation Validation Script

Validates that identified risks have appropriate mitigation strategies.
Checks project documentation for risk/mitigation coverage.

Usage:
    python validate_risk_mitigation.py [--path PROJECT_PATH] [--risks RISKS_FILE]
"""

import os
import sys
import argparse
import re
from pathlib import Path
from typing import List, Dict, Tuple
import yaml


class Risk:
    """Represents an identified risk"""

    def __init__(self, name: str, description: str, severity: str, source: str):
        self.name = name
        self.description = description
        self.severity = severity  # high, medium, low
        self.source = source  # file where risk identified
        self.mitigation = None

    def __str__(self):
        status = "✅ MITIGATED" if self.mitigation else "❌ NO MITIGATION"
        return (
            f"\n  [{self.severity.upper()}] {self.name}\n"
            f"  {self.description}\n"
            f"  Source: {self.source}\n"
            f"  Status: {status}"
        )


class RiskMitigationValidator:
    """Validates risk mitigation coverage"""

    def __init__(self, project_path: Path, risks_file: Path = None):
        self.project_path = project_path
        self.risks_file = risks_file
        self.risks: List[Risk] = []
        self.mitigation_docs: Dict[str, str] = {}

    def _find_risk_documents(self) -> List[Path]:
        """Find all documents that might contain risks"""
        risk_doc_patterns = [
            "**/architecture/*.md",
            "**/design/*.md",
            "**/docs/**/*risk*.md",
            "**/docs/**/*adr*.md",  # Architecture Decision Records
            "**/*RISK*.md",
        ]

        docs = []
        for pattern in risk_doc_patterns:
            docs.extend(self.project_path.glob(pattern))

        return list(set(docs))  # Remove duplicates

    def _extract_risks_from_doc(self, doc_path: Path):
        """Extract risks from a document"""
        try:
            with open(doc_path, "r", encoding="utf-8") as f:
                content = f.read()

            # Look for risk sections
            risk_patterns = [
                # Markdown headers with "risk"
                r"#{1,6}\s+.*[Rr]isks?\s*.*\n(.*?)(?=\n#{1,6}|\Z)",
                # Table format
                r"\|\s*[Rr]isk\s*\|.*\n\|[-\s|]+\n((?:\|.*\n)*)",
                # Bullet points
                r"[-*]\s+\*\*[Rr]isk:?\*\*\s+(.*?)(?=\n[-*]|\n\n|\Z)",
            ]

            for pattern in risk_patterns:
                matches = re.finditer(pattern, content, re.MULTILINE | re.DOTALL)
                for match in matches:
                    risk_text = match.group(1)
                    self._parse_risks_from_text(risk_text, str(doc_path))

        except Exception as e:
            print(f"Warning: Could not parse {doc_path}: {e}", file=sys.stderr)

    def _parse_risks_from_text(self, text: str, source: str):
        """Parse individual risks from text block"""
        # Simple heuristic: each line or paragraph is a risk
        lines = [l.strip() for l in text.split("\n") if l.strip()]

        for line in lines:
            # Skip table headers
            if re.match(r"^\|?[-\s|]+\|?$", line):
                continue

            # Extract from table row: | risk | description | severity |
            table_match = re.match(r"\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|", line)
            if table_match:
                name = table_match.group(1).strip()
                description = table_match.group(2).strip()
                severity = self._infer_severity(name, description)
                self.risks.append(Risk(name, description, severity, source))
                continue

            # Extract from bullet: - **Risk:** description
            bullet_match = re.match(
                r"[-*]\s+\*\*([^:*]+):?\*\*\s+(.*)", line, re.IGNORECASE
            )
            if bullet_match:
                name = bullet_match.group(1).strip()
                description = bullet_match.group(2).strip()
                severity = self._infer_severity(name, description)
                self.risks.append(Risk(name, description, severity, source))
                continue

            # Generic line as risk
            if len(line) > 10:  # Minimum length to be meaningful
                severity = self._infer_severity(line, line)
                self.risks.append(Risk(line[:50], line, severity, source))

    def _infer_severity(self, name: str, description: str) -> str:
        """Infer severity from risk name/description"""
        text = (name + " " + description).lower()

        high_keywords = ["critical", "severe", "major", "high", "blocker"]
        low_keywords = ["minor", "low", "trivial", "cosmetic"]

        if any(kw in text for kw in high_keywords):
            return "high"
        elif any(kw in text for kw in low_keywords):
            return "low"
        else:
            return "medium"

    def _find_mitigation_documents(self) -> List[Path]:
        """Find documents that might contain mitigations"""
        mitigation_patterns = [
            "**/architecture/*.md",
            "**/design/*.md",
            "**/docs/**/*mitigation*.md",
            "**/docs/**/*strategy*.md",
            "**/*MITIGATION*.md",
        ]

        docs = []
        for pattern in mitigation_patterns:
            docs.extend(self.project_path.glob(pattern))

        return list(set(docs))

    def _extract_mitigations_from_doc(self, doc_path: Path):
        """Extract mitigations from document"""
        try:
            with open(doc_path, "r", encoding="utf-8") as f:
                content = f.read()

            # Store entire content as potential mitigation source
            self.mitigation_docs[str(doc_path)] = content

        except Exception as e:
            print(
                f"Warning: Could not parse {doc_path}: {e}", file=sys.stderr
            )

    def _match_risks_to_mitigations(self):
        """Match identified risks to mitigations"""
        for risk in self.risks:
            # Search for risk name/keywords in mitigation docs
            risk_keywords = set(
                re.findall(r"\b\w{4,}\b", risk.name.lower())
            )  # Words 4+ chars

            for doc_path, content in self.mitigation_docs.items():
                content_lower = content.lower()

                # Check if risk keywords appear in mitigation section
                if any(keyword in content_lower for keyword in risk_keywords):
                    # Look for mitigation keywords nearby
                    mitigation_keywords = [
                        "mitigation",
                        "mitigate",
                        "solution",
                        "strategy",
                        "address",
                        "resolve",
                    ]

                    if any(kw in content_lower for kw in mitigation_keywords):
                        risk.mitigation = doc_path
                        break

    def _load_risks_from_yaml(self):
        """Load risks from YAML file if provided"""
        if not self.risks_file or not self.risks_file.exists():
            return

        try:
            with open(self.risks_file, "r") as f:
                data = yaml.safe_load(f)

            if "risks" in data:
                for risk_data in data["risks"]:
                    risk = Risk(
                        name=risk_data.get("name", "Unnamed"),
                        description=risk_data.get("description", ""),
                        severity=risk_data.get("severity", "medium"),
                        source=str(self.risks_file),
                    )

                    # Check if mitigation provided in YAML
                    if "mitigation" in risk_data:
                        risk.mitigation = "YAML: " + risk_data["mitigation"]

                    self.risks.append(risk)

        except Exception as e:
            print(
                f"Warning: Could not load risks from {self.risks_file}: {e}",
                file=sys.stderr,
            )

    def run(self) -> int:
        """Run risk mitigation validation"""
        print("🔍 Validating risk mitigation coverage...")
        print(f"   Project: {self.project_path}")
        print()

        # Load risks from YAML if provided
        if self.risks_file:
            print(f"📄 Loading risks from: {self.risks_file}")
            self._load_risks_from_yaml()

        # Find and parse risk documents
        print("📁 Scanning project documentation for risks...")
        risk_docs = self._find_risk_documents()
        print(f"   Found {len(risk_docs)} potential risk documents")

        for doc in risk_docs:
            self._extract_risks_from_doc(doc)

        print(f"   Identified {len(self.risks)} risks")
        print()

        # Find mitigation documents
        print("📁 Scanning for mitigation documentation...")
        mitigation_docs = self._find_mitigation_documents()
        print(f"   Found {len(mitigation_docs)} potential mitigation documents")

        for doc in mitigation_docs:
            self._extract_mitigations_from_doc(doc)

        print()

        # Match risks to mitigations
        print("🔗 Matching risks to mitigations...")
        self._match_risks_to_mitigations()
        print()

        return self._report_results()

    def _report_results(self) -> int:
        """Report results and return exit code"""
        if not self.risks:
            print("⚠️  No risks identified in project documentation.")
            print(
                "   This might mean:"
            )
            print("   - Project has no documented risks")
            print("   - Risk documentation not in expected locations")
            print("   - Risk documentation format not recognized")
            print()
            print("   Recommended: Create risk documentation in:")
            print("   - docs/architecture/risks.md")
            print("   - Design documents with ## Risks section")
            print("   - Architecture Decision Records (ADRs)")
            return 0

        # Categorize risks
        mitigated = [r for r in self.risks if r.mitigation]
        unmitigated = [r for r in self.risks if not r.mitigation]

        high_unmitigated = [
            r for r in unmitigated if r.severity == "high"
        ]

        print("=" * 80)
        print("RISK MITIGATION REPORT")
        print("=" * 80)
        print()
        print(f"Total Risks: {len(self.risks)}")
        print(f"Mitigated: {len(mitigated)}")
        print(f"Unmitigated: {len(unmitigated)}")
        print()

        if high_unmitigated:
            print(f"⚠️  HIGH PRIORITY: {len(high_unmitigated)} high-severity risks without mitigation")
            print()

        # Report unmitigated risks first
        if unmitigated:
            print("❌ UNMITIGATED RISKS:")
            for risk in sorted(
                unmitigated, key=lambda r: {"high": 0, "medium": 1, "low": 2}[r.severity]
            ):
                print(risk)
            print()

        # Report mitigated risks
        if mitigated:
            print("✅ MITIGATED RISKS:")
            for risk in mitigated:
                print(risk)
                print(f"  Mitigation: {risk.mitigation}")
            print()

        # Overall assessment
        coverage = len(mitigated) / len(self.risks) * 100 if self.risks else 0

        print("=" * 80)
        print(f"COVERAGE: {coverage:.1f}%")
        print("=" * 80)
        print()

        if coverage == 100:
            print("✅ All identified risks have mitigation strategies!")
            return 0
        elif coverage >= 80:
            print("⚠️  Good coverage, but some risks lack mitigation.")
            if not high_unmitigated:
                print("   No high-severity risks unmitigated. Consider acceptable.")
                return 0
        else:
            print("❌ Low mitigation coverage. Address unmitigated risks.")

        if unmitigated:
            print()
            print("REMEDIATION STEPS:")
            print("-" * 80)
            print("1. Document mitigation strategy for each unmitigated risk")
            print("2. Create mitigation documentation in:")
            print("   - Architecture Decision Records (ADRs)")
            print("   - Design documents (## Risk Mitigation section)")
            print("   - Dedicated mitigation strategy documents")
            print("3. For each risk, specify:")
            print("   - Mitigation approach (avoid, reduce, transfer, accept)")
            print("   - Concrete steps to implement mitigation")
            print("   - Contingency plan if mitigation fails")
            print("   - Responsible party/team")
            print()

        # Exit code based on high-severity unmitigated risks
        return 1 if high_unmitigated else 0


def main():
    parser = argparse.ArgumentParser(
        description="Validate risk mitigation coverage"
    )
    parser.add_argument(
        "--path",
        type=Path,
        default=Path.cwd(),
        help="Project path to scan (default: current directory)",
    )
    parser.add_argument(
        "--risks", type=Path, help="YAML file with explicit risk definitions"
    )

    args = parser.parse_args()

    validator = RiskMitigationValidator(args.path, args.risks)
    exit_code = validator.run()
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
