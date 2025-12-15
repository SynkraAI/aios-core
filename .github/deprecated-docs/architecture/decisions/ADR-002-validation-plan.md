# ADR-002: Import Validation Plan

**Parent ADR:** [ADR-002-modular-architecture.md](./ADR-002-modular-architecture.md)
**Story:** [Story 2.1 - Module Structure Design](../../../docs/stories/v2.1/sprint-2/story-2.1-module-structure-design.md)
**Created:** 2025-11-27

## Overview

This document defines the validation procedures to ensure zero breaking changes after the modular migration.

## Validation Scripts

### 1. Import Resolution Validator

**Purpose:** Verify all `require()` and `import` statements resolve correctly.

**Script Location:** `.aios-core/infrastructure/scripts/validate-imports.js`

```javascript
/**
 * Import Resolution Validator
 *
 * Scans all JS files in .aios-core/ and verifies:
 * 1. All require() paths resolve to existing files
 * 2. All import statements resolve correctly
 * 3. No circular dependencies introduced
 *
 * Usage: node validate-imports.js [--fix]
 */

const fs = require('fs');
const path = require('path');

const AIOS_CORE = path.join(__dirname, '../../..');

function validateImports() {
  const errors = [];
  const warnings = [];

  // Find all JS files
  const jsFiles = findFiles(AIOS_CORE, '.js');

  for (const file of jsFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const imports = extractImports(content);

    for (const imp of imports) {
      const resolved = resolveImport(imp, path.dirname(file));
      if (!resolved.exists) {
        errors.push({
          file,
          import: imp,
          error: `Cannot resolve: ${imp}`
        });
      }
    }
  }

  return { errors, warnings };
}

function extractImports(content) {
  const requires = content.match(/require\(['"]([^'"]+)['"]\)/g) || [];
  const imports = content.match(/import.*from ['"]([^'"]+)['"]/g) || [];
  return [...requires, ...imports]
    .map(m => m.match(/['"]([^'"]+)['"]/)[1])
    .filter(p => p.startsWith('.'));
}

function resolveImport(importPath, fromDir) {
  const candidates = [
    path.join(fromDir, importPath),
    path.join(fromDir, importPath + '.js'),
    path.join(fromDir, importPath, 'index.js')
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return { exists: true, path: candidate };
    }
  }

  return { exists: false, path: importPath };
}

function findFiles(dir, ext) {
  const results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory() && !item.name.startsWith('.')) {
      results.push(...findFiles(fullPath, ext));
    } else if (item.isFile() && item.name.endsWith(ext)) {
      results.push(fullPath);
    }
  }

  return results;
}

// Export for use
module.exports = { validateImports, extractImports, resolveImport };

// CLI execution
if (require.main === module) {
  const { errors, warnings } = validateImports();

  if (errors.length > 0) {
    console.error('❌ Import validation FAILED');
    errors.forEach(e => console.error(`  ${e.file}: ${e.error}`));
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('⚠️ Warnings:');
    warnings.forEach(w => console.warn(`  ${w}`));
  }

  console.log('✅ All imports validated successfully');
}
```

### 2. Path Mapping Generator

**Purpose:** Generate old path → new path mappings for bulk updates.

**Output:** `migration-path-map.json`

```json
{
  "mappings": {
    "./config-cache": "../core/config/config-cache",
    "./context-detector": "../core/session/context-detector",
    "./yaml-validator": "../core/utils/yaml-validator",
    "./elicitation-engine": "../core/elicitation/elicitation-engine",
    "./git-wrapper": "../infrastructure/scripts/git-wrapper",
    "./pm-adapter-factory": "../infrastructure/integrations/pm-adapter-factory"
  },
  "metadata": {
    "generated": "2025-11-27",
    "totalMappings": 95,
    "modules": {
      "core": 22,
      "development": 35,
      "product": 0,
      "infrastructure": 38
    }
  }
}
```

### 3. Circular Dependency Detector

**Purpose:** Detect circular dependencies that could cause runtime issues.

```javascript
/**
 * Circular Dependency Detector
 *
 * Uses depth-first search to find circular require() chains.
 */

function detectCircularDeps(entryPoint, visited = new Set(), path = []) {
  if (visited.has(entryPoint)) {
    const cycleStart = path.indexOf(entryPoint);
    if (cycleStart !== -1) {
      return path.slice(cycleStart).concat(entryPoint);
    }
    return null;
  }

  visited.add(entryPoint);
  path.push(entryPoint);

  const deps = getDependencies(entryPoint);
  for (const dep of deps) {
    const cycle = detectCircularDeps(dep, new Set(visited), [...path]);
    if (cycle) return cycle;
  }

  return null;
}
```

## Pre-Migration Checklist

### Before Starting Migration

- [ ] Run `npm test` and record baseline pass count
- [ ] Run `npm run lint` and fix all errors
- [ ] Run `node --check .aios-core/index.js` to verify entry point
- [ ] Document current working state with git commit
- [ ] Create backup: `cp -r .aios-core .aios-core.backup-pre-modular`

### Export Verification

Verify these exports work before migration:

```javascript
// Test current exports
const aiosCore = require('./.aios-core');

// Core functionality
console.assert(typeof aiosCore.ElicitationEngine !== 'undefined');
console.assert(typeof aiosCore.ConfigLoader !== 'undefined');

// Verify agents load
const agentConfig = require('./.aios-core/scripts/agent-config-loader');
console.assert(typeof agentConfig.AgentConfigLoader !== 'undefined');
```

## Post-Migration Validation

### Automated Validation Suite

Run in order:

```bash
# 1. Syntax check all JS files
find .aios-core -name "*.js" -exec node --check {} \;

# 2. Import validation
node .aios-core/infrastructure/scripts/validate-imports.js

# 3. Circular dependency check
node .aios-core/infrastructure/scripts/detect-circular-deps.js

# 4. Export verification
node -e "require('./.aios-core')"

# 5. Full test suite
npm test

# 6. Agent activation test
node -e "
  const { AgentConfigLoader } = require('./.aios-core/development/scripts/agent-config-loader');
  const loader = new AgentConfigLoader();
  loader.loadAgent('dev').then(a => console.log('✅ Agent loads:', a.agent.name));
"
```

### Manual Verification Checklist

- [ ] Agent activation: `@dev` loads without errors
- [ ] Task execution: `*help` command works
- [ ] Story management: Story files can be read/updated
- [ ] Template rendering: Templates produce valid output
- [ ] Checklist execution: `execute-checklist` works
- [ ] Workflow navigation: `workflow-navigator.js` resolves steps

## Rollback Procedure

If validation fails:

```bash
# 1. Restore from backup
rm -rf .aios-core
mv .aios-core.backup-pre-modular .aios-core

# 2. Verify restoration
npm test

# 3. Document failure
echo "Migration failed at $(date)" >> migration-log.md
echo "Reason: [describe failure]" >> migration-log.md
```

## Import Update Script

**Purpose:** Automatically update import paths after file moves.

```javascript
/**
 * Bulk Import Path Updater
 *
 * Usage: node update-imports.js --map migration-path-map.json
 */

const fs = require('fs');
const path = require('path');

function updateImports(filePath, mappings) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  for (const [oldPath, newPath] of Object.entries(mappings)) {
    const patterns = [
      new RegExp(`require\\(['"]${escapeRegex(oldPath)}['"]\\)`, 'g'),
      new RegExp(`from ['"]${escapeRegex(oldPath)}['"]`, 'g')
    ];

    for (const pattern of patterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, (match) => {
          return match.replace(oldPath, newPath);
        });
        modified = true;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    return true;
  }

  return false;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { updateImports };
```

## Success Criteria

### MUST PASS (Blocking)

| Check | Command | Expected |
|-------|---------|----------|
| Syntax valid | `node --check .aios-core/index.js` | Exit 0 |
| Tests pass | `npm test` | All green |
| Imports resolve | `validate-imports.js` | 0 errors |
| No cycles | `detect-circular-deps.js` | No cycles found |
| Exports work | `require('./.aios-core')` | No throw |

### SHOULD PASS (Warning)

| Check | Command | Expected |
|-------|---------|----------|
| Lint clean | `npm run lint` | 0 errors |
| Type check | `npm run typecheck` | 0 errors |
| Coverage stable | `npm run coverage` | >= baseline |

## Monitoring Post-Migration

For 1 week after migration:

1. Track error rates in agent activations
2. Monitor task execution success rate
3. Watch for "module not found" errors in logs
4. Verify CI/CD pipelines pass

Report any issues to [Story 2.2+] for fixes.
