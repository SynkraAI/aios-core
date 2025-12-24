# Story WIS-14: `*add-agent-command` Task Implementation

<!-- Source: Epic WIS - Workflow Intelligence System -->
<!-- Context: Task for extending agent commands -->
<!-- Created: 2025-12-23 by @sm (River) -->

## Status: Draft

**Priority:** 🟢 LOW
**Sprint:** 12
**Effort:** 4-6h
**Lead:** @aios-master (Orion)
**Approved by:** Pending @po validation

---

## Story

**As an** AIOS framework developer,
**I want** an `*add-agent-command` command that extends existing agents with new commands,
**So that** I can add new capabilities to agents without manually editing their definitions.

---

## Background

WIS-9 Investigation defined the `*add-agent-command` task (Section 5.5).
This enables adding new commands to existing agents programmatically.

### Reference Documents

| Document | Section |
|----------|---------|
| `docs/architecture/wis-9-investigation-report.md` | Section 5.5: *add-agent-command |

---

## 🤖 CodeRabbit Integration

### Story Type Analysis

**Primary Type**: Implementation
**Secondary Type(s)**: Agent Extension, Framework Tooling
**Complexity**: Low-Medium

### Specialized Agent Assignment

**Primary Agents**:
- @aios-master (Orion): Implement and own this task

**Supporting Agents**:
- @dev (Dex): Review implementation

### Quality Gate Tasks

- [ ] Pre-Commit (@aios-master): Validate agent modification
  - **Pass criteria:** Command added, agent YAML valid, ide-sync runs
  - **Fail criteria:** YAML syntax errors, missing task reference

### Self-Healing Configuration

**Mode:** light
**Max Iterations:** 2
**Timeout:** 15 minutes

### Focus Areas

- Agent YAML modification
- Command array updates
- Task dependency linking
- IDE sync integration

---

## Acceptance Criteria

### AC 14.1: Task Definition
- [ ] Create `.aios-core/development/tasks/add-agent-command.md`
- [ ] Define inputs:
  - `agent_id` (required string, e.g., 'dev', 'qa', 'architect')
  - `command_name` (required string, pattern: `^[a-z][a-z0-9-]*$`)
  - `command_description` (required string)
  - `task_reference` (optional string, path to task file)

### AC 14.2: Agent Locator
- [ ] Find agent definition in `.aios-core/development/agents/{agent_id}.md`
- [ ] Parse existing agent YAML
- [ ] Validate agent exists

### AC 14.3: Command Addition
- [ ] Add command to agent's `commands` array
- [ ] Format: `- {command_name}: {command_description}`
- [ ] Preserve existing commands
- [ ] Maintain YAML formatting

### AC 14.4: Task Dependency
- [ ] If `task_reference` provided:
  - Verify task file exists
  - Add to agent's `dependencies.tasks` array
  - Validate task-command link

### AC 14.5: IDE Sync
- [ ] Run ide-sync to update Claude Code skills
- [ ] Verify command appears in IDE
- [ ] Log sync result

### AC 14.6: Elicitation Flow
- [ ] Interactive prompts:
  ```
  1. "Which agent to extend?" (choice from available agents)
  2. "Command name?" (text, kebab-case validation)
  3. "Command description?" (text)
  4. "Link to existing task?" (optional, file picker or text)
  ```

### AC 14.7: Validation & Rollback
- [ ] Create backup of agent file before modification
- [ ] Validate modified YAML parses correctly
- [ ] Rollback on failure

---

## Tasks / Subtasks

- [ ] **Task 1: Create Task Definition** (AC: 14.1)
  - [ ] Create task file
  - [ ] Define inputs with validation

- [ ] **Task 2: Implement Agent Locator** (AC: 14.2)
  - [ ] Scan agents directory
  - [ ] Parse agent YAML
  - [ ] Validate agent exists

- [ ] **Task 3: Implement Command Addition** (AC: 14.3)
  - [ ] Parse commands array
  - [ ] Add new command
  - [ ] Preserve formatting

- [ ] **Task 4: Implement Task Linking** (AC: 14.4)
  - [ ] Verify task exists
  - [ ] Add to dependencies
  - [ ] Validate link

- [ ] **Task 5: Implement IDE Sync** (AC: 14.5)
  - [ ] Trigger ide-sync
  - [ ] Verify skill update

- [ ] **Task 6: Implement Elicitation** (AC: 14.6)
  - [ ] Agent selection
  - [ ] Command input
  - [ ] Task linking

- [ ] **Task 7: Add Validation & Rollback** (AC: 14.7)
  - [ ] Backup creation
  - [ ] YAML validation
  - [ ] Rollback logic

---

## Dev Notes

### Agent YAML Command Format

```yaml
# Before
commands:
  - help: Show all available commands
  - create-service: Create a new service

# After
commands:
  - help: Show all available commands
  - create-service: Create a new service
  - new-command: Description of new command
```

### Agent YAML Dependency Format

```yaml
# Before
dependencies:
  tasks:
    - create-service.md

# After
dependencies:
  tasks:
    - create-service.md
    - new-command-task.md
```

### IDE Sync Command

```bash
node .aios-core/development/scripts/ide-sync.js
```

### Rollback Strategy

1. Before modification:
   - Copy agent file to `.aios/backups/agents/{agent_id}-{timestamp}.md`
2. After modification:
   - Validate YAML parses
   - If parse fails, restore backup
   - Log error and notify user

### Error Handling

| Error | Resolution |
|-------|------------|
| Agent not found | List available agents, prompt selection |
| Command exists | Warn user, ask to overwrite or rename |
| Task not found | Create task stub or skip linking |
| YAML parse error | Rollback and show error details |

---

## Testing

**Validation:**
1. Add command to @dev agent
2. Verify command appears in agent definition
3. Run ide-sync
4. Verify command accessible in Claude Code
5. Test rollback on intentional failure

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-23 | @sm (River) | Initial draft from WIS-9 investigation |
