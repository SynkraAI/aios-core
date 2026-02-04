# EcoFlow Design System

> A modern, accessible React design system with comprehensive components for building project management dashboards and web applications.

[![npm version](https://img.shields.io/npm/v/@fosc/ecoflow-design-system.svg)](https://www.npmjs.com/package/@fosc/ecoflow-design-system)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG-2.1%20AA-green)](https://www.w3.org/WAI/WCAG21/quickref/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🎨 **24 Production-Ready Components** - Typography, layout, navigation, forms, data display, and feedback
- 🎯 **Design Tokens System** - Consistent colors, typography, spacing, shadows, and borders
- ♿ **WCAG 2.1 AA Compliant** - Built-in accessibility with proper ARIA attributes and keyboard navigation
- 📦 **Tree-Shakeable** - Import only what you need, optimized bundle sizes
- 🔷 **Full TypeScript Support** - Complete type definitions and IntelliSense
- 📚 **Storybook Documentation** - 220+ interactive stories with live examples
- ✅ **Comprehensive Tests** - 322 tests with 91.74% coverage
- 🎨 **Professional Theme** - Teal primary + yellow accent + neutral grays

## 📦 Installation

```bash
npm install @fosc/ecoflow-design-system
# or
yarn add @fosc/ecoflow-design-system
# or
pnpm add @fosc/ecoflow-design-system
```

**Peer Dependencies:**
- `react` ^18.0.0
- `react-dom` ^18.0.0

## 🚀 Quick Start

```tsx
import { Button, Card, Alert } from '@fosc/ecoflow-design-system';

function App() {
  return (
    <Card padding="md">
      <Alert variant="success" title="Welcome!">
        You're ready to build with EcoFlow Design System
      </Alert>
      <Button variant="primary" size="md">
        Get Started
      </Button>
    </Card>
  );
}
```

## 📖 Component Categories

### Typography
- `Heading` - H1-H6 headings with weight variants
- `Text` - Body text in various sizes

### Layout
- `Container` - Max-width wrapper
- `Stack` - Flexible vertical/horizontal layout
- `Grid` - CSS Grid layout
- `Spacer` - Empty space component

### Navigation
- `Sidebar` - Collapsible sidebar navigation
- `TopBar` - Header with search and user menu
- `Breadcrumb` - Hierarchical navigation trail
- `Tabs` - Horizontal tab navigation

### Forms
- `Button` - Primary, secondary, outline, ghost, danger variants
- `Input` - Text input with label, helper text, error states
- `Select` - Dropdown select
- `Checkbox` / `CheckboxGroup` - Single and grouped checkboxes
- `Radio` / `RadioGroup` - Single and grouped radios
- `Switch` - Toggle switch

### Data Display
- `Badge` - Status indicators and labels
- `Avatar` - User avatars with fallback
- `StatusIndicator` - Online/offline/busy/away indicators
- `Card` - Flexible card container
- `Table` - Data table with sorting and selection

### Feedback
- `Alert` - Informational messages (info, success, warning, error)
- `Loading` - Loading indicators (spinner, dots, pulse)
- `Progress` - Progress bars (linear, circular)
- `Modal` - Dialog overlays
- `Toast` - Notification toasts

## Using Design Tokens

```typescript
import { colors, typography, spacing } from '@fosc/ecoflow-design-system/tokens';

const styles = {
  backgroundColor: colors.primary[500],  // Teal
  padding: spacing[4],                   // 16px
  fontFamily: typography.fontFamily.sans, // Inter
};
```

## 🎨 Design Tokens

### Colors

- **Primary (Teal):** 10 shades from `#E0F7F4` to `#007A58` (main: `#00BFA5`)
- **Accent (Yellow):** 10 shades from `#FFF9E6` to `#D15900` (main: `#FFB800`)
- **Neutral (Grays):** 10 shades + black/white
- **Semantic:** Success (green), Warning (amber), Error (red), Info (blue)

```typescript
import { colors } from '@fosc/ecoflow-design-system/tokens';

colors.primary[500]   // '#00BFA5' - Main teal
colors.accent.yellow[500] // '#FFB800' - Main yellow
colors.neutral[600]   // '#4B5563' - Body text
colors.semantic.success.DEFAULT // '#10B981' - Success green
```

### Typography

- **Font Family:** Inter (recommended), system-ui fallback
- **Font Sizes:** 10 sizes from `12px` to `60px`
- **Font Weights:** 6 weights (300-800)
- **Presets:** h1-h6, body, caption, badge, button

```typescript
import { typography, typographyPresets } from '@fosc/ecoflow-design-system/tokens';

typography.fontSize.base // '1rem' (16px)
typography.fontWeight.semibold // 600
typographyPresets.h1 // Complete h1 typography
```

### Spacing

- **Scale:** 32 stops (4px base, 8px grid)
- **Containers:** 6 sizes (640px - 1536px)
- **Breakpoints:** 5 responsive breakpoints

```typescript
import { spacing, container, breakpoints } from '@fosc/ecoflow-design-system/tokens';

spacing[4]  // '1rem' (16px)
spacing[6]  // '1.5rem' (24px)
container.xl // '1280px' - Main container
breakpoints.lg // '1024px'
```

### Shadows & Borders

```typescript
import { shadows, borders } from '@fosc/ecoflow-design-system/tokens';

shadows.boxShadow.DEFAULT // Card shadow
shadows.zIndex[50]  // Modal z-index
borders.borderRadius.md // '0.375rem' (6px)
borders.borderWidth.DEFAULT // '1px'
```

## 🔧 CSS Variables

Generate CSS custom properties for use in stylesheets:

```typescript
import { generateCSSVariables } from '@fosc/ecoflow-design-system/tokens';

const cssVars = generateCSSVariables();

// Apply to root element
Object.entries(cssVars).forEach(([key, value]) => {
  document.documentElement.style.setProperty(key, value);
});
```

Then use in CSS:

```css
.my-button {
  background-color: var(--color-primary-500);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--border-radius-default);
  font-size: var(--font-size-base);
}
```

## 📚 Documentation

Run Storybook locally:

```bash
cd packages/ecoflow-design-system
npm run storybook
```

Visit `http://localhost:6006` to explore components and tokens interactively.

## 🧪 Development

```bash
# Install dependencies
npm install

# Run development mode
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run Storybook
npm run storybook

# Build for production
npm run build

# Lint and type-check
npm run lint
npm run typecheck
```

## 📁 Project Structure

```
packages/ecoflow-design-system/
├── src/
│   ├── tokens/           # Design tokens
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   ├── shadows.ts
│   │   ├── borders.ts
│   │   └── index.ts
│   ├── components/       # React components (Phase 3)
│   ├── utils/            # Utility functions
│   └── index.ts
├── design-analysis/      # Design token analysis docs
├── tests/                # Test utilities and setup
├── .storybook/           # Storybook configuration
└── package.json
```

## ♿ Accessibility

All components follow WCAG 2.1 AA guidelines:

- ✅ Proper ARIA attributes
- ✅ Keyboard navigation support
- ✅ Focus management
- ✅ Screen reader compatibility
- ✅ Color contrast compliance (4.5:1 minimum)

See [ACCESSIBILITY.md](./docs/ACCESSIBILITY.md) for detailed accessibility features.

## 🧪 Testing

```bash
npm test                    # Run tests
npm run test:coverage       # Tests with coverage
npm run lint                # ESLint
npm run typecheck           # TypeScript
```

**Test Coverage:**
- ✅ 91.74% statements
- ✅ 90.57% branches
- ✅ 322 passing tests
- ✅ 26 test suites

## 📚 Documentation

- **[Getting Started Guide](./docs/GETTING_STARTED.md)** - Installation, usage, and best practices
- **[Design Principles](./docs/DESIGN_PRINCIPLES.md)** - Core principles and design philosophy
- **[Testing Strategy](./TESTING.md)** - Test coverage and testing guidelines
- **[Storybook](http://localhost:6006)** - Interactive component explorer (run `npm run storybook`)

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## 📄 License

MIT © Luiz Fosc

## 🔗 Links

- [Repository](https://github.com/luizfosc/aios-core/tree/main/packages/ecoflow-design-system)
- [Issues](https://github.com/luizfosc/aios-core/issues)
- [Storybook Documentation](https://ecoflow-design-system.vercel.app) _(coming soon)_

---

Built with ❤️ using **React** + **TypeScript** + **Vite**
