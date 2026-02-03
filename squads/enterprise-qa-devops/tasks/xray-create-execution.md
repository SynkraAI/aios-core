# Task: Create Xray Test Execution

## Metadata
```yaml
id: xray-create-execution
name: Create Xray Test Execution
agent: xray-agent
version: 1.0.0
```

## Description

Creates a new test execution in Xray with specified tests and configuration.

## Input Schema

```typescript
interface XrayCreateExecutionInput {
  project: string;           // Required: Jira project key
  summary: string;           // Required: Execution title
  description?: string;      // Optional: Execution description
  testPlan?: string;         // Optional: Test plan to link
  tests?: string[];          // Optional: Test issue keys to include
  testSets?: string[];       // Optional: Test set keys to include
  environments?: string[];   // Optional: Test environments
  fixVersion?: string;       // Optional: Version being tested
  assignee?: string;         // Optional: Assignee email
  startDate?: string;        // Optional: Start date (ISO format)
  finishDate?: string;       // Optional: Finish date
  labels?: string[];         // Optional: Labels
}
```

## Output Schema

```typescript
interface XrayCreateExecutionOutput {
  success: boolean;
  executionKey: string;      // Created execution issue key
  executionId: string;       // Internal ID
  url: string;               // URL to execution in Jira
  testsIncluded: number;     // Number of tests included
}
```

## Implementation

```javascript
async function createXrayExecution(input) {
  const { JiraClient } = require('../tools/jira-client');
  const { XrayClient } = require('../tools/xray-client');
  const jiraClient = new JiraClient();
  const xrayClient = new XrayClient();

  // Create base issue as Test Execution type
  const issueFields = {
    project: { key: input.project },
    issuetype: { name: 'Test Execution' },
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

  if (input.fixVersion) {
    issueFields.fixVersions = [{ name: input.fixVersion }];
  }

  if (input.assignee) {
    const accountId = await jiraClient.getAccountId(input.assignee);
    issueFields.assignee = { accountId };
  }

  // Create the execution issue
  const execution = await jiraClient.createIssue({ fields: issueFields });

  // Link to test plan if provided
  if (input.testPlan) {
    await jiraClient.linkIssues(execution.key, input.testPlan, 'is executed for');
  }

  // Add tests to execution
  let testsIncluded = 0;

  if (input.tests && input.tests.length > 0) {
    await xrayClient.addTestsToExecution(execution.key, input.tests);
    testsIncluded += input.tests.length;
  }

  // Add tests from test sets
  if (input.testSets && input.testSets.length > 0) {
    for (const testSetKey of input.testSets) {
      const tests = await xrayClient.getTestsInSet(testSetKey);
      await xrayClient.addTestsToExecution(execution.key, tests.map(t => t.key));
      testsIncluded += tests.length;
    }
  }

  // Set test environments
  if (input.environments) {
    await xrayClient.setExecutionEnvironments(execution.key, input.environments);
  }

  // Set dates if provided
  if (input.startDate || input.finishDate) {
    await xrayClient.setExecutionDates(execution.key, {
      startDate: input.startDate,
      finishDate: input.finishDate
    });
  }

  return {
    success: true,
    executionKey: execution.key,
    executionId: execution.id,
    url: `https://${process.env.ATLASSIAN_DOMAIN}/browse/${execution.key}`,
    testsIncluded
  };
}

module.exports = { createXrayExecution };
```

## Usage Examples

### Basic Execution
```bash
@xray *create-execution \
  --project PROJ \
  --summary "Sprint 15 Regression Tests"
```

### Full Execution Setup
```bash
@xray *create-execution \
  --project PROJ \
  --summary "Release 1.2.0 - Full Regression" \
  --description "Complete regression test suite for v1.2.0 release candidate" \
  --testPlan PROJ-100 \
  --tests "PROJ-T001,PROJ-T002,PROJ-T003" \
  --environments "Chrome,Firefox,Safari" \
  --fixVersion "1.2.0" \
  --assignee "qa@company.com" \
  --labels "release,regression"
```

### From Test Sets
```bash
@xray *create-execution \
  --project PROJ \
  --summary "Smoke Tests - Build #456" \
  --testSets "PROJ-TS-SMOKE,PROJ-TS-CRITICAL" \
  --environments "Production"
```

### Scheduled Execution
```bash
@xray *create-execution \
  --project PROJ \
  --summary "Scheduled Nightly Tests - $(date +%Y-%m-%d)" \
  --testPlan PROJ-100 \
  --startDate "$(date -Iseconds)" \
  --assignee "qa-automation@company.com" \
  --labels "nightly,automated"
```

### CI/CD Integration
```yaml
# GitHub Actions
- name: Create Test Execution
  id: create_exec
  run: |
    result=$(@xray *create-execution \
      --project PROJ \
      --summary "CI Build #${{ github.run_number }}" \
      --testPlan PROJ-100 \
      --fixVersion "${{ github.ref_name }}" \
      --format json)
    echo "execution_key=$(echo $result | jq -r '.executionKey')" >> $GITHUB_OUTPUT

- name: Run Tests
  run: pytest --xray-execution ${{ steps.create_exec.outputs.execution_key }}
```

## Execution Workflow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Create     │────▶│   Add       │────▶│   Execute   │
│  Execution  │     │   Tests     │     │   Tests     │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                    ┌─────────────┐             │
                    │   Report    │◀────────────┘
                    │   Results   │
                    └─────────────┘
```

## Test Status Values

| Status | Description |
|--------|-------------|
| TODO | Test not yet executed |
| EXECUTING | Test in progress |
| PASS | Test passed |
| FAIL | Test failed |
| ABORTED | Test aborted |
| BLOCKED | Test blocked by issue |

## Output Example

```json
{
  "success": true,
  "executionKey": "PROJ-EXEC-456",
  "executionId": "20789",
  "url": "https://company.atlassian.net/browse/PROJ-EXEC-456",
  "testsIncluded": 47
}
```

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| 400 | Invalid test keys | Verify test issue keys |
| 401 | Authentication failed | Check credentials |
| 403 | No permission | Verify create permission |
| 404 | Test/test set not found | Check keys exist |

## Related Tasks

- `xray-import-junit` - Import automated results
- `xray-import-cucumber` - Import BDD results
- `xray-coverage-report` - Report on execution
