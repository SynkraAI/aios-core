# Story CORE-SU.A3: Path / Prompt / SSRF guards

## Metadata

| Campo | Valor |
|-------|-------|
| Story ID | CORE-SU.A3 |
| Epic | CORE-SUPER-UPDATE |
| Wave | A |
| Status | Done |
| Architecture | [ARCHITECTURE-WAVE-A.md](./ARCHITECTURE-WAVE-A.md) §3.3 |

## Goal

Extend `core/permissions` with path, prompt, and SSRF guards. **Do not replace** `permission-mode` / `operation-guard`.

## Implementation

| Module | Role |
|--------|------|
| `path-guard.js` | Traversal + project-root + OSS write deny list (**no `workspace/`**) |
| `prompt-guard.js` | Injection pattern + invisible unicode scan |
| `ssrf-guard.js` | Private/metadata IP + localhost blocks |
| `index.js` | Exports `pathGuard`, `promptGuard`, `ssrfGuard` + convenience helpers |

## Definition of Done

- [x] Guards added under `.aiox-core/core/permissions/`
- [x] Unit tests (path / prompt / ssrf)
- [x] No `workspace/` in deny list
- [x] Existing PermissionMode / OperationGuard preserved

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-07-09 | audit | Retrospective lifecycle baseline: Done status and guard/test evidence verified; missing historical transitions were not fabricated. | Dex (@dev) |
