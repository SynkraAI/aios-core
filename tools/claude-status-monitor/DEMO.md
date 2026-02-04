# Claude Status Monitor - Demo & Testing

## Test Drive (2 minutos)

Vamos testar o sistema completo sem precisar esperar o Claude Code.

### 1. Build (se ainda não fez)

```bash
cd ~/aios-core/tools/claude-status-monitor
./build.sh
```

### 2. Iniciar o app

```bash
./.build/release/ClaudeStatusMonitor &
```

Você deve ver 🟢 na barra de status do macOS.

### 3. Testar estado "waiting"

```bash
echo '{"state":"waiting","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","message":"⚠️ Claude está aguardando sua resposta!","lastActivity":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","context":"Story 1.2 - Implementação do design system","pid":12345}' > ~/.aios/claude-status.json
```

**Resultado esperado:**
- ✅ Ícone muda para 🔴
- ✅ Você recebe uma notificação do macOS
- ✅ O menu mostra "Status: Aguardando"

### 4. Testar estado "running"

```bash
echo '{"state":"running","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","message":"✓ Claude está executando tasks","lastActivity":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","context":"Story 1.2 - Running tests","pid":12345}' > ~/.aios/claude-status.json
```

**Resultado esperado:**
- ✅ Ícone volta para 🟢
- ✅ O menu mostra "Status: Rodando"

### 5. Testar estado "idle"

```bash
echo '{"state":"idle","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","message":"Sem atividade","lastActivity":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","context":"","pid":0}' > ~/.aios/claude-status.json
```

**Resultado esperado:**
- ✅ Ícone permanece 🟢
- ✅ O menu mostra "Status: Idle"

## Automação Completa

Para usar com Claude Code real, inicie o monitor automático:

```bash
# Terminal 1 - Monitor de status (detecta quando Claude está aguardando)
~/.aios-core/scripts/monitor-claude-status.sh &

# Terminal 2 - App da barra de status
./.build/release/ClaudeStatusMonitor &
```

Ou instale permanentemente:

```bash
./install.sh
```

## Scripts úteis

### watch-status.sh - Ver mudanças em tempo real

```bash
#!/bin/bash
watch -n 1 'cat ~/.aios/claude-status.json | jq'
```

### simulate-workflow.sh - Simular workflow completo

```bash
#!/bin/bash

echo "Simulando workflow Claude Code..."

echo "1. Idle..."
echo '{"state":"idle","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","message":"Aguardando comandos","lastActivity":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","context":"","pid":0}' > ~/.aios/claude-status.json
sleep 3

echo "2. Running..."
echo '{"state":"running","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","message":"Implementando feature X","lastActivity":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","context":"Story 1.2","pid":12345}' > ~/.aios/claude-status.json
sleep 5

echo "3. Waiting (deve notificar!)..."
echo '{"state":"waiting","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","message":"Preciso saber se uso approach A ou B","lastActivity":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","context":"Story 1.2 - Architecture decision","pid":12345}' > ~/.aios/claude-status.json
sleep 3

echo "4. Running novamente..."
echo '{"state":"running","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","message":"Implementando approach A","lastActivity":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","context":"Story 1.2","pid":12345}' > ~/.aios/claude-status.json
sleep 5

echo "5. Idle novamente..."
echo '{"state":"idle","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","message":"Task concluída","lastActivity":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","context":"","pid":0}' > ~/.aios/claude-status.json

echo "Simulação completa!"
```

Salve como `simulate-workflow.sh`, dê permissão (`chmod +x`) e execute.

## Verificar Logs

```bash
# Logs do monitor
tail -f ~/.aios/logs/status-monitor.log

# Status atual (formatado)
cat ~/.aios/claude-status.json | jq

# Ver histórico de mudanças (requer fswatch)
fswatch -o ~/.aios/claude-status.json | xargs -n1 -I{} cat ~/.aios/claude-status.json
```

## Performance

- **CPU:** ~0% idle, ~1% quando atualiza
- **RAM:** ~10-15MB
- **Latência:** <200ms para detectar mudança e atualizar ícone
- **Bateria:** Impacto mínimo (polling a cada 2s)

## Troubleshooting

### "Notification permission not granted"

1. System Settings → Notifications
2. Procurar "ClaudeStatusMonitor" ou "Terminal"
3. Permitir notificações

### Ícone não aparece

```bash
# Verificar se está rodando
ps aux | grep ClaudeStatusMonitor

# Matar e reiniciar
killall ClaudeStatusMonitor
./.build/release/ClaudeStatusMonitor &
```

### Status não atualiza

```bash
# Verificar se arquivo existe
ls -la ~/.aios/claude-status.json

# Verificar permissões
chmod 644 ~/.aios/claude-status.json

# Testar manualmente
echo '{"state":"waiting","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","message":"Test","lastActivity":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","context":"","pid":0}' > ~/.aios/claude-status.json
```

## Próximos Passos

Depois de testar e validar, consulte `QUICKSTART.md` para instalação permanente.
