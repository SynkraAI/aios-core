---
name: aiox-handoff
description: >
  Create an AIOX agent handoff artifact when switching personas. Use on agent switch, handoff, or /aiox-handoff.
metadata:
  short-description: "AIOX workflow: aiox-handoff"
---

# AIOX Agent Handoff

When switching agents (`/aiox-*` skills), compact context into a handoff artifact.

## Write

Path: `.aiox/handoffs/handoff-{from}-to-{to}-{timestamp}.yaml`

```yaml
handoff:
  from_agent: "{id}"
  to_agent: "{id}"
  story_context:
    story_id: ""
    story_path: ""
    story_status: ""
    current_task: ""
    branch: ""
  decisions: []
  files_modified: []
  blockers: []
  next_action: ""
```

## Limits

- Max ~500 tokens, ≤5 decisions, ≤10 files, ≤3 blockers
- Discard previous agent full persona; keep only this artifact + new agent definition

Template: `.aiox-core/development/templates/agent-handoff-tmpl.yaml`

