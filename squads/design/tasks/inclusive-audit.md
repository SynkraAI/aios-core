# Task: Inclusive Design Audit

**Task ID:** inclusive-audit
**Version:** 1.0
**Purpose:** Audits a component for inclusive design: keyboard navigation, screen reader support, color contrast, motion sensitivity, and cognitive load
**Agent:** @heydon-pickering
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

This task performs a comprehensive inclusive design audit on a component or set of components. Inclusive design is not a checklist bolted on at the end — it is a lens through which every design decision is evaluated. This audit examines keyboard navigation, screen reader compatibility, color contrast compliance, motion sensitivity, cognitive load, and touch target sizing. The output identifies barriers to access and provides specific remediation guidance rooted in real user needs rather than abstract compliance.

The difference between an inclusive audit and a WCAG compliance check is intent. Compliance checks verify technical criteria. An inclusive audit asks whether real people with real disabilities can actually use the component effectively, which often reveals issues that automated tools miss entirely.

```
INPUT (component, WCAG level target, user context)
    ↓
[PHASE 1: STRUCTURAL AUDIT]
    → Examine HTML semantics, ARIA usage, keyboard interaction
    ↓
[PHASE 2: PERCEPTUAL AUDIT]
    → Test color contrast, motion, cognitive load, responsive behavior
    ↓
[PHASE 3: REMEDIATION]
    → Prioritize findings, provide fix guidance, validate corrections
    ↓
OUTPUT: Inclusive Design Audit Report
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| component | object | Yes | Component to audit: name, code location, live URL or Storybook link |
| wcag_level | string | Yes | Target WCAG conformance level: A, AA, or AAA |
| user_context | object | Yes | Context of use: device types, expected user demographics, assistive technologies |
| design_tokens | object | No | Token values used by the component for automated contrast checking |

---

## Preconditions

- The component is implemented and renderable in a browser environment
- WCAG target level is agreed upon by stakeholders
- Testing tools are available: screen reader (NVDA/VoiceOver), keyboard, contrast analyzer
- The component has defined expected behaviors and interaction patterns
- Target assistive technologies are identified (NVDA, VoiceOver, JAWS, TalkBack)
- Design tokens driving the component's visual appearance are documented for automated checks

---

## Steps

### Phase 1: Structural Audit
1. Examine HTML semantics: verify correct element usage (button for actions, links for navigation, headings for structure)
2. Test keyboard navigation: tab order, focus visibility, keyboard shortcuts, escape to dismiss, enter/space to activate
3. Audit ARIA usage: verify roles, states, and properties are correct and necessary (no ARIA is better than wrong ARIA)
4. Test with screen reader: verify announcement order, meaningful labels, state changes announced, live regions for dynamic content
5. Check focus management: does focus move logically after interactions (modal open, item delete, form submit)

### Phase 2: Perceptual Audit
1. Test color contrast: all text against backgrounds at normal and large text thresholds (4.5:1 AA, 3:1 large text)
2. Test non-text contrast: UI components and graphical objects against adjacent colors (3:1 ratio for AA)
3. Evaluate motion: identify animations, verify prefers-reduced-motion is respected, check for vestibular triggers
4. Assess cognitive load: number of choices presented, clarity of labels, error prevention and recovery
5. Test responsive behavior: verify the component works at 200% zoom, 400% zoom, and across viewport sizes without loss of content
6. Test touch target sizing: all interactive elements must meet minimum 44x44px touch target size (WCAG 2.5.8)
7. Verify text spacing override: component must remain functional when users override text spacing (WCAG 1.4.12)

### Phase 3: Remediation
1. Classify each finding by severity: critical (blocks access), major (degrades experience), minor (suboptimal but usable)
2. Map each finding to the specific WCAG success criterion it violates
3. Provide remediation guidance: specific code changes, ARIA patterns, or design modifications needed
4. Prioritize fixes: critical findings first, then major, then minor — with estimated effort for each
5. Define validation procedure: how to confirm each fix resolves the issue

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| audit-report | Markdown | Complete inclusive design audit report with all findings and severity |
| remediation-guide | Markdown | Specific fix guidance for each finding with code examples |
| wcag-mapping | Markdown table | Each finding mapped to its WCAG success criterion |
| validation-procedures | Markdown | How to verify each fix resolves the identified barrier |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| keyboard_tested | blocking | Full keyboard navigation test must be completed and documented |
| screen_reader_tested | blocking | Screen reader testing with at least one AT (NVDA, VoiceOver, or JAWS) must be completed |
| contrast_measured | blocking | All color contrast ratios must be measured and documented |
| wcag_mapped | blocking | Every finding must reference a specific WCAG success criterion |
| remediation_actionable | warning | Each finding must include a specific, implementable remediation step |
| touch_targets_measured | warning | Touch target sizes should be verified for all interactive elements |
| zoom_tested | warning | Component behavior at 200% and 400% zoom must be documented |

---

## Handoff

- **On completion:** Hand to @micah-godbolt for code-standards to add accessibility requirements to component contracts
- **On completion (alt):** Hand to @micah-godbolt for testing-strategy to add automated accessibility tests
- **On completion (alt):** Hand to @jina-anne for token-audit to verify token-driven contrast ratios meet WCAG thresholds
- **On issues:** Escalate to @design-chief
- **Dependencies:** Can run independently; feeds into code-standards, testing-strategy, and build-inclusive

---

## Related Tasks

| Task | Relationship | Description |
|------|-------------|-------------|
| build-inclusive | Downstream | Uses audit findings to guide inclusive component construction |
| code-standards | Downstream | Adds accessibility requirements to component contracts |
| testing-strategy | Downstream | Adds automated accessibility tests based on findings |
| token-audit | Parallel | Verifies token-driven contrast ratios meet WCAG thresholds |

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

