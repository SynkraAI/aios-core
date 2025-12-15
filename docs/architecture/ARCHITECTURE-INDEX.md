# AIOS Architecture Documentation Index

**Version:** 2.1.1
**Last Updated:** 2025-12-14
**Status:** Official Reference

---

## 📋 Document Navigation

This index provides navigation to all architecture documentation for AIOS v2.1.

> **Note:** Official framework documentation (coding-standards, tech-stack, source-tree) has been consolidated in `docs/framework/`. See [Framework README](../framework/README.md) for details.

---

## 📁 Directory Structure

```
docs/architecture/
├── ARCHITECTURE-INDEX.md     # This file
├── analysis/                 # Technical analysis documents
│   ├── mcp-optimization-1mcp.md
│   ├── mcp-context-optimization-strategy.md
│   ├── mcp-solution-comparison-checklist.md
│   ├── tools-system-analysis-log.md
│   ├── tools-system-gap-analysis.md
│   ├── Squads-dependency-analysis.md
│   ├── Squads-structure-inventory.md
│   ├── scripts-consolidation-analysis.md
│   ├── subdirectory-migration-impact-analysis.md
│   └── repository-strategy-analysis.md
├── decisions/                # Architectural decisions (ADRs)
├── [other docs]              # Project-specific documentation
└── [deprecated]              # source-tree.md, coding-standards.md, tech-stack.md
                              # (use docs/framework/ versions instead)
```

---

## 🎯 Quick Links by Topic

### Core Architecture

| Document | Description | Status |
|----------|-------------|--------|
| [High-Level Architecture](./high-level-architecture.md) | Overview of AIOS v2.1 architecture | ✅ Current |
| [Module System](./module-system.md) | 4-module modular architecture | ✅ Current |
| [Multi-Repo Strategy](./multi-repo-strategy.md) | 3 public + 2 private repos | ✅ Current |
| [Multi-Repo Strategy (PT-BR)](./multi-repo-strategy-pt.md) | Portuguese version | ✅ Current |

### MCP & Integrations

| Document | Description | Status |
|----------|-------------|--------|
| [MCP System Diagrams](./mcp-system-diagrams.md) | MCP architecture diagrams | ✅ Current |
| [MCP Optimization (1MCP)](./analysis/mcp-optimization-1mcp.md) | Token optimization with 1MCP | ✅ Current |
| [MCP API Keys Management](./mcp-api-keys-management.md) | API key management | ✅ Current |
| [MCP Context Optimization](./analysis/mcp-context-optimization-strategy.md) | Context optimization | ✅ Current |
| [MCP Solution Comparison](./analysis/mcp-solution-comparison-checklist.md) | Solution checklist | ✅ Current |

### Agent System

| Document | Description | Status |
|----------|-------------|--------|
| [Agent Responsibility Matrix](./agent-responsibility-matrix.md) | Agent roles and responsibilities | ✅ Current |
| [Agent Tool Integration](./agent-tool-integration-guide.md) | Tool integration guide | ✅ Current |
| [Agent Config Audit](./agent-config-audit.md) | Configuration audit | ✅ Current |

### Tools & Scripts

| Document | Description | Status |
|----------|-------------|--------|
| [Utility Integration Guide](./utility-integration-guide.md) | Utility integration | ✅ Current |
| [Scripts Consolidation](./analysis/scripts-consolidation-analysis.md) | Scripts analysis | ✅ Current |
| [Internal Tools Analysis](./internal-tools-analysis.md) | Tools analysis | ✅ Current |

### Squad System (formerly Squads)

| Document | Description | Status |
|----------|-------------|--------|
| [Squads Structure](./analysis/Squads-structure-inventory.md) | Structure inventory | ⚠️ Update terminology |
| [Squads Dependencies](./analysis/Squads-dependency-analysis.md) | Dependency analysis | ⚠️ Update terminology |
| [Architect Validation](./architect-Squad-rearchitecture.md) | Rearchitecture | ⚠️ Update terminology |

### Migration & Strategy

| Document | Description | Status |
|----------|-------------|--------|
| [Repository Migration Plan](./repository-migration-plan.md) | Migration execution plan | ✅ Current |
| [Repository Strategy Analysis](./analysis/repository-strategy-analysis.md) | Strategy analysis | ✅ Current |
| [Subdirectory Migration](./analysis/subdirectory-migration-impact-analysis.md) | Impact analysis | ✅ Current |
| [Dependency Resolution](./dependency-resolution-plan.md) | Dependency resolution | ✅ Current |

### Special Topics

| Document | Description | Status |
|----------|-------------|--------|
| [Synkra Rebranding](./SYNKRA-REBRANDING-SPECIFICATION.md) | Framework vs Product naming | ✅ Current |
| [CodeRabbit Integration](./coderabbit-integration-decisions.md) | Code review integration | ✅ Current |
| [Memory Layer](./memory-layer.md) | Memory system architecture | ✅ Current |
| [Hybrid Ops PV Mind](./hybrid-ops-pv-mind-integration.md) | PV Mind integration | ✅ Current |

### Reference Documents (Official in docs/framework/)

| Document | Description | Status |
|----------|-------------|--------|
| [Tech Stack](../framework/tech-stack.md) | Technology decisions | ✅ Current |
| [Coding Standards](../framework/coding-standards.md) | Code standards | ✅ Current |
| [Source Tree](../framework/source-tree.md) | Project structure | ✅ Current |

> **Note:** These are linked to `docs/framework/` which is the official location. The copies in `docs/architecture/` are deprecated.

### Analysis Documents (analysis/)

| Document | Description | Status |
|----------|-------------|--------|
| [Tools System Analysis](./analysis/tools-system-analysis-log.md) | Analysis log | 📦 Archive candidate |
| [Tools System Gap Analysis](./analysis/tools-system-gap-analysis.md) | Gap analysis | 📦 Archive candidate |

### Legacy & Archived

| Document | Description | Status |
|----------|-------------|--------|
| [Introduction](./introduction.md) | Original intro (v2.0) | 📦 Archive candidate |
| [MVP Components](./mvp-components.md) | MVP components (v2.0) | 📦 Archive candidate |
| [Tools System Brownfield](./tools-system-brownfield.md) | Brownfield analysis | 📦 Archive candidate |
| [Tools System Schema](./tools-system-schema-refinement.md) | Schema refinement | 📦 Archive candidate |
| [Tools System Handoff](./tools-system-handoff.md) | Handoff notes | 📦 Archive candidate |
| [Technical Review Greeting](./technical-review-greeting-system-unification.md) | Greeting system | 📦 Archive candidate |
| [Schema Comparison](./schema-comparison-sqlite-supabase.md) | DB schema comparison | 📦 Archive candidate |

---

## 🏗️ Architecture Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     AIOS v2.1 ARCHITECTURE                              │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    MULTI-REPO STRUCTURE                          │   │
│   │                                                                  │   │
│   │   SynkraAI/aios-core ◄───── Central Hub                       │   │
│   │          │                    - Framework core                   │   │
│   │          │                    - 11 base agents                   │   │
│   │          │                    - Discussions hub                  │   │
│   │          │                                                       │   │
│   │   ┌──────┴───────┐                                               │   │
│   │   │              │                                               │   │
│   │   ▼              ▼                                               │   │
│   │ aios-squads   mcp-ecosystem                                      │   │
│   │ (MIT)         (Apache 2.0)                                       │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    MODULAR ARCHITECTURE                          │   │
│   │                                                                  │   │
│   │   .aios-core/                                                    │   │
│   │   ├── core/           ← Framework foundations                    │   │
│   │   ├── development/    ← Agents, tasks, workflows                 │   │
│   │   ├── product/        ← Templates, checklists                    │   │
│   │   └── infrastructure/ ← Scripts, tools, integrations             │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    QUALITY GATES 3 LAYERS                        │   │
│   │                                                                  │   │
│   │   Layer 1: Pre-commit ──► Layer 2: PR ──► Layer 3: Human        │   │
│   │   (Husky/lint-staged)    (CodeRabbit)    (Strategic Review)     │   │
│   │        30%                  +50%              +20%               │   │
│   │                        (80% automated)                           │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📚 Reading Order for New Contributors

### Quick Start (30 min)
1. [High-Level Architecture](./high-level-architecture.md)
2. [Module System](./module-system.md)
3. [Multi-Repo Strategy](./multi-repo-strategy.md)

### Deep Dive (2-3 hours)
1. All Quick Start documents
2. [Agent Responsibility Matrix](./agent-responsibility-matrix.md)
3. [MCP System Diagrams](./mcp-system-diagrams.md)
4. [CodeRabbit Integration](./coderabbit-integration-decisions.md)
5. [Tech Stack](./tech-stack.md)

### Complete Mastery (1-2 days)
1. All documents in this index
2. Related standards in `.aios-core/docs/standards/`
3. Implementation stories in `docs/stories/v2.1/`

---

## 🔗 Related Documentation

### Standards (`.aios-core/docs/standards/`)
- [AIOS-LIVRO-DE-OURO-V2.1-COMPLETE.md](../../.aios-core/docs/standards/AIOS-LIVRO-DE-OURO-V2.1-COMPLETE.md)
- [QUALITY-GATES-SPECIFICATION.md](../../.aios-core/docs/standards/QUALITY-GATES-SPECIFICATION.md)
- [STORY-TEMPLATE-V2-SPECIFICATION.md](../../.aios-core/docs/standards/STORY-TEMPLATE-V2-SPECIFICATION.md)

### Stories
- [Sprint 5 - OSR Stories](../stories/v2.1/sprint-5/)
- [Sprint 6 - Release Stories](../stories/v2.1/sprint-6/)

---

## 📝 Document Status Legend

| Status | Meaning |
|--------|---------|
| ✅ Current | Up-to-date with v2.1 |
| ⚠️ Update needed | Needs terminology or content update |
| 📦 Archive candidate | Should be moved to `_archived/` |
| 🆕 New | Recently created |

---

**Last Updated:** 2025-12-14
**Maintainer:** @architect (Aria)
