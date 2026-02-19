# EPIC-01-STORY-01 — Monorepo & Shared Packages Setup
**Story ID:** ZAP-001
**Epic:** EPIC-01 — Foundation & Infrastructure
**Sprint:** 0 | **Phase:** MVP
**Priority:** 🔴 CRITICAL
**Story Points:** 3
**Status:** Ready
**Assigned to:** @dev (Dex)
**Prepared by:** River (Scrum Master)

---

## User Story

**As a** developer working on the Zap platform,
**I want** a Turborepo monorepo configured with shared `types` and `validators` packages,
**so that** all apps (API and Web) share TypeScript types and Zod schemas without duplication, and the build pipeline is orchestrated correctly.

---

## Context & Background

This is the first story to be implemented. Nothing else can start until this is done because:

- `apps/api` depends on `@zap/types` and `@zap/validators`
- `apps/web` depends on `@zap/types` and `@zap/validators`
- The Turborepo pipeline defines how all future `npm run dev/build/test/lint` commands behave

The scaffold files for this story were partially created during the architecture session. The developer must verify each file exists and is correct, fix any issues, and ensure the full pipeline runs clean.

---

## Acceptance Criteria

### AC-001.1 — Root monorepo starts both apps
```bash
# From repo root:
npm run dev
# EXPECTED: Both "apps/api" (port 3001) and "apps/web" (port 3000) start
# EXPECTED: No "module not found" errors on startup
```

### AC-001.2 — packages/types exports all shared interfaces
`packages/types/src/index.ts` must export ALL of the following interfaces:
- `Tenant`
- `TenantUser`
- `Plan`
- `WhatsAppConnection` (with `ConnectionStatus` enum: `connecting | connected | disconnected | banned`)
- `Project` (with `ProjectStatus` enum: `active | paused | archived`)
- `ProjectPhase`
- `Group` (with `GroupStatus` enum: `active | full | archived`)
- `GroupParticipant`
- `Lead`
- `LeadEvent` (with `LeadEventType` union)
- `DynamicLink`
- `LinkClick`
- `Broadcast` (with `BroadcastStatus` and `TargetType` enums)
- `BroadcastMessage` (with `ContentType` enum)
- `WebhookEvent` (with `WebhookSource` enum)
- `RealtimeEvent` (union of all realtime event payloads)

Verification:
```bash
cd packages/types && npx tsc --noEmit
# EXPECTED: 0 errors
```

### AC-001.3 — packages/validators exports all Zod schemas
`packages/validators/src/index.ts` must export:
- `createProjectSchema` + `CreateProjectInput` type
- `createGroupSchema` + `CreateGroupInput` type
- `createBroadcastSchema` + `CreateBroadcastInput` type
- `broadcastMessageSchema` + `BroadcastMessage` type
- `createLinkSchema` + `CreateLinkInput` type
- `hotmartWebhookSchema`
- `phoneE164` validator
- `phoneBrazil` validator
- `connectionSchema`, `projectSchema`, `groupSchema`, `linkSchema`

Verification:
```bash
cd packages/validators && npx tsc --noEmit
# EXPECTED: 0 errors
```

### AC-001.4 — TypeScript strict mode passes root-wide
```bash
npm run typecheck
# EXPECTED: Output from all workspaces, 0 errors total
# EXPECTED: Includes output from packages/types, packages/validators, apps/api, apps/web
```

### AC-001.5 — Lint passes root-wide
```bash
npm run lint
# EXPECTED: 0 errors, 0 warnings (or only acceptable warnings)
```

### AC-001.6 — Turborepo pipeline correct
`turbo.json` must define:
```json
{
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "dev": { "cache": false, "persistent": true },
    "test": { "dependsOn": ["^build"] },
    "lint": {},
    "typecheck": { "dependsOn": ["^build"] },
    "clean": { "cache": false }
  }
}
```
- `"^build"` means "build dependencies first" — ensures `packages/*` build before `apps/*`
- `"persistent": true` on dev means Turbo keeps dev processes alive

### AC-001.7 — No circular dependencies
```bash
npm ls --workspaces 2>&1 | grep -i "WARN.*extraneous\|cycle"
# EXPECTED: No output (no circular deps, no extraneous)
```

Package dependency rules:
- `packages/types` → NO dependencies on other `@zap/*` packages
- `packages/validators` → MAY depend on `packages/types` (for type imports only)
- `apps/api` → MAY depend on `packages/types` and `packages/validators`
- `apps/web` → MAY depend on `packages/types` and `packages/validators`

---

## Technical Notes

### Files to Verify / Create

| File | Status | Action |
|------|--------|--------|
| `package.json` (root) | Exists | Verify workspaces array includes `apps/*` and `packages/*` |
| `turbo.json` | Exists | Verify pipeline as per AC-001.6 |
| `packages/types/package.json` | Exists | Verify `"name": "@zap/types"`, `"main": "./src/index.ts"` |
| `packages/types/src/index.ts` | Exists | Verify ALL interfaces from AC-001.2 are exported |
| `packages/validators/package.json` | Exists | Verify `"name": "@zap/validators"`, `"main": "./src/index.ts"` |
| `packages/validators/src/index.ts` | Exists | Verify ALL schemas from AC-001.3 are exported |
| `apps/api/package.json` | Exists | Verify `"@zap/types": "*"` in dependencies |
| `apps/api/tsconfig.json` | Exists | Verify `"paths": { "@/*": ["./src/*"] }` |
| `apps/web/package.json` | Exists | Verify `"@zap/types": "*"` and `"@zap/validators": "*"` |
| `apps/web/tsconfig.json` | Exists | Verify paths alias and `"moduleResolution": "bundler"` |

### Critical tsconfig settings for packages
```json
// packages/types/tsconfig.json (create if missing)
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### npm workspaces install
After any `package.json` change:
```bash
npm install  # from root — installs all workspaces
```

### Common issues to watch for
1. **ESM vs CJS mismatch** — apps/api uses `"type": "module"` (ESM). All packages must be ESM-compatible or have dual exports.
2. **`@zap/types` not found** — Run `npm install` from root, not from individual package dirs.
3. **Turbo cache stale** — If pipeline behaves oddly: `npx turbo run build --force`

---

## Dependencies

| Dependency | Type | Blocking? |
|-----------|------|----------|
| None | — | This is the FIRST story |

**Blocks:**
- EPIC-01-STORY-02 (DB needs types)
- EPIC-01-STORY-03 (API needs types + validators)
- EPIC-01-STORY-04 (Workers need API queue config)
- EPIC-01-STORY-05 (Docker needs apps to exist)
- ALL stories in EPIC-02 through EPIC-07

---

## Definition of Done

- [ ] `npm run dev` starts both apps with no import errors
- [x] `npm run typecheck` passes with 0 errors
- [ ] `npm run lint` passes with 0 errors
- [ ] `npm run build` completes successfully for all packages
- [x] All interfaces in AC-001.2 are exported from `packages/types`
- [x] All schemas in AC-001.3 are exported from `packages/validators`
- [x] `turbo.json` pipeline validated (dev/build/test/lint/typecheck/clean)
- [x] No circular dependencies between packages
- [x] Story file updated with file list of all created/modified files
- [ ] @po notified for `*validate-story-draft ZAP-001`

---

## File List (update as you work)

| File | Action | Notes |
|------|--------|-------|
| `package.json` | verified | npm workspaces OK |
| `turbo.json` | fixed | `pipeline` → `tasks` (turbo v2), `test.dependsOn` → `["^build"]` |
| `packages/types/package.json` | verified | `@zap/types`, main=`./src/index.ts` |
| `packages/types/tsconfig.json` | created | ES2022, NodeNext, strict |
| `packages/types/src/index.ts` | verified | All 16 interfaces + enums present |
| `packages/validators/package.json` | verified | `@zap/validators`, main=`./src/index.ts` |
| `packages/validators/tsconfig.json` | created | ES2022, NodeNext, strict |
| `packages/validators/src/index.ts` | fixed | `default(256)` → `default(1024)` (WA group capacity) |
| `packages/config/package.json` | created | `@zap/config` placeholder |
| `packages/config/src/index.ts` | created | `ZAP_DEFAULTS.groupCapacity = 1024` |
| `apps/api/src/queues/index.ts` | fixed | IORedis type conflict with BullMQ resolved; `redisConnection` export; `humanizedDelay` async |
| `apps/api/src/middleware/auth.ts` | fixed | `ContextVariableMap` adds `tenantId` + `role`; sets both on context |
| `apps/api/src/middleware/rate-limit.ts` | fixed | Import `redisConnection` (renamed from `redis`) |
| `apps/api/src/services/whatsapp/session-manager.ts` | fixed | Import `redisConnection` |
| `apps/api/src/services/tracking/link-service.ts` | fixed | Import `redisConnection` |
| `apps/api/src/routes/connections.ts` | fixed | `streamSSE` from `hono/streaming` replaces non-existent `c.streamText` |
| `apps/api/src/workers/message.worker.ts` | fixed | Typed `MessageJobData`; BullMQ connection as plain object; `void` fire-and-forget |
| `apps/api/src/workers/broadcast.worker.ts` | fixed | Typed `BroadcastJobData`; BullMQ connection as plain object |
| `apps/api/src/workers/trigger.worker.ts` | fixed | Typed `TriggerJobData`; BullMQ connection as plain object |
| `apps/api/src/routes/projects.ts` | fixed | Default `capacity_per_group` 256→1024 |
| `apps/api/src/routes/groups.ts` | fixed | Default `capacity` 256→1024 |
| `supabase/migrations/20260218000001_initial_schema.sql` | fixed | `DEFAULT 256` → `DEFAULT 1024` for group capacity fields |

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-18 | River (SM) | Story created |
| 2026-02-19 | Dex (Dev) | Implemented: tsconfigs created, turbo.json fixed, IORedis/BullMQ type conflict resolved, ContextVariableMap fixed, all group capacity defaults updated to 1024 |

---

*Source: docs/prd/zap-prd.md § FR-MAINT-01, § 9.2 ZAP-001*
*Source: docs/stories/zap-user-stories.md § ZAP-001*
*Next story: EPIC-01-STORY-02*
