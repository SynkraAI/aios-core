---
protocol: code-review-ping-pong
type: fix
round: 8
date: "2026-04-01"
fixer: "Claude Opus 4.6"
review_file: round-8.md
commit_sha_before: "3943737587072cb52bf3af3b07444c7e3450340d"
commit_sha_after: "3f138917086dd483a690c031be6ddbcbbb157b77"
branch: chore/devops-10-improvements
issues_fixed: 4
issues_skipped: 0
issues_total: 4
git_diff_stat: "4 files changed, 21 insertions(+), 1 deletion(-)"
quality_checks:
  lint: skipped
  typecheck: skipped
  tests: skipped
fixes:
  - id: "8.1"
    status: FIXED
    file: "engine/ceremony.md"
    description: "Added explicit hero_name fallback contract block in §7 Resumption Banner Field Sources. Now references §1.5, SKILL.md, and guide.md §1 as co-owners of the 'Aventureiro' fallback, with propagation rule documented inline."
    deviation: "none"
  - id: "8.2"
    status: FIXED
    file: "engine/guide.md"
    description: "Added progress bar visual consistency contract in §5 (after progress_bar() function) and §6 (Summary View). Both now explicitly cross-reference ceremony.md §2, ceremony.md §7, and each other as co-owners of the unified contract."
    deviation: "none"
  - id: "8.3"
    status: FIXED
    file: "engine/checklist.md"
    description: "Added visible deprecation warning blockquote for total_xp >= N in §1 achievements field, referencing xp-system.md §7 for full details. Warning is now a visible blockquote instead of buried in YAML comments."
    deviation: "none"
  - id: "8.4"
    status: FIXED
    file: "engine/xp-system.md"
    description: "Added cross-reference block in §4 streak calculation documenting the unused items contract across checklist.md §1, guide.md §2, xp-system.md §5, and xp-system.md §7. All modules that iterate items or calculate stats must exclude unused consistently."
    deviation: "none"
preserved:
  - "SKILL.md — no changes needed, already has hero_name fallback contract"
  - "engine/scanner.md — no changes needed, not involved in any of the 4 issues"
---

# Code Review Ping-Pong — Round 8 Fix Report

## Summary

Applied 4 fixes across 4 files. All fixes strengthen cross-module contract references to prevent silent drift between ceremony.md, guide.md, checklist.md, and xp-system.md.

## Anti-Whack-a-Mole Analysis

For each issue, searched all files in the quest engine scope for the same pattern:

- **hero_name fallback (8.1):** Grep for "Aventureiro" across all engine files. Found in SKILL.md (line 14), guide.md §1 (line 13), ceremony.md §1.5 (line 116), ceremony.md §7 (line 472). SKILL.md and guide.md §1 already had cross-references. Ceremony.md §1.5 was fixed in round 7. Ceremony.md §7 Field Sources had the fallback string but lacked an explicit contract block — now added.
- **Progress bar contract (8.2):** Grep for "progress_bar" and "U+2593" across all engine files. Found in ceremony.md §2 (line 167), ceremony.md §7 (lines 493-498), guide.md §5 (line 652), guide.md §6 (line 665). Ceremony.md §2 and §7 already had contract blocks. Guide.md §5 had the function but no contract block — now added. Guide.md §6 had the prohibition but no explicit cross-reference to ceremony.md — now added.
- **Deprecation warning (8.3):** Grep for "total_xp >= N" across all engine files. Found in xp-system.md §7 (lines 188, 301, 303), checklist.md §1 (line 36), SKILL.md Critical Rule 5. Xp-system.md has full deprecation notice. Checklist.md had it only as a YAML comment — now added as visible blockquote warning.
- **Unused in streak (8.4):** Grep for "unused" in streak/calculation contexts. Found in xp-system.md §4 (line 132-135), §5 (line 163), §7 (multiple conditions), §10 (line 388), checklist.md §1 (line 94), guide.md §2 (phase unlock). Xp-system.md §4 had the exclusion logic but lacked cross-references to other modules that define and consume the unused status — now added.

## Semantic Propagation Analysis

- **8.1 contract:** The hero_name fallback is a 4-location contract (SKILL.md, guide.md §1, ceremony.md §1.5, ceremony.md §7). All four now explicitly reference each other with matching fallback string "Aventureiro" and propagation rules.
- **8.2 contract:** The progress bar visual consistency is a 4-location contract (ceremony.md §2, ceremony.md §7, guide.md §5, guide.md §6). All four now have explicit contract blocks cross-referencing each other. Characters (`█`/`░`), width (20), and rounding (`round()`) are documented in each location.
- **8.3 contract:** The deprecation of `total_xp >= N` is documented in xp-system.md §7 (canonical), SKILL.md Critical Rule 5, and now visibly in checklist.md §1 (achievements field). Pack authors reading any of these three locations will see the warning.
- **8.4 contract:** The unused exclusion is a cross-cutting concern across 5 modules: checklist.md §1 (defines status), guide.md §2 (skips in selection), xp-system.md §4 (excludes from streak), §5 (excludes from counters), §7 (excludes from achievements). Xp-system.md §4 now explicitly maps all participants in this contract.

## Fixed Issues

### Fix for Issue 8.1

**Resumption Banner fallback for hero_name not fully cross-referenced**

Added an explicit **Contract — hero_name fallback (Resumption Banner)** block after the Field Sources table in ceremony.md §7. The block documents the fallback string ("Aventureiro"), lists all 4 co-owning locations (§1.5, SKILL.md, guide.md §1, and this §7), and states the propagation rule. Updated the Field Sources table entry to reference §1.5 as a fourth co-owner.

**Files changed:** `engine/ceremony.md` (§7 Field Sources table + new contract block)

### Fix for Issue 8.2

**Progress bar contract reference missing in guide.md §5 and §6**

Added a **Contract — progress bar visual consistency** block in guide.md §5, immediately after the `progress_bar()` function definition. This block cross-references ceremony.md §2 (loading sequence), ceremony.md §7 (Resumption Banner), and guide.md §6 (summary view) as co-owners of the unified visual contract.

Added a matching contract block in guide.md §6 (Summary View), cross-referencing the same 4 locations and pointing to §5 as the canonical implementation.

**Files changed:** `engine/guide.md` (§5 after progress_bar() function, §6 after IMPORTANT paragraph)

### Fix for Issue 8.3

**Deprecation warning for total_xp >= N not surfaced in checklist.md**

Added a visible blockquote deprecation warning in checklist.md §1, immediately after the YAML comment block for achievements. The warning is now a `> ⚠️ DEPRECATION WARNING:` block that pack authors will see when reading the quest-log template, referencing xp-system.md §7 for full details and migration guidance.

**Files changed:** `engine/checklist.md` (§1 achievements field, after YAML comments)

### Fix for Issue 8.4

**Edge case for unused items in streak calculation not cross-referenced**

Added a cross-reference comment block in xp-system.md §4 (streak calculation), immediately after the existing NOTE comment. The new block lists all 5 modules that participate in the unused items contract: checklist.md §1 (defines status), guide.md §2 (skips in selection), xp-system.md §5 (excludes from counters), xp-system.md §7 (excludes from achievements). States that all modules must exclude unused items consistently.

**Files changed:** `engine/xp-system.md` (§4 streak calculation, after NOTE comment)
