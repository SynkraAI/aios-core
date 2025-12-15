# Story 8.2: Interactive Prompt Translation

**Story ID:** 8.2
**Epic:** Epic-8 - PT-BR Display Layer + Agent Identity Integration
**Wave:** Wave 2 (Localization)
**Status:** 📋 Ready to Start
**Priority:** 🔴 Critical
**Owner:** Localization Specialist (External) + Docs (Ajax)
**Created:** 2025-01-14
**Duration:** 1 week
**Investment:** $7,500

---

## 📋 Objective

Translate all interactive prompts and elicitation questions from task workflows, including brownfield tasks, greenfield tasks, agent commands, and installation wizard.

---

## 🎯 Scope

Translate ~40 interactive prompts from task workflows to PT-BR: elicitation questions in brownfield/greenfield tasks, agent command workflows (e.g., *create-story prompts), installation wizard prompts (setup questions). Maintain question formatting and validation rules.

---

## 📊 Tasks Breakdown

**Week 1: Prompt Translation (40 hours)** (40 hours)
Translate all interactive prompts to PT-BR
- Identify all interactive prompts in task workflows:
- - Brownfield tasks (elicit: true questions)
- - Greenfield tasks (elicit: true questions)
- - Agent command workflows (*create, *task, etc.)
- - Installation wizard (setup questions)
- Translate ~40 prompts to PT-BR:
- - 'Enter project name:' → 'Digite o nome do projeto:'
- - 'Select deployment target:' → 'Selecione o destino de implantação:'
- - 'Configure database?' → 'Configurar banco de dados?'
- - etc.
- Maintain question formatting (colons, question marks)
- Preserve validation rules (regex patterns, min/max lengths)
- Update prompt strings in pt-BR.yaml
- Test prompts in PT-BR mode (manual testing)

---

## ✅ Acceptance Criteria

### Must Have
- [ ] All ~40 interactive prompts identified and translated
- [ ] Brownfield task prompts translated
- [ ] Greenfield task prompts translated
- [ ] Agent command prompts translated
- [ ] Installation wizard prompts translated
- [ ] Question formatting preserved (colons, question marks)
- [ ] Validation rules preserved (regex, min/max)
- [ ] pt-BR.yaml updated with prompt translations

### Should Have
- [ ] Manual testing of prompts in PT-BR mode
- [ ] Context notes for prompts (where they appear)
- [ ] Screenshot validation of prompt display


### Nice to Have
- [ ] Automated prompt testing
- [ ] Interactive prompt preview tool


---

## 🔗 Dependencies

### Prerequisites (Blocking)
- **Story 8.1: Professional Translation

### Dependent Stories (This Blocks)
- **Story 8.3: Native Speaker Review

---

## 📁 Files Modified

### New Files Created
- None

### Files Modified
- `aios-core/i18n/pt-BR.yaml`


### Files Referenced (No Changes)
- `aios-core/tasks/*.md`
- `aios-core/workflows/*.md`


---

## 🎨 Deliverables

### Translated Interactive Prompts
**Location:** `aios-core/i18n/pt-BR.yaml`

All ~40 interactive prompts translated to PT-BR with formatting preserved.

---

## 💰 Investment Breakdown

- Week 1 (Prompt Translation): $7,500

---

## 🎯 Success Metrics

- **Prompt Coverage:** 100% of ~40 prompts translated
- **Formatting Preservation:** All question formatting intact
- **Validation Rules:** 100% validation rules preserved

---

## ⚠️ Risks & Mitigation

### Risk 1: Translated prompts too long for UI display
- **Likelihood:** Low
- **Impact:** Low
- **Mitigation:** Test UI display, abbreviate if needed while maintaining clarity

---

## 📝 Notes

Interactive prompts are critical for UX. Translation maintains AIOS usability in PT-BR mode for Brazilian users.

---

## 🔗 Related Documents

- **Epic:** [Epic-8](../epics/epic-8.md)

---

**Last Updated:** 2025-01-14
**Previous Story:** N/A
**Next Story:** N/A
**Next Review:** After completion
