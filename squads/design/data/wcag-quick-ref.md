# WCAG 2.2 Quick Reference for Designers

**ID:** wcag-quick-ref
**Version:** 1.0
**Purpose:** Quick reference of WCAG 2.2 success criteria most relevant to design system work, organized by principle
**Maintained By:** @heydon-pickering

---

## Principle 1: Perceivable

Information and user interface components must be presentable to users in ways they can perceive.

| Criterion | Name | Level | Designer Impact | Common Failure | Quick Test |
|-----------|------|-------|-----------------|----------------|------------|
| 1.1.1 | Non-text Content | A | Specify alt text for all images | Missing alt text on icons and images | Check every image/icon for alt specification |
| 1.3.1 | Info and Relationships | A | Ensure visual hierarchy maps to semantic structure | Heading levels skipped or used for styling | Verify heading outline matches visual hierarchy |
| 1.3.3 | Sensory Characteristics | A | Do not rely on shape, size, or position alone | "Click the round button" or "see sidebar" | Remove visual context — does instruction still work? |
| 1.3.4 | Orientation | AA | Support both portrait and landscape | Locking to portrait only | Rotate device and verify layout works |
| 1.3.5 | Identify Input Purpose | AA | Use correct input types for autofill | Generic text fields for name, email, phone | Verify autocomplete attributes in spec |
| 1.4.1 | Use of Color | A | Never convey info by color alone | Red-only error indication | View in grayscale — is info still clear? |
| 1.4.3 | Contrast (Minimum) | AA | 4.5:1 for text, 3:1 for large text | Low-contrast placeholder text | Use contrast checker tool |
| 1.4.4 | Resize Text | AA | Text scales to 200% without loss | Fixed containers that clip on zoom | Zoom to 200% and check for overflow |
| 1.4.5 | Images of Text | AA | Use real text, not images of text | Logos with text baked into images | Verify all text is selectable |
| 1.4.10 | Reflow | AA | Content reflows at 320px without horizontal scroll | Horizontal scrolling at mobile widths | Resize to 320px and scroll only vertically |
| 1.4.11 | Non-text Contrast | AA | UI components and graphics need 3:1 contrast | Low-contrast input borders, icons | Measure contrast of UI elements against background |
| 1.4.12 | Text Spacing | AA | Content works with increased text spacing | Fixed-height containers that clip text | Apply 1.5x line height, 2x letter spacing |
| 1.4.13 | Content on Hover or Focus | AA | Tooltips must be dismissible and persistent | Tooltips that vanish on mouse move | Hover tooltip, move mouse to it — does it stay? |

---

## Principle 2: Operable

User interface components and navigation must be operable.

| Criterion | Name | Level | Designer Impact | Common Failure | Quick Test |
|-----------|------|-------|-----------------|----------------|------------|
| 2.1.1 | Keyboard | A | All functionality via keyboard | Custom controls only work with mouse | Tab through entire page — can you do everything? |
| 2.1.2 | No Keyboard Trap | A | User can always Tab away | Modal with no close mechanism via keyboard | Open every overlay and try to Escape/Tab out |
| 2.4.1 | Bypass Blocks | A | Provide skip navigation link | No way to skip past header/nav | Check for "Skip to main content" link |
| 2.4.2 | Page Titled | A | Each page has a unique, descriptive title | Generic "Home" or missing titles | Check browser tab for descriptive title |
| 2.4.3 | Focus Order | A | Tab order matches visual reading order | Tab jumps around the page randomly | Tab through and verify order makes sense |
| 2.4.4 | Link Purpose | A | Link text describes destination | "Click here" or "Read more" alone | Read link text out of context — is it clear? |
| 2.4.6 | Headings and Labels | AA | Headings and labels describe their content | Vague headings like "Section 1" | Read all headings — do they describe content? |
| 2.4.7 | Focus Visible | AA | Focus indicator is clearly visible | Default browser outline removed with no replacement | Tab to each element — can you see the focus? |
| 2.4.11 | Focus Not Obscured (Min) | AA | Focused element is not fully hidden | Sticky header covers focused element | Tab through with sticky headers present |
| 2.4.12 | Focus Not Obscured (Enhanced) | AAA | Focused element is fully visible | Partial coverage by overlays | Verify full visibility of every focused element |
| 2.4.13 | Focus Appearance | AAA | Focus indicator is 2px+ and 3:1 contrast | Thin or low-contrast focus ring | Measure focus indicator thickness and contrast |
| 2.5.5 | Target Size (Minimum) | AA | Interactive targets are at least 24x24px | Small icons or links that are hard to tap | Measure target dimensions |
| 2.5.8 | Target Size (Enhanced) | AAA | Interactive targets are at least 44x44px | Tight button groups on mobile | Measure all interactive element sizes |

---

## Principle 3: Understandable

Information and the operation of user interface must be understandable.

| Criterion | Name | Level | Designer Impact | Common Failure | Quick Test |
|-----------|------|-------|-----------------|----------------|------------|
| 3.1.1 | Language of Page | A | Page language is set correctly | Missing lang attribute on HTML | Check page source for lang attribute |
| 3.1.2 | Language of Parts | AA | Non-default language sections are marked | French quote in English page unmarked | Identify foreign-language content in design |
| 3.2.1 | On Focus | A | No unexpected changes on focus | Page navigates or modal opens on Tab | Focus each element — does context change? |
| 3.2.2 | On Input | A | No unexpected changes on input | Form submits on radio button selection | Change inputs — does anything unexpected happen? |
| 3.2.3 | Consistent Navigation | AA | Navigation is in the same location across pages | Nav moves between header and sidebar | Compare navigation position across 5+ pages |
| 3.2.4 | Consistent Identification | AA | Same function has same label everywhere | "Search" vs "Find" vs "Look up" for same action | Audit labels for the same function across pages |
| 3.3.1 | Error Identification | A | Errors are identified and described in text | Red border only, no text message | Trigger errors — is there a text description? |
| 3.3.2 | Labels or Instructions | A | Form fields have visible labels | Placeholder-only labels that disappear | Check every input has a persistent label |
| 3.3.3 | Error Suggestion | AA | Error messages suggest corrections | "Invalid input" without guidance | Read error messages — do they help fix it? |
| 3.3.4 | Error Prevention (Legal) | AA | Confirm/review for legal or financial actions | No confirmation for purchase or deletion | Test destructive/financial actions for confirmation |
| 3.3.7 | Redundant Entry | A | Do not ask for the same info twice | Asking for address in shipping AND billing | Review forms for repeated questions |
| 3.3.8 | Accessible Authentication | A | No cognitive function test for login | CAPTCHA with no alternative | Test login flow for cognitive barriers |

---

## Principle 4: Robust

Content must be robust enough to be interpreted by a wide variety of user agents, including assistive technologies.

| Criterion | Name | Level | Designer Impact | Common Failure | Quick Test |
|-----------|------|-------|-----------------|----------------|------------|
| 4.1.2 | Name, Role, Value | A | Custom controls have correct roles and names | Custom dropdown with no ARIA | Test custom controls with a screen reader |
| 4.1.3 | Status Messages | AA | Status updates are announced without focus change | Success toast not announced to SR | Trigger status message — does SR announce it? |

---

## Quick Reference: Contrast Ratios

| Element Type | Minimum Ratio | Level | Example |
|-------------|---------------|-------|---------|
| Normal text (< 18pt) | 4.5:1 | AA | Body copy, labels, captions |
| Large text (>= 18pt or 14pt bold) | 3:1 | AA | Headings, large buttons |
| UI components | 3:1 | AA | Input borders, icons, focus rings |
| Enhanced text contrast | 7:1 | AAA | Maximum readability |
| Incidental or decorative | None | - | Disabled elements, logos |

---

## Testing Tools

| Tool | Purpose | Cost |
|------|---------|------|
| axe DevTools | Automated WCAG testing in browser | Free / Paid |
| WAVE | Visual overlay of accessibility issues | Free |
| Colour Contrast Analyser | Precise contrast measurement | Free |
| NVDA | Screen reader testing (Windows) | Free |
| VoiceOver | Screen reader testing (macOS/iOS) | Built-in |
| Stark (Figma plugin) | Contrast and simulation in design tool | Free / Paid |
