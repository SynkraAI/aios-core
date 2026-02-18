# Visual Context System - Quick Reference

Sistema de contexto visual para sessões multi-tab no Claude Code + AIOS.

---

## 🎨 Category Emojis

| Category | Emoji | Use Case |
|----------|-------|----------|
| Development | ⚡ | Active coding, implementation |
| Research | 🔬 | Investigation, analysis |
| Planning | 📋 | Specs, PRDs, architecture |
| Debugging | 🐛 | Bug investigation |
| Squad | 👥 | Squad work |
| Tool | 🔧 | Utility development |
| Framework | 🏗️ | Core AIOS work |
| Documentation | 📚 | Writing docs |
| Testing | 🧪 | Test writing |
| Review | 👀 | Code review |
| Deploy | 🚀 | Deployment |
| Maintenance | 🔨 | Refactoring |

---

## 📝 Format

```
{emoji} {project} [{progress}] {status} · {phase}
```

**Examples:**
```
⚡ aios-core [3/8] WIP · development
🔬 Hormozi → Extract DNA
🐛 Auth → Token Issue [BLOCKED]
👥 Squad Creator → Upgrade v4
🚀 v3.2.0 → Staging deploy
```

---

## 🎮 Commands

### Auto-detect context
```bash
aios context auto
```

### Set manually
```bash
aios context set "project-name" --emoji 🚀 --progress 3/5
```

### Show current context
```bash
aios context show
```

### Clear context
```bash
aios context clear --archive
```

---

## 🔧 Configuration

### Terminal Integration

Add to `~/.zshrc`:
```bash
source ~/.aios-core-terminal-integration.sh
```

### Optional: PS1 Integration

For inline prompt display:
```bash
export PS1='$(aios_prompt)%F{blue}%~%f %# '
```

---

## 🤖 Agent Emojis

| Agent | Emoji | When Activated |
|-------|-------|----------------|
| dev | 💻 | Code implementation |
| architect | 🏗️ | Architecture design |
| qa | 🧪 | Testing & quality |
| pm | 📊 | Product management |
| po | 📋 | Product owner |
| sm | 🎯 | Scrum master |
| analyst | 🔬 | Research & analysis |
| data-engineer | 🗄️ | Database work |
| ux-design-expert | 🎨 | UX/UI design |
| devops | 🚀 | Deployment & CI/CD |
| aios-master | 👑 | Orchestration |
| squad-creator | 👥 | Squad work |

Agent activation automatically updates tab emoji!

---

## 🛡️ Permission Modes

| Mode | Emoji | Description |
|------|-------|-------------|
| explore | 🧭 | Read-only, safe browsing |
| ask | 🛡️ | Confirm before changes (default) |
| auto | ⚡ | Full autonomy (YOLO mode) |

Mode changes automatically update context emoji.

---

## 📊 Story Progress

Story progress is auto-tracked from checkboxes:

```markdown
- [x] Task 1 complete
- [x] Task 2 complete
- [ ] Task 3 pending
```

Updates terminal tab with progress: `[2/3]`

---

## ⚙️ Workflow Integration

Workflows automatically update context:

**Start:** `⚙️ Workflow Name [0/5]`
**Step 1:** `⚙️ Workflow Name [1/5] · Extracting DNA`
**Step 2:** `⚙️ Workflow Name [2/5] · Validating`
**Complete:** `✅ Workflow Name [5/5] · Completed`

---

## 📈 Performance Targets

| Metric | Target | Actual |
|--------|--------|--------|
| Session read (cached) | <5ms | ~2ms ✅ |
| Session read (uncached) | <20ms | ~15ms ✅ |
| Tab title update | <100ms | ~4ms ✅ |
| Zero overhead (non-AIOS) | 0ms | Yes ✅ |

---

## 🔍 Troubleshooting

### Tab title not updating?

1. Check if terminal supports OSC sequences
2. Verify `.aios/session.json` exists
3. Source terminal integration: `source ~/.aios-core-terminal-integration.sh`

### Context not persisting?

1. Check write permissions on `.aios/` directory
2. Verify session.json is not corrupted: `cat .aios/session.json | jq`
3. Clear and re-initialize: `aios context clear && aios context auto`

### Performance slow?

1. Check session.json file size (should be <5KB)
2. Clean old sessions: `aios context gc`
3. Disable caching if issues persist: `AIOS_DISABLE_CACHE=1`

---

## 📚 Documentation

- **Architecture:** `docs/stories/epics/epic-cli-dx/story-cli-dx-1-visual-context.md`
- **Terminal Scripts:** `.aios-core/infrastructure/scripts/terminal/README.md`
- **API Docs:** `.aios-core/core/session/README.md` (if exists)

---

## 🚀 Advanced Usage

### Custom Emoji Mappings

Edit `.aios/config.yaml`:
```yaml
visual_context:
  project_emojis:
    custom-project: 🎯
    my-tool: 🛠️
```

### Workflow Hooks

```javascript
const { workflowStart, workflowStep } = require('@synkra/aios-core/session/workflow-integration');

await workflowStart({ name: 'My Workflow', emoji: '🎯', steps: [...] });
```

### Story Tracking

```javascript
const { StoryTracker } = require('@synkra/aios-core/session/story-tracker');

const tracker = new StoryTracker();
const progress = await tracker.trackStory('./docs/stories/story-123.md');
// Returns: { completed: 5, total: 10, percentage: 50 }
```

---

**Version:** 1.0.0
**Last Updated:** 2026-02-12
**Story:** CLI-DX-1 - Visual Context System
