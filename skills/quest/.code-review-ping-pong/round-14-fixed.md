---
protocol: code-review-ping-pong
type: fix
round: 14
date: "2026-04-01"
fixer: "Claude Opus 4.6"
review_file: round-14.md
commit_sha_before: "e7ab5c473f0b80ad049583e8a214413979c9c558"
commit_sha_after: "f4ccffc8adc80172e6cd44cec667db85d27169b9"
branch: chore/devops-10-improvements
issues_fixed: 4
issues_skipped: 0
issues_total: 4
git_diff_stat: "3 files changed, 7 insertions(+), 5 deletions(-)"
quality_checks:
  lint: skipped
  typecheck: skipped
  tests: skipped
fixes:
  - id: "14.1"
    status: FIXED
    file: "engine/ceremony.md"
    description: "Added inline character restriction comment in progress bar pseudocode at §7, explicitly prohibiting ▓ (U+2593) and limiting to █/░ only."
    deviation: "none"
  - id: "14.2"
    status: FIXED
    file: "engine/guide.md"
    description: "Made all four co-owner locations explicit in hero_name and hero_title fallback contracts at §1, using numbered list format. Added omission detail to hero_title contract."
    deviation: "none"
  - id: "14.3"
    status: FIXED
    file: "engine/xp-system.md"
    description: "Added cross-reference to checklist.md §1 and SKILL.md Critical Rule 5 in the deprecation notice at §7."
    deviation: "none"
  - id: "14.4"
    status: FIXED
    file: "engine/ceremony.md"
    description: "Added explicit omission behavior detail to hero_title fallback contract at §1.5: do NOT render empty comma, trailing space, or raw placeholder."
    deviation: "none"
preserved:
  - "SKILL.md — already has complete hero_name contract and deprecation cross-references"
  - "engine/checklist.md — already has deprecation warning with cross-references to xp-system.md §7 and SKILL.md"
  - "engine/guide.md §5-§6 — progress bar contracts already complete with ▓ prohibition"
---

# Code Ping-Pong — Round 14 Fix Report

## Summary

4 issues found in round 14, all fixed. No ▓ was found in source files (only in old round files). All fixes are contract-strengthening changes — making cross-references explicit and adding omission behavior details.

## Anti-Whack-a-Mole Analysis

- **14.1 (progress bar):** Grep for ▓ across all quest files — 0 occurrences in source files. All 4 progress bar locations (ceremony.md §2, §7, guide.md §5, §6) already use correct characters. Fix adds inline restriction in §7 pseudocode.
- **14.2 (hero_name/title contract):** Checked all 4 co-owner locations (SKILL.md, ceremony.md §1.5, §7, guide.md §1). All have contracts, but guide.md §1 didn't explicitly list itself as co-owner. Fixed.
- **14.3 (deprecation cross-ref):** Checked 3 locations: SKILL.md (line 304) ✓ has cross-ref, checklist.md §1 (lines 34-39) ✓ has cross-ref, xp-system.md §7 ✗ missing cross-ref. Fixed.
- **14.4 (hero_title omission):** Checked all 4 co-owner locations. ceremony.md §7 already says "do NOT render empty comma or trailing space". ceremony.md §1.5 only said "omit from output" without specifying what omission means. Fixed to match §7 precision.

## Semantic Propagation Analysis

- **Contract: progress bar visual consistency** — 4 participants: ceremony.md §2, ceremony.md §7, guide.md §5, guide.md §6. All verified consistent.
- **Contract: hero_name fallback** — 4 participants: SKILL.md, ceremony.md §1.5, ceremony.md §7, guide.md §1. All verified consistent.
- **Contract: hero_title fallback** — 4 participants: SKILL.md, ceremony.md §1.5, ceremony.md §7, guide.md §1. All verified consistent after fix.
- **Contract: deprecation total_xp >= N** — 3 participants: xp-system.md §7, checklist.md §1, SKILL.md rule 5. All verified consistent after fix.

## Fixes Applied

### Fix for Issue 14.1

**File:** `engine/ceremony.md` (§7 Progress Bar Generation)

**Problem:** The pseudocode for generating the progress bar didn't have an inline character restriction, relying solely on the contract block below it.

**Fix:** Added a comment inside the pseudocode block explicitly stating that ONLY `█` (U+2588) and `░` (U+2591) are allowed, with a cross-reference to the unified contract locations. Also added the restriction to the note paragraph below the code block.

**Propagation:** Verified all 4 progress bar locations — ceremony.md §2 (line 169), ceremony.md §7, guide.md §5 (lines 670-686), guide.md §6 (line 694). All already have the ▓ prohibition in their contract blocks. No additional changes needed.

### Fix for Issue 14.2

**File:** `engine/guide.md` (§1 Voice Rule 1)

**Problem:** The hero_name and hero_title fallback contracts listed 3 external co-owners but didn't explicitly name guide.md §1 itself as the 4th co-owner.

**Fix:** Rewrote both contracts using a numbered list format that explicitly names all 4 co-owner locations: (1) SKILL.md, (2) ceremony.md §1.5, (3) ceremony.md §7, (4) guide.md §1. Also added explicit omission behavior to the hero_title contract ("do NOT render an empty comma, trailing space, or raw placeholder").

**Propagation:** Checked all 4 co-owner locations. SKILL.md (line 14), ceremony.md §1.5 (lines 116-118), and ceremony.md §7 (lines 475-480) all already list their co-owners correctly. Only guide.md §1 was missing the self-reference.

### Fix for Issue 14.3

**File:** `engine/xp-system.md` (§7 Achievement Evaluation — deprecation notice)

**Problem:** The deprecation notice for `total_xp >= N` didn't cross-reference the other two locations where the same warning appears (checklist.md §1 and SKILL.md Critical Rule 5).

**Fix:** Added a cross-reference sentence to the deprecation notice: "This same deprecation warning is echoed in checklist.md §1 (achievements comment block and deprecation callout) and SKILL.md Critical Rule 5. All three locations MUST stay consistent."

**Propagation:** Verified all 3 deprecation locations:
- checklist.md §1 (lines 34-39): ✓ Already cross-references xp-system.md §7 and SKILL.md rule 5
- SKILL.md (line 304): ✓ Already cross-references xp-system.md §7 and checklist.md §1
- xp-system.md §7: ✗ Was the only one missing cross-references — now fixed

### Fix for Issue 14.4

**File:** `engine/ceremony.md` (§1.5 Hero Identity — hero_title fallback contract)

**Problem:** The hero_title fallback contract at §1.5 said "omit it from output" but didn't specify what that means concretely (unlike ceremony.md §7 which explicitly says "do NOT render an empty comma or trailing space").

**Fix:** Added precise omission behavior: "do NOT render an empty comma, trailing space, or raw `{hero_title}` placeholder."

**Propagation:** Checked all 4 co-owner locations for hero_title fallback:
- SKILL.md: Uses quest-log meta schema — no output rendering (data only) ✓
- ceremony.md §1.5: Now has explicit omission detail ✓ (this fix)
- ceremony.md §7 (line 480): Already has "do NOT render an empty comma or trailing space" ✓
- guide.md §1: Now also has omission detail (fixed in 14.2) ✓
