# Accessibility Documentation Patterns

**ID:** a11y-documentation-patterns
**Version:** 1.0
**Purpose:** Patterns and templates for documenting accessibility requirements in design systems
**Maintained By:** @stephanie-walter

---

## Documentation Types Overview

| Documentation Type | Purpose | Audience | When Created | Format |
|-------------------|---------|----------|--------------|--------|
| Component A11y Spec | Define a11y requirements per component | Developers, QA | During component design | Markdown with tables |
| Design Annotation Guide | Standardize a11y annotations on mockups | Designers | Before handoff to dev | Visual guide |
| Handoff Checklist | Ensure a11y requirements are communicated | Designers, Devs | At design-to-dev handoff | Checklist |
| Testing Guide | Define how to verify a11y compliance | QA, Developers | After implementation | Step-by-step procedures |

---

## Pattern 1: Component Accessibility Spec

**Required sections per component:**

| Section | Content | Example |
|---------|---------|---------|
| **WCAG Criteria** | Applicable success criteria with level | 1.4.3 (AA), 2.1.1 (A), 4.1.2 (A) |
| **Semantic HTML** | Required element, role, attributes | `<button>` element; no `<div role="button">` |
| **ARIA Requirements** | ARIA attributes by variant | `aria-pressed` for toggle; `aria-expanded` for dropdown |
| **Keyboard Interaction** | Key-by-key behavior table | Enter/Space: activate; Tab: move focus |
| **Focus Management** | Focus order, trap, return rules | Focus returns to trigger when menu closes |
| **Screen Reader** | Expected announcements | "Submit, button" on focus; "pressed" on toggle |
| **Contrast** | Ratios per state | 4.5:1 label text; 3:1 focus indicator |
| **Motion** | Reduced motion behavior | Respects `prefers-reduced-motion` |
| **Known Limitations** | Browser-specific issues | VoiceOver does not announce `aria-busy` on Safari 16 |

---

## Pattern 2: Design Annotation Conventions

| Annotation Type | Visual Convention | When to Use |
|----------------|-------------------|-------------|
| **Tab order** | Numbered circles (1, 2, 3...) with arrows | Every interactive screen |
| **Heading levels** | "H1", "H2", "H3" labels next to text | Every page and modal |
| **Focus indicators** | Dotted blue outline around element | Custom focus styles |
| **ARIA labels** | Callout: "aria-label: Close dialog" | Icon buttons, decorative elements |
| **SR-only text** | Speaker icon callout: "SR: 3 items in cart" | Counts, status, dynamic content |
| **Landmarks** | Colored overlay: blue=nav, green=main, yellow=aside | Page-level layouts |
| **Alt text** | Callout: "Alt: Team celebrating launch" | Every meaningful image |
| **Live regions** | Red border with "LIVE" badge | Alerts, toasts, loading states |
| **Contrast ratios** | Label: "4.8:1 AA" | Text on backgrounds, UI elements |
| **Touch targets** | 24x24px or 44x44px bounding box | Mobile and touch interfaces |

**Figma layer organization:** Prefix all a11y annotation layers with `[a11y]` (e.g., `[a11y] Tab Order`, `[a11y] Headings`, `[a11y] ARIA`, `[a11y] Landmarks`).

---

## Pattern 3: Handoff Checklist

```markdown
# Accessibility Handoff — [Component/Page Name]

## Structure
- [ ] Heading levels specified (H1-H6)
- [ ] Landmark regions identified (nav, main, aside, footer)
- [ ] Reading order matches visual order

## Interactive Elements
- [ ] Tab order annotated
- [ ] Focus indicator design specified
- [ ] Keyboard behavior documented for custom controls

## Labels and Names
- [ ] Form fields have visible labels
- [ ] Icon-only buttons have aria-label
- [ ] Images have alt text or marked decorative
- [ ] Link text is descriptive (no "click here")

## Dynamic Content
- [ ] Loading states have aria-busy or sr-only announcements
- [ ] Errors associated with fields (aria-describedby)
- [ ] Toast/alert live region behavior specified
- [ ] Modal focus trap and return documented

## Visual
- [ ] Contrast verified (4.5:1 text, 3:1 UI)
- [ ] Info not conveyed by color alone
- [ ] Touch targets >= 24x24px (AA) or 44x44px (AAA)
- [ ] Reduced motion alternatives specified
```

---

## Pattern 4: Testing Guide

**Automated:** Run axe-core in browser and unit tests; check Storybook a11y panel; expect zero critical violations.

**Keyboard:** Tab through all interactive elements; verify focus visibility, Enter/Space activation, Escape dismissal, no keyboard traps.

**Screen Reader:** Test with VoiceOver (macOS) or NVDA (Windows); verify role, name, and state announcements; check error and status announcements.

**Visual:** Zoom to 200% (no clipping); apply 1.5x text spacing (no overlap); enable High Contrast Mode; simulate color blindness; verify focus ring contrast >= 3:1.

---

## Examples from Known Design Systems

| Design System | Approach | Notable Pattern |
|--------------|----------|-----------------|
| **Salesforce SLDS** | Per-component a11y tab with keyboard + ARIA tables | Structured key-action tables per variant |
| **IBM Carbon** | A11y tab per component + separate testing guide | Do/don't examples with testing procedures |
| **UK Gov Design System** | A11y section per component with WCAG mapping | Real user testing findings included in docs |
| **US Web Design System** | A11y section per component + standalone guide | Plain-language guidance for non-specialists |
| **Atlassian** | Inclusive design embedded throughout | A11y normalized as quality, not isolated |
| **Microsoft Fluent** | Best practices page + per-component ARIA patterns | Links to WAI-ARIA Authoring Practices |

**Key lessons:** Structured tables (SLDS, Carbon) are most scannable for devs. Real user testing results (UK Gov) build trust. Plain language (USWDS) increases adoption. Embedding a11y everywhere (Atlassian) normalizes it.

---

## Quick-Start Template: Component A11y Spec

Use sections: WCAG Criteria (table: criterion, level, requirement), Semantic HTML (element and role), ARIA Attributes (table: attribute, value, when), Keyboard (table: key, behavior), Screen Reader (table: event, announcement), States (table: state, visual, accessible).

---

## References

- W3C WAI-ARIA Authoring Practices (w3.org/WAI/ARIA/apg)
- Stephanie Walter, "A Designer's Guide to Documenting Accessibility"
- Sarah Higley, "Accessibility in Design Systems"
- Salesforce Lightning Design System (lightningdesignsystem.com)
- IBM Carbon Accessibility (carbondesignsystem.com/guidelines/accessibility)
- UK Government Design System (design-system.service.gov.uk)
- US Web Design System (designsystem.digital.gov)
