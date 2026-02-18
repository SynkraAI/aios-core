---
name: progress-visualizer
description: This skill should be used when the user asks to see progress, status, or roadmap of current work. Triggers on requests like "show progress", "where are we", "roadmap", "status visual", "how is it going", or any request for a visual overview of task completion. Renders rich ASCII art visualizations including roadmaps, dashboards, journey maps, and progress bars based on the current TaskList.
---

# Progress Visualizer

## Overview

Render rich ASCII art visualizations of the current session's task progress. Read the active TaskList and transform it into expressive visual representations that instantly communicate where things stand, what's done, what's in progress, and what's ahead.

## CRITICAL EXECUTION RULES

**NEVER use the Task tool to execute this skill.** All output MUST be rendered directly as text in the main conversation. Using Task/subagent will cause the output to be collapsed and hidden from the user, defeating the entire purpose of the visualization.

**NEVER delegate this to any subagent.** Execute everything inline.

## Activation

When this skill is triggered, immediately:

1. Call `TaskList` to retrieve all current tasks
2. For any task needing detail, call `TaskGet` to retrieve full info (status, blockedBy, blocks, description)
3. Analyze task states: `completed`, `in_progress`, `pending`, blocked tasks
4. Select the best visualization style based on context (or use user's preference)
5. **Render the visualization directly as text output in the main conversation (NEVER via Task tool)**

## Visualization Styles

Select the most appropriate style based on the number of tasks, their relationships, and complexity. When in doubt, use the **Dashboard Completo** as default. Always adapt the width and detail level to the actual data.

---

### Style 1: Roadmap Horizontal

Best for: Linear workflows with clear sequential phases (3-8 tasks).

```
  ROADMAP DE PROGRESSO
  ====================

  [######]----[######]----[  >>  ]----[      ]----[      ]
   Setup      Database     API        Frontend     Deploy
     OK          OK       IN PROG     Pending     Pending

  <=== DONE ===><=== NOW ===>|<======= AHEAD ========>

  Progresso geral: [████████████░░░░░░░░] 40%  (2/5)
```

Key rendering rules:
- `[######]` = completed (filled)
- `[  >>  ]` = in progress (animated arrows)
- `[      ]` = pending (empty)
- `[BLOCKED]` = blocked (labeled)
- Connection lines `----` between phases
- Zone labels below: DONE | NOW | AHEAD
- Summary progress bar at the bottom

---

### Style 2: Dashboard Completo

Best for: Complex projects with many tasks, mixed statuses, or when a comprehensive overview is needed (default choice).

```
╔══════════════════════════════════════════════════════════════╗
║                   PROGRESS DASHBOARD                        ║
║                   2026-02-07 15:30                          ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  RESUMO GERAL                                                ║
║  ┌─────────────────────────────────────────────────┐         ║
║  │ Progresso: [████████████████░░░░░░░░] 65%       │         ║
║  │ Tasks:     8 total | 5 done | 1 active | 2 todo │         ║
║  └─────────────────────────────────────────────────┘         ║
║                                                              ║
║  STATUS POR TASK                                             ║
║  ┌────┬────────────────────────────────┬───────────┐         ║
║  │ ## │ Task                           │  Status   │         ║
║  ├────┼────────────────────────────────┼───────────┤         ║
║  │  1 │ Setup project structure        │  DONE     │         ║
║  │  2 │ Configure database             │  DONE     │         ║
║  │  3 │ Build API endpoints            │  DONE     │         ║
║  │  4 │ Add authentication             │  DONE     │         ║
║  │  5 │ Write unit tests               │  DONE     │         ║
║  │  6 │ Implement frontend pages       │ >> ACTIVE │         ║
║  │  7 │ Integration tests              │  PENDING  │         ║
║  │  8 │ Deploy to staging              │  PENDING  │         ║
║  └────┴────────────────────────────────┴───────────┘         ║
║                                                              ║
║  LEGENDA: DONE | >> ACTIVE | PENDING | !! BLOCKED            ║
╚══════════════════════════════════════════════════════════════╝
```

Key rendering rules:
- Double-line box frame `╔╗╚╝║═` for the outer shell
- Single-line box `┌┐└┘│─` for inner sections
- Include current date/time in header
- Summary section with progress bar and counts
- Table with all tasks, numbered, with status
- If blocked tasks exist, add a `BLOCKED TASKS` section showing what blocks them
- Status icons: `DONE`, `>> ACTIVE`, `PENDING`, `!! BLOCKED`

---

### Style 3: Mapa de Jornada (Quest Map)

Best for: When the user wants something fun and motivational, or for longer journeys (5+ tasks).

```
  ============================================
       QUEST MAP - Jornada de Progresso
  ============================================

       [Inicio]
          |
     .----*----.     "Setup project"
     | COMPLETE |
     '----*----'
          |
          |
     .----*----.     "Build API"
     | COMPLETE |
     '----*----'
          |
          |
     .----*----.     "Write tests"
     |>> HERE <<|    <-- Voce esta aqui!
     '----*----'
          |
          :  (caminho a frente)
          :
     .----*----.     "Deploy"
     |   ????   |
     '----*----'
          |
       [Destino]

  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   Progresso: ████████████░░░░░░░░ 60%
   Jornada: 3 de 5 checkpoints alcancados
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
```

Key rendering rules:
- Vertical path with node boxes
- `COMPLETE` for done tasks
- `>> HERE <<` marker with arrow for current task
- `????` for future tasks
- Dotted line `:` for the path ahead vs solid `|` for completed path
- Bottom summary with progress bar
- Use thematic language (quest, jornada, checkpoints)

---

### Style 4: Kanban Board

Best for: When there are tasks in multiple status categories and a column view adds clarity.

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│    DONE (3)     │  IN PROGRESS(1) │   PENDING (2)   │  BLOCKED (1)    │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│                 │                 │                 │                 │
│  [x] Setup     │  [>] Frontend   │  [ ] Int. tests │  [!] Deploy     │
│  [x] Database  │                 │  [ ] Docs       │    blocked by:  │
│  [x] API       │                 │                 │    "Int. tests" │
│                 │                 │                 │                 │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘

  Progresso: [████████████░░░░] 43%  (3/7 tasks)
```

Key rendering rules:
- Four columns: DONE | IN PROGRESS | PENDING | BLOCKED
- Column count in header
- Task markers: `[x]` done, `[>]` active, `[ ]` pending, `[!]` blocked
- Blocked column shows dependency info
- Omit empty columns to save space
- Progress bar at bottom

---

### Style 5: Burndown Spark

Best for: Quick, minimal status check. Use when there are few tasks or user wants a fast glance.

```
  STATUS RAPIDO
  ─────────────
  Done:       ████████████████ 4
  In Progress: ████             1
  Pending:     ████████         2
  Blocked:     ██               1
                               ──
                          Total: 8

  [████████████████████░░░░░░░░░░] 50%
   ^^^^ onde estamos         onde vamos ^^^^
```

---

## CRITICAL: Anti-Collapse Rule

Claude Code's terminal automatically collapses long text output (showing "+N lines" with a truncated view). To prevent this, you MUST split the visualization into **multiple short text blocks** instead of one large block.

**Rules:**
1. **NEVER output the entire visualization as a single block of text.** It will get collapsed and the user won't see it.
2. **Split into 2-4 separate output chunks**, each under 20 lines. Output each chunk as its own paragraph/message section.
3. **Suggested split points:**
   - Chunk 1: Header + Summary (progress bar, counts)
   - Chunk 2: Task table / task list (first half if many tasks)
   - Chunk 3: Task table continued (if needed)
   - Chunk 4: Legend + footer
4. **Do NOT use a single fenced code block** for the whole visualization. Use separate code blocks for each chunk.
5. Between chunks, add a blank line so they render as independent blocks.

**Example of correct splitting:**

First output the header:
```
╔══════════════════════════════════════════════════╗
║              PROGRESS DASHBOARD                  ║
║              2026-02-07 15:30                    ║
╠══════════════════════════════════════════════════╣
║  Progresso: [████████████░░░░] 65%               ║
║  Tasks:     8 total | 5 done | 1 active | 2 todo ║
╚══════════════════════════════════════════════════╝
```

Then output the task table:
```
  STATUS POR TASK
  ┌────┬──────────────────────────┬───────────┐
  │  1 │ Setup project            │  DONE     │
  │  2 │ Build API                │  DONE     │
  │  3 │ Frontend pages           │ >> ACTIVE │
  │  4 │ Deploy                   │  PENDING  │
  └────┴──────────────────────────┴───────────┘
```

Then output the legend:
```
  LEGENDA: DONE | >> ACTIVE | PENDING | !! BLOCKED
```

---

## Rendering Guidelines

### General Rules

1. **Always call TaskList first** - Never render from memory or assumptions
2. **Adapt width** to the longest task name - avoid truncation when possible
3. **Use UTF-8 box drawing characters** - They render correctly in modern terminals
4. **Include a progress bar** in every style - it's the universal metric
5. **Show the date** when using Dashboard style
6. **Blocked tasks deserve special attention** - Always show what blocks them

### Progress Bar Formula

```
completed_count = tasks with status "completed"
total_count = all tasks
percentage = (completed_count / total_count) * 100

Bar: [████░░░░░░] XX%
     filled = round(percentage / 5)  (for 20-char bar)
     empty  = 20 - filled
```

### Style Selection Heuristic

| Condition | Recommended Style |
|-----------|-------------------|
| 1-3 tasks, quick check | Burndown Spark |
| 3-8 tasks, linear flow | Roadmap Horizontal |
| 5+ tasks, motivational | Mapa de Jornada |
| Mixed statuses, blocked tasks | Kanban Board |
| Complex project, many tasks | Dashboard Completo |
| User says "dashboard" | Dashboard Completo |
| User says "roadmap" | Roadmap Horizontal |
| User says "quest" / "jornada" | Mapa de Jornada |
| User says "kanban" | Kanban Board |
| Default / unclear | Dashboard Completo |

### Color-Free Design

All visualizations are purely ASCII/UTF-8 text. Differentiation comes from:
- Character weight: `█` (heavy) vs `░` (light) vs ` ` (empty)
- Status labels: `DONE`, `>> ACTIVE`, `PENDING`, `!! BLOCKED`
- Box styles: double-line `═` for outer, single-line `─` for inner
- Markers: `[x]`, `[>]`, `[ ]`, `[!]`

### Empty State

When TaskList returns no tasks:

```
  ┌─────────────────────────────────┐
  │  Nenhuma task encontrada.       │
  │  Crie tasks para visualizar o   │
  │  progresso da sua sessao.       │
  └─────────────────────────────────┘
```

### Language

Render titles and labels in Portuguese (pt-BR) by default. Task names remain as-is (they come from the TaskList in whatever language they were created).
