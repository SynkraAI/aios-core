# Strategic Decision: db-sage Integration

**Decision Date:** 2025-10-29  
**Decision Maker:** Sarah (@po) - Product Owner  
**Context:** Story 3.16 requires strategic decision before refinement  
**Status:** ✅ **DECISION MADE**

---

## Executive Summary

**DECISION:** ✅ **Integrate db-sage into core framework**  
**DECISION:** ✅ **Keep "db-sage" name** (do NOT rename to data-architect)

**Rationale:**
- db-sage is a **CRITICAL capability** (Supabase is primary platform tool)
- Should be **discoverable** through standard `/AIOS/agents/db-sage` command
- Consistent with core agents (dev, qa, po, architect)
- Name "db-sage" is **superior** to "data-architect" (clear, memorable, professional)

**Integration Path:** Move db-sage artifacts to `aios-fullstack/aios-core/` structure

---

## Decision Analysis

### Question 1: Integrate into Core Framework OR Keep as Expansion Pack?

#### Option A: Integrate into Core Framework ✅ **SELECTED**

**Approach:**
- Move db-sage agent to `aios-fullstack/aios-core/agents/db-sage.md`
- Move 11 tasks to `aios-fullstack/aios-core/tasks/` (db-*.md)
- Move 6 templates to `aios-fullstack/aios-core/templates/` (db-*.yaml)
- Register in `core-config.yaml` (if needed for tasks/templates)
- Make discoverable via `/AIOS/agents/db-sage` command

**Pros:**
- ✅ **Standard Discovery** - Users find via `/AIOS/agents/db-sage`
- ✅ **Consistent with Core Agents** - dev, qa, po, architect all in core
- ✅ **Critical Capability** - Supabase is primary platform tool
- ✅ **Framework Completeness** - Database expertise is core, not optional
- ✅ **Simpler Installation** - Comes with framework, no extra steps
- ✅ **Better UX** - Discoverable without knowing about expansion packs

**Cons:**
- ⚠️ Increases core framework size (but acceptable)
- ⚠️ All users get db-sage (even if not needed - but database is common need)

**Alignment with Story 3.16:**
- Story says: "CRITICAL CAPABILITY GAP" ✅
- Story says: "Supabase is primary platform tool" ✅
- Story says: "Enables data-heavy projects" ✅
- **Conclusion:** This is CORE capability, not optional expansion

**Precedent:**
- Core agents: dev, qa, po, architect, pm, sm, ux-expert
- Expansion packs: hybrid-ops (specialized process management)
- **db-sage aligns with CORE agents** (general capability)

---

#### Option B: Keep as Expansion Pack ❌ **NOT SELECTED**

**Approach:**
- Move db-sage to `expansion-packs/db-sage/`
- Create installation script
- Document as optional installation
- Requires separate installation step

**Pros:**
- ✅ Keeps core framework lean
- ✅ Optional installation (users choose)
- ✅ Independent versioning

**Cons:**
- ❌ Less discoverable (users must know to install)
- ❌ Extra installation step (friction)
- ❌ Contradicts Story 3.16 ("CRITICAL capability gap")
- ❌ Supabase is PRIMARY platform (should be core, not optional)
- ❌ Doesn't match Story 3.16 goals (wants framework completeness)

**Verdict:** ❌ NOT aligned with Story 3.16's "critical capability" framing

---

### Question 2: Keep "db-sage" Name OR Rename to "data-architect"?

#### Option A: Keep "db-sage" ✅ **SELECTED**

**Current Name:** db-sage  
**Full Title:** "Database Architect & Operations Engineer"

**Pros:**
- ✅ **Clear & Memorable** - "db-sage" is distinctive and professional
- ✅ **Already Established** - Brand/identity exists (213 lines of persona)
- ✅ **Matches Pattern** - Short, descriptive (like dev, qa, po)
- ✅ **More Specific** - Focuses on database (clearer than generic "data")
- ✅ **Professional** - "sage" implies wisdom/expertise
- ✅ **No Confusion** - Distinct from other agents

**Cons:**
- None significant

**User Experience:**
- `/AIOS/agents/db-sage` ✅ Clear command
- "DB Sage" ✅ Clear agent name
- "db-sage" ✅ Clear file name

---

#### Option B: Rename to "data-architect" ❌ **NOT SELECTED**

**Proposed Name:** data-architect  
**Full Title:** "Data Architecture Capability - Database & Data Science Specialist"

**Pros:**
- ✅ Matches Story 3.16 title exactly
- ✅ Generic enough for future expansion (data science)

**Cons:**
- ❌ Less memorable than "db-sage"
- ❌ Generic (less distinctive)
- ❌ Story 3.16 title is just a description, not necessarily the agent name
- ❌ "db-sage" is already established and good
- ❌ Renaming requires more work (find/replace, documentation updates)

**Verdict:** ❌ Name change unnecessary, "db-sage" is superior

---

## Integration Strategy

### Phase 1: File Migration

**Source:** `db-sage/` (root level)  
**Target:** `aios-fullstack/aios-core/`

**Migration Plan:**

1. **Agent File:**
   - `db-sage/agents/db-sage.md` → `aios-fullstack/aios-core/agents/db-sage.md`
   - Verify format matches other agents
   - Update file paths if needed

2. **Task Files (11):**
   - `db-sage/tasks/db-*.md` → `aios-fullstack/aios-core/tasks/db-*.md`
   - Files to move:
     - db-bootstrap.md
     - db-apply-migration.md
     - db-dry-run.md
     - db-env-check.md
     - db-explain.md
     - db-impersonate.md
     - db-rls-audit.md
     - db-rollback.md
     - db-smoke-test.md
     - db-snapshot.md
     - db-verify-order.md

3. **Template Files (6):**
   - `db-sage/templates/*.yaml` → `aios-fullstack/aios-core/templates/`
   - Files to move:
     - schema-design-tmpl.yaml
     - migration-plan-tmpl.yaml
     - rls-policies-tmpl.yaml
     - index-strategy-tmpl.yaml
     - tmpl-rls-kiss-policy.sql
     - tmpl-smoke-test.sql

4. **Documentation:**
   - Keep `db-sage/README.md` for reference (or move to docs/)
   - Move `VALIDATION-supabase-docs.md` to `aios-fullstack/aios-core/data/`
   - Move `SCHEMA-COMPARISON-SQLITE-SUPABASE.md` to docs/architecture/

---

### Phase 2: Configuration Updates

**core-config.yaml Updates:**

1. **Templates Registry** (if templates section exists):
   ```yaml
   templates:
     database:
       - schema-design-tmpl
       - migration-plan-tmpl
       - rls-policies-tmpl
       - index-strategy-tmpl
   ```

2. **Tasks Registry** (if tasks section exists):
   ```yaml
   tasks:
     database:
       - db-bootstrap
       - db-apply-migration
       # ... (11 tasks)
   ```

**Note:** Agents are discovered via file system (no registry needed)

---

### Phase 3: Framework Integration

**Agent Activation:**
- Users can activate via: `/AIOS/agents/db-sage`
- Standard AIOS agent activation flow
- Commands available via `*help`

**Task Discovery:**
- Tasks discoverable via agent dependencies
- Can be referenced by other agents
- Standard task execution flow

**Template Usage:**
- Templates accessible via `create-doc` task
- Standard template resolution

---

### Phase 4: Cleanup

**After Migration:**
- ✅ Archive `db-sage/` directory (or delete if confirmed working)
- ✅ Update any hard-coded references to `db-sage/`
- ✅ Verify all paths resolved correctly
- ✅ Test agent activation
- ✅ Test task execution
- ✅ Test template loading

---

## Decision Summary

| Decision | Selection | Rationale |
|----------|-----------|-----------|
| **Integration Location** | ✅ Core Framework | Critical capability, Supabase primary platform |
| **Agent Name** | ✅ Keep "db-sage" | Superior name, already established, clear |
| **Target Location** | ✅ `aios-fullstack/aios-core/` | Standard framework structure |
| **Discovery Method** | ✅ `/AIOS/agents/db-sage` | Standard AIOS command |
| **Installation** | ✅ Comes with framework | No extra steps needed |

---

## Impact Assessment

### Framework Impact

**Before:**
- ❌ No database specialist agent
- ❌ Database tasks orphaned
- ❌ Database templates not integrated
- ❌ Users must know about db-sage separately

**After:**
- ✅ db-sage agent discoverable via `/AIOS/agents/db-sage`
- ✅ 11 database tasks integrated
- ✅ 6 database templates integrated
- ✅ Standard AIOS discovery and usage

**Framework Completeness:**
- Core agents: 13 (including db-sage)
- Database capability: ✅ Complete
- Gap remediation: ~18 entities integrated

---

### User Experience Impact

**Before:**
- Users need to know about `db-sage/` directory
- Must use non-standard activation
- Database tasks not discoverable
- Templates not accessible

**After:**
- Standard `/AIOS/agents/db-sage` command
- Discoverable via standard AIOS patterns
- Tasks accessible via agent dependencies
- Templates accessible via standard flow

**UX Improvement:** ✅ Significant improvement

---

### Development Impact

**Story 3.16 Scope:**
- **Before:** 24h (creation work)
- **After:** 8-12h (integration work)
- **Savings:** 12-16h (50-67% reduction)

**Integration Effort:**
- File migration: 1h
- Path updates: 1h
- Configuration updates: 30min
- Testing: 2h
- Documentation: 1h
- **Total:** ~5.5h integration work

**Plus Refinement:**
- Story refinement: 2-3h
- **Total Pre-Development:** 3h refinement + 5.5h integration = 8.5h

**Total Story Effort:** 8.5h + 8-12h = 16.5-20.5h (vs original 24h estimate)

---

## Next Steps

### Immediate Actions (Story 3.16 Refinement)

1. **Update Story 3.16:**
   - Change title: "Integrate db-sage Agent into Framework"
   - Update story statement (integration vs creation)
   - Update ACs (integration-focused)
   - Update estimate (24h → 8-12h)
   - Update tasks (integration workflow)

2. **Create Integration Mapping:**
   - List all files to move
   - Define target locations
   - Map dependencies
   - Create validation checklist

3. **Validate Refined Story:**
   - Target: 85-90/100 validation score
   - Approve for development

### Development Actions (Story 3.16 Implementation)

1. **File Migration (1h):**
   - Move agent file
   - Move 11 tasks
   - Move 6 templates
   - Move documentation

2. **Path Updates (1h):**
   - Verify all paths resolve correctly
   - Update any hard-coded references
   - Test file resolution

3. **Configuration (30min):**
   - Update core-config.yaml
   - Register templates/tasks if needed
   - Verify registration

4. **Testing (2h):**
   - Test agent activation
   - Test task execution
   - Test template loading
   - Verify 0 gaps

5. **Documentation (1h):**
   - Update agent README
   - Update framework docs
   - Archive old db-sage/ directory

---

## Success Criteria

**Integration Complete When:**
- ✅ db-sage agent activates via `/AIOS/agents/db-sage`
- ✅ All 11 tasks execute successfully
- ✅ All 6 templates load correctly
- ✅ Agent discoverable via standard AIOS patterns
- ✅ Gap detection shows 0 gaps for db-sage entities
- ✅ Documentation updated
- ✅ Core-config.yaml updated

**QA Target:** 90-95/100 quality score

---

## Decision Approval

**Decision Maker:** Sarah (@po) - Product Owner  
**Date:** 2025-10-29  
**Status:** ✅ **APPROVED**

**Rationale:**
- db-sage is CRITICAL capability (Supabase primary platform)
- Should be discoverable via standard AIOS patterns
- Core framework integration aligns with Story 3.16 goals
- Name "db-sage" is superior and established
- Integration work is clear and manageable (8-12h)

**Confidence:** HIGH  
**Risk:** LOW  
**Impact:** HIGH

---

**Next Action:** Refine Story 3.16 as integration story (2-3h)


