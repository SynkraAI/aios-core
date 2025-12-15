# Story 1.8 - Test Coverage Improvement Plan

**Date:** 2025-11-23
**QA Agent:** Quinn (qa)
**Status:** Ready for Implementation
**Estimated Time:** 5-8 hours

---

## Objective

Increase test coverage from **34.1%** to **>80%** for all Story 1.8 validation modules.

---

## Current Coverage Status

| Module | Current Coverage | Target | Gap | Priority |
|--------|-----------------|--------|-----|----------|
| file-structure-validator.js | 93.61% | >80% | ✅ PASS | - |
| config-validator.js | 51.02% | >80% | 28.98% | HIGH |
| dependency-validator.js | 62.5% | >80% | 17.5% | HIGH |
| mcp-health-checker.js | 14.28% | >80% | 65.72% | CRITICAL |
| report-generator.js | 1.53% | >80% | 78.47% | CRITICAL |
| troubleshooting-system.js | 4.49% | >80% | 75.51% | CRITICAL |

---

## Implementation Plan

### Phase 1: Critical Priority Tests (4-5 hours)

#### Task 1.1: MCP Health Checker Tests (1.5h)
**File:** `tests/unit/wizard/validation/mcp-health-checker.test.js`

**Test Cases:**
1. ✅ Should validate MCPs with all installations successful
2. ✅ Should skip health checks when no MCPs installed
3. ✅ Should handle missing .mcp.json gracefully
4. ✅ Should validate Browser MCP configuration
5. ✅ Should test Context7 MCP SSE connection (mock HTTP)
6. ✅ Should detect Exa API key placeholder
7. ✅ Should validate Exa with real API key configured
8. ✅ Should validate Desktop Commander MCP configuration
9. ✅ Should handle MCP health check timeouts
10. ✅ Should aggregate health check results correctly
11. ✅ Should mark all checks as failed when all MCPs unhealthy
12. ✅ Should handle health check errors gracefully

**Coverage Target:** >80% (from 14.28%)

**Mock Requirements:**
- `fs.existsSync`, `fs.readFileSync` for .mcp.json
- `http.get`, `https.get` for Context7 SSE test
- Mock health check functions

---

#### Task 1.2: Report Generator Tests (1.5h)
**File:** `tests/unit/wizard/validation/report-generator.test.js`

**Test Cases:**
1. ✅ Should generate report for successful validation
2. ✅ Should generate report with warnings
3. ✅ Should generate report with errors
4. ✅ Should generate report with mixed results
5. ✅ Should format file validation results correctly
6. ✅ Should format config validation results correctly
7. ✅ Should format MCP health check results correctly
8. ✅ Should format dependency validation results correctly
9. ✅ Should display overall status (success/warning/partial/failed)
10. ✅ Should list warnings section when warnings present
11. ✅ Should list errors section when errors present
12. ✅ Should display next steps section
13. ✅ Should use chalk colors correctly (green/yellow/red)
14. ✅ Should handle empty validation results

**Coverage Target:** >80% (from 1.53%)

**Mock Requirements:**
- `chalk` color functions (or test without color codes)
- Sample validation result objects

---

#### Task 1.3: Troubleshooting System Tests (1.5h)
**File:** `tests/unit/wizard/validation/troubleshooting-system.test.js`

**Test Cases:**
1. ✅ Should return troubleshooting for known error codes
2. ✅ Should handle unknown error codes gracefully
3. ✅ Should format troubleshooting output correctly
4. ✅ Should provide solutions for ENV_FILE_MISSING
5. ✅ Should provide solutions for MCP_HEALTH_TIMEOUT
6. ✅ Should provide solutions for CORE_CONFIG_MISSING
7. ✅ Should provide solutions for GITIGNORE_MISSING
8. ✅ Should provide solutions for dependency errors
9. ✅ Should prioritize errors by severity (critical > high > medium > low)
10. ✅ Should include documentation links
11. ✅ Should include support contact information
12. ✅ Should handle empty errors array
13. ✅ Should handle interactive prompts (mock inquirer)

**Coverage Target:** >80% (from 4.49%)

**Mock Requirements:**
- `inquirer` for interactive troubleshooting prompts
- Sample error objects with various codes

---

### Phase 2: High Priority Tests (2-3 hours)

#### Task 2.1: Config Validator Tests (1h)
**File:** `tests/unit/wizard/validation/config-validator.test.js`

**Test Cases:**
1. ✅ Should validate .env file successfully
2. ✅ Should detect missing .env file
3. ✅ Should detect missing required env variables
4. ✅ Should detect potential hardcoded credentials
5. ✅ Should validate core-config.yaml YAML syntax
6. ✅ Should detect missing core-config.yaml
7. ✅ Should detect invalid YAML syntax
8. ✅ Should validate required keys in core-config
9. ✅ Should validate .mcp.json schema
10. ✅ Should handle missing .mcp.json (optional)
11. ✅ Should detect invalid JSON in .mcp.json
12. ✅ Should validate .gitignore entries
13. ✅ Should detect missing critical .gitignore entries (.env, node_modules)
14. ✅ Should warn about missing recommended .gitignore entries

**Coverage Target:** >80% (from 51.02%)

**Mock Requirements:**
- `fs.existsSync`, `fs.readFileSync` for all config files
- `yaml.parse` for YAML validation

---

#### Task 2.2: Dependency Validator Tests (1h)
**File:** `tests/unit/wizard/validation/dependency-validator.test.js`

**Test Cases:**
1. ✅ Should validate dependencies successfully
2. ✅ Should detect missing node_modules directory
3. ✅ Should validate package.json exists
4. ✅ Should count installed packages
5. ✅ Should run npm audit (mock child_process)
6. ✅ Should handle npm audit vulnerabilities
7. ✅ Should detect critical vulnerabilities
8. ✅ Should handle npm audit errors gracefully
9. ✅ Should validate critical dependencies installed
10. ✅ Should handle missing package.json
11. ✅ Should handle corrupted package.json

**Coverage Target:** >80% (from 62.5%)

**Mock Requirements:**
- `fs.existsSync`, `fs.readFileSync`, `fs.readdirSync`
- `child_process.exec` for npm audit
- Sample npm audit output (clean and with vulnerabilities)

---

## Testing Best Practices

### Test Structure
```javascript
describe('Module Name', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('functionName', () => {
    it('should handle success case', async () => {
      // Given (setup)
      const mockData = { /* test data */ };

      // When (execution)
      const result = await functionName(mockData);

      // Then (assertions)
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle error case', async () => {
      // Given
      // When
      // Then
    });
  });
});
```

### Mock Patterns

**File System Mocks:**
```javascript
jest.mock('fs');

beforeEach(() => {
  fs.existsSync.mockReturnValue(true);
  fs.readFileSync.mockReturnValue('file content');
});
```

**HTTP Request Mocks:**
```javascript
jest.mock('http');

it('should test HTTP request', () => {
  http.get.mockImplementation((url, options, callback) => {
    callback({
      statusCode: 200,
      on: jest.fn()
    });
    return {
      on: jest.fn(),
      destroy: jest.fn()
    };
  });
});
```

**Child Process Mocks:**
```javascript
jest.mock('child_process');

childProcess.exec.mockImplementation((cmd, callback) => {
  callback(null, 'command output', '');
});
```

---

## Verification Checklist

After completing all tests:

- [ ] Run `npm test -- --coverage --testPathPatterns="wizard.*validation"`
- [ ] Verify overall coverage >80% for all modules
- [ ] Verify all tests passing (no failures)
- [ ] Run `npm run lint` - ensure no new linting errors
- [ ] Update Story 1.8 QA Results with new coverage numbers
- [ ] Request re-review from @qa for PASS gate

---

## Expected Outcome

**Before:**
- Overall Coverage: 34.1%
- Test Files: 1/6 modules
- Quality Gate: CONCERNS (72/100)

**After:**
- Overall Coverage: >80%
- Test Files: 6/6 modules
- Quality Gate: PASS (>85/100)

---

## Implementation Assignment

**Recommended Agent:** @dev (Dex)
**Priority:** HIGH
**Blocking:** Story 1.8 merge to main

**Command to execute:**
```bash
@dev Please implement the unit tests outlined in docs/qa/story-1.8-test-coverage-plan.md
Focus on achieving >80% coverage for all 5 remaining validation modules.
```

---

**Created by:** Quinn (qa)
**Date:** 2025-11-23
**Story:** 1.8 - Installation Validation
