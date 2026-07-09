# Story CORE-SU.C2: Optional parallel dispatch adapter

## Metadata

| Campo | Valor |
|-------|-------|
| Story ID | CORE-SU.C2 |
| Epic | CORE-SUPER-UPDATE |
| Wave | C |
| Status | Done |
| Priority | P1 |
| Depends | CORE-SU.C1 (shipped) |
| Executor | @dev |
| Quality Gate | @qa |
| Architecture | [ARCHITECTURE-WAVE-C.md](./ARCHITECTURE-WAVE-C.md) §4 C2 |

## Problem

Wave execute can plan batches but has no pluggable `dispatchStory` / batch runner. Parallel is either fake or ad-hoc. ARCH-C requires an adapter: sequential default, optional parallel with soft cap; never require cockpit spawn.

## Acceptance Criteria

1. **Given** `createDispatchAdapter({ mode: 'sequential' })`, **when** `runBatch(items, worker)` runs, **then** items execute one-after-another in order.
2. **Given** `mode: 'parallel'` and `maxParallel: N`, **when** batch has M items, **then** at most N workers run concurrently (Promise pool); results preserve input order.
3. **Given** a worker throws, **when** sequential mode, **then** return settled failures without throwing out of `runBatch`.
4. **Given** invalid mode, **when** create, **then** fall back to sequential with warn.
5. **Given** `dispatchStory` helper, **when** called with `{ story, run }`, **then** invokes `run(story)` and returns `{ storyId, ok, result|error }`.
6. **Given** product harvest tokens, **when** denylist scans new files, **then** clean.
7. **Given** tests, **when** `npm test -- tests/unit/sdc`, **then** green.

## File List

- `.aiox-core/core/sdc/dispatch-adapter.js`
- `.aiox-core/core/sdc/index.js` — export
- `.aiox-core/core/sdc/wave-run.js` — `runWaveBatch`
- `tests/unit/sdc/dispatch-adapter.test.js`

## Tasks

- [x] Implement dispatch-adapter (sequential + parallel pool)
- [x] Wire runWaveBatch on wave-run
- [x] Unit tests
- [x] Export from sdc index

## QA Results

### Review Date: 2026-07-09

### Reviewed By: @qa (full-sdc review-story YOLO)

### Gate Status

Gate: **PASS**

## Definition of Done

- [x] ACs met
- [x] Tests green
- [x] Status Done

## Change Log

| Date | Change | Agent |
|------|--------|-------|
| 2026-07-09 | Implemented + full-sdc close via wave CORE-SU-C | @dev/@qa |
