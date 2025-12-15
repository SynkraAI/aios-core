# Story 6.1.8: Templates Migration to Personalized Format

**Story ID:** STORY-6.1.8
**Epic:** Epic-6.1 - Agent Identity System
**Wave:** Wave 1 (Foundation)
**Status:** 📋 Ready to Start
**Priority:** 🔴 Critical
**Owner:** Dev (Dex) + Architect (Aria)
**Created:** 2025-01-14
**Duration:** 2 days
**Investment:** $200

---

## 📋 Objective

Update all template files in `.aios-core/templates/` to support personality injection with agent name, archetype, and signature slots while maintaining YAML compatibility.

---

## 🎯 Scope

Migrate 15+ template files to personalized format with {agent.name}, {agent.persona_profile.archetype}, and {signature_closing} placeholders.

---

## 📊 Tasks Breakdown

### Day 1: Core Templates (8 hours)

**Story & Epic Templates** (4 hours)
- [ ] story-tmpl.yaml - Add agent placeholders
- [ ] brownfield-prd-tmpl.yaml - Add persona slots
- [ ] prd-tmpl.yaml - Add signature closing

**Architecture Templates** (4 hours)
- [ ] architecture-tmpl.yaml - Add agent context
- [ ] front-end-architecture-tmpl.yaml - Add persona
- [ ] fullstack-architecture-tmpl.yaml - Add signature
- [ ] front-end-spec-tmpl.yaml - Add agent slots

### Day 2: Supporting Templates (8 hours)

**Documentation Templates** (4 hours)
- [ ] brainstorming-output-tmpl.yaml - Add facilitator persona
- [ ] competitor-analysis-tmpl.yaml - Add analyst persona
- [ ] market-research-tmpl.yaml - Add researcher persona
- [ ] index-strategy-tmpl.yaml - Add strategist persona

**Technical Templates** (4 hours)
- [ ] qa-gate-tmpl.yaml - Add QA agent persona
- [ ] migration-plan-tmpl.yaml - Add architect persona
- [ ] shock-report-tmpl.html - Add report generator persona
- [ ] task-execution-report.md - Already done in Story 6.1.6

**Changes per template:**
1. Add `{agent.name}` placeholder for agent name
2. Add `{agent.persona_profile.archetype}` for archetype
3. Add `{signature_closing}` slot at end
4. Validate YAML syntax still correct
5. Test with sample agent data
6. Document personality injection points

---

## ✅ Acceptance Criteria

### Must Have
- [ ] All 15+ templates updated with personality slots
- [ ] YAML syntax validation passing for all templates
- [ ] Templates tested with all 11 agent personas
- [ ] Backward compatibility maintained (old usages still work)
- [ ] Documentation of personality injection points

### Should Have
- [ ] Template validation script catches missing placeholders
- [ ] Examples included for each archetype
- [ ] Template rendering tested end-to-end

### Nice to Have
- [ ] AI-assisted template generation
- [ ] Multi-language template support (EN/PT-BR)

---

## 🔗 Dependencies

### Prerequisites (Blocking)
- **Story 6.1.7:** Core Tasks Migration (tasks use templates)

### Dependent Stories (This Blocks)
- **Story 6.1.9:** Checklists Migration (checklists may reference templates)

---

## 📁 Files Modified

### Files Modified (15+ templates)
- `.aios-core/templates/story-tmpl.yaml`
- `.aios-core/templates/brownfield-prd-tmpl.yaml`
- `.aios-core/templates/prd-tmpl.yaml`
- `.aios-core/templates/architecture-tmpl.yaml`
- `.aios-core/templates/front-end-architecture-tmpl.yaml`
- `.aios-core/templates/fullstack-architecture-tmpl.yaml`
- `.aios-core/templates/front-end-spec-tmpl.yaml`
- `.aios-core/templates/brainstorming-output-tmpl.yaml`
- `.aios-core/templates/competitor-analysis-tmpl.yaml`
- `.aios-core/templates/market-research-tmpl.yaml`
- `.aios-core/templates/index-strategy-tmpl.yaml`
- `.aios-core/templates/qa-gate-tmpl.yaml`
- `.aios-core/templates/migration-plan-tmpl.yaml`
- `.aios-core/templates/shock-report-tmpl.html`
- Other templates as discovered

---

## 🎨 Deliverables

### Migrated Templates
**Location:** `.aios-core/templates/*.yaml`

All templates with personality slots and YAML compatibility.

### Template Usage Guide
**Location:** `docs/guides/template-personalization-guide.md`

Documentation of how to use personality slots in templates.

---

## 💰 Investment Breakdown

- Day 1 (Core Templates): 8 hours @ $12.50/hr = $100
- Day 2 (Supporting Templates): 8 hours @ $12.50/hr = $100
- **Total:** 16 hours = $200

---

## 🎯 Success Metrics

- **Migration Coverage:** 15/15+ templates updated (100%)
- **YAML Validity:** 100% templates pass syntax validation
- **Agent Compatibility:** Works with all 11 agents
- **Backward Compatibility:** 100% existing usages pass

---

## ⚠️ Risks & Mitigation

### Risk 1: YAML syntax breaks with placeholders
- **Likelihood:** Low
- **Impact:** Medium
- **Mitigation:** Validate YAML after each change, use quote escaping for placeholders

### Risk 2: Old template usages break
- **Likelihood:** Medium
- **Impact:** Medium
- **Mitigation:** Support both old and new format during transition, gradual migration

---

## 📝 Notes

**Template Personalization Pattern:**

```yaml
# Before
title: "Product Requirements Document"
created_by: "Product Manager"

# After
title: "Product Requirements Document"
created_by: "{agent.name} ({agent.persona_profile.archetype})"
signature: "{signature_closing}"
```

---

## 🔗 Related Documents

- **Epic:** [Epic 6.1 - Agent Identity System](../epics/epic-6.1-agent-identity-system.md)
- **Template:** [Personalized Template File](../../.aios-core/templates/personalized-template-file.yaml)

---

**Last Updated:** 2025-01-14
**Previous Story:** [Story 6.1.7 - Core Tasks Migration](story-6.1.7-core-tasks-migration.md)
**Next Story:** [Story 6.1.9 - Checklists Migration](story-6.1.9-checklists-migration.md)
