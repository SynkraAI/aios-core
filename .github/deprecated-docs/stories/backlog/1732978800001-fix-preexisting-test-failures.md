# Backlog Item: Fix Pre-existing Test Suite Failures

**ID:** 1732978800001
**Type:** Technical Debt
**Priority:** 🟠 High (Sprint 3 Pre-Work)
**Related Story:** [1.4 - IDE Selection](../v2.1/sprint-1/story-1.4-ide-selection.md), [6.1.2.4 - Agent Identity]
**Scheduled:** Sprint 3 Pre-Work (before 3.1-3.12)
**Created:** 2025-11-30
**Updated:** 2025-12-01
**Created By:** @github-devops (Gage)
**Effort:** 30 minutes

---

## Description

Fix 4 pre-existing test suite failures discovered during Story 2.10 pre-push quality gates. These failures are unrelated to Story 2.10 (Quality Gate Manager) and stem from earlier stories where code was updated but tests were not synchronized.

---

## Issues to Address

### 1. IDE Configs Test - Outdated Assertions
**File:** `tests/unit/config/ide-configs.test.js:64-127`
**Severity:** LOW

**Problem:** Tests expect old configuration values that were intentionally changed:
- `cursor.requiresDirectory`: expected `false`, actual `true`
- `cursor.configFile`: expected `.cursorrules`, actual `.cursor\rules.md`
- `antigravity.agentFolder`: expected `.antigravity`, actual `.agent\workflows`

**Solution:**
```javascript
// Line 75-76: Update cursor expectations
expect(IDE_CONFIGS.cursor.requiresDirectory).toBe(true);  // Changed from false

// Line 88: Update cursor configFile expectation
expect(IDE_CONFIGS.cursor.configFile).toContain('.cursor');  // Changed from '.cursorrules'

// Line 125: Update antigravity agentFolder expectation
expect(IDE_CONFIGS.antigravity.agentFolder).toContain('.agent');  // Changed from '.antigravity'
```

### 2. Wizard IDE Flow Test - Implementation Bug
**File:** `tests/integration/wizard-ide-flow.test.js`
**Severity:** MEDIUM
**Status:** PARTIALLY FIXED - Test paths updated, but implementation bug remains

**Problem:**
1. ~~Test path expectations use old .cursorrules path~~ (FIXED)
2. **Implementation bug**: `ide-config-generator.js` tries to copy agents from `.aios-core/agents` which doesn't exist

**Solution:**
- ✅ Test paths updated to use `.cursor/rules.md`
- 🔧 **NEW ISSUE**: Create `.aios-core/agents/` directory with agent files, OR update generator to handle missing directory gracefully

### 3. Project Status Loader Test - Wrong Import Path
**File:** `.aios-core/infrastructure/tests/project-status-loader.test.js:8`
**Severity:** LOW

**Problem:** Test uses incorrect relative path to import the module:
```javascript
// Current (wrong):
const { ProjectStatusLoader } = require('../project-status-loader');

// Correct:
const { ProjectStatusLoader } = require('../scripts/project-status-loader');
```

**Solution:**
- Update the require path on line 8
- Verify all tests pass after fix

---

## Acceptance Criteria

- [ ] All 4 test suites pass
- [ ] No regressions in other tests
- [ ] Total test count remains 56 suites

---

## Tags

`testing`, `technical-debt`, `ide-configs`, `infrastructure`

---

## Notes

- Discovered during Story 2.10 QA review
- Story 2.10 has 63/63 tests passing - these failures are independent
- Quick fix, low risk
