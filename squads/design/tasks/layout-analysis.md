# Task: Layout Pattern Analysis

**Task ID:** layout-analysis
**Version:** 1.0
**Purpose:** Analyze layout patterns including grid systems, visual hierarchy, responsive breakpoints, and whitespace usage
**Agent:** @jenifer-tidwell
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Evaluates a product's layout patterns across all pages and breakpoints: grid system consistency, visual hierarchy effectiveness, content density balance, responsive adaptation quality, and whitespace utilization. Layout is the structural foundation of usability; poor layout patterns undermine even well-designed individual components. This analysis produces actionable layout improvements grounded in established design patterns.

```
INPUT (page designs, grid system, breakpoints, content types)
    |
[PHASE 1: GRID AND STRUCTURE AUDIT]
    -> Analyze grid usage, column structure, and alignment consistency
    |
[PHASE 2: HIERARCHY AND DENSITY]
    -> Evaluate visual hierarchy, content density, and whitespace patterns
    |
[PHASE 3: RESPONSIVE EVALUATION]
    -> Assess breakpoint behavior and cross-device layout quality
    |
OUTPUT: Layout analysis report with grid audit, hierarchy assessment, and responsive recommendations
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page_designs | file[] | Yes | Design files or screenshots of key pages at all breakpoints |
| grid_system | string | Yes | Current grid system specification (columns, gutters, margins) or "none" |
| breakpoints | number[] | Yes | Responsive breakpoints in use (e.g., [320, 768, 1024, 1440]) |
| content_types | string[] | No | Types of content displayed (text-heavy, media-rich, data-tables, dashboards) |
| design_tokens | file | No | Spacing and layout tokens currently defined in the design system |

---

## Preconditions

- Page designs are available at a minimum of 2 breakpoints (mobile and desktop)
- The current grid system (or lack thereof) can be described
- At least 5 different page types are available for analysis to identify patterns
- Content is representative of real production content (not placeholder lorem ipsum)

---

## Steps

### Phase 1: Grid and Structure Audit
1. Document the current grid system: number of columns, gutter width, margin width, maximum content width, column behavior (fixed vs fluid)
2. Overlay the grid on each page design to check alignment compliance:
   - Do content blocks snap to column boundaries?
   - Are gutters consistent across all pages?
   - Are margins consistent between pages and the grid definition?
3. Identify grid violations: elements that break the grid, inconsistent column spans, mixed grid systems on the same page
4. Analyze column usage patterns: which column configurations are most common (full-width, 2/3 + 1/3, equal halves, equal thirds)
5. Evaluate the maximum content width: is it appropriate for the content type (reading text: 600-800px measure, dashboards: wider)
6. Check vertical rhythm: do elements follow a consistent baseline grid or spacing scale
7. Document nested grids: sub-grids within main grid columns (cards grids, gallery grids) and their relationship to the parent grid

### Phase 2: Visual Hierarchy and Content Density
1. For each page, identify the visual hierarchy: what draws the eye first (F-pattern or Z-pattern), what is the primary action, what is secondary
2. Evaluate hierarchy effectiveness using the squint test: when blurred, does the page structure still communicate priority?
3. Analyze heading hierarchy: is there a clear h1 -> h2 -> h3 progression, are heading levels skipped
4. Measure content density: ratio of content area to whitespace on each page
5. Compare density across pages: are data-heavy pages (tables, dashboards) appropriately denser than content pages (articles, landing pages)?
6. Evaluate whitespace usage:
   - **Macro whitespace**: space between major sections (should create clear grouping via proximity principle)
   - **Micro whitespace**: space within components (padding, line-height, letter-spacing)
   - **Active whitespace**: deliberately empty space that draws attention or provides breathing room
7. Check for whitespace inconsistencies: similar sections with different spacing, spacing that does not follow the token scale
8. Identify layout anti-patterns: trapped whitespace (awkward gaps that appear random), rivers of white in text, cramped sections next to spacious ones

### Phase 3: Responsive Layout Evaluation
1. Walk through each page at every defined breakpoint and document how the layout adapts:
   - Column count changes (e.g., 4 columns at desktop -> 2 at tablet -> 1 at mobile)
   - Element reflow behavior (side-by-side to stacked)
   - Content visibility changes (elements hidden on mobile, expanded on desktop)
2. Evaluate breakpoint selection: are breakpoints based on content needs or arbitrary device widths
3. Check for responsive anti-patterns:
   - Horizontal scrolling at any breakpoint
   - Content overflow causing layout breaks
   - Touch targets too small on mobile (below 44px)
   - Text too small to read without zooming on mobile
4. Assess fluid vs fixed behavior between breakpoints: does the layout scale smoothly or jump between states
5. Evaluate image and media responsiveness: aspect ratio maintenance, resolution switching, art direction changes
6. Check layout consistency: does the visual hierarchy remain clear at every breakpoint, do primary actions stay prominent on mobile
7. Propose layout improvements: specific grid changes, breakpoint adjustments, reflow optimizations, and spacing corrections
8. Create a layout token recommendation: standardized spacing scale, grid tokens, and breakpoint tokens if they do not already exist

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| grid-audit | markdown | Grid system analysis with compliance rate and violation details |
| hierarchy-assessment | markdown | Visual hierarchy evaluation for each page type with effectiveness ratings |
| density-report | markdown | Content density and whitespace analysis with measurements |
| responsive-evaluation | markdown | Breakpoint behavior review with anti-patterns and recommendations |
| layout-tokens | markdown table | Recommended spacing scale, grid tokens, and breakpoint definitions |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Grid documentation | blocking | Current grid system must be fully documented with measurements |
| Multi-breakpoint review | blocking | Every page must be evaluated at a minimum of mobile and desktop breakpoints |
| Hierarchy assessment | blocking | Visual hierarchy must be evaluated for the primary entry page and at least 3 interior pages |
| Whitespace analysis | warning | Macro and micro whitespace must be measured and compared against the spacing scale |
| Anti-pattern identification | warning | Known layout anti-patterns must be explicitly checked and reported |
| Token recommendations | warning | Spacing and grid tokens should be proposed if they do not exist |

---

## Handoff

- **On completion:** Hand to @brad-frost for grid and layout component updates in the design system
- **On responsive component needs:** Hand to @nathan-curtis for component responsive specification
- **On accessibility layout concerns:** Hand to @stephanie-walter for reading order and landmark analysis
- **On content organization:** Hand to @jenifer-tidwell (navigation-analysis) for information architecture alignment
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

