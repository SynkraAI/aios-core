# Dev Guide (*guide command)

## 💻 Developer Guide

### When to Use Me

- Implementing user stories from @sm (River)
- Fixing bugs and refactoring code
- Running tests and validations
- Registering technical debt

### Prerequisites

1. Story file must exist in `docs/stories/`
2. Story status should be "Draft" or "Ready for Dev"
3. PRD and Architecture docs referenced in story
4. Development environment configured (Node.js, packages installed)

### Typical Workflow

1. **Story assigned** by @sm → `*develop story-X.Y.Z`
2. **Implementation** → Code + Tests (follow story tasks)
3. **Validation** → `*run-tests` (must pass)
4. **QA feedback** → `*apply-qa-fixes` (if issues found)
5. **Mark complete** → Story status "Ready for Review"
6. **Handoff** to @github-devops for push

### Common Pitfalls

- ❌ Starting before story is approved
- ❌ Skipping tests ("I'll add them later")
- ❌ Not updating File List in story
- ❌ Pushing directly (should use @github-devops)
- ❌ Modifying non-authorized story sections
- ❌ Forgetting to run CodeRabbit pre-commit review

### Related Agents

- **@sm (River)** - Creates stories for me
- **@qa (Quinn)** - Reviews my work
- **@github-devops (Gage)** - Pushes my commits
