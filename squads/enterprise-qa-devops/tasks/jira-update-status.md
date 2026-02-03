# Task: Update Jira Issue Status

## Metadata
```yaml
id: jira-update-status
name: Update Jira Issue Status
agent: jira-agent
version: 1.0.0
```

## Description

Updates a Jira issue's status through workflow transitions or modifies other fields.

## Input Schema

```typescript
interface JiraUpdateStatusInput {
  issueKey: string;           // Required: Issue key (e.g., "PROJ-123")
  status?: string;            // Optional: Target status name
  resolution?: string;        // Optional: Resolution when closing
  comment?: string;           // Optional: Comment to add with transition
  fields?: {                  // Optional: Fields to update
    summary?: string;
    description?: string;
    priority?: string;
    assignee?: string;
    labels?: string[];
    fixVersion?: string;
    [key: string]: any;
  };
}
```

## Output Schema

```typescript
interface JiraUpdateStatusOutput {
  success: boolean;
  issueKey: string;
  previousStatus: string;
  currentStatus: string;
  transitionId?: string;
  url: string;
}
```

## Implementation

```javascript
async function updateJiraStatus(input) {
  const { JiraClient } = require('../tools/jira-client');
  const client = new JiraClient();

  // Get current issue state
  const issue = await client.getIssue(input.issueKey);
  const previousStatus = issue.fields.status.name;

  // If status change requested, find and execute transition
  if (input.status && input.status !== previousStatus) {
    // Get available transitions
    const transitions = await client.getTransitions(input.issueKey);
    const targetTransition = transitions.transitions.find(
      t => t.to.name.toLowerCase() === input.status.toLowerCase()
    );

    if (!targetTransition) {
      throw new Error(
        `Cannot transition to "${input.status}". Available: ${
          transitions.transitions.map(t => t.to.name).join(', ')
        }`
      );
    }

    // Build transition payload
    const transitionPayload = {
      transition: { id: targetTransition.id }
    };

    // Add resolution if provided
    if (input.resolution) {
      transitionPayload.fields = {
        resolution: { name: input.resolution }
      };
    }

    // Add comment if provided
    if (input.comment) {
      transitionPayload.update = {
        comment: [{
          add: {
            body: {
              type: 'doc',
              version: 1,
              content: [{
                type: 'paragraph',
                content: [{ type: 'text', text: input.comment }]
              }]
            }
          }
        }]
      };
    }

    await client.doTransition(input.issueKey, transitionPayload);
  }

  // Update other fields if provided
  if (input.fields && Object.keys(input.fields).length > 0) {
    const updatePayload = { fields: {} };

    if (input.fields.summary) {
      updatePayload.fields.summary = input.fields.summary;
    }

    if (input.fields.priority) {
      updatePayload.fields.priority = { name: input.fields.priority };
    }

    if (input.fields.assignee) {
      const accountId = await client.getAccountId(input.fields.assignee);
      updatePayload.fields.assignee = { accountId };
    }

    if (input.fields.labels) {
      updatePayload.fields.labels = input.fields.labels;
    }

    await client.updateIssue(input.issueKey, updatePayload);
  }

  // Get final state
  const updatedIssue = await client.getIssue(input.issueKey);

  return {
    success: true,
    issueKey: input.issueKey,
    previousStatus,
    currentStatus: updatedIssue.fields.status.name,
    url: `https://${process.env.ATLASSIAN_DOMAIN}/browse/${input.issueKey}`
  };
}

module.exports = { updateJiraStatus };
```

## Usage Examples

### Move to In Progress
```bash
@jira *update-issue PROJ-123 --status "In Progress"
```

### Close with Resolution
```bash
@jira *update-issue PROJ-123 \
  --status "Done" \
  --resolution "Fixed" \
  --comment "Verified fix in build #456"
```

### Update Multiple Fields
```bash
@jira *update-issue PROJ-123 \
  --priority "High" \
  --assignee "dev@company.com" \
  --labels "urgent,hotfix"
```

### Reopen Issue
```bash
@jira *update-issue PROJ-123 \
  --status "Open" \
  --comment "Reopening - bug still reproduces in v1.2.1"
```

## Workflow Transitions

Common Jira workflow transitions:

| From | To | Common Names |
|------|-----|--------------|
| Open | In Progress | Start Progress, Begin Work |
| In Progress | In Review | Submit for Review, Ready for QA |
| In Review | Done | Approve, Complete, Close |
| Any | Closed | Close Issue, Won't Fix |
| Closed | Reopened | Reopen |

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| 400 | Invalid transition | Check available transitions |
| 401 | Authentication failed | Verify API token |
| 403 | No permission | Check transition permissions |
| 404 | Issue not found | Verify issue key |

## Related Tasks

- `jira-create-issue` - Create new issues
- `jira-comment` - Add comments separately
- `jira-search` - Find issues to update
