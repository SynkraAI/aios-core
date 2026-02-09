# Session Handoff

<!--
TASK: session-handoff
VERSION: 1.0.0
CREATED: 2026-02-09
AUTHOR: Orion (AIOS Master)
-->

---
task: sessionHandoff()
responsável: "Orion (Orchestrator)"
responsavel_type: Agente
atomic_layer: Strategy
tools: []
checklists: []
---

## Task Definition

```yaml
name: session-handoff
description: |
  Creates a structured session handoff document that captures the complete
  state of work for seamless continuation in a fresh session.

  This REPLACES autocompact. Instead of degrading context through compression,
  we create a clean handoff document and start fresh with full context capacity.

  Philosophy: Fresh sessions don't lose context. They lose noise.

inputs:
  - name: topic
    type: string
    required: true
    description: "Short title describing the work being handed off"
  - name: project
    type: string
    required: false
    description: "Project name (auto-detected from git if omitted)"
  - name: force
    type: boolean
    required: false
    default: false
    description: "Force handoff even below 70% budget usage"

outputs:
  - name: handoff_file
    type: string
    description: "Path to the created handoff document"
  - name: budget_status
    type: object
    description: "Current context budget utilization metrics"
  - name: success
    type: boolean
    description: "Whether handoff was successfully created"
```

## Pre-Conditions

- [ ] Current session has meaningful work to hand off
- [ ] Git status is clean OR uncommitted changes are documented
- [ ] No critical operation is mid-execution (e.g., migration, deployment)

## Execution Modes

### YOLO Mode (0-1 prompts)
Auto-generate handoff from git log, modified files, and session context. Write directly.

### Interactive Mode (3-5 prompts)
1. Confirm topic and scope
2. Review completed items (from git log)
3. Review pending items and blockers
4. Confirm next steps
5. Output handoff document

## Instructions

### Phase 1: Context Gathering

1. **Detect project context:**
   - Read current git branch, recent commits (last 10)
   - Read `.aios/status.json` if exists (story progress)
   - Read `.aios/session-state.json` if exists (agent sequence)
   - Identify modified but uncommitted files

2. **Assess budget status:**
   - Check current context utilization
   - If below 70%: note "early handoff" (user-initiated or preventive)
   - If 70-85%: note "recommended handoff window"
   - If 85-95%: note "urgent handoff — quality at risk"
   - If 95%+: note "emergency handoff — immediate action required"

### Phase 2: Document Assembly

3. **Build handoff using template** (`handoff-tmpl.md`):

   **Header:**
   - Topic, date, project name
   - Budget status at time of handoff
   - Branch name and last commit hash

   **Completed section:**
   - List all tasks completed this session
   - Include commit references where available
   - Note any tests written/passing

   **Pending section:**
   - List tasks that remain incomplete
   - Mark blockers for each (if any)
   - Include status: `ready` | `blocked` | `needs-clarification`

   **Blockers section:**
   - External dependencies not met
   - Technical issues discovered
   - Decisions needed from user/team

   **Next Steps section:**
   - Prioritized ordered list
   - Start with unblocked items
   - Include estimated complexity (S/M/L)

   **Context for Next Session:**
   - Architecture decisions made
   - Patterns established or changed
   - Files that are critical to understand
   - Any temporary workarounds in place
   - Test status summary

### Phase 3: Storage & Finalization

4. **Save handoff document:**
   - Location: `.aios/handoffs/handoff-{YYYY-MM-DD}-{HHMMSS}.md`
   - Also update `.aios/handoffs/LATEST.md` (symlink/copy to most recent)

5. **Update session state:**
   - Mark session as "handed-off" in `.aios/session-state.json`
   - Record handoff file path

6. **Output summary:**
   - Print handoff file path
   - Print budget status
   - Print "Ready for fresh session" confirmation

## Post-Conditions

- [ ] Handoff document exists at expected path
- [ ] LATEST.md points to the new handoff
- [ ] All completed work has commit references
- [ ] No critical context is missing from handoff
- [ ] Session state updated

## Acceptance Criteria

- Handoff document follows template structure exactly
- All git-referenced work has valid commit hashes
- Pending items have clear status markers
- Next session can resume without asking "what was I doing?"

## Error Handling

```yaml
strategy: graceful-degradation
errors:
  - error: "No git repository detected"
    resolution: "Create handoff without commit references, note in header"
  - error: "No meaningful work to hand off"
    resolution: "Create minimal handoff with context notes only"
  - error: "Cannot write to .aios/handoffs/"
    resolution: "Output handoff to stdout, let user save manually"
```

## Performance

```yaml
expected_duration: "30-60 seconds"
expected_tokens: "500-2000"
```

## Metadata

```yaml
version: 1.0.0
tags: [session, handoff, context, budget, continuity]
updated_at: "2026-02-09"
dependencies:
  templates: [handoff-tmpl.md]
  scripts: [budget-awareness.js, handoff-manager.js]
```

---
*AIOS Task v1.0 — Session Handoff System*
