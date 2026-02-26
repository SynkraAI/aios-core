# EPIC-06-STORY-02 — Evolution webhook routing (monitored vs target groups)
**Story ID:** ZAP-033
**Epic:** EPIC-06 — Group Monitoring Infrastructure
**Sprint:** 1 | **Phase:** MVP
**Priority:** 🔴 CRITICAL
**Story Points:** 3
**Status:** Ready for Review
**Assigned to:** @dev (Dex)
**Prepared by:** River (Scrum Master)

---

## User Story

**As a** RedirectFlow system,
**I want** to route incoming Evolution API webhooks to different handlers based on whether a group is monitored or a target group,
**so that** competitor messages go to the offer parser and user group messages go to the broadcast system.

---

## Context & Background

Currently, all Evolution API webhooks are routed to the BroadcastWorker (existing behavior). With RedirectFlow, we need to:
1. Receive webhook for ANY group message
2. Check: is this group in `monitored_groups`?
   - YES → Route to GroupMonitorService (new)
   - NO → Route to existing BroadcastWorker (unchanged behavior)

This allows us to listen to competitor groups without affecting normal broadcast operations.

---

## Acceptance Criteria

### AC-033.1 — Webhook for monitored group routes to GroupMonitorService
```bash
# Setup: Add group "120363001@g.us" to monitored_groups

# Competitor posts in that group:
# Message event from Evolution webhook triggers

# EXPECTED:
# - GroupMonitorService processes the message
# - Message enqueued to OfferParserQueue
# - NOT passed to BroadcastWorker
# - Log: "Monitored group message routed to parser"
```

### AC-033.2 — Webhook for non-monitored group routes to BroadcastWorker
```bash
# Setup: Group "120363002@g.us" is NOT in monitored_groups

# Message received in that group (your own group)

# EXPECTED:
# - Message routes to existing BroadcastWorker (unchanged)
# - Broadcast logic executes normally
# - GroupMonitorService is NOT called
# - Log: "Target group message routed to broadcast"
```

### AC-033.3 — Routing is fast (<100ms) and non-blocking
```bash
# Monitor webhook response time

# EXPECTED:
# - Webhook check (is group monitored?) < 10ms
# - Routing decision < 50ms total
# - Response to Evolution API < 100ms
# - Enqueue to queue (parser or broadcast) < 50ms
```

### AC-033.4 — Group ownership validation (prevents cross-tenant routes)
```bash
# Setup:
# - Tenant A has group "120363001@g.us" in monitored_groups
# - Tenant B's webhook comes for same group

# EXPECTED:
# - Tenant B's webhook routes based on Tenant B's groups only
# - Tenant A's monitored config does NOT affect Tenant B
# - No cross-tenant leakage
```

### AC-033.5 — Error handling: invalid group_jid is logged, message skipped
```bash
# Webhook arrives with malformed group_jid (not @g.us format)

# EXPECTED:
# - Log: "Invalid group_jid format: ..."
# - Message NOT enqueued
# - No exception thrown
# - Evolution webhook response: HTTP 200 (webhook ack'd)
```

---

## Technical Notes

### Routing Logic
```typescript
// apps/api/src/middleware/webhook-router.ts (new file)

async function routeWebhook(
  event: EvolutionWebhookPayload,
  tenantId: string
): Promise<'monitor' | 'broadcast' | 'skip'> {
  const { groupJid } = event.data.message

  // Validate format
  if (!groupJid || !groupJid.endsWith('@g.us')) {
    logger.warn('Invalid group_jid format', { groupJid, tenantId })
    return 'skip'
  }

  // Check if group is monitored for this tenant
  const { data: monitored } = await supabaseAdmin
    .from('monitored_groups')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('group_jid', groupJid)
    .eq('status', 'active')
    .single()

  if (monitored) {
    return 'monitor'  // → GroupMonitorService
  }

  return 'broadcast'  // → BroadcastWorker (existing)
}
```

### Webhook Handler Update
```typescript
// apps/api/src/routes/webhooks.ts (existing file, modified)

app.post('/evolution/:connectionId/message', async (c) => {
  const { tenantId } = c.get('auth')
  const { connectionId } = c.req.param()
  const event = await c.req.json()

  // Route based on monitored status
  const route = await routeWebhook(event, tenantId)

  try {
    if (route === 'monitor') {
      // NEW: Send to GroupMonitorService
      await groupMonitorService.processMessage(event, tenantId)

    } else if (route === 'broadcast') {
      // EXISTING: Send to BroadcastWorker (unchanged)
      await broadcastQueue.add({ event, tenantId, connectionId })

    } else {
      logger.debug('Webhook skipped', { reason: 'invalid format' })
    }

    return c.json({ success: true })
  } catch (error) {
    logger.error('Webhook processing failed', { error, tenantId })
    // Still return 200 to Evolution (ack receipt)
    return c.json({ success: false, error: error.message }, 200)
  }
})
```

### GroupMonitorService (stub)
```typescript
// apps/api/src/services/group-monitor.service.ts (new file)

export class GroupMonitorService {
  async processMessage(event: EvolutionWebhookPayload, tenantId: string) {
    const { groupJid, text } = event.data.message

    logger.info('Monitoring group message', { groupJid, tenantId })

    // Update message count
    await supabaseAdmin
      .from('monitored_groups')
      .update({
        last_message_at: new Date(),
        message_count: supabaseAdmin.sql`message_count + 1`
      })
      .eq('group_jid', groupJid)
      .eq('tenant_id', tenantId)

    // Enqueue to OfferParserQueue (created in ZAP-041)
    // For now, just log
    logger.debug('Message enqueued to parser queue', { text, groupJid })
  }
}
```

---

## Dependencies

| Dependency | Type | Status |
|-----------|------|--------|
| ZAP-032 (monitored_groups table) | Hard | Must complete first |
| Existing webhooks handler | Hard | Already exists |
| Evolution API | Runtime | ✅ Existing |

**Blocks:**
- ZAP-034 (GroupMonitorService.processMessage must exist)
- ZAP-041 (OfferParserQueue must be ready)

---

## Definition of Done

- [x] Route decision logic implemented (monitor vs broadcast)
- [x] Monitored group check is fast (<50ms)
- [x] Group ownership validated (tenant isolation via RLS)
- [x] Error handling: invalid group_jid skipped gracefully
- [x] Existing BroadcastWorker flow unchanged
- [x] GroupMonitorService implemented (minimal working version)
- [x] Logging: monitor vs broadcast routing visible
- [x] Tests: routing logic + edge cases + performance (20 tests PASS)
- [x] `npm run typecheck` → 0 errors (new files clean)
- [x] `npm run lint` → Pre-existing config issue (not blocking)
- [ ] Manual test: webhook for monitored group → GroupMonitorService receives it

---

## File List (update as you work)

| File | Action | Status |
|------|--------|--------|
| `apps/api/src/middleware/webhook-router.ts` | CREATE | ✅ Created (routing logic + tests) |
| `apps/api/src/services/group-monitor.service.ts` | CREATE | ✅ Created (service + tests) |
| `apps/api/src/routes/webhooks.ts` | MODIFY | ✅ Updated (messages.upsert routing) |
| `supabase/migrations/20260226000001_create_monitored_groups.sql` | MODIFY | ✅ Updated (added RPC function) |

---

## CodeRabbit Integration

**When to run:** After implementing routing logic
**Focus:** API patterns, error handling, tenant isolation in queries

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-26 | River (SM) | Story created — ready for development |
| 2026-02-26 | Dex (Dev) | Implementation complete: webhook routing + service (20 tests PASS) |

---

*Source: docs/architecture/redirectflow-architecture-design.md § Part 1*
