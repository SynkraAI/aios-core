# iOS 16 Design Tokens Analysis

**Project:** iOS Design System
**Story:** 2.1 - iOS 16 Design System
**Phase:** 1 - Figma Analysis & Token Extraction
**Created:** 2026-02-04
**Author:** @ux-design-expert (Uma)

**Sources:**
- [Apple Typography Guidelines](https://developer.apple.com/design/human-interface-guidelines/typography)
- [Apple Color Guidelines](https://developer.apple.com/design/human-interface-guidelines/color)
- [iOS Design Guidelines](https://ivomynttinen.com/blog/ios-design-guidelines/)
- [iOS 16 Typography - Design+Code](https://designcode.io/ios16-typography/)
- [Apple HIG Colors - Figma Community](https://www.figma.com/community/file/1118467272498298301/apple-hig-colors-ios)

---

## Executive Summary

This document contains a comprehensive analysis of iOS 16 design tokens extracted from Apple's official Human Interface Guidelines and design resources. The analysis covers:

- **iOS System Colors** (semantic colors that adapt to Light/Dark mode)
- **SF Pro Typography System** (Text, Display, Rounded variants)
- **8pt Grid Spacing System** (safe areas, margins, padding)
- **iOS Elevation & Shadows** (blur effects, not Material Design elevation)
- **Border Radius & Separators** (continuous curves, hairline separators)

**Key Findings:**
- iOS uses **semantic color system** (systemBlue, systemRed, etc.) that adapts automatically
- SF Pro has **two display modes**: SF Pro Text (≤19pt) and SF Pro Display (≥20pt)
- **Dynamic Type** is non-negotiable for iOS 16 accessibility compliance
- **8pt grid system** with 16pt/20pt standard margins
- **Safe Area Insets** must be respected (notch, home indicator)

---

## 1. iOS Color System

### 1.1 System Colors (Primary Palette)

iOS provides **semantic colors** that adapt to Light Mode, Dark Mode, and accessibility settings automatically.

| Color Name | Light Mode (Hex) | Dark Mode (Hex) | Usage |
|------------|------------------|-----------------|-------|
| `systemBlue` | `#007AFF` | `#0A84FF` | Links, interactive elements, primary actions |
| `systemGreen` | `#34C759` | `#30D158` | Success states, positive actions |
| `systemIndigo` | `#5856D6` | `#5E5CE6` | Alternative accent color |
| `systemOrange` | `#FF9500` | `#FF9F0A` | Warnings, alerts |
| `systemPink` | `#FF2D55` | `#FF375F` | Creative, playful elements |
| `systemPurple` | `#AF52DE` | `#BF5AF2` | Alternative accent color |
| `systemRed` | `#FF3B30` | `#FF453A` | Errors, destructive actions |
| `systemTeal` | `#5AC8FA` | `#64D2FF` | Alternative accent color |
| `systemYellow` | `#FFCC00` | `#FFD60A` | Cautions, highlights |

**Design Note:** These colors fluctuate between releases. Always use semantic names, never hardcoded hex values in production code.

**Source:** [Apple Color Guidelines](https://developer.apple.com/design/human-interface-guidelines/color)

---

### 1.2 Gray Colors (System Grays)

iOS provides 6 shades of gray for UI elements:

| Color Name | Light Mode (Hex) | Dark Mode (Hex) | Usage |
|------------|------------------|-----------------|-------|
| `systemGray` | `#8E8E93` | `#8E8E93` | Secondary text, placeholders |
| `systemGray2` | `#AEAEB2` | `#636366` | Dividers, subtle UI elements |
| `systemGray3` | `#C7C7CC` | `#48484A` | Tertiary fills |
| `systemGray4` | `#D1D1D6` | `#3A3A3C` | Quaternary fills |
| `systemGray5` | `#E5E5EA` | `#2C2C2E` | Backgrounds |
| `systemGray6` | `#F2F2F7` | `#1C1C1E` | Grouped backgrounds |

**Source:** [Apple HIG Colors - Figma](https://www.figma.com/community/file/1118467272498298301/apple-hig-colors-ios)

---

### 1.3 Label Colors (Text Hierarchy)

iOS defines semantic colors for text with built-in hierarchy:

| Color Name | Light Mode (RGBA) | Dark Mode (RGBA) | Usage |
|------------|-------------------|------------------|-------|
| `label` (primary) | `rgba(0, 0, 0, 0.85)` | `rgba(255, 255, 255, 0.85)` | Primary text content |
| `secondaryLabel` | `rgba(0, 0, 0, 0.55)` | `rgba(255, 255, 255, 0.55)` | Secondary text, subtitles |
| `tertiaryLabel` | `rgba(0, 0, 0, 0.30)` | `rgba(255, 255, 255, 0.30)` | Tertiary text, placeholders |
| `quaternaryLabel` | `rgba(0, 0, 0, 0.20)` | `rgba(255, 255, 255, 0.20)` | Disabled text |

**Contrast Ratios (WCAG Compliance):**
- Primary label: **6.5:1** (AA compliant for normal text)
- Secondary label: **4.5:1** (AA compliant minimum)
- Tertiary label: **3:1** (below AA, use for non-critical text only)
- Quaternary label: **2:1** (decorative only, not for readable text)

**Source:** [Apple Color Guidelines - Label Colors](https://developer.apple.com/design/human-interface-guidelines/color)

---

### 1.4 Fill Colors (Backgrounds & Fills)

iOS provides 4 levels of fill colors for backgrounds:

| Color Name | Light Mode (RGBA) | Dark Mode (RGBA) | Usage |
|------------|-------------------|------------------|-------|
| `systemFill` | `rgba(120, 120, 128, 0.20)` | `rgba(120, 120, 128, 0.36)` | Thin materials, fills |
| `secondarySystemFill` | `rgba(120, 120, 128, 0.16)` | `rgba(120, 120, 128, 0.32)` | Medium materials |
| `tertiarySystemFill` | `rgba(118, 118, 128, 0.12)` | `rgba(118, 118, 128, 0.24)` | Thick materials |
| `quaternarySystemFill` | `rgba(116, 116, 128, 0.08)` | `rgba(118, 118, 128, 0.18)` | Ultra thick materials |

**Usage Notes:**
- Use for button backgrounds, card fills, overlay backgrounds
- Automatically adapt to vibrancy and blur effects

---

### 1.5 Background Colors (Grouped & Layered)

iOS defines two sets of background colors for different UI patterns:

#### System Backgrounds (Flat Lists, Standard Views)

| Color Name | Light Mode (Hex) | Dark Mode (Hex) | Usage |
|------------|------------------|-----------------|-------|
| `systemBackground` | `#FFFFFF` | `#000000` | Primary background |
| `secondarySystemBackground` | `#F2F2F7` | `#1C1C1E` | Grouped content background |
| `tertiarySystemBackground` | `#FFFFFF` | `#2C2C2E` | Grouped content within grouped content |

#### Grouped Backgrounds (Grouped Table Views, Settings)

| Color Name | Light Mode (Hex) | Dark Mode (Hex) | Usage |
|------------|------------------|-----------------|-------|
| `systemGroupedBackground` | `#F2F2F7` | `#000000` | Grouped list background |
| `secondarySystemGroupedBackground` | `#FFFFFF` | `#1C1C1E` | Grouped list cells |
| `tertiarySystemGroupedBackground` | `#F2F2F7` | `#2C2C2E` | Grouped within grouped |

**Best Practice:** Use grouped backgrounds for Settings-style interfaces, system backgrounds for everything else.

**Source:** [iOS Visual Design - Color](https://codershigh.github.io/guidelines/ios/human-interface-guidelines/visual-design/color/index.html)

---

### 1.6 Separator Colors

| Color Name | Light Mode (RGBA) | Dark Mode (RGBA) | Usage |
|------------|-------------------|------------------|-------|
| `separator` | `rgba(60, 60, 67, 0.29)` | `rgba(84, 84, 88, 0.60)` | Standard 0.5pt hairline separator |
| `opaqueSeparator` | `#C6C6C8` | `#38383A` | Non-translucent separator (rare) |

**Hairline Separator Specification:**
- **Width:** 0.5pt (not 0.5px - use points on iOS)
- **Opacity:** ~29% in Light Mode, ~60% in Dark Mode
- **Position:** Typically inset 16pt from leading edge on lists

---

## 2. SF Pro Typography System

### 2.1 SF Pro Font Families

iOS uses the **San Francisco (SF)** font family designed specifically for Apple platforms:

| Font Family | Point Size Range | Usage |
|-------------|------------------|-------|
| **SF Pro Text** | 11pt - 19pt | Body text, UI elements, smaller sizes |
| **SF Pro Display** | 20pt+ | Large titles, headlines, display sizes |
| **SF Pro Rounded** | All sizes | Optional rounded variant for friendly UI |

**Critical:** SF Pro is NOT included in web browsers by default. Must use `-apple-system` CSS fallback.

**CSS Font Stack:**
```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
```

**Licensing:** SF Pro cannot be bundled in npm packages. Provide download instructions from [Apple Developer Fonts](https://developer.apple.com/fonts/).

**Source:** [Apple Typography Guidelines](https://developer.apple.com/design/human-interface-guidelines/typography)

---

### 2.2 iOS Text Styles (Dynamic Type)

iOS 16 defines **11 semantic text styles** that support Dynamic Type (user-controlled text scaling):

| Style | SF Pro Family | Size (Default) | Weight | Line Height | Letter Spacing | Usage |
|-------|---------------|----------------|--------|-------------|----------------|-------|
| **Large Title** | Display | 34pt | Regular (400) | 41pt | 0.37pt tracking | Page titles, navigation bar large titles |
| **Title 1** | Display | 28pt | Regular (400) | 34pt | 0.36pt tracking | Primary section headers |
| **Title 2** | Display | 22pt | Regular (400) | 28pt | 0.35pt tracking | Secondary section headers |
| **Title 3** | Display | 20pt | Regular (400) | 25pt | 0.38pt tracking | Tertiary section headers |
| **Headline** | Text | 17pt | Semibold (600) | 22pt | -0.41pt tracking | Emphasized body text, list headers |
| **Body** | Text | 17pt | Regular (400) | 22pt | -0.41pt tracking | Primary body text |
| **Callout** | Text | 16pt | Regular (400) | 21pt | -0.32pt tracking | Secondary body text, captions with detail |
| **Subheadline** | Text | 15pt | Regular (400) | 20pt | -0.24pt tracking | Tertiary body text, footnotes |
| **Footnote** | Text | 13pt | Regular (400) | 18pt | -0.08pt tracking | Timestamps, metadata, legal text |
| **Caption 1** | Text | 12pt | Regular (400) | 16pt | 0pt tracking | Image captions, minimal supporting text |
| **Caption 2** | Text | 11pt | Regular (400) | 13pt | 0.06pt tracking | Very small supporting text |

**Dynamic Type Scaling:**
- Users can adjust text size in Settings > Display & Brightness > Text Size
- Text styles scale from **xSmall** to **AX5** (accessibility size)
- Minimum: -3 levels smaller | Maximum: +5 levels larger (accessibility)

**Source:** [iOS 16 Typography - Design+Code](https://designcode.io/ios16-typography/)

---

### 2.3 Font Weights

SF Pro supports **9 font weights** (though iOS primarily uses 5):

| Weight Name | CSS Value | Usage in iOS |
|-------------|-----------|--------------|
| **Light** | 300 | Rare - large display text only |
| **Regular** | 400 | Default weight for most text |
| **Medium** | 500 | Rarely used in iOS native UI |
| **Semibold** | 600 | Headlines, emphasized text, button labels |
| **Bold** | 700 | Rarely used - too heavy for iOS aesthetic |

**Best Practice:** iOS primarily uses **Regular (400)** and **Semibold (600)**. Avoid Light (300) and Bold (700) for consistency with native iOS apps.

---

### 2.4 Line Heights & Letter Spacing

iOS uses **precise tracking (letter spacing)** values per text style:

**Line Height Formula:**
```
Line Height = Font Size × 1.2 (approximate, varies by style)
```

**Letter Spacing (Tracking):**
- **Display sizes (20pt+):** Positive tracking (0.35-0.38pt) - loosens letters
- **Text sizes (11-19pt):** Negative tracking (-0.41 to -0.08pt) - tightens letters
- **Rationale:** Larger text needs more breathing room, smaller text needs tighter spacing for readability

**CSS Implementation:**
```css
/* Large Title */
font-size: 34px;
line-height: 41px;
letter-spacing: 0.37px;

/* Body */
font-size: 17px;
line-height: 22px;
letter-spacing: -0.41px;
```

**Source:** [Apple Typography Guidelines - Line Height](https://developer.apple.com/design/human-interface-guidelines/typography)

---

## 3. Spacing & Layout System

### 3.1 iOS 8pt Grid System

iOS follows a **strict 8pt grid** for all spacing and sizing:

| Grid Unit | Value (pt) | Value (px @1x) | Usage |
|-----------|------------|----------------|-------|
| **1 unit** | 8pt | 8px | Base spacing increment |
| **2 units** | 16pt | 16px | Standard margin, padding |
| **2.5 units** | 20pt | 20px | Large margins (common on iPhone) |
| **3 units** | 24pt | 24px | Section spacing |
| **4 units** | 32pt | 32px | Large section spacing |
| **5 units** | 40pt | 40px | XL spacing |
| **6 units** | 48pt | 48px | XXL spacing |

**Key Rule:** All margins, padding, and element dimensions should be **multiples of 8pt**.

**Exception:** **Hairline separators (0.5pt)** are the only non-8pt-grid element.

**Source:** [iOS Design Guidelines - Spacing](https://ivomynttinen.com/blog/ios-design-guidelines/)

---

### 3.2 Standard Margins & Padding

iOS uses **consistent margins** across different UI patterns:

#### iPhone Standard Margins

| Location | Margin Value | Usage |
|----------|--------------|-------|
| **Leading/Trailing (List)** | 16pt | List content inset from screen edges |
| **Leading/Trailing (Full-width)** | 20pt | Full-width views, cards |
| **Top/Bottom (Content)** | 16pt | Content spacing between sections |
| **Between Elements** | 8pt | Spacing between related elements |
| **Form Field Spacing** | 12pt | Vertical spacing between form fields |
| **Button Height** | 44pt minimum | Minimum tap target (Apple HIG requirement) |

#### Grouped List Insets

| Element | Inset Value | Usage |
|---------|-------------|-------|
| **Grouped Section** | 16pt horizontal | Section inset from edges |
| **Cell Content** | 16pt leading | Text/icon inset within cell |
| **Disclosure Indicator** | 16pt trailing | Chevron inset from trailing edge |

**Source:** [Layout and Spacing - Design+Code](https://designcode.io/ios16-layout-spacing/)

---

### 3.3 Safe Area Insets

iOS devices have **non-rectangular screens** requiring safe area handling:

| Device | Top Inset | Bottom Inset | Leading Inset | Trailing Inset |
|--------|-----------|--------------|---------------|----------------|
| **iPhone 14 Pro (notch)** | 59pt | 34pt | 0pt | 0pt |
| **iPhone 14 (notch)** | 47pt | 34pt | 0pt | 0pt |
| **iPhone SE (no notch)** | 20pt (status bar) | 0pt | 0pt | 0pt |
| **iPhone 14 Pro Max** | 59pt | 34pt | 0pt | 0pt |

**Safe Area Zones:**
- **Top Safe Area:** Avoid notch/Dynamic Island and status bar
- **Bottom Safe Area:** Avoid home indicator (34pt on modern iPhones)
- **Leading/Trailing:** No safe area needed (unless landscape with notch)

**CSS Implementation (Web):**
```css
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
padding-left: env(safe-area-inset-left);
padding-right: env(safe-area-inset-right);
```

**Source:** [Apple HIG - Layout](https://developer.apple.com/design/human-interface-guidelines/)

---

### 3.4 Minimum Tap Targets

Apple requires **minimum tap target sizes** for accessibility:

| Element | Minimum Size | Recommended Size | Notes |
|---------|--------------|------------------|-------|
| **Button** | 44pt × 44pt | 48pt × 48pt | Golden rule of iOS |
| **Icon Button** | 44pt × 44pt | 44pt × 44pt | Icon can be smaller, tap area 44pt |
| **List Row** | Full width × 44pt | Full width × 48pt+ | Variable height OK if ≥44pt |
| **Segmented Control Segment** | 44pt height | 48pt height | Width variable |
| **Switch** | 51pt × 31pt | 51pt × 31pt | Standard iOS switch size |

**Critical:** Never make tap targets smaller than **44pt × 44pt** to pass App Store review.

---

## 4. Elevation & Shadows (iOS Style)

### 4.1 iOS Shadow System

**Key Difference:** iOS does NOT use Material Design elevation levels (1-24dp).

iOS uses **subtle shadows + blur effects** for depth:

| Element | Shadow Specification | Usage |
|---------|---------------------|-------|
| **Card / Modal** | `0 2pt 10pt rgba(0, 0, 0, 0.10)` | Floating cards, modals |
| **Action Sheet** | `0 0 40pt rgba(0, 0, 0, 0.20)` | Bottom action sheets |
| **Navigation Bar** | None (uses blur + separator) | Top navigation bar |
| **Tab Bar** | None (uses blur + separator) | Bottom tab bar |
| **Popover** | `0 10pt 40pt rgba(0, 0, 0, 0.25)` | Popovers, tooltips |

**iOS Shadow Formula:**
```css
box-shadow: [x-offset] [y-offset] [blur-radius] [color];
```

**Example:**
```css
/* Card shadow */
box-shadow: 0 2px 10px rgba(0, 0, 0, 0.10);

/* Modal shadow */
box-shadow: 0 10px 40px rgba(0, 0, 0, 0.20);
```

**Source:** [iOS Design Guidelines - Shadows](https://ivomynttinen.com/blog/ios-design-guidelines/)

---

### 4.2 Blur Effects (Vibrancy & Materials)

iOS uses **blur + vibrancy** extensively for depth and glassmorphism:

| Material Type | Blur Amount | Opacity | Usage |
|---------------|-------------|---------|-------|
| **Thin Material** | Light blur | 90% opacity | Notifications, widgets |
| **Regular Material** | Medium blur | 80% opacity | Sheets, cards |
| **Thick Material** | Heavy blur | 70% opacity | Modals, overlays |
| **Ultra Thick Material** | Very heavy blur | 60% opacity | Full-screen modals |

**CSS Backdrop Filter (Web):**
```css
/* iOS-style blur background */
backdrop-filter: blur(20px);
background: rgba(255, 255, 255, 0.80); /* 80% opacity white */
```

**Note:** Blur effects are computationally expensive. Use sparingly on web.

---

## 5. Border Radius & Corners

### 5.1 iOS Corner Radius System

iOS uses **generous corner radius** with continuous curve mathematics:

| Element | Corner Radius | Usage |
|---------|---------------|-------|
| **Button (Small)** | 8pt | Small buttons, pills |
| **Button (Medium)** | 10pt | Standard buttons |
| **Button (Large)** | 12pt | Large CTAs |
| **Card** | 10pt | Standard cards, cells |
| **Modal** | 12pt | Modals, sheets |
| **Image Thumbnail** | 6pt | Small thumbnails |
| **Avatar (Circle)** | 50% (full circle) | Profile avatars |
| **Grouped List Cell** | 10pt | Settings-style lists |

**Continuous Curves (Advanced):**
iOS uses **continuous corner curves** (not simple circular arcs). For web approximation, use standard border-radius.

**CSS Implementation:**
```css
/* Standard card */
border-radius: 10px;

/* Button */
border-radius: 10px;

/* Modal */
border-radius: 12px;

/* Avatar */
border-radius: 50%;
```

**Source:** [iOS Visual Design - Shapes](https://ivomynttinen.com/blog/ios-design-guidelines/)

---

### 5.2 Separator Lines

iOS uses **0.5pt hairline separators**:

| Property | Value | Notes |
|----------|-------|-------|
| **Width** | 0.5pt | Use points, not pixels |
| **Color** | `separator` color | rgba(60, 60, 67, 0.29) light mode |
| **Inset (List)** | 16pt leading | Aligns with cell content |
| **Inset (Full-width)** | 0pt | Full-width separators |

**CSS Implementation:**
```css
/* Hairline separator */
border-bottom: 0.5px solid rgba(60, 60, 67, 0.29);

/* Inset separator (list cell) */
border-bottom: 0.5px solid rgba(60, 60, 67, 0.29);
margin-left: 16px; /* Leading inset */
```

---

## 6. Design Token Structure

### 6.1 Recommended Token Hierarchy

For TypeScript implementation, organize tokens as:

```typescript
// colors.ts
export const colors = {
  system: {
    blue: '#007AFF',
    green: '#34C759',
    // ... all system colors
  },
  label: {
    primary: 'rgba(0, 0, 0, 0.85)',
    secondary: 'rgba(0, 0, 0, 0.55)',
    // ... label hierarchy
  },
  fill: {
    primary: 'rgba(120, 120, 128, 0.20)',
    secondary: 'rgba(120, 120, 128, 0.16)',
    // ... fill levels
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F2F2F7',
    // ... backgrounds
  },
  separator: 'rgba(60, 60, 67, 0.29)',
} as const;

// typography.ts
export const typography = {
  family: {
    text: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
    display: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
    rounded: '-apple-system, BlinkMacSystemFont, "SF Pro Rounded", sans-serif',
  },
  styles: {
    largeTitle: {
      fontSize: '34pt',
      fontWeight: 400,
      lineHeight: '41pt',
      letterSpacing: '0.37pt',
    },
    body: {
      fontSize: '17pt',
      fontWeight: 400,
      lineHeight: '22pt',
      letterSpacing: '-0.41pt',
    },
    // ... all text styles
  },
} as const;

// spacing.ts
export const spacing = {
  grid: 8, // Base 8pt grid
  margins: {
    standard: 16,
    large: 20,
  },
  padding: {
    small: 8,
    medium: 16,
    large: 24,
  },
  safeArea: {
    top: 'env(safe-area-inset-top)',
    bottom: 'env(safe-area-inset-bottom)',
  },
} as const;
```

---

## 7. Accessibility Considerations

### 7.1 WCAG Compliance

iOS color system is designed for **WCAG AA compliance**:

| Color Combination | Contrast Ratio | WCAG Level | Usage |
|-------------------|----------------|------------|-------|
| Primary label on white | 6.5:1 | AAA | Normal text |
| Secondary label on white | 4.5:1 | AA | Normal text |
| systemBlue on white | 4.6:1 | AA | Links, buttons |
| systemRed on white | 5.9:1 | AA | Error text |

**Validation Required:** Always test custom colors with contrast checker tools.

---

### 7.2 Dynamic Type Support

**Non-negotiable for iOS 16:** All text must support Dynamic Type scaling.

**Implementation:**
- Use semantic text styles (largeTitle, body, etc.)
- Never hardcode font sizes
- Test at all accessibility sizes (xSmall to AX5)
- Allow text to wrap, never truncate critical content

---

## 8. Key Takeaways

### 8.1 Design Principles

1. **Semantic Colors:** Use `systemBlue`, never hardcoded hex values
2. **SF Pro Typography:** SF Pro Text (≤19pt), SF Pro Display (≥20pt)
3. **8pt Grid:** All spacing in multiples of 8pt (except 0.5pt separators)
4. **Safe Areas:** Always respect top/bottom safe area insets
5. **44pt Minimum:** All tap targets must be ≥44pt × 44pt
6. **Subtle Shadows:** Use light shadows + blur, not Material elevation
7. **Dynamic Type:** Support user-controlled text scaling (xSmall to AX5)
8. **Continuous Curves:** Use generous corner radius (10-12pt)

---

### 8.2 Anti-Patterns (Avoid)

❌ **Hardcoded hex colors** - Use semantic color names
❌ **Hardcoded font sizes** - Use text styles with Dynamic Type
❌ **Material Design elevation** - Use iOS blur + subtle shadows
❌ **Arbitrary spacing** - Follow 8pt grid strictly
❌ **Tap targets <44pt** - Fails accessibility and App Store review
❌ **Bundling SF Pro font** - Licensing violation, use fallback stack
❌ **Ignoring safe areas** - Content hidden by notch/home indicator

---

## 9. Next Steps

### Phase 2: Component Inventory

Create comprehensive inventory of iOS 16 components mapped to these tokens:

- Navigation (Tab Bar, Navigation Bar, Toolbar, Segmented Control)
- Forms (Buttons, Text Fields, Toggles, Sliders)
- Lists (Plain, Inset, Grouped, Swipe Actions)
- Data Display (Cards, Badges, Status Indicators)
- Feedback (Action Sheets, Alerts, Activity Indicators, Progress Views)

**Deliverable:** `02-ios-component-inventory.md`

---

## 10. References

### Official Apple Resources

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Apple Typography Guidelines](https://developer.apple.com/design/human-interface-guidelines/typography)
- [Apple Color Guidelines](https://developer.apple.com/design/human-interface-guidelines/color)
- [SF Pro Font Download](https://developer.apple.com/fonts/)
- [SF Symbols App](https://developer.apple.com/sf-symbols/)

### Community Resources

- [iOS Design Guidelines - Ivo Mynttinen](https://ivomynttinen.com/blog/ios-design-guidelines/)
- [iOS 16 Typography - Design+Code](https://designcode.io/ios16-typography/)
- [iOS 16 Layout & Spacing - Design+Code](https://designcode.io/ios16-layout-spacing/)
- [Apple HIG Colors - Figma Community](https://www.figma.com/community/file/1118467272498298301/apple-hig-colors-ios)
- [Apple Typography Guidelines](https://median.co/blog/apples-ui-dos-and-donts-typography)

---

**Document Status:** ✅ Complete
**Next Document:** `02-ios-component-inventory.md`
**Author:** @ux-design-expert (Uma)
**Story:** 2.1 - iOS 16 Design System
**Phase:** 1 - Figma Analysis & Token Extraction (Tasks 1.1-1.4 Complete)
