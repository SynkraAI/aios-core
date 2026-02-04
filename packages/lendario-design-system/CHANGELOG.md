# Changelog

All notable changes to the Lendário AI Design System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-04

### Added

#### Design Tokens
- Complete color palette with primary teal (#0FB5AE) and secondary gold (#F5D76E)
- Semantic colors (success, warning, error, info)
- Comprehensive neutral scale for dark and light themes
- Background colors for dark-first design
- Border colors with teal accent variants
- Overlay and effect colors

#### Typography
- Inter font family with system fallbacks
- Complete font size scale (tiny to 7xl)
- Font weight scale (300-900)
- Line height presets (tight, relaxed, etc.)
- Typography presets (h1-h6, body, button, display)
- Responsive fluid sizing with clamp()

#### Spacing
- 8px base spacing unit
- Complete spacing scale (0-32)
- Container widths (sm to 2xl)
- Responsive breakpoints
- Component-specific spacing presets

#### Shadows & Effects
- Box shadow scale (sm to 2xl)
- Component shadows (button, modal)
- Gradient presets (hero, card variants)
- Backdrop filters
- Z-index scale

#### Borders
- Border width scale
- Border radius scale (sm to full, circle)
- Border style presets
- Component border presets

#### Transitions
- Duration scale (instant to slowest)
- Easing functions
- Transition presets (default, button, modal)
- Animation keyframes (pulse, modalSlideIn, fadeIn)

#### Utilities
- CSS variables generator
- Token to CSS variable conversion
- Apply CSS variables to DOM
- Get CSS variable values
- CSS string generator

#### Testing
- Color token tests
- Typography token tests
- CSS variable generator tests
- Vitest configuration with coverage

#### Documentation
- Comprehensive README
- Extraction report with analysis of 3 source pages
- Usage examples
- Token categories documentation
- Development setup guide

#### Build System
- TypeScript configuration (strict mode)
- Vite build setup (library mode)
- ESLint configuration
- Package exports (tokens, utils)
- Source maps enabled

### Extracted From
- **Club Page** (academialendaria.ai/club) - Branding, typography confirmation
- **Cohort Page** (cohort.lendario.ai) - Primary token source (colors, spacing, effects)
- **App Page** (app.lendario.ai/dados) - Dual theme, light mode, alternative variants

### Design Identity
- Dark-first aesthetic with pure black backgrounds
- Teal + Gold color scheme for modern AI education vibe
- Inter typography with responsive fluid sizing
- Generous use of shadows, gradients, and effects for depth
- 8px base spacing unit for consistent rhythm

## [Unreleased]

### Planned
- [ ] React component library (Button, Card, Modal, etc.)
- [ ] Storybook documentation
- [ ] Component stories and examples
- [ ] Additional component tests
- [ ] Visual regression testing
- [ ] Dark/light theme switcher utility
- [ ] Tailwind CSS plugin
- [ ] Figma design tokens sync
- [ ] CSS-in-JS utilities (styled-components, emotion)
- [ ] Additional color variants (tertiary, etc.)
- [ ] Animation utilities library
- [ ] Accessibility audit and improvements
- [ ] NPM publish workflow
