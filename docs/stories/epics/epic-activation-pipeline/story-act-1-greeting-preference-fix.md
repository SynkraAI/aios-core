# Story ACT-1: Fix GreetingPreferenceManager Configuration

**Epic:** [EPIC-ACT - Unified Agent Activation Pipeline](EPIC-ACT-INDEX.md)
**Status:** Ready for Review
**Priority:** Critical
**Complexity:** Low
**Created:** 2026-02-05

---

## Executor Assignment

executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: ["code-review", "config-validation"]

---

## Story

**As a** framework maintainer,
**I want** the `GreetingPreferenceManager` to read the `preference` key from `core-config.yaml` correctly,
**so that** users can control greeting verbosity (minimal/named/archetypal/auto) through configuration instead of always getting the silent default.

---

## Acceptance Criteria

1. `preference: auto` key exists under `agentIdentity.greeting` in `.aios-core/core-config.yaml`
2. `GreetingPreferenceManager.getPreference()` reads the new key and returns its value (not just defaulting)
3. Inline YAML comment documents valid values with format: `# Valid values: auto | minimal | named | archetypal`
4. Unit test confirms preference is read from config file (not silently defaulting)
5. All 4 preference values (`auto`, `minimal`, `named`, `archetypal`) produce expected greeting behavior when set

---

## 🤖 CodeRabbit Integration

### Story Type Analysis

**Primary Type**: Configuration
**Secondary Type(s)**: Bug Fix
**Complexity**: Low

### Specialized Agent Assignment

**Primary Agents**:
- @dev: Implementation and config fix

**Supporting Agents**:
- @architect: Config structure review

### Quality Gate Tasks

- [x] Pre-Commit (@dev): Run before marking story complete ✅ 20 tests passing
- [x] Code Review (@architect): Validate config structure and code patterns ✅ APPROVED
- [ ] Pre-PR (@devops): Run before creating pull request

> **Note:** @architect handles code review quality gate (executor assignment), @devops handles deployment gate (Pre-PR).

### Self-Healing Configuration

**Expected Self-Healing**:
- Primary Agent: @dev (light mode)
- Max Iterations: 2
- Timeout: 15 minutes
- Severity Filter: CRITICAL only

**Predicted Behavior**:
- CRITICAL issues: auto_fix (2 iterations, 15min)
- HIGH issues: document_only

### CodeRabbit Focus Areas

**Primary Focus**:
- YAML syntax correctness and valid values
- Config key path matches code expectations

**Secondary Focus**:
- Test coverage for all preference values
- Backward compatibility (existing configs without the key)

---

## Tasks / Subtasks

- [x] Task 1: Add `preference` key to core-config.yaml (AC: 1, 3)
  - [x] 1.1 Locate `agentIdentity.greeting` section in `.aios-core/core-config.yaml`
  - [x] 1.2 Add `preference: auto` with inline comment listing valid values
  - [x] 1.3 Verify YAML parses correctly after change
- [x] Task 2: Verify GreetingPreferenceManager reads new key (AC: 2)
  - [x] 2.1 Read `greeting-preference-manager.js:58-72` to confirm config path matches
  - [x] 2.2 Trace the config loading chain: `config-loader.js` → `core-config.yaml` → `greeting-preference-manager.js`
  - [x] 2.3 Decision point based on path verification:
    - **If path matches:** Config-only fix, proceed to Task 3 ✅ (Path matches!)
    - **If path mismatches:** Update code to read correct path `agentIdentity.greeting.preference`, then proceed to Task 3
- [x] Task 3: Add unit tests (AC: 4, 5)
  - [x] 3.1 Create test file `tests/core/greeting-preference-manager.test.js`
  - [x] 3.2 Test: preference is read from config (mock config with `preference: named`)
  - [x] 3.3 Test: each of 4 values produces correct greeting level
  - [x] 3.4 Test: missing key defaults to `auto` (backward compatibility)
- [x] Task 4: Verify end-to-end greeting behavior (AC: 5)
  - [x] 4.1 Test with `preference: minimal` — greeting shows only icon + "ready"
  - [x] 4.2 Test with `preference: named` — greeting shows name + archetype
  - [x] 4.3 Test with `preference: archetypal` — greeting shows full persona
  - [x] 4.4 Test with `preference: auto` — greeting adapts to session type

---

## Dev Notes

### Bug Analysis

**Root cause:** `greeting-preference-manager.js:58-72` reads config path `agentIdentity.greeting.preference` via the config loader, but this exact key does NOT exist in `.aios-core/core-config.yaml`. The manager has a fallback that silently returns `'auto'`, masking the missing configuration.

### Key Source Files

| File | Lines | Purpose |
|------|-------|---------|
| `.aios-core/core-config.yaml` | ~542 | Core configuration — missing `preference` key |
| `.aios-core/development/scripts/greeting-preference-manager.js` | 146 | Reads preference, has silent fallback |
| `.aios-core/core/config/config-loader.js` | - | Loads and parses core-config.yaml |

### Current Config Structure (what exists)

```yaml
agentIdentity:
  greeting:
    # preference key is MISSING — this is the bug
    levels:
      minimal: "..."
      named: "..."
      archetypal: "..."
```

### Expected Config Structure (after fix)

```yaml
agentIdentity:
  greeting:
    preference: auto  # Valid values: auto | minimal | named | archetypal
    levels:
      minimal: "{{icon}} {{agent_id}} Agent ready"
      named: "{{icon}} {{name}} ({{archetype}}) ready. {{greeting_phrase}}"
      archetypal: "{{icon}} {{name}} the {{archetype}} ready to {{archetype_action}}!"
```

> **Comment format must match AC3:** `# Valid values: auto | minimal | named | archetypal`

### Testing

**Test file location:** `tests/core/greeting-preference-manager.test.js`
**Test framework:** Jest
**Testing patterns:**
- Mock `config-loader.js` to return specific config objects
- Test each preference value against expected greeting output
- Test missing key defaults to `auto`
- Follow existing test patterns in `tests/core/`

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-05 | 1.0 | Story created from EPIC-ACT restructuring | @po (Pax) |
| 2026-02-06 | 1.1 | Validated and approved: clarified AC3 format, added decision point to Task 2.3, aligned Quality Gate agents | @po (Pax) |
| 2026-02-06 | 2.0 | Implementation complete: config key added, 20 tests passing, all ACs met | @dev (Dex) |

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- YAML validation: `node -e "yaml.load(...)"` - passed
- Unit tests: `npm test -- tests/core/greeting-preference-manager.test.js` - 20/20 passed
- Core regression: 1452 passed, 3 pre-existing failures (unrelated)

### Completion Notes List

1. **Config-only fix confirmed** - Code path `agentIdentity.greeting.preference` already correct in `greeting-preference-manager.js:26`
2. **No code changes required** - Only added missing config key
3. **Backward compatibility preserved** - Fallback to 'auto' when key missing
4. **Comprehensive test coverage** - 14 unit tests + 6 E2E behavior tests

### File List

| File | Action | Description |
|------|--------|-------------|
| `.aios-core/core-config.yaml` | Modified | Added `preference: auto` key at line 255 |
| `tests/core/greeting-preference-manager.test.js` | Created | 20 tests covering all ACs |

---

## QA Results

### QA Review Summary

**Reviewer:** Quinn (@qa)
**Date:** 2026-02-06
**Gate Decision:** ✅ **PASS**

### Requirements Traceability

| AC# | Status | Test Coverage |
|-----|--------|---------------|
| AC1 | ✅ | Config verified at line 255 |
| AC2 | ✅ | "should read preference from config file" |
| AC3 | ✅ | Comment format verified |
| AC4 | ✅ | 9 unit tests for getPreference() |
| AC5 | ✅ | 4 E2E tests + parameterized tests |

**Coverage:** 5/5 ACs (100%)

### Test Results

- **Total Tests:** 20
- **Passing:** 20 ✅
- **Failing:** 0
- **Execution Time:** 0.18s

### Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Config parse failure | Low | Silent fallback to 'auto' |
| Backward compatibility | Low | Fallback preserves behavior |

**Overall Risk:** LOW

### Quality Gate Checklist

- [x] All acceptance criteria met
- [x] Tests passing (20/20)
- [x] No CRITICAL issues
- [x] No HIGH issues
- [x] Code review approved (@architect)
- [x] Backward compatibility verified

### Recommendations (Non-Blocking)

1. Remove unused `path` import in test file (line 12)

### Approval

**Story ACT-1 is APPROVED for merge.**

— Quinn, guardião da qualidade 🛡️

---

*Epic ACT - Story ACT-1 | Created 2026-02-05 by @po (Pax)*
