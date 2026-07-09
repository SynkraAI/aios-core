# Epic CORE-SUPER-UPDATE: AIOX Core Harvest from Hub & Enterprise

## Metadata

| Campo | Valor |
|-------|-------|
| Epic ID | CORE-SUPER-UPDATE |
| Status | **COMPLETE (required scope)** — optional/deferred backlog explicitly out of ship; ready for pre-push / CodeRabbit / PR |
| Priority | P0 |
| Branch base | `feat/grok-agents-skills` (PR #800) → merge chain into `main` |
| Working branch | `feat/core-super-update-epic` |
| **Canonical path (public OSS)** | `docs/framework/epics/core-super-update/` |
| Sources (read-only harvest) | `../sinkra-hub`, `../AIOX-enterprise` (diff 2026-07-09) |
| Target package | `@aiox-squads/core` (open source) |

> **Docs policy (official dual-path):**  
> - **This epic / framework work:** `docs/framework/epics/` — **versioned** in OSS.  
> - **`docs/stories/`:** project L4 runtime path (gitignored in this repo template). Valid for *downstream* projects; do **not** force-add it here.  
> - Agents, AGENTS.md, and Grok prompts accept **both**. Canonical write-up: [`docs/framework/story-locations.md`](../../story-locations.md).

## Objetivo

Trazer para o **aiox-core OSS** o que o framework ganhou em **sinkra-hub** e **AIOX-enterprise**, sem importar produto Sinkra, monorepo multi-BU, **workspace/**, squads de domínio ou IP enterprise.

**Promessa MVP (headline):** instalar `@aiox-squads/core` → slash-run **validate → develop → review → close** sem monorepo hub.

## Implementation readiness (architect-first)

| Gate | Status |
|------|--------|
| Strategic direction | ✅ OK |
| Public versionable path | ✅ `docs/framework/epics/` |
| Architecture slice Wave 0 | ✅ `ARCHITECTURE-WAVE-0.md` |
| Architecture slice Wave A | ✅ `ARCHITECTURE-WAVE-A.md` |
| Architecture slice Wave B–E | ✅ present |
| Wave A/B/C implementation | ✅ shipped on branch |
| Wave D/E implementation | ✅ required scope shipped; optional/deferred items documented |
| Zero workspace in OSS | ✅ hard non-goal (below) |

## MVP cut (ship train)

| Release | Conteúdo | Semver |
|---------|----------|--------|
| **MVP** | Phase 0 + Wave A + Wave B (+ ARCH-B) | **5.3.0** minor |
| Patch early | Wave A only | **5.2.x** |
| Stretch | C–F | follow-on |

## Reviews

| Date | Method | Verdict |
|------|--------|---------|
| 2026-07-09 | Roundtable (architect/qa/devops/pm) | APPROVE_WITH_FIXES → applied |
| 2026-07-09 | architect-first (3 repos + issues + skill validators) | **Not implementation-ready** until path/A2/permissions/ARCH slices fixed → **this revision** |
| 2026-07-09 | Direct 3-repo verification | Analysis solid; corrected hook-runtime, full-sdc lean source, context-optimizer, Wave C diff shape, #797 partial fix |

---

## Contexto

| Repo | Papel |
|------|--------|
| **aiox-core** (OSS) | `@aiox-squads/core` **5.2.9** — errors, resilience, hierarchical-context, handshake, pro, Grok |
| **sinkra-hub** | Lab SDC/wave/guards/constitution — **not** the OSS product |
| **AIOX-enterprise** | Enterprise workspace + tribunal (mostly OOS) |

Verified `.aiox-core` file counts on 2026-07-09: OSS `1180`, hub `1272`, enterprise `1192`.

### OSS-superior (merge gate — never overwrite)

- `core/errors/*`, `core/external-executors/*`, `core/resilience/*`
- `core/synapse/context/hierarchical-context-manager.js`, `semantic-handshake-engine.js`
- `core/pro/*`, `squad-creator`, Grok integration (PR #800)
- `core/permissions/permission-mode.js`, `operation-guard.js` (**extend**, do not replace)

### Critério de port (all true)

1. Single-repo project (no multi-BU monorepo)
2. No `services/*`, Supabase Sinkra, `policy/cards`, **`workspace/`**, journey-log product
3. Improves framework CLI/agents/quality/security
4. MIT-safe, no client IP
5. No regression of OSS-superior modules

### Explicitamente FORA (OSS)

| Forbidden | Why |
|-----------|-----|
| `workspace/` trees, L0/L1 identity docs, multi-BU spokes | Product/org layout — **never in OSS core** |
| `services/*` (mux-adapter, journey-log, llm-router, clickup…) | Product |
| Policy digests / BU accountability hard gates | Hub multi-business |
| Model tribunal harness | Enterprise |
| Themes packs / domain squads / `sinkra-*` skills | Expansion, not core |
| Constitution VII–X / XIII as **MUST** runtime | Multi-BU / scheduler product |
| Journey-log / workspace-bus **runtime** | OOS |

### Port gates

1. OSS-wins list = **merge-blocking**
2. Denylist CI on hub-ported files (`sinkra_`, `.sinkra/`, `mux-adapter`, `workspace/`, coolify, `/Users/`, secrets)
3. **A3+A4** required to **merge** B/C/D FS/network surfaces
4. Wave-scoped PRs after #800
5. **Architecture slice required per wave** before that wave’s implementation stories start (B–E)

---

## Architecture docs (required)

| Wave | Doc | Status |
|------|-----|--------|
| 0 | [ARCHITECTURE-WAVE-0.md](./ARCHITECTURE-WAVE-0.md) | ✅ |
| A | [ARCHITECTURE-WAVE-A.md](./ARCHITECTURE-WAVE-A.md) | ✅ |
| B | [ARCHITECTURE-WAVE-B.md](./ARCHITECTURE-WAVE-B.md) | ✅ |
| C | [ARCHITECTURE-WAVE-C.md](./ARCHITECTURE-WAVE-C.md) | ✅ |
| D | [ARCHITECTURE-WAVE-D.md](./ARCHITECTURE-WAVE-D.md) | ✅ required scope done; D3/D4 optional backlog |
| E | [ARCHITECTURE-WAVE-E.md](./ARCHITECTURE-WAVE-E.md) | ✅ (E1 done; E3 optional) |

Each ARCH doc must cover: components, data/control flow, integration points, configuration, failure modes, and “what not to port”. Diagram preferred (mermaid).

---

## Waves & Stories

### Wave 0 — Drift harness (P0 governance)

| Story | Título | Notes | Status |
|-------|--------|-------|--------|
| CORE-SU.0 | 3-way `.aiox-core` diff harness | `npm run diff:framework-3way` + advisory doctor integration | ✅ Done |

This is now the governance baseline before another broad harvest. It is read-only and does not require private sibling repos for public OSS users.

### Wave A — Runtime hygiene (P0) — ✅ shipped

| Story | Título | Notes | Status |
|-------|--------|-------|--------|
| CORE-SU.A1 | SYNAPSE timeout configurável | #798; see story file | ✅ Done |
| CORE-SU.A2 | ConfigCache / Jest residual | #797 | ✅ Done |
| CORE-SU.A3 | **Add** path/prompt/ssrf guards | Extend `core/permissions` | ✅ Done |
| CORE-SU.A4 | Smoke + doctor + port denylist CI | denylist CI + doctor | ✅ Done |

**DoD Wave A:** lint + typecheck + test; timeout knobs documented; guards unit-tested and exported from permissions index; denylist script; #797/#798 closed **or** residual documented with evidence.

Clarification from 3-repo verification: `hook-runtime.js` was identical across the three repos at comparison time, so there was no hub/enterprise hook-runtime port. The real SYNAPSE harvest delta is `memory-bridge` heuristics; any future work there belongs under Wave D, not A1.

### Wave B — SDC skills OSS (P0) — ✅ shipped (ARCH-B accepted)

| Story | Título | Status |
|-------|--------|--------|
| B0–B8 | Lean skills + full-sdc/wave EXECUTE + CLI | ✅ Done |

Source selection rule: use the enterprise `full-sdc` lean variant as the baseline, then enrich only with OSS-safe hub behavior. Do not strip the 2200-line hub skill down manually unless the enterprise baseline is missing a required behavior. Strip: no `sinkra_*`, `.sinkra/`, `workspace/`, product deploy hosts. Skills invoke tasks only.

### Wave C — Orchestration (stretch) — ARCH-C ✅ **COMPLETE**

| Story | Status |
|-------|--------|
| C1 Wave run controller (advance/mark/cascade/report) | ✅ Done |
| C2 Optional parallel dispatch adapter | ✅ Done (`dispatch-adapter.js`) |
| C3 Epic glue + report polish | ✅ Done (`from-epic`, epic-glue) |
| C4 Tests | ✅ Done (23 unit/integration tests) |

Executed via **wave-execute** wave `CORE-SU-C` + **full-sdc** per story (YOLO).

Diff-shape note: `wave-executor.js` is a 2-way delta (OSS and enterprise identical; hub evolved). `master-orchestrator.js` remains a true 3-way comparison, but enterprise is smaller than OSS, so treat enterprise as a cautionary reference rather than a merge base.

### Wave D — IDE / SYNAPSE (stretch) — ARCH-D ✅

See [ARCHITECTURE-WAVE-D.md](./ARCHITECTURE-WAVE-D.md).

| Story | Escopo | Status |
|-------|--------|--------|
| D1 | IDE sync contract (`docs/framework/ide-sync-contract.md`) | ✅ Done |
| D2 | `memory-bridge` heuristics harvest | ✅ Done via [CORE-SU.MB](./STORY-CORE-SU.MB-MEMORY-BRIDGE.md) |
| D3 | Parity smoke extensions (only if future drift check shows a gap) | ⬜ Optional backlog |
| D4 | `context-optimizer` port como **skill** (não engine) | ⬜ Optional backlog |
| D5 | three-brain skill | 🚫 DEFERRED |

Clarification: `context-optimizer` is a skill in hub/enterprise, not a core engine module. If ported, it should land as an OSS-safe skill with task references, not as a new runtime merge.

### Wave E — Constitution — ARCH-E ✅ (partial)

See [ARCHITECTURE-WAVE-E.md](./ARCHITECTURE-WAVE-E.md). **E1 Done** — Articles XI+XII in `.aiox-core/constitution.md` v1.1.0 (no Workspace Bus). E3 cross-links optional. E4 **DEFERRED**.

**Canonical numbering for OSS (decision):** follow **hub numbering** for new articles:

| Article | OSS text source | Notes |
|---------|-----------------|-------|
| I–VI | Keep current OSS constitution | Unchanged baseline |
| **XI** | Hub Squad-First Portability | Port to OSS |
| **XII** | Hub **Model Governance** (not Enterprise’s XII Workspace Bus) | Strip tribunal/service deps |
| VII–X, XIII | **Not MUST** | Optional extensions **doc only** — no workspace bus runtime |

Enterprise renumbers XII as Workspace Bus — **do not** use enterprise numbering for OSS.

Enterprise constitution detail: enterprise has I–XII with XII as Workspace Bus; hub has I–XIII with XII as Model Governance and XIII as Workspace Bus. OSS follows hub XI/XII only and excludes Workspace Bus runtime.

E3 docs-only. E4 governance-pipeline skill **DEFERRED**.

### Wave F — Installer

| Story | Priority | Notes | Status |
|-------|----------|-------|--------|
| F1 Windows ECOMPROMISED #773 | **P1** | docs + install hint + doctor WARN | ✅ Done |
| F2 doctor heuristic | P2 | optional follow-up | ⬜ Optional backlog |
| F3 theme-resolver | **DEFERRED** | | 🚫 |

---

## Dependency rules (implementation)

| Wave | Implement when |
|------|----------------|
| A | ARCH-A present + A1–A4 drafted |
| B | ARCH-B + Wave A merge gates (A3/A4) |
| C | ARCH-C + MVP or explicit C-only justification |
| D | ARCH-D + A+B6 |
| E | ARCH-E + E0 numbering decision locked (this epic) |
| F1 | anytime (// A) |

```
#800 merge → main
     │
     ▼
  ARCH-A → Wave A (implement) ──patch 5.2.x optional──┐
     │                                                │
     │         ARCH-B → Wave B ──MVP 5.3.0────────────┤
     │                                                │
     └── B–E blocked without per-wave ARCH            │
                                                      ▼
                                              stretch C/D/E/F
```

## Métricas

| Métrica | Baseline | Target |
|---------|----------|--------|
| SDC skills | ~0 | ≥6 + full-sdc lean (post ARCH-B) |
| SYNAPSE timeout | hardcode 100 | env + config + warn |
| path/prompt/ssrf guards | **missing** (permission-mode/operation-guard **exist**) | added + tested |
| #797 / #798 | open | closed or residual-evidence |
| Constitution | I–VI | + XI + XII (hub Model Governance) |
| OSS-only modules | present | still tested |
| Denylist | none | includes `workspace/`, sinkra, secrets |
| Public epic path | gitignored stories | `docs/framework/epics/` |
| Drift harness | manual 3-repo compare | repeatable Wave 0 report |

## Completion boundary

This epic is complete for the OSS super-update PR when all of the following are true:

1. Waves 0/A/B/C and stories D1/D2/E1/F1 are shipped on `feat/core-super-update-epic`.
2. Optional items D3, D4, E3, and F2 are tracked as non-blocking backlog.
3. Deferred items D5, E4, and F3 remain explicitly out of scope.
4. Denylist, manifest, registry, diff harness, lint, typecheck, and tests pass on the final branch state.
5. GitHub issues #773, #797, and #798 are closed only after the merge PR exists, so each close comment can cite the PR link.

## Riscos

| Risk | Mitigation |
|------|------------|
| Force-add gitignored stories | Use framework path only |
| Stale index.md | Do not version generated story indexes |
| Wave B without architecture | ARCH-B hard gate |
| Overwrite permissions module | Extend only; metric wording corrected |
| Workspace leak from hub | Denylist + OOS table |
| Constitution renumber conflict | Hub numbering locked for XI/XII |
| Super-update becomes one-off event | Wave 0 diff harness + advisory doctor check |
| PR chain drift | Rebase this branch after PR #800 merges; rerun full gates |
| Generated local Codex/Claude artifacts | `.codex/` stays ignored; `.claude/skills/aios-*` stay untracked unless hardened and intentionally versioned |

## Next actions

1. [x] Align `docs/framework/epics/` vs `docs/stories/` in repo rules and generated IDE guidance
2. [x] Implement CORE-SU.0 diff harness
3. [x] Classify `.codex/` generated hooks/agents as not versioned until hardened
4. [ ] Open/merge PR for `feat/core-super-update-epic` after #800 chain is settled
5. [ ] Close GitHub #773 / #797 / #798 with merge PR links

## References

- Issues: #798, #797, #773  
- PR: #800  
- Related OSS epics (do not conflict): error-governance, 447 hierarchical-context, 482 immortality, 483 handshake  

---

*Revised 2026-07-09 after architect-first validation and direct 3-repo fact verification. No workspace artifacts in OSS scope.*
