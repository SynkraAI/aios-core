# ADR: SDC and Wave Checkpoint Ownership

## Status

Accepted.

## Context

ADR-011 established `SessionState`, persisted at
`docs/stories/.session-state.yaml`, as the unified store for durable story and
epic orchestration state. Lean Full SDC and Wave Execute subsequently added
synchronous JSON persistence at:

- `.aiox/sdc/{story-id}/state.json`
- `.aiox/waves/{wave-id}/state.json`

Those JSON files make local CLI execution cheap to resume and keep the lean
commands independent from asynchronous YAML persistence. Without an explicit
ownership boundary, however, they can be mistaken for competing lifecycle
stores. In particular, a local phase marked `completed` must not be sufficient
to move a story to `Done`, bypass QA evidence, or override a newer canonical
session.

## Decision

The story file and `SessionState` remain canonical, with separate concerns:

- The story file is the source of truth for the story lifecycle status,
  acceptance evidence, QA verdict, tasks, and audit history.
- `SessionState` is the source of truth for durable epic/story orchestration
  context, including the active story, workflow progress, last action, and
  cross-command recovery state.
- `.aiox/sdc` and `.aiox/waves` contain local, recoverable execution journals.
  They are operational checkpoints and caches, not lifecycle authorities.

An SDC checkpoint may record phase results, verification notes, retry counters,
and the next locally runnable phase. A wave checkpoint may record its plan,
batches, dependency outcomes, child execution summaries, and fan-in progress.
Neither may independently establish a canonical story status, QA approval,
story completion, epic completion, or canonical current-story selection.

### Authority Rules

1. A lifecycle transition is valid only when the story file contains the
   required status and evidence produced by the authorized role. In particular,
   only an approved QA review can establish `Done`.
2. Durable orchestration progress must be written through the `SessionState`
   API. New code must not parse or write `.session-state.yaml` directly.
3. A checkpoint may reflect a canonical transition only after the transition is
   observable in the story file. `SessionState` is then updated through its API
   before another model dispatch depends on that transition.
4. A checkpoint value never wins a conflict with the story file or
   `SessionState`. It is rebuilt, rewound, or discarded instead.
5. Deleting `.aiox/sdc` or `.aiox/waves` may lose local execution convenience,
   but must not change any story or epic lifecycle result.

### Recovery and Reconciliation

Resume performs reconciliation before selecting or dispatching work:

1. Load and validate the bound story file, including its current status and QA
   evidence.
2. Load `SessionState` for durable orchestration context when a session exists.
3. Load the local SDC or wave checkpoint only when its identity, schema, and
   story paths match the current invocation.
4. Compare the checkpoint with the canonical sources. Canonical status and QA
   evidence win; stale phase completions, counters, and child summaries are
   rewound or rebuilt from verifiable artifacts.
5. Resume only the next action legal under the canonical lifecycle. A checkpoint
   marked `completed` cannot skip validation, review, QA re-review, or close
   preconditions.

If canonical synchronization fails, the operational flow stops before a
dependent model dispatch. The checkpoint may preserve a diagnostic such as
`awaiting_canonical_sync`, but it must not claim canonical completion.

### Retention

- Checkpoints are local runtime artifacts under the gitignored `.aiox/`
  directory and must not be committed as lifecycle evidence.
- They may be retained while an SDC or wave is active and for bounded diagnostic
  or resume needs after it finishes.
- Cleanup may remove completed, invalid, or stale checkpoints after reconciling
  them against the story file and `SessionState`.
- Canonical story and session retention policies do not depend on checkpoint
  retention. A missing checkpoint is reconstructed from canonical state and
  verifiable artifacts when possible.
- Checkpoints must not contain credentials, model secrets, or full sensitive
  prompts merely to support recovery.

### Synchronous CLI Compatibility

The existing SDC and wave checkpoint helpers may remain synchronous and continue
to use atomic local JSON writes. This compatibility does not grant them
canonical ownership.

Synchronization with the asynchronous `SessionState` API belongs at an
orchestration boundary that can `await` it. Synchronous checkpoint modules must
not emulate that integration by directly editing `.session-state.yaml`, by
blocking on a child process, or by maintaining a second canonical schema. A
command that cannot complete canonical synchronization must return a
non-success result or leave an explicit pending-sync diagnostic for the
asynchronous boundary to reconcile before dispatch continues.

## Consequences

### Positive

- Lean CLI commands retain fast, synchronous and crash-resilient local progress.
- Story lifecycle authority remains auditable and aligned with agent roles.
- `SessionState` continues to provide one durable orchestration contract across
  commands and agents.
- Runtime JSON can evolve or be deleted without requiring a lifecycle migration.
- Recovery has deterministic conflict precedence instead of last-writer-wins
  behavior across three stores.

### Costs and Constraints

- Orchestrators must perform reconciliation before resume and before dependent
  dispatches.
- Checkpoint completion cannot be treated as sufficient proof of story or epic
  completion.
- Integrations that need both synchronous checkpointing and durable session
  progress require an asynchronous coordination boundary.
- Tests must prove that stale or forged checkpoint status cannot advance the
  canonical lifecycle.

## Rejected Alternatives

- **Make checkpoint JSON canonical:** rejected because it duplicates ADR-011,
  weakens role-based lifecycle evidence, and fragments recovery by command.
- **Remove checkpoint JSON immediately:** rejected because it would make lean
  synchronous CLI resume depend on an asynchronous session store and introduce
  unnecessary compatibility risk.
- **Use last-write-wins reconciliation:** rejected because a local or stale
  checkpoint could bypass QA and overwrite audited lifecycle state.

## Related

- ADR-011: Session State Unification, recorded in
  `docs/stories/completed/11.5.story.md`
- `docs/architecture/orchestration-hierarchy.md`
- `.aiox-core/core/orchestration/session-state.js`
- `.aiox-core/core/sdc/progress.js`
- Story `CORE-SU.R1`, acceptance criterion 6
