# Agent Quick Reference

## Matriz Completa de Agents

| Agent | Persona | Ativação | Especialidade | Comandos-chave |
|-------|---------|----------|---------------|----------------|
| `@dev` | Dex (Builder) | `/AIOS:agents:dev` | Código, testes, git local | `*develop`, `*run-tests`, `*track-attempt`, `*rollback` |
| `@qa` | Quinn (Guardian) | `/AIOS:agents:qa` | Quality gates, review | `*review`, `*gate`, `*qa-loop`, `*escalate-qa-loop` |
| `@architect` | Aria (Visionary) | `/AIOS:agents:architect` | Arquitetura, tech decisions | `*design-system`, `*assess-complexity`, `*plan-implementation` |
| `@pm` | Morgan (Strategist) | `/AIOS:agents:pm` | PRDs, epics, specs | `*create-prd`, `*create-epic`, `*execute-epic`, `*gather-requirements`, `*write-spec` |
| `@po` | Pax (Balancer) | `/AIOS:agents:po` | Validação stories, backlog | `*validate-story-draft`, `*prioritize-backlog` |
| `@sm` | River (Facilitator) | `/AIOS:agents:sm` | Criar stories, sprints | `*draft`, `*create-story`, `*create-next-story` |
| `@analyst` | Atlas (Decoder) | `/AIOS:agents:analyst` | Pesquisa, análise, ROI | `*research`, `*brainstorm`, `*calculate-roi` |
| `@data-engineer` | Dara (Specialist) | `/AIOS:agents:data-engineer` | Schema, migrations, RLS | `*design-schema`, `*create-migration`, `*audit-db` |
| `@ux-design-expert` | Uma (Designer) | `/AIOS:agents:ux-design-expert` | UI/UX, wireframes | `*design-ui`, `*create-wireframe`, `*audit-accessibility` |
| `@devops` | Gage (Operator) | `/AIOS:agents:devops` | Push, PRs, CI/CD, MCP | `*pre-push`, `*push`, `*create-pr`, `*add-mcp`, `*remove-mcp` |
| `@aiox-master` | Orion (Orchestrator) | `/AIOS:agents:aios-master` | Governança, escalation | `*diagnose`, `*enforce-constitution`, `*mediate` |

## Exclusive Authority Matrix

```
┌─────────────────────────────────────────────────────────┐
│ OPERAÇÃO              │ EXCLUSIVO │ OUTROS = BLOCK      │
├───────────────────────┼───────────┼─────────────────────┤
│ git push / PRs        │ @devops   │ Delegar sempre      │
│ MCP management        │ @devops   │ Delegar sempre      │
│ Releases / Tags       │ @devops   │ Delegar sempre      │
│ Story validation      │ @po       │ Delegar sempre      │
│ Story creation        │ @sm       │ Delegar sempre      │
│ Epic orchestration    │ @pm       │ Delegar sempre      │
│ Architecture decides  │ @architect│ Consultar primeiro   │
│ Schema design         │ @data-eng │ Delegado de @arch   │
│ Framework governance  │ @aiox-mstr│ Escalar se preciso  │
└─────────────────────────────────────────────────────────┘
```

## Cross-Agent Flows

### Story Flow (mais comum)
```
@sm *draft → @po *validate → @dev *develop → @qa *gate → @devops *push
```

### Epic Flow
```
@pm *create-epic → @pm *execute-epic → @sm *draft (por story) → SDC
```

### Schema Flow
```
@architect (decide tecnologia) → @data-engineer (implementa DDL)
```

### Git Push Flow
```
QUALQUER agent → delega para @devops *push
```

### Escalation Flow
```
Agent bloqueado → @aiox-master media → resolve → retorna ao agent
```
