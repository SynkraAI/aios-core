<!--
  Traducción: ES
  Original: /docs/en/guides/agent-selection-guide.md
  Última sincronización: 2026-01-26
-->

# Guía de Selección de Agentes

> 🌐 [EN](../../guides/agent-selection-guide.md) | [PT](../../pt/guides/agent-selection-guide.md) | **ES**

---

## Referencia Rápida para Elegir el Agente Correcto

**Última Actualización:** 2025-01-15 (Story 6.1.2.3)

---

## Árbol de Decisión Rápida

```
¿Necesita investigación/análisis? → @analyst
   ↓
¿Necesita PRD/épica? → @pm
   ↓
¿Necesita arquitectura? → @architect
   ↓
¿Necesita base de datos? → @data-engineer
   ↓
¿Necesita historias? → @sm
   ↓
¿Necesita implementación? → @dev
   ↓
¿Necesita pruebas? → @qa
   ↓
¿Necesita despliegue? → @github-devops
```

---

## Referencia Rápida de Agentes

| Agente | Icono | Usar Para | NO Para |
|--------|-------|-----------|---------|
| **@analyst** (Atlas) | 🔍 | Investigación de mercado, análisis competitivo, lluvia de ideas | Creación de PRD, arquitectura, historias |
| **@pm** (Morgan) | 📋 | PRD, épicas, estrategia de producto, roadmap | Investigación, arquitectura, historias detalladas |
| **@architect** (Aria) | 🏛️ | Arquitectura de sistemas, diseño de API, stack tecnológico | Investigación, PRD, esquema de base de datos |
| **@data-engineer** (Dara) | 📊 | Esquema de base de datos, RLS, migraciones, optimización de consultas | Arquitectura de aplicación, selección de tecnología de BD |
| **@sm** (River) | 🌊 | Historias de usuario, planificación de sprint, refinamiento de backlog | PRD, épicas, investigación, implementación |
| **@dev** (Dex) | 💻 | Implementación de historias, codificación, pruebas | Creación de historias, despliegue |
| **@qa** (Quinn) | 🧪 | Revisión de código, pruebas, aseguramiento de calidad | Implementación |
| **@po** (Pax) | 🎯 | Gestión de backlog, criterios de aceptación, priorización | Creación de épicas, arquitectura |
| **@ux-design-expert** (Nova) | 🎨 | Diseño UI/UX, wireframes, sistemas de diseño | Implementación |
| **@github-devops** (Gage) | ⚙️ | Operaciones Git, creación de PR, despliegue, CI/CD | Git local, implementación |
| **@aios-master** (Orion) | 👑 | Desarrollo del framework, orquestación multi-agente | Tareas rutinarias (usar agentes especializados) |

---

## Escenarios Comunes

### "Quiero construir una nueva funcionalidad"

```
1. @analyst *research - Investigación de mercado
2. @pm *create-prd - Requisitos del producto
3. @architect *create-architecture - Diseño técnico
4. @data-engineer *create-schema - Diseño de base de datos
5. @sm *create-next-story - Historias de usuario
6. @dev *develop - Implementación
7. @qa *review - Verificación de calidad
8. @github-devops *create-pr - Despliegue
```

### "Necesito entender el sistema existente"

```
1. @analyst *document-project - Documentación brownfield
2. @pm *create-prd (brownfield) - Documentar como PRD
3. @architect *create-architecture (brownfield) - Arquitectura técnica
```

### "Quiero optimizar la base de datos"

```
1. @data-engineer *security-audit - Verificar RLS y esquema
2. @data-engineer *analyze-performance hotpaths - Encontrar cuellos de botella
3. @data-engineer *create-migration-plan - Planificar optimizaciones
4. @data-engineer *apply-migration - Aplicar cambios
```

---

## Patrones de Delegación (Story 6.1.2.3)

### Creación de Épica/Historia

- **PM crea épica** → **SM crea historias**
  ```
  @pm *create-epic         # Estructura de épica
  @sm *create-next-story   # Historias detalladas
  ```

### Trabajo con Base de Datos

- **Arquitecto selecciona BD** → **Data-engineer diseña esquema**
  ```
  @architect *create-architecture  # Selección de tecnología de BD
  @data-engineer *create-schema    # Diseño de esquema
  ```

### Investigación → Producto

- **Analyst investiga** → **PM crea PRD**
  ```
  @analyst *research               # Análisis de mercado
  @pm *create-prd                  # Documento de producto
  ```

---

## Documentación Completa

Para límites detallados y guía de "NO para", consulte:
- `docs/analysis/agent-responsibility-matrix.md` - Definiciones completas de límites
- `docs/guides/command-migration-guide.md` - Cambios y migraciones de comandos

---

**Versión:** 1.0 | **Story:** 6.1.2.3
