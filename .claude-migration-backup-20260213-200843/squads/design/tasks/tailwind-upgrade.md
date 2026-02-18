# Tailwind CSS v4 Upgrade Playbook

> Task ID: brad-tailwind-upgrade  
> Agent: Brad (Design System Architect)  
> Version: 1.0.0

## Description

Plan and execute migration from Tailwind CSS v3 (or earlier) to v4 (Oxide engine). Covers risk assessment, @theme conversion, Oxide benchmarks, dependency alignment, and human-in-the-loop verification.

## Prerequisites

- Existing Tailwind configuration and usage inventoried (*audit command recommended)
- Node.js ≥ 18.17 (prefer 20+)
- Access to CI pipelines and performance metrics
- Visual regression tooling (Chromatic, Lost Pixel, or equivalent)

## Workflow

### 1. Discovery & Planning
- Capture current Tailwind version, build times, CSS bundle size
- Identify PostCSS/Sass/Less/Stylus usage (must be removed/replaced)
- List third-party libraries dependent on `tailwind.config.js` (e.g. daisyUI)

### 2. Dry Run Upgrade
- Create feature branch `chore/tailwind-v4-upgrade`
- Run official upgrade CLI
  ```bash
  npx @tailwindcss/upgrade
  ```
- Convert config to CSS-first structure (`app.css` with `@import "tailwindcss";`)
- Replace `tailwind.config.js` customizations with `@theme`, `@layer`, `@plugin` CSS equivalents

### 3. Token & Utility Validation
- Ensure design tokens re-exported via `@theme` (core, semantic, component layers)
- Regenerate CSS utilities relying on previous `theme.extend`
- Validate arbitrary values still required; prefer tokenized utilities
- Confirm `@container`, `@starting-style`, 3D transforms working

### 4. Benchmark Oxide Engine
- Measure cold build, incremental build (with and without new CSS)
- Target benchmarks (Catalyst reference):
  - Cold build ≤ 120ms (target <100ms)
  - Incremental (new CSS) ≤ 8ms
  - Incremental (no CSS) ≤ 300µs
- Record metrics in README/Changelog

### 5. Regression Testing
- Run full unit + integration suite
- Execute visual regression (Chromatic/Lost Pixel) to detect class/utility drift
- Verify dark mode, theming, and Tailwind plugins still functional

### 6. Documentation & Rollout
- Update contributing docs with new `@theme` usage
- Refresh `.cursorrules` / coding guidelines (Tailwind v4 best practices)
- Communicate rollout checklist to team, include fallback steps

### 7. Update State
- Log upgrade metadata in `.state.yaml` (tailwind_version, benchmarks, validation status)
- Flag `tailwind_theme_validated: true` when `@theme` layers verified

## Deliverables

- Updated `app.css` (or dedicated entry) with `@theme` definitions
- Removed/archived legacy `tailwind.config.js` (if not required)
- Benchmarks documented (`docs/logs/tailwind-upgrade.md` or similar)
- Regression test results (links/screenshots)
- `.state.yaml` updated with upgrade details

## Success Criteria

- [ ] Tailwind upgraded to v4, builds pass locally and in CI
- [ ] `@theme` defines all design tokens (colors, spacing, typography, etc.)
- [ ] Oxide benchmarks recorded and meet targets (<30s cold build, <1ms incremental)
- [ ] CSS bundle size ≤ previous production size (ideally <50KB gzipped)
- [ ] No visual regressions (diff <1% or consciously accepted)
- [ ] Documentation (.cursorrules, README) reflects v4 workflow
- [ ] `.state.yaml` updated (`tailwind_theme_validated`, benchmarks, timestamp)

## Rollback Plan

1. `git revert` upgrade commits (config + package lock)
2. Restore previous `tailwind.config.js`
3. Reinstall previous Tailwind version
4. Re-run build/tests to ensure stability

## Notes

- Remove or replace Sass/Less/Stylus pipelines (v4 does not support preprocessors)
- Tailwind plugins may require v4-compatible versions (@tailwindcss/forms/typography/container-queries)
- Validate IDE tooling (Tailwind IntelliSense, Prettier plugin) upgraded to v4-aware releases
- Encourage incremental adoption: keep feature flags until confidence is high
