# Project-Specific Architecture Decisions

**Status:** Brownfield Project Documentation
**Created:** 2025-01-16 (Story 6.1.2.6)
**Scope:** aios-fullstack brownfield implementation

---

## 📋 Overview

This directory contains **project-specific architecture decisions** for the aios-fullstack brownfield implementation. These documents are specific to this project and will remain here after the Q2 2026 repository split.

**Contrast**: Framework-level documentation lives in [`docs/framework/`](../../framework/) and will migrate to `aios/aios-core` repository.

---

## 📚 Document Inventory

### Decision Analysis Documents
| Document | Purpose |
|----------|---------|
| [decision-analysis-architectural-decision.md](decision-analysis-architectural-decision.md) | Architectural decision analysis |
| [decision-analysis-deep-integration.md](decision-analysis-deep-integration.md) | Deep integration architecture analysis |
| [decision-analysis-flow-diagrams.md](decision-analysis-flow-diagrams.md) | System flow diagrams and analysis |
| [decision-analysis-processing-plan.md](decision-analysis-processing-plan.md) | Processing architecture planning |

### Architectural Reviews
| Document | Purpose |
|----------|---------|
| [architectural-review-contextual-agent-load.md](architectural-review-contextual-agent-load.md) | Contextual agent load system review (Story 6.1.2.5) |

### Domain Architecture
| Document | Purpose |
|----------|---------|
| [etl-architecture.md](etl-architecture.md) | ETL system architecture and design |

---

## 🏗️ Purpose & Scope

### What Belongs Here
- **Project-specific decisions**: Choices made for this brownfield implementation
- **Integration architecture**: How this project integrates external systems
- **Domain-specific architecture**: ETL, data pipelines, custom workflows
- **Architectural reviews**: Analysis of project-specific implementations
- **Decision analysis**: Deep dives into project design choices

### What Doesn't Belong Here (Goes to `docs/framework/`)
- **Framework standards**: Coding standards, tech stack, source tree
- **Portable patterns**: Reusable across all AIOS projects
- **Core configuration**: Framework-level config and structure

---

## 🔄 Migration Context

As part of **Decision 005** (Repository Restructuring), the AIOS codebase will split into multiple repositories in Q2 2026:

### Repository Split Plan
- **`aios/aios-core`**: Framework code + framework docs (`docs/framework/`)
- **`aios/aios-fullstack`**: Brownfield project + project docs (**this directory**)

### What Happens to These Documents
- ✅ **Stay in this repository** permanently
- ✅ **Remain at this path** (`docs/architecture/project-decisions/`)
- ✅ **Continue to evolve** with project-specific decisions

---

## 📖 Usage Guidelines

### For Developers
1. **Read decision docs** before implementing related features
2. **Update docs** when making architectural changes
3. **Reference in PRs** when decisions affect implementation

### For Architects
1. **Document new decisions** in this directory
2. **Review for consistency** with framework standards
3. **Maintain separation** between framework and project concerns

### For Project Managers
1. **Track decision impact** on project timeline and scope
2. **Reference in planning** for cross-system integration
3. **Use in onboarding** new team members

---

## 🔗 Related Directories

- **Framework Documentation**: [`docs/framework/`](../../framework/) - Official AIOS framework standards
- **General Architecture**: [`docs/architecture/`](../) - Top-level architecture overview
- **Decisions**: [`docs/decisions/`](../../decisions/) - Architecture Decision Records (ADRs)
- **Stories**: [`docs/stories/`](../../stories/) - Development stories and implementation plans

---

## 📝 Document Standards

All documents in this directory should:
- **Title**: Clear, descriptive title indicating scope
- **Date**: Creation and last updated dates
- **Purpose**: Explicit statement of what problem is solved
- **Scope**: Clear boundaries of what's covered vs. out of scope
- **Decision**: Explicit decision statements with rationale
- **Alternatives**: Options considered and why they were rejected

---

**Last Updated**: 2025-01-16
**Maintainer**: aios-fullstack Project Team
**Questions?** See [Story 6.1.2.6](../../stories/aios migration/story-6.1.2.6-framework-config-system.md)
