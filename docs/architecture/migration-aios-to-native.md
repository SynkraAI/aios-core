# Migração AIOS → Claude Code Nativo

**Status**: Phase 1 Complete (Agents Migrados)
**Data**: 2026-02-07

## Resumo Executivo

Esta migração move a orquestração de agents do código JavaScript customizado para o sistema nativo de agents do Claude Code. Resultado: **~91% redução em código de orquestração**.

| Métrica | Antes | Depois | Redução |
|---------|-------|--------|---------|
| Linhas de código orquestratório | ~12.600 | ~1.130 | 91% |
| Arquivos JavaScript | 50+ | ~5 | 90% |
| Dependências | yaml, chalk, inquirer, etc. | 0 | 100% |
| Tempo de ativação | ~200ms target | <50ms | 75%+ |

## Arquitetura Híbrida

### Camada 1: Claude Code Nativo (Zero JavaScript)

```
.claude/
├── agents/           # 12 agents core migrados
│   ├── dev.md        # Dex - Full Stack Developer
│   ├── qa.md         # Quinn - Test Architect
│   ├── pm.md         # Bob - Product Manager
│   ├── sm.md         # River - Scrum Master
│   ├── po.md         # Pax - Product Owner
│   ├── architect.md  # Aria - System Architect
│   ├── devops.md     # Gage - DevOps
│   ├── analyst.md    # Alex - Research Analyst
│   ├── data-engineer.md    # Dara - Data Engineer
│   ├── ux-design-expert.md # Uma - UX Designer
│   ├── aios-master.md      # Orion - Meta-Orchestrator
│   └── squad-creator.md    # Squad Creator
├── skills/           # Workflows como Skills
└── agent-memory/     # Persistência por agent
```

### Camada 2: Scripts Mínimos (Mantidos)

```
.aios-core/
├── scripts/
│   ├── build-loop.sh     # Checkpoint/resume (~50 linhas)
│   ├── health-check.sh   # Checks críticos (~100 linhas)
│   └── worktree.sh       # Git worktree (~80 linhas)
└── state/
    ├── build-state.json  # State de builds
    ├── gotchas.json      # Gotchas capturados
    └── session.json      # Session cross-terminal
```

### Camada 3: Módulos JavaScript (Críticos - Mantidos)

```
.aios-core/core/
├── build/
│   └── state-manager.js  # ~200 linhas
├── health/
│   └── engine.js         # ~150 linhas
└── git/
    └── worktree.js       # ~200 linhas
```

## Breaking Changes

### 1. Ativação de Agents

**Antes**:
```
@dev ← Ativa via comando AIOS
```

**Depois**:
```
Use Task tool com subagent_type: dev
```

Ou via skill:
```
/AIOS:agents:dev
```

### 2. Sistema de Greeting Eliminado

**Eliminado completamente**:
- `greeting-builder.js` (1422 linhas)
- `unified-activation-pipeline.js` (462 linhas)
- `greeting-preference-manager.js` (169 linhas)
- `generate-greeting.js` (~200 linhas)

**Substituição**: Agents se apresentam naturalmente seguindo instruções no markdown.

### 3. Comandos com * Prefix

**Antes**:
```
*develop story-1.2.3
*run-tests
*apply-qa-fixes
```

**Depois**:
```
# Via linguagem natural
"develop story 1.2.3"
"run tests"
"apply qa fixes"
```

Ou via skills:
```
/develop-story story-1.2.3
```

### 4. Permission Modes

**Antes**: `*yolo` para ciclar entre ask/auto/explore

**Depois**: Configurado no frontmatter do agent:
```yaml
permissionMode: bypassPermissions  # auto
permissionMode: default            # ask
permissionMode: plan               # explore
```

### 5. Context Loading

**Antes**: `ProjectStatusLoader`, `GitConfigDetector`, `SessionContextLoader`

**Depois**: Instruções diretas no agent markdown:
```markdown
## Context Loading (on activation)

Execute silently:
```bash
git status --short
git log --oneline -3
```
```

### 6. Agent Memory

**Antes**: `.aios/session-state.json` gerenciado por código

**Depois**: `memory: project` no frontmatter + `.claude/agent-memory/{agent}/MEMORY.md`

## Funcionalidades Não Migradas

Mantidas como código por necessidade técnica:

| Funcionalidade | Razão | Localização |
|----------------|-------|-------------|
| Build State Manager | Checkpoints cross-session | `.aios-core/core/build/` |
| Health Check Engine | Orchestração paralela | `.aios-core/core/health/` |
| Worktree Manager | Git worktree isolation | `.aios-core/core/git/` |

## Guia de Migração para Usuários

### Ativando Agents (Novo Método)

**Método 1: Via Task tool (programático)**
```javascript
Use Task tool with:
- subagent_type: "dev"  // ou qa, pm, architect, etc.
- prompt: "Desenvolva a story 1.2.3"
```

**Método 2: Via Skill (interativo)**
```
/AIOS:agents:dev
```

**Método 3: Spawn direto**
```
# O agent é ativado automaticamente quando você o referencia
"@dev, implemente a story 1.2.3"
```

### Migração de Workflows

**Antes** (task file):
```
*develop story-1.2.3
```

**Depois** (skill ou natural):
```
# Via skill
/develop-story 1.2.3

# Ou natural
"develop story 1.2.3"
```

### Configuração de Projetos Existentes

Se seu projeto usa agents AIOS customizados:

1. **Copie** seus agents de `.aios-core/development/agents/` para `.claude/agents/`
2. **Converta** o formato YAML para frontmatter markdown
3. **Remova** referências a `unified-activation-pipeline.js`
4. **Atualize** comandos para usar linguagem natural ou skills

## Validação da Migração

### Testes Funcionais

```bash
# Testar agent dev
claude --agent dev "Show me your capabilities"

# Testar agent qa
claude --agent qa "Review story 1.2.3"

# Testar agent pm
claude --agent pm "Create PRD for feature X"
```

### Checklist de Validação

- [ ] Todos os 12 agents respondem corretamente
- [ ] Agents mantêm persona consistente
- [ ] Context loading funciona
- [ ] Colaboração entre agents funciona
- [ ] Memory persiste entre sessões
- [ ] Não há referências a código eliminado

## Rollback

Se necessário reverter:

1. Os arquivos AIOS originais estão em `.aios-core/development/agents/`
2. Os scripts de activation estão em `.aios-core/development/scripts/`
3. Reative via `/AIOS:agents:{agent-id}` (usa formato antigo)

## Próximos Passos (Phase 2)

1. **Migrar Skills** — Converter top 10 tasks para Skills
2. **Simplificar Scripts** — Reescrever build-state como shell
3. **Cleanup** — Remover código morto
4. **Documentação** — Atualizar guias do usuário

---

*Migração executada: 2026-02-07*
*Versão: AIOS 2.0 Hybrid Architecture*
