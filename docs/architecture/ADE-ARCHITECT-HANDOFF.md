# ADE Architect Handoff

> **From:** Quinn (@qa) - QA Agent
> **To:** Sage (@architect) - Solution Architect
> **Date:** 2026-01-28
> **Project:** AIOS Autonomous Development Engine (ADE)

---

## Executive Summary

O ADE é um projeto de **Prompt Engineering + Infraestrutura** para habilitar execução autônoma de desenvolvimento no AIOS. Aproximadamente **60% do trabalho é criação de tasks .md, workflows .yaml e templates** - não código tradicional.

**Você é o líder técnico deste projeto.** @dev será acionado apenas para scripts JS específicos.

---

## Dependency Analysis

### Critical Path (Sequencial Obrigatório)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CRITICAL PATH                                      │
│                                                                              │
│  Epic 1 ──────► Epic 2 ──────► Epic 3 ──────► Epic 4                        │
│  Worktree       Migration      Spec Pipeline   Execution                    │
│  (P0)           (P0)           (P0)            (P0)                         │
│                                                                              │
│  BLOCKING: Cada epic depende do anterior estar COMPLETO                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Parallel Opportunities (Após Epic 4)

```
                              Epic 4 (Execution)
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                                 ▼
             Epic 5 (Recovery)              Epic 6 (QA Evolution)
             P1 - 4 stories                 P1 - 5 stories
                    │                                 │
                    └────────────────┬────────────────┘
                                     ▼
                              Epic 7 (Memory)
                              P2 - 4 stories
```

**Epic 5 e Epic 6 podem rodar em PARALELO** após Epic 4 completo.

---

## Dependency Matrix

| Epic                 | Requires | Blocks     | Parallel With |
| -------------------- | -------- | ---------- | ------------- |
| **1. Worktree**      | -        | 2, 4       | -             |
| **2. Migration**     | 1        | 3, 4, 5, 6 | -             |
| **3. Spec Pipeline** | 2        | 4          | -             |
| **4. Execution**     | 3        | 5, 6       | -             |
| **5. Recovery**      | 4        | 7          | **6**         |
| **6. QA Evolution**  | 4        | 7          | **5**         |
| **7. Memory**        | 5, 6     | -          | -             |

---

## Preparation Parallelism

Embora os épicos tenham dependências de **implementação**, você pode **preparar** épicos futuros enquanto o atual está em desenvolvimento:

| Enquanto executa | Pode preparar (sem implementar)            |
| ---------------- | ------------------------------------------ |
| Epic 1           | Schemas V3 do Epic 2 (design)              |
| Epic 2           | Estrutura das tasks do Epic 3              |
| Epic 3           | Estrutura do implementation.yaml do Epic 4 |
| Epic 4           | Design do Epic 5 e 6 em paralelo           |

---

## Epic Breakdown por Tipo de Trabalho

### Epic 1: Worktree Manager (P0) - 5 stories

**Tipo:** 70% Código, 30% Prompt Engineering

| Story | Deliverable                           | Tipo        |
| ----- | ------------------------------------- | ----------- |
| 1.1   | worktree-manager.js                   | JS Script   |
| 1.2   | Merge operations                      | JS Script   |
| 1.3   | CLI commands (\*create-worktree, etc) | Task .md    |
| 1.4   | Auto-create trigger                   | Workflow    |
| 1.5   | status.json integration               | JS + Schema |

**@dev needed:** Stories 1.1, 1.2, 1.5 (scripts)
**@architect leads:** Stories 1.3, 1.4 (prompts/workflows)

---

### Epic 2: Migration V2→V3 (P0) - 6 stories

**Tipo:** 60% Código, 40% Prompt Engineering

| Story | Deliverable                 | Tipo                |
| ----- | --------------------------- | ------------------- |
| 2.1   | asset-inventory.js          | JS Script           |
| 2.2   | path-analyzer.js            | JS Script           |
| 2.3   | V3 Schemas (agent, task)    | JSON Schema         |
| 2.4   | migrate-agent.js            | JS Script           |
| 2.5   | Pilot migration (@dev, @qa) | Manual + Validation |
| 2.6   | Batch migration             | Orchestration       |

**@dev needed:** Stories 2.1, 2.2, 2.4 (scripts)
**@architect leads:** Stories 2.3, 2.5, 2.6 (schemas/orchestration)

---

### Epic 3: Spec Pipeline (P0) - 6 stories

**Tipo:** 10% Código, 90% Prompt Engineering

| Story | Deliverable                   | Tipo           |
| ----- | ----------------------------- | -------------- |
| 3.1   | spec-gather-requirements.md   | Task .md       |
| 3.2   | spec-assess-complexity.md     | Task .md       |
| 3.3   | spec-research-dependencies.md | Task .md + MCP |
| 3.4   | spec-write-spec.md            | Task .md       |
| 3.5   | spec-critique.md              | Task .md       |
| 3.6   | spec-pipeline.yaml            | Workflow .yaml |

**@dev needed:** Nenhum
**@architect leads:** TODAS as stories (100% prompt engineering)

---

### Epic 4: Execution Engine (P0) - 6 stories

**Tipo:** 30% Código, 70% Prompt Engineering

| Story | Deliverable                        | Tipo          |
| ----- | ---------------------------------- | ------------- |
| 4.1   | plan-create-implementation.md      | Task .md      |
| 4.2   | plan-create-context.md             | Task .md      |
| 4.3   | plan-execute-subtask.md (13 steps) | Task .md      |
| 4.4   | self-critique-checklist.md         | Checklist .md |
| 4.5   | subtask-verifier.js                | JS Script     |
| 4.6   | plan-tracker.js                    | JS Script     |

**@dev needed:** Stories 4.5, 4.6 (scripts)
**@architect leads:** Stories 4.1, 4.2, 4.3, 4.4 (prompts)

---

### Epic 5: Recovery System (P1) - 4 stories

**Tipo:** 40% Código, 60% Prompt Engineering

| Story | Deliverable          | Tipo           |
| ----- | -------------------- | -------------- |
| 5.1   | attempt-tracker.js   | JS Script      |
| 5.2   | recovery-strategy.md | Task .md       |
| 5.3   | Escalation triggers  | Workflow       |
| 5.4   | Retry policies       | Config + Logic |

**@dev needed:** Story 5.1 (script)
**@architect leads:** Stories 5.2, 5.3, 5.4

---

### Epic 6: QA Evolution (P1) - 5 stories

**Tipo:** 10% Código, 90% Prompt Engineering

| Story | Deliverable               | Tipo                 |
| ----- | ------------------------- | -------------------- |
| 6.1   | review-subtask.md         | Task .md             |
| 6.2   | qa-gate-auto.md           | Task .md             |
| 6.3   | CodeRabbit integration    | Config + Workflow    |
| 6.4   | review-qa.md (Dev→QA→Dev) | Task .md             |
| 6.5   | Quality metrics           | Schema + Aggregation |

**@dev needed:** Story 6.5 (metrics script, opcional)
**@architect leads:** Stories 6.1, 6.2, 6.3, 6.4

---

### Epic 7: Memory Layer (P2) - 4 stories

**Tipo:** 50% Código, 50% Prompt Engineering

| Story | Deliverable                      | Tipo         |
| ----- | -------------------------------- | ------------ |
| 7.1   | project-memory schema (Supabase) | SQL + Schema |
| 7.2   | Memory query utilities           | JS + SQL     |
| 7.3   | Pattern learning                 | Task .md     |
| 7.4   | Cross-project insights           | Task .md     |

**@dev needed:** Stories 7.1, 7.2 (Supabase)
**@architect leads:** Stories 7.3, 7.4

---

## Recommended Execution Plan

### Phase 1: Foundation (Weeks 1-3)

```
Week 1: Epic 1 (Worktree Manager)
        └── @dev: 1.1, 1.2, 1.5
        └── @architect: 1.3, 1.4
        └── PREP: Design V3 schemas (Epic 2)

Week 2-3: Epic 2 (Migration V2→V3)
        └── @dev: 2.1, 2.2, 2.4
        └── @architect: 2.3, 2.5, 2.6
        └── PREP: Draft spec tasks structure (Epic 3)
```

### Phase 2: Core Pipeline (Weeks 4-6)

```
Week 4-5: Epic 3 (Spec Pipeline) - 100% @architect
        └── All 6 stories are prompt engineering
        └── PREP: Draft execution tasks (Epic 4)

Week 6: Epic 4 (Execution Engine)
        └── @dev: 4.5, 4.6
        └── @architect: 4.1, 4.2, 4.3, 4.4
```

### Phase 3: Resilience (Weeks 7-8) - PARALLEL

```
Week 7-8: Epic 5 (Recovery) + Epic 6 (QA Evolution) IN PARALLEL

        Track 1 - Recovery:
        └── @dev: 5.1
        └── @architect: 5.2, 5.3, 5.4

        Track 2 - QA Evolution:
        └── @architect: 6.1, 6.2, 6.3, 6.4
        └── @dev: 6.5 (opcional)
```

### Phase 4: Intelligence (Weeks 9-10)

```
Week 9-10: Epic 7 (Memory Layer)
        └── @dev: 7.1, 7.2 (Supabase)
        └── @architect: 7.3, 7.4
```

---

## Key Documents

### PRD

- `docs/prd/aios-autonomous-development-engine.md`

### Stories

- `docs/stories/aios-core-ade/` (7 epic files + README)

### Quality Gates

- `docs/qa/gates/aios-core-ade/` (7 gate files + README)

### Reference

- `docs/architecture/AUTO-CLAUDE-ANALYSIS-COMPLETE.md` (patterns do Auto-Claude)
- `.aios-core/core-config.yaml` (configuração central)

---

## Quality Gate Protocol

Após completar cada epic, acione @qa para executar o quality gate:

```
@qa *gate epic-{N}-{name}
```

**Decisions possíveis:**

- **PASS:** Próximo epic liberado
- **CONCERNS:** Aprovado com follow-up items
- **FAIL:** Retorna para correções
- **WAIVED:** Bypass autorizado por @po

---

## Important Notes

### Sobre Prompt Engineering

As tasks .md são **instruções executáveis para o LLM**. Elas precisam ser:

1. **Determinísticas** - Mesma entrada = mesma saída
2. **Completas** - Todos os passos explícitos
3. **Verificáveis** - Output validável
4. **Composáveis** - Podem ser chamadas por outras tasks

### Sobre Self-Critique (Epic 4)

Os steps 5.5 e 6.5 do execute-subtask são **críticos**. Eles forçam o LLM a revisar seu próprio trabalho antes de continuar. Não podem ser bypassados sem flag explícito.

### Sobre Integration com Dashboard

O Dashboard (projeto separado) vai **consumir** o que o ADE produz:

- status.json format
- Worktree API
- Agents V3

Não há dependência do Dashboard para o ADE funcionar.

---

## First Steps Recommended

1. **Ler o PRD completo** - `docs/prd/aios-autonomous-development-engine.md`
2. **Ler o Auto-Claude Analysis** - `docs/architecture/AUTO-CLAUDE-ANALYSIS-COMPLETE.md`
3. **Iniciar Epic 1.1** - worktree-manager.js (delegar para @dev)
4. **Em paralelo, desenhar os schemas V3** (Epic 2.3)

---

## Questions for @architect Before Starting

1. Prefere começar pelo código (Epic 1.1 com @dev) ou pelo design (V3 schemas)?
2. Quer criar um agente @prompt-engineer especializado ou assumir esse papel?
3. Alguma dúvida sobre o escopo ou dependências?

---

_Handoff prepared by Quinn (@qa) - Guardian of Quality_
_Date: 2026-01-28_
