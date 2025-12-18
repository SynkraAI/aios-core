# AIOS Source Tree Structure

**Version:** 2.0
**Last Updated:** 2025-12-15
**Status:** Official Framework Standard
**Repository:** SynkraAI/aios-core

---

## 📋 Table of Contents

- [Overview](#overview)
- [Modular Architecture](#modular-architecture)
- [Framework Core (.aios-core/)](#framework-core-aios-core)
- [Module Details](#module-details)
- [Documentation (docs/)](#documentation-docs)
- [Squads System](#squads-system)
- [File Naming Conventions](#file-naming-conventions)
- [Where to Put New Files](#where-to-put-new-files)

---

## Overview

AIOS uses a **modular architecture** with clear separation of concerns:

1. **Framework Core** (`.aios-core/`) - Portable framework components organized by domain
2. **Project Workspace** (root) - Project-specific implementation

**Philosophy:**
- **Domain-driven organization** - Components grouped by function
- **Portability** - Framework components work across projects
- **Separation of concerns** - Clear boundaries between modules

---

## Modular Architecture

```
aios-core/                             # Root project
├── .aios-core/                        # Framework core (modular)
│   ├── cli/                           # CLI commands and utilities
│   ├── core/                          # Framework essentials
│   ├── data/                          # Shared data files
│   ├── development/                   # Development assets (agents, tasks, workflows)
│   ├── docs/                          # Internal framework docs
│   ├── elicitation/                   # Elicitation engines
│   ├── infrastructure/                # Infrastructure tools and scripts
│   ├── manifests/                     # Installation manifests
│   ├── product/                       # PM/PO assets (templates, checklists)
│   ├── quality/                       # Quality gate schemas
│   ├── scripts/                       # Utility scripts
│   └── core-config.yaml               # Framework configuration
│
├── docs/                              # Public documentation
│   ├── architecture/                  # Architecture docs
│   ├── framework/                     # Official framework standards
│   ├── guides/                        # How-to guides
│   ├── installation/                  # Installation guides
│   └── community/                     # Community docs
│
├── templates/                         # Project templates
│   └── squad/                         # Squad template (see docs/guides/squads-guide.md)
│
├── bin/                               # CLI executables
│   └── aios.js                        # Main CLI entry point
│
├── tools/                             # Build and utility tools
│   ├── cli.js                         # CLI builder
│   └── installer/                     # Installation scripts
│
├── tests/                             # Test suites
│   ├── unit/                          # Unit tests
│   ├── integration/                   # Integration tests
│   └── e2e/                           # End-to-end tests
│
├── .claude/                           # Claude Code configuration
│   ├── CLAUDE.md                      # Project instructions
│   ├── commands/                      # Agent slash commands
│   └── rules/                         # IDE rules
│
├── index.js                           # Main entry point
├── package.json                       # Package manifest
└── README.md                          # Project README
```

---

## Framework Core (.aios-core/)

**Purpose:** Portable framework components organized by domain for clear separation of concerns.

### Directory Structure (v2.0 Modular)

```
.aios-core/
├── cli/                               # CLI System
│   ├── commands/                      # CLI command implementations
│   │   ├── generate/                  # Code generation commands
│   │   ├── manifest/                  # Manifest management
│   │   ├── mcp/                       # MCP tool commands
│   │   ├── metrics/                   # Quality metrics
│   │   ├── migrate/                   # Migration tools
│   │   ├── qa/                        # QA commands
│   │   └── workers/                   # Background workers
│   └── utils/                         # CLI utilities
│
├── core/                              # Framework Essentials
│   ├── config/                        # Configuration system
│   ├── data/                          # Core knowledge base
│   ├── docs/                          # Core documentation
│   ├── elicitation/                   # Interactive prompting engine
│   ├── manifest/                      # Manifest processing
│   ├── mcp/                           # MCP orchestration
│   ├── migration/                     # Migration utilities
│   ├── quality-gates/                 # Quality gate validators
│   ├── registry/                      # Service registry
│   ├── session/                       # Runtime state management
│   └── utils/                         # Core utilities
│
├── data/                              # Shared Data
│   └── aios-kb.md                     # AIOS knowledge base
│
├── development/                       # Development Assets
│   ├── agents/                        # Agent definitions (11 core agents)
│   │   ├── aios-master.md             # Master orchestrator
│   │   ├── dev.md                     # Developer agent
│   │   ├── qa.md                      # QA engineer agent
│   │   ├── architect.md               # System architect agent
│   │   ├── po.md                      # Product Owner agent
│   │   ├── pm.md                      # Product Manager agent
│   │   ├── sm.md                      # Scrum Master agent
│   │   ├── analyst.md                 # Business Analyst agent
│   │   ├── ux-design-expert.md        # UX Designer agent
│   │   ├── data-engineer.md           # Data Engineer agent
│   │   └── devops.md                  # DevOps agent
│   ├── agent-teams/                   # Agent team configurations
│   ├── tasks/                         # Task workflows (60+ tasks)
│   ├── workflows/                     # Multi-step workflows
│   └── scripts/                       # Development scripts
│
├── docs/                              # Internal Documentation
│   └── standards/                     # Framework standards
│
├── elicitation/                       # Elicitation Engines
│   ├── agent-elicitation.js           # Agent creation elicitation
│   ├── task-elicitation.js            # Task creation elicitation
│   └── workflow-elicitation.js        # Workflow creation elicitation
│
├── infrastructure/                    # Infrastructure
│   ├── integrations/                  # External integrations
│   │   └── pm-adapters/               # PM tool adapters (ClickUp, GitHub, Jira)
│   ├── scripts/                       # Infrastructure scripts
│   │   ├── documentation-integrity/   # Doc integrity system
│   │   └── llm-routing/               # LLM routing utilities
│   ├── templates/                     # Infrastructure templates
│   │   ├── core-config/               # Config templates
│   │   ├── github-workflows/          # CI/CD templates
│   │   ├── gitignore/                 # Gitignore templates
│   │   └── project-docs/              # Project documentation templates
│   ├── tests/                         # Infrastructure tests
│   └── tools/                         # Tool integrations
│       ├── cli/                       # CLI tool wrappers
│       ├── local/                     # Local tools
│       └── mcp/                       # MCP server configs
│
├── manifests/                         # Installation Manifests
│   └── schema/                        # Manifest schemas
│
├── product/                           # PM/PO Assets
│   ├── checklists/                    # Validation checklists
│   │   ├── po-master-checklist.md     # PO validation
│   │   ├── story-draft-checklist.md   # Story draft validation
│   │   ├── architect-checklist.md     # Architecture review
│   │   └── change-checklist.md        # Change management
│   ├── data/                          # PM-specific data
│   └── templates/                     # Document templates
│       ├── engine/                    # Template engine
│       ├── ide-rules/                 # IDE rule templates
│       ├── story-tmpl.yaml            # Story template
│       ├── prd-tmpl.yaml              # PRD template
│       └── epic-tmpl.md               # Epic template
│
├── quality/                           # Quality System
│   └── schemas/                       # Quality gate schemas
│
├── scripts/                           # Root Scripts
│   └── ...                            # Utility scripts
│
├── core-config.yaml                   # Framework configuration
├── install-manifest.yaml              # Installation manifest
├── user-guide.md                      # User guide
└── working-in-the-brownfield.md       # Brownfield guide
```

### File Patterns

```yaml
Agents:
  Location: .aios-core/development/agents/
  Format: Markdown with YAML frontmatter
  Naming: {agent-name}.md (kebab-case)
  Example: dev.md, qa.md, architect.md

Tasks:
  Location: .aios-core/development/tasks/
  Format: Markdown workflow
  Naming: {task-name}.md (kebab-case)
  Example: create-next-story.md, develop-story.md

Templates:
  Location: .aios-core/product/templates/
  Format: YAML or Markdown
  Naming: {template-name}-tmpl.{yaml|md}
  Example: story-tmpl.yaml, prd-tmpl.md

Workflows:
  Location: .aios-core/development/workflows/
  Format: YAML
  Naming: {workflow-type}-{scope}.yaml
  Example: greenfield-fullstack.yaml, brownfield-service.yaml

Checklists:
  Location: .aios-core/product/checklists/
  Format: Markdown
  Naming: {checklist-name}-checklist.md
  Example: story-draft-checklist.md, architect-checklist.md

Core Utilities:
  Location: .aios-core/core/utils/
  Format: JavaScript (CommonJS)
  Naming: {utility-name}.js (kebab-case)
  Example: component-generator.js, story-manager.js

CLI Commands:
  Location: .aios-core/cli/commands/{category}/
  Format: JavaScript (CommonJS)
  Naming: {command-name}.js (kebab-case)
  Example: generate/agent.js, manifest/install.js

Infrastructure Scripts:
  Location: .aios-core/infrastructure/scripts/{category}/
  Format: JavaScript
  Naming: {script-name}.js (kebab-case)
  Example: documentation-integrity/link-verifier.js
```

---

## Documentation (docs/)

### Current Organization

```
docs/
├── architecture/                      # ⚠️ Mixed: official + project-specific
│   ├── coding-standards.md            # ✅ Official (migrates to REPO 1)
│   ├── tech-stack.md                  # ✅ Official (migrates to REPO 1)
│   ├── source-tree.md                 # ✅ Official (migrates to REPO 1)
│   ├── decision-analysis-*.md         # Project-specific decisions
│   ├── architectural-review-*.md      # Project-specific reviews
│   └── mcp-*.md                       # Framework docs (migrates to REPO 1)
│
├── framework/                         # ⭐ NEW: Official framework docs (Q2 2026)
│   ├── coding-standards.md            # Framework coding standards
│   ├── tech-stack.md                  # Framework tech stack
│   ├── source-tree.md                 # Framework source tree
│   └── README.md                      # Migration notice
│
├── stories/                           # Development stories
│   ├── aios migration/                # AIOS migration stories
│   │   ├── story-6.1.2.1.md
│   │   ├── story-6.1.2.2.md
│   │   ├── story-6.1.2.3.md
│   │   ├── story-6.1.2.4.md
│   │   └── story-6.1.2.5.md
│   └── ...                            # Other stories
│
├── epics/                             # Epic planning
│   ├── epic-6.1-agent-identity-system.md
│   └── ...                            # Other epics
│
├── decisions/                         # Architecture Decision Records
│   ├── decision-005-repository-restructuring-FINAL.md
│   └── ...                            # Other ADRs
│
├── guides/                            # How-to guides
│   ├── git-workflow-guide.md
│   ├── migration-guide.md
│   └── ...                            # Other guides
│
├── qa/                                # QA artifacts
│   └── backlog-archive/               # Archived QA items
│
├── prd/                               # Product Requirements Documents
│   └── ...                            # PRD files
│
├── planning/                          # Planning documents
│   └── ...                            # Sprint plans, roadmaps
│
├── standards/                         # Framework standards
│   └── AGENT-PERSONALIZATION-STANDARD-V1.md
│
└── STORY-BACKLOG.md                   # ⭐ Story backlog index
```

### Proposed Reorganization (Story 6.1.2.6)

```
docs/
├── framework/                         # ✅ Official framework docs
│   ├── coding-standards.md
│   ├── tech-stack.md
│   ├── source-tree.md
│   ├── agent-spec.md
│   ├── task-spec.md
│   └── workflow-spec.md
│
├── architecture/                      # Project-specific architecture
│   ├── project-decisions/             # ✅ ADRs for this project
│   │   ├── decision-005-repository-restructuring-FINAL.md
│   │   ├── architectural-review-contextual-agent-load.md
│   │   └── ...
│   └── diagrams/                      # Architecture diagrams
│
├── stories/                           # Development stories
│   ├── index.md                       # ⭐ Story index (auto-generated)
│   ├── backlog.md                     # ⭐ Story backlog (official)
│   └── ...                            # Story files
│
├── epics/
├── guides/
├── qa/
├── prd/
└── standards/
```

---

## Squads System

> **Note:** Squads replaced the legacy "Squads" system in OSR-8. See [Squads Guide](../guides/squads-guide.md) for complete documentation.

### Overview

Squads are modular extensions that add specialized capabilities to AIOS. Unlike the deprecated Squads, Squads follow a standardized template structure.

### Squad Template Location

```
templates/squad/                       # Squad template for creating extensions
├── squad.yaml                         # Squad manifest template
├── package.json                       # NPM package template
├── README.md                          # Documentation template
├── LICENSE                            # License template
├── .gitignore                         # Git ignore template
├── agents/                            # Squad-specific agents
│   └── example-agent.yaml
├── tasks/                             # Squad-specific tasks
│   └── example-task.yaml
├── workflows/                         # Squad-specific workflows
│   └── example-workflow.yaml
├── templates/                         # Squad-specific templates
│   └── example-template.md
└── tests/                             # Squad tests
    └── example-agent.test.js
```

### Creating a New Squad

```bash
# Future CLI (planned):
npx create-aios-squad my-squad-name

# Current method:
cp -r templates/squad/ squads/my-squad-name/
# Then customize squad.yaml and components
```

### Squad Manifest Structure

```yaml
# squad.yaml
name: my-custom-squad
version: 1.0.0
description: Description of what this squad does
author: Your Name
license: MIT

# Components provided by this squad
agents:
  - custom-agent-1
  - custom-agent-2

tasks:
  - custom-task-1

workflows:
  - custom-workflow-1

# Dependencies
dependencies:
  aios-core: ">=2.1.0"
```

### Migration from Squads

| Legacy (Deprecated) | Current (Squads) |
|---------------------|------------------|
| `Squads/` directory | `templates/squad/` template |
| `expansionPacksLocation` config | `squadsTemplateLocation` config |
| `pack.yaml` manifest | `squad.yaml` manifest |
| Direct loading | Template-based creation |

---

## Future Structure (Post-Migration Q2 2026)

**Decision 005 defines 5 separate repositories:**

### REPO 1: SynkraAI/aios-core (Commons Clause)

```
aios-core/
├── .aios-core/                        # Framework assets (modular v2.0)
│   ├── cli/                           # CLI commands and utilities
│   ├── core/                          # Framework essentials
│   │   ├── config/                    # Configuration system
│   │   ├── quality-gates/             # Quality validators
│   │   └── utils/                     # Core utilities
│   ├── development/                   # Development assets
│   │   ├── agents/                    # Agent definitions (11 core)
│   │   ├── tasks/                     # Task workflows (60+)
│   │   └── workflows/                 # Multi-step workflows
│   ├── infrastructure/                # Infrastructure tools
│   │   ├── integrations/              # PM adapters, tools
│   │   ├── scripts/                   # Automation scripts
│   │   └── templates/                 # Infrastructure templates
│   ├── product/                       # PM/PO assets
│   │   ├── checklists/                # Validation checklists
│   │   └── templates/                 # Document templates
│   └── ...
│
├── bin/                               # CLI entry points
│   └── aios.js                        # Main CLI
│
├── tools/                             # Build and utility tools
│   ├── cli.js                         # CLI builder
│   └── installer/                     # Installation scripts
│
├── docs/                              # Framework documentation
│   ├── framework/                     # Official standards
│   ├── guides/                        # How-to guides
│   ├── installation/                  # Setup guides
│   └── architecture/                  # Architecture docs
│
├── templates/                         # Project templates
│   └── squad/                         # Squad template
│
├── tests/                             # Test suites
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── examples/                          # Example projects
    ├── basic-agent/
    ├── vibecoder-demo/
    └── multi-agent-workflow/
```

### REPO 2: SynkraAI/squads (MIT)

```
squads/
├── verified/                          # AIOS-curated squads
│   ├── github-devops/
│   ├── db-sage/
│   └── coderabbit-workflow/
│
├── community/                         # Community submissions
│   ├── marketing-agency/
│   ├── sales-automation/
│   └── ...
│
├── templates/                         # Squad templates
│   ├── minimal-squad/
│   └── agent-squad/
│
└── tools/                             # Squad development tools
    └── create-aios-squad/
```

### REPO 3: SynkraAI/mcp-ecosystem (Apache 2.0)

```
mcp-ecosystem/
├── presets/                           # MCP presets (Docker MCP Toolkit)
│   ├── aios-dev/
│   ├── aios-research/
│   └── aios-docker/
│
├── mcps/                              # Base MCP configs
│   ├── exa/
│   ├── context7/
│   └── desktop-commander/
│
└── ide-configs/                       # IDE integrations
    ├── claude-code/
    ├── gemini-cli/
    └── cursor/
```

### REPO 4: SynkraAI/certified-partners (Private)

```
certified-partners/
├── premium-packs/                     # Premium Squads
│   ├── enterprise-deployment/
│   └── advanced-devops/
│
├── partner-portal/                    # Partner Success Platform
│   ├── dashboard/
│   └── analytics/
│
└── marketplace/                       # Marketplace platform
    ├── api/
    └── web/
```

### REPO 5: SynkraAI/mmos (Private + NDA)

```
mmos/
├── minds/                             # 34 cognitive clones
│   ├── pedro-valerio/
│   ├── paul-graham/
│   └── ...
│
├── emulator/                          # MMOS emulation engine
│   ├── mirror-agent/
│   └── dna-mental/
│
└── research/                          # Research artifacts
    └── transcripts/
```

---

## File Naming Conventions

### General Rules

```yaml
Directories: kebab-case (lowercase, hyphen-separated)
  ✅ .aios-core/
  ✅ Squads/
  ❌ .AIOS-Core/
  ❌ expansionPacks/

Files (Code): kebab-case with extension
  ✅ agent-executor.js
  ✅ task-runner.js
  ❌ AgentExecutor.js
  ❌ taskRunner.js

Files (Docs): kebab-case with .md extension
  ✅ coding-standards.md
  ✅ story-6.1.2.5.md
  ❌ CodingStandards.md
  ❌ Story_6_1_2_5.md

Files (Config): lowercase or kebab-case
  ✅ package.json
  ✅ tsconfig.json
  ✅ core-config.yaml
  ❌ PackageConfig.json
```

### Special Cases

```yaml
Stories:
  Format: story-{epic}.{story}.{substory}.md
  Example: story-6.1.2.5.md

Epics:
  Format: epic-{number}-{name}.md
  Example: epic-6.1-agent-identity-system.md

Decisions:
  Format: decision-{number}-{name}.md
  Example: decision-005-repository-restructuring-FINAL.md

Templates:
  Format: {name}-tmpl.{yaml|md}
  Example: story-tmpl.yaml, prd-tmpl.md

Checklists:
  Format: {name}-checklist.md
  Example: architect-checklist.md
```

---

## Where to Put New Files

### Decision Matrix

```yaml
# I'm creating a new agent:
Location: .aios-core/development/agents/{agent-name}.md
Example: .aios-core/development/agents/security-expert.md

# I'm creating a new task:
Location: .aios-core/development/tasks/{task-name}.md
Example: .aios-core/development/tasks/deploy-to-production.md

# I'm creating a new workflow:
Location: .aios-core/development/workflows/{workflow-name}.yaml
Example: .aios-core/development/workflows/continuous-deployment.yaml

# I'm creating a new template:
Location: .aios-core/product/templates/{template-name}-tmpl.{yaml|md}
Example: .aios-core/product/templates/deployment-plan-tmpl.yaml

# I'm creating a new checklist:
Location: .aios-core/product/checklists/{checklist-name}-checklist.md
Example: .aios-core/product/checklists/security-review-checklist.md

# I'm creating a CLI command:
Location: .aios-core/cli/commands/{category}/{command-name}.js
Example: .aios-core/cli/commands/generate/workflow.js

# I'm creating a core utility:
Location: .aios-core/core/utils/{utility-name}.js
Example: .aios-core/core/utils/performance-monitor.js

# I'm creating an infrastructure script:
Location: .aios-core/infrastructure/scripts/{category}/{script-name}.js
Example: .aios-core/infrastructure/scripts/llm-routing/router.js

# I'm adding a PM tool adapter:
Location: .aios-core/infrastructure/integrations/pm-adapters/{adapter-name}.js
Example: .aios-core/infrastructure/integrations/pm-adapters/monday-adapter.js

# I'm writing a story (internal dev docs - gitignored):
Location: docs/stories/{sprint-context}/{story-file}.md
Example: docs/stories/v2.1/sprint-6/story-6.14-new-feature.md

# I'm creating official framework documentation:
Location: docs/framework/{doc-name}.md
Example: docs/framework/agent-development-guide.md

# I'm creating a test:
Location: tests/{type}/{test-name}.test.js
Example: tests/unit/agent-executor.test.js

# I'm creating a squad:
Location: Copy templates/squad/ to your squads directory
Example: squads/devops-automation/ (customize from template)
```

---

## Special Directories

### .ai/ Directory (NEW - Story 6.1.2.6)

```
.ai/                                   # AI session artifacts
├── decision-log-6.1.2.5.md            # Yolo mode decision log
├── decision-log-6.1.2.6.md            # Another decision log
└── session-{date}-{agent}.md          # Session transcripts (optional)
```

**Purpose:** Track AI-driven decisions during development sessions (especially yolo mode)

**Auto-generated:** Yes (when yolo mode enabled)

### outputs/ Directory

```
outputs/                               # Runtime outputs (gitignored)
├── minds/                             # MMOS cognitive clones
│   └── pedro_valerio/
│       ├── system-prompt.md
│       ├── kb/
│       └── artifacts/
│
└── architecture-map/                  # Architecture analysis
    ├── MASTER-RELATIONSHIP-MAP.json
    └── schemas/
```

**Purpose:** Runtime artifacts not committed to git

---

## Related Documents

- [Coding Standards](./coding-standards.md)
- [Tech Stack](./tech-stack.md)
- [Decision 005: Repository Restructuring](../decisions/decision-005-repository-restructuring-FINAL.md)
- [Story 6.1.2.5: Contextual Agent Load System](../stories/aios%20migration/story-6.1.2.5-contextual-agent-load-system.md)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-01-15 | Initial source tree documentation | Aria (architect) |
| 1.1 | 2025-12-14 | Updated org to SynkraAI, replaced Squads with Squads system [Story 6.10] | Dex (dev) |
| 2.0 | 2025-12-15 | Major update to reflect modular architecture (cli/, core/, development/, infrastructure/, product/) [Story 6.13] | Pax (PO) |

---

*This is an official AIOS framework standard. All file placement must follow this structure.*
