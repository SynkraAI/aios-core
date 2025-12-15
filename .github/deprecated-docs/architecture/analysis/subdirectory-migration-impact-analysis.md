# AIOS Core Subdirectory Migration - Impact Analysis

**Architect:** Aria  
**Date:** 2025-01-18  
**Priority:** 🔴 **CRITICAL - BLOCKING EXPANSION PACK STORIES**  
**Status:** 🔍 **Analysis Complete - Story Creation Required**

---

## 🎯 Executive Summary

**The Problem:**
Expansion pack stories propose creating `methodologies/` and `patterns/` directories, but this conflicts with AIOS framework principles. The correct approach is to use **subdirectories within existing framework types** (data/, tasks/, templates/, etc.).

**The Challenge:**
Implementing subdirectories in `.aios-core/` is a **MASSIVE structural change** that impacts:
- ✅ 16 agent definitions
- ✅ 60+ task files
- ✅ 20+ template files
- ✅ 54+ utility scripts
- ✅ Hundreds of dependency references
- ✅ File resolution logic in multiple scripts

**Required Action:**
**Before proceeding with any expansion pack work**, we must:
1. ✅ Validate subdirectory architecture works with current codebase
2. ✅ Create migration scripts for updating all references
3. ✅ Test thoroughly in isolated environment
4. ✅ Execute phased migration with rollback capability

---

## 📊 Current State Analysis

### Current Dependency Reference Pattern

**Agents reference dependencies with flat structure:**

```yaml
# Example: .aios-core/agents/qa.md
dependencies:
  data:
    - technical-preferences.md
  tasks:
    - generate-tests.md
    - manage-story-backlog.md
    - nfr-assess.md
  checklists:
    - story-dod-checklist.md
```

**File Resolution:** `{type}/{filename}` → `.aios-core/{type}/{filename}`

---

### Proposed Subdirectory Pattern

**Agents would reference with subdirectories:**

```yaml
# Proposed: .aios-core/agents/qa.md
dependencies:
  data:
    - technical/technical-preferences.md
  tasks:
    - testing/generate-tests.md
    - agile/manage-story-backlog.md
    - quality/nfr-assess.md
  checklists:
    - development/story-dod-checklist.md
```

**File Resolution:** `{type}/{subdir}/{filename}` → `.aios-core/{type}/{subdir}/{filename}`

---

## 🔍 Impact Analysis by Component

### 1. Agent Definitions (16 files)

**Location:** `.aios-core/agents/*.md`

**Current References:**
```bash
# Count: 16 agent files with dependencies
qa.md                    → 7 tasks, 1 data file
dev.md                   → 7 tasks, 1 checklist
architect.md             → 6 tasks, 3 templates
pm.md                    → 7 tasks, 1 template
po.md                    → 8 tasks, 1 template
sm.md                    → 3 tasks, 1 template, 1 checklist
analyst.md               → 5 tasks, 3 templates
data-engineer.md         → 12 tasks
devops.md                → 6 tasks, 2 templates
ux-design-expert.md      → 16 tasks, 1 template
aios-master.md           → 16 tasks, 5 templates
...
```

**Estimated Total:** ~150+ dependency references across all agents

**Impact:** 🔴 **CRITICAL** - Every dependency path must be updated

---

### 2. Task Files (60+ files)

**Location:** `.aios-core/tasks/*.md`

**Tasks may reference:**
- Other tasks (internal dependencies)
- Templates (for document generation)
- Data files (for knowledge base)

**Example:** `create-doc.md` references templates:
```yaml
dependencies:
  templates:
    - story-tmpl.yaml
    - prd-tmpl.yaml
    - architecture-tmpl.yaml
```

**Impact:** 🟡 **HIGH** - Tasks referencing other resources need updates

---

### 3. Scripts (54+ files)

**Location:** `.aios-core/scripts/*.js`

**Hardcoded Paths Found:**

| Script | Hardcoded Path | Line | Impact |
|--------|---------------|------|--------|
| `agent-config-loader.js` | `.aios-core/data/agent-config-requirements.yaml` | 31 | 🔴 CRITICAL |
| `test-utilities.js` | `.aios-core/tasks` | 39 | 🟡 HIGH |
| `validate-task-v2.js` | `.aios-core/tasks/` | 194 | 🟡 HIGH |
| `batch-migrate-*.ps1` | `.aios-core/tasks/*.md` | Multiple | 🟡 HIGH |
| `phase3-tools-scripts-validation.js` | `.aios-core/templates/` | 47 | 🟡 HIGH |

**Impact:** 🔴 **CRITICAL** - Scripts using hardcoded paths will break

---

### 4. IDE Rule Files

**Location:**
- `.cursor/rules/*.md`
- `.claude/commands/AIOS/agents/*.md`

**Current:** Mirror `.aios-core/agents/*.md` structure

**Impact:** 🟡 **HIGH** - Must be updated to match agent changes

---

## 🚨 Breaking Changes Identified

### Change 1: Dependency Resolution

**Current Resolution Logic:**
```javascript
// Simplified current logic
const resolvedPath = path.join('.aios-core', type, filename);
// Example: .aios-core/tasks/create-doc.md
```

**New Resolution Logic Required:**
```javascript
// Must support subdirectories
const resolvedPath = path.join('.aios-core', type, ...subdirs, filename);
// Example: .aios-core/tasks/documentation/create-doc.md
```

**Files Affected:**
- `agent-config-loader.js`
- Any script that loads tasks/templates/data files
- Task execution engine

---

### Change 2: Agent Dependency References

**Example: architect.md**

**Before:**
```yaml
dependencies:
  tasks:
    - analyze-impact.md
    - create-doc.md
    - document-project.md
  templates:
    - architecture-tmpl.yaml
```

**After:**
```yaml
dependencies:
  tasks:
    - architecture/analyze-impact.md
    - documentation/create-doc.md
    - documentation/document-project.md
  templates:
    - architecture/architecture-tmpl.yaml
```

**Impact:** All 16 agents × ~10 dependencies each = **~160 references to update**

---

### Change 3: Task Internal References

**Example: Tasks that call other tasks**

**Before:**
```yaml
# In some task
depends_on:
  - create-doc.md
```

**After:**
```yaml
# In some task
depends_on:
  - documentation/create-doc.md
```

**Impact:** Unknown until full audit complete

---

### Change 4: Script File Scanning

**Current:** Scripts scan flat directories
```javascript
const tasks = fs.readdirSync('.aios-core/tasks')
  .filter(f => f.endsWith('.md'));
```

**New:** Scripts must recursively scan subdirectories
```javascript
const tasks = glob.sync('.aios-core/tasks/**/*.md');
```

**Files Affected:** All scripts that enumerate tasks/templates/data files

---

## 📋 Proposed Subdirectory Structure

### Option 1: Domain-Organized (Recommended)

```
.aios-core/
├── data/
│   ├── agile/                       # Agile/Scrum knowledge
│   │   ├── sprint-planning-guide.md
│   │   └── retrospective-formats.md
│   ├── architecture/                # Architecture patterns
│   │   ├── system-design-patterns.md
│   │   └── api-design-standards.md
│   ├── design-systems/              # UX/Design frameworks
│   │   ├── atomic-design-framework.md
│   │   ├── brad-frost-design-system.md
│   │   └── sally-ux-research-framework.md
│   ├── database/                    # Database knowledge
│   │   ├── database-patterns.md
│   │   ├── data-warehouse-patterns.md
│   │   └── database-optimization.md
│   ├── infrastructure/              # DevOps/Infrastructure
│   │   ├── cicd-patterns.md
│   │   ├── deployment-strategies.md
│   │   └── infrastructure-patterns.md
│   ├── quality/                     # Testing/QA knowledge
│   │   ├── test-levels-framework.md
│   │   └── test-priorities-matrix.md
│   ├── technical/                   # Technical standards
│   │   ├── technical-preferences.md
│   │   └── coding-standards.md
│   ├── aios-kb.md                   # (root level - framework KB)
│   ├── elicitation-methods.md       # (root level - core method)
│   └── brainstorming-techniques.md  # (root level - core method)
│
├── tasks/
│   ├── agile/                       # Agile/Story management
│   │   ├── create-next-story.md
│   │   ├── manage-story-backlog.md
│   │   └── validate-next-story.md
│   ├── architecture/                # Architecture tasks
│   │   ├── analyze-impact.md
│   │   └── design-architecture.md
│   ├── database/                    # Database tasks
│   │   ├── domain-modeling.md
│   │   ├── setup-database.md
│   │   └── migrate-database.md
│   ├── data-engineering/            # Data engineering tasks
│   │   ├── design-etl-pipeline.md
│   │   ├── validate-data-quality.md
│   │   └── optimize-queries.md
│   ├── development/                 # Development tasks
│   │   ├── develop-story.md
│   │   ├── apply-qa-fixes.md
│   │   └── improve-code-quality.md
│   ├── devops/                      # DevOps tasks
│   │   ├── version-management.md
│   │   ├── pre-push-quality-gate.md
│   │   └── release-management.md
│   ├── documentation/               # Documentation tasks
│   │   ├── create-doc.md
│   │   ├── document-project.md
│   │   └── shard-doc.md
│   ├── quality/                     # QA tasks
│   │   ├── generate-tests.md
│   │   ├── nfr-assess.md
│   │   ├── qa-gate.md
│   │   └── review-story.md
│   ├── research/                    # Research/Analysis tasks
│   │   ├── create-deep-research-prompt.md
│   │   ├── facilitate-brainstorming-session.md
│   │   └── advanced-elicitation.md
│   ├── ux-design/                   # UX/Design tasks
│   │   ├── ux-user-research.md
│   │   ├── ux-create-wireframe.md
│   │   ├── extract-design-tokens.md
│   │   └── audit-accessibility.md
│   └── framework/                   # Framework management
│       ├── create-agent.md
│       ├── create-task.md
│       └── create-workflow.md
│
├── templates/
│   ├── agile/                       # Agile templates
│   │   ├── story-tmpl.yaml
│   │   ├── epic-tmpl.md
│   │   └── sprint-plan-tmpl.yaml
│   ├── architecture/                # Architecture templates
│   │   ├── architecture-tmpl.yaml
│   │   ├── fullstack-architecture-tmpl.yaml
│   │   └── brownfield-architecture-tmpl.yaml
│   ├── database/                    # Database templates
│   │   └── schema-design-tmpl.yaml
│   ├── infrastructure/              # Infrastructure templates
│   │   ├── cicd-pipeline-tmpl.yaml
│   │   ├── deployment-plan-tmpl.yaml
│   │   └── github-actions-ci.yml
│   ├── product/                     # Product templates
│   │   ├── prd-tmpl.yaml
│   │   ├── project-brief-tmpl.yaml
│   │   └── market-research-tmpl.yaml
│   └── ux-design/                   # UX/Design templates
│       └── design-system-tmpl.yaml
│
├── workflows/
│   ├── greenfield/                  # Greenfield workflows
│   │   ├── greenfield-fullstack.yaml
│   │   ├── greenfield-service.yaml
│   │   └── greenfield-ui.yaml
│   ├── brownfield/                  # Brownfield workflows
│   │   ├── brownfield-fullstack.yaml
│   │   ├── brownfield-service.yaml
│   │   └── brownfield-ui.yaml
│   └── deployment/                  # Deployment workflows
│       ├── zero-downtime-deployment.yaml
│       └── disaster-recovery.yaml
│
├── checklists/
│   ├── agile/                       # Agile checklists
│   │   ├── story-draft-checklist.md
│   │   └── change-checklist.md
│   ├── architecture/                # Architecture checklists
│   │   └── architect-checklist.md
│   ├── development/                 # Development checklists
│   │   └── story-dod-checklist.md
│   ├── product/                     # Product checklists
│   │   ├── po-master-checklist.md
│   │   └── pm-checklist.md
│   ├── quality/                     # QA checklists
│   │   ├── qa-checklist.md
│   │   ├── wcag-accessibility-checklist.md
│   │   └── data-quality-checklist.md
│   └── (root level files remain for backward compatibility)
│
└── scripts/
    ├── agent-management/            # Agent scripts
    │   ├── agent-config-loader.js
    │   └── agent-executor.js
    ├── config/                      # Configuration scripts
    │   ├── config-cache.js
    │   └── performance-tracker.js
    ├── greeting/                    # Greeting system
    │   ├── greeting-builder.js
    │   ├── generate-greeting.js
    │   └── session-context-loader.js
    ├── migration/                   # Migration scripts
    │   ├── migrate-task-to-v2.js
    │   └── batch-migrate-*.ps1
    ├── validation/                  # Validation scripts
    │   ├── validate-task-v2.js
    │   └── yaml-validator.js
    └── (flat scripts for backward compatibility)
```

---

## 🎯 Migration Strategy

### Phase 0: Validation & Testing (THIS STORY)

**Objective:** Validate subdirectory approach works before any production changes

**Tasks:**
1. Create test environment with sample subdirectory structure
2. Update file resolution logic to support subdirectories
3. Test with 2-3 sample agents in isolated environment
4. Validate backward compatibility (flat + subdirectory coexist)
5. Create migration scripts for bulk updates
6. Document findings and decision

**Success Criteria:**
- ✅ File resolution works with subdirectories
- ✅ Agents can load dependencies from subdirectories
- ✅ Backward compatible (existing flat refs still work)
- ✅ Migration scripts tested and validated

**Duration:** 2-3 days (8-12 hours)

---

### Phase 1: Core Infrastructure (NEXT STORY)

**Objective:** Update core scripts to support subdirectories

**Tasks:**
1. Update `agent-config-loader.js` to resolve subdirectory paths
2. Update all scripts with hardcoded paths
3. Add recursive directory scanning where needed
4. Update file discovery/enumeration logic
5. Add tests for new resolution logic

**Duration:** 1.5 days (6 hours)

---

### Phase 2: Gradual File Migration (MULTIPLE STORIES)

**Objective:** Move files to subdirectories incrementally

**Approach:** Migrate by domain, one at a time

**Sub-phases:**
1. Migrate `data/` files → subdirectories
2. Migrate `tasks/` files → subdirectories
3. Migrate `templates/` files → subdirectories
4. Migrate `checklists/` files → subdirectories
5. Migrate `workflows/` files → subdirectories
6. Migrate `scripts/` files → subdirectories

**For each sub-phase:**
- Move files to new location
- Update all agent references
- Update IDE rule files
- Test affected agents
- Commit and validate

**Duration:** 2-3 days per domain (10-15 days total)

---

### Phase 3: Agent Dependency Updates (AFTER PHASE 2)

**Objective:** Update all agent dependency references

**Tasks:**
1. Update 16 agent files with new paths
2. Update corresponding IDE rule files
3. Validate each agent loads correctly
4. Test greeting system with new paths
5. Integration testing

**Duration:** 1 day (4 hours)

---

### Phase 4: Cleanup & Optimization (FINAL)

**Objective:** Remove backward compatibility, optimize

**Tasks:**
1. Remove deprecated flat file references
2. Optimize file resolution (caching, etc.)
3. Update documentation
4. Final integration testing

**Duration:** 0.5 day (2 hours)

---

## 🔒 Rollback Strategy

**At any phase, rollback is possible:**

1. **Git-based rollback:**
   - Each phase is a separate commit
   - Can revert to previous commit if issues arise

2. **Backward compatibility period:**
   - Phase 0-2: Both flat and subdirectory paths work
   - Phase 3: Only subdirectory paths work
   - This allows gradual rollback if needed

3. **Automated testing:**
   - Test suite validates file resolution
   - CI/CD checks all agents load correctly
   - Performance benchmarks ensure no regression

---

## ⚠️ Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Breaking agent loading** | 🟡 Medium | 🔴 CRITICAL | Test in isolated env first (Phase 0) |
| **Performance degradation** | 🟢 Low | 🟡 HIGH | Benchmark during Phase 0 |
| **Incomplete migration** | 🟡 Medium | 🟡 HIGH | Automated migration scripts + validation |
| **IDE file sync issues** | 🟢 Low | 🟡 HIGH | Update IDE files simultaneously |
| **Script path resolution** | 🔴 High | 🔴 CRITICAL | Comprehensive script audit (Phase 1) |

---

## ✅ Recommendation

### Immediate Actions Required

1. **✅ PAUSE expansion pack stories 6.1.14.x**
   - Current architecture conflicts with AIOS principles
   - Must resolve core structure first

2. **✅ CREATE Story 6.1.15: Subdirectory Architecture Validation**
   - Phase 0 only: Test and validate subdirectory approach
   - Isolated test environment
   - No production changes
   - Duration: 2-3 days

3. **✅ IF Story 6.1.15 succeeds → CREATE migration stories**
   - Story 6.1.16: Core Infrastructure Update (Phase 1)
   - Story 6.1.17: Data Files Migration (Phase 2.1)
   - Story 6.1.18: Task Files Migration (Phase 2.2)
   - Story 6.1.19: Template Files Migration (Phase 2.3)
   - Story 6.1.20: Agent Dependencies Update (Phase 3)
   - Story 6.1.21: Final Cleanup (Phase 4)

4. **✅ ONLY THEN → Revisit expansion pack extraction**
   - Stories 6.1.14.x revised to use new structure
   - No new directory types, only subdirectories
   - Aligned with AIOS framework principles

---

## 📊 Effort Estimate

| Phase | Duration | Investment |
|-------|----------|------------|
| **Phase 0: Validation (Story 6.1.15)** | 2-3 days (8-12h) | $100-150 |
| **Phase 1: Infrastructure (Story 6.1.16)** | 1.5 days (6h) | $75 |
| **Phase 2: File Migration (Stories 6.1.17-19)** | 10-15 days (40-60h) | $500-750 |
| **Phase 3: Agent Updates (Story 6.1.20)** | 1 day (4h) | $50 |
| **Phase 4: Cleanup (Story 6.1.21)** | 0.5 day (2h) | $25 |
| **TOTAL** | **15-21 days (60-84h)** | **$750-1,050** |

**Note:** This is a MAJOR architectural refactoring that touches the entire framework.

---

## 🎯 Decision Required

**@po (Pax) and @architect (Aria) must decide:**

1. ✅ **Proceed with subdirectory migration?**
   - Pros: Better organization, scalability, expansion packs become possible
   - Cons: Large effort, risk of breaking changes, extended timeline

2. ❌ **Keep flat structure?**
   - Pros: No migration needed, lower risk
   - Cons: Expansion packs remain problematic, poor scalability

3. 🔄 **Hybrid approach?**
   - Pros: Gradual adoption, lower risk
   - Cons: Complexity of supporting both patterns

---

## 📝 Next Steps

**Immediate (This Session):**
1. ✅ Review this analysis with @po
2. ✅ Make GO/NO-GO decision on subdirectory migration
3. ✅ If GO → Create Story 6.1.15 (Validation)
4. ✅ If NO-GO → Revise expansion pack approach differently

**If GO Decision:**
1. Create Story 6.1.15 (Subdirectory Validation)
2. @dev implements Phase 0 in test environment
3. Review results and make Phase 1 decision
4. If successful → proceed with full migration
5. After migration → revisit expansion pack extraction

---

**Analysis By:** Aria (Architect)  
**Date:** 2025-01-18  
**Status:** ⏸️ **AWAITING DECISION**

— Aria, arquitetando o futuro 🏗️

