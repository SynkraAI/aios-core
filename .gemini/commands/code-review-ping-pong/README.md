# Code Review Ping-Pong — AUDIT Mode (Gemini)

Read the skill at `skills/code-review-ping-pong/SKILL.md` and execute **AUDIT mode**.

You are the AUDITOR in the ping-pong cycle. You read ALL previous rounds (reviews + fixes)
and provide a cross-cutting analysis that the reviewer and fixer may have missed.

## Quick Start

1. Read the full skill: `skills/code-review-ping-pong/SKILL.md`
2. Execute the **Mode: AUDIT** section
3. Template at `skills/code-review-ping-pong/references/audit-template.md`
4. Validator at `skills/code-review-ping-pong/scripts/validate.cjs`

## What This Command Does

- Reads ALL round files in `.code-review-ping-pong/`
- Identifies patterns, blind spots, and recurring issues
- Writes `round-N-audit.md` with cross-cutting analysis
- Provides meta-score and recommendations

Pass `$ARGUMENTS` as scope override or specific instructions.
