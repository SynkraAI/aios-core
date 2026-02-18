# Task: Frontend Architecture Audit

**Task ID:** frontend-audit
**Version:** 1.0
**Purpose:** Audits frontend architecture across four pillars: component organization, CSS architecture, build pipeline, testing coverage, and documentation quality
**Agent:** @micah-godbolt
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

This task performs a comprehensive audit of a frontend architecture based on Micah Godbolt's four-pillar framework: code, process, testing, and documentation. A healthy frontend architecture is not just about clean components — it requires a coherent CSS strategy, reliable build pipeline, sufficient test coverage, and documentation that keeps pace with the code. This audit evaluates each pillar independently and as a system, identifying weaknesses that compound across pillars.

The most dangerous architectural problems are cross-pillar: a component with no tests and no documentation is exponentially riskier than one missing just tests or just documentation. This audit specifically identifies these compounding weaknesses and prioritizes them accordingly.

```
INPUT (codebase, build config, test suite, docs site)
    ↓
[PHASE 1: CODE AUDIT]
    → Evaluate component organization, CSS architecture, build pipeline
    ↓
[PHASE 2: QUALITY AUDIT]
    → Assess testing coverage, documentation quality, developer experience
    ↓
[PHASE 3: SYNTHESIS]
    → Cross-pillar analysis, prioritize findings, create improvement plan
    ↓
OUTPUT: Frontend Architecture Audit Report
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| codebase_path | string | Yes | Path to the frontend codebase root |
| build_config | string | Yes | Path to build configuration (webpack, vite, rollup, etc.) |
| test_suite | string | Yes | Path to test directory and configuration |
| docs_site | string | No | URL or path to documentation site or Storybook |
| architecture_docs | string | No | Path to any existing architecture documentation |

---

## Preconditions

- Access to the complete frontend codebase including configuration files
- Build pipeline is functional and can produce output
- Test suite is runnable and produces coverage reports
- At least some documentation exists for comparison against codebase reality
- Access to CI/CD pipeline configuration and build logs for analysis
- Developer team members are available for developer experience interviews

---

## Steps

### Phase 1: Code Audit
1. Evaluate component organization: file structure, naming patterns, co-location of styles/tests/stories, separation of concerns
2. Assess CSS architecture: methodology (BEM, CSS Modules, CSS-in-JS, Tailwind), specificity management, token usage, responsive approach
3. Review build pipeline: bundler configuration, tree shaking effectiveness, code splitting strategy, build performance
4. Analyze dependency health: outdated packages, security vulnerabilities, bundle size impact of dependencies
5. Check import patterns: circular dependencies, barrel file performance, absolute vs relative imports

### Phase 2: Quality Audit
1. Measure test coverage: unit test percentage, visual regression coverage, integration test coverage, accessibility test coverage
2. Evaluate test quality: are tests testing behavior or implementation details? fragile snapshot tests? meaningful assertions?
3. Assess documentation completeness: component docs, API reference, usage examples, migration guides
4. Evaluate developer experience: time from clone to running dev server, onboarding friction, error message quality
5. Review code review patterns: PR size, review time, common feedback themes, automated checks
6. Assess accessibility testing maturity: are automated a11y checks in CI? Is manual testing performed?
7. Evaluate bundle size management: is there a size budget? How are large dependencies tracked?

### Phase 3: Synthesis
1. Score each pillar on a 1-10 scale with specific evidence for each score
2. Identify cross-pillar weaknesses: e.g., untested components with no documentation (compounding risk)
3. Prioritize the top 10 findings by impact and effort
4. Create a phased improvement plan: quick wins (week 1), medium-term (month 1), long-term (quarter 1)
5. Define success metrics: what numbers should improve and by how much

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| audit-report | Markdown | Complete frontend architecture audit with pillar scores and findings |
| finding-details | Markdown | Detailed findings with evidence, impact assessment, and remediation guidance |
| improvement-plan | Markdown | Phased improvement plan with priorities, effort estimates, and success metrics |
| health-dashboard | Markdown | Metrics to track ongoing frontend architecture health |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| four_pillars_covered | blocking | All four pillars (code, process, testing, documentation) must be evaluated |
| evidence_based | blocking | Every finding and score must cite specific evidence from the codebase |
| actionable_findings | blocking | Each finding must include a specific remediation recommendation |
| prioritized | warning | Findings must be prioritized by impact and effort |
| metrics_defined | warning | Success metrics must be defined for tracking improvement over time |
| dx_assessed | warning | Developer experience should be evaluated including onboarding time and common pain points |
| bundle_analyzed | warning | Bundle size should be analyzed with per-component size impact documented |

---

## Handoff

- **On completion:** Hand to @micah-godbolt for architecture-plan to address audit findings
- **On completion (alt):** Hand to @heydon-pickering for inclusive-audit to evaluate accessibility aspects found during audit
- **On completion (alt):** Hand to @jina-anne for token-audit to correlate token usage findings with frontend architecture
- **On issues:** Escalate to @design-chief
- **Dependencies:** Can run independently; feeds into architecture-plan, code-standards, and testing-strategy

---

## Related Tasks

| Task | Relationship | Description |
|------|-------------|-------------|
| architecture-plan | Downstream | Addresses audit findings in the architecture plan |
| code-standards | Downstream | Defines standards based on audit gaps |
| testing-strategy | Downstream | Improves testing based on coverage findings |
| token-audit | Parallel | Correlates token usage with frontend architecture health |

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

