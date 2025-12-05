# Skipped Tests Documentation

**Story:** 4.1 - Technical Debt Cleanup Sprint
**Updated:** 2025-12-05
**Status:** Tests pass with 0 failures

---

## Summary

All test suites now pass. The following test files are **excluded from Jest** (not skipped within Jest) because they use incompatible test frameworks:

| Test File | Reason | Framework | Owner | Future Fix |
|-----------|--------|-----------|-------|------------|
| `tests/installer/v21-path-validation.test.js` | Uses Node.js native `node:test` module | node:test | @dev | Run separately with `node --test` |
| `tools/quality-dashboard/tests/e2e/dashboard.spec.js` | Playwright E2E tests with ESM imports | Playwright | @qa | Run with `npx playwright test` |
| `tools/quality-dashboard/tests/e2e/accessibility.spec.js` | Playwright E2E tests with ESM imports | Playwright | @qa | Run with `npx playwright test` |

---

## Exclusion Configuration

These tests are excluded via `jest.config.js`:

```javascript
testPathIgnorePatterns: [
  '/node_modules/',
  // Playwright e2e tests (use ESM imports, run with Playwright not Jest)
  'tools/quality-dashboard/tests/e2e/',
  // Node.js native test runner tests (use node:test module)
  'tests/installer/v21-path-validation.test.js'
],
```

---

## Running Excluded Tests

### Node.js Native Tests
```bash
node --test tests/installer/v21-path-validation.test.js
```

### Playwright E2E Tests
```bash
cd tools/quality-dashboard
npx playwright test
```

---

## Test Fixes Applied (Story 4.1)

| Test File | Issue | Fix Applied |
|-----------|-------|-------------|
| `tests/unit/wizard/ide-config-generator.test.js` | Tests expected old config path `.cursorrules` | Updated to use v2.1 path `.cursor/rules.md` |

---

## Test Suite Status

- **Total Test Suites:** 103
- **Passed:** 76
- **Skipped (conditional):** 27
- **Failed:** 0

- **Total Tests:** 2234
- **Passed:** 1572
- **Skipped (conditional):** 662
- **Failed:** 0

Note: "Skipped" tests are conditional skips within test files (e.g., platform-specific tests skipped on Windows), not test failures.

---

*AIOS-FULLSTACK QA Documentation - Story 4.1*
