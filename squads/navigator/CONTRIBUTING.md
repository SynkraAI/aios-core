# Contributing to Navigator Squad

Thank you for your interest in contributing to Navigator! This guide will help you get started.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

---

## Code of Conduct

By participating in this project, you agree to abide by the AIOS Code of Conduct:

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

Report unacceptable behavior to the project maintainers.

---

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- Git
- AIOS Core >= 4.0.0
- Familiarity with AIOS agent architecture

### Quick Start

1. **Fork the repository**
   ```bash
   # Visit https://github.com/SynkraAI/aios-core
   # Click "Fork"
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/aios-core.git
   cd aios-core/squads/navigator
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Run health check**
   ```bash
   @navigator
   *navigator-doctor
   ```

5. **Run tests**
   ```bash
   npm test -- tests/unit/navigator/
   ```

---

## Development Setup

### Environment Variables

Create `.env` for local development:
```bash
NAVIGATOR_AUTO_MODE=false  # Manual confirmations during dev
NODE_ENV=development
```

### Git Hooks

Install development hooks:
```bash
npm run prepare
node squads/navigator/scripts/install-hooks.js install
```

### IDE Setup

**VS Code Extensions (recommended):**
- ESLint
- Prettier
- YAML
- Markdown All in One
- Mermaid Preview

**Settings:**
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

## How to Contribute

### Types of Contributions

1. **Bug Reports** - Found a bug? Open an issue
2. **Feature Requests** - Have an idea? Propose it
3. **Code Contributions** - Fix bugs or add features
4. **Documentation** - Improve or translate docs
5. **Examples** - Share your Navigator workflows
6. **Testing** - Write tests for uncovered code

### Areas Needing Help

Check issues labeled:
- `good-first-issue` - Great for newcomers
- `help-wanted` - Community contributions welcome
- `documentation` - Docs improvements needed
- `testing` - Test coverage needed

---

## Coding Standards

### JavaScript/Node.js

- **Style:** Follow ESLint config (`.eslintrc.js`)
- **Naming:** camelCase for variables, PascalCase for classes
- **Async:** Use async/await, not callbacks
- **Errors:** Always handle errors explicitly

**Example:**
```javascript
async function detectPhase(roadmapPath) {
  try {
    const roadmap = await loadRoadmap(roadmapPath);
    const currentPhase = analyzeOutputs(roadmap);
    return currentPhase;
  } catch (error) {
    logger.error('Phase detection failed', { error });
    throw new Error(`Failed to detect phase: ${error.message}`);
  }
}
```

### Markdown

- Use ATX headers (`#`, `##`, `###`)
- Wrap lines at 100 characters
- Use fenced code blocks with language tags
- Include table of contents for long docs

### YAML

- Use 2-space indentation
- Quote strings with special characters
- Validate with yamllint

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `test` - Test additions/changes
- `refactor` - Code refactoring
- `chore` - Build/tooling changes

**Examples:**
```bash
feat(phase-detector): add story status parsing

- Parse YAML front-matter from story files
- Calculate completion percentage
- Handle missing/malformed YAML gracefully

Closes #42
```

```bash
fix(checkpoint): prevent duplicate checkpoints

Skip checkpoint creation if ID already exists.
Add warning log when skipping.

Fixes #58
```

---

## Testing

### Running Tests

```bash
# All Navigator tests
npm test -- tests/unit/navigator/

# Specific test file
npm test -- tests/unit/navigator/doctor.test.js

# Watch mode
npm test -- --watch tests/unit/navigator/

# Coverage
npm run test:coverage
```

### Writing Tests

**Location:** `tests/unit/navigator/`

**Structure:**
```javascript
describe('Component Name', () => {
  describe('functionName', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = functionName(input);

      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Test Coverage Goals

- **Overall:** 80%+
- **Core functions:** 90%+
- **Edge cases:** Covered

### Test Checklist

- [ ] Unit tests pass locally
- [ ] New code has tests
- [ ] Tests follow naming convention
- [ ] Edge cases covered
- [ ] No skip/only in commits

---

## Documentation

### Documentation Types

1. **Code Comments** - Inline explanations
2. **README.md** - Overview and usage
3. **Examples** - Practical tutorials
4. **API Docs** - Function signatures
5. **Guides** - Step-by-step tutorials

### Documentation Standards

**Inline Comments:**
```javascript
// Good: Explain WHY, not WHAT
// Use glob pattern instead of exact match for flexibility
const stories = glob.sync('docs/stories/story-*.md');

// Bad: Redundant comment
// Get all story files
const stories = glob.sync('docs/stories/story-*.md');
```

**Function Docs:**
```javascript
/**
 * Detect current project phase based on output files
 *
 * @param {string} roadmapPath - Path to roadmap.md file
 * @returns {Promise<PhaseResult>} Phase ID, name, and completion %
 * @throws {Error} If roadmap file not found or invalid
 *
 * @example
 * const phase = await detectPhase('.aios/navigator/my-project/roadmap.md');
 * console.log(`Current phase: ${phase.name} (${phase.completion}%)`);
 */
async function detectPhase(roadmapPath) {
  // ...
}
```

### Adding Examples

Examples go in `squads/navigator/examples/`:

1. Create `example-N-your-scenario.md`
2. Follow this structure:
   - Context (scenario description)
   - Steps (detailed walkthrough)
   - Results (what was achieved)
   - Key Takeaways (lessons learned)
3. Add to `examples/README.md` index
4. Include realistic project details
5. Test the example yourself first

---

## Pull Request Process

### Before Submitting

- [ ] Code follows style guide
- [ ] Tests pass locally
- [ ] New tests added for new code
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Commit messages follow convention
- [ ] PR description is clear

### PR Template

```markdown
## Description
Brief description of changes

## Motivation
Why is this change needed?

## Changes Made
- Change 1
- Change 2

## Testing
How was this tested?

## Screenshots (if applicable)
Attach screenshots

## Checklist
- [ ] Tests pass
- [ ] Documentation updated
- [ ] CHANGELOG updated
```

### Review Process

1. **Automated checks** run first (ESLint, tests)
2. **Maintainer review** (1-2 business days)
3. **Revisions** if requested
4. **Approval** and merge

### After Merge

- Your contribution will be in the next release
- You'll be added to CONTRIBUTORS.md
- Thank you! 🎉

---

## Community

### Communication Channels

- **GitHub Issues** - Bug reports, feature requests
- **GitHub Discussions** - Questions, ideas
- **AIOS Discord** - Real-time chat (coming soon)

### Getting Help

**Stuck?** Ask in:
1. GitHub Discussions (Q&A)
2. Issue comments
3. Discord #navigator channel

**Response time:** Usually within 48 hours

### Recognition

Contributors are recognized in:
- CONTRIBUTORS.md
- Release notes
- CHANGELOG.md

---

## Development Workflow

### Typical Flow

1. **Pick an issue** from GitHub
2. **Comment** "I'd like to work on this"
3. **Create branch** `git checkout -b feat/your-feature`
4. **Make changes** and commit
5. **Push branch** `git push origin feat/your-feature`
6. **Open PR** on GitHub
7. **Address reviews**
8. **Celebrate** when merged! 🎉

### Branch Naming

- `feat/feature-name` - New features
- `fix/bug-name` - Bug fixes
- `docs/doc-name` - Documentation
- `test/test-name` - Test additions
- `refactor/refactor-name` - Refactoring

---

## Advanced Topics

### Adding a New Task

1. Create `tasks/nav-your-task.md`
2. Follow existing task format
3. Add to `squad.yaml` manifest
4. Add to agent's command list
5. Write tests for task logic
6. Add example usage
7. Update README.md

### Adding a New Script

1. Create `scripts/navigator/your-script.js`
2. Add shebang and description
3. Export main function
4. Handle errors gracefully
5. Write unit tests
6. Update documentation

### Modifying the Pipeline

1. Edit `data/navigator-pipeline-map.yaml`
2. Validate YAML syntax
3. Update phase-detector.js if needed
4. Test with real project
5. Document changes in CHANGELOG

---

## Release Process

(For maintainers)

1. Update version in `squad.yaml`
2. Update CHANGELOG.md
3. Create git tag: `v1.0.0`
4. Push tag: `git push origin v1.0.0`
5. Create GitHub release
6. Publish to aios-squads repository

---

## Questions?

- **Technical questions:** GitHub Discussions
- **Security issues:** Email maintainers privately
- **General inquiries:** Open an issue

---

**Thank you for contributing to Navigator!** 🧭

Your contributions make AIOS better for everyone.

---

*Contributing Guide v1.0 - Last updated 2026-02-15*
