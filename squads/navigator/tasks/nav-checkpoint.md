---
task: Create Checkpoint
responsavel: "@navigator"
responsavel_type: hybrid
model: haiku
atomic_layer: task
elicit: false
Entrada: |
  - checkpoint_type: auto|manual|fast
Saida: |
  - index_updated: true|false
  - active_updated: true|false (skipped in emergency mode)
  - snapshot_path: path to .aiox/navigator/ snapshot (skipped in emergency mode)
Checklist:
  - "[ ] Detect active project from conversation context"
  - "[ ] Collect state (git log, modified files)"
  - "[ ] Summarize session (1-2 sentences)"
  - "[ ] Update INDEX.md (PRIORITY 1)"
  - "[ ] Save snapshot (PRIORITY 2 — optional)"
  - "[ ] Update ACTIVE.md (PRIORITY 3)"
veto_conditions:
  - "No project INDEX.md found at docs/projects/{name}/INDEX.md → BLOCK (run *create-project first)"
  - "INDEX.md exists but '## Estado Atual' or '## Histórico' section missing → BLOCK (restore from backup or recreate)"
  - "Cannot detect project from context AND no project_name provided → BLOCK (provide project name explicitly)"
  - "Multiple projects modified in git log → ASK user which project to checkpoint"
  - "Write/edit target outside whitelist (INDEX.md, .aiox/checkpoints/, ACTIVE.md) → BLOCK (only 3 paths allowed)"
---

# *checkpoint

Create checkpoint of current project state.

## Priority Architecture

```
PRIORITY 1 → docs/projects/{project}/INDEX.md    (FONTE DA VERDADE — living checkpoint)
PRIORITY 2 → .aiox/navigator/{project}/checkpoints/  (snapshot imutável — OPCIONAL)
PRIORITY 3 → docs/projects/ACTIVE.md              (dashboard row — resumo)
```

**Regra:** O INDEX.md É o checkpoint. Se só dá tempo de atualizar UM arquivo → atualiza o INDEX.md.

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

**Coleta mínima (Step 1 em emergency):**
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

### Step 1: Detect Project and Collect State

Identify the active project from conversation context (which project was being discussed/worked on).

**Veto:** Não consegue detectar projeto E nenhum project_name fornecido → BLOCK (fornecer nome explicitamente).
**Veto:** Múltiplos projetos modificados no git → ASK usuário qual projeto fazer checkpoint.

Collect:
- `git log --oneline -10` — recent commits
- `git diff --stat` — modified files
- Conversation history — what squads/skills/tools were used

Write a **1-2 sentence summary** of what was accomplished this session.

### Step 2: Generate Checkpoint Content

Use template `nav-checkpoint-tmpl.md` para gerar conteúdo do checkpoint:

```javascript
const checkpoint = renderTemplate('nav-checkpoint-tmpl.md', {
  checkpoint_date: new Date().toISOString(),
  checkpoint_type: type, // manual|auto|fast
  session_summary: summary,
  modified_files: state.modifiedFiles
});
```

### Step 3: Update INDEX.md (PRIORITY 1 — OBRIGATÓRIO)

**Atomic write pattern:** Antes de escrever, criar backup. Se falhar, rollback.

```javascript
const indexPath = `docs/projects/${projectName}/INDEX.md`;
const bakPath = `${indexPath}.bak`;

// 1. Backup before write
fs.copyFileSync(indexPath, bakPath);

try {
  // 2. Apply updates (see sections below)
  const updatedContent = applyCheckpointUpdates(indexPath, state);
  fs.writeFileSync(indexPath, updatedContent);

  // 3. Success — remove backup
  fs.unlinkSync(bakPath);
} catch (error) {
  // 4. Failure — rollback from backup
  fs.copyFileSync(bakPath, indexPath);
  fs.unlinkSync(bakPath);
  throw new Error(`Checkpoint failed, INDEX.md restored: ${error.message}`);
}
```

Generate timestamp:

```javascript
const now = new Date();
const today = now.toISOString().split('T')[0];
const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
const sessionTimestamp = `${today} às ${time}`;
```

**Sections to update:**

| Section | What to update |
|---------|----------------|
| `**Última sessão:**` | `{sessionTimestamp}` |
| `## Estado Atual` | Update description + checklist items (✅/🔄/⏳) |
| `**Próximo passo:**` | Next action based on current state |
| `## Recursos do Projeto` | Add any NEW squads/skills/tools used (if not already listed) |
| `## Próximas Tarefas` | Update task rows (mark done, add new) |
| `## Arquivos Relevantes` | Add new checkpoint path (if snapshot was saved) |
| `## Histórico` | Append single-line entry |

**History entry format — ALWAYS single line:**

```markdown
- YYYY-MM-DD às HH:MM: {concise summary}
```

Good examples:
```markdown
- 2026-03-03 às 20:30: Squad completo (12 agents, workflow, checklist, README)
- 2026-03-03 às 14:15: Transcrição módulos 1-3 concluída (36 vídeos)
```

**NEVER** use multi-line history entries with nested bullets.

**History limit:** Manter máximo **20 entradas** no `## Histórico`. Se ultrapassar, remover as mais antigas (topo da lista). O INDEX.md não é arquivo de log — para histórico completo, consultar `git log`.

**What is NOT touched by checkpoint:**
- `## Arquivos Relevantes` — only updated by *create-project or manually
- `## Números` — only updated manually
- `## Problemas Conhecidos` — only updated manually

### Step 4: Save Snapshot (PRIORITY 2 — OPCIONAL)

Only if context window allows. Lightweight markdown (~30 lines max):

```markdown
# Checkpoint: {project_name}

**Data:** {timestamp}
**Resumo:** {1-2 sentence summary}
**Git SHA:** {latest commit}

## Arquivos Modificados
- file1.md
- file2.js

## Recursos Usados
- squad-name (o que fez)

## Próximo Passo
{next action}
```

Save to: `.aiox/navigator/{project}/checkpoints/{date}-{slug}.md`

### Step 5: Update ACTIVE.md (PRIORITY 3)

If `docs/projects/ACTIVE.md` exists:
- Update project row (status, última sessão, próximo passo)
- Update header timestamp

```javascript
const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
```

## Output

```
📍 Checkpoint criado!

Projeto: {name}
Sessão: {summary}

P1 INDEX ✅ | P2 Snapshot ✅/⏭️ | P3 ACTIVE ✅
```

## Related

- **Agent:** @navigator (Vega)
- **Template:** nav-checkpoint-tmpl.md
