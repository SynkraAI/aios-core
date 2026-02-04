# Enterprise QA DevOps Squad - Use Cases

> Concrete scenarios and real-world examples for enterprise integration

**Version:** 1.0.0
**Last Updated:** 2026-02-04

---

## Table of Contents

1. [Automated Test Result Sync](#1-automated-test-result-sync)
2. [Sprint Documentation Generation](#2-sprint-documentation-generation)
3. [Cross-Platform Notification Workflow](#3-cross-platform-notification-workflow)
4. [Test Coverage Reporting](#4-test-coverage-reporting)
5. [Incident Response Automation](#5-incident-response-automation)
6. [Release Documentation Pipeline](#6-release-documentation-pipeline)

---

## 1. Automated Test Result Sync

### Scenario
After CI/CD pipeline completes, automatically sync JUnit test results to Xray, create/update Jira issues for failures, and notify the team via Microsoft Teams.

### Workflow

```javascript
const { JiraClient } = require('./tools/jira-client');
const { XrayClient } = require('./tools/xray-client');
const { GraphClient } = require('./tools/graph-client');
const { SecretsManager } = require('./tools/secrets-manager');

async function syncTestResults(junitPath, projectKey, teamsChannelId) {
  // Initialize clients with resilience patterns
  const secrets = new SecretsManager({ backend: 'azure' });

  const jira = new JiraClient({
    domain: await secrets.get('ATLASSIAN_DOMAIN'),
    email: await secrets.get('ATLASSIAN_EMAIL'),
    apiToken: await secrets.get('ATLASSIAN_API_TOKEN')
  });

  const xray = new XrayClient({
    clientId: await secrets.get('XRAY_CLIENT_ID'),
    clientSecret: await secrets.get('XRAY_CLIENT_SECRET')
  });

  const graph = new GraphClient({
    clientId: await secrets.get('MS365_CLIENT_ID'),
    clientSecret: await secrets.get('MS365_CLIENT_SECRET'),
    tenantId: await secrets.get('MS365_TENANT_ID')
  });

  // Step 1: Import test results to Xray
  const execution = await xray.importJunit(junitPath, {
    projectKey,
    testPlanKey: `${projectKey}-TP-1`
  });
  console.log(`Created test execution: ${execution.key}`);

  // Step 2: Find failed tests and create Jira bugs
  const failures = await extractFailures(junitPath);
  const createdBugs = [];

  for (const failure of failures) {
    const bug = await jira.createIssue({
      fields: {
        project: { key: projectKey },
        issuetype: { name: 'Bug' },
        summary: `[Auto] Test failure: ${failure.testName}`,
        description: {
          type: 'doc',
          version: 1,
          content: [{
            type: 'paragraph',
            content: [{ type: 'text', text: failure.message }]
          }]
        },
        labels: ['automation', 'test-failure']
      }
    });
    createdBugs.push(bug);

    // Link bug to test execution
    await jira.linkIssues(bug.key, execution.key, 'Blocks');
  }

  // Step 3: Notify team via Teams
  const summary = {
    total: execution.testCount,
    passed: execution.passCount,
    failed: failures.length,
    bugs: createdBugs.map(b => b.key)
  };

  await graph.postChannelMessage(teamId, teamsChannelId, {
    body: {
      contentType: 'html',
      content: buildTeamsMessage(summary)
    }
  });

  return { execution, bugs: createdBugs };
}
```

### Benefits
- **Automatic traceability**: Test failures linked to Jira bugs
- **Real-time visibility**: Team notified immediately in Teams
- **Audit trail**: Complete history in Xray test executions

---

## 2. Sprint Documentation Generation

### Scenario
At sprint end, automatically generate a Confluence page documenting all completed stories, test coverage, and metrics.

### Workflow

```javascript
const { JiraClient } = require('./tools/jira-client');
const { ConfluenceClient } = require('./tools/confluence-client');
const { XrayClient } = require('./tools/xray-client');

async function generateSprintReport(boardId, sprintId, confluenceSpace) {
  const jira = new JiraClient({ /* credentials */ });
  const confluence = new ConfluenceClient({ /* credentials */ });
  const xray = new XrayClient({ /* credentials */ });

  // Step 1: Get sprint data
  const sprint = await jira.getSprints(boardId)
    .then(s => s.values.find(sp => sp.id === sprintId));

  // Step 2: Get completed stories
  const stories = await jira.searchWithJql(
    `sprint = ${sprintId} AND status = Done AND issuetype = Story`,
    { fields: ['summary', 'status', 'assignee', 'customfield_10001'] }
  );

  // Step 3: Get test coverage for each story
  const coverage = [];
  for (const story of stories.issues) {
    const tests = await xray.getTestsCovering(story.key);
    coverage.push({
      story: story.key,
      summary: story.fields.summary,
      tests: tests.results?.length || 0,
      coverage: calculateCoverage(tests)
    });
  }

  // Step 4: Generate Confluence page
  const pageContent = buildSprintReportHTML({
    sprint,
    stories: stories.issues,
    coverage,
    metrics: calculateSprintMetrics(stories, coverage)
  });

  const page = await confluence.createPage(
    confluenceSpace,
    `Sprint ${sprint.name} Report - ${new Date().toISOString().split('T')[0]}`,
    pageContent,
    {
      parentTitle: 'Sprint Reports',
      labels: ['sprint-report', 'automated', sprint.name]
    }
  );

  return page;
}

function buildSprintReportHTML({ sprint, stories, coverage, metrics }) {
  return `
    <h2>Sprint Summary</h2>
    <ac:structured-macro ac:name="info">
      <ac:rich-text-body>
        <p><strong>Sprint:</strong> ${sprint.name}</p>
        <p><strong>Stories Completed:</strong> ${stories.length}</p>
        <p><strong>Average Coverage:</strong> ${metrics.avgCoverage}%</p>
      </ac:rich-text-body>
    </ac:structured-macro>

    <h2>Completed Stories</h2>
    <table>
      <tr><th>Key</th><th>Summary</th><th>Tests</th><th>Coverage</th></tr>
      ${coverage.map(c => `
        <tr>
          <td><a href="...">${c.story}</a></td>
          <td>${c.summary}</td>
          <td>${c.tests}</td>
          <td>${c.coverage}%</td>
        </tr>
      `).join('')}
    </table>
  `;
}
```

### Benefits
- **Consistent documentation**: Same format every sprint
- **Time savings**: Automated report generation
- **Stakeholder visibility**: Reports linked from Confluence

---

## 3. Cross-Platform Notification Workflow

### Scenario
When a critical bug is created in Jira, automatically notify relevant stakeholders via email (Outlook) and Teams, and create a Confluence incident page.

### Workflow

```javascript
async function criticalBugNotification(bugKey) {
  const jira = new JiraClient({ /* credentials */ });
  const graph = new GraphClient({ /* credentials */ });
  const confluence = new ConfluenceClient({ /* credentials */ });

  // Get bug details
  const bug = await jira.getIssue(bugKey, ['changelog']);

  if (bug.fields.priority.name !== 'Critical') {
    return; // Only process critical bugs
  }

  // Step 1: Send email to stakeholders
  const stakeholders = await getStakeholders(bug.fields.project.key);
  await graph.sendMail({
    message: {
      subject: `[CRITICAL] ${bugKey}: ${bug.fields.summary}`,
      body: {
        contentType: 'HTML',
        content: buildEmailContent(bug)
      },
      toRecipients: stakeholders.map(s => ({
        emailAddress: { address: s.email }
      }))
    }
  });

  // Step 2: Post to Teams incident channel
  const teamsConfig = await getTeamsConfig(bug.fields.project.key);
  await graph.postChannelMessage(
    teamsConfig.teamId,
    teamsConfig.incidentChannelId,
    {
      body: {
        contentType: 'html',
        content: `
          <h3>🚨 Critical Bug Alert</h3>
          <p><strong>${bugKey}:</strong> ${bug.fields.summary}</p>
          <p><strong>Reporter:</strong> ${bug.fields.reporter.displayName}</p>
          <p><a href="${jiraUrl(bugKey)}">View in Jira</a></p>
        `
      }
    }
  );

  // Step 3: Create incident page in Confluence
  const incidentPage = await confluence.createPage(
    'INCIDENTS',
    `Incident: ${bugKey} - ${bug.fields.summary}`,
    buildIncidentPageContent(bug),
    {
      parentTitle: 'Active Incidents',
      labels: ['incident', 'critical', bug.fields.project.key]
    }
  );

  // Step 4: Link Confluence page to Jira bug
  await jira.addComment(bugKey,
    `Incident page created: ${incidentPage._links.webui}`
  );

  return { emailSent: true, teamsPosted: true, incidentPage };
}
```

---

## 4. Test Coverage Reporting

### Scenario
Generate weekly test coverage reports showing requirements coverage, test execution trends, and gaps.

### Workflow

```javascript
async function weeklyTestCoverageReport(projectKey) {
  const jira = new JiraClient({ /* credentials */ });
  const xray = new XrayClient({ /* credentials */ });
  const confluence = new ConfluenceClient({ /* credentials */ });

  // Get all requirements
  const requirements = await jira.searchWithJql(
    `project = ${projectKey} AND issuetype in (Story, "Feature Request")`,
    { maxResults: 1000 }
  );

  // Calculate coverage for each
  const coverageData = [];
  for (const req of requirements.issues) {
    const tests = await xray.getTestsCovering(req.key);
    const executions = await getRecentExecutions(req.key, 7); // Last 7 days

    coverageData.push({
      key: req.key,
      summary: req.fields.summary,
      totalTests: tests.results?.length || 0,
      passedLast7Days: executions.passed,
      failedLast7Days: executions.failed,
      notExecuted: executions.notRun,
      coverageStatus: calculateStatus(tests, executions)
    });
  }

  // Find gaps (requirements without tests)
  const gaps = coverageData.filter(c => c.totalTests === 0);

  // Find flaky tests (high failure rate)
  const flaky = coverageData.filter(c =>
    c.totalTests > 0 &&
    c.failedLast7Days / (c.passedLast7Days + c.failedLast7Days) > 0.3
  );

  // Generate report
  const report = buildCoverageReportHTML({
    summary: {
      totalRequirements: requirements.issues.length,
      covered: coverageData.filter(c => c.totalTests > 0).length,
      gaps: gaps.length,
      flaky: flaky.length
    },
    gaps,
    flaky,
    coverageData
  });

  // Update or create Confluence page
  const pageTitle = `Test Coverage Report - Week ${getWeekNumber()}`;
  try {
    const existing = await confluence.findPage('QA', pageTitle);
    await confluence.updatePage(existing.id, pageTitle, report);
  } catch {
    await confluence.createPage('QA', pageTitle, report, {
      parentTitle: 'Coverage Reports',
      labels: ['coverage', 'weekly', 'automated']
    });
  }
}
```

---

## 5. Incident Response Automation

### Scenario
When a production incident is detected (via monitoring), automatically create a Jira incident, assemble the on-call team in Teams, and initialize the incident timeline in Confluence.

### Workflow

```javascript
async function handleProductionIncident(alert) {
  const jira = new JiraClient({ /* credentials */ });
  const graph = new GraphClient({ /* credentials */ });
  const confluence = new ConfluenceClient({ /* credentials */ });

  const timestamp = new Date().toISOString();

  // Step 1: Create Jira incident
  const incident = await jira.createIssue({
    fields: {
      project: { key: 'OPS' },
      issuetype: { name: 'Incident' },
      summary: `[P${alert.severity}] ${alert.title}`,
      description: buildIncidentDescription(alert),
      priority: { name: severityToPriority(alert.severity) },
      labels: ['production', 'incident', alert.service]
    }
  });

  // Step 2: Get on-call team and create Teams meeting
  const onCall = await getOnCallTeam(alert.service);

  // Create incident channel in Teams
  const channel = await graph._request('post',
    `/teams/${incidentTeamId}/channels`,
    {
      displayName: `INC-${incident.key}`,
      description: alert.title,
      membershipType: 'standard'
    }
  );

  // Add on-call members
  for (const member of onCall) {
    await graph._request('post',
      `/teams/${incidentTeamId}/channels/${channel.id}/members`,
      {
        '@odata.type': '#microsoft.graph.aadUserConversationMember',
        'user@odata.bind': `https://graph.microsoft.com/v1.0/users/${member.id}`,
        roles: ['owner']
      }
    );
  }

  // Post initial context
  await graph.postChannelMessage(incidentTeamId, channel.id, {
    body: {
      contentType: 'html',
      content: `
        <h2>🚨 Incident Started</h2>
        <p><strong>Severity:</strong> P${alert.severity}</p>
        <p><strong>Service:</strong> ${alert.service}</p>
        <p><strong>Alert:</strong> ${alert.title}</p>
        <p><strong>Jira:</strong> <a href="${jiraUrl(incident.key)}">${incident.key}</a></p>
        <hr/>
        <p>On-call team assembled. Start timeline documentation.</p>
      `
    }
  });

  // Step 3: Create Confluence timeline page
  const timeline = await confluence.createPage(
    'INCIDENTS',
    `Timeline: ${incident.key} - ${alert.title}`,
    buildTimelinePageContent(incident, alert, timestamp),
    { labels: ['incident', 'timeline', `P${alert.severity}`] }
  );

  // Link Confluence to Jira
  await jira.addComment(incident.key,
    `Incident timeline: ${timeline._links.webui}`
  );

  return {
    incident: incident.key,
    teamsChannel: channel.webUrl,
    timeline: timeline._links.webui
  };
}
```

---

## 6. Release Documentation Pipeline

### Scenario
Before a release, generate comprehensive release notes from Jira, validate test coverage in Xray, publish documentation to Confluence, and notify stakeholders.

### Workflow

```javascript
async function generateReleaseDocumentation(versionId, projectKey) {
  const jira = new JiraClient({ /* credentials */ });
  const xray = new XrayClient({ /* credentials */ });
  const confluence = new ConfluenceClient({ /* credentials */ });
  const graph = new GraphClient({ /* credentials */ });

  // Get version details
  const version = await jira._request('get', `/version/${versionId}`);

  // Get all issues in this version
  const issues = await jira.searchWithJql(
    `project = ${projectKey} AND fixVersion = "${version.name}"`,
    {
      maxResults: 500,
      fields: ['summary', 'issuetype', 'status', 'labels']
    }
  );

  // Categorize issues
  const categorized = {
    features: issues.issues.filter(i => i.fields.issuetype.name === 'Story'),
    bugs: issues.issues.filter(i => i.fields.issuetype.name === 'Bug'),
    improvements: issues.issues.filter(i => i.fields.issuetype.name === 'Improvement'),
    breakingChanges: issues.issues.filter(i =>
      i.fields.labels.includes('breaking-change')
    )
  };

  // Validate test coverage
  const coverage = await validateReleaseCoverage(xray, categorized.features);

  if (coverage.gaps.length > 0) {
    console.warn(`Warning: ${coverage.gaps.length} features without test coverage`);
  }

  // Generate release notes page
  const releaseNotes = await confluence.createPage(
    'RELEASES',
    `Release Notes - ${version.name}`,
    buildReleaseNotesHTML({
      version,
      categorized,
      coverage,
      releaseDate: version.releaseDate || 'TBD'
    }),
    {
      parentTitle: 'Release Notes',
      labels: ['release', version.name, 'official']
    }
  );

  // Notify stakeholders
  const stakeholders = await getVersionStakeholders(projectKey);

  // Email notification
  await graph.sendMail({
    message: {
      subject: `Release Notes Published: ${version.name}`,
      body: {
        contentType: 'HTML',
        content: `
          <h2>Release Notes Available</h2>
          <p>Release notes for <strong>${version.name}</strong> have been published.</p>
          <p><a href="${releaseNotes._links.webui}">View Release Notes</a></p>
          <h3>Summary</h3>
          <ul>
            <li>Features: ${categorized.features.length}</li>
            <li>Bug Fixes: ${categorized.bugs.length}</li>
            <li>Improvements: ${categorized.improvements.length}</li>
            <li>Breaking Changes: ${categorized.breakingChanges.length}</li>
          </ul>
        `
      },
      toRecipients: stakeholders.map(s => ({
        emailAddress: { address: s.email }
      }))
    }
  });

  // Mark version as released
  await jira.releaseVersion(versionId);

  return {
    releaseNotes: releaseNotes._links.webui,
    version: version.name,
    issueCount: issues.issues.length,
    coverageGaps: coverage.gaps
  };
}
```

---

## Configuration Examples

### Environment Setup

```bash
# .env.local (development)
ATLASSIAN_DOMAIN=mycompany.atlassian.net
ATLASSIAN_EMAIL=service-account@mycompany.com
ATLASSIAN_API_TOKEN=xxxxx

XRAY_CLIENT_ID=xxxxx
XRAY_CLIENT_SECRET=xxxxx

MS365_CLIENT_ID=xxxxx
MS365_CLIENT_SECRET=xxxxx
MS365_TENANT_ID=xxxxx
```

### Secrets Manager Configuration

```javascript
// Azure Key Vault (production)
const secrets = new SecretsManager({
  backend: 'azure',
  config: {
    vaultUrl: 'https://mycompany-vault.vault.azure.net'
  }
});

// AWS Secrets Manager
const secrets = new SecretsManager({
  backend: 'aws',
  config: {
    region: 'us-east-1',
    secretId: 'enterprise-qa-devops'
  }
});
```

---

## Error Handling Best Practices

```javascript
async function resilientWorkflow() {
  const clients = initializeClients();

  try {
    // Check health before starting
    const health = await Promise.all([
      clients.jira.healthCheck(),
      clients.xray.healthCheck(),
      clients.confluence.healthCheck(),
      clients.graph.healthCheck()
    ]);

    const unhealthy = health.filter(h => h.status !== 'healthy');
    if (unhealthy.length > 0) {
      throw new Error(`Unhealthy services: ${unhealthy.map(h => h.service).join(', ')}`);
    }

    // Execute workflow
    const result = await executeWorkflow(clients);
    return { success: true, result };

  } catch (error) {
    // Circuit breaker will prevent cascade failures
    // Retry logic handled by ResilientClient

    // Log with context
    console.error('Workflow failed:', {
      error: error.message,
      metrics: {
        jira: clients.jira.getMetrics(),
        xray: clients.xray.getMetrics()
      }
    });

    return { success: false, error: error.message };
  }
}
```

---

**Last Updated:** 2026-02-04
**Maintainer:** Enterprise QA DevOps Squad
