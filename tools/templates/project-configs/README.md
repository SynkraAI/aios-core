# Project Config Templates

Templates de configuração `.claude/` para novos projetos AIOX.

## Estrutura

```
project-configs/
├── base/                    # Template base (todos herdam)
│   ├── .claude/
│   │   ├── settings.json   # Permissões padrão
│   │   ├── CLAUDE.md       # Instruções de projeto
│   │   └── rules/
│   │       ├── behavioral-rules.md  # NEVER/ALWAYS
│   │       └── project-rules.md     # Placeholder customizável
│   ├── port-config.json     # Configuração de portas
│   └── docs/
│       └── README.md
├── app/                     # Override para apps
│   ├── .claude/settings.json
│   └── port-config.json     # 3000-3099, auto-allocation ON
├── squad/                   # Override para squads
│   ├── .claude/settings.json
│   └── port-config.json     # 8000-8099, auto-allocation ON
├── mind-clone/              # Override para mind clones
│   ├── .claude/settings.json
│   └── port-config.json     # 6000-6099, auto-allocation OFF
├── pipeline/                # Override para pipelines
│   ├── .claude/settings.json
│   └── port-config.json     # 5000-5099, auto-allocation ON
├── knowledge/               # Override para knowledge bases
│   ├── .claude/settings.json
│   └── port-config.json     # 7000-7099, auto-allocation OFF
└── research/                # Override para research projects
    ├── .claude/settings.json
    └── port-config.json     # 7100-7199, auto-allocation OFF
```

## Como Funciona

1. **Base é sempre copiado** — todos os projetos começam com `base/`
2. **Override por tipo** — se existe template específico, sobrescreve apenas `settings.json`
3. **Placeholders** — `CLAUDE.md` tem {{VARS}} que são substituídas no `/new-project`

## Permissões por Tipo

### Base
- Read/Write/Edit/Bash básico
- Git local operations (pull, commit, add, etc.)
- **DENY:** git push, destructive commands

### App (+npm/docker/build)
- Base +
- npm/yarn/pnpm/bun commands
- docker/docker-compose commands
- **DENY:** npm publish, docker push

### Squad (+Task/agents)
- Base +
- Task tool para squad agents
- Task tool para AIOX agents

### Mind Clone (+WebSearch/WebFetch priority)
- Base +
- WebFetch/WebSearch unrestricted
- Task tool para mind-cloning squad

### Pipeline (+media tools)
- Base +
- ffmpeg, imagemagick, convert
- python/node script execution

### Knowledge (+Glob/Grep/Read amplified)
- Base +
- Glob/Grep/Read unrestricted

### Research (+deep-research tools)
- Base +
- WebFetch/WebSearch unrestricted
- Task tool para deep-research/tech-search agents

## Port Management

Todos os templates incluem `port-config.json` que define:
- **Range de portas** — cada tipo tem seu range dedicado
- **Auto-allocation** — se a porta deve ser alocada automaticamente
- **Scripts npm** — helpers para check-port (apenas tipos app/squad/pipeline)

### Port Ranges

| Tipo | Range | Auto-Allocate |
|------|-------|---------------|
| app | 3000-3099 | ✅ |
| api | 4000-4099 | ✅ |
| pipeline | 5000-5099 | ✅ |
| squad | 8000-8099 | ✅ |
| mind-clone | 6000-6099 | ❌ |
| knowledge | 7000-7099 | ❌ |
| research | 7100-7199 | ❌ |

### Fluxo Automático

Ao rodar `/new-project` com tipo `app`:
1. ✅ Porta é alocada automaticamente (ex: 3001)
2. ✅ `.aios/port-config.json` é atualizado com porta alocada
3. ✅ `.env` é criado com `PORT=3001`
4. ✅ Registry global é atualizado (`.aios-core/data/port-registry.json`)

### Port Manager CLI

Gerenciar portas manualmente:

```bash
# Verificar se porta está livre
node tools/port-manager.js check 3000

# Alocar porta para projeto
node tools/port-manager.js allocate meu-app app

# Listar portas alocadas
node tools/port-manager.js list

# Liberar porta de projeto
node tools/port-manager.js release meu-app
```

## Uso

Integrado automaticamente no `/new-project` skill (Passo 2.8).

Manual:
```bash
# Copiar template para projeto externo
cp -r tools/templates/project-configs/base/.claude ~/CODE/Projects/meu-app/
cp tools/templates/project-configs/app/.claude/settings.json ~/CODE/Projects/meu-app/.claude/

# Substituir placeholders no CLAUDE.md
sed -i '' 's/{{PROJECT_NAME}}/Meu App/g' ~/CODE/Projects/meu-app/.claude/CLAUDE.md
```

## Manutenção

Ao atualizar regras:
1. Edite `base/` primeiro (afeta todos)
2. Teste com `/audit-project-config` skill
3. Override específico só se necessário

## Validação

Use `/audit-project-config` para validar projetos existentes contra templates atuais.
