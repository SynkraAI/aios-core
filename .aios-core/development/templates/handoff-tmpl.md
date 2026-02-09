# Handoff: {{topic}}

**Date:** {{date}}
**Project:** {{project}}
**Branch:** `{{branch}}` @ `{{commit_short}}`
**Budget at handoff:** {{budget_percent}}% ({{budget_status}})
**Session duration:** {{session_duration}}

---

## Completed

{{#each completed}}
- {{this.description}}{{#if this.commit}} (commit: `{{this.commit}}`){{/if}}{{#if this.tests}} [{{this.tests}} tests passing]{{/if}}
{{/each}}

{{#if no_completed}}
- No tasks completed this session (context/research only)
{{/if}}

## Pending

{{#each pending}}
- [ ] {{this.description}} {{#if this.blocked}}(**blocked by:** {{this.blocker}}){{else}}(**{{this.status}}**){{/if}}
{{/each}}

{{#if no_pending}}
- All planned tasks completed
{{/if}}

## Blockers

{{#each blockers}}
- **{{this.title}}:** {{this.description}}{{#if this.since}} (since {{this.since}}){{/if}}
{{/each}}

{{#if no_blockers}}
- No active blockers
{{/if}}

## Next Steps

{{#each next_steps}}
{{this.priority}}. {{this.description}} [{{this.complexity}}]{{#if this.note}} — *{{this.note}}*{{/if}}
{{/each}}

## Context for Next Session

{{#if architecture_decisions}}
### Architecture Decisions Made
{{#each architecture_decisions}}
- {{this}}
{{/each}}
{{/if}}

{{#if patterns}}
### Patterns Established
{{#each patterns}}
- {{this}}
{{/each}}
{{/if}}

{{#if critical_files}}
### Critical Files to Understand
{{#each critical_files}}
- `{{this.path}}` — {{this.reason}}
{{/each}}
{{/if}}

{{#if workarounds}}
### Temporary Workarounds
{{#each workarounds}}
- {{this.description}} — **TODO:** {{this.resolution}}
{{/each}}
{{/if}}

{{#if test_status}}
### Test Status
- **Passing:** {{test_status.passing}}
- **Failing:** {{test_status.failing}}
- **Skipped:** {{test_status.skipped}}
{{/if}}

### Key Context
{{context_notes}}

---

## Quick Resume Commands

```bash
# Read this handoff in next session
cat .aios/handoffs/LATEST.md

# Or use AIOS command
# *handoff-read
```

---
*Handoff created by AIOS Session Handoff System v1.0*
*Fresh sessions don't lose context. They lose noise.*
