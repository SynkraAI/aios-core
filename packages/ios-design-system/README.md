# iOS 16 Design System

A comprehensive design system based on Apple's iOS 16 Human Interface Guidelines, providing native iOS components and design tokens for React applications.

## 🎨 Features

- **154+ Design Tokens** - Complete iOS 16 color system, SF Pro typography, 8pt grid spacing
- **21 Native Components** - Authentic iOS components (Phase 3)
- **TypeScript First** - Full type safety with excellent IntelliSense
- **Light & Dark Mode** - Built-in support for iOS color schemes
- **Tree-shakeable** - Import only what you need
- **Storybook Documentation** - Interactive component playground
- **WCAG AA Compliant** - Accessible by default

## 📦 Installation

```bash
npm install @synkra/ios-design-system
```

### Peer Dependencies

```bash
npm install react react-dom
```

## 🚀 Quick Start

### Using Design Tokens

```typescript
import { colors, textStyles, spacing, shadows } from '@synkra/ios-design-system/tokens'

// iOS System Colors
const blueButton = {
  backgroundColor: colors.system.blue.light,
  color: '#FFFFFF',
  padding: spacing.base,
  borderRadius: radius.base,
  boxShadow: shadows.sm.boxShadow,
}

// iOS Typography
const headline = {
  ...textStyles.headline,
  color: colors.label.label.light,
}
```

### Using Components (Phase 3)

```tsx
import { Button, List, TabBar } from '@synkra/ios-design-system'

function App() {
  return (
    <>
      <Button variant="filled" tintColor="blue">
        Continue
      </Button>
      <List style="insetGrouped">
        <ListItem title="Settings" icon="gear" disclosure />
      </List>
    </>
  )
}
```

## 🎨 Design Tokens

### Colors

- **System Colors**: Blue, green, red, orange, pink, purple, teal, yellow, indigo, mint, brown, cyan
- **Gray Scale**: 6 shades of gray for neutral UI
- **Label Colors**: Primary, secondary, tertiary, quaternary labels
- **Background Colors**: System backgrounds (plain, grouped, inset)
- **Fill Colors**: For overlays and separators

```typescript
import { systemColors, labelColors, backgroundColors } from '@synkra/ios-design-system/tokens'

const button = {
  backgroundColor: systemColors.blue.light, // #007AFF
  color: labelColors.label.light,
}
```

### Typography

SF Pro font family with 11 text styles following iOS Dynamic Type:

- Large Title (34pt)
- Title 1, 2, 3 (28pt, 22pt, 20pt)
- Headline (17pt semibold)
- Body (17pt regular)
- Callout, Subheadline, Footnote
- Caption 1, Caption 2

```typescript
import { textStyles, fontFamily } from '@synkra/ios-design-system/tokens'

const heading = {
  ...textStyles.largeTitle,
  fontFamily: fontFamily.display,
}
```

### Spacing

8pt grid system with safe area support:

```typescript
import { spacing, safeAreaInsets, componentSpacing } from '@synkra/ios-design-system/tokens'

const container = {
  padding: spacing.base, // 16px
  paddingTop: safeAreaInsets.top, // Respects notch
  minHeight: componentSpacing.minTouchTarget, // 44px
}
```

### Shadows & Blur

Subtle iOS-style elevation:

```typescript
import { shadows, backdropFilter } from '@synkra/ios-design-system/tokens'

const card = {
  boxShadow: shadows.md.boxShadow,
}

const navBar = {
  backdropFilter: backdropFilter.light,
}
```

### Border Radius

Continuous corner curves (iOS squircle approximation):

```typescript
import { radius, componentRadius } from '@synkra/ios-design-system/tokens'

const button = {
  borderRadius: componentRadius.button, // 10px
}
```

## 📱 Components (Phase 3)

### Navigation

- **TabBar** - Bottom navigation with icons and badges
- **NavigationBar** - Top bar with title and actions
- **Toolbar** - Bottom action bar
- **SegmentedControl** - iOS-style tabs

### Forms

- **Button** - Filled, Tinted, Gray, Plain, Borderless variants
- **TextField** - With floating label and icons
- **Toggle** - iOS-style switch
- **Slider** - Native iOS slider

### Lists

- **List** - Plain, Inset, Inset Grouped styles
- **ListItem** - With icons, disclosure, trailing content
- **SwipeActions** - Delete and archive patterns

### Data Display

- **Card** - iOS-style rounded cards
- **Badge** - Notification badges
- **SFSymbol** - Icon wrapper
- **ActivityIndicator** - Spinner

### Feedback

- **ActionSheet** - Bottom sheet with actions
- **Alert** - Modal alert dialog
- **ProgressView** - Linear and circular progress

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run Storybook
npm run storybook

# Build package
npm run build

# Run tests
npm test

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 📖 Documentation

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [SF Pro Font Family](https://developer.apple.com/fonts/)
- [iOS Color System](https://developer.apple.com/design/human-interface-guidelines/color)
- [iOS Typography](https://developer.apple.com/design/human-interface-guidelines/typography)

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! This design system follows Apple's Human Interface Guidelines strictly.

## ⚠️ Important Notes

### SF Pro Font

SF Pro is Apple's proprietary font. This package uses the system font stack (`-apple-system, BlinkMacSystemFont`) which provides SF Pro on Apple devices automatically. For development on non-Apple devices, download SF Pro from [Apple Developer](https://developer.apple.com/fonts/).

### Browser Support

- Chrome/Edge: 90+
- Safari: 14+
- Firefox: 90+

Requires support for:
- CSS Custom Properties
- CSS Grid
- Backdrop Filter (for translucent surfaces)

---

**Version:** 0.1.0
**Status:** Phase 2 Complete (Tokens implemented, Components in Phase 3)
**Based on:** iOS 16 Human Interface Guidelines
**Maintained by:** Synkra AI
