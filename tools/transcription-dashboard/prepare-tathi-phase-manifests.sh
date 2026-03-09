#!/bin/bash
set -euo pipefail

ROOT="/Users/luizfosc/Dropbox/Dropbox Particular Fosc/+PROJETOS Palestras + Mágicas/LUIZFOSC/CURSOS E TRANSCRIÇÕES/Tathi Deândhela/Palestrante Memorável"
PIPE="$ROOT/_pipeline"
MANI="$PIPE/manifests"

mkdir -p "$MANI"

SCULPT_JOBS="$MANI/sculpt-jobs.csv"
DISTILL_JOBS="$MANI/distill-jobs.csv"
KB_MATERIALS="$MANI/kb-materials.txt"
SCULPT_COMMANDS="$MANI/sculpt-commands.txt"
DISTILL_COMMANDS="$MANI/distill-commands.txt"
KB_COMMANDS="$MANI/kb-commands.txt"

printf "transcription_clean_md,sculpt_output_dir\n" > "$SCULPT_JOBS"
printf "masterpiece_md,distill_output_dir\n" > "$DISTILL_JOBS"
: > "$KB_MATERIALS"
: > "$SCULPT_COMMANDS"
: > "$DISTILL_COMMANDS"
: > "$KB_COMMANDS"

while IFS= read -r tpath; do
  rel="${tpath#$ROOT/}"
  rel_dir="${rel%/transcription_clean.md}"

  sculpt_out="$ROOT/sculpt/$rel_dir"
  distill_out="$ROOT/distill/$rel_dir"
  masterpiece="$sculpt_out/masterpiece.md"

  mkdir -p "$sculpt_out" "$distill_out"

  printf "%s,%s\n" "$tpath" "$sculpt_out" >> "$SCULPT_JOBS"
  printf "%s,%s\n" "$masterpiece" "$distill_out" >> "$DISTILL_JOBS"
  printf "%s\n" "$masterpiece" >> "$KB_MATERIALS"
  printf "/transcript-sculptor:process \"%s\" \"%s\"\n" "$tpath" "$sculpt_out" >> "$SCULPT_COMMANDS"
  printf "/video-content-distillery:distill \"%s\" \"%s\"\n" "$masterpiece" "$distill_out" >> "$DISTILL_COMMANDS"
done < <(find "$ROOT" -type f -name 'transcription_clean.md' \
  -not -path "$ROOT/sculpt/*" \
  -not -path "$ROOT/distill/*" \
  -not -path "$ROOT/kb/*" \
  -not -path "$ROOT/_pipeline/*" | sort)

printf "/knowledge-base-builder:ingest \"%s/sculpt\" \"%s/kb\"\n" "$ROOT" "$ROOT" > "$KB_COMMANDS"

wc -l "$SCULPT_JOBS" "$DISTILL_JOBS" "$KB_MATERIALS"
echo "Generated:"
echo "- $SCULPT_JOBS"
echo "- $DISTILL_JOBS"
echo "- $KB_MATERIALS"
echo "- $SCULPT_COMMANDS"
echo "- $DISTILL_COMMANDS"
echo "- $KB_COMMANDS"
