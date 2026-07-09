# Story CORE-SU.A2: ConfigCache / Jest residual (#797)

## Metadata

| Campo | Valor |
|-------|-------|
| Story ID | CORE-SU.A2 |
| Epic | CORE-SUPER-UPDATE |
| Wave | A |
| Status | Done |
| Priority | P0 |
| Source Issue | #797 |
| Complexity | S |
| Architecture | [ARCHITECTURE-WAVE-A.md](./ARCHITECTURE-WAVE-A.md) §3.2 |

## Problem

Issue **#797** reports ConfigCache module-level `setInterval` causing intermittent:

```text
Cannot log after tests are done
```

under Jest.

## Current code (do not re-solve blindly)

As of aiox-core **5.2.9** on this branch:

- `config-cache.js` already calls **`unref()`** on the cleanup timer (~L231–240).
- `tests/core/config-cache-unref.test.js` already asserts unref behavior.

Therefore this story is **not** “add unref”. It is **reproduce residual flake or close #797 with evidence**.

## Acceptance Criteria

1. **Given** current mainline ConfigCache + unref, **when** suite is run with open-handle detection (e.g. `jest --detectOpenHandles` and/or focused import of config-cache under worker), **then** document result: **reproducible residual** OR **not reproducible**.
2. **If residual is reproducible**, **when** fix lands, **then** one of:
   - skip creating the interval when `process.env.JEST_WORKER_ID` is set; or
   - export `disposeConfigCacheTimers()` / clearInterval on test teardown hook; or
   - equivalent that removes open handles without breaking production TTL sweep.
3. **If residual is not reproducible**, **when** story closes, **then** #797 is closed with:
   - link to unref commit/test;
   - commands run and environment (Node/Jest versions);
   - note that further reports need a minimal repro.
4. **Given** production Node (non-Jest), **when** ConfigCache loads, **then** TTL sweep still runs (unref does not disable the timer, only allows process exit).
5. **Given** quality gates, **when** done, **then** `npm run lint && npm run typecheck && npm test` green.

## Out of Scope

- Removing ConfigCache  
- Changing TTL semantics for production  
- Workspace or hub-specific config roots  

## Implementation Notes

- Prefer smallest change if residual exists.  
- Align with ARCH-A §3.2.  
- Do not add duplicate “add unref” PR if already present.

## File List (expected)

- `.aiox-core/core/config/config-cache.js` (only if residual fix needed)
- `tests/core/config-cache-unref.test.js` and/or new residual test
- Issue #797 comment + close

## Decision (YOLO 2026-07-09)

**Residual is real by design of the issue:** `unref()` alone still allows the
callback to fire after Jest teardown. Fix applied: **skip `setInterval` when
`JEST_WORKER_ID` is set**; production still starts timer + unref; log only under
`AIOX_DEBUG`. Export `disposeConfigCacheTimers` / `startCacheCleanupTimer`.

Both copies updated:
- `.aiox-core/core/config/config-cache.js`
- `.aiox-core/infrastructure/scripts/config-cache.js`

## Definition of Done

- [x] Reproduce-or-close decision recorded (residual = fire-after-teardown; unref insufficient)
- [x] Fix: skip timer under Jest + AIOX_DEBUG log gate + dispose helpers
- [x] Tests updated for Jest vs production paths
- [x] No `workspace/` coupling
