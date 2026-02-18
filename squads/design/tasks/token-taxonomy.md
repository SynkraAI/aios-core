# Task: Organize Token Taxonomy

**Task ID:** token-taxonomy
**Version:** 1.0
**Purpose:** Organizes tokens into a taxonomy with clear hierarchy: global (primitive), semantic (alias), and component-specific layers, defining relationships between all layers
**Agent:** @jina-anne
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

This task takes the named tokens and organizes them into a structured taxonomy with explicit layer definitions and cross-layer relationships. While the token architecture defines the conceptual layers and the naming system defines how tokens are labeled, the taxonomy defines the actual organization: which tokens exist at each layer, how they reference each other, and how the taxonomy scales as the system grows. The result is a navigable, maintainable token structure.

A well-organized taxonomy makes the token system navigable at any scale. When a system has hundreds of tokens, organization is the difference between a system developers love to use and one they work around with hardcoded values.

```
INPUT (named tokens, architecture spec, component list)
    ↓
[PHASE 1: LAYER DEFINITION]
    → Define each taxonomy layer with scope, rules, and boundaries
    ↓
[PHASE 2: TOKEN PLACEMENT]
    → Assign each token to its correct layer, establish references
    ↓
[PHASE 3: RELATIONSHIP MAPPING]
    → Map cross-layer references, validate hierarchy, document groups
    ↓
OUTPUT: Token Taxonomy Document
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| named_tokens | object | Yes | All tokens with their established names from token-naming task |
| architecture_spec | string | Yes | Token architecture specification defining the layer model |
| component_list | list | Yes | List of components that will consume component-level tokens |
| theming_requirements | object | No | Theme variants that affect taxonomy organization |

---

## Preconditions

- Token naming system is established and tokens have been named
- Token architecture specification exists defining the three-layer model
- Component library inventory is available to scope component-level tokens
- The team understands the distinction between global, semantic, and component layers
- A list of all components that will consume tokens at the component layer is available
- Theming requirements (dark mode, brand variants) are documented if applicable

---

## Steps

### Phase 1: Layer Definition
1. Define the Global (Primitive) layer: raw design values with no semantic meaning, organized by category (color scales, spacing scales, type scales)
2. Define the Semantic (Alias) layer: purpose-driven tokens that reference globals, organized by intent (action, feedback, surface, text, border)
3. Define the Component layer: tokens scoped to individual components, referencing semantic tokens, organized by component name
4. Establish layer rules: globals never reference other tokens, semantics reference only globals, components reference only semantics
5. Define layer boundaries: what belongs at each layer and what signals that a token is at the wrong layer

### Phase 2: Token Placement
1. Place all primitive values at the global layer: color palettes, spacing scales, font stacks, shadow definitions
2. Create semantic mappings: for each design intent, select the appropriate global token reference
3. Create component tokens: for each component, identify which semantic tokens it uses and create scoped references
4. Identify tokens that do not fit cleanly into one layer and resolve their placement with rationale
5. Validate completeness: every design decision should be traceable from component layer down to a global value

### Phase 3: Relationship Mapping
1. Generate the full reference graph: visualize how component tokens reference semantic tokens reference global tokens
2. Identify reference depth: tokens with more than 3 levels of reference may indicate over-abstraction
3. Group related tokens: create logical groups within each layer (e.g., all action-related semantic tokens)
4. Document inheritance patterns: how themes override semantic layer tokens while globals remain stable
5. Produce the final taxonomy document with layer definitions, token placements, and relationship maps
6. Define taxonomy extension rules: how to add new tokens at each layer as the system grows
7. Create a quick-reference card showing the taxonomy structure with representative examples from each layer

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| taxonomy-document | Markdown | Complete taxonomy with layer definitions, rules, and token placements |
| reference-graph | Markdown | Visual representation of cross-layer token references |
| token-groups | Markdown | Logical groupings of related tokens within each layer |
| layer-rules | Markdown | Rules governing what belongs at each layer and how layers interact |
| extension-guide | Markdown | Guide for adding new tokens to the taxonomy as the system grows |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| three_layers_defined | blocking | Global, semantic, and component layers must each be explicitly defined with rules |
| no_rule_violations | blocking | No token may violate layer referencing rules (e.g., global referencing semantic) |
| complete_traceability | blocking | Every component token must be traceable to a global value through the reference chain |
| no_orphans | warning | No tokens should exist without at least one reference to or from another token |
| depth_reasonable | warning | Reference chains deeper than 3 levels should be flagged for review |
| extension_rules | warning | Rules for adding new tokens must be documented |
| theming_compatible | warning | Taxonomy must support theme overrides at the semantic layer |

---

## Handoff

- **On completion:** Hand to @jina-anne for multi-platform to design platform delivery based on taxonomy
- **On completion (alt):** Hand to @micah-godbolt for architecture-plan to integrate taxonomy into frontend structure
- **On completion (alt):** Hand to @heydon-pickering for inclusive-audit to verify token-driven accessibility (contrast ratios, sizing)
- **On issues:** Escalate to @design-chief
- **Dependencies:** Requires token-naming and token-architecture tasks; feeds into multi-platform and token-migration

---

## Related Tasks

| Task | Relationship | Description |
|------|-------------|-------------|
| token-naming | Upstream | Provides the named tokens to organize |
| token-architecture | Upstream | Defines the three-layer model |
| multi-platform | Downstream | Delivers the taxonomy across platforms |
| architecture-plan | Downstream | Integrates taxonomy into frontend structure |

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

