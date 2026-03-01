# Upwork Profile -- Lucas Lorenzo Savino

> Optimized for the AI/ML Engineering category.
> Awareness Level: Solution-Aware (Stage 3-4). Sophistication: Level 4.
> Strategy: Mechanism-first positioning. Lead with architecture specifics and measurable outcomes to separate from the "I do AI" crowd.

---

## Profile Title

**AI Agent Engineer | Multi-Agent Systems, RAG Pipelines & LLM Orchestration (Python/TypeScript)**

### Why This Title Works:
- "AI Agent Engineer" is a specific role, not a generic "AI Developer"
- The pipe separator lets Upwork's search index the sub-specialties
- "Multi-Agent Systems, RAG Pipelines & LLM Orchestration" names three high-demand verticals
- "(Python/TypeScript)" signals full-stack capability in two words

---

## Professional Overview

```
I build AI systems that run in production -- not demos that break after the first 100 users.

My focus: multi-agent architectures, RAG pipelines, and LLM orchestration systems that companies actually deploy and depend on.

What I bring to the table:

-- Multi-Agent Orchestration: Designed and shipped a 3-agent autonomous grading system that processes academic essays end-to-end. Built the caching layer that cut database queries by 90%.

-- RAG Systems: Built enterprise-grade retrieval-augmented generation with citation tracking, audit trails, and hybrid search (semantic + keyword). Not the "I plugged LangChain into a PDF" variety.

-- Production LLM Integration: I work with LangChain, LangGraph, DSPy, and direct API integrations. I pick the right tool for the job, not the trendiest one.

-- Cross-Platform Automation: Shipped an e-commerce ops agent that connects Shopify, ad platforms, and anomaly detection into a single autonomous workflow.

Stack: Python | LangChain | LangGraph | DSPy | FastAPI | ChromaDB | TypeScript | Node.js | Docker | MCP Protocol

I am a Computer Engineering student (graduating April 2026) and AI/ML Engineering Intern at Petrobras, where I work on production AI systems at scale.

If you need an AI system that works past the demo stage, let's talk.
```

### Copy Notes:
- Opens with a differentiator ("production, not demos") -- this is the big mechanism separator
- Uses double-dash bullets for Upwork formatting
- Each bullet leads with the outcome, then the specifics
- The "not the I plugged LangChain into a PDF variety" line directly addresses sophistication-level-4 buyers who have been burned
- Closes with a single clear CTA

---

## Specialized Profiles (if Upwork allows multiple)

### Profile 1: AI Agent Development
**Title:** AI Agent Engineer | Autonomous Multi-Agent Systems & LLM Orchestration
**Hourly Rate:** $70/hr

### Profile 2: RAG & Knowledge Systems
**Title:** RAG Pipeline Engineer | Enterprise Search, Citations & Audit Trails
**Hourly Rate:** $75/hr

### Profile 3: Automation & Integration
**Title:** AI Automation Engineer | LLM-Powered Workflows, APIs & Data Pipelines
**Hourly Rate:** $65/hr

---

## Skills Tags (select all that apply)

### Primary (top 10):
1. Python
2. LangChain
3. LLM Integration
4. RAG (Retrieval-Augmented Generation)
5. AI Agents
6. FastAPI
7. LangGraph
8. TypeScript
9. Docker
10. Machine Learning

### Secondary:
11. ChromaDB
12. Node.js
13. Vector Databases
14. OpenAI API
15. Anthropic API

---

## Portfolio Descriptions

### Project 1: AI Grading System

**Title:** Autonomous AI Grading System with 3-Agent Architecture

**Short Description:**
Built a multi-agent system where 3 autonomous AI agents collaborate to grade academic essays. Designed a caching layer that reduced database queries by 90%, making the system viable for institutional-scale deployment.

**Detailed Description:**
```
THE PROBLEM:
Manual essay grading at scale is slow, inconsistent, and expensive. Existing AI solutions were single-pass (one LLM call, one grade) with no quality control.

THE SOLUTION:
I architected a 3-agent system where each agent handles a distinct grading dimension:
- Agent 1: Content analysis and factual accuracy
- Agent 2: Structure, coherence, and argumentation
- Agent 3: Synthesis agent that reconciles scores and produces final assessment

KEY ENGINEERING DECISIONS:
- Built a caching layer that checks for previously graded similar submissions before invoking agents, cutting DB queries by 90%
- Each agent operates autonomously with its own prompt chain and evaluation rubric
- The synthesis agent uses a weighted consensus mechanism, not simple averaging

RESULTS:
- 90% reduction in database queries via intelligent caching
- Consistent grading across thousands of submissions
- Modular architecture -- new grading dimensions can be added without rewriting existing agents
```

**Tags:** Python, Multi-Agent Systems, LLM Orchestration, Caching, AI

---

### Project 2: Agentbridge -- Cross-IDE Agent Orchestrator

**Title:** Cross-IDE Agent Workflow Orchestrator with MCP Protocol

**Short Description:**
Built Agentbridge, a cross-IDE agent workflow orchestrator that uses YAML configuration and MCP (Model Context Protocol) to coordinate AI agents across different development environments.

**Detailed Description:**
```
THE PROBLEM:
AI coding agents are siloed in their IDEs. Claude Code doesn't talk to Cursor. Copilot doesn't coordinate with Windsurf. Teams using multiple tools waste time on manual context transfer.

THE SOLUTION:
Agentbridge is a workflow orchestrator that sits above individual IDE agents and coordinates them via:
- YAML-based workflow definitions (declarative, version-controllable)
- MCP protocol for standardized agent communication
- Cross-IDE execution: define once, run across any MCP-compatible agent

KEY ENGINEERING:
- YAML config layer for defining multi-step agent workflows
- MCP protocol integration for standardized tool/resource sharing
- Designed for extensibility -- new IDE agents plug in via MCP server adapters

IMPACT:
- Eliminates manual context-switching between AI agents
- Workflows are declarative and reproducible
- Built on MCP -- the emerging standard for agent interoperability
```

**Tags:** MCP Protocol, TypeScript, YAML, Agent Orchestration, Developer Tools

---

### Project 3: Daily Ops Agent (E-Commerce Automation)

**Title:** E-Commerce Daily Operations Agent with Anomaly Detection

**Short Description:**
Built an autonomous agent that connects Shopify and advertising platforms to automate daily e-commerce operations, including anomaly detection for ad spend and revenue metrics.

**Detailed Description:**
```
THE PROBLEM:
E-commerce operators manually check dashboards, cross-reference ad spend with revenue, and react to problems hours after they happen.

THE SOLUTION:
An autonomous Daily Ops Agent that:
- Pulls data from Shopify and ad platforms via API integrations
- Runs anomaly detection on key metrics (spend, ROAS, conversion rate, inventory)
- Generates daily operational reports with actionable recommendations
- Alerts on statistical anomalies before they become expensive problems

TECHNICAL APPROACH:
- FastAPI backend for API orchestration
- Statistical anomaly detection (not just threshold alerts)
- Scheduled autonomous execution -- runs without human intervention
- Structured output for downstream integrations

RESULTS:
- Fully automated daily operational reporting
- Anomaly detection catches spend/revenue divergences in real-time
- Replaced 2+ hours of daily manual dashboard checking
```

**Tags:** Python, FastAPI, E-Commerce, Shopify API, Anomaly Detection, Automation

---

### Project 4: WhatsApp Agentic Daemon

**Title:** WhatsApp as an AI Agent Interface with File Execution

**Short Description:**
Turned WhatsApp into a full AI agent interface. Users send messages, the daemon routes to appropriate AI agents, executes tasks (including file operations), and returns results -- all within WhatsApp.

**Detailed Description:**
```
THE PROBLEM:
Most AI interfaces require users to learn new tools. WhatsApp is already on every phone, but existing WhatsApp bots are stateless FAQ responders.

THE SOLUTION:
A persistent daemon that transforms WhatsApp into a capable AI agent interface:
- Persistent conversation state and context across sessions
- File execution: users can send files and trigger processing pipelines
- Agent routing: messages are classified and routed to specialized agents
- Full bidirectional communication with real-time status updates

TECHNICAL ARCHITECTURE:
- Daemon process with persistent state management
- WhatsApp Business API integration
- Agent routing layer for multi-capability dispatch
- File handling pipeline (receive, process, return results)
- Designed for reliability: auto-reconnection, session recovery
```

**Tags:** Python, WhatsApp API, AI Agents, Daemon Architecture, Automation

---

### Project 5: RAG Knowledge Base System

**Title:** Enterprise RAG System with Citations and Audit Trails

**Short Description:**
Built an enterprise-grade RAG knowledge base system with source citations, audit trails, and hybrid search for an academic grading use case.

**Detailed Description:**
```
THE PROBLEM:
Standard RAG implementations retrieve chunks and hope for the best. Enterprise use cases require knowing exactly which source informed each answer, and a trail showing how the system arrived at its conclusions.

THE SOLUTION:
A production RAG system built for accountability:
- Hybrid search combining semantic (vector) and keyword (BM25) retrieval
- Source citation tracking: every generated statement maps back to source documents
- Audit trail: full logging of retrieval decisions, re-ranking, and generation steps
- ChromaDB for vector storage with metadata-rich indexing

ENGINEERING HIGHLIGHTS:
- Citation extraction pipeline that traces generated text back to specific source passages
- Audit trail captures: query → retrieval → re-ranking → generation → citations
- Hybrid search with configurable semantic/keyword weighting
- Built for compliance-heavy environments where "the AI said so" is not acceptable

USE CASE:
Deployed for academic grading where every assessment must be traceable and auditable.
```

**Tags:** RAG, ChromaDB, Python, Vector Search, Enterprise AI, LangChain

---

## Profile Photo & Presentation Notes

- Use a professional headshot with a neutral or tech-themed background
- Keep the profile banner clean -- no "AI wizard" graphics
- Employment history: list Petrobras AI/ML internship prominently
- Education: Computer Engineering (expected graduation April 2026)
- Certifications: Add any relevant ones (DeepLearning.AI, LangChain, etc.)

---

## Rate Strategy

| Scenario | Rate | Rationale |
|----------|------|-----------|
| New client, simple project | $60/hr | Entry point, build reviews fast |
| Established client, complex system | $75/hr | Reflects architecture-level work |
| Enterprise RAG / Agent systems | $80/hr | Premium tier for premium deliverables |
| Fixed-price projects | 1.3x hourly estimate | Buffer for scope creep |

### First 3 months priority: Win 5-star reviews at $60/hr. Then raise to $75 baseline.
