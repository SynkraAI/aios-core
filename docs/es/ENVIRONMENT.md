<!--
  Traducción: ES
  Original: /docs/en/ENVIRONMENT.md
  Última sincronización: 2026-01-26
-->

# Variables de Entorno

> 🌐 [EN](../ENVIRONMENT.md) | [PT](../pt/ENVIRONMENT.md) | **ES**

---

Este documento lista todas las variables de entorno utilizadas por Synkra AIOS y sus componentes.

## Descripción General

Synkra AIOS utiliza variables de entorno para configuración, claves API e información sensible. **Nunca haga commit de variables de entorno al repositorio.**

## Variables de Entorno Requeridas

### Framework Central

Actualmente, Synkra AIOS no requiere ninguna variable de entorno obligatoria para operación básica. Toda la configuración se realiza a través de `core-config.yaml` y archivos de configuración de Squad.

## Variables de Entorno Opcionales

### Integración con GitHub

Si está usando funciones de GitHub CLI:

```bash
GITHUB_TOKEN=your_github_token_here
```

**Nota:** GitHub CLI (`gh`) maneja la autenticación automáticamente. Esta variable solo es necesaria si está usando la API de GitHub directamente.

### Squads

Algunos Squads pueden requerir variables de entorno. Consulte el README de cada pack para requisitos específicos.

#### ETL Squad

```bash
# Opcional: Claves API para fuentes de datos
YOUTUBE_API_KEY=your_youtube_api_key
TWITTER_API_KEY=your_twitter_api_key
# ... otras claves API de servicios
```

#### Squads Privados

Los Squads privados (en el repositorio `aios-Squads`) pueden requerir variables de entorno adicionales. Consulte la documentación de cada pack.

## Configuración del Archivo de Entorno

### Creando el Archivo `.env`

1. Copie el archivo de ejemplo (si está disponible):
   ```bash
   cp .env.example .env
   ```

2. O cree un nuevo archivo `.env` en la raíz del proyecto:
   ```bash
   touch .env
   ```

3. Agregue sus variables de entorno:
   ```bash
   # .env
   GITHUB_TOKEN=your_token_here
   YOUTUBE_API_KEY=your_key_here
   ```

### Cargando Variables de Entorno

Synkra AIOS usa `dotenv` (si está instalado) o el soporte nativo de variables de entorno de Node.js. Las variables de entorno se cargan automáticamente desde archivos `.env` en la raíz del proyecto.

**Importante:** El archivo `.env` está en gitignore y nunca se hará commit al repositorio.

## Mejores Prácticas de Seguridad

1. **Nunca haga commit de archivos `.env`** - Están automáticamente en gitignore
2. **Nunca haga commit de claves API o secretos** - Use variables de entorno en su lugar
3. **Use valores diferentes para desarrollo y producción** - Cree archivos `.env.development` y `.env.production`
4. **Rote secretos regularmente** - Especialmente si pueden haber sido expuestos
5. **Use herramientas de gestión de secretos** - Para despliegues en producción, considere usar servicios como:
   - AWS Secrets Manager
   - Azure Key Vault
   - HashiCorp Vault
   - GitHub Secrets (para CI/CD)

## Variables de Entorno para CI/CD

Para GitHub Actions y otros pipelines de CI/CD, use la gestión de secretos de la plataforma:

### GitHub Actions

```yaml
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  CUSTOM_SECRET: ${{ secrets.CUSTOM_SECRET }}
```

### Otras Plataformas de CI/CD

Consulte la documentación de su plataforma para gestión de secretos:
- **GitLab CI:** Use variables de GitLab CI/CD
- **CircleCI:** Use variables de entorno de CircleCI
- **Jenkins:** Use credenciales de Jenkins

## Resolución de Problemas

### Variables de Entorno No se Cargan

1. Verifique que el archivo `.env` existe en la raíz del proyecto
2. Verifique la sintaxis del archivo `.env` (sin espacios alrededor de `=`)
3. Reinicie su servidor/proceso de desarrollo
4. Verifique que `dotenv` está instalado (si es requerido)

### Variables de Entorno Faltantes

Si ve errores sobre variables de entorno faltantes:
1. Consulte este documento para variables requeridas
2. Consulte la documentación del Squad
3. Verifique que el archivo `.env` contiene todas las variables necesarias
4. Asegúrese de que el archivo `.env` está en la ubicación correcta (raíz del proyecto)

## Contribuir

Al agregar nuevas variables de entorno:
1. Documéntelas en este archivo
2. Agréguelas a `.env.example` (si crea uno)
3. Actualice la documentación relevante
4. Asegúrese de que `.env` está en `.gitignore`

---

**Última Actualización:** 2025-11-12
**Story:** 4.8 - Repository Open-Source Migration
