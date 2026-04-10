#!/bin/bash
# Generates visual preview frames for each preset
# These show the proportional shape of each preset at ~1:5 scale

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUTPUT_DIR="$(dirname "$SCRIPT_DIR")/assets/preset-previews"
mkdir -p "$OUTPUT_DIR"

NC='\033[0m'
CYAN='\033[38;5;51m'
YELLOW='\033[38;5;220m'
DIM='\033[2m'
MAGENTA='\033[38;5;201m'

# Generate a frame preview for a given preset
# Usage: gen_preview <name> <cols> <lines> <description>
gen_preview() {
  local name="$1" cols="$2" lines="$3" desc="$4"
  local file="$OUTPUT_DIR/${name}.txt"

  # Scale down to fit in terminal (max 60 cols wide, max 20 lines tall)
  local scale=5
  local w=$((cols / scale))
  local h=$((lines / scale))

  # Minimum dimensions
  [[ $w -lt 6 ]] && w=6
  [[ $h -lt 3 ]] && h=3

  # Max dimensions
  [[ $w -gt 60 ]] && w=60
  [[ $h -gt 20 ]] && h=20

  local inner_w=$((w - 2))

  {
    # Header
    printf "    %s  %s (%sx%s)\n" "$name" "$desc" "$cols" "$lines"
    printf "    "
    printf "┌"
    for ((i=0; i<inner_w; i++)); do printf "─"; done
    printf "┐\n"

    # Body
    for ((j=0; j<h-2; j++)); do
      printf "    │"
      if [[ $j -eq $(( (h-2) / 2 )) ]]; then
        # Center line with dimensions
        local label="${cols}x${lines}"
        local label_len=${#label}
        local pad_left=$(( (inner_w - label_len) / 2 ))
        local pad_right=$(( inner_w - label_len - pad_left ))
        for ((i=0; i<pad_left; i++)); do printf " "; done
        printf "%s" "$label"
        for ((i=0; i<pad_right; i++)); do printf " "; done
      else
        for ((i=0; i<inner_w; i++)); do printf " "; done
      fi
      printf "│\n"
    done

    # Footer
    printf "    "
    printf "└"
    for ((i=0; i<inner_w; i++)); do printf "─"; done
    printf "┘\n"
  } > "$file"

  echo "  Generated: $file"
}

echo ""
echo -e "${MAGENTA}Gerando previews visuais dos presets...${NC}"
echo ""

gen_preview "fullscreen"        197 99  "Banner de sessao"
gen_preview "compact"           80  24  "Terminal padrao"
gen_preview "wide"              120 40  "Splash screen"
gen_preview "mini"              40  20  "Icone/avatar"
gen_preview "square"            60  60  "1:1 Instagram"
gen_preview "cinema"            120 50  "16:9 YouTube"
gen_preview "story"             40  71  "9:16 Stories"
gen_preview "banner-horizontal" 120 30  "Banner largo"
gen_preview "thumbnail"         60  34  "Miniatura"

echo ""
echo -e "${CYAN}Todos os previews gerados em:${NC} $OUTPUT_DIR"

# Also generate a combined preview showing all presets side by side
COMBINED="$OUTPUT_DIR/ALL-PRESETS.txt"
{
  echo "╔══════════════════════════════════════════════════════════════════╗"
  echo "║              📐 ASCII Banner Forge — Presets                   ║"
  echo "╚══════════════════════════════════════════════════════════════════╝"
  echo ""
  for f in "$OUTPUT_DIR"/*.txt; do
    [[ "$(basename "$f")" == "ALL-PRESETS.txt" ]] && continue
    cat "$f"
    echo ""
  done
} > "$COMBINED"

echo -e "${CYAN}Preview combinado:${NC} $COMBINED"
echo ""
