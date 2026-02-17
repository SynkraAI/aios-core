<!--
  Traducción: ES
  Original: /docs/en/guides/quality-dashboard.md
  Última sincronización: 2026-01-26
-->

# Guía del Dashboard de Quality Gates

> 🌐 [EN](../../guides/quality-dashboard.md) | [PT](../../pt/guides/quality-dashboard.md) | **ES**

---

> Dashboard visual para monitorear métricas de calidad en las 3 capas.

**Versión:** 1.0
**Última Actualización:** 2025-12-05

---

## Resumen

El Dashboard de Quality Gates proporciona visualización en tiempo real de las métricas de calidad recopiladas de las tres capas de quality gates. Ayuda a los tech leads y desarrolladores a monitorear tendencias de calidad de código, identificar problemas y rastrear la efectividad del sistema de quality gates.

### Características Principales

| Característica                     | Descripción                                                       |
| ---------------------------------- | ----------------------------------------------------------------- |
| **Métricas de 3 Capas**            | Ver tasas de aprobación para Pre-Commit, PR Review y Human Review |
| **Gráficos de Tendencias**         | Seguir tasa de auto-detección en los últimos 30 días              |
| **Actualizaciones en Tiempo Real** | Auto-actualización cada 60 segundos                               |
| **Diseño Responsivo**              | Funciona en escritorio, tablet y móvil                            |
| **Accesibilidad**                  | Cumple con WCAG 2.1 AA                                            |
| **Modo Oscuro**                    | Automático basado en preferencia del sistema                      |

---

## Acceder al Dashboard

### Modo de Desarrollo

```bash
# Navegar al directorio del dashboard
cd tools/quality-dashboard

# Sincronizar métricas e iniciar servidor de desarrollo
npm run dev:sync

# O sincronizar por separado
npm run sync-metrics
npm run dev
```

El dashboard se abrirá en `http://localhost:3000`.

### Build de Producción

```bash
# Build para producción
cd tools/quality-dashboard
npm run build

# Previsualizar build de producción
npm run preview

# Servir desde directorio dist/
npx serve dist
```

### Acceso Directo a Archivo

Abrir el dashboard pre-construido:

```
tools/quality-dashboard/dist/index.html
```

---

## Entendiendo el Dashboard

### Sección de Encabezado

```
┌─────────────────────────────────────────────────────────┐
│  📊 Dashboard de Quality Gates                          │
│  Última Actualización: Dic 5, 2025 14:30:00            │
│  [🔄 Actualizar] [Auto-actualización: 60s ▼]           │
└─────────────────────────────────────────────────────────┘
```

| Elemento                 | Descripción                                        |
| ------------------------ | -------------------------------------------------- |
| **Última Actualización** | Timestamp de la última obtención de datos          |
| **Botón Actualizar**     | Actualización manual sin recargar página           |
| **Auto-actualización**   | Intervalo configurable (30s, 60s, 5m, desactivado) |

### Tarjetas de Capas

Cada capa de quality gate tiene su propia tarjeta de métricas:

```
┌─────────────────────────────────────────────────────────┐
│  Capa 1: Pre-Commit                         ● Saludable │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Tasa de Aprobación: 94.5%  Tiempo Prom: 32s  Ejecuciones: 156 │
│  ████████████████░░                                     │
│                                                         │
│  [Click para expandir]                                  │
└─────────────────────────────────────────────────────────┘
```

#### Capa 1: Pre-Commit

| Métrica                  | Descripción                                                             |
| ------------------------ | ----------------------------------------------------------------------- |
| **Tasa de Aprobación**   | % de commits que pasan todas las verificaciones (lint, test, typecheck) |
| **Tiempo Promedio**      | Tiempo promedio para completar todas las verificaciones de Capa 1       |
| **Total de Ejecuciones** | Número de ejecuciones de pre-commit en el período de tiempo             |

#### Capa 2: PR Review

| Métrica                     | Descripción                                           |
| --------------------------- | ----------------------------------------------------- |
| **Tasa de Aprobación**      | % de PRs que pasan la revisión automatizada           |
| **Hallazgos de CodeRabbit** | Problemas encontrados por CodeRabbit (por severidad)  |
| **Hallazgos de Quinn**      | Problemas encontrados por el agente @qa               |
| **Tasa de Auto-Detección**  | % de problemas detectados antes de la revisión humana |

**Vista Expandida (click para expandir):**

```
┌─────────────────────────────────────────────────────────┐
│  Capa 2: PR Review                         ● Advertencia │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Tasa de Aprobación: 87.2%  Tiempo Prom: 4m 32s  Total: 45 PRs │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Desglose de CodeRabbit                          │   │
│  │ CRÍTICO: 3  │  ALTO: 12  │  MEDIO: 28          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Hallazgos de Quinn (@qa)                        │   │
│  │ Bloqueadores: 2  │  Advertencias: 8  │  Info: 15 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Capa 3: Human Review

| Métrica                | Descripción                                           |
| ---------------------- | ----------------------------------------------------- |
| **Tasa de Aprobación** | % de PRs aprobados en la primera revisión             |
| **Tiempo Promedio**    | Tiempo promedio desde creación de PR hasta aprobación |
| **Tasa de Revisión**   | % de PRs que requieren revisiones                     |

### Gráfico de Tendencias

El gráfico de tendencias muestra la tasa de auto-detección en los últimos 30 días:

```
Tendencia de Tasa de Auto-Detección (30 días)
100% ┤
 90% ┤        ╭──────────╮
 80% ┤   ╭────╯          ╰────╮
 70% ┤───╯                    ╰───
 60% ┤
     └────────────────────────────
        Semana 1   Semana 2   Semana 3   Semana 4
```

**Tasa de Auto-Detección** = Problemas detectados por Capa 1 + Capa 2 / Total de problemas

Mayor es mejor - significa que más problemas se detectan automáticamente antes de la revisión humana.

---

## Fuente de Datos de Métricas

### Ubicación

Las métricas se almacenan en:

```
.aios/data/quality-metrics.json
```

### Formato de Datos

```json
{
  "generated": "2025-12-05T14:30:00.000Z",
  "version": "1.0",
  "summary": {
    "overallHealth": "healthy",
    "autoCatchRate": 0.945,
    "totalRuns": 156
  },
  "layers": {
    "layer1": {
      "name": "Pre-Commit",
      "passRate": 0.945,
      "avgTimeSeconds": 32,
      "totalRuns": 156,
      "checks": {
        "lint": { "passRate": 0.98, "avgTime": 12 },
        "test": { "passRate": 0.95, "avgTime": 45 },
        "typecheck": { "passRate": 0.99, "avgTime": 28 }
      }
    },
    "layer2": {
      "name": "PR Review",
      "passRate": 0.872,
      "avgTimeSeconds": 272,
      "totalRuns": 45,
      "coderabbit": {
        "critical": 3,
        "high": 12,
        "medium": 28,
        "low": 45
      },
      "quinn": {
        "blockers": 2,
        "warnings": 8,
        "info": 15
      }
    },
    "layer3": {
      "name": "Human Review",
      "passRate": 0.78,
      "avgTimeSeconds": 86400,
      "totalRuns": 38,
      "revisionRate": 0.22
    }
  },
  "trends": {
    "autoCatchRate": [
      { "date": "2025-11-05", "value": 0.82 },
      { "date": "2025-11-12", "value": 0.87 },
      { "date": "2025-11-19", "value": 0.91 },
      { "date": "2025-11-26", "value": 0.93 },
      { "date": "2025-12-03", "value": 0.945 }
    ]
  }
}
```

### Sincronizando Métricas

El dashboard lee métricas de la carpeta pública. Para actualizar:

```bash
# Sincronizar desde .aios/data al dashboard
npm run sync-metrics

# O usar el comando combinado
npm run dev:sync
```

Esto copia `.aios/data/quality-metrics.json` a `tools/quality-dashboard/public/.aios/data/`.

---

## Interpretando Tendencias

### Tendencias Saludables

| Indicador                              | Qué Significa                                                        |
| -------------------------------------- | -------------------------------------------------------------------- |
| **Tasa de Auto-Detección en Aumento**  | Más problemas detectados automáticamente - quality gates funcionando |
| **Revisiones de Capa 3 Disminuyendo**  | Revisores humanos encuentran menos problemas                         |
| **Tasas de Aprobación Estables > 90%** | Desarrolladores escriben mejor código desde el inicio                |

### Señales de Advertencia

| Indicador                           | Qué Significa                                      | Acción                              |
| ----------------------------------- | -------------------------------------------------- | ----------------------------------- |
| **Tasa de Auto-Detección Bajando**  | Verificaciones automatizadas no detectan problemas | Revisar configuración de CodeRabbit |
| **Tasa de Aprobación Capa 1 < 80%** | Demasiados commits fallando                        | Verificar reglas de lint/test       |
| **Muchos CRÍTICOS en Capa 2**       | Problemas de seguridad/calidad                     | Revisar prácticas de código         |
| **Tasa de Revisión Capa 3 > 30%**   | Revisión humana encuentra muchos problemas         | Mejorar automatización              |

---

## Configuración

### Intervalo de Auto-Actualización

Click en el menú desplegable junto al botón de actualizar:

| Opción          | Caso de Uso                       |
| --------------- | --------------------------------- |
| **30 segundos** | Monitoreo activo durante releases |
| **60 segundos** | Predeterminado para uso diario    |
| **5 minutos**   | Monitoreo en segundo plano        |
| **Desactivado** | Solo actualización manual         |

### Modo Oscuro

El dashboard sigue automáticamente la preferencia del sistema. No se necesita interruptor manual.

---

## Accesibilidad

El dashboard cumple con WCAG 2.1 AA:

| Característica             | Implementación                                      |
| -------------------------- | --------------------------------------------------- |
| **Contraste de Color**     | Todo el texto tiene ratio de contraste mínimo 4.5:1 |
| **Navegación por Teclado** | Soporte completo de teclado con foco visible        |
| **Lectores de Pantalla**   | Etiquetas ARIA en todos los elementos interactivos  |
| **Movimiento Reducido**    | Respeta `prefers-reduced-motion`                    |
| **Gestión de Foco**        | Orden de tabulación lógico en todo                  |

---

## Solución de Problemas

### El Dashboard Muestra Datos Obsoletos

```bash
# Sincronizar métricas manualmente
cd tools/quality-dashboard
npm run sync-metrics

# Actualizar la página
```

### Archivo de Métricas No Encontrado

Asegúrese de que el recolector de métricas se haya ejecutado:

```bash
# Verificar si el archivo de métricas existe
ls -la .aios/data/quality-metrics.json

# Si falta, sembrar con datos de ejemplo
npx aios metrics seed
```

### Los Gráficos No Se Renderizan

1. Limpiar caché del navegador
2. Asegurar que JavaScript esté habilitado
3. Probar un navegador diferente

### Auto-Actualización No Funciona

La auto-actualización se pausa cuando:

- La pestaña del navegador está en segundo plano
- Se pierde conectividad de red
- El foco está en un elemento interactivo

---

## Documentación Relacionada

- [Guía de Quality Gates](./quality-gates.md)

---

_Synkra AIOS Quality Dashboard v1.0_
