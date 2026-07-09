# Story CORE-SU.C4: Wave C tests consolidation

## Metadata

| Campo | Valor |
|-------|-------|
| Story ID | CORE-SU.C4 |
| Epic | CORE-SUPER-UPDATE |
| Wave | C |
| Status | Done |
| Priority | P1 |
| Depends | CORE-SU.C2, CORE-SU.C3 |
| Executor | @dev |
| Quality Gate | @qa |
| Architecture | [ARCHITECTURE-WAVE-C.md](./ARCHITECTURE-WAVE-C.md) §4 C4 |

## Problem

C1 has unit tests; C2/C3 need coverage and an integration-style test that from-epic → plan → advance works on fixture stories.

## Acceptance Criteria

1. **Given** C2 module, **when** unit tests run, **then** sequential + parallel + fail settled covered.
2. **Given** C3 module, **when** unit tests run, **then** discover/filter/empty covered.
3. **Given** temp epic fixture with 2 stories, **when** planAndSave + advanceWave, **then** statuses update without throw.
4. **Given** `npx jest tests/unit/sdc`, **when** CI, **then** all green.
5. **Given** `npm run validate:port-denylist`, **then** exit 0.

## File List

- `tests/unit/sdc/dispatch-adapter.test.js`
- `tests/unit/sdc/epic-glue.test.js`
- `tests/unit/sdc/wave-c-integration.test.js`

## Tasks

- [x] C2/C3 unit tests
- [x] Integration fixture test
- [x] Denylist green

## QA Results

### Review Date: 2026-07-09

### Reviewed By: @qa (full-sdc review-story YOLO)

### Gate Status

Gate: **PASS** — 23 tests in tests/unit/sdc green; denylist clean

## Definition of Done

- [x] ACs met
- [x] Status Done

## Change Log

| Date | Change | Agent |
|------|--------|-------|
| 2026-07-09 | Tests + full-sdc close via wave CORE-SU-C | @dev/@qa |
