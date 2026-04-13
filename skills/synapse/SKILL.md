---
name: synapse
description: "This skill should be used when users want to understand the SYNAPSE context engine, manage domains, configure context rules, or troubleshoot rule injection. Use when asked about SYNAPSE architecture, domain management, star-commands, context brackets, or the 8-layer processing pipeline."
version: 1.1.0
category: framework
tags: [context-engine, rules, injection, hooks, domains]
paths:
  - "skills/synapse/"
  - ".aiox-core/core/synapse/"
  - ".synapse/"
lazy_load: true
context_budget: 1200
---

# SYNAPSE Context Engine

## Overview

SYNAPSE (Synkra Adaptive Processing & State Engine) é o motor de contexto unificado do AIOS. Funciona como um DJ automático: a cada prompt que você envia, ele mixa as regras certas no volume certo — dependendo de quem você é (agente), o que está fazendo (workflow), e quanto espaço ainda tem na conversa (bracket).

**O que faz:**
- Injeta regras por-prompt via Claude Code's `UserPromptSubmit` hook
- Processa 8 camadas (L0 Constitution até L7 Star-Commands) sequencialmente
- Adapta volume de injeção baseado em context brackets (FRESH/MODERATE/DEPLETED/CRITICAL)
- Integra com estado do agente (agente ativo, workflow, task, squad)
- Gera bloco XML `<synapse-rules>` anexado a cada prompt

**O que substituiu:** SYNAPSE substituiu o sistema legado CARL com paridade total de features + 8 novas capabilities incluindo domínios agent-scoped, ativação por workflow, e comandos CRUD.

**Modelo de arquitetura:** Open Core — o motor de 8 camadas vive em `aios-core` (open source), integração com memória é feature-gated em `aios-pro`.

## When to Use This Skill

- Entender como o SYNAPSE funciona (arquitetura, camadas, brackets)
- Criar ou modificar domínios de regras
- Debugar por que uma regra não está sendo injetada
- Configurar star-commands customizados
- Verificar estado atual do motor (status, brackets, domínios ativos)

## Do NOT Use This Skill When

- Quer criar um agente → use a estrutura de agentes em `.aiox-core/development/agents/`
- Quer gerenciar memória do projeto → use o memory protocol
- Quer configurar MCP servers → delegue para `@devops`

## Discovery Questions

Perguntas para fazer antes de executar. Use AskUserQuestion tool. Pule se o usuário já forneceu esse contexto.

1. **Quer entender o estado atual do SYNAPSE (status), gerenciar domínios (create/edit/toggle), ou resolver um problema (debug)?** — (define se é consulta, CRUD, ou troubleshooting)
2. **Está trabalhando com um domínio específico ou quer uma visão geral?** — (se específico, foca naquele domínio; se geral, mostra status completo)
3. **Quer criar um novo domínio de regras ou modificar um existente?** — (opcional) (determina se usa `*synapse create` ou `*synapse edit/add`)

## Quick Start

### Verificar se SYNAPSE está Ativo

SYNAPSE roda automaticamente via Claude Code hook. Para checar status:

```
*synapse status
```

Isso mostra: domínios ativos, bracket atual, informações de sessão, e camadas carregadas.

### Comandos Básicos

| Comando | O Que Faz |
|---------|-----------|
| `*synapse status` | Mostra estado atual do motor |
| `*synapse domains` | Lista todos os domínios registrados |
| `*synapse debug` | Mostra debug detalhado (manifest parse, load times, rule counts) |
| `*synapse help` | Mostra todos os comandos disponíveis |
| `*brief` | Muda para modo de resposta breve |
| `*dev` | Muda para modo desenvolvedor (foco em código) |
| `*review` | Muda para modo code review |

### Criar um Domínio Customizado

```
*synapse create
```

Isso guia você pela criação de um novo arquivo de domínio + entrada no manifest. Veja [references/domains.md](references/domains.md) para o guia completo.

## Architecture

SYNAPSE opera em 4 camadas arquiteturais:

```
.claude/hooks/synapse-engine.js          # Layer 1: Hook Entry (~50 linhas)
        |
        v imports
.aiox-core/core/synapse/                 # Layer 2: Engine Modules
|-- engine.js                            #   Classe SynapseEngine
|-- layers/                              #   8 layer processors (L0-L7)
|-- session/session-manager.js           #   Estado da sessão (JSON v2.0)
|-- domain/domain-loader.js              #   Manifest + domain parser
|-- context/context-tracker.js           #   Cálculo de brackets
|-- memory/memory-bridge.js              #   Consumer pro-gated MIS
|-- output/formatter.js                  #   Saída XML <synapse-rules>
        |
        v reads/writes
.synapse/                                # Layer 3: Runtime Data
|-- manifest                             #   Registro central de domínios (KEY=VALUE)
|-- constitution, global, context        #   Domínios core (L0, L1)
|-- agent-*, workflow-*                  #   Domínios scoped (L2, L3)
|-- commands                             #   Definições de star-commands (L7)
|-- sessions/, cache/                    #   Estado de sessão (gitignored)
        |
        v user-invoked
.claude/commands/synapse/                # Layer 4: CRUD Commands + Skill Docs
|-- manager.md                           #   Router/dispatcher
|-- tasks/ (6 tasks)                     #   create, add, edit, toggle, command, suggest
```

**Princípio-chave:** SYNAPSE é um **consumidor** de sistemas existentes (UAP para estado de sessão, MIS para memórias). Ele nunca reescreve código de outros epics.

## 8-Layer Processing Pipeline

O pipeline processa camadas em ordem de prioridade. É como um bolo de 8 andares: cada camada adiciona regras mais específicas por cima das anteriores.

| Camada | Nome | Prioridade | Escopo | Exemplo |
|--------|------|-----------|--------|---------|
| L0 | Constitution | Máxima | Global, sempre ativo | Artigos inegociáveis (CLI First, Agent Authority) |
| L1 | Global | Alta | Global, sempre ativo | Regras comportamentais, pt-BR quality |
| L2 | Agent | Alta | Ativo quando agente está ativo | Regras do @dev, @qa, @devops |
| L3 | Workflow | Média | Ativo durante workflow | Story development cycle, epic execution |
| L4 | Task | Média | Ativo durante task específica | Regras para uma task em andamento |
| L5 | Squad | Média | Ativo quando squad está rodando | Regras do ai-reels, copywriting |
| L6 | Context | Baixa | Adapta por bracket | Regras que mudam com uso de contexto |
| L7 | Star-Commands | Baixa | Ativado por `*comando` | `*brief`, `*dev`, `*review` |

### Resolução de Conflitos

Quando duas regras conflitam:
1. **Camada mais alta vence** — L0 > L1 > L2 > ... > L7
2. **Dentro da mesma camada** — regra mais recente (última no arquivo) vence
3. **Domínio desativado** — regras ignoradas completamente

## Context Brackets

O sistema de brackets é como o medidor de combustível do SYNAPSE. Conforme a conversa avança e consome tokens, o motor reduz o volume de regras injetadas para não desperdiçar contexto.

| Bracket | Uso de Contexto | Comportamento |
|---------|----------------|---------------|
| FRESH | 0-30% | Todas as camadas ativas, injeção completa |
| MODERATE | 30-60% | Reduz L5-L7, mantém L0-L4 completos |
| DEPLETED | 60-85% | Só L0-L2 (Constitution, Global, Agent) |
| CRITICAL | 85-100% | Só L0 (Constitution) — modo sobrevivência |

### Como Verificar Bracket Atual

```
*synapse status
```

O campo `bracket` mostra o nível atual. Se estiver em DEPLETED ou CRITICAL, considere iniciar uma nova sessão.

## CRUD Commands — Gerenciamento de Domínios

| Comando | Propósito | Exemplo |
|---------|-----------|---------|
| `*synapse create` | Criar novo domínio + entrada no manifest | `*synapse create` → wizard interativo |
| `*synapse add` | Adicionar regra a domínio existente | `*synapse add agent-dev "Sempre usar TypeScript"` |
| `*synapse edit` | Editar ou remover regra por índice | `*synapse edit global 3` → edita regra #3 |
| `*synapse toggle` | Ativar/desativar domínio | `*synapse toggle workflow-tdd` |
| `*synapse command` | Criar novo star-command | `*synapse command *focus "modo foco"` |
| `*synapse suggest` | Sugerir melhor domínio para uma regra | `*synapse suggest "sempre commitar antes de push"` |

### Exemplo: Criar Domínio para Projeto Específico

```
*synapse create
```

O wizard pergunta:
1. Nome do domínio (ex: `project-meuapp`)
2. Camada (ex: L4 Task ou L5 Squad)
3. Condição de ativação (ex: quando cwd contém `meuapp/`)
4. Primeiras regras

Resultado: arquivo criado em `.synapse/project-meuapp` + entrada no manifest.

### Exemplo: Adicionar Star-Command

```
*synapse command
```

Cria um comando como `*deploy-check` que injeta regras específicas quando invocado. Útil para modos temporários de trabalho.

## References

### Guias de Referência

| Guia | Descrição |
|------|-----------|
| [domains.md](references/domains.md) | Tipos de domínio (L0-L7), formato KEY=VALUE, guia de criação |
| [commands.md](references/commands.md) | Star-commands, sub-comandos *synapse, operações CRUD |
| [manifest.md](references/manifest.md) | Especificação do formato manifest, todas as chaves válidas |
| [brackets.md](references/brackets.md) | Sistema de brackets, budgets de token, ativação de camadas |
| [layers.md](references/layers.md) | Arquitetura de 8 camadas, prioridade, resolução de conflitos |

### Assets (Templates)

Templates para criar domínios customizados e entradas no manifest:

- **Template de domínio:** `.claude/commands/synapse/templates/domain-template`
- **Template de entrada no manifest:** `.claude/commands/synapse/templates/manifest-entry-template`

Veja [assets/README.md](assets/README.md) para detalhes.

## Troubleshooting

### Regra não está sendo injetada

**Sintomas:** Você adicionou uma regra num domínio, mas o comportamento não mudou.

**Diagnóstico:**
```
*synapse debug
```

**Causas comuns:**
1. **Domínio desativado** — verificar com `*synapse domains` se está `active: true`
2. **Bracket DEPLETED/CRITICAL** — a camada do domínio pode estar sendo filtrada. Verificar com `*synapse status`
3. **Manifest não atualizado** — o domínio existe como arquivo, mas não tem entrada no manifest. Adicionar manualmente ou usar `*synapse create`
4. **Erro de sintaxe no domínio** — verificar formato KEY=VALUE com `*synapse debug`

### Hook não está executando

**Sintomas:** Nenhuma regra SYNAPSE aparece, como se o motor não existisse.

**Diagnóstico:**
1. Verificar se o hook existe: `ls .claude/hooks/synapse-engine.js`
2. Verificar se está registrado em `.claude/settings.json` no evento `UserPromptSubmit`
3. Testar manualmente: `node .claude/hooks/synapse-engine.js`

**Solução:** Se o hook não está registrado, verificar `.claude/settings.json` e garantir que `hooks` é um **objeto** (não array). Veja `.claude/rules/settings-format.md`.

### Regras duplicadas aparecendo

**Causa:** Mesmo conteúdo presente em múltiplos domínios.
**Solução:** Usar `*synapse suggest "texto da regra"` para encontrar o domínio correto e remover duplicatas com `*synapse edit`.

### Performance lenta (> 500ms de injeção)

**Causas:**
1. Muitos domínios ativos (> 20) — desativar os não necessários
2. Arquivos de domínio muito grandes — dividir em domínios menores
3. Cache expirado — limpar `.synapse/cache/` e reiniciar sessão

### Erro "manifest parse failed"

**Causa:** Formato inválido no arquivo `.synapse/manifest`.
**Solução:** Cada linha deve seguir o formato `KEY=VALUE`. Linhas em branco e comentários (`#`) são permitidos. Verificar se não há caracteres especiais ou encoding errado.

## Key Files

| Arquivo | Função |
|---------|--------|
| `.claude/hooks/synapse-engine.js` | Entry point do hook (UserPromptSubmit) |
| `.aiox-core/core/synapse/engine.js` | Orquestrador SynapseEngine |
| `.synapse/manifest` | Registro de domínios (KEY=VALUE) |
| `.synapse/commands` | Definições de star-commands |
| `.claude/commands/synapse/manager.md` | Router de comandos CRUD |
