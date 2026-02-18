# Task: Design System ROI Calculator

**Task ID:** roi-calculator
**Version:** 1.0
**Purpose:** Calculate return on investment of a design system by measuring time savings, consistency, and efficiency gains
**Agent:** @brad-frost
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Quantifies the business value of a design system by measuring concrete metrics: time saved per component reuse, reduction in design-dev handoff friction, onboarding speed improvements, bug reduction from consistency, and maintenance cost reduction. Produces a financial model that stakeholders can use to justify continued investment in the design system.

```
INPUT (team data, project metrics, cost figures)
    |
[PHASE 1: DATA COLLECTION]
    -> Gather baseline metrics and current cost data
    |
[PHASE 2: CALCULATION]
    -> Model time savings, efficiency gains, and cost reductions
    |
[PHASE 3: REPORTING]
    -> Generate ROI report with projections and visualizations
    |
OUTPUT: ROI report with financial model, metrics dashboard, and investment recommendation
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| team_size | object | Yes | Number of designers, developers, and QA engineers using the system |
| avg_hourly_cost | number | Yes | Average fully-loaded hourly cost per team member in local currency |
| component_count | number | Yes | Total number of components in the design system |
| project_count | number | No | Number of active projects consuming the design system |
| time_before | object | No | Baseline metrics before design system (time to build a page, handoff time) |
| system_age_months | number | No | How long the design system has been in production |

---

## Preconditions

- Team size and composition data is available and accurate
- Hourly cost figures are approved for use in internal calculations
- At least 3 months of design system usage data exists for meaningful measurement
- Baseline metrics (before design system or early stage) are available or can be estimated

---

## Steps

### Phase 1: Data Collection and Baseline
1. Gather team composition: count of designers, front-end developers, back-end developers, QA engineers, product managers who interact with the design system
2. Collect cost data: average fully-loaded hourly rate per role (salary + benefits + overhead)
3. Establish baseline metrics (before design system or estimated):
   - Average time to design a new page from scratch
   - Average time to implement a page from design mockup
   - Average number of design-dev feedback cycles per feature
   - Average onboarding time for new team members
   - Average number of UI-related bugs per sprint
4. Collect current metrics (with design system):
   - Average time to design a new page using system components
   - Average time to implement using component library
   - Current design-dev feedback cycles per feature
   - Current onboarding time
   - Current UI bug count per sprint
5. Count reuse metrics: average times each component is reused across projects, number of unique implementations avoided

### Phase 2: Calculation and Modeling
1. **Time savings per component**: (time_to_build_custom - time_to_use_existing) * reuse_count = hours_saved_per_component
2. **Total build time savings**: Sum of hours saved across all components * hourly_rate = design_build_savings
3. **Handoff efficiency**: (old_feedback_cycles - new_feedback_cycles) * avg_cycle_time * hourly_rate = handoff_savings
4. **Onboarding acceleration**: (old_onboarding_days - new_onboarding_days) * new_hires_per_year * daily_rate = onboarding_savings
5. **Bug reduction value**: (old_bugs_per_sprint - new_bugs_per_sprint) * sprints_per_year * avg_bug_fix_time * hourly_rate = bug_savings
6. **Consistency value**: estimated_rework_hours_avoided * hourly_rate = consistency_savings
7. **Maintenance cost**: hours_per_month_maintaining_system * hourly_rate * 12 = annual_maintenance_cost
8. **Total ROI**: ((total_savings - annual_maintenance_cost) / annual_maintenance_cost) * 100
9. Project savings forward: 1-year, 2-year, and 3-year projections with team growth assumptions

### Phase 3: Reporting and Recommendations
1. Compile all calculations into a structured ROI report
2. Create a metrics summary table showing before/after comparisons
3. Calculate break-even point: how many months of system usage to recoup investment
4. Generate per-project ROI: savings attributable to each project consuming the system
5. Identify highest-ROI components: which components save the most time and money
6. Produce investment recommendation: maintain, increase, or restructure design system investment
7. List assumptions and confidence levels for each metric to maintain intellectual honesty

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| roi-report | markdown | Complete ROI analysis with calculations, projections, and recommendations |
| metrics-dashboard | markdown table | Before/after metrics comparison for all measured dimensions |
| financial-model | markdown | Detailed calculation breakdown with formulas and assumptions |
| executive-summary | markdown | One-page summary for leadership with key figures and recommendation |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Data completeness | blocking | Team size, hourly cost, and component count must all be provided |
| Calculation accuracy | blocking | All formulas must be shown and reproducible with the input data |
| Assumptions documented | blocking | Every estimate or assumption must be explicitly stated with confidence level |
| Break-even calculation | warning | Break-even point must be calculated and expressed in months |
| Projection realism | warning | Growth assumptions must be stated and within reasonable bounds |
| Per-component analysis | warning | Top 5 highest-ROI components should be identified |

---

## Handoff

- **On completion:** Hand to @nathan-curtis for governance investment planning based on ROI data
- **On team model questions:** Hand to @nathan-curtis (team-model) for team structure optimization
- **On system expansion:** Hand to @brad-frost (audit-system) for identifying high-value expansion areas
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

