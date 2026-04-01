# Code Review Ping-Pong — REVIEW Mode (Codex)

Read the skill at `.codex/skills/code-review-ping-pong/SKILL.md` and execute **REVIEW mode**.

You are the REVIEWER in the ping-pong cycle. You analyze code and write structured findings.
Claude Code reads your findings and implements fixes.

## Quick Start

1. Read the full skill: `.codex/skills/code-review-ping-pong/SKILL.md`
2. Execute the **REVIEW Steps** section
3. Template at `skills/code-review-ping-pong/references/review-template.md`
4. Validator at `skills/code-review-ping-pong/scripts/validate.cjs`

## What This Command Does

- Analyzes code in scope (story > session.md > user input)
- Writes `round-N.md` with structured findings and YAML frontmatter
- Scores code 1-10, reports all issues
- Hands off to Claude Code for FIX mode

Pass `$ARGUMENTS` as scope override or specific instructions.
