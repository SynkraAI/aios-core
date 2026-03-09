# Website Design Extraction Prompt

Use this prompt when analyzing websites with WebFetch to extract design systems.

## Comprehensive Extraction Prompt

```markdown
Analyze this webpage comprehensively and extract a complete design system.

Provide EXACT VALUES (hex codes, px/rem measurements) - do not approximate.

# 1. COLOR PALETTE

## Primary Colors
- Main brand color (hex code)
- All shades/variants (lighter to darker)
- Usage contexts (buttons, links, highlights)
- Hover/active states

## Secondary/Accent Colors
- Supporting colors (hex codes)
- All variants
- Usage contexts

## Semantic Colors
Extract EXACT hex codes:
- Success (green) - hex + where used
- Warning (yellow/orange) - hex + where used
- Error (red) - hex + where used
- Info (blue) - hex + where used

## Neutral Scale
Complete gray scale (all shades found):
- Lightest to darkest (hex codes)
- Background colors
- Text colors (primary, secondary, muted, disabled)
- Border colors
- Divider colors

## Special Colors
- Overlays (with alpha/opacity values)
- Shadows (color + alpha)
- Gradients (start, end, direction)

# 2. TYPOGRAPHY

## Font Families
- Primary font (exact name or closest match)
- Secondary font (if used)
- Monospace font (if used)
- Fallback stack

## Font Sizes
List ALL font sizes found (in px or rem):
- Headings (h1, h2, h3, h4, h5, h6)
- Body text sizes
- Small text/captions
- Button text
- Badge/label text
- Any other text sizes

Map to usage:
- Where is 48px used? (e.g., hero H1)
- Where is 24px used? (e.g., section headings)
- Where is 16px used? (e.g., body text)

## Font Weights
List all weights found:
- 300 (light) - where used
- 400 (regular) - where used
- 500 (medium) - where used
- 600 (semibold) - where used
- 700 (bold) - where used
- 800 (extrabold) - where used

## Line Heights
- Tight (1.2-1.3) - where used
- Normal (1.4-1.6) - where used
- Relaxed (1.7-2.0) - where used

## Letter Spacing
- Tight, normal, or wide
- Specific values if visible

# 3. SPACING SYSTEM

## Base Unit
- What is the base spacing unit? (4px, 8px, 16px?)
- Evidence of consistent spacing scale?

## Spacing Scale
List all spacing values found:
- Padding values (components)
- Margin values (between sections)
- Gap values (grids, flexbox)

Identify patterns:
- 4px, 8px, 12px, 16px, 24px, 32px... (multiples of 4?)
- 8px, 16px, 24px, 32px, 40px... (multiples of 8?)

## Common Patterns
- Button padding: horizontal × vertical
- Card padding: internal spacing
- Section spacing: between major sections
- Container padding: edge spacing

# 4. LAYOUT SYSTEM

## Container
- Max width of main container (px)
- Padding on smaller screens
- Center aligned or full-width?

## Grid System
- Number of columns (desktop)
- Gap between columns
- Responsive behavior (mobile, tablet, desktop)

## Breakpoints
- Mobile breakpoint (typically ~640px)
- Tablet breakpoint (typically ~768px)
- Desktop breakpoint (typically ~1024px)
- Large desktop (typically ~1280px+)

# 5. COMPONENTS ANALYSIS

For each component found, document:

## Buttons
### Variants
- Primary (colors, style)
- Secondary (colors, style)
- Outline/Ghost (colors, style)
- Text/Link (colors, style)
- Danger/Destructive (colors, style)

### Sizes
- Small: padding, font size
- Medium: padding, font size
- Large: padding, font size

### States
- Default: colors
- Hover: color changes, shadow changes
- Active/Pressed: colors
- Focus: outline/ring style
- Disabled: colors, opacity

### Visual Properties
- Border radius
- Font weight
- Text transform (uppercase?)
- Icon spacing (if icons present)

## Input Fields
- Height
- Padding (horizontal, vertical)
- Border (width, color, style)
- Border radius
- Font size
- Placeholder color
- Focus state (border color, ring/shadow)
- Error state (border color, text color)
- Disabled state (background, text color)

## Cards
- Background color
- Border (width, color, style)
- Border radius
- Padding (internal)
- Shadow (box-shadow value)
- Header style (if has header)
- Footer style (if has footer)

## Navigation
### Header/Navbar
- Height
- Background color
- Border (bottom border)
- Padding
- Logo size/placement
- Menu item spacing
- Active/current item styling

### Sidebar (if present)
- Width
- Background color
- Border (right/left border)
- Item padding
- Active item styling
- Collapsed state width

## Badges/Tags
- Padding (horizontal × vertical)
- Font size
- Font weight
- Border radius (typically pill-shaped?)
- Variants (colors for different types)

## Avatars
- Sizes (small, medium, large)
- Border radius (fully circular?)
- Border (if present)
- Fallback background (color/gradient)

## Tables
- Header background
- Header font (size, weight, transform)
- Border (cell borders)
- Row hover background
- Cell padding
- Striped rows? (alternate row color)

## Modals/Dialogs
- Overlay color (with alpha)
- Background color
- Border radius
- Shadow
- Max width
- Padding
- Header style
- Footer style

## Alerts/Notifications
- Padding
- Border radius
- Border (left/right/all?)
- Icon placement
- Variants (info, success, warning, error colors)
- Close button style

# 6. VISUAL EFFECTS

## Box Shadows
List all shadow values found (CSS syntax):
```
0 1px 2px 0 rgba(0, 0, 0, 0.05)
0 4px 6px -1px rgba(0, 0, 0, 0.1)
...
```

Classify as:
- sm: subtle shadow
- md: medium shadow (cards)
- lg: large shadow (modals)
- xl: extra large shadow

## Border Radius
List all border-radius values:
- Small (buttons, badges)
- Medium (cards, inputs)
- Large (modals, large cards)
- Full (pills, avatars)

## Transitions
- Duration (typically 150ms, 200ms, 300ms?)
- Easing (ease, ease-in-out, cubic-bezier?)
- Properties animated (color, transform, opacity, shadow?)

# 7. PATTERNS & CONVENTIONS

## Design Principles Observable
- Minimalist or detailed?
- Flat or with depth (shadows)?
- Sharp or rounded corners?
- Vibrant or muted colors?
- Dense or spacious layout?

## Consistency Notes
- Are colors used consistently?
- Is spacing consistent (follows scale)?
- Are font sizes predictable?
- Are shadows consistent?

## Accessibility
- Color contrast (estimate ratio)
- Focus indicators visible?
- Text size minimum (14px+?)
- Touch target sizes (44px+ for mobile?)

# 8. RESPONSIVE BEHAVIOR

## Mobile Adaptations
- How does navigation change? (hamburger menu?)
- How do cards stack? (single column?)
- Font size changes? (smaller headings?)
- Spacing adjustments? (tighter spacing?)

## Tablet Adaptations
- Grid columns (2 columns?)
- Sidebar behavior (visible or hidden?)
- Font sizes between mobile and desktop?

---

# OUTPUT FORMAT

Organize findings in this structure:

## Summary
- Primary color: #XXXXXX
- Font family: [Name]
- Base spacing unit: Xpx
- Design style: [modern/classic/minimal/etc]

## Complete Token List
[All tokens organized by category]

## Component Inventory
[List all components found with variants]

## Recommendations
- Gaps to fill (missing semantic colors?)
- Inconsistencies found
- Suggested normalizations

---

Please be thorough, precise, and organized. This data will be used to generate a production design system.
```

## Notes for Claude Code

When using this prompt with WebFetch:

1. **Be Specific:** Request exact hex codes, not color names
2. **Be Thorough:** List ALL variations found, even if similar
3. **Be Organized:** Structure the response clearly
4. **Be Precise:** Measurements in px or rem, not approximations
5. **Cross-Reference:** If analyzing multiple pages, note variations

## Example WebFetch Call

```typescript
// In the skill implementation
const analysis = await webFetch({
  url: targetUrl,
  prompt: extractionPrompt, // Use the prompt above
})
```

## Post-Processing

After receiving the analysis:

1. **Validate hex codes** - Check format (#RRGGBB)
2. **Normalize spacing** - Round to nearest 4px or 8px if inconsistent
3. **Complete palettes** - Generate missing shades (50-900) if only some provided
4. **Identify patterns** - Group similar values
5. **Document assumptions** - Note any normalizations made
