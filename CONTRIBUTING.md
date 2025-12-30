# Contributing to Synkra AIOS

> 🇧🇷 [Versão em Português](CONTRIBUTING-PT.md)
>
> 🌍 **External Contributors:** See our [External Contribution Guide](docs/guides/external-contribution-guide.md) for detailed instructions on contributing agents, tasks, and workflows.

Thank you for your interest in contributing to Synkra AIOS! This guide will help you understand our development workflow and validation process.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Validation System](#validation-system)
- [Pull Request Process](#pull-request-process)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Story-Driven Development](#story-driven-development)

## Getting Started

### Prerequisites

- Node.js >=20.0.0
- npm
- GitHub CLI (`gh`)
- Git

### Setup

1. **Fork and clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/aios-core.git
cd aios-core
```

2. **Install dependencies**

```bash
npm install
```

3. **Verify setup**

```bash
# Run tests
npm test

# Run linting
npm run lint

# Run type checking
npm run typecheck
```

## Development Workflow

Synkra AIOS uses a story-driven development approach with a multi-layer validation system.

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:

- `feature/` - New features
- `bugfix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/improvements

### 2. Work on a Story

All development is driven by stories in `docs/stories/`. See [Story-Driven Development](#story-driven-development) below.

### 3. Commit Changes

Commits trigger the **pre-commit hook** which validates:

- ✅ ESLint (code quality)
- ✅ TypeScript (type checking)

```bash
git add .
git commit -m "feat: add new feature [Story X.X]"
```

**Commit Message Format:**

```
<type>: <description> [Story X.X]

<optional body>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### 4. Push Changes

Push triggers the **pre-push hook** which validates:

- ✅ Story checkbox completion
- ✅ Story status consistency

```bash
git push origin feature/your-feature-name
```

### 5. Create Pull Request

```bash
gh pr create --title "feat: Add new feature" --body "Description of changes"
```

The **CI/CD pipeline** will run:

- ✅ ESLint validation
- ✅ TypeScript type checking
- ✅ Jest tests with coverage
- ✅ Story validation

## Validation System

AIOS implements a **Defense in Depth** strategy with 3 validation layers:

### Layer 1: Pre-commit (Local - Fast)

**Purpose:** Catch issues before they're committed
**Performance:** <5s
**Tools:**

- IDE Sync (auto-stages IDE command files)
- lint-staged (ESLint + Prettier)
- TypeScript incremental compilation

**What it checks:**

- IDE command file synchronization (agent definitions)
- Code style consistency
- Type errors
- Syntax errors
- Import issues

**IDE Sync Auto-Stage:**
The pre-commit hook automatically runs IDE sync to keep `.claude/commands/`, `.cursor/rules/`, and other IDE directories in sync with agent definitions in `.aios-core/development/agents/`. Changed files are auto-staged.

**Skip if needed (NOT recommended):**

```bash
git commit --no-verify
```

### Layer 2: Pre-push (Local - Story Validation)

**Purpose:** Ensure story consistency before pushing
**Performance:** <2s
**Tools:**

- Story checkbox validator

**What it checks:**

- Story checkbox completion vs status
- Required story sections present
- Status consistency

**Example validation:**

```yaml
status: 'completed'
acceptance_criteria:
  - tasks:
      - '[x] Task 1' # Must be checked
      - '[ ] Task 2' # ❌ Error: incomplete but status=completed
```

### Layer 3: CI/CD (Cloud - Required for Merge)

**Purpose:** Final validation before merge
**Performance:** ~2-5 minutes
**Platform:** GitHub Actions

**What it checks:**

- All lint and type errors
- Test suite passes
- Code coverage ≥80%
- Story validation
- Branch protection rules

## Pull Request Process

### Before Creating PR

1. ✅ All tests pass locally
2. ✅ Story checkboxes match status
3. ✅ Code follows style guide
4. ✅ Documentation updated

### PR Requirements

- **Title:** Clear, descriptive title following commit conventions
- **Description:** Explain what and why (not how)
- **Story Reference:** Link to related story file
- **Tests:** Include tests for new functionality
- **Documentation:** Update relevant docs

### PR Review Process

1. **Automated Checks** - CI must pass
2. **Code Review** - At least 1 approval required
3. **Branch Protection** - Master branch is protected
4. **Merge Strategy** - Squash and merge (linear history)

## Code Standards

### JavaScript/TypeScript

- Use ES2022 features
- Prefer `const` over `let`
- Use async/await over promises
- Add JSDoc comments for public APIs
- Follow existing code style

### File Organization

```
.aios-core/
├── agents/       # Agent definitions
├── tasks/        # Task workflows
├── workflows/    # Multi-step workflows
├── utils/        # Utility functions
└── templates/    # File templates

docs/
├── stories/      # Development stories
├── prd/          # Product requirements
└── architecture/ # System architecture
```

### ESLint Configuration

- Extends: `eslint:recommended`, `@typescript-eslint/recommended`
- Caching enabled (`.eslintcache`)
- No console.log in production code (warnings)

### TypeScript Configuration

- Target: ES2022
- Strict mode enabled
- Incremental compilation
- CommonJS modules

## Testing Requirements

### Test Coverage

- **Minimum:** 80% coverage (branches, functions, lines, statements)
- **Unit Tests:** Required for all new functions
- **Integration Tests:** Required for workflows
- **Test Files:** `*.test.js` or in `tests/` directory

### Writing Tests

```javascript
describe('MyModule', () => {
  it('should do something', () => {
    const result = myFunction();
    expect(result).toBe(expected);
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Specific test file
npm test -- path/to/test.js
```

## Story-Driven Development

### What is a Story?

Stories are YAML files in `docs/stories/` that define:

- Feature requirements
- Acceptance criteria
- Implementation tasks
- Technical details

### Story Structure

```yaml
id: "X.X"
title: "Story Title"
status: "ready" | "in progress" | "Ready for Review" | "completed"
acceptance_criteria:
  - name: "Criterion 1"
    tasks:
      - "[ ] Task 1"
      - "[x] Task 2"  # Mark completed with [x]
dev_agent_record:
  agent_model: "claude-sonnet-4-5"
  implementation_date: "2025-01-23"
```

### Working with Stories

1. **Read the story** - Understand requirements
2. **Update checkboxes** - Mark tasks as complete `[x]`
3. **Update status** - Change status when appropriate
4. **Update file list** - Track modified files
5. **Add completion notes** - Document decisions

### Story Status Flow

```
ready → in progress → Ready for Review → completed
```

**Rules:**

- Status `ready`: No tasks should be checked
- Status `in progress`: Some tasks checked
- Status `completed`: All tasks must be checked

## Common Issues and Solutions

### Pre-commit Hook Fails

**ESLint errors:**

```bash
npm run lint -- --fix  # Auto-fix issues
```

**TypeScript errors:**

```bash
npm run typecheck  # See all errors
```

### Pre-push Hook Fails

**Story validation errors:**

```bash
node .aios-core/utils/aios-validator.js stories  # Check all stories
```

**Fix story inconsistencies:**

- Ensure checkboxes match status
- Add missing required sections
- Update dev_agent_record

### CI Fails

**Check CI logs:**

```bash
gh pr checks  # View PR checks
```

**Common fixes:**

- Rebase on latest master
- Fix test failures locally
- Increase test coverage
- Update story validation

## Creating Squads

Want to extend AIOS with new functionality?

See our [Squads Guide](docs/guides/squads-guide.md) for:

- Squad structure and manifest format
- Creating agents, tasks, and workflows
- Testing and publishing your Squad
- Integration guidelines

### Quick Links

- [Squad Template](templates/squad/) - Start from a working template
- [Example Squads](docs/guides/squad-examples/) - Learn from examples
- [Squad Discussions](https://github.com/SynkraAI/aios-core/discussions/categories/ideas) - Share your Squad ideas

## Additional Resources

- 📖 [Community Guide](COMMUNITY.md) - How to participate in the AIOS community
- 📖 [Squads Guide](docs/guides/squads-guide.md) - Create and publish AI agent teams
- 📖 [Git Workflow Guide](docs/git-workflow-guide.md) - Detailed workflow documentation
- 📖 [User Guide](aios-core/user-guide.md) - Complete user guide
- 📖 [Architecture](docs/architecture.md) - System architecture
- 🗺️ [Roadmap](ROADMAP.md) - See what's planned and influence our direction
- 💬 [GitHub Discussions](https://github.com/SynkraAI/aios-core/discussions) - Community hub

## Questions?

- Open an [issue](https://github.com/SynkraAI/aios-core/issues)
- Start a [discussion](https://github.com/SynkraAI/aios-core/discussions)
- Read the [Community Guide](COMMUNITY.md)

---

**Thank you for contributing to Synkra AIOS!** 🚀
