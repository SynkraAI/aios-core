---
task: Research Topic
responsavel: "@team-researcher"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - topic: Topic to research (required)
  - depth: shallow | medium | deep (default: medium)
Saida: |
  - findings: Research findings summary
  - sources: List of sources consulted
Checklist:
  - "[ ] Understand topic scope"
  - "[ ] Gather information"
  - "[ ] Compile findings"
  - "[ ] List sources"
---

# *research / *find

Research a topic and gather relevant information.

## Usage

```
@team-researcher
*find "AI trends 2025"
*find "climate change" --depth deep
```

## Process

1. Parse topic and depth parameters
2. Search relevant sources
3. Extract key information
4. Compile findings summary
5. Return with source attribution

## Output Format

```
Research: AI trends 2025
═══════════════════════════

Key Findings:
1. Finding one...
2. Finding two...
3. Finding three...

Sources:
- Source 1
- Source 2
```
