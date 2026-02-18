# Task: UI Pattern Audit

**Task ID:** pattern-audit
**Version:** 1.0
**Purpose:** Audit existing UI patterns against established interaction design pattern libraries to identify anti-patterns and improvements
**Agent:** @jenifer-tidwell
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Systematically evaluates the UI patterns used in a product against established interaction design pattern libraries (Tidwell's Designing Interfaces, Yahoo Pattern Library, UI-Patterns.com). Identifies correctly applied patterns, misused patterns, anti-patterns, and opportunities where known patterns could replace custom solutions. This audit improves usability by aligning the product with proven interaction models.

```
INPUT (product screens, user flows, target pattern library)
    |
[PHASE 1: PATTERN IDENTIFICATION]
    -> Catalog every interaction pattern in use across the product
    |
[PHASE 2: PATTERN EVALUATION]
    -> Assess each pattern against library standards and best practices
    |
[PHASE 3: RECOMMENDATION]
    -> Prioritize fixes and propose pattern replacements
    |
OUTPUT: Pattern audit report with findings, severity ratings, and remediation recommendations
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| product_screens | file[] | Yes | Screenshots or links to all screens/flows to audit |
| user_flows | string[] | Yes | Key user flows to trace patterns through (e.g., sign-up, checkout, search) |
| pattern_library | enum(tidwell, yahoo, material, custom) | Yes | Reference pattern library to evaluate against |
| known_issues | string[] | No | Usability issues already identified by research or analytics |
| user_research | file | No | User research findings that provide context for pattern evaluation |

---

## Preconditions

- Product screens represent current production state and are complete for all audited flows
- At least 3 complete user flows are available for pattern tracing
- The reference pattern library is accessible and understood by the auditor
- Analytics or heatmap data is available to supplement pattern evaluation (preferred but not required)

---

## Steps

### Phase 1: Pattern Identification
1. Walk through each user flow screen by screen and label every interaction pattern observed:
   - Navigation patterns: hub-and-spoke, pyramid, breadcrumbs, tabs, accordion, wizard/stepper
   - Content organization: card grid, list view, dashboard, master-detail, timeline
   - Input patterns: forgiving format, structured input, autocompletion, progressive disclosure
   - Social patterns: comment thread, activity feed, user profile, reaction/voting
   - Action patterns: inline edit, bulk actions, drag-and-drop, undo/redo
   - Feedback patterns: notifications, progress indicators, empty states, error messages
2. For each pattern instance, record: screen location, pattern name, purpose in context, and user task it supports
3. Count total pattern instances and unique pattern types across the product
4. Identify custom patterns that do not match any known library pattern
5. Map pattern density per screen: screens with many overlapping patterns may indicate complexity issues

### Phase 2: Pattern Evaluation
1. For each identified pattern, evaluate against the reference library:
   - **Correct use**: Pattern matches library definition, serves the right purpose, follows established interaction model
   - **Partial use**: Pattern is recognizable but deviates from the standard (missing affordances, altered behavior)
   - **Misuse**: Pattern is applied to a problem it was not designed for (e.g., accordion used for sequential wizard steps)
   - **Anti-pattern**: Implementation contradicts established usability principles (mystery meat navigation, hidden primary actions)
2. Check pattern consistency: same interaction pattern should behave identically everywhere it appears
3. Evaluate pattern appropriateness for the user context: expert users may benefit from different patterns than novices
4. Identify missing patterns: user tasks that would benefit from a known pattern but currently use a custom or inferior solution
5. Cross-reference known issues and analytics data with pattern findings to identify correlation
6. Rate each finding by severity: critical (blocks task completion), major (causes confusion or errors), minor (suboptimal but functional)

### Phase 3: Recommendations and Remediation
1. For each misused or anti-pattern finding, recommend a replacement pattern from the library with justification
2. For each partial-use finding, describe the specific changes needed to align with the full pattern
3. For missing patterns, propose a candidate pattern and describe how it would integrate with existing screens
4. Prioritize recommendations using impact-effort matrix: high-impact/low-effort fixes first
5. Group recommendations by user flow to support incremental implementation
6. Create before/after descriptions for the top 5 highest-impact recommendations
7. Summarize overall pattern health: percentage of correct, partial, misused, and anti-pattern instances

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| pattern-inventory | markdown table | Every identified pattern with location, classification, and evaluation rating |
| audit-findings | markdown | Detailed findings organized by severity with evidence and reference |
| recommendation-list | markdown | Prioritized recommendations with replacement patterns and justification |
| pattern-health-summary | markdown | Overall metrics on pattern correctness and areas of concern |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Flow coverage | blocking | Every specified user flow must be traced and all patterns identified |
| Library reference | blocking | Each evaluation must cite the specific pattern from the reference library |
| Severity rating | blocking | Every finding must have a severity classification with rationale |
| Replacement specificity | warning | Pattern replacement recommendations must name the specific pattern and explain integration |
| Consistency check | warning | Same pattern used in different places must be evaluated for behavioral consistency |
| Prioritization | warning | Recommendations must be ordered by impact-effort and grouped by flow |

---

## Handoff

- **On completion:** Hand to @brad-frost for component-level implementation of pattern changes
- **On navigation findings:** Hand to @jenifer-tidwell (navigation-analysis) for deep navigation audit
- **On form findings:** Hand to @jenifer-tidwell (form-design) for form pattern redesign
- **On accessibility concerns:** Hand to @stephanie-walter for accessibility evaluation of flagged patterns
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

