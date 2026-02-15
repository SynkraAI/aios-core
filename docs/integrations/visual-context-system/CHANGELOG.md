# Changelog

Histórico de mudanças do AIOS Visual Context System.

## [2.0.0] - 2026-02-12

### ✨ Adicionado

- **Emoji Temático no Título**: Agora você pode adicionar um emoji personalizado ao título usando `--emoji` flag
  ```bash
  npx aios-core context set-title "Design System" --emoji 🎨
  ```
- **Formato de 2 Linhas**: Statusline otimizado em 2 linhas curtas para não comprimir área de input
  - Linha 1: Métricas da sessão Claude + contexto AIOS
  - Linha 2: Sistema e localização (dir, branch, CPU/RAM, data/hora)
- Campo `titleEmoji` em `.aios/session.json` para armazenar emoji do título
- Suporte a emoji tanto no tab title quanto no statusline

### 🔄 Modificado

- **statusline.sh**: Reformatado para 2 linhas com suporte a `titleEmoji`
- **update-tab-title.sh**: Atualizado para usar `titleEmoji` quando disponível
- **set-title.js**: Adicionado parsing e salvamento de `--emoji` flag
- Truncamento inteligente de títulos longos (35 chars) mantendo emoji visível

### 🐛 Corrigido

- Statusline não quebra mais em 3-4 linhas comprimindo área de input
- Títulos longos agora são truncados de forma inteligente com "..."

### 📚 Documentação

- README.md atualizado com exemplos de emoji temático
- CHANGELOG.md criado para rastrear mudanças
- Exemplos atualizados com novo formato de session.json

---

## [1.0.0] - 2026-02-10

### ✨ Lançamento Inicial

- Statusline customizado para Claude Code
- Integração com terminal (tab title)
- Progress bar visual de contexto
- Exibição de métricas (custo, tempo, tokens)
- Integração com AIOS context
- Comandos CLI (`set-title`, `set`, `show`, `clear`)
- Documentação completa (INSTALL, QUICK-START, CUSTOMIZATION)
- Mensagens para compartilhamento no WhatsApp
