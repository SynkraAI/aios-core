#!/bin/bash
# ascii-banner-forge: generate.sh
# Main engine — converts images to terminal ASCII art using chafa
# Usage: generate.sh <mode> <input> [options]
#
# Modes:
#   banner <image> [--name NAME] [--category CAT] [--speed fast|normal|slow]
#   asset  <image> [--preset NAME | --size WxH] [--output PATH]
#   live   <image|catalog-name> [--preset NAME | --size WxH]
#   catalog [--tag TAG]
#   presets [--preview]
#   hook   <random|NAME|off>

set -euo pipefail

# ── Paths ──
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
BANNERS_DIR="$HOME/aios-core/banners"
NOVOS_DIR="$BANNERS_DIR/NOVOS"
ASSETS_DIR="$BANNERS_DIR/NOVOS/assets"
OUTPUTS_DIR="$BANNERS_DIR/Outputs"
PRESET_PREVIEWS_DIR="$SKILL_DIR/assets/preset-previews"

NC='\033[0m'
BOLD='\033[1m'
DIM='\033[2m'
YELLOW='\033[38;5;220m'
GREEN='\033[38;5;46m'
CYAN='\033[38;5;51m'
RED='\033[38;5;196m'
MAGENTA='\033[38;5;201m'

# ── Presets ──
# Format: NAME:WIDTHxHEIGHT:DESCRIPTION
PRESETS=(
  "fullscreen:197x99:Banner de sessao (tela cheia)"
  "compact:80x24:Terminal padrao"
  "wide:120x40:Splash screen"
  "mini:40x20:Icone / avatar"
  "square:60x60:1:1 (estilo Instagram)"
  "cinema:120x50:16:9 (estilo YouTube)"
  "story:40x71:9:16 (estilo Stories)"
  "banner-horizontal:120x30:Banner largo (header/footer)"
  "thumbnail:60x34:Miniatura (preview)"
)

# ── Helpers ──
check_chafa() {
  if ! command -v chafa &>/dev/null; then
    echo -e "${RED}Erro:${NC} chafa nao encontrado."
    echo -e "Instale com: ${CYAN}brew install chafa${NC}"
    exit 1
  fi
}

get_preset() {
  local name="$1"
  for p in "${PRESETS[@]}"; do
    local pname="${p%%:*}"
    if [[ "$pname" == "$name" ]]; then
      echo "$p"
      return 0
    fi
  done
  echo ""
  return 1
}

get_preset_size() {
  local preset_str="$1"
  local rest="${preset_str#*:}"
  echo "${rest%%:*}"
}

get_preset_desc() {
  local preset_str="$1"
  echo "${preset_str##*:}"
}

resolve_size() {
  local preset="" size=""
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --preset) preset="$2"; shift 2 ;;
      --size) size="$2"; shift 2 ;;
      *) shift ;;
    esac
  done

  if [[ -n "$size" ]]; then
    echo "$size"
  elif [[ -n "$preset" ]]; then
    local p
    p=$(get_preset "$preset")
    if [[ -z "$p" ]]; then
      echo -e "${RED}Preset '$preset' nao encontrado.${NC}" >&2
      echo "197x99"
    else
      get_preset_size "$p"
    fi
  else
    echo "197x99"  # default fullscreen
  fi
}

resolve_input() {
  local input="$1"
  # Check if it's a catalog name (no path separator, no extension)
  if [[ "$input" != */* && "$input" != *.* ]]; then
    # Search in assets
    local found=""
    for ext in asc; do
      if [[ -f "$ASSETS_DIR/$input.$ext" ]]; then
        found="$ASSETS_DIR/$input.$ext"
        break
      fi
    done
    # Search in main banners assets
    if [[ -z "$found" ]]; then
      for ext in asc; do
        if [[ -f "$BANNERS_DIR/assets/$input.$ext" ]]; then
          found="$BANNERS_DIR/assets/$input.$ext"
          break
        fi
      done
    fi
    if [[ -n "$found" ]]; then
      echo "$found"
    else
      echo -e "${RED}Arte '$input' nao encontrada no catalogo.${NC}" >&2
      exit 1
    fi
  else
    if [[ ! -f "$input" ]]; then
      echo -e "${RED}Arquivo nao encontrado: $input${NC}" >&2
      exit 1
    fi
    echo "$input"
  fi
}

is_image_file() {
  local f="$1"
  local ext="${f##*.}"
  ext=$(echo "$ext" | tr '[:upper:]' '[:lower:]')
  case "$ext" in
    jpg|jpeg|png|gif|bmp|tiff|tif|webp|heic|heif|svg|asc) return 0 ;;
    *) return 1 ;;
  esac
}

is_asc_file() {
  local f="$1"
  local ext="${f##*.}"
  ext=$(echo "$ext" | tr '[:upper:]' '[:lower:]')
  [[ "$ext" == "asc" ]]
}

# ── Mode: banner ──
mode_banner() {
  local input="" name="" category="custom" speed="normal"
  shift  # remove "banner"

  # Parse args
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --name) name="$2"; shift 2 ;;
      --category) category="$2"; shift 2 ;;
      --speed) speed="$2"; shift 2 ;;
      -*) shift 2 ;;
      *) input="$1"; shift ;;
    esac
  done

  if [[ -z "$input" ]]; then
    echo -e "${RED}Uso: generate.sh banner <imagem> [--name NAME] [--category CAT] [--speed fast|normal|slow]${NC}"
    exit 1
  fi

  check_chafa

  local resolved
  resolved=$(resolve_input "$input")

  # Derive name from filename if not provided
  if [[ -z "$name" ]]; then
    name=$(basename "$resolved")
    name="${name%.*}"
  fi

  # Set speed delay
  local delay
  case "$speed" in
    fast) delay="0.02" ;;
    slow) delay="0.10" ;;
    *) delay="0.06" ;;
  esac

  # Generate .asc if input is an image (not already .asc)
  local asc_path
  if is_asc_file "$resolved"; then
    asc_path="$resolved"
    # Copy to assets if not already there
    if [[ "$resolved" != "$ASSETS_DIR"/* ]]; then
      cp "$resolved" "$ASSETS_DIR/$(basename "$resolved")"
      asc_path="$ASSETS_DIR/$(basename "$resolved")"
    fi
  else
    mkdir -p "$ASSETS_DIR"
    asc_path="$ASSETS_DIR/${name}.asc"
    echo -e "${CYAN}Convertendo imagem para ASCII art...${NC}"
    chafa --format=symbols --size=197x99 --color-space=din99d "$resolved" > "$asc_path"
    echo -e "${GREEN}Asset gerado:${NC} $asc_path"
  fi

  # Generate banner script
  mkdir -p "$OUTPUTS_DIR"
  local banner_path="$OUTPUTS_DIR/(${category})-${name}-banner.sh"

  cat > "$banner_path" << 'BANNER_HEADER'
#!/bin/bash
NC='\033[0m'
GREEN='\033[0;32m'
WHITE='\033[1;37m'
luizfosc_logo() {
echo ""
echo -e "\033[38;5;196m ██╗     ██╗   ██╗██╗███████╗    ███████╗ ██████╗ ███████╗ ██████╗\033[0m"
echo -e "\033[38;5;208m ██║     ██║   ██║██║╚══███╔╝    ██╔════╝██╔═══██╗██╔════╝██╔════╝\033[0m"
echo -e "\033[38;5;220m ██║     ██║   ██║██║  ███╔╝     █████╗  ██║   ██║███████╗██║     \033[0m"
echo -e "\033[38;5;46m ██║     ██║   ██║██║ ███╔╝      ██╔══╝  ██║   ██║╚════██║██║     \033[0m"
echo -e "\033[38;5;51m ███████╗╚██████╔╝██║███████╗    ██║     ╚██████╔╝███████║╚██████╗\033[0m"
echo -e "\033[38;5;201m ╚══════╝ ╚═════╝ ╚═╝╚══════╝    ╚═╝      ╚═════╝ ╚══════╝ ╚═════╝\033[0m"
echo ""
BANNER_HEADER

  # Add dynamic art name line
  echo "echo -e \"\\033[38;5;220m 🎨 ${name} 🎨\\033[0m  \\033[1;37mAIOS Core \\033[0;32mv2.1\\033[0m\"" >> "$banner_path"
  cat >> "$banner_path" << 'BANNER_MID'
echo -e "\033[38;5;240m ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"
echo ""
}
BANNER_MID

  # Add asset path and animation
  cat >> "$banner_path" << BANNER_BODY
ASSET="\$(dirname "\$0")/../NOVOS/assets/$(basename "$asc_path")"
[ ! -f "\$ASSET" ] && ASSET="\$(dirname "\$0")/assets/$(basename "$asc_path")"
[ ! -f "\$ASSET" ] && echo "Asset not found: $(basename "$asc_path")" && exit 1
printf "\\033[?25l\\033[H\\033[2J"
while IFS= read -r line; do
  printf '%s\\n' "\$line"
  sleep ${delay}
done < "\$ASSET"
sleep 1.5
printf "\\033[H\\033[2J"
luizfosc_logo
printf "\\033[?25h"
sleep 0.8
BANNER_BODY

  chmod +x "$banner_path"

  echo ""
  echo -e "${GREEN}🎨 Banner gerado com sucesso!${NC}"
  echo ""
  echo -e "  ${BOLD}Asset:${NC}  $asc_path"
  echo -e "  ${BOLD}Script:${NC} $banner_path"
  echo -e "  ${BOLD}Speed:${NC}  $speed ($delay s/line)"
  echo ""
  echo -e "  Testar: ${CYAN}bash \"$banner_path\"${NC}"
}

# ── Mode: asset ──
mode_asset() {
  shift  # remove "asset"
  local input="" output="" preset="" size=""

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --preset) preset="$2"; shift 2 ;;
      --size) size="$2"; shift 2 ;;
      --output) output="$2"; shift 2 ;;
      -*) shift 2 ;;
      *) input="$1"; shift ;;
    esac
  done

  if [[ -z "$input" ]]; then
    echo -e "${RED}Uso: generate.sh asset <imagem> [--preset NAME | --size WxH] [--output PATH]${NC}"
    exit 1
  fi

  if [[ ! -f "$input" ]]; then
    echo -e "${RED}Arquivo nao encontrado: $input${NC}"
    exit 1
  fi

  # If input is already .asc, just copy it to output
  if is_asc_file "$input"; then
    local name
    name=$(basename "$input")
    name="${name%.*}"
    if [[ -z "$output" ]]; then
      mkdir -p "$OUTPUTS_DIR"
      output="$OUTPUTS_DIR/${name}.asc"
    fi
    cp "$input" "$output"
    local filesize lines
    filesize=$(wc -c < "$output" | tr -d ' ')
    lines=$(wc -l < "$output" | tr -d ' ')
    echo ""
    echo -e "${GREEN}Asset copiado (ja era .asc):${NC}"
    echo -e "  ${BOLD}Arquivo:${NC}  $output"
    echo -e "  ${BOLD}Tamanho:${NC} ${filesize} bytes, ${lines} linhas"
    echo -e "  ${DIM}Dica: Para redimensionar, use uma imagem fonte (JPG/PNG/HEIC), nao .asc${NC}"
    echo ""
    return
  fi

  check_chafa

  # Resolve dimensions
  local dimensions
  if [[ -n "$size" ]]; then
    dimensions="$size"
  elif [[ -n "$preset" ]]; then
    local p
    p=$(get_preset "$preset")
    if [[ -z "$p" ]]; then
      echo -e "${RED}Preset '$preset' nao encontrado. Use: generate.sh presets${NC}"
      exit 1
    fi
    dimensions=$(get_preset_size "$p")
    echo -e "${DIM}Usando preset '$preset': ${dimensions}${NC}"
  else
    dimensions="197x99"
    echo -e "${DIM}Sem preset especificado, usando fullscreen: ${dimensions}${NC}"
  fi

  # Output path
  local name
  name=$(basename "$input")
  name="${name%.*}"
  if [[ -z "$output" ]]; then
    mkdir -p "$OUTPUTS_DIR"
    output="$OUTPUTS_DIR/${name}-${dimensions}.asc"
  fi

  echo -e "${CYAN}Convertendo...${NC} ${dimensions} (${dimensions%%x*} cols x ${dimensions##*x} lines)"
  chafa --format=symbols --size="$dimensions" --color-space=din99d "$input" > "$output"

  local filesize
  filesize=$(wc -c < "$output" | tr -d ' ')
  local lines
  lines=$(wc -l < "$output" | tr -d ' ')

  echo ""
  echo -e "${GREEN}Asset gerado:${NC}"
  echo -e "  ${BOLD}Arquivo:${NC}  $output"
  echo -e "  ${BOLD}Tamanho:${NC} ${filesize} bytes, ${lines} linhas"
  echo -e "  ${BOLD}Dims:${NC}    ${dimensions}"
  echo ""
  echo -e "  Preview: ${CYAN}cat \"$output\"${NC}"
}

# ── Mode: live ──
mode_live() {
  shift  # remove "live"
  local input="" preset="" size=""

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --preset) preset="$2"; shift 2 ;;
      --size) size="$2"; shift 2 ;;
      -*) shift 2 ;;
      *) input="$1"; shift ;;
    esac
  done

  if [[ -z "$input" ]]; then
    echo -e "${RED}Uso: generate.sh live <imagem|nome-catalogo> [--preset NAME | --size WxH]${NC}"
    exit 1
  fi

  local resolved
  resolved=$(resolve_input "$input")

  # If it's already an .asc, just display it
  if is_asc_file "$resolved"; then
    cat "$resolved"
    return
  fi

  check_chafa

  local dimensions
  if [[ -n "$size" ]]; then
    dimensions="$size"
  elif [[ -n "$preset" ]]; then
    local p
    p=$(get_preset "$preset")
    if [[ -z "$p" ]]; then
      echo -e "${RED}Preset nao encontrado: $preset${NC}" >&2
      dimensions="197x99"
    else
      dimensions=$(get_preset_size "$p")
    fi
  else
    dimensions="197x99"
  fi

  chafa --format=symbols --size="$dimensions" --color-space=din99d "$resolved"
}

# ── Mode: catalog ──
mode_catalog() {
  shift  # remove "catalog"
  local tag=""

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --tag) tag="$2"; shift 2 ;;
      *) shift ;;
    esac
  done

  echo ""
  echo -e "${MAGENTA}🖼️  Catalogo de Artes ASCII${NC}"
  echo -e "${DIM}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""

  # Collect all banners into a temp file for processing (bash 3.x compatible)
  local tmpfile="/tmp/ascii-banner-forge-catalog-$$"
  local total=0

  # Scan both dirs
  for dir in "$BANNERS_DIR" "$NOVOS_DIR"; do
    for f in "$dir"/*-banner.sh; do
      [[ ! -f "$f" ]] && continue
      local bname
      bname=$(basename "$f")
      # Extract category from (category)-name pattern
      local cat_name="sem-categoria"
      local art_name="$bname"
      case "$bname" in
        \(*\)-*)
          cat_name=$(echo "$bname" | sed 's/^(\([^)]*\)).*/\1/')
          art_name=$(echo "$bname" | sed 's/^([^)]*)-//' | sed 's/-banner\.sh$//')
          ;;
        *)
          art_name="${bname%-banner.sh}"
          ;;
      esac
      # Filter by tag
      if [[ -n "$tag" && "$cat_name" != "$tag" ]]; then
        continue
      fi
      echo "${cat_name}|${art_name}" >> "$tmpfile"
      total=$((total + 1))
    done
  done

  # Count .asc assets
  local asc_count=0
  for f in "$ASSETS_DIR"/*.asc "$BANNERS_DIR"/assets/*.asc; do
    [[ -f "$f" ]] && asc_count=$((asc_count + 1))
  done

  # Display by category
  if [[ -f "$tmpfile" ]]; then
    local prev_cat=""
    sort "$tmpfile" | while IFS='|' read -r cat_name art_name; do
      if [[ "$cat_name" != "$prev_cat" ]]; then
        [[ -n "$prev_cat" ]] && echo ""
        local cat_count
        cat_count=$(grep -c "^${cat_name}|" "$tmpfile" 2>/dev/null || echo 0)
        echo -e "  ${YELLOW}[${cat_name}]${NC} ${cat_count} artes"
        printf "    ${DIM}"
        prev_cat="$cat_name"
      fi
      printf "%s  " "$art_name"
    done
    echo -e "${NC}"
    echo ""
    rm -f "$tmpfile"
  fi

  echo -e "${DIM}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "  ${BOLD}Total:${NC} ${total} banners | ${asc_count} assets .asc"
  echo ""
  echo -e "  ${CYAN}generate.sh live <nome>${NC}  para preview"
  echo -e "  ${CYAN}generate.sh catalog --tag <categoria>${NC}  para filtrar"
  echo ""
}

# ── Mode: presets ──
mode_presets() {
  shift  # remove "presets"
  local show_preview=false

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --preview) show_preview=true; shift ;;
      *) shift ;;
    esac
  done

  echo ""
  echo -e "${MAGENTA}📐 Presets Disponiveis${NC}"
  echo -e "${DIM}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""

  printf "  ${BOLD}%-20s %-12s %s${NC}\n" "PRESET" "TAMANHO" "USO"
  printf "  ${DIM}%-20s %-12s %s${NC}\n" "────────────────────" "────────────" "─────────────────────────────────"

  for p in "${PRESETS[@]}"; do
    local pname="${p%%:*}"
    local rest="${p#*:}"
    local psize="${rest%%:*}"
    local pdesc="${rest#*:}"
    printf "  ${CYAN}%-20s${NC} ${YELLOW}%-12s${NC} %s\n" "$pname" "$psize" "$pdesc"
  done

  echo ""
  echo -e "  ${DIM}Custom: --size LARGURAxALTURA${NC}"
  echo ""

  if $show_preview; then
    echo -e "${MAGENTA}Previews visuais:${NC}"
    echo ""
    for p in "${PRESETS[@]}"; do
      local pname="${p%%:*}"
      local preview_file="$PRESET_PREVIEWS_DIR/${pname}.txt"
      if [[ -f "$preview_file" ]]; then
        echo -e "  ${YELLOW}$pname:${NC}"
        cat "$preview_file"
        echo ""
      fi
    done
  fi
}

# ── Mode: hook ──
mode_hook() {
  shift  # remove "hook"
  local target="${1:-}"

  if [[ -z "$target" ]]; then
    echo -e "${RED}Uso: generate.sh hook <random|NOME|off>${NC}"
    exit 1
  fi

  local settings_file="$HOME/aios-core/.claude/settings.json"

  case "$target" in
    random)
      echo -e "${GREEN}Para configurar banner aleatorio no SessionStart:${NC}"
      echo ""
      echo "Adicione ao .claude/settings.json, dentro de \"hooks\":"
      echo ""
      echo -e "${CYAN}\"SessionStart\": [{"
      echo "  \"hooks\": [{"
      echo "    \"type\": \"command\","
      echo "    \"command\": \"bash \$(ls ~/aios-core/banners/*-banner.sh | sort -R | head -1)\","
      echo "    \"timeout\": 15"
      echo "  }]"
      echo -e "}]${NC}"
      ;;
    off)
      echo -e "${YELLOW}Para desativar, remova o bloco SessionStart do .claude/settings.json${NC}"
      ;;
    *)
      local banner_path=""
      # Find the banner
      for f in "$BANNERS_DIR"/*"$target"*-banner.sh "$NOVOS_DIR"/*"$target"*-banner.sh; do
        if [[ -f "$f" ]]; then
          banner_path="$f"
          break
        fi
      done

      if [[ -z "$banner_path" ]]; then
        echo -e "${RED}Banner '$target' nao encontrado.${NC}"
        exit 1
      fi

      echo -e "${GREEN}Para configurar '$(basename "$banner_path")' no SessionStart:${NC}"
      echo ""
      echo -e "${CYAN}\"SessionStart\": [{"
      echo "  \"hooks\": [{"
      echo "    \"type\": \"command\","
      echo "    \"command\": \"bash $banner_path\","
      echo "    \"timeout\": 15"
      echo "  }]"
      echo -e "}]${NC}"
      ;;
  esac
  echo ""
}

# ── Main Router ──
main() {
  local mode="${1:-help}"

  case "$mode" in
    banner)  mode_banner "$@" ;;
    asset)   mode_asset "$@" ;;
    live)    mode_live "$@" ;;
    catalog) mode_catalog "$@" ;;
    presets) mode_presets "$@" ;;
    hook)    mode_hook "$@" ;;
    help|--help|-h)
      echo ""
      echo -e "${MAGENTA}ascii-banner-forge${NC} — Gerador de arte ASCII para terminal"
      echo ""
      echo -e "  ${CYAN}banner${NC}  <imagem>  [--name N] [--category C] [--speed fast|normal|slow]"
      echo -e "          Converte imagem em banner animado .sh completo"
      echo ""
      echo -e "  ${CYAN}asset${NC}   <imagem>  [--preset P | --size WxH] [--output PATH]"
      echo -e "          Converte imagem em asset .asc reutilizavel"
      echo ""
      echo -e "  ${CYAN}live${NC}    <imagem|nome>  [--preset P | --size WxH]"
      echo -e "          Preview rapido no terminal (nao salva)"
      echo ""
      echo -e "  ${CYAN}catalog${NC} [--tag TAG]"
      echo -e "          Lista todas as artes disponiveis"
      echo ""
      echo -e "  ${CYAN}presets${NC} [--preview]"
      echo -e "          Lista presets de tamanho disponiveis"
      echo ""
      echo -e "  ${CYAN}hook${NC}    <random|NOME|off>"
      echo -e "          Configura banner no SessionStart"
      echo ""
      ;;
    *)
      echo -e "${RED}Modo desconhecido: $mode${NC}"
      echo "Use: generate.sh help"
      exit 1
      ;;
  esac
}

main "$@"
