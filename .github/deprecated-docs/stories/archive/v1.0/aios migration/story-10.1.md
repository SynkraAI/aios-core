# Story 10.1: Create aios/mcp-ecosystem Repository + Extract Docs

**Story ID:** 10.1
**Epic:** Epic-10 - Phase 1 - Open MCP Ecosystem
**Wave:** Wave 3 (Progressive Open Source)
**Status:** 📋 Ready to Start
**Priority:** 🔴 Critical
**Owner:** DevOps (Gage) + Architect (Aria)
**Created:** 2025-01-14
**Duration:** 2 days
**Investment:** $3,000

---

## 📋 Objective

Create NEW PUBLIC REPO aios/mcp-ecosystem (Apache 2.0) with 1MCP presets, configurations, tools, and documentation extracted from Epic 6.2 and .claude/CLAUDE.md.

---

## 🎯 Scope

Create GitHub repository aios/mcp-ecosystem with Apache 2.0 license. Extract 4 preset YAML files (aios-dev, aios-research, aios-docker, aios-full), 1MCP setup docs, Claude Code config template, and validation/generator tools. Demonstrates 85% token reduction unique value BEFORE opening core.

---

## 📊 Tasks Breakdown

**Day 1: Repository Setup & Preset Extraction (8 hours)** (8 hours)
Create repository and extract preset files
- Create GitHub repository: aios/mcp-ecosystem
- License: Apache 2.0 (permissive, commercial-friendly)
- Create folder structure:
- - presets/ (4 YAML files)
- - configs/ (setup docs + config templates)
- - tools/ (validator + generator scripts)
- Extract 4 preset YAML files from .claude/CLAUDE.md:
- - presets/aios-dev.yaml (github, browser, ~25-40k tokens)
- - presets/aios-research.yaml (context7, browser, ~40-60k tokens)
- - presets/aios-docker.yaml (docker-desktop-toolkit, ~15-20k tokens)
- - presets/aios-full.yaml (all MCPs, ~60-80k tokens)
- Each preset includes: MCP list, token budget, use cases, when to use

**Day 2: Documentation & Tools (8 hours)** (8 hours)
Extract documentation and create validation tools
- Extract from Epic 6.2 docs:
- - configs/1mcp-setup.md (installation guide from Story 6.2.1)
- - configs/claude-code-config.json (template for ~/.claude.json)
- Create tools/mcp-validator.js:
- - Validate MCP configurations (syntax, required fields)
- - Check token budget estimates
- Create tools/preset-generator.js:
- - Generate custom presets from user input
- - Validate preset compatibility
- Create README.md:
- - Title: '85% Token Reduction Guide for Claude Code'
- - Sections: Problem, Solution (1MCP), Presets, Installation, Results
- - Badge: Apache 2.0 license
- - Links to docs and tools
- Add CONTRIBUTING.md, LICENSE, .gitignore

---

## ✅ Acceptance Criteria

### Must Have
- [ ] GitHub repository aios/mcp-ecosystem created (Apache 2.0)
- [ ] 4 preset YAML files extracted and committed (aios-dev, research, docker, full)
- [ ] 1MCP setup documentation extracted from Epic 6.2
- [ ] Claude Code config template created (configs/claude-code-config.json)
- [ ] MCP validator tool created (tools/mcp-validator.js)
- [ ] Preset generator tool created (tools/preset-generator.js)
- [ ] README highlights 85% token reduction with evidence
- [ ] Repository structure clean and documented

### Should Have
- [ ] CONTRIBUTING.md guides community contributions
- [ ] Examples of custom presets
- [ ] Troubleshooting section in README


### Nice to Have
- [ ] GitHub Actions for preset validation
- [ ] Automated token budget calculation


---

## 🔗 Dependencies

### Prerequisites (Blocking)
- **Epic 9: Phase 0 Validation (GO decision)

### Dependent Stories (This Blocks)
- **Story 10.2: Marketing Push

---

## 📁 Files Modified

### New Files Created
- `aios/mcp-ecosystem/README.md`
- `aios/mcp-ecosystem/LICENSE`
- `aios/mcp-ecosystem/CONTRIBUTING.md`
- `aios/mcp-ecosystem/presets/aios-dev.yaml`
- `aios/mcp-ecosystem/presets/aios-research.yaml`
- `aios/mcp-ecosystem/presets/aios-docker.yaml`
- `aios/mcp-ecosystem/presets/aios-full.yaml`
- `aios/mcp-ecosystem/configs/1mcp-setup.md`
- `aios/mcp-ecosystem/configs/claude-code-config.json`
- `aios/mcp-ecosystem/tools/mcp-validator.js`
- `aios/mcp-ecosystem/tools/preset-generator.js`

### Files Modified
- None


### Files Referenced (No Changes)
- `.claude/CLAUDE.md`
- `docs/architecture/mcp-optimization-1mcp.md`
- `docs/architecture/mcp-preset-guide.md`
- `docs/architecture/mcp-token-reduction-case-study.md`


---

## 🎨 Deliverables

### aios/mcp-ecosystem Repository
**Location:** `GitHub: aios/mcp-ecosystem`

Complete public repository with presets, configs, tools, and documentation.

---

## 💰 Investment Breakdown

- Day 1 (Repo Setup & Presets): $1,500
- Day 2 (Docs & Tools): $1,500
- Total: $3,000

---

## 🎯 Success Metrics

- **Repository Created:** aios/mcp-ecosystem live on GitHub
- **Preset Coverage:** All 4 presets extracted and documented
- **Documentation Quality:** 85% token reduction clearly demonstrated

---

## ⚠️ Risks & Mitigation

### Risk 1: Low community interest (<200 stars in 1 week)
- **Likelihood:** Medium
- **Impact:** Medium
- **Mitigation:** KILL SWITCH: <200 stars → iterate messaging, improve docs before Epic 11

---

## 📝 Notes

First public AIOS repository. Demonstrates unique value (85% token reduction) BEFORE opening core. KILL SWITCH: <200 stars in 1 week → iterate before Epic 11.

---

## 🔗 Related Documents

- **Epic:** [Epic-10](../epics/epic-10.md)

---

**Last Updated:** 2025-01-14
**Previous Story:** N/A
**Next Story:** N/A
**Next Review:** After completion
