# Task: Accessibility Documentation

**Task ID:** a11y-doc
**Version:** 1.0
**Purpose:** Create comprehensive accessibility documentation for components covering annotations, guidelines, code requirements, and testing
**Agent:** @stephanie-walter
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Produces complete accessibility documentation for design system components across four dimensions: design annotations (what designers must specify), usage guidelines (when and how to use accessibly), code requirements (ARIA, keyboard, focus management), and testing procedures (manual and automated). This documentation bridges the gap between "this component exists" and "this component is accessible" by making requirements explicit and testable.

```
INPUT (component spec, WCAG target level, platform)
    |
[PHASE 1: REQUIREMENTS ANALYSIS]
    -> Identify all accessibility requirements for the component
    |
[PHASE 2: DOCUMENTATION AUTHORING]
    -> Write annotations, guidelines, code specs, and test procedures
    |
[PHASE 3: REVIEW AND INTEGRATION]
    -> Validate documentation and integrate into component docs
    |
OUTPUT: Four-part accessibility documentation package for the component
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| component_spec | file | Yes | Component specification including anatomy, variants, states, and API |
| wcag_level | enum(A, AA, AAA) | Yes | Target WCAG conformance level (typically AA) |
| platform | enum(web, ios, android, multi) | Yes | Target platform for platform-specific requirements |
| existing_a11y_docs | file | No | Current accessibility documentation to build upon or replace |
| user_context | string | No | Specific user groups or assistive technologies to prioritize |

---

## Preconditions

- The component specification exists with defined anatomy, variants, and states
- The target WCAG conformance level has been agreed upon by the team
- The component has been implemented (at least in prototype) so interactive behavior can be evaluated
- The documentation author has access to assistive technology for verification (screen reader, keyboard-only navigation)

---

## Steps

### Phase 1: Accessibility Requirements Analysis
1. Review the component specification and identify all accessibility-relevant aspects:
   - Visual: color contrast, text size, focus indicator visibility, motion/animation
   - Structural: heading level, landmark region, list semantics, table structure
   - Interactive: keyboard operability, focus management, state changes, timing
   - Content: text alternatives, labels, instructions, error identification
2. Map the component to WCAG success criteria: identify every applicable criterion at the target level
3. Identify the appropriate ARIA role and pattern from WAI-ARIA Authoring Practices:
   - Does the component map to a known ARIA widget pattern (dialog, tabs, combobox, menu)?
   - If no exact match, what is the closest pattern and what adaptations are needed?
4. Research platform-specific accessibility APIs: web (ARIA), iOS (UIAccessibility), Android (AccessibilityNodeInfo)
5. List all assistive technology interactions: screen reader announcements, switch access, voice control, magnification
6. Document accessibility requirements per variant and state: disabled state needs `aria-disabled`, error state needs `aria-invalid` plus `aria-describedby`

### Phase 2: Documentation Authoring
1. **Design Annotations Section**: Write what designers must communicate in mockups:
   - Focus order: numbered sequence showing keyboard tab order through the component
   - Heading level: which text is a heading and what level
   - Alternative text: descriptions for images, icons, and decorative elements
   - Color usage: never rely on color alone, always pair with icon/text/pattern
   - Motion: identify animations that need reduced-motion alternatives
2. **Usage Guidelines Section**: Write when and how to use the component accessibly:
   - Do: use the component with visible labels, logical reading order, sufficient contrast
   - Don't: use the component for purposes it was not designed for, override keyboard behavior, hide focus indicators
   - Content guidelines: minimum touch target size, maximum label length, required helper text scenarios
   - Context rules: when the component requires a landmark wrapper, when it needs an `aria-label` vs visible label
3. **Code Requirements Section**: Write the technical implementation requirements:
   - Semantic HTML element to use as the base
   - Required ARIA attributes with values for each state (expanded, selected, checked, disabled, invalid)
   - Keyboard interaction table: key, action, focus behavior
   - Focus management rules: where focus moves on open/close, how focus trapping works in modal contexts
   - Live region requirements: what changes trigger announcements and with what politeness level
4. **Testing Procedures Section**: Write step-by-step test procedures:
   - Keyboard test: tab to component, activate, navigate internal elements, exit
   - Screen reader test: navigate to component, verify announcements for role, name, state, value
   - Color contrast test: verify all text and interactive elements meet minimum contrast ratios
   - Automated test: axe-core rules that apply, expected pass/fail for each variant

### Phase 3: Review and Integration
1. Review documentation against WCAG checklist: every applicable criterion must be addressed
2. Test documented keyboard interactions against the live component: do they match?
3. Test screen reader announcements against documented expectations: do they announce correctly?
4. Review with a developer: are code requirements clear and implementable?
5. Review with a designer: are design annotations practical and understandable?
6. Integrate the four documentation sections into the component's existing documentation
7. Create a compliance summary: checklist of all WCAG criteria with pass/fail/not-applicable status

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| design-annotations | markdown | Annotation guide for designers with focus order, alt text, and heading specs |
| usage-guidelines | markdown | Accessible usage rules with do/don't examples and content guidelines |
| code-requirements | markdown | Technical spec with ARIA, keyboard, focus management, and live regions |
| testing-procedures | markdown | Step-by-step manual and automated test procedures |
| compliance-checklist | markdown checklist | WCAG criterion-by-criterion compliance status |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| WCAG coverage | blocking | Every applicable WCAG criterion at the target level must be addressed |
| Keyboard spec | blocking | Keyboard interaction table must cover all interactive elements in the component |
| ARIA specification | blocking | All required ARIA roles and attributes must be documented with correct values |
| Test procedures | blocking | At least one keyboard test and one screen reader test must be written |
| Designer review | warning | Design annotations must be validated as practical by at least one designer |
| Developer review | warning | Code requirements must be validated as implementable by at least one developer |

---

## Handoff

- **On completion:** Hand to @brad-frost for integration into component documentation in the design system
- **On annotation details:** Hand to @stephanie-walter (a11y-annotations) for detailed design annotation creation
- **On component spec updates:** Hand to @nathan-curtis for component specification amendments
- **On issues:** Escalate to @design-chief
