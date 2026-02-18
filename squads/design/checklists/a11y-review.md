# Checklist: Accessibility Review

**ID:** a11y-review
**Version:** 1.0
**Purpose:** Comprehensive accessibility review covering keyboard navigation, screen readers, ARIA, color contrast, focus management, motion, and error states
**Agent:** @heydon-pickering
**Quality Gate:** BLOCKING

---

## Prerequisites

- [ ] Component or page is in a testable state (rendered in browser or Storybook)
- [ ] Automated a11y scan has been run (axe-core, Lighthouse, or equivalent)
- [ ] Target WCAG conformance level has been defined (AA recommended minimum)
- [ ] Testing devices and assistive technologies have been identified

---

## Section 1: Keyboard Navigation

- [ ] All interactive elements are reachable via Tab key in logical order
- [ ] Tab order follows visual reading order (left-to-right, top-to-bottom)
- [ ] Enter or Space activates buttons and links
- [ ] Escape closes modals, dropdowns, tooltips, and overlays
- [ ] Arrow keys navigate within composite widgets (tabs, menus, radio groups)
- [ ] No keyboard traps exist — user can always Tab away from any element
- [ ] Skip links are present for bypassing repetitive navigation
- [ ] Custom keyboard shortcuts do not conflict with browser or AT shortcuts

## Section 2: Screen Reader Announcements

- [ ] Page has a descriptive and unique title element
- [ ] Headings form a logical hierarchy (h1 through h6, no skipped levels)
- [ ] Images have meaningful alt text or are marked decorative (alt="")
- [ ] Form inputs have associated visible labels (label element or aria-labelledby)
- [ ] Dynamic content changes are announced via aria-live regions
- [ ] Status messages use role="status" or aria-live="polite"
- [ ] Tables have proper th scope attributes for row and column headers
- [ ] Links and buttons have distinguishable accessible names

## Section 3: ARIA Roles and Attributes

- [ ] ARIA roles are used only when no native HTML element provides the semantics
- [ ] All required ARIA attributes are present for each role (e.g., aria-expanded for disclosure)
- [ ] aria-hidden="true" is not applied to focusable or visible content
- [ ] aria-label or aria-labelledby is used for elements without visible text
- [ ] aria-describedby links supplementary descriptions to their elements
- [ ] Role values are valid ARIA roles (no misspellings or custom values)
- [ ] ARIA states (aria-checked, aria-selected, aria-pressed) update dynamically

## Section 4: Color and Contrast

- [ ] Normal text meets 4.5:1 contrast ratio against its background
- [ ] Large text (18pt+ or 14pt bold+) meets 3:1 contrast ratio
- [ ] UI components and graphical objects meet 3:1 contrast against adjacent colors
- [ ] Focus indicators meet 3:1 contrast against surrounding pixels
- [ ] Information is not conveyed by color alone (use icons, patterns, text labels)
- [ ] Links are distinguishable from surrounding text (underline or 3:1 contrast + non-color indicator)
- [ ] High contrast mode does not break layout or hide content

## Section 5: Focus Management

- [ ] Focus indicator is visible on all interactive elements
- [ ] Custom focus styles meet 3:1 contrast and 2px minimum thickness
- [ ] Focus moves to modal/dialog content when opened
- [ ] Focus returns to trigger element when modal/dialog is closed
- [ ] Focus is not lost when content is dynamically added or removed
- [ ] Programmatic focus (via JavaScript) is used appropriately and sparingly
- [ ] Autofocus is used only when it improves the user experience

## Section 6: Motion and Animation

- [ ] prefers-reduced-motion media query is respected
- [ ] Animations have a duration under 5 seconds or can be paused/stopped
- [ ] No content flashes more than 3 times per second
- [ ] Parallax scrolling or decorative motion can be disabled
- [ ] Auto-playing media has pause, stop, or hide controls
- [ ] Motion is not required to understand content or complete tasks

## Section 7: Error States and Forms

- [ ] Error messages are specific and actionable (not just "invalid input")
- [ ] Errors are associated with their input via aria-describedby or aria-errormessage
- [ ] Error messages are announced to screen readers on appearance
- [ ] Required fields are indicated both visually and programmatically (aria-required)
- [ ] Form validation does not rely solely on color changes
- [ ] Users can review and correct submissions before final action
- [ ] Success confirmation is announced to assistive technology

---

## Scoring

| Category | Items | Pass | Status |
|----------|-------|------|--------|
| Keyboard Navigation | 8 | _ | PENDING |
| Screen Reader | 8 | _ | PENDING |
| ARIA Roles | 7 | _ | PENDING |
| Color and Contrast | 7 | _ | PENDING |
| Focus Management | 7 | _ | PENDING |
| Motion and Animation | 6 | _ | PENDING |
| Error States and Forms | 7 | _ | PENDING |

**Minimum passing score:** 90%
**Blocking items:** All Keyboard Navigation and Color/Contrast items are mandatory pass
