# Design Tokens

Complete reference for iOS Design System design tokens.

## Table of Contents

- [Colors](#colors)
- [Typography](#typography)
- [Spacing](#spacing)
- [Shadows](#shadows)
- [Border Radius](#border-radius)
- [Usage Examples](#usage-examples)

---

## Colors

iOS system colors with automatic dark mode support.

### System Colors

All colors include light and dark mode variants:

| Color | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| **systemRed** | `#FF3B30` | `#FF453A` | Destructive actions, errors |
| **systemGray** | `#8E8E93` | `#98989D` | Secondary text, disabled states |
| **systemBlue** | `#007AFF` | `#0A84FF` | Primary actions, links |
| **systemGreen** | `#34C759` | `#30D158` | Success, positive actions |
| **systemOrange** | `#FF9500` | `#FF9F0A` | Warnings, secondary actions |
| **systemPurple** | `#AF52DE` | `#BF5AF2` | Accent, special states |
| **systemYellow** | `#FFCC00` | `#FFD60A` | Warnings, highlights |

### Label Colors

| Color | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| **label** | `#000000` | `#FFFFFF` | Primary text |
| **secondaryLabel** | `rgba(60,60,67,0.6)` | `rgba(235,235,245,0.6)` | Secondary text |
| **tertiaryLabel** | `rgba(60,60,67,0.3)` | `rgba(235,235,245,0.3)` | Tertiary text |
| **quaternaryLabel** | `rgba(60,60,67,0.18)` | `rgba(235,235,245,0.18)` | Quaternary text |

### Background Colors

| Color | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| **systemBackground** | `#FFFFFF` | `#000000` | Primary backgrounds |
| **secondarySystemBackground** | `#F2F2F7` | `#1C1C1E` | Grouped content |
| **tertiarySystemBackground** | `#FFFFFF` | `#2C2C2E` | Cards, elevated content |

### Grouped Background Colors

| Color | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| **systemGroupedBackground** | `#F2F2F7` | `#000000` | Grouped table views |
| **secondarySystemGroupedBackground** | `#FFFFFF` | `#1C1C1E` | Grouped cells |
| **tertiarySystemGroupedBackground** | `#F2F2F7` | `#2C2C2E` | Grouped cell details |

### Fill Colors

| Color | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| **systemFill** | `rgba(120,120,128,0.2)` | `rgba(120,120,128,0.36)` | Overlay fills |
| **secondarySystemFill** | `rgba(120,120,128,0.16)` | `rgba(120,120,128,0.32)` | Secondary fills |
| **tertiarySystemFill** | `rgba(118,118,128,0.12)` | `rgba(118,118,128,0.24)` | Tertiary fills |
| **quaternarySystemFill** | `rgba(116,116,128,0.08)` | `rgba(118,118,128,0.18)` | Quaternary fills |

### Separator Colors

| Color | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| **separator** | `rgba(60,60,67,0.29)` | `rgba(84,84,88,0.6)` | Thin separators |
| **opaqueSeparator** | `#C6C6C8` | `#38383A` | Opaque separators |

### TypeScript Import

```typescript
import { colors } from '@synkra/ios-design-system'

// Access colors
const blue = colors.systemBlue        // #007AFF (light mode)
const blueDark = colors.systemBlueDark // #0A84FF (dark mode)
```

### CSS Usage

Colors are automatically applied based on system preference:

```css
.my-component {
  color: #007AFF; /* systemBlue light */
}

@media (prefers-color-scheme: dark) {
  .my-component {
    color: #0A84FF; /* systemBlue dark */
  }
}
```

---

## Typography

iOS uses SF Pro Display for large text and SF Pro Text for body text.

### Font Families

```typescript
export const fontFamilies = {
  display: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
  text: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
}
```

### Type Scale

#### Display Fonts (SF Pro Display)

| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| **largeTitle** | 34px | 700 (Bold) | 41px | Page titles, hero text |
| **title1** | 28px | 700 (Bold) | 34px | Section headers |
| **title2** | 22px | 700 (Bold) | 28px | Subsection headers |
| **title3** | 20px | 600 (Semibold) | 25px | Group headers |

#### Text Fonts (SF Pro Text)

| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| **body** | 17px | 400 (Regular) | 22px | Body text, paragraphs |
| **callout** | 16px | 400 (Regular) | 21px | Emphasized content |
| **subheadline** | 15px | 400 (Regular) | 20px | Secondary text |
| **footnote** | 13px | 400 (Regular) | 18px | Captions, notes |
| **caption1** | 12px | 400 (Regular) | 16px | Small text |
| **caption2** | 11px | 400 (Regular) | 13px | Very small text |

### Font Weights

| Weight | Value | Name |
|--------|-------|------|
| 100 | Ultralight | ultralight |
| 200 | Thin | thin |
| 300 | Light | light |
| 400 | Regular | regular |
| 500 | Medium | medium |
| 600 | Semibold | semibold |
| 700 | Bold | bold |
| 800 | Heavy | heavy |
| 900 | Black | black |

### TypeScript Import

```typescript
import { typography } from '@synkra/ios-design-system'

// Access typography
const bodyStyle = typography.body
// { fontSize: '17px', fontWeight: 400, lineHeight: '22px', fontFamily: '...' }
```

### CSS Usage

```css
.my-heading {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif;
  font-size: 34px;
  font-weight: 700;
  line-height: 41px;
}

.my-body {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
  font-size: 17px;
  font-weight: 400;
  line-height: 22px;
}
```

---

## Spacing

iOS uses an 8pt grid system for consistent spacing.

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| **xs** | 4px | Tight spacing, padding |
| **sm** | 8px | Small spacing, compact layouts |
| **md** | 12px | Default spacing between elements |
| **lg** | 16px | Comfortable spacing, list items |
| **xl** | 20px | Large spacing, sections |
| **2xl** | 24px | Extra large spacing |
| **3xl** | 32px | Section dividers |
| **4xl** | 40px | Page margins |
| **5xl** | 48px | Hero spacing |

### TypeScript Import

```typescript
import { spacing } from '@synkra/ios-design-system'

// Access spacing
const small = spacing.sm  // '8px'
const large = spacing.lg  // '16px'
```

### CSS Usage

```css
.my-component {
  padding: 16px;        /* spacing.lg */
  margin-bottom: 24px;  /* spacing.2xl */
  gap: 12px;            /* spacing.md */
}
```

### Safe Area Insets

iOS devices require safe area insets for notch and home indicator:

```css
.ios-navigation-bar {
  padding-top: env(safe-area-inset-top);
}

.ios-tab-bar {
  padding-bottom: env(safe-area-inset-bottom);
}
```

---

## Shadows

iOS shadows provide depth and elevation.

### Shadow Scale

| Token | Blur | Offset | Color | Usage |
|-------|------|--------|-------|-------|
| **small** | 4px | (0, 1px) | `rgba(0,0,0,0.1)` | Subtle elevation |
| **medium** | 8px | (0, 2px) | `rgba(0,0,0,0.12)` | Cards, elevated UI |
| **large** | 16px | (0, 4px) | `rgba(0,0,0,0.16)` | Modals, popovers |

### TypeScript Import

```typescript
import { shadows } from '@synkra/ios-design-system'

// Access shadows
const cardShadow = shadows.medium
// '0 2px 8px rgba(0, 0, 0, 0.12), 0 0 0 0.5px rgba(0, 0, 0, 0.04)'
```

### CSS Usage

```css
.ios-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12),
              0 0 0 0.5px rgba(0, 0, 0, 0.04);
}

.ios-modal {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.16),
              0 0 0 0.5px rgba(0, 0, 0, 0.04);
}
```

### Dark Mode Shadows

Shadows are typically lighter in dark mode:

```css
@media (prefers-color-scheme: dark) {
  .ios-card {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3),
                0 0 0 0.5px rgba(255, 255, 255, 0.1);
  }
}
```

---

## Border Radius

iOS uses rounded corners for visual comfort.

### Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| **xs** | 4px | Small elements, badges |
| **sm** | 6px | Buttons, inputs |
| **md** | 8px | Cards, small containers |
| **lg** | 10px | Medium containers |
| **xl** | 12px | Large containers |
| **2xl** | 14px | Modals, sheets |
| **full** | 9999px | Circular elements |

### TypeScript Import

```typescript
import { radius } from '@synkra/ios-design-system'

// Access radius
const buttonRadius = radius.sm  // '6px'
const cardRadius = radius.lg    // '10px'
```

### CSS Usage

```css
.ios-button {
  border-radius: 10px; /* radius.lg */
}

.ios-badge {
  border-radius: 9999px; /* radius.full (circular) */
}

.ios-card {
  border-radius: 12px; /* radius.xl */
}
```

---

## Usage Examples

### Complete Component Example

```typescript
import {
  colors,
  typography,
  spacing,
  shadows,
  radius
} from '@synkra/ios-design-system'

const MyComponent = () => {
  return (
    <div style={{
      // Colors
      backgroundColor: colors.systemBackground,
      color: colors.label,

      // Typography
      ...typography.body,

      // Spacing
      padding: spacing.lg,
      marginBottom: spacing.xl,
      gap: spacing.md,

      // Shadows
      boxShadow: shadows.medium,

      // Border Radius
      borderRadius: radius.lg,
    }}>
      Hello, iOS Design System!
    </div>
  )
}
```

### CSS Variables

You can also define CSS custom properties:

```css
:root {
  /* Colors */
  --color-blue: #007AFF;
  --color-red: #FF3B30;

  /* Typography */
  --font-body: 17px;
  --font-title: 28px;

  /* Spacing */
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;

  /* Shadows */
  --shadow-card: 0 2px 8px rgba(0,0,0,0.12);

  /* Radius */
  --radius-button: 10px;
  --radius-card: 12px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-blue: #0A84FF;
    --color-red: #FF453A;
  }
}
```

### Tailwind CSS Integration

If using Tailwind CSS, extend the theme:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'ios-blue': '#007AFF',
        'ios-red': '#FF3B30',
        'ios-green': '#34C759',
      },
      fontFamily: {
        'ios': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Helvetica Neue', 'sans-serif'],
      },
      spacing: {
        'ios-xs': '4px',
        'ios-sm': '8px',
        'ios-md': '12px',
        'ios-lg': '16px',
      },
      borderRadius: {
        'ios-sm': '6px',
        'ios-md': '10px',
        'ios-lg': '12px',
      },
      boxShadow: {
        'ios-card': '0 2px 8px rgba(0,0,0,0.12)',
      },
    },
  },
}
```

---

## Best Practices

### 1. Use Design Tokens Consistently

✅ **Do:** Use design tokens
```typescript
const style = { color: colors.systemBlue }
```

❌ **Don't:** Use hardcoded values
```typescript
const style = { color: '#007AFF' }
```

### 2. Respect the 8pt Grid

✅ **Do:** Use spacing tokens
```css
padding: 16px; /* spacing.lg */
margin: 24px;  /* spacing.2xl */
```

❌ **Don't:** Use arbitrary values
```css
padding: 17px;
margin: 23px;
```

### 3. Use Semantic Colors

✅ **Do:** Use semantic names
```typescript
<Button color={colors.systemBlue} /> {/* Primary action */}
<Button color={colors.systemRed} />  {/* Destructive */}
```

❌ **Don't:** Use arbitrary colors
```typescript
<Button color="#FF0000" />
```

### 4. Support Dark Mode

✅ **Do:** Use system colors
```css
color: #007AFF; /* systemBlue */

@media (prefers-color-scheme: dark) {
  color: #0A84FF; /* systemBlue dark */
}
```

❌ **Don't:** Use only light mode
```css
color: #007AFF; /* No dark mode variant */
```

---

## Resources

- [iOS HIG - Color](https://developer.apple.com/design/human-interface-guidelines/color)
- [iOS HIG - Typography](https://developer.apple.com/design/human-interface-guidelines/typography)
- [SF Symbols](https://developer.apple.com/sf-symbols/)
- [Apple Design Resources](https://developer.apple.com/design/resources/)
