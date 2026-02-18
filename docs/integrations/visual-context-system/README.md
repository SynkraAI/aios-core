# AIOS Visual Context System

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/SynkraAI/aios-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![AIOS Compatible](https://img.shields.io/badge/AIOS-Compatible-success.svg)](https://github.com/SynkraAI/aios-core)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-2.0%2B-purple.svg)](https://claude.ai/code)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux-lightgrey.svg)]()

A rich statusline and terminal integration system for Claude Code with AIOS context support.

## Features

- **Rich Statusline** — Model, cost, duration, tokens and visual progress bar in real-time
- **Two-Line Layout** — Optimized format that doesn't compress the input area
- **Terminal Integration** — Auto-update tab title when changing context
- **System Monitoring** — CPU, RAM, date and time (macOS + Linux)
- **Multi-Project Support** — Independent contexts per project
- **Customizable** — Colors, format and elements are fully configurable

## Preview

**Line 1:** Session metrics + AIOS context
```
🤖 Sonnet 4.5 | ██████░░░░ 60% 120k | 💰 $3.45 ⏱ 5m | 🎨 Design System
```

**Line 2:** System and location
```
📁 ~/aios-core:main | 💻 35%/72% | 📅 12/02/26 🕐 19:35
```

## Quick Start

### Installation (3 steps)

```bash
# 1. Copy statusline.sh to Claude Code config dir
cp .aios-core/infrastructure/scripts/statusline.sh ~/.claude/
chmod +x ~/.claude/statusline.sh

# 2. Configure Claude Code (~/.claude/settings.json)
# Add:
# {
#   "statusLine": {
#     "type": "command",
#     "command": "/Users/YOUR_USERNAME/.claude/statusline.sh"
#   }
# }

# 3. Restart Claude Code — done!
```

> **Note:** Replace `YOUR_USERNAME` with your actual username. Run `echo $USER` to find it.

### AIOS Context (Optional)

If you use the AIOS Framework, create/edit `.aios/session.json` in your project root to customize context displayed in the statusline:

```json
{
  "project": {
    "name": "my-project",
    "emoji": "🚀",
    "displayTitle": "My Custom Title",
    "titleEmoji": "🎨"
  },
  "status": {
    "progress": "3/10",
    "emoji": "🔨",
    "phase": "implementation"
  }
}
```

> **Planned:** CLI commands (`npx aios-core context set-title`, `context set`, `context show`) will be available in a future release. Currently, edit `.aios/session.json` directly.

## What It Shows

### Session Metrics (Line 1)

| Element | Description | Example |
|---------|-------------|---------|
| 🤖 Model | AI model in use | `Sonnet 4.5` |
| Progress Bar | Visual context usage | `██████░░░░` |
| Percentage | % of context used | `60%` |
| Tokens | Tokens consumed | `120k` |
| 💰 Cost | Session cost | `$3.45` |
| ⏱ Duration | Elapsed time | `5m` |
| Context | Custom AIOS context | `🎨 Design System` |

### System & Location (Line 2)

| Element | Description | Example |
|---------|-------------|---------|
| 📁 Directory | Current directory | `~/aios-core` |
| Branch | Git branch | `main` |
| 💻 CPU/RAM | System resources | `35%/72%` |
| 📅 Date | Current date | `12/02/26` |
| 🕐 Time | Current time | `19:35` |

## Scripts

All scripts live under `.aios-core/infrastructure/scripts/`:

| Script | Purpose |
|--------|---------|
| `statusline.sh` | Main statusline script (read by Claude Code) |
| `terminal/update-tab-title.sh` | Updates terminal tab title from session context |
| `terminal/zsh-integration.sh` | zsh hooks for automatic tab title updates |
| `terminal/prompt-injector.sh` | Optional PS1 prompt integration |

## Terminal Integration (Optional)

To auto-update your terminal tab title based on AIOS session context:

```bash
# Add to ~/.zshrc
source /path/to/aios-core/.aios-core/infrastructure/scripts/terminal/zsh-integration.sh
```

## Requirements

### Required
- **Claude Code** 2.0+
- **macOS** (Sequoia 15+) or **Linux**
- **jq** for JSON parsing
- **Shell:** zsh or bash

### Install jq

```bash
# macOS
brew install jq

# Linux (Ubuntu/Debian)
sudo apt-get install jq

# Linux (Fedora)
sudo dnf install jq
```

## Customization

Edit `~/.claude/statusline.sh` to change colors, progress bar characters, or layout.

See [CUSTOMIZATION.md](CUSTOMIZATION.md) for the full guide.

## Documentation

| Document | Description |
|----------|-------------|
| [INSTALL.md](INSTALL.md) | Step-by-step installation guide |
| [QUICK-START.md](QUICK-START.md) | Get started in 5 minutes |
| [CUSTOMIZATION.md](CUSTOMIZATION.md) | Customize colors, format and elements |
| [CHANGELOG.md](CHANGELOG.md) | Version history |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Claude Code (Interface)                                 │
├─────────────────────────────────────────────────────────┤
│ ~/.claude/statusline.sh (Main Script)                   │
│ • Reads Claude Code metrics via stdin (JSON)            │
│ • Integrates with .aios/session.json                    │
│ • Renders 2 formatted lines                             │
├─────────────────────────────────────────────────────────┤
│ Terminal Integration (Optional)                         │
│ • update-tab-title.sh - Updates tab title               │
│ • zsh-integration.sh  - Shell hooks                     │
│ • prompt-injector.sh  - PS1 injection                   │
├─────────────────────────────────────────────────────────┤
│ AIOS CLI Commands (Planned)                             │
│ • context set-title --emoji - Set themed title          │
│ • context set - Set progress                            │
│ • context show - View state                             │
└─────────────────────────────────────────────────────────┘
```

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT License - Copyright (c) 2026 Luiz Fosc

---

Built for the [AIOS Framework](https://github.com/SynkraAI/aios-core) (Synkra AI Operating System)
