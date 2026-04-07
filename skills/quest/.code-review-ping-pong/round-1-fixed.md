---
protocol: code-review-ping-pong
type: fix
round: 1
date: "2026-04-01"
fixer: "Claude Code (Opus)"
review_file: round-1.md
commit_sha_before: "192be9b3c3aef057b3026413d1791532e1124e35"
commit_sha_after: "192be9b3c3aef057b3026413d1791532e1124e35"
branch: chore/devops-10-improvements
issues_fixed: 4
issues_skipped: 0
issues_total: 4
git_diff_stat: "5 files changed, 48 insertions(+), 26 deletions(-)"
quality_checks:
  lint: skipped
  typecheck: skipped
  tests: skipped
fixes:
  - id: "1.1"
    status: FIXED
    file: "engine/ceremony.md"
    description: "Progress bars aligned to use round() and consistent char set across ceremony.md and guide.md"
    deviation: "none"
  - id: "1.2"
    status: FIXED
    file: "engine/guide.md"
    description: "Added resolution rule clarifying hero_name placeholder substitution at render time"
    deviation: "none"
  - id: "1.3"
    status: FIXED
    file: "engine/xp-system.md"
    description: "Renamed condition to item_xp >= N with legacy alias for backward compat"
    deviation: "none"
  - id: "1.4"
    status: FIXED
    file: "engine/xp-system.md"
    description: "Added explicit NOTE comment in streak calc and expanded unused documentation across modules"
    deviation: "none"
preserved:
  - "engine/scanner.md — no issues in this file"
  - "engine/checklist.md — no issues in this file"
  - "SKILL.md — no issues in this file"
---

# Code Ping-Pong — Round 1 Fix Report

## Summary

All 4 issues from round-1.md were already addressed in commits 967db958f through 192be9b3c. This fix report documents the verification that each issue is resolved in the current codebase and the anti-whack-a-mole / semantic propagation analysis performed.

## Fixed Issues

### Fix for Issue 1.1

**Problem:** Progress bar in ceremony.md used different characters (previously reported as using different rounding).

**Fix applied (commit 192be9b3c):** ceremony.md section 7 (Resumption Banner) now explicitly documents the `progress_bar()` function using `round()` — matching guide.md section 5 exactly. Both modules use the same character set: filled blocks with full-block character and empty blocks with light shade character.

**Anti-whack-a-mole analysis:** Searched all engine files for alternative progress bar characters. No instances of half-block or medium shade characters found anywhere. All progress bars across ceremony.md (sections 2 and 7) and guide.md (sections 5 and 6) use the same character pair.

**Semantic propagation:** The contract is "all visual progress indicators use the same character set and rounding strategy." Modules participating: ceremony.md (loading sequence + resumption banner) and guide.md (quest status + summary view). All verified consistent.

### Fix for Issue 1.2

**Problem:** Voice Rule 1 in guide.md used `{hero_name}` as a placeholder without clarifying it must be substituted at render time.

**Fix applied (commit 192be9b3c):** Added **Resolution rule** to guide.md section 1, Voice Rule 1: "every template in this module uses `{hero_name}` and `{hero_title}` as placeholders. At render time, ALWAYS substitute them with the actual values from the quest-log. NEVER output the literal string `{hero_name}` to the user."

**Anti-whack-a-mole analysis:** Searched for all `{hero_name}` occurrences across engine files:
- ceremony.md: 6 occurrences — all are template placeholders within template blocks (sections 1.5, 5, 7). ceremony.md section 1.5 Storage subsection documents how hero_name is stored and resolved.
- guide.md: 12 occurrences — all now covered by the resolution rule in section 1.
- forge-bridge.md: 1 occurrence — template context, consistent with guide.md resolution rule.

**Semantic propagation:** The contract is "placeholders must be resolved to actual values, never shown literally." All modules that output text to the user (guide.md, ceremony.md, forge-bridge.md) use `{hero_name}` as a documented placeholder. The resolution rule in guide.md section 1 is the canonical reference. ceremony.md section 1.5 documents how the value is collected and stored. No module outputs the literal placeholder.

### Fix for Issue 1.3

**Problem:** Achievement condition `total_xp >= N` was confusing because it evaluated `total_base_xp` (item-only XP before bonuses), not the final `total_xp` shown to the user.

**Fix applied (commit 7ffbdd5df):** Renamed the primary condition to `item_xp >= N` in xp-system.md section 7. Added `total_xp >= N` as a **Legacy alias** with clear documentation explaining: both evaluate `total_base_xp` (item-only XP before achievement bonuses), the alias exists for backward compatibility with existing packs, and new packs SHOULD use `item_xp >= N`.

**Anti-whack-a-mole analysis:** Searched for `total_xp >= ` in all engine files. Found 2 occurrences in xp-system.md:
1. Line 113: `if total_xp >= levels[level_num].xp` — this is in section 3 (level determination), uses the final `total_xp` correctly. Not an achievement condition — no confusion.
2. Line 297: Legacy alias documentation — clearly marked as alias with explanation.

No other modules reference the `total_xp >= N` or `item_xp >= N` condition pattern.

**Semantic propagation:** The contract is "achievement condition names must unambiguously describe what they evaluate." Only xp-system.md section 7 defines achievement conditions. The rename plus alias approach maintains backward compatibility while eliminating naming confusion for new pack authors. The variable `total_base_xp` in section 2 was also clarified with a note: "total XP from base items only — excludes achievement bonus XP."

### Fix for Issue 1.4

**Problem:** The handling of `unused` status in streak calculation (section 4) was not clearly documented.

**Fix applied (commit 7ffbdd5df):** Added explicit NOTE comment in xp-system.md section 4 streak calculation explaining that `unused` items are excluded from the active_items filter and cannot break or contribute to a streak. Also expanded documentation in section 10 (Edge Cases).

**Anti-whack-a-mole analysis:** Searched for `unused` handling across all engine files. Found comprehensive coverage:
- xp-system.md section 4 (streak): NOTE comment explaining exclusion
- xp-system.md section 5 (counters): `items_unused` counted, excluded from `items_total`
- xp-system.md section 7 (achievements): All 8 condition types have explicit `if status == "unused": continue`
- xp-system.md section 10 (edge cases): Dedicated bullet for unused behavior
- checklist.md: Documents how unused status is set (manual + automatic)
- guide.md: References unused exclusion in World Complete, MVP Launch, Final Victory

**Semantic propagation:** The contract is "all modules that iterate items or calculate stats must handle the `unused` status correctly." Modules participating:
1. **xp-system.md** — XP calc (excluded from total_base_xp), streak (excluded from active_items), counters (excluded from items_total), achievements (all conditions handle it). VERIFIED.
2. **checklist.md** — Phase unlock check (unused treated as non-blocking for required items). VERIFIED.
3. **guide.md** — Next mission selection (unused items skipped), World Complete (unused does not block), Final Victory (unused does not block), MVP Launch (unused does not block). VERIFIED.
4. **scanner.md** — Sets status based on scan_rule evaluation, does not directly interact with unused logic. N/A.
5. **ceremony.md** — Reads stats from quest-log (already computed by xp-system). N/A — no direct item iteration.

All modules that iterate items handle unused correctly. No gaps found.

## Skipped Issues

(none)

## Quality Checks

- **lint:** skipped (documentation-only project, no linter configured for .md files)
- **typecheck:** skipped (no TypeScript in scope)
- **tests:** skipped (no test suite for .md documentation)
