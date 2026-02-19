# Referencia de API AIOS

> [EN](../../guides/api-reference.md) | [PT](../../pt/guides/api-reference.md) | **ES**

---

Referencia completa de la API para Synkra AIOS - el Sistema Orquestado por IA para Desarrollo Full Stack.

**Versión:** 2.1.0
**Última Actualización:** 2026-01-29

---

## Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Activación de Agentes](#activación-de-agentes)
3. [Referencia de Comandos](#referencia-de-comandos)
4. [Comandos Específicos de Agentes](#comandos-específicos-de-agentes)
5. [API de Workflows](#api-de-workflows)
6. [Parámetros y Opciones](#parámetros-y-opciones)
7. [Códigos de Retorno y Errores](#códigos-de-retorno-y-errores)
8. [Integración con IDEs](#integración-con-ides)
9. [Ejemplos](#ejemplos)

---

## Visión General

### Arquitectura de la API

AIOS proporciona una API unificada para interactuar con agentes de IA especializados a través de dos mecanismos principales:

1. **Activación de Agentes** - Usando el prefijo `@` para activar agentes especializados
2. **Ejecución de Comandos** - Usando el prefijo `*` para ejecutar comandos de agentes

```
┌─────────────────────────────────────────────────────────────┐
│                      AIOS API Layer                          │
├─────────────────────────────────────────────────────────────┤
│  @agent         →  Activa la persona del agente              │
│  *command       →  Ejecuta comando del agente                │
│  *command args  →  Ejecuta comando con argumentos            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Agent Resolution                          │
├─────────────────────────────────────────────────────────────┤
│  .aios-core/development/agents/{agent-id}.md                 │
│  Dependencies: tasks, templates, checklists, scripts         │
└─────────────────────────────────────────────────────────────┘
```

### Principios Fundamentales

| Principio                      | Descripción                                                             |
| ------------------------------ | ----------------------------------------------------------------------- |
| **Task-First**                 | Todo es una tarea. Las solicitudes se resuelven en ejecución de tareas. |
| **Especialización de Agentes** | Cada agente tiene un alcance y responsabilidad definidos                |
| **Comandos Declarativos**      | Los comandos describen la intención, los agentes manejan la ejecución   |
| **Mejora Progresiva**          | Comandos simples se expanden a workflows complejos                      |

---

## Activación de Agentes

### Sintaxis

```
@{agent-id}
@{agent-id} *{command}
@{agent-id} *{command} {arguments}
```

### Agentes Disponibles

| Agent ID         | Nombre | Arquetipo    | Responsabilidad Principal                      |
| ---------------- | ------ | ------------ | ---------------------------------------------- |
| `@dev`           | Dex    | Builder      | Implementación de código, depuración, pruebas  |
| `@qa`            | Quinn  | Guardian     | Aseguramiento de calidad, revisión de código   |
| `@architect`     | Aria   | Visionary    | Arquitectura de sistemas, diseño de API        |
| `@pm`            | Morgan | Strategist   | Requisitos de producto, épicas, estrategia     |
| `@po`            | Pax    | Champion     | Gestión de backlog, criterios de aceptación    |
| `@sm`            | River  | Facilitator  | Planificación de sprints, creación de stories  |
| `@analyst`       | Atlas  | Explorer     | Investigación de mercado, análisis competitivo |
| `@data-engineer` | Dara   | Architect    | Esquema de BD, migraciones, consultas          |
| `@devops`        | Gage   | Optimizer    | CI/CD, despliegue, operaciones git             |
| `@ux-expert`     | Uma    | Creator      | Diseño UI/UX, wireframes                       |
| `@aios-master`   | Orion  | Orchestrator | Orquestación del framework, meta-operaciones   |

### Comportamiento de Activación

Cuando se activa un agente:

1. Se carga el archivo de definición del agente desde `.aios-core/development/agents/{id}.md`
2. Se adopta la persona (tono, vocabulario, saludo)
3. Se muestra el saludo contextual basado en el tipo de sesión
4. El agente se detiene y espera la entrada del usuario

```bash
# Activar agente desarrollador
@dev

# Salida:
# 💻 Dex (Builder) listo. ¡Construyamos algo genial!
#
# **Comandos Rápidos:**
# - *develop {story-id} - Implementar tareas de la story
# - *run-tests - Ejecutar linting y pruebas
# - *help - Mostrar todos los comandos
```

### Activación con Comando

Puedes activar un agente y ejecutar un comando en un solo paso:

```bash
@dev *develop story-1.2.3
@qa *review story-1.2.3
@architect *create-full-stack-architecture
```

---

## Referencia de Comandos

### Comandos Universales

Estos comandos están disponibles en todos los agentes:

| Comando         | Descripción                            | Ejemplo         |
| --------------- | -------------------------------------- | --------------- |
| `*help`         | Mostrar todos los comandos disponibles | `*help`         |
| `*guide`        | Mostrar guía de uso completa           | `*guide`        |
| `*session-info` | Mostrar detalles de sesión actual      | `*session-info` |
| `*exit`         | Salir del modo de agente actual        | `*exit`         |
| `*yolo`         | Alternar omisión de confirmaciones     | `*yolo`         |

### Sintaxis de Comandos

```
*{command}
*{command} {positional-argument}
*{command} {arg1} {arg2}
*{command} --{flag}
*{command} --{option}={value}
```

### Resolución de Comandos

Los comandos se resuelven a archivos de tareas en las dependencias del agente:

```
*develop story-1.2.3
    │
    ▼
.aios-core/development/tasks/dev-develop-story.md
    │
    ▼
Ejecución de tarea con argumentos: { story: "story-1.2.3" }
```

---

## Comandos Específicos de Agentes

### @dev (Desarrollador)

**Desarrollo de Stories:**

| Comando                | Argumentos   | Descripción                                                     |
| ---------------------- | ------------ | --------------------------------------------------------------- |
| `*develop`             | `{story-id}` | Implementar tareas de story (modos: yolo, interactive, preflight) |
| `*develop-yolo`        | `{story-id}` | Modo de desarrollo autónomo                                     |
| `*develop-interactive` | `{story-id}` | Modo de desarrollo interactivo (predeterminado)                 |
| `*develop-preflight`   | `{story-id}` | Modo de planificación antes de implementación                   |

**Ejecución de Subtareas (ADE):**

| Comando            | Argumentos     | Descripción                                                  |
| ------------------ | -------------- | ------------------------------------------------------------ |
| `*execute-subtask` | `{subtask-id}` | Ejecutar subtarea individual (workflow Coder Agent de 13 pasos) |
| `*verify-subtask`  | `{subtask-id}` | Verificar completitud de subtarea                            |

**Sistema de Recuperación:**

| Comando          | Argumentos     | Descripción                          |
| ---------------- | -------------- | ------------------------------------ |
| `*track-attempt` | `{subtask-id}` | Registrar intento de implementación  |
| `*rollback`      | `[--hard]`     | Revertir al último estado funcional  |

**Operaciones de Build:**

| Comando             | Argumentos   | Descripción                                   |
| ------------------- | ------------ | --------------------------------------------- |
| `*build`            | `{story-id}` | Pipeline de build autónomo completo           |
| `*build-autonomous` | `{story-id}` | Iniciar bucle de build autónomo               |
| `*build-resume`     | `{story-id}` | Reanudar build desde checkpoint               |
| `*build-status`     | `[--all]`    | Mostrar estado del build                      |
| `*build-log`        | `{story-id}` | Ver registro de intentos de build             |

**Calidad y Deuda:**

| Comando           | Argumentos | Descripción                           |
| ----------------- | ---------- | ------------------------------------- |
| `*run-tests`      | -          | Ejecutar linting y todas las pruebas  |
| `*apply-qa-fixes` | -          | Aplicar feedback y correcciones de QA |
| `*backlog-debt`   | `{title}`  | Registrar ítem de deuda técnica       |

**Aislamiento con Worktree:**

| Comando             | Argumentos   | Descripción                     |
| ------------------- | ------------ | ------------------------------- |
| `*worktree-create`  | `{story-id}` | Crear worktree aislado          |
| `*worktree-list`    | -            | Listar worktrees activos        |
| `*worktree-merge`   | `{story-id}` | Fusionar worktree a la base     |
| `*worktree-cleanup` | -            | Eliminar worktrees completados  |

**Capa de Memoria:**

| Comando             | Argumentos                      | Descripción                   |
| ------------------- | ------------------------------- | ----------------------------- |
| `*capture-insights` | -                               | Capturar insights de sesión   |
| `*list-gotchas`     | -                               | Listar gotchas conocidos      |
| `*gotcha`           | `{title} - {description}`       | Agregar gotcha manualmente    |
| `*gotchas`          | `[--category X] [--severity Y]` | Listar y buscar gotchas       |

---

### @qa (Aseguramiento de Calidad)

**Revisión de Código:**

| Comando         | Argumentos   | Descripción                                       |
| --------------- | ------------ | ------------------------------------------------- |
| `*code-review`  | `{scope}`    | Ejecutar revisión automatizada (uncommitted/committed) |
| `*review`       | `{story-id}` | Revisión integral de story                        |
| `*review-build` | `{story-id}` | Revisión QA estructurada de 10 fases              |

**Gates de Calidad:**

| Comando         | Argumentos   | Descripción                               |
| --------------- | ------------ | ----------------------------------------- |
| `*gate`         | `{story-id}` | Crear decisión de gate de calidad         |
| `*nfr-assess`   | `{story-id}` | Validar requisitos no funcionales         |
| `*risk-profile` | `{story-id}` | Generar matriz de evaluación de riesgos   |

**Validación Mejorada:**

| Comando                | Argumentos   | Descripción                                        |
| ---------------------- | ------------ | -------------------------------------------------- |
| `*validate-libraries`  | `{story-id}` | Validar uso de bibliotecas de terceros             |
| `*security-check`      | `{story-id}` | Ejecutar escaneo de vulnerabilidades de 8 puntos   |
| `*validate-migrations` | `{story-id}` | Validar migraciones de base de datos               |
| `*evidence-check`      | `{story-id}` | Verificar requisitos de QA basados en evidencia    |
| `*console-check`       | `{story-id}` | Detección de errores en consola del navegador      |

**Solicitudes de Corrección:**

| Comando               | Argumentos   | Descripción                              |
| --------------------- | ------------ | ---------------------------------------- |
| `*create-fix-request` | `{story-id}` | Generar QA_FIX_REQUEST.md para @dev      |

**Estrategia de Pruebas:**

| Comando          | Argumentos   | Descripción                                       |
| ---------------- | ------------ | ------------------------------------------------- |
| `*test-design`   | `{story-id}` | Crear escenarios de prueba integrales             |
| `*trace`         | `{story-id}` | Mapear requisitos a pruebas (Given-When-Then)     |
| `*critique-spec` | `{story-id}` | Revisar especificación para completitud           |

---

### @architect (Arquitecto)

**Diseño de Arquitectura:**

| Comando                           | Argumentos | Descripción                                  |
| --------------------------------- | ---------- | -------------------------------------------- |
| `*create-full-stack-architecture` | -          | Arquitectura de sistema completa             |
| `*create-backend-architecture`    | -          | Diseño de arquitectura backend               |
| `*create-front-end-architecture`  | -          | Diseño de arquitectura frontend              |
| `*create-brownfield-architecture` | -          | Arquitectura para proyectos existentes       |

**Documentación y Análisis:**

| Comando                      | Argumentos    | Descripción                                |
| ---------------------------- | ------------- | ------------------------------------------ |
| `*document-project`          | -             | Generar documentación del proyecto         |
| `*execute-checklist`         | `{checklist}` | Ejecutar checklist de arquitectura         |
| `*research`                  | `{topic}`     | Generar prompt de investigación profunda   |
| `*analyze-project-structure` | -             | Analizar proyecto para nuevas funcionalidades |

**Pipeline ADE:**

| Comando              | Argumentos   | Descripción                                |
| -------------------- | ------------ | ------------------------------------------ |
| `*assess-complexity` | `{story-id}` | Evaluar complejidad y esfuerzo de story    |
| `*create-plan`       | `{story-id}` | Crear plan de implementación               |
| `*create-context`    | `{story-id}` | Generar contexto del proyecto              |
| `*map-codebase`      | -            | Generar mapa del codebase                  |

---

### @pm (Product Manager)

**Creación de Documentos:**

| Comando                  | Argumentos | Descripción                                    |
| ------------------------ | ---------- | ---------------------------------------------- |
| `*create-prd`            | -          | Crear documento de requisitos del producto     |
| `*create-brownfield-prd` | -          | Crear PRD para proyectos existentes            |
| `*create-epic`           | -          | Crear épica para brownfield                    |
| `*create-story`          | -          | Crear user story                               |

**Operaciones de Documentación:**

| Comando      | Argumentos | Descripción                         |
| ------------ | ---------- | ----------------------------------- |
| `*doc-out`   | -          | Generar documento completo          |
| `*shard-prd` | -          | Dividir PRD en partes más pequeñas  |

**Pipeline ADE:**

| Comando                | Argumentos | Descripción                                       |
| ---------------------- | ---------- | ------------------------------------------------- |
| `*gather-requirements` | -          | Obtener requisitos de los stakeholders            |
| `*write-spec`          | -          | Generar especificación formal                     |

---

### @sm (Scrum Master)

**Gestión de Stories:**

| Comando              | Argumentos   | Descripción                       |
| -------------------- | ------------ | --------------------------------- |
| `*create-next-story` | -            | Crear siguiente user story        |
| `*validate-story`    | `{story-id}` | Validar completitud de story      |
| `*manage-backlog`    | -            | Gestionar backlog de stories      |

---

### @analyst (Analista)

**Investigación:**

| Comando                 | Argumentos  | Descripción                                    |
| ----------------------- | ----------- | ---------------------------------------------- |
| `*brainstorm`           | `{topic}`   | Facilitar sesión de lluvia de ideas            |
| `*research-deps`        | `{topic}`   | Investigar dependencias y restricciones        |
| `*competitive-analysis` | `{company}` | Realizar análisis competitivo                  |
| `*market-research`      | `{topic}`   | Realizar investigación de mercado              |

**Pipeline ADE:**

| Comando             | Argumentos | Descripción                               |
| ------------------- | ---------- | ----------------------------------------- |
| `*extract-patterns` | -          | Extraer patrones de código del codebase   |

---

### @devops (DevOps)

**Operaciones Git:**

| Comando      | Argumentos    | Descripción                   |
| ------------ | ------------- | ----------------------------- |
| `*push`      | `[--force]`   | Enviar cambios al remoto      |
| `*create-pr` | `{title}`     | Crear pull request            |
| `*merge-pr`  | `{pr-number}` | Fusionar pull request         |

**Gestión de Worktree:**

| Comando              | Argumentos   | Descripción                     |
| -------------------- | ------------ | ------------------------------- |
| `*create-worktree`   | `{story-id}` | Crear worktree Git aislado      |
| `*list-worktrees`    | -            | Listar worktrees activos        |
| `*merge-worktree`    | `{story-id}` | Fusionar worktree a main        |
| `*cleanup-worktrees` | -            | Eliminar worktrees obsoletos    |

**Gestión de Migración:**

| Comando             | Argumentos   | Descripción                        |
| ------------------- | ------------ | ---------------------------------- |
| `*inventory-assets` | -            | Generar inventario de migración    |
| `*analyze-paths`    | -            | Analizar dependencias de rutas     |
| `*migrate-agent`    | `{agent-id}` | Migrar agente individual           |
| `*migrate-batch`    | -            | Migrar todos los agentes en lote   |

---

### @aios-master (Orquestador)

**Desarrollo del Framework:**

| Comando                | Argumentos      | Descripción                                    |
| ---------------------- | --------------- | ---------------------------------------------- |
| `*create`              | `{type} {name}` | Crear componente AIOS (agent/task/workflow)    |
| `*modify`              | `{type} {name}` | Modificar componente existente                 |
| `*validate-component`  | `{name}`        | Validar seguridad del componente               |
| `*deprecate-component` | `{name}`        | Deprecar con ruta de migración                 |

**Ejecución de Tareas:**

| Comando              | Argumentos        | Descripción                   |
| -------------------- | ----------------- | ----------------------------- |
| `*task`              | `{task-name}`     | Ejecutar tarea específica     |
| `*workflow`          | `{workflow-name}` | Iniciar workflow              |
| `*execute-checklist` | `{checklist}`     | Ejecutar checklist            |

**Planificación:**

| Comando | Argumentos                 | Descripción                                   |
| ------- | -------------------------- | --------------------------------------------- |
| `*plan` | `[create\|status\|update]` | Planificación de workflow                     |
| `*kb`   | -                          | Alternar modo KB (conocimiento AIOS Method)   |

**Operaciones de Documentos:**

| Comando              | Argumentos     | Descripción                            |
| -------------------- | -------------- | -------------------------------------- |
| `*create-doc`        | `{template}`   | Crear documento desde template         |
| `*create-next-story` | -              | Crear siguiente user story             |
| `*doc-out`           | -              | Generar documento completo             |
| `*shard-doc`         | `{doc} {dest}` | Dividir documento en partes            |

---

## API de Workflows

### Workflows Disponibles

| Workflow               | Descripción                      | Agentes Involucrados |
| ---------------------- | -------------------------------- | -------------------- |
| `greenfield-fullstack` | Nuevo proyecto full-stack        | Todos los agentes    |
| `greenfield-service`   | Nuevo microservicio              | architect, dev, qa   |
| `greenfield-ui`        | Nuevo proyecto frontend          | architect, ux, dev   |
| `brownfield-fullstack` | Agregar feature a existente      | architect, dev, qa   |
| `brownfield-service`   | Extender servicio existente      | dev, qa              |
| `brownfield-ui`        | Extender frontend existente      | ux, dev, qa          |

### Ejecución de Workflows

```bash
# Iniciar workflow
@aios-master *workflow greenfield-fullstack

# Con parámetros
*workflow brownfield-service --target=./services/auth
```

### Estructura de Workflows

```yaml
# Ejemplo de definición de workflow
name: greenfield-fullstack
phases:
  - name: research
    agent: analyst
    tasks:
      - brainstorm
      - competitive-analysis
  - name: planning
    agent: pm
    tasks:
      - create-prd
  - name: architecture
    agent: architect
    tasks:
      - create-full-stack-architecture
  - name: implementation
    agent: dev
    tasks:
      - develop
```

---

## Parámetros y Opciones

### Opciones Globales

| Opción      | Tipo    | Descripción                       |
| ----------- | ------- | --------------------------------- |
| `--verbose` | boolean | Habilitar salida detallada        |
| `--dry-run` | boolean | Vista previa sin ejecución        |
| `--force`   | boolean | Forzar operación                  |
| `--help`    | boolean | Mostrar ayuda del comando         |

### Parámetros de Story

| Parámetro    | Tipo   | Descripción            | Ejemplo                      |
| ------------ | ------ | ---------------------- | ---------------------------- |
| `{story-id}` | string | Identificador de story | `story-1.2.3`, `STORY-42`    |
| `--status`   | enum   | Filtro de estado       | `draft`, `ready`, `complete` |
| `--epic`     | string | Filtrar por épica      | `--epic=AUTH`                |

### Parámetros de Build

| Parámetro      | Tipo   | Descripción                    | Ejemplo                            |
| -------------- | ------ | ------------------------------ | ---------------------------------- |
| `--mode`       | enum   | Modo de build                  | `yolo`, `interactive`, `preflight` |
| `--retry`      | number | Máximo de reintentos           | `--retry=3`                        |
| `--checkpoint` | string | Reanudar desde checkpoint      | `--checkpoint=build-001`           |

### Parámetros de Revisión

| Parámetro    | Tipo   | Descripción               | Ejemplo                      |
| ------------ | ------ | ------------------------- | ---------------------------- |
| `--scope`    | enum   | Alcance de revisión       | `uncommitted`, `committed`   |
| `--base`     | string | Branch base para diff     | `--base=main`                |
| `--severity` | enum   | Severidad mínima          | `critical`, `high`, `medium` |

---

## Códigos de Retorno y Errores

### Códigos de Retorno Estándar

| Código | Estado  | Descripción                                              |
| ------ | ------- | -------------------------------------------------------- |
| `0`    | SUCCESS | Operación completada exitosamente                        |
| `1`    | ERROR   | Error general                                            |
| `2`    | BLOCKED | Operación bloqueada (requiere aprobación)                |
| `3`    | HALTED  | Operación detenida (requiere intervención del usuario)   |
| `4`    | SKIP    | Operación omitida                                        |
| `5`    | TIMEOUT | Operación agotó tiempo de espera                         |

### Categorías de Error

| Categoría            | Descripción                        | Resolución                             |
| -------------------- | ---------------------------------- | -------------------------------------- |
| `AGENT_NOT_FOUND`    | Definición de agente faltante      | Verificar `.aios-core/development/agents/` |
| `TASK_NOT_FOUND`     | Definición de tarea faltante       | Verificar dependencias del agente      |
| `STORY_NOT_FOUND`    | Archivo de story no encontrado     | Verificar ruta `docs/stories/`         |
| `VALIDATION_FAILED`  | Pre-condición no cumplida          | Verificar prerrequisitos               |
| `PERMISSION_DENIED`  | Operación no permitida             | Verificar restricciones del agente     |
| `DEPENDENCY_MISSING` | Dependencia requerida no disponible | Instalar o configurar dependencia      |

### Formato de Respuesta de Error

```json
{
  "status": "error",
  "code": "VALIDATION_FAILED",
  "message": "El estado de la story debe ser 'Ready for Dev' para comenzar la implementación",
  "context": {
    "story": "story-1.2.3",
    "currentStatus": "Draft",
    "requiredStatus": "Ready for Dev"
  },
  "suggestions": ["Actualizar estado de story a 'Ready for Dev'", "Contactar a @pm para aprobar story"]
}
```

### Decisiones de Gate de Calidad

| Decisión   | Descripción                      | Acción                               |
| ---------- | -------------------------------- | ------------------------------------ |
| `PASS`     | Todos los criterios cumplidos    | Proceder a siguiente fase            |
| `CONCERNS` | Problemas menores encontrados    | Documentar y proceder con precaución |
| `FAIL`     | Problemas críticos encontrados   | Debe corregir antes de proceder      |
| `WAIVED`   | Problemas reconocidos, proceder  | Documentar razón de la exención      |

---

## Integración con IDEs

### IDEs Soportados

| IDE         | Directorio   | Formato           | Nivel de Soporte |
| ----------- | ------------ | ----------------- | ---------------- |
| Claude Code | `.claude/`   | Markdown          | Completo         |
| Cursor      | `.cursor/`   | MDC (frontmatter) | Completo         |
| VS Code     | `.vscode/`   | JSON              | Parcial          |
| Gemini      | `.gemini/`   | Markdown          | Básico           |

### Configuración de IDE

```yaml
# .aios-sync.yaml
version: 1.0.0
active_ides:
  - claude
  - cursor

squad_aliases:
  legal: Legal
  copy: Copy
  hr: HR

sync_components:
  agents: true
  tasks: true
  workflows: true
  checklists: true
```

### Comandos de Sincronización

```bash
# Sincronizar agente específico
*command agent {agent-name}

# Sincronizar tarea específica
*command task {task-name}

# Sincronizar squad completo
*command squad {squad-name}

# Sincronizar todos los componentes
*command sync-all
```

### Integración con Claude Code

Claude Code es el IDE principal soportado con integración completa:

**Comandos de Agente (Slash Commands):**

```
/dev          → Activa agente @dev
/qa           → Activa agente @qa
/architect    → Activa agente @architect
/aios-master  → Activa agente @aios-master
```

**Estructura de Directorios:**

```
.claude/
├── commands/
│   └── AIOS/
│       └── agents/
│           ├── dev.md
│           ├── qa.md
│           ├── architect.md
│           └── ...
├── rules/
│   └── mcp-usage.md
└── hooks/
    ├── read-protection.py
    └── sql-governance.py
```

### Integración con Cursor

```
.cursor/
└── rules/
    ├── dev.mdc
    ├── qa.mdc
    └── architect.mdc
```

El formato MDC incluye frontmatter:

```yaml
---
description: Full Stack Developer - Implementación de código
globs: []
alwaysApply: false
---
# Contenido del agente...
```


```
└── agents/
    ├── dev.md
    ├── qa.md
    └── architect.md
```

---

## Ejemplos

### Ejemplo 1: Implementación Completa de Story

```bash
# 1. Activar agente desarrollador
@dev

# 2. Iniciar implementación de story
*develop story-1.2.3

# 3. Ejecutar pruebas
*run-tests

# 4. Verificar gotchas
*list-gotchas

# 5. Salir del modo desarrollador
*exit

# 6. Cambiar a QA
@qa

# 7. Revisar la story
*review story-1.2.3

# 8. Crear gate de calidad
*gate story-1.2.3
```

### Ejemplo 2: Pipeline de Especificación ADE

```bash
# 1. Recopilar requisitos
@pm *gather-requirements

# 2. Evaluar complejidad
@architect *assess-complexity story-1.2.3

# 3. Investigar dependencias
@analyst *research-deps "authentication libraries"

# 4. Escribir especificación
@pm *write-spec

# 5. Criticar especificación
@qa *critique-spec story-1.2.3

# 6. Crear plan de implementación
@architect *create-plan story-1.2.3

# 7. Generar contexto
@architect *create-context story-1.2.3

# 8. Ejecutar subtareas
@dev *execute-subtask 1.1

# 9. Revisar build
@qa *review-build story-1.2.3
```

### Ejemplo 3: Flujo de Recuperación

```bash
# Cuando la implementación falla
@dev

# 1. Registrar el intento fallido
*track-attempt subtask-1.1

# 2. Verificar gotchas conocidos
*list-gotchas

# 3. Intentar rollback
*rollback

# 4. Reintentar con enfoque diferente
*execute-subtask 1.1 --approach alternative

# 5. Capturar insights para el futuro
*capture-insights
```

### Ejemplo 4: Desarrollo Paralelo con Worktrees

```bash
# 1. Crear worktree aislado
@devops *create-worktree STORY-42

# 2. Desarrollar en aislamiento
@dev *develop STORY-42

# 3. Revisión QA
@qa *review STORY-42

# 4. Fusionar de vuelta
@devops *merge-worktree STORY-42

# 5. Limpieza
@devops *cleanup-worktrees
```

### Ejemplo 5: Desarrollo del Framework

```bash
# 1. Activar orquestador maestro
@aios-master

# 2. Habilitar base de conocimiento
*kb

# 3. Crear nuevo agente
*create agent my-custom-agent

# 4. Validar el componente
*validate-component my-custom-agent

# 5. Crear tarea asociada
*create task my-custom-task

# 6. Probar el workflow
*task my-custom-task
```

---

## Árbol de Decisión de Agentes

Usa este árbol de decisión para seleccionar el agente correcto:

```
¿Qué necesitas?
│
├─ ¿Investigación/Análisis?
│  └─ @analyst
│
├─ ¿Requisitos de Producto?
│  ├─ PRD/Épica → @pm
│  └─ User Stories → @sm
│
├─ ¿Arquitectura?
│  ├─ Diseño de Sistema → @architect
│  └─ Esquema de BD → @data-engineer
│
├─ ¿Implementación?
│  └─ @dev
│
├─ ¿Aseguramiento de Calidad?
│  └─ @qa
│
├─ ¿Despliegue/Git?
│  └─ @devops
│
├─ ¿Diseño UX/UI?
│  └─ @ux-expert
│
└─ ¿Framework/Orquestación?
   └─ @aios-master
```

---

## Mejores Prácticas

### 1. Usa el Agente Correcto

Cada agente tiene un límite de responsabilidad específico. Usar el agente correcto asegura:

- Se aplica la experiencia apropiada
- Las herramientas correctas están disponibles
- Ocurre la delegación adecuada

### 2. Sigue el Pipeline de Especificación

Para funcionalidades complejas, sigue el pipeline de especificación ADE:

1. `@pm *gather-requirements` - Recopilar requisitos
2. `@architect *assess-complexity` - Estimar esfuerzo
3. `@analyst *research-deps` - Investigar restricciones
4. `@pm *write-spec` - Escribir especificación
5. `@qa *critique-spec` - Validar calidad

### 3. Registra Todo

Usa comandos de memoria para preservar conocimiento:

- `*capture-insights` después de descubrimientos
- `*gotcha` para trampas conocidas
- `*track-attempt` para intentos de implementación

### 4. Usa el Sistema de Recuperación

Cuando estés atascado:

1. `*track-attempt` - Registrar el fallo
2. `*rollback` - Revertir a estado funcional
3. `*list-gotchas` - Verificar problemas conocidos
4. Intentar enfoque alternativo

### 5. Aprovecha los Worktrees

Para desarrollo paralelo:

- `*worktree-create` para aislamiento
- `*worktree-merge` para integración
- `*worktree-cleanup` para mantenimiento

---

## Documentación Relacionada

- [Guía de Usuario](./user-guide.md) - Comenzando con AIOS
- [Guía de Selección de Agentes](./agent-selection-guide.md) - Eligiendo el agente correcto
- [Guía ADE](./ade-guide.md) - Motor de Desarrollo Autónomo
- [Gates de Calidad](./quality-gates.md) - Workflows de aseguramiento de calidad
- [Guía de Sincronización de IDEs](./ide-sync-guide.md) - Sincronización multi-IDE
- [Guía de Squads](./squads-guide.md) - Extendiendo AIOS con squads

---

_Synkra AIOS API Reference v4.2.11_
