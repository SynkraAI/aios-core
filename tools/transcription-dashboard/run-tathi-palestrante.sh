#!/bin/bash
# Batch transcription: Tathi Deândhela - Palestrante Memorável (79 vídeos)
# Processes all MP4 files sequentially, updates dashboard JSON in real-time
# Usage: bash run-tathi-palestrante.sh

DASHBOARD_DIR="/Users/luizfosc/aios-core/tools/transcription-dashboard"
STATUS_FILE="${DASHBOARD_DIR}/transcription-status.json"
MODEL="medium"
LANGUAGE="pt"

SRC="/Users/luizfosc/Dropbox/Dropbox Particular Fosc/Cursos ONLINE/Tathi Deandhela - Palestrante Memorável"
OUT="/Users/luizfosc/Dropbox/Dropbox Particular Fosc/+PROJETOS Palestras + Mágicas/LUIZFOSC/CURSOS E TRANSCRIÇÕES/Tathi Deândhela/Palestrante Memorável"

# Queue: slug|source_subpath|output_subdir|display_name
QUEUE=(
  # --- Módulo 0: Boas Vindas (3) ---
  "m0-01|0 Boas vindas/1 Introdução.mp4|00-boas-vindas/01-introducao|[M0] Introdução"
  "m0-02|0 Boas vindas/2 Pesquisa.mp4|00-boas-vindas/02-pesquisa|[M0] Pesquisa"
  "m0-03|0 Boas vindas/3 Tutorial de acesso.mp4|00-boas-vindas/03-tutorial-acesso|[M0] Tutorial de Acesso"

  # --- Módulo 1: Posicionar (8) ---
  "m1-01|Mod 1 Posicionar/1 Como otimizar.mp4|01-posicionar/01-como-otimizar|[M1] Como Otimizar"
  "m1-02|Mod 1 Posicionar/2 Primeiros passos.mp4|01-posicionar/02-primeiros-passos|[M1] Primeiros Passos"
  "m1-03|Mod 1 Posicionar/3 Ciclo de ouro.mp4|01-posicionar/03-ciclo-de-ouro|[M1] Ciclo de Ouro"
  "m1-04|Mod 1 Posicionar/4 Definição tema.mp4|01-posicionar/04-definicao-tema|[M1] Definição Tema"
  "m1-05|Mod 1 Posicionar/5 O seu diferencial.mp4|01-posicionar/05-seu-diferencial|[M1] O Seu Diferencial"
  "m1-06|Mod 1 Posicionar/6 Formas de aumentar a criatividade.mp4|01-posicionar/06-aumentar-criatividade|[M1] Formas de Aumentar a Criatividade"
  "m1-07|Mod 1 Posicionar/7 Como você quer ser visto.mp4|01-posicionar/07-como-quer-ser-visto|[M1] Como Você Quer Ser Visto"
  "m1-08|Mod 1 Posicionar/8 Eneagrama com Jane Rocha.mp4|01-posicionar/08-eneagrama-jane-rocha|[M1] Eneagrama com Jane Rocha"

  # --- Módulo 2: Empoderar (14) ---
  "m2-01|Mod 2 Empoderar/1 Empoderar.mp4|02-empoderar/01-empoderar|[M2] Empoderar"
  "m2-02|Mod 2 Empoderar/2 Empoderar 2.mp4|02-empoderar/02-empoderar-2|[M2] Empoderar 2"
  "m2-03|Mod 2 Empoderar/3 Participação Antoune Nakkhle 1 de 4.mp4|02-empoderar/03-antoune-nakkhle-1|[M2] Antoune Nakkhle 1/4"
  "m2-04|Mod 2 Empoderar/4 Participação Antoune Nakkhle 2 de 4.mp4|02-empoderar/04-antoune-nakkhle-2|[M2] Antoune Nakkhle 2/4"
  "m2-05|Mod 2 Empoderar/5 Participação Antoune Nakkhle 3 de 4.mp4|02-empoderar/05-antoune-nakkhle-3|[M2] Antoune Nakkhle 3/4"
  "m2-06|Mod 2 Empoderar/6 Participação Antoune Nakkhle 4 de 4.mp4|02-empoderar/06-antoune-nakkhle-4|[M2] Antoune Nakkhle 4/4"
  "m2-07|Mod 2 Empoderar/7 Participação de Eduardo Beraldi Youtube.mp4|02-empoderar/07-eduardo-beraldi|[M2] Eduardo Beraldi"
  "m2-08|Mod 2 Empoderar/8 Participação de Maurício Sita.mp4|02-empoderar/08-mauricio-sita|[M2] Maurício Sita"
  "m2-09|Mod 2 Empoderar/9 Palestrar.mp4|02-empoderar/09-palestrar|[M2] Palestrar"
  "m2-10|Mod 2 Empoderar/10 Memorável.mp4|02-empoderar/10-memoravel|[M2] Memorável"
  "m2-11|Mod 2 Empoderar/11 Aula 11.mp4|02-empoderar/11-aula-11|[M2] Aula 11"
  "m2-12|Mod 2 Empoderar/12 Estratégias com Instagran.mp4|02-empoderar/12-estrategias-instagram|[M2] Estratégias com Instagram"
  "m2-13|Mod 2 Empoderar/13 Consultoria Linkedin.mp4|02-empoderar/13-consultoria-linkedin|[M2] Consultoria LinkedIn"
  "m2-14|Mod 2 Empoderar/14 Aula sobre Linkedin.mp4|02-empoderar/14-aula-linkedin|[M2] Aula sobre LinkedIn"

  # --- Módulo 3: Aperfeiçoar (10) ---
  "m3-01|Mod 3 Aperfeiçoar/Aula 1.mp4|03-aperfeicoar/01-aula-1|[M3] Aula 1"
  "m3-02|Mod 3 Aperfeiçoar/Aula 2.mp4|03-aperfeicoar/02-aula-2|[M3] Aula 2"
  "m3-03|Mod 3 Aperfeiçoar/Aula 3.mp4|03-aperfeicoar/03-aula-3|[M3] Aula 3"
  "m3-04|Mod 3 Aperfeiçoar/Aula 4 Estrutura da palestra.mp4|03-aperfeicoar/04-estrutura-palestra|[M3] Estrutura da Palestra"
  "m3-05|Mod 3 Aperfeiçoar/Aula 5 Roteiro de palestra.mp4|03-aperfeicoar/05-roteiro-palestra|[M3] Roteiro de Palestra"
  "m3-06|Mod 3 Aperfeiçoar/Aula 6 Apresentação de Slide.mp4|03-aperfeicoar/06-apresentacao-slide|[M3] Apresentação de Slide"
  "m3-07|Mod 3 Aperfeiçoar/Aula 7 Slides com o aluno Marcelo Redol.mp4|03-aperfeicoar/07-slides-marcelo-redol|[M3] Slides - Marcelo Redol"
  "m3-08|Mod 3 Aperfeiçoar/Aula 8 Slides e comunicação.mp4|03-aperfeicoar/08-slides-comunicacao|[M3] Slides e Comunicação"
  "m3-09|Mod 3 Aperfeiçoar/Aula 9 Saúde Vocal.mp4|03-aperfeicoar/09-saude-vocal|[M3] Saúde Vocal"
  "m3-10|Mod 3 Aperfeiçoar/Aula 10 The Speakers Brasil.mp4|03-aperfeicoar/10-the-speakers-brasil|[M3] The Speakers Brasil"

  # --- Módulo 4: Vender (9) ---
  "m4-01|Mod 4 Vender/1 Introdução.mp4|04-vender/01-introducao|[M4] Introdução"
  "m4-02|Mod 4 Vender/2 Persuasão nas Vendas Apresentação.mp4|04-vender/02-persuasao-apresentacao|[M4] Persuasão - Apresentação"
  "m4-03|Mod 4 Vender/3 Persuasão nas Vendas Reciprocidade.mp4|04-vender/03-persuasao-reciprocidade|[M4] Persuasão - Reciprocidade"
  "m4-04|Mod 4 Vender/4 Persuasão nas vendas afinidade.mp4|04-vender/04-persuasao-afinidade|[M4] Persuasão - Afinidade"
  "m4-05|Mod 4 Vender/5 Persuasão nas Vendas Autoridade.mp4|04-vender/05-persuasao-autoridade|[M4] Persuasão - Autoridade"
  "m4-06|Mod 4 Vender/6 Persuasão nas Vendas Coerência.mp4|04-vender/06-persuasao-coerencia|[M4] Persuasão - Coerência"
  "m4-07|Mod 4 Vender/7 Persuasão nas vendas Escassez.mp4|04-vender/07-persuasao-escassez|[M4] Persuasão - Escassez"
  "m4-08|Mod 4 Vender/8 Persuasão nas vendas Prova social.mp4|04-vender/08-persuasao-prova-social|[M4] Persuasão - Prova Social"
  "m4-09|Mod 4 Vender/Aula 9 Vender para empresas.mp4|04-vender/09-vender-empresas|[M4] Vender para Empresas"

  # --- Módulo 5: Consolidar (2) ---
  "m5-01|Mod 5 Consolidar/Aula 1.mp4|05-consolidar/01-aula-1|[M5] Aula 1"
  "m5-02|Mod 5 Consolidar/Aula 2 Dicas de Contabilidade.mp4|05-consolidar/02-dicas-contabilidade|[M5] Dicas de Contabilidade"

  # --- Aulas Bônus Avulsas (10) ---
  "bonus-01|Aulas Bônus/Avaliação de palestra Daniel Godri.mp4|06-aulas-bonus/01-avaliacao-daniel-godri|[Bônus] Avaliação - Daniel Godri"
  "bonus-02|Aulas Bônus/Bônus Avaliação Palestra (Maurício Louzada).mp4|06-aulas-bonus/02-avaliacao-mauricio-louzada|[Bônus] Avaliação - Maurício Louzada"
  "bonus-03|Aulas Bônus/Como produzir um evento ao vivo.mp4|06-aulas-bonus/03-produzir-evento-ao-vivo|[Bônus] Como Produzir Evento ao Vivo"
  "bonus-04|Aulas Bônus/Como ser um afiliado.mp4|06-aulas-bonus/04-como-ser-afiliado|[Bônus] Como Ser um Afiliado"
  "bonus-05|Aulas Bônus/Como trabalhar com permuta e indicações.mp4|06-aulas-bonus/05-permuta-indicacoes|[Bônus] Permuta e Indicações"
  "bonus-06|Aulas Bônus/Como transformar pessoas comuns em marcas poderosas.mp4|06-aulas-bonus/06-marcas-poderosas|[Bônus] Marcas Poderosas"
  "bonus-07|Aulas Bônus/Crie textos matadores para sua oferta.mp4|06-aulas-bonus/07-textos-matadores|[Bônus] Textos Matadores"
  "bonus-08|Aulas Bônus/Gamificação com Nayra Karine.mp4|06-aulas-bonus/08-gamificacao-nayra-karine|[Bônus] Gamificação - Nayra Karine"
  "bonus-09|Aulas Bônus/Jeito Disney de palestrar.mp4|06-aulas-bonus/09-jeito-disney|[Bônus] Jeito Disney de Palestrar"
  "bonus-10|Aulas Bônus/Sandro San Pit de vendas.mp4|06-aulas-bonus/10-sandro-san-pit-vendas|[Bônus] Sandro San - Pit de Vendas"

  # --- Bônus: Do Zero ao Palestrante (4) ---
  "zero-01|BÔNUS/Bonus Do zero ao palestrante/1 A estrutura da palestra.mp4|07-bonus-zero-ao-palestrante/01-estrutura-palestra|[Zero→Palestrante] Estrutura da Palestra"
  "zero-02|BÔNUS/Bonus Do zero ao palestrante/2 Revisão de conteúdos.mp4|07-bonus-zero-ao-palestrante/02-revisao-conteudos|[Zero→Palestrante] Revisão de Conteúdos"
  "zero-03|BÔNUS/Bonus Do zero ao palestrante/3 Palestrante.mp4|07-bonus-zero-ao-palestrante/03-palestrante|[Zero→Palestrante] Palestrante"
  "zero-04|BÔNUS/Bonus Do zero ao palestrante/4 Bônus.mp4|07-bonus-zero-ao-palestrante/04-bonus|[Zero→Palestrante] Bônus"

  # --- Bônus: Time Model Canvas (16) ---
  "tmc-01|BÔNUS/Bônus Time model Canvas/Aula 1.mp4|08-bonus-time-model-canvas/01-aula-1|[TMC] Aula 1"
  "tmc-02|BÔNUS/Bônus Time model Canvas/Aula 2.mp4|08-bonus-time-model-canvas/02-aula-2|[TMC] Aula 2"
  "tmc-03|BÔNUS/Bônus Time model Canvas/Aula 3.mp4|08-bonus-time-model-canvas/03-aula-3|[TMC] Aula 3"
  "tmc-04|BÔNUS/Bônus Time model Canvas/Aula 4.mp4|08-bonus-time-model-canvas/04-aula-4|[TMC] Aula 4"
  "tmc-05|BÔNUS/Bônus Time model Canvas/Aula 5.mp4|08-bonus-time-model-canvas/05-aula-5|[TMC] Aula 5"
  "tmc-06|BÔNUS/Bônus Time model Canvas/Aula 6.mp4|08-bonus-time-model-canvas/06-aula-6|[TMC] Aula 6"
  "tmc-07|BÔNUS/Bônus Time model Canvas/Aula 7.mp4|08-bonus-time-model-canvas/07-aula-7|[TMC] Aula 7"
  "tmc-08|BÔNUS/Bônus Time model Canvas/Aula 8.mp4|08-bonus-time-model-canvas/08-aula-8|[TMC] Aula 8"
  "tmc-09|BÔNUS/Bônus Time model Canvas/Aula 9.mp4|08-bonus-time-model-canvas/09-aula-9|[TMC] Aula 9"
  "tmc-10|BÔNUS/Bônus Time model Canvas/Aula 10.mp4|08-bonus-time-model-canvas/10-aula-10|[TMC] Aula 10"
  "tmc-11|BÔNUS/Bônus Time model Canvas/Aula 11.mp4|08-bonus-time-model-canvas/11-aula-11|[TMC] Aula 11"
  "tmc-12|BÔNUS/Bônus Time model Canvas/Aula 12.mp4|08-bonus-time-model-canvas/12-aula-12|[TMC] Aula 12"
  "tmc-13|BÔNUS/Bônus Time model Canvas/Aula 13.mp4|08-bonus-time-model-canvas/13-aula-13|[TMC] Aula 13"
  "tmc-14|BÔNUS/Bônus Time model Canvas/Time model na prática Aula 1.mp4|08-bonus-time-model-canvas/14-pratica-aula-1|[TMC] Prática Aula 1"
  "tmc-15|BÔNUS/Bônus Time model Canvas/Time model na prática Aula 2.mp4|08-bonus-time-model-canvas/15-pratica-aula-2|[TMC] Prática Aula 2"
  "tmc-16|BÔNUS/Bônus Time model Canvas/Time model na prática Aula 3.mp4|08-bonus-time-model-canvas/16-pratica-aula-3|[TMC] Prática Aula 3"

  # --- PGG Experience (3) ---
  "pgg-01|PGG Experiencie/Abertura.mp4|09-pgg-experience/01-abertura|[PGG] Abertura"
  "pgg-02|PGG Experiencie/PPG Experience 2019 - Tathiane Deândhela (Palestra 1).mp4|09-pgg-experience/02-tathiane-palestra-1|[PGG] Tathiane Deândhela - Palestra 1"
  "pgg-03|PGG Experiencie/PPG Experience 2019- Pablo Paucar (Palestra 2).mp4|09-pgg-experience/03-pablo-paucar-palestra-2|[PGG] Pablo Paucar - Palestra 2"
)

TOTAL_VIDEOS=${#QUEUE[@]}
COMPLETED=0
FAILED=0
SKIPPED=0

# Track status per queue item
declare -a ITEM_STATUS
for i in $(seq 0 $((TOTAL_VIDEOS - 1))); do
  ITEM_STATUS[$i]="pending"
done

RECENT_JSON='[]'

build_queue_json() {
  local result="["
  local first=true
  for i in $(seq 0 $((TOTAL_VIDEOS - 1))); do
    IFS='|' read -r slug source_sub output_sub display_name <<< "${QUEUE[$i]}"
    local status="${ITEM_STATUS[$i]}"
    if [ "$first" = true ]; then
      first=false
    else
      result+=","
    fi
    # Escape quotes in display_name
    local safe_name=$(echo "$display_name" | sed 's/"/\\"/g')
    result+="{\"name\":\"${safe_name}\",\"status\":\"${status}\"}"
  done
  result+="]"
  echo "$result"
}

update_status() {
  local current_name="$1"
  local is_running="$2"
  local remaining=$((TOTAL_VIDEOS - COMPLETED - FAILED - SKIPPED))
  local pct=0
  if [ $TOTAL_VIDEOS -gt 0 ]; then
    pct=$(echo "scale=1; ($COMPLETED + $SKIPPED) * 100 / $TOTAL_VIDEOS" | bc)
  fi
  local eta_hours=$(echo "scale=1; $remaining * 0.25" | bc)
  local queue_json=$(build_queue_json)
  local safe_current=$(echo "$current_name" | sed 's/"/\\"/g')

  cat > "$STATUS_FILE" << ENDJSON
{
  "service": "Palestrante Memor\u00e1vel \u2014 Tathi De\u00e2ndhela",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%S)",
  "total_videos": ${TOTAL_VIDEOS},
  "completed": $((COMPLETED + SKIPPED)),
  "failed": ${FAILED},
  "remaining": ${remaining},
  "percent": ${pct},
  "estimated_hours_remaining": ${eta_hours},
  "is_running": ${is_running},
  "current": "${safe_current}",
  "queue": ${queue_json},
  "recent_transcriptions": ${RECENT_JSON}
}
ENDJSON
}

add_recent() {
  local name="$1"
  local size_mb="$2"
  local time_str=$(date +%H:%M)

  RECENT_JSON=$(echo "$RECENT_JSON" | python3 -c "
import json, sys
data = json.load(sys.stdin)
data.insert(0, {'name': '${name}', 'size_mb': ${size_mb}, 'time': '${time_str}'})
print(json.dumps(data[:8]))
")
}

LOG_FILE="${DASHBOARD_DIR}/tathi-palestrante.log"

echo "============================================" | tee "$LOG_FILE"
echo "PALESTRANTE MEMORÁVEL — BATCH TRANSCRIPTION" | tee -a "$LOG_FILE"
echo "Start: $(date)" | tee -a "$LOG_FILE"
echo "Queue: ${TOTAL_VIDEOS} videos" | tee -a "$LOG_FILE"
echo "Model: ${MODEL} | Language: ${LANGUAGE}" | tee -a "$LOG_FILE"
echo "Source: ${SRC}" | tee -a "$LOG_FILE"
echo "Output: ${OUT}" | tee -a "$LOG_FILE"
echo "============================================" | tee -a "$LOG_FILE"

# Initial status
update_status "Starting..." "true"

for i in $(seq 0 $((TOTAL_VIDEOS - 1))); do
  IFS='|' read -r slug source_sub output_sub display_name <<< "${QUEUE[$i]}"
  NUM=$((i + 1))
  source_file="${SRC}/${source_sub}"
  output_dir="${OUT}/${output_sub}"

  echo "" | tee -a "$LOG_FILE"
  echo "[${NUM}/${TOTAL_VIDEOS}] ${display_name}" | tee -a "$LOG_FILE"
  echo "  Source: ${source_file}" | tee -a "$LOG_FILE"
  echo "  Output: ${output_dir}" | tee -a "$LOG_FILE"
  echo "  Started: $(date)" | tee -a "$LOG_FILE"

  # Skip if already transcribed (check both legacy nested path and flat path)
  if [ -f "${output_dir}/transcription_clean.md" ] || [ -f "${output_dir}/transcription_clean.json/transcription_clean.md" ]; then
    echo "  SKIP — Already transcribed" | tee -a "$LOG_FILE"
    SKIPPED=$((SKIPPED + 1))
    ITEM_STATUS[$i]="done"
    update_status "${display_name} (skipped)" "true"
    continue
  fi

  # Check source file exists
  if [ ! -f "${source_file}" ]; then
    echo "  ❌ MISSING SOURCE: ${source_file}" | tee -a "$LOG_FILE"
    FAILED=$((FAILED + 1))
    ITEM_STATUS[$i]="failed"
    update_status "${display_name} (missing)" "true"
    continue
  fi

  mkdir -p "${output_dir}"
  ITEM_STATUS[$i]="active"
  update_status "${display_name}" "true"

  # Step 1: Transcribe
  if video-transcriber transcribe "${source_file}" -o "${output_dir}/transcription.json" -m "${MODEL}" -l "${LANGUAGE}" >> "$LOG_FILE" 2>&1; then
    echo "  ✅ Transcribe OK" | tee -a "$LOG_FILE"

    # Step 2: Clean (outputs transcription_clean.json + transcription_clean.md into output_dir)
    video-transcriber clean "${output_dir}/transcription.json" -o "${output_dir}" >> "$LOG_FILE" 2>&1

    # Step 3: Chunk from clean JSON
    if [ -f "${output_dir}/transcription_clean.json" ]; then
      video-transcriber chunk "${output_dir}/transcription_clean.json" -o "${output_dir}/chunks" >> "$LOG_FILE" 2>&1
    fi

    echo "  ✅ SUCCESS: ${display_name}" | tee -a "$LOG_FILE"
    COMPLETED=$((COMPLETED + 1))
    ITEM_STATUS[$i]="done"
    size_mb=$(du -m "${output_dir}/transcription_clean.md" 2>/dev/null | awk '{print $1}' || echo "0")
    add_recent "${display_name}" "${size_mb:-0}"
  else
    echo "  ❌ FAILED: ${display_name}" | tee -a "$LOG_FILE"
    FAILED=$((FAILED + 1))
    ITEM_STATUS[$i]="failed"
  fi

  update_status "${display_name}" "true"
  echo "  Finished: $(date)" | tee -a "$LOG_FILE"
done

update_status "Queue complete" "false"

echo "" | tee -a "$LOG_FILE"
echo "============================================" | tee -a "$LOG_FILE"
echo "BATCH COMPLETE" | tee -a "$LOG_FILE"
echo "End: $(date)" | tee -a "$LOG_FILE"
echo "Transcribed: ${COMPLETED}/${TOTAL_VIDEOS}" | tee -a "$LOG_FILE"
echo "Skipped: ${SKIPPED}/${TOTAL_VIDEOS}" | tee -a "$LOG_FILE"
echo "Failed: ${FAILED}/${TOTAL_VIDEOS}" | tee -a "$LOG_FILE"
echo "============================================" | tee -a "$LOG_FILE"
