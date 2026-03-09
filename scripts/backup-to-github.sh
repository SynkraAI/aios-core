#!/bin/bash
# AIOS Core — Backup to GitHub (Stream Deck)
# Commit all changes + push to your fork in one click

cd /Users/luizfosc/aios-core || exit 1

# Check if there are changes to commit
if git diff --quiet HEAD && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
  osascript -e 'display notification "Nada para enviar — tudo já está no GitHub" with title "AIOS Backup" sound name "Pop"'
  exit 0
fi

# Stage all changes
git add -A

# Commit with timestamp
TIMESTAMP=$(date +"%Y-%m-%d %H:%M")
git commit -m "backup: sync local work — $TIMESTAMP"

# Push to GitHub
if git push origin main; then
  osascript -e 'display notification "Backup enviado com sucesso!" with title "AIOS Backup ✓" sound name "Glass"'
else
  osascript -e 'display notification "ERRO: push falhou. Verifique o terminal." with title "AIOS Backup ✗" sound name "Basso"'
  exit 1
fi
