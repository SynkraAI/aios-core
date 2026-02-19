# EPIC-01 — Foundation & Infrastructure
**Platform:** Zap — WhatsApp Automation SaaS
**Phase:** MVP | **Sprint:** 0 (Weeks 1–2)
**Status:** Ready for Development
**Owner:** @dev (Dex)
**Prepared by:** River (Scrum Master)
**Last updated:** 2026-02-18

---

## Epic Objective

Establish the complete technical foundation for the Zap platform before any business feature development begins.

This epic delivers a fully operational local development environment, the complete database schema with multi-tenant security, the API server skeleton, the async job queue infrastructure, and all shared packages that every other epic depends on.

> **Nothing else can be built until EPIC-01 is done.**

---

## Stories in This Epic

| Story File | ID | Title | Priority | Points | Status |
|-----------|-----|-------|---------|--------|--------|
| [EPIC-01-STORY-01.md](./EPIC-01-STORY-01.md) | ZAP-001 | Monorepo & Shared Packages Setup | 🔴 CRITICAL | 3 | Ready |
| [EPIC-01-STORY-02.md](./EPIC-01-STORY-02.md) | ZAP-002 | Database Schema & Migrations | 🔴 CRITICAL | 5 | Ready |
| [EPIC-01-STORY-03.md](./EPIC-01-STORY-03.md) | ZAP-003 | Hono API Bootstrap | 🔴 CRITICAL | 3 | Ready |
| [EPIC-01-STORY-04.md](./EPIC-01-STORY-04.md) | ZAP-004 | BullMQ Queue Infrastructure | 🔴 CRITICAL | 3 | Ready |
| [EPIC-01-STORY-05.md](./EPIC-01-STORY-05.md) | ZAP-005 | Docker Compose Local Environment | 🟠 HIGH | 2 | Ready |

**Total Story Points:** 16

---

## Implementation Order

Stories MUST be implemented in this sequence due to hard dependencies:

```
STORY-01 (Monorepo)
    └── STORY-02 (Database)    ← needs packages/types
    └── STORY-03 (API)         ← needs packages/types + packages/validators
    └── STORY-05 (Docker)      ← needs apps/api to exist

STORY-03 (API)
    └── STORY-04 (Workers)     ← needs queue config from API lib
```

**Parallel execution allowed:**
- STORY-02, STORY-03, and STORY-05 can be worked in parallel AFTER STORY-01 is merged
- STORY-04 can start in parallel with STORY-02 after STORY-03's `queues/index.ts` is done

**Safe execution sequence:**
```
Day 1:  STORY-01 (foundation) — must be first
Day 2:  STORY-02 + STORY-03 in parallel
Day 3:  STORY-04 (after STORY-03 queue config exists) + STORY-05 in parallel
```

---

## Architecture Context

### Monorepo Structure (Turborepo)
```
zap/
├── apps/
│   ├── api/          ← Hono.js backend (Node 20, ESM)
│   └── web/          ← Next.js 14 frontend
├── packages/
│   ├── types/        ← Shared TypeScript interfaces
│   ├── validators/   ← Shared Zod schemas
│   └── config/       ← Shared config (placeholder)
├── supabase/
│   ├── migrations/   ← PostgreSQL DDL migrations
│   └── seed.sql      ← Development seed data
├── package.json      ← Root workspace config
├── turbo.json        ← Turborepo pipeline
└── docker-compose.yml
```

### Key Technology Decisions (from ADRs)
- **Runtime:** Node.js 20 LTS, ESM modules throughout (`"type": "module"`)
- **API Framework:** Hono.js v4 (not Express) — edge-ready, TypeScript-first
- **Database:** Supabase (PostgreSQL 15 + Auth + Realtime + RLS)
- **Queuing:** BullMQ v5 + IORedis (not Bull v3)
- **Package Manager:** npm workspaces (not pnpm or yarn)
- **Type safety:** TypeScript strict mode everywhere, Zod for runtime validation

### Multi-tenancy Design
```
Every DB table has tenant_id column
RLS policy: id = auth_tenant_id()
auth_tenant_id() = (auth.jwt() ->> 'tenant_id')::UUID

Two Supabase clients:
- supabase (anon key) → respects RLS → used in user-facing routes
- supabaseAdmin (service_role) → bypasses RLS → used ONLY in workers/webhooks
```

---

## Dependencies

### External Services Required
| Service | Purpose | Local Alternative |
|---------|---------|------------------|
| Supabase project | PostgreSQL + Auth + Realtime | `supabase start` (local CLI) |
| Redis | BullMQ queue backend | `redis:7-alpine` via Docker |
| Evolution API v2 | WhatsApp session management | `atendai/chatwoot:v2` via Docker |

### Environment Variables Required
All in `.env.example`. Critical ones for this epic:
```bash
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
REDIS_URL=redis://localhost:6379
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=
PORT=3001
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| RLS policies block legitimate queries | MEDIUM | HIGH | Test with both anon + service_role clients; seed dev tenant |
| Evolution API Docker image version mismatch | LOW | MEDIUM | Pin to specific image tag in docker-compose.yml |
| Turborepo pipeline cache stale | LOW | LOW | `turbo run build --force` to bypass cache |
| TypeScript strict errors in shared packages | MEDIUM | MEDIUM | Run `npm run typecheck` after each package change |
| BullMQ v5 breaking API from v4 | LOW | HIGH | Reference bullmq.io docs for v5 API; Worker constructor changed |

---

## Definition of Done (Epic Level)

All stories in this epic are complete when:

- [ ] EPIC-01-STORY-01: `npm run dev` starts API + Web from monorepo root
- [ ] EPIC-01-STORY-02: `supabase db reset` applies all migrations clean; all 14 tables exist with RLS
- [ ] EPIC-01-STORY-03: `GET http://localhost:3001/health` returns `{ status: 'ok' }`; protected routes return 401
- [ ] EPIC-01-STORY-04: `npm run worker:dev` starts all 3 workers without errors; queues visible in Redis
- [ ] EPIC-01-STORY-05: `docker-compose up` starts all services; API reaches Evolution at `http://evolution:8080`
- [ ] `npm run typecheck` passes across all packages (0 errors)
- [ ] `npm run lint` passes across all packages (0 errors)
- [ ] All `.env.example` variables documented with descriptions
- [ ] No hardcoded secrets in any file

---

## Handoff to Next Epic

After EPIC-01 is complete, EPIC-02 (WhatsApp Connection Management) begins.

**Pre-conditions for EPIC-02:**
- Supabase project configured and `whatsapp_connections` table exists
- Evolution API running and reachable
- `authMiddleware` working (returns 401 without JWT)
- `sessionManager` service stub in place at `apps/api/src/services/whatsapp/session-manager.ts`

---

*Prepared by: River — Scrum Master*
*Source: docs/prd/zap-prd.md § 9.2, docs/stories/zap-user-stories.md § EPIC-01*
*Review: @po *validate-story-draft EPIC-01 before development starts*
