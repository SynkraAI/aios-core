---
task: Ralph Report
responsavel: "@ralph"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - --verbose: Inclui detalhes de cada iteração (opcional)
Saida: |
  - Relatório formatado no terminal
Checklist:
  - "[ ] Ler ralph-state.yaml"
  - "[ ] Ler progress.md"
  - "[ ] Calcular métricas"
  - "[ ] Formatar e exibir relatório"
---

# *report

Gera relatório detalhado do progresso: tarefas concluídas vs pendentes,
erros encontrados, learnings acumulados, métricas de execução,
decisões tomadas.

## Uso

```
*report
# → Relatório resumido

*report --verbose
# → Relatório detalhado com cada iteração
```

## Flow

```
1. Load state
   ├── Read ralph-state.yaml (current session)
   └── Read progress.md (accumulated data)

2. Calculate metrics
   ├── Tasks: completed / total (% complete)
   ├── Iterations: count, avg time per iteration
   ├── Errors: count, types, resolutions
   ├── Agents used: frequency per agent type
   └── Time: elapsed, estimated remaining

3. Format report
   ├── Summary section (always shown)
   ├── Task breakdown (always shown)
   ├── Learnings summary (always shown)
   ├── Error summary (if any)
   └── Iteration details (--verbose only)

4. Display
   └── Formatted terminal output
```

## Output Format

```
📊 Ralph Progress Report
═══════════════════════

📋 Session: ralph-1738720000
📄 Source: docs/stories/story-2.1.md
⏱️  Started: 2025-02-05 10:00 | Elapsed: 30min

Progress: ████████░░ 8/12 tasks (67%)

✅ Completed (8):
  1. [x] Setup project structure (@dev)
  2. [x] Configure database (@data-engineer)
  ...

⏳ Pending (4):
  9. [ ] Add unit tests
  10. [ ] Setup CI/CD
  ...

❌ Errors (1):
  - Task 5: Timeout on API integration (retried, resolved)

💡 Key Learnings:
  - Project uses monorepo structure
  - Database requires migration script
  ...

📈 Agents Used:
  @dev: 5 tasks | @qa: 2 tasks | @data-engineer: 1 task
```

## Related

- **Agent:** @ralph
- **Develop:** ralph-develop.md
- **Scripts:** ralph-state.js, ralph-progress.js
