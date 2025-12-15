# Synkra AIOS Upgrade Guide

This guide helps you upgrade between versions of Synkra AIOS.

## Table of Contents

1. [Version Compatibility](#version-compatibility)
2. [Pre-Upgrade Checklist](#pre-upgrade-checklist)
3. [Backup Procedures](#backup-procedures)
4. [Upgrade Process](#upgrade-process)
5. [Post-Upgrade Verification](#post-upgrade-verification)
6. [Rollback Procedures](#rollback-procedures)
7. [Troubleshooting](#troubleshooting)

## Version Compatibility

### Current Version

**Synkra AIOS v4.4.0** (Current Stable Release)

### Upgrade Paths

| From Version | To Version | Upgrade Type | Difficulty |
|--------------|------------|--------------|------------|
| v4.3.x | v4.4.0 | Minor | Low |
| v4.0-4.2 | v4.4.0 | Minor | Medium |
| v3.x | v4.4.0 | Major | High |

### System Requirements

- **Node.js**: 20.0.0 or higher (recommended)
- **npm**: 10.0.0 or higher
- **Git**: 2.0.0 or higher
- **Disk Space**: 100MB minimum free space

## Pre-Upgrade Checklist

Before upgrading, ensure you have:

- [ ] Backed up your entire project
- [ ] Documented custom configurations
- [ ] Listed all active agents and workflows
- [ ] Exported any critical data
- [ ] Tested the upgrade in a development environment
- [ ] Informed team members of planned maintenance
- [ ] Reviewed release notes for breaking changes

## Backup Procedures

### 1. Complete Project Backup

```bash
# Create timestamped backup
tar -czf aios-backup-$(date +%Y%m%d-%H%M%S).tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  .

# Move to safe location
mv aios-backup-*.tar.gz ../backups/
```

### 2. Export Configuration

```bash
# Save current configuration
cp .aios-core/config.json ../backups/config-backup.json

# Save custom components
cp -r .aios-core/agents/custom ../backups/custom-agents/
cp -r .aios-core/tasks/custom ../backups/custom-tasks/
```

### 3. Document Current State

```bash
# Record current version
npm list @synkra/aios-core/core > ../backups/version-info.txt

# List custom files
find .aios-core -name "*.custom.*" -type f > ../backups/custom-files.txt
```

## Upgrade Process

### Option 1: In-Place Upgrade (Recommended)

```bash
# 1. Stop any running processes
# Close all IDE integrations and active agents

# 2. Update to latest version
npm install -g @synkra/aios-core@latest

# 3. Run upgrade command
aios upgrade

# 4. Verify installation
aios --version
```

### Option 2: Clean Installation

```bash
# 1. Remove old installation
npm uninstall -g @synkra/aios-core

# 2. Clear cache
npm cache clean --force

# 3. Install latest version
npm install -g @synkra/aios-core@latest

# 4. Reinitialize project
cd your-project
aios init --upgrade
```

### Option 3: Project-Specific Upgrade

```bash
# Update project dependencies
cd your-project
npm update @synkra/aios-core/core

# Reinstall dependencies
npm install

# Verify upgrade
npm list @synkra/aios-core/core
```

## Post-Upgrade Verification

### 1. Verify Installation

```bash
# Check version
aios --version

# Verify core components
aios verify --components

# Test basic functionality
aios test --quick
```

### 2. Test Agents

```bash
# List available agents
aios list agents

# Test agent activation
aios test agent aios-developer

# Verify agent dependencies
aios verify --agents
```

### 3. Check Configuration

```bash
# Validate configuration
aios config validate

# Review upgrade log
cat .aios-core/logs/upgrade.log
```

### 4. Test Workflows

```bash
# List workflows
aios list workflows

# Test workflow execution
aios test workflow basic-dev-cycle
```

## Rollback Procedures

If you encounter issues after upgrading:

### Quick Rollback

```bash
# Restore from backup
cd ..
rm -rf current-project
tar -xzf backups/aios-backup-YYYYMMDD-HHMMSS.tar.gz

# Reinstall previous version
npm install -g @synkra/aios-core@<previous-version>

# Verify rollback
aios --version
```

### Selective Rollback

```bash
# Restore specific components
cp ../backups/config-backup.json .aios-core/config.json
cp -r ../backups/custom-agents/* .aios-core/agents/custom/

# Reinstall dependencies
npm install
```

## Troubleshooting

### Common Issues

#### Installation Fails

```bash
# Clear npm cache
npm cache clean --force

# Try with verbose logging
npm install -g @synkra/aios-core@latest --verbose

# Check npm permissions
npm config get prefix
```

#### Agents Not Loading

```bash
# Rebuild agent manifests
aios rebuild --manifests

# Verify agent dependencies
aios verify --agents --verbose

# Check agent syntax
aios validate agents
```

#### Configuration Errors

```bash
# Validate configuration
aios config validate --verbose

# Reset to defaults (careful!)
aios config reset --backup

# Repair configuration
aios config repair
```

#### Memory Layer Issues

```bash
# Rebuild memory indexes
aios memory rebuild

# Verify memory integrity
aios memory verify

# Clear and reinitialize
aios memory reset
```

### Getting Help

If you encounter issues not covered here:

1. **Check Logs**: Review `.aios-core/logs/upgrade.log`
2. **GitHub Issues**: [github.com/SynkraAI/aios-core/issues](https://github.com/SynkraAI/aios-core/issues)
3. **Discord Community**: [discord.gg/gk8jAdXWmj](https://discord.gg/gk8jAdXWmj)
4. **Documentation**: [docs directory](./README.md)

## Version-Specific Notes

### Upgrading to v4.4.0

**Key Changes:**
- Enhanced meta-agent capabilities
- Improved memory layer performance
- Updated security features
- Streamlined installation process

**Breaking Changes:**
- None (backward compatible with v4.0+)

**New Features:**
- `aios-developer` meta-agent enhancements
- Interactive installation wizard
- Performance monitoring tools

**Deprecations:**
- Legacy command syntax (still supported with warnings)

---

**Last Updated:** 2025-08-01
**Current Version:** v4.4.0
