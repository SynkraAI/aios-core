# Story ETL.4: Tests + Docs + CI/CD (P1) - Production Readiness

**Epic:** Epic ETL - ETL Expansion Pack
**Status:** Draft
**Priority:** P1 (High - Production Gate)
**Estimated Effort:** 12 hours
**Sprint:** Week 2-3 (Q1 2026)
**Dependencies:** Stories ETL.1, ETL.2, ETL.3 must be complete

---

## Story

**As a** development team and future users,
**I want** comprehensive tests (85%+ coverage), complete documentation, and automated CI/CD,
**so that** ETL Expansion Pack is production-ready, maintainable, and passes all quality gates before v1.0 release.

---

## Acceptance Criteria

1. **Unit Test Coverage ≥85%**
   - All 4 collectors have comprehensive unit tests
   - All transformers tested with edge cases
   - MCP server logic tested (mocked Python calls)
   - Python bridge tested (CLI interface)
   - Coverage report generated (HTML + JSON)

2. **Integration Tests Complete**
   - End-to-end flow: MCP → Python → Collector → Response
   - All 4 tools tested via 1MCP HTTP endpoint
   - Preset filtering validated (3 presets)
   - Error propagation tested (MCP → Python → Collector)
   - Performance benchmarks documented

3. **E2E Tests Passing**
   - Real MMOS workflow uses ETL successfully
   - Real agent (@analyst, @docs) uses ETL successfully
   - Token budget validation in Claude Code (`/context` command)
   - Cost tracking validation (real AssemblyAI API call)
   - No regressions in existing functionality

4. **Complete Documentation**
   - README.md: Installation, quick start, all 4 tools
   - API.md: Tool schemas, parameters, examples
   - ARCHITECTURE.md: System design, data flow diagrams
   - TROUBLESHOOTING.md: Common issues, debugging tips
   - INTEGRATION.md: How to integrate ETL in agent workflows

5. **CI/CD Pipeline Operational**
   - GitHub Actions workflow configured
   - Tests run on PR (unit + integration)
   - Linting enforced (eslint, black, flake8)
   - Coverage threshold enforced (85%)
   - Deployment to 1MCP automated (on merge to main)

6. **Quality Gates Automated**
   - CodeRabbit integration configured (`.coderabbit.yml`)
   - Pre-commit hooks installed (lint, test)
   - Security scan configured (npm audit, safety)
   - Dependency check automated (outdated packages)
   - Release tagging automated (semantic versioning)

---

## 🤖 CodeRabbit Integration

### Story Type Analysis
**Primary Type**: Deployment (CI/CD, quality gates)
**Secondary Type(s)**: Security (dependency scanning), Architecture (documentation)
**Complexity**: High (comprehensive quality infrastructure)

### Specialized Agent Assignment
**Primary Agents**:
- @qa (Quinn): Test coverage and quality validation
- @devops (Gage): CI/CD pipeline and deployment automation
- @docs (Ajax): Complete documentation suite

**Supporting Agents**:
- @dev (Dex): Pre-commit hooks and linting
- @security (Apex): Security scanning and dependency audit

### Quality Gate Tasks
- [ ] Pre-Commit (@dev): All tests pass, coverage ≥85%, linting clean
- [ ] Pre-PR (@devops): CI/CD pipeline green, no security vulnerabilities
- [ ] Pre-Deployment (@devops): E2E tests pass, documentation complete

### CodeRabbit Focus Areas
**Primary Focus**:
- Test coverage completeness (85%+ enforced)
- CI/CD configuration correctness (GitHub Actions YAML)
- Documentation accuracy (code examples run successfully)
- Security scan results (no high/critical vulnerabilities)

**Secondary Focus**:
- Performance benchmarks documented
- Error message clarity
- Integration examples tested

---

## Tasks / Subtasks

### Task 1: Complete Unit Tests (4h)
- [ ] Create comprehensive test suite for all collectors (AC: 1)
  - [ ] `tests/test_video_transcriber.py` (extend from Story 1)
    - [ ] Test successful transcription
    - [ ] Test invalid API key
    - [ ] Test network timeout
    - [ ] Test invalid video URL
    - [ ] Test speaker labels
    - [ ] Test cost calculation edge cases
  - [ ] `tests/test_web_collector.py` (extend from Story 2)
    - [ ] Add edge cases (malformed HTML, encoding issues)
    - [ ] Add performance tests (large pages)
  - [ ] `tests/test_email_sampler.py` (extend from Story 2)
    - [ ] Add edge cases (corrupted mbox, empty archive)
    - [ ] Add relevance scoring accuracy tests
  - [ ] `tests/test_book_processor.py` (extend from Story 2)
    - [ ] Add edge cases (password-protected PDF, DRM epub)
    - [ ] Add chunking boundary tests
- [ ] Create transformer tests (AC: 1)
  - [ ] `tests/test_markdown_cleaner.py`
  - [ ] `tests/test_token_counter.py`
  - [ ] `tests/test_quality_validator.py`
- [ ] Create MCP server tests (AC: 1)
  - [ ] `tests/test_mcp_server.js`
    - [ ] Test tool registration
    - [ ] Test tool call routing
    - [ ] Test error handling (Python process crash)
    - [ ] Test timeout handling
- [ ] Create Python bridge tests (AC: 1)
  - [ ] `tests/test_bridge.py`
    - [ ] Test CLI argument parsing
    - [ ] Test JSON serialization
    - [ ] Test collector routing
    - [ ] Test error exit codes
- [ ] Run coverage: `pytest --cov=lib --cov-report=html --cov-report=json` (AC: 1)
- [ ] Verify ≥85% coverage (AC: 1)

### Task 2: Integration Tests (2h)
- [ ] Create end-to-end integration tests (AC: 2)
  - [ ] `tests/integration/test_e2e_video.js`
    - [ ] Test: MCP client → transcribe_video → AssemblyAI → Response
    - [ ] Measure latency (target: <10s for 1min video)
  - [ ] `tests/integration/test_e2e_web.js`
    - [ ] Test: MCP client → collect_web_content → Response
    - [ ] Measure latency (target: <5s per page)
  - [ ] `tests/integration/test_e2e_email.js`
    - [ ] Test: MCP client → sample_email_archive → Response
    - [ ] Measure latency (target: <10s for 10K archive)
  - [ ] `tests/integration/test_e2e_books.js`
    - [ ] Test: MCP client → process_book → Response
    - [ ] Measure latency (target: <15s for 300-page PDF)
- [ ] Create 1MCP preset tests (AC: 2)
  - [ ] `tests/integration/test_1mcp_presets.js`
    - [ ] Test ETL via aios-dev preset
    - [ ] Test ETL via aios-research preset
    - [ ] Test ETL via aios-mmos preset
    - [ ] Test ETL NOT available in preset without it
- [ ] Document performance benchmarks (AC: 2)

### Task 3: E2E Tests (2h)
- [ ] Create real-world usage tests (AC: 3)
  - [ ] Test MMOS workflow integration
    - [ ] Create test MMOS workflow using ETL
    - [ ] Verify video transcription works in MMOS context
    - [ ] Verify cost tracking in MMOS context
  - [ ] Test agent integration (@analyst, @docs)
    - [ ] Create test scenario: @analyst researches competitor
    - [ ] Create test scenario: @docs extracts tutorial from video
  - [ ] Token budget validation (AC: 3)
    - [ ] Measure tokens before/after ETL in Claude Code
    - [ ] Verify aios-dev: ~45K (+10K from 35K)
    - [ ] Verify aios-research: ~60K (+10K from 50K)
    - [ ] Verify aios-mmos: ~55K (+10K from 45K)
- [ ] Run regression tests (AC: 3)
  - [ ] Verify existing agent workflows unaffected
  - [ ] Verify 1MCP still works without ETL preset

### Task 4: Complete Documentation (2h)
- [ ] Create/update README.md (AC: 4)
  - [ ] Project overview
  - [ ] Installation instructions (Node.js + Python)
  - [ ] Quick start (5-minute tutorial)
  - [ ] All 4 tools with examples
  - [ ] Troubleshooting section
  - [ ] Contributing guidelines
- [ ] Create API.md (extend from Story 3) (AC: 4)
  - [ ] Complete tool schemas
  - [ ] Parameter descriptions
  - [ ] Return value schemas
  - [ ] Error codes table
  - [ ] Code examples (copy-paste ready)
- [ ] Create ARCHITECTURE.md (AC: 4)
  - [ ] System design diagram
  - [ ] Component descriptions (MCP server, bridge, collectors)
  - [ ] Data flow diagrams (all 4 tools)
  - [ ] Technology choices rationale
  - [ ] Future enhancements (Story 5 + v2.0)
- [ ] Create TROUBLESHOOTING.md (AC: 4)
  - [ ] Common errors and solutions
  - [ ] Debugging tips (MCP, Python, 1MCP)
  - [ ] FAQ
  - [ ] Getting help (issue templates)
- [ ] Create INTEGRATION.md (AC: 4)
  - [ ] How to use ETL in MMOS workflows
  - [ ] How to use ETL in agent workflows
  - [ ] Preset selection guide (reference Epic 6.2.2)
  - [ ] Best practices

### Task 5: CI/CD Pipeline (2h)
- [ ] Create GitHub Actions workflow (AC: 5)
  - [ ] `.github/workflows/test.yml`
    - [ ] Trigger: PR, push to main
    - [ ] Jobs: lint, test-node, test-python, integration
    - [ ] Node.js: eslint, jest
    - [ ] Python: black, flake8, pytest --cov
    - [ ] Coverage upload to Codecov
    - [ ] Status checks required for merge
  - [ ] `.github/workflows/deploy.yml`
    - [ ] Trigger: push to main (after merge)
    - [ ] Deploy: Update 1MCP registration (if needed)
    - [ ] Release: Auto-tag with semantic version
- [ ] Configure linting (AC: 5)
  - [ ] `.eslintrc.json` for Node.js
  - [ ] `.flake8` for Python
  - [ ] `pyproject.toml` for black
- [ ] Configure pre-commit hooks (AC: 6)
  - [ ] `.pre-commit-config.yaml`
    - [ ] eslint (JavaScript)
    - [ ] black (Python formatting)
    - [ ] flake8 (Python linting)
    - [ ] pytest (Python tests)
    - [ ] jest (Node.js tests)
- [ ] Test CI/CD pipeline (AC: 5)
  - [ ] Create test PR
  - [ ] Verify all checks pass
  - [ ] Verify coverage report generated
  - [ ] Verify merge allowed only if green

### Task 6: Quality Gates & Security (30min)
- [ ] Create `.coderabbit.yml` configuration (AC: 6)
  - [ ] Enable review on all PRs
  - [ ] Focus areas: test coverage, error handling, security
  - [ ] Auto-comment on coverage drops
- [ ] Configure security scanning (AC: 6)
  - [ ] Add `npm audit` to CI pipeline
  - [ ] Add `safety check` (Python) to CI pipeline
  - [ ] Fail build on high/critical vulnerabilities
- [ ] Configure dependency checks (AC: 6)
  - [ ] Add `npm outdated` check (warning only)
  - [ ] Add `pip list --outdated` check (warning only)
- [ ] Create issue templates (AC: 6)
  - [ ] `.github/ISSUE_TEMPLATE/bug_report.md`
  - [ ] `.github/ISSUE_TEMPLATE/feature_request.md`
- [ ] Create PR template (AC: 6)
  - [ ] `.github/PULL_REQUEST_TEMPLATE.md`
    - [ ] Checklist: tests added, docs updated, coverage ≥85%

---

## Dev Notes

### Epic Context
This is **Story 4 of 5** in the ETL Expansion Pack epic. This story transforms ETL from "working code" to "production-ready expansion pack" by adding comprehensive testing, documentation, and automation.

**Success = ETL passes all quality gates and is ready for v1.0 release.**

### Quality Standards
**Test Coverage Target:** 85%+
**Why 85%?** Industry standard for production code, balances thoroughness with practicality.

**Documentation Standard:** Every feature documented with working examples
**Why?** Users should never need to read source code to use ETL.

**CI/CD Standard:** All checks automated, no manual steps
**Why?** Prevents human error, ensures consistency.

### Testing Pyramid (ETL Context)
```
          E2E Tests
        (Real workflows)
      [5 tests, 2h]
           │
    Integration Tests
    (MCP → Python → API)
      [12 tests, 2h]
           │
      Unit Tests
  (Collectors, transformers)
    [50+ tests, 4h]
```

### Coverage Breakdown Target
- Collectors: 90%+ (core logic)
- Transformers: 95%+ (pure functions)
- MCP Server: 80%+ (harder to test I/O)
- Python Bridge: 85%+ (CLI interface)
- **Overall: ≥85%**

### Performance Benchmarks (from Roundtable)
| Tool | Input | Target Latency | Measured |
|------|-------|----------------|----------|
| transcribe_video | 1min video | <10s | ___ |
| collect_web_content | 1 page | <5s | ___ |
| sample_email_archive | 10K archive | <10s | ___ |
| process_book | 300-page PDF | <15s | ___ |

### Documentation Structure
```
expansion-packs/etl/
├── README.md               # Entry point (installation, quick start)
├── docs/
│   ├── API.md              # Tool reference
│   ├── ARCHITECTURE.md     # Technical deep dive
│   ├── TROUBLESHOOTING.md  # Common issues
│   └── INTEGRATION.md      # Agent/workflow integration
└── examples/
    ├── mmos-workflow.js    # MMOS integration example
    ├── analyst-research.js # @analyst usage example
    └── docs-tutorial.js    # @docs usage example
```

### CI/CD Pipeline Flow
```
PR Created
    ↓
Lint (eslint, black, flake8)
    ↓
Unit Tests (jest, pytest)
    ↓
Coverage Check (≥85%)
    ↓
Integration Tests
    ↓
Security Scan (npm audit, safety)
    ↓
All Green? → Merge Allowed
    ↓
Push to main
    ↓
Deploy (update 1MCP if needed)
    ↓
Auto-tag (semantic version)
```

### File Structure (25+ files created)
```
expansion-packs/etl/
├── .github/
│   ├── workflows/
│   │   ├── test.yml               # NEW
│   │   └── deploy.yml             # NEW
│   ├── ISSUE_TEMPLATE/            # NEW
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md   # NEW
├── tests/
│   ├── test_video_transcriber.py  # EXTENDED
│   ├── test_web_collector.py      # EXTENDED
│   ├── test_email_sampler.py      # EXTENDED
│   ├── test_book_processor.py     # EXTENDED
│   ├── test_markdown_cleaner.py   # NEW
│   ├── test_token_counter.py      # NEW
│   ├── test_quality_validator.py  # NEW
│   ├── test_mcp_server.js         # NEW
│   ├── test_bridge.py             # NEW
│   └── integration/               # NEW
│       ├── test_e2e_video.js
│       ├── test_e2e_web.js
│       ├── test_e2e_email.js
│       ├── test_e2e_books.js
│       └── test_1mcp_presets.js
├── docs/
│   ├── API.md                     # EXTENDED
│   ├── ARCHITECTURE.md            # NEW
│   ├── TROUBLESHOOTING.md         # NEW
│   └── INTEGRATION.md             # NEW
├── examples/
│   ├── mmos-workflow.js           # NEW
│   ├── analyst-research.js        # NEW
│   └── docs-tutorial.js           # NEW
├── .eslintrc.json                 # NEW
├── .flake8                        # NEW
├── pyproject.toml                 # NEW
├── .pre-commit-config.yaml        # NEW
├── .coderabbit.yml                # NEW
└── README.md                      # EXTENDED
```

### Testing Standards

**Test Framework**: Jest (Node.js), pytest (Python)
**Mocking**: Use mocks for external dependencies (AssemblyAI, network calls)
**Fixtures**: Store test data in `tests/fixtures/`

**Test Organization**:
```bash
# Unit tests
pytest tests/test_*.py --cov=lib --cov-report=html

# Integration tests (requires 1MCP running)
npm run test:integration

# E2E tests (requires real API keys)
export ASSEMBLYAI_API_KEY=real_key
npm run test:e2e
```

**Coverage Enforcement**:
```yaml
# .github/workflows/test.yml
- name: Check coverage
  run: |
    pytest --cov=lib --cov-fail-under=85
```

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-14 | 0.1 | Story draft created from Epic ETL | Sarah (@po) |

---

## Dev Agent Record

### Agent Model Used
_To be filled by dev agent during implementation_

### Debug Log References
_To be filled by dev agent during implementation_

### Completion Notes
_To be filled by dev agent during implementation_

### File List
_To be filled by dev agent during implementation_

**Expected Files (25+ new/updated):**
- All files listed in "File Structure" section above

---

## QA Results

_To be filled by QA agent after implementation_

**Acceptance Criteria Validation**:
- [ ] AC1: Unit Test Coverage ≥85%
- [ ] AC2: Integration Tests Complete
- [ ] AC3: E2E Tests Passing
- [ ] AC4: Complete Documentation
- [ ] AC5: CI/CD Pipeline Operational
- [ ] AC6: Quality Gates Automated

**Coverage Report**:
- [ ] Overall Coverage: ___%  (target: ≥85%)
- [ ] Collectors: ___%
- [ ] Transformers: ___%
- [ ] MCP Server: ___%
- [ ] Python Bridge: ___%

**Performance Benchmarks**:
- [ ] transcribe_video (1min): ___s (target: <10s)
- [ ] collect_web_content: ___s (target: <5s)
- [ ] sample_email_archive: ___s (target: <10s)
- [ ] process_book (300pg): ___s (target: <15s)

**CI/CD Validation**:
- [ ] Test workflow runs on PR
- [ ] Linting enforced
- [ ] Coverage threshold enforced
- [ ] Security scan operational
- [ ] Deploy workflow runs on merge

---

**Story ETL.4 Version:** 0.1 (Draft)
**Last Updated:** 2025-01-14
**Previous Story:** ETL.3 (MCP Expansion + Presets)
**Next Story:** ETL.5 (Batch + Cache - P2 Optimization)
