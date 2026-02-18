# Task: Pattern Naming Convention

**Task ID:** pattern-naming
**Version:** 1.0
**Purpose:** Establish naming conventions for design system patterns with taxonomy and decision tree
**Agent:** @brad-frost
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Creates a comprehensive naming system for all design system patterns including components, tokens, variants, and compositions. Produces a taxonomy, a set of naming rules, and a decision tree that team members can follow to name any new pattern consistently. Strong naming reduces confusion, improves discoverability, and prevents duplication.

```
INPUT (current naming state, system scope, team preferences)
    |
[PHASE 1: ANALYSIS]
    -> Audit current names, identify inconsistencies, gather team input
    |
[PHASE 2: CONVENTION DESIGN]
    -> Define rules, taxonomy, and decision tree
    |
[PHASE 3: MIGRATION AND DOCUMENTATION]
    -> Map existing names to new convention, document everything
    |
OUTPUT: Naming convention guide with taxonomy, rules, decision tree, and migration map
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| current_components | file | Yes | List of current component and token names in the system |
| system_scope | enum(small, medium, large, enterprise) | Yes | Scale of the design system to calibrate naming depth |
| naming_preferences | string | No | Team preferences on casing (kebab, camel, pascal), verbosity, abbreviations |
| tech_stack | string[] | No | Frameworks in use (React, CSS, Figma) for platform-specific naming needs |
| industry_terms | string[] | No | Domain-specific terminology that should be incorporated or avoided |

---

## Preconditions

- An inventory of existing component and token names is available
- Key stakeholders (design, engineering, product) are available for preference input
- The design system has at least 15 named elements to establish meaningful patterns
- Team has agreed this is the right time to standardize naming (not mid-sprint)

---

## Steps

### Phase 1: Current State Analysis
1. Collect all existing names: components, tokens, CSS classes, Figma layers, file names
2. Categorize names by type: component names, design token names, variant names, state names, layout names
3. Identify naming inconsistencies: mixed casing (Button vs btn-group), mixed language (color vs colour), abbreviation vs full word (nav vs navigation)
4. Identify naming collisions: different things with the same name or overly similar names
5. Survey team members on pain points: which names cause confusion, which are hard to find, which are ambiguous
6. Research naming conventions in comparable design systems (Material Design, Carbon, Polaris, Spectrum) for benchmarking

### Phase 2: Convention Design
1. Define casing rules per context:
   - Component names: PascalCase for code, kebab-case for CSS, Title Case for documentation
   - Token names: kebab-case with category prefix (color-primary-500, spacing-md)
   - File names: kebab-case matching component name
   - Figma layers: match code component name exactly
2. Establish naming structure: `[category]-[element]-[variant]-[state]-[scale]`
3. Build a controlled vocabulary: approved terms for common concepts (primary/secondary vs main/alt, small/medium/large vs sm/md/lg)
4. Define abbreviation rules: which abbreviations are allowed (btn, nav, img) and which must be spelled out
5. Create a naming decision tree:
   - Is it an atom? Use `[element]` (e.g., `button`, `input`, `icon`)
   - Is it a molecule? Use `[context]-[element]` (e.g., `search-bar`, `form-field`)
   - Is it an organism? Use `[section]-[purpose]` (e.g., `header-nav`, `product-card`)
   - Is it a token? Use `[category]-[property]-[variant]-[scale]` (e.g., `color-text-primary`, `spacing-inline-md`)
6. Define rules for variants and modifiers: size suffix, color suffix, state suffix
7. Establish namespace boundaries: prefixes for sub-systems or product areas if applicable

### Phase 3: Migration and Documentation
1. Map every existing name to its new name under the convention
2. Flag breaking changes: names that will change in code, requiring migration effort
3. Categorize migrations by risk: low (documentation only), medium (design tool rename), high (code rename with API change)
4. Create a deprecation schedule: old names work for N versions with console warnings
5. Write the complete naming convention guide with examples for every rule
6. Create a quick-reference cheat sheet (one page) for daily use
7. Define the naming review process: who approves new names and how disputes are resolved

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| naming-guide | markdown | Complete naming convention documentation with all rules and examples |
| decision-tree | markdown | Flowchart-style decision tree for naming any new pattern |
| migration-map | markdown table | Old name to new name mapping with risk classification |
| cheat-sheet | markdown | One-page quick reference for daily naming decisions |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Complete coverage | blocking | Convention must address components, tokens, variants, states, and files |
| Decision tree test | blocking | The decision tree must produce a correct name for 10 sample components |
| No ambiguity | blocking | Two different people following the rules must arrive at the same name |
| Migration map | warning | Every existing name must have a mapped new name or explicit exemption |
| Team sign-off | warning | At least one designer and one engineer must validate the convention |
| Abbreviation list | warning | Approved abbreviations must be explicitly listed |

---

## Handoff

- **On completion:** Hand to @nathan-curtis for integration into governance model and contribution guidelines
- **On implementation:** Hand to @brad-frost (build-component) for applying convention to new components
- **On token naming:** Hand to @nathan-curtis (naming-convention) for cross-referencing token naming system
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

