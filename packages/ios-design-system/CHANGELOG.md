# Changelog

All notable changes to the iOS Design System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-04

### Added

#### Phase 1: Design Analysis & Token Extraction
- Analyzed iOS 16 Figma UI Kit
- Extracted design tokens (colors, typography, spacing, shadows, radius)
- Created design token documentation

#### Phase 2: Project Setup & Architecture
- Initialized React + TypeScript + Vite project
- Configured ESLint, Prettier, Vitest, Storybook 8
- Set up design token system with TypeScript exports
- Created demo page for testing

#### Phase 3: Component Implementation (24 components)

**Navigation Components (Task 3.1)**
- TabBar: Bottom navigation with badge support (49pt height, translucent)
- NavigationBar: Top bar with large title mode (44pt height, safe area aware)
- Toolbar: Action bar with flexible layout (44pt height, top/bottom positioning)
- SegmentedControl: Tab switcher with sliding indicator (32pt height, 2-5 segments)

**Form Components (Task 3.2)**
- Button: Filled, tinted, gray, plain variants with icons and loading states
- TextField: Text input with label, placeholder, error states, clear button
- Toggle: iOS-style switch with smooth spring animation
- Slider: Range slider with custom colors and step values

**List Components (Task 3.3)**
- List: Container with grouped/inset styles
- ListItem: Rich item with icon, label, detail, value, accessories, toggle, badge
- SectionHeader: Section header with optional action button
- SwipeActions: Swipeable wrapper with leading/trailing actions

**Data Display Components (Task 3.4)**
- Card: Container with default/elevated/filled variants, optional header
- Badge: Notification badge (shows 99+ for >99, 6 color variants, 3 sizes)
- SFSymbol: Icon component with emoji fallback (5 sizes, 9 weights, 3 rendering modes)
- StatusIndicator: Online/offline/away/busy/dnd status with pulse animation

**Feedback Components (Task 3.5)**
- ActionSheet: Modal action picker with slide-up animation, destructive actions
- Alert: Modal alert dialog with 1-3 buttons, intelligent layout (horizontal/vertical)
- ActivityIndicator: Loading spinner (3 sizes, custom colors, smooth rotation)
- ProgressView: Progress bar with percentage label (2 variants: default 4px, bar 8px)

#### Design Tokens
- **Colors**: System colors (light + dark mode) - Red, Blue, Green, Orange, Purple, Gray
- **Typography**: SF Pro Display (34px, 28px, 22px, 20px) + SF Pro Text (17px, 15px, 13px, 11px)
- **Spacing**: 8pt grid (4, 8, 12, 16, 20, 24, 32, 40, 48px)
- **Shadows**: Small, medium, large with iOS-native blur
- **Radius**: 4pt, 6pt, 8pt, 10pt, 12pt, 14pt rounded corners

#### Features
- **Dark mode support**: Automatic via `@media (prefers-color-scheme: dark)`
- **iOS-native animations**: Spring (cubic-bezier), scale, fade, slide-up
- **Accessibility**: ARIA attributes, keyboard navigation, screen reader support
- **Safe area support**: env(safe-area-inset-*) for notch and home indicator
- **Translucent effects**: backdrop-filter blur for iOS glassmorphism
- **291 unit tests**: Vitest + Testing Library with 100% component coverage
- **100+ Storybook stories**: Comprehensive documentation with examples

### Technical Details
- **Framework**: React 18 + TypeScript 5
- **Build tool**: Vite 5
- **Testing**: Vitest 1.6 + Testing Library
- **Documentation**: Storybook 8
- **Styling**: Pure CSS with CSS custom properties
- **Bundle size**: 33.94 kB CSS (gzip: 5.60 kB)

### iOS 16 HIG Compliance
- ✅ 44pt minimum tap targets
- ✅ SF Pro typography
- ✅ 8pt grid spacing
- ✅ System colors (light + dark)
- ✅ Native animations and transitions
- ✅ Safe area insets
- ✅ Translucent backgrounds
- ✅ WCAG AA accessibility

[0.1.0]: https://github.com/SynkraAI/aios-core/releases/tag/ios-design-system-v0.1.0
