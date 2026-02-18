# Task: Team Model Design

**Task ID:** team-model
**Version:** 1.0
**Purpose:** Select and design the team model for managing a design system based on organization size and maturity
**Agent:** @nathan-curtis
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Evaluates organization characteristics and selects the optimal team model for design system ownership and management. The four canonical models (solitary, centralized, federated, hybrid) each suit different scales, cultures, and maturity levels. This task produces a concrete staffing plan, role definitions, and an evolution roadmap that grows the team model as the organization matures.

```
INPUT (org size, maturity, budget, culture)
    |
[PHASE 1: ORGANIZATIONAL ASSESSMENT]
    -> Evaluate current state, constraints, and growth trajectory
    |
[PHASE 2: MODEL SELECTION AND DESIGN]
    -> Choose model, define roles, size team, and design rituals
    |
[PHASE 3: EVOLUTION ROADMAP]
    -> Plan model transitions as organization grows
    |
OUTPUT: Team model recommendation with staffing plan, role definitions, and evolution roadmap
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| org_size | enum(startup, growth, established, enterprise) | Yes | Current organization size category |
| product_team_count | number | Yes | Number of product teams that will use the design system |
| annual_budget | enum(none, partial, dedicated) | Yes | Budget level allocated to the design system |
| design_maturity | enum(ad-hoc, emerging, structured, optimized) | No | Current design operations maturity level |
| engineering_culture | enum(centralized, autonomous, mixed) | No | How engineering teams operate relative to each other |

---

## Preconditions

- Leadership has expressed commitment to a design system (even if informal)
- At least a rough headcount budget range is known (even if not finalized)
- The number of consuming product teams is known or can be estimated
- Current design system ownership model (or lack thereof) can be articulated

---

## Steps

### Phase 1: Organizational Assessment
1. Profile the organization on key dimensions:
   - Number of designers, front-end engineers, and product managers
   - Geographic distribution (co-located, multi-office, fully remote)
   - Decision-making speed (fast startup-style vs enterprise governance)
   - Current design system state (nonexistent, grassroots, partial, formal)
2. Map current ownership: who maintains components today, how much of their time is dedicated, what falls through the cracks
3. Identify resource constraints: headcount limits, budget ceiling, competing priorities
4. Assess cross-team collaboration maturity: do teams share code today, do they review each other's work, do they align on standards
5. Document growth projections: expected team count, product count, and user base in 12 and 24 months
6. Catalog failed or stalled past attempts at design system team formation (learn from what did not work)

### Phase 2: Model Selection and Design
1. Evaluate each team model against the organization profile:
   - **Solitary**: One person owns the entire system. Best for startups or small teams (under 3 product teams). Risks: bus factor, burnout, limited velocity
   - **Centralized**: Dedicated team builds and maintains everything. Best for mid-size (4-10 teams). Risks: ivory tower, slow to address product-specific needs
   - **Federated**: Product teams contribute components they build; a core group curates. Best for large orgs (10+ teams). Risks: inconsistency, coordination overhead
   - **Hybrid**: Core team owns foundations (tokens, core components); product teams own domain-specific components. Best for enterprise scale. Risks: boundary disputes, governance complexity
2. Score each model on: quality, speed, scalability, cost, organizational fit (1-5 scale)
3. Select the recommended model with clear rationale tied to assessment findings
4. Define the team composition:
   - Design system designer (visual design, component design)
   - Design system engineer (implementation, tooling, infrastructure)
   - Design technologist (bridge between design and engineering)
   - Documentation specialist (guidelines, examples, onboarding material)
   - Program manager (backlog, roadmap, stakeholder communication)
5. Specify minimum viable team: smallest team that can sustain the chosen model
6. Design team rituals: design critiques (weekly), sprint planning (bi-weekly), roadmap review (monthly), stakeholder showcase (quarterly)
7. Define interaction model with product teams: office hours, embedded rotation, liaison program

### Phase 3: Evolution Roadmap
1. Define the maturity stages the team model will pass through (seed, grow, scale, optimize)
2. Map trigger points for model transitions: "when product team count exceeds 8, transition from centralized to hybrid"
3. Plan headcount growth tied to maturity stages: what roles to add at each stage and in what order
4. Design the transition playbook: how to move from one model to another without disrupting current consumers
5. Identify leading indicators that a model transition is needed: backlog growing faster than team velocity, contribution rejection rate rising, consumer satisfaction declining
6. Plan the budget evolution: how funding model changes from shared cost to dedicated budget line
7. Document the complete recommendation with short-term (3 months), medium-term (12 months), and long-term (24 months) milestones

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| team-model-recommendation | markdown | Analysis, model selection rationale, and complete team design |
| staffing-plan | markdown table | Roles, responsibilities, FTE allocation, and hiring sequence |
| rituals-calendar | markdown | Team ceremonies with frequency, purpose, participants, and duration |
| evolution-roadmap | markdown | Maturity stages, transition triggers, and milestone timeline |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Model justification | blocking | Selection must be tied to specific organizational assessment findings |
| Role definitions | blocking | Every team role must have defined responsibilities and FTE allocation |
| Minimum viable team | blocking | Smallest sustainable team size must be specified for the chosen model |
| Transition triggers | warning | At least 3 quantitative triggers for model evolution must be defined |
| Budget alignment | warning | Staffing plan must be feasible within the stated budget level |
| Ritual design | warning | Team rituals must include frequency, duration, and participants |

---

## Handoff

- **On completion:** Hand to @nathan-curtis (governance-model) for governance structure alignment
- **On ROI justification:** Hand to @brad-frost (roi-calculator) for staffing cost-benefit analysis
- **On contribution workflow:** Hand to @nathan-curtis (contribution-model) for contributor role integration
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

