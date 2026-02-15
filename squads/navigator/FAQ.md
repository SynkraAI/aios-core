# Navigator FAQ (Frequently Asked Questions)

Common questions about Navigator squad.

---

## General Questions

### What is Navigator?

Navigator is an autonomous project navigation and orchestration squad for AIOS. It helps you:
- Never lose track of where you are in complex projects
- Map complete roadmaps from project descriptions
- Detect current phase automatically
- Orchestrate multi-agent workflows
- Resume work instantly after breaks

---

### Do I need Navigator for every project?

**Recommended for:**
- ✅ Complex projects (> 20 stories)
- ✅ Multi-phase projects (research → design → dev → deploy)
- ✅ Team projects (multiple developers)
- ✅ Long-running projects (weeks to months)

**Not needed for:**
- ❌ Single-file scripts
- ❌ Proof of concepts (< 100 lines)
- ❌ Simple bug fixes
- ❌ One-off tasks

---

### Is Navigator only for new projects?

No! Navigator works for:
- **Greenfield** (new projects) - Map roadmap from scratch
- **Brownfield** (existing projects) - Detect current phase from files
- **In-progress projects** - Resume where you left off

---

## Getting Started

### How do I install Navigator?

Navigator is included in AIOS Core. Just activate:

```bash
@navigator
*navigator-doctor  # Verify installation
```

See [QUICKSTART.md](./QUICKSTART.md) for complete setup.

---

### What are the prerequisites?

- AIOS Core >= 4.0.0
- Node.js >= 18.0.0
- Git
- NPM packages: `js-yaml`, `glob`, `inquirer`

---

### How long does setup take?

- **First-time setup:** 5 minutes (including health check)
- **Map new project:** 2-3 minutes
- **Check status:** 5 seconds

---

## Using Navigator

### How does `*where-am-i` know my current phase?

Navigator analyzes:
1. **Output files** - Checks which phase outputs exist
2. **Story status** - Parses YAML front-matter from story files
3. **Git history** - Looks at recent commits
4. **Checkpoint data** - Reads latest checkpoint (if exists)

Then it matches against the 10-phase pipeline to determine position.

---

### What's the difference between `*where-am-i` and `*status-report`?

| Command | Output | When to Use |
|---------|--------|-------------|
| `*where-am-i` | Quick summary (30 seconds) | Daily check-ins |
| `*status-report` | Detailed report (2-3 minutes) | Weekly meetings, stakeholder updates |

---

### Can I customize the 10-phase pipeline?

Yes! Edit `data/navigator-pipeline-map.yaml`:

```yaml
phases:
  - id: 1
    name: "Your Custom Phase"
    agent: "@your-agent"
    outputs:
      - "your/custom/path/*.md"
```

See [example-roadmap.md](./examples/example-roadmap.md) for details.

---

### What if my project doesn't fit the 10 phases?

You can:
1. **Adapt the pipeline** - Customize `navigator-pipeline-map.yaml`
2. **Skip phases** - Use transition rules to skip unnecessary phases
3. **Add phases** - Extend beyond 10 if needed
4. **Merge phases** - Combine phases (e.g., merge Epics + Stories)

---

## Roadmaps

### Where are roadmaps stored?

Two locations (synced automatically):
- **Central:** `.aios/navigator/{project-name}/roadmap.md`
- **Local:** `docs/roadmap.md` (for version control)

The bidirectional sync keeps them in sync.

---

### Can I edit roadmaps manually?

Yes! Edit `docs/roadmap.md` and commit:

```bash
vim docs/roadmap.md
git commit -m "Update roadmap"
# Post-commit hook syncs to central automatically
```

---

### What happens if roadmaps conflict?

Navigator asks you to choose:
```
⚠️  Roadmap conflict detected!
Central: modified 2026-02-15 14:30
Local: modified 2026-02-15 16:45

Which version to keep? (central/local)
```

You can also:
- Set `NAVIGATOR_AUTO_MODE=true` for automatic resolution (newer wins)
- Manually merge both files

---

### Can I have multiple roadmaps per project?

Yes, but only one "active" roadmap. Use cases:
- **Main roadmap:** Current development plan
- **Archived roadmaps:** Historical versions
- **Alternative roadmaps:** Different approaches (compare before choosing)

Store alternatives in `docs/roadmaps/` directory.

---

## Checkpoints

### When should I create checkpoints?

**Automatic checkpoints** (via git hooks):
- After each git commit
- When phase completes

**Manual checkpoints** (run `*checkpoint`):
- Before major refactorings
- Before risky changes
- End of day (to save progress)
- Before vacations/breaks

---

### How many checkpoints can I have?

Unlimited. But Navigator only shows recent 10 by default.

Typical project: 20-50 checkpoints over lifecycle.

---

### Can I restore from a checkpoint?

Yes (planned feature for v2.0). Currently checkpoints are:
- **Reference:** See what was done when
- **Recovery:** Manually inspect checkpoint JSON to understand state

---

### Do checkpoints include code?

No. Checkpoints store:
- Metadata (phase, stories, completion %)
- Git commit SHA (reference to code)
- File lists and metrics

To restore code, use git:
```bash
# Get commit SHA from checkpoint
cat .aios/navigator/{project}/checkpoints/cp-X.json | jq .git.commit

# Restore code
git checkout <commit-sha>
```

---

## Multi-Chat Orchestration

### What is multi-chat orchestration?

Execute multiple stories simultaneously across parallel Claude Code chat sessions.

**Example:**
- Chat 1: Coordinator (@sm) manages workflow
- Chat 2: Dev implements Wave 1 stories (3 stories)
- Chat 3: Dev implements Wave 2 stories (4 stories)
- Chat 4: Dev implements Wave 3 stories (3 stories)

See [example-3](./examples/example-3-multi-chat-epic.md) for walkthrough.

---

### When should I use orchestration?

**Good for:**
- Large epics (8+ stories)
- Stories with clear dependencies
- Time-sensitive projects (want 50% speedup)

**Not good for:**
- Small epics (< 5 stories)
- Highly interdependent stories (sequential is better)
- Exploratory work (direction unclear)

---

### How does Navigator prevent merge conflicts?

By analyzing dependencies and grouping stories into "waves":
- **Wave 1:** No dependencies (parallel safe)
- **Wave 2:** Depends on Wave 1 (waits for approval)
- **Wave 3:** Depends on Wave 2 (waits for approval)

Each wave works on independent files, minimizing conflicts.

---

## Troubleshooting

### `*where-am-i` returns wrong phase. Why?

Common causes:
1. **Output files don't match pipeline patterns**
   - Fix: Update `navigator-pipeline-map.yaml` outputs
2. **Story files missing YAML front-matter**
   - Fix: Add `status: pending|in-progress|completed` to stories
3. **Old roadmap cached**
   - Fix: Run `*update-roadmap --force-sync`

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for details.

---

### Roadmap sync keeps failing. Help!

Check:
```bash
# 1. Git hooks installed?
ls .husky/post-commit

# 2. Hook has Navigator line?
grep "post-commit-hook.js" .husky/post-commit

# 3. Manual sync test
node squads/navigator/scripts/roadmap-sync.js
```

---

### Checkpoints aren't being created automatically

Verify:
```bash
# Git hooks installed?
*navigator-doctor | grep "Git Hooks"

# If failed:
node squads/navigator/scripts/install-hooks.js install
```

---

## Advanced Usage

### Can Navigator work with CI/CD?

Yes! Phase detection can trigger CI/CD:

```yaml
# .github/workflows/phase-check.yml
on: push
jobs:
  check-phase:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: |
          PHASE=$(node -e "
            const { detectPhase } = require('./squads/navigator/scripts/navigator/phase-detector');
            detectPhase().then(p => console.log(p.id));
          ")
          echo "Current phase: $PHASE"

          if [ "$PHASE" -eq 8 ]; then
            echo "Running QA tests..."
            npm test
          fi
```

---

### Can I integrate Navigator with Jira/Linear?

Not directly, but you can:
1. Export status reports: `*status-report --format json > status.json`
2. Parse JSON and sync to Jira via API
3. Use git commit messages to reference Jira tickets

Integration planned for v2.0.

---

### Can Navigator suggest optimal phase order?

Not yet. Currently uses fixed 10-phase pipeline.

Planned for v2.0: AI-powered pipeline optimization based on project type.

---

### Does Navigator track time spent per phase?

Yes, in checkpoints:
```json
{
  "metrics": {
    "timeTracking": {
      "phaseStarted": "2026-02-08T08:00:00Z",
      "currentDuration": "7 days 6 hours"
    }
  }
}
```

Dashboard UI for time tracking planned for v2.0.

---

## Performance

### Is Navigator slow on large projects?

Navigator scales well up to:
- 1,000 story files
- 10,000 source files
- 100 checkpoints

If slower than 5 seconds, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md#performance-issues).

---

### Does Navigator use AI/LLMs?

No. Navigator uses:
- File pattern matching (glob)
- YAML parsing
- Git operations

This makes it fast, deterministic, and offline-capable.

---

## Contributing

### How can I contribute?

See [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Code contributions
- Documentation improvements
- Bug reports
- Feature requests

---

### Can I create custom tasks for Navigator?

Yes! Follow this template:

```markdown
<!-- tasks/nav-your-task.md -->
# *your-task

## Purpose
What this task does

## Inputs
- What it needs

## Outputs
- What it produces

## Steps
1. Step 1
2. Step 2

## Example
Usage example
```

Then add to `squad.yaml` and submit PR.

---

## Licensing

### Is Navigator free?

Yes! Navigator is MIT licensed (free and open source).

---

### Can I use Navigator commercially?

Yes. MIT license permits:
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use

See [LICENSE](./LICENSE) for details.

---

## Support

### Where do I get help?

1. **Documentation:** [README.md](./README.md), [QUICKSTART.md](./QUICKSTART.md)
2. **Examples:** [examples/](./examples/)
3. **Troubleshooting:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
4. **GitHub Issues:** https://github.com/SynkraAI/aios-core/issues
5. **Discussions:** https://github.com/SynkraAI/aios-core/discussions

---

### How do I report bugs?

**Before reporting:**
1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Search existing issues
3. Run `*navigator-doctor` to verify setup

**When reporting:**
1. Go to: https://github.com/SynkraAI/aios-core/issues/new
2. Include:
   - Error message (full text)
   - Steps to reproduce
   - Output of `*navigator-doctor`
   - Environment (OS, Node version)

---

### How often is Navigator updated?

- **Bug fixes:** As needed (patch releases)
- **Features:** Every 2-3 months (minor releases)
- **Breaking changes:** Once a year (major releases)

See [CHANGELOG.md](./CHANGELOG.md) for version history.

---

## Roadmap

### What's planned for Navigator 2.0?

**Planned features:**
- Dashboard UI for visual progress tracking
- Checkpoint restoration
- AI-powered roadmap suggestions
- Custom pipeline templates library
- Multi-project orchestration
- Time tracking integration
- Slack/Discord notifications
- Gantt chart generation

See [CHANGELOG.md](./CHANGELOG.md#unreleased) for details.

---

### When is 2.0 released?

Estimated: Q3 2026

Follow progress on GitHub: https://github.com/SynkraAI/aios-core/projects

---

## Still Have Questions?

**Ask in GitHub Discussions:** https://github.com/SynkraAI/aios-core/discussions

We typically respond within 24-48 hours.

---

*Navigator FAQ v1.0 - Last updated 2026-02-15*
