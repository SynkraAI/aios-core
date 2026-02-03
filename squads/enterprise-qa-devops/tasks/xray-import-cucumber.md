# Task: Import Cucumber Results to Xray

## Metadata
```yaml
id: xray-import-cucumber
name: Import Cucumber Results
agent: xray-agent
version: 1.0.0
```

## Description

Imports Cucumber JSON test results into Xray, mapping scenarios to test cases.

## Input Schema

```typescript
interface XrayImportCucumberInput {
  file: string;              // Required: Path to Cucumber JSON file
  project: string;           // Required: Jira project key
  testPlan?: string;         // Optional: Test plan issue key
  testExecution?: string;    // Optional: Existing execution to update
  testEnvironments?: string[];// Optional: Test environments
  fixVersion?: string;       // Optional: Version being tested
  revision?: string;         // Optional: Git revision
  summary?: string;          // Optional: Execution summary
}
```

## Output Schema

```typescript
interface XrayImportCucumberOutput {
  success: boolean;
  executionKey: string;
  executionUrl: string;
  scenariosImported: number;
  passed: number;
  failed: number;
  skipped: number;
  pending: number;
  duration: number;
}
```

## Implementation

```javascript
async function importCucumberResults(input) {
  const { XrayClient } = require('../tools/xray-client');
  const fs = require('fs');
  const client = new XrayClient();

  // Read Cucumber JSON
  const jsonContent = fs.readFileSync(input.file, 'utf-8');
  const cucumberData = JSON.parse(jsonContent);

  // Build query params
  const queryParams = new URLSearchParams();
  queryParams.append('projectKey', input.project);

  if (input.testPlan) {
    queryParams.append('testPlanKey', input.testPlan);
  }

  if (input.testExecution) {
    queryParams.append('testExecKey', input.testExecution);
  }

  if (input.fixVersion) {
    queryParams.append('fixVersion', input.fixVersion);
  }

  if (input.revision) {
    queryParams.append('revision', input.revision);
  }

  if (input.testEnvironments) {
    queryParams.append('testEnvironments', input.testEnvironments.join(';'));
  }

  // Import
  const response = await client.importCucumber(cucumberData, queryParams);

  // Calculate stats
  const stats = parseCucumberStats(cucumberData);

  return {
    success: true,
    executionKey: response.key,
    executionUrl: `https://${process.env.ATLASSIAN_DOMAIN}/browse/${response.key}`,
    scenariosImported: stats.total,
    passed: stats.passed,
    failed: stats.failed,
    skipped: stats.skipped,
    pending: stats.pending,
    duration: stats.duration
  };
}

function parseCucumberStats(cucumberData) {
  let total = 0, passed = 0, failed = 0, skipped = 0, pending = 0, duration = 0;

  for (const feature of cucumberData) {
    for (const element of feature.elements || []) {
      if (element.type !== 'scenario') continue;

      total++;
      let scenarioStatus = 'passed';

      for (const step of element.steps || []) {
        duration += (step.result?.duration || 0) / 1000000000; // ns to s

        const status = step.result?.status;
        if (status === 'failed') {
          scenarioStatus = 'failed';
        } else if (status === 'skipped' && scenarioStatus === 'passed') {
          scenarioStatus = 'skipped';
        } else if (status === 'pending' && scenarioStatus === 'passed') {
          scenarioStatus = 'pending';
        }
      }

      if (scenarioStatus === 'passed') passed++;
      else if (scenarioStatus === 'failed') failed++;
      else if (scenarioStatus === 'skipped') skipped++;
      else if (scenarioStatus === 'pending') pending++;
    }
  }

  return { total, passed, failed, skipped, pending, duration };
}

module.exports = { importCucumberResults };
```

## Cucumber JSON Format

### Standard Format
```json
[
  {
    "uri": "features/login.feature",
    "id": "login-feature",
    "name": "Login Feature",
    "description": "As a user I want to login",
    "keyword": "Feature",
    "tags": [
      {"name": "@PROJ-T001"}
    ],
    "elements": [
      {
        "id": "login-feature;valid-credentials",
        "name": "Login with valid credentials",
        "keyword": "Scenario",
        "type": "scenario",
        "tags": [
          {"name": "@PROJ-T001"},
          {"name": "@smoke"}
        ],
        "steps": [
          {
            "keyword": "Given ",
            "name": "I am on the login page",
            "result": {
              "status": "passed",
              "duration": 1234567890
            }
          },
          {
            "keyword": "When ",
            "name": "I enter valid credentials",
            "result": {
              "status": "passed",
              "duration": 2345678901
            }
          },
          {
            "keyword": "Then ",
            "name": "I should be redirected to dashboard",
            "result": {
              "status": "passed",
              "duration": 3456789012
            }
          }
        ]
      }
    ]
  }
]
```

### With Xray Tags
```gherkin
@PROJ-REQ-10
Feature: User Authentication

  @PROJ-T001
  Scenario: Valid login
    Given I am on the login page
    When I enter valid credentials
    Then I should see the dashboard

  @PROJ-T002 @smoke
  Scenario: Invalid password
    Given I am on the login page
    When I enter an invalid password
    Then I should see an error message
```

## Usage Examples

### Basic Import
```bash
@xray *import-cucumber --file ./results/cucumber.json --project PROJ
```

### Full Import
```bash
@xray *import-cucumber \
  --file ./test-output/cucumber-report.json \
  --project PROJ \
  --testPlan PROJ-100 \
  --fixVersion "1.2.0" \
  --environments "Chrome,Linux" \
  --summary "BDD Tests - Sprint 15"
```

### CI/CD Integration
```yaml
# GitHub Actions
- name: Run Cucumber Tests
  run: npx cucumber-js --format json:cucumber-report.json

- name: Import to Xray
  run: |
    @xray *import-cucumber \
      --file cucumber-report.json \
      --project PROJ \
      --testPlan PROJ-100 \
      --revision ${{ github.sha }}
```

## Mapping to Xray

| Cucumber Element | Xray Entity |
|------------------|-------------|
| Feature | Test Set (optional) |
| Scenario | Test Case |
| Scenario Outline | Precondition + Test Case |
| @PROJ-T001 tag | Links to existing test |
| @PROJ-REQ-10 tag | Links to requirement |

## Output Example

```json
{
  "success": true,
  "executionKey": "PROJ-EXEC-789",
  "executionUrl": "https://company.atlassian.net/browse/PROJ-EXEC-789",
  "scenariosImported": 25,
  "passed": 22,
  "failed": 2,
  "skipped": 0,
  "pending": 1,
  "duration": 145.7
}
```

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| 400 | Invalid JSON format | Validate Cucumber JSON |
| 401 | Authentication failed | Check Xray credentials |
| 404 | Project/test not found | Verify keys |
| 413 | File too large | Split features |

## Related Tasks

- `xray-import-junit` - Import JUnit results
- `xray-export-tests` - Export as Cucumber features
- `xray-coverage-report` - Coverage after import
