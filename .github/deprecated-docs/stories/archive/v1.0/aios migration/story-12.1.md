# Story 12.1: Backup + Git Subtree Split

**Story ID:** 12.1
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

Create full backup of aios-fullstack submodule and use git subtree split to extract aios-core/ with complete git history preserved.

---

## 🎯 Scope

Full backup of aios-fullstack repository (all branches, tags, history). Execute git subtree split -P aios-core -b aios-core-split to extract aios-core/ into separate branch with full git history. Validate history preservation and prepare for new repository creation.

---

## 📊 Tasks Breakdown

**Day 1-2: Full Backup (16 hours)** (16 hours)
Create comprehensive backup of aios-fullstack
- Create backup directory: backups/aios-fullstack-pre-core-split/
- Full repository backup:
- - git clone --mirror (all branches, tags, history)
- - Copy to external backup location
- - Verify backup integrity (git fsck)
- Document current state:
- - List all branches and tags
- - Record current commit SHAs
- - Export issue/PR data from GitHub
- - Document submodule commit references
- Create backup verification script:
- - Verify all branches present
- - Verify all tags present
- - Verify history completeness
- Test backup restoration (dry run)

**Day 3-5: Git Subtree Split (24 hours)** (24 hours)
Extract aios-core/ with git history using subtree split
- Navigate to aios-fullstack submodule
- Execute git subtree split:
- - git subtree split -P aios-core -b aios-core-split
- - This creates new branch with only aios-core/ history
- - Preserves all commits, authors, timestamps for aios-core/
- Validate history preservation:
- - Check commit count (should match aios-core/ commits)
- - Verify authors preserved
- - Verify timestamps preserved
- - Check file structure (aios-core/ contents now at root)
- Create temporary repository for validation:
- - git init aios-core-temp
- - git pull ../aios-fullstack aios-core-split
- - Verify structure and history
- Document split process and validation results

---

## ✅ Acceptance Criteria

### Must Have
- [ ] Full backup of aios-fullstack created and verified
- [ ] Backup stored in multiple locations (local + external)
- [ ] git subtree split executed successfully (aios-core-split branch created)
- [ ] Git history preserved (all commits, authors, timestamps)
- [ ] Validation confirms history completeness
- [ ] Backup restoration tested (dry run)
- [ ] Split process documented with validation results

### Should Have
- [ ] Automated backup verification script
- [ ] Rollback procedure documented
- [ ] GitHub issue/PR export completed


### Nice to Have
- [ ] Automated history comparison tool
- [ ] Visual git history comparison


---

## 🔗 Dependencies

### Prerequisites (Blocking)
- **Epic 11: Phase 2 Validation (GO decision)

### Dependent Stories (This Blocks)
- **Story 12.2: Create aios/aios-core Repository

---

## 📁 Files Modified

### New Files Created
- `backups/aios-fullstack-pre-core-split/*`
- `docs/internal/git-subtree-split-validation.md`

### Files Modified
- None


### Files Referenced (No Changes)
- `aios-fullstack/aios-core/*`


---

## 🎨 Deliverables

### Full Backup
**Location:** `backups/aios-fullstack-pre-core-split/`

Complete backup of aios-fullstack with all branches, tags, and history.

### aios-core-split Branch
**Location:** `aios-fullstack (branch: aios-core-split)`

Git subtree split branch with aios-core/ history preserved.

---

## 💰 Investment Breakdown

- Days 1-2 (Backup): $1,500
- Days 3-5 (Subtree Split): $2,250
- Total: $3,750

---

## 🎯 Success Metrics

- **Backup Completeness:** All branches, tags, history backed up
- **History Preservation:** 100% commits, authors, timestamps preserved
- **Validation:** Backup restoration and split validation successful

---

## ⚠️ Risks & Mitigation

### Risk 1: Git history corruption during subtree split
- **Likelihood:** Low
- **Impact:** Critical
- **Mitigation:** Full backup before split, dry run validation, rollback procedure ready

### Risk 2: Large repository size causes split failure
- **Likelihood:** Low
- **Impact:** High
- **Mitigation:** Test on smaller branch first, increase git memory limits, use --rejoin flag if needed

---

## 📝 Notes

CRITICAL: Full backup before any git operations. Subtree split preserves git history for proper attribution and open-source transparency. BREAKING CHANGES start in Epic 12.

---

## 🔗 Related Documents

- **Epic:** [Epic-12](../epics/epic-12.md)

---

**Last Updated:** 2025-01-14
**Previous Story:** N/A
**Next Story:** N/A
**Next Review:** After completion
