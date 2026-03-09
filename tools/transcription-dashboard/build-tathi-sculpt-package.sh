#!/bin/bash
set -euo pipefail

ROOT="/Users/luizfosc/Dropbox/Dropbox Particular Fosc/+PROJETOS Palestras + Mágicas/LUIZFOSC/CURSOS E TRANSCRIÇÕES/Tathi Deândhela/Palestrante Memorável"
PKG="$ROOT/_pipeline/sculpt-ready"
MANI="$PKG/manifests"
MODS="$PKG/modules"
CORPUS="$PKG/corpus"
CANONICAL_FORMAT="transcription_clean.md"
CURATED_DIR="$ROOT/kb/refined/curated"
CURATED_REPORT="$CURATED_DIR/curation-report.json"
CURATED_INDEX="$CURATED_DIR/index-curated.md"
CURATED_TAXONOMY="$CURATED_DIR/taxonomy-curated.yaml"
CURATED_GRAPH="$CURATED_DIR/knowledge-graph-curated.json"

mkdir -p "$MANI" "$MODS" "$CORPUS"

CATALOG="$MANI/transcripts-catalog.csv"
MODULE_SUMMARY="$MANI/module-summary.csv"
FILELIST="$MANI/filelist.txt"
POLICY_JSON="$MANI/ingestion-policy.json"
READY_MD="$PKG/README-SCULPT.md"
CORPUS_MD="$CORPUS/tathi-palestrante-corpus.md"

printf "id,relative_dir,module,lesson_slug,transcript_md,word_count,char_count\n" > "$CATALOG"
: > "$FILELIST"
: > "$CORPUS_MD"

idx=0
while IFS= read -r f; do
  rel="${f#$ROOT/}"
  dir_rel="${rel%/transcription_clean.md}"
  module="${dir_rel%%/*}"
  lesson_slug="${dir_rel##*/}"

  words=$(wc -w < "$f" | tr -d ' ')
  chars=$(wc -m < "$f" | tr -d ' ')
  idx=$((idx+1))
  id=$(printf "TATHI-%03d" "$idx")

  printf "%s,%s,%s,%s,%s,%s,%s\n" \
    "$id" "$dir_rel" "$module" "$lesson_slug" "$f" "$words" "$chars" >> "$CATALOG"

  printf "%s\n" "$f" >> "$FILELIST"

  {
    echo ""
    echo "---"
    echo "ID: $id"
    echo "MODULE: $module"
    echo "LESSON: $lesson_slug"
    echo "SOURCE: $f"
    echo "WORDS: $words"
    echo "---"
    echo ""
    cat "$f"
    echo ""
  } >> "$CORPUS_MD"
done < <(find "$ROOT" -type f -name 'transcription_clean.md' \
  -not -path "$ROOT/sculpt/*" \
  -not -path "$ROOT/distill/*" \
  -not -path "$ROOT/kb/*" \
  -not -path "$ROOT/_pipeline/*" | sort)

# Module summary
awk -F',' 'NR>1 {m[$3]++; w[$3]+=$6; c[$3]+=$7} END {print "module,total_lessons,total_words,total_chars"; for (k in m) printf "%s,%d,%d,%d\n", k,m[k],w[k],c[k]}' "$CATALOG" | sort > "$MODULE_SUMMARY"

# Per-module markdown indexes
while IFS=',' read -r module total_lessons total_words total_chars; do
  [ "$module" = "module" ] && continue
  out="$MODS/${module}.md"
  {
    echo "# $module"
    echo ""
    echo "- Aulas: $total_lessons"
    echo "- Palavras: $total_words"
    echo "- Caracteres: $total_chars"
    echo ""
    echo "## Aulas"
    awk -F',' -v mod="$module" 'NR>1 && $3==mod {printf "- %s (%s palavras)\\n", $4, $6}' "$CATALOG"
  } > "$out"
done < "$MODULE_SUMMARY"

TOTAL_FILES=$(awk 'END{print NR-1}' "$CATALOG")
TOTAL_WORDS=$(awk -F',' 'NR>1{s+=$6} END{print s+0}' "$CATALOG")
TOTAL_CHARS=$(awk -F',' 'NR>1{s+=$7} END{print s+0}' "$CATALOG")

CURATED_STATUS="not_available"
CURATED_CONCEPTS="0"
if [ -f "$CURATED_REPORT" ]; then
  CURATED_STATUS="available"
  CURATED_CONCEPTS=$(grep -E '"kept_concepts"' "$CURATED_REPORT" | head -n1 | sed -E 's/.*: *([0-9]+).*/\1/' || echo "0")
fi

cat > "$POLICY_JSON" << EOM
{
  "canonical_transcript_format": "$CANONICAL_FORMAT",
  "allowed_formats_for_ingestion": ["$CANONICAL_FORMAT"],
  "ignore_other_transcript_variants": true,
  "ingestion_order": [
    "manifests/transcripts-catalog.csv",
    "modules/*.md",
    "corpus/tathi-palestrante-corpus.md"
  ],
  "curated_kb_status": "$CURATED_STATUS",
  "curated_concepts": $CURATED_CONCEPTS
}
EOM

cat > "$READY_MD" << EOM
# Pacote Pronto para Sculpt — Tathi Deândhela (Palestrante Memorável)

## Status
- Transcrições validadas: $TOTAL_FILES
- Total de palavras: $TOTAL_WORDS
- Total de caracteres: $TOTAL_CHARS
- Data de geração: $(date '+%Y-%m-%d %H:%M:%S')
- Formato canônico para ingestão: $CANONICAL_FORMAT

## Arquivos principais
- Catálogo completo: $CATALOG
- Resumo por módulo: $MODULE_SUMMARY
- Lista de arquivos: $FILELIST
- Corpus consolidado: $CORPUS_MD
- Índices por módulo: $MODS/
- Política de ingestão: $POLICY_JSON

## Política anti-token (obrigatória)
- Ingerir apenas arquivos no formato: \`$CANONICAL_FORMAT\`
- Ignorar variantes paralelas de transcrição para evitar custo redundante
- Usar o catálogo CSV como referência de rastreabilidade por aula

## KB Curado
- Status: $CURATED_STATUS
- Conceitos curados: $CURATED_CONCEPTS
- Índice: $CURATED_INDEX
- Taxonomia: $CURATED_TAXONOMY
- Grafo: $CURATED_GRAPH

## Estrutura recomendada para ingestão no Sculpt
1. Ingerir primeiro o catálogo CSV (metadados).
2. Ingerir os índices de módulo para contexto macro.
3. Ingerir o corpus consolidado por blocos (ou usar filelist para ingestão item-a-item).
4. Aplicar camada editorial/curadoria por tema após indexação.

## Observação
As fases AIOS de delegação "/transcript-sculptor", "/video-content-distillery" e "/knowledge-base-builder" dependem do runtime de agentes e quota externa; este pacote garante continuidade local imediata no Sculpt com 100% do conteúdo transcrito.
EOM

echo "DONE"
echo "READY_MD=$READY_MD"
echo "CATALOG=$CATALOG"
echo "MODULE_SUMMARY=$MODULE_SUMMARY"
echo "CORPUS_MD=$CORPUS_MD"
