# Navigator Quickstart Guide

Get started with Navigator in 5 minutes or less.

---

## Prerequisites

Before you begin:
- ✅ AIOS project initialized (`.aios-core/` exists)
- ✅ Node.js >= 18.0.0 installed
- ✅ Git available

---

## 1. Verify Navigator Installation (30 seconds)

```bash
@navigator
```

**Expected output:**
```
🧭 Navigator Agent ready

Available commands:
  *map-project
  *where-am-i
  *auto-navigate
  ...
```

---

## 2. Run Health Check (15 seconds)

```bash
*navigator-doctor
```

**Expected output:**
```
🏥 Navigator Health Check

✓ Node.js Version: v20.11.0 (>= 18.0.0)
✓ Git: Available
✓ NPM Dependencies: All installed
✓ Git Hooks: Installed
✓ Directory Structure: Valid
✓ Pipeline Map: Valid YAML
✓ Scripts: Executable

✅ Navigator is healthy! (7/7 checks passed)
```

**If any check fails**, see [Troubleshooting](#troubleshooting) below.

---

## 3. Choose Your Path (2 minutes)

### Path A: New Project (Greenfield)

Starting from scratch?

```bash
*map-project
```

**Navigator will ask:**
```
📋 Describe your project:
```

**Example response:**
```
Blog platform with Next.js frontend, Node.js backend,
PostgreSQL database. Features: user auth, post CRUD,
comments, search, admin panel.
```

**Navigator generates:**
```
✅ Roadmap generated!

Saved to:
  - .aios/navigator/blog-platform/roadmap.md
  - docs/roadmap.md (local copy)

Starting point: Phase 1 (Pesquisa) → @analyst
```

**Next steps:**
```bash
*auto-navigate
# Follow the suggested command
```

---

### Path B: Existing Project (Brownfield)

Already have code?

```bash
*where-am-i
```

**Navigator shows:**
```
📍 Current Phase: 7 — Desenvolvimento (42% complete)

✅ Completed: Research, PRD, Architecture, Epics, Stories, Validation
🔄 In Progress: Development (Story 7.15/7.34)
⏳ Pending: QA, Fixes, Deploy

Next: Continue Story 7.15 with @dev
```

**Next steps:**
```bash
@dev
# Resume development where you left off
```

---

## 4. Work Through Phases (ongoing)

Follow this cycle:

1. **Check current status**
   ```bash
   *where-am-i
   ```

2. **Navigate to next agent**
   ```bash
   *auto-navigate
   ```

3. **Complete the phase**
   ```bash
   # Execute the suggested command
   @agent *task
   ```

4. **Repeat** until all 10 phases complete

---

## 5. Track Progress (anytime)

### Quick Status

```bash
*where-am-i
```

### Detailed Report

```bash
*status-report
```

Generates:
- Current phase and completion %
- Completed/active/pending stories
- Blockers and next steps
- Velocity metrics

---

## Troubleshooting

### Issue: Health check fails on "NPM Dependencies"

**Fix:**
```bash
npm install js-yaml glob inquirer
```

### Issue: "Git hooks not installed"

**Fix:**
```bash
npm run prepare
node squads/navigator/scripts/install-hooks.js install
```

### Issue: "Pipeline map invalid"

**Fix:**
```bash
# Validate YAML syntax
cat squads/navigator/data/navigator-pipeline-map.yaml
# Fix any YAML errors
```

### Issue: "Phase detection returns wrong phase"

**Fix:**
```bash
# Check if output files exist
ls docs/stories/story-*.md
# Verify they match patterns in pipeline map
```

### More help

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for comprehensive guide.

---

## Common Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `*map-project` | Generate roadmap | Starting new project |
| `*where-am-i` | Check status | Daily/after break |
| `*auto-navigate` | Get next step | Advance to next phase |
| `*checkpoint` | Save snapshot | Before major changes |
| `*status-report` | Full report | Weekly meetings |
| `*orchestrate` | Parallel execution | Large epics (8+ stories) |
| `*navigator-doctor` | Health check | Debugging issues |

---

## Next Steps

### Learn More

- **Examples:** [examples/](./examples/) - Practical tutorials
- **Full Guide:** [README.md](./README.md) - Complete documentation
- **FAQ:** [FAQ.md](./FAQ.md) - Common questions

### Advanced Features

- **Multi-chat orchestration:** See [example-3](./examples/example-3-multi-chat-epic.md)
- **Custom pipelines:** Edit `data/navigator-pipeline-map.yaml`
- **TypeScript migration:** See [TYPESCRIPT-MIGRATION.md](./TYPESCRIPT-MIGRATION.md)

---

## Tips for Success

1. **Run `*where-am-i` daily** - Make it your morning ritual
2. **Create checkpoints before breaks** - Never lose context
3. **Enable git hooks** - Automatic roadmap updates
4. **Share roadmap with team** - Everyone stays aligned
5. **Use `*orchestrate` for large epics** - Save time with parallelization

---

## You're Ready! 🎉

You now know enough to:
- ✅ Check Navigator health
- ✅ Map new projects
- ✅ Detect current phase
- ✅ Navigate through pipeline
- ✅ Track progress

**Get started:**
```bash
@navigator
*map-project
```

Happy navigating! 🧭

---

**Questions?** See [FAQ.md](./FAQ.md) or open an issue on GitHub.

---

*Navigator Quickstart v1.0 - 5 minute setup*
