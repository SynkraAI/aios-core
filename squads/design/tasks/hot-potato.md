# Task: Hot Potato Collaboration

**Task ID:** hot-potato
**Version:** 1.0
**Purpose:** Facilitate the Hot Potato collaborative design process between designers and developers for rapid iteration
**Agent:** @dan-mall
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Facilitates the Hot Potato collaborative design process where designers and developers rapidly pass work back and forth in short iteration cycles. Instead of traditional waterfall handoffs, both disciplines share ownership and provide real-time feedback, producing higher-quality output faster. This is based on Dan Mall's SuperFriendly methodology for breaking down silos between design and engineering.

```
INPUT (project brief, team roster, component scope)
    |
[PHASE 1: SETUP]
    -> Define participants, iteration cadence, and shared workspace
    |
[PHASE 2: ITERATION CYCLES]
    -> Run rapid pass-back rounds between designer and developer
    |
[PHASE 3: CONVERGENCE]
    -> Synthesize final output and document decisions
    |
OUTPUT: Polished component with shared design-dev ownership and decision log
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| project_brief | string | Yes | Description of what is being designed/built in this session |
| team_roster | list | Yes | Names and roles of participants (at least one designer, one developer) |
| component_scope | string | Yes | Specific component or feature being iterated on |
| iteration_duration | number | No | Minutes per pass; defaults to 30 |
| shared_workspace | string | No | URL or path to collaborative tool (Figma, CodeSandbox, etc.) |
| design_system_ref | string | No | Reference to existing design system for constraint alignment |

---

## Preconditions

- At least one designer and one developer are available for synchronous collaboration
- A shared workspace or tool is accessible by all participants and tested before the session
- The component scope is well-defined enough to begin work without extensive discovery
- Existing design tokens or brand guidelines are available for reference
- Stakeholders have agreed that the Hot Potato process is appropriate for this work
- Participants have blocked sufficient calendar time for the full session without interruptions
- Version control or history tracking is enabled in the shared workspace for rollback capability

---

## Steps

### Phase 1: Setup and Framing
1. Confirm all participants and their roles; assign initial "holder" of the potato (typically the designer starts)
2. Define the component scope boundaries: what is in and out of scope for this session; document explicit exclusions
3. Establish iteration cadence: duration per pass (recommended 20-30 minutes), total number of expected rounds (typically 3-5)
4. Set up the shared workspace with baseline assets (tokens, type scale, color palette, grid system)
5. Create a shared decision log document where each pass records what changed, why, and what question it answers
6. Align on "good enough" criteria so the team knows when convergence has been reached; define at least 3 measurable acceptance criteria
7. Review any relevant design system constraints, brand guidelines, or technical limitations before the first pass
8. Establish the communication protocol: how to signal "passing the potato," how to annotate questions, and how to flag blockers

### Phase 2: Iteration Cycles
1. **Round 1 — Designer pass**: Create initial visual exploration in the shared workspace; annotate open questions for the developer
2. **Round 1 — Developer pass**: Translate exploration into code; flag feasibility issues, propose alternatives, push back to designer
3. **Round 2 — Designer pass**: Refine based on developer feedback; adjust visual details, add interaction states, resolve open questions
4. **Round 2 — Developer pass**: Update implementation to match refinements; add responsive behavior, accessibility attributes
5. **Round N**: Continue passes until both parties agree the component meets the "good enough" criteria
6. After each pass, record decisions and trade-offs in the shared decision log
7. Timebox each pass strictly; if a participant gets stuck, they pass the potato with notes on blockers

### Phase 3: Convergence and Documentation
1. Review the final component together: visual fidelity, code quality, accessibility, responsive behavior
2. Conduct a side-by-side comparison of the design artifact and the code implementation to verify alignment
3. Document the final design decisions and the rationale behind key trade-offs in a structured decision record
4. Extract reusable patterns or tokens discovered during iteration into the design system backlog
5. Identify any new design tokens, spacing patterns, or interaction patterns that emerged during iteration
6. Create a summary of lessons learned: what worked, what slowed things down, process improvements for next session
7. Package the final component for integration: design file link, code repository PR, usage guidelines, and test cases
8. Schedule a follow-up check-in (1 week) to review the component in production context

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| component_artifact | code + design file | The finished component with both design and code representations |
| decision_log | markdown | Chronological record of each pass with decisions and rationale |
| iteration_summary | markdown | Summary of rounds completed, time spent, and convergence metrics |
| process_retro | markdown | Retrospective notes on Hot Potato effectiveness for this session |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Shared ownership | blocking | Both designer and developer must have contributed at least 2 passes each |
| Decision documentation | blocking | Every design decision must be recorded with rationale in the decision log |
| Convergence achieved | blocking | Final component must be approved by both designer and developer |
| Timebox adherence | warning | Each pass should not exceed the defined iteration duration by more than 50% |
| Accessibility check | warning | Final component should pass basic accessibility review (contrast, ARIA, keyboard) |
| Design system alignment | warning | Component should use existing tokens and patterns where available |

---

## Handoff

- **On completion:** Hand to @brad-frost for atomic design classification and design system integration
- **On CSS implementation needs:** Hand to @andy-bell for CUBE CSS architecture review
- **On UX structure questions:** Hand to @sophia-prater for object model validation
- **On issues:** Escalate to @design-chief

---

## Glossary

> Full glossary: [design-glossary.md](../data/design-glossary.md)

**Key terms for this task:**

- **Design tokens** — Platform-agnostic key-value pairs encoding design decisions
- **Design system** — Tokens, components, patterns, guidelines, and tooling for UI consistency
- **Component API** — Props interface defining how a component is consumed

---

## Don't Do

- Do not skip reading the full task specification before executing
- Do not create from scratch when similar patterns exist in the design system
- Do not hardcode values that should be design tokens
- Do not skip validation steps defined in the task workflow

