# Wave 4: Community Deep Threads & Hidden Gems

> Deep research into community discussions, blog posts, videos, and hidden gems about Claude Code's advanced features. The wisdom of practitioners who have spent thousands of hours and millions of tokens.

**Date:** 2026-02-09
**Sources consulted:** 35+ unique URLs
**Pages deep-read:** 18 (via WebFetch)
**Coverage areas:** Reddit, Hacker News, Substack, Dev.to, GitHub, personal blogs, official docs

---

## TL;DR -- Top 15 Hidden Gems

1. **Boris Cherny runs 10-15 parallel Claude sessions** -- 5 local (each in its own `git checkout`) + 5-10 on claude.ai; a PostToolUse hook auto-runs `bun run format || true` after every edit
2. **MCP tools silently eat 8-30% of your context window** just by being registered, even when unused -- use `/context` to audit, disable unused servers immediately
3. **The `&` prefix offloads tasks to Claude Code on the Web** (v2.0.45+) -- continue local work, retrieve results later with `--teleport`
4. **Only `ultrathink` actually activates extended thinking** (31,999 tokens) -- "think hard" and "think" were disabled in v2.0.0
5. **Auto-compaction is "opaque and error-prone"** per power users -- disable it, use manual `/compact` at 70% context, or dump plans to markdown before `/clear`
6. **Reset context after every ~20 iterations** -- "performance craters after 20" according to practitioners who benchmarked it
7. **CLAUDE.md should be <60 lines** per HumanLayer research; LLMs reliably follow only ~150-200 instructions total, and Claude Code's system prompt already consumes ~50
8. **Slim the system prompt from 18k to 10k tokens** (save 5% context) using patch scripts, then disable auto-updates to preserve patches
9. **`/fork` and `--fork-session` clone conversations** for branching experiments; half-clone keeps only the later half to reduce context
10. **Episodic Memory plugin** (blog.fsck.com) archives conversations to a vector-searchable SQLite database via startup hooks + Haiku summarization subagent
11. **Ctrl+G opens prompts in your external editor** ($VISUAL or $EDITOR) -- massive for crafting complex prompts
12. **Ctrl+S "stashes" draft prompts** (like git stash) -- save draft, try alternative, auto-restore original
13. **`/sandbox` mode** eliminates all permission prompts within predefined boundaries -- define once, work freely
14. **The `opusplan` strategy** uses Opus for planning, auto-switches to Sonnet for implementation -- best cost/quality ratio
15. **Each MCP server adds ~14k tokens** (e.g., Linear MCP = 7% of 200k context) -- disabling unused MCPs during focused work is critical

---

## 1. Power User Workflows

### 1.1 Boris Cherny's Workflow (Creator of Claude Code)

Boris Cherny's workflow went viral in early 2026 and was covered by VentureBeat, InfoQ, and Slashdot. Key practices:

**Parallel Instance Architecture:**
- 5 local Claude Code sessions in terminal tabs, each in its own `git checkout` (not branches or worktrees)
- 5-10 additional sessions on claude.ai web interface
- ~10-20% of remote sessions are abandoned due to unexpected scenarios
- Uses system notifications to know when a Claude needs input

**Model Choice:**
- Exclusively uses **Opus 4.5 with thinking** for all coding tasks
- Prioritizes quality and reliability over Sonnet's faster execution
- Notes that Opus excels at tool usage despite longer individual response times

**Knowledge Preservation:**
- Each Anthropic team maintains a `CLAUDE.md` file (~2.5k tokens) in git
- Uses `@.claude` tag on colleague PRs to capture mistakes into CLAUDE.md
- Document includes "style conventions, design guidelines, PR template"

**Automation:**
- PostToolUse hook: `bun run format || true` after every edit
- Slash commands like `/commit-push-pr` executed dozens of times daily
- Commands "pre-compute git status and a few other pieces of info to make the command run quickly"

**Verification Loop:**
- "Claude tests every single change I land to claude.ai/code using the Claude Chrome extension"
- Opens a browser, tests the UI, iterates until the code works and UX feels good
- This approach improves final result quality by **2-3x**

**Permission Management:**
- Does NOT use `--dangerously-skip-permissions` for normal work
- Enables safe commands via `/permissions` for `bun run build:*` and `bun run test:*`
- Reserves the dangerous flag only for long-running sandbox tasks

> Source: [InfoQ - Inside Boris Cherny's Workflow](https://www.infoq.com/news/2026/01/claude-code-creator-workflow/)

### 1.2 The 45-Tip Framework (YK / CS Dojo)

YK's Claude Code tips repository (ykdojo/claude-code-tips) on GitHub has become the most comprehensive practitioner guide with 45 tips. Key advanced patterns:

**Context Economy:**
- **Tip 14: Slim system prompt** from ~18k tokens (9% of context) to ~10k tokens (5%) using patch scripts; disable auto-updates to preserve patches
- **Tip 7: Manual compaction** at 70% -- don't wait for auto-compact; create handoff documents summarizing work before fresh conversations
- **Tip 22: Fork conversations** with `/fork` or `--fork-session`; half-clone keeps only the later half for reduced context

**Workflow Multipliers:**
- **Tip 15: Git worktrees** for parallel branch work -- combine with multiple terminal tabs
- **Tip 8: Complete write-test cycles** using tmux for autonomous tasks like `git bisect`
- **Tip 20: Containers for risky tasks** -- run with `--dangerously-skip-permissions` in isolated environments

**Non-obvious Features:**
- **Tip 10: Gemini CLI as fallback** when Claude can't access certain sites -- create skills using tmux to invoke Gemini CLI
- **Tip 19: Notion as format bridge** -- paste text into Notion first to preserve links, then copy back for proper markdown
- **Tip 9: Cmd+A / Ctrl+A pattern** -- select all on webpages and paste directly when WebFetch fails

**Audit & Safety:**
- **Tip 33: Audit auto-approved commands regularly** -- check what you've allowed
- **Tip 27: Verification table** -- tell Claude: "Double check everything, every single claim and make a table of what you verified"

> Sources: [Substack - 32 Claude Code Tips](https://agenticcoding.substack.com/p/32-claude-code-tips-from-basics-to), [GitHub - claude-code-tips](https://github.com/ykdojo/claude-code-tips)

### 1.3 Shrivu Shankar's Feature-by-Feature Analysis

A practitioner who uses every Claude Code feature shared deep insights on his blog:

**CLAUDE.md as "Ad Space":**
- Treats token budget per tool as "selling ad space to teams"
- Mentions doc paths without embedding them to avoid bloating context
- Always provides alternatives instead of negative-only constraints
- "Start with guardrails, not a manual" -- only document what Claude gets wrong

**Context Management Philosophy:**
- Avoids auto-compaction as "opaque, error-prone"
- Creates external memory by dumping plans to markdown before clearing
- Fresh monorepo sessions consume ~20k baseline tokens (10%)

**Against Custom Subagents:**
- Custom subagents "gatekeep context" and force rigid workflows
- Prefers letting the main agent spawn task clones using built-in features
- Extensive custom commands "indicate failure in tool design"

**Hooks Philosophy:**
- Block-at-submit validation (testing passes before commits)
- Hint-based non-blocking feedback for other events
- Avoid blocking at write time -- let agents finish plans, then validate results

**MCP Minimalism:**
- Only uses MCP for stateful tools (e.g., Playwright)
- Replaces stateless APIs with simple CLIs
- "MCPs should act as secure data gateways, not API mirrors"

**SDK Power Pattern:**
- Runs `claude -p "change all refs from foo to bar"` in parallel across paths
- Uses SDK for building internal chat tools and rapid agent prototyping

> Source: [blog.sshh.io - How I Use Every Claude Code Feature](https://blog.sshh.io/p/how-i-use-every-claude-code-feature)

---

## 2. Community-Discovered Patterns

### 2.1 CLAUDE.md Best Practices (HumanLayer Research)

HumanLayer published the most rigorous research on CLAUDE.md effectiveness:

**The Instruction Budget:**
- Frontier LLMs reliably follow ~150-200 instructions
- Claude Code's system prompt already contains ~50 instructions
- That leaves ~100-150 instructions for YOUR CLAUDE.md
- HumanLayer's own CLAUDE.md is **less than 60 lines**

**The Filtering Problem:**
- Claude Code injects a system reminder saying context "may or may not be relevant"
- This tells the model to ignore non-universally-applicable instructions
- Result: task-specific instructions in CLAUDE.md are routinely ignored

**Progressive Disclosure Strategy:**
```
agent_docs/
  |- building_the_project.md
  |- running_tests.md
  |- code_conventions.md
  |- service_architecture.md
  |- database_schema.md
```
- Point Claude to files rather than embedding content
- "Prefer pointers to copies" -- use `file:line` references
- Don't include code snippets (they become outdated)

**Anti-patterns:**
- Never use `/init` to auto-generate CLAUDE.md -- it's "the highest leverage point"
- "Never send an LLM to do a linter's job" -- use hooks for formatting instead
- Don't fill with generic instructions like "write clean code"

> Source: [HumanLayer - Writing a Good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md)

### 2.2 The Advent Calendar Discoveries (24 Daily Tips)

The Claude Code Advent Calendar revealed several non-obvious features:

**Day 3: The `&` Prefix (v2.0.45+)**
- Prefix any prompt with `&` to offload to Claude Code on the Web
- Continue local work while the remote sandbox processes
- Transfer results back with "Open from CLI" button
- Model settings carry over between local and remote

**Day 4: Thinking Keywords Reality**
- ONLY `ultrathink` activates extended thinking mode (31,999 tokens)
- Previous keywords like "think hard" were **disabled in v2.0.0**
- Toggle thinking via Tab key in the interface
- `think` = 4k tokens, `think hard` = 10k (when working), `ultrathink` = 31,999

**Day 7: MCP Tool Context Tax**
- MCP tools consume 8-30% of context window just by being registered
- Even UNUSED tools pay this tax
- Use `/context` command to audit tool overhead
- Removing unused servers is the ONLY effective solution

**Day 13: Prompt Stashing (Ctrl+S)**
- Like git stash but for prompts
- Save draft, experiment with alternative, auto-restore original
- Enables risk-free prompt experimentation

**Day 16: Ctrl+G for External Editor**
- Opens prompts or Plan documents in preferred editor
- Uses $VISUAL (checked first), then $EDITOR fallback
- Massive productivity boost for complex prompt crafting

**Day 20: Auto-compact Buffer Size**
- Auto-compact reserves a buffer varying with `CLAUDE_CODE_MAX_OUTPUT_TOKENS`
- Default 32k buffer = 22.5% of 200k context
- Maximizing output tokens to 64k increases buffer to ~40%

**Day 21: Async Subagents (v2.0.60+)**
- Subagents execute asynchronously in background with notifications
- Enables parallel codebase exploration, concurrent code reviews
- Simultaneous search operations

> Source: [Dev.to - 24 Claude Code Tips Advent Calendar](https://dev.to/oikon/24-claude-code-tips-claudecodeadventcalendar-52b5)

### 2.3 Rules Directory with Glob Patterns (v2.0.64+)

Store topic-specific rules in `.claude/rules/` as Markdown files:

```yaml
---
paths: src/api/**/*.ts
---
# API Rules
- Always validate input parameters
- Return proper HTTP status codes
- Log errors with correlation IDs
```

Rules are conditionally loaded based on which files Claude is working with. This provides targeted guidance without bloating the main CLAUDE.md.

### 2.4 The `opusplan` Cost Strategy

Use Opus during plan mode for complex reasoning and architecture decisions, then automatically switch to Sonnet for code generation:

- Get Opus reasoning quality where it matters most (planning)
- Don't pay Opus rates for every line of code
- One of the most effective cost optimization strategies

### 2.5 Skill Activation via Hooks

A pattern discovered by the community forces skills to load reliably:

- A hook fires on session start
- It inspects the current context (directory, files, recent changes)
- Selects and activates the appropriate skill
- Bypasses Claude's probabilistic skill discovery (~50-80% reliable)
- Makes skill invocation 100% deterministic

> Source: [Medium - Claude Code Skill Activation Hook](https://medium.com/coding-nexus/claude-code-skill-activation-hook-force-skills-to-load-every-time-no-memory-required-e2bdfba37656)

---

## 3. Real User Experiences & Metrics

### 3.1 Success Metrics from Practitioners

**15 Tips from 6 Projects (Lukasz Fryc):**
- Features ship "5-10x faster" with proper CLAUDE.md + commands + hooks
- Perhaps "10-20 lines of hand-written code per day" while Claude generates thousands
- Custom commands are "the single biggest time saver after CLAUDE.md" (~15 commands across projects)
- "Lost 3 hours of work to a botched migration" before adopting commit-before-big-changes habit

**F22 Labs Productivity Report:**
- Code passes linting on first try with proper CLAUDE.md: 40% faster code review cycles
- Plan mode: 50% fewer refactors
- Sub-agents: 60% reduction in bugs reaching production, 45% faster delivery
- TDD by AI: 70% fewer production bugs, 90% test coverage vs 40% without
- `/compact` + `/clear` strategy: 30-50% reduction in token costs

**Token Management (Richard Porter):**
- Reset context after every 20 iterations -- "performance craters after 20"
- Lean CLAUDE.md at ~150 tokens covers essentials
- 50-70% token consumption reduction from just `/clear` between tasks + proper CLAUDE.md
- Linear MCP server alone = ~14,000 tokens (7% of 200K context window)

**Cost Benchmarks (2026):**
- Average: $6/developer/day
- 90% of users stay below $12/day
- Monthly: ~$100-200/developer with Sonnet 4.5
- Specification-driven development: 60-80% token savings vs iterative prompting

> Sources: [Dev.to - 15 Tips](https://dev.to/lukaszfryc/claude-code-best-practices-15-tips-from-running-6-projects-2026-9eb), [F22 Labs](https://www.f22labs.com/blogs/10-claude-code-productivity-tips-for-every-developer/), [Richard Porter](https://richardporter.dev/blog/claude-code-token-management)

### 3.2 Multi-Agent Real-World Experiences (Hacker News)

**The 9-Agent Java-to-C# Port:**
- Specialized roles: Manager, Product Owner, Scrum Master, Architect, etc.
- Different Claude models per agent
- User: "I never had this much fun watching AI agents at work (especially when CAB rejects implementations)"

**Context Isolation Consensus:**
- "Coding agents only get the information they actually need and nothing more"
- Prevents agents from becoming overwhelmed by full project context
- File-based task queues + git worktrees for parallel work without context collision

**Quality Concerns:**
- Claude generated plausible but incorrect code for test coverage, attempting to "reinvent Istanbul in a bash script" rather than installing the needed tool
- Plans often lack sufficient detail -- developers spend 30-60 min manually refining before execution
- Without proper documentation and interface constraints, agents "go down the wrong path" and compound errors

**Creative Patterns:**
- **Ping-pong collaboration:** Planning and coding agents exchange refined work multiple times before final execution
- **Async orchestration:** File-based task queues + git worktrees enable parallel agent work

> Source: [HN - Claude Code Swarms Discussion](https://news.ycombinator.com/item?id=46743908)

### 3.3 Honest Assessments (Hacker News Threads)

**Code Quality Dependencies:**
- Clean, well-structured codebases yield "much better" results
- Poorly maintained projects cause the model to struggle significantly

**Context Rot:**
- For complex projects, providing entire codebases becomes counterproductive
- One developer created tooling to "strip out function bodies and only feed relevant signatures and type definitions"

**Ghost Bugs Risk:**
- Non-reproducible bugs from AI-generated code
- One developer: "a key result...overwritten" only under specific access patterns
- "The type of edge case genAI-as-a-service might never notice"

**The Meta-Skills Concern:**
- "Specialized knowledge about using specific LLMs depreciates rapidly"
- Creates an "endless forever treadmill of model-chasing"
- Foundational engineering expertise remains durable

**Spec Completeness Challenge:**
- How to ensure LLMs complete full specifications and choose optimal paths?
- LLMs frequently overlook edge cases when given autonomy
- "The balance between human specification vs. agent autonomy" is THE key challenge

> Sources: [HN - Random Notes](https://news.ycombinator.com/item?id=46771564), [HN - LLM Workflow 2026](https://news.ycombinator.com/item?id=46570115)

### 3.4 Hackathon-Winning Setup

Affaan Mustafa won the Anthropic x Forum Ventures hackathon ($15K in API credits) by building zenith.chat in just 8 hours with Claude Code:

- Open-sourced as "Everything Claude Code" (42.9k stars)
- Key tactic: **don't enable all MCPs at once** -- context window shrinks from 200k to 70k with too many tools
- Functional prototypes take precedence over documentation
- Maximum team size: two developers

**Upcoming Hackathon (Feb 10-16, 2026):**
- Built with Opus 4.6: $100K in API credits
- 500 participants, each receiving $500 in credits
- Emphasis on technical creativity and concrete applications

> Source: [GitHub - everything-claude-code](https://github.com/affaan-m/everything-claude-code)

---

## 4. The Complete Environment Variables Reference

A community-maintained GitHub Gist documents **80+ environment variables** for Claude Code. Key undocumented/power-user variables:

### Core Configuration
| Variable | Description |
|----------|-------------|
| `ANTHROPIC_MODEL` | Override default model |
| `ANTHROPIC_SMALL_FAST_MODEL` | Model for quick operations (subagents) |
| `CLAUDE_CODE_MAX_OUTPUT_TOKENS` | Maximum response tokens (affects auto-compact buffer) |
| `CLAUDE_CODE_MAX_RETRIES` | Request retry attempts |
| `CLAUDE_CODE_SUBAGENT_MODEL` | Specific model for sub-agents |
| `CLAUDE_CODE_ACTION` | Permission mode: acceptEdits, plan, bypassPermissions, default |

### Context & Performance
| Variable | Description |
|----------|-------------|
| `MAX_THINKING_TOKENS` | Maximum thinking step tokens |
| `DISABLE_INTERLEAVED_THINKING` | Disable interleaved reasoning mode |
| `DISABLE_MICROCOMPACT` | Disable output compression formatting |
| `DISABLE_PROMPT_CACHING` | Disable caching optimization |
| `USE_API_CONTEXT_MANAGEMENT` | Enable API-level context optimization |

### Bash Execution
| Variable | Description |
|----------|-------------|
| `BASH_DEFAULT_TIMEOUT_MS` | Default command timeout |
| `BASH_MAX_OUTPUT_LENGTH` | Maximum output length |
| `BASH_MAX_TIMEOUT_MS` | Maximum allowed timeout |
| `CLAUDE_CODE_SHELL_PREFIX` | Shell command prefix |
| `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR` | Maintains project directory context |

### MCP Configuration
| Variable | Description |
|----------|-------------|
| `MCP_TIMEOUT` | General MCP operation timeout |
| `MCP_TOOL_TIMEOUT` | Tool-specific execution timeout |
| `MAX_MCP_OUTPUT_TOKENS` | Maximum output tokens for servers |
| `MCP_SERVER_CONNECTION_BATCH_SIZE` | Connection batch size |

### Telemetry & Observability
| Variable | Description |
|----------|-------------|
| `CLAUDE_CODE_ENABLE_TELEMETRY` | Enable telemetry collection |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OpenTelemetry exporter endpoint |
| `OTEL_METRICS_EXPORTER` | Metrics exporter (otlp, console) |
| `OTEL_LOGS_EXPORTER` | Logs exporter configuration |
| `OTEL_LOG_USER_PROMPTS` | Include user prompts in telemetry |
| `SENTRY_DSN` | Error reporting endpoint |

### Security & Network
| Variable | Description |
|----------|-------------|
| `CLAUDE_CODE_CLIENT_CERT` | Client certificate path (mTLS) |
| `CLAUDE_CODE_CLIENT_KEY` | Private key path |
| `CLAUDE_CODE_DISABLE_COMMAND_INJECTION_CHECK` | Disable injection security |
| `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` | Reduce network requests |
| `HTTP_PROXY` / `HTTPS_PROXY` | Proxy configuration |

### Cloud Providers
| Variable | Description |
|----------|-------------|
| `CLAUDE_CODE_USE_BEDROCK` | Enable AWS Bedrock backend |
| `CLAUDE_CODE_USE_VERTEX` | Enable Google Vertex AI backend |
| `ANTHROPIC_VERTEX_PROJECT_ID` | GCP project ID |
| `VERTEX_REGION_CLAUDE_4_1_OPUS` | GCP region for Opus 4.1 |

### IDE & Terminal
| Variable | Description |
|----------|-------------|
| `CLAUDE_CODE_AUTO_CONNECT_IDE` | Auto-connect to IDE |
| `CLAUDE_CODE_DISABLE_TERMINAL_TITLE` | Prevent title updates |
| `FORCE_CODE_TERMINAL` | Force CLI mode |
| `CHOKIDAR_USEPOLLING` | File watching method (polling vs native) |

### Experimental
| Variable | Description |
|----------|-------------|
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | Enable agent teams (set to 1) |
| `CLAUDE_CODE_REMOTE` | Set when running on Web (for hooks) |

> Source: [GitHub Gist - Claude Code Environment Variables](https://gist.github.com/unkn0wncode/f87295d055dd0f0e8082358a0b5cc467)

---

## 5. Community Tools & Extensions Ecosystem

### 5.1 The "Awesome Claude Code" Landscape

The ecosystem has exploded with multiple curated lists tracking 200+ tools:

**awesome-claude-code (hesreallyhim):** The canonical curated list covering:
- Agent Skills (14+ specialized skill packages)
- Workflows & Knowledge Guides (30+ general + Ralph methodology)
- Tooling (25+ general tools + IDE integrations + usage monitors + orchestrators)
- Status Lines (5 custom implementations)
- Hooks (9 specialized hooks)
- Slash Commands (organized by domain)
- CLAUDE.md templates
- Alternative clients

**awesome-claude-code-toolkit (rohitg00):** The largest collection with 379+ resources:
- 135 agents across 10 categories
- 120 production-ready plugins
- 35 curated skills + 15,000 via SkillKit integration
- 42 commands, 19 hooks, 15 rules, 7 templates, 6 MCP configs

> Sources: [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code), [awesome-claude-code-toolkit](https://github.com/rohitg00/awesome-claude-code-toolkit)

### 5.2 Top MCP Servers (Community Consensus)

Based on multiple "best MCP servers" lists:

| MCP Server | Category | Why Essential |
|------------|----------|---------------|
| **GitHub** | Development | PR management, issue tracking, CI/CD without leaving terminal |
| **PostgreSQL** | Database | Natural language SQL queries |
| **Supabase** | Database | 20+ tools: migrations, branching, type generation |
| **Figma** | Design | Live layer structure, design-to-code conversion |
| **Playwright/Puppeteer** | Testing | Browser automation, UI testing, scraping |
| **Sequential Thinking** | Reasoning | Structured step-by-step problem solving |
| **Memory Bank** | Persistence | Cross-session context retention |
| **Sentry** | Monitoring | Error tracking, issue analysis |
| **Notion** | PM | Task management, spec retrieval |
| **Brave Search** | Search | Web search via Brave API |

**Critical insight:** MCP Tool Search (2026 feature) reduces token overhead by 85% through dynamic tool discovery instead of loading all definitions upfront.

> Source: [Apidog - Top 10 MCP Servers](https://apidog.com/blog/top-10-mcp-servers-for-claude-code/)

### 5.3 Notable Community Tools

**Orchestrators:**
- **Claude Flow** (ruvnet): Multi-agent swarm platform with RAG integration
- **Claude Squad**: Terminal app managing multiple workspace agents
- **Claude Task Master**: Task management for AI development
- **Claude Task Runner**: Context isolation for focused execution
- **TSK**: Rust-based sandboxed task manager

**Usage Monitors:**
- **ccusage**: CLI dashboard for cost/token analysis
- **ccflare**: Web-UI usage dashboard
- **Claudex**: Browser-based conversation explorer
- **viberank**: Community usage leaderboard

**Memory & Persistence:**
- **Episodic Memory** (blog.fsck.com): Vector-searchable SQLite archive of conversations via startup hooks + Haiku subagent
- **claude-mem** (thedotmack): PostToolUse hook, SQLite+Chroma, 3-layer progressive retrieval (~10x token savings)
- **Claude Session Restore**: Context recovery from previous sessions

**IDE Integration:**
- **claude-code.nvim**: Seamless Neovim integration
- **claude-code-ide.el**: Emacs integration with diagnostics
- **Claude Code Chat**: Elegant VS Code interface
- **crystal**: Desktop orchestration application

**Status Lines:**
- **CCometixLine**: Rust-based high-performance statusline
- **claude-powerline**: Vim-style powerline with tracking
- **claudia-statusline**: Rust persistence with cloud sync

**Hooks:**
- **CC Notify**: Desktop notifications with VS Code jump-back
- **Claude Code Hook Comms**: Real-time multi-agent communication
- **TDD Guard**: Monitors and blocks TDD violations
- **TypeScript Quality Hooks**: Real-time compilation and formatting
- **Claudio**: OS-native sound feedback system
- **Britfix**: Context-aware British English conversion

> Source: [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)

### 5.4 The Ralph Wiggum Methodology

A surprisingly popular autonomous coding methodology with its own ecosystem:

- **ralph-orchestrator**: Robust orchestration system (cited in Anthropic docs)
- **Ralph for Claude Code**: Autonomous framework with safety guardrails
- **The Ralph Playbook**: Comprehensive theoretical and practical guide
- **ralph-wiggum-bdd**: Standalone Bash script for BDD sync
- **Ralph Wiggum Marketer**: Autonomous copywriter integration

The methodology centers on loop-based autonomous development with built-in safety mechanisms.

---

## 6. Hidden Documentation & Undocumented Features

### 6.1 Keyboard Shortcuts & Interface Tricks

| Shortcut | Action |
|----------|--------|
| `Shift+Tab` | Cycle modes: Edit -> Plan -> Auto-accept |
| `Shift+Tab x2` | Enter Plan mode (read-only exploration) |
| `Tab` | Toggle thinking on/off |
| `Ctrl+G` | Open prompt in external editor ($VISUAL/$EDITOR) |
| `Ctrl+S` | Stash current prompt draft |
| `Ctrl+V` | Paste clipboard images (NOT Cmd+V on Mac for this) |
| `Escape` | Stop Claude's current generation |
| `Escape x2` | Browse and jump to previous conversations |
| `Up Arrow` | Navigate previous messages across sessions |
| `&` prefix | Offload task to Claude Code on the Web |
| `#` prefix | Save memory to CLAUDE.md file |
| `Shift+drag` | Reference file in prompt |

### 6.2 Undocumented CLI Flags & Features

| Flag/Feature | Description |
|--------------|-------------|
| `--fork-session` | Clone a conversation at a specific point |
| `--teleport` | Retrieve results from web-offloaded tasks |
| `--agent` | Configure main thread as specialized agent (v2.0.59+) |
| `--agents` | Pass agent definitions as JSON for session-only agents |
| `/output-style explanatory` | Get insight boxes explaining decisions |
| `/output-style learning` | Mark items for your own implementation |
| `/rewind` | Rollback conversation and code state to checkpoint |
| `/chrome` | Launch Chrome integration (v2.0.72+) |
| `/sandbox` | Restrict access to working directory + permitted paths |
| `/context` | Show what's consuming context window |
| `/stats` | Show session statistics |
| `cleanupPeriodDays: 99999` | Effectively disable conversation cleanup |

### 6.3 The Auto-compact Buffer Formula

Auto-compact reserves a buffer that varies with `CLAUDE_CODE_MAX_OUTPUT_TOKENS`:
- Default 32k output tokens -> 22.5% of 200k context reserved as buffer
- 64k output tokens -> ~40% reserved as buffer
- This means less space for actual conversation before auto-compact fires
- Power users set output tokens deliberately based on task type

### 6.4 Session Storage Location

Conversations stored as `.jsonl` files in `~/.claude/projects/`. You can:
- Search with bash commands across all sessions
- Ask Claude directly about past discussions
- Archive with episodic memory tools
- Export for analysis

### 6.5 CLAUDE.md Loading Hierarchy

1. `./CLAUDE.md` (project root)
2. `./.claude/CLAUDE.md` (project claude dir)
3. Nested directory CLAUDE.md files (loaded when operating in that directory)
4. `~/.claude/CLAUDE.md` (user-level)
5. `.claude/rules/*.md` (conditional rules with glob patterns, v2.0.64+)
6. Agent MEMORY.md (first 200 lines, for agents with memory: field)

### 6.6 Permission Configuration

In `~/.claude/settings.json`:
```json
{
  "permissions": {
    "deny": ["rm", "DROP TABLE", "DELETE FROM"],
    "ask": ["git push", "npm publish"]
  }
}
```

---

## 7. Cost Optimization Compendium

### 7.1 Token Economy Rules

1. **One task per session** -- prevents carrying irrelevant context
2. **`/clear` between distinct tasks** -- fresh start each time
3. **`/compact` at 70% context** -- don't wait for auto-compact
4. **Lean CLAUDE.md (<150 tokens)** -- only essentials
5. **`@` file references** -- explicit paths vs asking Claude to search
6. **Disable unused MCP servers** -- each adds 8-30% overhead
7. **Batch multiple edits together** -- rather than sequential single changes
8. **Specification-driven development** -- 60-80% savings vs iterative prompting
9. **Pre-tool-use hooks with delays** -- allows intervention before tokens burn on wrong solutions
10. **Git as safety net** -- frequent commits enable aggressive `/clear` without losing work

### 7.2 Subscription Optimization (2026)

| Tier | Price | Strategy |
|------|-------|----------|
| Pro | $20/mo | Keep sessions <30K tokens, Sonnet for most work |
| Max 5x | $100/mo | Opus for planning, Sonnet for implementation |
| Max 20x | $200/mo | Full Opus, parallel sessions, agent teams |
| API | Pay-per-use | SDK scripts, batch operations |

### 7.3 The GitIngest Trick

Summarizing external repositories with GitIngest saves 98% of tokens compared to manually loading files. A 64K repository becomes a concise summary that Claude can reason about without consuming the full context.

---

## 8. The Cursor/Copilot/Claude Code Landscape (2026)

### 8.1 Two Philosophies

**IDE-Integrated (Cursor/Copilot):** AI embedded within the editor
- Cursor: VS Code fork with AI as first-class citizen; migration from VS Code takes minutes
- Copilot: Fastest suggestions, broadest adoption

**Terminal-Native (Claude Code):** Autonomous agent in the terminal
- Analyzes entire codebases, creates files, runs tests, makes git commits
- Works without constant human oversight
- Excels with massive codebases (tested on 18,000-line React components)

### 8.2 Complementary Usage Pattern

The most common pattern among power users is NOT choosing one tool:

> "Use Cursor for day-to-day editing and exploration while running Claude Code for heavy-lifting tasks like documentation generation, test suite fixes, or large refactors."

### 8.3 Adoption Trends

Google Trends January 2026:
- Claude Code pulling ahead with search scores of 75-90
- Breakout queries: "claude cowork", "claude code simplifier"
- Points to wider adoption beyond early adopters

---

## 9. Recommendations for MMOS

Based on all community findings, prioritized recommendations for the MMOS project:

### 9.1 Immediate Actions (This Week)

1. **Audit CLAUDE.md length** -- currently likely over the 60-line sweet spot; apply progressive disclosure to move domain-specific content to `.claude/rules/` with glob patterns

2. **Add glob-patterned rules** -- create `.claude/rules/` files for:
   - `paths: squads/**/*.py` -- Python/ETL rules
   - `paths: app/**/*.tsx` -- React component rules
   - `paths: docs/**/*.md` -- Documentation rules

3. **Create `/compact-handoff` command** -- automated handoff document generation before `/clear`, preserving key decisions and state

4. **Audit MCP servers** -- run `/context` to see token overhead; disable unused servers during focused work sessions

5. **Add PostToolUse formatting hook** -- like Boris Cherny's `bun run format || true` pattern

### 9.2 Medium-Term Improvements (Next 2 Weeks)

6. **Implement episodic memory** -- install the Superpowers episodic-memory plugin or build equivalent with startup hooks + SQLite

7. **Create skill activation hook** -- deterministic skill loading via hooks instead of relying on Claude's probabilistic discovery

8. **Build cost monitoring** -- integrate ccusage or ccflare for token consumption tracking

9. **Set up git worktrees** -- for parallel Claude Code sessions on different features

10. **Create project-specific MCP** -- for MMOS-specific operations (state management, mind operations) as a secure data gateway

### 9.3 Strategic Patterns

11. **Adopt the "20 iteration reset" rule** -- track iterations and suggest `/compact` proactively

12. **Use `opusplan` strategy** -- Opus for architecture/planning, Sonnet for implementation

13. **Build verification hooks** -- "Double check everything" pattern as an automated post-implementation step

14. **Progressive disclosure for agents** -- keep agent definitions lean, point to detailed docs

15. **Community tool integration** -- evaluate Claude Task Runner for context isolation and TDD Guard for test enforcement

---

## 10. Sources

### Primary Sources (Deep-Read)
- [Substack - 32 Claude Code Tips (YK)](https://agenticcoding.substack.com/p/32-claude-code-tips-from-basics-to)
- [GitHub - 45 Claude Code Tips](https://github.com/ykdojo/claude-code-tips)
- [Dev.to - 15 Tips from 6 Projects](https://dev.to/lukaszfryc/claude-code-best-practices-15-tips-from-running-6-projects-2026-9eb)
- [Builder.io - How I Use Claude Code](https://www.builder.io/blog/claude-code)
- [HumanLayer - Writing a Good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md)
- [awesome-claude-code (GitHub)](https://github.com/hesreallyhim/awesome-claude-code)
- [blog.sshh.io - How I Use Every Claude Code Feature](https://blog.sshh.io/p/how-i-use-every-claude-code-feature)
- [Dev.to - 24 Claude Code Tips Advent Calendar](https://dev.to/oikon/24-claude-code-tips-claudecodeadventcalendar-52b5)
- [GitHub Gist - Environment Variables](https://gist.github.com/unkn0wncode/f87295d055dd0f0e8082358a0b5cc467)
- [InfoQ - Boris Cherny's Workflow](https://www.infoq.com/news/2026/01/claude-code-creator-workflow/)
- [Apidog - Top 10 MCP Servers](https://apidog.com/blog/top-10-mcp-servers-for-claude-code/)
- [awesome-claude-code-toolkit (GitHub)](https://github.com/rohitg00/awesome-claude-code-toolkit)
- [Richard Porter - Token Management](https://richardporter.dev/blog/claude-code-token-management)
- [blog.fsck.com - Episodic Memory](https://blog.fsck.com/2025/10/23/episodic-memory/)
- [Dev.to - Ultimate Tips Collection (Advent 2025)](https://dev.to/damogallagher/the-ultimate-claude-code-tips-collection-advent-of-claude-2025-5b73)
- [F22 Labs - 10 Productivity Tips](https://www.f22labs.com/blogs/10-claude-code-productivity-tips-for-every-developer/)
- [creatoreconomy.so - 20 Tips](https://creatoreconomy.so/p/20-tips-to-master-claude-code-in-35-min-build-an-app)

### Hacker News Discussions
- [HN - Claude Code Swarms](https://news.ycombinator.com/item?id=46743908)
- [HN - Random Notes from Claude Coding](https://news.ycombinator.com/item?id=46771564)
- [HN - LLM Coding Workflow 2026](https://news.ycombinator.com/item?id=46570115)
- [HN - Klaus Agentic Harness](https://news.ycombinator.com/item?id=46760506)
- [HN - Claude Code Native LSP](https://news.ycombinator.com/item?id=46355165)

### Secondary Sources (Snippets/References)
- [VentureBeat - Boris Cherny's Workflow](https://venturebeat.com/technology/the-creator-of-claude-code-just-revealed-his-workflow-and-developers-are)
- [GitHub - Njengah/claude-code-cheat-sheet](https://github.com/Njengah/claude-code-cheat-sheet)
- [mlearning.substack.com - 20+ CLI Tricks](https://mlearning.substack.com/p/20-most-important-claude-code-tricks-2025-2026-cli-january-update)
- [Claude Code Official Docs](https://code.claude.com/docs/en/common-workflows)
- [ClaudeLog](https://claudelog.com/)
- [AwesomeClaude.ai](https://awesomeclaude.ai/awesome-claude-code)
- [GitHub - ComposioHQ/awesome-claude-plugins](https://github.com/ComposioHQ/awesome-claude-plugins)
- [GitHub - BehiSecc/awesome-claude-skills](https://github.com/BehiSecc/awesome-claude-skills)
- [Claude Code Docs - Memory](https://code.claude.com/docs/en/memory)
- [Claude Code Docs - Costs](https://code.claude.com/docs/en/costs)
- [Claude Code Docs - Skills](https://code.claude.com/docs/en/skills)
- [claudefa.st - Best Addons](https://claudefa.st/blog/tools/mcp-extensions/best-addons)

---

## 11. Gaps & Areas for Further Research

1. **Quantitative benchmarks for CLAUDE.md length vs performance** -- HumanLayer mentions <60 lines and ~150 instruction limit, but no controlled study exists
2. **Plugin system maturity** -- still early; community fragmented across multiple curated lists with overlap
3. **Agent teams in production** -- most testimonials are experimental/hackathon; no production case studies beyond Anthropic's own C compiler
4. **Token cost tracking tools comparison** -- ccusage vs ccflare vs built-in `/usage` -- no head-to-head evaluation
5. **Skills vs MCP for stateless tools** -- Shankar argues for CLI wrappers over MCP; needs more data points
6. **Cross-model orchestration** -- using Gemini CLI as fallback (Tip 10) is creative but fragile; needs a more robust multi-model strategy
7. **Windows/Linux ecosystem** -- most community tools and workflows are Mac-centric; Windows support varies
8. **Long-running session strategies** -- beyond the "20 iteration reset" heuristic, no systematic study of context degradation curves
