# Task: Accessibility Handoff Document

**Task ID:** a11y-handoff
**Version:** 1.0
**Purpose:** Create a designer-to-developer accessibility handoff document with all implementation details
**Agent:** @stephanie-walter
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Produces the definitive handoff document that transfers all accessibility requirements from design to development. Consolidates annotations, ARIA specifications, keyboard interaction models, testing criteria, and acceptance conditions into a single developer-ready package. This document eliminates the gap where accessibility requirements are "in the designer's head" but never communicated to the person writing the code.

```
INPUT (annotated designs, component specs, accessibility requirements)
    |
[PHASE 1: CONSOLIDATION]
    -> Gather all accessibility requirements into a structured document
    |
[PHASE 2: SPECIFICATION]
    -> Write implementation-ready specs with code examples
    |
[PHASE 3: ACCEPTANCE CRITERIA]
    -> Define testable acceptance criteria and verification procedures
    |
OUTPUT: Developer-ready accessibility handoff package with specs, code examples, and test criteria
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| annotated_designs | file[] | Yes | Design mockups with accessibility annotations (from a11y-annotations task) |
| component_specs | file[] | Yes | Component specifications for all components on the page |
| page_context | string | Yes | Page purpose, user flow, and any special accessibility considerations |
| wcag_level | enum(A, AA, AAA) | No | Target WCAG conformance level; defaults to AA |
| assistive_tech_targets | string[] | No | Priority assistive technologies (NVDA, JAWS, VoiceOver, TalkBack) |

---

## Preconditions

- Design mockups have been annotated with accessibility information (a11y-annotations task completed)
- Component specifications exist for all components used on the page
- The target WCAG conformance level is agreed upon
- The development team's technology stack is known (for framework-specific code examples)

---

## Steps

### Phase 1: Requirements Consolidation
1. Collect all accessibility annotations from the annotated design files:
   - Landmark regions and their labels
   - Heading hierarchy (h1 through h6)
   - Reading order and focus order sequences
   - Alternative text for all images and icons
   - Accessible names for all interactive elements
2. Collect component-level accessibility specifications:
   - ARIA roles and attributes per component
   - Keyboard interaction patterns per component
   - Focus management rules per component
   - Live region configurations for dynamic content
3. Identify page-level accessibility requirements beyond individual components:
   - Page title and language attributes
   - Skip navigation links
   - Focus management on page load and route changes
   - Error summary behavior for form pages
   - Notification/alert patterns for asynchronous updates
4. Cross-reference annotations with component specs: resolve any conflicts where annotations specify different behavior than the component spec
5. Document technology-specific requirements: HTML semantics, ARIA attributes specific to the framework (React aria-* props, Vue v-bind), platform accessibility APIs

### Phase 2: Implementation Specification
1. **Semantic Structure Section**: Write the HTML outline for the page:
   - Document landmarks with their roles and labels as a nested list
   - Heading outline showing the full h1-h6 tree
   - List semantics: which groups must be lists and what type (ul, ol, dl)
   - Table structure: headers, scope, caption for any data tables
2. **Component Accessibility Section**: For each component instance on the page, write:
   - HTML element to use (not generic div/span where semantic elements exist)
   - Required ARIA attributes with exact values: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="dialog-title"`
   - State-dependent attributes with all values: `aria-expanded="false"` -> `aria-expanded="true"` on toggle
   - Code example showing the accessible markup for the default state
3. **Keyboard Interaction Section**: Create an interaction table per component type:
   - Key (Tab, Enter, Space, Arrow Up/Down, Escape, Home, End)
   - Action performed
   - Focus movement result
   - Screen reader announcement expected
4. **Focus Management Section**: Document focus behavior for all dynamic interactions:
   - Modal open: move focus to first focusable element or heading; trap focus within modal
   - Modal close: return focus to the trigger element
   - Content load: move focus to new content or announce via live region
   - Error: move focus to error summary or first error field
   - Delete/remove: move focus to next logical element
5. **Dynamic Content Section**: Specify live region behavior:
   - What content updates trigger announcements
   - Politeness level: assertive (interrupts) vs polite (waits for pause)
   - Debounce timing for rapidly updating content
   - Toast/notification stacking behavior and dismissal

### Phase 3: Acceptance Criteria and Testing
1. Write acceptance criteria as testable statements using the format: "Given [context], when [action], then [expected result]":
   - "Given the page loads, when a keyboard user presses Tab, then focus moves to the skip navigation link"
   - "Given a modal is open, when the user presses Escape, then the modal closes and focus returns to the trigger button"
   - "Given a form has errors, when the user submits, then focus moves to the error summary and screen reader announces the error count"
2. Create a manual testing checklist organized by test type:
   - Keyboard-only testing: navigate entire page using only keyboard
   - Screen reader testing: complete the primary user flow with screen reader enabled
   - Zoom testing: zoom to 200% and verify no content is lost or overlapping
   - Reduced motion testing: enable reduced motion and verify animations are suppressed
   - High contrast testing: enable high contrast mode and verify all content remains visible
3. Specify automated testing requirements:
   - axe-core rules that must pass for each component
   - Custom assertions for interactions not covered by automated tools
   - Visual regression tests for focus indicator visibility
4. Define the browser and assistive technology testing matrix:
   - Chrome + NVDA (Windows)
   - Safari + VoiceOver (macOS and iOS)
   - Firefox + JAWS (Windows, if applicable)
   - Chrome + TalkBack (Android, if applicable)
5. Create the handoff summary document with all sections combined, organized by page region for easy developer reference

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| handoff-document | markdown | Complete developer handoff with semantic structure, ARIA specs, keyboard model, and focus management |
| code-examples | markdown (code blocks) | Accessible markup examples for every component instance on the page |
| acceptance-criteria | markdown | Testable accessibility acceptance criteria in Given/When/Then format |
| testing-checklist | markdown checklist | Manual and automated testing procedures with browser/AT matrix |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Annotation coverage | blocking | Every annotation from the design files must appear in the handoff document |
| Code examples | blocking | Every component instance must have an accessible markup example |
| Keyboard spec | blocking | Keyboard interaction table must exist for every interactive component |
| Focus management | blocking | Focus behavior must be specified for every dynamic interaction (open, close, load, error) |
| Acceptance criteria | warning | At least 5 testable accessibility acceptance criteria must be written |
| Testing matrix | warning | At least 2 browser-AT combinations must be specified for testing |

---

## Handoff

- **On completion:** Hand to @brad-frost for implementation review and design system documentation updates
- **On component spec questions:** Hand to @nathan-curtis for component specification clarification
- **On interaction pattern questions:** Hand to @jenifer-tidwell for pattern compliance check
- **On documentation gaps found:** Hand to @stephanie-walter (a11y-doc) for gap documentation
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

