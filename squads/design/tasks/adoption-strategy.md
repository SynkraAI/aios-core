# Task: Design System Adoption Strategy

**Task ID:** adoption-strategy
**Version:** 1.0
**Purpose:** Design a comprehensive adoption strategy for driving design system usage across teams
**Agent:** @dan-mall
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Designs a multi-faceted adoption strategy that treats design system adoption as a change management initiative rather than a mandate. Covers incentive structures, migration paths for existing products, training programs, support channels, success measurement, and a champion program. A design system only delivers value when teams actively use it, and this task creates the conditions for organic, sustained adoption.

```
INPUT (adoption goals, team landscape, current adoption level)
    |
[PHASE 1: DIAGNOSIS]
    -> Assess current adoption barriers, team readiness, and motivation landscape
    |
[PHASE 2: STRATEGY DESIGN]
    -> Create incentives, migration paths, training, and support model
    |
[PHASE 3: MEASUREMENT]
    -> Define success metrics, feedback loops, and iteration plan
    |
OUTPUT: Adoption strategy with incentive model, training program, and measurement framework
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| adoption_goals | string | Yes | Target adoption level and timeline (e.g., "80% of teams within 6 months") |
| team_landscape | string | Yes | Number of teams, their sizes, tech stacks, and current adoption status |
| current_level | enum(none, early, partial, majority) | Yes | Current adoption level across the organization |
| known_barriers | list | No | Known reasons teams resist or avoid adopting the design system |
| champion_candidates | list | No | People already enthusiastic about the design system who could be champions |
| migration_complexity | enum(low, medium, high) | No | Complexity of migrating existing products to the design system |

---

## Preconditions

- A design system exists with enough components to provide real value to adopting teams
- There is organizational support (at least one sponsor) for driving adoption
- Teams have the autonomy to choose or are willing to consider adopting shared tools
- The design system team has capacity to provide support during adoption ramp-up
- Baseline adoption metrics are available or can be collected
- The organization's communication channels (Slack, email, wiki) are accessible for outreach
- At least 3 teams are willing to provide honest feedback on their adoption barriers

---

## Steps

### Phase 1: Adoption Diagnosis
1. Survey current teams to understand their awareness, perception, and usage of the design system
2. Categorize teams into adoption segments: unaware, aware but unconvinced, interested, piloting, fully adopted
3. Identify the top 5 barriers to adoption through interviews and survey analysis (e.g., tech stack incompatibility, learning curve, missing components, cultural resistance)
4. Map the motivation landscape: what would make each team segment want to adopt (speed, consistency, less maintenance, career growth)
5. Assess the design system's "product-market fit": does it actually solve the problems teams face today
6. Document quick wins: teams or use cases where adoption could happen with minimal friction
7. Analyze previous adoption attempts: what was tried, what worked, what failed, and why
8. Benchmark current adoption velocity: how many teams adopted in the last quarter and what drove their decision

### Phase 2: Strategy Design
1. **Incentive model**: Design positive incentives for adoption (recognition, reduced review burden, priority support) rather than mandates or penalties
2. **Migration paths**: Create tiered migration approaches: (a) new projects start on the system, (b) feature-by-feature migration for existing products, (c) full rewrite migration for legacy products
3. **Training program**: Design a multi-format training program: self-paced documentation, recorded workshops, live coding sessions, pair programming with system team, office hours
4. **Support channels**: Establish tiered support: Level 1 (documentation and FAQ), Level 2 (community Slack channel), Level 3 (dedicated system team support), Level 4 (pair programming and embedded support)
5. **Champion program**: Recruit 1-2 champions per team segment; provide them with early access, direct communication channel, and recognition opportunities
6. **Communication cadence**: Design a regular communication rhythm: weekly tips, monthly newsletter, quarterly roadmap review, annual summit
7. **Removal of friction**: Identify and eliminate adoption friction points: simplify installation, improve docs, create starter templates, automate migration tooling

### Phase 3: Measurement and Iteration
1. Define adoption metrics: component usage rate, team adoption percentage, contribution rate, satisfaction score (NPS)
2. Create a measurement dashboard with automated data collection where possible
3. Set phase-gated targets: Month 1-3 (30% awareness, 10% active), Month 4-6 (60% awareness, 30% active), Month 7-12 (90% awareness, 60% active)
4. Design feedback collection mechanisms: quarterly surveys, retrospectives, Slack sentiment analysis, support ticket analysis
5. Establish a health check cadence: monthly deep-dive into adoption blockers with the design system team
6. Create an iteration plan: monthly review of adoption data, quarterly strategy adjustments, annual strategy refresh
7. Document the "adoption flywheel": how each adopted team makes adoption easier for the next team
8. Define exit criteria: what adoption level signals that the active strategy can shift to maintenance mode

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| adoption_strategy | markdown | Comprehensive adoption strategy with all components integrated |
| incentive_model | markdown | Detailed incentive structure with positive reinforcement mechanisms |
| training_program | markdown | Multi-format training program design with curriculum outline |
| champion_playbook | markdown | Guide for champions: responsibilities, resources, recognition model |
| metrics_dashboard | markdown | Adoption measurement framework with targets and data collection plan |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Barrier-driven design | blocking | Every identified barrier must have a corresponding mitigation in the strategy |
| Positive incentives | blocking | Strategy must rely on positive incentives rather than mandates |
| Measurable targets | blocking | At least 5 quantitative adoption targets must be defined with timelines |
| Multi-format training | warning | Training program should include at least 3 different formats |
| Champion program | warning | Champion program should identify at least 3 initial candidates |
| Communication plan | warning | Regular communication cadence should be defined with content themes |

---

## Handoff

- **On completion:** Hand to @nathan-curtis for governance model alignment with adoption strategy
- **On training content creation:** Hand to @brad-frost for component documentation and training materials
- **On tooling and automation:** Hand to @design-chief for resource allocation and tool investment decisions
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

