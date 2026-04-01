# DBA Rollback Checklist

**Purpose:** Safe rollback procedure for failed migrations
**Philosophy:** Roll-forward preferred, PITR for emergencies

---

## PRE-ROLLBACK

- [ ] Identify root cause of failure
- [ ] Assess data loss risk
- [ ] Verify backup exists (<24h old)
- [ ] Team on standby
- [ ] Stakeholders notified
- [ ] Choose rollback strategy

---

## STRATEGY 1: ROLL FORWARD (Preferred)

- [ ] Create NEW migration to undo changes
- [ ] Test roll-forward migration in staging
- [ ] Apply roll-forward migration
- [ ] Verify application works
- [ ] Monitor for 30 minutes

---

## STRATEGY 2: PITR (Point-in-Time Recovery)

- [ ] Stop application writes
- [ ] Select restore point (before migration)
- [ ] Initiate PITR restore (Supabase Dashboard)
- [ ] Wait for restoration (5-30 min)
- [ ] Verify data integrity
- [ ] Resume application

---

## STRATEGY 3: MANUAL ROLLBACK (Emergency)

- [ ] Take emergency backup first!
- [ ] Run rollback script in transaction
- [ ] Archive data before dropping
- [ ] Drop objects in reverse order
- [ ] Revert schema changes
- [ ] Validate with smoke tests

---

## POST-ROLLBACK

- [ ] Application functional
- [ ] No data corruption
- [ ] RLS policies working
- [ ] Performance normal
- [ ] Run ANALYZE
- [ ] Monitor logs
- [ ] Document incident
- [ ] Root cause analysis
- [ ] Update procedures

---

**Executed by:** ________  **Date:** ________
