# STORY-20260613-ISSUE-773-NPX-INSTALLER-DEPS

## Status

Ready for Review

## Story

As a Windows user running `npx aiox-core install`,
I want the published runtime package to declare the dependencies required by the interactive installer,
so that the wizard does not crash with a missing `onetime` module after npm resolves the npx package.

## Source Issue

- GitHub issue: https://github.com/SynkraAI/aiox-core/issues/773

## Acceptance Criteria

- [x] Runtime manifests that directly depend on `inquirer` also declare `onetime` as a direct dependency.
- [x] The root lockfile is consistent with the manifest changes.
- [x] A regression test guards the dependency declaration.
- [x] The original npm 11.6.2 `ECOMPROMISED` lock-timeout behavior is not claimed as fully fixed without Windows/npm confirmation.

## Tasks

- [x] Identify shipped runtime manifests that load `inquirer`.
- [x] Add direct `onetime` runtime dependency where needed.
- [x] Update lockfile metadata.
- [x] Add manifest regression coverage.
- [x] Run focused validation and applicable quality gates.

## Dev Agent Record

### Debug Log

- 2026-06-13: Issue #773 updated with Windows reproduction showing npm 11.16.0 gets past `ECOMPROMISED` but crashes on missing `onetime` via `inquirer -> cli-cursor -> restore-cursor`.
- 2026-06-13: Scoped this hotfix to direct runtime dependency declaration and manifest coverage; broader npx bootstrap redesign remains out of scope.

### Completion Notes

- Added `onetime` to root, internal `.aiox-core`, and installer package runtime manifests.
- Added a Jest manifest guard covering every shipped runtime manifest in this repo that directly declares `inquirer`.

### File List

- `package.json`
- `package-lock.json`
- `.aiox-core/package.json`
- `packages/installer/package.json`
- `tests/installer/runtime-dependencies.test.js`
- `docs/stories/epic-issues-maintenance/STORY-20260613-ISSUE-773-NPX-INSTALLER-DEPS.md`

### Change Log

- 2026-06-13: Added direct `onetime` runtime dependency and regression coverage for issue #773.
