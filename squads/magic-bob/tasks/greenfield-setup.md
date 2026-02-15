---
task: Greenfield Setup
responsavel: "@bob-orchestrator"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - project_type: web | mobile | api | fullstack
  - tech_stack: Technology preferences (optional)
  - user_goal: High-level product description
Saida: |
  - prd_document: Product Requirements Document
  - epic_structure: Epic breakdown with stories
  - project_scaffold: Initial file structure
  - first_story: Path to first story to execute
Checklist:
  - "[ ] Verify project state is GREENFIELD"
  - "[ ] Elicit user requirements (PRD generation)"
  - "[ ] Generate epic structure"
  - "[ ] Shard epic into stories"
  - "[ ] Create project scaffold"
  - "[ ] Start first story execution"
---

# *greenfield-setup

Sets up a new project from scratch with full architecture planning, epic/story structure, and initial development cycle.

**PATH D:** GREENFIELD - Projeto novo sem código

## Usage

```bash
@bob-orchestrator

*greenfield-setup --type fullstack --goal "Build a task management SaaS"
# → Generates PRD, epics, stories, and starts development

*greenfield-setup --type api
# → Interactive mode: BOB asks questions to build PRD
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--type` | enum | fullstack | Project type: web \| mobile \| api \| fullstack |
| `--stack` | string | - | Tech stack preference (e.g., "React + Node.js") |
| `--goal` | string | - | High-level product description |
| `--skip-prd` | flag | false | Skip PRD generation (use existing) |

## Flow

```mermaid
flowchart TB
    START[Verify GREENFIELD] --> PHASE0[Phase 0: Environment Bootstrap]
    PHASE0 --> PHASE1[Phase 1: Discovery & Planning]

    PHASE1 --> ELICIT[@po: Elicit requirements]
    ELICIT --> PRD[@po: Generate PRD]
    PRD --> ARCH[@architect: Design architecture]

    ARCH --> PHASE2[Phase 2: Document Sharding]
    PHASE2 --> EPIC[@po: Generate epics]
    EPIC --> STORIES[@po: Shard epic into stories]

    STORIES --> PHASE3[Phase 3: Development Cycle]
    PHASE3 --> STORY1[Execute Story 1.1]
    STORY1 --> CYCLE[6-phase development cycle]
    CYCLE --> CHECKPOINT{CHECKPOINT: GO/PAUSE/REVIEW/ABORT}

    CHECKPOINT -->|GO| STORY2[Next story]
    CHECKPOINT -->|PAUSE| SAVE[Save session]
    CHECKPOINT -->|REVIEW| SHOW[Show progress]
    CHECKPOINT -->|ABORT| END[End]
```

## Implementation

### Phase 0: Environment Bootstrap (5 min)

```javascript
await this.workflowExecutor.execute({
  agent: '@devops',
  task: 'bootstrap-environment',
  actions: [
    'Initialize git repository',
    'Create .aios/ structure',
    'Setup package.json / requirements.txt',
    'Configure linting and formatting',
  ],
});
```

### Phase 1: Discovery & Planning (30-60 min)

```javascript
// Elicit requirements
const requirements = await this.workflowExecutor.execute({
  agent: '@po',
  task: 'elicit-requirements',
  inputs: {
    projectType: params.type,
    userGoal: params.goal,
  },
});

// Generate PRD
const prd = await this.workflowExecutor.execute({
  agent: '@po',
  task: 'generate-prd',
  inputs: requirements,
  output: 'docs/prd.md',
});

// Design architecture
const architecture = await this.workflowExecutor.execute({
  agent: '@architect',
  task: 'design-architecture',
  inputs: { prd, techStack: params.stack },
  output: 'docs/architecture.md',
});
```

### Phase 2: Document Sharding (20-30 min)

```javascript
// Generate epics
const epics = await this.workflowExecutor.execute({
  agent: '@po',
  task: 'generate-epics',
  inputs: { prd },
  output: 'docs/epics/',
});

// Shard first epic into stories
const stories = await this.workflowExecutor.execute({
  agent: '@po',
  task: 'shard-epic-into-stories',
  inputs: { epic: epics[0] },
  output: 'docs/stories/active/',
});

return {
  success: true,
  action: 'greenfield_setup_complete',
  data: {
    firstStory: stories[0].path,
    totalStories: stories.length,
    estimatedDuration: this._estimateDuration(stories),
  },
};
```

### Phase 3: Development Cycle

Automatically transitions to first story execution using the 6-phase development cycle.

## Output Example

### Generated Structure

```
project-root/
├── .aios/
│   ├── config.yaml
│   └── session-state.yaml
├── docs/
│   ├── prd.md                    # Product Requirements
│   ├── architecture.md           # Technical architecture
│   ├── epics/
│   │   └── epic-1-core-features.md
│   └── stories/
│       └── active/
│           ├── 1.1-user-auth.md
│           ├── 1.2-task-crud.md
│           └── 1.3-ui-setup.md
├── src/
│   ├── index.js
│   └── (scaffold based on architecture)
├── tests/
│   └── (test scaffold)
├── package.json
└── README.md
```

### PRD Example

```markdown
# Product Requirements Document

## Vision
Task management SaaS for small teams (5-20 people)

## User Stories
1. As a user, I want to create tasks with title, description, due date
2. As a user, I want to assign tasks to team members
3. As a manager, I want to see team workload dashboard

## Technical Requirements
- REST API with JWT authentication
- PostgreSQL database
- React frontend
- Real-time updates via WebSocket

## Success Metrics
- 100 active users in 3 months
- < 200ms API response time
- 99.9% uptime
```

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `not_greenfield` | Project already has code | Use *brownfield-discovery |
| `prd_generation_failed` | Insufficient requirements | Provide --goal with more details |
| `tech_stack_conflict` | Stack incompatible with project type | Review --type and --stack parameters |

## Surface Criteria

BOB surfaces decisions for:
- **Tech stack selection** (if multiple valid options)
- **Architecture pattern** (monolith vs microservices)
- **Database choice** (SQL vs NoSQL)

## Related

- **Workflow:** greenfield-fullstack.yaml
- **Handler:** greenfield-handler.js
- **Agents:** @po, @architect, @dev

---

**Duration:** 4-8 hours (first epic complete)
**Cost Estimate:** $10-30 (depending on complexity)
