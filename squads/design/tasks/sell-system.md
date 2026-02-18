# Task: Sell the Design System

**Task ID:** sell-system
**Version:** 1.0
**Purpose:** Create a compelling business case and executive pitch for investing in a design system
**Agent:** @dan-mall
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Builds a comprehensive business case for a design system by calculating ROI, mapping stakeholders, crafting an executive pitch, proposing a pilot project, and defining a success metrics dashboard. Many design systems fail not because of technical shortcomings but because they lack organizational buy-in. This task addresses that gap by translating design system value into business language that resonates with decision-makers.

```
INPUT (organization context, current pain points, target audience)
    |
[PHASE 1: RESEARCH]
    -> Quantify current costs, map stakeholders, identify pain points
    |
[PHASE 2: BUSINESS CASE]
    -> Calculate ROI, build narrative, design pilot proposal
    |
[PHASE 3: PITCH PACKAGE]
    -> Create executive presentation, metrics dashboard, pilot plan
    |
OUTPUT: Complete pitch package with ROI model, stakeholder map, and pilot proposal
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| org_context | string | Yes | Organization size, industry, number of products and teams |
| pain_points | list | Yes | Current design and development pain points the system would address |
| target_audience | string | Yes | Who the pitch is for (CTO, VP Product, VP Engineering, CEO) |
| current_costs | object | No | Known costs: designer/developer hours on redundant work, inconsistency fixes |
| competitor_info | string | No | Competitors known to have design systems for competitive framing |
| existing_efforts | string | No | Any prior design system attempts and their outcomes |

---

## Preconditions

- Clear understanding of who the decision-maker is and what motivates them (cost reduction, speed, quality, brand)
- Access to at least rough data on team sizes, shipping cadence, and common bottlenecks
- Knowledge of current design and development workflow pain points from multiple team perspectives
- Willingness from at least one team to participate in a pilot if approved
- Understanding of the organization's budget cycle, fiscal calendar, and decision-making process
- No active organizational initiative that would compete for the same budget or attention

---

## Steps

### Phase 1: Research and Discovery
1. Catalog current pain points with concrete examples: inconsistent UIs, duplicated components, slow onboarding, accessibility debt
2. Quantify the cost of the status quo: hours spent rebuilding components, QA cycles for visual inconsistency, designer-developer miscommunication
3. Map all stakeholders: decision-makers (approve budget), influencers (shape opinion), blockers (resist change), champions (advocate)
4. Research industry benchmarks: design system ROI data from Forrester, Gartner, and published case studies
5. Analyze competitor design systems: what public systems exist in the industry, how they communicate value
6. Interview 3-5 internal stakeholders to understand their priorities, concerns, and definition of success

### Phase 2: Business Case Construction
1. Calculate projected ROI using a conservative model: (time saved per component * number of components * team count) - investment cost
2. Build a cost-of-inaction narrative: what happens if the organization does not invest in a design system over the next 12-24 months
3. Frame the design system as infrastructure, not a project: ongoing investment with compounding returns, similar to CI/CD or cloud migration
4. Design a pilot project proposal: scope (3-5 core components), timeline (6-8 weeks), team (2-3 people), success criteria
5. Create before/after scenarios showing the same feature built with and without a design system
6. Address common objections proactively: "we already tried this," "too expensive," "slows teams down," "not invented here"
7. Define a success metrics dashboard: adoption rate, component reuse ratio, time-to-ship, designer satisfaction, developer satisfaction, accessibility compliance

### Phase 3: Pitch Package Assembly
1. Create the executive summary: one-page document with problem, solution, ROI, and ask
2. Build the detailed business case document with all supporting data and analysis
3. Design the stakeholder-specific talking points: tailor message for CTO (technical debt), VP Product (speed), CEO (brand consistency)
4. Prepare the pilot proposal with clear scope, timeline, budget, team, and success criteria
5. Create the success metrics dashboard template that will be used to report pilot results
6. Design the presentation format: slide deck, document, or interactive demo based on audience preference
7. Prepare a FAQ document addressing the top 10 questions decision-makers are likely to ask
8. Draft the follow-up plan: what happens after the pitch regardless of immediate decision

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| business_case | markdown | Comprehensive business case with ROI model and cost analysis |
| stakeholder_map | markdown | Visual map of stakeholders with influence levels and messaging strategy |
| executive_pitch | markdown | One-page executive summary optimized for the target audience |
| pilot_proposal | markdown | Detailed pilot project plan with scope, timeline, team, and budget |
| faq_document | markdown | Top 10 anticipated questions with prepared answers |
| metrics_dashboard | markdown | Success metrics dashboard template with KPIs and measurement plan |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| ROI quantified | blocking | Business case must include a specific ROI calculation with assumptions stated |
| Stakeholder coverage | blocking | All identified stakeholders must have tailored messaging |
| Pilot defined | blocking | Pilot proposal must include scope, timeline, team, budget, and success criteria |
| Objection handling | warning | At least 3 common objections should be addressed with counterarguments |
| Industry benchmarks | warning | ROI claims should be supported by external data or case studies |
| Audience alignment | warning | Language and framing must match the target audience's priorities |

---

## Handoff

- **On completion:** Hand to @design-chief for executive review and presentation scheduling
- **On pilot approval:** Hand to @brad-frost for pilot component selection and architecture
- **On governance questions:** Hand to @nathan-curtis for operating model design
- **On adoption planning:** Hand to @dan-mall adoption-strategy task if pitch is approved
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

