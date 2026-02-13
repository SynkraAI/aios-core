# AIOS Visual Context System 🎨

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/luizfosc/aios-visual-context-system)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![AIOS Compatible](https://img.shields.io/badge/AIOS-Compatible-success.svg)](https://github.com/SynkraAI/aios-core)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-2.0%2B-purple.svg)](https://claude.ai/code)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux-lightgrey.svg)]()
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](CONTRIBUTING.md)

Sistema completo de statusline e integração de terminal para Claude Code com suporte a contexto AIOS rico e emoji temático.

![AIOS Visual Context System](docs/images/hero-banner.png)

*Visual Context System em ação: Tab title com emoji (topo) e statusline completo (embaixo)*

## ✨ Features

- 🎨 **Emoji Temático** - Adicione emoji personalizado ao título para organização visual por tema
- 📊 **Statusline Rico** - Visualize modelo, custo, duração, tokens e progress bar em tempo real
- 📐 **Formato de 2 Linhas** - Layout otimizado que não comprime a área de input
- 🖥️ **Terminal Integration** - Atualização automática do título da aba ao mudar de contexto
- ⚙️ **AIOS CLI Integration** - Comandos nativos integrados ao framework AIOS
- 💻 **System Monitoring** - CPU, RAM, data e hora em tempo real
- 🎯 **Multi-Project Support** - Contextos diferentes para cada projeto
- 🌈 **Customizável** - Cores, formato e elementos totalmente configuráveis

## 📸 Preview

### Statusline Completo

**Linha 1:** Métricas da sessão Claude + contexto AIOS
```
🤖 Sonnet 4.5 | ██████░░░░ 60% 120k | 💰 $3.45 ⏱ 5m | 🎨 Design System
```

**Linha 2:** Sistema e localização
```
📁 ~/aios-core:main | 💻 35%/72% | 📅 12/02/26 🕐 19:35
```

### Terminal Tab Title

Título da aba atualiza automaticamente com emoji temático:
```
🎨 Design Futurista
```

### Emoji Themes em Ação

Organize visualmente seus projetos por tema:
- 🎨 Design
- ⚙️ Backend
- 🧠 Mind Cloning
- 📢 Marketing

## 🚀 Quick Start

### Instalação Rápida (3 passos)

```bash
# 1. Copiar statusline.sh
cp statusline.sh ~/.claude/
chmod +x ~/.claude/statusline.sh

# 2. Configurar Claude Code (~/.claude/settings.json)
{
  "statusLine": {
    "type": "command",
    "command": "/Users/SEU_USUARIO/.claude/statusline.sh"
  }
}

# 3. Reiniciar Claude Code
# Ver resultado! ✨
```

**⚠️ IMPORTANTE:** Substitua `SEU_USUARIO` pelo seu nome de usuário real.

### Primeiro Uso

```bash
# Definir título com emoji temático
npx aios-core context set-title "Design System" --emoji 🎨

# Definir progresso
npx aios-core context set "aios-core" --progress "5/10"

# Ver contexto atual
npx aios-core context show

# Limpar título
npx aios-core context set-title --clear
```

## 📚 Documentação Completa

| Documento | Descrição |
|-----------|-----------|
| [INSTALL.md](docs/INSTALL.md) | Guia completo de instalação passo a passo |
| [QUICK-START.md](docs/QUICK-START.md) | Começar a usar em 5 minutos |
| [CUSTOMIZATION.md](docs/CUSTOMIZATION.md) | Personalizar cores, formato e elementos |
| [CHANGELOG.md](docs/CHANGELOG.md) | Histórico de versões e mudanças |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Como contribuir com o projeto |

## 🎯 Casos de Uso

### Organização por Tema

```bash
# Design
npx aios-core context set-title "Design System" --emoji 🎨

# Backend Development
npx aios-core context set-title "API Development" --emoji ⚙️

# Mind Cloning
npx aios-core context set-title "Alex Hormozi Clone" --emoji 🧠

# Marketing
npx aios-core context set-title "Campaign Launch" --emoji 📢
```

### Multi-Project Workflow

```bash
# Projeto A
cd ~/projeto-a
npx aios-core context set-title "Projeto A" --emoji 🚀 --progress "3/10"

# Projeto B
cd ~/projeto-b
npx aios-core context set-title "Projeto B" --emoji 🏗️ --progress "7/15"

# Contextos independentes por projeto! ✨
```

### Tracking de Progresso

```bash
# Início do sprint
npx aios-core context set "meu-app" --progress "0/10"

# Durante o desenvolvimento
npx aios-core context set "meu-app" --progress "5/10"

# Fim do sprint
npx aios-core context set "meu-app" --progress "10/10" --emoji ✅
```

## 📊 O que Mostra

### Métricas de Sessão (Linha 1)

| Elemento | Descrição | Exemplo |
|----------|-----------|---------|
| 🤖 Model | Modelo de IA em uso | `Sonnet 4.5` |
| Progress Bar | Uso de contexto visual | `██████░░░░` |
| Percentual | % de contexto usado | `60%` |
| Tokens | Tokens consumidos | `120k` |
| 💰 Cost | Custo da sessão | `$3.45` |
| ⏱ Duration | Tempo decorrido | `5m` |
| Context | Contexto AIOS customizado | `🎨 Design System` |

### Sistema e Localização (Linha 2)

| Elemento | Descrição | Exemplo |
|----------|-----------|---------|
| 📁 Directory | Diretório atual | `~/aios-core` |
| Branch | Branch git | `main` |
| 💻 CPU/RAM | Recursos do sistema | `35%/72%` |
| 📅 Date | Data atual | `12/02/26` |
| 🕐 Time | Hora atual | `19:35` |

## 🎨 Emoji Recomendados por Tema

| Tema | Emoji | Comando |
|------|-------|---------|
| Design | 🎨 | `--emoji 🎨` |
| Backend | ⚙️ | `--emoji ⚙️` |
| Frontend | ⚛️ | `--emoji ⚛️` |
| Mind Cloning | 🧠 | `--emoji 🧠` |
| Database | 🗄️ | `--emoji 🗄️` |
| Testing | 🧪 | `--emoji 🧪` |
| Deploy | 🚀 | `--emoji 🚀` |
| Marketing | 📢 | `--emoji 📢` |
| Documentation | 📚 | `--emoji 📚` |
| Bug Fix | 🐛 | `--emoji 🐛` |
| Security | 🔒 | `--emoji 🔒` |
| Performance | ⚡ | `--emoji ⚡` |

## 🛠️ Requisitos

### Obrigatórios

- **Claude Code** 2.0+
- **macOS** (Sequoia 15+) ou **Linux**
- **jq** para parsing JSON
- **Shell:** zsh, bash ou fish

### Recomendados

- **iTerm2** para suporte completo a emoji (no macOS)
- **AIOS Framework** para comandos CLI completos

### Verificação Rápida

```bash
# Verificar Claude Code
claude --version

# Verificar jq
jq --version

# Se não tiver jq:
brew install jq  # macOS
sudo apt-get install jq  # Linux
```

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│ Claude Code (Interface)                                 │
├─────────────────────────────────────────────────────────┤
│ ~/.claude/statusline.sh (Script Principal)             │
│ • Lê métricas do Claude Code via stdin (JSON)          │
│ • Integra com .aios/session.json                       │
│ • Renderiza 2 linhas formatadas                        │
├─────────────────────────────────────────────────────────┤
│ Terminal Integration (Opcional)                         │
│ • update-tab-title.sh - Atualiza título da aba         │
│ • zsh-integration.sh - Hooks do shell                  │
│ • prompt-injector.sh - Injeta no prompt               │
├─────────────────────────────────────────────────────────┤
│ AIOS CLI Commands (Opcional)                           │
│ • context set-title --emoji - Define título temático   │
│ • context set - Define progresso                       │
│ • context show - Visualiza estado                      │
└─────────────────────────────────────────────────────────┘
```

## 🔧 Customização

### Cores

Edite `~/.claude/statusline.sh` (linhas 8-15):

```bash
# Cores padrão
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'

# Tema customizado (exemplo: roxo)
CYAN='\033[0;35m'    # Magenta
YELLOW='\033[1;35m'  # Magenta brilhante
```

### Progress Bar

Mudar caracteres (linhas 159-165):

```bash
# Padrão
PROGRESS_BAR="${PROGRESS_BAR}█"  # Cheio
PROGRESS_BAR="${PROGRESS_BAR}░"  # Vazio

# Alternativas
PROGRESS_BAR="${PROGRESS_BAR}●"  # Círculos
PROGRESS_BAR="${PROGRESS_BAR}▰"  # Barras
```

Ver [CUSTOMIZATION.md](docs/CUSTOMIZATION.md) para guia completo.

## 🤝 Contribuindo

Contribuições são muito bem-vindas! Veja [CONTRIBUTING.md](CONTRIBUTING.md) para:

- 🐛 Reportar bugs
- ✨ Sugerir features
- 🔧 Enviar pull requests
- 📚 Melhorar documentação

## 📝 Changelog

### [2.0.0] - 2026-02-12

#### ✨ Adicionado
- **Emoji Temático** - Flag `--emoji` no comando `set-title`
- **Formato de 2 Linhas** - Layout otimizado
- Campo `titleEmoji` em `.aios/session.json`

#### 🔄 Modificado
- Statusline reformatado para 2 linhas
- Terminal integration atualizada
- Truncamento inteligente de títulos longos

#### 🐛 Corrigido
- Statusline não comprime mais área de input
- Títulos longos truncados corretamente

Ver [CHANGELOG.md](docs/CHANGELOG.md) completo.

## 📄 Licença

MIT License - Copyright (c) 2026 Luiz Fosc

Ver [LICENSE](LICENSE) para detalhes completos.

## 🙏 Créditos

Desenvolvido com ❤️ por [Luiz Fosc](https://github.com/luizfosc)

Para o [AIOS Framework](https://github.com/SynkraAI/aios-core) (Synkra AI Operating System)

### Agradecimentos

- [Claude Code](https://claude.ai/code) - Plataforma incrível
- [AIOS Community](https://discord.gg/gk8jAdXWmj) - Feedback e suporte
- Todos os [contribuidores](https://github.com/luizfosc/aios-visual-context-system/graphs/contributors)

## 🔗 Links

- **Repository**: https://github.com/luizfosc/aios-visual-context-system
- **AIOS Framework**: https://github.com/SynkraAI/aios-core
- **Claude Code**: https://claude.ai/code
- **Issues**: https://github.com/luizfosc/aios-visual-context-system/issues
- **Discord**: https://discord.gg/gk8jAdXWmj

---

<p align="center">
  <strong>Transforme sua experiência com Claude Code! 🚀</strong><br>
  Feito com ❤️ para a comunidade AIOS
</p>
