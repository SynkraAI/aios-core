# IDE/CLI Agent & Context Mechanisms - Comparative Research

**Date:** 2026-02-20
**Author:** @analyst (Alex)
**Status:** Research Complete
**Scope:** Claude Code, Codex CLI (OpenAI), Gemini CLI (Google), Cursor

---

## 1. Claude Code (Anthropic)

### Mechanism Table

| Mechanism | How It Works | Limitations | AIOS Usage |
|-----------|-------------|-------------|------------|
| **`CLAUDE.md`** | Auto-loaded project instructions file. Hierarchical: `~/.claude/CLAUDE.md` (global) > workspace `CLAUDE.md` > project `.claude/CLAUDE.md`. All levels concatenated into system context. | Always loaded = always consumes tokens. No conditional loading. Max practical size ~4-8K lines before degradation. | Heavily used. Project CLAUDE.md is v5.0 with constitution, agent registry, coding standards. |
| **`agents/`** (`.claude/agents/*.md`) | Subagent definitions with YAML frontmatter (`name`, `description`, `model`, `memory`, `skills`). Spawned via `@agent-name` (autonomous) or `/skill-name` (interactive). Each agent gets isolated context window via Task tool. | Frontmatter fields limited to fixed schema. Agent `.md` body IS the system prompt -- no external file loading guaranteed (Issue #24316). Parallel Bash calls in agents cause cascade failures on Windows. | 26 agents defined: `dev.md`, `architect.md`, `devops.md`, `squad.md`, etc. Each contains full YAML persona definition + activation instructions. |
| **`skills/`** (`.claude/skills/*/SKILL.md`) | Skill definitions invoked via `/skill-name`. YAML frontmatter: `name`, `description`, `context` (fork/inline), `agent`, `owner`, `intent`, `source`, `required-context`. Fork context = isolated subagent. | Skills are flat -- no skill composition or chaining natively. `required-context` files must be loaded manually by the skill body. No built-in skill dependency resolution. | 100+ skills defined: `dev-develop-story`, `architect-analyze-impact`, `aios-master-orchestrate`, etc. |
| **`commands/`** (`.claude/commands/**/*.md`) | Command definitions invoked via `/path:name`. Directory structure maps to invocation path (e.g., `.claude/commands/AIOS/agents/dev.md` = `/AIOS:agents:dev`). | Legacy mechanism -- skills are preferred. No frontmatter support (plain markdown only). Being phased out in favor of skills. | Used for AIOS agent commands and synapse manager. ~33 command files. |
| **`hooks/`** | Lifecycle hooks configured in `.claude/settings.json`. Events: `SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `PreCompact`, `Stop`. Hooks run external scripts (bash/node/python) via shell. | Hooks communicate via stdout JSON. Timeout limits (5-30s). Hook failures can block operations. Windows bash compatibility issues. No async hooks. | 6 hook events configured: session-start, user-prompt-submit, pre-compact (2 hooks), stop-quality-gate. 15 hook scripts in `.claude/hooks/`. |
| **`rules/`** (`.claude/rules/*.md`) | Glob-targeted context rules auto-loaded by Claude Code based on file patterns. Always injected when matching files are in scope. | No conditional logic -- rules are always-on or glob-matched. No priority/ordering control. Contributes to token bloat in long sessions. | 29 rule files: constitution, coding standards, agent authorities, workflow phases, keyword contexts. |
| **`memory`** | Frontmatter `memory: project` on agents enables persistent memory. Stored in `.claude/agent-memory/{id}/MEMORY.md`. Auto-injected on agent activation. 200-line limit with auto-compaction. | Limited to 200 lines. No structured memory (key-value). No cross-agent memory sharing. Manual `MEMORY.md` file -- no API. | Used by core agents (dev, architect, etc.). Agent memory files track patterns, known issues, session learnings. |
| **`frontmatter`** | YAML frontmatter in agent/skill files. Supported fields: `name`, `description`, `model`, `memory`, `skills`, `allowed-tools`, `context`, `agent`, `owner`, `intent`, `source`, `required-context`. | Schema is fixed by Claude Code -- cannot add custom fields. No validation of custom fields. Agent-scoped hooks in frontmatter are new (v2.1). | Extensively used. Every agent and skill has frontmatter defining its identity, capabilities, and context requirements. |
| **`settings.json`** | Project-level settings in `.claude/settings.json`. Configures hooks, permissions, allowed tools, denied tools. | Limited to hooks and permissions. No model routing, no feature flags, no custom configuration. | Configures all 4 hook events with their script paths and timeouts. |

### Key Strengths
- Most mature agent/persona system with full lifecycle hooks
- Isolated context windows via Task tool (true subagents)
- Rich frontmatter schema for agent identity
- Persistent memory per agent

### Key Weaknesses
- Token bloat from always-on rules + CLAUDE.md
- No native skill chaining or composition
- Windows bash compatibility issues with hooks
- Agent system prompt loading can fail (Issue #24316)

---

## 2. Codex CLI (OpenAI)

### Mechanism Table

| Mechanism | How It Works | Limitations | Build vs Leverage |
|-----------|-------------|-------------|-------------------|
| **`AGENTS.md`** | Project instructions file, equivalent to CLAUDE.md. Three-tier hierarchy: global (`~/.codex/AGENTS.md`), project (git root to CWD), merge order. `AGENTS.override.md` takes precedence at any level. | Freeform markdown only -- no structured frontmatter/schema. Max 32KB combined (`project_doc_max_bytes`). No conditional loading. | **Leverage** -- direct equivalent to CLAUDE.md. |
| **`AGENTS.override.md`** | Override file that takes precedence over `AGENTS.md` at same directory level. Allows temporary instruction swaps without deleting base guidance. | Only one override file per level. No merge strategy control. | **Leverage** -- useful pattern AIOS could adopt for temporary overrides. |
| **Skills** (`.agents/skills/`) | Open agent skills standard. `SKILL.md` with `name` + `description` frontmatter. Optional `scripts/`, `references/`, `assets/` dirs. `agents/openai.yaml` for UI metadata. Explicit (`/skills`, `$skill`) or implicit (auto-match) invocation. | Minimal frontmatter (only name + description required). No `context: fork` equivalent -- no isolated subagent per skill. `allow_implicit_invocation` can cause unwanted activations. | **Leverage** -- compatible with open agent skills standard. AIOS skills already follow similar pattern. |
| **Config** (`~/.codex/config.toml`) | TOML-based configuration. Model selection, sandbox mode, approval policy, MCP servers, history persistence, context window management, shell environment policy. Project-scoped via `.codex/config.toml`. | No hooks/lifecycle events in config. No agent persona definitions. No rule files. | **Build** -- AIOS needs richer configuration than TOML key-values. |
| **Slash Commands** | Custom team-specific shortcuts and prompts. | Limited documentation on definition format. | **Leverage** -- maps to AIOS commands. |
| **Multi-Agent** | Experimental parallel task execution through multi-agent configurations. | Marked as experimental. No documented agent persona system. No persistent memory per agent. | **Build** -- Codex multi-agent is too basic for AIOS orchestration needs. |
| **Session Resumption** | `codex resume` revisits prior conversations. Transcript preservation. | No persistent memory between sessions beyond transcripts. No structured memory. | **Build** -- AIOS needs richer memory than session transcripts. |
| **Fallback Filenames** | `project_doc_fallback_filenames` in config allows custom instruction file names (e.g., `TEAM_GUIDE.md`, `.agents.md`). | Static list -- not dynamic per context. | **Leverage** -- useful for AIOS to support multiple file discovery. |
| **MCP Servers** | Configured in `config.toml` with `mcp_servers.<id>.*`. Supports stdio and HTTP servers. Tool allow/deny lists. | Standard MCP integration, nothing unique. | **Leverage** -- standard MCP. |

### Key Strengths
- Clean TOML configuration with rich options
- Open agent skills standard (cross-tool compatible)
- `AGENTS.override.md` pattern for temporary overrides
- Strong sandbox and approval policy system

### Key Weaknesses
- No lifecycle hooks
- No agent persona/identity system
- No persistent memory per agent
- No rule files (glob-targeted context)
- Multi-agent is experimental and undocumented

---

## 3. Gemini CLI (Google)

### Mechanism Table

| Mechanism | How It Works | Limitations | Build vs Leverage |
|-----------|-------------|-------------|-------------------|
| **`GEMINI.md`** | Context file equivalent to CLAUDE.md. Three-tier hierarchy: global (`~/.gemini/GEMINI.md`), project (CWD to git root), subdirectory. All files concatenated. Supports `@file.md` imports for modularization. | No structured frontmatter. Pure markdown. Concatenation order can cause conflicts. No override mechanism like Codex. | **Leverage** -- direct equivalent. `@file.md` import syntax is a useful feature AIOS lacks. |
| **Configurable Context Filenames** | `settings.json` allows `context.fileName` to be an array: `["AGENTS.md", "CONTEXT.md", "GEMINI.md"]`. Searches for all listed names. | Must be statically configured. No glob patterns for discovery. | **Leverage** -- AIOS should support configurable context file names per IDE. |
| **`/memory` Commands** | Interactive memory management: `/memory show`, `/memory refresh`, `/memory add <text>`. Add appends to global GEMINI.md. | Not persistent structured memory -- just appends text to a file. No per-agent memory. No cross-session memory beyond file contents. | **Build** -- AIOS needs structured agent memory, not text appending. |
| **Skills** (`.gemini/skills/` or `.agents/skills/`) | Agent Skills standard (same as Codex). Three discovery tiers: workspace > user > extension. Progressive disclosure: metadata first, full SKILL.md loaded on activation. Interactive management via `/skills` commands. Installable from Git repos. | No agent persona per skill. No isolated context windows. Skill activation requires user confirmation prompt. | **Leverage** -- follows same open standard as Codex. |
| **Extensions** | Bundles of MCP server + context file + custom commands. Installable from GitHub or local paths. 90+ in marketplace. Provides "intelligence layer" over raw MCP connections. | Not autonomous agents -- instruction sets only. No lifecycle hooks. No decision-making capability. | **Leverage** -- good packaging model. AIOS could adopt extension bundling for squad distribution. |
| **MCP Servers** | Configured in `~/.gemini/settings.json`. Standard MCP integration. Extensions can bundle MCP servers. | Standard MCP, nothing unique beyond extension bundling. | **Leverage** -- standard MCP. |
| **Settings** (`~/.gemini/settings.json`) | JSON configuration for context file names, MCP servers, extensions. Project-level settings also supported. | No hooks, no agent definitions, no rule system. | **Build** -- AIOS needs richer settings. |
| **`.geminiignore`** | Controls which subdirectory context files are loaded, similar to `.gitignore` patterns. | Only affects context file discovery, not tool access. | **Leverage** -- useful pattern for controlling context scope. |

### Key Strengths
- `@file.md` import syntax for modular context files
- Extension marketplace with bundled MCP+context+commands
- Configurable context filenames (multi-name search)
- Open-source (full codebase on GitHub)
- Progressive skill disclosure (metadata-first loading)

### Key Weaknesses
- No lifecycle hooks
- No agent persona/identity system
- No persistent structured memory
- No rule files (glob-targeted context)
- No isolated context windows (no subagents)

---

## 4. Cursor (Anysphere)

### Mechanism Table

| Mechanism | How It Works | Limitations | Build vs Leverage |
|-----------|-------------|-------------|-------------------|
| **`.cursor/rules/*.mdc`** | Rule files with YAML frontmatter (`description`, `globs`, `alwaysApply`). Glob-targeted: rules only activate when matching files are in scope. Replaces deprecated `.cursorrules` single file. | `.mdc` is Cursor-proprietary format. No cross-tool compatibility. Limited frontmatter fields. | **Leverage** -- AIOS already generates `.cursor/rules/` via IDE sync. Similar concept to Claude Code rules. |
| **`.cursorrules`** (deprecated) | Single file at project root with all rules. Now deprecated in favor of `.cursor/rules/` directory. | Deprecated. Token-wasteful (all rules always loaded). | **Skip** -- deprecated. |
| **`AGENTS.md`** | Simple markdown file at repo root. Plain agent instructions without frontmatter. | No structured fields. No persona system. Just another rules file. | **Leverage** -- lightweight. |
| **Notepads** | Reusable prompt snippets stored in Cursor UI. Referenced via `@Notepad` in prompts. Shared across team via dashboard. | UI-only creation (not file-based). No CLI access. Not version-controlled. Beta feature. | **Skip** -- not file-based, not automatable by AIOS. |
| **Hooks** (`.cursor/hooks.json`) | Lifecycle hooks: `sessionStart`, `sessionEnd`, `beforeShellExecution`, `afterShellExecution`, `beforeReadFile`, `afterFileEdit`, `beforeSubmitPrompt`, `afterAgentResponse`, `afterAgentThought`. JSON config with command scripts. | Newer feature (v1.7+). Less mature than Claude Code hooks. Limited documentation. | **Leverage** -- AIOS should generate hooks.json via IDE sync renderer. |
| **Agent Mode** | Default mode where AI acts autonomously. Plans steps, reads files, writes code, runs commands. No explicit agent definitions -- single agent with rules context. | No multi-agent. No agent personas. No agent memory. Single unified agent only. | **Build** -- Cursor has no multi-agent system. AIOS must provide its own. |
| **Background Agents** | Async agent execution in cloud. Submits tasks that run independently. Results available later. | Requires Cursor Pro. Cloud-only execution. No local background agents. | **Skip** -- cloud-proprietary, not relevant for AIOS. |
| **Subagents** (`.cursor/agents/`) | Isolated context windows for specific tasks. Markdown files with YAML frontmatter (`name`, `description`, `model`, `readonly`, `is_background`). | Community pattern, not official. Limited documentation. No memory persistence. | **Leverage** -- AIOS should generate agent definitions here via IDE sync. |
| **`@Docs`** | Reference external documentation URLs. Cursor fetches and indexes them for context. | Requires manual URL addition. Not file-based. | **Skip** -- not relevant for AIOS agent system. |
| **User Rules** | Global rules set in Cursor Settings UI. Applied to all projects. | UI-only configuration. Not file-based for automation. | **Skip** -- not automatable. |
| **Team Rules** | Rules set in team dashboard. Shared across all team members. | Requires Cursor Business. Dashboard-only. | **Skip** -- proprietary team feature. |
| **MCP** | Standard MCP server integration configured in Cursor settings. | Standard MCP. | **Leverage** -- standard MCP. |

### Key Strengths
- Glob-targeted `.mdc` rules with frontmatter (most granular rule targeting)
- Rich lifecycle hooks (more events than Claude Code)
- Background agents for async execution
- Team rules for organization-wide standards

### Key Weaknesses
- No multi-agent persona system
- No persistent agent memory
- No skills/command system
- Many features are UI-only (Notepads, Team Rules, User Rules)
- `.mdc` format is proprietary

---

## 5. Summary Matrix

| Mechanism | Claude Code | Codex CLI | Gemini CLI | Cursor | Build vs Leverage |
|-----------|:-----------:|:---------:|:----------:|:------:|-------------------|
| **Project Instructions** | `CLAUDE.md` | `AGENTS.md` | `GEMINI.md` | `.cursor/rules/` | **Leverage ALL** -- generate per-IDE file via sync renderer |
| **Hierarchical Context** | Global > Workspace > Project | Global > Project (dir walk) | Global > Project > Subdir | Project rules only | **Leverage** -- all support hierarchy natively |
| **Override Mechanism** | None | `AGENTS.override.md` | None | `alwaysApply` flag | **Build** -- add override support to AIOS context system |
| **Agent Definitions** | `.claude/agents/*.md` (frontmatter) | None | None | `.cursor/agents/` (community) | **Build** -- only Claude Code has mature agent system. AIOS renders to each IDE format. |
| **Skills** | `.claude/skills/*/SKILL.md` | `.agents/skills/*/SKILL.md` | `.gemini/skills/` or `.agents/skills/` | None | **Leverage** -- open agent skills standard works across Codex+Gemini. Build for Claude Code (richer frontmatter). |
| **Commands** | `.claude/commands/**/*.md` | Slash commands | Extension commands | None | **Leverage** for Claude Code. Skip for others (skills preferred). |
| **Lifecycle Hooks** | 6 events (settings.json) | None | None | 9+ events (hooks.json) | **Leverage** Claude Code + Cursor. Build adapter layer for hook generation. |
| **Glob-Targeted Rules** | `.claude/rules/*.md` | None | None | `.cursor/rules/*.mdc` | **Leverage** both. Build rule-to-mdc renderer for Cursor. |
| **Persistent Memory** | `memory: project` frontmatter | Session transcripts only | `/memory add` (text append) | None | **Build** -- only Claude Code has real agent memory. AIOS memory system is unique value. |
| **Isolated Context** | Task tool (fork) | None | None | Subagents (community) | **Build** -- AIOS orchestration requires isolated contexts. Only Claude Code supports natively. |
| **Context File Imports** | None | None | `@file.md` syntax | None | **Build** -- adopt Gemini's import syntax for AIOS context files. |
| **MCP Integration** | settings.json + mcp.json | config.toml | settings.json | UI settings | **Leverage** -- standard MCP across all platforms. |
| **Extension/Plugin** | None | None | Extensions (MCP+context+commands) | None | **Build** -- adopt Gemini extension model for AIOS squad distribution. |
| **Model Selection** | `model` frontmatter per agent | `model` in config | Default model only | `model` in frontmatter | **Leverage** where available. |
| **Configuration Format** | JSON (settings.json) | TOML (config.toml) | JSON (settings.json) | JSON (hooks.json) + MDC | **Build** -- AIOS uses YAML (core-config.yaml). Render to each IDE's format. |

---

## 6. Validation Queries

Use these searches to validate and update findings:

```
# Claude Code
"Claude Code agents frontmatter schema 2026"
"Claude Code skills SKILL.md required-context fork 2026"
"Claude Code hooks PreToolUse PostToolUse agent-scoped 2026"
"Claude Code memory project agent-memory persistent 2026"

# Codex CLI
"Codex CLI AGENTS.md override hierarchy 2026"
"Codex CLI skills .agents openai.yaml implicit invocation 2026"
"Codex CLI multi-agent experimental configuration 2026"
"Codex CLI config.toml full reference 2026"

# Gemini CLI
"Gemini CLI GEMINI.md @file import syntax 2026"
"Gemini CLI extensions MCP context commands bundle 2026"
"Gemini CLI skills progressive disclosure activate_skill 2026"
"Gemini CLI settings.json context fileName array 2026"

# Cursor
"Cursor .mdc frontmatter globs alwaysApply description 2026"
"Cursor hooks.json lifecycle events beforeShellExecution 2026"
"Cursor subagents .cursor/agents frontmatter 2026"
"Cursor background agents async cloud execution 2026"
```

---

## 7. Recommendations for AIOS

### 7.1 Leverage Native Mechanisms (Do NOT Reinvent)

1. **Project instructions files** -- Continue generating `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, and `.cursor/rules/` via IDE sync renderers. Each IDE loads these natively. Cost: zero runtime overhead.

2. **Open Agent Skills standard** -- The `.agents/skills/` directory structure is shared between Codex and Gemini. AIOS should generate skills in this format alongside Claude Code's `.claude/skills/` format. One source definition, multiple renderers.

3. **MCP** -- All four IDEs support MCP. AIOS MCP servers work everywhere without adaptation.

4. **Lifecycle hooks** -- Claude Code and Cursor both have hooks. Generate `settings.json` (Claude) and `hooks.json` (Cursor) from a single AIOS hook definition. Codex and Gemini lack hooks -- AIOS cannot add them.

5. **Glob-targeted rules** -- Claude Code `.claude/rules/` and Cursor `.cursor/rules/*.mdc` both support glob-targeted context injection. Generate both from a single AIOS rule definition.

### 7.2 Build AIOS-Specific Capabilities (Unique Value)

1. **Multi-agent orchestration** -- No IDE has mature multi-agent with personas, authority boundaries, and delegation. AIOS's agent system (26 agents with constitutional authority) is a differentiator. Continue building agent definitions in `.aios-core/development/agents/` and render to each IDE's native format.

2. **Persistent structured memory** -- Only Claude Code has basic memory (`memory: project`, 200 lines). AIOS should build richer memory: structured key-value, cross-agent sharing, memory compaction strategies. Store in `.aios-core/` and inject into IDE context files.

3. **Skill composition and chaining** -- No IDE supports skill-to-skill chaining natively. AIOS workflows (task sequences) are unique. Continue building in `.aios-core/development/tasks/` and render individual steps as IDE skills.

4. **Context file imports** -- Adopt Gemini's `@file.md` import pattern for AIOS context modularity. Even if other IDEs don't support it natively, AIOS can pre-process imports during IDE sync rendering.

5. **Override mechanism** -- Adopt Codex's `AGENTS.override.md` pattern. Generate override files for temporary context changes (e.g., sprint-specific rules, experiment branches).

### 7.3 Architecture: Single Source, Multiple Renderers

```
.aios-core/                          # SINGLE SOURCE OF TRUTH
├── development/
│   ├── agents/{id}/{id}.md          # Agent definitions
│   ├── tasks/*.md                   # Task/skill definitions
│   └── templates/*.md               # Templates
├── core/
│   └── ide-sync/
│       ├── renderers/
│       │   ├── claude-code.js       # Generates .claude/*
│       │   ├── codex.js             # Generates .codex/* + AGENTS.md
│       │   ├── gemini.js            # Generates .gemini/* + GEMINI.md
│       │   └── cursor.js            # Generates .cursor/*
│       └── framework-config.yaml    # Renderer configuration
```

This architecture ensures:
- Agent definitions written ONCE in `.aios-core/`
- Each IDE gets native-format files via automated rendering
- No manual sync required between IDE configurations
- New IDEs supported by adding a new renderer

### 7.4 Priority Actions

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| P0 | Validate existing Claude Code renderer covers all mechanisms | Low | High |
| P1 | Build Codex renderer (AGENTS.md + .agents/skills/) | Medium | High |
| P1 | Build Gemini renderer (GEMINI.md + .gemini/skills/ + settings.json) | Medium | High |
| P1 | Update Cursor renderer for hooks.json + .cursor/agents/ | Medium | Medium |
| P2 | Implement context file import preprocessing (@file.md) | Low | Medium |
| P2 | Add AGENTS.override.md generation for temporary contexts | Low | Low |
| P3 | Build extension packaging for Gemini marketplace | High | Medium |
| P3 | Investigate Codex multi-agent API when it stabilizes | Low | Future |

---

## Sources

### Claude Code
- Project codebase: `C:\Users\AllFluence-User\Workspaces\AIOS\SynkraAI\aios-core-skill-first\.claude\`
- [Claude Code Hooks Documentation](https://platform.claude.com/docs/en/agent-sdk/hooks)
- [Claude Code Issue #26923 - PreToolUse hook behavior](https://github.com/anthropics/claude-code/issues/26923)

### Codex CLI (OpenAI)
- [Custom instructions with AGENTS.md](https://developers.openai.com/codex/guides/agents-md/)
- [Agent Skills](https://developers.openai.com/codex/skills/)
- [Configuration Reference](https://developers.openai.com/codex/config-reference/)
- [Advanced Configuration](https://developers.openai.com/codex/config-advanced/)
- [Codex CLI Features](https://developers.openai.com/codex/cli/features/)
- [Use Codex with the Agents SDK](https://developers.openai.com/codex/guides/agents-sdk/)

### Gemini CLI (Google)
- [Provide Context with GEMINI.md Files](https://google-gemini.github.io/gemini-cli/docs/cli/gemini-md.html)
- [Agent Skills - Gemini CLI](https://geminicli.com/docs/cli/skills/)
- [Gemini CLI Extensions Combine MCP with Context Engineering](https://www.theunwindai.com/p/gemini-cli-extensions-combine-mcp-with-context-engineering)
- [Gemini CLI GitHub Repository](https://github.com/google-gemini/gemini-cli)
- [MCP servers with the Gemini CLI](https://geminicli.com/docs/tools/mcp-server/)

### Cursor
- [Cursor AI Complete Guide 2025](https://medium.com/@hilalkara.dev/cursor-ai-complete-guide-2025-real-experiences-pro-tips-mcps-rules-context-engineering-6de1a776a8af)
- [Best Cursor AI Settings 2026](https://mindevix.com/ai-usage-strategy/best-cursor-ai-settings-2026/)
- [Cursor AI Review 2026](https://prismic.io/blog/cursor-ai)
- [How to Extend Cursor Agent Behavior with Lifecycle Hooks](https://aiengineerguide.com/blog/cursor-agent-lifecycle-hooks/)
- [Cursor 1.7 Adds Hooks for Agent Lifecycle Control](https://www.infoq.com/news/2025/10/cursor-hooks/)
- [Cursor Rules Guide](https://design.dev/guides/cursor-rules/)
- [Free AI .cursorrules & .mdc Config Generator](https://cursorrules.org/)
