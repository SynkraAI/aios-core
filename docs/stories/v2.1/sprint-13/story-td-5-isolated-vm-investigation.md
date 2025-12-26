# Story TD-5: isolated-vm macOS Investigation

<!-- Source: Sprint 13 Technical Debt -->
<!-- Context: Investigate isolated-vm compatibility issues on macOS -->
<!-- Type: Tech Debt / Investigation -->

## Status: Draft

**Priority:** LOW
**Sprint:** 13
**Effort:** 2-4h
**Lead:** @dev (Dex)

---

## Story

**As a** developer using AIOS on macOS,
**I want** isolated-vm to work correctly or have a suitable alternative,
**So that** I can use sandboxed script execution features on all platforms.

---

## Background

| Original ID | Title | Effort |
|-------------|-------|--------|
| 1733427600002 | isolated-vm macOS Investigation | 2-4h |

### Current State

- `isolated-vm` is listed as a dependency
- Reported issues on macOS (compilation, runtime)
- May require native compilation on install
- Some features may be disabled on macOS

### Related Files

From grep search:
- `package.json` - dependency listed
- `.github/workflows/ci.yml` - CI configuration
- `docs/stories/v2.1/sprint-6/story-6.3-isolated-vm-investigation.md` - Previous investigation

---

## Acceptance Criteria

### Investigation
1. Document current isolated-vm usage in codebase
2. Identify macOS-specific issues
3. Test on macOS (Intel and Apple Silicon)
4. Document workarounds or alternatives

### Resolution
5. Either fix macOS compatibility OR
6. Implement graceful fallback for macOS OR
7. Replace with alternative sandboxing solution

### Documentation
8. Update installation docs with macOS notes
9. Add troubleshooting section
10. Document any platform-specific behavior

---

## Tasks / Subtasks

### Task 1: Audit Current Usage (AC: 1)

**Responsável:** @dev (Dex)
**Effort:** 30min

- [ ] 1.1 Search codebase for isolated-vm usage
- [ ] 1.2 Document where/how it's used
- [ ] 1.3 Identify which features depend on it
- [ ] 1.4 Check if it's optional or required

### Task 2: Research Issues (AC: 2)

**Responsável:** @dev (Dex)
**Effort:** 30min

- [ ] 2.1 Review GitHub issues on isolated-vm repo
- [ ] 2.2 Check for macOS-specific bugs
- [ ] 2.3 Review previous investigation (Story 6.3)
- [ ] 2.4 Document known issues

### Task 3: macOS Testing (AC: 3)

**Responsável:** @dev (Dex) or @qa (Quinn)
**Effort:** 1h

- [ ] 3.1 Test on macOS Intel
- [ ] 3.2 Test on macOS Apple Silicon (M1/M2/M3)
- [ ] 3.3 Document installation process
- [ ] 3.4 Document any errors encountered

### Task 4: Evaluate Alternatives (AC: 4-7)

**Responsável:** @architect (Aria)
**Effort:** 1h

Alternatives to consider:
- [ ] 4.1 `vm2` - Popular but has security issues
- [ ] 4.2 `quickjs-emscripten` - WASM-based, cross-platform
- [ ] 4.3 Node.js `vm` module with restrictions
- [ ] 4.4 Worker threads with message passing
- [ ] 4.5 Graceful degradation (disable sandboxing on macOS)

### Task 5: Implement Solution (AC: 5-7)

**Responsável:** @dev (Dex)
**Effort:** 1-2h

Based on investigation, implement one of:
- [ ] 5.1 Fix macOS compilation issues
- [ ] 5.2 Add graceful fallback
- [ ] 5.3 Replace with alternative

### Task 6: Documentation (AC: 8-10)

**Responsável:** @dev (Dex)
**Effort:** 30min

- [ ] 6.1 Update installation docs
- [ ] 6.2 Add troubleshooting guide
- [ ] 6.3 Document platform differences

---

## Dev Notes

### Current isolated-vm Usage

```javascript
// Typical usage pattern
const ivm = require('isolated-vm');

const isolate = new ivm.Isolate({ memoryLimit: 128 });
const context = await isolate.createContext();

// Run untrusted code safely
const result = await context.eval('1 + 1');
```

### Graceful Fallback Pattern

```javascript
let isolatedVmAvailable = false;
let ivm;

try {
  ivm = require('isolated-vm');
  isolatedVmAvailable = true;
} catch (error) {
  console.warn('isolated-vm not available, using fallback');
}

function executeScript(code) {
  if (isolatedVmAvailable) {
    return executeInIsolate(code);
  } else {
    return executeWithVm(code); // Less secure fallback
  }
}
```

### macOS Compilation Requirements

```bash
# May need Xcode Command Line Tools
xcode-select --install

# May need specific node-gyp version
npm install -g node-gyp@latest

# For Apple Silicon
arch -x86_64 npm install isolated-vm
```

### Previous Investigation Reference

See: `docs/stories/v2.1/sprint-6/story-6.3-isolated-vm-investigation.md`

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| No macOS solution found | Low | Medium | Graceful fallback |
| Security reduction with fallback | Medium | Medium | Document clearly |
| Breaking existing functionality | Low | High | Feature flags |

---

## Definition of Done

- [ ] Investigation complete
- [ ] Solution implemented (fix OR fallback OR alternative)
- [ ] Works on Windows, macOS (Intel + ARM), Linux
- [ ] Documentation updated
- [ ] Tests pass on all platforms
- [ ] PR approved and merged

---

**Story Points:** 3
**Sprint:** 13
**Priority:** Low
**Type:** Tech Debt / Investigation

---

## Change Log

| Date | Version | Author | Change |
|------|---------|--------|--------|
| 2025-12-26 | 1.0 | @po (Pax) | Story created from tech debt item |
