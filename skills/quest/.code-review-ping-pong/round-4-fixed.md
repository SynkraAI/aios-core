---
protocol: code-review-ping-pong
type: fix
round: 4
date: "2026-03-31"
fixer: "Claude Opus 4.6"
review_file: round-4.md
commit_sha_before: "ff6f21f33d2b3d2a93c4045e44aa88fc2daab4a8"
commit_sha_after: "caf24e69e2b2af648217132e8168e1d60306a090"
branch: chore/devops-10-improvements
issues_fixed: 3
issues_skipped: 0
issues_total: 3
git_diff_stat: "3 files changed, 8 insertions(+), 4 deletions(-)"
quality_checks:
  lint: skipped
  typecheck: skipped
  tests: skipped
fixes:
  - id: "4.1"
    status: FIXED
    file: "SKILL.md"
    description: "Changed status entrypoint from 'show summary' to 'show status' so guide.md decides the view"
    deviation: "none"
  - id: "4.2"
    status: FIXED
    file: "engine/xp-system.md"
    description: "Added 3-part ID fallback for sub-item detection when sub_of is absent"
    deviation: "none"
  - id: "4.3"
    status: FIXED
    file: "engine/guide.md"
    description: "Included 'unused' in COMPLETE phase state rule alongside done/skipped"
    deviation: "none"
preserved:
  - "engine/ceremony.md — no issues found in this round"
  - "engine/checklist.md — no issues found in this round"
  - "engine/scanner.md — no issues found in this round"
---

# Code Ping-Pong — Round 4 Fix Report

## Fixed Issues

### Fix for Issue 4.1

**Entrypoint de `status` ainda fixa a view de summary e contradiz o contrato do guide**

- **File:** `SKILL.md:115`
- **Change:** Replaced `→ show summary` with `→ show status` in the routing table.
- **Why:** The entrypoint was forcing a specific output ("summary") when `guide.md` already defines two views — the expanded Quest Log View (§5) and the compact Summary View (§6). Using the generic term "show status" lets guide.md pick the appropriate view based on context.
- **Anti-whack-a-mole:** Grepped for `show summary` across all quest files — only one occurrence in SKILL.md.

### Fix for Issue 4.2

**XP system ignora o fallback por ID de 3 partes prometido para sub-itens**

- **File:** `engine/xp-system.md:38-49`
- **Change:** Added a fallback path that derives `parent_id` from the first two dot-separated parts of a 3+ part ID (e.g. `"4.2.M8"` → `"4.2"`) when `sub_of` is absent.
- **Why:** The comment and `checklist.md` §7.5 promised two detection mechanisms for sub-items (`sub_of` field OR 3-part ID), but only `sub_of` was implemented. Legacy or manually-created sub-items with valid 3-part IDs but no `sub_of` field would silently disappear from XP, counters, streak, and achievements.
- **Anti-whack-a-mole:** Grepped for `sub_of is defined` across all quest files — only one occurrence in xp-system.md.

### Fix for Issue 4.3

**Regra de COMPLETE no status view não inclui fases resolvidas só com `unused`**

- **File:** `engine/guide.md:557`
- **Change:** Updated the phase state rule from `done/skipped` to `done/skipped/unused`.
- **Why:** The same file defines in §4.2 and §8 that `unused` doesn't block a world and that all-unused worlds render as `0/0` / `0%`. The COMPLETE rule needed to include `unused` to stay consistent — otherwise a phase with only non-applicable items would never show as COMPLETE despite being semantically finished.
- **Anti-whack-a-mole:** Grepped for `done/skipped` (without `unused`) across all quest files — only one occurrence in guide.md (the one fixed).

## Skipped Issues

None.
