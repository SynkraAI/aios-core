# ADR: Enterprise QA DevOps Squad - Resilience & Security Patterns

**Status:** Accepted
**Date:** 2026-02-04
**Deciders:** @architect, @dev, @qa
**Technical Story:** Address critical issues from meta-cognitive analysis

---

## Context and Problem Statement

The Enterprise QA DevOps Squad was created with 49 files including 4 API clients (Jira, Xray, Confluence, Microsoft Graph) but lacked:

1. **No tests** - A QA squad with zero tests (ironic)
2. **No resilience** - 100% dependency on external APIs with no fallback
3. **Plain text credentials** - `.env` files with no rotation or audit
4. **Tight API coupling** - Direct API calls with no abstraction for version changes

These gaps were identified through meta-cognitive analysis and classified as CRITICAL priority.

---

## Decision Drivers

- **Reliability**: Squad must handle API outages gracefully
- **Security**: Enterprise customers require proper credential management
- **Maintainability**: APIs evolve; code shouldn't break on every update
- **Testability**: Must validate functionality without production access
- **Compliance**: Audit trails required for credential usage

---

## Considered Options

### Option 1: Minimal Fixes
- Add basic try/catch error handling
- Document that users should use secrets managers
- Write a few happy-path tests

**Rejected because:** Doesn't solve root problems, just masks them.

### Option 2: External Libraries Only
- Use existing libraries (axios-retry, opossum, etc.)
- Rely on cloud provider SDKs for secrets
- Use existing test frameworks

**Rejected because:** Adds many dependencies, less control over behavior, harder to customize for AIOS patterns.

### Option 3: Custom Resilience Layer (Selected)
- Build `ResilientClient` base class with circuit breaker, retry, rate limiting
- Build `SecretsManager` with multi-backend support
- Build `APIContract` abstraction layer
- Comprehensive test suite with mocks

**Selected because:**
- Single dependency model
- Tailored to AIOS patterns
- Full control over behavior
- Consistent across all API clients

---

## Decision Outcome

### Chosen Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│   (Tasks, Workflows, Agents)                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Contracts Layer                        │
│   IssueContract │ TestMgmtContract │ DocContract │ CommContract │
│   - Stable interfaces                                        │
│   - Response normalization                                   │
│   - Version abstraction                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Resilient Client Layer                     │
│   - Circuit Breaker (5 failures → 30s open)                 │
│   - Retry with Exponential Backoff (1s, 2s, 4s...)         │
│   - Rate Limiter (token bucket)                             │
│   - Timeout Management                                       │
│   - Metrics & Events                                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Clients Layer                          │
│   JiraClient │ XrayClient │ ConfluenceClient │ GraphClient  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Secrets Manager                            │
│   Azure Key Vault │ AWS Secrets │ 1Password │ .env fallback │
│   - Caching (5 min TTL)                                     │
│   - Rotation reminders (90 days)                            │
│   - Audit logging                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Components Implemented

### 1. Resilient Client (`tools/resilient-client.js`)

```javascript
// Circuit Breaker States
CLOSED → OPEN (after 5 failures) → HALF_OPEN (after 30s) → CLOSED (on success)

// Usage
class JiraClient extends ResilientClient {
  async createIssue(payload) {
    return this.executeWithResilience(
      () => this.client.post('/issue', payload),
      { operation: 'createIssue' }
    );
  }
}
```

**Configuration:**
| Parameter | Default | Description |
|-----------|---------|-------------|
| `failureThreshold` | 5 | Failures before circuit opens |
| `resetTimeout` | 30000ms | Time before half-open test |
| `maxRetries` | 3 | Retry attempts |
| `baseDelay` | 1000ms | Initial retry delay |
| `maxTokens` | 100 | Rate limiter capacity |
| `refillRate` | 10/sec | Token refill rate |

### 2. Secrets Manager (`tools/secrets-manager.js`)

**Supported Backends:**

| Backend | Environment Variable | Use Case |
|---------|---------------------|----------|
| Azure Key Vault | `AZURE_KEY_VAULT_URL` | Azure-native enterprises |
| AWS Secrets Manager | `AWS_REGION` | AWS-native enterprises |
| 1Password CLI | `OP_VAULT` | Developer-friendly |
| Environment/.env | (default) | Development/testing |

**Features:**
- Credential caching with 5-minute TTL
- Rotation reminder after 90 days
- Audit log of all secret access
- Validation of required credentials

### 3. API Contracts (`tools/api-contracts.js`)

**Contracts Defined:**

| Contract | Abstracted API | Key Methods |
|----------|---------------|-------------|
| `IssueContract` | Jira REST API v2/v3 | create, get, update, transition, search |
| `TestManagementContract` | Xray Cloud/Server | importResults, getCoverage, getTestPlanTests |
| `DocumentationContract` | Confluence v1/v2 | createPage, updatePage, search |
| `CommunicationContract` | Microsoft Graph | sendEmail, postTeamsMessage, createEvent |

**Version Registry:**
```javascript
API_VERSIONS = {
  jira: { current: '3', supported: ['2', '3'], deprecated: ['1'] },
  confluence: { current: 'v2', supported: ['v1', 'v2'] },
  xray: { current: 'v2', supported: ['v1', 'v2'] },
  graph: { current: 'v1.0', supported: ['v1.0', 'beta'] }
}
```

### 4. Test Suite (`__tests__/`)

**Coverage:**

| Test File | Tests | Coverage |
|-----------|-------|----------|
| jira-client.test.js | 25+ | Issues, Search, Transitions, Comments |
| xray-client.test.js | 20+ | Import, Export, Test Operations |
| confluence-client.test.js | 30+ | Pages, Labels, Attachments |
| graph-client.test.js | 25+ | Mail, Calendar, Teams, OneDrive |
| resilient-client.test.js | 20+ | Circuit, Retry, Rate Limit |
| secrets-manager.test.js | 25+ | Backends, Caching, Audit |
| workflow.test.js | 10+ | Multi-service integration |

---

## Consequences

### Positive

- **Resilience**: Services degrade gracefully instead of failing catastrophically
- **Security**: Credentials properly managed with audit trail
- **Maintainability**: API changes only require updating contracts, not all code
- **Testability**: 80% coverage requirement enforced
- **Observability**: Metrics and events for monitoring

### Negative

- **Complexity**: More code to understand and maintain
- **Learning Curve**: Developers must understand resilience patterns
- **Performance**: Small overhead from circuit breaker checks

### Neutral

- **Dependencies**: No new external dependencies added
- **Breaking Changes**: Existing code works unchanged; new patterns are opt-in

---

## Implementation Notes

### Migration Path for Existing Clients

```javascript
// Before: Direct API call
const result = await this.client.post('/issue', payload);

// After: With resilience
const result = await this.executeWithResilience(
  () => this.client.post('/issue', payload),
  { operation: 'createIssue' }
);
```

### Secrets Manager Usage

```javascript
// Initialize
const secrets = new SecretsManager({ backend: 'azure' });

// Load credentials
const loader = new CredentialLoader(secrets);
const creds = await loader.loadAll();

// Validate before use
const validation = await loader.validate();
if (!validation.complete) {
  console.error('Missing:', validation.missing);
}
```

### Contract Usage

```javascript
// Use contract instead of direct client
const issues = ContractFactory.createIssueContract(jiraClient);

// Stable interface regardless of API version
const issue = await issues.create({
  project: 'PROJ',
  summary: 'Task title',
  type: 'Task'
});
```

---

## Related Decisions

- ADR-COLLAB-1: Current state audit identified need for resilience
- Meta-cognitive analysis: Formal documentation of gaps

---

## References

- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Atlassian REST API v3](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [Microsoft Graph API](https://docs.microsoft.com/en-us/graph/overview)
- [Xray Cloud API](https://docs.getxray.app/display/XRAYCLOUD/REST+API)

---

*ADR created: 2026-02-04*
*Last updated: 2026-02-04*
