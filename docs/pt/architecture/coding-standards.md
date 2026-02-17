<!-- Tradução: PT-BR | Original: /docs/en/architecture/coding-standards.md | Sincronização: 2026-01-26 -->

# Padrões de Codificação AIOS

> 🌐 [EN](../../architecture/coding-standards.md) | **PT** | [ES](../../es/architecture/coding-standards.md)

---

> ⚠️ **DESCONTINUADO**: Este arquivo é mantido apenas para compatibilidade retroativa.
>
> **Versão oficial:** [docs/framework/coding-standards.md](../framework/coding-standards.md)
>
> Este arquivo será removido no Q2 2026 após consolidação completa em `docs/framework/`.

---

# Padrões de Codificação AIOS

**Versão:** 1.1
**Última Atualização:** 2025-12-14
**Status:** DESCONTINUADO - Veja docs/framework/coding-standards.md
**Aviso de Migração:** Este documento será migrado para o repositório `SynkraAI/aios-core` no Q2 2026 (veja Decisão 005)

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Padrões JavaScript/TypeScript](#padrões-javascripttypescript)
- [Organização de Arquivos](#organização-de-arquivos)
- [Convenções de Nomenclatura](#convenções-de-nomenclatura)
- [Qualidade de Código](#qualidade-de-código)
- [Padrões de Documentação](#padrões-de-documentação)
- [Padrões de Teste](#padrões-de-teste)
- [Convenções Git](#convenções-git)
- [Padrões de Segurança](#padrões-de-segurança)

---

## Visão Geral

Este documento define os padrões oficiais de codificação para desenvolvimento do framework AIOS. Todas as contribuições de código devem aderir a estes padrões para garantir consistência, manutenibilidade e qualidade.

**Aplicação:**

- ESLint (automatizado)
- Prettier (automatizado)
- Revisão CodeRabbit (automatizada)
- Revisão humana (manual)

---

## Padrões JavaScript/TypeScript

### Versão da Linguagem

```javascript
// Alvo: ES2022 (Node.js 18+)
// TypeScript: 5.x

// ✅ BOM: Sintaxe moderna
const data = await fetchData();
const { id, name } = data;

// ❌ RUIM: Sintaxe desatualizada
fetchData().then(function (data) {
  var id = data.id;
  var name = data.name;
});
```

### Configuração TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

### Estilo de Código

#### Indentação e Formatação

```javascript
// ✅ BOM: Indentação de 2 espaços
function processAgent(agent) {
  if (agent.enabled) {
    return loadAgent(agent);
  }
  return null;
}

// ❌ RUIM: 4 espaços ou tabs
function processAgent(agent) {
  if (agent.enabled) {
    return loadAgent(agent);
  }
  return null;
}
```

**Configuração Prettier:**

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

#### Comprimento de Linha

```javascript
// ✅ BOM: Máximo 100 caracteres
const result = await executeTask(taskName, taskArgs, { timeout: 5000, retry: 3 });

// ❌ RUIM: Mais de 100 caracteres
const result = await executeTask(taskName, taskArgs, {
  timeout: 5000,
  retry: 3,
  failureCallback: onFailure,
});
```

#### Aspas

```javascript
// ✅ BOM: Aspas simples para strings
const agentName = 'developer';
const message = `Agent ${agentName} activated`;

// ❌ RUIM: Aspas duplas (exceto JSON)
const agentName = 'developer';
```

### Padrões Modernos de JavaScript

#### Async/Await (Preferencial)

```javascript
// ✅ BOM: async/await
async function loadAgent(agentId) {
  try {
    const agent = await fetchAgent(agentId);
    const config = await loadConfig(agent.configPath);
    return { agent, config };
  } catch (error) {
    console.error(`Failed to load agent ${agentId}:`, error);
    throw error;
  }
}

// ❌ RUIM: Cadeias de Promise
function loadAgent(agentId) {
  return fetchAgent(agentId)
    .then((agent) => loadConfig(agent.configPath).then((config) => ({ agent, config })))
    .catch((error) => {
      console.error(`Failed to load agent ${agentId}:`, error);
      throw error;
    });
}
```

#### Desestruturação

```javascript
// ✅ BOM: Desestruturação
const { name, id, enabled } = agent;
const [first, second, ...rest] = items;

// ❌ RUIM: Extração manual
const name = agent.name;
const id = agent.id;
const enabled = agent.enabled;
```

#### Arrow Functions

```javascript
// ✅ BOM: Arrow functions para callbacks
const activeAgents = agents.filter((agent) => agent.enabled);
const agentNames = agents.map((agent) => agent.name);

// ❌ RUIM: Funções tradicionais para callbacks simples
const activeAgents = agents.filter(function (agent) {
  return agent.enabled;
});
```

#### Template Literals

```javascript
// ✅ BOM: Template literals para interpolação de strings
const message = `Agent ${agentName} loaded successfully`;
const path = `${baseDir}/${agentId}/config.yaml`;

// ❌ RUIM: Concatenação de strings
const message = 'Agent ' + agentName + ' loaded successfully';
const path = baseDir + '/' + agentId + '/config.yaml';
```

### Tratamento de Erros

```javascript
// ✅ BOM: Tratamento de erro específico com contexto
async function executeTask(taskName) {
  try {
    const task = await loadTask(taskName);
    return await task.execute();
  } catch (error) {
    console.error(`Task execution failed [${taskName}]:`, error);
    throw new Error(`Failed to execute task "${taskName}": ${error.message}`);
  }
}

// ❌ RUIM: Falhas silenciosas ou erros genéricos
async function executeTask(taskName) {
  try {
    const task = await loadTask(taskName);
    return await task.execute();
  } catch (error) {
    console.log('Error:', error);
    return null; // Falha silenciosa
  }
}
```

---

## Organização de Arquivos

### Estrutura de Diretórios

```
.aios-core/
├── agents/              # Definições de agentes (YAML + Markdown)
├── tasks/               # Workflows de tarefas (Markdown)
├── templates/           # Templates de documentos (YAML/Markdown)
├── workflows/           # Workflows de múltiplos passos (YAML)
├── checklists/          # Checklists de validação (Markdown)
├── data/                # Base de conhecimento (Markdown)
├── utils/               # Scripts utilitários (JavaScript)
├── tools/               # Integrações com ferramentas (YAML)
└── elicitation/         # Motores de elicitação (JavaScript)

docs/
├── architecture/        # Decisões de arquitetura específicas do projeto
├── framework/           # Documentação oficial do framework (migra para REPO 1)
├── stories/             # Stories de desenvolvimento
├── epics/               # Planejamento de epics
└── guides/              # Guias práticos
```

### Nomenclatura de Arquivos

```javascript
// ✅ BOM: Kebab-case para arquivos
agent - executor.js;
task - runner.js;
greeting - builder.js;
context - detector.js;

// ❌ RUIM: camelCase ou PascalCase para arquivos
agentExecutor.js;
TaskRunner.js;
GreetingBuilder.js;
```

### Estrutura de Módulo

```javascript
// ✅ BOM: Estrutura clara de módulo
// Arquivo: agent-executor.js

// 1. Imports
const fs = require('fs').promises;
const yaml = require('yaml');
const { loadConfig } = require('./config-loader');

// 2. Constantes
const DEFAULT_TIMEOUT = 5000;
const MAX_RETRIES = 3;

// 3. Funções auxiliares (privadas)
function validateAgent(agent) {
  // ...
}

// 4. Exports principais (API pública)
async function executeAgent(agentId, args) {
  // ...
}

async function loadAgent(agentId) {
  // ...
}

// 5. Exports
module.exports = {
  executeAgent,
  loadAgent,
};
```

---

## Convenções de Nomenclatura

### Variáveis e Funções

```javascript
// ✅ BOM: camelCase para variáveis e funções
const agentName = 'developer';
const taskResult = await executeTask();

function loadAgentConfig(agentId) {
  // ...
}

async function fetchAgentData(agentId) {
  // ...
}

// ❌ RUIM: snake_case ou PascalCase
const agent_name = 'developer';
const TaskResult = await executeTask();

function LoadAgentConfig(agentId) {
  // ...
}
```

### Classes

```javascript
// ✅ BOM: PascalCase para classes
class AgentExecutor {
  constructor(config) {
    this.config = config;
  }

  async execute(agentId) {
    // ...
  }
}

class TaskRunner {
  // ...
}

// ❌ RUIM: camelCase ou snake_case
class agentExecutor {
  // ...
}

class task_runner {
  // ...
}
```

### Constantes

```javascript
// ✅ BOM: SCREAMING_SNAKE_CASE para constantes verdadeiras
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT_MS = 5000;
const AGENT_STATUS_ACTIVE = 'active';

// ❌ RUIM: camelCase ou minúsculas
const maxRetryAttempts = 3;
const defaulttimeout = 5000;
```

### Membros Privados

```javascript
// ✅ BOM: Prefixo com underscore para privados (convenção)
class AgentManager {
  constructor() {
    this._cache = new Map();
    this._isInitialized = false;
  }

  _loadFromCache(id) {
    // Auxiliar privado
    return this._cache.get(id);
  }

  async getAgent(id) {
    // API pública
    return this._loadFromCache(id) || (await this._fetchAgent(id));
  }
}
```

### Variáveis Booleanas

```javascript
// ✅ BOM: Prefixo is/has/should
const isEnabled = true;
const hasPermission = false;
const shouldRetry = checkCondition();

// ❌ RUIM: Nomes ambíguos
const enabled = true;
const permission = false;
const retry = checkCondition();
```

---

## Qualidade de Código

### Configuração ESLint

```json
{
  "env": {
    "node": true,
    "es2022": true
  },
  "extends": ["eslint:recommended"],
  "parserOptions": {
    "ecmaVersion": 13,
    "sourceType": "module"
  },
  "rules": {
    "no-console": "off",
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "prefer-const": "error",
    "no-var": "error",
    "eqeqeq": ["error", "always"],
    "curly": ["error", "all"],
    "brace-style": ["error", "1tbs"],
    "comma-dangle": ["error", "es5"],
    "quotes": ["error", "single"],
    "semi": ["error", "always"]
  }
}
```

### Complexidade de Código

```javascript
// ✅ BOM: Baixa complexidade ciclomática (< 10)
function processAgent(agent) {
  if (!agent.enabled) return null;

  const config = loadConfig(agent.configPath);
  const result = executeAgent(agent, config);

  return result;
}

// ❌ RUIM: Alta complexidade ciclomática
function processAgent(agent) {
  if (agent.type === 'dev') {
    if (agent.mode === 'yolo') {
      if (agent.hasStory) {
        // ... lógica aninhada
      } else {
        // ... mais lógica aninhada
      }
    } else {
      // ... mais ramificações
    }
  } else if (agent.type === 'qa') {
    // ... mais ramificações
  }
  // ... ainda mais complexidade
}
```

**Refatorar funções complexas:**

```javascript
// ✅ BOM: Funções auxiliares extraídas
function processAgent(agent) {
  if (!agent.enabled) return null;

  if (agent.type === 'dev') {
    return processDevAgent(agent);
  }

  if (agent.type === 'qa') {
    return processQaAgent(agent);
  }

  return processDefaultAgent(agent);
}
```

### Princípio DRY

```javascript
// ✅ BOM: Função reutilizável
function validateAndLoad(filePath, schema) {
  const content = fs.readFileSync(filePath, 'utf8');
  const data = yaml.parse(content);

  if (!schema.validate(data)) {
    throw new Error(`Invalid schema: ${filePath}`);
  }

  return data;
}

const agent = validateAndLoad('agent.yaml', agentSchema);
const task = validateAndLoad('task.yaml', taskSchema);

// ❌ RUIM: Código repetido
const agentContent = fs.readFileSync('agent.yaml', 'utf8');
const agentData = yaml.parse(agentContent);
if (!agentSchema.validate(agentData)) {
  throw new Error('Invalid agent schema');
}

const taskContent = fs.readFileSync('task.yaml', 'utf8');
const taskData = yaml.parse(taskContent);
if (!taskSchema.validate(taskData)) {
  throw new Error('Invalid task schema');
}
```

---

## Padrões de Documentação

### Comentários JSDoc

```javascript
/**
 * Carrega e executa um agente AIOS
 *
 * @param {string} agentId - Identificador único do agente
 * @param {Object} args - Argumentos de execução do agente
 * @param {boolean} args.yoloMode - Habilitar modo autônomo
 * @param {string} args.storyPath - Caminho para arquivo de story (opcional)
 * @param {number} [timeout=5000] - Timeout de execução em milissegundos
 * @returns {Promise<Object>} Resultado da execução do agente
 * @throws {Error} Se agente não encontrado ou execução falhar
 *
 * @example
 * const result = await executeAgent('dev', {
 *   yoloMode: true,
 *   storyPath: 'docs/stories/story-6.1.2.5.md'
 * });
 */
async function executeAgent(agentId, args, timeout = 5000) {
  // Implementação
}
```

### Comentários Inline

```javascript
// ✅ BOM: Explicar PORQUÊ, não O QUÊ
// Cache de agentes para evitar re-parsing de YAML a cada ativação (otimização de performance)
const agentCache = new Map();

// Log de decisão necessário para rollback do modo yolo (requisito da Story 6.1.2.6)
if (yoloMode) {
  await createDecisionLog(storyId);
}

// ❌ RUIM: Declarar o óbvio
// Criar um novo Map
const agentCache = new Map();

// Se modo yolo é verdadeiro
if (yoloMode) {
  await createDecisionLog(storyId);
}
```

### Arquivos README

Todo módulo/diretório deve ter um README.md:

```markdown
# Agent Executor

**Propósito:** Carrega e executa agentes AIOS com gerenciamento de configuração.

## Uso

\`\`\`javascript
const { executeAgent } = require('./agent-executor');

const result = await executeAgent('dev', {
yoloMode: true,
storyPath: 'docs/stories/story-6.1.2.5.md'
});
\`\`\`

## API

- `executeAgent(agentId, args, timeout)` - Executar agente
- `loadAgent(agentId)` - Carregar configuração do agente

## Dependências

- `yaml` - Parsing YAML
- `fs/promises` - Operações do sistema de arquivos
```

---

## Padrões de Teste

### Nomenclatura de Arquivos de Teste

```bash
# Testes unitários
tests/unit/context-detector.test.js
tests/unit/git-config-detector.test.js

# Testes de integração
tests/integration/contextual-greeting.test.js
tests/integration/workflow-navigation.test.js

# Testes E2E
tests/e2e/agent-activation.test.js
```

### Estrutura de Teste

```javascript
// ✅ BOM: Nomes descritivos de teste com Given-When-Then
describe('ContextDetector', () => {
  describe('detectSessionType', () => {
    it('should return "new" when conversation history is empty', async () => {
      // Given (Dado)
      const conversationHistory = [];
      const sessionFile = null;

      // When (Quando)
      const result = await detectSessionType(conversationHistory, sessionFile);

      // Then (Então)
      expect(result).toBe('new');
    });

    it('should return "workflow" when command pattern matches story_development', async () => {
      // Given (Dado)
      const conversationHistory = [{ command: 'validate-story-draft' }, { command: 'develop' }];

      // When (Quando)
      const result = await detectSessionType(conversationHistory, null);

      // Then (Então)
      expect(result).toBe('workflow');
    });
  });
});
```

### Cobertura de Código

- **Mínimo:** 80% para todos os novos módulos
- **Meta:** 90% para módulos core
- **Crítico:** 100% para módulos de segurança/validação

```bash
# Executar cobertura
npm test -- --coverage

# Thresholds de cobertura em package.json
{
  "jest": {
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

---

## Convenções Git

### Mensagens de Commit

```bash
# ✅ BOM: Formato Conventional Commits
feat: implement contextual agent greeting system [Story 6.1.2.5]
fix: resolve git config cache invalidation issue [Story 6.1.2.5]
docs: update coding standards with TypeScript config
chore: update ESLint configuration
refactor: extract greeting builder into separate module
test: add unit tests for WorkflowNavigator

# ❌ RUIM: Vago ou não descritivo
update files
fix bug
changes
wip
```

**Formato:**

```
<type>: <description> [Story <id>]

<corpo opcional>

<rodapé opcional>
```

**Tipos:**

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Alterações de documentação
- `chore`: Alterações de build/ferramentas
- `refactor`: Refatoração de código (sem mudança funcional)
- `test`: Adições/modificações de testes
- `perf`: Melhorias de performance
- `style`: Alterações de estilo de código (formatação, etc.)

### Nomenclatura de Branch

```bash
# ✅ BOM: Nomes descritivos de branch
feature/story-6.1.2.5-contextual-greeting
fix/git-config-cache-ttl
refactor/agent-executor-optimization
docs/update-coding-standards

# ❌ RUIM: Nomes vagos de branch
update
fix
my-branch
```

---

## Padrões de Segurança

### Validação de Input

```javascript
// ✅ BOM: Validar todos os inputs externos
function executeCommand(command) {
  // Validação por whitelist
  const allowedCommands = ['help', 'develop', 'review', 'deploy'];

  if (!allowedCommands.includes(command)) {
    throw new Error(`Invalid command: ${command}`);
  }

  return runCommand(command);
}

// ❌ RUIM: Sem validação
function executeCommand(command) {
  return eval(command); // NUNCA FAÇA ISSO
}
```

### Proteção contra Path Traversal

```javascript
// ✅ BOM: Validar caminhos de arquivos
const path = require('path');

function loadFile(filePath) {
  const basePath = path.resolve(__dirname, '.aios-core');
  const resolvedPath = path.resolve(basePath, filePath);

  // Prevenir directory traversal
  if (!resolvedPath.startsWith(basePath)) {
    throw new Error('Invalid file path');
  }

  return fs.readFile(resolvedPath, 'utf8');
}

// ❌ RUIM: Uso direto de caminho
function loadFile(filePath) {
  return fs.readFile(filePath, 'utf8'); // Vulnerável a ../../../etc/passwd
}
```

### Gerenciamento de Secrets

```javascript
// ✅ BOM: Usar variáveis de ambiente
const apiKey = process.env.CLICKUP_API_KEY;

if (!apiKey) {
  throw new Error('CLICKUP_API_KEY environment variable not set');
}

// ❌ RUIM: Secrets hardcoded
const apiKey = 'pk_12345678_abcdefgh'; // NUNCA FAÇA ISSO
```

### Segurança de Dependências

```bash
# Auditorias regulares de segurança
npm audit
npm audit fix

# Use Snyk ou similar para monitoramento contínuo
```

---

## Aplicação

### Pre-commit Hooks

```bash
# .husky/pre-commit
#!/bin/sh
npm run lint
npm run typecheck
npm test
```

### Pipeline CI/CD

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --coverage
      - run: npm audit
```

### Integração CodeRabbit

Todos os PRs são automaticamente revisados pelo CodeRabbit para:

- Problemas de qualidade de código
- Vulnerabilidades de segurança
- Problemas de performance
- Violações de boas práticas
- Lacunas de cobertura de teste

---

## Histórico de Versão

| Versão | Data       | Alterações                                                        | Autor            |
| ------ | ---------- | ----------------------------------------------------------------- | ---------------- |
| 1.0    | 2025-01-15 | Documento inicial de padrões de codificação                       | Aria (architect) |
| 1.1    | 2025-12-14 | Atualizado aviso de migração para SynkraAI/aios-core [Story 6.10] | Dex (dev)        |

---

**Documentos Relacionados:**

- [Tech Stack](./tech-stack.md)
- [Source Tree](./source-tree.md)

---

_Este é um padrão oficial do framework AIOS. Todas as contribuições de código devem estar em conformidade._
