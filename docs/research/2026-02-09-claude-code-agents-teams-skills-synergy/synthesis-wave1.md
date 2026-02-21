# Wave 1 Synthesis - Core Primitives

**Date:** 2026-02-09
**Sources synthesized:** 6 research files, 100+ unique sources, 60+ pages deep-read
**Scope:** Skills, Agent Memory, Teams/Swarms, Integration Patterns, Agents Architecture, Community Cases

---

## Key Findings by Topic

### Skills

1. **Skills are prompt-injection meta-tools, not executable functions.** They inject structured instructions into Claude's conversation context. The Skill tool is a single entry in Claude's tools array that manages all individual skills via a dynamic prompt generator.

2. **Progressive disclosure is the core architecture.** Three levels: L1 metadata (~100 tokens, always loaded at startup), L2 instructions (<5K tokens, loaded when triggered), L3 resources (unlimited, loaded on demand). Total skill descriptions are constrained to ~2% of context window (~15,000 chars).

3. **Dynamic injection enables powerful parameterization.** Five mechanisms: `$ARGUMENTS`/`$N` (string substitution), `!`command`` (shell preprocessing before Claude sees content), `@file` (content injection), `ultrathink` (extended thinking), `${CLAUDE_SESSION_ID}` (session tracking).

4. **`context: fork` turns a skill into a sub-agent constructor.** The skill content becomes the subagent's task prompt. Combined with `agent:` field, this enables skill-to-agent binding where the skill controls which specialist executes it.

5. **Skill-scoped hooks (v2.1+) enable portable governance.** PreToolUse, PostToolUse, and Stop hooks defined in skill frontmatter only run while that skill is active. This allows skills to carry their own quality gates.

6. **Skills follow the open Agent Skills standard (agentskills.io).** Adopted by OpenAI Codex CLI, ChatGPT, Cursor, Gemini CLI, and others. This makes skills cross-platform portable.

7. **Discovery reliability is a known problem.** Research shows skills were never invoked in 56% of test cases. Description quality is the critical factor for triggering -- descriptions must be comprehensive, third-person, and include specific trigger terms.

8. **Plugin/marketplace system enables distribution.** 160K+ skills in the broader ecosystem. Official anthropics/skills repo (66.5K stars), VoltAgent collection (339+), plus community registries at claude-plugins.dev and skillsmp.com.

### Agent Memory

1. **5-layer memory hierarchy plus session memory.** Managed Policy > Project CLAUDE.md > Project Rules > User CLAUDE.md > Project Local CLAUDE.md > Auto Memory. Session Memory operates as a separate background system.

2. **Agent persistent memory (`memory:` frontmatter) shipped in v2.1.33 (2026-02-06).** Three scopes: `user` (~/.claude/agent-memory/), `project` (.claude/agent-memory/), `local` (.claude/agent-memory-local/). First 200 lines of MEMORY.md are auto-injected into the agent's system prompt.

3. **Session Memory is automatic and continuous.** Triggers after ~10K tokens, updates every ~5K tokens or 3 tool calls. Summaries are injected at session start as reference material (not instructions). Enables instant `/compact` since summaries are pre-written.

4. **Compound learning is real and documented.** Debugging time progression: 2h (first encounter) -> 5min (second, with memory) -> 2min (third) -> 0min (preventative). Agent memory accumulates institutional knowledge.

5. **Teams do NOT have persistent memory.** Only subagents support `memory:` frontmatter. Teammates start fresh every time. This is tracked as Issue #24316 (allow custom agents as team teammates).

6. **Community has built workarounds.** BM25-based searchable memory (indexes transcripts in milliseconds), episodic memory (SQLite + vector search), manual agent memory via additional directories before v2.1.33.

7. **Memory Tool (API-level, beta) is a separate system.** Client-side persistent memory for custom agent applications. Six commands: view, create, str_replace, insert, delete, rename. Enables infinite-length workflows when combined with context editing.

### Teams & Swarms

1. **Agent Teams shipped officially with Opus 4.6 (Feb 6, 2026).** Experimental feature behind `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`. Architecture: Team Lead + N Teammates + Shared Task List + Mailbox System.

2. **Seven core primitives.** TeamCreate, TeamDelete, TaskCreate, TaskUpdate, TaskList, TaskGet, SendMessage. Underlying TeammateTool has 13 internal operations discovered via binary analysis.

3. **Six orchestration patterns identified.** Parallel Specialists (most common), Competing Hypotheses (adversarial debate), Cross-Layer Coordination, Sequential Pipeline, Self-Organizing Swarm, Plan-Approve-Execute.

4. **The C compiler case study proves the concept at scale.** 16 parallel agents, ~2,000 sessions, $20K, 100K lines of Rust, 99% GCC torture test pass rate. Key lesson: test quality is paramount for autonomous agents.

5. **No nested teams by design.** Teammates cannot spawn sub-teams. Deliberate design to prevent runaway costs and loss of oversight. Subagents also cannot spawn subagents.

6. **Token economics are significant.** Solo session ~200K tokens, 3 subagents ~440K, 3-person team ~800K, 5-person team ~1.2M. Cost optimization: model mixing (Opus lead + Sonnet teammates), plan-first approach, targeted messages over broadcast.

7. **Third-party frameworks preceded and extend official teams.** claude-flow (60+ agents, MCP-native), oh-my-claudecode (5 execution modes), claude-squad (multi-tool), ccswarm (Rust-native). Each fills different niches.

8. **Quality gates via hooks.** TeammateIdle and TaskCompleted hooks (v2.1.33) enforce quality before task completion. Exit code 2 blocks completion and sends feedback.

### Integration Patterns

1. **Skills cannot directly create teams.** The integration path is indirect: user invokes skill -> skill instructs Claude -> Claude uses TeamCreate/TaskCreate/Task tools. Skills are the entry point, teams are the execution mechanism.

2. **Two directions of skill-agent binding.** Skill -> Agent (via `context: fork` + `agent:`) or Agent -> Skill (via `skills:` field in agent frontmatter injecting full content at startup).

3. **Files are the universal coordination interface.** Between phases, between agents, between sessions -- files are how everything communicates. Task lists are JSON files, agent memory is markdown files, team config is JSON files.

4. **Compound patterns combine all four pillars.** The most powerful setups: Skills define workflows + Agents provide specialization + Memory enables learning + Teams enable parallelism. Concrete example: `/full-review` skill -> spawns 3 agents with `memory: project` -> parallel work -> each updates MEMORY.md -> lead synthesizes -> CLAUDE.md updated.

5. **Hooks provide deterministic quality enforcement.** 14 lifecycle events from SessionStart to SessionEnd. Three hook types: command (shell scripts), prompt (LLM evaluation), agent (multi-turn verification). Hooks enforce; they don't suggest.

6. **Recursive spawning is intentionally blocked.** No subagent-spawns-subagent, no teammate-spawns-team. Workarounds: chain from main conversation, sequential team phases, SDK orchestration.

7. **Claude Agent SDK enables programmatic orchestration.** Same primitives as CLI (tools, hooks, subagents, MCP, sessions, skills) available in Python/TypeScript. Enables CI/CD, production automation, and cross-vendor agent composition.

8. **Google's 8 multi-agent patterns map cleanly to Claude Code.** Sequential Pipeline = Skill chain, Coordinator/Dispatcher = Team lead, Parallel Fan-Out = Teams, Generator/Critic = PostToolUse hooks, Human-in-the-Loop = Plan approval mode, etc.

### Agents Architecture

1. **Agents are isolated AI instances with independent context.** Each has its own context window, system prompt (markdown body), tool restrictions, permissions, and optional persistent memory. Defined via Markdown + YAML frontmatter.

2. **Six built-in agent types.** Explore (Haiku, read-only), Plan (inherit, read-only), general-purpose (inherit, full tools), Bash, Claude Code Guide (Haiku), statusline-setup (Sonnet).

3. **11 frontmatter fields for complete configuration.** name, description, tools, disallowedTools, model, permissionMode, maxTurns, skills, mcpServers, hooks, memory. All optional except name and description.

4. **Six permission modes.** default, acceptEdits, dontAsk, delegate, bypassPermissions, plan. `delegate` mode restricts lead to coordination-only tools. `bypassPermissions` cannot be overridden by subagents.

5. **`--agent` vs `--agents` serve different purposes.** `--agent` runs the entire session AS a specific agent (main thread specialist). `--agents` defines subagents available for delegation (parallel workers).

6. **Up to 10 concurrent subagents in parallel.** Foreground subagents block the main conversation with permission pass-through. Background subagents run concurrently with pre-approved permissions.

7. **Restricting spawnable agents is possible.** `tools: Task(worker, researcher)` is an allowlist -- only named agents can be spawned. Disabling via `deny: ["Task(Explore)"]`.

8. **Community has built massive agent collections.** wshobson/agents (24.1K stars, 112 agents, 146 skills), vizra-ai (59 agents), VoltAgent (100+ subagents). Three-tier model strategy: Opus for critical, Sonnet for balanced, Haiku for fast operations.

### Community Cases

1. **Production adoption is real.** Rakuten (79% reduction in time-to-market), TELUS ($90M+ business benefit, 500K+ hours saved), Hugging Face/Sionic AI (1,000+ ML experiments/day via skills), Anthropic internally (multiple departments).

2. **Boris Cherny's workflow surprised the community.** 5 local + 5-10 web sessions in parallel, spec-based workflow, Opus 4.5 with thinking for everything. #1 tip: verification loops improve quality 2-3x. ~100 PRs/week.

3. **Simon Willison predicts skills will cause "a Cambrian explosion" bigger than MCP.** Token efficiency (dozens vs tens of thousands), simplicity (markdown vs full protocol), cross-platform portability.

4. **Skill-creator meta-skill establishes the canonical pattern.** SKILL.md + scripts/ + references/ + assets/, progressive disclosure, "concise is key" philosophy. 6-step creation process: understand -> plan -> init -> edit -> package -> iterate.

5. **Best CLAUDE.md practices converge.** Keep under 300 lines (HumanLayer), ~150-200 instruction limit, document actual mistakes not theoretical guidelines (Boris Cherny), skip style guidelines (use linters instead), craft manually (don't use /init).

6. **Multi-agent ecosystem is maturing.** Official teams + 8+ community frameworks (claude-flow, oh-my-claudecode, Claude Colony, Orcha, Vibe-Claude, Gas Town, Multiclaude, CC Mirror). Everything from tmux-based visual to Rust-native performance.

7. **GitHub Actions integration (claude-code-action) enables CI/CD.** Trigger on @claude mention in PR/issue, automatic code review, implementation, PR creation. Reads CLAUDE.md for project standards.

---

## Cross-Cutting Patterns

These insights appear consistently across multiple research files:

### 1. Progressive Disclosure is the Universal Architecture

Skills, memory, agents, and CLAUDE.md all follow the same pattern: minimal metadata always loaded, full content on demand, detailed resources only when needed. This is not just a skill pattern -- it's the core design philosophy of the entire system.

- Skills: metadata ~100 tokens -> SKILL.md <5K -> resources unlimited
- Memory: MEMORY.md first 200 lines -> topic files on demand
- CLAUDE.md: parent dirs at launch -> child dirs on demand
- Agents: description for delegation -> full prompt on spawn

### 2. Files as the Universal Interface

Every primitive communicates via the filesystem:

- Teams: task lists as JSON files, config as JSON
- Memory: MEMORY.md and topic files in directories
- Skills: SKILL.md and bundled resources
- Agents: markdown files with YAML frontmatter
- Coordination: git repos, lock files, shared directories

No database, no message queue, no shared memory space. Files are the common ground.

### 3. Isolation with Controlled Communication

Every component runs in isolation by default:

- Subagents: separate context window
- Teammates: separate Claude Code instances
- Skills with `context: fork`: isolated execution
- Memory: per-agent directories, no cross-agent sharing

Communication happens through explicit channels: SendMessage for teams, return values for subagents, files for everything else. This prevents context pollution but creates coordination overhead.

### 4. The Plan-Then-Execute Pattern

Consistently recommended across all sources:

- Plan mode (~10K tokens) before team execution (~500K+ tokens)
- Plan approval gates for teammates before implementation
- Spec-based workflow (Boris Cherny): spec -> draft -> simplify -> verify
- Evaluation-driven skill development: test without skill -> identify gaps -> minimal instructions

### 5. Quality Gates are Deterministic, Not Hopeful

Multiple sources emphasize: do not rely on agents "doing the right thing." Instead:

- Hooks enforce via exit codes (2 = block)
- Tests run before task completion (TaskCompleted hook)
- Linters run after edits (PostToolUse hook)
- Plans require explicit approval before implementation
- The C compiler project's #1 lesson: "test quality is paramount"

### 6. Cost Awareness Drives Architecture Decisions

Token economics appear in every research file:

- Model mixing: Opus for strategic, Sonnet for implementation, Haiku for exploration
- Subagents vs teams: 2-4x cost difference for the same work
- Broadcast vs targeted messages: linear cost scaling
- Plan-first saves 10-50x vs mid-execution pivots
- Skills are cheaper than MCP (dozens vs tens of thousands of tokens)

### 7. Compound Learning Over Time

Memory enables a virtuous cycle documented across sources:

- Debugging time drops exponentially with memory accumulation
- Agent specialization emerges from behavioral divergence with persistent memory
- Session memory bridges sessions; agent memory bridges projects
- CLAUDE.md captures team-level institutional knowledge
- Git history provides the ultimate audit trail

---

## Gaps Identified

### Critical Gaps (blocking or significantly limiting)

1. **No persistent memory for teammates.** Subagents support `memory:`, but teammates start fresh every time. This is the single biggest limitation for team-based workflows. Issue #24316 tracks this.

2. **No cross-agent memory sharing.** Each agent's memory directory is isolated. Agent A cannot read Agent B's memory. No shared agent memory pool exists.

3. **Skill discovery is unreliable (56% miss rate).** Skills not being invoked when they should be is a major usability problem. The root cause is LLM-based matching rather than algorithmic routing.

4. **No recursive spawning.** Subagents cannot spawn subagents. Teams cannot spawn sub-teams. While intentional for cost control, this limits complex hierarchical workflows.

5. **Session resumption broken for teams.** `/resume` and `/rewind` don't restore in-process teammates. Teams cannot survive session interruptions.

### Significant Gaps (important but workarounds exist)

6. **No skill-to-skill explicit invocation.** Skills cannot call other skills programmatically. Composition relies on Claude's natural evaluation or sequential user invocation.

7. **Memory quality control is absent.** No mechanism validates what agents write to their memory. Agents may record incorrect patterns that compound over time.

8. **No team memory across sessions.** Teams coordinate via task lists and messages within a session but have no native cross-session learning mechanism.

9. **Hook composition is not supported.** No way to compose hooks from multiple skills/agents into a unified pipeline. Each defines hooks independently.

10. **Memory size and pruning.** Beyond the 200-line MEMORY.md auto-load, no documented limits on memory directories. No automatic pruning mechanism. Agents must self-curate.

### Knowledge Gaps (insufficient documentation)

11. **Performance benchmarks.** No systematic comparison of solo vs subagent vs team performance. No published data on skill loading latency.

12. **Enterprise governance.** Limited documentation on managing Claude Code agents in large organizations with compliance requirements.

13. **Failure mode documentation.** Few documented cases of what goes wrong with multi-agent workflows beyond the C compiler case study.

14. **Hook input schema.** Exact JSON structure passed to hook commands via stdin is not fully documented.

15. **Agent transcript format.** Detailed .jsonl schema for subagent transcripts is undocumented.

---

## Actionable Items for MMOS

### High Priority (address now)

1. **Enable agent persistent memory for MMOS agents.** Add `memory: project` to key MMOS agent wrappers (`.claude/agents/mmos-*.md`). This replaces the manual state.json approach with native support. Project scope ensures team-shared knowledge via VCS.

2. **Add MEMORY.md curation instructions to agent prompts.** Each MMOS agent wrapper should include explicit instructions: "Before starting, read your memory. After completing, save what you learned." The first 200 lines are auto-loaded, so keep the index concise.

3. **Improve skill descriptions for discovery reliability.** Given the 56% miss rate, audit all MMOS skills in `.claude/skills/` and rewrite descriptions to be comprehensive, third-person, and include specific trigger terms. Test each skill's discovery with varied prompts.

4. **Convert team coordination to native Agent Teams.** Replace the current manual Teams approach (spawning with `subagent_type: "general-purpose"` + persona files) with native Agent Teams where applicable. Enable `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in project settings.

5. **Add TaskCompleted hooks for quality gates.** Implement hooks that run tests/lint before a task can be marked complete. This enforces quality deterministically rather than relying on agent compliance.

### Medium Priority (plan for next iteration)

6. **Implement plan-first workflow for team operations.** Before spawning a team, always run a plan phase (~10K tokens) to decompose work, validate the plan, then hand it to the team (~500K+ tokens). This is the most cost-effective compound pattern.

7. **Adopt progressive disclosure in CLAUDE.md.** The current CLAUDE.md is large. Split domain-specific instructions into separate files and use `@path/to/file` imports. Keep the main file under 300 lines with links to details.

8. **Create skill-agent bindings for MMOS pipeline stages.** For each MMOS pipeline stage, create a skill that uses `context: fork` + `agent: mmos-<role>`. This gives each stage a dedicated entry point with the right specialist.

9. **Implement model mixing strategy.** Route strategic decisions through Opus, implementation through Sonnet, and exploration through Haiku. Define this in agent frontmatter `model:` fields based on agent role.

10. **Add SubagentStop hooks for output validation.** When MMOS subagents complete, validate their output structure matches expected schemas before returning results to the main conversation.

### Lower Priority (research and experiment)

11. **Evaluate claude-flow for complex orchestration.** For workflows requiring more than native teams support (60+ agents, self-learning), assess whether claude-flow's MCP-based approach could complement MMOS.

12. **Build cross-agent memory bridge.** Since agents cannot read each other's memory natively, create a shared project file (e.g., `outputs/minds/{slug}/metadata/shared-learnings.md`) that agents write to and read from as a coordination layer.

13. **Explore Agent SDK for CI/CD pipeline.** Evaluate whether the Claude Agent SDK (Python/TypeScript) could automate MMOS pipeline stages in GitHub Actions for batch processing.

14. **Prototype competing hypotheses for debugging.** When MMOS encounters ambiguous problems, spawn multiple agents with different hypotheses and let them disprove each other (adversarial debate pattern).

15. **Audit hook coverage.** Map all 14 lifecycle events to MMOS workflows and identify where deterministic quality gates would prevent recurring issues. Prioritize PreToolUse (block dangerous ops) and PostToolUse (auto-lint/format).

---

## Architecture Decision Summary

Based on Wave 1 research, the recommended MMOS architecture evolution:

```
Current State:
  Skills (SKILL.md) -> Agent Wrappers (.claude/agents/mmos-*.md)
  -> Manual state.json -> squads/mmos/scripts/

Recommended Target State:
  Skills (SKILL.md, improved descriptions)
  -> Agents (with memory: project, hooks, model selection)
  -> Native Agent Teams (for parallel pipeline stages)
  -> Quality Gate Hooks (TaskCompleted, SubagentStop)
  -> Progressive Disclosure (CLAUDE.md < 300 lines + imports)
```

The four primitives (Skills + Agents + Memory + Teams) form a composable system. MMOS should adopt each incrementally: first memory (highest ROI), then improved skills discovery, then native teams, then hooks for quality enforcement.
