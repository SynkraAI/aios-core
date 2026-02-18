# Checklist: Component Review

**ID:** component-review
**Version:** 1.0
**Purpose:** Reviews component quality across atomic classification, naming, props, states, responsiveness, accessibility, documentation, and testing
**Agent:** @brad-frost
**Quality Gate:** BLOCKING

---

## Prerequisites

- [ ] Component has been designed and approved in design tool
- [ ] Component specification document exists
- [ ] Atomic level classification has been proposed
- [ ] Component has at least one working implementation

---

## Section 1: Atomic Classification

- [ ] Component is classified at the correct atomic level (atom, molecule, organism, template, page)
- [ ] Atoms contain no child components — only native HTML elements or tokens
- [ ] Molecules are composed only of atoms and native elements
- [ ] Organisms are composed of molecules and/or atoms with distinct section-level purpose
- [ ] Templates define layout structure without real content
- [ ] No component skips an atomic level (e.g., atom containing an organism)

## Section 2: Naming Conventions

- [ ] Component name is descriptive and intention-revealing
- [ ] Name follows PascalCase for components (e.g., ButtonPrimary, CardHeader)
- [ ] Name avoids visual descriptions (no RedButton, BigHeader)
- [ ] Name avoids abbreviations unless universally understood
- [ ] Filename matches component name exactly
- [ ] Folder structure follows atomic hierarchy (atoms/, molecules/, organisms/)

## Section 3: Props and API

- [ ] Props are well-typed with TypeScript interfaces or PropTypes
- [ ] Required vs optional props are clearly distinguished
- [ ] Default values are sensible and documented
- [ ] Prop names follow consistent conventions (e.g., isDisabled not disabled)
- [ ] Callback props follow onAction naming (onClick, onChange)
- [ ] No excessive prop drilling — composition preferred over configuration
- [ ] Component accepts className or style override for customization

## Section 4: States and Variants

- [ ] Default state is clearly defined
- [ ] Hover state is implemented and visually distinct
- [ ] Focus state is visible and meets a11y requirements
- [ ] Active/pressed state exists for interactive components
- [ ] Disabled state is implemented with proper aria-disabled
- [ ] Loading state exists where applicable
- [ ] Error state is implemented with clear messaging
- [ ] Empty state is handled gracefully

## Section 5: Responsive Behavior

- [ ] Component renders correctly at mobile breakpoint (< 640px)
- [ ] Component renders correctly at tablet breakpoint (640-1024px)
- [ ] Component renders correctly at desktop breakpoint (> 1024px)
- [ ] No horizontal overflow at any breakpoint
- [ ] Touch targets are at least 44x44px on mobile
- [ ] Text remains readable without horizontal scrolling

## Section 6: Accessibility

- [ ] Correct semantic HTML element is used (button, a, nav, etc.)
- [ ] ARIA roles are applied only when native semantics are insufficient
- [ ] Component is keyboard navigable (Tab, Enter, Escape, Arrow keys as needed)
- [ ] Screen reader announces component purpose and state
- [ ] Color contrast meets WCAG 2.2 AA (4.5:1 text, 3:1 UI)
- [ ] Focus indicator is visible and meets 3:1 contrast

## Section 7: Documentation

- [ ] Component has a description of its purpose and when to use it
- [ ] Props/API table is complete with types, defaults, and descriptions
- [ ] Usage examples cover primary use cases
- [ ] Do/Don't guidance is provided
- [ ] Accessibility notes are documented
- [ ] Changelog tracks breaking changes

## Section 8: Testing

- [ ] Unit tests cover core logic and prop variations
- [ ] Visual regression snapshot exists for each major state
- [ ] Accessibility automated tests pass (axe-core or equivalent)
- [ ] Integration test verifies composition with parent components
- [ ] Tests cover edge cases (empty content, long text, missing props)

---

## Scoring

| Category | Items | Pass | Status |
|----------|-------|------|--------|
| Atomic Classification | 6 | _ | PENDING |
| Naming Conventions | 6 | _ | PENDING |
| Props and API | 7 | _ | PENDING |
| States and Variants | 8 | _ | PENDING |
| Responsive Behavior | 6 | _ | PENDING |
| Accessibility | 6 | _ | PENDING |
| Documentation | 6 | _ | PENDING |
| Testing | 5 | _ | PENDING |

**Minimum passing score:** 85%
**Blocking items:** All Accessibility and Atomic Classification items are mandatory pass
