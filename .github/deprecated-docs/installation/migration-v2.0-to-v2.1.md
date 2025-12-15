# Migration Guide: AIOS v2.0 to v2.1

**Version:** 2.1.0
**Last Updated:** 2025-11-24
**Migration Time:** 15-30 minutes

---

## Table of Contents

- [Overview](#overview)
- [What's New in v2.1](#whats-new-in-v21)
- [Breaking Changes](#breaking-changes)
- [Pre-Migration Checklist](#pre-migration-checklist)
- [Upgrade Procedure](#upgrade-procedure)
- [Configuration Migration](#configuration-migration)
- [Post-Migration Validation](#post-migration-validation)
- [Rollback Procedure](#rollback-procedure)
- [FAQ](#faq)

---

## Overview

AIOS v2.1 introduces significant improvements to the installation experience, cross-platform support, and IDE integrations. This guide helps you migrate from v2.0 to v2.1 safely.

**Migration complexity:** Low to Medium
**Estimated time:** 15-30 minutes
**Risk level:** Low (with proper backup)

---

## What's New in v2.1

### Installation Improvements

| Feature             | v2.0         | v2.1                         |
| ------------------- | ------------ | ---------------------------- |
| Installation method | Manual setup | `npx aios-fullstack install` |
| Installation time   | 2-4 hours    | 5 minutes                    |
| Success rate        | ~60%         | 98%                          |
| Interactive wizard  | No           | Yes                          |
| Cross-platform      | Limited      | Full (Win/Mac/Linux)         |

### New Features

1. **Interactive Installation Wizard**
   - Step-by-step guided setup
   - IDE auto-detection
   - Component selection with multiselect

2. **Multi-IDE Support**
   - Claude Code (improved)
   - Cursor
   - Windsurf
   - Trae
   - Roo Code
   - Cline
   - Gemini CLI
   - GitHub Copilot

3. **Expansion Packs System**
   - Modular add-ons
   - HybridOps pack for ClickUp integration
   - Easy install/update of packs

4. **Cross-Platform Testing**
   - Full Windows support
   - Full macOS support
   - Full Linux support
   - Consistent behavior across platforms

5. **Error Handling & Rollback**
   - Automatic rollback on failure
   - Better error messages
   - Recovery suggestions

### Agent Improvements

| Agent | Improvements                                            |
| ----- | ------------------------------------------------------- |
| `dev` | Decision logging in yolo mode, better story integration |
| `qa`  | Backlog management commands, CodeRabbit integration     |
| `sm`  | Story creation workflow improvements                    |
| All   | Contextual greetings, project status in activation      |

---

## Breaking Changes

### 1. Directory Structure Changes

**v2.0:**

```
.bmad-core/           # Old name
├── agents/
├── tasks/
└── ...
```

**v2.1:**

```
.aios-core/           # New name
├── agents/
├── tasks/
├── scripts/          # New: utility scripts
└── core-config.yaml  # Enhanced configuration
```

**Migration action:** Rename `.bmad-core/` to `.aios-core/`

---

### 2. Configuration File Changes

**v2.0 core-config.yaml:**

```yaml
markdownExploder: true
prd:
  prdFile: docs/prd.md
devLoadAlwaysFiles:
  - docs/architecture/coding-standards.md
```

**v2.1 core-config.yaml:**

```yaml
markdownExploder: true
qa:
  qaLocation: docs/qa # New
prd:
  prdFile: docs/prd.md
  prdVersion: v4 # New
  prdSharded: true # New
  prdShardedLocation: docs/prd # New
architecture:
  architectureFile: docs/architecture.md
  architectureVersion: v4 # New
  architectureSharded: true # New
  architectureShardedLocation: docs/architecture # New
devLoadAlwaysFiles:
  - docs/framework/coding-standards.md # Changed path
  - docs/framework/tech-stack.md # New
  - docs/framework/source-tree.md # New
git:
  showConfigWarning: true # New
  cacheTimeSeconds: 300 # New
projectStatus:
  enabled: true # New
  autoLoadOnAgentActivation: true # New
  showInGreeting: true # New
```

**Migration action:** Update your `core-config.yaml` with new fields.

---

### 3. Agent File Format Changes

**v2.0 agent format:**

```yaml
name: dev
role: Developer
```

**v2.1 agent format:**

```yaml
agent:
  name: Dex
  id: dev
  title: Full Stack Developer
  icon: 💻
  whenToUse: "Use for code implementation..."

persona_profile:
  archetype: Builder
  zodiac: "♒ Aquarius"

persona:
  role: Expert Senior Software Engineer
  style: Extremely concise, pragmatic

commands:
  - name: help
    visibility: [full, quick, key]
    description: "Show available commands"
```

**Migration action:** Existing custom agents need format update.

---

### 4. IDE Configuration Changes

**v2.0 Claude Code:**

- Files in `.claude/commands/`
- Manual slash command setup

**v2.1 Claude Code:**

- Files in `.claude/commands/AIOS/agents/`
- Automatic slash command generation
- Support for agent activation prefix

**Migration action:** Re-run installer for IDE configuration.

---

### 5. Renamed/Moved Files

| v2.0 Location                           | v2.1 Location                        |
| --------------------------------------- | ------------------------------------ |
| `.bmad-core/`                           | `.aios-core/`                        |
| `docs/architecture/coding-standards.md` | `docs/framework/coding-standards.md` |
| `docs/architecture/tech-stack.md`       | `docs/framework/tech-stack.md`       |
| `.aios-core/utils/`                     | `.aios-core/scripts/`                |

---

## Pre-Migration Checklist

Before starting migration:

- [ ] **Backup your project**

  ```bash
  git add -A && git commit -m "Pre-v2.1 migration backup"
  # Or create a tar backup
  tar -czvf pre-migration-backup.tar.gz .
  ```

- [ ] **Check Node.js version**

  ```bash
  node --version  # Must be 18+
  ```

- [ ] **Document custom changes**
  - List any modifications to `.bmad-core/` or `.aios-core/`
  - Note custom agents, tasks, or templates
  - Save any custom `core-config.yaml` settings

- [ ] **Close all IDE instances**
  - Prevents file locking issues
  - Ensures clean configuration update

- [ ] **Check for uncommitted changes**
  ```bash
  git status
  ```

---

## Upgrade Procedure

### Step 1: Backup Existing Installation

```bash
# Create backup of existing installation
cp -r .aios-core .aios-core.v2.0.backup
cp -r .bmad-core .bmad-core.v2.0.backup 2>/dev/null || true
cp -r .claude .claude.v2.0.backup 2>/dev/null || true
```

### Step 2: Run the v2.1 Installer

```bash
# Navigate to your project
cd /path/to/your/project

# Run the installer with force upgrade
npx aios-fullstack install --force-upgrade
```

The installer will:

1. Detect existing v2.0 installation
2. Offer to upgrade or fresh install
3. Preserve custom configurations where possible
4. Create new directory structure

### Step 3: Select Components

During installation, select:

- **AIOS Core System** (required)
- **Expansion packs** (optional)
- **IDEs** you use

### Step 4: Migrate Custom Configuration

If you had custom settings in `core-config.yaml`:

```bash
# Compare your backup with new config
diff .aios-core.v2.0.backup/core-config.yaml .aios-core/core-config.yaml

# Manually merge your custom settings into the new file
# (The new file has more options, keep those)
```

### Step 5: Migrate Custom Agents (if any)

If you created custom agents in v2.0:

1. **Copy custom agent files:**

   ```bash
   cp .aios-core.v2.0.backup/agents/my-custom-agent.md .aios-core/agents/
   ```

2. **Update agent format** to v2.1 schema (see Breaking Changes #3)

3. **Re-run IDE configuration:**
   ```bash
   npx aios-fullstack install --ide claude-code cursor
   ```

### Step 6: Clean Up Old Directories

After successful migration:

```bash
# Remove old BMad directory if it exists
rm -rf .bmad-core

# Keep backups for a few days, then remove
# rm -rf .aios-core.v2.0.backup
```

---

## Configuration Migration

### Automatic Migration

The installer automatically migrates:

- Directory structure (`.bmad-core/` → `.aios-core/`)
- Basic `core-config.yaml` settings
- IDE configurations

### Manual Migration Required

You must manually migrate:

- Custom agents (update format)
- Custom tasks (verify compatibility)
- `devLoadAlwaysFiles` paths (update to new locations)
- Environment variables (if changed)

### core-config.yaml Migration Script

Use this template to update your config:

```yaml
# v2.1 core-config.yaml template
# Copy your v2.0 values into appropriate fields

markdownExploder: true

qa:
  qaLocation: docs/qa

prd:
  prdFile: docs/prd.md
  prdVersion: v4
  prdSharded: true # Set based on your preference
  prdShardedLocation: docs/prd

architecture:
  architectureFile: docs/architecture.md
  architectureVersion: v4
  architectureSharded: true # Set based on your preference
  architectureShardedLocation: docs/architecture

# Update paths from v2.0
devLoadAlwaysFiles:
  - docs/framework/coding-standards.md
  - docs/framework/tech-stack.md
  - docs/framework/source-tree.md

devDebugLog: .ai/debug-log.md
devStoryLocation: docs/stories

# New v2.1 features
git:
  showConfigWarning: true
  cacheTimeSeconds: 300

projectStatus:
  enabled: true
  autoLoadOnAgentActivation: true
  showInGreeting: true
  components:
    gitBranch: true
    gitStatus: true
    recentWork: true
```

---

## Post-Migration Validation

### Step 1: Verify File Structure

```bash
# Check .aios-core exists with expected content
ls -la .aios-core/
# Expected: agents/, tasks/, templates/, checklists/, scripts/, core-config.yaml

# Check agents count
ls .aios-core/agents/ | wc -l
# Expected: 10+ files
```

### Step 2: Verify IDE Configuration

```bash
# Claude Code
ls .claude/commands/AIOS/agents/
# Expected: dev.md, qa.md, sm.md, etc.

# Cursor
ls .cursor/rules/
# Expected: dev.mdc, qa.mdc, etc.
```

### Step 3: Test Agent Activation

1. Open your IDE
2. Activate an agent (`/dev` or `@dev`)
3. Verify the agent responds with v2.1 greeting format:

   ```
   💻 Dex (Builder) ready. Let's build something great!

   Project Status: ...
   ```

### Step 4: Run Status Check

```bash
npx aios-fullstack status
```

Expected output:

```
AIOS-FULLSTACK Status
━━━━━━━━━━━━━━━━━━━━━
Version: 1.2.3
Install Location: /path/to/project
Core: ✅ Installed
IDEs Configured: claude-code, cursor
Expansion Packs: none
```

### Step 5: Test Key Workflows

1. **Create a story:**

   ```
   /sm
   *create-story
   ```

2. **Develop a story:**

   ```
   /dev
   *develop docs/stories/test-story.md
   ```

3. **Run tests:**
   ```bash
   npm test
   npm run lint
   ```

---

## Rollback Procedure

If migration fails or causes issues:

### Quick Rollback

```bash
# Restore from backup
rm -rf .aios-core
mv .aios-core.v2.0.backup .aios-core

# Restore IDE config
rm -rf .claude
mv .claude.v2.0.backup .claude

# Restore BMad if it existed
mv .bmad-core.v2.0.backup .bmad-core 2>/dev/null || true
```

### Git Rollback

```bash
# If you committed before migration
git checkout HEAD~1 -- .aios-core/ .claude/ .cursor/

# Or reset to pre-migration commit
git log --oneline  # Find pre-migration commit
git reset --hard <commit-hash>
```

### Full Reinstall of v2.0

If backups are lost:

```bash
# Remove v2.1 installation
rm -rf .aios-core .claude .cursor

# Install specific v2.0 version (if available)
npx aios-fullstack@2.0.0 install
```

---

## FAQ

### Q: Will my existing stories work with v2.1?

**A:** Yes, story format is backward compatible. Stories created in v2.0 work in v2.1 without modification.

---

### Q: Do I need to retrain team members?

**A:** Minimal retraining needed:

- Agent commands are the same (`*help`, `*develop`, etc.)
- IDE activation may differ slightly
- New features are additive, not replacement

---

### Q: Can I run v2.0 and v2.1 in different projects?

**A:** Yes, each project has its own AIOS installation. Different projects can use different versions.

---

### Q: What if I have heavily customized agents?

**A:**

1. Keep backups of custom agents
2. Migrate after core upgrade
3. Update to new agent format
4. Test thoroughly before using in production

---

### Q: Is the migration reversible?

**A:** Yes, with backups:

- Keep `.aios-core.v2.0.backup` until comfortable with v2.1
- Git provides additional safety net
- Rollback procedure documented above

---

### Q: How do I migrate expansion packs?

**A:** Expansion packs are re-downloaded during migration:

```bash
npx aios-fullstack install --expansion-packs hybrid-ops
```

Custom expansion packs need manual migration.

---

## Related Documentation

- [Quick Start Guide](./v2.1-quick-start.md) - Fresh installation
- [Troubleshooting Guide](./troubleshooting.md) - If issues occur
- [FAQ](./faq.md) - Common questions
- [Changelog](../../CHANGELOG.md) - Full version history

---

## Support

If you encounter issues during migration:

1. Check [Troubleshooting Guide](./troubleshooting.md)
2. Search [GitHub Issues](https://github.com/Pedrovaleriolopez/aios-fullstack/issues)
3. Open a new issue with:
   - v2.0 version you're migrating from
   - Error messages
   - Steps to reproduce
   - Contents of backup files (if relevant)

---

**Happy migrating to AIOS v2.1!** The new features will significantly improve your development workflow.
