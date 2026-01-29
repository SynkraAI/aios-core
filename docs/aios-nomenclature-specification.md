# AIOS Nomenclature Specification

> 🌐 **EN** | [PT](./pt/aios-nomenclature-specification.md) | [ES](./es/aios-nomenclature-specification.md)

---

**Version:** 1.0.0  
**Status:** Draft  
**Created:** 2025-01-17  
**Author:** Dex (Dev Agent)  
**Inspired By:** AsyncThink (Microsoft Research), Agent Lightning (Microsoft)

---

## 📋 Executive Summary

This document establishes clear nomenclature for AIOS to differentiate between:

- **Task Workflow**: Internal execution steps within a single task
- **Workflow**: Multi-task orchestration across agents with Fork/Join capabilities

This specification incorporates insights from Microsoft Research's AsyncThink paradigm and Agent Lightning framework to enable asynchronous, optimized agent execution.

---

## 🎯 Core Definitions

### Task Workflow (Task_workflow)

**Definition:** The sequence of steps and actions **within a single task** that defines how that task executes.

**Characteristics:**

- **Scope:** Internal to a single task file (`.aios-core/tasks/*.md`)
- **Execution:** Sequential or parallel steps within task boundaries
- **Location:** Defined in `Step-by-Step Execution` section of task file
- **Responsibility:** Single agent executing one task
- **Example:** `security-scan.md` has 5 steps: Setup → Scan → Analyze → Detect → Report

**Naming Convention:**

- Use `task-workflow` or `task_workflow` in documentation
- Referenced as "task execution steps" or "task workflow" in context
- **NOT** called "workflow" alone (to avoid confusion)

**Example Structure:**

```markdown
## Step-by-Step Execution

### Step 1: Setup Security Tools

**Purpose:** Ensure all required security scanning tools are installed
**Actions:**

1. Check for npm audit availability
2. Install ESLint security plugins if missing
   ...

### Step 2: Dependency Vulnerability Scan

...
```

---

### Workflow

**Definition:** A sequence of **multiple tasks** executed by **one or more agents**, where task outputs connect to task inputs sequentially or in parallel, supporting Fork and Join operations.

**Characteristics:**

- **Scope:** Cross-task orchestration across multiple agents
- **Execution:** Can be sequential, parallel (Fork), or convergent (Join)
- **Location:** Defined in `.aios-core/workflows/*.yaml` or story workflow sections
- **Responsibility:** Multiple agents coordinating to achieve a goal
- **Example:** Story Development Workflow: `po-create-story` → `dev-develop-story` → `qa-gate`

**Naming Convention:**

- Use `workflow` for multi-task orchestration
- Can be named descriptively: `story-development-workflow`, `pm-tool-integration-workflow`
- Supports AsyncThink patterns: Organizer-Worker, Fork/Join

**Example Structure:**

```yaml
workflow:
  id: story-development-workflow
  name: Story Development Flow
  description: Complete story lifecycle from requirements to QA gate

  stages:
    - id: create-story
      agent: po
      task: create-next-story
      inputs:
        - requirements_doc
      outputs:
        - story_file

    - id: develop-story
      agent: dev
      task: dev-develop-story
      inputs:
        - story_file # Connected from previous stage
      outputs:
        - code_changes
        - test_results

    - id: qa-gate
      agent: qa
      task: qa-gate
      inputs:
        - story_file # From create-story
        - code_changes # From develop-story
      outputs:
        - qa_report
```

---

## 🔄 AsyncThink Integration

### Organizer-Worker Pattern

**Concept:** Inspired by AsyncThink's Organizer-Worker protocol, AIOS workflows can use an **Organizer Agent** that coordinates **Worker Agents** executing tasks in parallel.

**Application to AIOS:**

1. **Organizer Agent:**
   - Coordinates workflow execution
   - Makes decisions about Fork/Join points
   - Manages task dependencies
   - Merges results from parallel workers

2. **Worker Agents:**
   - Execute specific tasks assigned by organizer
   - Process sub-queries/tasks independently
   - Return results to organizer
   - Can be specialized agents (dev, qa, po, etc.)

**Example Workflow with Fork/Join:**

```yaml
workflow:
  id: parallel-validation-workflow
  organizer: aios-master

  stages:
    - id: fork-validation
      type: fork
      organizer_decision: 'Split validation into parallel tasks'
      workers:
        - agent: dev
          task: security-scan
          inputs:
            - codebase
          outputs:
            - security_report

        - agent: qa
          task: qa-run-tests
          inputs:
            - codebase
          outputs:
            - test_results

        - agent: dev
          task: sync-documentation
          inputs:
            - codebase
          outputs:
            - docs_synced

    - id: join-validation
      type: join
      organizer_merges:
        - security_report
        - test_results
        - docs_synced
      outputs:
        - validation_complete
```

---

## ⚡ Agent Lightning Integration

### Agent Optimization Framework

**Concept:** Agent Lightning enables optimizing ANY agent with ANY framework using reinforcement learning, without modifying agent code.

**Application to AIOS:**

1. **Lightning Server Integration:**
   - Collect agent execution traces
   - Monitor task success/failure
   - Track performance metrics
   - Enable RL-based optimization

2. **Non-Intrusive Monitoring:**
   - Sidecar design for trace collection
   - No code changes to existing tasks
   - Automatic transition tuple generation (state, action, reward, next_state)

3. **Optimization Opportunities:**
   - Task execution efficiency
   - Agent decision-making
   - Workflow orchestration
   - Error handling strategies

**Example Integration:**

```yaml
# .aios-core/core-config.yaml
agent_lightning:
  enabled: true
  server_host: localhost
  server_port: 4747

  optimization:
    - target: dev-develop-story
      algorithm: RL
      metrics:
        - execution_time
        - code_quality_score
        - test_coverage

    - target: workflow-orchestration
      algorithm: APO # Automatic Prompt Optimization
      metrics:
        - workflow_success_rate
        - parallelization_efficiency
```

---

## 📐 Nomenclature Rules

### Rule 1: Task Workflow vs Workflow

**When to use "Task Workflow" (or "task-workflow"):**

- Referring to steps within a single task file
- Documenting task execution flow
- Describing internal task logic
- In task file `Step-by-Step Execution` sections

**When to use "Workflow":**

- Referring to multi-task orchestration
- Describing agent coordination
- Documenting Fork/Join patterns
- In workflow definition files (`.yaml`)

**❌ NEVER:**

- Use "workflow" to refer to task steps
- Use "task workflow" to refer to multi-task orchestration
- Mix terminology without context

---

### Rule 2: File Naming Conventions

**Task Files:**

- Location: `.aios-core/tasks/{task-name}.md`
- Contains: Task workflow (Step-by-Step Execution)
- Example: `.aios-core/tasks/security-scan.md`

**Workflow Files:**

- Location: `.aios-core/workflows/{workflow-name}.yaml`
- Contains: Multi-task orchestration definition
- Example: `.aios-core/workflows/story-development-workflow.yaml`

**Documentation:**

- Task workflow docs: `docs/tasks/{task-name}-workflow.md` (if needed)
- Workflow docs: `docs/workflows/{workflow-name}.md`

---

### Rule 3: Code References

**In Task Files:**

```markdown
## Step-by-Step Execution

This section defines the **task workflow** for executing this task.
Each step represents a sequential action within this task.
```

**In Workflow Files:**

```yaml
workflow:
  name: Story Development Workflow
  description: |
    This workflow orchestrates multiple tasks across agents.
    It defines task dependencies and execution order.
```

**In Story Files:**

```markdown
## Workflow Execution

**Workflow:** Story Development Flow

- Task 1: `po-create-story` (task workflow: 3 steps)
- Task 2: `dev-develop-story` (task workflow: 8 steps)
- Task 3: `qa-gate` (task workflow: 5 steps)
```

---

## 🔀 Fork and Join Operations

### Fork Operation

**Definition:** Split workflow execution into parallel paths, where multiple tasks execute simultaneously.

**Syntax:**

```yaml
fork:
  id: parallel-validation
  condition: 'validation_needed'
  parallel_tasks:
    - agent: dev
      task: security-scan
      inputs:
        - codebase

    - agent: qa
      task: qa-run-tests
      inputs:
        - codebase

    - agent: dev
      task: sync-documentation
      inputs:
        - codebase
```

**Characteristics:**

- Multiple agents execute tasks in parallel
- Each task has its own task workflow
- Tasks can have different execution times
- Results collected independently

---

### Join Operation

**Definition:** Merge results from parallel tasks back into sequential workflow execution.

**Syntax:**

```yaml
join:
  id: merge-validation-results
  wait_for:
    - security-scan
    - qa-run-tests
    - sync-documentation
  merge_strategy: 'all_success' # or "any_success", "majority"
  outputs:
    - validation_complete
```

**Characteristics:**

- Waits for all parallel tasks to complete
- Merges results according to strategy
- Can have timeout/error handling
- Continues workflow with merged results

---

## 📊 Workflow Patterns

### Pattern 1: Sequential Workflow

**Description:** Tasks execute one after another, with output → input connections.

**Example:**

```yaml
workflow:
  id: sequential-story-development
  stages:
    - task: create-story
      agent: po
      outputs: [story_file]

    - task: develop-story
      agent: dev
      inputs: [story_file] # From previous task
      outputs: [code_changes]

    - task: qa-gate
      agent: qa
      inputs: [story_file, code_changes]
      outputs: [qa_report]
```

---

### Pattern 2: Fork-Join Workflow (AsyncThink Pattern)

**Description:** Split into parallel tasks, then merge results.

**Example:**

```yaml
workflow:
  id: parallel-validation-workflow
  stages:
    - task: prepare-codebase
      agent: dev
      outputs: [codebase]

    - type: fork
      parallel_tasks:
        - task: security-scan
          agent: dev
          inputs: [codebase]

        - task: qa-run-tests
          agent: qa
          inputs: [codebase]

        - task: sync-documentation
          agent: dev
          inputs: [codebase]

    - type: join
      merge_strategy: all_success
      outputs: [validation_complete]

    - task: deploy
      agent: dev
      inputs: [validation_complete]
```

---

### Pattern 3: Conditional Workflow

**Description:** Workflow branches based on conditions.

**Example:**

```yaml
workflow:
  id: conditional-deployment
  stages:
    - task: build
      agent: dev
      outputs: [build_artifact]

    - type: conditional
      condition: "environment == 'production'"
      if_true:
        - task: security-audit
          agent: security
        - task: production-deploy
          agent: dev
      if_false:
        - task: staging-deploy
          agent: dev
```

---

## 🎨 Visual Representation

### Task Workflow (Internal to Task)

```
Task: security-scan.md
┌─────────────────────────────────────┐
│ Step 1: Setup Security Tools        │
│ Step 2: Dependency Vulnerability   │
│ Step 3: Code Security Pattern Scan  │
│ Step 4: Secret Detection            │
│ Step 5: Generate Security Report    │
└─────────────────────────────────────┘
```

### Workflow (Multi-Task Orchestration)

```
Workflow: Story Development
┌─────────────┐
│ PO Agent    │
│ create-story│──┐
└─────────────┘  │
                 │ story_file
                 ▼
         ┌───────────────┐
         │   FORK        │
         └───────────────┘
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
┌──────┐ ┌──────┐ ┌──────┐
│ Dev  │ │ QA  │ │ Dev  │
│ scan │ │test │ │ docs │
└──────┘ └──────┘ └──────┘
    │         │         │
    └─────────┼─────────┘
              │
              ▼
         ┌───────────────┐
         │     JOIN       │
         └───────────────┘
              │
              ▼
         ┌───────────────┐
         │  QA Agent     │
         │  qa-gate      │
         └───────────────┘
```

---

## 🔧 Implementation Guidelines

### For Task Developers

1. **Use "Step-by-Step Execution" section** to define task workflow
2. **Never refer to it as "workflow"** - use "task execution steps" or "task workflow"
3. **Each step should be atomic** and clearly defined
4. **Document inputs/outputs** for each step
5. **Support parallel steps** if task allows (e.g., run multiple scans simultaneously)

### For Workflow Designers

1. **Use workflow YAML files** to define multi-task orchestration
2. **Clearly specify task dependencies** (inputs/outputs)
3. **Use Fork/Join** for parallel execution when beneficial
4. **Document organizer decisions** for complex workflows
5. **Support error handling** and rollback strategies

### For Documentation Writers

1. **Always clarify context** when using "workflow" term
2. **Use "task workflow"** when referring to task steps
3. **Use "workflow"** when referring to multi-task orchestration
4. **Include visual diagrams** for complex workflows
5. **Document Fork/Join patterns** clearly

---

## 📚 Examples from Codebase

### Example 1: Task Workflow (security-scan.md)

```markdown
## Step-by-Step Execution

### Step 1: Setup Security Tools

**Purpose:** Ensure all required security scanning tools are installed
**Actions:**

1. Check for npm audit availability
2. Install ESLint security plugins if missing
   ...

### Step 2: Dependency Vulnerability Scan

**Purpose:** Scan npm dependencies for known vulnerabilities
**Actions:**

1. Execute `npm audit --audit-level=moderate --json`
   ...
```

**Note:** This is a **task workflow** - internal steps within the security-scan task.

---

### Example 2: Workflow (Story Development)

```yaml
# .aios-core/workflows/story-development-workflow.yaml
workflow:
  id: story-development-workflow
  name: Story Development Flow

  stages:
    - id: create-story
      agent: po
      task: create-next-story
      inputs:
        - requirements_doc
      outputs:
        - story_file

    - id: develop-story
      agent: dev
      task: dev-develop-story
      inputs:
        - story_file
      outputs:
        - code_changes

    - id: qa-gate
      agent: qa
      task: qa-gate
      inputs:
        - story_file
        - code_changes
      outputs:
        - qa_report
```

**Note:** This is a **workflow** - multi-task orchestration across agents.

---

## 🚀 Future Enhancements

### AsyncThink Integration Roadmap

1. **Phase 1: Organizer-Worker Pattern**
   - Implement organizer agent for workflow coordination
   - Support Fork/Join operations in workflows
   - Enable parallel task execution

2. **Phase 2: RL Optimization**
   - Integrate Agent Lightning for agent optimization
   - Collect execution traces automatically
   - Optimize workflow orchestration decisions

3. **Phase 3: Dynamic Workflow Adaptation**
   - Learn optimal Fork/Join points
   - Adapt workflow structure based on task complexity
   - Optimize critical-path latency

### Agent Lightning Integration Roadmap

1. **Phase 1: Trace Collection**
   - Implement Lightning Server integration
   - Collect agent execution traces
   - Monitor task success/failure rates

2. **Phase 2: Optimization**
   - Enable RL-based task optimization
   - Optimize agent decision-making
   - Improve workflow orchestration

3. **Phase 3: Continuous Learning**
   - Implement online learning
   - Adapt to new task patterns
   - Optimize multi-agent coordination

---

## 📖 References

1. **AsyncThink Paper:** "The Era of Agentic Organization: Learning to Organize with Language Models" - Microsoft Research
   - [arXiv:2510.26658](https://arxiv.org/abs/2510.26658)
   - Key Concepts: Organizer-Worker, Fork/Join, Asynchronous Thinking

2. **Agent Lightning:** Microsoft's framework for optimizing AI agents
   - [GitHub: microsoft/agent-lightning](https://github.com/microsoft/agent-lightning)
   - [Documentation](https://microsoft.github.io/agent-lightning/latest/)
   - Key Concepts: Zero-code optimization, RL training, Multi-agent support

3. **AIOS Workflow Management:** Existing workflow patterns in AIOS
   - `common/utils/workflow-management.md`
   - `docs/WORKFLOW-COMPLETE-CONSOLIDATED-V3.md`

---

## ✅ Checklist for Nomenclature Compliance

When creating or updating documentation:

- [ ] Used "task workflow" or "task execution steps" when referring to task internals
- [ ] Used "workflow" when referring to multi-task orchestration
- [ ] Clarified context if term could be ambiguous
- [ ] Followed file naming conventions
- [ ] Documented Fork/Join patterns clearly
- [ ] Included visual diagrams for complex workflows

---

**Document Status:** ✅ Draft - Ready for Review  
**Next Steps:** Review by PO, Dev, and QA agents for feedback and approval
