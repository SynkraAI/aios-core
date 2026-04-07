---
protocol: code-review-ping-pong
type: review
round: 12
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
  - id: "12.1"
    severity: "HIGH"
    title: "Progress bar contract reference not fully propagated in guide.md §5"
    file: "engine/guide.md"
    line: "659-664"
    suggestion: "Add an explicit inline reference in guide.md §5 (Quest Log View) to the unified progress bar contract (ceremony.md §2, ceremony.md §7, guide.md §6). State that all four locations must use the same characters and logic. This ensures visual consistency and prevents silent drift."
  - id: "12.2"
    severity: "HIGH"
    title: "Achievement condition deprecation warning not cross-referenced in SKILL.md"
    file: "SKILL.md"
    line: "80-90"
    suggestion: "In SKILL.md, add a cross-reference to xp-system.md §7 and checklist.md §1 regarding the deprecation of 'total_xp >= N' in achievement conditions. Make it explicit that pack authors must use 'item_xp >= N' and that 'total_xp >= N' is an alias only for backward compatibility. This prevents confusion for pack authors."
  - id: "12.3"
    severity: "MEDIUM"
    title: "Edge case for unused items in phase unlock not cross-referenced in guide.md §2"
    file: "engine/guide.md"
    line: "71-88"
    suggestion: "In guide.md §2 (Next Mission Selection), add a cross-reference to checklist.md §1 and xp-system.md §5 clarifying that items with status 'unused' are excluded from phase unlock checks and do not block progression. This strengthens the contract and prevents future confusion."
  - id: "12.4"
    severity: "MEDIUM"
    title: "Fallback for missing or malformed 'condition' field not referenced in guide.md"
    file: "engine/guide.md"
    line: "54-70"
    suggestion: "In guide.md §2, add a cross-reference to checklist.md §1 regarding the fallback behavior for missing or malformed 'condition' fields. State that such items are treated as unconditional/pending, and that this rule is enforced in both modules for forward compatibility."
---

# Code Ping-Pong — Round 12 Review

## 🎯 Score: 8/10 — CONTINUE

## Issues

### 🟠 HIGH

#### Issue 12.1 — Progress bar contract reference not fully propagated in guide.md §5
- **File:** `engine/guide.md`
- **Line:** 659-664
- **Problem:** The Quest Log View in guide.md §5 uses the progress bar but does not explicitly reference the unified contract for bar characters, width, and rounding logic. This could lead to divergence from ceremony.md §2, ceremony.md §7, and guide.md §6.
- **Suggestion:** Add an explicit inline reference in guide.md §5 (Quest Log View) to the unified progress bar contract (ceremony.md §2, ceremony.md §7, guide.md §6). State that all four locations must use the same characters and logic. This ensures visual consistency and prevents silent drift.

#### Issue 12.2 — Achievement condition deprecation warning not cross-referenced in SKILL.md
- **File:** `SKILL.md`
- **Line:** 80-90
- **Problem:** The deprecation of the achievement condition `total_xp >= N` is mentioned in checklist.md and xp-system.md, but SKILL.md does not cross-reference these sections. This could confuse pack authors about which condition to use.
- **Suggestion:** In SKILL.md, add a cross-reference to xp-system.md §7 and checklist.md §1 regarding the deprecation of 'total_xp >= N' in achievement conditions. Make it explicit that pack authors must use 'item_xp >= N' and that 'total_xp >= N' is an alias only for backward compatibility. This prevents confusion for pack authors.

### 🟡 MEDIUM

#### Issue 12.3 — Edge case for unused items in phase unlock not cross-referenced in guide.md §2
- **File:** `engine/guide.md`
- **Line:** 71-88
- **Problem:** The phase unlock logic in guide.md §2 correctly skips items with status 'unused', but there is no explicit cross-reference to checklist.md §1 or xp-system.md §5. This weakens the contract for how unused items are excluded from phase unlock checks.
- **Suggestion:** In guide.md §2 (Next Mission Selection), add a cross-reference to checklist.md §1 and xp-system.md §5 clarifying that items with status 'unused' are excluded from phase unlock checks and do not block progression. This strengthens the contract and prevents future confusion.

#### Issue 12.4 — Fallback for missing or malformed 'condition' field not referenced in guide.md
- **File:** `engine/guide.md`
- **Line:** 54-70
- **Problem:** The fallback for missing or malformed 'condition' fields is implemented, but there is no explicit cross-reference to checklist.md §1. This could lead to silent drift if the fallback logic changes in one module but not the other.
- **Suggestion:** In guide.md §2, add a cross-reference to checklist.md §1 regarding the fallback behavior for missing or malformed 'condition' fields. State that such items are treated as unconditional/pending, and that this rule is enforced in both modules for forward compatibility.

## ✅ What Is Good
- All hero_name and hero_title fallback contracts are now explicitly referenced in all four required locations.
- Progress bar visual contract is well documented and referenced in most modules.
- Unused items are consistently excluded from streaks, progress, achievements, and phase unlock logic.
- Scanner module now warns about hardcoded IDs and references canonical ID rules.
- Deprecation warnings for achievement conditions are present in checklist.md and xp-system.md.
- Defensive guards for missing/optional fields are robust and cross-referenced.

## 📊 Summary
- **Total issues:** 4
- **By severity:** 🔴 0 CRITICAL, 🟠 2 HIGH, 🟡 2 MEDIUM, 🟢 0 LOW