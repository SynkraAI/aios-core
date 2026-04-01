---
protocol: code-review-ping-pong
type: fix
round: 2
date: "2026-04-01"
fixer: "Claude Code (Opus)"
review_file: round-2.md
commit_sha_before: "192be9b3c3aef057b3026413d1791532e1124e35"
commit_sha_after: "458c1edde6cd445410625f6065c444cc6df95040"
branch: chore/devops-10-improvements
issues_fixed: 4
issues_skipped: 0
issues_total: 4
git_diff_stat: "4 files changed, 22 insertions(+), 1 deletion(-)"
quality_checks:
  lint: skipped
  typecheck: skipped
  tests: skipped
fixes:
  - id: "2.1"
    status: FIXED
    file: "engine/ceremony.md"
    description: "Added explicit contract note linking Resumption Banner progress bar to loading sequence and guide.md progress_bar()"
    deviation: "none"
  - id: "2.2"
    status: FIXED
    file: "engine/checklist.md"
    description: "Documented fallback for missing and malformed condition fields: treat as unconditional/pending with warning log"
    deviation: "none"
  - id: "2.3"
    status: FIXED
    file: "engine/xp-system.md"
    description: "Strengthened deprecation warning for total_xp >= N alias with explicit pack author guidance and removal notice"
    deviation: "none"
  - id: "2.4"
    status: FIXED
    file: "engine/scanner.md"
    description: "Documented fallback chain when no packs define keywords: skip matching → detection rules → manual selection"
    deviation: "none"
preserved:
  - "engine/guide.md — no issues in this file; progress_bar() contract already well-defined"
  - "SKILL.md — no issues in this file"
---

# Code Ping-Pong — Round 2 Fix Report

## Summary

All 4 issues from round-2.md were addressed in commit 458c1edde. Each fix adds documentation clarity and explicit contracts to prevent future drift between modules.

## Fixed Issues

### Fix for Issue 2.1

**Problem:** The Resumption Banner progress bar referenced `progress_bar()` from guide.md §5 but lacked an explicit contract requiring strict alignment with the loading sequence and guide.md status bars.

**Fix applied:** Added a **Contract — progress bar visual consistency** note in ceremony.md §7 (Progress Bar Generation) that explicitly lists all four locations that must stay in sync: ceremony.md loading sequence (§2), ceremony.md Resumption Banner (§7), guide.md `progress_bar()` (§5), and guide.md summary view (§6). The note mandates same character set (`█`/`░`), width (20 chars), and rounding (`round()`) — and requires all to be updated in the same commit if any changes.

**Anti-whack-a-mole analysis:** Searched all engine files for `progress_bar` and `progress bar` references. Found occurrences only in:
- `ceremony.md` — sections 2 (loading sequence) and 7 (Resumption Banner)
- `guide.md` — sections 5 (function definition), 6 (summary view), and edge case notes

All already use the same character set and rounding. The new contract note makes this implicit agreement explicit and prevents future drift.

**Semantic propagation:** The contract is "all visual progress indicators across all modules MUST use identical rendering parameters." Participating modules: ceremony.md (2 consumers) and guide.md (1 definition + 2 consumers). No other modules render progress bars.

### Fix for Issue 2.2

**Problem:** The documentation didn't specify what happens when a pack item has a missing or malformed `condition` field.

**Fix applied:** Added a **Fallback for missing or malformed `condition` fields** section in checklist.md §1 (Condition state), immediately after the existing note about items without a `condition` field. Documents two cases:
- **Missing `condition` field:** Treated as unconditional (existing behavior, now explicit).
- **Malformed `condition` field:** Treated as unconditional/pending with a warning log. Ensures forward compatibility and no crashes.

**Anti-whack-a-mole analysis:** Searched for `condition` field handling across engine files:
- `checklist.md` — primary documentation of condition_state lifecycle (now with fallback)
- `guide.md` — §2 selects items with `condition_state == applicable` or items without `condition` field. Already consistent with the fallback (items without conditions are eligible).

**Semantic propagation:** The contract is "items without a valid condition are unconditionally actionable." Modules participating: checklist.md (defines lifecycle), guide.md §2 (consumes condition_state for selection). Both handle absence of `condition` field identically — the new documentation makes the malformed case explicit too.

### Fix for Issue 2.3

**Problem:** The `total_xp >= N` legacy alias note was present but not explicit enough for pack authors who might still use the old name.

**Fix applied:** Enhanced the legacy alias paragraph in xp-system.md §3 (Supported Conditions, under `item_xp >= N`) with:
- Marked as **(DEPRECATED — use `item_xp >= N` instead)** in the heading
- Added a prominent blockquote warning for pack authors explaining why `total_xp >= N` is misleading
- Explicit statement that the alias **will be removed** in a future version
- Recommendation to migrate existing packs during updates

**Anti-whack-a-mole analysis:** Searched for `total_xp` references across all engine files. The only location where `total_xp >= N` is documented as an achievement condition is xp-system.md §3. Other `total_xp` references refer to the stats field (different context). No propagation needed.

**Semantic propagation:** The contract is "achievement conditions must not create circular dependencies with displayed XP." Only xp-system.md §3 defines achievement condition evaluation. The deprecation note reinforces the rationale (preventing confusion between `total_base_xp` internal calculation and `total_xp` displayed value).

### Fix for Issue 2.4

**Problem:** Free-text detection logic described keyword matching but didn't specify what happens when no keywords are defined in any pack.

**Fix applied:** Added a **Fallback when no packs define keywords** section in scanner.md §6 (under `args.text` flow) documenting the explicit fallback chain:
1. Skip keyword matching entirely
2. Fall through to detection rules (Section 4)
3. If no detection matches, fall through to manual pack selection (Section 6.3)
4. Present full pack list with generic prompt

**Anti-whack-a-mole analysis:** Searched for `keywords` and `free-text` across engine files. Free-text handling exists only in scanner.md §6. No other module participates in keyword-based pack selection.

**Semantic propagation:** The contract is "user input must always result in a pack selection or a clear prompt for manual choice." The fallback chain (keywords → detection rules → manual selection) was already implicit in the flow. The fix makes the edge case (empty keyword table) explicit so implementors don't leave the user in a dead-end.
