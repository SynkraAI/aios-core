# Quick Start - AIOS Visual Context System

Get started with the Visual Context System in 5 minutes!

## Quick Start (3 steps)

### 1. Install Statusline

```bash
# Copy script
cp .aios-core/infrastructure/scripts/statusline.sh ~/.claude/
chmod +x ~/.claude/statusline.sh

# Configure Claude Code (~/.claude/settings.json)
# {
#   "statusLine": {
#     "type": "command",
#     "command": "/Users/YOUR_USERNAME/.claude/statusline.sh"
#   }
# }
```

### 2. Restart Claude Code

Close and reopen Claude Code.

### 3. See the Result!

You should see:
```
🤖 Sonnet 4.5 | ████░░ 75% 150k | 💰 $5.23 ⏱ 10m
📁 ~/your-project:main | 💻 45%/75% | 📅 12/02/26 🕐 19:35
```

## Use with AIOS (Optional)

If you use the AIOS Framework, create/edit `.aios/session.json` to customize context:

```json
{
  "project": {
    "name": "my-project",
    "emoji": "🎨",
    "displayTitle": "Design Sprint",
    "titleEmoji": "🎨"
  },
  "status": {
    "progress": "3/10",
    "phase": "implementation"
  }
}
```

> **Planned:** CLI commands (`npx aios-core context set-title`, etc.) will be available in a future release.

## Understanding the Statusline

### Line 1: Session Metrics
```
🤖 Sonnet 4.5 | ████░░ 75% 150k | 💰 $5.23 ⏱ 10m | 🎨 Design System
```

- `🤖 Sonnet 4.5` — AI model in use
- `████░░` — Visual progress bar (context used)
- `75%` — Context used percentage
- `150k` — Tokens consumed
- `💰 $5.23` — Session cost
- `⏱ 10m` — Elapsed time
- `🎨 Design System` — AIOS context (if configured)

### Line 2: System & Location
```
📁 ~/aios-core:main | 💻 45%/75% | 📅 12/02/26 🕐 19:35
```

- `📁 ~/aios-core:main` — Current directory and git branch
- `💻 45%/75%` — CPU and RAM usage
- `📅 12/02/26` — Current date
- `🕐 19:35` — Current time

## Recommended Emojis by Theme

| Theme | Emoji |
|-------|-------|
| Design | 🎨 |
| Backend | ⚙️ |
| Frontend | ⚛️ |
| Mind Clone | 🧠 |
| Database | 🗄️ |
| Testing | 🧪 |
| Deploy | 🚀 |
| Marketing | 📢 |
| Docs | 📚 |
| Bug Fix | 🐛 |

## Next Steps

- [CUSTOMIZATION.md](CUSTOMIZATION.md) — Customize colors and format
- [INSTALL.md](INSTALL.md) — Full installation guide
- [CHANGELOG.md](CHANGELOG.md) — Version history
