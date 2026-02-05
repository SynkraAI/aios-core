---
task: Ralph Resume
responsavel: "@ralph"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - ralph-state.yaml (automático, lê do diretório do projeto)
Saida: |
  - Loop retomado do ponto de interrupção
Checklist:
  - "[ ] Verificar existência de ralph-state.yaml"
  - "[ ] Carregar estado salvo"
  - "[ ] Carregar progress.md (learnings)"
  - "[ ] Validar source file ainda existe"
  - "[ ] Retomar loop do ponto exato"
---

# *resume

Retoma execução interrompida. Lê ralph-state.yaml para saber
exatamente onde parou, carrega progress.md para learnings,
e continua o loop do ponto exato.

## Uso

```
*resume
# → Retoma a última sessão interrompida
```

## Flow

```
1. Load saved state
   ├── Read ralph-state.yaml
   ├── Validate status == running|paused
   └── If no state → error "No session to resume"

2. Load context
   ├── Read progress.md (accumulated learnings)
   ├── Read source file (story/PRD with checkboxes)
   └── Verify task queue integrity

3. Display resume info
   ├── "Resuming session {id}"
   ├── "Iteration: {n}, Task: {current}"
   ├── "Progress: {completed}/{total}"
   └── "Learnings loaded: {count}"

4. Continue loop
   └── Jump to step 4 of ralph-develop (LOOP)
       with restored state and learnings
```

## State Recovery

Ralph resume recovers:
- **Exact task position** → which task was in progress
- **All learnings** → from progress.md
- **Decision history** → from decision-log.md
- **Configuration** → from ralph-config.yaml
- **Checkbox state** → from story/PRD file

## Error Handling

| Error | Action |
|-------|--------|
| No ralph-state.yaml | "No session to resume. Use *develop to start." |
| State is completed | "Session already completed. Use *develop for new session." |
| Source file missing | "Source file not found. Please verify path." |
| Corrupted state | "State file corrupted. Starting fresh from source." |

## Related

- **Agent:** @ralph
- **Develop:** ralph-develop.md
- **Scripts:** ralph-state.js
