# Magic BOB - Tech Stack

## Core Dependencies

### Runtime
- **Node.js:** ≥18.x (ES modules support)
- **JavaScript:** ES2022+ features

### AIOS Core Modules

| Module | Version | Purpose |
|--------|---------|---------|
| `executor-assignment` | Epic 11.1 | Dynamic agent selection |
| `terminal-spawner` | Epic 11.2 | Agent spawning in terminals |
| `workflow-executor` | Epic 11.3 | Development cycle execution |
| `surface-checker` | Epic 11.4 | Decision criteria evaluation |
| `session-state` | Epic 11.5 | Crash recovery & persistence |

### File System
- **YAML:** Configuration and manifests
- **JSON:** Session state and dashboard bridge
- **Markdown:** Documentation and agent definitions

## Observability Stack

### CLI (Primary)
- **stdout/stderr:** ANSI escape codes for panels
- **panel-renderer.js:** Real-time terminal UI
- **Refresh rate:** 1000ms (configurable)

### Dashboard Bridge (Optional)
- **bob-status.json:** File-based state sharing
- **WebSocket:** Real-time events (port 4001)
- **Fallback:** Polling → SSE → file-only

## State Management

### Session State
- **Format:** YAML
- **Location:** `.aios/.session-state.yaml`
- **Backup:** `.aios/snapshots/*.json`
- **Retention:** 30 days (auto-archive)

### Lock Files
- **Format:** YAML
- **Location:** `.aios/locks/*.lock`
- **TTL:** 300s (5 minutes)
- **Cleanup:** Auto on startup

## Security

### Process Isolation
- Terminal spawning with clean environment
- UID validation before SIGTERM
- No eval() or dynamic code execution

### File Permissions
- Session state: `0600` (rw-------)
- Lock files: `0644` (rw-r--r--)
- Config files: `0644` (rw-r--r--)

## Integration Points

### CodeRabbit (Self-Healing)
- **CLI:** `coderabbit` command
- **Filter:** CRITICAL and HIGH issues only
- **Max iterations:** 3
- **Fallback:** Log issues for QG

### Git Operations
- **CLI:** `git` command
- **Operations:** status, add, commit, push (via @devops only)
- **Hooks:** Pre-commit, pre-push

### GitHub CLI
- **CLI:** `gh` command
- **Operations:** pr create, pr view, issue list
- **Auth:** GitHub token

## External Tools (Optional)

### MCP Servers
- **EXA:** Web search and research
- **Context7:** Library documentation
- **Apify:** Web scraping

### AI Models
- **Default:** claude-opus-4-5-20250514
- **Fallback:** claude-sonnet-4-5-20250929
- **Budget:** Configurable via surface criteria

## Performance

### Optimization Strategies
- Async/parallel file operations
- Epic context compression (8000 token limit)
- Lazy loading of session state
- Incremental observability updates

### Resource Limits
- **Max terminals:** 10 concurrent
- **Session state:** ≤ 5MB
- **Lock TTL:** 300s
- **Panel refresh:** 1s

## Platform Support

| Platform | Terminal | Status |
|----------|----------|--------|
| macOS | Terminal.app, iTerm2 | ✅ Native |
| Windows | WSL + Windows Terminal | ✅ Via WSL |
| Linux | gnome-terminal, xterm | ✅ Native |
| CI/CD | GitHub Actions | ✅ Fallback inline |
| Docker | node:18-alpine | ✅ Fallback inline |

## Development Tools

### Testing
- **Unit:** Jest
- **Integration:** Jest + fixtures
- **E2E:** Playwright (for dashboard)

### Linting
- **ESLint:** airbnb-base config
- **Prettier:** Code formatting

### Type Checking
- **JSDoc:** TypeScript-style annotations
- **VS Code:** IntelliSense support

---

**Last Updated:** 2026-02-15
**AIOS Version:** 2.1.0+
