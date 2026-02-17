<!-- Tradução: PT-BR | Original: /docs/en/architecture/mcp-system-diagrams.md | Sincronização: 2026-01-26 -->

# Sistema MCP Global - Diagramas de Arquitetura

> 🌐 [EN](../../architecture/mcp-system-diagrams.md) | **PT** | [ES](../../es/architecture/mcp-system-diagrams.md)

---

**Story:** 2.11 - Sistema MCP Global
**Gerado por:** CodeRabbit (PR #16)
**Data:** 2025-12-01

---

## Fluxo de Setup do MCP

```mermaid
sequenceDiagram
    actor User as Usuário
    participant CLI as CLI<br/>(mcp setup)
    participant Mgr as Gerenciador<br/>de Config
    participant FS as Sistema de<br/>Arquivos
    participant Detector as Detector<br/>de SO

    User->>CLI: mcp setup [--servers]
    CLI->>Detector: getGlobalMcpDir()
    Detector-->>CLI: ~home/.aios/mcp
    CLI->>Mgr: createGlobalStructure()
    Mgr->>FS: mkdir ~/.aios/mcp/servers
    Mgr->>FS: mkdir ~/.aios/mcp/cache
    Mgr->>FS: touch .gitignore
    FS-->>Mgr: criado
    CLI->>Mgr: createGlobalConfig(servers)
    Mgr->>Mgr: getServerTemplate(name)
    Mgr->>FS: write config.json
    FS-->>Mgr: sucesso
    Mgr-->>CLI: config criada
    CLI-->>User: ✓ MCP Global configurado
```

---

## Fluxo de Link do MCP (com Migração)

```mermaid
sequenceDiagram
    actor User as Usuário
    participant CLI as CLI<br/>(mcp link)
    participant Symlink as Gerenciador<br/>de Symlink
    participant Migrator as Migrador<br/>de Config
    participant Mgr as Gerenciador<br/>de Config
    participant FS as Sistema de<br/>Arquivos

    User->>CLI: mcp link [--migrate]
    CLI->>Symlink: checkLinkStatus(projectRoot)
    Symlink->>FS: verificar ./mcp existe
    FS-->>Symlink: não_linkado
    alt flag --migrate definida
        CLI->>Migrator: analyzeMigration()
        Migrator->>FS: detectar config ./mcp
        FS-->>Migrator: config do projeto encontrada
        Migrator-->>CLI: { recommendedOption: MIGRATE }
        CLI->>Migrator: executeMigration(MIGRATE)
        Migrator->>Mgr: readGlobalConfig()
        Migrator->>Mgr: mergeServers(global, project)
        Migrator->>Mgr: writeGlobalConfig(merged)
        Mgr-->>Migrator: sucesso
    end
    CLI->>Symlink: createLink(projectRoot)
    Symlink->>FS: criar symlink/junction ./mcp → ~/.aios/mcp
    FS-->>Symlink: linkado
    Symlink-->>CLI: sucesso
    CLI-->>User: ✓ Projeto linkado à config global
```

---

## Visão Geral dos Componentes

### Módulos Core

| Módulo | Arquivo | Propósito |
|--------|---------|-----------|
| **Detector de SO** | `core/mcp/os-detector.js` | Detecção de SO/path cross-platform |
| **Gerenciador de Config** | `core/mcp/global-config-manager.js` | CRUD de config global e templates de servidor |
| **Gerenciador de Symlink** | `core/mcp/symlink-manager.js` | Gerenciamento de links symlink/junction |
| **Migrador de Config** | `core/mcp/config-migrator.js` | Migração projeto-para-global com merge |

### Comandos CLI

| Comando | Arquivo | Propósito |
|---------|---------|-----------|
| `mcp setup` | `cli/commands/mcp/setup.js` | Configurar config global |
| `mcp link` | `cli/commands/mcp/link.js` | Linkar projeto ao global |
| `mcp status` | `cli/commands/mcp/status.js` | Mostrar status da config |
| `mcp add` | `cli/commands/mcp/add.js` | Adicionar/remover/habilitar servidores |

---

## Análise de Complexidade (CodeRabbit)

| Componente | Complexidade | Áreas-Chave |
|------------|--------------|-------------|
| **config-migrator.js** | Alta | Lógica de migração multi-path, merge de servidores, resolução de conflitos |
| **symlink-manager.js** | Média | Links cross-platform (symlinks Unix, junctions Windows) |
| **global-config-manager.js** | Média | Sistema de templates de servidor com persistência por servidor |
| **Orquestração CLI** | Média | Validação multi-etapa, prompts de usuário |

**Esforço Estimado de Revisão:** 🎯 4 (Complexo) | ⏱️ ~60 minutos

---

*Gerado a partir da revisão de PR do CodeRabbit - Story 2.11*
