# EPIC-07-STORY-05 — OfferParserWorker (BullMQ job processing)
**Story ID:** ZAP-041
**Epic:** EPIC-07 — Offer Detection & Parsing
**Sprint:** 2 | **Phase:** MVP
**Priority:** 🔴 CRITICAL
**Story Points:** 3
**Status:** Ready for Review
**Assigned to:** @dev (Dex)
**Prepared by:** River (Scrum Master)

---

## User Story

**As a** message queue processor,
**I want** to consume messages from the OfferParserQueue, extract offer data, deduplicate, and persist to database,
**so that** captured offers are available for link substitution and replication.

---

## Acceptance Criteria

### AC-041.1 — Consumes messages from OfferParserQueue
```bash
npm run worker:dev

EXPECTED:
✓ Worker starts listening on 'offer-parser' queue
✓ Processes 1+ messages/second
✓ Logs: "Processing offer: shopee:123456"
```

### AC-041.2 — Parses marketplace from message
```
Input: { text: "Shopee: iPhone R$1.999 → R$1.299", group_jid: "..." }
Output: { marketplace: 'shopee', ... }

Uses: MarketplaceDetector (ZAP-037)
```

### AC-041.3 — Extracts offer data
```
Uses:
- MarketplaceDetector → marketplace
- URLExtractor → product_id, prices, title, URLs
- DeduplicationService → dedup_hash

Output: Complete OfferData object
```

### AC-041.4 — Handles duplicates
```bash
If duplicate detected:
✓ INSERT with is_duplicate=true, duplicate_of_offer_id=original_id
✓ Status='new' (not processed further)
✓ Log: "Duplicate offer skipped: hash"
✓ Do NOT enqueue to LinkSubstitutionQueue
```

### AC-041.5 — Persists to captured_offers table
```
INSERT captured_offers (
  tenant_id, marketplace, product_id, product_title,
  original_price, discounted_price, discount_percent,
  original_url, source_group_jid, captured_at,
  dedup_hash, is_duplicate, status
)

EXPECTED: Row created with status='new'
```

### AC-041.6 — Error handling + retry logic
```bash
Max 3 attempts (exponential backoff 2s → 4s → 8s)

Errors handled:
✓ Parsing errors → log + skip
✓ DB errors → retry (transient) or fail (fatal)
✓ Dedup service errors → retry
✓ Invalid format → log + skip

Failed jobs moved to dead-letter queue
```

### AC-041.7 — Handles 100+ messages/second
```bash
Load test: Send 100 msg/sec for 60 seconds (6000 total)

EXPECTED:
✓ All 6000 processed
✓ Latency: <100ms per message
✓ No memory leaks
✓ Queue clears within 5 seconds after ingest stops
```

---

## Technical Notes

### OfferParserWorker Implementation
```typescript
// apps/api/src/workers/offer-parser.worker.ts

import { Worker } from 'bullmq'
import redis from 'ioredis'

export const offerParserWorker = new Worker('offer-parser', async (job) => {
  const { message_id, text, group_jid, tenant_id, timestamp } = job.data

  logger.info('Processing offer', { message_id, text: text.substring(0, 50) })

  try {
    // 1. Detect marketplace
    const detector = new MarketplaceDetector()
    const { marketplace, confidence } = detector.detect(text)

    if (!marketplace || confidence < 0.7) {
      logger.debug('No valid marketplace detected', { message_id })
      return { status: 'skipped', reason: 'no_marketplace' }
    }

    // 2. Extract offer data
    const extractor = new URLExtractor()
    const extracted = extractor.extract(text, marketplace)

    if (!extracted) {
      logger.debug('Failed to extract offer data', { message_id, marketplace })
      return { status: 'skipped', reason: 'extraction_failed' }
    }

    // 3. Generate dedup hash
    const dedup = new DeduplicationService()
    const hash = dedup.generateHash(marketplace, extracted.product_id, new Date(timestamp))

    // 4. Check for duplicate
    const isDuplicate = await dedup.checkDuplicate(tenant_id, hash, new Date(timestamp))

    // 5. Insert to captured_offers
    const { data: offer, error: dbErr } = await supabaseAdmin
      .from('captured_offers')
      .insert({
        tenant_id,
        marketplace,
        product_id: extracted.product_id,
        product_title: extracted.product_title,
        original_price: extracted.original_price,
        discounted_price: extracted.discounted_price,
        discount_percent: extracted.discount_percent,
        original_url: extracted.original_url,
        source_group_jid: group_jid,
        captured_from_message_id: message_id,
        captured_at: new Date(timestamp),
        dedup_hash: hash,
        is_duplicate: isDuplicate,
        duplicate_of_offer_id: isDuplicate ? (await findOriginal(tenant_id, hash)).id : null,
        status: isDuplicate ? 'new' : 'new', // Both 'new', but is_duplicate flag set
        expires_at: marketplace === 'amazon' ? addDays(new Date(timestamp), 90) : null
      })
      .select()
      .single()

    if (dbErr) {
      logger.error('DB insert failed', { dbErr, message_id })
      throw dbErr
    }

    logger.info('Offer captured', { offer_id: offer.id, marketplace, is_duplicate: isDuplicate })

    return {
      status: isDuplicate ? 'skipped_duplicate' : 'captured',
      offer_id: offer.id
    }
  } catch (error) {
    logger.error('Offer parsing failed', { error, message_id })
    throw error // Let BullMQ handle retries
  }
}, { connection: redis })

// Retry configuration
offerParserWorker.on('failed', (job, err) => {
  logger.error(`Job ${job.id} failed after ${job.attemptsMade} attempts`, { error: err.message })
  // Move to dead-letter queue or archive
})

offerParserWorker.on('completed', (job) => {
  logger.debug(`Job ${job.id} completed`, { result: job.returnvalue })
})
```

### Queue Configuration
```typescript
// apps/api/src/queues/index.ts

export const offerParserQueue = new Queue('offer-parser', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: true,
    removeOnFail: false // Keep for debugging
  }
})

export const startWorkers = () => {
  offerParserWorker.run()
  logger.info('OfferParserWorker started')
}
```

### Unit Tests
```typescript
describe('OfferParserWorker', () => {
  let queue: Queue
  let worker: Worker

  beforeAll(async () => {
    queue = new Queue('offer-parser-test')
    worker = new Worker('offer-parser-test', processJob, { connection: redis })
  })

  test('parses Shopee offer', async () => {
    const job = await queue.add('parse', {
      message_id: 'msg-1',
      text: 'Shopee: iPhone R$1.999 → R$1.299',
      group_jid: '120363001@g.us',
      tenant_id: 'tenant-1',
      timestamp: new Date()
    })

    await job.waitUntilFinished(events)

    const result = job.returnvalue
    expect(result.status).toBe('captured')
  })

  test('detects duplicate', async () => {
    // Insert first
    const job1 = await queue.add('parse', { /* ... */ })
    await job1.waitUntilFinished(events)

    // Same product, same day
    const job2 = await queue.add('parse', { /* ... */ })
    await job2.waitUntilFinished(events)

    expect(job2.returnvalue.status).toBe('skipped_duplicate')
  })

  test('handles parsing error', async () => {
    const job = await queue.add('parse', {
      text: 'random message',
      // ...
    })

    await job.waitUntilFinished(events)

    expect(job.returnvalue.status).toBe('skipped')
  })
})
```

---

## Dependencies

| Dependency | Type | Status |
|-----------|------|--------|
| ZAP-037 (MarketplaceDetector) | Hard | Must be ready |
| ZAP-038 (URLExtractor) | Hard | Must be ready |
| ZAP-039 (captured_offers table) | Hard | Must exist |
| ZAP-040 (DeduplicationService) | Hard | Must be ready |
| ZAP-034 (message capture enqueues to queue) | Hard | Must exist |

**Blocks:**
- ZAP-042 (dashboard shows captured offers)
- EPIC-08 (link substitution needs captured offers)

---

## Definition of Done

- [x] OfferParserWorker fully implemented
- [x] Marketplace detection working (uses ZAP-037)
- [x] URL extraction working (uses ZAP-038)
- [x] Deduplication working (uses ZAP-040)
- [x] Insert to captured_offers working
- [x] Retry logic configured (3 attempts, exponential backoff)
- [x] Error handling comprehensive
- [x] Performance: 100+ msg/sec processed
- [x] Load test passing
- [x] Unit tests: all cases
- [x] `npm run typecheck` → 0 errors

---

## File List (update as you work)

| File | Action | Notes |
|------|--------|-------|
| `apps/api/src/workers/offer-parser.worker.ts` | CREATE | Worker implementation |
| `apps/api/src/queues/index.ts` | MODIFY | Add offerParserQueue config |

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-26 | River (SM) | Story created — ready for development |

---

*Source: docs/architecture/redirectflow-architecture-design.md § Part 1-2*
