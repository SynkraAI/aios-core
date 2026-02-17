# CLAUDE.md - Synkra AIOS

Este arquivo configura o comportamento do Claude Code ao trabalhar neste repositório.

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
├── .aios-core/              # Core do framework
│   ├── core/                # Módulos principais (orchestration, memory, etc.)
│   ├── data/                # Knowledge base, entity registry
│   ├── development/         # Agents, tasks, templates, checklists, scripts
│   └── infrastructure/      # CI/CD templates, scripts
├── bin/                     # CLI executables (aios-init.js, aios.js)
├── docs/                    # Documentação
│   └── stories/             # Development stories (active/, completed/)
├── packages/                # Shared packages
├── pro/                     # Pro submodule (proprietary)
├── squads/                  # Squad expansions
└── tests/                   # Testes
```

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

## Padrões de Código

### Convenções de Nomenclatura

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Componentes | PascalCase | `WorkflowList` |
| Hooks | prefixo `use` | `useWorkflowOperations` |
| Arquivos | kebab-case | `workflow-list.tsx` |
| Constantes | SCREAMING_SNAKE_CASE | `MAX_RETRIES` |
| Interfaces | PascalCase + sufixo | `WorkflowListProps` |

### Imports
**Sempre use imports absolutos.** Nunca use imports relativos.
```typescript
// ✓ Correto
import { useStore } from '@/stores/feature/store'

// ✗ Errado
import { useStore } from '../../../stores/feature/store'
```

**Ordem de imports:**
1. React/core libraries
2. External libraries
3. UI components
4. Utilities
5. Stores
6. Feature imports
7. CSS imports

### TypeScript
- Sem `any` - Use tipos apropriados ou `unknown` com type guards
- Sempre defina interface de props para componentes
- Use `as const` para objetos/arrays constantes
- Tipos de ref explícitos: `useRef<HTMLDivElement>(null)`

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
npm test                    # Rodar testes
npm run test:coverage       # Testes com cobertura
npm run lint                # ESLint
npm run typecheck           # TypeScript
```

### Quality Gates (Pre-Push)
Antes de push, todos os checks devem passar:
```bash
npm run lint        # ESLint
npm run typecheck   # TypeScript
npm test            # Jest
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

## Comandos Frequentes

### Desenvolvimento
```bash
npm run dev                 # Iniciar desenvolvimento
npm test                    # Rodar testes
npm run lint                # Verificar estilo
npm run typecheck           # Verificar tipos
npm run build               # Build produção
```

### AIOS
```bash
npx aios-core install       # Instalar AIOS
npx aios-core doctor        # Diagnóstico do sistema
npx aios-core info          # Informações do sistema
```

### Dashboard (apps/dashboard/)
```bash
cd apps/dashboard
npm install
npm run dev                 # Desenvolvimento
npm run build               # Build produção
```

---

## MCP Usage

Ver `.claude/rules/mcp-usage.md` para regras detalhadas.

**Resumo:**
- Preferir ferramentas nativas do Claude Code sobre MCP
- MCP Docker Gateway apenas quando explicitamente necessário
- `@devops` gerencia toda infraestrutura MCP

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

---

*Synkra AIOS Claude Code Configuration v4.0*
*CLI First | Observability Second | UI Third*
