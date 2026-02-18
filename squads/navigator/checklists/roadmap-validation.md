# Roadmap Validation Checklist

Use this checklist to validate roadmap structure and completeness before starting development.

---

## File Structure

- [ ] Roadmap file exists at `.aios/navigator/{project-name}/roadmap.md`
- [ ] Local copy exists at `docs/roadmap.md` (if bidirectional sync enabled)
- [ ] File has valid YAML front-matter with required metadata
- [ ] Markdown content is well-formed and readable

---

## Front-Matter Validation

### Required Fields

- [ ] `project_name` is defined and matches directory name
- [ ] `version` follows semantic versioning (e.g., "1.0.0")
- [ ] `created_at` has valid ISO 8601 date
- [ ] `phases` array is present and non-empty

### Optional Fields

- [ ] `description` provides clear project overview (if present)
- [ ] `last_updated` timestamp is accurate (if present)
- [ ] `status` matches project state (if present)

---

## Phase Structure

### Each Phase Must Have:

- [ ] Unique `id` (number, sequential starting from 1)
- [ ] Clear `name` describing phase purpose
- [ ] Valid `agent` reference (e.g., "@pm", "@architect", "@dev")
- [ ] Descriptive `icon` emoji
- [ ] Executable `command` (e.g., "*create-prd", "*design-architecture")
- [ ] Meaningful `description` of phase outcomes
- [ ] `inputs` array (can be empty for phase 1)
- [ ] `outputs` array with expected deliverables
- [ ] Valid `next_phase` (number or null for final phase)

### Phase Dependencies

- [ ] Phase 1 has no inputs (or only user-provided inputs)
- [ ] Each phase's inputs match previous phase's outputs
- [ ] No circular dependencies between phases
- [ ] Final phase has `next_phase: null`
- [ ] Loop-back phases use `loop_back_to` instead of `next_phase`

### Phase Outputs

- [ ] All outputs use valid file path patterns
- [ ] Paths follow project structure conventions
- [ ] Wildcard patterns are specific enough (avoid `docs/**/*`)
- [ ] Critical files are explicitly listed (not wildcarded)

---

## Agent Assignments

- [ ] All referenced agents exist in `.aios-core/development/agents/`
- [ ] Agent capabilities match phase responsibilities
- [ ] No single agent dominates entire pipeline (balanced workload)
- [ ] Handoffs between agents are logical (e.g., @pm → @architect → @dev)
- [ ] Specialized agents used appropriately (@data-engineer for DB, @devops for deployment)

---

## Transition Rules

### Auto-Advance Rules

- [ ] Conditions are testable (check file existence, parse status)
- [ ] Actions are clear ("advance", "skip", "delegate")
- [ ] Phase targets are valid

### Blocked Rules

- [ ] Blocking conditions are well-defined
- [ ] Unblocking actions are documented
- [ ] Critical blockers halt execution appropriately

### Loop Rules

- [ ] Loop conditions prevent infinite loops
- [ ] Maximum iteration counts are reasonable
- [ ] Loop-back targets are earlier phases

---

## Content Quality

### Markdown Formatting

- [ ] Headings follow hierarchy (H1 → H2 → H3)
- [ ] Code blocks use appropriate language tags
- [ ] Lists are properly formatted
- [ ] Links are valid and accessible

### Clarity

- [ ] Phase names are self-explanatory
- [ ] Descriptions explain "why", not just "what"
- [ ] Technical terms are defined or linked
- [ ] Examples provided where helpful

---

## Project-Specific Validation

- [ ] Tech stack matches project requirements
- [ ] Output paths align with project structure
- [ ] Phases cover full development lifecycle
- [ ] Special requirements documented (e.g., compliance, security)

---

## Synchronization Check

- [ ] Central and local roadmaps are in sync (if using bidirectional sync)
- [ ] No manual edits lost during sync
- [ ] Conflict resolution strategy is clear
- [ ] Timestamps match between versions

---

## Pre-Execution Verification

- [ ] Run `node squads/navigator/scripts/navigator/phase-detector.js` successfully
- [ ] All required input files exist for phase 1
- [ ] Git repository is clean (no uncommitted changes)
- [ ] Dependencies installed (`npm install` completed)

---

## Sign-Off

- [ ] Roadmap reviewed by project lead
- [ ] Phases approved by relevant stakeholders
- [ ] Edge cases considered and documented
- [ ] Ready to execute phase 1

---

**Validation Date:** _______________

**Validated By:** _______________

**Notes:**

---

*Navigator Squad - Roadmap Validation Checklist v1.0*
