# Story TD-4: IDE Sync Pre-commit Auto-Stage

<!-- Source: Sprint 13 Technical Debt -->
<!-- Context: Automatically stage IDE sync changes in pre-commit hook -->
<!-- Type: Tech Debt -->

## Status: Draft

**Priority:** MEDIUM
**Sprint:** 13
**Effort:** 1-2h
**Lead:** @dev (Dex)

---

## Story

**As a** developer using AIOS with IDE integrations,
**I want** IDE sync changes to be automatically staged in pre-commit hooks,
**So that** my agent definitions are always in sync with IDE configuration files.

---

## Background

| Original ID | Title | Effort |
|-------------|-------|--------|
| 1734912000004 | IDE Sync Pre-commit Auto-Stage | 1-2h |

### Current State

- IDE sync script exists: `.aios-core/infrastructure/scripts/ide-sync/`
- No pre-commit hook is configured
- Manual sync required after agent changes
- Changes to `.claude/commands/` may be forgotten

### Target State

- Pre-commit hook runs IDE sync
- Changed files automatically staged
- Clear feedback on what was synced
- Optional bypass with `--no-verify`

---

## Acceptance Criteria

1. Husky pre-commit hook installed and configured
2. IDE sync runs automatically before each commit
3. Changed IDE files are auto-staged
4. Clear console output showing sync status
5. Hook can be bypassed with `git commit --no-verify`
6. Works on Windows, macOS, and Linux
7. No performance impact > 2 seconds

---

## Tasks / Subtasks

### Task 1: Install Husky (AC: 1)

**Responsável:** @dev (Dex)
**Effort:** 15min

- [ ] 1.1 Install husky as dev dependency
- [ ] 1.2 Initialize husky
- [ ] 1.3 Add prepare script to package.json

```bash
npm install husky --save-dev
npx husky init
```

### Task 2: Create Pre-commit Hook (AC: 2-4)

**Responsável:** @dev (Dex)
**Effort:** 30min

- [ ] 2.1 Create `.husky/pre-commit` file
- [ ] 2.2 Add IDE sync execution
- [ ] 2.3 Auto-stage changed files
- [ ] 2.4 Add status output

**Pre-commit Hook:**
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔄 Running IDE Sync..."

# Run IDE sync
node .aios-core/infrastructure/scripts/ide-sync/index.js --quiet

# Check if any IDE files changed
IDE_FILES=$(git diff --name-only .claude/commands/ .cursor/commands/ .windsurf/commands/ 2>/dev/null)

if [ -n "$IDE_FILES" ]; then
  echo "📝 Auto-staging IDE sync changes:"
  echo "$IDE_FILES"
  git add .claude/commands/ .cursor/commands/ .windsurf/commands/ 2>/dev/null
  echo "✅ IDE files staged"
else
  echo "✅ IDE files already in sync"
fi
```

### Task 3: Cross-Platform Testing (AC: 6)

**Responsável:** @qa (Quinn)
**Effort:** 30min

- [ ] 3.1 Test on Windows (Git Bash)
- [ ] 3.2 Test on macOS
- [ ] 3.3 Test on Linux (if available)
- [ ] 3.4 Verify bypass with `--no-verify`

### Task 4: Performance Validation (AC: 7)

**Responsável:** @dev (Dex)
**Effort:** 15min

- [ ] 4.1 Measure hook execution time
- [ ] 4.2 Optimize if > 2 seconds
- [ ] 4.3 Add `--quiet` mode to IDE sync if needed

### Task 5: Documentation (AC: 5)

**Responsável:** @dev (Dex)
**Effort:** 15min

- [ ] 5.1 Document in CONTRIBUTING.md
- [ ] 5.2 Add bypass instructions
- [ ] 5.3 Update IDE sync README

---

## Dev Notes

### Husky Setup

```json
// package.json
{
  "scripts": {
    "prepare": "husky"
  },
  "devDependencies": {
    "husky": "^9.0.0"
  }
}
```

### Alternative: lint-staged Integration

```json
// package.json
{
  "lint-staged": {
    ".aios-core/development/agents/*.md": [
      "node .aios-core/infrastructure/scripts/ide-sync/index.js",
      "git add .claude/commands/ .cursor/commands/ .windsurf/commands/"
    ]
  }
}
```

### IDE Sync Script Enhancement

```javascript
// Add --quiet flag support
const quiet = process.argv.includes('--quiet');

if (!quiet) {
  console.log('Syncing agents to IDE commands...');
}
```

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Hook slows commits | Low | Medium | Performance optimization |
| Windows compatibility | Medium | Low | Test on Windows |
| Breaks existing workflow | Low | Low | Can bypass with --no-verify |

---

## Definition of Done

- [ ] Husky installed and configured
- [ ] Pre-commit hook works
- [ ] IDE files auto-staged
- [ ] Works cross-platform
- [ ] Performance < 2 seconds
- [ ] Documentation updated
- [ ] PR approved and merged

---

**Story Points:** 2
**Sprint:** 13
**Priority:** Medium
**Type:** Tech Debt

---

## Change Log

| Date | Version | Author | Change |
|------|---------|--------|--------|
| 2025-12-26 | 1.0 | @po (Pax) | Story created from tech debt item |
