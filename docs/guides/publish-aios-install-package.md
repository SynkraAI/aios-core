# Publication Guide - @synkra/aios-install Package

**Task:** #1 - Publish NPX installer to npm
**Agent:** @devops (Gage)
**Date:** 2026-02-14
**Status:** READY FOR PUBLISH

---

## Pre-Publish Validation ✅ COMPLETE

All validation checks passed:

### ✅ Tests
```bash
cd /Users/luizfosc/aios-core/packages/aios-install
npm test
```

**Result:** 106 tests passed in 3.74s

```
Test Suites: 6 passed, 6 total
Tests:       106 passed, 106 total
Snapshots:   0 total
Time:        3.74 s
```

### ✅ Coverage
```bash
npm run test:coverage
```

**Result:** 47% coverage (acceptable for I/O-heavy installer)

```
File             | % Stmts | % Branch | % Funcs | % Lines
-----------------|---------|----------|---------|----------
All files        |   46.92 |    47.72 |   69.76 |    46.7
dep-checker.js   |   82.35 |    84.44 |   90.9  |   82.14
installer.js     |   33.68 |    28.91 |   61.11 |   33.33
os-detector.js   |   95.52 |    82.35 |   100   |   95.52
```

### ✅ Smoke Tests
```bash
# CLI version
node bin/aios-install.js --version
# Output: 1.0.0

# Help command
node bin/aios-install.js --help
# Output: Complete help text displayed

# MCP tool
node bin/edmcp.js --help
# Output: edmcp help displayed
```

### ✅ Package Structure
```bash
npm pack --dry-run
```

**Result:**
```
npm notice 📦  @synkra/aios-install@1.0.0
npm notice package size: 12.5 kB
npm notice unpacked size: 47.3 kB
npm notice total files: 8
```

**Files included:**
- README.md ✅
- package.json ✅
- bin/ (aios-install.js, edmcp.js) ✅
- src/ (installer.js, os-detector.js, dep-checker.js, edmcp/index.js) ✅
- jest.config.js ❌ (excluded by .npmignore - correct)
- tests/ ❌ (excluded by .npmignore - correct)

---

## Publication Commands

### Step 1: Verify npm Login

```bash
npm whoami
```

**Expected:** Your npm username (e.g., `synkra`)

**If not logged in:**
```bash
npm login
# Follow prompts to enter credentials
```

### Step 2: Navigate to Package

```bash
cd /Users/luizfosc/aios-core/packages/aios-install
```

### Step 3: Publish Package

```bash
npm publish --access public
```

**Expected output:**
```
+ @synkra/aios-install@1.0.0
```

### Step 4: Verify Publication

```bash
npm view @synkra/aios-install
```

**Expected:** Package metadata displayed with version 1.0.0

---

## Post-Publication Validation

### Test 1: Install via npx (macOS)

```bash
npx @synkra/aios-install --dry-run
```

**Expected:**
- Package downloads from npm
- Installer runs in dry-run mode
- No errors displayed
- Performance timer shows < 5min target

### Test 2: Profile Selection

```bash
npx @synkra/aios-install --profile bob --dry-run
```

**Expected:**
- Bob profile selected automatically
- educational_mode: true
- No interactive prompts

```bash
npx @synkra/aios-install --profile advanced --dry-run
```

**Expected:**
- Advanced profile selected
- educational_mode: false
- Full access mode

### Test 3: Cross-Platform (Optional)

**Windows/WSL:**
```bash
wsl npx @synkra/aios-install --dry-run
```

**Linux (Docker):**
```bash
docker run -it node:18 npx @synkra/aios-install --dry-run
```

---

## Update Bob Orchestrator

After successful publication, update Bob Orchestrator to use published package:

**File:** `.aios-core/core/orchestration/bob-orchestrator.js`

**Line 850 - Change:**
```javascript
// BEFORE:
nextStep: 'run_aios_init'

// AFTER:
nextStep: 'Run: npx @synkra/aios-install'
```

**Also update:**
- `docs/guides/onboarding.md` - Add npx command
- `README.md` - Update installation section

---

## Rollback Plan

If issues are found after publication:

### Option 1: Deprecate Version
```bash
npm deprecate @synkra/aios-install@1.0.0 "Deprecated due to [reason]"
```

### Option 2: Unpublish (within 72h)
```bash
npm unpublish @synkra/aios-install@1.0.0
```

**Note:** Unpublish only works within 72 hours of publication and requires confirmation.

---

## Completion Criteria

- [x] All tests pass (106/106)
- [x] Package structure validated
- [x] README.md complete
- [x] Smoke tests pass
- [ ] npm login successful
- [ ] npm publish successful
- [ ] npm view shows package metadata
- [ ] npx @synkra/aios-install --dry-run works on macOS
- [ ] Bob Orchestrator updated with npx command
- [ ] Documentation updated

---

## Timeline

**Pre-publish validation:** ✅ COMPLETE (45 min)
**npm publish:** ⏳ PENDING (requires credentials)
**Post-publish validation:** ⏳ PENDING (15 min)
**Bob integration:** ⏳ PENDING (15 min)

**Total estimated remaining:** ~30 minutes

---

## Notes

- Package is I/O-heavy (OS detection, file system, CLI prompts)
- 47% unit test coverage is acceptable (critical logic paths covered)
- 106 tests all passing validates core functionality
- Post-publish cross-platform testing recommended but not blocking
- NPX installer replaces previous `aios init` approach
- Supports both greenfield (new) and brownfield (existing) installations

---

**Prepared by:** @qa (Quinn)
**Ready for:** @devops (Gage)
**Task Status:** READY FOR PUBLISH
**Blocking:** npm credentials required
