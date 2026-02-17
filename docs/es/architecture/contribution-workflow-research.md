<!-- Traducción: ES | Original: /docs/en/architecture/contribution-workflow-research.md | Sincronización: 2026-01-26 -->

# Investigación de Flujo de Trabajo de Contribución Externa

> 🌐 [EN](../../architecture/contribution-workflow-research.md) | [PT](../../pt/architecture/contribution-workflow-research.md) | **ES**

---

**Historia:** COLLAB-1
**Fecha:** 2025-12-30
**Autor:** @dev (Dex) + @devops (Gage)
**Estado:** Completo

---

## Resumen Ejecutivo

Este documento consolida los hallazgos de investigación sobre mejores prácticas para flujos de trabajo de contribuidores externos en proyectos de código abierto, específicamente para habilitar contribuciones seguras de la comunidad a agentes y tareas de AIOS.

---

## 1. Mejores Prácticas de Protección de Ramas en GitHub

### 1.1 Recomendaciones de la Industria

Basado en investigación de [GitHub Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule), [DEV Community](https://dev.to/n3wt0n/best-practices-for-branch-protection-2pe3), y [Legit Security](https://www.legitsecurity.com/blog/github-security-best-practices-your-team-should-be-following):

| Regla de Protección                   | Recomendación            | Justificación                                    |
| ------------------------------------- | ------------------------ | ------------------------------------------------ |
| **Revisiones de PR requeridas**       | Habilitar con 1-2 revisores | Previene código sin revisar de hacer merge     |
| **Requerir revisiones de code owner** | Habilitar                | Asegura que expertos del dominio revisen cambios |
| **Descartar revisiones obsoletas**    | Habilitar                | Fuerza re-revisión después de nuevos cambios     |
| **Status checks requeridos**          | CI debe pasar            | Detecta fallos de build/test antes del merge     |
| **Requerir resolución de conversación**| Habilitar               | Asegura que todo feedback sea atendido           |
| **Restringir force pushes**           | Deshabilitar force push  | Previene reescritura del historial               |
| **Requerir historial lineal**         | Opcional                 | Historial git más limpio (considerar para monorepos)|

### 1.2 Hallazgos Clave

> "Los colaboradores con acceso de escritura a un repositorio tienen permisos completos de escritura en todos sus archivos e historial. Aunque esto es bueno para la colaboración, no siempre es deseable."

**Punto Crítico:** La protección de ramas es una de las consideraciones de seguridad más importantes. Puede prevenir que código no deseado sea pusheado a producción.

### 1.3 Configuración Recomendada para Open Source

```yaml
branch_protection:
  require_pull_request_reviews:
    required_approving_review_count: 1 # Al menos 1 aprobación
    dismiss_stale_reviews: true # Re-revisar después de cambios
    require_code_owner_reviews: true # Aprobación de experto del dominio
    require_last_push_approval: false # Opcional para OSS

  required_status_checks:
    strict: true # Rama debe estar actualizada
    contexts:
      - lint
      - typecheck
      - build
      - test # Crítico para calidad

  restrictions:
    users: []
    teams: ['maintainers']

  allow_force_pushes: false
  allow_deletions: false
  required_conversation_resolution: true # Atender todo feedback
```

---

## 2. Mejores Prácticas de Configuración CodeRabbit

### 2.1 Documentación Oficial

De [CodeRabbit Docs](https://docs.coderabbit.ai/getting-started/yaml-configuration) y [awesome-coderabbit](https://github.com/coderabbitai/awesome-coderabbit):

**Elementos Clave de Configuración:**

| Elemento                    | Propósito                      | Recomendación                             |
| --------------------------- | ------------------------------ | ----------------------------------------- |
| `language`                  | Idioma de respuesta            | Coincidir con idioma del proyecto (pt-BR o en-US) |
| `reviews.auto_review`       | Revisiones automáticas de PR   | Habilitar para OSS                        |
| `reviews.path_instructions` | Reglas de revisión por ruta    | Esencial para validación de agentes/tareas|
| `chat.auto_reply`           | Responder a comentarios        | Habilitar para mejor experiencia del contribuidor|

### 2.2 Ejemplos del Mundo Real

**TEN Framework (.coderabbit.yaml):**

```yaml
language: 'en-US'
reviews:
  profile: 'chill'
  high_level_summary: true
  auto_review:
    enabled: true
tools:
  ruff:
    enabled: true
  gitleaks:
    enabled: true
```

**Proyecto PHARE:**

```yaml
path_instructions:
  '**/*.cpp':
    - 'Verificar fugas de memoria'
    - 'Verificar seguridad de hilos'
tools:
  shellcheck:
    enabled: true
  markdownlint:
    enabled: true
```

**NVIDIA NeMo RL:**

```yaml
auto_title_instructions: |
  Formato: "<categoría>: <título>"
  Categorías: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
  Título debe ser <= 80 caracteres
```

### 2.3 Recomendaciones Específicas para AIOS

Para contribuciones de agentes/tareas, CodeRabbit debe validar:

1. **Estructura YAML de agentes** - persona_profile, commands, dependencies
2. **Formato de tareas** - puntos de elicitación, entregables
3. **Documentación** - Actualizaciones de README, referencias a guías
4. **Seguridad** - Sin secretos hardcodeados, permisos apropiados

---

## 3. Mejores Prácticas de CODEOWNERS

### 3.1 Patrones de la Industria

De [Harness Blog](https://www.harness.io/blog/mastering-codeowners), [Satellytes](https://www.satellytes.com/blog/post/monorepo-codeowner-github-enterprise/), y [GitHub Docs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners):

**Principios Clave:**

| Principio            | Descripción                                   |
| -------------------- | --------------------------------------------- |
| **Última coincidencia gana** | Patrones posteriores sobrescriben anteriores |
| **Usar comodines**   | Consolidar entradas con `*` y `**`            |
| **Equipos sobre usuarios** | Más fácil mantener cuando personas cambian |
| **Granularidad**     | Balance entre muy amplio y muy específico     |

### 3.2 Patrones de Monorepo

```codeowners
# Propietario por defecto (fallback)
* @org/maintainers

# Propiedad de directorio (más específico)
/src/auth/ @org/security-team
/src/api/ @org/backend-team
/src/ui/ @org/frontend-team

# Propiedad por tipo de archivo
*.sql @org/dba-team
Dockerfile @org/devops-team

# Archivos críticos (requieren revisión senior)
/.github/ @org/core-team
/security/ @org/security-team
```

### 3.3 Estructura Específica de AIOS

```codeowners
# Por defecto - requiere revisión de maintainer
* @SynkraAI/maintainers

# Definiciones de agentes - requiere equipo core
.aios-core/development/agents/ @SynkraAI/core-team

# Definiciones de tareas - requiere equipo core
.aios-core/development/tasks/ @SynkraAI/core-team

# CI/CD - requiere aprobación devops
.github/ @SynkraAI/devops

# Documentación - más permisivo para contribuidores
docs/ @SynkraAI/maintainers

# Plantillas - requiere revisión de arquitecto
templates/ @SynkraAI/core-team
.aios-core/product/templates/ @SynkraAI/core-team
```

---

## 4. Checks Requeridos de GitHub Actions

### 4.1 Mejores Prácticas

De [GitHub Docs](https://docs.github.com/articles/about-status-checks) y discusiones de la comunidad:

**Hallazgo Crítico:**

> "Si un check falla, GitHub previene el merge del PR. Sin embargo, jobs omitidos reportan 'Success' y no previenen el merge."

**Patrón de Solución (job alls-green):**

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    # ...

  test:
    runs-on: ubuntu-latest
    # ...

  alls-green:
    name: Todos los Checks Pasaron
    runs-on: ubuntu-latest
    needs: [lint, test]
    if: always()
    steps:
      - name: Verificar que todos los jobs pasaron
        run: |
          if [ "${{ needs.lint.result }}" != "success" ]; then exit 1; fi
          if [ "${{ needs.test.result }}" != "success" ]; then exit 1; fi
```

### 4.2 Checks Requeridos Recomendados

| Check                 | Tipo      | Prioridad          |
| --------------------- | --------- | ------------------ |
| `lint`                | Requerido | ALTA               |
| `typecheck`           | Requerido | ALTA               |
| `build`               | Requerido | ALTA               |
| `test`                | Requerido | ALTA               |
| `story-validation`    | Opcional  | MEDIA              |
| `ide-sync-validation` | Opcional  | BAJA               |
| `alls-green`          | Requerido | ALTA (job resumen) |

---

## 5. Ejemplos de Flujo de Contribución OSS

### 5.1 Next.js

De [Next.js Contribution Guide](https://nextjs.org/docs/community/contribution-guide):

- Flujo de fork y PR
- Verificación automática de formateo Prettier
- Requiere revisión de PR de maintainers
- Usa Turborepo para gestión de monorepo

### 5.2 Prisma

De [Prisma CONTRIBUTING.md](https://github.com/prisma/prisma/blob/main/CONTRIBUTING.md):

**Requisitos Clave:**

- Firma de CLA requerida
- Mensajes de commit estructurados
- Tests deben cubrir cambios
- Tamaño de bundle monitoreado (<6MB)
- CI/CD debe pasar (lint, test, cross-platform)

**Flujo de Trabajo:**

1. Clonar repositorio
2. Crear rama de feature
3. Hacer cambios + tests
4. Enviar PR con descripción
5. Firmar CLA
6. Esperar revisión

### 5.3 Patrones Comunes

| Patrón               | Adopción                 | Recomendación        |
| -------------------- | ------------------------ | -------------------- |
| Flujo de fork        | Muy común                | Adoptar              |
| Firma de CLA         | Común en OSS corporativo | Opcional por ahora   |
| Commits convencionales| Muy común               | Ya adoptado          |
| Aprobaciones requeridas| Universal              | Adoptar (1 aprobación)|
| CODEOWNERS           | Común                    | Adoptar (granular)   |
| CodeRabbit/revisión IA| En crecimiento          | Adoptar              |

---

## 6. Consideraciones de Seguridad

### 6.1 Flujo Fork vs Rama Directa

| Aspecto                 | Flujo Fork             | Rama Directa          |
| ----------------------- | ---------------------- | --------------------- |
| **Seguridad**           | Mayor (aislado)        | Menor (repo compartido)|
| **Acceso contribuidor** | Sin escritura necesaria| Acceso escritura necesario|
| **CI/CD**               | Corre en contexto fork | Corre en repo principal|
| **Secretos**            | Protegidos             | Accesibles            |
| **Complejidad**         | Ligeramente mayor      | Menor                 |

**Recomendación:** Flujo fork para contribuidores externos (ya documentado en CONTRIBUTING.md)

### 6.2 Protección de Secretos en PRs

- Nunca exponer secretos en logs de CI
- Usar `pull_request_target` con cuidado
- Limitar alcances de secretos
- Auditar autores de PR por patrones sospechosos

---

## 7. Recomendaciones para AIOS

### 7.1 Acciones Inmediatas (CRÍTICO)

1. **Habilitar revisiones aprobatorias requeridas** (`required_approving_review_count: 1`)
2. **Habilitar revisiones de code owner** (`require_code_owner_reviews: true`)
3. **Agregar `test` a status checks requeridos**

### 7.2 Acciones a Corto Plazo (ALTO)

1. **Crear `.coderabbit.yaml`** con instrucciones de ruta específicas de AIOS
2. **Actualizar CODEOWNERS** con propiedad granular
3. **Habilitar resolución de conversación requerida**

### 7.3 Acciones a Mediano Plazo (MEDIO)

1. **Crear plantillas de PR especializadas** para contribuciones de agentes/tareas
2. **Mejorar CONTRIBUTING.md** con checklist de contribución de agentes
3. **Agregar guía de onboarding para contribuidores**

### 7.4 Baja Prioridad (NICE TO HAVE)

1. **Agregar bot de CLA** para protección legal
2. **Implementar automatización de PRs obsoletos**
3. **Agregar dashboard de métricas de contribución**

---

## 8. Fuentes

### Protección de Ramas

- [GitHub Docs: Managing Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule)
- [DEV Community: Best Practices for Branch Protection](https://dev.to/n3wt0n/best-practices-for-branch-protection-2pe3)
- [Legit Security: GitHub Security Best Practices](https://www.legitsecurity.com/blog/github-security-best-practices-your-team-should-be-following)

### CodeRabbit

- [CodeRabbit YAML Configuration](https://docs.coderabbit.ai/getting-started/yaml-configuration)
- [awesome-coderabbit Repository](https://github.com/coderabbitai/awesome-coderabbit)
- [TEN Framework .coderabbit.yaml](https://github.com/TEN-framework/ten-framework/blob/main/.coderabbit.yaml)

### CODEOWNERS

- [Harness: Mastering CODEOWNERS](https://www.harness.io/blog/mastering-codeowners)
- [GitHub Docs: About Code Owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Satellytes: Monorepo CODEOWNERS](https://www.satellytes.com/blog/post/monorepo-codeowner-github-enterprise/)

### GitHub Actions

- [GitHub Docs: About Status Checks](https://docs.github.com/articles/about-status-checks)
- [GitHub Blog: Required Workflows](https://github.blog/enterprise-software/devops/introducing-required-workflows-and-configuration-variables-to-github-actions/)

### Ejemplos OSS

- [Next.js Contribution Guide](https://nextjs.org/docs/community/contribution-guide)
- [Prisma CONTRIBUTING.md](https://github.com/prisma/prisma/blob/main/CONTRIBUTING.md)

---

_Documento generado como parte de la Historia COLLAB-1 investigación._
