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
task: createAgent()
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
# TODO: Create agent-creation-checklist.md for validation (follow-up story needed)
# checklists:
#   - agent-creation-checklist.md
---

# Create Agent Task

## Purpose
To create a new agent definition file following Synkra AIOS standards using the template system with progressive disclosure elicitation.

## Prerequisites
- User authorization verified
- Template system initialized
- Component generator available
- Memory layer client initialized

## Implementation Method
This task now uses the enhanced template system with progressive disclosure:

```javascript
const ComponentGenerator = require('../scripts/component-generator');
const generator = new ComponentGenerator({
  rootPath: process.cwd()
});

// Generate agent using elicitation workflow
const result = await generator.generateComponent('agent', {
  saveSession: true,  // Save progress
  force: false        // Don't overwrite existing
});
```

## Interactive Elicitation Process
The elicitation workflow is now handled by `aios-core/elicitation/agent-elicitation.js` with:

1. **Basic Agent Information** - Name, title, icon, usage
2. **Agent Persona & Style** - Role, communication, identity, focus
3. **Agent Commands** - Standard and custom commands
4. **Dependencies & Resources** - Tasks, templates, checklists, tools
5. **Security & Access Control** - Permissions and logging
6. **Advanced Options** - Memory layer, principles, activation

### Progressive Disclosure Features:
- **Smart Defaults**: Auto-generates values based on previous answers
- **Contextual Help**: Shows help text for complex steps
- **Conditional Steps**: Shows/hides steps based on choices
- **Session Saving**: Can pause and resume creation
- **Validation**: Real-time input validation with security checks

## Implementation Steps

1. **Validate Inputs**
   - Check agent name doesn't already exist
   - Validate name format (lowercase, hyphens only)
   - Ensure no path traversal in name

2. **Generate Agent File**
   - Use standard agent template structure
   - Include all elicited information
   - Add security controls if specified
   - Include memory layer integration if needed

3. **Security Validation**
   - No eval() or dynamic code execution
   - Validate all YAML syntax
   - Check for malicious patterns
   - Sanitize all user inputs

4. **Create File**
   - Generate path: `.aios-core/agents/{agent-name}.md`
   - Write agent definition with proper formatting
   - Set appropriate file permissions

5. **Update Memory Layer**
   ```javascript
   await memoryClient.addMemory({
     type: 'agent_created',
     name: agentName,
     path: agentPath,
     creator: currentUser,
     timestamp: new Date().toISOString(),
     metadata: {
       role: agentRole,
       commands: agentCommands
     }
   });
   ```

6. **Post-Creation Tasks**
   - Prompt user to update team manifest
   - Suggest creating related task files
   - Document in project changelog

## Validation Checklist
- [ ] Agent name is unique and valid
- [ ] All required sections included
- [ ] YAML syntax is valid
- [ ] Security controls implemented
- [ ] No malicious patterns detected
- [ ] Memory layer updated
- [ ] File created successfully

## Error Handling
- If agent already exists: Prompt for different name or update existing
- If validation fails: Show specific errors and allow correction
- If file write fails: Check permissions and path
- If memory update fails: Log error but continue (non-blocking)

## Success Output
```
✅ Agent '{agent-name}' created successfully!
📁 Location: .aios-core/agents/{agent-name}.md
📝 Next steps:
   1. Run *update-manifest to add agent to team
   2. Test agent with /{agent-name} command
   3. Create any needed task dependencies
``` 