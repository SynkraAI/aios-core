# Installation Guide

## Prerequisites

- **Node.js** >= 18.0.0
- **Git** (any version)
- **AIOS Core** initialized (`.aios-core/` exists in your project)

---

## Included with AIOS Core

Navigator ships with AIOS Core. After installing AIOS, Navigator is already available:

```bash
# Install AIOS Core (Navigator is included)
npx aios-core install

# Activate Navigator
@navigator

# Verify everything works
*navigator-doctor
```

If the health check passes (7/7), you're ready to go. Skip to [Verify Installation](#verify-installation).

---

## Manual Setup

If health check reports issues, fix them manually:

### 1. Install Dependencies

```bash
npm install js-yaml glob inquirer
```

### 2. Install Git Hooks

```bash
node squads/navigator/scripts/install-hooks.js
```

This adds a post-commit hook to `.husky/post-commit` that automatically updates your roadmap when stories change. The hook is:
- **Non-blocking** — runs asynchronously
- **Silent** — failures don't interrupt commits

### 3. Verify

```bash
@navigator
*navigator-doctor
```

---

## Git Hooks

Navigator uses a post-commit hook to keep roadmaps in sync automatically.

### Manage Hooks

```bash
# Install
node squads/navigator/scripts/install-hooks.js

# Check status
node squads/navigator/scripts/install-hooks.js --status

# Uninstall
node squads/navigator/scripts/install-hooks.js --uninstall
```

### What the Hook Does

On every commit, the hook checks if any files in `docs/stories/` were changed. If so, it:
1. Detects the current phase
2. Syncs the roadmap (central + local)
3. Creates an auto-checkpoint if a phase transition occurred

---

## Verify Installation

```bash
@navigator
*navigator-doctor
```

**Expected output:**

```
🧭 Navigator Health Check

✓ Node.js v20.x.x (>= 18.0.0)
✓ git version 2.x.x
✓ All required packages installed (js-yaml, glob, inquirer)
✓ Navigator post-commit hook installed
✓ All required directories exist
✓ Pipeline map valid (10 phases)
✓ All 6 scripts present and readable

7/7 checks passed

✅ Navigator is healthy!
```

---

## Directory Structure

After installation, Navigator files live in:

```
squads/navigator/
├── squad.yaml              # Manifest
├── agents/
│   └── navigator.md        # Vega persona
├── tasks/                  # 10 task definitions
├── scripts/
│   ├── navigator/          # Core engine (6 scripts)
│   └── install-hooks.js    # Hook installer
├── templates/              # 4 Mustache-style templates
├── data/
│   └── navigator-pipeline-map.yaml
└── examples/               # Practical tutorials
```

Runtime data is stored in:

```
.aios/navigator/{project-name}/
├── roadmap.md              # Central roadmap (source of truth)
└── checkpoints/            # Project state snapshots
```

---

## Uninstallation

```bash
# 1. Remove git hooks
node squads/navigator/scripts/install-hooks.js --uninstall

# 2. Remove runtime data (optional)
rm -rf .aios/navigator/

# 3. Remove squad files (optional)
rm -rf squads/navigator/
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Missing dependencies | `npm install js-yaml glob inquirer` |
| Git hook not triggering | `npm run prepare && node squads/navigator/scripts/install-hooks.js` |
| Permission denied on scripts | `chmod +x squads/navigator/scripts/**/*.js` |
| Pipeline map invalid | Check YAML syntax in `data/navigator-pipeline-map.yaml` |

For more, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

---

## Support

- **Health Check:** `*navigator-doctor`
- **Issues:** [github.com/SynkraAI/aios-core/issues](https://github.com/SynkraAI/aios-core/issues)
- **Docs:** [README.md](./README.md) · [QUICKSTART.md](./QUICKSTART.md)
