---
task: Ralph Status
responsavel: "@ralph"
responsavel_type: agent
atomic_layer: task
Entrada: []
Saida: |
  - Status one-liner no terminal
Checklist:
  - "[ ] Executar ralph-state.js para ler estado"
  - "[ ] Formatar status compacto"
  - "[ ] Exibir no terminal"
---

# *status

Status rápido via script (mínimo de tokens): iteração atual,
tarefa em andamento, % completo, próximos passos.

## Uso

```
*status
# → One-liner com estado atual
```

## Flow

```
1. Read state via script
   └── Execute ralph-state.js → parse ralph-state.yaml

2. Format compact status
   └── Single line with key metrics

3. Display
   └── One-liner output
```

## Output Format

```
🔄 Ralph [running] iter:5 | task:"Add auth middleware" | 8/12 (67%) | @dev | 30min elapsed
```

Or if no session:
```
🔄 Ralph [idle] No active session. Use *develop to start.
```

## Related

- **Agent:** @ralph
- **Scripts:** ralph-state.js
