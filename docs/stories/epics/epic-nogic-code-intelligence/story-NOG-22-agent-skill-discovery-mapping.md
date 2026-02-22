# Story NOG-22: Agent Skill Discovery & Mapping

**Epic:** Code Intelligence Integration (Provider-Agnostic)
**Wave:** Backlog — Agent Optimization
**Points:** 5
**Agents:** @analyst + @dev
**Status:** Draft
**Blocked By:** NOG-20 (Agent Frontmatter & Validation)
**Created:** 2026-02-22

**Executor Assignment:**
- **executor:** @analyst (research) + @dev (implementation)
- **quality_gate:** @qa
- **quality_gate_tools:** [npm test, manual agent activation]

---

## Story

**As a** framework developer,
**I want** a comprehensive analysis of each agent's tasks to discover which existing skills can be used as task dependencies and which new skills could be created from validated external sources (GitHub, Claude Code community, skill libraries),
**So that** every agent has an optimized skill set that accelerates task execution and reduces context loading overhead.

### Context

NOG-20 equalized the base skill (`diagnose-synapse`) across all 10 native agents and added role-specific skills where they already existed (architect-first, tech-search, synapse:manager). However, this was opportunistic — we used what was available, not what was optimal.

Current skill coverage:
- **Base (all 10 agents):** `diagnose-synapse`
- **Role-specific:** architect (+architect-first), analyst (+tech-search), devops (+synapse:manager)
- **Missing analysis:** What skills each agent's tasks actually need, what skills could be created from task patterns, what external skills could be adopted

### Origin

User feedback during NOG-20 review — "Se todos eles precisam da mesma qualidade no carregamento?"

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Skill overload slows agent activation | Medium | Medium | Benchmark activation time before/after; cap at 5 skills per agent |
| External skills have incompatible format | Medium | Low | Only adopt skills that follow Claude Code skill format; use skill-creator to adapt |
| Skills create circular dependencies | Low | High | Map dependency graph before adding; validate no cycles |

---

## Acceptance Criteria

### AC1: Task-to-Skill Mapping Complete
- [ ] All 10 native agents' tasks analyzed for skill dependencies
- [ ] Each agent has a "skill needs" document listing: current skills, needed skills, gap analysis
- [ ] Analysis covers both `.claude/commands/` skills AND `.aios-core/development/tasks/` dependencies

### AC2: Internal Skill Opportunities Identified
- [ ] Tasks with repeated patterns across agents identified as skill candidates
- [ ] At least 3 new internal skills proposed with: name, purpose, which agents benefit
- [ ] Skills that could replace manual context loading (devLoadAlwaysFiles) identified

### AC3: External Skill Research Complete
- [ ] GitHub repositories searched for validated Claude Code skill libraries
- [ ] At least 5 external skill sources evaluated (quality, maintenance, compatibility)
- [ ] Adoption recommendations with risk assessment for top candidates

### AC4: Skill Implementation Plan Created
- [ ] Priority-ordered list of skills to create/adopt
- [ ] Each skill has: estimated effort, affected agents, expected benefit
- [ ] Implementation can be broken into incremental stories

### AC5: Quick Wins Implemented
- [ ] At least 2 new skills created from internal task analysis
- [ ] Skills added to relevant agents' frontmatter
- [ ] Activation verified for affected agents

---

## Tasks / Subtasks

### Task 1: Agent Task Inventory (@analyst)
- [ ] 1.1 Catalog all tasks per agent from command path files (dependencies.tasks)
- [ ] 1.2 Catalog all skills currently available in `.claude/commands/`
- [ ] 1.3 For each agent: map tasks → skills that could accelerate execution
- [ ] 1.4 Identify cross-agent task patterns (same task used by multiple agents)

### Task 2: Internal Skill Gap Analysis (@analyst)
- [ ] 2.1 Identify tasks that manually load context that could be a skill
- [ ] 2.2 Identify repeated workflows across agents that could be extracted as skills
- [ ] 2.3 Analyze devLoadAlwaysFiles mechanism — which loaded files could become skills
- [ ] 2.4 Propose at least 3 new internal skills with spec (name, content, target agents)

### Task 3: External Skill Research (@analyst)
- [ ] 3.1 Search GitHub for Claude Code skill libraries and collections
- [ ] 3.2 Search for community-maintained skills relevant to dev workflows
- [ ] 3.3 Evaluate each source: quality, format compatibility, maintenance status, license
- [ ] 3.4 Create adoption recommendations with risk matrix

### Task 4: Skill Implementation Plan (@analyst + @dev)
- [ ] 4.1 Consolidate findings into priority-ordered implementation plan
- [ ] 4.2 Estimate effort per skill (create vs adopt vs adapt)
- [ ] 4.3 Map skill → agents → expected benefit
- [ ] 4.4 Break into incremental stories if plan exceeds 5 points

### Task 5: Quick Win Implementation (@dev)
- [ ] 5.1 Create top 2 internal skills identified in Task 2
- [ ] 5.2 Add to `.claude/commands/` following skill-creator conventions
- [ ] 5.3 Add to relevant agents' frontmatter (`.claude/agents/aios-{id}.md`)
- [ ] 5.4 Verify activation and skill loading for affected agents

---

## Dev Notes

### Current Skill Inventory

| Skill | Type | Used By |
|-------|------|---------|
| `synapse:tasks:diagnose-synapse` | Internal | All 10 agents |
| `synapse:manager` | Internal | devops |
| `architect-first` | Internal | architect |
| `tech-search` | Internal | analyst |
| `skill-creator` | Internal | Not assigned to any agent |

### Agent → Task Count (from command path dependencies)

| Agent | Approx Tasks | Key Task Areas |
|-------|-------------|----------------|
| dev | 15+ | develop-story, execute-subtask, build-*, gotcha-*, worktree-* |
| qa | 12+ | review-*, gate, nfr-assess, security-check, test-design |
| devops | 10+ | pre-push, pr-automation, release, ci-cd, mcp-*, worktree-* |
| architect | 5+ | impact-analysis, design, research, validate-prd |
| pm | 5+ | create-epic, execute-epic, spec-pipeline |
| po | 5+ | validate-story, close-story, backlog-* |
| sm | 3+ | draft-story, expand-story |
| analyst | 3+ | research, analysis, brainstorming |
| data-engineer | 5+ | schema-design, migration, rls, query-optimization |
| ux | 5+ | wireframe, design-system, accessibility, component-design |

### Research Sources to Check
- GitHub: `claude-code-skills`, `anthropic-skills`, `claude-commands`
- Claude Code community forums and discussions
- Existing squads in `aios-squads` repository for skill patterns
- MCP-based skills that could be adapted

### Key Files
- `.claude/agents/aios-{id}.md` — Native agent frontmatter (skills field)
- `.claude/commands/` — All available skills
- `.claude/commands/AIOS/agents/{id}.md` — Command path with task dependencies
- `.aios-core/development/tasks/` — Task definitions

---

## CodeRabbit Integration

**Story Type:** Research + Configuration
**Complexity:** Medium

**Quality Gates:**
- [ ] Pre-Commit (@dev) — CodeRabbit review for new skills
- [ ] Pre-PR (@devops) — CodeRabbit review before PR creation

**Self-Healing Configuration:**
- **Mode:** light
- **Max Iterations:** 2
- **Severity Filter:** CRITICAL only
- **Behavior:** CRITICAL → auto_fix | HIGH → document_as_debt

---

## Dev Agent Record

### Agent Model Used
_Not started_

### Debug Log
_Not started_

### Completion Notes
_Not started_

### File List

| File | Action | Description |
|------|--------|-------------|

---

## QA Results

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-22 | @dev (Dex) | Story created from NOG-20 user feedback — skill equalization needed deeper analysis |
