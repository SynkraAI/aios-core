#!/bin/bash

# Quick demo/test script for Claude Status Monitor
# Usage: ./test-demo.sh

set -euo pipefail

STATUS_FILE="$HOME/.aios/claude-status.json"

update_status() {
    local state=$1
    local message=$2
    local context=${3:-""}

    cat > "$STATUS_FILE" << EOF
{
  "state": "$state",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "lastActivity": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "message": "$message",
  "context": "$context",
  "pid": $$
}
EOF
    echo "✓ Status: $state - $message"
}

echo "🧪 Claude Status Monitor - Demo Script"
echo "======================================="
echo ""
echo "Este script vai simular diferentes estados do Claude Code."
echo "Observe o ícone na barra de status e as notificações."
echo ""
echo "Pressione Ctrl+C para parar a qualquer momento."
echo ""

sleep 2

echo "1️⃣  Estado: IDLE"
update_status "idle" "Aguardando comandos..." ""
sleep 4

echo ""
echo "2️⃣  Estado: RUNNING"
update_status "running" "✓ Implementando feature X" "Story 1.2 - New feature"
sleep 5

echo ""
echo "3️⃣  Estado: WAITING (deve notificar! 🔔)"
update_status "waiting" "⚠️ Preciso saber qual approach usar: A ou B?" "Story 1.2 - Architecture decision"
echo ""
echo ">>> Você deve ter recebido uma notificação agora <<<"
echo ">>> O ícone deve estar 🔴 <<<"
echo ""
sleep 6

echo ""
echo "4️⃣  Estado: RUNNING novamente"
update_status "running" "✓ Implementando approach A" "Story 1.2 - Implementation"
sleep 5

echo ""
echo "5️⃣  Estado: WAITING novamente (outra notificação 🔔)"
update_status "waiting" "⚠️ Testes falharam. Devo corrigir ou criar nova branch?" "Story 1.2 - Test failure"
sleep 6

echo ""
echo "6️⃣  Estado: RUNNING (correção)"
update_status "running" "✓ Corrigindo testes..." "Story 1.2 - Bug fix"
sleep 5

echo ""
echo "7️⃣  Estado: IDLE (concluído)"
update_status "idle" "Task concluída com sucesso" ""

echo ""
echo "✅ Demo completo!"
echo ""
echo "Comandos úteis:"
echo "  • Ver status atual: cat $STATUS_FILE | jq"
echo "  • Ver logs: tail -f ~/.aios/logs/status-monitor.log"
echo "  • Simular waiting: ./test-demo.sh"
echo ""
