# Checklist: CSS Quality Review

**ID:** css-review
**Version:** 1.0
**Purpose:** Reviews CSS quality covering CUBE methodology layers, specificity control, custom properties usage, magic number elimination, fluid/intrinsic responsiveness, and token-based utilities
**Agent:** @andy-bell
**Quality Gate:** WARNING

---

## Prerequisites

- [ ] CSS methodology (CUBE CSS or equivalent) has been agreed upon
- [ ] Design tokens are available as CSS custom properties
- [ ] Build pipeline processes CSS correctly (PostCSS, Sass, or native)
- [ ] Browser support targets have been defined

---

## Section 1: CUBE Layers Separation

- [ ] Composition layer handles layout and spatial arrangement (grid, flex, flow)
- [ ] Utility layer applies single-purpose, token-based classes (e.g., .text-sm, .gap-md)
- [ ] Block layer encapsulates component-specific styling with clear boundaries
- [ ] Exception layer handles state variations via data attributes or modifier classes
- [ ] Layers do not bleed into each other (composition does not handle color, blocks do not handle layout)
- [ ] Global styles (resets, base typography) are separated from component styles
- [ ] CSS is organized in files that reflect the CUBE structure

## Section 2: Specificity Control

- [ ] Maximum specificity is kept to one class selector where possible
- [ ] No use of !important except in utility classes by deliberate design
- [ ] No ID selectors in component styles
- [ ] Nesting is limited to 2 levels maximum (parent > child)
- [ ] Selector chains do not exceed 3 parts (e.g., .card .header .title is the maximum)
- [ ] CSS Cascade Layers (@layer) are used to manage specificity where supported
- [ ] Specificity conflicts are resolved through architecture, not brute force

## Section 3: Custom Properties Usage

- [ ] Design tokens are consumed as CSS custom properties (--color-brand-primary)
- [ ] Component-level custom properties provide a public API for theming
- [ ] Fallback values are provided for custom properties where appropriate
- [ ] Custom property naming follows a consistent convention (--component-property)
- [ ] Global custom properties are defined on :root or a design system scope
- [ ] Custom properties are used for theme switching (light/dark mode)
- [ ] No redundant custom properties that duplicate existing tokens

## Section 4: No Magic Numbers

- [ ] All spacing values come from the spacing scale tokens
- [ ] All font sizes come from the type scale tokens
- [ ] All color values come from the color tokens
- [ ] All border widths, radii, and shadows use token values
- [ ] No arbitrary pixel values (e.g., margin: 13px, padding: 7px)
- [ ] Z-index values follow a defined scale, not arbitrary large numbers
- [ ] Transition and animation durations use timing tokens

## Section 5: Fluid and Intrinsic Responsiveness

- [ ] clamp() is used for fluid typography (e.g., font-size: clamp(1rem, 2.5vw, 2rem))
- [ ] Container-based sizing is preferred over viewport-based where supported
- [ ] Flexbox and Grid are used for intrinsic layouts (content-driven sizing)
- [ ] min() and max() are used for constraints instead of media queries where practical
- [ ] Media queries are used for layout shifts, not for incremental size changes
- [ ] Aspect-ratio property is used for media containers instead of padding hacks
- [ ] Components are responsive by default without requiring wrapper media queries

## Section 6: Utilities from Tokens

- [ ] Utility classes are generated from design tokens (not manually written)
- [ ] Utility class names reflect token names (e.g., .gap-sm maps to --spacing-sm)
- [ ] Utilities cover the core categories: spacing, color, typography, display, flex/grid
- [ ] Unused utility classes are purged in production builds
- [ ] Utility classes are documented with their token source
- [ ] Responsive utility variants exist (e.g., .md:text-lg) where needed
- [ ] Utilities are composable and do not conflict with each other

---

## Scoring

| Category | Items | Pass | Status |
|----------|-------|------|--------|
| CUBE Layers | 7 | _ | PENDING |
| Specificity Control | 7 | _ | PENDING |
| Custom Properties | 7 | _ | PENDING |
| No Magic Numbers | 7 | _ | PENDING |
| Fluid/Intrinsic | 7 | _ | PENDING |
| Utilities from Tokens | 7 | _ | PENDING |

**Minimum passing score:** 80%
**Blocking items:** Specificity Control and No Magic Numbers must all pass
