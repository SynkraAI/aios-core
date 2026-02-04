# Enterprise QA DevOps Squad

> Integrates Atlassian (Jira, Xray, Confluence) and Microsoft 365 for automated QA and DevOps workflows.

## Overview

This squad provides specialized agents for enterprise QA and DevOps operations:

| Agent | Persona | Icon | Scope |
|-------|---------|------|-------|
| `@jira` | Atlas | 🎫 | Issue tracking, sprints, workflows |
| `@xray` | Ray | 🧪 | Test management, results import, coverage |
| `@confluence` | Connie | 📚 | Documentation, wiki pages, templates |
| `@o365` | Max | 📧 | Email, Teams, Calendar |

## Quick Start

### 1. Install Dependencies

```bash
cd squads/enterprise-qa-devops
npm install
```

### 2. Configure Credentials

```bash
node scripts/setup-credentials.js
```

Or manually create `.env`:

```bash
# Atlassian
ATLASSIAN_DOMAIN=company.atlassian.net
ATLASSIAN_EMAIL=user@company.com
ATLASSIAN_API_TOKEN=<your-token>

# Xray
XRAY_CLIENT_ID=<client-id>
XRAY_CLIENT_SECRET=<client-secret>

# Microsoft 365 (optional)
MS365_CLIENT_ID=<client-id>
MS365_CLIENT_SECRET=<client-secret>
MS365_TENANT_ID=<tenant-id>
```

### 3. Verify Setup

```bash
node scripts/health-check.js
```

## Usage

### Jira Operations

```bash
# Create issue
@jira *create-issue --project PROJ --type Bug --summary "Login fails"

# Search issues
@jira *search "project = PROJ AND status = Open"

# Update status
@jira *transition PROJ-123 --to "Done"
```

### Xray Test Management

```bash
# Import JUnit results
@xray *import-junit --file results.xml --project PROJ

# Import Cucumber results
@xray *import-cucumber --file cucumber.json --project PROJ

# Generate coverage report
@xray *coverage-report --testPlan PROJ-100
```

### Confluence Documentation

```bash
# Create page
@confluence *create-page --space QA --title "Test Report"

# Create from template
@confluence *from-template --template test-report --space QA

# Search pages
@confluence *search "space = QA AND label = test-report"
```

### Microsoft 365 Communication

```bash
# Send email
@o365 *send-email --to "team@company.com" --subject "Tests Passed"

# Post to Teams
@o365 *send-teams --team Engineering --channel QA-Updates --message "Tests complete"

# Create calendar event
@o365 *create-event --title "Sprint Review" --date 2026-02-10 --time 14:00
```

## Automated Workflows

### Test Report Workflow

Automatically imports test results, generates reports, and notifies stakeholders:

```bash
@qa *run-test-report-workflow \
  --project PROJ \
  --resultsFile ./test-results/junit.xml \
  --testPlan PROJ-100
```

### Sprint Documentation

Generates sprint summary with metrics and retrospective template:

```bash
@po *generate-sprint-docs \
  --project PROJ \
  --sprintName "Sprint 15"
```

### Release Notification

Notifies all channels when a release is deployed:

```bash
@devops *notify-release \
  --version "1.2.0" \
  --environment production \
  --project PROJ
```

## Resilience & Security (v2.0)

### Circuit Breaker

All API clients include automatic circuit breaker protection:

```javascript
// After 5 consecutive failures, circuit opens for 30 seconds
// Prevents hammering failing APIs
const client = new JiraClient();
// Circuit states: CLOSED → OPEN → HALF_OPEN → CLOSED
```

### Retry with Exponential Backoff

Transient failures are automatically retried:

```javascript
// Retries: 1s → 2s → 4s (with jitter)
// Configurable: maxRetries, baseDelay, maxDelay
```

### Rate Limiting

Built-in rate limiter prevents API throttling:

```javascript
// Token bucket: 100 tokens, refill 10/sec
// Prevents 429 errors from Atlassian/Microsoft
```

### Secure Credential Management

Supports multiple secrets backends:

```bash
# Azure Key Vault
export SECRETS_BACKEND=azure
export AZURE_KEY_VAULT_URL=https://vault.vault.azure.net

# AWS Secrets Manager
export SECRETS_BACKEND=aws
export AWS_REGION=us-east-1

# 1Password CLI
export SECRETS_BACKEND=1password
export OP_VAULT=Private

# Environment (default, dev only)
export SECRETS_BACKEND=env
```

Usage:
```javascript
const { SecretsManager, CredentialLoader } = require('./tools/secrets-manager');

const secrets = new SecretsManager({ backend: 'azure' });
const loader = new CredentialLoader(secrets);

// Load all credentials
const creds = await loader.loadAll();

// Validate before use
const validation = await loader.validate();
if (!validation.complete) {
  console.error('Missing:', validation.missing);
}
```

### API Version Abstraction

Stable interfaces protect against API breaking changes:

```javascript
const { ContractFactory } = require('./tools/api-contracts');

// Use contracts instead of direct clients
const issues = ContractFactory.createIssueContract(jiraClient);

// Works the same whether Jira API is v2 or v3
const issue = await issues.create({
  project: 'PROJ',
  summary: 'Task title',
  type: 'Task'
});
```

---

## Testing

### Run Tests

```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage report
```

### Test Structure

```
__tests__/
├── setup.js                # Test environment config
├── mocks/
│   ├── atlassian-responses.json   # Jira/Xray/Confluence mocks
│   └── graph-responses.json       # Microsoft Graph mocks
├── tools/
│   ├── jira-client.test.js        # 25+ tests
│   ├── xray-client.test.js        # 20+ tests
│   ├── confluence-client.test.js  # 30+ tests
│   ├── graph-client.test.js       # 25+ tests
│   ├── resilient-client.test.js   # Circuit/retry/rate tests
│   └── secrets-manager.test.js    # Backend/cache/audit tests
└── integration/
    └── workflow.test.js           # Multi-service tests
```

### Coverage Requirements

- **Minimum:** 80% (branches, functions, lines)
- **Enforced:** Via Jest configuration

---

## Structure

```
enterprise-qa-devops/
├── squad.yaml              # Squad manifest
├── README.md               # This file
├── package.json            # Dependencies and scripts
├── jest.config.js          # Test configuration
│
├── agents/                 # Agent definitions
│   ├── jira-agent.md
│   ├── xray-agent.md
│   ├── confluence-agent.md
│   └── o365-agent.md
│
├── tasks/                  # Task definitions
│   ├── jira-*.md
│   ├── xray-*.md
│   ├── confluence-*.md
│   └── o365-*.md
│
├── workflows/              # Automated workflows
│   ├── test-report-workflow.yaml
│   ├── sprint-documentation.yaml
│   └── release-notification.yaml
│
├── checklists/             # QA checklists
│   ├── qa-review-checklist.md
│   ├── release-checklist.md
│   └── integration-test-checklist.md
│
├── templates/              # Document templates
│   ├── test-report-template.md
│   ├── bug-report-template.md
│   ├── sprint-summary-template.md
│   └── release-notes-template.md
│
├── tools/                  # API clients & infrastructure
│   ├── jira-client.js      # Jira REST API client
│   ├── xray-client.js      # Xray API client
│   ├── confluence-client.js # Confluence API client
│   ├── graph-client.js     # Microsoft Graph client
│   ├── resilient-client.js # Circuit breaker, retry, rate limit
│   ├── secrets-manager.js  # Multi-backend credential management
│   └── api-contracts.js    # Version-agnostic interfaces
│
├── scripts/                # Utility scripts
│   ├── setup-credentials.js
│   ├── health-check.js
│   └── sync-test-results.js
│
├── config/                 # Configuration docs
│   ├── coding-standards.md
│   ├── tech-stack.md
│   ├── credentials.md
│   └── mental-models.md
│
└── __tests__/              # Test suite
    ├── setup.js
    ├── mocks/
    ├── tools/
    └── integration/
```

## Integration Points

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Run Tests
  run: pytest --junitxml=results.xml

- name: Import to Xray
  run: |
    @xray *import-junit \
      --file results.xml \
      --project PROJ \
      --testPlan PROJ-100 \
      --summary "Build #${{ github.run_number }}"

- name: Create Report
  run: |
    @confluence *from-template \
      --template test-report \
      --space QA \
      --title "CI Report ${{ github.run_number }}"
```

### Webhook Triggers

Workflows can be triggered by:
- CI/CD webhooks
- Jira issue events
- Scheduled cron jobs
- Manual commands

## Mental Models

This squad applies mental models from:

- **Eric Ries** - Build-Measure-Learn
- **Gene Kim** - Three Ways of DevOps
- **James Bach** - Rapid Software Testing
- **Maaret Pyhäjärvi** - Exploratory Testing
- **Robert C. Martin** - Clean Architecture
- **Kent Beck** - Four Rules of Simple Design

See `config/mental-models.md` for detailed applications.

## Requirements

### Environment

- Node.js ≥18.x
- Python ≥3.9 (optional, for pytest integration)

### Services

- Atlassian Cloud (Jira + Confluence)
- Xray Cloud (Test Management)
- Microsoft 365 (optional)

### Permissions

| Service | Required Permissions |
|---------|---------------------|
| Jira | Browse, Create, Edit issues |
| Xray | Test management access |
| Confluence | Create, Edit pages |
| Microsoft 365 | Mail.Send, ChannelMessage.Send, Calendars.ReadWrite |

## Troubleshooting

### Health Check

```bash
node scripts/health-check.js
```

### Common Issues

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check API token/credentials |
| 403 Forbidden | Verify permissions |
| 404 Not Found | Check project/space keys |
| Connection timeout | Check network/firewall |

### Debug Mode

```bash
export AIOS_DEBUG=true
```

## Contributing

1. Follow `config/coding-standards.md`
2. Add tests for new functionality
3. Update documentation
4. Run health check before committing

## License

MIT - See LICENSE file in repository root.

---

*Enterprise QA DevOps Squad v2.0.0*
*Built with AIOS*

---

## Documentation

- **PRD:** `docs/prd/enterprise-qa-devops-squad.md`
- **ADR:** `docs/architecture/adr/adr-enterprise-qa-devops-resilience.md`
- **Architecture Index:** `docs/architecture/ARCHITECTURE-INDEX.md`
