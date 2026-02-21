# Wave 4: Competitor Agent System Comparison

> Deep research comparing Claude Code's agent/team/skill system with ALL major competitor tools.
> **Date:** 2026-02-09 | **Sources:** 35+ pages read | **Competitors:** 9 tools analyzed

---

## TL;DR Comparison Matrix

| Feature | Claude Code | Cursor 2.0 | Windsurf | Codex CLI | Copilot | Devin | Aider | Amazon Q | Jules | Augment |
|---------|------------|-------------|----------|-----------|---------|-------|-------|----------|-------|---------|
| **Interface** | CLI + IDE | IDE (VS Code fork) | IDE (VS Code fork) | CLI + IDE ext | IDE (VS Code) | Web + Slack | CLI | IDE (VS Code, JB) | Web + API | IDE (VS Code, JB) |
| **Multi-Agent** | Teams (experimental) | Parallel Agents (8) | Single Cascade flow | Single loop | Planning Agent | Single autonomous | Architect/Editor | 5 specialized agents | Single per task | Remote Agents (10) |
| **Memory** | CLAUDE.md + Session + Auto | Rules only (no native memory) | Workspace memories (auto) | AGENTS.md | Citation-based memory (new) | Knowledge Base + Snapshots | CONVENTIONS.md + repo map | None documented | None documented | Context Engine (semantic) |
| **Skills/Plugins** | Skills + MCP + Hooks | Rules (.mdc) + AGENTS.md | Rules + Workflows | Skills (SKILL.md) + MCP | Agent Skills + Custom Agents | Playbooks + Knowledge | Conventions file | /dev, /test, /doc, /review | API webhooks | MCP + Skills |
| **Open Source** | No | No | No | Yes (Apache-2.0) | No | No | Yes (Apache-2.0) | No | No | No |
| **Sandbox** | App-level + Bash sandbox | "Yolo mode" (binary) | Not documented | OS-level (Seatbelt/Docker) | VM-based (Codespaces) | Full VM (isolated) | None (trusts git) | Cloud-based | Cloud VM | Cloud containers |
| **Cost Model** | Token-based ($8-20/session) | $20/mo subscription | $15/mo subscription | Token-based | $10-39/mo subscription | $500/mo enterprise | Free (OSS) + API costs | Free tier + $19/mo | Free + $19.99-124.99/mo | $20-200/mo credits |
| **SWE-bench** | 80.9% (Opus 4.5) | Depends on model | SWE-1.5 (custom) | GPT-5.2-Codex | Depends on model | Not disclosed | Depends on model | 51% improvement (top) | Gemini 3 Pro | Not disclosed |
| **Background/Async** | No native (workaround: tmux) | Background Agents (VMs) | No | Cloud Codex (async) | Coding Agent (async) | Fully async | No | Async agents | Fully async (cloud VM) | Remote Agents (async) |

---

## 1. Cursor 2.0

### Architecture

Cursor is a VS Code fork rebuilt with AI as a first-class citizen. Since version 2.0 (October 2025), it features a dedicated agent-centric interface where agents, plans, and runs are first-class sidebar objects.

**Agent Loop:** Single ReAct-style loop per agent instance. The agent sees your editor, file tree, terminal output, and can make direct edits.

**Parallel Agents:** Up to 8 agents can run simultaneously on a single prompt, each isolated via git worktrees. Each worktree maintains separate file states, preventing cross-agent file conflicts. Configuration is managed through `.cursor/worktrees.json` with OS-specific setup scripts.

**Background Agents:** Run in isolated Ubuntu VMs with internet access, work on separate branches, and can open PRs. These persist beyond the active IDE session.

### Memory System

Cursor has **no native cross-session memory**. Context resets between conversations. This is its single biggest gap compared to Claude Code.

**Workarounds emerging in community:**
- MCP Knowledge Graph (itseasy21/mcp-knowledge-graph)
- Memory Bank pattern (structured markdown files)
- OpenMemory MCP (shared between Claude + Cursor)

### Skill/Plugin System: Rules

Cursor uses a 4-tier rules system:

| Rule Type | Location | Activation |
|-----------|----------|------------|
| Project Rules | `.cursor/rules/*.md` or `*.mdc` | Glob, always, intelligent, manual |
| User Rules | Cursor Settings | Every chat |
| Team Rules | Dashboard (Team/Enterprise) | All workspace members |
| AGENTS.md | Project root or subdirs | Always (plain markdown) |

`.mdc` files support frontmatter with `description`, `globs`, and `alwaysApply` fields. Precedence: Team > Project > User.

**Key difference from Claude Code:** Cursor rules support glob-based activation (e.g., "apply this rule only when editing `*.tsx` files"), which CLAUDE.md does not. However, Claude Code's hierarchical CLAUDE.md (root, directory-level, child) provides similar scoping via filesystem placement.

### Unique Features Claude Code LACKS

1. **Background Agents in VMs** -- persistent, async agents that survive session end
2. **Best-of-N** -- run the same prompt across multiple models simultaneously
3. **Tab completion** -- predictive multi-line code completion in-editor
4. **Visual diff preview** -- see changes before applying in GUI
5. **Glob-scoped rules** -- rules that activate only for specific file patterns
6. **Plan Mode in Background** -- create plans with one model while building with another
7. **Up to 20 worktrees per workspace** with automatic cleanup

### Features Claude Code HAS That Cursor LACKS

1. **Native cross-session memory** (CLAUDE.md, Session Memory, Auto Memory)
2. **Agent Teams** (multi-agent coordination with dependencies)
3. **Agent SDK** (programmatic Python/TypeScript API for building on top)
4. **Hooks system** (lifecycle events: PreToolUse, PostToolUse, etc.)
5. **Skills with progressive disclosure** (full SKILL.md ecosystem)
6. **MCP integration** (connect to external tools/services)
7. **Granular permission escalation** (vs Cursor's binary "Yolo mode")
8. **200K+ reliable context window** (Cursor's context varies by model)

### Cost Comparison

- **Cursor Pro:** $20/month, 500 premium requests, GPT-5 default
- **Claude Code Pro:** ~$17-20/month subscription, pay-per-token, ~$8-20/active session
- **Cursor Business:** $40/month with admin controls
- **Verdict:** Cursor is significantly cheaper for high-volume usage. Claude Code's per-token model makes it 4-10x more expensive for equivalent work, though its 5.5x token efficiency partially offsets this.

---

## 2. Windsurf (Codeium)

### Architecture

Windsurf is a VS Code fork with Cascade as its signature agentic feature. Cascade provides multi-file reasoning, repository-scale comprehension, and multi-step task execution.

**Cascade Agent:** A single agentic flow (not multi-agent). The flow architecture means Cascade tracks the entire conversation as a coherent stream of actions, pulling commit histories, querying databases, or generating documentation dynamically.

**SWE-1.5:** Windsurf's in-house model claims near Claude 4.5-level performance at 13x the speed.

### Memory System

Windsurf has the most interesting native memory implementation among IDE-based tools:

**Auto-generated Memories:**
- Created automatically during conversations when Cascade identifies useful context
- Stored per-workspace at `~/.codeium/windsurf/memories/`
- Retrieved automatically based on relevance (exact matching algorithm undisclosed)
- **Do NOT consume credits** (free to store and retrieve)
- Workspace-isolated: memories from one workspace are NOT available in another

**Rules System:**
- `global_rules.md` -- applies across all workspaces
- `.windsurf/rules/` -- workspace-level directory with glob/NL descriptions
- System-level rules merge with workspace + global rules
- 12,000 character limit per rule file

### Skill/Plugin System

No formal skill system. Extensibility limited to:
- Rules files (static instructions)
- Workflows (predefined sequences)
- No MCP integration documented
- No hooks system

### Unique Features Claude Code LACKS

1. **Automatic memory generation** that doesn't consume credits (Claude's session memory is automatic but costs tokens)
2. **Predictive tab completion** (Flow feature)
3. **$15/month pricing** for full agentic capabilities
4. **Cross-OS support** (Windows, macOS, Linux equally)

### Features Claude Code HAS That Windsurf LACKS

1. **Multi-agent Teams** (Windsurf is single-agent only)
2. **Skills/plugin system** (no extensibility beyond rules)
3. **Hooks lifecycle** (no event system)
4. **Agent SDK** (no programmatic API)
5. **MCP integration** (no external tool connections)
6. **Background/async execution** (no async agents)
7. **Open protocol for memory** (CLAUDE.md is version-controllable; Windsurf memories are opaque binary)

---

## 3. OpenAI Codex CLI

### Architecture

Codex CLI is a Rust-based terminal agent. Open source (Apache-2.0) on GitHub. Operates via a single-agent ReAct-style loop (`AgentLoop.run()`): Think > Tool Call > Observe > Repeat.

**Agent Loop:** Conservative, lazy-loading approach. Only reads explicitly requested files. Uses shell-centric tools (`cat`, `grep`, `find`, `ls`, `apply_patch`) through a unified command executor, as opposed to Claude Code's purpose-built structured tools.

**Cloud Codex:** Separate product -- cloud-based asynchronous agent that runs tasks in isolated containers. Multiple tasks can run simultaneously (writing features, fixing bugs, running tests).

**Context Management:** Uses compaction to reduce prompt cache misses. When conversation exceeds a token threshold, calls a special Responses API endpoint for a compressed representation.

### Memory System

- **AGENTS.md** -- plain markdown file in project root or subdirectories (equivalent to CLAUDE.md)
- **No auto-memory** or session persistence
- **No memory hierarchy** (just flat AGENTS.md files)
- Supports discovery in parent directories up to repo root

### Skill System (The Closest Competitor to Claude Code Skills)

OpenAI adopted a skill system that is structurally nearly identical to Claude Code's:

| Aspect | Claude Code Skills | Codex Skills |
|--------|-------------------|--------------|
| Entry file | `SKILL.md` | `SKILL.md` |
| Frontmatter | `name`, `description` | `name`, `description` |
| Structure | `references/`, `scripts/` | `references/`, `scripts/`, `assets/` |
| Discovery | `.claude/skills/` hierarchy | `.agents/skills/` hierarchy |
| Activation | Auto + explicit (`/skill-name`) | Auto + explicit (`$skill-name`) |
| Progressive disclosure | Yes (metadata first, full on match) | Yes (metadata first, full on match) |
| UI metadata | None | `agents/openai.yaml` (icon, color, brand) |
| MCP dependency | Via MCP servers in settings | Declared in `openai.yaml` |
| Installer | Manual | `$skill-installer` built-in |
| System-level | `~/.claude/skills/` | `$HOME/.agents/skills/`, `/etc/codex/skills/` |
| Disable mechanism | Not documented | `~/.codex/config.toml` |

**Key insight:** OpenAI explicitly adopted the Claude Code skill pattern (Simon Willison documented this in his newsletter). The main differences: Codex adds a visual identity layer (icons, brand colors) via `openai.yaml`, has a built-in skill installer, and supports admin/system-level skills at `/etc/codex/skills/`.

### Sandboxing (Unique Strength)

Codex has the strongest sandboxing model of any CLI agent:

- **macOS:** Apple Seatbelt profile restricts filesystem access to project directory, blocks ALL network except OpenAI API
- **Linux:** Docker container with iptables firewall rules
- **Three approval tiers:** Suggest (read-only) > Auto-Edit (edits without approval) > Full Auto (everything)

Claude Code's sandboxing is application-level (input sanitization, whitelisted network destinations) rather than OS-level.

### Unique Features Claude Code LACKS

1. **OS-level sandboxing** (Seatbelt/Docker vs app-level)
2. **Open source** (Apache-2.0, fully inspectable)
3. **Skill installer** (`$skill-installer` for easy skill adoption)
4. **Visual skill identity** (icons, brand colors in YAML)
5. **Cloud async execution** (Codex cloud, containerized)
6. **System-level skills** (`/etc/codex/skills/` for admin-managed)
7. **Responses API compaction** (purpose-built context compression)

### Features Claude Code HAS That Codex LACKS

1. **Multi-agent Teams** (Codex is strictly single-agent)
2. **Hooks system** (no lifecycle events)
3. **Session Memory / Auto Memory** (no cross-session persistence beyond AGENTS.md)
4. **Proactive codebase scanning** (Codex is lazy-loading, must be asked to read)
5. **TodoWrite planning** (no structured planning tool)
6. **WebFetch** (Codex blocks web access by default)
7. **Richer tool surface** (Edit, Glob, Grep vs shell commands)
8. **200K reliable context** (Codex more conservative on context)

---

## 4. GitHub Copilot (Workspace + Agent Mode)

### Architecture

GitHub Copilot has evolved into a multi-surface agent system:

1. **IDE Agent Mode** (VS Code) -- inline agentic coding with planning
2. **Copilot Workspace** -- browser-based agentic environment for multi-step tasks
3. **Copilot CLI** -- terminal agent (enhanced January 2026)
4. **Coding Agent** -- fully async, creates PRs from issues (runs in Codespaces VMs)

**Planning Feature:** Extends Agent Mode for larger multi-step coding tasks. Simple prompts get quick answers; multi-step ones trigger a coordinated plan with progress tracking. The agent runs build commands and self-corrects until builds pass.

**Project Padawan:** Upcoming autonomous agent that handles entire tasks independently (announced, not yet shipped).

### Memory System (New in 2026)

GitHub recently launched a **citation-based memory system** in public preview:

- Stores memories **with citations** (references to specific code locations)
- When an agent encounters a stored memory, it **verifies citations in real-time** against the current branch
- Available across: Coding Agent, CLI, and Code Review
- **Opt-in only** (off by default)
- Cross-agent: memories learned in one surface can be used in others

This is architecturally more sophisticated than Claude Code's text-based CLAUDE.md approach. The citation verification ensures memories don't become stale -- a problem Claude Code's static CLAUDE.md can suffer from.

### Custom Instructions & Agents

- **`.github/copilot-instructions.md`** -- project-level instructions (equivalent to CLAUDE.md)
- **Custom Agents** -- define multiple agents with different expertise (backend, frontend, etc.)
- **Agent Skills** (experimental, VS Code 1.108+) -- custom instructions, scripts, and resources
- **`/init` slash command** -- auto-generates workspace instructions

### Unique Features Claude Code LACKS

1. **Citation-based memory with real-time verification** (memories auto-validate against code)
2. **Cross-surface memory** (IDE, CLI, web, code review share the same memory)
3. **Deep GitHub integration** (issues, PRs, code review, Codespaces native)
4. **Async Coding Agent** (creates PRs from issues without user present)
5. **Organization-level instructions** (Team/Enterprise admin controls)
6. **Project Padawan** (planned: fully autonomous agent)

### Features Claude Code HAS That Copilot LACKS

1. **Agent Teams with dependencies** (Copilot has no formal multi-agent orchestration)
2. **Hooks system** (no lifecycle events)
3. **Full Agent SDK** (Copilot SDK is new and limited)
4. **Mature Skills ecosystem** (Copilot Agent Skills are still experimental)
5. **MCP server integration** (broader tool connectivity)
6. **200K guaranteed context** (Copilot context varies by model/surface)

---

## 5. Devin (Cognition)

### Architecture

Devin is the only tool in this comparison designed as a **fully autonomous software engineer**, not an assistant. It operates in its own isolated environment with command line, browser, and code editor.

**Autonomous Agent:** Plans thousands of steps, debugs its own errors, deploys to production. Can handle "4-8 hour tasks" with verifiable outcomes.

**Infrastructure:** Custom inference stack with superhuman-speed iteration. Runs in isolated sandboxed VMs with full internet access.

**Interactive Planning:** "Game Plan" review before code execution, with two mandatory human checkpoints: Planning and PR Review.

### Memory System (Most Sophisticated)

Devin has the most advanced persistent memory of all competitors:

1. **Knowledge Base** -- collection of tips, documentation, and instructions that persists across ALL sessions. Devin automatically suggests updates based on interactions.
2. **DeepWiki** -- project-specific documentation via `.devin/wiki.json`. Auto-indexes million-line codebases.
3. **Playbooks** -- reusable prompt templates for recurring tasks (equivalent to Claude Code Skills but simpler)
4. **Snapshots** -- full machine state save/restore. Clone a snapshot to start any future run with repos already cloned, environments already set up.
5. **Timeline** -- full replay of every command, file diff, and browser tab. Scrub to any point and restore.
6. **Vectorized Code Snapshots** -- memory layer with vectorized snapshots of the codebase for semantic retrieval

### Performance

- PR merge rate: 34% to 67% year-over-year improvement
- Security vulnerability fixes: 1.5 min vs 30 min (human) -- 20x faster
- Migration projects: 10-14x faster than humans
- Test coverage: lifts from 50-60% to 80-90%

### Unique Features Claude Code LACKS

1. **Full VM isolation** with browser, terminal, and code editor
2. **Snapshot/restore** -- save and restore complete machine state
3. **Timeline scrubbing** -- roll back to any point in history
4. **Persistent Knowledge Base** with auto-suggested updates
5. **DeepWiki** -- auto-generated project documentation
6. **Playbooks** -- reusable task templates
7. **Slack integration** for natural team interaction
8. **Enterprise-grade HITL** with mandatory checkpoints

### Features Claude Code HAS That Devin LACKS

1. **Open CLI** (Devin is web-only, no local terminal access)
2. **Agent SDK** (no programmatic API for building custom agents)
3. **Hooks system** (no lifecycle events)
4. **Local execution** (Devin requires cloud)
5. **Pay-per-token flexibility** (Devin is $500/mo fixed)
6. **Skills ecosystem** (Devin has Playbooks but less structured)
7. **Multi-agent Teams** (Devin is single-agent, parallel via separate sandboxes)
8. **MCP integration** (no external tool protocol)

### Cost

- **$500/month** for enterprise seats
- Expensive but handles 4-8 hour tasks autonomously
- ROI calculation: if Devin replaces 20 hours/month of engineering time, cost-effective

---

## 6. Aider

### Architecture

Aider is the oldest CLI-based AI pair programming tool and arguably proved the concept. Open source (Apache-2.0), model-agnostic, deeply integrated with git.

**Architect/Editor Mode (Key Innovation):** Two-stage LLM pipeline that separates code reasoning from code editing:
- Stage 1: Architect model proposes solution (reasoning-optimized model like o1)
- Stage 2: Editor model translates proposal into specific file edits (editing-optimized model like GPT-4o or Sonnet)

This produced SOTA results on aider's code editing benchmark (85% with o1-preview + DeepSeek/o1-mini).

**Repository Map:** Aider maintains a concise map of the entire git repository, including the most important classes, functions, types, and call signatures. This is its core context management strategy.

### Memory System

Minimal built-in memory:

- **CONVENTIONS.md** -- coding standards file, auto-loaded via `.aider.conf.yml`
- **`.aider.conf.yml`** -- config file (searched in home dir, git root, current dir)
- **No session memory** or auto-memory
- **No cross-session persistence** beyond the conventions file
- **Git history** serves as implicit memory (all changes are committed with attribution)

### Unique Features Claude Code LACKS

1. **Architect/Editor separation** -- pair a reasoning model with an editing model for best of both worlds
2. **Model-agnostic** -- works with any LLM provider (OpenAI, Anthropic, local models, etc.)
3. **Repository map** -- concise structural map of the entire codebase with types and signatures
4. **100% git integration** -- every change auto-committed with proper attribution
5. **Edit format flexibility** -- multiple edit formats (diff, whole, editor-diff, editor-whole)
6. **Community conventions repository** -- shared coding standards per framework/language

### Features Claude Code HAS That Aider LACKS

1. **Multi-agent anything** (no Teams, no parallel agents)
2. **Skills/plugin system** (only CONVENTIONS.md)
3. **Hooks system** (no lifecycle events)
4. **Memory system** (no session memory, no auto-memory, no CLAUDE.md hierarchy)
5. **Agent SDK** (no programmatic API)
6. **MCP integration** (no external tool connections)
7. **Background/async execution** (strictly interactive)
8. **Sandboxing** (trusts git as safety net)
9. **Web access** (no WebFetch or search capabilities)

---

## 7. Amazon Q Developer

### Architecture

Amazon Q Developer provides **5 specialized agents**, each for a specific domain:

1. **Development Agent (`/dev`)** -- natural language to implemented features
2. **Test Agent (`/test`)** -- generates and improves unit tests
3. **Documentation Agent (`/doc`)** -- auto-generates documentation
4. **Review Agent (`/review`)** -- security and quality code reviews
5. **Transform Agent** -- language/framework upgrades (e.g., Java 8 to Java 17)

**Multi-Agent Debug System (Code Transform):** The Transform agent uses a sophisticated 3-agent architecture:
- **Memory Management Agent** -- analyzes last iteration results, maintains inter-iteration memory
- **Critic Agent** -- analyzes progress, detects dead ends, provides rollback recommendations
- **Debugger Agent** -- modifies plans based on memory + critique, executes multi-file solutions

This is the most sophisticated multi-agent architecture in any coding tool, with explicit memory management and dead-end detection.

### Memory System

- **Inter-iteration memory** managed by a dedicated Memory Management Agent
- **Dead-end detection** and automatic rollback
- No documented cross-session persistence
- No user-facing knowledge base

### Unique Features Claude Code LACKS

1. **Specialized agents by domain** (dedicated test, doc, review agents)
2. **3-agent debug system** with memory management, critic, and debugger
3. **Dead-end detection and rollback** -- agent recognizes when a solution path fails
4. **Code transformation** at enterprise scale (Java 8 to 17, etc.)
5. **SWE-bench top scores** (51% improvement over previous version)
6. **Deep AWS integration** (Lambda, CodePipeline, CloudWatch, etc.)
7. **Free tier** (50 agentic chats/month)

### Features Claude Code HAS That Amazon Q LACKS

1. **Agent Teams** (Amazon Q agents don't coordinate with each other except in Transform)
2. **Skills ecosystem** (no extensibility system)
3. **Hooks system** (no lifecycle events)
4. **Agent SDK** (no programmatic API)
5. **Cross-session memory** (no CLAUDE.md equivalent)
6. **MCP integration** (AWS-specific integrations only)
7. **Model flexibility** (locked to Amazon's models)

---

## 8. Google Jules

### Architecture

Jules is an **asynchronous, cloud-native** coding agent. When you start a task, it spins up a temporary Google Cloud VM, clones your repository, does the work, and sends back a pull request.

**Powered by Gemini:** Uses Gemini 2.5 Pro (base tier) or Gemini 3 Pro (Pro/Ultra tiers).

**Task-based model:** Jules is inherently task-oriented, not interactive. You assign a task, Jules plans, you review the plan, Jules executes, you review the PR.

**Jules API:** Alpha-stage API for programmatic access. Can create custom workflows and embed Jules into Slack, Linear, GitHub. This is similar to Claude Code's Agent SDK but earlier-stage.

**Jules Tools:** CLI companion for local interaction.

### Memory System

No documented memory or cross-session persistence. Each task starts fresh from the repository state.

### Pricing (Task-Based)

| Plan | Price | Daily Tasks | Concurrent | Model |
|------|-------|------------|------------|-------|
| Free | $0 | 15 | 3 | Gemini 2.5 Pro |
| Pro | $19.99/mo | 100 | 15 | Gemini 3 Pro |
| Ultra | $124.99/mo | 300 | 60 | Gemini 3 Pro |

**Key insight:** Task-based pricing is fundamentally different from token-based (Claude Code) or subscription (Cursor). You pay per task, not per token or per month. For well-defined tasks, this can be cheaper or more expensive depending on task complexity.

### Unique Features Claude Code LACKS

1. **Cloud VM execution** -- runs in isolated Google Cloud VMs
2. **High concurrency** -- up to 60 concurrent tasks (Ultra)
3. **GitHub-native** -- labels issues with "jules" to trigger tasks
4. **Task-based pricing** -- predictable cost per unit of work
5. **Jules API** -- programmatic task creation for CI/CD integration
6. **No local setup required** -- fully cloud-based

### Features Claude Code HAS That Jules LACKS

1. **Interactive conversation** (Jules is async, not conversational)
2. **Local execution** (Jules requires cloud)
3. **Memory system** (no cross-session persistence)
4. **Skills/plugins** (no extensibility)
5. **Hooks system** (no lifecycle events)
6. **Multi-agent Teams** (single agent per task)
7. **Agent SDK maturity** (Jules API is alpha-stage)

---

## 9. Augment Code

### Architecture

Augment Code is built around a **Context Engine** that is architecturally distinct from all other tools. It creates a persistent semantic index of your entire codebase (400,000+ files) and maintains it with incremental updates.

**High-level flow:** Context Engine > Orchestration Layer > Cloud Workers > VCS connectors.

**Remote Agents:** Cloud-based agents that continue coding after you log off. Up to 10 agents can run in parallel (no inter-agent communication yet -- on roadmap). Each agent runs in its own secure containerized environment with independent workspace isolation.

**Orchestration Layer:** Tags each task with metadata (language, framework, file count, risk profile) and picks the best model family. Groups related PRs across micro-repos for atomic deployment.

### Memory System: Context Engine

Augment's Context Engine is fundamentally different from CLAUDE.md:

- **Semantic indexing** of 400K+ files with dependency analysis
- **Cross-service dependency detection** across multi-repo architectures
- **Incremental re-indexing** after code changes (seconds, not minutes)
- **Persistent understanding** of architectural patterns
- **40% faster code search** than raw text search

This is closer to how a human senior engineer understands a codebase -- through architectural relationships, not just text matching.

### Security (Enterprise-First)

- SOC 2 Type II (July 2024)
- ISO/IEC 42001 -- first AI coding assistant to achieve this
- Customer-managed encryption keys
- Proof-of-possession architecture
- Explicit policy: never trains on proprietary code

### Pricing (Credit-Based)

| Plan | Price | Credits |
|------|-------|---------|
| Indie | $20/mo | 40,000 |
| Standard | $60/mo | 130,000 |
| Max | $200/mo | 450,000 |
| Enterprise | Custom | Volume discounts |

~2,400 credits per 1,000-line PR review.

### Unique Features Claude Code LACKS

1. **Semantic codebase indexing** -- 400K+ files, dependency-aware
2. **Cross-service dependency detection** -- finds architectural violations
3. **Incremental re-indexing** -- near-instant updates after changes
4. **Up to 10 parallel Remote Agents** (Claude Code Teams is experimental, limited)
5. **Async agents that persist after logout** (no tmux workaround needed)
6. **Multi-repo orchestration** -- groups related PRs across services
7. **Architectural violation detection** -- prevents "technically correct but architecturally wrong" code
8. **Native multi-IDE support** (VS Code, JetBrains, Vim, Neovim, Emacs, Zed)

### Features Claude Code HAS That Augment LACKS

1. **Agent Teams with formal coordination** (Augment's agents don't talk to each other)
2. **Hooks system** (no lifecycle events)
3. **Agent SDK** (no programmatic API)
4. **Local CLI execution** (Augment requires IDE extension)
5. **Open memory format** (CLAUDE.md is human-readable, version-controllable)
6. **Skills ecosystem** (Augment has basic MCP/Skills but less developed)
7. **Model choice** (Augment picks models; Claude Code is Anthropic models only but explicit)

---

## Feature Gap Analysis

### What Claude Code Is Missing (Ordered by Impact)

#### Tier 1: High Impact, Should Build

| Gap | Who Has It | Impact | Difficulty |
|-----|-----------|--------|------------|
| **Background/Async Agents** | Cursor, Codex, Copilot, Devin, Jules, Augment | Agents that persist beyond session, deliver PRs | High |
| **Semantic Codebase Indexing** | Augment, Devin | Understanding 400K+ files through dependency analysis, not just text search | High |
| **Citation-Based Memory** | Copilot | Memories auto-validate against code, preventing stale context | Medium |
| **Glob-Scoped Rules** | Cursor | Rules that activate only for specific file patterns (e.g., `*.tsx`) | Low |
| **OS-Level Sandboxing** | Codex | Seatbelt/Docker vs app-level sanitization | Medium |

#### Tier 2: Medium Impact, Consider Building

| Gap | Who Has It | Impact | Difficulty |
|-----|-----------|--------|------------|
| **Architect/Editor Separation** | Aider | Pair a reasoning model with an editing model | Medium |
| **Skill Installer** | Codex | Easy `$skill-installer` for community skills | Low |
| **Dead-End Detection** | Amazon Q | Agent recognizes solution paths that fail, auto-rollbacks | Medium |
| **Repository Map** | Aider | Structural codebase overview with types and signatures | Medium |
| **Snapshot/Restore** | Devin | Save and restore complete machine state | High |
| **Task-Based Pricing Option** | Jules | Pay per task instead of per token | Business decision |
| **Cross-Surface Memory** | Copilot | Same memories across IDE, CLI, web, code review | Medium |

#### Tier 3: Nice to Have

| Gap | Who Has It | Impact | Difficulty |
|-----|-----------|--------|------------|
| **Best-of-N Model Racing** | Cursor | Run same prompt across multiple models | Low |
| **Specialized Domain Agents** | Amazon Q | Dedicated agents for test, doc, review, transform | Medium |
| **Visual Skill Identity** | Codex | Icons, brand colors for skills in `openai.yaml` | Low |
| **Tab Completion** | Cursor, Windsurf | Predictive multi-line code completion | N/A (IDE feature) |
| **Full VM Isolation** | Devin, Jules | Complete VM per task | High |
| **Timeline Scrubbing** | Devin | Roll back to any point in history | High |

### Claude Code's Competitive Advantages

These are features where Claude Code leads the market:

| Advantage | Competitors That Lack It | Moat |
|-----------|-------------------------|------|
| **Agent Teams (multi-agent coordination)** | All except Amazon Q (limited) | High -- only tool with formal team dependencies |
| **Agent SDK** | All except Copilot SDK (new) | High -- programmatic building blocks |
| **Hooks Lifecycle System** | All competitors | Very High -- unique in market |
| **Skills with Progressive Disclosure** | Only Codex has comparable | Medium -- shared with Codex |
| **CLAUDE.md Hierarchical Memory** | Cursor, Aider lack any; others have flat files | Medium -- deepest hierarchy |
| **MCP Integration (broad ecosystem)** | Most competitors lack or have limited | Medium-High |
| **200K Reliable Context** | Most competitors have smaller or unreliable windows | Medium |
| **Granular Permission Escalation** | Cursor (binary), Codex (3 tiers) | Medium |
| **TodoWrite Planning** | Most lack structured planning | Low-Medium |
| **Model Quality (Opus 4.5/4.6)** | Varies by tool | Temporary (models improve) |

---

## Ideas to Incorporate into MMOS

Based on this competitive analysis, here are concrete ideas for the MMOS system:

### 1. Background Agent Mode (from Cursor, Augment, Devin)

```
Priority: HIGH
Concept: Allow spawning agents that persist beyond the active session
Implementation idea:
  - Agent runs in detached tmux/screen session
  - Writes results to a known location (e.g., outputs/agents/{task-id}/)
  - Sends notification on completion (Slack webhook or file watcher)
  - Similar to Jules' task model but local
```

### 2. Codebase Semantic Index (from Augment)

```
Priority: HIGH
Concept: Pre-compute a semantic map of the codebase that agents can query
Implementation idea:
  - Use tree-sitter to extract AST-level structure
  - Build dependency graph between files/functions/classes
  - Store in SQLite or embeddings database
  - Agents query the index instead of grepping everything
  - Incremental updates on file change (via hooks)
```

### 3. Citation-Based Memory Validation (from Copilot)

```
Priority: MEDIUM
Concept: Memories stored in CLAUDE.md include code location citations
  that auto-validate before use
Implementation idea:
  - Format: "Pattern X is used in src/auth/login.ts:42-55"
  - Before using memory, agent verifies the citation still exists
  - Stale memories get flagged or auto-pruned
  - Could be a PostToolUse hook on Read that checks memory freshness
```

### 4. Architect/Editor Agent Pair (from Aider)

```
Priority: MEDIUM
Concept: Use a reasoning model to plan, editing model to execute
Implementation idea:
  - Task 1 (Architect): Opus plans the approach, outputs structured instructions
  - Task 2 (Editor): Sonnet translates instructions into file edits
  - 85% benchmark scores with this pattern
  - Could be a skill that wraps the two-stage pipeline
```

### 5. Glob-Scoped Rules (from Cursor)

```
Priority: LOW (workaround exists via directory CLAUDE.md)
Concept: Rules that activate only for specific file patterns
Implementation idea:
  - Add frontmatter to CLAUDE.md: globs: ["*.tsx", "*.test.ts"]
  - Or: .claude/rules/ directory with per-glob instruction files
  - Similar to Cursor's .mdc format
```

### 6. Dead-End Detection (from Amazon Q)

```
Priority: MEDIUM
Concept: Agent recognizes when a solution path is failing and rolls back
Implementation idea:
  - Track repeated failures (build errors, test failures) in a counter
  - After N failures on same error class, trigger rollback to last known good state
  - Present alternative approach options
  - Could leverage git stash/branch for rollback mechanism
```

### 7. Skill Marketplace/Installer (from Codex)

```
Priority: LOW
Concept: Easy installation of community skills
Implementation idea:
  - /skill-install command that fetches from a registry
  - Skills stored in .claude/skills/ as usual
  - Registry could be a GitHub repo with directories per skill
  - Each skill has a manifest (SKILL.md + dependencies)
```

---

## Competitive Landscape Summary

### Market Positioning

```
                    AUTONOMOUS
                        |
                    Devin ($500/mo)
                        |
            Jules       |       Augment
            (async)     |       (remote agents)
                        |
    -------- Copilot ---+--- Claude Code --------
    ASSISTANT           |           AGENT
                        |
            Cursor      |       Codex CLI
            (IDE)       |       (CLI, open source)
                        |
            Windsurf    |       Aider
            ($15/mo)    |       (free, OSS)
                        |
                    INTERACTIVE
```

### Where Each Tool Wins

| Tool | Wins When... |
|------|-------------|
| **Claude Code** | Complex multi-step reasoning, large codebase understanding, extensible agent systems, building on top of via SDK |
| **Cursor** | Day-to-day coding, visual workflow, budget-conscious teams, parallel experimentation |
| **Windsurf** | Budget teams wanting Cascade's intelligence, automatic memory, simpler workflows |
| **Codex CLI** | Open-source requirement, strong sandboxing needs, OpenAI ecosystem, deterministic multi-step tasks |
| **Copilot** | GitHub-native teams, async PR creation, enterprise compliance, cross-surface memory |
| **Devin** | Fully autonomous tasks (4-8 hour jobs), migrations, enterprise onboarding |
| **Aider** | Model-agnostic needs, git-heavy workflows, architect/editor pattern, open source |
| **Amazon Q** | AWS-native teams, code transformation (Java upgrades), enterprise compliance |
| **Jules** | Async batch tasks, Google/Gemini ecosystem, predictable task-based costs |
| **Augment** | Enterprise monorepos (400K+ files), multi-repo architecture, security-first |

### Convergence Trends (February 2026)

1. **Skills are becoming standard** -- OpenAI adopted Claude Code's exact pattern. Copilot adding Agent Skills. Skills are the new `.eslintrc`.

2. **AGENTS.md / CLAUDE.md / .github/copilot-instructions.md** -- every tool now has a project-level instruction file. The format converged on markdown.

3. **Async/Background agents** -- Cursor, Codex, Copilot, Jules, Augment, Devin all have async execution. Claude Code is one of the few remaining synchronous-only tools.

4. **Memory is the next frontier** -- Copilot's citation-based memory, Devin's Knowledge Base + Snapshots, Windsurf's auto-memories, Augment's semantic index. Claude Code's CLAUDE.md + Session Memory is good but not best-in-class.

5. **Multi-agent is still early** -- Only Claude Code Teams and Amazon Q Transform have true multi-agent coordination. Most tools use parallel independent agents (no communication).

6. **Pricing models diversifying** -- Token (Claude Code), subscription (Cursor), credits (Augment), tasks (Jules), enterprise seat (Devin). No single model has won.

---

## Sources

### Cursor
- [Cursor Agent vs Claude Code (haihai.ai)](https://www.haihai.ai/cursor-vs-claude-code/)
- [Cursor Parallel Agents Docs](https://cursor.com/docs/configuration/worktrees)
- [Cursor Rules Docs](https://cursor.com/docs/context/rules)
- [Cursor 2.0 Changelog](https://cursor.com/changelog/2-0)
- [Cursor 2.0 Multi-Agent Workflows (DevOps.com)](https://devops.com/cursor-2-0-brings-faster-ai-coding-and-multi-agent-workflows/)
- [Claude Code vs Cursor (Codeaholicguy)](https://codeaholicguy.com/2026/01/10/claude-code-vs-cursor/)
- [Claude Code vs Cursor (Builder.io)](https://www.builder.io/blog/cursor-vs-claude-code)

### Windsurf
- [Windsurf Cascade Memories Docs](https://docs.windsurf.com/windsurf/cascade/memories)
- [Windsurf Review 2026 (Second Talent)](https://www.secondtalent.com/resources/windsurf-review/)
- [Windsurf Rules and Workflows (Paul Duvall)](https://www.paulmduvall.com/using-windsurf-rules-workflows-and-memories/)
- [Windsurf vs Claude Code (Tembo)](https://www.tembo.io/blog/windsurf-vs-claude-code)

### Codex CLI
- [Codex Agent Skills Docs](https://developers.openai.com/codex/skills)
- [Codex CLI Features](https://developers.openai.com/codex/cli/features/)
- [Codex Agent Loop (PromptLayer)](https://blog.promptlayer.com/how-openai-codex-works-behind-the-scenes-and-how-it-compares-to-claude-code/)
- [Codex GitHub Repository](https://github.com/openai/codex)
- [OpenAI Skills Adoption (Simon Willison)](https://simonw.substack.com/p/openai-are-quietly-adopting-skills)
- [Codex Agent Loop Internals (InfoQ)](https://www.infoq.com/news/2026/02/codex-agent-loop/)

### GitHub Copilot
- [Copilot Agentic Memory System (GitHub Blog)](https://github.blog/ai-and-ml/github-copilot/building-an-agentic-memory-system-for-github-copilot/)
- [Copilot Custom Instructions (VS Code Docs)](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)
- [Copilot CLI Enhanced Agents (GitHub Changelog)](https://github.blog/changelog/2026-01-14-github-copilot-cli-enhanced-agents-context-management-and-new-ways-to-install/)
- [Copilot Agent Skills (Visual Studio Magazine)](https://visualstudiomagazine.com/articles/2026/01/11/hand-on-with-new-github-copilot-agent-skills-in-vs-code.aspx)
- [Copilot SDK (GitHub Blog)](https://github.blog/news-insights/company-news/build-an-agent-into-any-app-with-the-github-copilot-sdk/)

### Devin
- [Devin 2025 Performance Review (Cognition)](https://cognition.ai/blog/devin-annual-performance-review-2025)
- [Devin Docs](https://docs.devin.ai/)
- [Devin Knowledge Base (Cognition June Update)](https://cognition.ai/blog/june-24-product-update)
- [Devin 2.0 (Cognition)](https://cognition.ai/blog/devin-2)
- [Devin First Impressions (The Ground Truth)](https://thegroundtruth.media/p/devin-first-impressions)

### Aider
- [Aider Chat Modes Docs](https://aider.chat/docs/usage/modes.html)
- [Aider Architect Mode Blog](https://aider.chat/2024/09/26/architect.html)
- [Aider Conventions](https://aider.chat/docs/usage/conventions.html)
- [Aider Repository Map](https://aider.chat/docs/repomap.html)

### Amazon Q Developer
- [Amazon Q Developer Features](https://aws.amazon.com/q/developer/features/)
- [Amazon Q Transform Architecture (AWS DevOps Blog)](https://aws.amazon.com/blogs/devops/dissecting-the-performance-gains-in-amazon-q-developer-agent-for-code-transformation/)
- [Amazon Q Agent Capabilities (AWS Blog)](https://aws.amazon.com/blogs/aws/new-amazon-q-developer-agent-capabilities-include-generating-documentation-code-reviews-and-unit-tests/)
- [CLI Agent Orchestrator (AWS Open Source Blog)](https://aws.amazon.com/blogs/opensource/introducing-cli-agent-orchestrator-transforming-developer-cli-tools-into-a-multi-agent-powerhouse/)

### Google Jules
- [Jules Official Site](https://jules.google)
- [Jules API Docs](https://developers.google.com/jules/api)
- [Jules Out of Beta (TechCrunch)](https://techcrunch.com/2025/08/06/googles-ai-coding-agent-jules-is-now-out-of-beta/)
- [Jules Enters Toolchains (TechCrunch)](https://techcrunch.com/2025/10/02/googles-jules-enters-developers-toolchains-as-ai-coding-agent-competition-heats-up/)
- [Jules Tools (Google Developers Blog)](https://developers.googleblog.com/en/meet-jules-tools-a-command-line-companion-for-googles-async-coding-agent/)

### Augment Code
- [Augment Code vs Claude Code](https://www.augmentcode.com/guides/claude-code-vs-augment-code)
- [Augment Remote Agent Docs](https://docs.augmentcode.com/using-augment/remote-agent)
- [Augment Remote Agents (The New Stack)](https://thenewstack.io/augment-codes-remote-agents-code-in-the-cloud/)
- [Augment Multi-Agent Guide](https://www.augmentcode.com/guides/spec-driven-ai-code-generation-with-multi-agent-systems)

### Benchmarks & Comparisons
- [SWE-Bench Pro Leaderboard (Scale AI)](https://scale.com/leaderboard/swe_bench_pro_public)
- [Best AI for Coding 2026 (marc0.dev)](https://www.marc0.dev/en/blog/best-ai-for-coding-2026-swe-bench-breakdown-opus-4-6-qwen3-coder-next-gpt-5-3-and-what-actually-matters-1770387434111)
- [AI Dev Tool Power Rankings (LogRocket)](https://blog.logrocket.com/ai-dev-tool-power-rankings/)
- [CLI Coding Agents Compared (aimultiple)](https://aimultiple.com/agentic-cli)
- [Top 5 CLI Agents (Pinggy)](https://pinggy.io/blog/top_cli_based_ai_coding_agents/)
- [Coding CLI Tools Comparison (Tembo)](https://www.tembo.io/blog/coding-cli-tools-comparison)
