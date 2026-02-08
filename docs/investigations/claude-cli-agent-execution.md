# Claude Code CLI — Flags para Execução Real de Agentes

**Documento de Investigação**
**Data:** 2026-02-05
**Autor:** @pm (Bob)
**Epic Reference:** Epic 13 (Story 13.1)
**Fonte:** `claude --help` output + análise de scripts MMOS/Ralph

---

## Descoberta Crítica

O Claude Code CLI suporta flags que permitem **ativação real de agentes** em modo não-interativo, não apenas "simulação" de persona. A flag chave é `--append-system-prompt`.

---

## Flags Relevantes para Execução de Agentes

### Execução Core

| Flag | Função | Uso |
|------|--------|-----|
| `-p, --print` | Modo não-interativo (output e exit) | Base para automação |
| `--dangerously-skip-permissions` | Pula todos os checks de permissão | Execução autônoma |
| `--model <model>` | Seleciona modelo (opus, sonnet, haiku, ou full name) | Controle de custo/qualidade |

### Ativação de Agente

| Flag | Função | Uso |
|------|--------|-----|
| **`--append-system-prompt <prompt>`** | **Acrescenta ao system prompt default** | **AGENT DEFINITION** |
| `--system-prompt <prompt>` | Substitui system prompt inteiro | Não recomendado (perde CLAUDE.md) |
| `--allowed-tools <tools...>` | Restringe ferramentas disponíveis | Tool scoping por agente |
| `--disallowed-tools <tools...>` | Bloqueia ferramentas específicas | Segurança |

### Controle de Custo e Segurança

| Flag | Função | Uso |
|------|--------|-----|
| `--max-budget-usd <amount>` | Teto de custo USD (só com --print) | Safety valve financeira |
| `--max-turns` | Máximo de turns da API | Limita complexidade |
| `--fallback-model <model>` | Modelo alternativo se principal sobrecarregado | Resiliência |

### Sessão e Continuidade

| Flag | Função | Uso |
|------|--------|-----|
| `-c, --continue` | Continua última sessão no diretório | Retomar trabalho |
| `-r, --resume [id]` | Retoma sessão por ID | Retomar específica |
| `--session-id <id>` | Usa ID de sessão específico | Tracking |
| `--no-session-persistence` | Não persiste sessão (só com --print) | Iterações descartáveis |

### Configuração Avançada

| Flag | Função | Uso |
|------|--------|-----|
| `--settings <file-or-json>` | Carrega settings de arquivo ou JSON | Config por execução |
| `--mcp-config <configs...>` | Carrega MCP servers de JSON | MCPs por execução |
| `--plugin-dir <paths...>` | Carrega plugins de diretórios | Plugins por sessão |
| `--add-dir <directories...>` | Diretórios adicionais para acesso | Expandir sandbox |
| `--tools <tools...>` | Especifica lista de tools disponíveis | Override total |
| `--disable-slash-commands` | Desabilita todos os skills | Modo restrito |

### Output e Debug

| Flag | Função | Uso |
|------|--------|-----|
| `--output-format <format>` | Formato: text, json, stream-json | Parsing automático |
| `--json-schema <schema>` | Schema JSON para output estruturado | Validação |
| `-d, --debug [filter]` | Debug mode com filtro de categoria | Troubleshooting |
| `--debug-file <path>` | Logs de debug para arquivo | Análise posterior |
| `--verbose` | Override verbose mode | Mais info |

---

## O Problema: "Faz de Conta" vs "Ativação Real"

### ❌ Abordagem Errada — Agent como User Message

```bash
# Tudo vai como UMA mensagem de usuário
echo "Você é Dex o developer... Implemente esta story..." | claude -p
```

**Por que é ruim:**
- Agent definition compete com outros conteúdos na mensagem
- Claude pode priorizar outras instruções sobre a persona
- Não há separação entre "quem você é" e "o que fazer"
- CLAUDE.md pode conflitar com instruções do agente no mesmo nível

### ✅ Abordagem Correta — Agent como System Prompt

```bash
# Agent definition no SYSTEM PROMPT (mais alta prioridade)
# Story no USER MESSAGE (a task)
claude -p \
  --append-system-prompt "$(cat .aios-core/development/agents/dev.md)" \
  --dangerously-skip-permissions \
  --max-budget-usd 5 \
  "Implement this story: $(cat story-file.md)"
```

**Por que funciona:**
- `--append-system-prompt` injeta no nível de **system prompt**
- System prompt tem a mais alta prioridade de instrução do Claude
- SOMA ao CLAUDE.md existente (não substitui)
- Story fica como user message (a tarefa a executar)
- Separação clara entre persona e task

### Diagrama de Camadas

```
┌─────────────────────────────────────────────────────────┐
│  SYSTEM PROMPT (prioridade máxima)                      │
│  ├── CLAUDE.md (Constitution, framework rules)          │
│  ├── .claude/rules/*.md (MCP usage, patterns)           │
│  └── --append-system-prompt → AGENT DEFINITION          │
│      (dev.md com persona, workflow, commands)            │
├─────────────────────────────────────────────────────────┤
│  USER MESSAGE (a task a executar)                       │
│  ├── Story content (acceptance criteria)                │
│  ├── Iteration context (N of max, progress)             │
│  └── Completion rules (<promise>COMPLETE</promise>)     │
├─────────────────────────────────────────────────────────┤
│  CONTROLS (flags CLI)                                   │
│  ├── --dangerously-skip-permissions (autonomous)        │
│  ├── --max-budget-usd (cost ceiling per iteration)      │
│  ├── --allowed-tools (tool scoping per agent type)      │
│  └── --model (model selection per agent role)           │
└─────────────────────────────────────────────────────────┘
```

---

## `--append-system-prompt` vs `--system-prompt`

| Aspecto | `--system-prompt` | `--append-system-prompt` |
|---------|-------------------|--------------------------|
| CLAUDE.md | **SUBSTITUÍDO** | **PRESERVADO** |
| Rules (.claude/rules/) | **PERDIDOS** | **PRESERVADOS** |
| Constitution | **PERDIDA** | **PRESERVADA** |
| Agent definition | Único conteúdo | Somado ao existente |
| **Recomendação** | **NÃO USAR** | **USAR SEMPRE** |

**SEMPRE use `--append-system-prompt`**, nunca `--system-prompt`, para preservar o contexto do projeto (CLAUDE.md, Constitution, Rules).

---

## Tool Scoping por Agente

```bash
# @dev — Acesso completo
claude -p \
  --append-system-prompt "$(cat agents/dev.md)" \
  --allowed-tools "Bash,Edit,Read,Write,Grep,Glob,Task" \
  --dangerously-skip-permissions \
  "Implement story..."

# @qa — Apenas leitura + testes
claude -p \
  --append-system-prompt "$(cat agents/qa.md)" \
  --allowed-tools "Bash(npm test:*),Read,Grep,Glob" \
  --dangerously-skip-permissions \
  "Test story..."

# @architect — Análise sem modificação
claude -p \
  --append-system-prompt "$(cat agents/architect.md)" \
  --allowed-tools "Read,Grep,Glob,WebSearch" \
  --dangerously-skip-permissions \
  "Review architecture..."
```

---

## Model Selection por Role

```bash
# Orchestrator (decisões complexas) → opus
claude -p --model opus --append-system-prompt "$(cat agents/pm.md)" ...

# Specialist (execução focada) → sonnet
claude -p --model sonnet --append-system-prompt "$(cat agents/dev.md)" ...

# Validator (checks rápidos) → haiku
claude -p --model haiku --append-system-prompt "$(cat agents/qa.md)" ...
```

---

## Comando Completo para bob-loop.sh

```bash
claude -p \
  --append-system-prompt "$(cat .aios-core/development/agents/${AGENT}.md)" \
  --dangerously-skip-permissions \
  --max-budget-usd "$MAX_BUDGET" \
  --output-format text \
  "$USER_PROMPT"
```

**Opcionais para futuro:**
```bash
  --allowed-tools "$AGENT_TOOLS" \          # Tool scoping
  --model "$AGENT_MODEL" \                  # Model per role
  --no-session-persistence \                # Sem persistir sessão
  --json-schema "$OUTPUT_SCHEMA" \          # Output estruturado
  --settings "$AGENT_SETTINGS" \            # Settings per agent
```

---

## Referências

- `claude --help` — Output completo analisado em 2026-02-05
- [Claude Code Documentation](https://code.claude.com/docs/en/)
- Padrões de invocação dos scripts MMOS (`mmos.sh`, `ralph.sh`)
- Plugin oficial Ralph Wiggum (Anthropic)

---

*Pesquisa realizada em 2026-02-05 por @pm (Bob)*
