<!-- Traducción: ES | Original: /docs/en/architecture/mcp-system-diagrams.md | Sincronización: 2026-01-26 -->

# MCP System Global - Diagramas de Arquitectura

> 🌐 [EN](../../architecture/mcp-system-diagrams.md) | [PT](../../pt/architecture/mcp-system-diagrams.md) | **ES**

---

**Historia:** 2.11 - MCP System Global
**Generado por:** CodeRabbit (PR #16)
**Fecha:** 2025-12-01

---

## Flujo de Configuración MCP

```mermaid
sequenceDiagram
    actor User
    participant CLI as CLI<br/>(mcp setup)
    participant Mgr as Config<br/>Manager
    participant FS as Filesystem
    participant Detector as OS<br/>Detector

    User->>CLI: mcp setup [--servers]
    CLI->>Detector: getGlobalMcpDir()
    Detector-->>CLI: ~home/.aios/mcp
    CLI->>Mgr: createGlobalStructure()
    Mgr->>FS: mkdir ~/.aios/mcp/servers
    Mgr->>FS: mkdir ~/.aios/mcp/cache
    Mgr->>FS: touch .gitignore
    FS-->>Mgr: created
    CLI->>Mgr: createGlobalConfig(servers)
    Mgr->>Mgr: getServerTemplate(name)
    Mgr->>FS: write config.json
    FS-->>Mgr: success
    Mgr-->>CLI: config created
    CLI-->>User: ✓ MCP Global configurado
```

---

## Flujo de Enlace MCP (con Migración)

```mermaid
sequenceDiagram
    actor User
    participant CLI as CLI<br/>(mcp link)
    participant Symlink as Symlink<br/>Manager
    participant Migrator as Config<br/>Migrator
    participant Mgr as Config<br/>Manager
    participant FS as Filesystem

    User->>CLI: mcp link [--migrate]
    CLI->>Symlink: checkLinkStatus(projectRoot)
    Symlink->>FS: check ./mcp exists
    FS-->>Symlink: not_linked
    alt --migrate flag set
        CLI->>Migrator: analyzeMigration()
        Migrator->>FS: detect ./mcp config
        FS-->>Migrator: project config found
        Migrator-->>CLI: { recommendedOption: MIGRATE }
        CLI->>Migrator: executeMigration(MIGRATE)
        Migrator->>Mgr: readGlobalConfig()
        Migrator->>Mgr: mergeServers(global, project)
        Migrator->>Mgr: writeGlobalConfig(merged)
        Mgr-->>Migrator: success
    end
    CLI->>Symlink: createLink(projectRoot)
    Symlink->>FS: create symlink/junction ./mcp → ~/.aios/mcp
    FS-->>Symlink: linked
    Symlink-->>CLI: success
    CLI-->>User: ✓ Proyecto enlazado a config global
```

---

## Descripción General de Componentes

### Módulos Principales

| Módulo | Archivo | Propósito |
|--------|---------|-----------|
| **OS Detector** | `core/mcp/os-detector.js` | Detección multiplataforma de SO/rutas |
| **Config Manager** | `core/mcp/global-config-manager.js` | CRUD de configuración global y plantillas de servidor |
| **Symlink Manager** | `core/mcp/symlink-manager.js` | Gestión de enlaces symlink/junction |
| **Config Migrator** | `core/mcp/config-migrator.js` | Migración de proyecto a global con fusión |

### Comandos CLI

| Comando | Archivo | Propósito |
|---------|---------|-----------|
| `mcp setup` | `cli/commands/mcp/setup.js` | Configurar config global |
| `mcp link` | `cli/commands/mcp/link.js` | Enlazar proyecto a global |
| `mcp status` | `cli/commands/mcp/status.js` | Mostrar estado de config |
| `mcp add` | `cli/commands/mcp/add.js` | Agregar/eliminar/habilitar servidores |

---

## Análisis de Complejidad (CodeRabbit)

| Componente | Complejidad | Áreas Clave |
|------------|-------------|-------------|
| **config-migrator.js** | Alta | Lógica de migración multi-ruta, fusión de servidores, resolución de conflictos |
| **symlink-manager.js** | Media | Enlaces multiplataforma (symlinks Unix, junctions Windows) |
| **global-config-manager.js** | Media | Sistema de plantillas de servidor con persistencia por servidor |
| **Orquestación CLI** | Media | Validación multi-paso, solicitud al usuario |

**Esfuerzo de Revisión Estimado:** 🎯 4 (Complejo) | ⏱️ ~60 minutos

---

*Generado desde revisión de PR de CodeRabbit - Historia 2.11*
