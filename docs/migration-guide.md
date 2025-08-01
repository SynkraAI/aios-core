# Migration Guide

This guide helps you migrate from previous versions of AIOS-FULLSTACK or from the legacy BMAD-METHOD framework.

## Table of Contents

1. [Version Compatibility](#version-compatibility)
2. [Pre-Migration Checklist](#pre-migration-checklist)
3. [Migration Paths](#migration-paths)
4. [Backup Procedures](#backup-procedures)
5. [Step-by-Step Migration](#step-by-step-migration)
6. [Data Migration](#data-migration)
7. [Configuration Updates](#configuration-updates)
8. [Breaking Changes](#breaking-changes)
9. [Post-Migration Tasks](#post-migration-tasks)
10. [Rollback Procedures](#rollback-procedures)

## Version Compatibility

### Supported Migration Paths

| From Version | To Version | Migration Type | Difficulty |
|--------------|------------|----------------|------------|
| BMAD-METHOD 0.x | AIOS 1.0 | Major | High |
| AIOS 0.9.x | AIOS 1.0 | Minor | Low |
| AIOS 1.0-beta | AIOS 1.0 | Patch | Minimal |

### Version Requirements

- Node.js: 14.0.0 or higher (recommend 18.x)
- npm: 6.0.0 or higher
- Git: 2.0.0 or higher

## Pre-Migration Checklist

Before starting migration, ensure you have:

- [ ] Full backup of current project
- [ ] Documented all custom configurations
- [ ] Listed all active agents and workflows
- [ ] Exported memory layer data
- [ ] Noted API keys and credentials
- [ ] Tested in development environment
- [ ] Scheduled maintenance window
- [ ] Informed team members

## Migration Paths

### From BMAD-METHOD to AIOS-FULLSTACK 1.0

This is a major migration involving significant changes:

1. **Framework Rebranding**
   - All references to BMAD-METHOD updated
   - New package namespace: `@aios-fullstack/*`
   - Updated documentation and commands

2. **New Components**
   - LlamaIndex memory layer
   - Meta-agent capabilities
   - Enhanced self-modification

3. **Directory Structure Changes**
   ```
   OLD: bmad-method/
   NEW: aios-fullstack/
   ```

### From AIOS 0.9.x to 1.0

Minor migration with mostly additive changes:

1. **New Features**
   - NPX installation support
   - Enhanced meta-agent commands
   - Improved memory layer

2. **Configuration Updates**
   - New config format
   - Additional options

## Backup Procedures

### 1. Complete Project Backup

```bash
# Create timestamped backup
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  .

# Or use built-in backup
*backup --include all --compress \
  --destination ../backups/pre-migration/
```

### 2. Export Current State

```bash
# Export agents
*export agents --format json \
  --destination exports/agents.json

# Export workflows  
*export workflows --format json \
  --destination exports/workflows.json

# Export memory
*export memory --format archive \
  --destination exports/memory.zip

# Export configuration
*export config --include-sensitive \
  --destination exports/config.json
```

### 3. Document Custom Code

```bash
# List custom components
find . -name "*.custom.*" -type f > custom-files.txt

# Save custom agent definitions
cp -r agents/custom/ ../backup/custom-agents/
```

## Step-by-Step Migration

### Phase 1: Preparation

1. **Stop all running processes**
   ```bash
   *stop-workflow --all
   *deactivate --all
   ```

2. **Create migration workspace**
   ```bash
   mkdir migration-workspace
   cd migration-workspace
   ```

3. **Install new version**
   ```bash
   npx aios-fullstack@latest init aios-migrated
   ```

### Phase 2: Configuration Migration

1. **Update configuration format**
   ```javascript
   // Old format (BMAD-METHOD)
   {
     "framework": {
       "name": "bmad-method",
       "version": "0.x"
     }
   }

   // New format (AIOS-FULLSTACK)
   {
     "framework": {
       "name": "aios-fullstack",
       "version": "1.0.0",
       "features": {
         "memoryLayer": true,
         "metaAgent": true
       }
     }
   }
   ```

2. **Migrate environment variables**
   ```bash
   # Old
   BMAD_API_KEY=xxx
   BMAD_WORKSPACE=/path

   # New
   AIOS_API_KEY=xxx
   AIOS_WORKSPACE=/path
   ```

3. **Update API configurations**
   ```javascript
   // Update provider configurations
   {
     "ai": {
       "provider": "openai", // or "anthropic"
       "model": "gpt-4",
       "apiKey": process.env.OPENAI_API_KEY
     }
   }
   ```

### Phase 3: Agent Migration

1. **Convert agent definitions**
   ```yaml
   # Old format
   name: helper-agent
   type: assistant
   version: 1.0

   # New format
   name: helper-agent
   type: assistant
   version: 2.0
   metadata:
     migrated: true
     originalVersion: 1.0
   capabilities:
     - name: help
       enhanced: true
   ```

2. **Update agent commands**
   ```javascript
   // Old command structure
   exports.command = async (args) => {
     // implementation
   };

   // New command structure
   export const command = {
     name: 'command-name',
     description: 'Command description',
     parameters: [
       { name: 'param1', type: 'string', required: true }
     ],
     execute: async (context, params) => {
       // implementation
     }
   };
   ```

3. **Migrate agent dependencies**
   ```bash
   # Copy custom agents
   cp ../backup/custom-agents/* ./agents/

   # Update agent references
   find ./agents -name "*.md" -exec \
     sed -i 's/bmad-method/aios-fullstack/g' {} \;
   ```

### Phase 4: Workflow Migration

1. **Update workflow definitions**
   ```yaml
   # Add migration metadata
   workflows:
     - name: existing-workflow
       version: 2.0
       metadata:
         migratedFrom: 1.0
         migrationDate: 2024-01-15
   ```

2. **Convert workflow triggers**
   ```javascript
   // Old trigger
   on: ['push', 'manual']

   // New trigger format
   triggers:
     - type: event
       event: push
     - type: manual
       authentication: required
   ```

### Phase 5: Memory Layer Migration

1. **Initialize new memory layer**
   ```bash
   # Initialize LlamaIndex
   *memory initialize --backend llamaindex
   ```

2. **Import existing data**
   ```bash
   # Import memory export
   *memory import ../exports/memory.zip \
     --strategy merge \
     --validate
   ```

3. **Rebuild indexes**
   ```bash
   # Rebuild for optimal performance
   *memory rebuild --verbose
   ```

## Data Migration

### Database Migration

```javascript
// Migration script example
const migrationScript = {
  version: '1.0.0',
  up: async (db) => {
    // Add new columns
    await db.schema.alterTable('agents', (table) => {
      table.boolean('meta_capable').defaultTo(false);
      table.json('memory_config');
    });
    
    // Migrate data
    const agents = await db('agents').select();
    for (const agent of agents) {
      await db('agents')
        .where('id', agent.id)
        .update({
          meta_capable: agent.type === 'meta-agent',
          memory_config: { enabled: true }
        });
    }
  },
  down: async (db) => {
    // Rollback changes
    await db.schema.alterTable('agents', (table) => {
      table.dropColumn('meta_capable');
      table.dropColumn('memory_config');
    });
  }
};
```

### File System Migration

```bash
# Migrate file structure
mkdir -p .aios/memory
mkdir -p .aios/config
mkdir -p .aios/logs

# Move existing files
mv .bmad/config/* .aios/config/
mv .bmad/data/* .aios/memory/

# Update file references
find . -type f -name "*.js" -o -name "*.json" | \
  xargs sed -i 's/.bmad/.aios/g'
```

## Configuration Updates

### 1. Update Package.json

```json
{
  "name": "my-aios-project",
  "version": "1.0.0",
  "dependencies": {
    "@aios-fullstack/core": "^1.0.0",
    "@aios-fullstack/memory": "^1.0.0",
    "@aios-fullstack/meta-agent": "^1.0.0"
  },
  "scripts": {
    "aios": "aios-fullstack",
    "migrate": "aios-fullstack migrate"
  }
}
```

### 2. Update .gitignore

```bash
# AIOS-FULLSTACK
.aios/
.aios/logs/
.aios/cache/
.aios/memory/*.db
.env.local
.env.*.local

# Remove old entries
# .bmad/
```

### 3. Update CI/CD Pipelines

```yaml
# GitHub Actions example
- name: Install AIOS-FULLSTACK
  run: |
    npx aios-fullstack@latest install
    npx aios-fullstack doctor --fix

- name: Run Migration Tests
  run: |
    npm run test:migration
    npx aios-fullstack verify
```

## Breaking Changes

### API Changes

1. **Command Structure**
   - Old: `bmad <command>`
   - New: `*<command>` or `npx aios-fullstack <command>`

2. **Configuration Keys**
   - `framework.name`: Changed from "bmad-method" to "aios-fullstack"
   - `agents.path`: Changed from "bmad-agents/" to "agents/"
   - `memory.backend`: New required field

3. **Environment Variables**
   - All `BMAD_*` variables renamed to `AIOS_*`
   - New required: `AIOS_MEMORY_BACKEND`

### Deprecated Features

1. **Legacy Agent Format**
   - YAML-only agents deprecated
   - Use Markdown with YAML frontmatter

2. **Old Command Syntax**
   - Direct function exports deprecated
   - Use structured command objects

3. **File-based Memory**
   - Simple file storage deprecated
   - Use LlamaIndex memory layer

### Removed Features

1. **Legacy Templates**
   - Old template system removed
   - Use new component generators

2. **Direct Database Access**
   - Raw SQL deprecated
   - Use memory layer API

## Post-Migration Tasks

### 1. Verification

```bash
# Run system doctor
npx aios-fullstack doctor --deep

# Verify agents
*list-agents --verify

# Test workflows
*workflow-status --all

# Check memory layer
*memory status
```

### 2. Performance Optimization

```bash
# Optimize memory indexes
*memory optimize --aggressive

# Update agent capabilities
*improve-self --based-on analysis

# Clean up old data
*cleanup --remove-deprecated
```

### 3. Team Training

1. **Update documentation**
   - New command reference
   - Updated workflows
   - API changes

2. **Conduct training sessions**
   - Meta-agent features
   - Memory layer usage
   - New commands

### 4. Monitor System

```bash
# Enable monitoring
*config --set monitoring.enabled true

# Set up alerts
*config --set alerts.email team@company.com

# Track performance
*benchmark all --save-baseline
```

## Rollback Procedures

If migration fails, follow these steps:

### 1. Immediate Rollback

```bash
# Stop new system
*shutdown --force

# Restore from backup
cd ..
rm -rf aios-migrated
tar -xzf backup-[timestamp].tar.gz
```

### 2. Partial Rollback

```bash
# Rollback specific components
*rollback agents --to-version 0.9
*rollback memory --clear

# Restore configuration
cp exports/config.json .aios/config.json
*config --reload
```

### 3. Data Recovery

```bash
# Restore database
mysql dbname < backup.sql

# Restore files
rsync -av backup/ ./

# Rebuild indexes
*memory rebuild --from-backup
```

## Migration Troubleshooting

### Common Issues

1. **"Module not found" errors**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Agent compatibility issues**
   ```bash
   # Run compatibility check
   *doctor --component agents --fix
   ```

3. **Memory layer errors**
   ```bash
   # Reset and rebuild
   *memory reset
   *memory import backup.zip
   ```

### Getting Help

- Check [Migration FAQ](https://docs.aios-fullstack.com/migration-faq)
- Join [Discord #migration channel](https://discord.gg/aios-migration)
- Open [GitHub Issue](https://github.com/aios-fullstack/issues)

## Migration Checklist Summary

- [ ] Pre-migration backup completed
- [ ] New version installed
- [ ] Configuration migrated
- [ ] Agents converted
- [ ] Workflows updated
- [ ] Memory layer migrated
- [ ] Data transferred
- [ ] System verified
- [ ] Team trained
- [ ] Monitoring enabled
- [ ] Performance baseline established
- [ ] Rollback plan tested

---

**Important**: Always test migration in a development environment first. Schedule production migrations during low-usage periods and have your rollback plan ready.

For automated migration assistance, use:
```bash
npx aios-fullstack migrate --from bmad-method --assisted
```

The migration wizard will guide you through each step and validate your migration.