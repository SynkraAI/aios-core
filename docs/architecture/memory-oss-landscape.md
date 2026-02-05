# Open Source Memory Systems Landscape

**Investigation Story:** Memory & Self-Improvement Systems
**Deliverable:** D3 - OSS Landscape
**Author:** @analyst (Atlas)
**Date:** 2026-02-04
**Status:** Complete

---

## 1. Executive Summary

Este documento mapeia o ecossistema open source de sistemas de memória para LLM agents, identificando projetos relevantes para absorção no AIOS.

### Key Findings

- **Mem0** é o líder de mercado com 37k+ stars e arquitetura híbrida madura
- **Letta (MemGPT)** é o pioneiro acadêmico com memory-first approach
- **LangChain Memory** é legacy mas bem documentado
- **Graphiti** se destaca para knowledge graphs em tempo real
- **OpenMemory** é promissor para Claude/MCP integration

### Recommendation

Adotar patterns de **Mem0** para arquitetura híbrida, com **Graphiti** para knowledge graph, mantendo **compatibilidade MCP** via OpenMemory concepts.

---

## 2. Tabela Comparativa (Features × Projetos)

| Feature | Mem0 | Letta | LangChain | CrewAI | AutoGen | Graphiti | OpenMemory |
|---------|------|-------|-----------|--------|---------|----------|------------|
| **Stars (GitHub)** | 37k+ | 15k+ | 100k+ | 25k+ | 40k+ | 3k+ | 500+ |
| **Last Update** | Active | Active | Active | Active | Active | Active | Active |
| **License** | Apache 2.0 | Apache 2.0 | MIT | MIT | MIT | Apache 2.0 | MIT |
| **Vector DB** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Graph DB** | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Key-Value** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Episodic Memory** | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ✅ | ✅ |
| **Semantic Memory** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Procedural Memory** | ✅ | ⚠️ | ❌ | ⚠️ | ❌ | ❌ | ❌ |
| **Entity Tracking** | ✅ | ✅ | ⚠️ | ⚠️ | ❌ | ✅ | ✅ |
| **Self-Editing** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **MCP Support** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Claude Specific** | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ❌ | ⚠️ | ✅ |
| **Python SDK** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Node.js SDK** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |

**Legend:** ✅ Full support | ⚠️ Partial/Limited | ❌ Not available

---

## 3. Project Deep Dives

### 3.1 Mem0 (mem0ai/mem0)

**Repository:** https://github.com/mem0ai/mem0
**Stars:** 37,000+
**License:** Apache 2.0
**Last Activity:** Active (daily commits)

#### Architecture

```
Mem0 Hybrid Data Store
│
├── Vector Database (Semantic Similarity)
│   └── Chroma, Pinecone, Qdrant, Weaviate
│
├── Graph Database (Relationships)
│   └── Neo4j, Memgraph, Neptune, Kuzu
│
└── Key-Value Store (Fast Retrieval)
    └── Redis, Valkey, DynamoDB
```

#### Key Features

1. **Unified Memory APIs:**
   - `memory.add()` — Store memories
   - `memory.search()` — Semantic search
   - `memory.get()` — Retrieve by ID
   - `memory.update()` — Modify existing
   - `memory.delete()` — Remove

2. **Memory Types:**
   - Episodic (personal experiences)
   - Semantic (facts and concepts)
   - Procedural (how to do things)
   - Associative (connections)

3. **Intelligent Ranking:**
   - Relevance score
   - Importance weighting
   - Recency decay

#### Performance Benchmarks (LOCOMO Framework)

| Metric | Mem0 | OpenAI Memory | Full Context |
|--------|------|---------------|--------------|
| Accuracy | +26% baseline | baseline | varies |
| P95 Latency | 91% lower | baseline | highest |
| Token Cost | 90% savings | baseline | highest |

#### Code Example

```python
from mem0 import Memory

m = Memory()

# Add memory
m.add("User prefers dark mode", user_id="alice")

# Search memories
results = m.search("UI preferences", user_id="alice")

# Get with filters
memories = m.get_all(user_id="alice", limit=10)
```

#### AIOS Compatibility

| Aspect | Status | Notes |
|--------|--------|-------|
| Stack | ✅ Compatible | Supabase/pgvector supported |
| License | ✅ Apache 2.0 | Commercial use OK |
| SDKs | ✅ Python + Node | Both available |
| Complexity | ⚠️ Medium | Requires multiple backends |

**Recommendation:** Absorver arquitetura híbrida e ranking inteligente.

---

### 3.2 Letta (MemGPT)

**Repository:** https://github.com/letta-ai/letta
**Stars:** 15,000+
**License:** Apache 2.0
**Last Activity:** Active

#### Origin Story

MemGPT started as UC Berkeley research paper, now evolved into Letta platform. Key insight: treat LLM context window like operating system memory.

#### Architecture

```
MemGPT "LLM Operating System"
│
├── In-Context Memory (RAM)
│   ├── Core Memory (always loaded)
│   └── Working Memory (current task)
│
└── Out-of-Context Memory (Disk)
    ├── Archival Memory (vector DB)
    └── Recall Memory (conversations)
```

#### Key Innovation: Self-Editing Memory

```python
# LLM edits its own memory via tools
def core_memory_append(self, name: str, content: str):
    """Append to core memory section"""

def core_memory_replace(self, name: str, old: str, new: str):
    """Replace content in core memory"""
```

The agent decides when and what to remember.

#### Letta Code (2025-2026)

Memory-first coding agent, #1 on Terminal-Bench for model-agnostic agents.

```
Features:
- Persistent agent that learns over time
- Portable across models (Claude, GPT, Gemini)
- Conversations API for parallel experiences
```

#### AIOS Compatibility

| Aspect | Status | Notes |
|--------|--------|-------|
| Stack | ⚠️ Partial | Different DB approach |
| License | ✅ Apache 2.0 | Commercial use OK |
| SDKs | ✅ Python | Node not available |
| Complexity | 🔴 High | Full framework replacement |

**Recommendation:** Absorver conceito de self-editing memory para agentes.

---

### 3.3 LangChain Memory Modules

**Repository:** https://github.com/langchain-ai/langchain
**Stars:** 100,000+
**License:** MIT
**Last Activity:** Active

#### Memory Types (Legacy)

| Type | Description | Status |
|------|-------------|--------|
| ConversationBufferMemory | Full history | ⚠️ Deprecated |
| ConversationSummaryMemory | Summarized | ⚠️ Deprecated |
| ConversationBufferWindowMemory | Sliding window | ⚠️ Deprecated |
| EntityMemory | Entity tracking | ⚠️ Deprecated |
| VectorStoreRetrieverMemory | RAG-based | ✅ Active |

#### Migration Path (2025+)

```python
# Old (deprecated)
from langchain.memory import ConversationBufferMemory

# New (recommended)
from langgraph.checkpoint import MemorySaver
from langchain_core.runnables.history import RunnableWithMessageHistory
```

LangGraph with checkpointing is now the recommended approach.

#### AIOS Compatibility

| Aspect | Status | Notes |
|--------|--------|-------|
| Stack | ✅ Compatible | Many integrations |
| License | ✅ MIT | Most permissive |
| SDKs | ✅ Python + JS | Both available |
| Complexity | ⚠️ Low-Medium | Well documented |

**Recommendation:** Usar como referência de patterns, não como dependência.

---

### 3.4 CrewAI Memory

**Repository:** https://github.com/crewAIInc/crewAI
**Stars:** 25,000+
**License:** MIT
**Last Activity:** Active

#### Memory Types

```python
crew = Crew(
    memory=True,  # Enable all memory types
    verbose=True
)
```

| Type | Storage | Purpose |
|------|---------|---------|
| Short-Term | ChromaDB | Current context |
| Long-Term | SQLite3 | Cross-session |
| Entity | ChromaDB | People/places/concepts |
| External | Custom | Third-party integrations |

#### Storage Locations

```python
# Default: platform-specific via appdirs
# Override via environment
CREWAI_STORAGE_DIR=/custom/path
```

#### Known Limitations

- ChromaDB lock files prevent concurrent writes
- Memory grows unbounded without cleanup
- vertexai embeddings deprecated June 2026

#### AIOS Compatibility

| Aspect | Status | Notes |
|--------|--------|-------|
| Stack | ⚠️ Partial | ChromaDB vs pgvector |
| License | ✅ MIT | Commercial use OK |
| SDKs | ✅ Python | Only Python |
| Complexity | ✅ Low | Easy to use |

**Recommendation:** Referência para multi-agent memory patterns.

---

### 3.5 Microsoft AutoGen / Agent Framework

**Repository:** https://github.com/microsoft/autogen
**Stars:** 40,000+
**License:** MIT
**Last Activity:** Active (migrating to Agent Framework)

#### Memory Options

1. **In-Memory (Default):**
   - Full chat history in AgentSession
   - Lost on restart

2. **Custom ChatHistoryProvider:**
   - Implement for third-party storage
   - Full control

3. **In-Service (Azure AI Foundry):**
   - ID stored, history in cloud
   - Managed persistence

#### Session Persistence

```python
# Serialize session
state = session.serialize()

# Restore later
session = agent.deserialize_session_async(state)
```

#### AutoGen Studio Limitation

> "In version 0.4, agents start each run without access to prior session history"

Users report memory regression from earlier versions.

#### Agent Framework Migration

Microsoft Agent Framework (new) provides:
- Automatic persistence (no manual state)
- Granular recovery (any superstep)
- Human-in-the-loop integration
- Fault tolerance

#### AIOS Compatibility

| Aspect | Status | Notes |
|--------|--------|-------|
| Stack | ⚠️ Partial | Azure-centric |
| License | ✅ MIT | Commercial use OK |
| SDKs | ✅ Python + C# | Multi-language |
| Complexity | 🔴 High | Enterprise focus |

**Recommendation:** Monitorar Agent Framework para patterns enterprise.

---

### 3.6 Graphiti (Zep)

**Repository:** https://github.com/getzep/graphiti
**Stars:** 3,000+
**License:** Apache 2.0
**Last Activity:** Active

#### Focus: Real-Time Knowledge Graphs

```
Graphiti Retrieval
│
├── Semantic Embeddings (vector similarity)
├── Keyword Search (BM25)
└── Graph Traversal (relationships)
```

#### Key Features

1. **Custom Ontology:**
   ```python
   class Person(BaseModel):
       name: str
       role: str
       department: str
   ```

2. **Parallel Processing:**
   - Handles large datasets
   - Scalable ingestion

3. **Dynamic Updates:**
   - Optimized for frequent changes
   - Real-time graph updates

#### Database Support

- Neo4j
- Amazon Neptune
- FalkorDB
- Kuzu

#### LLM Support

- OpenAI
- Anthropic Claude
- Groq
- OpenAI-compatible APIs

#### AIOS Compatibility

| Aspect | Status | Notes |
|--------|--------|-------|
| Stack | ⚠️ Partial | Needs graph DB |
| License | ✅ Apache 2.0 | Commercial use OK |
| SDKs | ✅ Python | Only Python |
| Complexity | ⚠️ Medium | Graph DB expertise |

**Recommendation:** Absorver para knowledge graph se Epic 7 incluir relations.

---

### 3.7 OpenMemory

**Repository:** https://github.com/CaviraOSS/OpenMemory
**Stars:** 500+
**License:** MIT
**Last Activity:** Active

#### Unique Value: MCP Native

```
OpenMemory for MCP Clients
│
├── Claude Desktop
├── GitHub Copilot
├── Codex
├── Antigravity
└── Any MCP-aware client
```

#### Architecture

```
Hierarchical Memory Decomposition
│
├── Temporal Graph (time-based connections)
├── Structured Storage (explainable)
└── MCP Server (tool exposure)
```

#### Key Features

1. **Self-Hosted:**
   - Full control
   - Privacy-first

2. **Explainable:**
   - Human-readable structure
   - Auditable memory

3. **LangGraph Native:**
   - First-class integration
   - Graph-based workflows

#### Use Cases

- Agents
- Copilots
- Journaling systems
- Knowledge workers
- Coding assistants ← AIOS relevant

#### AIOS Compatibility

| Aspect | Status | Notes |
|--------|--------|-------|
| Stack | ✅ Compatible | Standard tools |
| License | ✅ MIT | Most permissive |
| SDKs | ✅ Python | MCP server |
| Complexity | ✅ Low | Simple to integrate |

**Recommendation:** Considerar para MCP integration no AIOS.

---

## 4. Comparative Analysis Matrix

### By Use Case

| Use Case | Best Option | Runner-Up | Notes |
|----------|-------------|-----------|-------|
| General Purpose | Mem0 | Letta | Mem0 more mature |
| Multi-Agent | CrewAI | AutoGen | CrewAI simpler |
| Knowledge Graph | Graphiti | Mem0 | Graphiti specialized |
| Claude/MCP | OpenMemory | Mem0 | OpenMemory native |
| Self-Improvement | Letta | Mem0 | Letta self-editing |
| Enterprise | AutoGen | Mem0 | AutoGen Azure-native |

### By Technical Requirement

| Requirement | Best Option | Notes |
|-------------|-------------|-------|
| pgvector support | Mem0 | Native support |
| Supabase support | Mem0 | First-class |
| Node.js SDK | Mem0 | Only option |
| Graph relations | Graphiti | Specialized |
| MCP protocol | OpenMemory | Only option |
| Self-hosted | All | All support self-host |

### By License Compatibility

| License | Projects | AIOS OK? |
|---------|----------|----------|
| MIT | LangChain, CrewAI, AutoGen, OpenMemory | ✅ Yes |
| Apache 2.0 | Mem0, Letta, Graphiti | ✅ Yes |

All projects are compatible with commercial use.

---

## 5. Research Papers & Academic Context

### Memory Matters More (January 2026)

> "Event-Centric Memory as a Logic Map for Agent Searching and Reasoning"

Key insight: Memory improves both retrieval AND reasoning.

### MAGMA (2026)

> "Multi-Graph based Agentic Memory Architecture for AI Agents"

Multi-graph approach for complex agent systems.

### EverMemOS (2026)

> "Self-Organizing Memory Operating System for Structured Long-Horizon Reasoning"

Self-organizing memory for long tasks.

### MemGPT Paper (2023, UC Berkeley)

Original research that spawned Letta. Core concepts:
- LLM OS analogy
- Memory hierarchy
- Self-editing via tools

### Awesome-Memory-for-Agents

**Repository:** https://github.com/TsinghuaC3I/Awesome-Memory-for-Agents

Curated collection of papers and projects. Excellent for deep research.

---

## 6. Recommendation for AIOS

### Architecture Decision

```
AIOS Memory Architecture (Proposed)
│
├── Inspiration: Mem0 (hybrid store)
│   └── Vector (pgvector) + Relations (memory_relations)
│
├── Inspiration: ClawdBot (three-layer)
│   └── Entities + Daily + Persistent
│
├── Inspiration: Letta (self-editing)
│   └── Agents can update their own memory
│
└── Inspiration: OpenMemory (MCP)
    └── Memory as MCP tool for interoperability
```

### Implementation Priority

| Phase | Feature | Source | Epic |
|-------|---------|--------|------|
| 1 | Unified Memory Schema | ClawdBot | Epic 7 |
| 1 | Vector embeddings | Mem0 | Epic 7 |
| 2 | Memory relations | Graphiti | Epic 7 |
| 2 | Memory Flush | ClawdBot | Epic 7 |
| 3 | MCP server | OpenMemory | Future |
| 3 | Self-editing | Letta | Future |

### Do NOT Adopt

| Project | Reason |
|---------|--------|
| LangChain Memory | Deprecated, moving target |
| AutoGen Studio | Azure lock-in, enterprise focus |
| Full Letta | Too opinionated, framework replacement |

### Partially Adopt (Patterns Only)

| Project | What to Take |
|---------|--------------|
| CrewAI | Multi-agent memory patterns |
| Graphiti | Ontology definition approach |
| OpenMemory | MCP exposure pattern |

---

## 7. Sources

- [Mem0 GitHub](https://github.com/mem0ai/mem0)
- [Mem0 Documentation](https://mem0.ai/)
- [Mem0 Research](https://mem0.ai/research)
- [Letta GitHub](https://github.com/letta-ai/letta)
- [Letta Documentation](https://docs.letta.com/)
- [LangChain Memory Docs](https://python.langchain.com/docs/versions/migrating_memory/)
- [CrewAI Memory Docs](https://docs.crewai.com/en/concepts/memory)
- [AutoGen Memory Docs](https://microsoft.github.io/autogen/stable//user-guide/agentchat-user-guide/memory.html)
- [Graphiti GitHub](https://github.com/getzep/graphiti)
- [OpenMemory GitHub](https://github.com/CaviraOSS/OpenMemory)
- [Awesome-Memory-for-Agents](https://github.com/TsinghuaC3I/Awesome-Memory-for-Agents)
- [AWS Mem0 Integration Blog](https://aws.amazon.com/blogs/database/build-persistent-memory-for-agentic-ai-applications-with-mem0-open-source-amazon-elasticache-for-valkey-and-amazon-neptune-analytics/)

---

*OSS Landscape Analysis completed by @analyst (Atlas) | 2026-02-04*

— Atlas, investigando a verdade 🔎
