# MMOS Scripts — Análise de Padrões de Execução

**Documento de Investigação**
**Data:** 2026-02-05
**Autor:** @pm (Bob)
**Epic Reference:** Epic 13
**Fonte:** `/Users/alan/Code/mmos/squads/mmos/scripts/` e `/Users/alan/Code/mmos/squads/ralph/scripts/`

---

## Visão Geral

Análise de 4 scripts em produção no projeto MMOS que implementam execução autônoma de agentes IA. Todos usam Claude Code CLI com `-p --dangerously-skip-permissions`.

| Script | Linhas | Propósito |
|--------|--------|-----------|
| `mmos.sh` | 1223 | Pipeline multi-fase com A/B testing |
| `ralph.sh` | 352 | Loop autônomo PRD-driven |
| `ralph-swarm.sh` | 342 | Execução paralela multi-projeto (tmux) |
| `ralph-parallel.sh` | 428 | Execução paralela dependency-aware |

---

## 1. mmos.sh (1223 linhas)

### Arquitetura

Pipeline de **8 fases** com agentes especializados:

| Fase | Agente | Função |
|------|--------|--------|
| 1 | Tim | Strategy & Big Idea |
| 2 | Daniel | Research & Analysis |
| 3 | Brené | Emotional Mapping |
| 4 | Barbara | Persuasion Structure |
| 5 | Charlie | Copy Writing |
| 6 | Constantin | Design Direction |
| 7 | Quinn | Quality Review |
| 8 | Victoria | Final Assembly |

### Padrão de Execução

```bash
claude -p --model "$model" --dangerously-skip-permissions "$PHASE_PROMPT"
```

**Flags usadas:**
- `-p` — Print mode (non-interactive)
- `--model "$model"` — Seleção de modelo (para A/B testing)
- `--dangerously-skip-permissions` — Sem prompts de confirmação
- Prompt passado como argumento posicional (não stdin)

### A/B Testing

Roda a mesma fase com **dois modelos** (Haiku e Opus) simultaneamente para comparação de qualidade:

```bash
# Fase com Haiku
claude -p --model "haiku" --dangerously-skip-permissions "$PROMPT" > output_haiku.txt &
PID_HAIKU=$!

# Mesma fase com Opus
claude -p --model "opus" --dangerously-skip-permissions "$PROMPT" > output_opus.txt &
PID_OPUS=$!

wait $PID_HAIKU $PID_OPUS
# Scoring comparison
```

### Execução Paralela

Fases 2, 3 e 4 rodam em **paralelo** (background processes) com state merging após todas completarem:

```bash
run_phase 2 &
run_phase 3 &
run_phase 4 &
wait
merge_state  # Combina outputs no mmos-state.json
```

### State Management

```bash
# Estado persistido em JSON com jq
STATE_FILE="mmos-state.json"

# Atualizar estado
jq ".phases[\"phase_$PHASE\"].status = \"complete\"" "$STATE_FILE" > tmp && mv tmp "$STATE_FILE"

# Ler estado
STATUS=$(jq -r ".phases[\"phase_$PHASE\"].status" "$STATE_FILE")
```

### Completion Detection

```bash
if echo "$OUTPUT" | grep -q "<promise>PHASE_COMPLETE</promise>"; then
  echo "Phase $PHASE complete!"
fi
```

Usa `<promise>PHASE_COMPLETE</promise>` (diferente do `COMPLETE` do ralph.sh).

### Job Metrics

Cada execução logada em JSONL com:
- Duração
- Modelo usado
- Resultado (pass/fail)
- Fase
- Timestamp

### Progress Dashboard

ASCII dashboard com status por fase, tempo de execução, e métricas de qualidade.

### Auto-Mode

Flag para clearing automático de human checkpoints (sem confirmação manual entre fases).

---

## 2. ralph.sh (352 linhas)

### Arquitetura

Loop autônomo PRD-driven: lê `prd.json`, encontra stories pendentes, executa uma por iteração.

### Padrão de Execução

```bash
claude -p --dangerously-skip-permissions "$FULL_PROMPT"
```

Sem `--model` (usa default). Prompt como argumento posicional.

### PRD como Source of Truth

```bash
# Ler stories pendentes
PENDING=$(jq '[.userStories[] | select(.passes == false)] | length' prd.json)

# Montar prompt com story específica
STORY=$(jq -r '.userStories[] | select(.passes == false) | first' prd.json)
FULL_PROMPT="Implement this story: $STORY"
```

### Auto-Fix Mechanism

Verifica se output files existem para marcar stories como completas:

```bash
# Se arquivo de output existe → story está done
if [ -f "$EXPECTED_OUTPUT_FILE" ]; then
  jq ".userStories[$INDEX].passes = true" prd.json > tmp && mv tmp prd.json
fi
```

Não depende apenas do `<promise>` — checa evidência real.

### Completion Detection

```bash
if echo "$OUTPUT" | grep -q "<promise>COMPLETE</promise>"; then
  echo "All tasks complete!"
  exit 0
fi
```

### Branch Archiving

Quando detecta mudança de branch no prd.json:

```bash
if [ "$CURRENT_BRANCH" != "$LAST_BRANCH" ]; then
  mkdir -p "archive/$DATE-$BRANCH_NAME"
  cp prd.json progress.txt "archive/$DATE-$BRANCH_NAME/"
  echo "# Ralph Progress Log" > progress.txt  # Reset
fi
```

### Unbuffered Output

Suporta output em tempo real durante execução (sem buffering).

### Auto-Redirect

Redireciona para `ralph-parallel.sh` para content/refactor modes automaticamente.

---

## 3. ralph-swarm.sh (342 linhas)

### Arquitetura

Runner **tmux-based** para execução paralela em **múltiplos projetos**. Cada projeto com seu próprio `prd.json` roda em uma tmux session separada.

### Padrão de Execução

```bash
# Para cada projeto com prd.json
tmux new-session -d -s "ralph-$PROJECT_NAME" \
  "cd $PROJECT_DIR && ./ralph.sh $MAX_ITERATIONS"
```

### Auto-Detection

Escaneia subdiretórios procurando `prd.json`:

```bash
for dir in */; do
  if [ -f "$dir/prd.json" ]; then
    PROJECTS+=("$dir")
  fi
done
```

### Staggered Starts

Delay configurável entre starts para evitar rate limiting da API:

```bash
STAGGER_DELAY=5  # segundos entre launches

for project in "${PROJECTS[@]}"; do
  launch_project "$project"
  sleep $STAGGER_DELAY
done
```

### Max Workers

Limite de workers paralelos (default 10):

```bash
MAX_WORKERS=10

while [ ${#RUNNING[@]} -ge $MAX_WORKERS ]; do
  wait_for_any
done
```

### Filter/Exclude

Padrões para selecionar/excluir projetos:

```bash
# Apenas projetos que matcham pattern
--filter "api-*"

# Excluir projetos específicos
--exclude "legacy-*"
```

### Dry-Run

Preview de quais projetos seriam executados sem executar.

---

## 4. ralph-parallel.sh (428 linhas)

### Arquitetura

Execução paralela **dependency-aware** dentro de um único projeto. Diferente do swarm (multi-projeto), este é multi-story dentro do mesmo projeto.

### Dois Tipos de Stories

```json
{
  "userStories": [
    {
      "id": "US-001",
      "type": "script",  // Execução direta de comando
      "command": "node migrate.js"
    },
    {
      "id": "US-002",
      "type": "llm",     // Execução via Claude
      "description": "Implement user auth"
    }
  ]
}
```

- **"script"** — Executa comando diretamente (sem Claude)
- **"llm"** — Executa via `claude -p --dangerously-skip-permissions`

### Dependency-Aware Scheduling

```bash
# Checar dependências antes de launch
can_launch() {
  local story_id="$1"
  local deps=$(jq -r ".userStories[] | select(.id==\"$story_id\") | .depends_on[]?" prd.json)

  for dep in $deps; do
    if ! is_complete "$dep"; then
      return 1  # Dependência não completa
    fi
  done
  return 0  # Pode lançar
}
```

Lança stories sem dependências primeiro, depois as que foram desbloqueadas:

```
Wave 1: US-001 (schema), US-002 (config)     ← sem dependências
Wave 2: US-003 (backend), US-004 (middleware) ← dependem de wave 1
Wave 3: US-005 (UI), US-006 (tests)           ← dependem de wave 2
```

### PID Tracking com Race Condition Prevention

```bash
LAUNCHED_DIR=".ralph-launched"
mkdir -p "$LAUNCHED_DIR"

launch_story() {
  local story_id="$1"

  # Race condition prevention
  if [ -f "$LAUNCHED_DIR/$story_id" ]; then
    return  # Já lançado
  fi
  touch "$LAUNCHED_DIR/$story_id"

  # Launch
  run_story "$story_id" &
  echo $! > "$LAUNCHED_DIR/$story_id.pid"
}
```

### Runner Script Dinâmico

Gera um runner script por execução (não reutiliza entre runs):

```bash
RUNNER="/tmp/ralph-runner-$$.sh"
cat > "$RUNNER" << 'EOF'
#!/bin/bash
# Auto-generated runner for story $STORY_ID
claude -p --dangerously-skip-permissions "$PROMPT" > "$OUTPUT_FILE" 2>&1
echo $? > "$STATUS_FILE"
EOF
chmod +x "$RUNNER"
```

### Auto-Mark Based on Evidence

Marca stories como passadas baseado em existência de output files:

```bash
# Se output existe e tem conteúdo → passed
if [ -s "$OUTPUT_DIR/$STORY_ID.output" ]; then
  jq ".userStories[] | select(.id==\"$STORY_ID\") | .passes = true" prd.json > tmp && mv tmp prd.json
fi
```

### Score Extraction

Extrai scores de scoring reports para métricas de qualidade.

---

## Padrões Transversais (Todos os Scripts)

### 1. Invocação Claude Code

```bash
# Padrão universal em todos os 4 scripts
claude -p --dangerously-skip-permissions "$PROMPT"

# Com modelo específico (mmos.sh)
claude -p --model "$MODEL" --dangerously-skip-permissions "$PROMPT"
```

### 2. Completion Promise

```bash
# ralph.sh, ralph-parallel.sh
<promise>COMPLETE</promise>

# mmos.sh (por fase)
<promise>PHASE_COMPLETE</promise>
```

### 3. State Persistence

| Script | State File | Format |
|--------|-----------|--------|
| mmos.sh | `mmos-state.json` | JSON com jq |
| ralph.sh | `prd.json` + `progress.txt` | JSON + text |
| ralph-swarm.sh | Per-project `prd.json` | JSON |
| ralph-parallel.sh | `prd.json` + `.ralph-launched/` | JSON + files |

### 4. Evidence-Based Completion

Todos verificam **evidência real** (não apenas self-report):
- Output file existe?
- Testes passam?
- Arquivo esperado foi criado?

### 5. Safety Valves

| Mecanismo | Scripts |
|-----------|---------|
| Max iterations | Todos |
| Max workers | ralph-swarm.sh, ralph-parallel.sh |
| Staggered starts | ralph-swarm.sh |
| PID tracking | ralph-parallel.sh |
| Branch archiving | ralph.sh |
| State file locking | mmos.sh |

---

## O que Adotar para Bob (Epic 13)

### Adoção Imediata (Story 13.1)

| # | Padrão | De | Aplicação |
|---|--------|-----|-----------|
| 1 | `claude -p --dangerously-skip-permissions` | Todos | Base de execução |
| 2 | Prompt como argumento posicional | mmos.sh | Mais limpo que stdin pipe |
| 3 | `<promise>COMPLETE</promise>` grep | ralph.sh | Completion detection |
| 4 | Evidence-based check (files exist + tests pass) | ralph.sh | Quality gate |
| 5 | Max iterations safety | Todos | Default 3 |
| 6 | progress.txt append-only | ralph.sh | Iteration logging |

### Adoção Futura

| # | Padrão | De | Quando |
|---|--------|----|--------|
| 1 | Dependency-aware scheduling | ralph-parallel.sh | Multi-agent spawning |
| 2 | Staggered starts | ralph-swarm.sh | Rate limiting |
| 3 | A/B testing de modelos | mmos.sh | Otimização de custos |
| 4 | tmux-based swarm | ralph-swarm.sh | Multi-project |
| 5 | PID tracking robusto | ralph-parallel.sh | Substituir lock files |
| 6 | Script vs LLM story types | ralph-parallel.sh | Stories com script direto |

---

## Referências

- `/Users/alan/Code/mmos/squads/mmos/scripts/mmos.sh` — 1223 linhas
- `/Users/alan/Code/mmos/squads/ralph/scripts/ralph.sh` — 352 linhas
- `/Users/alan/Code/mmos/squads/ralph/scripts/ralph-swarm.sh` — 342 linhas
- `/Users/alan/Code/mmos/squads/ralph/scripts/ralph-parallel.sh` — 428 linhas

---

*Pesquisa realizada em 2026-02-05 por @pm (Bob)*
