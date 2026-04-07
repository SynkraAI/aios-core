---
protocol: code-review-ping-pong
type: review
round: 5
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
  - id: "5.1"
    severity: "HIGH"
    title: "Voice Rule 1 fallback for hero_name not documented in SKILL.md"
    file: "SKILL.md"
    line: "10-18"
    suggestion: "Add an explicit contract note that the fallback for missing/empty hero_name is 'Aventureiro', as implemented in guide.md §1. This ensures orchestrator and guide modules never diverge on fallback logic."
  - id: "5.2"
    severity: "HIGH"
    title: "Resumption Banner contract propagation incomplete in checklist.md"
    file: "engine/checklist.md"
    line: "122-130"
    suggestion: "Add a cross-reference in checklist.md (stats calculation section) to the shared progress bar contract in ceremony.md §2/§7 and guide.md §5. This ensures any change to bar width, characters, or rounding propagates to checklist-driven stats and visualizations."
  - id: "5.3"
    severity: "MEDIUM"
    title: "Sub-item XP calculation not referenced in ceremony.md Project Card"
    file: "engine/ceremony.md"
    line: "180-185"
    suggestion: "Add a note in the Project Card inventory/stats section that sub-items are included in all counters and XP calculations, as per xp-system.md §2 and checklist.md §7.5. This prevents confusion for users and future maintainers."
  - id: "5.4"
    severity: "MEDIUM"
    title: "Pack schema validation error message not referenced in SKILL.md command routing"
    file: "SKILL.md"
    line: "75-80"
    suggestion: "Add a note that if no valid packs remain after schema validation (as per scanner.md §3.2), the orchestrator must show the error message from scanner.md and halt, rather than proceeding to fallback flows."
---

# Code Ping-Pong — Round 5 Review

## 🎯 Score: 8/10 — CONTINUE

## Issues

### 🟠 HIGH

#### Issue 5.1 — Voice Rule 1 fallback for hero_name not documented in SKILL.md
- **File:** `SKILL.md`
- **Line:** 10-18
- **Problem:** The fallback logic for missing or empty `hero_name` ("Aventureiro") is implemented and documented in guide.md §1, but SKILL.md does not mention this contract. This risks divergence if the orchestrator or other modules ever change the fallback independently, leading to inconsistent user addressing.
- **Suggestion:** Add an explicit contract note that the fallback for missing/empty hero_name is 'Aventureiro', as implemented in guide.md §1. This ensures orchestrator and guide modules never diverge on fallback logic.

#### Issue 5.2 — Resumption Banner contract propagation incomplete in checklist.md
- **File:** `engine/checklist.md`
- **Line:** 122-130
- **Problem:** While ceremony.md and guide.md now cross-reference the shared progress bar contract for visual consistency, checklist.md (where stats are calculated and passed to visual modules) does not reference this contract. This could lead to silent drift if the bar width, characters, or rounding logic changes in the visual modules but not in stats generation or vice versa.
- **Suggestion:** Add a cross-reference in checklist.md (stats calculation section) to the shared progress bar contract in ceremony.md §2/§7 and guide.md §5. This ensures any change to bar width, characters, or rounding propagates to checklist-driven stats and visualizations.

### 🟡 MEDIUM

#### Issue 5.3 — Sub-item XP calculation not referenced in ceremony.md Project Card
- **File:** `engine/ceremony.md`
- **Line:** 180-185
- **Problem:** The Project Card section in ceremony.md describes inventory and stats fields but does not mention that sub-items (from checklist.md §7.5) are included in all counters and XP calculations. This omission could confuse users or maintainers, especially since sub-items are not part of the pack YAML but are tracked in quest-log and stats.
- **Suggestion:** Add a note in the Project Card inventory/stats section that sub-items are included in all counters and XP calculations, as per xp-system.md §2 and checklist.md §7.5. This prevents confusion for users and future maintainers.

#### Issue 5.4 — Pack schema validation error message not referenced in SKILL.md command routing
- **File:** `SKILL.md`
- **Line:** 75-80
- **Problem:** SKILL.md's command routing section does not mention that if scanner.md §3.2 finds no valid packs (all fail schema validation), the orchestrator must show the error message and halt, rather than proceeding to fallback flows. This could result in unclear errors or improper fallback behavior.
- **Suggestion:** Add a note that if no valid packs remain after schema validation (as per scanner.md §3.2), the orchestrator must show the error message from scanner.md and halt, rather than proceeding to fallback flows.

## ✅ What Is Good
- Progress bar contract is now consistently referenced in ceremony.md and guide.md.
- Unused item icon `[·]` is visually consistent across guide.md and checklist.md.
- Fallbacks for optional fields in scanner.md are now fully documented.
- Achievement condition naming deprecation is cross-referenced between checklist.md and xp-system.md.
- Condition handling and item status transitions are robust and well-documented.
- Visual and conversational voice rules are clear and consistently enforced.

## 📊 Summary
- **Total issues:** 4
- **By severity:** 🔴 0 CRITICAL, 🟠 2 HIGH, 🟡 2 MEDIUM, 🟢 0 LOW