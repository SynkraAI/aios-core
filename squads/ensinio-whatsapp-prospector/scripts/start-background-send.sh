#!/bin/bash

# Start Background Send — Launcher script
#
# Inicia envio em background usando PM2
# Se PM2 não estiver instalado, usa nohup como fallback

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Ensinio Prospector — Launcher de Envio em Background     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if PM2 is installed
if command -v pm2 &> /dev/null; then
  echo "✅ PM2 encontrado - usando PM2 para background"
  echo ""

  # Start with PM2
  cd "$PROJECT_DIR"
  pm2 start scripts/send-background.js --name="ensinio-send" --interpreter=node

  echo ""
  echo "✅ Processo iniciado com PM2!"
  echo ""
  echo "📊 Comandos úteis:"
  echo "   pm2 logs ensinio-send    — Ver logs em tempo real"
  echo "   pm2 stop ensinio-send    — Parar envio"
  echo "   pm2 delete ensinio-send  — Remover processo"
  echo "   pm2 list                 — Listar processos"
  echo ""
  echo "🌐 Dashboard Evolution API:"
  echo "   http://178.156.242.82:8080/manager/"
  echo ""

else
  echo "⚠️  PM2 não encontrado - usando nohup (menos recomendado)"
  echo ""
  echo "Para instalar PM2:"
  echo "   npm install -g pm2"
  echo ""

  # Fallback to nohup
  cd "$PROJECT_DIR"
  nohup node scripts/send-background.js > logs/send-background.log 2>&1 &
  PID=$!

  echo "✅ Processo iniciado com nohup (PID: $PID)"
  echo ""
  echo "📊 Comandos úteis:"
  echo "   tail -f logs/send-background.log  — Ver logs"
  echo "   kill $PID                          — Parar envio"
  echo ""
  echo "🌐 Dashboard Evolution API:"
  echo "   http://178.156.242.82:8080/manager/"
  echo ""
  echo "⚠️  IMPORTANTE: Com nohup, se o Mac dormir, o envio PARA."
  echo "   Recomendamos instalar PM2 para melhor confiabilidade."
  echo ""
fi

echo "✅ Você pode fechar este terminal agora!"
