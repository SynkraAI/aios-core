# WAVE 3: Architecture Blueprint for Integrated Agents+Memory+Teams+Skills System

> **Synthesized from:** 12 research files (wave1-*.md + wave2-*.md)
> **Date:** 2026-02-09
> **Purpose:** Actionable blueprint for MMOS to integrate all four pillars
> **Target:** Immediate implementation with phased rollout

---

## Table of Contents

1. [Memory Architecture](#1-memory-architecture)
2. [Agent Specialization Registry](#2-agent-specialization-registry)
3. [Team Coordination Patterns](#3-team-coordination-patterns)
4. [Skill Composition Patterns](#4-skill-composition-patterns)
5. [Quality & Governance Layer](#5-quality--governance-layer)
6. [Implementation Roadmap](#6-implementation-roadmap)

---

## System Overview

```
+===========================================================================+
|                        MMOS INTEGRATED ARCHITECTURE                       |
+===========================================================================+
|                                                                           |
|  +------------------+    +------------------+    +------------------+     |
|  |     SKILLS       |    |     AGENTS       |    |      TEAMS       |     |
|  | (WHAT to do)     |    | (WHO does it)    |    | (HOW to coord)   |     |
|  |                  |    |                  |    |                  |     |
|  | /deep-research   |    | deep-researcher  |    | review-squad     |     |
|  | /execute-epic    |    | aios-dev         |    | build-team       |     |
|  | /copy-workflow   |    | copy-chief       |    | mmos-pipeline    |     |
|  +--------+---------+    +--------+---------+    +--------+---------+     |
|           |                       |                       |               |
|           +----------+------------+-----------+-----------+               |
|                      |                        |                           |
|              +-------v--------+      +--------v--------+                  |
|              |    MEMORY      |      |   GOVERNANCE    |                  |
|              | (WHAT learned) |      | (WHAT enforced) |                  |
|              |                |      |                 |                  |
|              | MEMORY.md      |      | Hooks           |                  |
|              | Session Memory |      | Quality Gates   |                  |
|              | Cross-session  |      | Cost Tracking   |                  |
|              +----------------+      +-----------------+                  |
|                                                                           |
+===========================================================================+
```

---

## 1. Memory Architecture

### 1.1 Agent Memory Scope Assignment

Every MMOS agent MUST have a `memory:` field in its frontmatter. The scope determines where the agent's MEMORY.md directory lives and who can access it.

#### Decision Matrix

```
                    Is this agent's knowledge...
                           |
              +------------+------------+
              |                         |
      Useful across            Useful only in
      ALL projects?            THIS project?
              |                         |
              v                         |
        memory: user            +-------+-------+
        ~/.claude/              |               |
        agent-memory/      Contains          General
        {name}/            secrets or         project
                           local paths?       knowledge?
                              |               |
                              v               v
                        memory: local    memory: project
                        .claude/         .claude/
                        agent-memory-    agent-memory/
                        local/{name}/    {name}/
```

#### MMOS Agent Memory Map

| Agent | Memory Scope | Rationale | Directory |
|-------|-------------|-----------|-----------|
| **deep-researcher** | `project` | Research findings are project-specific | `.claude/agent-memory/deep-researcher/` |
| **aios-dev** | `project` | Codebase patterns, debugging lessons | `.claude/agent-memory/aios-dev/` |
| **aios-architect** | `project` | Architecture decisions, trade-offs | `.claude/agent-memory/aios-architect/` |
| **aios-qa** | `project` | Test patterns, known flaky tests, regressions | `.claude/agent-memory/aios-qa/` |
| **aios-devops** | `project` | Deployment learnings, CI/CD issues | `.claude/agent-memory/aios-devops/` |
| **aios-pm** | `project` | Sprint patterns, estimation accuracy | `.claude/agent-memory/aios-pm/` |
| **aios-po** | `project` | Requirements patterns, stakeholder prefs | `.claude/agent-memory/aios-po/` |
| **aios-analyst** | `project` | Data patterns, query optimizations | `.claude/agent-memory/aios-analyst/` |
| **aios-sm** | `project` | Process metrics, retrospective insights | `.claude/agent-memory/aios-sm/` |
| **aios-ux** | `project` | Design patterns, component decisions | `.claude/agent-memory/aios-ux/` |
| **copy-chief** | `project` | Voice DNA, audience patterns, swipe insights | `.claude/agent-memory/copy-chief/` |
| **db-sage** | `project` | Schema evolution, migration patterns | `.claude/agent-memory/db-sage/` |
| **design-chief** | `project` | Design system decisions, token values | `.claude/agent-memory/design-chief/` |
| **cyber-chief** | `project` | Vulnerability patterns, security rules | `.claude/agent-memory/cyber-chief/` |
| **mmos-barbara** | `project` | Cognitive architecture patterns | `.claude/agent-memory/mmos-barbara/` |
| **mmos-tim** | `project` | Research patterns per mind | `.claude/agent-memory/mmos-tim/` |
| **mmos-daniel** | `project` | Behavioral analysis heuristics | `.claude/agent-memory/mmos-daniel/` |
| **mmos-charlie** | `project` | Synthesis quality patterns | `.claude/agent-memory/mmos-charlie/` |
| **mmos-constantin** | `project` | Implementation patterns | `.claude/agent-memory/mmos-constantin/` |
| **mmos-quinn** | `project` | Quality validation heuristics | `.claude/agent-memory/mmos-quinn/` |
| **mmos-victoria** | `project` | Viability assessment patterns | `.claude/agent-memory/mmos-victoria/` |
| **mmos-brene** | `project` | Emotional mapping patterns | `.claude/agent-memory/mmos-brene/` |
| **mmos-pm** | `project` | Pipeline orchestration patterns | `.claude/agent-memory/mmos-pm/` |

**Rule**: All MMOS agents use `memory: project` because their knowledge is MMOS-codebase-specific. Only a truly portable agent (e.g., a generic writing assistant) would use `memory: user`.

### 1.2 MEMORY.md Templates

#### Template A: Domain Specialist (dev, qa, architect, etc.)

```markdown
# {Agent Name} Memory

> Auto-loaded first 200 lines. Topic files for deep dives.
> Last updated: {date}
> Sessions: {count}

---

## Architecture Decisions (max 25 lines)

| Date | Decision | Rationale | Status |
|------|----------|-----------|--------|
| 2026-02-09 | Use Zustand over Redux | Simpler API, less boilerplate | Active |

## Patterns (max 25 lines)

### Effective
- Pattern: description (confidence: HIGH, last used: date)

### Anti-Patterns (avoid)
- Anti-pattern: why it fails (learned: date)

## Gotchas (max 20 lines)

- `component-name`: specific issue and fix (date)

## Progress (max 30 lines)

| Sprint | Key Deliverable | Learnings |
|--------|----------------|-----------|
| Current | Feature X | Found that Y approach works better |

## Context (max 15 lines)

- Current tech stack: Next.js 15, Supabase, Tailwind
- Key dependencies: {list}
- Active constraints: {list}
```

**Budget**: Architecture 25 + Patterns 25 + Gotchas 20 + Progress 30 + Context 15 = **115 lines** (85 lines buffer for headers/formatting to stay under 200).

#### Template B: MMOS Pipeline Specialist (barbara, tim, daniel, etc.)

```markdown
# MMOS {Role} Memory

> Pipeline-specific patterns. Auto-loaded first 200 lines.
> Last updated: {date}
> Minds processed: {count}

---

## Phase Heuristics (max 40 lines)

### What Works
- For {mind_type} minds: {approach} yields better results
- When source quality is LOW: {compensating strategy}

### What Fails
- {Approach} fails when {condition} (learned from {mind_slug})

## Cross-Mind Patterns (max 30 lines)

| Pattern | Frequency | Confidence | Example Mind |
|---------|-----------|------------|-------------|
| Authors need more contradictions analysis | 8/10 | HIGH | alan_nicolas |

## Quality Signals (max 25 lines)

- HIGH quality indicator: {signal}
- LOW quality indicator: {signal}
- Handoff readiness: {checklist items that matter most}

## Tool Effectiveness (max 20 lines)

| Tool/Technique | Success Rate | Best For |
|----------------|-------------|----------|
| YouTube transcripts for voice | 90% | Speakers, coaches |
| Book summaries for frameworks | 70% | Authors, academics |

## Active Minds Context (max 15 lines)

- Current active mind: {slug}
- Phase: {current_phase}
- Key challenges: {list}
```

#### Template C: Research Agent (deep-researcher)

Already implemented at `.claude/agent-memory/deep-researcher/MEMORY.md`. The existing template is effective. Key sections: Research Index, Source Quality Cache, Tool Reliability, Search Patterns, Anti-Patterns, Recent Discoveries. Keep as-is.

### 1.3 Cross-Session Learning Pipeline

```
Session N                          Session N+1                       Session N+2
+------------------+               +------------------+              +------------------+
| Agent executes   |               | Agent starts     |              | Agent starts     |
| task             |               |                  |              |                  |
|                  |               | MEMORY.md auto-  |              | MEMORY.md auto-  |
| Discovers        |               | loaded (200 ln)  |              | loaded (200 ln)  |
| pattern/gotcha   |               |                  |              |                  |
|                  |               | Recognizes       |              | Applies pattern  |
| Updates          |               | similar problem  |              | IMMEDIATELY      |
| MEMORY.md        |               |                  |              | (no rediscovery) |
|                  |               | Applies cached   |              |                  |
| Session Memory   |               | pattern          |              | Prunes outdated  |
| auto-captured    |               |                  |              | entries           |
+--------+---------+               +--------+---------+              +--------+---------+
         |                                  |                                 |
         v                                  v                                 v
   MEMORY.md v1                       MEMORY.md v2                      MEMORY.md v3
   (raw discovery)                    (validated)                       (curated)
```

#### Learning Loop Implementation

```yaml
# .claude/hooks/settings.json (conceptual -- actual hook config)
# PostToolUse hook that monitors for learning opportunities

hooks:
  PostToolUse:
    - name: learning-observer
      type: prompt
      prompt: |
        Analyze this tool result. If the agent:
        1. Fixed a bug after multiple attempts
        2. Discovered a non-obvious pattern
        3. Found a workaround for a limitation
        4. Made a mistake that cost > 3 tool calls

        Then suggest a MEMORY.md update. Format:
        MEMORY_UPDATE: {section} | {content} | {confidence}
      when:
        tool_name: ["Bash", "Edit", "Write"]
        # Only fire on tools that indicate real work
```

**Practical implementation** (no hook magic needed -- agent instructions):

Add to every agent's markdown body:

```markdown
## Memory Protocol

After completing your mission:
1. Review what you learned that was NOT in your MEMORY.md
2. If confidence > 0.7, update MEMORY.md with the new pattern
3. If an existing pattern proved WRONG, remove or correct it
4. Keep MEMORY.md under 200 lines (prune lowest-confidence items first)
```

### 1.4 Memory Pruning Strategy

The 200-line hard limit requires active curation. Each agent manages its own MEMORY.md with these rules:

#### Pruning Algorithm

```
For each entry in MEMORY.md:
  score = confidence * recency_weight * access_count

  recency_weight:
    last_7_days  = 1.0
    last_30_days = 0.8
    last_90_days = 0.5
    older        = 0.3

  If score < THRESHOLD (0.2):
    → Move to topic file (e.g., archived-patterns.md)
    → Remove from MEMORY.md

  If MEMORY.md > 180 lines:
    → Sort all entries by score
    → Move bottom 20% to topic files
    → Summarize moved entries in one line: "See archived-patterns.md for N older patterns"
```

#### Topic Files for Overflow

```
.claude/agent-memory/{agent-name}/
  MEMORY.md                    # First 200 lines, auto-loaded
  archived-patterns.md         # Pruned but potentially useful
  debugging-log.md             # Detailed debugging histories
  {domain}-deep-dive.md        # Domain-specific deep knowledge
```

Topic files are loaded ON DEMAND when the agent encounters a related problem. They have no line limit.

#### Compound Learning Metrics

Track in MEMORY.md header:

```markdown
> Sessions: 47 | Patterns: 23 | Gotchas: 15 | Pruned: 31
> Avg task completion: 12 turns (was 18 at session 1)
> Top pattern hit rate: 85% (pattern applied successfully)
```

---

## 2. Agent Specialization Registry

### 2.1 Competency Matrix

Every agent in the system has a defined competency profile. This matrix enables the orchestrator to route tasks to the best-performing agent.

```
+-----------------------------------------------------------------------+
|                    AGENT COMPETENCY MATRIX                            |
+-----------------------------------------------------------------------+
|                                                                       |
|  Agent            | Domain          | Model   | Permission  | Memory |
|  -----------------+-----------------+---------+-------------+--------|
|  INFRASTRUCTURE LAYER                                                |
|  aios-dev         | Frontend/Back   | inherit | acceptEdits | project|
|  aios-architect   | System Design   | opus    | plan        | project|
|  aios-qa          | Testing/QA      | inherit | acceptEdits | project|
|  aios-devops      | CI/CD/Deploy    | inherit | bypassPerms | project|
|  db-sage          | Database/SQL    | opus    | default     | project|
|  design-system    | DS Components   | inherit | acceptEdits | project|
|  dev-native       | Quick Code      | sonnet  | bypassPerms | none   |
|  -----------------+-----------------+---------+-------------+--------|
|  PRODUCT LAYER                                                       |
|  aios-pm          | Project Mgmt    | inherit | plan        | project|
|  aios-po          | Product Owner   | inherit | plan        | project|
|  aios-sm          | Scrum Master    | inherit | plan        | project|
|  aios-analyst     | Data Analysis   | inherit | default     | project|
|  aios-ux          | UX Design       | inherit | plan        | project|
|  -----------------+-----------------+---------+-------------+--------|
|  DOMAIN SQUADS                                                       |
|  copy-chief       | Copywriting     | opus    | bypassPerms | project|
|  design-chief     | Visual Design   | inherit | plan        | project|
|  cyber-chief      | Security        | opus    | default     | project|
|  data-chief       | Data Strategy   | inherit | default     | project|
|  -----------------+-----------------+---------+-------------+--------|
|  MMOS PIPELINE                                                       |
|  mmos-tim         | Research        | inherit | bypassPerms | project|
|  mmos-barbara     | Cognition       | opus    | bypassPerms | project|
|  mmos-daniel      | Behavior        | inherit | bypassPerms | project|
|  mmos-brene       | Emotions        | opus    | bypassPerms | project|
|  mmos-charlie     | Synthesis       | opus    | bypassPerms | project|
|  mmos-constantin  | Implementation  | opus    | bypassPerms | project|
|  mmos-quinn       | Quality         | opus    | bypassPerms | project|
|  mmos-victoria    | Viability       | opus    | bypassPerms | project|
|  mmos-pm          | Orchestration   | inherit | bypassPerms | project|
|  -----------------+-----------------+---------+-------------+--------|
|  RESEARCH                                                            |
|  deep-researcher  | Web Research    | inherit | bypassPerms | project|
|  Explore          | Codebase Read   | haiku   | plan        | none   |
|  Plan             | Planning        | inherit | plan        | none   |
|                                                                       |
+-----------------------------------------------------------------------+
```

### 2.2 Performance Tracking Per Agent

Each agent tracks its own performance metrics in MEMORY.md. The orchestrator (main Claude session) reads these to make routing decisions.

#### Metric Schema

```markdown
## Performance Metrics

| Metric | Value | Trend |
|--------|-------|-------|
| Avg turns to complete | 12 | DOWN (was 18) |
| Success rate (task completed correctly) | 87% | UP |
| Rework rate (output needed correction) | 13% | DOWN |
| Avg tokens consumed per task | 45K | STABLE |
| Last 5 task outcomes | OK OK OK REWORK OK | |
```

#### Performance Update Protocol

Add to agent body instructions:

```markdown
## Performance Tracking

When you complete a task:
1. If task succeeded on first attempt: increment success_count
2. If task needed rework: increment rework_count
3. Update avg_turns with exponential moving average
4. Record outcome in "Last 5 task outcomes" (rolling window)
```

### 2.3 Dynamic Routing

The orchestrator (main Claude session or a skill like `/execute-epic`) uses agent competency data to route tasks.

#### Routing Decision Tree

```
Incoming Task
    |
    +-- What domain? ---------> Match agent by competency
    |                               |
    |                          Multiple matches?
    |                               |
    |                    +----------+-----------+
    |                    |                      |
    |               Check MEMORY.md        Check model cost
    |               performance metrics
    |                    |                      |
    |               Pick highest            Pick cheapest
    |               success rate            that meets threshold
    |                    |                      |
    |                    +----------+-----------+
    |                               |
    +-- How complex? -------> Route to appropriate model tier
    |                               |
    |                    +---------+---------+---------+
    |                    |                   |         |
    |                  Simple            Medium     Complex
    |                  Haiku/Sonnet      Sonnet     Opus
    |                  (Explore,         (most      (architect,
    |                   dev-native)      agents)    barbara, qa)
    |
    +-- Needs coordination? ---> Subagent vs Team decision
                                    (see Section 3)
```

#### Model Tier Routing (Cost Optimization)

Based on wave2 research, 3-tier routing saves 50-80% on token costs:

| Tier | Model | Use Case | Cost Multiplier |
|------|-------|----------|-----------------|
| **Exploration** | Haiku | File reading, search, simple queries | 1x (baseline) |
| **Implementation** | Sonnet | Code writing, standard tasks | 3x |
| **Reasoning** | Opus | Architecture, complex analysis, quality review | 15x |

```yaml
# Conceptual routing config (implemented in skill/agent instructions)
routing_rules:
  - pattern: "read files and summarize"
    agent: Explore
    tier: haiku

  - pattern: "implement feature|write code|fix bug"
    agent: aios-dev
    tier: sonnet

  - pattern: "design architecture|review security|analyze patterns"
    agent: aios-architect
    tier: opus

  - pattern: "research topic|find information"
    agent: deep-researcher
    tier: inherit  # Researcher manages its own token budget

  - pattern: "mmos pipeline|mind extraction"
    agent: mmos-pm  # Routes to specific MMOS agent
    tier: opus
```

### 2.4 Agent Registry File

Create a machine-readable registry that skills and orchestrators can reference:

```yaml
# .claude/agent-registry.yaml
# Machine-readable agent competency registry
# Updated manually or via /refresh-registry skill

version: 1
updated: 2026-02-09

agents:
  aios-dev:
    file: .claude/agents/aios-dev.md
    domains: [frontend, backend, fullstack, react, nextjs, typescript]
    model_tier: sonnet
    permission: acceptEdits
    memory: project
    cost_profile: medium
    best_for: ["implement feature", "fix bug", "refactor code"]

  aios-architect:
    file: .claude/agents/aios-architect.md
    domains: [architecture, system-design, security, scalability]
    model_tier: opus
    permission: plan
    memory: project
    cost_profile: high
    best_for: ["design system", "review architecture", "evaluate trade-offs"]

  deep-researcher:
    file: .claude/agents/deep-researcher.md
    domains: [research, web-search, synthesis, analysis]
    model_tier: inherit
    permission: bypassPermissions
    memory: project
    cost_profile: variable
    best_for: ["research topic", "find sources", "deep analysis"]

  mmos-barbara:
    file: .claude/agents/mmos-barbara.md
    domains: [cognitive-architecture, mental-models, belief-systems]
    model_tier: opus
    permission: bypassPermissions
    memory: project
    cost_profile: high
    pipeline_phase: analysis
    best_for: ["cognitive extraction", "mental model mapping"]

  # ... (all other agents follow same schema)

# Routing shortcuts
domain_routing:
  frontend: aios-dev
  backend: aios-dev
  database: db-sage
  security: cyber-chief
  design: design-chief
  copy: copy-chief
  research: deep-researcher
  mmos: mmos-pm
  testing: aios-qa
  deployment: aios-devops
  data: aios-analyst
```

**Location**: `.claude/agent-registry.yaml`

Skills can read this file to make routing decisions without hardcoding agent names.

---

## 3. Team Coordination Patterns

### 3.1 When to Use What

```
                          Task Analysis
                              |
                     How many agents needed?
                              |
                   +----------+----------+
                   |                     |
                 ONE                   TWO+
                   |                     |
                   v                     |
              Subagent              Do agents need to
              (Task tool)           communicate with
                                    each other?
                                         |
                                +--------+--------+
                                |                 |
                               NO                YES
                                |                 |
                                v                 v
                          Parallel            Agent Team
                          Subagents           (TeamCreate)
                          (multiple Task
                           tool calls)        Do they need
                                              to self-organize?
                                                   |
                                              +----+----+
                                              |         |
                                             NO        YES
                                              |         |
                                              v         v
                                         Sequential  Self-Organizing
                                         Pipeline    Swarm (rare,
                                         Team        high cost)
```

#### Decision Matrix (Concrete)

| Scenario | Pattern | Est. Cost | Example |
|----------|---------|-----------|---------|
| Read files and summarize | Single subagent (Explore) | ~5K tokens | Code review of one file |
| Implement one feature | Single subagent (aios-dev) | ~50K tokens | Add a new component |
| Review PR from 3 angles | Parallel subagents (3x) | ~150K tokens | Security + perf + tests |
| Full feature: design + implement + test | Sequential pipeline team | ~500K tokens | New API endpoint |
| MMOS full pipeline (8 phases) | Sequential pipeline team | ~1M+ tokens | Complete mind extraction |
| Competing architecture proposals | Parallel team + synthesis | ~400K tokens | Evaluate 3 arch options |
| Complex refactoring (many files) | Team with file ownership | ~800K tokens | Migrate to new pattern |

### 3.2 Team Templates

#### Template 1: Parallel Review Team

```
Use case: Multi-perspective review (PR, architecture, copy)
Agents: 3-5 specialists running simultaneously
Coordination: File-based (each writes to own review file)
Lead action: Synthesize after all complete

+--------------------+
|    Team Lead       |
| (main session)     |
+--------+-----------+
         |
    TeamCreate("review-squad")
         |
    +----+----+----+
    |         |    |
    v         v    v
 Teammate   Mate  Mate
 Security   Perf  Tests
    |         |    |
    v         v    v
 review-    review- review-
 security   perf    tests
 .md        .md     .md
    |         |    |
    +----+----+----+
         |
         v
    Lead synthesizes
    unified-review.md
```

**Skill implementation**:

```yaml
# .claude/skills/parallel-review/SKILL.md
---
name: parallel-review
description: Launch multi-agent parallel review with security, performance, and test coverage specialists
disable-model-invocation: true
---

## Parallel Review Workflow

1. Create team: `TeamCreate("review-squad")`
2. Create tasks for each reviewer:
   - Task 1: "Security review - focus on auth, injection, secrets" (assign to security specialist)
   - Task 2: "Performance review - focus on N+1, bundle size, memo" (assign to perf specialist)
   - Task 3: "Test coverage review - focus on edge cases, mocking" (assign to test specialist)
3. Wait for all tasks to reach status "completed"
4. Read all review outputs
5. Synthesize into unified review with severity ratings
6. Clean up: `TeamDelete("review-squad")`

Each reviewer should:
- Run `gh pr diff` to get the current PR changes
- Analyze ONLY their domain (do not overlap)
- Write findings to `/tmp/review-{domain}.md`
- Rate each finding: CRITICAL / HIGH / MEDIUM / LOW
```

#### Template 2: Sequential Pipeline Team

```
Use case: Multi-phase workflows where each phase depends on previous
Agents: 2-4 specialists running in sequence
Coordination: Handoff documents between phases
Lead action: Monitor progress, handle phase transitions

Phase 1           Phase 2           Phase 3           Phase 4
+----------+      +----------+      +----------+      +----------+
| Research |  ->  | Design   |  ->  | Implement|  ->  | Review   |
| (Tim)    |      | (Arch)   |      | (Dev)    |      | (QA)     |
+----------+      +----------+      +----------+      +----------+
     |                 |                 |                 |
     v                 v                 v                 v
  research-         design-          impl-            review-
  findings.md       proposal.md      changes.md       report.md
     |                 |                 |                 |
     +--- blockedBy ---+--- blockedBy --+--- blockedBy ---+
```

**Handoff document format** (from ECC research):

```markdown
# Handoff: {Phase N} -> {Phase N+1}

## Status: SHIP | NEEDS WORK | BLOCKED

## Context
- What was done in this phase
- Key decisions made

## Findings
- Finding 1 (with evidence)
- Finding 2 (with evidence)

## Files Modified
- path/to/file.ts (what changed, why)

## Questions for Next Phase
- Question 1?
- Question 2?

## Recommendations
- Recommendation for next phase
```

#### Template 3: MMOS Pipeline Team

The MMOS pipeline has 9 agents that execute in a defined sequence. This is the most complex team template.

```
                    MMOS Pipeline Orchestration

    Phase 1-2: Research          Phase 3-5: Analysis
    +--------+  +--------+      +--------+  +--------+  +--------+
    | Tim    |->| Tim    |  ->  | Barbara|->| Daniel |->| Brene  |
    | Source |  | Deep   |      | Cogni- |  | Behav- |  | Emoti- |
    | Gather |  | Resrch |      | tive   |  | ioral  |  | onal   |
    +--------+  +--------+      +--------+  +--------+  +--------+
                                     |           |           |
                                     v           v           v
                                  +--------------------------+
                                  |  Phase 6: Synthesis      |
                                  |  Charlie combines all    |
                                  +-----------+--------------+
                                              |
                                              v
                                  +-----------+--------------+
                                  |  Phase 7: Implementation |
                                  |  Constantin builds       |
                                  |  system prompt           |
                                  +-----------+--------------+
                                              |
                                              v
                                  +-----------+--------------+
                                  |  Phase 8: Quality        |
                                  |  Quinn validates         |
                                  +-----------+--------------+
                                              |
                                              v
                                  +-----------+--------------+
                                  |  Phase 9: Viability      |
                                  |  Victoria assesses       |
                                  +--------------------------+

    Orchestrator: mmos-pm (monitors state.json, handles transitions)
```

**Implementation**: The MMOS pipeline already uses Context Parity (`mmos-context-loader.cjs`). The enhancement is adding `memory: project` to each agent wrapper so cross-session patterns accumulate.

### 3.3 File-Based vs Message-Based Coordination

```
                    Choose Coordination Method
                              |
                    Does Phase N+1 need the
                    COMPLETE output of Phase N?
                              |
                    +---------+---------+
                    |                   |
                   YES                 NO
                    |                   |
                    v                   v
              FILE-BASED          MESSAGE-BASED
              coordination        coordination
                    |                   |
              Write to shared     Use SendMessage
              file path           for status/questions
              (/tmp/ or docs/)
                    |                   |
              Next agent reads    Quick back-and-forth
              file at start       between teammates
              of its phase
                    |                   |
              BEST FOR:            BEST FOR:
              - Handoffs           - Status updates
              - Large outputs      - Clarifications
              - Audit trail        - Voting/consensus
              - MMOS pipeline      - Quick coordination
```

**Rule of thumb**: If the data being shared is > 500 tokens, use files. If it is a status update or question, use messages.

#### File Coordination Paths

| Workflow | Shared File Location | Format |
|----------|---------------------|--------|
| PR Review | `/tmp/review-{domain}.md` | Markdown |
| MMOS Pipeline | `outputs/minds/{slug}/metadata/state.json` | JSON |
| Architecture Decision | `docs/architecture/decisions/ADR-{N}.md` | Markdown |
| Research | `docs/research/{date}-{slug}/` | Markdown dir |
| Build artifacts | `/tmp/build-{feature}/` | Mixed |

---

## 4. Skill Composition Patterns

### 4.1 Skill + Agent Composition

Skills define WHAT to do. Agents define WHO does it. The composition determines HOW they interact.

```
                    SKILL COMPOSITION PATTERNS

    Pattern 1: Simple Skill           Pattern 2: Forked Skill
    (runs in main context)            (runs in subagent)

    /commit                           /deep-research
    +------------------+              +------------------+
    | name: commit     |              | name: deep-rsch  |
    | desc: ...        |              | context: fork    |
    |                  |              | agent: deep-     |
    | Body runs in     |              |   researcher     |
    | main session     |              |                  |
    +------------------+              | Body runs in     |
                                      | isolated context |
                                      +------------------+

    Pattern 3: Skill -> Team          Pattern 4: Agent -> Skills
    (skill triggers team creation)    (agent has pre-loaded skills)

    /parallel-review                  deep-researcher agent
    +------------------+              +------------------+
    | name: parallel-  |              | name: deep-rsch  |
    |   review         |              | skills:          |
    | disable-model-   |              |   - tech-research|
    |   invocation     |              |   - mind-research|
    |                  |              |                  |
    | Body instructs   |              | Agent can invoke |
    | Claude to create |              | pre-loaded skills|
    | TeamCreate(...)  |              | within its ctx   |
    +------------------+              +------------------+
```

### 4.2 Skill Pipeline Patterns

Skills can be chained where the output of one feeds the next. The orchestrating agent (or user) drives the pipeline.

#### Linear Pipeline

```
/analyze-codebase -> /design-architecture -> /implement-plan -> /qa-review

Each skill:
1. Reads output of previous skill (from file)
2. Executes its specific workflow
3. Writes output to file for next skill
```

**Implementation via orchestrator skill**:

```yaml
# .claude/skills/execute-epic/SKILL.md (simplified)
---
name: execute-epic
description: Orchestrate a multi-phase epic execution with analysis, design, implementation, and review
disable-model-invocation: true
---

## Epic Execution Pipeline

Read the epic at `$ARGUMENTS` and execute each story in order:

For each story:
1. **Analyze**: Use Explore agent to understand scope
2. **Plan**: Use Plan agent to create approach
3. **Implement**: Delegate to aios-dev agent
4. **Test**: Delegate to aios-qa agent
5. **Review**: Check against acceptance criteria

Between phases, create handoff documents at:
`/tmp/epic-{slug}/phase-{N}-handoff.md`
```

#### Fan-Out / Fan-In Pipeline

```
                    /research-topic
                         |
              +----------+----------+
              |          |          |
              v          v          v
         WebSearch   WebSearch   WebSearch
         (query 1)   (query 2)   (query 3)
              |          |          |
              +----------+----------+
                         |
                    Deep-read top
                    10-15 results
                         |
                    Synthesize into
                    structured report
```

This is exactly how the deep-researcher agent works. The fan-out is implicit (multiple parallel WebSearch calls), and the fan-in is the synthesis phase.

#### Generator-Critic Loop

```
            +----> Generate ---+
            |      (Dev)       |
            |                  v
            |              Output
            |                  |
            +---- Reject <-----+----> Critique
            |                        (QA)
            |                          |
            |                     Pass? ----> Accept
            |                      |
            +---------- NO --------+

    MAX 2 iterations (bounded to prevent runaway costs)
```

**Implementation**:

```yaml
# Conceptual -- implemented in skill body instructions
# The skill instructs Claude to:

1. Generate output using aios-dev
2. Review output using aios-qa
3. If QA finds CRITICAL issues:
   a. Send feedback to dev with specific fix instructions
   b. Dev generates v2
   c. QA reviews v2
   d. Accept (even if minor issues remain -- log for next time)
4. If QA finds only MINOR issues: Accept with notes
5. MAX 2 review cycles. After 2, accept with full issue list.
```

### 4.3 Dynamic Skill Discovery and Matching

Claude Code uses progressive disclosure to keep token costs low while maintaining a large skill library.

```
                    SKILL DISCOVERY PIPELINE

    Layer 1: Always Loaded (~100 tokens per skill)
    +-----------------------------------------------+
    | name: commit         | desc: Git commit...     |
    | name: deep-research  | desc: Deep research...  |
    | name: execute-epic   | desc: Epic execution... |
    | ... (all skills, metadata only)                 |
    +-----------------------------------------------+
                         |
                    User request or
                    Claude auto-match
                         |
    Layer 2: On Match (~5K tokens)
    +-----------------------------------------------+
    | Full SKILL.md body loaded                      |
    | Instructions, steps, references                |
    +-----------------------------------------------+
                         |
                    Skill references
                    external files
                         |
    Layer 3: On Demand (unlimited)
    +-----------------------------------------------+
    | @file references loaded                        |
    | Linked markdown files                         |
    | Data files, templates, checklists             |
    +-----------------------------------------------+
```

#### Token Budget Math

Current MMOS has ~22 project skills + ~500 squad skills.

```
Startup cost:  522 skills x ~100 tokens/skill = ~52K tokens always loaded
Match cost:    1 skill x ~5K tokens = 5K tokens when matched
Demand cost:   Variable (only when skill references external files)

Total baseline: ~52K tokens (acceptable -- well under context window limits)
```

**Optimization**: If skill count exceeds ~100, Claude Code auto-activates MCP tool search (configurable via `ENABLE_TOOL_SEARCH`) which uses semantic matching instead of loading all metadata.

#### Description Quality Checklist

The `description` field is the MOST IMPORTANT part of a skill for auto-discovery. It determines whether Claude matches the skill to a user request.

```
GOOD description (high match rate):
  "Deep research with parallel web search, page reading, and synthesis.
   Handles YouTube transcripts, PDF extraction, and blog articles.
   Produces structured reports with citations and gap analysis."

BAD description (low match rate):
  "Research stuff"
  "Handles research tasks"
```

Rules:
- Include key action verbs: "research", "analyze", "generate", "review"
- Include key nouns: "PR", "architecture", "copy", "pipeline"
- Include output format: "report", "code", "review document"
- Max 1024 characters (Anthropic limit)
- First sentence is most important (used for quick matching)

### 4.4 Skill Composition Map for MMOS

```yaml
# Current skill -> agent composition in MMOS

skills:
  tech-research:
    invokes: deep-researcher (via context: fork)
    output: docs/research/{date}-{slug}/

  mind-research:
    invokes: deep-researcher (via context: fork)
    output: outputs/minds/{slug}/research/

  execute-epic:
    invokes: multiple agents sequentially
    agents_used: [aios-dev, aios-qa, aios-architect]
    output: code changes + story updates

  copy-workflow:
    invokes: copy-chief (via context: fork)
    agents_used: [copy-chief, then specific copywriter agents]
    output: copy documents

  deep-strategic-planning:
    invokes: Plan agent
    references: deep-strategic-planning/planning-methodology.md
    output: strategy document

  commit:
    invokes: none (runs in main context)
    output: git commit

  story-cycle:
    invokes: multiple agents per phase
    agents_used: [aios-pm, aios-dev, aios-qa]
    output: story progress updates

# Planned compositions (Phase 2+):

  parallel-review:
    invokes: Team (3 reviewers)
    agents_used: [cyber-chief, aios-qa, aios-dev]
    output: unified review document

  mmos-full-pipeline:
    invokes: Sequential team (8 agents)
    agents_used: [mmos-tim, mmos-barbara, mmos-daniel, mmos-brene,
                  mmos-charlie, mmos-constantin, mmos-quinn, mmos-victoria]
    orchestrator: mmos-pm
    output: complete mind extraction
```

---

## 5. Quality & Governance Layer

### 5.1 Hook-Based Quality Gates

MMOS already has hooks at `.claude/hooks/`. The integrated architecture adds governance hooks for agent teams and memory.

#### Current Hooks (Already Implemented)

| Hook | Event | Purpose |
|------|-------|---------|
| `read-protection.py` | PreToolUse (Read) | Blocks partial reads on protected files |
| `sql-governance.py` | PreToolUse (Bash) | Blocks unauthorized DDL |
| `slug-validation.py` | PreToolUse (Write) | Enforces snake_case slugs |
| `enforce-architecture-first.py` | PreToolUse (Write) | Requires docs before code |
| `write-path-validation.py` | PreToolUse (Write) | Warns on incorrect paths |
| `mind-clone-governance.py` | PreToolUse (Write) | Blocks clone without DNA |
| `inject-current-date.sh` | SessionStart | Injects current date |
| `inject-agent-context.sh` | SubagentStart | Loads agent context |

#### New Hooks for Integrated Architecture

```yaml
# .claude/hooks/settings.json additions (conceptual)

hooks:
  # 1. Memory size guard
  PostToolUse:
    - name: memory-size-guard
      type: command
      command: |
        python3 .claude/hooks/memory-size-guard.py "$TOOL_INPUT"
      when:
        tool_name: Write
        # Only fires when writing to agent-memory directories
      description: |
        Warns if MEMORY.md exceeds 200 lines after write.
        Blocks if exceeds 250 lines (hard limit).

  # 2. Team cost tracker
  PostToolUse:
    - name: team-cost-tracker
      type: command
      command: |
        python3 .claude/hooks/team-cost-tracker.py "$TOOL_NAME" "$TOOL_INPUT"
      when:
        tool_name: [TeamCreate, TaskCreate, Task]
      description: |
        Tracks estimated token cost for team operations.
        Warns at 80% of budget. Blocks at 100%.

  # 3. Agent compliance logger
  SubagentStart:
    - name: agent-compliance
      type: command
      command: |
        python3 .claude/hooks/agent-compliance-logger.py "$AGENT_NAME"
      description: |
        Logs agent spawn events for audit trail.
        Verifies agent has required memory: field.

  # 4. Handoff quality gate
  PostToolUse:
    - name: handoff-quality
      type: prompt
      prompt: |
        Check if this file write is a handoff document.
        If yes, verify it has: Status, Context, Findings,
        Files Modified, Questions, Recommendations.
        Return PASS or FAIL with missing sections.
      when:
        tool_name: Write
        # Pattern match on handoff file paths
```

#### Hook Implementation: memory-size-guard.py

```python
#!/usr/bin/env python3
"""
Hook: memory-size-guard
Event: PostToolUse (Write)
Purpose: Prevent MEMORY.md files from exceeding 200-line limit
"""
import sys
import json
import os

def check_memory_size(tool_input):
    try:
        data = json.loads(tool_input)
        file_path = data.get('file_path', '')

        # Only check agent-memory MEMORY.md files
        if 'agent-memory' not in file_path or 'MEMORY.md' not in file_path:
            return {"decision": "allow"}

        content = data.get('content', '')
        line_count = content.count('\n') + 1

        if line_count > 250:
            return {
                "decision": "block",
                "reason": f"MEMORY.md has {line_count} lines (hard limit: 250). "
                          f"Prune low-confidence entries to topic files first."
            }
        elif line_count > 200:
            return {
                "decision": "allow",  # Allow but warn
                "message": f"WARNING: MEMORY.md has {line_count} lines. "
                           f"Only first 200 are auto-loaded. Consider pruning."
            }

        return {"decision": "allow"}
    except Exception as e:
        return {"decision": "allow"}  # Fail open

if __name__ == "__main__":
    result = check_memory_size(sys.argv[1] if len(sys.argv) > 1 else '{}')
    print(json.dumps(result))
```

### 5.2 Automated Testing Between Phases

For team-based workflows, each phase transition includes a quality check.

```
Phase N Output
      |
      v
+------------------+
| Quality Gate     |
|                  |
| 1. Format check  |  <- Deterministic (script)
| 2. Completeness  |  <- Deterministic (checklist)
| 3. Semantic       |  <- LLM-based (QA agent)
|    quality        |
+--------+---------+
         |
    +----+----+
    |         |
   PASS      FAIL
    |         |
    v         v
  Phase     Rework
  N+1       (bounded:
            max 2 tries)
```

#### Quality Gate Implementation

```bash
#!/usr/bin/env bash
# .claude/scripts/quality-gate.sh
# Usage: quality-gate.sh <handoff-file> <phase>

HANDOFF_FILE="$1"
PHASE="$2"

# 1. Format check (deterministic)
REQUIRED_SECTIONS=("## Status" "## Context" "## Findings" "## Files Modified")
for section in "${REQUIRED_SECTIONS[@]}"; do
    if ! grep -q "$section" "$HANDOFF_FILE"; then
        echo "FAIL: Missing section: $section"
        exit 1
    fi
done

# 2. Completeness check (deterministic)
WORD_COUNT=$(wc -w < "$HANDOFF_FILE")
if [ "$WORD_COUNT" -lt 50 ]; then
    echo "FAIL: Handoff too short ($WORD_COUNT words, min 50)"
    exit 1
fi

# 3. Status check
STATUS=$(grep "## Status" "$HANDOFF_FILE" | head -1)
if echo "$STATUS" | grep -q "BLOCKED"; then
    echo "BLOCKED: Phase cannot proceed"
    exit 2
fi

echo "PASS: Quality gate passed for phase $PHASE"
exit 0
```

### 5.3 Cost Tracking and Budget Management

#### Token Cost Model

```
                    COST TRACKING ARCHITECTURE

    +------------------+
    | Session Start    |
    | Set budget:      |
    | maxBudgetUsd     |  <- SDK-level (for headless)
    | or instruction-  |  <- Instruction-level (for interactive)
    | level tracking   |
    +--------+---------+
             |
    +--------v---------+
    | Per-Agent         |
    | Tracking          |
    |                   |
    | Agent tracks in   |
    | MEMORY.md:        |
    | - avg tokens/task |
    | - total sessions  |
    | - cost trend      |
    +--------+---------+
             |
    +--------v---------+
    | Per-Team          |
    | Tracking          |
    |                   |
    | team-cost-tracker |
    | hook logs:        |
    | - agents spawned  |
    | - tasks created   |
    | - estimated cost  |
    +--------+---------+
             |
    +--------v---------+
    | Alerts            |
    |                   |
    | 50% budget: INFO  |
    | 80% budget: WARN  |
    | 100% budget: STOP |
    +------------------+
```

#### Cost Estimation Table

Based on wave1 and wave2 research findings:

| Operation | Estimated Tokens | Estimated Cost (Opus) |
|-----------|-----------------|----------------------|
| Single subagent task | 30-80K | $0.30-0.80 |
| Parallel subagents (3) | 100-250K | $1.00-2.50 |
| 3-person team | 500-1M | $5.00-10.00 |
| 5-person team | 800K-1.5M | $8.00-15.00 |
| MMOS full pipeline (8 agents) | 1-2M | $10.00-20.00 |
| Deep research (30+ sources) | 200-400K | $2.00-4.00 |

#### Budget Enforcement

For the Agent SDK (headless mode):

```typescript
import { query } from '@anthropic-ai/claude-code';

const result = query({
  prompt: "Execute the MMOS pipeline for mind: alan_nicolas",
  options: {
    maxBudgetUsd: 25.00,  // Hard cap
    // ... other options
  }
});
```

For interactive mode (instruction-based):

```markdown
## Cost Awareness Protocol

You have a budget of approximately $X for this task.
Track your progress:
- After each major phase, estimate tokens consumed
- If approaching 80% of budget, inform the user
- If budget exceeded, STOP and present partial results

Cost-saving strategies:
1. Use Explore (Haiku) for read-only tasks
2. Batch file reads (multiple Read calls in one message)
3. Write comprehensive prompts to subagents (fewer turns)
4. Use progressive disclosure (don't load data until needed)
```

### 5.4 Performance Metrics Dashboard

Track these metrics across sessions to measure the integrated architecture's effectiveness:

```markdown
## Integrated Architecture Metrics

### Efficiency Metrics
| Metric | Baseline | Current | Target |
|--------|----------|---------|--------|
| Avg turns per task (dev) | 18 | - | 12 |
| Rework rate (QA feedback) | 25% | - | 10% |
| Cost per MMOS pipeline | $30 | - | $15 |
| Research completeness | 60% | - | 90% |
| Agent memory hit rate | 0% | - | 70% |

### Quality Metrics
| Metric | Baseline | Current | Target |
|--------|----------|---------|--------|
| First-attempt success rate | 65% | - | 85% |
| Handoff quality score | N/A | - | 90% |
| Cross-session pattern reuse | 0% | - | 60% |
| Hook violation rate | 15% | - | 5% |

### Cost Metrics
| Metric | Baseline | Current | Target |
|--------|----------|---------|--------|
| Tokens per task (avg) | 80K | - | 50K |
| Opus usage ratio | 90% | - | 40% |
| Haiku usage ratio | 0% | - | 30% |
| Sonnet usage ratio | 10% | - | 30% |
```

---

## 6. Implementation Roadmap

### Phase 1: Memory Foundation (Week 1)

**Goal**: Every agent has persistent memory and starts accumulating institutional knowledge.

#### Tasks

| # | Task | Files | Effort | Dependency |
|---|------|-------|--------|------------|
| 1.1 | Add `memory: project` to all agent frontmatter files | `.claude/agents/*.md` (37 files) | 2h | None |
| 1.2 | Create MEMORY.md templates for each agent type | `.claude/agent-memory/*/MEMORY.md` | 3h | 1.1 |
| 1.3 | Add Memory Protocol section to each agent body | `.claude/agents/*.md` | 2h | 1.2 |
| 1.4 | Implement memory-size-guard hook | `.claude/hooks/memory-size-guard.py` | 1h | None |
| 1.5 | Update CLAUDE.md with memory architecture rules | `.claude/CLAUDE.md` | 1h | 1.1-1.4 |
| 1.6 | Test: spawn 3 agents, verify MEMORY.md creation | Manual testing | 1h | 1.1-1.3 |

#### Validation Criteria

- [ ] All 37 agents have `memory: project` in frontmatter
- [ ] MEMORY.md template exists for each agent category (3 templates)
- [ ] memory-size-guard hook fires on MEMORY.md writes
- [ ] Agent spawned twice reads MEMORY.md from first session
- [ ] MEMORY.md stays under 200 lines after 5 simulated sessions

#### File Changes

```
.claude/agents/aios-dev.md          # Add memory: project
.claude/agents/aios-architect.md     # Add memory: project
.claude/agents/aios-qa.md           # Add memory: project
... (all 37 agent files)

.claude/agent-memory/
  aios-dev/MEMORY.md                 # Template A (Domain Specialist)
  aios-architect/MEMORY.md           # Template A
  aios-qa/MEMORY.md                  # Template A
  mmos-barbara/MEMORY.md             # Template B (MMOS Pipeline)
  mmos-tim/MEMORY.md                 # Template B
  ... (all agents)
  deep-researcher/MEMORY.md          # Already exists (Template C)

.claude/hooks/memory-size-guard.py   # New hook
.claude/hooks/settings.json          # Updated with new hook config
```

### Phase 2: Agent Routing & Specialization (Weeks 2-3)

**Goal**: Intelligent task routing based on agent competency and performance data.

#### Tasks

| # | Task | Files | Effort | Dependency |
|---|------|-------|--------|------------|
| 2.1 | Create agent-registry.yaml | `.claude/agent-registry.yaml` | 3h | Phase 1 |
| 2.2 | Add performance metrics section to MEMORY.md template | Templates | 1h | Phase 1 |
| 2.3 | Create /refresh-registry skill | `.claude/skills/refresh-registry/SKILL.md` | 2h | 2.1 |
| 2.4 | Update /execute-epic to use registry for routing | `.claude/skills/execute-epic/SKILL.md` | 3h | 2.1 |
| 2.5 | Implement model-tier routing in orchestrator skills | Multiple skills | 4h | 2.1 |
| 2.6 | Create agent-compliance-logger hook | `.claude/hooks/agent-compliance-logger.py` | 2h | Phase 1 |
| 2.7 | Test: verify routing picks correct agent for 10 tasks | Manual testing | 2h | 2.4-2.5 |

#### Validation Criteria

- [ ] agent-registry.yaml has entries for all 37 agents
- [ ] /execute-epic reads registry to pick agents per phase
- [ ] Model tier routing demonstrably uses Haiku for exploration tasks
- [ ] Performance metrics populated after 5 agent sessions
- [ ] /refresh-registry correctly updates registry from frontmatter

### Phase 3: Team Patterns (Month 1)

**Goal**: Implement team templates for common multi-agent workflows.

**Prerequisites**: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` must be enabled.

#### Tasks

| # | Task | Files | Effort | Dependency |
|---|------|-------|--------|------------|
| 3.1 | Create /parallel-review skill (Template 1) | `.claude/skills/parallel-review/SKILL.md` | 4h | Phase 2 |
| 3.2 | Create sequential pipeline template | `.claude/skills/sequential-pipeline/SKILL.md` | 4h | Phase 2 |
| 3.3 | Enhance MMOS pipeline with team orchestration | `squads/mmos/scripts/` + skills | 8h | 3.2 |
| 3.4 | Implement handoff document format | Templates + validation | 3h | None |
| 3.5 | Create team-cost-tracker hook | `.claude/hooks/team-cost-tracker.py` | 3h | None |
| 3.6 | Create handoff-quality-gate script | `.claude/scripts/quality-gate.sh` | 2h | 3.4 |
| 3.7 | Test: run parallel review on real PR | Manual testing | 3h | 3.1, 3.5 |
| 3.8 | Test: run MMOS pipeline as team | Manual testing | 4h | 3.3 |

#### Validation Criteria

- [ ] /parallel-review spawns 3 teammates, produces unified review
- [ ] Sequential pipeline handles 4-phase workflow with handoffs
- [ ] MMOS pipeline uses team orchestration with state.json
- [ ] Team cost tracker accurately estimates token usage
- [ ] Handoff quality gate catches incomplete handoffs
- [ ] Total cost for parallel review < $5

### Phase 4: Compound Learning & Optimization (Ongoing)

**Goal**: The system gets measurably better over time through accumulated agent memory.

#### Tasks

| # | Task | Files | Effort | Dependency |
|---|------|-------|--------|------------|
| 4.1 | Implement memory pruning automation | `.claude/scripts/memory-prune.py` | 4h | Phase 1 |
| 4.2 | Create compound learning metrics dashboard | `.claude/skills/compound-metrics/SKILL.md` | 3h | Phase 2 |
| 4.3 | Implement cross-agent knowledge sharing | Protocol in CLAUDE.md | 2h | Phase 1 |
| 4.4 | Add /evolve skill for instinct extraction (ECC-inspired) | `.claude/skills/evolve/SKILL.md` | 6h | Phase 2 |
| 4.5 | Monthly review: prune all agent memories | Recurring task | 2h/mo | Phase 1 |
| 4.6 | Quarterly review: update agent-registry metrics | Recurring task | 1h/qtr | Phase 2 |

#### Cross-Agent Knowledge Sharing Protocol

Agents should NOT directly write to each other's MEMORY.md. Instead:

```
Agent A discovers pattern relevant to Agent B
    |
    v
Agent A writes to shared location:
  .claude/agent-memory/_shared-discoveries/
    YYYY-MM-DD-{agent}-{topic}.md
    |
    v
Agent B (on next spawn) checks _shared-discoveries/
for entries tagged with its domain
    |
    v
Agent B incorporates relevant discoveries into
its own MEMORY.md (with attribution)
```

**Important**: This `_shared-discoveries/` directory is for INTER-AGENT communication only. Each agent's own MEMORY.md remains self-contained.

#### Compound Learning Targets

| Timeframe | Expected Improvement | Measurement |
|-----------|---------------------|-------------|
| After 1 week | Agents reference MEMORY.md in 30% of sessions | Log grep |
| After 1 month | 50% reduction in repeated mistakes | Rework rate |
| After 3 months | 40% reduction in avg turns per task | Performance metrics |
| After 6 months | Agent memory hit rate > 70% | Self-reported in MEMORY.md |

---

## Appendix A: Complete File Tree (New + Modified)

```
.claude/
  agents/
    *.md                           # MODIFIED: Add memory: project to all

  agent-memory/
    _shared-discoveries/           # NEW: Cross-agent knowledge sharing
    aios-dev/MEMORY.md             # NEW: Template A
    aios-architect/MEMORY.md       # NEW: Template A
    aios-qa/MEMORY.md              # NEW: Template A
    aios-devops/MEMORY.md          # NEW: Template A
    aios-pm/MEMORY.md              # NEW: Template A
    aios-po/MEMORY.md              # NEW: Template A
    aios-sm/MEMORY.md              # NEW: Template A
    aios-analyst/MEMORY.md         # NEW: Template A
    aios-ux/MEMORY.md              # NEW: Template A
    copy-chief/MEMORY.md           # NEW: Template A
    db-sage/MEMORY.md              # NEW: Template A
    design-chief/MEMORY.md         # NEW: Template A
    cyber-chief/MEMORY.md          # NEW: Template A
    mmos-tim/MEMORY.md             # NEW: Template B
    mmos-barbara/MEMORY.md         # NEW: Template B
    mmos-daniel/MEMORY.md          # NEW: Template B
    mmos-brene/MEMORY.md           # NEW: Template B
    mmos-charlie/MEMORY.md         # NEW: Template B
    mmos-constantin/MEMORY.md      # NEW: Template B
    mmos-quinn/MEMORY.md           # NEW: Template B
    mmos-victoria/MEMORY.md        # NEW: Template B
    mmos-pm/MEMORY.md              # NEW: Template B
    deep-researcher/MEMORY.md      # EXISTS: Template C

  agent-registry.yaml              # NEW: Machine-readable agent registry

  hooks/
    memory-size-guard.py           # NEW: MEMORY.md line limit enforcement
    team-cost-tracker.py           # NEW: Team operation cost tracking
    agent-compliance-logger.py     # EXISTS: Enhanced for memory verification
    settings.json                  # MODIFIED: New hook registrations

  scripts/
    quality-gate.sh                # NEW: Phase transition quality check
    memory-prune.py                # NEW: Automated memory pruning

  skills/
    parallel-review/SKILL.md       # NEW: Multi-agent parallel review
    sequential-pipeline/SKILL.md   # NEW: Sequential phase orchestration
    refresh-registry/SKILL.md      # NEW: Update agent-registry.yaml
    compound-metrics/SKILL.md      # NEW: Learning metrics dashboard
    evolve/SKILL.md                # NEW: Instinct extraction (ECC-inspired)
    execute-epic/SKILL.md          # MODIFIED: Registry-based routing
    tech-research/SKILL.md         # MODIFIED: Enhanced orchestration

  CLAUDE.md                        # MODIFIED: Memory architecture rules
```

## Appendix B: Key Constraints from Research

These constraints are platform-level and cannot be changed by MMOS architecture:

| Constraint | Source | Impact |
|------------|--------|--------|
| MEMORY.md first 200 lines only | Claude Code platform | Must keep MEMORY.md concise |
| Subagents cannot spawn subagents | Platform limitation | No recursive delegation |
| Teammates cannot spawn sub-teams | Platform limitation | Teams are flat only |
| Max 10 concurrent subagents | Platform limitation | Limits parallelism |
| Teams experimental (env flag needed) | Platform status | May change in future releases |
| Skills fire ~56% in tests | Anthropic testing | Description quality is critical |
| No shared memory between teammates | Platform limitation | Must use files/messages |
| Session Memory auto-captured | Platform behavior | Cannot control granularity |
| Agent memory dirs are per git repo | Platform behavior | Worktrees get separate dirs |

## Appendix C: Research Sources

This blueprint synthesizes findings from all 12 wave1 and wave2 research files:

| File | Key Contribution |
|------|-----------------|
| `wave1-agent-memory.md` | Memory layers, scopes, 200-line limit, pruning |
| `wave1-agents-architecture.md` | Frontmatter fields, permission modes, built-in agents |
| `wave1-integration-patterns.md` | Skill+Team orchestration, compound patterns, hooks |
| `wave1-skills-advanced.md` | Progressive disclosure, dynamic injection, description quality |
| `wave1-teams-swarms.md` | Team primitives, token economics, C compiler case study |
| `wave1-community-cases.md` | ECC patterns, Boris Cherny workflow, production cases |
| `wave2-agent-sdk-headless.md` | SDK API, hooks system, OpenTelemetry, cost control |
| `wave2-compound-learning.md` | Claudeception, cross-session memory, academic foundations |
| `wave2-workflow-improvement-patterns.md` | DAG orchestration, model routing, prompt caching |
| `wave2-everything-claude-code.md` | 4-layer architecture, instincts, handoff documents |
| `wave2-official-skills-ecosystem.md` | Agent Skills standard, plugin system, marketplace |
| `wave2-swarm-tools.md` | claude-flow routing, file-ownership, Git worktree isolation |

---

*Blueprint v1.0 -- 2026-02-09*
*Synthesized by deep-researcher agent from 12 research files (~10K lines)*
*Ready for Phase 1 implementation*
