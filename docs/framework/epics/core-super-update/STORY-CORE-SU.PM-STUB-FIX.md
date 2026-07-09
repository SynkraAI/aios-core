# Story CORE-SU.PM1: pm.sh real agent execution (no stub)

## Metadata

| Campo | Valor |
|-------|-------|
| Story ID | CORE-SU.PM1 |
| Epic | CORE-SUPER-UPDATE |
| Wave | ops / orchestration |
| Status | Done |

## Problem

`pm.sh` printed `Agent execution would happen here...` instead of invoking a CLI — fake sessions with locks under `/tmp` / `$TMPDIR`.

## Fix

- `run_agent_cli` invokes `CLAUDE_CMD` / `claude` with a structured prompt  
- Fail hard if no CLI (no fake success)  
- Visual spawn re-enters script with `AIOX_INLINE_MODE=true` for one protocol  

## File List

- `.aiox-core/scripts/pm.sh`

## QA

Gate: **PASS** (manual: no stub strings remain)

## Change Log

| Date | Event |
|------|-------|
| 2026-07-09 | Stub removed |
