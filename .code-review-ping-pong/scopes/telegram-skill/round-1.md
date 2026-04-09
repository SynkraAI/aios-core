---
protocol: code-review-ping-pong
type: review
round: 1
date: "2026-04-08"
reviewer: "Codex"
commit_sha: "5cda43e07"
branch: "chore/devops-10-improvements"
based_on_fix: null
files_in_scope:
  - "skills/telegram/SKILL.md"
score: 6
verdict: "CONTINUE"
issues:
  - id: "1.1"
    severity: "HIGH"
    title: "Ping-pong scope detection ignores scoped session files"
    file: "skills/telegram/SKILL.md"
    line: "168-175"
    suggestion: "Resolve scope from `.code-review-ping-pong/scopes/{scope-name}/session.md` first when a scoped session exists, then derive `scope_dir` from that resolved scope."
  - id: "1.2"
    severity: "HIGH"
    title: "Hardcoded sender agent breaks agent-to-agent delivery"
    file: "skills/telegram/SKILL.md"
    line: "195-197"
    suggestion: "Replace `CRM_AGENT_NAME=local-session` with an auto-detected or configurable local sender identity and document the fallback behavior."
  - id: "1.3"
    severity: "MEDIUM"
    title: "fast-checker degraded state is only warned, not repaired"
    file: "skills/telegram/SKILL.md"
    line: "78-86"
    suggestion: "Make `status` restart the agent when `fast-checker` is missing, or change the skill contract so it no longer promises automatic remediation."
  - id: "1.4"
    severity: "MEDIUM"
    title: "Action handlers lack explicit recovery paths for missing files and dependencies"
    file: "skills/telegram/SKILL.md"
    line: "124-139"
    suggestion: "Add existence checks and user-facing fallback flows for missing logs, missing `jq`, missing `tmux`, and transport command failures before running the raw commands."
---

# Code Ping-Pong — Round 1 Review

## 🎯 Score: 6/10 — CONTINUE

---

## Issues

### 🟠 HIGH

> Issues that cause incorrect behavior or significant quality problems.

#### Issue 1.1 — Ping-pong scope detection ignores scoped session files
- **File:** `skills/telegram/SKILL.md`
- **Line:** 168-175
- **Code:**
  ```yaml
  - Detect scope (same rules as code-review-ping-pong SKILL):
    1. Check docs/stories/active/ for active story
    2. Check .code-review-ping-pong/session.md
    3. Ask user if neither exists

  - Create or detect scope directory:
    - If scoped: .code-review-ping-pong/scopes/{scope-name}/
    - If root: .code-review-ping-pong/
  ```
- **Problem:** The protocol here only checks the root `.code-review-ping-pong/session.md`, but the actual review flow in this repo uses scoped sessions such as `.code-review-ping-pong/scopes/telegram-skill/session.md`. In that common case, `/telegram ping-pong` can fail to discover the active scope, ask the user unnecessarily, or send the remote reviewer to write the round file in the wrong directory.
- **Suggestion:**
  ```yaml
  - Detect scope:
    1. Check docs/stories/active/ for active story
    2. Check scoped sessions: .code-review-ping-pong/scopes/*/session.md
    3. Check root session: .code-review-ping-pong/session.md
    4. Ask user only if none exist

  - Derive scope_dir from the resolved session location before composing the message
  ```

#### Issue 1.2 — Hardcoded sender agent breaks agent-to-agent delivery
- **File:** `skills/telegram/SKILL.md`
- **Line:** 195-197
- **Code:**
  ```bash
  CRM_TEMPLATE_ROOT=~/claude-remote-manager CRM_AGENT_NAME=local-session \
  bash ~/claude-remote-manager/core/bus/send-message.sh $AGENT_NAME high '{message}'
  ```
- **Problem:** The sender side is hardcoded to `local-session`, but that agent is not discovered earlier and is not listed as a prerequisite. On installations where the local sender has a different name or does not exist, the core ping-pong action fails even if the remote agent was correctly auto-detected. This makes the feature brittle and contradicts the skill's "smart auto-detection" contract.
- **Suggestion:**
  ```bash
  CRM_TEMPLATE_ROOT=~/claude-remote-manager \
  CRM_AGENT_NAME="${LOCAL_SENDER_AGENT:-$AGENT_NAME}" \
  bash ~/claude-remote-manager/core/bus/send-message.sh "$REMOTE_AGENT_NAME" high "$message"
  ```

### 🟡 MEDIUM

> Code style, readability, maintainability, or minor performance issues.

#### Issue 1.3 — fast-checker degraded state is only warned, not repaired
- **File:** `skills/telegram/SKILL.md`
- **Line:** 78-86
- **Code:**
  ```yaml
  - If fast-checker missing but tmux running:
    - Report warning: "fast-checker nao esta rodando. Restart recomendado."
  ```
- **Problem:** Earlier text promises "Smart status + auto-fix if needed", and the Error Handling table later says `fast-checker not running | Auto-restart`. The concrete action handler does not do that; it only warns. That leaves the system in a degraded state after `status`, even though the user was promised self-healing behavior.
- **Suggestion:**
  ```yaml
  - If fast-checker missing but tmux running:
    - Auto-restart: cd ~/claude-remote-manager && bash enable-agent.sh $AGENT_NAME --restart
    - Report: "fast-checker ausente. Reiniciando automaticamente..."
  ```

#### Issue 1.4 — Action handlers lack explicit recovery paths for missing files and dependencies
- **File:** `skills/telegram/SKILL.md`
- **Line:** 124-139
- **Code:**
  ```yaml
  - Tail: tail -50 ~/.claude-remote/default/logs/$AGENT_NAME/activity.log
  - If crash log exists: tail -20 ~/.claude-remote/default/logs/$AGENT_NAME/crashes.log
  - Show tmux capture: tmux capture-pane -t crm-default-$AGENT_NAME -p | tail -30

  - Validate token: curl -s https://api.telegram.org/bot$BOT_TOKEN/getMe
  - Send test: CRM_TEMPLATE_ROOT=~/claude-remote-manager CRM_AGENT_NAME=$AGENT_NAME bash ~/claude-remote-manager/core/bus/send-telegram.sh $CHAT_ID "Teste do /telegram skill — $(date '+%H:%M:%S')"
  ```
- **Problem:** The skill claims complete error handling with recovery paths, but these handlers still rely on raw commands that will fail noisily when logs do not exist yet, when `tmux`/`jq` are missing, or when the transport script fails. The resulting operator experience is a shell error, not a guided remediation path.
- **Suggestion:**
  ```yaml
  - If activity.log missing: report "Sem logs ainda" instead of tailing
  - If tmux missing: report prerequisite failure with install hint
  - If jq missing: fall back to grep or report exact install command
  - If send-telegram.sh fails: surface the exit code and point to /telegram restart or /telegram setup
  ```

---

## Regressions

> Issues introduced by fixes from the previous round. Leave empty if first round or no regressions.

- none

---

## ✅ What Is Good

> Explicitly list things that are well-implemented. The fixer must NOT change these.

- The discovery section establishes a clear resolution order for choosing the active agent, which is a good fit for the "zero unnecessary questions" goal in `skills/telegram/SKILL.md`.
- The action surface is compact and coherent: `status`, lifecycle controls, `logs`, `test`, `setup`, and `ping-pong` are all documented in one place in `skills/telegram/SKILL.md`.

---

## 📊 Summary

- **Total issues:** 4
- **By severity:** 🔴 0 CRITICAL, 🟠 2 HIGH, 🟡 2 MEDIUM, 🟢 0 LOW
- **Regressions from previous round:** none
- **Next action:** Fix issues and request new review
