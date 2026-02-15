# Database Schema Request Template

**Status:** [Draft | Review | Approved | Implemented]
**Version:** 1.0
**Last Updated:** YYYY-MM-DD
**Author:** @username
**Reviewers:** @reviewer1, @reviewer2

---

## 1. Executive Summary

### Context
[Breve descrição do contexto de negócio que motivou a solicitação]

### Objective
[Objetivo principal desta solicitação de schema]

### Scope
- **Tables:** [Número] novas tabelas
- **Expected Volume:** [Estimativa de registros]
- **Integration:** [Sistemas/schemas relacionados]
- **Priority:** [High | Medium | Low]

---

## 2. Business Requirements

### Problem Statement
[Descrição clara do problema que precisa ser resolvido]

### Success Metrics
- **Metric 1:** [KPI esperado]
- **Metric 2:** [KPI esperado]
- **Metric 3:** [KPI esperado]

### Users Impacted
- **Primary:** [Usuários principais]
- **Secondary:** [Usuários secundários]
- **Expected Load:** [Ex: 5K usuários, 100-200 concurrent]

---

## 3. Schema Design

### 3.1 Schema Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                       SCHEMA: [schema_name]                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Diagrama visual mostrando relacionamentos entre tabelas]      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Integration with Existing Systems:
──────────────────────────────────
[existing_table] ←→ [new_table] ([relationship description])
```

### 3.2 Tables Summary

| Table | Purpose | FK to Existing | Pattern Alignment |
|-------|---------|----------------|-------------------|
| `schema.table_1` | [Descrição] | `[existing_schema.table]` | [Pattern usado] |
| `schema.table_2` | [Descrição] | `[existing_schema.table]` | [Pattern usado] |

**Total:** [X] tables + [Y] views + [Z] functions

### 3.3 Key Design Decisions

1. **[Decisão 1]** - [Justificativa]
2. **[Decisão 2]** - [Justificativa]
3. **[Decisão 3]** - [Justificativa]

### 3.4 Alternative Approaches Considered

| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| **[Alternativa 1]** | [Vantagens] | [Desvantagens] | [Escolhida/Rejeitada] |
| **[Alternativa 2]** | [Vantagens] | [Desvantagens] | [Escolhida/Rejeitada] |

---

## 4. Complete Schema Definition

```sql
-- ============================================================================
-- [SCHEMA NAME] - [Brief Description]
-- Version: 1.0
-- Tables: [X] ([list table names])
-- Pattern: [Design pattern being followed]
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS [schema_name];

-- ============================================================================
-- TABLE 1: [TABLE_NAME] - [Purpose]
-- Pattern: [Equivalent pattern in existing system]
-- ============================================================================

CREATE TABLE [schema_name].[table_name] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- [Section 1: Core Fields]
  [field_name] [TYPE] [CONSTRAINTS],

  -- [Section 2: Relationships]
  [fk_field] UUID REFERENCES [other_schema].[other_table](id) ON DELETE [CASCADE|SET NULL|RESTRICT],

  -- [Section 3: Metadata]
  metadata JSONB DEFAULT '{}',

  -- [Section 4: Timestamps]
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT [constraint_name] CHECK ([condition]),
  UNIQUE([field1], [field2])
);

-- Indices
CREATE INDEX idx_[table]_[field] ON [schema].[table]([field])
  WHERE [condition];
CREATE INDEX idx_[table]_[composite] ON [schema].[table]([field1], [field2]);
CREATE INDEX idx_[table]_[gin] ON [schema].[table] USING GIN([jsonb_field]);

-- Comments
COMMENT ON TABLE [schema].[table] IS '[Detailed table purpose]';
COMMENT ON COLUMN [schema].[table].[field] IS '[Field purpose]';

-- ============================================================================
-- VIEWS
-- ============================================================================

CREATE VIEW [schema].vw_[view_name] AS
SELECT
  [fields],
  -- [Aggregations/Joins]
FROM [schema].[table]
WHERE [conditions]
GROUP BY [fields];

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION [schema].[function_name](
  p_param1 [TYPE],
  p_param2 [TYPE] DEFAULT [default_value]
)
RETURNS [RETURN_TYPE] AS $$
DECLARE
  v_variable [TYPE];
BEGIN
  -- [Function logic]

  RETURN [result];
END;
$$ LANGUAGE plpgsql [STABLE|VOLATILE|IMMUTABLE];

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE [schema].[table] ENABLE ROW LEVEL SECURITY;

-- [Policy 1: Purpose]
CREATE POLICY "[policy_name]" ON [schema].[table]
  FOR [SELECT|INSERT|UPDATE|DELETE]
  USING ([condition]);

CREATE POLICY "[policy_name]" ON [schema].[table]
  FOR [SELECT|INSERT|UPDATE|DELETE]
  TO [authenticated|anon|service_role]
  WITH CHECK ([condition]);
```

---

## 5. Data Migration Plan

### 5.1 Existing Data

**Current State:**
- [Descrição do estado atual dos dados]
- [Volumes atuais]

**Migration Needed:** [Yes | No]

### 5.2 Migration Steps

```sql
-- Step 1: [Description]
-- Estimated time: [X minutes]
-- Risk: [Low | Medium | High]

[SQL statements]

-- Step 2: [Description]
-- Estimated time: [X minutes]
-- Risk: [Low | Medium | High]

[SQL statements]
```

### 5.3 Rollback Plan

```sql
-- Emergency rollback procedure
-- Execute in reverse order if issues occur

[Rollback SQL statements]
```

---

## 6. API/Application Integration

### 6.1 Required Endpoints

```typescript
// [HTTP Method] [endpoint path]
// [Purpose]

interface [RequestType] {
  [field]: [type];
}

interface [ResponseType] {
  [field]: [type];
}
```

### 6.2 Data Access Functions

```typescript
// [Function name]
// [Purpose]

async function [functionName](
  params: [ParamsType]
): Promise<[ReturnType]> {
  // [Implementation notes]
}
```

---

## 7. Performance Considerations

### 7.1 Volume Estimates

| Table | Initial | 1 Month | 6 Months | 1 Year |
|-------|---------|---------|----------|--------|
| [table_1] | [X rows] | [Y rows] | [Z rows] | [W rows] |
| [table_2] | [X rows] | [Y rows] | [Z rows] | [W rows] |

### 7.2 Query Patterns

**Most Frequent Queries:**
1. [Query pattern 1] - [Frequency]
2. [Query pattern 2] - [Frequency]

**Index Strategy:**
- [Index 1]: [Justification]
- [Index 2]: [Justification]

### 7.3 Partitioning Strategy

**Partitioning:** [Yes | No | Future]

```sql
-- Partitioning configuration
CREATE TABLE [table_name] (
  [fields]
) PARTITION BY [RANGE|LIST|HASH] ([partition_key]);

-- Initial partitions
CREATE TABLE [partition_1] PARTITION OF [table_name]
  FOR VALUES FROM ([start]) TO ([end]);
```

---

## 8. Security & Compliance

### 8.1 Data Classification

| Field | Classification | Justification |
|-------|----------------|---------------|
| [field_1] | [Public|Internal|Confidential|Restricted] | [Reason] |
| [field_2] | [Public|Internal|Confidential|Restricted] | [Reason] |

### 8.2 Access Control

**RLS Policies:**
- [Policy 1]: [Who can access what]
- [Policy 2]: [Who can access what]

**Encryption:**
- At-rest: [Strategy]
- In-transit: [Strategy]
- Field-level: [If applicable]

### 8.3 Audit Requirements

**Audit Trail:** [Yes | No]
**Retention Period:** [Duration]
**PII Handling:** [Strategy if applicable]

---

## 9. Implementation Plan

### Phase 1: [Phase Name] ([Duration])
**Goal:** [Phase objective]

**Tasks:**
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

**Deliverables:**
- [Deliverable 1]
- [Deliverable 2]

**Success Criteria:**
- [Criteria 1]
- [Criteria 2]

### Phase 2: [Phase Name] ([Duration])
[Repetir estrutura acima]

---

## 10. Testing Strategy

### 10.1 Unit Tests

```sql
-- Test 1: [Description]
-- Expected: [Expected result]

[Test SQL]
```

### 10.2 Integration Tests

**Scenario 1:** [Description]
- **Setup:** [Initial state]
- **Action:** [What happens]
- **Expected:** [Expected result]

### 10.3 Performance Tests

| Test | Load | Expected Response Time | Pass Criteria |
|------|------|----------------------|---------------|
| [Test 1] | [Load description] | [X ms] | [Criteria] |
| [Test 2] | [Load description] | [X ms] | [Criteria] |

---

## 11. Monitoring & Alerts

### 11.1 Metrics to Track

| Metric | Alert Threshold | Action |
|--------|----------------|--------|
| Table size | > [X GB] | [Action] |
| Query latency | > [X ms] | [Action] |
| Error rate | > [X%] | [Action] |

### 11.2 Dashboards

**Dashboard Requirements:**
- [Metric 1 visualization]
- [Metric 2 visualization]
- [Metric 3 visualization]

---

## 12. Documentation

### 12.1 Developer Documentation

**Location:** [Path to docs]

**Required Sections:**
- [ ] Schema overview
- [ ] Usage examples
- [ ] Common queries
- [ ] Troubleshooting guide

### 12.2 Operational Runbook

**Backup Strategy:**
- Frequency: [Daily|Weekly]
- Retention: [Duration]
- Storage: [Location]

**Recovery Procedures:**
1. [Step 1]
2. [Step 2]

---

## 13. Cost Impact

### 13.1 Storage Costs

| Component | Current | After Implementation | Delta |
|-----------|---------|---------------------|-------|
| Database storage | [X GB] | [Y GB] | [+Z GB] |
| Backup storage | [X GB] | [Y GB] | [+Z GB] |

### 13.2 Compute Costs

| Resource | Current Usage | Expected Usage | Delta |
|----------|---------------|----------------|-------|
| Database CPU | [X%] | [Y%] | [+Z%] |
| Memory | [X GB] | [Y GB] | [+Z GB] |

### 13.3 Total Cost Estimate

| Phase | Storage | Compute | Total/Month |
|-------|---------|---------|-------------|
| Initial | $[X] | $[Y] | $[Z] |
| 6 months | $[X] | $[Y] | $[Z] |
| 1 year | $[X] | $[Y] | $[Z] |

---

## 14. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk 1] | [High|Med|Low] | [High|Med|Low] | [Mitigation strategy] |
| [Risk 2] | [High|Med|Low] | [High|Med|Low] | [Mitigation strategy] |

---

## 15. Dependencies

### 15.1 Technical Dependencies

- [ ] [Dependency 1] - [Status]
- [ ] [Dependency 2] - [Status]

### 15.2 Team Dependencies

- [ ] [Team 1] needs to [action] - [Responsible person]
- [ ] [Team 2] needs to [action] - [Responsible person]

---

## 16. Success Criteria

### 16.1 Technical Success

- [ ] All tables created without errors
- [ ] All indexes functioning correctly
- [ ] RLS policies enforced properly
- [ ] Migration completed with data integrity validated
- [ ] Performance benchmarks met

### 16.2 Business Success

- [ ] [Business metric 1] achieved
- [ ] [Business metric 2] achieved
- [ ] User acceptance criteria met

---

## 17. Approval Sign-off

| Role | Name | Status | Date | Signature |
|------|------|--------|------|-----------|
| **Architect** | | [ ] Approved [ ] Rejected | | |
| **DBA** | | [ ] Approved [ ] Rejected | | |
| **Security** | | [ ] Approved [ ] Rejected | | |
| **Product Owner** | | [ ] Approved [ ] Rejected | | |

**Comments:**
[Espaço para comentários dos revisores]

---

## Changelog

- **YYYY-MM-DD v1.0:** Initial request
  - [Principais decisões/mudanças]

---

## References

- [Referência 1]
- [Referência 2]
- [Referência 3]

---

## Appendices

### Appendix A: Sample Data

```json
// Sample record 1
{
  "field1": "value1",
  "field2": "value2"
}
```

### Appendix B: Related Documentation

- [Link to related doc 1]
- [Link to related doc 2]
