# Epic 6.1: Agent Identity System

**Epic ID:** Epic-6.1
**Parent:** Epic-Master-AIOS-2.0 (Wave 1)
**Status:** 🟢 Ready to Start
**Priority:** 🔴 Critical (Quick Win)
**Owner:** Dev (Dex) + UX Design Expert (Uma) + Architect (Aria)
**Created:** 2025-01-14
**Target Completion:** Q1 2026, Week 1-4
**Duration:** ~6 weeks
**Investment:** $4,900 ($200 + $300 + $200 + $1,200 + $200 + $200 + $100 + $300 + $2,000 + $200 + $200)

---

## 📋 Executive Summary

Implement 13 named agents with progressive personification levels (Minimal, Named, Archetypal) to improve user experience and task completion rates. Research shows +40% task completion and +20% advice compliance with named agents.

### 🎯 Objectives

1. **Rename 13 agents** from role-only to named personas (Dex, Quinn, Pax, etc.)
2. **Create 1 new agent** (@docs/Ajax) with comprehensive technical specification
3. **@security decision:** ❌ Agent cancelled → security-level module instead (see `docs/decisions/security-agent-vs-security-module-decision.md`)
4. **Merge 2 meta-agents** (aios-developer + aios-orchestrator → aios-master/Orion)
5. **Implement 3 personification levels** (Minimal, Named, Archetypal)
6. **Add configuration system** for user preference (opt-in/opt-out)
7. **Zero breaking changes** (agent IDs stay unchanged)

### 💰 ROI

- **Investment:** $4,900 (breakdown: 6.1.1=$200, 6.1.2=$300, 6.1.6=$200, 6.1.7=$1,200, 6.1.8=$200, 6.1.9=$200, 6.1.10=$100, 6.1.11=$300, 6.1.3=$2,000, 6.1.4=$200, 6.1.5=$200)
- **Performance Gain:** +40% task completion rate
- **Engagement:** +23% with archetypal branding
- **@docs ROI:** +$83,200 (3-year net benefit from documentation automation)
- **Estimated Value:** $10K/month productivity gain for 1,000 users
- **Payback:** 2 months

---

## 🏗️ Current State Analysis

### Existing Agents (15 total)

| # | Current ID | Current Name | File Location | Status |
|---|------------|--------------|---------------|--------|
| 1 | `dev` | James | `aios-core/agents/dev.md` | ✅ Active |
| 2 | `qa` | (No name) | `aios-core/agents/qa.md` | ✅ Active |
| 3 | `po` | (No name) | `aios-core/agents/po.md` | ✅ Active |
| 4 | `pm` | (No name) | `aios-core/agents/pm.md` | ✅ Active |
| 5 | `sm` | (No name) | `aios-core/agents/sm.md` | ✅ Active |
| 6 | `architect` | (No name) | `aios-core/agents/architect.md` | ✅ Active |
| 7 | `analyst` | (No name) | `aios-core/agents/analyst.md` | ✅ Active |
| 8 | `ux-design-expert` | (No name) | `aios-core/agents/ux-design-expert.md` | ✅ Active (unified) |
| 9 | `db-sage` | (No name) | `aios-core/agents/db-sage.md` | ✅ Active (Story 3.16) |
| 10 | `github-devops` | (No name) | `aios-core/agents/github-devops.md` | ✅ Active |
| 11 | `aios-master` | (No name) | `aios-core/agents/aios-master.md` | ✅ Active |
| 12 | `aios-developer` | (No name) | `aios-core/agents/aios-developer.md` | ⚠️ To merge |
| 13 | `aios-orchestrator` | (No name) | `aios-core/agents/aios-orchestrator.md` | ⚠️ To merge |
| 14 | `ux-expert` | (No name) | `aios-core/agents/ux-expert.md` | ❌ Deprecated |
| 15 | `design-system` | (No name) | `aios-core/agents/design-system.md` | ❌ Deprecated |

### Problems Identified
- Only 1 agent has a name ("James" for dev agent)
- No personality or archetypal associations
- No user choice for personification level
- Missing @security and @docs agents
- Redundant meta-agents (aios-developer, aios-orchestrator)

---

## 📦 Target State

### 13 Named Agents (Final Roster)

| ID | Name | Role | Archetype | Color | Icon | File | Changes Required |
|----|------|------|-----------|-------|------|------|------------------|
| `@dev` | **Dex** | Builder | Aquarius (Innovator) | Cyan | ⚡ | `dev.md` | Rename from "James" |
| `@qa` | **Quinn** | Guardian | Virgo (Perfectionist) | Green | ✅ | `qa.md` | Add name + persona |
| `@po` | **Pax** | Balancer | Libra (Mediator) | Yellow | ⚖️ | `po.md` | Add name + persona |
| `@pm` | **Morgan** | Strategist | Capricorn (Planner) | Gray | 📋 | `pm.md` | Add name + persona |
| `@sm` | **River** | Facilitator | Pisces (Empath) | Cyan | 🌊 | `sm.md` | Add name + persona |
| `@architect` | **Aria** | Visionary | Sagittarius (Explorer) | Magenta | 🏛️ | `architect.md` | Add name + persona |
| `@analyst` | **Atlas** | Decoder | Scorpio (Investigator) | Red | 🔍 | `analyst.md` | Add name + persona |
| `@ux-design-expert` | **Uma** | Empathizer | Cancer (Nurturer) | Green | 🎨 | `ux-design-expert.md` | Add name + persona |
| `@data-engineer` | **Dara** | Sage | Gemini (Analyst) | Yellow | 📊 | `db-sage.md` | Rename file + add alias |
| `@devops` | **Gage** | Automator | Taurus (Builder) | Green | ⚙️ | `github-devops.md` | Rename file + add alias |
| ~~`@security`~~ | ~~**Apex**~~ | ~~Conductor~~ | ~~Leo~~ | ~~Red~~ | ~~🔒~~ | ~~`security.md`~~ | **CANCELLED** (see decision doc) |
| `@docs` | **Ajax** | Content Strategist | Aries (Creator) | Blue | 📘 | `docs.md` | **CREATE NEW** (technical spec complete) |
| `@aios-master` | **Orion** | Commander | Aries (Leader) | Cyan | 🌟 | `aios-master.md` | Merge developer + orchestrator |

### 3 Personification Levels

```yaml
# Level 1: Minimal (no personality)
greeting: "⚡ Dev Agent ready"

# Level 2: Named (default)
greeting: "⚡ Dex (Builder) ready. Let's build something great!"

# Level 3: Archetypal (opt-in)
greeting: "⚡ Dex the Builder (♒ Aquarius) ready to innovate!"
```

### Configuration System

```yaml
# .aios-core/core-config.yaml (NEW SECTION)
agentIdentity:
  enabled: true
  level: 2                    # 1=minimal, 2=named, 3=archetypal
  locale: en-US               # or pt-BR (Wave 2)
  showArchetype: false        # Level 3 only
  customGreetings: true       # Allow agent-specific greetings
```

---

## 📊 Stories Breakdown

### Story 6.1.1: Agent Persona Definitions ✅ DONE
**Objective:** Define all 13 agent personas with names, roles, archetypes, colors, icons
**Status:** ✅ Complete (QA Score: 9.5/10)
**Duration:** 2 days
**Investment:** $200

**Deliverables:**
- ✅ `docs/agents/persona-definitions.md` - Complete persona documentation
- ✅ `docs/agents/persona-definitions.yaml` - Machine-readable persona data
- ✅ All 11 archetypes defined with vocabulary, zodiac signs, colors

**Reference:** [Story 6.1.1](../stories/aios migration/story-6.1.1-agent-persona-definitions.md)

---

### Story 6.1.2: Agent File Updates
**Objective:** Update 11 existing agent files with persona_profile sections
**Status:** 📋 Ready to Start
**Duration:** 3 days
**Investment:** $300

**Files to Update:**
1. `dev.md` - Dex (Builder, ♒ Aquarius)
2. `qa.md` - Quinn (Guardian, ♍ Virgo)
3. `po.md` - Pax (Balancer, ♎ Libra)
4. `pm.md` - Morgan (Visionary, ♐ Sagittarius)
5. `sm.md` - River (Flow Master, ♊ Gemini)
6. `architect.md` - Aria (Architect, ♑ Capricorn)
7. `analyst.md` - Atlas (Explorer, ♉ Taurus)
8. `ux-design-expert.md` - Uma (Empathizer, ♓ Pisces)
9. `db-sage.md` → `data-engineer.md` - Dara (Engineer, ♉ Taurus)
10. `github-devops.md` → `devops.md` - Gage (Operator, ♈ Aries)
11. `aios-developer.md` + `aios-orchestrator.md` → `aios-master.md` - Orion (Orchestrator, ♌ Leo)

**Dependencies:** Blocks 6.1.6

**Reference:** [Story 6.1.2](../stories/aios migration/story-6.1.2.md)

---

### Story 6.1.6: Output Formatter Implementation (Layer 2) 🆕
**Objective:** Implement Layer 2 of 3-layer personalization system (Template Engine)
**Status:** 📋 Ready to Start
**Duration:** 2 days
**Investment:** $200

**Key Deliverables:**
- `.aios-core/scripts/output-formatter.js` - PersonalizedOutputFormatter class
- `.aios-core/scripts/validate-output-pattern.js` - Pattern validator
- `.aios-core/templates/task-execution-report.md` - Standardized output template
- Unit tests (50+ test cases)
- Integration test with 1 task

**Dependencies:** Requires 6.1.2 → Blocks 6.1.7

**Reference:** [Story 6.1.6](../stories/aios migration/story-6.1.6-output-formatter-implementation.md)

---

### Story 6.1.7: Core Tasks Migration to V2.0 🆕
**Objective:** Migrate all 104 tasks to Task Format V2.0
**Status:** 📋 Ready to Start
**Duration:** 12 days (3 phases)
**Investment:** $1,200

**Phases:**
- **Phase 1:** Core Critical Tasks (15 tasks, 3 days, $300)
- **Phase 2:** Agent-Specific Tasks (50 tasks, 5 days, $500)
- **Phase 3:** Utility & Support Tasks (39 tasks, 4 days, $400)

**Key Changes:**
- Add Execution Modes (YOLO/Interactive/Pre-Flight)
- Restructure Checklists (pre/post/acceptance)
- Add Tools vs Scripts distinction
- Add Error Handling strategies
- Add Performance Metrics
- Integrate output-formatter.js

**Dependencies:** Requires 6.1.6 → Blocks 6.1.8, 6.1.11

**Reference:** [Story 6.1.7](../stories/aios migration/story-6.1.7-core-tasks-migration.md)

---

### Story 6.1.8: Templates Migration 🆕
**Objective:** Update 15+ templates with personality injection slots
**Status:** 📋 Ready to Start
**Duration:** 2 days
**Investment:** $200

**Templates to Update:**
- Story & Epic templates (story-tmpl.yaml, prd-tmpl.yaml, etc.)
- Architecture templates (architecture-tmpl.yaml, fullstack-architecture-tmpl.yaml, etc.)
- Documentation templates (brainstorming-output-tmpl.yaml, etc.)
- Technical templates (qa-gate-tmpl.yaml, migration-plan-tmpl.yaml, etc.)

**Changes:** Add {agent.name}, {archetype}, {signature_closing} placeholders

**Dependencies:** Requires 6.1.7 → Blocks 6.1.9

**Reference:** [Story 6.1.8](../stories/aios migration/story-6.1.8-templates-migration.md)

---

### Story 6.1.9: Checklists Migration 🆕
**Objective:** Add agent-specific guidance to 10+ checklists
**Status:** 📋 Ready to Start
**Duration:** 2 days
**Investment:** $200

**Checklists to Update:**
- Story checklists (story-dod-checklist.md, dev-story-dod-checklist.md, etc.)
- Architecture checklists (architect-checklist.md, pm-checklist.md, etc.)
- Quality checklists (component-quality-checklist.md, pattern-audit-checklist.md, etc.)
- Database checklists (db-kiss-validation-checklist.md, migration-validation-checklist.md, etc.)

**Changes:** Add Agent-Specific Guidance, Personalized Failure Protocols, Archetype-based Recommendations

**Dependencies:** Requires 6.1.8 → Blocks 6.1.10

**Reference:** [Story 6.1.9](../stories/aios migration/story-6.1.9-checklists-migration.md)

---

### Story 6.1.10: Dependencies & Data Files Migration 🆕
**Objective:** Create archetype-vocabulary.yaml and validate all data files
**Status:** 📋 Ready to Start
**Duration:** 1 day
**Investment:** $100

**Key Deliverables:**
- `.aios-core/data/archetype-vocabulary.yaml` - Complete vocabulary for 11 archetypes
- Data file validation report
- Cross-reference updates in tasks/agents/checklists

**Archetype Vocabulary:** 5-10 PT-BR verbs per archetype with avoid_words, emoji_palette, emotional_signature

**Dependencies:** Requires 6.1.9 → Blocks 6.1.11

**Reference:** [Story 6.1.10](../stories/aios migration/story-6.1.10-dependencies-migration.md)

---

### Story 6.1.11: AIOS-Master Meta-Agent Tasks ⭐ 🆕
**Objective:** Create meta-level tasks for aios-master to manage AIOS architecture
**Status:** 📋 Ready to Start
**Duration:** 3 days
**Investment:** $300

**4 Critical Tasks:**
1. **explain-architecture.md** - Explain 3-layer system to users/developers
2. **create-new-agent.md** - Create new agents with persona system
3. **modify-existing-agent.md** - Safely modify existing agents
4. **audit-system-consistency.md** - Audit system-wide compliance

**Why Critical:** Story 6.1.3 (@docs agent creation) will use create-new-agent task

**Dependencies:** Requires 6.1.10, 6.1.7, 6.1.2 → Blocks 6.1.3

**Reference:** [Story 6.1.11](../stories/aios migration/story-6.1.11-aios-master-tasks.md)

---

### Story 6.1.3: Create @docs Agent (Ajax)
**Objective:** Implement @docs agent using aios-master's create-new-agent task
**Status:** 📋 Ready to Start
**Duration:** 3 weeks
**Investment:** $2,000

**Implementation Phases:**
- **Week 1:** Agent Build ($1,000) - 6 tasks, 5 templates
- **Week 2:** Wave 4 Preparation ($700) - Partner training docs
- **Week 3:** Integration & Automation ($300) - Git hooks, CI/CD

**Dependencies:** Requires 6.1.1, 6.1.11 → Blocks Epic 14 (Partner Onboarding)

**Reference:** [Story 6.1.3](../stories/aios migration/story-6.1.3.md)

---

### Story 6.1.4: Configuration System
**Objective:** Implement 3-level personification system with user configuration
**Status:** 📋 Ready to Start
**Duration:** 2 days
**Investment:** $200

**Implementation:**
- Update `core-config.yaml` with `agentIdentity` section
- Create configuration setter/getter logic
- Implement greeting logic for 3 levels
- CLI commands: `aios config set/get agentIdentity.level`

**Dependencies:** Requires 6.1.2 (agents need persona_profile)

---

### Story 6.1.5: Testing & Validation
**Objective:** Comprehensive testing of agent identity system
**Status:** 📋 Ready to Start
**Duration:** 2 days
**Investment:** $200

**Tests:**
- Unit Tests (persona validation, greeting logic)
- Integration Tests (agent activation)
- User Acceptance Tests (20 beta users)
- Localization Compatibility
- Backward Compatibility

**Dependencies:** Requires all previous stories complete

---

## 📈 Success Metrics

### Launch Criteria (Q1 2026, Week 2)
- ✅ All 13 agents have complete personas
- ✅ 3 personification levels functional
- ✅ Configuration system working
- ✅ Beta testing: 20 users, 4.5/5 stars
- ✅ Zero breaking changes (agent IDs unchanged)

### Adoption Metrics (6 months post-launch)
- ✅ 80%+ users keep Level 2 (Named) as default
- ✅ 20%+ users opt-in to Level 3 (Archetypal)
- ✅ +30% task completion rate (measured via telemetry)
- ✅ User feedback: "Agents feel more helpful/personable"
- ✅ NPS increase of +10 points

---

## ⚠️ Risks & Mitigation

### Risk 1: Users don't like names, prefer role-only
- **Probability:** LOW (research shows +40% completion)
- **Impact:** MEDIUM (feature adoption low)
- **Mitigation:** Level 1 (Minimal) option available, user testing with 20 beta users

### Risk 2: Names feel gimmicky, not professional
- **Probability:** LOW (names are subtle, not over-the-top)
- **Impact:** MEDIUM (perception of AIOS as toy vs. tool)
- **Mitigation:** Gender-neutral, globally tested names; enterprise users can use Level 1

### Risk 3: Cultural issues (names don't translate well)
- **Probability:** LOW (gender-neutral, globally tested)
- **Impact:** MEDIUM (localization blockers)
- **Mitigation:** i18n compatibility built-in, PT-BR native speaker review in Wave 2

### Risk 4: Agent consolidation breaks workflows
- **Probability:** MEDIUM (some workflows may reference aios-developer directly)
- **Impact:** HIGH (user tasks fail)
- **Mitigation:** Redirect `aios-developer` → `aios-master`, deprecation notice, test all existing workflows

---

## 🔗 Related Resources

### Parent Epic
- [Epic Master: AIOS 2.0](epic-master-aios-2.0.md)

### Decision Documents
- [Decision #2: Agent Identity System](../one-pagers/DECISION-2-AGENT-IDENTITY-SYSTEM.md)

### Research Evidence
- **+40% task completion rate** (32 UX studies, industry research)
- **+20% advice compliance** (personality psychology research)
- **+23% engagement** (archetypal branding case studies)

### Dependencies
- **Upstream:** None (can start immediately)
- **Downstream:** Epic 8 (PT-BR Display Layer) depends on agent names defined here
- **External:** Beta testing group (20 users), UX design review

---

## 📝 Notes

### Agent Consolidation Decision (Jan 14, 2026)
- **Merge:** `aios-developer` + `aios-orchestrator` → `aios-master` (Orion)
- **Rationale:** Reduces cognitive load, simplifies meta-agent model, aligns with 13-agent target

### File Renaming Decisions
- `db-sage.md` → `data-engineer.md` (create alias `@data-engineer` → maintains backward compatibility)
- `github-devops.md` → `devops.md` (create alias `@devops` → maintains backward compatibility)

### Agent Creation Decisions (Jan 14, 2025)

**@security (Apex) - CANCELLED:**
- **Rationale:** Roundtable analysis (Brad Frost, Marty Cagan, Paul Graham, Pedro Valério) determined agent was premature optimization
- **Alternative:** Implement `security-level` module as cross-cutting concern (64% cost reduction)
- **Decision Document:** `docs/decisions/security-agent-vs-security-module-decision.md`
- **Implementation:** Wave 2 (adiar para Q2 2026)

**@docs (Ajax) - APPROVED:**
- **Rationale:** Solves validated user pain (2-4 hrs/week on docs), Wave 4 dependency (partner training), +$83K ROI
- **Approach:** Technical specification first (completed), user validation after
- **Specification:** `docs/specifications/docs-agent-technical-specification.md` (2,160 lines)
- **Decision Document:** `docs/decisions/docs-agent-creation-decision.md`
- **Implementation:** Phase 1-3 (3 weeks, $2K budget)

### Design Principles
- **Gender-neutral:** All names work globally (Dex, Quinn, Pax, etc.)
- **6-color palette:** Cyan, Green, Yellow, Red, Gray, Magenta (accessibility-tested)
- **Progressive enhancement:** Level 1 → Level 2 → Level 3 (user choice)
- **Zero breaking changes:** Agent IDs (`@dev`, `@qa`) UNCHANGED

---

**Last Updated:** 2025-01-14
**Next Review:** 2025-01-21
**Owner:** Dev (Dex) + UX Design Expert (Uma)
**Status:** 🟢 Ready to Start (Week 1-2, Q1 2026)
