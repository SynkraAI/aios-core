# Roadmap — CORE-SUPER-UPDATE

Canonical: [EPIC-CORE-SUPER-UPDATE.md](./EPIC-CORE-SUPER-UPDATE.md)  
ARCH: [A](./ARCHITECTURE-WAVE-A.md) · [B](./ARCHITECTURE-WAVE-B.md) · [C](./ARCHITECTURE-WAVE-C.md) · [D](./ARCHITECTURE-WAVE-D.md) · [E](./ARCHITECTURE-WAVE-E.md)

## Waves

| Wave | Status |
|------|--------|
| **0** 3-way diff harness | ✅ `npm run diff:framework-3way` + doctor advisory |
| A Runtime hygiene | ✅ (+ **MB** memory-bridge heuristics port) |
| B SDC skills + execute | ✅ (prefer **ent** lean full-sdc as enrichment base, not hub strip) |
| C Orchestration | ✅ (wave-executor = 2-way OSS↔hub; master-orch 3-way carefully) |
| D IDE/SYNAPSE | ARCH ✅ · **D1 Done** |
| E Constitution | ARCH ✅ · **E1 Done** (XI+XII; no Workspace Bus MUST) |
| F Installer | F1 ✅ · F2 ⬜ · F3 DEFERRED |
| Ops | **PM1** pm.sh real CLI ✅ |

Corrections: [ANALYSIS-3WAY-CORRECTIONS.md](./ANALYSIS-3WAY-CORRECTIONS.md)

## F1 (done)

Windows `ECOMPROMISED` (#773): docs + `aiox install` hint + doctor `windows-npx-install`.

## Governance fix (pre-merge)

| Item | Status |
|------|--------|
| Dual-path stories policy | ✅ `docs/framework/story-locations.md` |
| AGENTS.md / CLAUDE / Grok prompts | ✅ both paths |
| `.codex/` not versioned until hardened | ✅ gitignored |

## Next

1. Open/merge PR for `feat/core-super-update-epic` (+ #800 chain)  
2. Close GitHub #773 / #797 / #798 with PR links  
3. F2 doctor heuristic (optional)  
4. Harden Codex artifacts only if we decide to version `.codex/`  


## Tracking

| Date | Event |
|------|-------|
| 2026-07-09 | A+B+C complete via wave-execute |
| 2026-07-09 | ARCH-D/E drafts; F1 Windows #773 Done |
| 2026-07-09 | 3-way analysis corrections + Wave 0 diff harness |
