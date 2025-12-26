# Story TD-3: CI/CD Optimization & Test Coverage

<!-- Source: Sprint 13 Technical Debt -->
<!-- Context: GitHub Actions optimization + Increase test coverage to 80% -->
<!-- Type: Tech Debt -->

## Status: Draft

**Priority:** MEDIUM
**Sprint:** 13
**Effort:** 12-18h
**Lead:** @dev (Dex) + @qa (Quinn)

---

## Story

**As a** developer working on aios-core,
**I want** optimized CI/CD pipelines and 80% test coverage,
**So that** builds are faster, cheaper, and the codebase is well-tested.

---

## Background

This story consolidates two related tech debt items:

| Original ID | Title | Effort |
|-------------|-------|--------|
| 1733679600001 | GitHub Actions Cost Optimization | 4-6h |
| 1733682000001 | Increase Test Coverage to 80% | 8-12h |

### Current State

**CI/CD:**
- Single workflow file (`.github/workflows/ci.yml`)
- Story 6.1 already started optimization
- `paths-ignore` configured for docs
- Concurrency configured

**Test Coverage:**
- Current coverage: ~65-70% (estimated)
- Target coverage: 80%
- Main gaps in:
  - Integration tests
  - Error handling paths
  - Edge cases

---

## Acceptance Criteria

### CI/CD Optimization
1. CI workflow runs in < 5 minutes for standard PRs
2. Caching configured for npm dependencies
3. Parallel job execution where possible
4. Skip unnecessary jobs based on changed files
5. Cost reduction of at least 30%

### Test Coverage
6. Overall test coverage >= 80%
7. Core modules coverage >= 85%
8. No file with coverage < 60%
9. Integration tests for all major features
10. Coverage report generated in CI

---

## Tasks / Subtasks

### Task 1: CI/CD Audit (AC: 1, 5)

**Responsável:** @devops (Gage)
**Effort:** 1h

- [ ] 1.1 Analyze current workflow run times
- [ ] 1.2 Identify bottlenecks
- [ ] 1.3 Calculate current costs (minutes used)
- [ ] 1.4 Document optimization opportunities

### Task 2: Implement CI Optimizations (AC: 1-5)

**Responsável:** @devops (Gage)
**Effort:** 3-4h

- [ ] 2.1 Add npm cache configuration
- [ ] 2.2 Implement path-based job skipping
- [ ] 2.3 Parallelize lint and typecheck jobs
- [ ] 2.4 Add matrix strategy for test sharding
- [ ] 2.5 Optimize checkout with sparse checkout
- [ ] 2.6 Add workflow dispatch for manual runs

**Optimized Workflow:**
```yaml
jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      code: ${{ steps.filter.outputs.code }}
      docs: ${{ steps.filter.outputs.docs }}
    steps:
      - uses: dorny/paths-filter@v2
        id: filter
        with:
          filters: |
            code:
              - 'src/**'
              - '.aios-core/**'
              - 'tests/**'
            docs:
              - 'docs/**'

  lint:
    needs: changes
    if: ${{ needs.changes.outputs.code == 'true' }}
    # ...

  test:
    needs: changes
    if: ${{ needs.changes.outputs.code == 'true' }}
    strategy:
      matrix:
        shard: [1, 2, 3]
    # ...
```

### Task 3: Coverage Audit (AC: 6-8)

**Responsável:** @qa (Quinn)
**Effort:** 1h

- [ ] 3.1 Run coverage report
- [ ] 3.2 Identify files below 60%
- [ ] 3.3 Prioritize by importance (core > utils > tests)
- [ ] 3.4 Create coverage improvement plan

### Task 4: Improve Core Coverage (AC: 6-7)

**Responsável:** @qa (Quinn) + @dev (Dex)
**Effort:** 4-6h

Priority modules:
- [ ] 4.1 `.aios-core/core/` - Target 85%
- [ ] 4.2 `.aios-core/development/scripts/squad/` - Target 85%
- [ ] 4.3 `src/wizard/` - Target 80%
- [ ] 4.4 `src/installer/` - Target 80%

### Task 5: Add Integration Tests (AC: 9)

**Responsável:** @qa (Quinn)
**Effort:** 3-4h

- [ ] 5.1 Squad system integration tests
- [ ] 5.2 Wizard flow integration tests
- [ ] 5.3 CLI commands integration tests
- [ ] 5.4 Quality gates integration tests

### Task 6: CI Coverage Reporting (AC: 10)

**Responsável:** @devops (Gage)
**Effort:** 1h

- [ ] 6.1 Add coverage reporter to CI
- [ ] 6.2 Configure coverage thresholds
- [ ] 6.3 Add coverage badge to README
- [ ] 6.4 Fail build if coverage drops below 75%

---

## Dev Notes

### Caching Configuration

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
    cache-dependency-path: package-lock.json
```

### Test Sharding

```yaml
test:
  strategy:
    matrix:
      shard: [1, 2, 3]
  steps:
    - run: npm test -- --shard=${{ matrix.shard }}/3
```

### Coverage Thresholds

```json
// jest.config.js
{
  "coverageThreshold": {
    "global": {
      "branches": 75,
      "functions": 80,
      "lines": 80,
      "statements": 80
    },
    ".aios-core/core/": {
      "lines": 85
    }
  }
}
```

### Low Coverage Files (to prioritize)

| File | Current | Target |
|------|---------|--------|
| `src/wizard/index.js` | ~50% | 80% |
| `src/installer/dependency-installer.js` | ~55% | 80% |
| `.aios-core/core/config/config-loader.js` | ~60% | 85% |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking CI workflow | Medium | High | Test in branch first |
| Tests slowing down CI | Medium | Medium | Use test sharding |
| Coverage gaming | Low | Low | Review tests for quality |

---

## Definition of Done

- [ ] CI runs in < 5 minutes
- [ ] npm caching working
- [ ] Path-based job skipping working
- [ ] Test coverage >= 80%
- [ ] Coverage report in CI
- [ ] No files below 60% coverage
- [ ] PR approved and merged

---

**Story Points:** 8
**Sprint:** 13
**Priority:** Medium
**Type:** Tech Debt

---

## Change Log

| Date | Version | Author | Change |
|------|---------|--------|--------|
| 2025-12-26 | 1.0 | @po (Pax) | Story created from tech debt consolidation |
