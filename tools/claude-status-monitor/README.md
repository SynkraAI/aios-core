# Claude Status Monitor

App nativo macOS para monitorar o status do Claude Code e notificar quando ele está aguardando input.

## Features

- 🟢 Ícone verde na barra de status quando Claude está idle/rodando
- 🔴 Ícone vermelho + notificação quando Claude está aguardando input
- 📊 Menu com detalhes: tempo no estado atual, histórico recente
- 🔔 Notificações nativas do macOS
- ⚡️ Leve e eficiente (Swift nativo)

## Arquitetura

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  Claude Code    │─────▶│  Status Monitor  │─────▶│  Status App     │
│  (process)      │      │  (bash script)   │      │  (Swift)        │
└─────────────────┘      └──────────────────┘      └─────────────────┘
                               │                           │
                               ▼                           ▼
                         status.json                  🟢/🔴 + 🔔
                      (.aios/status.json)           (Status Bar)
```

## Componentes

### 1. Status Monitor Script (`.aios-core/scripts/monitor-claude-status.sh`)
- Monitora o processo do Claude Code
- Detecta quando está aguardando input (via análise de output ou timeout)
- Atualiza `.aios/claude-status.json` com o estado

### 2. Status App (Swift)
- File watcher em `.aios/claude-status.json`
- Atualiza ícone da barra de status (🟢/🔴)
- Envia notificação quando estado muda para "waiting"
- Menu contextual com detalhes

## Status JSON Schema

```json
{
  "state": "idle" | "running" | "waiting",
  "timestamp": "2026-02-04T10:30:00Z",
  "lastActivity": "2026-02-04T10:29:45Z",
  "message": "Aguardando sua resposta...",
  "context": "Story 1.2 - Implementação do design system"
}
```

## Estados

| Estado | Ícone | Descrição | Notificação |
|--------|-------|-----------|-------------|
| `idle` | 🟢 | Claude não está rodando ou não há atividade | Não |
| `running` | 🟢 | Claude está executando tasks | Não |
| `waiting` | 🔴 | Claude está aguardando input do usuário | ✅ Sim |

## Instalação

### 1. Build do app Swift

```bash
cd tools/claude-status-monitor
xcodebuild -project ClaudeStatusMonitor.xcodeproj -scheme ClaudeStatusMonitor -configuration Release build
```

Ou abra `ClaudeStatusMonitor.xcodeproj` no Xcode e build (⌘B)

### 2. Iniciar monitor script

```bash
# Background (recomendado)
.aios-core/scripts/monitor-claude-status.sh &

# Ou adicionar ao .zshrc para iniciar automaticamente
echo ".aios-core/scripts/monitor-claude-status.sh &" >> ~/.zshrc
```

### 3. Iniciar app

```bash
open tools/claude-status-monitor/build/Release/ClaudeStatusMonitor.app
```

Ou adicionar aos Login Items do macOS para iniciar automaticamente.

## Desenvolvimento

### Requisitos

- macOS 12.0+
- Xcode 14.0+
- Swift 5.7+

### Estrutura do projeto

```
tools/claude-status-monitor/
├── ClaudeStatusMonitor/
│   ├── ClaudeStatusMonitorApp.swift      # Entry point
│   ├── StatusBarController.swift          # Status bar logic
│   ├── FileWatcher.swift                  # Monitor status.json
│   ├── NotificationManager.swift          # macOS notifications
│   └── Assets.xcassets/                   # Icons (green/red)
├── ClaudeStatusMonitor.xcodeproj
└── README.md
```

### Debug

```bash
# Ver logs do status monitor
tail -f .aios/logs/status-monitor.log

# Ver conteúdo do status atual
cat .aios/claude-status.json | jq

# Simular estado "waiting" (para testar)
echo '{"state":"waiting","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","message":"Test waiting state"}' > .aios/claude-status.json
```

## Configuração

Arquivo: `.aios/status-monitor.config.json`

```json
{
  "checkInterval": 2,
  "notificationsEnabled": true,
  "soundEnabled": true,
  "showInDock": false,
  "autoStart": true
}
```

## Troubleshooting

### App não atualiza
- Verificar se `.aios/claude-status.json` existe e está sendo atualizado
- Verificar permissões de leitura do arquivo
- Checar logs: `tail -f .aios/logs/status-monitor.log`

### Notificações não aparecem
- Verificar permissões de notificação em System Settings → Notifications
- Garantir que `notificationsEnabled: true` em config

### Ícone não aparece na barra
- Verificar se o app tem permissão para aparecer na status bar
- Tentar reiniciar o app

## Roadmap

- [ ] Configurações via UI (menu contextual)
- [ ] Histórico de estados com timeline
- [ ] Integração com Claude API para métricas de uso
- [ ] Shortcuts de teclado para ações rápidas
- [ ] Modo "Do Not Disturb" (silenciar notificações por X minutos)

## Licença

MIT - Ver LICENSE no root do projeto
