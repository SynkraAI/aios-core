---
task: Enhancement Workflow
responsavel: "@bob-orchestrator"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - user_goal: Feature or improvement description
  - story_path: Path to existing story (optional)
  - epic_id: Epic to add story to (optional)
Saida: |
  - story_created: Path to new story file
  - execution_result: Result of story execution
  - checkpoint_decision: User choice at checkpoint
Checklist:
  - "[ ] Verify project state is EXISTING_WITH_DOCS"
  - "[ ] Determine if goal needs new story or existing story"
  - "[ ] Create story if needed (@po)"
  - "[ ] Execute 6-phase development cycle"
  - "[ ] Surface checkpoint after completion"
  - "[ ] Update session state"
---

# *enhancement-workflow

Adds new features or improvements to existing AIOS project with full story-driven development cycle.

**PATH C:** EXISTING_WITH_DOCS - Projeto com código e docs AIOS

## Usage

```bash
@bob-orchestrator

*enhancement-workflow --goal "Add JWT authentication"
# → Creates story, executes development cycle

*enhancement-workflow --story docs/stories/active/12.3-jwt-auth.md
# → Executes existing story directly
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--goal` | string | - | Feature description (creates new story) |
| `--story` | path | - | Path to existing story file |
| `--epic` | string | - | Epic ID to add story to |
| `--skip-validation` | flag | false | Skip Phase 1 validation |

## Flow

```mermaid
flowchart TB
    START[Verify EXISTING_WITH_DOCS] --> GOAL{Has goal?}

    GOAL -->|Yes| CREATE[@po: Create story]
    GOAL -->|No| ASK[Ask user objective]

    ASK --> OPT{User choice?}
    OPT -->|Feature| CREATE
    OPT -->|Bug| BUGSTORY[@po: Create bug story]
    OPT -->|Refactor| REFACTORSTORY[@po: Create refactor story]
    OPT -->|Debt| DEBTSTORY[@po: Create debt story]

    CREATE --> CYCLE[6-Phase Development Cycle]
    BUGSTORY --> CYCLE
    REFACTORSTORY --> CYCLE
    DEBTSTORY --> CYCLE

    CYCLE --> P1[Phase 1: VALIDATION - @po]
    P1 --> P2[Phase 2: DEVELOPMENT - executor]
    P2 --> P3[Phase 3: SELF-HEALING - @dev + CodeRabbit]
    P3 --> P4[Phase 4: QUALITY GATE - quality_gate ≠ executor]
    P4 --> P5[Phase 5: PUSH - @devops]
    P5 --> P6[Phase 6: CHECKPOINT - HUMAN]

    P6 --> DECISION{GO/PAUSE/REVIEW/ABORT?}
    DECISION -->|GO| NEXT[Next story]
    DECISION -->|PAUSE| SAVE[Save session]
    DECISION -->|REVIEW| SHOW[Show progress]
    DECISION -->|ABORT| END[End orchestration]
```

## Implementation

### Story Creation (if needed)

```javascript
if (context.userGoal && !context.storyPath) {
  const story = await this.workflowExecutor.execute({
    agent: '@po',
    task: 'create-story',
    inputs: {
      goal: context.userGoal,
      epicId: context.epicId,
      projectContext: await this._loadProjectContext(),
    },
    output: `docs/stories/active/${storyId}.md`,
  });

  context.storyPath = story.path;
}
```

### 6-Phase Development Cycle

```javascript
const phases = [
  { id: 1, name: 'validation', agent: '@po', duration: '10min' },
  { id: 2, name: 'development', agent: 'executor', duration: '2h' },
  { id: 3, name: 'self_healing', agent: '@dev', duration: '30min' },
  { id: 4, name: 'quality_gate', agent: 'quality_gate', duration: '30min' },
  { id: 5, name: 'push', agent: '@devops', duration: '10min' },
  { id: 6, name: 'checkpoint', agent: 'HUMAN', duration: '1-5min' },
];

for (const phase of phases) {
  // Update observability panel
  this.observabilityPanel.updatePhase(phase.id, 'in_progress');

  // Execute phase
  const result = await this.workflowExecutor.executePhase({
    phase: phase.name,
    agent: phase.agent,
    storyPath: context.storyPath,
  });

  // Update session state
  await this.sessionState.recordPhaseChange(
    phase.name,
    context.storyId,
    phase.agent
  );

  // Check for veto conditions
  if (phase.id === 4 && result.action === 'rejected') {
    // Quality gate rejected → return to Phase 2
    return this._handleQualityGateRejection(result);
  }

  this.observabilityPanel.updatePhase(phase.id, 'completed');
}
```

### Phase 6: Checkpoint (Human Decision)

```javascript
const checkpointResult = await this.surfaceChecker.checkpoint({
  story: context.storyId,
  phasesCompleted: 5,
  testsStatus: result.tests,
  prUrl: result.prUrl,
});

return {
  success: true,
  action: 'checkpoint',
  data: {
    message: '✅ Story completa! O que deseja fazer?',
    options: {
      GO: 'Continuar para próxima story',
      PAUSE: 'Pausar e retomar depois',
      REVIEW: 'Ver progresso detalhado',
      ABORT: 'Encerrar sessão',
    },
    context: {
      story: context.storyId,
      duration: result.totalDuration,
      filesChanged: result.filesChanged,
    },
  },
};
```

## Executor Assignment

BOB automatically selects the correct executor based on story type:

| Story Type | Primary Executor | Quality Gate |
|------------|------------------|--------------|
| `code_general` | @dev | @architect |
| `database_schema` | @data-engineer | @dev |
| `api_design` | @architect | @dev |
| `ui_component` | @dev | @ux-design |
| `infrastructure` | @devops | @architect |
| `documentation` | @po | @architect |

**Golden Rule:** `quality_gate ≠ executor` (prevents rubber-stamping)

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `not_enhancement` | Project state wrong | Run *orchestrate-project first |
| `story_not_found` | Invalid --story path | Check path with `ls docs/stories/active/` |
| `quality_gate_failed_3x` | Story rejected 3 times | Surface to human for decision |
| `executor_unavailable` | Agent not responding | Fallback to inline execution |

## Quality Gate Rejection Flow

```javascript
async _handleQualityGateRejection(result) {
  const attempt = (await this.sessionState.get('qg_attempts')) || 0;

  if (attempt >= 3) {
    // Max attempts reached → surface to human
    return {
      action: 'surface',
      data: {
        message: '⚠️ Quality gate falhou 3 vezes. Intervenção necessária.',
        options: ['Revisar manualmente', 'Pular story', 'Abortar'],
        context: result.issues,
      },
    };
  }

  // Return to Phase 2 with feedback
  await this.sessionState.set('qg_attempts', attempt + 1);
  return {
    action: 'retry_development',
    phase: 2,
    feedback: result.feedback,
  };
}
```

## Related

- **Workflow:** enhancement.yaml
- **Task:** checkpoint-story.md (Phase 6)
- **Module:** executor-assignment.js (11.1)
- **Module:** workflow-executor.js (11.3)

---

**Duration:** ~3 hours per story (varies by complexity)
**Cost Estimate:** $3-10 per story
