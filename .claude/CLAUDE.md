# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# Synkra AIOS - Claude Code Configuration

Este arquivo configura o comportamento do Claude Code ao trabalhar no repositório AIOS Core.

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

### Estrutura Geral

```
aios-core/
├── .aios-core/              # Core do framework AIOS
│   ├── core/                # Módulos principais (ver seção Arquitetura Core)
│   ├── development/         # Agents, tasks, templates, checklists
│   ├── infrastructure/      # Scripts de infraestrutura e validação
│   └── scripts/             # Utilitários e scripts auxiliares
├── apps/
│   └── dashboard/           # Dashboard Next.js (Observability + UI)
│       ├── src/             # Código fonte Next.js
│       ├── public/          # Assets estáticos
│       ├── docs/            # Documentação do dashboard
│       └── components.json  # Config shadcn/ui
├── bin/                     # CLI executables
│   ├── aios.js              # CLI principal (npx aios-core)
│   ├── aios-init.js         # Instalador interativo
│   ├── aios-minimal.js      # CLI minimalista
│   ├── modules/             # Módulos CLI compartilhados
│   └── utils/               # Utilitários CLI
├── packages/                # Workspace packages (npm workspaces)
│   ├── gemini-aios-extension/  # Extensão Gemini
│   ├── installer/              # Instalador AIOS
│   └── aios-install/           # Sistema de instalação
├── docs/                    # Documentação completa
│   ├── stories/             # Development stories (active/, completed/)
│   ├── architecture/        # Documentação de arquitetura
│   └── guides/              # Guias de usuário
├── squads/                  # Expansion packs (equipes especializadas)
├── tests/                   # Suíte de testes
├── scripts/                 # Scripts de build e manutenção
└── tools/                   # Ferramentas auxiliares
```

### NPM Workspaces

Este projeto usa npm workspaces para gerenciar múltiplos packages:

```json
"workspaces": [
  "packages/*"
]
```

**Packages disponíveis:**
- `packages/gemini-aios-extension` - Integração com Gemini AI
- `packages/installer` - Sistema de instalação modular
- `packages/aios-install` - Sistema de instalação AIOS

---

## Arquitetura Core

O diretório `.aios-core/core/` contém os módulos principais do framework:

| Módulo | Descrição | Propósito |
|--------|-----------|-----------|
| `orchestration/` | Sistema de orquestração de agentes | Coordenação e execução de agentes IA |
| `memory/` | Sistema de memória persistente | Armazenamento de contexto e aprendizado |
| `execution/` | Engine de execução de tasks | Execução paralela e sequencial de tarefas |
| `health-check/` | Sistema de diagnóstico | Verificação de saúde do sistema |
| `quality-gates/` | Gates de qualidade automáticos | Validação de código e processos |
| `permissions/` | Gerenciamento de permissões | Controle de acesso e autorização |
| `mcp/` | Integração MCP | Model Context Protocol support |
| `config/` | Sistema de configuração | Gerenciamento de configurações |
| `manifest/` | Gerenciamento de manifests | Versionamento e distribuição |
| `elicitation/` | Sistema de elicitação | Coleta de requisitos |
| `ideation/` | Sistema de ideação | Brainstorming e geração de ideias |
| `events/` | Sistema de eventos | Event bus para comunicação entre módulos |
| `utils/` | Utilitários compartilhados | Funções auxiliares reutilizáveis |
| `docs/` | Geração de documentação | Auto-documentação do sistema |

**Convenção de imports para core:**
```typescript
// Use o alias configurado no tsconfig.json
import { orchestrator } from '@synkra/aios-core/orchestration'
import { MemoryStore } from '@synkra/aios-core/memory'
```

### Sistema de Health Check (Arquitetura Modular)

O health-check é composto por 3 camadas principais:

```
.aios-core/core/health-check/
├── checks/          # Plugins de verificação (modulares)
│   ├── local/       # Verificações do sistema local
│   ├── project/     # Verificações do projeto AIOS
│   ├── repository/  # Verificações de git/repo
│   ├── services/    # Verificações de serviços externos
│   └── deployment/  # Verificações de deploy/CI/CD
├── healers/         # Auto-correção de problemas
│   └── index.js     # Healers automáticos
├── reporters/       # Formatação de resultados
│   └── index.js     # Console, JSON, markdown
└── index.js         # Engine principal
```

**Arquitetura:**
- **Checks são plugins modulares** - Cada check é isolado e independente
- **Healers aplicam fixes automáticos** - Usado com `--fix` flag
- **Reporters formatam output** - Suportam múltiplos formatos

**Coverage note:** Checks, healers e reporters são I/O-heavy e excluídos da cobertura de testes unitários (testados via integration tests)

### Sistema de Events

Sistema de comunicação assíncrona entre módulos:

```javascript
const { EventEmitter } = require('@synkra/aios-core/events')

// Emitir evento
EventEmitter.emit('agent:started', { agent: 'dev', story: 'STORY-42' })

// Escutar evento
EventEmitter.on('agent:completed', (data) => {
  console.log('Agent completed:', data)
})
```

**Eventos principais:**
- `agent:started` - Agente iniciou execução
- `agent:completed` - Agente completou tarefa
- `story:updated` - Story foi atualizada
- `gate:blocked` - Quality gate bloqueou operação
- `health:check:failed` - Health check falhou

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
| `@aios-master` | - | Orquestração e meta-agente |

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
| `@architect` | `docs/architecture/`, `.aios-core/core/`, design docs |
| `@data-engineer` | `packages/db/`, migrations, schema |
| `@qa` | `tests/`, `*.test.js`, `.aios-core/core/quality-gates/` |
| `@po` | `docs/stories/`, epics, requirements |
| `@devops` | `.github/`, CI/CD, git operations, releases |
| `@aios-master` | `.aios-core/`, framework core, meta-operações |

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

## Princípios de Desenvolvimento

Estas regras definem comportamentos obrigatórios e proibidos durante o desenvolvimento.

### NEVER (Nunca Faça)

❌ **Implementar sem mostrar opções primeiro**
- Sempre apresente alternativas no formato "1. X, 2. Y, 3. Z"
- Use AskUserQuestion tool para apresentar opções claras

❌ **Deletar/remover conteúdo sem perguntar primeiro**
- Sempre peça confirmação antes de remover código
- Especialmente crítico para código em produção

❌ **Deletar qualquer coisa criada nos últimos 7 dias sem aprovação explícita**
- Trabalho recente pode ter contexto importante não documentado
- Sempre valide com o usuário antes de remover

❌ **Mudar algo que já estava funcionando**
- "If it ain't broke, don't fix it"
- Mudanças desnecessárias introduzem risco

❌ **Fingir que o trabalho está completo quando não está**
- Seja honesto sobre o progresso
- Reporte blockers imediatamente

❌ **Processar lote (batch) sem validar um item primeiro**
- Sempre teste com um exemplo antes de processar múltiplos
- Evita propagar erros em massa

❌ **Adicionar features que não foram solicitadas**
- Stick to the requirements
- Respeite o escopo definido nas stories

❌ **Usar dados mock quando dados reais existem no banco**
- Sempre use dados reais quando disponíveis
- Mock data apenas para desenvolvimento isolado

❌ **Explicar/justificar ao receber críticas**
- Apenas corrija o problema
- Ação > explicação

❌ **Confiar em output de IA/subagente sem verificação**
- Sempre valide resultados de agentes
- Code review é obrigatório

❌ **Criar do zero quando similar já existe em squads/**
- Sempre verifique squads/ e componentes existentes primeiro
- Reutilize e adapte ao invés de recriar

### ALWAYS (Sempre Faça)

✅ **Apresentar opções no formato "1. X, 2. Y, 3. Z"**
- Format estruturado facilita decisão
- Sempre inclua contexto de cada opção

✅ **Use AskUserQuestion tool para clarificações**
- Quando requirements são ambíguos
- Quando múltiplas abordagens são válidas
- Quando decisões de negócio são necessárias

✅ **Verificar squads/ e componentes existentes antes de criar novos**
```bash
# Sempre busque por componentes similares
grep -r "ComponentName" squads/
find . -name "*similar-pattern*"
```

✅ **Ler schema COMPLETO antes de propor mudanças no banco**
- Entenda relacionamentos existentes
- Verifique constraints e índices
- Considere impacto em queries existentes

✅ **Investigar causa raiz quando erro persiste**
- Não apenas trate sintomas
- Use debugging sistemático
- Documente findings para referência futura

✅ **Commit antes de mover para próxima task**
```bash
# Sempre commit work-in-progress
git add .
git commit -m "wip: describe current progress [Story X.Y]"
```

✅ **Criar handoff em "docs/sessions/YYYY-MM/" ao fim da sessão**
```markdown
# Session Handoff - YYYY-MM-DD

## Completed
- [x] Task 1
- [x] Task 2

## In Progress
- [ ] Task 3 (60% complete)

## Blockers
- Issue with X, waiting for Y

## Next Steps
1. Complete Task 3
2. Start Task 4
3. Review with QA

## Important Context
- Decision made: chose approach B because...
- Known issue: X needs attention
```

### Enforcement

Estas regras são enforced através de:
- Pre-commit hooks (lint, typecheck)
- Quality gates automáticos
- Code review por @qa
- Constitution compliance checks

Violações devem ser reportadas e corrigidas imediatamente.

---

## Padrões de Código

### Convenções de Nomenclatura

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Componentes | PascalCase | `WorkflowList` |
| Hooks | prefixo `use` | `useWorkflowOperations` |
| Arquivos | kebab-case | `workflow-list.tsx` |
| Constantes | SCREAMING_SNAKE_CASE | `MAX_RETRIES` |
| Interfaces | PascalCase + sufixo | `WorkflowListProps` |
| Módulos Node | kebab-case | `agent-executor.js` |

### Path Aliases TypeScript

O projeto usa path aliases configurados em `tsconfig.json`:

```typescript
// Aliases disponíveis
"@synkra/aios-core"     → ".aios-core/core"
"@synkra/aios-core/*"   → ".aios-core/core/*"

// Exemplo de uso
import { orchestrator } from '@synkra/aios-core/orchestration'
import { MemoryStore } from '@synkra/aios-core/memory'
import { executeTask } from '@synkra/aios-core/execution'
```

### Imports

**Sempre use imports absolutos com aliases.** Nunca use imports relativos.

```typescript
// ✓ CORRETO - Usando alias
import { useStore } from '@synkra/aios-core/store'

// ✗ ERRADO - Import relativo
import { useStore } from '../../../stores/feature/store'

// ✓ OK - Imports dentro do mesmo módulo podem ser relativos
import { helper } from './utils'
```

**Ordem de imports:**
1. React/Node core libraries
2. External libraries (npm packages)
3. Internal aliases (`@synkra/*`)
4. UI components
5. Utilities
6. Stores/State management
7. Feature imports
8. Types/Interfaces
9. CSS/Styles

### TypeScript

- Sem `any` - Use tipos apropriados ou `unknown` com type guards
- Sempre defina interface de props para componentes
- Use `as const` para objetos/arrays constantes
- Tipos de ref explícitos: `useRef<HTMLDivElement>(null)`
- Configure `strict: true` no tsconfig.json (já habilitado)

### Error Handling

```typescript
try {
  // Operation
} catch (error) {
  logger.error(`Failed to ${operation}`, { error })
  throw new Error(`Failed to ${operation}: ${error instanceof Error ? error.message : 'Unknown'}`)
}
```

---

## Testes & Quality Gates

### Comandos de Teste

```bash
# Rodar todos os testes
npm test

# Rodar teste específico
npm test -- path/to/test.test.js

# Rodar testes por padrão
npm test -- --testNamePattern="pattern name"

# Watch mode para desenvolvimento
npm test -- --watch

# Watch apenas testes que falharam
npm test -- --watch --onlyFailures

# Testes com cobertura
npm run test:coverage

# Testes de health check (Mocha)
npm run test:health-check

# Linting
npm run lint

# Type checking
npm run typecheck
```

### Estrutura de Testes

```
tests/
├── unit/              # Testes unitários
├── integration/       # Testes de integração
├── e2e/              # Testes end-to-end
├── health-check/     # Testes de diagnóstico (Mocha)
├── setup.js          # Setup global do Jest
└── fixtures/         # Dados de teste
```

### Quality Gates (Pre-Push)

Antes de push, todos os checks devem passar:

```bash
npm run lint        # ESLint - qualidade de código
npm run typecheck   # TypeScript - verificação de tipos
npm test            # Jest - todos os testes
```

**Defense in Depth - 3 Camadas:**

1. **Pre-commit** (Local - Rápida): ESLint + TypeScript (<5s)
2. **Pre-push** (Local - Validação): Story validation + testes
3. **CI/CD** (Cloud - Completa): Todos os testes + cobertura (80% mínimo)

### Cobertura de Testes

**Thresholds atuais:**
- Global: ~24% (lines), ~21% (branches)
- Core modules: ~38% (temporariamente reduzido para integração Gemini)
- Target: 80% global, 85% core modules

```bash
# Ver relatório de cobertura
npm run test:coverage
open coverage/lcov-report/index.html
```

**Módulos excluídos da cobertura (I/O-heavy, testados via integration tests):**
- `.aios-core/core/health-check/checks/` - Verificações do sistema (git, npm, docker, etc.)
- `.aios-core/core/config/` - Operações de file system
- `.aios-core/core/manifest/` - JSON parsing e file I/O
- `.aios-core/core/registry/` - File I/O heavy
- `.aios-core/core/utils/` - Funções helper testadas indiretamente

**Framework de testes:**
- **Jest** para unit/integration tests (Node.js environment)
- **Mocha** para health-check tests específicos
- **Playwright** para e2e tests do dashboard (excluído do Jest)
- **Node.js test runner** para testes específicos (v21+ features)

---

## Convenções Git

### Commits

Seguir **Conventional Commits**:

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `test:` - Testes
- `chore:` - Manutenção, deps, configs
- `refactor:` - Refatoração sem mudança de comportamento
- `perf:` - Melhorias de performance
- `ci:` - Mudanças em CI/CD

**Sempre referencie story ID:**
```bash
git commit -m "feat: implement agent orchestration [Story 2.1]"
git commit -m "fix: resolve memory leak in executor [Story 3.5]"
```

### Branches

- `main` - Branch principal (protegida)
- `feat/*` - Features novas
- `fix/*` - Correções de bugs
- `docs/*` - Documentação
- `refactor/*` - Refatorações
- `test/*` - Adição de testes

### Push Authority

**⚠️ IMPORTANTE: Apenas `@devops` pode fazer push para remote.**

O agente @devops (Gage) tem autoridade exclusiva para:
- `git push` para remote
- Criar Pull Requests
- Criar releases e tags
- Gerenciar CI/CD

Outros agentes devem delegar essas operações para @devops.

---

## Comandos Frequentes

### Setup Inicial

```bash
# Instalar AIOS em projeto existente
npx aios-core install

# Criar novo projeto AIOS
npx aios-core init meu-projeto

# Atualizar AIOS existente
npx github:SynkraAI/aios-core install
```

### Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar testes
npm test

# Watch mode
npm test -- --watch

# Verificar código
npm run lint
npm run typecheck

# Build (se aplicável)
npm run build

# Formatar markdown
npm run format
```

### AIOS CLI

```bash
# Informações do sistema
npx aios-core info

# Diagnóstico completo
npx aios-core doctor

# Diagnóstico com auto-fix
npx aios-core doctor --fix

# Ver versão
npx aios-core --version

# Ajuda
npx aios-core --help
```

### Dashboard Next.js (apps/dashboard/)

```bash
# Navegar para dashboard
cd apps/dashboard

# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build produção
npm run build

# Iniciar produção
npm start

# Linting
npm run lint
```

**Stack Técnico do Dashboard:**
- **Framework:** Next.js 16.1.6 (App Router)
- **React:** 19.2.3 (Server Components enabled)
- **UI Library:** Radix UI + shadcn/ui components
- **Styling:** Tailwind CSS v4 (CSS-first configuration)
- **State Management:** Zustand 5.0
- **Data Fetching:** SWR 2.3 (real-time sync with CLI)
- **Drag & Drop:** dnd-kit (para Kanban board)

**Arquitetura:**
- **Server-Sent Events (SSE)** para observabilidade em tempo real
- **Componentes server-first** para melhor performance
- **Estado global mínimo** - preferir server state via SWR
- **Estilização com Tailwind v4** - CSS variables e @theme

### Validação e Qualidade

```bash
# Validar manifesto
npm run validate:manifest

# Validar estrutura do projeto
npm run validate:structure

# Validar agentes
npm run validate:agents

# Sincronizar configurações IDE
npm run sync:ide

# Validar sincronização IDE
npm run sync:ide:validate
```

**IDE Sync System - Arquitetura:**

O sistema de sincronização mantém agentes consistentes entre IDEs automaticamente:

```
.aios-core/infrastructure/scripts/ide-sync/
├── index.js              # Orquestrador principal
├── agent-parser.js       # Parse de agentes markdown
├── redirect-generator.js # Gera redirect agents
├── validator.js          # Valida drift entre IDEs
└── transformers/         # Transformers específicos por IDE
    ├── claude-code.js    # → .claude/rules/agents/
    ├── cursor.js         # → .cursor/rules/agents/
    ├── windsurf.js       # → .windsurf/rules/agents/
    └── antigravity.js    # → .antigravity/rules/agents/
```

**Comandos:**
```bash
# Sincronizar todos os IDEs
npm run sync:ide

# Sincronizar IDE específico
npm run sync:ide:cursor
npm run sync:ide:windsurf

# Validar sincronização (report mode)
npm run sync:ide:validate

# Validar com strict mode (exit 1 se drift)
npm run sync:ide:check
```

**Como funciona:**
1. **Source of Truth:** `.aios-core/development/agents/*.md`
2. **Transformers** adaptam formato para cada IDE
3. **Redirect Agents** mantêm compatibilidade entre sintaxes
4. **Validator** detecta drift e reporta inconsistências
5. **Pre-commit hook** executa sync automaticamente quando agentes mudam

**Story Reference:** Story 6.19 - IDE Command Auto-Sync System

### Workspaces

```bash
# Instalar deps em todos workspaces
npm install

# Rodar comando em workspace específico
npm run test -w packages/installer

# Listar workspaces
npm ls --workspaces --depth=0
```

---

## MCP (Model Context Protocol)

Ver `.claude/rules/mcp-usage.md` para regras detalhadas.

### Resumo de Governança MCP

**IMPORTANTE:** Toda infraestrutura MCP é gerenciada EXCLUSIVAMENTE pelo **@devops** (Gage).

| Operação | Agente | Comando |
|----------|--------|---------|
| Search MCP catalog | DevOps | `*search-mcp` |
| Add MCP server | DevOps | `*add-mcp` |
| List enabled MCPs | DevOps | `*list-mcps` |
| Remove MCP server | DevOps | `*remove-mcp` |
| Setup Docker MCP | DevOps | `*setup-mcp-docker` |

### Prioridade de Ferramentas

**SEMPRE prefira ferramentas nativas do Claude Code sobre MCP:**

| Tarefa | USE | NÃO USE |
|--------|-----|---------|
| Ler arquivos | `Read` tool | docker-gateway |
| Escrever arquivos | `Write`/`Edit` tools | docker-gateway |
| Executar comandos | `Bash` tool | docker-gateway |
| Buscar arquivos | `Glob` tool | docker-gateway |
| Buscar conteúdo | `Grep` tool | docker-gateway |

### Quando Usar MCP

**Use docker-gateway APENAS quando:**
1. Usuário explicitamente menciona "docker" ou "container"
2. Tarefa requer operações em Docker containers
3. Acessar MCPs dentro do Docker (EXA, Context7, Apify)

**Use playwright APENAS quando:**
1. Automação de browser explicitamente necessária
2. Screenshots de páginas web
3. Web scraping ou testes de UI

---

## Debug e Troubleshooting

### Habilitar Debug

```bash
# Modo debug AIOS
export AIOS_DEBUG=true

# Modo verbose Node.js
export NODE_DEBUG=*

# Debug Jest
npm test -- --verbose
```

### Logs

```bash
# Logs do agente
tail -f .aios/logs/agent.log

# Logs do sistema
tail -f .aios/logs/system.log

# Logs de erro
tail -f .aios/logs/error.log
```

### Health Check

```bash
# Diagnóstico completo
npx aios-core doctor

# Ver detalhes específicos
npx aios-core info

# Verificar instalação
node .aios-core/infrastructure/scripts/validate-agents.js
```

### Problemas Comuns

**Jest cache issues:**
```bash
# Limpar cache do Jest
npx jest --clearCache
```

**TypeScript build info:**
```bash
# Remover build cache
rm -f .tsbuildinfo
```

**ESLint cache:**
```bash
# Limpar cache do ESLint
rm -rf .eslintcache
```

**Dependências:**
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

---

## Otimização Claude Code

### Uso de Ferramentas

| Tarefa | USE | NÃO USE |
|--------|-----|---------|
| Buscar conteúdo | `Grep` tool | `grep`/`rg` no bash |
| Ler arquivos | `Read` tool | `cat`/`head`/`tail` |
| Editar arquivos | `Edit` tool | `sed`/`awk` |
| Buscar arquivos | `Glob` tool | `find` |
| Criar arquivos | `Write` tool | `echo >`/`cat <<EOF` |
| Operações complexas | `Task` tool | Múltiplos comandos manuais |

### Performance

- Prefira chamadas de ferramentas em **batch** (paralelo quando possível)
- Use execução paralela para operações independentes
- Cache dados frequentemente acessados durante a sessão
- Evite leituras redundantes - reutilize dados já carregados

### Gerenciamento de Sessão

- **Rastreie progresso** da story durante a sessão
- **Atualize checkboxes** imediatamente após completar tasks
- **Mantenha contexto** da story atual sendo trabalhada
- **Salve estado** importante antes de operações longas
- **Documente decisões** importantes tomadas durante a sessão

### Recuperação de Erros

- Sempre forneça **sugestões de recuperação** para falhas
- Inclua **contexto do erro** em mensagens ao usuário
- Sugira **procedimentos de rollback** quando apropriado
- Documente quaisquer **correções manuais** necessárias
- Verifique **logs** quando operações falharem

---

## Recursos Adicionais

### Documentação

- **Constitution:** `.aios-core/constitution.md` - Princípios fundamentais
- **Arquitetura:** `docs/architecture/ARCHITECTURE-INDEX.md` - Visão técnica
- **User Guide:** `docs/guides/user-guide.md` - Guia completo
- **Squads Guide:** `docs/guides/squads-guide.md` - Extensões e squads
- **README:** `README.md` - Overview e quick start

### Configurações IDE

- **Claude Code:** `.claude/CLAUDE.md` (este arquivo)
- **Cursor:** `.cursor/rules/` - Regras para Cursor IDE
- **Windsurf:** `.windsurf/` - Configurações Windsurf

### CI/CD

- **GitHub Actions:** `.github/workflows/` - Pipelines CI/CD
- **Pre-commit hooks:** `.husky/` - Git hooks
- **Lint-staged:** Validações automáticas em staged files

---

*Synkra AIOS Claude Code Configuration v3.1*
*CLI First | Observability Second | UI Third*
*Last Updated: 2026-02-04*
