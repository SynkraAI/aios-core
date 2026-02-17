<!--
  Traducción: ES
  Original: /docs/en/framework/tech-stack.md
  Última sincronización: 2026-01-26
-->

# Stack Tecnológico de AIOS

> 🌐 [EN](../../framework/tech-stack.md) | [PT](../../pt/framework/tech-stack.md) | **ES**

---

**Versión:** 1.1
**Última Actualización:** 2025-12-14
**Estado:** Estándar Oficial del Framework
**Aviso de Migración:** Este documento migrará al repositorio `SynkraAI/aios-core` en Q2 2026 (ver Decision 005)

---

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Runtime Principal](#runtime-principal)
- [Lenguajes y Transpiladores](#lenguajes-y-transpiladores)
- [Dependencias Principales](#dependencias-principales)
- [Herramientas de Desarrollo](#herramientas-de-desarrollo)
- [Framework de Testing](#framework-de-testing)
- [Build y Deployment](#build-y-deployment)
- [Integraciones Externas](#integraciones-externas)
- [Stack Futuro (Post-Migración)](#stack-futuro-post-migración)

---

## Descripción General

AIOS está construido sobre JavaScript/TypeScript moderno con runtime Node.js, optimizado para desarrollo CLI multiplataforma con UX interactiva y capacidades de orquestación de agentes.

**Filosofía:**

- Preferir **tecnología aburrida** cuando sea posible (dependencias probadas y estables)
- Elegir **tecnología emocionante** solo cuando sea necesario (mejoras de rendimiento, mejoras de DX)
- Minimizar dependencias (reducir riesgo de cadena de suministro)
- Multiplataforma primero (Windows, macOS, Linux)

---

## Runtime Principal

### Node.js

```yaml
Version: 18.0.0+
LTS: Yes (Active LTS until April 2025)
Reason: Stable async/await, fetch API, ES2022 support
```

**¿Por qué Node.js 18+?**

- API nativa `fetch()` (no necesita axios/node-fetch)
- Soporte de módulos ES2022 (top-level await)
- V8 10.2+ (mejoras de rendimiento)
- Soporte LTS activo (parches de seguridad)
- Multiplataforma (Windows/macOS/Linux)

**Gestor de Paquetes:**

```yaml
Primary: npm 9.0.0+
Alternative: yarn/pnpm (user choice)
Lock File: package-lock.json
```

---

## Lenguajes y Transpiladores

### JavaScript (Principal)

```yaml
Standard: ES2022
Module System: CommonJS (require/module.exports)
Future: ESM migration planned (Story 6.2.x)
```

**¿Por qué ES2022?**

- Campos de clase y métodos privados
- Top-level await
- Error cause
- Método Array.at()
- Object.hasOwn()

### TypeScript (Definiciones de Tipos)

```yaml
Version: 5.9.3
Usage: Type definitions only (.d.ts files)
Compilation: Not used (pure JS runtime)
Future: Full TypeScript migration considered for Q2 2026
```

**Uso Actual de TypeScript:**

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

**Configuración de TypeScript:**

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

## Dependencias Principales

### CLI y UX Interactiva

#### @clack/prompts (^0.11.0)

**Propósito:** Prompts CLI modernos con UX hermosa
**Uso:** Wizard interactivo, recolección de entrada del usuario
**Por qué:** UX de primera clase, animaciones de spinner, barras de progreso

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

**Propósito:** Estilizado de strings en terminal
**Uso:** Salida con colores, formateo
**Por qué:** Multiplataforma, sin dependencias, API estable

```javascript
const chalk = require('chalk');
console.log(chalk.green('✅ Agent activated successfully'));
console.log(chalk.red('❌ Task failed'));
```

#### picocolors (^1.1.1)

**Propósito:** Biblioteca de colores ligera (alternativa más rápida a chalk)
**Uso:** Salida de colores crítica para rendimiento
**Por qué:** 14x más pequeño que chalk, 2x más rápido

```javascript
const pc = require('picocolors');
console.log(pc.green('✅ Fast output'));
```

#### ora (^5.4.1)

**Propósito:** Spinners de terminal
**Uso:** Indicadores de carga, operaciones asíncronas
**Por qué:** Spinners hermosos, personalizables, ampliamente utilizado

```javascript
const ora = require('ora');
const spinner = ora('Loading agent...').start();
await loadAgent();
spinner.succeed('Agent loaded');
```

### Operaciones de Sistema de Archivos y Rutas

#### fs-extra (^11.3.2)

**Propósito:** Operaciones mejoradas del sistema de archivos
**Uso:** Copia de archivos, creación de directorios, lectura/escritura JSON
**Por qué:** Basado en promesas, utilidades adicionales sobre `fs` nativo

```javascript
const fs = require('fs-extra');
await fs.copy('source', 'dest');
await fs.ensureDir('path/to/dir');
await fs.outputJson('config.json', data);
```

#### glob (^11.0.3)

**Propósito:** Coincidencia de patrones de archivos
**Uso:** Encontrar archivos por patrones (ej. `*.md`, `**/*.yaml`)
**Por qué:** Rápido, soporta patrones gitignore

```javascript
const { glob } = require('glob');
const stories = await glob('docs/stories/**/*.md');
```

### Procesamiento YAML

#### yaml (^2.8.1)

**Propósito:** Parsing y serialización YAML
**Uso:** Configuraciones de agentes, workflows, templates
**Por qué:** Rápido, cumple con especificaciones, preserva comentarios

```javascript
const YAML = require('yaml');
const agent = YAML.parse(fs.readFileSync('agent.yaml', 'utf8'));
```

#### js-yaml (^4.1.0)

**Propósito:** Parser YAML alternativo (soporte legacy)
**Uso:** Parsing de archivos YAML antiguos
**Por qué:** API diferente, usado en código legacy

```javascript
const yaml = require('js-yaml');
const doc = yaml.load(fs.readFileSync('config.yaml', 'utf8'));
```

**Nota de Migración:** Consolidar a una sola biblioteca YAML (Story 6.2.x)

### Procesamiento Markdown

#### @kayvan/markdown-tree-parser (^1.5.0)

**Propósito:** Parsear markdown a AST
**Uso:** Parsing de stories, análisis de estructura de documentos
**Por qué:** Ligero, rápido, soporta GFM

```javascript
const { parseMarkdown } = require('@kayvan/markdown-tree-parser');
const ast = parseMarkdown(markdownContent);
```

### Ejecución de Procesos

#### execa (^9.6.0)

**Propósito:** Mejor child_process
**Uso:** Ejecutar git, npm, herramientas CLI externas
**Por qué:** Multiplataforma, basado en promesas, mejor manejo de errores

```javascript
const { execa } = require('execa');
const { stdout } = await execa('git', ['status']);
```

### Parsing de Línea de Comandos

#### commander (^14.0.1)

**Propósito:** Framework CLI
**Uso:** Parsing de argumentos de línea de comandos, subcomandos
**Por qué:** Estándar de la industria, características ricas, soporte TypeScript

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

**Propósito:** Prompts interactivos de línea de comandos
**Uso:** Recolección de entrada del usuario, wizards
**Por qué:** Tipos de prompt ricos, soporte de validación

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

### Sandboxing y Seguridad

#### isolated-vm (^5.0.4)

**Propósito:** V8 isolate para ejecución JavaScript sandboxed
**Uso:** Ejecución segura de scripts de usuario, ejecución de tareas
**Por qué:** Aislamiento de seguridad, límites de memoria, control de timeout

```javascript
const ivm = require('isolated-vm');
const isolate = new ivm.Isolate({ memoryLimit: 128 });
const context = await isolate.createContext();
```

### Validación

#### validator (^13.15.15)

**Propósito:** Validadores y sanitizadores de strings
**Uso:** Validación de entrada (URLs, emails, etc.)
**Por qué:** Completo, bien probado, sin dependencias

```javascript
const validator = require('validator');
if (validator.isURL(url)) {
  // Valid URL
}
```

#### semver (^7.7.2)

**Propósito:** Parser y comparador de versionado semántico
**Uso:** Verificación de versiones, resolución de dependencias
**Por qué:** Estándar NPM, probado en batalla

```javascript
const semver = require('semver');
if (semver.satisfies('1.2.3', '>=1.0.0')) {
  // Version compatible
}
```

---

## Herramientas de Desarrollo

### Linting

#### ESLint (^9.38.0)

**Propósito:** Linter JavaScript/TypeScript
**Configuración:** `.eslintrc.json`
**Plugins:**

- `@typescript-eslint/eslint-plugin` (^8.46.2)
- `@typescript-eslint/parser` (^8.46.2)

**Reglas Clave:**

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

### Formateo

#### Prettier (^3.5.3)

**Propósito:** Formateador de código
**Configuración:** `.prettierrc`

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

**Propósito:** Linter de archivos YAML
**Uso:** Validar configuraciones de agentes, workflows, templates

### Git Hooks

#### husky (^9.1.7)

**Propósito:** Gestión de hooks de Git
**Uso:** Linting pre-commit, tests pre-push

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

**Propósito:** Ejecutar linters en archivos staged
**Configuración:**

```json
{
  "lint-staged": {
    "**/*.md": ["prettier --write"],
    "**/*.{js,ts}": ["eslint --fix", "prettier --write"]
  }
}
```

---

## Framework de Testing

### Jest (^30.2.0)

**Propósito:** Framework de testing
**Uso:** Tests unitarios, tests de integración, cobertura

```javascript
// Example test
describe('AgentExecutor', () => {
  it('should load agent configuration', async () => {
    const agent = await loadAgent('dev');
    expect(agent.name).toBe('developer');
  });
});
```

**Configuración:**

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

**Propósito:** Definiciones de tipos TypeScript para Jest
**Uso:** Escritura de tests con tipos seguros

---

## Build y Deployment

### Versionado y Release

#### semantic-release (^25.0.2)

**Propósito:** Versionado semántico automatizado y releases
**Uso:** Publicación automática a NPM, generación de changelog

**Plugins:**

- `@semantic-release/changelog` (^6.0.3) - Generar CHANGELOG.md
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

## Integraciones Externas

### Servidores MCP

AIOS se integra con servidores Model Context Protocol (MCP):

```yaml
MCP Servers:
  - clickup-direct: ClickUp integration (task management)
  - context7: Documentation lookup
  - exa-direct: Web search
  - desktop-commander: File operations
  - docker-mcp: Docker management
  - ide: VS Code/Cursor integration
```

**Configuración:** `.claude.json` o `.cursor/settings.json`

### Herramientas CLI

Herramientas CLI externas usadas por agentes:

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

### Servicios Cloud

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

## Stack Futuro (Post-Migración)

**Planificado para Q2-Q4 2026** (después de la reestructuración del repositorio):

### Migración ESM

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

### Herramientas de Build

```yaml
Bundler: esbuild or tsup
Reason: Fast builds, tree-shaking, minification
Target: Single executable CLI (optional)
```

### Mejoras de Testing

```yaml
E2E Testing: Playwright (browser automation tests)
Performance Testing: Benchmark.js (workflow timing)
```

---

## Gestión de Dependencias

### Auditorías de Seguridad

```bash
# Run security audit
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Check for outdated packages
npm outdated
```

### Política de Actualizaciones

```yaml
Major Updates: Quarterly review (Q1, Q2, Q3, Q4)
Security Patches: Immediate (within 48 hours)
Minor Updates: Monthly review
Dependency Reduction: Ongoing effort
```

### Árbol de Dependencias

```bash
# View dependency tree
npm ls --depth=2

# Find duplicate packages
npm dedupe

# Analyze bundle size
npx cost-of-modules
```

---

## Matriz de Compatibilidad de Versiones

| Componente       | Versión | Compatibilidad | Notas                    |
| ---------------- | ------- | -------------- | ------------------------ |
| **Node.js**      | 18.0.0+ | Requerido      | LTS Activo               |
| **npm**          | 9.0.0+  | Requerido      | Gestor de paquetes       |
| **TypeScript**   | 5.9.3   | Recomendado    | Definiciones de tipos    |
| **ESLint**       | 9.38.0  | Requerido      | Linting                  |
| **Prettier**     | 3.5.3   | Requerido      | Formateo                 |
| **Jest**         | 30.2.0  | Requerido      | Testing                  |
| **Git**          | 2.30+   | Requerido      | Control de versiones     |
| **GitHub CLI**   | 2.x+    | Opcional       | Gestión de repositorio   |
| **Railway CLI**  | 3.x+    | Opcional       | Deployment               |
| **Supabase CLI** | 1.x+    | Opcional       | Gestión de base de datos |

---

## Consideraciones de Rendimiento

### Tamaño del Bundle

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

### Tiempo de Arranque

```yaml
Cold Start: ~200ms (initial load)
Warm Start: ~50ms (cached modules)
Yolo Mode: ~100ms (skip validation)

Optimization Strategy:
  - Lazy load heavy dependencies
  - Cache parsed YAML configs
  - Use require() conditionally
```

### Uso de Memoria

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

## Variables de Entorno

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

- [Estándares de Codificación](./coding-standards.md)
- [Árbol de Código Fuente](./source-tree.md)

---

## Historial de Versiones

| Versión | Fecha      | Cambios                                                                                      | Autor            |
| ------- | ---------- | -------------------------------------------------------------------------------------------- | ---------------- |
| 1.0     | 2025-01-15 | Documentación inicial del stack tecnológico                                                  | Aria (architect) |
| 1.1     | 2025-12-14 | Actualizado aviso de migración a SynkraAI/aios-core, semantic-release a v25.0.2 [Story 6.10] | Dex (dev)        |

---

_Este es un estándar oficial del framework AIOS. Todas las elecciones tecnológicas deben alinearse con este stack._
