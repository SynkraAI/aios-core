# Design Token Naming Examples

**ID:** naming-examples
**Version:** 1.0
**Purpose:** Reference examples for design token naming using Category-Type-Item (CTI) taxonomy across all token categories
**Maintained By:** @jina-anne

---

## Naming Convention: Category-Type-Item (CTI)

The CTI naming convention provides a predictable, hierarchical structure:

```
{category}.{type}.{item}.{sub-item}.{modifier}
```

- **Category:** The broad group (color, spacing, font, size, shadow, border, etc.)
- **Type:** The semantic group within the category (brand, neutral, feedback, surface)
- **Item:** The specific variant (primary, secondary, 100, sm)
- **Sub-item:** Optional further specificity (default, hover, active)
- **Modifier:** Optional state or context (light, dark, inverse)

---

## Color Tokens

### Global (Raw Values)

| Token Name | Value | Description |
|-----------|-------|-------------|
| `color.blue.50` | #EFF6FF | Lightest blue |
| `color.blue.100` | #DBEAFE | Very light blue |
| `color.blue.200` | #BFDBFE | Light blue |
| `color.blue.300` | #93C5FD | Soft blue |
| `color.blue.400` | #60A5FA | Medium light blue |
| `color.blue.500` | #3B82F6 | Base blue |
| `color.blue.600` | #2563EB | Medium dark blue |
| `color.blue.700` | #1D4ED8 | Dark blue |
| `color.blue.800` | #1E40AF | Very dark blue |
| `color.blue.900` | #1E3A8A | Darkest blue |
| `color.neutral.0` | #FFFFFF | White |
| `color.neutral.50` | #F9FAFB | Near white |
| `color.neutral.900` | #111827 | Near black |
| `color.red.500` | #EF4444 | Base red |
| `color.green.500` | #22C55E | Base green |
| `color.yellow.500` | #EAB308 | Base yellow |

### Alias (Semantic)

| Token Name | References | Description |
|-----------|-----------|-------------|
| `color.brand.primary` | {color.blue.600} | Primary brand color |
| `color.brand.secondary` | {color.blue.400} | Secondary brand color |
| `color.feedback.success` | {color.green.500} | Success indicator |
| `color.feedback.error` | {color.red.500} | Error indicator |
| `color.feedback.warning` | {color.yellow.500} | Warning indicator |
| `color.surface.default` | {color.neutral.0} | Default background |
| `color.surface.muted` | {color.neutral.50} | Subtle background |
| `color.text.default` | {color.neutral.900} | Primary text |
| `color.text.muted` | {color.neutral.500} | Secondary text |
| `color.text.inverse` | {color.neutral.0} | Text on dark backgrounds |

### Component

| Token Name | References | Description |
|-----------|-----------|-------------|
| `color.button.primary.background` | {color.brand.primary} | Primary button fill |
| `color.button.primary.text` | {color.text.inverse} | Primary button text |
| `color.button.primary.background.hover` | {color.blue.700} | Primary button hover fill |
| `color.input.border.default` | {color.neutral.300} | Input border at rest |
| `color.input.border.focus` | {color.brand.primary} | Input border on focus |
| `color.input.border.error` | {color.feedback.error} | Input border in error state |

---

## Spacing Tokens

| Token Name | Value | Usage |
|-----------|-------|-------|
| `spacing.0` | 0px | No spacing |
| `spacing.1` | 4px | Tightest spacing |
| `spacing.2` | 8px | Very tight spacing |
| `spacing.3` | 12px | Tight spacing |
| `spacing.4` | 16px | Default spacing |
| `spacing.5` | 20px | Comfortable spacing |
| `spacing.6` | 24px | Relaxed spacing |
| `spacing.8` | 32px | Loose spacing |
| `spacing.10` | 40px | Section spacing |
| `spacing.12` | 48px | Large section spacing |
| `spacing.16` | 64px | Extra large spacing |
| `spacing.inset.xs` | 4px 4px 4px 4px | Extra small inset padding |
| `spacing.inset.sm` | 8px 8px 8px 8px | Small inset padding |
| `spacing.inset.md` | 16px 16px 16px 16px | Medium inset padding |
| `spacing.inset.lg` | 24px 24px 24px 24px | Large inset padding |
| `spacing.inline.sm` | 0 8px 0 0 | Small inline spacing (right only) |
| `spacing.inline.md` | 0 16px 0 0 | Medium inline spacing |
| `spacing.stack.sm` | 0 0 8px 0 | Small stack spacing (bottom only) |
| `spacing.stack.md` | 0 0 16px 0 | Medium stack spacing |

---

## Typography Tokens

| Token Name | Value | Usage |
|-----------|-------|-------|
| `font.family.heading` | 'Inter', sans-serif | Headings and titles |
| `font.family.body` | 'Inter', sans-serif | Body text and UI |
| `font.family.mono` | 'JetBrains Mono', monospace | Code and technical |
| `font.size.xs` | 0.75rem (12px) | Captions, labels |
| `font.size.sm` | 0.875rem (14px) | Secondary text |
| `font.size.md` | 1rem (16px) | Body text |
| `font.size.lg` | 1.125rem (18px) | Lead text |
| `font.size.xl` | 1.25rem (20px) | Small headings |
| `font.size.2xl` | 1.5rem (24px) | Section headings |
| `font.size.3xl` | 1.875rem (30px) | Page headings |
| `font.size.4xl` | 2.25rem (36px) | Display headings |
| `font.weight.regular` | 400 | Body text |
| `font.weight.medium` | 500 | Emphasis |
| `font.weight.semibold` | 600 | Subheadings |
| `font.weight.bold` | 700 | Headings |
| `font.lineHeight.tight` | 1.25 | Headings |
| `font.lineHeight.normal` | 1.5 | Body text |
| `font.lineHeight.relaxed` | 1.75 | Long-form reading |

---

## Sizing Tokens

| Token Name | Value | Usage |
|-----------|-------|-------|
| `size.icon.xs` | 12px | Inline tiny icons |
| `size.icon.sm` | 16px | Small UI icons |
| `size.icon.md` | 20px | Default icons |
| `size.icon.lg` | 24px | Prominent icons |
| `size.icon.xl` | 32px | Feature icons |
| `size.avatar.sm` | 24px | Compact avatar |
| `size.avatar.md` | 32px | Default avatar |
| `size.avatar.lg` | 48px | Profile avatar |
| `size.avatar.xl` | 64px | Featured avatar |

---

## Shadow Tokens

| Token Name | Value | Usage |
|-----------|-------|-------|
| `shadow.elevation.0` | none | Flat, no elevation |
| `shadow.elevation.1` | 0 1px 2px rgba(0,0,0,0.05) | Subtle lift (cards) |
| `shadow.elevation.2` | 0 4px 6px rgba(0,0,0,0.1) | Medium elevation (dropdowns) |
| `shadow.elevation.3` | 0 10px 15px rgba(0,0,0,0.1) | High elevation (modals) |
| `shadow.elevation.4` | 0 20px 25px rgba(0,0,0,0.15) | Highest elevation (popovers) |

---

## Border Tokens

| Token Name | Value | Usage |
|-----------|-------|-------|
| `border.width.none` | 0px | No border |
| `border.width.thin` | 1px | Default borders |
| `border.width.medium` | 2px | Emphasis borders, focus rings |
| `border.width.thick` | 4px | Heavy emphasis |
| `border.radius.none` | 0px | Sharp corners |
| `border.radius.sm` | 4px | Subtle rounding |
| `border.radius.md` | 8px | Default rounding |
| `border.radius.lg` | 12px | Pronounced rounding |
| `border.radius.xl` | 16px | Heavy rounding |
| `border.radius.full` | 9999px | Pill shape / circle |
