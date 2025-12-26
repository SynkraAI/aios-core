# Story TD-1: Code Cleanup Quick Wins

<!-- Source: Sprint 13 Technical Debt -->
<!-- Context: ESLint fixes + Orphaned legacy files cleanup -->
<!-- Type: Tech Debt -->

## Status: Draft

**Priority:** HIGH (Quick Win)
**Sprint:** 13
**Effort:** 1-2h
**Lead:** @dev (Dex)

---

## Story

**As a** developer working on aios-core,
**I want** the codebase free of unused variables and orphaned legacy files,
**So that** I have a clean, maintainable codebase without noise from deprecated artifacts.

---

## Background

This story consolidates two related tech debt items:

| Original ID | Title | Effort |
|-------------|-------|--------|
| 1734912000001 | ESLint `_error` Variable Fix | 15min |
| 1734912000006 | Cleanup Orphaned Legacy Files | 30min |

### Problem 1: ESLint `_error` Variables

14 files contain unused `_error` catch variables that trigger ESLint warnings:

```javascript
// Current (triggers warning)
} catch (_error) {
  // error not used
}

// Fix option 1: Remove variable
} catch {
  // ES2019+ syntax
}

// Fix option 2: Use error
} catch (error) {
  console.error('Operation failed:', error);
}
```

**Files affected:**
- `.aios-core/core/session/context-loader.js`
- `src/installer/brownfield-upgrader.js`
- `.aios-core/infrastructure/scripts/yaml-validator.js`
- And 11 more files

### Problem 2: Orphaned Legacy Files

Large amount of deprecated files consuming space and causing confusion:

| Location | Files | Size |
|----------|-------|------|
| `.github/deprecated-docs/` | 100+ | ~500KB |
| `*.backup` files | 9 | ~50KB |
| `bin/aios-init.backup-v1.1.4.js` | 1 | ~20KB |

---

## Acceptance Criteria

### ESLint Fixes
1. All 14 files with `_error` updated to proper error handling
2. ESLint passes with no new warnings
3. No functionality changes (error handling behavior preserved)

### Legacy Cleanup
4. `.github/deprecated-docs/` directory removed
5. All `*.backup` files removed (after confirming not needed)
6. `bin/aios-init.backup-v1.1.4.js` removed
7. No references to removed files remain in codebase

### Validation
8. All tests pass
9. Lint passes
10. Build succeeds

---

## Tasks / Subtasks

### Task 1: Fix ESLint `_error` Variables (AC: 1-3)

**Responsável:** @dev (Dex)
**Effort:** 15-30min

- [ ] 1.1 Run `npm run lint` to identify all instances
- [ ] 1.2 Update each file using appropriate fix pattern
- [ ] 1.3 Verify lint passes with no new warnings
- [ ] 1.4 Run tests to ensure no regressions

### Task 2: Remove Deprecated Docs (AC: 4, 7)

**Responsável:** @dev (Dex)
**Effort:** 15min

- [ ] 2.1 Verify no active references to `.github/deprecated-docs/`
- [ ] 2.2 Remove `.github/deprecated-docs/` directory
- [ ] 2.3 Update `.gitignore` if needed

### Task 3: Remove Backup Files (AC: 5-6)

**Responsável:** @dev (Dex)
**Effort:** 15min

- [ ] 3.1 List all `*.backup` files
- [ ] 3.2 Verify originals exist and are current
- [ ] 3.3 Remove backup files
- [ ] 3.4 Remove `bin/aios-init.backup-v1.1.4.js`

### Task 4: Validation (AC: 8-10)

**Responsável:** @qa (Quinn)
**Effort:** 15min

- [ ] 4.1 Run full test suite
- [ ] 4.2 Run lint check
- [ ] 4.3 Run build
- [ ] 4.4 Verify no broken imports/references

---

## Dev Notes

### ESLint Fix Patterns

```javascript
// Pattern 1: Error not needed (most cases)
try {
  await riskyOperation();
} catch {
  return defaultValue;
}

// Pattern 2: Error used for logging
try {
  await riskyOperation();
} catch (error) {
  console.error('Failed:', error.message);
  throw error;
}
```

### Files to Remove

```bash
# Deprecated docs
rm -rf .github/deprecated-docs/

# Backup files
rm expansion-packs/minds/naval_ravikant/sources/**/*.backup
rm expansion-packs/mmos/minds/naval_ravikant/sources/**/*.backup
rm bin/aios-init.backup-v1.1.4.js
```

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking change from error handling | Low | Medium | Review each change carefully |
| Removing needed file | Low | Low | Check references before delete |

---

## Definition of Done

- [ ] All ESLint warnings for `_error` resolved
- [ ] All deprecated/backup files removed
- [ ] Tests pass
- [ ] Lint passes
- [ ] Build succeeds
- [ ] PR approved and merged

---

**Story Points:** 1
**Sprint:** 13
**Priority:** High (Quick Win)
**Type:** Tech Debt

---

## Change Log

| Date | Version | Author | Change |
|------|---------|--------|--------|
| 2025-12-26 | 1.0 | @po (Pax) | Story created from tech debt consolidation |
