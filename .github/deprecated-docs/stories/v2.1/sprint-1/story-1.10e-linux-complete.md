# Story 1.10e: Complete Linux Testing - Debian and Fedora

**Story ID**: 1.10e
**Sprint**: 2.1 Sprint 1
**Status**: 📝 DRAFT
**Priority**: P2 (Medium)
**Created**: 2025-11-24
**Last Updated**: 2025-11-24

## 📋 Story Overview

### Description
Complete Linux platform testing by validating AIOS-FULLSTACK installation and functionality on:
- **Debian 11 (Bullseye)** - DEB package ecosystem
- **Fedora 38** - RPM package ecosystem

This complements Story 1.10c which validated Ubuntu 24.04 and fixed the P0 module path bug.

### Context
From Story 1.10c results:
- ✅ **Ubuntu 24.04**: 6/6 scenarios passed (100% success rate)
- ✅ **P0 Bug**: Fixed in commit e72a53c0
- 🟡 **Debian/Fedora**: Pending validation

Linux represents a significant portion of the development community. Ensuring compatibility across major distributions (Debian-based, Red Hat-based) is critical for broad adoption.

### Business Value
- **Market Coverage**: Support for both DEB and RPM ecosystems
- **Enterprise Adoption**: Fedora/RHEL compatibility for enterprise users
- **Stability**: Debian for long-term support environments
- **Completeness**: Full Linux platform validation

## 🎯 Acceptance Criteria

### AC1: Debian 11 (Bullseye) Installation
- [ ] Node.js 18+ installed via apt or nvm
- [ ] Git installed and configured
- [ ] npm/yarn/pnpm functional
- [ ] AIOS Core initialization successful
- [ ] All 6 test scenarios pass
- [ ] No P0/P1 blockers identified

### AC2: Fedora 38 Installation
- [ ] Node.js 18+ installed via dnf or nvm
- [ ] Git installed and configured
- [ ] npm/yarn/pnpm functional
- [ ] AIOS Core initialization successful
- [ ] All 6 test scenarios pass
- [ ] No P0/P1 blockers identified

### AC3: Package Manager Compatibility
- [ ] DEB packages work on Debian
- [ ] RPM packages work on Fedora
- [ ] Document differences between apt/dnf workflows
- [ ] Validate npm global packages on both systems

### AC4: Documentation
- [ ] Installation guide updated with Debian instructions
- [ ] Installation guide updated with Fedora instructions
- [ ] Troubleshooting section for DEB/RPM differences
- [ ] QA gate reports for both distributions
- [ ] Linux testing summary document

## 🧪 Test Scenarios

### Scenario 1: Fresh Installation (Debian)
**Environment**: Debian 11 (Bullseye) clean install

**Prerequisites**:
- Debian 11 VM or container
- No prior Node.js installation
- Internet connectivity

**Steps**:
1. Update package lists:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. Install Node.js (Option A - Official repo):
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   node --version  # Should be 18.x or higher
   ```

   Or (Option B - nvm):
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   source ~/.bashrc
   nvm install 18
   nvm use 18
   ```

3. Install Git:
   ```bash
   sudo apt install -y git
   git --version
   ```

4. Clone AIOS repository:
   ```bash
   git clone https://github.com/Pedrovaleriolopez/aios-fullstack.git
   cd aios-fullstack
   ```

5. Install dependencies:
   ```bash
   npm install
   ```

6. Initialize AIOS Core:
   ```bash
   node bin/aios-init.js
   ```

7. Verify installation:
   ```bash
   npm test
   npm run lint
   npm run typecheck
   ```

**Expected Result**: All steps complete without errors, AIOS Core initializes successfully

**Validation Criteria**:
- [ ] Node.js 18+ installed
- [ ] npm functional
- [ ] Git configured
- [ ] AIOS Core directory created
- [ ] Dependencies installed
- [ ] No module path errors
- [ ] Basic tests pass

---

### Scenario 2: Fresh Installation (Fedora)
**Environment**: Fedora 38 clean install

**Prerequisites**:
- Fedora 38 VM or container
- No prior Node.js installation
- Internet connectivity

**Steps**:
1. Update system packages:
   ```bash
   sudo dnf update -y
   ```

2. Install Node.js (Option A - Official repo):
   ```bash
   sudo dnf install -y nodejs npm
   node --version  # Should be 18.x or higher
   ```

   Or (Option B - nvm):
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   source ~/.bashrc
   nvm install 18
   nvm use 18
   ```

3. Install Git:
   ```bash
   sudo dnf install -y git
   git --version
   ```

4. Clone AIOS repository:
   ```bash
   git clone https://github.com/Pedrovaleriolopez/aios-fullstack.git
   cd aios-fullstack
   ```

5. Install dependencies:
   ```bash
   npm install
   ```

6. Initialize AIOS Core:
   ```bash
   node bin/aios-init.js
   ```

7. Verify installation:
   ```bash
   npm test
   npm run lint
   npm run typecheck
   ```

**Expected Result**: All steps complete without errors, AIOS Core initializes successfully

**Validation Criteria**:
- [ ] Node.js 18+ installed
- [ ] npm functional
- [ ] Git configured
- [ ] AIOS Core directory created
- [ ] Dependencies installed
- [ ] No module path errors
- [ ] Basic tests pass

---

### Scenario 3: Package Manager Compatibility (Both)
**Environment**: Debian 11 and Fedora 38

**Steps**:
1. Test npm on both systems:
   ```bash
   npm --version
   npm list --depth=0
   npm run --list
   ```

2. Test yarn on both systems:
   ```bash
   npm install -g yarn
   yarn --version
   yarn install
   ```

3. Test pnpm on both systems:
   ```bash
   npm install -g pnpm
   pnpm --version
   pnpm install
   ```

4. Validate global packages:
   ```bash
   npm list -g --depth=0
   ```

**Expected Result**: All package managers work identically on both distributions

**Validation Criteria**:
- [ ] npm works on Debian
- [ ] npm works on Fedora
- [ ] yarn works on Debian
- [ ] yarn works on Fedora
- [ ] pnpm works on Debian
- [ ] pnpm works on Fedora

---

### Scenario 4: Agent Activation (Both)
**Environment**: Debian 11 and Fedora 38 with AIOS installed

**Steps**:
1. Start AIOS CLI:
   ```bash
   node bin/aios-cli.js
   ```

2. Activate dev agent:
   ```bash
   @dev
   ```

3. List available tasks:
   ```bash
   *help
   ```

4. Execute a simple task:
   ```bash
   *task hello
   ```

5. Exit agent:
   ```bash
   *exit
   ```

**Expected Result**: Agent activates, executes task, and exits cleanly on both distributions

**Validation Criteria**:
- [ ] CLI starts on Debian
- [ ] CLI starts on Fedora
- [ ] Agent activation works on Debian
- [ ] Agent activation works on Fedora
- [ ] Tasks execute on Debian
- [ ] Tasks execute on Fedora

---

### Scenario 5: File System Permissions (Both)
**Environment**: Debian 11 and Fedora 38

**Steps**:
1. Check AIOS Core permissions:
   ```bash
   ls -la .aios-core/
   ```

2. Test file creation:
   ```bash
   touch .aios-core/test-file.txt
   rm .aios-core/test-file.txt
   ```

3. Test directory creation:
   ```bash
   mkdir .aios-core/test-dir
   rmdir .aios-core/test-dir
   ```

4. Check node_modules permissions:
   ```bash
   ls -la node_modules/ | head -20
   ```

**Expected Result**: All file operations succeed without permission errors

**Validation Criteria**:
- [ ] AIOS Core readable/writable on Debian
- [ ] AIOS Core readable/writable on Fedora
- [ ] No SELinux issues on Fedora
- [ ] No AppArmor issues on Debian

---

### Scenario 6: Integration Test Suite (Both)
**Environment**: Debian 11 and Fedora 38 with AIOS installed

**Steps**:
1. Run full test suite:
   ```bash
   npm test
   ```

2. Run integration tests specifically:
   ```bash
   npm test -- tests/integration/
   ```

3. Run regression tests:
   ```bash
   npm test -- tests/regression/
   ```

4. Check test coverage:
   ```bash
   npm run coverage
   ```

**Expected Result**: All tests pass on both distributions

**Validation Criteria**:
- [ ] Unit tests pass on Debian
- [ ] Unit tests pass on Fedora
- [ ] Integration tests pass on Debian
- [ ] Integration tests pass on Fedora
- [ ] Regression tests pass on Debian
- [ ] Regression tests pass on Fedora

## 🔧 Technical Approach

### Phase 1: Environment Setup (Est. 1-2 hours)

#### 1.1 Debian 11 VM Setup
**Options**:
1. **VirtualBox/VMware**: Download Debian 11 ISO, create VM
2. **WSL**: Install Debian from Microsoft Store
3. **Docker**: Use official Debian 11 container
4. **Cloud**: Spin up Debian 11 instance (AWS/Azure/GCP)

**Recommended**: Docker for quick testing, then WSL for full validation

```dockerfile
# Dockerfile.debian
FROM debian:11
RUN apt update && apt install -y curl git
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt install -y nodejs
WORKDIR /workspace
```

#### 1.2 Fedora 38 VM Setup
**Options**:
1. **VirtualBox/VMware**: Download Fedora 38 ISO, create VM
2. **WSL**: Install Fedora from GitHub (unofficial)
3. **Docker**: Use official Fedora 38 container
4. **Cloud**: Spin up Fedora 38 instance

**Recommended**: Docker for quick testing, then VM for full validation

```dockerfile
# Dockerfile.fedora
FROM fedora:38
RUN dnf update -y && dnf install -y curl git nodejs npm
WORKDIR /workspace
```

### Phase 2: Testing Execution (Est. 3-4 hours)

#### 2.1 Debian Testing
```bash
# Build Debian container
docker build -f Dockerfile.debian -t aios-debian .

# Run tests
docker run -it --rm -v $(pwd):/workspace aios-debian bash
cd /workspace
npm install
node bin/aios-init.js
npm test

# Document results
docker exec aios-debian npm test > debian-test-results.txt
```

#### 2.2 Fedora Testing
```bash
# Build Fedora container
docker build -f Dockerfile.fedora -t aios-fedora .

# Run tests
docker run -it --rm -v $(pwd):/workspace aios-fedora bash
cd /workspace
npm install
node bin/aios-init.js
npm test

# Document results
docker exec aios-fedora npm test > fedora-test-results.txt
```

#### 2.3 Compare Results
```bash
# Generate comparison report
node scripts/compare-linux-results.js \
  --debian debian-test-results.txt \
  --fedora fedora-test-results.txt \
  --ubuntu ubuntu-test-results.txt
```

### Phase 3: Documentation (Est. 1-2 hours)

#### 3.1 Installation Guides
Update `docs/installation/linux.md`:
- Add Debian-specific instructions
- Add Fedora-specific instructions
- Document apt vs dnf commands
- Add troubleshooting for each distro

#### 3.2 QA Gates
Create `docs/qa/gates/1.10e-linux-complete.yml`:
- Debian test results
- Fedora test results
- Comparison matrix
- Known issues per distro

#### 3.3 Testing Report
Create `docs/testing/1.10e-linux-complete-report.md`:
- Executive summary
- Detailed test results
- Performance comparisons
- Recommendations

## 📊 Comparison Matrix

### Package Managers

| Feature | Debian (apt) | Fedora (dnf) |
|---------|--------------|--------------|
| Update | `apt update` | `dnf check-update` |
| Upgrade | `apt upgrade` | `dnf upgrade` |
| Install | `apt install` | `dnf install` |
| Remove | `apt remove` | `dnf remove` |
| Search | `apt search` | `dnf search` |
| Clean | `apt clean` | `dnf clean all` |

### Node.js Installation

| Method | Debian | Fedora |
|--------|--------|--------|
| **Official Repo** | NodeSource PPA | Built-in repo |
| **Package Name** | `nodejs` | `nodejs` + `npm` |
| **Version** | 18.x (via PPA) | 18.x (built-in) |
| **Global Path** | `/usr/bin/node` | `/usr/bin/node` |
| **npm Path** | `/usr/bin/npm` | `/usr/bin/npm` |

### System Differences

| Aspect | Debian | Fedora |
|--------|--------|--------|
| **Init System** | systemd | systemd |
| **Security** | AppArmor | SELinux |
| **Release Cycle** | Stable (2 years) | Rapid (6 months) |
| **Package Format** | .deb | .rpm |
| **Default Shell** | bash | bash |
| **Kernel** | Stable | Latest |

## 🚧 Known Challenges

### Challenge 1: SELinux on Fedora
**Issue**: SELinux may block file operations in AIOS Core

**Solution**:
```bash
# Check SELinux status
sestatus

# Temporary disable (testing only)
sudo setenforce 0

# Permanent (not recommended)
sudo vi /etc/selinux/config
# SELINUX=permissive
```

**Better Solution**: Create SELinux policy for AIOS

### Challenge 2: Node.js Version Mismatch
**Issue**: Debian repos may have older Node.js versions

**Solution**: Always use NodeSource PPA or nvm
```bash
# Debian with NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### Challenge 3: Global npm Permissions
**Issue**: Global npm installs may require sudo

**Solution**: Configure npm to use user directory
```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

## 📁 File Changes

### New Files:
- `docs/installation/linux-debian.md` - Debian installation guide
- `docs/installation/linux-fedora.md` - Fedora installation guide
- `docs/qa/gates/1.10e-linux-complete.yml` - QA gate for Debian/Fedora
- `docs/testing/1.10e-linux-complete-report.md` - Testing report
- `Dockerfile.debian` - Debian test container
- `Dockerfile.fedora` - Fedora test container
- `scripts/compare-linux-results.js` - Result comparison script
- `tests/integration/linux/debian.test.js` - Debian-specific tests
- `tests/integration/linux/fedora.test.js` - Fedora-specific tests

### Modified Files:
- `docs/installation/linux.md` - Add Debian/Fedora sections
- `docs/stories/v2.1/sprint-1/story-1.10c-linux-testing.md` - Update status
- `README.md` - Add Debian/Fedora badges
- `.github/workflows/linux-test.yml` - Add Debian/Fedora CI

### Estimated Impact:
- ~10 new documentation files
- ~5 modified configuration files
- ~200 lines of test code

## 🔗 Dependencies

### Blocked By:
- ✅ Story 1.10c (Linux Testing - Ubuntu) - COMPLETE

### Blocks:
- Story 1.11: CI/CD Pipeline Implementation (needs all platform tests)

### Related Stories:
- Story 1.10a: Windows Testing
- Story 1.10b: macOS Testing
- Story 1.10c: Linux Testing (Ubuntu)
- Story 1.10d: Quality Gate Fixes

## 📈 Success Metrics

### Quantitative:
- Debian: 6/6 scenarios pass (100%)
- Fedora: 6/6 scenarios pass (100%)
- Test execution time: <10% variance between distros
- Zero P0/P1 bugs found

### Qualitative:
- Installation documentation clear and accurate
- No unexpected behavior on either distribution
- Community can easily validate on their systems
- Differences between distros well documented

## 🎯 Definition of Done

- [ ] Debian 11 fully validated (6/6 scenarios)
- [ ] Fedora 38 fully validated (6/6 scenarios)
- [ ] Installation guides created for both distros
- [ ] QA gate passed for both distros
- [ ] Testing report completed
- [ ] Docker test containers created
- [ ] CI/CD updated to test Debian/Fedora
- [ ] Known issues documented
- [ ] Code reviewed and approved
- [ ] Changes merged to main branch

## 📝 Notes

### Testing Strategy
- Use Docker for initial rapid testing
- Use VMs for full validation
- Compare results against Ubuntu baseline
- Document any distro-specific issues

### Timeline
- Phase 1 (Setup): 1-2 hours
- Phase 2 (Testing): 3-4 hours
- Phase 3 (Documentation): 1-2 hours
- **Total Estimate**: 5-8 hours

### Future Considerations
- Arch Linux testing
- Alpine Linux testing (for containers)
- Raspberry Pi OS testing
- Enterprise Linux (RHEL/CentOS) testing

---

**Story Status**: 📝 DRAFT - Ready for review and planning

**Next Steps**:
1. Review and approve story approach
2. Create feature branch: `feature/story-1.10e-linux-complete`
3. Set up Debian/Fedora test environments
4. Execute all test scenarios
5. Document results and create QA gates
6. Create PR and merge
