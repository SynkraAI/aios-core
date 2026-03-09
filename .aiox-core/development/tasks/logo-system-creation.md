# logo-system-creation

> **Logo System Creation Task** - Create logo variations and usage system
> Build complete lockup system following Logo Versatility System framework

## Task Definition

```yaml
task:
  name: logo-system-creation
  agent: aaron-draplin
  category: logo-design
  complexity: medium
  estimated_time: "2-4 hours"

  description: |
    Take an approved logo concept and expand it into a complete system
    of lockups, color variations, and usage rules. This task follows
    the Logo Versatility System framework - ensuring the logo works
    in any application, at any size, in any context.

  inputs:
    required:
      - approved_logo: "Final approved logo concept"
      - brand_colors: "Primary and secondary colors"
    optional:
      - specific_applications: "Priority applications"
      - badge_version_needed: "True/false"
      - animation_ready: "True/false"

  outputs:
    - lockup_system: "All lockup variations"
    - color_variations: "All color versions"
    - size_specifications: "Minimum sizes, clearspace"
    - usage_rules: "Do's and Don'ts"
    - file_package: "Organized deliverables"
```

---

## Draplin Philosophy

```
"One logo, infinite applications."

"The logo system is like a Swiss Army knife -
different tools for different jobs, same quality throughout."

"If you only deliver one version, you're not done."

"Badge it up! Give them options they didn't know they needed."
```

---

## Step 1: Lockup System Creation

**Goal:** Create all necessary layout variations.

### 1.1 Primary Lockup

```markdown
## PRIMARY LOCKUP

The main version - use when space and context allow.

Construction:
- [ ] Finalize proportions
- [ ] Define exact spacing between elements
- [ ] Create master vector file
- [ ] Document dimensions

Specifications:
- Aspect ratio: ___:___ (e.g., 3:1, 4:3)
- Recommended use: _________________
- Minimum width: ___px (digital) / ___" (print)
```

### 1.2 Horizontal Lockup

```markdown
## HORIZONTAL LOCKUP

Icon + wordmark side by side.

Construction:
- [ ] Position icon to left of text
- [ ] Determine vertical alignment (center, baseline, etc.)
- [ ] Set proportional spacing
- [ ] Test legibility balance

Specifications:
- Aspect ratio: ___:___ (typically 3:1 to 5:1)
- Icon to text spacing: ___ (relative to icon height)
- Use for: Headers, email signatures, banners
- Minimum width: ___px / ___"

Variations:
- [ ] Icon left, text right (standard)
- [ ] Text left, icon right (if needed)
```

### 1.3 Stacked Lockup

```markdown
## STACKED LOCKUP

Icon above wordmark.

Construction:
- [ ] Center icon above text
- [ ] Determine vertical spacing
- [ ] Balance visual weight
- [ ] Test in square contexts

Specifications:
- Aspect ratio: ___:___ (typically 1:1 to 1:1.5)
- Icon to text spacing: ___ (relative to icon height)
- Use for: Social avatars, square placements, app stores
- Minimum height: ___px / ___"
```

### 1.4 Icon Only

```markdown
## ICON ONLY (MARK)

Symbol/mark without text.

Requirements:
- [ ] Works completely independently
- [ ] Recognizable as the brand
- [ ] Passes coin test alone
- [ ] Functions as favicon

Specifications:
- Aspect ratio: 1:1 (or natural icon proportion)
- Use for: Favicons, app icons, watermarks, small spaces
- Minimum size: 16x16px (must be clear at this size)

Optimization:
- [ ] 16px version (favicon - may need simplification)
- [ ] 32px version
- [ ] 64px version (app icon standard)
- [ ] 128px+ version (full detail)
```

### 1.5 Wordmark Only (Optional)

```markdown
## WORDMARK ONLY

Text without icon (if applicable).

When to use:
- When icon is redundant in context
- Text-heavy environments
- When brand name carries recognition

Construction:
- [ ] Standalone text treatment
- [ ] Maintains brand typography
- [ ] Same proportions as in lockups

Specifications:
- Use for: Text-heavy contexts, legal documents
- Note: Only create if genuinely useful
```

### 1.6 Badge Version

```markdown
## BADGE VERSION

Logo contained in emblem/badge structure.

Construction:
- [ ] Select container shape (circle, shield, rounded rect)
- [ ] Position primary elements
- [ ] Add text on path if needed
- [ ] Include secondary elements (date, location, etc.)
- [ ] Test embroidery/patch viability

Specifications:
- Container shape: _________________
- Use for: Patches, pins, merch, formal applications
- Best for: Merchandise, apparel, credentials

Badge elements:
- Primary: _________________
- Secondary: _________________
- Accent: _________________
```

---

## Step 2: Color Variations

**Goal:** Create all color versions needed.

### 2.1 Full Color

```markdown
## FULL COLOR VERSION

Primary branded version.

Specifications:
| Color | Pantone | CMYK | RGB | HEX |
|-------|---------|------|-----|-----|
| Primary | PMS ___ | C_M_Y_K | R_G_B | #______ |
| Secondary | PMS ___ | C_M_Y_K | R_G_B | #______ |
| Accent | PMS ___ | C_M_Y_K | R_G_B | #______ |

Files:
- [ ] RGB version (digital)
- [ ] CMYK version (print)
```

### 2.2 One Color Versions

```markdown
## ONE COLOR VERSIONS

For limited color applications.

### Black Version
- [ ] 100% black
- [ ] Use for: Newsprint, fax, stamps, engraving

### White Version
- [ ] 100% white
- [ ] Use for: Dark backgrounds, screens, foil

### Primary Color Version
- [ ] Single brand color
- [ ] Use for: Promotional items, single-color printing
```

### 2.3 Reversed Versions

```markdown
## REVERSED VERSIONS

For dark backgrounds.

Light on Dark:
- [ ] White on brand color
- [ ] White on black
- [ ] Light version on photo backgrounds

Optical Adjustments:
- [ ] Stroke weight adjusted if needed (may need to be slightly thicker)
- [ ] Spacing adjusted if needed
- [ ] Element proportions verified

Note: Some logos need optical adjustment when reversed.
Test carefully and create separate reversed files if needed.
```

### 2.4 Grayscale

```markdown
## GRAYSCALE VERSION

For black and white printing with tones.

Construction:
- [ ] Convert colors to appropriate gray values
- [ ] Maintain contrast and hierarchy
- [ ] Test in actual grayscale print

Use for: Newspapers, photocopies, B&W printing
```

---

## Step 3: Size Specifications

**Goal:** Define all sizing rules.

### 3.1 Minimum Sizes

```markdown
## MINIMUM SIZE SPECIFICATIONS

### Digital (pixels)

| Lockup | Minimum Width | Minimum Height |
|--------|---------------|----------------|
| Primary | ___px | ___px |
| Horizontal | ___px | ___px |
| Stacked | ___px | ___px |
| Icon only | 16px | 16px |
| Badge | ___px | ___px |

### Print (inches/mm)

| Lockup | Minimum Width | Minimum Height |
|--------|---------------|----------------|
| Primary | ___" | ___" |
| Horizontal | ___" | ___" |
| Stacked | ___" | ___" |
| Icon only | 0.25" | 0.25" |
| Badge | ___" | ___" |

Rule: If text becomes illegible, switch to icon-only.
```

### 3.2 Clearspace

```markdown
## CLEARSPACE RULES

Minimum clear area around logo where no other elements can intrude.

Measurement Unit: [X] = height of [specific element, e.g., the icon, the letter 'x']

### Clearspace by Lockup

| Lockup | Top | Bottom | Left | Right |
|--------|-----|--------|------|-------|
| Primary | 1X | 1X | 1X | 1X |
| Horizontal | 1X | 1X | 1X | 1X |
| Stacked | 1X | 1X | 1X | 1X |
| Icon only | 0.5X | 0.5X | 0.5X | 0.5X |

Visual diagram: [Include clearspace diagram]
```

### 3.3 Safe Area

```markdown
## SAFE AREA

Absolute minimum clearspace for tight spaces.

Standard Clearspace: 1X
Safe Area (tight): 0.5X

Use Safe Area ONLY when:
- Space is genuinely constrained
- Logo still has visual breathing room
- Alternative lockup won't fit

Never violate Safe Area.
```

---

## Step 4: Usage Rules

**Goal:** Define how logo can and cannot be used.

### 4.1 Approved Uses

```markdown
## DO's - APPROVED USES

### Lockup Selection
- [x] Use appropriate lockup for aspect ratio
- [x] Use icon-only for small sizes
- [x] Use badge for merchandise
- [x] Maintain consistent lockup within single medium

### Color Application
- [x] Use full color when possible
- [x] Use one-color for limited printing
- [x] Use reversed on dark backgrounds
- [x] Maintain color specifications exactly

### Placement
- [x] Respect minimum clearspace
- [x] Place on clean, uncluttered backgrounds
- [x] Ensure adequate contrast
- [x] Center or align consistently
```

### 4.2 Prohibited Uses

```markdown
## DON'Ts - PROHIBITED USES

### Never Distort
- [ ] Don't stretch horizontally
- [ ] Don't stretch vertically
- [ ] Don't skew or rotate arbitrarily
- [ ] Don't apply perspective

### Never Modify
- [ ] Don't change colors to non-approved colors
- [ ] Don't add effects (shadows, glows, gradients)
- [ ] Don't outline the logo
- [ ] Don't add patterns or textures
- [ ] Don't rearrange elements

### Never Compromise Legibility
- [ ] Don't use on busy backgrounds
- [ ] Don't place where contrast is poor
- [ ] Don't use below minimum size
- [ ] Don't violate clearspace

### Never Mix
- [ ] Don't combine lockups
- [ ] Don't add other graphics to logo
- [ ] Don't change typeface
- [ ] Don't recreate from scratch
```

### 4.3 Background Guidelines

```markdown
## BACKGROUND GUIDELINES

### Approved Backgrounds
| Background | Use |
|------------|-----|
| White | Full color logo |
| Black | White/reversed logo |
| Brand primary | White/reversed logo |
| Light neutral | Full color logo |
| Dark neutral | White/reversed logo |

### Problematic Backgrounds
| Background | Solution |
|------------|----------|
| Busy photos | Add semi-transparent overlay |
| Clashing colors | Use one-color version |
| Low contrast | Use reversed or add background shape |
| Gradients | Place on solid portion |

### Photo Placement
When placing on photography:
1. Find clean area with consistent tone
2. Add subtle background shape if needed
3. Ensure minimum 4:1 contrast ratio
4. Test legibility at intended size
```

---

## Step 5: File Organization

**Goal:** Create organized, complete deliverable package.

### 5.1 Folder Structure

```
/[BrandName]_Logo_System/
│
├── /01_Primary/
│   ├── /Vector/
│   │   ├── [Brand]_Primary_RGB.ai
│   │   ├── [Brand]_Primary_CMYK.ai
│   │   ├── [Brand]_Primary.eps
│   │   ├── [Brand]_Primary.svg
│   │   └── [Brand]_Primary.pdf
│   └── /PNG/
│       ├── [Brand]_Primary_FullColor.png
│       ├── [Brand]_Primary_Black.png
│       ├── [Brand]_Primary_White.png
│       └── [Brand]_Primary_Reversed.png
│
├── /02_Horizontal/
│   ├── /Vector/
│   └── /PNG/
│
├── /03_Stacked/
│   ├── /Vector/
│   └── /PNG/
│
├── /04_Icon/
│   ├── /Vector/
│   ├── /PNG/
│   └── /Favicon/
│       ├── favicon.ico
│       ├── favicon-16x16.png
│       ├── favicon-32x32.png
│       ├── apple-touch-icon.png (180x180)
│       └── android-chrome-192x192.png
│
├── /05_Badge/
│   ├── /Vector/
│   └── /PNG/
│
├── /06_Guidelines/
│   ├── [Brand]_Logo_Guidelines.pdf
│   └── [Brand]_Color_Specs.pdf
│
└── README.txt
```

### 5.2 File Naming Convention

```
Convention: [Brand]_[Lockup]_[Color]_[Size].[ext]

Examples:
- Acme_Primary_FullColor.ai
- Acme_Horizontal_Black.png
- Acme_Icon_White_64px.png
- Acme_Badge_CMYK.eps
```

### 5.3 Deliverables Checklist

```markdown
## FINAL DELIVERABLES CHECKLIST

### Vector Files (required)
- [ ] .AI (Adobe Illustrator native)
- [ ] .EPS (universal vector)
- [ ] .SVG (web/digital)
- [ ] .PDF (print-ready)

### Raster Files (required)
- [ ] PNG transparent - multiple sizes
- [ ] JPG on white (if needed)

### Special Formats (as needed)
- [ ] Favicon package
- [ ] Social media sizes
- [ ] App icon sizes

### Documentation (required)
- [ ] Usage guidelines PDF
- [ ] Color specifications
- [ ] Minimum sizes documented
- [ ] Clearspace documented
```

---

## Step 6: Quality Verification

### Final System Checklist

```markdown
## SYSTEM QUALITY CHECKLIST

### Lockups
- [ ] Primary lockup complete and documented
- [ ] Horizontal lockup complete
- [ ] Stacked lockup complete
- [ ] Icon-only version works independently
- [ ] Badge version complete (if applicable)

### Colors
- [ ] Full color version (RGB + CMYK)
- [ ] Black version
- [ ] White version
- [ ] Primary color version
- [ ] Reversed version
- [ ] All Pantone codes documented

### Sizes
- [ ] Minimum sizes defined for each lockup
- [ ] Clearspace defined and diagrammed
- [ ] Icon works at 16px (favicon test)
- [ ] All sizes maintain legibility

### Files
- [ ] All formats provided
- [ ] Naming consistent
- [ ] Folders organized
- [ ] README included

### Documentation
- [ ] Usage guidelines written
- [ ] Do's and Don'ts clear
- [ ] Color specifications complete
- [ ] Examples provided
```

---

## Completion Criteria

```yaml
task_complete_when:
  lockups:
    - "Primary lockup finalized"
    - "Horizontal lockup created"
    - "Stacked lockup created"
    - "Icon-only version works at 16px"
    - "Badge version created (if applicable)"

  colors:
    - "Full color RGB version"
    - "Full color CMYK version"
    - "One-color black version"
    - "One-color white version"
    - "Reversed version"

  specifications:
    - "Minimum sizes defined"
    - "Clearspace defined"
    - "Color codes documented (Pantone, RGB, CMYK, HEX)"

  files:
    - "All vector formats (AI, EPS, SVG, PDF)"
    - "All raster formats (PNG, sizes)"
    - "Favicon package"
    - "Organized folder structure"

  documentation:
    - "Usage guidelines complete"
    - "Do's and Don'ts clear"
    - "Ready for client handoff"
```

---

## Related Files

- **Task:** `logo-design-process.md` (full process)
- **Task:** `logo-simplification.md` (reduction)
- **Task:** `vintage-badge-design.md` (badge creation)
- **Checklist:** `logo-quality-checklist.md`
- **Checklist:** `logo-versatility-checklist.md`

---

*Task Version: 1.0*
*Created: 2026-02-02*
*Agent: aaron-draplin*
*Philosophy: One logo, infinite applications.*
