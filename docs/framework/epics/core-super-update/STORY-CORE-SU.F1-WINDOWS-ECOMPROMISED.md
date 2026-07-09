# Story CORE-SU.F1: Windows npx ECOMPROMISED (#773)

## Metadata

| Campo | Valor |
|-------|-------|
| Story ID | CORE-SU.F1 |
| Epic | CORE-SUPER-UPDATE |
| Wave | F |
| Status | Done |
| Priority | P1 |
| Source Issue | #773 |
| Executor | @dev |
| Quality Gate | @qa |

## Problem

On Windows, `npx aiox-core install` fails with `ECOMPROMISED` / `Lock compromised` when npx’s lock times out on a large cold-cache download.

## Acceptance Criteria

1. Docs document cause + workarounds with #773 link.  
2. `aiox install` on win32 under npx prints non-blocking hint.  
3. Doctor check `windows-npx-install` WARNs on Windows (PASS elsewhere).  
4. Installation troubleshooting lists remediation.  
5. Unit tests green.  
6. Denylist clean.

## File List

- `.aiox-core/core/install/windows-npx-hint.js`
- `.aiox-core/core/doctor/checks/windows-npx-install.js`
- `.aiox-core/core/doctor/checks/index.js`
- `.aiox-core/development/tasks/health-check.yaml`
- `bin/aiox.js`
- `docs/npx-install.md`
- `docs/guides/installation-troubleshooting.md`
- `tests/unit/install/windows-npx-hint.test.js`
- `packages/installer/tests/unit/doctor/doctor-checks.test.js`
- `packages/installer/tests/unit/doctor/doctor-orchestrator.test.js`

## Tasks

- [x] windows-npx-hint + tests  
- [x] Install CLI hint + doctor (17 checks)  
- [x] Docs  
- [x] full-sdc close  

## QA Results

### Review Date: 2026-07-09

### Reviewed By: @qa (full-sdc YOLO)

### Gate Status

Gate: **PASS**

## Definition of Done

- [x] ACs met  
- [x] Status Done  
- [ ] #773 closed on GitHub (after PR merge)  

## Change Log

| Date | Change | Agent |
|------|--------|-------|
| 2026-07-09 | F1 implemented via wave CORE-SU-F + full-sdc | @dev/@qa |
