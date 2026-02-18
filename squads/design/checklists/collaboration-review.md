# Checklist: Collaboration Review

**ID:** collaboration-review
**Version:** 1.0
**Purpose:** Reviews collaboration quality covering the hot potato process, designer-developer handoff, feedback capture, iteration documentation, and stakeholder sign-off
**Agent:** @dan-mall
**Quality Gate:** WARNING

---

## Prerequisites

- [ ] Project involves at least one designer and one developer
- [ ] Collaboration workflow has been agreed upon by the team
- [ ] Shared tools are accessible to all collaborators (Figma, GitHub, Slack, etc.)
- [ ] Roles and responsibilities are understood by all participants

---

## Section 1: Hot Potato Process

- [ ] Work passes between designer and developer in short, iterative cycles
- [ ] No role holds the work for more than 2-3 days before passing it on
- [ ] Designer starts with low-fidelity concepts before high-fidelity polish
- [ ] Developer provides working prototype early for design feedback
- [ ] Design and code evolve together, not sequentially (waterfall)
- [ ] Both designer and developer feel ownership of the final output
- [ ] Handoff points between roles are lightweight, not ceremony-heavy

## Section 2: Designer-Developer Handoff

- [ ] Design specifications are clear and unambiguous
- [ ] Design files use the design system components and tokens (not custom one-offs)
- [ ] Spacing, sizing, and color values reference token names, not raw values
- [ ] Interactive states are documented (hover, focus, active, disabled, loading, error)
- [ ] Responsive behavior is specified for key breakpoints
- [ ] Edge cases are addressed in the design (long text, empty states, error states)
- [ ] Developer questions are answered within 24 hours
- [ ] Handoff includes annotations for accessibility (focus order, ARIA, alt text)

## Section 3: Feedback Capture

- [ ] Feedback is collected in a central, searchable location (not scattered across tools)
- [ ] Feedback includes context (screenshot, URL, or component reference)
- [ ] Feedback is categorized (bug, enhancement, question, design deviation)
- [ ] Feedback has a clear owner and expected response timeline
- [ ] Resolved feedback is marked as closed with the resolution documented
- [ ] Recurring feedback themes are identified and escalated to the design system team
- [ ] Feedback from usability testing is captured alongside team feedback

## Section 4: Iteration Documentation

- [ ] Design decisions and their rationale are recorded
- [ ] Rejected alternatives are documented with reasons for rejection
- [ ] Version history is maintained (Figma version history, Git log, or change log)
- [ ] Significant iterations are captured as before/after comparisons
- [ ] Trade-offs and compromises are documented for future reference
- [ ] Iteration reviews include both design and development perspectives

## Section 5: Stakeholder Sign-Off

- [ ] Stakeholders have been identified for the current deliverable
- [ ] Review criteria are defined before the review meeting
- [ ] Stakeholders receive a preview or demo before the sign-off meeting
- [ ] Sign-off is explicit and documented (not just silence = approval)
- [ ] Feedback from sign-off is captured and addressed or deferred with rationale
- [ ] Approved deliverables are locked from uncontrolled changes
- [ ] Post-sign-off changes require a documented change request process

---

## Scoring

| Category | Items | Pass | Status |
|----------|-------|------|--------|
| Hot Potato Process | 7 | _ | PENDING |
| Handoff | 8 | _ | PENDING |
| Feedback Capture | 7 | _ | PENDING |
| Iteration Documentation | 6 | _ | PENDING |
| Stakeholder Sign-Off | 7 | _ | PENDING |

**Minimum passing score:** 75%
**Blocking items:** Handoff items must all pass for quality collaboration
