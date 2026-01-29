# Synkra AIOS Development Rules for Opencode (aios-core)

You are working with Synkra AIOS, an AI-Orchestrated System for Full Stack Development. This file defines the master guidelines for your operation in this project via OpenCode.

## 🎯 Project Context

**Installation Mode:** Node.js/NPM (Brownfield)

**Description:** Synkra AIOS: AI-Orchestrated System for Full Stack Development - Core Framework



### Available AIOS Agents

- **@aios-master**: AIOS Master Orchestrator & Framework Developer - Use when you need comprehensive expertise across all domains, framework component creation/modification, workflow orchestration, or running tasks that don't require a specialized persona.
- **@analyst**: Business Analyst - Use for market research, competitive analysis, user research, brainstorming session facilitation, structured ideation workshops, feasibility studies, industry trends analysis, project discovery (brownfield documentation), and research report creation.

NOT for: PRD creation or product strategy → Use @pm. Technical architecture decisions or technology selection → Use @architect. Story creation or sprint planning → Use @sm.

- **@architect**: Architect - Use for system architecture (fullstack, backend, frontend, infrastructure), technology stack selection (technical evaluation), API design (REST/GraphQL/tRPC/WebSocket), security architecture, performance optimization, deployment strategy, and cross-cutting concerns (logging, monitoring, error handling).

NOT for: Market research or competitive analysis → Use @analyst. PRD creation or product strategy → Use @pm. Database schema design or query optimization → Use @data-engineer.

- **@data-engineer**: Database Architect & Operations Engineer - Use for database design, schema architecture, Supabase configuration, RLS policies, migrations, query optimization, data modeling, operations, and monitoring
- **@dev**: Full Stack Developer - Use for code implementation, debugging, refactoring, and development best practices
- **@devops**: GitHub Repository Manager & DevOps Specialist - Use for repository operations, version management, CI/CD, quality gates, and GitHub push operations. ONLY agent authorized to push to remote repository.
- **@pm**: Product Manager - Use for PRD creation (greenfield and brownfield), epic creation and management, product strategy and vision, feature prioritization (MoSCoW, RICE), roadmap planning, business case development, go/no-go decisions, scope definition, success metrics, and stakeholder communication.

Epic/Story Delegation (Gate 1 Decision): PM creates epic structure, then delegates story creation to @sm.

NOT for: Market research or competitive analysis → Use @analyst. Technical architecture design or technology selection → Use @architect. Detailed user story creation → Use @sm (PM creates epics, SM creates stories). Implementation work → Use @dev.

- **@po**: Product Owner - Use for backlog management, story refinement, acceptance criteria, sprint planning, and prioritization decisions
- **@qa**: Test Architect & Quality Advisor - Use for comprehensive test architecture review, quality gate decisions, and code improvement. Provides thorough analysis including requirements traceability, risk assessment, and test strategy. Advisory only - teams choose their quality bar.
- **@sm**: Scrum Master - Use for user story creation from PRD, story validation and completeness checking, acceptance criteria definition, story refinement, sprint planning, backlog grooming, retrospectives, daily standup facilitation, and local branch management (create/switch/list/delete local branches, local merges).

Epic/Story Delegation (Gate 1 Decision): PM creates epic structure, SM creates detailed user stories from that epic.

NOT for: PRD creation or epic structure → Use @pm. Market research or competitive analysis → Use @analyst. Technical architecture design → Use @architect. Implementation work → Use @dev. Remote Git operations (push, create PR, merge PR, delete remote branches) → Use @github-devops.

- **@squad-creator**: Squad Creator - Use to create, validate, publish and manage squads
- **@ux-design-expert**: UX/UI Designer & Design System Architect - Complete design workflow - user research, wireframes, design systems, token extraction, component building, and quality assurance


## Core Framework Understanding

Synkra AIOS is a meta-framework that orchestrates AI agents to handle complex development workflows. Always recognize and work within this architecture.

## Agent System

### OpenCode Primary Agents (Build & Plan)

- **Primary Agents** (Build/Plan) should delegate specialized work to the **AIOS Squad** via `@agent-name`.
- Use `@aios-master` for high-level framework operations, task orchestration, and workflow planning.
- Use `@dev` for complex code implementations that follow AIOS standards.
- Use `@architect` for system design decisions.
- Use `@qa` for technical reviews and quality gate validation.

### AIOS Agent Activation

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

_Gerado por Synkra AIOS v2.1.0 em 2026-01-29 00:04:10_
