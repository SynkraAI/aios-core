#!/bin/bash

# Install Claude Status Monitor
# Usage: ./install.sh

set -euo pipefail

cd "$(dirname "$0")"

echo "📦 Instalando Claude Status Monitor..."

# Build first
if [ ! -d "ClaudeStatusMonitor.app" ]; then
    echo "Building app first..."
    ./build-app.sh
fi

# Copy to Applications
echo "Copiando para ~/Applications..."
mkdir -p ~/Applications
cp -r ClaudeStatusMonitor.app ~/Applications/

# Create launch alias
INSTALL_DIR="$HOME/.local/bin"
mkdir -p "$INSTALL_DIR"

cat > "$INSTALL_DIR/claude-status-monitor" << 'EOF'
#!/bin/bash
open ~/Applications/ClaudeStatusMonitor.app
EOF

chmod +x "$INSTALL_DIR/claude-status-monitor"

echo "✅ Instalado!"
echo ""
echo "App: ~/Applications/ClaudeStatusMonitor.app"
echo "Comando: $INSTALL_DIR/claude-status-monitor"
echo ""
echo "Próximos passos:"
echo ""
echo "1. Iniciar o app agora:"
echo "   open ~/Applications/ClaudeStatusMonitor.app"
echo ""
echo "2. (Opcional) Iniciar o monitor de status:"
echo "   $HOME/aios-core/.aios-core/scripts/monitor-claude-status.sh &"
echo ""
echo "3. (Opcional) Auto-start ao abrir terminal (adicionar ao .zshrc):"
echo "   echo 'open -a ClaudeStatusMonitor 2>/dev/null &' >> ~/.zshrc"
echo "   echo '$HOME/aios-core/.aios-core/scripts/monitor-claude-status.sh &' >> ~/.zshrc"
echo ""
