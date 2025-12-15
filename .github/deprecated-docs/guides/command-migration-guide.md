# Command Migration Guide
## AIOS v2.0 → v3.0 (Story 6.1.2.3)

**Migration Timeline:** 6 months (January 2025 - July 2025)

**TL;DR:** Commands consolidated for clarity. Old commands work for 6 months, then removed in v3.0.

---

## Migration Phases

| Phase | Timeline | Status | Description |
|-------|----------|--------|-------------|
| **v2.0** | Jan 2025 | ✅ CURRENT | New consolidated commands introduced, old commands still work |
| **v2.5** | Apr 2025 | 🔜 PLANNED | Deprecation warnings added to old commands |
| **v3.0** | Jul 2025 | 📅 FUTURE | Old commands removed, only new commands supported |

---

## aios-master Command Changes

### Consolidated: create & modify Commands (6 → 2)

**Before (v2.0):**
```bash
@aios-master *create-agent my-agent
@aios-master *create-task my-task
@aios-master *create-workflow my-workflow

@aios-master *modify-agent my-agent
@aios-master *modify-task my-task
@aios-master *modify-workflow my-workflow
```

**After (v3.0):**
```bash
@aios-master *create agent my-agent
@aios-master *create task my-task
@aios-master *create workflow my-workflow
@aios-master *create template my-template
@aios-master *create checklist my-checklist

@aios-master *modify agent my-agent
@aios-master *modify task my-task
@aios-master *modify workflow my-workflow
```

**Migration:** Replace `*create-{type}` with `*create {type}` and `*modify-{type}` with `*modify {type}`

---

### Consolidated: plan Commands (3 → 1)

**Before (v2.0):**
```bash
@aios-master *plan
@aios-master *plan-status
@aios-master *plan-update {id}
```

**After (v3.0):**
```bash
@aios-master *plan              # Default: create new plan
@aios-master *plan status       # Check plan progress
@aios-master *plan update {id}  # Update existing plan
```

**Migration:** Use subcommands instead of separate commands

---

### Merged: learn-patterns → analyze-framework

**Before (v2.0):**
```bash
@aios-master *analyze-framework
@aios-master *learn-patterns
```

**After (v3.0):**
```bash
@aios-master *analyze-framework  # Includes pattern learning
```

**Migration:** Use `*analyze-framework` for both framework analysis and pattern learning

---

### Delegated: Epic/Story Creation

**Before (v2.0):**
```bash
@aios-master *brownfield-create-epic
@aios-master *brownfield-create-story
```

**After (v3.0):**
```bash
@pm *create-epic        # PM creates epic structure
@sm *create-next-story  # SM creates detailed stories
```

**Migration:** Use `@pm` for epics, `@sm` for stories

---

### Delegated: Brainstorming

**Before (v2.0):**
```bash
@aios-master *facilitate-brainstorming
```

**After (v3.0):**
```bash
@analyst *brainstorm
```

**Migration:** Use `@analyst` for all brainstorming sessions

---

### Delegated: Test Suite Creation

**Before (v2.0):**
```bash
@aios-master *create-suite
```

**After (v3.0):**
```bash
@qa *create-suite
```

**Migration:** Use `@qa` for test suite creation

---

### Delegated: AI Prompt Generation

**Before (v2.0):**
```bash
@aios-master *generate-ai-prompt
```

**After (v3.0):**
```bash
@architect *generate-ai-prompt
```

**Migration:** Use `@architect` for AI prompt generation

---

### Removed: party-mode

**Before (v2.0):**
```bash
@aios-master *party-mode
```

**After (v3.0):**
- ❌ **REMOVED** (zero usage, novelty feature)

**Migration:** No replacement. Feature was unused.

---

### Removed: workflow-guidance

**Before (v2.0):**
```bash
@aios-master *workflow-guidance
```

**After (v3.0):**
- ❌ **REMOVED** (redundant with `*workflow` and `*help`)

**Migration:** Use `*workflow` to list workflows or `*help` for guidance

---

## data-engineer Command Changes

### Consolidated: Performance Commands (3 → 1)

**Before (v2.0):**
```bash
@data-engineer *explain {query}
@data-engineer *analyze-hotpaths
@data-engineer *query-optimization
```

**After (v3.0):**
```bash
@data-engineer *analyze-performance query {query}
@data-engineer *analyze-performance hotpaths
@data-engineer *analyze-performance interactive
```

**Migration:** Use `*analyze-performance {type}` with appropriate type

---

### Consolidated: Security Audit Commands (2 → 1)

**Before (v2.0):**
```bash
@data-engineer *rls-audit
@data-engineer *audit-schema
```

**After (v3.0):**
```bash
@data-engineer *security-audit rls
@data-engineer *security-audit schema
@data-engineer *security-audit full
```

**Migration:** Use `*security-audit {scope}` with appropriate scope

---

### Renamed: impersonate → test-as-user

**Before (v2.0):**
```bash
@data-engineer *impersonate {user_id}
```

**After (v3.0):**
```bash
@data-engineer *test-as-user {user_id}
```

**Migration:** Replace `*impersonate` with `*test-as-user` (clearer purpose)

---

### Renamed: setup-supabase → setup-database

**Before (v2.0):**
```bash
@data-engineer *setup-supabase
```

**After (v3.0):**
```bash
@data-engineer *setup-database [type]
# type: supabase, postgresql, mongodb, mysql, sqlite
```

**Migration:** Use `*setup-database supabase` for Supabase, or choose appropriate database type

---

## dev Command Changes

### Renamed: review-qa → apply-qa-fixes

**Before (v2.0):**
```bash
@dev *review-qa
```

**After (v3.0):**
```bash
@dev *apply-qa-fixes
```

**Migration:** Replace `*review-qa` with `*apply-qa-fixes` (clearer action)

---

## po Icon Change

### Icon Update

**Before (v2.0):** ⚖️ (Scales/Justice)

**After (v3.0):** 🎯 (Target/Goals)

**Migration:** Update any documentation or scripts referencing PO icon. Greeting messages automatically updated.

**Rationale:** Avoid conflict with potential @legal agent, better represent PO focus on goals and value delivery

---

## Agent Boundary Clarifications

All 4 agents now have explicit "NOT for" delegation guidance:

### @architect
- ❌ Market research → Use `@analyst`
- ❌ PRD creation → Use `@pm`
- ❌ Database schema design → Use `@data-engineer`

### @analyst
- ❌ PRD creation → Use `@pm`
- ❌ Technical architecture → Use `@architect`
- ❌ Story creation → Use `@sm`

### @pm
- ❌ Market research → Use `@analyst`
- ❌ Technical architecture → Use `@architect`
- ❌ Detailed user stories → Use `@sm`
- ❌ Implementation → Use `@dev`

### @sm
- ❌ PRD/epic structure → Use `@pm`
- ❌ Research → Use `@analyst`
- ❌ Architecture → Use `@architect`
- ❌ Implementation → Use `@dev`
- ❌ Remote Git ops → Use `@github-devops`

---

## Backward Compatibility Testing

All old task files preserved for 6 months:

| Deprecated Task | New Task | Status |
|-----------------|----------|--------|
| `db-rls-audit.md` | `security-audit.md` | ✅ Both exist until v3.0 |
| `schema-audit.md` | `security-audit.md` | ✅ Both exist until v3.0 |
| `db-explain.md` | `analyze-performance.md` | ✅ Both exist until v3.0 |
| `db-analyze-hotpaths.md` | `analyze-performance.md` | ✅ Both exist until v3.0 |
| `db-impersonate.md` | `test-as-user.md` | ✅ Both exist until v3.0 |
| `db-supabase-setup.md` | `setup-database.md` | ✅ Both exist until v3.0 |

**Guaranteed:** Zero breaking changes during migration period

---

## Timeline & Action Items

### Month 1-2 (Jan-Feb 2025) - v2.0

- ✅ New commands available
- ✅ Old commands still work
- ✅ Documentation updated
- **Action:** Start using new commands in new workflows

### Month 3-4 (Mar-Apr 2025) - v2.5

- 🔜 Deprecation warnings added to old commands
- 🔜 Console messages guide users to new commands
- **Action:** Update existing scripts/workflows to new commands

### Month 5-6 (May-Jun 2025) - v2.5+

- 🔜 Final migration period
- 🔜 Automated migration tool available (optional)
- **Action:** Complete all migrations before v3.0

### Month 7 (Jul 2025) - v3.0

- 📅 Old commands removed
- 📅 Old task files removed
- 📅 Only new commands supported
- **Action:** Verify all workflows use new commands

---

## Migration Checklist

### For Users

- [ ] Review command changes in this guide
- [ ] Test new commands in development environment
- [ ] Update any custom scripts or workflows
- [ ] Update team documentation
- [ ] Train team on new command structure
- [ ] Update CI/CD pipelines if using commands
- [ ] Test backward compatibility before v3.0

### For Admins

- [ ] Review agent boundary clarifications
- [ ] Update agent selection guidance for team
- [ ] Monitor deprecation warnings in v2.5
- [ ] Plan v3.0 upgrade date
- [ ] Backup workflows before v3.0
- [ ] Test all critical workflows after v3.0 upgrade

---

## Getting Help

**Questions?**
- Consult Agent Responsibility Matrix: `docs/analysis/agent-responsibility-matrix.md`
- Consult Agent Selection Guide: `docs/guides/agent-selection-guide.md`
- Check Backward Compatibility Report: `docs/analysis/backward-compatibility-report.md`

**Issues?**
- File bug report with examples of broken workflows
- Include command output and error messages
- Tag with `migration` label

---

## Rollback Procedure

If you encounter issues after v3.0:

1. **Identify issue:** Document which command/workflow fails
2. **Check guide:** Verify you're using correct new command
3. **Test fix:** Update command and re-test
4. **If still broken:** Report as migration bug

**Note:** No rollback to v2.0 after v3.0 release. All issues should be fixed in v3.0+.

---

**Document Version:** 1.0
**Last Updated:** 2025-01-15
**Story:** 6.1.2.3 - Agent Command Rationalization
