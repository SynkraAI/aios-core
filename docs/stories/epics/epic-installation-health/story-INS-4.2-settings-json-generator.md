# Story INS-4.2: Settings.json Boundary Generator — Deny/Allow from Config

**Epic:** Installation Health & Environment Sync (INS-4)
**Wave:** 1 — Foundation (P0)
**Points:** 5
**Agents:** @dev
**Status:** Draft
**Blocked By:** —
**Created:** 2026-02-23

**Executor Assignment:**
- **executor:** @dev
- **quality_gate:** @architect
- **quality_gate_tools:** [manual boundary validation, idempotency test, frameworkProtection toggle test, npm test]

---

## Story

**As a** framework installer,
**I want** a deterministic generator that produces `.claude/settings.json` deny/allow rules from `core-config.yaml` boundary configuration,
**so that** every fresh install and upgrade produces a consistent, correct settings.json with full L1/L2 boundary protection without manual maintenance.

### Context

Currently, `.claude/settings.json` has ~60+ deny rules covering `.aios-core/core/` subdirectories, maintained manually. There is no generator script. The installer wizard (`packages/installer/src/wizard/index.js`) only writes `language` to `.claude/settings.json` (lines 120, 131, 506) — it never generates `permissions.deny/allow`.

**The Gap:** `core-config.yaml` lists 9 boundary paths in `boundary.protected`, but the actual `settings.json` requires ~60+ granular deny rules because Claude Code deny rules do not fully expand `**` globs over nested directories. The generator must expand the high-level config paths into the full set of granular deny rules.

**Codex Finding (CRITICO):** Generator does not exist anywhere in the installer. `packages/installer/src/wizard/generate-settings-json.js` — does not exist. Must be created from scratch.

---

## Acceptance Criteria

### AC1: Generator Script Created
- [ ] Script exists at `.aios-core/infrastructure/scripts/generate-settings-json.js`
- [ ] Script reads boundary config from `core-config.yaml` (`boundary.protected`, `boundary.exceptions`, `boundary.frameworkProtection`)
- [ ] Script is executable via `node .aios-core/infrastructure/scripts/generate-settings-json.js [projectRoot]`

### AC2: Deny Rules Expansion
- [ ] Generator expands 9 high-level glob paths from `core-config.yaml` into granular deny rules
- [ ] For each path in `boundary.protected`, generator creates deny rule strings in the format `"Edit(path)"` and `"Write(path)"` (no `MultiEdit` — not present in the real schema)
- [ ] The generated deny rules cover equivalent protection to the current manual `settings.json` (verify by diffing outputs)
- [ ] Allow rules generated from `boundary.exceptions` as strings `"Edit(path)"` and `"Write(path)"`

### AC3: frameworkProtection Toggle
- [ ] When `boundary.frameworkProtection: true` → generates full deny/allow rules (project mode)
- [ ] When `boundary.frameworkProtection: false` → generates `settings.json` with NO boundary deny rules (framework-contributor mode), preserving other settings
- [ ] Both modes produce valid JSON output

### AC4: Idempotent Operation
- [ ] Running generator N times on same project produces identical `settings.json` (no duplicates, no drift)
- [ ] Generator preserves user sections outside the AIOS-managed `permissions` block
- [ ] Verify: run twice → git diff shows no changes

### AC5: Integration Points
- [ ] Generator callable as Node.js module: `const gen = require('./generate-settings-json'); gen.generate(projectRoot, config)`
- [ ] Generator callable as CLI: `node generate-settings-json.js /path/to/project`
- [ ] Called by `aios doctor --fix` (INS-4.1) to fix missing/stale settings.json
- [ ] Called by installer (INS-4.3) during install/upgrade flow

### AC6: Regression Test Coverage
- [ ] Test suite in `packages/installer/tests/unit/generate-settings-json/`
- [ ] Tests cover: `frameworkProtection: true` output, `frameworkProtection: false` output, idempotency (run twice, same output), section preservation (user content outside generated block preserved)
- [ ] `npm test` passes with zero new failures

---

## Tasks / Subtasks

### Task 1: Understand Current State (AC1)
- [ ] 1.1 Read `core-config.yaml` `boundary` section — list all 9 protected paths and 2 exception paths
- [ ] 1.2 Read current `.claude/settings.json` — count deny rules, understand structure, identify user-customized sections
- [ ] 1.3 Read `packages/installer/src/wizard/index.js` lines 100-140 and 500-520 — understand how settings.json is currently written (only `language`)
- [ ] 1.4 Document the expansion logic needed: which core-config paths expand to how many deny rules

### Task 2: Design Generator Architecture (AC1, AC2, AC4)
- [ ] 2.1 Design section delimiter strategy for generated vs user content in JSON
- [ ] 2.2 Design path expansion algorithm: `core-config boundary.protected` → deny rule array
- [ ] 2.3 Design merge strategy: read existing `settings.json`, replace generated section, preserve user sections
- [ ] 2.4 Document generator API: `generate(projectRoot, config?) => void` (writes settings.json)

### Task 3: Implement Generator (AC1, AC2, AC3)
- [ ] 3.1 Create `.aios-core/infrastructure/scripts/generate-settings-json.js`
- [ ] 3.2 Implement `readBoundaryConfig(projectRoot)` — reads `core-config.yaml`, extracts boundary section
- [ ] 3.3 Implement `expandProtectedPaths(paths)` — expands globs to deny rules array of strings `"Edit(path)"` and `"Write(path)"` (no MultiEdit — not in real schema)
- [ ] 3.4 Implement `expandExceptionPaths(paths)` — generates allow rules array of strings `"Edit(path)"` and `"Write(path)"`
- [ ] 3.5 Implement `generatePermissions(boundary)` — assembles `{ deny: [...], allow: [...] }` from expanded rules
- [ ] 3.6 Handle `frameworkProtection: false` — produce empty permissions or minimal set
- [ ] 3.7 Implement `writeSettingsJson(projectRoot, permissions)` — reads existing file, replaces generated section, writes back

### Task 4: Idempotency (AC4)
- [ ] 4.1 Implement idempotency guard: generate → compare → only write if changed
- [ ] 4.2 Test: run generator twice on same project root → `git diff` shows no change
- [ ] 4.3 Test: user-set `language` key preserved after generator run

### Task 5: Module Export and CLI (AC5)
- [ ] 5.1 Add `module.exports = { generate, readBoundaryConfig, expandProtectedPaths }` for programmatic use
- [ ] 5.2 Add CLI entry point: `if (require.main === module)` block that reads `process.argv[2]` as projectRoot
- [ ] 5.3 Test CLI invocation: `node .aios-core/infrastructure/scripts/generate-settings-json.js .` produces valid output

### Task 6: Tests (AC6)
- [ ] 6.1 Create `packages/installer/tests/unit/generate-settings-json/` directory
- [ ] 6.2 Test: `frameworkProtection: true` → output has deny rules covering all 9 protected paths
- [ ] 6.3 Test: `frameworkProtection: false` → output has no boundary deny rules
- [ ] 6.4 Test: idempotency — generate twice, verify identical output (JSON.stringify comparison)
- [ ] 6.5 Test: user content preservation — pre-populate settings.json with custom `"language": "pt"` key, run generator, verify key preserved
- [ ] 6.6 Run `npm test` — verify zero new failures

---

## Dev Notes

### Key Files (Read These First)

| File | Lines | Purpose |
|------|-------|---------|
| `core-config.yaml` | lines 358-385 | `boundary` section — the source of truth for generator input |
| `.claude/settings.json` | full file | Current manually-maintained settings — generator must produce equivalent deny/allow |
| `packages/installer/src/wizard/index.js` | 100-140, 500-520 | Where generator will be integrated (INS-4.3). Understand current settings.json write logic |
| `.aios-core/infrastructure/scripts/ide-sync/index.js` | full | Style reference — follow same module export pattern |

### Generator Input (core-config.yaml boundary section)

```yaml
boundary:
  frameworkProtection: true
  protected:
    - .aios-core/core/**
    - .aios-core/development/tasks/**
    - .aios-core/development/templates/**
    - .aios-core/development/checklists/**
    - .aios-core/development/workflows/**
    - .aios-core/infrastructure/**
    - .aios-core/constitution.md
    - bin/aios.js
    - bin/aios-init.js
  exceptions:
    - .aios-core/data/**
    - .aios-core/development/agents/*/MEMORY.md
```

### Expected Output Structure

The current `.claude/settings.json` has a `permissions` object with string entries in the format `"Tool(path)"`. Generator should produce the `permissions.deny` and `permissions.allow` arrays. Example partial output:

```json
{
  "permissions": {
    "deny": [
      "Edit(.aios-core/core/code-intel/**)",
      "Write(.aios-core/core/code-intel/**)",
      "Edit(.aios-core/core/docs/**)",
      "Write(.aios-core/core/docs/**)"
    ],
    "allow": [
      "Edit(.aios-core/data/**)",
      "Write(.aios-core/data/**)",
      "Edit(.aios-core/development/agents/*/MEMORY.md)",
      "Write(.aios-core/development/agents/*/MEMORY.md)"
    ]
  }
}
```

**CRITICAL:** The real `.claude/settings.json` uses **strings** in the format `"Tool(path)"`, NOT objects `{ tool, path }`. There is NO `MultiEdit` tool in the schema — only `Edit` and `Write`. The generator must produce this string format.

### Expansion Strategy

`core-config.yaml` lists 9 high-level paths. Claude Code deny rules use **string** entries in the format `"Tool(path)"` — NOT objects. For each protected glob:
- Add deny string `"Edit(path)"`
- Add deny string `"Write(path)"`

There is NO `MultiEdit` in the real schema — do NOT add it.

For exceptions: add allow strings `"Edit(path)"` and `"Write(path)"` with same pattern.

The current `.claude/settings.json` has ~60+ deny rules as strings because each subdirectory of `.aios-core/core/` gets its own pair of `Edit` + `Write` strings.

### Codex Finding: Settings.json Has ~60+ Rules as Strings

The handoff architect noted "~40 deny rules, ~5 allows". Codex analysis found settings.json actually has ~60+ deny rules. The discrepancy is because the current rules cover individual subdirectories of `.aios-core/core/` rather than just the top-level glob. All entries are **strings** in the format `"Edit(path)"` or `"Write(path)"`. The generator must produce equivalent coverage in this string format — verify against the real file.

### Testing

**Test Location:** `packages/installer/tests/unit/generate-settings-json/`

**Key Scenarios:**
1. `frameworkProtection: true` — verify deny rules present and cover all 9 protected paths
2. `frameworkProtection: false` — verify NO deny rules in output
3. Idempotency: run generator twice on same project root, compare JSON outputs
4. Section preservation: user-set `language: "pt"` key must survive generator run
5. `npm test` regression pass

---

## CodeRabbit Integration

**Story Type:** Architecture (new module) + Infrastructure
**Complexity:** High (new generator, path expansion logic, idempotency, settings.json ownership contract)

**Quality Gates:**
- [ ] Pre-Commit (@dev): Run before marking story complete — focus on idempotency, path coverage correctness
- [ ] Pre-PR (@architect): Architecture review — boundary correctness, settings.json ownership contract

**Self-Healing Configuration:**
- **Mode:** light
- **Max Iterations:** 2
- **Timeout:** 15 minutes
- **Severity Filter:** CRITICAL only

**Predicted Behavior:**
- CRITICAL issues: auto_fix (up to 2 iterations)
- HIGH issues: document_only (noted in Dev Notes)

**Focus Areas (Primary):**
- Boundary correctness: generated deny rules match expected coverage from core-config.yaml
- Idempotency: running twice produces no diff
- `frameworkProtection: false` mode: produces no deny rules (never blocks framework contributors)

**Focus Areas (Secondary):**
- Section ownership: user customizations outside generated block preserved
- Module export pattern: programmatic API works correctly for INS-4.3 and INS-4.1 callers

---

## Dev Agent Record

### Agent Model Used
_To be filled by @dev_

### Debug Log References
_To be filled by @dev_

### Completion Notes
_To be filled by @dev_

### File List
_To be filled by @dev_

---

## QA Results
_To be filled by @qa_

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-23 | @sm (River) | Story drafted from Epic INS-4 handoff (architect secao 3.2) + Codex Critical Analysis findings C1 (gerador inexistente), sizing elevado 3→5 pts por Codex |
| 2026-02-23 | @sm (River) | [Codex Story Review] Schema settings.json corrigido: entries sao strings `"Edit(path)"` e `"Write(path)"`, NAO objetos `{ tool, path }`. MultiEdit removido (nao existe no schema real). Expected Output Structure e Expansion Strategy atualizados. Contagem confirmada ~60+ rules como strings. Tasks 3.3 e 3.4 corrigidas. |
