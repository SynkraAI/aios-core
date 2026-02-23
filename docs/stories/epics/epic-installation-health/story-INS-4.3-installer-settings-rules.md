# Story INS-4.3: Installer: Wire Generator + Validate Post-Install

**Epic:** Installation Health & Environment Sync (INS-4)
**Wave:** 2 — Installer Integration (P1)
**Points:** 2
**Agents:** @dev
**Status:** Draft
**Blocked By:** INS-4.2 (Settings.json Generator must be merged first)
**Created:** 2026-02-23

**Executor Assignment:**
- **executor:** @dev
- **quality_gate:** @devops
- **quality_gate_tools:** [aios doctor --json after fresh install, manual install scenario, npm test]

---

## Story

**As a** new user running `npx aios-core install`,
**I want** the installer to automatically generate `.claude/settings.json` boundary rules and confirm they are present after installation,
**so that** every fresh install has L1/L2 boundary protection without any manual post-install steps.

### Context

**What is already done (Codex Finding A2):**
- `packages/installer/src/wizard/ide-config-generator.js` lines 286 and 530 already copy `.claude/rules/*.md` files
- Lines 539-548 already copy **Claude Code hooks** to `.claude/hooks/` (SYNAPSE engine) — these are NOT git hooks to `.husky/`
- Line 550 and 711 create `.claude/settings.local.json`

**What is NOT done (the actual gap):**
- The installer does NOT call `generate-settings-json.js` to generate `permissions.deny/allow` in `.claude/settings.json`
- The `post-install-validator.js` does NOT validate that `settings.json` has boundary rules

**This story is scoped to the residual gap only:**
1. Wire the INS-4.2 generator into the wizard flow (one function call)
2. Add boundary-rules validation to the post-install validator
3. Update the install summary to report settings.json generation status

---

## Acceptance Criteria

### AC1: Generator Wired into Installer
- [ ] `packages/installer/src/wizard/index.js` calls `generate-settings-json.js` after `.aios-core/` is copied
- [ ] Call happens before post-install validation so validator can check the result
- [ ] Generator is called with correct `projectRoot` (the target installation directory, not the source)
- [ ] If generator throws, installer logs warning but does NOT abort installation (graceful degradation)

### AC2: Post-Install Validator Updated
- [ ] `packages/installer/src/installer/post-install-validator.js` validates `.claude/settings.json` has `permissions.deny` array with at least 1 entry when `frameworkProtection: true`
- [ ] Validation failure is reported as WARN (not ERROR) — settings.json generation failure should not block install

### AC3: Install Summary Reports Settings.json Status
- [ ] Install summary output includes: `settings.json: generated (N deny rules)` or `settings.json: generation failed (see warning above)`

### AC4: Regression Test
- [ ] Existing wizard tests in `packages/installer/tests/` still pass
- [ ] Add test: mock `generate-settings-json.js` call, verify it is invoked during install flow
- [ ] `npm test` passes with zero new failures

---

## Tasks / Subtasks

### Task 1: Read Existing Wizard Flow (AC1)
- [ ] 1.1 Read `packages/installer/src/wizard/index.js` lines 1-861 — identify the step after `.aios-core/` copy where generator call should be inserted
- [ ] 1.2 Read `packages/installer/src/installer/aios-core-installer.js` — understand how `.aios-core/` copy is orchestrated; identify post-copy hook point
- [ ] 1.3 Identify the exact line in wizard where new generator call should be added (after copy, before validation)

### Task 2: Wire Generator Call (AC1)
- [ ] 2.1 Add `require` for `generate-settings-json.js` at top of wizard `index.js`
- [ ] 2.2 Insert generator call at identified hook point: `await generator.generate(targetProjectRoot, config)`
- [ ] 2.3 Wrap call in try/catch: log warning on error, continue install
- [ ] 2.4 Pass correct `targetProjectRoot` (the directory being installed into)

### Task 3: Update Post-Install Validator (AC2)
- [ ] 3.1 Read `packages/installer/src/installer/post-install-validator.js` — understand existing validation structure
- [ ] 3.2 Add validation check: `settings.json` exists at `{targetRoot}/.claude/settings.json`
- [ ] 3.3 Add validation check: if `frameworkProtection: true`, `permissions.deny` array is non-empty
- [ ] 3.4 Report as WARN (not ERROR) — install continues even if check fails

### Task 4: Update Install Summary (AC3)
- [ ] 4.1 Locate install summary output in wizard flow
- [ ] 4.2 Add settings.json status line to summary
- [ ] 4.3 Report deny rule count if generation succeeded, or error message if failed

### Task 5: Tests (AC4)
- [ ] 5.1 Add unit test: verify generator is called with correct arguments during install flow
- [ ] 5.2 Add unit test: generator failure → install continues (no throw propagation)
- [ ] 5.3 Run existing `packages/installer/tests/` — verify all pass
- [ ] 5.4 `npm test` regression check

---

## Dev Notes

### What Is Already Implemented (Do Not Re-implement)

Codex analysis confirmed `ide-config-generator.js` already handles:
- **Rules files copy** (lines 286, 530): `.claude/rules/*.md` from source to target
- **Claude Code hooks copy** (lines 539-548): copies **Claude Code hooks** (SYNAPSE engine) to `.claude/hooks/` — NOT git hooks to `.husky/`
- **settings.local.json** (lines 550, 711): Claude Code local settings

**This story ONLY adds:** calling `generate-settings-json.js` for `permissions.deny/allow` in the main `settings.json`.

### Key Files (Read These First)

| File | Lines | Purpose |
|------|-------|---------|
| `packages/installer/src/wizard/index.js` | full (861) | Add generator call here — find post-copy hook point |
| `packages/installer/src/installer/aios-core-installer.js` | full (426) | How `.aios-core/` is copied — find injection point |
| `packages/installer/src/installer/post-install-validator.js` | full (1522) | Add settings.json boundary check here |
| `packages/installer/src/wizard/ide-config-generator.js` | lines 286, 530, 541, 661, 550, 711 | Already does rules+hooks copy — verify before adding new calls |

### Generator Integration Pattern

```javascript
// In wizard/index.js (after .aios-core/ copy step)
const settingsGenerator = require('../../../.aios-core/infrastructure/scripts/generate-settings-json');
try {
  await settingsGenerator.generate(targetProjectRoot);
  log.success('settings.json boundary rules generated');
} catch (err) {
  log.warn(`settings.json generation failed: ${err.message} — run 'aios doctor --fix' post-install`);
}
```

### Testing

**Test Location:** `packages/installer/tests/unit/` and `packages/installer/tests/integration/`

**Key Scenarios:**
1. Fresh install: generator called → settings.json has deny rules → post-install validator PASS
2. Generator fails: install continues → validator reports WARN → summary shows failure message
3. Existing `wizard-detection.test.js` tests still pass

---

## CodeRabbit Integration

**Story Type:** Integration (wiring existing module into installer pipeline)
**Complexity:** Low (2 pts — focused wiring, not new logic)

**Quality Gates:**
- [ ] Pre-Commit (@dev): Run before marking story complete
- [ ] Pre-PR (@devops): Install flow safety check

**Self-Healing Configuration:**
- **Mode:** light
- **Max Iterations:** 2
- **Timeout:** 15 minutes
- **Severity Filter:** CRITICAL only

**Predicted Behavior:**
- CRITICAL issues: auto_fix (up to 2 iterations)
- HIGH issues: document_only

**Focus Areas (Primary):**
- Install flow safety: generator failure must NOT abort installation
- Correct `targetProjectRoot` passed (not source directory)

**Focus Areas (Secondary):**
- No duplication of already-implemented rules/hooks copy
- Post-install validator WARN (not ERROR) for settings.json issues

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
| 2026-02-23 | @sm (River) | Story drafted from Epic INS-4 handoff secao 3.3 + Codex Finding A2 (rules JA copiadas, reescopar para wiring only, sizing 3→2 pts) |
| 2026-02-23 | @sm (River) | [Codex Story Review] Narrativa de hooks corrigida: linhas 539-548 copiam Claude Code hooks para `.claude/hooks/` (SYNAPSE engine), NAO git hooks para `.husky/`. Context e Dev Notes atualizados. |
