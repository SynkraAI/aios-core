# Gestión de Claves de API MCP

> 🌐 [EN](../../architecture/mcp-api-keys-management.md) | [PT](../../pt/architecture/mcp-api-keys-management.md) | **ES**

---

**Versión:** 1.0.0
**Última Actualización:** 2026-01-26
**Estado:** Referencia Oficial

---

## Visión General

Este documento describe las mejores prácticas para gestionar claves de API utilizadas por servidores MCP (Model Context Protocol) en AIOS. La gestión adecuada de claves de API es crítica para la seguridad e integridad operacional.

---

## Arquitectura MCP en AIOS

AIOS utiliza Docker MCP Toolkit como la infraestructura principal de MCP:

```
┌─────────────────────────────────────────────────────────────┐
│                    Arquitectura MCP                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Directo en Claude Code (~/.claude.json)                   │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  playwright     → Automatización de navegador       │   │
│   │  desktop-commander → Operaciones docker gateway     │   │
│   └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│   Dentro de Docker Desktop (vía docker-gateway)             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  EXA           → Búsqueda web, investigación        │   │
│   │  Context7      → Documentación de librerías         │   │
│   │  Apify         → Web scraping, extracción de datos  │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Servidores MCP Soportados

| Servidor MCP | Clave Requerida | Variable de Entorno | Ubicación |
|--------------|-----------------|---------------------|-----------|
| EXA | Sí | `EXA_API_KEY` | Docker MCP config.yaml |
| Context7 | No | N/A | N/A |
| Apify | Sí | `APIFY_API_TOKEN` | Docker MCP docker-mcp.yaml |
| Playwright | No | N/A | N/A |

---

## Métodos de Configuración

### Método 1: Docker MCP Toolkit (Principal)

Docker MCP Toolkit gestiona claves de API a través de sus archivos de configuración.

**Para EXA (usa sección apiKeys):**

Ubicación: `~/.docker/mcp/config.yaml`

```yaml
# ~/.docker/mcp/config.yaml
apiKeys:
  exa: "tu-clave-api-exa-aqui"
```

**Para servidores que requieren variables de entorno (Apify, etc.):**

Ubicación: `~/.docker/mcp/catalogs/docker-mcp.yaml`

```yaml
# ~/.docker/mcp/catalogs/docker-mcp.yaml
apify:
  env:
    - name: APIFY_API_TOKEN
      value: 'tu-token-apify-aqui'  # Hardcode directamente (ver Problemas Conocidos)
```

### Método 2: Variables de Entorno

Para desarrollo local o configuraciones sin Docker:

```bash
# ~/.zshrc o ~/.bashrc
export EXA_API_KEY="tu-clave-api-exa"
export APIFY_API_TOKEN="tu-token-apify"
```

### Método 3: Archivo .env del Proyecto

Para configuración específica del proyecto:

```bash
# .env (agregar a .gitignore!)
EXA_API_KEY=tu-clave-api-exa
APIFY_API_TOKEN=tu-token-apify
```

---

## Gobernanza MCP en AIOS

**IMPORTANTE:** Toda la gestión de infraestructura MCP es manejada EXCLUSIVAMENTE por el **Agente DevOps (@devops / Gage)**.

| Operación | Agente | Comando |
|-----------|--------|---------|
| Buscar catálogo MCP | DevOps | `*search-mcp` |
| Agregar servidor MCP | DevOps | `*add-mcp` |
| Listar MCPs habilitados | DevOps | `*list-mcps` |
| Remover servidor MCP | DevOps | `*remove-mcp` |
| Configurar Docker MCP | DevOps | `*setup-mcp-docker` |

Otros agentes (Dev, Architect, etc.) son **consumidores** de MCP, no administradores.

---

## Mejores Prácticas de Seguridad

### HACER

- Almacenar claves de API en variables de entorno o archivos de config seguros
- Agregar archivos `.env` a `.gitignore`
- Usar claves de API diferentes para desarrollo y producción
- Rotar claves de API periódicamente (recomendado cada 90 días)
- Usar claves de API de solo lectura cuando no se necesita acceso de escritura
- Monitorear uso de API para anomalías

### NO HACER

- Commitear claves de API al control de versiones
- Compartir claves de API en chat o email
- Usar claves de producción en desarrollo
- Almacenar claves en archivos de texto plano en ubicaciones compartidas
- Hardcodear claves en el código fuente

---

## Problemas Conocidos

### Bug de Secrets de Docker MCP (Dic 2025)

**Problema:** El almacenamiento de secrets del Docker MCP Toolkit y la interpolación de templates no funcionan correctamente. Las credenciales configuradas vía `docker mcp secret set` NO se pasan a los containers.

**Síntomas:**
- `docker mcp tools ls` muestra "(N prompts)" en lugar de "(N tools)"
- El servidor MCP inicia pero falla la autenticación
- La salida verbose muestra `-e ENV_VAR` sin valores

**Solución:** Editar `~/.docker/mcp/catalogs/docker-mcp.yaml` directamente con valores hardcodeados:

```yaml
# En lugar de usar referencia de secrets
apify:
  env:
    - name: APIFY_API_TOKEN
      value: 'valor-real-del-token'  # Hardcode directamente
```

**MCPs Afectados:** Cualquier MCP que requiera autenticación (Apify, Notion, Slack, etc.)

**MCPs Funcionando:** EXA funciona porque su clave está en `~/.docker/mcp/config.yaml` bajo `apiKeys`

---

## Procedimiento de Rotación de Claves

### Paso 1: Generar Nueva Clave

1. Inicia sesión en el dashboard del proveedor de servicio (EXA, Apify, etc.)
2. Genera una nueva clave de API
3. Anota la nueva clave de forma segura

### Paso 2: Actualizar Configuración

```bash
# Actualizar config de Docker MCP
vim ~/.docker/mcp/config.yaml

# O para MCPs basados en env
vim ~/.docker/mcp/catalogs/docker-mcp.yaml
```

### Paso 3: Verificar Nueva Clave

```bash
# Reiniciar Docker MCP (si usas Docker Desktop MCP)
# O reiniciar Claude Code para recargar configuración

# Probar la conexión usando @devops
@devops *list-mcps
```

### Paso 4: Revocar Clave Anterior

1. Regresa al dashboard del proveedor de servicio
2. Revoca/elimina la clave de API anterior
3. Verifica que la clave anterior ya no funciona

---

## Solución de Problemas

### Error "Autenticación fallida"

1. Verifica que la clave de API es correcta (sin espacios extra)
2. Verifica si la clave ha expirado
3. Verifica si la clave tiene los permisos necesarios
4. Verifica si se excedieron los límites de uso

### Claves No Siendo Leídas

1. Reinicia Claude Code o tu IDE
2. Verifica la sintaxis del archivo de config (YAML)
3. Verifica los permisos del archivo
4. Para Docker MCP, verifica que Docker Desktop está corriendo

### Herramienta MCP Muestra "prompts" en Lugar de "tools"

Esto indica el bug de secrets. Usa la solución hardcodeada en docker-mcp.yaml.

---

## Fuentes de Claves de API

| Servicio | Obtener Clave de API | Documentación |
|----------|---------------------|---------------|
| EXA | [dashboard.exa.ai](https://dashboard.exa.ai) | [docs.exa.ai](https://docs.exa.ai) |
| Apify | [console.apify.com](https://console.apify.com) | [docs.apify.com](https://docs.apify.com) |

---

## Documentación Relacionada

- [Reglas de Uso MCP](../../../.claude/rules/mcp-usage.md) - Reglas completas de gobernanza MCP
- [Arquitectura de Alto Nivel](./high-level-architecture.md)

---

**Mantenedor:** @devops (Gage)
