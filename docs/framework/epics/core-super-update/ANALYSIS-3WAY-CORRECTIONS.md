# 3-way analysis corrections (verified 2026-07-09)

Ground truth from local trees + branch state. Use this to avoid re-doing wrong ports.

## File counts (`.aiox-core` files, this machine)

| Tree | Count (approx) |
|------|----------------|
| aiox-core (this branch) | ~1208 |
| sinkra-hub | 1272 |
| AIOX-enterprise | 1192 |

## Confirmed

- Package OSS: `@aiox-squads/core` 5.2.9  
- OSS-only / do-not-overwrite: `core/errors`, `core/external-executors`, `core/resilience`, `pro/`  
- Hub constitution I–XIII (XI Squad-First, XII Model Governance, XIII Workspace Bus)  
- Ent constitution I–XII with XII = Workspace Bus (Model Governance hub-only)  
- Guards path/prompt/ssrf: hub has tests; OSS Wave A **already added** guards (aditivo)  
- #797: OSS already skips ConfigCache interval under `JEST_WORKER_ID`  
- #798 / A1: timeout resolve + hook-runtime wiring done on branch  

## Corrections that change decisions

| Claim | Correction | Decision |
|-------|------------|----------|
| Port hook-runtime wholesale | Reviewer: identical @186l on some snapshot. **This machine:** OSS 128–129l (A1 lean wiring), hub ~607l, ent ~498l — **not** identical now. | Do **not** wholesale-replace OSS hook-runtime. |
| memory-bridge only | hub 354 / ent 350 / OSS was 220 | **Done (CORE-SU.MB):** cold/warm timeout, processSessionDigest, reinforce worker, governance hints YAML, heuristics tests. No hook-runtime replace. |
| Build lean full-sdc from hub strip | Ent full-sdc **468 lines**; hub **2209**. OSS lean ~131 already. | Prefer **ent full-sdc as enrichment source**, not hub strip. |
| context-optimizer as core module | Skill only (hub/ent `.claude/skills/`) | Port as **skill** if needed, not engine merge. |
| wave-executor 3-way | OSS 397 ≡ ent 397; hub 638 | Diff is **OSS↔hub only** for that file. |
| master-orchestrator | OSS 1633 / hub 2170 / **ent 1542** | Ent can be **smaller** — never regress OSS with blind ent merge. |
| #797 re-implement | Already has JEST_WORKER_ID | Close as residual-done; no re-impl. |

## Wave B lesson (already largely shipped)

OSS lean SDC skills + `aiox sdc`/`wave` exist. Future skill enrichment: **read enterprise full-sdc (468)** before hub (2209).

## Wave 0 (new)

```bash
npm run diff:framework-3way
# optional peers as siblings:
# ../sinkra-hub  ../AIOX-enterprise
```

Doctor check: `framework-3way-diff` (advisory WARN when peers present).

## Focus

**AIOX super-UPDATE** remains the active program. lendario-lms app-code notes are separate; governance/DB resume only on explicit ask.
