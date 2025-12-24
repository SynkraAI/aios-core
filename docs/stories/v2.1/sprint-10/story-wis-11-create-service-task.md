# Story WIS-11: `*create-service` Task Implementation

<!-- Source: Epic WIS - Workflow Intelligence System -->
<!-- Context: Core task for service scaffolding -->
<!-- Created: 2025-12-23 by @sm (River) -->

## Status: Draft

**Priority:** 🔴 HIGH
**Sprint:** 10
**Effort:** 6-8h
**Lead:** @dev (Dex)
**Approved by:** Pending @po validation

---

## Story

**As an** AIOS developer using @dev agent,
**I want** a `*create-service` command that scaffolds new services from templates,
**So that** I can quickly create consistent service structures with proper configuration.

---

## Background

WIS-9 Investigation defined the `*create-service` task specification (Section 5.2).
This story implements that task as an executable workflow for the @dev agent.

### Reference Documents

| Document | Section |
|----------|---------|
| `docs/architecture/wis-9-investigation-report.md` | Section 5.2: *create-service |
| WIS-10 | Provides service-template/ |

---

## 🤖 CodeRabbit Integration

### Story Type Analysis

**Primary Type**: Implementation
**Secondary Type(s)**: Task Workflow, Agent Tooling
**Complexity**: Medium

### Specialized Agent Assignment

**Primary Agents**:
- @dev (Dex): Implement task workflow

**Supporting Agents**:
- @aios-master (Orion): Integrate command into @dev agent

### Quality Gate Tasks

- [ ] Pre-Commit (@dev): Validate task execution flow
  - **Pass criteria:** Task generates valid service, all steps complete
  - **Fail criteria:** Template rendering errors, missing files

### Self-Healing Configuration

**Mode:** light
**Max Iterations:** 2
**Timeout:** 15 minutes

| Severity | Action |
|----------|--------|
| CRITICAL | auto_fix |
| HIGH | document_only |

### Focus Areas

- Task YAML schema compliance
- Elicitation flow correctness
- Template variable substitution
- Error handling for invalid inputs

---

## Acceptance Criteria

### AC 11.1: Task Definition File
- [ ] Create `.aios-core/development/tasks/create-service.md`
- [ ] Follow AIOS task format with:
  - Task metadata (id, agent, description)
  - Inputs specification with validation
  - Outputs specification
  - Steps with clear instructions
  - Elicitation points

### AC 11.2: Input Validation
- [ ] Validate `service_name`:
  - Required: true
  - Pattern: `^[a-z][a-z0-9-]*$` (kebab-case)
  - Unique check: No existing service with same name
- [ ] Validate `service_type`:
  - Enum: ["api-integration", "utility", "agent-tool"]
  - Required: true
- [ ] Validate `has_auth`:
  - Type: boolean
  - Default: false

### AC 11.3: Template Generation
- [ ] Use templates from WIS-10 (`service-template/`)
- [ ] Replace all Handlebars placeholders:
  - `{{serviceName}}` - kebab-case
  - `{{pascalCase serviceName}}` - PascalCase
  - `{{description}}` - from elicitation
  - `{{isApiIntegration}}` - based on service_type
  - `{{hasAuth}}` - from input
- [ ] Generate to `.aios-core/infrastructure/services/{service_name}/`

### AC 11.4: Elicitation Flow
- [ ] Implement interactive prompts:
  ```
  1. "What is the service name?" (text, kebab-case validation)
  2. "What type of service?" (choice: api-integration, utility, agent-tool)
  3. "Does it require authentication?" (yes/no)
  4. "Brief description of the service:" (text)
  5. "What environment variables are needed?" (list)
  ```

### AC 11.5: Post-Generation Steps
- [ ] Run `npm install` in generated directory
- [ ] Run initial TypeScript build
- [ ] Run tests to verify setup
- [ ] Output success message with next steps

### AC 11.6: Agent Integration
- [ ] Add `create-service` to @dev agent commands
- [ ] Add task reference to @dev dependencies
- [ ] Run ide-sync to update Claude Code

---

## Tasks / Subtasks

- [ ] **Task 1: Create Task Definition** (AC: 11.1)
  - [ ] Create `.aios-core/development/tasks/create-service.md`
  - [ ] Define task metadata
  - [ ] Document inputs/outputs

- [ ] **Task 2: Implement Input Validation** (AC: 11.2)
  - [ ] Add regex validation for service_name
  - [ ] Add enum validation for service_type
  - [ ] Add uniqueness check logic

- [ ] **Task 3: Implement Template Generation** (AC: 11.3)
  - [ ] Load templates from service-template/
  - [ ] Implement placeholder replacement
  - [ ] Write generated files to target directory

- [ ] **Task 4: Implement Elicitation** (AC: 11.4)
  - [ ] Define elicitation questions
  - [ ] Add validation for each response
  - [ ] Handle cancel/abort flow

- [ ] **Task 5: Post-Generation** (AC: 11.5)
  - [ ] Add npm install step
  - [ ] Add build verification
  - [ ] Add test execution
  - [ ] Format success output

- [ ] **Task 6: Agent Integration** (AC: 11.6)
  - [ ] Update @dev agent definition
  - [ ] Add to commands list
  - [ ] Run ide-sync

---

## Dev Notes

### Task File Format

```yaml
task: create-service
agent: "@dev"
description: Create a new service using standardized template

inputs:
  - name: service_name
    type: string
    required: true
    pattern: "^[a-z][a-z0-9-]*$"
  - name: service_type
    type: enum
    options: ["api-integration", "utility", "agent-tool"]
  - name: has_auth
    type: boolean
    default: false

outputs:
  - name: service_directory
    type: directory
    location: ".aios-core/infrastructure/services/{service_name}/"

elicit: true
```

### Error Handling

| Error | Resolution |
|-------|------------|
| Service name exists | Prompt for different name |
| Template not found | Error: "WIS-10 templates required" |
| npm install fails | Warning, continue without deps |
| Build fails | Warning, show errors, continue |

---

## Testing

**Test Location:** Manual testing with example service
**Validation:**
1. Run `*create-service` with @dev
2. Verify all files generated
3. Verify TypeScript compiles
4. Verify tests pass

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-23 | @sm (River) | Initial draft from WIS-9 investigation |
