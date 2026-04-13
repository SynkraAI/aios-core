---
task: Create Checkpoint
responsavel: "@navigator"
responsavel_type: agent
atomic_layer: task
elicit: false
Entrada: |
  - checkpoint_type: auto|manual|fast
  - phase_id: Current phase ID
Saida: |
  - checkpoint_file: .aiox/navigator/[project]/checkpoints/[date]-phase-[id].md (skipped in emergency)
  - index_updated: true|false (whether docs/projects/{project}/INDEX.md was updated)
  - active_updated: true|false (skipped in emergency mode)
Checklist:
  - "[ ] Get current phase and status"
  - "[ ] Collect completed stories"
  - "[ ] Collect modified files (git log)"
  - "[ ] Generate checkpoint from template"
  - "[ ] Save to checkpoints/"
  - "[ ] Update roadmap with checkpoint reference"
  - "[ ] Update docs/projects/{project}/INDEX.md (if exists)"
  - "[ ] Update docs/projects/ACTIVE.md (if exists)"
veto_conditions:
  - "No roadmap exists for current project → BLOCK (run *map-project first)"
  - "No git repository detected → BLOCK (git init required for commit SHA tracking)"
  - "No .aiox/navigator/{project}/ directory → BLOCK (project not mapped yet)"
  - "INDEX.md exists but '## Estado Atual' or '## Histórico' section missing → BLOCK (restore from backup or recreate)"
  - "Cannot detect project from context AND no project_name provided → BLOCK (provide project name explicitly)"
  - "Multiple projects modified in git log → ASK user which project to checkpoint"
  - "Write/edit target outside whitelist (INDEX.md, .aiox/checkpoints/, ACTIVE.md) → BLOCK (only 3 paths allowed)"
---

# *checkpoint

Create checkpoint snapshot of current project state.

## Priority Architecture

```
PRIORITY 1 → docs/projects/{project}/INDEX.md    (FONTE DA VERDADE — living checkpoint)
PRIORITY 2 → .aiox/navigator/{project}/checkpoints/  (snapshot imutável para restore)
PRIORITY 3 → docs/projects/ACTIVE.md              (dashboard row — resumo)
```

**Regra fundamental:** O INDEX.md É o checkpoint. Ele deve conter o estado completo e atualizado
do projeto a qualquer momento. O arquivo em `.aiox/navigator/checkpoints/` é um snapshot imutável
que serve apenas para restore — ele NÃO substitui o INDEX.md como fonte da verdade.

**Na prática:**
- Se só dá tempo de atualizar UM arquivo → atualiza o INDEX.md
- O snapshot em `.aiox/` é opcional (nice-to-have para histórico)
- O ACTIVE.md é atualizado por último (row de dashboard)

## Allowed Write Targets (WHITELIST)

O checkpoint SÓ pode escrever/editar nestes 3 paths. Qualquer escrita fora deles é **VETO automático**.

| # | Path Pattern | Operação | Obrigatório |
|---|-------------|----------|-------------|
| P1 | `docs/projects/{project}/INDEX.md` | Edit (seções específicas) | SIM |
| P2 | `.aiox/navigator/{project}/checkpoints/{date}-{slug}.md` | Write (novo arquivo) | NÃO |
| P3 | `docs/projects/ACTIVE.md` | Edit (row do projeto) | NÃO |

**VETO:** Checkpoint tenta criar/editar arquivo fora desta whitelist → BLOCK imediato.

**Exemplos de paths PROIBIDOS:**
- `docs/sessions/` — sessões são artefatos separados, não checkpoints
- `docs/stories/` — stories têm lifecycle próprio
- `.aiox-core/` — framework core, nunca modificado por checkpoint
- Qualquer outro `.md` que não seja INDEX.md ou ACTIVE.md

## Emergency Mode

**Ativação** — APENAS nestas condições objetivas:
1. Checkpoint já foi feito antes nesta sessão (2º+ checkpoint)
2. Usuário pede explicitamente (`*checkpoint --fast` ou `*checkpoint rápido`)

**Comportamento no Emergency Mode:**
- **APENAS** Step 1 (coleta mínima — sem git commands) + Step 3 (INDEX.md)
- **PULA** Step 2 (generate), Step 4 (snapshot) e Step 5 (ACTIVE.md)
- Output reduzido: só confirma INDEX atualizado

```
📍 Checkpoint (emergency)
Projeto: {name}
P1 INDEX ✅ | P2 ⏭️ | P3 ⏭️
⚠️ P2/P3 serão sincronizados no próximo *resume-project
```

**Coleta mínima em emergency:**
- NÃO roda `git log` nem `git diff` — usa apenas contexto da conversa
- Timestamp + resumo 1 frase + próximo passo

**Regra:** APENAS P3 (ACTIVE.md) será sincronizado no próximo `*resume-project`. P2 (snapshot) é permanentemente opcional — se não foi criado, não será retroativo.

## Usage

```bash
@navigator
*checkpoint

# Emergency mode (explicit)
*checkpoint --fast

# Auto-checkpoint (from hooks)
*checkpoint --auto
```

## Workflow

### Step 1: Collect State

```javascript
const state = {
  phase: await detectPhase(),
  completedStories: await getCompletedStories(),
  modifiedFiles: await getModifiedFiles(),
  gitLog: await getRecentCommits(10)
};
```

### Step 2: Generate Checkpoint

Use template `nav-checkpoint-tmpl.md`:

```javascript
const checkpoint = renderTemplate('nav-checkpoint-tmpl.md', {
  checkpoint_date: new Date().toISOString(),
  checkpoint_type: 'manual',
  phase_id: state.phase.id,
  phase_name: state.phase.name,
  completed_stories: state.completedStories,
  modified_files: state.modifiedFiles
});
```

### Step 3: Update Project INDEX.md (PRIORITY 1 — OBRIGATÓRIO)

**Este é o passo mais importante.** O INDEX.md é a fonte da verdade do projeto.

**Atomic write pattern:** Antes de escrever, criar backup. Se falhar, rollback.

```javascript
const indexPath = `docs/projects/${projectName}/INDEX.md`;
const bakPath = `${indexPath}.bak`;

if (fs.existsSync(indexPath)) {
  // Backup before write
  fs.copyFileSync(indexPath, bakPath);

  const index = fs.readFileSync(indexPath, 'utf-8');
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const sessionTimestamp = `${today} às ${time}`;

  // Update "Última sessão" date with time
  const updatedIndex = index
    .replace(/\*\*Última sessão:\*\* .+/, `**Última sessão:** ${sessionTimestamp}`)
    // Update "Estado Atual" section with current phase info
    // Update "Próximo Passo" section with next action
    // Append to "Histórico" section
    ;

  // Read current state to update sections
  const estadoAtual = generateEstadoAtual(state);
  const proximoPasso = generateProximoPasso(state);
  const historicoEntry = `- ${today}: ${generateHistoricoLine(state)}`;

  // Replace sections in INDEX.md
  const finalIndex = updateMarkdownSection(updatedIndex, 'Estado Atual', estadoAtual);
  const finalIndex2 = updateMarkdownSection(finalIndex, 'Próximo Passo', proximoPasso);
  const finalIndex3 = appendToSection(finalIndex2, 'Histórico', historicoEntry);

  // Update checkpoint reference
  const finalIndex4 = updateCheckpointReference(finalIndex3, checkpointPath);

  try {
    fs.writeFileSync(indexPath, finalIndex4);
    fs.unlinkSync(bakPath); // Success — remove backup
  } catch (error) {
    fs.copyFileSync(bakPath, indexPath); // Failure — rollback
    fs.unlinkSync(bakPath);
    throw new Error(`Checkpoint failed, INDEX.md restored: ${error.message}`);
  }
}
```

**What gets updated in INDEX.md:**
- `**Última sessão:**` → today's date
- `## Estado Atual` → current phase statuses (✅/🔄/⏳ based on completion)
- `## Próximo Passo` → next action based on current phase
- `### Último Checkpoint` → path to the checkpoint just created
- `## Histórico` → new entry appended with today's summary (max 20 entries — remove oldest if exceeded)

**History limit:** Manter máximo **20 entradas** no `## Histórico`. Se ultrapassar, remover as mais antigas (topo da lista). O INDEX.md não é arquivo de log — para histórico completo, consultar `git log`.

**What is NOT touched:**
- `## Arquivos Relevantes` — only updated by *create-project or manually
- `## Números` — only updated manually
- `## Problemas Conhecidos` — only updated manually

### Step 4: Save Snapshot (PRIORITY 2 — opcional)

Salvar snapshot imutável para restore. Este arquivo é complementar ao INDEX.md.

```javascript
const filename = `${dateString}-${slugify(sessionSummary)}.md`;
const checkpointPath = `.aiox/navigator/${projectName}/checkpoints/${filename}`;
fs.writeFileSync(checkpointPath, checkpoint);
```

**NOTA:** Se o contexto estiver limitado, este step pode ser PULADO. O INDEX.md já contém toda a informação necessária.

### Step 5: Update ACTIVE.md Dashboard (PRIORITY 3)

If `docs/projects/ACTIVE.md` exists, update the project's row in the table:

```javascript
const activePath = 'docs/projects/ACTIVE.md';
if (fs.existsSync(activePath)) {
  const active = fs.readFileSync(activePath, 'utf-8');
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const sessionTimestamp = `${today} às ${time}`;

  // Find the row for this project and update it
  const projectRow = findTableRow(active, projectName);
  if (projectRow) {
    const updatedRow = buildTableRow({
      name: projectDisplayName,
      status: state.phase.status,      // 🔄/✅/⏸️
      lastSession: sessionTimestamp,   // Date with time
      nextStep: generateProximoPasso(state),
      indexLink: `[→ INDEX](${projectName}/INDEX.md)`
    });
    const updatedActive = active
      .replace(projectRow, updatedRow)
      .replace(/> Última atualização: .+/, `> Última atualização: ${sessionTimestamp}`);
    fs.writeFileSync(activePath, updatedActive);
  }
}
```

**What gets updated in ACTIVE.md:**
- Project row: status, última sessão, próximo passo
- Header: `> Última atualização:` date

## Output

```
📍 Checkpoint criado!

**Tipo:** Manual
**Fase:** 3 — Arquitetura
**Status:** 67% completo
**Stories concluídas:** 8
**Files modificados:** 23

**Atualizado:**
  P1 INDEX: docs/projects/ecommerce-order-mgmt/INDEX.md ✅ (fonte da verdade)
  P2 Snapshot: .aiox/navigator/ecommerce-order-mgmt/checkpoints/2026-02-15-phase-3.md ✅
  P3 ACTIVE: docs/projects/ACTIVE.md ✅

Para restaurar:
@navigator
*resume-project ecommerce-order-mgmt
```

## Implementation

```javascript
const { checkpointManager } = require('./scripts/navigator/checkpoint-manager');

async function createCheckpoint(type = 'manual') {
  // 1. Collect state
  const state = await collectCurrentState();

  // 2. Generate checkpoint content
  const checkpoint = await checkpointManager.create({
    type,
    phase: state.phase,
    stories: state.completedStories,
    files: state.modifiedFiles,
    template: 'nav-checkpoint-tmpl.md'
  });

  // === PRIORITY 1: INDEX.md (OBRIGATÓRIO — fonte da verdade) ===
  const indexPath = `docs/projects/${projectName}/INDEX.md`;
  let indexUpdated = false;
  if (fs.existsSync(indexPath)) {
    await updateProjectIndex(indexPath, state, checkpoint.path);
    indexUpdated = true;
  }

  // === PRIORITY 2: Snapshot imutável (opcional — para restore) ===
  const path = await checkpointManager.save(checkpoint);

  // === PRIORITY 3: ACTIVE.md dashboard (resumo) ===
  const activePath = 'docs/projects/ACTIVE.md';
  let activeUpdated = false;
  if (fs.existsSync(activePath)) {
    await updateActiveDashboard(activePath, projectName, state);
    activeUpdated = true;
  }

  return {
    checkpointId: checkpoint.id,
    path,
    indexUpdated,
    activeUpdated
  };
}
```

## Related

- **Agent:** @navigator (Vega)
- **Template:** nav-checkpoint-tmpl.md
- **Script:** checkpoint-manager.js
