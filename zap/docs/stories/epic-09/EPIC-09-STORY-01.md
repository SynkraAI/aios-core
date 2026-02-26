# EPIC-09-STORY-01 — OfferReplicationQueue + rate limiting (BullMQ)
**Story ID:** ZAP-048
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
**I want** a queue that schedules offer sends with per-group rate limiting,
**so that** we don't overwhelm WhatsApp and trigger ban detection.

---

## Acceptance Criteria

### AC-048.1 — OfferReplicationQueue created
```bash
npm run worker:dev

EXPECTED:
✓ Worker starts listening on 'offer-replication' queue
✓ Consumes jobs with offer data
✓ Schedules sends to multiple groups
```

### AC-048.2 — Per-group rate limiting: 1 offer / 2 min
```bash
Group A receives offer at 10:00
Group A receives another offer at 10:01 → DELAYED to 10:02-10:02:30

Max concurrent sends per group: 1 per 2 minutes
```

### AC-048.3 — Per-connection rate limiting: 3 offers / 5 min
```bash
WhatsApp number sends 3 offers within 5 minutes → OK
4th offer within 5 min → DELAYED for 5 min (exponential backoff)
```

### AC-048.4 — Delay calculation with jitter
```bash
Base delay: 2 min per group
Jitter: random 0-30 seconds
Result: 2:00 to 2:30 per group

Prevents pattern detection
```

### AC-048.5 — Redis tracks rate limits
```bash
Key: "offer:sent:{groupId}"
Key: "offer:sent:{connectionId}:last5m"

Expires automatically (no manual cleanup)
```

### AC-048.6 — Failed sends use exponential backoff
```bash
Attempt 1 (fail) → retry in 5 min
Attempt 2 (fail) → retry in 10 min
Attempt 3 (fail) → retry in 20 min
Attempt 4+ (fail) → move to dead-letter queue
```

---

## Technical Notes

### OfferReplicationQueue Configuration
```typescript
// apps/api/src/queues/index.ts

export const offerReplicationQueue = new Queue('offer-replication', {
  connection: redis,
  defaultJobOptions: {
    attempts: 4,
    backoff: {
      type: 'exponential',
      delay: 5 * 60 * 1000 // Start at 5 min
    },
    removeOnComplete: true,
    removeOnFail: false
  }
})

// Worker will be implemented in ZAP-049
```

### Delay Calculator
```typescript
// apps/api/src/services/offers/delay-calculator.ts

export class DelayCalculator {
  calculateDelay(groupId: string, offerId: string): number {
    const baseDelay = 2 * 60 * 1000 // 2 min

    // Jitter: pseudo-random but deterministic per (offerId, groupId)
    const seed = offerId + groupId
    const jitter = this.pseudoRandom(seed) * 30 * 1000 // 0-30s

    return baseDelay + jitter
  }

  private pseudoRandom(seed: string): number {
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash % 1000) / 1000 // 0-1
  }
}
```

### Rate Limit Checker
```typescript
// apps/api/src/services/offers/rate-limit-checker.ts

export class RateLimitChecker {
  async checkGroupLimit(
    groupId: string,
    redis: Redis
  ): Promise<{ allowed: boolean; nextAvailableAt: Date }> {
    const key = `offer:sent:${groupId}`
    const lastSentAt = await redis.get(key)

    if (!lastSentAt) {
      // First offer to this group
      return { allowed: true, nextAvailableAt: new Date() }
    }

    const elapsed = Date.now() - parseInt(lastSentAt)
    const minInterval = 2 * 60 * 1000 // 2 min

    if (elapsed < minInterval) {
      const nextAt = new Date(parseInt(lastSentAt) + minInterval)
      return { allowed: false, nextAvailableAt: nextAt }
    }

    return { allowed: true, nextAvailableAt: new Date() }
  }

  async checkConnectionLimit(
    connectionId: string,
    redis: Redis
  ): Promise<{ allowed: boolean; backoffMinutes: number }> {
    const key = `offer:sent:${connectionId}:last5m`
    const count = await redis.incr(key)

    if (count === 1) {
      // First offer in window
      await redis.expire(key, 5 * 60) // 5 min window
    }

    const maxPerWindow = 3
    if (count > maxPerWindow) {
      // Back off: (count - maxPerWindow) * 5 min
      const backoffMinutes = (count - maxPerWindow) * 5
      return { allowed: false, backoffMinutes }
    }

    return { allowed: true, backoffMinutes: 0 }
  }
}
```

---

## Dependencies

| Dependency | Type | Status |
|-----------|------|--------|
| BullMQ | Runtime | ✅ Existing |
| Redis | Runtime | ✅ Existing |
| ZAP-039 (replicated_offers table) | Soft | For future |

**Blocks:**
- ZAP-049 (worker implementation)
- ZAP-050 (anti-ban engine)

---

## Definition of Done

- [x] OfferReplicationQueue created + configured
- [x] Per-group rate limiting (1 offer / 2 min) working
- [x] Per-connection rate limiting (3 offers / 5 min) working
- [x] Delay calculation with jitter
- [x] Exponential backoff on failures
- [x] Redis tracking working
- [x] Unit tests: all rate limit scenarios
- [x] `npm run typecheck` → 0 errors

---

## File List (update as you work)

| File | Action | Notes |
|------|--------|-------|
| `apps/api/src/queues/index.ts` | MODIFY | Add offerReplicationQueue |
| `apps/api/src/services/offers/delay-calculator.ts` | CREATE | Delay logic |
| `apps/api/src/services/offers/rate-limit-checker.ts` | CREATE | Rate limit logic |

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-26 | River (SM) | Story created — ready for queue setup |

---

*Source: docs/architecture/redirectflow-architecture-design.md § Part 4*
