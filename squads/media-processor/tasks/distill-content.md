# Task: Distill Content

## Metadata
- **Task ID:** TASK-MP-003
- **Version:** 1.0.0
- **Status:** Active
- **Created:** 2026-02-23
- **Last Updated:** 2026-02-23
- **Owner:** @media-processor-coordinator
- **Executor Type:** Delegation (to video-content-distillery squad)
- **Estimated Duration:** 15-60min (varies by content complexity)
- **Complexity:** HIGH
- **Optional:** YES (can be skipped with --no-distill flag)

---

## Purpose

Delegar a destilação de conhecimento tácito e multiplicação de ideias para o squad especializado video-content-distillery, que extrai frameworks, heuristics, mental models e atomiza conteúdo em peças prontas para publicação.

**Por que esta task existe:**
- Masterpieces contêm conhecimento implícito não estruturado
- Distillery tem 9 agentes especializados em knowledge extraction e content multiplication
- Separação de responsabilidades: media-processor foca em pipeline, distillery foca em ideação e atomização

**Delegation justificativa:**
- Video-content-distillery é squad autônomo com expertise em frameworks (4A, 5 Layers, etc.)
- Workflow interno complexo (extract → identify → summarize → multiply → atomize)
- Reutilizável para outros squads (dan-koe, hormozi usam intensamente)

**OPCIONAL porque:**
- Nem todo conteúdo precisa de destilação (e.g., simples Q&A, transcrições de reuniões)
- Processo adiciona 15-60min ao pipeline
- User pode preferir ir direto para knowledge base building

---

## Inputs

| Input | Type | Source | Required | Validation |
|-------|------|--------|----------|------------|
| `masterpiece.md` | File path | Previous task (sculpt-transcript) | YES | File exists, > 500 words |
| `output_dir` | Directory path | `{lesson_folder}/distilled/` subfolder | YES | Writable directory |
| `distill_mode` | String | Config or default | NO | One of: extract, full |
| `frameworks` | Array[String] | Config or auto-detect | NO | Valid framework IDs |
| `atomize_platforms` | Array[String] | Config or default | NO | twitter, linkedin, instagram, etc. |

**Default Values:**
- `distill_mode`: full (extract + summarize + multiply + atomize)
- `frameworks`: auto-detect (distillery identifica automaticamente)
- `atomize_platforms`: ["twitter", "linkedin", "instagram"]

---

## Preconditions

### System Requirements
- [x] video-content-distillery squad instalado em `squads/video-content-distillery/`
- [x] Squad commands sincronizados em `.claude/commands/video-content-distillery/`
- [x] Slash command `/video-content-distillery:distill` disponível

### Input Validation
- [x] `masterpiece.md` existe e é legível
- [x] Arquivo > 500 palavras (validação mínima para distillation)
- [x] `output_dir` existe ou pode ser criado
- [x] Espaço em disco suficiente (estimativa: 2x tamanho do input)

### Dependencies
- [x] PREVIOUS: `sculpt-transcript.md` (deve ter completado com sucesso)
- [x] OPTIONAL: User confirmou que quer distill (ou --no-distill não foi passado)

---

## Execution Steps

### Step 0: Check if Distillation is Enabled
```bash
# Check for --no-distill flag in session state
NO_DISTILL=$(jq -r '.pipeline_config.no_distill // false' "{session_dir}/session-state.json")

if [ "$NO_DISTILL" = "true" ]; then
  echo "Distillation skipped per --no-distill flag"
  # Update session state
  jq '.distill_phase.status = "skipped"' "{session_dir}/session-state.json" \
    > "{session_dir}/session-state.tmp.json"
  mv "{session_dir}/session-state.tmp.json" "{session_dir}/session-state.json"
  exit 0  # Success — task completed (by skipping)
fi
```

### Step 1: Prepare Handoff
```bash
# Validate input
test -f "{masterpiece.md}" || { echo "Input masterpiece not found"; exit 1; }

# Check word count (minimum 500 words for meaningful distillation)
WORD_COUNT=$(wc -w < "{masterpiece.md}")
test "$WORD_COUNT" -ge 500 || {
  echo "WARNING: Masterpiece too short for distillation: $WORD_COUNT words"
  echo "Consider skipping distill phase or merging with other content"
  # Still proceed — let distillery decide
}

# Create output directory
mkdir -p "{output_dir}"

# Log handoff
echo "Handing off to video-content-distillery: {masterpiece.md} ($WORD_COUNT words)"
```

### Step 2: Invoke Video-Content-Distillery Squad
```bash
# Activate squad via slash command
# This is a DELEGATION — the distillery squad takes over
/video-content-distillery:distill "{masterpiece.md}" "{output_dir}"
```

**What happens inside distillery:**
1. **distillery-chief** orchestrates workflow
2. **knowledge-extractor** extracts tacit knowledge fragments
3. **framework-identifier** identifies frameworks, heuristics, mental models
4. **progressive-summarizer** creates 5 layers (original → layer1 → ... → layer5-essence)
5. **idea-multiplier** applies 4A Framework (Add, Amplify, Adjust, Antagonize)
6. **content-atomizer** breaks into platform-specific pieces (tweets, LinkedIn posts, etc.)
7. **metadata-tagger** adds tags, categories, relationships
8. **quality-validator** validates output quality
9. **export-manager** exports final deliverables

**Expected outputs from distillery:**
- `knowledge-fragments.json` — extracted tacit knowledge
- `frameworks.json` — identified frameworks/models
- `progressive-summary/` — 5 layers of summarization
- `multiplied-ideas.json` — 4A Framework outputs
- `atomized-content/` — platform-specific pieces
- `metadata.json` — tags, categories, relationships
- `distillation-report.json` — process metrics

### Step 3: Validate Distillery Output
```bash
# Check required outputs exist
test -f "{output_dir}/knowledge-fragments.json" || { echo "Distillery failed: knowledge-fragments.json missing"; exit 1; }
test -f "{output_dir}/frameworks.json" || { echo "Distillery failed: frameworks.json missing"; exit 1; }
test -d "{output_dir}/progressive-summary" || { echo "Distillery failed: progressive-summary missing"; exit 1; }
test -f "{output_dir}/distillation-report.json" || { echo "Distillery failed: report missing"; exit 1; }

# Validate knowledge fragments count
FRAGMENT_COUNT=$(jq '. | length' "{output_dir}/knowledge-fragments.json")
test "$FRAGMENT_COUNT" -gt 0 || { echo "No knowledge fragments extracted"; exit 1; }

# Validate frameworks count
FRAMEWORK_COUNT=$(jq '. | length' "{output_dir}/frameworks.json")
# Note: frameworks can be 0 (not all content has explicit frameworks)

# Check progressive summary layers (should have 5 layers)
LAYER_COUNT=$(ls "{output_dir}/progressive-summary"/layer*.md 2>/dev/null | wc -l)
test "$LAYER_COUNT" -eq 5 || { echo "WARNING: Expected 5 summary layers, found $LAYER_COUNT"; }

# Log completion
echo "Distillation complete: $FRAGMENT_COUNT fragments, $FRAMEWORK_COUNT frameworks, $LAYER_COUNT layers"
```

### Step 4: Index Atomized Content
```bash
# Count atomized pieces by platform
if [ -d "{output_dir}/atomized-content" ]; then
  TWITTER_COUNT=$(ls "{output_dir}/atomized-content/twitter"/*.md 2>/dev/null | wc -l)
  LINKEDIN_COUNT=$(ls "{output_dir}/atomized-content/linkedin"/*.md 2>/dev/null | wc -l)
  INSTAGRAM_COUNT=$(ls "{output_dir}/atomized-content/instagram"/*.md 2>/dev/null | wc -l)

  echo "Atomized content: Twitter ($TWITTER_COUNT), LinkedIn ($LINKEDIN_COUNT), Instagram ($INSTAGRAM_COUNT)"

  # Update session state
  jq ".distill_phase.atomized_content = {
    \"twitter\": $TWITTER_COUNT,
    \"linkedin\": $LINKEDIN_COUNT,
    \"instagram\": $INSTAGRAM_COUNT
  }" "{session_dir}/session-state.json" > "{session_dir}/session-state.tmp.json"
  mv "{session_dir}/session-state.tmp.json" "{session_dir}/session-state.json"
fi
```

### Step 5: Quality Gate Check (QG-004)
```bash
# Automated checks
FRAGMENT_THRESHOLD=5  # Minimum fragments expected

# Extract fragment count
FRAGMENT_COUNT=$(jq '. | length' "{output_dir}/knowledge-fragments.json")

# Compare with threshold
if [ "$FRAGMENT_COUNT" -lt "$FRAGMENT_THRESHOLD" ]; then
  echo "WARNING: Fragment count $FRAGMENT_COUNT below threshold $FRAGMENT_THRESHOLD"
  echo "Content may lack depth or explicit knowledge"
  # DO NOT FAIL — log warning and proceed
fi

# Check distillation quality score (if available)
QUALITY_SCORE=$(jq -r '.quality_score // "N/A"' "{output_dir}/distillation-report.json")

# Log gate result
echo "QG-004 Distillation Quality: PASS (fragments: $FRAGMENT_COUNT, quality: $QUALITY_SCORE)"

# Update session state
jq ".distill_phase.status = \"completed\" | .distill_phase.fragment_count = $FRAGMENT_COUNT" \
  "{session_dir}/session-state.json" > "{session_dir}/session-state.tmp.json"
mv "{session_dir}/session-state.tmp.json" "{session_dir}/session-state.json"
```

---

## Outputs

| Output | Type | Location | Description |
|--------|------|----------|-------------|
| `knowledge-fragments.json` | JSON | `{output_dir}/` | Extracted tacit knowledge (PRIMARY) |
| `frameworks.json` | JSON | `{output_dir}/` | Identified frameworks/models |
| `progressive-summary/` | Directory | `{output_dir}/` | 5 layers of summarization |
| `multiplied-ideas.json` | JSON | `{output_dir}/` | 4A Framework outputs |
| `atomized-content/` | Directory | `{output_dir}/` | Platform-specific content pieces |
| `metadata.json` | JSON | `{output_dir}/` | Tags, categories, relationships |
| `distillation-report.json` | JSON | `{output_dir}/` | Process metrics and quality score |

**Output Structure (Lesson Folder = Unidade Atômica):**

Distill outputs go into a `distilled/` **subfolder** within the lesson folder, preventing pollution of the lesson root while keeping all artifacts co-located.

```
{lesson_folder}/                    # Lesson root
├── video.mp4                       # Phase 2
├── transcription_clean.md          # Phase 3
├── masterpiece.md                  # Phase 4
└── distilled/                      # Phase 5: = output_dir
    ├── knowledge-fragments.json    # PRIMARY OUTPUT (for KB building)
    ├── frameworks.json             # Identified patterns
    ├── progressive-summary/
    │   ├── layer1-condensed.md     # First compression
    │   ├── layer2-core.md         # Core concepts
    │   ├── layer3-insights.md     # Key insights
    │   ├── layer4-takeaways.md    # Main takeaways
    │   └── layer5-essence.md      # Pure essence (1-2 paragraphs)
    ├── multiplied-ideas.json       # 4A Framework outputs
    ├── atomized-content/
    │   ├── twitter/
    │   │   ├── tweet-001.md
    │   │   └── ...
    │   ├── linkedin/
    │   │   ├── post-001.md
    │   │   └── ...
    │   └── instagram/
    │       ├── caption-001.md
    │       └── ...
    ├── metadata.json               # Tags, categories
    └── distillation-report.json    # Metrics
```

---

## Validation Rules

### Quality Gate QG-004: Distillation Quality

**Automated Checks:**
```bash
# 1. All required files exist
test -f "{output_dir}/knowledge-fragments.json"
test -f "{output_dir}/frameworks.json"
test -d "{output_dir}/progressive-summary"
test -f "{output_dir}/distillation-report.json"

# 2. Knowledge fragments are non-empty
FRAGMENT_COUNT=$(jq '. | length' "{output_dir}/knowledge-fragments.json")
test "$FRAGMENT_COUNT" -gt 0

# 3. Progressive summary has 5 layers
LAYER_COUNT=$(ls "{output_dir}/progressive-summary"/layer*.md 2>/dev/null | wc -l)
test "$LAYER_COUNT" -eq 5

# 4. Distillation report is valid
QUALITY_SCORE=$(jq -r '.quality_score // null' "{output_dir}/distillation-report.json")
test "$QUALITY_SCORE" != "null"
```

**Thresholds:**
- Fragment count > 5 (RECOMMENDED, not blocking)
- Layer count = 5 (CRITICAL)
- Quality score > 0 (CRITICAL)

---

## Quality Threshold

**Pass Criteria:**
- knowledge-fragments.json exists with > 0 fragments
- frameworks.json exists (can be empty)
- progressive-summary/ has 5 layers
- distillation-report.json valid

**Fail Criteria (Retry):**
- Missing knowledge-fragments.json
- Invalid distillation-report.json
- Distillery squad returned error
- Empty fragments (count = 0)

**Escalation Criteria:**
- Retry limit exceeded (2 attempts)
- Distillery squad unavailable
- Fragment count < 3 (very poor extraction)
- User-requested manual review

---

## Integration Points

### Downstream Tasks
- **NEXT:** `build-knowledge-base.md` (consumes `knowledge-fragments.json`)
- **ALTERNATIVE:** Content publishing (uses `atomized-content/`)

### Upstream Tasks
- **PREVIOUS:** `sculpt-transcript.md` (provides `masterpiece.md`)

### Squad Coordination
- **Delegates to:** video-content-distillery squad (autonomous execution)
- **Receives from distillery:** knowledge-fragments.json, frameworks.json, atomized-content/
- **Updates:** Session state with distillation completion status
- **Logs:** Fragment count and quality score to batch status

---

## Error Handling

### Common Errors

| Error | Cause | Recovery |
|-------|-------|----------|
| `Distillery failed: fragments missing` | Distillery squad error | Retry with --debug flag |
| `Fragment count < 3` | Poor content depth | Escalate for manual review |
| `Distillery squad unavailable` | Missing squad installation | Install video-content-distillery |
| `Invalid report.json` | Distillery version mismatch | Update distillery to latest |
| `Masterpiece too short` | Input < 500 words | Skip distillation |

### Retry Strategy
- Max retries: 2
- Backoff: 10s, 30s
- Retry conditions: Distillery timeout, missing files
- NO retry: Fragment count issues (escalate instead)

---

## Performance Notes

**Benchmarks (estimados):**
- 1000 words → ~10min distillation
- 5000 words → ~30min distillation
- 10000 words → ~60min distillation

**Bottlenecks:**
- knowledge-extractor is LLM-intensive (multiple passes)
- idea-multiplier runs 4 parallel analyses (4A Framework)
- content-atomizer generates many small pieces (batch processing)

**Optimization Tips:**
- Use `distill_mode: extract` to skip atomization (faster, fewer outputs)
- Limit `atomize_platforms` to reduce output volume
- Process multiple items in parallel (one distillery instance per item)

---

## Configuration

### Environment Variables
```bash
# Optional: Override distillery defaults
export DISTILLERY_MODE="full"                          # extract, full
export DISTILLERY_PLATFORMS="twitter,linkedin"         # Comma-separated
export DISTILLERY_FRAMEWORKS="auto"                    # auto, manual list
```

### Config File (squad-manifest.yaml)
```yaml
distillation:
  enabled: true
  mode: full
  platforms:
    - twitter
    - linkedin
    - instagram
  fragment_threshold: 5
  retry_limit: 2
```

---

## Examples

### Example 1: Full Distillation (Cademi lesson)
```bash
# Input — masterpiece lives in lesson folder
masterpiece.md: "sessions/mp-2026-0302-001/Método 30D/01 - Seja Bem-Vindo/01 - Bem-vindo/masterpiece.md"
output_dir: "sessions/mp-2026-0302-001/Método 30D/01 - Seja Bem-Vindo/01 - Bem-vindo/distilled/"

# Execution — output goes to distilled/ subfolder
/video-content-distillery:distill \
  "sessions/mp-2026-0302-001/Método 30D/01 - Seja Bem-Vindo/01 - Bem-vindo/masterpiece.md" \
  "sessions/mp-2026-0302-001/Método 30D/01 - Seja Bem-Vindo/01 - Bem-vindo/distilled/"

# Output — distilled/ subfolder within lesson folder
sessions/mp-2026-0302-001/Método 30D/01 - Seja Bem-Vindo/01 - Bem-vindo/
├── video.mp4                       # Phase 2
├── masterpiece.md                  # Phase 4
└── distilled/                      # Phase 5
    ├── knowledge-fragments.json    # 42 fragments
    ├── frameworks.json             # 5 frameworks
    ├── progressive-summary/        # 5 layers
    ├── atomized-content/           # Twitter: 15, LinkedIn: 8, Instagram: 6
    └── distillation-report.json    # quality: 8.7
```

### Example 2: Extract-Only Mode (Skip Atomization)
```bash
# Override mode
export DISTILLERY_MODE="extract"

# Execution — same lesson folder pattern
/video-content-distillery:distill \
  "{lesson_folder}/masterpiece.md" \
  "{lesson_folder}/distilled/"

# Output (atomized-content/ skipped)
knowledge-fragments.json
frameworks.json
progressive-summary/
distillation-report.json
```

### Example 3: Skip Distillation Entirely
```bash
# Set --no-distill flag in session state
jq '.pipeline_config.no_distill = true' "{session_dir}/session-state.json" \
  > "{session_dir}/session-state.tmp.json"
mv "{session_dir}/session-state.tmp.json" "{session_dir}/session-state.json"

# Task will skip on Step 0
# Output: distill_phase.status = "skipped"
```

---

## Video-Content-Distillery Squad Overview

**Agents (9):**
1. **distillery-chief** — Orchestrator
2. **knowledge-extractor** — Extract tacit knowledge
3. **framework-identifier** — Identify patterns/models
4. **progressive-summarizer** — 5-layer summarization
5. **idea-multiplier** — 4A Framework (Add, Amplify, Adjust, Antagonize)
6. **content-atomizer** — Platform-specific pieces
7. **metadata-tagger** — Tags, categories
8. **quality-validator** — Quality checks
9. **export-manager** — Final delivery

**Workflow (6 phases):**
1. Extract → knowledge-fragments.json
2. Identify → frameworks.json
3. Summarize → progressive-summary/ (5 layers)
4. Multiply → multiplied-ideas.json (4A Framework)
5. Atomize → atomized-content/ (platform-specific)
6. Validate → distillation-report.json

**Frameworks Supported:**
- 4A Framework (Add, Amplify, Adjust, Antagonize)
- Progressive Summarization (5 layers)
- Mental Models (auto-detection)
- Heuristics (auto-detection)
- Custom frameworks (user-defined)

---

## Notes

- **Optional by default:** Esta task pode ser skipped com `--no-distill` flag. Não é bloqueante.
- **Delegation model:** Esta task NÃO executa a destilação diretamente. Ela invoca o distillery squad e valida o output.
- **Squad autonomy:** O distillery tem seu próprio workflow interno complexo. Esta task apenas coordena handoff e validação.
- **Content atomization:** Atomized content é útil para publicação imediata, mas NÃO é usado pela knowledge base (que consome fragments).
- **Progressive summarization:** Os 5 layers são úteis para quick reference e podem ser usados standalone.
- **Batch support:** Distillery suporta processar múltiplos masterpieces de uma vez.

---

## References

- Squad: `squads/video-content-distillery/`
- Squad manifest: `squads/video-content-distillery/squad-manifest.yaml`
- Slash commands: `.claude/commands/video-content-distillery/`
- Quality Gate: `.aiox-core/core/quality-gates/QG-004-distillation-quality.md`
- Distillery README: `squads/video-content-distillery/README.md`
- 4A Framework: `squads/video-content-distillery/docs/4a-framework.md`
- Progressive Summarization: `squads/video-content-distillery/docs/progressive-summarization.md`

---

**Task Owner:** @media-processor-coordinator
**Delegated To:** video-content-distillery squad (@distillery-chief)
**Last Review:** 2026-02-23
**Next Review:** After 10 executions or distillery major update
