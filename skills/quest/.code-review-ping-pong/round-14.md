---
protocol: code-review-ping-pong
type: review
round: 14
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
  - id: "14.1"
    severity: "HIGH"
    title: "Progress bar visual contract drift in ceremony.md §7"
    file: "engine/ceremony.md"
    line: "495-502"
    suggestion: "Ensure the progress bar in the Resumption Banner (ceremony.md §7) references and strictly follows the unified visual contract: use only '█' (U+2588) for filled and '░' (U+2591) for empty, 20 characters wide, with round() logic. Add an explicit inline reference to ceremony.md §2, guide.md §5, and guide.md §6. Remove any mention or use of '▓' (U+2593) or other block characters."
  - id: "14.2"
    severity: "MEDIUM"
    title: "Voice Rule 1 fallback contract reference incomplete in guide.md"
    file: "engine/guide.md"
    line: "13-30"
    suggestion: "In guide.md §1 (Voice Rule 1), ensure the contract block for hero_name and hero_title fallback explicitly references SKILL.md, ceremony.md §1.5, and ceremony.md §7 as co-owners. Confirm the language states all four locations must use the same fallback and that changes require propagation to all. This prevents future silent drift."
  - id: "14.3"
    severity: "MEDIUM"
    title: "Deprecated achievement condition naming not cross-referenced in xp-system.md §7"
    file: "engine/xp-system.md"
    line: "266-285"
    suggestion: "In xp-system.md §7, add a cross-reference to checklist.md §1 and SKILL.md warning pack authors that 'total_xp >= N' is deprecated in favor of 'item_xp >= N', and clarify that both evaluate total_base_xp. Ensure the deprecation warning is consistent and visible in all three locations."
  - id: "14.4"
    severity: "LOW"
    title: "Edge case fallback for malformed or missing hero_title not referenced in all modules"
    file: "engine/ceremony.md"
    line: "161-170"
    suggestion: "In ceremony.md §1.5 (Hero Identity), add a note that the fallback for hero_title (empty string) must be handled identically in SKILL.md, guide.md §1, and ceremony.md §7. Ensure all modules omit hero_title from output if empty/missing/whitespace-only, and reference the shared contract."
---

# Code Ping-Pong — Round 14 Review

## 🎯 Score: 8/10 — CONTINUE

## Issues

### 🟠 HIGH

#### Issue 14.1 — Progress bar visual contract drift in ceremony.md §7
- **File:** `engine/ceremony.md`
- **Line:** 495-502
- **Problem:** The Resumption Banner's progress bar references the unified contract but does not explicitly state that only '█' and '░' are allowed, and may still mention or use '▓' in legacy comments or templates. This risks visual drift if a future edit reintroduces inconsistent characters or logic.
- **Suggestion:** Ensure the progress bar in the Resumption Banner (ceremony.md §7) references and strictly follows the unified visual contract: use only '█' (U+2588) for filled and '░' (U+2591) for empty, 20 characters wide, with round() logic. Add an explicit inline reference to ceremony.md §2, guide.md §5, and guide.md §6. Remove any mention or use of '▓' (U+2593) or other block characters.

### 🟡 MEDIUM

#### Issue 14.2 — Voice Rule 1 fallback contract reference incomplete in guide.md
- **File:** `engine/guide.md`
- **Line:** 13-30
- **Problem:** The contract block for hero_name and hero_title fallback in guide.md §1 does not explicitly reference all four co-owner locations (SKILL.md, ceremony.md §1.5, ceremony.md §7, and itself). This could allow the fallback logic to silently drift if changed elsewhere.
- **Suggestion:** In guide.md §1 (Voice Rule 1), ensure the contract block for hero_name and hero_title fallback explicitly references SKILL.md, ceremony.md §1.5, and ceremony.md §7 as co-owners. Confirm the language states all four locations must use the same fallback and that changes require propagation to all. This prevents future silent drift.

#### Issue 14.3 — Deprecated achievement condition naming not cross-referenced in xp-system.md §7
- **File:** `engine/xp-system.md`
- **Line:** 266-285
- **Problem:** The deprecation warning for 'total_xp >= N' in xp-system.md §7 is not cross-referenced to checklist.md §1 and SKILL.md, which also warn pack authors about this naming. This weakens the contract and could confuse pack authors about which condition is canonical.
- **Suggestion:** In xp-system.md §7, add a cross-reference to checklist.md §1 and SKILL.md warning pack authors that 'total_xp >= N' is deprecated in favor of 'item_xp >= N', and clarify that both evaluate total_base_xp. Ensure the deprecation warning is consistent and visible in all three locations.

### 🟢 LOW

#### Issue 14.4 — Edge case fallback for malformed or missing hero_title not referenced in all modules
- **File:** `engine/ceremony.md`
- **Line:** 161-170
- **Problem:** The fallback for hero_title (empty string) is described in ceremony.md §1.5, but the note does not explicitly reference SKILL.md, guide.md §1, and ceremony.md §7 as co-owners. This could lead to inconsistent omission logic for hero_title in output.
- **Suggestion:** In ceremony.md §1.5 (Hero Identity), add a note that the fallback for hero_title (empty string) must be handled identically in SKILL.md, guide.md §1, and ceremony.md §7. Ensure all modules omit hero_title from output if empty/missing/whitespace-only, and reference the shared contract.

## ✅ What Is Good

- All major cross-module contracts are now present and referenced in at least two locations.
- Progress bar logic is unified and referenced in all visual modules.
- Unused item handling is consistently described and cross-referenced.
- Condition fallback and malformed field handling are robust and documented.
- Command routing and quest-log detection flows are clear and unambiguous.
- No circular dependencies or undocumented edge cases detected in this round.

## 📊 Summary

- **Total issues:** 4
- **By severity:** 🔴 0 CRITICAL, 🟠 1 HIGH, 🟡 2 MEDIUM, 🟢 1 LOW