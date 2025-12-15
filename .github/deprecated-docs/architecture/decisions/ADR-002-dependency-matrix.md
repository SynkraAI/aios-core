# ADR-002: Inter-Module Dependency Matrix

**Parent ADR:** [ADR-002-modular-architecture.md](./ADR-002-modular-architecture.md)
**Story:** [Story 2.1 - Module Structure Design](../../../docs/stories/v2.1/sprint-2/story-2.1-module-structure-design.md)
**Created:** 2025-11-27

## Dependency Rules

### Allowed Dependencies
```
infrastructure → development → core
infrastructure → product → core
infrastructure → core
development → core
product → core
```

### Forbidden Dependencies
```
core → development     ❌ (core must be standalone)
core → product         ❌ (core must be standalone)
core → infrastructure  ❌ (core must be standalone)
product → development  ❌ (assets shouldn't need agents)
development → product  ⚠️ (allowed but should be minimized)
```

## Current Cross-Script Dependencies

### CORE Module Internal Dependencies

| File | Depends On | Target Module |
|------|------------|---------------|
| `elicitation-engine.js` | `security-checker.js` | infrastructure |
| `elicitation-engine.js` | `elicitation-session-manager.js` | core |
| `session-context-loader.js` | `context-detector.js` | core |
| `config-loader.js` | (deprecated, forwarding only) | - |

**Issue:** `elicitation-engine.js` depends on `security-checker.js` which should be in infrastructure.
**Resolution:** Move security checks to a core-safe validation or make it optional.

### DEVELOPMENT Module Dependencies

| File | Depends On | Target Module |
|------|------------|---------------|
| `agent-config-loader.js` | `config-cache.js` | core |
| `agent-config-loader.js` | `performance-tracker.js` | infrastructure |
| `agent-exit-hooks.js` | `context-detector.js` | core |
| `greeting-builder.js` | `context-detector.js` | core |
| `greeting-builder.js` | `git-config-detector.js` | infrastructure |
| `greeting-builder.js` | `workflow-navigator.js` | development |
| `greeting-builder.js` | `greeting-preference-manager.js` | development |
| `greeting-builder.js` | `project-status-loader.js` | infrastructure |
| `generate-greeting.js` | `greeting-builder.js` | development |
| `generate-greeting.js` | `session-context-loader.js` | core |
| `generate-greeting.js` | `project-status-loader.js` | infrastructure |
| `generate-greeting.js` | `agent-config-loader.js` | development |
| `story-manager.js` | `story-update-hook.js` | development |
| `story-manager.js` | `tool-resolver.js` | infrastructure |
| `story-manager.js` | `pm-adapter-factory.js` | infrastructure |
| `story-update-hook.js` | `clickup-helpers.js` | infrastructure |
| `decision-recorder.js` | `decision-context.js` | development |
| `decision-recorder.js` | `decision-log-generator.js` | development |
| `decision-recorder.js` | `decision-log-indexer.js` | development |

### INFRASTRUCTURE Module Dependencies

| File | Depends On | Target Module |
|------|------------|---------------|
| `batch-creator.js` | `component-generator.js` | infrastructure |
| `batch-creator.js` | `elicitation-engine.js` | core |
| `batch-creator.js` | `dependency-analyzer.js` | infrastructure |
| `batch-creator.js` | `transaction-manager.js` | infrastructure |
| `branch-manager.js` | `git-wrapper.js` | infrastructure |
| `clickup-helpers.js` | `status-mapper.js` | infrastructure |
| `clickup-helpers.js` | `tool-resolver.js` | infrastructure |
| `capability-analyzer.js` | `security-checker.js` | infrastructure |
| `component-generator.js` | `template-engine.js` | infrastructure |
| `component-generator.js` | `template-validator.js` | infrastructure |
| `component-generator.js` | `security-checker.js` | infrastructure |
| `component-generator.js` | `yaml-validator.js` | core |
| `component-generator.js` | `elicitation-engine.js` | core |
| `component-generator.js` | `component-metadata.js` | infrastructure |
| `component-generator.js` | `transaction-manager.js` | infrastructure |
| `conflict-resolver.js` | `git-wrapper.js` | infrastructure |
| `commit-message-generator.js` | `diff-generator.js` | infrastructure |
| `commit-message-generator.js` | `modification-validator.js` | infrastructure |
| `improvement-validator.js` | `security-checker.js` | infrastructure |
| `improvement-validator.js` | `dependency-manager.js` | infrastructure |
| `modification-validator.js` | `yaml-validator.js` | core |
| `modification-validator.js` | `dependency-analyzer.js` | infrastructure |
| `modification-validator.js` | `security-checker.js` | infrastructure |
| `pm-adapter-factory.js` | `pm-adapters/clickup-adapter.js` | infrastructure |
| `pm-adapter-factory.js` | `pm-adapters/github-adapter.js` | infrastructure |
| `pm-adapter-factory.js` | `pm-adapters/jira-adapter.js` | infrastructure |
| `pm-adapter-factory.js` | `pm-adapters/local-adapter.js` | infrastructure |
| `template-validator.js` | `template-engine.js` | infrastructure |
| `transaction-manager.js` | `component-metadata.js` | infrastructure |

## Dependency Violation Analysis

### Critical Violations (Must Fix)

1. **`elicitation-engine.js` → `security-checker.js`**
   - Current: core → infrastructure
   - Solution: Create minimal security validation in core, or make check optional

2. **`agent-config-loader.js` → `performance-tracker.js`**
   - Current: development → infrastructure
   - Solution: Make performance tracking optional/injectable

3. **`greeting-builder.js` → `git-config-detector.js`, `project-status-loader.js`**
   - Current: development → infrastructure
   - Solution: Inject these as optional dependencies or move greeting to infrastructure

### Acceptable Cross-Module Dependencies

1. **development → core** ✅
   - `agent-config-loader.js` → `config-cache.js`
   - `agent-exit-hooks.js` → `context-detector.js`

2. **infrastructure → core** ✅
   - `component-generator.js` → `yaml-validator.js`
   - `component-generator.js` → `elicitation-engine.js`
   - `modification-validator.js` → `yaml-validator.js`

3. **infrastructure → development** ✅
   - `batch-creator.js` → would be internal to infrastructure

## Dependency Graph (Simplified)

```
                    ┌─────────────┐
                    │    CORE     │
                    │             │
                    │ config-*    │
                    │ elicitation │
                    │ session     │
                    │ yaml-valid  │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌──────────────┐ ┌──────────┐ ┌────────────────┐
    │ DEVELOPMENT  │ │ PRODUCT  │ │ INFRASTRUCTURE │
    │              │ │          │ │                │
    │ agents       │ │ templates│ │ git-*          │
    │ tasks        │ │ checks   │ │ pm-adapters    │
    │ workflows    │ │ data     │ │ analyzers      │
    │ greeting-*   │ │          │ │ generators     │
    │ story-*      │ │          │ │ testers        │
    └──────────────┘ └──────────┘ └────────────────┘
           │                               │
           └───────────────────────────────┘
                 (infra uses dev for story management)
```

## Refactoring Recommendations

### Phase 1: Core Isolation
1. Remove `security-checker.js` dependency from `elicitation-engine.js`
2. Create `core/validation/security-validator.js` with minimal checks
3. Move `yaml-validator.js` to `core/utils/`

### Phase 2: Development Decoupling
1. Make `performance-tracker.js` optional in `agent-config-loader.js`
2. Create interfaces for infrastructure dependencies in greeting system
3. Use dependency injection pattern for optional features

### Phase 3: Infrastructure Consolidation
1. Group related scripts into subdirectories
2. Create clear public API for each subgroup
3. Document cross-module interfaces

## Import Path Update Strategy

### Approach: Relative Path Updates

When moving files, update imports to use relative paths based on new locations:

```javascript
// Before (all in scripts/)
const ConfigCache = require('./config-cache');

// After (from development/scripts/)
const ConfigCache = require('../../core/config/config-cache');
```

### Alternative: Module Aliases (package.json)

```json
{
  "imports": {
    "#core/*": "./.aios-core/core/*",
    "#development/*": "./.aios-core/development/*",
    "#product/*": "./.aios-core/product/*",
    "#infrastructure/*": "./.aios-core/infrastructure/*"
  }
}
```

Then use:
```javascript
const ConfigCache = require('#core/config/config-cache');
```

**Recommendation:** Use relative paths for simplicity, document patterns clearly.

## Validation Checklist

After migration, verify:
- [ ] `core/` has no dependencies on other modules
- [ ] `product/` has no runtime dependencies (only loaded as templates)
- [ ] `development/` only depends on `core/`
- [ ] `infrastructure/` can depend on all modules
- [ ] All `require()` statements resolve correctly
- [ ] Package exports work from root `index.js`
