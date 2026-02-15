<!--
  Traducción: ES
  Original: /docs/en/guides/README.md
  Última sincronización: 2026-01-26
-->

# Guías de AIOS

> 🌐 [EN](../../guides/README.md) | [PT](../../pt/guides/README.md) | **ES**

---

Índice completo de documentación para las guías del sistema AIOS.

---

## Configuración de MCP (Docker MCP Toolkit)

**Estado:** Listo para Producción
**Reducción de Tokens:** 85%+ (vs MCPs directos)
**Tiempo de Configuración:** 10-20 minutos

### Inicio Rápido

**¿Desea una configuración de MCP optimizada?**
Use el agente DevOps: `@devops` luego `*setup-mcp-docker`

### Comandos de Gestión de MCP

| Comando             | Descripción                                 | Agente  |
| ------------------- | ------------------------------------------- | ------- |
| `*setup-mcp-docker` | Configuración inicial de Docker MCP Toolkit | @devops |
| `*search-mcp`       | Buscar MCPs disponibles en el catálogo      | @devops |
| `*add-mcp`          | Agregar servidor MCP al gateway de Docker   | @devops |
| `*list-mcps`        | Listar MCPs actualmente habilitados         | @devops |
| `*remove-mcp`       | Eliminar MCP del gateway de Docker          | @devops |

### Referencia de Arquitectura

| Guía                                                                           | Propósito                            | Tiempo | Audiencia          |
| ------------------------------------------------------------------------------ | ------------------------------------ | ------ | ------------------ |
| **[Guía de Configuración Global de MCP](./mcp-global-setup.md)**               | Configuración global de servidor MCP | 10 min | Todos los usuarios |
| **[Gestión de Claves API de MCP](../architecture/mcp-api-keys-management.md)** | Manejo seguro de credenciales        | 10 min | DevOps             |

> **Nota:** La documentación de 1MCP ha sido descontinuada. AIOS ahora usa Docker MCP Toolkit exclusivamente (Story 5.11). Los documentos archivados están disponibles en `.github/deprecated-docs/guides/`.

---

## Documentación del Framework v4.0.4

**Estado:** Completo (Story 2.16)
**Versión:** 2.1.0
**Última Actualización:** 2025-12-17

### Arquitectura Central

| Guía                                                                        | Propósito                                   | Tiempo | Audiencia                       |
| --------------------------------------------------------------------------- | ------------------------------------------- | ------ | ------------------------------- |
| **[Arquitectura del Sistema de Módulos](../architecture/module-system.md)** | Arquitectura modular v4.0.4 (4 módulos)       | 15 min | Arquitectos, Desarrolladores    |
| **[Guía de Descubrimiento de Servicios](./service-discovery.md)**           | API de descubrimiento y registro de workers | 10 min | Desarrolladores                 |
| **[Guía de Migración v2.0→v4.0.4](../../migration/migration-guide.md)**          | Instrucciones de migración paso a paso      | 20 min | Todos los usuarios actualizando |

### Configuración del Sistema

| Guía                                                             | Propósito                               | Tiempo | Audiencia          |
| ---------------------------------------------------------------- | --------------------------------------- | ------ | ------------------ |
| **[Guía de Quality Gates](./quality-gates.md)**                  | Sistema de quality gates de 3 capas     | 15 min | QA, DevOps         |
| **[Guía del Dashboard de Calidad](./quality-dashboard.md)**      | Visualización de métricas del dashboard | 10 min | Tech Leads, QA     |
| **[Guía de Configuración Global de MCP](./mcp-global-setup.md)** | Configuración global de servidor MCP    | 10 min | Todos los usuarios |

### Herramientas de Desarrollo (Sprint 3)

| Guía                                                  | Propósito                         | Tiempo | Audiencia       |
| ----------------------------------------------------- | --------------------------------- | ------ | --------------- |
| **[Motor de Plantillas v2](./template-engine-v2.md)** | Motor de generación de documentos | 10 min | Desarrolladores |

### Navegación Rápida (v4)

**...entender la arquitectura de 4 módulos**
→ [`module-system.md`](../architecture/module-system.md) (15 min)

**...descubrir workers y tareas disponibles**
→ [`service-discovery.md`](./service-discovery.md) (10 min)

**...migrar de v2.0 a v4.0.4**
→ [`migration-guide.md`](../../migration/migration-guide.md) (20 min)

**...configurar quality gates**
→ [`quality-gates.md`](./quality-gates.md) (15 min)

**...monitorear el dashboard de métricas de calidad**
→ [`quality-dashboard.md`](./quality-dashboard.md) (10 min)

**...usar el motor de plantillas**
→ [`template-engine-v2.md`](./template-engine-v2.md) (10 min)

**...configurar integración con CodeRabbit**

**...configurar servidores MCP globales**
→ [`mcp-global-setup.md`](./mcp-global-setup.md) (10 min)

---

## Otras Guías

- [Guía de Referencia de Agentes](../agent-reference-guide.md)
- [Guía de Flujo de Trabajo Git](../git-workflow-guide.md)
- [Primeros Pasos](../getting-started.md)
- [Solución de Problemas de Instalación](./installation-troubleshooting.md)
- [Solución de Problemas](../troubleshooting.md)

---

## Documentación del Sprint 3

| Documento                                               | Líneas | Estado   |
| ------------------------------------------------------- | ------ | -------- |
| [Guía de Quality Gates](./quality-gates.md)             | ~600   | Completo |
| [Guía del Dashboard de Calidad](./quality-dashboard.md) | ~350   | Completo |
| [Motor de Plantillas v2](./template-engine-v2.md)       | ~400   | Completo |
| [Integración con CodeRabbit](../../guides/coderabbit/)  | ~1000  | Completo |

---

## Soporte

- **GitHub Issues:** Etiqueta `documentation`, `guides`, `mcp`
- **Expertos:** Ver archivo CODEOWNERS

---

**Última Actualización:** 2025-12-17
**Versión:** 2.1 (Story 6.14)
