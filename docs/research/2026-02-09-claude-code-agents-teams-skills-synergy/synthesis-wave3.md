# Wave 3 Synthesis - Architecture & Improvements

> **Source Files:** 4 Wave 3 research documents (~4,600 lines total)
> **Date:** 2026-02-09
> **Purpose:** Consolidated synthesis of architecture blueprint, CLAUDE.md patterns, gap analysis, and improvement proposals for MMOS

---

## Key Findings by Topic

### Architecture Blueprint

The architecture blueprint defines a 4-pillar integrated system: **Skills** (WHAT to do), **Agents** (WHO does it), **Teams** (HOW to coordinate), and **Memory** (WHAT was learned), unified by a **Governance** layer (hooks, quality gates, cost tracking).

**Core design decisions:**

1. **Memory Architecture**: All 37 MMOS agents should use `memory: project` scope, with MEMORY.md files capped at 200 lines (hard limit 250). Three templates defined: Domain Specialist (Template A, 115 lines), MMOS Pipeline Specialist (Template B, focused on phase heuristics and cross-mind patterns), and Research Agent (Template C, already implemented for deep-researcher). Topic files provide unlimited overflow storage loaded on demand.

2. **Agent Specialization Registry**: A machine-readable `agent-registry.yaml` maps every agent to its domains, model tier, permission mode, memory scope, and best-for scenarios. This enables skills and orchestrators to route tasks dynamically without hardcoding agent names. Three model tiers defined: Exploration (Haiku, 1x cost), Implementation (Sonnet, 3x), Reasoning (Opus, 15x).

3. **Team Coordination Patterns**: Three team templates formalized -- Parallel Review (3-5 specialists, file-based coordination), Sequential Pipeline (handoff documents between phases), and MMOS Pipeline (9 agents, Context Parity). The decision tree: 1 agent = subagent, 2+ agents without communication = parallel subagents, 2+ with communication = Team. File-based coordination for data >500 tokens, message-based for status/questions.

4. **Skill Composition Patterns**: Four composition patterns: Simple (runs in main context), Forked (isolated subagent via `context: fork`), Skill-to-Team (skill triggers TeamCreate), Agent-to-Skills (agent has pre-loaded skills). Skill pipelines include Linear, Fan-Out/Fan-In, and Generator-Critic Loop (bounded to max 2 iterations).

5. **Implementation Roadmap**: 4 phases -- Memory Foundation (Week 1, 10h), Agent Routing (Weeks 2-3, 17h), Team Patterns (Month 1, 31h), Compound Learning (Ongoing). Phase 1 touches 37 agent files, creates MEMORY.md templates, and adds a memory-size-guard hook.

### CLAUDE.md Patterns

The research reveals MMOS's CLAUDE.md is at 461 lines -- significantly above the 300-line recommended maximum and far above the 60-line ideal advocated by some practitioners. Key findings:

1. **The Monolithic Anti-Pattern**: The current CLAUDE.md mixes universal rules, domain-specific standards, personal preferences, and file organization into one document. The fix: split into lean CLAUDE.md (~120 lines) plus `.claude/rules/` files with path-targeted frontmatter (e.g., `database.md` targeting `supabase/**`).

2. **Hooks > CLAUDE.md for Enforcement**: CLAUDE.md instructions are "advisory" -- Claude can ignore them under context pressure. Hooks are "deterministic" -- they always fire. Any rule that must NEVER be violated belongs in a hook, not CLAUDE.md. This validates MMOS's existing hook architecture (read-protection, sql-governance, slug-validation, etc.).

3. **Token Economics**: ~20K tokens baseline for CLAUDE.md load, ~6K per enabled MCP, ~100 tokens per skill metadata. The "10/80 rule": keep under 10 MCPs and 80 total tools. Exceeding this forces frequent compaction adding ~30K tokens per session. An 86% cost reduction was documented in a real-world case by using model hierarchy + modular files vs. all-Opus monolithic approach.

4. **Skills Auto-Discovery**: Description quality is the single most important factor for skill matching. Generic descriptions achieve ~20% activation; specific keywords + triggers + examples achieve 72-90%. Use third-person voice, include action verbs and output formats, max 1024 characters.

5. **Progressive Disclosure**: Move detailed information out of CLAUDE.md into skills (on-demand loading). SKILL.md body should stay under 500 lines. Keep references one level deep to prevent Claude from truncating with `head -100`.

6. **Alan's Personal Rules**: The 150-line personal rules section should move to `.claude/rules/alan-preferences.md` or `CLAUDE.local.md` to reduce universal CLAUDE.md load.

### Gap Analysis

Wave 3 gap analysis covered 8 areas that Waves 1-2 missed or underexplored:

1. **GitHub Actions (claude-code-action@v1)**: GA release supports 4 auth methods, structured JSON outputs for CI pipeline decisions, 6 workflow patterns (interactive PR review, auto-review, scheduled maintenance, issue-to-PR, label-triggered, structured analysis). Claude can now serve as a decision node in CI pipelines.

2. **Hooks Deep-Dive**: 14 hook events total (not 12 as previously documented). Three handler types: command (shell script, 10min timeout), prompt (single-turn LLM, 30s), agent (multi-turn with tools, 60s). PreToolUse has the richest control: allow/deny/ask + `updatedInput` for tool parameter modification before execution. Async hooks (`async: true`) run in background without blocking.

3. **Plugin System**: Git-based distribution via marketplace repos. Official directory at `anthropics/claude-plugins-official`. Community platforms: skills.sh (339+ skills), claude-plugins.dev, skillsmp.com. Plugins bundle skills, agents, and hooks with `${CLAUDE_PLUGIN_ROOT}` for portable paths.

4. **Cost Management**: Average $6/dev/day ($100-200/mo). Agent teams use ~7x more tokens than solo. SDK provides `total_cost_usd` and per-model `modelUsage` breakdown. Horror story: 887K tokens/minute with runaway subagents. Budget controls: `maxBudgetUsd` (SDK), workspace limits (Console), model routing (50-80% savings).

5. **Debugging Multi-Agent**: `disler/claude-code-hooks-multi-agent-observability` provides real-time dashboard (Bun + SQLite + Vue). Native tools: `claude --debug`, `Ctrl+O` verbose, `/debug` command, `Ctrl+T` task list for teams. Subagent transcripts accessible via `agent_transcript_path` in SubagentStop hook.

6. **Recent Releases (v2.1.30-v2.1.37)**: Fast mode for Opus 4.6, PDF page ranges, `/debug` command, auto memory, 1M token context beta (2x premium above 200K), `--resume` 68% memory improvement, sandbox security patch, skill budget scales to 2% of context.

7. **Edge Cases**: No file locking between teammates (last write wins). Context compaction loses nuance. Tool Search reduces MCP context bloat by 46.9%. Git worktree isolation (claude-squad pattern) is the proven solution for file conflicts. `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` for early compaction control.

8. **Security**: OS-level sandboxing via macOS Seatbelt / Linux bubblewrap. Reduces permission prompts by 84%. Two modes: auto-allow (sandboxed commands run freely) and regular permissions. Open-source sandbox runtime: `@anthropic-ai/sandbox-runtime`. Per-agent isolation via permission modes, tool allow/deny lists, and MCP server scoping.

### Improvement Proposals

28 concrete proposals across 4 MMOS workflows (story-cycle, tech-research, execute-epic, enhance-workflow):

**Cross-Cutting (4 proposals):**
- Hook-based cost telemetry with per-agent cost-ledger.jsonl
- 3-tier model routing matrix (Haiku/Sonnet/Opus by task type)
- `memory: project` on high-frequency agents (qa, dev, po)
- Unified state.json schema across all workflows

**story-cycle (10 proposals):**
- ADD: Pre-flight validation (deterministic, $0), quality score trending, haiku self-review gate (catches 60% of QA issues at 10x lower cost)
- CHANGE: PO validation Opus->Haiku with escalation, QA review Opus->Sonnet, structured rejection format
- REMOVE: Team creation overhead (use direct Task() calls), CodeRabbit detection (move to optional hook)
- Expected: 40-60% cost reduction, 60% fewer QA cycles

**tech-research (7 proposals):**
- ADD: Source quality feedback loop (auto-update MEMORY.md), speculative Wave 2 pre-dispatch (30-60s latency reduction), quality score in README.md
- CHANGE: Citation verification Opus->Haiku, worker prompt compression (500->50 tokens), adaptive sub-query count (3-9 based on breadth)
- REMOVE: Phase 3.2 deep read (redundant with workers), technology detection keyword lists
- Expected: 30-50% cost reduction, compound source quality improvement

**execute-epic (8 proposals):**
- ADD: Git worktree isolation for parallel stories, progressive autonomy gate (trust-based escalation), cross-story context compression
- CHANGE: PO validation->Haiku, QA->Sonnet, parallel expand+validate within waves (3x throughput)
- REMOVE: Retrospective phase (lead generates inline), scope classification simplification (4 tiers->2)
- Expected: 40-50% cost reduction, 3x throughput per wave, 0 file conflicts

**enhance-workflow (7 proposals):**
- ADD: Optional competitive/prior art analysis, roundtable divergence voting protocol, enhancement estimation
- CHANGE: Roundtable agents Opus->Sonnet ($2.80 savings), parallel discovery+research (25-35% faster), IDS check inline
- REMOVE: Explicit Team/Task management overhead
- Expected: 40-50% cost reduction, 25-35% faster

---

## Cross-Cutting Patterns

### 1. Model Routing Is the Highest-Leverage Optimization

Across all 4 research files, model routing emerges as the single highest-impact, lowest-effort change. The pattern is consistent:

| Task Type | Current Model | Proposed Model | Savings |
|-----------|--------------|----------------|---------|
| Structured validation/scoring | Opus | Haiku (with escalation) | ~25x cost reduction |
| Code review, QA, implementation review | Opus | Sonnet | ~5x cost reduction |
| Complex reasoning, architecture, synthesis | Opus | Opus (no change) | Baseline |
| File exploration, classification | Opus/Sonnet | Haiku (Explore agent) | ~20x cost reduction |

The real-world case study shows 86% total cost reduction from model hierarchy alone. MMOS currently uses Opus for nearly everything, making this the single biggest opportunity.

### 2. Advisory vs. Deterministic Enforcement

A clear design principle runs through all documents: CLAUDE.md is advisory, hooks are deterministic. Rules that "must never be violated" belong in hooks. Rules that "guide best practices" belong in CLAUDE.md. Rules that are "domain-specific" belong in `.claude/rules/` with path targeting.

Current MMOS hooks already follow this principle (sql-governance, read-protection, slug-validation). The blueprint extends this with memory-size-guard, team-cost-tracker, agent-compliance-logger, and handoff-quality-gate hooks.

### 3. Compound Learning Through Persistent Memory

All documents converge on the value of agent memory. The cross-session learning pipeline shows agents evolving from raw discovery (v1) through validated patterns (v2) to curated institutional knowledge (v3). The 200-line MEMORY.md limit forces active curation, with topic files for overflow.

The compound learning targets are ambitious but evidence-based: 30% memory reference rate after 1 week, 50% reduction in repeated mistakes after 1 month, 40% reduction in avg turns after 3 months.

### 4. File-Based Coordination Over Message-Based

For multi-agent workflows, file-based coordination is consistently preferred over message-based communication when data exceeds ~500 tokens. The handoff document format (Status, Context, Findings, Files Modified, Questions, Recommendations) provides audit trails and enables quality gating between phases.

### 5. Progressive Disclosure Everywhere

The progressive disclosure pattern appears at every level: CLAUDE.md (lean core + rules files), skills (name+description -> SKILL.md -> reference files), memory (MEMORY.md 200 lines -> topic files on demand), agent registry (metadata -> full agent definition). This pattern optimizes token economics while maintaining full capability.

### 6. Remove Unnecessary Team Overhead

Both story-cycle and enhance-workflow create Teams (`TeamCreate`) but use only sequential `Task()` calls. Teams are designed for parallel coordination with inter-agent messaging. Sequential-only workflows should use direct `Task()` calls with `state.json` for progress tracking, eliminating Team overhead.

### 7. Quality Gates Between Phases

The Generator-Critic pattern (bounded to max 2 iterations) is recommended for all production workflows. A cheap critic (Haiku) before an expensive evaluator (Opus/Sonnet QA) catches 60-70% of issues at 10x lower cost. Deterministic quality gates (format check, completeness, word count) should precede LLM-based semantic evaluation.

---

## Gaps Identified

### Platform-Level Gaps (Cannot Be Solved by MMOS)

1. **No file locking between teammates**: Last write wins. Must be mitigated via file ownership partitioning or Git worktree isolation.
2. **Subagents cannot spawn subagents**: No recursive delegation. Teams are flat only.
3. **No shared memory between teammates**: Must use files or messages for inter-agent data sharing.
4. **Cost attribution per teammate not available**: SDK provides per-model cost but not per-agent cost in team contexts.
5. **Agent teams still experimental**: Requires `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` environment flag.
6. **Skills fire ~56% in Anthropic's own tests**: Description quality is critical -- generic descriptions fail badly.
7. **No heartbeat/health check for long-running agents**: Agents running for hours have no monitoring mechanism.
8. **Context compaction loses nuance**: Trade-offs discussed, alternatives considered, and rationale behind rejected approaches are lost.

### MMOS-Specific Gaps

1. **CLAUDE.md at 461 lines**: Above the 300-line max, far above the 60-line ideal. Needs restructuring.
2. **No cost visibility**: No tracking of per-workflow, per-agent, per-phase token costs. Flying blind on spend.
3. **No agent memory**: Except deep-researcher, no agent accumulates institutional knowledge across sessions.
4. **No agent registry**: Skills hardcode agent names instead of routing dynamically based on competency.
5. **No model routing**: Nearly everything runs on Opus, wasting budget on tasks Haiku/Sonnet handle well.
6. **No file conflict prevention**: Parallel story execution in execute-epic risks last-write-wins data loss.
7. **Growing accumulated context**: execute-epic's accumulated-context.md grows linearly without compression.
8. **Team overhead without benefit**: story-cycle and enhance-workflow create Teams for sequential-only workflows.
9. **Free-text rejection feedback**: Ambiguous retry instructions in feedback loops waste tokens on misunderstanding.
10. **No pre-flight validation**: Workflows spawn expensive agents before checking basic preconditions.
11. **Hook system underutilized**: Only 8 of 14 hook events are used. Missing: PostToolUseFailure, PreCompact, Notification, SessionEnd.
12. **No plugin strategy**: No plan for distributing MMOS skills/agents as plugins or consuming community plugins.

### Research Gaps (Need Further Investigation)

1. **Agent teams + sandboxing interaction**: No documentation on whether teammates inherit the lead's sandbox configuration.
2. **Cross-repo agent teams**: No documentation on teams spanning multiple repositories.
3. **Quantitative CLAUDE.md performance benchmarks**: The 300-line recommendation is practitioner experience, not controlled experiments.
4. **Auto memory + CLAUDE.md interaction**: Unclear if auto memory notes can conflict with CLAUDE.md rules.
5. **Hook input modification for PermissionRequest**: `updatedPermissions` field exists but no complex policy examples.
6. **Emphasis saturation**: "IMPORTANT" and "YOU MUST" confirmed to work, but no measurement of diminishing returns.
7. **Plugin versioning**: No mechanism for version pinning or upgrade management beyond Git.

---

## Actionable Items for MMOS

### Priority 1: Immediate (This Week) -- Highest ROI

| # | Action | Effort | Impact | Source |
|---|--------|--------|--------|--------|
| 1 | **Add model routing to all workflows** (PO=haiku, QA=sonnet, explore=haiku) | 3h | 40-60% cost reduction | Improvement Proposals 1.2, 2B.1-2, 4B.1-2, 5B.1 |
| 2 | **Add `memory: project` to aios-qa, aios-dev, aios-po, aios-sm** | 30min | Compound learning begins | Blueprint 1.1, Proposals 1.3 |
| 3 | **Split CLAUDE.md** from 461 to ~120 lines + rules files | 2h | Better rule adherence, lower token cost | CLAUDE.md Patterns 11.1-11.4 |
| 4 | **Add pre-flight validation script** to story-cycle | 2h | Prevents false starts ($0.50-1.00 saved per) | Proposals 2A.1 |
| 5 | **Remove Team overhead** from story-cycle and enhance-workflow | 1h | Simplification, faster execution | Proposals 2C.2, 5C.1 |

### Priority 2: Short-Term (Next 2 Weeks) -- Foundation

| # | Action | Effort | Impact | Source |
|---|--------|--------|--------|--------|
| 6 | **Create agent-registry.yaml** | 3h | Enables dynamic routing for all skills | Blueprint 2.4 |
| 7 | **Create MEMORY.md templates** for all agent categories | 3h | Standardized memory structure | Blueprint 1.2 |
| 8 | **Implement memory-size-guard hook** | 1h | Prevents MEMORY.md bloat | Blueprint 5.1 |
| 9 | **Add haiku self-review gate** to story-cycle (Phase 3.5) | 1h | 60% fewer QA rejections | Proposals 2A.3 |
| 10 | **Implement structured rejection format** in feedback loops | 2h | Better retry efficiency | Proposals 2B.3 |
| 11 | **Parallelize discovery+research** in enhance-workflow | 1h | 25-35% faster | Proposals 5B.2 |
| 12 | **Implement cost-tracker hook** (SubagentStop event) | 2h | Cost visibility for all workflows | Proposals 1.1 |

### Priority 3: Medium-Term (Month 1) -- Structural

| # | Action | Effort | Impact | Source |
|---|--------|--------|--------|--------|
| 13 | **Git worktree isolation** for parallel stories in execute-epic | 3h | Eliminates file conflicts | Proposals 4A.1 |
| 14 | **Parallel expand+validate** within waves in execute-epic | 2h | 3x throughput per wave | Proposals 4B.3 |
| 15 | **Progressive autonomy gate** in execute-epic | 3h | 60% fewer human interruptions | Proposals 4A.2 |
| 16 | **Context compression** every 3 stories in execute-epic | 2h | 80% context reduction for long epics | Proposals 4A.3 |
| 17 | **Source quality feedback loop** in tech-research MEMORY.md | 2h | Compound source quality improvement | Proposals 3A.1 |
| 18 | **Adaptive sub-query count** in tech-research (3-9 based on breadth) | 2h | 40% token savings on narrow queries | Proposals 3B.3 |
| 19 | **Add compaction rules** to CLAUDE.md | 30min | Preserves critical context during auto-compaction | CLAUDE.md Patterns 10.3 |

### Priority 4: Long-Term (Quarter) -- Optimization

| # | Action | Effort | Impact | Source |
|---|--------|--------|--------|--------|
| 20 | **Implement /parallel-review skill** (Team Template 1) | 4h | Multi-perspective PR review | Blueprint 3.2 |
| 21 | **Create compound-metrics skill** | 3h | Track learning effectiveness over time | Blueprint 4.2 |
| 22 | **Implement cross-agent knowledge sharing** via _shared-discoveries/ | 2h | Inter-agent learning | Blueprint 4.3 |
| 23 | **Create /evolve skill** for instinct extraction (ECC-inspired) | 6h | Automated pattern extraction | Blueprint 4.4 |
| 24 | **Evaluate plugin distribution** for MMOS skills | 4h | Portability, community sharing | Gap Analysis 3.1-3.5 |
| 25 | **Add multi-agent observability dashboard** | 4h | Real-time monitoring of team workflows | Gap Analysis 5.3 |

### Total Estimated Effort

| Priority | Items | Effort | Expected Impact |
|----------|-------|--------|-----------------|
| P1 (This week) | 5 | 8.5h | 40-60% cost reduction, compound learning start |
| P2 (2 weeks) | 7 | 13h | Quality improvement, cost visibility, faster workflows |
| P3 (Month 1) | 7 | 14.5h | Structural improvements, conflict elimination |
| P4 (Quarter) | 6 | 23h | Advanced optimization, observability, community |
| **Total** | **25** | **~59h** | **40-60% cost reduction, 25-35% speed improvement, compound learning** |

---

## Key Numbers to Remember

| Metric | Value | Source |
|--------|-------|--------|
| CLAUDE.md recommended max | 300 lines (ideal: 60) | CLAUDE.md Patterns |
| MMOS current CLAUDE.md | 461 lines | CLAUDE.md Patterns 11.1 |
| MEMORY.md auto-load limit | First 200 lines only | Blueprint 1.1 |
| Skill activation (generic desc) | ~20% | CLAUDE.md Patterns 6.3 |
| Skill activation (specific + examples) | 72-90% | CLAUDE.md Patterns 6.3 |
| Cost reduction from model routing | 40-60% (up to 86%) | Proposals 1.2, CLAUDE.md 5.3 |
| Agent teams token multiplier | ~7x solo | Gap Analysis 4.1 |
| Sandbox permission prompt reduction | 84% | Gap Analysis 8.1 |
| MCP Tool Search token reduction | 46.9% | Gap Analysis 7.2 |
| Average dev cost/day | $6 ($100-200/mo) | Gap Analysis 4.1 |
| Max concurrent subagents | 10 | Blueprint Appendix B |
| Hook events (total) | 14 | Gap Analysis 2.1 |
| Total improvement proposals | 28 (12 ADD, 11 CHANGE, 5 REMOVE) | Proposals Summary |

---

*Wave 3 Synthesis -- 2026-02-09*
*Synthesized from: wave3-architecture-blueprint.md, wave3-claude-md-patterns.md, wave3-gap-analysis.md, wave3-improvement-proposals.md*
