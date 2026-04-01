# DBA Pre-Deployment Checklist

**Purpose:** Validate database is production-ready before deployment
**Version:** 1.0 (2025 Best Practices)
**References:** [Stormatics 2025](https://stormatics.tech/blogs/checklist-is-your-postgresql-deployment-production-grade) | [Crunchy Data](https://www.crunchydata.com/blog/is-your-postgres-ready-for-production) | [Instaclustr 2025](https://www.instaclustr.com/education/postgresql/top-10-postgresql-best-practices-for-2025/)

---

## ✅ PHASE 1: SCHEMA VALIDATION

###  Tables & Constraints
- [ ] All tables have PRIMARY KEY defined
- [ ] Foreign keys use appropriate ON DELETE/ON UPDATE actions
- [ ] CHECK constraints validate business rules
- [ ] UNIQUE constraints prevent duplicate data
- [ ] NOT NULL constraints on required fields
- [ ] DEFAULT values set where appropriate
- [ ] Soft deletes implemented (deleted_at) where needed

### Indexes
- [ ] Primary keys indexed (automatic)
- [ ] Foreign keys indexed (critical for JOINs)
- [ ] Columns used in WHERE clauses indexed
- [ ] Columns used in ORDER BY indexed
- [ ] Partial indexes for filtered queries
- [ ] GIN/GiST indexes for JSONB/arrays/full-text
- [ ] No unused indexes (check pg_stat_user_indexes)
- [ ] All indexes created CONCURRENTLY

### Data Types
- [ ] UUID for primary keys (gen_random_uuid())
- [ ] TIMESTAMPTZ (not TIMESTAMP) for timestamps
- [ ] JSONB (not JSON) for flexible data
- [ ] TEXT (not VARCHAR) unless length limit required
- [ ] NUMERIC for money (not FLOAT)
- [ ] Proper enum types or CHECK constraints

---

## 🔒 PHASE 2: SECURITY

### Row Level Security (RLS)
- [ ] RLS enabled on ALL user-facing tables
- [ ] Granular policies (SELECT, INSERT, UPDATE, DELETE separate)
- [ ] auth.uid() wrapped in SELECT for performance
- [ ] Policies use app_metadata (NOT user_metadata)
- [ ] Policies tested with *impersonate command
- [ ] Public tables explicitly allow anon/authenticated
- [ ] Admin/role-based policies use JWT claims
- [ ] All policy columns indexed

### Access Control
- [ ] No hardcoded credentials in code
- [ ] DATABASE_URL in environment variables only
- [ ] Service role key secured (not in client code)
- [ ] Anon key appropriate for public access
- [ ] Connection pooling configured (PgBouncer)
- [ ] SSL/TLS enforced (sslmode=require)
- [ ] Firewall rules restrict database access

### Audit & Compliance
- [ ] Audit triggers on sensitive tables
- [ ] Sensitive data encrypted at rest
- [ ] PII handling complies with GDPR/regulations
- [ ] Data retention policies implemented
- [ ] Soft deletes for compliance (no hard deletes)

---

## ⚡ PHASE 3: PERFORMANCE

### Query Optimization
- [ ] EXPLAIN ANALYZE run on critical queries
- [ ] pg_stat_statements enabled for monitoring
- [ ] auto_explain configured (log_min_duration=1000ms)
- [ ] No N+1 queries (check with pg_stat_statements)
- [ ] Indexes cover hot query paths
- [ ] Connection pooling reduces overhead

### Configuration
- [ ] shared_buffers = 25% of RAM
- [ ] effective_cache_size = 75% of RAM
- [ ] work_mem appropriate for query complexity
- [ ] max_connections set correctly
- [ ] statement_timeout = 30s (prevent runaway queries)
- [ ] lock_timeout = 10s (prevent deadlocks)
- [ ] idle_in_transaction_session_timeout = 60s

### Table Maintenance
- [ ] VACUUM scheduled (auto vacuum enabled)
- [ ] ANALYZE statistics updated
- [ ] Bloat monitored (pg_stat_user_tables)
- [ ] Large tables partitioned if >100M rows
- [ ] Old data archived/purged

---

## 💾 PHASE 4: BACKUP & DISASTER RECOVERY

### Backups
- [ ] Automated daily backups configured
- [ ] Point-in-Time Recovery (PITR) enabled
- [ ] WAL archiving configured
- [ ] Backups stored in separate region/zone
- [ ] Backup restoration tested monthly
- [ ] Backup retention policy defined (30 days minimum)
- [ ] Backup encryption enabled

### High Availability (2025 Priority)
- [ ] Multi-AZ deployment configured
- [ ] Read replicas for scaling
- [ ] Failover tested
- [ ] Connection pooling handles failover
- [ ] Health checks monitor database availability
- [ ] Auto-failover configured (if using managed service)

### Rollback Strategy
- [ ] Pre-migration snapshot created
- [ ] Rollback script prepared and tested
- [ ] Roll-forward migration ready
- [ ] Deployment window scheduled (low traffic)
- [ ] Team aware of rollback procedure

---

## 📊 PHASE 5: MONITORING & ALERTING

### Metrics
- [ ] CPU utilization monitored (<80% avg)
- [ ] Memory usage monitored
- [ ] Disk space monitored (>20% free)
- [ ] Connection count monitored (<80% max)
- [ ] Query latency monitored (p95, p99)
- [ ] Slow queries logged and alerted
- [ ] Replication lag monitored (if using replicas)

### Alerts Configured
- [ ] Database down/unreachable
- [ ] Disk space >90% full
- [ ] Replication lag >1 minute
- [ ] Query duration >5 seconds
- [ ] Connection pool exhaustion
- [ ] Failed backup alerts
- [ ] High error rate (>1% of queries)

### Observability
- [ ] Logs centralized (CloudWatch/Datadog/etc.)
- [ ] pg_stat_statements reviewed weekly
- [ ] Dashboard shows key metrics
- [ ] On-call rotation defined
- [ ] Runbook for common issues

---

## 🧪 PHASE 6: TESTING

### Migration Testing
- [ ] Migration tested in staging environment
- [ ] Migration run with dry-run first
- [ ] Smoke tests pass in staging
- [ ] Performance validated (no regression)
- [ ] Rollback tested in staging
- [ ] Migration duration estimated

### Data Validation
- [ ] Row counts match expectations
- [ ] Foreign key integrity verified
- [ ] RLS policies block unauthorized access
- [ ] Application queries work correctly
- [ ] No data loss during migration
- [ ] Edge cases tested

### Load Testing
- [ ] Database handles expected QPS
- [ ] Connection pooling tested under load
- [ ] Query performance acceptable under load
- [ ] No deadlocks or lock contention
- [ ] Auto-scaling tested (if enabled)

---

## 📝 PHASE 7: DOCUMENTATION

### Migration Documentation
- [ ] Migration purpose documented
- [ ] Breaking changes listed
- [ ] Rollback plan documented
- [ ] Dependencies documented
- [ ] Performance impact noted
- [ ] Downtime window communicated

### Schema Documentation
- [ ] Tables commented (COMMENT ON TABLE)
- [ ] Columns commented (COMMENT ON COLUMN)
- [ ] Constraints explained
- [ ] RLS policies documented
- [ ] Indexes purpose documented
- [ ] ERD diagram updated

### Operational Docs
- [ ] Connection strings documented (without secrets!)
- [ ] Backup/restore procedures documented
- [ ] Common queries documented
- [ ] Troubleshooting guide updated
- [ ] Team trained on new features

---

## 🚀 PHASE 8: DEPLOYMENT

### Pre-Deploy
- [ ] Announce maintenance window
- [ ] Enable maintenance mode (if applicable)
- [ ] Take final backup snapshot
- [ ] Verify team on standby

### Deploy
- [ ] Apply migration with transaction
- [ ] Monitor logs during deployment
- [ ] Verify smoke tests pass
- [ ] Check application health
- [ ] Monitor performance metrics

### Post-Deploy
- [ ] Run ANALYZE on affected tables
- [ ] Verify RLS policies working
- [ ] Check slow query log
- [ ] Monitor error rates
- [ ] Update documentation
- [ ] Announce deployment complete
- [ ] Post-mortem if issues occurred

---

## ⚠️ CRITICAL STOPS

**DO NOT DEPLOY IF:**
- ❌ RLS not enabled on user-facing tables
- ❌ No backup taken in last 24 hours
- ❌ Migration not tested in staging
- ❌ No rollback plan prepared
- ❌ Team not available for support
- ❌ Critical production issues ongoing
- ❌ Missing required indexes on large tables
- ❌ Breaking changes without migration plan

---

## 📊 DEPLOYMENT RISK ASSESSMENT

**Risk Level:** [Low / Medium / High / Critical]

**Risk Factors:**
- Data loss potential: [None / Low / High]
- Downtime required: [None / <1min / <5min / >5min]
- Breaking changes: [None / Minor / Major]
- Rollback complexity: [Easy / Moderate / Complex]
- Team availability: [Full / Partial / Limited]

**Mitigation:**
- [ ] Risk factors documented
- [ ] Mitigation strategies defined
- [ ] Stakeholders informed
- [ ] Deployment window optimized

---

**Completed by:** ________________
**Date:** ________________
**Approved by:** ________________
**Deployment scheduled:** ________________

---

**Version History:**
- v1.0 (2025-10-27): Initial checklist with 2025 best practices
