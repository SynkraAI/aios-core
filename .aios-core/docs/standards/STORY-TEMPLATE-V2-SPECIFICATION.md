# Story Template v2.0 Specification

**Version:** 2.0.0
**Last Updated:** 2025-12-09
**Status:** Official Standard
**Related:** Sprint 3-5 Implementation

---

## 📋 Table of Contents

- [Overview](#overview)
- [Template Structure](#template-structure)
- [Section Specifications](#section-specifications)
- [Story Types](#story-types)
- [Validation Checklist](#validation-checklist)
- [Examples](#examples)

---

## Overview

### Purpose

The Story Template v2.0 standardizes story documentation across the AIOS project, ensuring consistency, traceability, and integration with automated tools like CodeRabbit.

### What's New in v2.0

| Feature | v1.x | v2.0 |
|---------|------|------|
| Cross-Story Decisions | ❌ | ✅ Required section |
| CodeRabbit Integration | ❌ | ✅ Story Type Analysis, Agent Assignment |
| Dev Agent Record | ❌ | ✅ Execution logging |
| QA Results | ❌ | ✅ Structured test results |
| Testing Checklist | Informal | ✅ Standardized format |

### Design Principles

1. **Structure is Sacred** - Consistent sections in consistent order
2. **Traceability** - Link to decisions, dependencies, and related stories
3. **Automation Ready** - Machine-parseable sections for CI/CD integration
4. **Progress Visibility** - Clear status indicators and checkboxes
5. **Agent Compatibility** - Works with @dev, @qa, @po agents

---

## Template Structure

### Complete Template

```markdown
# Story X.X: [Title]

**Epic:** [Parent Epic Name]
**Story ID:** X.X
**Sprint:** [Sprint Number]
**Priority:** 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low
**Points:** [Story Points]
**Effort:** [Estimated Hours]
**Status:** ⚪ Ready | 🔄 In Progress | ✅ Done | ❌ Blocked
**Type:** 🔧 Infrastructure | 💻 Feature | 📖 Documentation | ✅ Validation | 🐛 Bug Fix

---

## 🔀 Cross-Story Decisions

| Decision | Source | Impact on This Story |
|----------|--------|----------------------|
| [Decision Name] | [Story ID/Meeting] | [How it affects this story] |

---

## 📋 User Story

**Como** [persona],
**Quero** [desired action/capability],
**Para** [benefit/value delivered].

---

## 🎯 Objective

[2-3 sentences describing the primary goal of this story]

---

## ✅ Tasks

### Phase 1: [Phase Name] ([Estimated Time])

- [ ] **1.1** [Task description]
  - [Sub-task or detail if needed]
- [ ] **1.2** [Task description]

### Phase 2: [Phase Name] ([Estimated Time])

- [ ] **2.1** [Task description]
- [ ] **2.2** [Task description]

---

## 🎯 Acceptance Criteria

```gherkin
GIVEN [initial context/state]
WHEN [action performed]
THEN [expected outcome]
AND [additional outcomes]
```

---

## 🤖 CodeRabbit Integration

### Story Type Analysis

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Type | [Infrastructure/Feature/Documentation/Validation] | [Why this type] |
| Complexity | [Low/Medium/High] | [Why this complexity] |
| Test Requirements | [Unit/Integration/E2E/Manual] | [Why these tests] |
| Review Focus | [Performance/Security/Logic/Documentation] | [Key review areas] |

### Agent Assignment

| Role | Agent | Responsibility |
|------|-------|----------------|
| Primary | @[agent] | [Main task] |
| Secondary | @[agent] | [Supporting task] |
| Review | @[agent] | [Review task] |

### Self-Healing Config

```yaml
reviews:
  auto_review:
    enabled: true
    drafts: false
  path_instructions:
    - path: "[relevant path pattern]"
      instructions: "[specific review instructions]"

chat:
  auto_reply: true
```

### Focus Areas

- [ ] [Focus area 1]
- [ ] [Focus area 2]
- [ ] [Focus area 3]

---

## 🔗 Dependencies

**Blocked by:**
- [Dependency 1 - status]
- [Dependency 2 - status]

**Blocks:**
- [What this story blocks]

---

## ⚠️ Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| [Risk description] | [High/Medium/Low] | [How to mitigate] |

---

## 📋 Definition of Done

- [ ] [DoD item 1]
- [ ] [DoD item 2]
- [ ] [DoD item 3]
- [ ] All acceptance criteria verified
- [ ] Tests passing
- [ ] Documentation updated
- [ ] PR approved and merged

---

## 📝 Dev Notes

### Key Files

```
path/to/relevant/files
├── file1.ts
├── file2.ts
└── file3.md
```

### Technical Notes

[Any technical details relevant to implementation]

### Testing Checklist

#### [Test Category 1]
- [ ] [Test item 1]
- [ ] [Test item 2]

#### [Test Category 2]
- [ ] [Test item 1]
- [ ] [Test item 2]

---

## 🧑‍💻 Dev Agent Record

> This section is populated when @dev executes the story.

### Execution Log

| Timestamp | Phase | Action | Result |
|-----------|-------|--------|--------|
| - | - | Awaiting execution | - |

### Implementation Notes

_To be filled during execution._

### Issues Encountered

_None yet - story not started._

---

## 🧪 QA Results

> This section is populated after @qa reviews the implementation.

### Test Execution Summary

| Category | Tests | Passed | Failed | Skipped |
|----------|-------|--------|--------|---------|
| Unit | - | - | - | - |
| Integration | - | - | - | - |
| E2E | - | - | - | - |

### Validation Checklist

| Check | Status | Notes |
|-------|--------|-------|
| Acceptance criteria | ⏳ | |
| DoD items | ⏳ | |
| Edge cases | ⏳ | |
| Documentation | ⏳ | |

### QA Sign-off

- [ ] All acceptance criteria verified
- [ ] Tests passing (coverage ≥80%)
- [ ] Documentation complete
- [ ] Ready for release

**QA Agent:** _Awaiting assignment_
**Date:** _Pending_

---

## 📜 Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| [Date] | 1.0.0 | Initial story creation | @[agent] |

---

**Criado por:** [Agent Name] ([Role])
**Data:** [Creation Date]
**Atualizado:** [Last Update] ([Change description])
```

---

## Section Specifications

### Header Section

| Field | Required | Format | Valid Values |
|-------|----------|--------|--------------|
| Title | Yes | `# Story X.X: [Title]` | Descriptive, action-oriented |
| Epic | Yes | Text | Parent epic name |
| Story ID | Yes | `X.X` or `XXX-N` | Unique identifier |
| Sprint | Yes | Number | Sprint number |
| Priority | Yes | Emoji + Text | 🔴 Critical, 🟠 High, 🟡 Medium, 🟢 Low |
| Points | Yes | Number | Fibonacci (1,2,3,5,8,13,21) |
| Effort | Recommended | `X-Y hours` | Time estimate range |
| Status | Yes | Emoji + Text | ⚪ Ready, 🔄 In Progress, ✅ Done, ❌ Blocked |
| Type | Yes | Emoji + Text | 🔧 Infrastructure, 💻 Feature, 📖 Documentation, ✅ Validation, 🐛 Bug Fix |

### Cross-Story Decisions (NEW in v2.0)

This section documents decisions made in other stories that affect this story.

**Purpose:**
- Track decision origin
- Ensure consistency across stories
- Enable impact analysis

**Required columns:**
- Decision: What was decided
- Source: Where/when it was decided
- Impact: How it affects this story

### User Story

Standard user story format:
- **Como** (As a) - The persona/role
- **Quero** (I want) - The desired capability
- **Para** (So that) - The value/benefit

### Tasks

- Organized by phases with time estimates
- Numbered hierarchically (1.1, 1.2, 2.1, etc.)
- Checkbox format for progress tracking
- Sub-tasks indented with bullet points

### Acceptance Criteria

Gherkin format preferred:
```gherkin
GIVEN [precondition]
WHEN [action]
THEN [expected result]
AND [additional result]
```

### CodeRabbit Integration (NEW in v2.0)

| Sub-section | Purpose |
|-------------|---------|
| Story Type Analysis | Helps CodeRabbit focus review |
| Agent Assignment | Assigns responsibility |
| Self-Healing Config | YAML for auto-configuration |
| Focus Areas | Key review points |

### Dev Agent Record (NEW in v2.0)

Tracks execution by @dev agent:
- Execution Log: Timestamped actions
- Implementation Notes: Technical details
- Issues Encountered: Problems and solutions

### QA Results (NEW in v2.0)

Tracks validation by @qa agent:
- Test Execution Summary: Test metrics
- Validation Checklist: Manual checks
- QA Sign-off: Final approval

---

## Story Types

### 🔧 Infrastructure

**Characteristics:**
- CI/CD changes
- Configuration updates
- Tool setup
- Migration scripts

**Review Focus:**
- Security implications
- Backwards compatibility
- Rollback procedures

**Example Tasks:**
- Update GitHub Actions
- Configure CodeRabbit
- Setup Husky hooks

### 💻 Feature

**Characteristics:**
- New functionality
- User-facing changes
- Business logic

**Review Focus:**
- Requirements alignment
- UX impact
- Test coverage

**Example Tasks:**
- Implement API endpoint
- Create UI component
- Add validation logic

### 📖 Documentation

**Characteristics:**
- Standards updates
- Architecture docs
- Guides and tutorials

**Review Focus:**
- Accuracy
- Completeness
- Terminology consistency

**Example Tasks:**
- Update README
- Create architecture diagram
- Write API documentation

### ✅ Validation

**Characteristics:**
- Testing improvements
- Quality gates
- Audit activities

**Review Focus:**
- Test coverage
- Edge cases
- Automation

**Example Tasks:**
- Add integration tests
- Create validation checklist
- Implement E2E tests

### 🐛 Bug Fix

**Characteristics:**
- Defect correction
- Regression fixes
- Performance issues

**Review Focus:**
- Root cause
- Side effects
- Regression tests

**Example Tasks:**
- Fix authentication bug
- Resolve memory leak
- Correct calculation error

---

## Validation Checklist

### Story Draft Validation

Use this checklist when creating or reviewing stories:

#### Required Sections
- [ ] Header with all required fields
- [ ] Cross-Story Decisions (even if empty table)
- [ ] User Story in proper format
- [ ] At least one Acceptance Criteria
- [ ] Tasks organized by phases
- [ ] CodeRabbit Integration section
- [ ] Definition of Done
- [ ] Dev Agent Record (empty template)
- [ ] QA Results (empty template)
- [ ] Change Log

#### Quality Checks
- [ ] Story type matches content
- [ ] Priority justified
- [ ] Points appropriate for scope
- [ ] Dependencies documented
- [ ] Risks identified
- [ ] Testing strategy clear

#### Terminology
- [ ] Uses "Squad" not "Expansion Pack"
- [ ] Uses "@aios/" npm scope
- [ ] References v4.0.4 architecture

---

## Examples

### Example: Infrastructure Story

```markdown
# Story 6.1: GitHub Actions Optimization

**Epic:** Technical Debt
**Story ID:** 6.1
**Sprint:** 6
**Priority:** 🟡 Medium
**Points:** 5
**Status:** ⚪ Ready
**Type:** 🔧 Infrastructure

---

## 🔀 Cross-Story Decisions

| Decision | Source | Impact |
|----------|--------|--------|
| Use Ubuntu runners only | Sprint 5 Review | Simplifies matrix |

---

## 📋 User Story

**Como** desenvolvedor,
**Quero** CI mais rápido e barato,
**Para** ter feedback mais rápido e reduzir custos.
```

### Example: Documentation Story

```markdown
# Story 6.5: Standards Documentation Update

**Epic:** Technical Debt & Documentation
**Story ID:** 6.5
**Sprint:** 6
**Priority:** 🔴 Critical
**Points:** 13
**Status:** 🔄 In Progress
**Type:** 📖 Documentation

---

## 🔀 Cross-Story Decisions

| Decision | Source | Impact |
|----------|--------|--------|
| Multi-repo structure | OSR-2/OSR-11 | Standards must document 3-repo architecture |
| Squad terminology | OSR-4 | Replace all "Expansion Pack" references |
```

---

## Related Documents

- [AIOS-LIVRO-DE-OURO-V2.1-COMPLETE.md](./AIOS-LIVRO-DE-OURO-V2.1-COMPLETE.md)
- [QUALITY-GATES-SPECIFICATION.md](./QUALITY-GATES-SPECIFICATION.md)
- [STANDARDS-INDEX.md](./STANDARDS-INDEX.md)

---

**Last Updated:** 2025-12-09
**Version:** 2.0.0
**Maintainer:** @po (Pax)
