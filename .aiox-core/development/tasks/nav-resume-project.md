---
task: Resume Existing Project
responsavel: "@navigator"
responsavel_type: agent
atomic_layer: task
elicit: true
Entrada: |
  - project_name: Name of project to resume (optional)
Saida: |
  - loaded_index: INDEX.md content (fonte da verdade)
  - session_context: Full context
  - next_action: Suggested command
Checklist:
  - "[ ] List available projects (.aiox/navigator/)"
  - "[ ] Load INDEX.md (PRIORITY — fonte da verdade)"
  - "[ ] Sync deferred updates (P3 catch-up from emergency mode)"
  - "[ ] Display project status from INDEX.md"
  - "[ ] Offer quick actions (continue/review/restart)"
veto_conditions:
  - "No projects found in .aiox/navigator/ → BLOCK (no mapped projects to resume, use *map-project)"
  - "Selected project roadmap is corrupted/unreadable → BLOCK (suggest *navigator-doctor)"
  - "Selected project has no checkpoints and no stories → WARN (limited context available for resume)"
  - "No INDEX.md AND no roadmap found for project → BLOCK (project unmapped, run *create-project or *map-project)"
  - "INDEX.md exists but cannot be parsed (missing required sections) → BLOCK (restore from .bak or run *create-project)"
  - "Sync deferred updates failed after 3 attempts → BLOCK (manual intervention required — check ACTIVE.md format)"
  - "ACTIVE.md has uncommitted manual edits (git diff detects changes) → WARN user, ask which version to keep before syncing"
---

# *resume-project

Resume existing project with full context restoration.

## Usage

```bash
@navigator
*resume-project

# Or specify project name
*resume-project ecommerce-order-mgmt
```

## Workflow

### Step 1: List Projects

```javascript
const projects = fs.readdirSync('.aiox/navigator/');

console.log('Available projects:');
projects.forEach((project, i) => {
  const roadmap = loadRoadmap(project);
  console.log(`${i+1}. ${project} (${roadmap.status})`);
});
```

Output:
```
Available projects:
1. ecommerce-order-mgmt (Em Progresso)
2. aios-core (Em Progresso)
3. dashboard (Concluído)

Which project to resume? [1-3]
>
```

### Step 2: Load INDEX.md (FONTE DA VERDADE)

O INDEX.md é a fonte primária de contexto. Sempre ler primeiro.

```javascript
const indexPath = `docs/projects/${projectName}/INDEX.md`;
const index = fs.readFileSync(indexPath, 'utf-8');
// INDEX contém: Estado Atual, Próximo Passo, Histórico, Recursos, Tarefas
```

**Hierarquia de fontes (em ordem de prioridade):**

| # | Fonte | Path | Quando usar |
|---|-------|------|-------------|
| 1 | **INDEX.md** | `docs/projects/{project}/INDEX.md` | SEMPRE (fonte da verdade) |
| 2 | **Roadmap** | `.aiox/navigator/{project}/roadmap.md` | FALLBACK se INDEX.md não existir |
| 3 | **Snapshots** | `.aiox/navigator/{project}/checkpoints/` | Referência complementar (nunca primário) |

**NOTA:** O roadmap em `.aiox/navigator/` é um artefato de mapeamento inicial (`*map-project`). Ele NÃO é sincronizado com o INDEX.md automaticamente. Se o INDEX.md existe, o roadmap pode estar desatualizado — usar INDEX.md como fonte primária.

### Step 3: Sync Deferred Updates

Se a sessão anterior usou emergency mode (P3 foi pulado), sincronizar agora.

**NOTA:** Apenas P3 (ACTIVE.md) é sincronizado. P2 (snapshot) é permanentemente opcional — se não foi criado no checkpoint, não será retroativo.

```javascript
const activePath = 'docs/projects/ACTIVE.md';
if (!fs.existsSync(activePath)) {
  console.log('ACTIVE.md não encontrado — sync não necessário');
  return; // Skip sync, continue to Step 4
}

// Guard: check for manual edits before overwriting
const activeDiff = execSync(`git diff -- "${activePath}"`).toString();
if (activeDiff.length > 0) {
  console.warn('⚠️ ACTIVE.md has uncommitted manual edits.');
  console.warn('Choose: (1) Keep manual edits, (2) Overwrite with INDEX.md data');
  // ASK user — do NOT overwrite silently
  return;
}

try {
  const indexLastSession = extractField(index, 'Última sessão');
  if (!indexLastSession) {
    console.warn('⚠️ Cannot extract "Última sessão" from INDEX.md — sync skipped');
    return; // Skip sync, continue to Step 4
  }

  const activeRow = getProjectRow(activePath, projectName);
  if (!activeRow) {
    console.warn(`⚠️ Project "${projectName}" not found in ACTIVE.md — sync skipped`);
    return; // Skip sync, continue to Step 4
  }

  if (activeRow.lastSession !== indexLastSession) {
    updateActiveDashboard(activePath, projectName, index);
    console.log('✅ P3 ACTIVE.md sincronizado com INDEX.md');
  } else {
    console.log('P3 ACTIVE.md já está sincronizado');
  }
} catch (error) {
  console.error('❌ Sync deferred failed:', error.message);
  console.warn('Continue sem sync — corrija ACTIVE.md manualmente se necessário');
  // Do NOT block resume — sync failure is non-fatal
}
```

### Step 4: Display Context

Extrair contexto do INDEX.md e apresentar:

```
🧭 Resuming: {project_name}

**Estado Atual:** {from INDEX.md ## Estado Atual}
**Última sessão:** {from INDEX.md **Última sessão:**}
**Próximo passo:** {from INDEX.md **Próximo passo:**}

**Histórico recente:**
{last 3-5 entries from INDEX.md ## Histórico}

**Quick Actions:**
1. Continue — *auto-navigate
2. Review roadmap — *show-roadmap
3. Create checkpoint — *checkpoint
4. Status report — *status-report

What would you like to do? [1-4]
>
```

### Step 5: Execute Action

```javascript
const actions = {
  1: 'auto-navigate',
  2: 'show-roadmap',
  3: 'checkpoint',
  4: 'status-report'
};

const selectedAction = actions[userChoice];
await executeCommand(selectedAction);
```

## Implementation

```javascript
async function resumeProject(projectName) {
  // List projects if not specified
  if (!projectName) {
    const projects = await listProjects();
    projectName = await selectProject(projects);
  }

  // PRIORITY: Load INDEX.md (fonte da verdade)
  const indexPath = `docs/projects/${projectName}/INDEX.md`;
  const index = fs.existsSync(indexPath)
    ? fs.readFileSync(indexPath, 'utf-8')
    : null;

  // Sync deferred updates (emergency mode catch-up)
  if (index) {
    await syncDeferredUpdates(projectName, index);
  }

  // Fallback: roadmap if no INDEX (roadmap may be stale — warn user)
  let roadmap = null;
  if (!index) {
    roadmap = await loadRoadmap(projectName);
    if (roadmap) {
      console.warn('⚠️ Using roadmap as fallback (INDEX.md not found). Roadmap may be outdated.');
      console.warn('   Run *create-project to generate INDEX.md as fonte da verdade.');
    }
  }

  // Display context from INDEX.md (or roadmap fallback)
  displayResumeContext({ index, roadmap, projectName });

  // Offer quick actions
  const action = await promptQuickActions();
  await executeAction(action, projectName);

  return { projectName, index };
}

async function syncDeferredUpdates(projectName, index) {
  // Sync ACTIVE.md if INDEX.md is ahead (emergency mode catch-up)
  // NOTE: Only P3 (ACTIVE.md) is synced. P2 (snapshot) is permanently optional.
  const activePath = 'docs/projects/ACTIVE.md';
  if (!fs.existsSync(activePath)) return;

  // Guard: check for manual edits before overwriting
  try {
    const activeDiff = execSync(`git diff -- "${activePath}"`).toString();
    if (activeDiff.length > 0) {
      console.warn('⚠️ ACTIVE.md has uncommitted manual edits — ask user before syncing');
      return; // Do NOT overwrite silently
    }
  } catch (e) {
    // git diff failed (not a git repo?) — proceed with caution
  }

  try {
    const indexLastSession = extractField(index, 'Última sessão');
    if (!indexLastSession) return; // Cannot extract field — skip

    const activeRow = getProjectRow(activePath, projectName);
    if (!activeRow) return; // Project not in ACTIVE.md — skip

    if (activeRow.lastSession !== indexLastSession) {
      await updateActiveDashboard(activePath, projectName, index);
      console.log('✅ P3 ACTIVE.md sincronizado');
    }
  } catch (error) {
    console.error('❌ Sync deferred failed:', error.message);
    // Non-fatal — resume continues without sync
  }
}
```

## Related

- **Agent:** @navigator (Vega)
- **Task:** nav-where-am-i.md
- **Command:** *auto-navigate
