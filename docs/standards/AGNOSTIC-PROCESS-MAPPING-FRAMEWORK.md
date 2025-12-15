# Framework Agnóstico de Mapeamento de Processos
## Task-First Process Engineering Methodology

> **Versão**: 1.0 | **Data**: 04/12/2025
> **Baseado em**: Pedro Valério Operational Framework + AIOS Task-First Architecture

---

## Índice

1. [Filosofia Fundacional](#1-filosofia-fundacional)
2. [Os 4 Pilares do Mapeamento](#2-os-4-pilares-do-mapeamento)
3. [Framework de Entidades](#3-framework-de-entidades)
4. [Framework de Relacionamentos](#4-framework-de-relacionamentos)
5. [Framework de Tasks](#5-framework-de-tasks)
6. [Framework de Executores](#6-framework-de-executores)
7. [Framework de Workflows](#7-framework-de-workflows)
8. [Framework de Status e Campos](#8-framework-de-status-e-campos)
9. [Framework de Triggers e Automações](#9-framework-de-triggers-e-automações)
10. [Framework de Documentação](#10-framework-de-documentação)
11. [Templates e Checklists Universais](#11-templates-e-checklists-universais)
12. [Latticework de Frameworks](#12-latticework-de-frameworks)

---

## 1. Filosofia Fundacional

### 1.1 O Princípio Task-First

> **"Tudo se baseia na task e como construir uma task que pode ser executada por um dos 4 executores."**
> — AIOS Task-First Methodology

```
┌─────────────────────────────────────────────────────────────────┐
│                         TASK                                      │
│        (Unidade atômica de trabalho - independente do executor)   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│    ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│    │  Agente  │  │  Worker  │  │  Humano  │  │  Clone   │       │
│    │   (IA)   │  │ (Script) │  │ (Manual) │  │(IA+Rules)│       │
│    └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│          │            │              │              │            │
│          └────────────┴──────────────┴──────────────┘            │
│                              │                                    │
│                        EXECUTORES                                 │
│               (Múltiplos executores por task)                     │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Absolutismo Processual

> **"A melhor coisa é impossibilitar caminhos."**
> — Pedro Valério

**Princípios Fundamentais:**

| Princípio | Descrição | Implementação |
|:----------|:----------|:--------------|
| **Impossibilitar Caminhos** | Bloquear paths errados, não apenas documentar os certos | Automações como barreiras físicas |
| **Fluxo Unidirecional** | Processo nunca volta | Automação impede retrocesso |
| **Sistema Auto-Educativo** | Sistema ensina enquanto executa | Checklists e playbooks embutidos |
| **Eliminar Repetição** | Se é repetitivo, não é humano | Automação antes de delegação |
| **Gap Zero** | Eliminar gaps de tempo e cliques | Webhooks + automações |

### 1.3 ClickUp como Sistema Operacional

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLICKUP = OPERATING SYSTEM                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Tasks ─────► Source of Truth                                     │
│  Status ────► State Machine                                       │
│  Fields ────► Data Layer                                          │
│  Webhooks ──► Event System                                        │
│  Templates ─► Asset Library                                       │
│  Checklists ► Playbooks                                          │
│  Automations ► Business Logic                                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Os 4 Pilares do Mapeamento

### 2.1 Diagrama dos Pilares

```
                    ┌─────────────────────┐
                    │   PROCESSO          │
                    │   (O Que Mapear)    │
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│    PILAR 1      │ │    PILAR 2      │ │    PILAR 3      │
│   ESTRUTURA     │ │    FLUXO        │ │   EXECUÇÃO      │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ • Entidades     │ │ • Workflows     │ │ • Executores    │
│ • Relacionamentos│ │ • Status       │ │ • Tasks         │
│ • Hierarquia    │ │ • Triggers      │ │ • Tools         │
│ • Campos        │ │ • Dependências  │ │ • Scripts       │
└─────────────────┘ └─────────────────┘ └─────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    PILAR 4          │
                    │   DOCUMENTAÇÃO      │
                    ├─────────────────────┤
                    │ • Templates         │
                    │ • Checklists        │
                    │ • Playbooks         │
                    │ • Schemas           │
                    └─────────────────────┘
```

### 2.2 Checklist de Mapeamento Completo

```markdown
## Checklist: Mapeamento de Processo Completo

### PILAR 1: ESTRUTURA
- [ ] Todas as entidades identificadas e nomeadas
- [ ] Hierarquia definida (Spaces > Folders > Lists > Tasks > Subtasks)
- [ ] Relacionamentos mapeados (1:N, N:M, condicionais)
- [ ] Campos custom fields definidos por entidade
- [ ] Tiers/Níveis de complexidade estabelecidos

### PILAR 2: FLUXO
- [ ] Status definidos por lista
- [ ] Máquina de estados documentada
- [ ] Triggers identificados
- [ ] Dependências mapeadas
- [ ] Automações especificadas

### PILAR 3: EXECUÇÃO
- [ ] Tasks definidas com input/output schemas
- [ ] Executores atribuídos a cada task
- [ ] Decision tree de executor documentado
- [ ] Tools catalogadas
- [ ] Scripts especificados

### PILAR 4: DOCUMENTAÇÃO
- [ ] Templates criados
- [ ] Checklists por etapa
- [ ] Playbooks por função
- [ ] Quick reference disponível
```

---

## 3. Framework de Entidades

### 3.1 Método de Identificação de Entidades

**Perguntas-Chave:**
1. O que precisa ser rastreado independentemente?
2. O que tem ciclo de vida próprio?
3. O que pode existir sem outras entidades?
4. O que precisa de campos específicos?

### 3.2 Template: Definição de Entidade

```yaml
entidade:
  nome: {Nome da Entidade}
  nome_plural: {Nome no plural}
  tipo: {core | junction | lookup}

  identificação:
    id_format: {formato do ID}
    id_exemplo: "PROJ-001"
    nome_display: {campo usado para display}

  ciclo_de_vida:
    status_inicial: {status}
    status_final: [{status1}, {status2}]
    pode_ser_deletado: {true|false}
    soft_delete: {true|false}

  campos_obrigatórios:
    - campo: {nome}
      tipo: {tipo}
      validação: {regra}

  campos_opcionais:
    - campo: {nome}
      tipo: {tipo}
      default: {valor}

  campos_calculados:
    - campo: {nome}
      formula: {expressão}

  hierarquia:
    nível: {Space|Folder|List|Task|Subtask}
    parent: {entidade pai}
    children: [{entidades filhas}]

  relacionamentos:
    - com: {entidade}
      tipo: {1:1|1:N|N:M|condicional}
      condição: {quando aplicável}
      obrigatório: {true|false}
```

### 3.3 Exemplo: Entidade Projeto

```yaml
entidade:
  nome: Projeto
  nome_plural: Projetos
  tipo: core

  identificação:
    id_format: "PROJ-{NNNN}"
    id_exemplo: "PROJ-0042"
    nome_display: nome_projeto

  ciclo_de_vida:
    status_inicial: "Pendente"
    status_final: ["Completo", "Cancelado"]
    pode_ser_deletado: false
    soft_delete: true

  campos_obrigatórios:
    - campo: nome_projeto
      tipo: string
      validação: "length >= 3"
    - campo: cliente_id
      tipo: relationship
      validação: "exists(clientes)"
    - campo: origem_venda
      tipo: enum
      validação: "in [TTCX, COMERCIAL, PARCEIRO, BPM]"

  hierarquia:
    nível: Task
    parent: Clientes (Folder)
    children: [Criativos, Aceites]

  relacionamentos:
    - com: Cliente
      tipo: N:1
      obrigatório: true
    - com: Proposta
      tipo: 1:1
      condição: "origem_venda != 'TTCX'"
      obrigatório: false
    - com: Criativo
      tipo: 1:N
      obrigatório: false
```

### 3.4 Padrão: Hierarquia Universal

```
HIERARQUIA CLICKUP (Estrutura Física)
=====================================

Space (Workspace)
    │
    ├── Folder (Agrupamento Lógico)
    │       │
    │       ├── List (Container de Tasks)
    │       │       │
    │       │       ├── Task (Unidade de Trabalho)
    │       │       │       │
    │       │       │       └── Subtask (Educacional/Breakdown)
    │       │       │
    │       │       └── Task
    │       │
    │       └── List
    │
    └── Folder


MAPEAMENTO ENTIDADES → HIERARQUIA
==================================

Entidade Principal    → Task em Lista dedicada
Entidade Relacionada  → Task em Lista separada (com relacionamento)
Entidade Subordinada  → Subtask (quando sempre depende da principal)
Agrupamento Lógico    → Folder
Domínio/Área          → Space
```

---

## 4. Framework de Relacionamentos

### 4.1 Tipos de Relacionamentos

```
┌────────────────────────────────────────────────────────────────┐
│                  TIPOS DE RELACIONAMENTOS                       │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1:1 (Um para Um)                                               │
│  ┌─────┐      ┌─────┐                                          │
│  │  A  │──────│  B  │  Ex: Projeto ↔ Proposta (se COMERCIAL)   │
│  └─────┘      └─────┘                                          │
│                                                                 │
│  1:N (Um para Muitos)                                           │
│  ┌─────┐      ┌─────┐                                          │
│  │  A  │──────│  B  │  Ex: Projeto → Criativos                 │
│  └─────┘   ┌──│  B  │                                          │
│            │  └─────┘                                          │
│            └──│  B  │                                          │
│               └─────┘                                          │
│                                                                 │
│  N:M (Muitos para Muitos)                                       │
│  ┌─────┐      ┌─────┐      ┌─────┐                             │
│  │  A  │──────│ J   │──────│  B  │  Ex: Creator ↔ Projetos     │
│  │  A  │──────│ J   │──────│  B  │  (via Aceite/Casting)       │
│  └─────┘      └─────┘      └─────┘                             │
│                Junction                                         │
│                                                                 │
│  CONDICIONAL (Baseado em Campo)                                 │
│  ┌─────┐      ┌─────┐                                          │
│  │  A  │──?───│  B  │  Ex: Criativo → Aceite                   │
│  └─────┘      └─────┘  (só se módulo = CREATOR/TALENTO)        │
│         └── condição                                           │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### 4.2 Template: Mapeamento de Relacionamento

```yaml
relacionamento:
  nome: {Nome Descritivo}

  entidades:
    origem: {entidade A}
    destino: {entidade B}

  tipo: {1:1 | 1:N | N:M | condicional}

  cardinalidade:
    min_origem: {0|1}
    max_origem: {1|N}
    min_destino: {0|1}
    max_destino: {1|N}

  condição:
    campo: {campo trigger}
    operador: {=|!=|in|not_in}
    valores: [{valores que ativam}]

  implementação:
    clickup:
      método: {relationship_field | linked_task | custom_field}
      campo: {nome do campo}
    supabase:
      tabela_junction: {nome se N:M}
      fk_origem: {nome FK}
      fk_destino: {nome FK}

  validações:
    - regra: {descrição}
      momento: {create|update|status_change}
      ação_se_falhar: {block|warn|auto_fix}
```

### 4.3 Padrão: Relacionamento Condicional

```
┌─────────────────────────────────────────────────────────────┐
│         RELACIONAMENTO CONDICIONAL POR CLASSIFICAÇÃO         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Campo Classificador: modulo_producao                        │
│                                                              │
│  ┌─────────────────┬────────────────────────────────────┐   │
│  │ SE módulo =     │ ENTÃO relacionar com               │   │
│  ├─────────────────┼────────────────────────────────────┤   │
│  │ CREATOR         │ Aceite ✅, Casting ✅, People ❌    │   │
│  │ TALENTO         │ Aceite ✅, Casting ✅, People ❌    │   │
│  │ EXPERT          │ Aceite ❌, Casting ❌, People ✅    │   │
│  │ REMIX           │ Aceite ❌, Casting ❌, People ❌    │   │
│  │ AI              │ Aceite ❌, Casting ❌, People ❌    │   │
│  └─────────────────┴────────────────────────────────────┘   │
│                                                              │
│  Implementação:                                              │
│  - Automação valida no create/update                         │
│  - Bloqueia se relacionamento inválido                       │
│  - Auto-remove se módulo mudar                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Framework de Tasks

### 5.1 Anatomia de uma Task

```yaml
# TASK DEFINITION TEMPLATE (Task-First Standard)

task_id: {kebab-case-unique-identifier}
name: {Human Readable Name}
category: {category}
version: {semver}

metadata:
  wave: {integer}              # Grupo de execução paralela
  execution_order: {integer}   # Ordem dentro do wave
  atomic_layer: {layer}        # Atom|Molecule|Organism|Template|Page|Config|Strategy
  estimated_duration_ms: {ms}
  parallelizable: {boolean}
  description: |
    {Descrição detalhada do que a task faz}

dependencies:
  - {task-id-1}
  - {task-id-2}

input_schema:
  $schema: "http://json-schema.org/draft-07/schema#"
  type: object
  properties:
    {campo}:
      type: {tipo}
      description: {descrição}
  required:
    - {campo_obrigatório}

output_schema:
  $schema: "http://json-schema.org/draft-07/schema#"
  type: object
  properties:
    {campo}:
      type: {tipo}
      description: {descrição}
  required:
    - {campo_obrigatório}

executors:
  - executor_id: {executor-id}
    type: {AI|Worker|Human|Clone}
    priority: {1|2|3}
    fallback: {fallback-executor-id}

tools:
  - {tool-id}

checklists:
  pre_conditions:
    - description: {descrição}
      blocker: {true|false}
      validation: |
        {lógica de validação}

  post_conditions:
    - description: {descrição}
      blocker: {true|false}
      validation: |
        {lógica de validação}

error_handling:
  strategy: {retry|fallback|abort|retry_with_fallback}
  retry_count: {integer}
  retry_delay_ms: {integer}
  on_failure: {use_default|abort_workflow|escalate_to_human}

cost_estimation:
  tokens: {integer}
  api_calls: {integer}
  estimated_cost_usd: {decimal}
```

### 5.2 Convenção de Nomenclatura

| Contexto | Convenção | Exemplo |
|:---------|:----------|:--------|
| task_id | kebab-case | `analyze-ad-brief` |
| Arquivo Task | `{wave}-{order}-{name}.yaml` | `4-1-analyze-ad-brief.yaml` |
| Campos JSON | camelCase | `adAnalysis`, `formatConfig` |
| Campos DB | snake_case | `task_id`, `created_at` |
| Variáveis CSS | kebab-case | `--content-padding` |

### 5.3 Exemplo Completo: Task de Análise

```yaml
task_id: analyze-project-brief
name: Analisar Brief do Projeto
category: planning
version: 1.0.0

metadata:
  wave: 1
  execution_order: 1
  atomic_layer: Analysis
  estimated_duration_ms: 4000
  parallelizable: false
  description: |
    Analisa o brief do projeto e extrai informações estruturadas:
    objetivo, público-alvo, módulo sugerido, BUs necessárias.

dependencies: []

input_schema:
  $schema: "http://json-schema.org/draft-07/schema#"
  type: object
  properties:
    brief_text:
      type: string
      description: Texto completo do brief
    cliente:
      type: object
      description: Dados do cliente
  required:
    - brief_text
    - cliente

output_schema:
  $schema: "http://json-schema.org/draft-07/schema#"
  type: object
  properties:
    analysis:
      type: object
      properties:
        objetivo:
          type: string
          enum: [awareness, conversion, engagement]
        publico_alvo:
          type: string
        modulo_sugerido:
          type: string
          enum: [CREATOR, TALENTO, EXPERT, REMIX, AI]
        bus_necessarias:
          type: array
          items:
            type: string
            enum: [AM, CM, CW, PF, ED, AI]
  required:
    - analysis

executors:
  - executor_id: project-analyst-ai
    type: AI
    priority: 1
    fallback: manual-analysis
  - executor_id: manual-analysis
    type: Human
    priority: 2

checklists:
  pre_conditions:
    - description: Brief tem mínimo 100 caracteres
      blocker: true
      validation: |
        context.brief_text && context.brief_text.length >= 100
    - description: Cliente existe no sistema
      blocker: true
      validation: |
        context.cliente && context.cliente.id

  post_conditions:
    - description: Análise contém campos obrigatórios
      blocker: true
      validation: |
        output.analysis.objetivo &&
        output.analysis.modulo_sugerido &&
        output.analysis.bus_necessarias.length > 0

error_handling:
  strategy: retry_with_fallback
  retry_count: 2
  retry_delay_ms: 1000
  on_failure: escalate_to_human

cost_estimation:
  tokens: 2000
  api_calls: 1
  estimated_cost_usd: 0.03
```

---

## 6. Framework de Executores

### 6.1 Os 4 Tipos de Executores

```
┌─────────────────────────────────────────────────────────────────┐
│                    OS 4 TIPOS DE EXECUTORES                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ AGENTE (AI)                                               │   │
│  │ • Quando: Criatividade, análise contextual, NLU           │   │
│  │ • Custo: $$$$ Alto ($0.001 - $0.01/exec)                 │   │
│  │ • Velocidade: Lento (3-10s)                               │   │
│  │ • Determinístico: ❌ Não                                  │   │
│  │ • Ex: Analisar brief, gerar copy, selecionar template    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ WORKER (Script)                                           │   │
│  │ • Quando: Determinístico, transformação de dados          │   │
│  │ • Custo: $ Baixo ($0 - $0.001/exec)                      │   │
│  │ • Velocidade: Rápido (<1s)                                │   │
│  │ • Determinístico: ✅ Sim                                  │   │
│  │ • Ex: Carregar config, validar HTML, calcular valores    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ HUMANO (Manual)                                           │   │
│  │ • Quando: Decisão crítica, aprovação, julgamento          │   │
│  │ • Custo: $$$ Médio ($5 - $50/exec)                       │   │
│  │ • Velocidade: Muito Lento (minutos-horas)                 │   │
│  │ • Determinístico: ❌ Não                                  │   │
│  │ • Ex: Aprovar criativo, decisão legal, edge cases        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ CLONE (AI + Regras)                                       │   │
│  │ • Quando: Metodologia específica, validação de padrões    │   │
│  │ • Custo: $$$$ Alto ($0.002 - $0.015/exec)               │   │
│  │ • Velocidade: Lento (5-15s)                               │   │
│  │ • Determinístico: ⚠️ Parcial                             │   │
│  │ • Ex: Validar Atomic Design, review de copy              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Decision Tree: Escolha de Executor

```
                    ┌────────────────────────┐
                    │   NOVA TASK            │
                    └───────────┬────────────┘
                                │
                                ▼
                    ┌────────────────────────┐
                    │ Requer Criatividade    │
                    │ ou Subjetividade?      │
                    └───────────┬────────────┘
                         YES ╱     ╲ NO
                            ╱       ╲
               ┌───────────▼───┐   ┌▼────────────────┐
               │ Julgamento    │   │ Algoritmo       │
               │ Humano        │   │ Determinístico  │
               │ Necessário?   │   │ Existe?         │
               └───────┬───────┘   └────────┬────────┘
                  YES │ NO              YES │ NO
                      │  │                  │  │
               ┌──────▼──▼────┐      ┌──────▼──┴──────┐
               │ Metodologia  │      │    WORKER      │
               │ Específica   │      └────────────────┘
               │ Requerida?   │
               └───────┬──────┘
                  YES │ NO
                      │  │
               ┌──────▼──┴──────┐
               │    CLONE       │        │    AGENTE    │
               └────────────────┘        └──────────────┘
                      │
               ┌──────▼──────┐
               │   HUMANO    │
               └─────────────┘
```

### 6.3 Template: Definição de Executor

```yaml
# EXECUTOR DEFINITION TEMPLATE

executor_id: {kebab-case-id}
name: {Nome do Executor}
type: {AI|Worker|Human|Clone}
version: {semver}

metadata:
  description: |
    {Descrição do propósito e capacidades}
  category: {categoria}
  expansion_pack: {pack-id}

capabilities:
  - {capability-1}
  - {capability-2}

# Para AI/Clone
model_config:
  provider: {openai|anthropic|google}
  model: {model-id}
  temperature: {0.0-2.0}
  max_tokens: {integer}
  system_prompt: |
    {System prompt}

# Para Worker
script_config:
  script_path: scripts/{script-name}.js
  runtime: node
  entry_function: {functionName}

# Para Clone (adicional ao model_config)
clone_config:
  heuristics_path: clones/{name}/heuristics.yaml
  axioms_path: clones/{name}/axioms.yaml
  ai_fallback: {true|false}

execution:
  timeout_ms: {integer}
  retry_count: {integer}
  retry_delay_ms: {integer}
  concurrency: {integer}

fallback_strategy:
  enabled: {boolean}
  fallback_to: {executor-id}
  fallback_conditions:
    - model_unavailable
    - timeout
    - rate_limit

cost_tracking:
  enabled: true
  cost_per_execution_usd: {decimal}

tasks_assigned:
  - {task-id-1}
  - {task-id-2}
```

---

## 7. Framework de Workflows

### 7.1 Conceito de Waves

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORKFLOW EM WAVES                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  WAVE 1 (Paralelo)     WAVE 2 (Paralelo)     WAVE 3 (Sequencial)│
│  ┌─────┐ ┌─────┐       ┌─────┐ ┌─────┐       ┌─────┐           │
│  │ T1  │ │ T2  │──────▶│ T3  │ │ T4  │──────▶│ T5  │           │
│  └─────┘ └─────┘       └─────┘ └─────┘       └─────┘           │
│                                                                  │
│  • Tasks no mesmo wave executam em paralelo                      │
│  • Wave N+1 só inicia após Wave N completar                      │
│  • Cada task tem dependencies explícitas                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Template: Definição de Workflow

```yaml
# WORKFLOW DEFINITION TEMPLATE

workflow_id: {kebab-case-id}
name: {Nome do Workflow}
version: {semver}

metadata:
  description: |
    {Descrição do workflow}
  category: {categoria}
  estimated_total_duration_ms: {ms}

waves:
  wave_1:
    name: {Nome do Wave}
    tasks:
      - task_id: {task-1}
        order: 1
        parallel: true
      - task_id: {task-2}
        order: 2
        parallel: true

  wave_2:
    name: {Nome do Wave}
    tasks:
      - task_id: {task-3}
        order: 1
        depends_on: [task-1, task-2]

context_accumulator:
  enabled: true
  persist_after_waves: [1, 3, 5]

error_handling:
  global_strategy: {continue|abort|rollback}
  on_task_failure: {skip|retry|abort_wave|abort_workflow}

triggers:
  start:
    - type: {webhook|status_change|schedule}
      config: {...}
  end:
    - type: {webhook|status_change|notification}
      config: {...}
```

### 7.3 Padrão: State Machine de Status

```yaml
# STATE MACHINE TEMPLATE

state_machine:
  name: {Nome da Máquina}
  entity: {Entidade}

  states:
    - id: {estado-1}
      name: {Nome}
      type: {initial|intermediate|final|hold}
      color: {hex}

  transitions:
    - from: {estado-1}
      to: {estado-2}
      trigger: {manual|automatic|condition}
      condition: |
        {condição se aplicável}
      actions:
        - type: {webhook|update_field|create_task|notify}
          config: {...}

  guards:
    - from: {estado-1}
      to: {estado-2}
      validation: |
        {validação que deve passar}
      error_message: {mensagem se falhar}

  automations:
    - when: {status_changed|field_changed|time_elapsed}
      from: {estado-1}
      action: {move_to|send_webhook|update_field}
      target: {estado-2}
```

---

## 8. Framework de Status e Campos

### 8.1 Padrão: Custom Fields Estratégicos

```yaml
# CUSTOM FIELDS PATTERN

custom_fields:
  # CAMPOS CLASSIFICADORES (Determinam comportamento)
  classificadores:
    - campo: origem_venda
      tipo: dropdown
      valores: [TTCX, COMERCIAL, PARCEIRO, BPM]
      impacto: |
        Determina se precisa Proposta e fluxo de aprovação

    - campo: modulo_producao
      tipo: dropdown
      valores: [CREATOR, TALENTO, EXPERT, REMIX, AI]
      impacto: |
        Determina relacionamentos e BUs ativadas

  # CAMPOS TRIGGER (Acionam automações)
  triggers:
    - campo: status
      webhook: true
      automação: "Universal Field Processor"

    - campo: data_entrega
      webhook: true
      automação: "SLA Monitor"

  # CAMPOS FINANCEIROS
  financeiros:
    - campo: cache_creator
      tipo: currency
      localização: Aceite (não Criativo!)

    - campo: valor_projeto
      tipo: currency
      localização: Projeto
      cálculo: "sum(criativos.custo_unitario)"

  # CAMPOS CALCULADOS
  calculados:
    - campo: tier_creator
      tipo: dropdown
      valores: [Nano, Micro, Médio, Macro, Mega]
      cálculo: |
        IF seguidores < 10K THEN "Nano"
        ELSE IF seguidores < 100K THEN "Micro"
        ...
```

### 8.2 Padrão: Status por Tipo de Entidade

```yaml
# STATUS BY ENTITY TYPE

projeto:
  statuses:
    - name: Pendente
      type: initial
      cor: gray
    - name: Em Setup
      type: intermediate
      cor: blue
    - name: Em Produção
      type: intermediate
      cor: yellow
    - name: Em Revisão Cliente
      type: hold
      cor: orange
    - name: Completo
      type: final
      cor: green
    - name: Cancelado
      type: final
      cor: red

criativo:
  statuses:
    - name: Aguardando Copy
    - name: Copy em Revisão
    - name: Em Produção
    - name: Edição
    - name: QA
    - name: Aprovação Cliente
    - name: Aprovado
    - name: Entregue

aceite:
  statuses:
    - name: Aguardando Aceite
    - name: Aceite Parcial
    - name: Aceite Completo
    - name: Recusado
```

---

## 9. Framework de Triggers e Automações

### 9.1 Tipos de Triggers

```
┌─────────────────────────────────────────────────────────────────┐
│                    TIPOS DE TRIGGERS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  STATUS_CHANGE                                                   │
│  ├── Quando: Task muda de status                                │
│  ├── Payload: task_id, old_status, new_status, user_id         │
│  └── Uso: Avançar workflow, notificar, criar tasks              │
│                                                                  │
│  FIELD_CHANGE                                                    │
│  ├── Quando: Campo específico é atualizado                      │
│  ├── Payload: task_id, field_name, old_value, new_value        │
│  └── Uso: Recalcular, validar, sincronizar                      │
│                                                                  │
│  TASK_CREATED                                                    │
│  ├── Quando: Nova task é criada na lista                        │
│  ├── Payload: task_id, list_id, template_used                  │
│  └── Uso: Aplicar template, criar relacionamentos               │
│                                                                  │
│  TASK_COMPLETED                                                  │
│  ├── Quando: Task atinge status final                           │
│  ├── Payload: task_id, final_status, duration                  │
│  └── Uso: Criar próxima etapa, gerar relatório                  │
│                                                                  │
│  TIME_BASED                                                      │
│  ├── Quando: Data/hora específica ou SLA expira                 │
│  ├── Payload: task_id, trigger_type, elapsed_time              │
│  └── Uso: Escalar, notificar, mover automaticamente             │
│                                                                  │
│  WEBHOOK_EXTERNAL                                                │
│  ├── Quando: Sistema externo envia evento                       │
│  ├── Payload: custom payload do sistema externo                │
│  └── Uso: Integração com TikTok, pagamentos, etc.               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 Padrão: Universal Field Processor

```yaml
# UNIVERSAL FIELD PROCESSOR PATTERN
# (Baseado em Pedro Valério N8N Pattern)

universal_field_processor:
  name: "Campos Trigger Processor"
  description: |
    Workflow central que recebe TODOS os webhooks de campos
    e roteia para processamento específico baseado no field_name

  entrada:
    webhook: /clickup/field-change
    payload:
      task_id: string
      field_name: string
      old_value: any
      new_value: any
      list_id: string

  normalização:
    - extract: task_id, field_name, new_value
    - enrich: task_data from ClickUp API
    - validate: field_name exists

  roteamento:
    - if: field_name == "status"
      then: route_to("status-processor")
    - if: field_name == "origem_venda"
      then: route_to("classification-processor")
    - if: field_name == "modulo_producao"
      then: route_to("module-processor")
    - if: field_name in ["cache_creator", "valor_projeto"]
      then: route_to("financial-processor")
    - else:
      then: route_to("generic-field-processor")

  saída:
    - log: action_taken
    - update: task if needed
    - notify: if configured
```

### 9.3 Template: Automação

```yaml
# AUTOMATION DEFINITION TEMPLATE

automation:
  id: {kebab-case-id}
  name: {Nome da Automação}
  enabled: true

  trigger:
    type: {status_change|field_change|task_created|schedule}
    config:
      list_id: {lista específica ou *}
      field_name: {campo específico}
      from_status: {status anterior}
      to_status: {novo status}

  conditions:
    - field: {campo}
      operator: {==|!=|in|not_in|exists}
      value: {valor}
    - expression: |
        {expressão complexa}

  actions:
    - type: {update_field|create_task|move_task|send_webhook|notify}
      config:
        target: {destino}
        data: {dados}

  error_handling:
    on_failure: {retry|skip|abort}
    retry_count: 3
    notify_on_failure: [email, slack]
```

---

## 10. Framework de Documentação

### 10.1 Documentação como Sistema

> **"A documentação não é documento - é código executável do conhecimento."**

```
┌─────────────────────────────────────────────────────────────────┐
│               DOCUMENTAÇÃO = SISTEMA EDUCATIVO                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CHECKLISTS                                                      │
│  ├── Embutidos na task (subtasks)                               │
│  ├── Procedimento passo a passo                                  │
│  └── Bloqueiam avanço se não marcados                           │
│                                                                  │
│  PLAYBOOKS                                                       │
│  ├── "Como fazer" por tipo de tarefa                            │
│  ├── Exemplos reais                                              │
│  └── Edge cases documentados                                     │
│                                                                  │
│  TEMPLATES                                                       │
│  ├── Estrutura pronta para usar                                  │
│  ├── Campos obrigatórios marcados                               │
│  └── Automação aplica automaticamente                           │
│                                                                  │
│  QUICK REFERENCE                                                 │
│  ├── 1-2 páginas máximo                                         │
│  ├── Tabelas e diagramas visuais                                │
│  └── "Cola" para uso diário                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 10.2 Template: Checklist de Task

```yaml
# CHECKLIST TEMPLATE

checklist:
  nome: {Nome do Checklist}
  tipo: {pre-condition|execution|post-condition}

  items:
    - ordem: 1
      texto: {Descrição do item}
      obrigatório: {true|false}
      bloqueador: {true|false}
      help_text: |
        {Explicação adicional se necessário}
      validação:
        tipo: {manual|automático}
        script: |
          {script de validação se automático}

    - ordem: 2
      texto: {Próximo item}
      ...
```

### 10.3 Template: Playbook

```yaml
# PLAYBOOK TEMPLATE

playbook:
  nome: {Nome do Playbook}
  versão: {semver}
  aplica_a: {tipo de task ou processo}

  contexto:
    quando_usar: |
      {Quando este playbook deve ser seguido}
    pré_requisitos:
      - {requisito 1}
      - {requisito 2}

  passos:
    - passo: 1
      título: {Título do Passo}
      descrição: |
        {Descrição detalhada}
      exemplos:
        bom: |
          {Exemplo de como fazer certo}
        ruim: |
          {Exemplo de como NÃO fazer}
      dicas:
        - {Dica 1}
        - {Dica 2}
      erros_comuns:
        - erro: {Erro comum}
          solução: {Como resolver}

  edge_cases:
    - situação: {Descrição do edge case}
      solução: |
        {Como lidar}

  referências:
    - doc: {documento relacionado}
      link: {link}
```

---

## 11. Templates e Checklists Universais

### 11.1 Checklist: Mapeamento de Novo Processo

```markdown
# Checklist: Mapeando um Novo Processo

## FASE 1: DISCOVERY (Entendimento)
- [ ] Entrevistei os stakeholders principais
- [ ] Identifiquei o objetivo final do processo
- [ ] Mapeei o "happy path" completo
- [ ] Identifiquei todos os edge cases conhecidos
- [ ] Documentei as dores atuais

## FASE 2: ENTIDADES (O Quê)
- [ ] Listei todas as entidades do processo
- [ ] Defini campos obrigatórios por entidade
- [ ] Defini campos opcionais por entidade
- [ ] Identifiquei campos calculados
- [ ] Defini hierarquia (Space > Folder > List > Task)

## FASE 3: RELACIONAMENTOS (Como se Conectam)
- [ ] Mapeei todos os relacionamentos 1:1
- [ ] Mapeei todos os relacionamentos 1:N
- [ ] Mapeei todos os relacionamentos N:M
- [ ] Identifiquei relacionamentos condicionais
- [ ] Documentei campo classificador que determina relacionamentos

## FASE 4: STATUS (Estados)
- [ ] Defini todos os status por entidade
- [ ] Identifiquei status inicial
- [ ] Identifiquei status finais
- [ ] Mapeei transições permitidas
- [ ] Defini regras de bloqueio

## FASE 5: TASKS (Execução)
- [ ] Quebrei o processo em tasks atômicas
- [ ] Defini input/output schema por task
- [ ] Atribuí executor a cada task
- [ ] Organizei tasks em waves
- [ ] Defini dependências

## FASE 6: TRIGGERS (Automações)
- [ ] Identifiquei pontos de automação
- [ ] Defini webhooks necessários
- [ ] Configurei automações nativas
- [ ] Testei fluxo completo

## FASE 7: DOCUMENTAÇÃO (Conhecimento)
- [ ] Criei templates
- [ ] Criei checklists
- [ ] Criei playbooks
- [ ] Criei quick reference
- [ ] Treinei equipe
```

### 11.2 Template: Especificação de Processo

```yaml
# PROCESS SPECIFICATION TEMPLATE

processo:
  id: {kebab-case-id}
  nome: {Nome do Processo}
  versão: {semver}
  data_criação: {YYYY-MM-DD}
  última_atualização: {YYYY-MM-DD}
  owner: {Responsável}

  resumo:
    objetivo: |
      {O que este processo entrega}
    escopo: |
      {O que está incluído e excluído}
    métricas_sucesso:
      - {Métrica 1}
      - {Métrica 2}

  entidades:
    - nome: {Entidade 1}
      tipo: {core|junction|lookup}
      hierarquia: {Task|Subtask|etc}

  relacionamentos:
    - origem: {Entidade A}
      destino: {Entidade B}
      tipo: {1:1|1:N|N:M|condicional}

  workflows:
    - nome: {Workflow Principal}
      trigger: {O que inicia}
      waves: {Número de waves}

  automações:
    total: {Número}
    lista:
      - nome: {Automação 1}
        trigger: {Trigger}

  documentação:
    templates: [{lista de templates}]
    checklists: [{lista de checklists}]
    playbooks: [{lista de playbooks}]
    quick_reference: {link}

  histórico:
    - versão: {semver}
      data: {YYYY-MM-DD}
      mudanças: |
        {O que mudou}
```

### 11.3 Quick Reference Template

```markdown
# 🚀 Quick Reference - {Nome do Processo}

> **Versão**: X.X | **Data**: DD/MM/YYYY

---

## 📊 Entidades Principais

| Entidade | Nível | Campos-Chave |
|:---------|:------|:-------------|
| {Nome} | {Task} | {campo1}, {campo2} |

---

## 🔗 Relacionamentos

```
{Diagrama ASCII simples}
```

---

## 📁 Status por Entidade

| Entidade | Status Inicial → Final |
|:---------|:-----------------------|
| {Nome} | {Inicial} → {Final} |

---

## ⚡ Triggers Principais

| Trigger | Ação |
|:--------|:-----|
| {Trigger} | {Ação resultante} |

---

## 📞 Referência Rápida

| Dúvida | Resposta |
|:-------|:---------|
| {Pergunta comum} | {Resposta} |

---

*📄 Doc completo: `{link para doc completo}`*
```

---

## 12. Latticework de Frameworks

### 12.1 Diagrama de Interconexão

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        LATTICEWORK DE FRAMEWORKS                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│                           ┌───────────────────┐                               │
│                           │     PROCESSO      │                               │
│                           │   (Objetivo)      │                               │
│                           └─────────┬─────────┘                               │
│                                     │                                         │
│              ┌──────────────────────┼──────────────────────┐                 │
│              │                      │                      │                 │
│              ▼                      ▼                      ▼                 │
│     ┌────────────────┐    ┌────────────────┐    ┌────────────────┐          │
│     │   ENTIDADES    │◄──►│ RELACIONAMENTOS│◄──►│   HIERARQUIA   │          │
│     └───────┬────────┘    └───────┬────────┘    └───────┬────────┘          │
│             │                     │                     │                    │
│             └──────────┬──────────┴──────────┬──────────┘                    │
│                        │                     │                               │
│                        ▼                     ▼                               │
│               ┌────────────────┐    ┌────────────────┐                       │
│               │    CAMPOS      │    │    STATUS      │                       │
│               │ (Custom Fields)│    │ (State Machine)│                       │
│               └───────┬────────┘    └───────┬────────┘                       │
│                       │                     │                                │
│              ┌────────┴─────────────────────┴────────┐                       │
│              │                                       │                       │
│              ▼                                       ▼                       │
│     ┌────────────────┐                     ┌────────────────┐                │
│     │    TRIGGERS    │─────────────────────│   AUTOMAÇÕES   │                │
│     │   (Eventos)    │                     │   (Ações)      │                │
│     └───────┬────────┘                     └───────┬────────┘                │
│             │                                       │                        │
│             └───────────────────┬───────────────────┘                        │
│                                 │                                            │
│                                 ▼                                            │
│                       ┌────────────────┐                                     │
│                       │     TASKS      │                                     │
│                       │ (Unid. Atômica)│                                     │
│                       └───────┬────────┘                                     │
│                               │                                              │
│              ┌────────────────┼────────────────┐                             │
│              │                │                │                             │
│              ▼                ▼                ▼                             │
│     ┌────────────────┐ ┌───────────┐ ┌────────────────┐                     │
│     │   EXECUTORES   │ │   TOOLS   │ │    SCRIPTS     │                     │
│     │ (Quem/Como)    │ │           │ │                │                     │
│     └───────┬────────┘ └─────┬─────┘ └───────┬────────┘                     │
│             │                │               │                               │
│             └────────────────┴───────────────┘                               │
│                              │                                               │
│                              ▼                                               │
│                    ┌────────────────┐                                        │
│                    │   WORKFLOWS    │                                        │
│                    │ (Orquestração) │                                        │
│                    └───────┬────────┘                                        │
│                            │                                                 │
│                            ▼                                                 │
│                    ┌────────────────┐                                        │
│                    │  DOCUMENTAÇÃO  │                                        │
│                    │ (Conhecimento) │                                        │
│                    └────────────────┘                                        │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 12.2 Fluxo de Aplicação do Framework

```
┌─────────────────────────────────────────────────────────────────┐
│           FLUXO DE APLICAÇÃO DO FRAMEWORK                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. ENTENDER O PROCESSO                                          │
│     │                                                            │
│     ├── Qual o objetivo final?                                   │
│     ├── Quem são os stakeholders?                                │
│     └── Quais as dores atuais?                                   │
│         │                                                        │
│         ▼                                                        │
│  2. MAPEAR ENTIDADES                                             │
│     │                                                            │
│     ├── O que precisa ser rastreado?                             │
│     ├── Quais campos são necessários?                            │
│     └── Qual a hierarquia?                                       │
│         │                                                        │
│         ▼                                                        │
│  3. DEFINIR RELACIONAMENTOS                                      │
│     │                                                            │
│     ├── Como as entidades se conectam?                           │
│     ├── Existem relacionamentos condicionais?                    │
│     └── Qual campo determina o tipo?                             │
│         │                                                        │
│         ▼                                                        │
│  4. CRIAR STATE MACHINES                                         │
│     │                                                            │
│     ├── Quais status por entidade?                               │
│     ├── Quais transições permitidas?                             │
│     └── O que bloqueia transições?                               │
│         │                                                        │
│         ▼                                                        │
│  5. QUEBRAR EM TASKS                                             │
│     │                                                            │
│     ├── Quais as unidades atômicas?                              │
│     ├── Quem/o que executa cada uma?                             │
│     └── Quais dependências?                                      │
│         │                                                        │
│         ▼                                                        │
│  6. DEFINIR TRIGGERS                                             │
│     │                                                            │
│     ├── O que dispara cada ação?                                 │
│     ├── Quais webhooks necessários?                              │
│     └── Quais automações nativas?                                │
│         │                                                        │
│         ▼                                                        │
│  7. MONTAR WORKFLOWS                                             │
│     │                                                            │
│     ├── Como as tasks se organizam?                              │
│     ├── Quais podem ser paralelas?                               │
│     └── Quais são sequenciais?                                   │
│         │                                                        │
│         ▼                                                        │
│  8. DOCUMENTAR                                                   │
│     │                                                            │
│     ├── Templates prontos?                                       │
│     ├── Checklists criados?                                      │
│     ├── Playbooks escritos?                                      │
│     └── Quick reference disponível?                              │
│         │                                                        │
│         ▼                                                        │
│  9. IMPLEMENTAR & ITERAR                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 12.3 Princípios de Ouro

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRINCÍPIOS DE OURO                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. TASK-FIRST                                                   │
│     "A task é a unidade atômica. Tudo começa por ela."           │
│                                                                  │
│  2. IMPOSSIBILITAR > DOCUMENTAR                                  │
│     "Bloqueie caminhos errados. Não apenas documente os certos." │
│                                                                  │
│  3. AUTOMAÇÃO > DELEGAÇÃO                                        │
│     "Se é repetitivo, não deveria ser humano fazendo."           │
│                                                                  │
│  4. RELACIONAMENTO CONDICIONAL                                   │
│     "Um campo classificador determina toda a estrutura."         │
│                                                                  │
│  5. CLICKUP = OPERATING SYSTEM                                   │
│     "Não é ferramenta de tarefas. É infraestrutura."             │
│                                                                  │
│  6. GAP ZERO                                                     │
│     "Elimine gaps de tempo e quantidade de cliques."             │
│                                                                  │
│  7. SISTEMA AUTO-EDUCATIVO                                       │
│     "O sistema ensina enquanto executa."                         │
│                                                                  │
│  8. FLUXO UNIDIRECIONAL                                          │
│     "Processo nunca volta. Automação impede retrocesso."         │
│                                                                  │
│  9. M:N RELATIONSHIPS                                            │
│     "Uma task pode ter múltiplos executores."                    │
│     "Um executor pode executar múltiplas tasks."                 │
│                                                                  │
│  10. DOCUMENTAÇÃO = CÓDIGO                                       │
│      "Templates, checklists e playbooks são executáveis."        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Apêndice: Referências

### Documentos Base

| Documento | Propósito |
|:----------|:----------|
| `PEDRO-VALERIO-OPERATIONAL-FRAMEWORK.md` | 8 Frameworks extraídos do Pedro |
| `UNIFIED-ARCHITECTURE-V1.md` | Arquitetura AllFluence |
| `TASK-FORMAT-SPECIFICATION-V1.md` | Especificação de Tasks AIOS |
| `EXECUTOR-DECISION-TREE.md` | Decision Tree de Executores |
| `AIOS-TASK-SYSTEM-UNIFIED-STANDARD.md` | Standard Unificado AIOS |

### Mind Squad - Pedro Valério

| Chunk | Conteúdo |
|:------|:---------|
| chunk-06 | ClickUp Operating System |
| chunk-07 | Process Absolutism |
| chunk-09 | Automation Philosophy |
| chunk-10 | Task Architecture |
| chunk-23 | ClickUp Mastery |
| chunk-24 | Systems Architecture |
| chunk-25 | Process Engineering |

---

*Framework Agnóstico de Mapeamento de Processos v1.0*
*Baseado em Pedro Valério Task-First Methodology + AIOS Architecture*
*Síntese por Charlie - Synthesis & Frameworks Expert*
