# Accessibility WCAG AA Checklist

**Purpose:** Ensure WCAG AA compliance for design system components
**Agent:** Atlas (Design System Builder)
**Standard:** WCAG 2.1 Level AA (minimum)

---

## PERCEIVABLE

### Color & Contrast
- [ ] Text contrast ≥4.5:1 (normal text)
- [ ] Text contrast ≥3:1 (large text 18px+)
- [ ] UI controls contrast ≥3:1
- [ ] No color-only indicators (use icons + text)

### Alternative Text
- [ ] Images have alt text
- [ ] Decorative images use alt=""
- [ ] Icon buttons have aria-label

---

## OPERABLE

### Keyboard
- [ ] All interactive elements keyboard accessible
- [ ] Tab order logical
- [ ] Focus indicators visible (outline, ring, etc)
- [ ] No keyboard traps

### Navigation
- [ ] Skip links provided (if needed)
- [ ] Landmarks used (nav, main, aside)
- [ ] Headings hierarchical (h1 → h2 → h3)

---

## UNDERSTANDABLE

### Labels
- [ ] Form inputs have labels
- [ ] Labels associated with inputs (htmlFor/id)
- [ ] Required fields indicated
- [ ] Error messages clear and helpful

### States
- [ ] Disabled state indicated visually + aria-disabled
- [ ] Loading states announced
- [ ] Success/error states clear

---

## ROBUST

### ARIA
- [ ] Valid ARIA attributes only
- [ ] ARIA roles used correctly
- [ ] aria-label / aria-labelledby present
- [ ] aria-expanded for collapsible content
- [ ] aria-live for dynamic content

### HTML
- [ ] Valid semantic HTML
- [ ] No deprecated elements
- [ ] Proper nesting

---

**Testing Tools:**
- axe DevTools (browser extension)
- WAVE (web accessibility evaluation tool)
- Keyboard-only navigation
- Screen reader (NVDA, JAWS, VoiceOver)

**Result:** [ ] WCAG AA ✓ [ ] Issues Found

---

## Scoring

| Category | Items | Weight |
|----------|-------|--------|
| Perceivable — Color & Contrast | 4 | 20% |
| Perceivable — Alternative Text | 3 | 10% |
| Operable — Keyboard | 4 | 20% |
| Operable — Navigation | 3 | 10% |
| Understandable — Labels | 4 | 15% |
| Understandable — States | 3 | 10% |
| Robust — ARIA | 5 | 10% |
| Robust — HTML | 3 | 5% |

**Minimum passing score:** 85%
**Blocking items (MUST pass regardless of overall score):**
- Text contrast >=4.5:1 (normal text)
- All interactive elements keyboard accessible
- No keyboard traps
- Form inputs have labels

### Remediation Guide

| Failed Item | Fix |
|-------------|-----|
| Text contrast below 4.5:1 | Test with axe DevTools; adjust foreground/background colors using design tokens until ratio passes |
| Interactive element not keyboard accessible | Add `tabIndex={0}` and `onKeyDown` handler for Enter/Space; prefer native `<button>` over `<div onClick>` |
| Keyboard trap detected | Ensure focus can leave all modals/dropdowns via Escape key; add `onKeyDown` trap-escape handler |
| Missing form labels | Add `<label htmlFor={id}>` for every input; use `aria-label` only when visible label is not possible |
| Invalid ARIA attributes | Run axe DevTools scan; remove deprecated ARIA roles and fix mismatched aria-expanded/aria-controls references |
