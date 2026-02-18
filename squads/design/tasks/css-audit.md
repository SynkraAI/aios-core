# Task: CSS Codebase Audit

**Task ID:** css-audit
**Version:** 1.0
**Purpose:** Perform a comprehensive audit of a CSS codebase analyzing specificity, complexity, duplication, and performance
**Agent:** @andy-bell
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Audits an existing CSS codebase through multiple lenses: specificity graph analysis, selector complexity scoring, duplication detection, unused rule identification, responsive strategy evaluation, custom property usage assessment, and performance impact measurement. The audit produces actionable findings that guide refactoring decisions, architecture improvements, and methodology adoption. This is the diagnostic step that precedes any CSS architecture work.

```
INPUT (CSS source files, project context, audit scope)
    |
[PHASE 1: DATA COLLECTION]
    -> Parse CSS files, extract metrics, generate specificity graph
    |
[PHASE 2: ANALYSIS]
    -> Evaluate patterns, identify problems, assess architecture quality
    |
[PHASE 3: RECOMMENDATIONS]
    -> Prioritize findings, propose remediation, estimate effort
    |
OUTPUT: CSS audit report with metrics, findings, and remediation roadmap
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| css_source | string | Yes | Path to CSS source files or directory containing all stylesheets |
| project_url | string | Yes | URL of the running project for runtime analysis (unused CSS, render performance) |
| audit_scope | enum(full, specificity, performance, architecture) | Yes | Focus area of the audit |
| build_config | string | No | Path to CSS build configuration (PostCSS, Sass, etc.) for source map analysis |
| target_methodology | string | No | Desired CSS methodology (CUBE, BEM, etc.) to evaluate against |
| previous_audit | file | No | Previous audit results for trend comparison |

---

## Preconditions

- CSS source files are accessible and represent the complete stylesheet for the project
- A running or deployable version of the project is available for runtime analysis
- The auditor has access to browser developer tools or equivalent analysis tools
- CSS build pipeline (if any) is documented so source maps can be traced
- Stakeholders understand this is an analysis task that produces findings, not fixes
- Design tokens or a style guide exists for comparison against actual CSS values
- At least 5 representative pages are identified for runtime unused CSS analysis

---

## Steps

### Phase 1: Data Collection and Metrics
1. Parse all CSS files and extract total statistics: file count, total lines, total rules, total selectors, total declarations, total unique properties
2. Generate the specificity graph: plot selector specificity across the stylesheet in source order; a healthy graph trends upward gradually
3. Measure selector complexity: count compound selectors, descendant combinators, nesting depth, and qualify selectors (element.class patterns)
4. Detect duplication: identify repeated declaration blocks, near-duplicate selectors, and property value repetition that could be tokenized
5. Run unused CSS analysis against the project URL: identify rules that match no elements on any sampled page
6. Catalog custom property usage: how many are defined, how many are consumed, orphaned properties, hardcoded values that should be properties
7. Measure CSS file sizes: raw, minified, and gzip-compressed; compare against performance budgets

### Phase 2: Pattern Analysis
1. **Specificity evaluation**: Identify specificity spikes (rules that jump suddenly in specificity), specificity wars (competing selectors for same element), and unnecessary `!important` usage
2. **Architecture assessment**: Evaluate whether the CSS follows a recognizable methodology or is ad hoc; categorize rules by type (reset, layout, component, utility, override)
3. **Responsive strategy review**: Analyze breakpoint usage consistency, identify conflicting media queries, assess mobile-first vs desktop-first approach, evaluate use of modern techniques (container queries, clamp(), fluid values)
4. **Color analysis**: Extract all unique color values; identify near-duplicate colors (within a perceptual threshold), colors not in the design token palette, and accessibility contrast failures
5. **Typography analysis**: Catalog all font-size, line-height, and font-family declarations; compare against the type scale and identify deviations
6. **Spacing analysis**: Extract all margin, padding, and gap values; compare against the spacing scale and identify ad hoc values
7. **Performance analysis**: Identify expensive selectors (universal, deep descendant), large animation/transition costs, and render-blocking patterns

### Phase 3: Reporting and Recommendations
1. Score the CSS health across 6 dimensions (1-10): specificity control, duplication, token usage, architecture clarity, responsive maturity, performance
2. Classify each finding by severity: critical (performance/accessibility impact), major (maintainability risk), minor (consistency issue), informational
3. Prioritize remediation actions using an impact-effort matrix
4. Propose a target architecture (e.g., CUBE CSS migration) with estimated effort for the transition
5. Create a before/after projection: what the metrics would look like after remediation
6. If a previous audit exists, calculate trends: improvements, regressions, new issues
7. Generate an executive summary with the top 5 findings and recommended next steps

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| audit_report | markdown | Full audit report with all metrics, findings, and analysis |
| specificity_graph | markdown (table/chart) | Specificity data plotted across stylesheet source order |
| metrics_dashboard | markdown table | Key metrics: file size, selector count, specificity stats, duplication rate |
| remediation_backlog | markdown checklist | Prioritized list of remediation actions with effort estimates |
| architecture_proposal | markdown | Recommended target CSS architecture with migration path |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Complete coverage | blocking | Every CSS file in scope must be included in the analysis |
| Metrics accuracy | blocking | All numeric metrics must be generated from actual parsed CSS, not estimates |
| Actionable findings | blocking | Every finding must include a specific remediation action and effort estimate |
| Specificity graph | warning | The specificity graph should cover the full stylesheet and identify anomalies |
| Unused CSS analysis | warning | Runtime unused CSS analysis should cover at least 5 representative pages |
| Token gap analysis | warning | Hardcoded values that should be tokens must be cataloged with replacement values |

---

## Handoff

- **On completion:** Hand to @dan-mall for design direction alignment on token and color findings
- **On architecture migration:** Continue with @andy-bell cube-css task for CUBE CSS implementation
- **On component findings:** Hand to @brad-frost for component architecture review alignment
- **On responsive findings:** Continue with @andy-bell responsive-strategy task for responsive approach redesign
- **On issues:** Escalate to @design-chief

---

## Glossary

> Full glossary: [design-glossary.md](../data/design-glossary.md)

**Key terms for this task:**

- **CSS custom properties** — CSS variables (`--color-primary`) for theming and tokens
- **Tailwind CSS** — Utility-first CSS framework with classes like `flex`, `p-4`
- **CUBE CSS** — Composition, Utility, Block, Exception methodology
- **@layer** — CSS cascade layer for organizing style precedence
- **Utility classes** — Single-purpose CSS classes composed in markup

---

## Don't Do

- Do not mix naming conventions (BEM + utility classes) without a clear layering strategy
- Do not add custom CSS that duplicates existing utility classes
- Do not use `!important` to override specificity — restructure cascade layers instead
- Do not ignore unused CSS during audits — dead code increases bundle size
- Do not upgrade Tailwind versions without checking for breaking changes in config format

