# WAVE 5: Final Synthesis -- Executive Summary of All Research

> **Date:** 2026-02-09
> **Scope:** 21 research files, 5 research waves, 400+ sources consulted, 250+ pages deep-read
> **Topic:** Claude Code Skills, Agents, Teams, Memory, MCP -- Advanced Patterns & Architecture
> **Duration:** Single-day intensive deep research session

---

## 1. Executive Summary

### What We Researched

This research program conducted a comprehensive analysis of Claude Code's advanced capabilities as of February 2026. Across 5 research waves, 21 individual reports, and 400+ unique sources, we mapped the complete landscape of:

- **Skills system**: Architecture, progressive disclosure, Agent Skills open standard, marketplace ecosystem
- **Agents system**: Subagent architecture, 11 frontmatter fields, 6 permission modes, built-in agents
- **Teams/Swarms**: Experimental Agent Teams (Feb 6, 2026), 7 primitives, third-party orchestrators
- **Memory**: 5-layer hierarchy, agent memory frontmatter, Session Memory, compound learning
- **MCP integration**: 10K+ servers, Tool Search optimization, composition patterns, sampling
- **Workflow patterns**: DAG orchestration, quality gates, state management, cost optimization
- **Compound learning**: Claudeception, cross-session memory, academic foundations (Voyager, Reflexion, MemRL)
- **Production patterns**: CI/CD, sandboxing, OpenTelemetry, enterprise case studies
- **Competitor analysis**: 9 tools compared (Cursor, Windsurf, Codex CLI, Copilot, Devin, Aider, Amazon Q, Jules, Augment)
- **Community wisdom**: Hidden gems, performance optimization, CLAUDE.md best practices
- **Ecosystem**: 339+ skills on skills.sh, 160K+ on SkillsMP, ComposioHQ (500+ integrations), everything-claude-code (42.9K stars)

### Top 10 Most Important Findings

**1. Skills are the new primitive -- bigger than MCP.**
Agent Skills is an open standard (agentskills.io) adopted by OpenAI Codex, Cursor, Copilot, Gemini CLI, and Windsurf within 2 months. Simon Willison predicts "a Cambrian explosion." MMOS must build on this standard, not around it.

**2. CLAUDE.md should be under 300 lines, ideally under 60.**
CLAUDE.md instructions are advisory (Claude can ignore them under context pressure). Hooks are deterministic. Any rule that MUST NOT be violated belongs in a hook. The "10/80 rule": under 10 MCPs, under 80 active tools.

**3. Agent Teams are real but experimental.**
Anthropic built a 100,000-line C compiler in Rust using 16 parallel agents (~2,000 sessions, $20K). Teams use ~7x more tokens than solo. No nested teams by design. Teammates have NO persistent memory.

**4. Compound learning delivers measurable ROI.**
Debugging time drops from 2h to 5min to 2min as agent memory accumulates. The pattern: Pre-session (load) -> During (track) -> Post (extract) -> Cross-session (compound). This is MMOS's single biggest competitive advantage.

**5. Model routing cuts costs 50-80%.**
Use Haiku for classification/routing, Sonnet for implementation, Opus for reasoning/planning. Average cost is $6/dev/day ($100-200/mo). Runaway subagents can burn 887K tokens/minute.

**6. MCP tools silently eat 8-30% of context.**
Even registered-but-unused MCP tools consume tokens. Tool Search reduces this by 85% (77K -> 8.7K tokens) via lazy loading. Essential for MMOS's multi-MCP setup.

**7. Performance craters after ~20 iterations per session.**
Reset context with `/clear` between tasks. Scoped handoffs (sub-agents get only task-relevant state) save 50-70% tokens vs full history. Manual `/compact` at 70% context beats auto-compaction.

**8. Claude Code's main gap vs competitors: no background/async agents.**
Cursor 2.0, Codex CLI, Copilot, Devin, Jules, and Augment all support async execution. Claude Code requires tmux workarounds. This is the #1 feature gap.

**9. Everything-claude-code demonstrates the ceiling.**
13 agents, 28+ skills, 30+ commands, 4-layer architecture, instinct-based learning (v2), hooks-driven observation. The instinct model (atomic behaviors with 0.3-0.9 confidence) is the most sophisticated learning system in the ecosystem.

**10. Hooks are the most underutilized superpower.**
14 hook events, 3 handler types (command/prompt/agent), `$CLAUDE_ENV_FILE` for state, `updatedInput` for tool modification. Hooks fire 100% deterministically vs skills at ~50-80% probabilistically. Every governance rule should be a hook.

### Strategic Recommendation

MMOS should pursue a **three-phase strategy**:

1. **Phase 1 (This week)**: Slim CLAUDE.md to <300 lines, migrate enforcement rules to hooks, enable Tool Search, fix agent memory for key subagents.
2. **Phase 2 (This month)**: Implement compound learning loop (Claudeception-inspired), upgrade skills to Agent Skills standard, add model routing for cost optimization.
3. **Phase 3 (Next quarter)**: Evaluate Agent Teams for execute-epic parallelism, build production monitoring (OpenTelemetry), create custom MCP servers for MMOS-specific tooling.

---

## 2. Architecture Decision Record

### ADR-001: Memory Architecture

**Context:** Claude Code has 5 memory layers (Managed Policy, Project CLAUDE.md, User CLAUDE.md, Local CLAUDE.md, Auto Memory) plus Session Memory and the new agent memory frontmatter (`memory: user|project|local`). MMOS currently uses only CLAUDE.md and manual handoffs.

**Decision:** Adopt a 3-tier memory strategy:
- **Project CLAUDE.md** (<300 lines): Universal operational rules only
- **`.claude/rules/*.md`** with glob-targeted frontmatter: Domain-specific rules (loaded conditionally)
- **Agent memory** (`memory: project`): Per-agent persistent MEMORY.md for compound learning

**Consequences:**
- (+) Reduces baseline token consumption by ~40%
- (+) Enables compound learning across sessions
- (+) Domain rules load only when relevant (e.g., React rules only when editing `.tsx` files)
- (-) Requires migration effort from monolithic CLAUDE.md
- (-) Agent memory limited to first 200 lines auto-loaded; overflow needs topic files

### ADR-002: Agent Routing

**Context:** MMOS currently uses ad-hoc agent spawning via `subagent_type: "general-purpose"` with inline persona instructions. The ecosystem offers built-in agents (Explore, Plan), custom `.claude/agents/` definitions, and the Agent Teams experimental feature.

**Decision:** Adopt a **registry-based agent system** using `.claude/agents/` markdown files:
- Define each specialized agent with explicit `tools`, `permissionMode`, `model`, and `memory` frontmatter
- Use `model` field for cost-tier routing (Haiku for read-only analysis, Sonnet for implementation, Opus for planning)
- Reserve Teams for genuinely parallel workloads (execute-epic with independent stories)
- Subagent spawning via `Task(subagent_type: "agent-name")` with the agent file as the source of truth

**Consequences:**
- (+) Consistent agent behavior across sessions
- (+) Cost optimization via per-agent model assignment
- (+) Reusable agent definitions across skills
- (-) Cannot nest subagents (platform limitation)
- (-) Max 10 concurrent subagents

### ADR-003: Team Coordination

**Context:** Agent Teams (experimental, Feb 6, 2026) provide true multi-session parallelism with shared task lists and messaging. Third-party tools (claude-flow, oh-my-claudecode, claude-squad) offer alternative patterns.

**Decision:** Use **Agent Teams selectively** for high-parallelism tasks only:
- **Use Teams when**: 3+ independent tasks can run simultaneously (e.g., multi-story epic execution, parallel research waves)
- **Use subagents when**: Tasks are sequential or need shared context (e.g., story-cycle phases)
- **Use single-session when**: Task is simple and linear
- **Avoid Teams when**: Cost sensitivity is high (7x token multiplier) or tasks have heavy interdependencies

**Consequences:**
- (+) 3-10x speed improvement for parallel workloads
- (+) True isolation prevents agent interference
- (-) ~7x cost increase vs solo sessions
- (-) No persistent memory for teammates
- (-) No nested teams (deliberate cost control)
- (-) Experimental flag required (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`)

### ADR-004: Skill Composition

**Context:** Skills can be simple (prompt injection), forked (isolated subagent), or team-orchestrated. The Agent Skills open standard defines the canonical format. Progressive disclosure manages token economy.

**Decision:** Adopt **three skill tiers** following the open standard:
1. **Simple skills**: Inline prompt, no fork. For quick operations (formatting, lookup, status).
2. **Forked skills** (`context: fork` + `agent:`): Isolated execution with specific agent. For complex workflows (story-cycle, tech-research).
3. **Orchestrator skills**: Human-invocable skill that instructs the lead to create teams. For parallelizable epics.

Each skill follows the directory structure: `SKILL.md` + optional `scripts/`, `references/`, `assets/`. No `_shared/` between skills (anti-pattern per Anthropic design).

**Consequences:**
- (+) Interoperable with OpenAI Codex, Cursor, and other adopters of the standard
- (+) Progressive disclosure keeps startup cost at ~100 tokens/skill
- (+) Self-contained skills are portable and testable
- (-) Some duplication between skills (intentional trade-off per Anthropic philosophy)

### ADR-005: Cost Management

**Context:** Average $6/dev/day, but agent teams burn 7x more. Runaway subagents documented at 887K tokens/minute. MMOS currently has no budget controls.

**Decision:** Implement **layered cost controls**:
1. **Budget limits**: `maxBudgetUsd` on all SDK-invoked agents and subagents
2. **Model routing**: Haiku for routing/classification, Sonnet for implementation, Opus for planning only
3. **Context hygiene**: Tool Search enabled, CLAUDE.md slimmed, unused MCPs disabled
4. **Session limits**: `/clear` between distinct tasks, manual compact at 70%
5. **Monitoring**: OpenTelemetry metrics for per-agent cost tracking

**Consequences:**
- (+) Expected 50-70% cost reduction from model routing alone
- (+) Budget limits prevent runaway scenarios
- (+) Monitoring enables data-driven optimization
- (-) Model routing adds complexity to agent definitions
- (-) Budget limits may truncate long-running tasks (need graceful degradation)

### ADR-006: Quality Gates

**Context:** CLAUDE.md instructions are advisory (ignored under context pressure). Hooks are deterministic (always fire). MMOS has hooks for SQL governance, read protection, slug validation, architecture-first, and path validation.

**Decision:** Adopt **hooks for enforcement, CLAUDE.md for guidance**:
- **Hooks (deterministic)**: SQL governance, read protection, file locking, cost limits, test requirements, security checks
- **CLAUDE.md (advisory)**: Coding conventions, workflow preferences, documentation standards
- **Generator-Critic loops**: Max 1-2 refinement cycles for quality (bounded, not infinite)
- **Pre-push gates**: Lint + typecheck + test as hook-enforced prerequisites

**Consequences:**
- (+) Critical rules cannot be bypassed
- (+) Reduced CLAUDE.md size improves instruction adherence for remaining rules
- (+) Generator-Critic prevents both single-pass sloppiness and infinite-loop waste
- (-) Hook development requires shell scripting expertise
- (-) Some hooks add latency to every tool call

---

## 3. Implementation Priority Matrix

### P0: This Week (High ROI, Low Effort)

| # | Item | Effort | Impact | Dependencies |
|---|------|--------|--------|-------------|
| 1 | **Slim CLAUDE.md to <300 lines** | 2h | HIGH: ~40% token reduction, better instruction adherence | None |
| 2 | **Enable Tool Search** (`ENABLE_TOOL_SEARCH=auto:10`) | 5min | HIGH: 85% MCP token reduction | None |
| 3 | **Disable unused MCP servers** (audit via `/context`) | 30min | MEDIUM: Recover 8-30% context per unused MCP | None |
| 4 | **Add `memory: project` to key agents** (deep-researcher, dev, architect) | 1h | HIGH: Enable compound learning for top agents | None |
| 5 | **Migrate SQL governance from advisory to hook** (already done) | 0h | HIGH: Already implemented | None |
| 6 | **Add `maxTurns` to all subagent definitions** | 30min | MEDIUM: Prevent runaway agents | Agent files exist |
| 7 | **Move domain-specific rules to `.claude/rules/*.md`** with glob patterns | 2h | MEDIUM: Conditional loading saves tokens | P0.1 |

### P1: This Month (Significant Improvements)

| # | Item | Effort | Impact | Dependencies |
|---|------|--------|--------|-------------|
| 8 | **Implement compound learning loop** (Claudeception-inspired) | 3d | VERY HIGH: Debugging 2h->5min->2min trajectory | P0.4 |
| 9 | **Upgrade skills to Agent Skills standard** (frontmatter + directory structure) | 2d | HIGH: Ecosystem interoperability | None |
| 10 | **Add model routing to agent definitions** (Haiku/Sonnet/Opus per agent) | 1d | HIGH: 50-80% cost reduction | Agent files updated |
| 11 | **Build pre-push quality gate hook** (lint + typecheck + test) | 4h | HIGH: Deterministic quality enforcement | None |
| 12 | **Implement bounded Generator-Critic** for story-cycle (max 2 refinement cycles) | 1d | HIGH: Better output quality without infinite loops | P1.9 |
| 13 | **Create session handoff automation** (PostSession hook -> handoff.md) | 4h | MEDIUM: Never lose session context | None |
| 14 | **Add OpenTelemetry cost tracking** | 1d | MEDIUM: Data-driven cost optimization | None |

### P2: Next Quarter (Strategic Investments)

| # | Item | Effort | Impact | Dependencies |
|---|------|--------|--------|-------------|
| 15 | **Agent Teams for execute-epic** (parallel story execution) | 1w | HIGH: 3-10x epic velocity | Teams stable |
| 16 | **Custom MCP server for MMOS tooling** (state manager, context loader) | 1w | HIGH: Formal integration point | MCP knowledge |
| 17 | **Instinct-based learning system** (ECC v2 inspired) | 2w | VERY HIGH: Autonomous skill extraction | P1.8 |
| 18 | **Plugin packaging for MMOS** (distributable configuration) | 3d | MEDIUM: Reproducible setup across environments | P1.9 |
| 19 | **GitHub Actions CI/CD with claude-code-action** | 2d | MEDIUM: Automated PR review, test generation | None |
| 20 | **Background agent workaround** (tmux + Git worktree isolation) | 2d | MEDIUM: Parallel execution without Teams overhead | None |

### P3: Future (Monitor Ecosystem)

| # | Item | Effort | Impact | Dependencies |
|---|------|--------|--------|-------------|
| 21 | **Native background/async agents** | -- | HIGH: Depends on Anthropic roadmap | Anthropic ships it |
| 22 | **Semantic codebase indexing** (Augment-style Context Engine) | -- | HIGH: 400K+ file semantic search | Platform support |
| 23 | **Citation-based memory** (Copilot 2026 pattern) | -- | MEDIUM: Memory entries verified against code | Platform support |
| 24 | **MCP Sampling adoption** (server-side agent delegation) | -- | MEDIUM: Draft spec, not yet GA | Spec finalization |
| 25 | **Agent marketplace participation** (publish MMOS skills) | 1w | LOW: Community contribution | P1.9, P2.18 |

---

## 4. Competitive Position Assessment

### Where Claude Code Leads

1. **Agent Teams**: The only tool with formal multi-agent orchestration (shared task list, inter-agent messaging, team lead pattern). Cursor 2.0 has parallel agents but no coordination protocol.
2. **Skills/Agent Skills Standard**: Created the open standard now adopted by competitors. First-mover advantage in the skill ecosystem (339+ on skills.sh, 160K+ on SkillsMP).
3. **Hooks lifecycle**: 14 deterministic event points with 3 handler types. No competitor has comparable lifecycle control. ECC's instinct system proves hooks > skills for observation reliability.
4. **Agent SDK**: Full programmatic access to the agent loop (TypeScript + Python). Codex CLI is open-source but lacks the SDK's abstraction level.
5. **MCP ecosystem**: Largest MCP adoption (97M monthly SDK downloads, 10K+ servers). MCP is now Linux Foundation standard.
6. **Memory depth**: 5 memory layers + agent memory + Session Memory. More nuanced than any competitor.
7. **Progressive disclosure**: Skills load metadata at ~100 tokens, body at <5K, resources on demand. Competes with Augment's Context Engine on a per-token efficiency basis.

### Where Claude Code Lags

1. **No background/async agents**: Cursor 2.0 (VM-based Background Agents), Codex CLI (Cloud Codex), Copilot (Coding Agent), Devin (fully async), Jules (cloud VM per task), Augment (Remote Agents). Claude Code requires tmux workarounds.
2. **No semantic codebase indexing**: Augment indexes 400K+ files with incremental re-indexing. Claude Code relies on manual Glob/Grep search.
3. **No native IDE**: Cursor and Windsurf provide full IDE experience. Claude Code is CLI-first with VS Code extension as add-on.
4. **No built-in parallel sessions**: Cursor 2.0 runs 8 parallel agents via git worktrees natively. Claude Code needs claude-squad or manual setup.
5. **No citation-based memory**: Copilot 2026 stores memories with code references, auto-verifying against current branch. Claude Code memories are free-text.
6. **Cost transparency**: Average $6-20/session with opaque token accounting. Cursor/Windsurf offer flat $15-20/mo subscriptions.

### Market Trends to Watch

1. **Skills standardization**: Agent Skills (agentskills.io) becoming universal. Cross-tool skill portability is imminent.
2. **Background agents**: Every major competitor is shipping cloud-based async execution. Anthropic will need to respond.
3. **Enterprise governance**: Amazon Q has the most mature enterprise story (5 specialized agents, IAM integration). Enterprise demand is growing.
4. **Multi-model arbitrage**: Tools that route to cheapest-capable model will win on cost. Google ADK and LangGraph lead here.
5. **Agent observability**: OpenTelemetry adoption for AI agent monitoring is early but accelerating. First-class dashboards will differentiate.

### Strategic Bets

1. **Bet on Skills as the universal packaging format**: Build all MMOS workflows as standards-compliant skills. If the ecosystem converges on this standard, MMOS skills become portable.
2. **Bet on compound learning as moat**: While competitors focus on single-session performance, invest in cross-session knowledge accumulation. This compounds and cannot be easily replicated.
3. **Bet on hooks for governance**: As AI agents get more autonomous, deterministic governance becomes more valuable. MMOS's hook infrastructure is already ahead of most competitors.

---

## 5. MMOS Workflow Upgrade Roadmap

### 5.1 story-cycle v2

**Current state:** Single-agent sequential workflow (plan -> implement -> test -> review -> commit).

**What changes:**
- ADD: Generator-Critic loop (max 2 cycles) after implementation phase
- ADD: Model routing -- Haiku for file analysis, Sonnet for implementation, Opus for planning
- ADD: `memory: project` for the story-cycle agent to learn from past stories
- ADD: Session handoff hook (auto-generate handoff.md on session end)
- CHANGE: Fork agent context for each phase (isolate implementation from review)
- CHANGE: Quality gate from advisory (CLAUDE.md) to deterministic (pre-commit hook)
- REMOVE: Inline prompting of full codebase context (use scoped handoffs instead)

**Expected improvement:** 30-50% reduction in rework from Generator-Critic. 40-60% cost reduction from model routing. Compound learning reduces debugging time session-over-session.

### 5.2 tech-research v4

**Current state:** Deep-researcher agent with parallel WebSearch waves, ETL-first page reading, structured reports.

**What changes:**
- ADD: Agent memory persistence (`memory: project`) to cache source quality, search patterns, and domain expertise
- ADD: Blog Discovery for expanding high-quality sources
- ADD: Semantic chunking for long-content processing (>5K chars)
- ADD: Multi-provider search fallback chain (Exa -> Brave -> SerpAPI -> WebSearch)
- CHANGE: Structured JSON output for worker mode (machine-readable findings)
- CHANGE: Progressive wave execution with coverage tracking (stop when >85% coverage)
- REMOVE: Redundant re-reading of pages already covered in previous waves

**Expected improvement:** 50% reduction in token waste from chunking. Cross-session source quality cache avoids re-evaluating known sources. Coverage tracking prevents over-research.

### 5.3 execute-epic v2

**Current state:** Sequential story execution with manual handoffs between stories.

**What changes:**
- ADD: Dependency graph analysis (identify parallelizable stories)
- ADD: Agent Teams orchestration for independent stories (when 3+ stories have no deps)
- ADD: Git worktree isolation per agent (claude-squad pattern) to prevent file conflicts
- ADD: Progress dashboard via hook-based telemetry
- CHANGE: Budget controls per story (maxBudgetUsd) with graceful degradation
- CHANGE: Team lead pattern -- lead handles architecture, teammates handle individual stories
- REMOVE: Sequential blocking when stories are independent

**Expected improvement:** 3-5x epic velocity for parallelizable workloads. Budget controls prevent cost surprises. File isolation eliminates merge conflicts.

### 5.4 enhance-workflow v2

**Current state:** Meta-skill that improves other skills by reading current implementation and suggesting changes.

**What changes:**
- ADD: Ecosystem awareness -- search skills.sh and awesome-agent-skills for relevant community skills before reinventing
- ADD: Agent Skills standard compliance checker (validate frontmatter, directory structure)
- ADD: Token budget analysis (estimate skill's context cost using progressive disclosure model)
- ADD: Generator-Critic loop for proposed improvements (self-review before presenting to user)
- CHANGE: Read the target skill's agent memory (if any) to understand past iterations
- CHANGE: Output includes migration plan (not just "what to change" but "how to change safely")

**Expected improvement:** Better-informed improvements from ecosystem awareness. Standard compliance ensures portability. Migration plans reduce risk.

---

## 6. Knowledge Base Index

### Complete File Index

| # | File | Wave | Lines | Topic | Key Contribution |
|---|------|------|-------|-------|-----------------|
| 1 | `wave1-agent-memory.md` | 1 | ~300 | Memory architecture, 5 layers, agent memory frontmatter | Definitive memory hierarchy documentation |
| 2 | `wave1-teams-swarms.md` | 1 | ~400 | Agent Teams architecture, 7 primitives, C compiler case study | Teams capability assessment |
| 3 | `wave1-integration-patterns.md` | 1 | ~350 | How skills+agents+memory+teams work together | Integration patterns and recursive limitations |
| 4 | `wave1-skills-advanced.md` | 1 | ~300 | Skills system deep dive, progressive disclosure, dynamic injection | Complete skills reference |
| 5 | `wave1-agents-architecture.md` | 1 | ~350 | Agent architecture, 11 frontmatter fields, 6 permission modes | Complete agents reference |
| 6 | `wave1-community-cases.md` | 1 | ~400 | Real-world cases, ecosystem explosion, Boris Cherny workflow | Ecosystem landscape |
| 7 | `wave2-community-cases.md` | 2 | ~350 | Official skills repo, obra/superpowers, wshobson/agents, SkillsMP | Community projects deep dive |
| 8 | `wave2-agent-sdk-headless.md` | 2 | ~400 | Agent SDK, headless mode, --agent flag, hooks, MCP, plugins, OTel | SDK + production reference |
| 9 | `wave2-workflow-improvement-patterns.md` | 2 | ~400 | DAG orchestration, quality gates, state management, cost optimization | Industry workflow patterns |
| 10 | `wave2-compound-learning.md` | 2 | ~500 | Claudeception, cross-session memory, learning loops, academic foundations | Compound learning playbook |
| 11 | `wave2-swarm-tools.md` | 2 | ~350 | claude-flow, oh-my-claudecode, claude-squad, ccswarm | Third-party orchestration tools |
| 12 | `wave2-official-skills-ecosystem.md` | 2 | ~400 | agentskills.io standard, skills.sh, ComposioHQ, skill factories | Skills ecosystem reference |
| 13 | `wave2-everything-claude-code.md` | 2 | ~1150 | ECC deep dive: 13 agents, instinct learning, 4-layer architecture | Most comprehensive config analysis |
| 14 | `wave3-gap-analysis.md` | 3 | ~500 | CI/CD, hooks deep-dive, plugins, cost, debugging, security, edge cases | Gap coverage for waves 1-2 |
| 15 | `wave3-architecture-blueprint.md` | 3 | ~400 | Integrated architecture blueprint for MMOS | Implementation blueprint |
| 16 | `wave3-claude-md-patterns.md` | 3 | ~350 | CLAUDE.md optimization, rules files, token economics | Configuration best practices |
| 17 | `wave3-improvement-proposals.md` | 3 | ~400 | Concrete proposals for story-cycle, tech-research, execute-epic, enhance-workflow | Per-workflow upgrade specs |
| 18 | `wave4-mcp-integration.md` | 4 | ~400 | MCP architecture, Tool Search, composition, sampling, production | MCP integration reference |
| 19 | `wave4-competitor-comparison.md` | 4 | ~500 | 9 competitors analyzed across 10 dimensions | Competitive intelligence |
| 20 | `wave4-production-patterns.md` | 4 | ~400 | Enterprise deployment, CI/CD, cost, monitoring, sandboxing, scaling | Production operations guide |
| 21 | `wave4-community-deep-threads.md` | 4 | ~500 | 15 hidden gems, practitioner wisdom, Boris Cherny, env vars, tips | Community knowledge distillation |

### Cross-Reference Matrix

| Topic | Primary Files | Supporting Files |
|-------|--------------|-----------------|
| **Memory** | wave1-agent-memory, wave2-compound-learning | wave1-integration-patterns, wave3-claude-md-patterns, wave4-community-deep-threads |
| **Agents** | wave1-agents-architecture, wave2-agent-sdk-headless | wave1-integration-patterns, wave2-everything-claude-code, wave3-architecture-blueprint |
| **Teams** | wave1-teams-swarms, wave2-swarm-tools | wave1-integration-patterns, wave3-gap-analysis, wave4-production-patterns |
| **Skills** | wave1-skills-advanced, wave2-official-skills-ecosystem | wave1-community-cases, wave2-community-cases, wave3-improvement-proposals |
| **MCP** | wave4-mcp-integration | wave2-agent-sdk-headless, wave3-gap-analysis, wave4-community-deep-threads |
| **Cost** | wave4-production-patterns, wave3-gap-analysis | wave2-workflow-improvement-patterns, wave4-community-deep-threads |
| **Quality** | wave3-gap-analysis, wave3-claude-md-patterns | wave2-workflow-improvement-patterns, wave3-improvement-proposals |
| **Ecosystem** | wave1-community-cases, wave2-community-cases | wave2-everything-claude-code, wave2-official-skills-ecosystem |
| **Competition** | wave4-competitor-comparison | wave4-production-patterns, wave1-teams-swarms |
| **Workflows** | wave3-improvement-proposals, wave3-architecture-blueprint | wave2-workflow-improvement-patterns, wave1-integration-patterns |
| **Hooks** | wave3-gap-analysis, wave2-agent-sdk-headless | wave3-claude-md-patterns, wave2-everything-claude-code, wave4-community-deep-threads |
| **Learning** | wave2-compound-learning, wave2-everything-claude-code | wave1-agent-memory, wave4-community-deep-threads |

### Quick-Reference Cards

#### Card: Agent Memory Setup
```yaml
# .claude/agents/my-agent.md
---
name: my-agent
memory: project  # Options: user | project | local
model: claude-sonnet-4-20250514
maxTurns: 25
---
# Agent memory auto-creates: .claude/agent-memory/my-agent/MEMORY.md
# First 200 lines auto-loaded into system prompt every session
# Use topic files for overflow: .claude/agent-memory/my-agent/topic.md
```

#### Card: Skill Structure (Agent Skills Standard)
```
.claude/skills/my-skill/
  SKILL.md          # YAML frontmatter (name + description required) + prompt body
  scripts/          # Helper scripts
  references/       # Context documents
  assets/           # Static assets
```

#### Card: Hook for Deterministic Enforcement
```json
// .claude/settings.json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash",
      "handler": {
        "type": "command",
        "command": "python3 .claude/hooks/my-check.py"
      }
    }]
  }
}
```

#### Card: Team Creation
```
# Requires: CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
# Team Lead creates team and assigns tasks:
TeamCreate(team_name, description)
TaskCreate(team, task_description, assignee?)
SendMessage(teammate, message)
# Teammates execute independently, update via TaskUpdate
# No nested teams. No teammate persistent memory.
```

#### Card: Cost Control
```yaml
# SDK: maxBudgetUsd per agent
agent = AgentDefinition(max_budget_usd=5.0)

# Model routing:
# Haiku: routing, classification, read-only analysis (~$0.25/M tokens)
# Sonnet: implementation, code generation (~$3/M tokens)
# Opus: planning, architecture, complex reasoning (~$15/M tokens)

# Context hygiene:
# ENABLE_TOOL_SEARCH=auto:10 (85% MCP token reduction)
# /clear between tasks (reset context)
# /compact at 70% context (manual > auto)
```

---

## 7. Open Questions & Future Research

### What We Still Don't Know

1. **Agent Teams stability**: Experimental flag still required. No public benchmarks beyond the C compiler case study. Unknown failure modes at scale for non-Anthropic teams.
2. **Memory scaling**: How does agent MEMORY.md performance degrade beyond 200 lines? What is the optimal topic file organization for 100+ session histories?
3. **Skill marketplace economics**: Will skills.sh / SkillsMP achieve network effects? Is there a monetization model that sustains quality?
4. **Hook performance overhead**: With 5+ hooks on PreToolUse, what is the cumulative latency impact? No public benchmarks.
5. **Agent Teams + Memory workaround**: Can teammates write to shared files as a memory substitute? What are the file conflict patterns?
6. **1M context beta**: Available but costs 2x at >200K tokens. When does the cost-benefit flip? For MMOS workflows, is 200K sufficient?

### Emerging Areas to Monitor

1. **MCP Sampling GA**: Currently draft spec. When it ships, it enables server-side agent delegation -- a game-changer for MCP-heavy workflows.
2. **Background/async agents**: Anthropic's response to Cursor 2.0 Background Agents and Codex Cloud. Expected Q2-Q3 2026.
3. **Skills standardization convergence**: Watch for version 2.0 of agentskills.io spec. Inter-tool skill migration tooling is nascent.
4. **Enterprise admin controls**: Managed Policy layer (`/Library/Application Support/ClaudeCode/`) is underdocumented. Enterprise governance features are expanding.
5. **Agent-to-agent protocols**: Beyond Teams' simple messaging, will a formal inter-agent communication protocol emerge? Google ADK's A2A protocol is a candidate.
6. **Fine-tuned agent models**: Will Anthropic offer fine-tuning for agent-specific behavior? Would reduce the need for complex system prompts.

### Experiments to Run

1. **CLAUDE.md diet experiment**: Measure token savings and instruction adherence with current CLAUDE.md vs 300-line vs 60-line versions across 10 identical tasks.
2. **Model routing A/B test**: Compare cost and quality of Haiku-routing vs all-Sonnet for story-cycle across 5 stories.
3. **Compound learning measurement**: Track debugging time and rework rate across 20 sessions with agent memory enabled vs disabled.
4. **Agent Teams throughput test**: Execute a 5-story epic with Teams vs sequential, measuring wall-clock time, cost, and output quality.
5. **Hook latency benchmark**: Measure cumulative overhead of 1, 3, 5, and 10 PreToolUse hooks across 50 tool calls.
6. **MCP context audit**: Run `/context` before and after disabling each MCP server, quantifying exact token recovery.

---

## Appendix: Research Methodology

- **Wave 1** (6 files): Foundation research on each pillar (skills, agents, memory, teams, integration, community cases)
- **Wave 2** (7 files): Deep dives into SDK, workflows, compound learning, swarm tools, skills ecosystem, ECC analysis
- **Wave 3** (4 files): Gap analysis, architecture blueprint, CLAUDE.md patterns, improvement proposals
- **Wave 4** (4 files): MCP integration, competitor comparison, production patterns, community deep threads
- **Wave 5** (this file): Final synthesis consolidating all findings

**Total effort:** ~400 unique sources consulted, ~250 pages deep-read via WebFetch/ETL, 21 research files produced, ~8,000 lines of research documentation.

**Quality gates met:**
- [x] 10+ unique sources per wave (exceeded: 400+ total)
- [x] 5+ pages read completely per wave (exceeded: 250+ total)
- [x] All assertions have source citations (in individual wave files)
- [x] TL;DR summarizes key points (every file)
- [x] Recommendations are actionable (ADRs + Priority Matrix)
- [x] Gaps identified (Section 7)

---

*Research conducted by deep-researcher agent on 2026-02-09*
*Consolidated from 21 research files across 5 waves*
