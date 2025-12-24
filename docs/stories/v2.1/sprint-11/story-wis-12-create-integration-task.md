# Story WIS-12: `*create-integration` Task Implementation

<!-- Source: Epic WIS - Workflow Intelligence System -->
<!-- Context: Extended task for external API integrations -->
<!-- Created: 2025-12-23 by @sm (River) -->

## Status: Draft

**Priority:** 🟡 MEDIUM
**Sprint:** 11
**Effort:** 4-6h
**Lead:** @dev (Dex)
**Approved by:** Pending @po validation

---

## Story

**As an** AIOS developer integrating external APIs,
**I want** a `*create-integration` command that extends `*create-service` with auth and rate limiting,
**So that** I can quickly scaffold API integrations with OAuth, caching, and rate limiting built-in.

---

## Background

WIS-9 Investigation defined the `*create-integration` task (Section 5.3).
This task extends `*create-service` with additional templates for external API integration.

### Reference Documents

| Document | Section |
|----------|---------|
| `docs/architecture/wis-9-investigation-report.md` | Section 5.3: *create-integration |
| `docs/architecture/wis-9-investigation-report.md` | Section 6.2: integration-template/ |
| WIS-11 | Base `*create-service` task |

---

## 🤖 CodeRabbit Integration

### Story Type Analysis

**Primary Type**: Implementation
**Secondary Type(s)**: Task Extension, API Integration
**Complexity**: Medium

### Specialized Agent Assignment

**Primary Agents**:
- @dev (Dex): Implement task and additional templates

**Supporting Agents**:
- @architect (Aria): Review OAuth patterns

### Quality Gate Tasks

- [ ] Pre-Commit (@dev): Validate auth template generation
  - **Pass criteria:** OAuth flow works, rate limiting functional
  - **Fail criteria:** Auth template errors, missing rate limit config

### Self-Healing Configuration

**Mode:** light
**Max Iterations:** 2
**Timeout:** 15 minutes

### Focus Areas

- OAuth 2.0 implementation correctness
- Rate limiting logic
- Token refresh patterns
- Caching strategy

---

## Acceptance Criteria

### AC 12.1: Task Definition
- [ ] Create `.aios-core/development/tasks/create-integration.md`
- [ ] Extend `*create-service` with defaults:
  - `service_type: "api-integration"`
  - `has_auth: true`

### AC 12.2: Additional Inputs
- [ ] Add `api_base_url` (required string)
- [ ] Add `auth_type` enum:
  - `api-key` - Simple API key header
  - `oauth2` - OAuth 2.0 with refresh
  - `bearer-token` - Bearer token auth
  - `custom` - Custom auth implementation
- [ ] Add `rate_limit` object:
  - `requests_per_minute` (default: 100)
  - `retry_max` (default: 3)

### AC 12.3: Integration Templates
- [ ] Create `integration-template/` extending service-template:
  - `auth.ts.hbs` - Authentication module
  - `oauth.ts.hbs` - OAuth 2.0 flow (conditional)
  - `cache.ts.hbs` - Response caching
  - `rate-limiter.ts.hbs` - Rate limiting

### AC 12.4: Auth Type Templates
- [ ] Create auth-specific templates:
  - `integration-auth-api-key.ts.hbs`
  - `integration-auth-oauth2.ts.hbs`
  - `integration-auth-bearer-token.ts.hbs`
  - `integration-auth-custom.ts.hbs`

### AC 12.5: Elicitation Extension
- [ ] Add integration-specific questions:
  ```
  1. "What is the API base URL?" (text)
  2. "What authentication type?" (choice: api-key, oauth2, bearer-token, custom)
  3. "Requests per minute limit?" (number, default: 100)
  4. "OAuth scopes required?" (list, if oauth2)
  ```

### AC 12.6: Agent Integration
- [ ] Add `create-integration` to @dev agent commands
- [ ] Add task reference to @dev dependencies

---

## Tasks / Subtasks

- [ ] **Task 1: Create Task Definition** (AC: 12.1)
  - [ ] Create task file extending `*create-service`
  - [ ] Set default values

- [ ] **Task 2: Implement Additional Inputs** (AC: 12.2)
  - [ ] Add api_base_url validation
  - [ ] Add auth_type enum
  - [ ] Add rate_limit object schema

- [ ] **Task 3: Create Integration Templates** (AC: 12.3, 12.4)
  - [ ] Create auth.ts.hbs
  - [ ] Create oauth.ts.hbs
  - [ ] Create cache.ts.hbs
  - [ ] Create rate-limiter.ts.hbs
  - [ ] Create auth-type specific templates

- [ ] **Task 4: Implement Elicitation** (AC: 12.5)
  - [ ] Add API-specific questions
  - [ ] Add OAuth scope collection

- [ ] **Task 5: Agent Integration** (AC: 12.6)
  - [ ] Update @dev agent

---

## Dev Notes

### OAuth 2.0 Template Pattern

```typescript
// oauth.ts.hbs
export interface OAuth2Config {
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  scopes: string[];
}

export class OAuth2Client {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: Date | null = null;

  async getAccessToken(): Promise<string> {
    if (this.isTokenExpired()) {
      await this.refreshAccessToken();
    }
    return this.accessToken!;
  }
}
```

### Rate Limiter Pattern

```typescript
// rate-limiter.ts.hbs
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number;

  constructor(requestsPerMinute: number = {{rate_limit.requests_per_minute}}) {
    this.maxTokens = requestsPerMinute;
    this.tokens = requestsPerMinute;
    this.refillRate = requestsPerMinute / 60;
    this.lastRefill = Date.now();
  }

  async acquire(): Promise<void> {
    // Token bucket algorithm
  }
}
```

---

## Testing

**Validation:**
1. Create test integration (e.g., mock API)
2. Verify OAuth flow generation
3. Test rate limiting behavior
4. Verify token refresh works

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-23 | @sm (River) | Initial draft from WIS-9 investigation |
