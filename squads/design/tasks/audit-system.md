# Task: Audit Design System

**Task ID:** audit-system
**Version:** 1.0
**Purpose:** Perform a comprehensive audit of an existing design system using Atomic Design methodology
**Agent:** @brad-frost
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Evaluates an existing design system through the lens of Atomic Design, examining each layer from atoms through pages. The audit surfaces gaps, inconsistencies, naming violations, missing patterns, and opportunities to strengthen the system's foundation. This is critical for design system health checks and roadmap planning.

```
INPUT (design system repository, scope, platform)
    |
[PHASE 1: DISCOVERY]
    -> Catalog all existing components by atomic layer
    |
[PHASE 2: EVALUATION]
    -> Assess quality, consistency, and coverage at each layer
    |
[PHASE 3: REPORTING]
    -> Generate prioritized findings and recommendations
    |
OUTPUT: Audit report with severity-ranked findings and remediation roadmap
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| system_source | string | Yes | Path or URL to the design system repository or documentation site |
| platform | enum(web, ios, android, multi) | Yes | Target platform(s) to audit |
| scope | enum(full, atoms-only, molecules-up, organisms-up) | No | Depth of audit; defaults to full |
| brand_guidelines | file | No | Brand guidelines document for consistency checks |
| previous_audit | file | No | Previous audit report to track delta improvements |

---

## Preconditions

- Design system repository or documentation is accessible and navigable
- At least 10 components exist in the system to justify a meaningful audit
- Stakeholder has confirmed which platform(s) are in scope
- Auditor has access to both code and design artifact sources (Figma, Storybook, etc.)
- Design system naming convention documentation is available for reference during naming audit
- A list of supported browsers and platforms is available for responsive behavior verification

---

## Steps

### Phase 1: Discovery and Cataloging
1. Clone or access the design system source and identify the component directory structure
2. Enumerate all atoms: color tokens, typography scales, spacing units, iconography, base HTML elements (buttons, inputs, labels)
3. Enumerate all molecules: search bars, form fields with labels, card headers, nav items, and other small component groupings
4. Enumerate all organisms: headers, footers, hero sections, product cards, sidebars, modals, and complex composed components
5. Enumerate templates and page-level compositions if present
6. Cross-reference code components against design tool libraries (Figma, Sketch) to find drift between design source of truth and code implementation
7. Record total counts per layer and flag components that lack a clear atomic classification
8. Document the design system's folder structure and organization conventions for context

### Phase 2: Evaluation and Analysis
1. **Naming audit**: Check every component name against naming conventions; flag inconsistencies (e.g., `Btn` vs `Button`, `CardItem` vs `card-item`)
2. **Token coverage**: Verify that atoms reference design tokens rather than hardcoded values for color, spacing, typography, and elevation
3. **Composition integrity**: Confirm molecules are built from atoms, organisms from molecules/atoms; flag bypassed layers
4. **Variant completeness**: For each component, check that all documented states exist (default, hover, active, focus, disabled, error, loading)
5. **Accessibility baseline**: Spot-check 20% of components for ARIA attributes, keyboard navigation, and color contrast compliance
6. **Documentation coverage**: Score each component for presence of usage guidelines, do/don't examples, API docs, and code snippets
7. **Redundancy detection**: Identify duplicate or near-duplicate components that should be consolidated
8. **Responsive behavior**: Verify breakpoint handling and fluid scaling where applicable

### Phase 3: Reporting and Roadmap
1. Classify each finding by severity: critical (broken/inaccessible), major (inconsistent/incomplete), minor (naming/docs), informational
2. Calculate a system health score: (components passing all checks / total components) * 100
3. Generate a prioritized remediation backlog grouped by atomic layer
4. Compare against previous audit if provided and highlight improvements and regressions
5. Produce executive summary with key metrics: total components, coverage percentage, health score, top 5 risks
6. Recommend next audit cadence based on system maturity (monthly, quarterly, biannually)
7. Identify quick wins: low-effort fixes that immediately improve system consistency (renaming, token replacement)
8. Document technical debt: components that need significant rework and the estimated effort required
9. Create a maturity matrix rating the system on eight dimensions: naming, tokens, composition, variants, accessibility, documentation, testing, and governance

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| audit-report | markdown | Full audit report with findings organized by atomic layer and severity |
| component-inventory | markdown table | Complete catalog of all components with classification and status |
| remediation-backlog | markdown checklist | Prioritized list of issues to fix with effort estimates |
| health-scorecard | markdown | Executive summary with metrics and trend data |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Complete coverage | blocking | Every component in the system must appear in the inventory |
| Severity classification | blocking | Every finding must have a severity level assigned |
| Actionable recommendations | blocking | Each finding must include a specific remediation action |
| Token verification | warning | At least 80% of atoms should reference design tokens |
| Accessibility spot-check | warning | Spot-checked components must have accessibility findings documented |
| Naming consistency | warning | Naming violations must reference the expected convention |

---

## Handoff

- **On completion:** Hand to @nathan-curtis for governance review and remediation prioritization
- **On accessibility findings:** Hand to @stephanie-walter for deep accessibility audit
- **On pattern issues:** Hand to @jenifer-tidwell for pattern compliance analysis
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

