# Task: Design Layout System

**Task ID:** layout-design
**Version:** 1.0
**Purpose:** Design a layout system using Every Layout primitives for intrinsic, fluid, and resilient layouts
**Agent:** @andy-bell
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Designs a comprehensive layout system built on Every Layout primitives: Stack, Sidebar, Switcher, Cover, Center, Cluster, Frame, and Grid. These primitives create intrinsic layouts that respond to their content and container rather than relying on arbitrary breakpoints. The result is a set of reusable, composable layout components that handle the vast majority of layout needs with minimal custom CSS and maximum resilience to content variation.

```
INPUT (content types, viewport requirements, existing layout patterns)
    |
[PHASE 1: ANALYSIS]
    -> Audit existing layouts, identify primitive needs, define spacing system
    |
[PHASE 2: IMPLEMENTATION]
    -> Build each layout primitive with custom properties and intrinsic sizing
    |
[PHASE 3: COMPOSITION]
    -> Compose primitives into page-level layouts and document usage
    |
OUTPUT: Complete layout system with primitives, compositions, and usage documentation
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| content_types | list | Yes | Types of content the layout system must handle (text, cards, media, forms, dashboards) |
| viewport_range | string | Yes | Target viewport range (e.g., "320px to 2560px") |
| existing_layouts | string | Yes | Current layout approach in the project (CSS Grid, Flexbox, framework-specific) |
| spacing_scale | list | No | Existing spacing scale; if not provided, one will be created |
| max_measure | string | No | Maximum line length for readable text; defaults to 65ch |
| container_strategy | enum(fixed, fluid, hybrid) | No | Container width strategy; defaults to fluid |

---

## Preconditions

- The project's typography system is established (type scale affects layout decisions)
- Design tokens for spacing are defined or will be created as part of this task
- The team is willing to adopt intrinsic design principles over fixed breakpoint approaches
- Browser support requirements are compatible with modern CSS (Flexbox, Grid, container queries)
- Content examples are available for testing layouts with real-world content variation
- The maximum viewport range is defined for fluid calculation boundaries
- The team understands that layout primitives are content-agnostic and reusable across contexts

---

## Steps

### Phase 1: Layout Analysis
1. Audit all existing page layouts in the project and categorize the layout patterns used
2. Map each existing layout to the Every Layout primitive that would replace it: stacked content (Stack), sidebar layouts (Sidebar), responsive switches (Switcher), hero sections (Cover), centered content (Center), inline groups (Cluster), aspect-ratio containers (Frame), grid layouts (Grid)
3. Define the spacing system if not provided: create a modular scale (e.g., based on a ratio of 1.5 or the golden ratio) with custom properties
4. Identify content-dependent layout behaviors: what happens when content is very short, very long, missing, or overflowing
5. Document viewport behavior requirements: which layouts must change at which content thresholds (not arbitrary breakpoints)
6. Map composition patterns: which primitives are commonly nested inside other primitives

### Phase 2: Primitive Implementation
1. **Stack**: Implement vertical rhythm primitive using `margin-block` with a configurable `--space` custom property; supports recursive stacking and exception spacing
2. **Sidebar**: Create sidebar layout using Flexbox with intrinsic wrapping: sidebar has a fixed minimum width, content fills remaining space, wraps to single column when space is insufficient
3. **Switcher**: Build the horizontal-to-vertical switcher that flips layout direction based on a configurable threshold width, not a media query
4. **Cover**: Implement the cover layout for hero-style sections: vertically centered principal element with optional header and footer
5. **Center**: Create the centering primitive with configurable max-width (measure), gutters, and intrinsic centering via margin auto
6. **Cluster**: Build the inline cluster for groups of elements with consistent gap: tag lists, button groups, navigation items, icon rows
7. **Frame**: Implement the aspect-ratio frame for media containers: maintains ratio regardless of content, supports common ratios (16:9, 4:3, 1:1, golden)
8. **Grid**: Create the auto-grid using CSS Grid with `auto-fill`/`auto-fit` and configurable minimum item width for content-driven column counts

### Phase 3: Composition and Documentation
1. Compose page-level layouts from primitives: a typical page might be Cover > Center > Stack > (Sidebar > Stack + Stack) > Cluster
2. Test compositions with real content extremes: empty content, minimal content, maximum content, mixed content types
3. Verify intrinsic responsive behavior: test every primitive across the full viewport range without relying on breakpoints
4. Document each primitive: purpose, API (custom properties), usage examples, composition patterns, anti-patterns
5. Create a layout decision tree: given a layout need, which primitive or combination of primitives to use
6. Build a living reference page showing all primitives in isolation and in common compositions

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| layout_primitives | CSS files | All 8 Every Layout primitives implemented with custom properties |
| spacing_system | CSS file | Spacing scale as custom properties with modular scale |
| composition_examples | HTML + CSS | Page-level compositions built from primitives with real content |
| layout_guide | markdown | Documentation with decision tree, examples, and API reference |
| anti_patterns | markdown | Common layout mistakes to avoid with correct alternatives |
| primitive_reference | HTML | Living reference page showing all primitives |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Intrinsic behavior | blocking | No layout primitive may use media queries; all must respond to content and container |
| Custom property API | blocking | Every primitive must expose its configuration through CSS custom properties |
| Content resilience | blocking | All primitives must handle content extremes (empty, minimal, overflow) gracefully |
| Spacing consistency | warning | All spacing values must come from the defined spacing scale custom properties |
| Composition testing | warning | At least 3 page-level compositions should be demonstrated with real content |
| Browser compatibility | warning | Primitives should work in all browsers specified in the project's support matrix |

---

## Handoff

- **On completion:** Hand to @brad-frost for integration of layout primitives into atomic design component architecture
- **On token alignment:** Hand to @dan-mall for visual direction validation of spacing and proportion choices
- **On responsive behavior:** Continue with @andy-bell responsive-strategy task for comprehensive responsive planning
- **On component layout needs:** Hand to @sophia-prater for object-layout mapping in the UX structure
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

