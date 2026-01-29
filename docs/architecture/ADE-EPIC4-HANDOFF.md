# ADE Epic 4 Handoff - Execution Engine

> **From:** Quinn (@qa) - QA Agent
> **To:** Aria (@architect) - Solution Architect
> **Date:** 2026-01-28
> **Status:** Epic 3 COMPLETE → Epic 4 UNLOCKED

---

## Executive Summary

Epic 3 (Spec Pipeline) está **100% completo** e aprovado pelo QA Gate. O Epic 4 (Execution Engine) está **desbloqueado** para início imediato.

**Epic 4 é 70% Prompt Engineering, 30% Código** - @architect lidera 4 stories, @dev implementa 2 scripts.

---

## Prerequisites Validated ✅

| Dependency          | Status        | Evidence                                            |
| ------------------- | ------------- | --------------------------------------------------- |
| Spec Pipeline Tasks | ✅ Complete   | 5 tasks em `.aios-core/development/tasks/spec-*.md` |
| Spec Workflow       | ✅ Complete   | `spec-pipeline.yaml` orquestrando 5 fases           |
| autoClaude V3       | ✅ Functional | Todas tasks com `autoClaude.version: "3.0"`         |
| JSON Schemas        | ✅ Defined    | requirements, complexity, research, critique        |

---

## Epic 4: Execution Engine Overview

**Tipo:** 30% Código, **70% Prompt Engineering**

O Execution Engine transforma specs aprovados em código funcional através de:

```
Approved Spec → Implementation Plan → Context Files → Subtask Execution → Verification
```

---

## Stories Breakdown

| Story | Deliverable                     | Tipo      | Agent      | Priority |
| ----- | ------------------------------- | --------- | ---------- | -------- |
| 4.1   | `plan-create-implementation.md` | Task .md  | @architect | P0       |
| 4.2   | `plan-create-context.md`        | Task .md  | @architect | P0       |
| 4.3   | `plan-execute-subtask.md`       | Task .md  | @architect | P0       |
| 4.4   | `self-critique-checklist.md`    | Checklist | @architect | P0       |
| 4.5   | `subtask-verifier.js`           | JS Script | @dev       | P1       |
| 4.6   | `plan-tracker.js`               | JS Script | @dev       | P1       |

**@architect leads:** Stories 4.1, 4.2, 4.3, 4.4 (prompt engineering)
**@dev needed:** Stories 4.5, 4.6 (JavaScript scripts)

---

## Story 4.1: Implementation Plan Generator

**Objetivo:** Gerar planos de implementação executáveis a partir de specs

**Task:** `plan-create-implementation.md`

**Inputs:**

- spec.md (approved)
- complexity.json
- files-context (optional)

**Outputs:**

- `docs/stories/{story-id}/plan/implementation.yaml`

**Schema:**

```yaml
storyId: STORY-42
createdAt: 2026-01-28T10:00:00Z
createdBy: '@architect'
status: pending
complexity: STANDARD

phases:
  - id: phase-1
    name: Setup
    subtasks:
      - id: '1.1'
        description: Create store module
        service: frontend
        files:
          - src/stores/authStore.ts
        verification:
          type: command
          command: npm run typecheck
        status: pending

  - id: phase-2
    name: Implementation
    subtasks:
      - id: '2.1'
        description: Implement login flow
        service: frontend
        files:
          - src/components/LoginButton.tsx
          - src/hooks/useAuth.ts
        verification:
          type: command
          command: npm test -- --grep "auth"
        status: pending
```

**Rules:**

- 1 serviço por subtask (frontend, backend, infra)
- Máximo 3 arquivos por subtask
- Cada subtask deve ter verificação

**autoClaude Pattern:**

```yaml
autoClaude:
  version: '3.0'
  pipelinePhase: exec-plan
  deterministic: true
  composable: true
```

---

## Story 4.2: Project Context Generator

**Objetivo:** Gerar arquivos de contexto para o coder entender o codebase

**Task:** `plan-create-context.md`

**Inputs:**

- Project root
- spec.md
- implementation.yaml

**Outputs:**

- `docs/stories/{story-id}/plan/project-context.yaml`
- `docs/stories/{story-id}/plan/files-context.yaml`

**project-context.yaml Schema:**

```yaml
project:
  name: aios-core
  stack:
    runtime: Node.js 18+
    language: TypeScript
    testing: Vitest

  conventions:
    naming: camelCase for files, PascalCase for classes
    imports: absolute paths via @/ alias

  patterns:
    state: Zustand stores in src/stores/
    api: fetch wrapper in src/lib/api.ts
```

**files-context.yaml Schema:**

```yaml
relevantFiles:
  - path: src/stores/userStore.ts
    purpose: Similar store pattern to follow
    keyPatterns:
      - createStore usage
      - selector pattern

  - path: src/components/Button.tsx
    purpose: UI component pattern reference
    keyPatterns:
      - Props typing
      - CSS modules import
```

**autoClaude Pattern:**

```yaml
autoClaude:
  version: '3.0'
  pipelinePhase: exec-context
  deterministic: true
  composable: true
```

---

## Story 4.3: Subtask Executor (13 Steps)

**Objetivo:** Executar subtasks seguindo 13 steps estruturados

**Task:** `plan-execute-subtask.md`

**CRITICAL: 13 Steps do Coder Agent**

```markdown
## Mandatory Execution Steps

1. **Load Context**
   - Read project-context.yaml
   - Read files-context.yaml

2. **Read Implementation Plan**
   - Load implementation.yaml
   - Identify current subtask

3. **Understand Current Subtask**
   - Parse subtask requirements
   - Identify files to modify/create

4. **Plan Approach**
   - Decide implementation strategy
   - Consider patterns from context

5. **Write Code**
   - Implement the subtask
   - Follow conventions from context

     5.5 **SELF-CRITIQUE (MANDATORY)**

   - Predicted bugs?
   - Edge cases handled?
   - Error handling complete?
   - Security issues?

6. **Run Tests**
   - Execute verification command
   - Check for failures

     6.5 **SELF-CRITIQUE (MANDATORY)**

   - Pattern adherence?
   - No hardcoded values?
   - Tests added?
   - Docs updated?

7. **Fix Issues**
   - Address test failures
   - Re-run if needed

8. **Run Linter**
   - Execute lint command
   - Check for violations

9. **Fix Lint Issues**
   - Address lint errors
   - Re-run if needed

10. **Verify Manually**
    - If verification.type requires browser/api
    - Human confirmation if needed

11. **Update Plan Status**
    - Mark subtask as completed in implementation.yaml
    - Record attempt in recovery system

12. **Commit Changes**
    - Stage files
    - Create atomic commit
    - Reference subtask ID

13. **Signal Completion**
    - Output completion summary
    - Suggest next subtask
```

**autoClaude Pattern:**

```yaml
autoClaude:
  version: '3.0'
  pipelinePhase: exec-subtask
  elicit: false
  deterministic: true

  selfCritique:
    required: true
    checklistRef: self-critique-checklist.md
    steps: [5.5, 6.5]

  recovery:
    trackAttempts: true
    maxAttempts: 3
```

---

## Story 4.4: Self-Critique Checklist

**Objetivo:** Checklist obrigatório para auto-revisão

**Checklist:** `checklists/self-critique-checklist.md`

**Structure:**

```markdown
# Self-Critique Checklist

## Step 5.5: Post-Implementation Critique

### Bugs & Edge Cases

- [ ] Identified at least 3 potential bugs
- [ ] Considered at least 3 edge cases
- [ ] Added error handling for all external calls
- [ ] Handled null/undefined cases

### Security

- [ ] No hardcoded credentials
- [ ] Input validation present
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities

## Step 6.5: Post-Test Critique

### Pattern Adherence

- [ ] Follows project patterns from context
- [ ] Uses existing utilities/helpers
- [ ] Consistent naming conventions

### Quality

- [ ] No console.logs left
- [ ] No commented-out code
- [ ] Tests cover happy path + edge cases
- [ ] Documentation updated if public API changed

### Config

- [ ] No hardcoded URLs/values
- [ ] Uses environment variables
- [ ] Configurable where needed
```

**Output:**

- `docs/stories/{story-id}/plan/self-critique-{subtask-id}.json`

---

## Story 4.5: Subtask Verifier (JS Script)

**Objetivo:** Verificação automática de subtasks

**Script:** `.aios-core/infrastructure/scripts/subtask-verifier.js`

**Verification Types:**

```javascript
const verifiers = {
  command: async (config) => {
    // Run shell command, check exit code
    const result = execSync(config.command);
    return { pass: true, output: result };
  },

  api: async (config) => {
    // Make HTTP request, check response
    const res = await fetch(config.url, config.options);
    return {
      pass: res.status === config.expectedStatus,
      output: await res.json(),
    };
  },

  browser: async (config) => {
    // Use Playwright to verify UI
    const browser = await playwright.chromium.launch();
    const page = await browser.newPage();
    // ... verification logic
    return { pass: true, screenshot: 'path' };
  },

  e2e: async (config) => {
    // Run e2e test suite
    const result = execSync(config.testCommand);
    return { pass: result.exitCode === 0, output: result };
  },
};
```

**Agent:** @dev implements this

---

## Story 4.6: Plan Progress Tracker (JS Script)

**Objetivo:** Tracking visual de progresso

**Script:** `.aios-core/infrastructure/scripts/plan-tracker.js`

**Output Example:**

```
📊 Implementation Progress: STORY-42
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 1: Setup        ▓▓▓▓▓▓▓▓▓▓ 100% (2/2)
Phase 2: Implement    ▓▓▓▓▓▓░░░░  60% (3/5)
Phase 3: Testing      ░░░░░░░░░░   0% (0/3)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: 50% (5/10 subtasks)
Status: IN_PROGRESS
Current: 2.4 - Implement error handling
```

**Agent:** @dev implements this

---

## Recommended Execution Order

1. **4.1 + 4.2** - Create plan and context generators (can be parallel)
2. **4.4** - Create self-critique checklist (needed by 4.3)
3. **4.3** - Create subtask executor (depends on 4.4)
4. **4.5 + 4.6** - @dev implements JS scripts (can be parallel)

```
┌─────────────────────────────────────────────────────────────┐
│  Phase 1 (Parallel):     4.1 ───┐                           │
│                          4.2 ───┼──► Phase 2: 4.4           │
│                                 │                           │
│  Phase 3:                4.3 ◄──┘                           │
│                                                             │
│  Phase 4 (@dev, parallel): 4.5                              │
│                            4.6                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Patterns

### Task V3 Template for Epic 4

```yaml
autoClaude:
  version: '3.0'
  pipelinePhase: exec-{phase}
  deterministic: true|false
  elicit: false
  composable: true

  execution:
    canCreatePlan: true # 4.1
    canCreateContext: true # 4.2
    canExecute: true # 4.3
    canVerify: true # 4.5

  selfCritique:
    required: true
    checklistRef: self-critique-checklist.md

  recovery:
    trackAttempts: true
    maxAttempts: 3
```

### Pipeline Phase Enum (Extended)

```
# Spec Pipeline (Epic 3)
spec-gather    # @pm
spec-assess    # @architect
spec-research  # @analyst
spec-write     # @pm
spec-critique  # @qa

# Execution Pipeline (Epic 4)
exec-plan      # @architect - create implementation plan
exec-context   # @architect - create context files
exec-subtask   # @dev - execute subtask
exec-verify    # @dev - verify subtask
exec-track     # system - track progress
```

---

## Success Criteria

- [ ] Implementation plan generator creates valid YAML
- [ ] Context generator extracts relevant patterns
- [ ] Subtask executor follows all 13 steps
- [ ] Self-critique is mandatory (cannot skip without flag)
- [ ] Verifier supports 4 types (command, api, browser, e2e)
- [ ] Tracker shows visual progress
- [ ] End-to-end: spec → plan → execution → verified code

---

## Integration with Epic 3

Epic 4 **consumes** outputs from Epic 3:

```
Epic 3 Output              →  Epic 4 Input
──────────────────────────────────────────────
spec.md (APPROVED)         →  plan-create-implementation
complexity.json            →  phase complexity
research.json              →  dependencies to install
critique.json (APPROVED)   →  validation that spec is ready
```

---

## QA Gate for Epic 4

After completing Epic 4, run:

```
@qa *gate epic-4-execution-engine
```

**Validation:**

- All 4 tasks validate against task-v3-schema
- Both JS scripts execute without errors
- E2E test: "Execute subtask from approved spec" → working code

---

## Files to Create

```
.aios-core/development/tasks/
├── plan-create-implementation.md    # Story 4.1
├── plan-create-context.md           # Story 4.2
└── plan-execute-subtask.md          # Story 4.3

.aios-core/development/checklists/
└── self-critique-checklist.md       # Story 4.4

.aios-core/infrastructure/scripts/
├── subtask-verifier.js              # Story 4.5
└── plan-tracker.js                  # Story 4.6
```

---

## Related Documents

- PRD: `docs/prd/aios-autonomous-development-engine.md`
- Auto-Claude Analysis: `docs/architecture/AUTO-CLAUDE-ANALYSIS-COMPLETE.md`
- Epic Stories: `docs/stories/aios-core-ade/epic-4-execution-engine.md`
- Epic 3 Handoff: `docs/architecture/ADE-EPIC3-HANDOFF.md`

---

_Handoff prepared by Quinn (@qa) - Guardian of Quality_
_Date: 2026-01-28_
_Predecessor: Epic 3 QA Gate PASSED_
