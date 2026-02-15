# Guía de Integración con IDEs

> **ES**

---

Guía para integrar AIOS con IDEs compatibles y plataformas de desarrollo con IA.

**Versión:** 2.1.0
**Última Actualización:** 2026-01-28

---

## IDEs Compatibles

AIOS es compatible con 9 plataformas de desarrollo potenciadas por IA. Elige la que mejor se adapte a tu flujo de trabajo.

### Tabla de Comparación Rápida

| Característica       | Claude Code |  Cursor  | Windsurf |  Cline   | Copilot | AntiGravity | Roo Code | Gemini CLI |   Trae   |
| -------------------- | :---------: | :------: | :------: | :------: | :-----: | :---------: | :------: | :--------: | :------: |
| **Activación de Agentes** |  /command   | @mention | @mention | @mention | 4 Modos |  Workflow   |   Mode   |   Prompt   | @mention |
| **Soporte MCP**      |   Native    |  Config  |  Config  | Limited  |   Yes   |   Native    |    No    |     No     | Limited  |
| **Tareas de Subagentes**   |     Yes     |    No    |    No    |    No    |   Yes   |     Yes     |    No    |     No     |    No    |
| **Auto-sync**        |     Yes     |   Yes    |   Yes    |   Yes    |   Yes   |     Yes     |   Yes    |    Yes     |   Yes    |
| **Sistema de Hooks**     |     Yes     |    No    |    No    |    No    |   No    |     No      |    No    |     No     |    No    |
| **Skills/Commands**  |   Native    |    No    |    No    |    No    |   No    |     No      |    No    |     No     |    No    |
| **Recomendación**   |    Best     |   Best   |   Good   |   Good   |  Good   |    Good     |  Basic   |   Basic    |  Basic   |

---

## Instrucciones de Configuración

### Claude Code

**Nivel de Recomendación:** Mejor integración con AIOS

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

**Configuración:**

1. AIOS crea automáticamente el directorio `.claude/` al inicializar
2. Los agentes están disponibles como comandos slash: `/dev`, `/qa`, `/architect`
3. Configura servidores MCP en `~/.claude.json`

**Configuración:**

```bash
# Sincronizar agentes a Claude Code
npm run sync:agents -- --platform claude

# Verificar configuración
ls -la .claude/commands/AIOS/agents/
```

---

### Cursor

**Nivel de Recomendación:** Mejor (IDE IA popular)

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

**Configuración:**

1. AIOS crea el directorio `.cursor/` al inicializar
2. Los agentes se activan con @mention: `@dev`, `@qa`
3. Las reglas se sincronizan a `.cursor/rules/`

**Configuración:**

```bash
# Sincronizar agentes a Cursor
npm run sync:agents -- --platform cursor

# Verificar configuración
ls -la .cursor/rules/
```

**Configuración MCP (`.cursor/mcp.json`):**

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

**Nivel de Recomendación:** Bueno (flujo Cascade)

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

**Configuración:**

1. AIOS crea el directorio `.windsurf/` y el archivo `.windsurfrules`
2. Los agentes se activan con @mention
3. Soporta flujo Cascade para tareas multi-paso

**Configuración:**

```bash
# Sincronizar agentes a Windsurf
npm run sync:agents -- --platform windsurf

# Verificar configuración
cat .windsurfrules
ls -la .windsurf/rules/
```

---

### Cline

**Nivel de Recomendación:** Bueno (integración con VS Code)

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

**Configuración:**

1. Instala la extensión Cline para VS Code
2. AIOS crea el directorio `.cline/` al inicializar
3. Los agentes se sincronizan a `.cline/agents/`

**Configuración:**

```bash
# Sincronizar agentes a Cline
npm run sync:agents -- --platform cline

# Verificar configuración
ls -la .cline/agents/
```

---

### GitHub Copilot

**Nivel de Recomendación:** Bueno (integración con GitHub)

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

**Configuración:**

1. Habilita GitHub Copilot en tu repositorio
2. AIOS crea `.github/copilot-instructions.md`
3. Las instrucciones del agente se sincronizan

**Configuración:**

```bash
# Sincronizar agentes a GitHub Copilot
npm run sync:agents -- --platform github-copilot

# Verificar configuración
cat .github/copilot-instructions.md
```

---

### AntiGravity

**Nivel de Recomendación:** Bueno (integración con Google)

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

**Configuración:**

1. AIOS crea el directorio `.antigravity/`
2. Configura las credenciales de Google Cloud
3. Los agentes se sincronizan como workflows

---

### Roo Code

**Nivel de Recomendación:** Básico

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

**Nivel de Recomendación:** Básico

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

**Nivel de Recomendación:** Básico

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

## Sistema de Sincronización

### Cómo Funciona la Sincronización

AIOS mantiene una única fuente de verdad para las definiciones de agentes y las sincroniza con todos los IDEs configurados:

```
┌─────────────────────────────────────────────────────┐
│                    AIOS Core                         │
│  .aios-core/development/agents/  (Fuente de Verdad) │
│                        │                             │
│            ┌───────────┼───────────┐                │
│            ▼           ▼           ▼                │
│  .claude/     .cursor/     .windsurf/               │
│  .cline/      .github/     .antigravity/            │
│  .roo/        .gemini/     .trae/                   │
└─────────────────────────────────────────────────────┘
```

### Comandos de Sincronización

```bash
# Sincronizar todos los agentes a todas las plataformas
npm run sync:agents

# Sincronizar a plataforma específica
npm run sync:agents -- --platform cursor

# Sincronizar agente específico
npm run sync:agents -- --agent dev

# Ejecución en seco (previsualizar cambios)
npm run sync:agents -- --dry-run

# Sincronización forzada (sobrescribir)
npm run sync:agents -- --force
```

### Sincronización Automática

AIOS puede configurarse para sincronizar automáticamente cuando hay cambios en los agentes:

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

## Solución de Problemas

### El Agente No Aparece en el IDE

```bash
# Verificar que el agente existe en la fuente
ls .aios-core/development/agents/

# Forzar sincronización
npm run sync:agents -- --force

# Revisar directorio específico de la plataforma
ls .cursor/rules/  # Para Cursor
ls .claude/commands/AIOS/agents/  # Para Claude Code
```

### Conflictos de Sincronización

```bash
# Previsualizar qué cambiaría
npm run sync:agents -- --dry-run

# Hacer respaldo antes de sincronización forzada
cp -r .cursor/rules/ .cursor/rules.backup/
npm run sync:agents -- --force
```

### MCP No Funciona

```bash
# Revisar estado de MCP
aios mcp status

# Verificar configuración de MCP para el IDE
cat ~/.claude.json  # Para Claude Code
cat .cursor/mcp.json  # Para Cursor
```

### Problemas Específicos del IDE

**Claude Code:**

- Asegúrate de que `.claude/` esté en la raíz del proyecto
- Revisa permisos de hooks: `chmod +x .claude/hooks/*.py`

**Cursor:**

- Reinicia Cursor después de la sincronización
- Revisa permisos de `.cursor/rules/`

**Windsurf:**

- Verifica que `.windsurfrules` existe en la raíz
- Revisa sintaxis con validador YAML

---

## Guía de Decisión de Plataforma

Usa esta guía para elegir la plataforma correcta:

```
¿Usas la API de Claude/Anthropic?
├── Sí --> Claude Code (Mejor integración con AIOS)
└── No
    └── ¿Prefieres VS Code?
        ├── Sí --> ¿Quieres una extensión?
        │   ├── Sí --> Cline (Integración completa con VS Code)
        │   └── No --> GitHub Copilot (Características nativas de GitHub)
        └── No --> ¿Quieres un IDE IA dedicado?
            ├── Sí --> ¿Qué modelo prefieres?
            │   ├── Claude/GPT --> Cursor (IDE IA más popular)
            │   └── Múltiples --> Windsurf (flujo Cascade)
            └── No --> ¿Usas Google Cloud?
                ├── Sí --> AntiGravity (integración con Google)
                └── No --> Gemini CLI / Trae / Roo (Especializados)
```

---

## Migración Entre IDEs

### De Cursor a Claude Code

```bash
# Exportar reglas actuales
cp -r .cursor/rules/ ./rules-backup/

# Inicializar Claude Code
npm run sync:agents -- --platform claude

# Verificar migración
diff -r ./rules-backup/ .claude/commands/AIOS/agents/
```

### De Claude Code a Cursor

```bash
# Sincronizar a Cursor
npm run sync:agents -- --platform cursor

# Configurar MCP (si es necesario)
# Copiar configuración de MCP a .cursor/mcp.json
```

---

## Documentación Relacionada

- [Guías de Plataformas](./platforms/README.md)
- [Guía de Claude Code](./platforms/claude-code.md)
- [Guía de Cursor](./platforms/cursor.md)
- [Guía de Referencia de Agentes](./agent-reference-guide.md)
- [Configuración Global de MCP](./guides/mcp-global-setup.md)

---

_Guía de Integración con IDEs de Synkra AIOS v4.0_
