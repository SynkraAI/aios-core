# Navigator Squad - Installation Guide

## Automatic Installation (Recommended)

### Via AIOS Installer (Future)

```bash
npx aios-core install --squad navigator
```

This will:
1. Copy squad files to project
2. Install git hooks automatically
3. Install NPM dependencies
4. Run health check

### Manual Installation (Current)

```bash
# 1. Install NPM dependencies
npm install js-yaml glob inquirer

# 2. Install git hooks
node squads/navigator/scripts/install-hooks.js

# 3. Verify installation
@navigator
*navigator-doctor
```

---

## Git Hooks

Navigator uses a post-commit git hook to automatically update roadmaps when stories change.

### Install Hook

```bash
node squads/navigator/scripts/install-hooks.js
```

**What it does:**
- Adds Navigator hook to `.husky/post-commit`
- Non-blocking (async execution)
- Silent failures (won't block commits)

### Check Installation

```bash
node squads/navigator/scripts/install-hooks.js --check
```

### Uninstall Hook

```bash
node squads/navigator/scripts/install-hooks.js --uninstall
```

### View Status

```bash
node squads/navigator/scripts/install-hooks.js --status
```

---

## Dependencies

### Required

- **Node.js** >= 18.0.0
- **Git** (any version)
- **NPM Packages:**
  - `js-yaml` - YAML parsing for pipeline map
  - `glob` - File pattern matching
  - `inquirer` - Interactive prompts

### Optional

- **Husky** - Git hooks management (recommended)

---

## Directory Structure

After installation, Navigator files will be in:

```
./squads/navigator/
├── squad.yaml              # Manifest
├── README.md               # Documentation
├── INSTALL.md              # This file
├── agents/
│   └── navigator.md        # Vega persona definition
├── tasks/
│   ├── nav-map-project.md
│   ├── nav-where-am-i.md
│   ├── nav-auto-navigate.md
│   └── ... (10 tasks total)
├── templates/
│   ├── nav-roadmap-tmpl.md
│   └── ... (4 templates)
├── scripts/
│   ├── navigator/
│   │   ├── roadmap-sync.js
│   │   ├── phase-detector.js
│   │   ├── checkpoint-manager.js
│   │   ├── orchestrator.js
│   │   ├── post-commit-hook.js
│   │   └── doctor.js
│   └── install-hooks.js
└── data/
    └── navigator-pipeline-map.yaml
```

---

## Verification

After installation, verify everything works:

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

## Troubleshooting

### Issue: Health check fails - Missing dependencies

**Solution:**
```bash
npm install js-yaml glob inquirer
```

### Issue: Git hook not working

**Solution:**
```bash
# Reinstall Husky
npm run prepare

# Install Navigator hook
node squads/navigator/scripts/install-hooks.js

# Verify
node squads/navigator/scripts/install-hooks.js --check
```

### Issue: Permission denied on scripts

**Solution:**
```bash
chmod +x squads/navigator/scripts/**/*.js
```

---

## Integration with AIOS Installer

To integrate Navigator with `npx aios-core install`, add to installer:

```javascript
// packages/installer/src/install-squads.js

async function installNavigatorSquad() {
  // 1. Check prerequisites
  await checkNodeVersion('18.0.0');
  await checkGitAvailable();

  // 2. Install NPM dependencies
  await installDependencies(['js-yaml', 'glob', 'inquirer']);

  // 3. Install git hooks
  await exec('node squads/navigator/scripts/install-hooks.js');

  // 4. Run health check
  const healthCheck = await exec('node squads/navigator/scripts/navigator/doctor.js');

  if (healthCheck.exitCode !== 0) {
    throw new Error('Navigator health check failed');
  }

  console.log('✓ Navigator squad installed successfully');
}
```

---

## Uninstallation

To remove Navigator:

```bash
# 1. Uninstall git hooks
node squads/navigator/scripts/install-hooks.js --uninstall

# 2. Remove squad directory
rm -rf squads/navigator/

# 3. (Optional) Remove dependencies if not used by other squads
npm uninstall js-yaml glob inquirer
```

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/SynkraAI/aios-core/issues
- Health Check: `*navigator-doctor`
- Documentation: `squads/navigator/README.md`

---

*Navigator Squad Installation Guide*
