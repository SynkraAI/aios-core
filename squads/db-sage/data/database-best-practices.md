# Database Best Practices

## Schema Design
- UUID primary keys (gen_random_uuid())
- TIMESTAMPTZ for all timestamps
- JSONB for flexible data
- Soft deletes (deleted_at)
- created_at, updated_at on all tables
- TEXT over VARCHAR
- NUMERIC for money values

## Indexes
- Index ALL foreign keys
- Partial indexes (WHERE clause)
- CONCURRENTLY for zero-downtime
- GIN for JSONB/arrays/full-text
- Remove unused indexes (pg_stat_user_indexes)

## Security
- RLS enabled on ALL user tables
- Auth.uid() wrapped in SELECT (99.99% faster)
- app_metadata NOT user_metadata
- Granular policies per operation
- Never hardcode credentials

## Performance
- shared_buffers = 25% RAM
- effective_cache_size = 75% RAM
- Connection pooling (PgBouncer)
- ANALYZE after bulk operations
- Monitor with pg_stat_statements

## Backups
- Automated daily backups
- PITR enabled (WAL archiving)
- Test restores monthly
- Store offsite
- 30+ days retention

**References:**
- https://wiki.postgresql.org/wiki/Performance_Optimization
- https://www.postgresql.org/docs/current/ddl-constraints.html
