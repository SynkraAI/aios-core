# Task: Atomic Decomposition

**Task ID:** atomic-decompose
**Version:** 1.0
**Purpose:** Decompose a page or screen into atomic design layers mapping component hierarchy and relationships
**Agent:** @brad-frost
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Takes a complete page or screen design and systematically breaks it down into atoms, molecules, organisms, templates, and pages. This decomposition reveals the component hierarchy, dependency graph, and reuse opportunities. It is the bridge between a flat design mockup and a structured, composable component architecture.

```
INPUT (page/screen design, context, existing components)
    |
[PHASE 1: ELEMENT EXTRACTION]
    -> Identify every visual element on the page
    |
[PHASE 2: LAYER ASSIGNMENT]
    -> Classify elements into atomic design layers and map composition
    |
[PHASE 3: HIERARCHY MAPPING]
    -> Build dependency graph and document reuse opportunities
    |
OUTPUT: Atomic decomposition map with component tree and dependency graph
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| screen_design | file | Yes | Screenshot, Figma link, or design file of the page to decompose |
| page_context | string | Yes | Description of the page purpose, user flow, and business function |
| existing_components | file | No | List of components already available in the design system |
| target_framework | enum(react, vue, angular, html, agnostic) | No | Target implementation framework for naming alignment |
| decomposition_depth | enum(atoms-only, molecules-up, full) | No | How deep to decompose; defaults to full |

---

## Preconditions

- The page design is finalized or near-final (not early wireframe stage)
- Design file is high-fidelity enough to distinguish individual elements and their states
- If an existing design system is in place, the component list is current and accessible
- Page represents a real user-facing screen, not a style guide or documentation page
- The naming convention for the design system is documented so new components can be named correctly
- Design tokens (color, spacing, typography) are defined and can be referenced during decomposition

---

## Steps

### Phase 1: Element Extraction
1. Scan the page top-to-bottom, left-to-right, identifying every visible element
2. List all typographic elements: headings (h1-h6), body text, labels, captions, links
3. List all interactive elements: buttons, inputs, selects, toggles, checkboxes, radio buttons
4. List all media elements: images, icons, avatars, illustrations, video containers
5. List all feedback elements: badges, tags, tooltips, alerts, progress indicators
6. List all structural elements: dividers, spacers, containers, cards, sections
7. Identify invisible but functional elements: skip links, screen reader text, ARIA landmarks
8. Count total raw elements before classification

### Phase 2: Layer Assignment and Composition
1. **Atoms**: Assign foundational elements that cannot be further decomposed: individual buttons, input fields, labels, icons, color swatches, typography tokens
2. **Molecules**: Group atoms that function together as a unit: labeled input (label + input + helper text), search bar (input + button + icon), breadcrumb item (link + separator)
3. **Organisms**: Identify larger sections composed of molecules and atoms: navigation bar, hero section, product card grid, footer, sidebar menu, comment thread
4. **Templates**: Define the page layout structure with placeholder content slots: page grid, content area + sidebar, header + main + footer skeleton
5. **Pages**: Document the final composition as the template filled with real content and data
6. For each element, record which layer it belongs to and justify the classification
7. Flag edge cases where classification is ambiguous and document the reasoning for the chosen layer

### Phase 3: Hierarchy Mapping and Dependency Analysis
1. Build a tree diagram showing parent-child relationships from page down to atoms
2. For each organism, list its constituent molecules and atoms
3. For each molecule, list its constituent atoms
4. Identify shared atoms and molecules that appear in multiple organisms (reuse candidates)
5. Cross-reference against existing components: mark elements as "exists," "partial match," or "new"
6. Calculate reuse ratio: (shared components / total components) * 100
7. Highlight composition patterns: repeated molecule combinations that could become standardized organisms
8. Document the dependency graph as a component map suitable for implementation planning
9. Estimate implementation complexity for each new component: simple (atom), moderate (molecule), complex (organism)
10. Identify design token dependencies: which tokens (color, spacing, typography) each component requires
11. Prioritize new component creation by reuse potential: components appearing in multiple organisms should be built first

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| decomposition-map | markdown | Full breakdown of the page into atomic layers with justifications |
| component-tree | markdown (indented) | Hierarchical tree showing all parent-child component relationships |
| dependency-graph | markdown table | Matrix showing which components depend on which others |
| reuse-analysis | markdown | Report on shared components, new components needed, and coverage gaps |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Complete extraction | blocking | Every visible element on the page must appear in the decomposition |
| Layer assignment | blocking | Every element must be assigned to exactly one atomic layer |
| Composition integrity | blocking | Molecules must be composed of atoms; organisms of molecules and/or atoms |
| Existing component match | warning | Elements matching existing components must be flagged as reusable |
| Ambiguity documentation | warning | Edge-case classifications must include written justification |
| Tree completeness | warning | Component tree must trace from page level down to every atom |

---

## Handoff

- **On completion:** Hand to @nathan-curtis for component specification of newly identified components
- **On existing component conflicts:** Hand to @brad-frost (build-component) for variant analysis
- **On pattern identification:** Hand to @jenifer-tidwell for interaction pattern validation
- **On issues:** Escalate to @design-chief

---

## Glossary

> Full glossary: [design-glossary.md](../data/design-glossary.md)

**Key terms for this task:**

- **Atoms** — Smallest UI building blocks (button, icon, label, input)
- **Molecules** — Functional units composed of atoms (search bar = input + button)
- **Organisms** — Complex components composed of molecules (header, sidebar)
- **Templates** — Page-level layouts of organisms without real data
- **Barrel export** — `index.ts` re-exporting modules for cleaner import paths

---

## Don't Do

- Do not classify components without understanding their composition (atoms combine into molecules, not vice versa)
- Do not create molecules that depend on specific page context — they should be reusable
- Do not skip barrel exports when reorganizing component directories
- Do not refactor atoms and molecules simultaneously — refactor bottom-up (atoms first)
- Do not break existing imports during atomic restructuring — update all consumers

