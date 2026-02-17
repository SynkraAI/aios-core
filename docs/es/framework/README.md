<!--
  Traducción: ES
  Original: /docs/en/framework/README.md
  Última sincronización: 2026-01-26
-->

# Documentación del Framework AIOS

> 🌐 [EN](../../framework/README.md) | [PT](../../pt/framework/README.md) | **ES**

---

**Estado:** Estándares Oficiales del Framework
**Creado:** 2025-01-16 (Story 6.1.2.6)
**Objetivo de Migración:** Q2 2026 → repositorio `SynkraAI/aios-core`

---

## Descripción General

Este directorio contiene la **documentación oficial del framework AIOS** que define estándares, patrones y estructuras aplicables a todos los proyectos AIOS (greenfield y brownfield).

**Propósito**: Separar la documentación a nivel de framework de los detalles de implementación específicos del proyecto.

---

## Inventario de Documentación

| Documento                                      | Propósito                                                                                   | Audiencia                     |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------- |
| [**coding-standards.md**](coding-standards.md) | Estándares JavaScript/TypeScript, convenciones de nomenclatura, reglas de calidad de código | Todos los desarrolladores     |
| [**tech-stack.md**](tech-stack.md)             | Elecciones tecnológicas, frameworks, bibliotecas y estándares de herramientas               | Arquitectos, desarrolladores  |
| [**source-tree.md**](source-tree.md)           | Estructura de directorios, organización de archivos y patrones de diseño del proyecto       | Todos los miembros del equipo |

---

## Aviso de Migración

**IMPORTANTE**: Estos documentos ahora están en el repositorio `SynkraAI/aios-core`. La migración desde la antigua organización `aios/aios-core` se completó en diciembre de 2024 como parte del OSR-9 (Rebranding).

### Cronograma de Migración

- **Fase 1 (Q1 2026 - Story 6.1.2.6):** Documentación del framework separada en `docs/framework/`
- **Fase 2 (Q4 2024):** Repositorio migrado a `SynkraAI/aios-core` (OSR-9)
- **Fase 3 (Q3 2026):** Copias antiguas de `docs/architecture/` eliminadas del proyecto brownfield

### Compatibilidad hacia Atrás

Para compatibilidad hacia atrás, la documentación del framework permanece accesible en **ambas** ubicaciones hasta Q3 2026:

- **Nueva ubicación** (preferida): `docs/framework/{nombre-doc}.md`
- **Ubicación antigua** (obsoleta): `docs/architecture/{nombre-doc}.md`

**Referencias**: Actualice los enlaces internos para usar `docs/framework/` para prepararse para la migración.

---

## Documentación de Framework vs. Proyecto

### Documentación del Framework (`docs/framework/`)

- **Alcance**: Portable a través de todos los proyectos AIOS
- **Ejemplos**: Estándares de codificación, stack tecnológico, estructura del árbol de código fuente
- **Ciclo de vida**: Reside en el repositorio `SynkraAI/aios-core`
- **Cambios**: Requieren aprobación a nivel de framework

### Documentación del Proyecto (`docs/architecture/project-decisions/`)

- **Alcance**: Específico para la implementación brownfield
- **Ejemplos**: Análisis de decisiones, revisiones arquitectónicas, decisiones de integración
- **Ciclo de vida**: Reside permanentemente en el repositorio del proyecto
- **Cambios**: Decididos por el equipo del proyecto

---

## Guías de Uso

### Para Desarrolladores

1. **Lea la documentación del framework durante la incorporación** - Comprenda los estándares de AIOS
2. **Consulte durante el desarrollo** - Asegure el cumplimiento con los patrones del framework
3. **Proponga cambios mediante PRs** - Los estándares del framework evolucionan con aportes de la comunidad

### Para Arquitectos

1. **Mantenga la documentación del framework** - Mantenga los estándares actualizados y prácticos
2. **Revise PRs para cumplimiento** - Asegure que el código siga los estándares documentados
3. **Planifique la migración** - Prepárese para la separación del repositorio en Q2 2026

### Para Mantenedores del Framework AIOS

1. **Control de versiones** - Rastree cambios en los estándares del framework
2. **Preparación para la migración** - Asegure que la documentación esté lista para la separación del repositorio
3. **Consistencia entre proyectos** - Aplique los estándares de manera uniforme

---

**Última Actualización**: 2025-12-14
**Mantenedor**: Equipo del Framework AIOS
