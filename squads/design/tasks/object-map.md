# Task: Create Object Map

**Task ID:** object-map
**Version:** 1.0
**Purpose:** Create an object map identifying core objects, their properties, relationships, and CTAs in a system
**Agent:** @sophia-prater
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Creates a comprehensive object map of a system by identifying the core objects (nouns) that users interact with, their attributes, the relationships between them, and the actions (CTAs/verbs) available on each object. This is the foundational artifact of Object-Oriented UX (OOUX) methodology. The object map becomes the blueprint that aligns information architecture, interaction design, and UI component structure around real-world mental models rather than page-based thinking.

```
INPUT (domain context, user research, content inventory)
    |
[PHASE 1: NOUN FORAGING]
    -> Extract objects from content, stakeholder input, and domain analysis
    |
[PHASE 2: OBJECT DEFINITION]
    -> Define attributes, metadata, and core content for each object
    |
[PHASE 3: MAP ASSEMBLY]
    -> Assemble complete object map with relationships and CTAs
    |
OUTPUT: Object map with defined objects, attributes, relationships, and CTAs
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| domain_context | string | Yes | Description of the domain, product, or system being mapped |
| content_sources | list | Yes | Sources for noun foraging: existing content, user interviews, stakeholder docs, competitor analysis |
| user_types | list | Yes | Types of users who interact with the system and their primary goals |
| existing_ia | string | No | Current information architecture or sitemap for reference |
| competitor_systems | list | No | Competitor products to analyze for object patterns |
| scope | enum(full-system, feature, module) | No | Scope of the object map; defaults to full-system |

---

## Preconditions

- Domain context is well enough understood to identify at least the top-level objects
- Content sources are accessible for noun foraging (documents, URLs, transcripts)
- User types and their primary goals are documented, even if at a high level
- Stakeholders are available for validation of object identification and naming
- The team understands that objects are not pages or components but represent real-world things users care about
- At least 3 distinct content sources are available for cross-referencing noun frequency

---

## Steps

### Phase 1: Noun Foraging
1. Collect all content sources: marketing copy, product descriptions, user interview transcripts, support tickets, competitor screenshots, domain documentation
2. Read through each source and highlight every noun that represents a "thing" users interact with or care about (not UI elements, but domain objects)
3. Create a raw noun list organized by source; include frequency counts showing how often each noun appears
4. Cluster similar nouns: group synonyms, abbreviations, and variations (e.g., "order", "purchase", "transaction" might be the same object)
5. Eliminate non-objects: remove nouns that are attributes of objects (e.g., "name" is an attribute, not an object), UI elements (e.g., "button"), or abstract concepts that users do not directly interact with
6. Rank remaining objects by importance: frequency of mention, centrality to user goals, number of relationships with other objects

### Phase 2: Object Definition
1. For each identified object, define its **core content**: the essential information that represents this object (e.g., a "Product" has name, description, price, images)
2. Define **metadata**: supporting information about the object (e.g., creation date, status, author, category, tags)
3. Identify **nested objects**: objects that are contained within or closely attached to a parent object (e.g., "Review" is nested within "Product")
4. Define the **canonical instance view**: what does a single instance of this object look like? What information is essential vs. optional?
5. Define the **collection view**: how are multiple instances of this object presented? What summary information is shown in a list or grid?
6. Identify the **object lifecycle**: creation, active states, transitions, and end states (archived, deleted, completed)
7. Document **object permissions**: who can create, view, edit, and delete instances of this object; note role-based differences
8. Define the **object identity**: what uniquely identifies an instance of this object to a user (name, title, number, image)

### Phase 3: Map Assembly
1. Arrange objects visually in the object map: primary objects at center, secondary objects surrounding, nested objects connected
2. Draw relationships between objects: containment (has-a), association (related-to), dependency (requires), inheritance (is-a-type-of)
3. Label each relationship with its cardinality: one-to-one, one-to-many, many-to-many
4. Add CTAs (verbs/actions) to each object: primary CTA (the most important action), secondary CTAs, contextual CTAs
5. Validate the object map against user goals: trace each primary user goal through the object map to ensure the path is clear
6. Identify "hub objects": objects with the most relationships that serve as natural navigation anchors
7. Check for orphan objects: objects with no relationships that may indicate missing connections or misidentification
8. Review with stakeholders: present the object map, gather feedback, and iterate on object definitions and relationships

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| object_map | markdown + diagram | Complete object map with all objects, attributes, relationships, and CTAs |
| noun_inventory | markdown table | Cataloged nouns from foraging with frequency, source, and classification |
| object_definitions | markdown | Detailed definition of each object: core content, metadata, lifecycle |
| relationship_matrix | markdown table | Matrix showing all object-to-object relationships with cardinality |
| cta_inventory | markdown table | All CTAs organized by object with primary/secondary/contextual classification |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| User goal coverage | blocking | Every primary user goal must be traceable through the object map |
| Object completeness | blocking | Every foraging noun must be classified as an object, attribute, or eliminated with reason |
| Relationship definition | blocking | Every object must have at least one defined relationship to another object |
| CTA assignment | warning | Every object should have at least one primary CTA defined |
| Stakeholder validation | warning | Object map should be reviewed by at least one domain stakeholder |
| Naming clarity | warning | Object names should use domain language that users would recognize and use |

---

## Handoff

- **On completion:** Hand to @sophia-prater orca-process task for full ORCA process execution
- **On relationship detail needed:** Hand to @sophia-prater relationship-map task for detailed NOM creation
- **On component mapping:** Hand to @brad-frost for mapping objects to atomic design components
- **On visual direction:** Hand to @dan-mall for element collage alignment with object model
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

