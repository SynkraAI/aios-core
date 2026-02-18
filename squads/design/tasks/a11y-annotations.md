# Task: Accessibility Annotations

**Task ID:** a11y-annotations
**Version:** 1.0
**Purpose:** Create detailed accessibility annotations for design mockups covering focus order, alt text, ARIA labels, headings, and keyboard interactions
**Agent:** @stephanie-walter
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Adds a layer of accessibility-specific annotations to design mockups before developer handoff. Annotations make invisible accessibility requirements visible: focus order, heading structure, landmark regions, alternative text, ARIA labels, and keyboard interaction expectations. Without these annotations, developers must guess at accessibility requirements, which leads to incomplete or incorrect implementations.

```
INPUT (design mockups, page context, component list)
    |
[PHASE 1: STRUCTURAL ANNOTATION]
    -> Annotate landmarks, headings, reading order, and semantic structure
    |
[PHASE 2: INTERACTIVE ANNOTATION]
    -> Annotate focus order, keyboard behaviors, and state announcements
    |
[PHASE 3: CONTENT ANNOTATION]
    -> Annotate alternative text, labels, and assistive text requirements
    |
OUTPUT: Annotated design files with complete accessibility specifications
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| design_mockups | file[] | Yes | Design files (Figma, Sketch, or screenshots) to annotate |
| page_context | string | Yes | Description of the page purpose and user flow context |
| component_list | string[] | Yes | List of design system components used on the page |
| wcag_level | enum(A, AA, AAA) | No | Target WCAG conformance level; defaults to AA |
| existing_annotations | file | No | Previous annotations to update or extend |

---

## Preconditions

- Design mockups are high-fidelity and represent the intended final design
- Interactive states (hover, focus, active, disabled) are documented in the design file
- The page is part of a known user flow so reading order and navigation context can be determined
- The annotation author has knowledge of WCAG requirements and ARIA patterns

---

## Steps

### Phase 1: Structural Annotations
1. **Landmark regions**: Identify and label all landmark regions on the page:
   - `<header>` / `banner`: page header and global navigation
   - `<nav>` / `navigation`: each navigation section (label each if multiple: "main navigation", "breadcrumb navigation")
   - `<main>` / `main`: primary content area
   - `<aside>` / `complementary`: sidebar or supplementary content
   - `<footer>` / `contentinfo`: page footer
2. **Heading structure**: Number every heading on the page with its semantic level (h1, h2, h3...):
   - Only one h1 per page
   - Headings must not skip levels (no h1 then h3)
   - Heading level reflects document outline, not visual size
3. **Reading order**: Number all content blocks in the order a screen reader should encounter them:
   - Reading order follows visual top-to-bottom, left-to-right for LTR languages
   - Mark any cases where DOM order should differ from visual order
4. **List semantics**: Identify groups of related items that should be marked up as lists (ul, ol, dl):
   - Navigation links: `<ul>` with `<li>` children
   - Steps or rankings: `<ol>`
   - Term-definition pairs: `<dl>`
5. **Table semantics**: For any tabular data, annotate header cells (`<th>`), scope, and caption
6. **Skip links**: Annotate where skip-to-content and skip-to-navigation links should appear

### Phase 2: Interactive Annotations
1. **Focus order**: Number every focusable element in the order keyboard focus should move through them:
   - Natural tab order (left-to-right, top-to-bottom) unless explicitly overridden
   - Mark any focus traps (modals, dialogs) with entry/exit focus positions
   - Indicate elements removed from tab order with `tabindex="-1"` and why
2. **Keyboard interactions**: For each interactive component, annotate the expected keyboard behavior:
   - Buttons: Enter/Space to activate
   - Links: Enter to follow
   - Tabs: Arrow keys to switch, Tab to move out of tab group
   - Menus: Arrow keys to navigate, Enter to select, Escape to close
   - Modals: Tab cycles within modal, Escape to close, focus returns to trigger
3. **Focus indicators**: Annotate visible focus style requirements:
   - Focus ring must be visible against all backgrounds
   - Minimum 2px outline with 3:1 contrast ratio against adjacent colors (WCAG 2.4.11)
4. **State announcements**: For each component that changes state, annotate what screen readers should announce:
   - Expanded/collapsed: `aria-expanded` change
   - Selected: `aria-selected` or `aria-checked` change
   - Loading: `aria-busy` and live region announcement
   - Error: `aria-invalid` and linked error message via `aria-describedby`
5. **Dynamic content**: Annotate live regions for content that updates without page reload:
   - Alerts and notifications: `role="alert"` or `aria-live="assertive"`
   - Status updates: `role="status"` or `aria-live="polite"`
   - Auto-updating content: specify update frequency and announcement policy

### Phase 3: Content Annotations
1. **Alternative text**: Write alt text for every non-decorative image and icon:
   - Informative images: describe the information the image conveys
   - Functional images (icon buttons): describe the action, not the icon ("Close dialog" not "X icon")
   - Decorative images: mark as `alt=""` (empty alt)
   - Complex images (charts, diagrams): provide long description via `aria-describedby`
2. **Accessible names**: Annotate the accessible name for every interactive element:
   - Visible label text is preferred over `aria-label`
   - Icon-only buttons require `aria-label` annotation
   - Groups of related controls need `aria-labelledby` or `<fieldset>`/`<legend>`
3. **Instructions and help text**: Annotate helper text that must be programmatically associated:
   - Input field instructions: link via `aria-describedby`
   - Required field indicators: use `aria-required="true"` plus visible indicator
   - Format hints: include in the accessible description
4. **Language annotations**: Mark any content in a language different from the page language with `lang` attribute
5. **Color independence**: Annotate every instance where color conveys meaning and specify the non-color alternative (icon, text, pattern)
6. Compile all annotations into a structured handoff document organized by page region

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| structural-annotations | markdown | Landmark, heading, reading order, and semantic markup annotations |
| interactive-annotations | markdown | Focus order, keyboard interaction, and state announcement annotations |
| content-annotations | markdown | Alt text, accessible names, help text, and language annotations |
| annotation-overlay | markdown | Combined annotation reference organized by page region for developer handoff |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Heading structure | blocking | Heading levels must be sequential with no gaps and exactly one h1 |
| Focus order | blocking | Every focusable element must have a numbered position in the focus order |
| Alt text coverage | blocking | Every non-decorative image and icon-only button must have annotated alt text |
| Landmark completeness | warning | Page must have at minimum banner, main, and contentinfo landmarks |
| Keyboard interaction | warning | Every interactive component must have keyboard behavior annotated |
| State announcements | warning | Every state-changing component must have announcement behavior specified |

---

## Handoff

- **On completion:** Hand to @stephanie-walter (a11y-handoff) for developer handoff document creation
- **On component-level documentation:** Hand to @stephanie-walter (a11y-doc) for component doc integration
- **On design system integration:** Hand to @brad-frost for annotation standard integration
- **On component specifications:** Hand to @nathan-curtis for spec updates with accessibility requirements
- **On issues:** Escalate to @design-chief

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

