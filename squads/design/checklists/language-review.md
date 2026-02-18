# Checklist: Design Language Review

**ID:** language-review
**Version:** 1.0
**Purpose:** Reviews design language consistency including naming, principles application, functional/perceptual classification, shared vocabulary, documentation clarity, and cross-team alignment
**Agent:** @alla-kholmatova
**Quality Gate:** WARNING

---

## Prerequisites

- [ ] Design principles have been formally defined and documented
- [ ] A naming convention guide exists for the design system
- [ ] At least two consuming teams are available for cross-team alignment checks
- [ ] Design language glossary or vocabulary list exists

---

## Section 1: Naming Consistency

- [ ] Component names are intention-based, not appearance-based (e.g., "Action" not "BlueButton")
- [ ] Names are understandable without visual context
- [ ] Naming follows a consistent grammatical pattern (noun-first or adjective-noun)
- [ ] Same concept uses the same name across all platforms and tools
- [ ] Deprecated names have documented migration paths to new names
- [ ] No conflicting names exist (two different things with the same name)
- [ ] Names scale well — adding new variations does not require renaming existing ones

## Section 2: Principles Application

- [ ] Each design principle has clear, actionable criteria for evaluation
- [ ] Components can be traced back to at least one guiding principle
- [ ] Design decisions reference principles in documentation or commit messages
- [ ] Principles are used during design reviews as evaluation criteria
- [ ] No component contradicts a stated design principle
- [ ] Principles are revisited and updated as the system matures

## Section 3: Functional and Perceptual Classification

- [ ] Components are classified as functional (what they do) or perceptual (how they feel)
- [ ] Functional patterns are reusable across different visual contexts
- [ ] Perceptual patterns reflect brand identity and aesthetic direction
- [ ] Classification is documented and accessible to all contributors
- [ ] New components are classified before implementation begins
- [ ] Classification informs the component's flexibility and customization boundaries

## Section 4: Shared Vocabulary

- [ ] A glossary of design system terms is published and accessible
- [ ] Designers and developers use the same terms for the same concepts
- [ ] Terms are defined with examples, not just definitions
- [ ] Vocabulary is reviewed quarterly for relevance and accuracy
- [ ] New terms go through a proposal and approval process
- [ ] Jargon is avoided or explicitly defined when unavoidable
- [ ] Vocabulary is consistent with industry-standard terminology where applicable

## Section 5: Documentation Clarity

- [ ] Component documentation uses plain, accessible language
- [ ] Technical jargon is explained or linked to the glossary
- [ ] Documentation follows a consistent template across all components
- [ ] Examples show real-world usage, not abstract or lorem-ipsum content
- [ ] When-to-use and when-not-to-use guidance is provided
- [ ] Documentation is reviewed by someone outside the core team for clarity

## Section 6: Cross-Team Alignment

- [ ] Consuming teams report understanding the design language without additional explanation
- [ ] No team has created parallel or competing naming conventions
- [ ] Feedback from consuming teams has been collected in the last quarter
- [ ] Design language changes are communicated before implementation
- [ ] Cross-team workshops or syncs occur at least quarterly
- [ ] Alignment issues are tracked and resolved with documented outcomes

---

## Scoring

| Category | Items | Pass | Status |
|----------|-------|------|--------|
| Naming Consistency | 7 | _ | PENDING |
| Principles Application | 6 | _ | PENDING |
| Functional/Perceptual | 6 | _ | PENDING |
| Shared Vocabulary | 7 | _ | PENDING |
| Documentation Clarity | 6 | _ | PENDING |
| Cross-Team Alignment | 6 | _ | PENDING |

**Minimum passing score:** 75%
**Blocking items:** Naming Consistency items are mandatory for language approval
