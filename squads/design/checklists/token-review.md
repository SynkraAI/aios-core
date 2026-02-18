# Checklist: Token Quality Review

**ID:** token-review
**Version:** 1.0
**Purpose:** Reviews design token quality including CTI naming, hierarchy correctness, orphan detection, platform transforms, documentation completeness, and DTCG compatibility
**Agent:** @jina-anne
**Quality Gate:** BLOCKING

---

## Prerequisites

- [ ] Token architecture has been defined (global, alias, component levels)
- [ ] Naming convention document exists (CTI or equivalent taxonomy)
- [ ] Style Dictionary or equivalent transform pipeline is configured
- [ ] Target platforms have been identified (Web, iOS, Android, etc.)

---

## Section 1: Naming Convention (CTI)

- [ ] All tokens follow Category-Type-Item naming (e.g., color.brand.primary)
- [ ] Category names are from the approved set (color, spacing, font, size, shadow, border, etc.)
- [ ] Type names describe the semantic group (brand, neutral, feedback, surface)
- [ ] Item names describe the specific variant (primary, secondary, 100, sm)
- [ ] Modifier suffixes are used consistently (hover, active, disabled)
- [ ] No abbreviations that are not universally understood
- [ ] Token names are lowercase with dot or dash separators (no camelCase)
- [ ] Names are platform-agnostic (no CSS-specific or Swift-specific terminology)

## Section 2: Hierarchy Correctness

- [ ] Global tokens define raw values (color.blue.500 = #3B82F6)
- [ ] Alias tokens reference global tokens (color.brand.primary = {color.blue.500})
- [ ] Component tokens reference alias tokens (button.color.background = {color.brand.primary})
- [ ] No component token directly references a global/raw value
- [ ] No circular references exist in the token chain
- [ ] Alias-to-alias chaining does not exceed 2 levels of indirection
- [ ] Hierarchy is documented with a visual diagram or clear text description

## Section 3: Orphan Detection

- [ ] All global tokens are referenced by at least one alias token
- [ ] All alias tokens are referenced by at least one component token or documented usage
- [ ] No tokens exist that were created but never consumed
- [ ] Deprecated tokens are tagged and have a removal timeline
- [ ] Token audit has been run to identify unused tokens
- [ ] Orphan token cleanup is scheduled as part of the release cycle

## Section 4: Platform Transforms

- [ ] CSS custom properties output is correct (--color-brand-primary: #3B82F6)
- [ ] SCSS variables output is correct ($color-brand-primary: #3B82F6)
- [ ] JSON output is correctly structured for JavaScript consumption
- [ ] iOS/Swift output uses correct UIColor or SwiftUI Color format
- [ ] Android XML output uses correct resource format
- [ ] Transform pipeline runs without errors across all platforms
- [ ] Output file naming follows platform conventions

## Section 5: Documentation

- [ ] Every token has a description explaining its intended use
- [ ] Token documentation includes visual swatches or previews
- [ ] Usage guidelines explain when to use each token tier
- [ ] Do/Don't examples show correct and incorrect token usage
- [ ] Changelog tracks token additions, changes, and deprecations
- [ ] Migration guide exists for tokens that have been renamed or removed
- [ ] Token documentation is searchable

## Section 6: DTCG Compatibility

- [ ] Token files use the W3C Design Tokens Community Group format
- [ ] $value property is used for token values
- [ ] $type property specifies the token type (color, dimension, fontFamily, etc.)
- [ ] $description property provides human-readable context
- [ ] Token groups use the $extensions property for metadata
- [ ] Composite tokens (typography, shadow) use the correct DTCG structure
- [ ] Exported tokens can be consumed by DTCG-compatible tools

---

## Scoring

| Category | Items | Pass | Status |
|----------|-------|------|--------|
| Naming Convention | 8 | _ | PENDING |
| Hierarchy Correctness | 7 | _ | PENDING |
| Orphan Detection | 6 | _ | PENDING |
| Platform Transforms | 7 | _ | PENDING |
| Documentation | 7 | _ | PENDING |
| DTCG Compatibility | 7 | _ | PENDING |

**Minimum passing score:** 85%
**Blocking items:** All Naming Convention and Hierarchy items must pass
