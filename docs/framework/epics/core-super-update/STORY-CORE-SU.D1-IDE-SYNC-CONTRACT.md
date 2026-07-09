# Story CORE-SU.D1: IDE sync contract documentation

## Metadata

| Campo | Valor |
|-------|-------|
| Story ID | CORE-SU.D1 |
| Epic | CORE-SUPER-UPDATE |
| Wave | D |
| Status | Done |
| Architecture | [ARCHITECTURE-WAVE-D.md](./ARCHITECTURE-WAVE-D.md) |

## Goal

Document the OSS IDE projection contract (SOT → surfaces) and point at existing sync/parity scripts. No hub product IDE glue.

## Deliverables

| Artifact | Path |
|----------|------|
| Contract doc | `docs/framework/ide-sync-contract.md` |
| ARCH-D link | updated |

## Acceptance

1. Doc lists SOT paths, surfaces (Claude/Grok/Codex/Gemini), sync npm scripts.  
2. States Article XI direction: squads/framework → projection only.  
3. References `npm run sync:skills:grok`, `sync:ide`, `validate:parity` when present.  
4. Denylist clean.

## QA

Gate: **PASS** (docs-only)

## Change Log

| Date | Event |
|------|-------|
| 2026-07-09 | Shipped under YOLO full-sdc |
