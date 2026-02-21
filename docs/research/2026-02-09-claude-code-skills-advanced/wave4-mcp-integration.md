# Wave 4: MCP Servers + Agents Integration Patterns

> Deep research on how MCP (Model Context Protocol) servers integrate with Claude Code agents, teams, and skills.
> Date: 2026-02-09 | Sources: 25+ | Pages deep-read: 15+

---

## TL;DR

1. **MCP is the universal connector** -- now an industry standard under the Linux Foundation (donated Dec 2025), supported by Claude, ChatGPT, Gemini, Cursor, VS Code. 97M+ monthly SDK downloads, 10K+ active servers.
2. **Claude Code agents declare MCP access via `mcpServers` frontmatter** -- either referencing pre-configured servers by name or defining inline server configs. Agent Teams inherit all project MCP servers automatically.
3. **Tool Search eliminates context bloat** -- reduces MCP tool overhead by 85% (from ~77K to ~8.7K tokens) via lazy loading with BM25/regex search. Activated automatically when tools exceed 10% of context.
4. **Three composition patterns dominate**: proxy aggregation (single endpoint, multiple backends), mount/import (FastMCP composition), and code-execution-as-API (98.7% token reduction for data-heavy workflows).
5. **MCP Sampling enables server-side agent delegation** -- servers request LLM completions from clients without needing their own API keys. Supports multi-turn tool loops with human-in-the-loop approval.
6. **Production MCP requires**: containerization, health checks, external state persistence (Redis/DynamoDB), OAuth 2.0 auth, rate limiting, and chaos testing. Target: >1000 req/s, <100ms P95, >99.9% uptime.

---

## Table of Contents

1. [MCP Architecture Fundamentals](#1-mcp-architecture-fundamentals)
2. [Agent + MCP Integration in Claude Code](#2-agent--mcp-integration-in-claude-code)
3. [MCP Patterns for Multi-Agent Systems](#3-mcp-patterns-for-multi-agent-systems)
4. [Tool Search and Context Optimization](#4-tool-search-and-context-optimization)
5. [MCP Server Composition Patterns](#5-mcp-server-composition-patterns)
6. [Production MCP Deployment](#6-production-mcp-deployment)
7. [MCP + Skills Integration](#7-mcp--skills-integration)
8. [Advanced MCP Patterns](#8-advanced-mcp-patterns)
9. [MCP Specification Evolution](#9-mcp-specification-evolution)
10. [Integration Matrix](#10-integration-matrix)
11. [Recommendations for MMOS](#11-recommendations-for-mmos)
12. [Sources](#12-sources)
13. [Gaps](#13-gaps)

---

## 1. MCP Architecture Fundamentals

### Core Architecture

MCP follows a client-server architecture with three participants:

```
+--------------------------------------------------+
|              MCP HOST (AI Application)            |
|  e.g., Claude Code, Claude Desktop, Cursor        |
|                                                    |
|  +------------+  +------------+  +------------+   |
|  | MCP Client |  | MCP Client |  | MCP Client |   |
|  |     1       |  |     2       |  |     3       |   |
|  +------+-----+  +------+-----+  +------+-----+   |
+---------|----------------|----------------|--------+
          |                |                |
    +-----v-----+   +-----v-----+   +-----v-----+
    | MCP Server|   | MCP Server|   | MCP Server|
    |  A (Local)|   |  B (Local)|   | C (Remote)|
    | Filesystem|   |  Database |   |   Sentry  |
    +-----------+   +-----------+   +-----------+
```

**Key relationships:**
- **Host** creates one **Client** per **Server** connection
- Each Client maintains a dedicated connection to its Server
- Local servers (stdio) typically serve one client; remote servers (HTTP) serve many
- The Host coordinates all clients and aggregates their capabilities

### Two Protocol Layers

| Layer | Responsibility | Details |
|-------|---------------|---------|
| **Data Layer** | JSON-RPC 2.0 protocol | Lifecycle, primitives (tools/resources/prompts), notifications |
| **Transport Layer** | Communication channels | stdio (local), Streamable HTTP (remote), SSE (deprecated) |

### Six Core Primitives

| Primitive | Direction | Control | Purpose |
|-----------|-----------|---------|---------|
| **Tools** | Server -> Client | User-controlled | Executable functions (API calls, DB queries, file ops) |
| **Resources** | Server -> Client | App-controlled | Read-only data (files, DB records, API responses) |
| **Prompts** | Server -> Client | User-controlled | Reusable interaction templates |
| **Sampling** | Client <- Server | Model-controlled | Server requests LLM completions from client |
| **Elicitation** | Client <- Server | Model-controlled | Server requests user input during execution |
| **Roots** | Client -> Server | Client-controlled | Filesystem access boundaries |

### Connection Lifecycle

```
Client                          Server
  |                               |
  |--- initialize (capabilities) ->|
  |<-- initialize response --------|
  |--- notifications/initialized ->|
  |                               |
  |--- tools/list --------------->|
  |<-- tools list response --------|
  |                               |
  |--- tools/call --------------->|
  |<-- tool result ----------------|
  |                               |
  |<-- notifications/tools/       |
  |    list_changed --------------|
  |--- tools/list (refresh) ----->|
  |<-- updated tools list ---------|
```

> Source: [MCP Architecture Overview](https://modelcontextprotocol.io/docs/learn/architecture)

---

## 2. Agent + MCP Integration in Claude Code

### Agent Frontmatter: mcpServers Field

The `mcpServers` field in agent YAML frontmatter controls which MCP servers a subagent can access. It accepts two forms:

**Form 1: Reference pre-configured servers by name**
```yaml
---
name: data-analyst
description: Analyze data using connected databases
mcpServers:
  - postgres-db
  - analytics-api
---
```

**Form 2: Inline server definitions**
```yaml
---
name: my-agent-with-mcp
description: Agent with custom MCP tools
mcp-servers:
  custom-mcp:
    type: stdio
    command: npx
    args: ["-y", "my-mcp-server"]
    tools: ["*"]
    env:
      API_KEY: ${API_KEY}
---
```

> Source: [Claude Code Sub-agents Docs](https://code.claude.com/docs/en/sub-agents)

### Complete Agent Frontmatter Schema (MCP-relevant)

| Field | Type | MCP Relevance |
|-------|------|---------------|
| `mcpServers` | array/object | Direct MCP server declaration |
| `tools` | array | Can include MCP tool names (e.g., `custom-mcp/tool-1`) |
| `disallowedTools` | array | Can exclude specific MCP tools |
| `hooks` | object | Can validate MCP tool calls via PreToolUse |
| `skills` | array | Skills may depend on MCP servers |
| `permissionMode` | string | Controls approval for MCP tool execution |

### MCP Scopes in Claude Code

```
Priority Order (highest to lowest):
1. CLI --agents flag (session-only)
2. .claude/agents/ (project)        \
3. ~/.claude/agents/ (user)          } Agent-level mcpServers
4. Plugin agents/ (plugin)          /

MCP Server Config Scopes:
1. Local (default): ~/.claude.json per-project path
2. Project: .mcp.json (version controlled)
3. User: ~/.claude.json global section
4. Managed: /Library/Application Support/ClaudeCode/managed-mcp.json
5. Plugin: .claude-plugin/.mcp.json or plugin.json inline
```

### Configuration File Locations

| Scope | File | Shared? | Use Case |
|-------|------|---------|----------|
| Local | `~/.claude.json` (per-project) | No | Personal dev servers, API keys |
| Project | `.mcp.json` (project root) | Yes (git) | Team-shared servers |
| User | `~/.claude.json` (global) | No | Cross-project utilities |
| Managed | System dir `managed-mcp.json` | IT-deployed | Enterprise lockdown |
| Plugin | Plugin dir `.mcp.json` | With plugin | Bundled with plugin |

### Agent Teams and MCP Servers

When a teammate is spawned in an Agent Team:
- Teammates **automatically load the same MCP servers** as a regular Claude Code session
- MCP servers from CLAUDE.md, project `.mcp.json`, and user config are all available
- **MCP tools are NOT available in background subagents** (only foreground)
- There is no explicit mechanism for teammates to share state THROUGH MCP servers (coordination uses file-based task lists and mailboxes instead)

```
+----------------------------------+
|        AGENT TEAM LEAD           |
|  [MCP Servers A, B, C loaded]    |
+--------+-----------+-------------+
         |           |
    +----v----+ +----v----+
    |Teammate1| |Teammate2|
    |[A,B,C]  | |[A,B,C]  |   <-- Same MCP servers loaded
    |Own CWD  | |Own CWD  |       independently per session
    +---------+ +---------+
```

> Source: [Claude Code Agent Teams](https://code.claude.com/docs/en/agent-teams), [claudefa.st Agent Teams Guide](https://claudefa.st/blog/guide/agents/agent-teams)

---

## 3. MCP Patterns for Multi-Agent Systems

### Pattern 1: Reusable AI Agents (LLM embedded in MCP Server)

Each MCP server contains its own LLM and functions as an autonomous agent. The server exposes tools, prompts, and resources while handling reasoning internally.

```
Client (Orchestrator)
  |
  +-- MCP Server A [has own LLM] -- domain expert
  +-- MCP Server B [has own LLM] -- code generator
  +-- MCP Server C [has own LLM] -- reviewer
```

**Trade-offs:** Modular and reusable, but tighter coupling and reduced standardization benefits.

### Pattern 2: Strict MCP Purity (LLM only in Client)

MCP servers are stateless tool/resource providers. All LLM reasoning happens client-side.

```
Client [LLM + Orchestration Logic]
  |
  +-- MCP Server A [Tools only, no LLM]
  +-- MCP Server B [Resources only, no LLM]
  +-- MCP Server C [Prompts + Tools, no LLM]
```

**Trade-offs:** Best for privacy (data stays client-side), offline capability, but client needs more resources.

### Pattern 3: Hybrid Architecture (recommended)

Combines server-side specialized agents with client-side orchestration. LLM placement is flexible.

```
Client [Lightweight LLM for orchestration]
  |
  +-- MCP Server A [Heavy LLM for domain tasks]
  +-- MCP Server B [Tools only, stateless]
  +-- MCP Server C [Resources + light LLM]
```

> Source: [IBM MCP Architecture Patterns](https://developer.ibm.com/articles/mcp-architecture-patterns-ai-systems/)

### Pattern 4: MCP Sampling for Agent Delegation

Sampling allows servers to request LLM completions from clients. This enables agent-to-agent delegation without servers needing their own API keys.

```
Server                    Client                  LLM
  |                         |                      |
  |-- sampling/createMsg -->|                      |
  |                         |-- Present to user -->|
  |                         |<-- Approve ----------|
  |                         |-- Forward to LLM --->|
  |                         |<-- Generation -------|
  |                         |-- Present response ->|
  |                         |<-- Approve ----------|
  |<-- Approved response ---|                      |
```

**Sampling with Tools (agentic loop):**
1. Server sends `sampling/createMessage` with `tools` array
2. Client forwards to LLM, which may return `tool_use` responses
3. Client returns tool use request to server
4. Server executes tools, sends results back in new sampling request
5. Loop continues until LLM returns `endTurn`

```json
{
  "method": "sampling/createMessage",
  "params": {
    "messages": [...],
    "tools": [
      {"name": "get_weather", "inputSchema": {...}}
    ],
    "toolChoice": {"mode": "auto"},
    "modelPreferences": {
      "hints": [{"name": "claude-3-sonnet"}],
      "intelligencePriority": 0.8,
      "speedPriority": 0.5,
      "costPriority": 0.3
    },
    "maxTokens": 1000
  }
}
```

> Source: [MCP Sampling Specification](https://modelcontextprotocol.io/specification/draft/client/sampling)

### Agentic Architecture Patterns (via MCP)

| Pattern | Description | Best For |
|---------|-------------|----------|
| **Tool-Using Agent** | Single agent + MCP tools | Linear automation |
| **Memory-Augmented** | Agent + vector store MCP resources | Context-aware tasks |
| **Planning Agent** | Multi-step MCP tool chains | Complex workflows |
| **Reflection Agent** | Execute + evaluate + adjust loop | Self-improvement |
| **Supervisor** | Lead agent delegates to specialized MCP-backed workers | Task delegation |
| **Hierarchical** | Multi-level supervisor trees | Enterprise complexity |
| **Competitive** | Multiple agents solve same problem, evaluator picks best | Quality optimization |
| **Network** | Peer-to-peer agent communication | Research (NOT production) |

> Source: [Speakeasy Architecture Patterns](https://www.speakeasy.com/mcp/using-mcp/ai-agents/architecture-patterns)

---

## 4. Tool Search and Context Optimization

### The Problem

With multiple MCP servers, tool definitions can consume massive context:
- Developer reported 66K tokens consumed before typing anything
- 50+ MCP tools = ~77K tokens of definitions
- With 200K context limit, 41% consumed by unused tool descriptions

### How Tool Search Works

```
Traditional:                    With Tool Search:
+------------------+           +------------------+
| Load ALL 50+     |           | Load search      |
| tool definitions |           | index only       |
| (~77K tokens)    |           | (~500 tokens)    |
+------------------+           +------------------+
                                      |
                               When tool needed:
                               +------------------+
                               | Search (BM25 or  |
                               | regex) for tools |
                               | Load 3-5 matches |
                               | (~3K tokens)     |
                               +------------------+
```

### Performance Metrics

| Metric | Without Tool Search | With Tool Search | Improvement |
|--------|-------------------|-----------------|-------------|
| Token overhead | ~77K tokens | ~8.7K tokens | **85% reduction** |
| Context consumed | 41% | ~4% | **37% freed** |
| Opus 4 accuracy | 49% | 74% | **+25pp** |
| Opus 4.5 accuracy | 79.5% | 88.1% | **+8.6pp** |
| Tool Search overhead | N/A | ~500 tokens | Minimal |

### Search Modes

| Mode | Pattern Example | Use Case |
|------|----------------|----------|
| **Regex** | `"weather"`, `"get_.*_data"` | Known tool patterns |
| **BM25** | Natural language queries | Exploratory searches |

### Configuration

```bash
# Auto mode (default): activates at 10% threshold
ENABLE_TOOL_SEARCH=auto claude

# Custom threshold (5%)
ENABLE_TOOL_SEARCH=auto:5 claude

# Always on
ENABLE_TOOL_SEARCH=true claude

# Disabled
ENABLE_TOOL_SEARCH=false claude
```

### Best Practices for MCP Server Authors

1. **Use clear, searchable tool names**: `github_create_issue` not `create`
2. **Include keyword-rich descriptions** with all searchable terms
3. **Use specific parameter names**: `repository_url` not `url`
4. **Write detailed server instructions** -- helps Claude know when to search
5. **Group related functionality logically**
6. **No longer need to restrict tool counts** -- comprehensive libraries are now feasible

> Source: [Claude Code MCP Docs](https://code.claude.com/docs/en/mcp), [MCP Tool Search Guide](https://www.atcyrus.com/stories/mcp-tool-search-claude-code-context-pollution-guide), [claudefa.st Tool Search](https://claudefa.st/blog/tools/mcp-extensions/mcp-tool-search)

---

## 5. MCP Server Composition Patterns

### Pattern 1: Proxy Aggregation

A single MCP server aggregates multiple backends into one unified interface.

```
Client
  |
  +-- MCP Proxy Server (single endpoint)
        |
        +-- Backend Server A (filesystem)
        +-- Backend Server B (database)
        +-- Backend Server C (API gateway)
```

**Implementations:**
- [Atrax](https://github.com/metcalfc/atrax): Proxy with multiple server aggregation
- [mcp-proxy](https://github.com/TBXark/mcp-proxy): HTTP aggregation server
- [MetaMCP](https://www.decisioncrafters.com/metamcp-the-complete-guide-to-mcp-aggregation-orchestration-and-gateway-management/): Full gateway with multi-tenancy, OIDC, middleware

### Pattern 2: FastMCP Mount/Import Composition

```python
# MOUNT: Live link (dynamic) -- changes propagate
from fastmcp import FastMCP, Client

main = FastMCP("main")
weather = FastMCP("weather")
maps = FastMCP("maps")

main.mount(weather, namespace="weather")  # weather_get_forecast
main.mount(maps, namespace="maps")        # maps_find_route

# IMPORT: One-time copy (static) -- snapshot at import time
main.import_server(analytics, namespace="analytics")

# PROXY: Remote server mounting
from fastmcp.client import create_proxy
main.mount(create_proxy("http://api.example.com/mcp"), namespace="api")
```

| Method | Link Type | Updates | Performance | Use Case |
|--------|-----------|---------|-------------|----------|
| Mount | Live (dynamic) | Immediate | Runtime delegation | Modular composition |
| Import | One-time copy | Not reflected | Faster | Bundling finalized components |
| Proxy | Live (remote) | Real-time | Network overhead | Remote aggregation |

**Namespacing:** Automatic prefixing prevents conflicts:
- Tools: `namespace_toolname`
- Resources: `data://namespace/resource`

> Source: [FastMCP Composition](https://gofastmcp.com/servers/composition)

### Pattern 3: Code Execution as API

Instead of loading all tool definitions, agents write code to call MCP tools:

```
Traditional:                Code Execution:
Load 50+ tools definitions  Load filesystem structure
(150K tokens)               of tool files (2K tokens)
                            Agent writes code to call
                            specific tools as needed
```

**Performance:** 150K -> 2K tokens = **98.7% reduction**

**Key benefits:**
- Progressive disclosure: agents navigate filesystem to find tools
- Context-efficient: data filtered in execution environment before reaching model
- Control flow: loops/conditionals replace chained tool calls
- Privacy: intermediate results stay in execution sandbox

> Source: [Anthropic Engineering: Code Execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp)

---

## 6. Production MCP Deployment

### Infrastructure Stack

```
+------------------------------------------+
|            Load Balancer                  |
+----+---+---+---+---+---+---+---+--------+
     |   |   |   |   |   |   |
+----v---v---v---v---v---v---v---v--------+
|         Kubernetes Cluster               |
|  +----------+ +----------+ +----------+ |
|  |MCP Server| |MCP Server| |MCP Server| |
|  |  Pod 1   | |  Pod 2   | |  Pod 3   | |
|  +----+-----+ +----+-----+ +----+-----+ |
|       |             |             |      |
|  +----v-------------v-------------v----+ |
|  |        External State Store         | |
|  |    (Redis / DynamoDB / Postgres)    | |
|  +-------------------------------------+ |
+------------------------------------------+
```

### Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Throughput | >1000 req/s per instance | Per MCP server pod |
| Latency P95 | <100ms | Simple operations |
| Latency P99 | <500ms | Complex operations |
| Error rate | <0.1% | Under normal conditions |
| Availability | >99.9% | With redundancy |

### Security Checklist

1. **Authentication**: OAuth 2.0 for remote servers, process isolation for local
2. **Authorization**: Scoped tool access per agent/user
3. **Input validation**: JSON Schema enforcement on all tool inputs
4. **Transport security**: HTTPS for remote, stdio isolation for local
5. **Secret management**: Never store API keys in config files; use env vars or keychain
6. **Rate limiting**: Per-client and per-tool limits
7. **Audit logging**: All tool invocations with user/agent attribution

### State Management

```
+-------------------+  Session ID  +-------------------+
|   MCP Client      |<------------>|   MCP Server      |
| (Mcp-Session-Id)  |  (header)    | (session storage)  |
+-------------------+              +--------+----------+
                                            |
                           +----------------v-----------+
                           |  State Storage Options      |
                           |                             |
                           | 1. In-Memory (single node)  |
                           | 2. Redis (distributed)       |
                           | 3. DynamoDB (serverless)     |
                           | 4. Postgres (persistent)     |
                           +-----------------------------+
```

**Key challenge:** Official SDKs do not yet support external session persistence. Session state exists only on the server instance where it was created. Workaround: externalize state after each interaction, restore before next.

### Health Check Pattern

```json
{
  "status": "healthy",
  "checks": {
    "database": { "status": "up", "latency_ms": 12 },
    "cache": { "status": "up", "latency_ms": 2 },
    "external_api": { "status": "up", "latency_ms": 45 },
    "disk_space": { "status": "ok", "available_gb": 42 },
    "memory": { "status": "ok", "used_pct": 67 }
  },
  "version": "1.2.0",
  "uptime_seconds": 86400
}
```

### Production Roadmap

| Phase | Weeks | Focus |
|-------|-------|-------|
| Foundation | 1-2 | Core protocol, error handling, monitoring, testing |
| Hardening | 3-4 | Security, performance optimization, health checks |
| Scaling | 5-6 | Load testing, chaos engineering, advanced monitoring |
| Operations | Ongoing | Continuous optimization, security audits, capacity planning |

> Source: [MCP Best Practices](https://modelcontextprotocol.info/docs/best-practices/), [AWS MCP Deployment Guidance](https://aws.amazon.com/solutions/guidance/deploying-model-context-protocol-servers-on-aws/)

---

## 7. MCP + Skills Integration

### Skills that Require MCP Servers

Skills can declare MCP server dependencies through the agent they run in:

```yaml
# SKILL.md with context: fork
---
name: database-analysis
description: Analyze database schemas and suggest optimizations
context: fork
agent: db-analyst
---

Analyze the database schema and suggest performance optimizations...
```

```yaml
# .claude/agents/db-analyst.md
---
name: db-analyst
description: Database analysis specialist
mcpServers:
  - postgres-db
tools: Bash, Read, Grep
model: sonnet
---
```

### Plugin MCP Servers (Distribution Pattern)

Plugins bundle MCP servers for automatic distribution:

```json
// .claude-plugin/plugin.json
{
  "name": "my-database-plugin",
  "mcpServers": {
    "db-tools": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
      "env": {
        "DB_URL": "${DB_URL}"
      }
    }
  }
}
```

Or via separate `.mcp.json` at plugin root:

```json
{
  "database-tools": {
    "command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server",
    "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"]
  }
}
```

**Benefits:**
- Bundled distribution: tools and servers packaged together
- Automatic setup: no manual MCP configuration
- Team consistency: everyone gets same tools
- `${CLAUDE_PLUGIN_ROOT}` for plugin-relative paths

### Dynamic MCP Configuration

MCP servers support `list_changed` notifications. When a server dynamically updates its tools, Claude Code automatically refreshes available capabilities without reconnection.

```
Server: notifications/tools/list_changed  -->  Client
Client: tools/list (refresh)              -->  Server
Server: [updated tool list]               -->  Client
```

Environment variable expansion in `.mcp.json` enables dynamic configuration:
```json
{
  "mcpServers": {
    "api-server": {
      "type": "http",
      "url": "${API_BASE_URL:-https://api.example.com}/mcp",
      "headers": {
        "Authorization": "Bearer ${API_KEY}"
      }
    }
  }
}
```

> Source: [Claude Code MCP Docs](https://code.claude.com/docs/en/mcp), [Claude Code Plugins Reference](https://code.claude.com/docs/en/plugins-reference)

---

## 8. Advanced MCP Patterns

### Claude Code as MCP Server (Agent-in-Agent)

Claude Code can itself become an MCP server, enabling "an agent in your agent":

```bash
# Start Claude Code as MCP server
claude mcp serve
```

**Exposed tools when serving:**
- Bash, Read/View, Write/Edit, LS, GrepTool, GlobTool, Replace, dispatch_agent

**Use cases:**
- Cursor delegates large refactors to Claude Code
- Claude Desktop runs development tasks for non-technical users
- Agent orchestration across multiple IDE clients

**Key limitation:** MCP servers configured IN Claude Code are NOT passed through. Each layer maintains separate, isolated access.

```json
// Claude Desktop config
{
  "mcpServers": {
    "claude-code": {
      "type": "stdio",
      "command": "claude",
      "args": ["mcp", "serve"]
    }
  }
}
```

### Multiple Claude Code Instances

Different Claude Code instances can run as separate MCP servers for different projects:

```json
{
  "mcpServers": {
    "project-a": {
      "command": "claude",
      "args": ["mcp", "serve"],
      "env": {"PWD": "/path/to/project-a"}
    },
    "project-b": {
      "command": "claude",
      "args": ["mcp", "serve"],
      "env": {"PWD": "/path/to/project-b"}
    }
  }
}
```

### mcp-agent Framework Patterns

The [lastmile-ai/mcp-agent](https://github.com/lastmile-ai/mcp-agent) framework implements composable workflow patterns:

```python
# Agent with MCP servers
agent = Agent(
    name="finder",
    instruction="Use filesystem and fetch to answer questions.",
    server_names=["filesystem", "fetch"]  # MCP server references
)

# Orchestrator pattern
orchestrator = Orchestrator(
    agents=[finder, analyzer, writer],
    instruction="Research and write a report"
)

# Router pattern
router = Router(
    agents=[support_agent, billing_agent, technical_agent],
    instruction="Route to the right specialist"
)
```

**Execution engines:**
- `asyncio` (default): local, fast
- `temporal`: durable, pause/resume, retries, human input

### MCP Resources for Shared State

Resources provide read-only data that can serve as shared context between agents:

```
# Reference MCP resources with @ mentions
> Analyze @postgres:schema://users and compare with @docs:file://api/user-model

# Resources are fetched and included as attachments
# Fuzzy-searchable in @ mention autocomplete
```

**Resource types:**
- Text (UTF-8): source code, configs, logs
- Binary (base64): PDFs, images, audio
- Dynamic templates: `travel://activities/{city}/{category}`

### MCP Testing Patterns

```python
# In-memory testing (no subprocess, no network)
from fastmcp.testing import MCPTestClient

async def test_tool():
    server = create_server()
    async with MCPTestClient(server) as client:
        result = await client.call_tool("my_tool", {"param": "value"})
        assert result.content[0].text == "expected"

# Integration test layers:
# 1. Registration tests (tools/list returns expected tools)
# 2. Happy path tests (correct input -> correct output)
# 3. Error tests (invalid input -> proper error)
# 4. Schema validation tests (inputs match JSON Schema)
# 5. Bug regression tests (every bug gets a test)
```

### Enterprise Governance

**Managed MCP configuration** (IT-deployed):
```json
// /Library/Application Support/ClaudeCode/managed-mcp.json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "company-internal": {
      "type": "stdio",
      "command": "/usr/local/bin/company-mcp-server"
    }
  }
}
```

**Policy-based control:**
```json
{
  "allowedMcpServers": [
    {"serverName": "github"},
    {"serverUrl": "https://mcp.company.com/*"},
    {"serverCommand": ["npx", "-y", "approved-package"]}
  ],
  "deniedMcpServers": [
    {"serverUrl": "https://*.untrusted.com/*"}
  ]
}
```

> Source: [Claude Code MCP Docs](https://code.claude.com/docs/en/mcp), [ksred.com Claude Code MCP Server](https://www.ksred.com/claude-code-as-an-mcp-server-an-interesting-capability-worth-understanding/)

---

## 9. MCP Specification Evolution

### Timeline

| Date | Event | Significance |
|------|-------|-------------|
| **Nov 2024** | MCP open-sourced by Anthropic | Python + TypeScript SDKs released |
| **Mar 2025** | OpenAI adopts MCP | Agents SDK, Responses API, ChatGPT Desktop |
| **Apr 2025** | Google DeepMind adds MCP | Gemini model support confirmed |
| **Jun 2025** | Spec 2025-06-18 released | Elicitation, structured outputs, OAuth enhancement |
| **Nov 2025** | Major spec update | Async operations, statelessness, server identity |
| **Dec 2025** | Donated to Linux Foundation | Agentic AI Foundation (AAIF) created |
| **Jan 2026** | Tool Search ships | Auto-enabled in Claude Code |
| **Feb 2026** | Draft spec: Tasks | Experimental durable execution wrappers |

### Current Spec: 2025-06-18

Key additions:
- **Elicitation**: Servers can request user input via `elicitation/create`
- **Structured tool outputs**: Beyond text responses
- **OAuth enhancements**: Resource Server requirements
- **JSON-RPC batching removed**: Simplification

### Draft Spec Features

- **Tasks (Experimental)**: Durable execution wrappers for deferred results
- **Sampling with Tools**: Multi-turn agentic loops via sampling
- **Enhanced Elicitation**: JSON Schema validation for user input

### Ecosystem Scale (Dec 2025)

| Metric | Value |
|--------|-------|
| Monthly SDK downloads | 97 million |
| Active MCP servers | 10,000+ |
| Supported platforms | Claude, ChatGPT, Gemini, Cursor, VS Code, Copilot |
| SDK languages | TypeScript, Python, C#, Java, Kotlin, Go, Rust |

> Source: [Pento MCP Year Review](https://www.pento.ai/blog/a-year-of-mcp-2025-review), [MCP Specification](https://modelcontextprotocol.io/specification/draft/client/sampling)

---

## 10. Integration Matrix

### Agent Type x MCP Pattern

| Agent Type | MCP Tools | MCP Resources | MCP Prompts | MCP Sampling | Tool Search |
|------------|-----------|---------------|-------------|-------------|-------------|
| **Subagent (foreground)** | Full access | Full access | Via /mcp__ | N/A (client-side) | Active |
| **Subagent (background)** | NOT available | NOT available | N/A | N/A | N/A |
| **Agent Team lead** | Full access | Full access | Full access | N/A | Active |
| **Agent Team mate** | Full access (independent) | Full access | Full access | N/A | Active |
| **claude --agent** | Full access | Full access | Full access | N/A | Active |
| **Claude Code as MCP Server** | Exposes tools | N/A | N/A | N/A | N/A |

### MCP Configuration Method x Distribution Scope

| Method | Local Dev | Team Shared | Enterprise | Plugin |
|--------|-----------|-------------|------------|--------|
| `~/.claude.json` | Yes | No | No | No |
| `.mcp.json` (project) | Yes | Yes (git) | Yes | No |
| `managed-mcp.json` | No | No | Yes | No |
| Plugin `.mcp.json` | N/A | N/A | N/A | Yes |
| `--agents` CLI JSON | Yes | No | CI/CD | No |
| Agent frontmatter `mcpServers` | Yes | Yes (git) | Yes | Yes |

### MCP Server Type x Transport

| Server Type | Transport | Auth | State | Scaling |
|-------------|-----------|------|-------|---------|
| Local (filesystem, DB) | stdio | Process isolation | In-memory | Single instance |
| Remote (SaaS APIs) | HTTP | OAuth 2.0 / Bearer | External store | Horizontal |
| Proxy/Aggregator | HTTP | Passthrough | Stateless | Horizontal |
| Claude Code as Server | stdio | Process isolation | Per-connection | Per-process |

---

## 11. Recommendations for MMOS

### R1: Create Project-Level .mcp.json for Shared Servers

```json
// /Users/alan/Code/mmos/.mcp.json
{
  "mcpServers": {
    "supabase": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server"],
      "env": {
        "SUPABASE_URL": "${SUPABASE_URL}",
        "SUPABASE_SERVICE_KEY": "${SUPABASE_SERVICE_KEY}"
      }
    }
  }
}
```

**Rationale:** Version-controlled, team-shared configuration. Environment variables keep secrets out of git.

### R2: Scope MCP per Agent via Frontmatter

```yaml
# .claude/agents/mmos-victoria.md (mind clone creation)
---
name: mmos-victoria
mcpServers:
  - supabase
tools: Read, Write, Edit, Bash, Grep, Glob, Task
permissionMode: default
---
```

```yaml
# .claude/agents/mmos-quinn.md (QA agent - read-only DB)
---
name: mmos-quinn
mcpServers:
  - supabase
tools: Read, Grep, Glob, Bash
disallowedTools: Write, Edit
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: ".claude/hooks/sql-governance.py"
---
```

**Rationale:** Principle of least privilege. QA agent gets read-only access. SQL governance hook enforces read-only queries.

### R3: Leverage Tool Search for Growing Tool Count

As MMOS adds more MCP servers (Supabase, GitHub, Sentry, etc.), Tool Search will automatically activate. Optimize by:
1. Writing descriptive `server instructions` for each MCP server
2. Using searchable tool names (e.g., `supabase_query_minds` not just `query`)
3. Setting threshold: `ENABLE_TOOL_SEARCH=auto:5` (activate at 5% instead of 10%)

### R4: MCP Server for MMOS Pipeline State

Create a custom MCP server that exposes the MMOS pipeline state as resources:

```
Resources:
  mmos://minds/{slug}/state     -> state.json
  mmos://minds/{slug}/metadata  -> mind metadata
  mmos://pipeline/status        -> current pipeline stage

Tools:
  mmos_update_state(slug, phase, status)
  mmos_get_active_mind()
  mmos_list_minds(status_filter)
```

**Rationale:** Replaces file-based context loading (`mmos-context-loader.cjs`) with standardized MCP resource access. Every agent automatically gets access.

### R5: Plugin Distribution for MMOS Squads

Package each squad's tools as a Claude Code plugin with bundled MCP servers:

```
squads/mmos/
  .claude-plugin/
    plugin.json
    .mcp.json     <- MMOS MCP server config
  agents/
  scripts/
```

**Rationale:** Automatic lifecycle management, team consistency, and clean separation of concerns.

### R6: Testing Strategy for MCP Servers

```
tests/
  mcp/
    unit/           <- In-memory tests (no network)
    integration/    <- Full client-server tests
    contract/       <- Protocol compliance
    load/           <- Performance benchmarks
```

Use FastMCP's in-memory testing pattern. Every tool gets: registration test, happy path, error handling, schema validation, and regression tests.

---

## 12. Sources

### Official Documentation
- [Claude Code MCP Docs](https://code.claude.com/docs/en/mcp) -- Complete MCP configuration reference
- [Claude Code Sub-agents Docs](https://code.claude.com/docs/en/sub-agents) -- Agent frontmatter schema with mcpServers
- [Claude Code Agent Teams Docs](https://code.claude.com/docs/en/agent-teams) -- Team MCP server inheritance
- [MCP Architecture Overview](https://modelcontextprotocol.io/docs/learn/architecture) -- Host/Client/Server architecture
- [MCP Sampling Specification (Draft)](https://modelcontextprotocol.io/specification/draft/client/sampling) -- Sampling + tool loops
- [MCP Best Practices](https://modelcontextprotocol.info/docs/best-practices/) -- Production patterns

### Architecture & Patterns
- [IBM MCP Architecture Patterns](https://developer.ibm.com/articles/mcp-architecture-patterns-ai-systems/) -- Multi-agent architecture patterns
- [Anthropic Engineering: Code Execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp) -- 98.7% token reduction pattern
- [Speakeasy Architecture Patterns](https://www.speakeasy.com/mcp/using-mcp/ai-agents/architecture-patterns) -- 8 agentic patterns
- [FastMCP Server Composition](https://gofastmcp.com/servers/composition) -- Mount/Import/Proxy patterns
- [WorkOS MCP Features Guide](https://workos.com/blog/mcp-features-guide) -- 6 primitives deep dive
- [Knit MCP Deep Dive](https://www.getknit.dev/blog/mcp-architecture-deep-dive-tools-resources-and-prompts-explained) -- Tools/Resources/Prompts architecture

### Tools & Optimization
- [MCP Tool Search Guide](https://www.atcyrus.com/stories/mcp-tool-search-claude-code-context-pollution-guide) -- Tool Search mechanics
- [claudefa.st Tool Search](https://claudefa.st/blog/tools/mcp-extensions/mcp-tool-search) -- 95% context savings
- [Scott Spence MCP Configuration](https://scottspence.com/posts/configuring-mcp-tools-in-claude-code) -- .claude.json patterns

### Frameworks & Implementations
- [lastmile-ai/mcp-agent](https://github.com/lastmile-ai/mcp-agent) -- Composable workflow framework
- [steipete/claude-code-mcp](https://github.com/steipete/claude-code-mcp) -- Agent-in-agent pattern
- [punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers) -- Curated server list
- [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) -- Official reference servers

### Industry & Ecosystem
- [Pento: A Year of MCP](https://www.pento.ai/blog/a-year-of-mcp-2025-review) -- MCP timeline and metrics
- [ksred.com: Claude Code as MCP Server](https://www.ksred.com/claude-code-as-an-mcp-server-an-interesting-capability-worth-understanding/) -- Agent-in-agent deep dive
- [claudefa.st Agent Teams](https://claudefa.st/blog/guide/agents/agent-teams) -- Team MCP inheritance

### Production & Security
- [AWS MCP Deployment Guidance](https://aws.amazon.com/solutions/guidance/deploying-model-context-protocol-servers-on-aws/) -- Cloud deployment
- [Snyk MCP Security](https://snyk.io/articles/5-best-practices-for-building-mcp-servers/) -- Security best practices
- [MCPcat Testing Guide](https://mcpcat.io/guides/writing-unit-tests-mcp-servers/) -- Unit testing patterns

---

## 13. Gaps

### Not fully covered in this research:

1. **A2A (Agent-to-Agent) Protocol interaction with MCP** -- Google's A2A protocol launched alongside MCP; how they complement each other in multi-agent scenarios needs deeper investigation.
2. **MCP server performance benchmarks** -- Real-world benchmarks comparing stdio vs HTTP vs proxy patterns under load.
3. **MCP + Claude Agent SDK programmatic integration** -- How the TypeScript/Python SDK's `query()` method interacts with MCP servers declared in code (not just config files).
4. **MCP server versioning strategies** -- How to handle backward-compatible changes, tool deprecation, and schema evolution in production.
5. **MCP sampling real-world implementations** -- Sampling is in draft spec; few production implementations exist to study.
6. **MCP Elicitation patterns** -- New in 2025-06-18 spec; limited real-world usage patterns documented.
7. **Cost analysis** -- Token cost comparison across different MCP integration patterns (direct tools vs code execution vs proxy).
8. **Agent memory persistence via MCP resources** -- Using MCP resources (not just files) as cross-session agent memory.
