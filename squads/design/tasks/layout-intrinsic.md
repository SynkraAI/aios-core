# Task: Create Intrinsic Layouts

**Task ID:** layout-intrinsic
**Version:** 1.0
**Purpose:** Creates intrinsic layouts using Every Layout principles: Stack, Sidebar, Switcher, Cover, Center, Cluster, and Frame primitives
**Agent:** @heydon-pickering
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

This task implements layout primitives based on the Every Layout methodology. Instead of pixel-perfect layouts with arbitrary breakpoints, intrinsic layouts let content and context determine the layout behavior. Each primitive (Stack, Sidebar, Switcher, Cover, Center, Cluster, Frame) solves a specific layout problem using CSS that adapts to its content and container. These primitives compose together to create complex, responsive layouts without media queries.

Intrinsic layouts are inherently more accessible than fixed-breakpoint layouts because they adapt to the actual content and container rather than assuming specific viewport widths. They handle zoom, text resizing, and container size changes gracefully without requiring additional code.

```
INPUT (layout requirements, content types, design tokens)
    ↓
[PHASE 1: ANALYSIS]
    → Identify layout needs, select appropriate primitives, define composition
    ↓
[PHASE 2: IMPLEMENTATION]
    → Build each primitive with intrinsic CSS, compose into layouts
    ↓
[PHASE 3: VALIDATION]
    → Test across viewports, content lengths, and zoom levels
    ↓
OUTPUT: Intrinsic Layout System
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| layout_requirements | list | Yes | Descriptions of layouts needed: page layouts, component layouts, content regions |
| content_types | list | Yes | Types of content the layouts will contain: text, images, forms, cards, etc. |
| design_tokens | object | Yes | Spacing, sizing, and typography tokens for the layout primitives |
| breakpoint_policy | string | No | Whether existing breakpoints should be migrated to intrinsic or coexist |

---

## Preconditions

- Design tokens for spacing and sizing are available
- Layout requirements are defined with content examples (not just wireframes)
- The team understands that intrinsic layouts adapt to content, not to viewport width
- CSS Grid and Flexbox are supported in all target browsers
- Content examples (real text, images) are available for testing layout behavior
- Performance measurement tools are available for detecting layout thrashing

---

## Steps

### Phase 1: Analysis
1. Catalog all layout patterns in the product: identify which layouts are page-level, section-level, and component-level
2. For each layout, identify the core layout problem: vertical flow (Stack), sidebar + main (Sidebar), responsive columns (Switcher), centered content (Cover/Center), wrapping items (Cluster), aspect ratio (Frame)
3. Map each layout to one or more Every Layout primitives
4. Identify compositions: which layouts combine multiple primitives (e.g., a page is a Stack of Covers and Sidebars)
5. Define the token-to-layout mapping: which spacing tokens drive each primitive's measure, gap, and threshold

### Phase 2: Implementation
1. Implement the Stack primitive: vertical flow with consistent spacing between children (uses margin-block and the lobotomized owl selector)
2. Implement the Sidebar primitive: two-panel layout where one panel has a fixed width and the other is fluid
3. Implement the Switcher primitive: horizontal layout that switches to vertical when items cannot maintain their minimum width
4. Implement the Cover primitive: vertically centered principal element with optional header and footer
5. Implement Center, Cluster, and Frame primitives: max-width centering, wrapping horizontal clusters, and aspect-ratio-locked containers
6. Create composition utilities: how primitives nest and interact with each other

### Phase 3: Validation
1. Test each primitive with varying content lengths: short text, long text, no text, images of different sizes
2. Test at continuous viewport widths (not just breakpoints): drag the browser edge and verify smooth transitions
3. Test at 200% and 400% zoom: verify no content is lost or overlapping
4. Test with dynamic content: what happens when content loads asynchronously or changes
5. Measure performance: verify no layout thrashing, paint storms, or excessive reflows
6. Test with right-to-left (RTL) text direction: verify all layouts work correctly with logical properties
7. Validate that layout primitives compose without conflicts when nested inside each other

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| layout-primitives | CSS | Complete set of Every Layout primitives as reusable CSS classes or custom elements |
| composition-guide | Markdown | How to compose primitives together for complex layouts with examples |
| token-mapping | Markdown table | Which design tokens drive which layout parameters |
| migration-guide | Markdown | How to migrate existing breakpoint-based layouts to intrinsic primitives |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| all_primitives_built | blocking | All required primitives must be implemented and tested |
| content_adaptive | blocking | Layouts must adapt to content changes without breaking |
| zoom_resilient | blocking | All layouts must work at 200% and 400% zoom without content loss |
| no_fixed_breakpoints | warning | Layouts should not rely on viewport-width media queries for core behavior |
| token_driven | warning | Layout spacing and sizing should be driven by design tokens, not hardcoded values |
| rtl_compatible | warning | All layouts should work with RTL text direction using logical properties |
| composable | warning | Layout primitives should compose without conflicts when nested |

---

## Handoff

- **On completion:** Hand to @heydon-pickering for progressive-enhance to apply progressive enhancement to the layout system
- **On completion (alt):** Hand to @micah-godbolt for documentation-plan to document layout primitives for the team
- **On completion (alt):** Hand to @jina-anne for token-architecture to verify layout tokens integrate with the token system
- **On issues:** Escalate to @design-chief
- **Dependencies:** Requires design tokens for spacing; feeds into progressive-enhance and documentation-plan

---

## Related Tasks

| Task | Relationship | Description |
|------|-------------|-------------|
| token-architecture | Upstream | Provides spacing and sizing tokens for layout primitives |
| progressive-enhance | Downstream | Applies progressive enhancement to the layout system |
| documentation-plan | Downstream | Documents layout primitives for the team |
| inclusive-audit | Parallel | Verifies layouts work with zoom, RTL, and forced colors |

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

