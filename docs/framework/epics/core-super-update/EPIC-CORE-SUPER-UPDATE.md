# Epic CORE-SUPER-UPDATE: AIOX Core Harvest from Hub & Enterprise

## Metadata

| Campo | Valor |
|-------|-------|
| Epic ID | CORE-SUPER-UPDATE |
| Status | Active — Wave A+B shipped; ARCH-C draft; C1 wave-run controller started |
| Priority | P0 |
| Branch base | `feat/grok-agents-skills` (PR #800) → merge chain into `main` |
| Working branch | `feat/core-super-update-epic` |
| **Canonical path (public OSS)** | `docs/framework/epics/core-super-update/` |
| Sources (read-only harvest) | `../sinkra-hub`, `../AIOX-enterprise` (diff 2026-07-09) |
| Target package | `@aiox-squads/core` (open source) |

> **Docs policy:** `docs/stories/` is **gitignored** (internal / not for GitHub). This epic lives under **`docs/framework/epics/`** so it is versionable and reviewable in OSS. Do **not** force-add `docs/stories/`.

## Objetivo

Trazer para o **aiox-core OSS** o que o framework ganhou em **sinkra-hub** e **AIOX-enterprise**, sem importar produto Sinkra, monorepo multi-BU, **workspace/**, squads de domínio ou IP enterprise.

**Promessa MVP (headline):** instalar `@aiox-squads/core` → slash-run **validate → develop → review → close** sem monorepo hub.

## Implementation readiness (architect-first)

| Gate | Status |
|------|--------|
| Strategic direction | ✅ OK |
| Public versionable path | ✅ `docs/framework/epics/` |
| Architecture slice Wave A | ✅ `ARCHITECTURE-WAVE-A.md` |
| Architecture slice Wave B–E | ⬜ **BLOCKED** until per-wave ARCH doc |
| Wave A implementation | ⬜ only after ARCH-A reviewed |
| Wave B–E implementation | ⬜ **BLOCKED** until design doc per wave |
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

---

## Contexto

| Repo | Papel |
|------|--------|
| **aiox-core** (OSS) | `@aiox-squads/core` **5.2.9** — errors, resilience, hierarchical-context, handshake, pro, Grok |
| **sinkra-hub** | Lab SDC/wave/guards/constitution — **not** the OSS product |
| **AIOX-enterprise** | Enterprise workspace + tribunal (mostly OOS) |

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
| A | [ARCHITECTURE-WAVE-A.md](./ARCHITECTURE-WAVE-A.md) | ✅ |
| B | [ARCHITECTURE-WAVE-B.md](./ARCHITECTURE-WAVE-B.md) | ✅ |
| C | [ARCHITECTURE-WAVE-C.md](./ARCHITECTURE-WAVE-C.md) | ✅ |
| D | [ARCHITECTURE-WAVE-D.md](./ARCHITECTURE-WAVE-D.md) | ✅ draft |
| E | [ARCHITECTURE-WAVE-E.md](./ARCHITECTURE-WAVE-E.md) | ✅ draft |

Each ARCH doc must cover: components, data/control flow, integration points, configuration, failure modes, and “what not to port”. Diagram preferred (mermaid).

---

## Waves & Stories

### Wave A — Runtime hygiene (P0) — **only wave open for implementation after ARCH-A**

| Story | Título | Notes | Status |
|-------|--------|-------|--------|
| CORE-SU.A1 | SYNAPSE timeout configurável | #798; see story file | ✅ Done |
| CORE-SU.A2 | ConfigCache / Jest residual | #797 | ✅ Done |
| CORE-SU.A3 | **Add** path/prompt/ssrf guards | Extend `core/permissions` | ✅ Done |
| CORE-SU.A4 | Smoke + doctor + port denylist CI | denylist CI + doctor | ✅ Done |

**DoD Wave A:** lint + typecheck + test; timeout knobs documented; guards unit-tested and exported from permissions index; denylist script; #797/#798 closed **or** residual documented with evidence.

### Wave B — SDC skills OSS (P0) — **BLOCKED until ARCH-B**

| Story | Título | Status |
|-------|--------|--------|
| B0–B8 | Lean skills + full-sdc/wave EXECUTE + CLI | ✅ Done |

Strip: no `sinkra_*`, `.sinkra/`, `workspace/`, product deploy hosts. Skills invoke tasks only.

### Wave C — Orchestration (stretch) — ARCH-C ✅ **COMPLETE**

| Story | Status |
|-------|--------|
| C1 Wave run controller (advance/mark/cascade/report) | ✅ Done |
| C2 Optional parallel dispatch adapter | ✅ Done (`dispatch-adapter.js`) |
| C3 Epic glue + report polish | ✅ Done (`from-epic`, epic-glue) |
| C4 Tests | ✅ Done (23 unit/integration tests) |

Executed via **wave-execute** wave `CORE-SU-C` + **full-sdc** per story (YOLO).

### Wave D — IDE / SYNAPSE (stretch) — ARCH-D draft ✅

See [ARCHITECTURE-WAVE-D.md](./ARCHITECTURE-WAVE-D.md). D1 story not started. D5 three-brain **DEFERRED**.

### Wave E — Constitution — ARCH-E draft ✅

See [ARCHITECTURE-WAVE-E.md](./ARCHITECTURE-WAVE-E.md). E1–E3 not started. E4 **DEFERRED**.

**Canonical numbering for OSS (decision):** follow **hub numbering** for new articles:

| Article | OSS text source | Notes |
|---------|-----------------|-------|
| I–VI | Keep current OSS constitution | Unchanged baseline |
| **XI** | Hub Squad-First Portability | Port to OSS |
| **XII** | Hub **Model Governance** (not Enterprise’s XII Workspace Bus) | Strip tribunal/service deps |
| VII–X, XIII | **Not MUST** | Optional extensions **doc only** — no workspace bus runtime |

Enterprise renumbers XII as Workspace Bus — **do not** use enterprise numbering for OSS.

E3 docs-only. E4 governance-pipeline skill **DEFERRED**.

### Wave F — Installer

| Story | Priority | Notes | Status |
|-------|----------|-------|--------|
| F1 Windows ECOMPROMISED #773 | **P1** | docs + install hint + doctor WARN | ✅ Done |
| F2 doctor heuristic | P2 | | ⬜ |
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

## Riscos

| Risk | Mitigation |
|------|------------|
| Force-add gitignored stories | Use framework path only |
| Stale index.md | Do not version generated story indexes |
| Wave B without architecture | ARCH-B hard gate |
| Overwrite permissions module | Extend only; metric wording corrected |
| Workspace leak from hub | Denylist + OOS table |
| Constitution renumber conflict | Hub numbering locked for XI/XII |

## Next actions

1. [ ] Merge PR #800 when review allows  
2. [x] Move epic to `docs/framework/epics/`  
3. [x] ARCH-A minimal  
4. [ ] Implement Wave A only (A1 → A2 residual → A3 → A4)  
5. [ ] ARCH-B before any B implementation  

## References

- Issues: #798, #797, #773  
- PR: #800  
- Related OSS epics (do not conflict): error-governance, 447 hierarchical-context, 482 immortality, 483 handshake  

---

*Revised 2026-07-09 after architect-first validation. No workspace artifacts in OSS scope.*
