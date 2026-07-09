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

Resultado esperado: core instalável com **SDC invocável (skills)**, **runtime mais robusto**, **guards de segurança**, **IDE parity** e **constituição alinhada** — preservando o que o OSS já tem de melhor.

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

---

## Waves & Stories

### Wave A — Runtime hygiene (P0)

| Story | Título | Source issue / nota | Status |
|-------|--------|---------------------|--------|
| CORE-SU.A1 | SYNAPSE `PIPELINE_TIMEOUT_MS` configurável | #798 | Draft |
| CORE-SU.A2 | ConfigCache: skip `setInterval` sob Jest | #797 | Draft |
| CORE-SU.A3 | Permissions guards: path / prompt / SSRF | hub `core/permissions/*-guard.js` | Draft |
| CORE-SU.A4 | Smoke tests + doctor checks de guards/timeout | — | Draft |

**DoD Wave A:** lint, typecheck, test green; timeout default documentado; guards unit-tested.

---

### Wave B — SDC skills OSS (P0, maior impacto UX)

Port **lean** (protocolo enxuto; tasks existentes continuam SOT).

| Story | Título | Source | Status |
|-------|--------|--------|--------|
| CORE-SU.B1 | Skill `validate-story-draft` (OSS) | hub/ent | Draft |
| CORE-SU.B2 | Skill `develop-story` (OSS) | hub/ent | Draft |
| CORE-SU.B3 | Skill `review-story` + `apply-qa-fixes` | hub/ent | Draft |
| CORE-SU.B4 | Skill `close-story` + `commit` | hub/ent | Draft |
| CORE-SU.B5 | Skill `full-sdc` **core lean** (~300–500 LOC protocolo) | hub `full-sdc` strip Sinkra | Draft |
| CORE-SU.B6 | Wire skills em Claude + Grok + Codex sync | ide-sync / grok-skills-sync | Draft |

**Regras de strip (Wave B):**

- Remover `sinkra_tier`, `owner_squad: sinkra-*`, paths `.sinkra/`
- Worktree lifecycle (WL-1..WL-7): **v1 opcional / simplified** — não portar 2200 linhas de full-sdc hub de uma vez
- Tasks em `.aiox-core/development/tasks/` permanecem fonte de verdade executável
- Skills **invocam** tasks; não duplicar lógica divergente

**DoD Wave B:** `/full-sdc` (ou skill equivalente) roda em greenfield mock story; paridade slash nos 3 IDEs.

---

### Wave C — Orchestration merge (P1)

| Story | Título | Source | Status |
|-------|--------|--------|--------|
| CORE-SU.C1 | 3-way diff `master-orchestrator` + plan de merge | hub vs OSS | Draft |
| CORE-SU.C2 | `wave-executor` / wave skill **core** (sem mux-adapter) | hub `wave-execute` lean | Draft |
| CORE-SU.C3 | Model-router **opcional** (sem tribunal) | hub `orchestration/model-router.js` | Draft |
| CORE-SU.C4 | Preservar + documentar `external-executors` + `fast-path-gate` | OSS-only | Draft |

**DoD Wave C:** merge sem regressão de external-executors; wave smoke em 2 stories fake.

---

### Wave D — IDE parity & SYNAPSE runtime (P1)

| Story | Título | Source | Status |
|-------|--------|--------|--------|
| CORE-SU.D1 | Subir `ide-sync` avançado (adapters multi-IDE) | hub ide-sync +41k LOC | Draft |
| CORE-SU.D2 | Integrar Grok no `sync:ide` (não só script solto) | PR #800 + ide-sync | Draft |
| CORE-SU.D3 | `hook-runtime` + `memory-bridge` merge | hub/ent | Draft |
| CORE-SU.D4 | `context-optimizer` + handoff skill | hub/ent | Draft |
| CORE-SU.D5 | `three-brain` multi-engine review (lean) | hub | Draft |

**DoD Wave D:** `npm run sync:ide` + `sync:skills:grok` + validate parity green.

---

### Wave E — Constitution & governance (P1, seletivo)

| Story | Título | Source | Status |
|-------|--------|--------|--------|
| CORE-SU.E1 | Art. **XI Squad-First Portability** (OSS) | hub constitution | Draft |
| CORE-SU.E2 | Art. **XII Model Governance** (strip enterprise-only) | hub | Draft |
| CORE-SU.E3 | Doc: scheduling / journey-log / BU como **optional extensions** | hub VII–X, XIII | Draft |
| CORE-SU.E4 | `governance-pipeline` skill lean | hub/ent | Draft |

**DoD Wave E:** constitution version bump; gates documentados; sem hard dependency de multi-BU.

---

### Wave F — Installer & quality (P2)

| Story | Título | Source | Status |
|-------|--------|--------|--------|
| CORE-SU.F1 | Windows `npx` ECOMPROMISED mitigation | #773 | Draft |
| CORE-SU.F2 | Doctor heuristic-scan (subset OSS) | hub doctor checks | Draft |
| CORE-SU.F3 | Theme-resolver API only (packs out-of-tree) | hub themes | Draft |

---

## Roadmap visual

```
PR #800 (Grok) ──merge──► main
                           │
                           ▼
              feat/core-super-update-epic (este doc)
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
      Wave A            Wave B            Wave C
   (hygiene)         (SDC skills)     (orchestrate)
         │                 │                 │
         └────────┬────────┴────────┬────────┘
                  ▼                 ▼
               Wave D            Wave E
            (IDE/SYNAPSE)     (constitution)
                  │
                  ▼
               Wave F (installer/quality)
```

## Dependências entre waves

| Wave | Depende de |
|------|------------|
| A | nenhuma (pode começar imediatamente) |
| B | A recomendado (timeout/guards estáveis) |
| C | B (skills SDC existem para wave chamar) |
| D | B (wire skills) + A (runtime estável) |
| E | pode paralelo a B/C |
| F | paralelo ou final |

## Métricas de sucesso

| Métrica | Baseline (hoje) | Target |
|---------|-----------------|--------|
| Skills SDC invocáveis no OSS | ~0 | ≥ 6 atômicas + 1 full-sdc lean |
| SYNAPSE timeout | hardcode 100ms | config + env override |
| Permissions guards | ausentes no OSS | path+prompt+ssrf unit-tested |
| IDE targets com skills sync | Claude/Codex/Gemini (+Grok script) | + Grok no `sync:ide` oficial |
| Issues #797, #798 | open | closed |
| Constitution | I–VI | I–VI + XI + XII (seletivo) |

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
2. [ ] Abrir stories CORE-SU.A1–A4 e executar Wave A  
3. [ ] Spike: full-sdc lean outline (antes de B5)  
4. [ ] 3-way diff formal master-orchestrator (C1)  

---

*Epic criado em 2026-07-09 a partir da branch do PR #800 (`feat/grok-agents-skills`).*
