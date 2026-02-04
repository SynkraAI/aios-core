# Task: Update AIOS Framework

> **Version:** 4.0.0
> **Created:** 2026-01-29
> **Updated:** 2026-01-31
> **Type:** SYNC (git-native framework synchronization)
> **Agent:** @devops (Gage) or @aios (Orion)
> **Execution:** Simple bash script (~15 lines)

## Purpose

Git-native sync of AIOS framework from upstream repository. Uses `git merge --no-commit` for safe review before applying changes. All local customizations preserved automatically via `git checkout --ours`.

---

## Quick Usage

```bash
# Run the update script
bash .aios-core/scripts/update-aios.sh

# Review changes shown by the script, then:
git commit -m "chore: sync AIOS framework"   # Apply changes
# OR
git merge --abort                             # Cancel changes
```

---

## How It Works

The script uses Git's native merge capabilities:

1. **Fetch upstream** - Gets latest from SynkraAI/aios-core
2. **Merge --no-commit** - Prepares changes but doesn't commit (safety checkpoint)
3. **Preserve local** - Uses `git checkout --ours` to keep all customizations
4. **Show diff** - Displays what will change for review
5. **User decides** - Commit to apply or abort to cancel

**Why Git-native is better:**
- Git already tracks all changes (no manual checksums)
- Git is the backup (no separate backup system)
- Merge conflicts handled natively
- 15 lines of bash vs 847 lines of JavaScript

---

## Protected Files (NEVER overwritten)

These paths are automatically preserved via `git checkout --ours`:

| Path | Reason |
|------|--------|
| `.aios-core/expansion-packs/` | Custom copywriters, data, ralph |
| `.aios-core/marketing/` | Marketing-specific agents/tasks |
| `source/` | Business context YAML |
| `Knowledge/` | Knowledge bases |
| `.aios-core/context/` | Compiled contexts |
| `CLAUDE.md` | Project rules |
| `.claude/commands/` | Custom commands |
| `.claude/rules/` | Custom rules |
| `.antigravity/` | Antigravity config |
| `.gemini/` | Gemini config |
| `MCPs/` | MCP integrations |
| `Contexto/` | Business context |
| `Output/` | Deliverables |
| `docs/` | Project documentation |
| `scripts/` | Python scripts |
| `.env` | Secrets |

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
  4. git commit -m "chore: sync AIOS framework"  # to apply
  5. git merge --abort                           # to cancel

pre-conditions:
  - git status clean (if dirty, auto-commit with "chore: pre-update commit")

post-conditions:
  - protected files unchanged (git checkout --ours)
  - changes staged for review

acceptance:
  - script completes without error
  - user can review changes before committing
  - local customizations preserved
```

---

## Verification

After running the script:

```bash
# Check that local files weren't touched
ls -la .aios-core/expansion-packs/
ls -la source/

# Verify contexts still compile
python scripts/compile_context.py

# See what changed
git diff --cached --stat
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
git merge --abort
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 4.0.0 | 2026-01-31 | **SIMPLIFIED:** Git-native approach, 15-line bash script replaces 847-line JS |
| 3.1.0 | 2026-01-30 | Dynamic protection for expansion pack commands |
| 3.0.0 | 2026-01-29 | YOLO mode with rsync |
| 1.0.0 | 2026-01-29 | Initial version (verbose, interactive) |
