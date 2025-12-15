# AIOS Utils - Utility Scripts Library

This directory contains 68+ utility scripts that provide automation, validation, and helper functions for Synkra AIOS agents and workflows.

## Categories

### 🔍 **Core Validation & Analysis**
Scripts for validating AIOS structures and analyzing code quality.

- **aios-validator.js** - Validates AIOS structures (agents, tasks, workflows, stories)
- **capability-analyzer.js** - Analyzes agent capabilities and requirements
- **compatibility-checker.js** - Checks compatibility between components
- **coverage-analyzer.js** - Analyzes test coverage metrics
- **dependency-analyzer.js** - Analyzes dependencies and their impacts
- **dependency-impact-analyzer.js** - Predicts impact of dependency changes

### 📋 **Story & Task Management**
Tools for managing development stories, tasks, and workflows.

- **story-manager.js** - Complete story lifecycle management
  - Create, update, delete stories
  - Track progress and status
  - Manage checkboxes and file lists
  - Integration with ClickUp

- **batch-creator.js** - Batch creation of stories/tasks
- **task-router.js** - Routes tasks to appropriate agents
- **workflow-orchestrator.js** - Orchestrates multi-step workflows

### 🔧 **Tool & Integration Management**
Scripts for managing tools, MCPs, and external integrations.

- **tool-resolver.js** - Discovers and validates available tools
  - CLI tools detection
  - MCP server validation
  - Capability matching
  - Environment verification

- **clickup-helpers.js** - ClickUp API utility functions
  - Task operations
  - Sprint management
  - Custom fields handling
  - Webhook utilities

### 🧩 **Component Generation**
Generators for creating various component types.

- **component-generator.js** - Generates React/Vue/Angular components
- **component-metadata.js** - Extracts component metadata
- **component-preview.js** - Generates component previews
- **component-search.js** - Searches for components in codebase
- **test-generator.js** - Generates test suites
- **migration-generator.js** - Generates database migrations
- **schema-generator.js** - Generates schema definitions

### 📝 **Documentation & Code Quality**
Tools for maintaining documentation and code quality.

- **documentation-synchronizer.js** - Syncs documentation with code
- **code-quality-improver.js** - Suggests code quality improvements
- **commit-message-generator.js** - Generates semantic commit messages
- **changelog-generator.js** - Generates CHANGELOG entries
- **diff-generator.js** - Generates structured diffs

### 🔄 **Version Control & Git**
Git workflow automation and version control helpers.

- **branch-manager.js** - Manages Git branches
- **conflict-manager.js** - Handles merge conflicts
- **conflict-resolver.js** - Resolves common conflict patterns
- **pr-validator.js** - Validates pull requests
- **release-manager.js** - Manages releases and versioning

### 💾 **Backup & Recovery**
Data backup and recovery utilities.

- **backup-manager.js** - Automated backups
  - Story backups
  - Configuration backups
  - Code snapshots
  - Rollback capabilities

- **recovery-manager.js** - Recovery operations
- **snapshot-manager.js** - Manages code snapshots

### 🎯 **Workflow Automation**
Scripts for automating development workflows.

- **approval-workflow.js** - Handles approval workflows
- **change-propagation-predictor.js** - Predicts change impacts
- **elicitation-engine.js** - Interactive requirement gathering
- **qa-automation.js** - Automated QA workflows
- **test-orchestrator.js** - Orchestrates test execution

### 🔌 **API & Integration**
API helpers and integration utilities.

- **api-client-generator.js** - Generates API clients
- **webhook-manager.js** - Manages webhooks
- **supabase-helpers.js** - Supabase utility functions
- **railway-helpers.js** - Railway deployment helpers

### 🧪 **Testing Utilities**
Testing support and test data management.

- **test-data-generator.js** - Generates test data
- **mock-generator.js** - Generates mocks and stubs
- **performance-profiler.js** - Profiles performance
- **security-scanner.js** - Scans for security issues

### 🗄️ **Data Management**
Data transformation and management tools.

- **yaml-parser.js** - YAML parsing with validation
- **json-transformer.js** - JSON transformation utilities
- **markdown-processor.js** - Markdown processing
- **template-engine.js** - Template rendering engine

### 🔐 **Security & Validation**
Security scanning and input validation.

- **secret-scanner.js** - Scans for exposed secrets
- **input-validator.js** - Validates user inputs
- **permission-checker.js** - Checks permissions
- **rate-limiter.js** - Rate limiting utilities

### 📊 **Monitoring & Logging**
Logging, monitoring, and observability tools.

- **logger.js** - Structured logging
- **metrics-collector.js** - Collects metrics
- **health-checker.js** - Health check utilities
- **error-tracker.js** - Error tracking and reporting

### 🎨 **UI & Presentation**
UI generation and formatting utilities.

- **markdown-renderer.js** - Renders Markdown to HTML
- **syntax-highlighter.js** - Syntax highlighting
- **diagram-generator.js** - Generates diagrams
- **report-formatter.js** - Formats reports

## Usage Examples

### Story Management

```javascript
const { StoryManager } = require('./story-manager');

// Create new story
const story = await StoryManager.create({
  title: 'Implement user authentication',
  epic: 'User Management',
  assignee: '@dev'
});

// Update story progress
await story.updateTask(taskId, { status: 'completed' });

// Get story status
const status = await story.getStatus();
```

### Tool Discovery

```javascript
const { resolveTools } = require('./tool-resolver');

// Get all available tools
const tools = await resolveTools();

// Get specific tool category
const mcpServers = await resolveTools({
  category: 'mcp',
  required: true
});

// Check tool availability
const isAvailable = await resolveTools.checkTool('gh');
```

### Component Generation

```javascript
const { generateComponent } = require('./component-generator');

// Generate React component
await generateComponent({
  name: 'UserProfile',
  type: 'react',
  props: ['user', 'onEdit'],
  features: ['typescript', 'tests']
});
```

### Validation

```javascript
const { validate } = require('./aios-validator');

// Validate agent definition
const result = await validate.agent('path/to/agent.yaml');

// Validate story structure
const storyValid = await validate.story('docs/stories/1.1-feature.md');

// Validate workflow
const workflowValid = await validate.workflow('workflows/deploy.yaml');
```

## Best Practices

### 1. Error Handling

All utilities use consistent error handling:

```javascript
try {
  const result = await utility.operation();
  return result;
} catch (error) {
  if (error.code === 'VALIDATION_ERROR') {
    // Handle validation errors
  }
  throw error;
}
```

### 2. Configuration

Utilities read configuration from `core-config.yaml`:

```javascript
const config = require('../core-config.yaml');
const utilsLocation = config.utilsLocation;
```

### 3. Logging

Use the built-in logger for consistent output:

```javascript
const logger = require('./logger');

logger.info('Operation started', { context });
logger.error('Operation failed', { error });
```

### 4. Testing

Each utility should have corresponding tests:

```javascript
// Example: aios-validator.test.js
describe('aios-validator', () => {
  it('validates agent structure', async () => {
    const result = await validate.agent(validAgent);
    expect(result.valid).toBe(true);
  });
});
```

## Adding New Utilities

### Structure

```javascript
/**
 * @file utility-name.js
 * @description Brief description of what this utility does
 */

const config = require('../core-config.yaml');
const logger = require('./logger');

class UtilityName {
  constructor(options = {}) {
    this.options = options;
  }

  async mainOperation(params) {
    try {
      // Implementation
      logger.info('Operation successful');
      return result;
    } catch (error) {
      logger.error('Operation failed', { error });
      throw error;
    }
  }
}

module.exports = UtilityName;
```

### Documentation

1. Add JSDoc comments
2. Include usage examples
3. Document all parameters
4. List error codes
5. Update this README

### Testing

1. Create corresponding `.test.js` file
2. Test happy path
3. Test error cases
4. Test edge cases
5. Run: `npm test utils/utility-name.test.js`

## Troubleshooting

### Utility Not Found

```bash
# Verify utility exists
ls -la .aios-core/scripts/utility-name.js

# Check require path
node -e "require('./.aios-core/scripts/utility-name')"
```

### Permission Errors

```bash
# Check file permissions
chmod +x .aios-core/scripts/*.js

# Check directory permissions
ls -ld .aios-core/scripts/
```

### Configuration Issues

```bash
# Validate core-config.yaml
node .aios-core/scripts/aios-validator.js --config

# Check utilsLocation setting
grep utilsLocation .aios-core/core-config.yaml
```

## Related Documentation

- [Tools Directory](../tools/README.md)
- [Agent Development Guide](../../docs/agent-guide.md)
- [Core Configuration](../core-config.yaml)
- [Testing Guide](../../docs/testing-guide.md)

---

*Last updated: 2025-10-22 - Documentation Sync Initiative*
*Total utilities: 68 scripts*
