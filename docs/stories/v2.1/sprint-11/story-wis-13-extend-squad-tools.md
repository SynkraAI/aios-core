# Story WIS-13: `*extend-squad-tools` Task Implementation

<!-- Source: Epic WIS - Workflow Intelligence System -->
<!-- Context: Task for adding tools to existing squads -->
<!-- Created: 2025-12-23 by @sm (River) -->

## Status: Draft

**Priority:** 🟡 MEDIUM
**Sprint:** 11
**Effort:** 6-8h
**Lead:** @dev (Dex)
**Approved by:** Pending @po validation

---

## Story

**As an** AIOS developer extending squad capabilities,
**I want** an `*extend-squad-tools` command that adds new tools to existing squads,
**So that** I can make services available to squad agents as MCP tools or internal bindings.

---

## Background

WIS-9 Investigation defined the `*extend-squad-tools` task (Section 5.4).
This enables adding new capabilities to squads without recreating them.

### Reference Documents

| Document | Section |
|----------|---------|
| `docs/architecture/wis-9-investigation-report.md` | Section 5.4: *extend-squad-tools |
| `docs/architecture/wis-9-investigation-report.md` | Section 6.3: squad-tool-template/ |

---

## 🤖 CodeRabbit Integration

### Story Type Analysis

**Primary Type**: Implementation
**Secondary Type(s)**: Squad Integration, MCP Tooling
**Complexity**: Medium-High

### Specialized Agent Assignment

**Primary Agents**:
- @dev (Dex): Implement task and templates

**Supporting Agents**:
- @aios-master (Orion): Squad system knowledge
- @devops (Gage): MCP server configuration

### Quality Gate Tasks

- [ ] Pre-Commit (@dev): Validate tool integration
  - **Pass criteria:** Tool accessible to squad agents
  - **Fail criteria:** Tool not found, MCP errors

### Self-Healing Configuration

**Mode:** light
**Max Iterations:** 2
**Timeout:** 15 minutes

### Focus Areas

- MCP server structure
- Squad definition updates
- Tool schema validation
- Integration testing

---

## Acceptance Criteria

### AC 13.1: Task Definition
- [ ] Create `.aios-core/development/tasks/extend-squad-tools.md`
- [ ] Define inputs:
  - `squad_name` (required string)
  - `tool_name` (required string)
  - `tool_type` (enum: mcp-server, internal-service, cli-wrapper)
  - `service_reference` (path to service)

### AC 13.2: Squad Tool Template
- [ ] Create `squad-tool-template/` structure:
  ```
  squad-tool-template/
  ├── README.md.hbs
  ├── index.ts.hbs
  ├── server.ts.hbs          # MCP server entry
  ├── tools/
  │   └── {{toolName}}.ts.hbs
  ├── schemas/
  │   └── {{toolName}}.schema.json.hbs
  └── package.json.hbs
  ```

### AC 13.3: MCP Server Generation
- [ ] Generate MCP server structure for `mcp-server` type
- [ ] Include tool registration
- [ ] Include JSON Schema for tool inputs
- [ ] Include tool handler implementation

### AC 13.4: Internal Service Binding
- [ ] Generate service binding for `internal-service` type
- [ ] Update squad tools configuration
- [ ] Add service import to squad

### AC 13.5: CLI Wrapper Generation
- [ ] Generate CLI wrapper for `cli-wrapper` type
- [ ] Include argument parsing
- [ ] Include output formatting

### AC 13.6: Squad Definition Update
- [ ] Locate squad in `.aios-core/squads/`
- [ ] Add tool to squad's `tools` array
- [ ] Configure tool parameters
- [ ] Validate squad YAML schema

### AC 13.7: Integration Testing
- [ ] Verify tool is accessible to squad agents
- [ ] Run integration test
- [ ] Validate MCP server starts correctly

### AC 13.8: Agent Integration
- [ ] Add `extend-squad-tools` to @dev agent commands
- [ ] Add task reference to @dev dependencies

---

## Tasks / Subtasks

- [ ] **Task 1: Create Task Definition** (AC: 13.1)
  - [ ] Create task file
  - [ ] Define inputs with validation

- [ ] **Task 2: Create Squad Tool Template** (AC: 13.2)
  - [ ] Create template directory structure
  - [ ] Create README.md.hbs
  - [ ] Create index.ts.hbs
  - [ ] Create server.ts.hbs

- [ ] **Task 3: MCP Server Generation** (AC: 13.3)
  - [ ] Implement MCP server template
  - [ ] Add tool registration logic
  - [ ] Create JSON Schema template

- [ ] **Task 4: Service Binding** (AC: 13.4, 13.5)
  - [ ] Implement internal-service binding
  - [ ] Implement CLI wrapper generation

- [ ] **Task 5: Squad Update Logic** (AC: 13.6)
  - [ ] Implement squad locator
  - [ ] Implement tools array update
  - [ ] Validate YAML structure

- [ ] **Task 6: Integration Tests** (AC: 13.7)
  - [ ] Create integration test
  - [ ] Test MCP server startup

- [ ] **Task 7: Agent Integration** (AC: 13.8)
  - [ ] Update @dev agent

---

## Dev Notes

### MCP Server Template Pattern

```typescript
// server.ts.hbs
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { {{camelCase toolName}}Tool } from './tools/{{kebabCase toolName}}';

const server = new Server({
  name: '{{kebabCase toolName}}-server',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
  },
});

// Register tool
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{{camelCase toolName}}Tool.definition],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === '{{kebabCase toolName}}') {
    return {{camelCase toolName}}Tool.handler(request.params.arguments);
  }
});
```

### Tool Definition Pattern

```typescript
// tools/{{toolName}}.ts.hbs
export const {{camelCase toolName}}Tool = {
  definition: {
    name: '{{kebabCase toolName}}',
    description: '{{description}}',
    inputSchema: {
      type: 'object',
      properties: {
        // Input properties
      },
      required: [],
    },
  },
  handler: async (args: unknown) => {
    // Tool implementation
  },
};
```

### Squad Definition Update

```yaml
# Before
squad:
  name: my-squad
  tools:
    - existing-tool

# After
squad:
  name: my-squad
  tools:
    - existing-tool
    - {{toolName}}:
        type: {{toolType}}
        source: {{serviceReference}}
```

---

## Testing

**Validation:**
1. Create test squad with existing tool
2. Run `*extend-squad-tools` to add new tool
3. Verify squad definition updated
4. Test tool accessibility from squad agent

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-23 | @sm (River) | Initial draft from WIS-9 investigation |
