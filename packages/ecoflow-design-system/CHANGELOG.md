# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-02-04

### Added

#### Design Tokens
- Complete design token system with colors, typography, spacing, shadows, and borders
- Teal primary color palette (10 shades)
- Yellow accent color palette (10 shades)
- Neutral gray palette (10 shades + black/white)
- Semantic colors (success, warning, error, info)
- Typography system with Inter font family
- Spacing scale based on 4px base unit (32 stops)
- Shadow system with 8 elevation levels
- Border radius and width tokens

#### Typography Components
- `Heading` component (H1-H6 with weight variants)
- `Text` component (various sizes and weights)

#### Layout Components
- `Container` component (6 size variants)
- `Stack` component (vertical/horizontal with gap control)
- `Grid` component (responsive grid layout)
- `Spacer` component (empty space utility)

#### Navigation Components
- `Sidebar` component (collapsible sidebar with nested items)
- `TopBar` component (header with search and user menu)
- `Breadcrumb` component (hierarchical navigation)
- `Tabs` component (horizontal tab navigation with keyboard support)

#### Form Components
- `Button` component (5 variants: primary, secondary, outline, ghost, danger)
- `Input` component (with label, helper text, error states, icons)
- `Select` component (dropdown with options)
- `Checkbox` component (single and grouped)
- `CheckboxGroup` component (vertical/horizontal orientation)
- `Radio` component (single and grouped)
- `RadioGroup` component (vertical/horizontal orientation)
- `Switch` component (toggle with label positioning)

#### Data Display Components
- `Badge` component (7 variants with size options)
- `Avatar` component (with fallback initials and image loading)
- `StatusIndicator` component (online/offline/busy/away)
- `Card` component (with header/body/footer slots)
- `Table` component (with sorting, pagination, row selection)

#### Feedback Components
- `Alert` component (4 variants: info, success, warning, error)
- `Loading` component (3 variants: spinner, dots, pulse)
- `Progress` component (linear and circular)
- `Modal` component (dialog with overlay and focus management)
- `Toast` component (notification system with 6 positions)

#### Documentation
- Comprehensive getting started guide
- Design principles documentation
- Accessibility documentation (WCAG 2.1 AA compliance)
- Testing strategy documentation
- 220+ Storybook stories with interactive examples

#### Testing
- 322 unit tests with 91.74% statement coverage
- 90.57% branch coverage
- 26 test suites covering all components
- Accessibility tests with ARIA validation
- Keyboard navigation tests

#### Build & Tooling
- Vite 5 for library build (ESM + CJS)
- TypeScript 5.3 with full type definitions
- Tree-shaking optimization (preserveModules enabled)
- Source maps for debugging
- Storybook 7 for component documentation
- Vitest 1.6.1 for testing

### Changed
- N/A (initial release)

### Deprecated
- N/A (initial release)

### Removed
- N/A (initial release)

### Fixed
- N/A (initial release)

### Security
- WCAG 2.1 AA compliance for all components
- Proper input sanitization in form components
- Focus trap in Modal component
- Secure default props (disabled states, validation)

---

## Release Notes

### v0.1.0 - Foundation Release

This is the initial production-ready release of the EcoFlow Design System. It includes:

- **24 production-ready components** covering typography, layout, navigation, forms, data display, and feedback
- **Complete design token system** for consistent styling
- **WCAG 2.1 AA accessibility compliance** across all components
- **91.74% test coverage** with 322 passing tests
- **220+ Storybook stories** for interactive documentation
- **Full TypeScript support** with type definitions
- **Optimized build** with tree-shaking support

The design system is ready for production use in React 18+ applications.

---

[Unreleased]: https://github.com/SynkraAI/aios-core/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/SynkraAI/aios-core/releases/tag/v0.1.0
