---
task: Ralph Develop Loop
responsavel: "@ralph"
responsavel_type: agent
atomic_layer: task
elicit: true
Entrada: |
  - story_id ou prd_path: Fonte de tarefas (obrigatório)
  - mode: yolo|interactive (default: yolo)
Saida: |
  - Story/PRD com todas tarefas [x]
  - progress.md atualizado
  - decision-log.md gerado
  - Commits git por tarefa
Checklist:
  - "[ ] Validar source (story/PRD existe e tem tarefas)"
  - "[ ] Inicializar ralph-state.yaml"
  - "[ ] Inicializar progress.md"
  - "[ ] Loop: identificar próxima tarefa [ ]"
  - "[ ] Loop: selecionar agente AIOS adequado"
  - "[ ] Loop: delegar via Task tool (contexto fresco)"
  - "[ ] Loop: verificar resultado e atualizar checkboxes"
  - "[ ] Loop: registrar learnings no progress.md"
  - "[ ] Loop: verificar contexto (auto-reset se necessário)"
  - "[ ] Relatório final de execução"
---

# *develop

Loop autônomo principal do Ralph. Lê story/PRD, identifica tarefas pendentes,
delega para agentes especializados via Task tool (contexto fresco),
tracked progresso em arquivos, auto-reset quando contexto pesado.

## Uso

```
*develop story-2.1
# → Executa story 2.1 em modo yolo (autônomo total)

*develop story-2.1 interactive
# → Pede confirmação antes de cada tarefa

*develop docs/prd/feature-x.md
# → Executa PRD completo

*develop docs/prd/feature-x.md yolo
# → PRD em modo autônomo
```

## Elicitação

```
? Source (story ID ou caminho do PRD): ___
? Mode:
  > yolo (autônomo total, sem interrupções)
    interactive (confirma antes de cada tarefa)
```

## Flow

```
1. Parse source
   ├── If story ID → load from docs/stories/
   └── If path → load PRD file

2. Extract tasks
   ├── Find all [ ] unchecked items
   ├── Count total vs completed
   └── Build task queue

3. Initialize state
   ├── Create/update ralph-state.yaml
   ├── Create/update progress.md
   └── Set iteration = 0

4. LOOP (while tasks remain)
   │
   ├── 4.1 Get next task [ ]
   │   └── Use ralph-parser.js for extraction
   │
   ├── 4.2 Analyze task type
   │   └── Classify: code|test|architecture|story|data|ui|research|deploy
   │
   ├── 4.3 Select AIOS agent
   │   ├── code → @dev
   │   ├── test → @qa
   │   ├── architecture → @architect
   │   ├── story → @pm/@sm
   │   ├── data → @data-engineer
   │   ├── ui → @ux-design-expert
   │   ├── research → @analyst
   │   ├── deploy → @devops
   │   └── unknown → @dev (fallback)
   │
   ├── 4.4 Build subagent prompt
   │   ├── Task description
   │   ├── Relevant learnings from progress.md
   │   ├── AIOS agent instructions (skill activation)
   │   └── Project context (source-tree, tech-stack)
   │
   ├── 4.5 Delegate via Task tool
   │   └── subagent_type: general-purpose
   │   └── Context: FRESH (zero previous history)
   │
   ├── 4.6 Process result
   │   ├── If success → mark [x] in story/PRD
   │   ├── If failure → log error, retry or skip
   │   └── Update progress.md with learnings
   │
   ├── 4.7 Auto-commit (if configured)
   │   └── git add + commit with task reference
   │
   ├── 4.8 Check context health
   │   ├── Use ralph-context-monitor.js
   │   ├── If context OK → continue loop
   │   └── If context heavy → save state, instruct *resume
   │
   └── 4.9 Increment iteration
       └── Update ralph-state.yaml

5. Completion
   ├── Generate final report
   ├── Update ralph-state.yaml (status: completed)
   └── Display summary
```

## State Files

### ralph-state.yaml
```yaml
session_id: "ralph-{timestamp}"
source: "docs/stories/story-2.1.md"
mode: yolo
status: running  # running|paused|completed|failed
current_iteration: 5
current_task: "Implement user authentication"
tasks_total: 12
tasks_completed: 4
tasks_failed: 0
started_at: "2025-02-05T10:00:00Z"
last_updated: "2025-02-05T10:30:00Z"
```

### progress.md
```markdown
# Ralph Progress - story-2.1

## Iteration 1
- Task: Setup project structure
- Agent: @dev
- Result: SUCCESS
- Learning: Project uses monorepo structure

## Iteration 2
...
```

## Error Handling

| Error | Action |
|-------|--------|
| Source not found | Prompt user for correct path |
| Task parsing fails | Try alternative parsing strategy |
| Subagent fails | Log error, retry once, then mark as failed and continue |
| Context heavy | Save state, instruct *resume |
| All tasks done | Generate final report |

## Related

- **Agent:** @ralph
- **Resume:** ralph-resume.md
- **Report:** ralph-report.md
- **Scripts:** ralph-parser.js, ralph-state.js, ralph-progress.js, ralph-context-monitor.js
