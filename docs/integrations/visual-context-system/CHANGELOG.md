# Changelog

Version history for the AIOS Visual Context System.

## [2.1.0] - 2026-02-18

### Fixed

- **Security: awk command injection** — All `awk` calls now use `-v` flag for safe variable passing instead of interpolating shell variables in double-quoted programs
- **Performance: replaced `top -l 1`** — macOS CPU monitoring now uses `ps -A -o %cpu` and `vm_stat` instead of `top -l 1` (which took 1-2 seconds per call)
- **Git worktree support** — Replaced `[ -d .git ]` with `git rev-parse --is-inside-work-tree` for proper worktree detection
- **JSON fallback parser** — Fixed `parse_json_field` grep fallback for nested fields (e.g., `.project.displayTitle`)
- **zsh-integration.sh shebang** — Changed `#!/bin/bash` to `#!/bin/zsh` since the file is designed to be sourced into zsh

### Changed

- **Linux compatibility** — Added OS detection (`$OSTYPE`) with `/proc/stat` and `/proc/meminfo` support for CPU/RAM on Linux
- **Consolidated jq calls** — `prompt-injector.sh`, `statusline.sh`, and `update-tab-title.sh` now use single `jq` invocations instead of multiple separate calls
- **Documentation in English** — Main README and guides translated to English for international contributors
- **Removed duplicate scripts** — Scripts in `docs/integrations/visual-context-system/scripts/` removed; single source of truth is `.aios-core/infrastructure/scripts/`
- **Removed binary images** — PNG files removed from the repo to avoid inflating repository size

### Removed

- `docs/integrations/visual-context-system/scripts/` — Duplicate script copies
- `docs/integrations/visual-context-system/images/` — Binary PNG files
- `docs/integrations/visual-context-system/SCREENSHOT-GUIDE.md` — Referenced removed images
- `set-title.js` CLI command — Deferred to a future PR for proper CLI integration

---

## [2.0.0] - 2026-02-12

### Added

- **Themed Emoji Title** — `titleEmoji` field in `.aios/session.json` for themed tab titles
- **Two-Line Layout** — Optimized 2-line statusline format to avoid compressing input area
  - Line 1: Claude session metrics + AIOS context
  - Line 2: System and location (dir, branch, CPU/RAM, date/time)

### Changed

- **statusline.sh** — Reformatted to 2 lines with `titleEmoji` support
- **update-tab-title.sh** — Updated to use `titleEmoji` when available
- Smart truncation of long titles (35 chars) keeping emoji visible

### Fixed

- Statusline no longer breaks into 3-4 lines compressing the input area
- Long titles now truncated with "..."

---

## [1.0.0] - 2026-02-10

### Initial Release

- Custom statusline for Claude Code
- Terminal integration (tab title)
- Visual context progress bar
- Session metrics display (cost, time, tokens)
- AIOS context integration
- Complete documentation (INSTALL, QUICK-START, CUSTOMIZATION)
