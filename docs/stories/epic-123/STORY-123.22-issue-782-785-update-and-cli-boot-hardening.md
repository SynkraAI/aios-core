# Story 123.22: Fix Issues #782 and #785 - CLI Boot and Updater Package Manager Hardening

## Status

Ready for Review

## Story

As an AIOX user installing or updating the framework in real projects,
I want the CLI boot path and updater flow to degrade safely across published package drift and non-npm workspaces,
so that `aiox` remains usable and `aiox update` respects the project's package manager.

## Acceptance Criteria

- [x] Issue `#782`: CLI bootstrap does not eagerly require `quality/*`, so missing metrics runtime files only affect the `metrics` command surface.
- [x] Issue `#785`: updater install/uninstall operations use the detected project package manager instead of hardcoded `npm`.
- [x] Package manager detection honors project metadata or lockfiles well enough for updater execution in npm/pnpm/yarn/bun projects.
- [x] Regression tests cover lazy metrics loading and updater package manager selection.
- [x] Quality gates for the touched surfaces pass locally.

## Tasks

- [x] Refactor metrics command modules to load `quality/*` only inside command execution paths.
- [x] Add a regression test that proves CLI/bootstrap does not load metrics runtime eagerly.
- [x] Reuse installer package manager detection in updater install/uninstall flow.
- [x] Add updater/package-manager regression coverage for exact-version install/uninstall command selection.
- [x] Run targeted tests for updater and CLI metrics changes.
- [x] Run repo quality gates required for this patch and record outcomes.

## File List

- `docs/stories/epic-123/STORY-123.22-issue-782-785-update-and-cli-boot-hardening.md`
- `.aiox-core/cli/commands/metrics/runtime.js`
- `.aiox-core/cli/commands/metrics/record.js`
- `.aiox-core/cli/commands/metrics/show.js`
- `.aiox-core/cli/commands/metrics/cleanup.js`
- `.aiox-core/cli/commands/metrics/seed.js`
- `packages/installer/src/installer/dependency-installer.js`
- `packages/installer/src/updater/index.js`
- `tests/cli/metrics-bootstrap.test.js`
- `tests/installer/dependency-installer.test.js`
- `tests/updater/aiox-updater.test.js`

## Dev Notes

### Root Causes

- `#782`: `.aiox-core/cli/index.js` registers the metrics command during boot, and the metrics modules currently import `quality/metrics-collector` and `quality/seed-metrics` at module load time. If the publish payload is incomplete, the whole CLI dies before dispatch.
- `#785`: `packages/installer/src/updater/index.js` hardcodes `npm uninstall` and `npm install --save-exact`, even though the installer already has package-manager detection helpers.

### Non-Goals

- Redesign the updater to download tarballs into an isolated temp directory.
- Solve issue `#773` in the same patch.
- Add any new product features or workflow surfaces.
