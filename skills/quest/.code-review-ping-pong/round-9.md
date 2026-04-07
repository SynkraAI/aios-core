---
protocol: code-review-ping-pong
type: review
round: 9
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
  - id: "9.1"
    severity: "HIGH"
    title: "Voice Rule 1 template error fallback contract is not fully explicit"
    file: "engine/guide.md"
    line: "18-30"
    suggestion: "In guide.md §1 (Voice Rule 1), add an explicit contract block referencing SKILL.md and ceremony.md §1.5/§7 for the hero_name fallback ('Aventureiro'). State that all three locations must use the same fallback and that changes require propagation. This prevents silent drift."
  - id: "9.2"
    severity: "HIGH"
    title: "Progress bar contract reference missing in ceremony.md §7 Resumption Banner"
    file: "engine/ceremony.md"
    line: "470-480"
    suggestion: "In ceremony.md §7 (Resumption Banner), add an explicit reference to the unified progress bar contract (ceremony.md §2, guide.md §5, guide.md §6). State that all four locations must use the same characters and logic. This ensures visual consistency."
  - id: "9.3"
    severity: "MEDIUM"
    title: "Edge case for unused items in streak calculation not cross-referenced in checklist.md"
    file: "engine/checklist.md"
    line: "94-110"
    suggestion: "In checklist.md §1 (unused items lifecycle), add a cross-reference to xp-system.md §4 and guide.md §2 clarifying that unused items are excluded from streaks and progress. This strengthens the contract and prevents future confusion."
  - id: "9.4"
    severity: "MEDIUM"
    title: "Free-text table in scanner.md §6 uses hardcoded IDs, not schema-driven"
    file: "engine/scanner.md"
    line: "410-425"
    suggestion: "In scanner.md §6 (free-text table), clarify that IDs must be derived from the validated pack schema, not hardcoded. Add a warning that hardcoding IDs risks drift if packs change. Reference checklist.md §1 for canonical item ID rules."
---

# Code Ping-Pong — Round 9 Review

## 🎯 Score: 8/10 — CONTINUE

## Issues

### 🟠 HIGH

#### Issue 9.1 — Voice Rule 1 template error fallback contract is not fully explicit
- **File:** `engine/guide.md`
- **Line:** 18-30
- **Problem:** The fallback for `{hero_name}` in Voice Rule 1 is described, but there is no explicit contract block referencing SKILL.md and ceremony.md §1.5/§7 as co-owners. This creates risk of silent drift if the fallback changes elsewhere.
- **Suggestion:** In guide.md §1 (Voice Rule 1), add an explicit contract block referencing SKILL.md and ceremony.md §1.5/§7 for the hero_name fallback ('Aventureiro'). State that all three locations must use the same fallback and that changes require propagation. This prevents silent drift.

#### Issue 9.2 — Progress bar contract reference missing in ceremony.md §7 Resumption Banner
- **File:** `engine/ceremony.md`
- **Line:** 470-480
- **Problem:** The Resumption Banner in ceremony.md §7 uses a progress bar but does not explicitly reference the unified contract for bar characters, width, and rounding logic. This could lead to divergence from ceremony.md §2, guide.md §5, and guide.md §6.
- **Suggestion:** In ceremony.md §7 (Resumption Banner), add an explicit reference to the unified progress bar contract (ceremony.md §2, guide.md §5, guide.md §6). State that all four locations must use the same characters and logic. This ensures visual consistency.

### 🟡 MEDIUM

#### Issue 9.3 — Edge case for unused items in streak calculation not cross-referenced in checklist.md
- **File:** `engine/checklist.md`
- **Line:** 94-110
- **Problem:** The lifecycle of `unused` items is well described, but there is no explicit cross-reference to xp-system.md §4 (streak calculation) or guide.md §2. This weakens the contract for how unused items are excluded from streaks and progress.
- **Suggestion:** In checklist.md §1 (unused items lifecycle), add a cross-reference to xp-system.md §4 and guide.md §2 clarifying that unused items are excluded from streaks and progress. This strengthens the contract and prevents future confusion.

#### Issue 9.4 — Free-text table in scanner.md §6 uses hardcoded IDs, not schema-driven
- **File:** `engine/scanner.md`
- **Line:** 410-425
- **Problem:** The free-text table in scanner.md §6 uses hardcoded IDs for pack items, which risks drift if the pack schema changes. This is not robust or future-proof.
- **Suggestion:** In scanner.md §6 (free-text table), clarify that IDs must be derived from the validated pack schema, not hardcoded. Add a warning that hardcoding IDs risks drift if packs change. Reference checklist.md §1 for canonical item ID rules.

## ✅ What Is Good
- All previous cross-module contract issues (hero_name fallback, progress bar, deprecation warnings, unused in streaks) have been addressed and are now visible in the relevant files.
- Progress bar character usage is now consistent in ceremony.md §2, guide.md §5, and guide.md §6.
- Deprecation of `total_xp >= N` is clearly surfaced in both checklist.md and xp-system.md.
- The lifecycle and impact of `unused` items is well documented across modules.
- Defensive guards for template placeholders are present in guide.md §1.

## 📊 Summary
- **Total issues:** 4
- **By severity:** 🔴 0 CRITICAL, 🟠 2 HIGH, 🟡 2 MEDIUM, 🟢 0 LOW