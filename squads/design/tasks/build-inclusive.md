# Task: Build Inclusive Component

**Task ID:** build-inclusive
**Version:** 1.0
**Purpose:** Builds an accessible component from scratch using inclusive design methodology: content-first, progressive enhancement, and ARIA patterns
**Agent:** @heydon-pickering
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

This task guides the creation of a component from scratch using inclusive design methodology. Instead of building a visual component and then bolting on accessibility, this approach starts with content and semantics, layers visual design, and enhances with JavaScript. The result is a component that works for the widest possible range of users by default, rather than as an afterthought. This methodology follows Heydon Pickering's "Inclusive Components" approach.

Building inclusively from the start is fundamentally cheaper and more effective than retrofitting accessibility after the fact. When you start with semantic HTML and layer enhancements, the baseline is always accessible, and the enhanced version inherits that foundation naturally.

```
INPUT (component spec, content model, interaction requirements)
    ↓
[PHASE 1: CONTENT FIRST]
    → Define content structure, choose semantic HTML, establish baseline
    ↓
[PHASE 2: ENHANCEMENT]
    → Layer CSS for visual design, add JS for enhanced interactions
    ↓
[PHASE 3: VALIDATION]
    → Test across assistive technologies, verify WCAG compliance
    ↓
OUTPUT: Inclusive Component Implementation
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| component_spec | object | Yes | Component requirements: what it does, content it displays, interactions it supports |
| content_model | object | Yes | The data/content the component presents: text, media, actions, metadata |
| interaction_requirements | list | Yes | Required interactions: click, hover, keyboard shortcuts, drag, etc. |
| design_tokens | object | No | Tokens to use for styling the component |
| aria_pattern | string | No | Known APG pattern to follow (e.g., "dialog", "tabs", "combobox") |

---

## Preconditions

- Component requirements are well-defined with clear use cases
- Content model is understood — what data flows through this component
- The design system's token architecture is available for styling
- Target browsers and assistive technologies are defined
- The design system's inclusive audit findings are available if a similar component was previously audited
- Team has access to screen readers (NVDA, VoiceOver) for testing during development

---

## Steps

### Phase 1: Content First
1. Define the content hierarchy: what is the most important content, what is secondary, what is metadata
2. Choose semantic HTML elements: use the most meaningful element for each content piece (headings, lists, buttons, time, etc.)
3. Build the baseline HTML structure: this should be fully functional with zero CSS and zero JavaScript
4. Test the baseline: can a user understand the content and complete the core task with only HTML rendering?
5. Define the accessible name strategy: how each interactive element gets its accessible name (visible label, aria-label, aria-labelledby)

### Phase 2: Enhancement
1. Layer CSS for layout: use intrinsic design (flexbox/grid) that adapts to content and viewport without fixed breakpoints
2. Layer CSS for visual design: apply design tokens for color, typography, spacing, and elevation
3. Add progressive enhancement JavaScript: enhance interactions that cannot be achieved with HTML/CSS alone
4. Implement keyboard interaction patterns: follow WAI-ARIA APG patterns for the component type
5. Add ARIA attributes only where HTML semantics are insufficient — document why each ARIA attribute is necessary

### Phase 3: Validation
1. Test without CSS: verify content is still readable and functional (content order makes sense)
2. Test without JavaScript: verify core functionality works (forms submit, links navigate, content is visible)
3. Test with keyboard only: verify all interactions are reachable and operable via keyboard
4. Test with screen reader: verify announcements are meaningful, states are communicated, interactions are discoverable
5. Test with magnification (200% and 400%): verify no content is lost or overlapping
6. Verify prefers-reduced-motion is respected: animations must be suppressible
7. Test with Windows High Contrast Mode: verify component is usable with forced colors

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| component-html | HTML | Semantic HTML structure with progressive enhancement |
| component-css | CSS | Styles using design tokens with intrinsic layout |
| component-js | JavaScript | Enhancement JavaScript with keyboard and ARIA support |
| accessibility-notes | Markdown | Documentation of accessibility decisions, ARIA usage rationale, testing results |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| html_baseline | blocking | Component must be functional with only HTML — no CSS or JS required for core function |
| semantic_elements | blocking | Every content piece must use the most semantically appropriate HTML element |
| keyboard_complete | blocking | All interactions must be fully operable via keyboard |
| screen_reader_verified | blocking | Screen reader testing must confirm meaningful announcements and state changes |
| aria_justified | warning | Every ARIA attribute must have documented justification for why native HTML is insufficient |
| reduced_motion | warning | prefers-reduced-motion must be respected for all animations |
| high_contrast | warning | Component must be usable in Windows High Contrast Mode |

---

## Handoff

- **On completion:** Hand to @micah-godbolt for testing-strategy to create automated tests for the component
- **On completion (alt):** Hand to @jina-anne for token-architecture to verify correct token usage
- **On completion (alt):** Hand to @micah-godbolt for documentation-plan to document the inclusive component for other developers
- **On issues:** Escalate to @design-chief
- **Dependencies:** Benefits from inclusive-audit findings; feeds into testing-strategy and documentation-plan

---

## Related Tasks

| Task | Relationship | Description |
|------|-------------|-------------|
| inclusive-audit | Upstream | Provides findings to guide inclusive construction |
| aria-patterns | Parallel | Provides ARIA patterns for complex interactive components |
| testing-strategy | Downstream | Creates automated tests for the inclusive component |
| documentation-plan | Downstream | Documents the inclusive component for other developers |

---

## Glossary

> Full glossary: [design-glossary.md](../data/design-glossary.md)

**Key terms for this task:**

- **WCAG 2.2** — Web Content Accessibility Guidelines (Levels A, AA, AAA)
- **ARIA** — Accessible Rich Internet Applications attributes for assistive technology
- **Accessible name** — The label assistive tech announces (via aria-label, content, etc.)
- **Focus trap** — UI region where keyboard focus is confined (intentional in modals, accidental is a bug)
- **Contrast ratio** — Foreground/background color difference measure (4.5:1 for AA text)
- **Landmark** — ARIA role or HTML5 element (`<nav>`, `<main>`) for screen reader navigation

---

## Don't Do

- Do not use `outline: none` without providing a visible alternative focus indicator
- Do not use positive `tabIndex` values (1, 2, 3) — they break natural tab order
- Do not use `<div onClick>` for interactive elements — use `<button>` or add role + keyboard handlers
- Do not rely on color alone to convey information — always provide a secondary indicator (icon, text)
- Do not suppress ARIA roles when native HTML semantics already provide them (e.g., `role="button"` on `<button>`)
- Do not skip keyboard testing — mouse-only testing misses critical accessibility barriers

