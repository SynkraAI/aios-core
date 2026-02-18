# Task: Establish Code Standards

**Task ID:** code-standards
**Version:** 1.0
**Purpose:** Establishes code standards for the design system: linting rules, naming conventions, file organization, import patterns, and component API contracts
**Agent:** @micah-godbolt
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

This task defines the code standards that every contributor to the design system must follow. Standards are not style preferences — they are the rules that ensure consistency, maintainability, and quality across a growing codebase maintained by multiple people. This task covers linting configuration, naming conventions for files and code, file organization rules, import patterns, and component API contracts. The standards are encoded into tooling wherever possible, so enforcement is automated rather than relying on human review.

The best code standards are the ones that the team never has to think about because tooling enforces them automatically. Manual enforcement through code review is expensive and inconsistent. Every standard that can be expressed as a lint rule should be.

```
INPUT (tech stack, architecture plan, team conventions)
    ↓
[PHASE 1: DEFINITION]
    → Define naming, organization, and API contract standards
    ↓
[PHASE 2: TOOLING]
    → Configure linting, formatting, and automated enforcement
    ↓
[PHASE 3: DOCUMENTATION]
    → Produce standards guide, configure CI checks, create templates
    ↓
OUTPUT: Code Standards Package
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| tech_stack | object | Yes | Framework, language, build tools, and testing tools in use |
| architecture_plan | object | No | Output from architecture-plan task, if previously completed |
| team_conventions | list | Yes | Existing informal conventions the team already follows |
| shared_vocabulary | object | No | Shared vocabulary for aligning code naming with design language |

---

## Preconditions

- Technology stack decisions are finalized
- Architecture plan exists or key structural decisions are made
- The team is willing to adopt automated enforcement of standards
- A CI/CD pipeline exists where automated checks can be added
- The shared vocabulary is available to align code naming with design terminology
- The team has agreed on the level of strictness: advisory vs enforced rules

---

## Steps

### Phase 1: Definition
1. Define file naming conventions: component files (PascalCase), utility files (camelCase), test files (.test.ts), story files (.stories.tsx)
2. Define code naming conventions: component names, prop names, CSS class names, token references, event handler names
3. Define file organization rules: co-location requirements, index file policy, shared vs component-scoped utilities
4. Define import patterns: absolute imports via path aliases, barrel file policy, circular dependency prevention
5. Define component API contracts: required props documentation, event naming (onAction pattern), composition patterns, children usage

### Phase 2: Tooling
1. Configure ESLint with rules that enforce naming conventions, import ordering, and code patterns
2. Configure Prettier for consistent formatting: print width, semicolons, quotes, trailing commas
3. Configure TypeScript strict mode and additional type-checking rules
4. Set up custom ESLint rules or plugins for design-system-specific patterns (e.g., require token usage, forbid hardcoded colors)
5. Configure pre-commit hooks: run linting and formatting on staged files before every commit

### Phase 3: Documentation
1. Produce the Code Standards Guide: comprehensive document covering all conventions with examples
2. Create component templates: starter files that follow all standards for quick bootstrapping
3. Create a "Common Mistakes" guide: the top 10 standard violations and how to fix them
4. Configure CI pipeline checks: linting, type-checking, and custom rules run on every PR
5. Define the standards evolution process: how to propose, discuss, and adopt new standards
6. Create an accessibility standards section: required ARIA patterns, keyboard interaction contracts, contrast minimums
7. Plan the migration path for existing code that does not meet the new standards

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| standards-guide | Markdown | Complete code standards guide with all conventions and examples |
| lint-config | JSON | ESLint configuration implementing the standards |
| format-config | JSON | Prettier configuration for consistent formatting |
| component-templates | File templates | Starter templates for new components following all standards |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| tooling_enforced | blocking | At least 80% of standards must be enforceable through automated tooling |
| naming_complete | blocking | Naming conventions must cover files, components, props, CSS, tokens, and events |
| api_contracts_defined | blocking | Component API contracts must specify prop documentation, typing, and event naming |
| ci_integrated | warning | Automated checks must be configured to run on every PR |
| examples_provided | warning | Each standard must include at least one correct example and one incorrect example |
| a11y_standards_included | warning | Accessibility-specific standards should be documented alongside general code standards |
| migration_planned | warning | A plan for migrating existing non-conforming code should be outlined |

---

## Handoff

- **On completion:** Hand to @micah-godbolt for documentation-plan to document the standards for the team
- **On completion (alt):** Hand to @alla-kholmatova for shared-vocabulary to verify naming alignment
- **On completion (alt):** Hand to @heydon-pickering for inclusive-audit to validate accessibility standards are sufficient
- **On issues:** Escalate to @design-chief
- **Dependencies:** Best preceded by architecture-plan; feeds into documentation-plan, testing-strategy, and process-design

---

## Related Tasks

| Task | Relationship | Description |
|------|-------------|-------------|
| architecture-plan | Upstream | Provides the structure that standards enforce |
| shared-vocabulary | Parallel | Aligns code naming with team vocabulary |
| documentation-plan | Downstream | Documents the standards for the team |
| process-design | Downstream | Integrates standards into the development process |

---

## Glossary

> Full glossary: [design-glossary.md](../data/design-glossary.md)

**Key terms for this task:**

- **Design tokens** — Platform-agnostic key-value pairs encoding design decisions
- **Design system** — Tokens, components, patterns, guidelines, and tooling for UI consistency
- **Component API** — Props interface defining how a component is consumed

---

## Don't Do

- Do not skip reading the full task specification before executing
- Do not create from scratch when similar patterns exist in the design system
- Do not hardcode values that should be design tokens
- Do not skip validation steps defined in the task workflow

