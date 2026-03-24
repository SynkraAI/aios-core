# Brand System Service - Database Schema Design

**Version:** 1.0
**Date:** 2026-03-05
**Author:** Dara (Data Engineer Agent)
**Source PRD:** `docs/prd-brand-system-service.md` (v1.1)
**Source Epics:** `docs/epics-brand-system-service.md` (v1.1)
**Stories:** BSS-1.2, BSS-1.3, BSS-1.4, BSS-1.7, BSS-1.8, BSS-1.9, BSS-1.10

---

## Table of Contents

1. [ERD (Entity Relationship Diagram)](#1-erd-entity-relationship-diagram)
2. [Enum Types](#2-enum-types)
3. [Core Schema (BSS-1.2)](#3-core-schema-bss-12--migration-principal)
4. [Extended Schema (BSS-1.7, 1.8, 1.9, 1.10)](#4-extended-schema)
5. [RLS Policies (BSS-1.3)](#5-rls-policies-bss-13)
6. [Indexes](#6-indexes)
7. [Seed Data](#7-seed-data)
8. [Migration Strategy](#8-migration-strategy)

---

## 1. ERD (Entity Relationship Diagram)

```mermaid
erDiagram
    %% ========== AUTH LAYER ==========
    auth_users {
        uuid id PK
        text email
    }

    %% ========== CORE TABLES (BSS-1.2) ==========
    tenants {
        uuid id PK
        text slug UK
        text name
        tenant_status status
        tenant_tier tier
        jsonb settings
        timestamptz offboarded_at
        timestamptz deleted_at
        timestamptz created_at
        timestamptz updated_at
    }

    users {
        uuid id PK "FK auth.users.id"
        uuid tenant_id FK
        text email
        user_role role
        text name
        text avatar_url
        timestamptz locked_until
        timestamptz deleted_at
        timestamptz created_at
        timestamptz updated_at
    }

    brand_profiles {
        uuid id PK
        uuid tenant_id FK_UK
        jsonb personality_scores
        jsonb visual_preferences
        jsonb vocabulary
        text[] competitor_urls
        text voice_guide_url
        text manifesto_url
        text[] moodboard_urls
        timestamptz deleted_at
        timestamptz created_at
        timestamptz updated_at
    }

    deliverables {
        uuid id PK
        uuid tenant_id FK
        deliverable_type type
        text title
        text description
        deliverable_status status
        integer version
        jsonb metadata
        timestamptz deleted_at
        timestamptz created_at
        timestamptz updated_at
    }

    assets {
        uuid id PK
        uuid tenant_id FK
        uuid deliverable_id FK
        text filename
        text r2_key UK
        text file_type
        bigint file_size
        asset_category category
        text checksum
        timestamptz deleted_at
        timestamptz created_at
        timestamptz updated_at
    }

    tokens {
        uuid id PK
        uuid tenant_id FK
        text token_path
        jsonb token_value
        text token_type
        text version
        timestamptz deleted_at
        timestamptz created_at
        timestamptz updated_at
    }

    revisions {
        uuid id PK
        uuid tenant_id FK
        uuid deliverable_id FK
        integer revision_number
        uuid requested_by FK
        timestamptz requested_at
        text[] changes_requested
        timestamptz resolved_at
        uuid resolved_by FK
        timestamptz deleted_at
        timestamptz created_at
    }

    approval_workflow {
        uuid id PK
        uuid tenant_id FK
        uuid deliverable_id FK
        uuid reviewer_id FK
        approval_action action
        text comment
        timestamptz deleted_at
        timestamptz created_at
    }

    %% ========== EXTENDED TABLES ==========
    ai_api_logs {
        uuid id PK
        uuid tenant_id FK
        ai_agent_type agent_type
        ai_provider provider
        text model
        integer input_tokens
        integer output_tokens
        numeric cost_usd
        integer latency_ms
        ai_call_status status
        text error_message
        timestamptz created_at
    }

    system_health_checks {
        uuid id PK
        text service_name
        text status
        jsonb details
        timestamptz checked_at
        timestamptz created_at
    }

    rate_limit_events {
        uuid id PK
        uuid user_id FK
        text endpoint
        text ip_address
        integer request_count
        text action_taken
        timestamptz created_at
    }

    webhook_secrets {
        uuid id PK
        text endpoint_name UK
        text secret_hash
        integer secret_version
        timestamptz rotated_at
        timestamptz expires_at
        timestamptz created_at
    }

    security_scan_results {
        uuid id PK
        uuid tenant_id FK
        uuid asset_id FK
        text scanner
        scan_verdict verdict
        text details
        timestamptz scanned_at
        timestamptz created_at
    }

    data_export_requests {
        uuid id PK
        uuid tenant_id FK
        uuid requested_by FK
        export_status status
        text r2_export_key
        timestamptz completed_at
        timestamptz expires_at
        timestamptz created_at
    }

    deletion_audit {
        uuid id PK
        uuid tenant_id "NOT FK - tenant deleted"
        text tenant_slug
        timestamptz deleted_at
        uuid deleted_by
        deletion_reason reason
        jsonb data_summary
        timestamptz created_at
    }

    %% ========== RELATIONSHIPS ==========
    tenants ||--o{ users : "has members"
    tenants ||--o| brand_profiles : "has brand"
    tenants ||--o{ deliverables : "owns"
    tenants ||--o{ assets : "stores"
    tenants ||--o{ tokens : "defines"
    tenants ||--o{ revisions : "tracks"
    tenants ||--o{ approval_workflow : "manages"
    tenants ||--o{ ai_api_logs : "generates"
    tenants ||--o{ security_scan_results : "scans"
    tenants ||--o{ data_export_requests : "exports"

    auth_users ||--|| users : "extends"
    users ||--o{ revisions : "requests"
    users ||--o{ approval_workflow : "reviews"
    users ||--o{ rate_limit_events : "triggers"
    users ||--o{ data_export_requests : "requests"

    deliverables ||--o{ assets : "contains"
    deliverables ||--o{ revisions : "has history"
    deliverables ||--o{ approval_workflow : "has reviews"

    assets ||--o{ security_scan_results : "scanned"
```

---

## 2. Enum Types

```sql
-- Tenant status lifecycle
CREATE TYPE tenant_status AS ENUM ('active', 'suspended', 'offboarded');

-- Service tier pricing
CREATE TYPE tenant_tier AS ENUM ('tier1', 'tier2', 'tier3');

-- User roles within a tenant (RBAC)
CREATE TYPE user_role AS ENUM ('admin', 'member', 'viewer');

-- Types of deliverables produced by the service
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

-- Approval workflow actions
CREATE TYPE approval_action AS ENUM ('approve', 'request-changes', 'comment');

-- AI agent types for cost tracking (BSS-1.10)
CREATE TYPE ai_agent_type AS ENUM ('copy-generation', 'image-generation', 'voice-synthesis');

-- AI provider tracking (BSS-1.10)
CREATE TYPE ai_provider AS ENUM ('anthropic', 'openai', 'replicate', 'elevenlabs');

-- AI call status (BSS-1.10)
CREATE TYPE ai_call_status AS ENUM ('success', 'failure', 'timeout');

-- Security scan verdict (BSS-1.8)
CREATE TYPE scan_verdict AS ENUM ('clean', 'infected', 'error');

-- Data export status (BSS-1.9)
CREATE TYPE export_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'expired');

-- Deletion reason (BSS-1.9)
CREATE TYPE deletion_reason AS ENUM ('gdpr-request', 'non-payment', 'abuse', 'other');
```

---

## 3. Core Schema (BSS-1.2 -- Migration Principal)

Migration file: `supabase/migrations/YYYYMMDDHHMMSS_create_core_schema.sql`

### 3.1 tenants

Stores client organizations. Root of all multi-tenant relationships.

```sql
-- =============================================================
-- TABLE: tenants
-- Purpose: Client organizations. Root of multi-tenant hierarchy.
-- PRD Refs: FR-1.12 (multi-tenant), FR-8.2 Phase 5 (tenant setup)
-- =============================================================
CREATE TABLE public.tenants (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL,
  name        text NOT NULL,
  status      tenant_status NOT NULL DEFAULT 'active',
  tier        tenant_tier NOT NULL DEFAULT 'tier1',
  settings    jsonb NOT NULL DEFAULT '{}',
  offboarded_at timestamptz,           -- BSS-1.9: soft delete timestamp
  deleted_at  timestamptz,             -- BSS-1.9: GDPR soft delete
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT tenants_slug_unique UNIQUE (slug),
  CONSTRAINT tenants_slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$')
);

COMMENT ON TABLE public.tenants IS 'Client organizations. Each tenant maps to a subdomain (slug.brand.aioxsquad.ai).';
COMMENT ON COLUMN public.tenants.slug IS 'URL-safe identifier for subdomain routing. Lowercase alphanumeric + hyphens.';
COMMENT ON COLUMN public.tenants.settings IS 'Tenant-specific configuration (notification prefs, feature flags, etc.)';
COMMENT ON COLUMN public.tenants.offboarded_at IS 'When tenant requested offboarding. Permanent delete after 7 days.';
```

### 3.2 users

Application profile extending Supabase auth.users.

```sql
-- =============================================================
-- TABLE: users
-- Purpose: Application user profiles linked to Supabase Auth.
-- PRD Refs: NFR-5.1 (Supabase Auth magic link)
-- =============================================================
CREATE TABLE public.users (
  id          uuid PRIMARY KEY,         -- FK to auth.users.id, NOT auto-generated
  tenant_id   uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  email       text NOT NULL,
  role        user_role NOT NULL DEFAULT 'member',
  name        text NOT NULL,
  avatar_url  text,
  locked_until timestamptz,             -- BSS-1.8: rate limit lockout
  deleted_at  timestamptz,              -- BSS-1.9: GDPR soft delete
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT users_auth_fk FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT users_tenant_email_unique UNIQUE (tenant_id, email)
);

COMMENT ON TABLE public.users IS 'Application user profiles. Extends auth.users with tenant association and role.';
COMMENT ON COLUMN public.users.id IS 'Same UUID as auth.users.id. One-to-one mapping.';
COMMENT ON COLUMN public.users.locked_until IS 'Account locked until this time due to rate limit abuse (BSS-1.8).';
```

### 3.3 brand_profiles

One brand profile per tenant. Stores Brand Discovery Workshop outputs.

```sql
-- =============================================================
-- TABLE: brand_profiles
-- Purpose: Brand configuration per tenant from Brand Discovery Workshop.
-- PRD Refs: FR-1.1 (brand discovery), FR-8.2 Phase 2 (AI analysis)
-- =============================================================
CREATE TABLE public.brand_profiles (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL UNIQUE REFERENCES public.tenants(id) ON DELETE CASCADE,
  personality_scores  jsonb NOT NULL DEFAULT '{}',
  visual_preferences  jsonb NOT NULL DEFAULT '{}',
  vocabulary          jsonb NOT NULL DEFAULT '{"approved": [], "forbidden": []}',
  competitor_urls     text[] NOT NULL DEFAULT '{}',
  voice_guide_url     text,
  manifesto_url       text,
  moodboard_urls      text[] NOT NULL DEFAULT '{}',
  deleted_at          timestamptz,       -- BSS-1.9: GDPR soft delete
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.brand_profiles IS 'Brand identity configuration per tenant. One profile per tenant (1:1).';
COMMENT ON COLUMN public.brand_profiles.personality_scores IS 'Five-point scales from Brand Discovery Workshop. Example: {"innovative": 4, "formal": 2, "bold": 5}';
COMMENT ON COLUMN public.brand_profiles.vocabulary IS 'Approved and forbidden words. Structure: {"approved": ["innovate", ...], "forbidden": ["cheap", ...]}';
```

### 3.4 deliverables

Tracked work items per tenant. Polymorphic via type + metadata JSONB.

```sql
-- =============================================================
-- TABLE: deliverables
-- Purpose: All work items produced for a tenant (brand book, posts, etc.)
-- PRD Refs: FR-8.4 (version control), FR-8.5 (review queue), FR-8.7 (revisions)
-- =============================================================
CREATE TABLE public.deliverables (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  type        deliverable_type NOT NULL,
  title       text NOT NULL,
  description text,
  status      deliverable_status NOT NULL DEFAULT 'draft',
  version     integer NOT NULL DEFAULT 1,
  metadata    jsonb NOT NULL DEFAULT '{}',
  deleted_at  timestamptz,               -- BSS-1.9: GDPR soft delete
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT deliverables_version_positive CHECK (version > 0)
);

COMMENT ON TABLE public.deliverables IS 'All work items produced for a tenant. Type-specific data stored in metadata JSONB.';
COMMENT ON COLUMN public.deliverables.metadata IS 'Type-specific data. Example for social-post: {"platform": "instagram", "dimensions": "1080x1080", "layout": "quote"}';
COMMENT ON COLUMN public.deliverables.version IS 'Incrementing version number. Brand book uses semver in metadata; this is the DB sequence.';
```

### 3.5 assets

File metadata with R2 paths. Actual files live in Cloudflare R2.

```sql
-- =============================================================
-- TABLE: assets
-- Purpose: File metadata tracking. Files stored in Cloudflare R2.
-- PRD Refs: FR-8.3 (R2 storage), FR-8.8 (asset organization)
-- =============================================================
CREATE TABLE public.assets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  deliverable_id  uuid REFERENCES public.deliverables(id) ON DELETE SET NULL,
  filename        text NOT NULL,
  r2_key          text NOT NULL,
  file_type       text NOT NULL,        -- MIME type e.g. 'image/svg+xml'
  file_size       bigint NOT NULL,       -- bytes
  category        asset_category NOT NULL,
  checksum        text,                  -- SHA-256 for integrity verification
  deleted_at      timestamptz,           -- BSS-1.9: GDPR soft delete / BSS-1.7 AC-9
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT assets_r2_key_unique UNIQUE (r2_key),
  CONSTRAINT assets_file_size_positive CHECK (file_size > 0)
);

COMMENT ON TABLE public.assets IS 'File metadata for assets stored in Cloudflare R2. Path: r2://brand-assets/{tenant-id}/{category}/{filename}';
COMMENT ON COLUMN public.assets.r2_key IS 'Full path in R2 bucket. Example: {tenant-uuid}/brand-identity/logo-{uuid}.svg';
COMMENT ON COLUMN public.assets.checksum IS 'SHA-256 hash for integrity verification and deduplication.';
```

### 3.6 tokens

W3C DTCG design tokens stored per tenant with versioning.

```sql
-- =============================================================
-- TABLE: tokens
-- Purpose: W3C DTCG design tokens per tenant. Versioned per path.
-- PRD Refs: FR-1.2 (W3C DTCG format), CON-13 (code is source of truth)
-- =============================================================
CREATE TABLE public.tokens (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  token_path  text NOT NULL,            -- W3C DTCG path e.g. 'color.primary.500'
  token_value jsonb NOT NULL,           -- W3C DTCG value e.g. {"$value": "#3B82F6", "$type": "color"}
  token_type  text NOT NULL,            -- W3C DTCG type: color, dimension, fontFamily, etc.
  version     text NOT NULL DEFAULT '1.0.0',  -- semver
  deleted_at  timestamptz,              -- BSS-1.9: GDPR soft delete
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT tokens_tenant_path_version_unique UNIQUE (tenant_id, token_path, version)
);

COMMENT ON TABLE public.tokens IS 'Design tokens in W3C DTCG format. Versioned per tenant+path combination.';
COMMENT ON COLUMN public.tokens.token_path IS 'W3C DTCG token path. Examples: color.primary.500, typography.heading.fontFamily';
COMMENT ON COLUMN public.tokens.token_value IS 'W3C DTCG value object. Must contain $value and $type keys.';
```

### 3.7 revisions

Revision history per deliverable. Max 3 rounds per deliverable type (CON-14).

```sql
-- =============================================================
-- TABLE: revisions
-- Purpose: Revision history for deliverables. 3 rounds per type (CON-14).
-- PRD Refs: FR-8.7 (revision management), CON-14 (per deliverable type)
-- =============================================================
CREATE TABLE public.revisions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  deliverable_id    uuid NOT NULL REFERENCES public.deliverables(id) ON DELETE CASCADE,
  revision_number   integer NOT NULL,
  requested_by      uuid NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  requested_at      timestamptz NOT NULL DEFAULT now(),
  changes_requested text[] NOT NULL DEFAULT '{}',
  resolved_at       timestamptz,
  resolved_by       uuid REFERENCES public.users(id) ON DELETE SET NULL,
  deleted_at        timestamptz,         -- BSS-1.9: GDPR soft delete
  created_at        timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT revisions_number_positive CHECK (revision_number > 0),
  CONSTRAINT revisions_max_three CHECK (revision_number <= 3)
);

COMMENT ON TABLE public.revisions IS 'Revision rounds per deliverable. Max 3 rounds per deliverable type (CON-14).';
COMMENT ON COLUMN public.revisions.changes_requested IS 'Array of change descriptions submitted by client.';
```

### 3.8 approval_workflow

Review/approval actions on deliverables. Activity timeline.

```sql
-- =============================================================
-- TABLE: approval_workflow
-- Purpose: Approval actions (approve/request-changes/comment) on deliverables.
-- PRD Refs: FR-8.5 (review queue), FR-8.1 (client portal review)
-- =============================================================
CREATE TABLE public.approval_workflow (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  deliverable_id  uuid NOT NULL REFERENCES public.deliverables(id) ON DELETE CASCADE,
  reviewer_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  action          approval_action NOT NULL,
  comment         text,
  deleted_at      timestamptz,           -- BSS-1.9: GDPR soft delete
  created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.approval_workflow IS 'Approval workflow actions. Forms the activity timeline for each deliverable.';
```

### 3.9 updated_at Trigger

Automatic `updated_at` management.

```sql
-- =============================================================
-- FUNCTION: trigger_set_updated_at
-- Purpose: Automatically set updated_at on row modification.
-- =============================================================
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.brand_profiles
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.deliverables
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.tokens
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
```

---

## 4. Extended Schema

### 4.1 BSS-1.10: Monitoring Tables

Migration file: `supabase/migrations/YYYYMMDDHHMMSS_create_monitoring_tables.sql`

```sql
-- =============================================================
-- TABLE: ai_api_logs
-- Purpose: Log all AI API calls for cost tracking and debugging.
-- PRD Refs: NFR-6.1 (log all AI API calls), NFR-4.2 (cost per client)
-- =============================================================
CREATE TABLE public.ai_api_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  agent_type    ai_agent_type NOT NULL,
  provider      ai_provider NOT NULL,
  model         text NOT NULL,
  input_tokens  integer,
  output_tokens integer,
  cost_usd      numeric(10, 6) NOT NULL DEFAULT 0,
  latency_ms    integer NOT NULL,
  status        ai_call_status NOT NULL,
  error_message text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.ai_api_logs IS 'AI API call log for cost tracking per client. Write-heavy, append-only.';

-- =============================================================
-- TABLE: system_health_checks
-- Purpose: Periodic health check results for system dashboard.
-- PRD Refs: NFR-6.5 (system health dashboard)
-- =============================================================
CREATE TABLE public.system_health_checks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name  text NOT NULL,
  status        text NOT NULL,           -- 'healthy', 'degraded', 'down'
  details       jsonb NOT NULL DEFAULT '{}',
  response_ms   integer,
  checked_at    timestamptz NOT NULL DEFAULT now(),
  created_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.system_health_checks IS 'System health check results. No tenant_id (system-wide).';
```

### 4.2 BSS-1.8: Security Tables

Migration file: `supabase/migrations/YYYYMMDDHHMMSS_create_security_tables.sql`

```sql
-- =============================================================
-- TABLE: rate_limit_events
-- Purpose: Audit log of rate-limited/throttled requests.
-- PRD Refs: NFR-8.2 (rate limiting)
-- =============================================================
CREATE TABLE public.rate_limit_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES public.users(id) ON DELETE SET NULL,
  endpoint      text NOT NULL,
  ip_address    inet,
  request_count integer NOT NULL,
  action_taken  text NOT NULL,           -- 'throttled', 'locked', 'warned'
  created_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.rate_limit_events IS 'Audit log of rate-limited requests. No tenant_id (security system table).';

-- =============================================================
-- TABLE: webhook_secrets
-- Purpose: Per-endpoint HMAC secrets with rotation history.
-- PRD Refs: NFR-8.3 (HMAC webhook validation, 90-day rotation)
-- =============================================================
CREATE TABLE public.webhook_secrets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_name   text NOT NULL,
  secret_hash     text NOT NULL,          -- bcrypt hash of the actual secret
  secret_version  integer NOT NULL DEFAULT 1,
  is_active       boolean NOT NULL DEFAULT true,
  rotated_at      timestamptz,
  expires_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT webhook_secrets_endpoint_version_unique UNIQUE (endpoint_name, secret_version)
);

COMMENT ON TABLE public.webhook_secrets IS 'HMAC secrets for webhook validation. Supports versioned rotation (90-day cycle).';

-- =============================================================
-- TABLE: security_scan_results
-- Purpose: Malware scan results for uploaded files.
-- PRD Refs: NFR-5.5 (ClamAV malware scanning)
-- =============================================================
CREATE TABLE public.security_scan_results (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  asset_id    uuid REFERENCES public.assets(id) ON DELETE SET NULL,
  scanner     text NOT NULL DEFAULT 'clamav',
  verdict     scan_verdict NOT NULL,
  details     text,
  scanned_at  timestamptz NOT NULL DEFAULT now(),
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.security_scan_results IS 'Malware scan results for uploaded assets. Infected files are quarantined.';
```

### 4.3 BSS-1.9: GDPR Tables

Migration file: `supabase/migrations/YYYYMMDDHHMMSS_create_gdpr_tables.sql`

```sql
-- =============================================================
-- TABLE: data_export_requests
-- Purpose: Track GDPR data export jobs.
-- PRD Refs: NFR-5.4 (GDPR data export)
-- =============================================================
CREATE TABLE public.data_export_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  requested_by  uuid NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  status        export_status NOT NULL DEFAULT 'pending',
  r2_export_key text,                    -- R2 path to generated ZIP
  file_size     bigint,                  -- ZIP size in bytes
  completed_at  timestamptz,
  expires_at    timestamptz,             -- Signed URL expiry (7 days)
  created_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.data_export_requests IS 'GDPR Article 15/20 data export job queue. ZIP download via signed R2 URL.';

-- =============================================================
-- TABLE: deletion_audit
-- Purpose: Permanent audit trail of tenant deletions. NEVER deleted.
-- PRD Refs: NFR-5.4 (GDPR deletion audit trail)
-- =============================================================
CREATE TABLE public.deletion_audit (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL,            -- NOT a FK - tenant is deleted
  tenant_slug   text NOT NULL,
  deleted_at    timestamptz NOT NULL DEFAULT now(),
  deleted_by    uuid,                     -- Admin user UUID, nullable for auto-delete
  reason        deletion_reason NOT NULL,
  data_summary  jsonb NOT NULL DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.deletion_audit IS 'Permanent record of tenant deletions. NEVER deleted. Retained 7+ years for GDPR compliance.';
COMMENT ON COLUMN public.deletion_audit.tenant_id IS 'UUID of deleted tenant. NOT a foreign key since tenant no longer exists.';
COMMENT ON COLUMN public.deletion_audit.data_summary IS 'Counts at deletion time. Example: {"users": 3, "deliverables": 15, "assets": 120, "storage_bytes": 524288000}';
```

---

## 5. RLS Policies (BSS-1.3)

Migration file: `supabase/migrations/YYYYMMDDHHMMSS_create_rls_policies.sql`

### 5.1 JWT Claim Architecture

Tenant isolation relies on the `tenant_id` claim in the Supabase Auth JWT. This claim is injected via a custom Supabase Auth hook (database function) that fires on every token refresh.

```sql
-- =============================================================
-- FUNCTION: custom_access_token_hook
-- Purpose: Inject tenant_id into JWT claims for RLS.
-- This function is registered as a Supabase Auth hook.
-- =============================================================
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb AS $$
DECLARE
  claims jsonb;
  user_tenant_id uuid;
  user_role text;
BEGIN
  -- Get tenant_id and role from users table
  SELECT u.tenant_id, u.role::text INTO user_tenant_id, user_role
  FROM public.users u
  WHERE u.id = (event->>'user_id')::uuid;

  -- Build claims
  claims := event->'claims';
  claims := jsonb_set(claims, '{tenant_id}', to_jsonb(user_tenant_id::text));
  claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));

  -- Return modified event
  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to supabase_auth_admin (required for Auth hooks)
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM public;
```

**JWT Claim Path:** `auth.jwt() ->> 'tenant_id'` returns the tenant UUID as text. Cast to `::uuid` for comparison with UUID columns.

**Service Role Bypass:** When using the `SUPABASE_SERVICE_ROLE_KEY`, ALL RLS policies are bypassed. This is necessary for admin operations, background jobs, and tenant setup. NEVER expose the service role key to client-side code.

### 5.2 Helper Functions

```sql
-- =============================================================
-- FUNCTION: get_current_tenant_id
-- Purpose: Extract tenant_id from JWT. Used in RLS policies.
-- =============================================================
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS uuid AS $$
BEGIN
  RETURN (auth.jwt() ->> 'tenant_id')::uuid;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- =============================================================
-- FUNCTION: get_current_user_role
-- Purpose: Extract user_role from JWT. Used in RLS policies.
-- =============================================================
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text AS $$
BEGIN
  RETURN auth.jwt() ->> 'user_role';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
```

### 5.3 RLS Policies per Table

#### tenants

```sql
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Users can only see their own tenant
CREATE POLICY "tenants_select_own"
  ON public.tenants FOR SELECT
  TO authenticated
  USING (id = get_current_tenant_id());

-- Only service role can INSERT/UPDATE/DELETE tenants
-- No authenticated user policies for write operations
```

#### users

```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can see other users in their tenant
CREATE POLICY "users_select_same_tenant"
  ON public.users FOR SELECT
  TO authenticated
  USING (tenant_id = get_current_tenant_id());

-- Users can only be created for their own tenant (onboarding)
CREATE POLICY "users_insert_own_tenant"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = get_current_tenant_id());

-- Users can only update their own profile
CREATE POLICY "users_update_own_profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND tenant_id = get_current_tenant_id());

-- No DELETE policy for authenticated users (service role only)
```

#### brand_profiles

```sql
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brand_profiles_select_own_tenant"
  ON public.brand_profiles FOR SELECT
  TO authenticated
  USING (tenant_id = get_current_tenant_id());

CREATE POLICY "brand_profiles_insert_own_tenant"
  ON public.brand_profiles FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "brand_profiles_update_own_tenant"
  ON public.brand_profiles FOR UPDATE
  TO authenticated
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

-- No DELETE policy (service role only for tenant offboarding)
```

#### deliverables

```sql
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deliverables_select_own_tenant"
  ON public.deliverables FOR SELECT
  TO authenticated
  USING (tenant_id = get_current_tenant_id());

CREATE POLICY "deliverables_insert_own_tenant"
  ON public.deliverables FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "deliverables_update_own_tenant"
  ON public.deliverables FOR UPDATE
  TO authenticated
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "deliverables_delete_own_tenant"
  ON public.deliverables FOR DELETE
  TO authenticated
  USING (tenant_id = get_current_tenant_id());
```

#### assets

```sql
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assets_select_own_tenant"
  ON public.assets FOR SELECT
  TO authenticated
  USING (tenant_id = get_current_tenant_id());

CREATE POLICY "assets_insert_own_tenant"
  ON public.assets FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "assets_update_own_tenant"
  ON public.assets FOR UPDATE
  TO authenticated
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "assets_delete_own_tenant"
  ON public.assets FOR DELETE
  TO authenticated
  USING (tenant_id = get_current_tenant_id());
```

#### tokens

```sql
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tokens_select_own_tenant"
  ON public.tokens FOR SELECT
  TO authenticated
  USING (tenant_id = get_current_tenant_id());

CREATE POLICY "tokens_insert_own_tenant"
  ON public.tokens FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "tokens_update_own_tenant"
  ON public.tokens FOR UPDATE
  TO authenticated
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "tokens_delete_own_tenant"
  ON public.tokens FOR DELETE
  TO authenticated
  USING (tenant_id = get_current_tenant_id());
```

#### revisions

```sql
ALTER TABLE public.revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "revisions_select_own_tenant"
  ON public.revisions FOR SELECT
  TO authenticated
  USING (tenant_id = get_current_tenant_id());

-- INSERT: must be own tenant AND deliverable must belong to same tenant
CREATE POLICY "revisions_insert_own_tenant"
  ON public.revisions FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id = get_current_tenant_id()
    AND deliverable_id IN (
      SELECT id FROM public.deliverables WHERE tenant_id = get_current_tenant_id()
    )
  );

CREATE POLICY "revisions_update_own_tenant"
  ON public.revisions FOR UPDATE
  TO authenticated
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

-- No DELETE policy (service role only)
```

#### approval_workflow

```sql
ALTER TABLE public.approval_workflow ENABLE ROW LEVEL SECURITY;

CREATE POLICY "approval_workflow_select_own_tenant"
  ON public.approval_workflow FOR SELECT
  TO authenticated
  USING (tenant_id = get_current_tenant_id());

-- INSERT: reviewer must be in same tenant, deliverable must be in same tenant
CREATE POLICY "approval_workflow_insert_own_tenant"
  ON public.approval_workflow FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id = get_current_tenant_id()
    AND reviewer_id IN (
      SELECT id FROM public.users WHERE tenant_id = get_current_tenant_id()
    )
    AND deliverable_id IN (
      SELECT id FROM public.deliverables WHERE tenant_id = get_current_tenant_id()
    )
  );

CREATE POLICY "approval_workflow_update_own_tenant"
  ON public.approval_workflow FOR UPDATE
  TO authenticated
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

-- No DELETE policy (service role only)
```

#### ai_api_logs

```sql
ALTER TABLE public.ai_api_logs ENABLE ROW LEVEL SECURITY;

-- Read-only for authenticated users (their own tenant's logs)
CREATE POLICY "ai_api_logs_select_own_tenant"
  ON public.ai_api_logs FOR SELECT
  TO authenticated
  USING (tenant_id = get_current_tenant_id());

-- INSERT via service role only (server-side AI pipeline writes logs)
-- No INSERT/UPDATE/DELETE policies for authenticated users
```

#### security_scan_results

```sql
ALTER TABLE public.security_scan_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "security_scan_results_select_own_tenant"
  ON public.security_scan_results FOR SELECT
  TO authenticated
  USING (tenant_id = get_current_tenant_id());

-- INSERT via service role only (server-side scanning pipeline)
```

#### data_export_requests

```sql
ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;

-- Users can see their own tenant's export requests
CREATE POLICY "data_export_requests_select_own_tenant"
  ON public.data_export_requests FOR SELECT
  TO authenticated
  USING (tenant_id = get_current_tenant_id());

-- Only admins can create export requests
CREATE POLICY "data_export_requests_insert_admin"
  ON public.data_export_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id = get_current_tenant_id()
    AND get_current_user_role() = 'admin'
  );
```

### 5.4 Tables WITHOUT RLS (System Tables)

The following tables do NOT have `tenant_id` and are NOT tenant-scoped. They are managed exclusively via service role:

| Table | Reason |
|-------|--------|
| `system_health_checks` | System-wide monitoring data |
| `rate_limit_events` | Security audit log (cross-tenant) |
| `webhook_secrets` | System infrastructure secrets |
| `deletion_audit` | Legal compliance records (tenant deleted) |

These tables still have RLS enabled with a restrictive default (deny all for authenticated), with access only via service role:

```sql
ALTER TABLE public.system_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deletion_audit ENABLE ROW LEVEL SECURITY;

-- No policies = deny all for authenticated role
-- Service role bypasses RLS for read/write access
```

---

## 6. Indexes

### 6.1 Primary Keys (automatic)

All tables use `uuid PRIMARY KEY` which creates a unique B-tree index automatically.

### 6.2 Foreign Key Indexes

PostgreSQL does NOT auto-create indexes on foreign key columns. These are critical for JOIN and CASCADE performance.

```sql
-- users
CREATE INDEX idx_users_tenant_id ON public.users(tenant_id);

-- brand_profiles (tenant_id already has unique constraint = index)

-- deliverables
CREATE INDEX idx_deliverables_tenant_id ON public.deliverables(tenant_id);

-- assets
CREATE INDEX idx_assets_tenant_id ON public.assets(tenant_id);
CREATE INDEX idx_assets_deliverable_id ON public.assets(deliverable_id);

-- tokens
CREATE INDEX idx_tokens_tenant_id ON public.tokens(tenant_id);

-- revisions
CREATE INDEX idx_revisions_tenant_id ON public.revisions(tenant_id);
CREATE INDEX idx_revisions_deliverable_id ON public.revisions(deliverable_id);
CREATE INDEX idx_revisions_requested_by ON public.revisions(requested_by);

-- approval_workflow
CREATE INDEX idx_approval_tenant_id ON public.approval_workflow(tenant_id);
CREATE INDEX idx_approval_deliverable_id ON public.approval_workflow(deliverable_id);
CREATE INDEX idx_approval_reviewer_id ON public.approval_workflow(reviewer_id);

-- ai_api_logs
CREATE INDEX idx_ai_logs_tenant_id ON public.ai_api_logs(tenant_id);

-- security_scan_results
CREATE INDEX idx_scan_results_tenant_id ON public.security_scan_results(tenant_id);
CREATE INDEX idx_scan_results_asset_id ON public.security_scan_results(asset_id);

-- data_export_requests
CREATE INDEX idx_export_requests_tenant_id ON public.data_export_requests(tenant_id);

-- rate_limit_events
CREATE INDEX idx_rate_limit_user_id ON public.rate_limit_events(user_id);
```

### 6.3 Composite Indexes (Query-Pattern Driven)

```sql
-- Deliverables: filter by tenant + status (Client Portal dashboard)
CREATE INDEX idx_deliverables_tenant_status
  ON public.deliverables(tenant_id, status);

-- Deliverables: filter by tenant + type (Asset center category filtering)
CREATE INDEX idx_deliverables_tenant_type
  ON public.deliverables(tenant_id, type);

-- Assets: filter by tenant + category (Asset download center)
CREATE INDEX idx_assets_tenant_category
  ON public.assets(tenant_id, category);

-- Revisions: deliverable activity timeline
CREATE INDEX idx_revisions_deliverable_number
  ON public.revisions(deliverable_id, revision_number);

-- Approval: deliverable activity timeline (latest first)
CREATE INDEX idx_approval_deliverable_created
  ON public.approval_workflow(deliverable_id, created_at DESC);

-- AI logs: cost tracking per tenant over time
CREATE INDEX idx_ai_logs_tenant_created
  ON public.ai_api_logs(tenant_id, created_at);

-- AI logs: cost aggregation by provider
CREATE INDEX idx_ai_logs_tenant_provider
  ON public.ai_api_logs(tenant_id, provider);

-- Health checks: latest check per service
CREATE INDEX idx_health_checks_service_time
  ON public.system_health_checks(service_name, checked_at DESC);

-- Rate limits: recent events per user
CREATE INDEX idx_rate_limit_user_created
  ON public.rate_limit_events(user_id, created_at DESC);

-- Webhook secrets: active secrets per endpoint
CREATE INDEX idx_webhook_active_endpoint
  ON public.webhook_secrets(endpoint_name, is_active)
  WHERE is_active = true;
```

### 6.4 Partial Indexes (Soft Delete)

For tables with soft delete, queries typically filter for non-deleted rows. Partial indexes avoid indexing deleted rows.

```sql
-- Active tenants only (exclude offboarded/soft-deleted)
CREATE INDEX idx_tenants_active
  ON public.tenants(slug)
  WHERE deleted_at IS NULL AND status = 'active';

-- Active deliverables only
CREATE INDEX idx_deliverables_active_tenant_status
  ON public.deliverables(tenant_id, status)
  WHERE deleted_at IS NULL;

-- Active assets only
CREATE INDEX idx_assets_active_tenant_category
  ON public.assets(tenant_id, category)
  WHERE deleted_at IS NULL;
```

---

## 7. Seed Data

File: `supabase/seed.sql`

```sql
-- =============================================================
-- SEED DATA: Development/Testing Environment
-- Creates 2 tenants, 3 users per tenant, 1 brand profile per tenant,
-- sample deliverables, assets, tokens, and workflow items.
-- IDEMPOTENT: Uses ON CONFLICT DO NOTHING.
-- =============================================================

-- ===================== TENANTS =====================

INSERT INTO public.tenants (id, slug, name, status, tier, settings)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'acme-corp', 'Acme Corporation', 'active', 'tier2', '{"industry": "technology", "language": "en-US"}'),
  ('a0000000-0000-0000-0000-000000000002', 'bloom-studio', 'Bloom Creative Studio', 'active', 'tier3', '{"industry": "creative-agency", "language": "pt-BR"}')
ON CONFLICT (slug) DO NOTHING;

-- ===================== AUTH USERS =====================
-- NOTE: In real Supabase, auth.users are created via Auth API.
-- For seed, we insert directly (requires service role / direct DB access).

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES
  -- Acme users
  ('b0000000-0000-0000-0000-000000000001', 'alice@acme.com', crypt('testpass123', gen_salt('bf')), now(), '{}', '{"name": "Alice Admin"}', now(), now()),
  ('b0000000-0000-0000-0000-000000000002', 'bob@acme.com', crypt('testpass123', gen_salt('bf')), now(), '{}', '{"name": "Bob Member"}', now(), now()),
  ('b0000000-0000-0000-0000-000000000003', 'carol@acme.com', crypt('testpass123', gen_salt('bf')), now(), '{}', '{"name": "Carol Viewer"}', now(), now()),
  -- Bloom users
  ('b0000000-0000-0000-0000-000000000004', 'diana@bloom.studio', crypt('testpass123', gen_salt('bf')), now(), '{}', '{"name": "Diana Admin"}', now(), now()),
  ('b0000000-0000-0000-0000-000000000005', 'evan@bloom.studio', crypt('testpass123', gen_salt('bf')), now(), '{}', '{"name": "Evan Member"}', now(), now()),
  ('b0000000-0000-0000-0000-000000000006', 'fiona@bloom.studio', crypt('testpass123', gen_salt('bf')), now(), '{}', '{"name": "Fiona Viewer"}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- ===================== APPLICATION USERS =====================

INSERT INTO public.users (id, tenant_id, email, role, name)
VALUES
  -- Acme: admin, member, viewer
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'alice@acme.com', 'admin', 'Alice Admin'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'bob@acme.com', 'member', 'Bob Member'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'carol@acme.com', 'viewer', 'Carol Viewer'),
  -- Bloom: admin, member, viewer
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'diana@bloom.studio', 'admin', 'Diana Admin'),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'evan@bloom.studio', 'member', 'Evan Member'),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', 'fiona@bloom.studio', 'viewer', 'Fiona Viewer')
ON CONFLICT (id) DO NOTHING;

-- ===================== BRAND PROFILES =====================

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

-- ===================== DELIVERABLES =====================

INSERT INTO public.deliverables (id, tenant_id, type, title, status, version, metadata)
VALUES
  -- Acme deliverables
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'brand-book', 'Acme Brand Book v1', 'in-review', 1, '{"pages": 45, "format": "web+pdf"}'),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'logo-system', 'Acme Logo System', 'approved', 1, '{"variants": 8, "formats": ["svg", "png"]}'),
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'social-post', 'Instagram Feed Pack - March', 'draft', 1, '{"platform": "instagram", "count": 12}'),
  -- Bloom deliverables
  ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'brand-book', 'Bloom Brand Book v1', 'approved', 1, '{"pages": 62, "format": "web+pdf"}'),
  ('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'landing-page', 'Bloom Main Landing Page', 'in-review', 1, '{"url": "bloom-studio.brand.aioxsquad.ai", "sections": 8}')
ON CONFLICT (id) DO NOTHING;

-- ===================== TOKENS (sample) =====================

INSERT INTO public.tokens (id, tenant_id, token_path, token_value, token_type, version)
VALUES
  -- Acme tokens
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'color.primary.500', '{"$value": "#3B82F6", "$type": "color"}', 'color', '1.0.0'),
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'color.primary.700', '{"$value": "#1D4ED8", "$type": "color"}', 'color', '1.0.0'),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'typography.heading.fontFamily', '{"$value": "Inter", "$type": "fontFamily"}', 'fontFamily', '1.0.0'),
  -- Bloom tokens
  ('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'color.primary.500', '{"$value": "#059669", "$type": "color"}', 'color', '1.0.0'),
  ('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'color.secondary.500', '{"$value": "#D97706", "$type": "color"}', 'color', '1.0.0')
ON CONFLICT (tenant_id, token_path, version) DO NOTHING;

-- ===================== APPROVAL WORKFLOW (sample) =====================

INSERT INTO public.approval_workflow (id, tenant_id, deliverable_id, reviewer_id, action, comment)
VALUES
  ('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'comment', 'Looking great! Minor tweak needed on color section.'),
  ('f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'approve', 'Perfect. Ship it!')
ON CONFLICT (id) DO NOTHING;
```

---

## 8. Migration Strategy

### 8.1 Naming Convention

```
supabase/migrations/
  YYYYMMDDHHMMSS_create_enums.sql              -- BSS-1.2 Step 1
  YYYYMMDDHHMMSS_create_core_schema.sql        -- BSS-1.2 Step 2
  YYYYMMDDHHMMSS_create_core_indexes.sql       -- BSS-1.2 Step 3
  YYYYMMDDHHMMSS_create_rls_policies.sql       -- BSS-1.3
  YYYYMMDDHHMMSS_create_monitoring_tables.sql   -- BSS-1.10
  YYYYMMDDHHMMSS_create_security_tables.sql     -- BSS-1.8
  YYYYMMDDHHMMSS_create_gdpr_tables.sql         -- BSS-1.9
```

### 8.2 Rollback Scripts

Each migration has a corresponding rollback script at `supabase/migrations/rollback/`.

**Rollback for core schema:**

```sql
-- rollback/YYYYMMDDHHMMSS_drop_core_schema.sql
-- WARNING: Destroys all data. Only use in development/staging.

DROP TABLE IF EXISTS public.approval_workflow CASCADE;
DROP TABLE IF EXISTS public.revisions CASCADE;
DROP TABLE IF EXISTS public.tokens CASCADE;
DROP TABLE IF EXISTS public.assets CASCADE;
DROP TABLE IF EXISTS public.deliverables CASCADE;
DROP TABLE IF EXISTS public.brand_profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.tenants CASCADE;

DROP FUNCTION IF EXISTS public.trigger_set_updated_at();
DROP FUNCTION IF EXISTS public.get_current_tenant_id();
DROP FUNCTION IF EXISTS public.get_current_user_role();
DROP FUNCTION IF EXISTS public.custom_access_token_hook(jsonb);
```

**Rollback for enums:**

```sql
-- rollback/YYYYMMDDHHMMSS_drop_enums.sql
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
```

**Rollback for RLS:**

```sql
-- rollback/YYYYMMDDHHMMSS_drop_rls_policies.sql
-- Disable RLS and drop all policies

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
    -- Drop all policies on each table
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = tbl AND schemaname = 'public'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, tbl);
    END LOOP;
    -- Disable RLS
    EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', tbl);
  END LOOP;
END;
$$;
```

### 8.3 CI/CD Integration

```yaml
# .github/workflows/migrate.yml (excerpt)
- name: Run Supabase Migrations
  run: |
    npx supabase db push --db-url ${{ secrets.SUPABASE_DB_URL }}
    npx supabase migration list

- name: Run RLS Tests
  run: npm run test:rls
  env:
    SUPABASE_URL: ${{ secrets.SUPABASE_TEST_URL }}
    SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_TEST_ANON_KEY }}
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_TEST_SERVICE_KEY }}
```

### 8.4 Migration Safety Rules

1. **NEVER modify production schema directly.** All changes through migration files.
2. **ALWAYS create a snapshot before applying migrations.** Use `pg_dump` or Supabase dashboard.
3. **ALWAYS test migrations on staging first.** Use `supabase db push --dry-run` when available.
4. **ALWAYS include rollback scripts.** Every migration gets a matching rollback.
5. **NEVER drop columns or tables without explicit approval.** Add `deleted_at` for soft delete first.
6. **Enum additions are safe.** Adding values to an enum is non-breaking. Removing values is dangerous.
7. **Index creation is safe** with `CONCURRENTLY` in production (avoids table locks).

---

## Summary: Table Reference

| Table | Story | Tenant-Scoped | RLS | Soft Delete |
|-------|-------|:---:|:---:|:---:|
| `tenants` | BSS-1.2 | N/A (root) | Yes | Yes |
| `users` | BSS-1.2 | Yes | Yes | Yes |
| `brand_profiles` | BSS-1.2 | Yes | Yes | Yes |
| `deliverables` | BSS-1.2 | Yes | Yes | Yes |
| `assets` | BSS-1.2 | Yes | Yes | Yes |
| `tokens` | BSS-1.2 | Yes | Yes | Yes |
| `revisions` | BSS-1.2 | Yes | Yes | Yes |
| `approval_workflow` | BSS-1.2 | Yes | Yes | Yes |
| `ai_api_logs` | BSS-1.10 | Yes | Yes (read-only) | No |
| `system_health_checks` | BSS-1.10 | No | Yes (deny all) | No |
| `rate_limit_events` | BSS-1.8 | No | Yes (deny all) | No |
| `webhook_secrets` | BSS-1.8 | No | Yes (deny all) | No |
| `security_scan_results` | BSS-1.8 | Yes | Yes (read-only) | No |
| `data_export_requests` | BSS-1.9 | Yes | Yes | No |
| `deletion_audit` | BSS-1.9 | No (FK broken) | Yes (deny all) | No (NEVER) |

**Total: 15 tables, 13 enum types, 8 RLS-enabled tenant-scoped tables, 4 system tables with deny-all RLS.**

---

*-- Dara, arquitetando dados*
