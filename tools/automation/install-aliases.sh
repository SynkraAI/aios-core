#!/bin/bash

# install-aliases.sh
#
# Instala aliases globais para comandos de organização AIOX.
# Roda uma vez e pronto — aliases ficam disponíveis em qualquer terminal.
#
# Usage:
#   bash tools/install-aliases.sh

set -e

ZSHRC="$HOME/.zshrc"
AIOS_HOME="$HOME/aios-core"

echo "🔧 Instalando aliases globais para organização AIOX..."
echo ""

# Verificar se .zshrc existe
if [ ! -f "$ZSHRC" ]; then
  echo "❌ .zshrc não encontrado em $ZSHRC"
  echo "   Você está usando zsh? Se usar bash, adapte para ~/.bashrc"
  exit 1
fi

# Verificar se aliases já existem
if grep -q "# AIOX Organization Aliases" "$ZSHRC"; then
  echo "⚠️  Aliases já instalados. Removendo versão antiga..."
  # Remover bloco antigo
  sed -i.backup '/# AIOX Organization Aliases/,/# End AIOX Organization Aliases/d' "$ZSHRC"
fi

# Adicionar aliases
cat >> "$ZSHRC" << 'EOF'

# AIOX Organization Aliases
# Adicionado automaticamente por tools/install-aliases.sh
# Para remover, delete este bloco inteiro

# Setup estrutura Epic/Story em qualquer projeto
alias epic-init='node ~/aios-core/tools/create-epic-structure.js'

# Criar Epic
alias epic='node ~/aios-core/tools/new-epic.js'

# Criar Story
alias story='node ~/aios-core/tools/new-story.js'

# Validar estrutura de organização
alias validate-org='node ~/aios-core/tools/validate-structure.js'

# Atalhos úteis
alias epics='ls -lh docs/stories/epics/'
alias stories='ls -lh docs/stories/active/'
alias stories-done='ls -lh docs/stories/done/'
alias sessions='ls -lh docs/sessions/'

# End AIOX Organization Aliases
EOF

echo "✅ Aliases adicionados ao $ZSHRC"
echo ""
echo "📌 Para usar agora (sem reiniciar terminal):"
echo "   source $ZSHRC"
echo ""
echo "🎯 Aliases instalados:"
echo "   epic-init [path]    → Criar estrutura completa (docs/stories/, etc.)"
echo "   epic <N> <desc>     → Criar novo Epic (ex: epic 15 correcoes-crm)"
echo "   story <X.Y> <desc>  → Criar nova Story (ex: story 15.1 corrigir-email)"
echo "   validate-org [path] → Validar estrutura de organização"
echo "   epics               → Listar epics"
echo "   stories             → Listar stories ativas"
echo "   stories-done        → Listar stories concluídas"
echo "   sessions            → Listar sessions"
echo ""
echo "💡 Agora TODO projeto que você criar com /new-project já vem com essa estrutura!"
echo ""
