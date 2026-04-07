---
protocol: code-review-ping-pong
type: review
round: 15
date: "2026-04-01"
reviewer: "OpenAI gpt-4.1"
commit_sha: "unknown"
branch: "chore/devops-10-improvements"
files_in_scope:
  - "SKILL.md"
  - "engine/ceremony.md"
  - "engine/checklist.md"
  - "engine/guide.md"
  - "engine/scanner.md"
  - "engine/xp-system.md"
score: 8
verdict: "CONTINUE"
issues:
  - id: "15.1"
    severity: "HIGH"
    title: "XP achievement condition naming and deprecation warning are still potentially confusing for pack authors"
    file: "engine/xp-system.md"
    line: "312-350"
    suggestion: "Clarify in the achievement evaluation section that 'total_xp >= N' is deprecated and always evaluates 'total_base_xp', not the user-facing total_xp. The warning should be more prominent and explicitly direct pack authors to use 'item_xp >= N' only. Add a cross-reference to checklist.md §1 and SKILL.md Critical Rule 5, and ensure the warning is at the very top of the supported conditions list for maximum visibility."
  - id: "15.2"
    severity: "MEDIUM"
    title: "Progress bar contract reference missing in guide.md §6 Summary View"
    file: "engine/guide.md"
    line: "670-690"
    suggestion: "In guide.md §6 (Summary View), add an explicit inline reference to the unified progress bar contract (ceremony.md §2, ceremony.md §7, guide.md §5). State that all four locations must use the same characters and logic. This ensures visual consistency and prevents future drift."
  - id: "15.3"
    severity: "MEDIUM"
    title: "Edge case for unused items in achievement conditions not cross-referenced in xp-system.md §7"
    file: "engine/xp-system.md"
    line: "400-420"
    suggestion: "In xp-system.md §7 (Achievement Evaluation), add an explicit cross-reference to the unused items contract in checklist.md §1 and guide.md §2, clarifying that unused items are always excluded from all achievement conditions. This strengthens the contract and prevents future confusion."
  - id: "15.4"
    severity: "MEDIUM"
    title: "Free-text table in scanner.md §6 could be misread as hardcoded—clarify dynamic ID derivation"
    file: "engine/scanner.md"
    line: "410-425"
    suggestion: "In scanner.md §6 (free-text table), clarify with a short inline note that IDs in examples are illustrative only and must always be derived from the validated pack schema at runtime. Reference checklist.md §1 for canonical item ID rules."
---

# Code Ping-Pong — Round 15 Review

## 🎯 Score: 8/10 — CONTINUE

## Issues

### 🟠 HIGH

#### Issue 15.1 — XP achievement condition naming and deprecation warning are still potentially confusing for pack authors
- **File:** `engine/xp-system.md`
- **Line:** 312-350
- **Problem:** The deprecation warning for `total_xp >= N` is present but not prominent enough. Pack authors may still confuse `total_xp` (user-facing) with `total_base_xp` (item-only XP), risking misconfigured achievements. The warning is not at the top of the supported conditions list and does not explicitly direct authors to use only `item_xp >= N`. Cross-references to checklist.md §1 and SKILL.md Critical Rule 5 are present but could be more visible.
- **Suggestion:** Clarify in the achievement evaluation section that 'total_xp >= N' is deprecated and always evaluates 'total_base_xp', not the user-facing total_xp. The warning should be more prominent and explicitly direct pack authors to use 'item_xp >= N' only. Add a cross-reference to checklist.md §1 and SKILL.md Critical Rule 5, and ensure the warning is at the very top of the supported conditions list for maximum visibility.

### 🟡 MEDIUM

#### Issue 15.2 — Progress bar contract reference missing in guide.md §6 Summary View
- **File:** `engine/guide.md`
- **Line:** 670-690
- **Problem:** The Summary View in guide.md §6 uses a progress bar but does not explicitly reference the unified contract for bar characters, width, and rounding logic. This could lead to divergence from ceremony.md §2, ceremony.md §7, and guide.md §5.
- **Suggestion:** In guide.md §6 (Summary View), add an explicit inline reference to the unified progress bar contract (ceremony.md §2, ceremony.md §7, guide.md §5). State that all four locations must use the same characters and logic. This ensures visual consistency and prevents future drift.

#### Issue 15.3 — Edge case for unused items in achievement conditions not cross-referenced in xp-system.md §7
- **File:** `engine/xp-system.md`
- **Line:** 400-420
- **Problem:** The exclusion of unused items from achievement conditions is implemented, but there is no explicit cross-reference to the unused items contract in checklist.md §1 or guide.md §2. This weakens the contract for how unused items are excluded from all achievement logic.
- **Suggestion:** In xp-system.md §7 (Achievement Evaluation), add an explicit cross-reference to the unused items contract in checklist.md §1 and guide.md §2, clarifying that unused items are always excluded from all achievement conditions. This strengthens the contract and prevents future confusion.

#### Issue 15.4 — Free-text table in scanner.md §6 could be misread as hardcoded—clarify dynamic ID derivation
- **File:** `engine/scanner.md`
- **Line:** 410-425
- **Problem:** The free-text table in scanner.md §6 uses example IDs that could be misread as hardcoded. Although a drift warning was added previously, it would be clearer to add a short inline note that IDs in examples are illustrative only and must always be derived from the validated pack schema at runtime.
- **Suggestion:** In scanner.md §6 (free-text table), clarify with a short inline note that IDs in examples are illustrative only and must always be derived from the validated pack schema at runtime. Reference checklist.md §1 for canonical item ID rules.

## ✅ What Is Good
- All hero_name and hero_title fallback contracts are now fully cross-referenced and consistent across SKILL.md, ceremony.md, and guide.md.
- Progress bar visual contract is enforced and referenced in ceremony.md §2, §7, and guide.md §5.
- Unused item handling is robust and consistently excluded from streaks, progress, and phase unlock logic.
- Condition evaluation and fallback logic are well documented and defensively coded.
- Scanner module schema validation and fallback handling for optional fields are comprehensive and forward-compatible.
- Integration Gate and phase unlock logic are clear and cross-referenced.
- Achievement evaluation logic is deterministic and avoids circular dependencies.

## 📊 Summary
- **Total issues:** 4
- **By severity:** 🔴 0 CRITICAL, 🟠 1 HIGH, 🟡 3 MEDIUM, 🟢 0 LOW