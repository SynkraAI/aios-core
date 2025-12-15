# ADR-002: Migration Map

**Parent ADR:** [ADR-002-modular-architecture.md](./ADR-002-modular-architecture.md)
**Story:** [Story 2.1 - Module Structure Design](../../../docs/stories/v2.1/sprint-2/story-2.1-module-structure-design.md)
**Created:** 2025-11-27

## Target Structure

```
.aios-core/
├── core/                           # Framework essentials
│   ├── config/                     # Configuration system
│   ├── data/                       # Knowledge base and patterns
│   ├── docs/                       # Core documentation
│   ├── elicitation/                # Interactive prompting engine
│   ├── session/                    # Runtime state management
│   └── index.js                    # Core exports
│
├── development/                    # Agent ecosystem
│   ├── agents/                     # Agent definitions
│   ├── agent-teams/                # Team configurations
│   ├── tasks/                      # Task definitions
│   ├── workflows/                  # Workflow definitions
│   └── scripts/                    # Agent-related scripts
│
├── product/                        # PM assets
│   ├── templates/                  # Document templates
│   ├── checklists/                 # Validation checklists
│   └── data/                       # PM-specific data
│
└── infrastructure/                 # System tooling
    ├── tools/                      # Tool configurations
    ├── scripts/                    # System scripts
    ├── tests/                      # Test utilities
    └── integrations/               # External integrations
```

## Detailed Migration Map

### CORE Module (22 files)

| Current Location | New Location | Notes |
|-----------------|--------------|-------|
| `.session/` | `core/session/` | Runtime state |
| `data/aios-kb.md` | `core/data/aios-kb.md` | Knowledge base |
| `data/workflow-patterns.yaml` | `core/data/workflow-patterns.yaml` | Core patterns |
| `docs/component-creation-guide.md` | `core/docs/component-creation-guide.md` | |
| `docs/session-update-pattern.md` | `core/docs/session-update-pattern.md` | |
| `docs/SHARD-TRANSLATION-GUIDE.md` | `core/docs/SHARD-TRANSLATION-GUIDE.md` | |
| `docs/template-syntax.md` | `core/docs/template-syntax.md` | |
| `docs/troubleshooting-guide.md` | `core/docs/troubleshooting-guide.md` | |
| `elicitation/agent-elicitation.js` | `core/elicitation/agent-elicitation.js` | |
| `elicitation/task-elicitation.js` | `core/elicitation/task-elicitation.js` | |
| `elicitation/workflow-elicitation.js` | `core/elicitation/workflow-elicitation.js` | |
| `scripts/config-loader.js` | `core/config/config-loader.js` | Config system |
| `scripts/config-cache.js` | `core/config/config-cache.js` | Caching |
| `scripts/elicitation-engine.js` | `core/elicitation/elicitation-engine.js` | Core engine |
| `scripts/elicitation-session-manager.js` | `core/elicitation/session-manager.js` | |
| `scripts/session-context-loader.js` | `core/session/context-loader.js` | |
| `scripts/context-detector.js` | `core/session/context-detector.js` | |
| `scripts/output-formatter.js` | `core/utils/output-formatter.js` | |
| `scripts/yaml-validator.js` | `core/utils/yaml-validator.js` | |
| `index.js` | `core/index.js` | Entry point |
| `index.esm.js` | `core/index.esm.js` | ESM entry |
| `index.d.ts` | `core/index.d.ts` | TypeScript defs |

### DEVELOPMENT Module (248+ files)

| Current Location | New Location | Notes |
|-----------------|--------------|-------|
| `agents/` (16 files) | `development/agents/` | All agents |
| `agent-teams/` (5 files) | `development/teams/` | Team configs |
| `tasks/` (120+ files) | `development/tasks/` | All tasks |
| `workflows/` (7 files) | `development/workflows/` | All workflows |

**Development Scripts (move to `development/scripts/`):**

| Script | Category |
|--------|----------|
| `agent-assignment-resolver.js` | Agent management |
| `agent-config-loader.js` | Agent management |
| `agent-exit-hooks.js` | Agent management |
| `audit-agent-config.js` | Agent management |
| `batch-update-agents-session-context.js` | Agent management |
| `generate-greeting.js` | Agent greeting |
| `greeting-builder.js` | Agent greeting |
| `greeting-config-cli.js` | Agent greeting |
| `greeting-preference-manager.js` | Agent greeting |
| `test-greeting-system.js` | Agent greeting |
| `apply-inline-greeting-all-agents.js` | Agent greeting |
| `story-manager.js` | Story management |
| `story-update-hook.js` | Story management |
| `story-index-generator.js` | Story management |
| `backlog-manager.js` | Story management |
| `dev-context-loader.js` | Development |
| `decision-context.js` | Decision tracking |
| `decision-log-generator.js` | Decision tracking |
| `decision-log-indexer.js` | Decision tracking |
| `decision-recorder.js` | Decision tracking |
| `task-identifier-resolver.js` | Task management |
| `migrate-task-to-v2.js` | Task migration |
| `validate-task-v2.js` | Task validation |
| `workflow-navigator.js` | Workflow navigation |

### PRODUCT Module (67+ files)

| Current Location | New Location | Notes |
|-----------------|--------------|-------|
| `templates/` (52+ files) | `product/templates/` | All templates |
| `checklists/` (6 files) | `product/checklists/` | All checklists |
| `data/brainstorming-techniques.md` | `product/data/brainstorming-techniques.md` | PM data |
| `data/elicitation-methods.md` | `product/data/elicitation-methods.md` | PM data |
| `data/mode-selection-best-practices.md` | `product/data/mode-selection-best-practices.md` | PM data |
| `data/test-levels-framework.md` | `product/data/test-levels-framework.md` | QA data |
| `data/test-priorities-matrix.md` | `product/data/test-priorities-matrix.md` | QA data |
| `data/technical-preferences.md` | `product/data/technical-preferences.md` | Config data |

### INFRASTRUCTURE Module (65+ files)

| Current Location | New Location | Notes |
|-----------------|--------------|-------|
| `tools/` (12 files) | `infrastructure/tools/` | All tool configs |
| `tests/` (1 file) | `infrastructure/tests/` | Test suites |

**Infrastructure Scripts (move to `infrastructure/scripts/`):**

| Script | Category |
|--------|----------|
| `pm-adapter.js` | PM Integration |
| `pm-adapter-factory.js` | PM Integration |
| `pm-adapters/` (5 files) | PM Integration |
| `status-mapper.js` | PM Integration |
| `clickup-helpers.js` | ClickUp Integration |
| `git-wrapper.js` | Git Integration |
| `git-config-detector.js` | Git Integration |
| `branch-manager.js` | Git Integration |
| `commit-message-generator.js` | Git Integration |
| `backup-manager.js` | System |
| `transaction-manager.js` | System |
| `repository-detector.js` | System |
| `approval-workflow.js` | System |
| `aios-validator.js` | Validation |
| `template-validator.js` | Validation |
| `template-engine.js` | Templates |
| `component-generator.js` | Generation |
| `component-metadata.js` | Generation |
| `component-search.js` | Generation |
| `batch-creator.js` | Generation |
| `migration-generator.js` | Migration |
| `migration-path-generator.js` | Migration |
| `dependency-analyzer.js` | Analysis |
| `dependency-impact-analyzer.js` | Analysis |
| `framework-analyzer.js` | Analysis |
| `capability-analyzer.js` | Analysis |
| `security-checker.js` | Analysis |
| `coverage-analyzer.js` | Testing |
| `test-generator.js` | Testing |
| `test-utilities.js` | Testing |
| `test-utilities-fast.js` | Testing |
| `test-quality-assessment.js` | Testing |
| `sandbox-tester.js` | Testing |
| `performance-analyzer.js` | Performance |
| `performance-optimizer.js` | Performance |
| `performance-tracker.js` | Performance |
| `performance-and-error-resolver.js` | Performance |
| `code-quality-improver.js` | Quality |
| `refactoring-suggester.js` | Quality |
| `improvement-engine.js` | Quality |
| `improvement-validator.js` | Quality |
| `modification-risk-assessment.js` | Risk |
| `modification-validator.js` | Risk |
| `conflict-resolver.js` | Conflict |
| `documentation-synchronizer.js` | Docs |
| `tool-resolver.js` | Tools |
| `usage-analytics.js` | Analytics |
| `project-status-loader.js` | Status |
| `visual-impact-generator.js` | Visualization |
| `validate-output-pattern.js` | Validation |
| `spot-check-validator.js` | Validation |
| `atomic-layer-classifier.js` | Classification |
| `fix-yaml-formatting.js` | Utility |
| `test-yaml-parsing.js` | Utility |
| `verify-yaml-fix.js` | Utility |
| `final-todo-count.js` | Utility |
| `phase2-*.js` | Migration phases |
| `phase3-*.js` | Migration phases |
| `phase4-*.js` | Migration phases |
| `batch-migrate-phase*.ps1` | Migration scripts |
| `validate-phase1.ps1` | Migration scripts |
| `migrate-framework-docs.sh` | Migration scripts |

## Files to Remain at Root

| File | Reason |
|------|--------|
| `package.json` | NPM package definition |
| `install-manifest.yaml` | Installation config |
| `user-guide.md` | Quick reference |
| `working-in-the-brownfield.md` | Methodology guide |

## Special Considerations

### 1. Data Directory Split
The `data/` directory contains files for different modules:
- **Core:** `aios-kb.md`, `workflow-patterns.yaml`, `agent-config-requirements.yaml`
- **Product:** `brainstorming-techniques.md`, `elicitation-methods.md`, test matrices

### 2. Scripts Categorization
The 103+ scripts need careful categorization. Key groupings:
- **Agent-related:** 24 scripts → `development/scripts/`
- **Integration/System:** 45 scripts → `infrastructure/scripts/`
- **Core utilities:** 8 scripts → `core/utils/`

### 3. Template Subfolders
`templates/ide-rules/` contains 9 IDE-specific rule files that should move together.

### 4. PM Adapters
`scripts/pm-adapters/` is a subdirectory with 5 adapter files that should move as a unit to `infrastructure/integrations/pm-adapters/`.

## Import Path Updates

### Before
```javascript
const { globalConfigCache } = require('./config-cache');
const ContextDetector = require('./context-detector');
const GitWrapper = require('./git-wrapper');
```

### After
```javascript
const { globalConfigCache } = require('../core/config/config-cache');
const ContextDetector = require('../core/session/context-detector');
const GitWrapper = require('../infrastructure/scripts/git-wrapper');
```

## Validation Script Requirements

A validation script must verify:
1. No broken `require()` statements
2. No broken relative imports
3. All exported functions accessible
4. Agent activation works
5. Task execution works
6. CLI commands functional

See [ADR-002-validation-plan.md](./ADR-002-validation-plan.md) for detailed validation procedures.
