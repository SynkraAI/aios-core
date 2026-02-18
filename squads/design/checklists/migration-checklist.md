# Checklist: Token Migration Checklist

**ID:** migration-checklist
**Version:** 1.0
**Purpose:** Validates the token migration process from audit through mapping, creation, replacement, testing, rollback planning, and team communication
**Agent:** @jina-anne
**Quality Gate:** BLOCKING

---

## Prerequisites

- [ ] Migration scope has been defined (which tokens, which platforms, which teams)
- [ ] Migration timeline has been approved by stakeholders
- [ ] Current token inventory has been exported or documented
- [ ] Target token architecture has been finalized and reviewed

---

## Section 1: Audit

- [ ] Complete inventory of existing tokens has been generated
- [ ] Each token's current value, usage count, and consuming components are documented
- [ ] Tokens are categorized by type (color, spacing, typography, etc.)
- [ ] Tokens with zero usage are identified for removal
- [ ] Platform-specific token overrides are cataloged
- [ ] Third-party or inherited tokens are flagged separately
- [ ] Audit results have been reviewed by the design system lead

## Section 2: Mapping

- [ ] Old-to-new token name mapping table is complete
- [ ] One-to-one mappings are verified (old token X becomes new token Y)
- [ ] One-to-many splits are documented (old token X becomes Y and Z)
- [ ] Many-to-one merges are documented (old tokens X and Y become Z)
- [ ] Tokens with no equivalent in the new system are flagged for review
- [ ] Mapping has been reviewed and approved by token architecture owner
- [ ] Mapping is exportable as a machine-readable format (JSON, CSV)

## Section 3: Token Creation

- [ ] All new tokens have been created in the token source files
- [ ] New tokens follow the approved naming convention (CTI)
- [ ] New tokens are organized in the correct hierarchy (global, alias, component)
- [ ] Token values are verified against design specs
- [ ] Token descriptions are populated for documentation generation
- [ ] Transform pipeline produces correct output for all platforms
- [ ] New tokens have been published to a pre-release/beta channel

## Section 4: Hardcoded Value Identification

- [ ] Codebase scan has identified all hardcoded color values
- [ ] Codebase scan has identified all hardcoded spacing values
- [ ] Codebase scan has identified all hardcoded typography values
- [ ] Hardcoded values have been mapped to their token equivalents
- [ ] Values with no token equivalent are flagged for new token creation
- [ ] Priority order for hardcoded value replacement is defined

## Section 5: Replacement Plan

- [ ] Replacement order is defined (tokens first, then hardcoded values)
- [ ] Automated replacement script or codemod has been prepared
- [ ] Manual replacement items are assigned to specific team members
- [ ] Replacement is planned in phases (not a single big-bang migration)
- [ ] Each phase has a defined scope, timeline, and owner
- [ ] Acceptance criteria for each phase are documented
- [ ] Phase completion sign-off process is defined

## Section 6: Testing Plan

- [ ] Visual regression baseline has been captured before migration starts
- [ ] Visual regression will be run after each migration phase
- [ ] Automated tests verify token resolution on all target platforms
- [ ] Manual spot-checks are assigned for high-visibility pages/components
- [ ] Cross-browser testing is included in the testing plan
- [ ] Theme switching (light/dark) is tested after migration
- [ ] Performance impact of new token architecture is measured

## Section 7: Rollback Plan

- [ ] Git branch strategy allows easy rollback of each phase
- [ ] Previous token package version is available for emergency revert
- [ ] Rollback procedure is documented step-by-step
- [ ] Rollback has been tested in a staging environment
- [ ] Rollback decision criteria are defined (what triggers a rollback)
- [ ] Rollback communication plan is prepared

## Section 8: Team Communication

- [ ] Migration announcement has been sent to all consuming teams
- [ ] Migration timeline and phases are shared in a central location
- [ ] FAQ document addresses common questions and concerns
- [ ] Office hours or dedicated support channel is available during migration
- [ ] Post-migration retrospective is scheduled
- [ ] Success metrics for the migration are defined and measurable

---

## Scoring

| Category | Items | Pass | Status |
|----------|-------|------|--------|
| Audit | 7 | _ | PENDING |
| Mapping | 7 | _ | PENDING |
| Token Creation | 7 | _ | PENDING |
| Hardcoded Values | 6 | _ | PENDING |
| Replacement Plan | 7 | _ | PENDING |
| Testing Plan | 7 | _ | PENDING |
| Rollback Plan | 6 | _ | PENDING |
| Team Communication | 6 | _ | PENDING |

**Minimum passing score:** 85%
**Blocking items:** Mapping and Rollback Plan items must all pass before migration begins
