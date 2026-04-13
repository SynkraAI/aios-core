# Pipeline Quest Dashboard

Real-time gamified dashboard for the Pipeline Checklist skill.
Open on a second monitor and watch your progress update live.

## Quick Start

```bash
# From any project directory:
node ~/aios-core/tools/pipeline-dashboard/server.js /path/to/project

# Opens at http://localhost:3333
```

## How It Works

1. The server watches `.aiox/pipeline-checklist.yaml` in your project
2. When the file changes (via `/pipeline-checklist check N`), the server broadcasts via WebSocket
3. The browser dashboard updates instantly with animations

## Themes

Switch between 3 themes using the buttons in the top-right corner:

- **Cyberpunk** — Dark glassmorphism, neon glow, gradient orbs
- **Minimal** — Clean slate, subtle animations, Linear/Vercel aesthetic
- **Fantasy** — Medieval parchment, gold accents, RPG quest log

Theme preference is saved in localStorage.

## Features

- Real-time updates via WebSocket + fs.watch
- XP system (1000 XP total across 44 missions)
- 7 levels (Apprentice Builder to Legend)
- 14 achievements with unlock animations
- 8 themed worlds with progress bars
- Celebration overlays for big milestones
- Auto-reconnect on disconnect
- Responsive (1080p to 4K)

## Custom Port

```bash
PORT=4444 node ~/aios-core/tools/pipeline-dashboard/server.js /path/to/project
```
