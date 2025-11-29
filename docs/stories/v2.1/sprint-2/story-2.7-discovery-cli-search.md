# STORY: Discovery CLI - Search

**ID:** 2.7 | **Épico:** [EPIC-S2](../../../epics/epic-s2-modular-architecture.md)
**Sprint:** 2 | **Points:** 8 | **Priority:** 🔴 Critical | **Created:** 2025-01-19
**Updated:** 2025-11-29
**Status:** 🟡 Ready for Development

**Reference:** [ADR-002 Migration Map](../../architecture/decisions/ADR-002-migration-map.md)
**Quality Gate:** [2.7-discovery-cli-search.yml](../../qa/gates/2.7-discovery-cli-search.yml)

---

## 📊 User Story

**Como** developer, **Quero** `aios workers search <query>`, **Para** encontrar workers relevantes em < 30s

**Value Proposition:** Core value of Service Discovery - find before build, reuse before rebuild.

---

## ✅ Acceptance Criteria

- [ ] AC1: CLI command `aios workers search <query>` implemented
- [ ] AC2: Semantic search using OpenAI embeddings (when API key available)
- [ ] AC3: Keyword fallback search (fuzzy match on name/description/tags)
- [ ] AC4: Category filter (`--category=<category>`)
- [ ] AC5: Tag filter (`--tags=<tag1,tag2>`)
- [ ] AC6: Output format options (`--format=table|json|yaml`)
- [ ] AC7: Search returns relevant results with score
- [ ] AC8: Search completes in < 30s (target < 5s)
- [ ] AC9: Search accuracy > 90% for exact matches
- [ ] AC10: Help text shows usage examples
- [ ] AC11: All P0 smoke tests pass (SEARCH-01 to SEARCH-03)
- [ ] AC12: All P1 smoke tests pass (SEARCH-04 to SEARCH-06)

---

## 🔧 Scope

### CLI Interface

```bash
# Basic search
$ aios workers search "json csv"
Found 3 workers (took 0.8s):

  #  ID                        NAME                      CATEGORY     SCORE
  1  json-csv-transformer      JSON to CSV Transformer   data         98%
  2  csv-json-transformer      CSV to JSON Transformer   data         95%
  3  json-validator            JSON Schema Validator     validation   72%

Use 'aios workers info <id>' for details.

# With filters
$ aios workers search "data transformation" --category=etl --format=json
[
  { "id": "json-csv-transformer", "name": "...", "score": 98 },
  { "id": "csv-json-transformer", "name": "...", "score": 95 }
]

# With tag filter
$ aios workers search "validation" --tags=schema,json
Found 5 workers...

# Help
$ aios workers search --help
Usage: aios workers search <query> [options]

Search for workers in the service registry.

Arguments:
  query                  Search query (words, phrases, or patterns)

Options:
  -c, --category <cat>   Filter by category
  -t, --tags <tags>      Filter by tags (comma-separated)
  -f, --format <fmt>     Output format: table, json, yaml (default: table)
  -l, --limit <n>        Max results (default: 10)
  --semantic             Force semantic search (requires OPENAI_API_KEY)
  --keyword              Force keyword search
  -h, --help             Show help
```

### Search Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                      Search Flow                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Input Query ─────────┬─── OPENAI_API_KEY set? ───────────► │
│                       │           │                           │
│                       │     Yes   │   No                      │
│                       │           ▼                           │
│                       │   Semantic Search                     │
│                       │   (embeddings)                        │
│                       │           │                           │
│                       │           ▼                           │
│                       └──► Keyword Fallback ◄────────────────┤
│                            (fuzzy match)                      │
│                                  │                            │
│                                  ▼                            │
│                           Apply Filters                       │
│                        (category, tags)                       │
│                                  │                            │
│                                  ▼                            │
│                          Sort by Score                        │
│                                  │                            │
│                                  ▼                            │
│                         Format Output                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
.aios-core/cli/
├── commands/
│   └── workers/
│       ├── search.js           # Search command implementation
│       ├── search-semantic.js  # Semantic search (OpenAI)
│       ├── search-keyword.js   # Keyword/fuzzy search
│       └── search-filters.js   # Filter logic
└── utils/
    ├── output-formatter.js     # Format results (table/json/yaml)
    └── score-calculator.js     # Calculate relevance scores
```

---

## 🤖 CodeRabbit Integration

### Story Type Analysis

**Primary Type**: CLI Feature
**Secondary Type(s)**: Search Algorithm, AI Integration
**Complexity**: High (semantic search, performance optimization)

### Specialized Agent Assignment

**Primary Agents:**
- @dev: CLI command implementation
- @architect: Search algorithm design

**Supporting Agents:**
- @qa: Search accuracy testing
- @devops: Performance benchmarking

### Quality Gate Tasks

- [ ] Pre-Commit (@dev): Run before marking story complete
- [ ] Pre-PR (@github-devops): Run before creating pull request

### Self-Healing Configuration

**Expected Self-Healing:**
- Primary Agent: @dev (light mode)
- Max Iterations: 2
- Timeout: 15 minutes
- Severity Filter: CRITICAL only

**Predicted Behavior:**
- CRITICAL issues: auto_fix (CLI errors, search failures)
- HIGH issues: document_only

### CodeRabbit Focus Areas

**Primary Focus:**
- CLI argument parsing correctness
- Error handling for missing API key
- Search result relevance
- Performance (< 30s requirement)

**Secondary Focus:**
- Output formatting consistency
- Help text completeness
- Edge cases (empty query, no results)

---

## 📋 Tasks

### Phase 1: CLI Setup (2h)
- [ ] 2.7.1: Create search command structure (1h)
- [ ] 2.7.2: Implement argument parsing (0.5h)
- [ ] 2.7.3: Add help text and examples (0.5h)

### Phase 2: Semantic Search (5h)
- [ ] 2.7.4: Integrate OpenAI embeddings API (2h)
- [ ] 2.7.5: Create embeddings for all workers (pre-compute) (1.5h)
- [ ] 2.7.6: Implement cosine similarity scoring (1h)
- [ ] 2.7.7: Handle API key detection and fallback (0.5h)

### Phase 3: Keyword Search (3h)
- [ ] 2.7.8: Implement fuzzy matching on name/description (1.5h)
- [ ] 2.7.9: Implement tag matching (0.5h)
- [ ] 2.7.10: Calculate relevance scores (1h)

### Phase 4: Filters & Output (2h)
- [ ] 2.7.11: Implement category filter (0.5h)
- [ ] 2.7.12: Implement tag filter (0.5h)
- [ ] 2.7.13: Implement output formatters (table/json/yaml) (1h)

### Phase 5: Performance & Testing (6h)
- [ ] 2.7.14: Optimize for < 30s target (2h)
- [ ] 2.7.15: Add caching for repeated searches (1h)
- [ ] 2.7.16: Test with 97+ workers (2h)
- [ ] 2.7.17: Run smoke tests SEARCH-01 to SEARCH-06 (1h)

**Total Estimated:** 18h

---

## 🧪 Smoke Tests (SEARCH-01 to SEARCH-06)

| Test ID | Name | Description | Priority | Pass Criteria |
|---------|------|-------------|----------|---------------|
| SEARCH-01 | Basic Search | `aios workers search "json"` returns results | P0 | Results array not empty |
| SEARCH-02 | Search Speed | Search completes in < 30s | P0 | `duration < 30000ms` |
| SEARCH-03 | Exact Match | Search for exact worker ID returns it first | P0 | `results[0].id === query` |
| SEARCH-04 | Category Filter | `--category` filters correctly | P1 | All results match category |
| SEARCH-05 | Tag Filter | `--tags` filters correctly | P1 | All results have at least one tag |
| SEARCH-06 | JSON Output | `--format=json` returns valid JSON | P1 | `JSON.parse()` succeeds |

**Rollback Triggers:**
- SEARCH-01 fails → Search broken, rollback
- SEARCH-02 fails → Performance issue, investigate
- SEARCH-03 fails → Scoring broken, fix algorithm

---

## 🔗 Dependencies

**Depends on:**
- [Story 2.6](./story-2.6-service-registry.md) ✅ Complete (service registry available)

**Blocks:**
- Story 2.14 (Migration Script) - Uses search for validation

---

## 📋 Rollback Plan

| Condition | Action |
|-----------|--------|
| SEARCH-01 fails (search broken) | Immediate rollback |
| SEARCH-02 fails (> 30s) | Optimize, don't block |
| SEARCH-03 fails (wrong results) | Fix scoring, don't rollback |
| Semantic search fails | Fallback to keyword only |

```bash
# Rollback command
git revert --no-commit HEAD~N  # N = number of commits to revert
```

---

## 📁 File List

**To Create:**
- `.aios-core/cli/commands/workers/search.js` (main command)
- `.aios-core/cli/commands/workers/search-semantic.js` (semantic search)
- `.aios-core/cli/commands/workers/search-keyword.js` (keyword search)
- `.aios-core/cli/commands/workers/search-filters.js` (filters)
- `.aios-core/cli/utils/score-calculator.js` (scoring)
- `tests/unit/search-cli.test.js` (unit tests)
- `tests/integration/search-performance.test.js` (perf tests)

**To Update:**
- `.aios-core/cli/index.js` (register search command)
- `package.json` (add OpenAI dependency if needed)

---

## ✅ Definition of Done

- [ ] `aios workers search <query>` works from CLI
- [ ] Semantic search works when OPENAI_API_KEY is set
- [ ] Keyword fallback works when API key not available
- [ ] Category and tag filters work correctly
- [ ] All output formats work (table, json, yaml)
- [ ] Search completes in < 30s with 97+ workers
- [ ] Search accuracy > 90% for exact matches
- [ ] Help text shows clear usage examples
- [ ] All P0 smoke tests pass (SEARCH-01, SEARCH-02, SEARCH-03)
- [ ] All P1 smoke tests pass (SEARCH-04, SEARCH-05, SEARCH-06)
- [ ] Unit tests cover main scenarios
- [ ] Story checkboxes updated to [x]
- [ ] PR created and approved

---

## 🤖 Dev Agent Record

### Agent Model Used
_(To be filled during implementation)_

### Debug Log References
_(To be filled during implementation)_

### Completion Notes
_(To be filled during implementation)_

---

## ✅ QA Results

### Smoke Tests Results (SEARCH-01 to SEARCH-06)

| Test ID | Name | Result | Notes |
|---------|------|--------|-------|
| SEARCH-01 | Basic Search | ⏳ Pending | |
| SEARCH-02 | Search Speed | ⏳ Pending | |
| SEARCH-03 | Exact Match | ⏳ Pending | |
| SEARCH-04 | Category Filter | ⏳ Pending | |
| SEARCH-05 | Tag Filter | ⏳ Pending | |
| SEARCH-06 | JSON Output | ⏳ Pending | |

### Gate Decision
_(To be filled after QA review)_

---

## 📝 Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-19 | 0.1 | Story created (bundled in 2.6-2.9) | River |
| 2025-11-29 | 1.0 | Sharded to individual story, full enrichment | Pax |
| 2025-11-29 | 1.1 | Status → Ready for Dev, QA gate created, dep 2.6 marked complete | Pax |

---

**Criado por:** River 🌊
**Refinado por:** Pax 🎯 (PO) - 2025-11-29
