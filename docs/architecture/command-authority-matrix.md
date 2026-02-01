# Command Authority Matrix

> **Version:** 1.0
> **Date:** 2026-02-01
> **Status:** Active
> **Related PRD:** [Agent Foundation Refactor](../prd/aios-agent-foundation-refactor.md)

---

## Overview

Este documento define a **autoridade única** para cada comando no AIOS. O princípio fundamental é:

```
1 Comando = 1 Owner
```

Quando múltiplos agentes precisam de uma funcionalidade, o agente não-owner deve **delegar** via handoff protocol.

---

## Command Conflict Resolution

### Conflitos Identificados e Resolvidos

| Command | Conflicting Agents | **Resolved Owner** | Rationale |
|---------|-------------------|-------------------|-----------|
| `*create-epic` | @pm, @po | **@pm** | PM owns product structure |
| `*create-story` | @pm, @po, @sm | **@sm** | SM owns story creation |
| `*correct-course` | @aios-master, @pm, @po, @sm, @architect, @analyst | **@aios-master** | Master orchestrates corrections |
| `*doc-out` | @aios-master, @pm, @po, @architect, @analyst, @data-engineer | **@aios-master** | Master owns generic doc output |
| `*research` | @pm, @architect, @analyst, @data-engineer | **@analyst** | Analyst owns research |
| `*execute-checklist` | @aios-master, @architect, @data-engineer | **@aios-master** | Master orchestrates checklists |
| `*shard-doc` / `*shard-prd` | @aios-master, @pm, @po, @architect | **@pm** | PM owns document structure |
| `*backlog-add` | @qa, @po | **@po** | PO owns backlog |
| `*backlog-review` | @qa, @po | **@po** | PO owns backlog |

---

## Authority Matrix by Category

### 🎯 Framework Management (Owner: @aios-master)

| Command | Description | Can Delegate To |
|---------|-------------|-----------------|
| `*create` | Create AIOS component | - |
| `*modify` | Modify AIOS component | - |
| `*validate-component` | Validate component | - |
| `*deprecate-component` | Deprecate component | - |
| `*analyze-framework` | Analyze framework | - |
| `*list-components` | List components | - |
| `*correct-course` | Course corrections | - |
| `*execute-checklist` | Run any checklist | Specific agent for domain checklist |
| `*doc-out` | Generic document output | - |
| `*kb` | Knowledge base mode | - |
| `*status` | Show context/progress | - |

### 📋 Product Management (Owner: @pm)

| Command | Description | Can Delegate To |
|---------|-------------|-----------------|
| `*create-prd` | Create PRD (greenfield) | - |
| `*create-brownfield-prd` | Create PRD (brownfield) | - |
| `*create-epic` | Create epic structure | - |
| `*shard-prd` | Break PRD into parts | - |
| `*gather-requirements` | Elicit requirements | - |
| `*write-spec` | Write specification | - |

### 📝 Story Management (Owner: @sm)

| Command | Description | Can Delegate To |
|---------|-------------|-----------------|
| `*draft` / `*create-story` | Create user story | - |
| `*story-checklist` | Run story checklist | - |

### 📊 Product Owner / Backlog (Owner: @po)

| Command | Description | Can Delegate To |
|---------|-------------|-----------------|
| `*backlog-add` | Add to backlog | - |
| `*backlog-review` | Review backlog | - |
| `*backlog-summary` | Backlog summary | - |
| `*backlog-prioritize` | Prioritize items | - |
| `*backlog-schedule` | Schedule to sprint | - |
| `*stories-index` | Regenerate index | - |
| `*validate-story-draft` | Validate story | - |
| `*sync-story` | Sync to PM tool | - |
| `*pull-story` | Pull from PM tool | - |

### 🔬 Research & Analysis (Owner: @analyst)

| Command | Description | Can Delegate To |
|---------|-------------|-----------------|
| `*research` | Deep research | - |
| `*brainstorm` | Structured brainstorm | - |
| `*elicit` | Advanced elicitation | - |
| `*create-project-brief` | Project brief | - |
| `*perform-market-research` | Market research | - |
| `*create-competitor-analysis` | Competitor analysis | - |
| `*research-deps` | Research dependencies | - |
| `*extract-patterns` | Extract code patterns | - |

### 🏛️ Architecture (Owner: @architect)

| Command | Description | Can Delegate To |
|---------|-------------|-----------------|
| `*create-full-stack-architecture` | Full stack design | - |
| `*create-backend-architecture` | Backend design | - |
| `*create-front-end-architecture` | Frontend design | - |
| `*create-brownfield-architecture` | Brownfield design | - |
| `*assess-complexity` | Complexity assessment | - |
| `*create-plan` | Implementation plan | - |
| `*create-context` | Project context | - |
| `*map-codebase` | Codebase mapping | - |
| `*analyze-project-structure` | Structure analysis | - |

### 💻 Development (Owner: @dev)

| Command | Description | Can Delegate To |
|---------|-------------|-----------------|
| `*develop` | Implement story | - |
| `*develop-yolo` | Autonomous mode | - |
| `*develop-interactive` | Interactive mode | - |
| `*develop-preflight` | Planning mode | - |
| `*execute-subtask` | Execute subtask | - |
| `*verify-subtask` | Verify subtask | - |
| `*track-attempt` | Track attempt | - |
| `*rollback` | Rollback changes | - |
| `*build` | Complete build | - |
| `*build-autonomous` | Autonomous build | - |
| `*build-resume` | Resume build | - |
| `*build-status` | Build status | - |
| `*fix-qa-issues` | Fix QA issues | - |
| `*apply-qa-fixes` | Apply QA fixes | - |
| `*run-tests` | Run tests | - |
| `*create-service` | Create service | - |
| `*waves` | Parallel analysis | - |
| `*capture-insights` | Session insights | - |
| `*gotcha` / `*gotchas` | Manage gotchas | - |

### ✅ Quality Assurance (Owner: @qa)

| Command | Description | Can Delegate To |
|---------|-------------|-----------------|
| `*code-review` | Automated review | - |
| `*review` | Story review | - |
| `*review-build` | 10-phase QA review | - |
| `*gate` | Quality gate | - |
| `*create-fix-request` | Fix request for @dev | @dev receives |
| `*critique-spec` | Critique spec | - |
| `*security-check` | Security scan | - |
| `*test-design` | Test scenarios | - |
| `*trace` | Requirements trace | - |
| `*analyze` | Cross-artifact analysis | - |
| `*nfr-assess` | NFR validation | - |
| `*risk-profile` | Risk assessment | - |
| `*validate-libraries` | Library validation | - |
| `*validate-migrations` | Migration validation | - |

### 🚀 DevOps (Owner: @devops) - EXCLUSIVE

| Command | Description | Can Delegate To |
|---------|-------------|-----------------|
| `*push` | **Git push (EXCLUSIVE)** | - |
| `*create-pr` | Create PR | - |
| `*pre-push` | Pre-push checks | - |
| `*release` | Create release | - |
| `*configure-ci` | Setup CI/CD | - |
| `*cleanup` | Cleanup branches | - |
| `*create-worktree` | Create worktree | - |
| `*list-worktrees` | List worktrees | - |
| `*merge-worktree` | Merge worktree | - |
| `*remove-worktree` | Remove worktree | - |
| `*cleanup-worktrees` | Cleanup worktrees | - |
| `*setup-github` | GitHub infrastructure | - |
| `*setup-mcp-docker` | MCP Docker setup | - |
| `*add-mcp` / `*remove-mcp` | MCP management | - |
| `*migrate-agent` | Migrate agent | - |
| `*migrate-batch` | Batch migration | - |
| `*analyze-paths` | Path analysis | - |
| `*inventory-assets` | Asset inventory | - |
| `*check-docs` | Doc link check | - |

### 🗄️ Data Engineering (Owner: @data-engineer)

| Command | Description | Can Delegate To |
|---------|-------------|-----------------|
| `*create-schema` | Database schema | - |
| `*create-rls-policies` | RLS policies | - |
| `*create-migration-plan` | Migration plan | - |
| `*design-indexes` | Index design | - |
| `*model-domain` | Domain modeling | - |
| `*apply-migration` | Run migration | - |
| `*dry-run` | Test migration | - |
| `*seed` | Seed data | - |
| `*snapshot` | Schema snapshot | - |
| `*rollback` (db) | DB rollback | - |
| `*smoke-test` | DB tests | - |
| `*security-audit` | DB security | - |
| `*analyze-performance` | Query analysis | - |
| `*setup-database` | Database setup | - |

### 🎨 UX Design (Owner: @ux-design-expert)

| Command | Description | Can Delegate To |
|---------|-------------|-----------------|
| `*wireframe` | Wireframes | - |
| `*generate-ui-prompt` | AI UI prompts | - |
| `*create-front-end-spec` | Frontend spec | - |
| `*audit` | UI pattern audit | - |
| `*consolidate` | Pattern consolidation | - |
| `*tokenize` | Design tokens | - |
| `*setup` | Design system | - |
| `*migrate` | Migration strategy | - |
| `*bootstrap-shadcn` | Component library | - |
| `*build` | Build component | - |
| `*compose` | Compose molecule | - |
| `*a11y-check` | Accessibility | - |

### 🎪 Squad Management (Owner: @squad-creator)

| Command | Description | Can Delegate To |
|---------|-------------|-----------------|
| `*design-squad` | Design squad | - |
| `*create-squad` | Create squad | - |
| `*validate-squad` | Validate squad | - |
| `*list-squads` | List squads | - |
| `*migrate-squad` | Migrate squad | - |
| `*analyze-squad` | Analyze squad | - |
| `*extend-squad` | Extend squad | - |
| `*download-squad` | Download squad | - |
| `*publish-squad` | Publish squad | - |

---

## Utility Commands (Available to All)

Estes comandos são utilitários disponíveis em todos os agentes:

| Command | Description |
|---------|-------------|
| `*help` | Show commands |
| `*guide` | Show usage guide |
| `*session-info` | Session details |
| `*yolo` | Toggle confirmations |
| `*exit` | Exit agent mode |

---

## Handoff Protocol

### When to Delegate

Se um agente recebe um request que pertence a outro owner:

```yaml
Format: "For {task}, delegate to @{owner} using *{command}"

Examples:
  - @pm receives "create story" → "For story creation, delegate to @sm using *draft"
  - @dev receives "push code" → "For git push, delegate to @devops using *push"
  - @po receives "course correction" → "For course corrections, escalate to @aios-master using *correct-course"
```

### Delegation Chain

```
User Request
    ↓
Current Agent
    ↓
[Is this my authority?]
    ↓ YES → Execute
    ↓ NO  → Handoff to Owner
              ↓
          Owner Agent
              ↓
          Execute & Return
```

---

## Validation Rules

O `agent-validator.js` deve verificar:

1. **No Duplicate Commands:** Cada comando deve ter exatamente 1 owner
2. **Handoff Bidirectionality:** Se A delega para B, B deve estar preparado
3. **No Circular Delegation:** A→B→C→A é inválido
4. **All Commands Documented:** Cada comando em agent files deve estar na matrix

---

## Statistics

| Metric | Value |
|--------|-------|
| Total Unique Commands | ~200 |
| Total Agents | 12 |
| Resolved Conflicts | 9 |
| Exclusive Commands | 45 (DevOps, Data-Engineer) |

---

*Command Authority Matrix v1.0 - AIOS Framework*
*Generated: 2026-02-01*
