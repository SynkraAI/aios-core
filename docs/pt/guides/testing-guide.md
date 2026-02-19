# Guia de Testes do Synkra AIOS

> [EN](../../guides/testing-guide.md) | **PT** | [ES](../../es/guides/testing-guide.md)

---

> Guia completo sobre a estratégia de testes, ferramentas e melhores práticas do Synkra AIOS.

**Versão:** 2.1.0
**Última Atualização:** 2026-01-29

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Estratégia de Testes](#estratégia-de-testes)
3. [Testes Unitários](#testes-unitários)
4. [Testes de Integração](#testes-de-integração)
5. [Testes End-to-End](#testes-end-to-end)
6. [Testes de Agentes](#testes-de-agentes)
7. [Testes Cross-Platform](#testes-cross-platform)
8. [Cobertura e Métricas](#cobertura-e-métricas)
9. [Integração CI/CD](#integração-cicd)
10. [Escrevendo Bons Testes](#escrevendo-bons-testes)
11. [Mocking e Fixtures](#mocking-e-fixtures)
12. [Referência de Comandos NPM](#referência-de-comandos-npm)
13. [Resolução de Problemas](#resolução-de-problemas)

---

## Visão Geral

O AIOS segue uma estratégia abrangente de testes que garante qualidade de código em todas as camadas do framework. Nossa filosofia de testes é baseada em:

- **Test-Driven Development (TDD)** para funcionalidades core
- **Testes em Camadas** com testes unitários, de integração e E2E
- **Verificação Cross-Platform** para Windows, macOS e Linux
- **Testes Específicos de Agentes** para comportamentos de agentes de IA
- **Quality Gates Automatizados** integrados com CI/CD

### Pirâmide de Testes

```
                    ┌─────────────┐
                    │     E2E     │  ← Poucos, Lentos, Caros
                    │   Tests     │
                    ├─────────────┤
                    │ Integration │  ← Alguns, Velocidade Média
                    │   Tests     │
                    ├─────────────┤
                    │    Unit     │  ← Muitos, Rápidos, Baratos
                    │   Tests     │
                    └─────────────┘
```

| Camada      | Quantidade | Velocidade | Meta de Cobertura    |
| ----------- | ---------- | ---------- | -------------------- |
| Unitários   | 100+       | < 30s      | 80%+ de linhas       |
| Integração  | 30-50      | 1-5m       | Caminhos críticos    |
| E2E         | 10-20      | 5-15m      | Fluxos de usuário    |

---

## Estratégia de Testes

### Estrutura de Diretórios

```
tests/
├── unit/                    # Testes unitários
│   ├── quality-gates/       # Componentes de quality gate
│   ├── squad/               # Testes do sistema de squads
│   ├── mcp/                 # Testes de configuração MCP
│   ├── manifest/            # Testes de manipulação de manifest
│   └── documentation-integrity/  # Testes do gerador de docs
├── integration/             # Testes de integração
│   ├── squad/               # Integração do squad designer
│   ├── windows/             # Testes específicos do Windows
│   └── *.test.js            # Testes gerais de integração
├── e2e/                     # Testes end-to-end
│   └── story-creation-clickup.test.js
├── performance/             # Benchmarks de performance
│   ├── decision-logging-benchmark.test.js
│   └── tools-system-benchmark.test.js
├── security/                # Testes de segurança
│   └── core-security.test.js
├── health-check/            # Testes do sistema de health check
│   ├── engine.test.js
│   └── healers.test.js
├── regression/              # Testes de regressão
│   └── tools-migration.test.js
├── setup.js                 # Setup global de testes
└── fixtures/                # Fixtures e mocks de teste
```

### Convenção de Nomenclatura de Testes

| Tipo        | Padrão                        | Exemplo                              |
| ----------- | ----------------------------- | ------------------------------------ |
| Unitário    | `*.test.js` ou `*.spec.js`    | `greeting-builder.test.js`           |
| Integração  | `*.test.js` em `integration/` | `contextual-greeting.test.js`        |
| E2E         | `*.test.js` em `e2e/`         | `story-creation-clickup.test.js`     |
| Benchmark   | `*-benchmark.test.js`         | `decision-logging-benchmark.test.js` |

---

## Testes Unitários

Testes unitários verificam funções e classes individuais de forma isolada.

### Configuração (jest.config.js)

```javascript
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',

  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
    '**/.aios-core/**/__tests__/**/*.test.js',
  ],

  testTimeout: 30000,
  verbose: true,

  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  coverageThreshold: {
    global: {
      branches: 25,
      functions: 30,
      lines: 30,
      statements: 30,
    },
    '.aios-core/core/': {
      lines: 45,
    },
  },
};
```

### Escrevendo Testes Unitários

```javascript
/**
 * Testes Unitários do Quality Gate Manager
 *
 * @story 2.10 - Quality Gate Manager
 */

const {
  QualityGateManager,
} = require('../../../.aios-core/core/quality-gates/quality-gate-manager');

describe('QualityGateManager', () => {
  let manager;

  beforeEach(() => {
    manager = new QualityGateManager({
      layer1: { enabled: true },
      layer2: { enabled: true },
      layer3: { enabled: true },
    });
  });

  describe('constructor', () => {
    it('deve criar manager com config padrão', () => {
      const defaultManager = new QualityGateManager();
      expect(defaultManager).toBeDefined();
      expect(defaultManager.layers).toBeDefined();
    });

    it('deve criar manager com config personalizada', () => {
      const customManager = new QualityGateManager({
        layer1: { enabled: false },
      });
      expect(customManager.layers.layer1.enabled).toBe(false);
    });
  });

  describe('runLayer', () => {
    it('deve lançar erro para número de camada inválido', async () => {
      await expect(manager.runLayer(4)).rejects.toThrow('Invalid layer number: 4');
    });
  });

  describe('formatDuration', () => {
    it('deve formatar milissegundos', () => {
      expect(manager.formatDuration(500)).toBe('500ms');
    });

    it('deve formatar segundos', () => {
      expect(manager.formatDuration(5000)).toBe('5.0s');
    });

    it('deve formatar minutos', () => {
      expect(manager.formatDuration(120000)).toBe('2.0m');
    });
  });
});
```

### Melhores Práticas de Organização de Testes

```javascript
describe('ComponentName', () => {
  // Setup e teardown
  beforeAll(() => {
    /* Setup global */
  });
  afterAll(() => {
    /* Limpeza global */
  });
  beforeEach(() => {
    /* Setup por teste */
  });
  afterEach(() => {
    /* Limpeza por teste */
  });

  // Agrupar por método/funcionalidade
  describe('methodName', () => {
    it('deve tratar entrada válida', () => {});
    it('deve lançar erro com entrada inválida', () => {});
    it('deve tratar casos extremos', () => {});
  });

  describe('outro método', () => {
    // Mais testes...
  });
});
```

---

## Testes de Integração

Testes de integração verificam se múltiplos componentes funcionam corretamente juntos.

### Setup para Testes de Integração

```javascript
// tests/setup.js
process.env.NODE_ENV = 'test';
process.env.AIOS_DEBUG = 'false';

// Pular testes de integração por padrão
if (process.env.SKIP_INTEGRATION_TESTS === undefined) {
  process.env.SKIP_INTEGRATION_TESTS = 'true';
}

// Timeout global de teste (aumentado para CI)
jest.setTimeout(process.env.CI ? 30000 : 10000);

// Helper para pular testes de integração condicionalmente
global.describeIntegration =
  process.env.SKIP_INTEGRATION_TESTS === 'true' ? describe.skip : describe;

global.testIntegration = process.env.SKIP_INTEGRATION_TESTS === 'true' ? test.skip : test;
```

### Escrevendo Testes de Integração

```javascript
/**
 * Testes de Integração para Sistema de Saudação Contextual
 *
 * Testes end-to-end de:
 * - Todos os 3 tipos de sessão
 * - Git configurado vs não configurado
 * - Filtragem de visibilidade de comandos
 * - Cenários de fallback
 */

const GreetingBuilder = require('../../.aios-core/development/scripts/greeting-builder');

describe('Testes de Integração de Saudação Contextual', () => {
  let builder;

  beforeEach(() => {
    builder = new GreetingBuilder();
  });

  describeIntegration('Geração de Saudação End-to-End', () => {
    test('deve gerar saudação completa para nova sessão', async () => {
      const greeting = await builder.build({
        sessionType: 'new',
        agent: 'dev',
        gitConfigured: true,
      });

      expect(greeting).toContain('Welcome');
      expect(greeting).toContain('Quick Commands');
    });

    test('deve tratar git não configurado graciosamente', async () => {
      const greeting = await builder.build({
        sessionType: 'new',
        agent: 'dev',
        gitConfigured: false,
      });

      expect(greeting).not.toContain('git commit');
    });
  });
});
```

### Executando Testes de Integração

```bash
# Executar todos os testes incluindo integração
SKIP_INTEGRATION_TESTS=false npm test

# Executar apenas testes de integração
npm test -- --testPathPattern=integration

# Executar teste de integração específico
npm test -- tests/integration/contextual-greeting.test.js
```

---

## Testes End-to-End

Testes E2E verificam fluxos completos de usuário do início ao fim.

### Estrutura de Teste E2E

```javascript
/**
 * Teste E2E: Criação de Story com ClickUp
 *
 * Testa o fluxo completo:
 * 1. Usuário inicia criação de story
 * 2. Story é gerada a partir de template
 * 3. Story é sincronizada com ClickUp
 * 4. Arquivo local é atualizado com ID do ClickUp
 */

describe('Story Creation E2E', () => {
  const TEST_PROJECT = 'test-project';

  beforeAll(async () => {
    // Configurar ambiente de teste
    await setupTestProject(TEST_PROJECT);
  });

  afterAll(async () => {
    // Limpar artefatos de teste
    await cleanupTestProject(TEST_PROJECT);
  });

  test('deve criar story e sincronizar com ClickUp', async () => {
    // Passo 1: Criar story
    const story = await createStory({
      title: 'Test Story',
      type: 'feature',
    });

    expect(story.id).toBeDefined();
    expect(story.file).toMatch(/\.md$/);

    // Passo 2: Verificar sincronização com ClickUp
    const clickupTask = await getClickUpTask(story.clickupId);
    expect(clickupTask.name).toBe('Test Story');

    // Passo 3: Verificar atualização do arquivo local
    const localContent = await readFile(story.file);
    expect(localContent).toContain(story.clickupId);
  }, 60000); // Timeout estendido para E2E
});
```

### Melhores Práticas de Testes E2E

| Prática                    | Descrição                                         |
| -------------------------- | ------------------------------------------------- |
| **Ambiente Isolado**       | Cada teste E2E deve ter seus próprios dados       |
| **Limpeza Explícita**      | Sempre limpar recursos criados                    |
| **Timeouts Estendidos**    | Testes E2E precisam de timeouts maiores (30-60s)  |
| **Serviços Reais**         | Usar serviços reais, não mocks                    |
| **Idempotente**            | Testes devem ser repetíveis                       |

---

## Testes de Agentes

Testar agentes de IA requer considerações especiais para comportamento de persona e execução de comandos.

### Categorias de Testes de Agentes

| Categoria         | Testa                   | Propósito                              |
| ----------------- | ----------------------- | -------------------------------------- |
| **Persona**       | Estilo de resposta, tom | Verificar se agente mantém personagem  |
| **Comandos**      | Execução de tarefas     | Verificar se comandos funcionam        |
| **Fallback**      | Tratamento de erros     | Verificar degradação graciosa          |
| **Compatibilidade** | Suporte legado        | Verificar se agentes antigos funcionam |

### Testes de Compatibilidade de Agentes

```javascript
/**
 * Testes de Compatibilidade Retroativa de Agentes
 *
 * Garante que agentes de versões anteriores do AIOS continuem funcionando.
 */

const { loadAgent } = require('../../.aios-core/core/registry/agent-loader');

describe('Compatibilidade Retroativa de Agentes', () => {
  describe('Formato de Agente Legado (v1.x)', () => {
    test('deve carregar agente sem metadados de visibilidade', async () => {
      const agent = await loadAgent('legacy-agent-v1');

      expect(agent).toBeDefined();
      expect(agent.name).toBeDefined();
      expect(agent.commands).toBeDefined();
    });

    test('deve aplicar visibilidade padrão quando ausente', async () => {
      const agent = await loadAgent('legacy-agent-v1');

      // Visibilidade padrão deve ser aplicada
      agent.commands.forEach((cmd) => {
        expect(cmd.visibility).toBeDefined();
      });
    });
  });

  describe('Formato de Agente Atual (v2.x)', () => {
    test('deve carregar agente com metadados completos', async () => {
      const agent = await loadAgent('dev');

      expect(agent.slashPrefix).toBeDefined();
      expect(agent.icon).toBeDefined();
      expect(agent.persona).toBeDefined();
    });
  });
});
```

### Testando Comandos de Agentes

```javascript
describe('Comandos de Agentes', () => {
  let agent;

  beforeAll(async () => {
    agent = await activateAgent('dev');
  });

  test('*help deve exibir comandos disponíveis', async () => {
    const result = await agent.executeCommand('*help');

    expect(result.output).toContain('Available Commands');
    expect(result.exitCode).toBe(0);
  });

  test('*create-story deve validar campos obrigatórios', async () => {
    await expect(agent.executeCommand('*create-story')).rejects.toThrow(
      'Missing required field: title'
    );
  });
});
```

---

## Testes Cross-Platform

O AIOS suporta Windows, macOS e Linux. Testes cross-platform garantem comportamento consistente.

### Arquivos de Teste Específicos por Plataforma

```
tests/
├── integration/
│   ├── windows/
│   │   └── shell-compat.test.js    # Testes de shell Windows
│   ├── macos/
│   │   └── permission.test.js      # Testes de permissão macOS
│   └── linux/
│       └── symlink.test.js         # Testes de symlink Linux
```

### Utilitários de Teste Cross-Platform

```javascript
/**
 * Utilitários de teste cross-platform
 */

const os = require('os');
const path = require('path');

const isWindows = process.platform === 'win32';
const isMacOS = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

// describe específico por plataforma
const describeWindows = isWindows ? describe : describe.skip;
const describeMacOS = isMacOS ? describe : describe.skip;
const describeLinux = isLinux ? describe : describe.skip;

// Normalizar separadores de path para asserções
function normalizePath(p) {
  return p.replace(/\\/g, '/');
}

// Obter diretório temporário apropriado para a plataforma
function getTempDir() {
  return path.join(os.tmpdir(), 'aios-tests');
}

module.exports = {
  isWindows,
  isMacOS,
  isLinux,
  describeWindows,
  describeMacOS,
  describeLinux,
  normalizePath,
  getTempDir,
};
```

### Testes Específicos do Windows

```javascript
/**
 * Testes de Compatibilidade de Shell Windows
 */

const { describeWindows } = require('../utils/platform');

describeWindows('Compatibilidade de Shell Windows', () => {
  test('deve tratar separadores de path do Windows', () => {
    const path = 'C:\\Users\\test\\project';
    const normalized = normalizePath(path);

    expect(normalized).toBe('C:/Users/test/project');
  });

  test('deve executar comandos PowerShell', async () => {
    const result = await executeShell('Get-Location', { shell: 'powershell' });

    expect(result.exitCode).toBe(0);
  });

  test('deve tratar fallback para cmd.exe', async () => {
    const result = await executeShell('dir', { shell: 'cmd' });

    expect(result.exitCode).toBe(0);
  });
});
```

### Configuração de Matrix CI

```yaml
# .github/workflows/test.yml
name: Testes Cross-Platform

on: [push, pull_request]

jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [18, 20, 22]

    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      - run: npm ci
      - run: npm test

      - name: Executar Testes Específicos de Plataforma
        run: npm run test:platform
```

---

## Cobertura e Métricas

### Configuração de Cobertura

```javascript
// jest.config.js - Seção de cobertura
module.exports = {
  collectCoverageFrom: [
    'src/**/*.js',
    '.aios-core/**/*.js',
    'bin/**/*.js',
    'packages/**/*.js',
    'scripts/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**',
    '!**/__tests__/**',
    '!**/*.test.js',
    '!**/*.spec.js',
    // Excluir templates e arquivos gerados
    '!.aios-core/development/templates/**',
    '!.aios-core/product/templates/**',
    '!**/dist/**',
    // Excluir módulos com I/O pesado (melhor para testes de integração)
    '!.aios-core/core/health-check/checks/**',
    '!.aios-core/core/config/**',
    '!.aios-core/core/manifest/**',
    '!.aios-core/core/registry/**',
    '!.aios-core/core/utils/**',
  ],

  coverageThreshold: {
    global: {
      branches: 25,
      functions: 30,
      lines: 30,
      statements: 30,
    },
    '.aios-core/core/': {
      lines: 45,
    },
  },

  coveragePathIgnorePatterns: ['/node_modules/', '/coverage/', '/.husky/', '/dist/'],
};
```

### Metas de Cobertura

| Módulo            | Meta   | Atual | Notas               |
| ----------------- | ------ | ----- | ------------------- |
| **Global**        | 30%    | ~31%  | Baseline mínimo     |
| **Core**          | 45%    | ~47%  | Lógica de negócios  |
| **Quality Gates** | 80%    | TBD   | Caminho crítico     |
| **Squad System**  | 70%    | TBD   | Voltado ao usuário  |

### Visualizando Relatórios de Cobertura

```bash
# Gerar relatório de cobertura
npm run test:coverage

# Abrir relatório HTML (macOS)
open coverage/lcov-report/index.html

# Abrir relatório HTML (Windows)
start coverage/lcov-report/index.html

# Abrir relatório HTML (Linux)
xdg-open coverage/lcov-report/index.html
```

### Estrutura do Relatório de Cobertura

```
coverage/
├── lcov-report/          # Relatório HTML
│   ├── index.html        # Visão geral
│   └── .aios-core/       # Cobertura por módulo
├── lcov.info             # Formato LCOV (para CI)
├── coverage-summary.json # Resumo em JSON
└── clover.xml            # Formato Clover
```

---

## Integração CI/CD

### Workflow do GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    name: Testes Unitários
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Instalar dependências
        run: npm ci

      - name: Executar testes unitários
        run: npm test

      - name: Upload de cobertura
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true

  integration-tests:
    name: Testes de Integração
    runs-on: ubuntu-latest
    needs: unit-tests

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Instalar dependências
        run: npm ci

      - name: Executar testes de integração
        run: SKIP_INTEGRATION_TESTS=false npm test -- --testPathPattern=integration
        env:
          CLICKUP_API_KEY: ${{ secrets.CLICKUP_API_KEY }}

  quality-gate:
    name: Quality Gate
    runs-on: ubuntu-latest
    needs: [unit-tests, integration-tests]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - run: npm ci

      - name: Lint
        run: npm run lint

      - name: TypeCheck
        run: npm run typecheck

      - name: Threshold de cobertura
        run: npm run test:coverage -- --coverageReporters=text-summary
```

### Hook Pre-commit

```bash
#!/bin/sh
# .husky/pre-commit

# Executar lint-staged
npx lint-staged

# Executar testes unitários rápidos
npm test -- --passWithNoTests --testPathIgnorePatterns=integration,e2e
```

### Integração com Quality Gate

O Sistema de Quality Gate do AIOS (veja [Guia de Quality Gates](./quality-gates.md)) integra testes em múltiplas camadas:

| Camada      | Tipo de Teste                 | Quando          |
| ----------- | ----------------------------- | --------------- |
| **Layer 1** | Unitário + Lint + TypeCheck   | Pre-commit      |
| **Layer 2** | Integração + Revisão de IA    | Criação de PR   |
| **Layer 3** | E2E + Revisão Humana          | Antes do merge  |

---

## Escrevendo Bons Testes

### Estrutura de Teste (Padrão AAA)

```javascript
test('deve calcular preço total com desconto', () => {
  // Arrange - Configurar dados e condições de teste
  const cart = new ShoppingCart();
  cart.addItem({ name: 'Widget', price: 100 });
  cart.addItem({ name: 'Gadget', price: 50 });
  const discount = 0.1; // 10% de desconto

  // Act - Executar o código em teste
  const total = cart.calculateTotal(discount);

  // Assert - Verificar os resultados
  expect(total).toBe(135); // (100 + 50) * 0.9
});
```

### Diretrizes de Nomenclatura de Testes

| Ruim              | Bom                                                        |
| ----------------- | ---------------------------------------------------------- |
| `test('test1')`   | `test('deve retornar null para entrada vazia')`            |
| `test('works')`   | `test('deve calcular imposto corretamente')`               |
| `test('error')`   | `test('deve lançar ValidationError para email inválido')`  |

### Casos Extremos a Testar

```javascript
describe('validateEmail', () => {
  // Caminho feliz
  test('deve aceitar email válido', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  // Casos extremos
  test('deve rejeitar string vazia', () => {
    expect(validateEmail('')).toBe(false);
  });

  test('deve rejeitar null', () => {
    expect(validateEmail(null)).toBe(false);
  });

  test('deve rejeitar undefined', () => {
    expect(validateEmail(undefined)).toBe(false);
  });

  // Condições de fronteira
  test('deve aceitar email com parte local de um caractere', () => {
    expect(validateEmail('a@example.com')).toBe(true);
  });

  test('deve rejeitar email sem símbolo @', () => {
    expect(validateEmail('userexample.com')).toBe(false);
  });

  // Caracteres especiais
  test('deve aceitar email com sinal de mais', () => {
    expect(validateEmail('user+tag@example.com')).toBe(true);
  });
});
```

### Padrões de Testes Assíncronos

```javascript
// Usando async/await (recomendado)
test('deve buscar dados do usuário', async () => {
  const user = await fetchUser(123);
  expect(user.name).toBe('John');
});

// Testando rejeição de promise
test('deve rejeitar para usuário inexistente', async () => {
  await expect(fetchUser(999)).rejects.toThrow('User not found');
});

// Testando com callback done (legado)
test('deve fazer callback com dados', (done) => {
  fetchUserCallback(123, (err, user) => {
    expect(err).toBeNull();
    expect(user.name).toBe('John');
    done();
  });
});
```

### Isolamento de Testes

```javascript
describe('FileManager', () => {
  let tempDir;
  let fileManager;

  beforeEach(async () => {
    // Criar diretório temporário isolado para cada teste
    tempDir = await createTempDir();
    fileManager = new FileManager(tempDir);
  });

  afterEach(async () => {
    // Limpar após cada teste
    await removeTempDir(tempDir);
  });

  test('deve criar arquivo', async () => {
    await fileManager.write('test.txt', 'content');
    const exists = await fileManager.exists('test.txt');
    expect(exists).toBe(true);
  });

  test('não deve ver arquivos de outros testes', async () => {
    // Este teste inicia com um diretório limpo
    const files = await fileManager.list();
    expect(files).toHaveLength(0);
  });
});
```

---

## Mocking e Fixtures

### Básico de Mocking com Jest

```javascript
// Mock de um módulo
jest.mock('fs-extra');
const fs = require('fs-extra');

// Implementação de mock
fs.readFile.mockResolvedValue('file content');
fs.writeFile.mockResolvedValue(undefined);

// Valor de retorno do mock
fs.existsSync.mockReturnValue(true);

// Implementação de mock para chamada específica
fs.readFile.mockImplementation((path) => {
  if (path === 'config.json') {
    return Promise.resolve('{"key": "value"}');
  }
  return Promise.reject(new Error('File not found'));
});
```

### Criando Test Fixtures

```javascript
// tests/fixtures/agent-fixtures.js
const MOCK_AGENT = {
  name: 'test-agent',
  slashPrefix: 'test',
  icon: '🧪',
  persona: {
    role: 'Test Agent',
    expertise: ['testing'],
  },
  commands: [
    {
      name: '*test',
      description: 'Run tests',
      visibility: 'all',
    },
  ],
};

const MOCK_SQUAD = {
  name: 'test-squad',
  version: '1.0.0',
  agents: [MOCK_AGENT],
  tasks: [],
};

module.exports = {
  MOCK_AGENT,
  MOCK_SQUAD,
};
```

### Usando Fixtures em Testes

```javascript
const { MOCK_AGENT, MOCK_SQUAD } = require('../fixtures/agent-fixtures');

describe('AgentLoader', () => {
  test('deve carregar agente da fixture', async () => {
    // Mock do sistema de arquivos para retornar dados da fixture
    jest.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify(MOCK_AGENT));

    const agent = await loadAgent('test-agent');

    expect(agent.name).toBe(MOCK_AGENT.name);
    expect(agent.commands).toHaveLength(1);
  });
});
```

### Mocking de Serviços Externos

```javascript
// Mock da API do ClickUp
jest.mock('../../.aios-core/integrations/clickup-client');
const clickupClient = require('../../.aios-core/integrations/clickup-client');

describe('Story Sync', () => {
  beforeEach(() => {
    // Resetar mocks antes de cada teste
    jest.clearAllMocks();

    // Configurar implementações de mock padrão
    clickupClient.createTask.mockResolvedValue({
      id: 'task-123',
      name: 'Test Task',
    });

    clickupClient.updateTask.mockResolvedValue({
      id: 'task-123',
      status: 'in progress',
    });
  });

  test('deve criar task no ClickUp', async () => {
    const result = await syncStory({ title: 'New Feature' });

    expect(clickupClient.createTask).toHaveBeenCalledWith({
      name: 'New Feature',
      list_id: expect.any(String),
    });
    expect(result.clickupId).toBe('task-123');
  });

  test('deve tratar erros da API do ClickUp', async () => {
    clickupClient.createTask.mockRejectedValue(new Error('API rate limited'));

    await expect(syncStory({ title: 'New Feature' })).rejects.toThrow(
      'Failed to sync: API rate limited'
    );
  });
});
```

### Snapshot Testing

```javascript
describe('GreetingBuilder', () => {
  test('deve gerar formato de saudação consistente', async () => {
    const builder = new GreetingBuilder();
    const greeting = await builder.build({
      agent: 'dev',
      sessionType: 'new',
      timestamp: new Date('2025-01-01T00:00:00Z'), // Timestamp fixo
    });

    // Comparação de snapshot
    expect(greeting).toMatchSnapshot();
  });
});
```

---

## Referência de Comandos NPM

### Comandos Básicos

| Comando                 | Descrição                              |
| ----------------------- | -------------------------------------- |
| `npm test`              | Executar todos os testes               |
| `npm run test:watch`    | Executar testes em modo watch          |
| `npm run test:coverage` | Executar testes com relatório de cobertura |

### Comandos de Testes Filtrados

```bash
# Executar testes correspondendo ao padrão
npm test -- --testPathPattern=unit

# Executar arquivo de teste específico
npm test -- tests/unit/greeting-builder.test.js

# Executar testes correspondendo ao nome
npm test -- --testNamePattern="should validate"

# Executar testes em diretório específico
npm test -- tests/integration/
```

### Comandos de Cobertura

```bash
# Gerar relatório completo de cobertura
npm run test:coverage

# Cobertura com reporter específico
npm test -- --coverage --coverageReporters=text

# Cobertura para arquivos específicos
npm test -- --coverage --collectCoverageFrom="src/**/*.js"
```

### Opções do Modo Watch

```bash
# Watch em todos os testes
npm run test:watch

# Watch em arquivos específicos
npm test -- --watch --testPathPattern=unit

# Watch apenas em arquivos alterados
npm test -- --watchAll=false --watch
```

### Modo Debug

```bash
# Executar com saída verbose
npm test -- --verbose

# Executar teste único para debugging
npm test -- --runInBand tests/unit/specific.test.js

# Executar com debugger do Node
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Comandos Específicos de CI

```bash
# Executar em modo CI (sem cores, cobertura, etc.)
npm test -- --ci

# Executar com máximo de workers
npm test -- --maxWorkers=4

# Parar na primeira falha
npm test -- --bail

# Executar apenas arquivos alterados (Git)
npm test -- --changedSince=main
```

---

## Resolução de Problemas

### Problemas Comuns

| Problema             | Solução                                                    |
| -------------------- | ---------------------------------------------------------- |
| Testes com timeout   | Aumentar `testTimeout` na config ou no teste específico    |
| Testes async travando | Garantir que todas as promises são awaited ou retornadas  |
| Mock não funcionando | Verificar se mock está antes do `require()`                |
| Cobertura baixa      | Adicionar padrões `--collectCoverageFrom`                  |
| Testes flaky         | Verificar estado compartilhado, usar limpeza em `beforeEach` |

### Debugando Testes Travados

```javascript
// Adicionar timeout a teste específico
test('operação lenta', async () => {
  // ...
}, 60000); // timeout de 60 segundos

// Debug com saída no console
test('debug test', async () => {
  console.log('Passo 1');
  await step1();
  console.log('Passo 2');
  await step2();
  console.log('Concluído');
});
```

### Corrigindo Problemas de Mock

```javascript
// Errado: Mock após require
const myModule = require('./myModule');
jest.mock('./myModule');

// Correto: Mock antes do require
jest.mock('./myModule');
const myModule = require('./myModule');

// Ou usar jest.doMock para mocking dinâmico
beforeEach(() => {
  jest.resetModules();
  jest.doMock('./myModule', () => ({
    func: jest.fn().mockReturnValue('mocked'),
  }));
});
```

### Resolvendo Problemas de Cobertura

```javascript
// Cobertura não coletando? Verificar caminhos
module.exports = {
  collectCoverageFrom: [
    // Usar caminhos relativos a partir da raiz do projeto
    'src/**/*.js',
    // Padrões de exclusão
    '!**/node_modules/**',
  ],
  // Diretórios raiz para busca
  roots: ['<rootDir>'],
};
```

---

## Documentação Relacionada

- [Guia de Quality Gates](./quality-gates.md) - Verificações automatizadas de qualidade
- [Arquitetura CI/CD](../../architecture/ci-cd.md) - Configuração de pipeline
- [Guia de Contribuição](../../how-to-contribute-with-pull-requests.md) - Fluxo de desenvolvimento

---

_Synkra AIOS v4 Guia de Testes_
