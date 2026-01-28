<!-- Traducción: ES | Original: /docs/en/architecture/utility-integration-guide.md | Sincronización: 2026-01-26 -->

# Guía de Integración de Utilidades

> 🌐 [EN](../../architecture/utility-integration-guide.md) | [PT](../../pt/architecture/utility-integration-guide.md) | **ES**

---

**Versión:** 1.0.0
**Creado:** 2025-10-29
**Autores:** Sarah (@po), Winston (@architect)
**Propósito:** Definir patrones estándar para integrar scripts de utilidades en el framework AIOS

---

## ¿Qué es la Integración de Utilidades?

**Definición:** La integración de utilidades es el proceso de hacer que un script de utilidad huérfano sea **descubrible, documentado y utilizable** dentro del framework AIOS.

Una utilidad se considera **completamente integrada** cuando:
1. ✅ **Registrada** en core-config.yaml
2. ✅ **Referenciada** por al menos un agente o tarea
3. ✅ **Documentada** con propósito y uso
4. ✅ **Probada** para asegurar que carga sin errores
5. ✅ **Descubrible** a través de mecanismos del framework

---

## Patrones de Integración

### Patrón 1: Utilidad Auxiliar de Agente

**Cuándo Usar:** La utilidad proporciona funciones auxiliares que los agentes usan directamente

**Pasos de Integración:**
1. Agregar utilidad al array `dependencies.utils` del agente objetivo
2. Documentar propósito de la utilidad en archivo del agente
3. Registrar en core-config.yaml si no está ya
4. Probar que el agente carga exitosamente con la utilidad

**Ejemplo: util-batch-creator**

```yaml
# .aios-core/agents/dev.yaml
id: dev
name: Development Agent
dependencies:
  utils:
    - batch-creator  # Crea lotes de tareas relacionadas
    - code-quality-improver
```

**Archivos Modificados:**
- `.aios-core/agents/{agent}.yaml` (agregar a dependencies.utils)
- `.aios-core/core-config.yaml` (registrar si es necesario)
- `.aios-core/utils/README.md` (documentar utilidad)

---

### Patrón 2: Utilidad de Ejecución de Tareas

**Cuándo Usar:** La utilidad es llamada por una tarea durante la ejecución

**Pasos de Integración:**
1. Identificar o crear tarea que usa la utilidad
2. Agregar referencia de utilidad en sección `execution.utils` de la tarea
3. Documentar cómo la tarea usa la utilidad
4. Registrar en core-config.yaml si no está ya
5. Probar ejecución de tarea con utilidad

**Ejemplo: util-commit-message-generator**

```yaml
# .aios-core/tasks/generate-commit-message.md
id: generate-commit-message
name: Generate Commit Message
execution:
  utils:
    - commit-message-generator  # Utilidad principal para esta tarea
  steps:
    - Analizar cambios preparados
    - Generar mensaje de commit semántico usando util
    - Presentar mensaje al usuario para aprobación
```

**Archivos Modificados:**
- `.aios-core/tasks/{task}.md` (agregar execution.utils)
- `.aios-core/agents/{agent}.yaml` (agregar tarea a lista executes)
- `.aios-core/core-config.yaml` (registrar si es necesario)
- `.aios-core/utils/README.md` (documentar utilidad)

---

### Patrón 3: Utilidad de Infraestructura del Framework

**Cuándo Usar:** La utilidad es usada por el framework mismo, no directamente por agentes/tareas

**Pasos de Integración:**
1. Registrar en core-config.yaml bajo categoría apropiada
2. Documentar en utils/README.md como "utilidad de framework"
3. Agregar a documentación del framework
4. Probar que utilidad carga en contexto del framework

**Ejemplo: util-elicitation-engine**

```yaml
# .aios-core/core-config.yaml
utils:
  framework:
    - elicitation-engine  # Usado por flujo de trabajo de creación de agentes
    - aios-validator
```

**Archivos Modificados:**
- `.aios-core/core-config.yaml` (registrar bajo framework)
- `.aios-core/utils/README.md` (documentar como utilidad de framework)
- Documentación del framework (si aplica)

---

### Patrón 4: Utilidad de Documentación/Análisis

**Cuándo Usar:** La utilidad realiza análisis o generación de documentación

**Pasos de Integración:**
1. Agregar a utils del agente relevante (usualmente architect, qa, o agente docs)
2. Crear o actualizar tarea que usa utilidad
3. Documentar formato de análisis/salida
4. Registrar en core-config.yaml

**Ejemplo: util-documentation-synchronizer**

```yaml
# .aios-core/agents/architect.yaml
dependencies:
  utils:
    - documentation-synchronizer  # Mantiene docs sincronizados con código
    - dependency-analyzer
```

**Archivos Modificados:**
- `.aios-core/agents/{agent}.yaml`
- `.aios-core/tasks/{task}.md` (si se crea tarea)
- `.aios-core/core-config.yaml`
- `.aios-core/utils/README.md`

---

## Flujo de Trabajo de Integración

### Proceso Estándar (para todos los patrones):

```
1. ANALIZAR
   ├─ Inspeccionar código de utilidad para entender propósito
   ├─ Identificar categoría de utilidad (auxiliar, ejecutor, analizador, etc.)
   └─ Determinar patrón de integración apropiado

2. MAPEAR
   ├─ Identificar agente(s) objetivo que deberían usar utilidad
   ├─ Identificar o crear tarea(s) que llaman utilidad
   └─ Documentar decisión de mapeo

3. INTEGRAR
   ├─ Agregar referencia de utilidad a archivos de agente/tarea
   ├─ Registrar en core-config.yaml (si no está ya)
   └─ Documentar en utils/README.md

4. PROBAR
   ├─ Cargar utilidad para verificar sin errores
   ├─ Cargar agente para verificar que dependencia resuelve
   ├─ Probar ejecución de tarea si aplica
   └─ Ejecutar detección de brechas para verificar corrección

5. DOCUMENTAR
   ├─ Agregar descripción de utilidad a README
   ├─ Documentar patrón de uso
   ├─ Notar qué agentes/tareas lo usan
   └─ Actualizar mapa de arquitectura
```

---

## Categorización de Utilidades

Las utilidades deberían categorizarse para integración más fácil:

### Categoría 1: Calidad de Código
**Propósito:** Analizar, mejorar, validar código
**Patrón:** Auxiliar de Agente (agentes dev, qa)
**Ejemplos:** aios-validator, code-quality-improver, coverage-analyzer

### Categoría 2: Git/Flujo de Trabajo
**Propósito:** Operaciones Git, automatización de flujo de trabajo
**Patrón:** Ejecución de Tarea (agentes dev, github-devops)
**Ejemplos:** commit-message-generator, branch-manager, conflict-resolver

### Categoría 3: Gestión de Componentes
**Propósito:** Generar, gestionar, buscar componentes
**Patrón:** Auxiliar de Agente + Ejecución de Tarea
**Ejemplos:** component-generator, component-search, deprecation-manager

### Categoría 4: Documentación
**Propósito:** Generar, sincronizar, analizar documentación
**Patrón:** Utilidad de Documentación (agentes architect, docs)
**Ejemplos:** documentation-synchronizer, dependency-impact-analyzer

### Categoría 5: Lotes/Auxiliares
**Propósito:** Operaciones por lotes, auxiliares de framework
**Patrón:** Varía (Auxiliar de Agente o Framework)
**Ejemplos:** batch-creator, clickup-helpers, elicitation-engine

---

## Requisitos de Pruebas

### Para Cada Utilidad Integrada:

**1. Prueba de Carga**
```javascript
// Verificar que utilidad carga sin errores
const utility = require('.aios-core/utils/{utility-name}');
// No debería lanzar excepción
```

**2. Validación de Referencias**
```bash
# Verificar que referencias de agente/tarea son válidas
node outputs/architecture-map/schemas/validate-tool-references.js
```

**3. Detección de Brechas**
```bash
# Verificar que brecha está resuelta
node outputs/architecture-map/schemas/detect-gaps.js
# Debería mostrar 0 brechas para utilidad integrada
```

**4. Prueba de Integración** (si aplica)
```javascript
// Verificar que agente carga con dependencia de utilidad
const agent = loadAgent('agent-name');
// Debería incluir utilidad en dependencias resueltas
```

---

## Requisitos de Documentación

### Plantilla de Entrada en utils/README.md:

```markdown
### util-{name}

**Propósito:** Descripción breve de lo que hace la utilidad

**Usado Por:**
- agent-{name} (para {propósito})
- task-{name} (durante {fase})

**Patrón de Integración:** {nombre-del-patrón}

**Ubicación:** `.aios-core/utils/{name}.js`

**Ejemplo de Uso:**
\`\`\`javascript
const util = require('./utils/{name}');
// Código de ejemplo
\`\`\`
```

---

## Registro en core-config.yaml

### Agregar utilidad a la sección apropiada:

```yaml
utils:
  # Utilidades auxiliares de agente
  helpers:
    - batch-creator
    - code-quality-improver

  # Utilidades de ejecución de tareas
  executors:
    - commit-message-generator
    - component-generator

  # Utilidades de infraestructura del framework
  framework:
    - elicitation-engine
    - aios-validator

  # Utilidades de análisis/documentación
  analyzers:
    - documentation-synchronizer
    - dependency-analyzer
```

---

## Criterios de Éxito

Una utilidad está exitosamente integrada cuando:

✅ **Descubrible:**
- Listada en core-config.yaml
- Documentada en utils/README.md
- Referenciada por agente/tarea

✅ **Funcional:**
- Carga sin errores
- Agente/tarea puede usarla
- Pruebas pasan

✅ **Validada:**
- Detección de brechas muestra 0 brechas
- Validación de referencias pasa
- Pruebas de integración pasan

✅ **Documentada:**
- Propósito claramente establecido
- Ejemplos de uso proporcionados
- Patrón de integración identificado

---

## Errores Comunes

❌ **No hacer:** Agregar utilidad a agente sin entender su propósito
✅ **Hacer:** Inspeccionar código primero, entender funcionalidad

❌ **No hacer:** Crear nueva tarea si tarea existente puede usar utilidad
✅ **Hacer:** Extender tareas existentes cuando sea apropiado

❌ **No hacer:** Registrar sin documentar
✅ **Hacer:** Siempre agregar entrada en README

❌ **No hacer:** Omitir pruebas
✅ **Hacer:** Verificar que utilidad carga y resuelve

---

## Referencia Rápida

| Patrón | Objetivo | Archivos Modificados | Prueba |
|--------|----------|----------------------|--------|
| Auxiliar de Agente | YAML de Agente | agent.yaml, core-config, README | Cargar agente |
| Ejecución de Tarea | MD de Tarea + Agente | task.md, agent.yaml, core-config, README | Ejecutar tarea |
| Framework | Framework | core-config, README, docs | Cargar utilidad |
| Documentación | Architect/Docs | agent.yaml, core-config, README | Detección de brechas |

---

**Versión de Guía:** 1.0.0
**Última Actualización:** 2025-10-29
**Responsable:** Winston (@architect)
