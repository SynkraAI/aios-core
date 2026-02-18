# Task: Design CTAs for Objects

**Task ID:** cta-design
**Version:** 1.0
**Purpose:** Design calls to action for each UX object with primary, secondary, and contextual action hierarchies and progressive disclosure
**Agent:** @sophia-prater
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Designs the complete CTA (call to action) system for each UX object in the system. In OOUX methodology, CTAs are the verbs that users perform on objects. This task goes beyond simple button labeling to define action hierarchies (primary, secondary, tertiary), contextual CTAs that appear based on object state or user context, progressive disclosure of actions, destructive action safeguards, and cross-object actions. The result is a comprehensive action model that ensures every user goal is achievable and every action is discoverable without overwhelming the interface.

```
INPUT (object inventory, user goals, relationship map)
    |
[PHASE 1: CTA FORAGING]
    -> Extract all possible actions from research, flows, and domain analysis
    |
[PHASE 2: CTA ARCHITECTURE]
    -> Classify, prioritize, and organize CTAs for each object
    |
[PHASE 3: INTERACTION DESIGN]
    -> Design progressive disclosure, contextual triggers, and safeguards
    |
OUTPUT: Complete CTA architecture with hierarchy, disclosure rules, and interaction patterns
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| object_inventory | file | Yes | Validated UX object inventory with definitions and attributes |
| user_goals | list | Yes | User goals and tasks that CTAs must support |
| relationship_map | file | Yes | Object relationship map showing how objects connect (from relationship-map task) |
| user_research | file | No | Research data on what actions users attempt, expect, or struggle with |
| competitor_actions | list | No | CTA patterns observed in competitor products for comparison |
| business_rules | string | No | Business rules that constrain or require specific actions (e.g., approval workflows) |

---

## Preconditions

- UX objects are identified and defined with their core attributes
- Object relationships are mapped, as relationships affect which CTAs appear in which contexts
- User goals and tasks are documented from research, not assumed
- The team understands that CTAs are defined per object, not per screen or page
- Business rules and constraints on actions are available or can be elicited
- Accessibility requirements for interactive elements are documented (keyboard, screen reader, focus)
- The design system's interaction patterns (if any) are available for consistency alignment

---

## Steps

### Phase 1: CTA Foraging
1. Extract action verbs from user research: what do users say they want to "do" in interviews, surveys, and support tickets?
2. Extract actions from existing product (if available): catalog every button, link, and interactive element and the action it performs
3. Map business process actions: what actions do business workflows require (approve, reject, escalate, assign, archive)?
4. Identify CRUD baseline for each object: can users Create, Read, Update, and Delete instances of this object? Which of these are applicable?
5. Identify relationship-triggered actions: actions that involve moving between objects (add to, remove from, link, unlink, share with)
6. Catalog all foraging results in a raw CTA list with the source, the object it applies to, and the context where it was found

### Phase 2: CTA Architecture
1. **Per-object CTA assignment**: For each object, assign all applicable CTAs from the raw list; every CTA must belong to at least one object
2. **Primary CTA selection**: For each object, select exactly one primary CTA: the single most important action a user takes on this object (e.g., "Buy" for Product, "Play" for Video, "Apply" for Job)
3. **Secondary CTA classification**: Group remaining high-frequency CTAs as secondary: actions users commonly need but that are not the primary action (e.g., "Save", "Share", "Edit")
4. **Tertiary CTA classification**: Group less frequent or administrative CTAs as tertiary: actions that are needed but not for every interaction (e.g., "Export", "Duplicate", "Archive")
5. **Contextual CTA rules**: Define rules for CTAs that appear only in specific contexts: object state (e.g., "Resume" only appears on paused items), user role (e.g., "Approve" only for managers), relationship context (e.g., "Remove" only when object is nested in a collection)
6. **Cross-object CTAs**: Identify actions that span two or more objects and define which object "owns" the CTA (e.g., "Add Product to Cart" is owned by Cart, not Product)
7. **CTA naming standardization**: Ensure consistent verb usage across all objects: do not use "Remove" on one object and "Delete" on another if they mean the same thing

### Phase 3: Interaction Design
1. **Progressive disclosure design**: Define how CTAs are revealed: always visible (primary), visible on hover/focus (secondary), hidden in overflow menu (tertiary), contextually triggered (conditional)
2. **Destructive action safeguards**: For CTAs that delete, remove, or irreversibly change data, define confirmation patterns: inline confirmation, modal confirmation, undo window, soft delete
3. **CTA placement patterns**: Define where CTAs appear relative to the object: inline with content, in a toolbar, in a context menu, as floating action buttons; maintain consistency across all objects
4. **State-dependent CTA behavior**: Map how CTAs change based on object state: disabled states, loading states, completed states, error states; define visual and interaction differences
5. **Keyboard and accessibility**: Ensure all CTAs are accessible: keyboard shortcuts for primary CTAs, focus management for contextual CTAs, screen reader announcements for state changes
6. **CTA documentation**: For each CTA, document: label, object, priority level, disclosure rule, placement, confirmation pattern, state behaviors, and accessibility requirements

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| cta_architecture | markdown | Complete CTA system with per-object hierarchy and classification |
| cta_matrix | markdown table | Matrix of all CTAs by object with priority, disclosure, and placement |
| cross_object_ctas | markdown | CTAs that span multiple objects with ownership and trigger documentation |
| contextual_rules | markdown | Rules for conditional CTA display based on state, role, and context |
| interaction_patterns | markdown | Progressive disclosure, confirmation, and state behavior patterns |
| naming_guide | markdown | Standardized CTA verb vocabulary with usage guidelines |
| accessibility_spec | markdown | Keyboard, focus, and screen reader requirements for all CTA patterns |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Goal completeness | blocking | Every user goal must be achievable through the defined CTAs |
| Primary CTA rule | blocking | Each object must have exactly one primary CTA defined |
| Destructive safeguards | blocking | Every destructive CTA must have a defined confirmation or undo pattern |
| Naming consistency | warning | CTA verbs should be consistent across objects; no synonyms used for the same action type |
| Accessibility coverage | warning | All CTA patterns should include keyboard and screen reader specifications |
| Progressive disclosure | warning | CTA hierarchy should be reflected in the disclosure model; primary always visible, tertiary hidden |

---

## Handoff

- **On completion:** Hand to @brad-frost for component architecture that implements CTA patterns in UI components
- **On CSS implementation:** Hand to @andy-bell for interaction styling (hover, focus, active states, transitions)
- **On visual design:** Hand to @dan-mall for CTA visual treatment in element collages
- **On relationship-driven CTAs:** Coordinate with @sophia-prater relationship-map task for cross-object action flows
- **On issues:** Escalate to @design-chief

---

## Glossary

> Full glossary: [design-glossary.md](../data/design-glossary.md)

**Key terms for this task:**

- **Design tokens** — Platform-agnostic key-value pairs encoding design decisions
- **Design system** — Tokens, components, patterns, guidelines, and tooling for UI consistency
- **Component API** — Props interface defining how a component is consumed

---

## Don't Do

- Do not skip reading the full task specification before executing
- Do not create from scratch when similar patterns exist in the design system
- Do not hardcode values that should be design tokens
- Do not skip validation steps defined in the task workflow

