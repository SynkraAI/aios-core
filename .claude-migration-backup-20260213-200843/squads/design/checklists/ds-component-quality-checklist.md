# Component Quality Checklist

**Purpose:** Validate component before marking complete
**Agent:** Atlas (Design System Builder)
**Standard:** Production-ready React/TypeScript components

---

## CODE QUALITY

- [ ] TypeScript compiles with zero errors
- [ ] No `any` types used
- [ ] Props fully typed with interface
- [ ] All props documented with TSDoc comments
- [ ] Component exported correctly

---

## STYLING

- [ ] All styling uses tokens (zero hardcoded values)
- [ ] CSS Modules or chosen approach used consistently
- [ ] No inline styles
- [ ] Responsive design implemented (if needed)
- [ ] All variants styled correctly

---

## ACCESSIBILITY (WCAG AA MINIMUM)

- [ ] Semantic HTML elements used
- [ ] ARIA attributes present where needed
- [ ] Color contrast ≥4.5:1 for text
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Focus indicators visible
- [ ] Disabled state handled correctly
- [ ] Screen reader tested (or documented)

---

## TESTING

- [ ] Unit tests written
- [ ] All variants tested
- [ ] All sizes tested
- [ ] Disabled state tested
- [ ] Event handlers tested
- [ ] Test coverage >80%
- [ ] All tests pass

---

## DOCUMENTATION

- [ ] Component.md created
- [ ] Props documented with examples
- [ ] Variants explained
- [ ] Usage examples provided
- [ ] Accessibility notes included

---

## STORYBOOK (if enabled)

- [ ] Stories file created
- [ ] Story for each variant
- [ ] Interactive controls work
- [ ] Stories display correctly

---

**Reviewer:** ________ **Date:** ________
**Quality Gate:** [ ] PASS [ ] FAIL
