# Navigator Troubleshooting Guide

Solutions to common problems and error messages.

---

## Table of Contents

- [Health Check Failures](#health-check-failures)
- [Phase Detection Issues](#phase-detection-issues)
- [Roadmap Sync Problems](#roadmap-sync-problems)
- [Checkpoint Issues](#checkpoint-issues)
- [Git Hook Problems](#git-hook-problems)
- [Performance Issues](#performance-issues)
- [Error Messages](#error-messages)

---

## Health Check Failures

### ❌ Node.js Version Check Failed

**Error:**
```
✗ Node.js v16.14.0 (requires >= 18.0.0)
```

**Cause:** Node.js version too old

**Fix:**
```bash
# Option 1: Install via nvm
nvm install 20
nvm use 20

# Option 2: Download from nodejs.org
# Visit https://nodejs.org and install LTS version

# Verify
node --version  # Should show v18.x.x or higher
```

---

### ❌ Git Not Available

**Error:**
```
✗ Git: Not found in PATH
```

**Cause:** Git not installed or not in PATH

**Fix:**
```bash
# macOS
brew install git

# Windows
# Download from https://git-scm.com/download/win

# Linux (Ubuntu/Debian)
sudo apt-get install git

# Verify
git --version
```

---

### ❌ NPM Dependencies Missing

**Error:**
```
✗ NPM Dependencies: Missing js-yaml, glob
```

**Cause:** Required npm packages not installed

**Fix:**
```bash
# Install all at once
npm install js-yaml glob inquirer

# Or individually
npm install js-yaml
npm install glob
npm install inquirer

# Verify
npm list js-yaml glob inquirer
```

---

### ❌ Git Hooks Not Installed

**Error:**
```
✗ Git Hooks: Navigator hook not found in .husky/post-commit
```

**Cause:** Husky not configured or Navigator hook missing

**Fix:**
```bash
# Step 1: Ensure Husky is installed
npm run prepare

# Step 2: Install Navigator hook
node squads/navigator/scripts/install-hooks.js install

# Step 3: Verify
cat .husky/post-commit
# Should contain: node squads/navigator/scripts/post-commit-hook.js
```

---

### ❌ Invalid Pipeline Map

**Error:**
```
✗ Pipeline Map: YAML syntax error at line 42
```

**Cause:** Malformed YAML in pipeline map

**Fix:**
```bash
# Validate YAML syntax
cat squads/navigator/data/navigator-pipeline-map.yaml

# Common issues:
# - Inconsistent indentation (use 2 spaces)
# - Missing colons after keys
# - Unquoted strings with special characters

# Example fix:
# Bad:  description: Tasks & Features
# Good: description: "Tasks & Features"
```

---

## Phase Detection Issues

### ❌ Wrong Phase Detected

**Problem:** `*where-am-i` shows Phase 3 but you're actually in Phase 5

**Cause:** Output files from Phase 5 don't match pipeline map patterns

**Diagnosis:**
```bash
# 1. Check what files exist
ls docs/stories/story-*.md

# 2. Compare with pipeline map outputs
cat squads/navigator/data/navigator-pipeline-map.yaml | grep "outputs:" -A 5

# 3. Verify glob patterns match
```

**Fix:**
```yaml
# Option 1: Update pipeline map to match your structure
# Edit: data/navigator-pipeline-map.yaml
outputs:
  - "docs/stories/story-*.md"  # Must match your actual files

# Option 2: Rename files to match pipeline map
mv docs/user-stories/* docs/stories/
```

---

### ❌ Completion Percentage Wrong

**Problem:** `*where-am-i` shows 0% but stories exist

**Cause:** Story files missing YAML front-matter or status field

**Diagnosis:**
```bash
# Check a story file
head -10 docs/stories/story-7.1.md
```

**Expected format:**
```markdown
---
id: story-7.1
title: User authentication
status: completed  # Must have this!
---

# Story content...
```

**Fix:**
```bash
# Add front-matter to all stories
# Use this template:
cat > docs/stories/story-X.Y.md <<'EOF'
---
id: story-X.Y
title: Story title
status: pending  # or: in-progress, completed
---

# Story content
EOF
```

---

### ❌ Phase Stuck (Not Advancing)

**Problem:** Completed all phase outputs but `*auto-navigate` doesn't advance

**Cause:** Transition rules blocking advancement

**Diagnosis:**
```bash
# Check for blockers
*where-am-i | grep "Blockers"
```

**Fix:**
```bash
# Option 1: Resolve the blocker
# (e.g., fix failing tests, complete missing stories)

# Option 2: Override transition rule
# Edit roadmap.md, set next_phase manually
```

---

## Roadmap Sync Problems

### ❌ Sync Conflicts

**Problem:** Central and local roadmaps differ, sync fails

**Error:**
```
⚠️  Roadmap sync conflict detected!
Central: modified 2026-02-15 14:30:00
Local: modified 2026-02-15 16:45:00
```

**Fix:**
```bash
# Option 1: Keep central version
cp .aios/navigator/{project}/roadmap.md docs/roadmap.md

# Option 2: Keep local version
cp docs/roadmap.md .aios/navigator/{project}/roadmap.md

# Option 3: Manual merge
# Open both files and merge changes manually
code docs/roadmap.md .aios/navigator/{project}/roadmap.md
```

---

### ❌ Sync Fails Silently

**Problem:** Git commits don't trigger roadmap sync

**Cause:** Post-commit hook not executing

**Diagnosis:**
```bash
# Check hook exists
ls -la .husky/post-commit

# Check hook has execute permission
stat .husky/post-commit

# Test hook manually
bash .husky/post-commit
```

**Fix:**
```bash
# Make executable
chmod +x .husky/post-commit

# Verify Navigator hook is present
grep "post-commit-hook.js" .husky/post-commit
```

---

## Checkpoint Issues

### ❌ Checkpoint Creation Fails

**Error:**
```
Error: ENOENT: no such file or directory
```

**Cause:** Checkpoint directory doesn't exist

**Fix:**
```bash
# Create checkpoint directory
mkdir -p .aios/navigator/{your-project-name}/checkpoints/

# Retry
@navigator
*checkpoint
```

---

### ❌ Duplicate Checkpoint Warning

**Warning:**
```
⚠️  Checkpoint cp-7-manual-20260215-143022 already exists. Overwrite? (y/n)
```

**Cause:** Checkpoint with same ID exists (rare, but possible)

**Fix:**
```bash
# Option 1: Skip (recommended)
# Press 'n' to skip

# Option 2: Overwrite
# Press 'y' to overwrite (loses previous checkpoint)

# Option 3: List checkpoints first
*checkpoint --list
# Delete old checkpoint if needed
rm .aios/navigator/{project}/checkpoints/cp-7-manual-20260215-143022.json
```

---

### ❌ Cannot Restore Checkpoint

**Error:**
```
Error: Checkpoint file corrupted or invalid JSON
```

**Cause:** JSON syntax error in checkpoint file

**Fix:**
```bash
# Validate JSON
cat .aios/navigator/{project}/checkpoints/cp-X-type-timestamp.json | jq .

# If invalid, restore from git history
git log --all --full-history -- .aios/navigator/{project}/checkpoints/
git checkout <commit-hash> -- .aios/navigator/{project}/checkpoints/cp-X.json
```

---

## Git Hook Problems

### ❌ Hook Fails with Permission Denied

**Error:**
```
bash: .husky/post-commit: Permission denied
```

**Cause:** Hook file not executable

**Fix:**
```bash
chmod +x .husky/post-commit
chmod +x .husky/pre-commit
```

---

### ❌ Hook Blocks Commits

**Problem:** Commits hang or fail due to hook

**Diagnosis:**
```bash
# Test hook manually
bash .husky/post-commit
# Check for errors
```

**Temporary Fix:**
```bash
# Skip hooks for one commit
git commit --no-verify -m "message"
```

**Permanent Fix:**
```bash
# Debug hook script
node squads/navigator/scripts/post-commit-hook.js --verbose

# Or disable Navigator hook temporarily
node squads/navigator/scripts/install-hooks.js uninstall
```

---

## Performance Issues

### ❌ *where-am-i is Slow (> 5 seconds)

**Cause:** Too many files to scan

**Diagnosis:**
```bash
# Count story files
ls docs/stories/story-*.md | wc -l
# If > 1000, that's the issue
```

**Fix:**
```yaml
# Optimize glob patterns in pipeline map
# Change from:
outputs:
  - "docs/**/*.md"  # Too broad

# To:
outputs:
  - "docs/stories/story-*.md"  # Specific
```

---

### ❌ Roadmap Sync Causes Lag

**Cause:** Large roadmap file (> 10MB)

**Fix:**
```bash
# Check file size
ls -lh .aios/navigator/{project}/roadmap.md

# If too large, split into multiple files
# Or compress old phase details
```

---

## Error Messages

### "Cannot read property 'id' of undefined"

**Cause:** Missing phase ID in roadmap

**Fix:**
```yaml
# Ensure all phases have id field
phases:
  - id: 1  # MUST be present
    name: Pesquisa
    # ...
```

---

### "YAML parse error: duplicated mapping key"

**Cause:** Duplicate keys in YAML

**Fix:**
```yaml
# Bad (duplicate "name")
phase:
  name: Pesquisa
  name: Research  # DUPLICATE!

# Good
phase:
  name: Pesquisa
  description: Research phase
```

---

### "Phase transition blocked"

**Cause:** Transition rule preventing advancement

**Fix:**
```bash
# Check roadmap transition rules
cat docs/roadmap.md | grep "transitions:" -A 20

# Resolve the blocking condition
# Or remove the blocking rule temporarily
```

---

### "Git commit not found in checkpoint"

**Cause:** Checkpoint created outside git repository

**Fix:**
```bash
# Ensure you're in a git repo
git status

# If not, initialize
git init
git add .
git commit -m "Initial commit"

# Retry checkpoint
*checkpoint
```

---

## Getting More Help

### Enable Debug Mode

```bash
export NAVIGATOR_DEBUG=true
*where-am-i
# Verbose output with debug info
```

### Check Logs

```bash
# Navigator logs (if logging enabled)
tail -f .aios/logs/navigator.log
```

### Run Full Diagnostic

```bash
*navigator-doctor --verbose
# Shows detailed diagnostic info
```

### Report a Bug

If none of these solutions work:

1. **Check existing issues:** https://github.com/SynkraAI/aios-core/issues
2. **Create new issue** with:
   - Error message (full text)
   - Output of `*navigator-doctor`
   - Steps to reproduce
   - Environment (OS, Node version)

---

## Common Pitfalls

### ❌ Editing Central Roadmap Directly

**Don't:**
```bash
# WRONG: Editing central file directly
vim .aios/navigator/{project}/roadmap.md
```

**Do:**
```bash
# RIGHT: Edit local copy, sync will handle central
vim docs/roadmap.md
git commit -m "Update roadmap"
# Hook syncs to central automatically
```

---

### ❌ Ignoring Health Check Warnings

**Don't:** Skip warnings from `*navigator-doctor`

**Do:** Fix all warnings before proceeding

---

### ❌ Manual Roadmap Edits Without Sync

**Don't:** Edit roadmap and forget to sync

**Do:**
```bash
# After manual edits
*update-roadmap --force-sync
```

---

**Still stuck?** Open an issue with full error details: https://github.com/SynkraAI/aios-core/issues

---

*Navigator Troubleshooting Guide v1.0*
