---
task: Ralph Config
responsavel: "@ralph"
responsavel_type: agent
atomic_layer: task
elicit: true
Entrada: |
  - key: Chave de configuração (opcional, lista todas se omitido)
  - value: Valor a configurar (opcional)
Saida: |
  - ralph-config.yaml atualizado
Checklist:
  - "[ ] Ler ralph-config.yaml existente (ou criar default)"
  - "[ ] Se key+value: atualizar configuração"
  - "[ ] Se só key: mostrar valor atual"
  - "[ ] Se nenhum: listar todas configurações"
  - "[ ] Salvar ralph-config.yaml"
---

# *config

Configurações do loop Ralph. Persiste em ralph-config.yaml.

## Uso

```
*config
# → Lista todas as configurações

*config max_iterations
# → Mostra valor atual de max_iterations

*config max_iterations 50
# → Define max_iterations = 50

*config auto_commit true
# → Habilita auto-commit
```

## Configurações Disponíveis

| Key | Default | Description |
|-----|---------|-------------|
| `max_iterations` | 100 | Máximo de iterações antes de parar |
| `auto_commit` | true | Commit automático após cada tarefa |
| `mode` | yolo | Modo default: yolo ou interactive |
| `context_limit` | 80000 | Tokens antes de trigger auto-reset |
| `allowed_agents` | all | Agentes permitidos (all ou lista) |
| `retry_on_failure` | true | Retry automático em caso de falha |
| `max_retries` | 2 | Máximo de retries por tarefa |
| `commit_prefix` | "ralph:" | Prefixo para commits automáticos |

## Default Config File

```yaml
# ralph-config.yaml
max_iterations: 100
auto_commit: true
mode: yolo
context_limit: 80000
allowed_agents: all
retry_on_failure: true
max_retries: 2
commit_prefix: "ralph:"
```

## Flow

```
1. Load config
   ├── If ralph-config.yaml exists → load
   └── If not → create with defaults

2. Process command
   ├── No args → display all configs
   ├── Key only → display specific value
   └── Key + value → update and save

3. Save
   └── Write ralph-config.yaml
```

## Related

- **Agent:** @ralph
- **Scripts:** ralph-state.js
