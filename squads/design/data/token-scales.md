# Standard Design Token Scale References

**ID:** token-scales
**Version:** 1.0
**Purpose:** Reference data for standard scales used in design token systems including spacing, typography, color, sizing, and breakpoints
**Maintained By:** @jina-anne

---

## 4pt Spacing Scale

The 4pt grid is the most common spatial foundation for design systems. Every spacing value is a multiple of 4px, ensuring visual consistency and alignment.

| Token | Value (px) | Value (rem) | Common Usage |
|-------|-----------|-------------|--------------|
| `spacing.0` | 0 | 0 | No spacing |
| `spacing.0.5` | 2 | 0.125 | Hairline gap (rare) |
| `spacing.1` | 4 | 0.25 | Tightest spacing, icon-to-label gap |
| `spacing.2` | 8 | 0.5 | Tight spacing, related elements |
| `spacing.3` | 12 | 0.75 | Compact padding, small card insets |
| `spacing.4` | 16 | 1 | Default spacing, standard padding |
| `spacing.5` | 20 | 1.25 | Comfortable padding |
| `spacing.6` | 24 | 1.5 | Relaxed padding, card padding |
| `spacing.8` | 32 | 2 | Section gap, generous padding |
| `spacing.10` | 40 | 2.5 | Large section gap |
| `spacing.12` | 48 | 3 | Major section separation |
| `spacing.16` | 64 | 4 | Page-level spacing |
| `spacing.20` | 80 | 5 | Hero section padding |
| `spacing.24` | 96 | 6 | Maximum section spacing |

**Guidelines:**
- Use multiples of 4 for all spatial values
- 8px is the most common minimum practical spacing
- 16px is the universal default for component padding
- Above 48px, spacing jumps become larger (8px increments become 16px)

---

## Type Scale

Typography scales are based on modular scale ratios. The most common ratios for screen design:

### Common Scale Ratios

| Ratio Name | Value | Character | Best For |
|-----------|-------|-----------|----------|
| Minor Second | 1.067 | Very subtle | Dense data UIs |
| Major Second | 1.125 | Subtle | Compact UIs, dashboards |
| Minor Third | 1.200 | Noticeable | General purpose, balanced |
| Major Third | 1.250 | Clear | Content-heavy, editorial |
| Perfect Fourth | 1.333 | Strong | Marketing, expressive |
| Augmented Fourth | 1.414 | Bold | Headlines, impact |
| Perfect Fifth | 1.500 | Dramatic | Hero sections, display |

### Recommended Scale: Major Second (1.125)

Compact, suitable for application UIs with dense information:

| Token | Size (rem) | Size (px) | Line Height | Usage |
|-------|-----------|-----------|-------------|-------|
| `font.size.xs` | 0.75 | 12 | 1.5 (18px) | Captions, badges, footnotes |
| `font.size.sm` | 0.875 | 14 | 1.5 (21px) | Secondary text, metadata |
| `font.size.md` | 1.0 | 16 | 1.5 (24px) | Body text (base size) |
| `font.size.lg` | 1.125 | 18 | 1.4 (25px) | Lead paragraphs, emphasis |
| `font.size.xl` | 1.25 | 20 | 1.4 (28px) | Heading 4, card titles |
| `font.size.2xl` | 1.5 | 24 | 1.3 (31px) | Heading 3, section titles |
| `font.size.3xl` | 1.875 | 30 | 1.3 (39px) | Heading 2, page titles |
| `font.size.4xl` | 2.25 | 36 | 1.2 (43px) | Heading 1, hero titles |
| `font.size.5xl` | 3.0 | 48 | 1.1 (53px) | Display text |
| `font.size.6xl` | 3.75 | 60 | 1.1 (66px) | Display large |

### Fluid Typography with clamp()

For responsive type sizing without media queries:

```css
/* Base body text: 16px at 320px viewport, 18px at 1280px */
font-size: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);

/* H1: 30px at 320px viewport, 48px at 1280px */
font-size: clamp(1.875rem, 1.5rem + 1.875vw, 3rem);

/* H2: 24px at 320px viewport, 36px at 1280px */
font-size: clamp(1.5rem, 1.25rem + 1.25vw, 2.25rem);
```

---

## Color Lightness Scale

The standard 50-900 scale provides 10 shades per hue, from lightest to darkest. Based on perceptual lightness steps:

| Step | Lightness (approx.) | Usage |
|------|---------------------|-------|
| 50 | 95-97% | Lightest tint, subtle backgrounds |
| 100 | 90-92% | Light background, hover state |
| 200 | 80-85% | Light accent, active state on light |
| 300 | 65-75% | Medium light, disabled on dark |
| 400 | 50-60% | Medium, secondary elements |
| 500 | 40-50% | Base color, primary brand reference |
| 600 | 30-40% | Dark accent, primary interactive |
| 700 | 22-30% | Dark, hover state on dark |
| 800 | 15-22% | Very dark, pressed state |
| 900 | 8-15% | Darkest, text on light backgrounds |
| 950 | 3-8% | Near black (optional, not all scales include) |

**Example: Blue palette**

| Step | Hex | RGB | HSL (approx.) |
|------|-----|-----|---------------|
| 50 | #EFF6FF | 239, 246, 255 | 214, 100%, 97% |
| 100 | #DBEAFE | 219, 234, 254 | 214, 95%, 93% |
| 200 | #BFDBFE | 191, 219, 254 | 213, 97%, 87% |
| 300 | #93C5FD | 147, 197, 253 | 212, 96%, 78% |
| 400 | #60A5FA | 96, 165, 250 | 213, 94%, 68% |
| 500 | #3B82F6 | 59, 130, 246 | 217, 91%, 60% |
| 600 | #2563EB | 37, 99, 235 | 221, 83%, 53% |
| 700 | #1D4ED8 | 29, 78, 216 | 224, 76%, 48% |
| 800 | #1E40AF | 30, 64, 175 | 226, 71%, 40% |
| 900 | #1E3A8A | 30, 58, 138 | 224, 64%, 33% |

**Contrast considerations:**
- Steps 50-300 are typically too light for text (use as backgrounds)
- Steps 600-900 meet 4.5:1 contrast on white backgrounds
- Steps 400-500 often fail contrast on white — use cautiously for text

---

## Sizing Scale

Named sizing tokens for components, icons, and interactive elements:

| Token | Value (px) | Common Usage |
|-------|-----------|--------------|
| `size.2xs` | 16 | Tiny icons, inline indicators |
| `size.xs` | 20 | Small icons, compact UI elements |
| `size.sm` | 24 | Default icons, small avatars |
| `size.md` | 32 | Medium avatars, toolbar buttons |
| `size.lg` | 40 | Large form inputs height, nav items |
| `size.xl` | 48 | Large avatars, prominent buttons |
| `size.2xl` | 64 | Feature icons, profile images |
| `size.3xl` | 80 | Hero elements |
| `size.4xl` | 96 | Large feature graphics |

---

## Breakpoint Scale

Standard responsive breakpoints for design systems:

| Token | Value (px) | CSS Media Query | Target |
|-------|-----------|-----------------|--------|
| `breakpoint.xs` | 0 | Default (mobile-first) | Small phones |
| `breakpoint.sm` | 640 | @media (min-width: 640px) | Large phones, landscape |
| `breakpoint.md` | 768 | @media (min-width: 768px) | Tablets portrait |
| `breakpoint.lg` | 1024 | @media (min-width: 1024px) | Tablets landscape, small desktops |
| `breakpoint.xl` | 1280 | @media (min-width: 1280px) | Standard desktops |
| `breakpoint.2xl` | 1536 | @media (min-width: 1536px) | Large desktops, wide monitors |

**Column grid at each breakpoint:**

| Breakpoint | Columns | Gutter | Margin | Max Content Width |
|-----------|---------|--------|--------|-------------------|
| xs (0-639) | 4 | 16px | 16px | 100% |
| sm (640-767) | 6 | 16px | 24px | 100% |
| md (768-1023) | 8 | 24px | 32px | 100% |
| lg (1024-1279) | 12 | 24px | 32px | 960px or 100% |
| xl (1280-1535) | 12 | 24px | auto | 1200px |
| 2xl (1536+) | 12 | 32px | auto | 1400px |

---

## Z-Index Scale

Standardized z-index values to prevent z-index wars:

| Token | Value | Usage |
|-------|-------|-------|
| `z.base` | 0 | Default stacking |
| `z.raised` | 1 | Slightly elevated elements |
| `z.dropdown` | 10 | Dropdowns and select menus |
| `z.sticky` | 20 | Sticky headers and footers |
| `z.overlay` | 30 | Overlay backgrounds |
| `z.modal` | 40 | Modal dialogs |
| `z.popover` | 50 | Popovers and tooltips |
| `z.toast` | 60 | Toast notifications |
| `z.max` | 100 | Maximum layer (skip links, debug tools) |
