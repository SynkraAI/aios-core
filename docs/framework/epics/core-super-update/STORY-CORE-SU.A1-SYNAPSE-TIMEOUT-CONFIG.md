# Story CORE-SU.A1: SYNAPSE PIPELINE_TIMEOUT_MS configurable

## Metadata

| Campo | Valor |
|-------|-------|
| Story ID | CORE-SU.A1 |
| Epic | CORE-SUPER-UPDATE |
| Wave | A |
| Status | Done |
| Priority | P0 |
| Source Issue | #798 |
| Complexity | S |
| Architecture | [ARCHITECTURE-WAVE-A.md](./ARCHITECTURE-WAVE-A.md) §3.1 |

## Problem

`.aiox-core/core/synapse/engine.js` hardcodes:

```js
const PIPELINE_TIMEOUT_MS = 100;
```

On slow machines / cold start / antivirus FS, remaining layers are silently skipped (`skipLayer(..., 'Pipeline timeout')`). SYNAPSE rules appear to “randomly” not apply.

## Acceptance Criteria

1. **Given** no override, **when** engine runs, **then** default remains **100ms** (backward-compatible). Raising default requires minor-version note + evidence — not in this story.
2. **Given** config resolution order **env `AIOX_SYNAPSE_PIPELINE_TIMEOUT_MS` > core-config `synapse.pipelineTimeoutMs` > default**, **when** values conflict, **then** higher-precedence wins.  
   - Do **not** alias `AIOX_PIPELINE_TIMEOUT` (used by unified-activation-pipeline) without documenting both.
3. **Given** invalid values (NaN, ≤0, non-integer, absurd > max e.g. 30000), **when** resolved, **then** fall back to default and **warn**.
4. **Given** timeout exceeded, **when** remaining layers skip, **then**:
   - `console.warn` (or structured logger) includes configured budget, elapsed ms, skipped layer ids;
   - metrics still record skip reason `Pipeline timeout`.
5. **Given** unit tests, **when** timeout forced low, **then** skip path + warn spy asserted; **when** high, **all active layers** complete (respect `DEFAULT_ACTIVE_LAYERS` / non-legacy mode unless legacy explicitly tested).
6. **Given** docs, **when** developer reads core-config / engine notes, **then** knobs + precedence + clamps are documented.
7. **Given** quality gates, **when** story completes, **then** `npm run lint && npm run typecheck && npm test` green; closes #798 with PR link.

## Out of Scope

- Full SYNAPSE rewrite  
- Changing layer order  
- Hub-specific theme layers  

## Implementation Notes

- Prefer: env > core-config > default constant  
- Export timeout in engine module for tests (already exports `PIPELINE_TIMEOUT_MS` in some builds)  
- Align with constitution Quality First + observability  

## File List

- `.aiox-core/core/synapse/engine.js` — resolvePipelineTimeoutMs + warn on timeout
- `.aiox-core/core/synapse/runtime/hook-runtime.js` — loadCoreConfig + pass `synapse` to SynapseEngine
- `.aiox-core/core-config.yaml` — `synapse.pipelineTimeoutMs`
- `tests/synapse/engine.test.js` — A1 unit tests
- `tests/synapse/hook-runtime.test.js` — runtime config wiring test
- `docs/framework/config-override-guide.md` — knobs documented

## QA Results

### Review Date: 2026-07-09

### Reviewed By: @qa (lean review-story / YOLO)

### Gate Status

Gate: **PASS**

- ACs 1–6 met in engine + config + tests
- hook-runtime wires core-config.synapse into SynapseEngine (wiring residual closed)
- No product harvest paths
- Unit suites: `tests/synapse/engine.test.js`, `tests/synapse/hook-runtime.test.js` green

### Notes

- Issue #798 close requires PR merge link (devops) — not blocked for story Done on branch

## Definition of Done

- [x] ACs met (implementation + tests + docs)
- [x] Tests green (`tests/synapse/engine.test.js`, hook-runtime)
- [ ] #798 closed with PR link (after push/merge)
- [x] No machine-absolute paths

## Change Log

| Date | Change | Agent |
|------|--------|-------|
| 2026-07-09 | Implemented timeout resolve + tests | @dev |
| 2026-07-09 | hook-runtime config wiring + review PASS → Done | @dev / @qa |
