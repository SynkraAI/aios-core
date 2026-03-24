# Design Tokens

W3C Design Tokens Community Group (DTCG) compliant token system for the Brand System Service.

## 3-Tier Architecture

Tokens are organized in three tiers, each building on the previous:

```
primitive/ --> semantic/ --> component/
(raw values)   (purpose)    (UI elements)
```

### 1. Primitive Tokens (`tokens/primitive/`)

Raw, context-free values. These are the atomic building blocks.

- **colors.json** -- Color palettes (blue scale, neutral gray scale, semantic alert colors)
- **typography.json** -- Font families, size scale, line heights, letter spacing, font weights
- **spacing.json** -- Spacing scale based on 8px base grid with 4px sub-grid (17 entries: 0, px, 0.5-16)
- **grid.json** -- Grid system with breakpoints, columns, gutters, margins, maxWidth
- **effects.json** -- Border radius, box-shadow, motion duration, easing

Example:
```json
{
  "color": {
    "blue": {
      "500": {
        "$value": "#0057FF",
        "$type": "color",
        "$description": "Primary brand blue"
      }
    }
  }
}
```

### 2. Semantic Tokens (`tokens/semantic/`)

Purpose-driven tokens that reference primitives using DTCG reference syntax.

- **colors.json** -- Background, surface, interactive, text, border, status colors
- **typography.json** -- Display, heading, body, mono, label type roles
- **spacing.json** -- Component spacing (xs-xl) and layout spacing (section, container, gap)

Example:
```json
{
  "interactive": {
    "default": {
      "$value": "{color.blue.500}",
      "$type": "color",
      "$description": "Default interactive element color"
    }
  }
}
```

### 3. Component Tokens (`tokens/component/`)

Component-specific tokens that reference semantic tokens.

- **button.json** -- Button variants (primary, secondary, disabled)
- **card.json** -- Card surface, border, shadow, padding
- **input.json** -- Input field styling, states, labels, errors

Example:
```json
{
  "button": {
    "primary": {
      "background": {
        "$value": "{interactive.default}",
        "$type": "color",
        "$description": "Primary button background"
      }
    }
  }
}
```

## Grid & Spacing System

The grid and spacing tokens implement an 8px base grid system with a 4px sub-grid for fine-tuning.

### Grid Configuration

Grid behavior is customizable via `tokens/grid.config.json`:

```json
{
  "baseUnit": 8,
  "maxWidth": 1280,
  "breakpoints": {
    "xs": 0,
    "sm": 640,
    "md": 768,
    "lg": 1024,
    "xl": 1280,
    "2xl": 1536
  }
}
```

### Grid Token Structure

| Token Group | Purpose | Example |
|-------------|---------|---------|
| `grid.breakpoint.*` | Responsive breakpoints | `grid.breakpoint.lg = 1024px` |
| `grid.columns.*` | Column counts per breakpoint | `grid.columns.lg = 12` |
| `grid.gutter.*` | Gutter sizes per breakpoint | `grid.gutter.lg = 24px` |
| `grid.margin.*` | Outer margins per breakpoint | `grid.margin.lg = 40px` |
| `grid.maxWidth` | Maximum content width | `grid.maxWidth = 1280px` |

### Spacing Scale

The spacing scale provides 17 entries, all multiples of 4px (except `px` and `0`):

| Token | Value | Use Case |
|-------|-------|----------|
| `spacing.0` | 0 | No spacing |
| `spacing.px` | 1px | Hairline borders |
| `spacing.0.5` | 4px | Smallest unit (sub-grid) |
| `spacing.1` | 8px | Base grid unit |
| `spacing.2` | 16px | Default element spacing |
| `spacing.3` | 24px | Section padding |
| `spacing.4` | 32px | Section spacing |
| `spacing.5` | 40px | Touch target (44px with padding) |
| `spacing.6` | 48px | Large gaps |
| `spacing.8` | 64px | Major layout gaps |
| `spacing.10` | 80px | Section dividers |
| `spacing.12` | 96px | Page sections |
| `spacing.16` | 128px | Largest spacing |

### Vertical Rhythm

All spacing values align to the 8px base grid to maintain consistent vertical rhythm:

- **Button height**: 5 × 8px = 40px (+ padding = 44px touch target minimum)
- **Section spacing**: Multiples of 8px (24px, 32px, 48px, 64px, 80px)
- **Component padding**: Use spacing scale for consistent rhythm

### Semantic Spacing Aliases

Semantic spacing tokens provide purpose-driven aliases:

**Component Scale** (`component.*`):
- `component.xs` → `spacing.0.5` (4px)
- `component.sm` → `spacing.1` (8px)
- `component.md` → `spacing.2` (16px)
- `component.lg` → `spacing.3` (24px)
- `component.xl` → `spacing.4` (32px)

**Layout Scale** (`layout.*`):
- `layout.section` → `spacing.10` (80px)
- `layout.container` → `spacing.16` (128px)
- `layout.gap` → `spacing.3` (24px)

## W3C DTCG Format

Every token MUST have three required fields:

| Field | Required | Description |
|-------|----------|-------------|
| `$value` | Yes | The token value (raw or reference) |
| `$type` | Yes | Data type (color, dimension, fontFamily, etc.) |
| `$description` | Yes | Human-readable description rendered in brand book |

Optional fields:

| Field | Description |
|-------|-------------|
| `$extensions` | Metadata for tooling (Figma mappings, deprecated flags) |

### Valid `$type` Values

`color`, `dimension`, `fontFamily`, `fontWeight`, `duration`, `cubicBezier`, `number`, `shadow`, `strokeStyle`, `border`, `transition`, `gradient`, `typography`

### Reference Syntax

Use curly braces to reference another token by its dot-notation path:

```
{color.blue.500}        -- references primitive color
{interactive.default}    -- references semantic token
```

References are resolved across all token files in all tiers.

## How to Add a New Token

### Adding a Primitive Token

1. Open the relevant file in `tokens/primitive/` (or create a new one)
2. Add the token with `$value`, `$type`, and `$description`
3. Run `pnpm tokens:validate` to verify

### Adding a Semantic Token

1. Ensure the primitive token exists
2. Open `tokens/semantic/` and add a token with a reference `$value`
3. Run validation

### Adding a Component Token

1. Ensure the semantic token exists
2. Open `tokens/component/` and add a token referencing the semantic token
3. Run validation

### Full Chain Example

```
primitive/colors.json    -->  color.blue.500 = "#0057FF"
semantic/colors.json     -->  interactive.default = "{color.blue.500}"
component/button.json    -->  button.primary.background = "{interactive.default}"
```

## `$description` and the Brand Book

Every token's `$description` field is rendered in the generated brand book. Write descriptions that help designers and developers understand:

- **What** the token represents
- **Where** it should be used
- **Why** it exists (design intent)

Good: "Primary brand blue -- main interactive color for buttons and links"
Bad: "Blue color"

## Client Configuration

The `client.config.json` file in the tokens root configures per-client behavior:

```json
{
  "prefix": "bss",
  "client_id": "demo",
  "brand_name": "Demo Brand"
}
```

- **prefix** -- Namespace prefix for CSS variables (e.g., `--bss-color-primary`)
- **client_id** -- Unique client identifier for multi-tenant builds
- **brand_name** -- Human-readable brand name for documentation

To customize for a client, update these values before running the token build pipeline.

## Build Pipeline (Style Dictionary 4.x)

The token build pipeline transforms W3C DTCG JSON files into multiple output formats:

```bash
pnpm build:tokens                    # Build for default client
pnpm build:tokens --client=acme      # Build for specific client
pnpm tokens:watch                    # Watch mode (rebuilds on changes)
```

Output files are written to `output/{client-slug}/`:

| File | Format | Usage |
|------|--------|-------|
| `tokens.css` | CSS Custom Properties | Vanilla CSS, any framework |
| `tokens.scss` | SCSS Variables | SCSS/Sass projects |
| `tailwind-tokens.ts` | Tailwind Theme TS | Import into `tailwind.config.ts` |
| `tokens.json` | JSON Flat Map | JS consumption, Figma Variables import |

### JSON Flat Export Format

The `tokens.json` file is a flat key-value map where keys are PascalCase token paths:

```json
{
  "ColorBlue500": "#0057ff",
  "SpacingMd": "16px",
  "TypographyFontFamilySans": "Inter, system-ui, sans-serif",
  "ButtonPrimaryBackground": "#0057ff"
}
```

This format is suitable for:
- Direct JavaScript/TypeScript consumption
- Figma Variables import via Tokens Studio
- Any tool that needs a flat token map

## Validation

Run the schema validator to check all token files:

```bash
pnpm tokens:validate
```

The validator checks:
- Required fields (`$value`, `$type`, `$description`)
- Valid `$type` values
- Reference resolution (no broken references)
- Circular reference detection

## Specification Reference

- [W3C Design Tokens Community Group](https://design-tokens.github.io/community-group/format/)
- Version: 2025.10 stable
