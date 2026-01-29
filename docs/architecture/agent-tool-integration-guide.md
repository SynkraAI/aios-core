# Agent Tool Integration Guide

> **EN** | PT _(coming soon)_ | ES _(coming soon)_

---

**Version:** 1.0.0
**Last Updated:** 2026-01-26
**Status:** Official Reference

---

## Overview

This guide explains how tools are integrated with AIOS agents. Tools extend agent capabilities by providing access to external services, APIs, and system resources.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Agent Tool Integration                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Agent Definition (.md file with YAML)                     │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  dependencies:                                      │   │
│   │    tools: [git, coderabbit, context7]              │   │
│   │    tasks: [task-a.md, task-b.md]                   │   │
│   │    checklists: [checklist-a.md]                    │   │
│   └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  Tool Types                                         │   │
│   │  ├── CLI Tools (git, npm, gh)                      │   │
│   │  ├── MCP Servers (EXA, Context7, Apify)            │   │
│   │  └── External Services (CodeRabbit, Supabase)      │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Dependency Declaration

Agents declare their dependencies in the YAML block within their `.md` definition file.

### Dependency Types

| Type         | Description                     | Location                         |
| ------------ | ------------------------------- | -------------------------------- |
| `tools`      | CLI tools and external services | System PATH or MCP               |
| `tasks`      | Task workflow files             | `.aios-core/development/tasks/`  |
| `checklists` | Validation checklists           | `.aios-core/product/checklists/` |

### Example Declaration

```yaml
# From .aios-core/development/agents/dev.md
dependencies:
  checklists:
    - story-dod-checklist.md
  tasks:
    - apply-qa-fixes.md
    - create-service.md
    - dev-develop-story.md
    - execute-checklist.md
  tools:
    - coderabbit # Pre-commit code quality review
    - git # Local operations: add, commit, status, diff
    - context7 # Library documentation lookup
    - supabase # Database operations
    - n8n # Workflow automation
    - browser # Web application testing
    - ffmpeg # Media file processing
```

---

## Tool Categories by Agent

### @dev (Dex - Developer Agent)

| Tool         | Type     | Purpose                                 |
| ------------ | -------- | --------------------------------------- |
| `git`        | CLI      | Version control (local operations only) |
| `coderabbit` | External | Pre-commit code quality review          |
| `context7`   | MCP      | Library documentation lookup            |
| `supabase`   | External | Database operations and migrations      |
| `n8n`        | External | Workflow automation                     |
| `browser`    | MCP      | Web application testing                 |
| `ffmpeg`     | CLI      | Media file processing                   |

**Git Restrictions for @dev:**

- Allowed: `git add`, `git commit`, `git status`, `git diff`, `git log`, `git branch`
- Blocked: `git push`, `gh pr create`, `gh pr merge`
- Push operations require @devops agent

### @devops (Gage - DevOps Agent)

| Tool         | Type     | Purpose                            |
| ------------ | -------- | ---------------------------------- |
| `git`        | CLI      | Full git operations including push |
| `gh`         | CLI      | GitHub CLI for PR operations       |
| `docker`     | CLI      | Container operations               |
| `coderabbit` | External | Code review automation             |

**Unique Capabilities:**

- Only agent authorized to push to remote
- Only agent authorized to create/merge PRs
- MCP infrastructure management

### @qa (Quinn - QA Agent)

| Tool         | Type | Purpose                            |
| ------------ | ---- | ---------------------------------- |
| `jest`       | CLI  | Unit testing                       |
| `playwright` | MCP  | E2E testing and browser automation |
| `npm test`   | CLI  | Test runner                        |

### @architect (Aria - Architect Agent)

| Tool       | Type | Purpose                 |
| ---------- | ---- | ----------------------- |
| `exa`      | MCP  | Research and analysis   |
| `context7` | MCP  | Documentation reference |

---

## MCP Integration

### Available MCP Tools

MCP (Model Context Protocol) servers provide structured APIs for agent use.

| MCP Server | Tools Provided                                                   | Used By          |
| ---------- | ---------------------------------------------------------------- | ---------------- |
| EXA        | `web_search_exa`, `company_research_exa`, `get_code_context_exa` | @architect       |
| Context7   | `resolve-library-id`, `query-docs`                               | @dev, @architect |
| Playwright | `browser_navigate`, `browser_screenshot`, `browser_click`        | @qa              |
| Apify      | `search-actors`, `call-actor`, `get-actor-output`                | @devops          |

### MCP Configuration

MCP servers are configured via Docker MCP Toolkit. See [MCP API Keys Management](./mcp-api-keys-management.md) for setup.

### Usage Pattern

```
1. Agent receives task requiring external data
2. Agent identifies appropriate MCP tool from dependencies
3. Agent calls MCP tool via tool interface
4. MCP returns structured response
5. Agent processes response and continues task
```

---

## CodeRabbit Integration

The @dev agent includes CodeRabbit for pre-commit quality checks.

### Configuration

```yaml
coderabbit_integration:
  enabled: true
  installation_mode: wsl # or 'native'

  self_healing:
    enabled: true
    type: light
    max_iterations: 2
    timeout_minutes: 15
    trigger: story_completion
    severity_filter:
      - CRITICAL
    behavior:
      CRITICAL: auto_fix
      HIGH: document_only
      MEDIUM: ignore
      LOW: ignore
```

### Workflow

Before marking story "Ready for Review":

1. Run CodeRabbit on uncommitted changes
2. If CRITICAL issues found, attempt auto-fix (max 2 iterations)
3. Document HIGH issues in story Dev Notes
4. If CRITICAL issues remain after iterations, HALT and notify user

---

## Git Restrictions Architecture

AIOS implements strict git operation governance:

### @dev Agent Permissions

```yaml
git_restrictions:
  allowed_operations:
    - git add
    - git commit
    - git status
    - git diff
    - git log
    - git branch
    - git checkout
    - git merge
  blocked_operations:
    - git push
    - git push --force
    - gh pr create
    - gh pr merge
```

### @devops Agent Permissions

```yaml
git_permissions:
  full_access: true
  special_capabilities:
    - push to remote
    - create pull requests
    - merge pull requests
    - admin bypass for branch protection
```

### Handoff Workflow

```
@dev completes story
    ↓
@dev marks status: "Ready for Review"
    ↓
User activates @devops
    ↓
@devops creates PR and pushes
```

---

## Adding New Tools

### Step 1: Update Agent Definition

Add the tool to the agent's `dependencies.tools` list:

```yaml
dependencies:
  tools:
    - existing-tool
    - new-tool # Add here
```

### Step 2: Document Tool Usage

If the tool requires specific configuration or has special usage patterns, add documentation:

```yaml
tool_integration:
  new-tool:
    purpose: 'Brief description'
    common_commands:
      - 'new-tool --help'
      - 'new-tool run <args>'
    when_to_use: 'Use when X condition is met'
```

### Step 3: Test Integration

Activate the agent and verify the tool is accessible and functional.

---

## Best Practices

### DO

- Declare all tool dependencies in agent definition
- Use appropriate tool for each task type
- Follow agent permission boundaries
- Log tool usage for debugging
- Validate tool outputs before using

### DON'T

- Use tools not declared in dependencies
- Bypass git restrictions (use appropriate agent)
- Ignore tool return codes
- Expose sensitive data in tool logs
- Skip input validation

---

## Troubleshooting

### Tool Not Found

1. Verify tool is installed: `which <tool-name>`
2. Check PATH environment variable
3. Verify tool is declared in agent dependencies

### MCP Tool Errors

1. Check MCP server is running
2. Verify API keys are configured (see [MCP API Keys Management](./mcp-api-keys-management.md))
3. Review tool-specific documentation

### Permission Denied

1. Check if operation is blocked for this agent
2. Verify if @devops should be used instead
3. Check file/directory permissions

---

## Related Documentation

- [MCP API Keys Management](./mcp-api-keys-management.md)
- [MCP Usage Rules](../../../.claude/rules/mcp-usage.md)
- [Agent Definitions](../../../.aios-core/development/agents/)

---

**Maintainer:** @architect (Aria)
