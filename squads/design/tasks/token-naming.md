# Task: Create Token Naming System

**Task ID:** token-naming
**Version:** 1.0
**Purpose:** Creates a token naming system following CTI (Category-Type-Item) or similar taxonomy, covering colors, spacing, typography, sizing, shadows, and all design dimensions
**Agent:** @jina-anne
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

This task designs the naming system that will be used for every design token in the system. Token names are the primary interface between designers and developers — a well-designed naming system makes tokens discoverable, predictable, and self-documenting. This task establishes the naming taxonomy (CTI or custom), defines conventions for each token category, handles edge cases, and produces a naming reference guide that the entire team can use.

Good token names are ones that developers can guess correctly on first try. If a developer needs to look up the name every time, the naming system is failing. The goal is a system where the name of any token can be predicted from its purpose, category, and context.

```
INPUT (token categories, naming preferences, shared vocabulary)
    ↓
[PHASE 1: TAXONOMY DESIGN]
    → Define naming structure, separator, casing, and category rules
    ↓
[PHASE 2: CATEGORY MAPPING]
    → Apply naming rules to each token category with examples
    ↓
[PHASE 3: DOCUMENTATION]
    → Produce naming reference guide with rules, examples, and edge cases
    ↓
OUTPUT: Token Naming Reference Guide
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| token_categories | list | Yes | Categories to name: color, spacing, typography, sizing, shadow, border, motion, opacity |
| shared_vocabulary | object | No | Output from shared-vocabulary task to align naming with team language |
| naming_preferences | object | Yes | Preferences: separator (dot, dash, underscore), casing (camel, kebab), abbreviation policy |
| existing_names | list | No | Current token names to evaluate and potentially migrate |

---

## Preconditions

- Token categories are defined and agreed upon
- The shared vocabulary is established or naming can proceed with explicit documentation
- Platform constraints are known (some platforms restrict characters in variable names)
- The team has decided on a naming taxonomy approach (CTI, custom, or open to recommendation)
- Examples of current naming pain points are documented to guide naming decisions
- The design language and shared vocabulary are available or being established in parallel

---

## Steps

### Phase 1: Taxonomy Design
1. Select the naming taxonomy: CTI (Category-Type-Item), semantic layering, or hybrid approach
2. Define the naming structure template: e.g., `{category}.{type}.{item}.{variant}.{state}`
3. Establish separator convention: period for conceptual levels, dash for compound words within a level
4. Define casing rules: kebab-case for tokens, camelCase for generated code variables
5. Set abbreviation policy: no abbreviations (clarity over brevity) or approved abbreviation list

### Phase 2: Category Mapping
1. Color tokens: define naming for primitive scales (color.blue.500), semantic mappings (color.action.primary), and state variants (color.action.primary.hover)
2. Spacing tokens: define scale naming (spacing.100, spacing.200 or spacing.xs, spacing.sm, spacing.md)
3. Typography tokens: handle composite naming (font.heading.lg includes family, size, weight, line-height)
4. Sizing tokens: component sizing (sizing.icon.sm, sizing.avatar.md) with consistent scale
5. Additional categories: shadow, border, motion, opacity, z-index — apply consistent naming patterns to each
6. Define state naming conventions: how hover, active, focus, disabled, and error states are represented in token names
7. Create a naming migration map for existing tokens that do not follow the new convention

### Phase 3: Documentation
1. Produce the Token Naming Reference Guide with: taxonomy explanation, naming structure, rules per category
2. Include a complete example set: 10-15 fully named tokens per category showing the naming in action
3. Document edge cases: how to name tokens that span categories, deprecated tokens, experimental tokens
4. Create a naming decision tree: flowchart for "How do I name this token?"
5. Define naming review checklist: what reviewers check when new tokens are proposed

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| naming-guide | Markdown | Complete token naming reference guide with rules, examples, and edge cases |
| naming-examples | Markdown table | Full example set showing naming applied to every token category |
| decision-tree | Markdown | Flowchart for determining the correct name for a new token |
| review-checklist | Markdown | Checklist for reviewing proposed token names |
| migration-map | Markdown table | Mapping of existing non-conforming names to their corrected equivalents |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| all_categories_covered | blocking | Naming rules must be defined for every token category |
| no_ambiguity | blocking | The naming system must produce exactly one correct name for any given design decision |
| platform_compatible | blocking | Names must be valid across all target platforms after transformation |
| examples_provided | warning | Each category must have at least 5 complete naming examples |
| edge_cases_documented | warning | At least 5 edge cases must be documented with resolution |
| state_naming_defined | warning | State-related naming conventions (hover, active, disabled) should be specified |
| migration_path | warning | Existing non-conforming names should have a documented migration path |

---

## Handoff

- **On completion:** Hand to @jina-anne for token-taxonomy to organize named tokens into a hierarchy
- **On completion (alt):** Hand to @alla-kholmatova for shared-vocabulary to cross-validate naming with team vocabulary
- **On completion (alt):** Hand to @micah-godbolt for code-standards to enforce token naming in codebase
- **On issues:** Escalate to @design-chief
- **Dependencies:** Best preceded by token-architecture task; feeds into token-taxonomy and multi-platform

---

## Related Tasks

| Task | Relationship | Description |
|------|-------------|-------------|
| token-architecture | Upstream | Defines the layer structure that naming must support |
| shared-vocabulary | Parallel | Cross-validates naming with team vocabulary |
| token-taxonomy | Downstream | Organizes named tokens into hierarchy |
| code-standards | Downstream | Enforces token naming in codebase |

---

## Glossary

> Full glossary: [design-glossary.md](../data/design-glossary.md)

**Key terms for this task:**

- **Global (primitive) tokens** — Raw values with no semantic meaning (e.g., `color.blue.500`)
- **Alias (semantic) tokens** — Purpose-driven tokens referencing globals (e.g., `color.action.primary`)
- **Component tokens** — Tokens scoped to a specific component
- **CTI** — Category-Type-Item naming taxonomy for tokens
- **DTCG** — Design Tokens Community Group W3C specification
- **Semantic naming** — Naming by purpose (primary) not description (blue-500)

---

## Don't Do

- Do not create tokens with descriptive names (blue-500) — use semantic names (primary, error, surface)
- Do not reference tokens upward (global referencing alias) — token references must flow downward only
- Do not skip the alias layer — jumping from global directly to component tokens breaks theming
- Do not use raw hex/rgb values in components when a token exists
- Do not export tokens without validating syntax in each format (CSS, JSON, SCSS, Tailwind)
- Do not create circular token references — always validate the token graph

