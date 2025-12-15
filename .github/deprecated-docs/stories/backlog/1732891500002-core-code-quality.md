# Backlog Item: Core Module Code Quality Fixes

**ID:** 1732891500002
**Type:** Technical Debt
**Priority:** Medium
**Related Story:** [2.2 - Core Module Creation](../v2.1/sprint-2/story-2.2-core-module.md)
**Created:** 2025-11-29
**Created By:** @qa (Quinn)
**Effort:** 2 hours

---

## Description

Address LOW severity code quality findings identified by CodeRabbit during Story 2.2 QA review. These are minor improvements that enhance code reliability and maintainability.

---

## Issues to Address

### 1. YAML Validator Error Flag
**File:** `.aios-core/core/utils/yaml-validator.js:202-211`
**Severity:** MEDIUM

**Problem:** Validator pushes error but doesn't set `results.valid = false`.

**Fix:**
```javascript
if (typeof value !== 'string' || value.trim() === '') {
  results.valid = false;  // ADD THIS LINE
  results.errors.push({
    type: 'invalid_type',
    field: fullPath,
    message: `${fullPath} must be a non-empty string`
  });
}
```

### 2. Config Loader Path Resolution
**File:** `.aios-core/core/config/config-loader.js:92-117`
**Severity:** LOW

**Problem:** Uses relative path which may break when module is required from different CWD.

**Fix:** Use `__dirname` for absolute path resolution:
```javascript
const configPath = path.join(__dirname, '..', 'core-config.yaml');
```

### 3. Cache Hit Rate Calculation
**File:** `.aios-core/core/config/config-loader.js:219-227`
**Severity:** LOW

**Problem:** `cacheHitRate` divides by wrong denominator (loads vs total requests).

**Fix:**
```javascript
const total = performanceMetrics.cacheHits + performanceMetrics.cacheMisses;
const cacheHitRate = total > 0
  ? ((performanceMetrics.cacheHits / total) * 100).toFixed(1) + '%'
  : '0%';
```

### 4. Inline require('os')
**File:** `.aios-core/core/elicitation/session-manager.js:32-55`
**Severity:** LOW

**Problem:** Repeated `require('os')` inside `createSession`.

**Fix:** Move to top-level:
```javascript
const os = require('os');
// ... later in code
const hostname = os.hostname();
```

### 5. Markdown Formatting
**File:** `.aios-core/core/session/context-loader.js:156-160`
**Severity:** LOW

**Problem:** Command list markdown formatting issue with join.

**Fix:** Wrap each command properly before joining:
```javascript
const formattedCommands = commands.map(cmd => `*${cmd}*`).join(', ');
```

---

## Acceptance Criteria

- [ ] YAML validator sets valid=false when errors are pushed
- [ ] Config loader uses absolute path resolution
- [ ] Cache hit rate calculation uses correct denominator
- [ ] require('os') moved to top-level in session-manager
- [ ] Command list formatting fixed in context-loader
- [ ] All CORE-01 to CORE-07 tests still pass

---

## Tags

`quality`, `core`, `coderabbit`, `config`, `validation`
