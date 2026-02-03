# Task: Import JUnit Results to Xray

## Metadata
```yaml
id: xray-import-junit
name: Import JUnit Results
agent: xray-agent
version: 1.0.0
```

## Description

Imports JUnit XML test results into Xray, creating or updating test executions.

## Input Schema

```typescript
interface XrayImportJunitInput {
  file: string;              // Required: Path to JUnit XML file
  project: string;           // Required: Jira project key
  testPlan?: string;         // Optional: Test plan issue key
  testExecution?: string;    // Optional: Existing execution to update
  environments?: string[];   // Optional: Test environments
  fixVersion?: string;       // Optional: Version being tested
  revision?: string;         // Optional: Git revision/commit
  summary?: string;          // Optional: Execution summary
  testEnvironments?: string[];// Optional: Xray test environments
}
```

## Output Schema

```typescript
interface XrayImportJunitOutput {
  success: boolean;
  executionKey: string;      // Test execution issue key
  executionUrl: string;      // URL to execution in Jira
  testsImported: number;     // Number of tests imported
  passed: number;
  failed: number;
  skipped: number;
  errors: number;
  duration: number;          // Total duration in seconds
}
```

## Implementation

```javascript
async function importJunitResults(input) {
  const { XrayClient } = require('../tools/xray-client');
  const fs = require('fs');
  const path = require('path');
  const xml2js = require('xml2js');
  const client = new XrayClient();

  // Read and parse JUnit XML
  const xmlContent = fs.readFileSync(input.file, 'utf-8');
  const parser = new xml2js.Parser();
  const junitData = await parser.parseStringPromise(xmlContent);

  // Build import payload
  const importPayload = {
    info: {
      project: input.project,
      summary: input.summary || `JUnit Import - ${path.basename(input.file)}`,
      startDate: new Date().toISOString()
    }
  };

  // Add optional fields
  if (input.testPlan) {
    importPayload.info.testPlanKey = input.testPlan;
  }

  if (input.fixVersion) {
    importPayload.info.version = input.fixVersion;
  }

  if (input.revision) {
    importPayload.info.revision = input.revision;
  }

  if (input.testEnvironments) {
    importPayload.info.testEnvironments = input.testEnvironments;
  }

  // Import using multipart form
  const formData = new FormData();
  formData.append('file', fs.createReadStream(input.file));

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

  const response = await client.importJunit(formData, queryParams);

  // Parse results
  const stats = parseJunitStats(junitData);

  return {
    success: true,
    executionKey: response.key,
    executionUrl: `https://${process.env.ATLASSIAN_DOMAIN}/browse/${response.key}`,
    testsImported: stats.total,
    passed: stats.passed,
    failed: stats.failed,
    skipped: stats.skipped,
    errors: stats.errors,
    duration: stats.duration
  };
}

function parseJunitStats(junitData) {
  let total = 0, passed = 0, failed = 0, skipped = 0, errors = 0, duration = 0;

  const testsuites = junitData.testsuites?.testsuite || [junitData.testsuite];

  for (const suite of testsuites) {
    if (!suite) continue;

    const attrs = suite.$ || {};
    total += parseInt(attrs.tests || 0);
    failed += parseInt(attrs.failures || 0);
    errors += parseInt(attrs.errors || 0);
    skipped += parseInt(attrs.skipped || 0);
    duration += parseFloat(attrs.time || 0);
  }

  passed = total - failed - errors - skipped;

  return { total, passed, failed, skipped, errors, duration };
}

module.exports = { importJunitResults };
```

## JUnit XML Format

### Standard Format
```xml
<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite name="LoginTests" tests="3" failures="1" errors="0" skipped="0" time="5.234">
    <testcase name="test_valid_login" classname="tests.test_login" time="1.234">
    </testcase>
    <testcase name="test_invalid_password" classname="tests.test_login" time="2.000">
      <failure message="AssertionError: Expected redirect">
        <![CDATA[
        AssertionError: Expected redirect to /dashboard
        at test_invalid_password (tests/test_login.py:25)
        ]]>
      </failure>
    </testcase>
    <testcase name="test_locked_account" classname="tests.test_login" time="2.000">
    </testcase>
  </testsuite>
</testsuites>
```

### With Xray Properties
```xml
<testcase name="test_login" classname="tests.test_auth">
  <properties>
    <property name="test_key" value="PROJ-T001"/>
    <property name="requirements" value="PROJ-REQ-10,PROJ-REQ-11"/>
  </properties>
</testcase>
```

## Usage Examples

### Basic Import
```bash
@xray *import-junit --file ./results/junit.xml --project PROJ
```

### Full Import with Context
```bash
@xray *import-junit \
  --file ./test-results/junit.xml \
  --project PROJ \
  --testPlan PROJ-100 \
  --fixVersion "1.2.0" \
  --revision "abc123" \
  --environments "Chrome,Windows" \
  --summary "CI Build #456 - Regression Tests"
```

### Update Existing Execution
```bash
@xray *import-junit \
  --file ./results/junit.xml \
  --project PROJ \
  --testExecution PROJ-EXEC-789
```

### CI/CD Integration
```yaml
# GitHub Actions
- name: Run Tests
  run: pytest --junitxml=results.xml

- name: Import to Xray
  run: |
    @xray *import-junit \
      --file results.xml \
      --project PROJ \
      --testPlan PROJ-100 \
      --revision ${{ github.sha }} \
      --summary "Build #${{ github.run_number }}"
```

## Output Example

```json
{
  "success": true,
  "executionKey": "PROJ-EXEC-456",
  "executionUrl": "https://company.atlassian.net/browse/PROJ-EXEC-456",
  "testsImported": 47,
  "passed": 42,
  "failed": 3,
  "skipped": 2,
  "errors": 0,
  "duration": 125.5
}
```

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| 400 | Invalid XML format | Validate JUnit XML |
| 401 | Authentication failed | Check Xray credentials |
| 404 | Project not found | Verify project key |
| 413 | File too large | Split into smaller files |

## Related Tasks

- `xray-import-cucumber` - Import Cucumber results
- `xray-coverage-report` - Generate coverage after import
- `xray-create-execution` - Create execution manually
