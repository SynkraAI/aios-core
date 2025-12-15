# Story 12.5: CI/CD Migration to aios/aios-core

**Story ID:** 12.5
**Epic:** Epic-12 - Phase 3 - Open Core Repository
**Wave:** Wave 3 (Progressive Open Source)
**Status:** 📋 Ready to Start
**Priority:** 🔴 Critical
**Owner:** DevOps (Gage)
**Created:** 2025-01-14
**Duration:** 1 week
**Investment:** $3,750

---

## 📋 Objective

Copy 4 GitHub Actions workflows from aios-fullstack to aios/aios-core, update CodeRabbit configuration, and test all CI/CD workflows.

---

## 🎯 Scope

Migrate 4 GitHub Actions workflows: test suite, linting, doc generation, quality checks. Update workflow paths and references for new repository structure. Copy and update .coderabbit.yml configuration. Test all workflows with sample PRs. Verify automation functional.

---

## 📊 Tasks Breakdown

**Day 1-3: Workflow Migration (24 hours)** (24 hours)
Copy and update GitHub Actions workflows
- Copy 4 GitHub Actions workflows from aios-fullstack/.github/workflows/:
- - test.yml (test suite: npm test)
- - lint.yml (linting: npm run lint)
- - doc-generation.yml (docs: auto-generate on merge)
- - quality-check.yml (CodeRabbit + coverage checks)
- Update workflow paths and references:
- - Update working directory paths (aios-core/ → .)
- - Update artifact paths
- - Update cache keys (include repository name)
- - Update branch names (if changed)
- Update workflow triggers:
- - Verify pull_request triggers
- - Verify push triggers (main branch)
- - Add workflow_dispatch for manual runs
- Test each workflow:
- - Trigger workflow manually (workflow_dispatch)
- - Verify workflow completes successfully
- - Fix any path or dependency issues

**Day 4-5: CodeRabbit + Integration Testing (16 hours)** (16 hours)
Update CodeRabbit config and test all workflows
- Copy .coderabbit.yml from aios-fullstack to aios/aios-core
- Update CodeRabbit configuration if needed:
- - Verify profile setting (chill)
- - Update ignore patterns for new structure
- - Test on sample PR
- Enable CodeRabbit GitHub App for aios/aios-core repository
- Integration testing:
- - Create test PR (minor change)
- - Verify all 4 workflows run automatically
- - Verify CodeRabbit comments on PR
- - Verify test suite passes
- - Verify linting passes
- - Verify doc generation works
- - Verify quality checks pass
- Fix any workflow issues discovered during testing
- Document workflow dependencies and configuration

---

## ✅ Acceptance Criteria

### Must Have
- [ ] 4 GitHub Actions workflows copied to aios/aios-core
- [ ] All workflow paths and references updated for new repository
- [ ] CodeRabbit configuration copied and updated
- [ ] CodeRabbit GitHub App enabled for aios/aios-core
- [ ] All workflows tested and passing
- [ ] Test PR validates all 4 workflows + CodeRabbit
- [ ] Workflow documentation updated

### Should Have
- [ ] Workflow badges added to README
- [ ] Manual workflow triggers (workflow_dispatch)
- [ ] Workflow failure notifications configured


### Nice to Have
- [ ] Workflow performance optimization
- [ ] Automated workflow testing on PR


---

## 🔗 Dependencies

### Prerequisites (Blocking)
- **Story 12.4: Archive + Deprecation

### Dependent Stories (This Blocks)
- **Epic 13: Phase 4 - Scale to 100 Partners

---

## 📁 Files Modified

### New Files Created
- `aios/aios-core/.github/workflows/test.yml`
- `aios/aios-core/.github/workflows/lint.yml`
- `aios/aios-core/.github/workflows/doc-generation.yml`
- `aios/aios-core/.github/workflows/quality-check.yml`

### Files Modified
- `aios/aios-core/.coderabbit.yml`
- `aios/aios-core/README.md`


### Files Referenced (No Changes)
- None


---

## 🎨 Deliverables

### Migrated CI/CD Workflows
**Location:** `aios/aios-core/.github/workflows/`

4 GitHub Actions workflows tested and functional in new repository.

### CodeRabbit Integration
**Location:** `aios/aios-core/.coderabbit.yml`

CodeRabbit configured and tested on new repository.

---

## 💰 Investment Breakdown

- Days 1-3 (Workflow Migration): $2,250
- Days 4-5 (CodeRabbit + Testing): $1,500
- Total: $3,750

---

## 🎯 Success Metrics

- **Workflows Migrated:** All 4 workflows copied and updated
- **Workflows Passing:** 100% workflows passing on test PR
- **CodeRabbit Functional:** Automatic review on test PR
- **Integration Testing:** All automation validated

---

## ⚠️ Risks & Mitigation

### Risk 1: Workflow failures due to path changes
- **Likelihood:** Medium
- **Impact:** Medium
- **Mitigation:** Test each workflow individually, fix path issues, validate with test PR

### Risk 2: CodeRabbit configuration incompatible with new repo
- **Likelihood:** Low
- **Impact:** Low
- **Mitigation:** Test on sample PR, adjust configuration if needed, fallback to default settings

---

## 📝 Notes

Completes Epic 12 (Phase 3 - Open Core Repository). All automation migrated and tested. KILL SWITCH evaluation: If <500 stars OR <50 community packs → stay Phase 2, iterate. If GO → proceed to Epic 13 (Phase 4 - Scale).

---

## 🔗 Related Documents

- **Epic:** [Epic-12](../epics/epic-12.md)

---

**Last Updated:** 2025-01-14
**Previous Story:** N/A
**Next Story:** N/A
**Next Review:** After completion
