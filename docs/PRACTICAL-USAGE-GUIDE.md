# AIOS Practical Usage Guide

Complete guide on how to effectively use agents, handoffs, commands, and workflows.

---

## Table of Contents

1. [When to Use Each Agent](#1-when-to-use-each-agent)
2. [The Master Orchestrator](#2-the-master-orchestrator)
3. [Agent Handoffs - How They Work](#3-agent-handoffs---how-they-work)
4. [Do Agents Step on Each Other's Toes?](#4-do-agents-step-on-each-others-toes)
5. [Using Existing Commands](#5-using-existing-commands)
6. [Using Existing Workflows](#6-using-existing-workflows)
7. [Creating New Commands (Tasks)](#7-creating-new-commands-tasks)
8. [Creating New Workflows](#8-creating-new-workflows)
9. [Best Practices](#9-best-practices)
10. [Common Scenarios](#10-common-scenarios)

---

## 1. When to Use Each Agent

### Decision Tree

```
What do you need to do?
│
├─ Research/Analysis?
│   └─ @analyst (Atlas) - Market research, competitive analysis, brainstorming
│
├─ Product Planning?
│   ├─ Create PRD/Epic? → @pm (Morgan)
│   ├─ Manage Backlog? → @po (Pax)
│   └─ Create Story? → @sm (River)
│
├─ Technical Design?
│   ├─ System Architecture? → @architect (Aria)
│   ├─ Database Design? → @data-engineer (Dara)
│   └─ UX/UI Design? → @ux-design-expert (Uma)
│
├─ Implementation?
│   └─ @dev (Dex) - Write code, fix bugs, implement features
│
├─ Quality?
│   └─ @qa (Quinn) - Review code, quality gates, test design
│
├─ Git/CI/CD?
│   └─ @devops (Gage) - Push, PRs, releases, CI/CD
│
├─ Framework Development?
│   └─ @aios-master (Orion) - Create agents, tasks, workflows
│
└─ Create Squads?
    └─ @squad-creator (Craft) - Design and build expansion packs
```

### Agent Selection Quick Reference

| I want to... | Use Agent |
|--------------|-----------|
| Research market/competitors | `@analyst` |
| Write a PRD | `@pm` |
| Create an epic | `@pm` |
| Create a user story | `@sm` |
| Manage backlog/priorities | `@po` |
| Design system architecture | `@architect` |
| Design database schema | `@data-engineer` |
| Design UI/UX | `@ux-design-expert` |
| Implement a story | `@dev` |
| Review code quality | `@qa` |
| Push code to GitHub | `@devops` |
| Create a new agent | `@aios-master` |
| Create a new workflow | `@aios-master` |
| Create a squad | `@squad-creator` |
| Run any task directly | `@aios-master` |

---

## 2. The Master Orchestrator

### What is @aios-master?

`@aios-master` (Orion) is the **universal orchestrator** that can:

1. **Execute any task** from any agent directly
2. **Create framework components** (agents, tasks, workflows)
3. **Modify existing components**
4. **Orchestrate complex multi-agent workflows**
5. **Access the AIOS Knowledge Base** (`*kb` command)

### When to Use @aios-master

| Use @aios-master When | Use Specialized Agent When |
|----------------------|---------------------------|
| Creating new agents, tasks, workflows | Routine development work |
| Running cross-agent tasks | Task fits one agent's domain |
| Framework modifications | Normal project work |
| Workflow orchestration | Single-domain operations |
| Need KB access (`*kb`) | Standard commands suffice |
| Debugging agent issues | Everything is working |

### @aios-master Key Commands

```bash
# Framework Development
*create agent {name}        # Create new agent
*create task {name}         # Create new task
*create workflow {name}     # Create new workflow
*modify agent {name}        # Modify existing agent
*modify task {name}         # Modify existing task

# Workflow Orchestration
*workflow {name}            # Start a workflow
*run-workflow {name} status # Check workflow status
*plan                       # Create execution plan

# Knowledge Base
*kb                         # Toggle KB mode (load AIOS knowledge)

# Direct Task Execution
*task {task-name}           # Execute any task directly

# Utilities
*list-components            # List all framework components
*validate-component         # Validate component
*analyze-framework          # Analyze framework structure
```

### Example: Using @aios-master to Orchestrate

```bash
# Start a greenfield project workflow
@aios-master
*workflow greenfield-fullstack

# Or execute tasks directly without switching agents
@aios-master
*task create-doc prd-tmpl.yaml
*task create-next-story
```

---

## 3. Agent Handoffs - How They Work

### The Handoff Mechanism

Agents **do not auto-switch**. They provide clear signals for when to activate another agent.

### Standard Development Flow (Full Cycle)

```
Step 1: Research
────────────────
@analyst
*brainstorm {topic}
*perform-market-research
Output: Research insights
Handoff: "Research complete. Activate @pm to create PRD."

Step 2: Product Definition
────────────────────────────
@pm
*create-prd
Output: PRD document
Handoff: "PRD ready. Activate @architect for architecture."

Step 3: Architecture
────────────────────
@architect
*create-full-stack-architecture
Output: Architecture document
Handoff: "Architecture complete. @data-engineer for schema."

Step 4: Database Design
───────────────────────
@data-engineer
*create-schema
*create-rls-policies
Output: Schema, migrations
Handoff: "Schema ready. @sm to create stories."

Step 5: Story Creation
──────────────────────
@sm
*draft
Output: User story
Handoff: "Story ready. @dev to implement."

Step 6: Implementation
──────────────────────
@dev
*develop story-X.Y.Z
Output: Code + tests
Status: "Ready for Review"
Handoff: "Story complete. Activate @qa to review."

Step 7: Quality Review
──────────────────────
@qa
*review story-X.Y.Z
*gate story-X.Y.Z
Output: QA results (PASS/FAIL)
Handoff: "QA passed. Activate @devops to push."

Step 8: Push & Release
──────────────────────
@devops
*pre-push              # Run quality gates
*push                  # Push to remote
*create-pr             # Create pull request
Output: PR URL
Handoff: "PR #123 created. Ready for merge."
```

### Handoff Signals

Each agent uses specific signals:

| Agent | Handoff Signal |
|-------|---------------|
| `@analyst` | "Research complete. Activate @pm to create PRD." |
| `@pm` | "PRD ready. Activate @architect for architecture." |
| `@architect` | "Architecture complete. Activate @data-engineer for schema." |
| `@data-engineer` | "Schema ready. Activate @sm to create stories." |
| `@sm` | "Story ready. Activate @dev to implement." |
| `@dev` | "Story complete. Status: Ready for Review. Activate @devops to push." |
| `@qa` | "QA gate: PASS. Activate @devops to push." |
| `@devops` | "PR #123 created. Ready for merge." |

### Git Operations Handoff Chain

```
@dev commits locally (git add, git commit)
        ↓
    Cannot push
        ↓
    Signals: "Ready for Review"
        ↓
@devops receives handoff
        ↓
    *pre-push (run quality gates)
        ↓
    *push (push to remote)
        ↓
    *create-pr (create PR)
```

---

## 4. Do Agents Step on Each Other's Toes?

### Short Answer: NO

The system has **5 layers of conflict prevention**:

### Layer 1: Command Authority Matrix

Each command has **exactly ONE owner**:

```yaml
# Planning Commands
*create-prd          → @pm (ÚNICO - single owner)
*create-epic         → @pm (ÚNICO)
*draft               → @sm (ÚNICO)
*create-schema       → @data-engineer (ÚNICO)

# Development Commands
*develop             → @dev (ÚNICO)
*review              → @qa (ÚNICO)

# DevOps Commands
*push                → @devops (ÚNICO)
*create-pr           → @devops (ÚNICO)
```

### Layer 2: Git Pre-Push Hook

A git hook blocks unauthorized push attempts:

```bash
# .git/hooks/pre-push checks:
if [ "$AIOS_ACTIVE_AGENT" != "github-devops" ]; then
    echo "ERROR: Only @devops can push"
    echo "Current agent: $AIOS_ACTIVE_AGENT"
    echo "Activate @devops to push changes"
    exit 1
fi
```

### Layer 3: Environment Variables

```bash
AIOS_ACTIVE_AGENT="github-devops"  # Set when agent activates
AIOS_GIT_PUSH_ALLOWED="true"       # Only for @devops
```

### Layer 4: Agent Definition Boundaries

Each agent.md file has explicit restrictions:

```yaml
# In @dev's agent definition
git_restrictions:
  allowed_operations:
    - git add
    - git commit
    - git status
    - git diff
  blocked_operations:
    - git push          # ONLY @devops
    - gh pr create      # ONLY @devops
  redirect_message: "For push operations, activate @devops"
```

### Layer 5: Cross-Agent Request Resolution

When you ask an agent for something outside their domain:

```
User: @dev, push my changes
@dev: "I cannot push to remote. Git push is @devops exclusive authority.
       Activate @devops to push your changes:
       @devops *push"
```

### What Happens If You Try Anyway?

```
@dev
*push

Output:
❌ Command '*push' is not available for @dev
📋 This command belongs to: @devops
💡 To push changes, use:
   @devops
   *push
```

---

## 5. Using Existing Commands

### Finding Available Commands

```bash
# Within any agent
*help                    # List all commands for current agent
*guide                   # Comprehensive usage guide
```

### Command Syntax

All commands use `*` prefix:

```bash
*command                         # Simple command
*command {argument}              # Command with argument
*command {arg1} {arg2}          # Multiple arguments
*command --flag                  # With flag
*command {arg} --flag=value     # Combined
```

### Common Commands (Available to All Agents)

```bash
*help              # Show commands
*guide             # Usage guide
*exit              # Exit agent mode
*session-info      # Show session details
*yolo              # Toggle confirmation skipping
```

### Agent-Specific Commands

**@dev Commands:**
```bash
*develop story-1.0.0              # Implement story
*develop-yolo                     # Autonomous mode
*run-tests                        # Run tests
*apply-qa-fixes                   # Apply QA feedback
*backlog-debt "Fix memory leak"   # Register tech debt
*worktree-create story-1.0.0      # Create isolated worktree
```

**@devops Commands:**
```bash
*pre-push                         # Run all quality gates
*push                             # Push to remote
*create-pr                        # Create pull request
*release                          # Create versioned release
*cleanup                          # Remove stale branches
```

**@sm Commands:**
```bash
*draft                            # Create next story
*story-checklist                  # Run story checklist
```

**@qa Commands:**
```bash
*review story-1.0.0               # Comprehensive review
*review-build story-1.0.0         # 10-phase structured review
*gate story-1.0.0                 # Quality gate decision
*security-check story-1.0.0       # Security scan
```

---

## 6. Using Existing Workflows

### Available Workflows

| Workflow | Purpose |
|----------|---------|
| `greenfield-fullstack` | New full-stack project |
| `greenfield-service` | New backend/service |
| `greenfield-ui` | New frontend/UI |
| `brownfield-fullstack` | Existing full-stack project |
| `brownfield-service` | Existing backend |
| `brownfield-ui` | Existing frontend |
| `brownfield-discovery` | Technical debt assessment |
| `setup-environment` | IDE configuration |

### Starting a Workflow

```bash
@aios-master
*workflow greenfield-fullstack

# Or with mode
*workflow brownfield-discovery --mode=guided
```

### Workflow Modes

| Mode | Description | Use When |
|------|-------------|----------|
| `guided` | Manual persona-switch, you control handoffs | Learning, complex decisions |
| `engine` | Real subagent spawning, automated | Routine, well-defined flows |

### Workflow Commands

```bash
*workflow {name}            # Start workflow
*run-workflow {name} status # Check progress
*run-workflow {name} skip   # Skip current step
*run-workflow {name} abort  # Abort workflow
```

### Example: Running Greenfield Workflow

```bash
@aios-master
*workflow greenfield-fullstack

# Workflow starts with @analyst
# Output: "Stage 1: Research - Activate @analyst"

@analyst
*brainstorm my-project
*perform-market-research

# Handoff signal appears
# "Research complete. Stage 2: PRD - Activate @pm"

@pm
*create-prd

# Continue through stages...
```

---

## 7. Creating New Commands (Tasks)

### What is a Task?

A **Task** is an executable workflow that defines:
- What the command does
- Required inputs/outputs
- Step-by-step instructions
- Validation criteria

### Creating a Task

**Method 1: Using @aios-master (Recommended)**

```bash
@aios-master
*create task my-custom-task
```

The system will guide you through:
1. Task name and purpose
2. Which agent(s) will use it
3. Workflow steps
4. Inputs/outputs
5. Validation criteria

**Method 2: Manual Creation**

Create file at: `.aios-core/development/tasks/{task-name}.md`

### Task File Structure

```markdown
# {Task Title}

## Purpose
{Clear description of what the task accomplishes}

## Prerequisites
- {Requirement 1}
- {Requirement 2}

## Interactive Elicitation Process (if needed)

### Step 1: {Step Name}
```
ELICIT: {What to collect}
1. Question 1?
2. Question 2?
```

## Implementation Steps

1. **Step 1 Name**
   - Details
   - Sub-steps

2. **Step 2 Name**
   - Details

## Validation Checklist
- [ ] Criterion 1
- [ ] Criterion 2

## Error Handling
- If {error}: {resolution}

## Success Output
```
✅ Task completed successfully!
📁 Output: {location}
```
```

### Naming Convention

```
Agent-specific tasks: {agent-id}-{task-name}.md
  Examples: dev-develop-story.md, qa-review-build.md

Shared tasks: {task-name}.md (no prefix)
  Examples: create-doc.md, execute-checklist.md
```

### Registering Task with Agent

Add to agent's dependencies in their `.md` file:

```yaml
dependencies:
  tasks:
    - my-custom-task.md
```

### Task Execution Modes

```yaml
# In task header
## Execution Modes

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Best for: Simple, deterministic tasks

### 2. Interactive Mode - Balanced (5-10 prompts) [DEFAULT]
- Best for: Learning, complex decisions

### 3. Pre-Flight Planning - Comprehensive
- Best for: Ambiguous requirements, critical work
```

---

## 8. Creating New Workflows

### What is a Workflow?

A **Workflow** orchestrates multiple agents and tasks across stages for complex multi-step processes.

### Creating a Workflow

**Method 1: Using @aios-master (Recommended)**

```bash
@aios-master
*create workflow my-custom-workflow
```

The system will guide you through:
1. Workflow name and goal
2. Target context (core/squad/hybrid)
3. Stages and sequence
4. Agent assignments
5. Resources needed

**Method 2: Manual Creation**

Create file at: `.aios-core/development/workflows/{workflow-name}.yaml`

### Workflow File Structure

```yaml
workflow:
  id: my-workflow
  name: My Custom Workflow
  description: What this workflow accomplishes
  type: development  # configuration|development|deployment
  scope: fullstack   # ui|service|fullstack

metadata:
  elicit: true       # Requires user interaction
  confirmation_required: true
  version: 1.0.0

stages:
  - id: research
    name: Research Phase
    description: Gather requirements and analyze
    agent: '@analyst'
    tasks:
      - perform-market-research.md
      - create-project-brief.md
    outputs:
      - research_report
      - project_brief
    next: planning

  - id: planning
    name: Planning Phase
    description: Create PRD and architecture
    agent: '@pm'
    tasks:
      - create-prd.md
    outputs:
      - prd_document
    next: architecture

  - id: architecture
    name: Architecture Phase
    agent: '@architect'
    tasks:
      - create-full-stack-architecture.md
    outputs:
      - architecture_document
    next: implementation

  - id: implementation
    name: Implementation Phase
    agent: '@dev'
    tasks:
      - dev-develop-story.md
    outputs:
      - completed_code
    next: review

  - id: review
    name: Review Phase
    agent: '@qa'
    tasks:
      - qa-review-story.md
      - qa-gate.md
    outputs:
      - qa_report
    next: deploy
    conditions:
      - gate_result: PASS

  - id: deploy
    name: Deployment Phase
    agent: '@devops'
    tasks:
      - github-devops-pre-push-quality-gate.md
      - github-devops-github-pr-automation.md
    outputs:
      - pr_url

transitions:
  - from: review
    to: implementation
    condition: gate_result == 'FAIL'
    description: Return to dev if QA fails

resources:
  templates:
    - prd-tmpl.yaml
    - architecture-tmpl.yaml
    - story-tmpl.yaml
  data:
    - technical-preferences.md

validation:
  checkpoints:
    - stage: planning
      criteria: PRD approved by stakeholder
    - stage: review
      criteria: All tests passing
```

### Workflow Target Contexts

| Context | Location | Use Case |
|---------|----------|----------|
| `core` | `.aios-core/development/workflows/` | Framework-level workflows |
| `squad` | `squads/{squad}/workflows/` | Squad-specific workflows |
| `hybrid` | `squads/{squad}/workflows/` | Squad workflow using core agents |

### Running Your Workflow

```bash
@aios-master
*workflow my-custom-workflow

# Or validate first
*validate-workflow my-custom-workflow --strict
```

---

## 9. Best Practices

### Do's

1. **Always use the right agent for the job**
   - Check the decision tree if unsure

2. **Follow handoff signals**
   - Don't force operations outside agent scope

3. **Use workflows for complex processes**
   - Don't manually orchestrate multi-stage work

4. **Let @devops handle all remote operations**
   - Never try to push from other agents

5. **Create stories before coding**
   - Follow story-driven development

6. **Run quality gates before push**
   - `*pre-push` catches issues early

### Don'ts

1. **Don't use @aios-master for routine tasks**
   - Use specialized agents instead

2. **Don't bypass handoff signals**
   - They exist to prevent conflicts

3. **Don't create duplicate commands**
   - Check if command exists first

4. **Don't modify agent definitions directly**
   - Use `@aios-master *modify agent`

5. **Don't skip QA review**
   - Quality gates are mandatory

---

## 10. Common Scenarios

### Scenario 1: Start a New Project

```bash
# Option A: Use workflow (recommended)
@aios-master
*workflow greenfield-fullstack

# Option B: Manual orchestration
@analyst
*brainstorm my-project

@pm
*create-prd

@architect
*create-full-stack-architecture

@data-engineer
*create-schema

@sm
*draft
```

### Scenario 2: Implement a Feature

```bash
# 1. Create story
@sm
*draft

# 2. Implement
@dev
*develop story-1.0.0

# 3. Review
@qa
*review story-1.0.0
*gate story-1.0.0

# 4. Push (only if QA passed)
@devops
*pre-push
*push
*create-pr
```

### Scenario 3: Fix a Bug

```bash
# 1. Create bug fix story
@sm
*draft

# 2. Implement fix
@dev
*develop story-fix-1.0.0
*run-tests

# 3. Quick review
@qa
*review story-fix-1.0.0

# 4. Push
@devops
*push
*create-pr
```

### Scenario 4: Add Database Schema

```bash
@data-engineer
*create-schema
*create-rls-policies
*create-migration-plan
*apply-migration ./migrations/001.sql

# Push migration
@devops
*pre-push
*push
```

### Scenario 5: Create a Custom Agent

```bash
@aios-master
*kb                          # Enable knowledge base
*create agent wellness-coach # Interactive creation

# System guides you through:
# - Agent name, ID, icon
# - Role and responsibilities
# - Commands
# - Dependencies
```

### Scenario 6: Extend System with Squad

```bash
@squad-creator
*design-squad --docs ./docs/my-domain.md
*create-squad my-domain-squad --from-design
*validate-squad my-domain-squad

# Later, extend it
*extend-squad my-domain-squad --add agent --name domain-expert
```

---

## Quick Reference Card

### Agent Activation
```
@{agent-name}            # Activate agent
*help                    # Show commands
*exit                    # Exit agent
```

### Essential Workflows
```
@aios-master *workflow greenfield-fullstack   # New project
@aios-master *workflow brownfield-discovery   # Existing project
```

### Development Cycle
```
@sm *draft                    # Create story
@dev *develop story-X.Y.Z     # Implement
@qa *review story-X.Y.Z       # Review
@devops *push                 # Push
```

### Creating Components
```
@aios-master *create agent {name}     # New agent
@aios-master *create task {name}      # New task
@aios-master *create workflow {name}  # New workflow
@squad-creator *create-squad {name}   # New squad
```

---

*Synkra AIOS v3.11.3*
*CLI First | Observability Second | UI Third*
