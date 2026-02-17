<!--
  Tradução: PT-BR
  Original: /docs/en/aios-nomenclature-specification.md
  Última sincronização: 2026-01-26
-->

# Especificação de Nomenclatura do AIOS

> 🌐 [EN](../aios-nomenclature-specification.md) | **PT** | [ES](../es/aios-nomenclature-specification.md)

---

**Versão:** 1.0.0
**Status:** Rascunho
**Criado:** 2025-01-17
**Autor:** Dex (Dev Agent)
**Inspirado Por:** AsyncThink (Microsoft Research), Agent Lightning (Microsoft)

---

## Resumo Executivo

Este documento estabelece nomenclatura clara para o AIOS diferenciando entre:
- **Task Workflow**: Passos de execução internos dentro de uma única task
- **Workflow**: Orquestração multi-task entre agents com capacidades Fork/Join

Esta especificação incorpora insights do paradigma AsyncThink da Microsoft Research e do framework Agent Lightning para habilitar execução de agents assíncrona e otimizada.

---

## Definições Principais

### Task Workflow (Task_workflow)

**Definição:** A sequência de passos e ações **dentro de uma única task** que define como essa task executa.

**Características:**
- **Escopo:** Interno a um único arquivo de task (`.aios-core/tasks/*.md`)
- **Execução:** Passos sequenciais ou paralelos dentro dos limites da task
- **Localização:** Definido na seção `Step-by-Step Execution` do arquivo de task
- **Responsabilidade:** Um único agent executando uma task
- **Exemplo:** `security-scan.md` tem 5 passos: Setup → Scan → Analyze → Detect → Report

**Convenção de Nomenclatura:**
- Use `task-workflow` ou `task_workflow` na documentação
- Referenciado como "passos de execução de task" ou "task workflow" em contexto
- **NÃO** chame apenas de "workflow" (para evitar confusão)

**Exemplo de Estrutura:**
```markdown
## Step-by-Step Execution

### Step 1: Setup Security Tools
**Purpose:** Garantir que todas as ferramentas de escaneamento de segurança necessárias estejam instaladas
**Actions:**
1. Verificar disponibilidade do npm audit
2. Instalar plugins de segurança do ESLint se ausentes
...

### Step 2: Dependency Vulnerability Scan
...
```

---

### Workflow

**Definição:** Uma sequência de **múltiplas tasks** executadas por **um ou mais agents**, onde saídas de tasks conectam a entradas de tasks sequencialmente ou em paralelo, suportando operações Fork e Join.

**Características:**
- **Escopo:** Orquestração cross-task entre múltiplos agents
- **Execução:** Pode ser sequencial, paralela (Fork), ou convergente (Join)
- **Localização:** Definido em `.aios-core/workflows/*.yaml` ou seções de workflow de stories
- **Responsabilidade:** Múltiplos agents coordenando para alcançar um objetivo
- **Exemplo:** Workflow de Desenvolvimento de Story: `po-create-story` → `dev-develop-story` → `qa-gate`

**Convenção de Nomenclatura:**
- Use `workflow` para orquestração multi-task
- Pode ser nomeado descritivamente: `story-development-workflow`, `pm-tool-integration-workflow`
- Suporta padrões AsyncThink: Organizer-Worker, Fork/Join

**Exemplo de Estrutura:**
```yaml
workflow:
  id: story-development-workflow
  name: Story Development Flow
  description: Ciclo de vida completo da story desde requisitos até QA gate

  stages:
    - id: create-story
      agent: po
      task: create-next-story
      inputs:
        - requirements_doc
      outputs:
        - story_file

    - id: develop-story
      agent: dev
      task: dev-develop-story
      inputs:
        - story_file  # Conectado do estágio anterior
      outputs:
        - code_changes
        - test_results

    - id: qa-gate
      agent: qa
      task: qa-gate
      inputs:
        - story_file      # De create-story
        - code_changes   # De develop-story
      outputs:
        - qa_report
```

---

## Integração AsyncThink

### Padrão Organizer-Worker

**Conceito:** Inspirado pelo protocolo Organizer-Worker do AsyncThink, workflows do AIOS podem usar um **Organizer Agent** que coordena **Worker Agents** executando tasks em paralelo.

**Aplicação ao AIOS:**

1. **Organizer Agent:**
   - Coordena execução de workflow
   - Toma decisões sobre pontos de Fork/Join
   - Gerencia dependências de tasks
   - Mescla resultados de workers paralelos

2. **Worker Agents:**
   - Executam tasks específicas atribuídas pelo organizer
   - Processam sub-consultas/tasks independentemente
   - Retornam resultados ao organizer
   - Podem ser agents especializados (dev, qa, po, etc.)

**Exemplo de Workflow com Fork/Join:**
```yaml
workflow:
  id: parallel-validation-workflow
  organizer: aios-master

  stages:
    - id: fork-validation
      type: fork
      organizer_decision: "Dividir validação em tasks paralelas"
      workers:
        - agent: dev
          task: security-scan
          inputs:
            - codebase
          outputs:
            - security_report

        - agent: qa
          task: qa-run-tests
          inputs:
            - codebase
          outputs:
            - test_results

        - agent: dev
          task: sync-documentation
          inputs:
            - codebase
          outputs:
            - docs_synced

    - id: join-validation
      type: join
      organizer_merges:
        - security_report
        - test_results
        - docs_synced
      outputs:
        - validation_complete
```

---

## Integração Agent Lightning

### Framework de Otimização de Agents

**Conceito:** Agent Lightning permite otimizar QUALQUER agent com QUALQUER framework usando aprendizado por reforço, sem modificar código do agent.

**Aplicação ao AIOS:**

1. **Integração com Lightning Server:**
   - Coleta traces de execução de agents
   - Monitora sucesso/falha de tasks
   - Rastreia métricas de performance
   - Habilita otimização baseada em RL

2. **Monitoramento Não-Intrusivo:**
   - Design sidecar para coleta de traces
   - Sem mudanças de código em tasks existentes
   - Geração automática de tuplas de transição (state, action, reward, next_state)

3. **Oportunidades de Otimização:**
   - Eficiência de execução de tasks
   - Tomada de decisão de agents
   - Orquestração de workflows
   - Estratégias de tratamento de erros

**Exemplo de Integração:**
```yaml
# .aios-core/core-config.yaml
agent_lightning:
  enabled: true
  server_host: localhost
  server_port: 4747

  optimization:
    - target: dev-develop-story
      algorithm: RL
      metrics:
        - execution_time
        - code_quality_score
        - test_coverage

    - target: workflow-orchestration
      algorithm: APO  # Automatic Prompt Optimization
      metrics:
        - workflow_success_rate
        - parallelization_efficiency
```

---

## Regras de Nomenclatura

### Regra 1: Task Workflow vs Workflow

**Quando usar "Task Workflow" (ou "task-workflow"):**
- Referindo-se a passos dentro de um único arquivo de task
- Documentando fluxo de execução de task
- Descrevendo lógica interna de task
- Em seções `Step-by-Step Execution` de arquivos de task

**Quando usar "Workflow":**
- Referindo-se a orquestração multi-task
- Descrevendo coordenação de agents
- Documentando padrões Fork/Join
- Em arquivos de definição de workflow (`.yaml`)

**NUNCA:**
- Use "workflow" para se referir a passos de task
- Use "task workflow" para se referir a orquestração multi-task
- Misture terminologia sem contexto

---

### Regra 2: Convenções de Nomenclatura de Arquivos

**Arquivos de Task:**
- Localização: `.aios-core/tasks/{task-name}.md`
- Contém: Task workflow (Step-by-Step Execution)
- Exemplo: `.aios-core/tasks/security-scan.md`

**Arquivos de Workflow:**
- Localização: `.aios-core/workflows/{workflow-name}.yaml`
- Contém: Definição de orquestração multi-task
- Exemplo: `.aios-core/workflows/story-development-workflow.yaml`

**Documentação:**
- Docs de task workflow: `docs/tasks/{task-name}-workflow.md` (se necessário)
- Docs de workflow: `docs/workflows/{workflow-name}.md`

---

### Regra 3: Referências em Código

**Em Arquivos de Task:**
```markdown
## Step-by-Step Execution

Esta seção define o **task workflow** para executar esta task.
Cada passo representa uma ação sequencial dentro desta task.
```

**Em Arquivos de Workflow:**
```yaml
workflow:
  name: Story Development Workflow
  description: |
    Este workflow orquestra múltiplas tasks entre agents.
    Ele define dependências de tasks e ordem de execução.
```

**Em Arquivos de Story:**
```markdown
## Workflow Execution

**Workflow:** Story Development Flow
- Task 1: `po-create-story` (task workflow: 3 passos)
- Task 2: `dev-develop-story` (task workflow: 8 passos)
- Task 3: `qa-gate` (task workflow: 5 passos)
```

---

## Operações Fork e Join

### Operação Fork

**Definição:** Divide execução de workflow em caminhos paralelos, onde múltiplas tasks executam simultaneamente.

**Sintaxe:**
```yaml
fork:
  id: parallel-validation
  condition: "validation_needed"
  parallel_tasks:
    - agent: dev
      task: security-scan
      inputs:
        - codebase

    - agent: qa
      task: qa-run-tests
      inputs:
        - codebase

    - agent: dev
      task: sync-documentation
      inputs:
        - codebase
```

**Características:**
- Múltiplos agents executam tasks em paralelo
- Cada task tem seu próprio task workflow
- Tasks podem ter tempos de execução diferentes
- Resultados coletados independentemente

---

### Operação Join

**Definição:** Mescla resultados de tasks paralelas de volta para execução sequencial do workflow.

**Sintaxe:**
```yaml
join:
  id: merge-validation-results
  wait_for:
    - security-scan
    - qa-run-tests
    - sync-documentation
  merge_strategy: "all_success"  # ou "any_success", "majority"
  outputs:
    - validation_complete
```

**Características:**
- Aguarda todas as tasks paralelas completarem
- Mescla resultados de acordo com estratégia
- Pode ter timeout/tratamento de erros
- Continua workflow com resultados mesclados

---

## Padrões de Workflow

### Padrão 1: Workflow Sequencial

**Descrição:** Tasks executam uma após a outra, com conexões output → input.

**Exemplo:**
```yaml
workflow:
  id: sequential-story-development
  stages:
    - task: create-story
      agent: po
      outputs: [story_file]

    - task: develop-story
      agent: dev
      inputs: [story_file]  # Da task anterior
      outputs: [code_changes]

    - task: qa-gate
      agent: qa
      inputs: [story_file, code_changes]
      outputs: [qa_report]
```

---

### Padrão 2: Workflow Fork-Join (Padrão AsyncThink)

**Descrição:** Divide em tasks paralelas, depois mescla resultados.

**Exemplo:**
```yaml
workflow:
  id: parallel-validation-workflow
  stages:
    - task: prepare-codebase
      agent: dev
      outputs: [codebase]

    - type: fork
      parallel_tasks:
        - task: security-scan
          agent: dev
          inputs: [codebase]

        - task: qa-run-tests
          agent: qa
          inputs: [codebase]

        - task: sync-documentation
          agent: dev
          inputs: [codebase]

    - type: join
      merge_strategy: all_success
      outputs: [validation_complete]

    - task: deploy
      agent: dev
      inputs: [validation_complete]
```

---

### Padrão 3: Workflow Condicional

**Descrição:** Workflow ramifica baseado em condições.

**Exemplo:**
```yaml
workflow:
  id: conditional-deployment
  stages:
    - task: build
      agent: dev
      outputs: [build_artifact]

    - type: conditional
      condition: "environment == 'production'"
      if_true:
        - task: security-audit
          agent: security
        - task: production-deploy
          agent: dev
      if_false:
        - task: staging-deploy
          agent: dev
```

---

## Representação Visual

### Task Workflow (Interno à Task)

```
Task: security-scan.md
┌─────────────────────────────────────┐
│ Step 1: Setup Security Tools        │
│ Step 2: Dependency Vulnerability   │
│ Step 3: Code Security Pattern Scan  │
│ Step 4: Secret Detection            │
│ Step 5: Generate Security Report    │
└─────────────────────────────────────┘
```

### Workflow (Orquestração Multi-Task)

```
Workflow: Story Development
┌─────────────┐
│ PO Agent    │
│ create-story│──┐
└─────────────┘  │
                 │ story_file
                 ▼
         ┌───────────────┐
         │   FORK        │
         └───────────────┘
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
┌──────┐ ┌──────┐ ┌──────┐
│ Dev  │ │ QA  │ │ Dev  │
│ scan │ │test │ │ docs │
└──────┘ └──────┘ └──────┘
    │         │         │
    └─────────┼─────────┘
              │
              ▼
         ┌───────────────┐
         │     JOIN       │
         └───────────────┘
              │
              ▼
         ┌───────────────┐
         │  QA Agent     │
         │  qa-gate      │
         └───────────────┘
```

---

## Diretrizes de Implementação

### Para Desenvolvedores de Task

1. **Use a seção "Step-by-Step Execution"** para definir task workflow
2. **Nunca se refira a isso como "workflow"** - use "passos de execução de task" ou "task workflow"
3. **Cada passo deve ser atômico** e claramente definido
4. **Documente inputs/outputs** para cada passo
5. **Suporte passos paralelos** se a task permitir (ex: executar múltiplos scans simultaneamente)

### Para Designers de Workflow

1. **Use arquivos YAML de workflow** para definir orquestração multi-task
2. **Especifique claramente dependências de task** (inputs/outputs)
3. **Use Fork/Join** para execução paralela quando benéfico
4. **Documente decisões do organizer** para workflows complexos
5. **Suporte tratamento de erros** e estratégias de rollback

### Para Escritores de Documentação

1. **Sempre clarifique contexto** ao usar o termo "workflow"
2. **Use "task workflow"** ao se referir a passos de task
3. **Use "workflow"** ao se referir a orquestração multi-task
4. **Inclua diagramas visuais** para workflows complexos
5. **Documente padrões Fork/Join** claramente

---

## Exemplos do Codebase

### Exemplo 1: Task Workflow (security-scan.md)

```markdown
## Step-by-Step Execution

### Step 1: Setup Security Tools
**Purpose:** Garantir que todas as ferramentas de escaneamento de segurança necessárias estejam instaladas
**Actions:**
1. Verificar disponibilidade do npm audit
2. Instalar plugins de segurança do ESLint se ausentes
...

### Step 2: Dependency Vulnerability Scan
**Purpose:** Escanear dependências npm por vulnerabilidades conhecidas
**Actions:**
1. Executar `npm audit --audit-level=moderate --json`
...
```

**Nota:** Este é um **task workflow** - passos internos dentro da task security-scan.

---

### Exemplo 2: Workflow (Story Development)

```yaml
# .aios-core/workflows/story-development-workflow.yaml
workflow:
  id: story-development-workflow
  name: Story Development Flow

  stages:
    - id: create-story
      agent: po
      task: create-next-story
      inputs:
        - requirements_doc
      outputs:
        - story_file

    - id: develop-story
      agent: dev
      task: dev-develop-story
      inputs:
        - story_file
      outputs:
        - code_changes

    - id: qa-gate
      agent: qa
      task: qa-gate
      inputs:
        - story_file
        - code_changes
      outputs:
        - qa_report
```

**Nota:** Este é um **workflow** - orquestração multi-task entre agents.

---

## Melhorias Futuras

### Roadmap de Integração AsyncThink

1. **Fase 1: Padrão Organizer-Worker**
   - Implementar organizer agent para coordenação de workflow
   - Suportar operações Fork/Join em workflows
   - Habilitar execução paralela de tasks

2. **Fase 2: Otimização RL**
   - Integrar Agent Lightning para otimização de agents
   - Coletar traces de execução automaticamente
   - Otimizar decisões de orquestração de workflow

3. **Fase 3: Adaptação Dinâmica de Workflow**
   - Aprender pontos ótimos de Fork/Join
   - Adaptar estrutura de workflow baseado em complexidade de task
   - Otimizar latência de caminho crítico

### Roadmap de Integração Agent Lightning

1. **Fase 1: Coleta de Traces**
   - Implementar integração com Lightning Server
   - Coletar traces de execução de agents
   - Monitorar taxas de sucesso/falha de tasks

2. **Fase 2: Otimização**
   - Habilitar otimização de tasks baseada em RL
   - Otimizar tomada de decisão de agents
   - Melhorar orquestração de workflow

3. **Fase 3: Aprendizado Contínuo**
   - Implementar aprendizado online
   - Adaptar a novos padrões de tasks
   - Otimizar coordenação multi-agent

---

## Referências

1. **Paper AsyncThink:** "The Era of Agentic Organization: Learning to Organize with Language Models" - Microsoft Research
   - [arXiv:2510.26658](https://arxiv.org/abs/2510.26658)
   - Conceitos Chave: Organizer-Worker, Fork/Join, Asynchronous Thinking

2. **Agent Lightning:** Framework da Microsoft para otimização de AI agents
   - [GitHub: microsoft/agent-lightning](https://github.com/microsoft/agent-lightning)
   - [Documentação](https://microsoft.github.io/agent-lightning/latest/)
   - Conceitos Chave: Otimização zero-code, treinamento RL, Suporte multi-agent

3. **Gerenciamento de Workflow AIOS:** Padrões de workflow existentes no AIOS
   - `common/utils/workflow-management.md`
   - `docs/WORKFLOW-COMPLETE-CONSOLIDATED-V3.md`

---

## Checklist para Conformidade de Nomenclatura

Ao criar ou atualizar documentação:

- [ ] Usou "task workflow" ou "passos de execução de task" ao se referir a internos de task
- [ ] Usou "workflow" ao se referir a orquestração multi-task
- [ ] Clarificou contexto se termo poderia ser ambíguo
- [ ] Seguiu convenções de nomenclatura de arquivos
- [ ] Documentou padrões Fork/Join claramente
- [ ] Incluiu diagramas visuais para workflows complexos

---

**Status do Documento:** Rascunho - Pronto para Revisão
**Próximos Passos:** Revisão pelos agents PO, Dev e QA para feedback e aprovação
