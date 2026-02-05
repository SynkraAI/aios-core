---
task: poEpicContext()
version: 1.0.0
agent: po
description: Display accumulated context for current epic including files modified, dependencies, and executor history
elicit: true
---

# PO Epic Context Task

## Purpose

Show the accumulated context for an epic, enabling the PO to understand:
- What has been implemented in previous stories
- Which files have been modified and by whom
- What dependencies exist between stories
- The executor history for each file

This context is essential for validating new story drafts.

## SEQUENTIAL Task Execution

### 0. Identify Target Epic

**IF epic_id provided:**
- Use the provided epic ID
- Load `docs/stories/epic-{epic_id}.md`

**IF NOT provided:**
- List available epics in `docs/stories/`
- Ask user to select one

```yaml
# Example prompt
"Qual epic você quer ver o contexto?
1. Epic 1 - User Authentication
2. Epic 2 - Metrics Dashboard
3. Epic 3 - Notification System
"
```

### 1. Load Epic and Stories

- **Load epic file**: `docs/stories/epic-{n}.md`
- **Discover stories**: Find all `docs/stories/story-{n}.*.md` files
- **Parse story status**: Extract `status` from YAML frontmatter

```yaml
stories_discovered:
  - file: "story-1.1.md"
    status: "DONE"
  - file: "story-1.2.md"
    status: "DONE"
  - file: "story-1.3.md"
    status: "IN_PROGRESS"
  - file: "story-1.4.md"
    status: "DRAFT"
```

### 2. Extract File Modifications

For each story with status `DONE` or `IN_PROGRESS`:

1. Read the story file
2. Find the `## File List` section
3. Extract files and change types
4. Record the executor from story YAML

```yaml
accumulated_files:
  - path: "supabase/migrations/001_metrics.sql"
    story: "1.1"
    executor: "@data-engineer"
    change_type: "created"

  - path: "app/services/api/metrics.ts"
    story: "1.2"
    executor: "@dev"
    change_type: "created"

  - path: "app/components/Dashboard.tsx"
    story: "1.2"
    executor: "@dev"
    change_type: "modified"

  - path: "app/components/Dashboard.tsx"
    story: "1.3"
    executor: "@dev"
    change_type: "modified"  # Modified again!
```

### 3. Build Dependency Chain

Analyze story dependencies:

1. Read each story's requirements/dependencies section
2. Map dependencies between stories
3. Identify blocking relationships

```yaml
dependency_chain:
  "1.1":
    depends_on: []
    blocks: ["1.2", "1.3"]

  "1.2":
    depends_on: ["1.1"]
    blocks: ["1.3"]

  "1.3":
    depends_on: ["1.1", "1.2"]
    blocks: ["1.4"]

  "1.4":
    depends_on: ["1.3"]
    blocks: []
```

### 4. Identify File Overlap Patterns

Find files modified by multiple stories:

```yaml
file_overlap:
  - path: "app/components/Dashboard.tsx"
    modified_by:
      - story: "1.2"
        executor: "@dev"
      - story: "1.3"
        executor: "@dev"
    overlap_risk: "LOW"  # Same executor

  - path: "app/types/metrics.ts"
    modified_by:
      - story: "1.1"
        executor: "@data-engineer"
      - story: "1.2"
        executor: "@dev"
    overlap_risk: "MEDIUM"  # Different executor, related competency
```

### 5. Calculate Executor Distribution

Summarize executor involvement:

```yaml
executor_summary:
  "@data-engineer":
    stories: ["1.1"]
    files_created: 2
    files_modified: 0

  "@dev":
    stories: ["1.2", "1.3"]
    files_created: 3
    files_modified: 2

  "@devops":
    stories: []
    files_created: 0
    files_modified: 0
```

### 6. Generate Context Report

Output a formatted report:

```markdown
# 📊 Epic Context Report

## Epic Overview
- **Epic ID**: {epic_id}
- **Title**: {epic_title}
- **Total Stories**: {total}
- **Completed**: {done_count}
- **In Progress**: {in_progress_count}
- **Pending**: {pending_count}

---

## Story Status Summary

| Story | Title | Status | Executor | Key Files |
|-------|-------|--------|----------|-----------|
| 1.1 | Create metrics schema | ✅ DONE | @data-engineer | migrations/001_metrics.sql |
| 1.2 | Metrics API | ✅ DONE | @dev | services/api/metrics.ts |
| 1.3 | Dashboard UI | 🔄 IN_PROGRESS | @dev | components/Dashboard.tsx |
| 1.4 | Deploy pipeline | 📝 DRAFT | @devops | - |

---

## Accumulated File Modifications

### Created Files
| File | Created By | Story |
|------|------------|-------|
| supabase/migrations/001_metrics.sql | @data-engineer | 1.1 |
| app/services/api/metrics.ts | @dev | 1.2 |
| app/types/metrics.ts | @data-engineer | 1.1 |

### Modified Files (Multiple Times)
| File | Modification History |
|------|---------------------|
| app/components/Dashboard.tsx | 1.2 (@dev) → 1.3 (@dev) |

---

## Dependency Chain

```
1.1 (DONE)
 └── 1.2 (DONE)
      └── 1.3 (IN_PROGRESS)
           └── 1.4 (DRAFT) ← Next available
```

---

## File Overlap Analysis

| File | Stories | Executors | Risk |
|------|---------|-----------|------|
| Dashboard.tsx | 1.2, 1.3 | @dev, @dev | LOW ✅ |
| metrics.ts | 1.1, 1.2 | @data-eng, @dev | MEDIUM ⚠️ |

---

## Executor Distribution

| Executor | Stories | Files Touched |
|----------|---------|---------------|
| @data-engineer | 1 | 2 created |
| @dev | 2 | 3 created, 2 modified |
| @devops | 0 | - |

---

## Ready for Validation

**Next story ready for draft**: 1.4
**Dependencies satisfied**: ✅ Yes (1.3 must complete first)
**Blocked by**: Story 1.3 (IN_PROGRESS)

---

*Generated by @po *epic-context*
```

### 7. Interactive Options

After displaying report, offer options:

```
O que você gostaria de fazer?

1. Ver detalhes de uma story específica
2. Ver histórico de um arquivo específico
3. Validar próxima story draft (*validate-story-draft)
4. Voltar ao menu principal

Digite o número ou comando:
```

## Output

- **Console**: Formatted context report
- **Optional file**: `.aios/epic-{n}-context.md` (if requested)

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| Epic not found | Invalid epic_id | List available epics |
| No stories found | Epic empty | Show epic file only |
| Parse error | Malformed story YAML | Show warning, continue with parseable stories |

## Performance

```yaml
duration_expected: 1-3 min
token_usage: ~2,000-5,000 tokens
```

## Related Commands

- `*validate-story-draft` - Validate with this context loaded
- `*backlog-review` - Review full backlog
- `*backlog-summary` - Quick status summary
