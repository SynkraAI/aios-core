# Ralph Squad - Coding Standards

Extends AIOS core coding standards.

## Squad-Specific Standards

### Scripts
- All scripts must be executable via CLI (`node script.js <command> [args]`)
- All scripts must export functions for programmatic use
- Use JSON output for CLI responses (parseable by other scripts)
- Include usage help when called without arguments

### State Files
- Use YAML format for human-readable state (ralph-state.yaml, ralph-config.yaml)
- Use Markdown for accumulated data (progress.md, decision-log.md)
- Always include timestamps in state updates

### Task Delegation
- Never execute tasks directly in the orchestrator
- Always delegate via Task tool for context-fresh execution
- Include full context in the delegation prompt (task + learnings + agent instructions)

### Error Handling
- Log all errors to progress.md
- Retry failed tasks once before marking as failed
- Save state before any potentially destructive operation
