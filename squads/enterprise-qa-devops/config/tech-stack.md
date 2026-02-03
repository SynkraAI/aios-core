# Tech Stack - Enterprise QA DevOps Squad

## Overview

This squad integrates with enterprise tools for test management, documentation, and communication.

## Core Technologies

### Runtime

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | ≥18.x | Runtime for tools and scripts |
| Python | ≥3.9 | Alternative scripting, pytest integration |

### Node.js Dependencies

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "@microsoft/microsoft-graph-client": "^3.0.0",
    "@azure/msal-node": "^2.0.0",
    "@azure/identity": "^4.0.0",
    "form-data": "^4.0.0",
    "dotenv": "^16.0.0",
    "xml2js": "^0.6.0"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "nock": "^13.0.0"
  }
}
```

### Python Dependencies

```requirements.txt
atlassian-python-api>=3.41.0
jira>=3.6.0
O365>=2.0.0
pytest-jira-xray>=0.9.0
python-dotenv>=1.0.0
requests>=2.31.0
```

## Integrated Services

### Atlassian Cloud

| Service | API Version | Documentation |
|---------|-------------|---------------|
| Jira | REST API v3 | [Jira Cloud REST API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/) |
| Confluence | REST API | [Confluence Cloud REST API](https://developer.atlassian.com/cloud/confluence/rest/v1/) |
| Xray | v2 (Cloud) | [Xray Cloud API](https://docs.getxray.app/display/XRAYCLOUD/REST+API) |

### Microsoft 365

| Service | API | Documentation |
|---------|-----|---------------|
| Microsoft Graph | v1.0 | [Microsoft Graph API](https://docs.microsoft.com/graph/) |
| Outlook | Mail API | [Mail REST API](https://docs.microsoft.com/graph/api/resources/mail-api-overview) |
| Teams | Teams API | [Teams API](https://docs.microsoft.com/graph/api/resources/teams-api-overview) |
| Calendar | Calendar API | [Calendar API](https://docs.microsoft.com/graph/api/resources/calendar) |

## Authentication

### Atlassian

- **Method**: API Token (Basic Auth)
- **Scope**: User-based permissions
- **Token URL**: https://id.atlassian.com/manage-profile/security/api-tokens

### Xray Cloud

- **Method**: OAuth 2.0 Client Credentials
- **Scope**: Test management operations
- **Token URL**: https://xray.cloud.getxray.app/api/v2/authenticate

### Microsoft 365

- **Method**: OAuth 2.0 Client Credentials (App-only)
- **Registration**: Azure AD App Registration
- **Permissions Required**:
  - Mail.Send
  - Mail.Read
  - Calendars.ReadWrite
  - ChannelMessage.Send
  - Files.ReadWrite.All

## MCP Servers (Optional)

These MCP servers can extend functionality when available:

| MCP Server | Purpose |
|------------|---------|
| atlassian | Direct Atlassian integration |
| azure-devops | Azure DevOps pipelines |
| ms-365 | Microsoft 365 operations |

## Development Tools

### Testing

| Tool | Purpose |
|------|---------|
| Jest | Unit and integration testing |
| Nock | HTTP mocking for tests |
| pytest | Python test framework |
| pytest-jira-xray | Xray test result export |

### Code Quality

| Tool | Purpose |
|------|---------|
| ESLint | JavaScript linting |
| Prettier | Code formatting |
| Pylint | Python linting |
| Black | Python formatting |

### CI/CD Integration

| Platform | Support |
|----------|---------|
| GitHub Actions | Full workflow support |
| GitLab CI | Full workflow support |
| Azure DevOps | Pipeline integration |
| Jenkins | Script-based integration |

## File Formats

### Input Formats

| Format | Extension | Use Case |
|--------|-----------|----------|
| JUnit XML | `.xml` | Test results from most frameworks |
| Cucumber JSON | `.json` | BDD test results |
| Robot Framework | `.xml` | Robot test output |
| JSON | `.json` | Configuration, data exchange |
| YAML | `.yaml`, `.yml` | Workflows, configuration |

### Output Formats

| Format | Use Case |
|--------|----------|
| Markdown | Documentation, reports |
| HTML | Confluence pages, emails |
| JSON | API responses, data export |

## Environment Variables

### Required

```bash
# Atlassian
ATLASSIAN_DOMAIN=company.atlassian.net
ATLASSIAN_EMAIL=user@company.com
ATLASSIAN_API_TOKEN=<token>

# Xray
XRAY_CLIENT_ID=<client-id>
XRAY_CLIENT_SECRET=<client-secret>
```

### Optional

```bash
# Microsoft 365
MS365_CLIENT_ID=<client-id>
MS365_CLIENT_SECRET=<client-secret>
MS365_TENANT_ID=<tenant-id>

# Azure DevOps (if used)
AZURE_DEVOPS_PAT=<personal-access-token>
AZURE_DEVOPS_ORG=<organization>
```

## Rate Limits

### Atlassian Cloud

| API | Limit |
|-----|-------|
| Jira REST API | Varies by tier, typically 100-500 req/min |
| Confluence REST API | Similar to Jira |
| Xray Cloud | 5000 req/hour |

### Microsoft Graph

| Resource | Limit |
|----------|-------|
| General | 10,000 req/10 min per app |
| Mail.Send | 30 messages/min (delegated) |
| Teams | 2 messages/sec per user in channel |

## Security Considerations

1. **Credential Storage**: Use environment variables or secure vault
2. **API Tokens**: Rotate regularly (90 days recommended)
3. **Permissions**: Use minimum required scopes
4. **Logging**: Never log credentials or tokens
5. **HTTPS**: All connections use TLS 1.2+

---

*Enterprise QA DevOps Squad - Tech Stack v1.0*
