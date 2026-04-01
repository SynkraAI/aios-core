# 🗄️ DB Sage - Database Architect & Operations Engineer

**Version:** 1.1.0
**Command:** `/db-sage`
**Type:** Specialist Agent
**Independence:** Requires PostgreSQL/Supabase

---

## Prerequisites

> **IMPORTANT:** This squad requires a PostgreSQL database or Supabase project.

### Required

| Dependency | Version | Purpose | Install |
|------------|---------|---------|---------|
| **PostgreSQL** | >= 13.0 | Database server | [postgresql.org/download](https://www.postgresql.org/download/) |
| **psql** | - | PostgreSQL CLI client | Included with PostgreSQL |

### Optional (for Supabase users)

| Dependency | Version | Purpose | Install |
|------------|---------|---------|---------|
| **Supabase CLI** | >= 1.0 | Supabase project management | `npm install -g supabase` |

### Environment Variables

```bash
# Option 1: Raw PostgreSQL
export DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

# Option 2: Supabase
export SUPABASE_DB_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
export SUPABASE_PROJECT_REF="your-project-ref"
```

---

## Overview

DB Sage is an expert database agent specializing in:

- **Schema Design:** Domain modeling, table design, relationships
- **Migrations:** Safe migration planning, dry-runs, rollbacks
- **RLS Policies:** Row-Level Security for Supabase/PostgreSQL
- **Performance:** Query optimization, index strategy, hotpath analysis
- **Operations:** Backups, snapshots, seeding, smoke tests

## Runtime Contract

- **Supported runtime:** PostgreSQL and Supabase only
- **Canonical manifest:** `squads/db-sage/config.yaml`
- **Legacy mirror:** `squads/db-sage/squad.yaml` must match the canonical manifest
- **Secrets policy:** setup workflows should keep credentials in environment variables, not in tracked project manifests
- **Canonical worker entrypoints:** prefer `squads/db-sage/scripts/db-ops/`; keep `database-adapters/` as supporting loaders only

---

## Quick Start

```bash
# 1. Activate DB Sage
/db-sage

# 2. Check environment
*env-check

# 3. Start designing
*domain-modeling
```

---

## Commands

### Workflow Shortcuts

| Command | Description |
|---------|-------------|
| `*setup` | Configure and validate a PostgreSQL/Supabase connection |
| `*query` | Execute SQL with safety checks and optional EXPLAIN |
| `*migrate` | Run the safe schema migration workflow |
| `*backup` | Create or restore database snapshots |
| `*tune` | Run the performance tuning workflow |
| `*import` | Load CSV/seed data and run data analysis helpers |

### Architecture & Design

| Command | Description |
|---------|-------------|
| `*kiss {context}` | Run KISS gate before schema changes |
| `*domain-modeling` | Design domain model from requirements |
| `*schema-audit` | Audit existing schema for issues |
| `*create-schema` | Generate schema from domain model |

### Migrations

| Command | Description |
|---------|-------------|
| `*dry-run {path}` | Validate migration without applying |
| `*apply-migration {path}` | Apply migration safely |
| `*rollback {snapshot}` | Rollback to snapshot |
| `*snapshot {name}` | Create rollback point |
| `*verify-order` | Validate DDL ordering |

### RLS & Security (Supabase)

| Command | Description |
|---------|-------------|
| `*rls-audit` | Audit RLS policies |
| `*policy-apply {table} {mode}` | Apply RLS policy |
| `*impersonate {user_id}` | Test as specific user |
| `*best-practices-audit` | Audit database against 30 Supabase rules |

### Performance

| Command | Description |
|---------|-------------|
| `*explain {query}` | Analyze query plan |
| `*analyze-hotpaths` | Find performance bottlenecks |
| `*query-optimization` | Optimize slow queries |

### Operations

| Command | Description |
|---------|-------------|
| `*env-check` | Validate environment setup |
| `*bootstrap` | Initialize new project |
| `*seed {path}` | Load seed data |
| `*smoke-test` | Run smoke tests |
| `*load-csv {table} {file}` | Import CSV data |
| `*run-sql {query}` | Execute SQL |

### Supabase-Specific

| Command | Description |
|---------|-------------|
| `*supabase-setup` | Configure Supabase project |
| `*squad-integration` | Audit AIOX packs with deterministic preflight before integration design |

### Utilities

| Command | Description |
|---------|-------------|
| `*env-check` | Validate PostgreSQL/Supabase connectivity and client tooling |
| `*execute-checklist {name}` | Run a database checklist task |

### Canonical Task Policy

`domain-modeling.md`, `schema-audit.md`, and `supabase-setup.md` are the canonical
task files for design/setup flows.

Legacy files `db-domain-modeling.md`, `db-schema-audit.md`, and
`db-supabase-setup.md` are compatibility aliases only and should not receive new
workflow logic.

---

## Workflows

### 1. Setup Database (New Project)

```yaml
workflow: setup-database-workflow
steps:
  1. *env-check           # Validate environment
  2. *bootstrap           # Initialize project
  3. *domain-modeling     # Design domain
  4. *create-schema       # Generate schema
  5. *supabase-setup      # Configure Supabase (if using)
  6. *smoke-test          # Verify setup
```

### 2. Modify Schema (Existing Project)

```yaml
workflow: modify-schema-workflow
steps:
  1. *snapshot before-change
  2. *dry-run migration.sql
  3. *apply-migration migration.sql
  4. *smoke-test
  5. # If failed: *rollback before-change
```

### 3. Performance Tuning

```yaml
workflow: performance-tuning-workflow
steps:
  1. *analyze-hotpaths
  2. *explain "slow query"
  3. *query-optimization
  4. *create-indexes
  5. *smoke-test
```

---

## Project Structure

```
squads/db-sage/
├── agents/
│   ├── db-sage.md              # Main agent definition
│   ├── db-sage.yaml            # Agent config
│   └── db-sage-activation-protocol.md
├── tasks/                       # 28 database tasks (including 3 compatibility aliases)
│   ├── db-*.md                  # Database operations
│   ├── domain-modeling.md
│   ├── query-optimization.md
│   └── schema-audit.md
├── templates/                   # 9 templates
│   ├── db-schema-design-tmpl.yaml
│   ├── db-migration-plan-tmpl.yaml
│   ├── db-rls-policies-tmpl.yaml
│   └── ...
├── checklists/                  # 7 checklists
│   ├── database-design-checklist.md
│   ├── dba-predeploy-checklist.md
│   └── ...
├── data/                        # 6 knowledge base files
│   ├── database-best-practices.md
│   ├── supabase-patterns.md
│   ├── rls-security-patterns.md
│   └── ...
├── workflows/                   # 7 workflow orchestrations
│   ├── setup-database-workflow.yaml
│   ├── modify-schema-workflow.yaml
│   └── ...
├── squad.yaml                   # Legacy mirror of config.yaml
├── docs/
│   ├── stories/                 # Development stories
│   ├── epics/                   # Epic definitions
│   └── research/                # Research notes
├── scripts/
│   ├── db-ops/                  # Canonical worker entrypoints
│   ├── database-adapters/       # Activation/schema loaders
│   └── database-operations/     # Legacy implementation scripts behind wrappers
├── config.yaml
└── README.md
```

---

## Knowledge Base

| File | Description |
|------|-------------|
| `database-best-practices.md` | UUID PKs, timestamps, soft deletes, indexing |
| `supabase-patterns.md` | Supabase-specific patterns and idioms |
| `rls-security-patterns.md` | Row-Level Security patterns |
| `postgres-tuning-guide.md` | PostgreSQL performance tuning |
| `migration-safety-guide.md` | Safe migration practices |
| `migration-pitfalls.md` | Common migration mistakes |

---

## RLS Policy Examples

### KISS Policy (Simple)

```sql
-- Single policy for all operations
CREATE POLICY "users_own_data" ON my_table
  FOR ALL
  USING (user_id = auth.uid());
```

### Granular Policies

```sql
-- Separate policies per operation
CREATE POLICY "select_own" ON my_table FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "insert_own" ON my_table FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "update_own" ON my_table FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "delete_own" ON my_table FOR DELETE USING (user_id = auth.uid());
```

---

## Troubleshooting

### Connection Issues

```bash
# Test connection
DB_URL="${SUPABASE_DB_URL:-${DATABASE_URL:-}}"
psql "$DB_URL" -c "SELECT 1"

# Check active database
psql "$DB_URL" -c "SELECT current_database()"
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `connection refused` | Database not running | Start PostgreSQL service |
| `password authentication failed` | Wrong credentials | Check the active `SUPABASE_DB_URL` or `DATABASE_URL` |
| `relation does not exist` | Table not created | Run migrations |
| `permission denied` | RLS blocking | Check policies with `*rls-audit` |

---

## Integration with Other Squads

DB Sage can integrate with any AIOX squad that needs database persistence:

- **Any domain squad** that stores structured data (users, content, transactions)
- **Any pipeline squad** that needs state tracking or audit trails
- **Any squad** requiring RLS-protected multi-tenant access

Use `*squad-integration` to analyze a squad's data needs and design the integration.

---

## Security Notes

- Never commit `.env` files with credentials
- Use connection pooling for production
- Enable SSL for remote connections
- Audit RLS policies regularly with `*rls-audit`
- Create snapshots before destructive operations

---

**Maintained By:** AIOX Team
**Last Updated:** 2026-01-22
**Independence:** Requires PostgreSQL/Supabase
