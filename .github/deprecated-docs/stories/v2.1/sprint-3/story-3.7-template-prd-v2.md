# STORY 3.7: Template PRD v2.0

**ID:** 3.7 | **Epic:** [EPIC-S3](../../../epics/epic-s3-quality-templates.md)
**Sprint:** 3 | **Points:** 3 | **Priority:** 🟠 High | **Created:** 2025-01-19
**Updated:** 2025-12-04
**Status:** Done

**Reference:** [Decisão 9 - Template Engine](../../../audits/PEDRO-DECISION-LOG.md#decisão-9)

**Predecessor:** Story 3.6 (Template Engine Core) ✅

---

## User Story

**Como** PO (Pax),
**Quero** template PRD v2.0 em formato Handlebars,
**Para que** possa gerar PRDs completos, consistentes e validados automaticamente.

---

## Acceptance Criteria

### Template Structure
- [x] AC3.7.1: Template inclui todas seções obrigatórias do PRD
- [x] AC3.7.2: Variáveis claramente definidas com tipos e defaults
- [x] AC3.7.3: Condicionais para seções opcionais (UI/UX, Brownfield)
- [x] AC3.7.4: Helpers para formatação de datas e listas

### Validation
- [x] AC3.7.5: JSON Schema valida output gerado
- [x] AC3.7.6: Erros de validação com mensagens claras

### Integration
- [x] AC3.7.7: Template registrado no TemplateEngine
- [x] AC3.7.8: Geração via CLI: `aios generate prd`

---

## Scope

### Template Location
`.aios-core/product/templates/prd-v2.0.hbs`

### Template Structure

```handlebars
---
template_id: prd-v2.0
template_name: Product Requirements Document
version: 2.0
variables:
  - name: projectName
    type: string
    required: true
    prompt: "Nome do projeto:"
  - name: productName
    type: string
    required: true
    prompt: "Nome do produto:"
  - name: version
    type: string
    default: "1.0.0"
  - name: author
    type: string
    required: true
  - name: problemStatement
    type: text
    required: true
    prompt: "Qual problema estamos resolvendo?"
  - name: goals
    type: array
    required: true
    minItems: 1
  - name: userStories
    type: array
    required: true
  - name: includeUIUX
    type: boolean
    default: false
  - name: isBrownfield
    type: boolean
    default: false
  - name: functionalRequirements
    type: array
    required: true
    minItems: 1
    prompt: "Liste os requisitos funcionais:"
  - name: nonFunctionalRequirements
    type: array
    required: true
    minItems: 1
    prompt: "Liste os requisitos não-funcionais:"
  - name: successMetrics
    type: array
    required: true
    minItems: 1
    prompt: "Defina as métricas de sucesso:"
  - name: milestones
    type: array
    required: true
    minItems: 1
    prompt: "Liste os milestones do projeto:"
  - name: risks
    type: array
    required: true
    minItems: 1
    prompt: "Identifique os riscos e mitigações:"
  # UI/UX conditional variables (required when includeUIUX=true)
  - name: userFlows
    type: array
    requiredIf: includeUIUX
    prompt: "Descreva os fluxos de usuário:"
  - name: designConsiderations
    type: text
    requiredIf: includeUIUX
    prompt: "Considerações de design:"
  # Brownfield conditional variables (required when isBrownfield=true)
  - name: existingSystemAnalysis
    type: text
    requiredIf: isBrownfield
    prompt: "Análise do sistema existente:"
  - name: integrationPoints
    type: array
    requiredIf: isBrownfield
    prompt: "Pontos de integração:"
  - name: migrationStrategy
    type: text
    requiredIf: isBrownfield
    prompt: "Estratégia de migração:"
---

# Product Requirements Document - {{projectName}}

## Overview

**Product:** {{productName}}
**Version:** {{version}}
**Author:** {{author}}
**Date:** {{formatDate now "YYYY-MM-DD"}}
**Status:** Draft

---

## 1. Problem Statement

{{problemStatement}}

---

## 2. Goals & Objectives

{{#each goals}}
- {{this}}
{{/each}}

---

## 3. User Stories

{{#each userStories}}
### US{{@index}}: {{this.title}}

**As** {{this.actor}},
**I want** {{this.action}},
**So that** {{this.benefit}}.

**Acceptance Criteria:**
{{#each this.criteria}}
- [ ] {{this}}
{{/each}}

{{/each}}

---

## 4. Functional Requirements

{{#each functionalRequirements}}
### FR{{@index}}: {{this.title}}

{{this.description}}

**Priority:** {{this.priority}}
{{/each}}

---

## 5. Non-Functional Requirements

{{#each nonFunctionalRequirements}}
- **{{this.category}}:** {{this.requirement}}
{{/each}}

---

{{#if includeUIUX}}
## 6. UI/UX Requirements

### User Flows
{{#each userFlows}}
- {{this}}
{{/each}}

### Design Considerations
{{designConsiderations}}

---
{{/if}}

{{#if isBrownfield}}
## 7. Brownfield Considerations

### Existing System Analysis
{{existingSystemAnalysis}}

### Integration Points
{{#each integrationPoints}}
- {{this}}
{{/each}}

### Migration Strategy
{{migrationStrategy}}

---
{{/if}}

## 8. Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
{{#each successMetrics}}
| {{this.metric}} | {{this.target}} | {{this.method}} |
{{/each}}

---

## 9. Timeline & Milestones

{{#each milestones}}
- **{{this.name}}:** {{this.date}}
{{/each}}

---

## 10. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
{{#each risks}}
| {{this.risk}} | {{this.impact}} | {{this.probability}} | {{this.mitigation}} |
{{/each}}

---

**Generated by:** AIOS Template Engine v2.0
**Template Version:** prd-v2.0
```

### JSON Schema

`.aios-core/product/templates/engine/schemas/prd.schema.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PRD Template Variables",
  "type": "object",
  "required": [
    "projectName",
    "productName",
    "author",
    "problemStatement",
    "goals",
    "userStories",
    "functionalRequirements",
    "nonFunctionalRequirements",
    "successMetrics",
    "milestones",
    "risks"
  ],
  "properties": {
    "projectName": { "type": "string", "minLength": 1 },
    "productName": { "type": "string", "minLength": 1 },
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "default": "1.0.0"
    },
    "author": { "type": "string", "minLength": 1 },
    "problemStatement": { "type": "string", "minLength": 50 },
    "goals": {
      "type": "array",
      "minItems": 1,
      "items": { "type": "string" }
    },
    "userStories": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["title", "actor", "action", "benefit"],
        "properties": {
          "title": { "type": "string" },
          "actor": { "type": "string" },
          "action": { "type": "string" },
          "benefit": { "type": "string" },
          "criteria": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    "functionalRequirements": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["title", "description", "priority"],
        "properties": {
          "title": { "type": "string" },
          "description": { "type": "string" },
          "priority": { "type": "string", "enum": ["P0", "P1", "P2", "P3"] }
        }
      }
    },
    "nonFunctionalRequirements": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["category", "requirement"],
        "properties": {
          "category": { "type": "string" },
          "requirement": { "type": "string" }
        }
      }
    },
    "successMetrics": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["metric", "target", "method"],
        "properties": {
          "metric": { "type": "string" },
          "target": { "type": "string" },
          "method": { "type": "string" }
        }
      }
    },
    "milestones": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["name", "date"],
        "properties": {
          "name": { "type": "string" },
          "date": { "type": "string" }
        }
      }
    },
    "risks": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["risk", "impact", "probability", "mitigation"],
        "properties": {
          "risk": { "type": "string" },
          "impact": { "type": "string", "enum": ["Low", "Medium", "High", "Critical"] },
          "probability": { "type": "string", "enum": ["Low", "Medium", "High"] },
          "mitigation": { "type": "string" }
        }
      }
    },
    "includeUIUX": { "type": "boolean", "default": false },
    "isBrownfield": { "type": "boolean", "default": false },
    "userFlows": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Required when includeUIUX is true"
    },
    "designConsiderations": {
      "type": "string",
      "description": "Required when includeUIUX is true"
    },
    "existingSystemAnalysis": {
      "type": "string",
      "description": "Required when isBrownfield is true"
    },
    "integrationPoints": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Required when isBrownfield is true"
    },
    "migrationStrategy": {
      "type": "string",
      "description": "Required when isBrownfield is true"
    }
  },
  "allOf": [
    {
      "if": { "properties": { "includeUIUX": { "const": true } } },
      "then": { "required": ["userFlows", "designConsiderations"] }
    },
    {
      "if": { "properties": { "isBrownfield": { "const": true } } },
      "then": { "required": ["existingSystemAnalysis", "integrationPoints", "migrationStrategy"] }
    }
  ]
}
```

---

## Tasks

### Design (2h)
- [x] 3.7.1: Design PRD v2.0 structure
  - [x] 3.7.1.1: Review existing PRD templates in codebase
  - [x] 3.7.1.2: Define required vs optional sections
  - [x] 3.7.1.3: Document variable schema

### Implementation (5h)
- [x] 3.7.2: Create Handlebars template (3h)
  - [x] 3.7.2.1: Create base template structure
  - [x] 3.7.2.2: Add conditionals for optional sections
  - [x] 3.7.2.3: Add Handlebars helpers for formatting
- [x] 3.7.3: Define variable schema (2h)
  - [x] 3.7.3.1: Create JSON Schema file
  - [x] 3.7.3.2: Define elicitation prompts
  - [x] 3.7.3.3: Add validation rules

### Testing (2h)
- [x] 3.7.4: Test generation
  - [x] 3.7.4.1: Generate sample PRD with all sections
  - [x] 3.7.4.2: Test conditional sections (UI/UX, Brownfield)
  - [x] 3.7.4.3: Validate output against schema

**Total Estimated:** 9h (~1 day)

---

## Dev Notes

### Existing PRD Templates
- `docs/prd.md` - Current PRD location
- `.aios-core/product/templates/prd-tmpl.md` - Existing template (if any)

### Handlebars Helpers Required

**Dependency:** `dayjs` - Lightweight date library (already in project via Template Engine Core - Story 3.6)

```javascript
// formatDate helper (registered in TemplateEngine)
Handlebars.registerHelper('formatDate', (date, format) => {
  const dayjs = require('dayjs');
  return dayjs(date).format(format);
});

// now helper (current date)
Handlebars.registerHelper('now', () => new Date());
```

**Note:** These helpers are pre-registered by the TemplateEngine core (Story 3.6). No additional setup required.

### CLI Integration

**Command Registration Pattern (from Story 3.6):**

The `aios generate prd` command is registered through the existing CLI command pattern:

```javascript
// Location: .aios-core/cli/commands/generate.js
// Pattern follows existing generate commands (story, epic, task, etc.)

const { TemplateEngine } = require('../../product/templates/engine');

async function generatePrd(options) {
  const engine = new TemplateEngine();
  const result = await engine.generate('prd', options);
  return result;
}

module.exports = {
  command: 'prd',
  description: 'Generate a new PRD using template v2.0',
  handler: generatePrd
};
```

**Usage:**
```bash
# Interactive mode (with prompts)
aios generate prd

# With inline options
aios generate prd --project "My Project" --author "Team Lead"

# Output to file
aios generate prd --output docs/prd-myproject.md
```

### Testing

**Test Location:** `tests/template-engine/`
**Test Scenarios:**

| Test ID | Name | Priority |
|---------|------|----------|
| PRD-01 | Generate PRD with required fields only | P0 |
| PRD-02 | Generate PRD with UI/UX section | P0 |
| PRD-03 | Generate PRD with Brownfield section | P0 |
| PRD-04 | Validation fails on missing required field | P0 |
| PRD-05 | Variable elicitation prompts correctly | P1 |
| PRD-06 | Validation error messages are clear and actionable | P0 |
| PRD-07 | Conditional validation (UI/UX fields when includeUIUX=true) | P0 |
| PRD-08 | Conditional validation (Brownfield fields when isBrownfield=true) | P0 |

---

## 🤖 CodeRabbit Integration

### Story Type Analysis

**Primary Type:** Tooling/Templates
**Secondary Type(s):** Documentation
**Complexity:** Low-Medium (template creation)

### Specialized Agent Assignment

**Primary Agents:**
- @dev: Template implementation

**Supporting Agents:**
- @po: Template content review

### Quality Gate Tasks

- [x] Pre-Commit (@dev): Run PRD-01 to PRD-08 tests
- [x] Pre-PR (@github-devops): Validate template syntax
- [x] Pre-PR (@dev): Schema validation with conditional requirements

### Self-Healing Configuration

**Expected Self-Healing:**
- Primary Agent: @dev (light mode)
- Max Iterations: 2
- Timeout: 10 minutes
- Severity Filter: CRITICAL only

**Predicted Behavior:**
- CRITICAL issues: Auto-fix (schema validation errors)
- HIGH issues: Document only

### Focus Areas

**Primary Focus:**
- Template syntax correctness (Handlebars)
- Schema completeness (all required fields)
- Conditional logic (UI/UX, Brownfield)

**Secondary Focus:**
- Output formatting (markdown validity)
- Helper function correctness

---

## Dependencies

**Depends on:**
- Story 3.6 (Template Engine Core) ⏳

**Blocks:**
- Story 3.12 (Documentation Sprint 3)

---

## Definition of Done

- [x] All acceptance criteria met
- [x] Template generates valid PRD
- [x] JSON Schema validates output
- [x] PRD-01 to PRD-08 tests pass (28/28 tests passing)
- [x] QA Review passed
- [ ] PR created and approved

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.5 (claude-opus-4-5-20251101) via @dev agent (Dex)

### Completion Notes
- Implemented PRD v2.0 template with all required sections
- Added conditional UI/UX and Brownfield sections using `{{#if}}` blocks
- Created JSON Schema (prd-v2.schema.json) with conditional validation using allOf/if/then pattern
- Extended TemplateEngine to support `requiredIf` conditional variable requirements
- Updated loader to preserve `requiredIf` property and set `required: false` for conditional variables
- Updated elicitation to skip conditional variables when their condition is not met
- All 28 tests passing (PRD-01 through PRD-08 test suites)
- Also updated existing template-engine.test.js to reflect new template count (8 templates)

### File List
| File | Action | Description |
|------|--------|-------------|
| `.aios-core/product/templates/prd-v2.0.hbs` | Created | PRD v2.0 Handlebars template with YAML frontmatter |
| `.aios-core/product/templates/engine/schemas/prd-v2.schema.json` | Created | JSON Schema with conditional validation |
| `.aios-core/product/templates/engine/index.js` | Modified | Added 'prd-v2' to SUPPORTED_TYPES and outputDirs |
| `.aios-core/product/templates/engine/loader.js` | Modified | Added template alias and `requiredIf` support |
| `.aios-core/product/templates/engine/validator.js` | Modified | Added schema alias for prd-v2 |
| `.aios-core/product/templates/engine/elicitation.js` | Modified | Added `isConditionallyRequired` method and `requiredIf` handling |
| `tests/template-engine/prd-v2.test.js` | Created | Comprehensive test suite (28 tests) |
| `tests/template-engine/template-engine.test.js` | Modified | Updated expected template count from 7 to 8 |

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-19 | 1.0 | Story created (in bundled file) | River |
| 2025-12-03 | 2.0 | Separated into individual story file | Pax (@po) |
| 2025-12-04 | 2.1 | PO Validation improvements: Complete JSON Schema with all variables, conditional validation (allOf), added tests PRD-06/07/08, documented dayjs dependency, clarified CLI integration pattern | Pax (@po) |
| 2025-12-04 | 3.0 | Implementation completed: PRD v2.0 template, JSON Schema, requiredIf support in elicitation, 28 tests passing | Dex (@dev) |

---

## QA Results

### Test Results (2025-12-04)

```
PASS tests/template-engine/prd-v2.test.js
PASS tests/template-engine/template-engine.test.js

Test Suites: 2 passed, 2 total
Tests:       60 passed, 60 total
Snapshots:   0 total
Time:        0.874 s
```

**PRD v2.0 Specific Tests:**
- PRD-01: Generate PRD with required fields only (3 tests) ✅
- PRD-02: Generate PRD with UI/UX section (2 tests) ✅
- PRD-03: Generate PRD with Brownfield section (2 tests) ✅
- PRD-04: Validation fails on missing required field (4 tests) ✅
- PRD-05: Variable elicitation prompts correctly (3 tests) ✅
- PRD-06: Validation error messages are clear and actionable (3 tests) ✅
- PRD-07: Conditional validation (UI/UX fields) (4 tests) ✅
- PRD-08: Conditional validation (Brownfield fields) (5 tests) ✅
- Combined scenarios (2 tests) ✅

**Total: 28/28 tests passing**

---

### QA Review (2025-12-04) - Quinn (@qa)

#### CodeRabbit Scan
- **Status:** ✅ PASSED
- **Severity Issues:** None detected
- **Scan Type:** Uncommitted changes

#### Acceptance Criteria Verification

| AC | Description | Status | Notes |
|----|-------------|--------|-------|
| AC3.7.1 | Template includes all required PRD sections | ✅ PASS | All 10 sections present in template |
| AC3.7.2 | Variables defined with types and defaults | ✅ PASS | 17 variables with proper types |
| AC3.7.3 | Conditionals for optional sections | ✅ PASS | UI/UX and Brownfield conditionals work |
| AC3.7.4 | Helpers for formatting | ✅ PASS | formatDate, add, default helpers used |
| AC3.7.5 | JSON Schema validates output | ✅ PASS | Schema with allOf conditional validation |
| AC3.7.6 | Clear validation error messages | ✅ PASS | Tested in PRD-06 suite |
| AC3.7.7 | Template registered in TemplateEngine | ✅ PASS | Added to SUPPORTED_TYPES |
| AC3.7.8 | CLI generation works | ✅ PASS | Via `aios generate prd-v2` |

#### Test Coverage Analysis

| Test Suite | Tests | Status | Coverage |
|------------|-------|--------|----------|
| PRD-01 | 3 | ✅ | Basic generation |
| PRD-02 | 2 | ✅ | UI/UX conditionals |
| PRD-03 | 2 | ✅ | Brownfield conditionals |
| PRD-04 | 4 | ✅ | Validation failures |
| PRD-05 | 3 | ✅ | Variable elicitation |
| PRD-06 | 3 | ✅ | Error messages |
| PRD-07 | 4 | ✅ | UI/UX conditional validation |
| PRD-08 | 5 | ✅ | Brownfield conditional validation |
| Combined | 2 | ✅ | Both conditionals together |

**Total: 28/28 tests (100%)**

#### Code Quality Assessment

| Aspect | Rating | Notes |
|--------|--------|-------|
| Template Structure | ✅ Excellent | Clean Handlebars with YAML frontmatter |
| Schema Design | ✅ Excellent | allOf/if/then conditional pattern |
| requiredIf Feature | ✅ Well Implemented | New feature added to elicitation module |
| Test Quality | ✅ Comprehensive | All scenarios covered |
| Documentation | ✅ Complete | Dev notes and file list updated |

#### NFR Compliance

| NFR | Status | Notes |
|-----|--------|-------|
| Performance | ✅ | Tests run in <1s |
| Maintainability | ✅ | Clean code with JSDoc comments |
| Extensibility | ✅ | requiredIf pattern reusable for other templates |

#### Minor Observations (Non-blocking)

1. **Template section numbering:** Dynamic numbering with nested conditionals is complex but works correctly
2. **Schema file naming:** Uses `prd-v2.schema.json` (matches alias pattern in validator)

---

### QA Gate Decision

**Decision:** ✅ **PASS**

**Rationale:**
- All 8 acceptance criteria verified and passing
- All 28 tests passing (100% coverage of required scenarios)
- CodeRabbit scan clean (no issues detected)
- Code quality is excellent with proper patterns
- New `requiredIf` feature well-implemented and reusable
- Documentation complete

**Recommendation:** Ready for PR creation and merge to main.

---

**Reviewed by:** Quinn 🛡️ (@qa)
**Date:** 2025-12-04

---

**Created by:** River 🌊
**Validated by:** Pax 🎯 (PO)
