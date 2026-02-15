# Customização - AIOS Visual Context System

Guia completo para personalizar o Visual Context System.

## 🎨 Customizar Cores

Edite `~/.claude/statusline.sh` e modifique as cores ANSI:

### Cores Disponíveis

```bash
# Cores básicas (linhas 8-15)
RESET='\033[0m'
CYAN='\033[0;36m'      # Azul claro
YELLOW='\033[1;33m'    # Amarelo brilhante
GREEN='\033[0;32m'     # Verde
RED='\033[0;31m'       # Vermelho
BLUE='\033[0;34m'      # Azul
GRAY='\033[0;90m'      # Cinza
BOLD='\033[1m'         # Negrito
```

### Códigos ANSI Completos

| Cor | Código | Preview |
|-----|--------|---------|
| Preto | `\033[0;30m` | ⬛ |
| Vermelho | `\033[0;31m` | 🟥 |
| Verde | `\033[0;32m` | 🟩 |
| Amarelo | `\033[0;33m` | 🟨 |
| Azul | `\033[0;34m` | 🟦 |
| Magenta | `\033[0;35m` | 🟪 |
| Ciano | `\033[0;36m` | 🔷 |
| Branco | `\033[0;37m` | ⬜ |
| Cinza | `\033[0;90m` | ◽ |

**Cores brilhantes**: Adicione `1;` antes do código (ex: `\033[1;31m` para vermelho brilhante)

### Exemplo: Tema Roxo

```bash
# Substituir cores no statusline.sh
CYAN='\033[0;35m'      # Magenta em vez de Cyan
YELLOW='\033[1;35m'    # Magenta brilhante
GREEN='\033[0;35m'     # Tudo roxo!
```

## 📊 Customizar Progress Bar

### Mudar Cores da Barra

Edite linhas 149-155 do `statusline.sh`:

```bash
# Cores atuais
if [ "$CTX_PERCENT" -gt 80 ]; then
  BAR_COLOR=$RED        # Vermelho quando > 80%
elif [ "$CTX_PERCENT" -gt 50 ]; then
  BAR_COLOR=$YELLOW     # Amarelo quando > 50%
else
  BAR_COLOR=$GREEN      # Verde quando < 50%
fi
```

**Exemplo: Sempre azul**
```bash
BAR_COLOR=$BLUE  # Sempre azul, independente do percentual
```

### Mudar Caracteres da Barra

Edite linhas 159-165:

```bash
# Caracteres atuais
for ((i=0; i<BLOCKS_FILLED; i++)); do
  PROGRESS_BAR="${PROGRESS_BAR}█"  # Bloco cheio
done
PROGRESS_BAR="${PROGRESS_BAR}${GRAY}"
for ((i=0; i<BLOCKS_EMPTY; i++)); do
  PROGRESS_BAR="${PROGRESS_BAR}░"  # Bloco vazio
done
```

**Alternativas:**
- `▓` - Bloco meio cheio
- `▒` - Bloco menos denso
- `■` - Quadrado pequeno
- `●` - Círculo cheio
- `○` - Círculo vazio
- `▰` - Barra horizontal
- `▱` - Barra horizontal vazia

**Exemplo: Círculos**
```bash
PROGRESS_BAR="${PROGRESS_BAR}●"  # Cheio
PROGRESS_BAR="${PROGRESS_BAR}○"  # Vazio
```

## 🔢 Customizar Formato

### Remover Elementos

Comente linhas que você não quer:

```bash
# Remover CPU/RAM (linha ~187)
# OUTPUT="${OUTPUT} | 💻 ${CPU}%/${RAM_PERCENT}%"

# Remover data/hora (linha ~190)
# OUTPUT="${OUTPUT} | 📅 ${DATE_FMT} 🕐 ${TIME_FMT}"
```

### Mudar Ordem dos Elementos

Reorganize as linhas no final do script:

```bash
# Linha 1 original
LINE1="🤖 ${MODEL} | ${PROGRESS_BAR} | 💰 \$${COST_FMT}"

# Linha 1 customizada (custo primeiro)
LINE1="💰 \$${COST_FMT} | 🤖 ${MODEL} | ${PROGRESS_BAR}"
```

### Formato de 1 Linha Única

Se preferir tudo em 1 linha:

```bash
# Substituir linhas 179-191 por:
OUTPUT="🤖 ${MODEL} | ${PROGRESS_BAR} ${CTX_PERCENT}% | 💰 \$${COST_FMT}"
if [ -n "$AIOS_CONTEXT" ]; then
  OUTPUT="${OUTPUT} | ${AIOS_CONTEXT}"
fi
echo -e "$OUTPUT"
```

### Formato de 3 Linhas

Se quiser mais espaço:

```bash
LINE1="🤖 ${MODEL} | ${PROGRESS_BAR} ${CTX_PERCENT}% ${TOKENS_FMT}"
LINE2="💰 \$${COST_FMT} ⏱ ${DURATION_FMT} | ${AIOS_CONTEXT}"
LINE3="📁 ${SHORT_CWD}:${BRANCH} | 💻 ${CPU}%/${RAM_PERCENT}% | 📅 ${DATE_FMT} 🕐 ${TIME_FMT}"
echo -e "${LINE1}\n${LINE2}\n${LINE3}"
```

## 🎯 Customizar Truncamento

### Tamanho Máximo do Título

Edite linha 111-117 do `statusline.sh`:

```bash
# Tamanho atual: 35 caracteres
local max_len=35

# Aumentar para 50
local max_len=50

# Remover truncamento completamente
# Comente as linhas 111-117
```

## 📁 Customizar Tab Title

Edite `~/.aios-core/infrastructure/scripts/terminal/update-tab-title.sh`:

### Adicionar Prefixo/Sufixo

```bash
# Linha 86 (antes de set_tab_title)
title="[AIOS] ${title}"  # Prefixo
title="${title} - 2026"  # Sufixo
```

### Truncar Tab Title

```bash
# Após linha 83
if [ ${#title} -gt 30 ]; then
  title="${title:0:27}..."
fi
```

## 🔧 Exemplos Completos

### Tema Minimalista

```bash
# statusline.sh - linha 171
OUTPUT="🤖 ${MODEL} | ${CTX_PERCENT}% | \$${COST_FMT}"
```

### Tema Rico (3 linhas)

```bash
LINE1="🤖 ${CYAN}${MODEL}${RESET} | ${PROGRESS_BAR} ${BOLD}${CTX_PERCENT}%${RESET} ${TOKENS_FMT}"
LINE2="💰 ${YELLOW}\$${COST_FMT}${RESET} ⏱ ${DURATION_FMT} | ${BOLD}${AIOS_CONTEXT}${RESET}"
LINE3="📁 ${BLUE}${SHORT_CWD}:${BRANCH}${RESET} | 💻 ${CPU}%/${RAM_PERCENT}% | 📅 ${DATE_FMT} 🕐 ${TIME_FMT}"
echo -e "${LINE1}\n${LINE2}\n${LINE3}"
```

### Tema Cyberpunk (roxo e neon)

```bash
# Cores
CYAN='\033[1;35m'      # Magenta brilhante
YELLOW='\033[1;36m'    # Ciano brilhante
GREEN='\033[1;32m'     # Verde brilhante
BAR_COLOR='\033[1;35m' # Sempre magenta

# Progress bar com caracteres diferentes
PROGRESS_BAR="${PROGRESS_BAR}▰"  # Cheio
PROGRESS_BAR="${PROGRESS_BAR}▱"  # Vazio
```

## 💾 Salvar Customizações

Após editar `statusline.sh`:

```bash
# 1. Salvar backup
cp ~/.claude/statusline.sh ~/.claude/statusline.backup.sh

# 2. Testar mudanças
# Reiniciar Claude Code e verificar

# 3. Se algo der errado, restaurar backup
cp ~/.claude/statusline.backup.sh ~/.claude/statusline.sh
```

## 🎨 Galeria de Temas

### Tema Dark Mode
```bash
CYAN='\033[0;37m'      # Branco
YELLOW='\033[1;33m'    # Amarelo
BLUE='\033[0;90m'      # Cinza escuro
```

### Tema Ocean
```bash
CYAN='\033[0;36m'      # Ciano
BLUE='\033[0;34m'      # Azul
GREEN='\033[0;32m'     # Verde água
```

### Tema Fire
```bash
CYAN='\033[1;31m'      # Vermelho brilhante
YELLOW='\033[1;33m'    # Amarelo brilhante
GREEN='\033[0;33m'     # Laranja
```

---

**Divirta-se customizando!** 🎨

Se criar um tema legal, compartilhe com a comunidade!
