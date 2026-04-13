# PO Guide (*guide command)

## 🎯 Product Owner Guide

### When to Use Me

- Managing and prioritizing product backlog
- Creating and validating user stories
- Coordinating sprint planning
- Syncing stories with PM tools (ClickUp, GitHub, Jira)

### Prerequisites

1. PRD available from @pm (Morgan)
2. PM tool configured (or using local-only mode)
3. Story templates available in `.aiox-core/product/templates/`
4. PO master checklist accessible

### Typical Workflow

1. **Backlog review** → `*backlog-review` for sprint planning
2. **Story creation** → delegate to `@sm *draft`
3. **Story validation** → `*validate-story-draft {story-id}` (START lifecycle)
4. **Prioritization** → `*backlog-prioritize {item} {priority}`
5. **Sprint planning** → `*backlog-schedule {item} {sprint}`
6. **Sync to PM tool** → `*sync-story {story-id}`
7. **After PR merged** → `*close-story {story-id}` (END lifecycle)

### Common Pitfalls

- ❌ Creating stories without validated PRD
- ❌ Not running PO checklist before approval
- ❌ Forgetting to sync story updates to PM tool
- ❌ Over-prioritizing everything as HIGH
- ❌ Skipping quality gate validation planning

### Related Agents

- **@pm (Morgan)** - Provides PRDs and strategic direction
- **@sm (River)** - Can delegate story creation to
- **@qa (Quinn)** - Validates quality gates in stories
