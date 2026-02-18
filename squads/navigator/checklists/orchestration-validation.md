# Orchestration Validation Checklist

Use this checklist to validate agent orchestration setup and execution.

---

## Pre-Orchestration Setup

- [ ] Roadmap exists and is validated (see roadmap-validation.md)
- [ ] All required agents exist in `.aios-core/development/agents/`
- [ ] Agent commands are executable
- [ ] Dependencies installed (`npm install` completed)
- [ ] Git repository is clean (no uncommitted changes)

---

## Agent Availability

### Core Agents

- [ ] `@pm` (Morgan) - Product Management
- [ ] `@po` (Pax) - Product Owner
- [ ] `@architect` (Aria) - Architecture
- [ ] `@dev` (Dex) - Development
- [ ] `@qa` (Quinn) - Quality Assurance
- [ ] `@devops` (Gage) - DevOps
- [ ] `@sm` (River) - Scrum Master

### Specialized Agents (if needed)

- [ ] `@analyst` (Alex) - Analysis
- [ ] `@data-engineer` (Dara) - Database
- [ ] `@ux-design-expert` (Uma) - UX/UI

---

## Phase-to-Agent Mapping

- [ ] Each phase assigned to appropriate agent
- [ ] Agent capabilities match phase requirements
- [ ] No agent overload (balanced workload)
- [ ] Handoffs between agents are logical
- [ ] Command execution tested for each phase

---

## Dependency Resolution

### Input/Output Chain

- [ ] Phase 1 inputs are available (user-provided or existing files)
- [ ] Each phase's outputs feed next phase's inputs
- [ ] No missing intermediate files
- [ ] File paths are absolute or properly resolved
- [ ] Wildcard patterns match expected files

### Agent Dependencies

- [ ] No circular agent dependencies
- [ ] Agent execution order follows DAG (Directed Acyclic Graph)
- [ ] Parallel execution opportunities identified
- [ ] Blocking dependencies documented

---

## Transition Rules Validation

### Auto-Advance Conditions

- [ ] Conditions are programmatically testable
- [ ] File existence checks use correct paths
- [ ] Status parsing handles edge cases
- [ ] Boolean logic is correct (AND/OR/NOT)

### Blocked Transitions

- [ ] Blocking conditions clearly defined
- [ ] Unblocking actions documented
- [ ] Manual intervention requirements specified
- [ ] Notification system in place (if applicable)

### Loop Transitions

- [ ] Loop conditions prevent infinite loops
- [ ] Max iterations configured
- [ ] Exit conditions testable
- [ ] Loop-back phase is earlier in sequence

---

## Command Execution

### Command Format

- [ ] Commands use `*prefix` format (e.g., `*create-prd`)
- [ ] Commands exist in agent's task list
- [ ] Command parameters documented
- [ ] Return values specified

### Execution Environment

- [ ] Environment variables set correctly
- [ ] Working directory is project root
- [ ] Permissions sufficient for file operations
- [ ] Network access available (if needed)

---

## Orchestrator Script

- [ ] `orchestrator.js` exists at `squads/navigator/scripts/navigator/orchestrator.js`
- [ ] Script has execute permissions
- [ ] Script parses roadmap correctly
- [ ] Script delegates to correct agents
- [ ] Script handles errors gracefully

### Orchestrator Functions

- [ ] `detectCurrentPhase()` returns correct phase
- [ ] `getNextAgent()` selects appropriate agent
- [ ] `executePhase()` calls agent command
- [ ] `checkTransitionRules()` evaluates conditions
- [ ] `handleBlocked()` manages blockers

---

## Multi-Chat Orchestration (Optional)

### Wave Configuration

- [ ] Stories grouped into dependency waves
- [ ] Wave 1 has no dependencies (can start immediately)
- [ ] Wave 2 depends only on Wave 1
- [ ] Wave 3 depends on Wave 2 or earlier

### Chat Assignments

- [ ] Chat 1: Coordinator (@sm)
- [ ] Chat 2: Dev Wave 1 (parallel stories)
- [ ] Chat 3: Dev Wave 2 (depends on Wave 1)
- [ ] Chat 4: Dev Wave 3 (depends on Wave 2)

### Coordination

- [ ] Coordinator reviews wave completions
- [ ] Conflict resolution process defined
- [ ] Final merge strategy documented
- [ ] Communication channels established

---

## Error Handling

### Expected Errors

- [ ] Missing input files → Clear error message
- [ ] Invalid phase transition → Halt with explanation
- [ ] Agent command failure → Log and notify
- [ ] Circular dependency → Detect and abort

### Recovery Procedures

- [ ] Rollback to previous checkpoint
- [ ] Manual intervention steps documented
- [ ] Retry strategy for transient failures
- [ ] Escalation path for critical errors

---

## Progress Tracking

### Checkpoints

- [ ] Checkpoint created after each phase completion
- [ ] Checkpoint chain is continuous
- [ ] Latest checkpoint reflects current state
- [ ] Recovery from checkpoint tested

### Status Reporting

- [ ] `*where-am-i` command returns current phase
- [ ] Completion percentage calculated correctly
- [ ] Blockers identified and listed
- [ ] Next steps suggested

---

## Performance Validation

- [ ] Phase execution time reasonable (no hangs)
- [ ] Parallel execution utilized where possible
- [ ] No redundant file operations
- [ ] Memory usage acceptable
- [ ] Disk I/O optimized

---

## Integration Tests

### End-to-End Flow

- [ ] Full pipeline executes from Phase 1 to completion
- [ ] All agents invoked correctly
- [ ] All outputs generated
- [ ] Final deliverables meet acceptance criteria

### Edge Cases

- [ ] Empty inputs handled gracefully
- [ ] Malformed roadmap detected
- [ ] Missing agent handled with error
- [ ] Phase skip works correctly

---

## Workflow Integration

### Workflow Files

- [ ] `wf-new-project-setup.yaml` executes successfully
- [ ] `wf-resume-work.yaml` resumes from checkpoint
- [ ] `wf-multi-chat-orchestration.yaml` generates prompts correctly

### Workflow Steps

- [ ] All steps have valid executors
- [ ] Manual steps have clear instructions
- [ ] Automated steps complete without intervention
- [ ] Completion messages are informative

---

## Security & Permissions

- [ ] Agent permissions follow least-privilege principle
- [ ] No unauthorized file access
- [ ] No execution of untrusted code
- [ ] Secrets managed securely (not in roadmap)

---

## Documentation

- [ ] Orchestration flow documented in README.md
- [ ] Phase descriptions are clear
- [ ] Agent responsibilities documented
- [ ] Troubleshooting guide available

---

## Pre-Production Checks

- [ ] Dry-run executed successfully
- [ ] All stakeholders aware of orchestration plan
- [ ] Rollback procedure tested
- [ ] Monitoring/logging configured

---

## Post-Orchestration Verification

- [ ] All phases completed
- [ ] All outputs exist and are valid
- [ ] Quality gates passed
- [ ] Final checkpoint created
- [ ] Team notified of completion

---

## Sign-Off

- [ ] Orchestration plan approved by tech lead
- [ ] Agent assignments confirmed
- [ ] Execution timeline agreed upon
- [ ] Ready for production orchestration

---

**Validation Date:** _______________

**Validated By:** _______________

**Project Name:** _______________

**Roadmap Version:** _______________

**Notes:**

---

*Navigator Squad - Orchestration Validation Checklist v1.0*
