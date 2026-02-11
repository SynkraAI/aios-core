#!/usr/bin/env bash
# Batch download - subtitles + materials for 20 courses
# Output: /Users/luizfosc/Dropbox/Downloads/Cursos/

set -euo pipefail

TOOL_DIR="$HOME/aios-core/tools/hotmart-downloader"
OUTPUT_DIR="/Users/luizfosc/Dropbox/Downloads/Cursos"
LOG_FILE="$TOOL_DIR/batch-download.log"
VENV="$TOOL_DIR/.venv/bin/activate"

source "$VENV"
cd "$TOOL_DIR"

export HOTMART_OUTPUT_DIR="$OUTPUT_DIR"

log() {
  echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

download_subs_mat() {
  local subdomain="$1"
  local pid="$2"
  local name="$3"
  log "START: $name (subdomain=$subdomain, pid=$pid) [subs+mat]"
  if hotmart-dl download -c "$subdomain" -p "$pid" --subs-only --mat 2>&1 | tee -a "$LOG_FILE"; then
    log "DONE: $name"
  else
    log "FAIL: $name (exit code $?)"
  fi
  echo "" >> "$LOG_FILE"
}

download_mat_only() {
  local subdomain="$1"
  local pid="$2"
  local name="$3"
  log "START: $name (subdomain=$subdomain, pid=$pid) [mat-only]"
  if hotmart-dl download -c "$subdomain" -p "$pid" --mat-only 2>&1 | tee -a "$LOG_FILE"; then
    log "DONE: $name"
  else
    log "FAIL: $name (exit code $?)"
  fi
  echo "" >> "$LOG_FILE"
}

log "========================================="
log "Batch download started"
log "Output: $OUTPUT_DIR"
log "========================================="

# 1. Fórmula High Ticket - MATERIALS ONLY (fastest, no browser)
download_mat_only "blackfridayinfinita" "4630341" "Fórmula High Ticket"

# 2-20. Subtitles + Materials
download_subs_mat "maquina-7d" "5725560" "Pitch de 100 Milhões - VITALÍCIO"
download_subs_mat "maquina-7d" "5447391" "Pitch de 100 Milhões"
download_subs_mat "3funishighticket" "4178748" "Os 3 Funis High Ticket"
download_subs_mat "blackfridayinfinita" "4594918" "Stories 10x"
download_subs_mat "blackfridayinfinita" "6145661" "Pronto para vender"
download_subs_mat "blackfridayinfinita" "6219036" "Seu produto pronto"
download_subs_mat "blackfridayinfinita" "6145723" "Tráfego Pronto"
download_subs_mat "blackfridayinfinita" "4594958" "Fórmula de Lançamento"
download_subs_mat "blackfridayinfinita" "4594934" "WhatsApp 10x"
download_subs_mat "blackfridayinfinita" "4594931" "Crescimento 10x"
download_subs_mat "blackfridayinfinita" "4644115" "Mentalidade Black"
download_subs_mat "blackfridayinfinita" "4653362" "Filosofia Ladeira"
download_subs_mat "blackfridayinfinita" "4594928" "Conversão 10x"
download_subs_mat "blackfridayinfinita" "4594911" "Light Copy"
download_subs_mat "blackfridayinfinita" "4594939" "Venda Todo Santo Dia"
download_subs_mat "blackfridayinfinita" "4594936" "SuperAds"
download_subs_mat "mamaefalei" "474169" "A Batalha do Sucesso"
download_subs_mat "superleiturarapida" "1411374" "Super Leitura Rápida"
download_subs_mat "superleituras" "1092366" "Areté - Destravando a Excelência"

log "========================================="
log "Batch download COMPLETE"
log "========================================="
