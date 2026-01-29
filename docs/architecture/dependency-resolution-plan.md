# Dependency Resolution in AIOS

> **EN** | PT _(coming soon)_ | ES _(coming soon)_

---

**Version:** 1.0.0
**Last Updated:** 2026-01-26
**Status:** Official Reference

---

## Overview

This document describes how AIOS resolves dependencies between modules, agents, tasks, and external packages. Understanding dependency resolution is critical for extending and maintaining the framework.

---

## Dependency Types

### 1. Module Dependencies

Dependencies between AIOS core modules follow a layered architecture:

```
.aios-core/
├── core/               ← Foundation (no dependencies)
│   ├── registry/       ← Service discovery
│   ├── health-check/   ← System validation
│   ├── orchestration/  ← Workflow execution
│   └── quality-gates/  ← Validation layers
├── development/        ← Depends on: core
│   ├── agents/
│   ├── tasks/
│   └── workflows/
├── product/            ← Depends on: core
│   ├── templates/
│   └── checklists/
└── infrastructure/     ← Depends on: core, development
    ├── scripts/
    ├── integrations/
    └── templates/
```

### 2. Agent Dependencies

Dependencies declared by agents in their definition files:

```yaml
# Agent definition (.aios-core/development/agents/dev.md)
dependencies:
  # Task workflow files
  tasks:
    - apply-qa-fixes.md
    - dev-develop-story.md
    - execute-checklist.md

  # Validation checklists
  checklists:
    - story-dod-checklist.md

  # External tools (CLI, MCP, services)
  tools:
    - git
    - coderabbit
    - context7
```

### 3. Task Dependencies

Dependencies between tasks in workflows:

```yaml
# Workflow definition
workflow:
  name: deploy
  tasks:
    - task: lint
      depends_on: []
    - task: test
      depends_on: [lint]
    - task: build
      depends_on: [test]
    - task: deploy
      depends_on: [build]
```

### 4. External Dependencies

NPM packages defined in package.json:

```json
{
  "dependencies": {
    "chalk": "^4.1.2",
    "commander": "^14.0.1",
    "js-yaml": "^4.1.0",
    "handlebars": "^4.7.8"
  }
}
```

---

## Service Registry

The Service Registry is the central catalog for dependency resolution in AIOS.

### Overview

- **Total Workers:** 200+ cataloged services
- **Categories:** task, template, script, checklist, workflow, data
- **Performance:** < 500ms load time with caching
- **Cache TTL:** 5 minutes

### Registry Location

```
.aios-core/core/registry/
├── service-registry.json    # Main registry
├── registry-schema.json     # JSON Schema
├── registry-loader.js       # Load and query
├── build-registry.js        # Build from source
└── validate-registry.js     # Validation
```

### Using the Registry

```javascript
const { getRegistry, loadRegistry } = require('.aios-core/core/registry/registry-loader');

// Load registry
const registry = await loadRegistry();
console.log(`Loaded ${registry.totalWorkers} workers`);

// Query by ID
const worker = await registry.getById('create-story');

// Query by category
const tasks = await registry.getByCategory('task');

// Query by tag
const devTasks = await registry.getByTag('development');

// Search
const results = await registry.search('validate', { maxResults: 10 });
```

### Building the Registry

Rebuild after adding new workers:

```bash
node .aios-core/core/registry/build-registry.js
```

The builder scans these locations:

- `.aios-core/development/tasks/**/*.md` → task
- `.aios-core/product/templates/**/*.md` → template
- `.aios-core/infrastructure/scripts/**/*.js` → script
- `.aios-core/product/checklists/**/*.md` → checklist
- `.aios-core/development/workflows/**/*.yaml` → workflow

---

## Resolution Algorithm

### Phase 1: Discovery

```
1. Parse agent definition file (YAML in .md)
2. Extract dependencies section
3. Resolve task paths from .aios-core/development/tasks/
4. Resolve checklist paths from .aios-core/product/checklists/
5. Verify tool availability (CLI: which, MCP: config check)
```

### Phase 2: Validation

```
1. Check all referenced files exist
2. Verify no circular dependencies in workflows
3. Validate YAML/JSON syntax
4. Check tool installations
```

### Phase 3: Loading

```
1. Load dependencies on-demand (lazy loading)
2. Cache loaded dependencies (5min TTL)
3. Indexed lookups for O(1) access
```

---

## Dependency Graph

```
┌─────────────────────────────────────────────────────────────┐
│                    Dependency Graph                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Level 0 (Core Foundation)                                 │
│   └── core/                                                 │
│       ├── registry/        ← Service discovery             │
│       ├── config/          ← Configuration management      │
│       ├── health-check/    ← System validation             │
│       └── orchestration/   ← Workflow execution            │
│                                                             │
│   Level 1 (Primary Modules)                                 │
│   ├── development/                                          │
│   │   ├── agents/        → core/registry                   │
│   │   ├── tasks/         → core/config                     │
│   │   └── workflows/     → core/orchestration              │
│   └── product/                                              │
│       ├── templates/     → core/registry                   │
│       └── checklists/    → core/config                     │
│                                                             │
│   Level 2 (Infrastructure)                                  │
│   └── infrastructure/                                       │
│       ├── scripts/       → development/tasks               │
│       ├── integrations/  → core/registry                   │
│       └── templates/     → core/config                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Resolution Rules

### Rule 1: No Circular Dependencies

```
❌ A → B → C → A (circular)
✅ A → B → C (linear)
```

### Rule 2: Explicit Over Implicit

All dependencies must be explicitly declared:

```yaml
# Good: explicit
dependencies:
  tools: [git, npm]
  tasks: [task-a.md, task-b.md]

# Bad: implicit (using tool not declared)
```

### Rule 3: Lazy Loading

Dependencies are loaded only when needed:

```javascript
// Dependencies loaded on first access
const task = await registry.getById('create-story');
```

### Rule 4: Cache with TTL

Registry implements caching for performance:

- **TTL:** 5 minutes
- **Indexed lookups:** O(1) by ID, category, tag
- **Manual refresh:** `registry.load(true)` forces reload

---

## Workflow Dependency Resolution

### Sequential Dependencies

```yaml
workflow:
  name: deploy
  tasks:
    - task: lint
      depends_on: []
    - task: test
      depends_on: [lint]
    - task: build
      depends_on: [test]
    - task: deploy
      depends_on: [build]
```

Execution order: `lint → test → build → deploy`

### Parallel Dependencies

```yaml
workflow:
  name: validate
  tasks:
    - task: lint
      depends_on: []
    - task: typecheck
      depends_on: []
    - task: test
      depends_on: []
    - task: report
      depends_on: [lint, typecheck, test]
```

Execution: `[lint, typecheck, test] (parallel) → report`

---

## Error Handling

### Missing Dependency

```
Error: Dependency not found
  Agent: @dev
  Missing: task-a.md
  Expected: .aios-core/development/tasks/task-a.md

Resolution:
  1. Verify file exists at expected path
  2. Check spelling in dependencies declaration
  3. Rebuild registry: node .aios-core/core/registry/build-registry.js
```

### Circular Dependency

```
Error: Circular dependency detected
  Path: task-a → task-b → task-c → task-a

Resolution:
  1. Review task dependencies
  2. Break cycle by restructuring
  3. Consider shared dependency extraction
```

---

## Validation Commands

### Validate Registry

```bash
node .aios-core/core/registry/validate-registry.js
```

### Validate Structure

```bash
npm run validate:structure
```

### Build Registry

```bash
node .aios-core/core/registry/build-registry.js
```

---

## Related Documentation

- [Service Registry README](../../../.aios-core/core/registry/README.md)
- [Agent Tool Integration Guide](./agent-tool-integration-guide.md)
- [High-Level Architecture](./high-level-architecture.md)

---

**Maintainer:** @architect (Aria)
