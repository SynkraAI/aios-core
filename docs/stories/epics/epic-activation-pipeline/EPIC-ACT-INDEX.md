# Epic: Unified Agent Activation Pipeline (ACT)

**Epic ID:** EPIC-ACT
**Status:** Draft
**Priority:** High
**Target:** Sprint 20+
**Effort Estimate:** 78-100 hours (across 10 stories)
**Source:** AIOS-TRACE-001 deep code analysis + AIOS-XREF-001 cross-reference findings

---

## Vision

Unify the agent activation pipeline so that ALL 12 agents activate through a single enriched path with real-time project context, enforced permission modes, intelligent workflow recognition, and adaptive greetings.

---

## Problem Statement

The current activation pipeline has **two divergent paths** (Path A for 9 agents, Path B for 3 agents) creating inconsistent context richness. Deep code analysis (AIOS-TRACE-001) across 14+ source files revealed **7 confirmed bugs/gaps**:

| # | Bug | Severity |
|---|-----|----------|
| 1 | `agentIdentity.greeting.preference` key missing from `core-config.yaml` | Medium |
| 2 | PermissionMode fully implemented but NOT connected to execution layer | High |
| 3 | Sequential context loading in `_buildContextualGreeting()` | Low |
| 4 | WorkflowNavigator effectively dead (wrong method + narrow conditions) | Medium |
| 5 | ProjectStatusLoader 60s cache always stale | Medium |
| 6 | Path A vs Path B inconsistent context richness | High |
| 7 | 7 critical data files missing from source-tree.md | Medium |
| 8 | Installer language selection not persisted or consumed by agents | High |

---

## Stories

| Story | Title | Priority | Complexity | Executor | Quality Gate | Status |
|-------|-------|----------|------------|----------|--------------|--------|
| ACT-1 | Fix GreetingPreferenceManager Configuration | Critical | Low | @dev | @architect | Draft |
| ACT-2 | Audit user_profile Impact Across Agents | High | Medium | @dev | @architect | Draft |
| ACT-3 | ProjectStatusLoader Reliability Overhaul | High | High | @dev | @architect | Draft |
| ACT-4 | PermissionMode Integration Fix | High | High | @dev | @architect | Draft |
| ACT-5 | WorkflowNavigator + Bob Integration | Medium | High | @dev | @architect | Draft |
| ACT-6 | Unified Activation Pipeline | High | Very High | @dev | @architect | Draft |
| ACT-7 | Context-Aware Greeting Sections | Medium | High | @dev | @architect | Draft |
| ACT-8 | Agent Config Loading + Document Governance | Medium | Medium | @dev | @architect | Draft |
| ACT-9 | Language Selection Propagation to Agents | High | Medium | @dev | @architect | Backlog |
| ACT-10 | Pipeline API Consistency & Activation Timeouts | High | Medium | @dev | @architect | Backlog |

### Story Files

| Story | File |
|-------|------|
| ACT-1 | [story-act-1-greeting-preference-fix.md](story-act-1-greeting-preference-fix.md) |
| ACT-2 | [story-act-2-user-profile-audit.md](story-act-2-user-profile-audit.md) |
| ACT-3 | [story-act-3-project-status-reliability.md](story-act-3-project-status-reliability.md) |
| ACT-4 | [story-act-4-permission-mode-integration.md](story-act-4-permission-mode-integration.md) |
| ACT-5 | [story-act-5-workflow-navigator-bob.md](story-act-5-workflow-navigator-bob.md) |
| ACT-6 | [story-act-6-unified-activation-pipeline.md](story-act-6-unified-activation-pipeline.md) |
| ACT-7 | [story-act-7-context-aware-greetings.md](story-act-7-context-aware-greetings.md) |
| ACT-8 | [story-act-8-config-governance.md](story-act-8-config-governance.md) |
| ACT-9 | [story-act-9-language-propagation.md](story-act-9-language-propagation.md) |
| ACT-10 | [story-act-10-pipeline-api-and-timeouts.md](story-act-10-pipeline-api-and-timeouts.md) |

---

## Orchestration

**Execution plan:** [EPIC-ACT-EXECUTION.yaml](EPIC-ACT-EXECUTION.yaml) (project-specific)
**Template:** `.aios-core/development/workflows/epic-orchestration.yaml` (reusable)
**Inner loop:** `.aios-core/development/workflows/development-cycle.yaml` (per story)

Each story within a wave runs the full `development-cycle`:
`@po validates → ${executor} develops → self-healing → ${quality_gate} reviews → @devops pushes → @po checkpoint`

## Implementation Waves (Parallel Execution)

### Wave 1: Foundation Fixes (ACT-1, ACT-2, ACT-3, ACT-4) - PARALLEL, no dependencies

4 stories execute simultaneously in isolated worktrees.

| Story | Branch | Complexity |
|-------|--------|------------|
| **ACT-1**: Greeting config fix | `feat/act-1-greeting-config` | Low |
| **ACT-2**: User profile audit | `feat/act-2-user-profile-audit` | Medium |
| **ACT-3**: Status loader reliability | `feat/act-3-status-loader-reliability` | High |
| **ACT-4**: Permission mode integration | `feat/act-4-permission-mode` | High |

### Gate 1: Quality Validation

@qa + @architect review all Wave 1 deliverables. @devops merges on approval.

### Wave 2: Unification (ACT-6) - SEQUENTIAL, depends on Wave 1

The core architectural change - merge Path A + Path B.

| Story | Branch | Complexity |
|-------|--------|------------|
| **ACT-6**: Unified Activation Pipeline | `feat/act-6-unified-pipeline` | Very High |

### Gate 2: Pipeline Validation

@qa tests all 12 agents through unified path. @architect validates architecture.

### Wave 3: Intelligence & Governance (ACT-5, ACT-7, ACT-8) - PARALLEL, depends on ACT-6

3 stories execute simultaneously in isolated worktrees.

| Story | Branch | Complexity |
|-------|--------|------------|
| **ACT-5**: WorkflowNavigator + Bob | `feat/act-5-workflow-navigator` | High |
| **ACT-7**: Context-aware greetings | `feat/act-7-context-greetings` | High |
| **ACT-8**: Config governance | `feat/act-8-config-governance` | Medium |
| **ACT-9**: Language propagation | `feat/act-9-language-propagation` | Medium |

### Final Gate: Epic Validation & Retrospective

@qa verifies all 8 bugs fixed. @architect signs off. @po runs retrospective.

---

## Dependency Graph (Wave Execution)

```
┌─────────────────────────────────────────────────────────────────┐
│  WAVE 1 (Parallel)                                              │
│  ACT-1 ─────┐                                                   │
│  ACT-2 ─────┤                                                   │
│  ACT-3 ─────┼─→ [GATE 1: @qa + @architect] ─→ @devops merge    │
│  ACT-4 ─────┘                                                   │
└─────────────────────────────────────┬───────────────────────────┘
                                      │
┌─────────────────────────────────────▼───────────────────────────┐
│  WAVE 2 (Sequential)                                             │
│  ACT-6 ─────→ [GATE 2: @qa + @architect] ─→ @devops merge       │
└─────────────────────────────────────┬───────────────────────────┘
                                      │
┌─────────────────────────────────────▼───────────────────────────┐
│  WAVE 3 (Parallel)                                               │
│  ACT-5 ─────┐                                                    │
│  ACT-7 ─────┼─→ [FINAL GATE: @qa + @architect] ─→ @devops merge │
│  ACT-8 ─────┘                                                    │
└─────────────────────────────────────────────────────────────────┘
```

**Execution time: ~60% faster than sequential** (4 waves vs 8 sequential stories)

---

## Key Source Files

| File | Lines | Purpose |
|------|-------|---------|
| `.aios-core/development/scripts/greeting-builder.js` | 1030 | Core greeting system |
| `.aios-core/development/scripts/agent-config-loader.js` | 627 | Config loading per agent |
| `.aios-core/development/scripts/generate-greeting.js` | 173 | CLI wrapper (3 agents) |
| `.aios-core/development/scripts/greeting-preference-manager.js` | 146 | Preference system |
| `.aios-core/development/scripts/workflow-navigator.js` | 327 | Workflow detection |
| `.aios-core/infrastructure/scripts/project-status-loader.js` | 524 | Git status cache |
| `.aios-core/core/permissions/permission-mode.js` | 270 | Permission modes |
| `.aios-core/core/permissions/operation-guard.js` | - | Permission enforcement |
| `.aios-core/core/session/context-detector.js` | 232 | Session type detection |
| `.aios-core/data/agent-config-requirements.yaml` | 369 | Per-agent config |
| `.aios-core/core-config.yaml` | 542 | Core configuration |

---

## Cross-References

| Related | Relationship |
|---------|-------------|
| [AIOS-TRACE-001](../../active/AIOS-TRACE-001.story.md) | Source investigation - 14 execution trace documents |
| [AIOS-XREF-001](../../active/AIOS-XREF-001.story.md) | Cross-reference analysis (881 artifacts) |
| Epic 11 (Projeto Bob) | Workflow orchestration - ACT-5 depends on Stories 11.4, 11.5 |
| Backlog 1738700000008 | Wire permissions system (XREF finding) - subsumed by ACT-4 |

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Unified pipeline breaks existing activation | High | Backward-compatible API, fallback to static greeting |
| Performance regression from enriched context | Medium | Parallel loading, 150ms/200ms timeouts |
| Bob system not yet complete (Epic 11) | Medium | ACT-5 can be phased; basic fix first |
| PermissionMode enforcement too aggressive | Medium | Default `ask` mode, `*yolo` available |
| Multi-terminal cache race conditions | Low | File locking, atomic writes |

---

## Scale

| Metric | Count |
|--------|-------|
| Stories | 10 |
| Bugs to fix | 8 |
| Files to create | ~5 new |
| Files to modify | 30+ |
| Agents impacted | All 12 |
| Test files to create | ~8-10 |

---

*Created 2026-02-05 by @po (Pax) | Based on AIOS-TRACE-001 investigation*
