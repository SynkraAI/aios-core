# Add MCP Server Task

> Dynamically add MCP servers to Docker MCP Toolkit from the catalog.

---

## Task Definition

```yaml
task: addMcp()
responsavel: DevOps Agent
responsavel_type: Agente
atomic_layer: Infrastructure
elicit: true

**Entrada:**
- campo: mcp_query
  tipo: string
  origem: User Input
  obrigatorio: true
  validacao: Search query for MCP catalog

- campo: mcp_name
  tipo: string
  origem: User Selection
  obrigatorio: true
  validacao: Exact MCP server name from catalog

- campo: credentials
  tipo: object
  origem: User Input
  obrigatorio: false
  validacao: API keys or tokens if required by MCP

**Saida:**
- campo: mcp_added
  tipo: boolean
  destino: Docker MCP configuration
  persistido: true

- campo: tools_available
  tipo: array
  destino: Console output
  persistido: false
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] Docker MCP Toolkit running
    tipo: pre-condition
    blocker: true
    validacao: docker mcp gateway status succeeds
    error_message: "Start gateway: docker mcp gateway run --watch"

  - [ ] Dynamic MCP feature enabled
    tipo: pre-condition
    blocker: false
    validacao: docker mcp feature list shows dynamic-tools
    error_message: "Enable with: docker mcp feature enable dynamic-tools"
```

---

## Interactive Elicitation

### Step 1: Search MCP Catalog

```
ELICIT: MCP Search

What MCP server are you looking for?

Enter a search query (e.g., "notion", "slack", "database"):
→ _______________

[Searching Docker MCP catalog...]
```

### Step 2: Select from Results

```
ELICIT: MCP Selection

Found {n} MCPs matching "{query}":

1. mcp/notion
   └─ Notion workspace integration
   └─ Requires: NOTION_API_KEY

2. mcp/postgres
   └─ PostgreSQL database access
   └─ Requires: DATABASE_URL

3. mcp/sqlite
   └─ SQLite database access
   └─ Requires: None (local file)

→ Select MCP to add (number or name): ___
```

### Step 3: Configure Credentials

```
ELICIT: Credentials Configuration

The selected MCP requires authentication:

MCP: mcp/{name}
Required: {CREDENTIAL_NAME}

Options:
1. Set environment variable now
2. Configure later (MCP may fail without credentials)
3. Skip this MCP

→ Choose option: ___

[If option 1]
Enter value for {CREDENTIAL_NAME}:
→ _______________
(This will be set as an environment variable)
```

### Step 4: Confirm Addition

```
ELICIT: Confirmation

Ready to add MCP:

Server: mcp/{name}
Credentials: {configured/not configured}
Preset: {preset to add to, if any}

→ Proceed? (y/n): ___
```

---

## Implementation Steps

### 1. Search Catalog

```bash
# Search for MCPs
docker mcp catalog search {query}

# Example output:
# mcp/notion    Notion workspace integration
# mcp/postgres  PostgreSQL database access
```

### 2. Get MCP Details

```bash
# Get detailed info about an MCP
docker mcp catalog info {mcp-name}

# Shows: description, required credentials, tools provided
```

### 3. Add MCP Server

```bash
# Add the server
docker mcp server add {mcp-name}

# With environment variable
docker mcp server add {mcp-name} --env NOTION_API_KEY=${NOTION_API_KEY}
```

### 4. Update Gordon Config (Optional)

If adding to gordon-mcp.yml:

```yaml
# Add to .docker/mcp/gordon-mcp.yml
services:
  {mcp-name}:
    image: mcp/{mcp-name}
    environment:
      - {CREDENTIAL_NAME}=${CREDENTIAL_NAME}
    labels:
      mcp.preset: "full,{custom}"
```

### 5. Verify Addition

```bash
# List tools from new MCP
docker mcp tools ls | grep {mcp-name}

# Test a tool
docker mcp tools call {mcp-name}.{tool} --param value
```

### 6. Add to Preset (Optional)

```bash
# Add to existing preset
docker mcp preset update {preset-name} --add-server {mcp-name}

# Or create new preset including the MCP
docker mcp preset create {new-preset} --servers fs,github,{mcp-name}
```

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] MCP server added
    tipo: post-condition
    blocker: true
    validacao: docker mcp server list includes new MCP
    error_message: "MCP addition failed"

  - [ ] Tools available
    tipo: post-condition
    blocker: true
    validacao: docker mcp tools ls shows MCP tools
    error_message: "MCP tools not available - check credentials"
```

---

## Error Handling

### Error: MCP Not Found

```
Resolution:
1. Check spelling of MCP name
2. Search with broader query: docker mcp catalog search "*"
3. Check if MCP is in the registry: https://github.com/modelcontextprotocol/registry
```

### Error: Credentials Missing

```
Resolution:
1. Set environment variable: export NOTION_API_KEY=your_key
2. Add to .env file: NOTION_API_KEY=your_key
3. Pass directly: docker mcp server add notion --env NOTION_API_KEY=key
```

### Error: MCP Fails to Start

```
Resolution:
1. Check Docker logs: docker logs mcp-{name}
2. Verify credentials are correct
3. Check MCP documentation for specific requirements
4. Try removing and re-adding: docker mcp server remove {name}
```

---

## Success Output

```
✅ MCP Server Added Successfully!

📦 Server: mcp/{name}
🔧 Tools Added:
   • {name}.tool1 - Description
   • {name}.tool2 - Description
   • {name}.tool3 - Description

🔗 Status: Running
📋 Preset: Added to 'aios-full'

Next steps:
1. Test tools: docker mcp tools call {name}.tool1 --param value
2. Use in workflow: *mcp-workflow with {name} tools
3. Add to other presets: docker mcp preset update aios-dev --add-server {name}
```

---

## Common MCPs Reference

| MCP | Purpose | Credentials | Popular Tools |
|-----|---------|-------------|---------------|
| `notion` | Notion workspace | NOTION_API_KEY | getPage, createPage, search |
| `postgres` | PostgreSQL DB | DATABASE_URL | query, execute, listTables |
| `sqlite` | SQLite DB | None | query, execute |
| `slack` | Slack messaging | SLACK_BOT_TOKEN | sendMessage, listChannels |
| `puppeteer` | Browser automation | None | navigate, screenshot, click |
| `redis` | Redis cache | REDIS_URL | get, set, del |
| `s3` | AWS S3 | AWS_* | upload, download, list |
| `stripe` | Stripe payments | STRIPE_SECRET_KEY | createPayment, listCustomers |

---

## Metadata

```yaml
task: add-mcp
version: 1.1.0
story: Story 6.14 - MCP Governance Consolidation
dependencies:
  - Docker MCP Toolkit
  - docker mcp gateway running
tags:
  - infrastructure
  - mcp
  - docker
  - dynamic
created_at: 2025-12-08
updated_at: 2025-12-17
agents:
  - devops
changelog:
  1.1.0:
    - Changed: DevOps Agent now exclusive responsible (Story 6.14)
    - Removed: Dev Agent from agents list
  1.0.0:
    - Initial version (Story 5.11)
```
