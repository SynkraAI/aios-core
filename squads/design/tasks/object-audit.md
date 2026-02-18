# Task: Object Consistency Audit

**Task ID:** object-audit
**Version:** 1.0
**Purpose:** Audit an existing system for object consistency across naming, relationships, CTA placement, and cross-screen integrity
**Agent:** @sophia-prater
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Audits an existing product or system through the lens of Object-Oriented UX to identify inconsistencies in how objects are named, structured, related, and acted upon across different screens and contexts. Many systems accumulate object-level debt over time: the same concept is named differently in different places, relationships are implied but not explicit, CTAs are inconsistently placed, and object hierarchy breaks down across views. This audit surfaces those issues and provides a remediation plan.

```
INPUT (product to audit, screen inventory, known issues)
    |
[PHASE 1: OBJECT DISCOVERY]
    -> Identify all objects present in the system across all screens
    |
[PHASE 2: CONSISTENCY ANALYSIS]
    -> Analyze naming, structure, CTA, and relationship consistency
    |
[PHASE 3: REMEDIATION PLAN]
    -> Prioritize findings and create object consistency roadmap
    |
OUTPUT: Object audit report with findings, severity ratings, and remediation roadmap
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| product_access | string | Yes | URL or application access for the product being audited |
| screen_inventory | list | Yes | List of screens or views to audit, or "all" for comprehensive audit |
| known_issues | list | Yes | Known UX inconsistencies or pain points reported by users or the team |
| user_research | file | No | User research data showing where users get confused by object inconsistency |
| data_model | file | No | Backend data model or API documentation for cross-referencing |
| previous_audit | file | No | Previous object audit for comparison |

---

## Preconditions

- The product is accessible and navigable for thorough review across all relevant user roles
- Screen inventory covers the critical user journeys, not just isolated pages
- Known issues have been collected from user feedback, support tickets, or team observations
- The auditor has sufficient domain knowledge to distinguish between intentional variations and genuine inconsistencies
- Stakeholders understand this is an analytical audit, not a redesign
- At least one domain expert is available for clarification questions during the audit

---

## Steps

### Phase 1: Object Discovery
1. Navigate through all screens in the inventory and identify every object presented to the user: what "things" appear on each screen?
2. For each object found, record: its name as displayed on screen, its context (where it appears), its attributes shown, and the CTAs available
3. Create a cross-screen object inventory: for each object, list every screen where it appears and how it is represented
4. Identify implicit objects: things that behave like objects (have identity, attributes, actions) but are not explicitly surfaced as such
5. Map the object hierarchy as it currently exists in the product: which objects contain other objects, which are peers, which are referenced
6. Document the object entry points: how does a user first encounter each object (navigation, search, notification, deep link)?
7. Note any objects that appear under different user roles with different representations or available actions

### Phase 2: Consistency Analysis
1. **Naming audit**: For each object, compare its name across all appearances; flag inconsistencies (e.g., "Item" on one screen, "Product" on another, "SKU" in the admin)
2. **Attribute consistency**: For the same object on different screens, compare which attributes are shown; flag missing attributes that should be present or extra attributes that confuse the representation
3. **CTA consistency**: Audit CTA placement, naming, and availability for each object across screens; flag cases where the same action uses different labels or where expected actions are missing
4. **Relationship consistency**: Verify that object relationships are consistently represented: if A contains B on one screen, B should reference A on its own screen
5. **Information hierarchy audit**: For each object view, assess whether the content priority makes sense: is the most important information most prominent?
6. **Cross-screen integrity**: Follow a single object instance through multiple screens and verify its representation is coherent: does a "Project" look and behave consistently whether seen in a list, detail view, or embedded in another object?
7. **Mental model alignment**: Compare the system's object model against the user's likely mental model (from research data); flag misalignments

### Phase 3: Remediation Planning
1. Classify each finding by severity: critical (causes user confusion or errors), major (inconsistent but workaround exists), minor (cosmetic inconsistency), informational
2. Group findings by object: create a per-object health scorecard showing the number and severity of issues
3. Prioritize remediation by impact: which objects are most central to user goals and have the most issues
4. For each finding, propose a specific fix: rename to X, add attribute Y to view Z, move CTA to position W
5. Estimate effort for each remediation action: small (naming change), medium (attribute restructure), large (relationship redesign)
6. Create a phased remediation roadmap: quick wins (naming standardization), medium term (attribute and CTA alignment), long term (structural redesign)
7. If a previous audit exists, calculate delta: what improved, what regressed, what is new

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| audit_report | markdown | Full audit report with all findings organized by object and severity |
| object_inventory | markdown table | Cross-screen object inventory showing all appearances and representations |
| naming_inconsistencies | markdown table | All naming variations for each object with recommended canonical name |
| cta_inconsistencies | markdown table | CTA variations per object with recommended standardization |
| remediation_roadmap | markdown | Phased plan for resolving object consistency issues |
| object_scorecards | markdown | Per-object health scores across consistency dimensions |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Screen coverage | blocking | Every screen in the inventory must be audited and all objects identified |
| Cross-screen tracing | blocking | At least 5 objects must be traced across all their screen appearances |
| Severity classification | blocking | Every finding must have a severity level and a specific remediation action |
| Naming recommendations | warning | Every naming inconsistency should include a recommended canonical name with rationale |
| User impact assessment | warning | Critical and major findings should reference user impact or research data |
| Effort estimation | warning | Remediation actions should include effort estimates for prioritization |

---

## Handoff

- **On completion:** Hand to @sophia-prater orca-process task for full ORCA redesign if structural issues are severe
- **On component inconsistencies:** Hand to @brad-frost for component audit alignment
- **On naming standardization:** Hand to @sophia-prater ux-objects task for canonical object naming
- **On CSS inconsistencies:** Hand to @andy-bell for CSS audit alignment
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

