# Synkra AIOS Development Rules for Roo Code

You are working with Synkra AIOS, an AI-Orchestrated System for Full Stack Development.

## Core Framework Understanding

Synkra AIOS is a meta-framework that orchestrates AI agents to handle complex development workflows. Always recognize and work within this architecture.

## Agent System

### Agent Activation (Roo Mode Selector)
- Use the mode selector in the status bar to switch agents
- Available modes: bmad-dev, bmad-qa, bmad-architect, bmad-pm, bmad-po, bmad-sm, bmad-analyst
- Agent commands use the * prefix: *help, *create-story, *task, *exit

### Agent Context
When an agent mode is active:
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

## Roo Code-Specific Configuration

### Mode Configuration
- Modes are defined in `.roomodes` file
- Each mode corresponds to an AIOS agent persona
- Switching modes automatically loads the appropriate context

### Available Modes
| Mode | Agent | Purpose |
|------|-------|---------|
| bmad-dev | Developer | Full-stack development |
| bmad-qa | QA | Quality assurance, testing |
| bmad-architect | Architect | System design |
| bmad-pm | PM | Project management |
| bmad-po | PO | Product ownership |
| bmad-sm | SM | Scrum facilitation |
| bmad-analyst | Analyst | Business analysis |

### Performance Tips
- Use mode-specific context for focused assistance
- Switch modes when changing task types
- Leverage auto-apply for suggested changes

---
*Synkra AIOS Roo Code Configuration v4.0.4*
