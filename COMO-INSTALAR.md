# 📦 Como Instalar - Progress Visualizer Skill

## Instalação Rápida

### Opção 1: Global (funciona em qualquer projeto)

```bash
# 1. Criar pasta de skills global se não existir
mkdir -p ~/.claude/skills/

# 2. Extrair o zip
unzip progress-visualizer.zip -d ~/.claude/skills/

# 3. Reiniciar Claude Code
```

### Opção 2: Por projeto (apenas no projeto atual)

```bash
# 1. Ir para a raiz do projeto
cd seu-projeto/

# 2. Criar pasta de skills se não existir
mkdir -p .claude/commands/AIOS/skills/

# 3. Extrair o zip
unzip progress-visualizer.zip -d .claude/commands/AIOS/skills/

# 4. Reiniciar Claude Code
```

## Como Usar

Depois de instalada, você pode ativar a skill de várias formas:

### Via comando slash:
```
/progress-visualizer
```

### Via linguagem natural (Claude detecta automaticamente):
- "show progress"
- "onde estamos?"
- "quero ver o roadmap"
- "status visual"
- "como está o progresso?"
- "mostre um dashboard"

### Escolher estilo específico:
- "show progress as kanban"
- "quero ver roadmap horizontal"
- "mostre o quest map"
- "dashboard completo por favor"

## Pré-requisitos

- Claude Code instalado (claude.ai/code)
- Projeto usando sistema de Tasks (TaskList)
- Terminal com suporte a UTF-8 (para caracteres especiais)

## Estilos Disponíveis

1. **Dashboard Completo** - Visão completa com tabelas (padrão)
2. **Roadmap Horizontal** - Timeline linear de fases
3. **Quest Map** - Estilo RPG/jornada motivacional
4. **Kanban Board** - Colunas estilo Trello
5. **Status Rápido** - Minimalista para glance rápida

## Estrutura de Pastas

Depois de instalado, você terá:

```
~/.claude/skills/progress-visualizer/
└── SKILL.md          # Definição completa da skill

# OU (se instalou por projeto)

seu-projeto/.claude/commands/AIOS/skills/progress-visualizer/
└── SKILL.md
```

## Troubleshooting

### Skill não aparece

1. Verificar se a pasta está no lugar certo
2. Reiniciar Claude Code completamente
3. Verificar se o arquivo `SKILL.md` tem as 3 linhas iniciais com `---`

### Visualização está cortada

A skill já quebra automaticamente em chunks, mas se ainda assim ficar cortada:
- Aumentar o tamanho da janela do terminal
- Usar o estilo "Status Rápido" que é mais compacto

### Caracteres estranhos aparecendo

Seu terminal não suporta UTF-8. Configurar:
```bash
export LANG=pt_BR.UTF-8
export LC_ALL=pt_BR.UTF-8
```

## Créditos

Skill desenvolvida como parte do **AIOS (AI Operating System)** - Framework para desenvolvimento com IA.

GitHub: [SynkraAI/aios-core](https://github.com/SynkraAI/aios-core)

---

**Aproveite! 🚀**
