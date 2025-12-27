# Story TD-3: CI/CD Optimization & Test Coverage

<!-- Source: Sprint 13 Technical Debt -->
<!-- Context: GitHub Actions optimization + Increase test coverage to 80% -->
<!-- Type: Tech Debt -->

## Status: In Progress

**Priority:** MEDIUM
**Sprint:** 13
**Effort:** 12-18h
**Lead:** @devops (Gage) + @qa (Quinn)
**Approved by:** @po (Pax) - 2025-12-27

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

## CodeRabbit Integration

### Story Type Analysis

**Primary Type**: Tech Debt / Infrastructure
**Secondary Type(s)**: Testing, CI/CD
**Complexity**: Medium-High

### Specialized Agent Assignment

**Primary Agents**:
- @devops (Gage): CI/CD optimization (Tasks 1, 2, 6)
- @qa (Quinn): Coverage audit and improvements (Tasks 3, 4, 5)

**Supporting Agents**:
- @dev (Dex): Test implementation support for Task 4

### Quality Gate Tasks

- [ ] Pre-Commit (@dev/@qa): Verify tests pass locally with coverage >= 80%
- [ ] Pre-PR (@qa): Run full coverage report, validate no file < 60%
- [ ] Pre-Merge (@devops): Verify CI workflow runs in < 5 minutes

### Focus Areas

**Primary Focus**:
- CI workflow correctness and performance
- Test coverage accuracy and quality

**Secondary Focus**:
- Build cost reduction
- Test quality (not just quantity)

---

## Acceptance Criteria

### CI/CD Optimization
1. CI workflow runs in < 5 minutes for standard PRs
2. Caching configured for npm dependencies
3. Parallel job execution where possible
4. Skip unnecessary jobs based on changed files
5. Cost reduction of at least 30% (baseline measured in Task 1.3)

### Test Coverage
6. Overall test coverage >= 80%
7. Core modules coverage >= 85%
8. No file with coverage < 60%
9. Integration tests for: Squad system, Wizard flow, CLI commands, Quality gates
10. Coverage report generated in CI

---

## Tasks / Subtasks

### Task 1: CI/CD Audit (AC: 1, 5)

**Responsável:** @devops (Gage) → @dev (Dex)
**Effort:** 1h

- [x] 1.1 Analyze current workflow run times
- [x] 1.2 Identify bottlenecks
- [x] 1.3 Calculate current costs (minutes used)
- [x] 1.4 Document optimization opportunities

**Audit Results (2025-12-27):**
- Total CI run time: ~40 seconds per PR
- Job breakdown: ESLint (17s), TypeCheck (20s), Tests (35s), Validations (~15s each)
- npm cache already configured
- Jobs run in parallel
- Main issue: Each job runs `npm ci` separately

### Task 2: Implement CI Optimizations (AC: 1-5)

**Responsável:** @devops (Gage) → @dev (Dex)
**Effort:** 3-4h

- [x] 2.1 Add npm cache configuration (already present, enhanced with cache-dependency-path)
- [x] 2.2 Implement path-based job skipping (using dorny/paths-filter@v3)
- [x] 2.3 Parallelize lint and typecheck jobs (already parallel, no changes needed)
- [ ] 2.4 Add matrix strategy for test sharding (deferred - current test time acceptable)
- [ ] 2.5 Optimize checkout with sparse checkout (deferred - not needed)
- [x] 2.6 Add workflow dispatch for manual runs

**Optimized Workflow:**
```yaml
jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      code: ${{ steps.filter.outputs.code }}
      docs: ${{ steps.filter.outputs.docs }}
    steps:
      - uses: dorny/paths-filter@v3
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

**Responsável:** @qa (Quinn) → @dev (Dex)
**Effort:** 1h

- [x] 3.1 Run coverage report
- [x] 3.2 Identify files below 60%
- [x] 3.3 Prioritize by importance (core > utils > tests)
- [x] 3.4 Create coverage improvement plan

**Coverage Audit Results (2025-12-27):**
- Current coverage: ~31% (Statements), ~29% (Branches), ~33% (Functions), ~31% (Lines)
- Previous jest.config.js had incorrect collectCoverageFrom paths (common/, aios-core/ don't exist)
- Fixed paths in jest.config.js to include: src/, .aios-core/, bin/, packages/, scripts/
- Set realistic baseline thresholds: 25% branches, 30% functions/lines/statements
- Core modules threshold: 60% lines

### Task 4: Improve Core Coverage (AC: 6-7)

**Responsável:** @qa (Quinn) + @dev (Dex)
**Effort:** 4-6h

Priority modules:
- [ ] 4.1 `.aios-core/core/` - Target 85% (DEFERRED - requires separate story)
- [ ] 4.2 `.aios-core/development/scripts/squad/` - Target 85% (DEFERRED)
- [ ] 4.3 `src/wizard/` - Target 80% (DEFERRED)
- [ ] 4.4 `src/installer/` - Target 80% (DEFERRED)

**Note:** Coverage improvement from ~31% to 80% requires significant test writing effort. Recommend creating a follow-up story focused solely on test coverage improvement.

### Task 5: Add Integration Tests (AC: 9)

**Responsável:** @qa (Quinn) → @dev (Dex)
**Effort:** 3-4h

- [x] 5.1 Squad system integration tests (EXISTING: tests/integration/squad/*.test.js)
- [x] 5.2 Wizard flow integration tests (EXISTING: tests/integration/wizard-*.test.js)
- [x] 5.3 CLI commands integration tests (EXISTING: tests/unit/cli.test.js)
- [x] 5.4 Quality gates integration tests (EXISTING: tests/integration/quality-gate-pipeline.test.js)

**Note:** All required integration tests already exist and pass. No new tests needed.

### Task 6: CI Coverage Reporting (AC: 10)

**Responsável:** @devops (Gage) → @dev (Dex)
**Effort:** 1h

- [x] 6.1 Add coverage reporter to CI (already present: codecov-action@v4)
- [x] 6.2 Configure coverage thresholds (updated in jest.config.js)
- [x] 6.3 Add coverage badge to README
- [ ] 6.4 Fail build if coverage drops below 75% (threshold set to 30% baseline, will increase incrementally)

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

```javascript
// jest.config.js (Current baseline - Story TD-3)
// Target: 80% global, 85% core - to be achieved incrementally
{
  "coverageThreshold": {
    "global": {
      "branches": 25,
      "functions": 30,
      "lines": 30,
      "statements": 30
    },
    ".aios-core/core/": {
      "lines": 60
    }
  }
}
```

**Note:** Thresholds set to current baseline (~31% coverage). Will increase incrementally via follow-up story.

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
| CI changes cause build failures | Low | High | Keep backup of original workflow |

### Rollback Procedure

If CI changes cause issues:
1. Revert `.github/workflows/ci.yml` to previous version
2. Run `git revert <commit>` for the optimization commit
3. Notify team via PR comment
4. Create hotfix story if needed

---

## Definition of Done

- [x] CI runs in < 5 minutes (currently ~40 seconds for PRs)
- [x] npm caching working (cache-dependency-path configured)
- [x] Path-based job skipping working (dorny/paths-filter@v3 implemented)
- [ ] Test coverage >= 80% (DEFERRED to follow-up story - current ~31%)
- [x] Coverage report in CI (codecov integration working)
- [ ] No files below 60% coverage (DEFERRED - requires coverage improvement story)
- [ ] PR approved and merged

---

**Story Points:** 8
**Sprint:** 13
**Priority:** Medium
**Type:** Tech Debt

---

## File List

Files to be modified in this story:

### Files to MODIFY

| File | Action | Task |
|------|--------|------|
| `.github/workflows/ci.yml` | Optimize workflow (caching, parallelization, path filtering) | Task 2 |
| `jest.config.js` | Add coverage thresholds | Task 6 |
| `README.md` | Add coverage badge | Task 6 |
| `package.json` | Add coverage scripts if needed | Task 6 |

### Files to CREATE

| File | Purpose | Task |
|------|---------|------|
| `tests/integration/squad/squad-system.test.js` | Squad system integration tests | Task 5.1 |
| `tests/integration/wizard/wizard-flow.test.js` | Wizard flow integration tests | Task 5.2 |
| `tests/integration/cli/cli-commands.test.js` | CLI commands integration tests | Task 5.3 |
| `tests/integration/quality-gates/gates.test.js` | Quality gates integration tests | Task 5.4 |

### Files to IMPROVE COVERAGE

| File | Current | Target | Task |
|------|---------|--------|------|
| `.aios-core/core/**/*.js` | ~60% | 85% | Task 4.1 |
| `.aios-core/development/scripts/squad/**/*.js` | ~65% | 85% | Task 4.2 |
| `src/wizard/**/*.js` | ~50% | 80% | Task 4.3 |
| `src/installer/**/*.js` | ~55% | 80% | Task 4.4 |

**Total: 4 modified, 4+ created, 4 directories improved**

---

## Change Log

| Date | Version | Author | Change |
|------|---------|--------|--------|
| 2025-12-26 | 1.0 | @po (Pax) | Story created from tech debt consolidation |
| 2025-12-27 | 1.1 | @po (Pax) | PO Validation: Added CodeRabbit Integration, File List, refined ACs, added rollback procedure |
| 2025-12-27 | 1.2 | @dev (Dex) | Implementation: CI optimizations (path-based skipping, workflow dispatch), coverage audit, jest.config.js fixes |
| 2025-12-27 | 1.3 | @qa (Quinn) | QA Review: PASS with CONCERNS - CI portion complete, coverage deferred with justification |
| 2025-12-27 | 1.4 | @dev (Dex) | QA Fixes Applied: Updated Dev Notes thresholds, fixed paths-filter version |

---

## QA Results

**Review Date:** 2025-12-27
**Reviewer:** @qa (Quinn)
**Gate Decision:** ✅ PASS with CONCERNS

### Acceptance Criteria Verification

| AC# | Requirement | Status |
|-----|-------------|--------|
| 1 | CI runs < 5 minutes | ✅ PASS (~40s) |
| 2 | npm caching configured | ✅ PASS |
| 3 | Parallel job execution | ✅ PASS |
| 4 | Path-based job skipping | ✅ PASS |
| 5 | Cost reduction 30% | ⚠️ PARTIAL (not measured) |
| 6 | Coverage >= 80% | ❌ DEFERRED |
| 7 | Core modules >= 85% | ❌ DEFERRED |
| 8 | No file < 60% | ❌ DEFERRED |
| 9 | Integration tests | ✅ PASS |
| 10 | Coverage report in CI | ✅ PASS |

### Test Results

- ESLint: ✅ 0 errors (411 pre-existing warnings)
- TypeCheck: ✅ PASS
- Jest: ✅ 2486 passed (1 failed - unrelated to TD-3)

### Issues Found

| Severity | Issue | Action |
|----------|-------|--------|
| MEDIUM | Dev Notes shows 75-80% thresholds but impl has 25-30% | Update docs |
| MEDIUM | Scope reduction (ACs 6-8 deferred) needs PO approval | Get PO sign-off |
| LOW | Example uses @v2 but impl uses @v3 | Update example |

### Required Actions

- [x] Update Dev Notes section to match actual jest.config.js thresholds
- [x] Get PO approval for scope reduction (APPROVED - 2025-12-27)
- [x] Update paths-filter version in example (@v2 → @v3)

### Assessment

CI/CD optimization complete and working. Coverage improvement legitimately deferred with valid justification. Story approved for PR with minor documentation fixes required.
