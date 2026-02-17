<!-- Traducción: ES | Original: /docs/en/architecture/hcs-self-healing-spec.md | Sincronización: 2026-01-26 -->

# Especificación de Auto-reparación HCS

> 🌐 [EN](../../architecture/hcs-self-healing-spec.md) | [PT](../../pt/architecture/hcs-self-healing-spec.md) | **ES**

---

**Versión:** 1.0
**Estado:** Propuesto
**Creado:** 2025-12-30
**Historia:** Investigación HCS-1
**Autor:** @architect (Aria) vía @dev (Dex)

---

## Tabla de Contenidos

- [Resumen Ejecutivo](#resumen-ejecutivo)
- [Filosofía de Auto-reparación](#filosofía-de-auto-reparación)
- [Definiciones de Niveles](#definiciones-de-niveles)
- [Reglas de Seguridad](#reglas-de-seguridad)
- [Estrategia de Respaldo](#estrategia-de-respaldo)
- [Procedimientos de Reversión](#procedimientos-de-reversión)
- [Directrices de Implementación](#directrices-de-implementación)

---

## Resumen Ejecutivo

Este documento especifica las capacidades de auto-reparación del Sistema de Verificación de Salud de AIOS (HCS). La auto-reparación permite que el sistema corrija automáticamente ciertos problemas mientras mantiene la seguridad y el control del usuario.

### Principios Fundamentales

1. **Seguridad Primero:** Nunca modificar archivos que puedan causar pérdida de datos o problemas de seguridad
2. **Transparencia:** Todas las acciones se registran y son reversibles
3. **Control del Usuario:** Las correcciones críticas requieren confirmación explícita
4. **Incremental:** Comenzar con correcciones seguras, escalar al usuario para problemas complejos

---

## Filosofía de Auto-reparación

### Patrones de la Industria Aplicados

| Sistema        | Enfoque de Auto-reparación                       | Lección para HCS                                   |
| -------------- | ------------------------------------------------ | -------------------------------------------------- |
| **Kubernetes** | Reiniciar contenedores ante falla de liveness    | Recuperación automática para operaciones conocidas |
| **VS Code**    | Auto-actualizar extensiones, bloquear maliciosas | Actualizaciones silenciosas, bloqueos explícitos   |
| **Terraform**  | `apply` solo después de aprobación de `plan`     | Separar detección de remediación                   |
| **npm/yarn**   | `--update-checksums` para corregir integridad    | Comandos de recuperación iniciados por usuario     |
| **Git**        | `reflog` para recuperación                       | Siempre preservar historial/respaldos              |

### Árbol de Decisión

```
Problema Detectado
     │
     ▼
┌─────────────────┐
│ ¿Es la corrección│
│ trivial y        │
│ reversible?      │
└────────┬────────┘
         │
    Sí   │  No
    ▼    │  ▼
┌────────┴──────────┐
│                   │
▼                   ▼
Nivel 1          ┌─────────────────┐
Auto-corregir    │ ¿La corrección  │
silenciosamente  │ modifica datos/ │
                 │ código del      │
                 │ usuario?        │
                 └────────┬────────┘
                          │
                     No   │   Sí
                     ▼    │   ▼
                 ┌────────┴──────────┐
                 │                   │
                 ▼                   ▼
              Nivel 2             Nivel 3
              Solicitar           Guía
              Usuario             Manual
```

---

## Definiciones de Niveles

### Nivel 1: Auto-corrección Silenciosa

**Definición:** Operaciones seguras y reversibles que no requieren confirmación del usuario.

**Características:**

- Cero riesgo de pérdida de datos
- Completamente reversible
- Sin cambios en código/configuración del usuario
- Solo archivos del sistema/framework
- Respaldo siempre creado

**Acciones:**

| Acción                 | Descripción                                           | Respaldo     |
| ---------------------- | ----------------------------------------------------- | ------------ |
| `recreate_config`      | Recrear `.aios/config.yaml` faltante desde plantilla  | Sí           |
| `clear_cache`          | Limpiar archivos de caché obsoletos en `.aios/cache/` | Sí           |
| `create_dirs`          | Crear directorios faltantes del framework             | No (aditivo) |
| `fix_permissions`      | Corregir permisos en archivos del framework           | Sí           |
| `regenerate_lockfile`  | Regenerar integridad del lockfile de paquetes         | Sí           |
| `restart_mcp`          | Reiniciar servidores MCP que no responden             | No           |
| `reset_project_status` | Resetear archivo de estado del proyecto corrupto      | Sí           |

**Ejemplos de Problemas:**

```yaml
# Problemas de Nivel 1 - auto-corregir silenciosamente
- id: PC-001
  description: '.aios/config.yaml faltante'
  severity: CRITICAL
  tier: 1
  action: recreate_config
  message: 'Config recreado desde plantilla'

- id: LE-005
  description: 'Servidor MCP no responde'
  severity: HIGH
  tier: 1
  action: restart_mcp
  message: 'Servidor MCP reiniciado'

- id: RH-008
  description: '.gitignore incompleto'
  severity: LOW
  tier: 1
  action: append_gitignore
  message: 'Entradas faltantes agregadas a .gitignore'
```

**Notificación al Usuario:**

```
✅ Auto-corregidos 3 problemas:
   • Recreado .aios/config.yaml (respaldo: .aios/backups/config.yaml.1735564800)
   • Reiniciado servidor MCP context7
   • Agregado .aios/cache/ a .gitignore
```

---

### Nivel 2: Auto-corrección con Confirmación

**Definición:** Operaciones de riesgo moderado que requieren confirmación del usuario antes de ejecutar.

**Características:**

- Puede modificar archivos adyacentes al usuario (no código del usuario)
- Reversible con respaldo
- Podría afectar el flujo de trabajo temporalmente
- Requiere "sí" explícito del usuario

**Acciones:**

| Acción                | Descripción                               | Respaldo | Solicitud al Usuario              |
| --------------------- | ----------------------------------------- | -------- | --------------------------------- |
| `update_deps`         | Actualizar dependencias obsoletas         | Sí       | "¿Actualizar X paquetes?"         |
| `fix_symlinks`        | Reparar enlaces simbólicos rotos          | Sí       | "¿Corregir N enlaces rotos?"      |
| `regenerate_files`    | Regenerar archivos basados en plantilla   | Sí       | "¿Regenerar desde plantilla?"     |
| `fix_ide_config`      | Reparar configuración del IDE             | Sí       | "¿Reparar configuración VS Code?" |
| `migrate_config`      | Migrar config a nueva versión             | Sí       | "¿Migrar config v1→v2?"           |
| `create_missing_docs` | Crear archivos de documentación faltantes | No       | "¿Crear coding-standards.md?"     |

**Ejemplos de Problemas:**

```yaml
# Problemas de Nivel 2 - solicitar al usuario
- id: PC-003
  description: 'coding-standards.md faltante'
  severity: MEDIUM
  tier: 2
  action: create_missing_docs
  prompt: '¿Crear coding-standards.md desde plantilla?'
  options:
    - 'yes' # Crear archivo
    - 'no' # Omitir
    - 'custom' # Permitir al usuario especificar ubicación

- id: RH-006
  description: '3 paquetes obsoletos (parches de seguridad)'
  severity: MEDIUM
  tier: 2
  action: update_deps
  prompt: '¿Actualizar 3 paquetes con parches de seguridad?'
  details:
    - 'lodash: 4.17.20 → 4.17.21 (seguridad)'
    - 'axios: 0.21.0 → 0.21.4 (seguridad)'
    - 'yaml: 2.0.0 → 2.3.4 (seguridad)'
```

**Interacción con el Usuario:**

```
⚠️ Encontrados 2 problemas que requieren confirmación:

[1/2] coding-standards.md faltante
      Acción: Crear desde plantilla
      Ubicación: docs/framework/coding-standards.md

      ¿Aplicar corrección? [S]í / [N]o / [O]mitir todo: s

      ✅ Creado docs/framework/coding-standards.md

[2/2] 3 paquetes tienen actualizaciones de seguridad
      Acción: npm update lodash axios yaml
      Respaldo: package-lock.json.backup

      ¿Aplicar corrección? [S]í / [N]o / [O]mitir todo: s

      ✅ Actualizados 3 paquetes
```

---

### Nivel 3: Guía Manual

**Definición:** Problemas de alto riesgo o complejos que no pueden ser auto-corregidos de forma segura. Proporciona orientación para resolución manual.

**Características:**

- Riesgo de pérdida de datos o corrupción
- Involucra código/configuración del usuario
- Requiere juicio humano
- Operaciones sensibles a la seguridad
- Cambios incompatibles

**Acciones:**

| Acción          | Descripción                            | Orientación Proporcionada |
| --------------- | -------------------------------------- | ------------------------- |
| `manual_guide`  | Proporcionar instrucciones paso a paso | Comandos a ejecutar       |
| `external_link` | Enlace a documentación                 | URL + contexto            |
| `suggest_agent` | Sugerir agente apropiado               | "@architect revisar"      |
| `escalate`      | Marcar para revisión humana            | Abrir issue en GitHub     |

**Ejemplos de Problemas:**

```yaml
# Problemas de Nivel 3 - solo guía manual
- id: PC-002
  description: "Tarea referencia agente inexistente 'legacy-dev'"
  severity: HIGH
  tier: 3
  guide:
    title: 'Corregir Referencia de Agente Inválida'
    steps:
      - 'Abrir .aios-core/development/tasks/deploy.md'
      - 'Encontrar línea: agent: legacy-dev'
      - 'Reemplazar con: agent: devops'
      - 'Verificar con: npx aios task validate deploy'
    suggested_agent: '@architect'

- id: RH-007
  description: 'Vulnerabilidad crítica en dependencia de producción'
  severity: CRITICAL
  tier: 3
  guide:
    title: 'Vulnerabilidad de Seguridad Crítica'
    details: 'CVE-2024-XXXXX en express@4.17.0'
    steps:
      - 'Revisar detalles CVE: https://nvd.nist.gov/vuln/detail/CVE-2024-XXXXX'
      - 'Verificar si la vulnerabilidad afecta tu uso'
      - 'Si está afectado, ejecutar: npm audit fix --force'
      - 'Probar la aplicación exhaustivamente después de actualizar'
      - 'Considerar consultar @architect por cambios incompatibles'
    urgency: 'INMEDIATA'
    external_link: 'https://nvd.nist.gov/vuln/detail/CVE-2024-XXXXX'

- id: DE-004
  description: 'Certificado SSL expira en 7 días'
  severity: CRITICAL
  tier: 3
  guide:
    title: 'Advertencia de Expiración de Certificado SSL'
    steps:
      - 'Contactar a tu proveedor de SSL o equipo de TI'
      - 'Renovar certificado antes de la expiración'
      - 'Actualizar certificado en el entorno de despliegue'
    suggested_agent: '@devops'
```

**Salida de Orientación al Usuario:**

```
❌ Encontrados 2 problemas que requieren intervención manual:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[CRÍTICO] Advertencia de Expiración de Certificado SSL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tu certificado SSL expira en 7 días.

Pasos para resolver:
  1. Contactar a tu proveedor de SSL o equipo de TI
  2. Renovar certificado antes de la expiración
  3. Actualizar certificado en el entorno de despliegue

Sugerido: Activar @devops para asistencia
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ALTO] Corregir Referencia de Agente Inválida
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

La tarea 'deploy' referencia agente inexistente 'legacy-dev'.

Pasos para resolver:
  1. Abrir .aios-core/development/tasks/deploy.md
  2. Encontrar línea: agent: legacy-dev
  3. Reemplazar con: agent: devops
  4. Verificar con: npx aios task validate deploy

Sugerido: Activar @architect para revisión
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Reglas de Seguridad

### Nunca Auto-corregir (Lista de Bloqueo)

Los siguientes tipos de archivos/operaciones **NUNCA** se auto-corrigen:

```yaml
neverAutoFix:
  files:
    - '**/*.{js,ts,jsx,tsx,py,go,rs}' # Código fuente
    - '**/*.{json,yaml,yml}' # Config de usuario (fuera de .aios/)
    - '.env*' # Archivos de entorno
    - '**/secrets/**' # Secretos
    - '**/credentials*' # Credenciales
    - '.git/**' # Internos de Git
    - 'package.json' # Dependencias del usuario
    - 'tsconfig.json' # Config del usuario
    - '.eslintrc*' # Reglas de linting del usuario

  operations:
    - delete_user_files # Nunca eliminar archivos del usuario
    - modify_git_history # Nunca reescribir historial de git
    - change_remote_urls # Nunca modificar remotos
    - push_to_remote # Nunca auto-push
    - modify_ci_secrets # Nunca tocar secretos de CI
    - change_permissions_recursive # Nunca chmod -R

  conditions:
    - file_has_uncommitted_changes # No tocar archivos modificados
    - file_size_exceeds_1mb # Archivos grandes necesitan revisión
    - path_outside_project # Mantenerse en límites del proyecto
```

### Auto-corrección Segura (Lista de Permitidos)

Solo estos patrones son candidatos para auto-corrección:

```yaml
safeToAutoFix:
  paths:
    - '.aios/**' # Archivos del workspace AIOS
    - '.aios-core/**/*.yaml' # YAML del framework (con cuidado)
    - '.claude/**' # Configuración de Claude
    - '.vscode/settings.json' # Solo configuración del IDE
    - '.cursor/**' # Config del IDE Cursor
    - 'node_modules/.cache/**' # Archivos de caché

  conditions:
    - file_is_regenerable # Puede recrearse desde plantilla
    - file_has_backup # Existe respaldo
    - action_is_reversible # Puede deshacerse
    - user_initiated_check # Usuario ejecutó health-check
```

### Validación Pre-corrección

Antes de aplicar cualquier corrección:

```javascript
async function validateFix(check, action) {
  // 1. Verificar que la acción está en lista de permitidos
  if (!SAFE_ACTIONS.includes(action.type)) {
    return { allowed: false, reason: 'Acción no en lista segura' };
  }

  // 2. Verificar que la ruta del archivo es segura
  if (!isPathSafe(action.targetPath)) {
    return { allowed: false, reason: 'Ruta no en zona segura' };
  }

  // 3. Verificar que el archivo no ha sido modificado
  if (await hasUncommittedChanges(action.targetPath)) {
    return { allowed: false, reason: 'Archivo tiene cambios sin commit' };
  }

  // 4. Asegurar que se puede crear respaldo
  if (action.requiresBackup && !(await canCreateBackup(action.targetPath))) {
    return { allowed: false, reason: 'No se puede crear respaldo' };
  }

  // 5. Verificar que la acción es reversible
  if (!action.rollbackCommand) {
    return { allowed: false, reason: 'Sin procedimiento de reversión definido' };
  }

  return { allowed: true };
}
```

---

## Estrategia de Respaldo

### Ubicación de Respaldos

```
.aios/
├── backups/
│   ├── health-check-2025-12-30T10-30-00/
│   │   ├── manifest.json           # Qué se respaldó
│   │   ├── config.yaml             # Archivos respaldados
│   │   ├── settings.json
│   │   └── package-lock.json
│   ├── health-check-2025-12-29T14-20-00/
│   │   └── ...
│   └── .retention                  # Política de retención
```

### Manifiesto de Respaldo

```json
{
  "id": "health-check-2025-12-30T10-30-00",
  "created": "2025-12-30T10:30:00.000Z",
  "checkId": "HC-20251230-103000",
  "issuesFixed": 3,
  "files": [
    {
      "original": ".aios/config.yaml",
      "backup": "config.yaml",
      "action": "recreate_config",
      "checksum": "sha256:abc123...",
      "size": 2048
    }
  ],
  "rollbackCommand": "npx aios health-check --rollback health-check-2025-12-30T10-30-00"
}
```

### Política de Retención

```yaml
# .aios/backups/.retention
retention:
  maxBackups: 10 # Mantener últimos 10 respaldos
  maxAge: 7 # días
  minKeep: 3 # Siempre mantener al menos 3
  autoCleanup: true # Limpiar respaldos antiguos automáticamente
```

### Respaldo Antes de Corrección

```javascript
async function createBackup(action) {
  const backupId = `health-check-${new Date().toISOString().replace(/[:.]/g, '-')}`;
  const backupDir = path.join('.aios', 'backups', backupId);

  await fs.ensureDir(backupDir);

  const manifest = {
    id: backupId,
    created: new Date().toISOString(),
    files: [],
  };

  for (const file of action.filesToBackup) {
    const content = await fs.readFile(file);
    const checksum = crypto.createHash('sha256').update(content).digest('hex');
    const backupName = path.basename(file);

    await fs.writeFile(path.join(backupDir, backupName), content);

    manifest.files.push({
      original: file,
      backup: backupName,
      checksum: `sha256:${checksum}`,
      size: content.length,
    });
  }

  await fs.writeJson(path.join(backupDir, 'manifest.json'), manifest, { spaces: 2 });

  return { backupId, backupDir, manifest };
}
```

---

## Procedimientos de Reversión

### Reversión Automática

Si una corrección falla durante la ejecución:

```javascript
async function applyFixWithRollback(check, action) {
  const backup = await createBackup(action);

  try {
    await action.execute();
    await verifyFix(check);

    return { success: true, backup: backup.backupId };
  } catch (error) {
    console.error(`Corrección falló: ${error.message}`);
    console.log(`Revirtiendo desde respaldo: ${backup.backupId}`);

    await rollback(backup);

    return { success: false, error: error.message, rolledBack: true };
  }
}
```

### Comando de Reversión Manual

```bash
# Revertir respaldo específico
npx aios health-check --rollback health-check-2025-12-30T10-30-00

# Listar respaldos disponibles
npx aios health-check --list-backups

# Revertir último respaldo
npx aios health-check --rollback-last
```

### Proceso de Reversión

```javascript
async function rollback(backupId) {
  const backupDir = path.join('.aios', 'backups', backupId);
  const manifest = await fs.readJson(path.join(backupDir, 'manifest.json'));

  console.log(`Revirtiendo ${manifest.files.length} archivos...`);

  for (const file of manifest.files) {
    const backupPath = path.join(backupDir, file.backup);
    const content = await fs.readFile(backupPath);

    // Verificar checksum
    const checksum = crypto.createHash('sha256').update(content).digest('hex');
    if (`sha256:${checksum}` !== file.checksum) {
      throw new Error(`Respaldo corrupto: ${file.original}`);
    }

    await fs.writeFile(file.original, content);
    console.log(`  ✅ Restaurado: ${file.original}`);
  }

  console.log('Reversión completada.');
}
```

---

## Directrices de Implementación

### Estructura del Motor de Auto-reparación

```
.aios-core/core/health-check/
├── healers/
│   ├── index.js              # Registro de reparadores
│   ├── tier1/
│   │   ├── recreate-config.js
│   │   ├── clear-cache.js
│   │   ├── restart-mcp.js
│   │   └── fix-permissions.js
│   ├── tier2/
│   │   ├── update-deps.js
│   │   ├── fix-ide-config.js
│   │   └── create-docs.js
│   └── tier3/
│       ├── manual-guide-generator.js
│       └── escalation-handler.js
├── backup/
│   ├── backup-manager.js
│   ├── retention-policy.js
│   └── rollback-handler.js
└── safety/
    ├── allowlist.js
    ├── blocklist.js
    └── validator.js
```

### Interfaz del Reparador

```javascript
// Interfaz base del reparador
class BaseHealer {
  constructor(options = {}) {
    this.tier = options.tier || 1;
    this.requiresBackup = options.requiresBackup || true;
    this.requiresConfirmation = options.requiresConfirmation || false;
  }

  // Sobrescribir en subclase
  async canHeal(issue) {
    throw new Error('No implementado');
  }

  // Sobrescribir en subclase
  async heal(issue, context) {
    throw new Error('No implementado');
  }

  // Sobrescribir en subclase
  async verify(issue) {
    throw new Error('No implementado');
  }

  // Reversión común
  async rollback(backupId) {
    return await rollbackManager.rollback(backupId);
  }
}

// Ejemplo de reparador Nivel 1
class RecreateConfigHealer extends BaseHealer {
  constructor() {
    super({ tier: 1, requiresBackup: true, requiresConfirmation: false });
  }

  async canHeal(issue) {
    return issue.id === 'PC-001' && !(await fs.pathExists('.aios/config.yaml'));
  }

  async heal(issue, context) {
    const template = await fs.readFile('.aios-core/templates/config-template.yaml');
    await fs.writeFile('.aios/config.yaml', template);
    return { success: true, message: 'Config recreado desde plantilla' };
  }

  async verify(issue) {
    return await fs.pathExists('.aios/config.yaml');
  }
}
```

### Registro de Todas las Acciones de Reparación

```javascript
// .aios/logs/self-healing.log
const healingLog = {
  append: async (entry) => {
    const logPath = '.aios/logs/self-healing.log';
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...entry,
    };
    await fs.appendFile(logPath, JSON.stringify(logEntry) + '\n');
  },
};

// Uso
await healingLog.append({
  action: 'recreate_config',
  tier: 1,
  issue: 'PC-001',
  backup: 'health-check-2025-12-30T10-30-00',
  result: 'success',
  duration: '45ms',
});
```

---

## Documentos Relacionados

- [ADR: Arquitectura HCS](./adr/adr-hcs-health-check-system.md)
- [Modos de Ejecución HCS](./hcs-execution-modes.md)
- [Especificaciones de Verificaciones HCS](./hcs-check-specifications.md)

---

_Documento creado como parte de la Historia HCS-1 Investigación_
