# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the Synkra AIOS repository.

---

## Constitution

O AIOS possui uma **Constitution formal** com princípios inegociáveis e gates automáticos.

**Documento completo:** `.aios-core/constitution.md`

**Princípios fundamentais:**

| Artigo | Princípio | Severidade |
|--------|-----------|------------|
| I | CLI First | NON-NEGOTIABLE |
| II | Agent Authority | NON-NEGOTIABLE |
| III | Story-Driven Development | MUST |
| IV | No Invention | MUST |
| V | Quality First | MUST |
| VI | Absolute Imports | SHOULD |

**Gates automáticos bloqueiam violações.** Consulte a Constitution para detalhes completos.

---

## Language Configuration

Language preference is handled by Claude Code's native `language` setting (v2.1.0+).
Configure in `~/.claude/settings.json` (global) or `.claude/settings.json` (project):

```json
{ "language": "portuguese" }
```

The installer writes this automatically during `npx aios-core install`. No language config in `core-config.yaml`.

---

## Premissa Arquitetural: CLI First

O Synkra AIOS segue uma hierarquia clara de prioridades que deve guiar **TODAS** as decisões:

```
CLI First → Observability Second → UI Third
```

| Camada | Prioridade | Descrição |
|--------|------------|-----------|
| **CLI** | Máxima | Onde a inteligência vive. Toda execução, decisões e automação. |
| **Observability** | Secundária | Observar e monitorar o que acontece no CLI em tempo real. |
| **UI** | Terciária | Gestão pontual e visualizações quando necessário. |

### Princípios Derivados

1. **A CLI é a fonte da verdade** - Dashboards apenas observam, nunca controlam
2. **Funcionalidades novas devem funcionar 100% via CLI** antes de ter qualquer UI
3. **A UI nunca deve ser requisito** para operação do sistema
4. **Observabilidade serve para entender** o que o CLI está fazendo, não para controlá-lo
5. **Ao decidir onde implementar algo**, sempre prefira CLI > Observability > UI

> **Referência formal:** Constitution Artigo I - CLI First (NON-NEGOTIABLE)

---

## Estrutura do Projeto

```
aios-core/
├── .aios-core/                      # Core do framework
│   ├── constitution.md              # Constitutional rules (NON-NEGOTIABLE)
│   ├── core/                        # Módulos principais
│   │   ├── orchestration/           # Agent orchestration engine
│   │   ├── execution/               # Task/workflow execution
│   │   ├── session/                 # Session lifecycle management
│   │   ├── memory/                  # Context & memory management
│   │   ├── registry/                # Entity registry & metadata
│   │   ├── code-intel/              # Code intelligence (AST, graphs)
│   │   ├── ids/                     # IDS (Incremental Development System)
│   │   └── utils/                   # Utilities
│   ├── development/                 # Development framework
│   │   ├── agents/                  # Agent definitions (*.md)
│   │   ├── tasks/                   # Executable tasks
│   │   ├── workflows/               # Multi-step workflows
│   │   ├── templates/               # Document & code templates
│   │   ├── checklists/              # Validation checklists
│   │   └── scripts/                 # Development scripts
│   ├── data/                        # Knowledge base & registry
│   ├── infrastructure/              # CI/CD, IDE sync scripts
│   ├── elicitation/                 # Elicitation forms for interactive workflows
│   ├── monitor/                     # Health & performance monitoring
│   └── docs/                        # Framework documentation
├── bin/                             # CLI entry points
│   ├── aios.js                      # Main CLI (standalone, no deps)
│   ├── aios-init.js                 # Legacy init wizard
│   ├── aios-minimal.js              # Minimal mode entry
│   └── aios-ids.js                  # IDS tool
├── packages/                        # Workspace packages
│   ├── aios-install/                # Installation wizard (v4)
│   ├── aios-pro-cli/                # Pro features
│   ├── installer/                   # Core installer
│   └── gemini-aios-extension/       # Gemini IDE integration
├── docs/                            # Public documentation
│   ├── stories/                     # Development stories (active/, completed/)
│   │   ├── epics/                   # Epic documentation
│   │   └── completed/               # Finished work
│   ├── architecture/                # Architecture decisions
│   ├── guides/                      # User & developer guides
│   └── qa/                          # QA reports & test documentation
├── squads/                          # Squad customizations & expansions
├── pro/                             # Pro submodule (proprietary)
├── tests/                           # Test suites
│   ├── agents/                      # Agent compatibility tests
│   ├── code-intel/                  # Code intelligence tests
│   ├── health-check/                # Health check tests (Mocha)
│   └── .../                         # Feature-specific tests
├── .aios/                           # Instance configuration (local)
├── .claude/                         # Claude Code configuration
│   ├── CLAUDE.md                    # This file
│   ├── rules/                       # Agent authority, workflows, etc.
│   └── hooks/                       # Session & tool hooks
├── .github/                         # GitHub workflows & templates
├── .coderabbit.yaml                 # Code review configuration
├── .env.example                     # Environment template
└── package.json                     # Workspace root
```

### Core Module Responsibilities

| Módulo | Responsabilidade |
|--------|------------------|
| `.aios-core/core/orchestration/` | Agent activation, command routing, execution flow |
| `.aios-core/core/execution/` | Task & workflow execution engine, progress tracking |
| `.aios-core/core/session/` | Session lifecycle, context preservation, resumption |
| `.aios-core/core/memory/` | Context cache, memory management, conversation history |
| `.aios-core/core/registry/` | Entity registry, metadata, relationships, adaptability scoring |
| `.aios-core/core/code-intel/` | AST parsing, code graphs, dependency analysis |
| `.aios-core/core/ids/` | Reuse scoring, duplication detection, artifact justification |

---

## Sistema de Agentes

### Ativação de Agentes
Use `@agent-name` ou `/AIOS:agents:agent-name`:

| Agente | Persona | Escopo Principal |
|--------|---------|------------------|
| `@dev` | Dex | Implementação de código |
| `@qa` | Quinn | Testes e qualidade |
| `@architect` | Aria | Arquitetura e design técnico |
| `@pm` | Morgan | Product Management |
| `@po` | Pax | Product Owner, stories/epics |
| `@sm` | River | Scrum Master |
| `@analyst` | Alex | Pesquisa e análise |
| `@data-engineer` | Dara | Database design |
| `@ux-design-expert` | Uma | UX/UI design |
| `@devops` | Gage | CI/CD, git push (EXCLUSIVO) |

### Comandos de Agentes
Use prefixo `*` para comandos:
- `*help` - Mostrar comandos disponíveis
- `*create-story` - Criar story de desenvolvimento
- `*task {name}` - Executar task específica
- `*exit` - Sair do modo agente

### Mapeamento Agente → Codebase

| Agente | Diretórios Principais |
|--------|----------------------|
| `@dev` | `packages/`, `.aios-core/core/`, `bin/` |
| `@architect` | `docs/architecture/`, system design |
| `@data-engineer` | `packages/db/`, migrations, schema |
| `@qa` | `tests/`, `*.test.js`, quality gates |
| `@po` | Stories, epics, requirements |
| `@devops` | `.github/`, CI/CD, git operations |

---

## Story-Driven Development

1. **Trabalhe a partir de stories** - Todo desenvolvimento começa com uma story em `docs/stories/`
2. **Atualize progresso** - Marque checkboxes conforme completa: `[ ]` → `[x]`
3. **Rastreie mudanças** - Mantenha a seção File List na story
4. **Siga critérios** - Implemente exatamente o que os acceptance criteria especificam

### Workflow de Story
```
@po *create-story → @dev implementa → @qa testa → @devops push
```

---

## AIOS Framework Development

### Development Scripts Hierarchy

`.aios-core/development/` contains the executable framework:

| Diretório | Propósito | Agentes |
|-----------|-----------|---------|
| `agents/` | Agent personas & capabilities (Markdown) | All agents |
| `tasks/` | Executable task definitions (YAML) | All agents |
| `workflows/` | Multi-step workflow orchestration | @pm, @dev, @qa |
| `templates/` | Document & code templates | @sm, developers |
| `checklists/` | Validation & quality gates | @po, @qa |
| `scripts/` | CLI & utility scripts | CI/CD, automation |

### Critical npm Scripts (Framework Management)

```bash
# IDE Integration & Sync
npm run sync:ide                        # Sync all IDEs (Claude, Codex, Gemini, etc.)
npm run sync:ide:claude                 # Sync Claude Code rules only
npm run validate:claude-sync            # Validate Claude sync (strict mode)
npm run validate:claude-integration     # Validate Claude integration completeness

# Agent & Structure Validation
npm run validate:agents                 # Validate agent definitions
npm run validate:structure              # Validate source tree structure
npm run validate:parity                 # Check IDE parity

# Manifest Management (Installation System)
npm run generate:manifest               # Generate install manifest
npm run validate:manifest               # Validate manifest integrity
npm run manifest:ensure                 # Ensure manifest exists

# Release & Publishing
npm run release                         # Semantic release (CI only)
npm run release:test                    # Test release config (local)
npm run prepublishOnly                  # Pre-publish validation

# Semantic Linting (Documentation Quality)
npm run validate:semantic-lint          # Lint stories & docs for consistency
```

### Manifest System

O AIOS usa um sistema de manifest para instalação:
- **`install-manifest.yaml`** - Gerado em publish, lista todos os arquivos & estrutura
- **Usado por:** Installation wizard, dependency resolution, version validation
- **Atualizar:** Execute `npm run generate:manifest` após mudanças estruturais

---

## Code Patterns

### Node.js/JavaScript Standards

**File naming conventions:**
- CLI modules: kebab-case (e.g., `session-manager.js`)
- Core modules: kebab-case (e.g., `lock-manager.js`)
- Executables: kebab-case (e.g., `aios.js`, `aios-init.js`)
- Constants: SCREAMING_SNAKE_CASE (e.g., `MAX_RETRIES`)

**Module structure:**
```javascript
// Exports at module level
module.exports = {
  createSession,
  resumeSession,
  validateSession
};

// or ES modules
export { createSession, resumeSession, validateSession };
```

**Error handling pattern:**
```javascript
try {
  // Operation with proper context
  const result = await operation();
  return result;
} catch (error) {
  const errorContext = {
    operation: 'operationName',
    error: error.message,
    // Add relevant context
  };
  logger.error('Failed to perform operation', errorContext);
  throw new Error(`Failed to perform operation: ${error.message}`);
}
```

**Core module responsibilities:** Each module in `.aios-core/core/` has a single, clear responsibility:
- `orchestration/`: Agent orchestration and execution flow
- `memory/`: Context and memory management
- `session/`: Session lifecycle and state
- `registry/`: Entity registry and metadata
- `execution/`: Task/workflow execution engine

---

## Testing & Quality Gates

### Test Commands
```bash
npm test                        # Run all tests (Jest)
npm run test:watch              # Watch mode
npm run test:coverage           # Coverage report
npm run test:health-check       # Health check tests (Mocha)
npm run lint                    # ESLint with cache
npm run typecheck               # TypeScript validation
```

### AIOS-Specific Validation
```bash
npm run validate:agents         # Validate agent definitions
npm run validate:structure       # Source tree structure check
npm run validate:manifest        # Install manifest validation
npm run validate:paths          # Path references validation
npm run validate:parity         # IDE parity check
npm run validate:semantic-lint  # Semantic validation for docs
```

### CodeRabbit Integration
```bash
# CodeRabbit runs automatically on PRs (configured in .coderabbit.yaml)
# Self-healing in dev phase: CRITICAL/HIGH auto-fix (max 2 iterations)
# QA phase: Full review with architectural checks
# See .claude/rules/coderabbit-integration.md for details
```

### Pre-Push Quality Gates
All checks must pass before pushing to remote (executed by @devops):
```bash
npm run lint                    # Code style
npm run typecheck               # Type checking
npm test                        # All tests passing
npm run validate:manifest       # Manifest integrity
npm run validate:claude-sync    # Claude Code sync validated
```

---

## Convenções Git

### Commits
Seguir Conventional Commits:
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `test:` - Testes
- `chore:` - Manutenção
- `refactor:` - Refatoração

**Referencie story ID:** `feat: implement feature [Story 2.1]`

### Branches
- `main` - Branch principal
- `feat/*` - Features
- `fix/*` - Correções
- `docs/*` - Documentação

### Push Authority
**Apenas `@devops` pode fazer push para remote.**

---

## Otimização Claude Code

### Uso de Ferramentas
| Tarefa | Use | Não Use |
|--------|-----|---------|
| Buscar conteúdo | `Grep` tool | `grep`/`rg` no bash |
| Ler arquivos | `Read` tool | `cat`/`head`/`tail` |
| Editar arquivos | `Edit` tool | `sed`/`awk` |
| Buscar arquivos | `Glob` tool | `find` |
| Operações complexas | `Task` tool | Múltiplos comandos manuais |

### Performance
- Prefira chamadas de ferramentas em batch
- Use execução paralela para operações independentes
- Cache dados frequentemente acessados durante a sessão

### Gerenciamento de Sessão
- Rastreie progresso da story durante a sessão
- Atualize checkboxes imediatamente após completar tasks
- Mantenha contexto da story atual sendo trabalhada
- Salve estado importante antes de operações longas

### Recuperação de Erros
- Sempre forneça sugestões de recuperação para falhas
- Inclua contexto do erro em mensagens ao usuário
- Sugira procedimentos de rollback quando apropriado
- Documente quaisquer correções manuais necessárias

---

## Development Rules for Claude Code

### ❌ NEVER

- Implement without showing options first (always 1, 2, 3 format)
- Delete/remove content without asking first
- Delete anything created in the last 7 days without explicit approval
- Change something that was already working
- Pretend work is done when it isn't
- Process batch without validating one first
- Add features that weren't requested
- Use mock data when real data exists in database
- Explain/justify when receiving criticism (just fix it)
- Trust AI/subagent output without verification
- Create from scratch when similar exists in `squads/`

### ✅ ALWAYS

- Present options as **"1. X, 2. Y, 3. Z"** format
- Use `AskUserQuestion` tool for clarifications
- Check `squads/` and existing components before creating new ones
- Read COMPLETE schema before proposing database changes
- Investigate root cause when error persists (don't skip steps)
- **Commit before moving to next task**
- Create handoff documentation in `docs/sessions/YYYY-MM/` at end of session

---

## Comandos Frequentes

### Core Development (@dev focus)
```bash
npm test                            # Run tests (Jest)
npm run test:watch                  # Watch mode
npm run test:health-check           # Health check validation
npm run lint                        # ESLint (with cache)
npm run typecheck                   # TypeScript check
```

### AIOS Framework Scripts (@dev using framework)
```bash
# IDE Synchronization (after agent/task changes)
npm run sync:ide                    # Sync all IDEs
npm run validate:claude-sync        # Validate Claude sync

# Structure & Validation
npm run validate:agents             # Check agent definitions
npm run validate:structure          # Check source tree structure
npm run validate:paths              # Check path references

# Manifest Management (for publishing)
npm run generate:manifest           # Generate install manifest
npm run validate:manifest           # Validate manifest
npm run manifest:ensure             # Ensure manifest exists

# Documentation Quality
npm run validate:semantic-lint      # Lint stories for consistency
npm run format                      # Format Markdown & code
```

### CLI Testing (when modifying bin/ or packages/)
```bash
# Test CLI entry points directly
node bin/aios.js --help             # Test main CLI
node bin/aios-init.js               # Test init wizard (legacy)

# Installation testing
npx aios-core install               # Test installation flow
npx aios-core doctor                # System diagnostic
npx aios-core info                  # System information
```

### Release & Publishing (ONLY @devops)
```bash
npm run release:test                # Test release configuration
npm run release                     # Semantic release (CI only - @devops exclusive)
npm run prepublishOnly              # Pre-publish validation
```

---

## Working with Core Modules

### When Modifying `.aios-core/core/*`

**Important:** Core modules are consumed by ALL agents. Changes impact the entire framework.

**Validation checklist:**
1. ✅ Maintain backward compatibility - other agents depend on public APIs
2. ✅ Add comprehensive error handling with context
3. ✅ Include unit tests for new/modified functions
4. ✅ Update TypeScript types if applicable
5. ✅ Run `npm run validate:structure` to check integrity
6. ✅ Document breaking changes in commit message

**Example flow:**
```bash
# 1. Make changes to core module
# 2. Add tests
npm test                            # Verify tests pass

# 3. Validate structure integrity
npm run validate:structure

# 4. Check backwards compatibility
npm run test:health-check           # Mocha health checks

# 5. Lint & type check
npm run lint && npm run typecheck

# 6. Commit with clear message
git add .aios-core/core/<module>
git commit -m "fix: improve error handling in session manager [Story X.Y]"
```

### When Modifying `.aios-core/development/*`

**Agents, tasks, workflows, and templates are the framework definition.**

**After changes:**
1. Validate agent definitions: `npm run validate:agents`
2. Sync with IDEs: `npm run sync:ide` (includes all IDE integrations)
3. Test with a sample agent: `@dev *help` or `@qa *help`
4. Commit changes

---

## MCP Usage

Ver `.claude/rules/mcp-usage.md` para regras detalhadas.

**Resumo:**
- Preferir ferramentas nativas do Claude Code sobre MCP
- MCP Docker Gateway apenas quando explicitamente necessário
- `@devops` gerencia toda infraestrutura MCP

---

## IDS (Incremental Development System)

**Important architectural principle:** Constitution Article IV-A (Incremental Development).

The IDS enforces the decision hierarchy: **REUSE > ADAPT > CREATE**

### The 4 Core Rules

1. **Registry Consultation Required** — Query entity registry before creating artifacts
2. **Decision Hierarchy** — Strictly follow REUSE > ADAPT > CREATE
3. **Adaptation Limits** — Changes must be <30%, must not break consumers
4. **Creation Requirements** — Full justification needed, register within 24h

### Verification Gates (Automated & Manual)

| Gate | Trigger | Blocking | Action |
|------|---------|----------|--------|
| **G1** | Epic creation (@pm) | No | Advisory: show potentially reusable artifacts |
| **G2** | Story creation (@sm) | No | Advisory: show matching patterns |
| **G3** | Story validation (@po) | Soft | Warn if duplication detected |
| **G4** | Dev context (@dev) | No | Log for metrics (informational) |
| **G5** | QA review (@qa) | YES | Check if new artifact could reuse existing |
| **G6** | CI/CD (@devops) | YES | Registry integrity check |

**Reference:** `.aios-core/constitution.md`, Section IV-A

---

## Debug

### Habilitar Debug
```bash
export AIOS_DEBUG=true
```

### Logs
```bash
tail -f .aios/logs/agent.log
```

### Troubleshooting

**IDE Sync issues:**
```bash
npm run validate:claude-sync --strict    # Detailed validation
npm run validate:claude-integration      # Integration check
```

**Health check failures:**
```bash
npm run test:health-check --reporter spec    # Verbose output
```

**Manifest issues:**
```bash
npm run validate:manifest --verbose          # Detailed manifest report
```

---

*Synkra AIOS Claude Code Configuration v4.2*
*CLI First | Observability Second | UI Third*
*Constitution: Non-negotiable framework principles for AI orchestration*
