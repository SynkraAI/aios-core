# Task: Design at Scale Planning

**Task ID:** design-at-scale
**Version:** 1.0
**Purpose:** Plan the scaling of a design system across an organization with phased rollout and success metrics
**Agent:** @dan-mall
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Plans and structures the organizational scaling of a design system from a single team to enterprise-wide adoption. This task covers pilot team selection, phased rollout planning, executive buy-in strategies, success metric definition, and documentation maturity. Based on Dan Mall's "Design That Scales" methodology, it treats design system scaling as an organizational change management challenge, not just a technical one.

```
INPUT (current system state, organization map, scaling goals)
    |
[PHASE 1: ASSESSMENT]
    -> Evaluate current maturity, team readiness, and organizational landscape
    |
[PHASE 2: STRATEGY]
    -> Design phased rollout plan with pilots, metrics, and governance
    |
[PHASE 3: ENABLEMENT]
    -> Create training materials, communication plan, and support structure
    |
OUTPUT: Scaling strategy document with rollout plan, metrics framework, and enablement kit
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| current_state | string | Yes | Description of current design system maturity and adoption level |
| org_structure | string | Yes | Organizational structure: number of teams, products, platforms |
| scaling_goal | string | Yes | Target state for adoption (e.g., "all product teams within 12 months") |
| executive_sponsor | string | No | Name and role of executive champion, if one exists |
| known_blockers | list | No | Known organizational or technical blockers to adoption |
| budget_range | string | No | Available budget for scaling efforts |

---

## Preconditions

- A design system exists with at least a core set of components (minimum viable system)
- At least one team is successfully using the design system today and can serve as a reference
- Organizational leadership is aware of the design system initiative
- There is clarity on which products and platforms are in scope for scaling
- The design system team has capacity to support scaling activities
- Budget conversations are possible; even rough order-of-magnitude estimates are available

---

## Steps

### Phase 1: Maturity Assessment
1. Audit the current design system against a maturity model: tokens, components, documentation, governance, tooling
2. Score each maturity dimension on a 1-5 scale and identify the weakest areas that could block scaling
3. Map all potential consuming teams: product lines, platforms, geographies, team sizes, tech stacks
4. Assess each team's readiness for adoption: current tech stack compatibility, design tooling, skill level, team stability
5. Identify early adopter candidates based on readiness score, team enthusiasm, and strategic importance
6. Document organizational friction points: competing systems, NIH syndrome, legacy constraints, political dynamics
7. Interview 3-5 key stakeholders to understand perceived value, concerns, and definition of success for the design system
8. Benchmark against industry peers: what scale have similar organizations achieved and in what timeframe

### Phase 2: Strategy and Rollout Planning
1. Select 2-3 pilot teams based on readiness assessment; balance between high-visibility and low-risk teams
2. Define success metrics for each phase: adoption rate, component usage, developer satisfaction, design consistency score, time-to-ship reduction
3. Create a phased rollout timeline: Phase 1 (pilot, 1-3 months), Phase 2 (early majority, 3-6 months), Phase 3 (full adoption, 6-12 months)
4. Design the governance model: contribution process, review cadence, decision-making authority, versioning strategy
5. Build the executive pitch: ROI projections, risk mitigation, competitive advantage, talent retention impact
6. Define escalation paths for teams that encounter blockers during adoption
7. Establish a feedback loop mechanism: regular surveys, office hours, Slack channels, retrospectives

### Phase 3: Enablement and Communication
1. Create onboarding documentation for each persona: designer, developer, product manager, QA engineer
2. Design a training program: self-paced tutorials, live workshops, pair programming sessions, office hours
3. Build a communication plan: launch announcements, monthly newsletters, success stories, roadmap updates
4. Establish a champion program: identify and empower advocates in each adopting team with recognition and early access
5. Create a migration guide for teams transitioning from legacy systems or custom components
6. Set up a support model: tiered support (self-service docs, community Slack, dedicated support, escalation)
7. Define the "celebration cadence": how the organization will recognize scaling milestones and adopting teams
8. Create an internal marketing strategy: showcase early wins to build momentum for the next adoption wave

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| scaling_strategy | markdown | Comprehensive strategy document with phased approach and timelines |
| metrics_framework | markdown table | Success metrics per phase with targets and measurement methods |
| executive_pitch | markdown | Business case document for executive stakeholder buy-in |
| enablement_kit | markdown | Training program outline, communication plan, and champion program design |
| rollout_timeline | markdown | Visual timeline with milestones, dependencies, and risk markers |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Pilot selection rationale | blocking | Pilot teams must be selected with documented criteria and reasoning |
| Metrics defined | blocking | At least 5 measurable success metrics must be defined with targets |
| Phased approach | blocking | Rollout must be structured in at least 3 phases with clear gates between them |
| Stakeholder mapping | warning | All key stakeholders should be identified and their concerns addressed |
| Risk mitigation | warning | Top 5 risks should be identified with mitigation strategies |
| Budget alignment | warning | Strategy should be feasible within the stated budget constraints |

---

## Handoff

- **On completion:** Hand to @nathan-curtis for governance model refinement and contribution workflow design
- **On documentation needs:** Hand to @brad-frost for component documentation standards
- **On executive presentation:** Hand to @design-chief for review and approval
- **On issues:** Escalate to @design-chief

---

## Glossary

> Full glossary: [design-glossary.md](../data/design-glossary.md)

**Key terms for this task:**

- **Design tokens** — Platform-agnostic key-value pairs encoding design decisions
- **Design system** — Tokens, components, patterns, guidelines, and tooling for UI consistency
- **Component API** — Props interface defining how a component is consumed

---

## Don't Do

- Do not skip reading the full task specification before executing
- Do not create from scratch when similar patterns exist in the design system
- Do not hardcode values that should be design tokens
- Do not skip validation steps defined in the task workflow

