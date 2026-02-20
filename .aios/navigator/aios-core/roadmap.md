# Project Roadmap: aios-core

**Criado:** 2026-02-19
**Ultima Atualizacao:** 2026-02-20
**Status:** Em Progresso

---

## Overview

- **Tipo de Projeto:** Framework (multi-track)
- **Stack:** Node.js, TypeScript, Jest, Next.js (dashboard)
- **Complexidade:** Alta (6 tracks paralelos, 578 entidades no registry)
- **Velocidade:** ~12 commits/dia (207 commits em fev/2026)

---

## Modelo: Multi-Track Framework

> aios-core nao segue o pipeline linear de 10 fases.
> Como framework, tem **multiplos tracks paralelos** com ciclos independentes.
> Cada track segue o ciclo: Epic → Stories → Dev → QA → Deploy

---

## Tracks Ativos

### Track 1: BOB Orchestrator (EPIC-BOB-VAL)

**Status:** 🔄 Em Progresso (58%)
**Prioridade:** Alta
**Epic:** `docs/stories/epics/epic-bob-validation/`

| Wave | Nome | Stories | Status |
|------|------|---------|--------|
| 1 | Coverage | 6 | ✅ Completa |
| 2 | Integration | 1 (BOB-COV-7) | ✅ Completa (9/9 tests) |
| 3 | P0 Validation | 3 (P0-1, P0-2, P0-3) | ⏳ Pendente (P0-3-FIX ✅ Done) |
| 4 | E2E Smoke Test | 1 (TEST-BOB-1) | ⏳ Pendente |

**Proxima acao:** Investigar BOB-P0-3 CRITICAL ISSUE → iniciar Wave 3
**Agente:** @dev → @qa

---

### Track 2: Mind Cloning (EPIC-MC)

**Status:** ⏳ Pendente (0%)
**Prioridade:** Alta
**Epic:** `docs/stories/epics/epic-mind-cloning/`

| Wave | Nome | Stories | Status |
|------|------|---------|--------|
| 1 | First Clone | 1 (MC-1.1 Italo Marsili) | ⏳ Draft |

**Proxima acao:** Iniciar pipeline mind-cloning para MC-1.1
**Agente:** @mind-cloner + @oalanicolas
**Source Material:** 281 transcricoes (~8.8MB)

---

### Track 3: Design Systems (EPIC-DS)

**Status:** 🔄 Em Progresso (parcial)
**Prioridade:** Alta
**Epic:** `docs/stories/epics/epic-design-systems/`

| Wave | Nome | Stories | Status |
|------|------|---------|--------|
| 1 | Foundation | 1 (1.1 EcoFlow) | 🔄 Ready for Review |
| 2 | Expansion | 1 (2.1 iOS DS) | ⏳ Draft |
| 3 | Application | 1 (3.1 GarimpoAI) | ⏳ Draft |

**Proxima acao:** Revisar e aprovar EcoFlow DS → iniciar iOS DS
**Agente:** @ux-design-expert → @architect

---

### Track 4: Video Transcriber (EPIC-VT)

**Status:** ✅ Completo (100%)
**Prioridade:** Critica (P0)
**Epic:** `docs/stories/epics/epic-video-transcriber/`

| Wave | Nome | Stories | Status |
|------|------|---------|--------|
| 1 | Quality & Integration | 1 (VT-1.1) | ✅ Done (194 tests, 87% coverage, QA PASS) |

**Proxima acao:** Nenhuma — track completo. Futuras stories podem ser adicionadas.
**Agente:** —

---

### Track 5: CLI & Developer Experience (EPIC-CLI-DX)

**Status:** ⏳ Pendente
**Prioridade:** Alta
**Epic:** `docs/stories/epics/epic-cli-dx/`

| Wave | Nome | Stories | Status |
|------|------|---------|--------|
| 1 | Visual Context | 1 (CLI-DX-1) | ⏳ Draft |

**Proxima acao:** Validar e iniciar CLI-DX-1
**Agente:** @dev → @architect

---

### Track 6: Synapse Context Engine (EPIC-SYN)

**Status:** ⏳ Pendente
**Prioridade:** Media
**Epic:** `docs/stories/epics/epic-synapse-context-engine/`

| Wave | Nome | Stories | Status |
|------|------|---------|--------|
| 1 | Core Hooks | 4 (SYN-7, SYN-8, SYN-10, SYN-11) | ⏳ Pendente |

**Proxima acao:** Priorizar e sequenciar stories
**Agente:** @architect → @dev

---

### Track 7: Agent Identity (Story 6.1.4)

**Status:** ⏳ Ready to Start
**Prioridade:** Critica
**Epic:** EPIC-6.1 (Agent Identity System)

| Story | Status |
|-------|--------|
| 6.1.4 Unified Greeting System | ⏳ Ready to Start |

**Proxima acao:** Iniciar implementacao
**Agente:** @dev

---

## Resumo de Progresso

| Track | Epic | Total | Done | In Progress | Pending | % |
|-------|------|-------|------|-------------|---------|---|
| BOB Validation | EPIC-BOB-VAL | 12 | 6 | 1 | 5 | 50% |
| Mind Cloning | EPIC-MC | 1 | 0 | 0 | 1 | 0% |
| Design Systems | EPIC-DS | 3 | 0 | 1 | 2 | 0% |
| Video Transcriber | EPIC-VT | 1 | 0 | 1 | 0 | 0% |
| CLI DX | EPIC-CLI-DX | 1 | 0 | 0 | 1 | 0% |
| Synapse Engine | EPIC-SYN | 4 | 0 | 0 | 4 | 0% |
| Agent Identity | EPIC-6.1 | 1 | 0 | 0 | 1 | 0% |
| **TOTAL** | | **23** | **6** | **3** | **14** | **26%** |

---

## Metricas

- **Stories totais:** 23 (ativas) + 15 (completas) = 38
- **Stories completas:** 21 (6 BOB-COV + 15 em completed/)
- **Commits em fev/2026:** 207
- **Velocidade:** ~12 commits/dia
- **Epicos ativos:** 7
- **Entity Registry:** 578 entidades

---

## Proximos Passos Recomendados

**Prioridade 1 (em andamento):**
1. Completar BOB-COV-7 (Integration Tests) — @dev
2. Completar QA review de VT-1.1 — @qa

**Prioridade 2 (proximo):**
3. Iniciar Wave 3 do BOB (P0 Validation) — @dev
4. Revisar EcoFlow DS (1.1) — @architect

**Prioridade 3 (backlog):**
5. Iniciar MC-1.1 (Mind Clone Italo) — @mind-cloner
6. Iniciar Story 6.1.4 (Unified Greeting) — @dev
7. Planejar CLI-DX-1 — @architect

---

## Blockers

_Nenhum blocker critico identificado._

**Atencao:**
- BOB-P0-3-VAL tem status CRITICAL ISSUE FOUND — investigar antes de iniciar Wave 3
- Story 6.1.4 esta Ready to Start ha mais de 1 mes (criada jan/2025)

---

## Checkpoints

Ver: `.aios/navigator/aios-core/checkpoints/`

---

## Context Anchors

**Documentos principais:**
- Entity Registry: `.aios-core/data/entity-registry.yaml`
- Constitution: `.aios-core/constitution.md`
- Core Config: `.aios-core/core-config.yaml`

**Epics:**
- BOB Validation: `docs/stories/epics/epic-bob-validation/`
- Mind Cloning: `docs/stories/epics/epic-mind-cloning/`
- Design Systems: `docs/stories/epics/epic-design-systems/`
- Video Transcriber: `docs/stories/epics/epic-video-transcriber/`
- CLI DX: `docs/stories/epics/epic-cli-dx/`
- Synapse Engine: `docs/stories/epics/epic-synapse-context-engine/`

---

**Gerado por Navigator Agent**
**Ultima atualizacao:** 2026-02-19
