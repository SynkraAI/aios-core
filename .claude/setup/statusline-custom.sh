#!/bin/bash

export LC_NUMERIC=C

# Cores ANSI
RED=$'\033[31m'
RESET=$'\033[0m'

# Lê JSON do Claude Code
INPUT=$(cat)

# DEBUG: salva JSON para análise
echo "$INPUT" > /tmp/claude-statusline-debug.json

# Extrai dados com jq
CTX_REMAINING=$(echo "$INPUT" | jq -r '.context_window.remaining_percentage // 100')
CTX_SIZE=$(echo "$INPUT" | jq -r '.context_window.context_window_size // 200000')

# Limite máximo útil: 180k tokens
MAX_USEFUL_TOKENS=180000

# Calcula tokens usados na janela atual
TOKENS_USED=$((CTX_SIZE * (100 - CTX_REMAINING) / 100))

# Calcula porcentagem em relação a 180k (referência real do Claude)
# 180k = 100%, pode passar (ex: 200k = 111%)
CTX_PERCENT=$((TOKENS_USED * 100 / MAX_USEFUL_TOKENS))
MODEL=$(echo "$INPUT" | jq -r '.model.display_name // "unknown"')
CWD=$(echo "$INPUT" | jq -r '.cwd // ""')
SESSION_COST=$(echo "$INPUT" | jq -r '.cost.total_cost_usd // 0')
DURATION_MS=$(echo "$INPUT" | jq -r '.cost.total_duration_ms // 0')
LINES_ADDED=$(echo "$INPUT" | jq -r '.cost.total_lines_added // 0')
LINES_REMOVED=$(echo "$INPUT" | jq -r '.cost.total_lines_removed // 0')

# Formata duração (ms -> Xh Xm ou Xm Xs)
DURATION_SEC=$((DURATION_MS / 1000))
DURATION_MIN=$((DURATION_SEC / 60))
DURATION_HOUR=$((DURATION_MIN / 60))
if [ "$DURATION_HOUR" -gt 0 ]; then
    DURATION_FMT="${DURATION_HOUR}h $((DURATION_MIN % 60))m"
elif [ "$DURATION_MIN" -gt 0 ]; then
    DURATION_FMT="${DURATION_MIN}m $((DURATION_SEC % 60))s"
else
    DURATION_FMT="${DURATION_SEC}s"
fi

# Usa tokens calculados anteriormente
TOKENS_IN_WINDOW=$TOKENS_USED

# Formata tokens (K/M)
if [ "$TOKENS_IN_WINDOW" -gt 1000000 ]; then
    TOKENS_FMT=$(awk "BEGIN {printf \"%.1fM\", $TOKENS_IN_WINDOW/1000000}")
elif [ "$TOKENS_IN_WINDOW" -gt 1000 ]; then
    TOKENS_FMT=$(awk "BEGIN {printf \"%.0fk\", $TOKENS_IN_WINDOW/1000}")
else
    TOKENS_FMT="${TOKENS_IN_WINDOW}"
fi

# Diretório curto
SHORT_CWD=$(echo "$CWD" | sed "s|$HOME|~|")

# Git branch
BRANCH=""
if [ -n "$CWD" ] && [ -d "$CWD/.git" ]; then
    BRANCH=$(git -C "$CWD" branch --show-current 2>/dev/null)
fi

# Formata custo
SESSION_COST_FMT=$(awk "BEGIN {printf \"%.2f\", $SESSION_COST}")

# === CPU e Memória ===
TOP_OUTPUT=$(top -l 1 -n 0 2>/dev/null)

# CPU %
CPU=$(echo "$TOP_OUTPUT" | grep "CPU usage" | awk '{print $3}' | tr -d '%')
CPU=${CPU:-"--"}

# RAM %
MEM_USED=$(echo "$TOP_OUTPUT" | grep "PhysMem" | awk '{print $2}' | tr -d 'G')
MEM_TOTAL=$(sysctl -n hw.memsize 2>/dev/null | awk '{printf "%.0f", $1/1024/1024/1024}')
if [ -n "$MEM_USED" ] && [ -n "$MEM_TOTAL" ] && [ "$MEM_TOTAL" -gt 0 ]; then
    RAM_PERCENT=$(awk "BEGIN {printf \"%.0f\", ($MEM_USED / $MEM_TOTAL) * 100}")
else
    RAM_PERCENT="--"
fi

# === Formata contexto (vermelho se > 60%) ===
if [ "$CTX_PERCENT" -gt 60 ]; then
    CTX_DISPLAY="${RED}${CTX_PERCENT}%${RESET}"
else
    CTX_DISPLAY="${CTX_PERCENT}%"
fi

# === OUTPUT ===
if [ -n "$BRANCH" ]; then
    printf "%s %s | \$%s ⏱ %s | +%s-%s | %s | %s:%s | %s%% / %s%%\n" "$CTX_DISPLAY" "$TOKENS_FMT" "$SESSION_COST_FMT" "$DURATION_FMT" "$LINES_ADDED" "$LINES_REMOVED" "$MODEL" "$SHORT_CWD" "$BRANCH" "$CPU" "$RAM_PERCENT"
else
    printf "%s %s | \$%s ⏱ %s | +%s-%s | %s | %s | %s%% / %s%%\n" "$CTX_DISPLAY" "$TOKENS_FMT" "$SESSION_COST_FMT" "$DURATION_FMT" "$LINES_ADDED" "$LINES_REMOVED" "$MODEL" "$SHORT_CWD" "$CPU" "$RAM_PERCENT"
fi
