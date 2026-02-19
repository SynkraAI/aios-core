#!/usr/bin/env python3
"""
Legal Petition PDF Converter

Converts a Markdown petition file to a court-formatted PDF document.
Uses pandoc for MD→HTML conversion and weasyprint for HTML→PDF rendering.

Requirements:
    - pandoc (brew install pandoc / apt install pandoc)
    - weasyprint (pip install weasyprint)

Usage:
    python petition-to-pdf.py PETICAO_INICIAL.md
    python petition-to-pdf.py PETICAO_INICIAL.md --output custom_name.pdf
    python petition-to-pdf.py PETICAO_INICIAL.md --css custom_style.css
"""

import argparse
import os
import subprocess
import sys
import tempfile
from pathlib import Path


def find_css_file() -> str:
    """Find the default CSS file relative to this script."""
    script_dir = Path(__file__).parent.parent
    css_path = script_dir / "assets" / "petition-style.css"
    if css_path.exists():
        return str(css_path)
    return ""


def check_dependencies() -> list[str]:
    """Check for required external tools."""
    missing = []

    try:
        subprocess.run(
            ["pandoc", "--version"],
            capture_output=True,
            check=True,
        )
    except (FileNotFoundError, subprocess.CalledProcessError):
        missing.append("pandoc")

    try:
        import weasyprint  # noqa: F401
    except ImportError:
        missing.append("weasyprint (pip install weasyprint)")

    return missing


def markdown_to_html(md_path: str, css_path: str = "") -> str:
    """Convert Markdown to styled HTML using pandoc."""
    cmd = [
        "pandoc",
        md_path,
        "-f", "markdown",
        "-t", "html5",
        "--standalone",
        "--metadata", "title= ",
    ]

    if css_path and os.path.exists(css_path):
        cmd.extend(["--css", css_path])

    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    html_content = result.stdout

    # If CSS was provided, embed it inline for weasyprint compatibility
    if css_path and os.path.exists(css_path):
        with open(css_path, "r", encoding="utf-8") as f:
            css_content = f.read()

        # Replace the <link> tag with inline <style>
        html_content = html_content.replace(
            f'<link rel="stylesheet" href="{css_path}" />',
            f"<style>\n{css_content}\n</style>",
        )

        # Also handle relative path references
        css_filename = os.path.basename(css_path)
        html_content = html_content.replace(
            f'<link rel="stylesheet" href="{css_filename}" />',
            f"<style>\n{css_content}\n</style>",
        )

    return html_content


def html_to_pdf(html_content: str, output_path: str) -> None:
    """Convert HTML to PDF using weasyprint."""
    from weasyprint import HTML

    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".html", delete=False, encoding="utf-8"
    ) as f:
        f.write(html_content)
        temp_html = f.name

    try:
        HTML(filename=temp_html).write_pdf(output_path)
    finally:
        os.unlink(temp_html)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Convert a Markdown petition to court-formatted PDF"
    )
    parser.add_argument(
        "input",
        help="Path to the Markdown petition file",
    )
    parser.add_argument(
        "--output", "-o",
        help="Output PDF path (default: same name with .pdf extension)",
    )
    parser.add_argument(
        "--css",
        help="Custom CSS file (default: assets/petition-style.css)",
    )
    parser.add_argument(
        "--html-only",
        action="store_true",
        help="Generate only the intermediate HTML file",
    )

    args = parser.parse_args()

    # Validate input
    if not os.path.exists(args.input):
        print(f"Error: Input file not found: {args.input}", file=sys.stderr)
        sys.exit(1)

    # Check dependencies
    missing = check_dependencies()
    if missing:
        print("Missing dependencies:", file=sys.stderr)
        for dep in missing:
            print(f"  - {dep}", file=sys.stderr)
        sys.exit(1)

    # Determine output path
    input_path = Path(args.input)
    if args.output:
        output_path = args.output
    else:
        output_path = str(input_path.with_suffix(".pdf"))

    # Determine CSS path
    css_path = args.css or find_css_file()

    print(f"Input:  {args.input}")
    print(f"Output: {output_path}")
    if css_path:
        print(f"CSS:    {css_path}")
    else:
        print("CSS:    (none - using default styling)")

    # Convert MD → HTML
    print("\nConverting Markdown to HTML...")
    html_content = markdown_to_html(args.input, css_path)

    if args.html_only:
        html_output = str(Path(output_path).with_suffix(".html"))
        with open(html_output, "w", encoding="utf-8") as f:
            f.write(html_content)
        print(f"HTML saved to: {html_output}")
        return

    # Convert HTML → PDF
    print("Converting HTML to PDF...")
    html_to_pdf(html_content, output_path)

    # Report results
    file_size = os.path.getsize(output_path)
    print(f"\nPDF generated successfully!")
    print(f"  File: {output_path}")
    print(f"  Size: {file_size / 1024:.1f} KB")


if __name__ == "__main__":
    main()
