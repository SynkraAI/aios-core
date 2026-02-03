# Synkra AIOS - Project Overview

> AI-Orchestrated System for Full Stack Development

---

## Repository Status

| Status | Details |
|--------|---------|
| **Upstream** | https://github.com/SynkraAI/aios-core |
| **Fork** | https://github.com/RBKunnela/aios-core |
| **Commits behind** | 0 (fully synced) |
| **Commits ahead** | 5 |

### Extra commits in fork:
```
8e3b73c fix(ci): Add write permissions to sync workflow
b48a906 Merge branch 'SynkraAI:main' into main
a318da0 feat(ci): Add daily upstream sync workflow
e8b025d fix(tests): Resolve failing integration and unit tests
c8bdba1 feat(trust): Add trust enforcement system
```

The daily sync workflow (`a318da0`) automatically keeps the fork updated with the original repository.

---

## What is Synkra AIOS?

Synkra AIOS is a **sophisticated multi-agent AI framework** designed to enable autonomous, team-based AI development. It's a foundation for building complex workflows where specialized AI agents collaborate with humans to plan, develop, test, and deploy software across any domain.

**Key Details:**
- **Version:** 3.11.3
- **License:** MIT
- **Platform:** Node.js 18+, cross-platform (Windows, macOS, Linux)
- **Languages:** JavaScript/TypeScript with documentation in Portuguese, English, and Spanish

---

## Core Philosophy: CLI First

The project follows an **inviolable three-tier hierarchy**:

```
CLI (Maximum) → Observability (Secondary) → UI (Tertiary)
```

### What This Means:
1. **CLI is the source of truth** - Dashboards only observe, never control
2. **New features must work 100% via CLI** before having any UI
3. **UI should never be required** for system operation
4. **Observability serves to understand** what the CLI is doing, not to control it

---

## Constitution

The AIOS has a **formal Constitution** with non-negotiable principles and automatic gates.

| Article | Principle | Severity |
|---------|-----------|----------|
| I | CLI First | NON-NEGOTIABLE |
| II | Agent Authority | NON-NEGOTIABLE |
| III | Story-Driven Development | MUST |
| IV | No Invention | MUST |
| V | Quality First | MUST |
| VI | Absolute Imports | SHOULD |

**Full document:** `.aios-core/constitution.md`

---

## 12 Specialized AI Agents

Each agent has a distinct persona and exclusive authorities:

| Agent | Persona | Primary Scope |
|-------|---------|---------------|
| `@aios-master` | - | Framework orchestrator |
| `@dev` | Dex | Code implementation |
| `@qa` | Quinn | Testing and quality |
| `@architect` | Aria | Architecture and technical design |
| `@pm` | Morgan | Product Management |
| `@po` | Pax | Product Owner, stories/epics |
| `@sm` | River | Scrum Master |
| `@analyst` | Alex | Research and analysis |
| `@data-engineer` | Dara | Database design |
| `@ux-design-expert` | Uma | UX/UI design |
| `@devops` | Gage | CI/CD, git push (EXCLUSIVE) |
| `@squad-creator` | - | Custom agent & squad creation |

### Agent Activation
Use `@agent-name` or `/AIOS:agents:agent-name` to activate an agent.

### Agent Commands
Use `*` prefix for commands:
- `*help` - Show available commands
- `*create-story` - Create development story
- `*task {name}` - Execute specific task
- `*exit` - Exit agent mode

---

## Project Structure

```
aios-core/
├── .aios-core/              # Core framework
│   ├── core/                # Main modules (orchestration, memory, etc.)
│   │   ├── config/          # Configuration management
│   │   ├── orchestration/   # Workflow orchestration
│   │   ├── execution/       # Code execution engine
│   │   ├── memory/          # Persistent memory layer
│   │   ├── quality-gates/   # Multi-layer validation
│   │   ├── permissions/     # Agent authority management
│   │   ├── elicitation/     # Interactive prompting
│   │   ├── session/         # Session context
│   │   ├── mcp/             # Model Context Protocol
│   │   └── health-check/    # System diagnostics
│   ├── development/         # Agents, tasks, templates, checklists
│   │   ├── agents/          # 12 AI agent definitions
│   │   ├── tasks/           # 115+ task definitions
│   │   ├── templates/       # Document templates (PRD, architecture)
│   │   ├── checklists/      # QA checklists
│   │   └── workflows/       # 7 workflow definitions
│   └── scripts/             # Utilities and scripts
├── apps/
│   ├── dashboard/           # Next.js Dashboard (Observability + UI)
│   └── monitor-server/      # Server-side monitoring
├── bin/                     # CLI executables
│   ├── aios.js              # Primary CLI
│   ├── aios-init.js         # Legacy installer wizard
│   └── aios-minimal.js      # Minimal mode installer
├── src/                     # Source code
├── docs/                    # Documentation
│   ├── stories/             # Development stories (active/, completed/)
│   ├── architecture/        # Architecture docs
│   ├── pt/                  # Portuguese docs
│   └── es/                  # Spanish docs
├── squads/                  # Expansion packs
├── packages/                # Shared packages
│   ├── installer/           # Modern interactive setup
│   └── gemini-aios-extension/ # Google Gemini integration
└── tests/                   # Tests
```

---

## Development Workflow

### Two-Phase Approach

#### Phase 1: Planning (Web UI)
- Specialized agents (analyst, pm, architect, ux-expert) collaborate
- Creates detailed PRD + Architecture documents
- Addresses "inconsistency in planning" problem

#### Phase 2: Development (IDE)
- Scrum Master (`@sm`) creates hyper-detailed stories
- Developer (`@dev`) implements with full context
- QA (`@qa`) validates
- DevOps (`@devops`) manages CI/CD
- Addresses "context loss" problem

### Story-Driven Development

1. **Work from stories** - All development starts with a story in `docs/stories/`
2. **Update progress** - Mark checkboxes as completed: `[ ]` → `[x]`
3. **Track changes** - Maintain the File List section in the story
4. **Follow criteria** - Implement exactly what acceptance criteria specify

### Full Workflow
```
User Request
    ↓
@analyst creates PRD & research
    ↓
@architect designs system
    ↓
@pm refines spec
    ↓
@qa critiques design
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

---

## Quality Gates

### Multi-Layer Validation
- **Pre-commit:** ESLint, TypeScript
- **Pre-push:** Story validation
- **CI/CD:** Full test suite, code coverage

### Test Commands
```bash
npm test                    # Run tests
npm run test:coverage       # Tests with coverage
npm run lint                # ESLint
npm run typecheck           # TypeScript
```

---

## Installation & Commands

### AIOS CLI
```bash
npx aios-core init my-project   # Initialize new project
npx aios-core install           # Install AIOS
npx aios-core doctor            # System diagnostics
npx aios-core info              # System information
```

### Development
```bash
npm run dev                 # Start development
npm test                    # Run tests
npm run lint                # Check style
npm run typecheck           # Check types
npm run build               # Production build
```

### Dashboard
```bash
cd apps/dashboard
npm install
npm run dev                 # Development
npm run build               # Production build
```

---

## Key Innovations

1. **Agentic Planning** - Multiple specialized agents collaborate on PRD/architecture before development
2. **Contextual Story Creation** - Stories pre-load with complete architectural context
3. **Two-Layered System** - Planning (web) + Development (IDE) separation
4. **Constitution System** - Formal principles with automated gates
5. **Agent Authority Enforcement** - Exclusive capabilities per agent
6. **Multi-Layer Quality Gates** - Defense-in-depth validation
7. **Expansion Packs (Squads)** - Domain-specific agent teams
8. **IDE Integration** - Windsurf, Cursor, Claude Code native support

---

## Tech Stack

### Production Dependencies
- `@clack/prompts` - Modern CLI prompts
- `commander` - CLI framework
- `execa` - Process execution
- `chalk` - Terminal colors
- `fs-extra` - Enhanced file operations
- `js-yaml` - YAML parsing
- `inquirer` - Interactive CLI
- `glob` - File pattern matching
- `handlebars` - Template engine

### Development
- Jest (testing)
- TypeScript (type checking)
- ESLint (linting)
- Semantic Release (versioning)
- Husky (git hooks)

### Dashboard (apps/dashboard/)
- Next.js 16
- React 19
- Zustand (state management)
- Tailwind CSS
- Real-time monitoring via SSE

---

## Git Conventions

### Commits
Follow Conventional Commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `test:` - Tests
- `chore:` - Maintenance
- `refactor:` - Refactoring

**Reference story ID:** `feat: implement feature [Story 2.1]`

### Branches
- `main` - Main branch
- `feat/*` - Features
- `fix/*` - Fixes
- `docs/*` - Documentation

### Push Authority
**Only `@devops` can push to remote.**

---

## Project Statistics

- **12 Agent Definitions** (markdown files)
- **115+ Task Definitions** (workflow guides)
- **20+ Core Modules** (config, execution, memory, etc.)
- **7 Workflow Templates** (greenfield/brownfield variants)
- **100+ Documentation Pages** (multilingual)
- **25+ Test Suites** (core, integration, health-check)

---

*Synkra AIOS v3.11.3*
*CLI First | Observability Second | UI Third*
