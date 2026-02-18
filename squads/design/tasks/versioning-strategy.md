# Task: Versioning Strategy

**Task ID:** versioning-strategy
**Version:** 1.0
**Purpose:** Establish semantic versioning strategy with breaking change policy, deprecation timeline, and migration support
**Agent:** @nathan-curtis
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Defines the complete versioning and release strategy for a design system: how version numbers are assigned, what constitutes a breaking change, how deprecations are communicated, and how consumers are supported through migrations. A clear versioning strategy builds trust, prevents surprise breakages, and enables teams to adopt updates confidently.

```
INPUT (system maturity, consumer count, release frequency)
    |
[PHASE 1: VERSIONING FRAMEWORK]
    -> Define version numbering, change classification, and branching model
    |
[PHASE 2: DEPRECATION AND MIGRATION]
    -> Design deprecation lifecycle and migration support process
    |
[PHASE 3: RELEASE OPERATIONS]
    -> Define release cadence, changelog standards, and communication plan
    |
OUTPUT: Versioning strategy document with policies, templates, and release playbook
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| system_maturity | enum(pre-1.0, stable, mature) | Yes | Current maturity level to calibrate stability expectations |
| consumer_count | number | Yes | Number of products or teams consuming the design system |
| current_versioning | string | Yes | How versioning is handled today (none, informal, semver, date-based) |
| release_frequency | enum(continuous, weekly, biweekly, monthly, quarterly) | No | Current or desired release cadence |
| breaking_change_tolerance | enum(low, medium, high) | No | Consumer tolerance for breaking changes; defaults to low |

---

## Preconditions

- The design system has more than one consumer (versioning is less critical for single-consumer systems)
- A package distribution mechanism exists (npm, CDN, Figma library, or equivalent)
- The governance model defines who can authorize releases and breaking changes
- Source control branching strategy is documented or will be defined here

---

## Steps

### Phase 1: Versioning Framework
1. Adopt semantic versioning (MAJOR.MINOR.PATCH) as the base framework:
   - **PATCH** (x.x.1): Bug fixes, documentation corrections, internal refactors with no API or visual change
   - **MINOR** (x.1.0): New components, new variants, new props with backward-compatible defaults, new tokens
   - **MAJOR** (1.0.0): Removed components, renamed props, changed default behavior, token restructuring
2. Define the classification rubric for common changes:
   - Adding an optional prop: MINOR
   - Changing a prop default value: MAJOR
   - Adding a new component: MINOR
   - Removing a component: MAJOR
   - Changing token values: PATCH (if design-intent) or MAJOR (if structural)
   - Renaming a token: MAJOR
   - Adding a variant: MINOR
   - Removing a variant: MAJOR
3. Define the branching model:
   - `main`: always releasable, reflects latest stable
   - `develop`: integration branch for upcoming minor release
   - `release/x.y`: release candidate branches for stabilization
   - `feature/name`: individual feature branches
4. Establish pre-release versioning: alpha, beta, rc suffixes (e.g., 2.0.0-alpha.1)
5. Define canary/nightly builds for early testing if applicable

### Phase 2: Deprecation and Migration
1. Define the deprecation lifecycle:
   - **Announce**: Deprecation notice in changelog and documentation, console warnings in code
   - **Grace period**: Minimum 2 minor versions or 3 months (whichever is longer) before removal
   - **Migration guide**: Published before or alongside the deprecation announcement
   - **Removal**: In the next major version after the grace period expires
2. Create the deprecation notice template: what is deprecated, why, what replaces it, migration steps, removal timeline
3. Design the migration support process:
   - Codemods or automated migration scripts for code changes
   - Figma migration instructions for design file updates
   - Office hours or dedicated support channel during major version transitions
4. Define the breaking change RFC process:
   - Proposal with rationale, impact analysis, and migration plan
   - Comment period (minimum 2 weeks) for affected teams
   - Steering committee approval required
5. Establish a compatibility matrix: which major versions are actively supported, security-patched, or end-of-life

### Phase 3: Release Operations
1. Define the release cadence:
   - Patch releases: as needed (hotfixes) or weekly batch
   - Minor releases: bi-weekly or monthly depending on velocity
   - Major releases: no more than twice per year to limit migration burden
2. Create the release checklist:
   - All tests pass, visual regression tests clean
   - Changelog entry for every change
   - Documentation updated for new/changed components
   - Migration guide written for any deprecations
   - Release notes reviewed by core team
3. Define changelog standards: format (Keep a Changelog), categorization (Added, Changed, Deprecated, Removed, Fixed, Security)
4. Design the communication plan: release announcement email, Slack notification, documentation site banner, team meeting mention
5. Establish rollback procedure: how to revert a release if critical issues are discovered post-publish
6. Define metrics: release frequency adherence, time from merge to publish, consumer upgrade latency

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| versioning-policy | markdown | Complete semver policy with change classification rubric |
| deprecation-guide | markdown | Deprecation lifecycle, notice template, and migration support process |
| release-playbook | markdown checklist | Step-by-step checklist for executing a release at each level |
| changelog-template | markdown | Standardized changelog format with categories and examples |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Change classification | blocking | At least 10 common change types must be classified as PATCH, MINOR, or MAJOR |
| Deprecation timeline | blocking | Minimum grace period must be defined with specific duration |
| Release checklist | blocking | Release checklist must cover testing, documentation, changelog, and communication |
| Migration support | warning | Major version transitions must include migration guide and optional codemod |
| Rollback procedure | warning | A process for reverting a broken release must be documented |
| Communication plan | warning | At least 2 channels for release communication must be specified |

---

## Handoff

- **On completion:** Hand to @nathan-curtis (governance-model) for integration into governance policies
- **On contribution impact:** Hand to @nathan-curtis (contribution-model) for contributor versioning education
- **On component compatibility:** Hand to @brad-frost for component-level compatibility testing
- **On issues:** Escalate to @design-chief

---

## Glossary

> Full glossary: [design-glossary.md](../data/design-glossary.md)

**Key terms for this task:**

- **Governance model** — Rules for who can add/modify design system components and tokens
- **Versioning strategy** — How changes are versioned, communicated, and rolled out
- **Breaking change** — A modification that requires consumers to update their code
- **Contribution guide** — Process for proposing, reviewing, and approving new components or tokens

---

## Don't Do

- Do not skip the review process when adding components to the design system
- Do not introduce breaking changes without a documented migration path
- Do not assume governance rules are understood — document them explicitly with examples
- Do not modify shared components without notifying consuming teams

