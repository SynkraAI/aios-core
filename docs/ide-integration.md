# IDE Integration Guide

> **EN**

---

Guide for integrating AIOS with supported IDEs and AI development platforms.

**Version:** 2.1.0
**Last Updated:** 2026-01-28

---

## Supported IDEs

AIOS supports multiple AI-powered development platforms. Choose the one that best fits your workflow.

### Quick Comparison Table

| Feature              | Claude Code | Codex CLI |  Cursor  | Windsurf |  Cline   | Copilot | AntiGravity | Roo Code | Gemini CLI |   Trae   |
| -------------------- | :---------: | :-------: | :------: | :------: | :------: | :-----: | :---------: | :------: | :--------: | :------: |
| **Agent Activation** |  /command   | terminal  | @mention | @mention | @mention | 4 Modes |  Workflow   |   Mode   |   Prompt   | @mention |
| **MCP Support**      |   Native    |  Native   |  Config  |  Config  | Limited  |   Yes   |   Native    |    No    |     No     | Limited  |
| **Subagent Tasks**   |     Yes     |    No     |    No    |    No    |    No    |   Yes   |     Yes     |    No    |     No     |    No    |
| **Auto-sync**        |     Yes     |    Yes    |   Yes    |   Yes    |   Yes    |   Yes   |     Yes     |   Yes    |    Yes     |   Yes    |
| **Hooks System**     |     Yes     |    No     |    No    |    No    |    No    |   No    |     No      |    No    |     No     |    No    |
| **Skills/Commands**  |   Native    |  Native   |    No    |    No    |    No    |   No    |     No      |    No    |     No     |    No    |
| **Recommendation**   |    Best     |   Best    |   Best   |   Good   |   Good   |  Good   |    Good     |  Basic   |   Basic    |  Basic   |

---

## Setup Instructions

### Claude Code

**Recommendation Level:** Best AIOS integration

```yaml
config_file: .claude/CLAUDE.md
agent_folder: .claude/commands/AIOS/agents
activation: /agent-name (slash commands)
format: full-markdown-yaml
mcp_support: native
special_features:
  - Task tool for subagents
  - Native MCP integration
  - Hooks system (pre/post)
  - Custom skills
  - Memory persistence
```

**Setup:**

1. AIOS automatically creates `.claude/` directory on init
2. Agents are available as slash commands: `/dev`, `/qa`, `/architect`
3. Configure MCP servers in `~/.claude.json`

**Configuration:**

```bash
# Sync agents to Claude Code
npm run sync:agents -- --platform claude

# Verify setup
ls -la .claude/commands/AIOS/agents/
```

---

### Codex CLI

**Recommendation Level:** Best (terminal-first workflow)

```yaml
config_file: AGENTS.md
agent_folder: .codex/agents
activation: terminal instructions
skills_folder: .codex/skills (source), ~/.codex/skills (Codex menu)
format: markdown
mcp_support: native via Codex tooling
special_features:
  - AGENTS.md project instructions
  - /skills activators (aios-<agent-id>)
  - Strong CLI workflow support
  - Easy integration with repository scripts
```

**Setup:**

1. Keep `AGENTS.md` at repository root
2. Run `npm run sync:ide:codex` to sync auxiliary agent files
3. Run `npm run sync:skills:codex` to generate project-local skills in `.codex/skills`
4. Use `/skills` and choose `aios-architect`, `aios-dev`, etc.
5. Use `npm run sync:skills:codex:global` only when you explicitly want global installation

**Configuration:**

```bash
# Sync Codex support files
npm run sync:ide:codex
npm run sync:skills:codex

# Verify setup
ls -la AGENTS.md .codex/agents/ .codex/skills/
```

---

### Cursor

**Recommendation Level:** Best (popular AI IDE)

```yaml
config_file: .cursor/rules.md
agent_folder: .cursor/rules
activation: @agent-name
format: condensed-rules
mcp_support: via configuration
special_features:
  - Composer integration
  - Chat modes
  - @codebase context
  - Multi-file editing
```

**Setup:**

1. AIOS creates `.cursor/` directory on init
2. Agents activated with @mention: `@dev`, `@qa`
3. Rules synchronized to `.cursor/rules/`

**Configuration:**

```bash
# Sync agents to Cursor
npm run sync:agents -- --platform cursor

# Verify setup
ls -la .cursor/rules/
```

**MCP Configuration (`.cursor/mcp.json`):**

```json
{
  "mcpServers": {
    "context7": {
      "url": "https://mcp.context7.com/sse"
    }
  }
}
```

---

### Windsurf

**Recommendation Level:** Good (Cascade flow)

```yaml
config_file: .windsurfrules
agent_folder: .windsurf/rules
activation: @agent-name
format: xml-tagged-markdown
mcp_support: via configuration
special_features:
  - Cascade flow
  - Supercomplete
  - Flows system
```

**Setup:**

1. AIOS creates `.windsurf/` directory and `.windsurfrules` file
2. Agents activated with @mention
3. Supports Cascade flow for multi-step tasks

**Configuration:**

```bash
# Sync agents to Windsurf
npm run sync:agents -- --platform windsurf

# Verify setup
cat .windsurfrules
ls -la .windsurf/rules/
```

---

### Cline

**Recommendation Level:** Good (VS Code integration)

```yaml
config_file: .cline/rules.md
agent_folder: .cline/agents
activation: @agent-name
format: condensed-rules
mcp_support: limited
special_features:
  - VS Code integration
  - Extension ecosystem
  - Inline suggestions
```

**Setup:**

1. Install Cline VS Code extension
2. AIOS creates `.cline/` directory on init
3. Agents synchronized to `.cline/agents/`

**Configuration:**

```bash
# Sync agents to Cline
npm run sync:agents -- --platform cline

# Verify setup
ls -la .cline/agents/
```

---

### GitHub Copilot

**Recommendation Level:** Good (GitHub integration)

```yaml
config_file: .github/copilot-instructions.md
agent_folder: .github/agents
activation: chat modes
format: text
mcp_support: none
special_features:
  - GitHub integration
  - PR assistance
  - Code review
```

**Setup:**

1. Enable GitHub Copilot in your repository
2. AIOS creates `.github/copilot-instructions.md`
3. Agent instructions synchronized

**Configuration:**

```bash
# Sync agents to GitHub Copilot
npm run sync:agents -- --platform github-copilot

# Verify setup
cat .github/copilot-instructions.md
```

---

### AntiGravity

**Recommendation Level:** Good (Google integration)

```yaml
config_file: .antigravity/rules.md
config_json: .antigravity/antigravity.json
agent_folder: .agent/workflows
activation: workflow-based
format: cursor-style
mcp_support: native (Google)
special_features:
  - Google Cloud integration
  - Workflow system
  - Native Firebase tools
```

**Setup:**

1. AIOS creates `.antigravity/` directory
2. Configure Google Cloud credentials
3. Agents synchronized as workflows

---

### Roo Code

**Recommendation Level:** Basic

```yaml
config_file: .roo/rules.md
agent_folder: .roo/agents
activation: mode selector
format: text
mcp_support: none
special_features:
  - Mode-based workflow
  - VS Code extension
  - Custom modes
```

---

### Gemini CLI

**Recommendation Level:** Basic

```yaml
config_file: .gemini/rules.md
agent_folder: .gemini/agents
activation: prompt mention
format: text
mcp_support: none
special_features:
  - Google AI models
  - CLI-based workflow
  - Multimodal support
```

---

### Trae

**Recommendation Level:** Basic

```yaml
config_file: .trae/rules.md
agent_folder: .trae/agents
activation: @agent-name
format: project-rules
mcp_support: limited
special_features:
  - Modern UI
  - Fast iteration
  - Builder mode
```

---

## Sync System

### How Sync Works

AIOS maintains a single source of truth for agent definitions and synchronizes them to all configured IDEs:

```
┌─────────────────────────────────────────────────────┐
│                    AIOS Core                         │
│  .aios-core/development/agents/  (Source of Truth)  │
│                        │                             │
│            ┌───────────┼───────────┐                │
│            ▼           ▼           ▼                │
│  .claude/     .cursor/     .windsurf/               │
│  .cline/      .github/     .antigravity/            │
│  .roo/        .gemini/     .trae/                   │
└─────────────────────────────────────────────────────┘
```

### Sync Commands

```bash
# Sync all agents to all platforms
npm run sync:agents

# Sync to specific platform
npm run sync:agents -- --platform cursor

# Sync specific agent
npm run sync:agents -- --agent dev

# Dry run (preview changes)
npm run sync:agents -- --dry-run

# Force sync (overwrite)
npm run sync:agents -- --force
```

### Automatic Sync

AIOS can be configured to automatically sync on agent changes:

```yaml
# .aios-core/core/config/sync.yaml
auto_sync:
  enabled: true
  watch_paths:
    - .aios-core/development/agents/
  platforms:
    - claude
    - cursor
    - windsurf
```

---

## Troubleshooting

### Agent Not Appearing in IDE

```bash
# Verify agent exists in source
ls .aios-core/development/agents/

# Force sync
npm run sync:agents -- --force

# Check platform-specific directory
ls .cursor/rules/  # For Cursor
ls .claude/commands/AIOS/agents/  # For Claude Code
```

### Sync Conflicts

```bash
# Preview what would change
npm run sync:agents -- --dry-run

# Backup before force sync
cp -r .cursor/rules/ .cursor/rules.backup/
npm run sync:agents -- --force
```

### MCP Not Working

```bash
# Check MCP status
aios mcp status

# Verify MCP configuration for IDE
cat ~/.claude.json  # For Claude Code
cat .cursor/mcp.json  # For Cursor
```

### IDE-Specific Issues

**Claude Code:**

- Ensure `.claude/` is in project root
- Check hooks permissions: `chmod +x .claude/hooks/*.py`

**Cursor:**

- Restart Cursor after sync
- Check `.cursor/rules/` permissions

**Windsurf:**

- Verify `.windsurfrules` exists at root
- Check syntax with YAML validator

---

## Platform Decision Guide

Use this guide to choose the right platform:

```
Do you use Claude/Anthropic API?
├── Yes --> Claude Code (Best AIOS integration)
└── No
    └── Do you prefer VS Code?
        ├── Yes --> Want an extension?
        │   ├── Yes --> Cline (Full VS Code integration)
        │   └── No --> GitHub Copilot (Native GitHub features)
        └── No --> Want a dedicated AI IDE?
            ├── Yes --> Which model do you prefer?
            │   ├── Claude/GPT --> Cursor (Most popular AI IDE)
            │   └── Multiple --> Windsurf (Cascade flow)
            └── No --> Use Google Cloud?
                ├── Yes --> AntiGravity (Google integration)
                └── No --> Gemini CLI / Trae / Roo (Specialized)
```

---

## Migration Between IDEs

### From Cursor to Claude Code

```bash
# Export current rules
cp -r .cursor/rules/ ./rules-backup/

# Initialize Claude Code
npm run sync:agents -- --platform claude

# Verify migration
diff -r ./rules-backup/ .claude/commands/AIOS/agents/
```

### From Claude Code to Cursor

```bash
# Sync to Cursor
npm run sync:agents -- --platform cursor

# Configure MCP (if needed)
# Copy MCP config to .cursor/mcp.json
```

---

## Related Documentation

- [Platform Guides](./platforms/README.md)
- [Claude Code Guide](./platforms/claude-code.md)
- [Cursor Guide](./platforms/cursor.md)
- [Agent Reference Guide](./agent-reference-guide.md)
- [MCP Global Setup](./guides/mcp-global-setup.md)

---

_Synkra AIOS IDE Integration Guide v4.0.4_
