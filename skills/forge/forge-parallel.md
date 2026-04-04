# Forge Parallel — Multi-Agent Story Execution

> Stories independentes rodam ao mesmo tempo. Git worktrees mantêm tudo isolado.

---

## Prerequisites

- Feature 3 (Story Dependency Graph) must be implemented — `phases.2.dependency_graph` must exist in state.json
- `config.parallel.enabled` must be `true` (opt-in, disabled by default)
- Git repository must be clean (no uncommitted changes) before parallel execution starts

---

## 1. Detect Parallelizable Stories

At the start of Phase 3, after determining the story execution order:

### Step 1: Read dependency graph

```
dependency_graph.levels = [
  ["1.1", "1.4"],   // Level 0: base stories (no dependencies)
  ["1.2"],           // Level 1: depends on Level 0
  ["1.3", "2.1"]     // Level 2: depends on Level 0 + 1
]
```

### Step 2: Identify parallel candidates

For each dependency level with **2 or more stories**:
- These stories have no mutual dependencies (by definition — they're at the same level)
- They CAN run simultaneously in separate git worktrees
- Limit to `config.parallel.max_concurrent_agents` (default: 3) stories at a time

### Step 3: Decision

If parallelizable stories found AND `config.parallel.enabled`:
- Enter Parallel SDC mode for this dependency level
- Show: "Detectei {N} stories paralelizáveis no Level {L}. Rodando em paralelo."

If NOT enabled or no parallelizable stories:
- Use standard sequential SDC (no change from current behavior)

---

## 2. Parallel SDC Subloop

For each dependency level with parallel candidates:

### Step 1: Create worktrees

For each story to run in parallel:
```bash
git worktree add .forge-wt-{story_id} HEAD
```

This creates an isolated copy of the repository for each story.
The main worktree stays clean.

### Step 2: Dispatch agents simultaneously

Dispatch @dev for EACH story at the same time using **multiple Agent tool calls in a single message**:

```
Agent tool call 1: @dev implements Story 1.1 in worktree .forge-wt-1.1
Agent tool call 2: @dev implements Story 1.4 in worktree .forge-wt-1.4
```

Each @dev agent receives:
- Story file
- Project context (from state.json)
- Worktree path (tells @dev to work in `.forge-wt-{story_id}/` not the main directory)
- Isolation flag: `isolation: "worktree"` on the Agent tool call

### Step 3: Show parallel progress

```
🔨 Parallel Build (Level 0):
  ├── Story 1.1: "Auth" — @dev implementing... (worktree: .forge-wt-1.1)
  ├── Story 1.4: "Landing" — @dev implementing... (worktree: .forge-wt-1.4)
  └── Waiting for both to complete...
```

### Step 4: Collect results

Wait for ALL parallel agents to complete. For each:
- If @dev succeeded: mark story ready for @qa
- If @dev failed: enter error recovery (standard Error Recovery Tree)

### Step 5: Run @qa sequentially

After all parallel @dev complete, run @qa for each story **sequentially**:
- @qa needs to see the full context, including changes from other parallel stories
- Running @qa in parallel could miss cross-story integration issues

### Step 6: Merge worktrees

After @qa passes for all stories at this level:

```bash
# For each worktree:
git merge .forge-wt-{story_id}
```

### Step 7: Handle merge conflicts

If merge conflict:
- **Strategy: checkpoint** (default):
  ```
  ━━━ 🔴 CHECKPOINT — Conflito de Merge ━━━
  
  Stories {A} e {B} geraram conflito em: {files}
  
  > 1. Resolver manualmente (mostrar diff)
  > 2. Chamar @architect para resolver
  > 3. Abortar paralelo, re-executar sequencialmente
  ```
- **Strategy: auto-merge**: Try `git merge --strategy-option=theirs` (later story wins). Log as CONCERNS.
- **Strategy: abort**: Undo all merges, re-execute stories sequentially.

### Step 8: Cleanup

After successful merge:
```bash
git worktree remove .forge-wt-{story_id}
```

### Step 9: Veto conditions

Run standard veto conditions (lint, typecheck, test) on the MERGED result:
- This catches integration issues between parallel stories
- If veto fails: dispatch @dev to fix in the main worktree

---

## 3. Progress Display

```
🔨 Build Loop (with parallel execution)

  Level 0: ██████████ 100%
    ├── Story 1.1: "Auth" ✅ (4m 32s)
    └── Story 1.4: "Landing" ✅ (3m 15s)
    ⏱️ Parallel: 4m 32s (saved ~3m 15s vs sequential)

  Level 1: ██████░░░░ 60%
    └── Story 1.2: "Feed" 🔄 @dev implementing...

  Level 2: ░░░░░░░░░░ 0%
    ├── Story 1.3: "Dashboard" ○ waiting (← 1.1, 1.2)
    └── Story 2.1: "Likes" ○ waiting (← 1.1, 1.2)
```

---

## Safety Rules

1. **Never parallelize stories with shared database migrations** — if two stories modify the same schema, they MUST run sequentially
2. **Max concurrent agents** — never exceed `config.parallel.max_concurrent_agents`
3. **Clean git state required** — if uncommitted changes exist, fall back to sequential
4. **Worktree cleanup is mandatory** — even if the run is interrupted, cleanup worktrees on resume
5. **Veto checks on merged result** — individual story tests might pass, but merged result might not
