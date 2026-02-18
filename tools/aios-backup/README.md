# aios-backup

Intelligent GitHub backup for the AIOS ecosystem.

Automated backup for:
- `aios-core` (framework + local customizations)
- Projects in `~/Projects/`
- Global Claude skills (`~/.claude/skills/`)

## Usage

```bash
# Interactive mode (select projects)
bash tools/aios-backup/backup.sh

# Backup everything without asking
bash tools/aios-backup/backup.sh --all

# Show what would happen, don't execute
bash tools/aios-backup/backup.sh --dry-run

# Show backup status of all projects
bash tools/aios-backup/backup.sh --status
```

## Prerequisites

- `git` installed
- `gh` (GitHub CLI) installed and authenticated
- GitHub account with repo creation permissions

## What It Does

1. Scans `aios-core/` for uncommitted changes, stages, commits, and pushes
2. Scans `~/Projects/` for all projects, creates private GitHub repos if needed
3. Backs up global Claude skills from `~/.claude/skills/`
4. Automatically generates `.gitignore` rules for sensitive files (.env, tokens, etc.)
5. Prevents accidental commit of credentials via pattern matching

## Security

The script automatically:
- Generates `.gitignore` entries for sensitive patterns
- Detects and unstages sensitive files before commit
- Creates all repos as **private** by default
