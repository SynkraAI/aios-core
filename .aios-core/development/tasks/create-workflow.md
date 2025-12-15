---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Autonomous decision making with logging
- Minimal user interaction
- **Best for:** Simple, deterministic tasks

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Explicit decision checkpoints
- Educational explanations
- **Best for:** Learning, complex decisions

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Task analysis phase (identify all ambiguities)
- Zero ambiguity execution
- **Best for:** Ambiguous requirements, critical work

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: createWorkflow()
responsável: Orion (Commander)
responsavel_type: Agente
atomic_layer: Config

**Entrada:**
- campo: name
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must be non-empty, lowercase, kebab-case

- campo: options
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Valid JSON object with allowed keys

- campo: force
  tipo: boolean
  origem: User Input
  obrigatório: false
  validação: Default: false

**Saída:**
- campo: created_file
  tipo: string
  destino: File system
  persistido: true

- campo: validation_report
  tipo: object
  destino: Memory
  persistido: false

- campo: success
  tipo: boolean
  destino: Return value
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Target does not already exist; required inputs provided; permissions granted
    tipo: pre-condition
    blocker: true
    validação: |
      Check target does not already exist; required inputs provided; permissions granted
    error_message: "Pre-condition failed: Target does not already exist; required inputs provided; permissions granted"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Resource created successfully; validation passed; no errors logged
    tipo: post-condition
    blocker: true
    validação: |
      Verify resource created successfully; validation passed; no errors logged
    error_message: "Post-condition failed: Resource created successfully; validation passed; no errors logged"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Resource exists and is valid; no duplicate resources created
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert resource exists and is valid; no duplicate resources created
    error_message: "Acceptance criterion not met: Resource exists and is valid; no duplicate resources created"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** component-generator
  - **Purpose:** Generate new components from templates
  - **Source:** .aios-core/scripts/component-generator.js

- **Tool:** file-system
  - **Purpose:** File creation and validation
  - **Source:** Node.js fs module

---

## Scripts

**Agent-specific code for this task:**

- **Script:** create-component.js
  - **Purpose:** Component creation workflow
  - **Language:** JavaScript
  - **Location:** .aios-core/scripts/create-component.js

---

## Error Handling

**Strategy:** abort

**Common Errors:**

1. **Error:** Resource Already Exists
   - **Cause:** Target file/resource already exists in system
   - **Resolution:** Use force flag or choose different name
   - **Recovery:** Prompt user for alternative name or force overwrite

2. **Error:** Invalid Input
   - **Cause:** Input name contains invalid characters or format
   - **Resolution:** Validate input against naming rules (kebab-case, lowercase, no special chars)
   - **Recovery:** Sanitize input or reject with clear error message

3. **Error:** Permission Denied
   - **Cause:** Insufficient permissions to create resource
   - **Resolution:** Check file system permissions, run with elevated privileges if needed
   - **Recovery:** Log error, notify user, suggest permission fix

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 2-10 min (estimated)
cost_estimated: $0.001-0.008
token_usage: ~800-2,500 tokens
```

**Optimization Notes:**
- Validate configuration early; use atomic writes; implement rollback checkpoints

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - creation
  - setup
updated_at: 2025-11-17
```

---

tools:
  - github-cli
# TODO: Create workflow-validation-checklist.md for validation (follow-up story needed)
# checklists:
#   - workflow-validation-checklist.md
---

# Create Workflow

## Purpose
To create a new workflow definition that orchestrates multiple agents and tasks for complex multi-step processes in Synkra AIOS.

## Prerequisites
- User authorization verified
- Clear understanding of workflow goals
- Knowledge of participating agents and tasks
- Memory layer client initialized

## Interactive Elicitation Process

### Step 1: Workflow Overview
```
ELICIT: Workflow Basic Information
1. What is the workflow name? (e.g., "feature-development", "bug-fix")
2. What is the primary goal of this workflow?
3. What type of project is this for? (greenfield/brownfield, UI/service/fullstack)
4. What is the expected outcome?
```

### Step 2: Workflow Stages
```
ELICIT: Workflow Stages and Flow
1. What are the main stages/phases? (e.g., "planning", "implementation", "testing")
2. What is the sequence of these stages?
3. Are there any parallel activities?
4. Are there decision points or conditional flows?
5. What are the exit criteria for each stage?
```

### Step 3: Agent Orchestration
```
ELICIT: Agent Participation
For each stage:
1. Which agent(s) are involved?
2. What are their specific responsibilities?
3. How do agents hand off work between stages?
4. Are there any approval requirements?
```

### Step 4: Resource Requirements
```
ELICIT: Resources and Dependencies
1. What templates are needed?
2. What data files are required?
3. Are there external dependencies?
4. What are the input requirements?
5. What outputs are produced?
```

## Implementation Steps

1. **Validate Workflow Design**
   - Check for circular dependencies
   - Validate agent availability
   - Ensure logical flow progression
   - Verify all resources exist

2. **Generate Workflow Structure**
   ```yaml
   workflow:
     id: {workflow-name}
     name: {Workflow Display Name}
     description: {Purpose and overview}
     type: {greenfield|brownfield}
     scope: {ui|service|fullstack}
     
   stages:
     - id: stage-1
       name: {Stage Name}
       agent: {agent-id}
       tasks:
         - {task-name}
       outputs:
         - {output-description}
       next: stage-2
       
   transitions:
     - from: stage-1
       to: stage-2
       condition: {optional condition}
       
   resources:
     templates:
       - {template-name}
     data:
       - {data-file}
       
   validation:
     checkpoints:
       - stage: {stage-id}
         criteria: {validation-criteria}
   ```

3. **Add Security Controls**
   - Stage authorization requirements
   - Data access restrictions
   - Audit logging points
   - Approval workflows

4. **Create Workflow File**
   - Generate path: `.aios-core/workflows/{workflow-name}.yaml`
   - Write structured YAML definition
   - Include comprehensive documentation

5. **Update Memory Layer**
   ```javascript
   await memoryClient.addMemory({
     type: 'workflow_created',
     name: workflowName,
     path: workflowPath,
     creator: currentUser,
     timestamp: new Date().toISOString(),
     metadata: {
       type: workflowType,
       stages: stageList,
       agents: involvedAgents
     }
   });
   ```

6. **Generate Documentation**
   - Create workflow diagram (text-based)
   - Document each stage's purpose
   - List all handoff points
   - Include troubleshooting guide

## Validation Checklist
- [ ] Workflow name is unique and valid
- [ ] All stages have clear purposes
- [ ] Agent assignments are valid
- [ ] No circular dependencies
- [ ] All resources exist
- [ ] Transitions are logical
- [ ] Security controls defined
- [ ] Memory layer updated

## Error Handling
- If workflow exists: Offer versioning or update
- If agents missing: List required agents
- If circular dependency: Show cycle and suggest fix
- If resources missing: List and offer to create

## Success Output
```
✅ Workflow '{workflow-name}' created successfully!
📁 Location: .aios-core/workflows/{workflow-name}.yaml
📊 Workflow Summary:
   - Stages: {stage-count}
   - Agents: {agent-list}
   - Type: {workflow-type}
🚀 To use: Select workflow when starting new project
```

## Workflow Execution Notes
- Workflows are selected during project initialization
- Each stage execution is logged in memory
- Progress tracking available through memory queries
- Agents automatically receive stage-specific context 