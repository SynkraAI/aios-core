# Wave 2: Workflow Improvement Patterns for Complex AI Agent Pipelines

> Deep research into industry-best patterns for multi-agent workflow orchestration,
> applicable to story-cycle, tech-research, execute-epic, and enhance-workflow skills.

**Date:** 2026-02-09
**Sources consulted:** 22 unique URLs, 15 pages deep-read
**Coverage areas:** DAG orchestration, quality gates, state management, cost optimization, HITL, framework comparisons

---

## TL;DR

1. **DAG-based orchestration** (LangGraph, Google ADK) is the industry standard for complex agent workflows -- nodes represent agents/tasks, edges carry conditional predicates on global state, enabling parallel execution with dependency resolution.
2. **Generator-Critic loops with bounded iterations** (max 1-2 refinement cycles) are the proven quality gate pattern -- not infinite loops, not single-pass.
3. **Tiered state management** (working context / session / long-term memory / artifacts) prevents context explosion in multi-agent systems.
4. **Model routing by task complexity** cuts costs 50-80% -- use Haiku for classification/routing, Sonnet for implementation, Opus for reasoning/planning.
5. **Progressive autonomy with policy-based gates** replaces binary human-in-the-loop -- agents earn trust through tracked performance metrics.
6. **Prompt caching with stable system prefixes** reduces API costs 45-80% and latency 13-31% -- but dynamic content in system prompts kills cache hit rates.

---

## 1. DAG-Based Workflow Orchestration

### 1.1 Core Pattern: Stateful Graph Execution

The industry has converged on directed acyclic graphs (DAGs) as the foundation for agent workflow orchestration. In this model, **nodes represent agents, functions, or decision points**, while **edges dictate how data flows between them**, with a centralized state graph maintaining overall context.

> "In an agentic state machine, transitions aren't hardcoded. Instead, an agent decides which transition to take based on the current state and context." -- [LangGraph Architecture Analysis](https://latenode.com/blog/ai-frameworks-technical-infrastructure/langgraph-multi-agent-orchestration/langgraph-multi-agent-orchestration-complete-framework-guide-architecture-analysis-2025)

**Key characteristics:**
- **Nodes**: Agent invocations, tool calls, decision functions
- **Edges**: Fixed transitions or conditional predicates on global state
- **State**: Centralized TypedDict/Pydantic model accessible by all nodes
- **Checkpoints**: State snapshots at each node completion for resume/debug

### 1.2 Google ADK's Eight Essential Patterns

Google published a definitive guide to multi-agent design patterns using the Agent Development Kit. These eight patterns form a composable vocabulary for building production agent systems:

| # | Pattern | Description | When to Use |
|---|---------|-------------|-------------|
| 1 | **Sequential Pipeline** | Assembly line: Agent A -> Agent B -> Agent C | Linear workflows, document processing |
| 2 | **Coordinator/Dispatcher** | Central agent routes requests to specialists | Intent-based routing, multi-department systems |
| 3 | **Parallel Fan-Out/Gather** | Multiple agents work concurrently, synthesizer aggregates | PR reviews, concurrent analysis, latency reduction |
| 4 | **Hierarchical Decomposition** | High-level agents break goals into subtasks, delegate down | Complex goals, context-window limitations |
| 5 | **Generator-Critic** | One agent creates, another validates, conditional loop | Quality assurance, compliance checks |
| 6 | **Iterative Refinement** | Generate -> Critique -> Refine cycle until threshold met | Content optimization, polishing |
| 7 | **Human-in-the-Loop** | Approval tool pauses execution for human review | Financial transactions, production deploys |
| 8 | **Composite** | Combines any patterns above | Real-world production systems |

Source: [Google's Eight Essential Multi-Agent Design Patterns (InfoQ)](https://www.infoq.com/news/2026/01/multi-agent-design-patterns/), [Google Developers Blog](https://developers.googleblog.com/developers-guide-to-multi-agent-patterns-in-adk/)

**Implementation insight from Google ADK:**
- Use descriptive `output_key` naming so downstream agents know where to read
- Agent `description` fields function as API documentation for LLM routing decisions
- Begin with sequential patterns before adding nested complexity
- ParallelAgent sub-agents must write to unique state keys to prevent race conditions

### 1.3 Conditional Branching and Dynamic Re-Routing

LangGraph's conditional edges carry predicates on global state, enabling execution to follow different successors based on dynamic computation:

```
success of retrieval -> continue pipeline
validation failure -> retry with different approach
confidence below threshold -> escalate to human
```

CrewAI Flows achieve the same with the `@router()` decorator:

```python
@router(route_to_review)
def evaluate(self):
    if self.state.score > 0.8:
        return "high_quality_path"
    return "needs_improvement_path"
```

Source: [CrewAI Flows Docs](https://docs.crewai.com/en/concepts/flows)

### 1.4 Parallel Execution with Dependency Resolution

Three approaches to parallelism in agent workflows:

| Approach | Framework | Mechanism |
|----------|-----------|-----------|
| **ParallelAgent** | Google ADK | Separate execution threads, shared session state, unique output keys |
| **Fan-out/Gather** | LangGraph | Multiple edges from one node, join node waits for all |
| **or_/and_** | CrewAI Flows | `or_()` fires when ANY dependency completes, `and_()` waits for ALL |

**Applicability to our skills:**
- **execute-epic**: Parallel Fan-Out for independent stories within a wave
- **tech-research**: Parallel search queries (already implemented), parallel deep-reads
- **enhance-workflow**: Fan-Out for roundtable where multiple agents analyze simultaneously, Gather for synthesis

---

## 2. Quality Gates and Feedback Loops

### 2.1 Generator-Critic Pattern (Industry Standard)

The dominant quality pattern across all frameworks is the **Generator-Critic loop**:

1. **Generator agent** produces output (draft, code, analysis)
2. **Critic agent** evaluates against defined criteria
3. **If criteria not met**: Generator receives feedback, produces revision
4. **Loop bounded**: Maximum 1-2 refinement iterations to prevent cost explosion

> "A SequentialAgent manages draft-and-review interaction, and a parent LoopAgent enforces the quality gate and exit condition." -- [Google ADK Patterns](https://developers.googleblog.com/developers-guide-to-multi-agent-patterns-in-adk/)

**Implementation details from Google ADK:**
- Generator writes draft to `output_key`
- Critic evaluates and provides structured pass/fail + feedback
- LoopAgent wraps both with `exit_condition` parameter
- `max_iterations` prevents infinite loops
- Agents can signal early completion via `escalate=True`

### 2.2 Multi-Stage Quality Validation

Production systems use layered validation rather than single-pass checks:

```
Stage 1: Schema/format validation (deterministic, no LLM needed)
Stage 2: Content quality scoring (LLM-based evaluation with rubrics)
Stage 3: Cross-reference verification (check against known facts/constraints)
Stage 4: Human spot-check (sampled, not exhaustive)
```

> "Enforce machine-checkable structure with Structured Outputs. Every output should emit artifacts that can be validated against defined JSON schemas." -- [2026 Playbook for Reliable Agentic Workflows](https://promptengineering.org/agents-at-work-the-2026-playbook-for-building-reliable-agentic-workflows/)

### 2.3 Reflection Pattern (Self-Review)

The Reflection pattern is one of the five canonical agentic patterns (alongside Tool Use, ReAct, Planning, and Multi-Agent):

> "Reflection is about having an agent review and critique its own work, then revise based on that critique." -- [ByteByteGo: Top AI Agentic Workflow Patterns](https://blog.bytebytego.com/p/top-ai-agentic-workflow-patterns)

**Implementation approaches:**
- **Single-agent reflection**: One model generates + critiques (cheaper, less thorough)
- **Multi-agent reflection**: Separate Actor and Critic agents (better quality, higher cost)
- **Tool-augmented reflection**: Critic uses tools to verify (e.g., run unit tests on generated code)

**Best practices:**
- Set hard limit of 1-2 refinement loops
- Define explicit acceptance criteria (not vague "make it better")
- Use structured scoring rubrics for the critic
- Log each iteration for debugging and cost tracking

### 2.4 Automatic Retry with Learning

Beyond simple retry, production systems implement **retry with context enrichment**:

1. **Capture failure reason** (not just "failed" but structured error diagnosis)
2. **Enrich prompt** with failure context for next attempt
3. **Try alternative approach** if same approach failed twice
4. **Escalate** after N failures with full context trail

> "Counter hallucinations via ReAct pattern: Interleave thought and action so plans stay grounded in observations." -- [2026 Playbook](https://promptengineering.org/agents-at-work-the-2026-playbook-for-building-reliable-agentic-workflows/)

### 2.5 Applicability to Our Skills

| Skill | Quality Gate Pattern | Implementation |
|-------|---------------------|----------------|
| **story-cycle** | Generator-Critic between Dev and QA; SM reviews PO output | QA agent receives dev output + acceptance criteria, returns structured pass/fail |
| **tech-research** | Coverage evaluation after each wave; source credibility scoring | Evaluate coverage % against topic decomposition; re-search gaps |
| **execute-epic** | Story-level acceptance criteria check after each story completes | Deterministic schema validation + LLM quality check on deliverables |
| **enhance-workflow** | Roundtable consensus check; dissent resolution | All agents must reach threshold agreement before proceeding |

---

## 3. State Management for Agent Workflows

### 3.1 Tiered State Architecture (Google ADK Model)

Google's ADK defines the most mature state management architecture for multi-agent systems:

| Layer | Scope | Lifetime | Purpose |
|-------|-------|----------|---------|
| **Working Context** | Single model invocation | Ephemeral | Current prompt, tool outputs |
| **Session** | Full conversation/workflow | Durable | Event log, intermediate results |
| **Memory** | Cross-session | Persistent | Searchable knowledge base |
| **Artifacts** | Named objects | Versioned | Large payloads referenced by handle |

> "Context as a compiled view over a richer stateful system -- not a mutable string buffer." -- [Google Developers Blog: Efficient Context-Aware Multi-Agent Framework](https://developers.googleblog.com/architecting-efficient-context-aware-multi-agent-framework-for-production/)

**Key insight**: Agents see lightweight artifact references and load full content only when needed ("ephemeral expansion"). Large payloads stay in external stores.

### 3.2 Checkpoint/Resume Patterns

Three production-grade approaches:

**A. LangGraph Checkpointing**
- State persists after every node execution
- PostgresSaver for production (optimized read/write, versioned channel values)
- Time-travel debugging: replay from any checkpoint, fork to explore alternatives
- Each checkpoint stores only changed values (delta compression)

Source: [LangGraph Checkpointing Best Practices](https://sparkco.ai/blog/mastering-langgraph-checkpointing-best-practices-for-2025)

**B. Microsoft Agent Framework**
- Checkpoints at end of each "superstep" (after all executors complete)
- Captures: executor state, pending messages, shared states
- Resume on same run or rehydrate to new workflow instance
- Custom state serialization via `on_checkpoint_save` / `on_checkpoint_restore`

Source: [Microsoft Agent Framework: Checkpoints](https://learn.microsoft.com/en-us/agent-framework/user-guide/workflows/checkpoints)

**C. CrewAI Flows Persistence**
- `@persist` decorator enables automatic state recovery
- SQLiteFlowPersistence as default backend
- Supports both structured (Pydantic) and unstructured state
- Automatic UUID preservation across restarts

Source: [CrewAI Flows Docs](https://docs.crewai.com/en/concepts/flows)

### 3.3 State Compression for Token Optimization

The critical challenge in multi-agent systems is **context explosion**:

> "If a root agent passes its full history to a sub-agent, and that sub-agent does the same, you trigger a context explosion where the token count skyrockets and sub-agents get confused by irrelevant conversational history." -- [Token Optimization for Agents](https://agentsarcade.com/blog/reducing-token-costs-long-running-agent-workflows)

**Compression strategies:**
1. **Summarization checkpoints**: Periodically compress recent interactions into task-relevant summaries. Preserve decisions, constraints, and unresolved questions. Discard exploratory dead ends.
2. **Context compaction** (Google ADK): Asynchronous LLM-driven summarization compresses older events into compaction events within the Session.
3. **Forced amnesia checkpoints**: Periodically require agents to reconstruct working context solely from durable state and summaries -- exposes unnecessary retention.
4. **Scoped handoffs**: Sub-agents receive only focused prompts and necessary artifacts, not ancestral history.

### 3.4 Conflict Resolution in Concurrent Updates

Google ADK's approach to parallel agent state:
- Each parallel agent writes to a **unique key** in shared state
- Race condition prevention through key isolation
- Synthesizer agent reads all keys after parallel phase completes
- No direct agent-to-agent state mutation

**For our system**: Each teammate in execute-epic writes to `state.stories[story_id]` -- scoped by story ID prevents conflicts.

### 3.5 Applicability to Our Skills

| Skill | State Pattern | Implementation |
|-------|--------------|----------------|
| **story-cycle** | Session state with phase tracking (SM -> PO -> Dev -> QA) | `state.json` with current_phase, phase_outputs, acceptance_results |
| **tech-research** | Checkpoint per wave + coverage metrics | wave-N-summary files already work; add coverage % to state |
| **execute-epic** | Parallel state with scoped keys per story | Each story gets independent state; epic state aggregates |
| **enhance-workflow** | Roundtable state with agent contributions + consensus score | Each agent writes to own key; merge phase computes consensus |

---

## 4. Cost Optimization

### 4.1 Model Routing (Task Tiering)

The single highest-impact cost optimization is routing tasks to appropriate model tiers:

| Task Type | Model Tier | Examples | Cost Ratio |
|-----------|-----------|----------|------------|
| Classification, routing, formatting | Haiku / GPT-4o-mini | Intent detection, format conversion, simple extraction | 1x (baseline) |
| Implementation, writing, analysis | Sonnet / GPT-4o | Code generation, content creation, data analysis | 5-10x |
| Planning, reasoning, architecture | Opus / o1 | Complex planning, multi-step reasoning, architecture decisions | 25-50x |

> "Strategic routing of tasks by complexity uses smaller models for simple jobs and reserves powerful models for reasoning." -- [LLM Cost Optimization Guide](https://ai.koombea.com/blog/llm-cost-optimization)

**Implementation pattern for our skills:**
```
story-cycle:
  SM (routing/planning) -> Sonnet
  PO (requirements writing) -> Sonnet
  Dev (code implementation) -> Opus (complex) / Sonnet (routine)
  QA (test writing, validation) -> Sonnet

tech-research:
  Query decomposition -> Sonnet
  Page reading/extraction -> Haiku (simple extraction)
  Synthesis/report writing -> Opus

execute-epic:
  Wave planning -> Opus
  Story execution -> Sonnet (per-story agent)
  Quality validation -> Sonnet
  Epic synthesis -> Opus
```

### 4.2 Prompt Caching Strategies

Research on 500+ agent sessions with 10,000-token system prompts shows:

| Strategy | Cost Savings | Latency Improvement |
|----------|-------------|-------------------|
| **System Prompt Only** (recommended) | 45-80% | 13-31% TTFT improvement |
| Exclude Tool Results | Up to 79.6% | Variable |
| Full Context Caching | Variable (can backfire) | Sometimes increases latency |

> "Strategic control over cache boundaries is essential. Avoid including timestamps, datetime strings, session identifiers, or user-specific information in system prompts as these invalidate cache prefixes." -- [Prompt Caching for Agentic Tasks (arXiv)](https://arxiv.org/html/2601.06007v1)

**Production recommendations:**
- Maintain fixed, reusable tool definitions (not dynamic function discovery)
- Place dynamic content at the END of the system prompt
- Cached tokens are 75% cheaper to process
- Monitor provider-specific minimum token thresholds and TTL durations

### 4.3 Token Budget Management

A token-budget-aware reasoning framework dynamically adjusts reasoning tokens based on problem complexity:

**Per-phase budgets for our skills:**
```
story-cycle (total budget: ~200K tokens):
  SM phase:     20K (routing, backlog review)
  PO phase:     40K (requirements, acceptance criteria)
  Dev phase:    100K (implementation, the bulk)
  QA phase:     40K (testing, validation)

tech-research (total budget: ~150K tokens):
  Decomposition:  5K
  Search:          10K (search results only)
  Deep reading:    80K (page content extraction)
  Synthesis:       55K (report writing)
```

### 4.4 Context Management Patterns

| Technique | Token Savings | Implementation |
|-----------|--------------|----------------|
| Reasoning persistence (store + reuse plans) | 30-50% on repeated reasoning | Write plan to state, reference in subsequent phases |
| Tool-call optimization (structured data, not prose) | 20-40% per tool interaction | Tools return JSON, not verbose text |
| Memory pruning (task-based invalidation) | 40-60% in long workflows | Collapse scaffolding upon task completion |
| Scoped handoffs (minimal context for sub-agents) | 50-70% vs full history pass | Only pass task-relevant state to sub-agents |

> "If you can't explain why a piece of information is still in the prompt after ten turns, it shouldn't be there." -- [Reducing Token Costs](https://agentsarcade.com/blog/reducing-token-costs-long-running-agent-workflows)

### 4.5 Batch Processing Patterns

For workflows processing multiple items (e.g., execute-epic processing multiple stories):
- **Validate one first**: Process first story, verify output quality, then batch the rest
- **Shared context amortization**: Load epic context once, share across all story agents
- **Parallel with token cap**: Limit concurrent agents to control peak token spend
- **Progressive disclosure**: Only load full story details when agent starts working on it

---

## 5. Human-in-the-Loop Patterns

### 5.1 Four HITL Implementation Patterns

Based on comprehensive analysis of production systems:

| Pattern | Mechanism | Best For |
|---------|-----------|----------|
| **Interrupt & Resume** | Agent pauses mid-execution via `interrupt()`, collects input, resumes | Approving tool calls, checkpoints before final actions |
| **Human-as-a-Tool** | Agent invokes "ask human" tool when uncertain | Ambiguous prompts, fact-checking, clarification |
| **Approval Flows** | Structured permissions: only specific roles can approve | Policy-backed access control, destructive actions |
| **Fallback Escalation** | Agent attempts task, escalates on failure/low-confidence | Safety net for complex queries, async review |

Source: [Permit.io: Human-in-the-Loop Best Practices](https://www.permit.io/blog/human-in-the-loop-for-ai-agents-best-practices-frameworks-use-cases-and-demo)

### 5.2 Progressive Autonomy

The most sophisticated HITL pattern replaces binary "always ask / never ask" with **earned trust**:

> "Progressive autonomy involves starting with HITL and expanding autonomy only when KPIs and audits are green for a sustained period." -- [Skywork: Agent vs HITL Comparison](https://skywork.ai/blog/agent-vs-human-in-the-loop-2025-comparison/)

**Implementation framework:**

```
Level 0: Full oversight    - Human approves every action
Level 1: Sampled review    - Human reviews 50% of outputs (random)
Level 2: Exception review  - Human reviews only flagged items
Level 3: Audit review      - Human reviews aggregated metrics weekly
Level 4: Full autonomy     - Agent operates independently, human notified of anomalies
```

**Promotion criteria:**
- Quality score > threshold for N consecutive runs
- No critical failures in M days
- Cost per task within budget
- User satisfaction above baseline

### 5.3 Steering Mid-Workflow

CrewAI Flows provides the most explicit mid-workflow steering via `@human_feedback()`:

```python
@human_feedback()
def get_approval(self, result):
    # Pauses execution, collects human input
    # result.feedback contains human response
    # Routes to different paths based on feedback
    if result.feedback == "approve":
        return "continue_path"
    return "revision_path"
```

**For Claude Code workflows**: The existing `AskUserQuestion` tool serves this purpose. The pattern is:
1. Agent reaches decision point
2. Presents options with analysis
3. Human selects direction
4. Agent continues on selected path without restart

### 5.4 Notification and Reporting Patterns

Production systems use tiered notification:

| Urgency | Channel | Example |
|---------|---------|---------|
| **Blocking** | In-context prompt (synchronous) | "Approve this database migration?" |
| **Important** | Slack/Teams notification (async) | "Story completed, review needed" |
| **Informational** | Dashboard/log update | "Wave 2 of 4 complete, 85% coverage" |
| **Audit** | Persistent log file | Full decision trail for compliance |

### 5.5 Applicability to Our Skills

| Skill | HITL Pattern | Gates |
|-------|-------------|-------|
| **story-cycle** | Approval Flow: PO approves requirements before Dev starts; human reviews QA failures | After PO phase, after QA phase |
| **tech-research** | Steering: human can redirect research direction between waves | After each wave summary |
| **execute-epic** | Exception review: human reviews only stories flagged by QA | After each wave; blocking for architecture decisions |
| **enhance-workflow** | Human-as-Tool: agent asks when roundtable reaches impasse | When consensus < threshold |

---

## 6. Multi-Agent Framework Comparisons

### 6.1 Framework Comparison Matrix

| Dimension | LangGraph | CrewAI | AutoGen | Google ADK |
|-----------|-----------|--------|---------|------------|
| **Philosophy** | Graph-based state machines | Role-based team orchestration | Conversation-first | Pattern-composable primitives |
| **State Management** | Explicit TypedDict, manual | Implicit + Pydantic option | Implicit via conversation | Tiered (working/session/memory/artifacts) |
| **Control Flow** | Conditional edges, explicit | Sequential/Hierarchical/Flows | Speaker selection, turns | SequentialAgent, ParallelAgent, LoopAgent |
| **Quality Gates** | Custom nodes with interrupt | Task acceptance criteria | Group chat consensus | Generator-Critic LoopAgent |
| **Checkpointing** | Built-in (SQLite/Postgres) | @persist decorator (SQLite) | Conversation logs | Session event store |
| **HITL** | interrupt() at any node | @human_feedback() decorator | UserProxy agent | ApprovalTool |
| **Debuggability** | Excellent (time-travel) | Good (flow visualization) | Challenging (conversation traces) | Good (event streams) |
| **Cost Efficiency** | High (explicit control) | High (minimal overhead) | Moderate (verbose conversations) | High (scoped contexts) |
| **Learning Curve** | Steep (graph concepts) | Low (intuitive roles) | Medium (conversation patterns) | Medium (pattern vocabulary) |

Source: [Framework Comparison 2026](https://iterathon.tech/blog/ai-agent-orchestration-frameworks-2026)

### 6.2 Patterns to Adopt from Each Framework

**From LangGraph:**
- **Conditional edges on state**: Route workflow based on computed state predicates, not hardcoded paths
- **Time-travel debugging**: Store state at every step; replay from any point to debug issues
- **TypedDict state**: Explicit, typed state prevents shape drift across long workflows

**From CrewAI:**
- **80/20 rule: 80% effort on task design, 20% on agent design**: Well-designed tasks elevate even simple agents; poorly designed tasks doom sophisticated ones
- **Acceptance criteria as first-class concept**: Every task has explicit completion criteria
- **Flows with @router**: Declarative conditional routing without graph boilerplate
- **@persist for automatic checkpointing**: Zero-config state persistence

**From AutoGen:**
- **SelectorGroupChat**: Dynamic speaker selection based on task requirements (not fixed order)
- **Handoff pattern**: Explicit context transfer between specialized agents with ownership semantics
- **RoundRobinGroupChat**: Structured turn-taking for collaborative analysis

**From Google ADK:**
- **Tiered state architecture**: Working context / Session / Memory / Artifacts separation
- **Context compaction**: Async summarization of older events to control token growth
- **Artifact externalization**: Large payloads as references, loaded on demand
- **Scoped handoffs**: Sub-agents see only what they need

### 6.3 Recommended Pattern Combinations for Our Skills

**story-cycle = Sequential Pipeline + Generator-Critic + Approval Flow**
```
SM (plan) -> PO (requirements) -> [HUMAN APPROVAL] -> Dev (implement) -> QA (validate)
                                                                              |
                                                              [if fail] -> Dev (fix) -> QA (re-validate)
                                                                              |
                                                              [max 2 loops, then escalate]
```

**tech-research = Parallel Fan-Out + Iterative Refinement + Steering**
```
Decompose query -> [Parallel: search wave 1] -> Evaluate coverage
                                                      |
                              [if coverage < 80%] -> [Parallel: search wave 2] -> Re-evaluate
                                                      |
                              [if coverage >= 80%] -> Synthesize -> [HUMAN: review/redirect]
```

**execute-epic = Hierarchical Decomposition + Parallel Fan-Out + Generator-Critic**
```
Epic -> Decompose to waves -> Wave N: [Parallel: Story A, Story B, Story C]
                                            |
                                     [Generator-Critic per story]
                                            |
                                     Wave summary -> [HUMAN: approve wave]
                                            |
                                     Next wave
```

**enhance-workflow = Coordinator/Dispatcher + Parallel Fan-Out + Consensus**
```
Topic -> Coordinator assigns to specialists
              |
         [Parallel: Agent 1 analyzes, Agent 2 analyzes, Agent 3 analyzes]
              |
         Synthesize contributions -> Check consensus
              |
         [if consensus < threshold] -> Debate round -> Re-check
              |
         [if consensus >= threshold] -> Final plan -> [HUMAN: approve]
```

---

## 7. Production Readiness Patterns

### 7.1 Anthropic's 2026 Agentic Coding Insights

Anthropic's 2026 Agentic Coding Trends Report provides critical production data:

- Engineers integrate AI into **60% of their work** but can "fully delegate" only **0-20%** of tasks
- The rest requires **active supervision, validation, and human judgment**
- Four strategic priorities: multi-agent coordination, human-agent oversight, extending beyond engineering, security architecture

Source: [Anthropic 2026 Agentic Coding Trends](https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf)

### 7.2 Claude Code Agent Teams Best Practices

For our specific context (Claude Code-based multi-agent skills):

> "Task sizing matters. Too small and coordination overhead dominates. Too large and teammates work too long without check-ins. The sweet spot is self-contained units that produce a clear deliverable." -- [Claude Code Agent Teams Docs](https://code.claude.com/docs/en/agent-teams)

**Key production rules:**
1. **5-6 tasks per teammate** keeps everyone productive
2. **File ownership matters**: Two teammates editing same file = overwrites. Break work by file ownership.
3. **Teammates don't inherit lead's conversation history** -- context must be explicitly provided
4. **Start with code review, not parallelized refactor** -- learn coordination before letting agents write simultaneously
5. **Agent teams add coordination overhead and significantly more tokens** -- use only when parallelism adds genuine value

Source: [Addy Osmani: Claude Code Swarms](https://addyosmani.com/blog/claude-code-agent-teams/), [Claude Code Docs](https://code.claude.com/docs/en/agent-teams)

### 7.3 Production Readiness Checklist

Consolidated from all sources:

```
Pre-Deploy:
[ ] Structured outputs on all artifacts (JSON schema validation)
[ ] Verification as first-class tasks (not afterthoughts)
[ ] Cost caps and caching enabled
[ ] Immutable traces for every decision
[ ] Least-privilege tool access per agent
[ ] Safe failure modes and escalation paths

Runtime:
[ ] Per-agent, per-task, per-phase cost metrics
[ ] Quality scores tracked across runs
[ ] Anomaly detection on cost/quality/latency
[ ] Human notification on threshold breaches

Post-Run:
[ ] Audit trail reconstructable from logs
[ ] Performance metrics aggregated for trend analysis
[ ] Failure modes catalogued for retry improvement
[ ] Progressive autonomy metrics updated
```

Source: [2026 Playbook for Reliable Agentic Workflows](https://promptengineering.org/agents-at-work-the-2026-playbook-for-building-reliable-agentic-workflows/)

---

## 8. Recommendations for AIOS Skills

### 8.1 Immediate Wins (Low Effort, High Impact)

1. **Add Generator-Critic loops to story-cycle**: QA agent receives dev output + acceptance criteria, returns structured pass/fail with specific feedback. Bounded to 2 iterations.

2. **Implement coverage-based wave gating in tech-research**: After each search wave, evaluate coverage % against topic decomposition. Stop when >= 80% or max waves reached.

3. **Add model tier routing**: Use Sonnet for routine agent work (SM routing, QA validation), Opus only for complex reasoning (architecture decisions, synthesis of conflicting sources).

4. **Structured state.json for all skills**: Every skill writes structured state with `current_phase`, `phase_outputs`, `quality_scores`, `token_usage`. Enables checkpoint/resume.

### 8.2 Medium-Term Improvements (Medium Effort, High Impact)

5. **Parallel Fan-Out for execute-epic**: Execute independent stories within a wave concurrently. Each story agent writes to scoped state key. Synthesizer aggregates after wave completes.

6. **Prompt caching optimization**: Ensure CLAUDE.md and agent personas are loaded as stable system prefix. Move dynamic content (current task, user input) to end of context.

7. **Progressive autonomy tracking**: Log quality scores per skill per run. After N successful runs, auto-reduce approval gates (e.g., skip PO approval for routine stories).

8. **Scoped context for sub-agents**: When spawning teammates, pass only task-relevant state, not full conversation history. Reduces token waste 50-70%.

### 8.3 Long-Term Architecture (High Effort, Transformative)

9. **DAG-based workflow engine**: Build a lightweight DAG executor that represents skill workflows as graphs. Enables conditional branching, parallel execution, and checkpoint/resume natively.

10. **Tiered state architecture**: Implement Google ADK-style separation: working context (ephemeral) / session (durable event log) / memory (cross-session) / artifacts (versioned large objects).

11. **Automated quality regression testing**: Run skills against benchmark inputs weekly. Track quality/cost/latency trends. Alert on regressions.

12. **Cross-skill learning**: When tech-research discovers a pattern that improves execute-epic, propagate via shared memory layer. Memory becomes the coordination mechanism.

---

## Sources

### Primary Sources (Deep-Read)
- [Google's Eight Essential Multi-Agent Design Patterns (InfoQ)](https://www.infoq.com/news/2026/01/multi-agent-design-patterns/)
- [Google Developers Blog: Multi-Agent Patterns in ADK](https://developers.googleblog.com/developers-guide-to-multi-agent-patterns-in-adk/)
- [Google Developers Blog: Efficient Context-Aware Multi-Agent Framework](https://developers.googleblog.com/architecting-efficient-context-aware-multi-agent-framework-for-production/)
- [Vellum: Agentic Workflows Emerging Architectures](https://www.vellum.ai/blog/agentic-workflows-emerging-architectures-and-design-patterns)
- [2026 Playbook for Reliable Agentic Workflows](https://promptengineering.org/agents-at-work-the-2026-playbook-for-building-reliable-agentic-workflows/)
- [Reducing Token Costs in Long-Running Workflows](https://agentsarcade.com/blog/reducing-token-costs-long-running-agent-workflows)
- [Prompt Caching for Agentic Tasks (arXiv)](https://arxiv.org/html/2601.06007v1)
- [CrewAI Flows Documentation](https://docs.crewai.com/en/concepts/flows)
- [Microsoft Agent Framework: Checkpoints](https://learn.microsoft.com/en-us/agent-framework/user-guide/workflows/checkpoints)
- [Permit.io: HITL Best Practices](https://www.permit.io/blog/human-in-the-loop-for-ai-agents-best-practices-frameworks-use-cases-and-demo)
- [ByteByteGo: Top AI Agentic Workflow Patterns](https://blog.bytebytego.com/p/top-ai-agentic-workflow-patterns)
- [SparkCo: AutoGen Multi-Agent Patterns 2025](https://sparkco.ai/blog/deep-dive-into-autogen-multi-agent-patterns-2025)
- [Eunomia: Checkpoint/Restore Systems](https://eunomia.dev/blog/2025/05/11/checkpointrestore-systems-evolution-techniques-and-applications-in-ai-agents/)

### Secondary Sources (Search Snippets + Partial Reads)
- [Iterathon: AI Agent Orchestration Frameworks 2026](https://iterathon.tech/blog/ai-agent-orchestration-frameworks-2026)
- [Anthropic 2026 Agentic Coding Trends Report (PDF)](https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf)
- [LangGraph Multi-Agent Orchestration Guide](https://latenode.com/blog/ai-frameworks-technical-infrastructure/langgraph-multi-agent-orchestration/langgraph-multi-agent-orchestration-complete-framework-guide-architecture-analysis-2025)
- [LangGraph Checkpointing Best Practices](https://sparkco.ai/blog/mastering-langgraph-checkpointing-best-practices-for-2025)
- [LLM Cost Optimization Guide](https://ai.koombea.com/blog/llm-cost-optimization)
- [Claude Code Agent Teams Docs](https://code.claude.com/docs/en/agent-teams)
- [Addy Osmani: Claude Code Swarms](https://addyosmani.com/blog/claude-code-agent-teams/)
- [Skywork: Agent vs HITL Comparison](https://skywork.ai/blog/agent-vs-human-in-the-loop-2025-comparison/)
- [DeepLearning.AI: Agentic Design Patterns - Reflection](https://www.deeplearning.ai/the-batch/agentic-design-patterns-part-2-reflection/)

---

## Gaps & Future Research

1. **Benchmark data for Claude Code multi-agent cost**: No public data on token consumption patterns for Claude Code Agent Teams at scale. Need to instrument and measure ourselves.

2. **State persistence across Claude Code sessions**: Claude Code teammates don't persist state between sessions natively. Need custom state management via file system (state.json pattern).

3. **Formal quality scoring rubrics**: All frameworks mention "quality gates" but few provide concrete scoring rubrics. Need to develop domain-specific rubrics for our story-cycle and tech-research outputs.

4. **Token budget enforcement**: No framework natively enforces per-phase token budgets. Would need custom middleware to track and limit consumption.

5. **Progressive autonomy implementation**: The concept is well-documented but no open-source implementation exists for Claude Code-based systems. Need to build tracking infrastructure.

6. **Cross-agent memory sharing in Claude Code**: Teammates share CLAUDE.md but not conversation memory. Need to evaluate file-based shared memory patterns (e.g., `.claude/shared-state/`) for cross-agent coordination.
