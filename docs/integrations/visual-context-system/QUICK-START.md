# Quick Start - AIOS Visual Context System

Comece a usar o Visual Context System em 5 minutos!

## 🚀 Início Rápido (3 passos)

### 1. Instalar Statusline

```bash
# Copiar script
cp statusline.sh ~/.claude/
chmod +x ~/.claude/statusline.sh

# Configurar Claude Code (~/.claude/settings.json)
{
  "statusLine": {
    "type": "command",
    "command": "/Users/SEU_USUARIO/.claude/statusline.sh"
  }
}
```

### 2. Reiniciar Claude Code

Feche e abra o Claude Code novamente.

### 3. Ver o Resultado! ✨

Você deve ver:
```
🤖 Sonnet 4.5 | ████░░ 75% 150k | 💰 $5.23 ⏱ 10m
📁 ~/seu-projeto:main | 💻 45%/75% | 📅 12/02/26 🕐 19:35
```

## 🎨 Usar com AIOS (Opcional)

Se você usa o AIOS Framework, pode customizar o contexto:

### Definir título com emoji temático

```bash
# Design
npx aios-core context set-title "Design System" --emoji 🎨

# Backend
npx aios-core context set-title "API Development" --emoji ⚙️

# Mind Cloning
npx aios-core context set-title "Tim Ferriss Clone" --emoji 🧠
```

### Definir progresso

```bash
npx aios-core context set "meu-projeto" --progress "3/10"
```

### Ver contexto atual

```bash
npx aios-core context show
```

### Limpar título customizado

```bash
npx aios-core context set-title --clear
```

## 📊 Entendendo o Statusline

### Linha 1: Métricas da Sessão
```
🤖 Sonnet 4.5 | ████░░ 75% 150k | 💰 $5.23 ⏱ 10m | 🎨 Design System
```

- `🤖 Sonnet 4.5` - Modelo de IA em uso
- `████░░` - Progress bar visual (contexto usado)
- `75%` - Percentual de contexto usado
- `150k` - Tokens usados (150 mil)
- `💰 $5.23` - Custo da sessão atual
- `⏱ 10m` - Tempo decorrido
- `🎨 Design System` - Contexto AIOS (se configurado)

### Linha 2: Sistema e Localização
```
📁 ~/aios-core:main | 💻 45%/75% | 📅 12/02/26 🕐 19:35
```

- `📁 ~/aios-core:main` - Diretório atual e branch git
- `💻 45%/75%` - CPU e RAM do sistema
- `📅 12/02/26` - Data atual
- `🕐 19:35` - Hora atual

## 🎯 Casos de Uso Comuns

### Trabalho Temático

```bash
# Começar sessão de design
npx aios-core context set-title "Design Sprint" --emoji 🎨

# Trabalhar em backend
npx aios-core context set-title "API Refactor" --emoji ⚙️

# Sessão de brainstorming
npx aios-core context set-title "Ideation" --emoji 💡
```

### Projetos Diferentes

```bash
# Projeto A
cd ~/projeto-a
npx aios-core context set-title "Projeto A" --emoji 🚀

# Projeto B
cd ~/projeto-b
npx aios-core context set-title "Projeto B" --emoji 🏗️
```

### Tracking de Progresso

```bash
# Início do dia
npx aios-core context set "meu-app" --progress "0/10"

# Meio do dia
npx aios-core context set "meu-app" --progress "5/10"

# Fim do dia
npx aios-core context set "meu-app" --progress "8/10"
```

## 💡 Dicas Rápidas

### Emojis Recomendados por Tema

| Tema | Emoji | Comando |
|------|-------|---------|
| Design | 🎨 | `--emoji 🎨` |
| Backend | ⚙️ | `--emoji ⚙️` |
| Frontend | ⚛️ | `--emoji ⚛️` |
| Mind Clone | 🧠 | `--emoji 🧠` |
| Database | 🗄️ | `--emoji 🗄️` |
| Testing | 🧪 | `--emoji 🧪` |
| Deploy | 🚀 | `--emoji 🚀` |
| Marketing | 📢 | `--emoji 📢` |
| Docs | 📚 | `--emoji 📚` |
| Bug Fix | 🐛 | `--emoji 🐛` |

### Copiar Emoji Rapidamente

**macOS**: Cmd + Ctrl + Space (abre seletor de emoji)
**Windows**: Win + . (ponto)
**Linux**: Ctrl + . (ou Ctrl + ;)

### Ver Ajuda Completa

```bash
npx aios-core context help
```

## 🔧 Próximos Passos

- [CUSTOMIZATION.md](CUSTOMIZATION.md) - Personalizar cores e formato
- [INSTALL.md](INSTALL.md) - Guia completo de instalação
- [CHANGELOG.md](CHANGELOG.md) - Ver novidades da versão

---

**Pronto para começar!** 🎉

Experimente definir seu primeiro título temático agora:
```bash
npx aios-core context set-title "Meu Projeto Show" --emoji 🚀
```
