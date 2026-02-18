# Task: Accessibility Documentation Audit

**Task ID:** a11y-audit-doc
**Version:** 1.0
**Purpose:** Audit existing accessibility documentation for completeness, accuracy, WCAG conformance, and developer-friendliness
**Agent:** @stephanie-walter
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Evaluates the quality and completeness of existing accessibility documentation across a design system or product. Checks whether docs accurately reflect WCAG requirements, provide actionable guidance for developers, cover all component states, and remain current with implementation. Documentation that is incomplete, outdated, or unclear is as harmful as missing documentation because it creates a false sense of compliance.

```
INPUT (existing a11y docs, component inventory, WCAG target)
    |
[PHASE 1: COVERAGE ANALYSIS]
    -> Assess which components and criteria are documented vs missing
    |
[PHASE 2: QUALITY EVALUATION]
    -> Evaluate accuracy, clarity, and developer-friendliness of existing docs
    |
[PHASE 3: GAP REMEDIATION PLAN]
    -> Prioritize gaps and create a documentation improvement roadmap
    |
OUTPUT: Audit report with coverage metrics, quality scores, and remediation roadmap
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| a11y_documentation | file | Yes | Existing accessibility documentation to audit (docs site, markdown files, wiki) |
| component_inventory | file | Yes | Complete list of components in the design system |
| wcag_target | enum(A, AA, AAA) | Yes | Target WCAG conformance level to audit against |
| implementation_source | string | No | Link to component code repository for cross-referencing docs against implementation |
| last_audit_date | string | No | Date of previous accessibility documentation audit for tracking improvements |

---

## Preconditions

- Accessibility documentation exists for at least some components (there must be something to audit)
- A complete component inventory is available to measure documentation coverage
- The target WCAG version and level are agreed upon (e.g., WCAG 2.1 AA)
- The auditor has access to both documentation and component implementations for cross-referencing

---

## Steps

### Phase 1: Coverage Analysis
1. List every component in the design system inventory
2. For each component, check if accessibility documentation exists: fully documented, partially documented, or undocumented
3. For documented components, check coverage of four documentation areas:
   - **Design annotations**: focus order, heading structure, alt text requirements, color independence
   - **Usage guidelines**: accessible usage patterns, do/don't examples, content guidelines
   - **Code requirements**: ARIA roles, keyboard interactions, focus management, live regions
   - **Testing procedures**: manual test steps, automated test configuration, expected results
4. Calculate overall coverage: percentage of components with complete documentation, partial documentation, no documentation
5. Cross-reference with WCAG success criteria: for each applicable criterion, check if documentation addresses it:
   - 1.1.1 Non-text Content: are alt text guidelines documented?
   - 1.3.1 Info and Relationships: are semantic structure requirements documented?
   - 2.1.1 Keyboard: are keyboard interactions documented?
   - 2.4.7 Focus Visible: are focus indicator requirements documented?
   - 4.1.2 Name, Role, Value: are ARIA requirements documented?
6. Identify documentation deserts: component categories with the lowest coverage (e.g., all form components lack testing procedures)

### Phase 2: Quality Evaluation
1. Evaluate **accuracy** for each documented component:
   - Do ARIA roles match WAI-ARIA Authoring Practices recommendations?
   - Do keyboard interactions match the expected widget pattern?
   - Do contrast requirements cite the correct WCAG thresholds (4.5:1 for normal text, 3:1 for large text)?
   - Is the documentation current with the actual implementation (or has the component changed since docs were written)?
2. Evaluate **completeness** per component:
   - Are all interactive states covered (default, hover, focus, active, disabled, error, loading)?
   - Are all variants documented (different sizes, colors, or configurations may have different accessibility needs)?
   - Are edge cases addressed (empty state, overflow, truncation, dynamic content)?
3. Evaluate **clarity and developer-friendliness**:
   - Are code examples provided (not just abstract descriptions)?
   - Are ARIA attributes shown in context (full HTML snippet, not just attribute name)?
   - Is keyboard interaction documented as a table (key -> action -> focus result)?
   - Can a developer who is not an accessibility expert follow the documentation?
4. Evaluate **testability**:
   - Are testing steps specific enough to reproduce (not "test with a screen reader" but "navigate to component using Tab, press Enter, verify announcement says...")?
   - Are expected results documented for each test?
   - Are automated testing rules specified (which axe-core rules apply)?
5. Score each documented component on a 1-5 scale for accuracy, completeness, clarity, and testability

### Phase 3: Gap Remediation Plan
1. Rank documentation gaps by risk: components with the highest usage and least documentation are highest priority
2. Group remediation work into tiers:
   - **Tier 1 (Critical)**: Undocumented components with interactive elements (forms, modals, menus)
   - **Tier 2 (Major)**: Partially documented components missing code requirements or testing procedures
   - **Tier 3 (Important)**: Documented components with accuracy issues or outdated information
   - **Tier 4 (Improvement)**: Components with documentation that lacks clarity or code examples
3. Estimate effort per remediation item: small (add missing section), medium (rewrite for clarity), large (research and document from scratch)
4. Create a prioritized backlog of documentation improvements
5. Define a documentation maintenance cadence: trigger documentation review when component code changes
6. Recommend documentation tooling improvements: templates, linting, automated freshness checks
7. Produce an executive summary: coverage percentage, average quality score, top 5 risks, estimated remediation effort

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| coverage-matrix | markdown table | Component-by-area coverage matrix (annotations, guidelines, code, testing) |
| quality-scorecard | markdown table | Per-component scores for accuracy, completeness, clarity, and testability |
| findings-report | markdown | Detailed findings organized by severity with specific issues per component |
| remediation-backlog | markdown checklist | Prioritized list of documentation improvements with effort estimates |
| executive-summary | markdown | High-level metrics, risk areas, and investment recommendation |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Full inventory coverage | blocking | Every component must be checked for documentation presence |
| Four-area assessment | blocking | Each documented component must be evaluated across all four documentation areas |
| WCAG cross-reference | blocking | At least the top 10 applicable WCAG criteria must be checked against documentation |
| Accuracy verification | warning | ARIA roles and keyboard patterns must be verified against WAI-ARIA Authoring Practices |
| Quality scoring | warning | Every documented component must receive scores on all four quality dimensions |
| Remediation prioritization | warning | Backlog items must be ordered by risk (usage frequency times documentation gap severity) |

---

## Handoff

- **On completion:** Hand to @stephanie-walter (a11y-doc) for high-priority documentation creation
- **On component spec gaps:** Hand to @nathan-curtis for component specification updates
- **On system-wide documentation standards:** Hand to @nathan-curtis (governance-model) for governance integration
- **On design annotation gaps:** Hand to @stephanie-walter (a11y-annotations) for annotation creation
- **On issues:** Escalate to @design-chief

---

## Glossary

> Full glossary: [design-glossary.md](../data/design-glossary.md)

**Key terms for this task:**

- **WCAG 2.2** — Web Content Accessibility Guidelines (Levels A, AA, AAA)
- **ARIA** — Accessible Rich Internet Applications attributes for assistive technology
- **Accessible name** — The label assistive tech announces (via aria-label, content, etc.)
- **Focus trap** — UI region where keyboard focus is confined (intentional in modals, accidental is a bug)
- **Contrast ratio** — Foreground/background color difference measure (4.5:1 for AA text)
- **Landmark** — ARIA role or HTML5 element (`<nav>`, `<main>`) for screen reader navigation

---

## Don't Do

- Do not use `outline: none` without providing a visible alternative focus indicator
- Do not use positive `tabIndex` values (1, 2, 3) — they break natural tab order
- Do not use `<div onClick>` for interactive elements — use `<button>` or add role + keyboard handlers
- Do not rely on color alone to convey information — always provide a secondary indicator (icon, text)
- Do not suppress ARIA roles when native HTML semantics already provide them (e.g., `role="button"` on `<button>`)
- Do not skip keyboard testing — mouse-only testing misses critical accessibility barriers

