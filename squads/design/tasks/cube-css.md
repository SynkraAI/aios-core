# Task: Apply CUBE CSS Methodology

**Task ID:** cube-css
**Version:** 1.0
**Purpose:** Apply CUBE CSS methodology to a project establishing clear CSS architecture with Composition, Utility, Block, and Exception layers
**Agent:** @andy-bell
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Applies the CUBE CSS methodology to structure a project's CSS architecture into four distinct layers: Composition (layout primitives), Utility (single-purpose classes), Block (component-specific styles), and Exception (state-driven overrides). CUBE CSS embraces the cascade rather than fighting it, producing CSS that is smaller, more maintainable, and leverages the platform's strengths. This task sets up the full architecture from tokens through implementation.

```
INPUT (project codebase, design tokens, component inventory)
    |
[PHASE 1: AUDIT AND PLANNING]
    -> Analyze existing CSS, identify patterns, plan CUBE layer mapping
    |
[PHASE 2: ARCHITECTURE]
    -> Implement each CUBE layer with design tokens and custom properties
    |
[PHASE 3: MIGRATION AND VALIDATION]
    -> Migrate existing styles, validate output, document conventions
    |
OUTPUT: CUBE CSS architecture with documented conventions and migrated styles
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| project_source | string | Yes | Path to the project codebase or repository URL |
| design_tokens | file | Yes | Design tokens (JSON, YAML, or CSS custom properties) for color, spacing, typography |
| component_inventory | list | Yes | List of components that need styling in the CUBE architecture |
| existing_css | string | No | Path to existing CSS files to be migrated; empty for greenfield projects |
| build_tool | enum(postcss, sass, vanilla, tailwind-hybrid) | No | CSS build tool in use; defaults to vanilla |
| scope | enum(full, composition-only, audit-only) | No | Scope of work; defaults to full |

---

## Preconditions

- Design tokens are defined and available in a consumable format
- The component inventory includes at least the core components needed for the project
- The development team understands CSS custom properties and is comfortable with cascade-based CSS
- A CSS build pipeline exists or can be set up for the project
- There is agreement to adopt CUBE CSS as the methodology (not a competing approach)
- Browser support requirements have been documented and are compatible with CSS custom properties
- The team has reviewed CUBE CSS principles and understands the cascade-positive philosophy

---

## Steps

### Phase 1: Audit and Planning
1. Audit the existing CSS codebase (if any): measure total size, count selectors, analyze specificity graph, identify duplication
2. Catalog existing patterns that naturally fit each CUBE layer: layout patterns (Composition), repeated utilities (Utility), component styles (Block), state variations (Exception)
3. Identify design tokens that are hardcoded instead of using custom properties
4. Map each component from the inventory to its expected CUBE layers: which compositions contain it, which utilities it uses, its block styles, and its exception states
5. Define the file structure for the CUBE architecture: `/composition/`, `/utility/`, `/block/`, `/exception/`, and a global tokens layer
6. Create a migration plan: which components to migrate first, dependency order, risk assessment

### Phase 2: Architecture Implementation
1. **Global layer**: Set up CSS custom properties from design tokens: color scales, spacing scale, type scale, measure (line length), and any fluid calculations
2. **Composition layer**: Create layout compositions using intrinsic design principles: Stack, Sidebar, Switcher, Grid, Center, Cluster, Cover, Frame from Every Layout
3. **Utility layer**: Generate utility classes for the most commonly needed single-purpose styles: spacing, color, typography size, font weight, text alignment, visibility, flow-space
4. **Block layer**: Implement component-specific styles that cannot be achieved through composition and utility alone; keep these minimal and focused
5. **Exception layer**: Define exception styles using data attributes (`[data-state="active"]`, `[data-variant="primary"]`) for state-driven overrides
6. Create a cascade order document showing how the layers interact and which specificity level each layer targets
7. Implement a CSS reset or baseline that works with the CUBE approach (prefer modern resets like Andy Bell's "A More Modern CSS Reset")

### Phase 3: Migration and Validation
1. Migrate components starting with the most foundational: typography, then layout, then interactive components
2. For each migrated component, verify visual regression: compare before and after screenshots
3. Validate that custom properties cascade correctly through nested compositions
4. Test responsive behavior: ensure fluid values and compositions adapt correctly across viewports
5. Run a post-migration specificity analysis and compare against pre-migration baseline
6. Document the CUBE conventions for the team: naming patterns, layer decision tree ("when to use Utility vs Block"), contribution guidelines
7. Create example patterns showing common compositions with annotated CUBE layer breakdowns

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| cube_architecture | CSS files | Complete CUBE CSS file structure with all four layers implemented |
| token_system | CSS file | Custom properties layer with all design tokens |
| css_reset | CSS file | Modern CSS reset aligned with the CUBE approach |
| convention_guide | markdown | Documentation of CUBE conventions, naming patterns, and decision tree |
| migration_report | markdown | Summary of migrated components with before/after specificity metrics |
| example_patterns | markdown + code | Annotated examples showing CUBE layers working together |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Layer separation | blocking | Each CSS rule must belong to exactly one CUBE layer with no cross-contamination |
| Token usage | blocking | No hardcoded color, spacing, or typography values; all must reference custom properties |
| Composition independence | blocking | Composition classes must work regardless of content placed inside them |
| Specificity control | warning | Maximum specificity should not exceed 0,2,0 for blocks; exceptions may use attribute selectors |
| Utility atomicity | warning | Each utility class must do exactly one thing and not combine concerns |
| Visual regression | warning | Migrated components must match pre-migration visual output within tolerance |

---

## Handoff

- **On completion:** Hand to @brad-frost for component architecture alignment with atomic design layers
- **On token refinement:** Hand to @dan-mall for design direction validation of token choices
- **On utility layer:** Continue with @andy-bell utility-system task for utility class generation
- **On UX structure:** Hand to @sophia-prater for component-object mapping verification
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

