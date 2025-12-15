# Story 7.1: i18n Folder Structure & Documentation

**Story ID:** 7.1
**Epic:** Epic-7 - Core i18n Infrastructure
**Wave:** Wave 2 (Localization)
**Status:** 📋 Ready to Start
**Priority:** 🔴 Critical
**Owner:** Dev (Dex) + Architect (Aria)
**Created:** 2025-01-14
**Duration:** 1 day
**Investment:** $1,500

---

## 📋 Objective

Create core i18n folder structure with documentation explaining Persona Layer model (system prompts EN, UI localized) and TypeScript type definitions.

---

## 🎯 Scope

Create aios-core/i18n/ folder with README.md explaining industry-standard Persona Layer model, types.d.ts for TypeScript support, and update package.json (no external i18n libraries initially, custom lightweight solution).

---

## 📊 Tasks Breakdown

**Day 1: Structure & Documentation (8 hours)** (8 hours)
Create folder structure, documentation, and type definitions
- Create aios-core/i18n/ directory
- Create aios-core/i18n/README.md explaining Persona Layer model
- Document: Why Persona Layer? (system prompts EN = best AI performance, UI localized = best UX)
- Document: Industry standard (Claude Code, Cursor, Windsurf, GitHub Copilot all use this)
- Document: Research evidence (full translation = -11% to -15% code quality degradation)
- Create aios-core/i18n/types.d.ts for TypeScript type definitions
- Define TranslationKey type
- Define LocaleConfig type
- Define TranslationParams type
- Update package.json (no external i18n libraries, custom lightweight implementation)
- Document folder structure in README: en-US.yaml (baseline), pt-BR.yaml (Epic 8), localization-engine.js

---

## ✅ Acceptance Criteria

### Must Have
- [ ] aios-core/i18n/ folder created
- [ ] README.md explains Persona Layer model with research evidence
- [ ] types.d.ts defines TypeScript types for i18n system
- [ ] package.json updated (no external dependencies)
- [ ] Documentation references industry standard (Claude Code, Cursor, etc.)
- [ ] Folder structure documented for future stories

### Should Have
- [ ] Examples of Persona Layer in other tools
- [ ] Comparison with full translation approach
- [ ] Performance implications documented


### Nice to Have
- [ ] Diagram illustrating Persona Layer architecture
- [ ] Video explanation of approach


---

## 🔗 Dependencies

### Prerequisites (Blocking)
- **Epic 6.1: Agent Identity System

### Dependent Stories (This Blocks)
- **Story 7.2: Language Detection Engine

---

## 📁 Files Modified

### New Files Created
- `aios-core/i18n/README.md`
- `aios-core/i18n/types.d.ts`

### Files Modified
- `package.json`


### Files Referenced (No Changes)
- `docs/one-pagers/DECISION-1-PT-BR-LOCALIZATION.md`


---

## 🎨 Deliverables

### i18n Folder Structure
**Location:** `aios-core/i18n/`

Complete folder structure with README and TypeScript type definitions.

---

## 💰 Investment Breakdown

- Day 1 (Structure & Docs): $1,500

---

## 🎯 Success Metrics

- **Folder Structure:** aios-core/i18n/ created with README and types.d.ts
- **Documentation Quality:** Persona Layer model clearly explained
- **TypeScript Support:** Type definitions complete for i18n system

---

## ⚠️ Risks & Mitigation

### Risk 1: Custom i18n implementation more complex than expected
- **Likelihood:** Low
- **Impact:** Medium
- **Mitigation:** Keep initial implementation simple (key-value lookups), add features incrementally

---

## 📝 Notes

Foundational story for Epic 7. Persona Layer model based on industry standard (all major AI coding tools use this approach). Expands market to 200M+ Portuguese speakers with +76% adoption increase (CSA Research).

---

## 🔗 Related Documents

- **Epic:** [Epic-7](../epics/epic-7.md)

---

**Last Updated:** 2025-01-14
**Previous Story:** N/A
**Next Story:** N/A
**Next Review:** After completion
