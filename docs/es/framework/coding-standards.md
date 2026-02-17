<!--
  Traducción: ES
  Original: /docs/en/framework/coding-standards.md
  Última sincronización: 2026-01-26
-->

# Estándares de Codificación AIOS

> 🌐 [EN](../../framework/coding-standards.md) | [PT](../../pt/framework/coding-standards.md) | **ES**

---

**Versión:** 1.1
**Última Actualización:** 2025-12-14
**Estado:** Estándar Oficial del Framework
**Aviso de Migración:** Este documento migrará al repositorio `SynkraAI/aios-core` en Q2 2026 (ver Decision 005)

---

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Estándares JavaScript/TypeScript](#estándares-javascripttypescript)
- [Organización de Archivos](#organización-de-archivos)
- [Convenciones de Nomenclatura](#convenciones-de-nomenclatura)
- [Calidad de Código](#calidad-de-código)
- [Estándares de Documentación](#estándares-de-documentación)
- [Estándares de Testing](#estándares-de-testing)
- [Convenciones Git](#convenciones-git)
- [Estándares de Seguridad](#estándares-de-seguridad)

---

## Descripción General

Este documento define los estándares oficiales de codificación para el desarrollo del framework AIOS. Todas las contribuciones de código deben adherirse a estos estándares para asegurar consistencia, mantenibilidad y calidad.

**Aplicación:**

- ESLint (automatizado)
- Prettier (automatizado)
- Revisión CodeRabbit (automatizada)
- Revisión humana (manual)

---

## Estándares JavaScript/TypeScript

### Versión del Lenguaje

```javascript
// Target: ES2022 (Node.js 18+)
// TypeScript: 5.x

// ✅ CORRECTO: Sintaxis moderna
const data = await fetchData();
const { id, name } = data;

// ❌ INCORRECTO: Sintaxis obsoleta
fetchData().then(function (data) {
  var id = data.id;
  var name = data.name;
});
```

### Configuración TypeScript

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

#### Indentación y Formateo

```javascript
// ✅ CORRECTO: Indentación de 2 espacios
function processAgent(agent) {
  if (agent.enabled) {
    return loadAgent(agent);
  }
  return null;
}

// ❌ INCORRECTO: 4 espacios o tabs
function processAgent(agent) {
  if (agent.enabled) {
    return loadAgent(agent);
  }
  return null;
}
```

**Configuración Prettier:**

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

#### Longitud de Línea

```javascript
// ✅ CORRECTO: Máximo 100 caracteres
const result = await executeTask(taskName, taskArgs, { timeout: 5000, retry: 3 });

// ❌ INCORRECTO: Más de 100 caracteres
const result = await executeTask(taskName, taskArgs, {
  timeout: 5000,
  retry: 3,
  failureCallback: onFailure,
});
```

#### Comillas

```javascript
// ✅ CORRECTO: Comillas simples para strings
const agentName = 'developer';
const message = `Agent ${agentName} activated`;

// ❌ INCORRECTO: Comillas dobles (excepto JSON)
const agentName = 'developer';
```

### Patrones Modernos de JavaScript

#### Async/Await (Preferido)

```javascript
// ✅ CORRECTO: async/await
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

// ❌ INCORRECTO: Cadenas de Promesas
function loadAgent(agentId) {
  return fetchAgent(agentId)
    .then((agent) => loadConfig(agent.configPath).then((config) => ({ agent, config })))
    .catch((error) => {
      console.error(`Failed to load agent ${agentId}:`, error);
      throw error;
    });
}
```

#### Desestructuración

```javascript
// ✅ CORRECTO: Desestructuración
const { name, id, enabled } = agent;
const [first, second, ...rest] = items;

// ❌ INCORRECTO: Extracción manual
const name = agent.name;
const id = agent.id;
const enabled = agent.enabled;
```

#### Funciones Flecha

```javascript
// ✅ CORRECTO: Funciones flecha para callbacks
const activeAgents = agents.filter((agent) => agent.enabled);
const agentNames = agents.map((agent) => agent.name);

// ❌ INCORRECTO: Funciones tradicionales para callbacks simples
const activeAgents = agents.filter(function (agent) {
  return agent.enabled;
});
```

#### Template Literals

```javascript
// ✅ CORRECTO: Template literals para interpolación de strings
const message = `Agent ${agentName} loaded successfully`;
const path = `${baseDir}/${agentId}/config.yaml`;

// ❌ INCORRECTO: Concatenación de strings
const message = 'Agent ' + agentName + ' loaded successfully';
const path = baseDir + '/' + agentId + '/config.yaml';
```

### Manejo de Errores

```javascript
// ✅ CORRECTO: Manejo de errores específico con contexto
async function executeTask(taskName) {
  try {
    const task = await loadTask(taskName);
    return await task.execute();
  } catch (error) {
    console.error(`Task execution failed [${taskName}]:`, error);
    throw new Error(`Failed to execute task "${taskName}": ${error.message}`);
  }
}

// ❌ INCORRECTO: Fallos silenciosos o errores genéricos
async function executeTask(taskName) {
  try {
    const task = await loadTask(taskName);
    return await task.execute();
  } catch (error) {
    console.log('Error:', error);
    return null; // Fallo silencioso
  }
}
```

---

## Organización de Archivos

### Estructura de Directorios

```
.aios-core/
├── agents/              # Definiciones de agentes (YAML + Markdown)
├── tasks/               # Workflows de tareas (Markdown)
├── templates/           # Templates de documentos (YAML/Markdown)
├── workflows/           # Workflows multi-paso (YAML)
├── checklists/          # Checklists de validación (Markdown)
├── data/                # Base de conocimiento (Markdown)
├── utils/               # Scripts de utilidad (JavaScript)
├── tools/               # Integraciones de herramientas (YAML)
└── elicitation/         # Motores de elicitación (JavaScript)

docs/
├── architecture/        # Decisiones de arquitectura específicas del proyecto
├── framework/           # Documentación oficial del framework (migra a REPO 1)
├── stories/             # Stories de desarrollo
├── epics/               # Planificación de epics
└── guides/              # Guías prácticas
```

### Nomenclatura de Archivos

```javascript
// ✅ CORRECTO: kebab-case para archivos
agent - executor.js;
task - runner.js;
greeting - builder.js;
context - detector.js;

// ❌ INCORRECTO: camelCase o PascalCase para archivos
agentExecutor.js;
TaskRunner.js;
GreetingBuilder.js;
```

### Estructura de Módulos

```javascript
// ✅ CORRECTO: Estructura clara de módulo
// File: agent-executor.js

// 1. Imports
const fs = require('fs').promises;
const yaml = require('yaml');
const { loadConfig } = require('./config-loader');

// 2. Constantes
const DEFAULT_TIMEOUT = 5000;
const MAX_RETRIES = 3;

// 3. Funciones helper (privadas)
function validateAgent(agent) {
  // ...
}

// 4. Exports principales (API pública)
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

## Convenciones de Nomenclatura

### Variables y Funciones

```javascript
// ✅ CORRECTO: camelCase para variables y funciones
const agentName = 'developer';
const taskResult = await executeTask();

function loadAgentConfig(agentId) {
  // ...
}

async function fetchAgentData(agentId) {
  // ...
}

// ❌ INCORRECTO: snake_case o PascalCase
const agent_name = 'developer';
const TaskResult = await executeTask();

function LoadAgentConfig(agentId) {
  // ...
}
```

### Clases

```javascript
// ✅ CORRECTO: PascalCase para clases
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

// ❌ INCORRECTO: camelCase o snake_case
class agentExecutor {
  // ...
}

class task_runner {
  // ...
}
```

### Constantes

```javascript
// ✅ CORRECTO: SCREAMING_SNAKE_CASE para constantes verdaderas
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT_MS = 5000;
const AGENT_STATUS_ACTIVE = 'active';

// ❌ INCORRECTO: camelCase o minúsculas
const maxRetryAttempts = 3;
const defaulttimeout = 5000;
```

### Miembros Privados

```javascript
// ✅ CORRECTO: Prefijo con guion bajo para privados (convención)
class AgentManager {
  constructor() {
    this._cache = new Map();
    this._isInitialized = false;
  }

  _loadFromCache(id) {
    // Helper privado
    return this._cache.get(id);
  }

  async getAgent(id) {
    // API pública
    return this._loadFromCache(id) || (await this._fetchAgent(id));
  }
}
```

### Variables Booleanas

```javascript
// ✅ CORRECTO: Prefijo is/has/should
const isEnabled = true;
const hasPermission = false;
const shouldRetry = checkCondition();

// ❌ INCORRECTO: Nombres ambiguos
const enabled = true;
const permission = false;
const retry = checkCondition();
```

---

## Calidad de Código

### Configuración ESLint

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

### Complejidad de Código

```javascript
// ✅ CORRECTO: Baja complejidad ciclomática (< 10)
function processAgent(agent) {
  if (!agent.enabled) return null;

  const config = loadConfig(agent.configPath);
  const result = executeAgent(agent, config);

  return result;
}

// ❌ INCORRECTO: Alta complejidad ciclomática
function processAgent(agent) {
  if (agent.type === 'dev') {
    if (agent.mode === 'yolo') {
      if (agent.hasStory) {
        // ... lógica anidada
      } else {
        // ... más lógica anidada
      }
    } else {
      // ... más ramas
    }
  } else if (agent.type === 'qa') {
    // ... más ramas
  }
  // ... aún más complejidad
}
```

**Refactorizar funciones complejas:**

```javascript
// ✅ CORRECTO: Funciones helper extraídas
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

### Principio DRY

```javascript
// ✅ CORRECTO: Función reutilizable
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

// ❌ INCORRECTO: Código repetido
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

## Estándares de Documentación

### Comentarios JSDoc

```javascript
/**
 * Carga y ejecuta un agente AIOS
 *
 * @param {string} agentId - Identificador único del agente
 * @param {Object} args - Argumentos de ejecución del agente
 * @param {boolean} args.yoloMode - Habilitar modo autónomo
 * @param {string} args.storyPath - Ruta al archivo de story (opcional)
 * @param {number} [timeout=5000] - Timeout de ejecución en milisegundos
 * @returns {Promise<Object>} Resultado de ejecución del agente
 * @throws {Error} Si el agente no se encuentra o la ejecución falla
 *
 * @example
 * const result = await executeAgent('dev', {
 *   yoloMode: true,
 *   storyPath: 'docs/stories/story-6.1.2.5.md'
 * });
 */
async function executeAgent(agentId, args, timeout = 5000) {
  // Implementación
}
```

### Comentarios en Línea

```javascript
// ✅ CORRECTO: Explicar el POR QUÉ, no el QUÉ
// Cache de agentes para evitar re-parsear YAML en cada activación (optimización de rendimiento)
const agentCache = new Map();

// Log de decisiones requerido para rollback en modo yolo (requisito Story 6.1.2.6)
if (yoloMode) {
  await createDecisionLog(storyId);
}

// ❌ INCORRECTO: Decir lo obvio
// Crear un nuevo Map
const agentCache = new Map();

// Si yolo mode es true
if (yoloMode) {
  await createDecisionLog(storyId);
}
```

### Archivos README

Cada módulo/directorio debería tener un README.md:

```markdown
# Agent Executor

**Propósito:** Carga y ejecuta agentes AIOS con gestión de configuración.

## Uso

\`\`\`javascript
const { executeAgent } = require('./agent-executor');

const result = await executeAgent('dev', {
yoloMode: true,
storyPath: 'docs/stories/story-6.1.2.5.md'
});
\`\`\`

## API

- `executeAgent(agentId, args, timeout)` - Ejecutar agente
- `loadAgent(agentId)` - Cargar configuración de agente

## Dependencias

- `yaml` - Parsing YAML
- `fs/promises` - Operaciones de sistema de archivos
```

---

## Estándares de Testing

### Nomenclatura de Archivos de Test

```bash
# Tests unitarios
tests/unit/context-detector.test.js
tests/unit/git-config-detector.test.js

# Tests de integración
tests/integration/contextual-greeting.test.js
tests/integration/workflow-navigation.test.js

# Tests E2E
tests/e2e/agent-activation.test.js
```

### Estructura de Tests

```javascript
// ✅ CORRECTO: Nombres descriptivos de tests con Given-When-Then
describe('ContextDetector', () => {
  describe('detectSessionType', () => {
    it('should return "new" when conversation history is empty', async () => {
      // Given
      const conversationHistory = [];
      const sessionFile = null;

      // When
      const result = await detectSessionType(conversationHistory, sessionFile);

      // Then
      expect(result).toBe('new');
    });

    it('should return "workflow" when command pattern matches story_development', async () => {
      // Given
      const conversationHistory = [{ command: 'validate-story-draft' }, { command: 'develop' }];

      // When
      const result = await detectSessionType(conversationHistory, null);

      // Then
      expect(result).toBe('workflow');
    });
  });
});
```

### Cobertura de Código

- **Mínimo:** 80% para todos los nuevos módulos
- **Objetivo:** 90% para módulos core
- **Crítico:** 100% para módulos de seguridad/validación

```bash
# Ejecutar cobertura
npm test -- --coverage

# Umbrales de cobertura en package.json
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

## Convenciones Git

### Mensajes de Commit

```bash
# ✅ CORRECTO: Formato Conventional Commits
feat: implement contextual agent greeting system [Story 6.1.2.5]
fix: resolve git config cache invalidation issue [Story 6.1.2.5]
docs: update coding standards with TypeScript config
chore: update ESLint configuration
refactor: extract greeting builder into separate module
test: add unit tests for WorkflowNavigator

# ❌ INCORRECTO: Vagos o no descriptivos
update files
fix bug
changes
wip
```

**Formato:**

```
<type>: <description> [Story <id>]

<optional body>

<optional footer>
```

**Tipos:**

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios de documentación
- `chore`: Cambios de build/tooling
- `refactor`: Refactorización de código (sin cambio funcional)
- `test`: Adiciones/modificaciones de tests
- `perf`: Mejoras de rendimiento
- `style`: Cambios de estilo de código (formateo, etc.)

### Nomenclatura de Ramas

```bash
# ✅ CORRECTO: Nombres descriptivos de ramas
feature/story-6.1.2.5-contextual-greeting
fix/git-config-cache-ttl
refactor/agent-executor-optimization
docs/update-coding-standards

# ❌ INCORRECTO: Nombres vagos de ramas
update
fix
my-branch
```

---

## Estándares de Seguridad

### Validación de Entrada

```javascript
// ✅ CORRECTO: Validar todas las entradas externas
function executeCommand(command) {
  // Validación de whitelist
  const allowedCommands = ['help', 'develop', 'review', 'deploy'];

  if (!allowedCommands.includes(command)) {
    throw new Error(`Invalid command: ${command}`);
  }

  return runCommand(command);
}

// ❌ INCORRECTO: Sin validación
function executeCommand(command) {
  return eval(command); // NUNCA HACER ESTO
}
```

### Protección contra Path Traversal

```javascript
// ✅ CORRECTO: Validar rutas de archivos
const path = require('path');

function loadFile(filePath) {
  const basePath = path.resolve(__dirname, '.aios-core');
  const resolvedPath = path.resolve(basePath, filePath);

  // Prevenir traversal de directorios
  if (!resolvedPath.startsWith(basePath)) {
    throw new Error('Invalid file path');
  }

  return fs.readFile(resolvedPath, 'utf8');
}

// ❌ INCORRECTO: Uso directo de ruta
function loadFile(filePath) {
  return fs.readFile(filePath, 'utf8'); // Vulnerable a ../../../etc/passwd
}
```

### Gestión de Secretos

```javascript
// ✅ CORRECTO: Usar variables de entorno
const apiKey = process.env.CLICKUP_API_KEY;

if (!apiKey) {
  throw new Error('CLICKUP_API_KEY environment variable not set');
}

// ❌ INCORRECTO: Secretos hardcodeados
const apiKey = 'pk_12345678_abcdefgh'; // NUNCA HACER ESTO
```

### Seguridad de Dependencias

```bash
# Auditorías de seguridad regulares
npm audit
npm audit fix

# Usar Snyk o similar para monitoreo continuo
```

---

## Aplicación

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

### Integración CodeRabbit

Todos los PRs son revisados automáticamente por CodeRabbit para:

- Problemas de calidad de código
- Vulnerabilidades de seguridad
- Problemas de rendimiento
- Violaciones de mejores prácticas
- Brechas de cobertura de tests

---

## Historial de Versiones

| Versión | Fecha      | Cambios                                                          | Autor            |
| ------- | ---------- | ---------------------------------------------------------------- | ---------------- |
| 1.0     | 2025-01-15 | Documento inicial de estándares de codificación                  | Aria (architect) |
| 1.1     | 2025-12-14 | Actualizado aviso de migración a SynkraAI/aios-core [Story 6.10] | Dex (dev)        |

---

**Documentos Relacionados:**

- [Stack Tecnológico](./tech-stack.md)
- [Árbol de Código Fuente](./source-tree.md)

---

_Este es un estándar oficial del framework AIOS. Todas las contribuciones de código deben cumplir._
