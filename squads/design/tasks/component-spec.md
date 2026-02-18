# Task: Component Specification

**Task ID:** component-spec
**Version:** 1.0
**Purpose:** Create a detailed component specification covering API, variants, states, accessibility, and responsive behavior
**Agent:** @nathan-curtis
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Produces a complete, implementation-ready component specification that serves as the single source of truth for designers and developers. Covers every dimension: API surface, visual variants, interactive states, accessibility requirements, responsive behavior, token usage, and content guidelines. This is the definitive document from which both design artifacts and code are built.

```
INPUT (component name, design reference, usage context)
    |
[PHASE 1: ANATOMY AND STRUCTURE]
    -> Define component parts, slots, and composition model
    |
[PHASE 2: BEHAVIOR AND STATES]
    -> Specify variants, states, interactions, and responsive rules
    |
[PHASE 3: INTEGRATION AND DOCUMENTATION]
    -> Define tokens, accessibility, content rules, and publish spec
    |
OUTPUT: Complete component specification document ready for design and engineering
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| component_name | string | Yes | Name of the component following the system's naming convention |
| design_reference | file | Yes | Visual design showing the component in all variants and states |
| usage_context | string | Yes | Description of where and how the component is used in the product |
| atomic_layer | enum(atom, molecule, organism) | No | Atomic design classification for composition rules |
| related_components | string[] | No | Components that frequently appear alongside or within this one |

---

## Preconditions

- The component has been approved for addition to the design system through the governance process
- Visual designs exist showing the component in at least default and key variant states
- The component name has been validated against the naming convention
- Design tokens (color, spacing, typography, elevation) are defined and available

---

## Steps

### Phase 1: Anatomy and Structure
1. Define the component's anatomy: list every sub-element (icon slot, label area, action area, content region, divider, badge position)
2. Create an anatomy diagram with labeled callouts for each sub-element
3. Specify required vs optional sub-elements: which parts must always be present and which can be omitted
4. Define slot/children areas: what content types are accepted (text, icon, component, custom render)
5. Establish size specifications: minimum and maximum dimensions, aspect ratios, fixed vs fluid sizing
6. Document spacing rules: internal padding, gaps between sub-elements, margin expectations
7. Define the component's composition model: can it be nested, what are its valid parent and child components

### Phase 2: Behavior, Variants, and States
1. Enumerate all variants with visual specifications:
   - **Size variants**: compact, default, large (with specific pixel/token values)
   - **Emphasis variants**: primary, secondary, tertiary, ghost
   - **Color variants**: default, success, warning, danger, info
   - **Layout variants**: horizontal, vertical, stacked (if applicable)
2. Document all interactive states with visual specs:
   - Default, hover, focus (visible focus ring), active/pressed, disabled, loading, selected, error
3. Define transition behavior: animation timing, easing curves, and property transitions between states
4. Specify keyboard interaction model: tab order, arrow key behavior, enter/space activation, escape dismissal
5. Define responsive breakpoint behavior: how the component adapts at mobile, tablet, and desktop widths
6. Document overflow behavior: text truncation, scroll behavior, wrapping rules
7. Specify edge cases: empty state, maximum content, minimum content, RTL layout behavior

### Phase 3: Integration, Accessibility, and Documentation
1. Map all visual properties to design tokens:
   - Background: `color-surface-*`
   - Text: `color-text-*`, `font-*`
   - Border: `color-border-*`, `border-radius-*`
   - Spacing: `spacing-*`
   - Elevation: `shadow-*`
2. Define the component API (props/attributes):
   - Prop name, type, default value, description, required/optional
   - Event names and payload shapes
3. Write accessibility specification:
   - ARIA role and attributes
   - Screen reader announcement behavior
   - Focus management rules
   - Color contrast requirements (reference WCAG 2.1 AA minimums)
4. Write content guidelines: recommended text length, tone, capitalization, placeholder conventions
5. Create usage guidelines with do/don't examples
6. Document related components: alternatives, companions, and composition partners
7. Publish the complete specification for cross-functional review

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| component-spec | markdown | Complete specification covering anatomy, variants, states, API, and tokens |
| anatomy-diagram | markdown | Labeled diagram of component parts with callout descriptions |
| prop-table | markdown table | Full API reference with types, defaults, and descriptions |
| accessibility-spec | markdown | ARIA roles, keyboard model, screen reader behavior, and contrast requirements |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Anatomy completeness | blocking | Every visible sub-element must be identified and labeled |
| State coverage | blocking | All eight core states (default through error) must be specified |
| Token mapping | blocking | Every visual property must reference a design token, not a raw value |
| API definition | blocking | Every prop must have a type, default, and description |
| Accessibility spec | warning | ARIA role, keyboard model, and contrast requirements must be documented |
| Responsive behavior | warning | Behavior at mobile, tablet, and desktop breakpoints must be specified |

---

## Handoff

- **On completion:** Hand to @brad-frost for atomic design integration and implementation guidance
- **On accessibility details:** Hand to @stephanie-walter for accessibility annotation review
- **On interaction patterns:** Hand to @jenifer-tidwell for pattern compliance validation
- **On issues:** Escalate to @design-chief

---

## Glossary

> Full glossary: [design-glossary.md](../data/design-glossary.md)

**Key terms for this task:**

- **Component API** — Props interface defining configuration and behavior
- **Variant** — Named style variation (primary, secondary, destructive)
- **Component state** — Interactive state: default, hover, active, focus, disabled, error
- **Storybook** — Visual component development and documentation environment
- **Composition** — Building larger components by combining smaller ones

---

## Don't Do

- Do not build components without defining the component API (props interface) first
- Do not skip variant definitions — undocumented variants lead to ad-hoc styling
- Do not create components without Storybook stories for each variant and state
- Do not hardcode text or colors — accept them as props or use tokens
- Do not skip accessibility requirements (keyboard, ARIA) in component specs

