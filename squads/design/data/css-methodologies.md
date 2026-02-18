# CSS Methodologies Comparison

**ID:** css-methodologies
**Version:** 1.0
**Purpose:** Comprehensive reference comparing CSS architecture approaches for design system implementation
**Maintained By:** @micah-godbolt

---

## BEM (Block Element Modifier)

**Principles:** Classes mirror component structure: Block, Element, Modifier.
**Naming:** `.block__element--modifier` (e.g., `.card__title--highlighted`)
**File Structure:** One file per block component (e.g., `card.css`, `nav.css`).
**Strengths:** Clear naming, low specificity, framework-agnostic.
**Weaknesses:** Verbose class names, no file organization or layout guidance.
**Best For:** Medium-to-large teams, component-based design systems.

## SMACSS (Scalable and Modular Architecture for CSS)

**Principles:** Categorize rules into Base, Layout, Module, State, Theme.
**Naming:** Prefixes by category: `l-` (layout), `is-` (state), `theme-` (theme).
**File Structure:** `base/`, `layout/`, `modules/`, `state/`, `theme/`.
**Strengths:** Clear architectural guidance, separation of concerns, built-in theming.
**Weaknesses:** Categories can feel arbitrary, state classes conflict with JS frameworks.
**Best For:** Large apps with multiple themes, teams transitioning from unstructured CSS.

## OOCSS (Object-Oriented CSS)

**Principles:** Separate structure from skin, container from content. Reusable visual patterns.
**Naming:** No strict convention. Classes describe patterns (`.media`, `.flag`, `.island`).
**File Structure:** Shared object library; skins as separate stylesheets.
**Strengths:** Maximum reuse, small file size, foundational to modern methodologies.
**Weaknesses:** Requires discipline, no strict naming leads to inconsistency.
**Best For:** Performance-critical projects, teams comfortable with abstract patterns.

## ITCSS (Inverted Triangle CSS)

**Principles:** Layers of increasing specificity: Settings > Tools > Generic > Elements > Objects > Components > Utilities.
**Naming:** Typically combined with BEM. Layer names define file organization.
**File Structure:** `settings/`, `tools/`, `generic/`, `elements/`, `objects/`, `components/`, `utilities/`.
**Strengths:** Eliminates specificity wars, scales well, combines with BEM/SMACSS.
**Weaknesses:** 7 layers to learn, over-engineered for small projects.
**Best For:** Design systems needing strict specificity control, large multi-contributor apps.

## CUBE CSS (Composition Utility Block Exception)

**Principles:** Leverage the cascade. Composition for layout, Utility for one-off styles, Block for components, Exception for state.
**Naming:** Blocks use descriptive names. Exceptions use `data-` attributes.
**File Structure:** `compositions/`, `utilities/`, `blocks/`, `exceptions/`.
**Strengths:** Embraces the cascade, works with custom properties, minimal tooling.
**Weaknesses:** Smaller community, can feel loose compared to BEM.
**Best For:** Modern CSS projects, teams preferring semantic HTML with minimal classes.

## Atomic CSS / Utility-First (Tailwind CSS)

**Principles:** One class per CSS property-value pair. Compose styles in HTML.
**Naming:** Property shorthand: `text-lg`, `bg-blue-500`, `flex`, `p-4`.
**File Structure:** Single config file (e.g., `tailwind.config.js`). No component CSS files.
**Strengths:** Near-zero CSS growth, consistent scales, no naming decisions.
**Weaknesses:** Verbose HTML, requires PurgeCSS, harder to read for non-users.
**Best For:** Rapid prototyping, component frameworks (React, Vue), utility-driven tokens.

## CSS Modules

**Principles:** Scoped CSS per component via build tooling. Class names hashed for uniqueness.
**Naming:** Standard classes in source (`.title`). Build generates `.title_abc123`.
**File Structure:** Co-located: `Button.module.css` alongside `Button.jsx`.
**Strengths:** True scope isolation, standard CSS syntax, no runtime cost.
**Weaknesses:** Requires bundler, hard to share styles across components.
**Best For:** React/Vue/Svelte projects, teams wanting isolation without CSS-in-JS runtime.

## CSS-in-JS (Styled Components, Emotion)

**Principles:** CSS written in JS/TS files. Styles co-located with logic, use props and theme context.
**Naming:** No CSS classes. `const Button = styled.button`.
**File Structure:** Styles inside component files. Theme in shared module.
**Strengths:** Full JS power, auto-scoping, dead code elimination, TypeScript support.
**Weaknesses:** Runtime performance cost, larger bundles, SSR complexity.
**Best For:** React design systems with dynamic theming, complex theme requirements.

---

## Comparison Matrix

| Criteria | BEM | SMACSS | OOCSS | ITCSS | CUBE | Atomic | Modules | CSS-in-JS |
|----------|-----|--------|-------|-------|------|--------|---------|-----------|
| **Scalability** | High | High | Med | Very High | High | High | High | High |
| **Learning Curve** | Low | Med | Med | High | Med | Low | Low | Med |
| **Tooling Required** | None | None | None | None | None | Build | Bundler | Runtime |
| **DS Compatibility** | Excellent | Good | Good | Excellent | Good | Good | Excellent | Excellent |
| **Specificity Control** | Good | Good | Med | Excellent | Good | Excellent | Excellent | Excellent |
| **Framework Dependency** | None | None | None | None | None | Config | Bundler | JS framework |
| **CSS File Size** | Med | Med | Small | Med | Small | V. Small | Med | Zero (RT) |
| **Team Onboarding** | Easy | Med | Med | Hard | Med | Easy | Easy | Med |

---

## Decision Guide

| Project Type | Primary | Secondary | Rationale |
|-------------|---------|-----------|-----------|
| **New design system** | ITCSS + BEM | Utility layer | Layered specificity + clear naming |
| **React/Vue component lib** | CSS Modules or CSS-in-JS | BEM within modules | Scoping aligns with component model |
| **Rapid prototype** | Tailwind (Utility-first) | None needed | Speed over architecture |
| **Large enterprise app** | ITCSS + BEM | SMACSS state classes | Maximum scalability and control |
| **Static marketing site** | CUBE CSS | Utility classes | Lightweight, cascade-friendly |
| **Legacy CSS refactor** | BEM | SMACSS categories | Incremental adoption, clear migration |
| **Multi-brand theming** | CSS-in-JS or ITCSS | SMACSS theme layer | Theme context and token management |

---

## Design System Integration Notes

- **Token mapping:** BEM, ITCSS, and CUBE map well to design tokens at the Settings/Composition layer.
- **Component libraries:** CSS Modules and CSS-in-JS provide the best isolation for published packages.
- **Multi-framework:** BEM and ITCSS are framework-agnostic — ideal when serving React, Angular, and vanilla HTML.
- **Migration path:** Start with BEM naming, layer in ITCSS architecture, add utilities for spacing/layout.
- **Documentation:** All methodologies work with Storybook; utility-first benefits from a token reference page.

---

## References

- Harry Roberts, "ITCSS: Scalable and Maintainable CSS Architecture"
- Andy Bell, "CUBE CSS" (cube.fyi)
- Nicole Sullivan, "Object-Oriented CSS" (stubbornella.org)
- Jonathan Snook, "Scalable and Modular Architecture for CSS" (smacss.com)
- Adam Wathan, "CSS Utility Classes and Separation of Concerns"
- Micah Godbolt, "Frontend Architecture for Design Systems" (O'Reilly)
