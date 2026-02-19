# EPIC-01-STORY-05 — Docker Compose Local Environment
**Story ID:** ZAP-005
**Epic:** EPIC-01 — Foundation & Infrastructure
**Sprint:** 0 | **Phase:** MVP
**Priority:** 🟠 HIGH
**Story Points:** 2
**Status:** Ready for Review
**Assigned to:** @dev (Dex)
**Prepared by:** River (Scrum Master)

---

## User Story

**As a** developer onboarding to the Zap platform,
**I want** a single `docker-compose up` command to start all infrastructure services (Redis, Evolution API) alongside the Zap API,
**so that** I can have a complete, reproducible local development environment in under 5 minutes without manually configuring each service.

---

## Context & Background

The Zap platform depends on three external services that every developer needs running locally:

1. **Redis** — Required by BullMQ workers (queue backend) and rate limiting middleware
2. **Evolution API v2** — WhatsApp session manager; every connection operation calls this
3. **Zap API** (optional in compose) — The Hono API server itself

The `docker-compose.yml` was scaffolded in the architecture session. This story verifies it is correct and complete, ensures all services start and communicate properly, and documents the developer setup workflow.

**Goal:** Any developer should be able to clone the repo, copy `.env.example` to `.env`, run `docker-compose up`, and have a working local environment.

---

## Acceptance Criteria

### AC-005.1 — `docker-compose up` starts all services
```bash
cd zap/
docker-compose up -d

# EXPECTED: All services start with status "running":
docker-compose ps
# NAME                  STATUS    PORTS
# zap_redis_1           running   0.0.0.0:6379->6379/tcp
# zap_evolution_1       running   0.0.0.0:8080->8080/tcp
# zap_api_1             running   0.0.0.0:3001->3001/tcp
```

All three services must reach healthy/running state within 60 seconds. No "exited" services.

### AC-005.2 — Redis is reachable from host
```bash
redis-cli -h localhost -p 6379 ping
# EXPECTED: PONG

# From inside another container:
docker-compose exec api redis-cli -h redis -p 6379 ping
# EXPECTED: PONG
```

Redis must use the service name `redis` on the internal Docker network so the API can connect via `REDIS_URL=redis://redis:6379`.

### AC-005.3 — Evolution API is reachable and authenticated
```bash
# Health check (no auth required):
curl http://localhost:8080/
# EXPECTED: HTTP 200 or the Evolution API welcome response

# Authenticated endpoint (requires EVOLUTION_API_KEY):
curl -H "apikey: $EVOLUTION_API_KEY" http://localhost:8080/instance/fetchInstances
# EXPECTED: HTTP 200 with JSON response (empty array [] if no instances)
# NOT EXPECTED: HTTP 401 or "unauthorized"
```

### AC-005.4 — API service connects to Redis and Supabase
```bash
curl http://localhost:3001/health
# EXPECTED: HTTP 200 { "status": "ok", "timestamp": "..." }

# If SUPABASE_URL is not configured, API should still start
# and return 503 or similar on DB-dependent routes
# but MUST NOT crash on startup
```

### AC-005.5 — API has hot reload in development
```bash
# Modify a source file while compose is running:
echo "// test" >> apps/api/src/index.ts

# EXPECTED within 3 seconds: API service restarts
# docker-compose logs api --tail=5 should show tsx restart message
```

The API service in docker-compose must mount the source code as a volume and use `tsx watch` (not `node dist/`).

### AC-005.6 — Redis data persists across restarts
```bash
# Add a key:
redis-cli -h localhost -p 6379 set test_key "hello"

# Restart Redis:
docker-compose restart redis

# Verify data persists:
redis-cli -h localhost -p 6379 get test_key
# EXPECTED: "hello" (data survived restart)
```

Redis must be configured with a named volume for persistence (not a tmpfs/anonymous volume).

### AC-005.7 — Services communicate on internal network
```bash
# From api container, reach evolution:
docker-compose exec api curl http://evolution:8080/
# EXPECTED: HTTP 200 (not "could not resolve host")
```

All services must be on the same Docker bridge network. Service names must resolve: `redis`, `evolution`, `api`.

### AC-005.8 — Clean teardown removes volumes
```bash
docker-compose down -v
# EXPECTED: All containers stopped
# EXPECTED: Named volumes removed (redis_data)
# EXPECTED: No orphan containers
```

`docker-compose down` (without `-v`) must stop containers but preserve volumes.
`docker-compose down -v` must also remove volumes (full clean slate).

### AC-005.9 — .env.example is complete
```bash
# All variables used in docker-compose.yml and apps/api must be in .env.example
# with descriptions:
grep "^[A-Z]" .env.example | wc -l
# EXPECTED: >= 12 variables documented
```

`.env.example` must include:
- `SUPABASE_URL` — with format hint: `https://<project>.supabase.co`
- `SUPABASE_ANON_KEY` — with note: "Public anon key from Supabase dashboard"
- `SUPABASE_SERVICE_ROLE_KEY` — with note: "⚠️ Never expose to frontend"
- `REDIS_URL` — default: `redis://redis:6379` (Docker) or `redis://localhost:6379` (local)
- `EVOLUTION_API_URL` — default: `http://evolution:8080` (Docker) or `http://localhost:8080`
- `EVOLUTION_API_KEY` — with note: "Must match AUTHENTICATION_API_KEY in compose"
- `PORT` — default: `3001`
- `NODE_ENV` — default: `development`
- `APP_URL` — default: `http://localhost:3000`
- `NEXT_PUBLIC_API_URL` — default: `http://localhost:3001`
- `NEXT_PUBLIC_SUPABASE_URL` — same as SUPABASE_URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — same as SUPABASE_ANON_KEY

---

## Technical Notes

### Files to Verify / Fix

| File | Status | Key things to check |
|------|--------|---------------------|
| `docker-compose.yml` | Exists | All 3 services, named volumes, network, env vars |
| `.env.example` | Exists | All 12+ variables with descriptions |

### docker-compose.yml required structure
```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes  # Enable persistence
    networks:
      - zap_network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  evolution:
    image: atendai/evolution-api:v2.2.3  # Pin to specific version
    ports:
      - "8080:8080"
    environment:
      - AUTHENTICATION_TYPE=apikey
      - AUTHENTICATION_API_KEY=${EVOLUTION_API_KEY}
      - DATABASE_ENABLED=false
      - REDIS_ENABLED=true
      - REDIS_URI=redis://redis:6379
      - REDIS_PREFIX_KEY=evolution
    depends_on:
      redis:
        condition: service_healthy
    networks:
      - zap_network

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile.dev
    ports:
      - "3001:3001"
    volumes:
      - ./apps/api/src:/app/apps/api/src  # Hot reload
      - ./packages:/app/packages           # Shared packages
    environment:
      - NODE_ENV=development
      - PORT=3001
      - REDIS_URL=redis://redis:6379
      - EVOLUTION_API_URL=http://evolution:8080
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    depends_on:
      redis:
        condition: service_healthy
    networks:
      - zap_network

volumes:
  redis_data:

networks:
  zap_network:
    driver: bridge
```

### Dockerfile.dev for API
```dockerfile
# apps/api/Dockerfile.dev
FROM node:20-alpine

WORKDIR /app

# Copy package files for all workspaces
COPY package.json package-lock.json turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/validators/package.json ./packages/validators/

# Install dependencies
RUN npm install

# Copy source (overridden by volume mount in development)
COPY apps/api/src ./apps/api/src
COPY packages/types/src ./packages/types/src
COPY packages/validators/src ./packages/validators/src

EXPOSE 3001

# tsx watch for hot reload
CMD ["npx", "tsx", "watch", "apps/api/src/index.ts"]
```

**Note:** If `apps/api/Dockerfile.dev` does not exist, create it.

### Evolution API version pinning
**CRITICAL:** Always pin Evolution API to a specific version tag. `latest` changes frequently and introduces breaking API changes. Verify compatibility with `v2.2.3` before pinning to a newer version.

Check current stable version at: https://github.com/EvolutionAPI/evolution-api/releases

### Running without Docker (alternative)
For developers who prefer not to use Docker for the API itself:
```bash
# Start only infrastructure:
docker-compose up -d redis evolution

# Start API on host:
npm run dev -w apps/api

# .env must use localhost URLs in this case:
REDIS_URL=redis://localhost:6379
EVOLUTION_API_URL=http://localhost:8080
```

### Common issues

1. **Evolution API exits immediately** — Check `AUTHENTICATION_API_KEY` is set in `.env`. Evolution v2 crashes on startup without valid auth config.

2. **`zsh: no matches found: docker-compose`** — Use `docker compose` (v2 syntax) instead of `docker-compose` if you have Docker Desktop 4.x+.

3. **Redis `MISCONF` error** — Redis `appendonly yes` may fail if `/data` is read-only. Verify the `redis_data` volume is correctly created. Run `docker volume ls` to check.

4. **Hot reload not working** — The volume mount in compose must match the working directory inside the container. Verify the `WORKDIR` in `Dockerfile.dev` matches the mounted paths.

5. **Port conflicts** — If port 6379 or 8080 is already in use:
   ```bash
   lsof -i :6379  # Check what's using Redis port
   lsof -i :8080  # Check what's using Evolution port
   ```

---

## Dependencies

| Dependency | Type | Blocking? |
|-----------|------|----------|
| EPIC-01-STORY-01 | Hard | YES — needs `apps/api` to exist for Dockerfile.dev |
| Docker Desktop installed | Tool | YES — must have Docker runtime |
| `.env` file present | Config | YES — compose reads env vars from `.env` |

**Blocks:**
- Nothing directly (infrastructure story)
- Enables all development work that requires Redis or Evolution API

---

## Definition of Done

- [x] `docker-compose up -d` starts all 3 services with status "running" (AC-005.1)
- [x] `redis-cli ping` returns PONG from host (AC-005.2)
- [x] Evolution API responds to authenticated request (AC-005.3)
- [x] `GET /health` returns 200 from containerized API (AC-005.4)
- [x] Source file change triggers API hot reload within 3s (AC-005.5)
- [x] Redis data persists across `docker-compose restart redis` (AC-005.6)
- [x] Services resolve each other by name on internal network (AC-005.7)
- [x] `docker-compose down -v` cleans all volumes (AC-005.8)
- [x] `.env.example` has all 12+ required variables with descriptions (AC-005.9) — 22 vars
- [x] `apps/api/Dockerfile.dev` exists and builds successfully
- [x] Story file updated with file list

---

## File List (update as you work)

| File | Action | Notes |
|------|--------|-------|
| `docker-compose.yml` | fixed | Added healthcheck, zap_network, pinned Evolution v2.2.3, fixed build context, env_file |
| `.env.example` | updated | 22 vars with Docker vs local hints, added PORT, NODE_ENV, NEXT_PUBLIC_SUPABASE_* |
| `apps/api/Dockerfile.dev` | created | Node 20 Alpine, tsx watch, all workspace package.json files for npm resolution |

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-18 | River (SM) | Story created |
| 2026-02-19 | Dex (Dev) | Rewrote docker-compose.yml (healthcheck, network, pinned Evolution, fixed context); created Dockerfile.dev; updated .env.example to 22 vars |

---

*Source: docs/prd/zap-prd.md § NFR-OPS-01–03 (local development experience)*
*Source: docs/stories/zap-user-stories.md § ZAP-005*
*Source: docs/architecture/system-architecture.md § 8 (Infrastructure)*
*EPIC-01 complete — Next: EPIC-02*
