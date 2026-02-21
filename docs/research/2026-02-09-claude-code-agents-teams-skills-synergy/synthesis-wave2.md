# Wave 2 Synthesis - Ecosystem & Patterns

> Synthesized from 7 Wave 2 research files covering the Claude Code ecosystem as of February 2026.
> Total sources across all files: 100+ unique URLs, 80+ pages deep-read.

---

## Key Findings by Topic

### Agent SDK & Headless Mode

The Claude Agent SDK (renamed from "Claude Code SDK") provides the same tools, agent loop, and context management that power Claude Code, exposed as Python and TypeScript libraries. The fundamental abstraction is `query()` -- an async generator that handles the entire tool execution loop autonomously, unlike the Client SDK where you implement the loop yourself.

**Critical capabilities:**
- **14 hook events** provide deterministic lifecycle control (PreToolUse, PostToolUse, SessionStart/End, SubagentStart/Stop, Stop, PreCompact, etc.), with three hook types: command (shell), prompt (single-turn LLM), and agent (multi-turn with tools)
- **`--agent` flag** (v2.0.59+) transforms the main Claude Code session into a specialized agent without spawning sub-agents -- distinct from the Task tool which spawns independent sub-agents
- **Programmatic subagent definitions** via the `agents` option, with model routing (`sonnet`/`opus`/`haiku`/`inherit`), tool sandboxing, and permission modes
- **Structured outputs** via `outputFormat` with JSON Schema enforcement, enabling deterministic downstream processing
- **Session management** with resume, fork, and file checkpointing (`rewindFiles()` for undoing agent actions)
- **Cost controls**: `maxBudgetUsd`, `maxTurns`, model fallbacks, and OpenTelemetry monitoring (7 metrics + 5 event types)

**Production deployment**: Anthropic uses the SDK internally for deep research, video creation, note-taking, and major agent loops. Apple Xcode 26.3 integrates natively. GitHub Actions integration via `anthropics/claude-code-action@v1` supports @claude mentions in PRs with enterprise auth (Bedrock/Vertex OIDC).

**Key insight for MMOS**: The SDK's `settingSources` defaults to empty -- it does NOT load CLAUDE.md or settings.json unless explicitly set to `['project']`. This matters for any programmatic agent orchestration. Also, `PermissionRequest` hooks do not fire in headless mode (`-p`); use `PreToolUse` hooks instead.

### Community Cases (Extended)

The Claude Code ecosystem has matured into a layered market with clear tiers of sophistication:

**Tier 1 -- Official Anthropic:**
- `anthropics/skills` repo (66.5k stars): 16 official skills including skill-creator meta-skill, document processing (docx/pdf/pptx/xlsx), algorithmic art, webapp testing
- Internal teams: Growth Marketing generates hundreds of ads in minutes; Security uses TDD-first; Data Scientists build React apps without TypeScript knowledge; K8s incident response from screenshot to remediation

**Tier 2 -- Major Community Frameworks:**
- **obra/superpowers** (Anthropic marketplace-accepted): 12+ skills, 7-step TDD methodology, autonomous multi-hour sessions, `/brainstorm` -> `/write-plan` -> `/go` workflow
- **wshobson/agents**: Largest collection -- 112 agents, 146 skills, 79 tools, 73 plugins across 4 model tiers (Opus/Sonnet/Haiku)
- **everything-claude-code** (42.9k stars): 13 agents, 30+ commands, 28+ skills, instinct-based continuous learning with confidence scoring, 4-layer architecture (User -> Intelligence -> Automation -> Learning)
- **eddiemessiah/config-claude-code**: Hackathon winner, 9 agents, 10 commands, battle-tested context management ("200K shrinks to ~70K with excessive MCPs")
- **ChrisWiles/claude-code-showcase**: JIRA-to-PR pipeline, skill evaluation hooks, scheduled agent workflows (monthly docs sync, weekly quality reviews)

**Tier 3 -- Orchestration Platforms:**
- claude-flow (60+ agents, 87 MCP tools, self-learning router SONA), oh-my-claudecode (7 execution modes, 28 agents, SQLite swarm coordination), claude-squad (5.8k stars, Git worktree isolation, tool-agnostic)

**Tier 4 -- Marketplaces:**
- SkillsMP: 160,000+ agent skills
- skills.sh (Vercel): 339+ skills, `npx skills add` CLI, leaderboard
- VoltAgent/awesome-agent-skills: 300+ from official partners (Anthropic, Google Labs, Vercel, Stripe, Cloudflare, Trail of Bits)
- ComposioHQ: 500+ app integrations as skills (CRM, PM, email, social, e-commerce, DevOps)

**Key community insight**: "A well-configured project ships features 5-10x faster than vanilla Claude Code." Context window management is the primary constraint -- 80 active tools maximum is the recommended ceiling.

### Compound Learning

This is the most intellectually rich area of the research. Three distinct approaches to cross-session knowledge accumulation have emerged:

**1. Claudeception (blader)**: Uses a `UserPromptSubmit` hook to inject learning-evaluation on every prompt. Six-step extraction process with quality gates (reusability, non-triviality, specificity, verification). Skills evolve through creation -> refinement -> deprecation -> archival stages. Inspired by Voyager (skill libraries, 2023), Reflexion (verbal self-reflection, 2023), CASCADE (meta-skills, 2024).

**2. Everything-Claude-Code Instinct System (v2)**: PreToolUse/PostToolUse hooks capture every tool call to `observations.jsonl`. Background Haiku observer extracts atomic "instincts" with confidence scoring (0.3-0.9). `/evolve` command clusters instincts into skills/commands/agents. Key advantage over Claudeception: 100% deterministic capture via hooks vs. probabilistic skill activation.

**3. Continuous-Claude-v3 (parcadei)**: 109 skills, 32 agents, PostgreSQL+pgvector storage. Daemon-based extraction from *thinking blocks* (internal reasoning), not just visible conversation. "Compound, don't compact" philosophy: extract learnings to persistent storage before context fills, start fresh session with only relevant learnings loaded.

**Claude Code's native memory operates in three layers:**
1. **Session Memory** (automatic): Captures at ~10K tokens, updates every ~5K tokens. Stored in `~/.claude/projects/<hash>/<session-id>/session-memory/summary.md`
2. **Auto Memory** (Claude-curated): MEMORY.md + topic files. First 200 lines loaded at session start
3. **CLAUDE.md** (human-curated): Full content loaded at session start

**Academic foundations:**
- Voyager (2023): Persistent skill libraries in Minecraft, 3.3x more unique items
- Reflexion (2023): Verbal self-reflection, 91% pass@1 on HumanEval
- CASCADE (2024): Meta-skills ("skills for acquiring skills"), 93.3% success rate
- MemRL (2026): Q-value episodic memory, frozen LLM + plastic memory (resolves stability-plasticity dilemma)
- MemEvolve (2025): Meta-evolution of memory systems, up to 17% improvement

**Critical finding**: As of February 2026, Claude Code is the only major AI coding tool with a native, built-in cross-session memory system. Cursor and Codex rely on user-maintained configuration files only.

### Everything Claude Code

The most comprehensive public configuration repository (42.9k stars, 10+ months of daily production use). Its four-layer architecture is the most instructive pattern:

```
Layer 4: LEARNING    -- continuous-learning v1 (Stop hook) + v2 (instinct-based)
Layer 3: AUTOMATION  -- hooks.json (7 event types), session lifecycle, quality gates
Layer 2: INTELLIGENCE -- 13 agents (bounded tools), 28+ skills (domain knowledge)
Layer 1: USER-FACING  -- 30+ commands, rules, contexts (mode switching)
```

**Most transferable innovations:**
1. **Instinct-based learning**: Atomic behaviors with confidence (0.3-0.9), tracked per observation, exportable/importable between users. Observer runs on Haiku (cheap), not Opus
2. **Contexts (mode switching)**: `dev.md`, `research.md`, `review.md` as lightweight behavioral presets -- lighter than full agent switching, heavier than nothing
3. **Strategic compaction**: Hook tracks tool calls, suggests `/compact` at 50 calls then every 25 -- "hook says WHEN, user decides IF"
4. **Sequential orchestration with handoff documents**: `/orchestrate` chains agents (planner -> tdd-guide -> code-reviewer -> security-reviewer), each passing structured handoff
5. **Verification loop**: 6-phase (build, type, lint, test, security, diff) producing READY/NOT READY verdict

**Architecture lesson**: Hooks are deterministic (fire every time); skills are probabilistic (fire ~50-80% based on Claude's judgment). Use hooks for anything that MUST happen, skills for domain knowledge that should be available.

### Official Skills Ecosystem

The Agent Skills open standard (agentskills.io, published Dec 18, 2025) has achieved remarkable adoption in 2 months:

**Specification**: Deliberately tiny -- SKILL.md with YAML frontmatter (name + description required). Progressive disclosure in 3 levels: metadata (~100 tokens, always loaded), instructions (<5k tokens, on activation), resources (on demand). This enables 100 skills at only 10,000 tokens baseline cost.

**Cross-platform adoption**: Claude Code, Claude.ai, Claude API, Claude Agent SDK, OpenAI Codex CLI, ChatGPT (built-in `/home/oai/skills`), Cursor, GitHub Copilot, Gemini CLI, Goose, Windsurf, Roo Code -- all within 2 months of publication.

**Distribution stack:**
- Layer 1: Open standard (agentskills.io specification)
- Layer 2: Authoring (SKILL.md + scripts/ + references/ + assets/)
- Layer 3: Packaging (plugin.json wrapping skills + agents + hooks + MCP + LSP)
- Layer 4: Distribution (skills.sh CLI, plugin marketplaces, git-based repos)

**Plugin system**: Plugins wrap skills for distribution. Git-based with SHA pinning. `${CLAUDE_PLUGIN_ROOT}` for path resolution. Enterprise lockdown via `strictKnownMarketplaces` in managed settings. Plugins are COPIED to cache on install (symlinks followed, external paths not).

**New: LSP integration**: Plugins can provide Language Server Protocol servers (pyright-lsp, typescript-lsp, rust-lsp), giving agents IDE-level code intelligence.

**Best practices from Anthropic**:
- "Claude is already very smart" -- only add what it does not know
- "Context window is a public good" -- every token competes with conversation history
- Match specificity to fragility: narrow bridge (exact scripts) vs. open field (general direction)
- Test with all target models (what works for Opus may need more detail for Haiku)
- Use evaluation-driven development: run without skill first, identify gaps, build minimal instructions

### Swarm Tools

Four third-party multi-agent orchestration tools were analyzed, each with a distinct philosophy:

**claude-flow** (TypeScript, MCP-native): 64 agents, 87 MCP tools, queen-led swarm topologies, 3-tier model routing (WASM <1ms / Haiku ~500ms / Opus 2-5s), self-learning SONA router. Over-engineered (Byzantine fault tolerance for coding agents is overkill), unverified claims (84.8% SWE-Bench), but the 3-tier routing and namespaced memory patterns are genuinely reusable.

**oh-my-claudecode** (Claude Code plugin, zero infrastructure): 7 execution modes (autopilot, ultrapilot, ultrawork, swarm, pipeline, ecomode, ralph), 28 agents, 37 skills, 31 hooks. Works INSIDE Claude Code, not outside it. Key innovations: SQLite-based atomic task claiming for swarm mode, file-ownership partitioning for parallel work, magic keyword detection for implicit mode activation, LSP/AST tools for IDE-level agent intelligence.

**claude-squad** (Go TUI, 5.8k stars, most mature): Manages N independent AI agent sessions (not just Claude -- also Aider, Codex, OpenCode, Amp, Gemini CLI) in isolated tmux sessions with Git worktree per agent. No inter-agent coordination -- just parallel isolation. Simplest mental model, battle-tested, tool-agnostic. Best for "run N agents on N tasks."

**ccswarm** (Rust, early stage): Channel-based orchestration (no shared state, actor model), type-state pattern for compile-time state validation, native PTY session management. Architecturally elegant but incomplete -- core orchestrator loop not wired, AI execution is simulated.

**Anti-patterns identified:**
1. Over-engineering consensus (Byzantine fault tolerance unnecessary for coding)
2. Too many agent types (4-8 well-defined roles sufficient, not 64)
3. Marketing-driven features (vector databases and neural networks are buzzwords for agent coordination)
4. Ignoring Git integration (any multi-agent code modification needs worktrees or file ownership)
5. External dependencies (native solutions > tmux/Docker/external DBs)

### Workflow Improvement Patterns

Industry-standard patterns from LangGraph, Google ADK, CrewAI, AutoGen, and Anthropic's own guidance:

**1. DAG-based orchestration**: Nodes = agents/tasks, edges = conditional predicates on global state. Google ADK defines 8 essential patterns: Sequential Pipeline, Coordinator/Dispatcher, Parallel Fan-Out/Gather, Hierarchical Decomposition, Generator-Critic, Iterative Refinement, Human-in-the-Loop, Composite.

**2. Generator-Critic loops** (industry standard quality gate): Generator produces, Critic evaluates, bounded to 1-2 refinement iterations. Not infinite loops, not single-pass. Google ADK wraps both in a LoopAgent with `exit_condition` and `max_iterations`.

**3. Tiered state management** (Google ADK model):
- Working Context (ephemeral, single invocation)
- Session (durable, full workflow event log)
- Memory (persistent, cross-session searchable)
- Artifacts (versioned, large payloads as references)

**4. Model routing by task complexity**: Haiku for classification/routing (1x cost), Sonnet for implementation (5-10x), Opus for reasoning/planning (25-50x). Cuts costs 50-80%.

**5. Prompt caching**: Stable system prefixes save 45-80% cost and 13-31% latency. Dynamic content (timestamps, session IDs) in system prompts kills cache hit rates.

**6. Progressive autonomy**: Replace binary HITL with earned trust levels (L0: full oversight -> L4: full autonomy). Promote based on quality scores, failure rates, cost metrics over consecutive runs.

**7. Scoped handoffs**: Sub-agents receive only task-relevant state, not ancestral history. 50-70% token savings vs. full history pass.

**Production data**: Engineers integrate AI into 60% of work but can fully delegate only 0-20%. Claude Code Teams guidelines: 5-6 tasks per teammate, file ownership prevents overwrites, teammates do NOT inherit lead's conversation history.

---

## Cross-Cutting Patterns

Seven patterns recur across all 7 research files, indicating high-confidence best practices:

### 1. Progressive Disclosure as Universal Design Principle
Skills, memory, context -- everything follows the same pattern: load minimal metadata always, full content on activation, supporting resources on demand. The 100-token-per-skill metadata budget enables massive skill libraries without context window pressure. This applies equally to MEMORY.md (first 200 lines), skill descriptions (name+description only at startup), and agent definitions (loaded only when invoked).

### 2. Hooks as the Reliable Backbone, Skills as the Knowledge Layer
Hooks fire deterministically (100% of the time for the configured event); skills fire probabilistically (~50-80% based on Claude's semantic matching). This means:
- Quality gates, state persistence, and observation capture -> hooks
- Domain knowledge, workflow instructions, and procedural expertise -> skills
- The learning layer (Claudeception, ECC v2) correctly uses hooks for capture and skills for codified knowledge

### 3. Three-Tier Model Routing
Every sophisticated implementation routes by task complexity:
- Tier 1 (Haiku/WASM): Simple classification, routing, exploration, background observation
- Tier 2 (Sonnet): Standard implementation, writing, analysis
- Tier 3 (Opus): Architecture decisions, complex reasoning, synthesis of conflicting sources

This cuts costs 50-80% with minimal quality loss when tiers are correctly assigned.

### 4. Structured Handoff Documents as Agent Interface
Agents communicate most reliably through structured files, not conversation history. The handoff pattern appears in:
- ECC's `/orchestrate` (structured markdown between sequential agents)
- MMOS's Context Parity (state.json between agent sessions)
- Google ADK's scoped handoffs (only task-relevant state passed to sub-agents)
- claude-squad's Git worktree branches (code as the handoff medium)

### 5. Bounded Iteration with Escalation
Every quality loop is bounded: 1-2 refinement iterations maximum, then escalate. This prevents token explosion and runaway costs. The pattern appears in Generator-Critic loops, TDD cycles (RED-GREEN-REFACTOR with max retries), and research wave gating (stop at coverage threshold or max waves).

### 6. File-Level Isolation for Parallel Work
Three approaches to preventing conflicts when multiple agents modify code:
- Git worktrees (claude-squad, ccswarm): Strongest isolation, highest overhead
- File-ownership partitioning (oh-my-claudecode Ultrapilot): Medium isolation, low overhead
- Scoped state keys (Google ADK ParallelAgent): Minimal isolation, zero overhead
All three are valid; choose based on the level of code modification required.

### 7. Memory as Compound Interest
Knowledge capture has a fixed cost (5-10 min per session) but compounding benefit. Session 1: 100 units base. Session 20: 2+ hours saved. The "compound, don't compact" philosophy produces strictly better outcomes than lossy compression because knowledge is never lost to compaction artifacts. Claude Code is uniquely positioned here with its 3-layer native memory.

---

## Gaps Identified

### Technical Gaps

1. **No benchmark for compound learning effectiveness**: All evidence is anecdotal ("2h to 5min to 2min"). No standardized benchmark exists for measuring how cross-session memory improves coding agent productivity. Academic benchmarks (Voyager in Minecraft, CASCADE in chemistry) do not transfer to coding contexts.

2. **Agent-specific persistent memory is experimental**: GitHub Issue #4588 was closed as duplicate. The prototype works but depends on agents faithfully following memory-update instructions, which is unreliable. Native Claude Code support for per-agent memory (beyond MEMORY.md shared by all) does not exist.

3. **Multi-agent real-time knowledge sharing unsolved**: No system handles the case where Agent A discovers something that Agent B needs to know in the same session. Cross-agent knowledge transfer requires architectural support that does not yet exist in Claude Code.

4. **Python SDK parity gap**: The Python Agent SDK lacks several hook events available in TypeScript (SessionStart/End, Notification, PostToolUseFailure, SubagentStart). This limits server-side/CI deployments using Python.

5. **Skill composition standard missing**: No specification for one skill depending on or importing from another. Each must be self-contained. This creates deliberate duplication but prevents cross-skill dependency fragility.

6. **Security scanning for skills**: No automated security review for published skills. skills.sh has no quality gates. Community skills are installed on trust.

### Knowledge Gaps

7. **Token cost data for multi-agent setups**: No public benchmarks comparing token consumption for Claude Code Teams vs. sequential single-agent execution at scale. Need to instrument and measure.

8. **Optimal memory decay rates unknown**: The 7-day/30-day half-life memory decay system is proposed (dev.to article) but not validated against real usage patterns.

9. **Enterprise skill governance patterns**: Limited documentation on how large orgs audit and approve skills at scale beyond `strictKnownMarketplaces`.

10. **Claude Code Teams + SDK integration**: How Agent Teams (experimental) interact with SDK-defined agents needs more documentation. No tool benchmarks agents against native Teams.

---

## Actionable Items for MMOS

### P0 -- Immediate (This Week)

1. **Implement strategic compaction hook**: Port ECC's `suggest-compact.js` pattern. Track tool calls, suggest `/compact` at 50 calls then every 25. Minimal code, high impact on long sessions. File: `.claude/settings.json` or `.claude/settings.local.json`.

2. **Add model tier routing to agent wrappers**: Ensure MMOS agents use appropriate model tiers. Exploration/search agents -> Haiku. Implementation agents -> Sonnet. Architecture/synthesis agents -> Opus. Update `.claude/agents/mmos-*.md` frontmatter where `model:` is missing or wrong.

3. **Adopt structured handoff documents**: Standardize the handoff format between MMOS agent phases (Victoria -> Tim -> Daniel -> Barbara). Include: context, findings, modified files, open questions, recommendations. Based on ECC's `/orchestrate` pattern.

### P1 -- Short Term (This Sprint)

4. **Install Claudeception as project-level skill**: Add to `.claude/skills/claudeception/` with UserPromptSubmit hook. Expected outcome: 10-20 extractable skills per month from normal MMOS work. Evaluate after 2 weeks against quality gates (reusability, non-triviality, specificity).

5. **Define memory budgets for MEMORY.md**: Architecture: 25 lines, Decisions: 25, Patterns: 25, Gotchas: 20, Progress: 30 (7-day decay). Run deduplication when exceeding 80 entries. Monthly `/remember` workflow.

6. **Add Generator-Critic loops to squad pipelines**: After each agent phase (e.g., Copy Squad enrichment), add a validation step with structured pass/fail + specific feedback. Bound to 2 iterations max. Escalate to human on third failure.

7. **Implement file-ownership partitioning for parallel work**: When executing epic stories in parallel, assign file ownership per agent to prevent conflicts. Based on oh-my-claudecode's Ultrapilot pattern.

### P2 -- Medium Term (Next 2-4 Weeks)

8. **Build contexts for MMOS modes**: Create `contexts/mmos-research.md`, `contexts/mmos-extraction.md`, `contexts/mmos-enrichment.md` as lightweight behavioral presets. Lighter than full agent switching, adjusts priorities and tool preferences.

9. **Implement session persistence hooks**: SessionStart/SessionEnd hooks that auto-save and auto-load MMOS context. Standardize state.json format across all MMOS agents. Port ECC's session management pattern to work with Context Parity.

10. **Evaluate instinct-based learning (ECC v2)**: Pilot the observation -> instinct -> evolve pipeline for one squad (copy-squad recommended). Use PreToolUse/PostToolUse hooks for 100% deterministic capture. Background Haiku observer for cheap pattern detection. Measure confidence score distribution after 50 sessions.

### P3 -- Long Term (Architecture Evolution)

11. **DAG-based workflow engine for skills**: Replace sequential agent chains with a lightweight DAG executor. Nodes = agents/tasks, edges = conditional predicates on state. Enables parallel execution within waves, conditional branching, and checkpoint/resume natively. Based on Google ADK + LangGraph patterns.

12. **Tiered state architecture**: Implement 4-layer separation: working context (ephemeral) / session (durable event log) / memory (cross-session MEMORY.md + topic files) / artifacts (versioned outputs in `outputs/`). Currently MMOS conflates session and memory layers.

13. **Progressive autonomy tracking**: Log quality scores per skill per run. After N successful consecutive runs, auto-reduce approval gates. Build tracking infrastructure for promotion criteria (quality threshold, zero critical failures, cost within budget).

14. **Cross-skill learning via shared memory**: When deep-researcher discovers a pattern relevant to copy-squad, propagate via shared memory layer (MEMORY.md topic files). Memory becomes the coordination mechanism across skills, not just within them.

---

*Synthesis date: 2026-02-09*
*Source files: 7 Wave 2 research documents, 100+ unique URLs, 80+ pages deep-read*
