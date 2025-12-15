# Epic Master: AIOS 2.0 - Multi-Repo Architecture with Global Expansion

**Epic ID:** Epic-Master-AIOS-2.0
**Type:** 🎯 Master Tracking Epic
**Status:** 🟡 Planning
**Priority:** 🔴 Critical (Strategic)
**Owner:** PM (Morgan) + CEO/CTO
**Created:** 2025-01-14
**Target Completion:** Q4 2027 (18 months)

---

## 📋 Executive Summary

Complete strategic transformation of AIOS from monorepo to multi-repository architecture with Portuguese localization, named agent system, founding partners program, and phased open-source strategy. This master epic implements 5 approved strategic decisions validated through evidence-based analysis (20 case studies, 32 academic sources, 4 cognitive clone roundtables).

### 🎯 Strategic Objectives

1. **Agent Identity System:** 13 named agents (Dex, Quinn, Pax, Morgan, River, Aria, Atlas, Uma, Dara, Gage, Apex, Ajax, Orion)
2. **PT-BR Localization:** Display layer translation (200M+ Portuguese speakers)
3. **Repository Architecture:** 1 monorepo → 5 independent repos (3 public, 2 private)
4. **Partner Ecosystem:** 4 Founding Partners → 100+ partners by Year 2
5. **Open-Source Strategy:** Phased validation with kill switches at each phase

### 💰 Financial Overview

| Metric | Year 1 (2026) | Year 2 (2027) |
|--------|---------------|---------------|
| **Investment** | $155K | $1.745M (seed round) |
| **Revenue (ARR)** | $85K | $1.745M |
| **Net Profit** | -$70K | +$415K |
| **Partners** | 4 | 100+ |
| **GitHub Stars** | 10K+ | 50K+ |
| **Community Packs** | 200+ | 500+ |

### 🎖️ Success Validation

- **Validation Score:** 9.7/10 (evidence-based)
- **ROI:** 2.7x partner LTV/CAC ratio (54:1)
- **Total Savings:** $637K vs original upfront approach
- **Risk Mitigation:** Phased with 8 kill switches

---

## 🏗️ Current State Analysis

### Architecture
- **Repository Structure:** 1 monorepo + 1 submodule (`aios-fullstack`)
- **Agents:** 15 agents (need consolidation to 13)
- **Licensing:** 100% MIT
- **Localization:** English-only
- **MCP Configuration:** ✅ 1MCP implemented (Story 3.26) - 85% token reduction

### Strategic Decisions Approved (Nov 13, 2025)
1. **Decision #1:** PT-BR Localization ($45K, 3 sprints)
2. **Decision #2:** Agent Identity System ($30K, 2 sprints)
3. **Decision #3:** Founding Partners Program ($270K phased, 18 months)
4. **Decision #4:** Open-Source Strategy ($155K Year 1)
5. **Decision #5:** Repository Restructuring ($7.5K-$52.5K phased)

### Critical Gaps Identified
- ⚠️ **Repository split** - Submodule → 5 independent repos (BREAKING)
- ⚠️ **Agent consolidation** - 15 → 13 agents (merge aios-developer + aios-orchestrator → aios-master)
- ⚠️ **License changes** - MIT → Commons Clause/Apache 2.0/Proprietary (BREAKING)
- ⚠️ **npm package migration** - `aios-fullstack` → `@aios/core` (BREAKING)
- ✅ **MCP optimization** - Already implemented (Quick Win)

---

## 📦 Target State Architecture

### 5-Repository Structure

**PUBLIC (Distribution Strategy):**
```
aios/aios-core              (Commons Clause)
├── 13 named agents (Dex, Quinn, Pax...)
├── 101+ tasks
├── 34+ templates
├── i18n/ (EN + PT-BR)
└── tools/installer/

aios/expansion-packs        (MIT)
├── verified/
│   ├── etl/
│   └── expansion-creator/
└── community/              # Community PRs

aios/mcp-ecosystem          (Apache 2.0)
├── presets/
│   ├── aios-dev.yaml
│   ├── aios-research.yaml
│   ├── aios-docker.yaml
│   └── aios-full.yaml
└── configs/
    └── 1mcp-setup.md       # 85% token reduction guide
```

**PRIVATE (Capture Strategy):**
```
aios/certified-partners     (Proprietary)
├── partners/               # 4 Founding → 100+ partners
├── proprietary-packs/      # 70/30 revenue share
└── partner-portal/         # Partner OS MVP

aios/mmos                   (Proprietary + NDA)
├── 34+ cognitive clones
└── MMOS v3.0 pipeline      # Maximum moat
```

### 13 Named Agents (Final List)

| ID | Name | Role | Archetype | Current Status |
|----|------|------|-----------|----------------|
| @dev | **Dex** | Builder | Aquarius | ✅ Rename from "James" |
| @qa | **Quinn** | Guardian | Virgo | ✅ Add name |
| @po | **Pax** | Balancer | Libra | ✅ Add name |
| @pm | **Morgan** | Strategist | Capricorn | ✅ Add name |
| @sm | **River** | Facilitator | Pisces | ✅ Add name |
| @architect | **Aria** | Visionary | Sagittarius | ✅ Add name |
| @analyst | **Atlas** | Decoder | Scorpio | ✅ Add name |
| @ux-design-expert | **Uma** | Empathizer | Cancer | ✅ Rename from @ux-expert |
| @data-engineer | **Dara** | Sage | Gemini | ⚠️ Rename from `db-sage` |
| @devops | **Gage** | Automator | Taurus | ⚠️ Rename from `github-devops` |
| @security | **Apex** | Conductor | Leo | ❌ **CREATE NEW** (Wave 1) |
| @docs | **Ajax** | Creator | Aries | ❌ **CREATE NEW** (Wave 1) |
| @aios-master | **Orion** | Commander | Aries | ✅ Merge aios-developer + aios-orchestrator |

---

## 🎯 Master Epic Goals

This epic groups **16 sub-epics** organized in **4 Waves** for phased validation:

### Wave 1: Quick Wins (Q1 2026, $33.75K) - NON-BREAKING ✅
- [ ] Epic 6.1: Agent Identity System (2 weeks, $15K)
- [ ] Epic 6.2: MCP Ecosystem Documentation (1 week, $7.5K)
- [ ] Epic 6.3: CodeRabbit Integration (3 days, $3.75K)
- [ ] Epic 6.4: Partner Program Foundation (1 week, $7.5K)

**Why First:** Zero breaking changes, immediate value, demonstrates quick wins to stakeholders.

### Wave 2: Localization (Q2 2026, $45K)
- [ ] Epic 7: Core i18n Infrastructure (2 weeks, $15K)
- [ ] Epic 8: PT-BR Display Layer + Agent Identity Integration (4 weeks, $30K)

**Why Second:** Depends on Agent Identity (Wave 1), enables global expansion, no breaking changes.

### Wave 3: Repository Architecture (Q2-Q3 2026, $7.5K-$52.5K phased) - BREAKING ⚠️
- [ ] Epic 9: Phase 0 - Demonstrate Value (8 hours, $1K)
- [ ] Epic 10: Phase 1 - Open MCP Ecosystem (1 week, $15K)
- [ ] Epic 11: Phase 2 - Expansion Pack Spec (1 week, $7.5K)
- [ ] Epic 12: Phase 3 - Open Core Repository (6 weeks, $22.5K)
- [ ] Epic 13: Phase 4 - Marketplace Launch (1 week, $7.5K)

**Why Third:** High-risk breaking changes, phased with kill switches, depends on validation from Wave 1-2.

### Wave 4: Partner Ecosystem (Q3 2026 → Q4 2027, $275K)
- [ ] Epic 14: Founding Partners Onboarding (3 months, $25K)
- [ ] Epic 15: Partner OS MVP (4 months, $150K)
- [ ] Epic 16: Scale to 100 Partners (12 months, $100K)

**Why Fourth:** Depends on open-source repos (Wave 3), revenue-focused, long-term scaling.

---

## 📊 Sub-Epic Overview

### Wave 1: Quick Wins (NON-BREAKING)

#### Epic 6.1: Agent Identity System
- **Duration:** 2 weeks
- **Investment:** $15K
- **Stories:** 3 stories
- **Changes:** Rename 13 agents, add 3 personification levels, create @security + @docs agents
- **Breaking:** NO (IDs unchanged)

#### Epic 6.2: MCP Ecosystem Documentation
- **Duration:** 1 week
- **Investment:** $7.5K
- **Stories:** 2 stories
- **Changes:** Document 1MCP setup (already implemented), create preset guide
- **Breaking:** NO (docs only)

#### Epic 6.3: CodeRabbit Integration
- **Duration:** 3 days
- **Investment:** $3.75K
- **Stories:** 1 story
- **Changes:** Add `.coderabbit.yml`, enable GitHub App, configure auto-review
- **Breaking:** NO

#### Epic 6.4: Partner Program Foundation
- **Duration:** 1 week
- **Investment:** $7.5K
- **Stories:** 2 stories
- **Changes:** Legal templates, onboarding checklist, ClickUp workspace
- **Breaking:** NO (infrastructure only)

### Wave 2: Localization

#### Epic 7: Core i18n Infrastructure
- **Duration:** 2 weeks
- **Investment:** $15K
- **Stories:** 3 stories
- **Changes:** Create `aios-core/i18n/`, language detection, `pt-BR.yaml` base
- **Breaking:** NO (English remains default)

#### Epic 8: PT-BR Display Layer + Agent Identity Integration
- **Duration:** 4 weeks
- **Investment:** $30K
- **Stories:** 5 stories
- **Changes:** Translate 13 agent greetings, commands, errors, interactive prompts
- **Breaking:** NO (opt-in via config)

### Wave 3: Repository Architecture (PHASED, BREAKING)

#### Epic 9: Phase 0 - Demonstrate Value
- **Duration:** 8 hours
- **Investment:** $1K
- **Stories:** 1 story
- **Changes:** YouTube demo, landing page, social posts
- **Kill Switch:** <1,000 upvotes → defer open-source

#### Epic 10: Phase 1 - Open MCP Ecosystem
- **Duration:** 1 week
- **Investment:** $15K
- **Stories:** 2 stories
- **Changes:** Create `aios/mcp-ecosystem` repo (Apache 2.0), 4 presets
- **Kill Switch:** <200 stars in 1 week → iterate messaging

#### Epic 11: Phase 2 - Expansion Pack Spec
- **Duration:** 1 week
- **Investment:** $7.5K
- **Stories:** 2 stories
- **Changes:** Create `aios/expansion-packs` repo (MIT), publish specs
- **Kill Switch:** <10 community packs in 2 weeks → add examples

#### Epic 12: Phase 3 - Open Core Repository
- **Duration:** 6 weeks
- **Investment:** $22.5K
- **Stories:** 6 stories
- **Changes:** Create `aios/aios-core` repo (Commons Clause), migrate submodule, publish `@aios/core` npm package
- **Kill Switch:** <500 stars or <50 packs → stay Phase 2
- **Breaking:** YES (npm package migration, submodule archive)

#### Epic 13: Phase 4 - Marketplace Launch
- **Duration:** 1 week
- **Investment:** $7.5K
- **Stories:** 2 stories
- **Changes:** Partner portal beta, marketplace UI, revenue automation
- **Kill Switch:** <$30K MRR → defer marketplace

### Wave 4: Partner Ecosystem

#### Epic 14: Founding Partners Onboarding
- **Duration:** 3 months
- **Investment:** $25K
- **Stories:** 4 stories
- **Partners:** Alan Nicolas, Taynã Puri, Steven Phil, Marco Marcelino
- **Kill Switch:** <3/4 partners report revenue → NO-GO to Phase 2

#### Epic 15: Partner OS MVP
- **Duration:** 4 months
- **Investment:** $150K
- **Stories:** 8 stories
- **Changes:** Create `aios/certified-partners` repo (Proprietary), analytics dashboard, revenue automation
- **Kill Switch:** <10 proprietary packs → abort marketplace

#### Epic 16: Scale to 100 Partners
- **Duration:** 12 months
- **Investment:** $100K
- **Stories:** 6 stories
- **Target:** 100+ partners, marketplace launch, $1M+ ARR

---

## 📈 Success Metrics

### Year 1 Validation Targets (2026)
- ✅ $15K+ MRR (Month 12)
- ✅ 10K+ GitHub stars
- ✅ 4 successful Founding Partners with revenue
- ✅ 20 proprietary packs (prevents HashiCorp failure)
- ✅ 200+ community packs
- ✅ Test coverage >85%

### Year 2 Scale Targets (2027)
- ✅ $1M+ ARR
- ✅ 100+ partners
- ✅ Enterprise tier launched
- ✅ Profitability (+$415K net)
- ✅ 50K+ GitHub stars
- ✅ 500+ community packs

---

## ⚠️ Risks & Mitigation

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Submodule split breaks installation** | HIGH | CRITICAL | Migration guide, publish both old/new packages temporarily |
| **Agent consolidation breaks workflows** | MEDIUM | HIGH | Deprecation path, redirect old IDs to new agents |
| **License change confuses users** | MEDIUM | MEDIUM | Clear communication, FAQ, legal review |
| **npm package scope change** | LOW | HIGH | Publish `@aios/core`, deprecate `aios-fullstack` with redirect |

### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Founding Partners don't close deals** | MEDIUM | CRITICAL | Weekly check-ins, deal support <24h, blocker resolution |
| **Community doesn't contribute packs** | MEDIUM | MEDIUM | Revenue not dependent on community (certified partners model) |
| **Competitor forks** | LOW | HIGH | Commons Clause prevents commercialization, MMOS impossible to replicate |

### Kill Switches (8 Validation Gates)

| Wave/Phase | Kill Switch | Threshold | Action if Fail |
|------------|-------------|-----------|----------------|
| Wave 3, Phase 0 | Upvotes | <1,000 | Defer open-source, refine value prop |
| Wave 3, Phase 1 | GitHub stars | <200 in 1 week | Iterate messaging |
| Wave 3, Phase 2 | Community packs | <10 in 2 weeks | Add examples, simplify spec |
| Wave 3, Phase 3 | GitHub stars + packs | <500 stars OR <50 packs | Stay Phase 2 |
| Wave 3, Phase 4 | MRR | <$30K | Defer marketplace |
| Wave 4, Epic 14 | Partners with revenue | <3/4 | NO-GO to Epic 15 |
| Wave 4, Epic 15 | Proprietary packs | <10 | Abort marketplace |
| Wave 4, Epic 16 | MRR | <$30K Month 18 | Stay Year 1 model |

---

## 🚀 Implementation Plan

### Q1 2026: Wave 1 (Quick Wins)
- **Week 1-2:** Epic 6.1 (Agent Identity)
- **Week 3:** Epic 6.2 (MCP Docs)
- **Week 3:** Epic 6.3 (CodeRabbit) - parallel
- **Week 4:** Epic 6.4 (Partner Foundation)

### Q2 2026: Wave 2 (Localization) + Wave 3 Start
- **Week 1-2:** Epic 7 (i18n Core)
- **Week 3-6:** Epic 8 (PT-BR Display)
- **Week 7:** Epic 9 (Phase 0 - Demo) **VALIDATION GATE**
- **Week 8:** Epic 10 (Phase 1 - MCP) **VALIDATION GATE**
- **Week 9:** Epic 11 (Phase 2 - Packs) **VALIDATION GATE**

### Q3 2026: Wave 3 (Repository Split) + Wave 4 Start
- **Week 1-6:** Epic 12 (Phase 3 - Core Repo) **VALIDATION GATE**
- **Week 7:** Epic 13 (Phase 4 - Marketplace) **VALIDATION GATE**
- **Week 8-12+:** Epic 14 (Founding Partners Onboarding) **VALIDATION GATE**

### Q4 2026 → Q4 2027: Wave 4 (Partner Ecosystem)
- **Q4 2026 - Q1 2027:** Epic 15 (Partner OS MVP) **VALIDATION GATE**
- **Q2 2027 - Q4 2027:** Epic 16 (Scale to 100 Partners) **VALIDATION GATE**

---

## 🔗 Related Resources

### Decision Documents
- [Decision #1: PT-BR Localization](../one-pagers/DECISION-1-PT-BR-LOCALIZATION.md)
- [Decision #2: Agent Identity System](../one-pagers/DECISION-2-AGENT-IDENTITY-SYSTEM.md)
- [Decision #3: Founding Partners Program](../one-pagers/DECISION-3-FOUNDING-PARTNERS-PROGRAM.md)
- [Decision #4: Open-Source Strategy](../one-pagers/DECISION-4-OPEN-SOURCE-STRATEGY.md)
- [Decision #5: Repository Restructuring](../one-pagers/DECISION-5-REPOSITORY-RESTRUCTURING.md)

### Executive Documentation
- [Executive Summary (2-page)](../EXECUTIVE-SUMMARY-2-PAGE.md)
- [Board Presentation (21 slides)](../BOARD-PRESENTATION.md)
- [Seed Pitch Deck (20 slides)](../SEED-PITCH-DECK.md)

### Sub-Epics
- [Epic 6.1: Agent Identity System](epic-6.1-agent-identity-system.md)
- [Epic 6.2: MCP Ecosystem Documentation](epic-6.2-mcp-ecosystem-docs.md)
- [Epic 6.3: CodeRabbit Integration](epic-6.3-coderabbit-integration.md)
- [Epic 6.4: Partner Program Foundation](epic-6.4-partner-foundation.md)
- [Epic 7: Core i18n Infrastructure](epic-7-i18n-core.md)
- [Epic 8: PT-BR Display Layer](epic-8-ptbr-display.md)
- [Epic 9: Phase 0 - Demonstrate Value](epic-9-phase0-demo.md)
- [Epic 10: Phase 1 - Open MCP Ecosystem](epic-10-phase1-mcp.md)
- [Epic 11: Phase 2 - Expansion Pack Spec](epic-11-phase2-packs.md)
- [Epic 12: Phase 3 - Open Core Repository](epic-12-phase3-core.md)
- [Epic 13: Phase 4 - Marketplace Launch](epic-13-phase4-marketplace.md)
- [Epic 14: Founding Partners Onboarding](epic-14-partners-onboarding.md)
- [Epic 15: Partner OS MVP](epic-15-partner-os-mvp.md)
- [Epic 16: Scale to 100 Partners](epic-16-scale-100-partners.md)

### Analysis & Research
- **Comprehensive Migration Analysis:** See Plan agent output (64K tokens)
- **Case Studies:** 20 companies ($100B+ valuations) - Success patterns documented
- **Academic Sources:** 32 research papers on i18n, performance, UX
- **Cognitive Clone Roundtable:** 4 experts (Pedro Valério, Naval Ravikant, Peter Thiel, Paul Graham)

---

## 📝 Notes

### Strategic Decisions Confirmed (Jan 14, 2026)
1. **Agent Consolidation:** Merge `aios-developer` + `aios-orchestrator` → `aios-master` (Orion)
2. **Agent Mapping:**
   - `db-sage` → `@data-engineer` (Dara)
   - `github-devops` → `@devops` (Gage)
   - `ux-design-expert` → Uma (already exists)
3. **Missing Agents:** Create `@security` (Apex) + `@docs` (Ajax) in Wave 1 (with interview for tasks/dependencies)
4. **npm Package:** Migrate to `@aios/core` (org scope, professional)
5. **Submodule:** Archive `aios-fullstack` + deprecation notice (clean break)

### Priority Rationale
- **Critical Priority:** Strategic transformation affecting entire product roadmap
- **18-Month Timeline:** Phased approach with validation gates minimizes risk
- **$155K Year 1 Investment:** 75% cheaper than original $592K upfront plan
- **Evidence-Based:** 20 case studies, 32 academic sources, 4 cognitive clone validations

### Dependencies
- **Upstream:** None (can start immediately)
- **Downstream:** All future development depends on this migration
- **External:** Legal review for licensing changes, professional PT-BR translator

### Blockers
- None identified (phased approach allows early kill switches)

---

**Last Updated:** 2025-01-14
**Next Review:** 2025-01-21 (Weekly)
**Owner:** PM (Morgan) + CEO/CTO (Pedro Valério)
**Status:** 🟡 Planning → Ready to start Epic 6.1
