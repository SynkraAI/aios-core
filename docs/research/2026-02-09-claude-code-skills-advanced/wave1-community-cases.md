# Deep Research: Real-World Cases - Advanced Claude Code Usage

**Date:** 2026-02-09
**Researcher:** deep-researcher agent
**Sources consulted:** 40+
**Pages deep-read:** 18

---

## TL;DR

- Claude Code's advanced features (agents, skills, teams, memory, hooks) are being used in production by companies like Rakuten, TELUS, Hugging Face/Sionic AI, and Anthropic internally
- The ecosystem has exploded: 339+ skills in the VoltAgent awesome list, 160K+ in the broader marketplace, official skills from Anthropic, Vercel, Cloudflare, Microsoft, Trail of Bits, Stripe, Expo, and others
- Multi-agent orchestration (teams/swarms) went from a hidden feature-flagged system to an officially supported feature in Feb 2026, with multiple community frameworks (claude-flow, oh-my-claudecode, Claude Colony) preceding it
- Boris Cherny (Claude Code creator) runs 5 local + 5-10 web sessions in parallel, uses spec-based workflow, and emphasizes verification loops as the #1 tip
- The skill-creator official pattern from Anthropic establishes clear architecture: SKILL.md + scripts/ + references/ + assets/, with progressive disclosure (metadata ~100 tokens -> body <5k -> resources unlimited)
- Simon Willison predicts skills will cause "a Cambrian explosion" bigger than MCP

---

## 1. Official Anthropic Resources

### 1.1 anthropics/skills Repository

The official skills repository (66.5K stars, 6.6K forks) contains example skills demonstrating the architecture.

**Skills Categories:**
- Creative & Design (art, music, design)
- Development & Technical (testing web apps, MCP server generation)
- Enterprise & Communication (branding workflows)
- Document Skills (PDF, DOCX, PPTX, XLSX - source-available, not open source)

**Key Skill: skill-creator** -- The meta-skill that teaches Claude how to create new skills. Establishes the canonical pattern:

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter (name + description required)
│   └── Markdown instructions
└── Bundled Resources (optional)
    ├── scripts/      # Executable code (Python/Bash)
    ├── references/   # Documentation loaded into context as needed
    └── assets/       # Files used in output (templates, icons)
```

**Core Principles from skill-creator:**
1. **Concise is key** -- "The context window is a public good. Does Claude really need this explanation?"
2. **Degrees of Freedom** -- High (text instructions) vs Medium (pseudocode) vs Low (specific scripts) based on task fragility
3. **Progressive Disclosure** -- Metadata (~100 tokens always loaded) -> SKILL.md body (<5k tokens on trigger) -> Resources (unlimited, on demand)
4. **No extraneous files** -- No README.md, CHANGELOG.md, INSTALLATION_GUIDE.md inside skills

**6-Step Creation Process:**
1. Understanding with concrete examples
2. Planning reusable contents
3. Initializing via `init_skill.py`
4. Editing SKILL.md + resources
5. Packaging via `package_skill.py`
6. Iterating based on real usage

> Source: [anthropics/skills](https://github.com/anthropics/skills) | [skill-creator SKILL.md](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md)

### 1.2 anthropics/claude-plugins-official

Separate from the skills repo, this contains plugin-format skills like `claude-md-improver` that demonstrate the plugin marketplace integration pattern.

> Source: [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official)

### 1.3 How Anthropic Teams Use Claude Code (Internal)

Anthropic published how their own departments use Claude Code:

| Department | Use Case | Impact |
|-----------|----------|--------|
| **Growth Marketing** | Agentic workflow: CSV -> identify underperforming ads -> generate variations with sub-agents | Minutes instead of hours |
| **Legal** | "Phone tree" system to connect team members with the right lawyer | Non-technical staff building tools |
| **Data Infrastructure** | OCR on error screenshots -> diagnose K8s issues -> generate fix commands | Automated incident response |
| **Finance** | Natural language -> database queries -> Excel reports | Non-engineers running queries |
| **Product Development** | Auto-accept mode: Claude writes ~70% of Vim mode code autonomously | Massive productivity boost |
| **Security Engineering** | Terraform plan parsing for security review | Eliminates dev bottlenecks |
| **Inference Teams** | Unit test generation covering edge cases | 80% reduction in R&D time |
| **Data Science/ML** | 5,000+ line TypeScript dashboards from scratch | One-time analyses -> reusable tools |

**Key insight:** "Agentic coding is dissolving the boundary between technical and non-technical work."

> Source: [How Anthropic teams use Claude Code](https://www.anthropic.com/news/how-anthropic-teams-use-claude-code) | [Ernest Chiang summary](https://www.ernestchiang.com/en/posts/2025/how-anthropic-teams-use-claude-code/)

### 1.4 Agent Skills Engineering Blog

Anthropic's engineering blog on Agent Skills describes them as "equipping agents for the real world." Skills package expertise into composable resources that Claude discovers and loads dynamically. The open standard has been adopted by OpenAI for Codex CLI and ChatGPT.

> Source: [Anthropic Engineering: Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)

---

## 2. Production Case Studies

### 2.1 Rust C Compiler -- Nicholas Carlini (Anthropic)

**The project:** Build a Rust-based C compiler from scratch that can compile the Linux kernel, without internet access, using only the Rust standard library.

| Metric | Value |
|--------|-------|
| Agents | 16 parallel Claude instances |
| Duration | ~2 weeks |
| Sessions | ~2,000 Claude Code sessions |
| Cost | ~$20,000 |
| Output | 100,000 lines of Rust |
| Result | Compiles Linux 6.9 on x86, ARM, RISC-V |

**Architecture:** Containerized system where each agent operates independently with its own workspace, pushing changes to a shared upstream repository. Synchronization via simple file-based locking -- agents claim tasks by writing to `current_tasks/` directories.

**Key Lessons:**
1. **High-quality testing is essential** -- Autonomous agents require near-perfect task verifiers
2. **Agent-centric design** -- Systems must accommodate LLM limitations (context window pollution, temporal blindness) through structured logging and progress tracking
3. **Parallelism strategy** -- Use "oracle" comparisons (GCC as reference) to enable independent work
4. **Role specialization** -- Different agents for bug fixing, deduplication, optimization, documentation
5. **Environmental scaffolding** -- Extensive READMEs help dropped agents quickly orient themselves

> Source: [Building a C Compiler with Parallel Claude Agents](https://www.anthropic.com/engineering/building-c-compiler)

### 2.2 Rakuten -- vLLM Implementation

Rakuten engineer Kenta Naruse tested Claude Code on implementing an activation vector extraction method in vLLM (12.5 million lines of code).

- **Autonomous work:** 7 hours in a single run
- **Accuracy:** 99.9% numerical accuracy vs reference
- **Business impact:** Average time to market dropped from 24 to 5 working days (79% reduction)

> Source: [Rakuten accelerates development with Claude Code](https://claude.com/customers/rakuten)

### 2.3 TELUS

- 13,000+ custom AI solutions created
- Engineering code shipped 30% faster
- 500,000+ hours saved in total
- 47 enterprise-grade apps delivered
- $90M+ in measurable business benefit

> Source: [Claude Customer Stories](https://claude.com/customers)

### 2.4 Hugging Face / Sionic AI -- ML Experiment Pipeline

Sionic AI uses Claude Code Skills to run 1,000+ ML experiments per day:

- Claude writes training scripts, debugs CUDA errors, searches hyperparameters overnight
- After each session, a single command extracts key points into a "skill" saved to a shared registry
- The `hf-llm-trainer` skill teaches Claude: GPU selection, Hub authentication, LoRA vs full fine-tuning
- Full production stack: SFT, DPO, RLHF
- Train models 0.5B to 7B parameters, convert to GGUF, multi-stage pipelines

**Hugging Face also used Claude to teach small open models to write CUDA kernels** via agent skills.

> Source: [How We Use Claude Code Skills to Run 1,000+ ML Experiments a Day](https://huggingface.co/blog/sionic-ai/claude-code-skills-training) | [HF Skills Training](https://huggingface.co/blog/hf-skills-training)

---

## 3. GitHub Repositories & Open Source

### 3.1 everything-claude-code (42.9K stars)

**Author:** affaan-m (Anthropic hackathon winner)

Production-ready Claude Code plugin evolved over 10+ months of intensive daily use.

**Features:**
- **12 specialized agents**: planner, architect, code/security/Go/Python/database reviewers, TDD guide, build error resolver
- **30+ slash commands**: /plan, /tdd, /code-review, /instinct-import
- **Continuous Learning System (v2)**: Instinct-based learning with confidence scoring -- auto-extracts and evolves patterns from sessions
- **Multi-language support**: TypeScript, Python, Go, Java
- **Memory persistence hooks**: Auto-save/load context across sessions
- **Strategic token optimization**: Model selection guides, system prompt slimming, background processes
- **Verification loops**: Checkpoint vs continuous evaluation with grader types and pass@k metrics
- **Parallelization strategies**: Git worktrees, cascade methods, instance scaling

Install: `/plugin marketplace add affaan-m/everything-claude-code`

> Source: [everything-claude-code](https://github.com/affaan-m/everything-claude-code)

### 3.2 wshobson/agents (112 Agents)

Comprehensive multi-agent orchestration system:

- **112 total agents** across 4 model tiers (Opus 4.5: 42 critical, inherited: 42 complex, Sonnet: 51 support, Haiku: 18 operational)
- **146 agent skills** + 79 development tools
- **73 single-purpose plugins** for selective installation
- **16 multi-agent workflow orchestrators**
- Full-stack feature development coordinates 7+ agents in sequence: backend architect -> DB architect -> frontend dev -> test automator -> security auditor -> deployment engineer -> observability engineer

> Source: [wshobson/agents](https://github.com/wshobson/agents)

### 3.3 VoltAgent/awesome-agent-skills (339+ Skills)

Curated collection from official dev teams and community:

**Official Team Skills:**
| Team | Count | Focus |
|------|-------|-------|
| Anthropic | 16 | Document handling, design, testing, MCP servers |
| Vercel Engineering | 8 | React, Next.js, web design |
| Cloudflare | 7 | Workers, MCP servers, performance auditing |
| Microsoft | 60+ | Azure AI, .NET, Java, Python SDKs |
| Hugging Face | 8 | ML workflows, datasets, model training |
| Trail of Bits | 25+ | Security, smart contracts, static analysis |
| Google Labs/Stitch | 6 | Design-to-code conversion |
| Stripe, Expo, Sentry, Better Auth, Tinybird, Neon, fal.ai, HashiCorp, Sanity, Remotion, WordPress | Various | Domain-specific capabilities |

**Cross-platform compatibility:** Claude Code, Cursor, GitHub Copilot, Windsurf, Antigravity, Codex, OpenCode, Gemini CLI

> Source: [awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills)

### 3.4 ChrisWiles/claude-code-showcase

Comprehensive configuration showcase demonstrating:

- **Hooks system**: PreToolUse (block edits on main), PostToolUse (auto-format, test, lint), UserPromptSubmit (context injection), Stop (continuation logic)
- **MCP integration**: JIRA, GitHub, Slack, databases connected as bridges
- **Skills framework**: Testing patterns, GraphQL conventions, UI component usage
- **GitHub Actions workflows**: Scheduled maintenance, PR reviews, dependency audits
- **Ticket-driven development**: Claude reads JIRA requirements and manages status throughout implementation

> Source: [claude-code-showcase](https://github.com/ChrisWiles/claude-code-showcase)

### 3.5 ruvnet/claude-flow

Leading agent orchestration platform:

- 54+ (v3: 60+) specialized agents in coordinated swarms
- SONA self-learning system
- 170+ MCP tools
- RuVector vector DB
- 84.8% SWE-Bench performance
- 75% cost savings claims
- Enterprise-grade architecture with distributed swarm intelligence and RAG integration

> Source: [claude-flow](https://github.com/ruvnet/claude-flow)

### 3.6 Yeachan-Heo/oh-my-claudecode

Multi-agent orchestration with 5 execution modes:

1. **Autopilot**: Fully autonomous
2. **Ultrapilot**: 3-5x parallel acceleration
3. **Swarm**: Coordinated agents
4. **Pipeline**: Sequential chains
5. **Ecomode**: Token-efficient

31+ skills, 32 specialized agents, persistent memory with SQLite.

> Source: [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode)

### 3.7 Other Notable Repos

| Repo | Stars | Description |
|------|-------|-------------|
| [travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills) | -- | Curated list of awesome Claude Skills and resources |
| [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | -- | Another curated list with different focus |
| [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) | -- | Real-world skill collection including subagents and commands |
| [hjertefolger/cortex](https://github.com/hjertefolger/cortex) | -- | Persistent local memory for Claude Code, zero cloud |
| [doobidoo/mcp-memory-service](https://github.com/doobidoo/mcp-memory-service) | -- | "Stop re-explaining your project to AI every session" |
| [rohunvora/x-research-skill](https://github.com/rohunvora/x-research-skill) | -- | X/Twitter research skill for Claude Code |
| [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) | -- | Curated skills, hooks, commands, orchestrators |
| [anthropics/claude-code-action](https://github.com/anthropics/claude-code-action) | -- | Official GitHub Actions integration |

---

## 4. Blog Posts & Articles

### 4.1 Boris Cherny (Claude Code Creator) -- Workflow Revealed

Boris Cherny's workflow surprised the community with its simplicity:

- **Parallel instances**: 5 local terminals + 5-10 web sessions
- **Spec-based workflow**: Start with minimal spec -> have Claude interview you via AskUserQuestion -> execute in new session
- **Model preference**: Opus 4.5 with thinking for all coding
- **CLAUDE.md philosophy**: Each Anthropic team maintains one in git to document mistakes and best practices
- **#1 tip**: "Give Claude a way to verify its work" -- verification loops improve quality 2-3x
- **Workflow phases**: spec -> draft -> simplify -> verify (each benefits from a different "mind")
- **Output**: ~100 PRs/week

> Source: [Boris Cherny Twitter Thread](https://x.com/bcherny/status/2007179832300581177) | [InfoQ Analysis](https://www.infoq.com/news/2026/01/claude-code-creator-workflow/) | [VentureBeat](https://venturebeat.com/technology/the-creator-of-claude-code-just-revealed-his-workflow-and-developers-are)

### 4.2 Shrivu Shankar -- "How I Use Every Claude Code Feature"

Deeply opinionated guide from a power user:

- **CLAUDE.md**: 13KB file for professional work. Treat as "agent constitution," not exhaustive documentation
- **Anti-pattern warning**: "If you have a long list of complex, custom slash commands, you've created an anti-pattern"
- **Rejects custom subagents**: Prefers "Master-Clone" architecture using built-in `Task()` -- custom subagents "gatekeep context and force rigid workflows"
- **Skills praised as "maybe bigger than MCP"**: They formalize the "scripting-based agent model"
- **Hooks strategy**: Block-at-Submit hooks are primary (wrap git commit). Avoid block-at-write (confuses agents mid-plan)
- **GitHub Actions flywheel**: GHA logs -> identify patterns -> improve CLAUDE.md/CLIs -> better agent
- **Context management**: `/clear` + `/catchup` for simple restarts. "Document & Clear" for complex tasks. Avoid `/compact`
- **Memory meta-analysis**: Analyzes session logs in `~/.claude/projects/` to identify error patterns

> Source: [How I Use Every Claude Code Feature](https://blog.sshh.io/p/how-i-use-every-claude-code-feature)

### 4.3 alexop.dev -- "From Tasks to Swarms: Agent Teams in Claude Code"

Definitive guide on the three-phase team lifecycle:

**Seven Team Primitives:**
1. TeamCreate, 2. TaskCreate, 3. TaskUpdate, 4. TaskList, 5. Task (spawn), 6. SendMessage, 7. TeamDelete

**Cost analysis:**
| Approach | Tokens | Use Case |
|----------|--------|----------|
| Solo session | ~200k | Direct control needed |
| Subagents | ~440k | Focused parallel work |
| Agent teams | ~800k+ | Cross-layer coordination |

**Real QA swarm example:** 5 agents (qa-pages, qa-posts, qa-links, qa-seo, qa-a11y), 146+ URLs and 83 blog posts checked, ~3 minutes end-to-end, 10 issues found.

**Key advice:** "Plan First, Parallelize Second" -- use plan mode first (~10k tokens), then hand validated plan to team lead.

> Source: [From Tasks to Swarms](https://alexop.dev/posts/from-tasks-to-swarms-agent-teams-in-claude-code/)

### 4.4 Addy Osmani -- "Claude Code Swarms"

Google Chrome team member's analysis:

- **Core insight**: "LLMs perform worse as context expands" -- specialized teammates maintain focused, narrower contexts
- **Competing Hypotheses pattern**: Spawn multiple investigators exploring different theories simultaneously
- **Parallel Code Review pattern**: Separate teammates for security, performance, test coverage
- **Critical caution**: "Activity doesn't always translate to value" -- don't let impressive metrics (commits/hour) distract from correctness

> Source: [Addy Osmani: Claude Code Swarms](https://addyosmani.com/blog/claude-code-agent-teams/)

### 4.5 Lee Han Chung -- "Claude Agent Skills: A First Principles Deep Dive"

Technical deep dive into Skills internals:

- Skills operate as a **meta-tool system for prompt injection and context modification** -- not executable code
- **Dual-Message Pattern**: Each invocation creates two messages: one visible metadata (XML-formatted) + one hidden instruction prompt
- Skills modify both **conversation context** (isMeta: true messages) and **execution context** (dynamic permission changes, model selection)
- Claude's language model decides skill relevance through **pure reasoning** -- no algorithmic routing

**Workflow Patterns:**
1. Script Automation (offload to deterministic code)
2. Search-Analyze-Report (Grep-based detection)
3. Read-Process-Write (file transformation)
4. Iterative Refinement (multi-pass analysis)

> Source: [Claude Skills Deep Dive](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/)

### 4.6 Simon Willison -- "Claude Skills are awesome, maybe a bigger deal than MCP"

Key arguments:

- **Token efficiency**: Skills use "a few dozen extra tokens" vs MCP's "tens of thousands"
- **Simplicity**: Skills are just markdown files vs MCP's entire protocol specification
- **Cross-platform**: Works with Codex CLI, Gemini CLI without baked-in knowledge
- **Prediction**: "A Cambrian explosion in Skills which will make this year's MCP rush look pedestrian"

> Source: [Simon Willison: Claude Skills](https://simonwillison.net/2025/Oct/16/claude-skills/)

### 4.7 HumanLayer -- "Writing a Good CLAUDE.md"

Key recommendations:

- **Instruction limit**: "Frontier thinking LLMs can follow ~150-200 instructions with reasonable consistency"
- **Keep under 300 lines** (shorter is even better). HumanLayer's own is <60 lines
- **Progressive disclosure**: Create separate markdown files (building_project.md, running_tests.md, code_conventions.md)
- **Skip style guidelines**: "Never send an LLM to do a linter's job"
- **Craft manually**: Avoid auto-generation via /init -- each line demands careful consideration

> Source: [Writing a Good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md)

### 4.8 Eduardo Lugo -- Subagent Orchestration: Twitter Newsroom

A `/twitter` command orchestrates 5 specialized agents working like a newsroom:

1. **Researcher**: Gathers information
2. **Writer**: Drafts thread
3. **Fact-Checker**: Verifies claims
4. **Editor**: Improves clarity and flow
5. **Publisher**: Final polish and formatting

Automatic feedback loops improve quality without manual intervention.

> Source: [Subagent Orchestration with Claude Code](https://medium.com/@eduardojld/subagent-orchestration-with-claude-code-self-editing-twitter-newsroom-bfdf6519362d)

### 4.9 fsck.com -- "Fixing Claude Code's Amnesia" (Episodic Memory)

Built `episodic-memory` plugin addressing cross-session context loss:

- **Automatic archiving**: Startup hook transfers conversations to archive
- **Semantic search**: SQLite with vector search for meaning-based queries across sessions
- **Smart filtering**: Haiku subagent manages context bloat
- **Skill-based learning**: Dedicated skill teaches Claude when/how to search its memory
- **Key insight**: This captures "the trade-offs discussed, the alternatives considered, the user's preferences and constraints" that lives nowhere else

> Source: [Fixing Claude Code's Amnesia](https://blog.fsck.com/2025/10/23/episodic-memory/)

---

## 5. Multi-Agent Orchestration Ecosystem

### 5.1 Hidden Swarm Discovery (TeammateTool)

Developer kieranklaassen discovered a complete multi-agent system hidden in Claude Code's binary (v2.1.29) via `strings` command:

**13 operations across 4 categories:**
- Team Lifecycle: `spawnTeam`, `discoverTeams`, `cleanup`, `requestJoin`, `approveJoin`, `rejectJoin`
- Coordination: `write` (DM), `broadcast` (all-team)
- Plan: `approvePlan`, `rejectPlan`
- Shutdown: `requestShutdown`, `approveShutdown`, `rejectShutdown`

**Infrastructure:** `~/.claude/teams/{team-name}/config.json`, `~/.claude/tasks/{team-name}/`

Developer mikekelly created `claude-sneakpeek` to bypass feature gates before official release (Feb 6, 2026).

> Source: [Claude Code's Hidden Multi-Agent System](https://paddo.dev/blog/claude-code-hidden-swarm/)

### 5.2 Official Agent Teams (Feb 2026)

Native multi-agent orchestration released officially. Enables:
- Team lead spawns specialized teammates
- Shared task board with dependencies
- Direct messaging between agents
- Plan approval gates

Environment variable: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`

> Source: [Claude Code Docs: Agent Teams](https://code.claude.com/docs/en/agent-teams)

### 5.3 Community Frameworks Timeline

| Project | Approach | Scale | Key Feature |
|---------|----------|-------|-------------|
| **claude-flow** | MCP-based orchestration | 60+ agents | SONA self-learning, 170+ MCP tools |
| **oh-my-claudecode** | 5 execution modes | 32 agents, 31+ skills | Autopilot/Ultrapilot/Swarm/Pipeline/Ecomode |
| **Claude Colony** | tmux-based visual | N agents | Manager left, workers stacked right, live monitoring |
| **Orcha** | Git branch isolation | N agents | Visual workflow builder for hand-offs |
| **Vibe-Claude** | Auto-routing | 11 agents | Self-evolution capabilities |
| **Gas Town** | CLI hierarchy | N agents | "Mayor" agent spawns designated agents |
| **Multiclaude** | Supervisor model | N agents | Team model with task assignment |
| **CC Mirror** | Official codebase unlock | N agents | Pure task decomposition with blocking relationships |

> Sources: [claude-flow](https://github.com/ruvnet/claude-flow) | [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) | [HN Discussion](https://news.ycombinator.com/item?id=46902368)

---

## 6. Memory & Persistence Patterns

### 6.1 Official Memory System

- Auto-memory directory: `~/.claude/projects/<project>/memory/`
- MEMORY.md (first 200 lines) loaded into system prompt every session
- Topic files (debugging.md, patterns.md) loaded on demand
- `#` prefix in chat triggers Claude to write to MEMORY.md

### 6.2 Session Memory (v2.1.30+, Feb 2026)

Automatic background system:
- Watches conversations
- Extracts important parts
- Saves structured summaries to disk
- No user input required

### 6.3 Community Memory Solutions

| Tool | Approach |
|------|----------|
| **episodic-memory** | SQLite + vector search + Haiku subagent filtering |
| **Cortex** | Persistent local memory, zero cloud |
| **claude-mem** | Memory persistence layer |
| **mcp-memory-service** | Automatic context memory for 13+ AI tools |

---

## 7. Plugin Marketplace & Ecosystem

### 7.1 Skills Marketplace (2026)

- **160,000+ agent skills** in the broader ecosystem
- Install via: `/plugin marketplace add <org>/<repo>`
- Skills are an open standard adopted by OpenAI Codex CLI, ChatGPT, Gemini CLI
- Production-ready bundles: marketing, engineering, product, C-level advisory

### 7.2 Notable Plugin Marketplaces

| Marketplace | Skills | Focus |
|-------------|--------|-------|
| anthropics/skills | ~20 | Official examples + document skills |
| VoltAgent/awesome-agent-skills | 339+ | Community curated |
| affaan-m/everything-claude-code | 30+ commands | Battle-tested production configs |
| alirezarezvani/claude-skills | Collection | Real-world usage patterns |
| daymade/claude-code-skills | Professional | Production-ready workflows |
| SkillsMP.com | Platform | Third-party marketplace |

### 7.3 Cross-Platform Compatibility

Skills work across:
- Claude Code: `~/.claude/skills/`
- Cursor: `~/.cursor/skills/`
- GitHub Copilot: `~/.copilot/skills/`
- Windsurf, Antigravity, Codex, OpenCode, Gemini CLI

---

## 8. GitHub Actions & CI/CD Integration

### 8.1 claude-code-action (Official)

- Trigger: `@claude` mention in PR/issue
- Capabilities: Code review, implementation, PR creation, bug fixes
- Authentication: Anthropic API, Amazon Bedrock, Google Vertex AI, Microsoft Foundry
- Setup: `claude /install-github-app`
- Context: Reads CLAUDE.md automatically for project standards

### 8.2 Workflow Patterns

- **PR review on open**: Trigger Claude analysis on every PR
- **Comment-triggered**: `@claude` in PR comments for on-demand analysis
- **Scheduled maintenance**: Automated dependency audits, documentation syncing
- **Ticket-driven**: Claude reads JIRA requirements and manages status

> Source: [Claude Code GitHub Actions Docs](https://code.claude.com/docs/en/github-actions) | [anthropics/claude-code-action](https://github.com/anthropics/claude-code-action)

---

## 9. Hooks System -- Real-World Patterns

### 9.1 Hook Types

| Type | Description |
|------|-------------|
| `command` | Runs a shell command (most common) |
| `prompt` | Single-turn LLM evaluation |
| `agent` | Multi-turn verification with tool access |

### 9.2 Hook Events

| Event | When | Use Case |
|-------|------|----------|
| PreToolUse | Before any tool call | Block edits on main, validate commands |
| PostToolUse | After any tool call | Auto-format, run tests, lint |
| UserPromptSubmit | When user sends message | Add context, suggest skills |
| Stop | When Claude finishes | Determine if should continue |

### 9.3 Real Examples

- **Block commits on main branch** (PreToolUse + Bash matcher)
- **Auto-format code after edit** (PostToolUse)
- **Run tests after file changes** (PostToolUse)
- **Pre-commit quality gates** (PreToolUse wrapping git commit)
- **GitButler integration** (auto-isolate generated code into branches)
- **Memory auto-save** (Stop hook archives session context)

> Source: [Claude Code Hooks Guide](https://code.claude.com/docs/en/hooks-guide) | [Demystifying Claude Code Hooks](https://www.brethorsting.com/blog/2025/08/demystifying-claude-code-hooks/) | [20+ Ready-to-Use Examples](https://dev.to/lukaszfryc/claude-code-hooks-complete-guide-with-20-ready-to-use-examples-2026-dcg)

---

## 10. Community Discussions

### 10.1 Hacker News

Key threads:
- [Orchestrate teams of Claude Code sessions](https://news.ycombinator.com/item?id=46902368) -- Official agent teams announcement discussion
- [Open-sourcing autonomous agent teams](https://news.ycombinator.com/item?id=46525642) -- CC Mirror discussion
- [Claude Colony](https://news.ycombinator.com/item?id=46357942) -- tmux-based visual orchestration
- [Multi-agent deliberation plugin](https://news.ycombinator.com/item?id=46737053) -- Deliberate/Council/Debate modes
- [Claude Code's new hidden feature: Swarms](https://news.ycombinator.com/item?id=46743908) -- Discovery of TeammateTool
- [Dream-team](https://news.ycombinator.com/item?id=46905717) -- Assemble team of Claude agents for task

### 10.2 Key Community Insights

- "Workers genuinely need to talk to each other" is the threshold for teams vs subagents
- Teams justify cost when cross-layer coordination is needed
- "Competing hypotheses" pattern is highly effective for debugging
- Plan mode first (~10k tokens) prevents expensive mid-execution direction changes
- Lead on Opus, teammates on cheaper Sonnet is the common cost optimization

---

## 11. Best Practices Synthesis

### 11.1 CLAUDE.md

| Practice | Source |
|----------|--------|
| Keep under 300 lines, ideally <60 | HumanLayer |
| Start with guardrails, not manuals | Shrivu Shankar |
| Document based on actual mistakes | Boris Cherny (Anthropic teams) |
| Never use negative-only constraints | Shrivu Shankar |
| Progressive disclosure to separate files | HumanLayer, Dometrain |
| Skip style guidelines (use linters) | HumanLayer |
| Craft manually, don't use /init | HumanLayer |
| ~150-200 instruction limit | HumanLayer research |
| Use as forcing function to simplify CLIs | Shrivu Shankar |

### 11.2 Skills

| Practice | Source |
|----------|--------|
| Self-contained folders, no shared dependencies | anthropics/skills |
| Progressive disclosure: metadata -> body -> resources | skill-creator |
| Description is the trigger mechanism (be comprehensive) | skill-creator |
| SKILL.md body under 500 lines | skill-creator |
| No extraneous files (README, CHANGELOG) | skill-creator |
| Match freedom to task fragility | skill-creator |
| Scripts for deterministic operations | skill-creator |
| References for domain knowledge | skill-creator |
| Assets for output files (templates) | skill-creator |

### 11.3 Agents/Teams

| Practice | Source |
|----------|--------|
| Plan first, parallelize second | alexop.dev |
| Lead on Opus, workers on Sonnet | Multiple sources |
| File-based coordination for simple cases | Nicholas Carlini |
| Task boards with dependencies for complex cases | Official teams |
| Verification loops improve quality 2-3x | Boris Cherny |
| Environmental scaffolding (READMEs) for agents | Nicholas Carlini |
| Don't use teams when subagents suffice | alexop.dev |
| Specialized agents maintain focused context | Addy Osmani |

### 11.4 Memory

| Practice | Source |
|----------|--------|
| MEMORY.md first 200 lines always loaded | Official docs |
| Topic files loaded on demand | Official docs |
| `#` prefix triggers memory writes | Official docs |
| Meta-analyze session logs for patterns | Shrivu Shankar |
| Episodic memory for "trade-offs discussed" | fsck.com |

---

## 12. Gaps & Areas for Further Research

1. **Performance benchmarks**: No systematic comparison of solo vs subagent vs team performance across task types
2. **Cost optimization**: Limited data on token costs for different orchestration patterns at scale
3. **Failure modes**: Few documented cases of what goes wrong with multi-agent workflows
4. **Enterprise governance**: Limited documentation on managing Claude Code in large organizations with compliance requirements
5. **Skill composition**: How multiple skills interact when activated simultaneously is not well-documented
6. **Long-running agents**: Best practices for agents running for hours or days (like the C compiler project) need more documentation
7. **Anthropic's 2026 Agentic Coding Trends Report** (PDF): Contains additional data not fully analyzed here

---

## Sources (Complete List)

### Official Anthropic
- [anthropics/skills](https://github.com/anthropics/skills)
- [skill-creator SKILL.md](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md)
- [anthropics/claude-code-action](https://github.com/anthropics/claude-code-action)
- [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official)
- [How Anthropic teams use Claude Code](https://www.anthropic.com/news/how-anthropic-teams-use-claude-code)
- [Building a C Compiler](https://www.anthropic.com/engineering/building-c-compiler)
- [Agent Skills Engineering Blog](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Agent Teams Docs](https://code.claude.com/docs/en/agent-teams)
- [Skills Docs](https://code.claude.com/docs/en/skills)
- [Memory Docs](https://code.claude.com/docs/en/memory)
- [Hooks Guide](https://code.claude.com/docs/en/hooks-guide)
- [GitHub Actions Docs](https://code.claude.com/docs/en/github-actions)
- [Best Practices](https://code.claude.com/docs/en/best-practices)
- [Introducing Agent Skills](https://claude.com/blog/skills)
- [Skills Explained](https://claude.com/blog/skills-explained)
- [Rakuten Customer Story](https://claude.com/customers/rakuten)

### GitHub Repos
- [everything-claude-code](https://github.com/affaan-m/everything-claude-code)
- [wshobson/agents](https://github.com/wshobson/agents)
- [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills)
- [ChrisWiles/claude-code-showcase](https://github.com/ChrisWiles/claude-code-showcase)
- [ruvnet/claude-flow](https://github.com/ruvnet/claude-flow)
- [Yeachan-Heo/oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode)
- [travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills)
- [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills)
- [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills)
- [hjertefolger/cortex](https://github.com/hjertefolger/cortex)
- [doobidoo/mcp-memory-service](https://github.com/doobidoo/mcp-memory-service)
- [rohunvora/x-research-skill](https://github.com/rohunvora/x-research-skill)
- [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)
- [huggingface/skills](https://github.com/huggingface/skills)

### Blog Posts & Articles
- [Simon Willison: Claude Skills](https://simonwillison.net/2025/Oct/16/claude-skills/)
- [Lee Han Chung: Skills Deep Dive](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/)
- [How I Use Every Claude Code Feature](https://blog.sshh.io/p/how-i-use-every-claude-code-feature)
- [Writing a Good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md)
- [From Tasks to Swarms](https://alexop.dev/posts/from-tasks-to-swarms-agent-teams-in-claude-code/)
- [Addy Osmani: Claude Code Swarms](https://addyosmani.com/blog/claude-code-agent-teams/)
- [Fixing Claude Code's Amnesia](https://blog.fsck.com/2025/10/23/episodic-memory/)
- [Claude Code's Hidden Multi-Agent System](https://paddo.dev/blog/claude-code-hidden-swarm/)
- [Ernest Chiang: Anthropic Teams Summary](https://www.ernestchiang.com/en/posts/2025/how-anthropic-teams-use-claude-code/)
- [Subagent Orchestration: Twitter Newsroom](https://medium.com/@eduardojld/subagent-orchestration-with-claude-code-self-editing-twitter-newsroom-bfdf6519362d)
- [Hugging Face: 1000+ ML Experiments](https://huggingface.co/blog/sionic-ai/claude-code-skills-training)
- [HF Skills Training](https://huggingface.co/blog/hf-skills-training)
- [Boris Cherny Twitter Thread](https://x.com/bcherny/status/2007179832300581177)
- [InfoQ: Claude Code Creator Workflow](https://www.infoq.com/news/2026/01/claude-code-creator-workflow/)
- [Creating the Perfect CLAUDE.md](https://dometrain.com/blog/creating-the-perfect-claudemd-for-claude-code/)
- [The Complete Guide to CLAUDE.md](https://www.builder.io/blog/claude-md-guide)
- [24 Claude Code Tips](https://dev.to/oikon/24-claude-code-tips-claudecodeadventcalendar-52b5)
- [Claude Code Hooks: 20+ Examples](https://dev.to/lukaszfryc/claude-code-hooks-complete-guide-with-20-ready-to-use-examples-2026-dcg)
- [Demystifying Claude Code Hooks](https://www.brethorsting.com/blog/2025/08/demystifying-claude-code-hooks/)
- [The Decoder: 50+ Customizable Claude Skills](https://the-decoder.com/github-repository-offers-more-than-50-customizable-claude-skills/)
- [Claude Code for Beginners](https://codewithmukesh.com/blog/claude-code-for-beginners/)
- [Guide to Claude Code 2.0](https://sankalp.bearblog.dev/my-experience-with-claude-code-20-and-how-to-get-better-at-using-coding-agents/)

### Hacker News Discussions
- [Orchestrate teams of Claude Code sessions](https://news.ycombinator.com/item?id=46902368)
- [Connect multiple Claude Code agents](https://news.ycombinator.com/item?id=46641995)
- [Open-sourcing autonomous agent teams](https://news.ycombinator.com/item?id=46525642)
- [Claude Colony](https://news.ycombinator.com/item?id=46357942)
- [Multi-agent deliberation plugin](https://news.ycombinator.com/item?id=46737053)
- [Claude Code's hidden swarm feature](https://news.ycombinator.com/item?id=46743908)
- [Dream-team](https://news.ycombinator.com/item?id=46905717)
- [How Anthropic teams use Claude Code](https://news.ycombinator.com/item?id=44678535)
- [Persistent memory for Claude Code](https://news.ycombinator.com/item?id=46126066)

### Enterprise & Industry
- [Rakuten: Claude Code](https://claude.com/customers/rakuten)
- [Claude Customer Stories](https://claude.com/customers)
- [VentureBeat: Claude Code 2.1.0](https://venturebeat.com/orchestration/claude-code-2-1-0-arrives-with-smoother-workflows-and-smarter-agents)
- [GitHub Changelog: Claude on GitHub](https://github.blog/changelog/2026-02-04-claude-and-codex-are-now-available-in-public-preview-on-github/)
