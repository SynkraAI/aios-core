# Wave 2: Official Skills Ecosystem Deep-Dive

> anthropics/skills, agentskills.io Open Standard, Plugin Marketplace Architecture, ComposioHQ Integrations, Skill Generators
> Sources: 15+ pages fully read, 7 parallel search waves

---

## TL;DR

- **Agent Skills is an open standard** (agentskills.io) published Dec 18, 2025 by Anthropic. Adopted within 2 months by OpenAI Codex, Cursor, GitHub Copilot, Gemini CLI, Windsurf, and 10+ others.
- **Specification is deliberately tiny**: SKILL.md + YAML frontmatter (name + description required), optional scripts/, references/, assets/. The entire spec reads in minutes.
- **Progressive disclosure is the core design principle**: metadata (~100 tokens) always loaded, SKILL.md body (<5k tokens) on trigger, bundled files on demand. Context window treated as "public good."
- **Plugin system wraps skills** for distribution: marketplace.json catalogs -> plugin.json manifests -> skills/agents/hooks/MCP/LSP components. Git-based distribution, with `${CLAUDE_PLUGIN_ROOT}` for path resolution.
- **skills.sh** (by Vercel) is the primary distribution hub: 339+ skills indexed, `npx skills add` CLI, leaderboard by install count. Tens of thousands of installs at launch.
- **ComposioHQ** provides 500+ app integrations as skills (CRM, PM, email, social, e-commerce, DevOps, etc.)
- **claude-code-skill-factory** automates skill creation with 6 factory types, 69 prompt presets, and cross-platform Codex bridge.

---

## 1. anthropics/skills Repository (66.5k stars)

### Repository Structure

```
anthropics/skills/          (Apache 2.0 + source-available for docs)
├── .claude-plugin/         # Claude plugin configuration (marketplace entry)
├── skills/                 # Skill examples by category
│   ├── skill-creator/      # Meta-skill: creates new skills
│   ├── docx/               # Word docs (source-available license)
│   ├── pdf/                # PDF processing (source-available license)
│   ├── pptx/               # PowerPoint (source-available license)
│   └── xlsx/               # Excel (source-available license)
├── spec/                   # Redirects to agentskills.io/specification
├── template/               # Starter template for new skills
├── README.md
└── THIRD_PARTY_NOTICES.md
```

**Source**: [anthropics/skills GitHub](https://github.com/anthropics/skills)

### Key Statistics

| Metric | Value |
|--------|-------|
| Stars | 66.5k |
| Forks | 6.6k |
| Language | Python 91.3%, HTML 4.5%, Shell 2.5%, JS 1.7% |
| Contributors | 7 |
| Open Issues | 99 |
| Open PRs | 153 |
| Commits | 20 (main branch) |

### Licensing Model

- **Most skills**: Apache 2.0 (open source)
- **Document skills** (docx, pdf, pptx, xlsx): Source-available (NOT open source). Included as reference for production-grade complexity.

### Installation in Claude Code

```bash
# Register as marketplace
/plugin marketplace add anthropics/skills

# Install skill packs
/plugin install document-skills@anthropic-agent-skills
/plugin install example-skills@anthropic-agent-skills

# Usage
"Use the PDF skill to extract the form fields from path/to/file.pdf"
```

### The skill-creator Meta-Skill

The `skill-creator` is the most important skill in the repo -- it teaches Claude how to create new skills. Key insights from its SKILL.md:

**Frontmatter**:
```yaml
name: skill-creator
description: Guide for creating effective skills. This skill should be used when
  users want to create a new skill (or update an existing skill) that extends
  Claude's capabilities with specialized knowledge, workflows, or tool integrations.
license: Complete terms in LICENSE.txt
```

**Core principles it teaches**:

1. **"Claude is already very smart"** -- Only add context Claude doesn't already have. Challenge: "Does this paragraph justify its token cost?"

2. **Degrees of Freedom** -- Match specificity to fragility:
   - High freedom (text instructions): multiple valid approaches
   - Medium freedom (pseudocode/scripts): preferred pattern exists
   - Low freedom (exact scripts): fragile/critical operations

3. **What NOT to include**: No README.md, INSTALLATION_GUIDE.md, QUICK_REFERENCE.md, CHANGELOG.md, etc. "Only information needed for an AI agent to do the job."

4. **Creation Process** (6 steps):
   1. Understand with concrete examples (ask clarifying questions)
   2. Plan reusable contents (scripts, references, assets)
   3. Initialize with `scripts/init_skill.py <name> --path <dir>`
   4. Edit SKILL.md (always imperative form)
   5. Package with `scripts/package_skill.py <path>` (creates .skill zip)
   6. Iterate based on real usage

**Source**: [skill-creator SKILL.md](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md)

---

## 2. agentskills.io Open Standard

### What It Is

An open specification published December 18, 2025 by Anthropic, defining a portable format for agent skills that works across any AI platform. Maintained at [github.com/agentskills/agentskills](https://github.com/agentskills/agentskills) (9.4k stars, Apache 2.0 for code, CC-BY-4.0 for docs).

**Source**: [agentskills.io/specification](https://agentskills.io/specification)

### Complete Specification

#### Directory Structure (minimal)

```
skill-name/
└── SKILL.md          # Required (only this)
```

#### SKILL.md Format

```yaml
---
name: skill-name          # REQUIRED: 1-64 chars, lowercase + hyphens
description: What it does  # REQUIRED: 1-1024 chars, non-empty
license: Apache-2.0        # OPTIONAL
compatibility: Requires git # OPTIONAL: 1-500 chars
metadata:                   # OPTIONAL: arbitrary key-value
  author: example-org
  version: "1.0"
allowed-tools: Bash(git:*) Read  # OPTIONAL, experimental
---

[Markdown body with instructions]
```

#### Field Constraints

| Field | Required | Constraints |
|-------|----------|-------------|
| `name` | Yes | 1-64 chars. Lowercase alphanumeric + hyphens only. No start/end hyphens. No consecutive hyphens. MUST match parent directory name. |
| `description` | Yes | 1-1024 chars. Non-empty. Should describe WHAT + WHEN. Include trigger keywords. |
| `license` | No | License name or reference to bundled file |
| `compatibility` | No | 1-500 chars. Environment requirements (product, packages, network) |
| `metadata` | No | String-to-string key-value map. Make keys unique to avoid conflicts. |
| `allowed-tools` | No | Space-delimited tool list. Experimental; support varies by implementation. |

#### Name Validation Rules

```
VALID:    pdf-processing, data-analysis, code-review
INVALID:  PDF-Processing (uppercase), -pdf (starts with hyphen),
          pdf--processing (consecutive hyphens)
```

#### Optional Directories

| Directory | Purpose | Guideline |
|-----------|---------|-----------|
| `scripts/` | Executable code (Python, Bash, JS) | Self-contained, good error messages |
| `references/` | Documentation loaded on demand | Keep files focused, small = less context |
| `assets/` | Static resources (templates, images, data) | Not loaded into context, used in output |

#### Progressive Disclosure (3 Levels)

```
Level 1: Metadata (~100 tokens)    - name + description, ALWAYS in context
Level 2: Instructions (<5k tokens) - SKILL.md body, loaded on activation
Level 3: Resources (as needed)     - scripts/, references/, assets/
```

**Keep SKILL.md under 500 lines. Keep file references one level deep.**

#### Validation

```bash
# Using the official skills-ref reference library
skills-ref validate ./my-skill
```

### Adoption Timeline

| Date | Event |
|------|-------|
| Sep 2025 | anthropics/skills repo created |
| Oct 2025 | Claude Skills + Plugins released. Launch partners: Atlassian, Canva, Figma, Notion, Cloudflare, Zapier, Stripe, Vercel |
| Dec 18, 2025 | Agent Skills open standard published at agentskills.io |
| Dec 2025 | Simon Willison discovers ChatGPT has /home/oai/skills with built-in PDF/doc/spreadsheet skills |
| Dec 24, 2025 | OpenAI adds skills support to Codex CLI |
| Jan 20, 2026 | Vercel launches skills.sh + skills CLI |
| Feb 2026 | 339+ skills indexed, 10+ compatible platforms |

**Sources**: [Simon Willison](https://simonwillison.net/2025/Dec/19/agent-skills/), [Unite.AI](https://www.unite.ai/anthropic-opens-agent-skills-standard-continuing-its-pattern-of-building-industry-infrastructure/), [inference.sh](https://inference.sh/blog/skills/agent-skills-overview)

### Adopting Platforms

| Platform | How Skills Work |
|----------|----------------|
| **Claude Code** | `~/.claude/skills/` or `.claude/skills/`, auto-discovery via frontmatter |
| **Claude.ai** | Available to paid plans, upload custom skills |
| **Claude API** | Skills API via platform.claude.com |
| **Claude Agent SDK** | `allowed_tools: ["Skill"]` in config |
| **OpenAI Codex CLI** | `~/.codex/skills/`, `--enable skills` flag |
| **ChatGPT** | Built-in `/home/oai/skills` directory |
| **Cursor** | Project-level directories |
| **GitHub Copilot** | Via VS Code skills integration |
| **Gemini CLI** | Native skills support |
| **Goose (Block)** | Compatible with standard |
| **Windsurf** | Compatible with standard |
| **Roo Code** | Compatible with standard |

**Source**: [OpenAI Codex Skills](https://developers.openai.com/codex/skills), [Agent Skills overview](https://inference.sh/blog/skills/agent-skills-overview)

---

## 3. Skill Authoring Best Practices (Official Anthropic)

The official best practices document from platform.claude.com is the most comprehensive authoring guide available. Key insights not covered elsewhere:

**Source**: [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)

### Core Principles

#### 1. "The Context Window Is a Public Good"

> "Your Skill shares the context window with everything else Claude needs to know, including the system prompt, conversation history, other Skills' metadata, your actual request."

**Default assumption**: Claude is already very smart. Only add what it doesn't know.

#### 2. Degrees of Freedom Analogy

Think of Claude exploring a path:
- **Narrow bridge with cliffs**: Only one safe way. Exact instructions, low freedom. (e.g., database migrations)
- **Open field, no hazards**: Many valid paths. General direction, high freedom. (e.g., code reviews)

#### 3. Test with All Target Models

What works for Opus may need more detail for Haiku. If multi-model, aim for universal instructions.

### Naming Conventions

**Recommended**: Gerund form (verb + -ing)
```
processing-pdfs, analyzing-spreadsheets, managing-databases,
testing-code, writing-documentation
```

**Acceptable**: Noun phrases or action-oriented
```
pdf-processing, spreadsheet-analysis, process-pdfs
```

**Avoid**: Vague (`helper`, `utils`, `tools`), generic (`documents`, `data`), reserved (`anthropic-*`, `claude-*`)

### Description Writing Rules

**ALWAYS third person** (description injected into system prompt):
```yaml
# GOOD
description: Processes Excel files and generates reports

# BAD
description: I can help you process Excel files    # first person
description: You can use this to process Excel files # second person
```

**Include both WHAT + WHEN**:
```yaml
description: Extract text and tables from PDF files, fill forms, merge documents.
  Use when working with PDF files or when the user mentions PDFs, forms, or
  document extraction.
```

### Progressive Disclosure Patterns

**Pattern 1: High-level guide with references**
```markdown
# PDF Processing
## Quick start
[inline example]
## Advanced features
- **Form filling**: See [FORMS.md](FORMS.md)
- **API reference**: See [REFERENCE.md](REFERENCE.md)
```

**Pattern 2: Domain-specific organization**
```
bigquery-skill/
├── SKILL.md (overview + navigation)
└── reference/
    ├── finance.md
    ├── sales.md
    ├── product.md
    └── marketing.md
```

**Pattern 3: Conditional details**
```markdown
**Creating new content?** -> Follow "Creation workflow"
**Editing existing content?** -> Follow "Editing workflow"
```

### Anti-Patterns

| Anti-Pattern | Issue |
|--------------|-------|
| Windows-style paths (`scripts\helper.py`) | Breaks on Unix |
| Offering too many options | Confusing; provide default + escape hatch |
| Deeply nested references (3+ levels) | Claude may `head -100` intermediate files, missing info |
| Time-sensitive info ("before August 2025...") | Use "old patterns" section with `<details>` |
| Inconsistent terminology | Pick one term and use throughout |
| Verbose explanations | Claude already knows what PDFs are |

### Evaluation-Driven Development

**Process**:
1. Run Claude on tasks WITHOUT a skill -- document failures
2. Create 3 evaluation scenarios testing those gaps
3. Measure baseline performance
4. Write MINIMAL instructions to address gaps
5. Iterate: run evals, compare, refine

**Evaluation structure**:
```json
{
  "skills": ["pdf-processing"],
  "query": "Extract all text from this PDF file and save to output.txt",
  "files": ["test-files/document.pdf"],
  "expected_behavior": [
    "Successfully reads the PDF using appropriate library",
    "Extracts text from ALL pages",
    "Saves to output.txt in readable format"
  ]
}
```

### Iterative Development with "Claude A / Claude B"

The recommended workflow uses TWO Claude instances:
- **Claude A** (the expert): Helps design/refine the skill
- **Claude B** (the user): Tests the skill on real tasks

Cycle: Design with A -> Test with B -> Observe B's failures -> Return to A with specifics -> Refine -> Repeat

### Checklist for Effective Skills

**Core quality**:
- [ ] Description is specific with key terms
- [ ] Description includes WHAT + WHEN
- [ ] Body under 500 lines
- [ ] References one level deep
- [ ] No time-sensitive info
- [ ] Consistent terminology
- [ ] Concrete examples

**Code/scripts**:
- [ ] Scripts solve, don't punt to Claude
- [ ] Explicit error handling
- [ ] No magic numbers (all values justified)
- [ ] Dependencies listed
- [ ] Forward slashes only

**Testing**:
- [ ] 3+ evaluations created
- [ ] Tested with Haiku, Sonnet, Opus
- [ ] Tested with real scenarios

---

## 4. Plugin Marketplace Architecture

### System Overview

Skills are the atomic unit; Plugins bundle skills + agents + hooks + MCP + LSP for distribution; Marketplaces catalog plugins.

```
Marketplace (marketplace.json)
  └── Plugin (plugin.json)
       ├── skills/        # Agent Skills (SKILL.md)
       ├── agents/        # Subagent definitions (.md)
       ├── commands/      # Legacy commands (.md)
       ├── hooks/         # Event handlers (hooks.json)
       ├── .mcp.json      # MCP server configs
       └── .lsp.json      # LSP server configs
```

**Source**: [Plugin marketplaces](https://code.claude.com/docs/en/plugin-marketplaces), [Plugins reference](https://code.claude.com/docs/en/plugins-reference)

### marketplace.json Schema

```json
{
  "name": "company-tools",           // REQUIRED: kebab-case
  "owner": {                         // REQUIRED
    "name": "DevTools Team",
    "email": "devtools@example.com"  // optional
  },
  "metadata": {                      // OPTIONAL
    "description": "Brief description",
    "version": "1.0.0",
    "pluginRoot": "./plugins"        // base directory for relative paths
  },
  "plugins": [                       // REQUIRED
    {
      "name": "code-formatter",      // REQUIRED: kebab-case
      "source": "./plugins/formatter", // REQUIRED: string or object
      "description": "...",
      "version": "2.1.0",
      "author": {"name": "..."},
      "category": "productivity",
      "tags": ["formatting"],
      "strict": true,                // default: true (merge with plugin.json)
      "commands": ["./custom/"],
      "agents": ["./agents/"],
      "hooks": {},
      "mcpServers": {},
      "lspServers": {}
    }
  ]
}
```

**Reserved marketplace names**: `claude-code-marketplace`, `claude-code-plugins`, `claude-plugins-official`, `anthropic-marketplace`, `anthropic-plugins`, `agent-skills`, `life-sciences`.

### plugin.json Schema

```json
{
  "name": "plugin-name",             // REQUIRED (only required field)
  "version": "1.2.0",
  "description": "Brief description",
  "author": {"name": "...", "email": "..."},
  "homepage": "https://...",
  "repository": "https://github.com/...",
  "license": "MIT",
  "keywords": ["keyword1"],
  "commands": ["./custom/cmd.md"],
  "agents": "./custom/agents/",
  "skills": "./custom/skills/",
  "hooks": "./config/hooks.json",
  "mcpServers": "./mcp-config.json",
  "outputStyles": "./styles/",
  "lspServers": "./.lsp.json"
}
```

### Plugin Source Types

| Type | Format | Notes |
|------|--------|-------|
| Relative path | `"./plugins/my-plugin"` | Only works with git-based marketplaces |
| GitHub | `{"source": "github", "repo": "owner/repo", "ref": "v2.0", "sha": "abc..."}` | Supports pinning |
| Git URL | `{"source": "url", "url": "https://gitlab.com/team/plugin.git"}` | Any git host |
| npm | Via npm registry | Copied to plugin cache |
| pip | Via PyPI | Copied to plugin cache |

### Plugin Scopes

| Scope | Settings File | Use Case |
|-------|---------------|----------|
| `user` | `~/.claude/settings.json` | Personal, all projects (default) |
| `project` | `.claude/settings.json` | Team, via version control |
| `local` | `.claude/settings.local.json` | Project-specific, gitignored |
| `managed` | `managed-settings.json` | Admin-controlled, read-only |

### Plugin Caching

Plugins are COPIED to a cache directory on install (not used in-place). This means:
- `../shared-utils` paths will NOT work (external files not copied)
- Use `${CLAUDE_PLUGIN_ROOT}` in hooks/MCP configs for correct paths
- Symlinks ARE followed during copy (workaround for shared deps)

### Official Plugin Directory

[anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) (7.1k stars, 676 forks):

```
claude-plugins-official/
├── /plugins/              # Anthropic-maintained plugins
├── /external_plugins/     # Third-party (community + partners)
└── .claude-plugin/
    └── marketplace.json   # Central catalog
```

**Installation**: `/plugin install {name}@claude-plugin-directory` or via Discover UI.

**Submission**: Via [Plugin Directory Submission Form](https://clau.de/plugin-directory-submission).

### Team Marketplace Distribution

Auto-prompt teammates to install on project trust:
```json
// .claude/settings.json
{
  "extraKnownMarketplaces": {
    "company-tools": {
      "source": {"source": "github", "repo": "your-org/claude-plugins"}
    }
  },
  "enabledPlugins": {
    "code-formatter@company-tools": true,
    "deployment-tools@company-tools": true
  }
}
```

**Lockdown** (managed settings):
```json
{
  "strictKnownMarketplaces": [
    {"source": "github", "repo": "acme-corp/approved-plugins"},
    {"source": "hostPattern", "hostPattern": "^github\\.example\\.com$"}
  ]
}
```

### Hook System (Plugin Component)

Plugins can define hooks for 15 event types:

| Event | When |
|-------|------|
| `PreToolUse` | Before any tool use |
| `PostToolUse` | After successful tool use |
| `PostToolUseFailure` | After tool failure |
| `PermissionRequest` | Permission dialog shown |
| `UserPromptSubmit` | User submits prompt |
| `Notification` | Claude sends notification |
| `Stop` | Claude attempts to stop |
| `SubagentStart` | Subagent started |
| `SubagentStop` | Subagent stopping |
| `SessionStart` | Session begins |
| `SessionEnd` | Session ends |
| `TeammateIdle` | Team agent going idle |
| `TaskCompleted` | Task marked complete |
| `PreCompact` | Before context compaction |

**Hook types**: `command` (shell script), `prompt` (LLM evaluation), `agent` (agentic verifier with tools).

### LSP Integration (New)

Plugins can provide Language Server Protocol servers for real-time code intelligence:

```json
{
  "go": {
    "command": "gopls",
    "args": ["serve"],
    "extensionToLanguage": {".go": "go"}
  }
}
```

Available official LSP plugins: `pyright-lsp`, `typescript-lsp`, `rust-lsp`.

---

## 5. skills.sh Distribution Hub

### What It Is

Launched January 20, 2026 by Vercel. The primary distribution hub for Agent Skills across the ecosystem.

**Source**: [InfoQ](https://www.infoq.com/news/2026/02/vercel-agent-skills/), [skills.sh](https://skills.sh/)

### How It Works

```bash
# Install a skill package
npx skills add <owner>/<repo>

# Install specific skill from a package
npx skills add <owner>/<repo>/<skill-name>
```

The CLI auto-detects your agent (Claude Code, Cursor, Copilot, etc.) and drops skills into the correct directory:
- Claude Code: `.claude/skills/`
- Cursor: `.cursor/skills/`
- Codex CLI: `~/.codex/skills/`
- etc.

### Features

- **Leaderboard**: Top skills by install count (all-time + 24h trending)
- **Anonymous telemetry**: Aggregated install counts
- **Auto-detection**: Figures out which agent you use
- **20K+ installs** reported at launch week

### Notable Indexed Skills (339+)

From [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills):

| Organization | Skills | Category |
|-------------|--------|----------|
| Anthropic (official) | 16 | Core (PDF, docs, skill-creator) |
| Vercel | 8 | Web/Next.js/deployment |
| Cloudflare | 7 | Workers/edge/security |
| Trail of Bits | 23 | Security auditing |
| Microsoft | 50+ | .NET, Java, Python |
| Hugging Face | 8 | ML/AI models |
| Stripe | 2 | Payments |
| Sentry | 7 | Error tracking |
| Google Labs (Stitch) | 6 | Various |
| Expo | 3 | Mobile/React Native |

### Criticism

> "Skills.sh has no quality control. Anyone can create a skill, host it on GitHub, and tell people to install it. The only ranking mechanism is install count -- which can be gamed."

No formal review process, no quality badges, no security scanning.

---

## 6. ComposioHQ/awesome-claude-skills

### Overview

A massive collection of Claude Skills providing 500+ app integrations through Composio's API layer.

**Source**: [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills)

### Stats

- 31,700+ stars, 3,000+ forks
- Apache 2.0 license
- Actively maintained

### Installation

```bash
claude --plugin-dir ./connect-apps-plugin
# Then: /connect-apps:setup
# Paste API key from platform.composio.dev
# Restart Claude
```

### Integration Categories (78+ pre-built skills)

| Category | Services |
|----------|----------|
| CRM & Sales | Close, HubSpot, Pipedrive, Salesforce, Zoho |
| Project Mgmt | Asana, ClickUp, Jira, Linear, Monday, Notion, Todoist, Trello |
| Communication | Slack, Discord, Teams, Telegram, WhatsApp, Intercom |
| Email | Gmail, Outlook, SendGrid, Postmark, Brevo |
| Storage | Google Drive, OneDrive, Dropbox, Box |
| Spreadsheets | Airtable, Coda, Google Sheets |
| Social Media | LinkedIn, Twitter/X, Instagram, Reddit, TikTok, YouTube |
| E-commerce | Shopify, Stripe, Square |
| Design | Figma, Canva, Miro, Webflow |
| Analytics | Amplitude, Google Analytics, Mixpanel, PostHog, Segment |
| DevOps | GitHub, GitLab, CircleCI, Render, Vercel, Datadog, Sentry |

### Skill Types Included

Beyond integrations:
- **Document Processing**: docx, PDF, pptx, xlsx
- **Development**: Artifact builders, AWS CDK, D3 viz, git workflows
- **Data**: CSV summarizer, PostgreSQL queries, root-cause tracing
- **Business**: Brand guidelines, competitive ads, lead qualification
- **Security**: Digital forensics, metadata extraction, Sigma rules
- **Creative**: Canvas design, GIF creation, video downloading

---

## 7. claude-code-skill-factory

### Overview

Open-source toolkit for generating production-ready skills at scale. v1.4.0 (Oct 2025).

**Source**: [claude-code-skill-factory GitHub](https://github.com/alirezarezvani/claude-code-skill-factory)

### Six Factory Types

| Factory | What It Creates |
|---------|----------------|
| **Skills Factory** | Complete skills with YAML, Python, samples, docs |
| **Agents Factory** | Specialist agents with YAML config + MCP support |
| **Prompt Factory** | Mega-prompts across 69 presets (XML, Claude, ChatGPT, Gemini) |
| **Hooks Factory** | Hook configs for 7 event types with security validation |
| **Slash Command Factory** | Commands using 17 presets and Anthropic patterns |
| **Codex CLI Bridge** | CLAUDE.md -> AGENTS.md translation for cross-platform |

### Built-in Commands

```
/build          - Interactive builder for skills/agents/prompts/hooks
/build-hook     - Specialized hook builder
/validate-output - Validates + creates ZIP files
/install-skill   - Installs to Claude Code
/install-hook    - Installs hooks to settings
/test-factory    - Runs example tests
/factory-status  - System health check
/sync-agents-md  - Translates CLAUDE.md -> AGENTS.md (Codex bridge)
/codex-exec      - Execute Codex CLI commands
/sync-todos-to-github - Tasks -> GitHub issues
```

### Production Skills Included (9)

1. AWS Solution Architect (53 KB)
2. Content Trend Researcher (35 KB)
3. Microsoft 365 Tenant Manager (40 KB)
4. Agent Factory (12 KB)
5. Prompt Factory (427 KB) -- 69 presets across 15 domains
6. Slash Command Factory (26 KB)
7. Codex CLI Bridge (48 KB)
8. Hook Factory v2.0 (92 KB)
9. CLAUDE.md Enhancer (50 KB)

### Key Innovation: Smart Detection

Automatically determines if a skill needs Python code or prompt-only instruction. Only generates code when deterministic operations are required.

---

## 8. OpenAI Codex Skills Support

### How Skills Work in Codex

Within 2 months of Anthropic's open standard publication, OpenAI added skills support.

**Source**: [OpenAI Codex Skills](https://developers.openai.com/codex/skills)

### Format Compatibility

Codex uses the SAME Agent Skills format:
- `SKILL.md` with YAML frontmatter (name, description)
- Optional scripts/, references/, assets/
- Optional `agents/openai.yaml` for Codex-specific UI config

### Discovery Locations

| Location | Priority |
|----------|----------|
| Repository (nested) | Project-level |
| `~/.codex/skills` | User-level (with `--enable skills` flag) |
| `~/.agents/skills` | User-level (alternative) |
| `/etc/codex/skills` | System admin level |
| Bundled system skills | Built-in |

### Activation

- **Explicit**: `/skills` or `$` mention
- **Implicit**: Codex auto-selects based on description matching

### Configuration

```toml
# ~/.codex/config.toml
[[skills.config]]
name = "my-skill"
enabled = false  # disable without deletion
```

### Key Difference from Claude

- Claude: progressive disclosure driven by filesystem reads
- Codex: similar progressive loading but also has `agents/openai.yaml` for UI configuration and dependencies

---

## 9. Ecosystem Map

### Distribution Platforms

| Platform | Type | Skills | URL |
|----------|------|--------|-----|
| **skills.sh** | Discovery + CLI | 339+ | skills.sh |
| **SkillsMP** | Marketplace | 40,000+ (aggregated) | skillsmp.com |
| **claude-plugins-official** | Official directory | 40+ | github.com/anthropics/claude-plugins-official |
| **anthropics/skills** | Reference impl | ~10 | github.com/anthropics/skills |
| **ComposioHQ** | App integrations | 500+ | github.com/ComposioHQ/awesome-claude-skills |
| **VoltAgent** | Community curation | 339+ | github.com/VoltAgent/awesome-agent-skills |
| **Skild Hub** | Discovery | Growing | hub.skild.sh |

### Cross-Platform CLI

```bash
# Universal CLI (by Karanjot786)
# Syncs skills to Cursor, Claude Code, Copilot, Codex, Antigravity
npx agent-skills-cli add <skill>
```

### Managed Distribution (Enterprise)

- **LiteLLM**: Central registry for Claude Code plugins. Admins govern available plugins.
- **strictKnownMarketplaces**: Managed settings lockdown. Only allowlisted marketplaces permitted.
- **Private repos**: Git credential helpers for auth. `GITHUB_TOKEN` / `GITLAB_TOKEN` for auto-updates.

---

## 10. Key Architectural Insights

### The Skills Stack

```
Layer 5: Distribution  -> skills.sh, marketplaces, plugin registries
Layer 4: Packaging     -> plugin.json wrapping skills + agents + hooks + MCP + LSP
Layer 3: Orchestration -> progressive disclosure, context management, model routing
Layer 2: Authoring     -> SKILL.md, scripts, references, assets
Layer 1: Standard      -> agentskills.io specification (open, minimal)
```

### Why This Architecture Won

1. **Deliberately simple spec**: Just a markdown file with YAML frontmatter. Any developer can create a skill in minutes.

2. **Progressive disclosure**: Context window is a scarce resource. Only ~100 tokens per skill at startup enables massive skill libraries.

3. **Filesystem-native**: Skills are just directories. `ls`, `cat`, `grep` work. No special tooling needed.

4. **Open standard**: Not locked to Claude. Within 2 months, the entire industry adopted it. This is Anthropic's "build the railroad" strategy.

5. **Composable**: Skills bundle inside plugins, plugins bundle inside marketplaces. Each layer adds distribution capability without changing the atomic unit.

### Progressive Disclosure Token Budget

```
100 skills x 100 tokens metadata = 10,000 tokens (always loaded)
1 active skill x 5,000 tokens body = 5,000 tokens (on activation)
2 reference files x 2,000 tokens = 4,000 tokens (on demand)

Total for active task: ~19,000 tokens
vs. naive: 100 x 5,000 = 500,000 tokens (impossible)
```

### Future Direction

From the Anthropic engineering blog:
> "We envision enabling agents to autonomously create, edit, and evaluate their own skills, potentially allowing agents to codify their own patterns of behavior into reusable capabilities."

This means skills as a self-improving feedback loop: agent uses skill -> observes gaps -> creates/refines skill -> better next time.

---

## Sources

- [anthropics/skills GitHub](https://github.com/anthropics/skills) -- Official skills repository (66.5k stars)
- [agentskills.io/specification](https://agentskills.io/specification) -- Open standard specification
- [agentskills/agentskills GitHub](https://github.com/agentskills/agentskills) -- Spec repo (9.4k stars)
- [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) -- Official Anthropic guide
- [Plugin marketplaces docs](https://code.claude.com/docs/en/plugin-marketplaces) -- Distribution architecture
- [Plugins reference](https://code.claude.com/docs/en/plugins-reference) -- Complete technical reference
- [Anthropic engineering blog](https://claude.com/blog/equipping-agents-for-the-real-world-with-agent-skills) -- Design philosophy
- [OpenAI Codex Skills](https://developers.openai.com/codex/skills) -- Cross-platform adoption
- [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) -- 500+ integrations
- [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) -- 339+ curated skills
- [claude-code-skill-factory](https://github.com/alirezarezvani/claude-code-skill-factory) -- Skill generator toolkit
- [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) -- Official plugin directory
- [InfoQ: Vercel Skills.sh](https://www.infoq.com/news/2026/02/vercel-agent-skills/) -- Distribution hub
- [inference.sh Agent Skills overview](https://inference.sh/blog/skills/agent-skills-overview) -- Ecosystem analysis
- [skill-creator SKILL.md](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md) -- Meta-skill
- [Simon Willison on Agent Skills](https://simonwillison.net/2025/Dec/19/agent-skills/) -- Industry analysis

---

## Gaps

1. **Skill versioning standard**: No formal version pinning in the spec itself (only via marketplace plugin entries). How do skills handle breaking changes?
2. **Security scanning**: No automated security review for published skills. skills.sh has no quality gates.
3. **Skill composition**: No standard for one skill depending on or importing from another skill. Each must be self-contained.
4. **Performance benchmarks**: No published data on how many skills degrade context quality (at what threshold does 100+ skills metadata become noisy?)
5. **Agent self-improvement loop**: Mentioned as future direction but no concrete timeline or implementation details.
6. **Enterprise governance patterns**: Limited documentation on how large orgs audit and approve skills at scale (beyond strictKnownMarketplaces).
