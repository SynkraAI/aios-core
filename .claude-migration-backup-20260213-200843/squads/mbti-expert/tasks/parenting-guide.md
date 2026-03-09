<!--
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                                                                              ║
║              ┌───────┐                                                       ║
║              │  ___  │                                                       ║
║              │ (o o) │          ┌───────┐                                     ║
║              │  \_/  │          │  ___  │                                     ║
║              │       │    ~~    │ (o o) │                                     ║
║              └───┬───┘   /  \  │  \_/  │                                     ║
║            ┌─────┴─────┐/    \┌┴───────┴┐                                    ║
║            │           ├──────┤         │                                    ║
║            │  PARENT   │ LOVE │  CHILD  │                                    ║
║            │           ├──────┤         │                                    ║
║            └─────┬─────┘      └────┬────┘                                    ║
║                  │    ╔════════╗    │                                         ║
║               ┌──┴──┐ ║ GUIDE ║ ┌──┴──┐                                      ║
║               │ /|\ │ ╚════════╝ │     │                                      ║
║               │/ | \│            │  /\ │                                      ║
║               │  |  │            │ /  \│                                      ║
║               │ / \ │            │/    │                                      ║
║               └─────┘            └─────┘                                      ║
║                                                                              ║
║          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~                    ║
║          ~  Nurturing growth, type by type             ~                    ║
║          ~  Understanding your child through the lens  ~                    ║
║          ~  of personality                             ~                    ║
║          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~                    ║
║                                                                              ║
║   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒   ║
║   ▒  MBTI Expert Squad  ·  Parenting Guide Task  ·  Data-Lookup Engine   ▒   ║
║   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒   ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
-->

# Task: Parenting Guide

Parenting advice by type and child developmental stage.

<!-- ┌─────────────────────────────────────────────────────────────┐ -->
<!-- │                    M E T A D A T A                          │ -->
<!-- └─────────────────────────────────────────────────────────────┘ -->

---

## Metadata
- **task-id:** parenting-guide
- **agent:** mbti-expert
- **elicit:** true
- **execution_type:** data-lookup
- **params:**
  - type: string (required) — Parent's type
  - stage: string (optional) — "infancy", "toddler", "preschool", "school", "adolescence"
  - child_type: string (optional) — Child's type if known

<!-- ┌─────────────────────────────────────────────────────────────┐ -->
<!-- │               I N S T R U C T I O N S                       │ -->
<!-- └─────────────────────────────────────────────────────────────┘ -->

## Instructions

### Step 1: Load Data
- `squads/mbti-expert/data/parenting-stages.md`
- `squads/mbti-expert/data/type-profiles-overview.md`

<!-- ─────────────────────────────────────────────────────────────── -->

### Step 2: Ask Context
If stage not specified, ask:
- Child's age range
- Specific parenting challenge being faced

<!-- ─────────────────────────────────────────────────────────────── -->

### Step 3: Generate Guide
Include:
- Parent type's natural parenting strengths
- Parent type's natural parenting challenges
- Stage-specific advice (Balanced/Unbalanced/Rebalancing)
- If child_type known: Cross-reference parent-child type dynamics
- Practical tips and exercises
- ABCDE method for adolescent emotional regulation (if stage = adolescence)
