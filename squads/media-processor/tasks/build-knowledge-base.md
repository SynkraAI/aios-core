# Task: Build Knowledge Base

## Metadata
- **Task ID:** TASK-MP-004
- **Version:** 1.0.0
- **Status:** Active
- **Created:** 2026-02-23
- **Last Updated:** 2026-02-23
- **Owner:** @media-processor-coordinator
- **Executor Type:** Delegation (to knowledge-base-builder squad)
- **Estimated Duration:** 20-90min (varies by content volume)
- **Complexity:** HIGH
- **Execution Mode:** BATCH (runs ONCE per session, after ALL items complete sculpt phase)
- **Optional:** YES (can be skipped with --no-kb flag)

---

## Purpose

Delegar a construção de knowledge base estruturada para o squad especializado knowledge-base-builder, que ingere múltiplos masterpieces, extrai conceitos, desenha taxonomia, cria links semânticos e valida qualidade para produzir um grafo de conhecimento navegável.

**Por que esta task existe:**
- Masterpieces individuais contêm conhecimento isolado
- Knowledge-base-builder consolida múltiplas fontes em grafo unificado
- Separação de responsabilidades: media-processor foca em pipeline, KB builder foca em knowledge engineering

**Delegation justificativa:**
- Knowledge-base-builder é squad autônomo com expertise em knowledge graphs, ontologies, taxonomies
- Workflow interno complexo (parse → extract → design taxonomy → link → validate)
- Reutilizável para outros squads (mind-cloning, icp-cloning usam para knowledge bases de personas)

**BATCH EXECUTION porque:**
- KB building requer visão holística de TODOS os masterpieces
- Análise cross-document para detectar conceitos redundantes
- Taxonomia unificada para múltiplas fontes
- Linking semântico entre conceitos de diferentes documentos

**OPCIONAL porque:**
- Nem todo uso precisa de knowledge base (e.g., conteúdo one-off, quick transcriptions)
- Processo adiciona 20-90min ao pipeline
- User pode preferir apenas masterpieces individuais sem consolidação

---

## Inputs

| Input | Type | Source | Required | Validation |
|-------|------|--------|----------|------------|
| `materials_dir` | Directory path | Session course directory (hierarchical) | YES | Directory exists, contains lesson folders with masterpieces |
| `output_dir` | Directory path | `{session_dir}/knowledge-base/` | YES | Writable directory |
| `kb_name` | String | User-provided or auto-generated | NO | Valid filename-safe string |
| `taxonomy_mode` | String | Config or default | NO | One of: auto, manual, hybrid |
| `link_threshold` | Float | Config or default | NO | 0.0-1.0 (semantic similarity threshold) |

**Default Values:**
- `kb_name`: auto-generated from session name (e.g., "renner-silva-kb")
- `taxonomy_mode`: auto (let KB builder design taxonomy)
- `link_threshold`: 0.7 (70% similarity for auto-linking)

---

## Preconditions

### System Requirements
- [x] knowledge-base-builder squad instalado em `squads/knowledge-base-builder/`
- [x] Squad commands sincronizados em `.claude/commands/knowledge-base-builder/`
- [x] Slash command `/knowledge-base-builder:ingest` disponível

### Input Validation
- [x] `materials_dir` existe e é legível
- [x] Diretório contém pelo menos 1 masterpiece.md (ou knowledge-fragments.json se distill rodou)
- [x] `output_dir` existe ou pode ser criado
- [x] Espaço em disco suficiente (estimativa: 3x tamanho dos inputs)

### Dependencies
- [x] PREVIOUS: `sculpt-transcript.md` completado para TODOS os itens no batch
- [x] OPTIONAL: `distill-content.md` completado (se knowledge-fragments.json disponíveis)
- [x] BATCH READY: Todos os itens do batch completaram a fase de sculpt

### Batch Readiness Check
```bash
# Verificar se todos os itens completaram sculpt phase
TOTAL_ITEMS=$(jq -r '.items | length' "{session_dir}/session-state.json")
SCULPT_COMPLETE=$(jq -r '[.items[] | select(.sculpt_phase.status == "completed")] | length' \
  "{session_dir}/session-state.json")

if [ "$SCULPT_COMPLETE" -ne "$TOTAL_ITEMS" ]; then
  echo "Batch not ready: $SCULPT_COMPLETE/$TOTAL_ITEMS items sculpted"
  echo "Waiting for remaining items to complete sculpt phase..."
  exit 1  # Block execution until all items ready
fi
```

---

## Execution Steps

### Step 0: Check if KB Building is Enabled
```bash
# Check for --no-kb flag in session state
NO_KB=$(jq -r '.pipeline_config.no_kb // false' "{session_dir}/session-state.json")

if [ "$NO_KB" = "true" ]; then
  echo "Knowledge base building skipped per --no-kb flag"
  # Update session state
  jq '.kb_phase.status = "skipped"' "{session_dir}/session-state.json" \
    > "{session_dir}/session-state.tmp.json"
  mv "{session_dir}/session-state.tmp.json" "{session_dir}/session-state.json"
  exit 0  # Success — task completed (by skipping)
fi
```

### Step 1: Collect Materials (Recursive Scan of Course Hierarchy)
```bash
# Scan course hierarchy recursively for materials in lesson folders
# Materials are now INSIDE the lesson folders (Lesson Folder = Unidade Atômica)
MASTERPIECE_COUNT=$(find "{materials_dir}" -name "masterpiece.md" 2>/dev/null | wc -l)
FRAGMENT_COUNT=$(find "{materials_dir}" -path "*/distilled/knowledge-fragments.json" 2>/dev/null | wc -l)

echo "Materials found: $MASTERPIECE_COUNT masterpieces, $FRAGMENT_COUNT fragment files"

# Validate we have SOMETHING to process
TOTAL_MATERIALS=$((MASTERPIECE_COUNT + FRAGMENT_COUNT))
test "$TOTAL_MATERIALS" -gt 0 || {
  echo "ERROR: No materials found in {materials_dir}"
  echo "Expected masterpiece.md in lesson folders or distilled/knowledge-fragments.json"
  exit 1
}

# Create manifest of materials with their lesson paths
find "{materials_dir}" -name "masterpiece.md" -o -path "*/distilled/knowledge-fragments.json" \
  > "{output_dir}/materials-manifest.txt"

echo "Collected $TOTAL_MATERIALS materials for KB ingestion (from course hierarchy)"
```

**Note:** Materials are now scattered across lesson folders in the course hierarchy, not in a flat `sculpt/` directory. The `find` command handles this automatically.

### Step 2: Prepare KB Configuration
```bash
# Create KB config file for knowledge-base-builder
cat > "{output_dir}/kb-config.yaml" <<EOF
kb_name: {kb_name}
taxonomy_mode: {taxonomy_mode}
link_threshold: {link_threshold}
materials:
  masterpieces: $MASTERPIECE_COUNT
  fragments: $FRAGMENT_COUNT
output_format: obsidian  # Markdown-based knowledge graph
enable_backlinks: true
enable_tags: true
enable_graph_view: true
EOF

echo "KB configuration prepared: {output_dir}/kb-config.yaml"
```

### Step 3: Invoke Knowledge-Base-Builder Squad
```bash
# Activate squad via slash command
# This is a DELEGATION — the KB builder squad takes over
/knowledge-base-builder:ingest "{materials_dir}" "{output_dir}" --config "{output_dir}/kb-config.yaml"
```

**What happens inside knowledge-base-builder:**
1. **kb-architect** orchestrates workflow
2. **document-parser** parses all masterpieces/fragments
3. **concept-extractor** extracts concepts, entities, relationships
4. **taxonomy-designer** designs hierarchical taxonomy
5. **knowledge-linker** creates semantic links between concepts
6. **graph-builder** constructs knowledge graph
7. **quality-validator** validates graph integrity
8. **export-manager** exports to Obsidian format (or other)

**Expected outputs from KB builder:**
- `knowledge-graph.json` — full graph structure
- `concepts/` — individual concept notes (Markdown)
- `taxonomy.yaml` — hierarchical taxonomy
- `index.md` — knowledge base index/MOC
- `stats.json` — KB metrics (concept count, link count, etc.)
- `kb-report.json` — quality validation results

### Step 4: Validate KB Builder Output
```bash
# Check required outputs exist
test -f "{output_dir}/knowledge-graph.json" || { echo "KB builder failed: graph missing"; exit 1; }
test -d "{output_dir}/concepts" || { echo "KB builder failed: concepts directory missing"; exit 1; }
test -f "{output_dir}/taxonomy.yaml" || { echo "KB builder failed: taxonomy missing"; exit 1; }
test -f "{output_dir}/index.md" || { echo "KB builder failed: index missing"; exit 1; }
test -f "{output_dir}/stats.json" || { echo "KB builder failed: stats missing"; exit 1; }
test -f "{output_dir}/kb-report.json" || { echo "KB builder failed: report missing"; exit 1; }

# Validate concept count
CONCEPT_COUNT=$(jq -r '.concept_count' "{output_dir}/stats.json")
test "$CONCEPT_COUNT" -gt 0 || { echo "No concepts extracted"; exit 1; }

# Validate link count
LINK_COUNT=$(jq -r '.link_count' "{output_dir}/stats.json")
# Note: links can be 0 for single-document KB

# Check quality score
QUALITY_SCORE=$(jq -r '.quality_score' "{output_dir}/kb-report.json")
test "$QUALITY_SCORE" != "null" || { echo "Invalid KB report"; exit 1; }

# Log completion
echo "KB building complete: $CONCEPT_COUNT concepts, $LINK_COUNT links, quality: $QUALITY_SCORE"
```

### Step 5: Create Knowledge Base Index
```bash
# Generate quick-access symlink
ln -sf "{output_dir}/index.md" "{session_dir}/KNOWLEDGE-BASE.md"

# Update session state with KB stats
jq ".kb_phase = {
  \"status\": \"completed\",
  \"concept_count\": $CONCEPT_COUNT,
  \"link_count\": $LINK_COUNT,
  \"quality_score\": $QUALITY_SCORE,
  \"kb_location\": \"{output_dir}\"
}" "{session_dir}/session-state.json" > "{session_dir}/session-state.tmp.json"
mv "{session_dir}/session-state.tmp.json" "{session_dir}/session-state.json"

echo "Knowledge base index: {session_dir}/KNOWLEDGE-BASE.md"
```

### Step 6: Quality Gate Check (QG-005)
```bash
# Automated checks
CONCEPT_THRESHOLD=10  # Minimum concepts expected for meaningful KB

# Extract concept count
CONCEPT_COUNT=$(jq -r '.concept_count' "{output_dir}/stats.json")

# Compare with threshold
if [ "$CONCEPT_COUNT" -lt "$CONCEPT_THRESHOLD" ]; then
  echo "WARNING: Concept count $CONCEPT_COUNT below threshold $CONCEPT_THRESHOLD"
  echo "KB may lack depth — consider adding more materials"
  # DO NOT FAIL — log warning and proceed
fi

# Check graph integrity
ORPHAN_COUNT=$(jq -r '.orphan_nodes // 0' "{output_dir}/kb-report.json")
if [ "$ORPHAN_COUNT" -gt 0 ]; then
  echo "WARNING: $ORPHAN_COUNT orphan concepts (no links)"
  echo "Consider reviewing taxonomy or lowering link_threshold"
fi

# Log gate result
echo "QG-005 Knowledge Base Quality: PASS (concepts: $CONCEPT_COUNT, orphans: $ORPHAN_COUNT, quality: $QUALITY_SCORE)"
```

---

## Outputs

| Output | Type | Location | Description |
|--------|------|----------|-------------|
| `knowledge-graph.json` | JSON | `{output_dir}/` | Full graph structure (PRIMARY) |
| `concepts/` | Directory | `{output_dir}/` | Individual concept notes (Markdown) |
| `taxonomy.yaml` | YAML | `{output_dir}/` | Hierarchical taxonomy |
| `index.md` | Markdown | `{output_dir}/` | Knowledge base MOC (Map of Content) |
| `stats.json` | JSON | `{output_dir}/` | KB metrics |
| `kb-report.json` | JSON | `{output_dir}/` | Quality validation results |
| `KNOWLEDGE-BASE.md` | Symlink | `{session_dir}/` | Quick access to index |

**Output Structure (Obsidian Format):**
```
{output_dir}/
├── knowledge-graph.json            # PRIMARY OUTPUT (graph structure)
├── taxonomy.yaml                   # Hierarchical taxonomy
├── index.md                        # Knowledge base MOC
├── concepts/
│   ├── concept-001-framework-x.md
│   ├── concept-002-mental-model-y.md
│   └── ...
├── stats.json                      # Metrics
└── kb-report.json                  # Quality validation

Symlink in session root:
{session_dir}/KNOWLEDGE-BASE.md → {output_dir}/index.md
```

**Concept Note Structure (Markdown):**
```markdown
---
type: concept
tags: [framework, mental-model]
related: [[concept-002]], [[concept-015]]
source: renner-001/masterpiece.md
---

# Concept Name

## Definition
...

## Context
...

## Applications
...

## Related Concepts
- [[concept-002]]
- [[concept-015]]
```

---

## Validation Rules

### Quality Gate QG-005: Knowledge Base Quality

**Automated Checks:**
```bash
# 1. All required files exist
test -f "{output_dir}/knowledge-graph.json"
test -d "{output_dir}/concepts"
test -f "{output_dir}/taxonomy.yaml"
test -f "{output_dir}/index.md"
test -f "{output_dir}/stats.json"
test -f "{output_dir}/kb-report.json"

# 2. Concepts are non-empty
CONCEPT_COUNT=$(jq -r '.concept_count' "{output_dir}/stats.json")
test "$CONCEPT_COUNT" -gt 0

# 3. Taxonomy is valid
TAXONOMY_DEPTH=$(yq eval '.taxonomy | length' "{output_dir}/taxonomy.yaml")
test "$TAXONOMY_DEPTH" -gt 0

# 4. KB report is valid
QUALITY_SCORE=$(jq -r '.quality_score' "{output_dir}/kb-report.json")
test "$QUALITY_SCORE" != "null"
```

**KB Report Structure (Expected):**
```json
{
  "quality_score": 8.2,
  "concept_count": 45,
  "link_count": 128,
  "orphan_nodes": 3,
  "taxonomy_depth": 4,
  "checks": [
    { "name": "graph_integrity", "status": "pass" },
    { "name": "taxonomy_coverage", "status": "pass" },
    { "name": "link_quality", "status": "pass" },
    { "name": "concept_clarity", "status": "pass" },
    { "name": "redundancy_check", "status": "pass" }
  ],
  "issues": [],
  "recommendations": []
}
```

**Thresholds:**
- Concept count > 10 (RECOMMENDED, not blocking)
- Orphan nodes < 10% of total (RECOMMENDED)
- Quality score > 7.0 (RECOMMENDED)

---

## Quality Threshold

**Pass Criteria:**
- knowledge-graph.json exists with > 0 concepts
- concepts/ directory has at least 1 concept note
- taxonomy.yaml valid
- index.md exists
- kb-report.json valid

**Fail Criteria (Retry):**
- Missing knowledge-graph.json
- Invalid kb-report.json
- KB builder squad returned error
- Empty concepts (count = 0)

**Escalation Criteria:**
- Retry limit exceeded (2 attempts)
- KB builder squad unavailable
- Concept count < 5 (very poor extraction)
- Orphan nodes > 50% (graph fragmentation)
- User-requested manual review

---

## Integration Points

### Downstream Tasks
- **NEXT:** Knowledge base ready for consumption (no further processing)
- **USAGE:** Can be imported into Obsidian, Notion, or other knowledge management tools

### Upstream Tasks
- **PREVIOUS:** `sculpt-transcript.md` (provides masterpieces) — BATCH COMPLETION REQUIRED
- **OPTIONAL:** `distill-content.md` (provides knowledge-fragments.json) — enhances KB quality

### Squad Coordination
- **Delegates to:** knowledge-base-builder squad (autonomous execution)
- **Receives from KB builder:** knowledge-graph.json, concepts/, taxonomy.yaml
- **Updates:** Session state with KB completion status and stats
- **Logs:** Concept count, link count, quality score to batch status

---

## Error Handling

### Common Errors

| Error | Cause | Recovery |
|-------|-------|----------|
| `Batch not ready` | Some items haven't completed sculpt | Wait for remaining items |
| `KB builder failed: graph missing` | KB builder squad error | Retry with --debug flag |
| `Concept count < 5` | Poor material quality | Review source materials |
| `KB builder unavailable` | Missing squad installation | Install knowledge-base-builder |
| `Invalid kb-report.json` | KB builder version mismatch | Update KB builder to latest |
| `No materials found` | Wrong materials_dir | Verify directory path |

### Retry Strategy
- Max retries: 2
- Backoff: 10s, 30s
- Retry conditions: KB builder timeout, missing files
- NO retry: Batch readiness issues (wait instead)

---

## Performance Notes

**Benchmarks (estimados):**
- 5 masterpieces → ~15min KB building
- 10 masterpieces → ~30min KB building
- 20 masterpieces → ~60min KB building
- 50 masterpieces → ~90min KB building

**Bottlenecks:**
- concept-extractor is LLM-intensive (multiple passes per document)
- knowledge-linker computes semantic similarity (N² complexity for N concepts)
- taxonomy-designer requires holistic analysis

**Optimization Tips:**
- Process materials incrementally (add to existing KB instead of rebuild)
- Use `link_threshold: 0.8` for stricter linking (fewer links, faster)
- Pre-merge similar masterpieces before KB building

---

## Configuration

### Environment Variables
```bash
# Optional: Override KB builder defaults
export KB_TAXONOMY_MODE="auto"                  # auto, manual, hybrid
export KB_LINK_THRESHOLD="0.7"                  # 0.0-1.0
export KB_OUTPUT_FORMAT="obsidian"              # obsidian, notion, markdown
```

### Config File (squad-manifest.yaml)
```yaml
knowledge_base:
  enabled: true
  kb_name: "auto"
  taxonomy_mode: auto
  link_threshold: 0.7
  output_format: obsidian
  concept_threshold: 10
  retry_limit: 2
```

---

## Examples

### Example 1: Build KB from Course Hierarchy (Cademi)
```bash
# Input — materials_dir is the course root, masterpieces live in lesson folders
materials_dir: "sessions/mp-2026-0302-001/Método 30D/"
output_dir: "sessions/mp-2026-0302-001/knowledge-base/"

# Course hierarchy (materials scattered across lesson folders)
sessions/mp-2026-0302-001/Método 30D/
├── 01 - Seja Bem-Vindo/
│   ├── 01 - Bem-vindo/
│   │   ├── video.mp4
│   │   ├── transcription_clean.md
│   │   └── masterpiece.md              # ← Found by recursive scan
│   └── 02 - Criando Promessa/
│       ├── video.mp4
│       ├── transcription_clean.md
│       └── masterpiece.md              # ← Found by recursive scan
└── 02 - Módulo Funis/
    └── 01 - Como Funciona/
        ├── video.mp4
        ├── transcription_clean.md
        └── masterpiece.md              # ← Found by recursive scan

# Execution — find scans recursively
/knowledge-base-builder:ingest \
  "sessions/mp-2026-0302-001/Método 30D/" \
  "sessions/mp-2026-0302-001/knowledge-base/" \
  --config "sessions/mp-2026-0302-001/knowledge-base/kb-config.yaml"

# Output — KB at session level
knowledge-graph.json (45 concepts, 128 links)
concepts/ (45 concept notes)
taxonomy.yaml (4 levels deep)
index.md (MOC with 45 entries)
```

### Example 2: Build KB from Fragments (Distill Phase Ran)
```bash
# When distill ran, each lesson folder also has distilled/knowledge-fragments.json
sessions/mp-2026-0302-001/Método 30D/
├── 01 - Seja Bem-Vindo/
│   └── 01 - Bem-vindo/
│       ├── masterpiece.md
│       └── distilled/
│           └── knowledge-fragments.json  # ← Prioritized over masterpiece
└── ...

# KB builder prioritizes fragments over masterpieces (higher quality)
# Output: More granular concepts (60+), better linking
```

### Example 3: Skip KB Building
```bash
# Set --no-kb flag in session state
jq '.pipeline_config.no_kb = true' "{session_dir}/session-state.json" \
  > "{session_dir}/session-state.tmp.json"
mv "{session_dir}/session-state.tmp.json" "{session_dir}/session-state.json"

# Task will skip on Step 0
# Output: kb_phase.status = "skipped"
```

---

## Knowledge-Base-Builder Squad Overview

**Agents (8):**
1. **kb-architect** — Orchestrator, workflow coordinator
2. **document-parser** — Parse masterpieces/fragments
3. **concept-extractor** — Extract concepts, entities, relationships
4. **taxonomy-designer** — Design hierarchical taxonomy
5. **knowledge-linker** — Create semantic links
6. **graph-builder** — Construct knowledge graph
7. **quality-validator** — Validate graph integrity
8. **export-manager** — Export to target format

**Workflow (6 phases):**
1. Parse → structured documents
2. Extract → concepts, entities, relationships
3. Design Taxonomy → hierarchical structure
4. Link → semantic relationships
5. Build Graph → knowledge graph
6. Validate → quality checks

**Output Formats:**
- Obsidian (default) — Markdown + frontmatter + backlinks
- Notion — JSON + blocks
- Raw Markdown — Simple Markdown files
- JSON Graph — Pure JSON graph structure

---

## Notes

- **Batch execution:** Esta task roda UMA VEZ por session, após TODOS os itens completarem sculpt. NÃO roda por item.
- **Batch readiness:** Task BLOQUEIA até que todos os itens do batch completem sculpt phase.
- **Optional by default:** Task pode ser skipped com `--no-kb` flag. Não é bloqueante para outros workflows.
- **Delegation model:** Esta task NÃO executa KB building diretamente. Ela invoca o KB builder squad e valida o output.
- **Squad autonomy:** O KB builder tem seu próprio workflow interno complexo. Esta task apenas coordena handoff e validação.
- **Fragments vs Masterpieces:** Se distill phase rodou, KB builder usa knowledge-fragments.json (mais granular). Senão, usa masterpieces (still good).
- **Incremental updates:** KB builder suporta adicionar novos materiais a KB existente (via `--append` flag). Media-processor ainda não usa isso (sempre rebuild).
- **Obsidian format:** Default output é Obsidian-compatible (Markdown + frontmatter + backlinks). Pode ser usado diretamente em Obsidian vault.

---

## References

- Squad: `squads/knowledge-base-builder/`
- Squad manifest: `squads/knowledge-base-builder/squad-manifest.yaml`
- Slash commands: `.claude/commands/knowledge-base-builder/`
- Quality Gate: `.aiox-core/core/quality-gates/QG-005-kb-quality.md`
- KB Builder README: `squads/knowledge-base-builder/README.md`
- Obsidian format spec: `squads/knowledge-base-builder/docs/obsidian-format.md`

---

**Task Owner:** @media-processor-coordinator
**Delegated To:** knowledge-base-builder squad (@kb-architect)
**Execution Mode:** BATCH (once per session)
**Last Review:** 2026-02-23
**Next Review:** After 5 batch executions or KB builder major update
