# Story 6.1.9: Checklists Migration to Agent-Personalized Format

**Story ID:** STORY-6.1.9
**Epic:** Epic-6.1 - Agent Identity System
**Wave:** Wave 1 (Foundation)
**Status:** 📋 Ready to Start
**Priority:** 🔴 Critical
**Owner:** QA (Quinn) + Dev (Dex)
**Created:** 2025-01-14
**Duration:** 2 days
**Investment:** $200

---

## 📋 Objective

Update all checklist files in `.aios-core/checklists/` with Agent-Specific Guidance sections and personalized failure protocols matching each agent's archetype.

---

## 🎯 Scope

Migrate 10+ checklists to include agent-personalized guidance, failure messages, and archetype-specific recommendations.

---

## 📊 Tasks Breakdown

### Day 1: Core Checklists (8 hours)

**Story & Development Checklists** (4 hours)
- [ ] story-dod-checklist.md - Add dev/qa agent guidance
- [ ] dev-story-dod-checklist.md - Add Dex (Builder) guidance
- [ ] story-draft-checklist.md - Add SM agent guidance

**Architecture & Planning Checklists** (4 hours)
- [ ] architect-checklist.md - Add Aria (Architect) guidance
- [ ] pm-checklist.md - Add Morgan (Visionary) guidance
- [ ] po-master-checklist.md - Add Pax (Balancer) guidance
- [ ] change-checklist.md - Add multi-agent guidance

### Day 2: Specialized Checklists (8 hours)

**Quality & Compliance Checklists** (4 hours)
- [ ] component-quality-checklist.md - Add QA guidance
- [ ] pattern-audit-checklist.md - Add Architect guidance
- [ ] accessibility-wcag-checklist.md - Add UX guidance

**Database & Technical Checklists** (4 hours)
- [ ] db-kiss-validation-checklist.md - Add Data Engineer guidance
- [ ] migration-readiness-checklist.md - Add Architect guidance
- [ ] migration-validation-checklist.md - Add QA guidance

**Changes per checklist:**
1. Add **Agent-Specific Guidance** section
2. Add **Personalized Failure Protocols**
3. Add **Archetype-based Recommendations**
4. Add **Agent Note** with vocabulary from persona
5. Integrate with output-formatter for reports

---

## ✅ Acceptance Criteria

### Must Have
- [ ] All 10+ checklists updated with agent guidance
- [ ] Each checklist has personalized failure messages
- [ ] Agent-specific notes match archetype vocabulary
- [ ] Checklist reports use output-formatter.js
- [ ] Backward compatibility maintained

### Should Have
- [ ] Validation script checks agent guidance presence
- [ ] Examples for all 11 agent archetypes
- [ ] Checklist execution generates standardized reports

### Nice to Have
- [ ] Interactive checklist wizard
- [ ] Automated checklist execution in CI/CD

---

## 🔗 Dependencies

### Prerequisites (Blocking)
- **Story 6.1.8:** Templates Migration (checklists may use templates)

### Dependent Stories (This Blocks)
- **Story 6.1.10:** Dependencies Migration (data files may reference checklists)

---

## 📁 Files Modified

### Files Modified (10+ checklists)
- `.aios-core/checklists/story-dod-checklist.md`
- `.aios-core/checklists/dev-story-dod-checklist.md`
- `.aios-core/checklists/story-draft-checklist.md`
- `.aios-core/checklists/architect-checklist.md`
- `.aios-core/checklists/pm-checklist.md`
- `.aios-core/checklists/po-master-checklist.md`
- `.aios-core/checklists/change-checklist.md`
- `.aios-core/checklists/component-quality-checklist.md`
- `.aios-core/checklists/pattern-audit-checklist.md`
- `.aios-core/checklists/accessibility-wcag-checklist.md`
- `.aios-core/checklists/db-kiss-validation-checklist.md`
- `.aios-core/checklists/migration-readiness-checklist.md`
- `.aios-core/checklists/migration-validation-checklist.md`

---

## 🎨 Deliverables

### Personalized Checklists
**Location:** `.aios-core/checklists/*.md`

All checklists with agent-specific guidance and failure protocols.

### Checklist Report Template
**Location:** `.aios-core/templates/checklist-execution-report.md`

Standardized report format using output-formatter.

---

## 💰 Investment Breakdown

- Day 1 (Core Checklists): 8 hours @ $12.50/hr = $100
- Day 2 (Specialized Checklists): 8 hours @ $12.50/hr = $100
- **Total:** 16 hours = $200

---

## 🎯 Success Metrics

- **Migration Coverage:** 10/10+ checklists updated (100%)
- **Agent Guidance Quality:** All archetypes represented
- **Report Standardization:** 100% checklists use formatter
- **Backward Compatibility:** 100% existing usages pass

---

## ⚠️ Risks & Mitigation

### Risk 1: Agent guidance feels repetitive across checklists
- **Likelihood:** Medium
- **Impact:** Low
- **Mitigation:** Vary guidance based on checklist context, use archetype vocabulary

---

## 📝 Notes

**Agent Guidance Pattern:**

```markdown
## Agent-Specific Guidance

**Dex (Builder) Note:**
> "Se algum teste falhou, refatore até passar. Não entregue código quebrado."

**Quinn (Guardian) Note:**
> "Valide edge cases extras além dos listados. Proteção nunca é demais."

**Pax (Balancer) Note:**
> "Equilibre velocidade com qualidade. Priorize o que agrega mais valor."
```

---

## 🔗 Related Documents

- **Epic:** [Epic 6.1 - Agent Identity System](../epics/epic-6.1-agent-identity-system.md)
- **Template:** [Personalized Checklist Template](../../.aios-core/templates/personalized-checklist-template.md)

---

**Last Updated:** 2025-01-14
**Previous Story:** [Story 6.1.8 - Templates Migration](story-6.1.8-templates-migration.md)
**Next Story:** [Story 6.1.10 - Dependencies Migration](story-6.1.10-dependencies-migration.md)
