# Checklist: Testing Completeness

**ID:** testing-checklist
**Version:** 1.0
**Purpose:** Validates testing completeness across unit tests, visual regression, integration, accessibility automation, performance benchmarks, and cross-browser verification
**Agent:** @micah-godbolt
**Quality Gate:** BLOCKING

---

## Prerequisites

- [ ] Testing framework is configured and operational (Jest, Vitest, or equivalent)
- [ ] Visual regression tool is set up (Chromatic, Percy, BackstopJS, or equivalent)
- [ ] Accessibility testing library is integrated (axe-core, jest-axe)
- [ ] CI pipeline runs tests on pull requests

---

## Section 1: Unit Tests

- [ ] Core component logic is tested (state changes, computed values, conditions)
- [ ] All prop variations are tested with expected rendering outcomes
- [ ] Default prop values are verified
- [ ] Event handlers are tested (onClick, onChange, onFocus, etc.)
- [ ] Edge cases are covered (empty strings, null values, overflow text)
- [ ] Error conditions are tested and produce expected behavior
- [ ] Utility functions have dedicated unit tests
- [ ] Test names describe behavior, not implementation details

## Section 2: Visual Regression

- [ ] Snapshot exists for the default/resting state
- [ ] Snapshots exist for each major variant (primary, secondary, destructive, etc.)
- [ ] Snapshots exist for each interactive state (hover, focus, active, disabled)
- [ ] Responsive snapshots are captured at defined breakpoints
- [ ] Theme variations are captured (light mode, dark mode)
- [ ] Snapshots are reviewed and approved by a designer or design-aware reviewer
- [ ] Baseline images are versioned and reproducible

## Section 3: Integration Tests

- [ ] Component works correctly when composed within parent components
- [ ] Slot or children content renders as expected
- [ ] Context providers and consumers integrate correctly
- [ ] Form components work within form management libraries
- [ ] Component responds to global state changes (theme, locale)
- [ ] Server-side rendering does not produce hydration mismatches
- [ ] Lazy-loaded components render after dynamic import

## Section 4: Accessibility Automated Tests

- [ ] axe-core (or equivalent) runs against every component in CI
- [ ] Zero violations at "critical" and "serious" severity levels
- [ ] ARIA attribute correctness is programmatically verified
- [ ] Keyboard interaction tests simulate Tab, Enter, Escape, Arrow keys
- [ ] Focus trap behavior is tested for modal and overlay components
- [ ] Screen reader text (visually hidden) is verified present
- [ ] Color contrast assertions exist for themed components

## Section 5: Performance Benchmarks

- [ ] Render time is measured for complex components (< 16ms target for 60fps)
- [ ] Re-render count is verified — no unnecessary re-renders on prop changes
- [ ] Memory usage is profiled for components that manage significant state
- [ ] Bundle size impact of each component is tracked
- [ ] Performance regression tests fail if metrics degrade beyond threshold
- [ ] Large list rendering is benchmarked (virtual scrolling if > 100 items)

## Section 6: Cross-Browser Verification

- [ ] Chrome (latest) is verified
- [ ] Firefox (latest) is verified
- [ ] Safari (latest) is verified
- [ ] Edge (latest) is verified
- [ ] Mobile Safari (iOS) is verified
- [ ] Mobile Chrome (Android) is verified
- [ ] No browser-specific CSS hacks are required
- [ ] Progressive enhancement is applied for unsupported features

---

## Scoring

| Category | Items | Pass | Status |
|----------|-------|------|--------|
| Unit Tests | 8 | _ | PENDING |
| Visual Regression | 7 | _ | PENDING |
| Integration Tests | 7 | _ | PENDING |
| A11y Automated Tests | 7 | _ | PENDING |
| Performance Benchmarks | 6 | _ | PENDING |
| Cross-Browser | 8 | _ | PENDING |

**Minimum passing score:** 80%
**Blocking items:** All A11y Automated Tests and Unit Tests must pass before merge
