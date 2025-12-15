# BACKLOG: Fix Pre-existing Test Failures

**ID:** 1732978800001
**Type:** Tech Debt
**Priority:** 🟠 High
**Effort:** ~30 minutes
**Created:** 2025-12-01
**Status:** 🟡 Ready

---

## Summary

Pre-existing test failures from Sprint 1-2 that were not caused by Story 3.0 security changes. These tests need to be fixed or updated to match current code behavior.

---

## Failing Tests

### 1. IDE Config Generator Test
**File:** `tests/unit/wizard/ide-config-generator.test.js`
**Test:** `should render template with variables`
**Error:** `ENOENT: no such file or directory, open '...\.test-temp\.cursorrules'`
**Root Cause:** Test expects `.cursorrules` file to be created but IDE config generation changed

### 2. V21 Path Validation Test
**File:** `tests/installer/v21-path-validation.test.js`
**Test:** (empty test suite)
**Error:** `Your test suite must contain at least one test`
**Root Cause:** Test file was created but never populated with tests

---

## Acceptance Criteria

- [ ] AC1: `ide-config-generator.test.js` passes (fix file creation or update expectations)
- [ ] AC2: `v21-path-validation.test.js` has at least one test or is removed
- [ ] AC3: Full test suite runs with 0 failures
- [ ] AC4: No new test failures introduced

---

## Recommended Fix Approach

### Option A: Fix Tests (Preferred)
1. Update `ide-config-generator.test.js` to match current IDE config behavior
2. Either populate `v21-path-validation.test.js` with actual tests or remove it

### Option B: Skip/Remove Tests
1. Mark failing tests as `.skip()` with TODO comment
2. Create follow-up story to properly implement tests

---

## Impact

| Metric | Current | Target |
|--------|---------|--------|
| Test Failures | 3 | 0 |
| Test Suites Failing | 2 | 0 |
| CI/CD Status | ⚠️ Warning | ✅ Green |

---

## Dependencies

- None (independent tech debt item)

## Blocks

- Clean CI/CD pipeline
- Reliable quality gates

---

## Scheduling

**Recommended Sprint:** 3 (parallel with feature work)
**Can be done by:** @dev (Dex)
**Estimated Time:** 30 minutes

---

## Change Log

| Date | Description | Author |
|------|-------------|--------|
| 2025-12-01 | Backlog item created | Pax (@po) |

---

**Created by:** Pax 🎯 (PO)
**Origin:** Sprint 3 Pre-Push Quality Gate findings
