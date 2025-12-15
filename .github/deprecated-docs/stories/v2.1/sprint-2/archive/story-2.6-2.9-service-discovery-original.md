# STORIES 2.6-2.9: Service Discovery System

**Épico:** [EPIC-S2](../../../epics/epic-s2-modular-architecture.md) | **Sprint:** 2 | **Created:** 2025-01-19

**CRITICAL:** Estas stories implementam Service Discovery, foundational para Task-First Architecture (unanimidade roundtable)

---

## STORY 2.6: Service Registry Creation

**Points:** 8 | **Priority:** 🔴 Critical

### User Story
**Como** developer, **Quero** registry com 97+ workers catalogados, **Para** reuse ao invés de rebuild

### Scope

Create `service-registry.json`:
```json
{
  "version": "2.1.0",
  "workers": [
    {
      "id": "data-transformer-json-csv",
      "name": "JSON to CSV Transformer",
      "description": "Converts JSON data to CSV format",
      "category": "data",
      "subcategory": "transformation",
      "inputs": ["json"],
      "outputs": ["csv"],
      "tags": ["etl", "data", "transformation"],
      "path": ".aios-core/development/workers/data/json-csv-transformer.js",
      "taskFormat": "TASK-FORMAT-V1",
      "executorTypes": ["Worker", "Agent"],
      "performance": {
        "avgDuration": "50ms",
        "cacheable": true
      }
    }
    // ... 97+ workers
  ]
}
```

### Tasks
- [ ] 2.6.1: Design registry schema (3h)
- [ ] 2.6.2: Catalog existing workers (8h)
- [ ] 2.6.3: Validate 97+ entries against TASK-FORMAT-V1 (5h)
- [ ] 2.6.4: Create registry builder script (3h)
- [ ] 2.6.5: Test registry loading (2h)

**Total:** 21h

---

## STORY 2.7: Discovery CLI - Search

**Points:** 8 | **Priority:** 🔴 Critical

### User Story
**Como** developer, **Quero** `aios workers search <query>`, **Para** encontrar workers relevantes em < 30s

### Implementation

```bash
# Examples
$ aios workers search "json csv"
Found 3 workers (took 0.8s):
  1. json-csv-transformer - JSON to CSV conversion
  2. csv-json-transformer - CSV to JSON conversion
  3. json-validator - Validate JSON schemas

$ aios workers search "data transformation" --category=etl
Found 12 workers in category 'etl' (took 1.2s):
  ...
```

**Search Strategy:**
- Semantic search (OpenAI embeddings) if API key available
- Keyword fallback (fuzzy match on name/description/tags)
- Category filter
- Tag filter
- Performance: < 30s (target < 5s)

### Tasks
- [ ] 2.7.1: CLI command setup (2h)
- [ ] 2.7.2: Semantic search (embeddings) (5h)
- [ ] 2.7.3: Keyword fallback (fuzzy) (3h)
- [ ] 2.7.4: Filters (category, tags) (2h)
- [ ] 2.7.5: Performance optimization (3h)
- [ ] 2.7.6: Test with 97+ workers (3h)

**Total:** 18h

---

## STORY 2.8: Discovery CLI - Info

**Points:** 3 | **Priority:** 🟠 High

### User Story
**Como** developer, **Quero** `aios workers info <id>`, **Para** ver detalhes completos de um worker

### Implementation

```bash
$ aios workers info data-transformer-json-csv

📦 JSON to CSV Transformer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ID:           data-transformer-json-csv
Category:     data / transformation
Executor:     Worker, Agent
Task Format:  TASK-FORMAT-V1
Path:         .aios-core/development/workers/data/json-csv-transformer.js

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

Usage Example:
  aios task run data-transformer-json-csv --input=data.json
```

### Tasks
- [ ] 2.8.1: CLI command (1h)
- [ ] 2.8.2: Formatted display (2h)
- [ ] 2.8.3: Usage examples (1h)
- [ ] 2.8.4: Test (1h)

**Total:** 5h

---

## STORY 2.9: Discovery CLI - List

**Points:** 5 | **Priority:** 🟠 High

### User Story
**Como** developer, **Quero** `aios workers list`, **Para** explorar todos workers disponíveis

### Implementation

```bash
$ aios workers list
97 workers available:

DATA (23 workers)
  Transformation (12)
  - json-csv-transformer
  - csv-json-transformer
  ...
  
  Validation (8)
  - json-validator
  - schema-validator
  ...

TESTING (18 workers)
  ...

$ aios workers list --category=data --format=json
[{...}, {...}]
```

### Tasks
- [ ] 2.9.1: CLI command (1h)
- [ ] 2.9.2: Grouped display (category/subcategory) (3h)
- [ ] 2.9.3: Format options (table, json, yaml) (2h)
- [ ] 2.9.4: Filters (2h)
- [ ] 2.9.5: Test (2h)

**Total:** 10h

---

## 🔗 Dependencies

**Depends on:** [2.2-2.5] Module Creation  
**Blocks:** [2.14] Migration Script (needs registry)

---

## ✅ Shared Success Criteria

- [ ] 97+ workers cataloged
- [ ] Search < 30s (target < 5s)
- [ ] Search accuracy > 90%
- [ ] CLI user-friendly
- [ ] Documentation complete

---

**Criado por:** River 🌊 | **Based on:** Task-First Architecture (unanimidade roundtable)

