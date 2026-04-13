# Squad Creator Guide (*guide command)

## 🏗️ Squad Creator Guide

### When to Use Me

- **Designing squads from documentation** (PRDs, specs, requirements)
- Creating new squads for your project
- **Analyzing existing squads** for coverage and improvements
- **Extending squads** with new components (agents, tasks, templates, etc.)
- Validating existing squad structure
- Preparing squads for distribution
- Listing available local squads

### Prerequisites

1. AIOS project initialized (`.aiox-core/` exists)
2. Node.js installed (for script execution)
3. For publishing: GitHub authentication configured

### Typical Workflow

**Option A: Guided Design (Recommended for new users)**

1. **Design squad** → `*design-squad --docs ./docs/prd/my-project.md`
2. **Review recommendations** → Accept/modify agents and tasks
3. **Generate blueprint** → Saved to `./squads/.designs/`
4. **Create from blueprint** → `*create-squad my-squad --from-design`
5. **Validate** → `*validate-squad my-squad`

**Option B: Direct Creation (For experienced users)**

1. **Create squad** → `*create-squad my-domain-squad`
2. **Customize** → Edit agents/tasks in the generated structure
3. **Validate** → `*validate-squad my-domain-squad`
4. **Distribute** (optional):
   - Keep local (private)
   - Publish to aios-squads (public)
   - Sync to Synkra API (marketplace)

**Option C: Continuous Improvement (For existing squads)**

1. **Analyze squad** → `*analyze-squad my-squad`
2. **Review suggestions** → Coverage metrics and improvement hints
3. **Add components** → `*extend-squad my-squad`
4. **Validate** → `*validate-squad my-squad`

### Squad Structure

```text
./squads/my-squad/
├── squad.yaml              # Manifest (required)
├── README.md               # Documentation
├── config/
│   ├── coding-standards.md
│   ├── tech-stack.md
│   └── source-tree.md
├── agents/                 # Agent definitions
├── tasks/                  # Task definitions (task-first!)
├── workflows/              # Multi-step workflows
├── checklists/             # Validation checklists
├── templates/              # Document templates
├── tools/                  # Custom tools
├── scripts/                # Utility scripts
└── data/                   # Static data
```

### Common Pitfalls

- ❌ Forgetting to validate before publishing
- ❌ Missing required fields in squad.yaml
- ❌ Not following task-first architecture
- ❌ Circular dependencies between squads

### Related Agents

- **@dev (Dex)** - Implements squad code
- **@qa (Quinn)** - Reviews squad quality
- **@devops (Gage)** - Handles deployment
