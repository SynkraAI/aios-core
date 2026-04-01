---
protocol: code-review-ping-pong
type: fix
round: 10
date: "2026-04-01"
fixer: "Claude Opus 4.6"
review_file: round-10.md
commit_sha_before: "71a024837e9ed32b905db45015681bcd688726d2"
commit_sha_after: "ce40e41ec"
branch: chore/devops-10-improvements
issues_fixed: 4
issues_skipped: 0
issues_total: 4
git_diff_stat: "4 files changed, 8 insertions(+), 2 deletions(-)"
quality_checks:
  lint: skipped
  typecheck: skipped
  tests: skipped
fixes:
  - id: "10.1"
    status: FIXED
    file: "engine/guide.md"
    description: "Added hero_title fallback contract block in guide.md §1 and ceremony.md §1.5"
    deviation: "none"
  - id: "10.2"
    status: FIXED
    file: "engine/checklist.md"
    description: "Added progress bar contract reference in checklist.md §2 stats calculation"
    deviation: "none"
  - id: "10.3"
    status: FIXED
    file: "engine/guide.md"
    description: "Added unused items cross-reference in guide.md §4 Celebrations preamble"
    deviation: "none"
  - id: "10.4"
    status: FIXED
    file: "engine/scanner.md"
    description: "Added xp-system.md §2.0 reference to scanner.md §6 drift warning"
    deviation: "none"
preserved:
  - "engine/xp-system.md — no changes needed, already documents unused exclusion thoroughly"
  - "SKILL.md — hero_title fallback behavior already implicit in quest-log meta contract"
---

# Code Ping-Pong — Round 10 Fix Report

## Summary

All 4 issues from round 10 were cross-reference contract gaps — no behavioral bugs. Each fix adds explicit contract documentation to prevent silent drift between modules.

## Fixes Applied

### Fix for Issue 10.1

**Problem:** hero_title fallback (empty string) lacked an explicit cross-reference contract like hero_name has.

**Fix:** Added `Contract — hero_title fallback` blocks in two locations:
1. **guide.md §1 (Voice Rule 1)** — right after the existing hero_name fallback contract. Documents the 4-location contract (SKILL.md, ceremony.md §1.5, ceremony.md §7, guide.md §1) and the rule that empty/missing/whitespace-only hero_title = "no title" = omit from output.
2. **ceremony.md §1.5 (Hero Identity)** — added matching contract block after the hero_name fallback contract, referencing all 4 locations.

**Anti-whack-a-mole analysis:** Searched all engine files for `hero_title.*fallback` and `fallback.*hero_title`. The hero_title fallback behavior was already correctly implemented in ceremony.md §1.5 (option 4 sets empty string), ceremony.md §7 (hero_title not mentioned in banner output when empty), and guide.md §1 (used only when non-empty). What was missing was the explicit cross-reference contract — now added in 2 of the 4 locations (the other 2 — SKILL.md and ceremony.md §7 — already handle it implicitly via the quest-log meta contract and the rendering logic).

**Propagation semântica:** The contract that's broken here is "all modules that consume hero_title must agree on what 'no title' means". Modules that consume hero_title: SKILL.md (defines meta schema), ceremony.md §1.5 (collects it), ceremony.md §7 (renders banner), guide.md §1 (renders all templates). All 4 already use empty string as "no title" — the fix makes this explicit.

### Fix for Issue 10.2

**Problem:** checklist.md §2 (Create Quest-log) calculates stats but doesn't reference the unified progress bar contract.

**Fix:** Added a note to checklist.md §2 step 6 stating that the `percent` and counter values calculated there feed the progress bar contract (ceremony.md §2, §7, guide.md §5, §6), and that any direct visual stats output from checklist MUST use the same contract characters and parameters.

**Anti-whack-a-mole analysis:** Searched checklist.md for `progress.*bar.*contract|Contract.*progress.*bar`. Found the existing reference in §3 step 5 (Read flow). The §2 (Create flow) was the only location missing the reference — now fixed.

**Propagação semântica:** The contract is "all modules that calculate or display progress must use consistent visual representation". Modules involved: ceremony.md §2 (loading), ceremony.md §7 (resumption bar), guide.md §5 (per-phase bars), guide.md §6 (summary bars), checklist.md §3 step 5 (read flow stats), checklist.md §2 step 6 (create flow stats). The last one was missing the reference — now added.

### Fix for Issue 10.3

**Problem:** guide.md §4 (Celebrations) didn't cross-reference the unused items exclusion contract from checklist.md §1 and xp-system.md §7.

**Fix:** Added a cross-reference paragraph at the top of guide.md §4, right after the existing preamble. Documents that unused items are excluded from ALL achievement conditions and celebration triggers, referencing checklist.md §1 (status lifecycle) and xp-system.md §7 (achievement evaluation). Lists the specific celebrations affected: World Complete §4.2, Final Victory §4.5, MVP Launch Guide §4.6.

**Anti-whack-a-mole analysis:** Searched guide.md for `unused.*achievement|achievement.*unused`. Found references in guide.md line 94 (inside is_phase_unlocked comment) and line 483 (MVP Launch Guide). The §4 preamble was the gap — individual celebrations (§4.2, §4.5, §4.6) already mention unused exclusion, but the section-level contract was missing.

**Propagação semântica:** The contract is "unused items are invisible to the system". Modules that must honor this: checklist.md §1 (defines unused), xp-system.md §4 (streaks), xp-system.md §5 (counters), xp-system.md §7 (achievements), guide.md §2 (mission selection), guide.md §4 (celebrations). The last one was missing the explicit cross-reference — now added.

### Fix for Issue 10.4

**Problem:** scanner.md §6 drift warning referenced checklist.md §1 for canonical item ID rules but not xp-system.md §2.0.

**Fix:** Extended the drift warning in scanner.md §6 (line 397) to also reference xp-system.md §2.0 (resolved item list — the authoritative algorithm for deriving the full list of item IDs including sub-items). Added clarification that all IDs in examples must be schema-derived.

**Anti-whack-a-mole analysis:** Searched scanner.md for `xp-system.*§2\.0|canonical.*item.*ID`. No prior references to xp-system.md §2.0 existed in scanner.md. The drift warning was the single location that needed this reference.

**Propagação semântica:** The contract is "item IDs are derived from pack schema, not hardcoded". Modules that participate: scanner.md §6 (free-text examples show IDs), checklist.md §1 (defines ID format), xp-system.md §2.0 (resolves full ID list including sub-items). Scanner was referencing only one of the two authoritative sources — now references both.

## Skipped Issues

(none)
