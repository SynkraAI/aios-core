---
name: develop-story
description: >
  Implement a story (Ready → InProgress → ready for review). Runs the OSS develop task.
  Use when: develop story, *develop, /develop-story, implement ACs.
user-invocable: true
argument-hint: "{story-path} [yolo|interactive|preflight]"
agent: dev
---

# develop-story

Lean SDC skill. **Task is source of truth.**

## Task SOT

`.aiox-core/development/tasks/dev-develop-story.md`

## Input

- `$ARGUMENTS[0]` — story path
- `$ARGUMENTS[1]` — `yolo` | `interactive` | `preflight` (default `interactive`)

## Protocol

1. Load and execute the develop task end-to-end.
2. Adopt story **Executor** persona (fallback `@dev`).
3. **Branch guard:** do not commit on `main`/`master`; use `feat/{story-id}-*` (or current feature branch).
4. REUSE > ADAPT > CREATE; absolute imports; Quality First gates.
5. Per task: implement → tests → mark `[x]` only when gates pass → update File List.
6. Allowed story edits only: checkboxes, File List, Dev Agent Record, Change Log, Status to InProgress / ready-for-review.
7. **Forbidden story edits:** title, description, AC, scope (PO-owned).
8. Local commits only. Push → `@devops`.

## Quality gates before done

```bash
npm run lint
npm run typecheck
npm test
```

## Post-phase verification

- [ ] Tasks/subtasks checked as complete
- [ ] File List matches work
- [ ] Tests/gates noted (or run green)
- [ ] Status not `Done` (review/close owns Done path)

## Forbidden

- `git push`, force-push, `--no-verify`
- Setting `Status: Done`
- Product harvest trees or product-only local canon (see ARCH-A denylist)
