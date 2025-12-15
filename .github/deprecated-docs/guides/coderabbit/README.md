# CodeRabbit Integration Guide for AIOS

> **Source of Truth** - This documentation is the definitive reference for CodeRabbit integration in AIOS-FULLSTACK.

## Overview

CodeRabbit is an AI-powered code review tool that AIOS uses in two complementary modes:

1. **CLI Mode** - Local validation before commits (used by @qa and @devops agents)
2. **GitHub App Mode** - Automated PR reviews with organizational context (MCPs)

## Documentation Structure

| Document | Purpose | Audience |
|----------|---------|----------|
| [**Integration Guide**](./coderabbit-integration-guide.md) | Complete guide to CodeRabbit in AIOS | All developers |
| [**Configuration Reference**](./coderabbit-configuration-reference.md) | .coderabbit.yaml and agent configs | DevOps, Architects |
| [**Workflows**](./coderabbit-workflows.md) | Step-by-step workflows for agents | @qa, @devops agents |
| [**Troubleshooting**](./coderabbit-troubleshooting.md) | Common issues and solutions | All developers |

## Quick Start

### For @qa Agent (Code Review)

```bash
# Activate QA agent
@qa

# Run code review with self-healing
*review {story-id}
```

### For @devops Agent (Pre-Push & PR)

```bash
# Activate DevOps agent
@devops

# Run quality gate before push
*pre-push

# Create PR with CodeRabbit monitoring
*create-pr
```

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CODERABBIT IN AIOS ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  LOCAL DEVELOPMENT                    GITHUB                        │
│  ─────────────────                    ──────                        │
│                                                                      │
│  @dev implements                                                    │
│       ↓                                                             │
│  @qa *review {story}                                                │
│       ↓                                                             │
│  ┌─────────────────────┐                                            │
│  │ SELF-HEALING LOOP   │                                            │
│  │ ┌─────────────────┐ │                                            │
│  │ │ CodeRabbit CLI  │ │                                            │
│  │ │ (WSL)           │ │                                            │
│  │ └────────┬────────┘ │                                            │
│  │          ↓          │                                            │
│  │ ┌─────────────────┐ │                                            │
│  │ │ Parse Issues    │ │                                            │
│  │ │ CRITICAL/HIGH   │ │                                            │
│  │ └────────┬────────┘ │                                            │
│  │          ↓          │                                            │
│  │ ┌─────────────────┐ │                                            │
│  │ │ Auto-Fix        │ │  ←── Max 3 iterations                      │
│  │ │ (if CRITICAL)   │ │                                            │
│  │ └────────┬────────┘ │                                            │
│  │          ↓          │                                            │
│  │    Loop until OK    │                                            │
│  └─────────────────────┘                                            │
│       ↓                                                             │
│  @devops *pre-push                                                  │
│       ↓                                                             │
│  ┌─────────────────────┐      ┌─────────────────────┐              │
│  │ Quality Gates       │      │ GitHub PR           │              │
│  │ - lint              │  →   │                     │              │
│  │ - test              │      │  ┌───────────────┐  │              │
│  │ - typecheck         │      │  │ CodeRabbit    │  │              │
│  │ - CodeRabbit CLI    │      │  │ GitHub App    │  │              │
│  └─────────────────────┘      │  │ + MCPs        │  │              │
│       ↓                       │  └───────┬───────┘  │              │
│  @devops *create-pr           │          ↓          │              │
│       ↓                       │  ┌───────────────┐  │              │
│  ┌─────────────────────┐      │  │ Contextual    │  │              │
│  │ PR MONITORING       │  ←── │  │ Review with   │  │              │
│  │ - Wait for review   │      │  │ - ClickUp     │  │              │
│  │ - Parse comments    │      │  │ - Context7    │  │              │
│  │ - Report to user    │      │  │ - Sentry      │  │              │
│  └─────────────────────┘      │  └───────────────┘  │              │
│                               └─────────────────────┘              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Key Concepts

### Self-Healing Loop

The self-healing loop is an autonomous cycle where:
1. CodeRabbit CLI reviews code
2. Agent parses CRITICAL/HIGH issues
3. Agent fixes issues automatically
4. Repeat until clean (max 3 iterations)
5. Ignore "nits" (LOW severity)

### MCP Enrichment

Model Context Protocol (MCP) servers provide external context:
- **ClickUp** - Validates PR resolves linked task
- **Context7** - Provides up-to-date library documentation
- **Sentry** - Alerts about known production errors
- **DeepWiki** - Enforces architecture patterns

### Dual-Mode Strategy

| Mode | When | Agent | Purpose |
|------|------|-------|---------|
| **CLI** | Before commit | @qa | Catch issues early, self-healing |
| **GitHub App** | After PR creation | @devops | Contextual audit, team visibility |

## Installation Status

| Component | Status | Location |
|-----------|--------|----------|
| CodeRabbit CLI | ✅ Installed | WSL: `~/.local/bin/coderabbit` |
| Authentication | ✅ Configured | `pedro@allfluence.com.br` |
| GitHub App | ✅ Installed | Repository: `aios-fullstack` |
| .coderabbit.yaml | ✅ Created | Project root: `.coderabbit.yaml` |

## Related Documents

- [Epic 6.3: CodeRabbit Integration](../../epics/epic-6.3-coderabbit-integration.md)
- [@qa Agent Definition](../../../.aios-core/agents/qa.md)
- [@devops Agent Definition](../../../.aios-core/agents/devops.md)

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-28 | Initial unified documentation |

---

**Maintainer:** @architect (Aria)
**Last Updated:** 2025-11-28
