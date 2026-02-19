# Gage (DevOps) Agent Memory

## Key Patterns

### Push Authority
- ONLY agent authorized to push to remote repositories
- All other agents must delegate push operations to @devops
- Pre-push quality gate: lint + typecheck + test must all pass
- PR automation via `github-pr-automation` task

### Version Management
- Version tracking via `version-tracker` utility
- Release management follows `release-checklist.md`
- Conventional Commits: feat:, fix:, docs:, test:, chore:, refactor:
- Branch strategy: main, feat/*, fix/*, docs/*

### CI/CD
- GitHub Actions templates in `.aios-core/product/templates/`
- CI template: `github-actions-ci.yml`
- CD template: `github-actions-cd.yml`
- PR template: `github-pr-template`

### MCP Infrastructure
- All MCP management is EXCLUSIVE to @devops
- Docker MCP Toolkit is primary MCP infrastructure
- Known bug: Docker MCP secrets store doesn't interpolate properly
- Workaround: hardcode env values in `~/.docker/mcp/catalogs/docker-mcp.yaml`

### Worktree Management
- `auto-worktree.yaml` workflow for parallel development
- Tasks: create-worktree, list-worktrees, remove-worktree, cleanup-worktrees, merge-worktree
- Worktrees enable parallel feature development without branch switching

### Asset Management
- `asset-inventory.js` script for codebase asset tracking
- `path-analyzer.js` for path analysis and dependency mapping
- `migrate-agent.js` for agent migration operations

## Key File Locations
- Pre-push checklist: `.aios-core/product/checklists/pre-push-checklist.md`
- Release checklist: `.aios-core/product/checklists/release-checklist.md`
- Branch manager: `.aios-core/development/utils/branch-manager`
- Repository detector: `.aios-core/development/utils/repository-detector`
- Gitignore manager: `.aios-core/development/utils/gitignore-manager`
- Git wrapper: `.aios-core/development/utils/git-wrapper`
- Version tracker: `.aios-core/development/utils/version-tracker`
- Auto worktree workflow: `.aios-core/development/workflows/auto-worktree.yaml`

## Domain Knowledge
- 15+ tasks covering full DevOps lifecycle
- 4 utility modules for git operations
- 3 scripts for asset/path analysis
- GitHub CLI (`gh`) is the primary tool for GitHub operations
- Docker Gateway for MCP container operations

## Gotchas
- NEVER force push to main/master without explicit user approval
- Pre-push quality gate failures should be fixed, not bypassed (no --no-verify)
- Docker MCP secrets bug (Dec 2025): credentials not passed to containers via template interpolation
- Windows git bash: combined commands with `&&` and `echo` can produce exit code 1 even when output is correct
- Always use `git wrapper` utilities instead of raw git commands when available
