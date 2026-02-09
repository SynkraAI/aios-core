# CLAUDE.md V3 Changes Specification

> **Document:** Mudanças necessárias para migração V2 → V3
> **Date:** 2026-01-28
> **Status:** Draft
> **Related:** Epic 5, Story 5.6

---

## Overview

Este documento especifica todas as mudanças necessárias no `CLAUDE.md` e sistema de commands para suportar a integração com Auto-Claude (V3).

---

## 1. Mudanças no CLAUDE.md

### 1.1 Version Bump

```diff
- *Synkra AIOS Claude Code Configuration v2.0*
+ *Synkra AIOS Claude Code Configuration v3.0*
+ *Auto-Claude Integration Enabled*
```

### 1.2 Nova Seção: Auto-Claude Integration

**Adicionar após "Core Framework Understanding":**

```markdown
---

## Auto-Claude Integration (V3)

### Worktree-Based Development

Cada story é desenvolvida em um **worktree Git isolado**:

| Evento | Ação |
|--------|------|
| Story → "In Progress" | Worktree criado automaticamente |
| Story → "Done" | Merge oferecido, cleanup opcional |
| Story → "Cancelled" | Worktree deletado |

**Worktree Structure:**
\`\`\`
.aios/worktrees/
├── STORY-42/           ← Cópia completa do projeto
│   └── (isolated work)
└── STORY-43/
    └── (isolated work)
\`\`\`

**Branch Naming:** `aios/{story-id}`

### Spec Pipeline (Opcional)

Para tasks complexas, ativar spec pipeline de 4-6 fases:

| Fase | Tipo | Output |
|------|------|--------|
| Discovery | Determinístico | `project_index.json` |
| Requirements | Interativo | `requirements.json` |
| Context | Determinístico | `context.json` |
| Planning | AI + Fallback | `implementation_plan.json` |

### Recovery Strategies

Quando uma task falha, o sistema aplica recovery:

| Strategy | Descrição | Max Retries |
|----------|-----------|-------------|
| `retry_same` | Tentar novamente igual | 3 |
| `retry_with_variation` | Tentar approach diferente | 2 |
| `escalate` | Escalar para human review | 1 |

---
```

### 1.3 Atualização: Framework Structure

**Modificar seção existente:**

```diff
## 📁 Framework Structure

\`\`\`
aios-core/
├── .aios-core/                    # Framework source (committed)
+│   ├── core/
+│   │   └── worktree/             # NEW: WorktreeManager
│   ├── development/agents/        # Agent definitions
│   ├── development/tasks/         # Task workflows
+│   ├── development/scripts/      # Migration & utility scripts
│   ├── product/templates/         # Document templates
│   └── product/checklists/        # Validation checklists
+│   └── schemas/                   # NEW: V3 JSON schemas
+│       ├── agent-v3-schema.json
+│       └── task-v3-schema.json
│
├── .claude/                       # Claude Code configuration
│   ├── commands/AIOS/agents/      # Agent commands (skills)
│   ├── rules/                     # Additional rules
│   └── hooks/                     # Governance hooks
│
+├── .aios/                         # Runtime state (gitignored)
+│   ├── worktrees/                 # Per-story worktrees
+│   │   └── {story-id}/
+│   ├── dashboard/
+│   │   └── status.json           # Dashboard communication
+│   └── backups/                   # Migration backups
│
├── docs/                          # All documentation (versioned)
│   ├── stories/                   # Development stories
│   ├── architecture/              # System architecture
│   └── guides/                    # User guides
└── src/                           # Framework utilities
\`\`\`
```

### 1.4 Atualização: Agent System

**Modificar seção existente:**

```diff
## 👤 Agent System

### Agent Activation
- Agents: `@dev`, `@qa`, `@architect`, `@pm`, `@po`, `@sm`, `@analyst`
- Master: `@aios-master`
+- Migration: `@refactor-agent`   # NEW: V3 migration specialist
- Commands: `*help`, `*create-story`, `*task {name}`, `*exit`

### Agent Context
When an agent is active:
- Follow that agent's specific persona and expertise
- Use the agent's designated workflow patterns
- Maintain the agent's perspective throughout the interaction
+- Check for active worktree and operate within it
+- Use spec pipeline if task complexity warrants

+### Agent Version
+All agents follow V3 schema with:
+- `version: "3.0"` in definition
+- `autoClaude` section for worktree/spec config
+- `recovery` strategy defined
```

### 1.5 Atualização: Development Workflow

**Modificar seção existente:**

```diff
## 🔧 Development Workflow

### Story-Driven Development
-1. Work from stories in `docs/stories/`
-2. Update progress: `[ ]` → `[x]`
-3. Track changes in File List section
-4. Follow acceptance criteria exactly
+1. Story assigned → worktree created automatically
+2. Work within worktree: `.aios/worktrees/{story-id}/`
+3. Update progress: `[ ]` → `[x]`
+4. Track changes in File List section
+5. Follow acceptance criteria exactly
+6. Story done → merge to main, cleanup worktree

### Version Control
- Use Git for versioning (never create backup files)
- No version suffixes in filenames (v1, v2, v3)
-- Commit before major changes
+- Commit within worktree before major changes
+- Merge via dashboard or `*merge-story {id}` command
- Conventional commits: `feat:`, `fix:`, `docs:`, `chore:`
- Reference story ID: `feat: implement IDE detection [Story 2.1]`
+
+### Worktree Commands
+- `*worktree-status` - Show active worktrees
+- `*worktree-create {story-id}` - Create worktree manually
+- `*merge-story {story-id}` - Merge worktree to main
+- `*cleanup-stale` - Remove worktrees > 30 days old
```

### 1.6 Nova Seção: Migration Commands

**Adicionar nova seção:**

```markdown
---

## 🔄 Migration (V2 → V3)

### Refactor Agent
Use `@refactor-agent` for migration tasks:

| Command | Description |
|---------|-------------|
| `*inventory` | List all assets and dependencies |
| `*analyze {asset}` | Deep analysis of single asset |
| `*migrate-agent {id}` | Transform agent to V3 |
| `*migrate-task {id}` | Transform task to V3 |
| `*migrate-batch {type}` | Migrate all of type |
| `*validate {asset}` | Check V3 compliance |
| `*diff {asset}` | Show V2 vs V3 diff |
| `*rollback {asset}` | Restore from backup |

### Migration Order
1. Agents (foundation)
2. Tasks (depends on agents)
3. Templates
4. Checklists
5. IDE Sync

### Pilot First
Always test with pilot assets before batch:
- Pilot agents: `@dev`, `@qa`
- Validate all commands work
- Then proceed with batch

---
```

---

## 2. Mudanças no Commands System

### 2.1 Novos Commands Files

**Criar:**

- `.claude/commands/AIOS/agents/refactor-agent.md` - Migration specialist

### 2.2 Atualizações em Agents Existentes

Cada agent em `.claude/commands/AIOS/agents/` precisa:

```diff
agent:
  name: Dev
  id: dev
+  version: "3.0"
  title: Full Stack Developer
  icon: 💻

+  autoClaude:
+    worktree:
+      enabled: true
+      autoCreate: on_story_start
+      autoCleanup: on_story_done
+    specPipeline:
+      enabled: false  # Enable per-agent as needed
+    recovery:
+      maxRetries: 3
+      strategy: retry_with_variation
```

### 2.3 IDE Sync Update

O script `apply-inline-greeting-all-agents.js` precisa:

1. Detectar versão do agent (V2 vs V3)
2. Gerar commands compatíveis com V3 schema
3. Incluir `autoClaude` section no sync

---

## 3. Novos Arquivos a Criar

### 3.1 Schemas

| File                                      | Purpose                  |
| ----------------------------------------- | ------------------------ |
| `.aios-core/schemas/agent-v3-schema.json` | V3 agent validation      |
| `.aios-core/schemas/task-v3-schema.json`  | V3 task validation       |
| `.aios-core/schemas/worktree-schema.json` | Worktree info validation |

### 3.2 Scripts

| File                                                              | Purpose               |
| ----------------------------------------------------------------- | --------------------- |
| `.aios-core/core/worktree/worktree-manager.js`                    | WorktreeManager class |
| `.aios-core/infrastructure/scripts/migration/inventory-assets.js` | Asset inventory       |
| `.aios-core/infrastructure/scripts/migration/migrate-agent.js`    | Agent migration       |
| `.aios-core/infrastructure/scripts/migration/migrate-task.js`     | Task migration        |

### 3.3 Agent Definitions

| File                                              | Purpose              |
| ------------------------------------------------- | -------------------- |
| `.aios-core/development/agents/refactor-agent.md` | Migration specialist |

---

## 4. Backward Compatibility

### 4.1 V2 Assets Still Work

Durante a migração, assets V2 continuam funcionando:

- Agent sem `version` field = V2 (default behavior)
- Agent com `version: "3.0"` = V3 (new behavior)

### 4.2 Gradual Rollout

```
Phase 1: Add V3 infrastructure (schemas, scripts)
Phase 2: Migrate pilot agents (@dev, @qa)
Phase 3: Validate pilot success
Phase 4: Batch migrate remaining assets
Phase 5: Remove V2 compatibility code (future)
```

---

## 5. Checklist de Implementação

### CLAUDE.md Updates

- [ ] Version bump to V3.0
- [ ] Add "Auto-Claude Integration" section
- [ ] Update "Framework Structure"
- [ ] Update "Agent System"
- [ ] Update "Development Workflow"
- [ ] Add "Migration Commands" section

### Commands System

- [ ] Create `refactor-agent.md`
- [ ] Add `version: "3.0"` to all agents
- [ ] Add `autoClaude` section to all agents
- [ ] Update IDE Sync script

### Infrastructure

- [ ] Create V3 schemas
- [ ] Create WorktreeManager
- [ ] Create migration scripts

---

_Specification created by Morgan (PM Agent) - AIOS Framework_
_Related: Epic 5, Story 5.6_
