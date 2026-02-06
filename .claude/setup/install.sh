#!/bin/bash
# Claude Code Statusline Setup
# Instala configuração customizada do Claude Code

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$HOME/.claude"

echo "=== Claude Code Statusline Setup ==="
echo ""

# Verifica se ~/.claude existe
if [ ! -d "$CLAUDE_DIR" ]; then
    echo "Criando $CLAUDE_DIR..."
    mkdir -p "$CLAUDE_DIR"
fi

# Backup de arquivos existentes
if [ -f "$CLAUDE_DIR/settings.json" ]; then
    BACKUP="$CLAUDE_DIR/settings.json.backup.$(date +%Y%m%d_%H%M%S)"
    echo "Backup: settings.json -> $BACKUP"
    cp "$CLAUDE_DIR/settings.json" "$BACKUP"
fi

if [ -f "$CLAUDE_DIR/statusline-custom.sh" ]; then
    BACKUP="$CLAUDE_DIR/statusline-custom.sh.backup.$(date +%Y%m%d_%H%M%S)"
    echo "Backup: statusline-custom.sh -> $BACKUP"
    cp "$CLAUDE_DIR/statusline-custom.sh" "$BACKUP"
fi

# Copia arquivos
echo ""
echo "Instalando arquivos..."
cp "$SCRIPT_DIR/statusline-custom.sh" "$CLAUDE_DIR/statusline-custom.sh"
chmod +x "$CLAUDE_DIR/statusline-custom.sh"
echo "  ✓ statusline-custom.sh"

# Merge settings.json (preserva permissions existentes)
if [ -f "$CLAUDE_DIR/settings.json" ]; then
    # Usa jq para fazer merge se disponível
    if command -v jq &> /dev/null; then
        echo "  Fazendo merge de settings.json..."
        jq -s '.[0] * .[1]' "$CLAUDE_DIR/settings.json" "$SCRIPT_DIR/settings.json" > "$CLAUDE_DIR/settings.json.tmp"
        mv "$CLAUDE_DIR/settings.json.tmp" "$CLAUDE_DIR/settings.json"
    else
        cp "$SCRIPT_DIR/settings.json" "$CLAUDE_DIR/settings.json"
    fi
else
    cp "$SCRIPT_DIR/settings.json" "$CLAUDE_DIR/settings.json"
fi
echo "  ✓ settings.json"

echo ""
echo "=== Instalação concluída! ==="
echo ""
echo "Reinicie o Claude Code para aplicar as mudanças."
echo ""
echo "Dependências necessárias:"
echo "  - jq (brew install jq)"
echo "  - bash 4+ (já incluso no macOS via Homebrew)"
