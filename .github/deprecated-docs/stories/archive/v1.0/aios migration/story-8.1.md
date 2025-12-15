# Story 8.1: Professional Translation (13 agents + UI)

**Story ID:** 8.1
**Epic:** Epic-8 - PT-BR Display Layer + Agent Identity Integration
**Wave:** Wave 2 (Localization)
**Status:** 📋 Ready to Start
**Priority:** 🔴 Critical
**Owner:** PM (Morgan) + Localization Specialist (External)
**Created:** 2025-01-14
**Duration:** 2 weeks
**Investment:** $15,000

---

## 📋 Objective

Hire professional PT-BR translator to translate all 200+ UI strings including 13 agent greetings (3 levels each), command descriptions, error messages, success messages, and CLI output from en-US.yaml to pt-BR.yaml.

---

## 🎯 Scope

Professional translation of complete UI layer: 39 agent greetings (13 agents × 3 personification levels), ~20 command descriptions, ~50 error messages, ~30 success messages, ~50 CLI output strings. Maintain placeholder syntax ({path}, {name}, etc.). Total: 200+ strings translated to native PT-BR.

---

## 📊 Tasks Breakdown

**Week 1: Agent Greetings & Commands Translation (40 hours)** (40 hours)
Translate agent greetings and command descriptions
- Hire professional PT-BR translator (native Brazilian Portuguese speaker)
- Translate all 39 agent greetings:
- - 13 agents: Dex, Quinn, Pax, Morgan, Blair, River, Sage, Aria, Casey, Finley, Rowan, Reese, Ajax
- - 3 levels per agent: Minimal (role only), Named (name + role), Archetypal (name + archetype)
- - Example: 'Dex (Builder) ready. Let's build!' → 'Dex (Construtor) pronto. Vamos construir!'
- Translate ~20 command descriptions:
- - *help → 'Mostrar comandos disponíveis'
- - *create → 'Criar novo documento ou componente'
- - etc.
- Maintain gender-neutral language (agent names already neutral)
- Preserve placeholder syntax: {path}, {name}, {details}

**Week 2: Errors, Success, CLI Translation (40 hours)** (40 hours)
Translate remaining UI strings
- Translate ~50 error messages:
- - 'File not found: {path}' → 'Arquivo não encontrado: {path}'
- - 'Invalid input: {details}' → 'Entrada inválida: {details}'
- - etc.
- Translate ~30 success messages:
- - 'Task completed successfully' → 'Tarefa concluída com sucesso'
- - 'File created: {path}' → 'Arquivo criado: {path}'
- - etc.
- Translate ~50 CLI output strings:
- - Table headers, list formatting, status messages
- Update aios-core/i18n/pt-BR.yaml with all translations
- Validate YAML syntax and placeholder preservation
- Total: 200+ strings professionally translated

---

## ✅ Acceptance Criteria

### Must Have
- [ ] Professional PT-BR translator hired (native Brazilian Portuguese)
- [ ] All 39 agent greetings translated (13 agents × 3 levels)
- [ ] All ~20 command descriptions translated
- [ ] All ~50 error messages translated with placeholders preserved
- [ ] All ~30 success messages translated
- [ ] All ~50 CLI output strings translated
- [ ] pt-BR.yaml syntax valid and loads correctly
- [ ] Gender-neutral language maintained (agent names)
- [ ] Placeholder syntax preserved: {path}, {name}, {details}

### Should Have
- [ ] Translation glossary created for consistency
- [ ] Context notes for translator (where strings appear)
- [ ] Quality review by second translator


### Nice to Have
- [ ] Translation memory for future updates
- [ ] Automated translation validation tool


---

## 🔗 Dependencies

### Prerequisites (Blocking)
- **Epic 7: Core i18n Infrastructure

### Dependent Stories (This Blocks)
- **Story 8.2: Interactive Prompt Translation

---

## 📁 Files Modified

### New Files Created
- None

### Files Modified
- `aios-core/i18n/pt-BR.yaml`


### Files Referenced (No Changes)
- `aios-core/i18n/en-US.yaml`


---

## 🎨 Deliverables

### Complete PT-BR Translation
**Location:** `aios-core/i18n/pt-BR.yaml`

All 200+ UI strings professionally translated to Brazilian Portuguese.

---

## 💰 Investment Breakdown

- Week 1 (Agents & Commands): $7,500
- Week 2 (Errors, Success, CLI): $7,500
- Total: $15,000

---

## 🎯 Success Metrics

- **Translation Coverage:** 100% of 200+ strings translated
- **Quality:** Native Brazilian Portuguese quality
- **Placeholder Preservation:** 100% placeholders intact

---

## ⚠️ Risks & Mitigation

### Risk 1: Translation quality issues (professional translator not native)
- **Likelihood:** Low
- **Impact:** Medium
- **Mitigation:** Hire native Brazilian speaker, native speaker review (Taynã Puri) in Story 8.3

---

## 📝 Notes

Professional translation investment: $15K. Savings: $60K vs full translation (system prompts stay EN per Persona Layer model). Unlocks 200M+ Portuguese speaker market.

---

## 🔗 Related Documents

- **Epic:** [Epic-8](../epics/epic-8.md)

---

**Last Updated:** 2025-01-14
**Previous Story:** N/A
**Next Story:** N/A
**Next Review:** After completion
