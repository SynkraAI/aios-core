# Design Squad — Shared Glossary

> **Purpose:** Central reference for domain terms used across design squad tasks.
> **Usage:** Tasks reference this file via `> Glossary: see [design-glossary](../data/design-glossary.md)`

---

## Design System & Architecture

| Term | Definition |
|------|-----------|
| **Design tokens** | Platform-agnostic key-value pairs encoding design decisions (colors, spacing, typography). The atomic unit of a design system. |
| **Design language** | The shared set of visual rules, principles, and vocabulary that define a product's identity. |
| **Pattern library** | Organized collection of reusable UI patterns with documentation and usage guidelines. |
| **Component API** | The props interface that defines how a component is configured and consumed by other code. |
| **Shared vocabulary** | Team-aligned naming conventions ensuring designers and developers use the same terms. |
| **Design system** | The complete set of tokens, components, patterns, guidelines, and tooling that ensure UI consistency at scale. |

## Atomic Design

| Term | Definition |
|------|-----------|
| **Atoms** | Smallest UI building blocks that cannot be broken down further (button, icon, label, input). |
| **Molecules** | Combinations of atoms forming a functional unit (search bar = input + button + icon). |
| **Organisms** | Complex components composed of molecules and atoms (header, sidebar, card grid). |
| **Templates** | Page-level layouts composed of organisms, defining content structure without real data. |
| **Pages** | Templates populated with real content, representing the final user-facing UI. |
| **Atomic decomposition** | The process of breaking existing UI into atoms, molecules, and organisms. |
| **Barrel export** | An `index.ts` file that re-exports component modules for cleaner import paths. |

## Design Tokens — Technical

| Term | Definition |
|------|-----------|
| **Global (primitive) tokens** | Raw values with no semantic meaning (e.g., `color.blue.500: #3B82F6`). The foundation layer. |
| **Alias (semantic) tokens** | Purpose-driven tokens referencing globals (e.g., `color.action.primary` → `{color.blue.500}`). |
| **Component tokens** | Tokens scoped to a specific component (e.g., `button.color.background` → `{color.action.primary}`). |
| **CTI (Category-Type-Item)** | Token naming taxonomy: Category (color), Type (background), Item (primary). |
| **DTCG** | Design Tokens Community Group — W3C specification for interoperable token format. |
| **Style Dictionary** | Build tool that transforms token source files (JSON/YAML) into platform-specific outputs. |
| **Token reference (alias)** | A token whose value points to another token rather than a raw value. |
| **Token coverage** | Percentage of original hardcoded values replaced by tokens. Target: >95%. |
| **Semantic naming** | Naming tokens by purpose (primary, error) rather than description (blue-500, red-600). |
| **Token graph** | Visualization of all token relationships to detect circular dependencies or orphans. |

## Accessibility (a11y)

| Term | Definition |
|------|-----------|
| **WCAG 2.2** | Web Content Accessibility Guidelines v2.2 — standard for web accessibility (Levels A, AA, AAA). |
| **ARIA** | Accessible Rich Internet Applications — HTML attributes that convey semantics to assistive technology. |
| **Accessible name** | The label that assistive tech announces for an element (via `aria-label`, `aria-labelledby`, or content). |
| **Live region** | ARIA area (`aria-live`) that announces dynamic content changes to screen readers. |
| **Semantic HTML** | Using native HTML elements (`<button>`, `<nav>`, `<main>`) instead of generic `<div>`s for accessibility. |
| **Focus trap** | A UI region where keyboard focus is intentionally confined (modals) or accidentally stuck. |
| **Focus indicator** | Visible mark showing which element currently has keyboard focus (outline, ring, box-shadow). |
| **Tab order** | Sequence in which the Tab key moves focus through interactive elements on a page. |
| **Screen reader** | Assistive technology that reads page content aloud for visually impaired users. |
| **Contrast ratio** | Numerical measure of foreground/background color difference (e.g., 4.5:1 for AA text). |
| **APCA** | Advanced Perceptual Contrast Algorithm — modern perceptual contrast measurement replacing WCAG ratio. |
| **Landmark** | ARIA role or HTML5 element (`<nav>`, `<main>`, `<aside>`) that helps screen reader users navigate page regions. |

## CSS & Frontend

| Term | Definition |
|------|-----------|
| **CSS custom properties** | CSS variables (`--color-primary: #0066CC`) used for runtime theming and token delivery. |
| **Tailwind CSS** | Utility-first CSS framework where styles are applied via classes (`flex`, `text-center`, `p-4`). |
| **CUBE CSS** | Methodology: Composition, Utility, Block, Exception — a progressive layering approach to CSS. |
| **Utility classes** | Single-purpose CSS classes (e.g., `flex`, `mt-4`, `text-lg`) composed in HTML. |
| **CSS Modules** | Scoped CSS approach where class names are locally scoped to prevent naming collisions. |
| **BEM** | Block-Element-Modifier — CSS naming convention (`.card`, `.card__title`, `.card--featured`). |
| **@layer** | CSS cascade layer (`@layer base, components, utilities`) for organizing style precedence. |
| **OKLCH** | Perceptual color space (Lightness, Chroma, Hue) for better color token interoperability. |
| **HSL** | Hue-Saturation-Lightness — color model used for perceptual color clustering in audits. |

## Process & Workflow

| Term | Definition |
|------|-----------|
| **Design audit** | Systematic review of current UI code/design to catalog patterns, tokens, and quality issues. |
| **Pattern consolidation** | Merging similar UI patterns to reduce redundancy and establish canonical versions. |
| **Token extraction** | Deriving design tokens from consolidated patterns (colors, spacing, typography). |
| **Migration strategy** | Plan for transitioning existing hardcoded values to a token-based system. |
| **Greenfield** | Starting a design system from scratch with no existing codebase constraints. |
| **Brownfield** | Integrating a design system into an existing codebase with legacy code. |
| **Interface inventory** | Cataloging every unique UI element across an application to identify inconsistencies. |
| **State file (.state.yaml)** | Progress tracking file used by design squad tools to record audit/extraction state. |

## Component Patterns

| Term | Definition |
|------|-----------|
| **Variant** | A named style variation of a component (e.g., button: primary, secondary, destructive). |
| **Component state** | Interactive state of a component: default, hover, active, focus, disabled, error, loading. |
| **Composition** | Building larger components by combining smaller ones (molecules from atoms). |
| **Storybook** | Visual component development environment for building, documenting, and testing UI components in isolation. |
| **Props** | The typed input parameters that configure a component's appearance and behavior. |

---

> **Maintained by:** Design Squad
> **Last updated:** 2026-02-15
