# Story 6.1.7: Core Tasks Migration to V2.0

**Story ID:** STORY-6.1.7
**Epic:** Epic-6.1 - Agent Identity System
**Wave:** Wave 1 (Foundation)
**Status:** 📋 Ready to Start
**Priority:** 🔴 Critical
**Owner:** Dev (Dex) + All Agents
**Created:** 2025-01-14
**Duration:** 12 days
**Investment:** $1,200

---

## 📋 Objective

Migrate all 104 task files from legacy format to Task Format V2.0 with Execution Modes, restructured checklists, error handling, and output-formatter integration.

---

## 🎯 Scope

Update 104 tasks in `.aios-core/tasks/` to use:
- Execution Modes (YOLO/Interactive/Pre-Flight)
- Restructured Checklists (pre/post/acceptance)
- Tools vs Scripts distinction
- Error Handling explicit plans
- Performance Metrics
- output-formatter.js integration

---

## 📊 Tasks Breakdown

### Phase 1: Core Critical Tasks (3 days, $300)

**15 most-used tasks** - High impact, used by multiple agents

**Day 1-2: Primary Development Tasks** (16 hours)
- [ ] develop-story.md (dev agent's main task)
- [ ] create-story.md (po/sm main task)
- [ ] create-epic.md (pm main task)
- [ ] brownfield-create-story.md (po brownfield workflow)
- [ ] brownfield-create-epic.md (pm brownfield workflow)
- [ ] create-agent.md (aios-developer, future aios-master)
- [ ] modify-agent.md (aios-developer, future aios-master)
- [ ] create-task.md (aios-developer)

**Day 3: QA & Validation Tasks** (8 hours)
- [ ] qa-gate.md (qa main validation)
- [ ] test-design.md (qa test planning)
- [ ] validate-next-story.md (dev validation)
- [ ] execute-checklist.md (all agents)
- [ ] correct-course.md (pm/po course correction)
- [ ] create-doc.md (pm documentation)
- [ ] shard-doc.md (pm documentation breakdown)

**Changes per task:**
1. Add **Execution Modes** section (YOLO/Interactive/Pre-Flight)
2. Restructure **Checklist** → pre-conditions/post-conditions/acceptance-criteria
3. Add **Tools** section (external/shared resources)
4. Add **Scripts** section (agent-specific code)
5. Add **Error Handling** explicit strategies
6. Add **Performance Metrics** expected values
7. Update **Output** section to use output-formatter.js
8. Add **Metadata** section (story, version, dependencies)

---

### Phase 2: Agent-Specific Tasks (5 days, $500)

**50 tasks** - Agent-specific workflows

**Day 4-5: Dev Agent Tasks** (16 hours)
- [ ] develop-story.md (if not in Phase 1)
- [ ] refactor-code.md
- [ ] optimize-performance.md
- [ ] improve-code-quality.md
- [ ] suggest-refactoring.md
- [ ] apply-qa-fixes.md
- [ ] generate-commit-message.md
- [ ] validate-next-story.md (if not in Phase 1)

**Day 6: QA Agent Tasks** (8 hours)
- [ ] qa-gate.md (if not in Phase 1)
- [ ] test-design.md (if not in Phase 1)
- [ ] generate-tests.md
- [ ] nfr-assess.md
- [ ] risk-profile.md
- [ ] trace-requirements.md
- [ ] review-proposal.md

**Day 7: PO/PM/SM Agent Tasks** (8 hours)
- [ ] create-story.md (if not in Phase 1)
- [ ] create-epic.md (if not in Phase 1)
- [ ] pull-story-from-clickup.md
- [ ] sync-story-to-clickup.md
- [ ] create-next-story.md
- [ ] brownfield-create-story.md (if not in Phase 1)
- [ ] brownfield-create-epic.md (if not in Phase 1)
- [ ] correct-course.md (if not in Phase 1)

**Day 8: Architect/Analyst Tasks** (8 hours)
- [ ] analyze-framework.md
- [ ] analyze-impact.md
- [ ] design-architecture.md
- [ ] facilitate-brainstorming-session.md
- [ ] advanced-elicitation.md
- [ ] create-deep-research-prompt.md

**Day 9: UX/Data/DevOps Tasks** (8 hours)
- [ ] ux-create-wireframe.md
- [ ] ux-ds-scan-artifact.md
- [ ] ux-user-research.md
- [ ] db-apply-migration.md
- [ ] db-bootstrap.md
- [ ] db-dry-run.md
- [ ] db-env-check.md
- [ ] db-snapshot.md
- [ ] github-pr-automation.md
- [ ] pre-push-quality-gate.md
- [ ] version-management.md
- [ ] repository-cleanup.md

---

### Phase 3: Utility & Support Tasks (4 days, $400)

**39 tasks** - Utilities, audits, documentation, sync

**Day 10: Audit & Cleanup Tasks** (8 hours)
- [ ] audit-codebase.md
- [ ] audit-tailwind-config.md
- [ ] audit-utilities.md
- [ ] cleanup-utilities.md
- [ ] deprecate-component.md
- [ ] safe-removal-handler.md
- [ ] redundancy-analyzer.md
- [ ] consolidate-patterns.md

**Day 11: Documentation & Sync Tasks** (8 hours)
- [ ] create-doc.md (if not in Phase 1)
- [ ] shard-doc.md (if not in Phase 1)
- [ ] document-project.md
- [ ] generate-documentation.md
- [ ] sync-documentation.md
- [ ] index-docs.md
- [ ] sync-story.md
- [ ] sync-story-to-clickup.md (if not in Phase 2)
- [ ] pull-story.md

**Day 12: Validation & Support Tasks** (8 hours)
- [ ] validate-next-story.md (if not done)
- [ ] execute-checklist.md (if not in Phase 1)
- [ ] security-scan.md
- [ ] improve-self.md
- [ ] kb-mode-interaction.md
- [ ] undo-last.md
- [ ] update-manifest.md
- [ ] propose-modification.md
- [ ] modify-task.md
- [ ] modify-workflow.md

---

## ✅ Acceptance Criteria

### Must Have
- [ ] All 104 tasks migrated to V2.0 format
- [ ] All tasks have Execution Modes section
- [ ] All tasks have restructured checklists (pre/post/acceptance)
- [ ] All tasks integrate with output-formatter.js
- [ ] All tasks have error handling strategies
- [ ] All tasks have performance metrics
- [ ] Tools vs Scripts distinction clear in all tasks
- [ ] 100% backward compatibility maintained
- [ ] All tasks tested and validated

### Should Have
- [ ] Migration script to automate format updates
- [ ] Validation script to check V2.0 compliance
- [ ] Documentation of migration patterns
- [ ] Rollback strategy documented

### Nice to Have
- [ ] AI-assisted migration for remaining tasks
- [ ] Automated testing of all 104 tasks
- [ ] Performance comparison before/after migration

---

## 🔗 Dependencies

### Prerequisites (Blocking)
- **Story 6.1.6:** Output Formatter Implementation (tasks need formatter)

### Dependent Stories (This Blocks)
- **Story 6.1.8:** Templates Migration (templates depend on task format)
- **Story 6.1.11:** AIOS-Master Tasks (aios-master needs v2.0 tasks)

---

## 📁 Files Modified

### Files Modified (104 tasks)
- `.aios-core/tasks/*.md` (all 104 task files)

### Files Referenced
- `.aios-core/scripts/output-formatter.js` (output generation)
- `.aios-core/templates/task-execution-report.md` (output template)
- `.aios-core/agents/*.md` (agent persona profiles)

---

## 🎨 Deliverables

### 1. Migrated Tasks (104 files)
**Location:** `.aios-core/tasks/*.md`

All tasks updated to V2.0 format with:
- Execution Modes
- Restructured checklists
- Error handling
- Performance metrics
- output-formatter integration

### 2. Migration Documentation
**Location:** `docs/guides/task-migration-v2.0-guide.md`

Guide documenting:
- Migration patterns
- Common changes
- Troubleshooting
- Rollback procedures

### 3. Validation Scripts
**Location:** `.aios-core/scripts/validate-task-v2.js`

Script to validate task compliance with V2.0 format.

---

## 💰 Investment Breakdown

- Phase 1 (Core Tasks): 3 days @ $100/day = $300
- Phase 2 (Agent Tasks): 5 days @ $100/day = $500
- Phase 3 (Utility Tasks): 4 days @ $100/day = $400
- **Total:** 12 days = $1,200

---

## 🎯 Success Metrics

- **Migration Completion:** 104/104 tasks migrated (100%)
- **Format Compliance:** 100% tasks pass validation script
- **Backward Compatibility:** 100% existing workflows pass
- **Test Coverage:** ≥80% for updated task execution logic

---

## ⚠️ Risks & Mitigation

### Risk 1: Breaking changes in task format break workflows
- **Likelihood:** Medium
- **Impact:** High
- **Mitigation:** Phase 1 validates core tasks first, rollback strategy ready, comprehensive testing

### Risk 2: Migration takes longer than 12 days
- **Likelihood:** Medium
- **Impact:** Medium
- **Mitigation:** Phased approach allows scope adjustment, automation scripts speed up migration

### Risk 3: Output formatter integration bugs
- **Likelihood:** Low
- **Impact:** Medium
- **Mitigation:** Story 6.1.6 validates formatter first, unit tests catch issues early

---

## 📝 Notes

**Migration Template:**

```yaml
# OLD FORMAT (V1.0)
task: taskName()
responsável: Agent Name

**Checklist:**
- [ ] Generic validation item

# NEW FORMAT (V2.0)
task: taskName()
responsável: Agent Name
responsavel_type: Agente
atomic_layer: Layer

**Execution Modes:** YOLO/Interactive/Pre-Flight

pre-conditions:
  - [ ] Specific pre-condition
    blocker: true

post-conditions:
  - [ ] Specific post-condition
    blocker: true
    rollback: true

acceptance-criteria:
  - [ ] Story requirement
    story: STORY-XXX

**Tools:**
- tool-name: shared, reusable

**Scripts:**
- script-path: agent-specific

**Error Handling:**
- strategy: retry|fallback|abort

**Performance:**
- duration_expected: Xms
- cost_estimated: $Y
```

---

## 🔗 Related Documents

- **Epic:** [Epic 6.1 - Agent Identity System](../epics/epic-6.1-agent-identity-system.md)
- **Standard:** [Task Format Specification V1.0](../../standards/TASK-FORMAT-SPECIFICATION-V1.md)
- **Template:** [Personalized Task Template V2.0](../../.aios-core/templates/personalized-task-template-v2.md)

---

**Last Updated:** 2025-01-14
**Previous Story:** [Story 6.1.6 - Output Formatter Implementation](story-6.1.6-output-formatter-implementation.md)
**Next Story:** [Story 6.1.8 - Templates Migration](story-6.1.8-templates-migration.md)
**Next Review:** After Phase 1 completion (checkpoint), Final review after Phase 3
