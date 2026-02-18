# Task: Implement ARIA Patterns

**Task ID:** aria-patterns
**Version:** 1.0
**Purpose:** Implements correct ARIA patterns for complex widgets: combobox, dialog, tabs, tree, menu, based on WAI-ARIA Authoring Practices Guide (APG)
**Agent:** @heydon-pickering
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

This task guides the correct implementation of ARIA patterns for complex interactive widgets. ARIA (Accessible Rich Internet Applications) enables complex UI patterns to be accessible to assistive technologies, but incorrect implementation is worse than no ARIA at all. This task follows the WAI-ARIA Authoring Practices Guide (APG) as the authoritative reference, adapting patterns to the specific component context while ensuring keyboard interaction, role assignment, state management, and focus management are all handled correctly.

The first rule of ARIA is "don't use ARIA" — if a native HTML element provides the semantics and behavior needed, it should be used instead. ARIA is reserved for complex widgets where native HTML falls short, such as custom comboboxes, tab interfaces, tree views, and modal dialogs.

```
INPUT (widget type, component context, interaction spec)
    ↓
[PHASE 1: PATTERN SELECTION]
    → Identify correct APG pattern, map roles, states, and properties
    ↓
[PHASE 2: IMPLEMENTATION]
    → Apply ARIA attributes, keyboard handlers, focus management
    ↓
[PHASE 3: TESTING]
    → Verify with multiple screen readers, test edge cases
    ↓
OUTPUT: ARIA Pattern Implementation
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| widget_type | string | Yes | The type of widget: combobox, dialog, tabs, tree, menu, disclosure, accordion, etc. |
| component_context | object | Yes | How this widget is used: what content it contains, where it appears, what triggers it |
| interaction_spec | object | Yes | Required interactions: selection behavior, multi-select, auto-complete, filtering |
| existing_markup | string | No | Current HTML markup to enhance with ARIA, if component already exists |

---

## Preconditions

- The widget type is identified and matches a known APG pattern or combination of patterns
- The component's visual design and interaction behavior are defined
- The development team understands that ARIA attributes must be kept in sync with visual state
- Testing with at least one screen reader is feasible in the development environment
- The WAI-ARIA Authoring Practices Guide (APG) is available as reference
- Browser DevTools accessibility inspector is available for role and property verification

---

## Steps

### Phase 1: Pattern Selection
1. Identify the correct APG pattern for the widget type — prefer the simplest pattern that meets requirements
2. Map all required ARIA roles: container role, item roles, and any supporting roles
3. Map all required ARIA states: aria-selected, aria-expanded, aria-checked, aria-disabled, etc.
4. Map all required ARIA properties: aria-labelledby, aria-describedby, aria-controls, aria-owns, aria-activedescendant
5. Define the keyboard interaction model per APG: tab stops, arrow key navigation, home/end, type-ahead, escape

### Phase 2: Implementation
1. Apply container role and required properties to the wrapper element
2. Apply item roles and initial states to each interactive child element
3. Implement keyboard event handlers: arrow keys for navigation, enter/space for activation, escape for dismiss
4. Implement focus management: roving tabindex or aria-activedescendant strategy based on pattern requirements
5. Implement state synchronization: every visual state change must trigger a corresponding ARIA state update

### Phase 3: Testing
1. Test with NVDA on Windows (Firefox and Chrome): verify role announcements, state changes, keyboard navigation
2. Test with VoiceOver on macOS (Safari): verify the same behaviors, note any browser-specific differences
3. Test with mobile screen readers: VoiceOver on iOS, TalkBack on Android — verify touch interaction patterns
4. Test edge cases: empty states, single-item collections, disabled items, dynamic content insertion
5. Document any known screen reader bugs or inconsistencies with workarounds
6. Validate in browser DevTools accessibility inspector: verify computed roles, names, and states
7. Test with automated tools (axe-core): catch common ARIA mistakes that manual testing might miss

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| aria-implementation | HTML/JS | Complete ARIA implementation with roles, states, properties, and keyboard handlers |
| pattern-documentation | Markdown | Documentation of which APG pattern was used and why, with deviations noted |
| keyboard-spec | Markdown table | Complete keyboard interaction specification for the widget |
| testing-results | Markdown | Screen reader testing results across platforms with known issues |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| apg_conformance | blocking | Implementation must conform to the referenced APG pattern specification |
| keyboard_complete | blocking | All keyboard interactions defined by the APG pattern must be implemented |
| state_synchronized | blocking | Every visual state change must have a corresponding ARIA state update |
| screen_reader_tested | blocking | Testing with at least 2 screen reader/browser combinations must be completed |
| no_redundant_aria | warning | No ARIA attributes that duplicate native HTML semantics should be present |
| devtools_verified | warning | Computed accessibility tree should be verified in browser DevTools |
| automated_scan | warning | axe-core or similar automated scan should pass with zero violations |

---

## Handoff

- **On completion:** Hand to @micah-godbolt for testing-strategy to add automated ARIA testing to the test suite
- **On completion (alt):** Hand to @micah-godbolt for documentation-plan to document the ARIA pattern for other developers
- **On completion (alt):** Hand to @heydon-pickering for inclusive-audit to verify the implementation in real-world usage
- **On issues:** Escalate to @design-chief
- **Dependencies:** Can run independently; feeds into testing-strategy and documentation-plan

---

## Related Tasks

| Task | Relationship | Description |
|------|-------------|-------------|
| build-inclusive | Parallel | Provides the inclusive construction methodology for the component |
| inclusive-audit | Downstream | Verifies the ARIA implementation in real-world usage |
| testing-strategy | Downstream | Adds automated ARIA testing to the test suite |
| documentation-plan | Downstream | Documents the ARIA pattern for other developers |

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

