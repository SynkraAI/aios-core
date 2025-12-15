# Story 12.2: Create aios/aios-core Repository + Migrate

**Story ID:** 12.2
**Epic:** Epic-12 - Phase 3 - Open Core Repository
**Wave:** Wave 3 (Progressive Open Source)
**Status:** 📋 Ready to Start
**Priority:** 🔴 Critical
**Owner:** DevOps (Gage) + Architect (Aria)
**Created:** 2025-01-14
**Duration:** 2 weeks
**Investment:** $7,500

---

## 📋 Objective

Create NEW PUBLIC REPO aios/aios-core with Commons Clause license, push aios-core-split branch, and update all internal references to new repository structure.

---

## 🎯 Scope

Create GitHub repository aios/aios-core with Commons Clause license (prevents commercial SaaS competitors). Push aios-core-split branch from Story 12.1. Update all internal references: imports, package.json, documentation links. Test new repository structure. BREAKING: Package name changes to @aios/core.

---

## 📊 Tasks Breakdown

**Week 1: Repository Creation + Push (40 hours)** (40 hours)
Create new repository and push code with history
- Create GitHub repository: aios/aios-core
- License: Commons Clause + MIT (prevents SaaS clones, allows other use)
- Initialize repository:
- - Add LICENSE (Commons Clause + MIT base)
- - Add .gitignore
- - Configure branch protection (main branch)
- Push aios-core-split branch to new repository:
- - git remote add aios-core git@github.com:aios/aios-core.git
- - git push aios-core aios-core-split:main
- - Verify history transferred correctly
- Create initial folder structure:
- - aios-core/ (from split)
- - bin/ (CLI entry point)
- - tools/installer/ (installation wizard)
- - docs/ (core documentation)
- Verify git history integrity in new repository

**Week 2: Reference Updates (40 hours)** (40 hours)
Update all internal references to new repository
- Update package.json:
- - Change name to '@aios/core' (BREAKING CHANGE)
- - Update repository URL to aios/aios-core
- - Update homepage URL
- - Update bugs URL
- Update internal import paths:
- - Search for 'aios-fullstack' references
- - Replace with '@aios/core' or relative paths
- - Update all require() and import statements
- Update documentation links:
- - README.md links to new repository
- - docs/ links updated
- - CONTRIBUTING.md references updated
- Update configuration files:
- - Update .github/ workflow paths
- - Update CI/CD references
- Test all functionality:
- - Run test suite: npm test
- - Test CLI: bin/aios --help
- - Test agent activation
- - Test task execution

---

## ✅ Acceptance Criteria

### Must Have
- [ ] GitHub repository aios/aios-core created (Commons Clause license)
- [ ] aios-core-split branch pushed to new repository with history
- [ ] package.json updated: name = '@aios/core' (BREAKING CHANGE)
- [ ] All internal references updated (imports, docs, configs)
- [ ] Git history verified in new repository
- [ ] Test suite passing in new repository
- [ ] CLI functional in new repository structure
- [ ] Agent activation and task execution tested

### Should Have
- [ ] Branch protection configured on main branch
- [ ] CODEOWNERS file created
- [ ] GitHub repository settings configured (issues, discussions)


### Nice to Have
- [ ] Automated reference checker (finds old references)
- [ ] Migration validation script


---

## 🔗 Dependencies

### Prerequisites (Blocking)
- **Story 12.1: Backup + Subtree Split

### Dependent Stories (This Blocks)
- **Story 12.3: Publish npm Package

---

## 📁 Files Modified

### New Files Created
- `aios/aios-core/LICENSE`
- `aios/aios-core/.gitignore`
- `aios/aios-core/CODEOWNERS`

### Files Modified
- `aios/aios-core/package.json`
- `aios/aios-core/README.md`
- `aios/aios-core/CONTRIBUTING.md`
- `aios/aios-core/**/*.js (import paths)`


### Files Referenced (No Changes)
- None


---

## 🎨 Deliverables

### aios/aios-core Repository
**Location:** `GitHub: aios/aios-core`

Complete public repository with Commons Clause license, code, and documentation.

---

## 💰 Investment Breakdown

- Week 1 (Repository + Push): $3,750
- Week 2 (Reference Updates): $3,750
- Total: $7,500

---

## 🎯 Success Metrics

- **Repository Created:** aios/aios-core live on GitHub
- **History Transferred:** 100% git history in new repo
- **References Updated:** All imports, docs, configs updated
- **Tests Passing:** 100% test suite passing in new repo

---

## ⚠️ Risks & Mitigation

### Risk 1: Missing reference updates break functionality
- **Likelihood:** Medium
- **Impact:** High
- **Mitigation:** Comprehensive search for old references, test suite catches broken imports, staged rollout

### Risk 2: Commons Clause license confusion
- **Likelihood:** Medium
- **Impact:** Medium
- **Mitigation:** Clear LICENSE.md explanation, FAQ addresses licensing questions

---

## 📝 Notes

BREAKING CHANGE: Package name changes from 'aios-fullstack' to '@aios/core'. Users must update: npx @aios/core install. Commons Clause prevents SaaS clones while allowing other use.

---

## 🔗 Related Documents

- **Epic:** [Epic-12](../epics/epic-12.md)

---

**Last Updated:** 2025-01-14
**Previous Story:** N/A
**Next Story:** N/A
**Next Review:** After completion
