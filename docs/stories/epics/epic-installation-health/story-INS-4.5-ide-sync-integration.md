# Story INS-4.5: IDE Sync Integration — via API Programatica

**Epic:** Installation Health & Environment Sync (INS-4)
**Wave:** 2 — Installer Integration (P1)
**Points:** 3
**Agents:** @dev + @devops
**Status:** Draft
**Blocked By:** —
**Created:** 2026-02-23

**Executor Assignment:**
- **executor:** @dev (implementation), @devops (install flow validation)
- **quality_gate:** @qa
- **quality_gate_tools:** [multi-ide validation, agent format check, npm test, aios doctor ide-sync check]

---

## Story

**As a** developer installing AIOS into a project with multiple IDEs configured,
**I want** the installer to automatically call the IDE sync engine after copying agents,
**so that** agent definitions are transformed to the correct format for each configured IDE (Claude Code, Cursor, Codex, etc.) without requiring a manual post-install sync step.

### Context

`.aios-core/infrastructure/scripts/ide-sync/index.js` (line 534) exports `commandSync` and `commandValidate` functions — a full programmatic API. The installer wizard does NOT call this. As a result, agents copied to `.claude/commands/AIOS/agents/` by the installer remain in raw format, and IDE-specific transformations (e.g., `.mdc` for Cursor) are never applied.

**Codex Finding (MEDIO):** `ide-sync/index.js` exports programmatic functions (`commandSync`, `commandValidate`) at line 534. Integration is viable via `require()` + function call. Risk is cwd/side-effects if called without proper adapter.

**What needs to happen:**
1. After agents are copied during install, call `commandSync(options)` programmatically
2. Report sync result in install summary
3. If sync fails, log warning but do NOT abort installation

---

## Acceptance Criteria

### AC1: IDE Sync Called During Install via Adapter Pattern
- [ ] Installer calls `commandSync({ quiet: true })` (or `{ ide, dryRun, verbose, quiet }`) using the adapter pattern — `commandSync` uses `process.cwd()` internally, so caller must `process.chdir(targetRoot)` before the call and restore cwd in `finally`
- [ ] Call uses the programmatic API (NOT `child_process.exec` / shell out)
- [ ] Adapter pattern implementation: save current cwd, `process.chdir(targetProjectRoot)`, call `commandSync`, restore cwd in `finally` block
- [ ] IDE list is managed internally by `commandSync` (reads from config at `process.cwd()`) — do NOT pass IDE list as parameter

### AC2: Multi-IDE Validation
- [ ] IDE sync runs for all IDEs configured in the target project's `core-config.yaml` (handled internally by `commandSync`)
- [ ] `aios doctor ide-sync` check (from INS-4.1) reports PASS after install

### AC3: Graceful Failure
- [ ] If `commandSync` throws, installer logs warning and continues (does NOT abort)
- [ ] Warning message includes: which step failed, suggestion to run `aios doctor --fix`
- [ ] Install summary includes IDE sync status: `ide-sync: synced (N agents, M IDEs)` or `ide-sync: failed (see warning)`

### AC4: Validate Sync Output
- [ ] After sync, call `commandValidate` using the same adapter pattern (save/chdir/finally restore)
- [ ] Confirm whether `commandValidate` also uses `process.cwd()` by reading the source — if so, apply same adapter; if it accepts explicit options, document the actual signature
- [ ] Validation result included in install summary
- [ ] If validation finds drift, logs as WARN (not ERROR)

### AC5: Regression Test Coverage
- [ ] Unit test: verify `commandSync` is called with correct arguments during install
- [ ] Unit test: `commandSync` failure → install continues (no throw propagation)
- [ ] Unit test: `commandValidate` called after sync
- [ ] `npm test` passes with zero new failures

---

## Tasks / Subtasks

### Task 1: Understand IDE Sync API (AC1)
- [ ] 1.1 Read `.aios-core/infrastructure/scripts/ide-sync/index.js` lines 530-540 — understand `commandSync` and `commandValidate` signatures
- [ ] 1.2 Read `ide-sync/agent-parser.js` — understand expected input format for agents
- [ ] 1.3 Read `ide-sync/validator.js` — understand what `commandValidate` checks
- [ ] 1.4 Read transformers: `transformers/claude-code.js`, `transformers/cursor.js` — understand output formats
- [ ] 1.5 Document: what arguments does `commandSync` expect? What does it return?

### Task 2: Understand Installer Injection Point (AC1)
- [ ] 2.1 Read `packages/installer/src/wizard/index.js` — find where agents are copied (after `.aios-core/` copy)
- [ ] 2.2 Read `packages/installer/src/wizard/ide-config-generator.js` — understand relationship with ide-sync (is it a duplicate? complementary?)
- [ ] 2.3 Identify correct injection point: after agent copy, before post-install validation

### Task 3: Implement IDE Sync Call via Adapter Pattern (AC1, AC2)
- [ ] 3.1 Add `require` for `ide-sync/index.js` in wizard `index.js`
- [ ] 3.2 Implement adapter pattern: `commandSync` uses `process.cwd()` internally — do NOT pass `projectRoot` or `ides` as parameters
- [ ] 3.3 Call via adapter:
  ```javascript
  const savedCwd = process.cwd();
  try {
    process.chdir(targetProjectRoot);
    await commandSync({ quiet: true });
  } finally {
    process.chdir(savedCwd);
  }
  ```
- [ ] 3.4 Wrap outer try/catch: log warning on error, continue install

### Task 4: Validate and Report (AC3, AC4)
- [ ] 4.1 After sync, call `commandValidate({ projectRoot: targetRoot })`
- [ ] 4.2 Parse validation result and include in install summary
- [ ] 4.3 Update install summary output: `ide-sync: synced (N agents, M IDEs)` or failure message

### Task 5: Tests (AC5)
- [ ] 5.1 Add unit test: adapter pattern verified — cwd changed to targetProjectRoot before `commandSync`, restored in finally (no `projectRoot` param)
- [ ] 5.2 Add unit test: sync failure → warning logged → install continues, cwd still restored
- [ ] 5.3 Add unit test: `commandValidate` called after successful sync with same adapter pattern
- [ ] 5.4 Run `npm test` — verify zero new failures

---

## Dev Notes

### Key Files (Read These First)

| File | Lines | Purpose |
|------|-------|---------|
| `.aios-core/infrastructure/scripts/ide-sync/index.js` | ~540 (especially 530-540) | Programmatic API: `commandSync`, `commandValidate` exports |
| `.aios-core/infrastructure/scripts/ide-sync/agent-parser.js` | ~295 | Agent format parser |
| `.aios-core/infrastructure/scripts/ide-sync/validator.js` | ~273 | Validation logic |
| `.aios-core/infrastructure/scripts/ide-sync/transformers/` | 4 files | IDE-specific transformers (claude-code, cursor, antigravity, github-copilot) |
| `packages/installer/src/wizard/index.js` | full (861) | Where to inject the sync call |
| `packages/installer/src/wizard/ide-config-generator.js` | full | Understand what it already does vs ide-sync |

### Relationship: ide-config-generator vs ide-sync

These are two different systems:
- `ide-config-generator.js` — generates IDE config files (settings, rules, hooks) from wizard flow
- `ide-sync/index.js` — specifically syncs agent definitions across IDEs with format transformation

They are complementary, NOT duplicates. The installer already calls `ide-config-generator.js`. This story adds the `ide-sync` call.

### IDE Sync API Pattern (Confirmed — Adapter Required)

**Confirmed from source** (`ide-sync/index.js` line 213-214): `commandSync(options)` calls `const projectRoot = process.cwd()` internally — it does NOT accept `projectRoot` or `ides` as parameters. The real accepted options are `{ ide, dryRun, verbose, quiet }`.

The correct pattern is the **adapter pattern** — change cwd before calling, restore in finally:

```javascript
const { commandSync, commandValidate } = require('/path/to/ide-sync/index.js');

const savedCwd = process.cwd();
try {
  process.chdir(targetProjectRoot);
  await commandSync({ quiet: true });
} finally {
  process.chdir(savedCwd);
}
```

**NEVER call** `commandSync({ projectRoot: targetProjectRoot, ides: ... })` — those parameters do not exist in the real API.

### CWD Side-Effect Risk (CONFIRMED, Not Hypothetical)

The cwd side-effect risk is **CONFIRMED** — `commandSync` reads `process.cwd()` at line 214 and uses it for all path resolution. Without the adapter pattern, the sync will operate on the wrong directory. The adapter pattern (save/chdir/finally restore) is the required mitigation.

### Testing

**Test Location:** `packages/installer/tests/unit/`

**Key Scenarios:**
1. Adapter pattern: cwd changed to targetProjectRoot before `commandSync` call (no `projectRoot` param), restored in finally
2. Sync failure: warning logged, no throw propagation, install continues, cwd still restored
3. `commandValidate` called after sync with same adapter pattern
4. Multi-IDE: handled internally by `commandSync` based on target project's core-config.yaml

---

## CodeRabbit Integration

**Story Type:** Integration (IDE sync wiring)
**Complexity:** Medium (3 pts — adapter pattern + cwd safety + error handling + commandValidate contract verification)

**Quality Gates:**
- [ ] Pre-Commit (@dev): Run before marking story complete
- [ ] Pre-PR (@qa): Multi-IDE validation check, agent format validation

**Self-Healing Configuration:**
- **Mode:** light
- **Max Iterations:** 2
- **Timeout:** 15 minutes
- **Severity Filter:** CRITICAL only

**Predicted Behavior:**
- CRITICAL issues: auto_fix (up to 2 iterations)
- HIGH issues: document_only

**Focus Areas (Primary):**
- CWD safety: no global process.cwd() mutation
- Graceful failure: sync failure never aborts installation
- Correct projectRoot: target directory, not source

**Focus Areas (Secondary):**
- IDE list filtering: only enabled IDEs (`ide.configs.{name}: true`) are synced
- commandSync vs commandValidate: both called in correct order

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
| 2026-02-23 | @sm (River) | Story drafted from Epic INS-4 handoff secao 3.5 + Codex Finding M2 (viavel via require, risco cwd/side-effects) |
| 2026-02-23 | @sm (River) | [Codex Story Review] Contrato commandSync corrigido: NAO aceita projectRoot nem ides — usa process.cwd() internamente (confirmado linha 214). AC1 reescrito com adapter pattern. AC2 ajustado (IDE list interna ao commandSync). AC4: commandValidate requer verificacao de contrato. Task 3.2/3.3 reescritas com adapter. Dev Notes IDE Sync API Pattern e CWD Side-Effect Risk atualizados — risco CONFIRMADO. Sizing 2→3 pts (adapter pattern adiciona complexidade). |
