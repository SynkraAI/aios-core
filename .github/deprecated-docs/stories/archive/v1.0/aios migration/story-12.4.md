# Story 12.4: Archive aios-fullstack + Deprecation Notice

**Story ID:** 12.4
**Epic:** Epic-12 - Phase 3 - Open Core Repository
**Wave:** Wave 3 (Progressive Open Source)
**Status:** 📋 Ready to Start
**Priority:** 🔴 Critical
**Owner:** DevOps (Gage) + Docs (Ajax)
**Created:** 2025-01-14
**Duration:** 1 week
**Investment:** $3,750

---

## 📋 Objective

Add deprecation notice to aios-fullstack repository README, archive repository on GitHub, and create comprehensive migration guide for users.

---

## 🎯 Scope

Update aios-fullstack README with deprecation notice and migration instructions. Archive repository on GitHub (read-only). Create detailed migration guide from aios-fullstack to @aios/core. Document breaking changes and update paths.

---

## 📊 Tasks Breakdown

**Day 1-3: Deprecation Notice + Migration Guide (24 hours)** (24 hours)
Create deprecation notice and migration documentation
- Update aios-fullstack README.md with deprecation notice:
- - Banner: '⚠️ DEPRECATED: This repository is archived. Use @aios/core instead.'
- - Link to new repository: aios/aios-core
- - Link to migration guide
- - Timeline: Deprecated as of [DATE], archive in 30 days
- Create docs/MIGRATION-FROM-FULLSTACK.md:
- - Section 1: Why migration? (Progressive Open Source, Commons Clause)
- - Section 2: Breaking changes (package name, imports, repository URL)
- - Section 3: Migration steps (step-by-step guide)
- - Section 4: Update commands (npm uninstall/install, git remote)
- - Section 5: Troubleshooting (common issues)
- Document breaking changes:
- - Package name: 'aios-fullstack' → '@aios/core'
- - Repository: Pedrovaleriolopez/aios-fullstack → aios/aios-core
- - Submodule removed (standalone repository now)
- - Import paths updated

**Day 4-5: Archive Repository (16 hours)** (16 hours)
Archive aios-fullstack repository on GitHub
- Prepare for archiving:
- - Commit deprecation notice
- - Tag final version: git tag v1.9.9-final
- - Push all changes and tags
- - Verify backup from Story 12.1 is complete
- Archive repository on GitHub:
- - Repository Settings → Archive this repository
- - Repository becomes read-only (no new PRs, issues, commits)
- - README deprecation notice visible to all visitors
- Update external references:
- - Update links in other repositories
- - Update documentation sites
- - Notify users via email/announcement (if mailing list exists)
- Create redirect notice:
- - GitHub automatically shows deprecation notice
- - Pin issue explaining migration
- Monitor community response and answer questions

---

## ✅ Acceptance Criteria

### Must Have
- [ ] Deprecation notice added to aios-fullstack README
- [ ] Migration guide created (docs/MIGRATION-FROM-FULLSTACK.md)
- [ ] Breaking changes documented clearly
- [ ] aios-fullstack repository archived on GitHub (read-only)
- [ ] Final version tagged (v1.9.9-final)
- [ ] External references updated (links to new repository)
- [ ] Community notified of deprecation and migration path

### Should Have
- [ ] Pinned GitHub issue explaining migration
- [ ] FAQ addressing common migration questions
- [ ] Email notification to users (if list exists)


### Nice to Have
- [ ] Automated migration script
- [ ] Video tutorial explaining migration


---

## 🔗 Dependencies

### Prerequisites (Blocking)
- **Story 12.3: Publish npm Package

### Dependent Stories (This Blocks)
- **Story 12.5: CI/CD Migration

---

## 📁 Files Modified

### New Files Created
- `aios-fullstack/docs/MIGRATION-FROM-FULLSTACK.md`

### Files Modified
- `aios-fullstack/README.md`


### Files Referenced (No Changes)
- None


---

## 🎨 Deliverables

### Deprecation Notice
**Location:** `aios-fullstack/README.md`

Clear deprecation banner with migration instructions.

### Migration Guide
**Location:** `aios-fullstack/docs/MIGRATION-FROM-FULLSTACK.md`

Comprehensive guide for migrating from aios-fullstack to @aios/core.

### Archived Repository
**Location:** `GitHub: Pedrovaleriolopez/aios-fullstack (archived)`

Repository archived (read-only) with deprecation notice visible.

---

## 💰 Investment Breakdown

- Days 1-3 (Deprecation + Migration Guide): $2,250
- Days 4-5 (Archive Repository): $1,500
- Total: $3,750

---

## 🎯 Success Metrics

- **Deprecation Notice:** Visible on aios-fullstack README
- **Migration Guide:** Complete guide with all breaking changes documented
- **Repository Archived:** aios-fullstack read-only on GitHub
- **Community Notification:** Users informed via pinned issue + announcement

---

## ⚠️ Risks & Mitigation

### Risk 1: User confusion about migration path
- **Likelihood:** High
- **Impact:** Medium
- **Mitigation:** Clear migration guide, pinned issue, active community support, FAQ

### Risk 2: Negative community reaction to deprecation
- **Likelihood:** Medium
- **Impact:** Medium
- **Mitigation:** Explain rationale (Progressive Open Source), highlight benefits (@aios/core), provide support

---

## 📝 Notes

BREAKING: aios-fullstack deprecated and archived. All users must migrate to @aios/core. 30-day notice period before archiving. Migration guide minimizes friction.

---

## 🔗 Related Documents

- **Epic:** [Epic-12](../epics/epic-12.md)

---

**Last Updated:** 2025-01-14
**Previous Story:** N/A
**Next Story:** N/A
**Next Review:** After completion
