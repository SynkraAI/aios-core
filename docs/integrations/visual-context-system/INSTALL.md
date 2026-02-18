# Installation Guide - AIOS Visual Context System

Complete guide to install and configure the Visual Context System.

## Prerequisites

### Required
- **Claude Code 2.0+** installed
- **jq** for JSON parsing

### Install jq

```bash
# Check if jq is installed
which jq

# If not installed:
# macOS
brew install jq

# Linux (Ubuntu/Debian)
sudo apt-get install jq

# Linux (Fedora)
sudo dnf install jq
```

## Installation

### Step 1: Copy Statusline Script

```bash
# Copy statusline.sh to Claude Code config directory
cp .aios-core/infrastructure/scripts/statusline.sh ~/.claude/

# Make it executable
chmod +x ~/.claude/statusline.sh
```

### Step 2: Configure Claude Code

Edit `~/.claude/settings.json` and add:

```json
{
  "statusLine": {
    "type": "command",
    "command": "/Users/YOUR_USERNAME/.claude/statusline.sh"
  }
}
```

> **Important**: Replace `YOUR_USERNAME` with your actual username!

```bash
# Find your username
echo $USER
# Example result: luizfosc
# Use: /Users/luizfosc/.claude/statusline.sh
```

### Step 3: Install Terminal Integration (Optional but Recommended)

```bash
# Add to your ~/.zshrc
echo 'source /path/to/aios-core/.aios-core/infrastructure/scripts/terminal/zsh-integration.sh' >> ~/.zshrc

# Reload shell
source ~/.zshrc
```

## Verify Installation

### 1. Verify Statusline

Restart Claude Code. You should see:
```
🤖 Sonnet 4.5 | ████░░ 75% 150k | 💰 $5.23 ⏱ 10m | 🎨 My Project
📁 ~/aios-core:main | 💻 45%/75% | 📅 12/02/26 🕐 19:35
```

### 2. Verify Tab Title (if terminal integration installed)

```bash
# Navigate to a directory with .aios/session.json
cd ~/aios-core

# The tab title should update automatically
```

## Troubleshooting

### Statusline doesn't appear

1. Verify settings.json is correct
2. Verify the full path to statusline.sh
3. Restart Claude Code completely

### jq errors

```bash
# If you see "jq: command not found"
brew install jq  # macOS
sudo apt-get install jq  # Linux
```

### Tab title doesn't update

1. Verify zsh-integration.sh is sourced in ~/.zshrc
2. Reload shell: `source ~/.zshrc`
3. Verify .aios/session.json exists in the directory

## Next Steps

- [QUICK-START.md](QUICK-START.md) — Get started
- [CUSTOMIZATION.md](CUSTOMIZATION.md) — Customize colors and format
- [CHANGELOG.md](CHANGELOG.md) — Version history
