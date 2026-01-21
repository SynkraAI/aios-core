#!/bin/bash
# install.sh - Instala os scripts AIOS no sistema
# Uso: ./install.sh [--uninstall]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="${HOME}/bin"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPTS=("aios-push" "aios-sync" "aios-pull" "aios-update")

# Verifica se é uninstall
if [ "$1" = "--uninstall" ]; then
  echo -e "${BLUE}🗑️  AIOS Uninstall${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  for script in "${SCRIPTS[@]}"; do
    if [ -f "$TARGET_DIR/$script" ]; then
      rm "$TARGET_DIR/$script"
      echo -e "  ${RED}✗${NC} Removido: $script"
    fi
  done

  echo ""
  echo -e "${GREEN}✅ Scripts removidos de $TARGET_DIR${NC}"
  exit 0
fi

echo -e "${BLUE}📦 AIOS Install${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Cria ~/bin se não existir
if [ ! -d "$TARGET_DIR" ]; then
  echo -e "${YELLOW}Criando $TARGET_DIR...${NC}"
  mkdir -p "$TARGET_DIR"
fi

# Copia os scripts
echo "Instalando scripts em $TARGET_DIR:"
echo ""

for script in "${SCRIPTS[@]}"; do
  if [ -f "$SCRIPT_DIR/$script" ]; then
    cp "$SCRIPT_DIR/$script" "$TARGET_DIR/"
    chmod +x "$TARGET_DIR/$script"
    echo -e "  ${GREEN}✓${NC} $script"
  else
    echo -e "  ${RED}✗${NC} $script (não encontrado)"
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Instalação concluída!${NC}"
echo ""

# Verifica se ~/bin está no PATH
if [[ ":$PATH:" != *":$TARGET_DIR:"* ]]; then
  echo -e "${YELLOW}⚠️  Atenção: $TARGET_DIR não está no PATH${NC}"
  echo ""
  echo "Adicione ao seu ~/.bashrc ou ~/.zshrc:"
  echo ""
  echo "  export PATH=\"\$HOME/bin:\$PATH\""
  echo ""
  echo "Depois execute: source ~/.bashrc"
  echo ""
else
  echo "Scripts disponíveis globalmente:"
  echo ""
  echo "  aios-push    # Exporta projeto → master"
  echo "  aios-sync    # Propaga master → projetos"
  echo "  aios-pull    # Atualiza projeto atual"
  echo "  aios-update  # Atualiza do upstream oficial"
  echo ""
fi
