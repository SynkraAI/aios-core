# Coding Standards - Enterprise QA DevOps Squad

> **Mental Model Applied:** Four Rules of Simple Design (Kent Beck)

## General Principles

1. **Passes All Tests** - Code must be tested and all tests must pass
2. **Reveals Intention** - Code should be self-documenting
3. **No Duplication** - DRY (Don't Repeat Yourself)
4. **Minimal** - Smallest number of classes and methods

## JavaScript/Node.js Standards

### File Organization

```
squads/enterprise-qa-devops/
├── agents/         # Agent definitions (*.md)
├── tasks/          # Task definitions (*.md)
├── workflows/      # Workflow definitions (*.yaml)
├── tools/          # Client libraries (*.js)
├── scripts/        # Utility scripts (*.js)
├── templates/      # Document templates (*.md)
├── checklists/     # Checklists (*.md)
└── config/         # Configuration (*.md, *.yaml)
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `jira-client.js` |
| Classes | PascalCase | `JiraClient` |
| Functions | camelCase | `createIssue` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRIES` |
| Variables | camelCase | `issueKey` |

### Code Style

```javascript
// Use ES6+ features
const { JiraClient } = require('./jira-client');

// Async/await over callbacks
async function fetchIssue(key) {
  const issue = await client.getIssue(key);
  return issue;
}

// Destructuring for cleaner code
const { summary, status, assignee } = issue.fields;

// Template literals for strings
const message = `Issue ${key} is ${status}`;

// Object shorthand
const payload = { key, summary, status };

// Arrow functions for callbacks
const keys = issues.map(issue => issue.key);
```

### Error Handling

```javascript
// Always use try/catch with async/await
async function safeOperation() {
  try {
    const result = await riskyOperation();
    return result;
  } catch (error) {
    logger.error(`Operation failed: ${error.message}`);
    throw new Error(`Failed to complete operation: ${error.message}`);
  }
}

// Custom error classes for specific cases
class JiraAuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'JiraAuthError';
    this.code = 'AUTH_FAILED';
  }
}
```

### Documentation

```javascript
/**
 * Creates a new Jira issue with the specified fields.
 *
 * @param {Object} fields - Issue fields
 * @param {string} fields.project - Project key
 * @param {string} fields.summary - Issue summary
 * @param {string} [fields.description] - Issue description
 * @returns {Promise<Object>} Created issue with key and id
 * @throws {JiraAuthError} If authentication fails
 * @throws {Error} If issue creation fails
 *
 * @example
 * const issue = await createIssue({
 *   project: 'PROJ',
 *   summary: 'New bug found'
 * });
 */
async function createIssue(fields) {
  // Implementation
}
```

## Markdown Standards

### Agent Definitions

```markdown
---
id: agent-id
name: Agent Display Name
persona: Persona Name
icon: 🎯
zodiac: ♈ Aries
squad: squad-name
version: 1.0.0
---

# Agent Title (@handle / Persona)

> "Signature quote"

## Persona
## Primary Scope
## Circle of Competence
## Commands
## Error Handling
## Examples
```

### Task Definitions

```markdown
# Task: Task Name

## Metadata
## Description
## Input Schema
## Output Schema
## Implementation
## Usage Examples
## Error Handling
## Related Tasks
```

### Checklists

```markdown
# Checklist Title

> Mental Model Applied

## Section 1
- [ ] Item 1
- [ ] Item 2

## Section 2
- [ ] Item 3
```

## YAML Standards

### Workflow Definitions

```yaml
name: workflow-name
version: 1.0.0
description: |
  Multi-line description
  of the workflow.

triggers:
  - type: manual
    command: "@agent *command"

inputs:
  param:
    type: string
    required: true
    description: Parameter description

steps:
  - id: step_id
    agent: agent-name
    task: task-name
    inputs:
      key: value
    outputs:
      - output_key

outputs:
  result: "${steps.step_id.output_key}"

error_handling:
  on_failure:
    - action
```

## Testing Standards

### Test File Structure

```javascript
const { JiraClient } = require('../tools/jira-client');

describe('JiraClient', () => {
  let client;

  beforeEach(() => {
    client = new JiraClient({
      domain: 'test.atlassian.net',
      email: 'test@example.com',
      apiToken: 'test-token'
    });
  });

  describe('createIssue', () => {
    it('should create issue with required fields', async () => {
      // Arrange
      const fields = { project: 'TEST', summary: 'Test issue' };

      // Act
      const result = await client.createIssue({ fields });

      // Assert
      expect(result.key).toBeDefined();
      expect(result.key).toMatch(/^TEST-\d+$/);
    });

    it('should throw on missing project', async () => {
      // Arrange
      const fields = { summary: 'Test issue' };

      // Act & Assert
      await expect(client.createIssue({ fields }))
        .rejects.toThrow('project is required');
    });
  });
});
```

## Version Control

### Commit Messages

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`

Examples:
```
feat(jira): add bulk issue creation
fix(xray): handle token expiry correctly
docs(readme): update setup instructions
test(confluence): add page creation tests
```

### Branch Naming

```
<type>/<description>

feat/add-teams-notification
fix/xray-auth-error
docs/update-credentials
```

## Security Standards

1. **Never commit credentials** - Use environment variables
2. **Mask secrets in logs** - Use `****` for sensitive data
3. **Validate all inputs** - Sanitize user-provided data
4. **Use HTTPS only** - No plain HTTP connections
5. **Minimal permissions** - Request only needed scopes

---

*Enterprise QA DevOps Squad - Coding Standards v1.0*
