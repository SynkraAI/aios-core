# Core Super Update Lifecycle Audit

**Audit date:** 2026-07-09
**Remediation story:** CORE-SU.R1

## Canonical Contract

- Lifecycle: `Draft → Ready → InProgress → InReview → Done`.
- PO owns `Draft → Ready` after a GO validation.
- Dev owns `Ready → InProgress → InReview`.
- QA owns approved `InReview → Done` and failed `InReview → InProgress`.
- `close-story` is administrative and cannot change lifecycle status.
- Source contract: `.claude/rules/story-lifecycle.md` and
  `.aiox-core/development/tasks/qa-gate.md`.
- Projected skills are generated from `.aiox-core/development/skills/` and must
  pass IDE sync/parity checks.

## Historical Baseline

The stories introduced by the original update were committed with `Status:
Done`; the repository does not contain trustworthy contemporaneous timestamps
for every intermediate transition. This audit does not invent those events or
reopen completed work. It establishes the minimum auditable baseline from
observable artifacts and records the gap as historical provenance.

| Story       | Current status | Observable evidence                   | Audit result               |
| ----------- | -------------- | ------------------------------------- | -------------------------- |
| CORE-SU.0   | Done           | DoD, File List, focused harness tests | Baseline Change Log added  |
| CORE-SU.A1  | Done           | Tests and existing Change Log         | Existing baseline retained |
| CORE-SU.A2  | Done           | Decision, DoD, ConfigCache tests      | Baseline Change Log added  |
| CORE-SU.A3  | Done           | Guard modules and tests               | Baseline Change Log added  |
| CORE-SU.A4  | Done           | Scanner, doctor, npm command, tests   | Baseline Change Log added  |
| CORE-SU.C2  | Done           | Executor/QG roles, tests, Change Log  | Existing baseline retained |
| CORE-SU.C3  | Done           | Executor/QG roles, tests, Change Log  | Existing baseline retained |
| CORE-SU.C4  | Done           | Executor/QG roles, tests, Change Log  | Existing baseline retained |
| CORE-SU.D1  | Done           | Sync contract and Change Log          | Existing baseline retained |
| CORE-SU.E1  | Done           | Constitution artifacts and Change Log | Existing baseline retained |
| CORE-SU.F1  | Done           | Executor/QG roles, tests, Change Log  | Existing baseline retained |
| CORE-SU.MB  | Done           | Delivered artifacts and QA PASS       | Baseline Change Log added  |
| CORE-SU.PM1 | Done           | Real-execution fix and Change Log     | Existing baseline retained |

## Forward Enforcement

**Audit status:** final — verdict `PASS`; reviewer `Quinn (Test Architect)`;
reviewed_revision `working-tree-files-sha256:7d08f87064d3779b9dd6d7d0e88caba335ff85625f929490252dde7a147d2022`.

CORE-SU.R1 records each live transition in its Change Log. The corrected review
skill and Full SDC state machine require QA to write the approved Done
transition, route FAIL to fixes/re-review, and preserve a maximum of three fix
iterations. CLI integration tests and sync/parity gates prevent the prior
QA-versus-PO projection drift from returning. Finalization requires completed
tasks/File List, QA Results with revision-bound provenance, and Status `Done`.

## Verification Record

- `npx jest tests/unit/sdc/phase-verify.test.js tests/unit/port-denylist.test.js tests/unit/framework-3way-diff.test.js tests/unit/lifecycle-close-contract.test.js --runInBand`: PASS, 4 suites/26 tests.
- `npm test -- --runInBand --silent`: PASS twice consecutively, each with 376 suites/8,945 tests; no residual Jest process.
- `npm run build`: PASS, publish safety gate validou 2,140 arquivos e a completude das dependências.
- `npm run lint`: PASS (one warning only in the preexisting untracked `tests/integration/wizard-debug.temp.test.js`).
- `npm run typecheck`: PASS.
- `npm run validate:manifest && npm run validate:registry-determinism`: PASS after regeneration.
- `npm run validate:port-denylist`: PASS, 1,262 files scanned and zero hits.
- `npm run sync:ide:check && npm run validate:parity`: PASS, 109/109 projections synced and all parity contracts green.
- `npm run validate:codex-sync && npm run validate:codex-integration`: PASS.
- `npm run validate:claude-sync && npm run validate:claude-integration`: PASS.
- `git diff --check`: PASS.
- CodeRabbit development and pre-PR rounds were triaged; all valid findings were remediated, and final QA re-review passed with score 100/100.

Artifact references: remediation story
`STORY-CORE-SU.R1-REVIEW-REMEDIATION.md`, checkpoint ownership ADR
`../../../architecture/adr/ADR-SDC-WAVE-CHECKPOINT-OWNERSHIP.md`, lifecycle
implementation in `.aiox-core/core/sdc/progress.js` and projection sources in
`.aiox-core/development/skills/`.
