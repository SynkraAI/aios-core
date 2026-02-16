# AIOS 4.0.4 - Learning Curve Focus (P0)

Date: 2026-02-16
Priority: P0-Critical

## Main Objective

Reduce AIOS learning curve as the primary focus for 4.0.x execution.

## Success Metrics

- New user reaches first-value in <= 10 minutes.
- Single onboarding path: start -> first output -> next action.
- Clear activation guidance across Claude, Codex, Gemini, Cursor, and Copilot.
- Fewer dead-ends in command discovery and workflow continuation.

## Execution Tracks

1. Onboarding-first docs and UX
- `README.md` and `docs/getting-started.md` as single "start here" path.
- Explicit "next step" pointers at each major section.
- Dual path: quickstart (new users) and advanced (power users).

2. Runtime-guided next action
- Move from menu-first to state-first recommendation.
- Align `.aios-core/development/tasks/next.md` with state signals (story, qa, ci, diff).

3. IDE activation clarity
- Normalize activation examples and constraints in:
  - `docs/ide-integration.md`
  - `docs/codex-integration-process.md`

4. Guardrail-backed claims
- Keep promises aligned with implementation via:
  - `.aios-core/infrastructure/scripts/validate-parity.js`

## Immediate Deliverables

- A concise onboarding script and checklist for first 10 minutes.
- Compatibility/activation matrix focused on beginner decisions.
- Updated roadmap with explicit P0 learning-curve focus.

## Risks

- Over-simplification for advanced users.
- Drift between docs and runtime behavior.

## Mitigations

- Maintain quickstart + advanced split.
- Contract validation in CI for public claims.
