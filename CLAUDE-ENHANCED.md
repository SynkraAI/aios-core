# CLAUDE.md - AIOS Core (Enhanced Reference)

Este arquivo enhance o CLAUDE.md oficial do aios-core com referências práticas.

**Nota:** Leia também `.claude/CLAUDE.md` (oficial) e `.claude/rules/mcp-usage.md` (MCP governance)

---

## Quick Reference

### Estrutura Projeto
```
aios-core/
├── .aios-core/              # Core framework
│   ├── constitution.md      # Princípios inegociáveis ⭐ READ THIS
│   ├── core/                # Modules
│   ├── development/         # Agents, tasks, templates
│   └── scripts/             # Tools
├── apps/dashboard/          # Next.js (observability)
├── bin/                     # CLI (aios, aios-core, aios-minimal)
├── src/                     # Framework source
├── packages/                # Shared packages
├── squads/                  # Expansion packs
├── docs/
│   ├── stories/            # Development stories (ACTIVE WORK)
│   ├── guides/
│   │   ├── user-guide.md   # Complete workflow ⭐ READ THIS
│   │   └── installation-troubleshooting.md
│   └── architecture/       # System design
└── tests/                  # Jest tests
```

---

## Constitution (Critical)

**Arquivo:** `.aios-core/constitution.md`

Princípios inegociáveis com gates automáticos:

| Artigo | Princípio | Severidade | Implicação |
|--------|-----------|-----------|----------|
| I | **CLI First** | NON-NEGOTIABLE | Toda funcionalidade deve 100% funcionar via CLI antes de UI |
| II | **Agent Authority** | NON-NEGOTIABLE | Agentes têm escopo definido, nunca se misturam |
| III | **Story-Driven Development** | MUST | Todo work começa com story em `docs/stories/` |
| IV | **No Invention** | MUST | Não criar features extras, seguir spec exatamente |
| V | **Quality First** | MUST | Testes obrigatórios, zero tech debt |
| VI | **Absolute Imports** | SHOULD | Usar imports absolutos, nunca relativos |

**Implicação:** Violar artigos NON-NEGOTIABLE = bloqueado por gates automáticos.

---

## Workflow Principal (CLI First)

```
CLI First → Observability Second → UI Third
```

### 1. CLI (Máxima Prioridade)
- Agentic orchestration
- Todas decisões e automação
- Source of truth
- Exemplo: `aios-core init`, `aios-core validate:agents`

### 2. Observability (Secundária)
- Monitor CLI in real-time
- Dashboards (SSE)
- Logs & metrics
- Não controla, apenas observa

### 3. UI (Terciária)
- Pontuais, optional
- Gestão + visualizações
- Nunca requisito

---

## Sistema de Agentes

### Ativação
```bash
@dev              # Ativar agente
/AIOS:agents:dev  # Ou assim
*help             # Ver comandos
```

### 10 Agentes Disponíveis

| ID | Persona | Escopo | Comandos |
|--|--|--|--|
| `@dev` | Dex | Implementação de código, refactoring | `*help`, `*create-story` |
| `@qa` | Quinn | Testes, qualidade, debugging | `*task test`, `*coverage` |
| `@architect` | Aria | Arquitetura, design técnico | `*create-design`, `*review-arch` |
| `@pm` | Morgan | Product Management | `*create-epic`, `*prioritize` |
| `@po` | Pax | Product Owner, stories | `*create-story`, `*acceptance-criteria` |
| `@sm` | River | Scrum Master, coordination | `*task {name}`, `*track-progress` |
| `@analyst` | Alex | Pesquisa e análise | `*research`, `*analyze` |
| `@data-engineer` | Dara | Database design | `*design-schema`, `*migration` |
| `@ux-design-expert` | Uma | UX/UI design | `*design-component`, `*wireframe` |
| `@devops` | Gage | CI/CD, git push, MCP | `*push`, `*ci-check`, `*add-mcp` |

### Importante: @devops é EXCLUSIVO para Push
- Só `@devops` pode fazer `git push` para remote
- Outros agentes preparam branches
- @devops faz merge final

---

## Story-Driven Development

**Arquivo base:** `docs/stories/`

### Workflow
```
@po *create-story
    ↓
    Story file criado em docs/stories/active/
    ↓
@dev implementa (abre story, segue checkboxes)
    ↓
@qa testa (executa test cases)
    ↓
@devops push (para remote)
    ↓
Story move para docs/stories/completed/
```

### Story Structure
```
docs/stories/active/
└── story-2.1-implement-feature.md

---
# Story 2.1: Implement Feature

## Context
[Background info]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Implementation Notes
[Guidance from @architect/@sm]

## File List (updated by @dev)
- `src/new-file.ts` (created)
- `src/existing.ts` (modified)

## Testing
- Unit: 100% coverage
- E2E: Happy path + edge cases

## Definition of Done
- [ ] Code written
- [ ] Tests passing
- [ ] Reviewed
- [ ] Merged
```

### Development Cycle
1. **Open story** - `@dev` abre arquivo de story
2. **Implement** - Seguir acceptance criteria EXATAMENTE
3. **Test** - Rodar testes antes de marcar completo
4. **Update checkboxes** - `[ ]` → `[x]` conforme avança
5. **Update File List** - Listar todos arquivos touched
6. **Mark for review** - Avisar `@qa`
7. **QA testing** - `@qa` rodar testes, atualizar status
8. **Push** - `@devops` faz merge e push

---

## Agentes Especializados: Quando Usar

### @dev - Implementação
```
Usar quando:
- Codando feature/bug fix
- Refactoring
- Escrevendo testes

Comandos:
- @dev *help
- @dev *task implement-feature
- @dev *create-story (com @po)
```

### @qa - Testes
```
Usar quando:
- Testando feature
- Debugging failures
- Coverage analysis

Comandos:
- @qa *task test
- @qa *coverage
- @qa *debug-failure
```

### @architect - Design
```
Usar quando:
- Arquitetura complex
- System design
- Performance considerations

Comandos:
- @architect *design-system
- @architect *review-arch
- @architect *create-design
```

### @pm/@po - Product
```
Usar quando:
- Criando features
- Priorização
- Epics/stories

Comandos:
- @po *create-story
- @pm *create-epic
- @pm *prioritize
```

### @sm - Coordination
```
Usar quando:
- Tracking progress
- Blockers
- Task management

Comandos:
- @sm *task {name}
- @sm *track-progress
- @sm *unblock
```

### @analyst - Research
```
Usar quando:
- Researching tech
- Market analysis
- Data analysis

Comandos:
- @analyst *research topic
- @analyst *analyze data
```

### @data-engineer - Database
```
Usar quando:
- Database design
- Migrations
- Schema changes

Comandos:
- @data-engineer *design-schema
- @data-engineer *migration
```

### @ux-design-expert - UX/UI
```
Usar quando:
- Component design
- Wireframes
- UX decisions

Comandos:
- @ux-design-expert *design-component
- @ux-design-expert *wireframe
```

### @devops - Infrastructure
```
Usar quando:
- CI/CD
- Git operations
- MCP management
- Deployment

Comandos (EXCLUSIVOS):
- @devops *push (ONLY THIS AGENT)
- @devops *ci-check
- @devops *add-mcp
- @devops *setup-mcp-docker
```

---

## Padrões de Código

### TypeScript
```typescript
// ✓ BOAS PRÁTICAS
// 1. Sem any
const user: User = data  // Typed

// 2. Type guards
if (typeof value === 'string') { }
if (value instanceof Error) { }

// 3. Async/await + error handling
try {
  const result = await operation()
} catch (error) {
  logger.error('Operation failed', { error })
  throw new Error(`Failed: ${error}`)
}

// 4. Imports absolutos
import { x } from '@/lib/utils'

// 5. Early returns
function process(data: any) {
  if (!data) return null
  if (data.invalid) return null
  return data.process()
}

// 6. Constantes UPPERCASE_SNAKE_CASE
const MAX_RETRIES = 3
const API_TIMEOUT = 5000

// 7. Funções < 40 linhas
// Refactor se maior
```

### Nomenclatura Consistente
```typescript
// Arquivos: kebab-case
user-service.ts
get-user.ts

// Variáveis/funções: camelCase
const userName = 'John'
function getUserById(id: string) { }

// Classes/tipos/interfaces: PascalCase
class UserService { }
interface UserDto { }
type UserInput = { }

// Constantes: UPPER_SNAKE_CASE
const MAX_USERS = 100
```

### Error Handling Obrigatório
```typescript
// ✓ BOM
try {
  const data = await db.query()
  return data
} catch (error) {
  logger.error('DB query failed', { error, sql: query })
  throw new Error(`Database error: ${error}`)
}

// ✗ RUIM
const data = await db.query()  // No error handling!
return data
```

---

## Testes (Jest)

### Rodar Testes
```bash
npm test                    # Rodar tudo
npm run test:watch          # Watch mode
npm run test:coverage       # Com cobertura
npm test -- --testNamePattern="specific" # Test specific
npm test -- --updateSnapshot  # Update snapshots
```

### Nomes Descritivos
```typescript
// ✓ BOM
it('should return error when email is invalid', () => { })
it('should process user on successful login', () => { })

// ✗ RUIM
it('validates', () => { })
it('works', () => { })
```

### Mocks
```typescript
// Mock apenas chamadas externas
jest.mock('@/lib/api')
jest.mock('db')

// NÃO mockar lógica de negócio
// Testar real behavior
```

### Coverage Alvo
- Lógica de negócio: **100%**
- Agentes IA: **80%+** (LLM calls are complex)
- Utils/helpers: **100%**
- Componentes: **70%+**

---

## Validação de Agentes

```bash
npm run validate:agents
```

Verifica:
- Agentes definidos corretamente
- System prompts válidos
- Tools configuradas
- Constraints respeitadas

---

## Sincronização IDE

```bash
npm run sync:ide              # Sync all IDEs
npm run sync:ide:cursor       # Sync Cursor
npm run sync:ide:windsurf     # Sync Windsurf
npm run sync:ide:validate     # Validate sync
```

Sincroniza agents para IDEs (Cursor, Windsurf).

---

## MCP Governance

**Leia:** `.claude/rules/mcp-usage.md`

### Princípio Básico
```
Native Tools > MCP Servers
```

| Operação | Use | Não Use |
|----------|-----|---------|
| Ler arquivo | `Read` tool | `cat`, docker-gateway |
| Escrever | `Write`/`Edit` | `echo >`, docker-gateway |
| Comando shell | `Bash` | docker-gateway |
| Buscar arquivo | `Glob` | docker-gateway |
| Buscar conteúdo | `Grep` | docker-gateway |

### MCPs Disponíveis

| MCP | Tipo | Use |
|-----|------|-----|
| **context7** | SSE | Library docs lookup |
| **desktop-commander** | stdio | Docker, commands |
| **playwright** | stdio | Browser automation |
| **exa** | stdio | Web search (requer API key) |
| **apify** | stdio | Web scraping, Actors |

### MCP Administration
**ONLY @devops:**
- `*search-mcp` - Procurar MCPs
- `*add-mcp` - Adicionar MCP
- `*list-mcps` - Listar habilitados
- `*remove-mcp` - Remover
- `*setup-mcp-docker` - Setup Docker MCP

---

## Quality Gates (Pré-Push)

Todos devem passar antes de push:

```bash
npm run lint              # ESLint
npm run typecheck         # TypeScript
npm test                  # Jest
npm run validate:agents   # Agentes válidos
```

Se qualquer fail, **não fazer push**.

---

## Commitando (Conventional Commits)

```bash
feat: add new agent @analyzer
fix: resolve agent memory leak
chore: update dependencies
refactor: simplify orchestrator
test: add agent validation tests
docs: update constitution
perf: optimize agent scheduling

# Com story ID
feat: implement story 2.1 [Story 2.1]
```

---

## Troubleshooting

### Build fails
```bash
npm run clean
npm install
npm run build
```

### Agentes não validam
```bash
npm run validate:agents       # Ver erros
# Corrigir `.aios-core/development/agents/*.md`
```

### Testes falhando
```bash
npm test -- --clearCache
npm test -- --no-coverage
```

### IDE sync não funciona
```bash
npm run sync:ide:validate
npm run sync:ide --force
```

---

## Referências Importantes

1. **Constitution**: `.aios-core/constitution.md` ⭐ MANDATORY READ
2. **User Guide**: `docs/guides/user-guide.md` ⭐ WORKFLOW COMPLETE
3. **Official CLAUDE.md**: `.claude/CLAUDE.md`
4. **MCP Rules**: `.claude/rules/mcp-usage.md`
5. **GitHub**: https://github.com/SynkraAI/aios-core
6. **Discord**: https://discord.gg/gk8jAdXWmj

---

## Sumário: Como Trabalhar Aqui

1. **Leia Constitution primeiro** - Entender princípios
2. **Use @po para criar stories** - Todo work começa aqui
3. **Use agente apropriado** - @dev para código, @qa para testes, etc.
4. **Siga story checkboxes** - EXATAMENTE como spec
5. **Testes obrigatórios** - Antes de qualquer commit
6. **Push com @devops** - Nunca push direto
7. **Use native tools** - Não MCPs quando não necessário
8. **Código limpo** - Imports absolutos, tipos, error handling
9. **Conventions** - Naming, commits, padrões
10. **Quality gates** - Lint, typecheck, test, validate

---

*AIOS Core v3.11.3 - Enhanced Reference Guide*
*CLI First | Agent-Driven | Story Development*
