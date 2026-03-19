---
name: sync-projects
description: >-
  Sincroniza projetos locais e contexto pessoal com o Bridge Doc no Google Docs.
  O Bridge Doc serve como ponte entre Claude Code (local) e o Telegram Bot (VPS),
  dando ao bot contexto sobre projetos ativos e vida pessoal para classificação
  mais rica de ideias no braindump.
risk: safe
source: self
---

# Sync Projects — Bridge Doc Updater

Atualiza o Google Doc "Meus Projetos & Contexto" que o bot Telegram lê para enriquecer classificações Eisenhower.

## Quando Usar

- Após criar/modificar projetos significativos
- Quando quiser que o bot tenha contexto atualizado sobre seus projetos
- Periodicamente (recomendado: 1x por semana)

## O Que Faz

1. Lê o registry local (`data/project-registry.json` do telegram-agenda-bot)
2. Lê memórias de perfil do usuário (se disponíveis)
3. Formata tudo como conteúdo para Google Doc
4. Atualiza o Bridge Doc via MCP google-workspace

## Execução

```bash
# No diretório do telegram-agenda-bot
cd ~/CODE/Projects/telegram-agenda-bot
```

### Passo 1: Ler Registry

Ler `data/project-registry.json` e extrair:
- Nome do projeto
- Tipo (app, tool, framework, etc.)
- Stack
- Descrição
- Path

### Passo 2: Ler Contexto Pessoal

Verificar memórias em:
- `~/.claude/projects/-Users-luizfosc-CODE-Projects-telegram-agenda-bot/memory/user_*.md`
- Extrair informações relevantes para contexto

### Passo 3: Formatar e Atualizar

Usar MCP `google-workspace` para atualizar o Bridge Doc:

```
mcp__google-workspace__docs_replaceText
```

Formato do documento:

```
# Meus Projetos & Contexto
Última atualização: {timestamp}

## Projetos Ativos
{lista de projetos com nome, tipo, stack, descrição}

## Contexto Pessoal
{informações de perfil e contexto}

## Prioridades Atuais
{extraído de memórias de projeto}
```

### Passo 4: Confirmar

Informar ao usuário que o Bridge Doc foi atualizado e o bot terá contexto atualizado em até 30 minutos (cache TTL).

## Notas

- O Bridge Doc ID é armazenado em `data/report-index.json` do telegram-agenda-bot
- Se o Bridge Doc não existir, o bot cria automaticamente na primeira execução
- O bot faz cache de 30 minutos do conteúdo do Bridge Doc
