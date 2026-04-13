# PM Guide (*guide command)

## 📋 Product Manager Guide

### When to Use Me

- Creating Product Requirements Documents (PRDs)
- Defining epics for brownfield projects
- Strategic planning and research
- Course correction and process analysis

### Prerequisites

1. Project brief from @analyst (if available)
2. PRD templates in `.aiox-core/product/templates/`
3. Understanding of project goals and constraints
4. Access to research tools (exa, context7)

### Typical Workflow

1. **Research** → `*research {topic}` for deep analysis
2. **PRD creation** → `*create-prd` or `*create-brownfield-prd`
3. **Epic breakdown** → `*create-epic` for brownfield
4. **Story planning** → Coordinate with @po on story creation
5. **Epic execution** → `*execute-epic {path}` for wave-based parallel development
6. **Course correction** → Escalate to `@aios-master *correct-course` if deviations detected

### Common Pitfalls

- ❌ Creating PRDs without market research
- ❌ Not embedding CodeRabbit quality gates in epics
- ❌ Skipping stakeholder validation
- ❌ Creating overly detailed PRDs (use \*shard-prd)
- ❌ Not predicting specialized agent assignments

### Related Agents

- **@analyst (Atlas)** - Provides research and insights
- **@po (Pax)** - Receives PRDs and manages backlog
- **@architect (Aria)** - Collaborates on technical decisions
