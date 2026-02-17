<!--
  Traducción: ES
  Original: /docs/en/guides/template-engine-v2.md
  Última sincronización: 2026-01-26
-->

# Motor de Plantillas v2.0

> 🌐 [EN](../../guides/template-engine-v2.md) | [PT](../../pt/guides/template-engine-v2.md) | **ES**

---

> Motor de generación de documentos y sustitución de variables para Synkra AIOS.

**Versión:** 2.0
**Última Actualización:** 2025-12-05

---

## Descripción General

El Motor de Plantillas proporciona una forma consistente de generar documentos (PRDs, ADRs, Stories, etc.) con sustitución de variables, condicionales y bucles. Potencia todas las tareas de generación de documentos en AIOS.

### Características Principales

| Característica | Sintaxis                                | Descripción                               |
| -------------- | --------------------------------------- | ----------------------------------------- |
| Variables      | `{{VAR_NAME}}`                          | Sustitución simple de variables           |
| Condicionales  | `{{#IF_CONDITION}}...{{/IF_CONDITION}}` | Bloques condicionales                     |
| Bucles         | `{{#EACH_ITEMS}}...{{/EACH_ITEMS}}`     | Iterar sobre arrays                       |
| Rutas Anidadas | `{{user.name}}`                         | Acceder a propiedades de objetos anidados |
| Escape         | `\{{literal}}`                          | Prevenir el procesamiento de plantilla    |

---

## Inicio Rápido

### Uso Básico

```javascript
const TemplateEngine = require('./.aios-core/infrastructure/scripts/template-engine');

const engine = new TemplateEngine();

const template = `
# {{TITLE}}

Created by: {{AUTHOR}}
Date: {{DATE}}

## Summary
{{SUMMARY}}
`;

const variables = {
  TITLE: 'My Document',
  AUTHOR: 'Dex (@dev)',
  DATE: '2025-12-05',
  SUMMARY: 'This is a generated document.',
};

const output = engine.process(template, variables);
console.log(output);
```

### Salida

```markdown
# My Document

Created by: Dex (@dev)
Date: 2025-12-05

## Summary

This is a generated document.
```

---

## Referencia de API

### Clase TemplateEngine

```javascript
const TemplateEngine = require('./.aios-core/infrastructure/scripts/template-engine');
const engine = new TemplateEngine();
```

### Métodos

#### `process(template, variables)`

Procesa una cadena de plantilla con las variables proporcionadas.

**Parámetros:**

- `template` (string) - Cadena de plantilla con marcadores de posición
- `variables` (Object) - Pares clave-valor para sustitución

**Retorna:** `string` - Plantilla procesada

```javascript
const result = engine.process('Hello, {{NAME}}!', { NAME: 'World' });
// Retorna: "Hello, World!"
```

#### `loadAndProcess(templatePath, variables)`

Carga un archivo de plantilla y lo procesa.

**Parámetros:**

- `templatePath` (string) - Ruta al archivo de plantilla
- `variables` (Object) - Variables a sustituir

**Retorna:** `Promise<string>` - Plantilla procesada

```javascript
const result = await engine.loadAndProcess('.aios-core/product/templates/story-tmpl.md', {
  STORY_ID: '3.12',
  TITLE: 'Documentation',
});
```

#### `validateTemplate(template, requiredVars)`

Valida que una plantilla tenga todos los marcadores de posición requeridos.

**Parámetros:**

- `template` (string) - Plantilla a validar
- `requiredVars` (string[]) - Lista de nombres de variables requeridas

**Retorna:** `Object` - `{ valid: boolean, missing: string[], found: string[] }`

```javascript
const validation = engine.validateTemplate(template, ['TITLE', 'DATE']);
if (!validation.valid) {
  console.error('Missing variables:', validation.missing);
}
```

#### `getTemplateVariables(template)`

Extrae todas las variables usadas en una plantilla.

**Parámetros:**

- `template` (string) - Plantilla a analizar

**Retorna:** `Object` - `{ simple: string[], conditionals: string[], loops: string[] }`

```javascript
const vars = engine.getTemplateVariables(template);
console.log('Variables needed:', vars.simple);
console.log('Conditionals:', vars.conditionals);
console.log('Loop variables:', vars.loops);
```

#### `escapeInput(input)`

Escapa caracteres especiales en la entrada del usuario para prevenir inyección.

**Parámetros:**

- `input` (string) - Entrada del usuario a escapar

**Retorna:** `string` - Entrada escapada

```javascript
const safeInput = engine.escapeInput(userProvidedValue);
```

---

## Sintaxis de Plantillas

### Variables Simples

```markdown
# {{TITLE}}

Author: {{AUTHOR}}
Version: {{VERSION}}
```

### Variables Anidadas

Accede a propiedades de objetos anidados con notación de punto:

```markdown
Project: {{project.name}}
Owner: {{project.owner.name}}
Email: {{project.owner.email}}
```

```javascript
const variables = {
  project: {
    name: 'AIOS',
    owner: {
      name: 'Pedro',
      email: 'pedro@example.com',
    },
  },
};
```

### Condicionales

Incluye contenido solo si una variable es verdadera (truthy):

```markdown
{{#IF_HAS_DEPENDENCIES}}

## Dependencies

This project depends on:
{{DEPENDENCIES}}
{{/IF_HAS_DEPENDENCIES}}
```

```javascript
const variables = {
  HAS_DEPENDENCIES: true,
  DEPENDENCIES: '- react\n- typescript',
};
```

### Bucles

Iterar sobre arrays:

```markdown
## Tasks

{{#EACH_TASKS}}

- [ ] {{ITEM.title}} ({{ITEM.priority}})
      {{/EACH_TASKS}}
```

```javascript
const variables = {
  TASKS: [
    { title: 'Write docs', priority: 'HIGH' },
    { title: 'Add tests', priority: 'MEDIUM' },
    { title: 'Review code', priority: 'LOW' },
  ],
};
```

**Variables de Contexto de Bucle:**

- `{{ITEM}}` - Elemento actual
- `{{INDEX}}` - Índice actual (basado en 0)
- `{{FIRST}}` - Booleano, verdadero si es el primer elemento
- `{{LAST}}` - Booleano, verdadero si es el último elemento

### Escape

Prevenir el procesamiento de plantilla con barra invertida:

```markdown
To use variables, write \{{VARIABLE_NAME}}.
```

Salida: `To use variables, write {{VARIABLE_NAME}}.`

---

## Plantillas Soportadas

### Plantillas de Documentos

| Plantilla | Ubicación                   | Propósito                                 |
| --------- | --------------------------- | ----------------------------------------- |
| **PRD**   | `templates/prd-tmpl.md`     | Documento de Requisitos de Producto       |
| **ADR**   | `templates/adr-tmpl.md`     | Registro de Decisión de Arquitectura      |
| **PMDR**  | `templates/pmdr-tmpl.md`    | Registro de Decisión de Mapeo de Procesos |
| **DBDR**  | `templates/dbdr-tmpl.md`    | Registro de Diseño de Base de Datos       |
| **Story** | `templates/story-tmpl.yaml` | Historia de Usuario                       |
| **Epic**  | `templates/epic-tmpl.md`    | Definición de Épica                       |
| **Task**  | `templates/task-tmpl.md`    | Definición de Tarea                       |

### Ubicación de Plantillas

Todas las plantillas están almacenadas en:

```
.aios-core/product/templates/
```

---

## Creación de Plantillas Personalizadas

### Paso 1: Crear Archivo de Plantilla

```markdown
# {{COMPONENT_NAME}}

**Type:** {{COMPONENT_TYPE}}
**Created:** {{DATE}}
**Author:** {{AUTHOR}}

## Description

{{DESCRIPTION}}

{{#IF_HAS_PROPS}}

## Properties

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |

{{#EACH_PROPS}}
| {{ITEM.name}} | {{ITEM.type}} | {{ITEM.default}} | {{ITEM.description}} |
{{/EACH_PROPS}}
{{/IF_HAS_PROPS}}

{{#IF_HAS_EXAMPLES}}

## Examples

{{EXAMPLES}}
{{/IF_HAS_EXAMPLES}}
```

### Paso 2: Definir Esquema de Plantilla

Crear un archivo de esquema (opcional pero recomendado):

```yaml
# my-template.schema.yaml
name: component-template
version: '1.0'
description: Template for component documentation

variables:
  required:
    - COMPONENT_NAME
    - COMPONENT_TYPE
    - DATE
    - AUTHOR
    - DESCRIPTION
  optional:
    - HAS_PROPS
    - PROPS
    - HAS_EXAMPLES
    - EXAMPLES

validation:
  COMPONENT_TYPE:
    enum: [React, Vue, Angular, Vanilla]
  DATE:
    format: date
```

### Paso 3: Usar en Tarea

```javascript
const engine = new TemplateEngine();

// Load template
const template = await fs.readFile('templates/component-tmpl.md', 'utf8');

// Validate required variables
const validation = engine.validateTemplate(template, ['COMPONENT_NAME', 'DATE']);
if (!validation.valid) {
  throw new Error(`Missing variables: ${validation.missing.join(', ')}`);
}

// Process
const output = engine.process(template, {
  COMPONENT_NAME: 'Button',
  COMPONENT_TYPE: 'React',
  DATE: new Date().toISOString().split('T')[0],
  AUTHOR: 'Dex',
  DESCRIPTION: 'A reusable button component',
  HAS_PROPS: true,
  PROPS: [
    { name: 'variant', type: 'string', default: 'primary', description: 'Button style' },
    { name: 'size', type: 'string', default: 'medium', description: 'Button size' },
  ],
  HAS_EXAMPLES: false,
});
```

---

## Mejores Prácticas

### 1. Usar Nombres de Variables Significativos

```markdown
<!-- Bueno -->

{{STORY_TITLE}}
{{ACCEPTANCE_CRITERIA}}
{{AUTHOR_NAME}}

<!-- Malo -->

{{T}}
{{AC}}
{{N}}
```

### 2. Proporcionar Valores Predeterminados Sensatos

```javascript
const variables = {
  TITLE: title || 'Untitled',
  DATE: date || new Date().toISOString().split('T')[0],
  VERSION: version || '1.0',
};
```

### 3. Validar Antes de Procesar

```javascript
const validation = engine.validateTemplate(template, requiredVars);
if (!validation.valid) {
  console.error('Missing:', validation.missing);
  return; // Don't process invalid templates
}
```

### 4. Escapar Entrada del Usuario

```javascript
// Always escape user-provided content
const safeInput = engine.escapeInput(userInput);
const output = engine.process(template, { USER_CONTENT: safeInput });
```

### 5. Usar Condicionales para Secciones Opcionales

```markdown
{{#IF_HAS_NOTES}}

## Notes

{{NOTES}}
{{/IF_HAS_NOTES}}
```

---

## Solución de Problemas

### Problemas Comunes

| Problema                   | Solución                                                                 |
| -------------------------- | ------------------------------------------------------------------------ |
| Variable no reemplazada    | Verificar que la ortografía coincida exactamente (sensible a mayúsculas) |
| Bucle produce salida vacía | Asegurar que la variable sea un array, no undefined                      |
| Condicional siempre falso  | Verificar que la variable sea verdadera (no cadena vacía/0/null)         |
| Inyección de plantilla     | Usar `escapeInput()` para valores proporcionados por el usuario          |

### Modo de Depuración

```javascript
// Get all variables in template
const vars = engine.getTemplateVariables(template);
console.log('Expected variables:', vars);

// Validate against your data
const validation = engine.validateTemplate(template, Object.keys(yourVariables));
console.log('Validation result:', validation);
```

---

## Documentación Relacionada

- [Guía de Quality Gates](./quality-gates.md)

---

_Synkra AIOS Motor de Plantillas v2.0_
