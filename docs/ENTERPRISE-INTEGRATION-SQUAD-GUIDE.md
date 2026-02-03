# Enterprise Integration Squad Guide

Complete guide for creating PR workflows, reviewing PRs, and building enterprise integration squads with Atlassian (Jira, Xray, Confluence) and Microsoft 365.

---

## Table of Contents

1. [PR Creation Process](#1-pr-creation-process)
2. [PR Review Process](#2-pr-review-process)
3. [Squad Creation with RICE Prioritization](#3-squad-creation-with-rice-prioritization)
4. [Enterprise QA-DevOps Squad](#4-enterprise-qa-devops-squad)
5. [Agent Usage Examples](#5-agent-usage-examples)
6. [Integration Scripts Reference](#6-integration-scripts-reference)
7. [Configuration Templates](#7-configuration-templates)

---

## 1. PR Creation Process

### Quick Commands

```bash
# Activate DevOps agent
@devops

# Create PR (interactive)
*create-pr

# Pre-push quality check first
*pre-push
```

### PR Title Formats

Configure in `core-config.yaml`:

| Format | Example | When to Use |
|--------|---------|-------------|
| `conventional` | `feat(auth): implement OAuth [Story 6.17]` | NPM packages with semantic-release |
| `story-first` | `[Story 6.17] User Auth` | Simple projects |
| `branch-based` | `User Auth [Story 6.17]` | Quick iterations |

### Complete PR Workflow

```
1. Work on feature branch
   └── git checkout -b feat/my-feature

2. Implement changes
   └── @dev implements story

3. Pre-push validation
   └── @devops *pre-push
       ├── Lint check
       ├── Type check
       ├── Tests
       ├── Build
       ├── CodeRabbit scan
       └── Security audit

4. Push to remote
   └── @devops *push

5. Create PR
   └── @devops *create-pr
       ├── Auto-generates title
       ├── Creates description
       ├── Adds labels
       └── Returns PR URL
```

### PR Template Structure

```markdown
## Summary
<!-- 1-3 sentence description -->

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## Related Issues
Closes #123
Story: [PROJ-456]

## Changes Made
- Change 1
- Change 2

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing done

## Quality Checks
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes
- [ ] `npm run build` passes
```

---

## 2. PR Review Process

### Three-Layer Quality Gate

```
┌─────────────────────────────────────────────────┐
│ Layer 1: LOCAL (Pre-commit)                     │
│ ├── ESLint, Prettier, TypeScript                │
│ ├── Unit tests (fast)                           │
│ └── Catches: ~30% of issues                     │
├─────────────────────────────────────────────────┤
│ Layer 2: PR AUTOMATION (CodeRabbit)             │
│ ├── AI-powered code review                      │
│ ├── Security scanning                           │
│ ├── Performance analysis                        │
│ └── Catches: Additional ~50% (80% total)        │
├─────────────────────────────────────────────────┤
│ Layer 3: HUMAN REVIEW                           │
│ ├── Architecture alignment                      │
│ ├── Business logic verification                 │
│ └── Catches: Final ~20% (100% total)            │
└─────────────────────────────────────────────────┘
```

### Severity Levels & Actions

| Severity | Action | Enforcement |
|----------|--------|-------------|
| CRITICAL | Block PR, fix immediately | Mandatory |
| HIGH | Warn, recommend fix | Blocking with override |
| MEDIUM | Document as tech debt | Warning |
| LOW | Optional improvements | Informational |

### QA Review Commands

```bash
# Activate QA agent
@qa

# Review story implementation
*review STORY-123

# Run CodeRabbit scan
*coderabbit-scan

# Self-healing workflow (auto-fix issues)
*self-heal
```

### Human Review Checklist

```markdown
## Code Review Checklist

### Functionality
- [ ] Code does what it's supposed to do
- [ ] Edge cases handled
- [ ] Error handling appropriate

### Code Quality
- [ ] Code is readable and maintainable
- [ ] No duplicate code
- [ ] Follows project patterns

### Testing
- [ ] Tests cover main scenarios
- [ ] Tests are meaningful (not just for coverage)
- [ ] No flaky tests

### Security
- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] No SQL injection vulnerabilities

### Documentation
- [ ] Complex logic explained
- [ ] API changes documented
- [ ] README updated if needed
```

---

## 3. Squad Creation with RICE Prioritization

### What is RICE?

RICE is a prioritization framework used by @pm (Morgan):

```
RICE Score = (Reach × Impact × Confidence) / Effort

R - Reach:      How many users/agents will use this?
I - Impact:     How much value does it provide? (0.25, 0.5, 1, 2, 3)
C - Confidence: How sure are we? (0-100%)
E - Effort:     Person-weeks of work
```

### RICE Scoring Example

| Feature | Reach | Impact | Confidence | Effort | Score |
|---------|-------|--------|------------|--------|-------|
| Jira Integration | 100 | 3 | 90% | 2 | 135 |
| Xray Test Import | 50 | 2 | 80% | 1 | 80 |
| Confluence Docs | 80 | 1 | 95% | 1 | 76 |
| O365 Calendar | 30 | 1 | 70% | 2 | 10.5 |

**Priority Order:** Jira > Xray > Confluence > O365

### Squad Creation Commands

```bash
# Activate Squad Creator
@squad-creator

# Option A: Design from documentation (recommended)
*design-squad --docs ./docs/prd/enterprise-qa.md

# Option B: Create directly (interactive)
*create-squad enterprise-qa-devops

# Option C: Create with template
*create-squad enterprise-qa-devops --template etl

# Validate squad
*validate-squad enterprise-qa-devops

# Analyze coverage
*analyze-squad enterprise-qa-devops

# Extend with new components
*extend-squad enterprise-qa-devops --add agent --name jira-sync
*extend-squad enterprise-qa-devops --add task --name import-xray-results
```

### Squad Directory Structure

```
squads/enterprise-qa-devops/
├── squad.yaml              # Manifest (required)
├── README.md               # Documentation
├── LICENSE                 # MIT
├── config/
│   ├── coding-standards.md
│   ├── tech-stack.md
│   ├── credentials.md      # Token configuration guide
│   └── source-tree.md
├── agents/
│   ├── jira-agent.md       # Jira operations
│   ├── xray-agent.md       # Test management
│   ├── confluence-agent.md # Documentation
│   └── o365-agent.md       # Microsoft 365
├── tasks/
│   ├── jira-create-issue.md
│   ├── jira-update-status.md
│   ├── xray-import-results.md
│   ├── xray-create-test.md
│   ├── confluence-create-page.md
│   ├── confluence-update-docs.md
│   ├── o365-send-report.md
│   └── o365-schedule-meeting.md
├── workflows/
│   ├── test-report-workflow.yaml
│   └── sprint-documentation.yaml
├── checklists/
│   ├── qa-review-checklist.md
│   └── release-checklist.md
├── templates/
│   ├── test-report-template.md
│   ├── bug-report-template.md
│   └── sprint-summary-template.md
├── tools/
│   ├── jira-client.js
│   ├── xray-client.js
│   ├── confluence-client.js
│   └── graph-client.js
└── scripts/
    ├── setup-credentials.js
    └── sync-test-results.js
```

---

## 4. Enterprise QA-DevOps Squad

### Squad Manifest (squad.yaml)

```yaml
name: enterprise-qa-devops
version: 1.0.0
description: |
  Enterprise integration squad for QA and DevOps workflows.
  Integrates Atlassian (Jira, Xray, Confluence) and Microsoft 365.
  Automates test reporting, documentation, and team communication.

author: Your Team <team@yourcompany.com>
license: MIT
slashPrefix: eqd

aios:
  minVersion: "2.1.0"
  type: squad

components:
  agents:
    - jira-agent.md
    - xray-agent.md
    - confluence-agent.md
    - o365-agent.md
  tasks:
    # Jira Tasks
    - jira-create-issue.md
    - jira-update-status.md
    - jira-search.md
    - jira-link-issues.md
    # Xray Tasks
    - xray-import-results.md
    - xray-create-test.md
    - xray-create-execution.md
    - xray-export-tests.md
    # Confluence Tasks
    - confluence-create-page.md
    - confluence-update-docs.md
    - confluence-search.md
    # O365 Tasks
    - o365-send-report.md
    - o365-schedule-meeting.md
    - o365-send-notification.md
  workflows:
    - test-report-workflow.yaml
    - sprint-documentation.yaml
    - release-notification.yaml
  checklists:
    - qa-review-checklist.md
    - release-checklist.md
  templates:
    - test-report-template.md
    - bug-report-template.md
    - sprint-summary-template.md
  tools:
    - jira-client.js
    - xray-client.js
    - confluence-client.js
    - graph-client.js
  scripts:
    - setup-credentials.js
    - sync-test-results.js

config:
  extends: extend
  coding-standards: config/coding-standards.md
  tech-stack: config/tech-stack.md
  credentials: config/credentials.md

# External dependencies
dependencies:
  node:
    - atlassian-python-api
    - pytest-jira-xray
    - python-o365
  python:
    - atlassian-python-api>=3.0.0
    - jira>=3.0.0
    - O365>=2.0.0
  mcp_servers:
    - atlassian
    - azure-devops
    - ms-365

# Environment variables required
env:
  required:
    - ATLASSIAN_API_TOKEN
    - ATLASSIAN_EMAIL
    - ATLASSIAN_DOMAIN
    - XRAY_CLIENT_ID
    - XRAY_CLIENT_SECRET
    - MS365_CLIENT_ID
    - MS365_CLIENT_SECRET
    - MS365_TENANT_ID

tags:
  - enterprise
  - qa
  - devops
  - jira
  - xray
  - confluence
  - o365
  - test-management
  - documentation
```

### Agent Definitions

#### Jira Agent (agents/jira-agent.md)

```markdown
---
id: jira-agent
name: Jira Sync
persona: Atlas
icon: 🎫
zodiac: ♊ Gemini
---

# Jira Agent (@jira / Atlas)

## Persona
Issue tracking specialist. Methodical, detail-oriented, keeps everything organized.

## Primary Scope
- Issue CRUD operations
- Sprint management
- JQL queries
- Issue linking
- Status transitions

## Commands

| Command | Description |
|---------|-------------|
| `*create-issue` | Create new Jira issue |
| `*update-issue` | Update existing issue |
| `*search` | Search with JQL |
| `*transition` | Move issue to new status |
| `*link` | Link two issues |
| `*sprint` | Manage sprint operations |
| `*bulk-create` | Create multiple issues |

## Authentication
Uses `ATLASSIAN_API_TOKEN`, `ATLASSIAN_EMAIL`, `ATLASSIAN_DOMAIN`

## Integration Points
- Receives test results from @xray
- Sends issue data to @confluence for docs
- Notifies @o365 for team updates
```

#### Xray Agent (agents/xray-agent.md)

```markdown
---
id: xray-agent
name: Xray Test Manager
persona: Ray
icon: 🧪
zodiac: ♍ Virgo
---

# Xray Agent (@xray / Ray)

## Persona
Test management expert. Analytical, precise, quality-obsessed.

## Primary Scope
- Test case management
- Test execution tracking
- Result import (JUnit, Cucumber, Robot)
- Test plan creation
- Coverage reporting

## Commands

| Command | Description |
|---------|-------------|
| `*import-junit` | Import JUnit XML results |
| `*import-cucumber` | Import Cucumber JSON |
| `*import-robot` | Import Robot Framework XML |
| `*create-test` | Create test case |
| `*create-execution` | Create test execution |
| `*export-tests` | Export tests as Cucumber |
| `*coverage-report` | Generate coverage report |

## Authentication
Uses `XRAY_CLIENT_ID`, `XRAY_CLIENT_SECRET`

## Integration Points
- Imports results from CI/CD pipelines
- Links tests to Jira issues via @jira
- Generates reports for @confluence
```

#### Confluence Agent (agents/confluence-agent.md)

```markdown
---
id: confluence-agent
name: Confluence Docs
persona: Connie
icon: 📚
zodiac: ♎ Libra
---

# Confluence Agent (@confluence / Connie)

## Persona
Documentation specialist. Articulate, organized, loves structure.

## Primary Scope
- Page creation and updates
- Space management
- Search and retrieval
- Template application
- Attachment handling

## Commands

| Command | Description |
|---------|-------------|
| `*create-page` | Create wiki page |
| `*update-page` | Update existing page |
| `*search` | Search with CQL |
| `*attach` | Attach file to page |
| `*from-template` | Create from template |
| `*export` | Export page as PDF/Word |

## Authentication
Uses `ATLASSIAN_API_TOKEN`, `ATLASSIAN_EMAIL`, `ATLASSIAN_DOMAIN`

## Integration Points
- Receives test reports from @xray
- Documents issues from @jira
- Shares links via @o365
```

#### O365 Agent (agents/o365-agent.md)

```markdown
---
id: o365-agent
name: Microsoft 365 Connector
persona: Max
icon: 📧
zodiac: ♒ Aquarius
---

# O365 Agent (@o365 / Max)

## Persona
Communication facilitator. Efficient, connected, always in sync.

## Primary Scope
- Email sending and reading
- Calendar management
- Teams messaging
- OneDrive file operations
- SharePoint integration

## Commands

| Command | Description |
|---------|-------------|
| `*send-email` | Send email with attachments |
| `*read-inbox` | Read recent emails |
| `*create-event` | Schedule calendar event |
| `*send-teams` | Post to Teams channel |
| `*upload-file` | Upload to OneDrive/SharePoint |
| `*notify-team` | Send team notification |

## Authentication
Uses `MS365_CLIENT_ID`, `MS365_CLIENT_SECRET`, `MS365_TENANT_ID`

## Integration Points
- Sends test reports via email
- Schedules review meetings
- Posts updates to Teams channels
```

### Task Definitions

#### Import Xray Results (tasks/xray-import-results.md)

```markdown
---
task: xray-import-results
responsável: xray-agent
versão: 1.0.0
---

# Import Test Results to Xray

## Objetivo
Import automated test results from CI/CD pipeline to Xray for tracking.

## Entrada

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `results_file` | string | Yes | Path to results file |
| `format` | enum | Yes | junit, cucumber, robot |
| `project_key` | string | Yes | Jira project key |
| `test_plan_key` | string | No | Link to test plan |
| `environments` | list | No | Test environments |
| `fix_version` | string | No | Version being tested |

## Saída

| Field | Type | Description |
|-------|------|-------------|
| `execution_key` | string | Created test execution key |
| `tests_imported` | number | Count of tests imported |
| `passed` | number | Tests passed |
| `failed` | number | Tests failed |
| `url` | string | Link to execution in Jira |

## Checklist

- [ ] Validate results file exists
- [ ] Authenticate with Xray API
- [ ] Parse results file
- [ ] Import to Xray
- [ ] Link to test plan (if provided)
- [ ] Return execution summary

## Example

```bash
@xray *import-junit \
  --results ./test-results/junit.xml \
  --project PROJ \
  --test-plan PROJ-100 \
  --environments "Chrome, Windows" \
  --fix-version "1.2.0"
```

## Script

```python
import os
from xray_client import XrayClient

def import_results(results_file, format, project_key, **kwargs):
    client = XrayClient(
        client_id=os.environ['XRAY_CLIENT_ID'],
        client_secret=os.environ['XRAY_CLIENT_SECRET']
    )

    if format == 'junit':
        result = client.import_junit_results(
            project_key=project_key,
            xml_file=results_file,
            test_plan_key=kwargs.get('test_plan_key'),
            test_environments=kwargs.get('environments')
        )
    elif format == 'cucumber':
        result = client.import_cucumber_results(
            project_key=project_key,
            json_file=results_file
        )
    elif format == 'robot':
        result = client.import_robot_results(
            project_key=project_key,
            xml_file=results_file
        )

    return {
        'execution_key': result['key'],
        'tests_imported': result['testIssues']['total'],
        'passed': result['testIssues']['passed'],
        'failed': result['testIssues']['failed'],
        'url': f"https://your-instance.atlassian.net/browse/{result['key']}"
    }
```
```

#### Create Confluence Page (tasks/confluence-create-page.md)

```markdown
---
task: confluence-create-page
responsável: confluence-agent
versão: 1.0.0
---

# Create Confluence Page

## Objetivo
Create documentation page in Confluence from template or content.

## Entrada

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `space` | string | Yes | Confluence space key |
| `title` | string | Yes | Page title |
| `content` | string | No | HTML/markdown content |
| `template` | string | No | Template name to use |
| `parent_page` | string | No | Parent page title or ID |
| `labels` | list | No | Page labels |

## Saída

| Field | Type | Description |
|-------|------|-------------|
| `page_id` | string | Created page ID |
| `url` | string | Page URL |
| `version` | number | Page version |

## Example

```bash
@confluence *create-page \
  --space QA \
  --title "Sprint 15 Test Report" \
  --template test-report-template \
  --parent "Test Reports" \
  --labels "sprint-15, qa, test-report"
```
```

### Workflow Definition

#### Test Report Workflow (workflows/test-report-workflow.yaml)

```yaml
name: test-report-workflow
description: End-to-end test reporting from CI to team notification
version: 1.0.0
trigger:
  - manual
  - webhook: ci-complete

stages:
  - name: import-results
    agent: xray-agent
    task: xray-import-results
    inputs:
      results_file: "${CI_RESULTS_PATH}"
      format: junit
      project_key: "${PROJECT_KEY}"
      test_plan_key: "${TEST_PLAN_KEY}"
    outputs:
      - execution_key
      - passed
      - failed

  - name: create-report
    agent: confluence-agent
    task: confluence-create-page
    depends_on: import-results
    inputs:
      space: QA
      title: "Test Report - ${DATE}"
      template: test-report-template
      content: |
        ## Test Execution: ${stages.import-results.outputs.execution_key}

        | Metric | Value |
        |--------|-------|
        | Passed | ${stages.import-results.outputs.passed} |
        | Failed | ${stages.import-results.outputs.failed} |

        [View in Jira](${stages.import-results.outputs.url})
    outputs:
      - page_id
      - url

  - name: notify-team
    agent: o365-agent
    task: o365-send-notification
    depends_on: create-report
    inputs:
      channel: "QA-Updates"
      message: |
        📊 **Test Report Published**

        Results: ✅ ${stages.import-results.outputs.passed} passed, ❌ ${stages.import-results.outputs.failed} failed

        [View Report](${stages.create-report.outputs.url})
```

---

## 5. Agent Usage Examples

### DevOps Agent with Jira

```bash
# Create issue from development work
@devops
*create-pr

# After PR is merged, update Jira
@jira
*transition PROJ-123 --status "Done"
*add-comment PROJ-123 --text "PR merged: https://github.com/org/repo/pull/456"
```

### QA Agent with Xray

```bash
# After running tests
@xray
*import-junit --results ./junit.xml --project PROJ

# Create test execution for manual tests
@xray
*create-execution --project PROJ --summary "Manual Regression v1.2.0"

# Export tests for automation
@xray
*export-tests --keys "PROJ-TEST-1,PROJ-TEST-2" --format cucumber
```

### Documentation Flow

```bash
# Generate sprint documentation
@confluence
*create-page --space TEAM --title "Sprint 15 Summary" --template sprint-summary

# Update with test results
@xray
*coverage-report --test-plan PROJ-100

@confluence
*update-page --id 12345 --append-section "Test Coverage" --content "${COVERAGE_REPORT}"
```

### Team Notification

```bash
# Send daily standup reminder
@o365
*send-teams --channel "Dev-Team" --message "🔔 Standup in 15 minutes!"

# Schedule sprint review
@o365
*create-event --title "Sprint 15 Review" --attendees "team@company.com" --duration 60
```

### Full Workflow Example

```bash
# 1. QA completes testing
@xray *import-junit --results ./results.xml --project PROJ

# 2. Generate documentation
@confluence *create-page --space QA --title "Release 1.2.0 Test Report" --template test-report

# 3. Update Jira issues
@jira *transition PROJ-123 --status "Ready for Release"
@jira *add-comment PROJ-123 --text "All tests passed. See report: [Confluence Link]"

# 4. Notify stakeholders
@o365 *send-email \
  --to "stakeholders@company.com" \
  --subject "Release 1.2.0 Ready" \
  --body "All tests passed. Ready for production deployment."

# 5. DevOps creates release
@devops *release --version 1.2.0
```

---

## 6. Integration Scripts Reference

### Jira Client (tools/jira-client.js)

```javascript
const { Jira } = require('atlassian-python-api');

class JiraClient {
  constructor() {
    this.client = new Jira({
      url: process.env.ATLASSIAN_DOMAIN,
      username: process.env.ATLASSIAN_EMAIL,
      password: process.env.ATLASSIAN_API_TOKEN
    });
  }

  async createIssue(projectKey, summary, issueType, fields = {}) {
    return await this.client.issue_create({
      project: { key: projectKey },
      summary,
      issuetype: { name: issueType },
      ...fields
    });
  }

  async searchIssues(jql, maxResults = 50) {
    return await this.client.jql(jql, { limit: maxResults });
  }

  async transitionIssue(issueKey, transitionName) {
    return await this.client.issue_transition(issueKey, transitionName);
  }

  async addComment(issueKey, comment) {
    return await this.client.issue_add_comment(issueKey, comment);
  }
}

module.exports = { JiraClient };
```

### Xray Client (tools/xray-client.js)

```javascript
const axios = require('axios');

class XrayClient {
  constructor() {
    this.baseUrl = 'https://xray.cloud.getxray.app/api/v2';
    this.token = null;
  }

  async authenticate() {
    const response = await axios.post(`${this.baseUrl}/authenticate`, {
      client_id: process.env.XRAY_CLIENT_ID,
      client_secret: process.env.XRAY_CLIENT_SECRET
    });
    this.token = response.data.replace(/"/g, '');
  }

  async importJunitResults(projectKey, xmlPath, options = {}) {
    if (!this.token) await this.authenticate();

    const fs = require('fs');
    const params = new URLSearchParams({ projectKey });

    if (options.testPlanKey) params.append('testPlanKey', options.testPlanKey);
    if (options.environments) params.append('testEnvironments', options.environments.join(';'));

    const response = await axios.post(
      `${this.baseUrl}/import/execution/junit?${params}`,
      fs.readFileSync(xmlPath),
      {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/xml'
        }
      }
    );

    return response.data;
  }

  async createTestExecution(projectKey, summary, testKeys, testPlanKey = null) {
    if (!this.token) await this.authenticate();

    const payload = {
      info: {
        project: projectKey,
        summary,
        testPlanKey
      },
      tests: testKeys.map(key => ({ testKey: key }))
    };

    const response = await axios.post(
      `${this.baseUrl}/import/execution`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  }
}

module.exports = { XrayClient };
```

### Graph Client for O365 (tools/graph-client.js)

```javascript
const { Client } = require('@microsoft/microsoft-graph-client');
const { TokenCredentialAuthenticationProvider } = require('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');
const { ClientSecretCredential } = require('@azure/identity');

class GraphClient {
  constructor() {
    const credential = new ClientSecretCredential(
      process.env.MS365_TENANT_ID,
      process.env.MS365_CLIENT_ID,
      process.env.MS365_CLIENT_SECRET
    );

    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: ['https://graph.microsoft.com/.default']
    });

    this.client = Client.initWithMiddleware({ authProvider });
  }

  async sendEmail(to, subject, body, attachments = []) {
    const message = {
      subject,
      body: { contentType: 'HTML', content: body },
      toRecipients: to.map(email => ({
        emailAddress: { address: email }
      }))
    };

    if (attachments.length > 0) {
      message.attachments = attachments.map(att => ({
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: att.name,
        contentType: att.contentType,
        contentBytes: att.content
      }));
    }

    await this.client.api('/users/sender@company.com/sendMail').post({ message });
  }

  async postToTeams(teamId, channelId, content) {
    await this.client
      .api(`/teams/${teamId}/channels/${channelId}/messages`)
      .post({
        body: { content, contentType: 'html' }
      });
  }

  async createCalendarEvent(subject, start, end, attendees) {
    const event = {
      subject,
      start: { dateTime: start, timeZone: 'UTC' },
      end: { dateTime: end, timeZone: 'UTC' },
      attendees: attendees.map(email => ({
        emailAddress: { address: email },
        type: 'required'
      }))
    };

    return await this.client.api('/users/organizer@company.com/events').post(event);
  }
}

module.exports = { GraphClient };
```

---

## 7. Configuration Templates

### Environment Variables (.env)

```bash
# Atlassian (Jira + Confluence)
ATLASSIAN_DOMAIN=https://your-instance.atlassian.net
ATLASSIAN_EMAIL=your-email@company.com
ATLASSIAN_API_TOKEN=your-api-token

# Xray Cloud
XRAY_CLIENT_ID=your-client-id
XRAY_CLIENT_SECRET=your-client-secret

# Microsoft 365
MS365_CLIENT_ID=your-app-id
MS365_CLIENT_SECRET=your-app-secret
MS365_TENANT_ID=your-tenant-id

# Optional: Azure DevOps
AZURE_DEVOPS_ORG=https://dev.azure.com/your-org
AZURE_DEVOPS_PAT=your-pat-token
```

### MCP Configuration (~/.claude.json)

```json
{
  "mcpServers": {
    "atlassian": {
      "command": "npx",
      "args": ["-y", "@anthropic/atlassian-remote-mcp-server"],
      "env": {
        "ATLASSIAN_API_TOKEN": "${ATLASSIAN_API_TOKEN}",
        "ATLASSIAN_EMAIL": "${ATLASSIAN_EMAIL}",
        "ATLASSIAN_DOMAIN": "${ATLASSIAN_DOMAIN}"
      }
    },
    "azure-devops": {
      "command": "npx",
      "args": ["-y", "@azure-devops/mcp", "YourOrganization"]
    },
    "ms-365": {
      "command": "uvx",
      "args": ["ms-365-mcp-server"],
      "env": {
        "MS365_CLIENT_ID": "${MS365_CLIENT_ID}",
        "MS365_CLIENT_SECRET": "${MS365_CLIENT_SECRET}",
        "MS365_TENANT_ID": "${MS365_TENANT_ID}"
      }
    }
  }
}
```

### pytest-jira-xray Configuration (pytest.ini)

```ini
[pytest]
markers =
    xray(test_key): Mark test with Xray test case key

addopts = --jira-xray --cloud --client-secret-auth
```

### GitHub Actions Integration

```yaml
name: Test and Report

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Tests
        run: pytest --junitxml=results.xml

      - name: Import to Xray
        env:
          XRAY_CLIENT_ID: ${{ secrets.XRAY_CLIENT_ID }}
          XRAY_CLIENT_SECRET: ${{ secrets.XRAY_CLIENT_SECRET }}
        run: |
          TOKEN=$(curl -s -X POST "https://xray.cloud.getxray.app/api/v2/authenticate" \
            -H "Content-Type: application/json" \
            -d "{\"client_id\":\"$XRAY_CLIENT_ID\",\"client_secret\":\"$XRAY_CLIENT_SECRET\"}" | tr -d '"')

          curl -X POST "https://xray.cloud.getxray.app/api/v2/import/execution/junit?projectKey=PROJ" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/xml" \
            -d @results.xml

      - name: Update Jira
        env:
          JIRA_TOKEN: ${{ secrets.ATLASSIAN_API_TOKEN }}
          JIRA_EMAIL: ${{ secrets.ATLASSIAN_EMAIL }}
        run: |
          # Extract issue key from branch name
          ISSUE_KEY=$(echo "${{ github.head_ref }}" | grep -oE '[A-Z]+-[0-9]+' || echo "")

          if [ -n "$ISSUE_KEY" ]; then
            curl -X POST "https://your-instance.atlassian.net/rest/api/3/issue/$ISSUE_KEY/comment" \
              -H "Authorization: Basic $(echo -n $JIRA_EMAIL:$JIRA_TOKEN | base64)" \
              -H "Content-Type: application/json" \
              -d '{"body":{"type":"doc","version":1,"content":[{"type":"paragraph","content":[{"type":"text","text":"Tests completed. See build: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"}]}]}}'
          fi
```

---

## Using This Squad in Other Projects (AGtestari)

To use this squad in projects outside AIOS:

### 1. Copy Squad Files

```bash
# Copy to your project
cp -r squads/enterprise-qa-devops /path/to/AGtestari/squads/
```

### 2. Install Dependencies

```bash
# Node.js dependencies
npm install @microsoft/microsoft-graph-client @azure/identity axios

# Python dependencies
pip install atlassian-python-api jira O365 pytest-jira-xray
```

### 3. Configure Environment

```bash
# Copy and fill .env
cp squads/enterprise-qa-devops/.env.example .env
# Edit .env with your credentials
```

### 4. Use Agent Scripts Directly

```python
# Without AIOS - direct Python usage
from squads.enterprise_qa_devops.tools.xray_client import XrayClient

client = XrayClient()
result = client.import_junit_results(
    project_key='AGTESTARI',
    xml_file='./test-results/junit.xml'
)
print(f"Created execution: {result['key']}")
```

### 5. Integrate with CI/CD

The GitHub Actions workflow above works in any repository - just add the secrets and workflow file.

---

*Enterprise Integration Squad Guide v1.0*
*For AIOS Core and External Projects*
