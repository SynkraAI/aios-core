---
protocol: code-review-ping-pong
type: review
round: 3
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
  - id: "3.1"
    severity: "HIGH"
    title: "Progress bar character set inconsistency in ceremony.md loading sequence"
    file: "engine/ceremony.md"
    line: "119-145"
    suggestion: "Update the loading sequence progress bar to use the same character set (`█`/`░`) and rounding logic as the Resumption Banner (§7) and guide.md progress_bar(). Add a contract note referencing guide.md §5 to ensure future alignment."
  - id: "3.2"
    severity: "HIGH"
    title: "Voice Rule 1 template fallback not fully enforced in guide.md"
    file: "engine/guide.md"
    line: "17-32"
    suggestion: "Clarify in Voice Rule 1 that the fallback to 'Aventureiro' must be applied not only when quest-log is missing, but also when `meta.hero_name` is present but empty or whitespace. Add a defensive note to avoid outputting the literal '{hero_name}' string in any user-facing message."
  - id: "3.3"
    severity: "MEDIUM"
    title: "Legacy alias for XP achievement condition still risks confusion"
    file: "engine/xp-system.md"
    line: "218-235"
    suggestion: "Add a boxed warning at the top of §7 that 'total_xp >= N' is deprecated, and that pack authors MUST use 'item_xp >= N' for all new packs. Consider adding a migration note for existing packs."
  - id: "3.4"
    severity: "MEDIUM"
    title: "Checklist.md unused item exclusion logic not cross-referenced in all modules"
    file: "engine/checklist.md"
    line: "145-172"
    suggestion: "Add explicit cross-references to guide.md §2 and xp-system.md §5 in the unused item exclusion rules, ensuring that all modules consistently exclude unused items from progress, streaks, and achievements."
---

# Code Ping-Pong — Round 3 Review

## 🎯 Score: 8/10 — CONTINUE

## Issues

### 🟠 HIGH

#### Issue 3.1 — Progress bar character set inconsistency in ceremony.md loading sequence
- **File:** `engine/ceremony.md`
- **Line:** 119-145
- **Problem:** The loading sequence in ceremony.md uses a progress bar that may not be fully aligned with the Resumption Banner and guide.md progress_bar() in terms of character set (`█`/`░`) and rounding logic. This risks visual drift if one is updated without the others.
- **Suggestion:** Update the loading sequence progress bar to use the same character set (`█`/`░`) and rounding logic as the Resumption Banner (§7) and guide.md progress_bar(). Add a contract note referencing guide.md §5 to ensure future alignment.

#### Issue 3.2 — Voice Rule 1 template fallback not fully enforced in guide.md
- **File:** `engine/guide.md`
- **Line:** 17-32
- **Problem:** Voice Rule 1 describes fallback to "Aventureiro" if no quest-log or hero_name, but does not specify the case where `meta.hero_name` exists but is empty or whitespace. There is also risk of the literal `{hero_name}` string leaking into user output if not defensively handled.
- **Suggestion:** Clarify in Voice Rule 1 that the fallback to 'Aventureiro' must be applied not only when quest-log is missing, but also when `meta.hero_name` is present but empty or whitespace. Add a defensive note to avoid outputting the literal '{hero_name}' string in any user-facing message.

### 🟡 MEDIUM

#### Issue 3.3 — Legacy alias for XP achievement condition still risks confusion
- **File:** `engine/xp-system.md`
- **Line:** 218-235
- **Problem:** Although the deprecation of `total_xp >= N` in favor of `item_xp >= N` is documented, the warning is not prominent and could be missed by pack authors, leading to future confusion or migration issues.
- **Suggestion:** Add a boxed warning at the top of §7 that 'total_xp >= N' is deprecated, and that pack authors MUST use 'item_xp >= N' for all new packs. Consider adding a migration note for existing packs.

#### Issue 3.4 — Checklist.md unused item exclusion logic not cross-referenced in all modules
- **File:** `engine/checklist.md`
- **Line:** 145-172
- **Problem:** The exclusion of unused items from progress and achievements is well-documented in checklist.md, but lacks explicit cross-references to guide.md §2 and xp-system.md §5, risking future contract drift between modules.
- **Suggestion:** Add explicit cross-references to guide.md §2 and xp-system.md §5 in the unused item exclusion rules, ensuring that all modules consistently exclude unused items from progress, streaks, and achievements.

## ✅ What Is Good
- All previous round issues are fixed with clear contract notes and improved documentation.
- Condition evaluation fallback is now robust and forward-compatible.
- Progress bar rendering is mostly consistent and visually clear.
- Achievement conditions and XP calculations are well-structured and modular.
- Command routing and orchestration logic in SKILL.md is precise and defensive.
- Edge cases for item status transitions are explicitly documented.

## 📊 Summary
- **Total issues:** 4
- **By severity:** 🔴 0 CRITICAL, 🟠 2 HIGH, 🟡 2 MEDIUM, 🟢 0 LOW