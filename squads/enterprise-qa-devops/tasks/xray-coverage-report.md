# Task: Generate Xray Coverage Report

## Metadata
```yaml
id: xray-coverage-report
name: Generate Xray Coverage Report
agent: xray-agent
version: 1.0.0
```

## Description

Generates a test coverage report showing which requirements are covered by tests.

## Input Schema

```typescript
interface XrayCoverageReportInput {
  testPlan?: string;         // Optional: Test plan issue key
  project?: string;          // Optional: Project key (if no test plan)
  version?: string;          // Optional: Fix version to analyze
  components?: string[];     // Optional: Components to filter
  labels?: string[];         // Optional: Labels to filter
  format?: 'markdown' | 'json' | 'html'; // Optional: Output format
  includeUncovered?: boolean;// Optional: Include uncovered items
}
```

## Output Schema

```typescript
interface XrayCoverageReportOutput {
  success: boolean;
  summary: {
    totalRequirements: number;
    covered: number;
    notCovered: number;
    coveragePercent: number;
    totalTests: number;
    passedTests: number;
    failedTests: number;
  };
  byComponent?: Array<{
    component: string;
    total: number;
    covered: number;
    percent: number;
  }>;
  uncovered?: Array<{
    key: string;
    summary: string;
    type: string;
    priority: string;
  }>;
  report: string;           // Formatted report
}
```

## Implementation

```javascript
async function generateCoverageReport(input) {
  const { JiraClient } = require('../tools/jira-client');
  const { XrayClient } = require('../tools/xray-client');
  const jiraClient = new JiraClient();
  const xrayClient = new XrayClient();

  let requirements = [];
  let tests = [];

  // Get requirements based on input
  if (input.testPlan) {
    // Get requirements linked to test plan
    const planData = await xrayClient.getTestPlanCoverage(input.testPlan);
    requirements = planData.requirements;
    tests = planData.tests;
  } else if (input.project) {
    // Search for requirements in project
    let jql = `project = ${input.project} AND issuetype IN (Story, "User Story", Requirement, Epic)`;

    if (input.version) {
      jql += ` AND fixVersion = "${input.version}"`;
    }
    if (input.components) {
      jql += ` AND component IN (${input.components.map(c => `"${c}"`).join(',')})`;
    }
    if (input.labels) {
      jql += ` AND labels IN (${input.labels.join(',')})`;
    }

    const reqSearch = await jiraClient.search({ jql, maxResults: 500 });
    requirements = reqSearch.issues;

    // Get tests covering these requirements
    for (const req of requirements) {
      const coverage = await xrayClient.getTestsCovering(req.key);
      req.tests = coverage.tests || [];
      req.isCovered = req.tests.length > 0;
    }
  }

  // Calculate statistics
  const covered = requirements.filter(r => r.isCovered).length;
  const notCovered = requirements.length - covered;
  const coveragePercent = requirements.length > 0
    ? Math.round((covered / requirements.length) * 100)
    : 0;

  // Group by component
  const byComponent = {};
  for (const req of requirements) {
    const components = req.fields?.components || [{ name: 'No Component' }];
    for (const comp of components) {
      if (!byComponent[comp.name]) {
        byComponent[comp.name] = { total: 0, covered: 0 };
      }
      byComponent[comp.name].total++;
      if (req.isCovered) {
        byComponent[comp.name].covered++;
      }
    }
  }

  const componentStats = Object.entries(byComponent).map(([name, stats]) => ({
    component: name,
    total: stats.total,
    covered: stats.covered,
    percent: Math.round((stats.covered / stats.total) * 100)
  }));

  // Get uncovered requirements
  const uncovered = requirements
    .filter(r => !r.isCovered)
    .map(r => ({
      key: r.key,
      summary: r.fields?.summary,
      type: r.fields?.issuetype?.name,
      priority: r.fields?.priority?.name
    }));

  // Count test results
  let passedTests = 0, failedTests = 0;
  for (const test of tests) {
    if (test.status === 'PASS') passedTests++;
    else if (test.status === 'FAIL') failedTests++;
  }

  // Generate formatted report
  const report = formatReport(input.format || 'markdown', {
    testPlan: input.testPlan,
    project: input.project,
    summary: {
      totalRequirements: requirements.length,
      covered,
      notCovered,
      coveragePercent,
      totalTests: tests.length,
      passedTests,
      failedTests
    },
    byComponent: componentStats,
    uncovered: input.includeUncovered ? uncovered : []
  });

  return {
    success: true,
    summary: {
      totalRequirements: requirements.length,
      covered,
      notCovered,
      coveragePercent,
      totalTests: tests.length,
      passedTests,
      failedTests
    },
    byComponent: componentStats,
    uncovered: input.includeUncovered ? uncovered : undefined,
    report
  };
}

function formatReport(format, data) {
  if (format === 'json') {
    return JSON.stringify(data, null, 2);
  }

  if (format === 'html') {
    return generateHtmlReport(data);
  }

  // Default: markdown
  return `## Test Coverage Report${data.testPlan ? `: ${data.testPlan}` : ''}

### Summary
- **Total Requirements:** ${data.summary.totalRequirements}
- **Covered:** ${data.summary.covered} (${data.summary.coveragePercent}%)
- **Not Covered:** ${data.summary.notCovered}
- **Total Tests:** ${data.summary.totalTests}
- **Passed:** ${data.summary.passedTests} | **Failed:** ${data.summary.failedTests}

### Coverage by Component
| Component | Total | Covered | Coverage |
|-----------|-------|---------|----------|
${data.byComponent.map(c =>
  `| ${c.component} | ${c.total} | ${c.covered} | ${c.percent}% |`
).join('\n')}

${data.uncovered.length > 0 ? `### Uncovered Requirements
| Key | Summary | Type | Priority |
|-----|---------|------|----------|
${data.uncovered.map(u =>
  `| ${u.key} | ${u.summary} | ${u.type} | ${u.priority} |`
).join('\n')}` : ''}

---
*Generated: ${new Date().toISOString()}*
`;
}

module.exports = { generateCoverageReport };
```

## Usage Examples

### Test Plan Coverage
```bash
@xray *coverage-report --testPlan PROJ-100
```

### Project Coverage with Filters
```bash
@xray *coverage-report \
  --project PROJ \
  --version "1.2.0" \
  --components "Frontend,Backend" \
  --includeUncovered
```

### JSON Output for CI
```bash
@xray *coverage-report \
  --testPlan PROJ-100 \
  --format json > coverage.json
```

### Coverage with Threshold Check
```bash
coverage=$(@xray *coverage-report --testPlan PROJ-100 --format json | jq '.summary.coveragePercent')
if [ "$coverage" -lt 80 ]; then
  echo "Coverage $coverage% is below 80% threshold"
  exit 1
fi
```

## Sample Output (Markdown)

```markdown
## Test Coverage Report: PROJ-100

### Summary
- **Total Requirements:** 25
- **Covered:** 22 (88%)
- **Not Covered:** 3
- **Total Tests:** 47
- **Passed:** 42 | **Failed:** 5

### Coverage by Component
| Component | Total | Covered | Coverage |
|-----------|-------|---------|----------|
| Login | 5 | 5 | 100% |
| Dashboard | 8 | 7 | 87% |
| Reports | 12 | 10 | 83% |

### Uncovered Requirements
| Key | Summary | Type | Priority |
|-----|---------|------|----------|
| PROJ-15 | Password reset flow | Story | High |
| PROJ-22 | Export to PDF | Story | Medium |
| PROJ-31 | Bulk delete | Story | Low |

---
*Generated: 2026-02-04T10:30:00Z*
```

## Integration with Confluence

```bash
# Generate and publish to Confluence
report=$(@xray *coverage-report --testPlan PROJ-100)
@confluence *update-page \
  --id 12345 \
  --append-section "Latest Coverage" \
  --content "$report"
```

## Handoff to Other Agents

```bash
# Notify team about coverage
@xray *coverage-report --testPlan PROJ-100 --format json > /tmp/coverage.json
@o365 *send-teams \
  --channel "QA-Updates" \
  --message "Coverage Report: $(jq '.summary.coveragePercent' /tmp/coverage.json)% covered"
```

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| 401 | Authentication failed | Check credentials |
| 404 | Test plan not found | Verify test plan key |
| NO_REQUIREMENTS | No requirements found | Check JQL filters |

## Related Tasks

- `confluence-create-page` - Create coverage documentation
- `o365-send-teams` - Notify team of results
- `xray-create-execution` - Run tests to improve coverage
