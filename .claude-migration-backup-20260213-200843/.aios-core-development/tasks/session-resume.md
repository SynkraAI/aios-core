# Session Resume Task

**Story:** 11.5 - Session State Persistence
**Version:** 1.0.0

---

## Purpose

Handle session resume when Bob detects an existing `.session-state.yaml` file.
Presents options to the user and executes the selected action.

---

## Task Definition

```yaml
task: sessionResume
responsible: Bob (pm.md)
atomic_layer: Organism

inputs:
  - field: projectRoot
    type: string
    required: true
    description: Project root directory

outputs:
  - field: action
    type: string
    description: Selected action (continue|review|restart|discard)
  - field: storyPath
    type: string
    description: Path to story to continue (if applicable)
```

---

## Execution Steps

### Step 1: Load Session State

```javascript
const { loadSessionState } = require('.aios-core/core/orchestration');
const sessionState = await loadSessionState(projectRoot);

if (!sessionState) {
  return { action: 'no_session', message: 'No session state found' };
}
```

### Step 2: Check for Crash

```javascript
const { SessionState } = require('.aios-core/core/orchestration');
const manager = new SessionState(projectRoot);
await manager.loadSessionState();

const crashResult = await manager.detectCrash();

if (crashResult.isCrash) {
  console.log(`⚠️ Possível crash detectado!`);
  console.log(`   Última atualização: ${crashResult.minutesSinceUpdate} minutos atrás`);
  console.log(`   Última ação: ${crashResult.lastActionType}`);
  console.log(`   Fase: ${crashResult.lastPhase}`);
}
```

### Step 3: Present Resume Summary

```javascript
const summary = manager.getResumeSummary();
console.log(summary);
```

**Expected Output:**

```
🔄 Sessão anterior detectada!

Epic: Projeto Bob — Interface Única e Orquestração
Progresso: 2 de 6 stories completas
Último story: 11.3 (Development Cycle Workflow)
Fase quando pausou: Implementação

O que você quer fazer?

[1] Continuar de onde parou
[2] Revisar o que foi feito
[3] Recomeçar story 11.3 do zero
[4] Iniciar novo épico (descarta sessão)
```

### Step 4: Elicit User Choice

```yaml
elicit: true
type: select
options:
  - value: continue
    label: "[1] Continuar de onde parou"
  - value: review
    label: "[2] Revisar o que foi feito"
  - value: restart
    label: "[3] Recomeçar story do zero"
  - value: discard
    label: "[4] Iniciar novo épico"
```

### Step 5: Execute Selected Action

```javascript
const { ResumeOption } = require('.aios-core/core/orchestration');

const result = await manager.handleResumeOption(selectedOption);

switch (result.action) {
  case 'continue':
    // Resume from last state
    return {
      action: 'continue',
      storyPath: result.story,
      phase: result.phase,
      message: `Continuando story ${result.story} da fase ${result.phase}`,
    };

  case 'review':
    // Show progress summary
    const summary = result.summary;
    console.log('\n📊 Resumo do Progresso:\n');
    console.log(`Epic: ${summary.epic.title}`);
    console.log(`Progresso: ${summary.progress.percentage}%`);
    console.log(`Stories completas: ${summary.progress.storiesDone.join(', ')}`);
    console.log(`Stories pendentes: ${summary.progress.storiesPending.join(', ')}`);
    // Re-prompt after review
    break;

  case 'restart':
    return {
      action: 'restart',
      storyPath: result.story,
      message: `Recomeçando story ${result.story} do início`,
    };

  case 'discard':
    return {
      action: 'discard',
      message: 'Sessão descartada. Pronto para novo épico.',
    };
}
```

---

## Integration with pm.md

This task should be called from `pm.md` during greeting when session state is detected:

```yaml
# In pm.md greeting-builder integration
on_activation:
  - check: sessionStateExists(projectRoot)
    if_true:
      - execute: session-resume.md
      - use_result: to determine workflow continuation
```

---

## Error Handling

| Error | Recovery |
|-------|----------|
| Corrupted state file | Offer to discard and start fresh |
| Invalid YAML | Parse error with file path, offer discard |
| Missing required fields | Warn and offer partial recovery |

---

## Metadata

```yaml
story: 11.5
version: 1.0.0
dependencies:
  - session-state.js
tags:
  - session
  - resume
  - orchestration
updated_at: 2026-02-05
```
