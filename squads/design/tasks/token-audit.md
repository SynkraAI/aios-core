# Task: Audit Design Tokens

**Task ID:** token-audit
**Version:** 1.0
**Purpose:** Audits existing design tokens for naming consistency, coverage, redundancy, platform support, and DTCG compliance
**Agent:** @jina-anne
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

This task performs a thorough audit of an existing design token system to assess its health and identify improvement opportunities. Tokens are the foundation of a scalable design system, and inconsistencies at the token level cascade into component and platform issues. The audit evaluates naming consistency, value coverage (are all design decisions tokenized?), redundancy (duplicate or near-duplicate tokens), platform support completeness, and compliance with the DTCG specification.

Token debt is invisible until it causes problems — a misnamed token confuses developers, a missing token leads to hardcoded values, and a redundant token creates maintenance burden. Regular audits surface these issues before they compound into systemic quality problems.

```
INPUT (token source files, platform outputs, design files)
    ↓
[PHASE 1: INVENTORY]
    → Parse all tokens, catalog names, values, references, and metadata
    ↓
[PHASE 2: ANALYSIS]
    → Evaluate naming, coverage, redundancy, platform output, compliance
    ↓
[PHASE 3: REPORTING]
    → Produce audit report with scores, findings, and remediation plan
    ↓
OUTPUT: Token Audit Report
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| token_source | string | Yes | Path to token source files (JSON, YAML, or JS) |
| platform_outputs | list | Yes | Paths to generated platform outputs (CSS, Swift, Kotlin, etc.) |
| design_files | list | Yes | Links to design files where tokens are consumed |
| token_architecture_spec | string | No | Path to the token architecture specification for compliance checking |
| dtcg_spec_version | string | No | DTCG specification version to audit against |

---

## Preconditions

- Token source files are accessible and parseable
- Platform output files are available for cross-referencing
- Design files are accessible to verify token adoption in design tools
- The token architecture specification exists for comparison, or audit will establish baseline
- CI/CD pipeline is accessible for integration of automated token checks
- The team has allocated time for remediation of critical findings

---

## Steps

### Phase 1: Inventory
1. Parse all token source files and extract: token name, value, type, references, description, and metadata
2. Count totals: number of global tokens, alias tokens, component tokens, and total
3. Catalog all token references: which alias tokens point to which globals, which component tokens point to which aliases
4. Parse platform output files and map each output token back to its source definition
5. Identify orphaned tokens: defined in source but never referenced; referenced but never defined

### Phase 2: Analysis
1. Naming consistency audit: check all names against the naming convention, flag violations with location and suggestion
2. Coverage analysis: compare tokenized values against all hardcoded values in codebase and design files — calculate tokenization percentage
3. Redundancy detection: identify tokens with identical or near-identical values (e.g., two blues within 2% of each other)
4. Platform support analysis: verify each token transforms correctly to every target platform, flag missing or broken transforms
5. DTCG compliance check: validate token structure against DTCG spec (required fields: $value, $type, $description)

### Phase 3: Reporting
1. Calculate Token Health Score: weighted composite of naming (25%), coverage (25%), redundancy (20%), platform (15%), compliance (15%)
2. List all findings organized by category with severity: critical, moderate, low
3. Identify the top 10 highest-impact remediation actions
4. Create phased remediation plan: immediate fixes, short-term improvements, long-term restructuring
5. Define ongoing monitoring: automated checks to add to CI/CD pipeline
6. Compare token system against DTCG specification compliance requirements
7. Benchmark token count and complexity against similar-scale design systems for context

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| audit-report | Markdown | Complete token audit report with health score, findings, and analysis |
| naming-violations | Markdown table | All naming convention violations with location and correction suggestion |
| coverage-report | Markdown | Tokenization coverage analysis with hardcoded values that should be tokens |
| remediation-plan | Markdown | Prioritized plan to address audit findings with effort estimates |
| redundancy-report | Markdown table | Tokens with identical or near-identical values flagged for consolidation |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| full_parse | blocking | All token source files must be parsed without errors |
| cross_reference | blocking | Token references must be validated — no broken references allowed |
| coverage_measured | blocking | Tokenization coverage percentage must be calculated against actual codebase |
| platform_verified | blocking | Each target platform output must be verified for correctness |
| score_calculated | warning | A quantitative health score must be produced for tracking over time |
| dtcg_checked | warning | Compliance with DTCG specification should be assessed if applicable |
| orphans_identified | warning | Orphaned tokens (defined but unreferenced) must be flagged |

---

## Handoff

- **On completion:** Hand to @jina-anne for token-migration to plan remediation of audit findings
- **On completion (alt):** Hand to @micah-godbolt for frontend-audit to correlate token issues with frontend architecture
- **On completion (alt):** Hand to @alla-kholmatova for language-audit to compare token naming with design language consistency
- **On issues:** Escalate to @design-chief
- **Dependencies:** Requires existing token system; feeds into token-migration and code-standards tasks

---

## Related Tasks

| Task | Relationship | Description |
|------|-------------|-------------|
| token-migration | Downstream | Plans remediation of audit findings |
| frontend-audit | Parallel | Correlates token issues with frontend architecture |
| language-audit | Parallel | Compares token naming with design language consistency |
| code-standards | Downstream | Adds token-related rules based on audit findings |

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

