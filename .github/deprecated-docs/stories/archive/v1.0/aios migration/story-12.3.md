# Story 12.3: Publish @aios/core npm Package

**Story ID:** 12.3
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

Publish @aios/core npm package to registry, test installation with npx @aios/core install, and create migration guide from aios-fullstack.

---

## 🎯 Scope

Update package.json for npm publishing (name, version, files, bin). Publish to npm registry with public access. Test installation via npx. Create migration guide for existing users. BREAKING: Old package deprecated, new package @aios/core.

---

## 📊 Tasks Breakdown

**Day 1-3: Package Configuration (24 hours)** (24 hours)
Configure package.json for npm publishing
- Update package.json for npm publishing:
- - name: '@aios/core' (scoped package)
- - version: '2.0.0' (major version for breaking change)
- - files: ['aios-core/', 'bin/', 'tools/', 'LICENSE', 'README.md']
- - bin: { 'aios': './bin/aios' }
- - publishConfig: { access: 'public' }
- - keywords: ['ai', 'agent', 'mcp', 'production-grade', 'deployment']
- Verify package contents:
- - npm pack (dry run)
- - Inspect tarball contents
- - Ensure no unwanted files included (.env, .git, etc.)
- Test local installation:
- - npm pack
- - npm install ./aios-core-2.0.0.tgz -g
- - Test CLI: aios --version
- - Test installation wizard: aios install

**Day 4-5: Publish + Testing (16 hours)** (16 hours)
Publish to npm and test installation
- Authenticate with npm:
- - npm login (use npm account)
- - Verify authentication: npm whoami
- Publish to npm registry:
- - npm publish --access public
- - Verify published: npm view @aios/core
- Test installation via npx (clean environment):
- - npx @aios/core install
- - Verify installation wizard runs
- - Verify agent creation works
- - Verify task execution works
- Test global installation:
- - npm install -g @aios/core
- - aios --version
- - aios install (should work globally)
- Monitor npm registry:
- - Check download stats
- - Monitor for issues/errors

---

## ✅ Acceptance Criteria

### Must Have
- [ ] package.json configured for npm publishing (@aios/core)
- [ ] @aios/core published to npm registry (version 2.0.0)
- [ ] npx @aios/core install works in clean environment
- [ ] Global installation works: npm install -g @aios/core
- [ ] CLI functional: aios --version, aios install
- [ ] Agent creation and task execution tested
- [ ] Package contents verified (no unwanted files)

### Should Have
- [ ] npm download stats tracked
- [ ] Automated publish workflow (GitHub Actions)
- [ ] Version tagging in git


### Nice to Have
- [ ] Automated testing on npm publish
- [ ] Canary releases for testing


---

## 🔗 Dependencies

### Prerequisites (Blocking)
- **Story 12.2: Create Repository + Migrate

### Dependent Stories (This Blocks)
- **Story 12.4: Archive + Deprecation

---

## 📁 Files Modified

### New Files Created
- None

### Files Modified
- `aios/aios-core/package.json`


### Files Referenced (No Changes)
- None


---

## 🎨 Deliverables

### @aios/core npm Package
**Location:** `npm registry`

Published npm package with global CLI and installation wizard.

---

## 💰 Investment Breakdown

- Days 1-3 (Configuration): $2,250
- Days 4-5 (Publish + Testing): $1,500
- Total: $3,750

---

## 🎯 Success Metrics

- **Package Published:** @aios/core live on npm registry
- **Installation Success:** npx @aios/core install works
- **Global CLI:** aios command works after global install
- **Functionality:** Agent creation and task execution work

---

## ⚠️ Risks & Mitigation

### Risk 1: npm publish fails (authentication, permissions)
- **Likelihood:** Low
- **Impact:** Medium
- **Mitigation:** Verify authentication beforehand, test npm pack, dry run with npm publish --dry-run

### Risk 2: Package installation errors in clean environment
- **Likelihood:** Medium
- **Impact:** High
- **Mitigation:** Test in multiple clean environments (Docker, VM), fix dependency issues before publish

---

## 📝 Notes

BREAKING: npm package name changes from 'aios-fullstack' to '@aios/core'. Migration guide created in Story 12.4 to help users transition.

---

## 🔗 Related Documents

- **Epic:** [Epic-12](../epics/epic-12.md)

---

**Last Updated:** 2025-01-14
**Previous Story:** N/A
**Next Story:** N/A
**Next Review:** After completion
