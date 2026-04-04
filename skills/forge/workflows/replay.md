# Workflow: Replay

> Refazer um run anterior com ajustes. Como um save game — volta pro checkpoint sem perder progresso.

---

## When to Use

- Usuário quer mudar uma decisão técnica de um run anterior
- Quer re-executar com stories diferentes
- Quer continuar de uma fase específica com mudanças
- Quer "e se eu tivesse escolhido X em vez de Y?"

---

## Pipeline

```
LOAD_PREVIOUS → SHOW_DECISIONS → ASK_CHANGES → CREATE_NEW_RUN → EXECUTE_FROM_PHASE
```

---

## Execution

### Phase R-1: Load Previous Run

1. Parse the command: `/forge replay {run_id} [--from phase:{N}]`
2. Read `.aios/forge-runs/{run_id}/state.json`
3. Validate:
   - File exists and is valid JSON
   - `status == "completed"` (can only replay completed runs)
   - If `--from phase:{N}` specified: validate N is a valid phase for this mode

If run not found:
```
Run "{run_id}" não encontrado. Runs disponíveis:
{list of completed runs with dates and descriptions}
```

### Phase R-2: Show Decisions Summary

Present all decisions from the previous run:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔄 REPLAY — Revendo run anterior
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Run: {run_id}
  Modo: {mode}
  Data: {started_at} → {completed_at}
  Status: {completed/interrupted}

  ━━━ Decisões Técnicas ━━━
  Framework: {tech} (decidido por: {forge/user})
  Database: {tech} (decidido por: {forge/user})
  ORM: {tech} (decidido por: {forge/user})
  ...

  ━━━ Stories ({N} total, {M} MVP) ━━━
  1. {story 1.1 title} — {status}
  2. {story 1.2 title} — {status}
  ...

  ━━━ Erros Encontrados ━━━
  {error count} erros ({resolved count} resolvidos)
  {top error types}

  ━━━ Quality Gates ━━━
  {gate results summary}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Phase R-3: Ask What to Change

```
O que quer mudar nesse replay?

> 1. **Stack/tecnologia** — mudar alguma decisão técnica
> 2. **Stories** — adicionar, remover ou reordenar stories
> 3. **Escopo MVP** — mudar o que é MVP vs post-MVP
> 4. **Nada, só re-executar** — rodar de novo do ponto indicado
> 5. Digitar outra coisa.
```

**Opção 1 (Stack):**
Show current tech_decisions and let user change individual ones.
Save changes to `replay.changes_applied[]`.

**Opção 2 (Stories):**
Show story list with add/remove/reorder options.
Save changes to `replay.changes_applied[]`.

**Opção 3 (MVP):**
Show current MVP/post-MVP split and let user reassign.
Save changes to `replay.changes_applied[]`.

**Opção 4 (Nada):**
Proceed with original decisions.

### Phase R-4: Create New Run

1. Generate new run_id: `{original_run_id}-replay`
2. Create new run directory: `.aios/forge-runs/{new_run_id}/`
3. Copy state.json from original run
4. Apply user's changes to the copied state
5. Set `from_phase` to `--from` value (or Phase 0 if not specified)
6. Write `replay` metadata to state.json:
   ```json
   "replay": {
     "source_run_id": "{original}",
     "from_phase": 3,
     "changes_applied": [...]
   }
   ```

### Phase R-5: Execute From Phase

1. Set `current_phase` to `from_phase`
2. Mark all phases before `from_phase` as "completed" (inherited from original)
3. Execute from `from_phase` onward using normal runner.md state machine
4. All plugins fire normally
5. The run proceeds exactly like a normal Forge run from this point

---

## Agent Mapping

| Phase | Agent | Note |
|-------|-------|------|
| R-1 to R-4 | Forge (self) | Load, display, ask, prepare |
| R-5 onward | Standard agents | Normal SDC as per the mode's workflow |

---

## Progress Display

```
  ✅ R-1: Run anterior carregado ({run_id})
  ✅ R-2: Decisões exibidas
  ✅ R-3: Mudanças definidas ({N} alterações)
  ✅ R-4: Novo run criado ({new_run_id})
  🔄 R-5: Executando a partir de Phase {N}...
    ├── Phase {N}: ▶ {phase_name}
    └── ...
```

---

## Quest Integration

| Quest World | Forge Phase | XP |
|-------------|------------|-----|
| Same as original mode | R-5 onward | Normal XP |

Replay gera XP a partir de R-5 (execução real). As fases R-1 a R-4 (load/review/prepare) não geram XP.
O quest-sync plugin identifica replays via `state.json.replay.source_run_id`.

---

## Quality Gates

Same as the original mode's workflow — replay inherits all quality gates.

---

## Error Recovery

- If original run's state.json is corrupted: offer to start fresh instead
- If `--from phase:{N}` is invalid for the mode: show valid phases and ask again
- If replay run fails: standard error recovery applies (it's a normal run from Phase R-5)
