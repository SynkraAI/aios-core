# Frontend Testing Tools Reference

**ID:** testing-tools
**Version:** 1.0
**Purpose:** Comprehensive reference of tools for testing design system components across unit, visual, accessibility, and performance categories
**Maintained By:** @micah-godbolt

---

## Category: Unit Testing

Tools for testing component logic, rendering, and behavior in isolation.

| Tool | Purpose | Setup Complexity | CI/CD Integration | Design System Relevance | Cost |
|------|---------|-----------------|-------------------|------------------------|------|
| **Jest** | JavaScript test runner with assertion library, mocking, and snapshot testing | Low | Excellent — built-in CLI, JUnit reporter | High — snapshot testing catches unintended markup changes | Free |
| **Vitest** | Vite-native test runner, Jest-compatible API, faster execution | Low | Excellent — same reporters as Jest | High — ideal for Vite-based design system builds | Free |
| **Testing Library** | DOM-based testing utilities that encourage accessible queries (getByRole, getByLabel) | Low | Works with any runner (Jest, Vitest) | Very High — tests components the way users interact with them | Free |

### Unit Testing Notes

- **Recommended stack:** Vitest + Testing Library for new projects; Jest + Testing Library for existing Jest setups.
- **Design system focus:** Test component props, states (disabled, loading, error), keyboard interactions, and ARIA attribute output.
- **Snapshot testing:** Use sparingly. Prefer explicit assertions over snapshot matching to avoid brittle tests.

---

## Category: Visual Regression Testing

Tools that compare visual output of components across changes to detect unintended UI differences.

| Tool | Purpose | Setup Complexity | CI/CD Integration | Design System Relevance | Cost |
|------|---------|-----------------|-------------------|------------------------|------|
| **Chromatic** | Cloud-based visual testing integrated with Storybook; captures snapshots of every story | Low (Storybook required) | Excellent — GitHub/GitLab integration, PR checks | Very High — purpose-built for design systems | Free tier / Paid |
| **Percy** | Visual regression platform by BrowserStack; captures and compares full-page screenshots | Medium | Excellent — SDK for CI, PR status checks | High — supports cross-browser visual testing | Paid (free tier) |
| **Playwright Visual** | Built-in screenshot comparison in Playwright test runner | Medium | Good — runs in CI, stores baselines in repo | Medium — general purpose, not design-system specific | Free |
| **BackstopJS** | Open-source visual regression using headless Chrome, configurable viewports | Medium | Good — Docker support for consistent rendering | Medium — flexible but requires manual configuration | Free |

### Visual Regression Notes

- **Recommended for design systems:** Chromatic (if using Storybook) or Percy (if cross-browser coverage is critical).
- **Baseline management:** Store baselines in CI, not in the repo, to avoid merge conflicts.
- **Threshold tuning:** Set a pixel-difference threshold (typically 0.1-0.5%) to avoid false positives from anti-aliasing.

---

## Category: Accessibility Testing

Tools that verify components meet WCAG guidelines and work with assistive technologies.

| Tool | Purpose | Setup Complexity | CI/CD Integration | Design System Relevance | Cost |
|------|---------|-----------------|-------------------|------------------------|------|
| **axe-core** | Accessibility rules engine; can be embedded in unit tests, browser extensions, and CI | Low | Excellent — jest-axe, playwright-axe, cypress-axe integrations | Very High — automated WCAG checks per component | Free |
| **pa11y** | CLI and Node.js-based accessibility testing runner using HTML CodeSniffer | Low | Good — CLI output parseable in CI pipelines | High — good for page-level audits and CI gates | Free |
| **Storybook a11y addon** | Runs axe-core checks directly in Storybook panel for each story | Low (Storybook required) | Indirect — developers check during development | Very High — immediate feedback in component development | Free |
| **WAVE** | Browser extension that visually overlays accessibility issues on a page | Low (extension install) | None — manual testing only | Medium — useful for quick audits, not automation | Free |
| **Stark** | Figma/Sketch plugin for contrast checking, color blindness simulation | Low (plugin install) | None — design tool only | High — catches issues at design phase before code | Free / Paid |

### Accessibility Testing Notes

- **Recommended stack:** axe-core in unit tests + Storybook a11y addon for development + pa11y in CI for page-level checks.
- **Limitations:** Automated tools catch approximately 30-40% of WCAG issues. Manual testing with screen readers (NVDA, VoiceOver) is still essential.
- **Design system focus:** Test every component variant for: focus management, ARIA roles, keyboard navigation, and color contrast.

---

## Category: Integration Testing

Tools for testing components in realistic browser environments with user interaction flows.

| Tool | Purpose | Setup Complexity | CI/CD Integration | Design System Relevance | Cost |
|------|---------|-----------------|-------------------|------------------------|------|
| **Playwright** | Cross-browser end-to-end testing framework by Microsoft; Chromium, Firefox, WebKit | Medium | Excellent — Docker images, parallel execution, trace viewer | High — test component interactions across browsers | Free |
| **Cypress** | Browser-based integration testing with real-time preview and time travel debugging | Medium | Good — Cypress Cloud for parallelization and recording | High — component testing mode supports design systems | Free / Paid |
| **Storybook Interaction Tests** | Play functions that run interaction sequences inside Storybook stories | Low (Storybook required) | Good — integrates with Chromatic and test runners | Very High — tests component interactions in the same tool used for development | Free |

### Integration Testing Notes

- **Recommended for design systems:** Storybook Interaction Tests for component-level flows; Playwright for cross-browser validation.
- **Design system focus:** Test multi-step interactions (dropdown open > select > close), form validation flows, and responsive behavior.
- **Cross-browser priority:** Test in Chromium (primary), Firefox (secondary), and WebKit/Safari (critical for mobile design systems).

---

## Category: Performance Testing

Tools that measure rendering performance, bundle size, and runtime efficiency of components.

| Tool | Purpose | Setup Complexity | CI/CD Integration | Design System Relevance | Cost |
|------|---------|-----------------|-------------------|------------------------|------|
| **Lighthouse** | Google's auditing tool for performance, accessibility, SEO, and best practices | Low | Good — Lighthouse CI for automated performance budgets | Medium — page-level metrics, useful for documentation sites | Free |
| **Bundlephobia** | Analyzes npm package size, download time, and tree-shaking support | None (web tool) | None — manual check | High — ensures design system packages stay lightweight | Free |
| **size-limit** | CI tool that checks JavaScript bundle size against a budget on every commit | Low | Excellent — GitHub Actions integration, PR comments | Very High — prevents design system bundle size regression | Free |
| **Web Vitals** | Library for measuring Core Web Vitals (LCP, FID, CLS) in production | Low | Medium — requires reporting endpoint | Medium — tracks real-user performance impact of components | Free |

### Performance Testing Notes

- **Recommended for design systems:** size-limit in CI (bundle budget) + Lighthouse CI (documentation site performance).
- **Design system focus:** Monitor total package size, individual component sizes, and tree-shaking effectiveness.
- **Performance budgets:** Set thresholds (e.g., total CSS < 50KB, total JS < 100KB) and fail CI if exceeded.

---

## Comparison Table by Category

| Category | Recommended Primary | Recommended Secondary | Automation Level | Catches |
|----------|--------------------|-----------------------|------------------|---------|
| Unit Testing | Vitest + Testing Library | Jest + Testing Library | Full | Logic errors, prop handling, ARIA output |
| Visual Regression | Chromatic | Percy | Full | Unintended visual changes, CSS regressions |
| Accessibility | axe-core (jest-axe) | Storybook a11y addon | Partial (30-40%) | WCAG violations, missing ARIA, contrast |
| Integration | Storybook Interactions | Playwright | Full | Interaction bugs, cross-browser issues |
| Performance | size-limit | Lighthouse CI | Full | Bundle bloat, rendering regressions |

---

## Recommended Testing Stack for Design Systems

```
Layer 1 — Development Feedback (immediate)
  Storybook + a11y addon + Interaction Tests

Layer 2 — Pre-Commit / Pre-Push (seconds)
  Vitest + Testing Library + jest-axe

Layer 3 — CI Pipeline (minutes)
  Chromatic (visual) + pa11y (a11y) + size-limit (perf)

Layer 4 — Release Gate (before publish)
  Playwright cross-browser + Lighthouse CI + manual screen reader test
```

---

## Integration Patterns with Storybook

| Pattern | How It Works | Setup |
|---------|-------------|-------|
| **Story-driven unit tests** | Import stories into Vitest/Jest tests using `composeStories` | `@storybook/testing-react` or `@storybook/testing-vue3` |
| **Visual regression via stories** | Chromatic captures a screenshot of every story on every push | Connect Storybook project to Chromatic |
| **Accessibility checks per story** | `@storybook/addon-a11y` runs axe-core in the Storybook panel | Install addon, add to `.storybook/main.js` |
| **Interaction tests in stories** | `play` functions simulate user interactions inside stories | `@storybook/addon-interactions` + Testing Library |
| **Cross-browser via stories** | Playwright navigates to Storybook URLs and runs assertions | Serve Storybook statically, point Playwright to story URLs |

---

## References

- Storybook "Testing" (storybook.js.org/docs/writing-tests) | Chromatic (chromatic.com/docs)
- Deque axe-core (github.com/dequelabs/axe-core) | Playwright (playwright.dev)
- Micah Godbolt, "Frontend Architecture for Design Systems" (O'Reilly)
