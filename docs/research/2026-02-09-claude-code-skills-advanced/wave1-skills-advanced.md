# Deep Research: Claude Code Skills System - Advanced Patterns

**Date:** 2026-02-09
**Sources consulted:** 25+
**Pages read in depth:** 12

---

## TL;DR

- Skills are **prompt-based meta-tools**: organized folders with `SKILL.md` that inject instructions into conversation context, not executable functions
- Progressive disclosure loads skills in 3 levels: metadata (~100 tokens at startup), full SKILL.md (when triggered), bundled files (on demand)
- Dynamic injection (`$ARGUMENTS`, `$0`-`$N`, `!`command``, `@file`, `ultrathink`) enables powerful parameterization
- `context: fork` turns a skill into a **sub-agent constructor** with isolated execution
- Skill-scoped hooks (PreToolUse, PostToolUse, Stop) enable portable governance
- Skills follow the open [Agent Skills](https://agentskills.io) standard, adopted by OpenAI Codex CLI and others
- The plugin/marketplace system enables distribution and discovery of skill packs

---

## 1. Skill Structure & SKILL.md Format

### 1.1 Directory Layout

Every skill is a self-contained directory:

```
my-skill/
├── SKILL.md           # Main instructions (REQUIRED)
├── template.md        # Template for Claude to fill in
├── reference.md       # Detailed API docs (loaded on demand)
├── examples/
│   └── sample.md      # Example output
└── scripts/
    └── validate.sh    # Executable script
```

> "Every skill consists of a required SKILL.md file and optional bundled resources including scripts, references, and assets." -- [Official Docs](https://code.claude.com/docs/en/skills)

### 1.2 YAML Frontmatter - Complete Field Reference

```yaml
---
name: my-skill                    # Display name, becomes /slash-command
description: What this skill does # Critical for auto-discovery
argument-hint: "[issue-number]"   # Hint shown in autocomplete
disable-model-invocation: true    # Only user can invoke (no auto-trigger)
user-invocable: false             # Only Claude can invoke (hidden from / menu)
allowed-tools: Read, Grep, Glob   # Tool sandbox when skill is active
model: sonnet                     # Force specific model during skill
context: fork                     # Run in isolated subagent
agent: Explore                    # Which subagent type (with context: fork)
hooks:                            # Skill-scoped lifecycle hooks
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/check.sh"
---
```

**Field validation rules:**
- `name`: max 64 chars, lowercase letters/numbers/hyphens only, no XML tags, no reserved words ("anthropic", "claude")
- `description`: max 1024 chars, non-empty, no XML tags. Written in **third person** ("Processes files..." not "I process files...")
- All fields except `description` are optional

Source: [Extend Claude with skills](https://code.claude.com/docs/en/skills), [Best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)

### 1.3 Where Skills Live (Priority Order)

| Location | Path | Scope | Priority |
|----------|------|-------|----------|
| Enterprise | Managed settings | All org users | Highest |
| Personal | `~/.claude/skills/<name>/SKILL.md` | All your projects | 2 |
| Project | `.claude/skills/<name>/SKILL.md` | This project only | 3 |
| Plugin | `<plugin>/skills/<name>/SKILL.md` | Where plugin enabled | Namespaced |

When skills share the same name across levels, higher-priority wins. Plugin skills use `plugin-name:skill-name` namespace, so cannot conflict.

**Monorepo support:** Claude auto-discovers skills from nested `.claude/skills/` directories. E.g., editing `packages/frontend/src/app.tsx` also loads skills from `packages/frontend/.claude/skills/`.

**Additional directories:** Skills in `.claude/skills/` within `--add-dir` directories are loaded automatically with live change detection.

Source: [Official Docs](https://code.claude.com/docs/en/skills)

### 1.4 Skill Content Types

**Reference content** (inline, knowledge Claude applies):
```yaml
---
name: api-conventions
description: API design patterns for this codebase
---
When writing API endpoints:
- Use RESTful naming conventions
- Return consistent error formats
```

**Task content** (step-by-step instructions):
```yaml
---
name: deploy
description: Deploy the application to production
context: fork
disable-model-invocation: true
---
Deploy the application:
1. Run the test suite
2. Build the application
3. Push to the deployment target
```

Source: [Official Docs](https://code.claude.com/docs/en/skills)

---

## 2. Dynamic Injection System

### 2.1 String Substitutions

| Variable | Description | Example |
|----------|-------------|---------|
| `$ARGUMENTS` | All arguments passed when invoking | `/fix-issue 123` -> `$ARGUMENTS` = `123` |
| `$ARGUMENTS[N]` | Specific argument by 0-based index | `$ARGUMENTS[0]` for first arg |
| `$N` | Shorthand for `$ARGUMENTS[N]` | `$0`, `$1`, `$2` |
| `${CLAUDE_SESSION_ID}` | Current session ID | For logging, session-specific files |

**Example with positional arguments:**
```yaml
---
name: migrate-component
description: Migrate a component from one framework to another
---
Migrate the $0 component from $1 to $2.
Preserve all existing behavior and tests.
```

Running `/migrate-component SearchBar React Vue` replaces `$0` with `SearchBar`, `$1` with `React`, `$2` with `Vue`.

**If `$ARGUMENTS` is not present** in the content, Claude Code automatically appends `ARGUMENTS: <value>` to the end.

Source: [Official Docs](https://code.claude.com/docs/en/skills)

### 2.2 Dynamic Context Injection (`!`command``)

Shell commands execute **before** the skill content is sent to Claude. Output replaces the placeholder.

```yaml
---
name: pr-summary
description: Summarize changes in a pull request
context: fork
agent: Explore
allowed-tools: Bash(gh *)
---
## Pull request context
- PR diff: !`gh pr diff`
- PR comments: !`gh pr view --comments`
- Changed files: !`gh pr diff --name-only`

## Your task
Summarize this pull request...
```

> "This is preprocessing, not something Claude executes. Claude never sees the command. It only sees the output." -- [Official Docs](https://code.claude.com/docs/en/skills)

Source: [Official Docs](https://code.claude.com/docs/en/skills), [365i Guide](https://www.365iwebdesign.co.uk/news/2026/01/29/how-to-use-dynamic-context-injection-claude-code/)

### 2.3 Ultrathink (Extended Thinking)

Including the word `ultrathink` anywhere in skill content enables extended thinking mode (32K thinking tokens).

```yaml
---
name: architecture-review
description: Deep architecture analysis
context: fork
---
ultrathink

Analyze this codebase architecture...
```

Thinking levels: "think" (4K), "think hard"/"megathink" (10K), "ultrathink" (32K).

**Current status:** UltraThink keyword is now deprecated in favor of `/effort` for granular control (low/medium/high/max). Extended thinking is enabled by default with maximum budget.

Source: [Official Docs](https://code.claude.com/docs/en/skills), [claude-code-guide.com](https://www.claude-code-guide.com/)

---

## 3. Progressive Disclosure Architecture

### 3.1 Three-Level Loading

| Level | When Loaded | Token Cost | Content |
|-------|------------|------------|---------|
| **L1: Metadata** | Always (at startup) | ~100 tokens/skill | `name` + `description` from YAML frontmatter |
| **L2: Instructions** | When skill is triggered | <5K tokens | SKILL.md body |
| **L3: Resources** | As needed | Effectively unlimited | Bundled files (scripts executed, refs read) |

### 3.2 Internal Implementation

The `Skill` tool uses a **dynamic prompt generator** that constructs its description at runtime:

```javascript
// Simplified from source analysis
Pd = {
  name: "Skill",
  prompt: async () => fN2(),  // Dynamic generator aggregates all skill metadata
  call: async *(input, context) => { }
}
```

The `fN2()` function builds `<available_skills>` XML embedded in the Skill tool's description. Total skill descriptions constrained to ~15,000 characters (2% of context window, fallback 16,000 chars).

**Environment variable override:** `SLASH_COMMAND_TOOL_CHAR_BUDGET` to change the limit.

> "Skills aren't separate processes, sub-agents, or external tools: they're injected instructions that guide Claude's behavior within the main conversation." -- [Mikhail Shilkov](https://mikhail.io/2025/10/claude-code-skills/)

### 3.3 Invocation Flow

```
User request
  -> Claude evaluates <available_skills> via LLM reasoning (no algorithmic matching)
  -> Claude calls Skill tool: {"command": "my-skill"}
  -> Validation (5 error codes: empty, unknown, unloadable, disabled, non-prompt)
  -> Permission check (deny/allow/ask)
  -> Load SKILL.md content
  -> Inject messages:
     1. User-visible metadata (isMeta: false): "The 'my-skill' skill is loading"
     2. Hidden instructions (isMeta: true): Full skill content
     3. Permissions modifier: allowed-tools scoping
  -> Context modifier applies tool pre-approval + model override
  -> Claude follows instructions with enriched context
```

### 3.4 Dual-Message Injection

Skills inject **dual-channel** messages:
- **Visible message**: Status message shown in UI ("The skill is loading")
- **Hidden message** (`isMeta: true`): Full instructions sent to API but hidden from UI
- **Permissions message**: Scoped tool access for skill duration

Source: [Lee Han Chung Deep Dive](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/), [Mikhail Shilkov](https://mikhail.io/2025/10/claude-code-skills/)

### 3.5 Best Practices for Progressive Disclosure

- Keep SKILL.md **under 500 lines**
- Split into separate files when approaching the limit
- Reference files are **one level deep** from SKILL.md (avoid nested references)
- For files >100 lines, include a **table of contents** at top
- Use descriptive filenames: `form_validation_rules.md` not `doc2.md`

**Pattern: High-level guide with references:**
```markdown
## Advanced features
**Form filling**: See [FORMS.md](FORMS.md) for complete guide
**API reference**: See [REFERENCE.md](REFERENCE.md) for all methods
```

Claude loads FORMS.md or REFERENCE.md **only when needed**.

Source: [Best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)

---

## 4. Context Fork & Subagent Execution

### 4.1 How Context Fork Works

Adding `context: fork` to frontmatter makes the skill run in an **isolated subagent**. The skill content becomes the subagent's **task prompt**.

```yaml
---
name: deep-research
description: Research a topic thoroughly
context: fork
agent: Explore
---
Research $ARGUMENTS thoroughly:
1. Find relevant files using Glob and Grep
2. Read and analyze the code
3. Summarize findings with specific file references
```

**Execution flow:**
1. A new isolated context is created (separate conversation history)
2. Subagent receives skill content as its prompt
3. `agent` field determines execution environment (model, tools, permissions)
4. Results are summarized and returned to main conversation

> "`context: fork` only makes sense for skills with explicit instructions. If your skill contains guidelines like 'use these API conventions' without a task, the subagent receives the guidelines but no actionable prompt, and returns without meaningful output." -- [Official Docs](https://code.claude.com/docs/en/skills)

### 4.2 Available Agent Types

| Agent | Model | Tools | Purpose |
|-------|-------|-------|---------|
| `Explore` | Haiku | Read-only | Codebase search and analysis |
| `Plan` | Inherits | Read-only | Research for planning |
| `general-purpose` | Inherits | All | Complex multi-step tasks |
| Custom (`.claude/agents/`) | Configurable | Configurable | Domain-specific |

If `agent` is omitted, defaults to `general-purpose`.

### 4.3 Skill-in-Agent vs Agent-with-Skills

Two directions of composition:

| Approach | System Prompt | Task | Also Loads |
|----------|---------------|------|------------|
| Skill with `context: fork` | From agent type | SKILL.md content | CLAUDE.md |
| Subagent with `skills` field | Subagent's markdown body | Claude's delegation | Preloaded skills + CLAUDE.md |

**Skills in subagent frontmatter:**
```yaml
---
name: api-developer
description: Implement API endpoints following team conventions
skills:
  - api-conventions
  - error-handling-patterns
---
Implement API endpoints. Follow the conventions from preloaded skills.
```

Full skill content is **injected at startup** into the subagent, not just made available for invocation.

Source: [Official Docs](https://code.claude.com/docs/en/skills), [Subagents](https://code.claude.com/docs/en/sub-agents)

---

## 5. Skill-Agent Binding

### 5.1 The `agent:` Field

The `agent:` frontmatter field specifies which subagent configuration executes the skill when `context: fork` is set.

```yaml
---
name: security-audit
description: Run a security audit
context: fork
agent: security-specialist  # Custom agent from .claude/agents/
allowed-tools: Read, Grep, Glob, Bash(npm audit *)
---
```

### 5.2 Custom Agents as Skill Executors

Custom agents in `.claude/agents/` can be referenced by name:

```markdown
# .claude/agents/security-specialist.md
---
name: security-specialist
description: Security analysis expert
tools: Read, Grep, Glob, Bash
model: opus
---
You are a senior security engineer...
```

Then referenced in skill: `agent: security-specialist`

### 5.3 Subagent Frontmatter (Complete)

| Field | Description |
|-------|-------------|
| `name` | Unique identifier |
| `description` | When Claude delegates to this subagent |
| `tools` / `disallowedTools` | Allow/deny list |
| `model` | `sonnet`, `opus`, `haiku`, or `inherit` |
| `permissionMode` | `default`, `acceptEdits`, `delegate`, `dontAsk`, `bypassPermissions`, `plan` |
| `maxTurns` | Maximum agentic turns |
| `skills` | Skills preloaded at startup |
| `mcpServers` | MCP servers available |
| `hooks` | Lifecycle hooks scoped to subagent |
| `memory` | `user`, `project`, or `local` (persistent cross-session) |

Source: [Subagents docs](https://code.claude.com/docs/en/sub-agents)

---

## 6. Hooks in Skills

### 6.1 Skill-Scoped Hooks (Claude Code 2.1+)

Skills can define hooks **in frontmatter** that only run while the skill is active:

```yaml
---
name: secure-operations
description: Perform operations with security checks
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/security-check.sh"
  PostToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: "./scripts/run-linter.sh"
  Stop:
    - hooks:
        - type: prompt
          prompt: "Verify all tasks are complete: $ARGUMENTS"
---
```

### 6.2 Supported Hook Events in Skills

All hook events are supported in skill frontmatter:

| Event | Can Block? | Use Case |
|-------|-----------|----------|
| `PreToolUse` | Yes | Validate/block tool calls |
| `PostToolUse` | No (can prompt) | Lint after edits, log operations |
| `Stop` | Yes | Verify completion criteria |
| `PostToolUseFailure` | No | Error handling |
| Others | Varies | Full lifecycle coverage |

### 6.3 Hook Handler Types

| Type | Description |
|------|-------------|
| `command` | Run shell script, JSON input on stdin, exit codes control flow |
| `prompt` | Single-turn LLM evaluation, returns `{ok: true/false}` |
| `agent` | Multi-turn subagent with tool access (Read, Grep, Glob) |

### 6.4 Special Fields

| Field | Description |
|-------|-------------|
| `once` | If `true`, runs only once per session then removed (skills only, not agents) |
| `async` | If `true`, runs in background without blocking (command hooks only) |
| `timeout` | Seconds before canceling (defaults: 600 command, 30 prompt, 60 agent) |
| `statusMessage` | Custom spinner message while hook runs |

### 6.5 Governance Example

```yaml
---
name: safe-db-operations
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-readonly-query.sh"
---
```

The validation script blocks SQL write operations:
```bash
#!/bin/bash
COMMAND=$(jq -r '.tool_input.command' < /dev/stdin)
if echo "$COMMAND" | grep -iE '\b(INSERT|UPDATE|DELETE|DROP)\b' > /dev/null; then
  echo "Blocked: Write operations not allowed" >&2
  exit 2  # Blocks the tool call
fi
exit 0
```

Source: [Hooks reference](https://code.claude.com/docs/en/hooks), [Claude Code 2.1](https://paddo.dev/blog/claude-code-21-pain-points-addressed/)

---

## 7. Invocation Control

### 7.1 Who Can Invoke

| Frontmatter | User | Claude | When Loaded |
|-------------|------|--------|-------------|
| (default) | Yes | Yes | Description always in context, full skill on invocation |
| `disable-model-invocation: true` | Yes | No | Description NOT in context, loads when user invokes |
| `user-invocable: false` | No | Yes | Description always in context, loads when Claude invokes |

### 7.2 Permission Rules

Control via `/permissions`:

```
# Deny all skills
Skill

# Allow only specific skills
Skill(commit)
Skill(review-pr *)

# Deny specific skills
Skill(deploy *)
```

Syntax: `Skill(name)` for exact match, `Skill(name *)` for prefix match with arguments.

### 7.3 Tool Restriction

```yaml
---
name: safe-reader
description: Read files without making changes
allowed-tools: Read, Grep, Glob
---
```

Supports wildcard patterns: `Bash(git:*)`, `Bash(npm audit *)`.

Source: [Official Docs](https://code.claude.com/docs/en/skills)

---

## 8. Plugin & Marketplace System

### 8.1 Plugin Structure

Plugins package skills, agents, hooks, and MCP servers:

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json     # Plugin metadata
├── skills/
│   └── my-skill/
│       └── SKILL.md
├── agents/
│   └── my-agent.md
├── hooks/
│   └── hooks.json
└── README.md
```

### 8.2 Installation

```bash
# Register marketplace
/plugin marketplace add anthropics/skills

# Browse and install
/plugin install document-skills@anthropic-agent-skills
/plugin install example-skills@anthropic-agent-skills
```

### 8.3 Official Anthropic Marketplace

- `anthropics/skills` repo (66.5K stars)
- Categories: Creative & Design, Development & Technical, Enterprise & Communication, Document Skills
- Document skills (docx, pdf, pptx, xlsx) are source-available (Apache 2.0 for others)
- Partner skills: Notion

### 8.4 Community Registries

- [claude-plugins.dev](https://claude-plugins.dev/) - Community registry with CLI
- [skillsmp.com](https://skillsmp.com/) - Agent Skills Marketplace
- [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) - 300+ skills
- [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) - Curated list
- [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) - Official directory

Source: [anthropics/skills](https://github.com/anthropics/skills), [Plugin docs](https://code.claude.com/docs/en/discover-plugins)

---

## 9. Advanced Composition Patterns

### 9.1 Skill Composition (Multiple Skills Active)

Multiple skills can be loaded simultaneously. Claude evaluates all skill descriptions and loads relevant ones. No explicit "skill calling skill" mechanism -- composition happens through:

1. **Claude's evaluation**: Multiple skills loaded in parallel when relevant
2. **Subagent preloading**: `skills:` field in agent frontmatter injects multiple skills
3. **Sequential invocation**: User invokes skills in sequence; each runs in context

### 9.2 Pattern: Visual Output Generation

Skills can bundle scripts that generate visual HTML output:

```yaml
---
name: codebase-visualizer
description: Generate interactive tree visualization of codebase
allowed-tools: Bash(python *)
---
Run the visualization script:
```bash
python ~/.claude/skills/codebase-visualizer/scripts/visualize.py .
```
```

This pattern works for dependency graphs, test coverage reports, API docs, schema visualizations.

### 9.3 Pattern: Workflow Checklists

```markdown
## Deployment workflow

Copy this checklist:
```
- [ ] Step 1: Run test suite
- [ ] Step 2: Build application
- [ ] Step 3: Push to deployment
- [ ] Step 4: Verify deployment
```
```

### 9.4 Pattern: Conditional Workflows

```markdown
1. Determine modification type:
   **Creating new content?** -> Follow "Creation workflow"
   **Editing existing?** -> Follow "Editing workflow"
```

### 9.5 Pattern: Feedback Loops

```markdown
1. Make edits to document.xml
2. **Validate immediately**: `python scripts/validate.py`
3. If validation fails: fix, re-validate
4. **Only proceed when validation passes**
5. Rebuild output
```

### 9.6 Pattern: Domain-Specific Organization

```
bigquery-skill/
├── SKILL.md (overview and navigation)
└── reference/
    ├── finance.md (revenue metrics)
    ├── sales.md (pipeline data)
    ├── product.md (usage analytics)
    └── marketing.md (campaigns)
```

Claude reads only the relevant domain file based on user query.

Source: [Best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)

---

## 10. Technical Internals

### 10.1 Skill Tool Architecture

The Skill tool is a **meta-tool** -- a single entry in Claude's tools array that manages all individual skills:

```javascript
Pd = {
  name: "Skill",
  inputSchema: { command: string },
  prompt: async () => fN2(),  // Regenerated each API call
  call: async *(input, context) => { }  // Generator function
}
```

### 10.2 Context Modifier

When a skill executes, it yields a `contextModifier` that:
1. Injects `allowed-tools` into the session's always-allow rules
2. Overrides the model for the skill's duration
3. Automatically reverts after skill completion

```javascript
contextModifier(context) {
  // Inject allowed tools (pre-approval, no user prompt)
  // Override model for skill duration
  return modifiedContext;
}
```

### 10.3 Skill Filtering Logic

Skills must meet ALL criteria to appear in `<available_skills>`:
- `type === "prompt"` (only prompt-based)
- `isSkill === true`
- `!disableModelInvocation`
- Has `description` or `when_to_use`
- Built-ins only if `isModeCommand === true`

### 10.4 Undocumented Features

- `when_to_use` field: Appended to description with hyphen separator. Extensively used in code but undocumented. Possibly deprecated.
- `version` field: Metadata for tracking (e.g., `version: "1.0.0"`)
- `{baseDir}` variable: Auto-resolves to skill installation directory for portability
- `model: "inherit"`: Uses session's current model

### 10.5 Hot Reloading (Claude Code 2.1+)

Skills support automatic hot-reload. Saving a SKILL.md file immediately updates the skill in the running session. No restart needed.

Source: [Lee Han Chung](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/), [Mikhail Shilkov](https://mikhail.io/2025/10/claude-code-skills/)

---

## 11. Agent Skills Open Standard

### 11.1 Cross-Platform Compatibility

Skills follow the [Agent Skills](https://agentskills.io) open standard. Claude Code extends it with:
- Invocation control (`disable-model-invocation`, `user-invocable`)
- Subagent execution (`context: fork`, `agent:`)
- Dynamic context injection (`!`command``, `$ARGUMENTS`)
- Hooks in frontmatter

### 11.2 Adopted By

- **Anthropic Claude Code** (originator, October 2025)
- **OpenAI Codex CLI** (adopted December 2025)
- **ChatGPT** (adopted format)
- **Cursor** (compatible)
- **Antigravity** (compatible)
- **Gemini CLI** (compatible)

Source: [Agent Skills Standard](https://agentskills.io), [anthropics/skills](https://github.com/anthropics/skills)

---

## 12. Real-World Examples

### 12.1 Anthropic's Skill Creator

The `skill-creator` skill in the official repo is a meta-skill that helps create new skills:

```yaml
---
name: skill-creator
description: Guide for creating effective skills
---
```

It includes references to the full spec and templates.

### 12.2 Document Skills (Production-Grade)

Four source-available skills power Claude's document capabilities:
- `skills/docx` - Word documents
- `skills/pdf` - PDF files
- `skills/pptx` - PowerPoint presentations
- `skills/xlsx` - Excel spreadsheets

These demonstrate production-grade patterns: multi-file organization, bundled Python scripts, progressive disclosure with reference docs.

### 12.3 Hugging Face ML Pipeline

Hugging Face uses Claude Code Skills to run 1,000+ ML experiments per day:
> "How We Use Claude Code Skills to Run 1,000+ ML Experiments a Day" -- [Hugging Face Blog](https://huggingface.co/blog/sionic-ai/claude-code-skills-training)

### 12.4 Community Skill Categories

From the VoltAgent collection (300+ skills):
- **Development**: Git automation, testing, code review, CI/CD
- **Data**: SQL analysis, BigQuery, data visualization
- **Enterprise**: Communications, branding, documentation
- **Creative**: Art generation, music, design
- **Security**: Vulnerability scanning, code audit

Source: [anthropics/skills](https://github.com/anthropics/skills), [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills)

---

## 13. Best Practices Summary

### 13.1 Naming Conventions

**Recommended: Gerund form** (verb + -ing):
- `processing-pdfs`, `analyzing-spreadsheets`, `managing-databases`

**Acceptable:** `pdf-processing`, `process-pdfs`

**Avoid:** `helper`, `utils`, `tools`, `documents`

### 13.2 Description Writing

- Write in **third person**: "Processes Excel files and generates reports"
- Include **what it does** AND **when to use it**
- Include specific trigger terms/contexts
- Challenge each token: "Does Claude really need this?"

### 13.3 Progressive Disclosure Patterns

1. **High-level guide**: SKILL.md overview + links to detail files
2. **Domain-specific**: Organize by domain (finance.md, sales.md, product.md)
3. **Conditional details**: Basic in SKILL.md, advanced in linked files

### 13.4 Evaluation-Driven Development

1. Run Claude on tasks WITHOUT the skill (identify gaps)
2. Create 3+ evaluation scenarios
3. Write minimal instructions addressing gaps
4. Iterate: test with Claude B, refine with Claude A
5. Test across models (Haiku, Sonnet, Opus)

### 13.5 Anti-Patterns

- Windows-style paths (`\` instead of `/`)
- Offering too many options (provide defaults with escape hatches)
- Time-sensitive information (use "old patterns" section)
- Inconsistent terminology
- Deeply nested references (keep one level deep)
- Over-explaining (Claude already knows common patterns)
- Assuming tools are installed (list dependencies explicitly)

Source: [Best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)

---

## 14. Known Limitations & Issues

### 14.1 Discovery Reliability

Research shows "skills were never invoked in 56% of test cases." Description quality is critical for triggering.

Source: [alexop.dev](https://alexop.dev/posts/stop-bloating-your-claude-md-progressive-disclosure-ai-coding-tools/)

### 14.2 Context Budget

Total skill descriptions limited to ~2% of context window (fallback: 16,000 chars). Too many skills = some excluded.

### 14.3 Open Issues

- `context: fork` + `agent:` not fully honored by Skill tool invocation ([Issue #17283](https://github.com/anthropics/claude-code/issues/17283))
- Stop hooks in skills don't always fire ([Issue #19225](https://github.com/anthropics/claude-code/issues/19225))
- Skill-scoped hooks not triggered within plugins ([Issue #17688](https://github.com/anthropics/claude-code/issues/17688))
- No `claude --skill=name` flag to force specific skill ([noted limitation](https://paddo.dev/blog/claude-code-21-pain-points-addressed/))

### 14.4 Cross-Surface Availability

Skills **do not sync** across surfaces:
- Claude.ai skills are separate from API skills
- API skills are separate from Claude Code skills
- Claude Code skills are filesystem-based

---

## Sources

### Official Documentation
- [Extend Claude with skills - Claude Code Docs](https://code.claude.com/docs/en/skills)
- [Agent Skills Overview - Claude API Docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Hooks reference - Claude Code Docs](https://code.claude.com/docs/en/hooks)
- [Create custom subagents - Claude Code Docs](https://code.claude.com/docs/en/sub-agents)
- [Discover plugins - Claude Code Docs](https://code.claude.com/docs/en/discover-plugins)
- [Equipping agents with Agent Skills - Anthropic Engineering](https://claude.com/blog/equipping-agents-for-the-real-world-with-agent-skills)

### Official Repository
- [anthropics/skills - GitHub](https://github.com/anthropics/skills)
- [anthropics/claude-plugins-official - GitHub](https://github.com/anthropics/claude-plugins-official)
- [skill-creator SKILL.md](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md)

### Technical Deep Dives
- [Claude Agent Skills: A First Principles Deep Dive - Lee Han Chung](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/)
- [Inside Claude Code Skills: Structure, prompts, invocation - Mikhail Shilkov](https://mikhail.io/2025/10/claude-code-skills/)
- [Claude Skills: Technical Deep-Dive into Context Injection - Medium](https://medium.com/data-science-collective/claude-skills-a-technical-deep-dive-into-context-injection-architecture-ee6bf30cf514)

### Claude Code 2.1 Coverage
- [Build Agent Skills Faster with Claude Code 2.1 - Rick Hightower](https://medium.com/@richardhightower/build-agent-skills-faster-with-claude-code-2-1-release-6d821d5b8179)
- [Claude Code 2.1: The Pain Points? Fixed - Paddo.dev](https://paddo.dev/blog/claude-code-21-pain-points-addressed/)
- [Eric Buess on agent-scoped hooks](https://x.com/EricBuess/status/2009073718450889209)
- [Daniel San on skill hooks](https://x.com/dani_avila7/status/2009397544565305705)

### Progressive Disclosure & Architecture
- [Stop Bloating Your CLAUDE.md - alexop.dev](https://alexop.dev/posts/stop-bloating-your-claude-md-progressive-disclosure-ai-coding-tools/)
- [Claude Code Hooks: Complete Guide to All 12 Lifecycle Events](https://claudefa.st/blog/tools/hooks/hooks-guide)

### Community & Ecosystem
- [VoltAgent/awesome-agent-skills - 300+ skills](https://github.com/VoltAgent/awesome-agent-skills)
- [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills)
- [travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills)
- [claude-plugins.dev - Community Registry](https://claude-plugins.dev/)
- [skillsmp.com - Skills Marketplace](https://skillsmp.com/)
- [Agent Skills Standard](https://agentskills.io)

### Blog Posts & Tutorials
- [Dynamic Context Injection in Claude Code - 365i](https://www.365iwebdesign.co.uk/news/2026/01/29/how-to-use-dynamic-context-injection-claude-code/)
- [Skills vs Commands vs Subagents vs Plugins - Young Leaders](https://www.youngleaders.tech/p/claude-skills-commands-subagents-plugins)
- [How We Use Claude Code Skills for 1000+ ML Experiments - Hugging Face](https://huggingface.co/blog/sionic-ai/claude-code-skills-training)
- [Claude Skills are awesome - Simon Willison](https://simonwillison.net/2025/Oct/16/claude-skills/)
- [Skills explained: How Skills compares - Claude Blog](https://claude.com/blog/skills-explained)
- [Claude Skills: Custom Modules - DataCamp](https://www.datacamp.com/tutorial/claude-skills)
- [Skills Auto-Activation via Hooks - Paddo.dev](https://paddo.dev/blog/claude-skills-hooks-solution/)

---

## Gaps & Areas for Further Research

1. **Skill-to-skill communication**: No documented mechanism for skills to explicitly invoke other skills. Composition relies on Claude's natural evaluation.
2. **Performance benchmarks**: No published data on skill loading latency or token overhead per skill level.
3. **Enterprise deployment patterns**: Limited public documentation on managed settings for enterprise skill distribution.
4. **Skill versioning**: The `version` field exists but no version management or upgrade mechanisms documented.
5. **MCP + Skills integration**: Future roadmap mentions MCP server integration with skills, but no current implementation details.
6. **Agent SDK specifics**: Skills in the Agent SDK have filesystem-based configuration but limited documentation on advanced patterns.
7. **Skill testing framework**: No built-in evaluation runner despite evaluation-first development being recommended.
