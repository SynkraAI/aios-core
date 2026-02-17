# Task: Update AIOS Framework

> **Version:** 4.0.0
> **Created:** 2026-01-29
> **Updated:** 2026-01-31
> **Type:** SYNC (git-native framework synchronization)
> **Agent:** @devops (Gage) or @aios (Orion)
> **Execution:** Simple bash script (~15 lines)

## Purpose

Git-native sync of complete AIOS framework from upstream repository (https://github.com/SynkraAI/aios-core). Clones entire upstream repository, applies selective merge logic:
- **NEW files** → CREATE
- **MODIFIED files** → OVERWRITE (upstream wins)
- **DELETED files** (in upstream) → DELETE locally
- **LOCAL-ONLY files** → KEEP (never delete)
- **PROTECTED:** `update-aios.sh` always preserved (never overwrite)

All changes staged for review before user commits.

---

## Quick Usage

```bash
# Run the update script
bash .aios-core/scripts/update-aios.sh

# Review changes shown by the script, then:
git add .aios-core && git commit -m "chore: sync AIOS framework"   # Apply changes
# OR
git checkout -- .aios-core/                                         # Cancel changes
```

---

## How It Works

The script applies selective merge logic with complete upstream comparison:

1. **Clone upstream** - Shallow clone of `https://github.com/SynkraAI/aios-core` (entire repository)
2. **Compare files** - Uses `comm` for O(n) file list comparison across all files
3. **Categorize changes:**
   - Files NEW in upstream → Mark as CREATE
   - Files MODIFIED in both → Mark as OVERWRITE
   - Files DELETED in upstream → Mark as DELETE
   - Files LOCAL-ONLY → Mark as PRESERVE
4. **Execute sync:**
   - Delete files removed from upstream
   - Copy all upstream files (new + modified)
   - Restore local-only files (if accidentally overwritten)
5. **Report** - Shows counts for created/updated/deleted/preserved
6. **User decides** - Commit to apply changes or checkout to cancel

**Merge logic (STRICT ORDER):**
```
NEW in upstream        → CREATE
EXISTS in both         → OVERWRITE (upstream replaces local)
DELETED in upstream    → DELETE (remove locally)
LOCAL-ONLY            → KEEP (never delete)
EXCEPTION: update-aios.sh → NEVER OVERWRITE (always protected)
```

**Why this approach:**
- Complete sync (not sparse, gets everything)
- O(n) comparison performance
- Clear categorization before applying
- User reviews before committing
- Rollback simple (`git checkout -- .` if needed)

---

## Local-Only Files (PRESERVED automatically)

Files that exist ONLY locally (not in upstream) are automatically preserved. Examples:
- `squads/` - Custom copywriters, data, ralph
- `.aios-core/marketing/` - Marketing-specific agents/tasks (if local-only)
- `source/` - Business context YAML
- `Knowledge/` - Knowledge bases
- `.aios-core/context/` - Compiled contexts
- `CLAUDE.md` - Project rules
- `.claude/commands/` - Custom commands
- `.claude/rules/` - Custom rules
- `.antigravity/` - Antigravity config
- `.gemini/` - Gemini config
- `MCPs/` - MCP integrations
- `Contexto/` - Business context
- `Output/` - Deliverables
- `docs/` - Project documentation
- `scripts/` - Python scripts
- `.env` - Secrets

**If these files exist in BOTH local and upstream:** Upstream version wins (overwrites local)

---

## Task Definition

```yaml
task: updateAIOSFramework
agent: devops
mode: simple
timeout: 60  # 1 minute max

execution:
  script: .aios-core/scripts/update-aios.sh

workflow:
  1. If dirty working tree: git add -A && git commit -m "chore: pre-update commit"
  2. bash .aios-core/scripts/update-aios.sh
  3. Review changes displayed
  4. git add .aios-core && git commit -m "chore: sync AIOS framework"  # to apply
  5. git checkout -- .aios-core/                                        # to cancel

pre-conditions:
  - git status clean (if dirty, auto-commit with "chore: pre-update commit")

post-conditions:
  - local-only files preserved (backup/restore)
  - changes ready for review (unstaged)

acceptance:
  - script completes without error
  - user can review changes before committing
  - local customizations preserved
```

---

## Verification

After running the script:

```bash
# Check that local-only files are preserved
ls -la squads/  # if exists
ls -la source/                       # if exists

# See what changed (unstaged)
git diff --stat
```

---

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| "Commit changes first" | Uncommitted changes | Agent auto-commits before running script |
| "Failed to fetch upstream" | Network issue | Check internet connection |
| Merge conflicts | File changed both locally and upstream | Script auto-resolves by preserving local |

---

## Rollback

```bash
# If you already committed and want to undo:
git reset --hard HEAD~1

# If you haven't committed yet:
git checkout -- .aios-core/
```

---

## Upstream Repository

**Source:** https://github.com/SynkraAI/aios-core

Complete AIOS framework. All files (not sparse).

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 5.0.0 | 2026-02-15 | **COMPLETE FRAMEWORK SYNC:** Full upstream clone, strict merge logic (CREATE/OVERWRITE/DELETE/PRESERVE), always protects `update-aios.sh` |
| 4.0.0 | 2026-01-31 | **SIMPLIFIED:** Git-native approach, 15-line bash script replaces 847-line JS |
| 3.1.0 | 2026-01-30 | Dynamic protection for expansion pack commands |
| 3.0.0 | 2026-01-29 | YOLO mode with rsync |
| 1.0.0 | 2026-01-29 | Initial version (verbose, interactive) |
