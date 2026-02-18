# Task: Interface Inventory

**Task ID:** interface-inventory
**Version:** 1.0
**Purpose:** Create a complete interface inventory by cataloging every unique UI element across all screens
**Agent:** @brad-frost
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Captures every unique UI element across a product's screens and pages, grouping them by type and function. The inventory exposes redundancy, visual inconsistencies, and consolidation opportunities that inform design system creation or refactoring. This is the essential first step before building or rebuilding a component library.

```
INPUT (screens/pages, product scope, categorization scheme)
    |
[PHASE 1: COLLECTION]
    -> Screenshot and catalog every unique UI element
    |
[PHASE 2: CLASSIFICATION]
    -> Group, deduplicate, and categorize elements
    |
[PHASE 3: ANALYSIS]
    -> Identify consolidation opportunities and priorities
    |
OUTPUT: Categorized inventory with redundancy analysis and consolidation plan
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| product_screens | file[] | Yes | Screenshots or links to all screens/pages to inventory |
| product_scope | string | Yes | Name and boundaries of the product being inventoried |
| category_scheme | enum(functional, visual, atomic, custom) | No | How to group elements; defaults to functional |
| existing_system | string | No | Reference to existing design system for comparison |
| stakeholder_priorities | string | No | Areas of concern or known problem areas to prioritize |

---

## Preconditions

- All product screens or pages are accessible and documented
- Screen captures represent the current production state, not aspirational designs
- At least one complete user flow is available to trace element usage in context
- Team has agreed on the scope boundaries (which product areas to include)
- A consistent method for capturing screenshots or accessing design files is available
- The product is stable enough that the inventory will not be immediately outdated by in-progress changes

---

## Steps

### Phase 1: Collection and Capture
1. Enumerate all unique screens and pages within the defined scope
2. For each screen, identify and screenshot every distinct UI element: buttons, inputs, dropdowns, cards, modals, alerts, icons, typography instances, navigation elements, media containers
3. Capture element variations: different sizes, colors, states (hover, active, disabled), and contextual appearances
4. Document where each element appears (screen name, section, user flow context)
5. Tag each element with a temporary identifier for tracking (e.g., `BTN-001`, `CARD-003`)
6. Note any dynamic or conditional elements that appear only under specific states

### Phase 2: Classification and Grouping
1. Sort all collected elements into categories based on the selected scheme:
   - **Functional**: buttons, inputs, navigation, feedback, content containers, media, data display
   - **Visual**: typography, color usage, iconography, spacing patterns, elevation/shadow
   - **Atomic**: atoms, molecules, organisms following Atomic Design hierarchy
2. Within each category, identify exact duplicates (pixel-identical elements used in multiple places)
3. Identify near-duplicates: elements that serve the same purpose but differ in size, color, spacing, or border treatment
4. Count unique instances vs total appearances for each element
5. Map element relationships: which elements always appear together (implicit molecules)
6. Flag orphaned elements that appear on only one screen

### Phase 3: Analysis and Consolidation Planning
1. Calculate redundancy metrics: (near-duplicates / total unique elements) * 100
2. For each group of near-duplicates, propose a canonical version and document what changes
3. Prioritize consolidation candidates by frequency of use (high-frequency elements first)
4. Identify missing elements: common patterns absent from the product that should exist
5. Create a consolidation effort matrix: impact (how many screens affected) vs effort (how different the variants are)
6. Recommend a phased consolidation plan starting with highest-impact, lowest-effort items
7. Estimate the resulting component count after full consolidation
8. Map each element to its potential atomic design layer (atom, molecule, organism) to inform system architecture
9. Identify design token candidates: colors, spacing values, and typography styles that recur across multiple elements
10. Document element lifecycle status: active (in production), legacy (scheduled for removal), proposed (designed but not implemented)

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| element-catalog | markdown | Complete inventory of all unique UI elements with screenshots and locations |
| category-summary | markdown table | Element counts and statistics grouped by category |
| redundancy-report | markdown | Analysis of duplicates, near-duplicates, and consolidation candidates |
| consolidation-plan | markdown checklist | Phased plan for reducing element count with effort estimates |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Full coverage | blocking | Every screen in scope must have its elements cataloged |
| Unique identification | blocking | Every element must have a unique tracking identifier |
| Category assignment | blocking | Every element must be assigned to at least one category |
| Redundancy analysis | warning | Near-duplicate groups must include a recommended canonical version |
| Location mapping | warning | Each element must list at least one screen where it appears |
| Consolidation feasibility | warning | Each consolidation recommendation must include effort estimate |

---

## Handoff

- **On completion:** Hand to @brad-frost (audit-system) for atomic classification of the consolidated inventory
- **On pattern questions:** Hand to @jenifer-tidwell for pattern identification and recommendation
- **On governance needs:** Hand to @nathan-curtis for contribution and versioning strategy
- **On issues:** Escalate to @design-chief

---

## Glossary

> Full glossary: [design-glossary.md](../data/design-glossary.md)

**Key terms for this task:**

- **Pattern library** — Organized collection of reusable UI patterns with documentation
- **Interface inventory** — Cataloging every unique UI element to identify inconsistencies
- **Pattern consolidation** — Merging similar patterns to establish canonical versions
- **Design language** — Shared visual rules and vocabulary defining product identity
- **Shared vocabulary** — Team-aligned naming ensuring designers and developers use the same terms

---

## Don't Do

- Do not inventory patterns without checking for existing pattern libraries first
- Do not consolidate patterns before completing a full interface inventory
- Do not name patterns inconsistently — follow the shared vocabulary and naming convention
- Do not create a new pattern when an existing one can be extended or adapted
- Do not skip the validation step that confirms consolidated patterns cover original usage

