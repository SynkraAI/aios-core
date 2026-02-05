# AIOS Pro Developer Workflow

This guide covers the two developer workflows for working with the AIOS Open Core architecture.

## Architecture Overview

AIOS uses a dual-repository Open Core model:

- **aios-core** (public) — Open-source framework, available to everyone
- **aios-pro** (private) — Premium features, available to team members and licensees

The `pro/` directory in aios-core is a git submodule pointing to the aios-pro repository.

```
aios-core/
├── bin/
├── src/
├── packages/
├── pro/ ─── git submodule ──► SynkraAI/aios-pro (private)
├── squads/ (community)
└── package.json
```

---

## Workflow 1: Core-Only Developer (Open-Source Contributor)

This is the default workflow. The pro/ submodule is not needed.

### Setup

```bash
# Fork via GitHub UI, then clone your fork
git clone https://github.com/YOUR_USERNAME/aios-core.git
cd aios-core

# Add upstream remote
git remote add upstream https://github.com/SynkraAI/aios-core.git

# Install dependencies
npm install

# Verify setup
npm test
npm run lint
```

### Development

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes, then run quality gates
npm run lint
npm run typecheck
npm test

# Commit and push
git add <files>
git commit -m "feat: description of change"
git push origin feature/my-feature
```

### Important Notes

- The `pro/` directory will NOT exist — this is expected
- All core tests pass without `pro/` present
- `bin/utils/pro-detector.js` returns `isProAvailable() === false`
- No features are degraded for core-only developers
- You do NOT need access to SynkraAI/aios-pro

---

## Workflow 2: Pro Developer (Team Member with Access)

Team members with access to the private aios-pro repository can work on both repos.

### Initial Setup (New Clone)

```bash
# Clone with submodules
git clone --recurse-submodules https://github.com/SynkraAI/aios-core.git
cd aios-core

# Install dependencies
npm install

# Verify pro is available
node -e "const p = require('./bin/utils/pro-detector'); console.log(p.getProInfo())"
# Expected: { available: true, version: '0.1.0', path: '...' }
```

### Adding Pro to Existing Clone

```bash
cd aios-core

# Initialize the submodule
git submodule update --init pro

# Verify
ls pro/package.json
```

### Future: CLI Setup Command

```bash
# (Coming in a future story)
aios setup --pro
```

### Working on Pro Modules

```bash
# Navigate into pro/ to work on premium features
cd pro

# Make changes to pro modules
# ...

# Commit pro changes (separate from core)
git add <files>
git commit -m "feat: add new premium squad template"
git push origin main
```

### Working on Core + Pro Together

```bash
# From aios-core root
cd aios-core

# Make core changes
# Edit bin/utils/some-file.js

# Switch to pro for related changes
cd pro
# Edit squads/new-feature.js
git add . && git commit -m "feat: new feature (pro side)"
git push

# Back to core
cd ..
# The pro/ submodule pointer has changed
git add pro
git add <other core files>
git commit -m "feat: new feature (core side) + update pro ref"
```

### Keeping Pro Updated

```bash
# Pull latest pro changes
cd pro
git pull origin main
cd ..

# Update the submodule pointer in core
git add pro
git commit -m "chore: update pro submodule ref"
```

### Push Order

Always push in this order:
1. Push `pro/` changes first: `cd pro && git push`
2. Push `aios-core` changes second: `cd .. && git push`

This ensures the submodule pointer in aios-core references a valid commit in aios-pro.

---

## Pro Detection in Code

The `bin/utils/pro-detector.js` module provides safe conditional loading:

```javascript
const { isProAvailable, loadProModule, getProVersion } = require('./bin/utils/pro-detector');

// Check if pro is available
if (isProAvailable()) {
  console.log('AIOS Pro v' + getProVersion() + ' detected');

  // Load a pro module safely (returns null if not found)
  const proSquads = loadProModule('squads/squad-creator-pro');
  if (proSquads) {
    // Use pro functionality
  }
}
```

---

## CI/CD Behavior

| Repository | Checkout | Tests | Publish |
|------------|----------|-------|---------|
| **aios-core** | Without submodules | Core-only (pro/ absent) | npm (excludes pro/) |
| **aios-pro** | With aios-core cloned | Integration (pro/ symlinked) | GitHub Packages |

---

## Troubleshooting

### pro/ directory exists but is empty

```bash
# The submodule wasn't initialized
git submodule update --init pro
```

### Permission denied when cloning submodule

You need access to `SynkraAI/aios-pro`. Contact the team lead.

### Tests fail with pro/ present

This should not happen — core tests must pass with or without pro/. If it does, file a bug.

### Submodule pointer out of sync

```bash
# Check submodule status
git submodule status

# Reset to the committed pointer
git submodule update pro
```

---

## Reference

- [ADR-PRO-001: Repository Strategy](../../architecture/adr/adr-pro-001-repository-strategy.md)
- [Story PRO-5: Repository Bootstrap](../../stories/epics/epic-pro-aios-pro-architecture/story-pro-5-repo-bootstrap.md)
