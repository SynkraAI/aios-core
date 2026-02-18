# Task: Create Pattern Inventory

**Task ID:** pattern-inventory
**Version:** 1.0
**Purpose:** Creates a purpose-driven pattern inventory organized by user need and context rather than visual similarity, identifying pattern relationships and redundancies
**Agent:** @alla-kholmatova
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

This task produces a pattern inventory that organizes design patterns by the user needs they serve rather than by their visual appearance. Traditional inventories group patterns by type (buttons, cards, modals), but a purpose-driven inventory groups them by what users are trying to accomplish (making a choice, finding information, completing a transaction). This approach reveals redundancies, gaps, and opportunities for consolidation that visual grouping misses.

A purpose-driven inventory is more durable than a visual inventory because it survives redesigns. When the visual implementation changes, the user needs remain stable, so the inventory structure remains relevant and useful for the team.

```
INPUT (product screens, user journeys, pattern classifications)
    ↓
[PHASE 1: EXTRACTION]
    → Capture all patterns from production screens, organize by occurrence
    ↓
[PHASE 2: ORGANIZATION]
    → Group patterns by user need/context, identify relationships
    ↓
[PHASE 3: ANALYSIS]
    → Detect redundancies, gaps, and consolidation opportunities
    ↓
OUTPUT: Purpose-Driven Pattern Inventory
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| product_screens | list | Yes | Screenshots or URLs of all key product screens and flows |
| user_journeys | list | Yes | Documented user journeys or task flows showing what users do |
| pattern_classifications | object | No | Output from pattern-classify task, if already completed |
| component_library | string | No | URL or path to existing component library or Storybook |

---

## Preconditions

- Access to production product or comprehensive screenshots of all major screens
- User journeys or task flows are documented and validated
- Stakeholders agree on the set of primary user needs the product addresses
- Pattern classification task is complete or team can classify during inventory
- A consistent method for capturing and cataloging patterns is established (spreadsheet, tool, database)
- Team members from both design and development are available to verify pattern identification

---

## Steps

### Phase 1: Extraction
1. Systematically screenshot every unique screen state across all product surfaces
2. Identify and isolate every distinct UI pattern on each screen (a pattern is any recurring design solution)
3. Record each pattern instance with: name, screen location, visual reference, and current frequency count
4. Capture variations: note where the same pattern appears differently across contexts (hover, active, error, disabled)
5. Tag each pattern with its current informal name as used by the team

### Phase 2: Organization
1. Define the user-need categories that will organize the inventory (e.g., "Making a selection", "Viewing details", "Providing input", "Navigating", "Receiving feedback")
2. Assign each extracted pattern to its primary user-need category based on what problem it solves for the user
3. Within each category, sub-group patterns by context: where and when the user encounters this need
4. Map pattern relationships: which patterns always appear together, which are alternatives to each other
5. Cross-reference with the design language: ensure naming aligns with the established vocabulary

### Phase 3: Analysis
1. Identify redundancies: multiple patterns serving the same user need in the same context (candidates for consolidation)
2. Identify gaps: user needs that lack a dedicated pattern or rely on improvised solutions
3. Score each pattern on adoption consistency (is it used the same way everywhere it appears?)
4. Prioritize consolidation opportunities by impact: which redundancies cause the most user confusion or developer overhead
5. Produce the final inventory document with categories, patterns, relationships, and recommendations
6. Create a visual catalog: side-by-side screenshots of each pattern organized by user-need category
7. Define a maintenance process for keeping the inventory current as the product evolves

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| pattern-inventory | Markdown | Complete inventory organized by user need with all patterns catalogued |
| relationship-map | Markdown | Pattern relationships: dependencies, alternatives, and compositions |
| redundancy-report | Markdown | Identified redundancies with consolidation recommendations and priority |
| gap-analysis | Markdown | User needs lacking adequate pattern coverage with creation recommendations |
| visual-catalog | Markdown/PDF | Visual reference with screenshots organized by user-need category |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| complete_extraction | blocking | Every production screen must be audited and all patterns captured |
| purpose_driven_org | blocking | Patterns must be organized by user need, not by visual type |
| relationship_documented | blocking | Pattern relationships (dependencies, alternatives) must be explicitly mapped |
| naming_aligned | warning | Pattern names must align with the design language vocabulary |
| frequency_tracked | warning | Usage frequency should be documented for prioritization decisions |
| visual_catalog | warning | A visual reference of all patterns should accompany the inventory document |
| maintenance_process | warning | A process for updating the inventory as patterns evolve must be documented |

---

## Handoff

- **On completion:** Hand to @jina-anne for token-architecture to map inventory patterns to token structure
- **On completion (alt):** Hand to @heydon-pickering for inclusive-audit of the most-used patterns
- **On completion (alt):** Hand to @micah-godbolt for frontend-audit to compare inventory with codebase component organization
- **On issues:** Escalate to @design-chief
- **Dependencies:** Best preceded by pattern-classify task; feeds into token-architecture and inclusive-audit

---

## Related Tasks

| Task | Relationship | Description |
|------|-------------|-------------|
| pattern-classify | Upstream | Provides classification for organizing the inventory |
| token-architecture | Downstream | Maps inventory patterns to token structure |
| inclusive-audit | Downstream | Audits the most-used patterns for accessibility |
| frontend-audit | Parallel | Compares inventory with codebase component organization |

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

