#!/usr/bin/env python3
"""
Squad Analytics Script

Generates detailed analytics report for all squads in the ecosystem.
Shows: agents, tasks, workflows, templates, checklists, data files, scripts.

Usage:
    python scripts/squad-analytics.py [--format table|json] [--sort-by agents|tasks|total]
    python scripts/squad-analytics.py --squad hormozi --detailed
    python scripts/squad-analytics.py --squad hormozi --line-counts
    python scripts/squad-analytics.py --squad hormozi --quality-audit

Note: Uses only standard library (no external dependencies)
"""

import os
import sys
import json
import re
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple


def get_squads_path() -> Path:
    """Get the squads directory path"""
    script_dir = Path(__file__).parent.parent.parent
    if (script_dir / "squad-creator").exists():
        return script_dir

    cwd = Path.cwd()
    if (cwd / "squads").exists():
        return cwd / "squads"
    elif cwd.name == "squads":
        return cwd

    raise FileNotFoundError("Could not find squads/ directory")


def count_lines(file_path: Path) -> int:
    """Count lines in a file"""
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            return sum(1 for _ in f)
    except:
        return 0


def count_files_by_extension(directory: Path, extensions: List[str]) -> int:
    """Count files with specific extensions in directory"""
    if not directory.exists():
        return 0

    count = 0
    for ext in extensions:
        count += len(list(directory.glob(f"*{ext}")))
    return count


def count_md_files(directory: Path) -> int:
    """Count markdown files excluding README"""
    if not directory.exists():
        return 0

    count = 0
    for f in directory.glob("*.md"):
        if f.name.lower() not in ['readme.md', 'template.md', '_template.md']:
            count += 1
    return count


def list_files(directory: Path, extensions: List[str], exclude: List[str] = None) -> List[str]:
    """List files with specific extensions"""
    if not directory.exists():
        return []

    exclude = exclude or ['readme.md', 'template.md', '_template.md']
    files = []
    for ext in extensions:
        for f in directory.glob(f"*{ext}"):
            if f.name.lower() not in exclude:
                files.append(f.stem)
    return sorted(files)


def list_files_with_lines(directory: Path, extensions: List[str], exclude: List[str] = None) -> List[Tuple[str, int]]:
    """List files with their line counts"""
    if not directory.exists():
        return []

    exclude = exclude or ['readme.md', 'template.md', '_template.md']
    files = []
    for ext in extensions:
        for f in directory.glob(f"*{ext}"):
            if f.name.lower() not in exclude:
                lines = count_lines(f)
                files.append((f.name, lines))
    return sorted(files, key=lambda x: -x[1])  # Sort by lines desc


def simple_yaml_parse(content: str) -> Dict[str, str]:
    """Simple YAML parser for basic key: value pairs (no nested structures)"""
    result = {}
    for line in content.split('\n'):
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        if ':' in line:
            key, _, value = line.partition(':')
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and not key.startswith('-'):
                result[key] = value
    return result


def read_config(squad_path: Path) -> Optional[Dict]:
    """Read squad config.yaml (simple parsing)"""
    config_file = squad_path / "config.yaml"
    if not config_file.exists():
        return None

    try:
        with open(config_file, 'r', encoding='utf-8') as f:
            return simple_yaml_parse(f.read())
    except:
        return None


def detect_extra_folders(squad_path: Path) -> Dict[str, Any]:
    """Detect squad-specific extra folders like data/minds/, docs/sops/, etc."""
    extras = {}

    # data/minds/ - DNA files
    minds_path = squad_path / "data" / "minds"
    if minds_path.exists():
        files = list_files_with_lines(minds_path, [".yaml", ".yml"])
        extras["dna_files"] = {
            "path": "data/minds/",
            "count": len(files),
            "files": files,
            "total_lines": sum(f[1] for f in files)
        }

    # docs/sops/ - SOPs
    sops_path = squad_path / "docs" / "sops"
    if sops_path.exists():
        md_files = list_files_with_lines(sops_path, [".md"])
        yaml_files = list_files_with_lines(sops_path, [".yaml", ".yml"])
        extras["sops"] = {
            "path": "docs/sops/",
            "md_count": len(md_files),
            "yaml_count": len(yaml_files),
            "md_files": md_files,
            "yaml_files": yaml_files,
            "total_lines": sum(f[1] for f in md_files) + sum(f[1] for f in yaml_files)
        }

    # docs/ general
    docs_path = squad_path / "docs"
    if docs_path.exists():
        md_files = list_files_with_lines(docs_path, [".md"])
        extras["docs"] = {
            "path": "docs/",
            "count": len(md_files),
            "files": md_files,
            "total_lines": sum(f[1] for f in md_files)
        }

    # pipelines/ - Pipeline code
    pipelines_path = squad_path / "pipelines"
    if pipelines_path.exists():
        py_files = list_files_with_lines(pipelines_path, [".py"])
        extras["pipelines"] = {
            "path": "pipelines/",
            "count": len(py_files),
            "files": py_files,
            "total_lines": sum(f[1] for f in py_files)
        }

    return extras


def analyze_squad(squad_path: Path, include_lines: bool = False) -> Dict[str, Any]:
    """Analyze a single squad in detail"""
    name = squad_path.name
    config = read_config(squad_path)

    # Count all component types
    counts = {
        "agents": count_md_files(squad_path / "agents"),
        "tasks": count_md_files(squad_path / "tasks"),
        "workflows": count_md_files(squad_path / "workflows") + count_files_by_extension(squad_path / "workflows", [".yaml", ".yml"]),
        "templates": count_md_files(squad_path / "templates") + count_files_by_extension(squad_path / "templates", [".yaml", ".yml"]),
        "checklists": count_md_files(squad_path / "checklists"),
        "data": count_md_files(squad_path / "data") + count_files_by_extension(squad_path / "data", [".yaml", ".yml", ".json"]),
        "scripts": count_files_by_extension(squad_path / "scripts", [".py", ".js", ".ts", ".sh"]),
    }

    # List components (for detailed view)
    components = {
        "agents": list_files(squad_path / "agents", [".md"]),
        "tasks": list_files(squad_path / "tasks", [".md"]),
        "workflows": list_files(squad_path / "workflows", [".md", ".yaml", ".yml"]),
        "templates": list_files(squad_path / "templates", [".md", ".yaml", ".yml"]),
        "checklists": list_files(squad_path / "checklists", [".md"]),
        "data": list_files(squad_path / "data", [".md", ".yaml", ".yml", ".json"]),
        "scripts": list_files(squad_path / "scripts", [".py", ".js", ".ts", ".sh"]),
    }

    # Line counts (if requested)
    line_counts = {}
    if include_lines:
        line_counts = {
            "agents": list_files_with_lines(squad_path / "agents", [".md"]),
            "tasks": list_files_with_lines(squad_path / "tasks", [".md"]),
            "workflows": list_files_with_lines(squad_path / "workflows", [".md", ".yaml", ".yml"]),
            "templates": list_files_with_lines(squad_path / "templates", [".md", ".yaml", ".yml"]),
            "checklists": list_files_with_lines(squad_path / "checklists", [".md"]),
            "data": list_files_with_lines(squad_path / "data", [".md", ".yaml", ".yml", ".json"]),
            "scripts": list_files_with_lines(squad_path / "scripts", [".py", ".js", ".ts", ".sh"]),
        }

    # Detect extra folders
    extras = detect_extra_folders(squad_path)

    # Check documentation
    has_readme = (squad_path / "README.md").exists()
    has_changelog = (squad_path / "CHANGELOG.md").exists()
    has_config = config is not None

    # Calculate totals
    total = sum(counts.values())

    # Get metadata from config
    domain = ""
    description = ""
    version = "unknown"

    if config:
        domain = config.get("domain", config.get("short-title", ""))
        description = config.get("description", "")
        version = config.get("version", "unknown")

    return {
        "name": name,
        "domain": domain,
        "description": description,
        "version": version,
        "counts": counts,
        "components": components,
        "line_counts": line_counts,
        "extras": extras,
        "total": total,
        "has_readme": has_readme,
        "has_changelog": has_changelog,
        "has_config": has_config,
        "quality_score": calculate_quality_score(counts, has_readme, has_config),
    }


def calculate_quality_score(counts: Dict, has_readme: bool, has_config: bool) -> str:
    """Calculate a simple quality indicator"""
    score = 0

    # Base points for having components
    if counts["agents"] > 0: score += 2
    if counts["tasks"] > 0: score += 2
    if counts["workflows"] > 0: score += 1
    if counts["templates"] > 0: score += 1
    if counts["checklists"] > 0: score += 1
    if counts["data"] > 0: score += 1

    # Bonus for documentation
    if has_readme: score += 1
    if has_config: score += 1

    # Rating
    if score >= 9: return "⭐⭐⭐"
    if score >= 6: return "⭐⭐"
    if score >= 3: return "⭐"
    return "🔨"  # Work in progress


def quality_audit(squad_data: Dict) -> Dict[str, Any]:
    """Run quality audit against AIOS standards"""
    audit = {
        "agents": {"min": 300, "results": [], "pass": 0, "fail": 0},
        "workflows": {"min": 500, "results": [], "pass": 0, "fail": 0},
        "tasks": {"min": 100, "results": [], "pass": 0, "fail": 0},  # Lower threshold for tasks
    }

    for comp_type in ["agents", "workflows", "tasks"]:
        if comp_type in squad_data.get("line_counts", {}):
            min_lines = audit[comp_type]["min"]
            for name, lines in squad_data["line_counts"][comp_type]:
                passed = lines >= min_lines
                audit[comp_type]["results"].append({
                    "name": name,
                    "lines": lines,
                    "min": min_lines,
                    "passed": passed
                })
                if passed:
                    audit[comp_type]["pass"] += 1
                else:
                    audit[comp_type]["fail"] += 1

    return audit


def analyze_all_squads(squads_path: Path) -> Dict[str, Any]:
    """Analyze all squads"""
    skip_dirs = {'.DS_Store', '__pycache__', 'node_modules', '.git', 'artifacts'}

    results = {
        "metadata": {
            "scan_date": datetime.now().isoformat(),
            "generated_by": "squad-analytics.py",
        },
        "squads": [],
        "totals": {
            "squads": 0,
            "agents": 0,
            "tasks": 0,
            "workflows": 0,
            "templates": 0,
            "checklists": 0,
            "data": 0,
            "scripts": 0,
            "total_components": 0,
        }
    }

    for item in sorted(squads_path.iterdir()):
        if not item.is_dir():
            continue
        if item.name in skip_dirs or item.name.startswith('.'):
            continue

        # Check if it's a valid squad
        has_config = (item / "config.yaml").exists()
        has_agents = (item / "agents").exists()

        if not (has_config or has_agents):
            continue

        squad_data = analyze_squad(item)
        results["squads"].append(squad_data)

        # Update totals
        results["totals"]["squads"] += 1
        for key in ["agents", "tasks", "workflows", "templates", "checklists", "data", "scripts"]:
            results["totals"][key] += squad_data["counts"][key]
        results["totals"]["total_components"] += squad_data["total"]

    return results


def format_table(results: Dict, detailed: bool = False) -> str:
    """Format results as ASCII table"""
    lines = []

    # Header
    lines.append("=" * 100)
    lines.append("📊 AIOS SQUAD ANALYTICS")
    lines.append(f"Generated: {results['metadata']['scan_date'][:10]}")
    lines.append("=" * 100)
    lines.append("")

    # Summary
    t = results["totals"]
    lines.append(f"📈 ECOSYSTEM SUMMARY")
    lines.append(f"   Squads: {t['squads']} | Agents: {t['agents']} | Tasks: {t['tasks']} | Workflows: {t['workflows']}")
    lines.append(f"   Templates: {t['templates']} | Checklists: {t['checklists']} | Data: {t['data']} | Scripts: {t['scripts']}")
    lines.append(f"   Total Components: {t['total_components']}")
    lines.append("")

    # Table header
    lines.append("-" * 100)
    header = f"{'Squad':<20} {'Agents':>7} {'Tasks':>7} {'WFs':>5} {'Tmpls':>6} {'Checks':>7} {'Data':>6} {'Scripts':>8} {'Total':>6} {'Quality'}"
    lines.append(header)
    lines.append("-" * 100)

    # Sort by total components (descending)
    sorted_squads = sorted(results["squads"], key=lambda x: x["total"], reverse=True)

    for squad in sorted_squads:
        c = squad["counts"]
        row = f"{squad['name']:<20} {c['agents']:>7} {c['tasks']:>7} {c['workflows']:>5} {c['templates']:>6} {c['checklists']:>7} {c['data']:>6} {c['scripts']:>8} {squad['total']:>6} {squad['quality_score']}"
        lines.append(row)

        # Detailed view: show component names
        if detailed and squad["total"] > 0:
            for comp_type, comp_list in squad["components"].items():
                if comp_list:
                    lines.append(f"   └─ {comp_type}: {', '.join(comp_list[:5])}" +
                               (f" (+{len(comp_list)-5} more)" if len(comp_list) > 5 else ""))
            lines.append("")

    lines.append("-" * 100)

    # Top squads by category
    lines.append("")
    lines.append("🏆 TOP SQUADS BY CATEGORY")
    lines.append("")

    categories = [
        ("agents", "Most Agents"),
        ("tasks", "Most Tasks"),
        ("workflows", "Most Workflows"),
        ("checklists", "Most Checklists"),
    ]

    for cat, label in categories:
        top = sorted(results["squads"], key=lambda x: x["counts"][cat], reverse=True)[:3]
        if top and top[0]["counts"][cat] > 0:
            top_str = ", ".join([f"{s['name']} ({s['counts'][cat]})" for s in top if s["counts"][cat] > 0])
            lines.append(f"   {label}: {top_str}")

    lines.append("")
    lines.append("=" * 100)

    return "\n".join(lines)


def format_single_squad(squad_data: Dict, line_counts: bool = False, quality_audit_flag: bool = False) -> str:
    """Format a single squad analysis"""
    lines = []

    name = squad_data["name"].upper()
    lines.append("=" * 80)
    lines.append(f"📊 SQUAD ANALYTICS: {name}")
    lines.append("=" * 80)
    lines.append("")

    # Overview
    c = squad_data["counts"]
    lines.append("📈 OVERVIEW")
    lines.append(f"   Agents: {c['agents']} | Tasks: {c['tasks']} | Workflows: {c['workflows']}")
    lines.append(f"   Templates: {c['templates']} | Checklists: {c['checklists']} | Data: {c['data']}")
    lines.append(f"   Quality: {squad_data['quality_score']}")
    lines.append("")

    # Extra folders (if any)
    if squad_data.get("extras"):
        lines.append("📁 EXTRA FOLDERS DETECTED")
        for key, info in squad_data["extras"].items():
            if key == "dna_files":
                lines.append(f"   └─ DNA Files ({info['path']}): {info['count']} files, {info['total_lines']:,} lines")
            elif key == "sops":
                lines.append(f"   └─ SOPs ({info['path']}): {info['md_count']} .md + {info['yaml_count']} .yaml = {info['total_lines']:,} lines")
            elif key == "docs":
                lines.append(f"   └─ Docs ({info['path']}): {info['count']} files, {info['total_lines']:,} lines")
            elif key == "pipelines":
                lines.append(f"   └─ Pipelines ({info['path']}): {info['count']} files, {info['total_lines']:,} lines")
        lines.append("")

    # Line counts (if requested)
    if line_counts and squad_data.get("line_counts"):
        lines.append("-" * 80)
        lines.append("📏 LINE COUNTS BY COMPONENT")
        lines.append("-" * 80)

        for comp_type, file_list in squad_data["line_counts"].items():
            if file_list:
                total_lines = sum(f[1] for f in file_list)
                avg_lines = total_lines // len(file_list) if file_list else 0
                lines.append("")
                lines.append(f"📂 {comp_type.upper()} ({len(file_list)} files, {total_lines:,} lines, avg {avg_lines})")

                # Determine min threshold
                min_threshold = 300 if comp_type == "agents" else (500 if comp_type == "workflows" else 0)

                for fname, flines in file_list[:15]:  # Show top 15
                    status = "✅" if flines >= min_threshold or min_threshold == 0 else "⚠️"
                    lines.append(f"   {status} {fname:<40} {flines:>5} lines")

                if len(file_list) > 15:
                    lines.append(f"   ... and {len(file_list) - 15} more files")

        # Extra folder line counts
        if squad_data.get("extras"):
            for key, info in squad_data["extras"].items():
                if "files" in info and info["files"]:
                    lines.append("")
                    lines.append(f"📂 {key.upper()} ({info['path']}, {info['total_lines']:,} lines)")
                    for fname, flines in info["files"][:10]:
                        lines.append(f"   {fname:<40} {flines:>5} lines")
                    if len(info["files"]) > 10:
                        lines.append(f"   ... and {len(info['files']) - 10} more files")

    # Quality audit (if requested)
    if quality_audit_flag and squad_data.get("line_counts"):
        audit = quality_audit(squad_data)
        lines.append("")
        lines.append("-" * 80)
        lines.append("🔍 QUALITY AUDIT (AIOS Standards)")
        lines.append("-" * 80)

        for comp_type in ["agents", "workflows", "tasks"]:
            if audit[comp_type]["results"]:
                min_lines = audit[comp_type]["min"]
                passed = audit[comp_type]["pass"]
                failed = audit[comp_type]["fail"]
                total = passed + failed
                status = "✅ ALL PASS" if failed == 0 else f"⚠️ {failed}/{total} BELOW MIN"

                lines.append("")
                lines.append(f"📋 {comp_type.upper()} (min: {min_lines} lines) — {status}")

                for result in audit[comp_type]["results"]:
                    icon = "✅" if result["passed"] else "❌"
                    lines.append(f"   {icon} {result['name']:<40} {result['lines']:>5} lines")

    lines.append("")
    lines.append("=" * 80)

    return "\n".join(lines)


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Generate squad analytics report")
    parser.add_argument("--format", choices=["table", "json"], default="table",
                        help="Output format")
    parser.add_argument("--detailed", "-d", action="store_true",
                        help="Show detailed component lists")
    parser.add_argument("--sort-by", choices=["name", "agents", "tasks", "total"], default="total",
                        help="Sort squads by field")
    parser.add_argument("--squads-path", type=Path, default=None,
                        help="Path to squads/ directory")
    parser.add_argument("--squad", "-s", type=str, default=None,
                        help="Analyze a specific squad only")
    parser.add_argument("--line-counts", "-l", action="store_true",
                        help="Show line counts per file (requires --squad)")
    parser.add_argument("--quality-audit", "-q", action="store_true",
                        help="Run quality audit against AIOS standards (requires --squad)")

    args = parser.parse_args()

    try:
        squads_path = args.squads_path or get_squads_path()
    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    # Single squad analysis
    if args.squad:
        squad_path = squads_path / args.squad
        if not squad_path.exists():
            print(f"Error: Squad '{args.squad}' not found at {squad_path}", file=sys.stderr)
            sys.exit(1)

        include_lines = args.line_counts or args.quality_audit
        squad_data = analyze_squad(squad_path, include_lines=include_lines)

        if args.format == "json":
            print(json.dumps(squad_data, indent=2, ensure_ascii=False))
        else:
            print(format_single_squad(squad_data, line_counts=args.line_counts, quality_audit_flag=args.quality_audit))
        return

    # All squads analysis
    results = analyze_all_squads(squads_path)

    # Sort if needed
    if args.sort_by == "name":
        results["squads"].sort(key=lambda x: x["name"])
    elif args.sort_by in ["agents", "tasks"]:
        results["squads"].sort(key=lambda x: x["counts"][args.sort_by], reverse=True)
    else:  # total
        results["squads"].sort(key=lambda x: x["total"], reverse=True)

    # Output
    if args.format == "json":
        print(json.dumps(results, indent=2, ensure_ascii=False))
    else:
        print(format_table(results, detailed=args.detailed))


if __name__ == "__main__":
    main()
