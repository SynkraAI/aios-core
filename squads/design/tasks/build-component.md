# Task: Build Component

**Task ID:** build-component
**Version:** 1.0
**Purpose:** Guide the creation of a new design system component following atomic design principles
**Agent:** @brad-frost
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Walks through the full lifecycle of creating a new component: from naming and classification to API design, documentation, and review. Ensures every component follows Atomic Design principles, integrates cleanly with existing patterns, and ships with complete documentation. This is the primary workflow for expanding a design system's component library.

```
INPUT (component need, atomic layer, design reference)
    |
[PHASE 1: DEFINITION]
    -> Name, classify, and specify the component
    |
[PHASE 2: DESIGN AND API]
    -> Define props, variants, states, tokens, and composition rules
    |
[PHASE 3: DOCUMENTATION AND REVIEW]
    -> Write usage guidelines, examples, and submit for review
    |
OUTPUT: Complete component specification ready for implementation
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| component_need | string | Yes | Description of the problem or user need this component addresses |
| design_reference | file | Yes | Visual design (Figma, screenshot) showing the desired component |
| atomic_layer | enum(atom, molecule, organism) | Yes | The atomic design layer this component belongs to |
| existing_similar | string[] | No | Names of existing components that are similar or related |
| target_platforms | enum(web, ios, android, multi)[] | No | Platforms where the component will be available |

---

## Preconditions

- The component does not already exist in the design system (verified via audit or search)
- A visual design reference exists showing the component in at least one context
- The atomic layer has been determined through decomposition analysis
- Naming conventions for the design system are documented and accessible
- Design tokens (color, spacing, typography) are available for the target platform

---

## Steps

### Phase 1: Definition and Classification
1. Confirm the component does not duplicate an existing component or variant
2. Apply the naming convention to produce a component name: use the system's naming pattern (e.g., kebab-case, PascalCase) and ensure the name describes function, not appearance
3. Classify the component within the atomic hierarchy and document which atoms/molecules it composes (if molecule or organism)
4. Write a one-sentence purpose statement: "This component allows users to [action] in the context of [feature]"
5. Identify the component's parent context: where does it live in the template/page hierarchy
6. List all known use cases: primary use case plus edge cases and secondary contexts

### Phase 2: API Design and Specification
1. Define the component's props/API:
   - Required props (content, labels, identifiers)
   - Optional props (size, variant, color scheme, disabled state)
   - Event callbacks (onClick, onChange, onFocus, onBlur)
   - Slot/children areas for composition
2. Enumerate all visual variants: size (sm, md, lg), emphasis (primary, secondary, ghost), color (default, success, warning, danger)
3. Document all interactive states: default, hover, focus, active, disabled, loading, error, selected
4. Map design tokens to component properties: which color tokens, spacing tokens, typography tokens, elevation tokens apply
5. Define responsive behavior: how the component adapts across breakpoints (collapse, stack, hide, resize)
6. Specify composition rules: what child components are allowed, forbidden, or required
7. Define accessibility requirements: ARIA role, keyboard interaction pattern, focus management, screen reader announcements

### Phase 3: Documentation and Review
1. Write usage guidelines: when to use, when not to use, common mistakes to avoid
2. Create do/don't examples showing correct and incorrect usage (at least 3 of each)
3. Write code example snippets for each major variant and use case
4. Document prop table with types, defaults, and descriptions
5. Add content guidelines: character limits, tone, placeholder text conventions
6. Submit specification for peer review with checklist:
   - Naming follows conventions
   - All states are documented
   - Accessibility requirements are complete
   - Token usage is correct
   - No duplication with existing components
7. Incorporate review feedback and finalize specification

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| component-spec | markdown | Full component specification with API, variants, states, and tokens |
| usage-guidelines | markdown | When to use, when not to use, do/don't examples |
| code-examples | markdown (code blocks) | Implementation examples for each variant and use case |
| review-checklist | markdown checklist | Completed review checklist with sign-off status |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Naming compliance | blocking | Component name must follow the system's naming convention |
| No duplication | blocking | Component must not duplicate functionality of an existing component |
| State completeness | blocking | All interactive states (default, hover, focus, active, disabled) must be documented |
| Accessibility spec | blocking | ARIA role, keyboard pattern, and focus management must be defined |
| Token mapping | warning | All visual properties should reference design tokens, not hardcoded values |
| Usage guidelines | warning | At least 3 do and 3 don't examples must be provided |

---

## Handoff

- **On completion:** Hand to @nathan-curtis for governance review and system integration planning
- **On accessibility details:** Hand to @stephanie-walter for accessibility annotation and documentation
- **On interaction patterns:** Hand to @jenifer-tidwell for pattern validation
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

