---
protocol: code-review-ping-pong
type: review
round: 6
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
  - id: "6.1"
    severity: "HIGH"
    title: "Progress bar character inconsistency in ceremony.md and guide.md"
    file: "engine/ceremony.md"
    line: "108-133"
    suggestion: "Ensure all progress bars (ceremony.md §2, §7; guide.md §5, §6) use the same characters ('█' for filled, '░' for empty) and width (20 chars). Update any lingering references to ▓/░ in ceremony.md §7 to match the contract."
  - id: "6.2"
    severity: "HIGH"
    title: "Voice Rule 1 template error not fully resolved in guide.md"
    file: "engine/guide.md"
    line: "18-28"
    suggestion: "Double-check that all templates in guide.md §1 use hero_name/hero_title substitution and never output literal placeholders. Add a defensive note to ensure no literal '{hero_name}' or '{hero_title}' ever appears in user output."
  - id: "6.3"
    severity: "MEDIUM"
    title: "Deprecated XP achievement condition naming not clearly cross-referenced"
    file: "engine/xp-system.md"
    line: "180-197"
    suggestion: "Add a cross-reference to checklist.md and SKILL.md warning pack authors to use 'item_xp >= N' instead of 'total_xp >= N'. Make it explicit that 'total_xp >= N' is deprecated and only supported for legacy packs."
  - id: "6.4"
    severity: "MEDIUM"
    title: "Streak unused logic only clarified in xp-system.md §10"
    file: "engine/xp-system.md"
    line: "110-118"
    suggestion: "Propagate the explanation for unused items not breaking streaks from §10 up to §4 (streak calculation) and checklist.md. Add a note in checklist.md §1 and §2 to clarify that unused items are filtered out for streaks."
---

# Code Ping-Pong — Round 6 Review

## 🎯 Score: 8/10 — CONTINUE

## Issues

### 🟠 HIGH

#### Issue 6.1 — Progress bar character inconsistency in ceremony.md and guide.md
- **File:** `engine/ceremony.md`
- **Line:** 108-133
- **Problem:** There is a documented contract that all progress bars (loading sequence, resumption banner, quest log view, summary view) must use the same characters ('█' for filled, '░' for empty) and width (20 chars). However, ceremony.md §7 still references ▓/░, while guide.md §5/§6 and ceremony.md §2 use '█'/'░'. This inconsistency could lead to visual drift and user confusion.
- **Suggestion:** Ensure all progress bars (ceremony.md §2, §7; guide.md §5, §6) use the same characters ('█' for filled, '░' for empty) and width (20 chars). Update any lingering references to ▓/░ in ceremony.md §7 to match the contract.

#### Issue 6.2 — Voice Rule 1 template error not fully resolved in guide.md
- **File:** `engine/guide.md`
- **Line:** 18-28
- **Problem:** While guide.md §1 documents the fallback for hero_name, there is a risk that literal placeholders like '{hero_name}' or '{hero_title}' could be output if substitution fails. The contract says to always use the fallback, but the defensive note is not explicit enough, and there is no guard against accidental literal output.
- **Suggestion:** Double-check that all templates in guide.md §1 use hero_name/hero_title substitution and never output literal placeholders. Add a defensive note to ensure no literal '{hero_name}' or '{hero_title}' ever appears in user output.

### 🟡 MEDIUM

#### Issue 6.3 — Deprecated XP achievement condition naming not clearly cross-referenced
- **File:** `engine/xp-system.md`
- **Line:** 180-197
- **Problem:** The deprecation of 'total_xp >= N' in favor of 'item_xp >= N' is documented in xp-system.md §7, but there is no cross-reference in checklist.md or SKILL.md. This could confuse pack authors who read only those files.
- **Suggestion:** Add a cross-reference to checklist.md and SKILL.md warning pack authors to use 'item_xp >= N' instead of 'total_xp >= N'. Make it explicit that 'total_xp >= N' is deprecated and only supported for legacy packs.

#### Issue 6.4 — Streak unused logic only clarified in xp-system.md §10
- **File:** `engine/xp-system.md`
- **Line:** 110-118
- **Problem:** The rule that unused items do not break streaks is explained in xp-system.md §10, but not in the main streak calculation section (§4) or in checklist.md. This makes it easy to miss for maintainers or readers focused on streak logic.
- **Suggestion:** Propagate the explanation for unused items not breaking streaks from §10 up to §4 (streak calculation) and checklist.md. Add a note in checklist.md §1 and §2 to clarify that unused items are filtered out for streaks.

## ✅ What Is Good
- Fallback and contract propagation for hero_name is now consistent across SKILL.md, ceremony.md, and guide.md.
- Progress bar visual contract is well-documented and referenced in all major modules.
- Sub-item XP and stats inclusion are clearly explained and cross-referenced.
- Pack schema validation and error handling are robust and documented.
- Condition state handling for checklist items is precise and defensive.

## 📊 Summary
- **Total issues:** 4
- **By severity:** 🔴 0 CRITICAL, 🟠 2 HIGH, 🟡 2 MEDIUM, 🟢 0 LOW