# Referência de API do AIOS

> [EN](../../guides/api-reference.md) | **PT** | [ES](../../es/guides/api-reference.md)

---

Referência completa de API para o Synkra AIOS - o Sistema Orquestrado por IA para Desenvolvimento Full Stack.

**Versão:** 2.1.0
**Última Atualização:** 2026-01-29

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Ativação de Agentes](#ativação-de-agentes)
3. [Referência de Comandos](#referência-de-comandos)
4. [Comandos Específicos de Agentes](#comandos-específicos-de-agentes)
5. [API de Workflows](#api-de-workflows)
6. [Parâmetros e Opções](#parâmetros-e-opções)
7. [Códigos de Retorno e Erros](#códigos-de-retorno-e-erros)
8. [Integração com IDEs](#integração-com-ides)
9. [Exemplos](#exemplos)

---

## Visão Geral

### Arquitetura da API

O AIOS fornece uma API unificada para interagir com agentes de IA especializados através de dois mecanismos principais:

1. **Ativação de Agente** - Usando prefixo `@` para ativar agentes especializados
2. **Execução de Comando** - Usando prefixo `*` para executar comandos de agentes

```
┌─────────────────────────────────────────────────────────────┐
│                      Camada de API AIOS                      │
├─────────────────────────────────────────────────────────────┤
│  @agent         →  Ativa a persona do agente                 │
│  *command       →  Executa comando do agente                 │
│  *command args  →  Executa comando com argumentos            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Resolução de Agente                       │
├─────────────────────────────────────────────────────────────┤
│  .aios-core/development/agents/{agent-id}.md                 │
│  Dependências: tasks, templates, checklists, scripts         │
└─────────────────────────────────────────────────────────────┘
```

### Princípios Fundamentais

| Princípio                    | Descrição                                                         |
| ---------------------------- | ----------------------------------------------------------------- |
| **Task-First**               | Tudo é uma task. Requisições do usuário resolvem para execução de tasks. |
| **Especialização de Agentes** | Cada agente tem um escopo e responsabilidade definidos            |
| **Comandos Declarativos**    | Comandos descrevem intenção, agentes tratam a execução            |
| **Aprimoramento Progressivo** | Comandos simples expandem para workflows complexos                |

---

## Ativação de Agentes

### Sintaxe

```
@{agent-id}
@{agent-id} *{command}
@{agent-id} *{command} {arguments}
```

### Agentes Disponíveis

| Agent ID         | Nome   | Arquétipo    | Responsabilidade Principal                      |
| ---------------- | ------ | ------------ | ----------------------------------------------- |
| `@dev`           | Dex    | Builder      | Implementação de código, debugging, testes      |
| `@qa`            | Quinn  | Guardian     | Garantia de qualidade, code review, testes      |
| `@architect`     | Aria   | Visionary    | Arquitetura de sistema, design de API           |
| `@pm`            | Morgan | Strategist   | Requisitos de produto, epics, estratégia        |
| `@po`            | Pax    | Champion     | Gestão de backlog, critérios de aceitação       |
| `@sm`            | River  | Facilitator  | Planejamento de sprint, criação de stories      |
| `@analyst`       | Atlas  | Explorer     | Pesquisa de mercado, análise competitiva        |
| `@data-engineer` | Dara   | Architect    | Schema de banco, migrations, queries            |
| `@devops`        | Gage   | Optimizer    | CI/CD, deployment, operações git                |
| `@ux-expert`     | Uma    | Creator      | Design UI/UX, wireframes                        |
| `@aios-master`   | Orion  | Orchestrator | Orquestração do framework, meta-operações       |

### Comportamento de Ativação

Quando um agente é ativado:

1. O arquivo de definição do agente é carregado de `.aios-core/development/agents/{id}.md`
2. A persona é adotada (tom, vocabulário, saudação)
3. A saudação contextual é exibida baseada no tipo de sessão
4. O agente para e aguarda entrada do usuário

```bash
# Ativar agente desenvolvedor
@dev

# Saída:
# 💻 Dex (Builder) ready. Let's build something great!
#
# **Quick Commands:**
# - *develop {story-id} - Implement story tasks
# - *run-tests - Execute linting and tests
# - *help - Show all commands
```

### Ativação com Comando

Você pode ativar um agente e executar um comando em um único passo:

```bash
@dev *develop story-1.2.3
@qa *review story-1.2.3
@architect *create-full-stack-architecture
```

---

## Referência de Comandos

### Comandos Universais

Estes comandos estão disponíveis em todos os agentes:

| Comando         | Descrição                                | Exemplo         |
| --------------- | ---------------------------------------- | --------------- |
| `*help`         | Mostrar todos os comandos disponíveis    | `*help`         |
| `*guide`        | Mostrar guia de uso abrangente           | `*guide`        |
| `*session-info` | Mostrar detalhes da sessão atual         | `*session-info` |
| `*exit`         | Sair do modo de agente atual             | `*exit`         |
| `*yolo`         | Alternar pulo de confirmações            | `*yolo`         |

### Sintaxe de Comandos

```
*{command}
*{command} {positional-argument}
*{command} {arg1} {arg2}
*{command} --{flag}
*{command} --{option}={value}
```

### Resolução de Comandos

Comandos resolvem para arquivos de task nas dependências do agente:

```
*develop story-1.2.3
    │
    ▼
.aios-core/development/tasks/dev-develop-story.md
    │
    ▼
Execução de task com argumentos: { story: "story-1.2.3" }
```

---

## Comandos Específicos de Agentes

### @dev (Developer)

**Desenvolvimento de Story:**

| Comando                | Argumentos   | Descrição                                                    |
| ---------------------- | ------------ | ------------------------------------------------------------ |
| `*develop`             | `{story-id}` | Implementar tasks da story (modos: yolo, interactive, preflight) |
| `*develop-yolo`        | `{story-id}` | Modo de desenvolvimento autônomo                             |
| `*develop-interactive` | `{story-id}` | Modo de desenvolvimento interativo (padrão)                  |
| `*develop-preflight`   | `{story-id}` | Modo de planejamento antes da implementação                  |

**Execução de Subtask (ADE):**

| Comando            | Argumentos     | Descrição                                                 |
| ------------------ | -------------- | --------------------------------------------------------- |
| `*execute-subtask` | `{subtask-id}` | Executar subtask única (workflow Coder Agent de 13 passos) |
| `*verify-subtask`  | `{subtask-id}` | Verificar conclusão de subtask                            |

**Sistema de Recuperação:**

| Comando          | Argumentos     | Descrição                           |
| ---------------- | -------------- | ----------------------------------- |
| `*track-attempt` | `{subtask-id}` | Rastrear tentativa de implementação |
| `*rollback`      | `[--hard]`     | Reverter para último estado bom     |

**Operações de Build:**

| Comando             | Argumentos   | Descrição                                |
| ------------------- | ------------ | ---------------------------------------- |
| `*build`            | `{story-id}` | Pipeline de build autônomo completo      |
| `*build-autonomous` | `{story-id}` | Iniciar loop de build autônomo           |
| `*build-resume`     | `{story-id}` | Retomar build do checkpoint              |
| `*build-status`     | `[--all]`    | Mostrar status do build                  |
| `*build-log`        | `{story-id}` | Visualizar log de tentativas de build    |

**Qualidade & Débito:**

| Comando           | Argumentos | Descrição                          |
| ----------------- | ---------- | ---------------------------------- |
| `*run-tests`      | -          | Executar linting e todos os testes |
| `*apply-qa-fixes` | -          | Aplicar feedback e correções de QA |
| `*backlog-debt`   | `{title}`  | Registrar item de débito técnico   |

**Isolamento com Worktree:**

| Comando             | Argumentos   | Descrição                         |
| ------------------- | ------------ | --------------------------------- |
| `*worktree-create`  | `{story-id}` | Criar worktree isolado            |
| `*worktree-list`    | -            | Listar worktrees ativos           |
| `*worktree-merge`   | `{story-id}` | Fazer merge do worktree para base |
| `*worktree-cleanup` | -            | Remover worktrees completados     |

**Camada de Memória:**

| Comando             | Argumentos                      | Descrição                      |
| ------------------- | ------------------------------- | ------------------------------ |
| `*capture-insights` | -                               | Capturar insights da sessão    |
| `*list-gotchas`     | -                               | Listar gotchas conhecidos      |
| `*gotcha`           | `{title} - {description}`       | Adicionar gotcha manualmente   |
| `*gotchas`          | `[--category X] [--severity Y]` | Listar e pesquisar gotchas     |

---

### @qa (Quality Assurance)

**Code Review:**

| Comando         | Argumentos   | Descrição                                            |
| --------------- | ------------ | ---------------------------------------------------- |
| `*code-review`  | `{scope}`    | Executar review automatizado (uncommitted/committed) |
| `*review`       | `{story-id}` | Review abrangente de story                           |
| `*review-build` | `{story-id}` | Review QA estruturado de 10 fases                    |

**Quality Gates:**

| Comando         | Argumentos   | Descrição                                   |
| --------------- | ------------ | ------------------------------------------- |
| `*gate`         | `{story-id}` | Criar decisão de quality gate               |
| `*nfr-assess`   | `{story-id}` | Validar requisitos não-funcionais           |
| `*risk-profile` | `{story-id}` | Gerar matriz de avaliação de riscos         |

**Validação Aprimorada:**

| Comando                | Argumentos   | Descrição                                            |
| ---------------------- | ------------ | ---------------------------------------------------- |
| `*validate-libraries`  | `{story-id}` | Validar uso de bibliotecas de terceiros              |
| `*security-check`      | `{story-id}` | Executar scan de vulnerabilidades de 8 pontos        |
| `*validate-migrations` | `{story-id}` | Validar migrations de banco de dados                 |
| `*evidence-check`      | `{story-id}` | Verificar requisitos de QA baseados em evidências    |
| `*console-check`       | `{story-id}` | Detecção de erros no console do navegador            |

**Solicitações de Correção:**

| Comando               | Argumentos   | Descrição                                |
| --------------------- | ------------ | ---------------------------------------- |
| `*create-fix-request` | `{story-id}` | Gerar QA_FIX_REQUEST.md para @dev        |

**Estratégia de Testes:**

| Comando          | Argumentos   | Descrição                                           |
| ---------------- | ------------ | --------------------------------------------------- |
| `*test-design`   | `{story-id}` | Criar cenários de teste abrangentes                 |
| `*trace`         | `{story-id}` | Mapear requisitos para testes (Given-When-Then)     |
| `*critique-spec` | `{story-id}` | Revisar especificação para completude               |

---

### @architect (Architect)

**Design de Arquitetura:**

| Comando                           | Argumentos | Descrição                                |
| --------------------------------- | ---------- | ---------------------------------------- |
| `*create-full-stack-architecture` | -          | Arquitetura completa do sistema          |
| `*create-backend-architecture`    | -          | Design de arquitetura backend            |
| `*create-front-end-architecture`  | -          | Design de arquitetura frontend           |
| `*create-brownfield-architecture` | -          | Arquitetura para projetos existentes     |

**Documentação & Análise:**

| Comando                      | Argumentos    | Descrição                               |
| ---------------------------- | ------------- | --------------------------------------- |
| `*document-project`          | -             | Gerar documentação do projeto           |
| `*execute-checklist`         | `{checklist}` | Executar checklist de arquitetura       |
| `*research`                  | `{topic}`     | Gerar prompt de pesquisa profunda       |
| `*analyze-project-structure` | -             | Analisar projeto para novas features    |

**Pipeline ADE:**

| Comando              | Argumentos   | Descrição                               |
| -------------------- | ------------ | --------------------------------------- |
| `*assess-complexity` | `{story-id}` | Avaliar complexidade e esforço da story |
| `*create-plan`       | `{story-id}` | Criar plano de implementação            |
| `*create-context`    | `{story-id}` | Gerar contexto do projeto               |
| `*map-codebase`      | -            | Gerar mapa do codebase                  |

---

### @pm (Product Manager)

**Criação de Documentos:**

| Comando                  | Argumentos | Descrição                                  |
| ------------------------ | ---------- | ------------------------------------------ |
| `*create-prd`            | -          | Criar documento de requisitos de produto   |
| `*create-brownfield-prd` | -          | Criar PRD para projetos existentes         |
| `*create-epic`           | -          | Criar epic para brownfield                 |
| `*create-story`          | -          | Criar user story                           |

**Operações de Documentação:**

| Comando      | Argumentos | Descrição                         |
| ------------ | ---------- | --------------------------------- |
| `*doc-out`   | -          | Produzir documento completo       |
| `*shard-prd` | -          | Dividir PRD em partes menores     |

**Pipeline ADE:**

| Comando                | Argumentos | Descrição                                  |
| ---------------------- | ---------- | ------------------------------------------ |
| `*gather-requirements` | -          | Levantar requisitos com stakeholders       |
| `*write-spec`          | -          | Gerar especificação formal                 |

---

### @sm (Scrum Master)

**Gestão de Stories:**

| Comando              | Argumentos   | Descrição                          |
| -------------------- | ------------ | ---------------------------------- |
| `*create-next-story` | -            | Criar próxima user story           |
| `*validate-story`    | `{story-id}` | Validar completude da story        |
| `*manage-backlog`    | -            | Gerenciar backlog de stories       |

---

### @analyst (Analyst)

**Pesquisa:**

| Comando                 | Argumentos  | Descrição                                 |
| ----------------------- | ----------- | ----------------------------------------- |
| `*brainstorm`           | `{topic}`   | Facilitar sessão de brainstorming         |
| `*research-deps`        | `{topic}`   | Pesquisar dependências e restrições       |
| `*competitive-analysis` | `{company}` | Realizar análise competitiva              |
| `*market-research`      | `{topic}`   | Conduzir pesquisa de mercado              |

**Pipeline ADE:**

| Comando             | Argumentos | Descrição                              |
| ------------------- | ---------- | -------------------------------------- |
| `*extract-patterns` | -          | Extrair padrões de código do codebase  |

---

### @devops (DevOps)

**Operações Git:**

| Comando      | Argumentos    | Descrição                    |
| ------------ | ------------- | ---------------------------- |
| `*push`      | `[--force]`   | Push de alterações para remote |
| `*create-pr` | `{title}`     | Criar pull request           |
| `*merge-pr`  | `{pr-number}` | Fazer merge de pull request  |

**Gestão de Worktree:**

| Comando              | Argumentos   | Descrição                        |
| -------------------- | ------------ | -------------------------------- |
| `*create-worktree`   | `{story-id}` | Criar Git worktree isolado       |
| `*list-worktrees`    | -            | Listar worktrees ativos          |
| `*merge-worktree`    | `{story-id}` | Fazer merge do worktree para main |
| `*cleanup-worktrees` | -            | Remover worktrees obsoletos      |

**Gestão de Migração:**

| Comando             | Argumentos   | Descrição                        |
| ------------------- | ------------ | -------------------------------- |
| `*inventory-assets` | -            | Gerar inventário de migração     |
| `*analyze-paths`    | -            | Analisar dependências de paths   |
| `*migrate-agent`    | `{agent-id}` | Migrar agente único              |
| `*migrate-batch`    | -            | Migrar todos os agentes em lote  |

---

### @aios-master (Orchestrator)

**Desenvolvimento do Framework:**

| Comando                | Argumentos      | Descrição                                           |
| ---------------------- | --------------- | --------------------------------------------------- |
| `*create`              | `{type} {name}` | Criar componente AIOS (agent/task/workflow)         |
| `*modify`              | `{type} {name}` | Modificar componente existente                      |
| `*validate-component`  | `{name}`        | Validar segurança do componente                     |
| `*deprecate-component` | `{name}`        | Depreciar com caminho de migração                   |

**Execução de Tasks:**

| Comando              | Argumentos        | Descrição                   |
| -------------------- | ----------------- | --------------------------- |
| `*task`              | `{task-name}`     | Executar task específica    |
| `*workflow`          | `{workflow-name}` | Iniciar workflow            |
| `*execute-checklist` | `{checklist}`     | Executar checklist          |

**Planejamento:**

| Comando | Argumentos                 | Descrição                                        |
| ------- | -------------------------- | ------------------------------------------------ |
| `*plan` | `[create\|status\|update]` | Planejamento de workflow                         |
| `*kb`   | -                          | Alternar modo KB (conhecimento do AIOS Method)   |

**Operações de Documentos:**

| Comando              | Argumentos     | Descrição                         |
| -------------------- | -------------- | --------------------------------- |
| `*create-doc`        | `{template}`   | Criar documento de template       |
| `*create-next-story` | -              | Criar próxima user story          |
| `*doc-out`           | -              | Produzir documento completo       |
| `*shard-doc`         | `{doc} {dest}` | Dividir documento em partes       |

---

## API de Workflows

### Workflows Disponíveis

| Workflow               | Descrição                    | Agentes Envolvidos   |
| ---------------------- | ---------------------------- | -------------------- |
| `greenfield-fullstack` | Novo projeto full-stack      | Todos os agentes     |
| `greenfield-service`   | Novo microserviço            | architect, dev, qa   |
| `greenfield-ui`        | Novo projeto frontend        | architect, ux, dev   |
| `brownfield-fullstack` | Adicionar feature a existente | architect, dev, qa   |
| `brownfield-service`   | Estender serviço existente   | dev, qa              |
| `brownfield-ui`        | Estender frontend existente  | ux, dev, qa          |

### Execução de Workflow

```bash
# Iniciar workflow
@aios-master *workflow greenfield-fullstack

# Com parâmetros
*workflow brownfield-service --target=./services/auth
```

### Estrutura de Workflow

```yaml
# Exemplo de definição de workflow
name: greenfield-fullstack
phases:
  - name: research
    agent: analyst
    tasks:
      - brainstorm
      - competitive-analysis
  - name: planning
    agent: pm
    tasks:
      - create-prd
  - name: architecture
    agent: architect
    tasks:
      - create-full-stack-architecture
  - name: implementation
    agent: dev
    tasks:
      - develop
```

---

## Parâmetros e Opções

### Opções Globais

| Opção       | Tipo    | Descrição                       |
| ----------- | ------- | ------------------------------- |
| `--verbose` | boolean | Habilitar saída detalhada       |
| `--dry-run` | boolean | Visualizar sem executar         |
| `--force`   | boolean | Forçar operação                 |
| `--help`    | boolean | Mostrar ajuda do comando        |

### Parâmetros de Story

| Parâmetro    | Tipo   | Descrição               | Exemplo                      |
| ------------ | ------ | ----------------------- | ---------------------------- |
| `{story-id}` | string | Identificador da story  | `story-1.2.3`, `STORY-42`    |
| `--status`   | enum   | Filtro de status        | `draft`, `ready`, `complete` |
| `--epic`     | string | Filtrar por epic        | `--epic=AUTH`                |

### Parâmetros de Build

| Parâmetro      | Tipo   | Descrição                  | Exemplo                            |
| -------------- | ------ | -------------------------- | ---------------------------------- |
| `--mode`       | enum   | Modo de build              | `yolo`, `interactive`, `preflight` |
| `--retry`      | number | Máximo de tentativas       | `--retry=3`                        |
| `--checkpoint` | string | Retomar de checkpoint      | `--checkpoint=build-001`           |

### Parâmetros de Review

| Parâmetro    | Tipo   | Descrição              | Exemplo                      |
| ------------ | ------ | ---------------------- | ---------------------------- |
| `--scope`    | enum   | Escopo do review       | `uncommitted`, `committed`   |
| `--base`     | string | Branch base para diff  | `--base=main`                |
| `--severity` | enum   | Severidade mínima      | `critical`, `high`, `medium` |

---

## Códigos de Retorno e Erros

### Códigos de Retorno Padrão

| Código | Status  | Descrição                                           |
| ------ | ------- | --------------------------------------------------- |
| `0`    | SUCCESS | Operação completada com sucesso                     |
| `1`    | ERROR   | Erro geral                                          |
| `2`    | BLOCKED | Operação bloqueada (requer aprovação)               |
| `3`    | HALTED  | Operação parada (requer intervenção do usuário)     |
| `4`    | SKIP    | Operação pulada                                     |
| `5`    | TIMEOUT | Operação expirou                                    |

### Categorias de Erro

| Categoria            | Descrição                       | Resolução                                     |
| -------------------- | ------------------------------- | --------------------------------------------- |
| `AGENT_NOT_FOUND`    | Definição de agente ausente     | Verificar `.aios-core/development/agents/`    |
| `TASK_NOT_FOUND`     | Definição de task ausente       | Verificar dependências do agente              |
| `STORY_NOT_FOUND`    | Arquivo de story não encontrado | Verificar caminho `docs/stories/`             |
| `VALIDATION_FAILED`  | Pré-condição não atendida       | Verificar pré-requisitos                      |
| `PERMISSION_DENIED`  | Operação não permitida          | Verificar restrições do agente                |
| `DEPENDENCY_MISSING` | Dependência necessária ausente  | Instalar ou configurar dependência            |

### Formato de Resposta de Erro

```json
{
  "status": "error",
  "code": "VALIDATION_FAILED",
  "message": "Story status must be 'Ready for Dev' to begin implementation",
  "context": {
    "story": "story-1.2.3",
    "currentStatus": "Draft",
    "requiredStatus": "Ready for Dev"
  },
  "suggestions": ["Update story status to 'Ready for Dev'", "Contact @pm to approve story"]
}
```

### Decisões de Quality Gate

| Decisão    | Descrição                          | Ação                                      |
| ---------- | ---------------------------------- | ----------------------------------------- |
| `PASS`     | Todos os critérios atendidos       | Prosseguir para próxima fase              |
| `CONCERNS` | Problemas menores encontrados      | Documentar e prosseguir com cautela       |
| `FAIL`     | Problemas críticos encontrados     | Deve corrigir antes de prosseguir         |
| `WAIVED`   | Problemas reconhecidos, prosseguindo | Documentar motivo da dispensa            |

---

## Integração com IDEs

### IDEs Suportadas

| IDE         | Diretório    | Formato           | Nível de Suporte |
| ----------- | ------------ | ----------------- | ---------------- |
| Claude Code | `.claude/`   | Markdown          | Completo         |
| Cursor      | `.cursor/`   | MDC (frontmatter) | Completo         |
| Windsurf    | `.windsurf/` | Markdown          | Completo         |
| Cline       | `.cline/`    | Markdown          | Completo         |
| VS Code     | `.vscode/`   | JSON              | Parcial          |
| Gemini      | `.gemini/`   | Markdown          | Básico           |

### Configuração de IDE

```yaml
# .aios-sync.yaml
version: 1.0.0
active_ides:
  - claude
  - cursor
  - windsurf

squad_aliases:
  legal: Legal
  copy: Copy
  hr: HR

sync_components:
  agents: true
  tasks: true
  workflows: true
  checklists: true
```

### Comandos de Sincronização

```bash
# Sincronizar agente específico
*command agent {agent-name}

# Sincronizar task específica
*command task {task-name}

# Sincronizar squad inteiro
*command squad {squad-name}

# Sincronizar todos os componentes
*command sync-all
```

### Integração Claude Code

Claude Code é a IDE principal suportada com integração completa:

**Comandos de Agente (Slash Commands):**

```
/dev          → Ativa agente @dev
/qa           → Ativa agente @qa
/architect    → Ativa agente @architect
/aios-master  → Ativa agente @aios-master
```

**Estrutura de Diretórios:**

```
.claude/
├── commands/
│   └── AIOS/
│       └── agents/
│           ├── dev.md
│           ├── qa.md
│           ├── architect.md
│           └── ...
├── rules/
│   └── mcp-usage.md
└── hooks/
    ├── read-protection.py
    └── sql-governance.py
```

### Integração Cursor

```
.cursor/
└── rules/
    ├── dev.mdc
    ├── qa.mdc
    └── architect.mdc
```

Formato MDC inclui frontmatter:

```yaml
---
description: Full Stack Developer - Code implementation
globs: []
alwaysApply: false
---
# Agent content...
```

### Integração Windsurf

```
.windsurf/
└── agents/
    ├── dev.md
    ├── qa.md
    └── architect.md
```

---

## Exemplos

### Exemplo 1: Implementação Completa de Story

```bash
# 1. Ativar agente desenvolvedor
@dev

# 2. Iniciar implementação da story
*develop story-1.2.3

# 3. Executar testes
*run-tests

# 4. Verificar gotchas
*list-gotchas

# 5. Sair do modo desenvolvedor
*exit

# 6. Mudar para QA
@qa

# 7. Revisar a story
*review story-1.2.3

# 8. Criar quality gate
*gate story-1.2.3
```

### Exemplo 2: Pipeline de Especificação ADE

```bash
# 1. Levantar requisitos
@pm *gather-requirements

# 2. Avaliar complexidade
@architect *assess-complexity story-1.2.3

# 3. Pesquisar dependências
@analyst *research-deps "authentication libraries"

# 4. Escrever especificação
@pm *write-spec

# 5. Criticar especificação
@qa *critique-spec story-1.2.3

# 6. Criar plano de implementação
@architect *create-plan story-1.2.3

# 7. Gerar contexto
@architect *create-context story-1.2.3

# 8. Executar subtasks
@dev *execute-subtask 1.1

# 9. Revisar build
@qa *review-build story-1.2.3
```

### Exemplo 3: Fluxo de Recuperação

```bash
# Quando a implementação falha
@dev

# 1. Rastrear a tentativa falha
*track-attempt subtask-1.1

# 2. Verificar gotchas conhecidos
*list-gotchas

# 3. Tentar rollback
*rollback

# 4. Tentar novamente com abordagem diferente
*execute-subtask 1.1 --approach alternative

# 5. Capturar insights para o futuro
*capture-insights
```

### Exemplo 4: Desenvolvimento Paralelo com Worktrees

```bash
# 1. Criar worktree isolado
@devops *create-worktree STORY-42

# 2. Desenvolver em isolamento
@dev *develop STORY-42

# 3. Review de QA
@qa *review STORY-42

# 4. Fazer merge de volta
@devops *merge-worktree STORY-42

# 5. Limpeza
@devops *cleanup-worktrees
```

### Exemplo 5: Desenvolvimento do Framework

```bash
# 1. Ativar orquestrador master
@aios-master

# 2. Habilitar base de conhecimento
*kb

# 3. Criar novo agente
*create agent my-custom-agent

# 4. Validar o componente
*validate-component my-custom-agent

# 5. Criar task associada
*create task my-custom-task

# 6. Testar o workflow
*task my-custom-task
```

---

## Árvore de Decisão de Agentes

Use esta árvore de decisão para selecionar o agente correto:

```
O que você precisa?
│
├─ Pesquisa/Análise?
│  └─ @analyst
│
├─ Requisitos de Produto?
│  ├─ PRD/Epic → @pm
│  └─ User Stories → @sm
│
├─ Arquitetura?
│  ├─ Design de Sistema → @architect
│  └─ Schema de Banco → @data-engineer
│
├─ Implementação?
│  └─ @dev
│
├─ Garantia de Qualidade?
│  └─ @qa
│
├─ Deployment/Git?
│  └─ @devops
│
├─ Design UX/UI?
│  └─ @ux-expert
│
└─ Framework/Orquestração?
   └─ @aios-master
```

---

## Melhores Práticas

### 1. Use o Agente Correto

Cada agente tem um limite de responsabilidade específico. Usar o agente correto garante:

- Expertise apropriada é aplicada
- Ferramentas corretas estão disponíveis
- Delegação adequada ocorre

### 2. Siga o Pipeline de Especificação

Para features complexas, siga o pipeline de especificação ADE:

1. `@pm *gather-requirements` - Coletar requisitos
2. `@architect *assess-complexity` - Estimar esforço
3. `@analyst *research-deps` - Pesquisar restrições
4. `@pm *write-spec` - Escrever especificação
5. `@qa *critique-spec` - Validar qualidade

### 3. Rastreie Tudo

Use comandos de memória para preservar conhecimento:

- `*capture-insights` após descobertas
- `*gotcha` para armadilhas conhecidas
- `*track-attempt` para tentativas de implementação

### 4. Use Sistema de Recuperação

Quando estiver travado:

1. `*track-attempt` - Registrar a falha
2. `*rollback` - Reverter para estado bom
3. `*list-gotchas` - Verificar problemas conhecidos
4. Tentar abordagem alternativa

### 5. Aproveite Worktrees

Para desenvolvimento paralelo:

- `*worktree-create` para isolamento
- `*worktree-merge` para integração
- `*worktree-cleanup` para manutenção

---

## Documentação Relacionada

- [Guia do Usuário](./user-guide.md) - Começando com AIOS
- [Guia de Seleção de Agentes](./agent-selection-guide.md) - Escolhendo o agente correto
- [Guia ADE](./ade-guide.md) - Motor de Desenvolvimento Autônomo
- [Quality Gates](./quality-gates.md) - Workflows de garantia de qualidade
- [Guia de Sincronização de IDE](./ide-sync-guide.md) - Sincronização multi-IDE
- [Guia de Squads](./squads-guide.md) - Estendendo AIOS com squads

---

_Synkra AIOS Referência de API v4.0.4_
