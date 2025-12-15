# Epic: Workflow Intelligence System (WIS)

**Epic ID:** EPIC-WIS
**Status:** Planning
**Priority:** High
**Target:** Post Open-Source Launch (Sprint 8+)
**Effort Estimate:** 40-60 hours (across 2-3 sprints)

---

## Vision

Criar um sistema inteligente que guia desenvolvedores através dos workflows AIOS, detectando contexto automaticamente e sugerindo próximos passos baseado em padrões validados e aprendizado contínuo.

---

## Problem Statement

**Problema:** Desenvolvedores usando AIOS frequentemente:
- Não sabem qual é a próxima task após completar uma ação
- Desviam das boas práticas por desconhecimento
- Perdem tempo tentando entender o output dos agentes
- Não aproveitam oportunidades de paralelização (waves)

**Solução:** Sistema que funciona como "GPS" do workflow AIOS:
- Detecta contexto automaticamente (agente ativo, última task, estado do projeto)
- Sugere próximo passo baseado em workflows validados
- Aprende com padrões de uso bem-sucedidos
- Reduz curva de aprendizado e aumenta adoção

---

## Strategic Alignment

### Conexões com Documentação Existente

| Documento | Conexão |
|-----------|---------|
| `docs/standards/AGNOSTIC-PROCESS-MAPPING-FRAMEWORK.md` | Waves, Task-First, 4 Executores |
| `docs/standards/LATTICEWORK-PROCESS-MAPPING.md` | Matriz de dependências, fluxo de dados |
| `docs/standards/DECISION-TREE-GENERATOR-SYSTEM-PROMPT.md` | Decision trees para processos |
| `docs/stories/epic-1/story-1.10-enhancement-agent-lightning-integration.md` | RL optimization, trace collection |

### Princípios Aplicados (do Framework Agnóstico)

1. **Task-First:** A task é a unidade atômica
2. **Impossibilitar > Documentar:** Guiar para caminhos certos
3. **Sistema Auto-Educativo:** Ensina enquanto executa
4. **Fluxo Unidirecional:** Processo avança, não retrocede
5. **Waves:** Grupos de execução paralela

---

## Scope Definition

### MVP (WIS-1 + WIS-2)
- Workflow Registry editável
- Task `*next` funcional
- Workflows hardcoded iniciais (PO, SM, Dev)

### Full System (WIS-3 a WIS-7)
- Wave Analysis Engine
- Pattern Learning (interno + comunidade)
- Agent Lightning Integration
- Memory Layer Integration

---

## Stories Roadmap

| Story | Nome | Descrição | Sprint | Effort | Status |
|-------|------|-----------|--------|--------|--------|
| **WIS-1** | Investigation & Design | Investigar viabilidade, definir arquitetura MVP | 8 | 8h | Ready |
| **WIS-2** | Workflow Registry | Biblioteca editável de workflows validados | 8 | 12h | Blocked by WIS-1 |
| **WIS-3** | `*next` Task Universal | Detecta contexto e sugere próxima task | 9 | 12h | Blocked by WIS-2 |
| **WIS-4** | Wave Analysis Engine | Detecta wave atual, sugere paralelização | 9 | 8h | Blocked by WIS-2 |
| **WIS-5** | Pattern Capture (Internal) | Captura padrões AllFluence | 10 | 8h | Blocked by WIS-3 |
| **WIS-6** | Community Pattern Opt-in | Telemetria anônima da comunidade | 10+ | 8h | Blocked by WIS-5, OSR |
| **WIS-7** | Agent Lightning Unification | Integrar com Story 1.10 (RL optimization) | Future | TBD | Blocked by WIS-5 |
| **WIS-8** | Memory Layer Integration | Persistir padrões (quando ML funcionar) | Future | TBD | Blocked by Memory Layer |

---

## Workflow Granularity

O sistema suportará workflows em múltiplas granularidades:

### Por Agente
```yaml
workflows:
  po:
    - draft-stories → validate-story-draft → backlog-add → backlog-review
    - backlog-review → prioritize → schedule
  sm:
    - sprint-planning → create-stories → assign-tasks
    - daily-standup → blockers → resolution
  dev:
    - story-read → implement → test → pr-create
    - bug-report → investigate → fix → validate
```

### Por Fase
```yaml
phases:
  planning:
    - prd-creation → epic-definition → story-breakdown
  development:
    - story-ready → implementation → testing → review
  release:
    - qa-validation → release-prep → deploy → monitor
```

### Por Tipo de Projeto
```yaml
project_types:
  greenfield:
    - init-wizard → scaffold → first-story
  brownfield:
    - audit → gap-analysis → migration-plan
  maintenance:
    - bug-triage → fix → regression-test
```

### Por Wave (Paralelização)
```yaml
waves:
  wave_1:  # Paralelo
    - task-a
    - task-b
    - task-c
  wave_2:  # Sequencial após wave_1
    - task-d (depends: task-a, task-b)
  wave_3:  # Paralelo
    - task-e
    - task-f
```

---

## Technical Architecture (Skeleton)

```
.aios-core/
├── workflow-intelligence/
│   ├── registry/
│   │   ├── workflows/           # YAML workflow definitions
│   │   │   ├── by-agent/
│   │   │   ├── by-phase/
│   │   │   ├── by-project-type/
│   │   │   └── by-wave/
│   │   └── registry-manager.js  # CRUD para workflows
│   │
│   ├── context/
│   │   ├── session-analyzer.js  # Detecta contexto atual
│   │   ├── project-state.js     # Estado do projeto
│   │   └── agent-tracker.js     # Agente ativo, última task
│   │
│   ├── suggestion/
│   │   ├── next-task-engine.js  # Core do *next
│   │   ├── wave-analyzer.js     # Detecta waves
│   │   └── pattern-matcher.js   # Match com workflows
│   │
│   ├── learning/
│   │   ├── pattern-capture.js   # Captura padrões
│   │   ├── pattern-validator.js # Valida padrões
│   │   └── pattern-store.js     # Armazena padrões
│   │
│   └── integrations/
│       ├── agent-lightning/     # Integração Story 1.10
│       └── memory-layer/        # Integração futura
```

---

## Data Sources for Learning

### Fonte A: AllFluence Internal (Default)
- Padrões de uso da equipe AllFluence
- Validados manualmente antes de entrar no registry
- Versionados junto com código
- Custo: Zero (local)

### Fonte B: Community Opt-in (Futuro)
- Telemetria anônima (se usuário optar)
- Dados agregados, não individuais
- Privacidade preservada
- Custo: A definir (precisa infraestrutura)

### Separação Clara
```yaml
pattern_sources:
  internal:
    storage: local (git)
    validation: manual
    access: all users
    cost: free

  community:
    storage: cloud (opt-in)
    validation: automatic + review
    access: opt-in users
    cost: TBD (investigate low-cost options)
```

---

## Integration Points

### Com Agent Lightning (Story 1.10)
- **Trace Collection:** Capturar traces de execução
- **RL Optimization:** Otimizar workflows com RL
- **Cost Reduction:** 15-25% de redução de custo

### Com Memory Layer (Futuro)
- **Persistência:** Padrões salvos entre sessões
- **Compartilhamento:** Padrões entre projetos
- **Custo:** Preocupação para comunidade

### Com Open-Source (Epic OSR)
- **WIS-6** depende de OSR completo
- Community patterns só após launch

---

## Success Metrics

| Métrica | Target | Como Medir |
|---------|--------|------------|
| Adoção do `*next` | 70% dos usuários usam | Telemetria |
| Precisão de sugestões | 85% corretas | Feedback loop |
| Redução de desvios | 50% menos desvios | Comparativo |
| Workflows registrados | 20+ workflows | Registry count |
| Patterns capturados | 50+ patterns | Pattern store |

---

## Risks & Mitigations

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Complexidade excessiva | Média | Alto | MVP focado em WIS-1/WIS-2 |
| Custo de infraestrutura | Alta | Médio | Local-first, cloud opt-in |
| Baixa adoção | Média | Alto | UX excelente, value claro |
| Privacy concerns | Baixa | Alto | Opt-in explícito, dados anônimos |

---

## Dependencies

### Bloqueado por:
- **Epic OSR** (para WIS-6 community patterns)
- **Memory Layer** (para WIS-8)
- **Story 1.10** (para WIS-7 Agent Lightning)

### Bloqueia:
- Nada (self-contained)

---

## Decision Log

| Data | Decisão | Rationale |
|------|---------|-----------|
| 2025-12-05 | Híbrido: Epic skeleton + Investigation story | Visibilidade no roadmap + validação antes de investir |
| 2025-12-05 | Local-first para patterns | Evitar custos de infraestrutura inicialmente |
| 2025-12-05 | Integrar com Agent Lightning (1.10) | Reutilizar RL optimization existente |

---

## Next Steps

1. **Imediato:** Criar WIS-1 Investigation Story
2. **Sprint 8:** Executar WIS-1, definir arquitetura MVP
3. **Sprint 8-9:** Implementar WIS-2 e WIS-3 (core functionality)
4. **Sprint 10+:** Learning e community features

---

**Criado por:** Pax (PO)
**Data:** 2025-12-05
**Revisado por:** -
