---
protocol: code-review-ping-pong
type: review
round: 2
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
  - id: "2.1"
    severity: "HIGH"
    title: "Resumption Banner progress bar contract not fully explicit"
    file: "engine/ceremony.md"
    line: "695-705"
    suggestion: "Add an explicit contract note that the Resumption Banner progress bar must use the same character set and rounding logic as the loading sequence and guide.md status bars. Reference the exact function or algorithm to avoid future drift."
  - id: "2.2"
    severity: "HIGH"
    title: "Condition evaluation fallback not fully documented for missing fields"
    file: "engine/checklist.md"
    line: "109-120"
    suggestion: "Clarify in the 'Create Quest-log' and 'Condition state' sections what happens if a pack item is missing a 'condition' field or if the field is malformed. Document the fallback (should be treated as unconditional/pending) and ensure this is consistent with guide.md §2."
  - id: "2.3"
    severity: "MEDIUM"
    title: "Achievement condition alias note could be clearer for pack authors"
    file: "engine/xp-system.md"
    line: "209-218"
    suggestion: "Rephrase the note about 'total_xp >= N' being a legacy alias for 'item_xp >= N' to make it even more explicit for pack authors: recommend always using 'item_xp >= N' and warn that 'total_xp >= N' may be removed in the future."
  - id: "2.4"
    severity: "MEDIUM"
    title: "Free-text pack keyword table generation lacks explicit fallback"
    file: "engine/scanner.md"
    line: "299-310"
    suggestion: "Document what happens if no keywords are defined in any pack when handling free-text detection. Add a fallback rule that falls back to manual pack selection and a generic prompt."
---

# Code Ping-Pong — Round 2 Review

## 🎯 Score: 8/10 — CONTINUE

## Issues

### 🟠 HIGH

#### Issue 2.1 — Resumption Banner progress bar contract not fully explicit
- **File:** `engine/ceremony.md`
- **Line:** 695-705
- **Problem:** The Resumption Banner progress bar references the progress bar function and character set, but the contract is not fully explicit about requiring strict alignment with the loading sequence and guide.md status bars. This leaves room for future drift if someone changes one without updating the others.
- **Suggestion:** Add an explicit contract note that the Resumption Banner progress bar must use the same character set and rounding logic as the loading sequence and guide.md status bars. Reference the exact function or algorithm to avoid future drift.

#### Issue 2.2 — Condition evaluation fallback not fully documented for missing fields
- **File:** `engine/checklist.md`
- **Line:** 109-120
- **Problem:** The documentation for condition evaluation does not explicitly state what happens if a pack item is missing the 'condition' field or if the field is malformed. This could lead to inconsistent handling between checklist.md and guide.md, especially for edge cases or future pack changes.
- **Suggestion:** Clarify in the 'Create Quest-log' and 'Condition state' sections what happens if a pack item is missing a 'condition' field or if the field is malformed. Document the fallback (should be treated as unconditional/pending) and ensure this is consistent with guide.md §2.

### 🟡 MEDIUM

#### Issue 2.3 — Achievement condition alias note could be clearer for pack authors
- **File:** `engine/xp-system.md`
- **Line:** 209-218
- **Problem:** The note about 'total_xp >= N' as a legacy alias for 'item_xp >= N' is present, but could be more explicit for pack authors. Some may still use the old name, not realizing it may be removed or that it does not match the user-facing XP.
- **Suggestion:** Rephrase the note about 'total_xp >= N' being a legacy alias for 'item_xp >= N' to make it even more explicit for pack authors: recommend always using 'item_xp >= N' and warn that 'total_xp >= N' may be removed in the future.

#### Issue 2.4 — Free-text pack keyword table generation lacks explicit fallback
- **File:** `engine/scanner.md`
- **Line:** 299-310
- **Problem:** The free-text detection logic describes building a keyword table dynamically from packs, but does not specify what happens if no keywords are defined in any pack. This could result in a confusing experience for users providing free-text input.
- **Suggestion:** Document what happens if no keywords are defined in any pack when handling free-text detection. Add a fallback rule that falls back to manual pack selection and a generic prompt.

## ✅ What Is Good
- All previous round issues are fixed with clear, contract-driven propagation.
- Visual and naming consistency is now enforced across ceremony.md and guide.md.
- The documentation for 'unused' item handling is now thorough and cross-referenced in all relevant modules.
- The XP system's resolved_items logic is deterministic and well-documented, ensuring correct streak and achievement calculations.
- The scanner module's schema validation is robust and error reporting is user-friendly.

## 📊 Summary
- **Total issues:** 4
- **By severity:** 🔴 0 CRITICAL, 🟠 2 HIGH, 🟡 2 MEDIUM, 🟢 0 LOW