---
name: enhance-workflow
description: |
  Enhance Workflow - Orquestração multi-agente para enhancement de projetos/features.

  Pipeline sequencial com 4 fases: Discovery (@architect) -> Research (@analyst) ->
  Roundtable (@architect + @data-engineer + @devops + @ux) -> Create Epic (@pm).

  Usa o sistema de Teams para spawnar agentes AIOS especializados que trabalham
  em paralelo e sequencialmente, salvando artefatos entre fases.

  Use quando: planejar melhorias em projetos existentes, adicionar features complexas,
  ou quando precisar de analise cross-funcional antes de implementar.
---

# Enhance Workflow

Pipeline multi-agente para enhancement de projetos usando Teams com agentes AIOS.

## Overview

```
/enhance-workflow "descricao do enhancement"

Phase 1: Discovery   → @architect (Aria)     → 01-discovery.md
Phase 2: Research     → @analyst (Atlas)      → 02-research.md
Phase 3: Roundtable   → 4 agents em paralelo  → 03-roundtable.md
Phase 4: Create Epic  → @pm (Bob)             → 04-epic.md
```

## Conceptual Foundation

This workflow is grounded in foundational documents:

| Document | Location | Key Concept |
|----------|----------|-------------|
| Brownfield Discovery | `docs/guides/aios-workflows/brownfield-discovery-workflow.md` | Technical mapping before enhancement |
|  Cycle | `docs/guides/aios-workflows/story-development-cycle-workflow.md` | 4 phases, feedback loops |
| IDS Protocol | `.claude/agents/aios-dev.md` | **REUSE > ADAPT > CREATE** |
| Execute Epic Patterns | `.claude/skills/execute-epic/SKILL.md` | Task tool blocking, parallel agents |

### IDS Philosophy

```
REUSE > ADAPT > CREATE

Before proposing new code/architecture:
1. REUSE: Can we use existing components unchanged?
2. ADAPT: Can we modify existing components?
3. CREATE: Only if 1 and 2 are impossible

Target: <30% CREATE rate in all enhancements
```

### Agent Execution Model

```
Task(blocking) → Agent executes → Returns result → Continue
     ↓
run_in_background: true → TaskOutput(block: true) → Wait for completion
```

**Foundation docs are for HUMAN understanding only** - agents use their wrappers.

## Input Collection

Collect from user (use AskUserQuestion if needed):

1. **Projeto**: Qual projeto/feature sera enhanced? (nome, contexto, objetivo)
2. **Scope**: greenfield (novo) ou brownfield (existente)?
3. **Foco**: Qual o resultado esperado? (nova feature, refactor, otimizacao, etc.)

If the user already provided sufficient context in arguments, skip collection and start directly.

## Setup

### Artifact Directory

Create artifact output directory:

```
outputs/enhance/{slug}/
```

Where `{slug}` is the project/feature name in snake_case (e.g., `auth_system`, `payment_gateway`).

### Team Creation

```
TeamCreate(team_name: "enhance-{slug}")
```

### Task Creation (with dependencies)

Create 4 sequential tasks:

| ID | Task | Agent | Blocked By |
|----|------|-------|------------|
| 1 | Discovery - Technical analysis and mapping | architect | - |
| 2 | Research - Strategic research and analysis | analyst | 1 |
| 3 | Roundtable - Cross-functional review | architect+data-engineer+devops+ux | 2 |
| 4 | Create Epic - Epic structuring | pm | 3 |

## AGENT_MAP

```yaml
# Mapeamento: role -> subagent_type
AGENT_MAP:
  architect: "aios-architect"
  analyst: "aios-analyst"
  data-engineer: "aios-data-engineer"
  devops: "aios-devops"
  ux: "aios-ux"
  pm: "aios-pm"
```

## Context Loading (Automatic)

Each AIOS agent wrapper (`.claude/agents/aios-*.md`) automatically loads:
- Git status, branch, permissions
- Gotchas filtered by domain
- Technical preferences
- Project status

**No need to include context loading instructions in prompts** - the wrappers handle it.

## Execution Pattern (CRITICAL)

### How Agent Waiting Works

The `Task` tool has **native blocking behavior** - it automatically waits for the agent to complete before returning. You do NOT need any manual waiting mechanism.

### Sequential Phases (1, 2, 4)

```
# Task tool WITHOUT run_in_background = BLOCKS until agent completes
# Use subagent_type direto - wrapper carrega contexto automaticamente
Task(prompt: "...", subagent_type: "aios-architect", mode: "bypassPermissions")
# When execution reaches here, the agent is DONE
TaskUpdate(taskId: "X", status: "completed")
```

### Parallel Phase (3 - Roundtable)

```
# Spawn ALL 4 agents in a SINGLE message with run_in_background: true
Task(prompt: "agent 1...", subagent_type: "aios-architect", run_in_background: true)  → returns output_file_1
Task(prompt: "agent 2...", subagent_type: "aios-data-engineer", run_in_background: true)  → returns output_file_2
Task(prompt: "agent 3...", subagent_type: "aios-devops", run_in_background: true)  → returns output_file_3
Task(prompt: "agent 4...", subagent_type: "aios-ux", run_in_background: true)  → returns output_file_4

# Then wait for each using TaskOutput (blocks until agent completes)
TaskOutput(task_id: "id_1", block: true)
TaskOutput(task_id: "id_2", block: true)
TaskOutput(task_id: "id_3", block: true)
TaskOutput(task_id: "id_4", block: true)
```

### NEVER DO THIS (Anti-Patterns)

```
# ❌ WRONG: Sleep loops
Bash("sleep 30")
Bash("sleep 60")

# ❌ WRONG: Polling loops
while not done:
    Bash("sleep 10")
    check_if_file_exists()

# ❌ WRONG: Periodic file checking
Read("output_file")  # hoping it appeared
Bash("sleep 30")
Read("output_file")  # checking again

# ❌ WRONG: Asking teammate for status via SendMessage polling
SendMessage("hey, are you done yet?")
```

The Task tool handles ALL waiting automatically. Trust the blocking mechanism.

---

## Phase Execution

### Step 0: IDS Compliance Check (BLOCKING - BEFORE any phase)

**REQUIRED OUTPUT:** Create `outputs/enhance/{slug}/00-ids-check.md` before proceeding to Phase 1.

**ids-check.md Template:**
```markdown
# IDS Compliance Check - {slug}

## Search Results
| Query | Results Found | Relevant? |
|-------|---------------|-----------|
| squads/ for similar | | |
| .claude/skills/ for similar | | |
| docs/guides/ for related | | |

## Analysis
| Aspect | Existing Solution | Gap |
|--------|-------------------|-----|
| Architecture | | |
| Workflow | | |
| Components | | |

## Decision
- [ ] REUSE: Use existing unchanged
- [ ] ADAPT: Modify existing
- [ ] CREATE: Build new (justify below)

## Justification
{Why this decision? What was searched? Why can't REUSE/ADAPT?}
```

**VETO:** Phase 1 CANNOT start without `00-ids-check.md` artifact confirming IDS decision.

---

### Phase 1: Discovery (@architect / Aria)

Spawn 1 agent via Task tool:
- `subagent_type`: "aios-architect"
- `team_name`: "enhance-{slug}"
- `name`: "architect"
- `mode`: "bypassPermissions"

**Agent prompt:**

```
## Mission: technical-discovery

## Context
{project context provided by user}

## Mission
Complete technical Discovery analysis:

1. **Current State Mapping**
   - Project structure (directories, key files)
   - Current tech stack
   - Patterns and conventions in use
   - Existing integrations (APIs, database, services)

2. **Architecture Analysis**
   - Strengths of current architecture
   - Technical debts identified
   - Potential performance bottlenecks
   - Security risks

3. **Enhancement Opportunities**
   - Areas that would benefit from improvement
   - Quick wins vs long-term investments
   - Technical constraints for new features

4. **Initial Recommendations**
   - Possible architectural approaches
   - Trade-offs of each approach
   - Recommended technologies/patterns

## Output
Save complete result to: outputs/enhance/{slug}/01-discovery.md

Format:
# Discovery Report - {project name}
## Executive Summary
## Current State
## Architecture Analysis
## Opportunities
## Recommendations
## Constraints and Risks

After saving, send a message to the team lead with a 3-5 line summary of findings.
```

The Task tool call above **blocks automatically** until the architect agent completes.
When control returns to you, the agent is done. Then:
1. `TaskUpdate(taskId: "1", status: "completed")`
2. `TaskUpdate(taskId: "2", status: "in_progress")` (unblock next phase)
3. Proceed immediately to Phase 2.

---

### Phase 2: Research (@analyst / Atlas)

Spawn 1 agent via Task tool:
- `subagent_type`: "aios-analyst"
- `team_name`: "enhance-{slug}"
- `name`: "analyst"
- `mode`: "bypassPermissions"

**Agent prompt:**

```
## Mission: strategic-research

## Context
{project context provided by user}

## Input from Previous Phase (Discovery)
Read the file: outputs/enhance/{slug}/01-discovery.md

## Mission
Strategic research and market analysis to support the enhancement:

1. **Market Research**
   - How do competitors solve the same problem?
   - Relevant industry trends
   - Industry best practices

2. **Technology Analysis**
   - Recommended libraries/frameworks for this case
   - Market standards (use exa and context7 for research)
   - Reference benchmarks and metrics

3. **Feasibility Analysis**
   - Estimated complexity (low/medium/high)
   - Required external dependencies
   - Implementation risks

4. **Strategic Recommendations**
   - Recommended approach (with data-backed justification)
   - Alternatives considered and discarded
   - Suggested success metrics

## Output
Save complete result to: outputs/enhance/{slug}/02-research.md

Format:
# Research Report - {project name}
## Executive Summary
## Market Research
## Technology Analysis
## Feasibility
## Strategic Recommendations
## Sources and References

After saving, send a message to the team lead with a 3-5 line summary.
```

The Task tool call above **blocks automatically** until the analyst agent completes.
When control returns to you, the agent is done. Then:
1. `TaskUpdate(taskId: "2", status: "completed")`
2. `TaskUpdate(taskId: "3", status: "in_progress")` (unblock next phase)
3. Proceed immediately to Phase 3.

---

### Phase 3: Roundtable (@architect + @data-engineer + @devops + @ux)

This phase is **parallel** - spawn 4 agents simultaneously.

Each agent reads previous artifacts (01-discovery.md + 02-research.md) and provides their specialist perspective.

Spawn 4 agents in parallel via Task tool, each with the correct `subagent_type` from AGENT_MAP:
- `team_name`: "enhance-{slug}"
- `mode`: "bypassPermissions"

Each prompt follows this structure:

```
## Mission: roundtable-{role}

## Previous Phase Inputs
Read: outputs/enhance/{slug}/01-discovery.md AND outputs/enhance/{slug}/02-research.md

## Your Specialist Perspective
{specific instructions per agent}

## Output
Save to: outputs/enhance/{slug}/03{letter}-roundtable-{role}.md
Send summary message to team lead when done.
```

#### Agent 1: Architect (Aria) - Architectural Perspective
- `name`: "rt-architect"
- Gotchas filter: Architecture, Security, Performance
- Perspective: architectural feasibility, recommended patterns, technical risks, design decisions
- Save to: `03a-roundtable-architect.md`

#### Agent 2: Data Engineer (Dara) - Data Perspective
- `name`: "rt-data-engineer"
- Gotchas filter: Database, API
- Perspective: required database schema, critical queries, ETL pipelines, data performance, RLS policies
- Save to: `03b-roundtable-data.md`

#### Agent 3: DevOps (Gage) - Infrastructure Perspective
- `name`: "rt-devops"
- Gotchas filter: Build/Deploy, Security
- Perspective: deployment strategy, CI/CD impact, monitoring, scalability, infrastructure costs
- Save to: `03c-roundtable-devops.md`

#### Agent 4: UX Expert (Uma) - UX Perspective
- `name`: "rt-ux"
- Gotchas filter: Frontend/React, Performance
- Perspective: impacted user flows, required UI components, accessibility, design system impact, user experience
- Save to: `03d-roundtable-ux.md`

**Parallel Execution (CRITICAL - follow Execution Pattern above):**

1. Spawn ALL 4 agents in a **single message** using 4 `Task` calls with `run_in_background: true`
2. Collect the 4 `task_id` values returned
3. Use `TaskOutput(task_id: "id", block: true)` for each to wait (blocks until agent completes)
4. After all 4 TaskOutput calls return, all agents are done

Then the team lead must:
1. Read all 4 roundtable files (03a, 03b, 03c, 03d)
2. Consolidate into a single `outputs/enhance/{slug}/03-roundtable.md` with:
   - Executive Summary (synthesis of 4 perspectives)
   - Consensus (where all agree)
   - Divergences (where opinions differ)
   - Recommended decisions
   - Consolidated action items

---

### Phase 4: Create Epic (@pm / Bob)

Spawn 1 agent via Task tool:
- `subagent_type`: "aios-pm"
- `team_name`: "enhance-{slug}"
- `name`: "pm"
- `mode`: "bypassPermissions"

**Agent prompt:**

```
## Mission: create-epic

## Context
{project context provided by user}

## Inputs from Previous Phases
Read ALL files in: outputs/enhance/{slug}/
- 01-discovery.md (technical analysis from @architect)
- 02-research.md (research from @analyst)
- 03-roundtable.md (cross-functional consensus)

## Mission
Create the complete Epic based on all analysis performed:

1. **Epic Definition**
   - Clear, descriptive title
   - Epic objective (problem it solves)
   - Scope (in scope / out of scope)
   - Success metrics (measurable KPIs)

2. **User Stories**
   - Stories with format: "As [persona], I want [action], so that [benefit]"
   - Acceptance criteria for each story
   - Estimated story points (fibonacci: 1, 2, 3, 5, 8, 13)
   - Dependencies between stories

3. **Technical Requirements**
   - Technical decisions from roundtable
   - Required schema changes
   - API contracts
   - Required UI components

4. **Execution Plan**
   - Recommended implementation order
   - Executor assignment (which agent executes each story: @dev, @data-engineer, @devops, @ux)
   - Quality gates per story
   - Risks and mitigations

5. **Definition of Done**
   - Criteria to consider the epic complete
   - Required tests
   - Required documentation

## Output
Save the complete epic to: outputs/enhance/{slug}/04-epic.md

Also save the structured version for AIOS to:
docs/projects/{project_name}/epics/{slug}/epic.md

Use the standard AIOS epic format.

After saving, send a message to the team lead with the epic summary (title, N stories, total story points estimate).
```

The Task tool call above **blocks automatically** until the PM agent completes.
When control returns to you, the agent is done. Then:
1. `TaskUpdate(taskId: "4", status: "completed")`
2. Proceed to Finalization.

---

## Finalization

After Phase 4 completes:

1. **Present summary** to user:
   - Links to all generated artifacts
   - Epic summary (stories, estimates, executors)
   - Recommended next steps

2. **Cleanup**:
   - Send shutdown_request to all remaining agents
   - Execute TeamDelete after all agents shut down

3. **Final summary format**:

```markdown
## Enhance Workflow Complete: {name}

### Generated Artifacts
- `outputs/enhance/{slug}/01-discovery.md` - Technical analysis
- `outputs/enhance/{slug}/02-research.md` - Strategic research
- `outputs/enhance/{slug}/03-roundtable.md` - Cross-functional consensus
- `outputs/enhance/{slug}/04-epic.md` - Complete epic

### Epic: {title}
- Stories: {N} stories ({total} story points)
- Executors: {list of assigned agents}
- Priority: {high/medium/low}

### Next Steps
1. Review epic at `04-epic.md`
2. Approve/adjust stories with @po
3. Start sprint planning with @sm
4. Execute with assigned agents
```

## Implementation Notes

- Each spawned agent runs in its own context (no shared memory)
- Communication between phases is via FILES (not messages)
- The team lead coordinates and ensures quality between phases
- If an agent fails, recreate the task and re-spawn the agent
- Roundtable agents run in PARALLEL for efficiency
- Always use `mode: "bypassPermissions"` for agents that need to read/write files
