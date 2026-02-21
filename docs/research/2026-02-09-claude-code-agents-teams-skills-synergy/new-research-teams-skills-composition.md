# Deep Research: Claude Code Teams + Skills Composition Patterns

> How Agent Teams and Skills work together in practice: composition, orchestration, quality gates, and anti-patterns.

**Date:** 2026-02-09
**Sources consulted:** 18 unique sources (official docs, community repos, gists, blog posts, GitHub issues)
**Pages deep-read:** 12

---

## TL;DR

- **Skills and Teams are complementary but currently operate in separate layers**: Skills define WHAT to do (workflows, instructions); Teams define WHO does it (parallel agents with messaging). The integration between them is indirect -- teammates load project skills automatically but there is no first-class "skill creates team" primitive.
- **The missing link is Issue #24316**: custom `.claude/agents/` definitions cannot be used as team teammates yet. All teammates spawn as undifferentiated `general-purpose` agents. This is the single biggest gap in skill-team composition.
- **`context: fork` is the bridge for single-agent skills**: A skill with `context: fork` + `agent:` spawns an isolated subagent. This works within a session but does NOT create team teammates. For multi-agent parallel work, you must use Teams directly.
- **Quality gates for teams use Hooks, not Skills**: `TeammateIdle` and `TaskCompleted` hooks (added v2.1.33, Feb 6 2026) enforce completion criteria. These are exit-code-based (exit 2 = block), not skill-based.
- **The practical pattern today**: Skill as entry point (user invokes `/orchestrate`) -> skill instructions tell Claude to create a team -> Claude uses TeamCreate/TaskCreate/SendMessage as tools -> Hooks enforce quality gates. The skill is a prompt template, not a programmatic orchestrator.
- **Community has built comprehensive orchestration skills**: Kieran Klaassen's "orchestrating-swarms" skill (4f2aba89) documents all 13 TeammateTool operations, 6 orchestration patterns, and all message types. Lev Nikolaevich's collection (85 skills) implements hierarchical orchestrator-worker patterns.

---

## Table of Contents

1. [Architecture: How the Pieces Fit](#1-architecture-how-the-pieces-fit)
2. [Skill as Entry Point, Team as Execution](#2-skill-as-entry-point-team-as-execution)
3. [How Teammates Access Skills](#3-how-teammates-access-skills)
4. [context: fork vs Agent Teams](#4-context-fork-vs-agent-teams)
5. [Quality Gates: Hooks as the Enforcement Layer](#5-quality-gates-hooks-as-the-enforcement-layer)
6. [TaskCreate/TaskList Coordination Patterns](#6-taskcreatetasklist-coordination-patterns)
7. [The Missing Piece: Custom Agents as Teammates (Issue #24316)](#7-the-missing-piece-custom-agents-as-teammates-issue-24316)
8. [Orchestration Patterns from the Community](#8-orchestration-patterns-from-the-community)
9. [Comparison with CrewAI, LangGraph, AutoGen](#9-comparison-with-crewai-langgraph-autogen)
10. [Anti-Patterns: When NOT to Use Teams](#10-anti-patterns-when-not-to-use-teams)
11. [Practical Composition Recipes](#11-practical-composition-recipes)
12. [Recommendations for MMOS](#12-recommendations-for-mmos)

---

## 1. Architecture: How the Pieces Fit

Claude Code has four composable primitives for multi-agent work:

| Primitive | What it does | Scope | Token cost |
|-----------|-------------|-------|------------|
| **Skills** | Define reusable workflows/instructions | Single session (inline or forked) | Low (loaded on demand) |
| **Subagents** | Isolated workers that report back | Within session, own context window | Medium (summarized result returns) |
| **Agent Teams** | Independent sessions with messaging | Cross-session, shared task list | High (each is a full Claude instance) |
| **Hooks** | Lifecycle event handlers | Session or component-scoped | Negligible (shell scripts) |

### How They Compose

```
                    USER
                      |
                      v
              +---------------+
              |    SKILL      |  <-- Entry point (/slash-command)
              |  (SKILL.md)   |
              +-------+-------+
                      |
          +-----------+-----------+
          |                       |
   context: fork             inline execution
          |                       |
          v                       v
   +-------------+      +-----------------+
   |  SUBAGENT   |      |  MAIN CONTEXT   |
   | (isolated)  |      | (with skills    |
   | returns     |      |  loaded)        |
   | result      |      |                 |
   +-------------+      +--------+--------+
                                  |
                     Claude decides to create team
                                  |
                                  v
                         +----------------+
                         |  AGENT TEAM    |
                         |  (TeamCreate)  |
                         +--------+-------+
                                  |
                    +-------------+-------------+
                    |             |              |
                    v             v              v
              +---------+  +---------+    +---------+
              |Teammate |  |Teammate |    |Teammate |
              |   A     |  |   B     |    |   C     |
              +---------+  +---------+    +---------+
                    |             |              |
              loads CLAUDE.md, MCP servers, skills
              has own context window
              communicates via SendMessage
              claims tasks from shared TaskList
```

**Key insight**: There is no direct API for "skill creates team." A skill provides instructions that the main Claude agent follows. If those instructions say "create a team," Claude uses the TeamCreate tool as a regular tool call. The skill is a prompt, not an orchestration engine.

> "When spawned, a teammate loads the same project context as a regular session: CLAUDE.md, MCP servers, and skills. It also receives the spawn prompt from the lead. The lead's conversation history does not carry over." -- [Official docs](https://code.claude.com/docs/en/agent-teams)

---

## 2. Skill as Entry Point, Team as Execution

### The Pattern

A skill serves as the **entry point** that defines the orchestration strategy. When invoked, it provides Claude with structured instructions for creating and managing a team. The skill itself does not call TeamCreate -- Claude does, following the skill's instructions.

### Example: Orchestration Skill

```yaml
---
name: orchestrate-feature
description: >
  Break down a feature into parallel tasks and coordinate an agent team.
  Use when implementing complex features that benefit from parallel work.
disable-model-invocation: true
---

## Orchestration Protocol

When the user invokes this skill with a feature description:

1. **Decompose**: Break the feature into 3-5 independent work streams
2. **Create team**: Use TeamCreate to establish a team named after the feature
3. **Create tasks**: Use TaskCreate for each work stream with clear:
   - Subject (short title)
   - Description (detailed acceptance criteria)
   - Dependencies (blockedBy relationships)
4. **Spawn teammates**: One per work stream, with role-specific spawn prompts
5. **Monitor**: Wait for teammates, redirect if needed
6. **Synthesize**: Collect results, resolve conflicts, verify integration

## Task Sizing Rules
- Each task should take 15-30 minutes of agent time
- 5-6 tasks per teammate for optimal productivity
- Tasks must have clear file ownership (no two teammates editing same file)

## Quality Requirements
- Require plan approval for architectural changes
- Each teammate must run tests before marking tasks complete
- Lead reviews integration points after all tasks finish

$ARGUMENTS
```

### How It Works in Practice

1. User invokes: `/orchestrate-feature Add notification system with email, SMS, and in-app channels`
2. Claude reads the skill instructions
3. Claude calls `TeamCreate({ team_name: "notifications" })`
4. Claude calls `TaskCreate` for each work stream (email service, SMS service, in-app service, shared types, integration tests)
5. Claude calls `Task` with `team_name` and `name` parameters to spawn teammates
6. Teammates self-claim tasks, work independently, communicate via SendMessage
7. Lead synthesizes results

### What the Skill Controls

| Aspect | Skill controls? | How |
|--------|-----------------|-----|
| Task decomposition strategy | Yes | Instructions in SKILL.md |
| Number of teammates | Partially | Suggestions, Claude decides |
| Teammate capabilities | No | All get `general-purpose` (see Issue #24316) |
| Task dependencies | Yes | Instructions for blockedBy patterns |
| Quality criteria | Indirectly | Through instructions + hooks |
| Model selection | Partially | Can suggest "Use Sonnet for teammates" |

---

## 3. How Teammates Access Skills

### Automatic Skill Loading

When a teammate is spawned, it loads the same project context as a regular session:

1. **CLAUDE.md** files from the working directory
2. **MCP servers** configured for the project
3. **Skills** from `.claude/skills/` (project-level) and `~/.claude/skills/` (personal)

This means every teammate has access to every project skill. However:

- Teammates do NOT inherit the lead's conversation history
- Teammates do NOT get the skill that triggered the team creation (unless it is a project skill they discover independently)
- Skills with `disable-model-invocation: true` are NOT available to teammates (since only users can invoke those)

### Teammate Skill Invocation

A teammate CAN invoke skills during its work, but only skills where `disable-model-invocation` is not true. The invocation happens the same way as in a regular session -- Claude matches the task context against skill descriptions and loads relevant skills.

**Example flow:**
1. Lead spawns teammate with prompt: "Implement the email notification service"
2. Teammate's context loads all project skills
3. While working, teammate's task matches `api-conventions` skill description
4. Claude loads `api-conventions` skill content into teammate's context
5. Teammate follows API conventions while implementing

### The `skills` Field on Subagents (NOT on Teammates)

The subagent system supports a `skills` field that preloads specific skills:

```yaml
---
name: api-developer
description: Implement API endpoints following team conventions
skills:
  - api-conventions
  - error-handling-patterns
---
```

**Critical limitation**: This field works for subagents (`.claude/agents/` definitions) but NOT for team teammates. Teammates are always spawned as `general-purpose` agents without the ability to specify which agent definition to use. This is the gap identified in Issue #24316.

---

## 4. context: fork vs Agent Teams

### Two Distinct Mechanisms

| Feature | `context: fork` | Agent Teams |
|---------|-----------------|-------------|
| **What it does** | Spawns ONE subagent from a skill | Creates MULTIPLE independent sessions |
| **Communication** | Result returns to parent only | Teammates message each other |
| **Task coordination** | None (single task) | Shared task list with dependencies |
| **Skill integration** | Skill content IS the task | Teammates discover skills independently |
| **Best for** | Focused isolation (research, review) | Parallel collaboration |
| **Token cost** | Lower (summarized return) | Higher (each is full instance) |

### How `context: fork` Works

```yaml
---
name: deep-research
description: Research a topic thoroughly
context: fork
agent: Explore
---

Research $ARGUMENTS thoroughly:
1. Find relevant files using Glob and Grep
2. Read and analyze the code
3. Summarize findings with specific file references
```

When invoked:
1. Claude Code creates a new isolated context
2. The Explore agent (Haiku, read-only) receives the skill content as its task
3. The agent works independently
4. Results are summarized and returned to the main conversation

### `context: fork` Does NOT Create Team Teammates

A forked skill creates a subagent, which:
- Reports ONLY to the parent agent
- Cannot message other agents
- Cannot claim shared tasks
- Has no inbox or team membership

**You cannot use `context: fork` to spawn team teammates.** The two systems are separate:

```
context: fork  --> Task tool (subagent) --> returns result to parent
Agent Teams    --> TeamCreate + Task(team_name) --> independent sessions with messaging
```

### Skill-Driven Subagent vs. Subagent-Driven Skill

The official docs describe two composition directions:

| Approach | System prompt | Task | Also loads |
|----------|--------------|------|------------|
| Skill with `context: fork` | From agent type (Explore, Plan, etc.) | SKILL.md content | CLAUDE.md |
| Subagent with `skills` field | Subagent's markdown body | Claude's delegation message | Preloaded skills + CLAUDE.md |

**Direction 1: Skill -> Agent**
The skill defines the task. The `agent:` field determines execution environment.

**Direction 2: Agent -> Skill**
The agent has its own identity/system prompt. Skills are preloaded as reference material.

Neither direction creates team teammates. Both operate within a single session.

---

## 5. Quality Gates: Hooks as the Enforcement Layer

### Team-Specific Hook Events

Two hook events were added specifically for agent teams (v2.1.33, Feb 6 2026):

#### TeammateIdle

Fires when a teammate is about to go idle after finishing its turn.

```json
{
  "hook_event_name": "TeammateIdle",
  "teammate_name": "researcher",
  "team_name": "my-project"
}
```

**Exit code 2 = teammate continues working.** The stderr message is fed back as feedback.

```bash
#!/bin/bash
# Prevent teammate from going idle without running tests
if [ ! -f "./dist/output.js" ]; then
  echo "Build artifact missing. Run the build before stopping." >&2
  exit 2
fi
exit 0
```

**Key constraint**: TeammateIdle does NOT support prompt-based or agent-based hooks. Only command hooks work.

#### TaskCompleted

Fires when a task is being marked as completed (via TaskUpdate or teammate finishing with in-progress tasks).

```json
{
  "hook_event_name": "TaskCompleted",
  "task_id": "task-001",
  "task_subject": "Implement user authentication",
  "task_description": "Add login and signup endpoints",
  "teammate_name": "implementer",
  "team_name": "my-project"
}
```

**Exit code 2 = task NOT marked complete.** Stderr fed back to the model.

```bash
#!/bin/bash
INPUT=$(cat)
TASK_SUBJECT=$(echo "$INPUT" | jq -r '.task_subject')

if ! npm test 2>&1; then
  echo "Tests not passing. Fix failing tests before completing: $TASK_SUBJECT" >&2
  exit 2
fi
exit 0
```

### Skill + Hook Composition for Quality Gates

While skills cannot directly enforce quality gates on teams, you can compose:

1. **Skill** defines the team creation workflow and quality expectations
2. **Hook** (project-level in settings.json) enforces completion criteria

```
/.claude/settings.json:
{
  "hooks": {
    "TaskCompleted": [{
      "hooks": [{
        "type": "command",
        "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/verify-task.sh"
      }]
    }],
    "TeammateIdle": [{
      "hooks": [{
        "type": "command",
        "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/check-teammate-done.sh"
      }]
    }]
  }
}
```

### Hook Scoping in Skills/Agents

Skills can define hooks scoped to their lifecycle:

```yaml
---
name: secure-operations
description: Perform operations with security checks
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/security-check.sh"
---
```

**But**: These skill-scoped hooks only run while the skill is active in the main session. They do NOT propagate to team teammates (since teammates are separate sessions).

---

## 6. TaskCreate/TaskList Coordination Patterns

### Task System Architecture

Tasks are the coordination mechanism between team members:

```
~/.claude/tasks/{team-name}/
  1.json    # { subject, description, status, owner, blockedBy }
  2.json
  3.json
```

States: `pending` -> `in_progress` -> `completed`

File locking prevents race conditions when multiple teammates claim simultaneously.

### Pattern 1: Parallel Specialists

Multiple specialists work on the same codebase from different angles:

```
TaskCreate({ subject: "Security review", description: "..." })
TaskCreate({ subject: "Performance review", description: "..." })
TaskCreate({ subject: "Test coverage review", description: "..." })

# Spawn 3 teammates, each claims one task
```

### Pattern 2: Pipeline with Dependencies

Sequential stages with automatic unblocking:

```
TaskCreate({ subject: "Design API schema" })      # Task 1
TaskCreate({ subject: "Implement endpoints" })     # Task 2, blockedBy: [1]
TaskCreate({ subject: "Write integration tests" }) # Task 3, blockedBy: [2]
TaskCreate({ subject: "Write documentation" })     # Task 4, blockedBy: [2]
```

Tasks 3 and 4 auto-unblock when Task 2 completes. Wave execution:
- Wave 1: Task 1 (single teammate)
- Wave 2: Task 2 (single teammate, after Wave 1)
- Wave 3: Tasks 3 + 4 (parallel, after Wave 2)

### Pattern 3: Swarm (Self-Organizing)

Workers poll TaskList and claim available work:

```
# Create many granular tasks
TaskCreate({ subject: "Migrate auth/login.ts" })
TaskCreate({ subject: "Migrate auth/register.ts" })
TaskCreate({ subject: "Migrate auth/forgot-password.ts" })
TaskCreate({ subject: "Migrate auth/two-factor.ts" })
# ... 20 more tasks

# Spawn 4-5 teammates
# Each finishes a task, claims the next unblocked one
# Natural load balancing
```

### Pattern 4: Research -> Implementation

Synchronous research phase informs subsequent implementation:

```
# Phase 1: Research (single subagent or teammate)
Task({ subagent_type: "Explore", prompt: "Analyze the auth module..." })

# Phase 2: Implementation (team based on research results)
TeamCreate({ team_name: "auth-refactor" })
TaskCreate({ subject: "Refactor token handling", description: "Based on research: ..." })
TaskCreate({ subject: "Add session management", description: "Based on research: ..." })
```

### Pattern 5: Plan Approval Gate

```
# Spawn architect with plan mode required
Task({ team_name: "refactor", name: "architect",
       prompt: "Design migration plan. Submit for approval before implementing." })

# Architect works in read-only mode
# Sends plan_approval_request to lead
# Lead reviews and approves/rejects
# On approval, architect exits plan mode and implements
```

### Pattern 6: Coordinated Refactoring

Multi-file changes with clear boundaries:

```
TaskCreate({ subject: "Refactor jwt.ts" })           # Wave 1
TaskCreate({ subject: "Refactor sessions.ts" })       # Wave 1
TaskCreate({ subject: "Refactor middleware.ts" })      # Wave 1
TaskCreate({ subject: "Update barrel index.ts", blockedBy: [1,2,3] }) # Wave 2
TaskCreate({ subject: "Update imports across project", blockedBy: [4] }) # Wave 3
```

---

## 7. The Missing Piece: Custom Agents as Teammates (Issue #24316)

### The Gap

[Issue #24316](https://github.com/anthropics/claude-code/issues/24316) (OPEN) describes the critical missing integration between the subagent system and agent teams:

> "Agent teams currently spawn all teammates as undifferentiated `general-purpose` agents. Customization is limited to natural language prompts from the team lead at spawn time."

The subagent system (`.claude/agents/`) supports:
- Tool restrictions and `disallowedTools`
- Permission modes
- Scoped hooks (PreToolUse, PostToolUse, Stop)
- Persistent memory (`user|project|local`)
- Preloaded skills
- Custom model selection

**None of these apply to team teammates.**

### What This Means for Skill-Team Composition

Without this feature:
1. A skill cannot specify "spawn a `security-reviewer` teammate" with pre-configured tool restrictions
2. All teammates get identical capabilities
3. Safety depends entirely on prompt compliance (fragile)
4. No persistent memory across team sessions
5. No deterministic tool enforcement per teammate

### The Proposed Solution

```json
{
  "name": "researcher",
  "agentType": "code-reviewer",   // References .claude/agents/code-reviewer.md
  "model": "haiku",
  "prompt": "Review the authentication module..."
}
```

Teammates would inherit:
- `tools` / `disallowedTools` from agent definition
- `model` from agent definition
- `permissionMode` from agent definition
- `hooks` from agent definition
- `skills` (preloaded domain knowledge)
- `memory` (persistent cross-session memory)
- System prompt (markdown body of agent file)

The spawn prompt would be appended as additional context.

### Community Support

The issue has strong community interest:

> "This would be a killer feature, especially for us who have invested a lot of time and energy defining and tuning our own custom agents. To be able to define a 'team' -- create a team-manifest -- would be game-changing." -- @twistingmercury

### Current Status: OPEN

As of 2026-02-09, this feature has not been implemented. The building blocks exist (subagent system parses `.claude/agents/` files; team system spawns independent sessions), but they are not connected.

---

## 8. Orchestration Patterns from the Community

### Kieran Klaassen's Swarm Orchestration Skill

[Source: GitHub Gist 4f2aba89](https://gist.github.com/kieranklaassen/4f2aba89594a4aea4ad64d753984b2ea)

The most comprehensive community skill for team orchestration. Key contributions:

**Two Spawn Methods Documented:**

| Method | Mechanism | Best for |
|--------|-----------|----------|
| Task tool (subagents) | `Task({ subagent_type: "Explore", prompt: "..." })` | Short-lived, focused work |
| Task + team_name (teammates) | `Task({ team_name: "...", name: "worker-1", ... })` | Persistent workers with messaging |

**13 TeammateTool Operations:**
spawnTeam, discoverTeams, requestJoin, approveJoin, rejectJoin, write, broadcast, requestShutdown, approveShutdown, rejectShutdown, approvePlan, rejectPlan, cleanup

**6 Orchestration Patterns:**
1. Parallel Specialists
2. Pipeline
3. Swarm
4. Research -> Implementation
5. Plan Approval
6. Coordinated Refactoring

**Environment Variables for Teammates:**
- `CLAUDE_CODE_TEAM_NAME`
- `CLAUDE_CODE_AGENT_ID`
- `CLAUDE_CODE_AGENT_NAME`
- `CLAUDE_CODE_AGENT_TYPE`
- `CLAUDE_CODE_PLAN_MODE_REQUIRED`
- `CLAUDE_CODE_PARENT_SESSION_ID`

### Lev Nikolaevich's 85-Skill Collection

[Source: GitHub levnikolaevich/claude-code-skills](https://github.com/levnikolaevich/claude-code-skills)

Implements a hierarchical orchestrator-worker architecture:

**Level 1 Orchestrators** (scope delegation):
- `ln-100-documents-pipeline` -- document generation
- `ln-200-scope-decomposer` -- work decomposition
- `ln-400-story-executor` -- full automation
- `ln-500-story-quality-gate` -- quality verification
- `ln-620-codebase-auditor` -- coordinates 9 parallel auditors

**Quality Gate Pattern:**
```
ln-500-story-quality-gate (orchestrator)
  -> ln-510-code-quality-coordinator
      -> ln-511-code-quality-checker (DRY/KISS/YAGNI)
      -> ln-512-agent-reviewer (delegates to Codex/Gemini with Claude Opus fallback)
      -> ln-513-regression-checker (test execution)
  -> ln-520-test-planning
      -> ln-521-test-researcher
      -> ln-522-manual-tester
      -> ln-523-auto-test-planner
```

Each orchestrator delegates to 3-7 focused workers. This is currently implemented using subagents (Task tool), not Agent Teams, because the orchestrator-worker pattern works well within a single session.

### wshobson/agents Plugin System

[Source: GitHub wshobson/agents](https://github.com/wshobson/agents)

73 plugins, 112 agents, 146 skills organized into 24 categories. Key insight:

**Four-Tier Model Strategy:**

| Tier | Model | Count | Purpose |
|------|-------|-------|---------|
| Tier 1 | Opus 4.5 | 42 | Critical: architecture, security, review |
| Tier 2 | Inherit | 42 | Complex: user-selectable capability |
| Tier 3 | Sonnet 4.5 | 51 | Support: testing, docs, debugging |
| Tier 4 | Haiku 4.5 | 18 | Fast: SEO, deployment, simple tasks |

**Agent Teams Plugin**: Manages parallel multi-agent workflows with 7 team presets (review, debug, feature, research, security, migration teams).

### Compound Engineering Plugin

[Source: Referenced in Addy Osmani's blog](https://addyosmani.com/blog/claude-code-agent-teams/)

Integrates with agent teams through a plan-work-review-compound cycle:

1. `/workflows:plan` -- creates detailed specs (upfront specification improves agent output)
2. `/workflows:review` -- runs multi-agent code review (security, performance, architecture independently)
3. `/workflows:compound` -- documents learnings for future agents

Philosophy: **80% planning and review, 20% execution**.

---

## 9. Comparison with CrewAI, LangGraph, AutoGen

### Conceptual Mapping

| Concept | Claude Code | CrewAI | LangGraph | AutoGen |
|---------|------------|--------|-----------|---------|
| **Skill** | SKILL.md (prompt) | Task definition | State/node config | Function decorator |
| **Agent** | .claude/agents/*.md | Agent class (role, goal, backstory) | Agent node in graph | ConversableAgent |
| **Team** | Agent Teams (TeamCreate) | Crew (sequential/hierarchical) | Multi-agent graph | GroupChat |
| **Task** | TaskCreate/TaskList | Task class | Graph state transition | Message passing |
| **Communication** | SendMessage/broadcast | Automatic handoff | Graph edges | Auto-reply chain |
| **Quality gate** | Hooks (TeammateIdle, TaskCompleted) | Callback handlers | Conditional edges | Reply validators |
| **Memory** | MEMORY.md / agent memory field | Long-term memory module | Checkpointer | TeachableAgent |

### Key Differences

**Claude Code Teams vs. CrewAI:**
- CrewAI: Agents defined in code with explicit `role`, `goal`, `backstory`; tasks assigned programmatically
- Claude Code: Agents defined in markdown; team coordination through natural language + shared task list
- CrewAI advantage: deterministic task routing, structured output parsing
- Claude Code advantage: agents load project context automatically (CLAUDE.md, skills, MCP)

**Claude Code Teams vs. LangGraph:**
- LangGraph: Graph-based workflow with explicit state machine, conditional edges, human-in-the-loop nodes
- Claude Code: Natural language coordination, self-organizing task claiming
- LangGraph advantage: precise control flow, state persistence, conditional branching
- Claude Code advantage: zero-code orchestration, agents are full IDE-aware sessions

**Claude Code Teams vs. AutoGen:**
- AutoGen: Conversational multi-agent with auto-reply chains, nested chats
- Claude Code: Independent sessions with mailbox messaging
- AutoGen advantage: rich conversation patterns, nested group chats
- Claude Code advantage: each agent is a full development environment with file access

### What Claude Code Can Learn

1. **From CrewAI**: "80/20 rule" -- 80% effort on task design, 20% on agent design. Well-scoped tasks matter more than agent sophistication.
2. **From LangGraph**: Explicit state machines and conditional routing. Claude Code's natural language routing is flexible but unpredictable.
3. **From AutoGen**: Nested group chats for structured debate. Claude Code's competing hypotheses pattern approximates this but less formally.

---

## 10. Anti-Patterns: When NOT to Use Teams

### When to Use Each Primitive

| Scenario | Use | Why |
|----------|-----|-----|
| Single focused task | Main conversation | Minimal overhead |
| Task needing isolation | Subagent (`context: fork` or Task tool) | Keeps main context clean |
| Multiple independent tasks | Subagents in parallel | Lower cost than team |
| Tasks needing inter-agent communication | Agent Teams | Only option for peer messaging |
| Tasks needing shared progress tracking | Agent Teams | Shared task list |
| Competing hypotheses / debate | Agent Teams | Agents challenge each other |
| Sequential pipeline | Single session or chained subagents | No benefit from team overhead |
| Same-file edits | Single session | Avoids conflicts |
| Quick, targeted changes | Main conversation | Subagent startup cost not justified |

### Anti-Patterns

**1. Team for Sequential Work**
If tasks must happen in order and each depends on the previous result, a team adds overhead without parallelism benefit. Use chained subagents or the main session.

**2. Team for Same-File Edits**
Two teammates editing the same file leads to overwrites. Break work so each teammate owns different files.

> "Two teammates editing the same file leads to overwrites. Break the work so each teammate owns a different set of files." -- [Official docs](https://code.claude.com/docs/en/agent-teams)

**3. Vague Task Descriptions**
"Build me an app" burns tokens while agents flail. Tasks must be specific, with clear deliverables.

> "This only works when tasks are properly scoped. 'Build me an app' burns tokens while agents flail. 'Implement these five clearly-defined API endpoints according to this specification' produces something good." -- [Addy Osmani](https://addyosmani.com/blog/claude-code-agent-teams/)

**4. Over-Engineering Orchestration**

> "Developers lose the plot, spending more time configuring orchestration patterns than thinking about what they're building. Let the problem guide the tooling, not the other way around." -- [Addy Osmani](https://addyosmani.com/blog/claude-code-agent-teams/)

**5. Unmonitored Teams**
Letting a team run unattended for too long increases risk of wasted effort. Check in on teammates, redirect divergent approaches.

**6. Broadcast Spam**
Using `broadcast` instead of `write` (direct message). Broadcasting messages to all teammates scales token cost linearly with team size.

**7. Missing Cleanup**
Always use the lead to clean up. Teammates should not run cleanup because their team context may not resolve correctly.

**8. Lead Implementing Instead of Delegating**
Without delegate mode, the lead sometimes starts implementing tasks itself. Use `Shift+Tab` to enable delegate mode, which restricts the lead to coordination-only tools.

**9. Token Cost Ignorance**
A 3-teammate session runs roughly 3-4x tokens vs sequential execution. Only justified for:
- Research phases benefiting from multiple perspectives
- Parallel debugging resolving issues faster
- Architectural decisions preventing costly mistakes
- Feature complexity requiring cross-functional coordination

---

## 11. Practical Composition Recipes

### Recipe 1: Skill as Entry Point + Team + Hook Quality Gate

**Components:**
- `.claude/skills/implement-feature/SKILL.md` -- entry point
- `.claude/settings.json` -- hooks for quality enforcement
- `.claude/hooks/verify-task.sh` -- task completion verification

**SKILL.md:**
```yaml
---
name: implement-feature
description: >
  Orchestrate a feature implementation using agent teams.
  Decomposes into parallel work streams with quality gates.
disable-model-invocation: true
---

## Feature Implementation Protocol

Given the feature description in $ARGUMENTS:

### Phase 1: Analysis (subagent)
Use an Explore subagent to analyze the codebase and identify:
- Files that need to change
- Dependencies between changes
- Test files that need updating

### Phase 2: Planning
Based on analysis, create a plan with:
- 3-5 independent work streams
- Clear file ownership per stream
- Dependency graph between streams

### Phase 3: Team Execution
1. Create an agent team named after the feature
2. Create tasks for each work stream (TaskCreate)
3. Add dependency relationships (blockedBy)
4. Spawn teammates (one per stream, Sonnet model)
5. Enable delegate mode (focus on coordination)

### Phase 4: Synthesis
After all tasks complete:
1. Verify no merge conflicts between teammates' changes
2. Run full test suite
3. Create summary of all changes

## Quality Criteria
- All tests must pass before task completion (enforced by hook)
- Each teammate must document their changes
- Integration points must be verified by lead
```

**verify-task.sh:**
```bash
#!/bin/bash
INPUT=$(cat)
TASK_SUBJECT=$(echo "$INPUT" | jq -r '.task_subject')

# Run tests
if ! npm test --silent 2>&1; then
  echo "Tests failing. Fix before completing: $TASK_SUBJECT" >&2
  exit 2
fi

# Check for uncommitted changes
if [ -n "$(git diff --name-only)" ]; then
  echo "Uncommitted changes detected. Commit before completing: $TASK_SUBJECT" >&2
  exit 2
fi

exit 0
```

### Recipe 2: Research Skill (fork) -> Team Implementation

**Two skills working together:**

**research-topic/SKILL.md:**
```yaml
---
name: research-topic
description: Deep research before implementation
context: fork
agent: Explore
---

Research $ARGUMENTS thoroughly:
1. Find all relevant files and patterns
2. Identify existing implementations to reuse
3. Map dependencies and integration points
4. Output a structured analysis to /tmp/research-output.md
```

**implement-from-research/SKILL.md:**
```yaml
---
name: implement-from-research
description: Implement based on previous research output
disable-model-invocation: true
---

Read the research output at /tmp/research-output.md, then:

1. Create an agent team for parallel implementation
2. Each work stream identified in the research becomes a task
3. Spawn teammates with research context in their spawn prompts
4. Coordinate implementation following the research recommendations

$ARGUMENTS
```

**Usage:**
```
/research-topic authentication refactoring options
# ... research completes, output saved ...
/implement-from-research
```

### Recipe 3: Review Team with Competing Perspectives

**review-pr/SKILL.md:**
```yaml
---
name: review-pr
description: Multi-perspective PR review using agent team
disable-model-invocation: true
---

## PR Review Protocol

Review PR $ARGUMENTS from multiple angles simultaneously:

1. Create team "pr-review-$ARGUMENTS"
2. Create tasks:
   - "Security review: check for vulnerabilities, injection, auth bypass"
   - "Performance review: check for N+1 queries, memory leaks, blocking ops"
   - "Test coverage: verify all new code paths have tests"
   - "Architecture review: check for coupling, naming, pattern adherence"
3. Spawn 4 teammates, one per review angle
4. Instruct teammates to challenge each other's findings via SendMessage
5. Wait for completion, synthesize findings by severity:
   - Critical (must fix)
   - Warning (should fix)
   - Suggestion (consider)
```

### Recipe 4: Workaround for Custom Agents as Teammates

Until Issue #24316 is resolved, embed agent instructions in spawn prompts:

```yaml
---
name: safe-refactor
description: Refactor with role-specific safety constraints
disable-model-invocation: true
---

## Safe Refactoring Protocol

Create team "safe-refactor" and spawn teammates with explicit constraints:

### Researcher (read-only behavior)
Spawn with prompt: "You are a READ-ONLY researcher. NEVER use Write or Edit tools.
Only use Read, Grep, and Glob. Analyze the codebase and report findings to the lead.
If you accidentally try to modify files, stop immediately."

### Implementer (scoped to specific directories)
Spawn with prompt: "You are an implementer. You may ONLY modify files in src/auth/.
Before editing any file, verify its path starts with src/auth/.
If a change is needed outside src/auth/, report it to the lead instead."

### Test Writer (test files only)
Spawn with prompt: "You are a test writer. You may ONLY create or modify files in
tests/ directory or files ending in .test.ts or .spec.ts.
Never modify source code -- only tests."

$ARGUMENTS
```

**Note**: This is prompt-based enforcement (fragile). It works in practice but is not deterministic. True tool restrictions require Issue #24316.

---

## 12. Recommendations for MMOS

Based on this research, here are actionable recommendations for the MMOS project:

### Immediate (can implement now)

1. **Create an orchestration skill** that serves as the team creation entry point. Use the pattern from Recipe 1: skill defines the decomposition strategy, Claude creates the team following instructions.

2. **Add TaskCompleted hooks** to enforce quality gates. Even without custom agent types, a hook that runs `npm test` before allowing task completion prevents most quality regressions.

3. **Use the "embed instructions in spawn prompt" workaround** (Recipe 4) for role differentiation until Issue #24316 ships.

4. **Keep the Kieran Klaassen swarm skill** as a reference. Its documentation of all 13 TeammateTool operations is the most complete available.

### Medium-term (when Issue #24316 ships)

5. **Migrate MMOS agents to teammate-compatible definitions**. The existing `.claude/agents/mmos-*.md` files should be usable as team teammates once the feature ships.

6. **Build team manifests** -- pre-configured team compositions for common workflows (e.g., "full-stack feature team" = researcher + backend + frontend + test writer).

7. **Implement persistent memory for review agents**. The `memory: project` field on subagents enables cross-session learning. When this applies to teammates, review agents can learn codebase patterns over time.

### Architecture Principles

8. **Skills define WHAT, agents define WHO, hooks enforce HOW**. Keep these concerns separated:
   - Skill: "Decompose feature X into tasks A, B, C"
   - Agent: "I am a security reviewer with read-only tools"
   - Hook: "Tests must pass before task completion"

9. **Prefer subagents for single-purpose work, teams for collaborative work**. If agents don't need to communicate, subagents are cheaper and simpler.

10. **Size tasks for 15-30 minute agent work, 5-6 tasks per teammate**. This balances coordination overhead against productive parallelism.

---

## Sources

### Official Documentation
- [Orchestrate teams of Claude Code sessions](https://code.claude.com/docs/en/agent-teams) -- Anthropic official docs on Agent Teams
- [Extend Claude with skills](https://code.claude.com/docs/en/skills) -- Anthropic official docs on Skills
- [Create custom subagents](https://code.claude.com/docs/en/sub-agents) -- Anthropic official docs on Subagents
- [Hooks reference](https://code.claude.com/docs/en/hooks) -- Anthropic official docs on Hooks (TeammateIdle, TaskCompleted)

### GitHub Issues
- [Issue #24316: Allow custom .claude/agents/ as agent team teammates](https://github.com/anthropics/claude-code/issues/24316) -- OPEN, high priority
- [Issue #17283: Skill tool should honor context: fork and agent: frontmatter](https://github.com/anthropics/claude-code/issues/17283) -- CLOSED (resolved Jan 2026)

### Community Skills & Tools
- [Kieran Klaassen: Swarm Orchestration Skill](https://gist.github.com/kieranklaassen/4f2aba89594a4aea4ad64d753984b2ea) -- Complete TeammateTool reference
- [Kieran Klaassen: Multi-Agent Orchestration System](https://gist.github.com/kieranklaassen/d2b35569be2c7f1412c64861a219d51f) -- Architecture patterns
- [levnikolaevich/claude-code-skills](https://github.com/levnikolaevich/claude-code-skills) -- 85 production-ready skills with orchestrator-worker patterns
- [wshobson/agents](https://github.com/wshobson/agents) -- 73 plugins, 112 agents, 146 skills
- [obra/superpowers Issue #429](https://github.com/obra/superpowers/issues/429) -- Discussion on TeammateTool support

### Blog Posts & Analysis
- [Addy Osmani: Claude Code Swarms](https://addyosmani.com/blog/claude-code-agent-teams/) -- Comprehensive analysis with anti-patterns
- [alexop.dev: From Tasks to Swarms](https://alexop.dev/posts/from-tasks-to-swarms-agent-teams-in-claude-code/) -- Architecture deep dive
- [alexop.dev: Understanding Claude Code Full Stack](https://alexop.dev/posts/understanding-claude-code-full-stack/) -- MCP, Skills, Subagents, Hooks composition
- [claudefa.st: Agent Teams Multi-Session Orchestration](https://claudefa.st/blog/guide/agents/agent-teams) -- Practical guide
- [paddo.dev: Claude Code's Hidden Multi-Agent System](https://paddo.dev/blog/claude-code-hidden-swarm/) -- Reverse-engineered internals
- [TechCrunch: Anthropic releases Opus 4.6 with agent teams](https://techcrunch.com/2026/02/05/anthropic-releases-opus-4-6-with-new-agent-teams/) -- Launch announcement

---

## Gaps

1. **No documentation on skill -> team programmatic integration**: The official docs describe skills and teams as separate features. No example of a skill that creates a team exists in official docs.

2. **Issue #24316 timeline unknown**: No Anthropic response on when custom agents as teammates will ship.

3. **No benchmarks on team vs subagent cost**: Community reports "3-4x" but no rigorous measurement with controlled tasks.

4. **Hook limitations for teams not well documented**: TeammateIdle not supporting prompt/agent hooks is only discoverable by reading the hooks reference carefully.

5. **No official "team manifest" format**: The concept of pre-defined team compositions (which agents, which tasks, which hooks) has no official support. Community is building this in various ad-hoc ways.

6. **Nested teams explicitly blocked**: Teammates cannot spawn their own teams. For deep hierarchical orchestration (e.g., MMOS pipeline with 9 agents), you must use a flat team structure or sequential team sessions.
