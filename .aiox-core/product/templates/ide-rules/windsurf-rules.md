# Synkra AIOS Development Rules for Windsurf

## AIOS Agent Integration

When working with AIOS agents in Windsurf:
- Use `@agent-name` to activate specific agents (e.g., `@dev`, `@qa`, `@architect`)
- Agent commands always start with `*` (e.g., `*help`, `*create-story`)
- Follow the agent's specific workflow and commands

## Development Workflow

### Story-Driven Development
1. Stories are your primary work units - always reference the current story
2. Update story checkboxes as you complete tasks
3. Keep the File List section updated with all changes
4. Follow the story's acceptance criteria exactly

### Code Standards
- Write clean, self-documenting code
- Follow existing patterns in the codebase
- Add comprehensive error handling
- Include unit tests for new functionality

### Testing Requirements
- Run tests before marking any task complete
- Use `npm test` or equivalent for your tech stack
- Ensure all tests pass before updating story status
- Add new tests for new functionality

### Documentation
- Update relevant documentation when changing functionality
- Keep README files current
- Document complex logic with clear comments
- Update API documentation for endpoint changes

## AIOS-Specific Patterns

### Working with Workflows
- Workflows are in `aios-core/workflows/`
- Tasks are in `aios-core/tasks/`
- Follow YAML frontmatter conventions
- Use elicit: true for interactive workflows

### Agent Commands
Common commands across agents:
- `*help` - Show available commands
- `*exit` - Exit current agent
- `*task {name}` - Execute specific task
- `*create-doc {template}` - Create document from template

### File Organization
```
project/
├── aios-core/          # AIOS framework files
│   ├── agents/         # Agent definitions
│   ├── tasks/          # Executable tasks
│   ├── workflows/      # Workflow definitions
│   └── templates/      # Document templates
├── docs/               # Project documentation
│   ├── stories/        # Development stories
│   └── architecture/   # Architecture docs
└── src/                # Your source code
```

## Best Practices

1. **Always backup before major changes**
2. **Test in isolation before integration**
3. **Follow the story acceptance criteria**
4. **Update documentation as you code**
5. **Communicate blockers immediately**

## GitHub Integration
- Ensure GitHub CLI is installed: `gh --version`
- Authenticate before pushing: `gh auth status`
- Follow conventional commit messages
- Reference story IDs in commits

---
*Synkra AIOS Configuration v1.0* 