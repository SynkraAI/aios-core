# Story GD-5: HTML Web Viewer com vis-network

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
**I want** to run `aios graph --deps --format=html` and see an interactive graph in my browser,
**so that** I can explore dependencies visually with drag, zoom, and physics simulation.

## Acceptance Criteria

1. Flag `--format=html` gera arquivo HTML self-contained em `.aios/graph.html`
2. HTML inclui vis-network via CDN (standalone UMD build) para renderizacao interativa
3. Grafo renderiza com physics simulation (force-directed layout), drag de nodes, zoom e pan
4. Nodes sao coloridos por categoria (tasks=azul, agents=verde, templates=amarelo, scripts=cinza)
5. Ao clicar num node, mostra tooltip com: path, type, dependencies count
6. Browser abre automaticamente apos gerar o arquivo (cross-platform: Windows/Mac/Linux)
7. HTML funciona offline apos primeiro load (vis-network cached pelo browser)
8. Testes unitarios cobrem: HTML generation, data embedding, node/edge mapping

## Research Reference

[Research: Dynamic Graph Dashboard Visualization](../../../research/2026-02-21-graph-dashboard-visualization/README.md)

**Abordagem:** Fase 2 — Web Viewer. vis-network tem data format `{ nodes, edges }` identico ao nosso JSON. Standalone UMD build para HTML embedding sem build step.

## CodeRabbit Integration

### Story Type Analysis

**Primary Type**: Feature
**Complexity**: Medium (HTML template + vis-network integration + cross-platform open)

### Quality Gate Tasks

- [ ] Pre-Commit (@dev): Run `coderabbit --prompt-only -t uncommitted` before marking story complete
- [ ] Pre-PR (@devops): Run `coderabbit --prompt-only --base main` before creating pull request

### Self-Healing Configuration

**Expected Self-Healing**:
- Primary Agent: @dev (light mode)
- Max Iterations: 2
- Timeout: 15 minutes
- Severity Filter: CRITICAL, HIGH

### CodeRabbit Focus Areas

**Primary Focus**:
- Security: HTML generation nao deve permitir XSS via labels de nodes (sanitizar)
- Data integrity: JSON embedding no HTML deve escapar caracteres especiais

**Secondary Focus**:
- Cross-platform: `open` npm package para abrir browser em Windows/Mac/Linux
- Performance: Grafos com 500+ nodes devem renderizar em < 3s

## Tasks / Subtasks

- [ ] **Task 1: Criar html-formatter.js** (AC: 1, 2, 3)
  - [ ] 1.1 Criar `.aios-core/core/graph-dashboard/formatters/html-formatter.js`
  - [ ] 1.2 Implementar `formatAsHtml(graphData, options)` que retorna string HTML completa
  - [ ] 1.3 Incluir vis-network via CDN: `https://unpkg.com/vis-network/standalone/umd/vis-network.min.js`
  - [ ] 1.4 Embeddar JSON data inline no HTML (sanitizado)
  - [ ] 1.5 Configurar physics simulation: `{ physics: { stabilization: { iterations: 100 } } }`
  - [ ] 1.6 Dark theme por default (background #1e1e1e, alinhado com VS Code)

- [ ] **Task 2: Implementar node styling por categoria** (AC: 4, 5)
  - [ ] 2.1 Mapear categorias para cores: tasks=#4fc3f7, agents=#66bb6a, templates=#ffd54f, scripts=#90a4ae
  - [ ] 2.2 Configurar node shapes por tipo (dot para agents, box para tasks, diamond para templates)
  - [ ] 2.3 Implementar tooltip on-click com path, type, dependencies count
  - [ ] 2.4 Adicionar legenda visual no canto do HTML

- [ ] **Task 3: Integrar no CLI router** (AC: 1, 6)
  - [ ] 3.1 Adicionar `html` ao `FORMAT_MAP` e `VALID_FORMATS` em cli.js
  - [ ] 3.2 Quando `--format=html`: gerar arquivo, escrever em `.aios/graph.html`, abrir browser
  - [ ] 3.3 Adicionar dependencia `open` (sindresorhus, v11+) para cross-platform browser open
  - [ ] 3.4 Fallback: se `open` falhar, printar path do arquivo para usuario abrir manualmente

- [ ] **Task 4: Combinacao com --watch** (AC: 7)
  - [ ] 4.1 Se `--watch --format=html`: regenerar HTML file no intervalo
  - [ ] 4.2 Adicionar meta refresh ou WebSocket snippet para auto-reload no browser
  - [ ] 4.3 Alternativa simples: `<meta http-equiv="refresh" content="5">` no HTML

- [ ] **Task 5: Escrever testes unitarios** (AC: 8)
  - [ ] 5.1 `tests/graph-dashboard/html-formatter.test.js`
  - [ ] 5.2 Test: HTML output contem vis-network CDN script tag
  - [ ] 5.3 Test: JSON data embedded corretamente (parse de volta)
  - [ ] 5.4 Test: Nodes tem cores por categoria
  - [ ] 5.5 Test: Empty graph gera HTML valido
  - [ ] 5.6 Test: Labels com caracteres especiais sao sanitizados (no XSS)

- [ ] **Task 6: Validacao end-to-end**
  - [ ] 6.1 Executar `npm run lint` — zero erros
  - [ ] 6.2 Executar `npm test` — zero regressoes
  - [ ] 6.3 Testar manualmente: `node bin/aios.js graph --deps --format=html`
  - [ ] 6.4 Verificar que HTML abre no browser e grafo renderiza
  - [ ] 6.5 Testar com grafo grande (entity-registry completo, 500+ nodes)

## Dev Notes

### vis-network Data Format

vis-network usa exatamente o mesmo formato que nosso JSON:

```javascript
// Nosso formato (json-formatter output):
{ nodes: [{ id: 'dev', label: 'dev' }], edges: [{ from: 'dev', to: 'task-a' }] }

// vis-network espera:
{ nodes: new vis.DataSet([{ id: 'dev', label: 'dev' }]),
  edges: new vis.DataSet([{ from: 'dev', to: 'task-a' }]) }
```

Unica diferenca: wrapping com `vis.DataSet()`. Zero transformacao de schema.

### CDN URL

```
https://unpkg.com/vis-network/standalone/umd/vis-network.min.js
```

Standalone build inclui tudo (vis-data + vis-network) em um unico arquivo.

### open npm package

```bash
npm install open  # v11.0.0, sindresorhus
```

Cross-platform: macOS (`open`), Windows (`start`), Linux (`xdg-open`).

### HTML Template Skeleton

```html
<!DOCTYPE html>
<html>
<head>
  <title>AIOS Graph Dashboard</title>
  <script src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
  <style>
    body { margin: 0; background: #1e1e1e; }
    #graph { width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <div id="graph"></div>
  <script>
    var data = { nodes: new vis.DataSet(NODES_JSON), edges: new vis.DataSet(EDGES_JSON) };
    var options = { physics: { stabilization: { iterations: 100 } } };
    new vis.Network(document.getElementById('graph'), data, options);
  </script>
</body>
</html>
```

## Scope

### IN Scope
- HTML formatter com vis-network
- Node styling por categoria
- Tooltips on-click
- Cross-platform browser open
- Auto-refresh basico (meta refresh)

### OUT of Scope
- WebSocket live-server (over-engineering para MVP)
- Server-side rendering
- Dashboard layout com stats/status (so grafo nesta story)

## Complexity & Estimation

**Complexity:** Medium
**Estimation:** 6-8 horas
**Dependencies:** GD-3 (Done) — JSON formatter e CLI router existentes

## Testing

```bash
npx jest tests/graph-dashboard/html-formatter.test.js
npm run lint
npm test
```

## Dev Agent Record

### Agent Model Used
(to be filled by @dev)

### Debug Log References
(to be filled by @dev)

### Completion Notes
(to be filled by @dev)

### File List
(to be filled by @dev)

### Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-21 | @devops (Gage) | Story created from research |

## QA Results
(to be filled by @qa)
