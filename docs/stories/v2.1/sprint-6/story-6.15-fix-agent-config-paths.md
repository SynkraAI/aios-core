# Story 6.15: Fix Agent Config Requirements Paths

## Quick Reference

| Attribute | Value |
|-----------|-------|
| **Epic** | Infrastructure Modernization |
| **Story ID** | 6.15 |
| **Sprint** | 6 |
| **Priority** | P1 High |
| **Points** | 2 |
| **Effort** | 1 hour |
| **Status** | ✅ Complete |
| **Type** | Bug Fix |
| **Primary Agent** | @dev (Dex) |
| **Blocked By** | None |
| **Blocks** | Greeting system reliability |

### TL;DR
Fix incorrect file paths in `agent-config-requirements.yaml` that cause greeting script failures when loading QA agent data files.

---

## User Story

**Como** desenvolvedor usando o AIOS Framework,
**Quero** que os caminhos de arquivos no agent-config-requirements.yaml estejam corretos,
**Para** que o sistema de greeting carregue os arquivos de dados dos agentes sem erros.

---

## Background

### Problem Discovery

During QA review of Story 6.14, the greeting script failed with:
```
⚠️ Failed to load file .aios-core/data/test-levels-framework.md: ENOENT
⚠️ Failed to load file .aios-core/data/test-priorities-matrix.md: ENOENT
```

### Root Cause

Files were relocated during modular architecture restructuring (Story 2.x sprint) from `.aios-core/data/` to `.aios-core/product/data/`, but `agent-config-requirements.yaml` was not updated.

### Impact

- QA agent greeting fails to load test framework data
- PO agent greeting fails to load elicitation methods
- SM agent greeting fails to load mode selection best practices
- Analyst agent greeting fails to load brainstorming techniques

---

## Investigation Results

### Path Audit Summary

| Config Path | Actual Location | Status |
|-------------|-----------------|--------|
| `.aios-core/data/aios-kb.md` | `.aios-core/data/aios-kb.md` | ✅ OK |
| `.aios-core/data/technical-preferences.md` | `.aios-core/data/technical-preferences.md` | ✅ OK |
| `.aios-core/data/workflow-patterns.yaml` | `.aios-core/data/workflow-patterns.yaml` | ✅ OK |
| `.aios-core/data/test-levels-framework.md` | `.aios-core/product/data/test-levels-framework.md` | ❌ WRONG |
| `.aios-core/data/test-priorities-matrix.md` | `.aios-core/product/data/test-priorities-matrix.md` | ❌ WRONG |
| `.aios-core/data/elicitation-methods.md` | `.aios-core/product/data/elicitation-methods.md` | ❌ WRONG |
| `.aios-core/data/mode-selection-best-practices.md` | `.aios-core/product/data/mode-selection-best-practices.md` | ❌ WRONG |
| `.aios-core/data/brainstorming-techniques.md` | `.aios-core/product/data/brainstorming-techniques.md` | ❌ WRONG |
| `docs/framework/coding-standards.md` | `docs/framework/coding-standards.md` | ✅ OK |
| `docs/framework/tech-stack.md` | `docs/framework/tech-stack.md` | ✅ OK |
| `docs/framework/source-tree.md` | `docs/framework/source-tree.md` | ✅ OK |

### Duplicate File Issue

Two copies of `agent-config-requirements.yaml` exist:
1. `.aios-core/data/agent-config-requirements.yaml` (referenced by agent-config-loader.js)
2. `.aios-core/core/data/agent-config-requirements.yaml` (duplicate)

**Recommendation:** Keep only `.aios-core/data/` version (matches loader path at line 31).

---

## Scope

### In Scope

- [x] Fix 5 incorrect paths in `.aios-core/data/agent-config-requirements.yaml`
- [x] Update shared_files section paths
- [x] Remove duplicate `.aios-core/core/data/agent-config-requirements.yaml`
- [x] Verify greeting system works after fix

### Out of Scope

- Refactoring the data directory structure
- Adding new data files
- Modifying agent-config-loader.js logic

---

## Acceptance Criteria

### AC 6.15.1: Paths Corrected
```gherkin
GIVEN the agent-config-requirements.yaml file
WHEN examining file paths for QA, PO, SM, and Analyst agents
THEN all paths point to existing files
AND no ENOENT errors occur during greeting generation
```

### AC 6.15.2: Duplicate Removed
```gherkin
GIVEN the .aios-core directory structure
WHEN searching for agent-config-requirements.yaml
THEN only ONE copy exists at .aios-core/data/
AND .aios-core/core/data/agent-config-requirements.yaml is deleted
```

### AC 6.15.3: Greeting Works
```gherkin
GIVEN a user activates @qa agent
WHEN the greeting script runs
THEN no file loading warnings appear
AND the greeting displays successfully
```

---

## Tasks

### Task 1: Fix Incorrect Paths (15 min)
- [x] Update line 67: `test-levels-framework.md` → `.aios-core/product/data/`
- [x] Update line 70: `test-priorities-matrix.md` → `.aios-core/product/data/`
- [x] Update line 123: `elicitation-methods.md` → `.aios-core/product/data/`
- [x] Update line 137: `mode-selection-best-practices.md` → `.aios-core/product/data/`
- [x] Update line 185: `brainstorming-techniques.md` → `.aios-core/product/data/`

### Task 2: Remove Duplicate File (5 min)
- [x] Delete `.aios-core/core/data/agent-config-requirements.yaml`

### Task 3: Verify Fix (10 min)
- [x] Run `node .aios-core/development/scripts/generate-greeting.js qa`
- [x] Verify no ENOENT warnings
- [x] Test other affected agents (po, sm, analyst)

---

## Files to Modify

| File | Changes |
|------|---------|
| `.aios-core/data/agent-config-requirements.yaml` | Fix 5 incorrect paths |

## Files to Delete

| File | Reason |
|------|--------|
| `.aios-core/core/data/agent-config-requirements.yaml` | Duplicate file |
| `.aios-core/core/data/workflow-patterns.yaml` | Duplicate file |
| `.aios-core/core/data/aios-kb.md` | Duplicate file |

---

## Technical Details

### Paths to Fix

```yaml
# QA Agent (lines 67-72)
# BEFORE:
- path: .aios-core/data/test-levels-framework.md
- path: .aios-core/data/test-priorities-matrix.md
# AFTER:
- path: .aios-core/product/data/test-levels-framework.md
- path: .aios-core/product/data/test-priorities-matrix.md

# PO Agent (line 123)
# BEFORE:
- path: .aios-core/data/elicitation-methods.md
# AFTER:
- path: .aios-core/product/data/elicitation-methods.md

# SM Agent (line 137)
# BEFORE:
- path: .aios-core/data/mode-selection-best-practices.md
# AFTER:
- path: .aios-core/product/data/mode-selection-best-practices.md

# Analyst Agent (line 185)
# BEFORE:
- path: .aios-core/data/brainstorming-techniques.md
# AFTER:
- path: .aios-core/product/data/brainstorming-techniques.md
```

---

## Definition of Done

- [x] All 5 incorrect paths fixed
- [x] Duplicate config files deleted (3 files)
- [x] Greeting script runs without ENOENT errors
- [x] QA agent greeting loads test framework data
- [x] PO, SM, Analyst agents greeting tested
- [x] Story validated

---

## Metadata

```yaml
story: 6.15
version: 1.0.0
created_at: 2025-12-17
updated_at: 2025-12-17
tags:
  - bug-fix
  - configuration
  - greeting-system
  - agent-config
```

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References
- Story 6.14 QA review identified the bug
- Grep search confirmed 5 incorrect paths
- Glob search verified actual file locations

### File List
**Modified:**
- `.aios-core/data/agent-config-requirements.yaml` (5 paths fixed)

**Deleted:**
- `.aios-core/core/data/agent-config-requirements.yaml`
- `.aios-core/core/data/workflow-patterns.yaml`
- `.aios-core/core/data/aios-kb.md`

### Verification Results
```
✅ Agent qa loaded in 18ms (target: <50ms) - No errors
✅ Agent po loaded in 11ms (target: <75ms) - No errors
✅ Agent sm loaded in 10ms (target: <75ms) - No errors
✅ Agent analyst loaded in 10ms (target: <100ms) - No errors
```
