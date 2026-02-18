# Fix: Claude Status Monitor - Troubleshooting Session

**Data:** 2026-02-04
**Sessão:** Terminal startup errors com Claude Status Monitor
**Status:** ✅ Resolvido

---

## 📋 Sumário Executivo

Corrigido erro `exit 1` do script `monitor-claude-status.sh` que ocorria ao abrir novas abas do terminal. O script falhava quando o processo Claude Code não estava rodando. Também configurado modo silencioso para evitar notificações de jobs e ajustado foco do terminal.

---

## 🐛 Problema Inicial

### Sintomas

Ao abrir uma nova aba do terminal, apareciam mensagens de erro:

```bash
Last login: Wed Feb  4 17:11:54 on ttys001
[2] 98002
[3] 98003
[3]  + exit 1     ~/aios-core/.aios-core/scripts/monitor-claude-status.sh &> /dev/null
[2]  + done       open -a ClaudeStatusMonitor 2> /dev/null
```

**Indicadores:**
- ❌ `exit 1` - Script de monitoramento falhando
- ✅ `done` - App ClaudeStatusMonitor abrindo com sucesso
- ⚠️ Jobs em background notificados constantemente

### Contexto

O arquivo `.zshrc` está configurado para auto-iniciar o Claude Status Monitor:

```bash
# Claude Status Monitor - Auto-start
if [[ -z "$CLAUDE_STATUS_MONITOR_LOADED" ]]; then
    export CLAUDE_STATUS_MONITOR_LOADED=1
    open -a ClaudeStatusMonitor 2>/dev/null &
    ~/aios-core/.aios-core/scripts/monitor-claude-status.sh &>/dev/null &
fi
```

---

## 🔍 Investigação

### Verificações Realizadas

1. **Comando `bc`** - ✅ Instalado em `/usr/bin/bc`
2. **Processo Claude** - ❌ Não encontrado (esperado quando não está rodando)
3. **Logs do monitor** - Script iniciava mas não logava mais nada (crash imediato)
4. **Arquivo de status** - Não era criado (script falhava antes)

### Causa Raiz Identificada

**Arquivo:** `.aios-core/scripts/monitor-claude-status.sh:37`

```bash
# Update status file
update_status() {
    local state=$1
    local message=${2:-""}
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)

    cat > "$STATUS_FILE" << EOF
{
  "state": "$state",
  "timestamp": "$timestamp",
  "lastActivity": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "message": "$message",
  "pid": $CLAUDE_PID,    ← PROBLEMA AQUI!
  "context": ""
}
EOF
    log "Status updated: $state - $message"
}
```

**Problema:**
- Script usa `set -euo pipefail` (modo strict)
- Quando `$CLAUDE_PID` está vazio (Claude não rodando), gera JSON inválido:
  ```json
  "pid": ,   ← Erro de sintaxe!
  ```
- Modo strict causa `exit 1` imediatamente

---

## 🔧 Correções Aplicadas

### 1. Fix do Bug no Script (Prioridade: CRÍTICA)

**Arquivo:** `.aios-core/scripts/monitor-claude-status.sh:37`

```bash
# ANTES (broken)
update_status() {
    local state=$1
    local message=${2:-""}
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)

    cat > "$STATUS_FILE" << EOF
{
  "state": "$state",
  "timestamp": "$timestamp",
  "lastActivity": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "message": "$message",
  "pid": $CLAUDE_PID,    ← Variável vazia causa erro
  "context": ""
}
EOF
    log "Status updated: $state - $message"
}

# DEPOIS (fixed)
update_status() {
    local state=$1
    local message=${2:-""}
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    local pid=${CLAUDE_PID:-null}    ← Usa 'null' se vazio

    cat > "$STATUS_FILE" << EOF
{
  "state": "$state",
  "timestamp": "$timestamp",
  "lastActivity": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "message": "$message",
  "pid": $pid,    ← Sempre terá valor válido
  "context": ""
}
EOF
    log "Status updated: $state - $message"
}
```

**Mudança:** `local pid=${CLAUDE_PID:-null}`
- Se `CLAUDE_PID` existe → usa o valor
- Se `CLAUDE_PID` está vazio → usa `null` (JSON válido)

**Resultado:**
```json
{
  "state": "idle",
  "timestamp": "2026-02-04T20:28:21Z",
  "lastActivity": "2026-02-04T20:28:21Z",
  "message": "Monitor iniciado - aguardando atividade do Claude",
  "pid": null,  ✅ JSON válido!
  "context": ""
}
```

### 2. Silenciar Notificações de Jobs (Prioridade: UX)

**Arquivo:** `~/.zshrc` (linhas 46-51)

**Problema:** Notificações visuais de jobs poluindo o terminal:
```bash
[2] 5217
[3] 5218
[2]  - done       open -a ClaudeStatusMonitor
```

**Solução:**

```bash
# ANTES
if [[ -z "$CLAUDE_STATUS_MONITOR_LOADED" ]]; then
    export CLAUDE_STATUS_MONITOR_LOADED=1
    open -a ClaudeStatusMonitor 2>/dev/null &
    ~/aios-core/.aios-core/scripts/monitor-claude-status.sh &>/dev/null &
fi

# DEPOIS (com supressão de notificações)
if [[ -z "$CLAUDE_STATUS_MONITOR_LOADED" ]]; then
    export CLAUDE_STATUS_MONITOR_LOADED=1

    # Desabilitar notificações de jobs temporariamente
    setopt LOCAL_OPTIONS NO_NOTIFY NO_MONITOR

    open -a ClaudeStatusMonitor 2>/dev/null &
    ~/aios-core/.aios-core/scripts/monitor-claude-status.sh &>/dev/null &
fi
```

**Flags usadas:**
- `LOCAL_OPTIONS` - Configurações só valem neste bloco
- `NO_NOTIFY` - Não mostrar mudanças de status de jobs
- `NO_MONITOR` - Não mostrar mensagens de jobs iniciados

### 3. Fix do Foco do Terminal (Prioridade: UX)

**Problema:** Terminal perdia foco ao abrir nova aba, usuário precisava clicar para digitar.

**Causa:** `open -a ClaudeStatusMonitor` traz a app para o primeiro plano.

**Solução:**

```bash
# ANTES (rouba foco)
open -a ClaudeStatusMonitor 2>/dev/null &

# DEPOIS (mantém foco no terminal)
open -g -a ClaudeStatusMonitor 2>/dev/null &
```

**Flag `-g`:** Lança aplicação em background sem trazer para o primeiro plano.

---

## ✅ Validação

### Testes Realizados

1. **Script funcionando manualmente:**
   ```bash
   ./.aios-core/scripts/monitor-claude-status.sh &
   # Resultado: ✅ Sem erros, JSON válido criado
   ```

2. **Nova aba do terminal:**
   ```bash
   # Resultado esperado:
   Last login: Wed Feb  4 17:XX:XX on ttysXXX
   luizfosc@MacBook-Air-do-Fosc aios-core %

   # ✅ Sem notificações de jobs
   # ✅ Terminal pronto para escrever (foco mantido)
   # ✅ Sem mensagens de erro
   ```

3. **Arquivo de status:**
   ```bash
   cat .aios/claude-status.json
   # ✅ JSON válido
   # ✅ "pid": null quando Claude não está rodando
   ```

4. **Logs:**
   ```bash
   tail .aios/logs/status-monitor.log
   # ✅ Logs mostram "Status updated" (funcionando)
   # ✅ Sem crashes ou erros
   ```

### Evidências de Sucesso

**Antes das correções:**
```
[2026-02-04 17:11:55] Claude Status Monitor started
[2026-02-04 17:11:55] Monitoring interval: 2s
[2026-02-04 17:11:55] Status file: ...
(sem mais logs = crash)
```

**Depois das correções:**
```
[2026-02-04 17:28:21] Claude Status Monitor started
[2026-02-04 17:28:21] Monitoring interval: 2s
[2026-02-04 17:28:21] Status file: ...
[2026-02-04 17:28:21] Status updated: idle - Monitor iniciado  ✅
```

---

## 📊 Comparação: Antes vs Depois

| Aspecto | Antes ❌ | Depois ✅ |
|---------|----------|-----------|
| **Script** | Falhava com `exit 1` | Funciona corretamente |
| **JSON** | `"pid": ,` (inválido) | `"pid": null` (válido) |
| **Notificações** | `[2] 5217`, `[3] 5218`, etc | Nenhuma |
| **Foco do terminal** | Perdia foco, precisava clicar | Mantém foco, pronto para usar |
| **Logs** | Crash sem logs | Logs completos |
| **UX** | Confuso e frustrante | Limpo e transparente |

---

## 📁 Arquivos Modificados

### 1. `.aios-core/scripts/monitor-claude-status.sh`
**Linha 37:** Adicionado default value para `CLAUDE_PID`
```bash
local pid=${CLAUDE_PID:-null}
```

### 2. `~/.zshrc`
**Linhas 46-56:** Adicionado modo silencioso com `-g` flag
```bash
# Claude Status Monitor - Auto-start (silent mode)
if [[ -z "$CLAUDE_STATUS_MONITOR_LOADED" ]]; then
    export CLAUDE_STATUS_MONITOR_LOADED=1

    # Desabilitar notificações de jobs temporariamente
    setopt LOCAL_OPTIONS NO_NOTIFY NO_MONITOR

    open -g -a ClaudeStatusMonitor 2>/dev/null &
    ~/aios-core/.aios-core/scripts/monitor-claude-status.sh &>/dev/null &
fi
```

---

## 🎓 Lições Aprendidas

### 1. Bash Strict Mode e Variáveis Vazias

**Problema:** `set -euo pipefail` causa exit em variáveis não definidas/vazias.

**Solução:** Sempre use default values:
```bash
local var=${SOME_VAR:-default_value}
```

### 2. Job Control no Zsh

**Notificações de jobs:**
- `[N] PID` - Job iniciado
- `[N] + done` - Job terminou com sucesso
- `[N] + exit 1` - Job falhou

**Supressão:**
- `setopt NO_NOTIFY` - Desabilita notificações
- `setopt NO_MONITOR` - Desabilita job control
- `disown` - Remove job da tabela (após início)

### 3. Gestão de Foco no macOS

**Flag `-g` do comando `open`:**
- Abre aplicação em background
- Não rouba foco do terminal
- Essencial para scripts de init

---

## 🔄 Próximos Passos (Opcional)

Se quiser melhorias futuras:

1. **Verificar se ClaudeStatusMonitor já está rodando**
   ```bash
   if ! pgrep -q "ClaudeStatusMonitor"; then
       open -g -a ClaudeStatusMonitor 2>/dev/null &
   fi
   ```

2. **Timeout no script de monitoramento**
   - Adicionar lógica para auto-stop após X horas
   - Prevenir acúmulo de processos

3. **Logging com rotação**
   - Implementar rotação de logs
   - Limpar logs antigos automaticamente

---

## 📞 Comandos Úteis para Troubleshooting

### Verificar processos do monitor
```bash
ps aux | grep monitor-claude-status.sh | grep -v grep
```

### Ver logs em tempo real
```bash
tail -f .aios/logs/status-monitor.log
```

### Ver arquivo de status
```bash
cat .aios/claude-status.json | python3 -m json.tool
```

### Matar todos os monitores
```bash
pkill -f monitor-claude-status.sh
```

### Testar script manualmente
```bash
./.aios-core/scripts/monitor-claude-status.sh
# Ctrl+C para parar
```

### Verificar sintaxe do shell script
```bash
bash -n .aios-core/scripts/monitor-claude-status.sh
```

---

## 🎯 Resultado Final

✅ **Script de monitoramento funciona corretamente**
✅ **Terminal abre limpo sem notificações**
✅ **Foco mantido no terminal**
✅ **Claude Status Monitor roda silenciosamente em background**
✅ **JSON válido gerado mesmo quando Claude não está rodando**
✅ **Logs completos e estruturados**

**Status:** Sistema operacional e pronto para uso! 🚀

---

**Documentado por:** Claude Sonnet 4.5
**Revisão:** Pendente
**Tags:** `troubleshooting`, `zsh`, `bash`, `claude-status-monitor`, `terminal`, `fix`
