# Story 6.2.4: Update Existing Documentation

**Story ID:** 6.2.4
**Epic:** Epic-6.2 - MCP Ecosystem Documentation
**Wave:** Wave 1 (Foundation)
**Status:** 📋 Ready to Start
**Priority:** 🔴 Critical
**Owner:** Docs (Ajax)
**Created:** 2025-01-14
**Duration:** 0.5 day
**Investment:** $625

---

## 📋 Objective

Update README and tool documentation to reference new 1MCP guides and highlight token optimization feature.

---

## 🎯 Scope

Update root README.md with MCP optimization section and badge, update aios-core/tools/mcp/README.md, and add links from .claude/CLAUDE.md to public docs.

---

## 📊 Tasks Breakdown

**Day 1: Documentation Updates (4 hours)** (4 hours)
Update README files and add links to new guides
- Add badge to root README.md: '⚡ 85% Token Reduction with 1MCP'
- Add MCP Optimization section to README with quick start links
- Update aios-core/tools/mcp/README.md with Token Optimization section
- Link to all 3 new docs: optimization guide, preset guide, case study
- Update .claude/CLAUDE.md to reference public docs instead of private config
- Document 4 presets in README: aios-dev (default), aios-research, aios-docker (on-demand), aios-full (rarely)
- Validate all links are working

---

## ✅ Acceptance Criteria

### Must Have
- [ ] Root README updated with MCP optimization section
- [ ] Badge added to README: 85% Token Reduction
- [ ] .claude/CLAUDE.md links to public docs
- [ ] All links validated and working
- [ ] MCP optimization mentioned in feature list
- [ ] Quick start section references all 3 guides

### Should Have
- [ ] Screenshots of badge in README
- [ ] Table of contents updated


### Nice to Have
- [ ] Video tutorial embedded in README
- [ ] Interactive badge with hover tooltip


---

## 🔗 Dependencies

### Prerequisites (Blocking)
- **Story 6.2.1
- **Story 6.2.2
- **Story 6.2.3

### Dependent Stories (This Blocks)
- None

---

## 📁 Files Modified

### New Files Created
- None

### Files Modified
- `README.md`
- `aios-core/tools/mcp/README.md`
- `.claude/CLAUDE.md`


### Files Referenced (No Changes)
- `docs/architecture/mcp-optimization-1mcp.md`
- `docs/architecture/mcp-preset-guide.md`
- `docs/architecture/mcp-token-reduction-case-study.md`


---

## 🎨 Deliverables

### Updated Documentation
**Location:** `README.md, aios-core/tools/mcp/README.md, .claude/CLAUDE.md`

All documentation updated to reference new MCP optimization guides.

---

## 💰 Investment Breakdown

- Documentation updates: 4 hours @ $625

---

## 🎯 Success Metrics

- **Link Coverage:** All 3 new guides linked from README
- **Badge Visibility:** 85% token reduction badge prominent in README
- **Link Validation:** 100% links working

---

## ⚠️ Risks & Mitigation

### Risk 1: Users skip documentation and struggle with setup
- **Likelihood:** High
- **Impact:** Low
- **Mitigation:** Prominent links in README, installer wizard mentions 1MCP

---

## 📝 Notes

Final story in Epic 6.2. Completes documentation-only epic with zero code changes.

---

## 🔗 Related Documents

- **Epic:** [Epic-6.2](../epics/epic-6.2.md)

---

**Last Updated:** 2025-01-14
**Previous Story:** N/A
**Next Story:** N/A
**Next Review:** After completion
