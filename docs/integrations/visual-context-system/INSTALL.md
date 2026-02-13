# Guia de Instalação - AIOS Visual Context System

Guia completo para instalar e configurar o Visual Context System.

## 📋 Pré-requisitos

### Obrigatórios
- **Claude Code 2.0+** instalado
- **jq** para parsing JSON

### Verificar jq

```bash
# Verificar se jq está instalado
which jq

# Se não estiver instalado:
# macOS
brew install jq

# Linux (Ubuntu/Debian)
sudo apt-get install jq

# Linux (Fedora)
sudo dnf install jq
```

## 🚀 Instalação

### Passo 1: Copiar Statusline Script

```bash
# Copiar statusline.sh para diretório do Claude Code
cp statusline.sh ~/.claude/

# Dar permissão de execução
chmod +x ~/.claude/statusline.sh
```

### Passo 2: Configurar Claude Code

Edite `~/.claude/settings.json` e adicione:

```json
{
  "statusLine": {
    "type": "command",
    "command": "/Users/SEU_USUARIO/.claude/statusline.sh"
  }
}
```

**⚠️ IMPORTANTE**: Substitua `SEU_USUARIO` pelo seu nome de usuário!

```bash
# Descobrir seu nome de usuário
echo $HOME
# Resultado: /Users/luizfosc
# Use: /Users/luizfosc/.claude/statusline.sh
```

### Passo 3: Instalar Terminal Integration (Opcional mas Recomendado)

```bash
# Copiar scripts de integração
mkdir -p ~/.aios-core/infrastructure/scripts/terminal
cp terminal-integration/*.sh ~/.aios-core/infrastructure/scripts/terminal/

# Dar permissões de execução
chmod +x ~/.aios-core/infrastructure/scripts/terminal/*.sh

# Adicionar ao seu ~/.zshrc (zsh) ou ~/.bashrc (bash)
echo 'source ~/.aios-core/infrastructure/scripts/terminal/zsh-integration.sh' >> ~/.zshrc

# Recarregar shell
source ~/.zshrc
```

### Passo 4: Instalar CLI Commands (Se usar AIOS)

Se você usa o AIOS Framework:

```bash
# Copiar comando set-title
cp cli-commands/set-title.js ~/aios-core/.aios-core/cli/commands/context/

# O comando já estará disponível via npx aios-core
```

## ✅ Verificar Instalação

### 1. Verificar Statusline

```bash
# Reiniciar Claude Code
# O statusline deve aparecer na parte superior/inferior
```

Você deve ver algo como:
```
🤖 Sonnet 4.5 | ████░░ 75% 150k | 💰 $5.23 ⏱ 10m | 🎨 Meu Projeto
📁 ~/aios-core:main | 💻 45%/75% | 📅 12/02/26 🕐 19:35
```

### 2. Verificar Tab Title (se instalou terminal integration)

```bash
# Mudar para diretório com .aios/session.json
cd ~/aios-core

# O título da aba deve atualizar automaticamente
```

### 3. Testar Comandos CLI (se instalou AIOS)

```bash
# Definir título com emoji
npx aios-core context set-title "Teste" --emoji 🧪

# Ver contexto atual
npx aios-core context show
```

## 🔧 Solução de Problemas

### Statusline não aparece

1. Verificar se settings.json está correto
2. Verificar caminho completo do statusline.sh
3. Reiniciar Claude Code completamente

### Erros de jq

```bash
# Se vir erros como "jq: command not found"
brew install jq  # macOS
sudo apt-get install jq  # Linux
```

### Tab title não atualiza

1. Verificar se zsh-integration.sh foi sourced no ~/.zshrc
2. Recarregar shell: `source ~/.zshrc`
3. Verificar se .aios/session.json existe no diretório

### Statusline muito grande (área de input pequena)

Isso foi corrigido na v2.0! Se ainda ocorrer:
1. Verificar se está usando statusline.sh v2.0
2. Atualizar para versão mais recente

## 🎯 Próximos Passos

- [QUICK-START.md](QUICK-START.md) - Começar a usar
- [CUSTOMIZATION.md](CUSTOMIZATION.md) - Personalizar cores e formato
- [CHANGELOG.md](CHANGELOG.md) - Ver histórico de mudanças

---

**Instalação completa!** 🎉

Se tiver problemas, abra uma issue no GitHub ou consulte a documentação completa.
