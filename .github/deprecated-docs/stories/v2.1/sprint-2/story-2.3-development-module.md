# STORY: Development Module Creation

**ID:** 2.3 | **Épico:** [EPIC-S2](../../../epics/epic-s2-modular-architecture.md)
**Sprint:** 2 | **Points:** 8 | **Priority:** 🔴 Critical | **Created:** 2025-01-19
**Updated:** 2025-11-29
**Status:** ✅ Complete

**Reference:** [ADR-002 Migration Map](../../architecture/decisions/ADR-002-migration-map.md)
**Quality Gate:** [2.3-development-module.yml](../../qa/gates/2.3-development-module.yml)

---

## 📊 User Story

**Como** developer, **Quero** module `development/`, **Para** acessar agents, tasks, workflows

---

## ✅ Acceptance Criteria

- [x] Directory structure created matching ADR-002
- [x] 167+ files migrated to correct locations (11 agents + 5 teams + 115 tasks + 7 workflows + 24 scripts)
- [x] All imports updated (relative paths)
- [x] All 11 agent activations work (`@dev`, `@qa`, `@architect`, `@pm`, `@po`, `@sm`, `@analyst`, `@devops`, `@data-engineer`, `@ux-expert`, `@aios-master`)
- [x] Task execution works (sample: `*create-story`, `*validate-story`)
- [x] Workflow navigation works
- [x] Deprecated agent files cleaned up (6 files: db-sage, github-devops, aios-developer, aios-orchestrator, test-agent, _README)
- [x] All P0 smoke tests pass (DEV-01, DEV-02, DEV-03, DEV-04, DEV-05, DEV-07)
- [x] All P1 smoke tests pass (DEV-06, DEV-08, DEV-09)

---

## 🔧 Scope (per ADR-002)

```
.aios-core/development/
├── agents/                     # 11 agent definitions (core agents only)
│   ├── aios-master.md          # Framework orchestrator
│   ├── analyst.md              # Business analyst
│   ├── architect.md            # Technical architect
│   ├── data-engineer.md        # Data engineering
│   ├── dev.md                  # Developer
│   ├── devops.md               # DevOps engineer
│   ├── pm.md                   # Project manager
│   ├── po.md                   # Product owner
│   ├── qa.md                   # Quality assurance
│   ├── sm.md                   # Scrum master
│   └── ux-design-expert.md     # UX designer
├── agent-teams/                # 5 team configurations
│   ├── team-all.yaml
│   ├── team-fullstack.yaml
│   ├── team-ide-minimal.yaml
│   ├── team-no-ui.yaml
│   └── team-qa-focused.yaml
├── tasks/                      # 120+ task definitions
│   └── ... (all from tasks/)
├── workflows/                  # 7 workflow definitions
│   ├── brownfield-fullstack.yaml
│   ├── brownfield-service.yaml
│   ├── brownfield-ui.yaml
│   ├── greenfield-fullstack.yaml
│   ├── greenfield-service.yaml
│   ├── greenfield-ui.yaml
│   └── README.md
└── scripts/                    # 24 agent-related scripts (per ADR-002)
    ├── agent-assignment-resolver.js
    ├── agent-config-loader.js
    ├── agent-exit-hooks.js
    ├── audit-agent-config.js
    ├── batch-update-agents-session-context.js
    ├── generate-greeting.js
    ├── greeting-builder.js
    ├── greeting-config-cli.js
    ├── greeting-preference-manager.js
    ├── test-greeting-system.js
    ├── apply-inline-greeting-all-agents.js
    ├── story-manager.js
    ├── story-update-hook.js
    ├── story-index-generator.js
    ├── backlog-manager.js
    ├── dev-context-loader.js
    ├── decision-context.js
    ├── decision-log-generator.js
    ├── decision-log-indexer.js
    ├── decision-recorder.js
    ├── task-identifier-resolver.js
    ├── migrate-task-to-v2.js
    ├── validate-task-v2.js
    └── workflow-navigator.js
```

**Note:** Deprecated agents (db-sage, github-devops, aios-developer, aios-orchestrator, test-agent) were merged into the 11 core agents and should NOT be migrated.

---

## 📋 Tasks

- [x] 2.3.1: Create directory structure (0.5h)
- [x] 2.3.2: Migrate agents/ (11 files) + cleanup deprecated (1.5h)
- [x] 2.3.3: Migrate agent-teams/ (5 files) (0.5h)
- [x] 2.3.4: Migrate tasks/ (115 files) (3h)
- [x] 2.3.5: Migrate workflows/ (7 files) (0.5h)
- [x] 2.3.6: Migrate scripts/ (24 files per ADR-002) (2h)
- [x] 2.3.7: Update all imports referencing moved files (3h)
- [x] 2.3.8: Test agent activation for all 11 agents (1.5h)
- [x] 2.3.9: Run validation scripts (1h)
- [x] 2.3.10: Run regression tests DEV-01 to DEV-09 (2h)
- [x] 2.3.11: Create development/README.md (0.5h)

**Total:** 16h (previously 19h - adjusted for correct file counts)

---

## ⚠️ Dependency Violations to Fix

From [ADR-002-dependency-matrix.md](../../architecture/decisions/ADR-002-dependency-matrix.md):

| Violation | Current | Solution |
|-----------|---------|----------|
| `agent-config-loader.js` → `performance-tracker.js` | dev → infra | Use try-catch with graceful fallback: `try { require('../../infrastructure/scripts/performance-tracker') } catch { /* no-op */ }` |
| `greeting-builder.js` → `git-config-detector.js` | dev → infra | Pass as optional config: `buildGreeting(agentDef, { gitDetector: require('...') })` |
| `greeting-builder.js` → `project-status-loader.js` | dev → infra | Pass as optional config: `buildGreeting(agentDef, { statusLoader: require('...') })` |

**Implementation Pattern:**
```javascript
// In greeting-builder.js
function buildGreeting(agentDef, options = {}) {
  const gitDetector = options.gitDetector || null;
  const statusLoader = options.statusLoader || null;

  // Use if available, graceful degradation if not
  const gitStatus = gitDetector ? gitDetector.detect() : null;
  const projectStatus = statusLoader ? statusLoader.load() : null;
  // ... rest of implementation
}
```

---

## 🔗 Dependencies

**Depends on:**
- [Story 2.1](./story-2.1-module-structure-design.md) ✅ Done
- [Story 2.2](./story-2.2-core-module.md) (core/ must exist first)

**Blocks:** Story 2.6 (Service Registry)

---

## 📋 Rollback Plan

Per [ADR-002-regression-tests.md](../../architecture/decisions/ADR-002-regression-tests.md):

| Condition | Action |
|-----------|--------|
| Any P0 test fails (DEV-01, DEV-02, DEV-03, DEV-04, DEV-05, DEV-07) | Immediate rollback |
| Agent activation broken | Immediate rollback |
| >20% P1 tests fail | Rollback and investigate |

```bash
git revert --no-commit HEAD~N  # N = number of commits to revert
```

---

## 📁 File List

**To Create:**
- `.aios-core/development/` directory structure
- `.aios-core/development/README.md` (module documentation)
- `.aios-core/development/agents/` (subdirectory)
- `.aios-core/development/agent-teams/` (subdirectory)
- `.aios-core/development/tasks/` (subdirectory)
- `.aios-core/development/workflows/` (subdirectory)
- `.aios-core/development/scripts/` (subdirectory)

**To Move (167+ files):**
- 11 agent files → `development/agents/`
- 5 team configs → `development/agent-teams/`
- 120+ task files → `development/tasks/`
- 7 workflow files → `development/workflows/`
- 24 script files → `development/scripts/`

**To Delete (cleanup deprecated):**
- `.aios-core/agents/db-sage.md`
- `.aios-core/agents/github-devops.md`
- `.aios-core/agents/aios-developer.md`
- `.aios-core/agents/aios-orchestrator.md`
- `.aios-core/agents/test-agent.md`
- `.aios-core/agents/_README.md`

---

## ✅ Definition of Done

- [x] All 167+ files migrated to `development/` module
- [x] All deprecated agent files deleted (6 files)
- [x] All imports updated to new paths
- [x] All P0 regression tests pass (DEV-01, DEV-02, DEV-03, DEV-04, DEV-05, DEV-07)
- [x] All P1 regression tests pass (DEV-06, DEV-08, DEV-09)
- [x] No circular dependencies introduced
- [x] development/README.md created and documents module structure
- [x] Story checkboxes updated to [x]
- [x] Quality gate file updated with PASS status
- [x] PR created and approved

---

**Criado por:** River 🌊
**Refinado por:** Pax 🎯 (PO) - 2025-11-29
**Validado por:** Pax 🎯 (PO) - 2025-11-29
