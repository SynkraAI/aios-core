# Command Authority Matrix

This matrix defines primary command ownership across AIOS agents to avoid overlap and conflicting execution.

| Capability | Primary Agent | Delegation Notes |
|---|---|---|
| Story drafting/refinement | `@sm` | `@po` delegates story creation and sprint ceremony orchestration |
| Backlog prioritization | `@po` | `@sm` and `@pm` can propose changes |
| PRD and strategy | `@pm` | `@po` consumes and operationalizes |
| Architecture design | `@architect` | delegates data-deep work to `@data-engineer` |
| Implementation | `@dev` | receives validated stories/specs |
| Quality gates and review | `@qa` | advisory gate decisions, fix requests to `@dev` |
| Git push / PR / release | `@devops` | exclusive authority for remote git operations |
| Cross-agent orchestration | `@aios-master` | escalation point for course correction |

## Escalation Rule

If command ownership is ambiguous, escalate to `@aios-master` before executing remote-impact operations.
