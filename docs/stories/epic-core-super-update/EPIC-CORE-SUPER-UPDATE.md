# Epic CORE-SUPER-UPDATE: AIOX Core Harvest from Hub & Enterprise

## Metadata

| Campo | Valor |
|-------|-------|
| Epic ID | CORE-SUPER-UPDATE |
| Status | Draft |
| Priority | P0 |
| Branch base | `feat/grok-agents-skills` (PR #800) → merge chain into `main` |
| Working branch | `feat/core-super-update-epic` |
| Sources | `../sinkra-hub`, `../AIOX-enterprise` (differential, 2026-07-09) |
| Target package | `@aiox-squads/core` (open source) |

## Objetivo

Trazer para o **aiox-core OSS** o que o framework ganhou em **sinkra-hub** e **AIOX-enterprise**, sem importar produto Sinkra, monorepo multi-BU, squads de domínio ou IP enterprise.

**Promessa MVP (headline):** instalar `@aiox-squads/core` → slash-run **validate → develop → review → close** sem monorepo hub.

Resultado esperado: core instalável com **SDC invocável (skills)**, **runtime mais robusto**, **guards de segurança**, **IDE parity** e **constituição alinhada** — preservando o que o OSS já tem de melhor.

## MVP cut (ship train)

| Release | Conteúdo | Semver esperado |
|---------|----------|-----------------|
| **MVP** | Phase 0 + **Wave A** + **Wave B** | **minor 5.3.0** (skills surface) |
| Stretch | Waves C–F | epics follow-on ou minor later |

- **Wave A** sozinha pode fechar como **patch 5.2.x** (#797/#798) se B atrasar.
- **Waves C–F** não bloqueiam anúncio de SDC skills; têm ADRs/PRs independentes.

## Roundtable

| Campo | Valor |
|-------|-------|
| Date | 2026-07-09 |
| Mode | epic_review |
| Lenses | architect, qa, devops, pm |
| Verdict | **APPROVE_WITH_FIXES** |
| Report | embedded below (findings resolved into this epic + ROADMAP) |

## Contexto (por que agora)

| Repo | Papel | Observação |
|------|--------|------------|
| **aiox-core** (OSS) | Framework `@aiox-squads/core` **5.2.9** | Forte em errors, resilience, hierarchical-context, semantic-handshake, pro, Grok |
| **sinkra-hub** | Produto + lab de orquestração | `full-sdc`, `wave-execute`, guards, constitution I–XIII, ide-sync avançado |
| **AIOX-enterprise** | Workspace enterprise | SDC lean, policy, model tribunal (maioria **fora** do OSS) |

### Achado central

O OSS **não está “parado” no motor** (módulos que hub/ent **não** têm). O atraso está em:

1. **Skills de workflow SDC** (quase ausentes no OSS)
2. **Governance de runtime** (timeouts, permissions guards)
3. **IDE sync / multi-CLI** (hub avançou; OSS tem Grok à parte)

### O que o OSS já tem e NÃO deve ser sobrescrito

- `.aiox-core/core/errors/*`
- `.aiox-core/core/external-executors/*`
- `.aiox-core/core/resilience/*` (agent immortality)
- `.aiox-core/core/synapse/context/hierarchical-context-manager.js`
- `.aiox-core/core/synapse/context/semantic-handshake-engine.js`
- `.aiox-core/core/pro/*` + CLI Pro
- Agent `squad-creator` + tasks de publish
- Integração Grok (PR #800)

### Critério de port (todos devem ser verdade)

1. Funciona em **projeto single-repo** (sem monorepo multi-BU)
2. Não depende de `services/*`, Supabase Sinkra, ou `policy/cards` de hub
3. Melhora CLI / agents / quality / security do **framework**
4. Licença MIT / OSS sem vazamento de IP de clientes
5. Não regrede módulos OSS listados acima

### Explicitamente FORA deste épico

- `services/*` (mux-adapter, journey-log, llm-router, clickup…)
- Policy digests / journey-log service / BU accountability hard gates
- Model tribunal harness completo (ADR-158 enterprise)
- Themes cosméticos (harrypotter, matrix…)
- Squads de domínio / marketing / content
- Skills `sinkra-*` acopladas ao produto
- Constituição Art. VIII–X / XIII como MUST hard no OSS (só opcional/doc)
- **Runtime skill** para journey-log / BU / tribunal (E3 = **docs only**)
- Bulk dump de ide-sync hub sem allowlist/adapter slices

### Port gates (enforced)

1. **OSS-wins list** is a **merge gate**, not a trailing story — any PR that deletes/overwrites listed OSS-superior modules is blocked.
2. **Strip denylist CI** before merge of hub-ported files: `sinkra_`, `.sinkra/`, `mux-adapter`, client hostnames, `coolify`, absolute `/Users/`, secret patterns.
3. **A3+A4 hard prerequisite** to **merge** Wave B/C/D surfaces that write FS or fetch URLs (drafting B skills in parallel OK).
4. **Wave-scoped PRs** after #800 merges (not one mega-PR).
5. **docs/stories/** is gitignored — epic tracked via `git add -f` **or** promote to `docs/framework/epics/` (D1 finding). Prefer framework path for public plan artifacts going forward.

---

## Waves & Stories

### Wave A — Runtime hygiene (P0)

| Story | Título | Source issue / nota | Status |
|-------|--------|---------------------|--------|
| CORE-SU.A1 | SYNAPSE `PIPELINE_TIMEOUT_MS` configurável | #798 | Draft |
| CORE-SU.A2 | ConfigCache: Jest open-handle fix (reproduce-first) | #797 | Draft |
| CORE-SU.A3 | Permissions guards: path / prompt / SSRF | hub `core/permissions/*-guard.js` | Draft |
| CORE-SU.A4 | Smoke tests + doctor + **port denylist CI** | RT D2/D9 | Draft |

**DoD Wave A:** `npm run lint && typecheck && test` green; timeout default + clamp documented; guards unit-tested + wired into `core/permissions`; denylist script exists; #797/#798 closable with evidence.

---

### Wave B — SDC skills OSS (P0, maior impacto UX)

Port **lean** (protocolo enxuto; tasks existentes continuam SOT).

| Story | Título | Source | Status |
|-------|--------|--------|--------|
| CORE-SU.B0 | **Spike ADR:** full-sdc lean protocol (phases, skill→task map, non-ported WL) | RT A3/P4 | Draft |
| CORE-SU.B1 | Skill `validate-story-draft` (OSS) | hub/ent | Draft |
| CORE-SU.B2 | Skill `develop-story` (OSS) | hub/ent | Draft |
| CORE-SU.B3 | Skill `review-story` + `apply-qa-fixes` | hub/ent | Draft |
| CORE-SU.B4 | Skill `close-story` + `commit` | hub/ent | Draft |
| CORE-SU.B5 | Skill `full-sdc` **core lean** (thin orchestrator; outcome AC not LOC-only) | hub strip + B0 | Draft |
| CORE-SU.B6 | Wire skills em Claude + Grok + Codex sync | ide-sync / grok-skills-sync | Draft |

**Regras de strip (Wave B):**

- Remover `sinkra_tier`, `owner_squad: sinkra-*`, paths `.sinkra/`
- Worktree lifecycle (WL-1..WL-7): **v1 opcional / simplified** — list explicit non-ported features in B0
- Tasks em `.aiox-core/development/tasks/` permanecem fonte de verdade executável
- Skills **invocam** tasks; não duplicar lógica divergente
- **Anti-bloat:** CI grep forbidden tokens; soft LOC budget; hard ban on re-implementing task logic

**DoD Wave B:** mock fixture story Ready→Done via skill pipeline (scripted assert); denylist clean; skills listed in Claude/Grok/Codex inspect.

---

### Wave C — Orchestration merge (P1 / stretch pós-MVP)

| Story | Título | Source | Status |
|-------|--------|--------|--------|
| CORE-SU.C1 | 3-way diff `master-orchestrator` + **keep/merge/drop** plan (OSS wins rows) | hub vs OSS | Draft |
| CORE-SU.C2 | `wave-executor` / wave skill **core** (sem mux-adapter) | hub lean | Draft |
| CORE-SU.C3 | Model-router **optional plugin** (default off; no tribunal) | hub | Draft |
| CORE-SU.C4 | external-executors + fast-path-gate regression tests **in same PR** as orchestrator touch | OSS-only | Draft |

**DoD Wave C:** targeted tests for external-executors + fast-path-gate green; wave smoke 2 mock stories; package graph forbids services/mux-adapter.

---

### Wave D — IDE parity & SYNAPSE runtime (P1 / stretch; D1 sliced)

| Story | Título | Source | Status |
|-------|--------|--------|--------|
| CORE-SU.D1 | ide-sync **adapter-by-adapter** (allowlist + LOC budget; no +41k dump) | hub | Draft |
| CORE-SU.D2 | Grok as official adapter in single sync pipeline (converge PR #800 script) | PR #800 | Draft |
| CORE-SU.D3 | `hook-runtime` + `memory-bridge` merge (preserve hierarchical-context) | hub/ent | Draft |
| CORE-SU.D4 | `context-optimizer` + handoff skill | hub/ent | Draft |
| CORE-SU.D5 | `three-brain` lean | hub | **DEFERRED** (stretch epic) |

**DoD Wave D:** `sync:ide` + `sync:skills:grok` + parity; package size delta within budget; one sync model (no dual scripts).

---

### Wave E — Constitution & governance (P1 seletivo; docs-first)

| Story | Título | Source | Status |
|-------|--------|--------|--------|
| CORE-SU.E0 | One-page OSS constitution delta (XI/XII advisory vs MUST) **before B6 packaging** | RT A5 | Draft |
| CORE-SU.E1 | Art. **XI Squad-First Portability** (OSS) | hub | Draft |
| CORE-SU.E2 | Art. **XII Model Governance** (hooks optional; no tribunal) | hub | Draft |
| CORE-SU.E3 | Doc only: scheduling / journey-log / BU as **optional extensions** | hub | Draft |
| CORE-SU.E4 | `governance-pipeline` skill lean | hub/ent | **DEFERRED** until E1/E2 stable |

**DoD Wave E:** constitution bump + changelog; E3 has **zero** runtime gates.

---

### Wave F — Installer & quality (P1 for F1; rest P2)

| Story | Título | Source | Status |
|-------|--------|--------|--------|
| CORE-SU.F1 | Windows `npx` ECOMPROMISED mitigation | #773 | Draft (elevate **P1**, parallel to A/B) |
| CORE-SU.F2 | Doctor heuristic subset | hub | Draft |
| CORE-SU.F3 | Theme-resolver API only | hub | **DEFERRED** (stretch) |

---

## Roadmap visual (aligned with deps)

```
PR #800 (Grok) ──merge──► main ──rebase──► super-update
                                              │
                    ┌─────────────────────────┤
                    ▼                         │
                 Wave A (hygiene + guards)    │
                    │                         │
         draft B ◄──┤                         │
                    ▼                         │
                 Wave B (SDC skills) = MVP ───┤
                    │                         │
                    ▼                         ▼
                 Wave C (orchestrate)      Wave E (const)
                    │                         │
                    ▼                         │
                 Wave D (IDE)  ◄──────────────┘
                    │
                    ▼
                 Wave F (installer; F1 // earlier)
```

## Dependências entre waves

| Wave | Depende de | Merge rule |
|------|------------|------------|
| A | none (start now; prefer after #800 merge for clean main) | patch-ok |
| B | **A3+A4 required to merge** skills that write FS; A1/A2 can parallel draft | MVP |
| C | B if wave invokes SDC skills; else C1 plan can parallel | stretch |
| D | A + B6 | stretch |
| E | E0 before B6 if XI is MUST; else docs parallel | parallel |
| F1 | none (// A) | P1 |
| F2–F3 | optional | P2 |

## Semver / release

| Event | Version |
|-------|---------|
| Wave A only | 5.2.x patch + CHANGELOG |
| MVP (A+B) | **5.3.0** minor + CHANGELOG skills section |
| C/D/E | further minors; major only if default timeout/gates break consumers |

## Métricas de sucesso

| Métrica | Baseline (hoje) | Target |
|---------|-----------------|--------|
| Skills SDC invocáveis no OSS | ~0 | ≥ 6 atômicas + 1 full-sdc lean |
| SYNAPSE timeout | hardcode 100ms | config + env override + **visible warn** |
| Permissions guards | ausentes no OSS | path+prompt+ssrf unit-tested + wired |
| IDE targets com skills sync | Claude/Codex/Gemini (+Grok script) | single pipeline + Grok adapter |
| Issues #797, #798 | open | closed |
| Constitution | I–VI | I–VI + XI + XII (seletivo) |
| OSS-only modules still tested | present | external-executors + resilience + hierarchical-context + handshake green |
| Port denylist | none | CI fails on forbidden hub tokens / secrets |

## Riscos

| Risco | Mitigação |
|-------|-----------|
| Copiar full-sdc de 2200 linhas com acoplamento Sinkra | Port lean; checklist de strip; review obrigatório |
| Overwrite de módulos OSS superiores | Lista “não sobrescrever”; 3-way merge com testes |
| Scope creep enterprise (tribunal, policy cards) | Out of scope explícito neste EPIC |
| Drift multi-IDE | `validate:parity` + story B6/D2 |

## Referências de discovery

- Análise diferencial repos (sessão 2026-07-09)
- `sinkra-hub/docs/handoffs/2026-06-14-aiox-core-decoupling-session-handoff.md`
- Issues OSS: #798, #797, #773
- PR #800 Grok integration
- Epics OSS existentes a **não conflitar**: epic-447 hierarchical-context, epic-482 immortality, epic-483 handshake, epic-error-governance

## Next actions

1. [ ] Merge PR #800 (Grok) quando CI + review OK  
2. [ ] Implement CORE-SU.A1–A4 (A3 merge-gate for B)  
3. [ ] CORE-SU.B0 spike ADR before B5  
4. [ ] Promote epic docs to `docs/framework/epics/` if gitignore continues to hide planning  
5. [ ] C1 3-way plan only after MVP ship  

---

## Roundtable resolution log (2026-07-09)

| ID | Sev | Resolution | Action |
|----|-----|------------|--------|
| A1 | HIGH | FIXED | OSS-wins = merge gate; C4 tests same PR as orchestrator |
| A2 | HIGH | FIXED | D1 adapter slices + budget; no +41k dump |
| A3 | HIGH | FIXED | B0 ADR spike; lean = protocol not LOC-only |
| A4 | HIGH | FIXED | Dep graph + A3 hard merge prerequisite |
| A5 | MED | FIXED | E0 constitution delta before B6 packaging |
| A6 | MED | FIXED | D5/E4/F3 deferred; C3 optional plugin |
| A7 | MED | FIXED | MVP = A+B; C–F stretch |
| A8 | MED | FIXED | Rebase after #800; single sync pipeline |
| A9 | LOW | FIXED | A1 first; env/clamp in story |
| A10 | LOW | FIXED | Metrics for OSS-only + denylist |
| Q1 | HIGH | FIXED | A1 env name + clamp ACs (story) |
| Q2 | HIGH | FIXED | Visible warn + metrics in A1 |
| Q3 | HIGH | FIXED | Anti-bloat gates Wave B |
| Q4 | MED | FIXED | A2 reproduce-first wording |
| Q5–Q8 | MED/LOW | FIXED/DEFERRED | Exit criteria + DoD gates in epic/roadmap |
| D1 | HIGH | FIXED | force-add + note promote path |
| D2 | HIGH | FIXED | A4 denylist CI story |
| D3 | HIGH | FIXED | A3 hard gate |
| D4 | HIGH | FIXED | wave-scoped PRs post-#800 |
| D5–D9 | MED/LOW | FIXED | semver, F1 P1, A1 clamps, D1 budget |
| P1–P8 | HIGH–LOW | FIXED | MVP cut, sequencing, OOS fence, ship train |

**Total:  resolved / total = 100%** (FIXED into epic/roadmap/story or DEFERRED with named stretch)

---

*Epic criado em 2026-07-09 a partir da branch do PR #800 (`feat/grok-agents-skills`). Roundtable APPROVE_WITH_FIXES applied same day.*
