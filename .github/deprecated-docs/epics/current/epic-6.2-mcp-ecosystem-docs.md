# Epic 6.2: MCP Ecosystem Documentation

**Epic ID:** Epic-6.2
**Parent:** Epic-Master-AIOS-2.0 (Wave 1)
**Status:** 🟢 Ready to Start
**Priority:** 🟡 Medium (Quick Win)
**Owner:** Docs (Ajax - to be created) + Architect (Aria)
**Created:** 2025-01-14
**Target Completion:** Q1 2026, Week 3
**Duration:** 1 week (0.5 sprint)
**Investment:** $7.5K

---

## 📋 Executive Summary

Document the already-implemented 1MCP optimization (Story 3.26) to demonstrate **85% token reduction** (280K → 40K tokens). Create comprehensive guides for preset configuration, enabling quick wins for users struggling with token exhaustion.

### 🎯 Objectives

1. **Extract 1MCP configuration** from `.claude/CLAUDE.md` to public docs
2. **Create preset guide** for 4 presets (aios-dev, aios-research, aios-docker, aios-full)
3. **Document token optimization** case study (280K → 40K)
4. **Prepare for Phase 1** (Epic 10: Open MCP Ecosystem repo)
5. **Zero code changes** (documentation only)

### 💰 Value

- **Investment:** $7.5K (1 week)
- **Benefit:** Unblocks users with token exhaustion issues
- **Evidence:** Already implemented, proven 85% reduction
- **Quick Win:** No dependencies, can start immediately after Epic 6.1

---

## 🏗️ Current State

### 1MCP Implementation Status
- ✅ **Implemented:** Story 3.26 (1MCP Context Optimization)
- ✅ **Location:** `.claude/CLAUDE.md` (private global instructions)
- ✅ **Proven Results:** 280K → 40K tokens with `aios-dev` preset
- ✅ **4 Presets Configured:**
  - `aios-dev` (github, browser) - ~25-40k tokens
  - `aios-research` (context7, browser) - ~40-60k tokens
  - `aios-docker` (docker-desktop-toolkit) - ~15-20k tokens (disabled by default)
  - `aios-full` (all MCPs) - ~60-80k tokens

### Documentation Gaps
- ❌ No public documentation for 1MCP setup
- ❌ Preset guide not formalized
- ❌ Token reduction case study missing
- ❌ Installation instructions scattered

---

## 📦 Target State

### Documentation Structure

```
docs/architecture/
├── mcp-optimization-1mcp.md          # NEW - Comprehensive guide
├── mcp-preset-guide.md                # NEW - Preset selection guide
└── mcp-token-reduction-case-study.md  # NEW - 280K → 40K analysis

aios-core/tools/mcp/
├── README.md                          # UPDATED - Reference new docs
└── presets/                           # NEW - Preset YAML files
    ├── aios-dev.yaml
    ├── aios-research.yaml
    ├── aios-docker.yaml
    └── aios-full.yaml
```

---

## 📊 Stories Breakdown

### Story 6.2.1: Extract and Document 1MCP Setup
**Objective:** Create comprehensive 1MCP installation and configuration guide

**Content to Extract from `.claude/CLAUDE.md`:**
1. What is 1MCP? (definition, benefits)
2. Installation steps (`npm install -g @1mcp/agent`)
3. MCP configuration (`1mcp mcp add ...`)
4. Preset creation (`1mcp preset create ...`)
5. Server startup (foreground/background/service)
6. Claude Code configuration (`~/.claude.json`)
7. Verification steps (`/context` command)
8. Troubleshooting (port conflicts, token reduction validation)
9. Rollback procedure (backup restore)

**New File:** `docs/architecture/mcp-optimization-1mcp.md`

**Sections:**
- Introduction (What is 1MCP?)
- Benefits (85% token reduction, hot-reload, single endpoint)
- Prerequisites (Node.js, Claude Code)
- Installation (step-by-step)
- Configuration (MCPs + Presets)
- Verification (token count validation)
- Troubleshooting (common issues)
- Rollback (backup/restore)
- Advanced (custom presets, multiple instances)

**Acceptance Criteria:**
- [ ] Complete guide covers all installation steps
- [ ] Step-by-step instructions tested on clean environment
- [ ] Troubleshooting section addresses common issues
- [ ] Rollback procedure validated
- [ ] Screenshots/examples included

**Estimated Time:** 2 days

---

### Story 6.2.2: Preset Selection Guide
**Objective:** Help users choose the right preset for their workflow

**New File:** `docs/architecture/mcp-preset-guide.md`

**Content:**
| Preset | MCPs | Token Budget | Use Cases | When to Use |
|--------|------|--------------|-----------|-------------|
| **aios-dev** | github, browser | ~25-40k | Story implementation, PRs, code reviews | Default for development work |
| **aios-research** | context7, browser | ~40-60k | Research, documentation, learning | When exploring new libraries/APIs |
| **aios-docker** | docker-desktop-toolkit | ~15-20k | Docker/containers, browser automation | Only when working with containers |
| **aios-full** | all configured | ~60-80k | Complex multi-domain tasks | Rarely (use sparingly) |

**Decision Tree:**
```
Are you working with Docker?
  → YES: Use aios-docker
  → NO: Continue

Do you need library documentation (context7)?
  → YES: Use aios-research
  → NO: Use aios-dev (default)

Are you doing complex multi-domain work?
  → YES: Use aios-full (caution: higher token usage)
  → NO: Stick with aios-dev
```

**Acceptance Criteria:**
- [ ] Preset comparison table created
- [ ] Use case examples for each preset
- [ ] Decision tree helps users choose
- [ ] Token budget ranges documented
- [ ] When to enable/disable aios-docker explained

**Estimated Time:** 1 day

---

### Story 6.2.3: Token Reduction Case Study
**Objective:** Document the 280K → 40K token reduction achievement

**New File:** `docs/architecture/mcp-token-reduction-case-study.md`

**Sections:**
1. **Problem:** Claude Code unusability with 9 direct MCPs (280K tokens)
2. **Solution:** 1MCP aggregator with preset-based filtering
3. **Implementation:** 4 presets (aios-dev, aios-research, aios-docker, aios-full)
4. **Results:** 85% token reduction (280K → 40K with aios-dev)
5. **Methodology:** Token measurement before/after
6. **Benefits:** Faster responses, longer conversations, better context management
7. **Recommendations:** Default to aios-dev, use aios-docker on-demand

**Data to Include:**
- Token count screenshots (before/after `/context` command)
- Performance metrics (response time, conversation length)
- User testimonials (if available)

**Acceptance Criteria:**
- [ ] Case study documents problem → solution → results
- [ ] Token reduction validated and documented
- [ ] Screenshots of `/context` before/after
- [ ] Methodology reproducible
- [ ] Recommendations actionable

**Estimated Time:** 1.5 days

---

### Story 6.2.4: Update Existing Documentation
**Objective:** Update README and tool docs to reference new guides

**Files to Update:**
1. `aios-core/tools/mcp/README.md` - Add "Token Optimization" section
2. Root `README.md` - Add badge: "⚡ 85% Token Reduction with 1MCP"
3. `.claude/CLAUDE.md` - Add link to new public docs

**Changes:**
```markdown
## ⚡ MCP Optimization (1MCP)

AIOS uses 1MCP for **85% token reduction** (280K → 40K tokens).

**Quick Start:**
1. See [MCP Optimization Guide](docs/architecture/mcp-optimization-1mcp.md)
2. Choose preset: [Preset Selection Guide](docs/architecture/mcp-preset-guide.md)
3. Read case study: [Token Reduction](docs/architecture/mcp-token-reduction-case-study.md)

**Presets:**
- `aios-dev` (default) - 25-40k tokens
- `aios-research` - 40-60k tokens
- `aios-docker` (on-demand) - 15-20k tokens
- `aios-full` (rarely) - 60-80k tokens
```

**Acceptance Criteria:**
- [ ] README updated with MCP optimization section
- [ ] Badge added to root README
- [ ] `.claude/CLAUDE.md` links to public docs
- [ ] All links valid and tested

**Estimated Time:** 0.5 day

---

## 📈 Success Metrics

### Completion Criteria
- ✅ 3 new documentation files created
- ✅ Existing README/docs updated with links
- ✅ 1MCP setup guide validated on clean environment
- ✅ Preset selection guide helps users choose efficiently
- ✅ Token reduction case study demonstrates value

### User Impact Metrics (3 months post-launch)
- ✅ 50%+ new users adopt 1MCP (vs direct MCPs)
- ✅ Average token usage drops from 280K → 60K (aios-research average)
- ✅ User feedback: "1MCP made Claude Code usable again"
- ✅ Troubleshooting guide reduces support requests by 30%

---

## ⚠️ Risks & Mitigation

### Risk 1: Documentation becomes outdated
- **Probability:** MEDIUM
- **Impact:** MEDIUM
- **Mitigation:** Add versioning to docs (1MCP v1.0), update checklist in Epic 10

### Risk 2: Users skip documentation and struggle
- **Probability:** HIGH
- **Impact:** LOW
- **Mitigation:** Add prominent links in README, installer wizard mentions 1MCP

---

## 🔗 Related Resources

### Parent Epic
- [Epic Master: AIOS 2.0](epic-master-aios-2.0.md)

### Downstream Epics
- [Epic 10: Phase 1 - Open MCP Ecosystem](epic-10-phase1-mcp.md) - Will extract these docs to `aios/mcp-ecosystem` repo
- [Epic ETL: ETL Expansion Pack](epic-etl-expansion-pack.md) ⚠️ **DEPENDS ON THIS EPIC** - Needs 1MCP docs for integration

### Related Stories
- **Story 3.26:** 1MCP Context Optimization (already implemented)
- **ETL Stories (downstream):** ETL Story 1 (P0.4), Story 3, Story 4 depend on Epic 6.2 docs

### External Resources
- [1MCP Documentation](https://github.com/1mcp/agent)
- [Claude Code MCP Guide](https://docs.anthropic.com/claude-code/mcp)

---

## 📝 Notes

### Why Documentation-Only Epic?
- **1MCP already implemented** (Story 3.26) and working
- **Quick win:** Documentation unblocks users immediately
- **Prepares for Epic 10:** Extracted docs will be moved to `aios/mcp-ecosystem` repo

### Token Reduction Impact
- **Before:** 280K tokens (Claude Code unusable with 9 MCPs)
- **After:** 40K tokens with `aios-dev` preset (85% reduction)
- **Benefit:** Faster responses, longer conversations, better context management

---

**Last Updated:** 2025-01-14
**Next Review:** 2025-01-21
**Owner:** Docs (Ajax) + Architect (Aria)
**Status:** 🟢 Ready to Start (Week 3, Q1 2026)
