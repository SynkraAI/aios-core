# Story CORE-SU.MB: Memory-bridge heuristics port

## Metadata

| Campo | Valor |
|-------|-------|
| Story ID | CORE-SU.MB |
| Epic | CORE-SUPER-UPDATE |
| Status | Done |
| Source | hub memory-bridge + tests (not wholesale hook-runtime) |

## Delivered

- Cold/warm timeout (`BRIDGE_TIMEOUT_COLD_MS` 150 / warm 15)
- `processSessionDigest` + debounced reinforcement queue
- Worker `.aiox-core/scripts/reinforce-heuristic.js`
- OSS `.aiox-core/governance/global-heuristic-hints.yaml` (no product branding)
- Tests: `tests/synapse/memory-bridge-heuristics.test.js`

## Explicit non-goals

- Replace hook-runtime wholesale
- Product squad-creator-pro as required dependency

## QA

Gate: **PASS** — existing memory-bridge tests + heuristics suite green
