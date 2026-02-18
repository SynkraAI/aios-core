# Task: Map Object Relationships

**Task ID:** relationship-map
**Version:** 1.0
**Purpose:** Map relationships between UX objects including containment, association, dependency, and inheritance using the Nested Object Matrix
**Agent:** @sophia-prater
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Maps the relationships between all identified UX objects to produce a complete picture of how objects connect, contain, depend on, and inherit from each other. The primary output is the Nested Object Matrix (NOM), a powerful OOUX tool that shows which objects appear nested within other objects' views. Relationship mapping is critical because it directly informs navigation design, component composition, data architecture, and the user's ability to traverse the system to accomplish goals.

```
INPUT (object inventory, user flows, system context)
    |
[PHASE 1: RELATIONSHIP DISCOVERY]
    -> Identify all relationships between objects from content and flows
    |
[PHASE 2: MATRIX CONSTRUCTION]
    -> Build the Nested Object Matrix and classify relationship types
    |
[PHASE 3: VALIDATION AND DESIGN IMPLICATIONS]
    -> Validate relationships and derive navigation and component implications
    |
OUTPUT: Nested Object Matrix with classified relationships and design implications
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| object_inventory | file | Yes | Validated UX object inventory with definitions (from ux-objects or object-map task) |
| user_flows | list | Yes | Key user flows that traverse multiple objects |
| system_context | string | Yes | Description of the system: is it a marketplace, CMS, SaaS tool, social platform, etc. |
| data_model | file | No | Backend data model or API schema for relationship cross-reference |
| existing_navigation | string | No | Current navigation structure for gap analysis |
| object_map | file | No | Existing object map to enhance with detailed relationships |

---

## Preconditions

- A validated UX object inventory exists with at least 5 objects identified and defined
- Key user flows are documented showing how users move between objects to accomplish goals
- The team understands relationship types: containment is not the same as association
- System context is clear enough to distinguish natural relationships from forced ones
- Stakeholders can validate relationship accuracy against domain knowledge
- If a data model exists, it is accessible for cross-referencing with UX relationships

---

## Steps

### Phase 1: Relationship Discovery
1. For each pair of objects in the inventory, ask: "Does a meaningful relationship exist between these two objects?" Document yes/no and the evidence
2. Classify discovered relationships by type:
   - **Containment**: Object A contains Object B (e.g., Album contains Photos)
   - **Association**: Object A is related to Object B without containment (e.g., User is associated with Team)
   - **Dependency**: Object A requires Object B to exist (e.g., Order depends on Product)
   - **Inheritance**: Object B is a specialized type of Object A (e.g., Admin is a type of User)
3. Define cardinality for each relationship: one-to-one, one-to-many, many-to-many
4. Identify relationship directionality: is the relationship bidirectional or does it have a primary direction?
5. Trace user flows through objects: for each flow, record the sequence of objects visited and the transitions between them
6. Identify missing relationships: are there user goals that require moving between objects with no defined relationship?

### Phase 2: Nested Object Matrix Construction
1. Create the NOM grid: objects as both rows and columns; each cell indicates whether the row object appears nested within the column object's view
2. For each cell in the NOM, specify the nesting context: does the row object appear as a summary card, a full inline view, a linked reference, or a count/badge?
3. Mark the density of nesting: how many instances of the nested object typically appear (1, few, many)?
4. Identify reciprocal nesting: if A nests within B, does B also nest within A? Reciprocal nesting indicates strong association
5. Highlight asymmetric relationships: cases where A nests in B but B does not nest in A, indicating a one-directional containment or reference
6. Calculate object connectivity score: how many other objects does each object nest within or contain? Highly connected objects are navigation hubs

### Phase 3: Validation and Design Implications
1. **Navigation derivation**: Use the NOM to derive the navigation structure: high-connectivity objects become primary navigation items, containment relationships become sub-navigation
2. **Component implications**: Identify component needs from the NOM: each nesting context suggests a component variant (summary card, inline view, reference link)
3. **Cross-reference with data model**: If available, compare the UX relationship model with the backend data model; flag discrepancies where the user's mental model differs from the data structure
4. **User flow validation**: Trace each key user flow through the relationship map; verify that every transition is supported by a relationship
5. **Identify relationship gaps**: Find user flows that require transitions between unrelated objects and propose new relationships
6. **Stakeholder review**: Present the NOM and relationship classifications to domain stakeholders for accuracy validation
7. **Circular dependency check**: Identify any circular containment relationships that could create confusing navigation loops
8. **Design recommendations**: Produce specific recommendations for navigation, component composition, and information architecture based on the relationship analysis

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| nested_object_matrix | markdown table | Complete NOM grid showing all object nesting relationships |
| relationship_catalog | markdown | All relationships classified by type, cardinality, and directionality |
| connectivity_scores | markdown table | Object connectivity scores for navigation prioritization |
| navigation_recommendations | markdown | Recommended navigation structure derived from relationship analysis |
| component_implications | markdown | Component needs identified from nesting contexts |
| flow_validation | markdown | User flow traces through the relationship map with gap analysis |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Pair coverage | blocking | Every object pair must be evaluated for potential relationship |
| Cardinality specified | blocking | Every identified relationship must have cardinality defined |
| NOM completeness | blocking | The Nested Object Matrix must include all objects from the inventory |
| User flow support | warning | Every key user flow should be traceable through the relationship map without gaps |
| Bidirectional check | warning | Every relationship should be evaluated from both directions |
| Data model alignment | warning | If a data model exists, discrepancies with the UX model should be documented |

---

## Handoff

- **On completion:** Hand to @sophia-prater cta-design task for CTA design informed by relationships
- **On component architecture:** Hand to @brad-frost for component composition design from nesting contexts
- **On layout needs:** Hand to @andy-bell for layout system design based on nesting density and composition
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

