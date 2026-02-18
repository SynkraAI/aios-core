# Checklist: Object Consistency Review

**ID:** object-consistency-review
**Version:** 1.0
**Purpose:** Reviews object consistency across screens verifying naming, bidirectional relationships, appropriate CTAs, orphan detection, and Nested Object Matrix completeness
**Agent:** @sophia-prater
**Quality Gate:** WARNING

---

## Prerequisites

- [ ] Object-Oriented UX (OOUX) discovery has been conducted
- [ ] Object map or Nested Object Matrix (NOM) has been drafted
- [ ] At least two screens or contexts exist to verify cross-screen consistency
- [ ] Stakeholders have agreed on the core object model

---

## Section 1: Object Naming

- [ ] Each object has a single, canonical name used across all screens
- [ ] Object names are user-facing terms (not database table names or developer jargon)
- [ ] Plural and singular forms are used consistently (e.g., "Order" on detail, "Orders" on list)
- [ ] Object names do not conflict with actions or properties (no "Search" as both object and action)
- [ ] Names are understandable by the target audience without explanation
- [ ] Naming has been validated with user research or stakeholder review
- [ ] Object name appears in the UI where the object is displayed (title, breadcrumb, label)

## Section 2: Bidirectional Relationships

- [ ] Parent-child relationships are navigable in both directions
- [ ] If Object A links to Object B, Object B links back to Object A
- [ ] Relationship cardinality is consistent (one-to-many, many-to-many)
- [ ] Relationship labels are meaningful (not just "Related" or "See Also")
- [ ] Cross-object navigation is available without browser back button
- [ ] Relationship consistency is maintained across mobile and desktop views
- [ ] Deleted or removed objects handle relationship cleanup gracefully

## Section 3: Calls to Action (CTAs)

- [ ] CTAs are appropriate for the object's context (list view vs detail view)
- [ ] Primary CTA per screen is clearly distinguished from secondary actions
- [ ] CRUD actions (Create, Read, Update, Delete) are available where expected
- [ ] CTAs use action verbs specific to the object (not generic "Submit" or "Go")
- [ ] Destructive actions require confirmation
- [ ] CTA availability respects user permissions and object state
- [ ] CTAs are placed consistently relative to the object they act upon

## Section 4: Orphan Object Detection

- [ ] No objects exist that cannot be reached through navigation
- [ ] Every object instance is accessible from at least one list or parent
- [ ] Search results include all object types
- [ ] Objects are not orphaned when parent objects are deleted
- [ ] Archival and soft-delete do not create unreachable orphans
- [ ] Audit has been performed across all screens to verify reachability

## Section 5: Nested Object Matrix (NOM)

- [ ] NOM document exists and is current
- [ ] All core objects are listed as rows in the matrix
- [ ] All content elements (metadata, properties) are identified per object
- [ ] Nested objects within each core object are identified
- [ ] CTAs per object per context are documented
- [ ] NOM has been reviewed by design and development leads
- [ ] NOM is updated when new objects or screens are added

## Section 6: Cross-Screen Consistency

- [ ] Object representation (card, row, detail) is consistent across screens
- [ ] Metadata shown for an object is the same set in all contexts (or is a documented subset)
- [ ] Object status indicators (badges, colors, icons) are consistent
- [ ] Sort and filter options are consistent for the same object type across screens
- [ ] Empty states are handled consistently for the same object type
- [ ] Object creation flows produce consistent results regardless of entry point

---

## Scoring

| Category | Items | Pass | Status |
|----------|-------|------|--------|
| Object Naming | 7 | _ | PENDING |
| Bidirectional Relationships | 7 | _ | PENDING |
| Calls to Action | 7 | _ | PENDING |
| Orphan Detection | 6 | _ | PENDING |
| Nested Object Matrix | 7 | _ | PENDING |
| Cross-Screen Consistency | 6 | _ | PENDING |

**Minimum passing score:** 75%
**Blocking items:** Object Naming and Orphan Detection must all pass
