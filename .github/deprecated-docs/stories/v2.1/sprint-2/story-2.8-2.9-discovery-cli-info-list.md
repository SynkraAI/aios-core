# STORIES 2.8-2.9: Discovery CLI - Info & List

**IDs:** 2.8, 2.9 | **Épico:** [EPIC-S2](../../../epics/epic-s2-modular-architecture.md)
**Sprint:** 2 | **Points:** 8 (3+5) | **Priority:** 🟠 High | **Created:** 2025-01-19
**Updated:** 2025-11-30
**Status:** ✅ Complete

**Reference:** [ADR-002 Migration Map](../../architecture/decisions/ADR-002-migration-map.md)
**Quality Gate:** [2.8-2.9-discovery-cli.yml](../../qa/gates/2.8-2.9-discovery-cli.yml)

---

## 📊 User Stories

### Story 2.8: Info Command (3 pts)
**Como** developer, **Quero** `aios workers info <id>`, **Para** ver detalhes completos de um worker

### Story 2.9: List Command (5 pts)
**Como** developer, **Quero** `aios workers list`, **Para** explorar todos workers disponíveis

---

## ✅ Acceptance Criteria

### Story 2.8: Info Command
- [x] AC8.1: CLI command `aios workers info <id>` implemented
- [x] AC8.2: Displays all worker metadata in formatted output
- [x] AC8.3: Shows usage examples for the worker
- [x] AC8.4: Shows performance metrics
- [x] AC8.5: Error handling for invalid worker ID with suggestions ("did you mean?")
- [x] AC8.6: Output format options (`--format=pretty|json|yaml`)
- [x] AC8.7: Verbose mode (`--verbose`) for debug output
- [x] AC8.8: Info command completes in < 500ms

### Story 2.9: List Command
- [x] AC9.1: CLI command `aios workers list` implemented
- [x] AC9.2: Groups workers by category/subcategory
- [x] AC9.3: Category filter (`--category=<category>`)
- [x] AC9.4: Output format options (`--format=table|json|yaml|tree`)
- [x] AC9.5: Shows worker count per category
- [x] AC9.6: Pagination support for large lists (`--page`, `--limit`)
- [x] AC9.7: Count-only mode (`--count`) for quick statistics
- [x] AC9.8: Verbose mode (`--verbose`) for debug output
- [x] AC9.9: List command completes in < 1s with 200+ workers

### Shared
- [x] AC-S1: All P0 smoke tests pass (CLI-01 to CLI-03)
- [x] AC-S2: All P1 smoke tests pass (CLI-04 to CLI-10)
- [x] AC-S3: All P2 smoke tests pass (CLI-11 to CLI-12)
- [x] AC-S4: Help text shows clear usage for both commands

---

## 🔧 Scope

### Info Command Interface (2.8)

```bash
$ aios workers info data-transformer-json-csv

📦 JSON to CSV Transformer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ID:           data-transformer-json-csv
Category:     data / transformation
Executor:     Worker, Agent
Task Format:  TASK-FORMAT-V1
Path:         .aios-core/development/tasks/data/json-csv-transformer.md

Description:
  Converts JSON data to CSV format with configurable
  column mapping and delimiter options.

Inputs:
  - json (object|array) - JSON data to transform

Outputs:
  - csv (string) - CSV formatted data

Performance:
  Avg Duration:  50ms
  Cacheable:     Yes
  Parallelizable: Yes

Tags: etl, data, transformation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Usage Example:
  aios task run data-transformer-json-csv --input=data.json

Related Workers:
  - csv-json-transformer
  - json-validator

# JSON output
$ aios workers info data-transformer-json-csv --format=json
{
  "id": "data-transformer-json-csv",
  "name": "JSON to CSV Transformer",
  ...
}

# Error handling
$ aios workers info invalid-id
Error: Worker 'invalid-id' not found in registry.

Did you mean:
  - invalid-schema-checker
  - data-validator

Use 'aios workers search invalid' to find workers.
```

### List Command Interface (2.9)

```bash
$ aios workers list
97 workers available in 8 categories:

DATA (23 workers)
├── Transformation (12)
│   ├── json-csv-transformer
│   ├── csv-json-transformer
│   ├── xml-json-transformer
│   └── ... (+9 more)
├── Validation (8)
│   ├── json-validator
│   ├── schema-validator
│   └── ... (+6 more)
└── ETL (3)
    └── ...

TESTING (18 workers)
├── Unit (8)
├── Integration (6)
└── E2E (4)

CODE (15 workers)
...

Use 'aios workers info <id>' for details.
Use 'aios workers search <query>' to search.

# Filter by category
$ aios workers list --category=data
23 workers in category 'data':

Transformation (12)
  json-csv-transformer      JSON to CSV Transformer
  csv-json-transformer      CSV to JSON Transformer
  ...

Validation (8)
  json-validator           JSON Schema Validator
  ...

# Table format
$ aios workers list --format=table
#   ID                        NAME                      CATEGORY     SUBCATEGORY
1   json-csv-transformer      JSON to CSV Transformer   data         transformation
2   csv-json-transformer      CSV to JSON Transformer   data         transformation
...
97  workflow-orchestrator     Workflow Orchestrator     workflow     orchestration

# JSON format
$ aios workers list --format=json --category=testing
[
  { "id": "unit-test-generator", "category": "testing", "subcategory": "unit" },
  ...
]

# Pagination
$ aios workers list --page=2 --limit=20
Showing 21-40 of 97 workers...
```

### Directory Structure

```
.aios-core/cli/commands/workers/
├── info.js                 # Info command (2.8)
├── list.js                 # List command (2.9)
├── formatters/
│   ├── info-formatter.js   # Pretty print worker info
│   ├── list-tree.js        # Tree view formatter
│   └── list-table.js       # Table view formatter
└── utils/
    └── pagination.js       # Pagination logic
```

---

## 🤖 CodeRabbit Integration

### Story Type Analysis

**Primary Type**: CLI Feature
**Secondary Type(s)**: Display/Formatting, User Experience
**Complexity**: Medium (formatting, grouping, pagination)

### Specialized Agent Assignment

**Primary Agents:**
- @dev: CLI command implementation
- @ux-expert: Output formatting review

**Supporting Agents:**
- @qa: CLI testing and edge cases

### Quality Gate Tasks

- [ ] Pre-Commit (@dev): Run before marking story complete
- [ ] Pre-PR (@github-devops): Run before creating pull request

### Self-Healing Configuration

**Expected Self-Healing:**
- Primary Agent: @dev (light mode)
- Max Iterations: 2
- Timeout: 10 minutes
- Severity Filter: CRITICAL only

### CodeRabbit Focus Areas

**Primary Focus:**
- CLI argument parsing
- Output formatting consistency
- Error messages clarity
- Edge cases (empty registry, invalid IDs)

**Secondary Focus:**
- Help text completeness
- Pagination correctness
- Performance with large lists

---

## 📋 Tasks

### Story 2.8: Info Command (5h)
- [x] 2.8.1: Create info command structure (1h)
- [x] 2.8.2: Implement formatted display (2h)
  - Pretty print with boxes
  - Sections: metadata, description, inputs/outputs, performance
- [x] 2.8.3: Add usage examples section (0.5h)
- [x] 2.8.4: Add related workers section (0.5h)
- [x] 2.8.5: Implement error handling with suggestions (0.5h)
- [x] 2.8.6: Add output format options (0.5h)

### Story 2.9: List Command (10h)
- [x] 2.9.1: Create list command structure (1h)
- [x] 2.9.2: Implement grouped display (category/subcategory) (3h)
  - Tree view (default)
  - Collapsible categories
- [x] 2.9.3: Implement table format (1.5h)
- [x] 2.9.4: Implement category filter (0.5h)
- [x] 2.9.5: Implement pagination (1.5h)
  - --page and --limit options
  - Show total and current range
- [x] 2.9.6: Add worker count summary (0.5h)
- [x] 2.9.7: Test with 97+ workers (2h)

### Shared Tasks
- [x] 2.8-9.1: Add help text for both commands (0.5h)
- [x] 2.8-9.2: Run smoke tests CLI-01 to CLI-12 (1h)
- [x] 2.8-9.3: Create unit tests (1h)

**Total Estimated:** 17.5h

---

## 🧪 Smoke Tests (CLI-01 to CLI-12)

| Test ID | Name | Description | Priority | Pass Criteria |
|---------|------|-------------|----------|---------------|
| CLI-01 | Info Basic | `aios workers info <valid-id>` shows info | P0 | Output contains worker name |
| CLI-02 | Info Error | `aios workers info <invalid-id>` shows error | P0 | Error message + suggestions |
| CLI-03 | List Basic | `aios workers list` shows all workers | P0 | Count matches registry |
| CLI-04 | Info JSON | `aios workers info <id> --format=json` | P1 | Valid JSON output |
| CLI-05 | List Category | `aios workers list --category=data` | P1 | All results in category |
| CLI-06 | List Table | `aios workers list --format=table` | P1 | Table headers present |
| CLI-07 | List Pagination | `aios workers list --page=2 --limit=10` | P1 | Shows items 11-20 |
| CLI-08 | Help Text | `aios workers info --help` / `list --help` | P1 | Help shown |
| CLI-09 | Info Performance | `aios workers info <id>` completes fast | P1 | < 500ms |
| CLI-10 | List Performance | `aios workers list` completes fast | P1 | < 1s with 200+ workers |
| CLI-11 | List Count | `aios workers list --count` shows stats | P2 | Category counts shown |
| CLI-12 | Verbose Mode | `--verbose` shows debug info | P2 | Debug output present |

**Rollback Triggers:**
- CLI-01 fails → Info command broken, rollback
- CLI-02 fails → Error handling broken, fix
- CLI-03 fails → List command broken, rollback

---

## 🔗 Dependencies

**Depends on:**
- [Story 2.6](./story-2.6-service-registry.md) ✅ Complete
- [Story 2.7](./story-2.7-discovery-cli-search.md) ✅ Complete (CLI structure created)

**Blocks:**
- Story 2.16 (Documentation) - Needs CLI docs

---

## 📋 Rollback Plan

| Condition | Action |
|-----------|--------|
| CLI-01 fails (info broken) | Immediate rollback |
| CLI-03 fails (list broken) | Immediate rollback |
| CLI-02 fails (error handling) | Fix, don't block |
| Pagination broken | Fix, don't block |

```bash
# Rollback command
git revert --no-commit HEAD~N
```

---

## 📁 File List

**Created:**
- `.aios-core/cli/commands/workers/info.js` ✅
- `.aios-core/cli/commands/workers/list.js` ✅
- `.aios-core/cli/commands/workers/formatters/info-formatter.js` ✅
- `.aios-core/cli/commands/workers/formatters/list-tree.js` ✅
- `.aios-core/cli/commands/workers/formatters/list-table.js` ✅
- `.aios-core/cli/commands/workers/utils/pagination.js` ✅
- `tests/unit/info-cli.test.js` ✅
- `tests/unit/list-cli.test.js` ✅

**Updated:**
- `.aios-core/cli/commands/workers/index.js` ✅ (v1.0.0 → v1.1.0, register info/list commands)

---

## ✅ Definition of Done

### Story 2.8
- [x] `aios workers info <id>` shows complete worker details
- [x] Error handling with suggestions for invalid IDs
- [x] Output formats work (pretty, json, yaml)
- [x] Help text is clear and helpful

### Story 2.9
- [x] `aios workers list` shows all workers grouped
- [x] Category filter works correctly
- [x] Output formats work (tree, table, json, yaml)
- [x] Pagination works with large lists
- [x] Count summary is accurate

### Shared
- [x] All P0 smoke tests pass (CLI-01, CLI-02, CLI-03)
- [x] All P1 smoke tests pass (CLI-04 to CLI-10)
- [x] All P2 smoke tests pass (CLI-11 to CLI-12)
- [x] Unit tests cover main scenarios
- [x] Story checkboxes updated to [x]
- [x] QA Review passed (Quinn @qa, 2025-11-30)
- [x] Pushed to main (Gage @github-devops, 2025-11-30, commit 3f713496)

---

## 🤖 Dev Agent Record

### Agent Model Used
Claude Opus 4.5 (claude-opus-4-5-20251101) via @dev agent (Dex)

### Debug Log References
- Unit tests: 75 passed (info-cli.test.js, list-cli.test.js)
- Smoke tests: CLI-01 to CLI-12 all passed
- Performance: Info 4ms (target <500ms), List 8ms (target <1s with 203 workers)
- Linting: 0 errors, 1310 warnings (pre-existing)

### Completion Notes
- Implemented info command with pretty/json/yaml formats and "did you mean?" suggestions
- Implemented list command with tree/table/json/yaml formats, pagination, count mode
- Created formatters: info-formatter.js, list-tree.js, list-table.js
- Created pagination utility: utils/pagination.js
- Updated workers/index.js to register new commands
- All 12 smoke tests pass (P0, P1, P2)
- 75 unit tests pass covering formatters, pagination, and edge cases
- Performance exceeds targets: info 4ms, list 8ms with 203 workers

---

## ✅ QA Results

### Smoke Tests Results (CLI-01 to CLI-12)

| Test ID | Name | Result | Notes |
|---------|------|--------|-------|
| CLI-01 | Info Basic | ✅ Pass | Shows formatted worker info |
| CLI-02 | Info Error | ✅ Pass | Shows error + search hint |
| CLI-03 | List Basic | ✅ Pass | 203 workers in 6 categories |
| CLI-04 | Info JSON | ✅ Pass | Valid JSON with all metadata |
| CLI-05 | List Category | ✅ Pass | 115 task workers filtered |
| CLI-06 | List Table | ✅ Pass | Table headers + pagination |
| CLI-07 | List Pagination | ✅ Pass | Page 2, items 11-20 |
| CLI-08 | Help Text | ✅ Pass | Clear usage + examples |
| CLI-09 | Info Performance | ✅ Pass | 4ms (target <500ms) |
| CLI-10 | List Performance | ✅ Pass | 8ms with 203 workers (target <1s) |
| CLI-11 | List Count | ✅ Pass | Category counts displayed |
| CLI-12 | Verbose Mode | ✅ Pass | Debug info + performance |

### Gate Decision
✅ **QA PASS** - All criteria verified, ready for PR

**QA Agent:** Quinn (@qa)
**Review Date:** 2025-11-30
**Verdict:** Implementation complete and verified

---

## 📝 Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-19 | 0.1 | Stories created (bundled in 2.6-2.9) | River |
| 2025-11-29 | 1.0 | Consolidated to 2.8-2.9, full enrichment | Pax |
| 2025-11-29 | 1.1 | Status → Ready for Dev, added ACs (verbose, perf targets, count), 4 new smoke tests | Pax |
| 2025-11-30 | 2.0 | Implementation complete: info/list commands, formatters, tests. All 12 smoke tests pass. Status → Ready for Review | Dex |
| 2025-11-30 | 2.1 | QA Review PASS: All 21 ACs verified, 75 unit tests, performance exceeds targets. Status → QA Approved | Quinn |
| 2025-11-30 | 2.2 | Pushed to main (commit 3f713496). Status → Complete | Gage |
| 2025-11-30 | 2.3 | Story marked Complete by PO | Pax |

---

**Criado por:** River 🌊
**Refinado por:** Pax 🎯 (PO) - 2025-11-29
