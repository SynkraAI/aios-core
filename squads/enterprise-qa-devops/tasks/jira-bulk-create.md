# Task: Bulk Create Jira Issues

## Metadata
```yaml
id: jira-bulk-create
name: Bulk Create Jira Issues
agent: jira-agent
version: 1.0.0
```

## Description

Creates multiple Jira issues from a JSON file or structured input.

## Input Schema

```typescript
interface JiraBulkCreateInput {
  file?: string;             // Optional: Path to JSON file with issues
  issues?: Array<{           // Optional: Array of issues to create
    project: string;
    type: string;
    summary: string;
    description?: string;
    priority?: string;
    assignee?: string;
    labels?: string[];
    components?: string[];
    epicLink?: string;
    customFields?: Record<string, any>;
  }>;
  dryRun?: boolean;          // Optional: Validate without creating
  continueOnError?: boolean; // Optional: Continue if one fails
}
```

## Output Schema

```typescript
interface JiraBulkCreateOutput {
  success: boolean;
  created: number;
  failed: number;
  results: Array<{
    index: number;
    success: boolean;
    issueKey?: string;
    url?: string;
    error?: string;
  }>;
}
```

## Implementation

```javascript
async function bulkCreateJiraIssues(input) {
  const { JiraClient } = require('../tools/jira-client');
  const fs = require('fs');
  const client = new JiraClient();

  // Load issues from file or use provided array
  let issues;
  if (input.file) {
    const fileContent = fs.readFileSync(input.file, 'utf-8');
    issues = JSON.parse(fileContent);
  } else if (input.issues) {
    issues = input.issues;
  } else {
    throw new Error('Either file or issues array required');
  }

  // Dry run - validate only
  if (input.dryRun) {
    return {
      success: true,
      message: `Validated ${issues.length} issues. Ready to create.`,
      issues: issues.map((issue, idx) => ({
        index: idx,
        valid: true,
        summary: issue.summary
      }))
    };
  }

  const results = [];
  let created = 0;
  let failed = 0;

  for (let i = 0; i < issues.length; i++) {
    const issue = issues[i];

    try {
      // Build issue fields
      const fields = {
        project: { key: issue.project },
        issuetype: { name: issue.type },
        summary: issue.summary
      };

      if (issue.description) {
        fields.description = {
          type: 'doc',
          version: 1,
          content: [{
            type: 'paragraph',
            content: [{ type: 'text', text: issue.description }]
          }]
        };
      }

      if (issue.priority) {
        fields.priority = { name: issue.priority };
      }

      if (issue.assignee) {
        const accountId = await client.getAccountId(issue.assignee);
        fields.assignee = { accountId };
      }

      if (issue.labels) {
        fields.labels = issue.labels;
      }

      if (issue.components) {
        fields.components = issue.components.map(name => ({ name }));
      }

      if (issue.epicLink) {
        fields.parent = { key: issue.epicLink };
      }

      if (issue.customFields) {
        Object.assign(fields, issue.customFields);
      }

      const response = await client.createIssue({ fields });

      results.push({
        index: i,
        success: true,
        issueKey: response.key,
        url: `https://${process.env.ATLASSIAN_DOMAIN}/browse/${response.key}`
      });
      created++;

    } catch (error) {
      results.push({
        index: i,
        success: false,
        summary: issue.summary,
        error: error.message
      });
      failed++;

      if (!input.continueOnError) {
        break;
      }
    }
  }

  return {
    success: failed === 0,
    created,
    failed,
    results
  };
}

module.exports = { bulkCreateJiraIssues };
```

## Input File Format

### issues.json
```json
[
  {
    "project": "PROJ",
    "type": "Bug",
    "summary": "Login fails on Safari",
    "description": "Users report 500 error",
    "priority": "High",
    "labels": ["mobile", "urgent"],
    "components": ["Frontend"]
  },
  {
    "project": "PROJ",
    "type": "Bug",
    "summary": "Dashboard timeout",
    "description": "Dashboard takes >30s to load",
    "priority": "Medium",
    "assignee": "dev@company.com"
  },
  {
    "project": "PROJ",
    "type": "Story",
    "summary": "Add dark mode support",
    "description": "Implement dark theme toggle",
    "epicLink": "PROJ-EPIC-5",
    "labels": ["ux", "theme"]
  }
]
```

## Usage Examples

### Create from File
```bash
@jira *bulk-create --file ./issues.json
```

### Dry Run First
```bash
@jira *bulk-create --file ./issues.json --dryRun
```

### Continue on Error
```bash
@jira *bulk-create --file ./issues.json --continueOnError
```

### From Test Failures
```bash
# Generate issues from test failures
@xray *get-failures --execution PROJ-EXEC-123 --format json > failures.json
@jira *bulk-create --file failures.json
```

## Templates

### Sprint Planning Template
```json
[
  {
    "project": "PROJ",
    "type": "Story",
    "summary": "[Sprint 15] User authentication improvements",
    "labels": ["sprint-15", "auth"],
    "epicLink": "PROJ-EPIC-10"
  },
  {
    "project": "PROJ",
    "type": "Task",
    "summary": "[Sprint 15] Update login UI",
    "labels": ["sprint-15", "ui"]
  },
  {
    "project": "PROJ",
    "type": "Task",
    "summary": "[Sprint 15] Add password strength meter",
    "labels": ["sprint-15", "security"]
  }
]
```

### Bug Triage Template
```json
[
  {
    "project": "PROJ",
    "type": "Bug",
    "summary": "{{error_message}}",
    "description": "Error occurred at {{timestamp}}\\n\\nStack trace:\\n{{stacktrace}}",
    "priority": "{{severity}}",
    "labels": ["automated", "error-tracking"]
  }
]
```

## Output Example

```json
{
  "success": true,
  "created": 3,
  "failed": 0,
  "results": [
    {
      "index": 0,
      "success": true,
      "issueKey": "PROJ-456",
      "url": "https://company.atlassian.net/browse/PROJ-456"
    },
    {
      "index": 1,
      "success": true,
      "issueKey": "PROJ-457",
      "url": "https://company.atlassian.net/browse/PROJ-457"
    },
    {
      "index": 2,
      "success": true,
      "issueKey": "PROJ-458",
      "url": "https://company.atlassian.net/browse/PROJ-458"
    }
  ]
}
```

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| 400 | Invalid field value | Check JSON structure |
| 401 | Authentication failed | Verify API token |
| 403 | No permission | Check project permissions |
| FILE_NOT_FOUND | File doesn't exist | Verify file path |
| INVALID_JSON | Malformed JSON | Validate JSON syntax |

## Related Tasks

- `jira-create-issue` - Single issue creation
- `jira-search` - Find existing issues first
- `jira-link` - Link created issues together
