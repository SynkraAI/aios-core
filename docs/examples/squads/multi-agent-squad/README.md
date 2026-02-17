# Multi-Agent Squad Example

Demonstrates how to create a squad with multiple collaborating agents.

## Structure

```
multi-agent-squad/
├── squad.yaml
├── README.md
├── agents/
│   ├── lead-agent.md       # Coordinator
│   ├── researcher-agent.md  # Research specialist
│   └── writer-agent.md      # Content creator
└── tasks/
    ├── research-topic.md    # Research workflow
    └── write-report.md      # Writing workflow
```

## Usage

```bash
@squad-creator
*load-squad ./docs/examples/squads/multi-agent-squad

# Use the lead agent to coordinate
@team-lead
*coordinate "Create a report on AI trends"

# Or use specialists directly
@team-researcher
*find "AI trends 2025"

@team-writer
*draft "AI Trends Report"
```

## Collaboration Pattern

```
┌──────────────┐
│  @team-lead  │  ← Coordinates workflow
└──────┬───────┘
       │
   ┌───┴───┐
   ▼       ▼
┌──────┐ ┌──────┐
│Research│ │Writer│  ← Specialists execute
└──────┘ └──────┘
```

## What This Demonstrates

1. **Multiple agents** - Team with specialized roles
2. **Agent coordination** - Lead delegates to specialists
3. **Task handoff** - Research output feeds into writing
4. **Collaboration patterns** - How agents work together

See [Squad Development Guide](../../../guides/squads-guide.md) for details.
