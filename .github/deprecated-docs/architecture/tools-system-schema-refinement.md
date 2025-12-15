# 🔄 Tools System - Schema Refinement & Universal Framework

**Status:** 🔬 In Analysis
**Created:** 2025-10-08
**Type:** Architecture Refinement
**Purpose:** Design universal, extensible tool schema based on real complexity analysis

---

## Executive Summary

After deep analysis of ClickUp MCP complexity (996 lines of executable code as knowledge base), we discovered that the proposed Tools System architecture needs refinement to handle **executable knowledge** rather than just text documentation.

**Key Discovery:** Knowledge base for complex tools is **code** (helpers, processors, validators), not just **documentation**.

This document:
1. ✅ Validates existing architectural decisions against discovered gaps
2. 🔧 Proposes schema refinements to handle executable knowledge
3. 🎯 Designs universal tool schema framework that works for ALL tool types
4. 📋 Provides migration path from current to refined architecture

---

## 1. Gap Analysis vs Current Architecture

### Gap 1: Knowledge Base é Código Executável

**Descoberta (Gap Analysis):**
```yaml
# Atual (Proposto - Brownfield):
knowledge_base:
  source: supabase_hybrid_search
  collection: tools_knowledge
  topics: [clickup_custom_fields, clickup_task_workflows]

# Realidade (Descoberta):
# 996 LINHAS DE CÓDIGO JAVASCRIPT
helpers:
  - id: detect-webhook-type
    language: javascript
    function: |
      const detectWebhookType = () => {
        if ($json.event === 'automation_webhook') return 'automation';
        if ($json.id && $json.trigger_id) return 'legacy';
        return 'standard';
      };
```

**Validação da Arquitetura Atual:**

| Aspecto | Brownfield Atual | Gap Descoberto | Compatível? |
|---------|------------------|----------------|-------------|
| **Knowledge Strategy** | `embedded` ou `external` (texto) | Código executável (JS functions) | ⚠️ Parcial |
| **Embedded Knowledge** | `knowledge: [{topic, content}]` | `helpers: [{id, language, function}]` | ❌ Não |
| **External Knowledge** | Supabase text chunks + embeddings | Funções reutilizáveis + validadores | ❌ Não |
| **Context Injection** | Load knowledge text to LLM context | Execute helpers + inject results | ❌ Não |

**Conclusão:** Arquitetura atual **não contempla** código executável como knowledge. Apenas documentação textual.

**Ação Necessária:** Estender schema para incluir:
- `helpers:` seção para funções reutilizáveis
- `processors:` seção para data transformation pipelines
- `validators:` seção para pre-execution validation

---

### Gap 2: Tool Schema Missing Sections

**Descoberta (Gap Analysis):**
```yaml
# Schema Necessário (Descoberto):
tool:
  helpers:           # 🆕 Funções JavaScript reutilizáveis
  processors:        # 🆕 Data transformation pipelines
  validators:        # 🆕 Pre-execution validation
  field_mappings:    # 🆕 Custom field type definitions
  payload_schemas:   # 🆕 Webhook format definitions
  anti_patterns:     # 🆕 Common mistakes
```

**Validação da Arquitetura Atual:**

**Brownfield Tool Schema (Seção 4.2):**
```yaml
tool:
  id: clickup
  type: mcp
  name: ClickUp MCP Server
  version: 1.0.0
  description: |
    Complete task management via ClickUp API
  knowledge_strategy: external  # embedded | external | none
  knowledge: [...]              # Embedded text
  knowledge_base:               # External Supabase search
    source: supabase_hybrid_search
    collection: tools_knowledge
    topics: [clickup_custom_fields]
  health_check: {...}
  commands: [...]
  dependencies: {...}
  setup: {...}
  tags: [...]
  changelog: [...]
```

**Seções Faltando:**
- ❌ `helpers` - Funções reutilizáveis (detectWebhookType, extractCustomField)
- ❌ `processors` - Pipelines de transformação (processCustomField, normalizeTaskName)
- ❌ `validators` - Validação pré-execução (validateCreateTask, checkRequiredFields)
- ❌ `field_mappings` - Definições de tipos de campos personalizados (location, rollup, time_tracking)
- ❌ `payload_schemas` - Formatos de webhook (standard, automation, legacy)
- ❌ `anti_patterns` - Erros comuns (assignee format mismatch, multi-API calls)

**Conclusão:** Schema atual tem ~40% do necessário para tools complexas. Faltam seções críticas.

---

### Gap 3: Context Injection Strategy Undefined

**Descoberta (Gap Analysis):**
> Arquitetura não define **como** agentes devem receber conhecimento executável em contexto.

**Validação da Arquitetura Atual:**

**Brownfield - Seção 5.2 (KnowledgeAccessor):**
```javascript
class KnowledgeAccessor {
  async search(query, options = {}) {
    // Generates embedding for query (via EmbeddingProvider)
    // Calls Supabase hybrid_search() function
    // Returns: Array<SearchResult>
  }
}

// SearchResult:
interface SearchResult {
  id: string;
  topic: string;
  content: string;  // ⚠️ APENAS TEXTO
  score: number;
  metadata: object;
}
```

**Problema:** KnowledgeAccessor retorna apenas `content: string` (texto). Não tem mecanismo para:
1. Executar helpers e retornar resultados
2. Validar argumentos antes de MCP call
3. Aplicar processors em payloads
4. Injetar field_mappings em contexto

**Conclusão:** Context injection está **50% implementado**. Funciona para texto, falha para código.

**Ação Necessária:**
- Estender KnowledgeAccessor para suportar `ExecutableKnowledge`
- Criar `ToolHelperExecutor` para executar helpers em sandbox
- Criar `ToolValidationHelper` para validação pré-execução

---

### Gap 4: No Validation Helper System

**Descoberta (Gap Analysis):**
> Agentes precisam validar argumentos ANTES de chamar MCP, mas arquitetura não fornece mecanismo.

**Validação da Arquitetura Atual:**

**Brownfield - Seção 5.2 (ToolHealthChecker):**
```javascript
class ToolHealthChecker {
  async check(toolDef) {
    // Valida DISPONIBILIDADE da tool (health check)
    // ❌ NÃO valida ARGUMENTOS de comandos
  }
}
```

**Problema:** HealthChecker valida se tool está disponível, mas NÃO valida:
- Se argumentos obrigatórios foram fornecidos (`listId` ausente)
- Se formato de assignees está correto (create vs update API)
- Se custom fields existem na workspace
- Se valores respeitam constraints (priority 1-4)

**Exemplo Real (ClickUp):**
```javascript
// Agente tenta criar task sem validação:
await mcp__clickup__create_task({
  listId: "123",
  name: "Test",
  assignees: [123, 456]  // ❌ FORMATO ERRADO (create API usa array simples)
});

// Deveria ter validador:
validators:
  - id: validate-create-task
    validates: create-task
    checks:
      - required_fields: [listId, name]
      - assignee_format: create_api  # Array de IDs, não objeto {add, rem}
      - custom_fields: validate_existence
```

**Conclusão:** Validation helper system **não existe** na arquitetura atual.

---

### Gap 5: Examples Structure Insufficient

**Descoberta (Gap Analysis):**
> Arquitetura propõe examples simples (success only). Realidade requer success/failure/edge cases.

**Validação da Arquitetura Atual:**

**Brownfield - Seção 4.2 (Tool Schema - Commands):**
```yaml
commands:
  - name: create_task
    mcp_tool: mcp__clickup__create_task
    description: Create new task in list
    required_args: [listId, name]
    optional_args: [description, assignees, priority, dueDate]
    example: |  # ⚠️ APENAS SUCCESS CASE
      {
        "listId": "123456789",
        "name": "Implement feature X",
        "description": "User story details...",
        "priority": 2
      }
```

**Problema:** Example mostra apenas caso de sucesso. Falta:
- ❌ **Failure cases:** O que acontece se listId inválido?
- ❌ **Edge cases:** Como lidar com assignees em create vs update?
- ❌ **Anti-patterns:** Quais erros são comuns?
- ❌ **Workarounds:** Como contornar limitações da API?

**Estrutura Necessária (Descoberta):**
```yaml
examples:
  - scenario: success
    description: "Create task with all fields"
    input: {...}
    output: {taskId: "abc123", status: "created"}

  - scenario: failure
    description: "Invalid listId"
    input: {listId: "invalid"}
    error: {code: "LIST_NOT_FOUND", message: "..."}

  - scenario: edge_case
    description: "Assignees format differs between create and update"
    create: {assignees: [123, 456]}  # Array simples
    update: {assignees: {add: [789], rem: [123]}}  # Objeto

  - scenario: anti_pattern
    wrong: {assignees: {add: [123]}}  # ❌ Formato update em create
    correct: {assignees: [123]}       # ✅ Formato correto
```

**Conclusão:** Examples structure **insuficiente**. Precisa incluir failure/edge/anti-pattern cases.

---

### Gap 6: API Complexity Not Documented

**Descoberta (Gap Analysis):**
> ClickUp API tem complexidades ocultas (3 webhook formats, 15+ field types, assignee format inconsistency).

**Validação da Arquitetura Atual:**

**Brownfield - Seção 4.2 (Tool Schema):**
```yaml
tool:
  description: |
    Complete task management via ClickUp API. Supports:
    - Task CRUD operations
    - Custom fields management
    - Workspace/space/folder/list hierarchy
    - Time tracking and comments
  # ❌ NÃO documenta complexidades:
  #   - 3 webhook payload formats
  #   - 15+ custom field types
  #   - Assignee format inconsistency
  #   - Multi-API call limitation
```

**Seções Necessárias (Descobertas):**
1. **`api_quirks:`** - Comportamentos não-intuitivos da API
2. **`payload_schemas:`** - Formatos de payload (webhook types, field structures)
3. **`field_mappings:`** - Mapeamento de tipos de campos personalizados
4. **`known_limitations:`** - Limitações conhecidas (rate limits, batch limits)

**Conclusão:** API complexity **não documentada** na arquitetura atual.

---

## 2. Schema Universal Framework - Proposta Refinada

### 2.1 Design Principles

**P1: Universal Core + Type-Specific Extensions**
- Core metadata works for ALL tool types (MCP, CLI, Local, Meta)
- Each type can extend with specific sections
- Backward compatible: optional sections

**P2: Executable Knowledge Support**
- Code (helpers, validators, processors) é first-class citizen
- Text documentation continua suportado (embedded/external)
- Hybrid: código + docs em mesma tool definition

**P3: Progressive Enhancement**
- Simple tools: apenas core metadata + commands
- Complex tools: add helpers, validators, field_mappings, etc.
- Meta-tools: add orchestration, dependencies, composition

**P4: Type Safety via Examples**
- Examples incluem success/failure/edge/anti-pattern
- Validation rules explicitly documented
- Field mappings com type definitions

### 2.2 Universal Tool Schema v2.0

```yaml
# aios-core/tools/{type}/{tool-id}.yaml
tool:
  # ==========================================
  # CORE METADATA (UNIVERSAL - ALL TOOL TYPES)
  # ==========================================
  schema_version: 2.0              # 🆕 Explicit versioning
  id: clickup                      # Unique identifier (kebab-case)
  type: mcp                        # mcp | cli | local | meta
  name: ClickUp MCP Server         # Human-readable name
  version: 1.0.0                   # Semantic version
  description: |
    Complete task management via ClickUp API
  tags: [task-management, mcp, project-management]

  # ==========================================
  # KNOWLEDGE STRATEGY (UNIVERSAL)
  # ==========================================
  knowledge_strategy: hybrid       # 🆕 embedded | external | hybrid | executable | none

  # OPTION 1: Embedded Text Knowledge (simple tools)
  knowledge:
    - topic: basic-usage
      content: |
        Create task: mcp__clickup__create_task
        Update task: mcp__clickup__update_task

  # OPTION 2: External Text Knowledge (complex docs)
  knowledge_base:
    source: supabase_hybrid_search
    collection: tools_knowledge
    topics: [clickup_custom_fields, clickup_api_auth]
    search_config:
      semantic_weight: 0.5
      fts_weight: 0.5

  # OPTION 3: Executable Knowledge (🆕 - complex tools)
  executable_knowledge:
    # JavaScript helpers (reutilizáveis)
    helpers:
      - id: detect-webhook-type
        language: javascript
        description: "Detect ClickUp webhook payload format"
        dependencies: []
        runtime: node_vm2  # Sandbox: node_vm2 | isolated_vm | none
        function: |
          function detectWebhookType($json) {
            if ($json.event === 'automation_webhook') return 'automation';
            if ($json.id && $json.trigger_id) return 'legacy';
            return 'standard';
          }
          module.exports = { detectWebhookType };

      - id: extract-custom-field
        language: javascript
        description: "Extract and normalize custom field value by type"
        dependencies: []
        function: |
          function extractCustomField(fieldId, fieldType, inputData) {
            const field = (inputData.custom_fields || []).find(f => f.id === fieldId);
            if (!field) return null;

            switch (fieldType) {
              case 'location':
                return field.value ? {
                  lat: field.value.location?.lat,
                  lng: field.value.location?.lng,
                  address: field.value.formatted_address
                } : null;

              case 'rollup':
                return field.value?.computations || [];

              // ... 15+ types
              default:
                return field.value;
            }
          }
          module.exports = { extractCustomField };

    # Data transformation processors
    processors:
      - id: normalize-task-name
        language: javascript
        description: "Convert task name to snake_case, remove accents"
        function: |
          function normalizeTaskName(name) {
            return name
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")  // Remove accents
              .replace(/[^a-z0-9]+/g, '_')     // Replace special chars
              .replace(/^_+|_+$/g, '');        // Trim underscores
          }
          module.exports = { normalizeTaskName };

    # Pre-execution validators
    validators:
      - id: validate-create-task
        validates: create_task                # Command name
        language: javascript
        checks:
          - required_fields: [listId, name]
          - assignee_format: create_api
        function: |
          function validateCreateTask(args) {
            const errors = [];

            // Check required fields
            if (!args.listId) errors.push({
              field: 'listId',
              message: 'listId is required'
            });
            if (!args.name) errors.push({
              field: 'name',
              message: 'name is required'
            });

            // Check assignee format (create API uses array)
            if (args.assignees && !Array.isArray(args.assignees)) {
              errors.push({
                field: 'assignees',
                message: 'create_task expects array of IDs, not object. Use [123, 456], not {add: [123]}'
              });
            }

            return { valid: errors.length === 0, errors };
          }
          module.exports = { validateCreateTask };

  # ==========================================
  # API COMPLEXITY DOCUMENTATION (🆕)
  # ==========================================
  api_complexity:
    # Webhook payload formats
    payload_schemas:
      webhook_types:
        - type: standard
          detection: "Default format, has 'event' field"
          payload_path: "body.payload || payload"

        - type: automation
          detection: "event === 'automation_webhook' OR has 'auto_id'"
          payload_path: "payload || body.payload.payload"

        - type: legacy
          detection: "has 'id' AND 'trigger_id', no 'event'"
          payload_path: "payload || body.payload"

    # Custom field type mappings
    field_mappings:
      custom_fields:
        location:
          structure:
            location: {lat: number, lng: number}
            formatted_address: string
          extraction: helpers.extract-custom-field
          validation: "Lat/lng must be valid coordinates"

        rollup:
          structure:
            computations: array
          extraction: helpers.extract-custom-field

        time_tracking:
          structure:
            total_time: number
            intervals: array<{start, end, duration}>
          extraction: helpers.extract-custom-field

        # ... 15+ types

    # Known quirks and inconsistencies
    api_quirks:
      - quirk: assignee_format_mismatch
        description: "Create and Update APIs expect different assignee formats"
        create_format: |
          {"assignees": [123, 456]}  // Array of user IDs
        update_format: |
          {"assignees": {"add": [789], "rem": [123]}}  // Object with add/rem
        mitigation: "Use validators.validate-create-task and validate-update-task"

      - quirk: multi_api_call_limitation
        description: "Cannot batch update custom fields - requires 10 calls for 10 fields"
        impact: "Performance degradation for tasks with many custom fields"
        mitigation: "Use processors to batch prepare, then sequential execution"

    # Known limitations
    known_limitations:
      - limitation: no_batch_custom_fields
        description: "API doesn't support batch custom field updates"
        workaround: "Sequential API calls with rate limit handling"

      - limitation: custom_task_id_detection
        description: "Must detect custom vs regular task ID format"
        workaround: "Use helpers.detect-task-id-format before API calls"

  # ==========================================
  # ANTI-PATTERNS & COMMON MISTAKES (🆕)
  # ==========================================
  anti_patterns:
    - pattern: wrong_assignee_format_in_create
      description: "Using update API format in create_task"
      wrong: |
        create_task({
          listId: "123",
          assignees: {add: [456]}  // ❌ Update format
        })
      correct: |
        create_task({
          listId: "123",
          assignees: [456]  // ✅ Create format (array)
        })
      error: "API returns 400: Invalid assignees format"

    - pattern: forgetting_custom_field_validation
      description: "Setting custom field without checking if it exists in workspace"
      wrong: |
        create_task({
          custom_fields: [{id: "unknown-field-id", value: 10}]
        })
      correct: |
        // 1. Get workspace custom fields
        // 2. Validate field exists
        // 3. Then create task
      error: "API silently ignores invalid custom field IDs"

  # ==========================================
  # ENHANCED EXAMPLES (🆕)
  # ==========================================
  examples:
    create_task:
      - scenario: success
        description: "Create task with all fields successfully"
        input:
          listId: "123456789"
          name: "Implement feature X"
          description: "User story details"
          assignees: [183, 456]
          priority: 2
        output:
          taskId: "abc123"
          status: "created"
          url: "https://app.clickup.com/t/abc123"

      - scenario: failure_invalid_list
        description: "Create task with invalid listId"
        input:
          listId: "invalid"
          name: "Test task"
        error:
          code: "LIST_NOT_FOUND"
          message: "List with id 'invalid' not found"
          http_status: 404

      - scenario: edge_case_assignee_format
        description: "Assignee format differs between create and update"
        create_call:
          assignees: [123, 456]  # Array for create
        update_call:
          assignees: {add: [789], rem: [123]}  # Object for update
        note: "Use validators to enforce correct format"

      - scenario: success_with_custom_fields
        description: "Create task with custom fields (location type)"
        input:
          listId: "123456789"
          name: "Site visit"
          custom_fields:
            - id: "location-field-id"
              value:
                location: {lat: 37.7749, lng: -122.4194}
                formatted_address: "San Francisco, CA"
        output:
          taskId: "def456"
          custom_fields_set: ["location-field-id"]

  # ==========================================
  # HEALTH CHECK (UNIVERSAL)
  # ==========================================
  health_check:
    enabled: true
    method: tool_call
    tool_call:
      name: mcp__clickup__get_workspace_hierarchy
      timeout_ms: 5000
    on_failure:
      action: warn
      message: "ClickUp MCP not available. Check CLICKUP_API_TOKEN."

  # ==========================================
  # COMMANDS (UNIVERSAL)
  # ==========================================
  commands:
    - name: create_task
      mcp_tool: mcp__clickup__create_task
      description: Create new task in list
      required_args: [listId, name]
      optional_args: [description, assignees, priority, dueDate, custom_fields]
      validation: validators.validate-create-task  # 🆕 Pre-execution validation
      example_ref: examples.create_task            # 🆕 Reference to examples section

  # ==========================================
  # DEPENDENCIES (UNIVERSAL)
  # ==========================================
  dependencies:
    mcp_server: clickup
    env_vars: [CLICKUP_API_TOKEN]
    other_tools: []

  # ==========================================
  # SETUP & DOCUMENTATION (UNIVERSAL)
  # ==========================================
  setup:
    instructions: |
      1. Generate API token: https://app.clickup.com/settings/apps
      2. Set environment: export CLICKUP_API_TOKEN=<token>
      3. Verify: Use get_workspace_hierarchy
    verification:
      - Check CLICKUP_API_TOKEN is set
      - MCP server responds to get_workspace_hierarchy

  author: AIOS-FULLSTACK Team
  documentation: https://clickup.com/api
  source: https://github.com/modelcontextprotocol/servers/tree/main/src/clickup

  changelog:
    - version: 2.0.0
      date: 2025-10-08
      changes:
        - "🆕 Added executable_knowledge (helpers, processors, validators)"
        - "🆕 Added api_complexity documentation"
        - "🆕 Added anti_patterns section"
        - "🆕 Enhanced examples with failure/edge cases"
    - version: 1.0.0
      date: 2025-10-07
      changes:
        - Initial tool definition
```

---

## 3. Type-Specific Extensions

### 3.1 MCP Tools (Complex APIs)

**Additional Sections for MCP Type:**
```yaml
tool:
  type: mcp

  # MCP-specific
  mcp_config:
    server_name: clickup
    transport: stdio | sse
    connection_timeout_ms: 10000

  # API complexity (já incluído acima)
  api_complexity: {...}

  # Executable knowledge (já incluído acima)
  executable_knowledge: {...}
```

### 3.2 CLI Tools (Local Executables)

**Additional Sections for CLI Type:**
```yaml
tool:
  type: cli

  # CLI-specific
  cli_config:
    executable: gh
    version_command: gh --version
    expected_version: ">=2.0.0"

  # Commands map to CLI args
  commands:
    - name: create_pr
      cli_args: ["pr", "create", "--title", "{{title}}", "--body", "{{body}}"]
      required_args: [title, body]
```

### 3.3 Local Software (FFmpeg, etc.)

**Additional Sections for Local Type:**
```yaml
tool:
  type: local

  # Local software config
  local_config:
    executable: ffmpeg
    install_instructions: |
      # Ubuntu/Debian
      sudo apt install ffmpeg

      # macOS
      brew install ffmpeg

      # Windows
      choco install ffmpeg

  # Commands map to software operations
  commands:
    - name: convert_video
      exec_template: "ffmpeg -i {{input}} -c:v {{codec}} {{output}}"
      required_args: [input, codec, output]
```

### 3.4 Meta-Tools (Orchestration)

**Additional Sections for Meta Type:**
```yaml
tool:
  type: meta

  # Meta-tool config (composes other tools)
  meta_config:
    orchestrates: [clickup, github-cli, supabase]
    workflow:
      - step: validate
        tool: clickup
        command: get_task
      - step: update
        tool: github-cli
        command: create_pr
      - step: log
        tool: supabase
        command: insert_row
```

---

## 4. Migration Path: v1.0 → v2.0

### 4.1 Backward Compatibility Strategy

**v1.0 Tools (Simple - No Changes):**
```yaml
# aios-core/tools/mcp/exa.yaml (v1.0 - unchanged)
tool:
  # schema_version: 1.0  # Implicit if missing
  id: exa
  type: mcp
  knowledge_strategy: embedded
  knowledge:
    - topic: usage
      content: "Use mcp__exa__web_search_exa for web search"
  commands: [...]
```

**v2.0 Tools (Complex - Opt-In):**
```yaml
# aios-core/tools/mcp/clickup.yaml (v2.0 - explicit)
tool:
  schema_version: 2.0  # 🆕 Explicit
  id: clickup
  type: mcp
  knowledge_strategy: hybrid
  knowledge: [...]               # Still supported
  executable_knowledge: {...}    # 🆕 Added
  api_complexity: {...}          # 🆕 Added
  anti_patterns: [...]           # 🆕 Added
  examples: [...]                # 🆕 Enhanced
```

**Auto-Detection:**
```javascript
function detectToolSchemaVersion(toolDef) {
  if (toolDef.schema_version) return toolDef.schema_version;

  // Auto-detect v2.0 features
  if (toolDef.executable_knowledge ||
      toolDef.api_complexity ||
      toolDef.anti_patterns ||
      toolDef.examples?.some(ex => ex.scenario)) {
    return 2.0;
  }

  return 1.0;  // Default
}
```

### 4.2 Component Extensions

**ToolResolver Enhancement:**
```javascript
class ToolResolver {
  async resolveTool(toolName, context = {}) {
    const toolDef = await this.loadToolYAML(toolName);
    const version = this.detectSchemaVersion(toolDef);

    if (version >= 2.0) {
      // Load executable knowledge components
      toolDef._helperExecutor = this.createHelperExecutor(toolDef);
      toolDef._validationHelper = this.createValidationHelper(toolDef);
      toolDef._processorEngine = this.createProcessorEngine(toolDef);
    }

    // ... existing logic
  }

  createHelperExecutor(toolDef) {
    return new ToolHelperExecutor(
      toolDef.executable_knowledge?.helpers || []
    );
  }

  createValidationHelper(toolDef) {
    return new ToolValidationHelper(
      toolDef.executable_knowledge?.validators || []
    );
  }
}
```

**NEW: ToolHelperExecutor**
```javascript
// tools/tool-helper-executor.js (NEW)
const { NodeVM } = require('vm2');  // Sandbox for security

class ToolHelperExecutor {
  constructor(helpers) {
    this.helpers = new Map();
    helpers.forEach(h => this.helpers.set(h.id, h));
  }

  async execute(helperId, args = {}) {
    const helper = this.helpers.get(helperId);
    if (!helper) {
      throw new Error(`Helper '${helperId}' not found`);
    }

    // Execute in sandbox for security
    const vm = new NodeVM({
      timeout: 1000,  // 1 second max
      sandbox: { ...args }
    });

    const result = vm.run(helper.function, 'helper.js');
    return result;
  }
}
```

**NEW: ToolValidationHelper**
```javascript
// tools/tool-validation-helper.js (NEW)
class ToolValidationHelper {
  constructor(validators) {
    this.validators = new Map();
    validators.forEach(v => this.validators.set(v.validates, v));
  }

  async validate(commandName, args) {
    const validator = this.validators.get(commandName);
    if (!validator) {
      return { valid: true };  // No validation defined
    }

    // Execute validator function
    const vm = new NodeVM({
      timeout: 500,
      sandbox: { args }
    });

    const result = vm.run(validator.function, 'validator.js');
    return result;  // { valid: boolean, errors: [...] }
  }
}
```

---

## 5. Implementation Roadmap

### Phase 1: Core Extensions (Week 1-2)
- [ ] Extend Tool Schema to v2.0 (add new sections)
- [ ] Implement ToolHelperExecutor (sandbox execution)
- [ ] Implement ToolValidationHelper (pre-execution validation)
- [ ] Add schema version detection to ToolResolver
- [ ] Create migration script (v1.0 tools unchanged, v2.0 opt-in)

### Phase 2: ClickUp Migration (Week 3)
- [ ] Migrate ClickUp tool to v2.0 schema
- [ ] Extract 996 lines of JS knowledge → helpers/processors/validators
- [ ] Document API complexity (webhooks, fields, quirks)
- [ ] Create comprehensive examples (success/failure/edge/anti-pattern)
- [ ] Test with real agents (po, sm)

### Phase 3: Other Complex Tools (Week 4-5)
- [ ] Migrate Supabase MCP to v2.0 (complex queries, RLS patterns)
- [ ] Migrate Google Workspace to v2.0 (OAuth flows, API quotas)
- [ ] Migrate n8n to v2.0 (workflow patterns, node configs)
- [ ] Keep simple tools as v1.0 (Exa, Context7, GitHub CLI)

### Phase 4: Testing & Validation (Week 6)
- [ ] Regression tests (v1.0 tools still work)
- [ ] Integration tests (helpers execution, validation)
- [ ] Performance benchmarks (<50ms helper execution)
- [ ] Security audit (sandbox escape attempts)

### Phase 5: Documentation & Release (Week 7)
- [ ] Update architecture docs with v2.0 schema
- [ ] Create migration guide (v1.0 → v2.0)
- [ ] Update epic/stories with refinements
- [ ] Release 4.32.0 with Tools System v2.0

---

## 6. Success Metrics

### Technical Metrics
- ✅ 100% backward compatibility (v1.0 tools work unchanged)
- ✅ 12+ tools migrated (4 complex v2.0, 8 simple v1.0)
- ✅ <50ms helper execution overhead
- ✅ 0 sandbox security breaches
- ✅ 95%+ validation accuracy (pre-execution)

### Quality Metrics
- ✅ Agent error rate reduced 80% (validation prevents bad MCP calls)
- ✅ Knowledge completeness 95%+ (helpers + docs + examples)
- ✅ API quirks documented for all complex tools
- ✅ Anti-patterns library prevents common mistakes

### Developer Experience
- ✅ Simple tools remain simple (v1.0 schema)
- ✅ Complex tools get full support (v2.0 schema)
- ✅ Clear migration path (auto-detection + opt-in)
- ✅ Comprehensive examples (learn by example)

---

## Appendix A: Schema Comparison

| Feature | v1.0 (Brownfield) | v2.0 (Refined) | Impact |
|---------|-------------------|----------------|--------|
| **Core Metadata** | ✅ id, type, name, version | ✅ Same + schema_version | ✅ Compatible |
| **Knowledge Strategy** | embedded \| external | hybrid \| executable | 🆕 Expanded |
| **Executable Knowledge** | ❌ Not supported | ✅ helpers, processors, validators | 🆕 Critical |
| **API Complexity Docs** | ❌ Not supported | ✅ payload_schemas, field_mappings, api_quirks | 🆕 Essential |
| **Anti-Patterns** | ❌ Not supported | ✅ wrong vs correct examples | 🆕 Prevents errors |
| **Enhanced Examples** | ⚠️ Success only | ✅ success, failure, edge, anti-pattern | 🆕 Complete |
| **Validation Helpers** | ❌ Not supported | ✅ Pre-execution validation | 🆕 Error prevention |
| **Backward Compatible** | N/A | ✅ v1.0 tools work unchanged | ✅ Safe migration |

---

## Next Steps

**PO/Architect:**
1. Review schema v2.0 design
2. Validate against real complexity (ClickUp, Supabase, Google Workspace)
3. Approve migration roadmap

**Story Manager:**
1. Update Stories based on schema v2.0
2. Add new tasks for helper executor, validation helper
3. Refine acceptance criteria

**Developer:**
1. Begin Phase 1 implementation
2. Create schema v2.0 validator
3. Implement sandbox execution (vm2)

---

**Document Status:** 🔬 In Review
**Next Action:** PO/Architect validation
**Version:** 1.0
**Date:** 2025-10-08
