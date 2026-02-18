#!/usr/bin/env python3
"""
Sync IDE Command Script - Worker (100% Deterministic)

Synchronizes squad agents, tasks, workflows to IDE command directories.
All operations are deterministic file operations - no LLM needed.

Operations:
- Read source files from squads/
- Parse YAML/Markdown
- Transform formats (MD → MDC for Cursor)
- Copy/symlink to destination directories
- Validate results

Usage:
    python scripts/sync-ide-command.py agent {name} [--squad {squad}]
    python scripts/sync-ide-command.py task {name} [--squad {squad}]
    python scripts/sync-ide-command.py workflow {name} [--squad {squad}]
    python scripts/sync-ide-command.py squad {squad-name}

Flags:
    --dry-run     Preview without creating files
    --force       Overwrite existing files
    --ide         Target specific IDE (claude, cursor, windsurf)
    --verbose     Show detailed output

Pattern: EXEC-W-001 (Worker - Deterministic)
"""

import os
import sys
import yaml
import json
import shutil
import argparse
import re
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple


# ============================================================================
# CONFIGURATION
# ============================================================================

DEFAULT_CONFIG = {
    "active_ides": ["claude"],
    "pack_aliases": {},
    "sync_mappings": {
        "squad_agents": {
            "source": "squads/*/agents/",
            "destinations": {
                "claude": {
                    "path": ".claude/commands/{pack}/agents/",
                    "format": "md"
                },
                "cursor": {
                    "path": ".cursor/rules/",
                    "format": "mdc"
                }
            }
        }
    }
}


# ============================================================================
# FILE UTILITIES
# ============================================================================

def find_project_root() -> Path:
    """Find project root (directory with squads/)"""
    current = Path.cwd()

    # Walk up until we find squads/
    for _ in range(10):
        if (current / "squads").exists():
            return current
        parent = current.parent
        if parent == current:
            break
        current = parent

    # Check if we're inside squads/
    current = Path.cwd()
    if current.name == "squads":
        return current.parent
    if "squads" in str(current):
        idx = str(current).find("squads")
        return Path(str(current)[:idx])

    raise FileNotFoundError("Could not find project root with squads/ directory")


def load_sync_config(project_root: Path) -> Dict:
    """Load .aios-sync.yaml or return defaults"""
    config_path = project_root / ".aios-sync.yaml"

    if config_path.exists():
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                config = yaml.safe_load(f) or {}
                # Merge with defaults
                for key, value in DEFAULT_CONFIG.items():
                    if key not in config:
                        config[key] = value
                return config
        except Exception as e:
            print(f"Warning: Could not parse {config_path}: {e}", file=sys.stderr)

    return DEFAULT_CONFIG.copy()


def ensure_dir(path: Path) -> None:
    """Ensure directory exists"""
    path.mkdir(parents=True, exist_ok=True)


# ============================================================================
# SOURCE DISCOVERY
# ============================================================================

def find_squad_for_component(project_root: Path, component_type: str, name: str) -> Optional[str]:
    """Find which squad contains a component"""
    squads_path = project_root / "squads"

    type_dir_map = {
        "agent": "agents",
        "task": "tasks",
        "workflow": "workflows",
        "template": "templates",
        "checklist": "checklists"
    }

    dir_name = type_dir_map.get(component_type, component_type + "s")

    for squad_dir in squads_path.iterdir():
        if not squad_dir.is_dir():
            continue

        component_dir = squad_dir / dir_name
        if not component_dir.exists():
            continue

        # Check for file with various extensions
        for ext in [".md", ".yaml", ".yml"]:
            if (component_dir / f"{name}{ext}").exists():
                return squad_dir.name

    return None


def list_squad_components(project_root: Path, squad_name: str) -> Dict[str, List[Path]]:
    """List all components in a squad"""
    squad_path = project_root / "squads" / squad_name

    if not squad_path.exists():
        raise FileNotFoundError(f"Squad not found: {squad_name}")

    components = {
        "agents": [],
        "tasks": [],
        "workflows": [],
        "templates": [],
        "checklists": [],
        "data": []
    }

    for comp_type, file_list in components.items():
        comp_dir = squad_path / comp_type
        if comp_dir.exists():
            for f in comp_dir.iterdir():
                if f.is_file() and f.suffix in [".md", ".yaml", ".yml"]:
                    # Skip certain files
                    if f.name.lower() in ["readme.md", "changelog.md", ".gitkeep"]:
                        continue
                    file_list.append(f)

    return components


def get_source_file(project_root: Path, component_type: str, name: str, squad: Optional[str] = None) -> Optional[Path]:
    """Get path to source file"""
    # If squad specified, look there directly
    if squad:
        type_dir_map = {
            "agent": "agents",
            "task": "tasks",
            "workflow": "workflows"
        }
        dir_name = type_dir_map.get(component_type, component_type + "s")

        for ext in [".md", ".yaml", ".yml"]:
            path = project_root / "squads" / squad / dir_name / f"{name}{ext}"
            if path.exists():
                return path
        return None

    # Otherwise, search all squads
    found_squad = find_squad_for_component(project_root, component_type, name)
    if found_squad:
        return get_source_file(project_root, component_type, name, found_squad)

    return None


# ============================================================================
# FORMAT CONVERSION
# ============================================================================

def extract_description_from_md(content: str) -> str:
    """Extract description from markdown agent file"""
    # Try to find whenToUse in YAML block
    yaml_match = re.search(r'```yaml\s*(.*?)```', content, re.DOTALL)
    if yaml_match:
        try:
            yaml_content = yaml.safe_load(yaml_match.group(1))
            if isinstance(yaml_content, dict):
                # Check for whenToUse
                if 'agent' in yaml_content and 'whenToUse' in yaml_content['agent']:
                    return yaml_content['agent']['whenToUse']
                # Check for title
                if 'agent' in yaml_content and 'title' in yaml_content['agent']:
                    return yaml_content['agent']['title']
        except:
            pass

    # Try to find first paragraph after title
    lines = content.split('\n')
    in_header = False
    for line in lines:
        line = line.strip()
        if line.startswith('#'):
            in_header = True
            continue
        if in_header and line and not line.startswith('#') and not line.startswith('```'):
            # Skip certain lines
            if line.startswith('ACTIVATION') or line.startswith('CRITICAL'):
                continue
            return line[:200]  # Truncate

    return "Agent command"


def convert_md_to_mdc(content: str, description: str = "") -> str:
    """Convert Markdown to MDC format (Cursor)"""
    frontmatter = f"""---
description: {description or 'Agent command'}
globs: []
alwaysApply: false
---

"""
    return frontmatter + content


def get_pack_alias(config: Dict, squad_name: str) -> str:
    """Get pack alias for a squad"""
    aliases = config.get("pack_aliases", {})
    if squad_name in aliases:
        return aliases[squad_name]
    # Default: capitalize first letter of each word
    return ''.join(word.capitalize() for word in squad_name.split('-'))


# ============================================================================
# SYNC OPERATIONS
# ============================================================================

def get_destination_path(
    project_root: Path,
    ide: str,
    pack_alias: str,
    component_type: str,
    filename: str,
    config: Dict
) -> Path:
    """Get destination path for a file"""

    if ide == "claude":
        type_dir_map = {
            "agent": "agents",
            "task": "tasks",
            "workflow": "workflows",
            "template": "templates",
            "checklist": "checklists",
            "data": "data"
        }
        dir_name = type_dir_map.get(component_type, component_type + "s")
        return project_root / ".claude" / "commands" / pack_alias / dir_name / filename

    elif ide == "cursor":
        # Cursor uses flat .cursor/rules/ with .mdc extension
        name_without_ext = Path(filename).stem
        return project_root / ".cursor" / "rules" / f"{name_without_ext}.mdc"

    elif ide == "windsurf":
        return project_root / ".windsurf" / "commands" / pack_alias / filename

    else:
        raise ValueError(f"Unknown IDE: {ide}")


def sync_file(
    source: Path,
    dest: Path,
    ide: str,
    force: bool = False,
    dry_run: bool = False
) -> Tuple[str, str]:  # (status, message)
    """Sync a single file"""

    # Check if destination exists
    if dest.exists() and not force:
        return ("skipped", f"exists (use --force to overwrite)")

    if dry_run:
        return ("would_create", str(dest))

    # Read source
    content = source.read_text(encoding='utf-8')

    # Convert format if needed
    if ide == "cursor" and source.suffix == ".md":
        description = extract_description_from_md(content)
        content = convert_md_to_mdc(content, description)

    # Ensure destination directory exists
    ensure_dir(dest.parent)

    # Write file
    dest.write_text(content, encoding='utf-8')

    return ("created", str(dest))


def sync_component(
    project_root: Path,
    component_type: str,
    name: str,
    squad: Optional[str],
    config: Dict,
    force: bool = False,
    dry_run: bool = False,
    target_ide: Optional[str] = None,
    verbose: bool = False
) -> Dict[str, Any]:
    """Sync a single component to IDE directories"""

    results = {
        "component": name,
        "type": component_type,
        "source": None,
        "destinations": [],
        "status": "success"
    }

    # Find source file
    source = get_source_file(project_root, component_type, name, squad)
    if not source:
        results["status"] = "error"
        results["error"] = f"Source not found: {component_type}/{name}"
        return results

    results["source"] = str(source)

    # Determine squad from source path
    squad_name = source.parent.parent.name
    pack_alias = get_pack_alias(config, squad_name)

    # Get active IDEs
    ides = [target_ide] if target_ide else config.get("active_ides", ["claude"])

    # Sync to each IDE
    for ide in ides:
        dest = get_destination_path(
            project_root, ide, pack_alias, component_type, source.name, config
        )

        status, message = sync_file(source, dest, ide, force, dry_run)

        results["destinations"].append({
            "ide": ide,
            "path": str(dest),
            "status": status,
            "message": message
        })

        if verbose:
            icon = "✓" if status in ["created", "would_create"] else "○"
            print(f"  {icon} [{ide}] {dest}")

    return results


def sync_squad(
    project_root: Path,
    squad_name: str,
    config: Dict,
    force: bool = False,
    dry_run: bool = False,
    target_ide: Optional[str] = None,
    verbose: bool = False
) -> Dict[str, Any]:
    """Sync entire squad to IDE directories"""

    results = {
        "squad": squad_name,
        "components": [],
        "summary": {
            "created": 0,
            "updated": 0,
            "skipped": 0,
            "errors": 0
        }
    }

    # List all components
    try:
        components = list_squad_components(project_root, squad_name)
    except FileNotFoundError as e:
        results["error"] = str(e)
        return results

    pack_alias = get_pack_alias(config, squad_name)
    print(f"\n📦 Syncing squad: {squad_name} → {pack_alias}")

    # Sync each component type
    type_map = {
        "agents": "agent",
        "tasks": "task",
        "workflows": "workflow",
        "templates": "template",
        "checklists": "checklist",
        "data": "data"
    }

    for comp_dir, files in components.items():
        if not files:
            continue

        comp_type = type_map.get(comp_dir, comp_dir[:-1])
        print(f"\n  Syncing {comp_dir} ({len(files)} files)...")

        for source_file in files:
            result = sync_component(
                project_root,
                comp_type,
                source_file.stem,
                squad_name,
                config,
                force,
                dry_run,
                target_ide,
                verbose
            )

            results["components"].append(result)

            # Update summary
            for dest in result.get("destinations", []):
                if dest["status"] == "created":
                    results["summary"]["created"] += 1
                elif dest["status"] == "would_create":
                    results["summary"]["created"] += 1
                elif dest["status"] == "skipped":
                    results["summary"]["skipped"] += 1
                elif dest["status"] == "error":
                    results["summary"]["errors"] += 1

    return results


# ============================================================================
# MAIN
# ============================================================================

def print_summary(results: Dict, dry_run: bool = False) -> None:
    """Print sync summary"""
    print("\n" + "═" * 50)
    if dry_run:
        print("📋 DRY RUN COMPLETE (no files created)")
    else:
        print("✅ SYNC COMPLETE")
    print("═" * 50)

    summary = results.get("summary", {})
    print(f"""
Summary:
  Files created:  {summary.get('created', 0)}
  Files updated:  {summary.get('updated', 0)}
  Files skipped:  {summary.get('skipped', 0)}
  Errors:         {summary.get('errors', 0)}
""")


def main():
    parser = argparse.ArgumentParser(
        description="Sync squad components to IDE command directories",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s agent squad-chief
  %(prog)s task validate-squad --squad squad-creator
  %(prog)s squad squad-creator
  %(prog)s squad copy --dry-run
  %(prog)s squad legal --force --ide cursor
        """
    )

    parser.add_argument("type", choices=["agent", "task", "workflow", "squad"],
                        help="Component type to sync")
    parser.add_argument("name", help="Component or squad name")
    parser.add_argument("--squad", "-s", help="Squad name (auto-detected if not specified)")
    parser.add_argument("--dry-run", "-n", action="store_true",
                        help="Preview without creating files")
    parser.add_argument("--force", "-f", action="store_true",
                        help="Overwrite existing files")
    parser.add_argument("--ide", "-i", choices=["claude", "cursor", "windsurf"],
                        help="Target specific IDE")
    parser.add_argument("--verbose", "-v", action="store_true",
                        help="Show detailed output")
    parser.add_argument("--output", "-o", choices=["text", "json"], default="text",
                        help="Output format")

    args = parser.parse_args()

    # Find project root
    try:
        project_root = find_project_root()
    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    # Load config
    config = load_sync_config(project_root)

    print(f"━" * 50)
    print(f" *sync {args.type} {args.name}")
    print(f"━" * 50)
    print(f"\n📋 Project root: {project_root}")
    print(f"   Active IDEs: {', '.join(config.get('active_ides', ['claude']))}")

    # Execute sync
    if args.type == "squad":
        results = sync_squad(
            project_root,
            args.name,
            config,
            force=args.force,
            dry_run=args.dry_run,
            target_ide=args.ide,
            verbose=args.verbose
        )
    else:
        results = sync_component(
            project_root,
            args.type,
            args.name,
            args.squad,
            config,
            force=args.force,
            dry_run=args.dry_run,
            target_ide=args.ide,
            verbose=args.verbose
        )
        # Wrap in summary format
        results = {
            "components": [results],
            "summary": {
                "created": sum(1 for d in results.get("destinations", []) if d["status"] in ["created", "would_create"]),
                "skipped": sum(1 for d in results.get("destinations", []) if d["status"] == "skipped"),
                "errors": sum(1 for d in results.get("destinations", []) if d["status"] == "error"),
                "updated": 0
            }
        }

    # Output
    if args.output == "json":
        print(json.dumps(results, indent=2))
    else:
        print_summary(results, args.dry_run)

        if results.get("error"):
            print(f"Error: {results['error']}")
            sys.exit(1)


if __name__ == "__main__":
    main()
