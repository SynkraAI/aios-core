# Task: Identify UX Objects

**Task ID:** ux-objects
**Version:** 1.0
**Purpose:** Identify and define UX objects through systematic noun foraging from content analysis, stakeholder input, and domain modeling
**Agent:** @sophia-prater
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Identifies and defines the UX objects in a system through a rigorous noun foraging process. UX objects are the "things" that users think about, interact with, and care about in a product domain. Unlike traditional feature-based or page-based thinking, object identification grounds the UX in the user's mental model of the domain. This task uses systematic content analysis, stakeholder interviews, and domain modeling to surface, validate, and prioritize objects before any screen design begins.

```
INPUT (domain materials, stakeholder access, user research)
    |
[PHASE 1: NOUN FORAGING]
    -> Systematically extract nouns from all available sources
    |
[PHASE 2: OBJECT CRYSTALLIZATION]
    -> Filter, cluster, and define genuine UX objects from raw nouns
    |
[PHASE 3: PRIORITIZATION AND VALIDATION]
    -> Rank objects by importance and validate with stakeholders
    |
OUTPUT: Validated UX object inventory with definitions and priority rankings
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| domain_materials | list | Yes | All available domain materials: marketing content, product docs, support FAQs, competitor content |
| stakeholder_access | boolean | Yes | Whether stakeholders are available for interviews and validation |
| user_research | file | Yes | User research artifacts: interview transcripts, survey results, journey maps, personas |
| existing_product | string | No | URL or access to existing product for screen-level noun analysis |
| domain_glossary | file | No | Existing domain glossary or terminology guide |
| data_model | file | No | Backend data model documentation for cross-referencing |

---

## Preconditions

- Sufficient domain materials exist to conduct meaningful noun foraging (at least 3 distinct sources)
- User research has been conducted and artifacts are available for analysis
- The team understands the distinction between objects and non-objects (attributes, actions, UI elements)
- Stakeholders are available for at least one validation session
- There is commitment to using identified objects as the foundation for UX design decisions
- The domain is scoped clearly enough to avoid identifying objects from adjacent but out-of-scope systems
- A working session has been scheduled for stakeholder validation within 2 weeks of foraging

---

## Steps

### Phase 1: Noun Foraging
1. **Content source preparation**: Gather all domain materials and organize by type: product content (website, app, docs), user voice (interviews, surveys, tickets), business voice (stakeholder docs, strategy), competitor content
2. **Systematic extraction**: Read through each source and highlight every noun; record the noun, its source, and the sentence context where it appeared
3. **Frequency analysis**: Count how many times each noun appears across all sources; high-frequency nouns are strong object candidates
4. **Source diversity scoring**: Track how many different source types mention each noun; nouns appearing in product content, user voice, and business voice are strongest candidates
5. **User language mapping**: Note which nouns users themselves use (from interviews and surveys) vs. which are internal business terms; prefer user language
6. **Raw noun inventory**: Compile the complete raw noun list with frequency counts, source diversity scores, and user language indicators

### Phase 2: Object Crystallization
1. **Synonym clustering**: Group nouns that refer to the same concept (e.g., "listing", "property", "home" might all refer to the same object in a real estate context); choose the canonical name
2. **Object test**: For each noun cluster, apply the object test: Does it have its own identity? Can you have a collection of them? Do users perform actions on it? Does it have attributes? If yes to most, it qualifies as a UX object
3. **Attribute extraction**: For nouns that fail the object test, determine if they are attributes of an object (e.g., "price" is an attribute of "Product", not its own object)
4. **Action extraction**: For verbs found during foraging, note them as potential CTAs associated with specific objects
5. **Object definition**: For each confirmed object, write a clear definition: what it is, what it is not, an example instance, and why users care about it
6. **Edge case objects**: Identify objects that are borderline: they might be objects in some contexts and attributes in others; document the decision and rationale

### Phase 3: Prioritization and Validation
1. **Priority scoring**: Score each object on three dimensions: user centrality (how central to user goals, 1-5), business value (how important to business outcomes, 1-5), interconnectedness (how many relationships with other objects, 1-5)
2. **Object ranking**: Sort objects by composite priority score; identify Tier 1 (core objects, must design first), Tier 2 (important supporting objects), Tier 3 (peripheral objects)
3. **Stakeholder validation**: Present the object inventory to stakeholders; for each object, confirm: naming is correct, definition is accurate, priority is appropriate, nothing is missing
4. **User validation**: If possible, validate object names and groupings with users through card sorting or concept testing
5. **Gap analysis**: Review the inventory for missing objects: are there user goals that cannot be achieved through the identified objects? Are there business processes without corresponding objects?
6. **Cross-reference with data model**: If a backend data model exists, compare UX objects against data entities; document where they align and where they diverge
7. **Scope boundaries**: For each Tier 1 object, document explicit boundaries: what is part of this object and what is a separate object
8. **Final inventory**: Produce the validated, prioritized UX object inventory with definitions, priority tiers, and validation status

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| object_inventory | markdown table | Complete inventory of UX objects with definitions, priorities, and validation status |
| noun_foraging_log | markdown | Raw noun extraction results with frequency, source diversity, and classification |
| object_definitions | markdown | Detailed definition for each object: what it is, what it is not, example, user relevance |
| edge_case_log | markdown | Borderline objects with documented decision rationale for inclusion or exclusion |
| priority_matrix | markdown | Object priority scoring across user centrality, business value, and interconnectedness |
| validation_notes | markdown | Stakeholder and user feedback on object identification and naming |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Source diversity | blocking | Noun foraging must draw from at least 3 distinct source types |
| Object test applied | blocking | Every proposed object must pass the object test with documented results |
| Priority scoring | blocking | Every object must have a composite priority score with individual dimension scores |
| Stakeholder sign-off | warning | At least one stakeholder should validate the object inventory |
| User language preference | warning | Object names should prefer user language over internal business terminology |
| Gap analysis complete | warning | Identified gaps between objects and user goals must be documented |

---

## Handoff

- **On completion:** Hand to @sophia-prater object-map task for object map creation with relationships
- **On relationship mapping:** Hand to @sophia-prater relationship-map task for detailed NOM creation
- **On component needs:** Hand to @brad-frost for mapping objects to atomic design components
- **On visual exploration:** Hand to @dan-mall for element collage creation based on identified objects
- **On issues:** Escalate to @design-chief

---

## Glossary

> Full glossary: [design-glossary.md](../data/design-glossary.md)

**Key terms for this task:**

- **Pattern library** — Organized collection of reusable UI patterns with documentation
- **Interface inventory** — Cataloging every unique UI element to identify inconsistencies
- **Pattern consolidation** — Merging similar patterns to establish canonical versions
- **Design language** — Shared visual rules and vocabulary defining product identity
- **Shared vocabulary** — Team-aligned naming ensuring designers and developers use the same terms

---

## Don't Do

- Do not inventory patterns without checking for existing pattern libraries first
- Do not consolidate patterns before completing a full interface inventory
- Do not name patterns inconsistently — follow the shared vocabulary and naming convention
- Do not create a new pattern when an existing one can be extended or adapted
- Do not skip the validation step that confirms consolidated patterns cover original usage

