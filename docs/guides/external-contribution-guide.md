# External Contribution Guide

**Version:** 1.0
**Last Updated:** 2025-12-30
**Story:** COLLAB-1

---

Welcome to AIOS! This guide will help you contribute to the project, whether you're adding new agents, tasks, or improving existing functionality.

## Quick Start

### 1. Fork the Repository

```bash
# Fork via GitHub UI, then clone your fork
git clone https://github.com/YOUR_USERNAME/aios-core.git
cd aios-core
```

### 2. Set Up Development Environment

```bash
# Install dependencies
npm install

# Verify setup
npm test
npm run lint
npm run typecheck
```

### 3. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

**Branch Naming Conventions:**

- `feature/` - New features or agents
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring

### 4. Make Your Changes

Follow the relevant guide below for your contribution type.

### 5. Run Local Validation

```bash
# Run all checks before pushing
npm run lint
npm run typecheck
npm test
```

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

## Contributing Agents

### Agent File Location

Agents are defined in `.aios-core/development/agents/` as Markdown files with YAML frontmatter.

### Required Agent Structure

```yaml
# File: .aios-core/development/agents/my-agent.md

agent:
  name: MyAgentName
  id: my-agent
  title: Descriptive Title
  icon: emoji
  whenToUse: 'When to activate this agent'

persona_profile:
  archetype: Builder | Analyst | Guardian | etc.
  zodiac: 'Zodiac sign (optional)'

  communication:
    tone: pragmatic | friendly | formal
    emoji_frequency: none | low | medium | high

    vocabulary:
      - term1
      - term2

    greeting_levels:
      minimal: 'Short greeting'
      named: 'Named greeting with personality'
      archetypal: 'Full archetypal greeting'

    signature_closing: 'Signature phrase'

persona:
  role: "Agent's primary role"
  style: 'Communication style'
  identity: "Agent's identity description"
  focus: 'What the agent focuses on'

core_principles:
  - Principle 1
  - Principle 2

commands:
  - name: help
    visibility: [full, quick, key]
    description: 'Show available commands'
  - name: custom-command
    visibility: [full]
    description: 'Custom command description'

dependencies:
  tasks:
    - related-task.md
  tools:
    - tool-name
```

### Agent Contribution Checklist

- [ ] Agent ID is unique and follows kebab-case
- [ ] persona_profile is complete with archetype and communication
- [ ] All commands have visibility and description
- [ ] Dependencies list all required tasks
- [ ] No hardcoded credentials or sensitive data
- [ ] Agent follows existing patterns in the codebase

### Example PR Title

```
feat(agent): add security-auditor agent with vulnerability scanning
```

---

## Contributing Tasks

### Task File Location

Tasks are defined in `.aios-core/development/tasks/` as Markdown files.

### Required Task Structure

```markdown
# Task Name

**Description:** What this task does

**Agent(s):** @dev, @qa, etc.

**Elicit:** true | false

---

## Prerequisites

- Prerequisite 1
- Prerequisite 2

## Steps

### Step 1: First Step

Description of what to do.

**Elicitation Point (if elicit: true):**

- Question to ask user
- Options to present

### Step 2: Second Step

Continue with more steps...

## Deliverables

- [ ] Deliverable 1
- [ ] Deliverable 2

## Error Handling

If X happens, do Y.

---

## Dependencies

- `dependency-1.md`
- `dependency-2.md`
```

### Task Contribution Checklist

- [ ] Task has clear description and purpose
- [ ] Steps are sequential and logical
- [ ] Elicitation points are clear (if applicable)
- [ ] Deliverables are well-defined
- [ ] Error handling guidance included
- [ ] Dependencies exist in the codebase

### Example PR Title

```
feat(task): add db-validate-kiss task for data validation
```

---

## Code Review Process

### Automated Checks

When you submit a PR, the following automated checks run:

| Check                | Description                | Required |
| -------------------- | -------------------------- | -------- |
| **ESLint**           | Code style and quality     | Yes      |
| **TypeScript**       | Type checking              | Yes      |
| **Build**            | Build verification         | Yes      |
| **Tests**            | Jest test suite            | Yes      |
| **Story Validation** | Story checkbox consistency | Yes      |

### CodeRabbit Review

CodeRabbit (AI-powered reviewer) will automatically review your PR and provide feedback on:

- Code quality and best practices
- Security concerns
- AIOS-specific patterns (agents, tasks, workflows)

**Responding to CodeRabbit:**

- Address CRITICAL and HIGH severity comments
- MEDIUM severity can be documented for later
- LOW severity is informational

### Maintainer Review

After automated checks pass, a maintainer will review your PR. They will:

1. Verify the changes meet project standards
2. Check for security implications
3. Ensure documentation is updated
4. Approve or request changes

### Merge Requirements

- [ ] All CI checks pass
- [ ] At least 1 maintainer approval
- [ ] All conversations resolved
- [ ] No merge conflicts

---

## Understanding Feedback

### CodeRabbit Severity Levels

| Level        | Action Required                          |
| ------------ | ---------------------------------------- |
| **CRITICAL** | Must fix before merge                    |
| **HIGH**     | Strongly recommended to fix              |
| **MEDIUM**   | Consider fixing or document as tech debt |
| **LOW**      | Optional improvement                     |

### Common Feedback Patterns

**"Missing error handling"**

- Add try/catch blocks
- Handle edge cases
- Provide meaningful error messages

**"Potential security issue"**

- Never hardcode secrets
- Validate user input
- Use environment variables

**"Inconsistent with existing patterns"**

- Look at similar files for reference
- Follow coding standards in `docs/framework/coding-standards.md`

---

## Frequently Asked Questions

### Q: How long does review take?

**A:** We aim for first review within 24-48 hours. Complex changes may take longer.

### Q: Can I contribute without tests?

**A:** Tests are strongly encouraged. For documentation-only changes, tests may not be required.

### Q: What if my PR has conflicts?

**A:** Rebase your branch on latest main:

```bash
git fetch upstream
git rebase upstream/main
git push --force-with-lease
```

### Q: How do I become a maintainer?

**A:** Consistent, high-quality contributions over time. Start with small fixes and work up to larger features.

### Q: Can I contribute in Portuguese?

**A:** Yes! We accept PRs in Portuguese. Use the [Portuguese CONTRIBUTING guide](../../CONTRIBUTING-PT.md).

---

## Getting Help

- **GitHub Issues:** [Open an issue](https://github.com/SynkraAI/aios-core/issues)
- **Discussions:** [Start a discussion](https://github.com/SynkraAI/aios-core/discussions)
- **Community:** See [COMMUNITY.md](../../COMMUNITY.md)

---

## Related Resources

- [Main CONTRIBUTING.md](../../CONTRIBUTING.md)
- [Coding Standards](../framework/coding-standards.md)
- [Tech Stack](../framework/tech-stack.md)
- [Source Tree Structure](../framework/source-tree.md)
- [Squads Guide](./squads-guide.md)

---

_Thank you for contributing to AIOS! Your contributions make the project better for everyone._
