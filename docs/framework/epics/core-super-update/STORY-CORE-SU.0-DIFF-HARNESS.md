# Story CORE-SU.0: 3-way `.aiox-core` diff harness

## Metadata

| Campo | Valor |
|-------|-------|
| Story ID | CORE-SU.0 |
| Epic | CORE-SUPER-UPDATE |
| Wave | 0 |
| Status | Done |
| Priority | P0 |
| Architecture | [ARCHITECTURE-WAVE-0.md](./ARCHITECTURE-WAVE-0.md) |

## Problem

The current super-update was derived from a manual 3-repo comparison. Hub and enterprise will keep evolving, so drift will return unless AIOX has a repeatable harness for comparing `.aiox-core` across repos.

## Acceptance Criteria

1. Given OSS, hub, and enterprise repo paths, when the harness runs, then it emits deterministic counts and diff buckets for `.aiox-core`.
2. Given missing sibling repos, when the harness runs in a public OSS checkout, then it exits successfully with an INFO/advisory result unless strict mode is requested.
3. Given OSS-superior modules, when the report is produced, then `core/errors`, `core/external-executors`, `core/resilience`, and `pro/` are called out as protected from overwrite.
4. Given hub/enterprise-only candidates, when the report is produced, then candidates are grouped by wave and denylist hits are surfaced.
5. Given doctor integration, when private repos are unavailable, then public OSS users are not blocked.

## Implementation Notes

- Prefer structured filesystem comparison over shelling out to ad hoc `diff -rq`.
- Keep output machine-readable plus readable summary.
- Do not copy or patch files from the harness.
- Do not add hub or enterprise paths to install manifest inputs.

## Definition of Done

- [x] `npm run diff:framework-3way` CLI.
- [x] Unit tests with fixture repos: `tests/unit/framework-3way-diff.test.js`.
- [x] Doctor check returns PASS when external repos are missing: `framework-3way-diff`.
- [x] Documentation links this story from the epic and roadmap.

## File List

- `.aiox-core/infrastructure/scripts/framework-3way-diff.js`
- `.aiox-core/core/doctor/checks/framework-3way-diff.js`
- `tests/unit/framework-3way-diff.test.js`
- `docs/framework/epics/core-super-update/ARCHITECTURE-WAVE-0.md`
