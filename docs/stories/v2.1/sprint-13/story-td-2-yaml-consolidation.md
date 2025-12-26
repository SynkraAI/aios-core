# Story TD-2: YAML Library Consolidation

<!-- Source: Sprint 13 Technical Debt -->
<!-- Context: Standardize YAML library usage + Fix parse warnings -->
<!-- Type: Tech Debt -->

## Status: Draft

**Priority:** MEDIUM
**Sprint:** 13
**Effort:** 3-5h
**Lead:** @dev (Dex)

---

## Story

**As a** developer working on aios-core,
**I want** a standardized YAML library usage across the codebase,
**So that** I avoid parse warnings, have consistent behavior, and reduce bundle size.

---

## Background

This story consolidates two related tech debt items:

| Original ID | Title | Effort |
|-------------|-------|--------|
| 1734912000005 | Fix YAML Parse Warnings | 2-3h |
| 1734912000002 | YAML Library Standardization | 1-2h |

### Current State

- **181 files** use YAML parsing/dumping
- Multiple patterns exist:
  - `require('js-yaml')`
  - `yaml.load()` vs `yaml.safeLoad()` (deprecated)
  - Inconsistent error handling
  - Some files have parse warnings

### Target State

- Single import pattern: `const yaml = require('js-yaml');`
- Use `yaml.load()` with schema option for safety
- Consistent error handling with helpful messages
- Zero parse warnings

---

## Acceptance Criteria

### Standardization
1. All YAML operations use `js-yaml` library
2. Deprecated `safeLoad`/`safeDump` replaced with `load`/`dump`
3. Consistent import pattern across all files
4. Schema option used for type safety where needed

### Parse Warnings
5. All YAML parse warnings resolved
6. Error messages include file path and line number
7. Graceful handling of malformed YAML

### Quality
8. All tests pass
9. No new ESLint warnings
10. YAML-related tests have >80% coverage

---

## Tasks / Subtasks

### Task 1: Audit Current Usage (AC: 1)

**Responsável:** @dev (Dex)
**Effort:** 30min

- [ ] 1.1 Grep all YAML imports/requires
- [ ] 1.2 Document different patterns found
- [ ] 1.3 Identify deprecated usage (`safeLoad`, `safeDump`)
- [ ] 1.4 List files with parse warnings

### Task 2: Create Standard Pattern (AC: 2-4)

**Responsável:** @dev (Dex)
**Effort:** 30min

- [ ] 2.1 Define standard import pattern
- [ ] 2.2 Create helper utility if needed
- [ ] 2.3 Document in coding standards

**Standard Pattern:**
```javascript
const yaml = require('js-yaml');

// Safe loading with error context
function loadYaml(content, filePath) {
  try {
    return yaml.load(content, {
      filename: filePath,
      schema: yaml.DEFAULT_SCHEMA
    });
  } catch (error) {
    throw new Error(`YAML parse error in ${filePath}: ${error.message}`);
  }
}

// Safe dumping
function dumpYaml(data, options = {}) {
  return yaml.dump(data, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    ...options
  });
}
```

### Task 3: Update Core Files (AC: 2-4)

**Responsável:** @dev (Dex)
**Effort:** 1-2h

Priority files (most used):
- [ ] 3.1 `.aios-core/core/config/config-loader.js`
- [ ] 3.2 `.aios-core/development/scripts/squad/*.js`
- [ ] 3.3 `.aios-core/infrastructure/scripts/*.js`
- [ ] 3.4 `src/wizard/*.js`
- [ ] 3.5 `bin/*.js`

### Task 4: Fix Parse Warnings (AC: 5-7)

**Responsável:** @dev (Dex)
**Effort:** 1h

- [ ] 4.1 Run codebase and capture all YAML warnings
- [ ] 4.2 Fix each warning (usually schema or encoding issues)
- [ ] 4.3 Add proper error context to all parse operations
- [ ] 4.4 Verify no warnings remain

### Task 5: Update Tests (AC: 8-10)

**Responsável:** @qa (Quinn)
**Effort:** 1h

- [ ] 5.1 Update YAML-related tests to use new patterns
- [ ] 5.2 Add tests for error handling edge cases
- [ ] 5.3 Verify coverage >80% for YAML utilities
- [ ] 5.4 Run full test suite

---

## Dev Notes

### Common Issues to Fix

```javascript
// Issue 1: Deprecated safeLoad
// Before
const data = yaml.safeLoad(content);
// After
const data = yaml.load(content);

// Issue 2: Missing error context
// Before
const data = yaml.load(content);
// After
const data = yaml.load(content, { filename: filePath });

// Issue 3: Inconsistent dump options
// Before
yaml.dump(data);
// After
yaml.dump(data, { indent: 2, lineWidth: 120 });
```

### Files by Priority

| Priority | Count | Location |
|----------|-------|----------|
| High | 15 | `.aios-core/core/` |
| High | 25 | `.aios-core/development/scripts/squad/` |
| Medium | 40 | `.aios-core/infrastructure/` |
| Low | 100+ | Tests, templates |

### Optional: Create Utility Module

```javascript
// .aios-core/core/utils/yaml-utils.js
const yaml = require('js-yaml');

module.exports = {
  load: (content, filePath) => { /* ... */ },
  dump: (data, options) => { /* ... */ },
  loadFile: async (filePath) => { /* ... */ },
  dumpFile: async (filePath, data) => { /* ... */ }
};
```

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking YAML parsing | Medium | High | Test each file after change |
| Behavior difference | Low | Medium | js-yaml is already the standard |

---

## Definition of Done

- [ ] All files use standardized YAML pattern
- [ ] No deprecated `safeLoad`/`safeDump` usage
- [ ] Zero YAML parse warnings
- [ ] All tests pass
- [ ] Documentation updated
- [ ] PR approved and merged

---

**Story Points:** 3
**Sprint:** 13
**Priority:** Medium
**Type:** Tech Debt

---

## Change Log

| Date | Version | Author | Change |
|------|---------|--------|--------|
| 2025-12-26 | 1.0 | @po (Pax) | Story created from tech debt consolidation |
