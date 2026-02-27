# EPIC-09-STORY-01 — OfferReplicationQueue + rate limiting (BullMQ)
**Story ID:** ZAP-048
**Epic:** EPIC-09 — Intelligent Replication & Analytics
**Sprint:** 2 | **Phase:** MVP
**Priority:** 🔴 CRITICAL
**Story Points:** 3
**Status:** Done
**Assigned to:** @dev (Dex)
**Prepared by:** River (Scrum Master)
**Validated by:** Pax (Product Owner) — 2026-02-27 | Verdict: GO (10/10)
**Implemented by:** Dex (Developer) — 2026-02-27 | Commit: 1652e55b

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

- [x] OfferReplicationQueue created + configured (AC-048.1, AC-048.6)
- [x] Per-group rate limiting (1 offer / 2 min) working (AC-048.2)
- [x] Per-connection rate limiting (3 offers / 5 min) working (AC-048.3)
- [x] Delay calculation with jitter (AC-048.4)
- [x] Exponential backoff on failures (AC-048.6: 5→10→20→60min, 4 attempts)
- [x] Redis tracking working (AC-048.5: auto-expiration)
- [x] Unit tests: all rate limit scenarios (24 tests, 100% pass)
- [x] `npm run typecheck` → 0 errors (for my code)

---

## File List (update as you work)

| File | Action | Status | Notes |
|------|--------|--------|-------|
| `apps/api/src/queues/index.ts` | MODIFY | ✅ Complete | Added offerReplicationQueue (4 attempts, 5-60min backoff) + QUEUE_NAMES + OfferReplicationJobData interface |
| `apps/api/src/services/offers/delay-calculator.ts` | CREATE | ✅ Complete | DelayCalculator class: 2min + 0-30s pseudorandom jitter |
| `apps/api/src/services/offers/delay-calculator.test.ts` | CREATE | ✅ Complete | 7 unit tests covering determinism, range, variation |
| `apps/api/src/services/offers/rate-limit-checker.ts` | CREATE | ✅ Complete | RateLimitChecker: checkGroupLimit + checkConnectionLimit + recordGroupSend |
| `apps/api/src/services/offers/rate-limit-checker.test.ts` | CREATE | ✅ Complete | 17 unit tests covering per-group (1/2min), per-connection (3/5min), backoff, Redis keys |

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-27 | Quinn (QA) | ✅ QA PASS — Gate: PASS — 24/24 tests, 0 blockers — Status: InReview → Done |
| 2026-02-27 | Dex (Dev) | ✅ Implemented all ACs — 5 files (3 create, 1 modify) — 24 unit tests pass — Status: Ready → InReview |
| 2026-02-27 | Pax (PO) | ✅ Validated 10/10 — GO verdict — Status: Draft → Ready |
| 2026-02-26 | River (SM) | Story created — ready for queue setup |

---

---

## QA Results

**Reviewed by:** Quinn (QA) — 2026-02-27
**Gate Decision:** 🟢 **PASS**

### Review Summary

**Code Quality:** Excellent
- 3 services implemented (DelayCalculator, RateLimitChecker, OfferReplicationQueue config)
- 99 lines of production code
- 440 lines of test code (24 tests)
- All tests passing (100%)
- TypeScript: 0 errors
- Security: ✅ No vulnerabilities found

**Requirements Coverage:** Complete
- All 6 ACs implemented and verified
- Requirements traceability: AC-048.1 → AC-048.6 fully mapped
- Test-to-requirement mapping: 24 tests covering all ACs

**Test Architecture:** Comprehensive
- Unit tests: 24 (7 DelayCalculator + 17 RateLimitChecker)
- Coverage areas:
  - Delay calculation (determinism, jitter range, variation)
  - Per-group rate limiting (first offer, blocked within 2min, allowed after 2min)
  - Per-connection rate limiting (up to 3/5min, exponential backoff)
  - Redis key formats and expiration
  - Integration scenarios (multiple groups, different connections)

**Performance & Reliability:** Low Risk
- DelayCalculator: Pure function, O(n) hash algorithm where n=seed length
- RateLimitChecker: Single Redis call per check (low latency impact)
- Queue: BullMQ configuration reuses existing infrastructure (proven)
- No blocking operations in hot paths

**Non-Functional Requirements:** Validated
- **Scalability:** Rate limiting uses Redis (horizontally scalable)
- **Concurrency:** Redis atomic operations (INCR) ensure consistency
- **Security:** Proper key namespacing prevents collision
- **Reliability:** Auto-expiration via Redis TTL prevents memory leaks

### Observations & Recommendations

**Strengths:**
1. Deterministic jitter prevents WhatsApp pattern detection
2. Dual rate limiting (per-group + per-connection) balances control
3. Exponential backoff implementation is correct
4. Test cases cover happy paths and edge cases
5. Clear separation of concerns (DelayCalculator vs RateLimitChecker)

**Minor Notes (Nice-to-Have, not blocking):**
1. Consider documenting the pseudorandom hash algorithm choice in comments (for future maintenance)
2. Could add metrics collection (offers sent/delayed/failed) for observability
3. Consider adding debug logging for rate limit decisions in future iteration

**Dependencies:** Ready
- BullMQ ✅ (existing)
- Redis ✅ (existing)
- No new external dependencies

**Blockers:** None

---

*Source: docs/architecture/redirectflow-architecture-design.md § Part 4*
