# Story WIS-10: Service Template Implementation

<!-- Source: Epic WIS - Workflow Intelligence System -->
<!-- Context: Foundation template for incremental feature development -->
<!-- Created: 2025-12-23 by @sm (River) -->

## Status: Done ✅

**Priority:** 🔴 HIGH
**Sprint:** 10
**Effort:** 8-10h
**Lead:** @dev (Dex)
**Approved by:** @po (Pax) - 2025-12-23

---

## Story

**As an** AIOS developer creating new services,
**I want** a standardized service template with Handlebars scaffolding,
**So that** I can quickly generate consistent, high-quality service structures using `*create-service`.

---

## Background

WIS-9 Investigation identified that ad-hoc service creation led to:
- Inconsistent file structures
- Varying quality levels (some with tests, some without)
- Different technology choices (JS vs TS)
- Time wasted reinventing patterns

This story implements the **service-template/** specification from WIS-9 Section 6.1.

### Reference Documents

| Document | Section |
|----------|---------|
| `docs/architecture/wis-9-investigation-report.md` | Section 6.1: service-template/ |
| `docs/architecture/wis-9-investigation-report.md` | Section 2.3: Minimum Quality Bar |

---

## 🤖 CodeRabbit Integration

### Story Type Analysis

**Primary Type**: Implementation
**Secondary Type(s)**: Template Creation, Developer Tooling
**Complexity**: Medium

### Specialized Agent Assignment

**Primary Agents**:
- @dev (Dex): Implement templates and validate generation

**Supporting Agents**:
- @architect (Aria): Review template structure
- @qa (Quinn): Validate generated output quality

### Quality Gate Tasks

- [ ] Pre-Commit (@dev): Validate template syntax and generation
  - **Pass criteria:** All templates generate valid TypeScript, tests pass
  - **Fail criteria:** Handlebars syntax errors, missing placeholders
- [ ] Architecture Review (@architect): Validate template structure
  - **Pass criteria:** Follows WIS-9 spec, consistent with AIOS patterns
  - **Fail criteria:** Deviates from spec, missing required files

### Self-Healing Configuration

**Mode:** light
**Max Iterations:** 2
**Timeout:** 15 minutes
**Severity Filter:** CRITICAL, HIGH

| Severity | Action |
|----------|--------|
| CRITICAL | auto_fix (2 attempts) |
| HIGH | document_only |
| MEDIUM | ignore |
| LOW | ignore |

### Focus Areas

- Handlebars template syntax correctness
- TypeScript strict mode compliance in generated code
- Factory pattern implementation
- Test file generation

---

## Acceptance Criteria

### AC 10.1: Template Directory Structure
- [x] Create `.aios-core/development/templates/service-template/` directory
- [x] Include all required files from WIS-9 spec:
  ```
  service-template/
  ├── README.md.hbs
  ├── index.ts.hbs
  ├── client.ts.hbs
  ├── types.ts.hbs
  ├── errors.ts.hbs
  ├── package.json.hbs
  ├── tsconfig.json
  ├── jest.config.js
  └── __tests__/
      └── index.test.ts.hbs
  ```

### AC 10.2: README.md.hbs Template
- [x] Implement README template with:
  - Service name (PascalCase)
  - Description placeholder
  - Installation instructions
  - Usage example with factory function
  - Environment variables table (dynamic)
  - API reference link

### AC 10.3: index.ts.hbs Template
- [x] Implement entry point template with:
  - Module JSDoc with `@module` and `@story` tags
  - Re-exports for types, errors, client (conditional)
  - Factory function `create{{pascalCase serviceName}}Service()`
  - Service interface definition
  - Default export

### AC 10.4: types.ts.hbs Template
- [x] Implement types template with:
  - `{{pascalCase serviceName}}Config` interface
  - `{{pascalCase serviceName}}Service` interface
  - Error types enumeration
  - API response types (if api-integration)

### AC 10.5: errors.ts.hbs Template
- [x] Implement errors template with:
  - Base `{{pascalCase serviceName}}Error` class extending Error
  - Error code enumeration
  - Typed error factory functions

### AC 10.6: client.ts.hbs Template (API Integration)
- [x] Implement HTTP client template with:
  - Rate limiting configuration
  - Retry logic with exponential backoff
  - Environment variable configuration
  - Request/response logging (debug mode)
  - Conditional rendering for `isApiIntegration`

### AC 10.7: Test Template
- [x] Implement `__tests__/index.test.ts.hbs` with:
  - Factory function tests
  - Configuration tests
  - Basic service method stubs
  - Jest configuration

### AC 10.8: Configuration Files
- [x] Create static `tsconfig.json` with strict mode
- [x] Create static `jest.config.js` for TypeScript
- [x] Create `package.json.hbs` with:
  - Dynamic name: `@aios/{{kebabCase serviceName}}`
  - TypeScript dependencies
  - Jest test configuration
  - Build scripts

---

## Tasks / Subtasks

- [x] **Task 1: Setup Template Directory** (AC: 10.1)
  - [x] Create `.aios-core/development/templates/service-template/`
  - [x] Create `__tests__/` subdirectory
  - [x] Add template metadata file (optional)

- [x] **Task 2: Implement Core Templates** (AC: 10.2, 10.3, 10.4, 10.5)
  - [x] Create `README.md.hbs`
  - [x] Create `index.ts.hbs`
  - [x] Create `types.ts.hbs`
  - [x] Create `errors.ts.hbs`

- [x] **Task 3: Implement API Client Template** (AC: 10.6)
  - [x] Create `client.ts.hbs`
  - [x] Add rate limiting logic
  - [x] Add retry with exponential backoff
  - [x] Add conditional `{{#if isApiIntegration}}` blocks

- [x] **Task 4: Implement Test and Config** (AC: 10.7, 10.8)
  - [x] Create `__tests__/index.test.ts.hbs`
  - [x] Create static `tsconfig.json`
  - [x] Create static `jest.config.js`
  - [x] Create `package.json.hbs`

- [x] **Task 5: Validation**
  - [x] Test template generation manually
  - [x] Verify TypeScript compilation of generated code
  - [x] Run generated tests
  - [x] Update story status

---

## Dev Notes

### Handlebars Helpers Required

The templates use the following Handlebars helpers (must be available in generator):
- `{{pascalCase name}}` - Convert to PascalCase (e.g., "my-service" → "MyService")
- `{{kebabCase name}}` - Convert to kebab-case (e.g., "MyService" → "my-service")
- `{{#if condition}}...{{/if}}` - Conditional rendering
- `{{#each array}}...{{/each}}` - Array iteration

### Template Variables

| Variable | Type | Description |
|----------|------|-------------|
| `serviceName` | string | Service name in kebab-case |
| `description` | string | Service description |
| `isApiIntegration` | boolean | True if service is API integration |
| `hasAuth` | boolean | True if service requires auth |
| `envVars` | array | Environment variables list |
| `storyId` | string | Reference story ID |

### Quality Bar (from WIS-9)

| Requirement | Priority |
|-------------|----------|
| TypeScript with strict mode | MUST |
| README.md documentation | MUST |
| Environment variable config | MUST |
| Factory function pattern | MUST |
| Rate limiting (for APIs) | MUST |
| Error classes | SHOULD |
| Unit tests (>70% coverage) | SHOULD |

---

## Testing

**Test Location:** `.aios-core/development/templates/service-template/__tests__/`
**Framework:** Jest with TypeScript

**Validation Tests:**
1. Generate a test service using templates
2. Compile generated TypeScript
3. Run generated tests
4. Verify all placeholders replaced

---

## Dependencies

### Blocked By
- **WIS-9:** Investigation complete ✅ (provides template specifications)

### Blocks
- **WIS-11:** `*create-service` Task (needs templates from this story)
- **WIS-12:** `*create-integration` Task (extends templates)

---

## Success Criteria

1. All template files created and valid Handlebars syntax
2. Generated service compiles with TypeScript strict mode
3. Generated tests pass
4. Template matches WIS-9 specification exactly

---

## QA Results

### Review Date: 2025-12-23
### Reviewer: @qa (Quinn)
### Gate Decision: ⚠️ CONCERNS

---

### Implementation Assessment

| Criterion | Status | Notes |
|-----------|--------|-------|
| All template files exist | ✅ PASS | 9/9 files created |
| Handlebars syntax valid | ✅ PASS | All templates use correct syntax |
| WIS-9 spec compliance | ✅ PASS | Templates match/exceed specification |
| TypeScript strict mode | ✅ PASS | tsconfig.json properly configured |
| Factory pattern | ✅ PASS | Correctly implemented in index.ts.hbs |
| Rate limiting | ✅ PASS | Implemented with exponential backoff |
| Error classes | ✅ PASS | Typed errors with factory functions |
| Test template | ✅ PASS | Comprehensive test coverage setup |
| 70% coverage config | ✅ PASS | jest.config.js threshold set |

### Template File Verification

```
✅ README.md.hbs          - Complete: name, description, install, usage, env vars, API ref
✅ index.ts.hbs           - Complete: JSDoc @module/@story, re-exports, factory, default export
✅ types.ts.hbs           - Complete: Config interface, Service interface, API types
✅ errors.ts.hbs          - Complete: Error class, error codes, factory functions
✅ client.ts.hbs          - Complete: Rate limiting, retry with backoff, conditional
✅ __tests__/index.test.ts.hbs - Complete: Factory, config, method, error tests
✅ tsconfig.json          - Complete: Strict mode enabled
✅ jest.config.js         - Complete: 70% coverage threshold
✅ package.json.hbs       - Complete: Dynamic name, TypeScript, Jest, build scripts
```

### Quality Bar Validation (from WIS-9)

| Requirement | Priority | Status |
|-------------|----------|--------|
| TypeScript with strict mode | MUST | ✅ PASS |
| README.md documentation | MUST | ✅ PASS |
| Environment variable config | MUST | ✅ PASS |
| Factory function pattern | MUST | ✅ PASS |
| Rate limiting (for APIs) | MUST | ✅ PASS |
| Error classes | SHOULD | ✅ PASS |
| Unit tests (>70% coverage) | SHOULD | ✅ PASS |

### NFR Validation

| Category | Status | Notes |
|----------|--------|-------|
| Security | ✅ PASS | Sensitive config excluded from getConfig(), proper auth header handling |
| Reliability | ✅ PASS | Retry logic with exponential backoff and jitter |
| Maintainability | ✅ PASS | JSDoc documentation, TypeScript types, consistent patterns |
| Testability | ✅ PASS | Jest configuration, test templates, mockable design |

### Issues Found

#### CRITICAL: Story Documentation Mismatch
- **Issue:** Story marked "Done ✅" but AC checkboxes show incomplete (AC 10.3-10.8 all [ ])
- **Reality:** All templates actually exist and are complete
- **Impact:** Documentation does not reflect implementation state
- **Action Required:** @dev must update story checkboxes to reflect completed work

#### HIGH: Uncommitted Files
- **Issue:** Templates directory `.aios-core/development/templates/` is untracked
- **Impact:** Files not version controlled, CodeRabbit cannot review
- **Action Required:** @dev must commit template files before merge

### Recommendations

1. **Update Story Checkboxes** - Mark AC 10.3-10.8 as complete [x]
2. **Update Task Checkboxes** - Mark Tasks 1-5 as complete [x]
3. **Commit Templates** - Stage and commit the templates directory
4. **Handlebars Helper Verification** - Confirm `camelCase` helper is available (used in templates)

### Gate Decision Rationale

**Decision: CONCERNS** (Not blocking, but requires action)

The implementation is **high quality** and **meets all WIS-9 specifications**. However:
- Story file checkboxes do not reflect actual implementation state
- Templates are not yet committed to version control

**Condition for PASS:**
1. @dev updates story checkboxes to match implementation
2. Templates committed to git

### CodeRabbit Integration

- **Scope:** Uncommitted changes (templates not in git yet)
- **Result:** Cannot run automated review on uncommitted files
- **Recommendation:** Run `*code-review committed` after templates are committed

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-23 | @sm (River) | Initial draft from WIS-9 investigation |
| 1.1 | 2025-12-23 | @po (Pax) | PO Validation: APPROVED - Added Dependencies, Success Criteria |
| 1.2 | 2025-12-23 | @qa (Quinn) | QA Review: CONCERNS - Implementation complete, documentation needs update |
| 1.3 | 2025-12-23 | @dev (Dex) | Applied QA fixes: Updated all AC/Task checkboxes, committed templates (6f452e4) |
