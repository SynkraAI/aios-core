# Guia de Integração com IDEs

> **PT**

---

Guia para integrar o AIOS com IDEs e plataformas de desenvolvimento com IA suportadas.

**Versão:** 2.1.0
**Última Atualização:** 2026-01-28

---

## IDEs Suportadas

O AIOS suporta 9 plataformas de desenvolvimento com IA. Escolha a que melhor se adapta ao seu fluxo de trabalho.

### Tabela de Comparação Rápida

| Funcionalidade       | Claude Code |  Cursor  | Windsurf |  Cline   | Copilot | AntiGravity | Roo Code | Gemini CLI |   Trae   |
| -------------------- | :---------: | :------: | :------: | :------: | :-----: | :---------: | :------: | :--------: | :------: |
| **Ativação de Agente** |  /command   | @mention | @mention | @mention | 4 Modos |  Workflow   |   Mode   |   Prompt   | @mention |
| **Suporte MCP**      |   Native    |  Config  |  Config  | Limited  |   Yes   |   Native    |    No    |     No     | Limited  |
| **Tarefas de Subagente**   |     Yes     |    No    |    No    |    No    |   Yes   |     Yes     |    No    |     No     |    No    |
| **Auto-sync**        |     Yes     |   Yes    |   Yes    |   Yes    |   Yes   |     Yes     |   Yes    |    Yes     |   Yes    |
| **Sistema de Hooks**     |     Yes     |    No    |    No    |    No    |   No    |     No      |    No    |     No     |    No    |
| **Skills/Commands**  |   Native    |    No    |    No    |    No    |   No    |     No      |    No    |     No     |    No    |
| **Recomendação**   |    Best     |   Best   |   Good   |   Good   |  Good   |    Good     |  Basic   |   Basic    |  Basic   |

---

## Instruções de Configuração

### Claude Code

**Nível de Recomendação:** Melhor integração com AIOS

```yaml
config_file: .claude/CLAUDE.md
agent_folder: .claude/commands/AIOS/agents
activation: /agent-name (slash commands)
format: full-markdown-yaml
mcp_support: native
special_features:
  - Task tool for subagents
  - Native MCP integration
  - Hooks system (pre/post)
  - Custom skills
  - Memory persistence
```

**Configuração:**

1. AIOS cria automaticamente o diretório `.claude/` durante a inicialização
2. Agentes ficam disponíveis como slash commands: `/dev`, `/qa`, `/architect`
3. Configure servidores MCP em `~/.claude.json`

**Configuração:**

```bash
# Sincronizar agentes para Claude Code
npm run sync:agents -- --platform claude

# Verificar configuração
ls -la .claude/commands/AIOS/agents/
```

---

### Cursor

**Nível de Recomendação:** Melhor (IDE com IA popular)

```yaml
config_file: .cursor/rules.md
agent_folder: .cursor/rules
activation: @agent-name
format: condensed-rules
mcp_support: via configuration
special_features:
  - Composer integration
  - Chat modes
  - @codebase context
  - Multi-file editing
```

**Configuração:**

1. AIOS cria o diretório `.cursor/` durante a inicialização
2. Agentes ativados com @mention: `@dev`, `@qa`
3. Regras sincronizadas para `.cursor/rules/`

**Configuração:**

```bash
# Sincronizar agentes para Cursor
npm run sync:agents -- --platform cursor

# Verificar configuração
ls -la .cursor/rules/
```

**Configuração MCP (`.cursor/mcp.json`):**

```json
{
  "mcpServers": {
    "context7": {
      "url": "https://mcp.context7.com/sse"
    }
  }
}
```

---

### Windsurf

**Nível de Recomendação:** Bom (fluxo Cascade)

```yaml
config_file: .windsurfrules
agent_folder: .windsurf/rules
activation: @agent-name
format: xml-tagged-markdown
mcp_support: via configuration
special_features:
  - Cascade flow
  - Supercomplete
  - Flows system
```

**Configuração:**

1. AIOS cria o diretório `.windsurf/` e o arquivo `.windsurfrules`
2. Agentes ativados com @mention
3. Suporta fluxo Cascade para tarefas de múltiplas etapas

**Configuração:**

```bash
# Sincronizar agentes para Windsurf
npm run sync:agents -- --platform windsurf

# Verificar configuração
cat .windsurfrules
ls -la .windsurf/rules/
```

---

### Cline

**Nível de Recomendação:** Bom (integração com VS Code)

```yaml
config_file: .cline/rules.md
agent_folder: .cline/agents
activation: @agent-name
format: condensed-rules
mcp_support: limited
special_features:
  - VS Code integration
  - Extension ecosystem
  - Inline suggestions
```

**Configuração:**

1. Instale a extensão Cline para VS Code
2. AIOS cria o diretório `.cline/` durante a inicialização
3. Agentes sincronizados para `.cline/agents/`

**Configuração:**

```bash
# Sincronizar agentes para Cline
npm run sync:agents -- --platform cline

# Verificar configuração
ls -la .cline/agents/
```

---

### GitHub Copilot

**Nível de Recomendação:** Bom (integração com GitHub)

```yaml
config_file: .github/copilot-instructions.md
agent_folder: .github/agents
activation: chat modes
format: text
mcp_support: none
special_features:
  - GitHub integration
  - PR assistance
  - Code review
```

**Configuração:**

1. Habilite GitHub Copilot em seu repositório
2. AIOS cria `.github/copilot-instructions.md`
3. Instruções de agentes sincronizadas

**Configuração:**

```bash
# Sincronizar agentes para GitHub Copilot
npm run sync:agents -- --platform github-copilot

# Verificar configuração
cat .github/copilot-instructions.md
```

---

### AntiGravity

**Nível de Recomendação:** Bom (integração com Google)

```yaml
config_file: .antigravity/rules.md
config_json: .antigravity/antigravity.json
agent_folder: .agent/workflows
activation: workflow-based
format: cursor-style
mcp_support: native (Google)
special_features:
  - Google Cloud integration
  - Workflow system
  - Native Firebase tools
```

**Configuração:**

1. AIOS cria o diretório `.antigravity/`
2. Configure credenciais do Google Cloud
3. Agentes sincronizados como workflows

---

### Roo Code

**Nível de Recomendação:** Básico

```yaml
config_file: .roo/rules.md
agent_folder: .roo/agents
activation: mode selector
format: text
mcp_support: none
special_features:
  - Mode-based workflow
  - VS Code extension
  - Custom modes
```

---

### Gemini CLI

**Nível de Recomendação:** Básico

```yaml
config_file: .gemini/rules.md
agent_folder: .gemini/agents
activation: prompt mention
format: text
mcp_support: none
special_features:
  - Google AI models
  - CLI-based workflow
  - Multimodal support
```

---

### Trae

**Nível de Recomendação:** Básico

```yaml
config_file: .trae/rules.md
agent_folder: .trae/agents
activation: @agent-name
format: project-rules
mcp_support: limited
special_features:
  - Modern UI
  - Fast iteration
  - Builder mode
```

---

## Sistema de Sincronização

### Como Funciona a Sincronização

O AIOS mantém uma única fonte de verdade para definições de agentes e as sincroniza com todas as IDEs configuradas:

```
┌─────────────────────────────────────────────────────┐
│                    AIOS Core                         │
│  .aios-core/development/agents/  (Source of Truth)  │
│                        │                             │
│            ┌───────────┼───────────┐                │
│            ▼           ▼           ▼                │
│  .claude/     .cursor/     .windsurf/               │
│  .cline/      .github/     .antigravity/            │
│  .roo/        .gemini/     .trae/                   │
└─────────────────────────────────────────────────────┘
```

### Comandos de Sincronização

```bash
# Sincronizar todos os agentes para todas as plataformas
npm run sync:agents

# Sincronizar para plataforma específica
npm run sync:agents -- --platform cursor

# Sincronizar agente específico
npm run sync:agents -- --agent dev

# Dry run (visualizar mudanças)
npm run sync:agents -- --dry-run

# Sincronização forçada (sobrescrever)
npm run sync:agents -- --force
```

### Sincronização Automática

O AIOS pode ser configurado para sincronizar automaticamente quando houver mudanças nos agentes:

```yaml
# .aios-core/core/config/sync.yaml
auto_sync:
  enabled: true
  watch_paths:
    - .aios-core/development/agents/
  platforms:
    - claude
    - cursor
    - windsurf
```

---

## Solução de Problemas

### Agente Não Aparece na IDE

```bash
# Verificar se o agente existe na fonte
ls .aios-core/development/agents/

# Forçar sincronização
npm run sync:agents -- --force

# Verificar diretório específico da plataforma
ls .cursor/rules/  # Para Cursor
ls .claude/commands/AIOS/agents/  # Para Claude Code
```

### Conflitos de Sincronização

```bash
# Visualizar o que seria alterado
npm run sync:agents -- --dry-run

# Fazer backup antes de sincronização forçada
cp -r .cursor/rules/ .cursor/rules.backup/
npm run sync:agents -- --force
```

### MCP Não Está Funcionando

```bash
# Verificar status do MCP
aios mcp status

# Verificar configuração MCP para a IDE
cat ~/.claude.json  # Para Claude Code
cat .cursor/mcp.json  # Para Cursor
```

### Problemas Específicos da IDE

**Claude Code:**

- Certifique-se de que `.claude/` está na raiz do projeto
- Verifique permissões dos hooks: `chmod +x .claude/hooks/*.py`

**Cursor:**

- Reinicie o Cursor após sincronização
- Verifique permissões de `.cursor/rules/`

**Windsurf:**

- Verifique se `.windsurfrules` existe na raiz
- Verifique sintaxe com validador YAML

---

## Guia de Decisão de Plataforma

Use este guia para escolher a plataforma certa:

```
Você usa Claude/Anthropic API?
├── Sim --> Claude Code (Melhor integração com AIOS)
└── Não
    └── Você prefere VS Code?
        ├── Sim --> Quer uma extensão?
        │   ├── Sim --> Cline (Integração completa com VS Code)
        │   └── Não --> GitHub Copilot (Recursos nativos do GitHub)
        └── Não --> Quer uma IDE dedicada com IA?
            ├── Sim --> Qual modelo você prefere?
            │   ├── Claude/GPT --> Cursor (IDE com IA mais popular)
            │   └── Múltiplos --> Windsurf (fluxo Cascade)
            └── Não --> Usa Google Cloud?
                ├── Sim --> AntiGravity (integração com Google)
                └── Não --> Gemini CLI / Trae / Roo (Especializados)
```

---

## Migração Entre IDEs

### De Cursor para Claude Code

```bash
# Exportar regras atuais
cp -r .cursor/rules/ ./rules-backup/

# Inicializar Claude Code
npm run sync:agents -- --platform claude

# Verificar migração
diff -r ./rules-backup/ .claude/commands/AIOS/agents/
```

### De Claude Code para Cursor

```bash
# Sincronizar para Cursor
npm run sync:agents -- --platform cursor

# Configurar MCP (se necessário)
# Copiar configuração MCP para .cursor/mcp.json
```

---

## Documentação Relacionada

- [Guias de Plataforma](./platforms/README.md)
- [Guia do Claude Code](./platforms/claude-code.md)
- [Guia do Cursor](./platforms/cursor.md)
- [Guia de Referência de Agentes](./agent-reference-guide.md)
- [Configuração Global do MCP](./guides/mcp-global-setup.md)

---

_Guia de Integração com IDEs do Synkra AIOS v4.0_
