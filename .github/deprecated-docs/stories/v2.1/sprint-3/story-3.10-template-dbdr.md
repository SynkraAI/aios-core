# STORY 3.10: Template DBDR

**ID:** 3.10 | **Epic:** [EPIC-S3](../../../epics/epic-s3-quality-templates.md)
**Sprint:** 3 | **Points:** 2 | **Priority:** 🟡 Medium | **Created:** 2025-01-19
**Updated:** 2025-12-05
**Status:** 🟣 Ready for Review

**Reference:** [Decisão 9 - Template Engine](../../../audits/PEDRO-DECISION-LOG.md#decisão-9)

**Predecessor:** Story 3.6 (Template Engine Core) ✅

---

## User Story

**Como** Data Engineer (Dara) ou DBA,
**Quero** template DBDR (Database Decision Record) em formato Handlebars,
**Para que** possa documentar decisões de database de forma padronizada e rastreável.

---

## Acceptance Criteria

### Template Structure
- [x] AC3.10.1: Template segue padrão similar ao ADR (Context, Decision, Consequences)
- [x] AC3.10.2: Inclui seção de Schema Changes específica
- [x] AC3.10.3: Inclui seção de Migration Strategy
- [x] AC3.10.4: Inclui seção de Performance Impact
- [x] AC3.10.5: Inclui seção de Rollback Plan

### Validation
- [x] AC3.10.6: JSON Schema valida output gerado
- [x] AC3.10.7: Valida que migration strategy não está vazia

### Integration
- [x] AC3.10.8: Template registrado no TemplateEngine
- [x] AC3.10.9: Geração via CLI: `aios generate dbdr`

---

## Scope

### Template Location
`.aios-core/product/templates/dbdr.hbs`

### Template Structure

```handlebars
---
template_id: dbdr
template_name: Database Decision Record
version: 1.0
variables:
  - name: number
    type: number
    required: true
    auto: next_dbdr_number
  - name: title
    type: string
    required: true
    prompt: "Título da decisão de database:"
  - name: status
    type: choice
    required: true
    choices: [Proposed, Approved, Implemented, Rolled Back]
    default: Proposed
  - name: dbType
    type: choice
    required: true
    choices: [PostgreSQL, MySQL, MongoDB, SQLite, Supabase, Other]
    prompt: "Qual banco de dados?"
  - name: owner
    type: string
    required: true
    prompt: "Quem é o owner dessa decisão?"
  - name: context
    type: text
    required: true
    prompt: "Qual é o contexto e problema de dados?"
  - name: decision
    type: text
    required: true
    prompt: "Qual é a decisão tomada?"
  - name: schemaChanges
    type: array
    required: false
  - name: migrationStrategy
    type: text
    required: true
    prompt: "Qual é a estratégia de migração?"
  - name: rollbackPlan
    type: text
    required: true
    prompt: "Qual é o plano de rollback?"
---

# DBDR {{padNumber number 3}}: {{title}}

**Status:** {{status}}
**Date:** {{formatDate now "YYYY-MM-DD"}}
**Owner:** {{owner}}
**Database:** {{dbType}}

---

## Context

### Current State
{{currentState}}

### Problem Statement
{{context}}

### Data Volume Considerations
{{#if dataVolume}}
- **Current Size:** {{dataVolume.current}}
- **Projected Growth:** {{dataVolume.projected}}
- **Retention Policy:** {{dataVolume.retention}}
{{/if}}

---

## Decision

{{decision}}

### Rationale
{{rationale}}

---

## Schema Changes

{{#if schemaChanges}}
### Tables Affected

| Table | Change Type | Description |
|-------|-------------|-------------|
{{#each schemaChanges}}
| `{{this.table}}` | {{this.changeType}} | {{this.description}} |
{{/each}}

### SQL Migrations

```sql
{{#each schemaChanges}}
-- {{this.table}}: {{this.changeType}}
{{this.sql}}

{{/each}}
```
{{else}}
_No schema changes required._
{{/if}}

---

## Migration Strategy

### Approach
{{migrationStrategy}}

### Phases

{{#each migrationPhases}}
1. **{{this.phase}}** ({{this.duration}})
   - {{this.description}}
   - Validation: {{this.validation}}
{{/each}}

### Data Migration Scripts

{{#if dataMigrationScripts}}
```sql
{{dataMigrationScripts}}
```
{{else}}
_No data migration required._
{{/if}}

---

## Performance Impact

### Expected Impact

| Metric | Before | After | Acceptable? |
|--------|--------|-------|-------------|
{{#each performanceMetrics}}
| {{this.metric}} | {{this.before}} | {{this.after}} | {{this.acceptable}} |
{{/each}}

### Indexing Strategy

{{#if indexes}}
{{#each indexes}}
- `{{this.name}}` on `{{this.table}}({{this.columns}})` - {{this.reason}}
{{/each}}
{{else}}
_No new indexes required._
{{/if}}

---

## Rollback Plan

### Rollback Strategy
{{rollbackPlan}}

### Rollback Scripts

{{#if rollbackScripts}}
```sql
{{rollbackScripts}}
```
{{/if}}

### Rollback Triggers

{{#each rollbackTriggers}}
- **{{this.condition}}**: {{this.action}}
{{/each}}

---

## Testing

### Pre-Migration Testing
{{#each preMigrationTests}}
- [ ] {{this}}
{{/each}}

### Post-Migration Validation
{{#each postMigrationValidation}}
- [ ] {{this}}
{{/each}}

---

## Consequences

### Positive
{{#each positiveConsequences}}
- ✅ {{this}}
{{/each}}

### Negative (Trade-offs)
{{#if negativeConsequences}}
{{#each negativeConsequences}}
- ⚠️ {{this}}
{{/each}}
{{else}}
_No significant trade-offs identified._
{{/if}}

---

## Related Decisions

{{#if relatedDBDRs}}
{{#each relatedDBDRs}}
- [DBDR {{this.number}}](./dbdr-{{padNumber this.number 3}}.md): {{this.title}}
{{/each}}
{{else}}
_No related decisions._
{{/if}}

{{#if relatedADRs}}
### Related ADRs
{{#each relatedADRs}}
- [ADR {{this.number}}](../adr/adr-{{padNumber this.number 3}}.md): {{this.title}}
{{/each}}
{{/if}}

---

**Generated by:** AIOS Template Engine v2.0
**Template Version:** dbdr-1.0
```

### JSON Schema

`.aios-core/product/templates/engine/schemas/dbdr.schema.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "DBDR Template Variables",
  "type": "object",
  "required": ["number", "title", "status", "dbType", "owner", "context", "decision", "migrationStrategy", "rollbackPlan"],
  "properties": {
    "number": { "type": "integer", "minimum": 1 },
    "title": { "type": "string", "minLength": 5, "maxLength": 150 },
    "status": {
      "type": "string",
      "enum": ["Proposed", "Approved", "Implemented", "Rolled Back"]
    },
    "dbType": {
      "type": "string",
      "enum": ["PostgreSQL", "MySQL", "MongoDB", "SQLite", "Supabase", "Other"]
    },
    "owner": { "type": "string", "minLength": 1 },
    "context": { "type": "string", "minLength": 20 },
    "decision": { "type": "string", "minLength": 20 },
    "schemaChanges": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["table", "changeType"],
        "properties": {
          "table": { "type": "string" },
          "changeType": {
            "type": "string",
            "enum": ["CREATE", "ALTER", "DROP", "INDEX", "CONSTRAINT"]
          },
          "description": { "type": "string" },
          "sql": { "type": "string" }
        }
      }
    },
    "migrationStrategy": { "type": "string", "minLength": 20 },
    "rollbackPlan": { "type": "string", "minLength": 20 },
    "positiveConsequences": {
      "type": "array",
      "items": { "type": "string" }
    },
    "negativeConsequences": {
      "type": "array",
      "items": { "type": "string" }
    }
  }
}
```

---

## Tasks

### Design (2h) ✅ PRE-IMPLEMENTED
- [x] 3.10.1: Design DBDR structure
  - [x] 3.10.1.1: Identify database-specific sections
  - [x] 3.10.1.2: Define schema change format
  - [x] 3.10.1.3: Define rollback plan structure

### Implementation (2h) ✅ PRE-IMPLEMENTED
- [x] 3.10.2: Create Handlebars template
  - [x] 3.10.2.1: Base structure with DB sections
  - [x] 3.10.2.2: Schema changes table + SQL blocks
  - [x] 3.10.2.3: Rollback scripts section
  - [x] 3.10.2.4: Register template in TemplateEngine (AC3.10.8)

### Integration (0h) ✅ PRE-IMPLEMENTED
- [x] 3.10.3: CLI Integration
  - [x] 3.10.3.1: `dbdr` added to SUPPORTED_TYPES in TemplateEngine
  - [x] 3.10.3.2: CLI command `aios generate dbdr` available (via Story 3.9)

### Testing (2h) ✅ COMPLETE
- [x] 3.10.4: Create test suite
  - [x] 3.10.4.1: Create `tests/templates/dbdr.test.js`
  - [x] 3.10.4.2: Implement DBDR-01 to DBDR-05 tests
  - [x] 3.10.4.3: Test CLI command `aios generate dbdr` (AC3.10.9)
  - [x] 3.10.4.4: Validate schema validation (AC3.10.6, AC3.10.7)

**Total Estimated:** 2h (only tests remaining)
**Already Implemented:** Template, Schema, CLI registration

---

## Dev Notes

### Pre-existing Implementation Status

**Files Already Created:**
- `.aios-core/product/templates/dbdr.hbs` - Complete template with all sections
- `.aios-core/product/templates/engine/schemas/dbdr.schema.json` - Complete validation schema
- `.aios-core/product/templates/engine/index.js` - 'dbdr' in SUPPORTED_TYPES (line 22)
- `.aios-core/cli/commands/generate/index.js` - CLI command via Story 3.9

**Reference Implementation:**
- Use `tests/templates/pmdr.test.js` as reference for test structure (Story 3.9)

### Difference from ADR
- **ADR:** General architecture decisions
- **DBDR:** Database-specific decisions

Key differences:
- Schema changes with SQL
- Migration strategy (mandatory)
- Rollback plan (mandatory)
- Performance impact metrics
- Indexing strategy

### Template Engine Integration
- Template auto-discovery: Template at `.aios-core/product/templates/dbdr.hbs`
- Schema validation: Schema at `.aios-core/product/templates/engine/schemas/dbdr.schema.json`
- Template registration: Already in SUPPORTED_TYPES
- CLI command: Already available via `aios generate dbdr` (Story 3.9)

### Testing

**Test File Location:** `tests/templates/dbdr.test.js`

| Test ID | Name | Priority |
|---------|------|----------|
| DBDR-01 | Generate DBDR with required fields | P0 |
| DBDR-02 | Schema changes table renders | P0 |
| DBDR-03 | SQL blocks render correctly | P0 |
| DBDR-04 | Validation fails without rollbackPlan | P0 |
| DBDR-05 | Performance metrics table renders | P1 |
| DBDR-06 | Validation fails without migrationStrategy (AC3.10.7) | P0 |
| DBDR-07 | CLI command `aios generate dbdr` executes successfully | P0 |

---

## 🤖 CodeRabbit Integration

### Story Type Analysis

**Primary Type:** Tooling/Templates
**Secondary Type(s):** Documentation, Database
**Complexity:** Low (template creation)

### Specialized Agent Assignment

**Primary Agents:**
- @dev: Template implementation

**Supporting Agents:**
- @db-sage: DBDR format review

### Quality Gate Tasks

- [x] Pre-Commit (@dev): Run DBDR-01 to DBDR-07 tests
- [ ] Pre-PR (@devops): Validate template syntax and CLI command

### Self-Healing Configuration

**Expected Self-Healing:**
- Primary Agent: @dev (light mode)
- Max Iterations: 2
- Timeout: 10 minutes
- Severity Filter: CRITICAL only

**Predicted Behavior:**
- CRITICAL issues: Auto-fix
- HIGH issues: Document only

### Focus Areas

**Primary Focus:**
- Schema change format (SQL validity)
- Rollback plan completeness

**Secondary Focus:**
- Migration strategy clarity
- Performance metrics structure

---

## Dependencies

**Depends on:**
- Story 3.6 (Template Engine Core) ✅
- Story 3.9 (Template PMDR - CLI generate command) ✅

**Blocks:**
- Story 3.12 (Documentation Sprint 3)

---

## Definition of Done

- [x] All acceptance criteria met (9/9 complete)
- [x] Template generates valid DBDR
- [x] DBDR-01 to DBDR-07 tests pass (21 tests total)
- [x] CLI command `aios generate dbdr` works correctly
- [x] QA Review passed
- [ ] PR created and approved

---

## Dev Agent Record

### Agent Model Used
- claude-opus-4-5-20251101 (Opus 4.5)

### Completion Notes
- Created comprehensive test suite `tests/templates/dbdr.test.js` with 21 tests
- All 7 story test cases implemented (DBDR-01 to DBDR-07)
- Added 14 additional tests for optional sections (migration phases, consequences, data volume, related decisions, testing sections)
- All template tests pass (34 total: 13 PMDR + 21 DBDR)
- Schema validation works correctly for `migrationStrategy` and `rollbackPlan` minLength: 20

### File List
| File | Action | Description |
|------|--------|-------------|
| `tests/templates/dbdr.test.js` | Created | Complete DBDR test suite with 21 tests |

### Debug Log
_No issues encountered during implementation_

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-19 | 1.0 | Story created (in bundled file) | River |
| 2025-12-03 | 2.0 | Separated into individual story file | Pax (@po) |
| 2025-12-05 | 2.1 | PO validation: predecessor confirmed complete; 7/9 ACs pre-implemented; reduced points to 2; added test cases DBDR-06, DBDR-07; updated tasks to reflect remaining work | Pax (@po) |
| 2025-12-05 | 2.2 | Implementation complete: created dbdr.test.js with 21 tests; all ACs met; status Ready for Review | Dex (@dev) |

---

## QA Results

### QA Review: 2025-12-05
**Reviewer:** Quinn (@qa)
**Gate Decision:** ✅ **PASS**

---

#### Acceptance Criteria Verification

| AC | Description | Status | Evidence |
|----|-------------|--------|----------|
| AC3.10.1 | Template follows ADR pattern | ✅ PASS | Template has Context, Decision, Consequences sections |
| AC3.10.2 | Schema Changes section | ✅ PASS | DBDR-02 tests verify table rendering |
| AC3.10.3 | Migration Strategy section | ✅ PASS | Required field with minLength:20 validation |
| AC3.10.4 | Performance Impact section | ✅ PASS | DBDR-05 tests verify metrics table |
| AC3.10.5 | Rollback Plan section | ✅ PASS | DBDR-04 tests verify required field |
| AC3.10.6 | JSON Schema validates output | ✅ PASS | Schema at `engine/schemas/dbdr.schema.json` |
| AC3.10.7 | Migration strategy validation | ✅ PASS | DBDR-06 tests verify minLength:20 |
| AC3.10.8 | Template registered in engine | ✅ PASS | 'dbdr' in SUPPORTED_TYPES (line 22) |
| AC3.10.9 | CLI generation available | ✅ PASS | DBDR-07 tests verify supportedTypes |

**AC Coverage:** 9/9 (100%)

---

#### Test Quality Assessment

| Metric | Value | Assessment |
|--------|-------|------------|
| Total Tests | 21 | Exceeds requirement (7 required) |
| P0 Tests | 16 | All critical paths covered |
| P1 Tests | 5 | Optional sections covered |
| Pass Rate | 100% | All 21 tests passing |

**Test Structure Quality:**
- ✅ Proper JSDoc annotations with AC references
- ✅ Descriptive test names matching story test IDs
- ✅ Both positive and negative validation tests
- ✅ Edge cases covered (empty, short, missing fields)
- ✅ Optional sections tested independently

---

#### Code Quality Analysis

**Template (`dbdr.hbs`):**
- ✅ Clean Handlebars syntax
- ✅ Proper conditional rendering with `{{#if}}`
- ✅ Database-specific sections (Schema Changes, Migration, Rollback)
- ✅ Table rendering for structured data
- ✅ SQL code blocks with proper escaping

**Schema (`dbdr.schema.json`):**
- ✅ Valid JSON Schema draft-07
- ✅ Required fields enforced (9 fields)
- ✅ MinLength validations for text fields (20 chars)
- ✅ Enum constraints for status and dbType
- ✅ Nested object schemas for complex types

**Test File (`dbdr.test.js`):**
- ✅ Follows pmdr.test.js reference pattern
- ✅ Async/await properly used
- ✅ No hardcoded paths (uses path.join)
- ✅ Engine initialized once in beforeAll

---

#### Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Template rendering edge cases | Low | Low | 21 tests cover variations |
| Schema validation gaps | Low | Medium | MinLength enforced on critical fields |
| CLI integration issues | Low | Low | Inherits from Story 3.9 infrastructure |

**Overall Risk:** 🟢 LOW

---

#### Recommendations

**None blocking.** Minor observations:

1. **ADVISORY:** Console warnings during tests for minLength validation are expected behavior (tests intentionally trigger validation failures)

2. **ADVISORY:** Future enhancement could add SQL syntax validation in schemaChanges.sql field

---

#### Gate Decision Summary

| Criteria | Status |
|----------|--------|
| All ACs met | ✅ |
| Tests passing | ✅ |
| Code quality | ✅ |
| Risk acceptable | ✅ |

**Final Decision:** ✅ **PASS** - Story 3.10 approved for merge.

— Quinn, guardião da qualidade 🛡️

---

## PO Validation Notes (2025-12-05)

### Pre-Implementation Analysis

This story is **85% pre-implemented**. During validation, I discovered:

1. **Template exists**: `.aios-core/product/templates/dbdr.hbs` is complete
2. **Schema exists**: `.aios-core/product/templates/engine/schemas/dbdr.schema.json` is complete
3. **Engine registration**: 'dbdr' already in SUPPORTED_TYPES (line 22)
4. **CLI available**: `aios generate dbdr` works via Story 3.9

### Remaining Work

Only **tests** need to be created:
- Create `tests/templates/dbdr.test.js`
- Implement 7 test cases (DBDR-01 to DBDR-07)
- Use `tests/templates/pmdr.test.js` as reference

### Story Points Adjustment

Reduced from **3 points** to **2 points** due to pre-implementation.

### Readiness Score: 8/10

Story is ready for development. @dev can proceed immediately with test creation.

---

**Created by:** River 🌊
**Validated by:** Pax 🎯 (PO)
