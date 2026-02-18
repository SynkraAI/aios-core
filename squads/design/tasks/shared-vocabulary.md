# Task: Build Shared Vocabulary

**Task ID:** shared-vocabulary
**Version:** 1.0
**Purpose:** Builds shared vocabulary between design, development, and business teams, creating a glossary, naming rules, and communication guidelines
**Agent:** @alla-kholmatova
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

This task establishes a shared vocabulary that bridges the communication gap between design, development, and business teams. Misaligned terminology is one of the biggest sources of friction in product development — when a designer says "card" and an engineer implements "tile", confusion compounds. This task produces a living glossary, naming rules that prevent future drift, and communication guidelines that ensure all teams speak the same design language.

Shared vocabulary is not just about naming components. It extends to interaction patterns, design decisions, user needs, and business concepts. When all teams use the same words for the same things, meetings are shorter, handoffs are cleaner, and bugs caused by miscommunication are eliminated.

```
INPUT (team terminology, existing glossaries, common misunderstandings)
    ↓
[PHASE 1: TERMINOLOGY MAPPING]
    → Collect terms from each team, identify overlaps and conflicts
    ↓
[PHASE 2: RESOLUTION]
    → Resolve naming conflicts, establish canonical terms, define rules
    ↓
[PHASE 3: CODIFICATION]
    → Produce glossary, naming rules, and communication guidelines
    ↓
OUTPUT: Shared Vocabulary Package
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| team_terminology | object | Yes | Terms currently used by each team (design, dev, business) for the same concepts |
| existing_glossaries | list | No | Any existing glossaries, style guides, or naming conventions |
| common_misunderstandings | list | Yes | Known instances where terminology caused confusion or errors |
| product_domain | string | Yes | The product domain to ensure vocabulary fits the domain context |

---

## Preconditions

- Representatives from design, development, and business/product teams are available
- There are documented instances of terminology-related confusion to learn from
- The design language specification exists or is being developed in parallel
- The team agrees that a shared vocabulary is worth investing in
- A documentation platform exists where the glossary will be hosted and maintained
- Previous misunderstandings or naming conflicts can be cited as motivating examples

---

## Steps

### Phase 1: Terminology Mapping
1. Collect the top 30-50 design-related terms used by each team independently
2. Create a cross-reference matrix: for each concept, list how each team refers to it
3. Identify conflicts: same word used for different things (polysemy) and different words for the same thing (synonymy)
4. Map domain-specific terms that may have different meanings in design vs engineering vs business
5. Prioritize conflicts by frequency and impact — which misalignments cause the most real problems

### Phase 2: Resolution
1. For each conflict, convene representatives to select or create the canonical term
2. Apply naming principles: prefer descriptive over abstract, purpose over appearance, user-facing over implementation
3. Document the rationale for each resolution so future team members understand why a term was chosen
4. Define naming rules: patterns for creating new terms (compound nouns, verb-noun pairs, etc.)
5. Establish a deprecation process for old terms: how long the old name remains as an alias, where redirects are placed

### Phase 3: Codification
1. Produce the authoritative glossary: each entry has term, definition, usage examples, anti-patterns (what NOT to call it), and owning team
2. Create naming rules document: how to name new patterns, components, tokens, and concepts
3. Write communication guidelines: how to introduce new terms, how to correct misuse respectfully, where to look up terms
4. Define the glossary governance process: who can add terms, review cadence, dispute resolution
5. Create onboarding snippet: a 5-minute vocabulary orientation for new team members
6. Integrate the glossary into developer tooling: IDE autocompletion hints, documentation search, and linting warnings for deprecated terms
7. Plan a team-wide vocabulary launch: communicate the glossary and naming rules through a presentation and hands-on exercise

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| glossary | Markdown table | Authoritative glossary with definitions, examples, and anti-patterns |
| naming-rules | Markdown | Rules and patterns for creating new terms in the design system |
| communication-guidelines | Markdown | Guidelines for using, introducing, and correcting vocabulary |
| governance-process | Markdown | Process for maintaining and evolving the glossary over time |
| onboarding-snippet | Markdown | 5-minute vocabulary orientation for new team members |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| multi_team_input | blocking | Terms must be validated by at least one representative from design, dev, and business |
| conflict_resolution | blocking | Every identified naming conflict must have a resolved canonical term |
| rationale_documented | blocking | The reason for choosing each canonical term must be documented |
| anti_patterns_included | warning | Each glossary entry should include what NOT to call the concept |
| governance_defined | warning | A clear process for adding and modifying terms must be established |
| onboarding_ready | warning | A quick-start onboarding snippet for new team members must be included |
| tooling_integration | warning | Integration plan for developer tooling (IDE, linting) should be documented |

---

## Handoff

- **On completion:** Hand to @micah-godbolt for code-standards to enforce vocabulary in codebase naming
- **On completion (alt):** Hand to @jina-anne for token-naming to align token names with shared vocabulary
- **On completion (alt):** Hand to @micah-godbolt for documentation-plan to integrate glossary into documentation architecture
- **On issues:** Escalate to @design-chief
- **Dependencies:** Best preceded by language-audit task; feeds into code-standards, token-naming, and documentation-plan

---

## Related Tasks

| Task | Relationship | Description |
|------|-------------|-------------|
| language-audit | Upstream | Identifies comprehension gaps the vocabulary addresses |
| code-standards | Downstream | Enforces vocabulary in codebase naming conventions |
| token-naming | Downstream | Aligns token names with shared vocabulary |
| documentation-plan | Downstream | Integrates glossary into documentation architecture |

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

