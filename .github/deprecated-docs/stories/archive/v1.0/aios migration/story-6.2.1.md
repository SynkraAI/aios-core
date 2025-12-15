# Story 6.2.1: Extract and Document 1MCP Setup

**Story ID:** 6.2.1
**Epic:** Epic-6.2 - MCP Ecosystem Documentation
**Wave:** Wave 1 (Foundation)
**Status:** 📋 Ready to Start
**Priority:** 🔴 Critical
**Owner:** Docs (Ajax) + Architect (Aria)
**Created:** 2025-01-14
**Duration:** 2 days
**Investment:** $2,500

---

## 📋 Objective

Create comprehensive 1MCP installation and configuration guide extracting content from .claude/CLAUDE.md to public documentation.

---

## 🎯 Scope

Document what is 1MCP, installation steps, MCP configuration, preset creation, server startup, Claude Code configuration, verification, troubleshooting, and rollback procedures. Extract 85% token reduction proven implementation from Story 3.26.

---

## 📊 Tasks Breakdown

**Day 1: Extract Core Documentation (8 hours)** (8 hours)
Extract and organize 1MCP content from private config to public docs
- Create docs/architecture/mcp-optimization-1mcp.md
- Document: What is 1MCP? (definition, benefits, 85% token reduction)
- Document: Installation steps (npm install -g @1mcp/agent)
- Document: MCP configuration (1mcp mcp add commands)
- Document: Preset creation (4 presets: dev, research, docker, full)
- Document: Server startup (foreground, background, Windows service)
- Document: Claude Code configuration (~/.claude.json setup)

**Day 2: Verification & Troubleshooting (8 hours)** (8 hours)
Complete guide with verification steps and troubleshooting
- Document: Verification steps (/context command token validation)
- Document: Troubleshooting (port conflicts, missing packages, token reduction validation)
- Document: Rollback procedure (backup restore)
- Document: Advanced usage (custom presets, multiple instances)
- Test installation guide on clean environment
- Add screenshots/examples of before/after token counts

---

## ✅ Acceptance Criteria

### Must Have
- [ ] Complete guide covers all installation steps from .claude/CLAUDE.md
- [ ] Step-by-step instructions tested on clean environment
- [ ] Troubleshooting section addresses port conflicts, missing packages
- [ ] Rollback procedure validated with backup/restore steps
- [ ] Screenshots/examples included (before/after /context output)
- [ ] 85% token reduction (280K → 40K) documented with evidence

### Should Have
- [ ] Advanced section covers custom preset creation
- [ ] Multiple 1MCP instances documentation
- [ ] Performance benchmarks included


### Nice to Have
- [ ] Video tutorial embedded
- [ ] Interactive troubleshooting wizard


---

## 🔗 Dependencies

### Prerequisites (Blocking)
- **None** - Can start immediately

### Dependent Stories (This Blocks)
- **Story 6.2.4: Update Existing Documentation

---

## 📁 Files Modified

### New Files Created
- `docs/architecture/mcp-optimization-1mcp.md`

### Files Modified
- None


### Files Referenced (No Changes)
- `.claude/CLAUDE.md`


---

## 🎨 Deliverables

### 1MCP Installation Guide
**Location:** `docs/architecture/mcp-optimization-1mcp.md`

Comprehensive guide covering installation, configuration, verification, troubleshooting, and rollback.

---

## 💰 Investment Breakdown

- Day 1 (Core Docs): $1,250
- Day 2 (Verification): $1,250
- Total: $2,500

---

## 🎯 Success Metrics

- **Documentation Completeness:** All 9 sections from epic covered
- **Validation:** Installation tested on clean environment
- **Troubleshooting Coverage:** Common issues from .claude/CLAUDE.md addressed

---

## ⚠️ Risks & Mitigation

### Risk 1: Documentation becomes outdated as 1MCP evolves
- **Likelihood:** Medium
- **Impact:** Medium
- **Mitigation:** Add versioning to docs (1MCP v1.0), update checklist in Epic 10

---

## 📝 Notes

Extracts proven 85% token reduction implementation from Story 3.26. Documentation-only story, no code changes.

---

## 🔗 Related Documents

- **Epic:** [Epic-6.2](../epics/epic-6.2.md)

---

**Last Updated:** 2025-01-14
**Previous Story:** N/A
**Next Story:** N/A
**Next Review:** After completion
