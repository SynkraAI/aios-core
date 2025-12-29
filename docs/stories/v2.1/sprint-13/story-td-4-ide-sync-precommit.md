# Story TD-4: IDE Sync Pre-commit Auto-Stage

<!-- Source: Sprint 13 Technical Debt, Story 6.19 -->
<!-- Context: Automatically stage IDE sync changes in pre-commit hook -->
<!-- Type: Tech Debt -->
<!-- Related: Story 6.19 (IDE Sync) -->

## Status: Ready

**Priority:** MEDIUM
**Sprint:** 13
**Effort:** 1-2h
**Lead:** @dev (Dex)
**Approved by:** @po (Pax) - 2025-12-29

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
- Husky v9.1.7 **installed** as devDependency, but **NOT initialized**
- `prepare` script currently skips husky: `echo 'Skipping husky - not needed for NPM publish'`
- lint-staged already configured for IDE sync on agent changes
- Pre-commit hook directory (`.husky/`) does not exist
- Manual sync required after agent changes
- Changes to `.claude/commands/` may be forgotten

**Current package.json configuration:**
```json
{
  "husky": "^9.1.7",
  "lint-staged": "^15.5.0",
  "prepare": "echo 'Skipping husky - not needed for NPM publish'",
  "lint-staged": {
    ".aios-core/development/agents/*.md": ["npm run sync:ide"]
  }
}
```

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

## CodeRabbit Integration

### Story Type Analysis

**Primary Type**: Tech Debt / Developer Experience
**Secondary Type(s)**: Automation, CI/CD
**Complexity**: Low

### Specialized Agent Assignment

**Primary Agent**:
- @dev (Dex): Husky setup and hook implementation (Tasks 1, 2, 4, 5)

**Supporting Agents**:
- @qa (Quinn): Cross-platform testing (Task 3)

### Quality Gate Tasks

- [ ] Pre-Commit (@dev): Verify hook executes correctly
- [ ] Pre-PR (@qa): Test on Windows, macOS, verify bypass works
- [ ] Pre-Merge (@devops): Verify no CI performance regression

### Focus Areas

**Primary Focus**:
- Hook correctness and cross-platform compatibility
- IDE file sync accuracy

**Secondary Focus**:
- Performance (< 2 seconds)
- Developer experience (clear output)

---

## Tasks / Subtasks

### Task 1: Enable Husky (AC: 1)

**Responsável:** @dev (Dex)
**Effort:** 15min

- [ ] 1.1 ~~Install husky as dev dependency~~ (ALREADY INSTALLED: v9.1.7)
- [ ] 1.2 Initialize husky (creates `.husky/` directory)
- [ ] 1.3 Update prepare script in package.json

```bash
# Husky already installed, just initialize:
npx husky init

# Update package.json prepare script from:
# "prepare": "echo 'Skipping husky - not needed for NPM publish'"
# to:
# "prepare": "husky"
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

## File List

Files to be modified in this story:

### Files to MODIFY

| File | Action | Task |
|------|--------|------|
| `package.json` | Update prepare script from skip to husky | Task 1 |
| `CONTRIBUTING.md` | Add pre-commit hook documentation | Task 5 |
| `.aios-core/infrastructure/scripts/ide-sync/README.md` | Add hook integration docs | Task 5 |

### Files to CREATE

| File | Purpose | Task |
|------|---------|------|
| `.husky/pre-commit` | Pre-commit hook script | Task 2 |
| `.husky/_/husky.sh` | Husky runtime (auto-generated by `npx husky init`) | Task 1 |

### Directories to CREATE

| Directory | Purpose | Task |
|-----------|---------|------|
| `.husky/` | Husky hooks directory | Task 1 |
| `.husky/_/` | Husky internals | Task 1 |

**Total: 3 modified, 2 created (plus directory structure)**

---

## Change Log

| Date | Version | Author | Change |
|------|---------|--------|--------|
| 2025-12-26 | 1.0 | @po (Pax) | Story created from tech debt item |
| 2025-12-29 | 1.1 | @po (Pax) | PO Validation: Fixed Current State (husky installed not missing), added CodeRabbit Integration, File List sections, updated Task 1 title |
