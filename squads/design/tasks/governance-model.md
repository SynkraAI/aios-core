# Task: Governance Model Design

**Task ID:** governance-model
**Version:** 1.0
**Purpose:** Design the governance structure for a design system including decision-making, roles, contributions, and release cadence
**Agent:** @nathan-curtis
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Defines how a design system is managed, evolved, and maintained through formal governance. Covers decision-making authority, contribution workflows, role definitions, versioning policy, and release cadence. A well-designed governance model prevents design system drift, resolves conflicts efficiently, and scales with organizational growth.

```
INPUT (org structure, team maturity, system scope)
    |
[PHASE 1: ASSESSMENT]
    -> Evaluate current governance state and organizational needs
    |
[PHASE 2: STRUCTURE DESIGN]
    -> Define roles, decision processes, and contribution workflows
    |
[PHASE 3: POLICY AND CADENCE]
    -> Establish versioning, release, and communication policies
    |
OUTPUT: Complete governance model document with roles, policies, and processes
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| org_size | enum(startup, mid-size, enterprise) | Yes | Organization size to scale governance appropriately |
| team_count | number | Yes | Number of product teams consuming the design system |
| current_model | enum(none, informal, partial, formal) | Yes | Current state of governance maturity |
| decision_makers | string[] | No | Key people currently making design system decisions |
| pain_points | string[] | No | Known governance issues (slow decisions, conflicting changes, stale components) |

---

## Preconditions

- The design system has at least 20 components in active use across multiple teams
- Leadership supports establishing formal governance (budget and authority exist)
- At least 2 product teams consume the design system (governance is unnecessary for single-team use)
- A design system team or dedicated maintainer exists or is planned

---

## Steps

### Phase 1: Governance Assessment
1. Map the current decision-making landscape: who approves new components, who resolves conflicts, who prioritizes the backlog
2. Identify governance gaps: decisions that take too long, changes that bypass review, components that diverge across teams
3. Catalog stakeholders by tier: core team (daily contributors), extended team (regular consumers), leadership (strategic direction)
4. Assess organizational culture: top-down vs consensus-driven, speed vs rigor preference, centralized vs distributed authority
5. Document current pain points: bottlenecks, unresolved conflicts, stale components, undocumented decisions
6. Benchmark against governance models in similar-sized organizations

### Phase 2: Governance Structure Design
1. Define governance tiers:
   - **Steering committee**: Sets strategic direction, resolves escalations, approves breaking changes (quarterly)
   - **Core team**: Reviews contributions, manages backlog, approves additions and modifications (weekly)
   - **Contributors**: Propose changes, submit PRs, participate in design reviews (ongoing)
   - **Consumers**: Use components, report issues, request features (ongoing)
2. Define roles within each tier: design system lead, token owner, component reviewer, accessibility reviewer, documentation lead
3. Design the decision-making process:
   - Component addition: proposal -> design review -> technical review -> accessibility review -> approval
   - Breaking change: RFC -> impact analysis -> migration plan -> steering committee approval
   - Bug fix: report -> triage -> fix -> review -> release
4. Establish SLAs for each decision type: bug triage within 48h, component proposals reviewed within 2 weeks, RFCs resolved within 1 month
5. Define the contribution workflow: fork/branch model, PR template, review checklist, merge criteria
6. Create an escalation path: contributor -> core team -> steering committee -> design system lead (final authority)

### Phase 3: Policy and Release Cadence
1. Define the versioning policy: semantic versioning (major.minor.patch), what constitutes each level
2. Establish release cadence: patch releases (weekly), minor releases (bi-weekly or monthly), major releases (quarterly)
3. Create a deprecation policy: minimum warning period, migration support obligations, sunset timeline
4. Define the communication plan: changelog format, release announcement channels, breaking change notifications
5. Establish metrics and health tracking: adoption rate, contribution frequency, issue resolution time, consumer satisfaction
6. Plan governance review cadence: revisit and adjust the governance model every 6 months based on metrics
7. Document the complete governance model in a format accessible to all stakeholders
8. Define the onboarding process for new governance participants: training materials, shadowing period, ramp-up checklist
9. Create a conflict resolution protocol: how disagreements between teams are mediated and resolved with clear timeframes

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| governance-document | markdown | Complete governance model with tiers, roles, processes, and policies |
| role-definitions | markdown table | Responsibilities, authority, and time commitment for each governance role |
| decision-flowchart | markdown | Step-by-step process for each type of decision (add, change, deprecate, break) |
| release-policy | markdown | Versioning rules, release cadence, deprecation timeline, and communication plan |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Tier completeness | blocking | All four governance tiers must be defined with clear membership criteria |
| Decision SLAs | blocking | Every decision type must have an SLA with specific timeframes |
| Escalation path | blocking | A clear escalation chain must exist from contributor to final authority |
| Role definitions | warning | Every role must include responsibilities, authority level, and expected time commitment |
| Versioning alignment | warning | Versioning policy must follow semver conventions and be understood by both design and engineering |
| Communication plan | warning | Release communication channels and frequency must be specified |

---

## Handoff

- **On completion:** Hand to @nathan-curtis (contribution-model) for detailed contribution workflow design
- **On team structure needs:** Hand to @nathan-curtis (team-model) for team model selection
- **On component standards:** Hand to @brad-frost for component quality standards integration
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

