# WCAG Criteria for Designers

**ID:** wcag-designer-criteria
**Version:** 1.0
**Purpose:** WCAG 2.2 criteria specifically relevant to designers (not developers), with designer-actionable guidance
**Maintained By:** @stephanie-walter

---

## Overview

Not all WCAG criteria require designer involvement. This reference focuses on the criteria where design decisions directly impact accessibility compliance. Each criterion includes what the designer must do, not what the developer must implement.

---

## Color Contrast Ratios

### WCAG 1.4.3 — Contrast (Minimum) — Level AA

**Requirement:** Sufficient contrast between text and its background.

| Text Type | Minimum Ratio | Examples |
|-----------|---------------|----------|
| Normal text (under 18pt / 24px) | 4.5:1 | Body copy, form labels, captions, table cells |
| Large text (18pt+ / 24px+ regular, or 14pt+ / 18.5px+ bold) | 3:1 | Headings, large button labels |
| Incidental text | No requirement | Disabled elements, decorative text, logos |

**Designer actions:**
- Verify all text/background color combinations in your palette against these ratios
- Document approved color pairings in the design system color usage guide
- Provide alternative text colors for light and dark backgrounds
- Use a contrast checker plugin in your design tool (Stark, A11y Color Contrast)
- Never approve a color combination below the minimum ratio

### WCAG 1.4.11 — Non-text Contrast — Level AA

**Requirement:** UI components and meaningful graphics must have 3:1 contrast against adjacent colors.

**Applies to:**
- Input field borders against the page background
- Icon color against its background (when the icon conveys meaning)
- Chart segments, data visualization elements
- Focus indicators (border or outline)
- Custom checkboxes, radio buttons, toggles

**Designer actions:**
- Measure input border color against page background (not just the input background)
- Ensure icons that convey information meet 3:1 (decorative icons are exempt)
- Verify chart colors are distinguishable at 3:1 from adjacent segments
- Design focus indicators that are visible on both light and dark contexts

---

## Text Sizing and Spacing

### WCAG 1.4.4 — Resize Text — Level AA

**Requirement:** Text can be resized up to 200% without loss of content or functionality.

**Designer actions:**
- Design layouts that accommodate text growing to 200% of its base size
- Use relative units (rem, em) in specifications, not fixed pixel sizes
- Ensure containers expand with their content (no fixed heights on text containers)
- Test designs at 200% zoom in the browser

### WCAG 1.4.12 — Text Spacing — Level AA

**Requirement:** Content must work with these text spacing overrides applied:
- Line height: at least 1.5x the font size
- Paragraph spacing: at least 2x the font size
- Letter spacing: at least 0.12x the font size
- Word spacing: at least 0.16x the font size

**Designer actions:**
- Design with minimum line-height of 1.5 for body text
- Avoid fixed-height containers that would clip text when spacing increases
- Allow for text reflow when letter and word spacing increases
- Test layouts with increased spacing to verify no content is lost

---

## Target Sizes

### WCAG 2.5.5 — Target Size (Minimum) — Level AA

**Requirement:** Interactive targets are at least 24x24 CSS pixels, or have sufficient spacing from adjacent targets.

### WCAG 2.5.8 — Target Size (Enhanced) — Level AAA

**Requirement:** Interactive targets are at least 44x44 CSS pixels.

**Designer actions:**
- Set minimum touch/click target size to 44x44px (recommended) or 24x24px (minimum)
- Add spacing between adjacent targets when the targets themselves are small
- Annotate target sizes in design deliverables
- Pay special attention to: icon buttons, close buttons, checkboxes, radio buttons, inline links in dense text

| Context | Minimum Target Size | Recommended |
|---------|---------------------|-------------|
| Mobile primary actions | 44x44px | 48x48px |
| Mobile secondary actions | 44x44px | 44x44px |
| Desktop primary actions | 24x24px | 32x32px+ |
| Desktop icon-only buttons | 24x24px | 32x32px+ |
| Inline text links | No minimum (text dictates) | Add padding |

---

## Focus Indicators

### WCAG 2.4.7 — Focus Visible — Level AA

**Requirement:** Keyboard focus indicator is visible on all interactive elements.

### WCAG 2.4.13 — Focus Appearance — Level AAA

**Requirement:** Focus indicator has specific minimum size and contrast.
- At least 2px thick perimeter around the element
- 3:1 contrast between focused and unfocused states

**Designer actions:**
- Design a custom focus indicator style for the design system (do not rely on browser defaults)
- Ensure the focus ring is visible on all background colors used in the application
- Specify focus indicator in design tokens (color, width, offset)
- Design focus styles for: buttons, links, inputs, cards, tabs, menu items
- Verify focus indicator contrast in both light and dark themes

| Focus Indicator Property | Minimum | Recommended |
|--------------------------|---------|-------------|
| Outline width | 2px | 2-3px |
| Outline offset | 0px | 2px |
| Contrast ratio | 3:1 | 3:1+ |
| Style | Solid | Solid or double |

---

## Error Identification

### WCAG 3.3.1 — Error Identification — Level A

**Requirement:** Errors are identified and described in text, not just by color or icon.

**Designer actions:**
- Design error states that include a text message, not just a red border
- Place error messages adjacent to the field that caused the error
- Use an error icon plus text (not icon alone)
- Define a consistent error message pattern for the design system

### WCAG 3.3.3 — Error Suggestion — Level AA

**Requirement:** Error messages suggest how to correct the problem.

**Designer actions:**
- Write error message copy that tells the user what to do, not just what went wrong
- Bad: "Invalid email" / Good: "Enter a valid email address (e.g., name@example.com)"
- Include format hints in labels or help text for constrained inputs
- Design the error state to show both the error and the expected format

---

## Sensory Characteristics

### WCAG 1.3.3 — Sensory Characteristics — Level A

**Requirement:** Instructions do not rely solely on shape, color, size, visual location, orientation, or sound.

**Designer actions:**
- Never write instructions like "Click the green button" or "See the sidebar on the right"
- Use element names in instructions: "Click the Submit button" or "See the Related Items section"
- When using color to categorize (e.g., status badges), always include a text label or icon
- In data visualizations, use patterns or labels in addition to color

---

## Content Reflow

### WCAG 1.4.10 — Reflow — Level AA

**Requirement:** Content reflows to fit a 320px wide viewport without horizontal scrolling (except for content that requires two-dimensional layout like data tables, maps, diagrams).

**Designer actions:**
- Design mobile layouts at 320px minimum width
- Ensure all content is accessible without horizontal scrolling at 320px
- Multi-column layouts must stack to a single column at narrow viewports
- Navigation must adapt for narrow viewports (hamburger menu, bottom nav)
- Tables may scroll horizontally, but provide an indication that scrolling is available

---

## Use of Color

### WCAG 1.4.1 — Use of Color — Level A

**Requirement:** Color is not the only visual means of conveying information.

**Designer actions:**
- Status indicators: use icon + color + text (not color alone)
- Form validation: use icon + text + border (not just red border)
- Links in text: underline or use bold + color (not just color)
- Charts and graphs: use patterns, labels, or different shapes + color
- Test by viewing designs in grayscale to verify information is still conveyed

| Common Pattern | Color Only (Fail) | Color + Additional (Pass) |
|----------------|-------------------|---------------------------|
| Error state | Red border only | Red border + error icon + error text |
| Required field | Red asterisk only | Asterisk + "(required)" text label |
| Link in paragraph | Blue text only | Blue text + underline |
| Success message | Green text only | Green text + checkmark icon |
| Chart segment | Different color only | Color + pattern + label |

---

## Designer Accessibility Toolkit

| Activity | When | Tool |
|----------|------|------|
| Check contrast ratios | During color selection | Stark, Contrast plugin, whocanuse.com |
| Simulate color blindness | After color decisions | Stark, Sim Daltonism |
| Verify target sizes | During component design | Ruler/measure tool in Figma |
| Annotate focus states | During handoff prep | Figma A11y annotation kit |
| Test at 320px reflow | During responsive design | Browser resize or Figma frame |
| Review in grayscale | After visual design | Desaturate filter in design tool |
