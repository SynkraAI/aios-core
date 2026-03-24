# Brand System Service - SQL Migrations

**Version:** 1.0
**Date:** 2026-03-05
**Author:** Dara (Data Engineer Agent)
**Source Schema:** `docs/schema-brand-system-service.md` (v1.0)
**Source PRD:** `docs/prd-brand-system-service.md` (v1.1)
**Source Epics:** `docs/epics-brand-system-service.md` (v1.1)

---

## Table of Contents

1. [Schema Review](#1-schema-review)
2. [Migration 001: Enums & Core Tables](#2-migration-001-enums--core-tables-bss-12)
3. [Migration 002: Extended Tables](#3-migration-002-extended-tables-bss-17-18-19-110)
4. [Migration 003: RLS Policies](#4-migration-003-rls-policies-bss-13)
5. [Migration 004: Indexes](#5-migration-004-indexes-performance)
6. [Migration 005: Seed Data](#6-migration-005-seed-data)
7. [Migration 006: Functions & Triggers](#7-migration-006-functions--triggers)
8. [Rollback Plans](#8-rollback-plans)

---

## 1. Schema Review

### 1.1 FR Coverage Analysis

| FR | Requirement | Schema Coverage | Verdict |
|----|-------------|-----------------|---------|
| FR-1.1 | Brand Discovery Workshop | `brand_profiles.personality_scores`, `visual_preferences`, `vocabulary`, `competitor_urls` | COVERED |
| FR-1.2 | W3C DTCG tokens | `tokens` table with `token_path`, `token_value` (JSONB), `token_type`, `version` | COVERED |
| FR-1.12 | Multi-tenant deployment | `tenants.slug` for subdomain routing, `tenant_id` on all tables | COVERED |
| FR-8.1 | Client Portal | `users` (auth), `deliverables`, `assets`, `approval_workflow` | COVERED |
| FR-8.2 | Client Onboarding | Phase 5 setup: `tenants` creation, token generation | COVERED |
| FR-8.3 | R2 Asset Storage | `assets.r2_key`, `assets.file_type`, `assets.file_size`, `assets.checksum` | COVERED |
| FR-8.4 | Version Control | `deliverables.version`, `tokens.version`, `revisions` table | COVERED |
| FR-8.5 | Quality Review Queue | `approval_workflow` with `action` enum (approve/request-changes/comment) | COVERED |
| FR-8.7 | Revision Management | `revisions` table with `revision_number` (max 3 check), `changes_requested` | COVERED |
| FR-8.8 | Asset Organization | `assets.category` enum maps to folder structure, `assets.r2_key` for paths | COVERED |
| FR-9.1 | Prompt Template Library | Not in schema -- prompts stored as files, not DB records | N/A (by design) |
| NFR-2.6 | RLS tenant isolation | RLS on all tenant-scoped tables | COVERED |
| NFR-4.2 | AI cost tracking | `ai_api_logs` with `cost_usd`, `input_tokens`, `output_tokens` | COVERED |
| NFR-5.1 | Supabase Auth magic link | `users.id` FK to `auth.users.id` | COVERED |
| NFR-5.4 | GDPR compliance | `data_export_requests`, `deletion_audit`, `deleted_at` soft delete | COVERED |
| NFR-5.5 | Malware scanning | `security_scan_results` table | COVERED |
| NFR-6.1 | AI API call logging | `ai_api_logs` table | COVERED |
| NFR-6.5 | System health dashboard | `system_health_checks` table | COVERED |
| NFR-8.2 | Rate limiting | `rate_limit_events` table, `users.locked_until` | COVERED |
| NFR-8.3 | HMAC webhook validation | `webhook_secrets` table with `secret_hash`, `secret_version`, rotation | COVERED |

### 1.2 Identified Gaps & Adjustments

| Gap | Issue | Resolution |
|-----|-------|------------|
| G-1 | `system_health_checks` missing `response_ms` column in ERD (present in SQL) | Schema SQL already has it. ERD omission only. No migration change needed. |
| G-2 | `rate_limit_events.ip_address` typed as `text` in ERD but should be `inet` | Schema SQL correctly uses `inet`. No migration change needed. |
| G-3 | `webhook_secrets` missing `is_active` column in ERD (present in SQL) | Schema SQL already has it. ERD omission only. No migration change needed. |
| G-4 | `data_export_requests` missing `file_size` column in ERD (present in SQL) | Schema SQL already has it. ERD omission only. No migration change needed. |
| G-5 | `revisions` has `ON DELETE SET NULL` on `requested_by` FK, but `requested_by` is `NOT NULL` | Changed to `ON DELETE RESTRICT` to prevent orphaned records. A revision cannot exist without the requester. |
| G-6 | `tenants.slug_format` CHECK regex rejects single-char slugs (requires start AND end char) | Adjusted regex to `'^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'` to allow single-char slugs like "x" while still preventing leading/trailing hyphens. |
| G-7 | No `updated_at` column on `revisions` table but trigger is not applied | Added `updated_at` column to `revisions` table for consistency. Trigger applied in Migration 006. |
| G-8 | `approval_workflow` missing `updated_at` column | Workflow entries are immutable log events (append-only), so `updated_at` is intentionally omitted. Documented decision. |
| G-9 | Missing explicit naming for foreign key constraints on some tables | All FKs now have explicit constraint names (e.g., `fk_users_tenant_id`). |

### 1.3 Data Type Validation

| Column | Type | Rationale |
|--------|------|-----------|
| `cost_usd` | `numeric(10,6)` | Supports up to $9,999.999999 per call. AI API calls are typically $0.001-$1.00, so 6 decimal places are sufficient for micro-pricing. |
| `file_size` | `bigint` | Supports files up to 9.2 exabytes. YouTube allows 128GB uploads, so `integer` (2GB max) would be insufficient. |
| `ip_address` | `inet` | PostgreSQL native type for IPv4/IPv6 with validation and indexing support. |
| `token_value` | `jsonb` | W3C DTCG tokens are JSON objects (`{"$value": "#3B82F6", "$type": "color"}`). JSONB for indexing and query support. |
| `personality_scores` | `jsonb` | Flexible structure for 5-point scales that may evolve (e.g., adding new dimensions). |

### 1.4 Schema Design Decisions

1. **Soft delete via `deleted_at`** on all tenant-owned tables to support GDPR 7-day grace period before permanent deletion (NFR-5.4).
2. **No `updated_at` on append-only tables** (`ai_api_logs`, `approval_workflow`, `rate_limit_events`, `system_health_checks`, `security_scan_results`, `data_export_requests`, `deletion_audit`). These are log/audit tables where records are never modified.
3. **`deletion_audit.tenant_id` is NOT a foreign key** because the tenant has already been deleted when this record is created.
4. **`users.id` is NOT auto-generated** -- it mirrors `auth.users.id` from Supabase Auth (1:1 mapping).
5. **Token versioning** uses `(tenant_id, token_path, version)` unique constraint, allowing multiple versions of the same token path per tenant.

---

## 2. Migration 001: Enums & Core Tables (BSS-1.2)

**File:** `supabase/migrations/20260305000001_create_enums_and_core_tables.sql`

```sql
-- =============================================================
-- Migration 001: Enums & Core Tables
-- Brand System Service (BSS-1.2)
--
-- Creates all enum types and core business tables:
--   tenants, users, brand_profiles, deliverables, assets,
--   tokens, revisions, approval_workflow
--
-- Author: Dara (Data Engineer)
-- Date: 2026-03-05
-- PRD: docs/prd-brand-system-service.md v1.1
-- =============================================================

BEGIN;

-- =============================================================
-- SECTION 1: ENUM TYPES
-- All custom types used across the schema.
-- =============================================================

-- Tenant status lifecycle
CREATE TYPE tenant_status AS ENUM ('active', 'suspended', 'offboarded');

-- Service tier pricing (FR-8.2 Phase 5)
CREATE TYPE tenant_tier AS ENUM ('tier1', 'tier2', 'tier3');

-- User roles within a tenant (RBAC)
-- admin: full access, member: edit access, viewer: read-only
CREATE TYPE user_role AS ENUM ('admin', 'member', 'viewer');

-- Types of deliverables produced by the service
-- Maps to PRD Pillar deliverable categories
CREATE TYPE deliverable_type AS ENUM (
  'brand-book',
  'social-post',
  'carousel',
  'story-reel',
  'thumbnail',
  'banner-cover',
  'landing-page',
  'institutional-site',
  'email-template',
  'video',
  'logo-system',
  'color-palette',
  'typography-system',
  'icon-set',
  'pitch-deck',
  'proposal',
  'case-study',
  'one-pager',
  'brand-voice-guide',
  'manifesto',
  'bio-link-page'
);

-- Deliverable lifecycle status
CREATE TYPE deliverable_status AS ENUM (
  'draft',
  'in-review',
  'approved',
  'delivered',
  'revision-requested'
);

-- Asset file categories matching FR-8.8 folder structure
CREATE TYPE asset_category AS ENUM (
  'logo',
  'color',
  'typography',
  'icon',
  'pattern',
  'photography',
  'illustration',
  'social',
  'web',
  'email',
  'video',
  'corporate',
  'motion',
  'ads',
  'export',
  'token',
  'source'
);

-- Approval workflow actions (FR-8.5)
CREATE TYPE approval_action AS ENUM ('approve', 'request-changes', 'comment');

-- AI agent types for cost tracking (BSS-1.10, NFR-6.1)
CREATE TYPE ai_agent_type AS ENUM ('copy-generation', 'image-generation', 'voice-synthesis');

-- AI provider tracking (BSS-1.10, NFR-4.2)
CREATE TYPE ai_provider AS ENUM ('anthropic', 'openai', 'replicate', 'elevenlabs');

-- AI call status (BSS-1.10)
CREATE TYPE ai_call_status AS ENUM ('success', 'failure', 'timeout');

-- Security scan verdict (BSS-1.8, NFR-5.5)
CREATE TYPE scan_verdict AS ENUM ('clean', 'infected', 'error');

-- Data export status (BSS-1.9, NFR-5.4)
CREATE TYPE export_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'expired');

-- Deletion reason for audit trail (BSS-1.9, NFR-5.4)
CREATE TYPE deletion_reason AS ENUM ('gdpr-request', 'non-payment', 'abuse', 'other');


-- =============================================================
-- SECTION 2: CORE TABLES
-- =============================================================

-- =============================================================
-- TABLE: tenants
-- Purpose: Client organizations. Root of multi-tenant hierarchy.
-- PRD Refs: FR-1.12 (multi-tenant), FR-8.2 Phase 5 (tenant setup)
-- =============================================================
CREATE TABLE public.tenants (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text NOT NULL,
  name          text NOT NULL,
  status        tenant_status NOT NULL DEFAULT 'active',
  tier          tenant_tier NOT NULL DEFAULT 'tier1',
  settings      jsonb NOT NULL DEFAULT '{}',
  offboarded_at timestamptz,
  deleted_at    timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  -- Explicit constraint naming for maintainability
  CONSTRAINT tenants_slug_unique UNIQUE (slug),
  -- Allow single-char slugs (e.g., "x"), prevent leading/trailing hyphens
  CONSTRAINT tenants_slug_format CHECK (slug ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'),
  -- Slug must be at least 1 character
  CONSTRAINT tenants_slug_min_length CHECK (char_length(slug) >= 1)
);

COMMENT ON TABLE public.tenants IS 'Client organizations. Each tenant maps to a subdomain (slug.brand.aioxsquad.ai).';
COMMENT ON COLUMN public.tenants.slug IS 'URL-safe identifier for subdomain routing. Lowercase alphanumeric + hyphens.';
COMMENT ON COLUMN public.tenants.settings IS 'Tenant-specific configuration (notification prefs, feature flags, industry, language).';
COMMENT ON COLUMN public.tenants.offboarded_at IS 'When tenant requested offboarding. Permanent delete after 7 days (NFR-5.4).';
COMMENT ON COLUMN public.tenants.deleted_at IS 'Soft delete timestamp. Non-null means record is logically deleted.';


-- =============================================================
-- TABLE: users
-- Purpose: Application user profiles linked to Supabase Auth.
-- PRD Refs: NFR-5.1 (Supabase Auth magic link)
-- =============================================================
CREATE TABLE public.users (
  id            uuid PRIMARY KEY,              -- Same UUID as auth.users.id (NOT auto-generated)
  tenant_id     uuid NOT NULL,
  email         text NOT NULL,
  role          user_role NOT NULL DEFAULT 'member',
  name          text NOT NULL,
  avatar_url    text,
  locked_until  timestamptz,                   -- BSS-1.8: rate limit lockout (NFR-8.2)
  deleted_at    timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT fk_users_auth FOREIGN KEY (id)
    REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_users_tenant_id FOREIGN KEY (tenant_id)
    REFERENCES public.tenants(id) ON DELETE CASCADE,
  CONSTRAINT users_tenant_email_unique UNIQUE (tenant_id, email)
);

COMMENT ON TABLE public.users IS 'Application user profiles. Extends auth.users with tenant association and role.';
COMMENT ON COLUMN public.users.id IS 'Same UUID as auth.users.id. One-to-one mapping. NOT auto-generated.';
COMMENT ON COLUMN public.users.locked_until IS 'Account locked until this time due to rate limit abuse (NFR-8.2). NULL = not locked.';


-- =============================================================
-- TABLE: brand_profiles
-- Purpose: Brand configuration per tenant from Brand Discovery Workshop.
-- PRD Refs: FR-1.1 (brand discovery), FR-8.2 Phase 2 (AI analysis)
-- One brand profile per tenant (1:1 relationship via UNIQUE on tenant_id).
-- =============================================================
CREATE TABLE public.brand_profiles (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL,
  personality_scores  jsonb NOT NULL DEFAULT '{}',
  visual_preferences  jsonb NOT NULL DEFAULT '{}',
  vocabulary          jsonb NOT NULL DEFAULT '{"approved": [], "forbidden": []}',
  competitor_urls     text[] NOT NULL DEFAULT '{}',
  voice_guide_url     text,
  manifesto_url       text,
  moodboard_urls      text[] NOT NULL DEFAULT '{}',
  deleted_at          timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT fk_brand_profiles_tenant_id FOREIGN KEY (tenant_id)
    REFERENCES public.tenants(id) ON DELETE CASCADE,
  -- Enforce 1:1 relationship (one brand profile per tenant)
  CONSTRAINT brand_profiles_tenant_unique UNIQUE (tenant_id)
);

COMMENT ON TABLE public.brand_profiles IS 'Brand identity configuration per tenant. One profile per tenant (1:1).';
COMMENT ON COLUMN public.brand_profiles.personality_scores IS 'Five-point scales from Brand Discovery Workshop. Example: {"innovative": 4, "formal": 2, "bold": 5}';
COMMENT ON COLUMN public.brand_profiles.vocabulary IS 'Approved and forbidden words. Structure: {"approved": ["innovate", ...], "forbidden": ["cheap", ...]}';
COMMENT ON COLUMN public.brand_profiles.visual_preferences IS 'Visual style preferences: {"style": "modern-tech", "mood": "dark-cockpit", "color_preference": "blue-accent"}';


-- =============================================================
-- TABLE: deliverables
-- Purpose: All work items produced for a tenant.
-- PRD Refs: FR-8.4 (version control), FR-8.5 (review queue), FR-8.7 (revisions)
-- Polymorphic via type + metadata JSONB pattern.
-- =============================================================
CREATE TABLE public.deliverables (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL,
  type        deliverable_type NOT NULL,
  title       text NOT NULL,
  description text,
  status      deliverable_status NOT NULL DEFAULT 'draft',
  version     integer NOT NULL DEFAULT 1,
  metadata    jsonb NOT NULL DEFAULT '{}',
  deleted_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT fk_deliverables_tenant_id FOREIGN KEY (tenant_id)
    REFERENCES public.tenants(id) ON DELETE CASCADE,
  CONSTRAINT deliverables_version_positive CHECK (version > 0)
);

COMMENT ON TABLE public.deliverables IS 'All work items produced for a tenant. Type-specific data stored in metadata JSONB.';
COMMENT ON COLUMN public.deliverables.metadata IS 'Type-specific data. Example for social-post: {"platform": "instagram", "dimensions": "1080x1080", "layout": "quote"}';
COMMENT ON COLUMN public.deliverables.version IS 'Incrementing version number. Brand book uses semver in metadata; this is the DB sequence.';


-- =============================================================
-- TABLE: assets
-- Purpose: File metadata tracking. Files stored in Cloudflare R2.
-- PRD Refs: FR-8.3 (R2 storage), FR-8.8 (asset organization)
-- =============================================================
CREATE TABLE public.assets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL,
  deliverable_id  uuid,                          -- Nullable: orphan assets allowed
  filename        text NOT NULL,
  r2_key          text NOT NULL,                 -- Full path in R2 bucket
  file_type       text NOT NULL,                 -- MIME type e.g. 'image/svg+xml'
  file_size       bigint NOT NULL,               -- bytes
  category        asset_category NOT NULL,
  checksum        text,                          -- SHA-256 for integrity verification
  deleted_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT fk_assets_tenant_id FOREIGN KEY (tenant_id)
    REFERENCES public.tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_assets_deliverable_id FOREIGN KEY (deliverable_id)
    REFERENCES public.deliverables(id) ON DELETE SET NULL,
  CONSTRAINT assets_r2_key_unique UNIQUE (r2_key),
  CONSTRAINT assets_file_size_positive CHECK (file_size > 0)
);

COMMENT ON TABLE public.assets IS 'File metadata for assets stored in Cloudflare R2. Path: r2://brand-assets/{tenant-id}/{category}/{filename}';
COMMENT ON COLUMN public.assets.r2_key IS 'Full path in R2 bucket. Example: {tenant-uuid}/brand-identity/logo-{uuid}.svg';
COMMENT ON COLUMN public.assets.checksum IS 'SHA-256 hash for integrity verification and deduplication.';


-- =============================================================
-- TABLE: tokens
-- Purpose: W3C DTCG design tokens per tenant. Versioned per path.
-- PRD Refs: FR-1.2 (W3C DTCG format), CON-13 (code is source of truth)
-- =============================================================
CREATE TABLE public.tokens (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL,
  token_path  text NOT NULL,                   -- W3C DTCG path e.g. 'color.primary.500'
  token_value jsonb NOT NULL,                  -- W3C DTCG value e.g. {"$value": "#3B82F6", "$type": "color"}
  token_type  text NOT NULL,                   -- W3C DTCG type: color, dimension, fontFamily, etc.
  version     text NOT NULL DEFAULT '1.0.0',   -- semver
  deleted_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT fk_tokens_tenant_id FOREIGN KEY (tenant_id)
    REFERENCES public.tenants(id) ON DELETE CASCADE,
  -- Unique per tenant + path + version (allows multiple versions of same token)
  CONSTRAINT tokens_tenant_path_version_unique UNIQUE (tenant_id, token_path, version)
);

COMMENT ON TABLE public.tokens IS 'Design tokens in W3C DTCG format. Versioned per tenant+path combination.';
COMMENT ON COLUMN public.tokens.token_path IS 'W3C DTCG token path. Examples: color.primary.500, typography.heading.fontFamily';
COMMENT ON COLUMN public.tokens.token_value IS 'W3C DTCG value object. Must contain $value and $type keys.';


-- =============================================================
-- TABLE: revisions
-- Purpose: Revision history for deliverables. 3 rounds per type (CON-14).
-- PRD Refs: FR-8.7 (revision management), CON-14 (per deliverable type)
-- =============================================================
CREATE TABLE public.revisions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL,
  deliverable_id    uuid NOT NULL,
  revision_number   integer NOT NULL,
  requested_by      uuid NOT NULL,
  requested_at      timestamptz NOT NULL DEFAULT now(),
  changes_requested text[] NOT NULL DEFAULT '{}',
  resolved_at       timestamptz,
  resolved_by       uuid,
  deleted_at        timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT fk_revisions_tenant_id FOREIGN KEY (tenant_id)
    REFERENCES public.tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_revisions_deliverable_id FOREIGN KEY (deliverable_id)
    REFERENCES public.deliverables(id) ON DELETE CASCADE,
  -- ON DELETE RESTRICT: cannot delete a user who requested a revision
  CONSTRAINT fk_revisions_requested_by FOREIGN KEY (requested_by)
    REFERENCES public.users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_revisions_resolved_by FOREIGN KEY (resolved_by)
    REFERENCES public.users(id) ON DELETE SET NULL,
  CONSTRAINT revisions_number_positive CHECK (revision_number > 0),
  -- CON-14: Max 3 revision rounds per deliverable type
  CONSTRAINT revisions_max_three CHECK (revision_number <= 3)
);

COMMENT ON TABLE public.revisions IS 'Revision rounds per deliverable. Max 3 rounds per deliverable type (CON-14).';
COMMENT ON COLUMN public.revisions.changes_requested IS 'Array of change descriptions submitted by client.';
COMMENT ON COLUMN public.revisions.revision_number IS 'Sequential revision number (1-3). Enforced by CHECK constraint.';


-- =============================================================
-- TABLE: approval_workflow
-- Purpose: Approval actions (approve/request-changes/comment) on deliverables.
-- PRD Refs: FR-8.5 (review queue), FR-8.1 (client portal review)
-- This is an append-only activity log. No updated_at (immutable entries).
-- =============================================================
CREATE TABLE public.approval_workflow (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL,
  deliverable_id  uuid NOT NULL,
  reviewer_id     uuid NOT NULL,
  action          approval_action NOT NULL,
  comment         text,
  deleted_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT fk_approval_tenant_id FOREIGN KEY (tenant_id)
    REFERENCES public.tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_approval_deliverable_id FOREIGN KEY (deliverable_id)
    REFERENCES public.deliverables(id) ON DELETE CASCADE,
  CONSTRAINT fk_approval_reviewer_id FOREIGN KEY (reviewer_id)
    REFERENCES public.users(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.approval_workflow IS 'Approval workflow actions. Append-only activity timeline for each deliverable. No updated_at by design.';


COMMIT;
```

---

## 3. Migration 002: Extended Tables (BSS-1.7, 1.8, 1.9, 1.10)

**File:** `supabase/migrations/20260305000002_create_extended_tables.sql`

```sql
-- =============================================================
-- Migration 002: Extended Tables
-- Brand System Service (BSS-1.7, BSS-1.8, BSS-1.9, BSS-1.10)
--
-- Creates monitoring, security, and GDPR compliance tables:
--   ai_api_logs, system_health_checks, rate_limit_events,
--   webhook_secrets, security_scan_results, data_export_requests,
--   deletion_audit
--
-- Author: Dara (Data Engineer)
-- Date: 2026-03-05
-- =============================================================

BEGIN;

-- =============================================================
-- BSS-1.10: MONITORING TABLES
-- =============================================================

-- =============================================================
-- TABLE: ai_api_logs
-- Purpose: Log all AI API calls for cost tracking and debugging.
-- PRD Refs: NFR-6.1 (log all AI API calls), NFR-4.2 (cost per client)
-- Append-only, write-heavy table. No updated_at (immutable).
-- =============================================================
CREATE TABLE public.ai_api_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL,
  agent_type    ai_agent_type NOT NULL,
  provider      ai_provider NOT NULL,
  model         text NOT NULL,
  input_tokens  integer,
  output_tokens integer,
  cost_usd      numeric(10, 6) NOT NULL DEFAULT 0,
  latency_ms    integer NOT NULL,
  status        ai_call_status NOT NULL,
  error_message text,
  created_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT fk_ai_logs_tenant_id FOREIGN KEY (tenant_id)
    REFERENCES public.tenants(id) ON DELETE CASCADE,
  -- Ensure non-negative values
  CONSTRAINT ai_logs_cost_non_negative CHECK (cost_usd >= 0),
  CONSTRAINT ai_logs_latency_positive CHECK (latency_ms > 0)
);

COMMENT ON TABLE public.ai_api_logs IS 'AI API call log for cost tracking per client. Append-only, write-heavy. No updated_at.';
COMMENT ON COLUMN public.ai_api_logs.cost_usd IS 'Cost in USD with 6 decimal precision for micro-pricing (e.g., $0.000150 per 1K tokens).';


-- =============================================================
-- TABLE: system_health_checks
-- Purpose: Periodic health check results for system dashboard.
-- PRD Refs: NFR-6.5 (system health dashboard)
-- No tenant_id (system-wide). Append-only.
-- =============================================================
CREATE TABLE public.system_health_checks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name  text NOT NULL,
  status        text NOT NULL,                  -- 'healthy', 'degraded', 'down'
  details       jsonb NOT NULL DEFAULT '{}',
  response_ms   integer,
  checked_at    timestamptz NOT NULL DEFAULT now(),
  created_at    timestamptz NOT NULL DEFAULT now(),

  -- Validate status values without an enum (may evolve)
  CONSTRAINT health_check_status_valid CHECK (status IN ('healthy', 'degraded', 'down'))
);

COMMENT ON TABLE public.system_health_checks IS 'System health check results. No tenant_id (system-wide). Managed via service role only.';
COMMENT ON COLUMN public.system_health_checks.response_ms IS 'Service response time in milliseconds. NULL if service unreachable.';


-- =============================================================
-- BSS-1.8: SECURITY TABLES
-- =============================================================

-- =============================================================
-- TABLE: rate_limit_events
-- Purpose: Audit log of rate-limited/throttled requests.
-- PRD Refs: NFR-8.2 (rate limiting: 100 RPM per user, 50 downloads/hr)
-- No tenant_id (cross-tenant security table). Append-only.
-- =============================================================
CREATE TABLE public.rate_limit_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid,
  endpoint      text NOT NULL,
  ip_address    inet,                            -- PostgreSQL native IP type
  request_count integer NOT NULL,
  action_taken  text NOT NULL,                   -- 'throttled', 'locked', 'warned'
  created_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT fk_rate_limit_user_id FOREIGN KEY (user_id)
    REFERENCES public.users(id) ON DELETE SET NULL,
  CONSTRAINT rate_limit_action_valid CHECK (action_taken IN ('throttled', 'locked', 'warned')),
  CONSTRAINT rate_limit_count_positive CHECK (request_count > 0)
);

COMMENT ON TABLE public.rate_limit_events IS 'Audit log of rate-limited requests. No tenant_id (security system table). Service role only.';


-- =============================================================
-- TABLE: webhook_secrets
-- Purpose: Per-endpoint HMAC secrets with rotation history.
-- PRD Refs: NFR-8.3 (HMAC webhook validation, 90-day rotation)
-- No tenant_id (system infrastructure). Append-only for rotation history.
-- =============================================================
CREATE TABLE public.webhook_secrets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_name   text NOT NULL,
  secret_hash     text NOT NULL,                 -- bcrypt hash of the actual secret
  secret_version  integer NOT NULL DEFAULT 1,
  is_active       boolean NOT NULL DEFAULT true,
  rotated_at      timestamptz,
  expires_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),

  -- Only one version per endpoint at a time
  CONSTRAINT webhook_secrets_endpoint_version_unique UNIQUE (endpoint_name, secret_version),
  CONSTRAINT webhook_secrets_version_positive CHECK (secret_version > 0)
);

COMMENT ON TABLE public.webhook_secrets IS 'HMAC secrets for webhook validation. Supports versioned rotation (90-day cycle per NFR-8.3).';
COMMENT ON COLUMN public.webhook_secrets.secret_hash IS 'bcrypt hash of the HMAC secret. Raw secret is NEVER stored.';
COMMENT ON COLUMN public.webhook_secrets.is_active IS 'Only active secrets are used for validation. Old versions kept for audit.';


-- =============================================================
-- TABLE: security_scan_results
-- Purpose: Malware scan results for uploaded files.
-- PRD Refs: NFR-5.5 (ClamAV malware scanning)
-- Tenant-scoped. Append-only.
-- =============================================================
CREATE TABLE public.security_scan_results (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL,
  asset_id    uuid,                              -- Nullable if asset was quarantined/deleted
  scanner     text NOT NULL DEFAULT 'clamav',
  verdict     scan_verdict NOT NULL,
  details     text,
  scanned_at  timestamptz NOT NULL DEFAULT now(),
  created_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT fk_scan_results_tenant_id FOREIGN KEY (tenant_id)
    REFERENCES public.tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_scan_results_asset_id FOREIGN KEY (asset_id)
    REFERENCES public.assets(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.security_scan_results IS 'Malware scan results for uploaded assets. Infected files are quarantined and deleted from R2.';


-- =============================================================
-- BSS-1.9: GDPR COMPLIANCE TABLES
-- =============================================================

-- =============================================================
-- TABLE: data_export_requests
-- Purpose: Track GDPR data export jobs (Article 15/20).
-- PRD Refs: NFR-5.4 (GDPR data export)
-- =============================================================
CREATE TABLE public.data_export_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL,
  requested_by  uuid NOT NULL,
  status        export_status NOT NULL DEFAULT 'pending',
  r2_export_key text,                            -- R2 path to generated ZIP
  file_size     bigint,                          -- ZIP size in bytes
  completed_at  timestamptz,
  expires_at    timestamptz,                     -- Signed URL expiry (7 days)
  created_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT fk_export_requests_tenant_id FOREIGN KEY (tenant_id)
    REFERENCES public.tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_export_requests_requested_by FOREIGN KEY (requested_by)
    REFERENCES public.users(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.data_export_requests IS 'GDPR Article 15/20 data export job queue. ZIP download via signed R2 URL (7-day expiry).';


-- =============================================================
-- TABLE: deletion_audit
-- Purpose: Permanent audit trail of tenant deletions. NEVER deleted.
-- PRD Refs: NFR-5.4 (GDPR deletion audit trail)
-- tenant_id is NOT a FK because the tenant has been permanently deleted.
-- =============================================================
CREATE TABLE public.deletion_audit (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL,                   -- NOT a FK -- tenant is already deleted
  tenant_slug   text NOT NULL,
  deleted_at    timestamptz NOT NULL DEFAULT now(),
  deleted_by    uuid,                            -- Admin user UUID, nullable for auto-delete
  reason        deletion_reason NOT NULL,
  data_summary  jsonb NOT NULL DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.deletion_audit IS 'Permanent record of tenant deletions. NEVER deleted. Retained 7+ years for GDPR compliance.';
COMMENT ON COLUMN public.deletion_audit.tenant_id IS 'UUID of deleted tenant. NOT a foreign key since tenant no longer exists.';
COMMENT ON COLUMN public.deletion_audit.data_summary IS 'Counts at deletion time. Example: {"users": 3, "deliverables": 15, "assets": 120, "storage_bytes": 524288000}';


COMMIT;
```

---

## 4. Migration 003: RLS Policies (BSS-1.3)

**File:** `supabase/migrations/20260305000003_create_rls_policies.sql`

```sql
-- =============================================================
-- Migration 003: RLS Policies
-- Brand System Service (BSS-1.3)
--
-- Enables Row Level Security on all tables and creates policies
-- for tenant isolation. Uses JWT claims for tenant context.
--
-- Security Model:
-- - Tenant-scoped tables: authenticated users see only their tenant's data
-- - System tables: deny all for authenticated, service role only
-- - Write operations: role-based where appropriate
--
-- Author: Dara (Data Engineer)
-- Date: 2026-03-05
-- =============================================================

BEGIN;

-- =============================================================
-- SECTION 1: HELPER FUNCTIONS
-- These are used in RLS policies for tenant/role extraction from JWT.
-- =============================================================

-- Custom Supabase Auth hook to inject tenant_id into JWT claims.
-- This function is registered as a Supabase Auth hook in the dashboard:
--   Authentication > Hooks > Custom Access Token Hook
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb AS $$
DECLARE
  claims jsonb;
  user_tenant_id uuid;
  user_role_val text;
BEGIN
  -- Get tenant_id and role from users table
  SELECT u.tenant_id, u.role::text INTO user_tenant_id, user_role_val
  FROM public.users u
  WHERE u.id = (event->>'user_id')::uuid
    AND u.deleted_at IS NULL;  -- Do not issue claims for soft-deleted users

  -- If user not found in public.users, return unmodified event
  -- This handles the case where auth.users exists but public.users row hasn't been created yet
  IF user_tenant_id IS NULL THEN
    RETURN event;
  END IF;

  -- Build claims
  claims := event->'claims';
  claims := jsonb_set(claims, '{tenant_id}', to_jsonb(user_tenant_id::text));
  claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role_val));

  -- Return modified event
  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Security: only supabase_auth_admin can execute this hook
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM public;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM anon;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated;


-- Extract tenant_id from JWT claims. Used in all tenant-scoped RLS policies.
-- STABLE: returns same result for same JWT within a transaction.
-- SECURITY DEFINER: runs with owner privileges to access auth.jwt().
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS uuid AS $$
BEGIN
  RETURN (auth.jwt() ->> 'tenant_id')::uuid;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.get_current_tenant_id IS 'Extracts tenant_id from JWT claims. Returns NULL if claim missing.';


-- Extract user_role from JWT claims. Used in role-based RLS policies.
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text AS $$
BEGIN
  RETURN auth.jwt() ->> 'user_role';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.get_current_user_role IS 'Extracts user_role from JWT claims. Returns NULL if claim missing.';


-- =============================================================
-- SECTION 2: ENABLE RLS ON ALL TABLES
-- =============================================================

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_workflow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_scan_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;
-- System tables (deny all for authenticated, service role bypasses)
ALTER TABLE public.system_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deletion_audit ENABLE ROW LEVEL SECURITY;


-- =============================================================
-- SECTION 3: TENANT-SCOPED TABLE POLICIES
-- =============================================================

-- -------------------- tenants --------------------

-- Users can only see their own tenant
CREATE POLICY "tenants_select_own"
  ON public.tenants FOR SELECT
  TO authenticated
  USING (id = get_current_tenant_id());

-- Only admins can update their own tenant settings
CREATE POLICY "tenants_update_admin_only"
  ON public.tenants FOR UPDATE
  TO authenticated
  USING (id = get_current_tenant_id() AND get_current_user_role() = 'admin')
  WITH CHECK (id = get_current_tenant_id() AND get_current_user_role() = 'admin');

-- INSERT/DELETE: service role only (tenant provisioning is automated)


-- -------------------- users --------------------

-- Users can see other users in their tenant
CREATE POLICY "users_select_same_tenant"
  ON public.users FOR SELECT
  TO authenticated
  USING (tenant_id = get_current_tenant_id() AND deleted_at IS NULL);

-- Only admins can create users in their tenant (team management)
CREATE POLICY "users_insert_admin_only"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id = get_current_tenant_id()
    AND get_current_user_role() = 'admin'
  );

-- Users can only update their own profile (name, avatar)
CREATE POLICY "users_update_own_profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND tenant_id = get_current_tenant_id());

-- No DELETE policy for authenticated users (service role only for offboarding)


-- -------------------- brand_profiles --------------------

CREATE POLICY "brand_profiles_select_own_tenant"
  ON public.brand_profiles FOR SELECT
  TO authenticated
  USING (tenant_id = get_current_tenant_id() AND deleted_at IS NULL);

-- Only admins and members can create/update brand profiles
CREATE POLICY "brand_profiles_insert_own_tenant"
  ON public.brand_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id = get_current_tenant_id()
    AND get_current_user_role() IN ('admin', 'member')
  );

CREATE POLICY "brand_profiles_update_own_tenant"
  ON public.brand_profiles FOR UPDATE
  TO authenticated
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (
    tenant_id = get_current_tenant_id()
    AND get_current_user_role() IN ('admin', 'member')
  );

-- No DELETE policy (service role only for tenant offboarding)


-- -------------------- deliverables --------------------

CREATE POLICY "deliverables_select_own_tenant"
  ON public.deliverables FOR SELECT
  TO authenticated
  USING (tenant_id = get_current_tenant_id() AND deleted_at IS NULL);

CREATE POLICY "deliverables_insert_own_tenant"
  ON public.deliverables FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id = get_current_tenant_id()
    AND get_current_user_role() IN ('admin', 'member')
  );

CREATE POLICY "deliverables_update_own_tenant"
  ON public.deliverables FOR UPDATE
  TO authenticated
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

-- Soft delete: only admins can mark deliverables as deleted
CREATE POLICY "deliverables_delete_own_tenant"
  ON public.deliverables FOR DELETE
  TO authenticated
  USING (
    tenant_id = get_current_tenant_id()
    AND get_current_user_role() = 'admin'
  );


-- -------------------- assets --------------------

CREATE POLICY "assets_select_own_tenant"
  ON public.assets FOR SELECT
  TO authenticated
  USING (tenant_id = get_current_tenant_id() AND deleted_at IS NULL);

CREATE POLICY "assets_insert_own_tenant"
  ON public.assets FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id = get_current_tenant_id()
    AND get_current_user_role() IN ('admin', 'member')
  );

CREATE POLICY "assets_update_own_tenant"
  ON public.assets FOR UPDATE
  TO authenticated
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "assets_delete_own_tenant"
  ON public.assets FOR DELETE
  TO authenticated
  USING (
    tenant_id = get_current_tenant_id()
    AND get_current_user_role() = 'admin'
  );


-- -------------------- tokens --------------------

CREATE POLICY "tokens_select_own_tenant"
  ON public.tokens FOR SELECT
  TO authenticated
  USING (tenant_id = get_current_tenant_id() AND deleted_at IS NULL);

CREATE POLICY "tokens_insert_own_tenant"
  ON public.tokens FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id = get_current_tenant_id()
    AND get_current_user_role() IN ('admin', 'member')
  );

CREATE POLICY "tokens_update_own_tenant"
  ON public.tokens FOR UPDATE
  TO authenticated
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "tokens_delete_own_tenant"
  ON public.tokens FOR DELETE
  TO authenticated
  USING (
    tenant_id = get_current_tenant_id()
    AND get_current_user_role() IN ('admin', 'member')
  );


-- -------------------- revisions --------------------

CREATE POLICY "revisions_select_own_tenant"
  ON public.revisions FOR SELECT
  TO authenticated
  USING (tenant_id = get_current_tenant_id() AND deleted_at IS NULL);

-- INSERT: must be own tenant AND deliverable must belong to same tenant
-- This prevents cross-tenant deliverable reference attacks
CREATE POLICY "revisions_insert_own_tenant"
  ON public.revisions FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id = get_current_tenant_id()
    AND deliverable_id IN (
      SELECT id FROM public.deliverables
      WHERE tenant_id = get_current_tenant_id()
    )
  );

CREATE POLICY "revisions_update_own_tenant"
  ON public.revisions FOR UPDATE
  TO authenticated
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

-- No DELETE policy (service role only)


-- -------------------- approval_workflow --------------------

CREATE POLICY "approval_workflow_select_own_tenant"
  ON public.approval_workflow FOR SELECT
  TO authenticated
  USING (tenant_id = get_current_tenant_id() AND deleted_at IS NULL);

-- INSERT: reviewer and deliverable must belong to same tenant
CREATE POLICY "approval_workflow_insert_own_tenant"
  ON public.approval_workflow FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id = get_current_tenant_id()
    AND reviewer_id IN (
      SELECT id FROM public.users
      WHERE tenant_id = get_current_tenant_id()
    )
    AND deliverable_id IN (
      SELECT id FROM public.deliverables
      WHERE tenant_id = get_current_tenant_id()
    )
  );

-- No UPDATE policy (append-only log)
-- No DELETE policy (service role only)


-- =============================================================
-- SECTION 4: TENANT-SCOPED READ-ONLY TABLES
-- These tables are written to by server-side pipelines (service role)
-- and read by authenticated users for their own tenant.
-- =============================================================

-- -------------------- ai_api_logs --------------------
-- Read-only for authenticated users. Writes via service role only.

CREATE POLICY "ai_api_logs_select_own_tenant"
  ON public.ai_api_logs FOR SELECT
  TO authenticated
  USING (tenant_id = get_current_tenant_id());

-- No INSERT/UPDATE/DELETE policies (server-side AI pipeline uses service role)


-- -------------------- security_scan_results --------------------

CREATE POLICY "security_scan_results_select_own_tenant"
  ON public.security_scan_results FOR SELECT
  TO authenticated
  USING (tenant_id = get_current_tenant_id());

-- No INSERT/UPDATE/DELETE policies (server-side scanning pipeline uses service role)


-- -------------------- data_export_requests --------------------

CREATE POLICY "data_export_requests_select_own_tenant"
  ON public.data_export_requests FOR SELECT
  TO authenticated
  USING (tenant_id = get_current_tenant_id());

-- Only admins can request data exports (GDPR controller role)
CREATE POLICY "data_export_requests_insert_admin"
  ON public.data_export_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id = get_current_tenant_id()
    AND get_current_user_role() = 'admin'
  );

-- No UPDATE/DELETE policies (status managed by service role export pipeline)


-- =============================================================
-- SECTION 5: SYSTEM TABLES (DENY ALL FOR AUTHENTICATED)
-- These tables have RLS enabled but NO policies for authenticated role.
-- This means: authenticated users cannot read or write these tables.
-- Service role bypasses RLS and has full access.
-- =============================================================

-- system_health_checks: No policies = deny all for authenticated
-- rate_limit_events: No policies = deny all for authenticated
-- webhook_secrets: No policies = deny all for authenticated
-- deletion_audit: No policies = deny all for authenticated

-- (No policy statements needed -- RLS enabled with no policies = implicit deny)


COMMIT;
```

---

## 5. Migration 004: Indexes (Performance)

**File:** `supabase/migrations/20260305000004_create_indexes.sql`

```sql
-- =============================================================
-- Migration 004: Indexes
-- Brand System Service (Performance)
--
-- Creates indexes for:
-- - Foreign key columns (PostgreSQL does NOT auto-index FKs)
-- - Composite indexes for common query patterns
-- - Partial indexes for soft-deleted records
-- - GIN indexes for JSONB columns
--
-- Note: brand_profiles.tenant_id already has a UNIQUE constraint
-- which creates an implicit B-tree index, so no separate FK index needed.
--
-- Author: Dara (Data Engineer)
-- Date: 2026-03-05
-- =============================================================

BEGIN;

-- =============================================================
-- SECTION 1: FOREIGN KEY INDEXES
-- PostgreSQL does NOT auto-create indexes on FK columns.
-- These are critical for JOIN performance and CASCADE operations.
-- =============================================================

-- users
CREATE INDEX idx_users_tenant_id
  ON public.users(tenant_id);

-- deliverables
CREATE INDEX idx_deliverables_tenant_id
  ON public.deliverables(tenant_id);

-- assets
CREATE INDEX idx_assets_tenant_id
  ON public.assets(tenant_id);
CREATE INDEX idx_assets_deliverable_id
  ON public.assets(deliverable_id);

-- tokens
CREATE INDEX idx_tokens_tenant_id
  ON public.tokens(tenant_id);

-- revisions
CREATE INDEX idx_revisions_tenant_id
  ON public.revisions(tenant_id);
CREATE INDEX idx_revisions_deliverable_id
  ON public.revisions(deliverable_id);
CREATE INDEX idx_revisions_requested_by
  ON public.revisions(requested_by);

-- approval_workflow
CREATE INDEX idx_approval_tenant_id
  ON public.approval_workflow(tenant_id);
CREATE INDEX idx_approval_deliverable_id
  ON public.approval_workflow(deliverable_id);
CREATE INDEX idx_approval_reviewer_id
  ON public.approval_workflow(reviewer_id);

-- ai_api_logs
CREATE INDEX idx_ai_logs_tenant_id
  ON public.ai_api_logs(tenant_id);

-- security_scan_results
CREATE INDEX idx_scan_results_tenant_id
  ON public.security_scan_results(tenant_id);
CREATE INDEX idx_scan_results_asset_id
  ON public.security_scan_results(asset_id);

-- data_export_requests
CREATE INDEX idx_export_requests_tenant_id
  ON public.data_export_requests(tenant_id);

-- rate_limit_events
CREATE INDEX idx_rate_limit_user_id
  ON public.rate_limit_events(user_id);


-- =============================================================
-- SECTION 2: COMPOSITE INDEXES (Query-Pattern Driven)
-- Based on expected access patterns from PRD requirements.
-- =============================================================

-- Client Portal Dashboard: filter deliverables by tenant + status
-- Used by: FR-8.1 (Dashboard), FR-8.5 (Review Queue)
CREATE INDEX idx_deliverables_tenant_status
  ON public.deliverables(tenant_id, status);

-- Asset Center: filter deliverables by tenant + type
-- Used by: FR-8.8 (Asset Organization)
CREATE INDEX idx_deliverables_tenant_type
  ON public.deliverables(tenant_id, type);

-- Asset Download Center: filter by tenant + category
-- Used by: FR-8.3 (R2 storage), FR-8.8 (Asset Organization)
CREATE INDEX idx_assets_tenant_category
  ON public.assets(tenant_id, category);

-- Revision timeline per deliverable
-- Used by: FR-8.7 (Revision Management)
CREATE INDEX idx_revisions_deliverable_number
  ON public.revisions(deliverable_id, revision_number);

-- Approval activity timeline (latest first)
-- Used by: FR-8.5 (Review Queue), FR-8.1 (Client Portal)
CREATE INDEX idx_approval_deliverable_created
  ON public.approval_workflow(deliverable_id, created_at DESC);

-- AI cost tracking: per tenant over time
-- Used by: NFR-6.1 (AI API logging), NFR-4.2 (cost per client)
CREATE INDEX idx_ai_logs_tenant_created
  ON public.ai_api_logs(tenant_id, created_at);

-- AI cost aggregation by provider
-- Used by: NFR-4.2 (cost per client), FR-8.6 (Analytics Dashboard)
CREATE INDEX idx_ai_logs_tenant_provider
  ON public.ai_api_logs(tenant_id, provider);

-- Health checks: latest check per service
-- Used by: NFR-6.5 (System Health Dashboard)
CREATE INDEX idx_health_checks_service_time
  ON public.system_health_checks(service_name, checked_at DESC);

-- Rate limits: recent events per user
-- Used by: NFR-8.2 (Rate Limiting)
CREATE INDEX idx_rate_limit_user_created
  ON public.rate_limit_events(user_id, created_at DESC);

-- Webhook secrets: active secrets per endpoint
-- Used by: NFR-8.3 (HMAC Webhook Validation)
CREATE INDEX idx_webhook_active_endpoint
  ON public.webhook_secrets(endpoint_name)
  WHERE is_active = true;

-- Tokens: lookup by tenant + type (e.g., "all color tokens for tenant X")
-- Used by: FR-1.2 (Token Engine), Brand Book rendering
CREATE INDEX idx_tokens_tenant_type
  ON public.tokens(tenant_id, token_type);

-- Data export requests: status tracking per tenant
-- Used by: NFR-5.4 (GDPR compliance)
CREATE INDEX idx_export_requests_tenant_status
  ON public.data_export_requests(tenant_id, status);


-- =============================================================
-- SECTION 3: PARTIAL INDEXES (Soft Delete Optimization)
-- Queries almost always filter for non-deleted rows.
-- Partial indexes exclude deleted rows from the index.
-- =============================================================

-- Active tenants only (exclude offboarded/soft-deleted)
CREATE INDEX idx_tenants_active
  ON public.tenants(slug)
  WHERE deleted_at IS NULL AND status = 'active';

-- Active users only
CREATE INDEX idx_users_active_tenant
  ON public.users(tenant_id, role)
  WHERE deleted_at IS NULL;

-- Active deliverables by tenant + status
CREATE INDEX idx_deliverables_active_tenant_status
  ON public.deliverables(tenant_id, status)
  WHERE deleted_at IS NULL;

-- Active assets by tenant + category
CREATE INDEX idx_assets_active_tenant_category
  ON public.assets(tenant_id, category)
  WHERE deleted_at IS NULL;

-- Active tokens by tenant
CREATE INDEX idx_tokens_active_tenant
  ON public.tokens(tenant_id, token_path)
  WHERE deleted_at IS NULL;


-- =============================================================
-- SECTION 4: GIN INDEXES FOR JSONB COLUMNS
-- Enable efficient queries on JSONB contents (containment, key existence).
-- =============================================================

-- Brand profile personality scores
-- Example query: WHERE personality_scores @> '{"innovative": 5}'
CREATE INDEX idx_brand_profiles_personality_gin
  ON public.brand_profiles USING gin(personality_scores);

-- Tenant settings (feature flags, preferences)
-- Example query: WHERE settings @> '{"industry": "technology"}'
CREATE INDEX idx_tenants_settings_gin
  ON public.tenants USING gin(settings);

-- Deliverable metadata (type-specific fields)
-- Example query: WHERE metadata @> '{"platform": "instagram"}'
CREATE INDEX idx_deliverables_metadata_gin
  ON public.deliverables USING gin(metadata);

-- Token values (W3C DTCG structure)
-- Example query: WHERE token_value @> '{"$type": "color"}'
CREATE INDEX idx_tokens_value_gin
  ON public.tokens USING gin(token_value);

-- System health check details
CREATE INDEX idx_health_checks_details_gin
  ON public.system_health_checks USING gin(details);

-- Deletion audit data summary
CREATE INDEX idx_deletion_audit_summary_gin
  ON public.deletion_audit USING gin(data_summary);


COMMIT;
```

---

## 6. Migration 005: Seed Data

**File:** `supabase/migrations/20260305000005_seed_data.sql`

```sql
-- =============================================================
-- Migration 005: Seed Data
-- Brand System Service
--
-- Creates demonstration data for development/testing:
--   - 2 tenants (Acme Corp, Bloom Studio)
--   - 3 users per tenant (admin, member, viewer)
--   - 1 brand profile per tenant
--   - Sample deliverables, tokens, and workflow entries
--   - Webhook secrets for dev endpoints
--
-- IDEMPOTENT: Uses ON CONFLICT DO NOTHING throughout.
-- WARNING: auth.users inserts require service role or direct DB access.
--
-- Author: Dara (Data Engineer)
-- Date: 2026-03-05
-- =============================================================

BEGIN;

-- =============================================================
-- TENANTS
-- =============================================================

INSERT INTO public.tenants (id, slug, name, status, tier, settings)
VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'acme-corp',
    'Acme Corporation',
    'active',
    'tier2',
    '{"industry": "technology", "language": "en-US", "notifications": {"email": true, "slack": false}}'
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    'bloom-studio',
    'Bloom Creative Studio',
    'active',
    'tier3',
    '{"industry": "creative-agency", "language": "pt-BR", "notifications": {"email": true, "slack": true}}'
  )
ON CONFLICT (slug) DO NOTHING;


-- =============================================================
-- AUTH USERS (Supabase Auth layer)
-- NOTE: In production, auth.users are created via the Auth API.
-- For seed data, we insert directly (requires service role / direct DB access).
-- =============================================================

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES
  -- Acme users
  ('b0000000-0000-0000-0000-000000000001', 'alice@acme.com',    crypt('testpass123', gen_salt('bf')), now(), '{}', '{"name": "Alice Admin"}',  now(), now()),
  ('b0000000-0000-0000-0000-000000000002', 'bob@acme.com',      crypt('testpass123', gen_salt('bf')), now(), '{}', '{"name": "Bob Member"}',   now(), now()),
  ('b0000000-0000-0000-0000-000000000003', 'carol@acme.com',    crypt('testpass123', gen_salt('bf')), now(), '{}', '{"name": "Carol Viewer"}',  now(), now()),
  -- Bloom users
  ('b0000000-0000-0000-0000-000000000004', 'diana@bloom.studio', crypt('testpass123', gen_salt('bf')), now(), '{}', '{"name": "Diana Admin"}',  now(), now()),
  ('b0000000-0000-0000-0000-000000000005', 'evan@bloom.studio',  crypt('testpass123', gen_salt('bf')), now(), '{}', '{"name": "Evan Member"}',  now(), now()),
  ('b0000000-0000-0000-0000-000000000006', 'fiona@bloom.studio', crypt('testpass123', gen_salt('bf')), now(), '{}', '{"name": "Fiona Viewer"}', now(), now())
ON CONFLICT (id) DO NOTHING;


-- =============================================================
-- APPLICATION USERS (public.users)
-- =============================================================

INSERT INTO public.users (id, tenant_id, email, role, name)
VALUES
  -- Acme: admin, member, viewer
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'alice@acme.com',     'admin',  'Alice Admin'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'bob@acme.com',       'member', 'Bob Member'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'carol@acme.com',     'viewer', 'Carol Viewer'),
  -- Bloom: admin, member, viewer
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'diana@bloom.studio', 'admin',  'Diana Admin'),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'evan@bloom.studio',  'member', 'Evan Member'),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', 'fiona@bloom.studio', 'viewer', 'Fiona Viewer')
ON CONFLICT (id) DO NOTHING;


-- =============================================================
-- BRAND PROFILES
-- =============================================================

INSERT INTO public.brand_profiles (id, tenant_id, personality_scores, visual_preferences, vocabulary, competitor_urls)
VALUES
  (
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    '{"innovative": 5, "formal": 2, "bold": 4, "playful": 3, "minimal": 4}',
    '{"style": "modern-tech", "mood": "dark-cockpit", "color_preference": "blue-accent"}',
    '{"approved": ["innovate", "accelerate", "scale", "optimize"], "forbidden": ["cheap", "basic", "simple"]}',
    ARRAY['https://stripe.com', 'https://vercel.com', 'https://linear.app']
  ),
  (
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000002',
    '{"innovative": 3, "formal": 1, "bold": 3, "playful": 5, "minimal": 2}',
    '{"style": "organic-warm", "mood": "earth-tones", "color_preference": "green-terracotta"}',
    '{"approved": ["create", "bloom", "inspire", "craft"], "forbidden": ["corporate", "aggressive", "disrupt"]}',
    ARRAY['https://pentagram.com', 'https://collins1.com']
  )
ON CONFLICT (tenant_id) DO NOTHING;


-- =============================================================
-- DELIVERABLES
-- =============================================================

INSERT INTO public.deliverables (id, tenant_id, type, title, status, version, metadata)
VALUES
  -- Acme deliverables
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'brand-book',   'Acme Brand Book v1',           'in-review', 1, '{"pages": 45, "format": "web+pdf"}'),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'logo-system',  'Acme Logo System',             'approved',  1, '{"variants": 8, "formats": ["svg", "png"]}'),
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'social-post',  'Instagram Feed Pack - March',  'draft',     1, '{"platform": "instagram", "count": 12}'),
  -- Bloom deliverables
  ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'brand-book',   'Bloom Brand Book v1',          'approved',  1, '{"pages": 62, "format": "web+pdf"}'),
  ('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'landing-page', 'Bloom Main Landing Page',      'in-review', 1, '{"url": "bloom-studio.brand.aioxsquad.ai", "sections": 8}')
ON CONFLICT (id) DO NOTHING;


-- =============================================================
-- TOKENS (W3C DTCG format samples)
-- =============================================================

INSERT INTO public.tokens (id, tenant_id, token_path, token_value, token_type, version)
VALUES
  -- Acme tokens: blue tech palette
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'color.primary.500',              '{"$value": "#3B82F6", "$type": "color"}',      'color',      '1.0.0'),
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'color.primary.700',              '{"$value": "#1D4ED8", "$type": "color"}',      'color',      '1.0.0'),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'typography.heading.fontFamily',  '{"$value": "Inter", "$type": "fontFamily"}',   'fontFamily', '1.0.0'),
  ('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'typography.body.fontFamily',     '{"$value": "Inter", "$type": "fontFamily"}',   'fontFamily', '1.0.0'),
  ('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'color.neutral.50',               '{"$value": "#F8FAFC", "$type": "color"}',      'color',      '1.0.0'),
  ('e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'color.neutral.900',              '{"$value": "#0F172A", "$type": "color"}',      'color',      '1.0.0'),
  -- Bloom tokens: organic warm palette
  ('e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000002', 'color.primary.500',              '{"$value": "#059669", "$type": "color"}',      'color',      '1.0.0'),
  ('e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000002', 'color.secondary.500',            '{"$value": "#D97706", "$type": "color"}',      'color',      '1.0.0'),
  ('e0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000002', 'typography.heading.fontFamily',  '{"$value": "DM Serif Display", "$type": "fontFamily"}', 'fontFamily', '1.0.0'),
  ('e0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000002', 'typography.body.fontFamily',     '{"$value": "DM Sans", "$type": "fontFamily"}', 'fontFamily', '1.0.0')
ON CONFLICT (tenant_id, token_path, version) DO NOTHING;


-- =============================================================
-- APPROVAL WORKFLOW (sample entries)
-- =============================================================

INSERT INTO public.approval_workflow (id, tenant_id, deliverable_id, reviewer_id, action, comment)
VALUES
  ('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'comment',          'Looking great! Minor tweak needed on color section.'),
  ('f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'approve',          'Logo system approved. All variants look professional.'),
  ('f0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'approve',          'Perfect. Ship it!'),
  ('f0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000004', 'request-changes',  'Need to adjust hero section copy and add testimonials.')
ON CONFLICT (id) DO NOTHING;


-- =============================================================
-- REVISIONS (sample)
-- =============================================================

INSERT INTO public.revisions (id, tenant_id, deliverable_id, revision_number, requested_by, changes_requested)
VALUES
  (
    'f1000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    1,
    'b0000000-0000-0000-0000-000000000001',
    ARRAY['Adjust primary blue to be darker', 'Add secondary color palette section']
  ),
  (
    'f1000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000005',
    1,
    'b0000000-0000-0000-0000-000000000004',
    ARRAY['Adjust hero section copy', 'Add client testimonials section', 'Increase CTA button size']
  )
ON CONFLICT (id) DO NOTHING;


-- =============================================================
-- WEBHOOK SECRETS (dev endpoints)
-- =============================================================

INSERT INTO public.webhook_secrets (id, endpoint_name, secret_hash, secret_version, is_active, expires_at)
VALUES
  (
    'f2000000-0000-0000-0000-000000000001',
    'payload-cms-revalidation',
    -- Hash of 'dev-secret-payload-cms' (in production, use proper bcrypt)
    crypt('dev-secret-payload-cms', gen_salt('bf')),
    1,
    true,
    now() + interval '90 days'
  ),
  (
    'f2000000-0000-0000-0000-000000000002',
    'resend-delivery-webhook',
    crypt('dev-secret-resend', gen_salt('bf')),
    1,
    true,
    now() + interval '90 days'
  )
ON CONFLICT (endpoint_name, secret_version) DO NOTHING;


COMMIT;
```

---

## 7. Migration 006: Functions & Triggers

**File:** `supabase/migrations/20260305000006_create_functions_and_triggers.sql`

```sql
-- =============================================================
-- Migration 006: Functions & Triggers
-- Brand System Service
--
-- Creates:
--   1. updated_at auto-update trigger function
--   2. Triggers on all tables with updated_at column
--   3. get_current_tenant_id() already created in Migration 003
--   4. Soft delete cascade utility function
--
-- Author: Dara (Data Engineer)
-- Date: 2026-03-05
-- =============================================================

BEGIN;

-- =============================================================
-- FUNCTION: trigger_set_updated_at
-- Purpose: Automatically set updated_at on row modification.
-- Applied to all tables that have an updated_at column.
-- =============================================================
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.trigger_set_updated_at IS 'Trigger function to auto-update the updated_at timestamp on row modification.';


-- =============================================================
-- Apply updated_at triggers to all tables with that column
-- =============================================================

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.brand_profiles
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.deliverables
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.tokens
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.revisions
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

-- Note: approval_workflow, ai_api_logs, system_health_checks,
-- rate_limit_events, security_scan_results, data_export_requests,
-- deletion_audit, and webhook_secrets are append-only tables
-- and do NOT have updated_at triggers.


-- =============================================================
-- FUNCTION: soft_delete_tenant_cascade
-- Purpose: When a tenant is soft-deleted, cascade soft delete to
--          all child records. Called by application code, not a trigger,
--          to maintain control over the cascade.
--
-- Usage: SELECT soft_delete_tenant_cascade('tenant-uuid-here');
--
-- NOTE: This does NOT permanently delete data. It sets deleted_at
--       on all tenant-owned records. Permanent deletion happens
--       via a separate scheduled job after the 7-day grace period.
-- =============================================================
CREATE OR REPLACE FUNCTION public.soft_delete_tenant_cascade(p_tenant_id uuid)
RETURNS jsonb AS $$
DECLARE
  result jsonb := '{}';
  affected_count integer;
BEGIN
  -- Soft delete the tenant
  UPDATE public.tenants
  SET deleted_at = now(), offboarded_at = COALESCE(offboarded_at, now())
  WHERE id = p_tenant_id AND deleted_at IS NULL;
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  result := result || jsonb_build_object('tenants', affected_count);

  -- Cascade to users
  UPDATE public.users SET deleted_at = now()
  WHERE tenant_id = p_tenant_id AND deleted_at IS NULL;
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  result := result || jsonb_build_object('users', affected_count);

  -- Cascade to brand_profiles
  UPDATE public.brand_profiles SET deleted_at = now()
  WHERE tenant_id = p_tenant_id AND deleted_at IS NULL;
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  result := result || jsonb_build_object('brand_profiles', affected_count);

  -- Cascade to deliverables
  UPDATE public.deliverables SET deleted_at = now()
  WHERE tenant_id = p_tenant_id AND deleted_at IS NULL;
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  result := result || jsonb_build_object('deliverables', affected_count);

  -- Cascade to assets
  UPDATE public.assets SET deleted_at = now()
  WHERE tenant_id = p_tenant_id AND deleted_at IS NULL;
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  result := result || jsonb_build_object('assets', affected_count);

  -- Cascade to tokens
  UPDATE public.tokens SET deleted_at = now()
  WHERE tenant_id = p_tenant_id AND deleted_at IS NULL;
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  result := result || jsonb_build_object('tokens', affected_count);

  -- Cascade to revisions
  UPDATE public.revisions SET deleted_at = now()
  WHERE tenant_id = p_tenant_id AND deleted_at IS NULL;
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  result := result || jsonb_build_object('revisions', affected_count);

  -- Cascade to approval_workflow
  UPDATE public.approval_workflow SET deleted_at = now()
  WHERE tenant_id = p_tenant_id AND deleted_at IS NULL;
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  result := result || jsonb_build_object('approval_workflow', affected_count);

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only service role should call this function
REVOKE EXECUTE ON FUNCTION public.soft_delete_tenant_cascade FROM public;
REVOKE EXECUTE ON FUNCTION public.soft_delete_tenant_cascade FROM anon;
REVOKE EXECUTE ON FUNCTION public.soft_delete_tenant_cascade FROM authenticated;

COMMENT ON FUNCTION public.soft_delete_tenant_cascade IS 'Soft-deletes a tenant and all child records. Returns JSON with affected row counts. Service role only.';


-- =============================================================
-- FUNCTION: get_tenant_data_summary
-- Purpose: Generate data summary for deletion_audit before permanent delete.
-- Returns counts of all tenant-owned records for audit trail.
--
-- Usage: SELECT get_tenant_data_summary('tenant-uuid-here');
-- =============================================================
CREATE OR REPLACE FUNCTION public.get_tenant_data_summary(p_tenant_id uuid)
RETURNS jsonb AS $$
DECLARE
  summary jsonb;
BEGIN
  SELECT jsonb_build_object(
    'users',          (SELECT count(*) FROM public.users WHERE tenant_id = p_tenant_id),
    'brand_profiles', (SELECT count(*) FROM public.brand_profiles WHERE tenant_id = p_tenant_id),
    'deliverables',   (SELECT count(*) FROM public.deliverables WHERE tenant_id = p_tenant_id),
    'assets',         (SELECT count(*) FROM public.assets WHERE tenant_id = p_tenant_id),
    'tokens',         (SELECT count(*) FROM public.tokens WHERE tenant_id = p_tenant_id),
    'revisions',      (SELECT count(*) FROM public.revisions WHERE tenant_id = p_tenant_id),
    'approvals',      (SELECT count(*) FROM public.approval_workflow WHERE tenant_id = p_tenant_id),
    'ai_api_logs',    (SELECT count(*) FROM public.ai_api_logs WHERE tenant_id = p_tenant_id),
    'scan_results',   (SELECT count(*) FROM public.security_scan_results WHERE tenant_id = p_tenant_id),
    'export_requests',(SELECT count(*) FROM public.data_export_requests WHERE tenant_id = p_tenant_id),
    'storage_bytes',  (SELECT COALESCE(sum(file_size), 0) FROM public.assets WHERE tenant_id = p_tenant_id)
  ) INTO summary;

  RETURN summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION public.get_tenant_data_summary FROM public;
REVOKE EXECUTE ON FUNCTION public.get_tenant_data_summary FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_tenant_data_summary FROM authenticated;

COMMENT ON FUNCTION public.get_tenant_data_summary IS 'Generates data summary counts for a tenant. Used before permanent deletion to populate deletion_audit.data_summary.';


COMMIT;
```

---

## 8. Rollback Plans

### 8.1 Rollback Migration 006 (Functions & Triggers)

```sql
-- rollback/20260305000006_rollback.sql
BEGIN;

-- Drop triggers (must drop before function)
DROP TRIGGER IF EXISTS set_updated_at ON public.tenants;
DROP TRIGGER IF EXISTS set_updated_at ON public.users;
DROP TRIGGER IF EXISTS set_updated_at ON public.brand_profiles;
DROP TRIGGER IF EXISTS set_updated_at ON public.deliverables;
DROP TRIGGER IF EXISTS set_updated_at ON public.assets;
DROP TRIGGER IF EXISTS set_updated_at ON public.tokens;
DROP TRIGGER IF EXISTS set_updated_at ON public.revisions;

-- Drop functions
DROP FUNCTION IF EXISTS public.trigger_set_updated_at();
DROP FUNCTION IF EXISTS public.soft_delete_tenant_cascade(uuid);
DROP FUNCTION IF EXISTS public.get_tenant_data_summary(uuid);

COMMIT;
```

### 8.2 Rollback Migration 005 (Seed Data)

```sql
-- rollback/20260305000005_rollback.sql
-- WARNING: This deletes seed data only. Safe for dev/staging.
BEGIN;

DELETE FROM public.approval_workflow WHERE id IN (
  'f0000000-0000-0000-0000-000000000001',
  'f0000000-0000-0000-0000-000000000002',
  'f0000000-0000-0000-0000-000000000003',
  'f0000000-0000-0000-0000-000000000004'
);
DELETE FROM public.revisions WHERE id IN (
  'f1000000-0000-0000-0000-000000000001',
  'f1000000-0000-0000-0000-000000000002'
);
DELETE FROM public.webhook_secrets WHERE id IN (
  'f2000000-0000-0000-0000-000000000001',
  'f2000000-0000-0000-0000-000000000002'
);
DELETE FROM public.tokens WHERE id LIKE 'e0000000-0000-0000-0000-%';
DELETE FROM public.deliverables WHERE id LIKE 'd0000000-0000-0000-0000-%';
DELETE FROM public.brand_profiles WHERE id LIKE 'c0000000-0000-0000-0000-%';
DELETE FROM public.users WHERE id LIKE 'b0000000-0000-0000-0000-%';
DELETE FROM auth.users WHERE id LIKE 'b0000000-0000-0000-0000-%';
DELETE FROM public.tenants WHERE id LIKE 'a0000000-0000-0000-0000-%';

COMMIT;
```

### 8.3 Rollback Migration 004 (Indexes)

```sql
-- rollback/20260305000004_rollback.sql
BEGIN;

-- FK indexes
DROP INDEX IF EXISTS idx_users_tenant_id;
DROP INDEX IF EXISTS idx_deliverables_tenant_id;
DROP INDEX IF EXISTS idx_assets_tenant_id;
DROP INDEX IF EXISTS idx_assets_deliverable_id;
DROP INDEX IF EXISTS idx_tokens_tenant_id;
DROP INDEX IF EXISTS idx_revisions_tenant_id;
DROP INDEX IF EXISTS idx_revisions_deliverable_id;
DROP INDEX IF EXISTS idx_revisions_requested_by;
DROP INDEX IF EXISTS idx_approval_tenant_id;
DROP INDEX IF EXISTS idx_approval_deliverable_id;
DROP INDEX IF EXISTS idx_approval_reviewer_id;
DROP INDEX IF EXISTS idx_ai_logs_tenant_id;
DROP INDEX IF EXISTS idx_scan_results_tenant_id;
DROP INDEX IF EXISTS idx_scan_results_asset_id;
DROP INDEX IF EXISTS idx_export_requests_tenant_id;
DROP INDEX IF EXISTS idx_rate_limit_user_id;

-- Composite indexes
DROP INDEX IF EXISTS idx_deliverables_tenant_status;
DROP INDEX IF EXISTS idx_deliverables_tenant_type;
DROP INDEX IF EXISTS idx_assets_tenant_category;
DROP INDEX IF EXISTS idx_revisions_deliverable_number;
DROP INDEX IF EXISTS idx_approval_deliverable_created;
DROP INDEX IF EXISTS idx_ai_logs_tenant_created;
DROP INDEX IF EXISTS idx_ai_logs_tenant_provider;
DROP INDEX IF EXISTS idx_health_checks_service_time;
DROP INDEX IF EXISTS idx_rate_limit_user_created;
DROP INDEX IF EXISTS idx_webhook_active_endpoint;
DROP INDEX IF EXISTS idx_tokens_tenant_type;
DROP INDEX IF EXISTS idx_export_requests_tenant_status;

-- Partial indexes
DROP INDEX IF EXISTS idx_tenants_active;
DROP INDEX IF EXISTS idx_users_active_tenant;
DROP INDEX IF EXISTS idx_deliverables_active_tenant_status;
DROP INDEX IF EXISTS idx_assets_active_tenant_category;
DROP INDEX IF EXISTS idx_tokens_active_tenant;

-- GIN indexes
DROP INDEX IF EXISTS idx_brand_profiles_personality_gin;
DROP INDEX IF EXISTS idx_tenants_settings_gin;
DROP INDEX IF EXISTS idx_deliverables_metadata_gin;
DROP INDEX IF EXISTS idx_tokens_value_gin;
DROP INDEX IF EXISTS idx_health_checks_details_gin;
DROP INDEX IF EXISTS idx_deletion_audit_summary_gin;

COMMIT;
```

### 8.4 Rollback Migration 003 (RLS Policies)

```sql
-- rollback/20260305000003_rollback.sql
BEGIN;

-- Drop all policies dynamically
DO $$
DECLARE
  tbl text;
  pol record;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'tenants', 'users', 'brand_profiles', 'deliverables', 'assets',
    'tokens', 'revisions', 'approval_workflow', 'ai_api_logs',
    'security_scan_results', 'data_export_requests',
    'system_health_checks', 'rate_limit_events', 'webhook_secrets', 'deletion_audit'
  ])
  LOOP
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = tbl AND schemaname = 'public'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, tbl);
    END LOOP;
    EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', tbl);
  END LOOP;
END;
$$;

-- Drop helper functions
DROP FUNCTION IF EXISTS public.get_current_user_role();
DROP FUNCTION IF EXISTS public.get_current_tenant_id();
DROP FUNCTION IF EXISTS public.custom_access_token_hook(jsonb);

COMMIT;
```

### 8.5 Rollback Migration 002 (Extended Tables)

```sql
-- rollback/20260305000002_rollback.sql
-- WARNING: Destroys all data in extended tables. Dev/staging only.
BEGIN;

DROP TABLE IF EXISTS public.deletion_audit CASCADE;
DROP TABLE IF EXISTS public.data_export_requests CASCADE;
DROP TABLE IF EXISTS public.security_scan_results CASCADE;
DROP TABLE IF EXISTS public.webhook_secrets CASCADE;
DROP TABLE IF EXISTS public.rate_limit_events CASCADE;
DROP TABLE IF EXISTS public.system_health_checks CASCADE;
DROP TABLE IF EXISTS public.ai_api_logs CASCADE;

COMMIT;
```

### 8.6 Rollback Migration 001 (Enums & Core Tables)

```sql
-- rollback/20260305000001_rollback.sql
-- WARNING: Destroys ALL data. Only use in development/staging.
BEGIN;

-- Drop core tables (order matters for FK dependencies)
DROP TABLE IF EXISTS public.approval_workflow CASCADE;
DROP TABLE IF EXISTS public.revisions CASCADE;
DROP TABLE IF EXISTS public.tokens CASCADE;
DROP TABLE IF EXISTS public.assets CASCADE;
DROP TABLE IF EXISTS public.deliverables CASCADE;
DROP TABLE IF EXISTS public.brand_profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.tenants CASCADE;

-- Drop all enum types
DROP TYPE IF EXISTS deletion_reason;
DROP TYPE IF EXISTS export_status;
DROP TYPE IF EXISTS scan_verdict;
DROP TYPE IF EXISTS ai_call_status;
DROP TYPE IF EXISTS ai_provider;
DROP TYPE IF EXISTS ai_agent_type;
DROP TYPE IF EXISTS approval_action;
DROP TYPE IF EXISTS asset_category;
DROP TYPE IF EXISTS deliverable_status;
DROP TYPE IF EXISTS deliverable_type;
DROP TYPE IF EXISTS user_role;
DROP TYPE IF EXISTS tenant_tier;
DROP TYPE IF EXISTS tenant_status;

COMMIT;
```

---

## Execution Order

Apply migrations in sequential order:

```bash
# 1. Enums + Core Tables
psql $DATABASE_URL -f supabase/migrations/20260305000001_create_enums_and_core_tables.sql

# 2. Extended Tables (monitoring, security, GDPR)
psql $DATABASE_URL -f supabase/migrations/20260305000002_create_extended_tables.sql

# 3. Functions & Triggers (must come before RLS since RLS uses helper functions)
# NOTE: Migration 006 is applied BEFORE 003 in practice because the RLS migration
# references get_current_tenant_id() which is created in Migration 003's own body.
# However, the updated_at trigger and soft_delete functions are independent.
psql $DATABASE_URL -f supabase/migrations/20260305000006_create_functions_and_triggers.sql

# 4. RLS Policies (creates helper functions + policies)
psql $DATABASE_URL -f supabase/migrations/20260305000003_create_rls_policies.sql

# 5. Indexes
psql $DATABASE_URL -f supabase/migrations/20260305000004_create_indexes.sql

# 6. Seed Data (dev/staging only)
psql $DATABASE_URL -f supabase/migrations/20260305000005_seed_data.sql
```

**For Supabase CLI**, migrations are applied in filename order automatically:

```bash
supabase db push
supabase migration list
```

---

## Summary

| Migration | Tables | Enums | Policies | Indexes | Functions |
|-----------|--------|-------|----------|---------|-----------|
| 001 | 8 core | 13 | -- | -- | -- |
| 002 | 7 extended | -- | -- | -- | -- |
| 003 | -- | -- | 22 policies | -- | 3 (auth hook, tenant helper, role helper) |
| 004 | -- | -- | -- | 37 total (16 FK + 12 composite + 5 partial + 6 GIN) | -- |
| 005 | -- | -- | -- | -- | -- (seed data) |
| 006 | -- | -- | -- | -- | 3 (updated_at trigger, soft_delete_cascade, data_summary) + 7 triggers |

**Total:** 15 tables, 13 enum types, 22 RLS policies, 37 indexes, 6 functions, 7 triggers.

---

*-- Dara, arquitetando dados*
