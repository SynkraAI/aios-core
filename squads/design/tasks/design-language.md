# Task: Define Design Language

**Task ID:** design-language
**Version:** 1.0
**Purpose:** Defines the design language for a product or system by establishing functional and perceptual patterns, naming taxonomy, and shared vocabulary
**Agent:** @alla-kholmatova
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

This task guides the creation of a cohesive design language that unifies how a product looks, feels, and communicates. It establishes the foundational vocabulary, pattern categories, and naming conventions that all teams will use. Based on Alla Kholmatova's "Design Systems" framework, it distinguishes between functional patterns (solving problems) and perceptual patterns (creating feelings) to build a language that is both practical and expressive.

A well-defined design language reduces decision fatigue, speeds up design and development, and ensures consistent user experience across all product surfaces. Without it, teams reinvent patterns, use conflicting terminology, and produce inconsistent interfaces.

```
INPUT (product context, brand attributes, existing patterns)
    ↓
[PHASE 1: DISCOVERY]
    → Collect existing patterns, interview stakeholders, map brand attributes
    ↓
[PHASE 2: DEFINITION]
    → Classify patterns, define naming taxonomy, create vocabulary
    ↓
[PHASE 3: DOCUMENTATION]
    → Produce design language specification document
    ↓
OUTPUT: Design Language Specification
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| product_context | object | Yes | Product domain, target users, core use cases, and business goals |
| brand_attributes | list | Yes | Brand personality traits (e.g., trustworthy, playful, minimal) |
| existing_patterns | list | No | URLs or screenshots of current UI patterns in use |
| competitor_references | list | No | Competitor products or design systems to analyze |
| team_roles | list | Yes | List of roles that will consume the design language (designers, devs, PMs) |

---

## Preconditions

- Product vision and brand guidelines are available or stakeholders are accessible for interviews
- At least one existing product surface (app, website, prototype) exists for pattern collection
- Key stakeholders from design, engineering, and product are identified and available
- There is organizational buy-in for investing in a shared design language
- The team has allocated sufficient time for collaborative workshops and review sessions
- Access to design files (Figma, Sketch) and codebase for pattern extraction is granted

---

## Steps

### Phase 1: Discovery
1. Conduct stakeholder interviews to understand brand intent, product values, and communication tone
2. Perform a visual audit of existing product surfaces, capturing every recurring pattern with screenshots
3. Map brand attributes to design qualities (e.g., "trustworthy" maps to consistent spacing, muted palette)
4. Identify gaps where the current product diverges from stated brand values
5. Collect and categorize competitor design language approaches for reference
6. Document the emotional response each existing pattern evokes and compare against brand intent
7. Create a mood board that captures the desired perceptual direction for the design language

### Phase 2: Definition
1. Classify all discovered patterns into functional patterns (solve a user problem) and perceptual patterns (evoke an emotion or feeling)
2. Define naming taxonomy: establish rules for how patterns are named (noun-based, purpose-driven, context-aware)
3. Create the core vocabulary list: terms that all teams must use consistently (e.g., "card" vs "tile", "modal" vs "dialog")
4. Map relationships between functional and perceptual patterns — how a functional pattern like "navigation" adopts perceptual qualities like "calm" or "energetic"
5. Define design language principles: 3-5 guiding statements that resolve ambiguity (e.g., "Clarity over cleverness")

### Phase 3: Documentation
1. Produce the Design Language Specification document with sections: Purpose, Principles, Pattern Categories, Naming Rules, Vocabulary Glossary
2. Create example mappings showing how the language applies to 3-5 real components
3. Write onboarding guide for new team members to learn the design language
4. Define governance process: who approves new terms, how naming disputes are resolved
5. Establish review cadence: quarterly design language health check
6. Create a "Language Decision Log" template for recording future naming and classification decisions
7. Compile a visual reference sheet with side-by-side examples of functional vs perceptual pattern usage

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| design-language-spec | Markdown | Complete design language specification with principles, categories, taxonomy |
| vocabulary-glossary | Markdown table | Shared vocabulary with terms, definitions, usage contexts, and anti-patterns |
| pattern-classification-map | Markdown | Map of all patterns classified as functional or perceptual with rationale |
| onboarding-guide | Markdown | Quick-start guide for new team members to adopt the design language |
| decision-log-template | Markdown | Template for recording future design language decisions and rationale |
| governance-document | Markdown | Governance process for approving new terms and resolving naming disputes |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| naming_consistency | blocking | Every pattern must follow the established naming taxonomy without exceptions |
| vocabulary_coverage | blocking | All existing UI elements must have a corresponding term in the glossary |
| stakeholder_alignment | blocking | At least 3 stakeholders from different roles must review and approve the specification |
| principle_testability | warning | Each design principle should be verifiable against a real design decision |
| cross_team_comprehension | warning | Vocabulary terms must be understandable by non-designers without additional context |
| governance_defined | warning | A governance process for evolving the design language must be documented |
| example_coverage | warning | At least 3 real components must have example mappings demonstrating the language in use |

---

## Handoff

- **On completion:** Hand to @jina-anne for token architecture that implements the design language decisions
- **On completion (alt):** Hand to @heydon-pickering for inclusive audit of the defined patterns
- **On completion (alt):** Hand to @micah-godbolt for frontend-audit to evaluate how well the current codebase aligns with the new language
- **On issues:** Escalate to @design-chief
- **Dependencies:** This task feeds into pattern-classify, pattern-inventory, and shared-vocabulary tasks

---

## Related Tasks

| Task | Relationship | Description |
|------|-------------|-------------|
| pattern-classify | Downstream | Uses the design language to classify patterns |
| shared-vocabulary | Downstream | Builds the glossary from the vocabulary defined here |
| token-architecture | Downstream | Maps design language decisions to token structure |

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

