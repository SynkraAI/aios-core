# Enterprise QA DevOps Squad - Metrics & KPIs

> Success metrics, monitoring guidelines, and performance targets

**Version:** 1.0.0
**Last Updated:** 2026-02-04

---

## Table of Contents

1. [Resilience Metrics](#1-resilience-metrics)
2. [API Client Metrics](#2-api-client-metrics)
3. [Business Metrics](#3-business-metrics)
4. [Quality Metrics](#4-quality-metrics)
5. [Operational Metrics](#5-operational-metrics)
6. [Dashboards & Alerting](#6-dashboards--alerting)

---

## 1. Resilience Metrics

### Circuit Breaker

| Metric | Description | Target | Alert Threshold |
|--------|-------------|--------|-----------------|
| `circuit.open_count` | Number of times circuit opened | < 5/day | > 10/hour |
| `circuit.half_open_success_rate` | Recovery success rate | > 80% | < 50% |
| `circuit.time_in_open_state` | Duration circuit stays open | < 5 min avg | > 15 min |
| `circuit.failure_rate` | Requests failing before open | < 10% | > 20% |

### Retry Pattern

| Metric | Description | Target | Alert Threshold |
|--------|-------------|--------|-----------------|
| `retry.total_attempts` | Total retry attempts | < 20% of requests | > 40% |
| `retry.success_after_retry` | Retries that eventually succeed | > 90% | < 70% |
| `retry.exhausted_count` | Max retries reached | < 1% | > 5% |
| `retry.avg_attempts_per_success` | Average retries needed | < 1.5 | > 2.5 |

### Rate Limiter

| Metric | Description | Target | Alert Threshold |
|--------|-------------|--------|-----------------|
| `rate.tokens_consumed` | Tokens used per minute | < 80% capacity | > 95% |
| `rate.requests_delayed` | Requests waiting for tokens | < 5% | > 20% |
| `rate.avg_wait_time` | Average delay when rate limited | < 500ms | > 2s |
| `rate.burst_rejection` | Requests rejected due to burst | 0% | > 1% |

### Collection Example

```javascript
const metrics = client.getMetrics();
// Returns:
{
  circuitBreaker: {
    state: 'CLOSED',
    failures: 2,
    successes: 150,
    lastFailure: '2026-02-04T10:30:00Z',
    openCount: 1
  },
  rateLimiter: {
    currentTokens: 85,
    requestsDelayed: 3,
    requestsProcessed: 1500
  },
  retry: {
    totalAttempts: 45,
    successfulRetries: 42,
    exhaustedRetries: 3
  },
  performance: {
    avgLatency: 245,
    p95Latency: 890,
    p99Latency: 1250
  }
}
```

---

## 2. API Client Metrics

### Per-Service Metrics

| Service | Metric | Target | Alert |
|---------|--------|--------|-------|
| Jira | Response time (p95) | < 500ms | > 1s |
| Jira | Success rate | > 99.5% | < 98% |
| Confluence | Response time (p95) | < 800ms | > 2s |
| Confluence | Success rate | > 99.5% | < 98% |
| Xray | Response time (p95) | < 1s | > 3s |
| Xray | Success rate | > 99% | < 97% |
| Graph API | Response time (p95) | < 600ms | > 1.5s |
| Graph API | Success rate | > 99.5% | < 98% |

### Error Classification

| Error Type | Description | Target | Alert |
|------------|-------------|--------|-------|
| `4xx` | Client errors (bad requests) | < 1% | > 5% |
| `401/403` | Auth failures | 0% | > 0.1% |
| `429` | Rate limit exceeded | < 0.5% | > 2% |
| `5xx` | Server errors | < 0.5% | > 2% |
| `timeout` | Request timeouts | < 0.5% | > 2% |
| `network` | Network failures | < 0.1% | > 1% |

### Health Check Metrics

| Metric | Description | Target | Alert |
|--------|-------------|--------|-------|
| `health.check_duration` | Time to complete health check | < 2s | > 5s |
| `health.services_healthy` | Percentage of healthy services | 100% | < 100% |
| `health.degraded_time` | Time in degraded state | 0 | > 5 min |

---

## 3. Business Metrics

### Workflow Automation

| Metric | Description | Target | Baseline |
|--------|-------------|--------|----------|
| `workflow.test_sync_time` | Time to sync test results | < 30s | 5 min manual |
| `workflow.doc_generation_time` | Sprint report generation | < 2 min | 2 hours manual |
| `workflow.incident_response_time` | Time to create incident artifacts | < 1 min | 15 min manual |
| `workflow.automation_success_rate` | Workflows completing without intervention | > 95% | N/A |

### Time Savings

| Process | Manual Time | Automated Time | Savings |
|---------|-------------|----------------|---------|
| Test result sync | 15 min/run | 30 sec | 97% |
| Sprint documentation | 2 hours | 2 min | 98% |
| Release notes | 4 hours | 10 min | 96% |
| Incident setup | 30 min | 1 min | 97% |
| Coverage reports | 1 hour | 5 min | 92% |

### Quality Impact

| Metric | Description | Target | Before Automation |
|--------|-------------|--------|-------------------|
| `quality.traceability_coverage` | Tests linked to requirements | > 95% | ~60% |
| `quality.documentation_freshness` | Days since last update | < 7 days | ~30 days |
| `quality.incident_mttr` | Mean time to resolution | -30% | Baseline |
| `quality.regression_detection` | Time to detect regression | < 1 hour | Next sprint |

---

## 4. Quality Metrics

### Code Quality

| Metric | Description | Target | Current |
|--------|-------------|--------|---------|
| Test coverage (lines) | Jest line coverage | > 80% | Enforced |
| Test coverage (branches) | Jest branch coverage | > 80% | Enforced |
| Test coverage (functions) | Jest function coverage | > 80% | Enforced |
| Cyclomatic complexity | Max complexity per function | < 15 | Monitored |
| Maintainability index | SonarQube/similar | > 80 | Monitored |

### Test Quality

| Metric | Description | Target | Alert |
|--------|-------------|--------|-------|
| `test.flakiness_rate` | Tests with inconsistent results | < 1% | > 3% |
| `test.execution_time` | Full test suite duration | < 5 min | > 10 min |
| `test.mock_accuracy` | Mock responses matching production | > 95% | Review needed |

### Security Metrics

| Metric | Description | Target | Alert |
|--------|-------------|--------|-------|
| `security.audit_critical` | Critical vulnerabilities | 0 | > 0 |
| `security.audit_high` | High vulnerabilities | 0 | > 0 |
| `security.secrets_exposure` | Hardcoded secrets detected | 0 | > 0 |
| `security.token_rotation` | Days since last rotation | < 90 | > 90 |

---

## 5. Operational Metrics

### Availability

| Service | Target SLA | Measurement Window |
|---------|------------|-------------------|
| Jira operations | 99.9% | Monthly |
| Confluence operations | 99.9% | Monthly |
| Xray operations | 99.5% | Monthly |
| Graph API operations | 99.9% | Monthly |
| Overall squad availability | 99.9% | Monthly |

### Performance Budgets

| Operation | Budget | Measurement |
|-----------|--------|-------------|
| Single API call | 1s | p95 |
| Multi-step workflow | 30s | p95 |
| Batch operations (100 items) | 5 min | p95 |
| File upload (< 10MB) | 30s | p95 |
| Full health check | 5s | p95 |

### Resource Usage

| Metric | Description | Target | Alert |
|--------|-------------|--------|-------|
| `resource.memory_mb` | Peak memory usage | < 512 MB | > 1 GB |
| `resource.cpu_percent` | Average CPU utilization | < 50% | > 80% |
| `resource.connections` | Active API connections | < 50 | > 100 |

---

## 6. Dashboards & Alerting

### Recommended Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENTERPRISE QA DEVOPS SQUAD                    │
├─────────────────┬─────────────────┬─────────────────────────────┤
│  SERVICE HEALTH │  CIRCUIT STATUS │     RATE LIMIT USAGE        │
│  ○ Jira: OK     │  JIRA: CLOSED   │  [████████░░] 80%           │
│  ○ Confluence   │  CONF: CLOSED   │  [██████░░░░] 60%           │
│  ○ Xray: OK     │  XRAY: CLOSED   │  [███░░░░░░░] 30%           │
│  ○ Graph: OK    │  GRPH: CLOSED   │  [█████████░] 90%           │
├─────────────────┴─────────────────┴─────────────────────────────┤
│                     API LATENCY (p95)                           │
│  Jira      [====>                    ] 320ms                    │
│  Confluence[======>                  ] 450ms                    │
│  Xray      [=========>               ] 680ms                    │
│  Graph     [=====>                   ] 380ms                    │
├─────────────────────────────────────────────────────────────────┤
│                    ERROR RATE (24h)                             │
│  ▁▁▂▁▁▁▃▂▁▁▁▁▂▁▁▁▁▁▂▁▁▁▁▁ 0.8% avg                            │
├─────────────────────────────────────────────────────────────────┤
│                 WORKFLOW SUCCESS RATE                           │
│  Test Sync      ████████████████████ 100%                       │
│  Doc Gen        ███████████████████░  95%                       │
│  Notifications  ████████████████████ 100%                       │
└─────────────────────────────────────────────────────────────────┘
```

### Alert Configuration

```yaml
# alert-rules.yaml
alerts:
  - name: circuit-breaker-open
    condition: circuit.state == 'OPEN'
    severity: critical
    channels: [pagerduty, slack]
    message: "Circuit breaker OPEN for {service}. Check service health."

  - name: high-error-rate
    condition: error_rate > 0.05
    severity: warning
    channels: [slack]
    message: "Error rate above 5% for {service}: {error_rate}%"

  - name: rate-limit-approaching
    condition: rate.tokens_consumed > 0.9 * rate.max_tokens
    severity: warning
    channels: [slack]
    message: "Rate limit at 90% capacity for {service}"

  - name: auth-failure
    condition: error.type in ['401', '403']
    severity: critical
    channels: [pagerduty, slack]
    message: "Authentication failure for {service}. Check credentials."

  - name: health-degraded
    condition: health.status == 'degraded'
    duration: 5m
    severity: warning
    channels: [slack]
    message: "{service} health degraded for 5+ minutes"
```

### Integration Points

| Monitoring Tool | Integration Method | Metrics Available |
|-----------------|-------------------|-------------------|
| Prometheus | `/metrics` endpoint | All numeric metrics |
| Datadog | DD agent integration | APM + custom metrics |
| New Relic | Custom instrumentation | Transaction traces |
| CloudWatch | AWS SDK metrics | Rate limits, errors |
| Azure Monitor | Application Insights | Full observability |

### Metric Export Example

```javascript
// Prometheus format export
app.get('/metrics', async (req, res) => {
  const jiraMetrics = jiraClient.getMetrics();
  const xrayMetrics = xrayClient.getMetrics();

  res.set('Content-Type', 'text/plain');
  res.send(`
# HELP circuit_breaker_state Current circuit breaker state (0=closed, 1=open, 2=half-open)
# TYPE circuit_breaker_state gauge
circuit_breaker_state{service="jira"} ${stateToNumber(jiraMetrics.circuitBreaker.state)}
circuit_breaker_state{service="xray"} ${stateToNumber(xrayMetrics.circuitBreaker.state)}

# HELP api_request_duration_seconds API request duration
# TYPE api_request_duration_seconds histogram
api_request_duration_seconds_bucket{service="jira",le="0.1"} ${jiraMetrics.latencyBuckets['100ms']}
api_request_duration_seconds_bucket{service="jira",le="0.5"} ${jiraMetrics.latencyBuckets['500ms']}
api_request_duration_seconds_bucket{service="jira",le="1.0"} ${jiraMetrics.latencyBuckets['1s']}

# HELP rate_limiter_tokens_available Current available rate limit tokens
# TYPE rate_limiter_tokens_available gauge
rate_limiter_tokens_available{service="jira"} ${jiraMetrics.rateLimiter.currentTokens}
  `);
});
```

---

## Review Cadence

| Review Type | Frequency | Participants | Output |
|-------------|-----------|--------------|--------|
| Daily health | Daily | Automated | Dashboard update |
| Weekly trends | Weekly | DevOps team | Trend report |
| Monthly SLA | Monthly | Engineering leads | SLA report |
| Quarterly review | Quarterly | Stakeholders | Strategy adjustment |

---

**Last Updated:** 2026-02-04
**Maintainer:** Enterprise QA DevOps Squad
