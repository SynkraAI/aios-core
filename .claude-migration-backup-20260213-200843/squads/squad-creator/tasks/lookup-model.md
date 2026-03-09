# Task: lookup-model

**Command:** `*lookup-model <task-name>`
**Execution Type:** Worker (deterministic, no LLM needed)

## Purpose

Look up the recommended model tier for a Squad Creator task before execution.
Returns: `haiku`, `sonnet`, or `opus`.

## Usage

```bash
# In Squad Chief or any workflow
model=$(lookup-model "create-agent.md")
# Returns: opus

model=$(lookup-model "validate-squad.md")
# Returns: haiku
```

## Workflow

### Step 1: Load Config

Read `config/model-routing.yaml`

### Step 2: Lookup Task

```yaml
task_name: "{input}"
config: model-routing.yaml

lookup:
  path: tasks.{task_name}.tier
  default: opus  # Conservative default
```

### Step 3: Return Result

```yaml
output:
  task: "{task_name}"
  tier: "{haiku|sonnet|opus}"
  confidence: "{high|medium|low}"
  reason: "{why this tier}"
```

## Quick Reference

| Tier | Tasks Count | Use For |
|------|-------------|---------|
| **haiku** | 13 | Validation, scoring, admin |
| **sonnet** | 17 | Documentation, templates, moderate analysis |
| **opus** | 12 | DNA extraction, agent creation, research |

## Integration with Task Tool

When spawning agents, use the tier as model parameter:

```python
# Pseudo-code for Squad Chief
task = "validate-squad.md"
tier = lookup_model(task)  # Returns "haiku"

Task(
  subagent_type="general-purpose",
  model=tier,  # "haiku"
  prompt="Execute validation..."
)
```

## Completion Criteria

- [ ] Task name provided
- [ ] Config loaded
- [ ] Tier returned
- [ ] If task not found, return "opus" (safe default)
