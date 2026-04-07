# Stripe Design Tokens — Premium Finance/Consulting Brand

**Extracted from:** https://stripe.com  
**Date:** 2026-04-02  
**Token System:** HDS (Stripe's Harmony Design System)

---

## 1. TYPOGRAPHY

### Font Families
| Usage | Family | Fallback Stack |
|-------|--------|----------------|
| **Primary** | `sohne-var` | "SF Pro Display", sans-serif |
| **Code** | `SourceCodePro` | "SFMono-Regular", monospace |

### Font Sizes & Weights

#### Headings
| Level | Size | Weight | Line Height | Letter Spacing |
|-------|------|--------|-------------|----------------|
| **h1 (Hero Large)** | 3rem (48px) | 300 | 1.15 | -0.02em |
| **h1 (Hero Medium)** | 2.75rem (44px) | 300 | 1.15 | -0.02em |
| **h1 (Hero Small)** | 2.25rem (36px) | 300 | 1.05 | -0.02em |
| **h1 (XXL)** | 3.5rem (56px) | 300 | 1.03 | -0.025em |
| **h2 (XL)** | 3rem (48px) | 300 | 1.03 | -0.02em |
| **h2 (LG)** | 2rem (32px) | 300 | 1.1 | -0.02em |
| **h2 (MD)** | 1.625rem (26px) | 300 | 1.12 | -0.01em |
| **h3 (SM)** | 1.375rem (22px) | 300 | 1.1 | -0.01em |
| **h4 (XS)** | 1rem (16px) | 400 | 1.2 | 0em |
| **h5 (XXS)** | 0.875rem (14px) | 400 | 1.2 | 0em |

#### Body Text
| Type | Size | Weight | Line Height | Letter Spacing |
|------|------|--------|-------------|----------------|
| **Text XXL** | 3rem | 300 | 1 | -0.02em |
| **Text XL** | 1.25rem | 300 | 1.4 | -0.01em |
| **Text LG** | 1.125rem | 300 | 1.4 | 0em |
| **Text MD** | 1rem | 300 | 1.4 | 0em |
| **Text SM** | 0.875rem | 300 | 1.4 | 0em |
| **Text XS** | 0.875rem | 300 | 1.4 | 0em |
| **Text XXS** | 0.75rem | 300 | 1.45 | 0em |

#### Quote Attribution
| Size | Weight | Line Height | Letter Spacing |
|------|--------|-------------|----------------|
| 1.125rem | 300 | 1.4 | 0em |

#### Input Text
| Size | Weight | Line Height | Letter Spacing |
|------|--------|-------------|----------------|
| 1rem (LG) | 300 | 1.4 | 0px |
| 0.875rem (MD) | 300 | 1.3 | 0px |
| 0.75rem (SM) | 300 | 1.35 | 0px |

### Font Weight Mapping
- **Light (300):** Body text, headings, paragraphs
- **Normal (400):** Small labels, group headings, emphasis text

---

## 2. COLORS

### Primary Color System

#### Core Brand Colors
| Token | Value | Usage |
|-------|-------|-------|
| **Brand 600** (Primary) | `#533afd` | Buttons, accents, primary actions |
| **Brand 700** | `#4032c8` | Hover state for brand 600 |
| **Brand 800** | `#2e2b8c` | Darker hover/active state |
| **Brand 900** | `#1c1e54` | Deep accent |
| **Brand 950** | `#161741` | Darkest brand |
| **Brand 975** | `#0f1137` | Near black |

#### Neutral Colors (Core)
| Tone | Value | Usage |
|------|-------|-------|
| **0 (White)** | `#fff` | Backgrounds |
| **25** | `#f8fafd` | Subtle backgrounds |
| **50** | `#e5edf5` | Light backgrounds |
| **100** | `#d4dee9` | Disabled states |
| **200** | `#bac8da` | Borders |
| **300** | `#95a4ba` | Muted text |
| **400** | `#7d8ba4` | Secondary text |
| **500** | `#64748d` | Softer text |
| **600** | `#50617a` | Text |
| **700** | `#3c4f69` | Strong text |
| **800** | `#273951` | Dark text |
| **900** | `#1a2c44` | Very dark text |
| **950** | `#11273e` | Nearly black |
| **975** | `#0d253d` | Darkest |
| **990** | `#061b31` | Pure dark (text solid) |

#### Neutral Dark Colors
| Shade | Value |
|-------|-------|
| 25 | `#e4eaff` |
| 50 | `#e3ecf7` |
| 100 | `#d4deef` |
| 200 | `#c0cee6` |
| 300 | `#a3b5d6` |
| 400 | `#839bc8` |
| 500 | `#6480b2` |
| 600 | `#45639d` |
| 700 | `#273f73` |
| 800 | `#23356e` |
| 900 | `#182659` |
| 950 | `#122054` |
| 975 | `#101d4e` |
| 990 | `#0d1738` |

### Action Colors

#### Buttons
| State | Color | Usage |
|-------|-------|-------|
| **Primary BG** | `#533afd` | Main call-to-action buttons |
| **Primary BG Hover** | `#4032c8` | Hover state |
| **Primary BG Disabled** | `#e5edf5` | Disabled state |
| **Primary Text** | `#fff` | Text on primary |
| **Primary Icon** | `#fff` | Icons on primary |
| **Secondary BG** | `#ffffff00` | Transparent secondary |
| **Secondary Border** | `#d6d9fc` | Secondary button border |
| **Secondary Text** | `#533afd` | Secondary button text |

#### Status Icons
| Type | Color |
|------|-------|
| **Success** | `#00b261` |
| **Error** | `#d8351e` |
| **Surface** | `#bac8da` |

### Accent Color Modes
Stripe uses 5 accent modes with gradient support:

#### Default (Brand Purple)
- Icon Solid: `#533afd`
- Icon Solid Alt: `#533afd`
- Gradient Start: `#864cff`
- Gradient Middle: `#5e4cfe`
- Gradient End: `#564dfe`
- Surface Solid: `#533afd`
- Surface Subdued: `#e2e4ff`

#### Magenta
- Icon Solid: `#f44bcc`
- Gradient (Start→Mid→End): `#f98bf9` → `#f96bee` → `#b262f9`
- Surface Subdued: `#ffe6f5`
- Border Quiet: `#ffd7ef`

#### Lemon
- Icon Solid: `#e8a30b`
- Gradient (Start→Mid→End): `#ffd552` → `#ffaf2d` → `#ff9014`
- Surface Subdued: `#fff2d8`
- Border Quiet: `#ffe1a3`

#### Ruby
- Icon Solid: `#ea2261`
- Gradient (Start→Mid→End): `#f84c31` → `#ea2261` → `#f03ca4`
- Surface Subdued: `#fed9de`
- Border Quiet: `#fed9de`

#### Orange
- Icon Solid: `#ff6118`
- Gradient (Start→Mid→End): `#fe8c2d` → `#fd6252` → `#fd5d7c`
- Surface Subdued: `#ffe5da`
- Border Quiet: `#ffd8c6`

### Text Colors
| Type | Color | Usage |
|------|-------|-------|
| **Text Solid** | `#061b31` | Primary text |
| **Text Soft** | `#50617a` | Secondary text |
| **Text Subdued** | `#64748d` | Tertiary text |
| **Text Quiet** | `#7d8ba4` | Muted text |
| **Text Inactive** | `#95a4ba` | Disabled text |

### Utility Colors
| Type | Value | Usage |
|------|-------|-------|
| **Black** | `#061b31` | Pure dark |
| **White** | `#fff` | Pure light |
| **Utility BG Max** | `#fff` | Maximum background |
| **Utility BG Quiet** | `#f8fafd` | Subtle background |
| **Utility BG Subdued** | `#e5edf5` | Medium background |
| **Utility BG Soft** | `#d4dee9` | Softer background |

---

## 3. SPACING

### Core Spacing Scale
All values use an 8px base unit:

| Token | Value | Usage |
|-------|-------|-------|
| Core 0 | 0px | Reset |
| Core 1 | 1px | Hair line |
| Core 25 | 2px | Micro |
| Core 50 | 4px | Tiny |
| Core 75 | 6px | Extra small |
| Core 100 | 8px | XS spacing |
| Core 150 | 12px | Small |
| Core 200 | 16px | Default |
| Core 250 | 20px | Medium |
| Core 300 | 24px | Large |
| Core 350 | 28px | XL |
| Core 400 | 32px | XXL |
| Core 450 | 36px | XXXL |
| Core 500 | 40px | — |
| Core 550 | 44px | — |
| Core 600 | 48px | Section gap |
| Core 700 | 56px | — |
| Core 800 | 64px | — |
| Core 900 | 72px | — |
| Core 1000 | 80px | Large section |
| Core 1100 | 88px | — |
| Core 1200 | 96px | Section gap |
| Core 1300 | 104px | — |
| Core 1400 | 112px | — |
| Core 1500 | 120px | — |
| Core 1600 | 128px | — |
| Core 1700 | 136px | — |
| Core 1800 | 144px | — |
| Core 1900 | 152px | — |
| Core 2000 | 160px | — |
| Core 2100 | 168px | — |
| Core 2200 | 176px | — |
| Core 2300 | 184px | — |
| Core 2400 | 192px | — |
| Core 2500 | 200px | — |

### Button Padding
| State | Padding X | Padding Y |
|-------|-----------|-----------|
| **SM** | 10px | 8px |
| **MD** | 13px | 10px |
| **LG** | 16px | 12px |

### Input Padding
| Size | Padding X | Padding Y |
|------|-----------|-----------|
| **SM** | 10px | 8px |
| **MD** | 13px | 10px |
| **LG** | 16px | 12px |
| **Listbox** | 10px | 6px |

### Block Layout
| Property | Value |
|----------|-------|
| Column Gap | 16px |
| Stack Gap (MD) | 16px |
| Stack Gap (LG) | 48px |
| Stack Gap (XL) | 64px |

### Section Gaps
| Position | Value |
|----------|-------|
| Top | 96px |
| Bottom | 96px |
| Between sections | 96px |

---

## 4. BORDER RADIUS

### Radius Scale
| Token | Value | Usage |
|-------|-------|-------|
| **Core Radius None** | 0px | Sharp corners |
| **Core Radius XS** | 2px | Minimal rounding |
| **Core Radius SM** | 4px | Small elements (buttons) |
| **Core Radius MD** | 6px | Medium rounding |
| **Core Radius LG** | 16px | Large elements |
| **Core Radius XL** | 32px | Extra large |
| **Core Radius Round** | 99999px | Fully rounded (pills) |

### Button Radius
| Type | Radius |
|------|--------|
| **Small** | 2px |
| **Large** | 4px |

### Input Radius
| Radius | Value |
|--------|-------|
| Default | 4px |
| Focus | Varies |

### Navigation
| Property | Value |
|----------|-------|
| Border Radius | 6px |

---

## 5. SHADOWS

### Shadow Presets

#### Extra Small (xs)
```css
--hds-shadow-xs: 0px 2px 10px 0px #0037700f,
                 0px 1px 4px 0px #003b890a;
```
- Top Offset Y: 2px
- Top Blur: 10px
- Bottom Offset Y: 1px
- Bottom Blur: 4px
- Color (Top): `#0037700f`
- Color (Bottom): `#003b890a`

#### Small (sm)
```css
--hds-shadow-sm: 0px 5px 14px 0px #00377014,
                 0px 2px 8px 0px #003b890d;
```
- Top Offset Y: 5px
- Top Blur: 14px
- Bottom Offset Y: 2px
- Bottom Blur: 8px

#### Medium (md)
```css
--hds-shadow-md: 0px 6px 22px 0px #0037701a,
                 0px 4px 8px 0px #003b8905;
```
- Top Offset Y: 6px
- Top Blur: 22px
- Bottom Offset Y: 4px
- Bottom Blur: 8px

#### Large (lg)
```css
--hds-shadow-lg: 0px 15px 40px -2px #0037701a,
                 0px 5px 20px -2px #003b890a;
```
- Top Offset Y: 15px
- Top Blur: 40px
- Spread: -2px
- Bottom Offset Y: 5px
- Bottom Blur: 20px
- Spread: -2px

#### Extra Large (xl)
```css
--hds-shadow-xl: 0px 20px 80px -16px #00377024,
                 0px 10px 60px -16px #003b890f;
```
- Top Offset Y: 20px
- Top Blur: 80px
- Spread: -16px
- Bottom Offset Y: 10px
- Bottom Blur: 60px
- Spread: -16px

### Shadow Color Palette
| Type | Color |
|------|-------|
| **Shadow Color (Dark)** | `#00377024` |
| **Shadow Color (Blue)** | `#003b890f` |
| **Shadow Color SM Top** | `#00377014` |
| **Shadow Color SM Bottom** | `#003b890d` |
| **Popover Top** | `#27395114` |
| **Popover Bottom** | `#061b311f` |

---

## 6. BORDERS

### Border Styles
| Type | Width | Color |
|------|-------|-------|
| **Border None** | 0px | — |
| **Border SM** | 1px | Varies |
| **Border MD** | 1.25px | Varies |
| **Border LG** | 2px | Varies |

### Border Colors
| State | Color |
|-------|-------|
| **Default** | `#d4dee9bf` |
| **Focus** | `#d4dee9bf` |
| **Error** | `#d8351e` |
| **Accent** | `#533afd` |
| **Quiet** | `#d6d9fc` |
| **Disabled** | `#d4dee9` |

---

## 7. ANIMATIONS & TRANSITIONS

### Navigation Animation
| Property | Value |
|----------|-------|
| **Duration (Normal)** | 240ms |
| **Duration (Slow)** | 300ms |
| **Easing** | `cubic-bezier(0.45, 0.05, 0.55, 0.95)` |
| **Hamburger Duration** | 0.25s |
| **Height** | 76px |

### Input Focus
| Property | Value |
|----------|-------|
| **Shadow Outer** | 4px |
| **Shadow Single** | 2px |
| **Outline Offset** | 1px |

### Button States
| State | Behavior |
|-------|----------|
| **Normal** | Solid background |
| **Hover** | Darker background color |
| **Focus** | Outline + shadow |
| **Active** | Darker hover state |
| **Disabled** | Grayed out (`#e5edf5`) |

### Gradient Animation
| Property | Value |
|----------|-------|
| **Gradient Stop 1** | `#bdb4ff` |
| **Gradient Stop 2** | `#643afd` |
| **Gradient Stop 3** | `#533afd` |

---

## 8. COMPONENTS

### Primary Button
```css
background-color: #533afd;
color: #fff;
border-radius: 4px;
padding: 12px 16px;
font-weight: 300;
font-size: 0.875rem;
transition: all 240ms cubic-bezier(0.45, 0.05, 0.55, 0.95);
```

**Hover:** `background-color: #4032c8`  
**Disabled:** `background-color: #e5edf5; color: #95a4ba`

### Secondary Button
```css
background-color: transparent;
color: #533afd;
border: 1px solid #d6d9fc;
border-radius: 4px;
padding: 12px 16px;
font-weight: 300;
font-size: 0.875rem;
```

**Hover:** `background-color: transparent; border-color: #4032c8; color: #4032c8`

### Input Fields
```css
background-color: rgba(255, 255, 255, 0.25);
border: 1.25px solid #d4dee9bf;
border-radius: 4px;
padding: 10-12px (Y) × 10-16px (X);
font-family: sohne-var, "SF Pro Display", sans-serif;
font-size: 0.875rem - 1rem;
color: #273951;
```

**Focus:** `background-color: rgba(255, 255, 255, 0.5); border-color: #d4dee9bf`  
**Error:** `border-color: #d8351e; color: #d8351e`

### Cards
```css
background-color: #fff;
border-radius: 16px;
box-shadow: 0px 6px 22px 0px #0037701a, 0px 4px 8px 0px #003b8905;
padding: 24px - 32px;
```

---

## 9. LAYOUT & GRID

### Container
| Property | Value |
|----------|-------|
| **Max Width** | 1264px |
| **Max Width with Borders** | 1266px (1264px + 2px borders) |
| **Margin** | 16px |
| **Page Margin** | 16px |
| **Columns** | 12-column grid |

### Grid Spans
| Size | Columns |
|------|---------|
| **Full** | span 12 |
| **Half** | span 6 |
| **Quarter** | span 3 |

### Typography Scale References
| Category | Small | Medium | Large |
|----------|-------|--------|-------|
| **Hero Font** | 2.125rem | 2.75rem | 3rem |

---

## 10. DESIGN PRINCIPLES

### Color Strategy
1. **Brand First:** Purple (`#533afd`) is the dominant accent
2. **Neutral Depth:** 11-step grayscale for hierarchy
3. **Accent Flexibility:** 5 color modes (Default, Magenta, Lemon, Ruby, Orange)
4. **Subtle Shadows:** Dark shadows have transparency (`#0037700f`) for elegance
5. **Semantic Colors:** Red for errors, green for success

### Typography Strategy
1. **Minimalist:** Light weight (300) for headings, text is airy
2. **Variable Font:** `sohne-var` allows flexible weights in fallback
3. **Generous Line Height:** 1.4 for body text ensures readability
4. **Negative Letter Spacing:** Headings use tight tracking (-0.02em)

### Spacing Strategy
1. **8px Base Unit:** All spacing follows multiples of 8
2. **Section Gaps:** 96px between major sections (large breathing room)
3. **Generous Padding:** Inputs and buttons use 10-16px padding
4. **Layout Columns:** 12-column grid with 16px gutters

### Motion Strategy
1. **Subtle Easing:** `cubic-bezier(0.45, 0.05, 0.55, 0.95)` feels premium
2. **240-300ms:** Balances responsiveness with elegance
3. **Navigation Focused:** Main animation duration controls navigation

### Premium Brand Signals
- Generous whitespace (96px section gaps)
- Light font weights (mostly 300)
- Subtle shadows with transparency
- Sophisticated color palette
- Smooth, calculated transitions
- Professional typography hierarchy

---

## File Structure for Implementation

```
design-tokens/
├── typography/
│   ├── fonts.ts          # Font families
│   ├── heading-sizes.ts  # h1-h6 scale
│   ├── body-sizes.ts     # Body text scale
│   └── weights.ts        # 300, 400
├── colors/
│   ├── brand.ts          # #533afd + shades
│   ├── neutral.ts        # 0-990 scale
│   ├── semantics.ts      # Success, error, warning
│   └── accents.ts        # Magenta, lemon, ruby, orange
├── spacing/
│   └── scale.ts          # 0px - 200px (8px multiples)
├── radius/
│   └── scale.ts          # 0px, 2px, 4px, 6px, 16px, 32px, round
├── shadows/
│   └── presets.ts        # xs, sm, md, lg, xl
└── components/
    ├── button.ts         # Primary, secondary variants
    ├── input.ts          # Text, select, range
    ├── card.ts           # Surface with shadow
    └── navigation.ts     # 76px height, animation timing
```

---

## Usage Examples

### Tailwind CSS Config
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: { 600: '#533afd', 700: '#4032c8', 800: '#2e2b8c' },
        neutral: { 0: '#fff', 50: '#e5edf5', 800: '#273951', 990: '#061b31' }
      },
      fontSize: {
        h1: ['3rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '300' }],
        body: ['1rem', { lineHeight: '1.4', fontWeight: '300' }]
      },
      spacing: {
        xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px'
      },
      borderRadius: {
        sm: '4px', md: '6px', lg: '16px'
      },
      boxShadow: {
        sm: '0px 5px 14px 0px #00377014, 0px 2px 8px 0px #003b890d',
        lg: '0px 15px 40px -2px #0037701a, 0px 5px 20px -2px #003b890a'
      }
    }
  }
};
```

---

## Key Takeaways for LP Design

1. **Color:** Use `#533afd` sparingly but powerfully for CTAs
2. **Typography:** Keep headings light (300), body generous (1.4 line-height)
3. **Spacing:** 96px gaps between sections create premium breathing room
4. **Shadows:** Subtle, darkened (#003770, #003b89 with transparency)
5. **Buttons:** 4px radius, 12px vertical padding, full-width capable
6. **Grid:** 12 columns, 16px gutters, max-width 1264px
7. **Motion:** 240ms easing for all transitions
8. **Accents:** 5 color modes available, but default purple is dominant

This token system conveys **trust, sophistication, and premium quality**—perfect for financial/consulting brands.
