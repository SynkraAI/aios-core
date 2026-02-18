# Checklist: Layout Review

**ID:** layout-review
**Version:** 1.0
**Purpose:** Reviews layout quality covering visual hierarchy, grid consistency, whitespace balance, responsive breakpoints, content density, and reading flow
**Agent:** @jenifer-tidwell
**Quality Gate:** WARNING

---

## Prerequisites

- [ ] Layout design has been finalized in the design tool with responsive variants
- [ ] Grid system and spacing tokens have been defined
- [ ] Typography scale and hierarchy have been established
- [ ] Target breakpoints have been agreed upon

---

## Section 1: Visual Hierarchy

- [ ] Most important content is visually dominant (larger, bolder, higher on page)
- [ ] Heading levels create a clear document outline (h1 > h2 > h3)
- [ ] Primary actions are visually distinguished from secondary and tertiary actions
- [ ] Color, size, and weight are used consistently to indicate importance
- [ ] Grouping by proximity communicates related content
- [ ] Visual hierarchy is maintained across all breakpoints
- [ ] Hierarchy does not rely solely on color (size, weight, and position also used)

## Section 2: Grid Consistency

- [ ] Layout follows the defined grid system (12-column, 8-column, or custom)
- [ ] Column widths and gutters are consistent across pages
- [ ] Content aligns to grid columns — no arbitrary off-grid positioning
- [ ] Grid is responsive and adapts column count at breakpoints
- [ ] Sidebar and main content ratio is consistent across similar page types
- [ ] Full-bleed or breakout elements are intentional and documented
- [ ] Grid system uses spacing tokens rather than arbitrary pixel values

## Section 3: Whitespace Balance

- [ ] Margins between major sections are consistent and use spacing tokens
- [ ] Padding within containers is uniform and follows the spacing scale
- [ ] Whitespace between related elements is smaller than between unrelated ones
- [ ] No cramped areas where content is too close together
- [ ] No excessive empty space that creates disconnection between related content
- [ ] Whitespace is consistent across all pages of the same type
- [ ] Vertical rhythm (baseline grid alignment) is maintained for text blocks

## Section 4: Responsive Breakpoints

- [ ] Layout works at the smallest supported viewport (320px)
- [ ] Layout transitions smoothly at the defined breakpoints (sm, md, lg, xl)
- [ ] No content is hidden or lost between breakpoints
- [ ] Column stacking order is logical on narrow viewports
- [ ] Images and media scale proportionally
- [ ] Tables adapt gracefully (horizontal scroll, stacking, or progressive disclosure)
- [ ] No layout shifts or jumps occur during browser resizing

## Section 5: Content Density

- [ ] Information density is appropriate for the use case (data-heavy vs marketing)
- [ ] Users are not overwhelmed by too many elements on a single screen
- [ ] Progressive disclosure hides secondary information behind expand/collapse
- [ ] Data tables have appropriate row height and cell padding
- [ ] Card layouts balance content preview with readability
- [ ] Scrolling is reasonable — critical content is above the fold
- [ ] Density options (compact, comfortable, spacious) exist where applicable

## Section 6: Reading Flow

- [ ] Content follows the natural reading pattern (F-pattern for scanning, Z-pattern for landing)
- [ ] Left-to-right, top-to-bottom flow is not disrupted by layout elements
- [ ] Line length for body text is 45-75 characters for optimal readability
- [ ] Multi-column text layouts do not confuse the reading order
- [ ] Tab order matches the visual reading order
- [ ] Floating elements and sidebars do not interrupt primary content flow
- [ ] Call-to-action placement follows the natural conclusion of the reading path

---

## Scoring

| Category | Items | Pass | Status |
|----------|-------|------|--------|
| Visual Hierarchy | 7 | _ | PENDING |
| Grid Consistency | 7 | _ | PENDING |
| Whitespace Balance | 7 | _ | PENDING |
| Responsive Breakpoints | 7 | _ | PENDING |
| Content Density | 7 | _ | PENDING |
| Reading Flow | 7 | _ | PENDING |

**Minimum passing score:** 80%
**Blocking items:** Visual Hierarchy and Responsive Breakpoints must all pass
