# Story 6.1.10: Dependencies & Data Files Migration

**Story ID:** STORY-6.1.10
**Epic:** Epic-6.1 - Agent Identity System
**Wave:** Wave 1 (Foundation)
**Status:** 📋 Ready to Start
**Priority:** 🟡 Medium
**Owner:** Architect (Aria)
**Created:** 2025-01-14
**Duration:** 1 day
**Investment:** $100

---

## 📋 Objective

Ensure all data files and dependencies in `.aios-core/data/` are compatible with V2.0 architecture and create archetype-vocabulary.yaml for personality system.

---

## 🎯 Scope

Validate 10+ data files, create archetype-vocabulary.yaml, update cross-references, and validate tool schemas.

---

## 📊 Tasks Breakdown

### Day 1: Data Files & Dependencies (8 hours)

**Create Archetype Vocabulary** (3 hours)
- [ ] Create `.aios-core/data/archetype-vocabulary.yaml`
- [ ] Define vocabulary for all 11 archetypes:
  - Builder (construir, implementar, refatorar, resolver, otimizar)
  - Guardian (validar, verificar, proteger, garantir, auditar)
  - Balancer (equilibrar, harmonizar, priorizar, alinhar, integrar)
  - Visionary (planejar, estrategizar, projetar, visualizar, inovar)
  - Flow_Master (adaptar, pivotar, ajustar, fluir, evoluir)
  - Architect (arquitetar, estruturar, organizar, modelar, desenhar)
  - Explorer (explorar, analisar, investigar, descobrir, mapear)
  - Empathizer (empatizar, compreender, facilitar, conectar, engajar)
  - Engineer (otimizar, modelar, integrar, processar, transformar)
  - Operator (deployar, automatizar, monitorar, operar, escalar)
  - Orchestrator (orquestrar, coordenar, liderar, sincronizar, dirigir)
- [ ] Add avoid_words for each archetype
- [ ] Add emoji_palette for each archetype
- [ ] Add emotional_signature for each archetype

**Validate Existing Data Files** (3 hours)
- [ ] aios-kb.md - Core knowledge base
- [ ] technical-preferences.md - Stack preferences
- [ ] brainstorming-techniques.md - Facilitation methods
- [ ] elicitation-methods.md - Requirements elicitation
- [ ] mode-selection-best-practices.md - Execution mode guidance
- [ ] test-levels-framework.md - Testing strategy
- [ ] test-priorities-matrix.md - Test prioritization
- Others as discovered

**Update Cross-References** (2 hours)
- [ ] Update task files referencing data files
- [ ] Update agent files referencing data files
- [ ] Validate tool schemas compatibility
- [ ] Document new data file structure

---

## ✅ Acceptance Criteria

### Must Have
- [ ] archetype-vocabulary.yaml created with all 11 archetypes
- [ ] All existing data files validated for V2.0 compatibility
- [ ] Cross-references updated in tasks/agents/checklists
- [ ] No broken references to data files

### Should Have
- [ ] Vocabulary validation script
- [ ] Data file schema documentation
- [ ] Examples of vocabulary usage per archetype

### Nice to Have
- [ ] AI-powered vocabulary suggestions
- [ ] Multi-language vocabulary (EN/PT-BR)

---

## 🔗 Dependencies

### Prerequisites (Blocking)
- **Story 6.1.9:** Checklists Migration (checklists may reference data files)

### Dependent Stories (This Blocks)
- **Story 6.1.11:** AIOS-Master Tasks (needs complete data architecture)

---

## 📁 Files Modified

### New Files Created
- `.aios-core/data/archetype-vocabulary.yaml`

### Files Validated (no changes expected)
- `.aios-core/data/aios-kb.md`
- `.aios-core/data/technical-preferences.md`
- `.aios-core/data/brainstorming-techniques.md`
- `.aios-core/data/elicitation-methods.md`
- `.aios-core/data/mode-selection-best-practices.md`
- `.aios-core/data/test-levels-framework.md`
- `.aios-core/data/test-priorities-matrix.md`

---

## 🎨 Deliverables

### Archetype Vocabulary File
**Location:** `.aios-core/data/archetype-vocabulary.yaml`

Complete vocabulary definitions for all 11 agent archetypes.

### Data File Validation Report
**Location:** `docs/validation/data-files-v2-compatibility.md`

Report of all data file validations and any issues found.

---

## 💰 Investment Breakdown

- Archetype vocabulary creation: 3 hours
- Data file validation: 3 hours
- Cross-reference updates: 2 hours
- **Total:** 8 hours @ $12.50/hr = $100

---

## 🎯 Success Metrics

- **Vocabulary Coverage:** All 11 archetypes defined
- **Data File Validation:** 100% files checked
- **Reference Integrity:** 0 broken references
- **Schema Compliance:** 100% tool schemas valid

---

## ⚠️ Risks & Mitigation

### Risk 1: Vocabulary conflicts across archetypes
- **Likelihood:** Low
- **Impact:** Low
- **Mitigation:** Review vocabulary uniqueness, allow some overlap for common terms

---

## 📝 Notes

**Archetype Vocabulary Example:**

```yaml
archetypes:
  Builder:
    primary_verbs: [construir, implementar, refatorar, resolver, otimizar]
    avoid_words: [talvez, possivelmente, acho que, mais ou menos]
    emoji_palette: [⚡, 🔨, 🏗️, ✅, 🔧, 🛠️]
    emotional_signature: "Energia de reconstrução"

  Guardian:
    primary_verbs: [validar, verificar, proteger, garantir, auditar]
    avoid_words: [aproximadamente, parece, creio]
    emoji_palette: [✅, 🛡️, 🔍, ⚠️, 📋, 🎯]
    emotional_signature: "Proteção preventiva"
```

---

## 🔗 Related Documents

- **Epic:** [Epic 6.1 - Agent Identity System](../epics/epic-6.1-agent-identity-system.md)
- **Standard:** [Agent Personalization Standard V1.0](../../standards/AGENT-PERSONALIZATION-STANDARD-V1.md)

---

**Last Updated:** 2025-01-14
**Previous Story:** [Story 6.1.9 - Checklists Migration](story-6.1.9-checklists-migration.md)
**Next Story:** [Story 6.1.11 - AIOS-Master Tasks](story-6.1.11-aios-master-tasks.md)
