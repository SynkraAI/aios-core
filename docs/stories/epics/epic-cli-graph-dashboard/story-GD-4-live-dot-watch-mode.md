# Story GD-4: Live DOT Watch Mode

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
**I want** to run `aios graph --deps --watch` and see the dependency graph auto-refresh in VS Code,
**so that** I can monitor codebase relationships in real-time while developing.

## Acceptance Criteria

1. Flag `--watch` gera arquivo `.aios/graph.dot` com output DOT do dependency graph
2. Watch mode re-gera o arquivo DOT a cada N segundos (default 5s, configuravel via `--interval`)
3. Mudancas no entity-registry.yaml ou code-intel data trigam regeneracao imediata (file watcher)
4. Output DOT e compativel com extensao "Graphviz Interactive Preview" do VS Code (tintinweb)
5. Flag `--watch` combinavel com `--format=mermaid` para gerar `.aios/graph.mmd` alternativamente
6. Ctrl+C encerra watch mode gracefully (cleanup de timers e watchers)
7. Testes unitarios cobrem: watch lifecycle, file generation, interval config, cleanup

## Research Reference

[Research: Dynamic Graph Dashboard Visualization](../../../research/2026-02-21-graph-dashboard-visualization/README.md)

**Abordagem:** Fase 1 — Quick Win. Usar extensao VS Code existente (Graphviz Interactive Preview) que auto-detecta mudancas em `.dot` files e re-renderiza.

## CodeRabbit Integration

### Story Type Analysis

**Primary Type**: Feature
**Complexity**: Low-Medium (watch mode + file watcher, bem definido)

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
- Resource cleanup: Ensure all timers/watchers are properly disposed on exit
- File system safety: Write to `.aios/` directory only, no side effects outside

**Secondary Focus**:
- Cross-platform: File watching on Windows (chokidar vs fs.watch)
- Error handling: Graceful degradation if .aios/ directory doesn't exist

## Tasks / Subtasks

- [ ] **Task 1: Implementar watch mode no CLI router** (AC: 1, 2, 6)
  - [ ] 1.1 Adicionar `--watch` flag ao `parseArgs()` em cli.js
  - [ ] 1.2 Criar `handleWatch(args)` que inicia loop de regeneracao
  - [ ] 1.3 Usar `setInterval` com `args.interval` (default 5000ms)
  - [ ] 1.4 Gerar arquivo `.aios/graph.dot` (ou `.aios/graph.mmd` se `--format=mermaid`)
  - [ ] 1.5 Criar diretorio `.aios/` se nao existir (`fs.mkdirSync` recursive)
  - [ ] 1.6 Implementar cleanup no SIGINT (clearInterval, close watchers)

- [ ] **Task 2: Implementar file watcher para regeneracao imediata** (AC: 3)
  - [ ] 2.1 Adicionar `chokidar` como dependencia (ou usar `fs.watch` nativo)
  - [ ] 2.2 Watch `entity-registry.yaml` para mudancas
  - [ ] 2.3 Debounce regeneracao (300ms) para evitar writes multiplos
  - [ ] 2.4 Log para terminal quando regeneracao acontece: `[watch] graph.dot updated (142 entities)`

- [ ] **Task 3: Suporte a formato Mermaid no watch mode** (AC: 5)
  - [ ] 3.1 Se `--format=mermaid`, gerar `.aios/graph.mmd` em vez de `.aios/graph.dot`
  - [ ] 3.2 Reusar formatters existentes (dot-formatter.js, mermaid-formatter.js)
  - [ ] 3.3 Extensao oficial Mermaid Preview tambem detecta mudancas em `.mmd` files

- [ ] **Task 4: Escrever testes unitarios** (AC: 7)
  - [ ] 4.1 `tests/graph-dashboard/watch-mode.test.js` — mock fs, test lifecycle
  - [ ] 4.2 Test: watch inicia, gera arquivo, para no cleanup
  - [ ] 4.3 Test: interval configuravel via --interval
  - [ ] 4.4 Test: formato mermaid gera .mmd
  - [ ] 4.5 Test: SIGINT handler limpa recursos

- [ ] **Task 5: Validacao e documentacao**
  - [ ] 5.1 Executar `npm run lint` — zero erros
  - [ ] 5.2 Executar `npm test` — zero regressoes
  - [ ] 5.3 Testar manualmente: `node bin/aios.js graph --deps --watch`
  - [ ] 5.4 Atualizar `--help` output com documentacao do --watch flag

## Dev Notes

### Dependencia Recomendada para VS Code

Extensao: **Graphviz Interactive Preview** (`tintinweb.graphviz-interactive-preview`)
- Detecta mudancas em `.dot` files automaticamente
- Renderiza com pan, zoom, edge tracing
- Usa WASM (nao precisa Graphviz nativo instalado)

### Watch Mode Architecture

```
CLI (--watch) → setInterval + chokidar
     │
     ├── Tick: CodeIntelSource.getData() → formatAsDot() → fs.writeFileSync('.aios/graph.dot')
     │
     └── File change: entity-registry.yaml modified → debounce → regenerate
```

### Output Directory

`.aios/` e o diretorio padrao para outputs temporarios do AIOS. Ja esta no `.gitignore`.

## Scope

### IN Scope
- Watch mode com regeneracao periodica e file-based
- Output DOT e Mermaid para `.aios/`
- Cleanup graceful no SIGINT

### OUT of Scope
- Dashboard TUI interativo (GD-6 futuro)
- Abrir browser automaticamente (GD-5)
- WebSocket live-server integration

## Complexity & Estimation

**Complexity:** Low-Medium
**Estimation:** 4-6 horas
**Dependencies:** GD-3 (Done) — formatters ja implementados

## Testing

```bash
npx jest tests/graph-dashboard/watch-mode.test.js
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
