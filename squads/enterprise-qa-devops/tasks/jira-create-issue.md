# Task: Create Jira Issue

## Metadata
```yaml
id: jira-create-issue
name: Create Jira Issue
agent: jira-agent
version: 1.0.0
```

## Description

Creates a new issue in Jira with specified fields and configuration.

## Input Schema

```typescript
interface JiraCreateIssueInput {
  project: string;         // Required: Project key (e.g., "PROJ")
  type: string;            // Required: Issue type (Bug, Story, Task, Epic)
  summary: string;         // Required: Issue title
  description?: string;    // Optional: Detailed description
  priority?: string;       // Optional: Priority level (Highest, High, Medium, Low, Lowest)
  assignee?: string;       // Optional: Assignee email
  reporter?: string;       // Optional: Reporter email
  labels?: string[];       // Optional: Array of labels
  components?: string[];   // Optional: Array of component names
  fixVersion?: string;     // Optional: Fix version name
  sprint?: number;         // Optional: Sprint ID
  epicLink?: string;       // Optional: Epic issue key
  parentKey?: string;      // Optional: Parent issue key (for subtasks)
  customFields?: Record<string, any>; // Optional: Custom field values
}
```

## Output Schema

```typescript
interface JiraCreateIssueOutput {
  success: boolean;
  issueKey: string;        // Created issue key (e.g., "PROJ-123")
  issueId: string;         // Internal issue ID
  url: string;             // Direct URL to the issue
  self: string;            // API URL for the issue
}
```

## Implementation

```javascript
async function createJiraIssue(input) {
  const { JiraClient } = require('../tools/jira-client');
  const client = new JiraClient();

  // Build issue fields
  const fields = {
    project: { key: input.project },
    issuetype: { name: input.type },
    summary: input.summary,
  };

  // Add optional fields
  if (input.description) {
    fields.description = {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: input.description }]
        }
      ]
    };
  }

  if (input.priority) {
    fields.priority = { name: input.priority };
  }

  if (input.assignee) {
    fields.assignee = { accountId: await client.getAccountId(input.assignee) };
  }

  if (input.labels) {
    fields.labels = input.labels;
  }

  if (input.components) {
    fields.components = input.components.map(name => ({ name }));
  }

  if (input.fixVersion) {
    fields.fixVersions = [{ name: input.fixVersion }];
  }

  if (input.epicLink) {
    fields.parent = { key: input.epicLink };
  }

  // Add custom fields
  if (input.customFields) {
    Object.assign(fields, input.customFields);
  }

  // Create the issue
  const response = await client.createIssue({ fields });

  return {
    success: true,
    issueKey: response.key,
    issueId: response.id,
    url: `https://${process.env.ATLASSIAN_DOMAIN}/browse/${response.key}`,
    self: response.self
  };
}

module.exports = { createJiraIssue };
```

## Usage Examples

### Basic Bug Creation
```bash
@jira *create-issue \
  --project PROJ \
  --type Bug \
  --summary "Login button unresponsive on mobile"
```

### Full Bug Report
```bash
@jira *create-issue \
  --project PROJ \
  --type Bug \
  --summary "Login fails on iOS Safari" \
  --description "Users report 500 error when clicking login on iOS 17" \
  --priority High \
  --assignee "dev@company.com" \
  --labels "mobile,ios,urgent" \
  --components "Frontend,Authentication"
```

### Story with Epic Link
```bash
@jira *create-issue \
  --project PROJ \
  --type Story \
  --summary "Implement password reset flow" \
  --description "As a user, I want to reset my password via email" \
  --epicLink PROJ-EPIC-10 \
  --labels "user-auth,sprint-15"
```

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| 400 | Invalid field value | Check field names and values |
| 401 | Authentication failed | Verify API token |
| 403 | No permission | Check project permissions |
| 404 | Project not found | Verify project key exists |

## Related Tasks

- `jira-update-status` - Update issue after creation
- `jira-link` - Link to other issues
- `jira-search` - Find similar issues first
