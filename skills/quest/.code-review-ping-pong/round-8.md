---
protocol: code-review-ping-pong
type: review
round: 8
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
  - id: "8.1"
    severity: "HIGH"
    title: "Resumption Banner fallback for hero_name not fully cross-referenced"
    file: "engine/ceremony.md"
    line: "470-480"
    suggestion: "In ceremony.md §7 (Resumption Banner), explicitly reference the hero_name fallback contract and cross-link to SKILL.md and guide.md §1. Ensure the fallback string and propagation rule are stated in the banner's field source."
  - id: "8.2"
    severity: "HIGH"
    title: "Progress bar contract reference missing in guide.md §5 and §6"
    file: "engine/guide.md"
    line: "320-340"
    suggestion: "In guide.md §5 (Quest Log View) and §6 (Summary View), add explicit references to the unified progress bar contract (ceremony.md §2, ceremony.md §7), including the prohibition of ▓ (U+2593). This prevents silent divergence in visual output."
  - id: "8.3"
    severity: "MEDIUM"
    title: "Deprecation warning for total_xp >= N not surfaced in checklist.md"
    file: "engine/checklist.md"
    line: "38-54"
    suggestion: "In checklist.md §1 (achievements field), add a visible deprecation warning for 'total_xp >= N' conditions, referencing xp-system.md §7. This ensures pack authors and maintainers see the warning in both modules."
  - id: "8.4"
    severity: "MEDIUM"
    title: "Edge case for unused items in streak calculation not cross-referenced"
    file: "engine/xp-system.md"
    line: "110-125"
    suggestion: "In xp-system.md §4 (streak calculation), add a cross-reference to checklist.md §1 and guide.md §2 clarifying that unused items are excluded from streaks. This strengthens the contract and prevents future confusion."
---

# Code Ping-Pong — Round 8 Review

## 🎯 Score: 8/10 — CONTINUE

## Issues

### 🟠 HIGH

#### Issue 8.1 — Resumption Banner fallback for hero_name not fully cross-referenced
- **File:** `engine/ceremony.md`
- **Line:** 470-480
- **Problem:** The Resumption Banner in ceremony.md §7 uses the hero_name field but does not explicitly reference the fallback contract or cross-link to SKILL.md and guide.md §1. This creates risk of silent drift if the fallback changes elsewhere.
- **Suggestion:** In ceremony.md §7 (Resumption Banner), explicitly reference the hero_name fallback contract and cross-link to SKILL.md and guide.md §1. Ensure the fallback string and propagation rule are stated in the banner's field source.

#### Issue 8.2 — Progress bar contract reference missing in guide.md §5 and §6
- **File:** `engine/guide.md`
- **Line:** 320-340
- **Problem:** The progress bar visual contract is referenced in ceremony.md §2 and §7, but not in guide.md §5 (Quest Log View) or §6 (Summary View), both of which render progress bars. This could lead to accidental divergence in character set or bar width.
- **Suggestion:** In guide.md §5 (Quest Log View) and §6 (Summary View), add explicit references to the unified progress bar contract (ceremony.md §2, ceremony.md §7), including the prohibition of ▓ (U+2593). This prevents silent divergence in visual output.

### 🟡 MEDIUM

#### Issue 8.3 — Deprecation warning for total_xp >= N not surfaced in checklist.md
- **File:** `engine/checklist.md`
- **Line:** 38-54
- **Problem:** The deprecation of the 'total_xp >= N' achievement condition is documented in xp-system.md §7, but checklist.md §1 (achievements field) only references it in a comment. Pack authors or maintainers reading only checklist.md may miss the warning.
- **Suggestion:** In checklist.md §1 (achievements field), add a visible deprecation warning for 'total_xp >= N' conditions, referencing xp-system.md §7. This ensures pack authors and maintainers see the warning in both modules.

#### Issue 8.4 — Edge case for unused items in streak calculation not cross-referenced
- **File:** `engine/xp-system.md`
- **Line:** 110-125
- **Problem:** The exclusion of unused items from streak calculation is documented in xp-system.md §4, but does not cross-reference checklist.md §1 or guide.md §2, which define and consume the unused status. This weakens the contract and could lead to future confusion.
- **Suggestion:** In xp-system.md §4 (streak calculation), add a cross-reference to checklist.md §1 and guide.md §2 clarifying that unused items are excluded from streaks. This strengthens the contract and prevents future confusion.

## ✅ What Is Good
- Cross-module contracts for hero_name fallback and unused item handling are now mostly explicit and referenced.
- Progress bar visual consistency is enforced in ceremony.md and referenced in multiple places.
- Condition fallback and propagation are clearly documented in guide.md and checklist.md.
- Edge case handling for malformed fields and missing optionals is robust and consistently documented.
- The dependency graph remains acyclic and well-structured.
- All modules treat optional fields with safe, documented fallbacks.

## 📊 Summary
- **Total issues:** 4
- **By severity:** 🔴 0 CRITICAL, 🟠 2 HIGH, 🟡 2 MEDIUM, 🟢 0 LOW