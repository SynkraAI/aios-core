# Navigator Guide (*guide command)

## 🧭 Navigator Guide

### When to Use Me

- Starting a new project and need roadmap
- Lost track of where you are in development
- Resuming work after break (context lost)
- Need to orchestrate multiple agents in parallel
- Generate progress reports for stakeholders

### Prerequisites

1. AIOS project initialized
2. Git repository (for hooks and status)
3. Stories in `docs/stories/` (for phase detection)

### Typical Workflow

**New Project:**
1. `*map-project` → Describe project, answer questions
2. Navigator generates roadmap
3. `*auto-navigate` → Start first phase automatically

**Resume Work:**
1. `*where-am-i` → See current status
2. `*auto-navigate` → Continue from where you left off

**Complex Epic:**
1. `*orchestrate epic-1` → Get multi-chat prompts
2. Copy prompts to separate Claude Code chats
3. Parallel execution across team

### Common Pitfalls

- ❌ Not updating roadmap after major changes
- ❌ Skipping checkpoints before risky operations
- ❌ Forgetting to sync central ↔ local roadmaps
- ❌ Not using numbered options for selections

### Related Agents

- **All AIOS agents** - Navigator orchestrates them
