# Supabase Patterns

## RLS Performance

### auth.uid() Caching (CRITICAL)
```sql
-- ❌ WRONG: auth.uid() called per row
CREATE POLICY "user_data" ON documents
USING (user_id = auth.uid());

-- ✅ CORRECT: Wrap in SELECT for caching (99%+ faster)
CREATE POLICY "user_data" ON documents
USING (user_id = (SELECT auth.uid()));
```

### Complex Policies with Security Definer
```sql
-- ✅ Create helper function (caches auth.uid() internally)
CREATE OR REPLACE FUNCTION get_user_teams()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT team_id FROM team_members WHERE user_id = (SELECT auth.uid());
$$;

-- Use in policy
CREATE POLICY "team_access" ON documents
USING (team_id IN (SELECT * FROM get_user_teams()));
```

### Policy Column Indexing
```sql
-- Always index columns used in RLS policies
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_team_id ON documents(team_id);
```

## Multi-Tenant
```sql
-- ✅ With cached auth.uid()
team_id IN (SELECT team_id FROM members WHERE user_id = (SELECT auth.uid()))
```

## Time-Based Access
```sql
published_at <= now() AND (expires_at IS NULL OR expires_at > now())
```

## Hierarchical
```sql
EXISTS (SELECT 1 FROM parent WHERE parent.id = table.parent_id AND parent.user_id = (SELECT auth.uid()))
```

## Role-Based
```sql
(auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'moderator')
```

---

## JSONB Indexing Patterns

### Containment Queries (GIN)
```sql
-- Create GIN index
CREATE INDEX idx_events_data ON events USING GIN (data);

-- ✅ Query with containment operator
SELECT * FROM events WHERE data @> '{"type": "purchase"}';

-- ❌ NOT optimized by GIN
SELECT * FROM events WHERE data->>'type' = 'purchase';
```

### Expression Index for Specific Paths
```sql
-- For frequent path access
CREATE INDEX idx_events_type ON events ((data->>'type'));

-- Now this is indexed
SELECT * FROM events WHERE data->>'type' = 'purchase';
```

### jsonb_path_ops for Path Queries
```sql
CREATE INDEX idx_events_path ON events USING GIN (data jsonb_path_ops);
-- Smaller index, only supports @> operator
```

---

## Pagination Patterns

### Cursor/Keyset Pagination (RECOMMENDED)
```sql
-- ❌ WRONG: OFFSET pagination (reads all skipped rows)
SELECT * FROM posts ORDER BY created_at DESC LIMIT 20 OFFSET 10000;

-- ✅ CORRECT: Cursor pagination
SELECT * FROM posts
WHERE created_at < '2025-01-01T00:00:00Z'  -- Last item's timestamp
ORDER BY created_at DESC
LIMIT 20;

-- ✅ Composite cursor (when created_at not unique)
SELECT * FROM posts
WHERE (created_at, id) < ('2025-01-01T00:00:00Z', 'last-id')
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

### Index for Pagination
```sql
-- Support cursor pagination with composite index
CREATE INDEX idx_posts_cursor ON posts(created_at DESC, id DESC);
```

---

## Connection Patterns

### Use Supavisor/PgBouncer
```
# ❌ Direct connection (exhausts max_connections)
postgres://user:pass@db.xxx.supabase.co:5432/postgres

# ✅ Pooled connection (port 6543)
postgres://user:pass@db.xxx.supabase.co:6543/postgres?pgbouncer=true
```

### Connection Timeouts
```sql
-- Set session timeouts
SET idle_in_transaction_session_timeout = '60s';
SET statement_timeout = '30s';
SET lock_timeout = '10s';
```

---

## Bulk Operation Patterns

### Batch Inserts
```sql
-- ❌ Row-by-row
INSERT INTO logs (data) VALUES ('a');
INSERT INTO logs (data) VALUES ('b');

-- ✅ Multi-value
INSERT INTO logs (data) VALUES ('a'), ('b'), ('c');

-- ✅ With unnest for arrays
INSERT INTO logs (data, type)
SELECT * FROM unnest(
  ARRAY['a', 'b', 'c'],
  ARRAY['info', 'warn', 'error']
);
```

### Upsert Pattern
```sql
-- ✅ Use ON CONFLICT
INSERT INTO users (email, name, updated_at)
VALUES ('x@y.com', 'Name', now())
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    updated_at = now();
```

---

## Index Patterns

### Foreign Key Indexes (CRITICAL)
```sql
-- Every FK MUST have an index
CREATE TABLE orders (
  user_id UUID REFERENCES users(id)
);
CREATE INDEX idx_orders_user_id ON orders(user_id);
```

### Composite Indexes
```sql
-- Order by selectivity (most selective first)
CREATE INDEX idx_orders_status_date ON orders(status, created_at);
```

### Covering Indexes
```sql
-- Include columns to avoid table lookup
CREATE INDEX idx_orders_user_covering ON orders(user_id) INCLUDE (total, status);
```

### Partial Indexes
```sql
-- Index only active records
CREATE INDEX idx_orders_active ON orders(status, created_at)
WHERE status IN ('pending', 'processing');
```

### BRIN for Time-Series
```sql
-- 100-1000x smaller than B-tree for append-only data
CREATE INDEX idx_logs_created_brin ON logs USING BRIN (created_at);
```

---

## Schema Organization (2025+)

### Use `app_` Prefix for Custom Schemas
```sql
-- Don't rely only on public (exposed by default via Data API)
CREATE SCHEMA app_auth;      -- Custom authentication
CREATE SCHEMA app_billing;   -- Payments
CREATE SCHEMA app_content;   -- Main content
CREATE SCHEMA app_admin;     -- Admin functions (not exposed)

-- Grant permissions to Supabase roles
GRANT USAGE ON SCHEMA app_content TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA app_content TO authenticated;
```

Expose in **Project Settings → Data API → Exposed schemas**.

---

## Supavisor Connection Pooling (2025+)

### Port Selection Guide
| Scenario | Port | Mode |
|----------|------|------|
| Edge Functions | 6543 | Transaction |
| Serverless (Vercel, Netlify) | 6543 | Transaction |
| Persistent servers (EC2, VMs) | 5432 | Direct |
| Migrations | 5432 | Direct |
| Prepared statements needed | 5432 | Session |

```
# Transaction mode (releases connection after each transaction)
postgres://user:pass@db.xxx.supabase.co:6543/postgres?pgbouncer=true

# Session mode (persistent connection)
postgres://user:pass@db.xxx.supabase.co:5432/postgres
```

### Pool Sizing Rules
- With PostgREST: ≤40% of max_connections
- Without PostgREST: up to 80%
- Always reserve 20% for Auth, Realtime, internal services

---

## Storage RLS Patterns

### Folder-based User Isolation
```sql
-- Structure: bucket/user_id/filename
CREATE POLICY "Users access own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-documents'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

CREATE POLICY "Users upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-documents'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);
```

### Bucket Organization
- **Public buckets**: Profile pictures, blog images (truly public assets)
- **Private buckets**: Documents, uploads requiring auth

---

## Realtime Patterns

### Channel Type Selection
| Type | Use Case | Example |
|------|----------|---------|
| **Broadcast** | Ephemeral data | Cursors, typing indicators |
| **Presence** | Online tracking | User status, active users |
| **Postgres Changes** | DB sync | Only when DB sync needed |

### Always Filter Postgres Changes
```typescript
// ❌ WRONG: No filter, receives all changes
supabase.channel('all').on('postgres_changes', { event: '*', ... })

// ✅ CORRECT: Specific event + filter
supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',  // Not '*'
    schema: 'public',
    table: 'messages',
    filter: `room_id=eq.${roomId}`  // Always filter!
  }, handleMessage)
  .subscribe();
```

### Realtime Limits (2025)
| Metric | Free | Pro |
|--------|------|-----|
| Peak connections | 200 | 500 |
| Messages/second | 100 | 100 |
| Max message size | 1 MB | 1 MB |

### Always Cleanup Subscriptions
```typescript
useEffect(() => {
  const channel = supabase.channel('my-channel');
  channel.subscribe();
  return () => supabase.removeChannel(channel);
}, []);
```

---

## Migration Safety Patterns

### Foreign Keys in 2 Steps (No Lock)
```sql
-- Step 1: Add constraint without validation (no lock)
ALTER TABLE appointments
ADD CONSTRAINT fk_patient
FOREIGN KEY (patient_id) REFERENCES patients(id)
NOT VALID;

-- Step 2: Validate separately (allows concurrent reads)
ALTER TABLE appointments
VALIDATE CONSTRAINT fk_patient;
```

### Always Set Timeouts
```sql
SET lock_timeout = '5s';
SET statement_timeout = '30s';
-- Then run migration
```

---

## Audit Trail Options

### Option 1: pgaudit (Available in all Supabase projects)

**Best for:** Compliance logging, security audits, debugging

```sql
-- 1. Install extension
CREATE EXTENSION IF NOT EXISTS pgaudit;

-- 2. Create auditor role for object-level auditing
CREATE ROLE auditor NOLOGIN;

-- 3. Grant auditor to sensitive tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO auditor;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO auditor;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.integration_credentials TO auditor;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_providers TO auditor;

-- 4. Configure via Supabase Dashboard:
--    Database → Settings → Custom Postgres Config:
--    pgaudit.role = 'auditor'
--    pgaudit.log = 'write'
```

**pgaudit.log options:**
| Value | What it logs |
|-------|--------------|
| `write` | INSERT, UPDATE, DELETE (recommended) |
| `read` | SELECT queries |
| `ddl` | CREATE, ALTER, DROP |
| `all` | Everything (verbose) |

**View logs:** Supabase Dashboard → Logs → Postgres Logs

### Option 2: supa_audit (If available)

```sql
-- Enable extension
CREATE EXTENSION supa_audit CASCADE;

-- Track specific table
SELECT audit.enable_tracking('public.accounts'::regclass);

-- Query history
SELECT * FROM audit.record_version
WHERE table_name = 'accounts'
ORDER BY ts DESC;
```

### Option 3: Custom Audit Triggers

For full history stored in tables (not just logs):

```sql
-- Create audit schema and table
CREATE SCHEMA IF NOT EXISTS audit;

CREATE TABLE audit.log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,  -- INSERT, UPDATE, DELETE
  old_data JSONB,
  new_data JSONB,
  changed_by UUID DEFAULT (SELECT auth.uid()),
  changed_at TIMESTAMPTZ DEFAULT now()
);

-- Create generic audit trigger function
CREATE OR REPLACE FUNCTION audit.log_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit.log (table_name, operation, old_data, new_data)
  VALUES (
    TG_TABLE_NAME,
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to sensitive tables
CREATE TRIGGER audit_user_profiles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION audit.log_changes();
```

### Which to choose?

| Need | Solution |
|------|----------|
| Compliance logging only | pgaudit |
| Query history in tables | Custom triggers |
| Simple setup (if available) | supa_audit |
| Financial/GDPR audit trail | Custom triggers + pgaudit |

---

## API Keys Transition (2025-2026)

**DEPRECATION WARNING:** `anon` and `service_role` keys deprecated by end of 2026.

| Old Key | New Key | Use |
|---------|---------|-----|
| `anon` (JWT) | `sb_publishable_...` | Client-side |
| `service_role` (JWT) | `sb_secret_...` | Server-side only |

New benefits:
- Independent key rotation
- Auto-protection against browser exposure (HTTP 401)
- Multiple secret keys for different backend components

---

## Splinter Security Checks

Supabase's Splinter advisor automatically checks:
- `auth_users_exposed`: Auth table accessible via API
- `rls_disabled_in_public`: Tables without RLS
- `unindexed_foreign_keys`: FKs without indexes
- `unused_index`: Indexes consuming resources unnecessarily

---

**References:**
- https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://github.com/supabase-community/supabase-agent-skills
- https://supabase.com/docs/guides/platform/performance (Splinter)
- https://supabase.com/blog/supabase-api-keys (New API Keys)
