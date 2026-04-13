---
task: Autonomous Navigation
responsavel: "@navigator"
responsavel_type: hybrid
model: sonnet
atomic_layer: task
elicit: false
execute_first:
  script: "node squads/navigator/scripts/navigator/phase-detector.js"
  output_format: yaml
  description: "Script pre-computes: current phase, next phase, required agent. Agent prepares context and delegates."
input_required:
  description: "Agent receives pre-computed phase data. Agent ONLY prepares context for next agent and activates delegation."
  fields: [current_phase, next_phase, required_agent, pipeline_map]
gap_zero:
  veto: "GAP_ZERO_001: Agent MUST run execute_first script BEFORE any analysis. Skipping script = VETO."
Entrada: |
  - current_phase: Detected automatically
  - pipeline_map: navigator-pipeline-map.yaml
Saida: |
  - agent_activation: Agent activated
  - command_executed: Command string
  - context_passed: Context object
Checklist:
  - "[ ] Detect current phase via nav-where-am-i"
  - "[ ] Load pipeline map YAML"
  - "[ ] Get next_phase from map"
  - "[ ] Identify required agent"
  - "[ ] Prepare agent context"
  - "[ ] Activate agent with command"
  - "[ ] Wait for completion or timeout"
  - "[ ] Create checkpoint on success"
veto_conditions:
  - "No roadmap exists for current project → BLOCK (run *map-project first)"
  - "Phase detection returns null/error → BLOCK (run *navigator-doctor)"
  - "Pipeline map missing or invalid YAML → BLOCK (run *navigator-doctor)"
  - "Next phase agent not recognized in AIOS registry → BLOCK (check pipeline map config)"
---

# *auto-navigate

Autonomous navigation — delegate to next agent automatically.

## Usage

```bash
@navigator
*auto-navigate
```

## Workflow

### Step 1: Detect Phase

```javascript
const { detectPhase } = require('./scripts/navigator/phase-detector');
const currentPhase = await detectPhase(projectRoot);
```

### Step 2: Load Pipeline Map

```javascript
const pipelineMap = yaml.load(
  fs.readFileSync('.aiox-core/development/data/navigator-pipeline-map.yaml')
);
```

### Step 3: Get Next Phase

```javascript
const nextPhase = pipelineMap.phases.find(p => p.id === currentPhase.next_phase);
```

### Step 4: Prepare Context

```javascript
const context = {
  project: roadmap.name,
  currentPhase: currentPhase.name,
  nextPhase: nextPhase.name,
  inputs: nextPhase.inputs,
  expectedOutputs: nextPhase.outputs
};
```

### Step 5: Activate Agent

```javascript
const { orchestrator } = require('./scripts/navigator/orchestrator');

await orchestrator.delegateToAgent({
  agent: nextPhase.agent,
  command: nextPhase.command,
  context
});
```

Output:
```
🧭 Navigator — Auto-Navigate

**Current Phase:** 2 — PRD (✅ Concluída)
**Next Phase:** 3 — Arquitetura

Delegating to: @architect
Command: *create-full-stack-architecture

Preparing context...
✓ PRD loaded: docs/prd.yaml
✓ Requirements analyzed

Activating @architect...

---

[Agent @architect is now active]

🏗️ Aria (Archetype) ready. Let's design!

I see you have a completed PRD. I'll create the full-stack architecture.

[... architect continues work ...]
```

### Step 6: Post-Execution

```javascript
// After agent completes
if (success) {
  await createCheckpoint({
    phase: currentPhase.id,
    type: 'auto',
    description: `Phase ${currentPhase.id} completed via auto-navigate`
  });

  await updateRoadmap({
    phaseStatus: {
      [currentPhase.id]: 'completed',
      [nextPhase.id]: 'in_progress'
    }
  });
}
```

## Implementation

```javascript
async function autoNavigate() {
  // 1. Detect current phase
  const currentPhase = await detectPhase();

  // 2. Load pipeline map
  const pipelineMap = await loadPipelineMap();

  // 3. Get next phase
  const nextPhase = pipelineMap.phases.find(
    p => p.id === currentPhase.next_phase
  );

  if (!nextPhase) {
    return { message: 'Pipeline complete! 🎉', done: true };
  }

  // 4. Prepare context
  const context = prepareAgentContext(currentPhase, nextPhase);

  // 5. Delegate to agent
  const result = await orchestrator.delegateToAgent({
    agent: nextPhase.agent,
    command: nextPhase.command,
    context
  });

  // 6. Post-execution
  if (result.success) {
    await createCheckpoint({ phase: currentPhase.id, type: 'auto' });
    await updateRoadmap();
  }

  return result;
}
```

## Related

- **Agent:** @navigator (Vega)
- **Script:** orchestrator.js, phase-detector.js
- **Data:** navigator-pipeline-map.yaml
