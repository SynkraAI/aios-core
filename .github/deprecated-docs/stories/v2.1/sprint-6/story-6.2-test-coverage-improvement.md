# STORY 6.2: Test Coverage Improvement to 80%

**ID:** 6.2 | **Epic:** Technical Debt
**Sprint:** 6 | **Points:** 8 | **Priority:** 🟡 Medium | **Created:** 2025-12-08
**Updated:** 2025-12-08
**Status:** 📋 Ready for Development

**Backlog Reference:** ID 1733682000001

---

## Problem Statement

O threshold de coverage foi temporariamente reduzido de 80% para 60% para desbloquear o CI:

**Coverage Atual (2025-12-08):**
| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Statements | 66.45% | 80% | -13.55% |
| Branches | 65.45% | 80% | -14.55% |
| Lines | 66.59% | 80% | -13.41% |
| Functions | 72.36% | 80% | -7.64% |

**Impacto:**
- Qualidade de código pode degradar sem visibilidade
- Regressões podem passar despercebidas
- Technical debt acumula em áreas não testadas

---

## User Story

**Como** desenvolvedor do AIOS-FULLSTACK,
**Quero** aumentar a cobertura de testes para 80%,
**Para que** o código seja mais confiável e regressões sejam detectadas cedo.

---

## Scope

### In Scope

| Feature | Description |
|---------|-------------|
| Coverage Analysis | Identificar módulos com menor coverage |
| Priority Modules | Focar em core, security, CLI |
| Unit Tests | Adicionar testes unitários incrementalmente |
| Threshold Increase | Aumentar thresholds gradualmente |
| Per-Module Gates | Considerar coverage gates por módulo |

### Out of Scope

- Refatoração de código existente
- Integration tests (E2E)
- Performance tests
- Mudanças na lógica de negócio

---

## Acceptance Criteria

### AC6.2.1: Coverage Analysis Completa
- [ ] Relatório de coverage por módulo/diretório
- [ ] Lista priorizada de módulos a melhorar
- [ ] Identificação de código crítico sem testes

### AC6.2.2: Core Modules ≥ 80%
- [ ] `common/` coverage ≥ 80%
- [ ] `aios-core/core/` coverage ≥ 80%
- [ ] Security-related code 100% coberto

### AC6.2.3: CLI & Tasks Testados
- [ ] CLI commands principais testados
- [ ] Tasks críticas (`*setup-github`, `*bootstrap`) testadas
- [ ] Error paths cobertos

### AC6.2.4: Threshold Restaurado
- [ ] `jest.config.js` com thresholds de 80%
- [ ] CI passando com novos thresholds
- [ ] Nenhuma regressão introduzida

### AC6.2.5: Coverage Gates por Módulo (Opcional)
- [ ] Avaliar viabilidade de coverage per-directory
- [ ] Implementar se benéfico
- [ ] Documentar decisão

---

## Technical Design

### 1. Current Coverage Distribution

```
collectCoverageFrom:
  - 'common/**/*.js'
  - 'aios-core/**/*.js'
  - '!**/node_modules/**'
  - '!**/tests/**'
  - '!**/coverage/**'
```

### 2. Investigation Steps

```bash
# Generate detailed coverage report
npm test -- --coverage --coverageReporters=html

# View coverage by directory
open coverage/lcov-report/index.html
```

### 3. Priority Areas (Expected Low Coverage)

| Area | Reason | Priority |
|------|--------|----------|
| `aios-core/tasks/` | Complex workflows | 🔴 High |
| `aios-core/agents/` | Agent logic | 🔴 High |
| `common/utils/` | Utilities | 🟡 Medium |
| `aios-core/loaders/` | File loaders | 🟡 Medium |
| Error handlers | Edge cases | 🔴 High |

### 4. Jest Config Target

```javascript
// jest.config.js - Final target
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  }
}
```

### 5. Incremental Approach

**Phase 1:** 70% threshold
**Phase 2:** 75% threshold
**Phase 3:** 80% threshold

---

## Implementation Tasks

### Phase 1: Analysis (2h)
- [ ] Run coverage report
- [ ] Export coverage by directory
- [ ] Create priority list of uncovered code
- [ ] Identify quick wins (high impact, low effort)

### Phase 2: Core Modules (4h)
- [ ] Add tests for `common/` utilities
- [ ] Add tests for `aios-core/core/` modules
- [ ] Focus on exported functions first
- [ ] Cover error paths

### Phase 3: CLI & Tasks (3h)
- [ ] Test CLI command parsing
- [ ] Test task execution flow
- [ ] Mock external dependencies
- [ ] Test validation logic

### Phase 4: Edge Cases (2h)
- [ ] Test error handling
- [ ] Test boundary conditions
- [ ] Test invalid inputs
- [ ] Test timeout scenarios

### Phase 5: Threshold Increase (1h)
- [ ] Bump to 70%, verify CI
- [ ] Bump to 75%, verify CI
- [ ] Bump to 80%, verify CI
- [ ] Remove TODO comment from jest.config.js

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Tests lentos | Medium | Use mocks, avoid I/O |
| Flaky tests | High | Follow PR #27 patterns |
| False coverage | Medium | Focus on meaningful assertions |

---

## Test Patterns to Follow

### Good Test Pattern
```javascript
describe('functionName', () => {
  it('should handle normal input', () => {
    expect(functionName(validInput)).toBe(expectedOutput);
  });

  it('should throw on invalid input', () => {
    expect(() => functionName(null)).toThrow('Expected error');
  });

  it('should handle edge case', () => {
    expect(functionName(edgeCase)).toBe(edgeOutput);
  });
});
```

### Mocking Pattern
```javascript
jest.mock('../dependency', () => ({
  externalCall: jest.fn().mockResolvedValue(mockData)
}));
```

---

## Definition of Done

- [ ] Coverage ≥ 80% em todas as métricas
- [ ] CI passando com thresholds de 80%
- [ ] Todos os 1551+ tests passando
- [ ] Nenhum test flaky introduzido
- [ ] Coverage report commitado

---

## References

- `jest.config.js` - Coverage configuration
- `coverage/lcov-report/` - HTML reports
- PR #27 - Flaky test fixes (patterns to follow)

---

## File List

*To be updated during implementation*

| File | Action | Status |
|------|--------|--------|
| `jest.config.js` | Restore 80% thresholds | 📋 Pending |
| `tests/common/*.test.js` | Add/improve tests | 📋 Pending |
| `tests/aios-core/*.test.js` | Add/improve tests | 📋 Pending |

---

*Story created by @po (Pax) - 2025-12-08*
*Backlog item: 1733682000001*
