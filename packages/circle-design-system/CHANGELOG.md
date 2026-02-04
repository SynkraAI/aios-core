# Changelog

All notable changes to the Circle Design System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-04

### Added

#### Design Tokens
- **Colors**: Primary blue (#506CF0), neutrals (10 shades), semantic colors (success/warning/error/info), gamification colors (gold/silver/bronze)
- **Typography**: Inter font family, 10 font sizes (10px-64px), 4 weights, line heights, letter spacing, presets for h1-h6 and body variants
- **Spacing**: 32 spacing stops (4px base system), container widths, breakpoints (mobile/tablet/desktop)
- **Shadows**: 7 box shadow levels, z-index layers, backdrop blur effects, opacity levels
- **Borders**: Border radius values (8px buttons, 20px cards, full for pills), widths, styles

#### Components

**Buttons (1 component)**
- `Button`: Primary interactive element with 4 variants (primary, secondary, ghost, danger), 3 sizes (sm/md/lg), loading state, icons support, and full-width option

**Cards (1 component + 3 subcomponents)**
- `Card`: Container component with 3 variants (default, elevated, bordered), hoverable option
- `Card.Header`: Header section with title and actions
- `Card.Body`: Main content area
- `Card.Footer`: Footer section with actions or metadata

**Data Display (1 component)**
- `Badge`: Status labels with 6 variants (default, primary, success, warning, danger, info), 3 sizes (sm/md/lg), 3 styles (solid, subtle, outline), icon support

#### Infrastructure
- TypeScript 5.3 with strict mode
- Vite 5 build system with tree-shaking optimization
- Vitest 1.6 testing framework
- Storybook 7.6 for component documentation
- ESLint and Prettier configuration
- WCAG AA accessibility compliance

#### Testing
- 60 comprehensive unit tests
- 91.27% test coverage
- All components tested for rendering, interactions, styling, and accessibility

### Package Features
- Tree-shakeable ESM and CJS builds
- TypeScript type definitions
- Zero hardcoded values - all styling from design tokens
- Fully documented API with JSDoc
- Interactive Storybook examples

---

## Roadmap

Based on comprehensive Circle.so analysis, the following components are planned:

### Navigation (7 components)
- Navbar, Sidebar, Tabs, Breadcrumbs, Pagination, Menu, Dropdown

### Layout (4 components)
- Grid, Stack, Divider, Container

### Forms (7 components)
- Input, Textarea, Select, Checkbox, Radio, Switch, FileUpload

### Feedback (5 components)
- Alert, Toast, Modal, Dialog, Progress

### Chat (3 components)
- ChatBubble, ChatInput, MessageList

### Gamification (4 components)
- ProgressBar, Leaderboard, PointsDisplay, Achievement

### And 40+ more components identified in Circle.so analysis

---

**Total components planned**: 70+
**Current progress**: 3 core components (Button, Card, Badge) + design tokens foundation

[0.1.0]: https://github.com/SynkraAI/aios-core/releases/tag/circle-design-system-v0.1.0
