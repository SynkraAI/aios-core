# Navigator Examples

This directory contains practical examples demonstrating how to use Navigator for different scenarios.

---

## Quick Navigation

| Example | Scenario | Complexity | Time to Read |
|---------|----------|------------|--------------|
| [Example 1](#example-1-new-fullstack-app) | New project setup | Beginner | 10 min |
| [Example 2](#example-2-resume-brownfield) | Resume after break | Intermediate | 8 min |
| [Example 3](#example-3-multi-chat-epic) | Parallel execution | Advanced | 15 min |
| [Example Roadmap](#example-roadmap) | Roadmap structure | Reference | 5 min |
| [Example Checkpoint](#example-checkpoint) | Checkpoint format | Reference | 3 min |

---

## Example 1: New Fullstack App

**File:** [example-1-new-fullstack-app.md](./example-1-new-fullstack-app.md)

**Scenario:** Starting a new e-commerce platform from scratch

**What you'll learn:**
- How to map a new project with `*map-project`
- Review generated roadmaps
- Navigate through all 10 phases
- Create checkpoints manually
- Track progress with `*status-report`
- Deploy to production

**Key Commands:**
```bash
@navigator
*map-project
*where-am-i
*auto-navigate
*checkpoint
*status-report
```

**Use this when:**
- Starting a new project
- Need a complete roadmap
- Want to follow AIOS methodology
- Solo developer or small team

---

## Example 2: Resume Brownfield Project

**File:** [example-2-resume-brownfield.md](./example-2-resume-brownfield.md)

**Scenario:** Returning to an existing project after 2 weeks vacation

**What you'll learn:**
- Detect current phase instantly
- See active and completed stories
- Identify blockers automatically
- Review checkpoints history
- Resume development without wasting time

**Key Commands:**
```bash
@navigator
*where-am-i
*checkpoint --list
*status-report --detailed
```

**Use this when:**
- Lost context (vacation, weekend, context switch)
- Working on multiple projects
- Need quick status overview
- Onboarding to existing project

**Time Saved:** ~45 minutes vs manual context recovery

---

## Example 3: Multi-Chat Epic Orchestration

**File:** [example-3-multi-chat-epic.md](./example-3-multi-chat-epic.md)

**Scenario:** Execute 12-story epic in parallel across 4 Claude Code chats

**What you'll learn:**
- Analyze story dependencies
- Split work into waves (dependency groups)
- Generate prompts for multiple chats
- Coordinate parallel execution
- Merge work from multiple chats

**Key Commands:**
```bash
@navigator
*orchestrate epic-3.2
```

**Use this when:**
- Large epics (8+ stories)
- Want to save time (50% faster)
- Stories have clear dependencies
- Comfortable with git branching

**Time Saved:** 16 hours on a 36-hour epic

---

## Example Roadmap (Annotated)

**File:** [example-roadmap.md](./example-roadmap.md)

**Purpose:** Understand roadmap structure and syntax

**What you'll learn:**
- Front-matter YAML format
- Phase definitions (inputs, outputs, agents)
- Transition rules (auto-advance, blocked, loop)
- Checkpoint configuration
- Metadata and estimates

**Use this as:**
- Template for your own roadmaps
- Reference when customizing pipelines
- Learning tool for roadmap anatomy

**Highlights:**
- Complete 10-phase example
- Inline comments explaining each field
- Best practices for glob patterns
- Transition logic examples

---

## Example Checkpoint (JSON)

**File:** [example-checkpoint.json](./example-checkpoint.json)

**Purpose:** Understand checkpoint data structure

**What you'll see:**
- Checkpoint metadata (ID, timestamp, type)
- Phase information and completion %
- Git commit details
- Story status (completed, in-progress, pending)
- Metrics (velocity, code stats, time tracking)
- Environment information

**Use this as:**
- Reference for checkpoint format
- Understanding what Navigator tracks
- Debugging checkpoint issues
- Building custom tooling

**Key Fields:**
```json
{
  "checkpointId": "cp-{phase}-{type}-{timestamp}",
  "phase": { "id": 7, "completion": 67 },
  "stories": { "completed": 30, "inProgress": 3, "pending": 12 },
  "git": { "commit": "...", "branch": "..." },
  "metrics": { "velocity": {...}, "codeStats": {...} }
}
```

---

## Learning Path

### Beginner (New to Navigator)
1. Read [Example 1](./example-1-new-fullstack-app.md) - Full workflow
2. Read [Example Roadmap](./example-roadmap.md) - Understand structure
3. Try Navigator on a small project

### Intermediate (Used Navigator before)
1. Read [Example 2](./example-2-resume-brownfield.md) - Context recovery
2. Practice `*where-am-i` daily
3. Set up automatic checkpoints

### Advanced (Power User)
1. Read [Example 3](./example-3-multi-chat-epic.md) - Parallel execution
2. Customize pipelines for your stack
3. Create reusable roadmap templates

---

## Example Projects

All examples reference realistic projects:

| Project | Type | Tech Stack | Stories |
|---------|------|------------|---------|
| E-commerce Platform | Greenfield | Next.js + Node.js | 34 |
| CRM System | Brownfield | React + Express | 45 |
| SaaS Analytics Dashboard | Feature Epic | Next.js + PostgreSQL | 12 |
| Task Management SaaS | Template | Next.js + Prisma | 45 |

---

## Common Patterns

### Pattern 1: Start New Project
```bash
@navigator
*map-project
# Describe project
*show-roadmap
# Review and customize
*auto-navigate
# Follow delegations
```

### Pattern 2: Check Status
```bash
@navigator
*where-am-i
# See current phase, stories, blockers
```

### Pattern 3: Create Checkpoint
```bash
@navigator
*checkpoint
# Manual snapshot before major changes
```

### Pattern 4: Generate Report
```bash
@navigator
*status-report --detailed
# Share with team or stakeholders
```

### Pattern 5: Orchestrate Epic
```bash
@navigator
*orchestrate epic-{id}
# Get prompts for parallel chats
```

---

## Tips & Tricks

### Tip 1: Daily Ritual
Run `*where-am-i` every morning to start with context:
```bash
@navigator
*where-am-i
```

### Tip 2: Before Long Break
Create manual checkpoint before vacation:
```bash
@navigator
*checkpoint
# Add description of current state
```

### Tip 3: Weekly Reports
Generate status report for team meetings:
```bash
@navigator
*status-report --format markdown > weekly-report.md
```

### Tip 4: Custom Pipelines
Copy `example-roadmap.md` and adapt for your tech stack:
```bash
cp squads/navigator/examples/example-roadmap.md .aios/navigator/my-project/roadmap.md
# Edit phases, agents, outputs to match your project
```

### Tip 5: Git Integration
Enable auto-checkpoints via git hooks:
```bash
node squads/navigator/scripts/install-hooks.js install
# Checkpoints created automatically after commits
```

---

## Troubleshooting Examples

### "Where am I stuck?"
```bash
@navigator
*where-am-i
# Check "Blockers" section
```

### "Why isn't phase advancing?"
```bash
# Check if all outputs exist
ls docs/stories/story-*.md
# Compare with roadmap outputs list
```

### "How do I skip a phase?"
```bash
# Edit roadmap.md, change next_phase
# Or use transition rules to skip conditionally
```

### "Can I go back to a previous phase?"
```bash
# Load checkpoint from that phase
@navigator
*checkpoint --list
*checkpoint --restore cp-5-manual-20260201-100000
```

---

## Contributing Examples

Have a great Navigator example? Contribute it!

1. Create new file: `example-N-your-scenario.md`
2. Follow existing format (Context → Steps → Results → Takeaways)
3. Include realistic project details
4. Add to this README index
5. Submit PR to aios-core

---

## Additional Resources

- **Main README:** [../README.md](../README.md) - Complete Navigator documentation
- **Squad Manifest:** [../squad.yaml](../squad.yaml) - Squad configuration
- **Workflows:** [../workflows/](../workflows/) - Multi-step YAML workflows
- **Checklists:** [../checklists/](../checklists/) - Validation checklists

---

**Navigator Examples** - Learn by doing 🧭

*Last updated: 2026-02-15*
