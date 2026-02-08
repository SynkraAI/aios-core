# AAA — Agent Activation Architecture (Skills-First)

**Documento de Investigação**
**Data:** 2026-02-05
**Autor:** @pm (Bob)
**Epic Reference:** Epic 13 (futuro), Epic AAA (mmos)
**Fonte:** `/Users/alan/Code/mmos/docs/projects/aios/epics/epic-aaa/README.md`

---

## Contexto

O Epic AAA do projeto MMOS documenta uma pesquisa profunda sobre como migrar agentes AIOS de "faz de conta" (carregar .md como contexto) para "ativação real" (skills com hooks nativos). Esta investigação é diretamente aplicável ao AIOS Core.

---

## O Problema Diagnosticado

> "Agentes AIOS são 'faz de conta' - carregam contexto mas não são ativados de verdade."

**Sintomas:**
- Workflows dizem "@agent executa" mas só carregam o .md como contexto
- Não há persistência de estado entre turns
- Não há controle de loop (agente pode sair quando quiser)
- Não há scoping de tools por agente
- Greetings/hooks de ativação não executam

**Impacto:**
- Qualidade inconsistente dos outputs
- Agentes "esquecem" persona ao longo da conversa
- Workflows são sequência de prompts, não orquestração real

---

## Descoberta: Claude Code 2.1 — Skills com Hooks Nativos

Skills agora suportam **hooks nativos no frontmatter**:

```yaml
---
name: builder
description: Engineering agent that executes tasks
model: opus
allowed-tools: Read, Write, Edit, Bash(npm *)
context: fork
agent: Explore
hooks:
  PostToolUse:
    - matcher: "Write|Edit"
      hooks:
        - type: command
          command: "python validate.py"
---
```

### Skills vs Commands — Unificados

> "Custom slash commands have been merged into skills. A file at `.claude/commands/review.md` and a skill at `.claude/skills/review/SKILL.md` both create `/review` and work the same way."
>
> Fonte: https://code.claude.com/docs/en/skills

---

## Frontmatter Capabilities Completas

| Campo | Função | Relevância AIOS |
|-------|--------|-----------------|
| `name` | Nome do skill (vira `/name`) | Identificador do agente |
| `description` | Quando Claude deve usar (auto-invocation) | Agent routing |
| `allowed-tools` | Tools permitidos quando skill ativo | **Tool scoping por agente** |
| `user-invocable` | Se aparece no menu `/` | Visibilidade |
| `disable-model-invocation` | Se Claude pode invocar automaticamente | Controle |
| `context: fork` | Executa em subagent isolado | **Isolamento** |
| `agent` | Tipo de subagent (Explore, Plan, general-purpose) | Especialização |
| `hooks` | Hooks scoped ao lifecycle do skill | **Quality gates** |
| `model` | Modelo a usar (opus, sonnet, haiku) | **Custo/qualidade** |

---

## Hook Types Disponíveis

| Hook | Quando Executa | Uso para AIOS |
|------|----------------|---------------|
| `UserPromptSubmit` | Antes de Claude processar prompt | Pre-validation |
| `PreToolUse` | Antes de tool executar (pode bloquear) | Security gate |
| `PostToolUse` | Depois de tool executar | Quality check |
| `Stop` | Quando Claude termina de responder | **Ralph loop** |
| `SessionStart` | Início de sessão | Agent activation |
| `SessionEnd` | Fim de sessão | Cleanup |
| `SubagentStart` | Quando subagent é spawnado | Orchestration |
| `SubagentStop` | Quando subagent termina | Result collection |
| `PreCompact` | Antes de compaction | State preservation |
| `Notification` | Quando Claude precisa de atenção | Surface to human |
| `PermissionRequest` | Quando permissão é solicitada | Auto-approval |

### Exit Codes

- `0` = Sucesso, continuar
- `2` = Bloquear ação
- Outros = Warning (não bloqueia)

### JSON Output para Controle

```json
{
  "decision": "block",
  "reason": "Continue trabalhando até completar a task"
}
```

---

## Solução Proposta: Skills-First Architecture

### Antes vs Depois

```
ANTES (Faz de conta):
Workflow: "@gary-halbert executa phase 2"
    ↓
Claude lê gary-halbert.md como contexto
    ↓
"Finge" ser Gary Halbert

DEPOIS (Ativação Real):
Workflow Phase 2:
    ↓
Chama /Copy:gary-halbert
    ↓
Skill é ATIVADA (hooks, persona, allowed-tools)
    ↓
Agente opera até completar
    ↓
Output passa para próxima fase
```

### Estrutura de Diretórios Proposta

```
squads/{squad-name}/
├── config.yaml
├── skills/                    # Skills em vez de agents/
│   ├── agent-name/
│   │   ├── SKILL.md          # Frontmatter + instructions
│   │   ├── frameworks.md     # Supporting files
│   │   └── examples/
│   └── ...
├── tasks/
├── workflows/
├── templates/
└── checklists/
```

### Template SKILL.md para AIOS

```yaml
---
name: {agent-name}
description: |
  {quando usar este agente, para auto-invocation}
model: opus|sonnet|haiku
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(npm *)
user-invocable: true
disable-model-invocation: false
context: fork
agent: general-purpose
hooks:
  PostToolUse:
    - matcher: "Write|Edit"
      hooks:
        - type: command
          command: "validate.sh"
  Stop:
    - hooks:
        - type: prompt
          prompt: "Check if task meets quality standards"
---

# Agent Name - Title

## Identity
[Voice DNA, Thinking DNA, etc...]

## Frameworks
[Operational frameworks...]

## Examples
[Output examples...]
```

### Workflow Invocando Skills

```yaml
# workflows/wf-development.yaml
phases:
  - phase: 1
    skill: "/AIOS:agents:architect"
    input: "Design solution for $STORY"
    output_key: "design"

  - phase: 2
    skill: "/AIOS:agents:dev"
    input: "Implement based on: $design"
    output_key: "implementation"

  - phase: 3
    skill: "/AIOS:agents:qa"
    input: "Test implementation: $implementation"
    output_key: "test_report"
```

---

## Padrões Arquiteturais Identificados

### 1. Skill Handoff Chain (RECOMENDADO)

```
Skill A → Output → Skill B → Output → Skill C
```

Composição natural, cada skill isolado, output via handoff.

### 2. Orchestrator-Worker Pattern

```
Orchestrator Skill
├── spawn Worker A (parallel)
├── spawn Worker B (parallel)
├── spawn Worker C (parallel)
└── collect + reduce results
```

Ideal para tasks decomponíveis.

### 3. Hook-Driven Workflow Control

```
[@pm/create-story]
├─ hook: on_start → validate story ID
├─ execute: @pm creates story
└─ hook: on_complete → notify @architect

[@architect/design]
├─ hook: on_start → load previous designs
├─ execute: @architect designs
└─ hook: on_complete → trigger @dev
```

### 4. Persona Consistency Framework (Anti-Drift)

```yaml
hooks:
  on_response:
    - validate_persona_consistency
    - if_drift_detected: regenerate
```

Previne "esquecimento" de persona com validação a cada resposta.

### 5. Structured Handoff Protocol

```json
{
  "payload": { "system_design": {...} },
  "metadata": {
    "source_agent": "architect",
    "timestamp": "2026-02-05T10:30:00Z",
    "schema_version": "v1"
  }
}
```

Schema validation entre agents, previne silent failures.

---

## Repositórios de Referência

| Repositório | Stars | Relevância |
|-------------|-------|------------|
| [ruvnet/claude-flow](https://github.com/ruvnet/claude-flow) | 13.7k | Multi-agent orchestration, 60+ skills, 3-tier model routing |
| [wshobson/agents](https://github.com/wshobson/agents) | 27.8k | 129 skills em 27 plugins, TDD workflow patterns |
| [0ldh/claude-code-agents-orchestra](https://github.com/0ldh/claude-code-agents-orchestra) | 800+ | 47 agents em 10 teams — mirror da estrutura AIOS |
| [daymade/claude-code-skills](https://github.com/daymade/claude-code-skills) | 517 | skill-creator meta-skill, production patterns |
| [levnikolaevich/claude-code-skills](https://github.com/levnikolaevich/claude-code-skills) | 400+ | Full delivery workflow (stages ln-1XX → ln-6XX) |
| [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) | 6.1k | 200+ skills, cross-platform |
| [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | 28.2k | Maior marketplace de skills curados |
| [disler/claude-code-hooks-mastery](https://github.com/disler/claude-code-hooks-mastery) | 1.5k | Reference implementation de hooks |

### Hook SDKs por Linguagem

| Linguagem | Repositório | Padrão |
|-----------|-------------|--------|
| TypeScript | johnlindquist/claude-hooks | Type-safe hook definitions |
| Python | decider/claude-hooks | Lightweight stdin/stdout |
| Go | krmcbride/claudecode-hooks | Allow/Block patterns |
| PHP | beyondcode/claude-hooks-sdk | Fluent interface |

---

## Impacto Esperado da Migração

| Aspecto | Antes (Commands) | Depois (Skills) |
|---------|-------------------|------------------|
| Ativação | Contexto carregado | Skill ativado com hooks |
| Tools | Todos para todos | Scoped por skill |
| Persona | Simulada | Mantida por hooks |
| Estado | Perdido entre turns | Persistido em fork |
| Validação | Manual | Hooks automáticos |
| Qualidade | Inconsistente | Verificada por hooks |
| Modelo | Mesmo para todos | Selecionável por role |
| Isolamento | Nenhum | context: fork |

---

## ADRs (Architectural Decision Records)

### ADR-001: Skills over Commands

**Contexto:** AIOS usa `commands/` mas `skills/` oferece mais funcionalidades.
**Decisão:** Migrar para `skills/` com frontmatter completo.
**Consequências:**
- (+) Hooks nativos, allowed-tools, context: fork, model selection
- (-) Migração necessária, estrutura de diretórios muda

### ADR-002: Workflows Invoke Skills

**Contexto:** Workflows atuais "ativam" agentes carregando contexto.
**Decisão:** Workflows invocam skills com `/skill-name`.
**Consequências:**
- (+) Ativação real, isolamento, estado persistido
- (-) Refatoração de workflows, handoff pattern a definir

---

## Respostas às Open Questions

### Q1: Backward Compatibility
**Recomendação:** Migração gradual com dual-support.
- Commands/ funcionando durante transição
- Skills/ como primário para novos
- Deprecar commands/ após 90 dias

### Q2: Sync Script
**Recomendação:** Symlinks.
```bash
ln -s $PWD/squads/Copy/skills ~/.claude/skills/Copy
```

### Q3: Hooks Validation
**Recomendação:** Hook library padrão AIOS.
```
.aios-core/hooks/
├── validators/
│   ├── persona_consistency.py
│   ├── output_schema.py
│   └── quality_gate.py
└── utils/
    ├── hook_base.py
    └── json_response.py
```

### Q4: Model Selection
| Role | Model | Justificativa |
|------|-------|---------------|
| Orchestrator | opus | Decisões complexas |
| Specialist | sonnet | Execução focada |
| Validator | haiku | Verificações rápidas |

---

## Relação com Story 13.1 (bob-loop.sh)

A Story 13.1 usa `--append-system-prompt` como approach **rápido e testável**. A migração para skills é o passo seguinte:

| Fase | Approach | Quando |
|------|----------|--------|
| **Agora (13.1)** | `--append-system-prompt` + agent .md | Testável hoje |
| **Próximo** | Migrar 1 agente piloto para SKILL.md | Após validar 13.1 |
| **Futuro** | Todos os agentes como skills com hooks | Epic dedicado |

A 13.1 valida que a execução funciona. Skills adicionam hooks, tools, fork — mas não mudam a mecânica base.

---

## Documentação Oficial

- [Claude Code Skills](https://code.claude.com/docs/en/skills)
- [Claude Code Hooks](https://code.claude.com/docs/en/hooks)
- [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents)

## Artigos

- [Skills Auto-Activation via Hooks](https://paddo.dev/blog/claude-skills-hooks-solution/)
- [Claude Code 2.1: The Pain Points? Fixed](https://paddo.dev/blog/claude-code-2-1/)
- [Skill Activation Hook](https://claudefa.st/blog/tools/hooks/skill-activation-hook)

---

*Pesquisa realizada em 2026-02-05 por @pm (Bob)*
*Consolidando: Epic AAA (mmos), deep dive research, repositórios de referência*
