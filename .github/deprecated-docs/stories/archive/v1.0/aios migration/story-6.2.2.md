# Story 6.2.2: Preset Selection Guide

**Story ID:** 6.2.2
**Epic:** Epic-6.2 - MCP Ecosystem Documentation
**Wave:** Wave 1 (Foundation)
**Status:** 📋 Ready to Start
**Priority:** 🔴 Critical
**Owner:** Docs (Ajax)
**Created:** 2025-01-14
**Duration:** 1 day
**Investment:** $1,250

---

## 📋 Objective

Help users choose the right 1MCP preset for their workflow with comparison table and decision tree.

---

## 🎯 Scope

Create preset comparison table (4 presets), document use cases, token budgets, and when to enable/disable each preset. Build decision tree to guide users to optimal preset selection.

---

## 📊 Tasks Breakdown

**Day 1: Preset Guide Creation (8 hours)** (8 hours)
Create comprehensive preset selection guide with decision tree
- Create docs/architecture/mcp-preset-guide.md
- Build preset comparison table (aios-dev, aios-research, aios-docker, aios-full)
- Document token budgets: dev (~25-40k), research (~40-60k), docker (~15-20k), full (~60-80k)
- Document use cases for each preset
- Create decision tree: Docker? → yes: aios-docker, no: Context7? → yes: aios-research, no: aios-dev
- Document when to enable/disable aios-docker (on-demand only)
- Add examples: 'Story implementation' → aios-dev, 'Research libraries' → aios-research
- Explain token optimization strategy: default to aios-dev, use others sparingly

---

## ✅ Acceptance Criteria

### Must Have
- [ ] Preset comparison table created with 4 columns (preset, MCPs, token budget, use cases)
- [ ] Use case examples for each preset documented
- [ ] Decision tree helps users choose correct preset
- [ ] Token budget ranges documented and validated
- [ ] When to enable/disable aios-docker explained (saves tokens when disabled)
- [ ] Default recommendation: aios-dev for most development work

### Should Have
- [ ] Visual decision tree diagram (Mermaid)
- [ ] Real-world usage examples from AIOS development


### Nice to Have
- [ ] Interactive preset selector tool
- [ ] Preset switching automation script


---

## 🔗 Dependencies

### Prerequisites (Blocking)
- **None** - Can start immediately

### Dependent Stories (This Blocks)
- None

---

## 📁 Files Modified

### New Files Created
- `docs/architecture/mcp-preset-guide.md`

### Files Modified
- None


### Files Referenced (No Changes)
- `.claude/CLAUDE.md`


---

## 🎨 Deliverables

### Preset Selection Guide
**Location:** `docs/architecture/mcp-preset-guide.md`

Comprehensive guide with comparison table, decision tree, and use case examples.

---

## 💰 Investment Breakdown

- Preset guide creation: 8 hours @ $1,250

---

## 🎯 Success Metrics

- **Preset Coverage:** All 4 presets documented with examples
- **Decision Tree Usability:** Users can choose preset in <2 minutes
- **Token Budget Accuracy:** Ranges validated against actual usage

---

## ⚠️ Risks & Mitigation

### Risk 1: Token budgets change as MCPs update
- **Likelihood:** Medium
- **Impact:** Low
- **Mitigation:** Add last-updated date, quarterly review process

---

## 📝 Notes

Decision tree prioritizes token efficiency: aios-dev as default, aios-docker only when needed, aios-full rarely.

---

## 🔗 Related Documents

- **Epic:** [Epic-6.2](../epics/epic-6.2.md)

---

**Last Updated:** 2025-01-14
**Previous Story:** N/A
**Next Story:** N/A
**Next Review:** After completion
