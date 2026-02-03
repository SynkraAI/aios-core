# Task: Create Xray Test Case

## Metadata
```yaml
id: xray-create-test
name: Create Xray Test Case
agent: xray-agent
version: 1.0.0
```

## Description

Creates a new test case in Xray with specified type, steps, and coverage links.

## Input Schema

```typescript
interface XrayCreateTestInput {
  project: string;           // Required: Jira project key
  summary: string;           // Required: Test case title
  testType: 'Manual' | 'Cucumber' | 'Generic'; // Required: Test type
  description?: string;      // Optional: Test description
  steps?: Array<{            // Optional: Manual test steps
    action: string;
    data?: string;
    expectedResult: string;
  }>;
  gherkin?: string;          // Optional: Cucumber/Gherkin definition
  preconditions?: string[];  // Optional: Precondition issue keys
  covers?: string[];         // Optional: Requirements/stories covered
  labels?: string[];         // Optional: Labels
  folder?: string;           // Optional: Test repository folder
  priority?: string;         // Optional: Priority level
}
```

## Output Schema

```typescript
interface XrayCreateTestOutput {
  success: boolean;
  testKey: string;           // Created test issue key
  testId: string;            // Internal ID
  url: string;               // URL to test in Jira
  stepsCreated: number;      // Number of steps added
}
```

## Implementation

```javascript
async function createXrayTest(input) {
  const { JiraClient } = require('../tools/jira-client');
  const { XrayClient } = require('../tools/xray-client');
  const jiraClient = new JiraClient();
  const xrayClient = new XrayClient();

  // Create base issue as Test type
  const issueFields = {
    project: { key: input.project },
    issuetype: { name: 'Test' },
    summary: input.summary
  };

  if (input.description) {
    issueFields.description = {
      type: 'doc',
      version: 1,
      content: [{
        type: 'paragraph',
        content: [{ type: 'text', text: input.description }]
      }]
    };
  }

  if (input.labels) {
    issueFields.labels = input.labels;
  }

  if (input.priority) {
    issueFields.priority = { name: input.priority };
  }

  // Create the issue
  const issue = await jiraClient.createIssue({ fields: issueFields });

  // Set test type
  await xrayClient.setTestType(issue.key, input.testType);

  // Add steps for Manual tests
  let stepsCreated = 0;
  if (input.testType === 'Manual' && input.steps) {
    const stepsPayload = input.steps.map((step, idx) => ({
      index: idx + 1,
      action: step.action,
      data: step.data || '',
      result: step.expectedResult
    }));

    await xrayClient.setTestSteps(issue.key, stepsPayload);
    stepsCreated = input.steps.length;
  }

  // Set Gherkin for Cucumber tests
  if (input.testType === 'Cucumber' && input.gherkin) {
    await xrayClient.setGherkinDefinition(issue.key, input.gherkin);
  }

  // Link to preconditions
  if (input.preconditions) {
    for (const precondKey of input.preconditions) {
      await jiraClient.linkIssues(issue.key, precondKey, 'has precondition');
    }
  }

  // Link to requirements (coverage)
  if (input.covers) {
    for (const reqKey of input.covers) {
      await jiraClient.linkIssues(issue.key, reqKey, 'tests');
    }
  }

  // Set folder in test repository
  if (input.folder) {
    await xrayClient.moveToFolder(issue.key, input.folder);
  }

  return {
    success: true,
    testKey: issue.key,
    testId: issue.id,
    url: `https://${process.env.ATLASSIAN_DOMAIN}/browse/${issue.key}`,
    stepsCreated
  };
}

module.exports = { createXrayTest };
```

## Test Types

### Manual Test
```bash
@xray *create-test \
  --project PROJ \
  --summary "Verify login with valid credentials" \
  --testType "Manual" \
  --steps '[
    {"action": "Navigate to login page", "expectedResult": "Login form is displayed"},
    {"action": "Enter valid username", "data": "testuser@example.com", "expectedResult": "Username is accepted"},
    {"action": "Enter valid password", "data": "ValidP@ss123", "expectedResult": "Password is masked"},
    {"action": "Click Login button", "expectedResult": "User is redirected to dashboard"}
  ]' \
  --covers "PROJ-STORY-10"
```

### Cucumber Test
```bash
@xray *create-test \
  --project PROJ \
  --summary "Login with valid credentials" \
  --testType "Cucumber" \
  --gherkin "$(cat <<'EOF'
Scenario: Valid login
  Given I am on the login page
  When I enter username "user@example.com"
  And I enter password "ValidPass123"
  And I click the login button
  Then I should be redirected to the dashboard
  And I should see a welcome message
EOF
)" \
  --covers "PROJ-STORY-10"
```

### Generic Test
```bash
@xray *create-test \
  --project PROJ \
  --summary "API load test - /api/users endpoint" \
  --testType "Generic" \
  --description "Automated load test that verifies the /api/users endpoint can handle 1000 req/s" \
  --labels "automated,load-test,api"
```

## Usage Examples

### Create from Bug
```bash
# Create regression test from bug
@xray *create-test \
  --project PROJ \
  --summary "Verify fix: Login timeout issue (PROJ-BUG-45)" \
  --testType "Manual" \
  --steps '[
    {"action": "Navigate to login page", "expectedResult": "Page loads in <3s"},
    {"action": "Enter valid credentials and submit", "expectedResult": "Login completes in <5s"},
    {"action": "Verify no timeout error", "expectedResult": "Dashboard displayed successfully"}
  ]' \
  --covers "PROJ-BUG-45" \
  --labels "regression,bug-fix"
```

### Create with Precondition
```bash
@xray *create-test \
  --project PROJ \
  --summary "Verify admin can delete users" \
  --testType "Manual" \
  --preconditions "PROJ-PRECOND-1" \
  --steps '[
    {"action": "Navigate to User Management", "expectedResult": "User list displayed"},
    {"action": "Select a user and click Delete", "expectedResult": "Confirmation dialog appears"},
    {"action": "Confirm deletion", "expectedResult": "User is removed from list"}
  ]'
```

### Bulk Create from Template
```javascript
// Generate tests from requirements
const requirements = ['PROJ-REQ-1', 'PROJ-REQ-2', 'PROJ-REQ-3'];

for (const req of requirements) {
  await createXrayTest({
    project: 'PROJ',
    summary: `Test for ${req}`,
    testType: 'Manual',
    covers: [req],
    steps: [
      { action: 'Verify requirement implementation', expectedResult: 'Requirement is met' }
    ]
  });
}
```

## Output Example

```json
{
  "success": true,
  "testKey": "PROJ-T123",
  "testId": "10456",
  "url": "https://company.atlassian.net/browse/PROJ-T123",
  "stepsCreated": 4
}
```

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| 400 | Invalid test type | Use Manual, Cucumber, or Generic |
| 401 | Authentication failed | Check credentials |
| 403 | No permission | Verify test creation permission |
| 404 | Project not found | Check project key |

## Related Tasks

- `xray-create-execution` - Execute created tests
- `jira-link` - Link to additional issues
- `xray-coverage-report` - Check coverage
