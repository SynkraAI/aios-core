# Task: Run ORCA Process

**Task ID:** orca-process
**Version:** 1.0
**Purpose:** Run the complete ORCA process from Objects through Relationships, CTAs, and Attributes for full object-oriented UX design
**Agent:** @sophia-prater
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Executes the complete ORCA process: the four-step Object-Oriented UX methodology that moves from Objects (identifying the nouns in a system), through Relationships (mapping how objects connect), CTAs (defining the verbs/actions), and Attributes (specifying the properties). ORCA produces a complete conceptual model of a system that bridges the gap between user research and UI design, ensuring that the interface is structured around the real-world objects users think in terms of rather than arbitrary page structures.

```
INPUT (domain research, user goals, content inventory)
    |
[PHASE 1: OBJECTS AND RELATIONSHIPS]
    -> Identify system objects and map their interconnections
    |
[PHASE 2: CTAs AND ATTRIBUTES]
    -> Define actions for each object and specify their attributes
    |
[PHASE 3: SYNTHESIS]
    -> Produce complete ORCA model and map to UI structure
    |
OUTPUT: Complete ORCA model with object-to-component mapping
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| domain_research | file | Yes | Domain research: user interviews, content audit, stakeholder documents, competitive analysis |
| user_goals | list | Yes | Primary user goals and tasks to be supported by the system |
| content_inventory | list | Yes | Existing content types and structures in the system |
| existing_object_map | file | No | Previously created object map to build upon (from object-map task) |
| technical_constraints | string | No | Backend data model or API constraints that affect object design |
| scope | enum(full, objects-only, ctas-only, attributes-only) | No | Scope of the ORCA pass; defaults to full |

---

## Preconditions

- Domain research materials are collected and accessible for reference
- User goals have been identified through research, not assumptions
- At least a preliminary content inventory exists for the system
- The team understands OOUX principles and is committed to an object-first approach
- Stakeholders are available for validation at the end of each ORCA step
- If a backend data model exists, it is documented and available for cross-referencing
- The team is prepared to iterate on the ORCA model as new insights emerge

---

## Steps

### Phase 1: Objects and Relationships
1. **Noun foraging**: Systematically extract nouns from all research materials: interview transcripts, content inventories, competitor analysis, domain documentation
2. **Object identification**: From the noun list, identify the core objects: things users interact with that have their own identity, lifecycle, and set of actions
3. **Object prioritization**: Rank objects by centrality: which objects are most critical to user goals, most frequently referenced, and most interconnected
4. **Relationship mapping**: For each object pair, determine if a relationship exists and its nature: containment (parent-child), association (peer), dependency (requires), aggregation (collection-of)
5. **Cardinality definition**: Specify the cardinality of each relationship: one-to-one, one-to-many, many-to-many; note required vs. optional relationships
6. **Nested Object Matrix (NOM)**: Build the NOM showing which objects appear nested within other objects' views and in what contexts
7. **Validation checkpoint**: Review objects and relationships with a domain stakeholder; iterate on naming, grouping, and relationship accuracy

### Phase 2: CTAs and Attributes
1. **CTA foraging**: Extract verbs and actions from user research: what do users want to do with each object? What are the tasks that reference these objects?
2. **CTA classification**: For each object, classify CTAs as primary (the most important action, one per object), secondary (common actions), and tertiary (less frequent or contextual actions)
3. **CTA-object mapping**: Map each CTA to the object it acts upon; identify CTAs that span multiple objects (e.g., "Compare" acts on two Product objects)
4. **CTA sequencing**: Order CTAs by the typical user flow: discovery, evaluation, action, confirmation; identify prerequisite CTAs (must do X before Y)
5. **Attribute identification**: For each object, list all attributes: core content (always visible), extended content (visible on detail), metadata (system-tracked), computed (derived from other data)
6. **Attribute prioritization**: Rank attributes by importance for each view context: what appears in a list view vs. detail view vs. inline reference
7. **Cross-reference check**: Verify that every user goal can be accomplished through a sequence of CTAs on identified objects with their defined attributes

### Phase 3: Synthesis and UI Mapping
1. **Complete ORCA model assembly**: Combine Objects, Relationships, CTAs, and Attributes into a unified model document
2. **Object-to-screen mapping**: Map each object to the screens or views where it appears: list views, detail views, creation forms, editing interfaces, embedded references
3. **Component identification**: Identify which UI components each object requires: cards (collection view), detail panels (instance view), forms (creation/editing), inline references (embedded in other objects)
4. **Navigation structure**: Derive the navigation architecture from the object map: primary navigation maps to top-level objects, secondary navigation to relationships
5. **Priority guide creation**: For each object view, create a priority guide ordering content elements from most to least important
6. **Search and discovery mapping**: Define how each object is found by users: navigation, search, filtering, cross-object references, notifications
7. **Model documentation**: Document the complete ORCA model with visual diagrams, relationship matrices, CTA inventories, and attribute specifications
8. **Handoff preparation**: Create a summary artifact specifically for downstream design and development teams

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| orca_model | markdown + diagram | Complete ORCA model with all four layers documented |
| nested_object_matrix | markdown table | NOM showing object nesting contexts and view types |
| cta_inventory | markdown table | All CTAs classified by object, priority, and sequence |
| attribute_specs | markdown table | All attributes per object with view-context prioritization |
| component_map | markdown | Object-to-UI-component mapping for design system alignment |
| priority_guides | markdown | Content priority guides for each major object view |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Goal coverage | blocking | Every identified user goal must be achievable through the ORCA model's CTAs |
| Object integrity | blocking | Every object must have defined attributes, at least one CTA, and at least one relationship |
| Relationship completeness | blocking | Every relationship must have defined cardinality and must be bidirectionally documented |
| CTA traceability | warning | Every CTA should trace back to a user research insight or stated user goal |
| Attribute prioritization | warning | Attributes should be prioritized for at least 2 view contexts (list and detail) |
| Naming consistency | warning | Object and CTA names should use consistent domain language throughout the model |

---

## Handoff

- **On completion:** Hand to @brad-frost for component architecture mapping from ORCA objects to atomic design
- **On layout needs:** Hand to @andy-bell for layout system design based on object view requirements
- **On visual direction:** Hand to @dan-mall for element collage creation aligned with object model
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

