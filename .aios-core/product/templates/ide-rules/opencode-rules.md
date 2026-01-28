# AGENTS.md - {{projectName}}

You are working with Synkra AIOS, an AI-Orchestrated System for Full Stack Development. This file defines the master guidelines for your operation in this project via OpenCode.

## 🎯 Project Context

**Installation Mode:** {{projectType}}
{{projectContext}}

## Core Framework Understanding

Synkra AIOS is a meta-framework that orchestrates AI agents to handle complex development workflows. Always recognize and work within this architecture.

## Agent System

### Agent Activation

- Agents are activated with @agent-name syntax: @dev, @qa, @architect, @pm, @po, @sm, @analyst
- The master agent is activated with @aios-master
- Agent commands use the * prefix: *help, *create-story, *task, \*exit

### Agent Context

When an agent is active:

- Follow that agent's specific persona and expertise
- Use the agent's designated workflow patterns
- Maintain the agent's perspective throughout the interaction

## Development Methodology

### Story-Driven Development

1. **Work from stories** - All development starts with a story in `docs/stories/`
2. **Update progress** - Mark checkboxes as tasks complete: [ ] → [x]
3. **Track changes** - Maintain the File List section in the story
4. **Follow criteria** - Implement exactly what the acceptance criteria specify

### Code Standards

- Write clean, self-documenting code
- Follow existing patterns in the codebase
- Include comprehensive error handling
- Add unit tests for all new functionality
- Use TypeScript/JavaScript best practices

### Testing Requirements

- Run all tests before marking tasks complete
- Ensure linting passes: `npm run lint`
- Verify type checking: `npm run typecheck`
- Add tests for new features
- Test edge cases and error scenarios

## AIOS Framework Structure

```
.opencode/
├── agents/         # Agent persona definitions (Synced from .aios-core)
├── skills/         # Executable task workflows (Synced from .aios-core)
├── rules/          # Framework rules and patterns
└── tools/          # Custom AIOS tool wrappers

docs/
├── stories/        # Development stories (numbered)
├── prd/            # Product requirement documents
├── architecture/   # System architecture documentation
└── guides/         # User and developer guides
```

## Workflow Execution

### Task Execution Pattern

1. Read the complete task/workflow definition
2. Understand all elicitation points
3. Execute steps sequentially
4. Handle errors gracefully
5. Provide clear feedback

### Interactive Workflows

- Workflows with `elicit: true` require user input
- Present options clearly
- Validate user responses
- Provide helpful defaults

## Best Practices

### When implementing features:

- Check existing patterns first
- Reuse components and utilities
- Follow naming conventions
- Keep functions focused and testable
- Document complex logic

### When working with agents:

- Respect agent boundaries
- Use appropriate agent for each task
- Follow agent communication patterns
- Maintain agent context

### When handling errors:

```javascript
try {
  // Operation
} catch (error) {
  console.error(`Error in ${operation}:`, error);
  // Provide helpful error message
  throw new Error(`Failed to ${operation}: ${error.message}`);
}
```

## Git & GitHub Integration

### Commit Conventions

- Use conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, etc.
- Reference story ID: `feat: implement logic [Story ID]`
- Keep commits atomic and focused

### GitHub CLI Usage

- Ensure authenticated: `gh auth status`
- Use for PR creation: `gh pr create`
- Check org access: `gh api user/memberships`

## AIOS-Specific Patterns

### Working with Templates

```javascript
const template = await loadTemplate('template-name');
const rendered = await renderTemplate(template, context);
```

### Agent Command Handling (\*)

- Commands prefixados com `*` referem-se a **Skills**.
- Quando o usuário ou o fluxo de trabalho exigir um comando `*`, você DEVE usar a ferramenta nativa `skill` do OpenCode.

## OpenCode Specific Configuration

### Performance Optimization

- Prefer batched tool calls when possible for better performance
- Use parallel execution for independent operations
- Cache frequently accessed data in memory during sessions

### Tool Usage Guidelines

- Always use the Grep tool for searching, never `grep` or `rg` in bash
- Use the native `skill` tool to execute AIOS workflows (\*)
- Batch file reads/writes when processing multiple files
- Prefer editing existing files over creating new ones

### Session Management

- Track story progress throughout the session
- Update checkboxes immediately after completing tasks
- Maintain context of the current story being worked on
- Save important state before long-running operations

### Error Recovery

- Always provide recovery suggestions for failures
- Include error context in messages to user
- Suggest rollback procedures when appropriate
- Document any manual fixes required

---

_Gerado por Synkra AIOS v2.1.0 em {{timestamp}}_
