# Plano de Processamento de Hist\u00f3rico Completo - Decision Analysis

**Status**: Draft
**Version**: 1.0.0
**Date**: 2025-01-21
**Objective**: Processar todo o hist\u00f3rico de conversas Claude Code sem travar contexto

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Current Scripts Analysis](#current-scripts-analysis)
3. [Strategic Approach](#strategic-approach)
4. [Implementation Plan](#implementation-plan)
5. [Chunking Strategy](#chunking-strategy)
6. [Multi-Pass Analysis](#multi-pass-analysis)
7. [Result Consolidation](#result-consolidation)
8. [Execution Workflow](#execution-workflow)

---

## Problem Statement

### Challenge

O hist\u00f3rico completo de conversas pode ter:
- **Centenas de arquivos** `.claude.json.backup`
- **Milhares de mensagens** acumuladas
- **Milh\u00f5es de tokens** quando consolidado

**Context Limit**: Claude Sonnet 4.5 = 200k tokens
**Estimated History Size**: 500k-2M tokens (depende do hist\u00f3rico)

### Risk

Se tentarmos processar tudo de uma vez:
- \u274c Context overflow
- \u274c Out of memory
- \u274c Respostas incompletas
- \u274c Perda de nuances importantes

---

## Current Scripts Analysis

### 1. `extract-all-claude-backups.js`

**O que faz**:
- Busca recursivamente por `.claude.json*` no diret\u00f3rio do usu\u00e1rio
- Extrai conversas de TODOS os backups
- Gera:
  - `MASTER-INDEX.md` - \u00cdndice navegacional
  - `all-conversations.json` - Dados consolidados
  - M\u00faltiplos `.md` individuais por arquivo

**Output**:
```
outputs/claude-history-complete/
\u251c\u2500\u2500 MASTER-INDEX.md
\u251c\u2500\u2500 all-conversations.json        # \u26a0\ufe0f Pode ser ENORME (100+ MB)
\u251c\u2500\u2500 {file1}.md
\u251c\u2500\u2500 {file2}.md
\u2514\u2500\u2500 ...
```

**Problem**: `all-conversations.json` pode ter 500k+ tokens

### 2. `extract-claude-history.js`

**O que faz**:
- L\u00ea apenas `~/.claude.json` principal
- Extrai conversas do arquivo ativo atual
- Gera:
  - `INDEX.md` - \u00cdndice
  - M\u00faltiplos `.md` por projeto

**Output**:
```
outputs/claude-history/
\u251c\u2500\u2500 INDEX.md
\u251c\u2500\u2500 aios_v4.md
\u251c\u2500\u2500 other_project.md
\u2514\u2500\u2500 ...
```

**Problem**: Mais gerenci\u00e1vel, mas perde hist\u00f3rico de backups

### 3. `analyze-decision-patterns.js`

**O que faz**:
- L\u00ea `all-conversations.json`
- Gera prompt de an\u00e1lise com TODAS conversas
- Cria vers\u00e3o resumida se >150k tokens
- Salva `ANALYSIS-PROMPT.md`

**Output**:
```
outputs/decision-analysis/
\u251c\u2500\u2500 ANALYSIS-PROMPT.md           # Pode ser 500k+ tokens
\u251c\u2500\u2500 ANALYSIS-PROMPT-SUMMARY.md   # Top 500 msgs, ~150k tokens
\u2514\u2500\u2500 ANALYSIS-RESULTS.md
```

**Problem**: Mesmo SUMMARY pode estourar em algumas sess\u00f5es

---

## Strategic Approach

### \ud83c\udfaf Core Principle: **Divide and Conquer**

Em vez de processar tudo de uma vez, vamos:

1. **Chunk Inteligente**: Dividir conversas em batches sem\u00e2nticos
2. **Multi-Pass Analysis**: Analisar cada batch independentemente
3. **Incremental Consolidation**: Consolidar resultados progressivamente
4. **Meta-Analysis**: An\u00e1lise final sobre os resultados parciais

### \ud83d\udcca Token Budget per Batch

**Safe Batch Size**: 40k tokens (~50% do limite)
- **Raz\u00e3o**: Deixa 60k para prompt template + resposta LLM + overhead

**Estimated Messages per Batch**:
- Mensagem m\u00e9dia: ~500 tokens
- Batch capacity: ~80 mensagens

---

## Implementation Plan

### Phase 1: Smart Chunking Script

**Script**: `chunk-conversations.js`

**Responsibilities**:
1. Ler `all-conversations.json`
2. Segmentar em batches de ~40k tokens
3. Aplicar chunking sem\u00e2ntico (respeitar fronteiras de conversas)
4. Gerar metadados por chunk

**Output**:
```
outputs/decision-analysis/chunks/
\u251c\u2500\u2500 chunk-001.json   # 40k tokens, msgs 1-80
\u251c\u2500\u2500 chunk-002.json   # 40k tokens, msgs 81-160
\u251c\u2500\u2500 chunk-003.json   # 40k tokens, msgs 161-240
\u251c\u2500\u2500 ...
\u2514\u2500\u2500 chunk-manifest.json  # Metadata
```

### Phase 2: Batch Analysis Orchestrator

**Script**: `analyze-batches.js`

**Responsibilities**:
1. Iterar sobre cada chunk
2. Gerar prompt de an\u00e1lise adaptado
3. Executar an\u00e1lise LLM (interativa ou autom\u00e1tica)
4. Salvar resultados parciais

**Output**:
```
outputs/decision-analysis/results/
\u251c\u2500\u2500 batch-001-analysis.json
\u251c\u2500\u2500 batch-002-analysis.json
\u251c\u2500\u2500 batch-003-analysis.json
\u251c\u2500\u2500 ...
\u2514\u2500\u2500 batch-manifest.json
```

### Phase 3: Result Consolidator

**Script**: `consolidate-results.js`

**Responsibilities**:
1. Agregar an\u00e1lises parciais
2. Detectar padr\u00f5es recorrentes
3. Ponderar confian\u00e7a por frequ\u00eancia
4. Gerar an\u00e1lise consolidada final

**Output**:
```
outputs/decision-analysis/
\u2514\u2500\u2500 FINAL-ANALYSIS.json   # Resultado consolidado
```

### Phase 4: Meta-Analysis

**Script**: `meta-analyze.js`

**Responsibilities**:
1. Revisar an\u00e1lise consolidada
2. Detectar inconsist\u00eancias
3. Identificar padr\u00f5es emergentes
4. Gerar relat\u00f3rio final

**Output**:
```
outputs/decision-analysis/
\u251c\u2500\u2500 FINAL-ANALYSIS.json
\u2514\u2500\u2500 META-REPORT.md         # Relat\u00f3rio narrativo
```

---

## Chunking Strategy

### Semantic Chunking Algorithm

```javascript
function semanticChunk(allMessages, targetTokens = 40000) {
  const chunks = [];
  let currentChunk = [];
  let currentTokens = 0;

  for (const msg of allMessages) {
    const msgTokens = estimateTokens(msg.content);

    // Se adicionar essa mensagem estoura, finaliza chunk
    if (currentTokens + msgTokens > targetTokens && currentChunk.length > 0) {
      chunks.push({
        messages: currentChunk,
        tokenCount: currentTokens,
        projects: [...new Set(currentChunk.map(m => m.project))]
      });

      currentChunk = [];
      currentTokens = 0;
    }

    currentChunk.push(msg);
    currentTokens += msgTokens;
  }

  // Adiciona \u00faltimo chunk
  if (currentChunk.length > 0) {
    chunks.push({
      messages: currentChunk,
      tokenCount: currentTokens,
      projects: [...new Set(currentChunk.map(m => m.project))]
    });
  }

  return chunks;
}
```

### Chunk Metadata

```json
{
  "chunk_id": "chunk-001",
  "token_count": 39847,
  "message_count": 78,
  "projects": ["AIOS-V4", "AllFluence", "..."],
  "date_range": {
    "earliest": "2024-10-15",
    "latest": "2024-11-20"
  },
  "topics_detected": ["architecture", "clickup", "agents", "..."]
}
```

---

## Multi-Pass Analysis

### Pass 1: Individual Batch Analysis

**Prompt Adaptation per Batch**:

```markdown
# AN\u00c1LISE DE PADR\u00d5ES - BATCH {{BATCH_NUM}}/{{TOTAL_BATCHES}}

## CONTEXTO
Voc\u00ea est\u00e1 analisando PARTE de um hist\u00f3rico maior.
- **Batch atual**: {{BATCH_NUM}} de {{TOTAL_BATCHES}}
- **Mensagens neste batch**: {{MSG_COUNT}}
- **Per\u00edodo**: {{DATE_RANGE}}

## INSTRU\u00c7\u00d5ES
Analise APENAS este batch, mas mantenha consist\u00eancia:
1. Use os mesmos eixos de an\u00e1lise
2. Marque confian\u00e7a RELATIVA a este batch
3. Identifique padr\u00f5es LOCAIS (n\u00e3o extrapole)
4. Cite evid\u00eancias DESTE batch

## ENTREGAS (JSON)
{mesma estrutura do prompt original}

---

## CONVERSAS DESTE BATCH
{{CONVERSATIONS}}
```

**Key Points**:
- \u2705 Cada batch \u00e9 analisado independentemente
- \u2705 Confian\u00e7a relativa ao batch (n\u00e3o global)
- \u2705 Evid\u00eancias citam apenas mensagens do batch
- \u2705 Resultados salvos separadamente

### Pass 2: Consolidation

**Algorithm**:

```javascript
function consolidateResults(batchResults) {
  const consolidated = {
    metadata: {
      total_batches: batchResults.length,
      total_messages: sum(batchResults.map(b => b.metadata.total_messages_analyzed)),
      confidence_score: 0.0
    },
    axes: {},
    heuristics: [],
    stop_rules: {},
    biases: [],
    collaboration_contract: []
  };

  // 1. Consolidar axes (weighted average)
  for (const axisName of AXIS_NAMES) {
    consolidated.axes[axisName] = consolidateAxis(
      batchResults.map(b => b.axes[axisName])
    );
  }

  // 2. Consolidar heuristics (merge + dedup)
  consolidated.heuristics = consolidateHeuristics(
    batchResults.flatMap(b => b.heuristics)
  );

  // 3. Consolidar stop_rules (union)
  consolidated.stop_rules = consolidateStopRules(
    batchResults.map(b => b.stop_rules)
  );

  // 4. Consolidar biases (frequency filter)
  consolidated.biases = consolidateBiases(
    batchResults.flatMap(b => b.biases)
  );

  // 5. Consolidar collaboration_contract (vote)
  consolidated.collaboration_contract = consolidateContract(
    batchResults.map(b => b.collaboration_contract)
  );

  return consolidated;
}
```

**Consolidation Strategies**:

1. **Axes** - Weighted average:
   ```javascript
   function consolidateAxis(axisResults) {
     const totalWeight = axisResults.reduce((sum, r) => sum + r.confidence, 0);

     return {
       assessment: mostFrequent(axisResults.map(r => r.assessment)),
       signals: union(axisResults.flatMap(r => r.signals)),
       evidence: axisResults.flatMap(r => r.evidence),
       confidence: totalWeight / axisResults.length
     };
   }
   ```

2. **Heuristics** - Merge + dedup:
   ```javascript
   function consolidateHeuristics(allHeuristics) {
     const grouped = groupBy(allHeuristics, h => h.id);

     return Object.values(grouped).map(group => ({
       id: group[0].id,
       name: group[0].name,
       description: group[0].description,
       evidence: union(group.flatMap(h => h.evidence)),
       frequency: group.length / totalBatches
     })).filter(h => h.frequency >= 0.3); // Aparece em 30%+ batches
   }
   ```

3. **Collaboration Contract** - Voting:
   ```javascript
   function consolidateContract(allContracts) {
     const allRules = allContracts.flat();
     const ruleCounts = countBy(allRules, r => normalize(r));

     return Object.entries(ruleCounts)
       .sort((a, b) => b[1] - a[1])
       .slice(0, 5)
       .map(([rule, count]) => rule);
   }
   ```

### Pass 3: Meta-Analysis

**Prompt for Meta-Analysis**:

```markdown
# META-AN\u00c1LISE - Revis\u00e3o da An\u00e1lise Consolidada

## CONTEXTO
Voc\u00ea recebeu uma an\u00e1lise consolidada de {{TOTAL_BATCHES}} batches.

## OBJETIVO
Revisar, validar e refinar a an\u00e1lise:
1. Identificar inconsist\u00eancias entre batches
2. Detectar padr\u00f5es emergentes n\u00e3o capturados
3. Ajustar confian\u00e7as baseado em evid\u00eancia global
4. Gerar insights adicionais

## AN\u00c1LISE CONSOLIDADA
{{CONSOLIDATED_ANALYSIS}}

## ENTREGAS
1. Valida\u00e7\u00e3o de consist\u00eancia
2. Padr\u00f5es emergentes adicionais
3. Ajustes de confian\u00e7a
4. Relat\u00f3rio narrativo final
```

---

## Execution Workflow

### Workflow Diagram

```
[1] extract-all-claude-backups.js
    \u2193
    all-conversations.json (pode ser 100+ MB)
    \u2193
[2] chunk-conversations.js
    \u2193
    chunk-001.json, chunk-002.json, ... (40k tokens cada)
    \u2193
[3] analyze-batches.js (LOOP)
    \u2193
    \u251c\u2500 batch-001-analysis.json
    \u251c\u2500 batch-002-analysis.json
    \u2514\u2500 ...
    \u2193
[4] consolidate-results.js
    \u2193
    FINAL-ANALYSIS.json
    \u2193
[5] meta-analyze.js
    \u2193
    META-REPORT.md + Mind YAML files
```

### Step-by-Step Execution

#### Step 1: Extract Full History

```bash
node extract-all-claude-backups.js
```

**Output**:
- `outputs/claude-history-complete/all-conversations.json`
- Estat\u00edsticas: Total de mensagens, projetos, arquivos

**Time**: ~30 segundos

#### Step 2: Chunk Conversations

```bash
node chunk-conversations.js
```

**Output**:
- `outputs/decision-analysis/chunks/chunk-{NNN}.json`
- `outputs/decision-analysis/chunks/chunk-manifest.json`

**Time**: ~5 segundos

**Sample Output**:
```
\ud83d\udd2a Chunking 2,450 messages into batches of ~40k tokens...

\u2705 Created 31 chunks:
   - chunk-001.json: 78 msgs, 39,847 tokens
   - chunk-002.json: 80 msgs, 40,123 tokens
   - chunk-003.json: 79 msgs, 39,956 tokens
   ...
   - chunk-031.json: 65 msgs, 32,890 tokens

\ud83d\udcbe Saved manifest: chunk-manifest.json
```

#### Step 3: Analyze Batches (Interactive Loop)

**Option A: Manual (Recommended)**

```bash
node analyze-batches.js --mode manual
```

**Process**:
1. Script gera `BATCH-001-PROMPT.md`
2. Voc\u00ea cola no Claude, recebe JSON
3. Cola JSON em `batch-001-analysis.json`
4. Script detecta completion, move para batch 002
5. Repeat 31 vezes

**Time**: ~2-3 min por batch = ~90 min total

**Option B: Automated (Requires API)**

```bash
export ANTHROPIC_API_KEY="..."
node analyze-batches.js --mode auto
```

**Process**:
1. Script chama API Claude para cada batch
2. Salva resultados automaticamente
3. Progress bar atualiza

**Time**: ~30-60 min total (depende de rate limits)

#### Step 4: Consolidate Results

```bash
node consolidate-results.js
```

**Output**:
- `outputs/decision-analysis/FINAL-ANALYSIS.json`
- `outputs/decision-analysis/CONSOLIDATION-REPORT.md`

**Time**: ~10 segundos

**Sample Output**:
```
\ud83e\udde0 Consolidating 31 batch analyses...

\u2705 Axes consolidated (weighted average)
\u2705 Heuristics merged: 47 unique \u2192 23 high-confidence
\u2705 Stop rules unified: 15 triggers, 8 conditions
\u2705 Biases filtered: 12 \u2192 5 recurrent
\u2705 Contract voted: Top 5 rules selected

\ud83d\udcca Final confidence score: 4.2/5.0
\ud83d\udcbe Saved: FINAL-ANALYSIS.json
```

#### Step 5: Meta-Analysis

```bash
node meta-analyze.js
```

**Process**:
1. Gera `META-ANALYSIS-PROMPT.md` com an\u00e1lise consolidada
2. Voc\u00ea cola no Claude para revis\u00e3o final
3. Script gera relat\u00f3rio narrativo

**Output**:
- `outputs/decision-analysis/META-REPORT.md`
- `outputs/minds/pedro_valerio/decisions/meta-insights.yaml`

**Time**: ~5 min (1 intera\u00e7\u00e3o Claude)

---

## Estimated Timeline

### Full Pipeline Execution

| Phase | Script | Mode | Time |
|-------|--------|------|------|
| 1. Extract | extract-all-claude-backups.js | Auto | 30s |
| 2. Chunk | chunk-conversations.js | Auto | 5s |
| 3. Analyze | analyze-batches.js | Manual | 90 min |
| 3. Analyze | analyze-batches.js | Auto (API) | 30 min |
| 4. Consolidate | consolidate-results.js | Auto | 10s |
| 5. Meta | meta-analyze.js | Manual | 5 min |
| **Total** | | **Manual** | **~100 min** |
| **Total** | | **Auto** | **~40 min** |

### Resource Requirements

**Disk Space**:
- Conversas extra\u00eddas: ~100 MB
- Chunks: ~120 MB (overhead JSON)
- Resultados: ~5 MB
- **Total**: ~225 MB

**Memory**:
- Node.js peak: ~300 MB
- Claude context: 40k tokens/batch (safe)

**API Costs** (if automated):
- 31 batches \u00d7 40k tokens input = 1.24M tokens input
- 31 batches \u00d7 5k tokens output = 155k tokens output
- **Estimated cost**: $15-20 USD (Sonnet 4.5 pricing)

---

## Implementation Files

### File Structure

```
C:\Users\AllFluence-User\Workspaces\AIOS\AIOS-V4\

\u251c\u2500\u2500 extract-all-claude-backups.js      # Existing
\u251c\u2500\u2500 extract-claude-history.js          # Existing
\u251c\u2500\u2500 analyze-decision-patterns.js       # Existing (will be replaced)

\u251c\u2500\u2500 chunk-conversations.js             # NEW - Phase 1
\u251c\u2500\u2500 analyze-batches.js                 # NEW - Phase 2
\u251c\u2500\u2500 consolidate-results.js             # NEW - Phase 3
\u251c\u2500\u2500 meta-analyze.js                    # NEW - Phase 4

\u2514\u2500\u2500 outputs/
    \u251c\u2500\u2500 claude-history-complete/
    \u2502   \u251c\u2500\u2500 all-conversations.json
    \u2502   \u2514\u2500\u2500 MASTER-INDEX.md
    \u2502
    \u2514\u2500\u2500 decision-analysis/
        \u251c\u2500\u2500 chunks/
        \u2502   \u251c\u2500\u2500 chunk-001.json
        \u2502   \u251c\u2500\u2500 chunk-002.json
        \u2502   \u251c\u2500\u2500 ...
        \u2502   \u2514\u2500\u2500 chunk-manifest.json
        \u2502
        \u251c\u2500\u2500 prompts/
        \u2502   \u251c\u2500\u2500 BATCH-001-PROMPT.md
        \u2502   \u251c\u2500\u2500 BATCH-002-PROMPT.md
        \u2502   \u251c\u2500\u2500 ...
        \u2502   \u2514\u2500\u2500 META-ANALYSIS-PROMPT.md
        \u2502
        \u251c\u2500\u2500 results/
        \u2502   \u251c\u2500\u2500 batch-001-analysis.json
        \u2502   \u251c\u2500\u2500 batch-002-analysis.json
        \u2502   \u251c\u2500\u2500 ...
        \u2502   \u2514\u2500\u2500 batch-manifest.json
        \u2502
        \u251c\u2500\u2500 FINAL-ANALYSIS.json
        \u251c\u2500\u2500 CONSOLIDATION-REPORT.md
        \u2514\u2500\u2500 META-REPORT.md
```

---

## Alternative: Hybrid Approach

### Option: Pre-filter + Smart Sampling

Se mesmo com chunking o processo for muito longo:

**Strategy**:
1. **Pre-filter** por relev\u00e2ncia:
   - Priorizar projetos AIOS
   - Filtrar mensagens muito curtas (<50 tokens)
   - Remover duplicatas/repeti\u00e7\u00f5es

2. **Smart sampling**:
   - Top 30% de mensagens por tamanho (mais contexto)
   - Top 50% de conversas AIOS
   - Sample aleat\u00f3rio de 20% do restante

3. **Analyze reduced set**:
   - Pode reduzir de 31 batches para 10-15 batches
   - Tempo total: 30-45 min manual

**Trade-off**:
- \u2705 Mais r\u00e1pido
- \u274c Perde algumas nuances
- \u26a0\ufe0f Recomendado apenas se >50 batches

---

## Next Steps

### Immediate Actions

1. **Review this plan** com Pedro Val\u00e9rio
2. **Decide approach**:
   - Full processing (31 batches, ~100 min)
   - Hybrid with pre-filter (10-15 batches, ~45 min)
   - Automated with API (requires API key, ~40 min, $15-20)

3. **Implement Phase 1**: `chunk-conversations.js`
4. **Test with 2-3 batches** antes de rodar tudo
5. **Execute pipeline** completo

### Success Criteria

- \u2705 Nenhum batch estoura 50k tokens
- \u2705 Todos os batches analisados com sucesso
- \u2705 An\u00e1lise consolidada tem confidence \u2265 3.5/5.0
- \u2705 Mind Pedro Val\u00e9rio atualizado com resultados
- \u2705 Contrato de colabora\u00e7\u00e3o dos agentes atualizado

---

## Appendix: Utility Functions

### Token Estimation

```javascript
function estimateTokens(text) {
  // Rule of thumb: 1 token \u2248 4 characters for English
  // Portuguese is slightly more efficient: 1 token \u2248 4.5 characters
  return Math.ceil(text.length / 4.5);
}
```

### Semantic Similarity

```javascript
function semanticSimilarity(text1, text2) {
  // Simple keyword overlap
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));

  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size; // Jaccard similarity
}
```

### Deduplication

```javascript
function deduplicateMessages(messages, threshold = 0.8) {
  const unique = [];

  for (const msg of messages) {
    const isDuplicate = unique.some(u =>
      semanticSimilarity(u.content, msg.content) > threshold
    );

    if (!isDuplicate) {
      unique.push(msg);
    }
  }

  return unique;
}
```

---

**Document Status**: \u2705 Draft Complete - Ready for Review
**Next Action**: Implement `chunk-conversations.js`
**Estimated Dev Time**: 2-3 hours for all 4 scripts
