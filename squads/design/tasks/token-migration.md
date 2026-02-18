# Task: Plan Token Migration

**Task ID:** token-migration
**Version:** 1.0
**Purpose:** Plans migration from hardcoded values to design tokens using a phased approach: audit, map, create, replace, and validate
**Agent:** @jina-anne
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

This task creates a comprehensive migration plan for transitioning a codebase from hardcoded design values to design tokens. Migration is one of the highest-risk design system activities — done poorly, it introduces visual regressions, breaks platform builds, and erodes team trust. This task plans every phase: auditing existing hardcoded values, mapping them to token equivalents, creating missing tokens, replacing values in code, and validating that nothing changed visually. The result is a safe, incremental migration plan.

The key insight is that token migration should produce zero visual changes. Every replaced value should render identically to the original. The value of migration is not immediate visual improvement but future flexibility: once everything uses tokens, system-wide changes become trivial.

```
INPUT (codebase audit, token system, visual baselines)
    ↓
[PHASE 1: AUDIT & MAP]
    → Scan codebase for hardcoded values, map each to a token equivalent
    ↓
[PHASE 2: MIGRATION PLAN]
    → Define migration order, batch strategy, rollback procedures
    ↓
[PHASE 3: VALIDATION DESIGN]
    → Design visual regression testing, sign-off process, rollout strategy
    ↓
OUTPUT: Token Migration Plan
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| codebase_paths | list | Yes | Paths to codebases that contain hardcoded values to migrate |
| token_system | object | Yes | The token taxonomy and architecture that values will migrate to |
| visual_baselines | list | Yes | Screenshot baselines or visual testing infrastructure for regression detection |
| migration_scope | string | No | Full migration or scoped to specific areas (e.g., colors only, one app only) |
| risk_tolerance | string | No | Low (one file at a time), medium (one component at a time), high (batch by category) |

---

## Preconditions

- Token system is built, tested, and available for consumption in all target platforms
- Visual regression testing infrastructure is in place or can be set up before migration
- The codebase is under version control with ability to create feature branches
- Stakeholders understand that migration is iterative and will require multiple releases
- Code review capacity is available for reviewing migration batches
- Communication channels are established for notifying consuming teams of token changes

---

## Steps

### Phase 1: Audit and Map
1. Scan all codebases for hardcoded color values (hex, RGB, HSL), extract unique values with file locations and frequency
2. Scan for hardcoded spacing values (px, rem, em for margins, padding, gaps), extract and catalog
3. Scan for hardcoded typography values (font-size, font-weight, line-height, font-family), extract and catalog
4. For each hardcoded value, find the closest matching token — flag values with no exact token match
5. Produce the migration mapping: a complete table of hardcoded values, their file locations, and corresponding tokens

### Phase 2: Migration Plan
1. Define migration order by risk: start with lowest-risk changes (colors on non-interactive surfaces), end with highest (layout spacing)
2. Group migrations into batches: each batch should be independently deployable and verifiable
3. Define the batch size limit: maximum number of files changed per batch to keep reviews manageable
4. Create rollback procedures for each batch: how to revert if visual regressions are detected
5. Estimate timeline: based on batch count, review capacity, and release cadence

### Phase 3: Validation Design
1. Define visual regression testing strategy: automated screenshot comparison for every migrated component
2. Establish acceptable difference thresholds: pixel tolerance for each comparison type
3. Design the human sign-off process: who reviews each batch, what they check, how they approve
4. Plan the rollout strategy: feature flags, staged rollout, or direct release per batch
5. Create the migration tracking dashboard: batch status, token coverage percentage, remaining work
6. Define the communication plan: how consuming teams are notified before, during, and after each migration batch
7. Establish the "no new hardcoded values" policy: linting rules that prevent new hardcoded values from entering the codebase

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| migration-plan | Markdown | Complete phased migration plan with batches, timeline, and rollback procedures |
| value-to-token-map | Markdown table | Every hardcoded value mapped to its token replacement with file locations |
| validation-strategy | Markdown | Visual regression testing approach with thresholds and sign-off process |
| tracking-dashboard-spec | Markdown | Specification for migration progress tracking |
| linting-rules | JSON | ESLint or stylelint rules to prevent new hardcoded values from entering the codebase |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| complete_mapping | blocking | Every hardcoded value in scope must be mapped to a token or flagged as unmappable |
| batch_independence | blocking | Each migration batch must be independently deployable without depending on other batches |
| rollback_defined | blocking | Every batch must have a documented rollback procedure |
| visual_regression_planned | warning | Visual regression testing must be defined before any migration batch executes |
| timeline_realistic | warning | Timeline must account for review capacity and release cadence |
| no_hardcoded_policy | warning | A linting rule preventing new hardcoded values should be defined |
| communication_planned | warning | Consumer notification plan must be documented for each migration batch |

---

## Handoff

- **On completion:** Hand to @micah-godbolt for code-standards to enforce token usage in new code going forward
- **On completion (alt):** Hand to @micah-godbolt for testing-strategy to implement visual regression tests
- **On completion (alt):** Hand to @heydon-pickering for inclusive-audit to verify migration did not introduce accessibility regressions
- **On issues:** Escalate to @design-chief
- **Dependencies:** Requires token-audit and token-taxonomy tasks; feeds into code-standards and testing-strategy

---

## Related Tasks

| Task | Relationship | Description |
|------|-------------|-------------|
| token-audit | Upstream | Identifies the hardcoded values to migrate |
| token-taxonomy | Upstream | Provides the target token structure |
| code-standards | Downstream | Enforces token usage in new code |
| testing-strategy | Downstream | Implements visual regression tests for migration |

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

