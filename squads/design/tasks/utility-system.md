# Task: Create Utility Class System

**Task ID:** utility-system
**Version:** 1.0
**Purpose:** Create a utility class system for spacing, color, typography, and layout following CUBE CSS utility layer principles
**Agent:** @andy-bell
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Creates a comprehensive utility class system that serves as the utility layer in a CUBE CSS architecture. Utilities are single-purpose classes that apply one specific design token or behavior. Unlike utility-first frameworks that generate thousands of classes, this approach creates a curated set of utilities derived directly from the project's design tokens, keeping the utility layer lean, purposeful, and aligned with the design system.

```
INPUT (design tokens, usage patterns, project constraints)
    |
[PHASE 1: TOKEN MAPPING]
    -> Map design tokens to utility categories, define naming conventions
    |
[PHASE 2: GENERATION]
    -> Create utility classes for spacing, color, typography, layout, and flow
    |
[PHASE 3: DOCUMENTATION]
    -> Document utility API, usage guidelines, and integration with CUBE layers
    |
OUTPUT: Curated utility class system with documentation and integration guide
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| design_tokens | file | Yes | Design tokens for color, spacing, typography, and sizing |
| usage_patterns | list | Yes | Common styling patterns observed in the project that utilities should address |
| project_constraints | string | Yes | Build tool constraints, browser support, and performance budgets |
| existing_utilities | string | No | Any existing utility classes to incorporate or replace |
| framework_context | string | No | If using a framework (React, Vue, etc.), how utilities will be applied |
| responsive_needs | boolean | No | Whether responsive utility variants are needed; defaults to false |

---

## Preconditions

- Design tokens are finalized and available in a structured format (JSON, YAML, or CSS custom properties)
- The CUBE CSS architecture is established or being established for the project
- The team agrees that utilities should be token-driven and curated, not exhaustive
- Build tooling can handle the chosen utility generation approach (static CSS, PostCSS, or build-time generation)
- A naming convention for the project has been agreed upon or will be defined here
- The team understands the difference between utility classes and component (block) styles
- A performance budget for CSS file size has been established or will be defined

---

## Steps

### Phase 1: Token Mapping and Convention Design
1. Inventory all design tokens by category: color (palette, semantic, component), spacing (scale), typography (size, weight, leading, family), sizing (measures, containers)
2. Determine which tokens warrant dedicated utility classes vs. which should only be used as custom properties in blocks
3. Define the naming convention for utilities: `.bg-primary`, `.text-sm`, `.space-m` or alternative patterns that align with the project's conventions
4. Map responsive behavior: identify which utilities need responsive variants and define the responsive suffix convention (e.g., `.stack-lg@md`)
5. Plan the cascade position: utilities should have higher specificity than compositions but lower than exceptions
6. Define "flow space" utility approach: how vertical rhythm utilities interact with the Stack composition primitive

### Phase 2: Utility Generation
1. **Spacing utilities**: Create margin, padding, and gap utilities for each spacing scale step; include directional variants (block, inline, start, end)
2. **Color utilities**: Create background-color and text-color utilities for each semantic color token; include interactive state variants where needed
3. **Typography utilities**: Create font-size utilities for each type scale step, font-weight utilities, line-height utilities, and font-family utilities
4. **Layout utilities**: Create display utilities (flex, grid, block, none), alignment utilities (items, justify, self), and overflow utilities
5. **Flow space utilities**: Create the `--flow-space` custom property utilities that control spacing within Stack compositions
6. **Visibility and accessibility utilities**: Create screen-reader-only, visually-hidden, focus-visible, and reduced-motion utilities
7. **Miscellaneous utilities**: Create border-radius, shadow, opacity, and z-index utilities based on design token values
8. Ensure all utility classes apply exactly one CSS property (or one logical group like `visually-hidden`)

### Phase 3: Documentation and Integration
1. Generate a utility reference table: class name, CSS property, value, token source, responsive variants
2. Create usage guidelines: when to use a utility vs. when to create a block, how to combine utilities with compositions
3. Document the "utility decision tree": given a styling need, should it be a token, a utility, or a block style
4. Write integration examples showing utilities working within CUBE CSS compositions and alongside blocks
5. Create a utility audit checklist: how to verify utilities are not being overused or replacing block-level concerns
6. Set up a utility generation pipeline if applicable: token-to-utility build step documentation

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| utility_stylesheet | CSS file | Complete utility class system organized by category |
| utility_reference | markdown table | Full reference of all utility classes with their CSS output |
| usage_guide | markdown | Guidelines for when and how to use utilities in the CUBE context |
| decision_tree | markdown | Flowchart for deciding between token, utility, and block approaches |
| audit_checklist | markdown | Checklist for reviewing utility usage and preventing overuse |
| generation_config | config file | Build configuration for regenerating utilities from updated tokens |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Single responsibility | blocking | Each utility class must apply exactly one CSS property or one logical group |
| Token derivation | blocking | Every utility value must trace back to a design token; no arbitrary values |
| Naming consistency | blocking | All utility names must follow the defined naming convention without exceptions |
| No duplication | warning | No two utility classes should produce the same CSS output |
| Cascade compatibility | warning | Utilities must not conflict with composition or block layer specificity |
| Size budget | warning | Total utility CSS should not exceed the defined performance budget |

---

## Handoff

- **On completion:** Hand to @brad-frost for component integration ensuring utilities work with atomic design components
- **On token updates:** Hand to @dan-mall for design direction review of token-to-utility mappings
- **On responsive utilities:** Coordinate with @andy-bell responsive-strategy task for responsive utility variants
- **On UX consistency:** Hand to @sophia-prater for verification that utility patterns support the object model
- **On issues:** Escalate to @design-chief

---

## Glossary

> Full glossary: [design-glossary.md](../data/design-glossary.md)

**Key terms for this task:**

- **CSS custom properties** — CSS variables (`--color-primary`) for theming and tokens
- **Tailwind CSS** — Utility-first CSS framework with classes like `flex`, `p-4`
- **CUBE CSS** — Composition, Utility, Block, Exception methodology
- **@layer** — CSS cascade layer for organizing style precedence
- **Utility classes** — Single-purpose CSS classes composed in markup

---

## Don't Do

- Do not mix naming conventions (BEM + utility classes) without a clear layering strategy
- Do not add custom CSS that duplicates existing utility classes
- Do not use `!important` to override specificity — restructure cascade layers instead
- Do not ignore unused CSS during audits — dead code increases bundle size
- Do not upgrade Tailwind versions without checking for breaking changes in config format

