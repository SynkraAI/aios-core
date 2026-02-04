# Design System Extractor Skill

> Extract design systems from existing websites and generate production-ready TypeScript/React design system packages.

## Overview

This skill automates the complete process of analyzing websites, extracting design tokens, and generating a production-ready design system package following industry best practices.

## Features

- 🔍 **Website Analysis** - Analyze any website to extract design patterns
- 🎨 **Token Extraction** - Extract colors, typography, spacing, shadows, borders
- 🧩 **Component Identification** - Identify UI components and patterns
- 📦 **Package Generation** - Create complete TypeScript/React package
- ✅ **Testing Setup** - Vitest tests for all tokens
- 📚 **Documentation** - Comprehensive docs and Storybook setup
- 🏗️ **Build Tools** - Vite + TypeScript + ESLint configured

## Usage

### Basic Usage

```bash
# Activate the skill
/AIOS:skills:design-system-extractor
```

You'll be prompted for:
1. **URLs** - Website URLs to analyze (1-5 pages recommended)
2. **Package Name** - Name for the design system (e.g., "lendario")
3. **Scope** (optional) - NPM scope (default: @fosc)
4. **Description** (optional) - Package description

### Example: Single Website

```bash
/AIOS:skills:design-system-extractor

URLs: https://www.academialendaria.ai/club
Package Name: lendario
Scope: @fosc
Description: Lendário AI Design System
```

### Example: Multiple Pages

```bash
/AIOS:skills:design-system-extractor

URLs:
  - https://www.academialendaria.ai/club
  - https://cohort.lendario.ai/
  - https://app.lendario.ai/dados

Package Name: lendario
Scope: @fosc
Description: Lendário AI Design System - extracted from 3 pages
```

## What Gets Generated

```
packages/{name}-design-system/
├── src/
│   ├── tokens/              # Design tokens (TS)
│   │   ├── colors.ts        # Color palette
│   │   ├── typography.ts    # Font system
│   │   ├── spacing.ts       # Spacing scale
│   │   ├── shadows.ts       # Shadow system
│   │   ├── borders.ts       # Border tokens
│   │   ├── transitions.ts   # Animation tokens
│   │   └── index.ts         # Barrel export
│   ├── components/          # React components
│   │   └── index.ts
│   ├── utils/               # Utilities
│   │   ├── css-variables.ts # CSS var generator
│   │   └── index.ts
│   └── index.ts             # Main export
├── tests/                   # Vitest tests
│   ├── tokens/
│   │   ├── colors.test.ts
│   │   ├── typography.test.ts
│   │   └── ...
│   └── setup.ts
├── .storybook/              # Storybook config
│   ├── main.ts
│   └── preview.ts
├── docs/                    # Documentation
│   ├── GETTING_STARTED.md
│   ├── DESIGN_PRINCIPLES.md
│   └── ACCESSIBILITY.md
├── design-analysis/         # Analysis results
│   ├── EXTRACTION_REPORT.md # Detailed analysis
│   └── DESIGN_TOKENS.json   # Raw tokens
├── package.json             # Package config
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Build config
├── vitest.config.ts         # Test config
├── .eslintrc.json           # Linting rules
├── README.md                # Package README
└── CHANGELOG.md             # Version history
```

## Design Tokens Extracted

### Colors
- ✅ Primary palette (50-900 shades)
- ✅ Secondary/accent colors
- ✅ Semantic colors (success, warning, error, info)
- ✅ Neutral/gray scale
- ✅ Background colors
- ✅ Border colors
- ✅ Text colors
- ✅ Overlay colors

### Typography
- ✅ Font families (primary, secondary, mono)
- ✅ Font sizes (xs to 6xl+)
- ✅ Font weights (300-800)
- ✅ Line heights
- ✅ Letter spacing
- ✅ Typography presets (h1-h6, body, etc.)

### Spacing
- ✅ Base spacing unit
- ✅ Complete spacing scale
- ✅ Container widths
- ✅ Responsive breakpoints

### Visual Effects
- ✅ Box shadows (sm, md, lg, xl, 2xl)
- ✅ Border radius (sm, md, lg, xl, full)
- ✅ Border widths
- ✅ Transitions (duration, easing)

### Components Identified
- ✅ Buttons (variants, sizes, states)
- ✅ Forms (inputs, selects, checkboxes, etc.)
- ✅ Cards
- ✅ Navigation
- ✅ Data Display (tables, badges, avatars)
- ✅ Feedback (alerts, modals, toasts)

## Workflow

```
1. Analyze URLs with WebFetch
   ↓
2. Extract design tokens
   ↓
3. Generate package structure
   ↓
4. Create TypeScript token files
   ↓
5. Setup build tooling
   ↓
6. Generate documentation
   ↓
7. Initialize tests
   ↓
8. Run initial build
   ↓
9. Provide summary report
```

## After Generation

### Install Dependencies
```bash
cd packages/{name}-design-system
npm install
```

### Run Development
```bash
npm run dev           # Development mode
npm run storybook     # Storybook dev server
```

### Run Tests
```bash
npm test              # Run tests
npm run test:coverage # With coverage
```

### Build
```bash
npm run build         # Build for production
npm run typecheck     # Type checking
npm run lint          # Lint code
```

### Use in Your Project
```typescript
import { colors, typography, spacing } from '@fosc/{name}-design-system/tokens'

// Use tokens
const styles = {
  backgroundColor: colors.primary[500],
  fontFamily: typography.fontFamily.sans,
  padding: spacing[4],
}
```

## Configuration

The skill uses:
- **TypeScript** - Strict mode enabled
- **Vite** - Fast build tool
- **Vitest** - Testing framework
- **ESLint** - Code quality
- **Storybook** - Component documentation
- **React 18** - Component library

## Best Practices

### During Extraction
- ✅ Analyze 2-5 pages for complete coverage
- ✅ Include different page types (landing, app, dashboard)
- ✅ Review extraction report for accuracy
- ✅ Normalize inconsistencies

### After Generation
- ✅ Review extracted colors for accuracy
- ✅ Verify font identification
- ✅ Test accessibility (color contrast)
- ✅ Add custom components as needed
- ✅ Document design decisions

## Troubleshooting

### WebFetch Fails
- Check URL is publicly accessible
- Try different pages from same site
- Provide screenshots as fallback

### Colors Look Wrong
- Review EXTRACTION_REPORT.md
- Manually adjust in src/tokens/colors.ts
- Use browser DevTools to verify

### Fonts Not Identified
- Check docs/DESIGN_PRINCIPLES.md for suggestions
- Use WhatFont browser extension
- Update src/tokens/typography.ts manually

## Reference Implementation

This skill is based on the **EcoFlow Design System** creation process:
- `packages/ecoflow-design-system/` - Reference structure
- `packages/ecoflow-design-system/EXTRACT-FROM-SITE.md` - Original workflow
- `packages/ecoflow-design-system/CIRCLE-SO-DESIGN-TOKENS.md` - Example analysis

## Advanced Usage

### Custom Token Extraction
```bash
# After generation, customize tokens
cd packages/{name}-design-system
# Edit src/tokens/*.ts files
npm run build
npm test
```

### Add Components
```bash
# Create new component
mkdir src/components/Button
# Implement component
# Add stories
# Add tests
```

### Publish Package
```bash
npm run build
npm test
npm publish --access public
```

## Limitations

- ⚠️ Requires publicly accessible URLs
- ⚠️ May not capture all interactive states
- ⚠️ Font identification may require verification
- ⚠️ Components are identified but not generated (tokens only in v1.0)

## Roadmap

- [ ] Component code generation
- [ ] Figma plugin integration
- [ ] Screenshot-based analysis
- [ ] AI-powered component matching
- [ ] Automatic Storybook stories
- [ ] Theme variants generation

## Support

If extraction is incomplete or incorrect:
1. Check EXTRACTION_REPORT.md for details
2. Manually adjust tokens in src/tokens/
3. Re-run build and tests
4. Document changes in CHANGELOG.md

---

**Version:** 1.0.0
**Author:** AIOS Core
**License:** MIT
