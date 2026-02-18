# Task: Classify Design Patterns

**Task ID:** pattern-classify
**Version:** 1.0
**Purpose:** Classifies patterns into functional (solve a problem) and perceptual (create a feeling), mapping purpose, context, and variations
**Agent:** @alla-kholmatova
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

This task provides a systematic approach to classifying design patterns according to Alla Kholmatova's dual-nature framework. Every pattern in a design system serves either a functional purpose (helping users accomplish something) or a perceptual purpose (shaping how users feel), and often both. By explicitly classifying patterns, teams gain clarity on why each pattern exists and when to use it.

Without explicit classification, patterns accumulate without purpose, leading to redundancy and inconsistency. This task brings intentionality to the pattern library by forcing every pattern to justify its existence through a clear purpose statement and classification.

```
INPUT (pattern list, product context, user needs)
    ↓
[PHASE 1: COLLECTION]
    → Gather all patterns, capture screenshots, note current usage
    ↓
[PHASE 2: CLASSIFICATION]
    → Analyze each pattern's purpose, assign functional/perceptual category
    ↓
[PHASE 3: MAPPING]
    → Create classification map with relationships and variations
    ↓
OUTPUT: Pattern Classification Report
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| pattern_list | list | Yes | List of patterns to classify, with names and screenshots or descriptions |
| product_context | object | Yes | Product domain, primary user tasks, and brand identity |
| user_needs | list | Yes | Core user needs the product addresses |
| design_principles | list | No | Existing design principles to evaluate patterns against |

---

## Preconditions

- A pattern inventory or component library exists with identifiable patterns
- Product context and user research insights are available
- Design language principles have been defined or stakeholders can articulate design intent
- The team agrees on the distinction between functional and perceptual patterns
- Access to all product screens and user journey maps for context
- Stakeholders are available for classification validation workshops

---

## Steps

### Phase 1: Collection
1. Enumerate all patterns from the existing component library, UI kit, or production codebase
2. Capture a visual reference (screenshot or link) for each pattern in its primary usage context
3. Document current naming and any informal descriptions used by the team
4. Note frequency of use: how often each pattern appears across the product
5. Identify patterns that appear similar but serve different purposes (potential duplicates or variants)

### Phase 2: Classification
1. For each pattern, answer the core question: "Does this primarily solve a problem or create a feeling?"
2. Assign primary classification: Functional (enables a task, provides information, facilitates navigation) or Perceptual (sets tone, creates atmosphere, reinforces brand)
3. Assign secondary classification where applicable — many patterns have dual nature (e.g., a button is functional but its style is perceptual)
4. Document the purpose statement for each pattern: one sentence explaining why it exists
5. Identify contextual variations: how does the pattern change across different contexts (mobile vs desktop, error vs success state)
6. Rate the confidence level for each classification: High (clear purpose), Medium (dual nature), Low (purpose unclear — needs design review)
7. Cross-reference each classification against stated design principles to verify alignment

### Phase 3: Mapping
1. Create the classification map: a structured document grouping patterns by their primary classification
2. Map relationships between patterns: which functional patterns depend on which perceptual patterns
3. Identify gaps: user needs that lack a corresponding functional pattern, or brand attributes without perceptual expression
4. Flag inconsistencies: patterns that contradict the stated design principles or brand attributes
5. Produce recommendations: patterns to consolidate, rename, or create

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| classification-report | Markdown | Full report with each pattern classified, purpose-stated, and contextualized |
| pattern-map | Markdown table | Structured map of functional vs perceptual patterns with relationships |
| gap-analysis | Markdown | Identified gaps between user needs, brand attributes, and existing patterns |
| recommendations | Markdown list | Actionable recommendations for pattern consolidation, creation, or retirement |
| confidence-ratings | Markdown table | Confidence level for each classification with justification |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| complete_coverage | blocking | Every pattern in the input list must have a classification and purpose statement |
| purpose_clarity | blocking | Each purpose statement must be a single, unambiguous sentence |
| dual_nature_documented | warning | Patterns with both functional and perceptual roles must document both aspects |
| gap_identification | blocking | At least one gap analysis pass must be completed against user needs |
| relationship_mapping | warning | Inter-pattern dependencies should be explicitly documented |
| confidence_rated | warning | Each classification should include a confidence level rating |
| principles_aligned | warning | Classifications should be validated against existing design principles |

---

## Handoff

- **On completion:** Hand to @alla-kholmatova for pattern-inventory task to organize classified patterns by user need
- **On completion (alt):** Hand to @jina-anne for token-architecture to map perceptual patterns to design tokens
- **On completion (alt):** Hand to @heydon-pickering for inclusive-audit to verify functional patterns meet accessibility needs
- **On issues:** Escalate to @design-chief
- **Dependencies:** Best preceded by design-language task; feeds into pattern-inventory and token-architecture

---

## Related Tasks

| Task | Relationship | Description |
|------|-------------|-------------|
| design-language | Upstream | Provides the vocabulary and principles for classification |
| pattern-inventory | Downstream | Organizes classified patterns by user need |
| token-architecture | Downstream | Maps perceptual patterns to design tokens |
| inclusive-audit | Parallel | Verifies classified functional patterns meet accessibility needs |

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

