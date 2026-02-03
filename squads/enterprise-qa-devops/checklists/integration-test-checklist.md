# Integration Test Checklist

> **Mental Model Applied:** Agile Testing Quadrants + Build-Measure-Learn

## Pre-Integration Setup

### Environment Preparation
- [ ] Integration test environment available
- [ ] All dependent services running
- [ ] Test database seeded with base data
- [ ] Mock servers configured (if needed)
- [ ] Network connectivity verified

### Configuration
- [ ] Environment variables set correctly
- [ ] API keys and tokens valid
- [ ] Feature flags configured for testing
- [ ] Logging level set to DEBUG

### Data Setup
- [ ] Test users created
- [ ] Test data populated
- [ ] Cleanup scripts ready
- [ ] Data isolation verified

## API Integration Tests

### Endpoint Testing
For each API endpoint:

- [ ] **Authentication**
  - [ ] Valid token accepted
  - [ ] Invalid token rejected (401)
  - [ ] Expired token handled correctly
  - [ ] Missing token rejected

- [ ] **Authorization**
  - [ ] Admin can access admin endpoints
  - [ ] Users cannot access admin endpoints (403)
  - [ ] Resource ownership enforced

- [ ] **Request Validation**
  - [ ] Valid requests succeed (200/201)
  - [ ] Invalid payload rejected (400)
  - [ ] Missing required fields rejected
  - [ ] Invalid data types rejected

- [ ] **Response Format**
  - [ ] JSON structure matches schema
  - [ ] Pagination works correctly
  - [ ] Filtering works correctly
  - [ ] Sorting works correctly

- [ ] **Error Handling**
  - [ ] 404 for not found resources
  - [ ] 500 handled gracefully
  - [ ] Error messages are helpful
  - [ ] Stack traces not exposed

## Database Integration Tests

### CRUD Operations
- [ ] Create operations persist data
- [ ] Read operations return correct data
- [ ] Update operations modify data correctly
- [ ] Delete operations remove data (soft/hard)

### Data Integrity
- [ ] Foreign key constraints enforced
- [ ] Unique constraints enforced
- [ ] Cascading deletes work correctly
- [ ] Transactions roll back on error

### Performance
- [ ] Queries use indexes efficiently
- [ ] No N+1 query problems
- [ ] Bulk operations performant
- [ ] Connection pooling working

## Third-Party Service Integration

### Atlassian (Jira/Confluence)
- [ ] Authentication successful
- [ ] Issue creation works
- [ ] Issue search returns results
- [ ] Webhooks received correctly

```bash
# Test Jira connection
@jira *search "project = PROJ AND created >= -1d" --maxResults 5
```

### Xray
- [ ] Authentication successful
- [ ] Test import works
- [ ] Execution creation works
- [ ] Coverage reports generate

```bash
# Test Xray import
@xray *import-junit --file test-sample.xml --project PROJ --dryRun
```

### Microsoft 365
- [ ] Graph API authentication works
- [ ] Email sending works
- [ ] Teams posting works
- [ ] Calendar events create

```bash
# Test O365 connection
@o365 *send-teams --channel "Test" --message "Integration test" --dryRun
```

## Message Queue Integration (if applicable)

### Producer Testing
- [ ] Messages published to queue
- [ ] Message format correct
- [ ] Routing keys correct
- [ ] Dead letter queue configured

### Consumer Testing
- [ ] Messages consumed correctly
- [ ] Processing completes successfully
- [ ] Failed messages requeued
- [ ] Poison messages handled

## Caching Integration (if applicable)

### Cache Operations
- [ ] Cache hits return correct data
- [ ] Cache misses fetch from source
- [ ] Cache invalidation works
- [ ] TTL expiration works

### Edge Cases
- [ ] Large objects handled
- [ ] Concurrent access handled
- [ ] Cache failure fallback works

## Security Integration Tests

### Authentication Flows
- [ ] Login flow works end-to-end
- [ ] Logout clears session
- [ ] Password reset flow works
- [ ] MFA flow works (if applicable)

### Data Protection
- [ ] Sensitive data encrypted at rest
- [ ] Sensitive data encrypted in transit
- [ ] PII masked in logs
- [ ] SQL injection prevented

## Error Scenarios

### Service Unavailability
- [ ] Graceful degradation when Jira unavailable
- [ ] Graceful degradation when DB unavailable
- [ ] Timeout handling correct
- [ ] Retry logic works

### Network Issues
- [ ] Connection timeout handled
- [ ] Read timeout handled
- [ ] SSL certificate errors logged
- [ ] DNS resolution failures handled

## Performance Benchmarks

### Response Times
| Endpoint/Operation | Target | Actual | Pass |
|-------------------|--------|--------|------|
| Login API | <500ms | | ⬜ |
| Search API | <1000ms | | ⬜ |
| Report generation | <5000ms | | ⬜ |
| File upload | <3000ms | | ⬜ |

### Throughput
| Operation | Target | Actual | Pass |
|-----------|--------|--------|------|
| API requests/sec | >100 | | ⬜ |
| DB queries/sec | >500 | | ⬜ |
| Messages/sec | >50 | | ⬜ |

## Test Results Recording

```bash
# Create test execution
@xray *create-execution \
  --project PROJ \
  --summary "Integration Tests - $(date +%Y-%m-%d)" \
  --environments "Integration"

# Import results
@xray *import-junit \
  --file integration-results.xml \
  --project PROJ \
  --summary "Integration Test Run"
```

## Post-Test Cleanup

- [ ] Test data cleaned up
- [ ] Test users removed (if needed)
- [ ] Environment reset to baseline
- [ ] Logs archived

## Sign-off

| Category | Tester | Date | Status |
|----------|--------|------|--------|
| API Tests | | | ⬜ |
| DB Tests | | | ⬜ |
| Third-Party | | | ⬜ |
| Security | | | ⬜ |
| Performance | | | ⬜ |

---

*Enterprise QA DevOps Squad - Integration Test Checklist v1.0*
