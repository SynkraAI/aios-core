# Roadmap — CORE-SUPER-UPDATE

Canonical: [EPIC-CORE-SUPER-UPDATE.md](./EPIC-CORE-SUPER-UPDATE.md)
ARCH: [0](./ARCHITECTURE-WAVE-0.md) · [A](./ARCHITECTURE-WAVE-A.md) · [B](./ARCHITECTURE-WAVE-B.md) · [C](./ARCHITECTURE-WAVE-C.md) · [D](./ARCHITECTURE-WAVE-D.md) · [E](./ARCHITECTURE-WAVE-E.md)

## Waves

| Wave | Status |
|------|--------|
| **0** 3-way diff harness | ✅ `npm run diff:framework-3way` + doctor advisory |
| A Runtime hygiene | ✅ (+ **MB** memory-bridge heuristics port) |
| B SDC skills + execute | ✅ (prefer **ent** lean full-sdc as enrichment base, not hub strip) |
| C Orchestration | ✅ (wave-executor = 2-way OSS↔hub; master-orch 3-way carefully) |
| D IDE/SYNAPSE | ARCH ✅ · **D1 Done** · **D2 Done** (CORE-SU.MB) · D3–D4 optional backlog · D5 DEFERRED |
| E Constitution | ARCH ✅ · **E1 Done** (XI+XII; no Workspace Bus MUST) · E3 optional backlog · E4 DEFERRED |
| F Installer | F1 ✅ · F2 optional backlog · F3 DEFERRED |
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

## Completion boundary

**Shipped (required):** Waves 0 / A / B / C + D1 + D2(MB) + E1 + F1 + PM1 + dual-path governance.

**Out of this release (not open work):**
| Item | Disposition |
|------|-------------|
| D3 parity smoke extensions | Optional backlog (post-merge) |
| D4 context-optimizer skill | Optional backlog (post-merge) |
| D5 three-brain | DEFERRED by design |
| E3 constitution cross-links | Optional docs (post-merge) |
| E4 governance-pipeline skill | DEFERRED by design |
| F2 doctor heuristic | Optional backlog (post-merge) |
| F3 theme-resolver | DEFERRED by design |
| Version `.codex/` | Blocked until path hardening |

## Next (process, not implementation)

1. `*pre-push` + CodeRabbit on this branch
2. Open/merge PR (+ #800 chain if needed)
3. Close GitHub #773 / #797 / #798 with PR links


## Tracking

| Date | Event |
|------|-------|
| 2026-07-09 | A+B+C complete via wave-execute |
| 2026-07-09 | ARCH-D/E drafts; F1 Windows #773 Done |
| 2026-07-09 | 3-way analysis corrections + Wave 0 diff harness |
| 2026-07-09 | Required scope frozen COMPLETE; backlog deferred; pre-push/CR next |
