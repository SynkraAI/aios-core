# Claude Status Monitor - Início Rápido

## O que é?

Um app nativo do macOS que mostra na barra de status quando o Claude Code está aguardando sua resposta.

- 🟢 **Verde** = Claude está idle ou rodando
- 🔴 **Vermelho** + 🔔 **Notificação** = Claude está aguardando você!

## Instalação Rápida (5 minutos)

### 1. Build do app

```bash
cd ~/aios-core/tools/claude-status-monitor
./build.sh
```

### 2. Instalar

```bash
./install.sh
```

### 3. Iniciar

**Terminal 1 - Monitor de status (background):**
```bash
~/.aios-core/scripts/monitor-claude-status.sh &
```

**Terminal 2 - App da barra de status:**
```bash
claude-status-monitor
```

Pronto! Você verá um ícone 🟢 na barra de status do macOS.

## Uso

### Ícones

| Ícone | Significado |
|-------|-------------|
| 🟢 | Claude está idle ou executando tasks |
| 🔴 | **Claude está aguardando você!** |
| ⚠️ | Erro ao ler arquivo de status |

### Menu

Click no ícone para ver:
- Status atual
- Última atualização
- Mensagem do Claude
- Opções (abrir arquivo, atualizar, sair)

### Notificações

Quando o Claude ficar aguardando sua resposta, você receberá uma notificação do macOS automaticamente.

## Iniciar Automaticamente (Opcional)

Adicione ao seu `~/.zshrc`:

```bash
# Claude Status Monitor
~/.aios-core/scripts/monitor-claude-status.sh &
claude-status-monitor &
```

Agora será iniciado automaticamente sempre que abrir um terminal.

## Testar

Simule o estado "waiting" para testar:

```bash
echo '{"state":"waiting","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","message":"Teste - Claude aguardando","lastActivity":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","context":"","pid":0}' > ~/.aios/claude-status.json
```

O ícone deve ficar 🔴 e você deve receber uma notificação.

Voltar ao normal:

```bash
echo '{"state":"idle","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","message":"Teste concluído","lastActivity":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","context":"","pid":0}' > ~/.aios/claude-status.json
```

## Troubleshooting

### Não vejo o ícone na barra de status
- Verifique se o app está rodando: `ps aux | grep ClaudeStatusMonitor`
- Reinicie o app

### Notificações não aparecem
1. Abrir **System Settings** → **Notifications**
2. Procurar por "ClaudeStatusMonitor" ou "Terminal"
3. Habilitar notificações

### Ícone não atualiza
- Verificar se o arquivo existe: `cat ~/.aios/claude-status.json`
- Verificar se o monitor está rodando: `ps aux | grep monitor-claude-status`
- Ver logs: `tail -f ~/.aios/logs/status-monitor.log`

### PATH não reconhece claude-status-monitor

Adicione ao `~/.zshrc`:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

Depois: `source ~/.zshrc`

## Desinstalar

```bash
rm -f ~/.local/bin/claude-status-monitor
killall ClaudeStatusMonitor
killall monitor-claude-status.sh
```

## Suporte

Problemas? Abra uma issue ou pergunte ao @devops.
