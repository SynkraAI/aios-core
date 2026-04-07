---
protocol: code-review-ping-pong
type: review
round: 4
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
  - id: "4.1"
    severity: "HIGH"
    title: "Resumption Banner progress bar contract reference missing in ceremony.md §7"
    file: "engine/ceremony.md"
    line: "340-355"
    suggestion: "Add a contract note in ceremony.md §7 (Resumption Banner) explicitly referencing the progress bar contract in §2 and guide.md §5. Ensure that any change to bar width, character set, or rounding logic in any of the three locations is reflected in all, and that this is documented in each section."
  - id: "4.2"
    severity: "HIGH"
    title: "Inconsistent unused item icon in guide.md Quest Log View"
    file: "engine/guide.md"
    line: "780-792"
    suggestion: "Update the Quest Log View in guide.md §5 to use the `[·]` icon for unused items, as specified in checklist.md and ceremony.md. Add a contract note referencing checklist.md §1 and ceremony.md §3 for visual consistency."
  - id: "4.3"
    severity: "MEDIUM"
    title: "Missing fallback documentation for absent optional fields in scanner.md"
    file: "engine/scanner.md"
    line: "75-92"
    suggestion: "Document fallback behavior for missing optional fields (e.g., `keywords`, `type`, `parent_pack`, `parent_item`, `fallback_question`) in scanner.md §3.2. Clarify that their absence must not cause errors, and that defaults are applied as per contract."
  - id: "4.4"
    severity: "MEDIUM"
    title: "Achievement condition naming warning not cross-referenced in checklist.md"
    file: "engine/checklist.md"
    line: "375-388"
    suggestion: "Add a cross-reference in checklist.md §7 (achievement evaluation) to the deprecation warning in xp-system.md §7, clarifying that 'total_xp >= N' is deprecated and 'item_xp >= N' must be used for new packs."
---

# Code Ping-Pong — Round 4 Review

## 🎯 Score: 8/10 — CONTINUE

## Issues

### 🟠 HIGH

#### Issue 4.1 — Resumption Banner progress bar contract reference missing in ceremony.md §7
- **File:** `engine/ceremony.md`
- **Line:** 340-355
- **Problem:** The Resumption Banner in ceremony.md §7 renders a progress bar but lacks an explicit contract note referencing the shared progress bar contract established in ceremony.md §2 and guide.md §5. This omission risks silent drift if one implementation changes (e.g., bar width, character set, rounding) without updating the others.
- **Suggestion:** Add a contract note in ceremony.md §7 (Resumption Banner) explicitly referencing the progress bar contract in §2 and guide.md §5. Ensure that any change to bar width, character set, or rounding logic in any of the three locations is reflected in all, and that this is documented in each section.

#### Issue 4.2 — Inconsistent unused item icon in guide.md Quest Log View
- **File:** `engine/guide.md`
- **Line:** 780-792
- **Problem:** The Quest Log View in guide.md §5 does not consistently use the `[·]` icon for items with status `unused`, as mandated by checklist.md and ceremony.md. This can confuse users and breaks visual contract across modules.
- **Suggestion:** Update the Quest Log View in guide.md §5 to use the `[·]` icon for unused items, as specified in checklist.md and ceremony.md. Add a contract note referencing checklist.md §1 and ceremony.md §3 for visual consistency.

### 🟡 MEDIUM

#### Issue 4.3 — Missing fallback documentation for absent optional fields in scanner.md
- **File:** `engine/scanner.md`
- **Line:** 75-92
- **Problem:** scanner.md §3.2 describes required and optional pack fields but does not document fallback behavior for missing optional fields (e.g., `keywords`, `type`, `parent_pack`, `parent_item`, `fallback_question`). This could lead to inconsistent or error-prone handling by future maintainers or LLMs.
- **Suggestion:** Document fallback behavior for missing optional fields (e.g., `keywords`, `type`, `parent_pack`, `parent_item`, `fallback_question`) in scanner.md §3.2. Clarify that their absence must not cause errors, and that defaults are applied as per contract.

#### Issue 4.4 — Achievement condition naming warning not cross-referenced in checklist.md
- **File:** `engine/checklist.md`
- **Line:** 375-388
- **Problem:** checklist.md §7 (achievement evaluation) does not reference the deprecation warning for 'total_xp >= N' in xp-system.md §7. This weakens the contract for pack authors and risks future confusion.
- **Suggestion:** Add a cross-reference in checklist.md §7 (achievement evaluation) to the deprecation warning in xp-system.md §7, clarifying that 'total_xp >= N' is deprecated and 'item_xp >= N' must be used for new packs.

## ✅ What Is Good
- Progress bar rounding and character set are now consistent in ceremony.md §2, with a clear contract note.
- Voice Rule 1 in guide.md robustly handles empty/whitespace hero_name and prevents literal template leakage.
- The deprecation warning for XP achievement conditions is now prominent in xp-system.md §7.
- Unused item exclusion logic is cross-referenced in checklist.md, guide.md, and xp-system.md.
- No circular dependencies or undocumented cross-module flows detected.
- All modules handle missing required fields defensively, and error messages are clear.

## 📊 Summary
- **Total issues:** 4
- **By severity:** 🔴 0 CRITICAL, 🟠 2 HIGH, 🟡 2 MEDIUM, 🟢 0 LOW