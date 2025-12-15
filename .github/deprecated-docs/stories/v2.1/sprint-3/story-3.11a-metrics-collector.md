# STORY 3.11a: Quality Gates Metrics Collector

**ID:** 3.11a | **Epic:** [EPIC-S3](../../../epics/epic-s3-quality-templates.md)
**Sprint:** 3 | **Points:** 5 | **Priority:** 🟠 High | **Created:** 2025-12-05
**Updated:** 2025-12-05
**Status:** 🟡 In Review

**Reference:** [Decisão 4 - Quality Gates](../../../audits/PEDRO-DECISION-LOG.md#decisão-4)

**Predecessor:** Stories 3.1, 3.3-3.4, 3.5 (Quality Gates layers) ✅
**Successor:** Story 3.11b (Dashboard UI)

---

## User Story

**Como** desenvolvedor ou tech lead,
**Quero** sistema automatizado de coleta de métricas dos Quality Gates,
**Para que** tenha dados históricos para análise de qualidade e tendências.

---

## Acceptance Criteria

### Data Collection
- [x] AC3.11a.1: Collector captura métricas de pre-commit runs (Layer 1)
- [x] AC3.11a.2: Collector captura métricas de CodeRabbit reviews (Layer 2)
- [x] AC3.11a.3: Collector captura métricas de human reviews (Layer 3)
- [x] AC3.11a.4: Métricas incluem: pass/fail, duration, timestamp, findings count

### Data Storage
- [x] AC3.11a.5: Dados armazenados em JSON file estruturado
- [x] AC3.11a.6: Schema JSON validado com JSON Schema
- [x] AC3.11a.7: Histórico mantido por 30 dias (auto-cleanup)
- [x] AC3.11a.8: File location: `.aios/data/quality-metrics.json`

### Integration Hooks
- [x] AC3.11a.9: Hook integrado ao pre-commit workflow
- [x] AC3.11a.10: Hook integrado ao PR automation workflow
- [x] AC3.11a.11: CLI command disponível: `aios metrics record`

### Seed Data
- [x] AC3.11a.12: Script gera dados seed realistas para 30 dias
- [x] AC3.11a.13: Seed data reflete padrões típicos de projeto

---

## Scope

### File Locations

| Artifact | Location |
|----------|----------|
| Collector Module | `.aios-core/quality/metrics-collector.js` |
| Data File | `.aios/data/quality-metrics.json` |
| Schema | `.aios-core/quality/schemas/quality-metrics.schema.json` |
| Seed Script | `.aios-core/quality/seed-metrics.js` |
| CLI Commands | `.aios-core/cli/commands/metrics/index.js` |
| CLI Subcommands | `.aios-core/cli/commands/metrics/{record,show,seed,cleanup}.js` |

> **Note:** CLI follows existing pattern (see `qa/`, `mcp/`, `manifest/` for reference)

### Data Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["version", "lastUpdated", "layers", "trends"],
  "properties": {
    "version": { "type": "string", "const": "1.0" },
    "lastUpdated": { "type": "string", "format": "date-time" },
    "retentionDays": { "type": "integer", "default": 30 },
    "layers": {
      "type": "object",
      "properties": {
        "layer1": { "$ref": "#/definitions/layerMetrics" },
        "layer2": { "$ref": "#/definitions/layer2Metrics" },
        "layer3": { "$ref": "#/definitions/layerMetrics" }
      }
    },
    "trends": {
      "type": "object",
      "properties": {
        "autoCatchRate": {
          "type": "array",
          "items": { "$ref": "#/definitions/trendPoint" }
        }
      }
    },
    "history": {
      "type": "array",
      "items": { "$ref": "#/definitions/runRecord" }
    }
  },
  "definitions": {
    "layerMetrics": {
      "type": "object",
      "properties": {
        "passRate": { "type": "number", "minimum": 0, "maximum": 1 },
        "avgTimeMs": { "type": "integer" },
        "totalRuns": { "type": "integer" },
        "lastRun": { "type": "string", "format": "date-time" }
      }
    },
    "layer2Metrics": {
      "type": "object",
      "allOf": [{ "$ref": "#/definitions/layerMetrics" }],
      "properties": {
        "autoCatchRate": { "type": "number" },
        "coderabbit": {
          "type": "object",
          "properties": {
            "active": { "type": "boolean" },
            "findingsCount": { "type": "integer" },
            "severityBreakdown": {
              "type": "object",
              "properties": {
                "critical": { "type": "integer" },
                "high": { "type": "integer" },
                "medium": { "type": "integer" },
                "low": { "type": "integer" }
              }
            }
          }
        },
        "quinn": {
          "type": "object",
          "properties": {
            "findingsCount": { "type": "integer" },
            "topCategories": { "type": "array", "items": { "type": "string" } }
          }
        }
      }
    },
    "trendPoint": {
      "type": "object",
      "required": ["date", "value"],
      "properties": {
        "date": { "type": "string", "format": "date" },
        "value": { "type": "number" }
      }
    },
    "runRecord": {
      "type": "object",
      "required": ["timestamp", "layer", "passed"],
      "properties": {
        "timestamp": { "type": "string", "format": "date-time" },
        "layer": { "type": "integer", "enum": [1, 2, 3] },
        "passed": { "type": "boolean" },
        "durationMs": { "type": "integer" },
        "findingsCount": { "type": "integer" },
        "metadata": { "type": "object" }
      }
    }
  }
}
```

### Metrics Collector API

```javascript
// .aios-core/quality/metrics-collector.js
class MetricsCollector {
  constructor(options = {}) {
    this.dataFile = options.dataFile || '.aios/data/quality-metrics.json';
    this.retentionDays = options.retentionDays || 30;
  }

  // Record a run from any layer
  async recordRun(layer, result) {
    // layer: 1 | 2 | 3
    // result: { passed, durationMs, findingsCount, metadata }
  }

  // Record Layer 1 pre-commit
  async recordPreCommit(result) {
    return this.recordRun(1, result);
  }

  // Record Layer 2 PR review
  async recordPRReview(result) {
    // result includes coderabbit and quinn findings
  }

  // Record Layer 3 human review
  async recordHumanReview(result) {
    return this.recordRun(3, result);
  }

  // Get current metrics summary
  async getMetrics() {
    return this.load();
  }

  // Cleanup old records (> retentionDays)
  async cleanup() {
    const metrics = await this.load();
    const cutoff = Date.now() - (this.retentionDays * 24 * 60 * 60 * 1000);
    metrics.history = metrics.history.filter(r =>
      new Date(r.timestamp).getTime() > cutoff
    );
    await this.save(metrics);
  }

  // Recalculate aggregates from history
  async recalculate() {
    // Recalculates passRate, avgTime, etc from history
  }
}

module.exports = { MetricsCollector };
```

### CLI Commands

```bash
# Record metrics manually
aios metrics record --layer 1 --passed --duration 3200

# View current metrics
aios metrics show

# Generate seed data
aios metrics seed --days 30

# Cleanup old records
aios metrics cleanup

# Export metrics
aios metrics export --format json|csv
```

---

## Tasks

### Schema & Data Structure (2h)
- [x] 3.11a.1: Create JSON Schema for metrics
  - [x] 3.11a.1.1: Define schema in `.aios-core/quality/schemas/quality-metrics.schema.json`
  - [x] 3.11a.1.2: Add schema validation to collector
  - [x] 3.11a.1.3: Create empty metrics file initializer
  - [x] 3.11a.1.4: Create `.aios/data/` directory if not exists

### Metrics Collector Implementation (4h)
- [x] 3.11a.2: Implement MetricsCollector class
  - [x] 3.11a.2.1: Core CRUD operations (load, save, recordRun)
  - [x] 3.11a.2.2: Layer-specific recording methods
  - [x] 3.11a.2.3: Aggregation recalculation logic
  - [x] 3.11a.2.4: Auto-cleanup for retention policy
  - [x] 3.11a.2.5: Thread-safe file operations (file locking)

### Integration Hooks (3h)
- [x] 3.11a.3: Integrate with existing workflows
  - [x] 3.11a.3.1: Hook into pre-commit (husky post-run)
  - [x] 3.11a.3.2: Hook into PR automation workflow
  - [x] 3.11a.3.3: Document manual recording for Layer 3

### CLI Integration (2h)
- [x] 3.11a.4: Add CLI commands
  - [x] 3.11a.4.1: `aios metrics record` command
  - [x] 3.11a.4.2: `aios metrics show` command
  - [x] 3.11a.4.3: `aios metrics seed` command
  - [x] 3.11a.4.4: `aios metrics cleanup` command

### Seed Data Generator (2h)
- [x] 3.11a.5: Create seed data script
  - [x] 3.11a.5.1: Generate realistic 30-day history
  - [x] 3.11a.5.2: Include realistic pass rates (85-95%)
  - [x] 3.11a.5.3: Include severity distribution patterns
  - [x] 3.11a.5.4: Document seed data generation

### Testing (3h)
- [x] 3.11a.6: Create test suite
  - [x] 3.11a.6.1: Unit tests for MetricsCollector
  - [x] 3.11a.6.2: Integration tests for hooks
  - [x] 3.11a.6.3: Schema validation tests
  - [x] 3.11a.6.4: Retention cleanup tests

**Total Estimated:** 16h (~2 days)

---

## Test Cases

| Test ID | Name | Type | Priority | AC Coverage |
|---------|------|------|----------|-------------|
| MET-01 | Record Layer 1 pre-commit run | Unit | P0 | AC3.11a.1 |
| MET-02 | Record Layer 2 PR review | Unit | P0 | AC3.11a.2 |
| MET-03 | Record Layer 3 human review | Unit | P0 | AC3.11a.3 |
| MET-04 | Metrics include required fields | Unit | P0 | AC3.11a.4 |
| MET-05 | Data stored in correct JSON structure | Unit | P0 | AC3.11a.5 |
| MET-06 | Schema validation passes | Unit | P0 | AC3.11a.6 |
| MET-07 | Auto-cleanup removes old records | Unit | P0 | AC3.11a.7 |
| MET-08 | Data file created at correct location | Unit | P0 | AC3.11a.8 |
| MET-09 | Pre-commit hook records metrics | Integration | P0 | AC3.11a.9 |
| MET-10 | PR automation records metrics | Integration | P1 | AC3.11a.10 |
| MET-11 | CLI record command works | Integration | P0 | AC3.11a.11 |
| MET-12 | Seed data generates 30 days | Unit | P0 | AC3.11a.12 |
| MET-13 | Seed data has realistic patterns | Unit | P1 | AC3.11a.13 |

---

## 🤖 CodeRabbit Integration

### Story Type Analysis

**Primary Type:** Backend/Infrastructure
**Secondary Type(s):** Data Processing, CLI
**Complexity:** Medium

### Specialized Agent Assignment

**Primary Agents:**
- @dev: Full implementation

**Supporting Agents:**
- @qa: Unit and integration testing

### Quality Gate Tasks

- [ ] Pre-Commit (@dev): Run MET-01 to MET-13 tests
- [ ] Pre-PR (@github-devops): Schema validation, lint

### Self-Healing Configuration

**Expected Self-Healing:**
- Primary Agent: @dev (light mode)
- Max Iterations: 2
- Timeout: 10 minutes
- Severity Filter: CRITICAL, HIGH

### Focus Areas

**Primary Focus:**
- Data integrity
- Schema compliance
- Thread safety

**Secondary Focus:**
- Performance (file I/O)
- Error handling

---

## Dependencies

**Depends on:**
- Story 3.1 (Pre-Commit Hooks) ✅
- Story 3.3-3.4 (PR Automation) ✅ (waiver)
- Story 3.5 (Human Review) ✅

**Blocks:**
- Story 3.11b (Dashboard UI)

---

## Definition of Done

- [x] All acceptance criteria met (13/13)
- [x] MET-01 to MET-13 tests pass
- [x] Schema validation working
- [x] CLI commands functional
- [x] Seed data generated
- [x] Documentation updated
- [x] QA Review passed
- [ ] PR created and approved

---

## Dev Agent Record

**Implementation Date:** 2025-12-05
**Agent:** Dex (@dev)
**Mode:** YOLO (autonomous)

### Files Created

| File | Purpose |
|------|---------|
| `.aios-core/quality/schemas/quality-metrics.schema.json` | JSON Schema for metrics validation |
| `.aios-core/quality/metrics-collector.js` | Main MetricsCollector class |
| `.aios-core/quality/seed-metrics.js` | Seed data generator |
| `.aios-core/quality/metrics-hook.js` | Workflow integration hooks |
| `.aios-core/cli/commands/metrics/index.js` | CLI command entry point |
| `.aios-core/cli/commands/metrics/record.js` | `aios metrics record` command |
| `.aios-core/cli/commands/metrics/show.js` | `aios metrics show` command |
| `.aios-core/cli/commands/metrics/seed.js` | `aios metrics seed` command |
| `.aios-core/cli/commands/metrics/cleanup.js` | `aios metrics cleanup` command |
| `tests/unit/quality/metrics-collector.test.js` | MetricsCollector unit tests |
| `tests/unit/quality/seed-metrics.test.js` | Seed data generator tests |
| `tests/unit/quality/metrics-hook.test.js` | Hook integration tests |

### Files Modified

| File | Changes |
|------|---------|
| `.aios-core/cli/index.js` | Added metrics command registration |

### Test Results

```
Test Suites: 3 passed, 3 total
Tests:       57 passed, 57 total
```

### Implementation Notes

- JSON Schema modified from story spec to fix `allOf` compatibility issue with `additionalProperties: false`
- `lastRun` field allows null for initial state (type: `["string", "null"]`)
- Thread-safe file operations using file locking mechanism
- Hooks fail gracefully (log warnings, don't break parent process)
- Seed data generates realistic patterns:
  - Layer 1: ~92% pass rate, 2-8s duration
  - Layer 2: ~87% pass rate, 2-10min duration
  - Layer 3: ~96% pass rate, 5-30min duration

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-12-05 | 1.0 | Story created (split from 3.11) | Pax (@po) |
| 2025-12-05 | 1.1 | PO validation complete; file paths aligned with codebase patterns; Ready for Dev | Pax (@po) |
| 2025-12-05 | 1.2 | Implementation complete; all 13 ACs met; 57 tests passing; In Review | Dex (@dev) |
| 2025-12-05 | 1.3 | QA Review PASSED; approved for merge | Quinn (@qa) |

---

## QA Results

### QA Gate Decision: ✅ PASS

**Reviewed by:** Quinn (@qa)
**Review Date:** 2025-12-05
**Gate Status:** PASS

### Automated Scan Results

**CodeRabbit:** ✅ PASS - No CRITICAL or HIGH issues detected

### Acceptance Criteria Verification

| AC | Description | Status | Evidence |
|----|-------------|--------|----------|
| AC3.11a.1 | Layer 1 metrics capture | ✅ PASS | `recordPreCommit()` method, unit tests MET-01 |
| AC3.11a.2 | Layer 2 metrics capture | ✅ PASS | `recordPRReview()` with CodeRabbit/Quinn, MET-02 |
| AC3.11a.3 | Layer 3 metrics capture | ✅ PASS | `recordHumanReview()` method, MET-03 |
| AC3.11a.4 | Required fields included | ✅ PASS | Schema validates pass/fail, duration, timestamp, findings |
| AC3.11a.5 | JSON file storage | ✅ PASS | `.aios/data/quality-metrics.json` created |
| AC3.11a.6 | JSON Schema validation | ✅ PASS | AJV validation in MetricsCollector |
| AC3.11a.7 | 30-day retention cleanup | ✅ PASS | `cleanup()` method with tests |
| AC3.11a.8 | Correct file location | ✅ PASS | DEFAULT_DATA_FILE constant |
| AC3.11a.9 | Pre-commit hook integration | ✅ PASS | `metrics-hook.js` with graceful fallback |
| AC3.11a.10 | PR automation integration | ✅ PASS | `recordPRReviewMetrics()` in hooks |
| AC3.11a.11 | CLI record command | ✅ PASS | `aios metrics record` functional |
| AC3.11a.12 | 30-day seed data | ✅ PASS | `generateSeedData()` with realistic patterns |
| AC3.11a.13 | Realistic patterns | ✅ PASS | Weekend reduction, layer-specific pass rates |

### Test Coverage

| Test Suite | Tests | Status |
|------------|-------|--------|
| metrics-collector.test.js | 26 | ✅ PASS |
| seed-metrics.test.js | 20 | ✅ PASS |
| metrics-hook.test.js | 11 | ✅ PASS |
| **Total** | **57** | **✅ ALL PASS** |

### Code Quality Assessment

| Aspect | Rating | Notes |
|--------|--------|-------|
| Error Handling | ✅ Good | Graceful degradation in hooks |
| Thread Safety | ✅ Good | File locking mechanism implemented |
| Documentation | ✅ Good | JSDoc on all public methods |
| Test Coverage | ✅ Good | All ACs have corresponding tests |
| Code Style | ✅ Good | No lint errors in quality modules |

### Schema Deviation (Documented)

The implementation deviates from story spec schema:
- **Reason:** `allOf` with `additionalProperties: false` causes AJV validation failures
- **Resolution:** Explicit property definition in `layer2Metrics` instead of inheritance
- **Impact:** None - functionally equivalent, better AJV compatibility

### Recommendation

**APPROVED for merge.** All 13 acceptance criteria verified, 57 tests passing, no code quality issues.

---

## PO Validation Notes (2025-12-05)

### Split Rationale

Story 3.11 original tinha escopo muito amplo (8 pontos) para:
- Metrics collection
- Dashboard UI
- Deployment
- Accessibility

Dividido em:
- **3.11a** (esta): Metrics Collector & Data Structure (5 pontos)
- **3.11b**: Dashboard UI & Deployment (8 pontos)

### Readiness Score: 9/10

Story está bem definida com:
- ✅ 13 ACs claros e testáveis
- ✅ Schema JSON completo
- ✅ API bem definida
- ✅ CLI commands especificados
- ✅ 13 test cases mapeados
- ✅ Predecessors completos

---

**Created by:** Pax 🎯 (PO)
**Split from:** Story 3.11
