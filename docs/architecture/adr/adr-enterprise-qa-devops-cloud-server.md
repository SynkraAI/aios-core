# ADR: Cloud vs Server Strategy for Enterprise QA DevOps

**Status:** Accepted
**Date:** 2026-02-04
**Decision Makers:** Architecture Team
**Related:** [ADR-Enterprise-QA-DevOps-Resilience](./adr-enterprise-qa-devops-resilience.md)

---

## Context

The Enterprise QA DevOps Squad integrates with multiple enterprise platforms (Atlassian, Microsoft 365, Xray) that offer both Cloud and Server/Data Center deployment options. Each has different:

- API endpoints and authentication methods
- Rate limits and quotas
- Feature availability
- Security and compliance requirements
- Cost structures

We need a clear strategy for supporting both deployment models while maintaining code simplicity and test coverage.

---

## Decision

### Primary Strategy: Cloud-First with Server Compatibility

We adopt a **Cloud-First with Server Compatibility Layer** approach:

1. **Cloud as Default**: All clients default to Cloud APIs and authentication
2. **Server as Configuration**: Server/DC support via configuration flags and environment variables
3. **Unified Interface**: Same method signatures regardless of deployment model
4. **Abstraction Layer**: API contracts hide implementation differences

### Implementation Details

#### 1. Platform Detection

```javascript
class AtlassianClient {
  constructor(options = {}) {
    this.isCloud = this.detectDeployment(options);
    this.baseUrl = this.isCloud
      ? `https://${options.domain}/rest/api/3`      // Cloud API v3
      : `${options.serverUrl}/rest/api/2`;          // Server API v2
  }

  detectDeployment(options) {
    // Explicit configuration takes precedence
    if (options.isCloud !== undefined) return options.isCloud;

    // Detect from URL pattern
    if (options.domain?.includes('.atlassian.net')) return true;
    if (options.serverUrl) return false;

    // Default to Cloud
    return true;
  }
}
```

#### 2. Authentication Abstraction

| Platform | Cloud Auth | Server/DC Auth |
|----------|------------|----------------|
| Jira | API Token (Basic) | Personal Access Token |
| Confluence | API Token (Basic) | Personal Access Token |
| Xray | OAuth 2.0 Client Credentials | Basic Auth |
| Microsoft 365 | Azure AD App Registration | N/A (Cloud only) |

```javascript
async getAuthHeaders() {
  if (this.isCloud) {
    // Cloud: email:apiToken as Basic auth
    return {
      'Authorization': `Basic ${Buffer.from(`${this.email}:${this.apiToken}`).toString('base64')}`
    };
  } else {
    // Server: Personal Access Token as Bearer
    return {
      'Authorization': `Bearer ${this.personalAccessToken}`
    };
  }
}
```

#### 3. API Version Mapping

| Feature | Cloud API | Server API | Abstraction |
|---------|-----------|------------|-------------|
| Create Issue | POST /rest/api/3/issue | POST /rest/api/2/issue | `createIssue(payload)` |
| Rich Text | Atlassian Document Format | Wiki Markup | `formatContent(text, format)` |
| User Reference | accountId | username | `getUserIdentifier(user)` |
| Permissions | Connect app scopes | Server permissions | `checkPermission(action)` |

#### 4. Feature Parity Handling

Some features are Cloud-only or have different implementations:

```javascript
async advancedSearch(options) {
  if (this.isCloud && this.hasAdvancedSearchPermission()) {
    return this.cloudAdvancedSearch(options);
  } else {
    // Fallback to standard JQL search
    return this.jqlSearch(options.jql);
  }
}

isFeatureAvailable(feature) {
  const cloudOnly = ['advanced-roadmaps', 'automation-rules', 'ai-features'];
  const serverOnly = ['data-center-clustering', 'local-storage'];

  if (cloudOnly.includes(feature)) return this.isCloud;
  if (serverOnly.includes(feature)) return !this.isCloud;
  return true;
}
```

---

## Rationale

### Why Cloud-First?

1. **Market Direction**: Atlassian ending Server sales (2024), pushing Cloud adoption
2. **API Freshness**: Cloud APIs updated more frequently with new features
3. **Reduced Complexity**: Fewer deployment scenarios to test
4. **Better Security**: Automatic updates, managed infrastructure

### Why Maintain Server Support?

1. **Enterprise Requirements**: Some organizations have data residency requirements
2. **Transition Period**: Companies migrating from Server to Cloud need both
3. **Data Center**: Large enterprises use Data Center for performance/compliance
4. **Xray Server**: Some Xray installations still use Server APIs

---

## Consequences

### Positive

- **Simplified Default Path**: New users get Cloud experience without configuration
- **Gradual Migration**: Organizations can migrate without code changes
- **Single Codebase**: One client library supports all scenarios
- **Future-Proof**: Ready for Cloud-only future

### Negative

- **Testing Overhead**: Must test both Cloud and Server paths
- **Feature Drift**: Server may lag behind Cloud in features
- **Documentation**: Must document both deployment options

### Neutral

- **Configuration Complexity**: More options for advanced users
- **Abstraction Cost**: Some indirection in code paths

---

## Implementation Guidelines

### Environment Variables

```bash
# Cloud Configuration (default)
ATLASSIAN_DOMAIN=mycompany.atlassian.net
ATLASSIAN_EMAIL=user@mycompany.com
ATLASSIAN_API_TOKEN=xxxxxx

# Server Configuration (optional)
ATLASSIAN_SERVER_URL=https://jira.mycompany.internal
ATLASSIAN_PERSONAL_ACCESS_TOKEN=xxxxxx
ATLASSIAN_IS_CLOUD=false

# Xray Cloud
XRAY_CLIENT_ID=xxxxxx
XRAY_CLIENT_SECRET=xxxxxx

# Xray Server
XRAY_API_BASE_URL=https://xray.mycompany.internal
XRAY_API_USER=service-account
XRAY_API_PASSWORD=xxxxxx
XRAY_IS_CLOUD=false
```

### Testing Strategy

```javascript
// Test both paths in CI
describe('JiraClient', () => {
  describe('Cloud mode', () => {
    beforeEach(() => {
      process.env.ATLASSIAN_IS_CLOUD = 'true';
    });
    // Cloud-specific tests
  });

  describe('Server mode', () => {
    beforeEach(() => {
      process.env.ATLASSIAN_IS_CLOUD = 'false';
    });
    // Server-specific tests
  });
});
```

### Migration Guide for Users

1. **Check Current Deployment**: Identify Cloud vs Server/DC
2. **Configure Environment**: Set appropriate variables
3. **Test Integration**: Run health checks
4. **Handle Feature Differences**: Check `isFeatureAvailable()` for advanced features

---

## Platform-Specific Notes

### Atlassian (Jira/Confluence)

- **Cloud**: Uses Atlassian Document Format (ADF) for rich text
- **Server**: Uses Wiki Markup for rich text
- **Migration**: Use `atlassian-adf-converter` for format conversion

### Xray

- **Cloud**: OAuth 2.0 with client credentials flow
- **Server/DC**: Basic authentication with API user
- **API Differences**: Some endpoints differ (`/api/v2` vs `/rest/raven/1.0`)

### Microsoft 365

- **Cloud Only**: No on-premises API equivalent
- **Alternative**: For on-prem Exchange, use EWS (Exchange Web Services)
- **Hybrid**: Use Microsoft Graph with hybrid configuration

---

## Related Decisions

- [ADR-Enterprise-QA-DevOps-Resilience](./adr-enterprise-qa-devops-resilience.md) - Resilience patterns
- Rate limiting differences between Cloud and Server (see resilience ADR)

---

## Review Schedule

This decision should be reviewed:
- When Atlassian Server reaches end-of-support
- When new major API versions are released
- When significant feature divergence occurs

---

**Last Updated:** 2026-02-04
**Next Review:** 2026-08-04
