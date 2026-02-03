# AIOS Agents, Squads, Workflows & Templates

Complete reference guide for the Synkra AIOS multi-agent system.

---

## Table of Contents

1. [Agents Overview](#agents-overview)
2. [Agent Details & Commands](#agent-details--commands)
3. [Squads System](#squads-system)
4. [Workflows](#workflows)
5. [Templates](#templates)
6. [How to Use](#how-to-use)

---

## Agents Overview

AIOS has **12 specialized AI agents**, each with a unique persona, role, and set of commands.

### Agent Summary Table

| Agent | Persona | Icon | Role | Activation |
|-------|---------|------|------|------------|
| `@aios-master` | Orion | 👑 | Master Orchestrator & Framework Developer | `@aios-master` |
| `@dev` | Dex | 💻 | Full Stack Developer | `@dev` |
| `@architect` | Aria | 🏛️ | System Architect | `@architect` |
| `@qa` | Quinn | ✅ | Test Architect & Quality Advisor | `@qa` |
| `@devops` | Gage | ⚡ | GitHub Repository Manager & DevOps | `@devops` |
| `@pm` | Morgan | 📋 | Product Manager | `@pm` |
| `@po` | Pax | 🎯 | Product Owner | `@po` |
| `@sm` | River | 🌊 | Scrum Master | `@sm` |
| `@analyst` | Atlas | 🔍 | Business Analyst | `@analyst` |
| `@data-engineer` | Dara | 📊 | Database Architect | `@data-engineer` |
| `@ux-design-expert` | Uma | 🎨 | UX/UI Designer | `@ux-design-expert` |
| `@squad-creator` | Craft | 🏗️ | Squad Creator | `@squad-creator` |

### Agent Authority Matrix

| Operation | Authorized Agent |
|-----------|-----------------|
| **Git Push** | `@devops` ONLY |
| **PR Creation** | `@devops` ONLY |
| **Story Creation** | `@sm` |
| **Epic Creation** | `@pm` |
| **Code Implementation** | `@dev` |
| **QA Review** | `@qa` |
| **Database Schema** | `@data-engineer` |
| **System Architecture** | `@architect` |
| **UX/UI Design** | `@ux-design-expert` |
| **Research** | `@analyst` |
| **Squad Management** | `@squad-creator` |

---

## Agent Details & Commands

### 1. @aios-master (Orion) 👑

**Role:** Master Orchestrator & Framework Developer

**When to Use:**
- Creating/modifying AIOS framework components
- Orchestrating complex multi-agent workflows
- Executing any task from any agent directly
- Framework development and meta-operations

**Key Commands:**
```
*help                    - Show all commands
*kb                      - Toggle KB mode (loads AIOS knowledge)
*create agent {name}     - Create new agent definition
*create task {name}      - Create new task file
*create workflow {name}  - Create new workflow
*modify agent {name}     - Modify existing agent
*workflow {name}         - Start workflow
*plan                    - Create workflow plan
*task {task}             - Execute specific task
*validate-component      - Validate component security
*correct-course          - Analyze and correct deviations
*exit                    - Exit agent mode
```

---

### 2. @dev (Dex) 💻

**Role:** Full Stack Developer & Implementation Specialist

**When to Use:**
- Implementing user stories
- Fixing bugs and refactoring code
- Running tests and validations
- Registering technical debt

**Key Commands:**
```
*help                    - Show all commands
*develop {story-id}      - Implement story tasks
*develop-yolo            - Autonomous development mode
*develop-interactive     - Interactive development mode
*run-tests               - Execute linting and tests
*apply-qa-fixes          - Apply QA feedback and fixes
*fix-qa-issues           - Fix QA issues (8-phase workflow)
*create-service          - Scaffold new service from template
*backlog-debt {title}    - Register technical debt
*build-autonomous        - Start autonomous build loop
*build-resume            - Resume build from checkpoint
*worktree-create         - Create isolated worktree for story
*gotcha                  - Add a gotcha manually
*exit                    - Exit developer mode
```

**Restrictions:**
- Cannot push to remote (delegate to `@devops`)
- Can only edit specific story sections (Dev Agent Record)

---

### 3. @architect (Aria) 🏛️

**Role:** Holistic System Architect & Full-Stack Technical Leader

**When to Use:**
- System architecture design (fullstack, backend, frontend)
- Technology stack selection
- API design (REST/GraphQL/tRPC/WebSocket)
- Security architecture
- Performance optimization

**Key Commands:**
```
*help                           - Show all commands
*create-full-stack-architecture - Complete system design
*create-backend-architecture    - Backend architecture
*create-front-end-architecture  - Frontend architecture
*create-brownfield-architecture - Architecture for existing projects
*document-project               - Generate project documentation
*analyze-project-structure      - Analyze for new feature (WIS-15)
*research {topic}               - Generate deep research prompt
*create-plan                    - Create implementation plan
*create-context                 - Generate project context
*map-codebase                   - Generate codebase map
*exit                           - Exit architect mode
```

**Delegates to:**
- Database schema design → `@data-engineer`
- Git push operations → `@devops`

---

### 4. @qa (Quinn) ✅

**Role:** Test Architect & Quality Advisor

**When to Use:**
- Comprehensive story review
- Quality gate decisions
- Test strategy design
- Code improvement analysis

**Key Commands:**
```
*help                      - Show all commands
*code-review {scope}       - Run automated review
*review {story}            - Comprehensive story review
*review-build {story}      - 10-phase structured QA review
*gate {story}              - Create quality gate decision
*nfr-assess {story}        - Validate non-functional requirements
*risk-profile {story}      - Generate risk assessment
*create-fix-request {story} - Generate QA_FIX_REQUEST.md for @dev
*validate-libraries        - Validate third-party library usage
*security-check            - Run 8-point security scan
*validate-migrations       - Validate database migrations
*test-design {story}       - Create test scenarios
*trace {story}             - Map requirements to tests
*critique-spec {story}     - Review specification
*exit                      - Exit QA mode
```

**Gate Decisions:** PASS / CONCERNS / FAIL / WAIVED

---

### 5. @devops (Gage) ⚡

**Role:** GitHub Repository Manager & DevOps Specialist

**When to Use:**
- Git push operations (ONLY agent authorized)
- Pull request creation and management
- CI/CD configuration
- Release management
- Repository cleanup

**Key Commands:**
```
*help                    - Show all commands
*detect-repo             - Detect repository context
*pre-push                - Run all quality gates
*push                    - Execute git push after gates pass
*create-pr               - Create pull request
*release                 - Create versioned release
*cleanup                 - Remove stale branches/files
*version-check           - Analyze version and recommend next
*configure-ci            - Setup GitHub Actions workflows
*setup-github            - Configure DevOps infrastructure
*worktree-create         - Create isolated worktree
*worktree-list           - List active worktrees
*worktree-merge          - Merge worktree branch to base
*search-mcp              - Search available MCPs
*add-mcp                 - Add MCP server
*list-mcps               - List enabled MCPs
*exit                    - Exit DevOps mode
```

**Exclusive Authority:**
- `git push` - ONLY this agent
- `gh pr create` - ONLY this agent
- `gh pr merge` - ONLY this agent
- `gh release create` - ONLY this agent

---

### 6. @pm (Morgan) 📋

**Role:** Product Manager & Strategic Planner

**When to Use:**
- PRD creation (greenfield and brownfield)
- Epic creation and management
- Product strategy and vision
- Feature prioritization (MoSCoW, RICE)
- Roadmap planning

**Key Commands:**
```
*help                    - Show all commands
*create-prd              - Create product requirements document
*create-brownfield-prd   - Create PRD for existing projects
*create-epic             - Create epic for brownfield
*create-story            - Create user story
*research {topic}        - Generate deep research prompt
*gather-requirements     - Elicit and document requirements
*write-spec              - Generate formal specification
*doc-out                 - Output complete document
*shard-prd               - Break PRD into smaller parts
*exit                    - Exit PM mode
```

**Delegates to:**
- Story creation → `@sm`
- Course correction → `@aios-master`
- Deep research → `@analyst`

---

### 7. @po (Pax) 🎯

**Role:** Product Owner & Process Steward

**When to Use:**
- Backlog management
- Story refinement and validation
- Acceptance criteria definition
- Sprint planning coordination

**Key Commands:**
```
*help                      - Show all commands
*backlog-add               - Add item to story backlog
*backlog-review            - Generate backlog review
*backlog-summary           - Quick backlog status
*backlog-prioritize        - Re-prioritize backlog item
*backlog-schedule          - Assign item to sprint
*stories-index             - Regenerate story index
*validate-story-draft      - Validate story quality
*sync-story                - Sync story to PM tool
*pull-story                - Pull story updates from PM tool
*execute-checklist-po      - Run PO master checklist
*exit                      - Exit PO mode
```

**Delegates to:**
- Story creation → `@sm`
- Epic creation → `@pm`

---

### 8. @sm (River) 🌊

**Role:** Scrum Master - Story Preparation Specialist

**When to Use:**
- User story creation from PRD
- Story validation and refinement
- Acceptance criteria definition
- Sprint planning assistance
- Local branch management

**Key Commands:**
```
*help                    - Show all commands
*draft                   - Create next user story
*story-checklist         - Run story draft checklist
*exit                    - Exit Scrum Master mode
```

**Git Operations (Local Only):**
- `git checkout -b feature/X.Y-story-name` - Create branches
- `git branch` - List branches
- `git branch -d` - Delete local branches
- `git checkout` - Switch branches
- `git merge` - Merge locally

**Delegates to:**
- Push to remote → `@devops`
- PR creation → `@devops`

---

### 9. @analyst (Atlas) 🔍

**Role:** Business Analyst & Strategic Ideation Partner

**When to Use:**
- Market research
- Competitive analysis
- User research
- Brainstorming facilitation
- Project discovery

**Key Commands:**
```
*help                       - Show all commands
*create-project-brief       - Create project brief
*perform-market-research    - Market research analysis
*create-competitor-analysis - Competitive analysis
*brainstorm {topic}         - Structured brainstorming
*elicit                     - Advanced elicitation session
*research-deps              - Research dependencies
*extract-patterns           - Extract code patterns
*doc-out                    - Output complete document
*exit                       - Exit analyst mode
```

---

### 10. @data-engineer (Dara) 📊

**Role:** Database Architect & Operations Engineer

**When to Use:**
- Database schema design
- Supabase configuration
- RLS policies
- Migrations
- Query optimization
- Database operations

**Key Commands:**
```
*help                      - Show all commands
*create-schema             - Design database schema
*create-rls-policies       - Design RLS policies
*create-migration-plan     - Create migration strategy
*design-indexes            - Design indexing strategy
*model-domain              - Domain modeling session
*setup-database            - Interactive database setup
*apply-migration {path}    - Run migration with safety snapshot
*dry-run {path}            - Test migration without commit
*snapshot {label}          - Create schema snapshot
*rollback {snapshot}       - Restore snapshot
*security-audit {scope}    - Database security audit
*analyze-performance {type} - Query performance analysis
*test-as-user {user_id}    - Test RLS policies
*exit                      - Exit data-engineer mode
```

---

### 11. @ux-design-expert (Uma) 🎨

**Role:** UX/UI Designer & Design System Architect

**When to Use:**
- User research and wireframing
- Design system audits
- Design tokens extraction
- Atomic component building
- Accessibility audits

**Key Commands (5 Phases):**

**Phase 1 - UX Research:**
```
*research                  - User research and needs analysis
*wireframe {fidelity}      - Create wireframes
*generate-ui-prompt        - Generate prompts for AI UI tools
*create-front-end-spec     - Create frontend specification
```

**Phase 2 - Design System Audit:**
```
*audit {path}              - Scan for UI pattern redundancies
*consolidate               - Reduce redundancy
*shock-report              - Generate visual chaos report
```

**Phase 3 - Design Tokens:**
```
*tokenize                  - Extract design tokens
*setup                     - Initialize design system
*migrate                   - Generate migration strategy
*upgrade-tailwind          - Plan Tailwind CSS v4 upgrades
*bootstrap-shadcn          - Install Shadcn/Radix library
```

**Phase 4 - Component Building:**
```
*build {component}         - Build atomic component
*compose {molecule}        - Compose molecule from atoms
*extend {component}        - Add variant to component
```

**Phase 5 - Quality:**
```
*document                  - Generate pattern library
*a11y-check                - Run accessibility audit (WCAG)
*calculate-roi             - Calculate ROI and savings
```

---

### 12. @squad-creator (Craft) 🏗️

**Role:** Squad Architect & Builder

**When to Use:**
- Creating new squads
- Validating squad structure
- Analyzing existing squads
- Extending squads with new components
- Preparing squads for distribution

**Key Commands:**
```
*help                    - Show all commands
*design-squad            - Design squad from documentation
*create-squad {name}     - Create new squad
*validate-squad {name}   - Validate against JSON Schema
*list-squads             - List all local squads
*analyze-squad {name}    - Analyze structure and suggestions
*extend-squad {name}     - Add new components to squad
*migrate-squad {path}    - Migrate legacy squad to AIOS 2.1
*download-squad {name}   - Download from aios-squads (Sprint 8)
*publish-squad {name}    - Publish to aios-squads (Sprint 8)
*exit                    - Exit squad-creator mode
```

---

## Squads System

### What is a Squad?

A **Squad** is a modular "expansion pack" that extends AIOS to new domains. Squads contain specialized agents, tasks, templates, and workflows for specific use cases.

### Squad Distribution Levels

| Level | Location | Description |
|-------|----------|-------------|
| **Local** | `./squads/` | Private, project-specific squads |
| **Public** | `github.com/SynkraAI/aios-squads` | Community squads (free) |
| **Marketplace** | `api.synkra.dev/squads` | Premium squads via Synkra API |

### Squad Structure

```
./squads/my-squad/
├── squad.yaml              # Manifest (required)
├── README.md               # Documentation
├── config/
│   ├── coding-standards.md
│   ├── tech-stack.md
│   └── source-tree.md
├── agents/                 # Agent definitions
├── tasks/                  # Task definitions (task-first!)
├── workflows/              # Multi-step workflows
├── checklists/             # Validation checklists
├── templates/              # Document templates
├── tools/                  # Custom tools
├── scripts/                # Utility scripts
└── data/                   # Static data
```

### Creating a Squad

**Option A: Guided Design (Recommended)**
```
1. @squad-creator
2. *design-squad --docs ./docs/prd/my-project.md
3. Review recommendations
4. *create-squad my-squad --from-design
5. *validate-squad my-squad
```

**Option B: Direct Creation**
```
1. @squad-creator
2. *create-squad my-domain-squad
3. Edit agents/tasks in generated structure
4. *validate-squad my-domain-squad
```

### Extending a Squad

```
@squad-creator
*analyze-squad my-squad           # Review structure
*extend-squad my-squad            # Add component interactively
*extend-squad my-squad --add agent --name my-agent
*validate-squad my-squad          # Validate changes
```

---

## Workflows

### What is a Workflow?

A **Workflow** is a multi-step process that can be executed by AIOS agents. Workflows define the sequence of operations, required agents, and expected outputs.

### Available Workflows

| Workflow | Type | Description |
|----------|------|-------------|
| `greenfield-fullstack.yaml` | Development | New full-stack projects |
| `greenfield-service.yaml` | Development | New service/backend projects |
| `greenfield-ui.yaml` | Development | New UI/frontend projects |
| `brownfield-fullstack.yaml` | Development | Existing full-stack projects |
| `brownfield-service.yaml` | Development | Existing service/backend |
| `brownfield-ui.yaml` | Development | Existing UI/frontend |
| `brownfield-discovery.yaml` | Development | Technical debt assessment |
| `setup-environment.yaml` | Configuration | IDE setup (Windsurf/Cursor/Claude) |

### Workflow Structure

```yaml
workflow:
  id: unique-workflow-id
  name: Human-readable name
  description: What this workflow does
  type: configuration|development|deployment
  metadata:
    elicit: true  # If user interaction required
    confirmation_required: true
  steps:
    - id: step-1
      name: Step name
      description: What this step does
      agent: '@dev'  # Which agent executes
      command: '*develop'
```

### Running Workflows

```
@aios-master
*workflow greenfield-fullstack         # Start workflow
*workflow brownfield-discovery --mode=guided
*run-workflow {name} status            # Check status
*run-workflow {name} skip              # Skip current step
*run-workflow {name} abort             # Abort workflow
```

### Workflow Modes

| Mode | Description |
|------|-------------|
| `guided` | Manual persona-switch (default) |
| `engine` | Real subagent spawning |

---

## Templates

### What is a Template?

A **Template** is a structured document format used to create consistent artifacts (PRDs, architecture docs, stories, etc.).

### Available Templates

| Template | Used By | Purpose |
|----------|---------|---------|
| `prd-tmpl.yaml` | @pm | Product Requirements Document |
| `brownfield-prd-tmpl.yaml` | @pm | PRD for existing projects |
| `architecture-tmpl.yaml` | @architect | System architecture |
| `fullstack-architecture-tmpl.yaml` | @architect | Full-stack architecture |
| `front-end-architecture-tmpl.yaml` | @architect | Frontend architecture |
| `brownfield-architecture-tmpl.yaml` | @architect | Architecture for existing projects |
| `story-tmpl.yaml` | @sm, @po | User stories |
| `project-brief-tmpl.yaml` | @analyst | Project briefs |
| `market-research-tmpl.yaml` | @analyst | Market research |
| `competitor-analysis-tmpl.yaml` | @analyst | Competitive analysis |
| `front-end-spec-tmpl.yaml` | @ux-design-expert | Frontend specification |
| `schema-design-tmpl.yaml` | @data-engineer | Database schema |
| `rls-policies-tmpl.yaml` | @data-engineer | RLS policies |
| `migration-plan-tmpl.yaml` | @data-engineer | Migration strategy |
| `agent-template.yaml` | @aios-master | New agent definition |
| `task-template.md` | @aios-master | New task file |
| `workflow-template.yaml` | @aios-master | New workflow |

### Using Templates

```
@pm
*create-prd                            # Uses prd-tmpl.yaml

@architect
*create-full-stack-architecture        # Uses fullstack-architecture-tmpl.yaml

@sm
*draft                                 # Uses story-tmpl.yaml

@aios-master
*create-doc {template}                 # Use any template
```

---

## How to Use

### 1. Activating an Agent

```
@agent-name              # Full activation with greeting
/AIOS:agents:agent-name  # Skill-based activation
```

### 2. Using Commands

All commands require `*` prefix:
```
*help                    # Show available commands
*command-name            # Execute command
*command-name {args}     # Execute with arguments
*exit                    # Exit agent mode
```

### 3. Agent Collaboration Workflow

```
User Request
    ↓
@analyst creates PRD & research
    ↓
@pm creates PRD
    ↓
@architect designs system
    ↓
@data-engineer designs database
    ↓
@ux-design-expert creates UI specs
    ↓
@sm creates detailed stories
    ↓
@dev implements story by story
    ↓
@qa validates each implementation
    ↓
@devops manages PR + release
    ↓
Production
```

### 4. Common Patterns

**Starting a New Project (Greenfield):**
```
@aios-master
*workflow greenfield-fullstack
```

**Improving Existing Project (Brownfield):**
```
@aios-master
*workflow brownfield-discovery
```

**Creating a Story:**
```
@sm
*draft
```

**Implementing a Story:**
```
@dev
*develop story-X.Y.Z
```

**Reviewing Implementation:**
```
@qa
*review story-X.Y.Z
*gate story-X.Y.Z
```

**Pushing Changes:**
```
@devops
*pre-push
*push
*create-pr
```

---

## Quick Reference

### Agent Activation Cheat Sheet

| Agent | Activation | Primary Command |
|-------|------------|-----------------|
| Orchestrator | `@aios-master` | `*workflow {name}` |
| Developer | `@dev` | `*develop {story}` |
| Architect | `@architect` | `*create-full-stack-architecture` |
| QA | `@qa` | `*review {story}` |
| DevOps | `@devops` | `*push` |
| PM | `@pm` | `*create-prd` |
| PO | `@po` | `*backlog-review` |
| SM | `@sm` | `*draft` |
| Analyst | `@analyst` | `*brainstorm {topic}` |
| Data Engineer | `@data-engineer` | `*create-schema` |
| UX Designer | `@ux-design-expert` | `*research` |
| Squad Creator | `@squad-creator` | `*create-squad {name}` |

### Universal Commands (All Agents)

```
*help         - Show all commands
*guide        - Comprehensive usage guide
*exit         - Exit agent mode
*session-info - Show session details
```

---

*Synkra AIOS v3.11.3*
*CLI First | Observability Second | UI Third*
