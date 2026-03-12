---
paths: **/*
---

# MCP Server Usage Rules

## MCP Governance

All MCP infrastructure management is handled EXCLUSIVELY by **@devops (Gage)**.

| Operation | Agent | Command |
|-----------|-------|---------|
| Search MCP catalog | @devops | `*search-mcp` |
| Add/Remove MCP server | @devops | `*add-mcp` / `*remove-mcp` |
| List enabled MCPs | @devops | `*list-mcps` |

Other agents are MCP **consumers**, not administrators.

## Tool Selection Priority (CRITICAL)

ALWAYS prefer native Claude Code tools over MCP servers:

| Task | USE THIS | NOT THIS |
|------|----------|----------|
| Read files | `Read` tool | docker-gateway |
| Write files | `Write` / `Edit` tools | docker-gateway |
| Run commands | `Bash` tool | docker-gateway |
| Search files | `Glob` tool | docker-gateway |
| Search content | `Grep` tool | docker-gateway |

### NEVER use docker-gateway for:
- Reading/writing local files
- Running shell commands on host
- Searching files or directories
- Running Node.js or Python scripts on host

## MCP Servers Available

| MCP | Access | Purpose |
|-----|--------|---------|
| playwright | Direct | Browser automation, screenshots |
| EXA | Docker | Web search, research |
| Context7 | Docker | Library documentation |
| Apify | Docker | Web scraping, social media data |
| Google Workspace | Direct | Sheets, Drive, Calendar, Gmail |

## Reference

Detailed per-MCP usage guides, access patterns, and known issues: `.claude/references/mcp-usage-detail.md`
