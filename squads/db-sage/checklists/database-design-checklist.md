# Database Design Checklist

**Purpose:** Validate schema design before implementation
**References:** Domain-driven design, 3NF, access pattern optimization

---

## DOMAIN MODELING

- [ ] Business requirements understood
- [ ] Core entities identified
- [ ] Relationships mapped (1:1, 1:N, M:N)
- [ ] Business rules documented
- [ ] Access patterns analyzed
- [ ] Scale requirements defined

---

## SCHEMA DESIGN

###  Tables
- [ ] Proper normalization (up to 3NF)
- [ ] UUID primary keys
- [ ] Foreign keys with CASCADE/SET NULL
- [ ] created_at, updated_at timestamps
- [ ] Soft deletes (deleted_at) where needed
- [ ] JSONB for flexible data

### Constraints
- [ ] NOT NULL on required fields
- [ ] CHECK constraints for business rules
- [ ] UNIQUE constraints for natural keys
- [ ] Foreign keys enforce referential integrity
- [ ] Meaningful constraint names

### Indexes
- [ ] Primary keys (automatic)
- [ ] Foreign keys (manual, critical!)
- [ ] WHERE clause columns
- [ ] ORDER BY columns
- [ ] Partial indexes for filtered queries
- [ ] GIN indexes for JSONB/arrays
- [ ] No redundant indexes

---

## SECURITY

- [ ] RLS enabled on all tables
- [ ] Granular policies per operation
- [ ] auth.uid() wrapped in SELECT
- [ ] Policies tested with impersonation
- [ ] Sensitive data encrypted
- [ ] PII compliance (GDPR, etc.)

---

## PERFORMANCE

- [ ] Indexes cover hot paths
- [ ] Large tables partitioned (>100M rows)
- [ ] JSONB over TEXT for structured data
- [ ] TEXT over VARCHAR
- [ ] TIMESTAMPTZ over TIMESTAMP
- [ ] NUMERIC for money

---

## DOCUMENTATION

- [ ] Tables commented
- [ ] Columns commented
- [ ] Complex logic explained
- [ ] ERD diagram created
- [ ] Migration plan documented

---

**Reviewed by:** ________  **Date:** ________
