# Task: Design System Team Workshop

**Task ID:** team-workshop
**Version:** 1.0
**Purpose:** Facilitate a design system team workshop for alignment, priority setting, and roadmap creation
**Agent:** @dan-mall
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Facilitates a structured workshop that brings design system stakeholders together to align on vision, set priorities, create a roadmap, define roles, and select a collaboration model. Design systems are organizational products that require alignment across disciplines, and this workshop creates the foundation for effective collaboration. Based on Dan Mall's facilitation techniques from SuperFriendly's team-centric approach to design system work.

```
INPUT (participants, current challenges, workshop goals)
    |
[PHASE 1: ALIGNMENT]
    -> Run vision alignment, pain point mapping, and shared understanding exercises
    |
[PHASE 2: PRIORITIZATION]
    -> Facilitate priority setting, role definition, and collaboration model selection
    |
[PHASE 3: ROADMAP]
    -> Co-create actionable roadmap with milestones and ownership assignments
    |
OUTPUT: Workshop outputs with aligned vision, prioritized roadmap, and role assignments
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| participants | list | Yes | Names, roles, and teams of all workshop attendees |
| current_challenges | list | Yes | Top challenges the design system team or consuming teams face today |
| workshop_goals | string | Yes | What the workshop should achieve (e.g., "align on Q2 roadmap and roles") |
| duration | number | No | Workshop duration in hours; defaults to 4 |
| existing_roadmap | string | No | Current roadmap or backlog for reference and revision |
| remote_or_onsite | enum(remote, onsite, hybrid) | No | Workshop format; defaults to remote |

---

## Preconditions

- All key stakeholders (design, engineering, product, leadership) have confirmed attendance
- Workshop goals are shared with participants at least 48 hours before the session
- Collaboration tools are set up and tested (Miro, FigJam, or equivalent for exercises)
- Current pain points and challenges have been collected via pre-workshop survey
- A facilitator (this agent) has prepared all exercise templates and timing plans
- Pre-workshop survey results have been analyzed and used to tailor exercise focus areas
- A note-taker has been designated to capture decisions and action items in real time

---

## Steps

### Phase 1: Alignment Exercises
1. **Icebreaker (10 min)**: Each participant shares their one-sentence definition of what the design system means to their team
2. **Pain point mapping (20 min)**: Participants place their top 3 pain points on a shared board; facilitate affinity grouping to identify themes
3. **Vision alignment (30 min)**: Present 3 provocative "future state" scenarios; participants vote and discuss; converge on a shared vision statement
4. **Stakeholder empathy (20 min)**: Each role group (designers, developers, PMs) presents their top need from the design system to the other groups
5. **Current state assessment (15 min)**: Collaboratively score the design system's current state across 5 dimensions: components, documentation, governance, tooling, adoption
6. **Gap identification (15 min)**: Compare vision with current state; highlight the largest gaps that the workshop should prioritize

### Phase 2: Priority Setting and Role Definition
1. **Opportunity scoring (20 min)**: Rate each identified gap on impact (1-5) and effort (1-5); plot on an impact-effort matrix
2. **Priority voting (15 min)**: Each participant gets 5 votes to distribute across the opportunities; tally and rank
3. **Role definition (20 min)**: Define core roles needed on the design system team: lead, designer, developer, documentation, advocacy; map participants to roles
4. **Collaboration model selection (15 min)**: Present 3 models (centralized, federated, hybrid); discuss trade-offs; select the model that fits the organization
5. **Decision rights (15 min)**: Clarify who decides what: component API design, visual direction, contribution acceptance, deprecation, breaking changes
6. **Communication agreements (10 min)**: Agree on communication channels, meeting cadence, and async norms

### Phase 3: Roadmap Co-creation
1. **Theme definition (15 min)**: Group top priorities into 3-4 strategic themes for the roadmap period
2. **Milestone planning (20 min)**: For each theme, define 2-3 concrete milestones with target dates and dependencies
3. **Ownership assignment (15 min)**: Assign an owner and supporting contributors to each milestone; confirm capacity
4. **Dependency mapping (10 min)**: Identify dependencies between milestones and with external teams; flag risks and blockers
5. **Success criteria (10 min)**: Define measurable success criteria for each milestone that can be objectively verified
6. **Resource alignment (10 min)**: Confirm that the roadmap is achievable with available resources; identify gaps needing escalation
7. **Communication plan (5 min)**: Agree on how roadmap progress will be shared with broader stakeholders
8. **Next actions (10 min)**: Each participant commits to 2-3 specific actions they will take within the next week

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| vision_statement | markdown | Aligned design system vision statement co-created by the team |
| priority_matrix | markdown | Impact-effort matrix with ranked opportunities |
| role_assignments | markdown table | Team roles with assigned individuals and responsibilities |
| collaboration_model | markdown | Selected collaboration model with decision rights documentation |
| roadmap | markdown | Phased roadmap with milestones, owners, dates, and success criteria |
| action_items | markdown checklist | Immediate next actions with owners and deadlines |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Representation coverage | blocking | Workshop must include at least one participant from design, engineering, and product |
| Vision consensus | blocking | Vision statement must be agreed upon by all participants, not just majority |
| Roadmap completeness | blocking | Every milestone must have an owner, target date, and success criterion |
| Priority rationale | warning | Priority rankings should be documented with the reasoning behind them |
| Role coverage | warning | All defined roles should have at least one person assigned |
| Action item specificity | warning | Action items should be specific, time-bound, and assigned to a named individual |

---

## Handoff

- **On completion:** Hand to @nathan-curtis for governance model implementation based on workshop decisions
- **On component priorities:** Hand to @brad-frost for component architecture planning per the roadmap
- **On CSS architecture:** Hand to @andy-bell for technical foundation work identified in the roadmap
- **On UX alignment needs:** Hand to @sophia-prater for object model alignment with workshop priorities
- **On issues:** Escalate to @design-chief

---

## Glossary

> Full glossary: [design-glossary.md](../data/design-glossary.md)

**Key terms for this task:**

- **Governance model** — Rules for who can add/modify design system components and tokens
- **Versioning strategy** — How changes are versioned, communicated, and rolled out
- **Breaking change** — A modification that requires consumers to update their code
- **Contribution guide** — Process for proposing, reviewing, and approving new components or tokens

---

## Don't Do

- Do not skip the review process when adding components to the design system
- Do not introduce breaking changes without a documented migration path
- Do not assume governance rules are understood — document them explicitly with examples
- Do not modify shared components without notifying consuming teams

