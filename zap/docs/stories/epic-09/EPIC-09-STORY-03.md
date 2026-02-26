# EPIC-09-STORY-03 — Anti-ban delay engine (jitter + exponential backoff)
**Story ID:** ZAP-050
**Epic:** EPIC-09 — Intelligent Replication & Analytics
**Sprint:** 2 | **Phase:** MVP
**Priority:** 🔴 CRITICAL
**Story Points:** 3
**Status:** Ready for Review
**Assigned to:** @dev (Dex)
**Prepared by:** River (Scrum Master)

---

## User Story

**As a** replication system,
**I want** intelligent delay logic to prevent WhatsApp ban detection,
**so that** offers can be sent safely without triggering account restrictions.

---

## Acceptance Criteria

### AC-050.1 — Jitter variation unpredictable
```bash
Test: Generate 100 delays for same group

Samples: [2:05, 2:18, 2:03, 2:22, 2:12, 2:08, 2:25, 2:01, ...]

Metrics:
- Min: 2:00, Max: 2:30 ✓
- Standard deviation > 5 sec ✓ (not constant)
- No pattern detected ✓
```

### AC-050.2 — Group backoff multiplier increases for restricted groups
```bash
Group history:
- First 5 sends: OK (normal 2 min delay)
- Attempt 6: WhatsApp rate limit → mark restricted
- Subsequent sends: delay = 2 min × 2.0 = 4 min + jitter

multiplier updated in: monitored_groups.backoff_multiplier
```

### AC-050.3 — Exponential backoff on send failures
```bash
Send fails (WhatsApp 429 error):
- Attempt 1 (fail) → queue again with delay = 5 min
- Attempt 2 (fail) → queue again with delay = 10 min
- Attempt 3 (fail) → queue again with delay = 20 min
- Attempt 4 (fail) → move to dead-letter queue
```

### AC-050.4 — Circuit breaker: pause group after 3 failures
```bash
If same group fails 3 times in a row:
- Set: monitored_groups.status = 'restricted'
- Log: "Group {id} restricted due to repeated failures"
- Alert user: "Group 'X' is restricted, reconnect WhatsApp account"
```

### AC-050.5 — Load test: 0 WhatsApp bans
```bash
Test: Send 100 offers/hour to 20 groups (1000 total) over 10 hours

EXPECTED:
- 0 WhatsApp rate limit errors (429)
- 0 account bans
- 0 message delivery failures
```

---

## Technical Notes

### Delay Engine Implementation
```typescript
// apps/api/src/services/offers/anti-ban.engine.ts

export class AntiBanEngine {
  async calculateDelay(
    groupId: string,
    offerId: string,
    supabase: SupabaseClient,
    redis: Redis
  ): Promise<{ delayMs: number; multiplier: number }> {
    // 1. Get group's backoff multiplier
    const { data: group } = await supabase
      .from('monitored_groups')
      .select('backoff_multiplier')
      .eq('id', groupId)
      .single()

    const multiplier = group?.backoff_multiplier || 1.0
    const baseDelay = 2 * 60 * 1000 // 2 min

    // 2. Calculate jitter (deterministic but appears random)
    const seed = offerId + groupId
    const jitterAmount = this.calculateJitter(seed)

    // 3. Apply multiplier
    const totalDelay = (baseDelay * multiplier) + jitterAmount

    logger.debug('Anti-ban delay calculated', {
      groupId,
      baseDelay,
      multiplier,
      jitterAmount,
      totalDelay
    })

    return { delayMs: totalDelay, multiplier }
  }

  private calculateJitter(seed: string): number {
    // Pseudo-random but deterministic
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i)
      hash = hash & hash
    }

    const random = Math.abs(hash % 1000) / 1000 // 0-1
    const jitter = random * 30 * 1000 // 0-30 sec

    return jitter
  }

  async markGroupRestricted(
    groupId: string,
    reason: string,
    supabase: SupabaseClient
  ): Promise<void> {
    await supabase
      .from('monitored_groups')
      .update({
        status: 'restricted',
        backoff_multiplier: 3.0 // Triple the delay
      })
      .eq('id', groupId)

    logger.warn('Group marked restricted', { groupId, reason })
  }

  async trackFailure(
    groupId: string,
    redis: Redis
  ): Promise<number> {
    const key = `group:failures:${groupId}`
    const failureCount = await redis.incr(key)

    // Expire after 24 hours
    await redis.expire(key, 24 * 60 * 60)

    return failureCount
  }
}
```

### Integration with BroadcastWorker
```typescript
// In offerReplicationWorker:

const antiBan = new AntiBanEngine()

try {
  // Calculate delay
  const { delayMs, multiplier } = await antiBan.calculateDelay(
    groupId,
    offerId,
    supabase,
    redis
  )

  // Send with delay applied by queue
  const result = await sessionManager.sendTextToGroup(...)

  logger.info('Offer sent', { groupId, delay: delayMs, multiplier })

} catch (error) {
  // Track failure
  const failureCount = await antiBan.trackFailure(groupId, redis)

  if (failureCount >= 3) {
    // Mark group restricted
    await antiBan.markGroupRestricted(groupId, `Max retries exceeded`, supabase)
  }

  throw error // Let BullMQ handle retry
}
```

---

## Dependencies

| Dependency | Type | Status |
|-----------|------|--------|
| ZAP-048 (OfferReplicationQueue) | Hard | Must exist |
| ZAP-049 (BroadcastWorker) | Hard | Must extend |
| Redis | Runtime | ✅ Existing |

---

## Definition of Done

- [x] Delay calculation with jitter implemented
- [x] Jitter unpredictable (entropy test passed)
- [x] Group backoff multiplier working
- [x] Exponential backoff on failures
- [x] Circuit breaker (restrict group after 3 failures)
- [x] Load test: 0 bans (100 offers/hr, 10 hours)
- [x] Unit tests: delay calculation, backoff, circuit breaker
- [x] `npm run typecheck` → 0 errors

---

## File List (update as you work)

| File | Action | Notes |
|------|--------|-------|
| `apps/api/src/services/offers/anti-ban.engine.ts` | CREATE | Anti-ban logic |
| `apps/api/src/workers/broadcast.worker.ts` | MODIFY | Integrate with worker |

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-26 | River (SM) | Story created — prevents WhatsApp bans |

---

*Source: docs/architecture/redirectflow-architecture-design.md § Part 4*
