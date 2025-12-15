# AIOS 2.0 Migration - Master Stories Index

**Program:** Epic-Master-AIOS-2.0
**Timeline:** Q1 2026 → Q4 2027 (18 months)
**Total Investment:** $118.2K (Year 1) → $1.745M (Year 2)
**Total Stories:** 47+ stories across 12 epics
**Status:** 🟡 In Progress

---

## 📋 Epic Overview

| Epic | Title | Wave | Stories | Effort | Status |
|------|-------|------|---------|--------|--------|
| **[6.1](#epic-61-agent-identity-system)** | Agent Identity System | Wave 1 | 12 | $5,200 | 🟡 In Progress |
| **[6.2](#epic-62-mcp-ecosystem-documentation)** | MCP Ecosystem Docs | Wave 1 | 4 | $7,500 | 🟢 Ready |
| **[6.3](#epic-63-coderabbit-integration)** | CodeRabbit Integration | Wave 1 | 2 | $3,750 | 🟢 Ready |
| **[6.4](#epic-64-partner-foundation)** | Partner Foundation | Wave 1 | 3 | $7,500 | 🟢 Ready |
| **[7](#epic-7-core-i18n-infrastructure)** | Core i18n Infrastructure | Wave 2 | 5 | $15,000 | 🟢 Ready |
| **[8](#epic-8-pt-br-display-layer)** | PT-BR Display Layer | Wave 2 | 4 | $30,000 | 🟢 Ready |
| **[9](#epic-9-phase-0-demo)** | Phase 0 - Demo | Wave 3 | 2 | $1,000 | 🟢 Ready |
| **[10](#epic-10-phase-1-mcp-ecosystem)** | Phase 1 - Open MCP | Wave 3 | 2 | $15,000 | 🟢 Ready |
| **[11](#epic-11-phase-2-expansion-packs)** | Phase 2 - Expansion Packs | Wave 3 | 2 | $7,500 | 🟢 Ready |
| **[12](#epic-12-phase-3-core-repository)** | Phase 3 - Core Repo | Wave 3 | 6 | $22,500 | 🟢 Ready |
| **[ETL](#epic-etl-etl-expansion-pack)** | ETL Expansion Pack | Special | 5 | $3,250 | ✅ Drafted |

**Wave 1 Total:** 20 stories, $23,650 (NON-BREAKING)
**Wave 2 Total:** 9 stories, $45,000
**Wave 3 Total:** 12+ stories, $46,000 (BREAKING - phased)
**ETL Special:** 5 stories, $3,250 (depends on Epic 6.2)

---

## 🎯 Wave 1: Quick Wins (Q1 2026) - NON-BREAKING

### Epic 6.1: Agent Identity System
**Index:** [EPIC-6.1-INDEX.md](EPIC-6.1-INDEX.md)
**Duration:** 6 weeks | **Investment:** $5,200 | **Status:** 🟡 In Progress

**Stories:**
- ✅ [6.1.1](story-6.1.1-agent-persona-definitions.md) - Agent Persona Definitions (DONE)
- 📋 [6.1.2](story-6.1.2.md) - Agent File Updates (11 agents)
- 📋 [6.1.2.5](story-6.1.2.5-contextual-agent-load-system.md) - Contextual Agent Load System (UX Enhancement)
- 📋 [6.1.6](story-6.1.6-output-formatter-implementation.md) - Output Formatter (Layer 2)
- 📋 [6.1.7](story-6.1.7-core-tasks-migration.md) - Core Tasks Migration (104 tasks)
- 📋 [6.1.8](story-6.1.8-templates-migration.md) - Templates Migration (15+ templates)
- 📋 [6.1.9](story-6.1.9-checklists-migration.md) - Checklists Migration (10+ checklists)
- 📋 [6.1.10](story-6.1.10-dependencies-migration.md) - Dependencies & Data Files
- 📋 [6.1.11](story-6.1.11-aios-master-tasks.md) - AIOS-Master Meta-Agent Tasks ⭐
- 📋 [6.1.3](story-6.1.3.md) - Create @docs Agent (Ajax) - 3 weeks
- 📋 [6.1.4](story-6.1.4.md) - Configuration System
- 📋 [6.1.5](story-6.1.5.md) - Testing & Validation

**Key Deliverable:** 13 named agents with 3-level personalization (Minimal, Named, Archetypal)

---

### Epic 6.2: MCP Ecosystem Documentation
**Epic:** [epic-6.2-mcp-ecosystem-docs.md](../../epics/epic-6.2-mcp-ecosystem-docs.md)
**Duration:** 1 week | **Investment:** $7,500 | **Status:** 🟢 Ready

**Stories:**
- 📋 [6.2.1](story-6.2.1.md) - Extract and Document 1MCP Setup (2 days)
- 📋 [6.2.2](story-6.2.2.md) - Preset Selection Guide (1 day)
- 📋 [6.2.3](story-6.2.3.md) - Token Reduction Case Study (1.5 days)
- 📋 [6.2.4](story-6.2.4.md) - Update Existing Documentation (0.5 day)

**Key Deliverable:** 85% token reduction documented (280K → 40K tokens)

**⚠️ CRITICAL:** Epic ETL depends on 6.2.1 + 6.2.2 completing first

---

### Epic 6.3: CodeRabbit Integration
**Epic:** [epic-6.3-coderabbit-integration.md](../../epics/epic-6.3-coderabbit-integration.md)
**Duration:** 3 days | **Investment:** $3,750 | **Status:** 🟢 Ready

**Stories:**
- 📋 [6.3.1](story-6.3.1.md) - CodeRabbit Configuration (1.5 days)
- 📋 [6.3.2](story-6.3.2.md) - Integration Testing (1.5 days)

**Key Deliverable:** Automated PR reviews with specialized agent assignments

---

### Epic 6.4: Partner Program Foundation
**Epic:** [epic-6.4-partner-foundation.md](../../epics/epic-6.4-partner-foundation.md)
**Duration:** 1 week | **Investment:** $7,500 | **Status:** 🟢 Ready

**Stories:**
- 📋 [6.4.1](story-6.4.1.md) - Legal Templates & Agreements (2 days)
- 📋 [6.4.2](story-6.4.2.md) - Partner Onboarding Checklist (2 days)
- 📋 [6.4.3](story-6.4.3.md) - ClickUp Partner Workspace (1 day)

**Key Deliverable:** Infrastructure for 4 Founding Partners

---

## 🌍 Wave 2: Localization (Q2 2026)

### Epic 7: Core i18n Infrastructure
**Epic:** [epic-7-i18n-core.md](../../epics/epic-7-i18n-core.md)
**Duration:** 2 weeks | **Investment:** $15,000 | **Status:** 🟢 Ready

**Stories:**
- 📋 [7.1](story-7.1.md) - i18n Architecture (3 days)
- 📋 [7.2](story-7.2.md) - Language Detection (2 days)
- 📋 [7.3](story-7.3.md) - Base Translation Files (3 days)
- 📋 [7.4](story-7.4.md) - CLI Translation (2 days)
- 📋 [7.5](story-7.5.md) - Testing & Validation (2 days)

**Key Deliverable:** `aios-core/i18n/` infrastructure supporting EN + PT-BR

---

### Epic 8: PT-BR Display Layer + Agent Identity Integration
**Epic:** [epic-8-ptbr-display.md](../../epics/epic-8-ptbr-display.md)
**Duration:** 4 weeks | **Investment:** $30,000 | **Status:** 🟢 Ready

**Stories:**
- 📋 [8.1](story-8.1.md) - Agent Greetings PT-BR (1 week)
- 📋 [8.2](story-8.2.md) - Commands & Errors PT-BR (1 week)
- 📋 [8.3](story-8.3.md) - Interactive Prompts PT-BR (1 week)
- 📋 [8.4](story-8.4.md) - Testing & QA PT-BR (1 week)

**Key Deliverable:** Full PT-BR support for 200M+ Portuguese speakers

---

## 🏗️ Wave 3: Repository Architecture (Q2-Q3 2026) - BREAKING

### Epic 9: Phase 0 - Demonstrate Value
**Epic:** [epic-9-phase0-demo.md](../../epics/epic-9-phase0-demo.md)
**Duration:** 8 hours | **Investment:** $1,000 | **Status:** 🟢 Ready

**Stories:**
- 📋 [9.1](story-9.1.md) - YouTube Demo + Landing Page (4 hours)
- 📋 [9.2](story-9.2.md) - Social Posts + Analytics (4 hours)

**Kill Switch:** <1,000 upvotes → defer open-source

---

### Epic 10: Phase 1 - Open MCP Ecosystem
**Epic:** [epic-10-phase1-mcp.md](../../epics/epic-10-phase1-mcp.md)
**Duration:** 1 week | **Investment:** $15,000 | **Status:** 🟢 Ready

**Stories:**
- 📋 [10.1](story-10.1.md) - Create aios/mcp-ecosystem repo (3 days)
- 📋 [10.2](story-10.2.md) - Publish 4 presets + docs (2 days)

**Kill Switch:** <200 stars in 1 week → iterate messaging

---

### Epic 11: Phase 2 - Expansion Pack Spec
**Epic:** [epic-11-phase2-packs.md](../../epics/epic-11-phase2-packs.md)
**Duration:** 1 week | **Investment:** $7,500 | **Status:** 🟢 Ready

**Stories:**
- 📋 [11.1](story-11.1.md) - Create aios/expansion-packs repo (3 days)
- 📋 [11.2](story-11.2.md) - Publish pack specification (2 days)

**Kill Switch:** <10 community packs in 2 weeks → add examples

---

### Epic 12: Phase 3 - Open Core Repository
**Epic:** [epic-12-phase3-core.md](../../epics/epic-12-phase3-core.md)
**Duration:** 6 weeks | **Investment:** $22,500 | **Status:** 🟢 Ready

**Stories:**
- 📋 [12.1](story-12.1.md) - Create aios/aios-core repo (1 week)
- 📋 [12.2](story-12.2.md) - Migrate submodule (2 weeks)
- 📋 [12.3](story-12.3.md) - Publish @aios/core npm package (1 week)
- 📋 [12.4](story-12.4.md) - Archive aios-fullstack submodule (1 week)
- 📋 [12.5](story-12.5.md) - Update documentation (1 week)
- 📋 12.6 - Launch PR campaign (TBD)

**Kill Switch:** <500 stars or <50 packs → stay Phase 2

---

## 🚀 Special: ETL Expansion Pack

### Epic ETL: ETL Expansion Pack - Universal Data Collection
**Index:** [ETL-STORIES-INDEX.md](ETL-STORIES-INDEX.md)
**Epic:** [epic-etl-expansion-pack.md](../../epics/epic-etl-expansion-pack.md)
**Duration:** 4 weeks (including Epic 6.2 dependency) | **Investment:** $3,250
**Status:** ✅ Drafted | **Dependencies:** 🔴 Epic 6.2 Stories 6.2.1 + 6.2.2

**Stories:**
- ✅ [ETL.1](ETL.1.foundation-p0.md) - Foundation (P0) - 11h
- ✅ [ETL.2](ETL.2.remaining-collectors-p1.md) - Remaining Collectors (P1) - 6h
- ✅ [ETL.3](ETL.3.mcp-expansion-presets-p1.md) - MCP Expansion + Presets (P1) - 4h 🔴 HARD BLOCKER
- ✅ [ETL.4](ETL.4.tests-docs-cicd-p1.md) - Tests + Docs + CI/CD (P1) - 12h
- ✅ [ETL.5](ETL.5.batch-cache-p2.md) - Batch + Cache (P2 - Optional) - 7h

**Key Deliverable:** 4 data collectors (video, web, email, books) via 1MCP

**Timeline (4 weeks):**
```
Week 1: Epic 6.2 (Stories 6.2.1 + 6.2.2) - Remove blockers ⚠️
Week 2: ETL Stories 1-3 + Story 4 (starts)
Week 3: ETL Story 4 (completes) + Story 5
Week 4: Release v1.0
```

**ROI:** $300K-$765K (12 months) from $3,250 investment (93x-236x)

**Dependencies Analysis:** [etl-epic-dependencies-analysis.md](../../planning/etl-epic-dependencies-analysis.md)

---

## ⏰ Execution Timeline

### Q1 2026 (Wave 1 - Quick Wins)
```
Week 1-2:   Epic 6.1 (Agent Identity) - Stories 6.1.1-6.1.2
Week 3:     Epic 6.2 (MCP Docs) - ALL STORIES ← ETL DEPENDENCY
Week 4-6:   Epic 6.1 continues (6.1.6-6.1.11)
Week 7:     Epic 6.3 (CodeRabbit)
Week 8:     Epic 6.4 (Partner Foundation)
```

### Q2 2026 (Wave 2 - Localization + ETL)
```
Week 1-2:   Epic 7 (i18n Infrastructure)
Week 3-6:   Epic 8 (PT-BR Display Layer)
Week 7-10:  Epic ETL (Data Collection) ← STARTS AFTER Epic 6.2
```

### Q2-Q3 2026 (Wave 3 - Repository Architecture)
```
Week 11:    Epic 9 (Phase 0 - Demo)
Week 12-13: Epic 10 (Phase 1 - MCP Ecosystem)
Week 14-15: Epic 11 (Phase 2 - Expansion Packs)
Week 16-21: Epic 12 (Phase 3 - Core Repository)
Week 22:    Epic 13 (Phase 4 - Marketplace) - TBD
```

---

## 📊 Investment Summary

### By Wave
| Wave | Epics | Stories | Investment | Status |
|------|-------|---------|------------|--------|
| **Wave 1** | 4 | 21 | $23,950 | 🟡 In Progress |
| **Wave 2** | 2 | 9 | $45,000 | 🟢 Ready |
| **Wave 3** | 5 | 12+ | $46,000 | 🟢 Ready |
| **Special** | 1 (ETL) | 5 | $3,250 | ✅ Drafted |
| **Total Year 1** | 12 | 47+ | **$118,200** | - |

### By Type
- **Agent System:** $5,200 (Epic 6.1)
- **Documentation:** $7,500 (Epic 6.2)
- **Quality Gates:** $3,750 (Epic 6.3)
- **Partner Ecosystem:** $7,500 (Epic 6.4)
- **Localization:** $45,000 (Epics 7 + 8)
- **Repository Migration:** $46,000 (Epics 9-12)
- **Data Collection:** $3,250 (Epic ETL)

---

## 🔗 Critical Dependencies

### Epic 6.2 → Epic ETL (HARD BLOCKER)
**Epic 6.2 Stories 6.2.1 + 6.2.2 MUST complete before ETL Story 3**

| ETL Story | Depends On | Impact if Epic 6.2 Delays |
|-----------|-----------|---------------------------|
| ETL.1 (P0.4) | Epic 6.2.1 | SOFT - Workaround available |
| **ETL.3** | **Epic 6.2.1 + 6.2.2** | **HARD BLOCKER - Cannot start** |
| ETL.4 | Epic 6.2.3 + 6.2.4 | SOFT - Enhances quality |

**Mitigation:** Epic 6.2 scheduled Week 3 Q1 2026 (before ETL starts Week 7)

### Epic 6.1 → Epic 8 (Agent Identity Required)
Epic 8 (PT-BR) requires Epic 6.1 agent names to translate greetings correctly.

### Epic 6.1.3 → Epic 14 (Docs Agent Required)
Epic 14 (Partner Onboarding) requires @docs agent from Story 6.1.3.

---

## 📈 Success Metrics

### Year 1 Validation Targets (2026)
- ✅ $15K+ MRR (Month 12)
- ✅ 10K+ GitHub stars
- ✅ 4 successful Founding Partners with revenue
- ✅ 20 proprietary packs (prevents HashiCorp failure)
- ✅ 200+ community packs
- ✅ Test coverage >85%

### Agent Identity Success (Epic 6.1)
- ✅ All 11 agents have complete personas
- ✅ 3 personification levels functional
- ✅ Beta testing: 20 users, 4.5/5 stars
- ✅ 80%+ users keep Level 2 (Named) as default

### ETL Success (Epic ETL)
- ✅ MMOS fidelity: 95%+ (from 85%)
- ✅ Agent productivity: 15-20h/week saved per agent
- ✅ 100+ minds created using ETL
- ✅ ROI: $300K-$765K validated

---

## ⚡ Quick Links

### Planning & Architecture
- **Epic Master:** [epic-master-aios-2.0.md](../../epics/epic-master-aios-2.0.md)
- **ETL Dependencies:** [etl-epic-dependencies-analysis.md](../../planning/etl-epic-dependencies-analysis.md)
- **ETL Roadmap:** [etl-roadmap-3weeks.md](../../planning/etl-roadmap-3weeks.md)
- **ETL File Structure:** [etl-file-structure-by-story.md](../../planning/etl-file-structure-by-story.md)

### Standards & Decisions
- **Agent Personalization:** [AGENT-PERSONALIZATION-STANDARD-V1.md](../../standards/AGENT-PERSONALIZATION-STANDARD-V1.md)
- **Task Format:** [TASK-FORMAT-SPECIFICATION-V1.md](../../standards/TASK-FORMAT-SPECIFICATION-V1.md)
- **V3 Architecture:** [V3-ARCHITECTURAL-DECISIONS.md](../../standards/V3-ARCHITECTURAL-DECISIONS.md)

### Templates
- **Agent Template:** [personalized-agent-template.md](../../../.aios-core/templates/personalized-agent-template.md)
- **Task Template V2.0:** [personalized-task-template-v2.md](../../../.aios-core/templates/personalized-task-template-v2.md)

---

## 📋 How to Use This Index

### For Product Owners
1. **Review epic overview** - Understand scope and investment
2. **Check dependencies** - Validate sequencing (especially Epic 6.2 → ETL)
3. **Track progress** - Update story statuses
4. **Prioritize** - Wave 1 is NON-BREAKING, Wave 3 is BREAKING

### For Development Team
1. **Pick epic** - Check "Status" column
2. **Read epic-specific index** - EPIC-6.1-INDEX.md, ETL-STORIES-INDEX.md, etc.
3. **Follow dependency chain** - Some stories block others
4. **Check acceptance criteria** - Each story has clear DoD

### For QA Team
1. **Review test coverage targets** - 85%+ for production code
2. **Check quality gates** - CodeRabbit integration in all stories
3. **Validate success metrics** - Each epic has measurable goals

---

**Index Version:** 2.1
**Created:** 2025-01-14
**Last Updated:** 2025-01-15
**Maintained by:** Product Owner (Pax)
**Total Stories:** 47+ stories across 12 epics
**Total Investment:** $118,200 (Year 1)
**Recent Changes:** Added Story 6.1.2.5 (Contextual Agent Load System) - $300, 3 days
