---
task: Create Client Project (Auto Mode — Dual Mode)
responsavel: "@navigator"
responsavel_type: hybrid
model: haiku
atomic_layer: task
elicit: conditional
execute_first:
  script: "JSON.parse + fs.mkdirSync + template fill"
  output_format: structured
  description: "95% deterministic — JSON parse, schema validation, directory creation, template fill. LLM only for interactive mode elicitation."
Entrada: |
  MODE 1 (Interactive): Apenas o nome do projeto
    - project_name: "nome-do-projeto"

  MODE 2 (Silent): JSON completo
    {
      "name": "nome-do-projeto",
      "desc": "Descrição do projeto",
      "type": "squad" | "app" | "mind-clone" | "pipeline" | "knowledge",
      "status": "em-andamento" | "completo" | "pausado",
      "next_step": "Próximo passo a fazer" (opcional)
    }
Saida: |
  - project_dir: docs/projects/{name}/
  - index_file: docs/projects/{name}/INDEX.md (com recursos dinâmicos)
  - active_updated: docs/projects/ACTIVE.md
Checklist:
  - "[ ] Detect input mode (string vs JSON)"
  - "[ ] If string: ask interactive questions (desc, status, next_step)"
  - "[ ] If JSON: parse all params silently"
  - "[ ] Validate name is kebab-case"
  - "[ ] Scan resources dynamically"
  - "[ ] Create directory structure"
  - "[ ] Generate INDEX.md with dynamic checkboxes"
  - "[ ] Update ACTIVE.md"
veto_conditions:
  - "Project name contains spaces or uppercase → BLOCK"
  - "ACTIVE.md does not exist → BLOCK"
  - "Project already exists → WARN"
---

# *create-project-auto

Create a new client project with **dual input mode**: interactive (just name) OR silent (full JSON).

## Usage

### Mode 1: Interactive (Apenas o Nome) — RECOMENDADO

```bash
@navigator *create-project-auto renan-vieira
```

**O Navigator vai perguntar:**
1. 📝 Descrição do projeto?
2. 📊 Status inicial? (1-3)
3. 🎯 Próximo passo?

**Quando usar:** Modo padrão. Rápido e conversacional.

---

### Mode 2: Silent (JSON Completo) — Automação Total

```bash
@navigator *create-project-auto '{"name":"meu-projeto","desc":"Transcrição de curso","status":"em-andamento","next_step":"Baixar vídeos da Hotmart"}'
```

**Zero perguntas.** Ideal para scripts e automação.

**Quando usar:** Integrações, Stream Deck com valores fixos, batch processing.

## Implementation

### Step 1: Detect Input Mode

Check if user input starts with `{`:

```javascript
const userInput = args[0]; // first argument after command

if (userInput.startsWith('{')) {
  // MODE 2: Silent (JSON)
  return runSilentMode(userInput);
} else {
  // MODE 1: Interactive (just name)
  return runInteractiveMode(userInput);
}
```

---

### Step 1a: Silent Mode — Parse JSON Input

Extract from the JSON string:
- `name` (required) — kebab-case project name
- `desc` (required) — brief description
- `status` (required) — "em-andamento" | "completo" | "pausado"
- `next_step` (optional) — defaults to "A definir"

If JSON is invalid, output error and STOP:

```markdown
❌ JSON inválido

**Formato esperado:**
{
  "name": "nome-do-projeto",
  "desc": "Descrição breve",
  "status": "em-andamento",
  "next_step": "Próximo passo" (opcional)
}

**Status válidos:** "em-andamento", "completo", "pausado"
```

Proceed to **Step 2** (validate name).

---

### Step 1b: Interactive Mode — Ask Questions

User provided only the project name. Ask 3 questions sequentially.

**Validate name first:**
- ✅ Lowercase only
- ✅ Hyphens allowed
- ✅ Numbers allowed
- ❌ No spaces, uppercase, underscores

If invalid:

```markdown
❌ Nome inválido: "{name}"

**Formato correto:** kebab-case (lowercase + hífens)

**Exemplos válidos:**
- ✅ `renan-vieira`
- ✅ `projeto-2026`

**Tente novamente:**
@navigator *create-project-auto {nome-correto}
```

**Question 1: Description**

```
📝 Descreva brevemente este projeto:

Exemplo: "Transcrição de curso da Cademi + criação de VSL"

>
```

Store response as `desc`.

**Question 2: Status**

```
📊 Qual o status inicial deste projeto?

1. 🔄 Em andamento
2. ✅ Completo
3. ⏸️ Pausado

Digite o número (1-3):

>
```

Map response:
- 1 → `{ emoji: '🔄', text: 'Em andamento', key: 'em-andamento' }`
- 2 → `{ emoji: '✅', text: 'Completo', key: 'completo' }`
- 3 → `{ emoji: '⏸️', text: 'Pausado', key: 'pausado' }`

Store as `status`.

**Question 3: Next Step**

```
🏷️ Tipo de projeto?

1. 🎭 Squad (elite minds, expansion pack)
2. 💻 App (aplicação web/mobile)
3. 🧬 Mind Clone (clone de expert)
4. 🔄 Pipeline (transcrição, ETL, processamento)
5. 📚 Knowledge/Platform (base de conhecimento, prospecção)

> 1
```

Map response:
- 1 → `squad`
- 2 → `app`
- 3 → `mind-clone`
- 4 → `pipeline`
- 5 → `knowledge`

Store as `type`.

**Question 4: Next Step**

```
🎯 Qual o próximo passo imediato?

Exemplo: "Baixar vídeos da Hotmart"

> (deixe em branco para "A definir")
```

Store response as `next_step`. If empty, default to `"A definir"`.

Proceed to **Step 2** (validate name).

### Step 2: Map Status to Emoji

```javascript
const statusMap = {
  'em-andamento': { emoji: '🔄', text: 'Em andamento' },
  'completo': { emoji: '✅', text: 'Completo' },
  'pausado': { emoji: '⏸️', text: 'Pausado' }
};
```

### Step 3: Validate

- Confirm name is kebab-case (lowercase, hyphens only, no spaces)
- Check `docs/projects/ACTIVE.md` exists
- Check `docs/projects/{name}/` does NOT exist

If validation fails, output error and STOP.

### Step 4: Create Directory Structure

```bash
mkdir -p docs/projects/{name}/scripts
mkdir -p docs/projects/{name}/logs
mkdir -p docs/projects/{name}/data
mkdir -p docs/projects/{name}/runtime
```

### Step 5: Generate Timestamp

```javascript
const now = new Date();
const date = now.toISOString().split('T')[0];
const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
const last_session_date = `${date} às ${time}`;
```

### Step 6: Scan for Existing Files

Search for related files:
1. Stories: `docs/stories/**/*{name}*.md`
2. Epics: `docs/stories/epics/**/*{name}*.md`
3. Checkpoints: `.aiox/navigator/{name}/checkpoints/*.md`
4. Sessions: `docs/sessions/**/*{name}*.md`

Populate arrays for template:
```javascript
const stories = foundStories.map(s => ({ path: s, description: 'Story encontrada' }));
const epics = foundEpics.map(e => ({ path: e }));
const checkpoint = foundCheckpoints.length > 0 ? { path: foundCheckpoints[0] } : null;
```

### Step 7: Select Relevant Resources

**CRITICAL:** Do NOT list ALL available resources. Select ONLY resources relevant to this project based on the description and next_step.

**Inference rules:**
- If desc mentions "transcrição" / "curso" / "vídeo" → include `media-processor`, `transcript-sculptor`
- If desc mentions "clone" / "mind" / "personalidade" → include `icp-cloning`, `mind-cloning`
- If desc mentions "copy" / "VSL" / "landing" / "email" → include `copywriting-squad`
- If desc mentions "conteúdo" / "post" / "newsletter" → include `content-engine`
- If desc mentions "oferta" / "vendas" / "pricing" → include `hormozi`
- If desc mentions "palestra" / "keynote" → include `palestras-master`
- If desc mentions "tráfego" / "ads" / "campanha" → include `conversao-extrema`
- If desc mentions "livro" / "book" / "PDF" → include skill `book-to-markdown`
- If desc mentions "conhecimento" / "Obsidian" / "base" → include `knowledge-base-builder`
- Always include `navigator` for checkpoint/phase tracking
- If the user explicitly mentioned squads, include those

### Step 7b: Generate Human Checklist

Based on `type`, load the appropriate checklist from `squads/navigator/data/human-checklist-templates.md` and render it. The 5 types map to pre-defined checklists with the correct commands for each project category.

If `type` is not provided (legacy JSON without type), infer from `desc`:
- desc mentions "squad" / "agents" / "minds" → `squad`
- desc mentions "app" / "web" / "mobile" / "dashboard" → `app`
- desc mentions "clone" / "mind" / "personality" → `mind-clone`
- desc mentions "transcrição" / "pipeline" / "ETL" / "batch" → `pipeline`
- desc mentions "knowledge" / "prospecção" / "KB" → `knowledge`
- default → `squad`

### Step 8: Render Template

Use `nav-project-index-tmpl.md` with ONLY relevant resources (not all scanned):

```javascript
const templateData = {
  project_title: desc,
  project_name: name,
  status_emoji: statusMap[status].emoji,
  status_text: statusMap[status].text,
  last_session_date: last_session_date,
  next_step: next_step || 'A definir',
  current_state: 'Projeto criado automaticamente via Navigator',
  stories: stories,
  checkpoint: checkpoint,
  scripts: [],
  project_tasks: null, // populated in Step 8b
  // ONLY relevant resources (filtered, NOT all scanned)
  squads: relevantSquads,
  tools: relevantTools,
  skills: relevantSkills
};
```

Write to `docs/projects/{name}/INDEX.md`.

### Step 8b: Populate Project-Specific Tasks

Based on the project `desc` and `next_step`, infer 3-8 concrete tasks and map each to the ideal squad/skill/tool. Fill in the "Próximas Tarefas" table in the INDEX.md.

### Step 9: Update ACTIVE.md

Add new row to table:

```markdown
| {capitalize(name)} | {emoji} {text} | {timestamp} | {next_step} | [→ INDEX]({name}/INDEX.md) |
```

Update "Última atualização" at top with current timestamp.

### Step 10: Output Success

```markdown
✅ Projeto criado com sucesso!

**Projeto:** {capitalize(name)}
**Status:** {emoji} {text}
**Diretório:** docs/projects/{name}/

📂 Estrutura criada:
  docs/projects/{name}/
  ├── INDEX.md          ← Ponto de entrada
  ├── scripts/
  ├── logs/             (gitignored)
  ├── data/
  └── runtime/

📄 ACTIVE.md atualizado com nova linha.

🔗 Link rápido: docs/projects/{name}/INDEX.md

💡 Para retomar: Cole o INDEX.md no Claude
```

## Examples

### Example 1: Interactive Mode (RECOMENDADO para Stream Deck)

```bash
@navigator *create-project-auto renan-vieira
```

**Navigator pergunta:**

```
📝 Descreva brevemente este projeto:
> Transcrição de curso Renan Vieira da Cademi

📊 Qual o status inicial? (1-3)
> 1

🎯 Qual o próximo passo?
> Baixar vídeos da Cademi
```

**Resultado:**
- ✅ `docs/projects/renan-vieira/INDEX.md` criado
- ✅ 35 squads + 8 tools + 28 skills listados (dinâmico)
- ✅ ACTIVE.md atualizado
- ✅ Timestamp: `2026-03-03 às 22:45`

---

### Example 2: Interactive Mode — Copywriting

```bash
@navigator *create-project-auto conversao-extrema
```

**Navigator pergunta:**

```
📝 Descreva brevemente este projeto:
> Landing pages e VSLs para lançamento

📊 Qual o status inicial? (1-3)
> 1

🎯 Qual o próximo passo?
> Escrever primeira VSL
```

---

### Example 3: Silent Mode (JSON Completo)

Para scripts ou automação total:

```bash
@navigator *create-project-auto '{"name":"italo-marsili","desc":"Mind clone Italo Marsili","type":"mind-clone","status":"completo","next_step":"Testar bot no WhatsApp"}'
```

**Zero perguntas.** Tudo criado instantaneamente.

---

### Example 4: Silent Mode — Batch Processing

```bash
# Script que cria múltiplos projetos de uma vez
for project in "cliente-a" "cliente-b" "cliente-c"; do
  @navigator *create-project-auto "{\"name\":\"$project\",\"desc\":\"Projeto $project\",\"status\":\"em-andamento\"}"
done
```

## Error Handling

If any step fails, output clear error:

```markdown
❌ Erro ao criar projeto

**Motivo:** {error_reason}

**Sugestão:** {suggestion}
```

Common errors:
- Invalid JSON → "JSON inválido. Use aspas duplas e escape correto."
- Name not kebab-case → "Nome deve ser kebab-case (lowercase, hyphens). Ex: meu-projeto"
- Project exists → "Projeto já existe em docs/projects/{name}/. Use *update-project ou escolha outro nome."
- ACTIVE.md missing → "docs/projects/ACTIVE.md não encontrado. Crie primeiro."

## Related

- **Original interactive:** `*create-project` (old version with separate modes)
- **Template:** `nav-project-index-tmpl.md` (dynamic checkboxes)
- **Scanner:** `resource-scanner.js` (dynamic resource discovery)
- **Dashboard:** `docs/projects/ACTIVE.md`
