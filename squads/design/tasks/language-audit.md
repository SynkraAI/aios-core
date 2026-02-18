# Task: Audit Design Language

**Task ID:** language-audit
**Version:** 1.0
**Purpose:** Audits existing design language for vocabulary consistency, naming coherence, cross-team understanding, and documentation quality
**Agent:** @alla-kholmatova
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

This task performs a comprehensive audit of an existing design language to assess its health, adoption, and effectiveness. A design language degrades over time as teams grow, products evolve, and informal conventions drift. This audit measures vocabulary consistency across codebases and design files, naming coherence between teams, cross-team comprehension levels, and the quality of supporting documentation. The output is an actionable health report with prioritized remediation steps.

Regular language audits prevent the slow erosion of design consistency. What starts as minor naming drift compounds into significant confusion when team members use different terms for the same concepts, or when code and design files diverge in their naming conventions.

```
INPUT (codebase, design files, team members, documentation)
    ↓
[PHASE 1: DATA COLLECTION]
    → Scan codebase naming, design file naming, interview team members
    ↓
[PHASE 2: ANALYSIS]
    → Compare naming across surfaces, measure comprehension, score consistency
    ↓
[PHASE 3: REPORTING]
    → Produce health report with scores, findings, and remediation plan
    ↓
OUTPUT: Design Language Health Report
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| codebase_path | string | Yes | Path or URL to the codebase containing component implementations |
| design_files | list | Yes | Links to design files (Figma, Sketch) containing the design system |
| documentation_url | string | Yes | URL to existing design system documentation |
| team_contacts | list | No | Team members available for comprehension interviews |
| design_language_spec | string | No | Path to the original design language specification, if it exists |

---

## Preconditions

- Access to the production codebase with component source files
- Access to design files where the design system is maintained
- Existing documentation is accessible for review
- At least 3 team members from different roles are available for brief interviews
- Version control history is accessible for tracking naming evolution over time
- Design file version history is accessible for comparing naming drift

---

## Steps

### Phase 1: Data Collection
1. Scan the codebase for component names, CSS class names, variable names, and folder structures related to design patterns
2. Scan design files for layer names, component names, style names, and organizational structure
3. Scan documentation for term definitions, naming guidelines, and usage examples
4. Conduct brief comprehension interviews: ask 3-5 team members to define 10 key design terms and compare answers
5. Collect any existing naming guidelines, conventions documents, or style guides

### Phase 2: Analysis
1. Compare naming between code and design: identify mismatches (e.g., code says "modal" but Figma says "dialog")
2. Measure vocabulary consistency: count how many terms have multiple names across different surfaces
3. Score documentation quality: completeness (all patterns documented?), accuracy (matches reality?), accessibility (easy to find?)
4. Assess cross-team comprehension: what percentage of terms are understood consistently across roles
5. Identify naming drift: terms that have changed meaning over time or are used inconsistently by different team members
6. Evaluate naming discoverability: can team members predict a component's name without looking it up?
7. Assess the ratio of documented vs undocumented naming conventions in the codebase

### Phase 3: Reporting
1. Calculate the Design Language Health Score: weighted composite of consistency, comprehension, and documentation scores
2. List all naming mismatches with severity (critical: causes confusion, moderate: causes friction, low: cosmetic)
3. Identify the top 5 highest-impact remediation actions
4. Create a phased remediation plan: quick wins (rename in docs), medium effort (align code/design), high effort (restructure)
5. Define ongoing monitoring metrics and recommended audit cadence

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| health-report | Markdown | Complete design language health report with scores and findings |
| naming-mismatches | Markdown table | All naming inconsistencies between code, design, and documentation |
| remediation-plan | Markdown | Prioritized plan to address findings, organized by effort level |
| monitoring-metrics | Markdown | Metrics and cadence for ongoing design language health monitoring |
| comprehension-results | Markdown | Results from team comprehension interviews with analysis |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| multi_surface_scan | blocking | Audit must cover code, design files, and documentation — not just one surface |
| team_interviews | blocking | At least 3 team members from different roles must be interviewed |
| actionable_findings | blocking | Every finding must have a corresponding remediation recommendation |
| severity_classified | warning | All naming mismatches must be classified by severity level |
| health_score_calculated | warning | A quantitative health score must be produced for tracking over time |
| drift_identified | warning | Naming drift over time should be documented with specific examples |
| discoverability_assessed | warning | The ability to predict pattern names should be tested with team members |

---

## Handoff

- **On completion:** Hand to @alla-kholmatova for shared-vocabulary task to address comprehension gaps
- **On completion (alt):** Hand to @micah-godbolt for code-standards to align codebase naming
- **On completion (alt):** Hand to @jina-anne for token-audit to correlate token naming issues with language audit findings
- **On issues:** Escalate to @design-chief
- **Dependencies:** Outputs feed into shared-vocabulary, code-standards, and token-audit tasks

---

## Related Tasks

| Task | Relationship | Description |
|------|-------------|-------------|
| shared-vocabulary | Downstream | Addresses comprehension gaps found during audit |
| code-standards | Downstream | Aligns codebase naming with audit recommendations |
| token-audit | Parallel | Correlates token naming with language consistency |
| design-language | Upstream | Provides the original language specification to audit against |

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

