# Checklist: UI Pattern Review

**ID:** pattern-review
**Version:** 1.0
**Purpose:** Reviews UI pattern quality covering correct identification, contextual usage, interaction conventions, feedback clarity, error handling, and responsive adaptation
**Agent:** @jenifer-tidwell
**Quality Gate:** WARNING

---

## Prerequisites

- [ ] The UI pattern has been identified by name and category
- [ ] The context in which the pattern is used has been documented
- [ ] Reference implementation or design mockup is available
- [ ] Pattern catalog entry exists or is being created alongside this review

---

## Section 1: Pattern Identification

- [ ] Pattern is correctly identified from the established catalog (e.g., "Wizard" not "Multi-Step Form")
- [ ] Pattern name matches industry-standard terminology
- [ ] Pattern category is correct (Navigation, Input, Display, Feedback)
- [ ] Similar patterns have been considered and the best fit is justified
- [ ] Pattern description matches its actual implementation behavior
- [ ] Pattern has been documented in the pattern catalog with examples
- [ ] Anti-patterns (what this is NOT) are noted

## Section 2: Contextual Usage

- [ ] Pattern is used in a context where it solves the intended user problem
- [ ] User's mental model aligns with the pattern's interaction model
- [ ] Pattern is not forced into a context where a simpler solution would suffice
- [ ] The number of items/options is appropriate for the pattern (e.g., tabs with 2-7 items)
- [ ] Pattern is consistent with how it is used elsewhere in the application
- [ ] Usage does not conflict with platform conventions (web vs mobile vs desktop)
- [ ] Edge cases for the context are identified and handled

## Section 3: Interaction Conventions

- [ ] Primary interaction follows the expected convention (click, drag, type, scroll)
- [ ] Interaction affordances are visually clear (buttons look clickable, links look tappable)
- [ ] Hover states provide appropriate preview or feedback
- [ ] Double-click, long-press, or gesture interactions follow platform norms
- [ ] Interaction speed and responsiveness meet user expectations (< 100ms for feedback)
- [ ] Undo capability exists for destructive or significant actions
- [ ] Progressive disclosure is used to manage complexity

## Section 4: Feedback Clarity

- [ ] User receives immediate visual feedback on interaction (< 100ms)
- [ ] Loading states clearly indicate that processing is occurring
- [ ] Success states confirm action completion with specific messaging
- [ ] State transitions are smooth and communicative (not jarring)
- [ ] Empty states provide guidance on how to populate or proceed
- [ ] Feedback messages are written in plain, user-friendly language
- [ ] Feedback is perceivable by assistive technology

## Section 5: Error Handling

- [ ] Error states are visually distinct from success and neutral states
- [ ] Error messages explain what went wrong in user terms
- [ ] Error messages suggest how to fix the problem
- [ ] Validation errors appear near the relevant input field
- [ ] Inline validation provides real-time feedback where appropriate
- [ ] Recovery path is clear — user knows how to proceed after an error
- [ ] Catastrophic errors (network, server) have a graceful fallback

## Section 6: Responsive Adaptation

- [ ] Pattern adapts appropriately to mobile viewport (< 640px)
- [ ] Pattern adapts appropriately to tablet viewport (640-1024px)
- [ ] Pattern adapts appropriately to desktop viewport (> 1024px)
- [ ] Touch targets are adequately sized on touch devices (44x44px minimum)
- [ ] Pattern does not rely on hover-only interactions on touch devices
- [ ] Content priority is maintained when space is reduced
- [ ] Responsive adaptation does not lose functionality or information

---

## Scoring

| Category | Items | Pass | Status |
|----------|-------|------|--------|
| Pattern Identification | 7 | _ | PENDING |
| Contextual Usage | 7 | _ | PENDING |
| Interaction Conventions | 7 | _ | PENDING |
| Feedback Clarity | 7 | _ | PENDING |
| Error Handling | 7 | _ | PENDING |
| Responsive Adaptation | 7 | _ | PENDING |

**Minimum passing score:** 80%
**Blocking items:** Error Handling items must all pass
