# AIOS Framework - Complete Documentation

> **⚠️ DEPRECATION NOTICE**
>
> This document describes **v2.0.0** of the AIOS Framework.
>
> **For the current version (v2.1), see:**
> - [AIOS-LIVRO-DE-OURO-V2.1-COMPLETE.md](./AIOS-LIVRO-DE-OURO-V2.1-COMPLETE.md) - Complete v2.1 framework guide
> - [STANDARDS-INDEX.md](./STANDARDS-INDEX.md) - Navigation for all standards
>
> **Key changes in v2.1:**
> - 4-module architecture (core, development, product, infrastructure)
> - Squad System (replaces "Expansion Packs")
> - Multi-repo strategy (3 public + 2 private repos)
> - Quality Gates 3-layer system
> - Story Template v2.0
>
> This document is retained for historical reference only.

**Version:** 2.0.0 (DEPRECATED - See v2.1)
**Status:** ⚠️ Deprecated - Reference Only
**Last Updated:** 2025-01-18
**Maintained By:** AIOS Framework Team

---

## 📋 Table of Contents

### Part I: Framework Overview
1. [What is AIOS?](#what-is-aios)
2. [Core Philosophy](#core-philosophy)
3. [Framework Architecture](#framework-architecture)
4. [Getting Started](#getting-started)

### Part II: Framework Structure
5. [Directory Structure](#directory-structure)
6. [File Organization](#file-organization)
7. [Naming Conventions](#naming-conventions)

### Part III: Agent System
8. [Agent Architecture](#agent-architecture)
9. [Agent Personalization](#agent-personalization)
10. [Agent Roles & Specializations](#agent-roles--specializations)
11. [Greeting System](#greeting-system)

### Part IV: Task & Workflow System
12. [Task Format Specification](#task-format-specification)
13. [Execution Modes](#execution-modes)
14. [Workflow Orchestration](#workflow-orchestration)
15. [Fork/Join & Organizer-Worker Patterns](#forkjoin--organizer-worker-patterns)

### Part V: Executor Types
16. [The Four Executor Types](#the-four-executor-types)
17. [Executor Decision Tree](#executor-decision-tree)

### Part VI: Standards & Best Practices
18. [Coding Standards](#coding-standards)
19. [Technology Stack](#technology-stack)
20. [Quality Gates & CodeRabbit Integration](#quality-gates--coderabbit-integration)

### Part VII: Migration & Roadmap
21. [Current Migration Status](#current-migration-status)
22. [Future Architecture (Q2 2026)](#future-architecture-q2-2026)
23. [Subdirectory Migration Plan](#subdirectory-migration-plan)

### Part VIII: Appendices
24. [Glossary](#glossary)
25. [Decision History](#decision-history)
26. [References](#references)

---

# Part I: Framework Overview

## What is AIOS?

**AIOS (AI Operating System)** is a sophisticated framework for orchestrating AI agents, workers, and humans in complex software development workflows. It provides a structured, scalable approach to building AI-assisted development teams with personality, coordination, and quality gates.

### Key Capabilities

- 🤖 **16 Specialized Agents** - Dev, QA, Architect, PM, PO, Analyst, Data Engineer, DevOps, etc.
- 📋 **60+ Executable Tasks** - Story creation, code generation, testing, deployment, documentation
- 📝 **20+ Templates** - PRDs, stories, architecture docs, test plans, database schemas
- 🔄 **Multi-Agent Workflows** - Greenfield, brownfield, fork/join, organizer-worker patterns
- 🎭 **Personalized Agent System** - Named personalities with archetypes, vocabularies, and signatures
- 🎯 **Three Execution Modes** - YOLO (autonomous), Interactive (balanced), Pre-Flight (comprehensive)
- ✅ **Quality Gates** - CodeRabbit integration, automated reviews, acceptance criteria validation

---

## Core Philosophy

### Structure is Sacred. Tone is Flexible.

AIOS follows a fundamental principle:

> "Quando as informações estão sempre nas mesmas posições, nosso cérebro sabe onde buscar rápido."

**FIXED:**
- Template positions
- Section order
- Metric formats
- File structure
- Task workflows

**FLEXIBLE:**
- Status messages
- Vocabulary choices
- Emoji usage
- Agent personality
- Communication tone

### Design Principles

1. **Familiaridade + Personalização = Produtividade**
   - Users learn structure once
   - Personality makes it memorable
   - Consistency enables speed

2. **Separation of Concerns**
   - Framework vs. Project
   - Structure vs. Tone
   - Automation vs. Human Judgment

3. **Progressive Complexity**
   - Simple by default
   - Complex when needed
   - Scalable architecture

4. **Multi-Agent Coordination**
   - Agents work together
   - Clear handoffs
   - Shared context

---

## Framework Architecture

### Dual-Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  FRAMEWORK LAYER (.aios-core/)                              │
│  ├── Agents (16 specialists)                                │
│  ├── Tasks (60+ executable workflows)                       │
│  ├── Templates (20+ document generators)                    │
│  ├── Workflows (6+ multi-agent orchestrations)              │
│  ├── Checklists (6+ validation processes)                   │
│  ├── Data (Knowledge base)                                  │
│  ├── Scripts (54+ utilities)                                │
│  └── Tools (MCP integrations)                               │
└─────────────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────────────┐
│  PROJECT LAYER (root workspace)                             │
│  ├── frontend/ (Next.js, React)                             │
│  ├── backend/ (NestJS, Supabase)                            │
│  ├── docs/ (Project documentation)                          │
│  ├── tests/ (Unit, integration, E2E)                        │
│  └── .aios/ (Session state, logs)                           │
└─────────────────────────────────────────────────────────────┘
```

**Framework Layer:** Portable across all AIOS projects  
**Project Layer:** Specific to each implementation

---

### Three-Layer Personality System

```
┌─────────────────────────────────────────────────────────────┐
│   LAYER 1: Agent Persona Config (.aios-core/agents/*.md)   │
│   - Name, archetype, zodiac                                 │
│   - Vocabulary, emoji palette                               │
│   - Greeting levels, signature                              │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│   LAYER 2: Output Formatter (.aios-core/scripts/)          │
│   - greeting-builder.js                                     │
│   - session-context-loader.js                               │
│   - project-status-loader.js                                │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│   LAYER 3: Standardized Output                              │
│   - Fixed structure + personalized tone                     │
│   - Contextual greetings                                    │
│   - Agent signatures                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (LTS)
- **Git** (version control)
- **IDE:** Cursor or VS Code with Claude extension
- **MCP Servers:** ClickUp, Context7, Exa (optional)

### Quick Start

```bash
# 1. Clone the repository
git clone <your-aios-project>
cd <project-directory>

# 2. Install dependencies
npm install

# 3. Configure AIOS
# Edit .aios-core/core-config.yaml

# 4. Activate first agent
# In IDE: type /AIOS/agents/pm

# 5. Create your first story
*create-next-story
```

### First Commands to Try

```bash
# Product Owner (Story Management)
/AIOS/agents/po
*create-next-story
*validate-story-draft docs/stories/your-story.md

# Developer (Implementation)
/AIOS/agents/dev
*develop-story docs/stories/your-story.md

# QA (Quality Assurance)
/AIOS/agents/qa
*review docs/stories/your-story.md
*code-review
```

---

# Part II: Framework Structure

## Directory Structure

### Complete Framework Structure

```
.aios-core/                              # Framework Core (Portable)
├── agents/                              # 16 agent definitions
│   ├── dev.md                           # 💻 Dex (Builder)
│   ├── qa.md                            # 🛡️ Quinn (Guardian)
│   ├── architect.md                     # 🏛️ Aria (Visionary)
│   ├── pm.md                            # 📊 Morgan (Balancer)
│   ├── po.md                            # 📋 Pax (Balancer)
│   ├── sm.md                            # 🌊 Sage (Flow Master)
│   ├── analyst.md                       # 🔍 Scout (Explorer)
│   ├── data-engineer.md                 # 🔧 Dara (Engineer)
│   ├── devops.md                        # ⚙️ Gage (Operator)
│   ├── db-sage.md                       # 🗄️ [Database Architect]
│   ├── ux-design-expert.md              # 🎨 Uma (Empathizer)
│   ├── aios-master.md                   # ⭐ Orion (Orchestrator)
│   ├── aios-developer.md                # 🛠️ [Framework Developer]
│   ├── aios-orchestrator.md             # 🎭 [Workflow Orchestrator]
│   ├── github-devops.md                 # 🐙 [Git Operations]
│   └── test-agent.md                    # 🧪 [Test Agent]
│
├── tasks/                               # 60+ executable workflows
│   ├── create-doc.md                    # Document generation
│   ├── create-next-story.md             # Story creation
│   ├── develop-story.md                 # Story implementation
│   ├── review-story.md                  # Story review
│   ├── validate-next-story.md           # Story validation
│   ├── manage-story-backlog.md          # Backlog management
│   ├── execute-checklist.md             # Checklist execution
│   ├── document-project.md              # Project documentation
│   ├── generate-tests.md                # Test generation
│   ├── nfr-assess.md                    # Non-functional requirements
│   ├── qa-gate.md                       # Quality gate decision
│   ├── code-review.md                   # Automated code review
│   ├── apply-qa-fixes.md                # QA fix application
│   ├── improve-code-quality.md          # Code quality improvements
│   ├── setup-database.md                # Database setup
│   ├── domain-modeling.md               # Domain modeling
│   ├── version-management.md            # Version management
│   ├── pre-push-quality-gate.md         # Pre-push validation
│   ├── github-pr-automation.md          # PR automation
│   ├── create-agent.md                  # Agent creation
│   ├── create-task.md                   # Task creation
│   ├── create-workflow.md               # Workflow creation
│   └── ... (40+ more)
│
├── templates/                           # 20+ document templates
│   ├── story-tmpl.yaml                  # Story template v2.0
│   ├── design-story-tmpl.yaml           # Design story template
│   ├── prd-tmpl.yaml                    # PRD template
│   ├── epic-tmpl.md                     # Epic template
│   ├── architecture-tmpl.yaml           # Architecture template
│   ├── fullstack-architecture-tmpl.yaml # Full-stack architecture
│   ├── brownfield-architecture-tmpl.yaml # Brownfield architecture
│   ├── schema-design-tmpl.yaml          # Database schema template
│   ├── project-brief-tmpl.yaml          # Project brief
│   ├── market-research-tmpl.yaml        # Market research
│   ├── competitor-analysis-tmpl.yaml    # Competitor analysis
│   ├── github-pr-template.md            # PR template
│   ├── github-actions-ci.yml            # CI/CD template
│   ├── personalized-task-template-v2.md # Task template
│   └── ... (6+ more)
│
├── workflows/                           # 6 multi-step workflows
│   ├── greenfield-fullstack.yaml        # Greenfield full-stack
│   ├── greenfield-service.yaml          # Greenfield service
│   ├── greenfield-ui.yaml               # Greenfield UI
│   ├── brownfield-fullstack.yaml        # Brownfield full-stack
│   ├── brownfield-service.yaml          # Brownfield service
│   └── brownfield-ui.yaml               # Brownfield UI
│
├── checklists/                          # 6+ validation checklists
│   ├── po-master-checklist.md           # PO validation
│   ├── story-draft-checklist.md         # Story draft validation
│   ├── story-dod-checklist.md           # Story Definition of Done
│   ├── architect-checklist.md           # Architecture review
│   ├── qa-checklist.md                  # QA validation
│   ├── pm-checklist.md                  # PM validation
│   └── change-checklist.md              # Change management
│
├── data/                                # Knowledge base
│   ├── aios-kb.md                       # AIOS knowledge base
│   ├── technical-preferences.md         # Tech stack preferences
│   ├── elicitation-methods.md           # Elicitation techniques
│   ├── brainstorming-techniques.md      # Brainstorming methods
│   ├── mode-selection-best-practices.md # Execution mode guidance
│   ├── test-levels-framework.md         # Testing strategy
│   ├── test-priorities-matrix.md        # Test prioritization
│   └── agent-config-requirements.yaml   # Agent requirements
│
├── scripts/                             # 54+ utility scripts
│   ├── agent-config-loader.js           # Agent configuration
│   ├── greeting-builder.js              # Greeting generation
│   ├── generate-greeting.js             # Greeting orchestrator
│   ├── session-context-loader.js        # Session management
│   ├── project-status-loader.js         # Project status
│   ├── config-cache.js                  # Configuration cache
│   ├── performance-tracker.js           # Performance tracking
│   ├── component-generator.js           # Component scaffolding
│   ├── elicitation-engine.js            # Interactive elicitation
│   ├── story-manager.js                 # Story lifecycle
│   ├── yaml-validator.js                # YAML validation
│   ├── usage-analytics.js               # Usage tracking
│   ├── migrate-task-to-v2.js            # Task migration
│   ├── validate-task-v2.js              # Task validation
│   └── ... (40+ more)
│
├── tools/                               # Tool integrations
│   ├── mcp/                             # MCP server configs
│   │   ├── clickup-direct.yaml
│   │   ├── context7.yaml
│   │   └── exa-direct.yaml
│   ├── cli/                             # CLI tool wrappers
│   │   ├── github-cli.yaml
│   │   └── railway-cli.yaml
│   └── local/                           # Local tools
│
├── elicitation/                         # Elicitation engines
│   ├── agent-elicitation.js
│   ├── task-elicitation.js
│   └── workflow-elicitation.js
│
├── core-config.yaml                     # Framework configuration
├── install-manifest.yaml                # Installation manifest
├── user-guide.md                        # User guide
└── working-in-the-brownfield.md         # Brownfield guide
```

---

## File Organization

### File Types & Purposes

| Type | Location | Purpose | Format |
|------|----------|---------|--------|
| **Agents** | `.aios-core/agents/*.md` | Agent definitions with persona | Markdown + YAML |
| **Tasks** | `.aios-core/tasks/*.md` | Executable workflows | Markdown + YAML |
| **Templates** | `.aios-core/templates/*.yaml` | Document generators | YAML |
| **Workflows** | `.aios-core/workflows/*.yaml` | Multi-agent orchestration | YAML |
| **Checklists** | `.aios-core/checklists/*.md` | Validation processes | Markdown + Checklist |
| **Data/KB** | `.aios-core/data/*.md` | Knowledge base, references | Markdown/YAML |
| **Scripts** | `.aios-core/scripts/*.js` | Utilities, automation | JavaScript |
| **Tools** | `.aios-core/tools/*/*.yaml` | Tool integrations | YAML |

### Framework vs. Project Files

**Framework Files (.aios-core/):**
- ✅ Portable across projects
- ✅ Version controlled in framework repo
- ✅ Shared by all AIOS projects
- ✅ Changes require framework approval

**Project Files (root/):**
- ✅ Project-specific implementation
- ✅ Version controlled in project repo
- ✅ Unique to each project
- ✅ Changes by project team

---

## Naming Conventions

### File Names

**Rule:** `kebab-case` for all files

```bash
✅ CORRECT:
- create-next-story.md
- fullstack-architecture-tmpl.yaml
- agent-config-loader.js

❌ WRONG:
- createNextStory.md
- fullstackArchitectureTmpl.yaml
- agent_config_loader.js
```

### Variable Names

**JavaScript/JSON:** `camelCase`
```javascript
✅ CORRECT:
const agentConfig = { ... }
const taskDefinition = { ... }

❌ WRONG:
const agent_config = { ... }
const task-definition = { ... }
```

**CSS:** `kebab-case`
```css
✅ CORRECT:
.content-area { }
--spacing-md: 200px;

❌ WRONG:
.contentArea { }
--spacing_md: 200px;
```

**Database:** `snake_case`
```sql
✅ CORRECT:
tasks.responsavel_type
workflow_executions.started_at

❌ WRONG:
tasks.responsavelType
workflow_executions.startedAt
```

---

# Part III: Agent System

## Agent Architecture

### Agent Definition Structure

Every agent follows this YAML structure:

```yaml
# Agent Core Identity
agent:
  name: {PersonalizedName}        # Human name (Dex, Quinn, Pax)
  id: {agent-id}                  # System identifier
  title: {Role}                   # Professional role
  icon: {emoji}                   # Visual identifier
  whenToUse: "{description}"      # When to activate this agent

# Personality Profile
persona_profile:
  archetype: {Archetype}          # Builder, Guardian, Balancer, etc.
  zodiac: {Sign}                  # ♒ Aquarius, ♍ Virgo, ♎ Libra, etc.

  communication:
    tone: {tone}                  # pragmatic | empathetic | analytical
    emoji_frequency: {level}      # high | medium | low | minimal

    vocabulary:                   # Agent-specific words (5-10)
      - {word1}
      - {word2}
      - {word3}

    greeting_levels:              # 3 personification levels
      minimal: "{icon} {id} Agent ready"
      named: "{icon} {name} ({archetype}) ready. {tagline}!"
      archetypal: "{icon} {name} the {archetype} ready to {verb}!"

    signature_closing: "{personalized_sign_off}"

# Behavioral Configuration
persona:
  role: {DetailedRole}
  style: {CommunicationStyle}
  identity: {CoreIdentity}
  focus: {PrimaryFocus}
  core_principles:
    - {principle1}
    - {principle2}
    - {principle3}

# Commands
commands:
  - name: {command-name}
    description: {description}

# Dependencies
dependencies:
  tasks:
    - {task-file}.md
  templates:
    - {template-file}.yaml
  checklists:
    - {checklist-file}.md
  data:
    - {data-file}.md
  tools:
    - {tool-name}
```

---

## Agent Personalization

### The 11 Archetypes

| Archetype | Name | Icon | Zodiac | Tone | Examples |
|-----------|------|------|--------|------|----------|
| **Builder** | Dex | 💻 | ♒ Aquarius | Pragmatic | Dev |
| **Guardian** | Quinn | 🛡️ | ♍ Virgo | Protective | QA |
| **Balancer** | Pax, Morgan | 📋 📊 | ♎ Libra | Diplomatic | PO, PM |
| **Visionary** | Aria | 🏛️ | ♐ Sagittarius | Conceptual | Architect |
| **Flow Master** | Sage | 🌊 | ♓ Pisces | Adaptive | SM |
| **Explorer** | Scout | 🔍 | ♊ Gemini | Curious | Analyst |
| **Engineer** | Dara | 🔧 | ♉ Taurus | Methodical | Data Engineer |
| **Operator** | Gage | ⚙️ | ♑ Capricorn | Efficient | DevOps |
| **Empathizer** | Uma | 🎨 | ♋ Cancer | Empathetic | UX Expert |
| **Orchestrator** | Orion | ⭐ | ♌ Leo | Commanding | AIOS Master |
| **Architect** | (Various) | 🏗️ | (Various) | Systematic | DB Sage |

### Vocabulary System

Each archetype has specific vocabulary:

**Builder (Dex):**
- construir, implementar, refatorar, resolver, otimizar
- debuggar, testar, deployar, commitar, mergear

**Guardian (Quinn):**
- validar, verificar, proteger, garantir, auditar
- revisar, inspecionar, certificar, assegurar

**Balancer (Pax, Morgan):**
- equilibrar, harmonizar, priorizar, alinhar, integrar
- negociar, mediar, sincronizar, coordenar

### Emoji Palette System

**High Frequency:**
- ✅ ❌ ⚠️ 🎯 🚀 ⭐ 💡 🔥

**Medium Frequency:**
- 📊 📋 📝 🔍 💻 🛡️ 🏛️ 🌊

**Low Frequency:**
- Agent-specific emojis only

**Minimal:**
- Status indicators only (✅ ❌ ⚠️)

---

## Agent Roles & Specializations

### Development Team

**💻 Dex (Builder) - Developer**
- **Role:** Full-stack implementation
- **Commands:** `*develop-story`, `*apply-qa-fixes`, `*improve-code-quality`
- **When to Use:** Code implementation, debugging, refactoring

**🛡️ Quinn (Guardian) - QA Engineer**
- **Role:** Quality assurance and testing
- **Commands:** `*review`, `*code-review`, `*gate`, `*nfr-assess`
- **When to Use:** Testing, quality validation, acceptance criteria

**🏛️ Aria (Visionary) - Architect**
- **Role:** System architecture and design
- **Commands:** `*create-full-stack-architecture`, `*document-project`
- **When to Use:** Architecture decisions, system design, tech stack

---

### Product & Agile Team

**📋 Pax (Balancer) - Product Owner**
- **Role:** Story management and backlog
- **Commands:** `*create-next-story`, `*validate-story-draft`, `*sync-story`
- **When to Use:** Story creation, backlog prioritization, acceptance

**📊 Morgan (Balancer) - Product Manager**
- **Role:** Product strategy and roadmap
- **Commands:** `*create-doc`, `*brownfield-create-epic`
- **When to Use:** PRDs, product strategy, stakeholder management

**🌊 Sage (Flow Master) - Scrum Master**
- **Role:** Process facilitation and flow
- **Commands:** `*execute-checklist`, `*correct-course`
- **When to Use:** Sprint planning, retrospectives, flow optimization

---

### Specialized Agents

**🔍 Scout (Explorer) - Business Analyst**
- **Role:** Requirements analysis and research
- **Commands:** `*facilitate-brainstorming-session`, `*create-deep-research-prompt`
- **When to Use:** Requirements elicitation, market research, analysis

**🔧 Dara (Engineer) - Data Engineer**
- **Role:** Data modeling and pipelines
- **Commands:** `*setup-database`, `*domain-modeling`
- **When to Use:** Database design, ETL pipelines, data architecture

**⚙️ Gage (Operator) - DevOps Engineer**
- **Role:** Deployment and operations
- **Commands:** `*version-management`, `*github-pr-automation`, `*ci-cd-configuration`
- **When to Use:** CI/CD, deployment, infrastructure, monitoring

**🎨 Uma (Empathizer) - UX Design Expert**
- **Role:** User experience and design systems
- **Commands:** `*ux-user-research`, `*ux-create-wireframe`, `*audit-codebase`
- **When to Use:** UX research, design systems, accessibility

---

### Framework Agents

**⭐ Orion (Orchestrator) - AIOS Master**
- **Role:** Framework orchestration and agent coordination
- **Commands:** `*create-agent`, `*create-task`, `*create-workflow`
- **When to Use:** Framework development, agent creation, workflow design

**🗄️ DB Sage - Database Architect**
- **Role:** Database schema design and optimization
- **When to Use:** Complex database design, query optimization

**🐙 GitHub DevOps - Git Operations**
- **Role:** Git push operations and PR management
- **When to Use:** Git push, PR creation (not available for local operations)

---

## Greeting System

### Three Greeting Levels

**1. Minimal** (Quick activation)
```
💻 dev Agent ready
```

**2. Named** (Standard, personalized)
```
💻 Dex (Builder) pronto. Vamos construir isso!
```

**3. Archetypal** (Full personality)
```
💻 Dex the Builder (♒ Aquarius) ready to implement!
```

### Contextual Greeting Components

**Complete Greeting Structure:**

```
{Archetypal Greeting}

📊 **Project Status:**
  - 🌿 **Branch:** main
  - 📝 **Modified:** file1.md, file2.js ...and 10 more
  - 📖 **Recent:** feat: complete story implementation
  - 📌 **Story:** STORY-6.1.4

💡 **Context:** {Intelligent narrative based on previous work}
   **Recommended:** Use *{command} to continue

**Quick Commands:**
   - *help: Show all available commands
   - *command1: Description
   - *command2: Description

Type *guide for comprehensive usage instructions.

— {Agent Signature}
```

### Context Intelligence

The greeting system analyzes:
- **Previous Agent:** Who was active before
- **Modified Files:** What files were changed
- **Current Story:** What story is being worked on
- **Last Commands:** What commands were recently used
- **Session Type:** New, existing, or workflow session

**Example Context:**
```
💡 **Context:** Vejo que @Dex finalizou a implementação do 
   **`greeting-builder.js`** no **`story-6.1.4.md`**. 
   Agora podemos revisar a qualidade dessa implementação
   
   **Recommended:** Use `*review story-6.1.4.md` para continuar
```

---

# Part IV: Task & Workflow System

## Task Format Specification

### Universal Task Structure (AIOS v1.0)

Every task follows this specification:

```yaml
task: {taskIdentifier()}
responsável: {AgentName}           # Agent executing (Dex, Quinn, etc.)
responsavel_type: Agente           # Agente | Worker | Humano | Clone
atomic_layer: {Layer}              # Optional for open-source

**Entrada:**
- campo: {fieldName}
  tipo: {type}                     # string | number | boolean | array | object
  origem: {source}                 # Step X | User Input | config | agent output
  obrigatório: {true|false}
  padrão: {defaultValue}           # Optional
  validação: {validationRule}      # Optional

**Saída:**
- campo: {fieldName}
  tipo: {type}
  destino: {destination}           # Step Y | state | output | multiple steps
  persistido: {true|false}         # Saved to file/DB or memory-only
  cache_key: {key}                 # Optional: if cacheable

**Checklist:**
  pre-conditions:
    - [ ] {condition}
      tipo: pre-condition
      blocker: {true|false}
      validação: {validation_logic}
  
  post-conditions:
    - [ ] {condition}
      tipo: post-condition
      blocker: {true|false}
      validação: {validation_logic}
  
  acceptance-criteria:
    - [ ] {criterion}
      tipo: acceptance
      blocker: false
      story: {STORY-XXX}

**Performance:**
- duration_expected: {X}ms
- cost_estimated: ${Y}
- cacheable: {true|false}
- parallelizable: {true|false}

**Error Handling:**
- strategy: {retry|fallback|abort}
- retry:
    max_attempts: {N}
    backoff: {linear|exponential}
```

### Task Components Explained

**Entrada (Input):**
- Defines all required and optional inputs
- Specifies data types and validation rules
- Documents default values
- Tracks data origin (previous step, user, config)

**Saída (Output):**
- Defines all outputs produced
- Specifies destination (next step, state, file)
- Indicates persistence (temporary or permanent)
- Enables caching when appropriate

**Checklist:**
- **Pre-conditions:** Validated BEFORE execution (blocking)
- **Post-conditions:** Validated AFTER execution (quality gates)
- **Acceptance Criteria:** Manual verification steps

**Performance:**
- Expected duration for tracking
- Cost estimation (for AI executors)
- Cacheability for optimization
- Parallelizability for concurrency

**Error Handling:**
- Strategy: retry, fallback, or abort
- Retry configuration with backoff
- Fallback values or alternative flows
- Notification mechanisms

---

## Execution Modes

### The Three Execution Modes

Every task supports three execution modes to balance automation, education, and control:

#### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)

**Characteristics:**
- ✅ Autonomous decision making
- ✅ All decisions logged to `.ai/decision-log-{task-id}.md`
- ✅ Minimal user interaction
- ✅ Fast execution

**Best For:**
- Experienced developers
- Simple, well-defined tasks
- Time-sensitive work
- Repetitive operations

**Example:**
```yaml
mode: yolo
```

**Decision Logging:**
```markdown
## Decision: Use TypeScript for API layer
**Context:** Need to define type-safe API contracts
**Options:** [TypeScript, JavaScript with JSDoc]
**Selected:** TypeScript
**Rationale:** Better IDE support and compile-time checks
**Timestamp:** 2025-01-18T14:30:00Z
```

---

#### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**

**Characteristics:**
- ✅ Explicit decision checkpoints
- ✅ Educational explanations
- ✅ Collaborative decision making
- ✅ Context preservation

**Best For:**
- Learning new patterns
- Complex decisions
- Collaborative work
- Code reviews

**Example:**
```yaml
mode: interactive
```

**Checkpoint Example:**
```markdown
🤔 **Decision Point:** Database Technology Selection

**Options:**
1. PostgreSQL (Relational, ACID, complex queries)
2. MongoDB (Document, flexible schema, horizontal scaling)
3. Supabase (PostgreSQL + Auth + Storage + Realtime)

**Recommendation:** Supabase (Option 3)
**Rationale:** Provides PostgreSQL + auth + storage out-of-box

**Your choice?** (1-3 or 'explain')
```

---

#### 3. Pre-Flight Planning - Comprehensive Upfront (1 questionnaire)

**Characteristics:**
- ✅ Task analysis phase (identify ambiguities)
- ✅ Comprehensive questionnaire
- ✅ Zero ambiguity execution
- ✅ Plan approval before work

**Best For:**
- Ambiguous requirements
- Critical work (production, security)
- Team consensus needed
- Large-scale changes

**Example:**
```yaml
mode: preflight
```

**Pre-Flight Questionnaire:**
```markdown
📋 **Pre-Flight Planning: Implement User Authentication**

**Identified Ambiguities:**
1. Authentication Method: Social login or email/password?
2. Session Management: JWT or session cookies?
3. Password Requirements: Complexity rules?
4. MFA Support: Required or optional?
5. User Roles: RBAC or simple user types?

**Please Answer:**
[... comprehensive questionnaire ...]

**Execution Plan:**
[... generated after questionnaire ...]

**Approve plan?** (yes/no/modify)
```

---

### Mode Selection Guidelines

| Scenario | YOLO | Interactive | Pre-Flight |
|----------|------|-------------|------------|
| **Simple CRUD** | ✅ Perfect | ⚠️ Overkill | ❌ Too much |
| **Learning new tech** | ❌ Miss details | ✅ Perfect | ⚠️ Good |
| **Security feature** | ❌ Risky | ⚠️ Good | ✅ Perfect |
| **Time pressure** | ✅ Perfect | ⚠️ Slower | ❌ Slow |
| **Team project** | ❌ Solo | ⚠️ Good | ✅ Perfect |
| **Experimental** | ✅ Perfect | ✅ Good | ❌ Overhead |

---

## Workflow Orchestration

### Workflow Types

AIOS supports multiple workflow patterns:

1. **Sequential** - Tasks execute one after another
2. **Fork/Join** - Parallel execution with synchronization
3. **Organizer-Worker** - Dynamic work distribution
4. **Conditional** - Branch based on conditions
5. **Loop** - Repeat until condition met

### Workflow Definition Format

```yaml
workflow:
  id: {workflow-id}
  name: {WorkflowName}
  version: {X.Y.Z}
  type: {sequential|fork-join|organizer-worker|conditional|loop}
  
  steps:
    - id: step-1
      task: {task-name}
      agent: {agent-id}
      dependencies: []
      condition: {optional}
      
    - id: step-2
      task: {task-name}
      agent: {agent-id}
      dependencies: [step-1]
      
    - id: step-3
      type: fork
      branches:
        - id: branch-a
          steps: [...]
        - id: branch-b
          steps: [...]
      join: step-4
      
    - id: step-4
      type: join
      merge_strategy: {combine|first|last|custom}
```

### Built-in Workflows

**Greenfield Workflows:**
- `greenfield-fullstack.yaml` - Complete full-stack project
- `greenfield-service.yaml` - Backend service only
- `greenfield-ui.yaml` - Frontend UI only

**Brownfield Workflows:**
- `brownfield-fullstack.yaml` - Add features to existing full-stack
- `brownfield-service.yaml` - Extend existing backend
- `brownfield-ui.yaml` - Enhance existing frontend

---

## Fork/Join & Organizer-Worker Patterns

### Fork/Join Pattern (Story 6.1.12)

**Purpose:** Execute tasks in parallel and synchronize results

**Use Cases:**
- Parallel test execution
- Multi-agent analysis
- Concurrent API calls
- Independent component building

**Example:**

```yaml
- id: analyze-architecture
  type: fork
  branches:
    - id: frontend-analysis
      agent: architect
      task: analyze-frontend-architecture
      
    - id: backend-analysis
      agent: architect
      task: analyze-backend-architecture
      
    - id: database-analysis
      agent: db-sage
      task: analyze-database-schema
      
  join: merge-analysis
  merge_strategy: combine_reports

- id: merge-analysis
  type: join
  task: consolidate-architecture-report
  agent: architect
```

**Merge Strategies:**
- `combine` - Combine all results
- `first` - Use first completed result
- `last` - Use last completed result
- `custom` - Custom merge function

---

### Organizer-Worker Pattern (Story 6.1.13)

**Purpose:** Intelligent work distribution across agents

**Use Cases:**
- Dynamic task distribution
- Load balancing
- Skill-based assignment
- Scalable multi-agent coordination

**Pattern Structure:**

```
┌─────────────────────────────────────┐
│   Organizer Agent                   │
│   (aios-master)                     │
│   - Receives work                   │
│   - Distributes to workers          │
│   - Collects results                │
│   - Merges outputs                  │
└─────────────────────────────────────┘
         ↓          ↓          ↓
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Worker 1 │  │ Worker 2 │  │ Worker 3 │
│ (dev)    │  │ (dev)    │  │ (qa)     │
└──────────┘  └──────────┘  └──────────┘
```

**Agent Role Extension:**

```yaml
# Organizer Agent
agent:
  id: aios-master
  role: organizer              # NEW: organizer role
  can_distribute_work: true

# Worker Agents
agent:
  id: dev
  role: worker                 # NEW: worker role (default)
  skills: [coding, testing]
```

**Distribution Strategies:**

1. **Round Robin** - Distribute evenly
```yaml
distribution_strategy: round_robin
```

2. **Load Balanced** - Consider current workload
```yaml
distribution_strategy: load_balanced
max_concurrent_tasks: 3
```

3. **Skill Based** - Match skills to requirements
```yaml
distribution_strategy: skill_based
required_skills: [coding, frontend]
```

**Example Workflow:**

```yaml
- id: implement-features
  type: organizer-worker
  organizer: aios-master
  workers: [dev-1, dev-2, dev-3]
  distribution_strategy: skill_based
  
  work_items:
    - feature: user-authentication
      required_skills: [backend, security]
    - feature: dashboard-ui
      required_skills: [frontend, react]
    - feature: data-pipeline
      required_skills: [data, etl]
  
  merge_strategy: combine
  failure_strategy: reassign
```

---

# Part V: Executor Types

## The Four Executor Types

### 1. Agente (AI-Powered Execution)

**Definition:** AI agent using Large Language Models for creative/analytical tasks

**When to Use:**
- ✅ Requires creativity or subjective judgment
- ✅ Natural language understanding/generation
- ✅ Contextual analysis
- ✅ No deterministic algorithm

**Examples:**
- Analyze requirements and extract insights
- Generate code from specifications
- Design system architecture
- Review code for quality
- Create documentation

**Characteristics:**
- **Cost:** $$$$ High ($0.001 - $0.01 per execution)
- **Speed:** Slow (3-10 seconds)
- **Deterministic:** ❌ No (stochastic outputs)

---

### 2. Worker (Script-Based Execution)

**Definition:** Deterministic script/function with predefined logic

**When to Use:**
- ✅ Deterministic (same input → same output)
- ✅ Data transformation or validation
- ✅ File/database operations
- ✅ External API calls (no AI)

**Examples:**
- Load configuration from JSON
- Validate HTML structure
- Export PNG from HTML
- Calculate metrics
- Run migrations

**Characteristics:**
- **Cost:** $ Low ($0 - $0.001 per execution)
- **Speed:** Fast (< 1 second)
- **Deterministic:** ✅ Yes (repeatable)

---

### 3. Humano (Manual Human Execution)

**Definition:** Human operator for subjective judgment or approval

**When to Use:**
- ✅ Requires human subjective judgment
- ✅ Quality gate or approval step
- ✅ Sensitive decisions
- ✅ Cannot be automated (yet)

**Examples:**
- Review and approve/reject work
- Make strategic decisions
- Handle edge cases
- Provide creative direction
- Security review

**Characteristics:**
- **Cost:** $$$ Medium ($5 - $50 per execution)
- **Speed:** Very Slow (minutes to hours)
- **Deterministic:** ❌ No (subjective)

---

### 4. Clone (Mind Emulation with Heuristics)

**Definition:** AI agent with personality heuristics and domain axioms

**When to Use:**
- ✅ Requires specific domain expertise
- ✅ Must follow specific methodology
- ✅ Needs validation against established principles
- ✅ Benefits from "personality-driven" execution

**Examples:**
- Validate components (Atomic Design - Brad Frost)
- Review copy (Alex Hormozi methodology)
- Evaluate design consistency
- Apply mental models

**Characteristics:**
- **Cost:** $$$$ High ($0.002 - $0.015 per execution)
- **Speed:** Slow (5-15 seconds)
- **Deterministic:** ⚠️ Partial (heuristics guide AI)

---

## Executor Decision Tree

### Decision Flow

```
Task to Execute
    ↓
Requires Creativity/Subjectivity?
    ├─ NO → Deterministic Algorithm Exists?
    │           ├─ YES → Worker (script)
    │           └─ NO → Requires Human Judgment?
    │                       ├─ YES → Critical Decision?
    │                       │           ├─ YES → Humano
    │                       │           └─ NO → Specific Methodology?
    │                       │                       ├─ YES → Clone
    │                       │                       └─ NO → Agente
    │                       └─ NO → Agente
    └─ YES → Requires Human Judgment?
                ├─ YES → Critical Decision?
                │           ├─ YES → Humano
                │           └─ NO → Specific Methodology?
                │                       ├─ YES → Clone
                │                       └─ NO → Agente
                └─ NO → Specific Methodology?
                            ├─ YES → Clone
                            └─ NO → Agente
```

### Decision Criteria

| Criterion | Worker | Agente | Humano | Clone |
|-----------|--------|--------|--------|-------|
| **Creativity Required** | ❌ | ✅ | ✅ | ✅ |
| **Deterministic** | ✅ | ❌ | ❌ | ⚠️ |
| **Cost** | $ | $$$$ | $$$ | $$$$ |
| **Speed** | Fast | Slow | Very Slow | Slow |
| **Human Judgment** | ❌ | ❌ | ✅ | ❌ |
| **Methodology** | ❌ | ❌ | ⚠️ | ✅ |

---

# Part VI: Standards & Best Practices

## Coding Standards

### JavaScript/TypeScript Standards

**Naming Conventions:**
- `camelCase` for variables, functions, methods
- `PascalCase` for classes, components, interfaces
- `UPPER_CASE` for constants
- `kebab-case` for file names

**Code Structure:**
```javascript
// ✅ GOOD
const userProfile = {
  firstName: 'John',
  lastName: 'Doe',
  isActive: true
};

// ❌ BAD
const user_profile = {
  first_name: 'John',
  last_name: 'Doe',
  is_active: true
};
```

**Function Design:**
- Keep functions small (<50 lines)
- Single responsibility
- Pure functions when possible
- Document with JSDoc

**Error Handling:**
```javascript
// ✅ GOOD
try {
  const result = await operation();
  return { success: true, data: result };
} catch (error) {
  logger.error('Operation failed:', error);
  return { success: false, error: error.message };
}

// ❌ BAD
const result = await operation(); // No error handling
```

---

### CSS Standards

**Naming Convention:** `kebab-case`

```css
/* ✅ GOOD */
.content-area {
  padding: var(--spacing-md);
}

--spacing-md: 200px;
--color-primary: #007bff;

/* ❌ BAD */
.contentArea {
  padding: var(--spacing_md);
}
```

**CSS Organization:**
1. Layout properties
2. Box model properties
3. Visual properties
4. Typography
5. Misc

---

### Database Standards

**Naming Convention:** `snake_case`

```sql
-- ✅ GOOD
CREATE TABLE workflow_executions (
  execution_id UUID PRIMARY KEY,
  workflow_id UUID NOT NULL,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  status VARCHAR(20)
);

-- ❌ BAD
CREATE TABLE workflowExecutions (
  executionId UUID PRIMARY KEY,
  workflowId UUID NOT NULL,
  startedAt TIMESTAMP
);
```

---

## Technology Stack

### Frontend Stack

**Core:**
- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3

**State Management:**
- **Global:** Zustand or React Context
- **Server:** React Server Components
- **Forms:** React Hook Form + Zod

**UI Components:**
- **Library:** shadcn/ui (Radix UI)
- **Icons:** Lucide React
- **Animations:** Framer Motion

---

### Backend Stack

**Core:**
- **Framework:** NestJS
- **Language:** TypeScript 5
- **Runtime:** Node.js 18+ (LTS)

**Database:**
- **Primary:** Supabase (PostgreSQL)
- **ORM:** Prisma or TypeORM
- **Migrations:** Prisma Migrate

**Authentication:**
- **Provider:** Supabase Auth
- **Strategy:** JWT + Row Level Security (RLS)

**API:**
- **Type:** REST + tRPC (type-safe)
- **Validation:** Zod
- **Documentation:** OpenAPI/Swagger

---

### DevOps & Infrastructure

**Version Control:**
- **Platform:** GitHub
- **Workflow:** Feature branches + PRs
- **CI/CD:** GitHub Actions

**Deployment:**
- **Platform:** Railway (recommended) or Vercel
- **Strategy:** Zero-downtime deployment
- **Environments:** dev, staging, production

**Monitoring:**
- **Logs:** Structured logging (Winston/Pino)
- **Metrics:** Custom dashboards
- **Errors:** Error tracking service

---

## Quality Gates & CodeRabbit Integration

### CodeRabbit Quality Gates

AIOS uses **CodeRabbit** for automated code review at three key checkpoints:

#### 1. Pre-Commit Gate (@dev)

**When:** Before committing code  
**Command:** `*code-review uncommitted`

**Focus:**
- Syntax errors
- Basic code quality
- Linting violations
- Obvious bugs

**Action:** Fix CRITICAL issues before committing

---

#### 2. Mid-Point Review (@dev + @qa)

**When:** During story implementation  
**Command:** `*code-review --base main`

**Focus:**
- Architecture patterns
- Error handling
- Performance issues
- Integration points

**Action:** Address HIGH and CRITICAL issues

---

#### 3. Pre-PR Gate (@dev + @qa)

**When:** Before creating PR  
**Command:** `*code-review --base main --full`

**Focus:**
- Complete code quality
- Test coverage
- Documentation
- Backward compatibility
- Security vulnerabilities

**Action:** Resolve ALL CRITICAL, address HIGH issues

---

### Severity Levels

| Severity | Action | Examples |
|----------|--------|----------|
| **CRITICAL** | ❌ Block | Security vulnerabilities, data loss risks |
| **HIGH** | ⚠️ Fix before PR | Performance issues, error handling gaps |
| **MEDIUM** | 📋 Document as debt | Code maintainability, design patterns |
| **LOW** | ℹ️ Optional | Style inconsistencies, minor optimizations |

---

### Story-Specific Integration

Each story includes CodeRabbit integration:

```yaml
# CodeRabbit Integration
story_type: [Feature|Bug|Refactor|Architecture]
specialized_agents: [@dev, @qa, @architect]

quality_gates:
  pre_commit: Focus on syntax and basic quality
  mid_point: Focus on architecture and integration
  pre_pr: Comprehensive review before merge

focus_areas:
  - Error Handling: Check all error paths
  - Performance: Validate response times
  - Security: Check for vulnerabilities
  - Integration: Validate API contracts
```

---

# Part VII: Migration & Roadmap

## Current Migration Status

### Epic 6.1: Agent Identity System (In Progress)

**Objective:** Modernize agent system with personality, unified greeting, and improved structure

**Waves:**

**Wave 1 - Foundation (In Progress):**
- ✅ Story 6.1.1: Agent Personalization Implementation
- ✅ Story 6.1.2: Persona Profile Integration
- ✅ Story 6.1.3: Greeting Levels Implementation
- ✅ Story 6.1.4: Unified Greeting System Integration
- ⏸️ Story 6.1.4.1: Fix Remaining Agent YAML Issues (Approved)
- ✅ Story 6.1.5: Output Formatter Implementation
- ✅ Story 6.1.6: Output Formatter Testing
- ✅ Story 6.1.7: Core Tasks Migration
- ✅ Story 6.1.8: Templates Migration
- ✅ Story 6.1.9: Checklists Migration
- 📋 Story 6.1.10: Dependencies & Data Files Migration (Ready)
- 📋 Story 6.1.11: AIOS-Master Tasks Creation (Ready)
- 📋 Story 6.1.12: Fork/Join Workflow Operations (Ready)
- 📋 Story 6.1.13: Organizer-Worker Pattern (Ready)

**Wave 2 - Enhancement (Pending):**
- ❌ Story 6.1.14: Expansion Pack Framework (REJECTED - Architecture conflict)
- ❌ Story 6.1.14.1-3: Expansion Pack Extraction (REJECTED - Architecture conflict)
- 📋 Story 6.1.15: Subdirectory Architecture Validation (PROPOSED)
- 📋 Story 6.1.16-21: Subdirectory Migration (PROPOSED - if 6.1.15 succeeds)

---

## Future Architecture (Q2 2026)

### Repository Restructuring (Decision 005)

**Current State:**
```
@synkra/aios-core/
├── .aios-core/              # Framework embedded in project
├── frontend/
├── backend/
└── docs/
```

**Future State (Q2 2026):**
```
aios/
├── aios-core/               # Framework repository (standalone)
│   ├── agents/
│   ├── tasks/
│   ├── templates/
│   └── ...
│
└── @synkra/aios-core/          # Project repository
    ├── frontend/
    ├── backend/
    └── .aios/               # Framework reference (git submodule)
```

**Benefits:**
- ✅ Framework versioning independent of project
- ✅ Easier framework updates
- ✅ Cleaner project structure
- ✅ Multiple projects share same framework

**Migration Timeline:**
- **Q1 2026:** Prepare for separation
- **Q2 2026:** Execute repository split
- **Q3 2026:** Complete migration

---

## Subdirectory Migration Plan

### The Challenge (Story 6.1.15+)

**Current Structure:** Flat files in `.aios-core/{type}/`
```
.aios-core/
├── tasks/
│   ├── create-doc.md
│   ├── develop-story.md
│   ├── generate-tests.md
│   └── ... (60+ files)
```

**Proposed Structure:** Organized subdirectories
```
.aios-core/
├── tasks/
│   ├── documentation/
│   │   ├── create-doc.md
│   │   └── document-project.md
│   ├── development/
│   │   ├── develop-story.md
│   │   └── apply-qa-fixes.md
│   └── testing/
│       ├── generate-tests.md
│       └── nfr-assess.md
```

---

### Migration Phases

**Phase 0: Validation (Story 6.1.15)**
- Duration: 2-3 days
- Investment: $100-150
- Goal: Test subdirectory architecture works
- Deliverable: GO/NO-GO decision

**Phase 1: Core Infrastructure (Story 6.1.16)**
- Duration: 1.5 days
- Investment: $75
- Goal: Update file resolution logic
- Deliverable: Scripts support subdirectories

**Phase 2: File Migration (Stories 6.1.17-19)**
- Duration: 10-15 days
- Investment: $500-750
- Goal: Move files to subdirectories
- Deliverable: Organized framework structure

**Phase 3: Reference Updates (Story 6.1.20)**
- Duration: 1 day
- Investment: $50
- Goal: Update all agent references
- Deliverable: All references correct

**Phase 4: Cleanup (Story 6.1.21)**
- Duration: 0.5 day
- Investment: $25
- Goal: Remove backward compatibility
- Deliverable: Optimized system

**Total Effort:** 15-21 days, $750-1,050

---

### Proposed Subdirectory Organization

**data/ subdirectories:**
```
data/
├── agile/                   # Agile/Scrum knowledge
├── architecture/            # Architecture patterns
├── design-systems/          # UX/Design frameworks
├── database/                # Database knowledge
├── infrastructure/          # DevOps/Infrastructure
├── quality/                 # Testing/QA knowledge
└── technical/               # Technical standards
```

**tasks/ subdirectories:**
```
tasks/
├── agile/                   # Story management
├── architecture/            # Architecture tasks
├── database/                # Database tasks
├── data-engineering/        # Data engineering
├── development/             # Development tasks
├── devops/                  # DevOps tasks
├── documentation/           # Documentation tasks
├── quality/                 # QA tasks
├── research/                # Research/Analysis
├── ux-design/               # UX/Design tasks
└── framework/               # Framework management
```

**templates/ subdirectories:**
```
templates/
├── agile/                   # Story, epic templates
├── architecture/            # Architecture templates
├── database/                # Database templates
├── infrastructure/          # Infrastructure templates
├── product/                 # PRD, brief templates
└── ux-design/               # Design templates
```

---

### Risk Mitigation

**Risks:**
1. ❌ Breaking agent loading
2. ❌ Performance degradation
3. ❌ Incomplete migration
4. ❌ Script path resolution failures

**Mitigations:**
1. ✅ Test in isolated environment first (Phase 0)
2. ✅ Benchmark performance during validation
3. ✅ Automated migration scripts + validation
4. ✅ Comprehensive script audit (Phase 1)
5. ✅ Backward compatibility during migration
6. ✅ Git-based rollback strategy

---

# Part VIII: Appendices

## Glossary

### Core Concepts

**AIOS:** AI Operating System - Framework for orchestrating AI agents and workflows

**Agent:** AI-powered executor with personality, specialized role, and commands

**Task:** Executable workflow with inputs, outputs, validation, and error handling

**Workflow:** Multi-step orchestration coordinating multiple agents/tasks

**Executor:** Entity that executes tasks (Agente, Worker, Humano, Clone)

**Archetype:** Personality template (Builder, Guardian, Balancer, etc.)

**Persona Profile:** Agent personality configuration (communication, vocabulary, greetings)

**Greeting System:** Contextual agent activation with status, context, and commands

**Quality Gate:** Validation checkpoint using CodeRabbit or manual review

**Fork/Join:** Parallel execution pattern with synchronization

**Organizer-Worker:** Dynamic work distribution pattern

**Execution Mode:** YOLO (autonomous), Interactive (balanced), Pre-Flight (comprehensive)

---

### File Types

**Agent Definition (.md):** Agent personality, role, commands, dependencies

**Task Definition (.md):** Executable workflow with YAML specification

**Template (.yaml/.md):** Document generator with variables and structure

**Workflow (.yaml):** Multi-agent orchestration definition

**Checklist (.md):** Validation process with checkboxes

**Data/KB (.md/.yaml):** Knowledge base, reference material

**Script (.js):** Utility, automation, or tool

**Config (.yaml):** Configuration file

---

### Patterns

**MCP (Model Context Protocol):** Integration protocol for external tools

**RLS (Row Level Security):** Database security at row level

**RBAC (Role-Based Access Control):** Permission system

**JWT (JSON Web Token):** Authentication token standard

**ETL (Extract, Transform, Load):** Data pipeline pattern

**CRUD (Create, Read, Update, Delete):** Basic operations

**CI/CD (Continuous Integration/Deployment):** Automation pipeline

**PRD (Product Requirements Document):** Product specification

**NFR (Non-Functional Requirements):** Quality attributes

---

## Decision History

### Major Architectural Decisions

**Decision 001:** Agent Personalization Standard (2025-01-14)
- **Status:** Implemented
- **Decision:** Three-layer personality system (persona → formatter → output)
- **Rationale:** Familiaridade + Personalização = Produtividade

**Decision 002:** Unified Greeting System (2025-01-16)
- **Status:** Implemented
- **Decision:** Single greeting generator for all agents
- **Rationale:** Consistency, performance, maintainability

**Decision 003:** Task Format v2.0 (2025-11-13)
- **Status:** Implemented
- **Decision:** Universal task specification with execution modes
- **Rationale:** Scalability, reusability, clarity

**Decision 004:** Open Source vs Service (2025-01-14)
- **Status:** Defined
- **Decision:** Open-source = Agente-only, Service = All executors
- **Rationale:** Community vs commercial differentiation

**Decision 005:** Repository Restructuring (2025-01-15)
- **Status:** Planned (Q2 2026)
- **Decision:** Split framework and project repositories
- **Rationale:** Independent versioning, cleaner structure

**Decision 006:** Subdirectory Migration (2025-01-18)
- **Status:** Approved (Pending validation)
- **Decision:** Organize framework files in domain subdirectories
- **Rationale:** Scalability, better organization, expansion packs support

**Decision 007:** Expansion Pack Architecture (2025-01-18)
- **Status:** REJECTED (Conflict with AIOS principles)
- **Decision:** NO new directory types (methodologies/, patterns/)
- **Rationale:** Violates 7-type framework structure
- **Alternative:** Use subdirectories in existing types (data/, tasks/, templates/)

---

## References

### Internal Documentation

- **Framework Structure:** `docs/architecture/source-tree.md`
- **Coding Standards:** `docs/framework/coding-standards.md`
- **Technology Stack:** `docs/framework/tech-stack.md`
- **Agent Standard:** `.aios-core/docs/standards/AGENT-PERSONALIZATION-STANDARD-V1.md`
- **Task Format:** `.aios-core/docs/standards/TASK-FORMAT-SPECIFICATION-V1.md`
- **Executor Tree:** `.aios-core/docs/standards/EXECUTOR-DECISION-TREE.md`
- **Architectural Decisions:** `.aios-core/docs/standards/V3-ARCHITECTURAL-DECISIONS.md`
- **Repository Restructuring:** `docs/decisions/decision-005-repository-restructuring-FINAL.md`

### Implementation Stories

- **Story 6.1.4:** Unified Greeting System Integration
- **Story 6.1.10:** Dependencies & Data Files Migration
- **Story 6.1.11:** AIOS-Master Tasks Creation
- **Story 6.1.12:** Fork/Join Workflow Operations
- **Story 6.1.13:** Organizer-Worker Pattern Implementation

### External Resources

- **Atomic Design:** Brad Frost's methodology
- **Twelve-Factor App:** Methodology for SaaS applications
- **MCP Protocol:** Model Context Protocol specification
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **NestJS Docs:** https://docs.nestjs.com

---

## Contributing

### How to Contribute

1. **Read this document** - Understand AIOS principles
2. **Choose an area** - Framework, agents, tasks, workflows
3. **Follow standards** - Coding standards, naming conventions
4. **Test thoroughly** - Unit tests, integration tests
5. **Document changes** - Update relevant docs
6. **Submit PR** - Follow PR template

### PR Template

```markdown
## Story Reference
[Story 6.1.X] {Story Title}

## Changes
- [ ] Agent definitions updated
- [ ] Task files created/modified
- [ ] Templates added/changed
- [ ] Tests added
- [ ] Documentation updated

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing complete

## CodeRabbit Review
- [ ] Pre-commit review passed
- [ ] All CRITICAL issues resolved
- [ ] HIGH issues addressed or documented

## Checklist
- [ ] Follows coding standards
- [ ] Naming conventions correct
- [ ] No breaking changes (or documented)
- [ ] Backward compatible
```

---

## Support & Contact

### Getting Help

1. **Documentation First:** Check this master document
2. **Framework Docs:** Review specific docs in `docs/framework/`
3. **Decision History:** Check `docs/decisions/`
4. **Story Context:** Review implementation stories

### Framework Team

- **Architect:** Aria (@architect)
- **Lead Developer:** Dex (@dev)
- **Quality Lead:** Quinn (@qa)
- **Product Owner:** Pax (@po)

---

**Document Version:** 2.0.0  
**Last Updated:** 2025-01-18  
**Maintained By:** AIOS Framework Team  
**Status:** Living Document

---

*This document consolidates all AIOS framework documentation into a single, comprehensive reference. It is a living document and will be updated as the framework evolves.*

— Aria, arquitetando o futuro 🏗️

