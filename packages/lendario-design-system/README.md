# Lendário AI Design System

> Modern design system for AI education platforms with dark theme aesthetics

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Overview

Design system extracted from [Academia Lendária](https://www.academialendaria.ai/club), [Cohort Fundamentals](https://cohort.lendario.ai/), and [Lendário App](https://app.lendario.ai/dados).

**Visual Identity:**
- **Primary Color:** Teal/Cyan (`#0FB5AE`) - Interactive elements, links, accents
- **Secondary Color:** Gold/Yellow (`#F5D76E`) - CTAs, primary buttons
- **Theme:** Dark-first with light mode support
- **Typography:** Inter font family
- **Style:** Modern, clean, tech-forward AI aesthetic

## 📦 Installation

```bash
npm install @fosc/lendario-design-system
# or
yarn add @fosc/lendario-design-system
# or
pnpm add @fosc/lendario-design-system
```

## 🚀 Quick Start

### Using Design Tokens

```typescript
import { colors, typography, spacing } from '@fosc/lendario-design-system/tokens'

// Use tokens directly
const styles = {
  backgroundColor: colors.primary[500],      // #0FB5AE - Teal
  color: colors.neutral[50],                 // #F0F0E8 - Text primary
  fontFamily: typography.fontFamily.sans,    // Inter
  fontSize: typography.fontSize.base,        // 1rem
  padding: spacing[4],                       // 1rem (16px)
}
```

### Using CSS Variables

```typescript
import { generateCSSVariables, applyCSSVariables } from '@fosc/lendario-design-system/utils'

// Generate all CSS variables
const cssVars = generateCSSVariables()

// Apply to document root
applyCSSVariables(cssVars)

// Or get CSS string
import { cssVariablesToString } from '@fosc/lendario-design-system/utils'
const cssString = cssVariablesToString(cssVars)
```

Then use in CSS:

```css
.button {
  background-color: var(--color-primary-500);
  color: var(--color-neutral-50);
  font-family: var(--font-fontFamily-sans);
  padding: var(--spacing-4);
  border-radius: var(--border-borderRadius-full);
}
```

## 🎨 Design Tokens

### Colors

**Primary (Teal/Cyan)**
```typescript
colors.primary[500] // #0FB5AE - Main accent
colors.primary[600] // #0DA29C - Hover state
```

**Secondary (Gold/Yellow)**
```typescript
colors.secondary[500] // #F5D76E - CTA buttons
colors.secondary[900] // #C4A76A - Alternative gold
```

**Semantic**
```typescript
colors.semantic.success.DEFAULT // #10B981 - Green
colors.semantic.warning.DEFAULT // #FF9500 - Orange
colors.semantic.error.DEFAULT   // #F43F5E - Red
colors.semantic.info.DEFAULT    // #0EA5E9 - Blue
```

**Backgrounds (Dark Theme)**
```typescript
colors.background.DEFAULT       // #000000 - Main
colors.background.card          // #0a0a0a - Cards
colors.background.elevated      // #050505 - Elevated sections
```

### Typography

**Font Family**
```typescript
typography.fontFamily.sans // 'Inter', system-ui, sans-serif
```

**Sizes**
```typescript
typography.fontSize.base    // 1rem (16px) - Body
typography.fontSize['2xl']  // 1.5rem (24px) - H2 base
typography.fontSize['4xl']  // 2rem (32px) - H1 base
```

**Presets**
```typescript
typographyPresets.h1    // clamp(2rem, 5vw, 3.5rem), bold, tight
typographyPresets.body  // 1rem, normal, line-height 1.6
```

### Spacing

**Base Unit:** 8px (0.5rem)

```typescript
spacing[2]  // 0.5rem (8px)
spacing[4]  // 1rem (16px)
spacing[6]  // 1.5rem (24px)
spacing[8]  // 2rem (32px)
spacing[16] // 4rem (64px)
```

**Containers**
```typescript
container.xl  // 1200px - Main container (cohort)
```

**Breakpoints**
```typescript
breakpoints.md // 768px - Tablet
breakpoints.lg // 1024px - Desktop
```

### Shadows

```typescript
shadows.boxShadow.button      // 0 10px 40px rgba(245, 215, 110, 0.3)
shadows.boxShadow.buttonHover // 0 15px 50px rgba(245, 215, 110, 0.4)
shadows.boxShadow.modal       // 0 25px 80px rgba(0, 0, 0, 0.6)
```

**Gradients**
```typescript
gradients.hero      // Teal gradient for hero sections
gradients.cardTeal  // Card background with teal accent
```

### Borders

```typescript
borders.borderRadius.DEFAULT // 0.75rem (12px) - Cards
borders.borderRadius.lg      // 1rem (16px) - Large cards
borders.borderRadius.full    // 9999px - Buttons
borders.borderRadius.circle  // 50% - Icons
```

### Transitions

```typescript
transitions.duration.slow      // 300ms - Standard
transitionPresets.default.value // all 0.3s ease
transitionPresets.button.value  // all 0.3s ease
transitionPresets.modal.value   // transform 0.25s ease-out
```

## 📖 Token Categories

| Category | Import Path | Description |
|----------|-------------|-------------|
| Colors | `@fosc/lendario-design-system/tokens` | Primary, secondary, semantic, neutral colors |
| Typography | `@fosc/lendario-design-system/tokens` | Fonts, sizes, weights, presets |
| Spacing | `@fosc/lendario-design-system/tokens` | Spacing scale, containers, breakpoints |
| Shadows | `@fosc/lendario-design-system/tokens` | Box shadows, gradients, z-index |
| Borders | `@fosc/lendario-design-system/tokens` | Border radius, widths, presets |
| Transitions | `@fosc/lendario-design-system/tokens` | Durations, easing, animations |

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run TypeScript compiler
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 📁 Project Structure

```
packages/lendario-design-system/
├── src/
│   ├── tokens/          # Design tokens
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   ├── shadows.ts
│   │   ├── borders.ts
│   │   ├── transitions.ts
│   │   └── index.ts
│   ├── utils/           # Utilities
│   │   ├── css-variables.ts
│   │   └── index.ts
│   ├── components/      # Components (future)
│   │   └── index.ts
│   └── index.ts         # Main export
├── tests/               # Test files
├── docs/                # Documentation
├── design-analysis/     # Extraction reports
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎯 Design Principles

### Dark-First Design
- Primary background: Pure black (`#000000`)
- Card backgrounds: Near-black (`#0a0a0a`)
- High contrast text (`#F0F0E8`)

### Teal + Gold Aesthetic
- **Teal (`#0FB5AE`):** Innovation, technology, trust
- **Gold (`#F5D76E`):** Premium, achievement, warmth
- Combination creates modern AI education vibe

### Typography Hierarchy
- **Inter font:** Modern, readable, professional
- **Responsive sizing:** `clamp()` for fluid typography
- **Bold weights:** Strong hierarchy for dark backgrounds

### Spacing System
- **8px base unit:** Consistent rhythm
- **Generous spacing:** Breathable layouts
- **Component-specific:** Tailored padding for each use case

## 📊 Extraction Source

This design system was extracted from:
1. **Club Page** (`academialendaria.ai/club`) - Marketing, branding
2. **Cohort Page** (`cohort.lendario.ai`) - Primary source for tokens
3. **App Page** (`app.lendario.ai/dados`) - Application UI, light theme

See `design-analysis/EXTRACTION_REPORT.md` for detailed analysis.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines.

## 📄 License

MIT © Luiz Fosc

---

**Built with** the [Design System Extractor](../../.aios/skills/design-system-extractor/) skill
