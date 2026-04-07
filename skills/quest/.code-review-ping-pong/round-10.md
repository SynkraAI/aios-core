---
protocol: code-review-ping-pong
type: review
round: 10
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
  - id: "10.1"
    severity: "HIGH"
    title: "Missing explicit cross-reference for hero_title fallback contract"
    file: "engine/guide.md"
    line: "18-30"
    suggestion: "Add an explicit contract block in guide.md §1 (Voice Rule 1) for the hero_title fallback (empty string), referencing SKILL.md, ceremony.md §1.5, and ceremony.md §7. State that all four locations must use the same fallback for hero_title, just as for hero_name. This prevents silent drift if the fallback changes."
  - id: "10.2"
    severity: "HIGH"
    title: "Progress bar contract reference missing in checklist.md for stats display"
    file: "engine/checklist.md"
    line: "140-155"
    suggestion: "In checklist.md, in the stats calculation/output section, add an explicit reference to the unified progress bar contract (ceremony.md §2, ceremony.md §7, guide.md §5, guide.md §6) for any visual stats/progress output. This ensures that if checklist ever outputs a progress bar, it must use the same characters and logic."
  - id: "10.3"
    severity: "MEDIUM"
    title: "Edge case for unused items in achievement evaluation not cross-referenced in guide.md"
    file: "engine/guide.md"
    line: "210-225"
    suggestion: "In guide.md §4 (Celebrations/Achievements), add a cross-reference to checklist.md §1 and xp-system.md §7 clarifying that unused items are excluded from all achievement conditions and triggers. This strengthens the contract and prevents future confusion."
  - id: "10.4"
    severity: "MEDIUM"
    title: "Free-text table in scanner.md §6 lacks explicit reference to canonical item ID rules"
    file: "engine/scanner.md"
    line: "410-425"
    suggestion: "In scanner.md §6 (free-text table), add a reference to checklist.md §1 and xp-system.md §2.0 for canonical item ID derivation. State that all IDs in examples must be schema-derived and that hardcoding risks drift."
---

# Code Ping-Pong — Round 10 Review

## 🎯 Score: 8/10 — CONTINUE

## Issues

### 🟠 HIGH

#### Issue 10.1 — Missing explicit cross-reference for hero_title fallback contract
- **File:** `engine/guide.md`
- **Line:** 18-30
- **Problem:** While the hero_name fallback contract is now explicit and cross-referenced, the fallback for hero_title (empty string) is not explicitly documented as a shared contract across SKILL.md, guide.md, ceremony.md §1.5, and ceremony.md §7. This creates risk of silent drift if the fallback changes elsewhere.
- **Suggestion:** Add an explicit contract block in guide.md §1 (Voice Rule 1) for the hero_title fallback (empty string), referencing SKILL.md, ceremony.md §1.5, and ceremony.md §7. State that all four locations must use the same fallback for hero_title, just as for hero_name. This prevents silent drift if the fallback changes.

#### Issue 10.2 — Progress bar contract reference missing in checklist.md for stats display
- **File:** `engine/checklist.md`
- **Line:** 140-155
- **Problem:** The checklist module calculates and outputs stats, but there is no explicit reference to the unified progress bar contract (ceremony.md §2, ceremony.md §7, guide.md §5, guide.md §6) in the relevant section. If checklist ever outputs a progress bar (e.g., in future dashboard or CLI views), it could diverge from the canonical style.
- **Suggestion:** In checklist.md, in the stats calculation/output section, add an explicit reference to the unified progress bar contract (ceremony.md §2, ceremony.md §7, guide.md §5, guide.md §6) for any visual stats/progress output. This ensures that if checklist ever outputs a progress bar, it must use the same characters and logic.

### 🟡 MEDIUM

#### Issue 10.3 — Edge case for unused items in achievement evaluation not cross-referenced in guide.md
- **File:** `engine/guide.md`
- **Line:** 210-225
- **Problem:** The exclusion of unused items from achievement conditions is well documented in checklist.md and xp-system.md, but guide.md §4 (Celebrations/Achievements) does not explicitly cross-reference this contract. This could lead to future confusion about which items count for achievement triggers.
- **Suggestion:** In guide.md §4 (Celebrations/Achievements), add a cross-reference to checklist.md §1 and xp-system.md §7 clarifying that unused items are excluded from all achievement conditions and triggers. This strengthens the contract and prevents future confusion.

#### Issue 10.4 — Free-text table in scanner.md §6 lacks explicit reference to canonical item ID rules
- **File:** `engine/scanner.md`
- **Line:** 410-425
- **Problem:** While a drift warning exists, the free-text example table in scanner.md §6 does not explicitly reference the canonical item ID derivation rules from checklist.md §1 and xp-system.md §2.0. This could lead to future example drift or misunderstanding by pack authors.
- **Suggestion:** In scanner.md §6 (free-text table), add a reference to checklist.md §1 and xp-system.md §2.0 for canonical item ID derivation. State that all IDs in examples must be schema-derived and that hardcoding risks drift.

## ✅ What Is Good
- All major cross-module contracts are now explicit and referenced in at least three locations.
- Progress bar visual consistency is enforced across ceremony.md, guide.md, and referenced in most relevant modules.
- The fallback for hero_name is now robustly protected against drift.
- Unused item handling is well documented and enforced in streaks, stats, and progress calculations.
- Scanner module schema validation and fallback logic are clear and robust.
- Achievement evaluation logic is consistent and cross-referenced in xp-system.md and checklist.md.

## 📊 Summary
- **Total issues:** 4
- **By severity:** 🔴 0 CRITICAL, 🟠 2 HIGH, 🟡 2 MEDIUM, 🟢 0 LOW