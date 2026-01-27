<!-- Traducción: ES | Original: /docs/en/architecture/adr/adr-isolated-vm-decision.md | Sincronización: 2026-01-27 -->

# ADR: Compatibilidad isolated-vm con macOS

**Estado:** Reemplazado
**Fecha:** 2026-01-04
**Actualizado:** 2026-01-27
**Story:** TD-6 - Estabilidad de CI y Mejoras de Cobertura de Pruebas
**Autor:** @devops (Gage)
**Reemplazado Por:** Eliminación de dependencia (v3.11.0)

## Actualización (2026-01-27)

**Decisión Cambiada:** `isolated-vm` ha sido **eliminado de las dependencias** completamente.

### Razón de la Eliminación

Después del análisis de código, descubrimos que `isolated-vm` nunca fue realmente usado en el codebase. Fue añadido como placeholder para futura ejecución de código en sandbox, pero nunca fue implementado.

### Beneficios de la Eliminación

1. **Compatibilidad total con Node.js 18-24** en todas las plataformas (macOS, Linux, Windows)
2. **43 paquetes menos** en el árbol de dependencias
3. **6 vulnerabilidades menos** (8 → 2)
4. **Sin más problemas de compilación de módulos nativos**
5. **100% de cobertura de matriz de CI** (12 combinaciones: 3 OS × 4 versiones Node)

### Dependencias Actualizadas

| Paquete       | Antes   | Después       | Node.js Min         |
| ------------- | ------- | ------------- | ------------------- |
| `isolated-vm` | ^5.0.4  | **ELIMINADO** | N/A                 |
| `commander`   | ^14.0.1 | ^12.1.0       | >=18                |
| `glob`        | ^11.0.3 | ^10.4.4       | 14, 16, 18, 20, 22+ |

---

## Contexto Original (Histórico)

Durante las pruebas de CI, observamos crashes SIGSEGV en macOS con Node.js 18.x y 20.x al usar `isolated-vm`. Esto afecta la cobertura de la matriz de CI.

## Hallazgos de la Investigación Original

### Configuraciones Afectadas

| Plataforma  | Versión Node | Estado           |
| ----------- | ------------ | ---------------- |
| macOS ARM64 | 18.x         | ❌ Crash SIGSEGV |
| macOS ARM64 | 20.x         | ❌ Crash SIGSEGV |
| macOS ARM64 | 22.x         | ✅ Funciona      |
| macOS x64   | Todas        | ✅ Funciona      |
| Ubuntu      | Todas        | ✅ Funciona      |
| Windows     | Todas        | ✅ Funciona      |

### Causa Raíz

**Issue GitHub:** [laverdet/isolated-vm#424](https://github.com/laverdet/isolated-vm/issues/424) - "Segmentation fault on Node 20 macos arm64"

El problema es una incompatibilidad conocida entre los bindings nativos de `isolated-vm` y las builds Node.js ARM64 en macOS para versiones 18.x y 20.x.

## Decisión Original (Ahora Reemplazada)

**Mantener exclusión actual de la matriz de CI** para macOS + Node 18/20.

Esta decisión ha sido reemplazada por la eliminación completa de `isolated-vm` de las dependencias del proyecto.

## Referencias

- [isolated-vm#424 - Segmentation fault on Node 20 macos arm64](https://github.com/laverdet/isolated-vm/issues/424)
- [isolated-vm releases](https://github.com/laverdet/isolated-vm/releases)
