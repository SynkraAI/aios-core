# Task: Contribution Model Design

**Task ID:** contribution-model
**Version:** 1.0
**Purpose:** Define how teams contribute to the design system including proposal, review, and integration processes
**Agent:** @nathan-curtis
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Establishes the complete contribution workflow for a design system: how teams propose new components, submit changes, undergo review, and see their contributions integrated. Balances quality gates with contributor experience to keep the system growing without bottlenecks. A well-designed contribution model turns consumers into active participants.

```
INPUT (governance model, team structure, current friction points)
    |
[PHASE 1: MODEL SELECTION]
    -> Choose contribution model type and customize for organization
    |
[PHASE 2: WORKFLOW DESIGN]
    -> Design proposal, review, and integration pipelines
    |
[PHASE 3: ENABLEMENT]
    -> Create templates, guides, and automation for contributors
    |
OUTPUT: Contribution model documentation with templates, workflows, and automation specs
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| governance_model | enum(centralized, federated, hybrid) | Yes | Current or planned governance model for the design system |
| contributor_count | number | Yes | Estimated number of people who will contribute to the system |
| current_process | string | Yes | Description of how contributions happen today (or "none") |
| quality_threshold | enum(low, medium, high, strict) | No | How rigorous review should be; defaults to medium |
| tooling_stack | string[] | No | Tools used for design and development (Figma, GitHub, Storybook, etc.) |

---

## Preconditions

- A governance model exists or is being designed concurrently (governance-model task)
- At least 3 teams or individuals are expected to contribute (otherwise centralized management suffices)
- Version control and code review infrastructure exists (GitHub, GitLab, or equivalent)
- Design tool collaboration features are available (Figma branches, Abstract, etc.)

---

## Steps

### Phase 1: Contribution Model Selection
1. Evaluate three model types against organizational needs:
   - **Centralized**: Core team owns all changes; contributors submit requests that the core team implements
   - **Federated**: Product teams own specific components; changes go through local review then system review
   - **Open-source style**: Anyone can submit fully formed contributions; core team reviews and merges
2. Score each model on five dimensions: quality control, speed to integrate, contributor satisfaction, scalability, maintenance burden
3. Select the best-fit model or design a hybrid (e.g., centralized for tokens, federated for components)
4. Define contributor roles: proposer, implementer, reviewer, approver, and their permissions at each stage
5. Establish the minimum viable contribution: smallest useful change a contributor can make (bug fix, doc improvement, variant addition)

### Phase 2: Workflow Design
1. Design the **proposal workflow**:
   - Contributor submits a proposal using the standard template (problem statement, proposed solution, affected components)
   - Core team triages within SLA (48h for bugs, 1 week for features)
   - Proposal is accepted, rejected with reason, or returned for revision
2. Design the **implementation workflow**:
   - Contributor creates a branch or Figma branch for the change
   - Implementation follows the component specification template
   - Self-review checklist is completed before requesting review
3. Design the **review workflow**:
   - Design review: visual consistency, token usage, naming convention compliance
   - Technical review: code quality, test coverage, API consistency, bundle size impact
   - Accessibility review: WCAG compliance, keyboard navigation, screen reader support
   - Documentation review: usage guidelines, examples, changelog entry
4. Design the **integration workflow**:
   - Approved changes are merged by the core team or a designated integrator
   - Changelog is updated automatically or via template
   - Release notes are drafted and queued for next release
5. Define rejection and appeal process: how contributors contest rejected proposals, who arbitrates

### Phase 3: Enablement and Tooling
1. Create the **proposal template**: structured form capturing problem, solution, impact, and mockups
2. Create the **implementation checklist**: step-by-step guide for contributors covering design, code, tests, docs
3. Create the **review checklist**: criteria reviewers check for design, technical, accessibility, and documentation quality
4. Design automation opportunities: PR templates, linting rules, automated accessibility checks, visual regression tests
5. Write the **contributor guide**: end-to-end walkthrough from idea to merged contribution with screenshots
6. Plan contributor onboarding: how new contributors learn the process (video, workshop, pair session)
7. Define metrics to track contribution health: proposals per month, time-to-merge, rejection rate, contributor satisfaction

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| contribution-guide | markdown | Complete end-to-end guide for contributors |
| proposal-template | markdown | Structured template for proposing new components or changes |
| review-checklist | markdown checklist | Criteria for design, technical, accessibility, and documentation review |
| workflow-diagram | markdown | Visual representation of the full contribution pipeline |
| automation-spec | markdown | Specifications for automated checks and CI integration |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Model selection rationale | blocking | The chosen model must be justified against organizational needs |
| Workflow completeness | blocking | Proposal, implementation, review, and integration stages must all be defined |
| Template existence | blocking | Proposal template and review checklist must be created and usable |
| SLA definition | warning | Response time commitments must be specified for each workflow stage |
| Rejection path | warning | Process for rejected proposals must include clear reasoning and appeal option |
| Automation plan | warning | At least 3 automated checks must be specified for the review stage |

---

## Handoff

- **On completion:** Hand to @nathan-curtis (governance-model) for governance integration
- **On component standards:** Hand to @brad-frost for component quality criteria alignment
- **On accessibility review criteria:** Hand to @stephanie-walter for accessibility review checklist
- **On issues:** Escalate to @design-chief

---

## Glossary

> Full glossary: [design-glossary.md](../data/design-glossary.md)

**Key terms for this task:**

- **Governance model** — Rules for who can add/modify design system components and tokens
- **Versioning strategy** — How changes are versioned, communicated, and rolled out
- **Breaking change** — A modification that requires consumers to update their code
- **Contribution guide** — Process for proposing, reviewing, and approving new components or tokens

---

## Don't Do

- Do not skip the review process when adding components to the design system
- Do not introduce breaking changes without a documented migration path
- Do not assume governance rules are understood — document them explicitly with examples
- Do not modify shared components without notifying consuming teams

