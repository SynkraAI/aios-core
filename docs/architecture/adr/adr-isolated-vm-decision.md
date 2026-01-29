# ADR: isolated-vm macOS Compatibility

> **EN** | [PT](../../pt/architecture/adr/adr-isolated-vm-decision.md) | [ES](../../es/architecture/adr/adr-isolated-vm-decision.md)

---

**Status:** Superseded
**Date:** 2026-01-04
**Updated:** 2026-01-27
**Story:** TD-6 - CI Stability & Test Coverage Improvements
**Author:** @devops (Gage)
**Superseded By:** Dependency removal (v3.11.0)

## Update (2026-01-27)

**Decision Changed:** `isolated-vm` has been **removed from dependencies** entirely.

### Reason for Removal

After code analysis, we discovered that `isolated-vm` was never actually used in the codebase. It was added as a placeholder for future sandboxed code execution but was never implemented.

### Benefits of Removal

1. **Full Node.js 18-24 compatibility** on all platforms (macOS, Linux, Windows)
2. **43 fewer packages** in dependency tree
3. **6 fewer vulnerabilities** (8 → 2)
4. **No more native module compilation issues**
5. **100% CI matrix coverage** (12 combinations: 3 OS × 4 Node versions)

### Dependencies Updated

| Package       | Before  | After       | Node.js Min         |
| ------------- | ------- | ----------- | ------------------- |
| `isolated-vm` | ^5.0.4  | **REMOVED** | N/A                 |
| `commander`   | ^14.0.1 | ^12.1.0     | >=18                |
| `glob`        | ^11.0.3 | ^10.4.4     | 14, 16, 18, 20, 22+ |

---

## Original Context (Historical)

During CI testing, we observed SIGSEGV crashes on macOS with Node.js 18.x and 20.x when using `isolated-vm`. This affects the CI matrix coverage.

## Original Investigation Findings

### Affected Configurations

| Platform    | Node Version | Status           |
| ----------- | ------------ | ---------------- |
| macOS ARM64 | 18.x         | ❌ SIGSEGV crash |
| macOS ARM64 | 20.x         | ❌ SIGSEGV crash |
| macOS ARM64 | 22.x         | ✅ Works         |
| macOS x64   | All          | ✅ Works         |
| Ubuntu      | All          | ✅ Works         |
| Windows     | All          | ✅ Works         |

### Root Cause

**GitHub Issue:** [laverdet/isolated-vm#424](https://github.com/laverdet/isolated-vm/issues/424) - "Segmentation fault on Node 20 macos arm64"

The issue is a known incompatibility between `isolated-vm` native bindings and Node.js ARM64 builds on macOS for versions 18.x and 20.x.

## Original Decision (Now Superseded)

**Maintain current CI matrix exclusion** for macOS + Node 18/20.

This decision has been superseded by the complete removal of `isolated-vm` from the project dependencies.

## References

- [isolated-vm#424 - Segmentation fault on Node 20 macos arm64](https://github.com/laverdet/isolated-vm/issues/424)
- [isolated-vm releases](https://github.com/laverdet/isolated-vm/releases)
