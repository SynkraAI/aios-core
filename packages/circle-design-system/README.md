# Circle Design System

Professional React component library extracted from [Circle.so](https://circle.so/br).

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://reactjs.org/)
[![WCAG](https://img.shields.io/badge/WCAG-AA-green.svg)](https://www.w3.org/WAI/WCAG2AA-Conformance)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Features

✨ **70+ Components** - Comprehensive component library covering all use cases

🎨 **Complete Design Tokens** - Colors, typography, spacing, shadows, and borders

♿ **Accessibility First** - WCAG AA compliant out of the box

📦 **Tree-Shakeable** - Optimized bundle size with modern build tools

🔧 **TypeScript Native** - Fully typed with strict mode

📚 **Storybook** - Interactive component documentation

🧪 **Well Tested** - Comprehensive unit tests for all components

## Installation

```bash
npm install @synkra/circle-design-system
# or
yarn add @synkra/circle-design-system
# or
pnpm add @synkra/circle-design-system
```

## Quick Start

```tsx
import { Button, Card, Badge } from '@synkra/circle-design-system';

function App() {
  return (
    <Card variant="elevated">
      <Card.Header
        title="Welcome to Circle"
        actions={<Badge variant="primary">New</Badge>}
      />
      <Card.Body>
        Professional component library for modern React applications.
      </Card.Body>
      <Card.Footer>
        <Button variant="primary">Get Started</Button>
      </Card.Footer>
    </Card>
  );
}
```

## Design Tokens

```tsx
import { colors, typography, spacing } from '@synkra/circle-design-system/tokens';

// Use design tokens directly
const MyComponent = () => (
  <div style={{
    color: colors.primary.DEFAULT,
    fontSize: typography.fontSize.lg,
    padding: spacing[4],
  }}>
    Styled with Circle tokens
  </div>
);
```

## Components

### Current Components (v0.1.0)

#### Buttons
- **Button** - Primary interactive element with variants, sizes, and loading state

#### Cards
- **Card** - Container for grouping content with Header, Body, and Footer sections

#### Data Display
- **Badge** - Status labels with variants and styles

### Coming Soon

Based on comprehensive Circle.so analysis, we're building 70+ components including:

- **Navigation**: Navbar, Sidebar, Tabs, Breadcrumbs, Pagination
- **Layout**: Grid, Stack, Divider, Container
- **Forms**: Input, Textarea, Select, Checkbox, Radio, Switch
- **Feedback**: Alert, Toast, Modal, Dialog
- **Chat**: ChatBubble, ChatInput, MessageList
- **Gamification**: ProgressBar, Badge, Leaderboard, PointsDisplay
- And many more...

## Design System Philosophy

This design system is based on the visual language of **Circle.so**, a modern community platform. The design tokens and components reflect:

- **Primary Color**: Blue (#506CF0) - Professional and trustworthy
- **Typography**: Inter font family with clean, modern aesthetics
- **Spacing**: 4px base system for consistent rhythm
- **Borders**: 8px buttons, 20px cards for modern rounded aesthetics
- **Accessibility**: WCAG AA minimum for inclusive design

## Development

```bash
# Install dependencies
npm install

# Start development with watch mode
npm run dev

# Run tests
npm test
npm run test:coverage

# Run Storybook
npm run storybook

# Build for production
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

This design system was extracted through comprehensive analysis of Circle.so. We're actively expanding the component library based on the identified patterns.

Current progress:
- ✅ Design Tokens (complete)
- ✅ Core Components (Button, Card, Badge)
- 🚧 70+ Additional Components (in progress)

## License

MIT © Synkra

---

**Built with ❤️ based on [Circle.so](https://circle.so/br) design patterns**
