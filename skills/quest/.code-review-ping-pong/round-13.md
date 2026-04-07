---
protocol: code-review-ping-pong
type: review
round: 13
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
  - id: "13.1"
    severity: "HIGH"
    title: "Progress bar contract drift risk in ceremony.md §7 and guide.md §5/§6"
    file: "engine/ceremony.md"
    line: "470-502"
    suggestion: "Add an explicit, inline contract reference in ceremony.md §7 Resumption Banner to the unified progress bar contract (ceremony.md §2, guide.md §5, guide.md §6). State that all four locations must use the same characters (`█`/`░`), width (20), and rounding logic. This prevents silent drift if one location changes."
  - id: "13.2"
    severity: "HIGH"
    title: "Voice Rule 1 fallback contract for hero_name and hero_title missing explicit cross-references"
    file: "engine/guide.md"
    line: "13-30"
    suggestion: "In guide.md §1 (Voice Rule 1), add an explicit contract block referencing SKILL.md, ceremony.md §1.5, and ceremony.md §7 for the hero_name fallback ('Aventureiro') and hero_title fallback (empty string). State that all four locations must use the same fallback and that changes require propagation. This prevents silent drift."
  - id: "13.3"
    severity: "MEDIUM"
    title: "Unused items exclusion contract in checklist.md could be more explicit"
    file: "engine/checklist.md"
    line: "94-110"
    suggestion: "In checklist.md §1 (unused items lifecycle), add a consolidated contract block referencing xp-system.md §4 (streaks), §5 (counters), §7 (achievements), guide.md §2 (phase unlock), guide.md §4.2/§4.5 (completion triggers), and ceremony.md §7 (stats display). This ensures all modules that iterate items or calculate stats must skip `status == \"unused\"`."
  - id: "13.4"
    severity: "MEDIUM"
    title: "Free-text table in scanner.md §6 uses illustrative IDs without schema-driven warning"
    file: "engine/scanner.md"
    line: "410-425"
    suggestion: "In scanner.md §6 (free-text table), clarify that IDs shown are illustrative and must be derived from the validated pack schema at runtime. Add a warning that hardcoding IDs risks drift if packs change. Reference checklist.md §1 for canonical item ID rules."
---

# Code Ping-Pong — Round 13 Review

## 🎯 Score: 8/10 — CONTINUE

## Issues

### 🟠 HIGH

#### Issue 13.1 — Progress bar contract drift risk in ceremony.md §7 and guide.md §5/§6
- **File:** `engine/ceremony.md`
- **Line:** 470-502
- **Problem:** The Resumption Banner in ceremony.md §7 uses a progress bar but does not explicitly reference the unified contract for bar characters, width, and rounding logic. This could lead to divergence from ceremony.md §2, guide.md §5, and guide.md §6.
- **Suggestion:** Add an explicit, inline contract reference in ceremony.md §7 Resumption Banner to the unified progress bar contract (ceremony.md §2, guide.md §5, guide.md §6). State that all four locations must use the same characters (`█`/`░`), width (20), and rounding logic. This prevents silent drift if one location changes.

#### Issue 13.2 — Voice Rule 1 fallback contract for hero_name and hero_title missing explicit cross-references
- **File:** `engine/guide.md`
- **Line:** 13-30
- **Problem:** The fallback for `{hero_name}` and `{hero_title}` in Voice Rule 1 is described, but there is no explicit contract block referencing SKILL.md, ceremony.md §1.5, and ceremony.md §7 as co-owners. This creates risk of silent drift if the fallback changes elsewhere.
- **Suggestion:** In guide.md §1 (Voice Rule 1), add an explicit contract block referencing SKILL.md, ceremony.md §1.5, and ceremony.md §7 for the hero_name fallback ('Aventureiro') and hero_title fallback (empty string). State that all four locations must use the same fallback and that changes require propagation. This prevents silent drift.

### 🟡 MEDIUM

#### Issue 13.3 — Unused items exclusion contract in checklist.md could be more explicit
- **File:** `engine/checklist.md`
- **Line:** 94-110
- **Problem:** The lifecycle of `unused` items is well described, but the cross-references to all enforcement points (xp-system.md §4/§5/§7, guide.md §2/§4.2/§4.5, ceremony.md §7) are not consolidated in a single contract block. This weakens the contract for how unused items are excluded from streaks, progress, achievements, and stats.
- **Suggestion:** In checklist.md §1 (unused items lifecycle), add a consolidated contract block referencing xp-system.md §4 (streaks), §5 (counters), §7 (achievements), guide.md §2 (phase unlock), guide.md §4.2/§4.5 (completion triggers), and ceremony.md §7 (stats display). This ensures all modules that iterate items or calculate stats must skip `status == "unused"`.

#### Issue 13.4 — Free-text table in scanner.md §6 uses illustrative IDs without schema-driven warning
- **File:** `engine/scanner.md`
- **Line:** 410-425
- **Problem:** The free-text table in scanner.md §6 uses hardcoded example IDs, which could drift from the actual pack schema if not clearly marked as illustrative. There is no warning that IDs must be derived from the validated pack schema at runtime.
- **Suggestion:** In scanner.md §6 (free-text table), clarify that IDs shown are illustrative and must be derived from the validated pack schema at runtime. Add a warning that hardcoding IDs risks drift if packs change. Reference checklist.md §1 for canonical item ID rules.

## ✅ What Is Good
- All cross-module contracts are generally well documented and referenced.
- Fallbacks for hero_name and hero_title are consistently described in all modules.
- Progress bar logic and visual style are unified across modules.
- Edge cases for unused items and condition evaluation are handled defensively.
- Scanner module's schema validation and fallback logic are robust and forward-compatible.
- XP and achievement systems are clearly documented and avoid circular dependencies.

## 📊 Summary
- **Total issues:** 4
- **By severity:** 🔴 0 CRITICAL, 🟠 2 HIGH, 🟡 2 MEDIUM, 🟢 0 LOW