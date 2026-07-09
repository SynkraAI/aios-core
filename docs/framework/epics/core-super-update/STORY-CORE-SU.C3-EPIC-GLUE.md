# Story CORE-SU.C3: Epic orchestration glue

## Metadata

| Campo | Valor |
|-------|-------|
| Story ID | CORE-SU.C3 |
| Epic | CORE-SUPER-UPDATE |
| Wave | C |
| Status | Done |
| Priority | P1 |
| Depends | CORE-SU.C1 |
| Executor | @dev |
| Quality Gate | @qa |
| Architecture | [ARCHITECTURE-WAVE-C.md](./ARCHITECTURE-WAVE-C.md) §4 C3 |

## Problem

Operators must hand-list every story path for `aiox wave plan`. Epic dirs already hold `STORY-*.md`. Need glue: discover stories from an epic directory, filter by status/id, plan wave, improve report.

## Acceptance Criteria

1. **Given** `--epic-dir …`, **when** `aiox wave from-epic` runs, **then** discovers `STORY-*.md` and plans a wave.
2. **Given** `--filter CORE-SU.C`, **when** from-epic runs, **then** only matching Story IDs are included.
3. **Given** `--skip-done`, **when** set, **then** skips stories already Done.
4. **Given** plan saved, **when** `aiox wave report` runs, **then** report includes epic glue metadata.
5. **Given** empty discovery, **when** from-epic, **then** exit non-zero with clear message.
6. **Given** denylist, **when** scan new modules, **then** clean.

## File List

- `.aiox-core/core/sdc/epic-glue.js`
- `.aiox-core/cli/commands/wave/index.js` — `from-epic`
- `.aiox-core/core/sdc/index.js` — export
- `.aiox-core/core/sdc/wave-run.js` — report epic glue section
- `tests/unit/sdc/epic-glue.test.js`

## Tasks

- [x] epic-glue discover + filter
- [x] CLI `aiox wave from-epic`
- [x] Report metadata
- [x] Tests

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
| 2026-07-09 | Implemented from-epic + full-sdc close | @dev/@qa |
