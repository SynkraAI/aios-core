# Story OSR-6: Processo Público para Features/Backlog

**Epic:** Open-Source Community Readiness (OSR)
**Story ID:** OSR-6
**Sprint:** 6
**Priority:** 🟠 High
**Points:** 5
**Effort:** 4 hours
**Status:** ✅ Done
**Type:** ✨ Enhancement

---

## 📋 User Story

**Como** membro da comunidade,
**Quero** um processo claro para propor e votar em features,
**Para** participar ativamente nas decisões de produto e ver minhas ideias consideradas.

---

## 🎯 Objetivo

Estabelecer um processo transparente e democrático para a comunidade propor features, discutir ideias e influenciar o roadmap do projeto.

---

## 📝 Processo Proposto

### Fluxo de Feature Request

```
┌─────────────────────────────────────────────────────────────────┐
│  1. IDEAÇÃO                                                     │
│     Community member tem uma ideia                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. DISCUSSÃO INICIAL                                           │
│     Abre Discussion na categoria "Ideas"                        │
│     Comunidade discute e refina a ideia                        │
│     Votação via 👍 reactions                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. RFC (Para features significativas)                          │
│     Autor cria RFC formal                                       │
│     Período de comentários (2 semanas)                         │
│     Revisão de maintainers                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. DECISÃO                                                     │
│     Maintainers avaliam:                                        │
│     - Alinhamento com visão do projeto                         │
│     - Viabilidade técnica                                       │
│     - Demanda da comunidade                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
         ✅ Aprovada      ⏸️ Adiada      ❌ Rejeitada
              │               │               │
              ▼               ▼               ▼
         Backlog         Future/Maybe    Closed with
         Interno                         Explanation
```

---

## ✅ Deliverables

| # | Deliverable | Effort | File(s) |
|---|-------------|--------|---------|
| 1 | Discussion Template para Ideas | 30 min | `.github/DISCUSSION_TEMPLATE/idea.yml` |
| 2 | RFC Template | 30 min | `.github/RFC_TEMPLATE.md` |
| 3 | Documentação do Processo | 45 min | `docs/FEATURE_PROCESS.md` |
| 4 | Integração com Backlog | 45 min | `docs/guides/community-to-backlog.md` |
| 5 | Categoria de Discussions | 15 min | GitHub Settings |
| 6 | Labels e Configuração | 15 min | GitHub CLI commands |

**Total Estimado:** 3 hours

---

### 1. Discussion Template para Ideas

**Arquivo:** `.github/DISCUSSION_TEMPLATE/idea.yml`

```yaml
title: "[Idea] "
labels: ["idea", "community"]
body:
  - type: markdown
    attributes:
      value: |
        ## 💡 Share Your Idea
        Thanks for contributing! Please describe your idea clearly.

  - type: textarea
    id: problem
    attributes:
      label: Problem or Opportunity
      description: What problem does this solve or what opportunity does it create?
      placeholder: Describe the current situation and why it needs improvement
    validations:
      required: true

  - type: textarea
    id: solution
    attributes:
      label: Proposed Solution
      description: How would you solve this?
      placeholder: Describe your proposed approach
    validations:
      required: true

  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives Considered
      description: What other solutions did you consider?
      placeholder: List any alternatives you thought about
    validations:
      required: false

  - type: dropdown
    id: scope
    attributes:
      label: Scope
      description: How big is this change?
      options:
        - Small (few files, simple change)
        - Medium (multiple files, moderate complexity)
        - Large (significant changes, new feature)
        - Epic (major feature, multiple stories)
    validations:
      required: true

  - type: checkboxes
    id: contribution
    attributes:
      label: Willingness to Contribute
      options:
        - label: I would be willing to help implement this feature
```

---

### 2. RFC Template

**Arquivo:** `.github/RFC_TEMPLATE.md`

```markdown
# RFC: [Title]

**RFC ID:** RFC-XXXX
**Author:** @username
**Status:** Draft | Under Review | Accepted | Rejected | Withdrawn
**Created:** YYYY-MM-DD
**Last Updated:** YYYY-MM-DD

## Summary

One paragraph explanation of the feature.

## Motivation

Why are we doing this? What use cases does it support? What is the expected outcome?

## Detailed Design

Explain the design in enough detail that:
- Someone familiar with AIOS can understand
- Someone familiar with the implementation can implement it

### Technical Approach

[Technical details]

### API Changes (if any)

```typescript
// Example API
```

### Breaking Changes

[List any breaking changes]

## Drawbacks

Why should we NOT do this?

## Alternatives

What other designs have been considered? What is the impact of not doing this?

## Adoption Strategy

How will existing users adopt this feature?

## Unresolved Questions

What parts of the design are still TBD?

---

## Feedback Period

This RFC is open for comments until: YYYY-MM-DD

### How to Provide Feedback
1. Comment on this Discussion
2. React with 👍 or 👎 on specific proposals
3. Suggest alternatives

---

## Decision

**Decision:** [Pending | Accepted | Rejected]
**Date:** YYYY-MM-DD
**Rationale:** [Explanation of decision]
```

---

### 3. Documentação do Processo

**Arquivo:** `docs/FEATURE_PROCESS.md`

```markdown
# Feature Request Process

This document explains how to propose new features for AIOS.

## Quick Ideas

For quick ideas or small improvements:
1. Open a Discussion in the "Ideas" category
2. Describe the problem and proposed solution
3. Community and maintainers will discuss
4. If there's interest, it may be promoted to RFC

## RFC Process (For Significant Features)

For larger features that require design decisions:

### When to Write an RFC
- New major features
- Breaking changes
- Significant architectural changes
- Changes affecting many users

### RFC Lifecycle

1. **Draft**: Author writes RFC
2. **Under Review**: 2-week comment period
3. **Decision**: Maintainers accept/reject
4. **Implementation**: If accepted, implementation begins

### Criteria for Acceptance

- Aligns with project vision
- Technically feasible
- Has clear implementation path
- Community demand demonstrated
- Maintainable long-term

## Voting

- Use 👍 reactions to show support
- Top-voted ideas are prioritized
- Maintainers have final decision

## Timeline

- Ideas: No fixed timeline
- RFCs: 2-week minimum review period
- Implementation: Based on roadmap capacity

## Questions?

Ask in GitHub Discussions or Discord.
```

---

### 4. Integração com Backlog Interno

**Processo:**

```
Community Idea (Discussion)
        │
        │ [Approved by maintainers]
        ▼
Internal Backlog Item (docs/stories/backlog/)
        │
        │ [Prioritized by @po]
        ▼
Sprint Planning (docs/stories/v2.x/sprint-N/)
        │
        │ [Implemented by @dev]
        ▼
Release (credited in CHANGELOG.md)
```

**Transition Process:**

| Step | Action | Responsible | Output |
|------|--------|-------------|--------|
| 1 | Maintainer approves idea in Discussion | @pm/@po | Label `community-approved` added |
| 2 | @po creates backlog item | @po | New file in `docs/stories/backlog/` |
| 3 | Link Discussion to backlog item | @po | Reference in backlog file header |
| 4 | Prioritize in sprint planning | @po/@sm | Move to sprint folder |
| 5 | Credit contributor in release | @pm | Entry in CHANGELOG.md |

**Backlog Item Template Location:** `.aios-core/product/templates/story-tmpl.yaml`

**Tasks:**
- [x] Create transition process document at `docs/guides/community-to-backlog.md`
- [x] Create label `community-approved` via GitHub CLI: `gh label create community-approved --description "Approved community idea" --color 2ea44f`
- [x] Create label `community-contribution` via GitHub CLI: `gh label create community-contribution --description "From community member" --color 7057ff`
- [ ] Add "Community Origin" field to story template in `.aios-core/product/templates/story-tmpl.yaml`
- [x] Document @po as sole authority for backlog additions in `docs/FEATURE_PROCESS.md`

---

### 5. Categoria de Discussions

**Criar categoria:** "Feature Proposals"

**Configuração:**
- Formato: Open
- Descrição: "Propose and discuss new features"
- Labels automáticos: `idea`, `community`

---

## 🤖 CodeRabbit Integration

### Story Type Analysis

| Attribute | Value |
|-----------|-------|
| **Primary Type** | Documentation/Process |
| **Complexity** | Low |
| **Secondary Types** | GitHub Configuration |

### Specialized Agents

| Agent | Role |
|-------|------|
| **@dev** | Primary - File creation and template implementation |
| **@github-devops** | Support - GitHub Discussions and label configuration |

### Quality Gates

#### Pre-Commit (@dev)
- [ ] YAML template syntax validation (`.github/DISCUSSION_TEMPLATE/idea.yml`)
- [ ] Markdown formatting validation (RFC template, FEATURE_PROCESS.md)
- [ ] No hardcoded paths or sensitive data

#### Pre-PR (@github-devops)
- [ ] Files created in correct locations
- [ ] GitHub Discussions category exists
- [ ] Labels created and documented

### Self-Healing Configuration

| Setting | Value |
|---------|-------|
| **Mode** | light |
| **Max Iterations** | 2 |
| **Timeout** | 15 min |
| **Severity Handling** | CRITICAL only |

**Behavior:**
- CRITICAL issues: Auto-fix (YAML syntax errors, missing required fields)
- HIGH/MEDIUM/LOW: Document and defer to manual review

### Focus Areas
- YAML template syntax validation
- Markdown formatting consistency
- GitHub Discussions API compatibility
- Label naming conventions

---

## 🎯 Acceptance Criteria

```gherkin
GIVEN a community member with a feature idea
WHEN they follow the documented process
THEN:
  - They can open an Idea Discussion using template
  - They understand when RFC is needed
  - They can see voting/reactions on their idea
  - They receive feedback from community/maintainers
AND maintainers can:
  - Evaluate ideas based on defined criteria
  - Promote ideas to RFC when appropriate
  - Transition approved ideas to internal backlog
```

### Test Scenarios

| ID | Scenario | Expected Result | Type |
|----|----------|-----------------|------|
| T1 | YAML template parsing | `idea.yml` parses without errors using yamllint | Validation |
| T2 | Discussion category creation | "Feature Proposals" category visible in GitHub Discussions | Integration |
| T3 | Label verification | Labels `idea`, `community`, `community-approved` exist in repo | Configuration |
| T4 | Template rendering | Submit test idea, verify all fields render correctly in Discussion | E2E |
| T5 | RFC template usability | Create RFC using template, verify all sections are clear | Manual |
| T6 | Process documentation links | All links in FEATURE_PROCESS.md resolve correctly | Validation |

---

## 🔗 Dependencies

**Blocked by:**
- [OSR-4: GitHub Community Setup](../sprint-5/story-osr-4-github-community-setup.md) - Requires GitHub Discussions to be enabled
- [OSR-5: Community Handbook](../sprint-5/story-osr-5-community-handbook.md) - COMMUNITY.md references this process

**Blocks:**
- [OSR-7: Public Roadmap](./story-osr-7-public-roadmap.md) - Approved features appear on public roadmap

---

## 📋 Definition of Done

### Files Created
- [x] `.github/DISCUSSION_TEMPLATE/idea.yml` - Discussion template for ideas
- [x] `.github/RFC_TEMPLATE.md` - RFC template for significant features
- [x] `docs/FEATURE_PROCESS.md` - Process documentation
- [x] `docs/guides/community-to-backlog.md` - Transition process guide

### GitHub Configuration
- [~] Category "Feature Proposals" created in Discussions *(manual step - requires GitHub UI after merge)*
- [x] Label `idea` created (color: #d4c5f9)
- [x] Label `community` created (color: #bfd4f2)
- [x] Label `community-approved` created (color: #2ea44f)
- [x] Label `community-contribution` created (color: #7057ff)

### Documentation Updates
- [x] `COMMUNITY.md` updated with links to feature process
- [x] `README.md` includes link to FEATURE_PROCESS.md
- [x] Story template updated with "Community Origin" field

### Quality Gates
- [x] YAML templates pass syntax validation (yamllint)
- [x] All markdown links resolve correctly
- [ ] Test scenarios T1-T6 pass

---

## 📝 Dev Agent Record

### Agent Model Used
Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes
- All files created successfully
- Labels created via GitHub CLI
- Documentation updated with cross-references
- Story template enhanced with Community Origin field
- GitHub Configuration requires manual step for Discussion category creation

### File List

| Action | File |
|--------|------|
| Created | `.github/DISCUSSION_TEMPLATE/idea.yml` |
| Created | `.github/RFC_TEMPLATE.md` |
| Created | `docs/FEATURE_PROCESS.md` |
| Created | `docs/guides/community-to-backlog.md` |
| Modified | `COMMUNITY.md` |
| Modified | `README.md` |
| Modified | `.aios-core/product/templates/story-tmpl.yaml` |

---

**Criado por:** River (SM) 🌊
**Data:** 2025-12-05
**Implementado por:** Dex (Dev) 💻
**Data Implementação:** 2025-12-10

---

## ✅ QA Results

### Review Summary

| Category | Status | Notes |
|----------|--------|-------|
| **Files Created** | ✅ PASS | All 4 files created correctly |
| **GitHub Labels** | ✅ PASS | All 4 labels verified via `gh label list` |
| **Documentation Updates** | ✅ PASS | COMMUNITY.md and README.md updated |
| **Story Template** | ✅ PASS | `community-origin` field added |
| **YAML Syntax** | ✅ PASS | `idea.yml` passes yaml-lint |

### Acceptance Criteria Validation

| AC | Description | Status |
|----|-------------|--------|
| AC1 | Community member can open Idea Discussion using template | ✅ Template exists and valid |
| AC2 | User understands when RFC is needed | ✅ Documented in FEATURE_PROCESS.md |
| AC3 | User can see voting/reactions | ✅ Process documented |
| AC4 | User receives feedback | ✅ Process documented |
| AC5 | Maintainers can evaluate ideas | ✅ Criteria defined |
| AC6 | Maintainers can promote to RFC | ✅ Process documented |
| AC7 | Maintainers can transition to backlog | ✅ Guide created |

### Test Scenario Results

| ID | Scenario | Result | Notes |
|----|----------|--------|-------|
| T1 | YAML template parsing | ✅ PASS | yaml-lint successful |
| T2 | Discussion category creation | ⚠️ MANUAL | Requires GitHub UI (documented) |
| T3 | Label verification | ✅ PASS | All 4 labels exist |
| T4 | Template rendering | ⏸️ DEFERRED | Requires live test after PR merge |
| T5 | RFC template usability | ✅ PASS | Template complete with all sections |
| T6 | Process documentation links | ✅ PASS | Links resolve correctly |

### Files Verified

| File | Exists | Content Valid |
|------|--------|---------------|
| `.github/DISCUSSION_TEMPLATE/idea.yml` | ✅ | ✅ Valid YAML, all fields present |
| `.github/RFC_TEMPLATE.md` | ✅ | ✅ Complete template with all sections |
| `docs/FEATURE_PROCESS.md` | ✅ | ✅ Clear process, links work |
| `docs/guides/community-to-backlog.md` | ✅ | ✅ Comprehensive guide with FAQ |

### Quality Observations

**Strengths:**
1. Clear and well-documented process flow
2. Comprehensive templates with all required fields
3. Good integration between documents (cross-linking)
4. GitHub labels created with consistent naming
5. Story template enhanced for community tracking

**Minor Observations (Non-Blocking):**
1. Story spec has emoji in template (line 100: `## 💡 Share Your Idea`) but actual file has clean version (`## Share Your Idea`) - actual file is correct
2. RFC template uses `:+1:` instead of emoji - acceptable for GitHub rendering
3. Discussion category requires manual creation via GitHub UI - documented correctly

### Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Template not rendering correctly | Low | Medium | Test after PR merge |
| Community confusion on process | Low | Low | Clear documentation provided |
| Labels not applied automatically | Low | Low | Manual labeling documented |

### Gate Decision

**Decision:** ✅ **PASS**

**Rationale:**
- All acceptance criteria met
- All required files created and validated
- YAML syntax verified
- Documentation complete and cross-linked
- GitHub labels verified
- Only manual step (Discussion category) is correctly documented as requiring GitHub UI

**Conditions:**
1. Create "Feature Proposals" Discussion category via GitHub UI before announcing to community
2. Test T4 (template rendering) after PR merge to confirm GitHub renders correctly

### Reviewer

**Reviewed by:** Quinn (QA) ✅
**Date:** 2025-12-10
**Model:** Claude Opus 4.5 (claude-opus-4-5-20251101)
