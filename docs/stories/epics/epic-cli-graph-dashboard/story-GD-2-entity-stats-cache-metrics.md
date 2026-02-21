# Story GD-2: Entity Stats e Cache Metrics ASCII

## Status

Draft

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools: ["jest", "eslint", "coderabbit"]
```

## Story

**As a** developer using AIOS,
**I want** to run `aios graph --stats` to see entity statistics and cache metrics,
**so that** I can monitor the health of the code intelligence system.

## Acceptance Criteria

1. Flag `--stats` exibe tabela formatada com: total entidades, categorias, percentagem, última atualização
2. Inclui cache hit/miss ratio como percentagem e ASCII sparkline (mini bar chart inline)
3. Inclui latency das últimas N operações como ASCII line chart (via `asciichart`)
4. Dados vêm de `RegistrySource` (entity stats) + `MetricsSource` (cache, latency)
5. Funciona sem Code Graph MCP — entity stats sempre disponíveis via registry; métricas mostram `[OFFLINE]` badge quando provider indisponível
6. `aios graph --stats | head -10` funciona sem ANSI escapes quando `!process.stdout.isTTY`
7. Testes unitários cobrem: stats formatting, sparkline rendering, latency chart, missing data handling, non-TTY mode

## CodeRabbit Integration

### Story Type Analysis

**Primary Type**: Architecture
**Secondary Type(s)**: N/A (CLI module, no DB/frontend)
**Complexity**: Medium (new renderers + data sources, well-defined scope)

### Specialized Agent Assignment

**Primary Agents**:
- @dev (implementation + pre-commit reviews)

**Supporting Agents**:
- @architect (new module structure validation)

### Quality Gate Tasks

- [ ] Pre-Commit (@dev): Run `coderabbit --prompt-only -t uncommitted` before marking story complete
- [ ] Pre-PR (@devops): Run `coderabbit --prompt-only --base main` before creating pull request

### Self-Healing Configuration

**Expected Self-Healing**:
- Primary Agent: @dev (light mode)
- Max Iterations: 2
- Timeout: 15 minutes
- Severity Filter: CRITICAL

**Predicted Behavior**:
- CRITICAL issues: auto_fix (up to 2 iterations)
- HIGH issues: document_only (noted in Dev Notes)

### CodeRabbit Focus Areas

**Primary Focus**:
- Code patterns: Seguir padrão existente de code-intel module (graceful fallback, null safety)
- Data source interface: RegistrySource e MetricsSource devem implementar `getData()`, `getLastUpdate()`, `isStale()`

**Secondary Focus**:
- Cross-platform: Sparkline chars + non-TTY fallback
- Error handling: MetricsSource offline deve mostrar badge, não crashar

## Tasks / Subtasks

- [ ] **Task 1: Implementar RegistrySource (data-sources/registry-source.js)** (AC: 4, 5)
  - [ ] 1.1 Criar classe `RegistrySource` extends `DataSource` com `getData()`
  - [ ] 1.2 Carregar registry via `RegistryLoader.load()`
  - [ ] 1.3 Extrair: totalEntities, categories (com contagem por tipo), lastUpdated, version
  - [ ] 1.4 Calcular percentagem de cada categoria sobre o total
  - [ ] 1.5 Output normalizado: `{ totalEntities, categories: { tasks: { count, pct }, ... }, lastUpdated, version }`

- [ ] **Task 2: Implementar MetricsSource (data-sources/metrics-source.js)** (AC: 4, 5)
  - [ ] 2.1 Criar classe `MetricsSource` extends `DataSource` com `getData()`
  - [ ] 2.2 Path primário: `isCodeIntelAvailable()` → `client.getMetrics()` retorna métricas live
  - [ ] 2.3 Fallback offline: retornar objeto com zeros e `providerAvailable: false`
  - [ ] 2.4 Output normalizado: `{ cacheHits, cacheMisses, cacheHitRate, circuitBreakerState, latencyLog, providerAvailable, activeProvider }`

- [ ] **Task 3: Implementar stats-renderer.js (renderers/stats-renderer.js)** (AC: 1, 2, 3, 6)
  - [ ] 3.1 Criar função `renderStats(registryData, metricsData, options)` que retorna string multiline
  - [ ] 3.2 Renderizar tabela de entidades com colunas: Category, Count, %
  - [ ] 3.3 Usar box-drawing chars para borders da tabela (`─`, `│`, `┼`)
  - [ ] 3.4 Renderizar cache performance com sparkline inline (chars `▁▃▅▇`)
  - [ ] 3.5 Renderizar latency chart via `asciichart.plot()` (últimas N operações)
  - [ ] 3.6 Mostrar `[OFFLINE]` badge quando `metricsData.providerAvailable === false`
  - [ ] 3.7 Suprimir sparkline/special chars quando `options.isTTY === false`
  - [ ] 3.8 Mostrar `Last updated: X ago` calculando tempo relativo

- [ ] **Task 4: Integrar --stats no CLI router (cli.js)** (AC: 1)
  - [ ] 4.1 Adicionar `handleStats(args)` no cli.js
  - [ ] 4.2 Instanciar `RegistrySource` + `MetricsSource`, chamar `getData()` em paralelo
  - [ ] 4.3 Passar resultados para `renderStats()` com `{ isTTY: process.stdout.isTTY }`
  - [ ] 4.4 Output via `process.stdout.write()` para pipe compatibility

- [ ] **Task 5: Adicionar dependência asciichart** (AC: 3)
  - [ ] 5.1 Instalar `asciichart` como dependência: `npm install asciichart`
  - [ ] 5.2 Verificar que é zero-dependency e lightweight

- [ ] **Task 6: Escrever testes unitários** (AC: 7)
  - [ ] 6.1 `tests/graph-dashboard/registry-source.test.js` — mock RegistryLoader, test getData, test empty registry
  - [ ] 6.2 `tests/graph-dashboard/metrics-source.test.js` — mock code-intel, test live + offline paths
  - [ ] 6.3 `tests/graph-dashboard/stats-renderer.test.js` — test table formatting, sparkline rendering, offline badge, non-TTY mode, empty data
  - [ ] 6.4 Garantir todos os testes passam com `npx jest tests/graph-dashboard/`

- [ ] **Task 7: Validação e cleanup**
  - [ ] 7.1 Executar `npm run lint` — zero erros
  - [ ] 7.2 Executar `npm test` — zero regressões
  - [ ] 7.3 Verificar que `node bin/aios-graph.js --stats` executa sem erro
  - [ ] 7.4 Verificar pipe: `node bin/aios-graph.js --stats | head -10` funciona

## Dev Notes

### Dependência de GD-1

Esta story depende de GD-1 (CLI entrypoint e cli.js router). Os ficheiros `bin/aios-graph.js`, `cli.js` e a base class `DataSource` devem existir antes de iniciar.

### Data Sources — API Existente

[Source: .aios-core/core/code-intel/code-intel-client.js]

```javascript
const client = getClient();
const metrics = client.getMetrics();
// Returns: { cacheHits, cacheMisses, cacheHitRate, circuitBreakerState, latencyLog, providerAvailable, activeProvider }
// latencyLog: Array<{ capability, durationMs, isCacheHit, timestamp }>
```

[Source: .aios-core/core/ids/registry-loader.js]

```javascript
const { RegistryLoader } = require('../ids/registry-loader');
const loader = new RegistryLoader();
const registry = loader.load();
// registry.metadata.entityCount → 517
// registry.metadata.lastUpdated → '2026-02-21T04:07:07.055Z'
// registry.entities → { tasks: {...}, templates: {...}, agents: {...}, ... }
```

### Stats Renderer Output Format

[Source: docs/architecture/cli-graph-dashboard-architecture.md#4.2]

```
Entity Statistics
─────────────────────────────────
 Category    │ Count │ %
─────────────┼───────┼──────
 tasks       │    67 │ 47.2%
 templates   │    34 │ 23.9%
 scripts     │    29 │ 20.4%
 agents      │    12 │  8.5%
─────────────┼───────┼──────
 TOTAL       │   142 │ 100%

Cache Performance
 Hit Rate: 89.2% ▁▃▅▇▅▃▁▃▅▇
 Misses:   10.8% ▇▅▃▁▃▅▇▅▃▁

Latency (last 10 operations)
  45 ┤    ╭╮
  30 ┤ ╭╮ ││
  15 ┤╭╯╰╮│╰─╮
   0 ┼╯  ╰╯  ╰
```

### Sparkline Characters

Para inline sparklines (cache hit/miss), usar block chars Unicode:
- `▁` (U+2581) ... `▇` (U+2587) — 7 levels
- Non-TTY fallback: usar `#` para bars ou omitir sparkline

### asciichart Usage

```javascript
const asciichart = require('asciichart');
const data = latencyLog.map(l => l.durationMs);
const chart = asciichart.plot(data, { height: 4, padding: '  ' });
```

### Coding Standards

[Source: docs/framework/coding-standards.md]

- CommonJS (`require`/`module.exports`)
- ES2022 standard
- `'use strict';` no topo de cada ficheiro
- JSDoc para todas as funções públicas
- ESLint + Prettier enforcement

### Testing

[Source: docs/framework/tech-stack.md, coding-standards.md]

- **Framework:** Jest
- **Location:** `tests/graph-dashboard/`
- **Pattern:** Mock code-intel module igual aos testes existentes em `tests/code-intel/`
- **Naming:** `{module-name}.test.js`
- **Run:** `npx jest tests/graph-dashboard/ --verbose`

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-21 | 1.0 | Story draft created | River (@sm) |

## Dev Agent Record

### Agent Model Used

_(To be filled by @dev)_

### Debug Log References

_(To be filled by @dev)_

### Completion Notes List

_(To be filled by @dev)_

### File List

_(To be filled by @dev)_

## QA Results

_(To be filled by @qa)_
