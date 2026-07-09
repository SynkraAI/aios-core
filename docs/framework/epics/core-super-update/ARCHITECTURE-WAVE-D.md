# Architecture — Wave D (IDE / SYNAPSE stretch)

| Campo | Valor |
|-------|-------|
| Wave | D |
| Epic | CORE-SUPER-UPDATE |
| Status | Draft — unblocks D1 planning |
| Depends | A+B (done) |

## 1. Goal

Thin **IDE adapter slices** so SYNAPSE / agent surfaces stay coherent across Claude, Grok, Codex without hub product IDE glue.

## 2. In scope (D1+)

| ID | Scope |
|----|--------|
| D1 | Document + stabilize IDE sync contracts (already `sync:skills:grok`, `sync:ide`) — gap analysis only first |
| D2 | Optional SYNAPSE config surface docs for multi-IDE |
| D3 | Parity smoke script extensions if missing |
| D5 | three-brain skill port — **DEFERRED** |

## 3. Explicitly non-ported

- Hub cockpit panes / companion  
- Product theme packs  
- Multi-BU IDE policies  

## 4. Components

```
IDE surfaces (.claude / .grok / .codex)
        ▲
   ide-sync / grok-skills-sync / codex-skills-sync  (exists)
        ▲
   ARCH-D D1: contract docs + drift checks only
```

## 5. Acceptance ARCH-D

- [x] This document  
- [x] D1 story + `docs/framework/ide-sync-contract.md`  
- [x] No product harvest  
