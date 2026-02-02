# Command Authority Matrix

> **Version:** 1.0
> **Last Updated:** 2026-02-01
> **Status:** Active

---

## Overview

This document defines the authoritative owner for each AIOS command. Following the principle **"1 command = 1 owner"**, each command should be owned by exactly one agent to prevent confusion and ensure predictable behavior.

---

## Authority Matrix

```text
┌────────────────────────────────────────────────────────────────────┐
│                    COMMAND AUTHORITY MATRIX                        │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  PLANNING PHASE                                                    │
│  ├── *create-project-brief ──────────────► @analyst (ÚNICO)       │
│  ├── *brainstorm ─────────────────────────► @analyst (ÚNICO)       │
│  ├── *create-prd ─────────────────────────► @pm (ÚNICO)            │
│  ├── *create-brownfield-prd ──────────────► @pm (ÚNICO)            │
│  ├── *create-architecture ────────────────► @architect (ÚNICO)     │
│  └── *create-epic ────────────────────────► @pm (ÚNICO)            │
│                                                                    │
│  DEVELOPMENT PHASE                                                 │
│  ├── *draft ─────────────────────────────► @sm (ÚNICO)             │
│  ├── *create-story ──────────────────────► @sm (ÚNICO)             │
│  ├── *develop ───────────────────────────► @dev (ÚNICO)            │
│  ├── *fix-qa-issues ─────────────────────► @dev (ÚNICO)            │
│  └── *create-suite ──────────────────────► @qa (ÚNICO)             │
│                                                                    │
│  QA PHASE                                                          │
│  ├── *review ────────────────────────────► @qa (ÚNICO)             │
│  ├── *create-fix-request ────────────────► @qa (ÚNICO)             │
│  └── *verify-fix ────────────────────────► @qa (ÚNICO)             │
│                                                                    │
│  DATA PHASE                                                        │
│  ├── *create-schema ─────────────────────► @data-engineer (ÚNICO)  │
│  ├── *create-migration-plan ─────────────► @data-engineer (ÚNICO)  │
│  └── *security-audit ────────────────────► @data-engineer (ÚNICO)  │
│                                                                    │
│  DEVOPS PHASE                                                      │
│  ├── *push ──────────────────────────────► @devops (ÚNICO)         │
│  ├── *create-pr ─────────────────────────► @devops (ÚNICO)         │
│  └── *release ───────────────────────────► @devops (ÚNICO)         │
│                                                                    │
│  SHARED COMMANDS (all agents can use)                              │
│  ├── *help ──────────────────────────────► ALL                     │
│  ├── *guide ─────────────────────────────► ALL                     │
│  ├── *yolo ──────────────────────────────► ALL                     │
│  ├── *exit ──────────────────────────────► ALL                     │
│  ├── *correct-course ────────────────────► ALL (own domain)        │
│  ├── *doc-out ───────────────────────────► ALL                     │
│  ├── *shard-doc ─────────────────────────► ALL                     │
│  ├── *research ──────────────────────────► ALL                     │
│  └── *execute-checklist ─────────────────► ALL                     │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## Detailed Command Ownership

### Planning Commands

| Command | Owner | Description | Delegates To |
| ------- | ----- | ----------- | ------------ |
| `*create-project-brief` | @analyst | Create project brief document | - |
| `*brainstorm` | @analyst | Facilitate brainstorming session | - |
| `*create-prd` | @pm | Create product requirements document | - |
| `*create-brownfield-prd` | @pm | Create PRD for existing projects | - |
| `*create-architecture` | @architect | Design system architecture | @data-engineer for DB |
| `*create-epic` | @pm | Create epic for backlog | - |

### Development Commands

| Command | Owner | Description | Delegates To |
| ------- | ----- | ----------- | ------------ |
| `*draft` | @sm | Draft user story | - |
| `*create-story` | @sm | Create user story from requirements | - |
| `*develop` | @dev | Implement story/feature | - |
| `*fix-qa-issues` | @dev | Fix issues from QA review | - |

### QA Commands

| Command | Owner | Description | Delegates To |
| ------- | ----- | ----------- | ------------ |
| `*review` | @qa | Code review and quality check | - |
| `*create-suite` | @qa | Create test suite | - |
| `*create-fix-request` | @qa | Create fix request for dev | @dev |
| `*verify-fix` | @qa | Verify fix implementation | - |

### Data Commands

| Command | Owner | Description | Delegates To |
| ------- | ----- | ----------- | ------------ |
| `*create-schema` | @data-engineer | Design database schema | - |
| `*create-migration-plan` | @data-engineer | Plan database migration | - |
| `*security-audit` | @data-engineer | Audit database security | - |
| `*apply-migration` | @data-engineer | Run database migration | - |

### DevOps Commands

| Command | Owner | Description | Delegates To |
| ------- | ----- | ----------- | ------------ |
| `*push` | @devops | Push code to remote | - |
| `*create-pr` | @devops | Create pull request | - |
| `*release` | @devops | Create release | - |
| `*deploy` | @devops | Deploy to environment | - |

### Orchestration Commands

| Command | Owner | Description | Delegates To |
| ------- | ----- | ----------- | ------------ |
| `*workflow` | @aios-master | Start workflow | Various |
| `*create-agent` | @aios-master | Create new agent definition | - |
| `*create-task` | @aios-master | Create new task | - |
| `*validate-workflow` | @aios-master | Validate workflow definition | - |

---

## Shared Commands

These commands are available to all agents as they provide common functionality:

| Command | Purpose |
| ------- | ------- |
| `*help` | Show available commands |
| `*guide` | Show usage guide |
| `*yolo` | Toggle confirmation skipping |
| `*exit` | Exit agent mode |
| `*correct-course` | Analyze and correct deviations (own domain) |
| `*doc-out` | Output complete document |
| `*shard-doc` | Break document into parts |
| `*research` | Generate research prompt |
| `*execute-checklist` | Run checklist |
| `*session-info` | Show session details |

---

## Delegation Protocol

When an agent receives a request outside their authority:

1. **Acknowledge** the request
2. **Identify** the authoritative agent
3. **Suggest** delegation: "This is @pm's domain. Use `@pm *create-epic` to create an epic."
4. **Do NOT** execute commands outside your authority

### Example

```text
User: @dev *create-epic

Dev (Dex): Epic creation is @pm's responsibility.
Please use: @pm *create-epic
```

---

## Validation

Use `npm run validate:agents` to verify command uniqueness across all agents.

---

*Command Authority Matrix v1.0 - AIOS Agent Consistency Refactor*
