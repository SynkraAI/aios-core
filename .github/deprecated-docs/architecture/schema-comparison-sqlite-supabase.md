# 🔄 Schema Comparison: SQLite (MMOS) vs Supabase v0.7.0

**Analysis Date:** 2025-10-27
**SQLite:** `outputs/database/mmos.db` (872 KB, 18 tables)
**Supabase:** `v0.7.0 baseline` (30 tables, 793 lines SQL)

---

## 📊 Overview

### Tables Summary

| Category | SQLite | Supabase | Shared | SQLite Only | Supabase Only |
|----------|--------|----------|--------|-------------|---------------|
| **Core** | 18 | 30 | 8 | 10 | 22 |

### Shared Tables (exist in both)
1. ✅ minds
2. ✅ sources
3. ✅ fragments
4. ✅ tags
5. ✅ domains
6. ✅ specializations
7. ✅ skills
8. ✅ traits
9. ⚠️ trait_scores (partial match)

### SQLite-Only Tables (MMOS-specific)
1. ❌ profiles
2. ❌ system_prompts
3. ❌ specialists
4. ❌ proficiencies
5. ❌ mind_proficiency_scores
6. ❌ mind_specialization_rankings
7. ❌ pipeline_progress
8. ❌ analysis
9. ❌ fragment_tags
10. ❌ schema_version

### Supabase-Only Tables (Platform-specific)
1. mind_aliases
2. user_profiles (auth integration)
3. categories
4. ingestion_batches
5. processing_queue
6. job_executions
7. fragment_relationships
8. mind_profiles
9. mind_values
10. mind_obsessions
11. mind_routine_windows
12. mind_psychometrics
13. mind_proficiencies (different from SQLite proficiencies!)
14. content_frameworks
15. content_projects
16. audience_profiles
17. content_pieces
18. content_campaigns
19. content_campaign_pieces
20. content_performance
21. fragment_tags (different implementation)

---

## 🔍 DETAILED TABLE-BY-TABLE COMPARISON

---

## 1️⃣ TABLE: `minds`

**Purpose:** Core entity representing a mind/subject/person

### Field Comparison

| Field | SQLite Type | Supabase Type | Compatible? | Notes |
|-------|-------------|---------------|-------------|-------|
| **id** | INTEGER PK AUTO | UUID DEFAULT gen_random_uuid() | ❌ **CRITICAL** | Need UUID generation + mapping |
| **slug** | TEXT UNIQUE NOT NULL | TEXT UNIQUE NOT NULL | ✅ | Perfect match |
| **display_name** | TEXT NOT NULL | TEXT NOT NULL | ✅ | Perfect match |
| **subject_type** | TEXT CHECK | ❌ Missing | ❌ | SQLite-only: 'public_figure', 'private_user' |
| **privacy_level** | TEXT DEFAULT 'public' CHECK | TEXT DEFAULT 'public' CHECK | ✅ | Perfect match (public/private) |
| **category** | TEXT | ❌ Missing | ❌ | SQLite-only field |
| **primary_domain** | TEXT (FK comment only) | ❌ Missing | ❌ | FK never implemented |
| **primary_language** | ❌ Missing | CHAR(2) | ⚠️ | Supabase-only: 'pt', 'en' |
| **short_bio** | ❌ Missing | TEXT | ⚠️ | Supabase-only |
| **birth_year** | INTEGER | ❌ Missing | ❌ | SQLite-only |
| **nationality** | TEXT | ❌ Missing | ❌ | SQLite-only |
| **known_aliases** | TEXT (JSON array) | ❌ Missing | ❌ | SQLite-only (in Supabase: mind_aliases table) |
| **status** | TEXT DEFAULT 'active' CHECK | ❌ Missing | ❌ | SQLite-only: active/inactive/completed/archived |
| **current_phase** | TEXT | ❌ Missing | ❌ | SQLite-only: viability/research/analysis/synthesis/implementation/testing |
| **apex_score** | REAL (0.0-10.0) | NUMERIC(3,2) (0.00-1.00) | ⚠️ **SCALE DIFF** | SQLite: 0-10, Supabase: 0-1 (divide by 10) |
| **icp_match** | TEXT CHECK (low/medium/high) | ❌ Missing | ❌ | SQLite-only |
| **quality_grade** | TEXT | ❌ Missing | ❌ | SQLite-only: 'A', 'A-', 'B+' |
| **completeness** | REAL (0.00-1.00) | ❌ Missing | ❌ | SQLite-only |
| **confidence_avg** | REAL (0.00-1.00) | ❌ Missing | ❌ | SQLite-only |
| **total_tokens_used** | INTEGER DEFAULT 0 | ❌ Missing | ❌ | SQLite-only (in Supabase: job_executions) |
| **total_cost_usd** | REAL DEFAULT 0.00 | ❌ Missing | ❌ | SQLite-only (in Supabase: job_executions) |
| **processing_started_at** | TEXT (ISO8601) | ❌ Missing | ❌ | SQLite-only |
| **processing_completed_at** | TEXT (ISO8601) | ❌ Missing | ❌ | SQLite-only |
| **processing_duration_seconds** | INTEGER | ❌ Missing | ❌ | SQLite-only |
| **pipeline_version** | TEXT | ❌ Missing | ❌ | SQLite-only: '2.0', '3.1' |
| **agent_versions** | TEXT (JSON) | ❌ Missing | ❌ | SQLite-only |
| **version** | TEXT DEFAULT 'v1.0.0' | ❌ Missing | ❌ | SQLite-only |
| **created_at** | TEXT DEFAULT CURRENT_TIMESTAMP | TIMESTAMPTZ DEFAULT now() | ⚠️ **TYPE DIFF** | TEXT vs TIMESTAMPTZ |
| **updated_at** | TEXT DEFAULT CURRENT_TIMESTAMP | TIMESTAMPTZ DEFAULT now() | ⚠️ **TYPE DIFF** | TEXT vs TIMESTAMPTZ + trigger |
| **created_by** | TEXT | TEXT | ✅ | Match (but Supabase links to auth.users) |
| **deleted_at** | TEXT (soft delete) | ❌ Missing | ❌ | SQLite-only (Supabase uses hard delete) |

### 🎯 DB Sage Considerations:

**Compatibility Score: 🟡 40% (Medium Complexity)**

**Critical Issues:**
1. **🔴 PK Type Mismatch:** INTEGER → UUID requires UUID generation + lookup table
2. **🟡 apex_score Scale:** 0-10 → 0-1 (simple division)
3. **🟡 Timestamps:** TEXT ISO8601 → TIMESTAMPTZ (parseable)
4. **🔴 Soft Deletes:** SQLite uses `deleted_at`, Supabase doesn't

**Migration Strategy:**
- ✅ **Migrate:** slug, display_name, privacy_level, apex_score (÷10), created_by
- 🔄 **Transform:** id (generate UUID), timestamps (parse ISO8601)
- 📦 **Store in JSON:** Store SQLite-only fields in JSONB extension column
- ⚠️ **Filter:** Skip soft-deleted records (`WHERE deleted_at IS NULL`)

**Recommended Approach:**
```sql
-- Option A: Add extension column to Supabase
ALTER TABLE minds ADD COLUMN mmos_metadata JSONB;

-- Store: category, subject_type, quality_grade, completeness,
--        pipeline_version, agent_versions, processing metrics

-- Option B: Create separate mmos_minds_metadata table
CREATE TABLE mmos_minds_metadata (
  mind_id UUID PRIMARY KEY REFERENCES minds(id),
  category TEXT,
  quality_grade TEXT,
  completeness NUMERIC(3,2),
  pipeline_version TEXT,
  ...
);
```

**My Recommendation:** **Option A** - Use JSONB extension column for MMOS-specific metadata. Keep Supabase schema clean.

---

## 2️⃣ TABLE: `sources`

**Purpose:** Source materials (interviews, books, articles, etc.)

### Field Comparison

| Field | SQLite Type | Supabase Type | Compatible? | Notes |
|-------|-------------|---------------|-------------|-------|
| **id** | INTEGER PK AUTO | UUID DEFAULT gen_random_uuid() | ❌ **CRITICAL** | Need UUID generation |
| **mind_id** | INTEGER FK → minds(id) | UUID FK → minds(id) | ❌ **CRITICAL** | Type mismatch + CASCADE diff |
| **source_id** | TEXT UNIQUE | ❌ Missing | ❌ | SQLite: 'sam_altman_podcast_001' |
| **title** | TEXT | TEXT NOT NULL | ⚠️ | Supabase: NOT NULL |
| **file_path** | TEXT NOT NULL | ❌ Missing | ❌ | SQLite-only: relative path |
| **source_url** | TEXT | TEXT (named 'url') | ✅ | Different name, same purpose |
| **type** | TEXT NOT NULL CHECK(...) | TEXT NOT NULL | ⚠️ | SQLite has CHECK constraint |
| **platform** | TEXT | ❌ Missing | ❌ | SQLite-only: 'YouTube', 'Medium' |
| **author** | TEXT | TEXT | ✅ | Perfect match |
| **date_published** | TEXT (ISO8601) | DATE NOT NULL | ⚠️ **TYPE DIFF** | TEXT vs DATE (parse required) |
| **language** | ❌ Missing | CHAR(2) | ⚠️ | Supabase-only |
| **quality** | ❌ Missing | TEXT NOT NULL | ⚠️ | Supabase: 'primary', 'secondary', 'tertiary' |
| **publisher** | ❌ Missing | TEXT | ⚠️ | Supabase-only |
| **isbn** | ❌ Missing | TEXT | ⚠️ | Supabase-only |
| **page_count** | ❌ Missing | INT | ⚠️ | Supabase-only |
| **duration** | ❌ Missing | TEXT | ⚠️ | Supabase-only |
| **raw_content** | TEXT | ❌ Missing | ❌ | SQLite-only |
| **clean_content** | TEXT | ❌ Missing | ❌ | SQLite-only |
| **word_count** | INTEGER | ❌ Missing | ❌ | SQLite-only |
| **char_count** | INTEGER | ❌ Missing | ❌ | SQLite-only |
| **layer_relevance** | INTEGER CHECK(1-8) | ❌ Missing | ❌ | SQLite-only (DNA Mental) |
| **metadata** | TEXT (JSON) | ❌ Missing | ❌ | SQLite-only |
| **structural_format** | TEXT | ❌ Missing | ❌ | SQLite-only |
| **tier** | INTEGER CHECK(1-4) | ❌ Missing | ❌ | SQLite-only (InnerLens) |
| **priority_score** | REAL (0.00-1.00) | ❌ Missing | ❌ | SQLite-only |
| **priority_reasoning** | TEXT | ❌ Missing | ❌ | SQLite-only |
| **pre_eval_decision** | TEXT CHECK | ❌ Missing | ❌ | SQLite-only |
| **pre_eval_reasoning** | TEXT | ❌ Missing | ❌ | SQLite-only |
| **expected_yield** | INTEGER | ❌ Missing | ❌ | SQLite-only |
| **status** | TEXT DEFAULT 'discovered' CHECK | ❌ Missing | ❌ | SQLite-only |
| **processed_at** | TEXT (ISO8601) | ❌ Missing | ❌ | SQLite-only |
| **actual_yield** | INTEGER | ❌ Missing | ❌ | SQLite-only |
| **avg_fragment_layer** | REAL | ❌ Missing | ❌ | SQLite-only |
| **high_layer_percentage** | REAL | ❌ Missing | ❌ | SQLite-only |
| **pipeline_version** | TEXT | ❌ Missing | ❌ | SQLite-only |
| **cleaning_version** | TEXT | ❌ Missing | ❌ | SQLite-only |
| **extraction_version** | TEXT | ❌ Missing | ❌ | SQLite-only |
| **created_at** | TEXT | TIMESTAMPTZ NOT NULL | ⚠️ | Type difference |
| **updated_at** | TEXT | TIMESTAMPTZ NOT NULL | ⚠️ | Type difference |
| **deleted_at** | TEXT (soft delete) | ❌ Missing | ❌ | SQLite-only |

### 🎯 DB Sage Considerations:

**Compatibility Score: 🔴 25% (High Complexity)**

**Critical Issues:**
1. **🔴 Completely Different Schemas:** Only 4 fields match (title, author, url, timestamps)
2. **🔴 SQLite is MUCH richer:** 30+ fields for content analysis, prioritization, pipeline tracking
3. **🔴 Supabase is metadata-focused:** Book/article metadata (ISBN, publisher, page_count)
4. **🔴 Content Storage:** SQLite stores raw_content + clean_content (potentially MB per source)

**Philosophical Difference:**
- **SQLite (MMOS):** "Source = Content + Processing Status + Analytics"
- **Supabase v0.7.0:** "Source = Bibliographic Reference"

**Migration Strategy:**

**Option A: Hybrid (RECOMMENDED)**
```sql
-- Supabase: Lightweight metadata only
INSERT INTO sources (mind_id, title, author, url, type, published_date, quality)
SELECT uuid_map[mind_id], title, author, source_url, type, date_published, 'primary'
FROM sqlite_sources WHERE deleted_at IS NULL;

-- Keep in SQLite: raw_content, clean_content, processing status
-- Link via source_id or create sync table
```

**Option B: Extend Supabase**
```sql
-- Add MMOS fields
ALTER TABLE sources ADD COLUMN content_storage_url TEXT; -- S3/R2 URL
ALTER TABLE sources ADD COLUMN word_count INT;
ALTER TABLE sources ADD COLUMN processing_status TEXT;
ALTER TABLE sources ADD COLUMN mmos_metadata JSONB;
```

**Option C: Separate Content Table**
```sql
CREATE TABLE source_content (
  source_id UUID PRIMARY KEY REFERENCES sources(id),
  raw_content TEXT,
  clean_content TEXT,
  word_count INT,
  char_count INT,
  processing_status TEXT,
  pipeline_metadata JSONB
);
```

**My Recommendation:** **Option A (Hybrid)** - Supabase stores metadata, SQLite/filesystem stores content. Why?
- Content is HUGE (potentially MB per source)
- Supabase charges per GB storage
- Content is read-only after processing
- Can move to S3/R2 later if needed

---

## 3️⃣ TABLE: `fragments`

**Purpose:** Atomic units of cognitive data extracted from sources

### Field Comparison

| Field | SQLite Type | Supabase Type | Compatible? | Notes |
|-------|-------------|---------------|-------------|-------|
| **id** | TEXT PK (UUID string) | UUID PK | ⚠️ | Both UUID, but SQLite stores as TEXT |
| **mind_id** | INTEGER FK | UUID FK | ❌ **CRITICAL** | Type mismatch |
| **source_id** | INTEGER FK | UUID FK | ❌ **CRITICAL** | Type mismatch |
| **category_id** | ❌ Missing | BIGINT FK (required!) | ❌ **BLOCKER** | Supabase REQUIRES category |
| **ingestion_batch_id** | ❌ Missing | UUID FK | ⚠️ | Supabase tracking |
| **generation_execution_id** | ❌ Missing | UUID FK | ⚠️ | Supabase cost tracking |
| **fragment_type** | TEXT CHECK (12 types) | ❌ Missing | ❌ | SQLite: rich taxonomy |
| **type** | ❌ Missing | TEXT NOT NULL | ❌ | Supabase: simple string |
| **content** | TEXT NOT NULL (JSON) | TEXT NOT NULL | ⚠️ **STRUCTURE DIFF** | SQLite: JSON, Supabase: plain text |
| **context** | ❌ Missing | TEXT NOT NULL | ❌ | Supabase-only |
| **insight** | ❌ Missing | TEXT NOT NULL | ❌ | Supabase-only |
| **cognitive_theme** | TEXT NOT NULL | ❌ Missing | ❌ | SQLite-only: 'autonomy_preference' |
| **layer** | INTEGER CHECK(1-8) | SMALLINT CHECK(1-8) | ✅ **MATCH!** | DNA Mental layer - compatible! |
| **domains** | TEXT (JSON array) | ❌ Missing | ❌ | SQLite-only |
| **emotional_markers** | TEXT (JSON array) | ❌ Missing | ❌ | SQLite-only |
| **evasion_detected** | INTEGER (0/1) | ❌ Missing | ❌ | SQLite-only |
| **evasion_details** | TEXT | ❌ Missing | ❌ | SQLite-only |
| **signature_concepts** | TEXT (JSON array) | ❌ Missing | ❌ | SQLite-only |
| **confidence** | REAL (0.00-1.00) | ❌ Missing | ❌ | SQLite: AI confidence |
| **relevance** | ❌ Missing | NUMERIC (computed) | ⚠️ | Supabase: relevance_10/10.0 |
| **relevance_10** | ❌ Missing | SMALLINT (0-10) | ⚠️ | Supabase: 0-10 score |
| **why_significant** | TEXT NOT NULL | ❌ Missing | ❌ | SQLite-only |
| **evidence_type** | TEXT CHECK | ❌ Missing | ❌ | SQLite-only |
| **hierarchy** | TEXT CHECK | ❌ Missing | ❌ | SQLite-only: fundamental/derived |
| **derives_from** | TEXT (JSON array) | ❌ Missing | ❌ | SQLite-only |
| **related_fragments** | TEXT (JSON array) | ❌ Missing | ❌ | SQLite: inline, Supabase: fragment_relationships table |
| **raw_excerpt** | TEXT NOT NULL | ❌ Missing | ❌ | SQLite-only |
| **location** | ❌ Missing | TEXT NOT NULL | ❌ | Supabase: page/timestamp |
| **source_timestamp** | TEXT | ❌ Missing | ❌ | SQLite version of location |
| **char_start** | INTEGER | ❌ Missing | ❌ | SQLite-only |
| **char_end** | INTEGER | ❌ Missing | ❌ | SQLite-only |
| **extraction_method** | TEXT NOT NULL | ❌ Missing | ❌ | SQLite-only |
| **extraction_version** | TEXT NOT NULL | ❌ Missing | ❌ | SQLite-only |
| **pipeline_version** | TEXT NOT NULL | ❌ Missing | ❌ | SQLite-only |
| **self_critique_passed** | INTEGER (0/1) | ❌ Missing | ❌ | SQLite-only |
| **critique_log** | TEXT (JSON) | ❌ Missing | ❌ | SQLite-only |
| **refinements_applied** | TEXT (JSON array) | ❌ Missing | ❌ | SQLite-only |
| **validated** | INTEGER (0/1/NULL) | ❌ Missing | ❌ | SQLite-only |
| **validation_status** | TEXT CHECK | ❌ Missing | ❌ | SQLite-only |
| **validation_reasoning** | TEXT | ❌ Missing | ❌ | SQLite-only |
| **temporal_context** | TEXT | ❌ Missing | ❌ | SQLite-only |
| **evolution_marker** | INTEGER (0/1) | ❌ Missing | ❌ | SQLite-only |
| **tsv** | ❌ Missing | tsvector (FTS) | ⚠️ | Supabase: full-text search |
| **created_at** | TEXT | TIMESTAMPTZ NOT NULL | ⚠️ | Type difference |
| **updated_at** | TEXT | TIMESTAMPTZ NOT NULL | ⚠️ | Type difference |
| **deleted_at** | TEXT (soft delete) | ❌ Missing | ❌ | SQLite-only |

### 🎯 DB Sage Considerations:

**Compatibility Score: 🔴 15% (Very High Complexity)**

**This is THE most complex migration.**

**Critical Issues:**
1. **🔴 BLOCKER: category_id REQUIRED in Supabase** - No matching concept in SQLite
2. **🔴 Completely Different Data Models:**
   - **SQLite:** Rich cognitive metadata (40+ fields)
   - **Supabase:** Simple content/context/insight (8 core fields)
3. **🔴 Content Structure:**
   - **SQLite:** Structured JSON per fragment_type
   - **Supabase:** Plain text strings
4. **🔴 Relationships:**
   - **SQLite:** Inline JSON arrays
   - **Supabase:** Separate fragment_relationships table

**Philosophical Difference:**
- **SQLite (MMOS):** "Fragment = Cognitive Unit with Rich Metadata"
- **Supabase v0.7.0:** "Fragment = Content Snippet with Relevance Score"

**Migration Strategy:**

This requires **DATA TRANSFORMATION**, not just type conversion.

**Option A: Lossy Migration (NOT RECOMMENDED)**
```sql
-- Map SQLite → Supabase (loses 30+ fields of data!)
INSERT INTO fragments (
  id, mind_id, source_id, category_id, layer, type,
  content, context, insight, location, relevance_10
)
SELECT
  id::uuid,
  uuid_map[mind_id],
  uuid_map[source_id],
  1, -- PROBLEM: What category? Default to 1?
  layer,
  fragment_type,
  content, -- JSON → text
  cognitive_theme, -- map to context
  why_significant, -- map to insight
  COALESCE(source_timestamp, char_start::text),
  ROUND(confidence * 10)
FROM sqlite_fragments
WHERE deleted_at IS NULL;

-- LOSES: emotional_markers, signature_concepts, evasion_detected,
--        evidence_type, hierarchy, validation, critique_log, etc.
```

**Option B: Extended Schema (RECOMMENDED)**
```sql
-- Extend Supabase fragments table
ALTER TABLE fragments ADD COLUMN mmos_metadata JSONB;

-- Store rich metadata in JSONB
UPDATE fragments SET mmos_metadata = jsonb_build_object(
  'fragment_type', ...,
  'cognitive_theme', ...,
  'emotional_markers', ...,
  'confidence', ...,
  'hierarchy', ...,
  -- ... all SQLite-specific fields
);

-- Still have BLOCKER: category_id required
-- Solution: Create default categories
INSERT INTO categories (code, name, description) VALUES
  ('mmos_cognitive', 'MMOS Cognitive Fragment', 'DNA Mental cognitive analysis'),
  ('mmos_behavioral', 'MMOS Behavioral Fragment', 'Behavioral patterns'),
  ('mmos_values', 'MMOS Values Fragment', 'Core values and beliefs');
```

**Option C: Parallel Tables (CLEANEST)**
```sql
-- Keep Supabase fragments simple
-- Create mmos_fragments for rich metadata
CREATE TABLE mmos_fragments (
  fragment_id UUID PRIMARY KEY REFERENCES fragments(id),
  fragment_type TEXT,
  cognitive_theme TEXT,
  emotional_markers JSONB,
  signature_concepts JSONB,
  confidence NUMERIC(3,2),
  hierarchy TEXT,
  evidence_type TEXT,
  validation_status TEXT,
  -- ... all MMOS-specific fields
);
```

**My Recommendation:** **Option C (Parallel Tables)** - Keep schemas separate, clean, and maintainable. Why?
- Supabase schema stays clean for general use
- MMOS data stays rich and queryable
- No lossy transformations
- Easy to extend independently
- Clear separation of concerns

**For Migration:**
1. Create default category: `mmos_cognitive_unit`
2. Migrate core fields to `fragments`
3. Migrate rich metadata to `mmos_fragments`
4. Use JOINs when needing full data

---

## 4️⃣ TABLE: `tags`

**Purpose:** Tagging taxonomy

### Field Comparison

| Field | SQLite Type | Supabase Type | Compatible? | Notes |
|-------|-------------|---------------|-------------|-------|
| **id** | INTEGER PK AUTO | BIGSERIAL PK | ⚠️ | Both integers, compatible |
| **tag_name** | TEXT UNIQUE | ❌ Missing | ❌ | SQLite-only |
| **name** | ❌ Missing | TEXT UNIQUE NOT NULL | ❌ | Supabase-only |
| **tag_type** | TEXT NOT NULL CHECK | ❌ Missing | ❌ | SQLite: domain/layer/concept/emotion/... |
| **category** | ❌ Missing | ❌ Missing | - | Neither has this |
| **description** | TEXT | ❌ Missing | ❌ | SQLite-only |
| **parent_tag_id** | INTEGER FK (self) | ❌ Missing | ❌ | SQLite: hierarchical tags |
| **usage_count** | INTEGER DEFAULT 0 | ❌ Missing | ❌ | SQLite: auto-incremented |
| **tag_type** (Supabase) | ❌ Missing | TEXT NOT NULL | ⚠️ | Supabase: 'domain', 'theme' |
| **created_at** | TEXT | TIMESTAMPTZ NOT NULL | ⚠️ | Type difference |
| **updated_at** | ❌ Missing | TIMESTAMPTZ NOT NULL | ⚠️ | Supabase-only |

### 🎯 DB Sage Considerations:

**Compatibility Score: 🟢 70% (Low Complexity)**

**Good news:** Both have similar purpose, field names just differ.

**Migration Strategy:**
```sql
-- Direct mapping (if you have SQLite tags - currently 0 rows)
INSERT INTO tags (name, tag_type, created_at)
SELECT tag_name, tag_type, created_at::timestamptz
FROM sqlite_tags;

-- Note: Lose hierarchical structure (parent_tag_id)
-- Note: Lose usage_count (can recompute)
```

**My Recommendation:** ✅ **Migrate directly** - Schema is compatible enough. Current data: 0 rows, so no action needed now.

---

## 5️⃣ TABLE: `domains`

**Purpose:** Domain taxonomy (business, tech, health, etc.)

### Field Comparison

| Field | SQLite Type | Supabase Type | Compatible? | Notes |
|-------|-------------|---------------|-------------|-------|
| **id** | TEXT PK | BIGSERIAL PK | ❌ | SQLite: text codes, Supabase: integers |
| **code** | ❌ Missing | TEXT UNIQUE NOT NULL | ⚠️ | Supabase has it |
| **name** | TEXT NOT NULL | TEXT NOT NULL | ✅ | Perfect match |
| **description** | TEXT | TEXT | ✅ | Perfect match |
| **icon** | TEXT | ❌ Missing | ❌ | SQLite-only: emoji |
| **sort_order** | INTEGER DEFAULT 0 | ❌ Missing | ❌ | SQLite-only |
| **created_at** | TEXT | ❌ Missing | ❌ | SQLite-only |
| **updated_at** | TEXT | ❌ Missing | ❌ | SQLite-only |

### 🎯 DB Sage Considerations:

**Compatibility Score: 🟡 75% (Low Complexity)**

**Migration Strategy:**
```sql
-- SQLite id (text) → Supabase code (text)
-- Generate new BIGSERIAL id
INSERT INTO supabase.domains (code, name, description)
SELECT id, name, description
FROM sqlite_domains;

-- Problem: Other tables reference domains.id
-- Need to update specializations.domain_id references
```

**My Recommendation:** ✅ **Migrate with ID remapping** - Create lookup table `sqlite_domain_id → supabase_domain_id`.

---

## 6️⃣ TABLE: `specializations`

**Purpose:** Specialization categories (copywriter, engineer, etc.)

### Field Comparison

| Field | SQLite Type | Supabase Type | Compatible? | Notes |
|-------|-------------|---------------|-------------|-------|
| **id** | TEXT PK | BIGSERIAL PK | ❌ | Type mismatch |
| **domain_id** | TEXT FK | BIGINT FK | ❌ | Reference type mismatch |
| **code** | ❌ Missing | TEXT UNIQUE NOT NULL | ⚠️ | Supabase has it |
| **name** | TEXT NOT NULL | TEXT NOT NULL | ✅ | Perfect match |
| **description** | TEXT | TEXT | ✅ | Perfect match |
| **icon** | TEXT | ❌ Missing | ❌ | SQLite-only |
| **sort_order** | INTEGER DEFAULT 0 | ❌ Missing | ❌ | SQLite-only |
| **created_at** | TEXT | ❌ Missing | ❌ | SQLite-only |
| **updated_at** | TEXT | ❌ Missing | ❌ | SQLite-only |

### 🎯 DB Sage Considerations:

**Compatibility Score: 🟡 75% (Low Complexity)**

**Migration Strategy:** Same as domains - migrate with ID remapping.

---

## 7️⃣ TABLE: `skills`

**Purpose:** Skill definitions

### Field Comparison

| Field | SQLite Type | Supabase Type | Compatible? | Notes |
|-------|-------------|---------------|-------------|-------|
| **id** | TEXT PK | BIGSERIAL PK | ❌ | Type mismatch |
| **specialization_id** | TEXT FK | BIGINT FK | ❌ | Reference type mismatch |
| **code** | ❌ Missing | TEXT UNIQUE NOT NULL | ⚠️ | Supabase has it |
| **name** | TEXT NOT NULL | TEXT NOT NULL | ✅ | Perfect match |
| **description** | TEXT | TEXT | ✅ | Perfect match |
| **sort_order** | INTEGER DEFAULT 0 | ❌ Missing | ❌ | SQLite-only |
| **created_at** | TEXT | ❌ Missing | ❌ | SQLite-only |
| **updated_at** | TEXT | ❌ Missing | ❌ | SQLite-only |

### 🎯 DB Sage Considerations:

**Compatibility Score: 🟡 75% (Low Complexity)**

**Migration Strategy:** Same as domains/specializations.

---

## 8️⃣ TABLE: `traits`

**Purpose:** Psychological trait definitions (Big Five, custom)

### Field Comparison

| Field | SQLite Type | Supabase Type | Compatible? | Notes |
|-------|-------------|---------------|-------------|-------|
| **id** | ❌ Missing | BIGSERIAL PK | ⚠️ | Supabase has it |
| **code** | INTEGER PK | TEXT UNIQUE NOT NULL | ❌ | SQLite: integer codes, Supabase: text codes |
| **name** | TEXT NOT NULL UNIQUE | TEXT NOT NULL | ✅ | Perfect match |
| **description** | TEXT NOT NULL | TEXT | ✅ | Match (nullable difference) |
| **domain** | TEXT CHECK | ❌ Missing | ❌ | SQLite-only: cognitive/emotional/motivation/... |
| **subdomain** | TEXT | ❌ Missing | ❌ | SQLite-only |
| **scale_min_label** | TEXT | ❌ Missing | ❌ | SQLite-only: 'Low autonomy' |
| **scale_max_label** | TEXT | ❌ Missing | ❌ | SQLite-only: 'High autonomy' |
| **related_frameworks** | TEXT (JSON) | ❌ Missing | ❌ | SQLite-only |
| **inverse_of** | INTEGER FK (self) | ❌ Missing | ❌ | SQLite-only |
| **created_at** | TEXT | ❌ Missing | ❌ | SQLite-only |
| **updated_at** | TEXT | ❌ Missing | ❌ | SQLite-only |
| **version** | TEXT DEFAULT '1.0' | ❌ Missing | ❌ | SQLite-only |

### 🎯 DB Sage Considerations:

**Compatibility Score: 🟡 60% (Medium Complexity)**

**SQLite has MUCH richer trait definitions** (120 traits with scales, domains, frameworks).

**Migration Strategy:**
```sql
-- Map SQLite code (integer) → Supabase code (text)
INSERT INTO supabase.traits (code, name, description)
SELECT 'trait_' || code::text, name, description
FROM sqlite_traits;
```

**My Recommendation:** ✅ **Migrate, but keep rich metadata in SQLite** or extend with `traits_metadata` table.

---

## 9️⃣ TABLE: `trait_scores`

**Purpose:** Trait measurements for minds

### Field Comparison

| Field | SQLite Type | Supabase Type | Compatible? | Notes |
|-------|-------------|---------------|-------------|-------|
| **id** | TEXT PK (UUID) | UUID PK | ⚠️ | TEXT vs UUID type |
| **mind_id** | INTEGER FK | UUID FK | ❌ | Type mismatch |
| **trait_code** | INTEGER FK | ❌ Missing | ❌ | SQLite-only |
| **trait_id** | ❌ Missing | BIGINT FK | ❌ | Supabase-only |
| **final_score** | REAL (0.00-1.00) | ❌ Missing | ❌ | SQLite-only |
| **score** | ❌ Missing | NUMERIC (computed) | ⚠️ | Supabase: score_10/10.0 |
| **score_10** | ❌ Missing | SMALLINT (0-10) | ⚠️ | Supabase stores as 0-10 |
| **confidence** | REAL (0.00-1.00) | ❌ Missing | ❌ | SQLite-only |
| **consistency** | REAL (0.00-1.00) | ❌ Missing | ❌ | SQLite-only |
| **evidence_count** | INTEGER NOT NULL | ❌ Missing | ❌ | SQLite-only |
| **evidence_fragment_ids** | TEXT (JSON array) | ❌ Missing | ❌ | SQLite-only |
| **evidence** | ❌ Missing | JSONB | ⚠️ | Supabase: generic JSONB |
| **generation_execution_id** | ❌ Missing | UUID FK | ⚠️ | Supabase: cost tracking |
| **earliest_evidence_date** | TEXT | ❌ Missing | ❌ | SQLite-only |
| **latest_evidence_date** | TEXT | ❌ Missing | ❌ | SQLite-only |
| **evolution_detected** | INTEGER (0/1) | ❌ Missing | ❌ | SQLite-only |
| **evolution_description** | TEXT | ❌ Missing | ❌ | SQLite-only |
| **is_central_trait** | INTEGER (0/1) | ❌ Missing | ❌ | SQLite-only |
| **hierarchy** | TEXT CHECK | ❌ Missing | ❌ | SQLite-only: fundamental/derived |
| **influences_traits** | TEXT (JSON array) | ❌ Missing | ❌ | SQLite-only |
| **calculated_at** | TEXT | ❌ Missing | ❌ | SQLite-only |
| **pipeline_version** | TEXT | ❌ Missing | ❌ | SQLite-only |
| **created_at** | ❌ Missing | TIMESTAMPTZ NOT NULL | ⚠️ | Supabase-only |

### 🎯 DB Sage Considerations:

**Compatibility Score: 🟡 40% (Medium Complexity)**

**SQLite is MUCH richer** - tracks evolution, evidence, hierarchy, confidence.

**Migration Strategy:**
```sql
-- Core fields migrate
INSERT INTO supabase.trait_scores (
  mind_id, trait_id, score_10, evidence, created_at
)
SELECT
  uuid_map[mind_id],
  trait_id_map[trait_code],
  ROUND(final_score * 10),
  jsonb_build_object(
    'confidence', confidence,
    'evidence_count', evidence_count,
    'evidence_fragment_ids', evidence_fragment_ids::jsonb
  ),
  calculated_at::timestamptz
FROM sqlite_trait_scores;

-- Lose: evolution tracking, hierarchy, central_trait flag
-- Solution: Store in evidence JSONB or create trait_scores_metadata table
```

**My Recommendation:** ✅ **Migrate with metadata in evidence JSONB** - Acceptable loss for cloud benefits.

---

## 🚨 TABLES ONLY IN SQLITE (MMOS-specific)

These tables have **NO equivalent** in Supabase v0.7.0.

---

### 10. `profiles` (SQLite-only)

**Purpose:** Generated narrative profiles (executive summary, full narrative, structured JSON)

**Current Data:** 0 rows

**DB Sage Consideration:**
- This is a **MMOS artifact** table (output of synthesis phase)
- Could map to Supabase `mind_profiles` table (different structure)
- `mind_profiles` stores: profile_type, storage_format, content_json/content_text
- **Recommendation:** ✅ Can migrate to `mind_profiles` with `profile_type='narrative'`

---

### 11. `system_prompts` (SQLite-only)

**Purpose:** System prompts for AI clones (generalista, specialist, qa, coach, etc.)

**Current Data:** 0 rows

**DB Sage Consideration:**
- **NO equivalent in Supabase v0.7.0**
- This is pure MMOS output
- **Recommendation:** ❌ Keep in SQLite OR ✅ Store in `mind_profiles` with `profile_type='system_prompt'`

---

### 12. `specialists` (SQLite-only)

**Purpose:** Specialist personas (sam-altman-copywriting, sam-altman-engineering)

**Current Data:** 0 rows

**DB Sage Consideration:**
- **NO equivalent in Supabase**
- MMOS-specific: links mind + specialization + system_prompt
- **Recommendation:** ❌ Keep in SQLite (local-only feature)

---

### 13. `proficiencies` (SQLite-only)

**Purpose:** Proficiency metrics (320 rows!) - detailed skill benchmarks

**Current Data:** 320 rows (rich data!)

**DB Sage Consideration:**
- Supabase has `skills` table but different structure
- SQLite `proficiencies` is more granular (skill → proficiency level)
- **Recommendation:** ⚠️ **KEEP IN SQLITE** - This is reference data (taxonomy), not mind-specific data

---

### 14. `mind_proficiency_scores` (SQLite-only)

**Purpose:** Proficiency scores per mind

**Current Data:** 0 rows

**DB Sage Consideration:**
- Supabase has `mind_proficiencies` (similar purpose!)
- SQLite is richer (evidence tracking)
- **Recommendation:** ✅ **Can migrate** to Supabase `mind_proficiencies` with evidence JSONB

---

### 15. `mind_specialization_rankings` (SQLite-only)

**Purpose:** Rankings of minds by specialization

**Current Data:** 0 rows

**DB Sage Consideration:**
- **NO equivalent in Supabase**
- MMOS-specific analytics
- **Recommendation:** ❌ Keep in SQLite (computed view, can regenerate)

---

### 16. `pipeline_progress` (SQLite-only)

**Purpose:** MMOS pipeline execution tracking

**Current Data:** 0 rows

**DB Sage Consideration:**
- Supabase has `processing_queue` + `job_executions` (different paradigm)
- SQLite tracks MMOS phases (viability, research, analysis, synthesis, implementation, testing)
- Supabase tracks job queue (queued, running, done, error, retry)
- **Recommendation:** ❌ Keep in SQLite (MMOS-specific execution tracking)

---

### 17. `analysis` (SQLite-only)

**Purpose:** Analysis artifacts (beliefs, mental models, frameworks, communication, values, worldview, personality, expertise)

**Current Data:** 1 row

**DB Sage Consideration:**
- Could map to Supabase `mind_profiles` table
- `analysis_type` → `profile_type`
- **Recommendation:** ✅ **Migrate to `mind_profiles`** - Good fit!

---

### 18. `fragment_tags` (SQLite-only)

**Purpose:** N:M relationship between fragments and tags

**Current Data:** 0 rows

**DB Sage Consideration:**
- Supabase **also has `fragment_tags` table!**
- Same purpose, same structure
- **Recommendation:** ✅ **Fully compatible, migrate directly!**

---

### 19. `schema_version` (SQLite-only)

**Purpose:** Schema versioning

**Current Data:** ?

**DB Sage Consideration:**
- Internal SQLite metadata
- **Recommendation:** ❌ Don't migrate (Supabase uses migrations/ folder)

---

## 📊 MIGRATION COMPATIBILITY MATRIX

| Table | SQLite Rows | Compatibility | Migration Path | Complexity |
|-------|-------------|---------------|----------------|------------|
| **minds** | 28 | 🟡 40% | Hybrid (core → Supabase, metadata → JSONB) | Medium |
| **sources** | 39 | 🔴 25% | Hybrid (metadata → Supabase, content → SQLite/S3) | High |
| **fragments** | 74 | 🔴 15% | Parallel tables (core → Supabase, rich → mmos_fragments) | Very High |
| **tags** | 0 | 🟢 70% | Direct migration | Low |
| **domains** | 6 | 🟡 75% | Migrate with ID remapping | Low |
| **specializations** | 22 | 🟡 75% | Migrate with ID remapping | Low |
| **skills** | 73 | 🟡 75% | Migrate with ID remapping | Low |
| **traits** | 35 | 🟡 60% | Migrate (lose rich metadata) | Medium |
| **trait_scores** | 5 | 🟡 40% | Migrate (evidence → JSONB) | Medium |
| **profiles** | 0 | 🟢 80% | → mind_profiles | Low |
| **system_prompts** | 0 | 🔴 0% | Keep in SQLite | N/A |
| **specialists** | 0 | 🔴 0% | Keep in SQLite | N/A |
| **proficiencies** | 320 | 🔴 0% | Keep in SQLite (reference data) | N/A |
| **mind_proficiency_scores** | 0 | 🟢 80% | → mind_proficiencies | Low |
| **mind_specialization_rankings** | 0 | 🔴 0% | Keep in SQLite (computed) | N/A |
| **pipeline_progress** | 0 | 🔴 0% | Keep in SQLite (MMOS-specific) | N/A |
| **analysis** | 1 | 🟢 80% | → mind_profiles | Low |
| **fragment_tags** | 0 | 🟢 100% | Direct migration | Low |

---

## 🎯 DB SAGE FINAL RECOMMENDATIONS

### ✅ **RECOMMENDED: Hybrid Architecture**

**Supabase (Cloud):**
- ✅ minds (core fields only)
- ✅ sources (metadata only, no content)
- ✅ fragments (simplified, via mmos_fragments extension)
- ✅ tags, domains, specializations, skills
- ✅ traits, trait_scores
- ✅ mind_profiles (absorb: profiles, analysis)
- ✅ mind_proficiencies (absorb: mind_proficiency_scores)

**SQLite (Local):**
- 🏠 sources (full content: raw_content, clean_content)
- 🏠 fragments (rich metadata in mmos_fragments)
- 🏠 system_prompts
- 🏠 specialists
- 🏠 proficiencies (reference taxonomy - 320 rows)
- 🏠 mind_specialization_rankings (computed)
- 🏠 pipeline_progress (MMOS execution tracking)

**Sync Layer:**
- 🔄 `uuid_mapping` table (SQLite INTEGER id ↔ Supabase UUID)
- 🔄 Bidirectional sync script for core entities

---

## 📋 MIGRATION PHASES

### **Phase 1: Taxonomy (Low Risk)**
1. ✅ Migrate: domains, specializations, skills
2. ✅ Migrate: traits
3. ✅ Migrate: tags (0 rows, but structure)
4. ✅ Create ID mapping tables

**Estimated Time:** 1 hour
**Risk:** 🟢 Low

### **Phase 2: Core Entities (Medium Risk)**
1. ✅ Generate UUIDs for all minds
2. ✅ Migrate minds (core fields + mmos_metadata JSONB)
3. ✅ Migrate sources (metadata only)
4. ✅ Create uuid_mapping table
5. ✅ Validate foreign keys

**Estimated Time:** 2 hours
**Risk:** 🟡 Medium

### **Phase 3: Fragments (High Risk)**
1. ⚠️ Create default categories
2. ⚠️ Create mmos_fragments extension table
3. ⚠️ Migrate fragments (core → fragments, rich → mmos_fragments)
4. ⚠️ Validate data integrity
5. ⚠️ Test queries with JOINs

**Estimated Time:** 4 hours
**Risk:** 🔴 High

### **Phase 4: Derived Data (Low Risk)**
1. ✅ Migrate trait_scores → trait_scores
2. ✅ Migrate analysis → mind_profiles
3. ✅ Migrate mind_proficiency_scores → mind_proficiencies (when exists)

**Estimated Time:** 1 hour
**Risk:** 🟢 Low

### **Phase 5: Validation & Testing**
1. ✅ Run smoke tests
2. ✅ Validate counts
3. ✅ Test RLS policies
4. ✅ Create rollback snapshot

**Estimated Time:** 2 hours
**Risk:** 🟢 Low

---

**Total Estimated Migration Time:** 10 hours
**Recommended Approach:** Incremental (1 phase per day)

---

**Would you like me to proceed with Phase 1 (Taxonomy migration)?**
