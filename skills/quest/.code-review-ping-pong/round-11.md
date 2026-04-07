---
protocol: code-review-ping-pong
type: review
round: 11
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
  - id: "11.1"
    severity: "HIGH"
    title: "Progress bar contract reference missing in guide.md §5 and §6 summary templates"
    file: "engine/guide.md"
    line: "655-690"
    suggestion: "Add explicit inline references in guide.md §5 (Quest Log View) and §6 (Summary View) templates to the unified progress bar contract (ceremony.md §2, ceremony.md §7, guide.md §5, guide.md §6). State that all four locations must use the same characters and logic. This ensures visual consistency and prevents silent drift."
  - id: "11.2"
    severity: "HIGH"
    title: "Deprecation warning for 'total_xp >= N' not present in guide.md achievement references"
    file: "engine/guide.md"
    line: "410-420"
    suggestion: "In guide.md, wherever achievement conditions are referenced (especially in §4.2/§4.5 and summary/celebration flows), add a cross-reference or inline note that 'total_xp >= N' is deprecated in favor of 'item_xp >= N', as described in xp-system.md §7 and checklist.md §1. This prevents confusion for pack authors and keeps contract propagation explicit."
  - id: "11.3"
    severity: "MEDIUM"
    title: "Edge case for fallback behavior on missing hero_title not referenced in ceremony.md §7"
    file: "engine/ceremony.md"
    line: "470-495"
    suggestion: "In ceremony.md §7 (Resumption Banner), add an explicit note that if hero_title is missing, empty, or whitespace-only, it must be omitted from output, referencing the contract in SKILL.md, guide.md §1, and ceremony.md §1.5. This ensures all locations treat hero_title fallback identically."
  - id: "11.4"
    severity: "MEDIUM"
    title: "Checklist.md §1 unused items contract does not reference guide.md §5 log view icon"
    file: "engine/checklist.md"
    line: "108-115"
    suggestion: "In checklist.md §1 (unused items lifecycle), add a cross-reference to guide.md §5 stating that unused items are displayed with the '[·]' icon in the Quest Log View, and that this visual indicator is part of the unified unused-item contract."
---

# Code Ping-Pong — Round 11 Review

## 🎯 Score: 8/10 — CONTINUE

## Issues

### 🟠 HIGH

#### Issue 11.1 — Progress bar contract reference missing in guide.md §5 and §6 summary templates
- **File:** `engine/guide.md`
- **Line:** 655-690
- **Problem:** The Quest Log View (§5) and Summary View (§6) display progress bars but do not include explicit inline references to the unified progress bar contract (ceremony.md §2, ceremony.md §7, guide.md §5, guide.md §6). This omission could lead to silent drift if the bar style or logic changes elsewhere.
- **Suggestion:** Add explicit inline references in guide.md §5 and §6 templates to the unified progress bar contract, stating that all four locations must use the same characters and logic.

#### Issue 11.2 — Deprecation warning for 'total_xp >= N' not present in guide.md achievement references
- **File:** `engine/guide.md`
- **Line:** 410-420
- **Problem:** Achievement conditions in guide.md (especially in celebration and summary flows) do not reference the deprecation of 'total_xp >= N' in favor of 'item_xp >= N', as described in xp-system.md §7 and checklist.md §1. This could confuse pack authors or cause contract drift.
- **Suggestion:** Add a cross-reference or inline note in guide.md achievement references, making the deprecation explicit and pointing to xp-system.md §7 and checklist.md §1.

### 🟡 MEDIUM

#### Issue 11.3 — Edge case for fallback behavior on missing hero_title not referenced in ceremony.md §7
- **File:** `engine/ceremony.md`
- **Line:** 470-495
- **Problem:** The Resumption Banner in ceremony.md §7 does not explicitly state that hero_title must be omitted if missing, empty, or whitespace-only, nor does it reference the contract in SKILL.md, guide.md §1, and ceremony.md §1.5. This weakens contract propagation for hero_title fallback.
- **Suggestion:** Add an explicit note in ceremony.md §7 that hero_title fallback must be handled identically to other modules, with a contract reference.

#### Issue 11.4 — Checklist.md §1 unused items contract does not reference guide.md §5 log view icon
- **File:** `engine/checklist.md`
- **Line:** 108-115
- **Problem:** The unused items contract in checklist.md §1 does not mention that unused items are displayed with the '[·]' icon in guide.md §5 (Quest Log View). This is a minor but important part of the unified unused-item contract.
- **Suggestion:** Add a cross-reference to guide.md §5 in checklist.md §1, clarifying the visual indicator for unused items.

## ✅ What Is Good
- All fallback and contract propagation issues from previous rounds appear fixed and cross-referenced.
- Progress bar logic and visual style are consistent across ceremony.md §2, §7, and guide.md.
- Unused item lifecycle is well-documented and now references all key modules.
- Defensive guards for hero_name and hero_title are explicit and non-negotiable.
- Deprecation warnings for achievement conditions are present in xp-system.md and checklist.md.

## 📊 Summary
- **Total issues:** 4
- **By severity:** 🔴 0 CRITICAL, 🟠 2 HIGH, 🟡 2 MEDIUM, 🟢 0 LOW