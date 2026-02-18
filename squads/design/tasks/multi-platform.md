# Task: Design Multi-Platform Token Delivery

**Task ID:** multi-platform
**Version:** 1.0
**Purpose:** Designs multi-platform token delivery for web (CSS vars, SCSS), iOS (Swift), Android (Kotlin/XML), and cross-platform (React Native, Flutter), handling transforms and format differences
**Agent:** @jina-anne
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

This task designs the pipeline that transforms platform-agnostic design tokens into platform-specific outputs. Each platform has different requirements: web uses CSS custom properties and rem units, iOS uses Swift constants and point units, Android uses XML resources and dp units. Cross-platform frameworks like React Native and Flutter have their own conventions. This task maps every transformation, defines output formats, handles platform-specific edge cases, and establishes the build pipeline.

Multi-platform delivery is what makes design tokens truly powerful. A single source of truth that generates correct, idiomatic output for every platform eliminates the manual translation that causes cross-platform inconsistencies. When the designer changes a color, it should update everywhere simultaneously.

```
INPUT (token taxonomy, platform targets, build tooling)
    ↓
[PHASE 1: PLATFORM ANALYSIS]
    → Analyze each platform's requirements, constraints, and conventions
    ↓
[PHASE 2: TRANSFORM DESIGN]
    → Design transformations: value conversions, name formatting, file generation
    ↓
[PHASE 3: PIPELINE DEFINITION]
    → Define build pipeline, output structure, and distribution strategy
    ↓
OUTPUT: Multi-Platform Delivery Specification
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| token_taxonomy | object | Yes | Complete token taxonomy from token-taxonomy task |
| platform_targets | list | Yes | Target platforms with versions: web (CSS/SCSS), iOS (Swift), Android (Kotlin/XML), etc. |
| build_tooling | string | Yes | Token build tool: Style Dictionary, Theo, Specify, or custom |
| distribution_method | string | No | How tokens are distributed: npm package, CocoaPod, Maven, CDN, monorepo |

---

## Preconditions

- Token taxonomy is complete with all layers and references defined
- Target platforms are confirmed with minimum supported versions
- Build tool is selected or decision will be made during this task
- Distribution infrastructure exists or will be set up as part of delivery
- Platform engineering teams are available to validate output format requirements
- Package registries (npm, CocoaPods, Maven) are accessible for distribution testing

---

## Steps

### Phase 1: Platform Analysis
1. Document web platform requirements: CSS custom properties for runtime theming, SCSS variables for build-time, rem/em units, RGB/HSL/hex color formats
2. Document iOS platform requirements: Swift constants or generated enums, UIColor/SwiftUI.Color, CGFloat for sizing, point units
3. Document Android platform requirements: XML resource files or Kotlin objects, @color/@dimen resources, dp/sp units
4. Document cross-platform requirements: React Native StyleSheet values, Flutter ThemeData, platform-specific overrides
5. Identify platform-specific limitations: CSS variable fallbacks, Android XML naming restrictions, iOS color space handling

### Phase 2: Transform Design
1. Design value transforms: px-to-rem (web), px-to-pt (iOS), px-to-dp (Android), color format conversions per platform
2. Design name transforms: kebab-case for CSS, camelCase for JS/Swift, SCREAMING_SNAKE for Android XML, dot notation for Flutter
3. Design composite token handling: how typography and shadow composites decompose per platform
4. Design theme switching: CSS data attributes (web), UIUserInterfaceStyle (iOS), Configuration.uiMode (Android)
5. Handle platform-specific tokens: tokens that only apply to certain platforms (e.g., -webkit prefixes, safe area insets)

### Phase 3: Pipeline Definition
1. Define the build pipeline: source parsing, reference resolution, transforms, formatting, file generation
2. Specify output file structure: one file per category, one file per component, or one monolithic file per platform
3. Design the distribution strategy: versioned packages, CDN delivery, monorepo imports
4. Create CI/CD integration plan: automated token builds on source change, visual diff on PR, automated publishing
5. Define validation checks: automated tests ensuring all tokens generate correctly for every platform
6. Document platform-specific limitations and workarounds: CSS variable fallback syntax, Android XML character restrictions
7. Create a platform comparison matrix showing how each token category renders across all target platforms

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| delivery-spec | Markdown | Complete multi-platform delivery specification |
| transform-map | Markdown table | Every transformation rule mapped from source to each platform output |
| pipeline-config | JSON/YAML | Build tool configuration file (e.g., Style Dictionary config) |
| distribution-plan | Markdown | How platform packages are versioned, published, and consumed |
| platform-comparison | Markdown table | Side-by-side comparison of how tokens render on each platform |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| all_platforms_covered | blocking | Every target platform must have a defined transformation and output format |
| value_accuracy | blocking | Transformed values must be mathematically correct (e.g., 16px = 1rem at default) |
| name_validity | blocking | Generated names must be syntactically valid on each target platform |
| round_trip_test | warning | Transforming a token to platform output and back should yield the original value |
| build_automated | warning | The pipeline should be fully automated with no manual steps |
| composite_handled | warning | Composite tokens (typography, shadow) must decompose correctly per platform |
| ci_integrated | warning | Token build pipeline should be integrated into CI/CD for automated validation |

---

## Handoff

- **On completion:** Hand to @micah-godbolt for frontend-audit to verify web platform token integration
- **On completion (alt):** Hand to @heydon-pickering for inclusive-audit to verify token-driven accessibility (contrast, sizing)
- **On completion (alt):** Hand to @micah-godbolt for testing-strategy to add platform output validation tests
- **On issues:** Escalate to @design-chief
- **Dependencies:** Requires token-taxonomy task; feeds into token-migration and architecture-plan

---

## Related Tasks

| Task | Relationship | Description |
|------|-------------|-------------|
| token-taxonomy | Upstream | Provides the organized token structure to deliver |
| token-migration | Downstream | Uses platform outputs for migration execution |
| architecture-plan | Downstream | Integrates platform delivery into frontend architecture |
| testing-strategy | Downstream | Adds platform output validation to test suite |

---

## Glossary

> Full glossary: [design-glossary.md](../data/design-glossary.md)

**Key terms for this task:**

- **Design tokens** — Platform-agnostic key-value pairs encoding design decisions
- **Design system** — Tokens, components, patterns, guidelines, and tooling for UI consistency
- **Component API** — Props interface defining how a component is consumed

---

## Don't Do

- Do not skip reading the full task specification before executing
- Do not create from scratch when similar patterns exist in the design system
- Do not hardcode values that should be design tokens
- Do not skip validation steps defined in the task workflow

