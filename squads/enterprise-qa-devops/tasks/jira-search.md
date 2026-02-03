# Task: Search Jira Issues

## Metadata
```yaml
id: jira-search
name: Search Jira Issues
agent: jira-agent
version: 1.0.0
```

## Description

Searches for Jira issues using JQL (Jira Query Language).

## Input Schema

```typescript
interface JiraSearchInput {
  jql: string;               // Required: JQL query string
  fields?: string[];         // Optional: Fields to return (default: all)
  maxResults?: number;       // Optional: Max results (default: 50, max: 100)
  startAt?: number;          // Optional: Pagination offset
  expand?: string[];         // Optional: Expand fields (changelog, renderedFields)
  orderBy?: string;          // Optional: Sort field and direction
}
```

## Output Schema

```typescript
interface JiraSearchOutput {
  success: boolean;
  total: number;             // Total matching issues
  startAt: number;           // Current offset
  maxResults: number;        // Results per page
  issues: Array<{
    key: string;
    id: string;
    summary: string;
    status: string;
    type: string;
    priority: string;
    assignee: string | null;
    created: string;
    updated: string;
    url: string;
  }>;
}
```

## Implementation

```javascript
async function searchJira(input) {
  const { JiraClient } = require('../tools/jira-client');
  const client = new JiraClient();

  const searchParams = {
    jql: input.jql,
    maxResults: input.maxResults || 50,
    startAt: input.startAt || 0,
    fields: input.fields || [
      'summary', 'status', 'issuetype', 'priority',
      'assignee', 'created', 'updated', 'labels'
    ]
  };

  if (input.expand) {
    searchParams.expand = input.expand;
  }

  const response = await client.search(searchParams);

  const issues = response.issues.map(issue => ({
    key: issue.key,
    id: issue.id,
    summary: issue.fields.summary,
    status: issue.fields.status?.name,
    type: issue.fields.issuetype?.name,
    priority: issue.fields.priority?.name,
    assignee: issue.fields.assignee?.displayName || null,
    created: issue.fields.created,
    updated: issue.fields.updated,
    labels: issue.fields.labels || [],
    url: `https://${process.env.ATLASSIAN_DOMAIN}/browse/${issue.key}`
  }));

  return {
    success: true,
    total: response.total,
    startAt: response.startAt,
    maxResults: response.maxResults,
    issues
  };
}

module.exports = { searchJira };
```

## JQL Reference

### Basic Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `=` | Equals | `status = "Open"` |
| `!=` | Not equals | `status != "Done"` |
| `~` | Contains text | `summary ~ "login"` |
| `!~` | Not contains | `summary !~ "test"` |
| `IN` | In list | `status IN ("Open", "In Progress")` |
| `NOT IN` | Not in list | `priority NOT IN ("Low", "Lowest")` |
| `IS` | Is value | `assignee IS EMPTY` |
| `IS NOT` | Is not value | `assignee IS NOT EMPTY` |

### Date Functions

| Function | Description | Example |
|----------|-------------|---------|
| `now()` | Current time | `created > now("-7d")` |
| `startOfDay()` | Start of day | `created >= startOfDay()` |
| `startOfWeek()` | Start of week | `updated >= startOfWeek()` |
| `startOfMonth()` | Start of month | `created >= startOfMonth()` |
| `endOfDay()` | End of day | `due <= endOfDay()` |

### User Functions

| Function | Description | Example |
|----------|-------------|---------|
| `currentUser()` | Logged in user | `assignee = currentUser()` |
| `membersOf()` | Group members | `assignee IN membersOf("developers")` |

### Sprint Functions

| Function | Description | Example |
|----------|-------------|---------|
| `openSprints()` | Active sprints | `sprint IN openSprints()` |
| `closedSprints()` | Closed sprints | `sprint IN closedSprints()` |
| `futureSprints()` | Future sprints | `sprint IN futureSprints()` |

## Usage Examples

### Find Open Bugs
```bash
@jira *search "project = PROJ AND type = Bug AND status != Done ORDER BY priority DESC"
```

### My In Progress Work
```bash
@jira *search "assignee = currentUser() AND status = 'In Progress'"
```

### Issues Updated This Week
```bash
@jira *search "project = PROJ AND updated >= startOfWeek() ORDER BY updated DESC"
```

### High Priority in Sprint
```bash
@jira *search "project = PROJ AND sprint IN openSprints() AND priority IN (High, Highest)"
```

### Unassigned Bugs
```bash
@jira *search "project = PROJ AND type = Bug AND assignee IS EMPTY"
```

### Text Search
```bash
@jira *search "project = PROJ AND text ~ 'authentication error'"
```

### Complex Query
```bash
@jira *search "project = PROJ \
  AND type = Bug \
  AND status NOT IN (Done, Closed) \
  AND (priority = High OR labels = urgent) \
  AND created >= -30d \
  ORDER BY created DESC" \
  --maxResults 100
```

## Output Formats

### Table Format (Default)
```
| Key       | Summary                    | Status      | Assignee    |
|-----------|----------------------------|-------------|-------------|
| PROJ-123  | Login button broken        | In Progress | John Doe    |
| PROJ-124  | Dashboard slow load        | Open        | -           |
```

### JSON Format
```bash
@jira *search "..." --format json
```

### CSV Export
```bash
@jira *search "..." --format csv > issues.csv
```

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| 400 | Invalid JQL | Check JQL syntax |
| 401 | Authentication failed | Verify API token |
| 403 | No permission | Check project access |

## Related Tasks

- `jira-create-issue` - Create from search results
- `jira-bulk-update` - Update multiple issues
- `jira-export` - Export search results
