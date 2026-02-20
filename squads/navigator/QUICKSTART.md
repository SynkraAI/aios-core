# Quickstart Guide

Get Navigator running in under 5 minutes.

---

## Step 1: Health Check (30 seconds)

```bash
@navigator
*navigator-doctor
```

All 7 checks should pass. If not, see [INSTALL.md](./INSTALL.md).

---

## Step 2: Choose Your Path

### Path A — New Project

Starting from scratch? Map your project:

```bash
*map-project
```

Navigator asks you to describe your project in plain text:

```
> SaaS task manager with Kanban board, real-time collaboration,
  and team analytics. Next.js frontend, Supabase backend.
```

Navigator will:
1. Parse entities, workflows, and complexity
2. Ask 3-5 clarifying questions (stack, integrations, timeline)
3. Generate a 10-phase roadmap
4. Save it to `.aios/navigator/{project}/roadmap.md`

**Then start navigating:**

```bash
*auto-navigate
# → "Phase 1 (Research) — Activate @analyst with *brainstorm"
```

---

### Path B — Existing Project

Already have code? Detect where you are:

```bash
*where-am-i
```

Navigator scans your file system and shows:

```
📍 Phase 7 — Development (42% complete)

✅ Done: Research, PRD, Architecture, Epics, Stories, Validation
🔄 Active: Story 7.3 (auth middleware) — @dev
⏳ Pending: QA, Fix Loop, Deploy

Next: Continue Story 7.3 → @dev *develop
```

**Then continue:**

```bash
*auto-navigate
# → Activates the right agent for your current phase
```

---

## Step 3: Daily Workflow

Once mapped, your daily cycle is:

```bash
# 1. Check where you are
*where-am-i

# 2. Navigate to next step
*auto-navigate

# 3. Work with the delegated agent
@dev  # or whichever agent Navigator suggests

# 4. Repeat
```

Navigator updates the roadmap automatically via git hooks.

---

## Step 4: Track Progress

### Quick status

```bash
*where-am-i
```

### Detailed report

```bash
*status-report
```

Generates a markdown report with:
- Phase completion percentages
- Active and completed stories
- Blockers and risks
- Velocity metrics

### Create a checkpoint

```bash
*checkpoint
```

Save a snapshot before risky operations. Restore later with `*resume-project`.

---

## Common Commands

| Command | When to use |
|---------|-------------|
| `*map-project` | Starting a new project |
| `*where-am-i` | Daily check / after a break |
| `*auto-navigate` | Advance to next phase |
| `*checkpoint` | Before major changes |
| `*status-report` | Team meetings |
| `*orchestrate {epic}` | Large epics (8+ stories) |
| `*navigator-doctor` | Debugging |

---

## Tips

1. **Run `*where-am-i` every morning** — make it your first command
2. **Create checkpoints before breaks** — never lose context
3. **Use `*orchestrate` for large epics** — parallelize across 4 chats
4. **Enable git hooks** — automatic roadmap updates on every commit
5. **Share roadmaps with your team** — the `docs/roadmap.md` local copy is gitignore-friendly

---

## Next Steps

- [Examples](./examples/) — See Navigator in action with real scenarios
- [FAQ](./FAQ.md) — 40+ questions answered
- [Full README](./README.md) — Architecture, diagrams, and deep details

---

**Ready?**

```bash
@navigator
*map-project
```

Happy navigating! 🧭
