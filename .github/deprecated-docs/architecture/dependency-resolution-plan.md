# Dependency Resolution Plan - Story 2.17

**Created:** 2025-12-01 | **Phase:** 1 Investigation | **Status:** Resolution Identified

---

## Executive Summary

After comprehensive audit of all 11 agent files and existing dependency files, the root cause of the 31 "missing dependencies" has been identified:

**Root Cause:** Naming mismatch - task files exist WITH agent prefixes but agent dependencies reference them WITHOUT prefixes.

**Solution:** Update agent dependency declarations to match actual file names (add prefixes).

---

## Investigation Findings

### Key Discovery

Files are not actually missing - they exist with agent-prefixed names:

| Agent Declares | Actual File Name | Action |
|----------------|------------------|--------|
| `develop-story.md` | `dev-develop-story.md` | Update agent |
| `manage-story-backlog.md` | `po-manage-story-backlog.md` | Update agent |
| `version-management.md` | `github-devops-version-management.md` | Update agent |
| `domain-modeling.md` | `db-domain-modeling.md` | Update agent |

### Existing Files Found (with prefixes)

#### Tasks (development/tasks/)
| Agent Reference | Actual File (EXISTS) |
|-----------------|---------------------|
| `develop-story.md` | `dev-develop-story.md` ✅ |
| `improve-code-quality.md` | `dev-improve-code-quality.md` ✅ |
| `optimize-performance.md` | `dev-optimize-performance.md` ✅ |
| `suggest-refactoring.md` | `dev-suggest-refactoring.md` ✅ |
| `manage-story-backlog.md` | `po-manage-story-backlog.md` ✅ |
| `pull-story.md` | `po-pull-story.md` ✅ |
| `sync-story.md` | `po-sync-story.md` ✅ |
| `sync-story-to-clickup.md` | `po-sync-story-to-clickup.md` ✅ |
| `pull-story-from-clickup.md` | `po-pull-story-from-clickup.md` ✅ |
| `version-management.md` | `github-devops-version-management.md` ✅ |
| `pre-push-quality-gate.md` | `github-devops-pre-push-quality-gate.md` ✅ |
| `github-pr-automation.md` | `github-devops-github-pr-automation.md` ✅ |
| `repository-cleanup.md` | `github-devops-repository-cleanup.md` ✅ |
| `domain-modeling.md` | `db-domain-modeling.md` ✅ |
| `analyze-impact.md` | `architect-analyze-impact.md` ✅ |

---

## Resolution Strategy

### Option Selected: Update Agent Dependency Declarations

**Rationale:**
1. Files already exist with consistent naming convention (agent-prefix)
2. Less risk than renaming 15+ files
3. Maintains organized namespace (dev-, po-, db-, github-devops-)
4. Single point of change (agent files only)

### Implementation Plan

#### Phase 2A: Update Agent Task Dependencies

| Agent | Dependencies to Update |
|-------|----------------------|
| `dev.md` | Add `dev-` prefix to 5 task references |
| `po.md` | Add `po-` prefix to 5 task references |
| `devops.md` | Add `github-devops-` prefix to 4 task references |
| `data-engineer.md` | Add `db-` prefix to 1 task reference |
| `architect.md` | Add `architect-` prefix to 1 task reference |

#### Phase 2B: Create Truly Missing Files

After prefix update, the following are confirmed as truly missing (no existing file with any name):

**Checklists (product/checklists/) - 5 files:**
- `dba-predeploy-checklist.md` - data-engineer
- `dba-rollback-checklist.md` - data-engineer
- `database-design-checklist.md` - data-engineer
- `pre-push-checklist.md` - devops
- `release-checklist.md` - devops

**Templates (product/templates/) - 10 files:**
- `tmpl-migration-script.sql` - data-engineer
- `tmpl-rollback-script.sql` - data-engineer
- `tmpl-rls-granular-policies.sql` - data-engineer
- `tmpl-rls-roles.sql` - data-engineer
- `tmpl-rls-simple.sql` - data-engineer
- `tmpl-rls-tenant.sql` - data-engineer
- `tmpl-stored-proc.sql` - data-engineer
- `tmpl-trigger.sql` - data-engineer
- `tmpl-view-materialized.sql` - data-engineer
- `tmpl-view.sql` - data-engineer

---

## Execution Order

1. **Update dev.md** - Change task references to use `dev-` prefix
2. **Update po.md** - Change task references to use `po-` prefix
3. **Update devops.md** - Change task references to use `github-devops-` prefix
4. **Update data-engineer.md** - Change task references to use `db-` prefix
5. **Update architect.md** - Change task references to use `architect-` prefix
6. **Create 5 checklist files** in product/checklists/
7. **Create 10 template files** in product/templates/
8. **Run validation tests** - Verify 0 missing dependencies

---

## File Changes Summary

### Agent Files to Modify (5)
- `.aios-core/development/agents/dev.md`
- `.aios-core/development/agents/po.md`
- `.aios-core/development/agents/devops.md`
- `.aios-core/development/agents/data-engineer.md`
- `.aios-core/development/agents/architect.md`

### Files to Create (15)
- 5 checklists
- 10 SQL templates

### Files NOT Needed (16 tasks)
The 16 "missing task" files actually exist with agent prefixes - no creation needed.

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Agent command paths break | IDE-FILE-RESOLUTION header already supports this pattern |
| Backward compatibility | Old references can be kept as comments for migration |

---

**Prepared by:** @architect (Aria) + @data-engineer (Dara)
**Execution by:** @dev (Dex)
