<!--
  Tradução: PT-BR
  Original: /docs/en/framework/tech-stack.md
  Última sincronização: 2026-01-26
-->

# Stack de Tecnologia AIOS

> 🌐 [EN](../../framework/tech-stack.md) | **PT** | [ES](../../es/framework/tech-stack.md)

---

**Versão:** 1.1
**Última Atualização:** 2025-12-14
**Status:** Padrão Oficial do Framework
**Aviso de Migração:** Este documento migrará para o repositório `SynkraAI/aios-core` em Q2 2026 (veja Decision 005)

---

## Sumário

- [Visão Geral](#visão-geral)
- [Runtime Principal](#runtime-principal)
- [Linguagens e Transpiladores](#linguagens-e-transpiladores)
- [Dependências Principais](#dependências-principais)
- [Ferramentas de Desenvolvimento](#ferramentas-de-desenvolvimento)
- [Framework de Testes](#framework-de-testes)
- [Build e Deploy](#build-e-deploy)
- [Integrações Externas](#integrações-externas)
- [Stack Futuro (Pós-Migração)](#stack-futuro-pós-migração)

---

## Visão Geral

O AIOS é construído com JavaScript/TypeScript moderno com runtime Node.js, otimizado para desenvolvimento de CLI multiplataforma com UX interativa e capacidades de orquestração de agentes.

**Filosofia:**

- Preferir **tecnologia estável** quando possível (dependências comprovadas e estáveis)
- Escolher **tecnologia inovadora** apenas quando necessário (performance, melhorias de DX)
- Minimizar dependências (reduzir risco de supply chain)
- Multiplataforma primeiro (Windows, macOS, Linux)

---

## Runtime Principal

### Node.js

```yaml
Version: 18.0.0+
LTS: Yes (Active LTS until April 2025)
Reason: Stable async/await, fetch API, ES2022 support
```

**Por que Node.js 18+:**

- API `fetch()` nativa (sem necessidade de axios/node-fetch)
- Suporte a módulos ES2022 (top-level await)
- V8 10.2+ (melhorias de performance)
- Suporte Active LTS (patches de segurança)
- Multiplataforma (Windows/macOS/Linux)

**Gerenciador de Pacotes:**

```yaml
Primary: npm 9.0.0+
Alternative: yarn/pnpm (escolha do usuário)
Lock File: package-lock.json
```

---

## Linguagens e Transpiladores

### JavaScript (Principal)

```yaml
Standard: ES2022
Module System: CommonJS (require/module.exports)
Future: ESM migration planned (Story 6.2.x)
```

**Por que ES2022:**

- Class fields e métodos privados
- Top-level await
- Error cause
- Método Array.at()
- Object.hasOwn()

### TypeScript (Definições de Tipo)

```yaml
Version: 5.9.3
Usage: Type definitions only (.d.ts files)
Compilation: Not used (pure JS runtime)
Future: Full TypeScript migration considered for Q2 2026
```

**Uso Atual de TypeScript:**

```typescript
// index.d.ts - Type definitions for public API
export interface AgentConfig {
  id: string;
  name: string;
  enabled: boolean;
  dependencies?: string[];
}

export function executeAgent(agentId: string, args: Record<string, any>): Promise<any>;
```

**Configuração TypeScript:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "./dist"
  }
}
```

---

## Dependências Principais

### CLI e UX Interativa

#### @clack/prompts (^0.11.0)

**Propósito:** Prompts de CLI modernos com UX elegante
**Uso:** Wizards interativos, coleta de input do usuário
**Por quê:** UX de primeira classe, animações de spinner, barras de progresso

```javascript
import { select, confirm, spinner } from '@clack/prompts';

const agent = await select({
  message: 'Select agent:',
  options: [
    { value: 'dev', label: '💻 Developer' },
    { value: 'qa', label: '🧪 QA Engineer' },
  ],
});
```

#### chalk (^4.1.2)

**Propósito:** Estilização de strings no terminal
**Uso:** Output colorido, formatação
**Por quê:** Multiplataforma, zero dependências, API estável

```javascript
const chalk = require('chalk');
console.log(chalk.green('✅ Agent activated successfully'));
console.log(chalk.red('❌ Task failed'));
```

#### picocolors (^1.1.1)

**Propósito:** Biblioteca de cores leve (alternativa mais rápida ao chalk)
**Uso:** Output de cores em situações críticas de performance
**Por quê:** 14x menor que chalk, 2x mais rápido

```javascript
const pc = require('picocolors');
console.log(pc.green('✅ Fast output'));
```

#### ora (^5.4.1)

**Propósito:** Spinners de terminal
**Uso:** Indicadores de carregamento, operações assíncronas
**Por quê:** Spinners elegantes, customizáveis, amplamente usado

```javascript
const ora = require('ora');
const spinner = ora('Loading agent...').start();
await loadAgent();
spinner.succeed('Agent loaded');
```

### Operações de File System e Path

#### fs-extra (^11.3.2)

**Propósito:** Operações de file system aprimoradas
**Uso:** Cópia de arquivos, criação de diretórios, leitura/escrita JSON
**Por quê:** Baseado em Promise, utilidades adicionais sobre o `fs` nativo

```javascript
const fs = require('fs-extra');
await fs.copy('source', 'dest');
await fs.ensureDir('path/to/dir');
await fs.outputJson('config.json', data);
```

#### glob (^11.0.3)

**Propósito:** Pattern matching de arquivos
**Uso:** Encontrar arquivos por patterns (ex: `*.md`, `**/*.yaml`)
**Por quê:** Rápido, suporta patterns de gitignore

```javascript
const { glob } = require('glob');
const stories = await glob('docs/stories/**/*.md');
```

### Processamento YAML

#### yaml (^2.8.1)

**Propósito:** Parsing e serialização YAML
**Uso:** Configs de agentes, workflows, templates
**Por quê:** Rápido, compatível com spec, preserva comentários

```javascript
const YAML = require('yaml');
const agent = YAML.parse(fs.readFileSync('agent.yaml', 'utf8'));
```

#### js-yaml (^4.1.0)

**Propósito:** Parser YAML alternativo (suporte legado)
**Uso:** Parsing de arquivos YAML mais antigos
**Por quê:** API diferente, usado em código legado

```javascript
const yaml = require('js-yaml');
const doc = yaml.load(fs.readFileSync('config.yaml', 'utf8'));
```

**Nota de Migração:** Consolidar para biblioteca YAML única (Story 6.2.x)

### Processamento Markdown

#### @kayvan/markdown-tree-parser (^1.5.0)

**Propósito:** Parsear markdown em AST
**Uso:** Parsing de stories, análise de estrutura de documentos
**Por quê:** Leve, rápido, suporta GFM

```javascript
const { parseMarkdown } = require('@kayvan/markdown-tree-parser');
const ast = parseMarkdown(markdownContent);
```

### Execução de Processos

#### execa (^9.6.0)

**Propósito:** Melhor child_process
**Uso:** Executar git, npm, ferramentas CLI externas
**Por quê:** Multiplataforma, baseado em promise, melhor tratamento de erros

```javascript
const { execa } = require('execa');
const { stdout } = await execa('git', ['status']);
```

### Parsing de Linha de Comando

#### commander (^14.0.1)

**Propósito:** Framework CLI
**Uso:** Parsing de argumentos de linha de comando, subcomandos
**Por quê:** Padrão da indústria, recursos ricos, suporte TypeScript

```javascript
const { Command } = require('commander');
const program = new Command();

program
  .command('agent <name>')
  .description('Activate an agent')
  .action((name) => {
    console.log(`Activating agent: ${name}`);
  });
```

#### inquirer (^8.2.6)

**Propósito:** Prompts de linha de comando interativos
**Uso:** Coleta de input do usuário, wizards
**Por quê:** Tipos de prompt ricos, suporte a validação

```javascript
const inquirer = require('inquirer');
const answers = await inquirer.prompt([
  {
    type: 'list',
    name: 'agent',
    message: 'Select agent:',
    choices: ['dev', 'qa', 'architect'],
  },
]);
```

### Sandboxing e Segurança

#### isolated-vm (^5.0.4)

**Propósito:** V8 isolate para execução JavaScript em sandbox
**Uso:** Execução segura de scripts de usuário, execução de tasks
**Por quê:** Isolamento de segurança, limites de memória, controle de timeout

```javascript
const ivm = require('isolated-vm');
const isolate = new ivm.Isolate({ memoryLimit: 128 });
const context = await isolate.createContext();
```

### Validação

#### validator (^13.15.15)

**Propósito:** Validadores e sanitizadores de strings
**Uso:** Validação de input (URLs, emails, etc.)
**Por quê:** Abrangente, bem testado, sem dependências

```javascript
const validator = require('validator');
if (validator.isURL(url)) {
  // Valid URL
}
```

#### semver (^7.7.2)

**Propósito:** Parser e comparador de versionamento semântico
**Uso:** Verificação de versão, resolução de dependências
**Por quê:** Padrão NPM, amplamente testado

```javascript
const semver = require('semver');
if (semver.satisfies('1.2.3', '>=1.0.0')) {
  // Version compatible
}
```

---

## Ferramentas de Desenvolvimento

### Linting

#### ESLint (^9.38.0)

**Propósito:** Linter JavaScript/TypeScript
**Configuração:** `.eslintrc.json`
**Plugins:**

- `@typescript-eslint/eslint-plugin` (^8.46.2)
- `@typescript-eslint/parser` (^8.46.2)

**Regras Principais:**

```javascript
{
  "rules": {
    "no-console": "off",           // Allow console in CLI
    "no-unused-vars": "error",
    "prefer-const": "error",
    "no-var": "error",
    "eqeqeq": ["error", "always"]
  }
}
```

### Formatação

#### Prettier (^3.5.3)

**Propósito:** Formatador de código
**Configuração:** `.prettierrc`

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5"
}
```

#### yaml-lint (^1.7.0)

**Propósito:** Linter de arquivos YAML
**Uso:** Validar configs de agentes, workflows, templates

### Git Hooks

#### husky (^9.1.7)

**Propósito:** Gerenciamento de git hooks
**Uso:** Linting pre-commit, testes pre-push

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm test"
    }
  }
}
```

#### lint-staged (^16.1.1)

**Propósito:** Executar linters em arquivos staged
**Configuração:**

```json
{
  "lint-staged": {
    "**/*.md": ["prettier --write"],
    "**/*.{js,ts}": ["eslint --fix", "prettier --write"]
  }
}
```

---

## Framework de Testes

### Jest (^30.2.0)

**Propósito:** Framework de testes
**Uso:** Testes unitários, testes de integração, cobertura

```javascript
// Example test
describe('AgentExecutor', () => {
  it('should load agent configuration', async () => {
    const agent = await loadAgent('dev');
    expect(agent.name).toBe('developer');
  });
});
```

**Configuração:**

```json
{
  "jest": {
    "testEnvironment": "node",
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

#### @types/jest (^30.0.0)

**Propósito:** Definições de tipo TypeScript para Jest
**Uso:** Escrita de testes type-safe

---

## Build e Deploy

### Versionamento e Release

#### semantic-release (^25.0.2)

**Propósito:** Versionamento semântico e releases automatizados
**Uso:** Publicação automática no NPM, geração de changelog

**Plugins:**

- `@semantic-release/changelog` (^6.0.3) - Gerar CHANGELOG.md
- `@semantic-release/git` (^10.0.1) - Commit de assets de release

```json
{
  "release": {
    "branches": ["main"],
    "plugins": [
      "@semantic-release/commit-analyzer",
      "@semantic-release/release-notes-generator",
      "@semantic-release/changelog",
      "@semantic-release/npm",
      "@semantic-release/git"
    ]
  }
}
```

### Scripts de Build

```bash
# Package building
npm run build                  # Build all packages
npm run build:agents           # Build agents only
npm run build:teams            # Build teams only

# Versioning
npm run version:patch          # Bump patch version
npm run version:minor          # Bump minor version
npm run version:major          # Bump major version

# Publishing
npm run publish:dry-run        # Test publish
npm run publish:preview        # Publish preview tag
npm run publish:stable         # Publish latest tag
```

---

## Integrações Externas

### Servidores MCP

O AIOS integra com servidores Model Context Protocol (MCP):

```yaml
MCP Servers:
  - clickup-direct: ClickUp integration (task management)
  - context7: Documentation lookup
  - exa-direct: Web search
  - desktop-commander: File operations
  - docker-mcp: Docker management
  - ide: VS Code/Cursor integration
```

**Configuração:** `.claude.json` ou `.cursor/settings.json`

### Ferramentas CLI

Ferramentas CLI externas usadas por agentes:

```yaml
GitHub CLI (gh):
  Version: 2.x+
  Usage: Repository management, PR creation
  Install: https://cli.github.com

Railway CLI (railway):
  Version: 3.x+
  Usage: Deployment automation
  Install: npm i -g @railway/cli

Supabase CLI (supabase):
  Version: 1.x+
  Usage: Database migrations, schema management
  Install: npm i -g supabase

Git:
  Version: 2.30+
  Usage: Version control
  Required: Yes
```

### Serviços Cloud

```yaml
Railway:
  Purpose: Application deployment
  API: Railway CLI

Supabase:
  Purpose: PostgreSQL database + Auth
  API: Supabase CLI + REST API

GitHub:
  Purpose: Repository hosting, CI/CD
  API: GitHub CLI (gh) + Octokit

CodeRabbit:
  Purpose: Automated code review
  API: GitHub App integration
```

---

## Stack Futuro (Pós-Migração)

**Planejado para Q2-Q4 2026** (após reestruturação de repositórios):

### Migração ESM

```javascript
// Current: CommonJS
const agent = require('./agent');
module.exports = { executeAgent };

// Future: ES Modules
import { agent } from './agent.js';
export { executeAgent };
```

### TypeScript Completo

```typescript
// Migrate from JS + .d.ts to full TypeScript
// Benefits: Type safety, better refactoring, improved DX
```

### Ferramentas de Build

```yaml
Bundler: esbuild or tsup
Reason: Fast builds, tree-shaking, minification
Target: Single executable CLI (optional)
```

### Melhorias em Testes

```yaml
E2E Testing: Playwright (browser automation tests)
Performance Testing: Benchmark.js (workflow timing)
```

---

## Gerenciamento de Dependências

### Auditorias de Segurança

```bash
# Run security audit
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Check for outdated packages
npm outdated
```

### Política de Atualização

```yaml
Major Updates: Quarterly review (Q1, Q2, Q3, Q4)
Security Patches: Immediate (within 48 hours)
Minor Updates: Monthly review
Dependency Reduction: Ongoing effort
```

### Árvore de Dependências

```bash
# View dependency tree
npm ls --depth=2

# Find duplicate packages
npm dedupe

# Analyze bundle size
npx cost-of-modules
```

---

## Matriz de Compatibilidade de Versões

| Componente       | Versão  | Compatibilidade | Notas                           |
| ---------------- | ------- | --------------- | ------------------------------- |
| **Node.js**      | 18.0.0+ | Obrigatório     | Active LTS                      |
| **npm**          | 9.0.0+  | Obrigatório     | Gerenciador de pacotes          |
| **TypeScript**   | 5.9.3   | Recomendado     | Definições de tipo              |
| **ESLint**       | 9.38.0  | Obrigatório     | Linting                         |
| **Prettier**     | 3.5.3   | Obrigatório     | Formatação                      |
| **Jest**         | 30.2.0  | Obrigatório     | Testes                          |
| **Git**          | 2.30+   | Obrigatório     | Controle de versão              |
| **GitHub CLI**   | 2.x+    | Opcional        | Gerenciamento de repositório    |
| **Railway CLI**  | 3.x+    | Opcional        | Deploy                          |
| **Supabase CLI** | 1.x+    | Opcional        | Gerenciamento de banco de dados |

---

## Considerações de Performance

### Tamanho do Bundle

```bash
# Production bundle size (minified)
Total: ~5MB (includes all dependencies)

# Critical dependencies (always loaded):
- commander: 120KB
- chalk: 15KB
- yaml: 85KB
- fs-extra: 45KB

# Optional dependencies (lazy loaded):
- inquirer: 650KB (interactive mode only)
- @clack/prompts: 180KB (wizard mode only)
```

### Tempo de Inicialização

```yaml
Cold Start: ~200ms (initial load)
Warm Start: ~50ms (cached modules)
Yolo Mode: ~100ms (skip validation)

Optimization Strategy:
  - Lazy load heavy dependencies
  - Cache parsed YAML configs
  - Use require() conditionally
```

### Uso de Memória

```yaml
Baseline: 30MB (Node.js + AIOS core)
Agent Execution: +10MB (per agent)
Story Processing: +20MB (markdown parsing)
Peak: ~100MB (typical workflow)
```

---

## Notas Específicas por Plataforma

### Windows

```yaml
Path Separators: Backslash (\) - normalized to forward slash (/)
Line Endings: CRLF - Git configured for auto conversion
Shell: PowerShell or CMD - execa handles cross-platform
Node.js: Windows installer from nodejs.org
```

### macOS

```yaml
Path Separators: Forward slash (/)
Line Endings: LF
Shell: zsh (default) or bash
Node.js: Homebrew (brew install node@18) or nvm
```

### Linux

```yaml
Path Separators: Forward slash (/)
Line Endings: LF
Shell: bash (default) or zsh
Node.js: nvm, apt, yum, or official binaries
```

---

## Variáveis de Ambiente

```bash
# AIOS Configuration
AIOS_DEBUG=true                    # Enable debug logging
AIOS_CONFIG_PATH=/custom/path      # Custom config location
AIOS_YOLO_MODE=true               # Force yolo mode

# Node.js
NODE_ENV=production                # Production mode
NODE_OPTIONS=--max-old-space-size=4096  # Increase memory limit

# External Services
CLICKUP_API_KEY=pk_xxx            # ClickUp integration
GITHUB_TOKEN=ghp_xxx              # GitHub API access
RAILWAY_TOKEN=xxx                 # Railway deployment
SUPABASE_ACCESS_TOKEN=xxx         # Supabase CLI auth
```

---

## Documentos Relacionados

- [Padrões de Código](./coding-standards.md)
- [Source Tree](./source-tree.md)

---

## Histórico de Versões

| Versão | Data       | Alterações                                                                                       | Autor            |
| ------ | ---------- | ------------------------------------------------------------------------------------------------ | ---------------- |
| 1.0    | 2025-01-15 | Documentação inicial do tech stack                                                               | Aria (architect) |
| 1.1    | 2025-12-14 | Atualizado aviso de migração para SynkraAI/aios-core, semantic-release para v25.0.2 [Story 6.10] | Dex (dev)        |

---

_Este é um padrão oficial do framework AIOS. Todas as escolhas de tecnologia devem estar alinhadas com este stack._
