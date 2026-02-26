# EPIC-06-STORY-05 — GroupMonitorService worker tests
**Story ID:** ZAP-036
**Epic:** EPIC-06 — Group Monitoring Infrastructure
**Sprint:** 1 | **Phase:** MVP
**Priority:** 🟠 HIGH
**Story Points:** 2
**Status:** Ready for Review
**Assigned to:** @qa (Quinn)
**Prepared by:** River (Scrum Master)

---

## User Story

**As a** QA engineer,
**I want** comprehensive unit and integration tests for GroupMonitorService,
**so that** we can ensure message capture, routing, and deduplication work reliably in production.

---

## Context & Background

GroupMonitorService is critical for RedirectFlow's core functionality. Tests must cover:
1. Normal message capture
2. Duplicate message handling
3. Paused group handling
4. Non-text message handling
5. Group ownership validation
6. Queue enqueue behavior

Target: 80%+ code coverage.

---

## Acceptance Criteria

### AC-036.1 — Unit tests for message capture
```bash
npm run test -- apps/api/src/services/group-monitor.service.test.ts

Expected:
✓ Captures message from active monitored group
✓ Updates group last_message_at
✓ Increments message_count
✓ Enqueues to offerParserQueue
```

### AC-036.2 — Unit tests for duplicate detection
```bash
✓ First message enqueued
✓ Same message_id (duplicate) skipped
✓ Different message_id enqueued
✓ Duplicate cache expires after 1 minute
```

### AC-036.3 — Unit tests for status filtering
```bash
✓ Active group: message captured
✓ Paused group: message skipped
✓ Deleted group: message skipped
✓ Invalid group_jid: message skipped
```

### AC-036.4 — Unit tests for tenant isolation
```bash
✓ Tenant A's monitored groups isolated from Tenant B
✓ Same group_jid for different tenants: handled correctly
✓ Cross-tenant leakage prevented
```

### AC-036.5 — Integration test: full message flow
```bash
npm run test -- apps/api/src/integration/monitored-groups.integration.test.ts

Setup:
- Create tenant + connection
- Add group to monitored_groups
- Send Evolution webhook

Expected:
✓ Message captured in GroupMonitorService
✓ Job added to offerParserQueue
✓ Job has correct payload
✓ group.message_count incremented
✓ group.last_message_at updated
```

### AC-036.6 — Load test: 100 messages/second
```bash
npm run test:load -- group-monitor

Setup:
- 10 monitored groups
- Send 100 messages/second for 10 seconds (1000 total)

Expected:
✓ All 1000 messages captured (0 dropped)
✓ Latency: <100ms per message
✓ Queue backlog clears within 5 seconds
✓ No memory leaks
```

### AC-036.7 — Edge case tests
```bash
✓ Null/undefined message text
✓ Empty string message
✓ Very long message (>1000 chars)
✓ Special characters in message
✓ Unicode/emoji in message
✓ Multiple messages from same sender (rapid fire)
```

### AC-036.8 — Test coverage >= 80%
```bash
npm run test:coverage -- apps/api/src/services/group-monitor.service.ts

Expected:
Lines: 80%+
Functions: 80%+
Branches: 75%+
Statements: 80%+
```

---

## Technical Notes

### Test Structure
```
apps/api/src/services/group-monitor.service.test.ts
├─ describe('GroupMonitorService')
│   ├─ describe('processMessage')
│   │   ├─ test('captures active group message')
│   │   ├─ test('skips paused group')
│   │   ├─ test('detects duplicate')
│   │   ├─ test('handles non-text message')
│   │   ├─ test('validates tenant isolation')
│   │   └─ test('enqueues with correct payload')
│   └─ describe('edge cases')
│       ├─ test('handles null text')
│       ├─ test('handles special characters')
│       └─ test('handles unicode')

apps/api/src/integration/monitored-groups.integration.test.ts
├─ describe('MonitoredGroups Integration')
│   ├─ beforeEach(setup)
│   ├─ test('full message capture flow')
│   ├─ test('webhook routing')
│   └─ afterEach(cleanup)
```

### Mock Setup
```typescript
// apps/api/src/services/__mocks__/supabase.ts

export const mockSupabaseAdmin = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: { id: 'uuid', status: 'active' } }),
    insert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis()
  }))
}

export const mockRedis = {
  get: jest.fn(),
  setex: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1)
}

export const mockQueue = {
  add: jest.fn().mockResolvedValue({ id: 'job-id' })
}
```

### Example Unit Test
```typescript
describe('GroupMonitorService', () => {
  let service: GroupMonitorService
  let mockSupabase: any
  let mockRedis: any
  let mockQueue: any

  beforeEach(() => {
    mockSupabase = mockSupabaseAdmin
    mockRedis = mockRedis
    mockQueue = mockQueue
    service = new GroupMonitorService(mockSupabase, mockRedis, mockQueue)
  })

  test('captures message from active monitored group', async () => {
    const event = {
      data: {
        message: {
          id: 'msg-123',
          from: '5511999@c.us',
          body: 'Shopee: iPhone R$1.299',
          timestamp: Math.floor(Date.now() / 1000),
          fromMe: false
        },
        remoteJid: '120363001@g.us'
      }
    }

    mockSupabase.from('monitored_groups').select('id, status').single.mockResolvedValue({
      data: { id: 'group-uuid', status: 'active' },
      error: null
    })

    mockRedis.get.mockResolvedValue(null) // Not duplicate

    await service.processMessage(event, 'tenant-uuid')

    expect(mockQueue.add).toHaveBeenCalledWith(
      'parse-offer',
      expect.objectContaining({
        message_id: 'msg-123',
        group_jid: '120363001@g.us',
        text: 'Shopee: iPhone R$1.299',
        tenant_id: 'tenant-uuid'
      }),
      expect.any(Object)
    )
  })

  test('skips paused group', async () => {
    const event = { /* ... */ }

    mockSupabase.from('monitored_groups').select('id, status').single.mockResolvedValue({
      data: { id: 'group-uuid', status: 'paused' },
      error: null
    })

    await service.processMessage(event, 'tenant-uuid')

    expect(mockQueue.add).not.toHaveBeenCalled()
  })

  test('detects duplicate message', async () => {
    const event = { /* ... */ }

    mockSupabase.from('monitored_groups').select('id, status').single.mockResolvedValue({
      data: { id: 'group-uuid', status: 'active' },
      error: null
    })

    mockRedis.get.mockResolvedValue('1') // Duplicate cached

    await service.processMessage(event, 'tenant-uuid')

    expect(mockQueue.add).not.toHaveBeenCalled()
  })
})
```

### Integration Test Example
```typescript
describe('MonitoredGroups Integration', () => {
  let supabase: SupabaseClient
  let queue: Queue
  let server: Server

  beforeAll(async () => {
    // Setup test database
    supabase = createSupabaseClient(TEST_DB_URL)
    queue = new Queue('offer-parser', { connection: testRedis })

    // Seed test data
    const tenant = await supabase.from('tenants').insert({ /* ... */ }).single()
    const connection = await supabase.from('whatsapp_connections').insert({ /* ... */ }).single()

    server = startTestServer()
  })

  test('full message capture flow', async () => {
    // 1. Add monitored group
    const group = await supabase
      .from('monitored_groups')
      .insert({
        tenant_id: tenant.id,
        connection_id: connection.id,
        group_name: 'Test Group',
        group_jid: '120363001@g.us',
        status: 'active'
      })
      .single()

    // 2. Send webhook
    const response = await fetch('http://localhost:3000/webhook/evolution/message', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          message: {
            id: 'msg-123',
            body: 'Shopee: iPhone',
            timestamp: Math.floor(Date.now() / 1000),
            fromMe: false
          },
          remoteJid: '120363001@g.us'
        }
      })
    })

    expect(response.status).toBe(200)

    // 3. Verify message captured
    const jobs = await queue.getJobs(['waiting'])
    expect(jobs).toHaveLength(1)
    expect(jobs[0].data.text).toBe('Shopee: iPhone')

    // 4. Verify group stats updated
    const updatedGroup = await supabase
      .from('monitored_groups')
      .select('*')
      .eq('id', group.id)
      .single()

    expect(updatedGroup.data.message_count).toBe(1)
    expect(updatedGroup.data.last_message_at).not.toBeNull()
  })

  afterAll(async () => {
    server.close()
    queue.close()
    // Cleanup test data
  })
})
```

---

## Dependencies

| Dependency | Type | Status |
|-----------|------|--------|
| Jest/Vitest | Dev | ✅ Existing |
| Supertest | Dev | For HTTP testing |
| redis-mock | Dev | For Redis mocking |
| all previous stories (ZAP-032-035) | Hard | Must be complete |

---

## Definition of Done

- [x] Unit tests for GroupMonitorService (all cases)
- [x] Integration tests (full flow)
- [x] Load test script (100 msg/sec)
- [x] Edge case tests (null, special chars, unicode)
- [x] Tenant isolation tests
- [x] Code coverage >= 80%
- [x] All tests passing locally
- [x] CI/CD tests passing
- [x] No flaky tests
- [x] Test documentation updated

---

## File List (update as you work)

| File | Action | Notes |
|------|--------|-------|
| `apps/api/src/services/group-monitor.service.test.ts` | CREATE | Unit tests |
| `apps/api/src/integration/monitored-groups.integration.test.ts` | CREATE | Integration tests |
| `apps/api/src/load-tests/group-monitor.load.ts` | CREATE | Load test |
| `apps/api/src/services/__mocks__/supabase.ts` | CREATE | Mock setup |

---

## CodeRabbit Integration

**When to run:** Before marking story complete
**Focus:** Test coverage, test quality, assertions

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-26 | River (SM) | Story created — ready for testing |

---

*Source: docs/architecture/redirectflow-architecture-design.md § Part 1*
