# Task: Naming Convention System

**Task ID:** naming-convention
**Version:** 1.0
**Purpose:** Create a comprehensive naming convention system for components, tokens, classes, and files
**Agent:** @nathan-curtis
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Defines structured naming rules for every artifact in the design system: components, design tokens, CSS classes, file names, Figma layers, and documentation pages. Applies established patterns (BEM, kebab-case, structured token naming) tailored to the system's technology stack and team preferences. Consistent naming is the backbone of a discoverable, maintainable design system.

```
INPUT (tech stack, current names, team conventions)
    |
[PHASE 1: AUDIT AND ANALYSIS]
    -> Catalog current naming patterns and identify inconsistencies
    |
[PHASE 2: CONVENTION DEFINITION]
    -> Define rules for each artifact type with examples
    |
[PHASE 3: ENFORCEMENT AND MIGRATION]
    -> Create linting rules, migration plan, and reference documentation
    |
OUTPUT: Naming convention document with rules, examples, linting config, and migration plan
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| tech_stack | string[] | Yes | Technologies in use (React, Vue, CSS Modules, Tailwind, Figma, etc.) |
| current_inventory | file | Yes | List of all current component names, token names, and class names |
| team_preference | enum(verbose, balanced, terse) | Yes | Team preference for naming verbosity |
| css_methodology | enum(BEM, SMACSS, OOCSS, utility-first, CSS-modules, none) | No | CSS naming methodology in use or desired |
| namespace_prefix | string | No | Global prefix for the design system (e.g., "ds", "acme", "ui") |

---

## Preconditions

- A component inventory exists (even if names are inconsistent)
- The technology stack is known and stable (framework migration is not imminent)
- Key stakeholders agree that naming standardization is needed
- The design token architecture exists or is being designed concurrently

---

## Steps

### Phase 1: Audit and Pattern Analysis
1. Collect all existing names across artifact types: component names (code), component names (design tool), token names, CSS class names, file/folder names, documentation page names
2. Analyze naming patterns currently in use: identify casing style, delimiter usage, prefix patterns, abbreviation usage
3. Count inconsistencies by type: mixed casing (camelCase vs PascalCase vs kebab-case), inconsistent delimiters, missing prefixes, ambiguous abbreviations
4. Identify name collisions: different artifacts sharing the same name, names that are too similar (e.g., `card` vs `card-item` vs `card-element`)
5. Map naming patterns from the tech stack: React convention (PascalCase components), CSS convention (kebab-case classes), token convention (category-type-item)
6. Benchmark against industry standards: Material Design token naming, Carbon component naming, Shopify Polaris conventions

### Phase 2: Convention Definition
1. **Component naming rules**:
   - Code: PascalCase for React/Vue components, kebab-case for web components
   - Figma: match code names exactly (PascalCase for frames, layers follow component structure)
   - Documentation: Title Case in headings, code name in code references
   - Rule: name describes function, not appearance ("Callout" not "BlueBox")
2. **Design token naming rules**:
   - Structure: `{category}-{type}-{item}-{subitem}-{state}`
   - Categories: color, spacing, typography, elevation, border, motion, z-index
   - Examples: `color-background-surface-primary`, `spacing-inline-md`, `typography-heading-xl-weight`
   - Casing: kebab-case throughout, all lowercase
3. **CSS class naming rules** (adapt to chosen methodology):
   - BEM: `.block__element--modifier` (e.g., `.card__header--compact`)
   - Utility: `.{property}-{value}` (e.g., `.p-4`, `.text-primary`)
   - CSS Modules: camelCase local names (e.g., `styles.cardHeader`)
4. **File and folder naming rules**:
   - Component files: match component name casing (PascalCase for React: `Button.tsx`)
   - Token files: kebab-case with category prefix (`color-tokens.json`)
   - Test files: `{ComponentName}.test.tsx`
   - Story files: `{ComponentName}.stories.tsx`
5. **Variant and state naming rules**:
   - Sizes: `sm`, `md`, `lg`, `xl` (abbreviated, lowercase)
   - Emphasis: `primary`, `secondary`, `tertiary` (full word)
   - States: `default`, `hover`, `focus`, `active`, `disabled` (full word)
   - Semantic: `success`, `warning`, `danger`, `info` (full word)
6. Define the controlled vocabulary: approved terms, forbidden terms, and required substitutions (e.g., use "danger" not "error" for destructive actions)
7. Create naming decision flowchart for each artifact type

### Phase 3: Enforcement and Migration
1. Create linting rules for automated enforcement:
   - ESLint rule for component name casing
   - Stylelint rule for CSS class naming pattern
   - Token name validation in build pipeline
   - File name validation in CI/CD
2. Build the migration map: every current name mapped to its convention-compliant name
3. Categorize migrations by impact: code-only (rename in source), published API (breaking change to consumers), design tool (Figma library update)
4. Create migration scripts or codemods where possible
5. Define the migration rollout: phase 1 (new components use new convention), phase 2 (high-frequency components migrated), phase 3 (full migration)
6. Write the complete naming convention reference document with examples for every rule
7. Create a quick-reference card for daily use and onboarding

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| naming-convention-guide | markdown | Complete naming rules for all artifact types with examples |
| token-naming-spec | markdown | Detailed token naming structure with category taxonomy |
| linting-config | markdown (code blocks) | Configuration snippets for ESLint, Stylelint, and CI validation |
| migration-plan | markdown table | Current to new name mapping with impact classification and rollout phases |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Artifact coverage | blocking | Naming rules must be defined for components, tokens, CSS classes, files, and variants |
| Example completeness | blocking | Every rule must include at least 2 correct and 1 incorrect example |
| Linting feasibility | blocking | At least component name and token name rules must be enforceable via linting |
| Consistency test | warning | Applying the rules to 10 sample names must produce the same result regardless of who applies them |
| Migration map | warning | Every existing name must map to a new name or be explicitly exempted |
| Quick reference | warning | A one-page reference card must be producible from the full guide |

---

## Handoff

- **On completion:** Hand to @brad-frost (pattern-naming) for atomic design specific naming integration
- **On governance integration:** Hand to @nathan-curtis (governance-model) for contribution naming requirements
- **On token architecture:** Hand to @nathan-curtis (component-spec) for token specification alignment
- **On issues:** Escalate to @design-chief

---

## Glossary

> Full glossary: [design-glossary.md](../data/design-glossary.md)

**Key terms for this task:**

- **Design language** — Shared visual rules, principles, and vocabulary for product identity
- **Shared vocabulary** — Team-aligned naming conventions across design and engineering
- **Design tokens** — Platform-agnostic values encoding design decisions
- **Semantic naming** — Naming by purpose not description

---

## Don't Do

- Do not introduce new terms without adding them to the shared vocabulary document
- Do not use different names for the same concept across design and engineering
- Do not define principles without concrete examples showing correct and incorrect application
- Do not create naming conventions that conflict with existing token naming (CTI)

