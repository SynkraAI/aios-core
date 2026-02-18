# Task: Implement Design Tokens in CSS

**Task ID:** css-tokens
**Version:** 1.0
**Purpose:** Implement design tokens as CSS custom properties with fluid type scales, spacing scales, and color schemes
**Agent:** @andy-bell
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Bridges the gap between abstract design tokens and their CSS implementation using custom properties. This task transforms token definitions (from JSON, YAML, or design tool exports) into a robust CSS custom property system with fluid type scales using `clamp()`, modular spacing scales, semantic color schemes with light/dark mode support, and responsive token variants. The result is a single source of truth in CSS that the entire stylesheet references.

```
INPUT (token definitions, platform requirements, theming needs)
    |
[PHASE 1: TOKEN ANALYSIS]
    -> Parse token definitions, categorize, identify fluid and static tokens
    |
[PHASE 2: CSS IMPLEMENTATION]
    -> Transform tokens to custom properties with fluid calculations and theming
    |
[PHASE 3: INTEGRATION AND TESTING]
    -> Wire tokens into the stylesheet, test across contexts, document API
    |
OUTPUT: CSS custom property system with fluid scales, theming, and documentation
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| token_source | file | Yes | Token definitions file (JSON, YAML, or Style Dictionary format) |
| platform | enum(web, web+native, multi) | Yes | Target platform(s) for token output |
| theming_needs | enum(none, light-dark, multi-theme) | Yes | Theming requirements for the token system |
| viewport_range | string | No | Min and max viewport for fluid calculations; defaults to "320px-1440px" |
| type_scale_ratio | number | No | Ratio for modular type scale; defaults to 1.25 (Major Third) |
| space_scale_ratio | number | No | Ratio for spacing scale; defaults to 1.5 |

---

## Preconditions

- Token definitions exist in a structured, parseable format
- Design decisions for color palette, type scale, and spacing are finalized
- The team understands CSS custom properties and their inheritance model
- Browser support requirements are compatible with custom properties and `clamp()`
- A CSS build pipeline exists for any needed preprocessing (PostCSS, Sass, etc.)
- Theming requirements (light/dark, multi-brand) are defined and agreed upon
- Accessibility contrast requirements are specified (WCAG AA or AAA)

---

## Steps

### Phase 1: Token Analysis and Planning
1. Parse the token source file and categorize all tokens: color (primitive, semantic, component), typography (family, size, weight, leading, tracking), spacing (scale steps), sizing (containers, measures), elevation (shadows), border (radius, width), motion (duration, easing)
2. Identify which tokens should be fluid (respond to viewport): typically typography sizes and some spacing values
3. Identify which tokens should be theme-aware (change between light/dark or multiple themes): typically colors and shadows
4. Map token naming to CSS custom property naming convention: `--color-primary`, `--size-step-3`, `--space-m`
5. Plan the token hierarchy: global tokens (primitives) feed into semantic tokens, which feed into component tokens
6. Identify token dependencies: tokens that reference other tokens and need proper cascade ordering

### Phase 2: CSS Custom Property Implementation
1. **Color tokens**: Implement primitive color tokens as raw values, semantic tokens as references to primitives, and component tokens as references to semantic tokens; use `color-mix()` where appropriate for tints and shades
2. **Light/dark theming**: Implement theme switching using `prefers-color-scheme` media query and a `[data-theme]` attribute override; structure semantic color tokens to change values per theme
3. **Fluid type scale**: Calculate `clamp()` values for each type scale step using the viewport range and type scale ratio; produce a scale from `-2` to `+5` (or as defined by tokens)
4. **Spacing scale**: Implement the spacing scale as custom properties; use fluid values for larger spacing steps and static values for smaller steps
5. **Elevation tokens**: Implement shadow tokens that adjust between themes (lighter shadows in light mode, subtle glows or deeper shadows in dark mode)
6. **Motion tokens**: Implement duration and easing custom properties; include a `prefers-reduced-motion` media query that overrides durations to near-zero
7. **Container and measure tokens**: Set max-width, measure (line length), and container sizing tokens

### Phase 3: Integration and Testing
1. Wire the token custom properties into the existing stylesheet: replace all hardcoded values with custom property references
2. Test theme switching: verify all color tokens update correctly between light and dark themes
3. Test fluid behavior: verify type scale and spacing respond smoothly across the full viewport range
4. Test custom property inheritance: verify tokens cascade correctly through nested components
5. Validate accessibility: ensure all color combinations meet WCAG AA contrast in both themes
6. Document the token API: full reference of all custom properties with their values, categories, and usage context
7. Create a token visualization page: a living document that renders all tokens with their current values

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| token_stylesheet | CSS file | Complete custom property system with all token categories |
| fluid_calculations | CSS file | Fluid type and spacing scale calculations with `clamp()` values |
| theme_definitions | CSS file | Theme-specific token overrides for light/dark and any additional themes |
| contrast_report | markdown | Accessibility contrast check results for all color token combinations |
| token_reference | markdown | Full API documentation for all custom properties |
| token_visualization | HTML + CSS | Living document showing all tokens rendered with current values |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Token completeness | blocking | Every token from the source definition must have a corresponding CSS custom property |
| No hardcoded values | blocking | The resulting stylesheet must not contain any hardcoded color, size, or spacing values |
| Theme functionality | blocking | Theme switching must correctly update all semantic and component tokens |
| Fluid scale accuracy | warning | Fluid type scale values must match the intended ratio at both viewport extremes |
| Accessibility compliance | warning | All color token combinations intended for text must meet WCAG AA contrast |
| Fallback coverage | warning | Critical custom properties should include fallback values for graceful degradation |

---

## Handoff

- **On completion:** Hand to @andy-bell utility-system task for generating utility classes from implemented tokens
- **On design direction review:** Hand to @dan-mall for visual validation of fluid scales and color schemes
- **On component integration:** Hand to @brad-frost for wiring tokens into component architecture
- **On accessibility concerns:** Coordinate with @stephanie-walter for contrast and color accessibility review
- **On issues:** Escalate to @design-chief

---

## Glossary

> Full glossary: [design-glossary.md](../data/design-glossary.md)

**Key terms for this task:**

- **Global (primitive) tokens** — Raw values with no semantic meaning (e.g., `color.blue.500`)
- **Alias (semantic) tokens** — Purpose-driven tokens referencing globals (e.g., `color.action.primary`)
- **Component tokens** — Tokens scoped to a specific component
- **CTI** — Category-Type-Item naming taxonomy for tokens
- **DTCG** — Design Tokens Community Group W3C specification
- **Semantic naming** — Naming by purpose (primary) not description (blue-500)

---

## Don't Do

- Do not create tokens with descriptive names (blue-500) — use semantic names (primary, error, surface)
- Do not reference tokens upward (global referencing alias) — token references must flow downward only
- Do not skip the alias layer — jumping from global directly to component tokens breaks theming
- Do not use raw hex/rgb values in components when a token exists
- Do not export tokens without validating syntax in each format (CSS, JSON, SCSS, Tailwind)
- Do not create circular token references — always validate the token graph

