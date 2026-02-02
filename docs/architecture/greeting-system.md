# Greeting System Architecture

> **Version:** 1.0
> **Date:** 2026-02-01
> **Status:** Active
> **Related PRD:** [Agent Foundation Refactor](../prd/aios-agent-foundation-refactor.md) - Story 2.2

---

## Overview

O sistema de greeting do AIOS é composto por dois scripts complementares que trabalham juntos para gerar saudações contextuais para agentes.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Agent Activation                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │    Agent STEP 3 Instruction   │
              └───────────────────────────────┘
                    │                   │
           ┌────────┴────────┐ ┌────────┴────────┐
           │ Direct Class    │ │ CLI Wrapper     │
           │ Invocation      │ │ Invocation      │
           └────────┬────────┘ └────────┬────────┘
                    │                   │
                    │                   ▼
                    │    ┌──────────────────────────┐
                    │    │  generate-greeting.js   │
                    │    │  (160 lines)            │
                    │    │                          │
                    │    │  1. Load core config     │
                    │    │  2. Load agent def       │
                    │    │  3. Load session context │
                    │    │  4. Load project status  │
                    │    └──────────┬───────────────┘
                    │               │
                    ▼               ▼
              ┌─────────────────────────────────┐
              │      greeting-builder.js        │
              │      (938 lines)                │
              │                                 │
              │  class GreetingBuilder {        │
              │    buildGreeting(agentDef,      │
              │                  history)       │
              │  }                              │
              │                                 │
              │  Features:                      │
              │  - Session type detection       │
              │  - Git config status (5min cache)│
              │  - Project status loading       │
              │  - Command visibility filtering │
              │  - Workflow suggestions         │
              │  - Adaptive formatting          │
              └─────────────────────────────────┘
                              │
                              ▼
              ┌─────────────────────────────────┐
              │     Contextual Greeting          │
              │     (displayed to user)          │
              └─────────────────────────────────┘
```

---

## Component Details

### greeting-builder.js (Core)

**Location:** `.aios-core/development/scripts/greeting-builder.js`
**Lines:** 938
**Type:** ES Module with `GreetingBuilder` class

**Responsibilities:**
- Build contextual greetings based on agent definition and conversation history
- Detect session type (new/existing/workflow)
- Check git configuration status (with 5-minute cache)
- Load project status automatically
- Filter commands by visibility metadata (full/quick/key)
- Suggest workflow next steps if in recurring pattern
- Format adaptive greeting automatically

**Key Method:**
```javascript
async buildGreeting(agent, context = {}) {
  // Returns formatted greeting string
}
```

**Usage:**
```javascript
const builder = new GreetingBuilder();
const greeting = await builder.buildGreeting(agentDefinition, context);
```

**Performance:**
- Target: <150ms with timeout protection
- Caching for expensive operations (git status)

### generate-greeting.js (CLI Orchestrator)

**Location:** `.aios-core/development/scripts/generate-greeting.js`
**Lines:** 160
**Type:** CLI wrapper script

**Responsibilities:**
- Orchestrate context loading before greeting generation
- Load core configuration
- Load agent definition via `AgentConfigLoader`
- Load session context via `SessionContextLoader`
- Load project status
- Call `GreetingBuilder.buildGreeting()` with unified context

**Why It Exists:**
Some agents need a CLI-based invocation pattern where all context loading is handled externally. This wrapper provides that interface while still using the core `GreetingBuilder` class.

---

## Agent STEP 3 Patterns

### Pattern A: Direct Class Invocation (Majority of agents)

```yaml
activation-instructions:
  - STEP 3: |
      Build intelligent greeting using .aios-core/development/scripts/greeting-builder.js
      The buildGreeting(agentDefinition, conversationHistory) method:
        - Detects session type (new/existing/workflow) via context analysis
        - Checks git configuration status (with 5min cache)
        - Loads project status automatically
        - Filters commands by visibility metadata (full/quick/key)
        - Suggests workflow next steps if in recurring pattern
        - Formats adaptive greeting automatically
```

**Used by:** @dev, @qa, @architect, @pm, @po, @sm, @analyst, @aios-master, @squad-creator

### Pattern B: CLI Wrapper Invocation

```yaml
activation-instructions:
  - STEP 3: |
      Run greeting-builder.js script with args
      Script handles: config loading, session context, project status
      Returns formatted greeting
```

**Used by:** @devops, @data-engineer, @ux-design-expert

---

## Design Decision

### Why Two Scripts?

**Question:** Por que não consolidar tudo em um único script?

**Answer:** Os dois scripts servem propósitos complementares:

| Script | Propósito | Quando Usar |
|--------|-----------|-------------|
| `greeting-builder.js` | Core logic, usado diretamente ou via wrapper | Quando o agente/IDE já tem contexto carregado |
| `generate-greeting.js` | CLI orchestrator | Quando precisa carregar contexto externamente via CLI |

**Analogia:** É como a diferença entre uma biblioteca (`greeting-builder.js`) e um CLI que usa essa biblioteca (`generate-greeting.js`).

### Consistency Guarantee

Ambos os padrões produzem o mesmo resultado porque:
1. Pattern B chama Pattern A internamente
2. `generate-greeting.js` apenas orquestra o carregamento de contexto
3. A lógica de formatação está 100% em `greeting-builder.js`

---

## Validation

Para validar que ambas abordagens funcionam corretamente:

```bash
# Test direct invocation (simulated)
node -e "
  const { GreetingBuilder } = require('./.aios-core/development/scripts/greeting-builder.js');
  const builder = new GreetingBuilder();
  const greeting = await builder.buildGreeting(agentDef, {});
  console.log(greeting);
"

# Test CLI wrapper
node .aios-core/development/scripts/generate-greeting.js --agent=dev
```

---

## Related Documentation

- [Command Authority Matrix](./command-authority-matrix.md)
- [Agent Foundation Refactor PRD](../prd/aios-agent-foundation-refactor.md)

---

*Greeting System Architecture v1.0 - AIOS Framework*
*Generated: 2026-02-01*
*Investigation: Story 2.2 AC 0 RESOLVED*
