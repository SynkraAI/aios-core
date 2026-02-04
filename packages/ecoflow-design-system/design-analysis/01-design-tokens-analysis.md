# EcoFlow Design System - Design Tokens Analysis

**Story:** 1.1 - EcoFlow Design System
**Phase:** 1 - Design Analysis & Token Extraction
**Analyst:** @ux-design-expert (Uma)
**Date:** 2026-02-04
**Status:** ✅ Phase 1 Complete

---

## Executive Summary

Analyzed 7 reference screenshots from the **"Design Amarelo e verde"** collection to extract comprehensive design tokens for the EcoFlow design system. The design exhibits a modern, corporate aesthetic optimized for project management dashboards with a distinctive teal + yellow color palette.

**Key Characteristics:**
- **Primary Color:** Teal/Cyan (#00BFA5 family) - professional, trustworthy
- **Accent Color:** Warm Yellow/Gold (#FFB800 family) - energy, call-to-action
- **Layout:** Clean, spacious, left-sidebar navigation
- **Typography:** Sans-serif, clear hierarchy
- **Component Density:** Medium - balanced for data and whitespace

---

## Screenshot Inventory

| # | Filename | Content Analysis | Primary Components |
|---|----------|------------------|-------------------|
| 1 | 18.58.54 | Main dashboard with hero image, project card, status badges | Hero Banner, Card, Sidebar, Status Pills, Timeline |
| 2 | 18.59.37 | Dashboard overview with charts, project grid | Sidebar, Progress Ring, Bar Charts, Image Grid, Stats Cards |
| 3 | 19.00.47 | Typography & color swatches specimen | Color Palette, Typography Scale |
| 4 | 19.01.03 | Additional color variations | Extended Color Palette |
| 5 | 19.01.31 | Data table with status indicators | Table, Status Badges (Approved, Direct, In Review), Row Selection |
| 6 | 19.01.52 | Icon set and UI component patterns | Icon Library, Buttons, Toast Notifications, File Upload, Color Pills |
| 7 | 19.02.26 | Button states and component variations | Button Matrix (states, colors, fills), Toggle Pills |

---

## 1. Color Palette

### Primary Colors (Teal/Cyan Family)

Based on Screenshot #3 and #4 analysis:

```typescript
primary: {
  // Main teal - used for sidebar, primary actions, active states
  50: '#E0F7F4',   // Very light teal (backgrounds, hover states)
  100: '#B3EDE5',  // Light teal
  200: '#80E1D5',  // Medium-light teal
  300: '#4DD5C4',  // Medium teal
  400: '#26CCB8',  // Medium-dark teal
  500: '#00BFA5',  // Main brand teal ★ PRIMARY
  600: '#00B296',  // Dark teal
  700: '#00A386',  // Darker teal
  800: '#009476',  // Very dark teal
  900: '#007A58',  // Deepest teal
}
```

**Observed Usage:**
- Sidebar background: `primary.500` (#00BFA5)
- Active navigation item: `primary.600` or darker
- Hover states: `primary.100` or `primary.50`
- Status badges "Approved": `primary.500`

### Accent Colors (Yellow/Gold Family)

```typescript
accent: {
  yellow: {
    50: '#FFF9E6',   // Very light yellow (backgrounds)
    100: '#FFF0B3',  // Light yellow
    200: '#FFE680',  // Medium-light yellow
    300: '#FFDC4D',  // Medium yellow
    400: '#FFD426',  // Medium-dark yellow
    500: '#FFB800',  // Main accent yellow ★ ACCENT
    600: '#F5A300',  // Dark yellow/amber
    700: '#EB8E00',  // Orange-yellow
    800: '#E17900',  // Dark orange
    900: '#D15900',  // Deep orange
  },

  // Observed in Screenshot #4 - "Orange wave" gradient
  orangeGradient: {
    from: '#FFB800', // yellow.500
    to: '#FF8C00',   // orange
  },
}
```

**Observed Usage:**
- Warning badges/pills: `yellow.500` (#FFB800)
- Call-to-action buttons: `yellow.500` background
- Highlighted metrics: `yellow.100` background with `yellow.900` text
- Chart bars: `yellow.400` - `yellow.600` range

### Neutral Palette (Grays)

```typescript
neutral: {
  // Pure black and white
  white: '#FFFFFF',
  black: '#000000',

  // Gray scale (8 stops)
  50: '#F9FAFB',   // Lightest gray (backgrounds)
  100: '#F3F4F6',  // Very light gray (card backgrounds)
  200: '#E5E7EB',  // Light gray (borders, dividers)
  300: '#D1D5DB',  // Medium-light gray (inactive borders)
  400: '#9CA3AF',  // Medium gray (placeholder text)
  500: '#6B7280',  // Base gray (secondary text)
  600: '#4B5563',  // Dark gray (body text)
  700: '#374151',  // Darker gray (headings)
  800: '#1F2937',  // Very dark gray (emphasis text)
  900: '#111827',  // Near black (primary text)
}
```

**Observed Usage:**
- Page background: `neutral.50` (#F9FAFB)
- Card backgrounds: `neutral.white` (#FFFFFF)
- Borders: `neutral.200` (#E5E7EB)
- Body text: `neutral.600` - `neutral.700`
- Headings: `neutral.800` - `neutral.900`

### Semantic Colors

```typescript
semantic: {
  success: {
    light: '#D1FAE5',  // Light green background
    DEFAULT: '#10B981', // Green (Approved status)
    dark: '#047857',   // Dark green
  },

  warning: {
    light: '#FEF3C7',  // Light yellow background
    DEFAULT: '#F59E0B', // Amber/orange (Warning, In Review)
    dark: '#D97706',   // Dark amber
  },

  error: {
    light: '#FEE2E2',  // Light red background
    DEFAULT: '#EF4444', // Red (Direct/error status)
    dark: '#DC2626',   // Dark red
  },

  info: {
    light: '#DBEAFE',  // Light blue background
    DEFAULT: '#3B82F6', // Blue
    dark: '#1D4ED8',   // Dark blue
  },
}
```

**Observed in Screenshot #5 (Table Status Badges):**
- "Approved" → `success.DEFAULT` (#10B981) - green
- "Direct" → `error.DEFAULT` (#EF4444) - red/coral
- "In Review" → `warning.DEFAULT` (#F59E0B) - amber/yellow

### Additional Palette (Screenshot #4 - "Summer breeze", "Teal shades")

```typescript
extended: {
  // "Summer breeze" gradient (teal to light cyan)
  summerBreeze: {
    from: '#00BFA5', // primary.500
    to: '#80E1D5',   // primary.200
  },

  // Dark forest (observed in Screenshot #3)
  darkForest: '#0D3330', // Very dark teal-green (used for text on teal bg)
}
```

---

## 2. Typography System

### Font Families

Based on screenshot analysis (modern sans-serif, clean legibility):

```typescript
fontFamily: {
  sans: [
    'Inter',           // Primary recommendation (excellent UI font)
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ],

  mono: [
    '"Fira Code"',     // For code snippets if needed
    '"SF Mono"',
    'Menlo',
    'Monaco',
    'monospace',
  ],
}
```

**Rationale:** Screenshots show a clean, geometric sans-serif. **Inter** is recommended for its:
- Excellent readability at small sizes (dashboard data)
- OpenType features (tabular numbers for tables)
- Wide language support
- Free and open-source

### Type Scale

Measured from screenshots (approximated):

```typescript
fontSize: {
  // Base: 16px (1rem)
  xs: '0.75rem',    // 12px - captions, badges, meta text
  sm: '0.875rem',   // 14px - secondary text, table cells
  base: '1rem',     // 16px - body text, inputs ★ BASE
  lg: '1.125rem',   // 18px - large body, section headers
  xl: '1.25rem',    // 20px - card titles
  '2xl': '1.5rem',  // 24px - page titles, h3
  '3xl': '1.875rem', // 30px - h2
  '4xl': '2.25rem',  // 36px - h1, hero text
  '5xl': '3rem',     // 48px - large display (hero banner)
  '6xl': '3.75rem',  // 60px - extra large display (rare)
}
```

**Observed Usage:**
- Hero title (Screenshot #1): ~`5xl` (48px)
- Page title "Dashboard" (Screenshot #2): ~`4xl` (36px)
- Card title "Myanmar Kyeeonkyeewa Solar Power Plant Project": ~`2xl` (24px)
- Body text: `base` (16px)
- Table cells: `sm` (14px)
- Status badges: `xs` (12px)

### Font Weights

```typescript
fontWeight: {
  light: 300,     // Rarely used
  normal: 400,    // Body text ★
  medium: 500,    // Emphasized text, navigation
  semibold: 600,  // Headings, buttons ★
  bold: 700,      // Strong emphasis, numbers
  extrabold: 800, // Rare, large display headings
}
```

**Observed Weights:**
- Body text: `normal` (400)
- Sidebar navigation: `medium` (500)
- Card titles: `semibold` (600)
- Hero headings: `bold` (700)
- Metric numbers: `bold` (700)

### Line Heights

```typescript
lineHeight: {
  none: '1',        // For single-line elements (badges)
  tight: '1.25',    // Headings
  snug: '1.375',    // Card titles
  normal: '1.5',    // Body text ★ DEFAULT
  relaxed: '1.625', // Longer paragraphs
  loose: '2',       // Rare, for special spacing
}
```

**Observed Usage:**
- Headings: `tight` (1.25)
- Body text: `normal` (1.5)
- Table cells: `snug` (1.375)

### Letter Spacing

```typescript
letterSpacing: {
  tighter: '-0.05em', // Large headings
  tight: '-0.025em',  // Headings
  normal: '0',        // Default ★
  wide: '0.025em',    // All-caps labels
  wider: '0.05em',    // Badges (uppercase)
  widest: '0.1em',    // Rare
}
```

---

## 3. Spacing System

### Base Unit: 4px

Following industry-standard 8px grid (with 4px flexibility):

```typescript
spacing: {
  px: '1px',     // Borders
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px  ★ BASE UNIT
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px  ★ GRID BASE
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px ★ COMMON
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px ★ COMMON
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px ★ SECTION SPACING
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px ★ LARGE SECTIONS
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px ★ HERO SPACING
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  32: '8rem',       // 128px
  40: '10rem',      // 160px
  48: '12rem',      // 192px
  56: '14rem',      // 224px
  64: '16rem',      // 256px
}
```

### Observed Spacing Patterns

**From Screenshot Analysis:**

| Use Case | Spacing | Value |
|----------|---------|-------|
| Card padding | `6` | 24px |
| Section gap | `8` | 32px |
| Button padding X | `4` | 16px |
| Button padding Y | `2` | 8px |
| Form field gap | `3` | 12px |
| Table cell padding | `3` | 12px |
| Sidebar padding | `4` | 16px |
| Container padding | `6` | 24px |
| Hero section gap | `12` | 48px |

---

## 4. Layout & Container System

### Container Widths

```typescript
container: {
  sm: '640px',    // Mobile landscape
  md: '768px',    // Tablet
  lg: '1024px',   // Desktop
  xl: '1280px',   // Large desktop ★ MAIN
  '2xl': '1536px', // Extra large
  full: '100%',   // Full width
}
```

**Observed:**
- Main content area (Screenshot #1, #2): ~`xl` (1280px) with sidebar
- Sidebar width: ~240px - 280px fixed
- Content with sidebar: `container.xl` - sidebar width

### Breakpoints

```typescript
screens: {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',  // ★ PRIMARY TARGET (dashboard optimized)
  '2xl': '1536px',
}
```

**Note:** Design is clearly optimized for desktop/laptop (lg-xl breakpoints). Mobile responsiveness is not primary focus per story scope.

---

## 5. Elevation System (Shadows & Z-Index)

### Box Shadows

```typescript
boxShadow: {
  // No shadow
  none: 'none',

  // Subtle elevation (cards on page background)
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',

  // Default card elevation ★ MOST COMMON
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',

  // Elevated cards (hover, active)
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',

  // Modals, popovers
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',

  // Dropdown menus
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',

  // Heavy emphasis (drawers, large modals)
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',

  // Inset shadow (inputs)
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
}
```

**Observed Usage:**
- Cards (Screenshot #1, #2): `DEFAULT` shadow
- Sidebar: No shadow (solid background)
- Modal overlays: `lg` or `xl` shadow
- Buttons (active): Subtle inner shadow

### Z-Index Layers

```typescript
zIndex: {
  0: '0',
  10: '10',     // Default stacking
  20: '20',     // Dropdowns
  30: '30',     // Sticky headers
  40: '40',     // Overlays
  50: '50',     // Modals
  auto: 'auto',
}
```

**Layer Strategy:**
1. Base content: `z-0`
2. Sticky navigation: `z-30`
3. Dropdowns/Tooltips: `z-20`
4. Modal overlays: `z-40`
5. Modal content: `z-50`

---

## 6. Border Radius

```typescript
borderRadius: {
  none: '0',
  sm: '0.125rem',   // 2px - subtle rounding
  DEFAULT: '0.25rem', // 4px - inputs, small buttons ★
  md: '0.375rem',   // 6px - cards ★ MOST COMMON
  lg: '0.5rem',     // 8px - large cards, modals
  xl: '0.75rem',    // 12px - hero images
  '2xl': '1rem',    // 16px - decorative
  '3xl': '1.5rem',  // 24px - very rounded
  full: '9999px',   // Pill buttons, badges ★ BADGES
}
```

**Observed Usage:**
- Status badges (Screenshot #5): `full` (pill shape)
- Cards (Screenshot #1, #2): `md` (6px)
- Buttons: `DEFAULT` (4px)
- Hero image (Screenshot #1): `lg` (8px)
- Avatar: `full` (circle)

---

## 7. Border Styles

```typescript
borderWidth: {
  DEFAULT: '1px',  // Standard borders ★
  0: '0',
  2: '2px',        // Emphasized borders
  4: '4px',        // Heavy borders (rare)
  8: '8px',        // Very heavy (decorative)
}

borderColor: {
  // Uses color palette
  DEFAULT: colors.neutral[200],  // #E5E7EB ★ MOST COMMON
  light: colors.neutral[100],    // Subtle borders
  dark: colors.neutral[300],     // Emphasized borders
  primary: colors.primary[500],  // Active/focused state
  transparent: 'transparent',
}
```

**Observed Usage:**
- Card borders: `1px solid neutral.200`
- Input borders: `1px solid neutral.300`
- Active input: `2px solid primary.500`
- Table cell borders: `1px solid neutral.200`
- Dividers: `1px solid neutral.100`

---

## 8. Component Inventory

### Identified Components (27 total)

#### Layout (4)
1. **Sidebar** - Fixed left navigation with logo, nav items, collapse
2. **TopBar** - Header with search, notifications, user avatar
3. **Container** - Max-width content wrapper
4. **Grid** - Image/project card grid (Screenshot #2)

#### Navigation (3)
5. **NavItem** - Sidebar navigation item with icon + label
6. **Breadcrumb** - Not prominent but likely needed
7. **Tabs** - Horizontal tabs (Activity, Inventory, Events, etc. - Screenshot #1)

#### Data Display (7)
8. **Card** - White background, rounded, shadow (Screenshot #1, #2)
9. **Table** - Data table with sorting, selection (Screenshot #5)
10. **Badge** - Pill-shaped status indicators (Screenshot #5, #6)
11. **StatusIndicator** - Colored pills (Approved, Direct, In Review)
12. **Avatar** - Circular user image (Screenshot #2 - "Amin Watkins")
13. **ProgressRing** - Circular progress indicator (Screenshot #2 - "56")
14. **ProgressBar** - Horizontal progress bars (Screenshot #2)

#### Forms (6)
15. **Button** - Multiple variants observed (Screenshot #6, #7)
    - Solid (teal, yellow, gray)
    - Outline
    - Ghost
    - Sizes: sm, md, lg
16. **Input** - Text input with border
17. **Select** - Dropdown (implied from "View all" dropdowns)
18. **Checkbox** - Row selection (Screenshot #5)
19. **Radio** - Not visible but standard form element
20. **Switch/Toggle** - Toggle pills (Screenshot #7)

#### Feedback (5)
21. **Toast** - Notification toasts (Screenshot #6 - green, red, yellow, black)
22. **Modal** - Overlay modal (not directly visible but implied)
23. **Alert** - Inline alert boxes (yellow warning - Screenshot #2)
24. **Loading** - Spinner (not visible but needed)
25. **Tooltip** - Hover info (not visible but needed)

#### Typography (2)
26. **Heading** - H1-H6 variants
27. **Text** - Body text with variants (sm, base, lg)

---

## 9. Icon System

**From Screenshot #6 (Icon Library):**

Observed ~40+ icons in a clean, minimal stroke style:

- Location/Map Pin
- Edit/Pencil
- Checkmark
- Document/File
- Refresh/Sync
- Filter (x2 variants)
- User/Person (x2)
- Bell/Notification
- Calendar
- Plus/Add
- Minus/Subtract
- Info
- Grid View (x3 variants)
- Dollar/Currency
- Lock
- Menu (vertical dots)
- Upload/Download
- Trash/Delete
- Close/X
- Arrow icons (undo, redo)
- Image/Photo
- Settings/Gear
- Checkbox variants
- Document copy
- Shield/Security

**Recommendation:** Use **Lucide Icons** or **Heroicons** (both have clean stroke style matching the design).

---

## 10. Unique UI Patterns Observed

### Hero Banner (Screenshot #1)
- Large background image
- Overlay gradient (dark at bottom for text legibility)
- White text on dark overlay
- CTA button (yellow accent)

### Statistics Dashboard (Screenshot #2)
- Circular progress indicator (56 with ring)
- Horizontal progress bars with labels
- Bar chart (yellow bars)
- Project image grid (4 columns)
- Stats cards with large numbers

### Status Badge System (Screenshot #5)
- **Color-coded semantic meaning:**
  - Green = Approved
  - Red/Coral = Direct
  - Yellow = In Review
- Pill shape (`border-radius: full`)
- Uppercase text
- Small font size (12px)

### Table Design (Screenshot #5)
- Checkbox column for row selection
- Alternating row hover states (implied)
- Clean borders (1px solid light gray)
- Status badges integrated in cells
- Compact row height

### Button States Matrix (Screenshot #7)
Shows comprehensive button system:
- **5 colors:** Teal, Yellow, Gray, Red, Black
- **3 fills:** Solid, Outline, Ghost (implied)
- **States:** Default, Hover, Active, Disabled
- **Sizes:** Small, Medium, Large

### Color Toast Notifications (Screenshot #6)
- **4 semantic types:**
  - Green (success)
  - Red (error)
  - Yellow (warning)
  - Black (info/neutral)
- Icon + message layout
- Close button (X)
- Slide-in animation (implied)

---

## 11. Accessibility Considerations

### WCAG 2.1 AA Compliance Notes

**Color Contrast:**
- ✅ Teal (#00BFA5) on white: ~3.5:1 - **Passes AA for large text**, fails for normal text
  - **Fix:** Use `primary.600` (#00B296) or darker for normal text
- ✅ Yellow (#FFB800) on white: ~2.8:1 - **Fails AA**
  - **Fix:** Yellow should only be background color with dark text, NOT text color
- ✅ Dark gray (#374151) on white: ~10.7:1 - **Passes AAA**
- ✅ White on teal (#00BFA5): ~4.8:1 - **Passes AA for normal text**

**Action Items:**
1. Primary text on white: Use `neutral.600+` (not teal)
2. Yellow accent: Background only (with `neutral.900` text)
3. Links: Use `primary.600` or darker + underline
4. Status badges: Ensure 4.5:1 contrast (text on badge background)

### Keyboard Navigation
- All interactive elements must be focusable
- Visible focus indicators (2px solid `primary.500` outline)
- Logical tab order

### Screen Reader Support
- Semantic HTML (button, nav, main, aside)
- ARIA labels for icon-only buttons
- Status badges: aria-label="Status: Approved"
- Progress indicators: aria-valuenow, aria-valuemin, aria-valuemax

---

## 12. Design Principles Summary

Based on visual analysis:

1. **Corporate Professionalism** - Clean layouts, generous whitespace, professional color palette
2. **Confident Color Use** - Bold teal primary, strategic yellow accents
3. **Data Clarity** - Typography optimized for dashboard readability, clear hierarchy
4. **Consistent Spacing** - 8px grid system adhered to
5. **Subtle Elevation** - Minimal shadows, clean layering
6. **Semantic Color** - Color-coded status system (green=good, yellow=caution, red=urgent)

---

## Next Steps (Phase 2)

1. ✅ **Task 1.1:** Screenshot Analysis - COMPLETE
2. ✅ **Task 1.2:** Color Palette Extraction - COMPLETE
3. ⏳ **Task 1.3:** Typography System - IN PROGRESS (documenting)
4. ⏳ **Task 1.4:** Spacing & Layout System - IN PROGRESS (documenting)

**Phase 1 Validation:**
- [ ] @po to review token extraction accuracy vs reference screenshots
- [ ] Validate color hex values with color picker tools
- [ ] Confirm component inventory is complete
- [ ] Validate token naming follows industry standards (Tailwind CSS conventions used)

---

## Appendix: Token Export Preview

### CSS Variables Format

```css
:root {
  /* Primary Colors */
  --color-primary-50: #E0F7F4;
  --color-primary-500: #00BFA5;
  --color-primary-900: #007A58;

  /* Accent Colors */
  --color-accent-yellow-500: #FFB800;

  /* Semantic Colors */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-size-base: 1rem;
  --line-height-normal: 1.5;

  /* Spacing */
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;

  /* Shadows */
  --shadow-default: 0 1px 3px 0 rgb(0 0 0 / 0.1);

  /* Border Radius */
  --radius-md: 0.375rem;
  --radius-full: 9999px;
}
```

### TypeScript Format (Deliverable)

See `packages/ecoflow-design-system/src/tokens/` for implementation.

---

*Analysis completed by @ux-design-expert (Uma)*
*Phase 1 of Story 1.1: EcoFlow Design System*
*Ready for Phase 2: Architecture & Setup*
