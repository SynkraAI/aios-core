# Architecture — Wave D (IDE / SYNAPSE stretch)

| Campo | Valor |
|-------|-------|
| Wave | D |
| Epic | CORE-SUPER-UPDATE |
| Status | Accepted — D1 ✅ · D2 ✅ (CORE-SU.MB) · D3–D4 optional backlog · D5 DEFERRED |
| Depends | A+B (done) |

## 1. Goal

Thin **IDE adapter slices** so SYNAPSE / agent surfaces stay coherent across Claude, Grok, Codex without hub product IDE glue.

## 2. In scope (D1+)

| ID | Scope |
|----|--------|
| D1 | Document + stabilize IDE sync contracts (already `sync:skills:grok`, `sync:ide`) — gap analysis only first |
| D2 | SYNAPSE `memory-bridge` heuristics only; `hook-runtime.js` had no 3-repo delta at verification time |
| D3 | Optional parity smoke script extensions if future drift evidence shows a gap |
| D4 | Optional `context-optimizer` skill port candidate — skill only, not core engine |
| D5 | three-brain skill port — **DEFERRED** |

## 3. Explicitly non-ported

- Hub cockpit panes / companion
- Product theme packs
- Multi-BU IDE policies
- `context-optimizer` as a new core runtime module
- hook-runtime port work without a fresh diff showing real divergence

## 4. Components

```
IDE surfaces (.claude / .grok / .codex)
        ▲
   ide-sync / grok-skills-sync / codex-skills-sync  (exists)
        ▲
   ARCH-D D1: contract docs + drift checks only
```

## 5. SYNAPSE Delta Clarification

The verified delta is `memory-bridge` (hub/enterprise larger, hub has heuristics tests). `hook-runtime.js` was identical across OSS, hub, and enterprise during the direct verification, so do not frame D2 as hook-runtime harvest.

## 6. Acceptance ARCH-D

- [x] This document
- [x] D1 story + `docs/framework/ide-sync-contract.md`
- [x] No product harvest
- [x] `context-optimizer` classified as skill-only candidate
- [x] D3/D4 classified as non-blocking backlog, not PR blockers
