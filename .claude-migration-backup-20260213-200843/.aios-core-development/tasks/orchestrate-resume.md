---
title: Orchestrate Resume
description: Resume orchestrator execution from saved state
agent: aios-master
version: 1.0.0
story: '0.9'
epic: '0'
---

# \*orchestrate-resume Command

Resumes orchestrator execution from the last saved state.

## Usage

```
*orchestrate-resume {story-id}
```

## Examples

```bash
# Resume STORY-42 from where it stopped
*orchestrate-resume STORY-42
```

## Output

```
🔄 Resuming orchestrator for STORY-42...

Loading state from: .aios/master-orchestrator/STORY-42.json

Previous state:
  Status: stopped
  Last Epic: 4 (Execution Engine)
  Progress: 45%
  Stopped at: 2026-01-29 11:30:00

Resuming from Epic 4...

⏳ Continuing Epic 4: Execution Engine
...
```

## Behavior

1. Loads saved state from `.aios/master-orchestrator/{story-id}.json`
2. Validates state is resumable (not completed, not corrupted)
3. Restores orchestrator to previous state
4. Continues execution from last completed epic
5. Updates dashboard status to "in_progress"

## Exit Codes

- 0: Success
- 1: No saved state found
- 2: State is not resumable (completed or corrupted)
- 3: Invalid arguments
