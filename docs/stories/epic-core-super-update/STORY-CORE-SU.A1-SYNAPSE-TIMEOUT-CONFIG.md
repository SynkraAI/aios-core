# Story CORE-SU.A1: SYNAPSE PIPELINE_TIMEOUT_MS configurable

## Metadata

| Campo | Valor |
|-------|-------|
| Story ID | CORE-SU.A1 |
| Epic | CORE-SUPER-UPDATE |
| Wave | A |
| Status | Draft |
| Priority | P0 |
| Source Issue | #798 |
| Complexity | S |

## Problem

`.aiox-core/core/synapse/engine.js` hardcodes:

```js
const PIPELINE_TIMEOUT_MS = 100;
```

On slow machines / cold start / antivirus FS, remaining layers are silently skipped (`skipLayer(..., 'Pipeline timeout')`). SYNAPSE rules appear to “randomly” not apply.

## Acceptance Criteria

1. **Given** no env override, **when** engine loads, **then** default timeout remains backward-compatible (document chosen default; may raise from 100ms if justified with tests).
2. **Given** `AIOX_SYNAPSE_PIPELINE_TIMEOUT_MS` (or core-config key) is set, **when** engine runs, **then** that value is used.
3. **Given** timeout exceeded, **when** layers skip, **then** a **visible** warning is logged (not only buried metrics).
4. **Given** unit tests, **when** timeout is forced low, **then** skip path is asserted; when high, all layers can complete in fixture.
5. **Given** docs, **when** developer reads core-config / engine README, **then** the knobs are documented.

## Out of Scope

- Full SYNAPSE rewrite  
- Changing layer order  
- Hub-specific theme layers  

## Implementation Notes

- Prefer: env > core-config > default constant  
- Export timeout in engine module for tests (already exports `PIPELINE_TIMEOUT_MS` in some builds)  
- Align with constitution Quality First + observability  

## File List (expected)

- `.aiox-core/core/synapse/engine.js`
- `.aiox-core/core-config.yaml` (optional section)
- `tests/**/synapse*` or new unit test
- docs snippet if applicable

## Definition of Done

- [ ] ACs met  
- [ ] Tests green  
- [ ] #798 can be closed with PR link  
- [ ] No machine-absolute paths  
