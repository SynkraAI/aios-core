# Task: Design Responsive Strategy

**Task ID:** responsive-strategy
**Version:** 1.0
**Purpose:** Design a comprehensive responsive strategy using fluid typography, container queries, intrinsic sizing, and modern CSS techniques
**Agent:** @andy-bell
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Designs a holistic responsive strategy that moves beyond traditional breakpoint-driven approaches toward intrinsic, content-aware responsiveness. Covers fluid typography using `clamp()`, container queries for component-level responsiveness, intrinsic sizing with `min()`, `max()`, and `fit-content`, a minimal breakpoint system for edge cases, and responsive component patterns. The strategy ensures the design system adapts gracefully to any context without relying on arbitrary viewport widths.

```
INPUT (project requirements, viewport range, component inventory)
    |
[PHASE 1: ASSESSMENT]
    -> Audit current responsive approach, identify pain points, define principles
    |
[PHASE 2: STRATEGY DESIGN]
    -> Define fluid systems, container query strategy, and breakpoint policy
    |
[PHASE 3: IMPLEMENTATION GUIDE]
    -> Create patterns, migration guide, and testing protocol
    |
OUTPUT: Responsive strategy document with implementation patterns and testing guide
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| viewport_range | string | Yes | Target viewport range the product must support (e.g., "320px to 2560px") |
| component_inventory | list | Yes | List of components that require responsive behavior |
| project_requirements | string | Yes | Specific responsive requirements (e.g., "must support print", "kiosk mode", "watch app") |
| current_approach | string | No | Description of current responsive strategy (breakpoint-first, utility-first, etc.) |
| performance_budget | string | No | CSS performance budget in KB for responsive-related styles |
| browser_support | list | No | Browser support matrix; defaults to last 2 versions of major browsers |

---

## Preconditions

- Design tokens for typography, spacing, and sizing are defined or being defined concurrently
- The layout system (Every Layout primitives) is established or being established concurrently
- The team is comfortable with modern CSS features: `clamp()`, container queries, logical properties
- Browser support matrix is documented and compatible with the proposed techniques
- Content examples spanning the full viewport range are available for testing
- The team agrees on the principle that intrinsic design should be preferred over breakpoint-driven design
- Device and viewport analytics data is available to inform priority viewport ranges
- Accessibility requirements for text resizing (up to 200%) and zoom are documented

---

## Steps

### Phase 1: Assessment and Principles
1. Audit the current responsive approach: count breakpoints, identify media queries, evaluate consistency across components
2. Identify responsive pain points: layouts that break at unexpected sizes, components that do not adapt well, excessive breakpoint-specific overrides
3. Define responsive design principles for the project: content-first (layouts respond to content, not viewport), intrinsic over extrinsic (prefer self-sizing to media queries), progressive enhancement (base experience works everywhere, enhancements layer on)
4. Categorize responsive needs by type: global layout changes (rare, breakpoint-appropriate), component-level adaptation (container queries), value fluidity (clamp/fluid tokens)
5. Establish the responsive testing matrix: devices, viewports, orientations, zoom levels, text-size overrides
6. Define the responsive cascade: which technique to apply first and when to fall back to the next

### Phase 2: Strategy Design
1. **Fluid typography system**: Define `clamp()` formulas for each type scale step; calculate minimum, preferred (viewport-relative), and maximum values; ensure accessibility with text-size override support
2. **Fluid spacing system**: Apply fluid spacing to larger spacing values (section gaps, page margins) while keeping small spacing values static for precision
3. **Container query strategy**: Identify components that need container-level responsiveness; define container names, size thresholds, and layout adaptations for each
4. **Intrinsic sizing patterns**: Define patterns for `min()`, `max()`, `fit-content`, and `minmax()` usage in layout contexts; replace fixed breakpoint logic where possible
5. **Breakpoint policy**: Define a minimal breakpoint system (2-3 breakpoints maximum) for genuinely global layout changes; document when breakpoints are and are not appropriate
6. **Responsive component patterns**: For each component in the inventory, define its responsive behavior: which technique applies, how it adapts, and what the content thresholds are
7. **Print and special contexts**: If required, define print stylesheet strategy, high-contrast mode support, and any special viewport contexts (kiosk, watch, embedded)

### Phase 3: Implementation Guide and Testing
1. Create responsive implementation patterns: code examples for each technique (fluid typography, container queries, intrinsic sizing, breakpoint usage)
2. Write the migration guide for converting existing breakpoint-based CSS to the new responsive strategy
3. Define the responsive testing protocol: manual testing checklist, automated visual regression setup, accessibility zoom testing
4. Create responsive debugging utilities: custom property overrides for testing fluid values at extremes, container query debugging styles
5. Document responsive anti-patterns: things to avoid (e.g., `vw` units for typography without clamp, breakpoints inside components, pixel-based media queries)
6. Build a responsive showcase page that demonstrates all techniques working together across the viewport range

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| responsive_strategy | markdown | Comprehensive strategy document with principles, techniques, and decision framework |
| fluid_formulas | CSS + markdown | Fluid typography and spacing `clamp()` formulas with explanation |
| container_query_map | markdown | Component-to-container-query mapping with thresholds and adaptations |
| breakpoint_policy | markdown | Minimal breakpoint system definition with usage guidelines |
| implementation_patterns | markdown + code | Code examples for each responsive technique |
| anti_patterns | markdown | Responsive anti-patterns to avoid with correct alternatives |
| testing_protocol | markdown | Testing checklist covering viewports, zoom, text size, and special contexts |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Breakpoint minimalism | blocking | Strategy must use 3 or fewer global breakpoints; component adaptation must use container queries or intrinsic sizing |
| Fluid accessibility | blocking | Fluid typography must remain readable and respect user text-size preferences at all viewport sizes |
| Technique coverage | blocking | Every component in the inventory must have a defined responsive behavior using the strategy |
| Container query adoption | warning | Components that adapt based on available space should use container queries rather than media queries |
| Print consideration | warning | If print is in scope, a print strategy should be documented |
| Performance impact | warning | Responsive-related CSS should not exceed the defined performance budget |

---

## Handoff

- **On completion:** Hand to @brad-frost for responsive component architecture integration with atomic design
- **On fluid token values:** Hand to @andy-bell css-tokens task for implementing fluid calculations
- **On visual direction:** Hand to @dan-mall for validation of responsive behavior at key viewport sizes
- **On issues:** Escalate to @design-chief

---

## Glossary

> Full glossary: [design-glossary.md](../data/design-glossary.md)

**Key terms for this task:**

- **Intrinsic design** — Layouts that adapt based on content and available space, not fixed breakpoints
- **CSS custom properties** — CSS variables for runtime theming and token delivery
- **Utility classes** — Single-purpose CSS classes composed in HTML
- **Responsive strategy** — Approach for adapting UI across screen sizes and devices

---

## Don't Do

- Do not use fixed pixel breakpoints when intrinsic design with container queries is viable
- Do not mix layout approaches (Grid + absolute positioning) without documenting the rationale
- Do not hardcode spacing values — use spacing tokens for consistency
- Do not ignore content reflow behavior when planning responsive layouts

