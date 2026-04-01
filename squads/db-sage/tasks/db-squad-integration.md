# Database Integration Analysis for Squad

| Field | Value |
|-------|-------|
| **execution_type** | `Hybrid` |
| **pattern** | EXEC-HY-001 |
| **script** | `scripts/db-ops/squad-integration-preflight.sh` |
| **rationale** | Worker inventaria touchpoints e schema opcional; Agent sugere integrações |

> Task ID: db-squad-integration
> Agent: DB Sage (Database Architect)
> Version: 1.0.0

---

## 🚀 NEW: Use Deterministic Integration Preflight (RECOMMENDED)

**Token Savings: 90% | Time Savings: ~86%**

```bash
# Inventory a squad's data touchpoints before designing integration
./squads/db-sage/scripts/db-ops/squad-integration-preflight.sh {squad_name}

# Include a live schema snapshot when DB env is available
./squads/db-sage/scripts/db-ops/squad-integration-preflight.sh {squad_name} --include-schema

# Benefits:
#   - Deterministic inventory of inputs, outputs, state, and DB touchpoints
#   - Fast triage of whether DB integration is justified at all
#   - Optional live schema baseline before design decisions
#   - 90% token savings
```

**OR continue with manual squad analysis below:**

---

## Description

Analyze an squad's data requirements and design database integration strategy. Maps squad inputs/outputs/state to database schema, proposes tables/relationships, and generates migration plan.

## Prerequisites

- Squad installed and accessible
- Database connection configured (*env-check passed)
- Current schema documented or accessible

## Workflow

### Step 1: Identify Target Squad

**Elicit from user:**
- Which squad? (e.g., the target squad name)
- Path to squad directory

**Actions:**
- Verify squad exists and has config.yaml
- Load squad metadata (name, version, description)

---

### Step 2: Audit Squad Data Flows

**Scan squad structure for data touchpoints:**

```bash
# Look for data indicators
- Config files (*.yaml, *.json, .env.example)
- Input directories (sources/, inputs/, uploads/)
- Output directories (outputs/, generated/, artifacts/)
- State files (state.json, .cache/, db/)
- Scripts that read/write data
- API endpoints that handle data
```

**Document findings:**

```yaml
squad_audit:
  name: {squad_name}
  version: x.y.z

  data_inputs:
    - type: user_uploaded_content
      format: markdown
      location: sources/uploads/
      volume: ~N files per entity

    - type: configuration
      format: yaml
      location: config/{squad}-config.yaml
      fields: [name, type, settings]

  data_outputs:
    - type: processed_artifact
      format: yaml
      location: outputs/{squad}/{slug}/
      persistence_need: high (reusable artifact)

    - type: generated_content
      format: markdown
      location: outputs/{squad}/{slug}/content/
      persistence_need: high (versioned, queryable)

  state_requirements:
    - processing_status: [pending, in_progress, completed, failed]
    - last_run_timestamp
    - version_tracking
    - validation_scores

  relationships:
    - One user → many entities
    - One entity → many artifacts (versioned)
    - One entity → many content pieces
```

---

### Step 3: Analyze Current Database Schema

**Connect to database and inspect:**

```sql
-- List all tables
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public';

-- Check for related tables
SELECT * FROM pg_tables WHERE schemaname = 'public';

-- Look for existing patterns
-- Users, projects, assets, metadata tables?
```

**Document current schema:**

```yaml
current_schema:
  tables:
    - name: users
      has_auth: true
      fields: [id, email, created_at]

    - name: projects
      fields: [id, user_id, name, type, created_at]
      foreign_keys: [user_id → users.id]

  patterns_found:
    - Multi-tenancy via user_id
    - UUID primary keys
    - created_at/updated_at timestamps
    - RLS enabled on most tables
```

---

### Step 4: Design Integration Schema

**Map pack data to database tables:**

```yaml
proposed_schema:
  new_tables:

    # Example: domain entity table
    - name: entities
      purpose: Store primary domain objects
      fields:
        - id: uuid PRIMARY KEY
        - user_id: uuid REFERENCES users(id)
        - slug: text UNIQUE NOT NULL
        - name: text NOT NULL
        - type: text
        - status: entity_status_enum
        - version: integer DEFAULT 1
        - created_at: timestamptz
        - updated_at: timestamptz
      indexes:
        - (user_id, slug) UNIQUE
        - (status) WHERE status = 'active'
      rls: "Users can only access their own entities"

    - name: entity_artifacts
      purpose: Version-controlled generated outputs
      fields:
        - id: uuid PRIMARY KEY
        - entity_id: uuid REFERENCES entities(id) ON DELETE CASCADE
        - version: integer NOT NULL
        - artifact_type: text
        - content: text NOT NULL
        - metadata: jsonb
        - created_at: timestamptz
      indexes:
        - (entity_id, version, artifact_type) UNIQUE
      rls: "Inherit from entities table via entity_id"

    - name: entity_content
      purpose: Searchable content store
      fields:
        - id: uuid PRIMARY KEY
        - entity_id: uuid REFERENCES entities(id) ON DELETE CASCADE
        - content_text: text NOT NULL
        - embedding: vector(1536)  # For similarity search
        - metadata: jsonb (source_file, chunk_index, etc.)
        - created_at: timestamptz
      indexes:
        - (entity_id)
        - GiST (embedding vector_cosine_ops)
      rls: "Inherit from entities table"

  modified_tables: []

  enums:
    - name: entity_status_enum
      values: [pending, processing, completed, failed, archived]

  functions:
    - name: search_entity_content(entity_id uuid, query_embedding vector)
      purpose: Vector similarity search
      returns: TABLE(content_id uuid, content_text text, similarity float)
```

---

### Step 5: Validate Integration Design

**Run checks:**

- [ ] All pack outputs have storage strategy
- [ ] All pack inputs can be referenced (user uploads → table?)
- [ ] State requirements mapped to fields
- [ ] Foreign keys enforce relationships
- [ ] RLS policies defined for all tables
- [ ] Indexes support expected queries (list minds, search KB, version lookup)
- [ ] No orphaned data (CASCADE on deletes)
- [ ] Follows existing schema patterns (user_id, timestamps, etc.)

**KISS Gate check:**

- Is database even needed? (If pack works fine with filesystem, stop here)
- What problem does this solve? (searchability? multi-user? versioning?)
- Can existing tables be extended instead? (e.g., generic `projects` table?)
- Minimum viable schema? (Start with 1 table, expand later if needed)

---

### Step 6: Generate Migration Plan

**Create migration strategy:**

```yaml
migration_plan:
  phase_1_foundation:
    - Create enums (mind_status_enum)
    - Create base table (minds)
    - Add RLS policies to minds
    - Create seed data (test mind)

  phase_2_extensions:
    - Create related tables (mind_system_prompts, mind_knowledge_chunks)
    - Add foreign keys
    - Add indexes
    - Enable RLS on related tables

  phase_3_functions:
    - Create vector search function
    - Create helper views (active_minds, latest_prompts)

  rollback_strategy:
    - Snapshot before each phase
    - Rollback scripts generated
    - Test on staging first

  risk_assessment:
    - Low risk: New tables, no existing data affected
    - Medium risk: If modifying existing tables
    - High risk: If changing core auth/users tables
```

**Generate actual migration files:**

```bash
# Use template to generate
*create-migration-plan

# Then scaffold files
supabase/migrations/20251027_001_create_minds_table.sql
supabase/migrations/20251027_002_create_mind_prompts_table.sql
supabase/migrations/20251027_003_create_mind_kb_table.sql
supabase/migrations/20251027_004_add_vector_search.sql
```

---

### Step 7: Generate Integration Documentation

**Create docs/{squad-name}/database-integration.md:**

```markdown
# {Squad Name} Database Integration

## Overview
{Squad} data is now persisted in Supabase with full RLS, versioning, and search.

## Schema

### entities table
- Stores core domain objects
- One per primary entity
- User-scoped via RLS

### entity_artifacts table
- Version-controlled generated outputs
- Many per entity
- Allows A/B testing and rollback

### entity_content table
- Searchable content store
- Vector embeddings for similarity search
- Efficient retrieval during operations

## Usage

### Creating an entity
```sql
INSERT INTO entities (user_id, slug, name, type)
VALUES (auth.uid(), 'my-entity', 'My Entity', 'default');
```

### Storing an artifact
```sql
INSERT INTO entity_artifacts (entity_id, version, artifact_type, content)
VALUES (:entity_id, 1, 'primary', :content);
```

### Searching content
```sql
SELECT * FROM search_entity_content(
  :entity_id,
  :query_embedding::vector(1536)
)
LIMIT 10;
```

## Migration Path

1. Run migrations in order (see supabase/migrations/)
2. Backfill existing data from outputs/ directory
3. Update squad scripts to read/write database
4. Keep filesystem outputs as backup during transition
```

---

### Step 8: Output Integration Report

**Generate squads/{pack-name}/database-integration-report.yaml:**

```yaml
integration_analysis:
  squad: {squad_name}
  database: supabase_production
  analysis_date: YYYY-MM-DD
  analyst: DB Sage

summary:
  recommendation: "Integrate with database"
  rationale: |
    - Multi-user access required
    - Version tracking needed
    - Search capability needed
    - Filesystem alone cannot support these requirements

  tables_added: 3
  tables_modified: 0
  migration_risk: low
  estimated_effort: 4 hours (design + migrate + test)

schema_design:
  file: docs/{squad_name}/database-schema.yaml
  erd: docs/{squad_name}/database-erd.png (generate with *create-schema)

migration_plan:
  file: docs/{squad_name}/migration-plan.yaml
  migrations_directory: supabase/migrations/
  rollback_scripts: supabase/rollback/

next_steps:
  - [ ] Review schema design with team
  - [ ] Approve migration plan
  - [ ] Run *snapshot baseline
  - [ ] Execute migrations (*migrate)
  - [ ] Test integration (*smoke-test)
  - [ ] Update squad scripts to use database
  - [ ] Deploy to staging
  - [ ] Monitor for 48h
  - [ ] Deploy to production
```

---

## Success Criteria

- [ ] Squad data flows fully documented
- [ ] Current schema analyzed
- [ ] Integration schema designed (follows patterns, has RLS)
- [ ] KISS Gate validation passed (database is actually needed)
- [ ] Migration plan generated with rollback strategy
- [ ] Integration documentation created
- [ ] Report generated with clear next steps

---

## Output Files

```
squads/{pack-name}/
├── database-integration-report.yaml  ← Main output
├── data-flow-audit.yaml              ← Step 2 findings
└── schema-design.yaml                ← Step 4 design

docs/{pack-name}/
├── database-integration.md           ← Usage guide
├── database-schema.yaml              ← Schema definition
└── migration-plan.yaml               ← Migration strategy

supabase/migrations/
└── 2025MMDD_NNN_{squad}_*.sql       ← Ready to apply
```

---

## Examples

### Example: Course Platform Integration

```yaml
# A course platform squad → needs to store:
# - Course metadata (title, description, status)
# - Curriculum structure (modules, lessons)
# - Generated content (scripts, quizzes)
# - User progress (if multi-user platform)

proposed_schema:
  - courses table (id, user_id, slug, title, status)
  - course_modules table (id, course_id, order, title)
  - course_lessons table (id, module_id, order, title, content_type)
  - course_content table (id, lesson_id, content, generated_at)
```

### Example: Assessment Platform Integration

```yaml
# An assessment squad → needs to store:
# - Assessment definitions (types, questions)
# - User responses (answers, timestamps)
# - Computed results (profiles, scores)

proposed_schema:
  - assessments table (id, name, type, questions_jsonb)
  - user_assessments table (id, user_id, assessment_id, completed_at)
  - assessment_responses table (id, user_assessment_id, question_id, response)
  - assessment_results table (id, user_assessment_id, results_jsonb)
```

---

## Notes

- **Always run KISS Gate validation** - database might not be needed
- **Follow existing patterns** - don't reinvent (user_id, timestamps, RLS)
- **Start minimal** - can always add tables later
- **Think about queries** - indexes should match access patterns
- **Plan for scale** - vector search, partitioning if needed
- **RLS from day 1** - security cannot be retrofitted easily
- **Document everything** - future maintainers will thank you

---

## Related Tasks

- `*kiss` - Run before this task (auto-analyzes schema)
- `*create-schema` - Generate full schema documentation with ERD
- `*create-migration-plan` - Generate detailed migration strategy
- `*migrate` - Execute the actual migrations
- `*smoke-test` - Validate integration after migration
