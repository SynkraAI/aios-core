# Task: Pattern Matching and Recommendation

**Task ID:** pattern-match
**Version:** 1.0
**Purpose:** Recommend the most appropriate UI pattern for a given user need or problem description
**Agent:** @jenifer-tidwell
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Given a user problem, task description, or interaction need, this task searches known pattern libraries and recommends the most appropriate UI pattern. Considers user context, device constraints, content type, and frequency of use to select patterns that solve the problem effectively. This is the go-to task when a designer asks "what pattern should I use for this?"

```
INPUT (problem description, user context, constraints)
    |
[PHASE 1: PROBLEM ANALYSIS]
    -> Decompose the problem into interaction dimensions
    |
[PHASE 2: PATTERN SEARCH]
    -> Search pattern libraries and identify candidates
    |
[PHASE 3: RECOMMENDATION]
    -> Evaluate candidates and recommend with rationale
    |
OUTPUT: Pattern recommendation with rationale, examples, and implementation notes
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| problem_description | string | Yes | What the user needs to accomplish or the interaction problem to solve |
| user_expertise | enum(novice, intermediate, expert, mixed) | Yes | Expertise level of the target users |
| platform | enum(web-desktop, web-mobile, native-ios, native-android, responsive) | Yes | Target platform for the pattern |
| content_volume | enum(few, moderate, many, massive) | No | Amount of content the pattern must handle |
| frequency_of_use | enum(once, occasional, frequent, constant) | No | How often users will perform this interaction |

---

## Preconditions

- The problem description is specific enough to identify the core interaction need
- The target user group has been identified (even if broadly)
- Platform constraints are known so pattern recommendations are technically feasible
- The designer has not yet committed to a specific implementation approach

---

## Steps

### Phase 1: Problem Analysis
1. Parse the problem description into interaction dimensions:
   - **Task type**: data entry, data browsing, navigation, selection, configuration, communication
   - **Object type**: what the user is acting on (list of items, single record, form fields, media, text)
   - **Action type**: create, read, filter, sort, edit, delete, share, compare, organize
2. Identify user characteristics that affect pattern choice:
   - Expertise level: novices need guidance patterns; experts need efficiency patterns
   - Frequency: one-time tasks favor wizards; frequent tasks favor shortcuts
   - Context: mobile users need thumb-friendly patterns; desktop users can use complex layouts
3. Identify content characteristics:
   - Volume: few items favor simple lists; massive datasets need virtual scrolling or search-first patterns
   - Heterogeneity: uniform items favor grids; mixed types favor cards or flexible layouts
   - Hierarchy: flat data suits tables; nested data needs tree views or drill-down patterns
4. Document constraints: accessibility requirements, brand guidelines, existing patterns in the product, technical limitations
5. Formulate the pattern search query: "I need a pattern for [task type] of [object type] by [user type] on [platform] with [constraints]"

### Phase 2: Pattern Library Search
1. Search across multiple pattern libraries:
   - Tidwell's Designing Interfaces: navigation, page layout, lists, actions, forms, builders, information graphics
   - Material Design patterns: communication, navigation, selection
   - Apple HIG patterns: modality, navigation, data entry
   - Platform-specific patterns for the target platform
2. For each matching pattern, record: pattern name, source library, problem it solves, when to use, when not to use
3. Identify 3-5 candidate patterns that match the problem dimensions
4. For each candidate, check for known anti-pattern variants (ways the pattern is commonly misapplied)
5. Check the product's existing pattern usage: is any candidate already in use in another context (prefer consistency)

### Phase 3: Evaluation and Recommendation
1. Score each candidate pattern on:
   - **User fit** (1-5): Does it match user expertise and frequency of use?
   - **Content fit** (1-5): Does it handle the content volume and type effectively?
   - **Platform fit** (1-5): Does it work well on the target platform?
   - **Consistency** (1-5): Does it align with patterns already in the product?
   - **Accessibility** (1-5): Does it support keyboard navigation, screen readers, and contrast requirements?
2. Rank candidates by total score and select the top recommendation
3. Write the recommendation with:
   - Pattern name and definition from the source library
   - Why this pattern fits the problem (tied to the analysis dimensions)
   - When this pattern works best and when it fails
   - Real-world examples of this pattern in popular products
   - Key implementation considerations for the target platform
4. Provide an alternative recommendation (second-ranked pattern) in case constraints change
5. Note any adaptations needed to fit the pattern to the specific context

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| pattern-recommendation | markdown | Primary pattern recommendation with rationale and examples |
| candidate-comparison | markdown table | All evaluated candidates with scores across fit dimensions |
| implementation-notes | markdown | Platform-specific implementation considerations and adaptations |
| alternative-pattern | markdown | Second-choice pattern recommendation for consideration |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Problem decomposition | blocking | Problem must be analyzed across task, object, action, and user dimensions |
| Multiple candidates | blocking | At least 3 candidate patterns must be evaluated before recommending |
| Scoring transparency | blocking | Each candidate must have scores on all 5 evaluation dimensions |
| Library citation | warning | Recommended pattern must reference the source library and definition |
| Alternative provided | warning | At least one alternative pattern must be documented |
| Anti-pattern warning | warning | Known misuse scenarios for the recommended pattern must be noted |

---

## Handoff

- **On completion:** Hand to @brad-frost for component-level implementation of the recommended pattern
- **On layout pattern:** Hand to @jenifer-tidwell (layout-analysis) for layout integration planning
- **On navigation pattern:** Hand to @jenifer-tidwell (navigation-analysis) for navigation context fit
- **On accessibility requirements:** Hand to @stephanie-walter for accessibility compliance review
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

