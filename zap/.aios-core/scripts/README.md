# AIOS Scripts - Legacy Directory

> **Note**: This directory now contains only legacy/migration scripts and a few active utilities.
> Most scripts have been migrated to the modular structure (Story 6.16).

## Current Structure

Scripts are now organized by domain across three locations:

| Location | Purpose |
|----------|---------|
| `.aios-core/core/` | Core framework modules (elicitation, session) |
| `.aios-core/development/scripts/` | Development scripts (greeting, workflow, hooks) |
| `.aios-core/infrastructure/scripts/` | Infrastructure scripts (git config, validators) |
| `.aios-core/scripts/` (this directory) | Legacy utilities and migration scripts |

## Scripts in This Directory

### Active Scripts

| Script | Description |
|--------|-------------|
| `session-context-loader.js` | Loads session context for agents |
| `command-execution-hook.js` | Hook for command execution |
| `test-template-system.js` | Internal test utility for templates |

### Migration Scripts

| Script | Description |
|--------|-------------|
| `batch-migrate-*.ps1` | Batch migration utilities |
| `migrate-framework-docs.sh` | Documentation migration script |
| `validate-phase1.ps1` | Phase 1 validation script |

## Script Path Mapping

If you're looking for a script that was previously here, use this mapping:

```text
OLD PATH                                      NEW PATH
-----------------------------------------     ------------------------------------------
.aios-core/scripts/context-detector.js      → .aios-core/core/session/context-detector.js
.aios-core/scripts/elicitation-engine.js    → .aios-core/core/elicitation/elicitation-engine.js
.aios-core/scripts/elicitation-session-manager.js → .aios-core/core/elicitation/session-manager.js
.aios-core/scripts/greeting-builder.js      → .aios-core/development/scripts/greeting-builder.js
.aios-core/scripts/workflow-navigator.js    → .aios-core/development/scripts/workflow-navigator.js
.aios-core/scripts/agent-exit-hooks.js      → .aios-core/development/scripts/agent-exit-hooks.js
.aios-core/scripts/git-config-detector.js   → .aios-core/infrastructure/scripts/git-config-detector.js
.aios-core/scripts/project-status-loader.js → .aios-core/infrastructure/scripts/project-status-loader.js
.aios-core/scripts/aios-validator.js        → .aios-core/infrastructure/scripts/aios-validator.js
.aios-core/scripts/tool-resolver.js         → .aios-core/infrastructure/scripts/tool-resolver.js
.aios-core/scripts/output-formatter.js      → .aios-core/infrastructure/scripts/output-formatter.js
```

## Configuration

The `scriptsLocation` in `core-config.yaml` now uses a modular structure:

```yaml
scriptsLocation:
  core: .aios-core/core
  development: .aios-core/development/scripts
  infrastructure: .aios-core/infrastructure/scripts
  legacy: .aios-core/scripts  # This directory
```

## Usage Examples

### Loading Core Scripts

```javascript
// Elicitation Engine (from core)
const ElicitationEngine = require('./.aios-core/core/elicitation/elicitation-engine');

// Context Detector (from core)
const ContextDetector = require('./.aios-core/core/session/context-detector');
```

### Loading Development Scripts

```javascript
// Greeting Builder
const GreetingBuilder = require('./.aios-core/development/scripts/greeting-builder');

// Workflow Navigator
const WorkflowNavigator = require('./.aios-core/development/scripts/workflow-navigator');
```

### Loading Infrastructure Scripts

```javascript
// Project Status Loader
const { loadProjectStatus } = require('./.aios-core/infrastructure/scripts/project-status-loader');

// Git Config Detector
const GitConfigDetector = require('./.aios-core/infrastructure/scripts/git-config-detector');
```

### Loading Legacy Scripts (this directory)

```javascript
// Session Context Loader
const sessionLoader = require('./.aios-core/scripts/session-context-loader');
```

## Related Documentation

- [Core Config](../core-config.yaml) - scriptsLocation configuration
- [Core Module](../core/README.md) - Core framework modules
- [Development Scripts](../development/scripts/README.md) - Development utilities
- [Infrastructure Scripts](../infrastructure/scripts/README.md) - Infrastructure utilities

## Migration History

| Date | Story | Change |
|------|-------|--------|
| 2025-12-18 | 6.16 | Deleted deprecated scripts, updated documentation |
| 2025-01-15 | 2.2 | Initial script reorganization to modular structure |

---

**Last updated:** 2025-12-18 - Story 6.16 Scripts Path Consolidation
