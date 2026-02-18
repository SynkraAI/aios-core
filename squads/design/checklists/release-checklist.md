# Checklist: Release Checklist

**ID:** release-checklist
**Version:** 1.0
**Purpose:** Pre-release validation ensuring version management, documentation, testing, visual regression, accessibility, and communication are complete before publishing
**Agent:** @nathan-curtis
**Quality Gate:** BLOCKING

---

## Prerequisites

- [ ] All planned features for this release are merged to the release branch
- [ ] Release branch has been created from main/develop
- [ ] No open critical or blocker issues tagged for this release
- [ ] Release manager has been assigned

---

## Section 1: Version Management

- [ ] Version number has been bumped according to semver
- [ ] Package.json (or equivalent manifest) reflects the new version
- [ ] Lock file is updated and committed
- [ ] Git tag has been prepared matching the version
- [ ] All dependency versions are pinned and compatible
- [ ] No pre-release or snapshot dependencies in the release

## Section 2: Changelog and Documentation

- [ ] CHANGELOG.md is updated with all changes since last release
- [ ] Changes are categorized (Added, Changed, Deprecated, Removed, Fixed, Security)
- [ ] Breaking changes are prominently documented at the top
- [ ] Migration guide is written for each breaking change
- [ ] Component documentation reflects any API changes
- [ ] Storybook stories are updated to match current implementation
- [ ] Design token documentation is current

## Section 3: Testing

- [ ] All unit tests pass with zero failures
- [ ] Integration tests pass across supported frameworks
- [ ] End-to-end tests pass for critical user flows
- [ ] Code coverage meets minimum threshold (e.g., 80%)
- [ ] No new linting errors or warnings introduced
- [ ] TypeScript type checking passes with no errors
- [ ] Build completes successfully for all target platforms

## Section 4: Visual Regression

- [ ] Visual regression tests have been run against all components
- [ ] All visual diffs have been reviewed and approved
- [ ] New visual baselines have been captured for new components
- [ ] Theme variations (light, dark, high-contrast) are visually verified
- [ ] Responsive screenshots are clean across breakpoints
- [ ] No unintended visual changes in existing components

## Section 5: Accessibility Audit

- [ ] Automated a11y scan passes with zero critical issues
- [ ] Keyboard navigation verified for all interactive components
- [ ] Screen reader testing completed on at least one reader (NVDA, VoiceOver, or JAWS)
- [ ] Color contrast verified against WCAG 2.2 AA
- [ ] Focus management tested for modals, dialogs, and dynamic content
- [ ] Reduced motion preferences are respected

## Section 6: Documentation Site

- [ ] Documentation site builds without errors
- [ ] All component pages render correctly
- [ ] Search functionality returns accurate results
- [ ] Interactive examples are functional
- [ ] Version selector shows the new version
- [ ] Broken links check passes

## Section 7: Communication

- [ ] Release notes draft is prepared for the announcement channel
- [ ] Migration guide has been reviewed by at least one consuming team
- [ ] Support team has been briefed on breaking changes
- [ ] Release date has been communicated to stakeholders
- [ ] Post-release monitoring plan is in place

---

## Scoring

| Category | Items | Pass | Status |
|----------|-------|------|--------|
| Version Management | 6 | _ | PENDING |
| Changelog and Docs | 7 | _ | PENDING |
| Testing | 7 | _ | PENDING |
| Visual Regression | 6 | _ | PENDING |
| Accessibility Audit | 6 | _ | PENDING |
| Documentation Site | 6 | _ | PENDING |
| Communication | 5 | _ | PENDING |

**Minimum passing score:** 90%
**Blocking items:** All Testing and Accessibility items must pass before release
