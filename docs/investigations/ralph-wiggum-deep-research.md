# Ralph Wiggum — Deep Research Completo

**Documento de Investigação**
**Data:** 2026-02-05
**Autor:** @pm (Bob)
**Epic Reference:** Epic 13 (Story 13.1)
**Contexto:** Pesquisa para melhorar o Bob Execution Pipeline

---

## O que é Ralph Wiggum

Ralph é uma técnica de desenvolvimento autônomo com IA criada por **Geoffrey Huntley** (mid-2025). O nome é homenagem ao personagem Ralph Wiggum dos Simpsons — referência à combinação de ignorância, persistência e otimismo. Também referência a uma gíria dos anos 80 para vomitar, capturando a ideia de "produzir código incessantemente".

A técnica ganhou tração quando participantes da **Y Combinator** começaram a usá-la extensivamente, o que chamou a atenção da Anthropic, que criou um **plugin oficial Ralph Wiggum** para o Claude Code. Boris Cherny, criador do Claude Code, disse que ele próprio usa Ralph.

### Filosofia Central

- Não mire na perfeição na primeira tentativa — deixe o loop refinar o trabalho
- "Deterministicamente ruim" significa que falhas são previsíveis e informativas
- O sucesso depende de escrever bons prompts, não apenas de ter um bom modelo
- Continue tentando até ter sucesso — o loop cuida da lógica de retry

### Impacto Econômico Reportado

- 6 repositórios entregues em uma noite (Y Combinator hackathon)
- Contrato de $50k executado por $297 em custos de API
- Linguagem de programação "cursed" criada em 3 meses usando Ralph

---

## Duas Implementações Existentes

### 1. snarktank/ralph (Community — 9.550 stars)

**Repo:** https://github.com/snarktank/ralph
**Autor:** Ryan Carson (snarktank)
**Mecanismo:** Bash loop externo

#### Estrutura do Repositório

```
ralph/
├── .claude-plugin/
│   ├── marketplace.json      # Para discovery no marketplace
│   └── plugin.json           # Manifesto: name, version, description
├── skills/
│   ├── prd/
│   │   └── SKILL.md          # PRD generation skill
│   └── ralph/
│       └── SKILL.md          # PRD-to-JSON conversion skill
├── ralph.sh                  # Bash loop orchestrator
├── CLAUDE.md                 # Prompt template para Claude Code
├── prompt.md                 # Prompt template para Amp CLI
├── prd.json.example          # Task tracking structure
├── AGENTS.md                 # Accumulated learnings
├── flowchart/                # React Flow visualization
└── README.md
```

#### ralph.sh — O Loop (Completo)

```bash
#!/bin/bash
set -e

TOOL="amp"  # Default to amp
MAX_ITERATIONS=10

# Parse arguments (--tool amp|claude, number for max_iterations)
while [[ $# -gt 0 ]]; do
  case $1 in
    --tool) TOOL="$2"; shift 2 ;;
    --tool=*) TOOL="${1#*=}"; shift ;;
    *) [[ "$1" =~ ^[0-9]+$ ]] && MAX_ITERATIONS="$1"; shift ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRD_FILE="$SCRIPT_DIR/prd.json"
PROGRESS_FILE="$SCRIPT_DIR/progress.txt"

# Archive previous run if branch changed
# ... (branch detection + archive to archive/YYYY-MM-DD-feature-name/)

for i in $(seq 1 $MAX_ITERATIONS); do
  echo "Ralph Iteration $i of $MAX_ITERATIONS ($TOOL)"

  if [[ "$TOOL" == "amp" ]]; then
    OUTPUT=$(cat "$SCRIPT_DIR/prompt.md" | amp --dangerously-allow-all 2>&1 | tee /dev/stderr) || true
  else
    OUTPUT=$(claude --dangerously-skip-permissions --print < "$SCRIPT_DIR/CLAUDE.md" 2>&1 | tee /dev/stderr) || true
  fi

  if echo "$OUTPUT" | grep -q "<promise>COMPLETE</promise>"; then
    echo "Ralph completed all tasks!"
    exit 0
  fi

  sleep 2
done

echo "Ralph reached max iterations ($MAX_ITERATIONS)"
exit 1
```

**Pontos chave:**
- Suporta Amp CLI e Claude Code (`--tool amp|claude`)
- Pipe via stdin: `claude --print < CLAUDE.md`
- Completion: grep por `<promise>COMPLETE</promise>`
- Archive automático quando branch muda
- Sleep 2s entre iterações

#### CLAUDE.md — Prompt Template (Completo)

```markdown
# Ralph Agent Instructions

You are an autonomous coding agent working on a software project.

## Your Task

1. Read the PRD at `prd.json` (in the same directory as this file)
2. Read the progress log at `progress.txt` (check Codebase Patterns section first)
3. Check you're on the correct branch from PRD `branchName`
4. Pick the **highest priority** user story where `passes: false`
5. Implement that single user story
6. Run quality checks (typecheck, lint, test)
7. Update CLAUDE.md files if you discover reusable patterns
8. If checks pass, commit ALL changes: `feat: [Story ID] - [Story Title]`
9. Update the PRD to set `passes: true` for the completed story
10. Append your progress to `progress.txt`

## Progress Report Format

APPEND to progress.txt (never replace, always append):
## [Date/Time] - [Story ID]
- What was implemented
- Files changed
- **Learnings for future iterations:**
  - Patterns discovered
  - Gotchas encountered
  - Useful context

## Consolidate Patterns

Add reusable patterns to `## Codebase Patterns` section at TOP of progress.txt.

## Update AGENTS.md Files

Before committing, check if edited files have learnings worth preserving in
nearby AGENTS.md files (API patterns, gotchas, dependencies, testing approaches).

## Stop Condition

If ALL stories have `passes: true`, reply with:
<promise>COMPLETE</promise>

If stories remain with `passes: false`, end response normally.

## Important
- Work on ONE story per iteration
- Commit frequently
- Keep CI green
```

#### prd.json Structure

```json
{
  "project": "MyApp",
  "branchName": "ralph/task-priority",
  "description": "Task Priority System - Add priority levels to tasks",
  "userStories": [
    {
      "id": "US-001",
      "title": "Add priority field to database",
      "description": "As a developer, I need to store task priority.",
      "acceptanceCriteria": [
        "Add priority column: 'high' | 'medium' | 'low' (default 'medium')",
        "Generate and run migration successfully",
        "Typecheck passes"
      ],
      "priority": 1,
      "passes": false,
      "notes": ""
    }
  ]
}
```

#### Skills (2 Skills)

**Skill: /prd** — Gera PRDs interativamente
- Faz 3-5 perguntas clarificadoras com opções letradas (1A, 2C, 3B)
- Gera PRD com 9 seções: Intro, Goals, User Stories, Functional Requirements, Non-Goals, Design, Technical, Success Metrics, Open Questions
- Salva em `tasks/prd-[feature-name].md`
- Regra: UI stories DEVEM incluir "Verify in browser" nos acceptance criteria

**Skill: /ralph** — Converte PRDs para prd.json
- Regra #1: Cada story DEVE caber em UMA context window
- Sizing: "If you cannot describe the change in 2-3 sentences, it is too big"
- Ordering: Dependencies first (database → backend → UI)
- Sempre inclui "Typecheck passes" como critério
- Archiving automático de runs anteriores

#### Plugin Manifest

```json
// plugin.json
{
  "name": "ralph-skills",
  "version": "1.0.0",
  "description": "Skills for the Ralph autonomous agent system",
  "skills": "./skills/"
}

// marketplace.json
{
  "name": "ralph-marketplace",
  "plugins": [{
    "name": "ralph-skills",
    "source": "./",
    "category": "productivity",
    "skills": "./skills/"
  }]
}
```

#### Memória Entre Iterações (3+1 Camadas)

```
CAMADA 1: prd.json — Estado de tarefas (passes: true/false)
CAMADA 2: progress.txt — Append-only log + Codebase Patterns no topo
CAMADA 3: AGENTS.md / CLAUDE.md — Conhecimento por diretório
CAMADA 4: Git History — Commits estruturados como evidência
```

---

### 2. anthropics/claude-code/plugins/ralph-wiggum (Oficial)

**Repo:** https://github.com/anthropics/claude-code/tree/main/plugins/ralph-wiggum
**Autora:** Daisy Hollman (Anthropic)
**Mecanismo:** Stop Hook interno à sessão

#### Estrutura

```
plugins/ralph-wiggum/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── ralph-loop.md       # /ralph-loop command
│   ├── cancel-ralph.md     # /cancel-ralph command
│   └── help.md             # /help command
├── hooks/
│   ├── hooks.json          # Hook configuration
│   └── stop-hook.sh        # THE LOOP MECHANISM
└── scripts/
    └── setup-ralph-loop.sh # State file creation
```

#### O Stop Hook — Mecanismo Central (Completo)

```json
// hooks/hooks.json
{
  "description": "Ralph Wiggum plugin stop hook for self-referential loops",
  "hooks": {
    "Stop": [{
      "hooks": [{
        "type": "command",
        "command": "${CLAUDE_PLUGIN_ROOT}/hooks/stop-hook.sh"
      }]
    }]
  }
}
```

**stop-hook.sh — Fluxo completo:**

1. Lê hook input JSON de stdin (`$HOOK_INPUT`)
2. Checa se `.claude/ralph-loop.local.md` existe (state file)
3. Se não existe → `exit 0` (permite sair)
4. Parse YAML frontmatter do state file: `iteration`, `max_iterations`, `completion_promise`
5. Se max_iterations atingido → remove state file, `exit 0`
6. Lê transcript path de `$HOOK_INPUT`
7. Extrai última mensagem assistant do transcript (JSONL format)
8. Busca `<promise>TEXT</promise>` com Perl regex multiline
9. Se promise encontrada e matches → remove state file, `exit 0` (completo!)
10. Se NÃO completo → incrementa iteration, retorna JSON:

```json
{
  "decision": "block",
  "reason": "<o prompt original do state file>",
  "systemMessage": "🔄 Ralph iteration N | To stop: output <promise>TEXT</promise>"
}
```

**IMPORTANTE:** O hook NÃO usa exit code 2. Usa output JSON com `"decision": "block"`.

#### State File Pattern

```markdown
// .claude/ralph-loop.local.md
---
active: true
iteration: 1
max_iterations: 20
completion_promise: "DONE"
started_at: "2026-02-05T10:30:00Z"
---

Build a REST API for todos. Requirements: CRUD operations, input validation, tests.
```

O state file tem YAML frontmatter (metadata) + prompt no body (conteúdo após segundo `---`).

#### Completion Promise Detection (Perl Regex)

```bash
# Extrai texto de <promise> tags (multiline, non-greedy)
PROMISE_TEXT=$(echo "$LAST_OUTPUT" | perl -0777 -pe \
  's/.*?<promise>(.*?)<\/promise>.*/$1/s; s/^\s+|\s+$//g; s/\s+/ /g')

# Comparação LITERAL (não glob pattern!) para segurança
if [[ -n "$PROMISE_TEXT" ]] && [[ "$PROMISE_TEXT" = "$COMPLETION_PROMISE" ]]; then
  echo "✅ Ralph loop: Detected <promise>$COMPLETION_PROMISE</promise>"
  rm "$RALPH_STATE_FILE"
  exit 0
fi
```

Usa `=` (não `==`) para string comparison literal — evita glob matching que quebraria com `*`, `?`, `[`.

#### Command: /ralph-loop

```
Usage: /ralph-loop <PROMPT> [--max-iterations N] [--completion-promise TEXT]

Exemplo:
/ralph-loop "Refactor the cache layer" --max-iterations 20 --completion-promise "DONE"
```

O setup script:
1. Cria `.claude/ralph-loop.local.md` com frontmatter + prompt
2. Exibe warning: "This loop cannot be stopped manually!"
3. Exibe instrução de completion promise com formatting forte
4. Regra CRÍTICA: "Do NOT output false promises to escape the loop"

#### Command: /cancel-ralph

```
1. Checa se .claude/ralph-loop.local.md existe
2. Se existe → lê iteration number, remove arquivo
3. Reporta: "Cancelled Ralph loop (was at iteration N)"
```

#### Safety Mechanisms

- `--max-iterations` como safety valve principal
- State file validation (numeric fields check)
- Transcript path validation
- Empty output detection
- Corrupted state file cleanup automático
- Prompt: "Do NOT lie even if you think you should exit"

---

## Comparação: snarktank vs Anthropic Official

| Aspecto | snarktank/ralph | anthropics/ralph-wiggum |
|---------|-----------------|------------------------|
| Mecanismo | Bash `for` loop externo | Stop hook interno à sessão |
| Context | Fresh por iteração (nova invocação) | Mesma sessão, hook re-injeta |
| Invocação | `claude --print < CLAUDE.md` | `/ralph-loop "prompt"` |
| Skills | 2 skills (/prd, /ralph) | 3 commands (/ralph-loop, /cancel-ralph, /help) |
| Estado | `prd.json` + `progress.txt` | `.claude/ralph-loop.local.md` |
| Completion | `grep "<promise>COMPLETE</promise>"` | Perl regex no transcript |
| Cancel | Ctrl+C | `/cancel-ralph` |
| Memory | Git + progress.txt + AGENTS.md | Git + files (mesma sessão) |
| Distribuição | Copy ou plugin marketplace | Plugin oficial |
| Safety | Max iterations (default 10) | Max iterations + state validation |

---

## Referências

- [snarktank/ralph](https://github.com/snarktank/ralph) — Community implementation (9.5k stars)
- [anthropics/claude-code/plugins/ralph-wiggum](https://github.com/anthropics/claude-code/tree/main/plugins/ralph-wiggum) — Official Anthropic plugin
- [Geoffrey Huntley - Ralph](https://ghuntley.com/ralph/) — Original technique
- [paddo.dev - Ralph Wiggum: Autonomous Loops](https://paddo.dev/blog/ralph-wiggum-autonomous-loops/)
- [Awesome Claude - Ralph Wiggum](https://awesomeclaude.ai/ralph-wiggum)
- [Dev Genius - Ralph Wiggum explained](https://blog.devgenius.io/ralph-wiggum-explained-the-claude-code-loop-that-keeps-going-3250dcc30809)
- [Ralph Orchestrator](https://github.com/mikeyobrien/ralph-orchestrator)

---

*Pesquisa realizada em 2026-02-05 por @pm (Bob)*
*Consolidando: snarktank repo (todos os arquivos), Anthropic plugin (todos os arquivos), artigos e documentação*
