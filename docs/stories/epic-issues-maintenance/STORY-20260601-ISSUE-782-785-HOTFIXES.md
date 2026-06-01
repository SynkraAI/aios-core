# Story 20260601: Issue 782 and 785 Hotfixes

## Metadata

| Campo | Valor |
|-------|-------|
| Story ID | 20260601 |
| Epic | epic-issues-maintenance |
| Status | Ready for Review |
| Executor | @dev |
| Quality Gate | @qa |
| quality_gate_tools | focused jest, npm run lint, npm run typecheck, npm test, npm run build |
| Priority | P0 |
| Source Issue | #782, #785 |
| Implementation Repository | SynkraAI/aiox-core |

## Status

- [x] Draft
- [x] Ready for implementation
- [x] Ready for Review
- [ ] Done

## Story

**As a** AIOX maintainer,
**I want** the CLI to keep booting when metrics-only payload files are absent and the updater to honor the project's package manager,
**so that** installs and updates keep working across published packages and pnpm/yarn projects.

## Contexto

- Issue #782 reports a published package where `.aiox-core/quality/` was absent, causing eager metrics imports to break every CLI command on boot.
- Issue #785 reports `aiox update` forcing `npm install` in the project root, which fails on pnpm/yarn-managed projects before any framework overlay happens.
- Open issue #779 is feature work and remains out of scope for this story.
- Open issue #773 still lacks a deterministic Windows reproduction in this checkout and remains out of scope pending maintainer context.

## Acceptance Criteria

- [x] AC1: Core CLI commands still boot when metrics-only quality modules are missing from the installed payload.
- [x] AC2: Invoking a metrics subcommand without the quality payload fails only inside that subcommand, with an explicit actionable error.
- [x] AC3: `AIOXUpdater.applyUpdate()` detects and uses the project package manager for uninstall/install operations instead of hardcoding `npm`.
- [x] AC4: Package-manager detection honors the `packageManager` field when present and still supports lockfile fallback.
- [x] AC5: Focused regression tests cover CLI boot resilience and updater package-manager dispatch.
- [x] AC6: Story records, file list, and validation evidence are updated.

## Tasks

- [x] T1: Register issue triage and execution scope artifacts for #782 and #785.
- [x] T2: Remove eager quality imports from metrics command actions and add explicit runtime failure messaging.
- [x] T3: Update package-manager detection and updater install/uninstall dispatch.
- [x] T4: Add focused regression tests for both issues.
- [x] T5: Run focused and full validation gates.

## Dev Agent Record

### Debug Log

- Run started from automation worktree `automation/issues-20260601-101825`.
- Canonical repo branch `feature/pro-ux-error-bridge` was reconciled with origin before worktree creation.
- Focused regression suite passed:
  - `npm test -- --runTestsByPath tests/core/cli-metrics-resilience.test.js tests/installer/dependency-installer.test.js tests/updater/aiox-updater-package-manager.test.js tests/updater/aiox-updater.test.js --runInBand`
- Full core gates passed:
  - `npm run lint`
  - `npm run typecheck`
  - `npm test -- --runInBand --forceExit --silent`
  - `node bin/aiox.js doctor` (13 PASS, 2 WARN, 0 FAIL after installing `.aiox-core` production deps)
- `aiox-pro` available validation passed:
  - `npm run validate:publish-surface`

### Completion Notes

- Metrics commands now load quality-only modules lazily through a runtime helper, so missing `.aiox-core/quality/` no longer breaks the general CLI boot path.
- Metrics invocations still fail when the payload is absent, but now fail locally with an explicit reinstall/update message instead of `MODULE_NOT_FOUND` during startup.
- Updater package installation now respects the declared project package manager (`packageManager` field first, then lockfile fallback) and dispatches package-manager-specific add/remove commands.

### File List

| File | Action |
|------|--------|
| `docs/stories/epic-issues-maintenance/STORY-20260601-ISSUE-782-785-HOTFIXES.md` | Created |
| `.aiox-core/cli/commands/metrics/runtime.js` | Created |
| `.aiox-core/cli/commands/metrics/record.js` | Updated |
| `.aiox-core/cli/commands/metrics/show.js` | Updated |
| `.aiox-core/cli/commands/metrics/cleanup.js` | Updated |
| `.aiox-core/cli/commands/metrics/seed.js` | Updated |
| `packages/installer/src/installer/dependency-installer.js` | Updated |
| `packages/installer/src/updater/index.js` | Updated |
| `tests/core/cli-metrics-resilience.test.js` | Created |
| `tests/installer/dependency-installer.test.js` | Updated |
| `tests/updater/aiox-updater-package-manager.test.js` | Created |
