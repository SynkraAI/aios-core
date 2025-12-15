# Backlog Item: Core Module Security Hardening

**ID:** 1732891500001
**Type:** Technical Debt
**Priority:** 🔴 Critical (Promoted 2025-12-01)
**Scheduled:** Sprint 3 → Story 3.0
**Related Story:** [2.2 - Core Module Creation](../v2.1/sprint-2/story-2.2-core-module.md)
**Created:** 2025-11-29
**Created By:** @qa (Quinn)
**Effort:** 4 hours

---

## Description

Address MEDIUM severity security findings identified by CodeRabbit during Story 2.2 QA review. These are pre-existing issues in the migrated code that require hardening.

---

## Issues to Address

### 1. ReDoS Vulnerability in Elicitation Engine
**File:** `.aios-core/core/elicitation/elicitation-engine.js:328-332`
**Severity:** MEDIUM

**Problem:** The code constructs a RegExp directly from `validator.pattern` (user-controlled) which can trigger ReDoS (Regular Expression Denial of Service).

**Solution:**
- Validate the pattern before use (use `safe-regex` package or `re2` binding)
- Wrap compilation in try/catch
- Return safe validation failure if pattern is rejected

### 2. Path Traversal in Session Manager
**File:** `.aios-core/core/elicitation/session-manager.js:274-276`
**Severity:** MEDIUM

**Problem:** `getSessionPath` accepts arbitrary sessionId strings and is vulnerable to path traversal attacks.

**Solution:**
- Validate sessionId matches strict hex pattern (`/^[a-f0-9]{16}$/i`)
- Reject or throw on invalid input
- Use `path.join()` instead of string concatenation

### 3. Missing Error Handling in loadSession
**File:** `.aios-core/core/elicitation/elicitation-engine.js:376-382`
**Severity:** MEDIUM

**Problem:** `loadSession` calls `fs.readJson` without error handling.

**Solution:**
- Wrap `fs.readJson` in try-catch
- Log or rethrow with clear error message including sessionPath
- Return sensible failure value

### 4. Uninitialized Variable in completeSession
**File:** `.aios-core/core/elicitation/elicitation-engine.js:411-420`
**Severity:** MEDIUM

**Problem:** `completeSession` uses `this.currentSession` which is never initialized.

**Solution:**
- Initialize `this.currentSession` in constructor or `startSession`
- Or change references to use existing `this.sessionData`

---

## Acceptance Criteria

- [ ] ReDoS vulnerability mitigated with pattern validation
- [ ] Path traversal prevented with sessionId validation
- [ ] Error handling added to loadSession
- [ ] Variable initialization fixed in completeSession
- [ ] No regression in CORE-01 to CORE-07 tests
- [ ] CodeRabbit scan shows no MEDIUM+ security findings

---

## Implementation Notes

Consider adding dependency:
```bash
npm install safe-regex
```

Or use native validation:
```javascript
function isSafePattern(pattern) {
  try {
    new RegExp(pattern);
    // Add complexity checks
    return true;
  } catch {
    return false;
  }
}
```

---

## Tags

`security`, `core`, `coderabbit`, `elicitation`, `session-manager`
