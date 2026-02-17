---
task: Write Report
responsavel: "@team-writer"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - topic: Report topic (required)
  - findings: Research findings (from @team-researcher)
  - format: markdown | html | pdf (default: markdown)
Saida: |
  - report: Generated report content
  - file_path: Path to saved report (optional)
Checklist:
  - "[ ] Review findings"
  - "[ ] Create outline"
  - "[ ] Write draft"
  - "[ ] Format output"
---

# *report / *draft

Create a report from research findings.

## Usage

```
@team-writer
*draft "AI trends 2025"
*report "climate change" --format html
```

## Process

1. Receive topic and findings
2. Create document outline
3. Write content sections
4. Apply formatting
5. Return final report

## Output Format

```markdown
# Report: AI Trends 2025

## Executive Summary
...

## Key Findings
...

## Conclusion
...

## Sources
...
```
