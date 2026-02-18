# Task: Create Design Principles

**Task ID:** design-principles
**Version:** 1.0
**Purpose:** Facilitates creation of actionable design principles through workshop methodology, producing principles that are opinionated, memorable, and testable
**Agent:** @alla-kholmatova
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

This task guides the collaborative creation of design principles that serve as decision-making tools for the team. Unlike vague platitudes, effective design principles are opinionated (they take a stance), memorable (teams recall them without looking them up), and testable (you can evaluate a design against them). This methodology draws from Alla Kholmatova's workshop-based approach to building shared understanding.

The most valuable design principles are those that resolve real disagreements. A principle like "be user-friendly" is useless because no one would argue the opposite. A principle like "we choose simplicity over completeness" is powerful because it takes a real stance that guides difficult trade-offs.

```
INPUT (product values, team perspectives, design challenges)
    ↓
[PHASE 1: ELICITATION]
    → Gather team perspectives, identify recurring themes, surface tensions
    ↓
[PHASE 2: SYNTHESIS]
    → Distill themes into candidate principles, stress-test against real decisions
    ↓
[PHASE 3: FORMALIZATION]
    → Refine language, validate testability, document with examples
    ↓
OUTPUT: Design Principles Document
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| product_values | list | Yes | Core product values or mission statements to anchor principles |
| team_perspectives | list | Yes | Input from at least 3 different roles (design, engineering, product) |
| design_challenges | list | Yes | Real design decisions or dilemmas the team has faced recently |
| existing_principles | list | No | Any current principles to evaluate and potentially evolve |
| anti_examples | list | No | Examples of bad principles to avoid (vague, generic, untestable) |

---

## Preconditions

- Key stakeholders from design, engineering, and product are available for input
- The team has faced real design decisions that reveal underlying values and tensions
- There is agreement that principles should guide decisions, not just decorate walls
- Product vision and strategy are sufficiently defined to derive principles from
- Examples of past design disagreements or trade-offs are documented or can be recalled
- The team is prepared to commit to principles that may constrain future design choices

---

## Steps

### Phase 1: Elicitation
1. Conduct structured input gathering: ask each team member to complete "Our product should feel ___ because ___"
2. Collect real design dilemmas: moments where the team disagreed on direction or made a difficult trade-off
3. Identify recurring themes across all inputs — what values surface repeatedly
4. Surface tensions: find pairs of values that can conflict (e.g., "simple" vs "powerful") — these become the most useful principles
5. Review existing principles (if any) and assess whether the team actually uses them in decisions

### Phase 2: Synthesis
1. Group related themes into 4-6 candidate principle areas (more than 6 becomes hard to remember)
2. For each candidate, draft an opinionated statement: "We choose X over Y" or "We believe X because Y"
3. Stress-test each candidate against 3 real past design decisions — does the principle help resolve the dilemma?
4. Eliminate principles that pass every test without tension — they are too obvious to be useful
5. Rank candidates by decision-making power: which principles resolve the most real disagreements

### Phase 3: Formalization
1. Refine language: each principle should be one sentence, using active voice, with no jargon
2. Add a "This means..." clarification with a concrete example of the principle in action
3. Add a "This does not mean..." clarification to prevent misinterpretation
4. Create a validation rubric: for each principle, define how to test whether a design follows it
5. Document the final set with rationale, examples, and counter-examples
6. Plan a team readout session: present the principles, walk through examples, gather final feedback
7. Define how principles will be integrated into design review and critique processes

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| design-principles | Markdown | Final design principles document with statements, examples, and counter-examples |
| validation-rubric | Markdown table | Rubric for testing designs against each principle |
| workshop-synthesis | Markdown | Summary of themes, tensions, and decisions from the elicitation process |
| integration-guide | Markdown | Guide for integrating principles into design review and critique processes |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| opinionated | blocking | Each principle must take a clear stance — it should be possible to disagree with it |
| testable | blocking | Each principle must have a defined way to evaluate whether a design follows it |
| memorable | warning | The full set of principles should be recitable from memory (aim for 4-6 total) |
| real_world_tested | blocking | Each principle must be validated against at least 3 real past design decisions |
| no_duplicates | warning | No two principles should resolve the same type of design dilemma |
| counter_examples | warning | Each principle should include at least one counter-example showing misapplication |
| team_reviewed | warning | The final principle set must be presented to and reviewed by the full team |

---

## Handoff

- **On completion:** Hand to @alla-kholmatova for design-language task to incorporate principles into the language spec
- **On completion (alt):** Hand to @micah-godbolt for code-standards to translate principles into engineering guidelines
- **On completion (alt):** Hand to @heydon-pickering for build-inclusive to apply principles to component development
- **On issues:** Escalate to @design-chief
- **Dependencies:** Feeds into design-language, code-standards, and process-design tasks

---

## Related Tasks

| Task | Relationship | Description |
|------|-------------|-------------|
| design-language | Downstream | Incorporates principles into the language specification |
| code-standards | Downstream | Translates principles into engineering guidelines |
| process-design | Downstream | Aligns development processes with design principles |
| pattern-classify | Parallel | Principles guide how patterns are classified and evaluated |

---

## Glossary

> Full glossary: [design-glossary.md](../data/design-glossary.md)

**Key terms for this task:**

- **Design language** — Shared visual rules, principles, and vocabulary for product identity
- **Shared vocabulary** — Team-aligned naming conventions across design and engineering
- **Design tokens** — Platform-agnostic values encoding design decisions
- **Semantic naming** — Naming by purpose not description

---

## Don't Do

- Do not introduce new terms without adding them to the shared vocabulary document
- Do not use different names for the same concept across design and engineering
- Do not define principles without concrete examples showing correct and incorrect application
- Do not create naming conventions that conflict with existing token naming (CTI)

