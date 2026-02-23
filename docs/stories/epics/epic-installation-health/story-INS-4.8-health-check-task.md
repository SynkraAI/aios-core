# Story INS-4.8: Unify Health-Check — Doctor + core/health-check + Task

**Epic:** Installation Health & Environment Sync (INS-4)
**Wave:** 3 — Runtime Health & Upgrade Safety (P2)
**Points:** 2
**Agents:** @dev
**Status:** Draft
**Blocked By:** INS-4.1 (`aios doctor` rewrite must be complete first)
**Created:** 2026-02-23

**Executor Assignment:**
- **executor:** @dev
- **quality_gate:** @qa
- **quality_gate_tools:** [health-check task execution, aios doctor integration, constitution respect check, npm test]

---

## Story

**As a** framework agent (`@aios-master`) or developer,
**I want** `*health-check` to invoke `aios doctor` internally and provide contextual governance interpretation,
**so that** there is a single unified health diagnostic experience — not three separate mechanisms — and agents can trigger diagnostics with remediation guidance without duplicating check logic.

### Context

Currently three overlapping mechanisms exist:

1. **`aios doctor`** (CLI) — `bin/aios.js` `runDoctor()` — basic 5 checks, contract bug (INS-4.1 will fix this to 12 checks)
2. **`core/health-check/index.js`** — a health-check engine in `.aios-core/core/health-check/` (referenced in settings.json deny rules, so it exists)
3. **`health-check.yaml` task** — in `.aios-core/development/tasks/` with alias `*doctor` — agent-facing task

**Codex Finding (MEDIO):** Conflicting semantics. Task already has `*doctor` alias which conflicts with the CLI `aios doctor`. INS-4.8 must clarify the boundary: `aios doctor` = CLI tool (standalone, technical output); `*health-check` = agent task (contextual, governance-aware, can fix).

**This story's scope:**
1. Update `health-check.yaml` task to call `aios doctor` (via Bash tool) internally rather than having its own checks
2. Add governance interpretation layer (translate FAIL/WARN into agent-appropriate remediation guidance)
3. Remove the `*doctor` alias from the task (to avoid confusion with CLI `aios doctor`)
4. Do NOT create a third check mechanism — unify by reusing INS-4.1 output

---

## Acceptance Criteria

### AC1: Task Calls aios doctor Internally
- [ ] `.aios-core/development/tasks/health-check.yaml` task instructions tell the agent to run `aios doctor --json` via Bash tool
- [ ] Task parses JSON output from `aios doctor` and interprets it
- [ ] Task does NOT have its own list of health checks (delegates entirely to `aios doctor`)

### AC2: Governance Interpretation Layer
- [ ] For each FAIL item from `aios doctor` output: task provides remediation command (e.g., `aios doctor --fix` or specific manual step)
- [ ] For each WARN item: task provides explanation in Constitution context (which Article is affected)
- [ ] Remediation guidance respects Constitution (Article I: CLI First, Article IV: No Invention — no invented fixes)

### AC3: *doctor Alias Removed
- [ ] `health-check.yaml` no longer has `alias: *doctor` (to avoid confusion with CLI command)
- [ ] Any documentation referencing `*doctor` (task) is updated to `*health-check`

### AC4: core/health-check Module Clarified
- [ ] Document the relationship between `core/health-check/index.js` and `aios doctor` in Dev Notes
- [ ] If `core/health-check/index.js` is called by `aios doctor` internally, note it
- [ ] If `core/health-check/index.js` is a separate/deprecated mechanism, add a comment in the file pointing to `aios doctor` as the primary interface (do NOT delete the module)

### AC5: Task Executable by Agent
- [ ] `@aios-master *health-check` produces a report with: PASS/WARN/FAIL summary, governance interpretation, remediation steps
- [ ] Task works via Bash tool (Claude Code native) — no shell dependency beyond `node`
- [ ] Task output format is human-readable markdown (not raw JSON)

### AC6: Regression Test Coverage
- [ ] Unit test: health-check task parses `aios doctor --json` output correctly
- [ ] Test: FAIL item → remediation command present in output
- [ ] Test: `*doctor` alias no longer present in task definition
- [ ] `npm test` passes with zero new failures

---

## Tasks / Subtasks

### Task 1: Audit Existing Mechanisms (AC4)
- [ ] 1.1 Read `.aios-core/development/tasks/health-check.yaml` — understand current task definition and `*doctor` alias
- [ ] 1.2 Read `.aios-core/core/health-check/index.js` — understand what this module does; is it called by `aios doctor`?
- [ ] 1.3 Read `bin/aios.js` `runDoctor()` — does it use `core/health-check/index.js` internally?
- [ ] 1.4 Document: what is the current relationship between these 3 mechanisms?

### Task 2: Update health-check.yaml Task (AC1, AC2, AC3)
- [ ] 2.1 Replace current task body with instructions to run `aios doctor --json` via Bash tool
- [ ] 2.2 Add interpretation layer: for each check result, map to Constitution article and remediation
- [ ] 2.3 Remove `alias: *doctor` from task definition
- [ ] 2.4 Update task description to clearly state: "invokes `aios doctor` internally, adds governance context"

### Task 3: Build Governance Interpretation Map (AC2)
- [ ] 3.1 Map each check name to Constitution article:
  - `settings-json` → Article II (Agent Authority) — boundary protection
  - `rules-files` → Article II — agent authority rules
  - `agent-memory` → Article II — agent identity
  - `entity-registry` → Article III (Story-Driven Development) — code intelligence
  - `git-hooks` → Article V (Quality First) — quality gates
  - `core-config` → Article I (CLI First) — configuration integrity
  - `claude-md` → Article II — agent context
  - `ide-sync` → Article II — agent consistency
  - `node-version` → Article V — runtime requirements
- [ ] 3.2 Map each check to remediation command (if fixable: `aios doctor --fix`, if manual: specific instruction)
- [ ] 3.3 Write governance interpretation into task instructions

### Task 4: Document core/health-check Relationship (AC4)
- [ ] 4.1 Read `core/health-check/index.js` — understand its role
- [ ] 4.2 Add comment/note clarifying its role relative to `aios doctor`
- [ ] 4.3 If deprecated/redundant, note in Dev Notes (do NOT delete the module — deny rules protect it anyway)

### Task 5: Validate Task Execution (AC5)
- [ ] 5.1 Test: activate `@aios-master`, run `*health-check` → verify output format
- [ ] 5.2 Verify output: PASS/WARN/FAIL summary + governance notes + remediation steps
- [ ] 5.3 Verify: `aios doctor --json` called correctly via Bash tool in task

### Task 6: Tests (AC6)
- [ ] 6.1 Unit test: task instructions parse JSON output from `aios doctor` correctly
- [ ] 6.2 Test: FAIL check → remediation present in task output
- [ ] 6.3 Test: `*doctor` alias not in `health-check.yaml`
- [ ] 6.4 `npm test` regression check

---

## Dev Notes

### Key Files (Read These First)

| File | Purpose |
|------|---------|
| `.aios-core/development/tasks/health-check.yaml` | Task to update — read current body and alias |
| `.aios-core/core/health-check/index.js` | Existing health-check module — understand and document relationship |
| `bin/aios.js` lines 350-450 | Understand `runDoctor()` — does it use `core/health-check`? |

### Three-Mechanism Problem (Codex Finding M3)

| Mechanism | Location | Audience | Current Status |
|-----------|----------|----------|---------------|
| `aios doctor` | `bin/aios.js` | CLI users | Has contract bug (INS-4.1 fixes) |
| `core/health-check/index.js` | `.aios-core/core/` | Internal/programmatic | Exists, role unclear |
| `health-check.yaml` task | `.aios-core/development/tasks/` | Agents via `*health-check` | Has `*doctor` alias causing confusion |

**After INS-4.1 + INS-4.8:**
- `aios doctor` = CLI tool, 12 checks, `--fix/--json/--dry-run`
- `core/health-check/index.js` = internal module, potentially called by `aios doctor`
- `*health-check` task = agent interface that wraps `aios doctor --json` with governance context

### Governance Interpretation Format

The task output to the agent should look like:

```markdown
## AIOS Health Check

Summary: 8 PASS | 1 WARN | 1 FAIL | 1 INFO

### Issues Requiring Attention

**[FAIL] rules-files** — Missing 2 of 7 rules
- Constitution Impact: Article II (Agent Authority) — Agents operate without authority rules context
- Remediation: `aios doctor --fix` or manually copy rules from source

**[WARN] claude-md** — Missing sections: Boundary
- Constitution Impact: Article II — Agents lack boundary context in their system prompt
- Remediation: `aios doctor --fix` to add missing CLAUDE.md sections

### All Checks
| Check | Status | Note |
|-------|--------|------|
| settings-json | PASS | 62 deny rules |
| rules-files | FAIL | 5/7 present |
| ... | | |
```

### L2 Note: health-check.yaml is a Framework File

`.aios-core/development/tasks/health-check.yaml` is L2 (framework template). In this project we are in framework-contributor mode — editable. The update to this file is a framework improvement, not project customization.

### Testing

**Test Location:** `packages/installer/tests/unit/` and manual agent testing

**Key Scenarios:**
1. Task parses `aios doctor --json` output format
2. FAIL/WARN items have governance interpretation and remediation
3. `*doctor` alias removed from task
4. `@aios-master *health-check` produces readable markdown report

---

## CodeRabbit Integration

**Story Type:** Architecture (unification) + Integration (task + CLI)
**Complexity:** Low-Medium (2 pts — task update + relationship documentation)

**Quality Gates:**
- [ ] Pre-Commit (@dev): Run before marking story complete
- [ ] Pre-PR (@qa): Task execution validation, governance correctness, constitution respect

**Self-Healing Configuration:**
- **Mode:** light
- **Max Iterations:** 2
- **Timeout:** 15 minutes
- **Severity Filter:** CRITICAL only

**Predicted Behavior:**
- CRITICAL issues: auto_fix (up to 2 iterations)
- HIGH issues: document_only

**Focus Areas (Primary):**
- No third mechanism created: task delegates to `aios doctor --json`, no new checks
- Constitution respect: remediation guidance cites correct Articles

**Focus Areas (Secondary):**
- *doctor alias removed: no naming conflict with CLI `aios doctor`
- Task output format: readable markdown, not raw JSON

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
| 2026-02-23 | @sm (River) | Story drafted from Epic INS-4 handoff secao 3.8 + Codex Finding M3 (unificar, nao criar terceiro mecanismo, sizing 3→2 pts) |
