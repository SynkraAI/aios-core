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

| Feature              | Claude Code | Codex CLI | Cursor | Copilot | AntiGravity | Gemini CLI |
| -------------------- | :---------: | :-------: | :----: | :-----: | :---------: | :--------: |
| **Agent Activation** |  /command   |  /skills  | @mention | chat modes | workflow-based | prompt mention |
| **MCP Support**      |   Native    |  Native   | Config | Config | Provider-specific | Native |
| **Subagent Tasks**   |     Yes     |   Yes     |   No   |   No   |     Yes     |     No     |
| **Auto-sync**        |     Yes     |   Yes     |  Yes   |  Yes   |     Yes     |    Yes     |
| **Hooks System**     |     Yes     |  Limited  |   No   |   No   |      No     |     Yes    |
| **Skills/Commands**  |   Native    |  Native   |   No   |   No   |      No     |    Native  |
| **Recommendation**   |    Best     |   Best    |  Best  |  Good  |     Good    |   Good     |

### Hook Parity and Functional Impact

| IDE | Hook Parity vs Claude | What Is Degraded Without Full Hooks | AIOS Mitigation |
| --- | --- | --- | --- |
| Claude Code | Full | None (reference behavior) | Native hooks + full AIOS pipeline |
| Gemini CLI | High | Minor event-model differences | Native Gemini hooks + unified hook mapping |
| Codex CLI | Limited/partial | Less automatic session lifecycle capture, weaker pre/post-tool enforcement | `AGENTS.md` + `/skills` + MCP + sync/validation scripts |
| Cursor | No equivalent lifecycle hooks | No native pre/post-tool interception and reduced automatic audit trail | Synced rules + MCP + explicit workflow discipline |
| GitHub Copilot | No equivalent lifecycle hooks | Same as Cursor, with stronger dependence on manual flow | Repo instructions, chat modes, and VS Code MCP integration |
| AntiGravity | Workflow-driven (not hook-driven) | No Claude-like lifecycle parity | Workflow generation + agent sync |

### Practical Consequences by Capability

- `SessionStart/SessionEnd` automation:
  - Strong on Claude/Gemini.
  - Partial or manual on Codex/Cursor/Copilot/AntiGravity.
- `BeforeTool/AfterTool` guardrails:
  - Strongest on Claude/Gemini.
  - Limited on Codex.
  - Mostly process-based on Cursor/Copilot/AntiGravity.
- Automatic audit and telemetry richness:
  - Highest where hook lifecycle is available.
  - Reduced where integration is instruction/rules-driven only.

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
# Sync all enabled IDE targets (including Claude)
npm run sync:ide

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
  - Notify command plus emerging tool hooks in recent Codex releases
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
npm run validate:codex-sync
npm run validate:codex-integration
npm run validate:codex-skills

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
  - Subagents and cloud handoff support (latest Cursor releases)
  - Long-running agent workflows (research preview)
```

**Setup:**

1. AIOS creates `.cursor/` directory on init
2. Agents activated with @mention: `@dev`, `@qa`
3. Rules synchronized to `.cursor/rules/`

**Configuration:**

```bash
# Sync Cursor only
npm run sync:ide:cursor

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

### GitHub Copilot

**Recommendation Level:** Good (GitHub integration)

```yaml
config_file: .github/copilot-instructions.md
agent_folder: .github/agents
activation: chat modes
format: text
mcp_support: via VS Code MCP config
special_features:
  - GitHub integration
  - PR assistance
  - Code review
  - Works with repo instructions and VS Code MCP config
```

**Setup:**

1. Enable GitHub Copilot in your repository
2. AIOS creates `.github/copilot-instructions.md`
3. Agent instructions synchronized

**Configuration:**

```bash
# Sync all enabled IDE targets
npm run sync:ide

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

### Gemini CLI

**Recommendation Level:** Good

```yaml
config_file: .gemini/rules.md
agent_folder: .gemini/rules/AIOS/agents
activation: slash launcher commands
format: text
mcp_support: native
special_features:
  - Google AI models
  - CLI-based workflow
  - Multimodal support
  - Native hooks events and hook commands
  - Native MCP server support
  - Rapidly evolving command/tooling UX
```

**Setup:**

1. Run installer flow selecting `gemini` in IDE selection (wizard path)
2. AIOS creates:
   - `.gemini/rules.md`
   - `.gemini/rules/AIOS/agents/*.md`
   - `.gemini/commands/*.toml` (`/aios-menu`, `/aios-<agent>`)
   - `.gemini/hooks/*.js`
   - `.gemini/settings.json` (hooks enabled)
3. Validate integration:

```bash
npm run sync:ide:gemini
npm run validate:gemini-sync
npm run validate:gemini-integration
```

4. Quick agent activation (recommended):
   - `/aios-menu` to list shortcuts
   - `/aios-dev`, `/aios-architect`, `/aios-qa`, etc.
   - `/aios-agent <agent-id>` for generic launcher

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
│  .claude/     .codex/      .cursor/                  │
│  .antigravity/ .gemini/                              │
└─────────────────────────────────────────────────────┘
```

### Sync Commands

```bash
# Sync all IDE targets
npm run sync:ide

# Sync only Gemini
npm run sync:ide:gemini
npm run sync:ide:github-copilot
npm run sync:ide:antigravity

# Validate sync
npm run sync:ide:check
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
    - codex
    - github-copilot
    - cursor
    - gemini
    - antigravity
```

---

## Troubleshooting

### Agent Not Appearing in IDE

```bash
# Verify agent exists in source
ls .aios-core/development/agents/

# Sync and validate
npm run sync:ide
npm run sync:ide:check

# Check platform-specific directory
ls .cursor/rules/agents/               # Cursor
ls .claude/commands/AIOS/agents/       # Claude Code
ls .gemini/rules/AIOS/agents/          # Gemini CLI
```

### Sync Conflicts

```bash
# Preview what would change
npm run sync:ide -- --dry-run

# Backup before force sync
cp -r .cursor/rules/ .cursor/rules.backup/
npm run sync:ide
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

## Platform Decision Guide

Use this guide to choose the right platform:

```
Do you use Claude/Anthropic API?
├── Yes --> Claude Code (Best AIOS integration)
└── No
    └── Do you prefer VS Code?
        ├── Yes --> Want an extension?
        │   ├── Yes --> GitHub Copilot (Native GitHub features)
        │   └── No --> GitHub Copilot (Native GitHub features)
        └── No --> Want a dedicated AI IDE?
            ├── Yes --> Which model do you prefer?
            │   ├── Claude/GPT --> Cursor (Most popular AI IDE)
            └── No --> Use Google Cloud?
                ├── Yes --> AntiGravity (Google integration)
                └── No --> Gemini CLI (Specialized)
```

---

## Migration Between IDEs

### From Cursor to Claude Code

```bash
# Export current rules
cp -r .cursor/rules/ ./rules-backup/

# Initialize Claude Code
npm run sync:ide

# Verify migration
diff -r ./rules-backup/ .claude/commands/AIOS/agents/
```

### From Claude Code to Cursor

```bash
# Sync to Cursor
npm run sync:ide:cursor

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
