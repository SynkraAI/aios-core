# PO Task: Finalize Completed Story

**Agent:** @po
**Command:** `*close-story`
**Purpose:** Finalize epic/backlog bookkeeping after QA has completed the lifecycle.

## Authority Boundary

QA exclusively owns `InReview → Done` for PASS, CONCERNS, or WAIVED and
`InReview → InProgress` for FAIL. This task never changes story lifecycle
status. It is an idempotent administrative phase retained for epic indexes,
closure metadata, and next-story suggestions.

## Preconditions

- Story exists and is readable.
- Story Status is already `Done`.
- QA verdict is PASS, CONCERNS, or WAIVED in QA Results or its gate file.
- QA evidence identifies its author through `reviewer` and binds the verdict to
  the current story revision through `reviewed_revision` (commit SHA, PR head
  SHA, or deterministic story-content digest).
- Acceptance criteria/tasks/File List and required quality evidence are complete.

If Status is not `Done`, halt with: `QA must complete the lifecycle before close-story`.
If QA provenance is missing, stale, mismatched, or cannot be verified against
the current revision, halt with: `QA verdict provenance does not match the current story revision`.

## Protocol

1. Read the story and approved QA gate without changing Status, then verify
   `reviewer`, verdict, story ID, and `reviewed_revision` against the current
   revision before any write.
2. Resolve the closure idempotency key as `<story-id>:commit:<sha>` when a
   commit SHA is available, otherwise `<story-id>:pr:<number>` when a PR number
   is available, otherwise `<story-id>:digest:<reviewed_revision>` when the
   accepted provenance is a deterministic story-content digest. If none of
   these revision formats exists, stop before every write and report a read-only
   no-op; do not update the epic/backlog or Change Log.
3. Inspect each target artifact independently for `[closure-key: <key>]`.
   The story Change Log is authoritative for story closure metadata; an
   epic/backlog marker is authoritative only for its own artifact.
4. Write a missing epic/backlog completion marker first, including the key.
   An existing matching marker is a no-op for that artifact.
5. Append a Change Log row only when its key is absent, include
   `[closure-key: <key>]`, and never duplicate the QA lifecycle transition.
6. Suggest the next eligible story when applicable.
7. Report the preserved story Status, resolved key, and bookkeeping files changed.

Each artifact write must be atomic. If a write fails, halt and report the key,
the artifact that failed, and which keyed artifacts already succeeded. On
retry, re-run Step 3 and write only the missing artifact; do not roll back a
valid keyed write. This resumable repair is the recovery protocol for partial
multi-file completion and must converge both artifacts without duplicates.

## Idempotency Validation

Execute the protocol twice against the same completed-story fixture and the
same commit SHA, PR number, or deterministic digest. The second execution must
report a no-op, preserve Status `Done`, and leave exactly one occurrence of
`[closure-key: <key>]` in each artifact that carries closure metadata. Also
simulate failure after the first artifact write; retry must add only the missing
keyed artifact.

## Postconditions

- Story remains `Done`.
- No lifecycle transition is attributed to PO.
- Epic/backlog state is consistent when those artifacts exist.
- Re-running the task produces no duplicate closure entry.
- Closure never accepts missing, stale, mismatched, or unverifiable QA provenance.

## Forbidden

- Setting or rewriting story Status.
- Closing a FAIL or missing QA verdict.
- Performing git push, PR, merge, release, or tag operations.

## Handoff

After successful administrative finalization, hand off any requested remote
operation to `@devops` with story id, QA verdict, branch, and available commit/PR
metadata.

```yaml
next_agent: @devops
next_command: *pre-push
condition: Story is Done, administrative finalization passed, and a remote operation was requested
```
