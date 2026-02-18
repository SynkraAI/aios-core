# Checklist: Per-Component Accessibility Checklist

**ID:** a11y-component-checklist
**Version:** 1.0
**Purpose:** Per-component accessibility checklist covering four documentation areas (annotations, usage, code, testing), WCAG criteria mapping, keyboard specification, screen reader specification, and color/contrast verification
**Agent:** @stephanie-walter
**Quality Gate:** BLOCKING

---

## Prerequisites

- [ ] Component design is finalized in the design tool
- [ ] Component has an implementation (code) ready for testing
- [ ] Target WCAG conformance level is confirmed (AA minimum)
- [ ] Testing environment with assistive technology is available

---

## Section 1: Accessibility Annotations (Design)

- [ ] Reading order is annotated on the design mockup
- [ ] Heading levels are annotated (h1-h6)
- [ ] Landmark regions are annotated (nav, main, aside, footer)
- [ ] Interactive element types are annotated (button, link, input, etc.)
- [ ] Focus order is annotated for interactive elements
- [ ] Alternative text is specified for images and icons
- [ ] ARIA live region behavior is annotated for dynamic content
- [ ] Touch/click target sizes are annotated (minimum 44x44px)

## Section 2: Accessibility Usage Guidelines

- [ ] When-to-use guidance includes accessibility considerations
- [ ] Do/Don't examples show accessible and inaccessible patterns
- [ ] Content guidelines specify accessible text practices (link text, heading text)
- [ ] Color usage guidelines note non-color-only communication
- [ ] Motion and animation guidelines reference prefers-reduced-motion
- [ ] Form usage guidelines include label, error, and help text requirements
- [ ] Component combinations are documented for accessible composition

## Section 3: Accessibility in Code

- [ ] Semantic HTML elements are used (button not div with onClick)
- [ ] ARIA roles are applied only when native semantics are insufficient
- [ ] Required ARIA attributes are present and dynamically updated
- [ ] Labels are associated with inputs programmatically (for/id or aria-labelledby)
- [ ] Error messages are linked via aria-describedby or aria-errormessage
- [ ] Live regions use appropriate politeness (polite, assertive)
- [ ] Focus management is implemented for dynamic content (modals, notifications)
- [ ] tabindex is used correctly (0 for focusable, -1 for programmatic, never > 0)

## Section 4: Accessibility Testing Documentation

- [ ] Automated test suite includes axe-core checks for the component
- [ ] Keyboard test script documents expected behavior per key (Tab, Enter, Escape, Arrows)
- [ ] Screen reader test script documents expected announcements per interaction
- [ ] Manual test results are recorded with date, tester, and AT used
- [ ] Known accessibility limitations are documented with workarounds
- [ ] Regression tests exist to prevent reintroduction of fixed a11y issues
- [ ] Test coverage includes all component states (default, error, disabled, loading)

## Section 5: WCAG Criteria Mapping

- [ ] Relevant WCAG 2.2 success criteria are listed for this component
- [ ] Each criterion has a pass/fail status documented
- [ ] Level A criteria are all passing
- [ ] Level AA criteria are all passing
- [ ] Level AAA criteria are documented as aspirational or passing
- [ ] Mapping is updated when the component changes

## Section 6: Keyboard Specification

- [ ] Tab key moves focus to and from the component
- [ ] Enter/Space activates the primary action
- [ ] Escape dismisses overlays, dropdowns, or cancelable actions
- [ ] Arrow keys navigate within composite widgets (menus, tabs, listboxes)
- [ ] Home/End keys move to first/last item where applicable
- [ ] No keyboard traps exist at any point in the interaction
- [ ] Keyboard shortcuts are documented and do not conflict with OS or browser defaults

## Section 7: Screen Reader Specification

- [ ] Component role is announced correctly (button, link, dialog, etc.)
- [ ] Component name/label is announced on focus
- [ ] Component state is announced (expanded, selected, checked, disabled)
- [ ] Component value is announced for inputs and controls
- [ ] Dynamic changes trigger appropriate announcements
- [ ] Instructions or descriptions are announced via aria-describedby
- [ ] Virtual cursor can navigate all component content

## Section 8: Color and Contrast Verification

- [ ] Text contrast meets 4.5:1 (normal) and 3:1 (large) per WCAG
- [ ] UI component contrast meets 3:1 per WCAG 1.4.11
- [ ] Focus indicator contrast meets 3:1 per WCAG 2.4.11
- [ ] Information is not communicated by color alone
- [ ] Component is usable in Windows High Contrast Mode
- [ ] Component is usable in forced-colors/dark mode

---

## Scoring

| Category | Items | Pass | Status |
|----------|-------|------|--------|
| Annotations | 8 | _ | PENDING |
| Usage Guidelines | 7 | _ | PENDING |
| Code | 8 | _ | PENDING |
| Testing Docs | 7 | _ | PENDING |
| WCAG Mapping | 6 | _ | PENDING |
| Keyboard Spec | 7 | _ | PENDING |
| Screen Reader Spec | 7 | _ | PENDING |
| Color/Contrast | 6 | _ | PENDING |

**Minimum passing score:** 90%
**Blocking items:** Code and Keyboard Spec items are mandatory pass
