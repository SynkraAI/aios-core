# Synkra AIOS Development Rules for Gemini CLI

You are working with Synkra AIOS, an AI-Orchestrated System for Full Stack Development.

## Core Framework Understanding

Synkra AIOS is a meta-framework that orchestrates AI agents to handle complex development workflows. Always recognize and work within this architecture.

## Agent System

### Agent Activation
- Agents are activated with @agent-name syntax: @dev, @qa, @architect, @pm, @po, @sm, @analyst
- The master agent is activated with @aios-master
- Agent commands use the * prefix: *help, *create-story, *task, *exit

### Agent Context
When an agent is active:
- Follow that agent's specific persona and expertise
- Use the agent's designated workflow patterns
- Maintain the agent's perspective throughout the interaction

### Available Agents

| Agent | Persona | Primary Role |
|-------|---------|--------------|
| @dev | Dex | Code implementation |
| @qa | Quinn | Testing and quality |
| @architect | Aria | System architecture |
| @pm | Morgan | Product management |
| @po | Pax | Product ownership |
| @sm | River | Scrum master |
| @analyst | Alex | Research and analysis |
| @data-engineer | Dara | Database design |
| @ux-design-expert | Uma | UX/UI design |
| @devops | Gage | CI/CD and deployment |

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
aios-core/
├── .aios-core/
│   ├── core/           # Framework core modules
│   ├── development/
│   │   ├── agents/     # Agent definitions
│   │   ├── tasks/      # Executable tasks
│   │   ├── workflows/  # Workflow definitions
│   │   └── templates/  # Document templates
│   └── infrastructure/ # Integrations and adapters
├── docs/
│   ├── stories/        # Development stories
│   ├── prd/            # Product requirements
│   └── architecture/   # Architecture docs
└── src/                # Source code
```

## Gemini CLI Specific Configuration

### Skills Integration
AIOS agents are installed as Gemini CLI skills in `.gemini/rules/AIOS/agents/`.
Skills use the same format as Claude Code - they are fully compatible.

To activate an agent skill:
```
@dev help me implement this feature
@architect design the system architecture
```

### Hooks Configuration
AIOS can integrate with Gemini CLI hooks for enhanced context injection.

Configure in `.gemini/settings.json`:
```json
{
  "hooks": {
    "BeforeAgent": [{
      "matcher": "*",
      "hooks": [{
        "name": "aios-context",
        "type": "command",
        "command": "node .aios-core/hooks/gemini/before-agent.js"
      }]
    }]
  }
}
```

### Gemini CLI Lifecycle Events
Hooks can intercept these events:
- `SessionStart` - Load AIOS context
- `BeforeAgent` - Inject gotchas and patterns
- `BeforeTool` - Security validation
- `AfterTool` - Audit logging
- `SessionEnd` - Persist state

### Extensions
AIOS can be packaged as a Gemini CLI extension for easy installation:
```bash
gemini extensions install github.com/synkra/aios-gemini-extension
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
  throw new Error(`Failed to ${operation}: ${error.message}`);
}
```

## Git & GitHub Integration

### Commit Conventions
- Use conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, etc.
- Reference story ID: `feat: implement feature [Story 2.1]`
- Keep commits atomic and focused

### Push Authority
**Only @devops agent can push to remote.** Other agents should prepare changes and hand off to @devops.

## Gemini CLI Commands

### AIOS Agent Commands
- `*help` - Show available commands
- `*create-story` - Create new story
- `*task {name}` - Execute specific task
- `*workflow {name}` - Run workflow
- `*exit` - Exit agent mode

### Useful Gemini CLI Commands
- `/settings` - Configure Gemini CLI
- `/hooks panel` - View active hooks
- `/extensions list` - List installed extensions
- `/rewind` - Revert to previous state

## Model Selection

Gemini CLI supports multiple models:
- **Gemini 3 Flash** - Fast, cost-effective for simple tasks
- **Gemini 3 Pro** - High quality for complex reasoning

Enable preview features in `/settings` to access latest models.

## Development Commands

```bash
npm run dev       # Start development
npm test          # Run tests
npm run lint      # Check code style
npm run typecheck # Verify types
npm run build     # Build project
```

## Debugging

### Enable Debug Mode
```bash
export AIOS_DEBUG=true
```

### View Agent Logs
```bash
tail -f .aios/logs/agent.log
```

## Performance Optimization

- Use parallel tool execution when possible
- Leverage Gemini's JSON output mode for structured responses
- Cache frequently accessed data during sessions
- Use `--output-format json` for programmatic integration

## Error Recovery

- Use `/rewind` to revert mistakes
- Always provide recovery suggestions for failures
- Include error context in messages
- Document any manual fixes required

---
*Synkra AIOS Gemini CLI Configuration v1.0*
