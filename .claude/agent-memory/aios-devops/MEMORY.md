# Gage (DevOps) - Agent Memory

## MCP Servers Installed

### linkedin (stickerdaniel/linkedin-mcp-server)
- **Added:** 2026-02-28
- **Config location:** `~/.claude.json` under project `/home/ubuntu/aios-core`
- **Command:** `/home/ubuntu/.local/bin/uvx linkedin-mcp-server@latest`
- **Transport:** stdio
- **Dependencies:** `uv` v0.10.7 at `/home/ubuntu/.local/bin/uv`, Chromium at `~/.cache/ms-playwright/chromium-1208`
- **Login required:** `uvx linkedin-mcp-server@latest --login` (manual, needs browser)
- **Note:** Composio MCP (global in `~/.claude.json` mcpServers) kept as-is

## Key Paths
- `uv`/`uvx`: `/home/ubuntu/.local/bin/`
- Patchright Chromium: `/home/ubuntu/.cache/ms-playwright/chromium-1208`
