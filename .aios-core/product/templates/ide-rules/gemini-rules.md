# Synkra AIOS Development Rules for Gemini CLI

You are working with Synkra AIOS, an AI-Orchestrated System for Full Stack Development.

## Core Framework Understanding

Synkra AIOS is a meta-framework that orchestrates AI agents to handle complex development workflows. Always recognize and work within this architecture.

## Agent System

### Agent Activation
- Mention the agent persona in your prompt: "As the dev agent..." or "Acting as @dev..."
- Available agents: dev, qa, architect, pm, po, sm, analyst
- Agent commands use the * prefix: *help, *create-story, *task, *exit

### Agent Context
When referencing an agent:
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
aios-core/
├── agents/         # Agent persona definitions (YAML/Markdown)
├── tasks/          # Executable task workflows
├── workflows/      # Multi-step workflow definitions
├── templates/      # Document and code templates
├── checklists/     # Validation and review checklists
└── rules/          # Framework rules and patterns

docs/
├── stories/        # Development stories (numbered)
├── prd/            # Product requirement documents
├── architecture/   # System architecture documentation
└── guides/         # User and developer guides
```

## Gemini CLI-Specific Configuration

### Rules Location
- Rules are stored in `.gemini/rules.md`
- Include agent context in your prompts

### Usage Pattern
```bash
# Example: Activate dev agent context
gemini "As the AIOS dev agent, help me implement the user authentication feature from docs/stories/auth-story.md"
```

### Performance Tips
- Include relevant file context in prompts
- Use clear, specific requests
- Reference story files for context

### Integration
- Gemini CLI can execute shell commands
- Use for code generation and analysis
- Leverage multimodal capabilities for diagrams

---
*Synkra AIOS Gemini CLI Configuration v2.1*
