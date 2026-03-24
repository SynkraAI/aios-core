# Monitoring Operations Guide

## Brand System Service — BSS-1.7

### Sentry Error Tracking

BSS uses [Sentry](https://sentry.io) free tier (5K errors/month) for error tracking.

**Configuration:**
```bash
SENTRY_DSN=https://xxx@oyyy.ingest.sentry.io/zzz
SENTRY_ENVIRONMENT=production  # development | staging | production
BSS_SENTRY_ENABLED=true        # Set false to disable
```

**Dashboard:** Access via [sentry.io dashboard](https://sentry.io) → select BSS project.

**Captured automatically:**
- `StorageError` from R2 operations
- `BuildError` from pipeline failures
- Unhandled promise rejections
- AI API call failures

---

### AI API Cost Tracking

Costs are logged per API call in `output/logs/ai-api-calls.jsonl` (JSON Lines format).

**Each entry contains:** timestamp, clientId, provider, model, tokens, cost (USD), latency.

**Supported providers:** Claude, OpenAI, Replicate, ElevenLabs.

**View costs for a client:**
```bash
# Check monthly cost via the summarizeAiCosts() function
# or parse the JSONL manually:
cat output/logs/ai-api-calls.jsonl | jq 'select(.clientId == "acme")'
```

**Log rotation:** Automatic at 10MB → `ai-api-calls-YYYY-MM.jsonl`.

---

### Health Check

```bash
pnpm health
```

Tests R2 connectivity (5s timeout) and Sentry ping. Output:
```json
{ "r2": "ok", "sentry": "ok", "timestamp": "2026-03-16T12:00:00Z" }
```

Exit code: `0` = healthy, `1` = unhealthy.

---

### Error Rate Monitoring

`checkErrorRate()` scans `output/logs/` for ERROR-level entries within a configurable time window (default: 24h).

Returns: error count, rate (errors/hour), and top 5 most frequent error messages.

---

### Alert Escalation (MVP)

1. Monitor Sentry dashboard for spikes
2. Run `pnpm health` on schedule (cron)
3. Create ClickUp task manually for unresolved issues
4. Post-MVP: webhook-based alerts via BSS-6.x integration
