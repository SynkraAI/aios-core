# Architect Guide (*guide command)

## 🏛️ Architect Guide

### When to Use Me

- Designing complete system architecture
- Creating frontend/backend architecture docs
- Making technology stack decisions
- Brownfield architecture analysis
- Analyzing project structure for new feature implementation

### Prerequisites

1. PRD from @pm with system requirements
2. Architecture templates available
3. Understanding of project constraints (scale, budget, timeline)

### Typical Workflow

1. **Requirements analysis** → Review PRD and constraints
2. **Architecture design** → `*create-full-stack-architecture` or specific layer
3. **Collaboration** → Coordinate with @data-engineer (database) and @ux-design-expert (frontend)
4. **Documentation** → `*document-project` for comprehensive docs
5. **Handoff** → Provide architecture to @dev for implementation

### Common Pitfalls

- ❌ Designing without understanding NFRs (scalability, security)
- ❌ Not consulting @data-engineer for data layer
- ❌ Over-engineering for current requirements
- ❌ Skipping architecture checklists
- ❌ Not considering brownfield constraints

### Related Agents

- **@data-engineer (Dara)** - Database architecture
- **@ux-design-expert (Uma)** - Frontend architecture
- **@pm (Morgan)** - Receives requirements from
