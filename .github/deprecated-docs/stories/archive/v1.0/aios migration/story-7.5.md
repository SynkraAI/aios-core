# Story 7.5: Integration & Testing

**Story ID:** 7.5
**Epic:** Epic-7 - Core i18n Infrastructure
**Wave:** Wave 2 (Localization)
**Status:** 📋 Ready to Start
**Priority:** 🔴 Critical
**Owner:** Dev (Dex) + QA (Quinn)
**Created:** 2025-01-14
**Duration:** 2 days
**Investment:** $3,000

---

## 📋 Objective

Integrate i18n system into AIOS core by updating agent activator, CLI, and error handling to use t() function. Comprehensive testing for language detection, rendering, and locale switching.

---

## 🎯 Scope

Update aios-core/scripts/agent-activator.js, cli.js, and error handling modules to use t() for all UI strings. Create unit tests for language detection and rendering. Create integration tests for agent activation in EN vs PT-BR and locale switching without restart. Create PT-BR stub file for Epic 8.

---

## 📊 Tasks Breakdown

**Day 1: Code Integration (8 hours)** (8 hours)
Update AIOS core to use t() function for all UI strings
- Update aios-core/scripts/agent-activator.js:
- - Replace hardcoded agent greetings with t('agents.{agentId}.greeting_level_{level}')
- - Support all 3 personification levels
- - Test with all 13 agents
- Update aios-core/scripts/cli.js:
- - Replace hardcoded command descriptions with t('commands.{command}_description')
- - Replace hardcoded CLI output with t('cli.{key}')
- Update error handling modules:
- - Replace hardcoded error messages with t('errors.{errorType}', {params})
- - Replace hardcoded success messages with t('success.{messageType}', {params})
- Create aios-core/i18n/pt-BR.yaml (empty stub for Epic 8)
- Add comment: 'Portuguese translations to be added in Epic 8'

**Day 2: Testing & Validation (8 hours)** (8 hours)
Comprehensive testing of i18n system
- Create unit tests:
- - tests/unit/i18n/language-detection.test.js (test all 4 priority tiers)
- - tests/unit/i18n/rendering-engine.test.js (interpolation, fallback)
- Create integration tests:
- - tests/integration/i18n/agent-activation.test.js (activate agents in EN vs PT-BR)
- - tests/integration/i18n/locale-switching.test.js (switch locale without restart)
- - tests/integration/i18n/cli-output.test.js (CLI commands in EN vs PT-BR)
- Test all 13 agents at all 3 personification levels
- Test locale switching: en-US ↔ pt-BR
- Test fallback: PT-BR → EN if translation missing
- Verify config command: aios config set i18n.locale <locale>
- Run full test suite: npm test -- i18n

---

## ✅ Acceptance Criteria

### Must Have
- [ ] Agent greetings use t() function for all 13 agents × 3 levels
- [ ] CLI output uses t() function for all strings
- [ ] Error messages use t() function with parameter interpolation
- [ ] pt-BR.yaml stub created (empty, ready for Epic 8)
- [ ] All unit tests passing (language detection, rendering)
- [ ] All integration tests passing (activation, locale switching, CLI)
- [ ] Locale switching works without restart
- [ ] Config command works: aios config set i18n.locale <locale>
- [ ] Test coverage ≥80% for i18n module

### Should Have
- [ ] Performance tests validate <10ms translation time
- [ ] Integration tests cover edge cases
- [ ] Documentation updated with i18n usage examples


### Nice to Have
- [ ] Automated visual regression tests
- [ ] i18n debugging tool


---

## 🔗 Dependencies

### Prerequisites (Blocking)
- **Story 7.4: Rendering Engine Implementation

### Dependent Stories (This Blocks)
- **Epic 8: PT-BR Display Layer

---

## 📁 Files Modified

### New Files Created
- `aios-core/i18n/pt-BR.yaml`
- `tests/unit/i18n/language-detection.test.js`
- `tests/unit/i18n/rendering-engine.test.js`
- `tests/integration/i18n/agent-activation.test.js`
- `tests/integration/i18n/locale-switching.test.js`
- `tests/integration/i18n/cli-output.test.js`

### Files Modified
- `aios-core/scripts/agent-activator.js`
- `aios-core/scripts/cli.js`
- `aios-core/utils/error-handler.js`


### Files Referenced (No Changes)
- `aios-core/i18n/en-US.yaml`
- `aios-core/i18n/localization-engine.js`


---

## 🎨 Deliverables

### Integrated i18n System
**Location:** `aios-core/`

Complete i18n integration with agent activator, CLI, and error handling using t() function.

### Test Suite
**Location:** `tests/unit/i18n/, tests/integration/i18n/`

Comprehensive unit and integration tests for i18n system.

### PT-BR Stub
**Location:** `aios-core/i18n/pt-BR.yaml`

Empty PT-BR locale file ready for Epic 8 translation.

---

## 💰 Investment Breakdown

- Day 1 (Integration): $1,500
- Day 2 (Testing): $1,500
- Total: $3,000

---

## 🎯 Success Metrics

- **Integration Coverage:** Agent activator, CLI, error handling all use t()
- **Test Coverage:** ≥80% for i18n module
- **Agent Testing:** All 13 agents × 3 levels tested in both locales

---

## ⚠️ Risks & Mitigation

### Risk 1: Missing English strings discovered during integration
- **Likelihood:** Medium
- **Impact:** Low
- **Mitigation:** Add missing strings to en-US.yaml as discovered, fallback to key shows what's missing

---

## 📝 Notes

Completes Epic 7. PT-BR stub enables Epic 8 to start translation work. Core i18n infrastructure ready for 200M+ Portuguese speaker market expansion.

---

## 🔗 Related Documents

- **Epic:** [Epic-7](../epics/epic-7.md)

---

**Last Updated:** 2025-01-14
**Previous Story:** N/A
**Next Story:** N/A
**Next Review:** After completion
