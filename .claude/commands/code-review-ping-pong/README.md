# Code Review Ping-Pong — FIX Mode (Claude Code)

Read the skill at `skills/code-review-ping-pong/SKILL.md` and execute **FIX mode**.

You are the FIXER in the ping-pong cycle. Codex writes reviews, you implement fixes.

## Quick Start

1. Read the full skill: `skills/code-review-ping-pong/SKILL.md`
2. Execute the **Mode: FIX** section
3. Templates are at `skills/code-review-ping-pong/references/fix-template.md`
4. Validator at `skills/code-review-ping-pong/scripts/validate.cjs`

## What This Command Does

- Reads the latest `round-N.md` review from `.code-review-ping-pong/`
- Implements all fixes for reported issues
- Writes `round-N-fixed.md` with structured results
- Runs validation if available

Pass `$ARGUMENTS` as scope override or specific instructions.
