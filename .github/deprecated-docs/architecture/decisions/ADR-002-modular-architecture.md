# ADR-002: Modular Architecture for .aios-core

**Status:** Proposed
**Date:** 2025-11-27
**Story:** [Story 2.1 - Module Structure Design](../../../docs/stories/v2.1/sprint-2/story-2.1-module-structure-design.md)
**Decision Makers:** Aria (Architect), Pedro Clone (Tech Lead)

## Context

The `.aios-core/` directory has grown organically to contain 335+ files across 13 top-level directories. This monolithic structure presents several challenges:

1. **Cognitive Load**: Developers must understand the entire codebase to make changes
2. **Unclear Boundaries**: No clear separation between framework core vs. optional features
3. **Dependency Chaos**: Scripts have cross-cutting dependencies without clear patterns
4. **Scaling Issues**: Adding new expansion packs or features requires touching many areas

### Current Structure (Pre-Migration)
```
.aios-core/
├── .session/           # Runtime state (1 file)
├── agent-teams/        # Team configurations (5 files)
├── agents/             # Agent definitions (16 files)
├── checklists/         # Validation checklists (6 files)
├── data/               # KB, patterns, preferences (9 files)
├── docs/               # Framework documentation (5 files)
├── elicitation/        # Interactive prompting (3 files)
├── scripts/            # Business logic (103+ files)
├── tasks/              # Task definitions (120+ files)
├── templates/          # Document templates (52+ files)
├── tests/              # Test suites (1 file)
├── tools/              # Tool configurations (12 files)
└── workflows/          # Workflow definitions (7 files)
```

## Decision

Reorganize `.aios-core/` into **4 bounded modules** based on functional domains:

```
.aios-core/
├── core/               # Framework essentials (REQUIRED for any project)
├── development/        # Development features (agents, tasks, workflows)
├── product/            # Product management (templates, checklists)
└── infrastructure/     # System tooling (CLI, MCP, scripts, integrations)
```

## Module Definitions

### 1. CORE Module
**Purpose:** Minimal framework foundation required for AIOS to function.

**Contents:**
- Configuration system (`config-loader.js`, `config-cache.js`)
- Session management (`.session/`)
- Knowledge base (`data/aios-kb.md`)
- Elicitation engine
- Core documentation
- Package entry points (`index.js`, `index.esm.js`, `package.json`)

**Characteristics:**
- Zero optional dependencies
- Must work standalone
- Backward-compatible API

### 2. DEVELOPMENT Module
**Purpose:** All agent-related development capabilities.

**Contents:**
- All agents (`agents/`)
- All tasks (`tasks/`)
- All workflows (`workflows/`)
- Agent teams (`agent-teams/`)
- Development scripts (greeting, validation, story management)

**Characteristics:**
- Can be disabled for non-agent use cases
- Self-contained agent ecosystem
- Depends only on CORE

### 3. PRODUCT Module
**Purpose:** Product management and documentation assets.

**Contents:**
- All templates (`templates/`)
- All checklists (`checklists/`)
- Brainstorming techniques
- Mode selection best practices

**Characteristics:**
- Stateless assets
- No runtime dependencies
- Used by agents but not required for execution

### 4. INFRASTRUCTURE Module
**Purpose:** System-level tooling, integrations, and scripts.

**Contents:**
- Tool configurations (`tools/`)
- PM adapters (`scripts/pm-adapters/`)
- Git integration scripts
- Migration scripts
- Test utilities
- Framework analyzers

**Characteristics:**
- External system integrations
- Optional based on deployment
- Heavy external dependencies

## Consequences

### Positive
- **Clear ownership**: Each module has defined responsibilities
- **Easier testing**: Modules can be tested in isolation
- **Selective deployment**: Install only needed modules
- **Reduced complexity**: Smaller cognitive load per module
- **Better documentation**: Module-level READMEs

### Negative
- **Migration effort**: One-time refactoring cost
- **Import updates**: All internal references must be updated
- **Build complexity**: May need module-aware build process

### Neutral
- **Learning curve**: Team needs to understand new structure
- **Tooling updates**: IDEs/scripts may need path updates

## Migration Strategy

See [ADR-002-migration-map.md](./ADR-002-migration-map.md) for detailed file mappings.

**Phases:**
1. Create module directories with READMEs
2. Move files with git mv (preserve history)
3. Update all internal imports
4. Run validation scripts
5. Update documentation

## Validation

**Success Criteria:**
- [ ] All tests pass after migration
- [ ] No broken imports (`node --check`)
- [ ] Package exports work correctly
- [ ] Agent activation unchanged
- [ ] CLI commands functional

## References

- [Story 2.0 - Pre-Migration Cleanup](../../../docs/stories/v2.1/sprint-2/story-2.0-pre-migration-cleanup.md)
- [Scripts Consolidation Analysis](../scripts-consolidation-analysis.md)
- [Expansion Packs Structure Inventory](../expansion-packs-structure-inventory.md)
