---
protocol: code-review-ping-pong
type: fix
round: 2
date: "2026-03-31"
fixer: "Claude Opus 4.6"
review_file: round-2.md
commit_sha_before: "83b4a392fb0bcab2bdca458408269159db159bcf"
commit_sha_after: "a75e5cd7c20e533b778cc0b793848bc7a04f3e5e"
branch: chore/devops-10-improvements
issues_fixed: 3
issues_skipped: 0
issues_total: 3
git_diff_stat: "3 files changed, 37 insertions(+), 20 deletions(-)"
quality_checks:
  lint: skipped
  typecheck: skipped
  tests: skipped
fixes:
  - id: "2.1"
    status: FIXED
    file: "engine/xp-system.md"
    description: "Added unused-skip logic to all 6 achievement conditions: all_required_done_in_phase, all_items_done_in_phase, phase_done_same_day, all_items_done, all_required_done, zero_required_skipped. Each now checks status == unused and continues to next item."
    deviation: "none"
  - id: "2.2"
    status: FIXED
    file: "engine/guide.md"
    description: "Replaced /quest skip with /quest unused for not-applicable items in 4 locations: Mission Card template, interaction flow 4b, skip flow, stuck detection. Also fixed checklist.md trigger description (anti-whack-a-mole). Skip is now only for conscious bypass of applicable items."
    deviation: "none"
  - id: "2.3"
    status: FIXED
    file: "engine/guide.md"
    description: "Added fallback defaults for 3 optional phase fields: phase.complete_message falls back to 'World concluido.', next_phase.unlock_message falls back to 'Novo world desbloqueado.', item.tip chain now ends with 'Sem dica adicional.' Also updated World Complete guard to include unused status."
    deviation: "none"
preserved:
  - "engine/ceremony.md — no issues in this round"
  - "engine/scanner.md — no issues in this round"
  - "SKILL.md — no issues in this round"
---

# Code Ping-Pong — Round 2 Fix Report

## Summary

All 3 issues from round 2 were fixed in a single commit. Anti-whack-a-mole sweep found 1 extra file affected (checklist.md) beyond the files cited in the issues.

## Fixes

### Fix for Issue 2.1

**Semantics of `unused` in achievement conditions (xp-system.md)**

All 6 achievement condition families that iterate over items now explicitly skip `unused` items:

1. `all_required_done_in_phase:<N>` — required items with status `unused` are skipped via `continue`
2. `all_items_done_in_phase:<N>` — unused items no longer block the "no pending" check
3. `phase_done_same_day:<N>` — unused required items excluded from date collection
4. `all_items_done` — same pattern as phase-scoped version, applied globally
5. `all_required_done` — unused required items excluded globally
6. `zero_required_skipped` — unused items don't violate the "no skip" condition

Pattern applied consistently: extract `status`, check `== "unused"` → `continue`, then evaluate the original condition.

### Fix for Issue 2.2

**Guide directing users to `/quest skip` for not-applicable items**

Fixed in 4 locations in guide.md + 1 in checklist.md (anti-whack-a-mole):

1. **Mission Card (line 271-274):** Changed "SE NAO SE APLICA: /quest skip" to `/quest unused`, added separate "SE QUER PULAR MESMO ASSIM: /quest skip"
2. **Interaction flow 4b (line 651):** Now suggests `/quest unused` first, `/quest skip` second
3. **Skip Flow (line 660-663):** Same separation — unused for not-applicable, skip for bypass
4. **Stuck Detection (line 670-672):** Added `/quest unused` option before `/quest skip`
5. **checklist.md (line 229):** Clarified trigger description — skip is for conscious bypass, unused for not-applicable items

### Fix for Issue 2.3

**Missing fallbacks for optional phase fields in celebrations**

Three fallback defaults added to guide.md World Complete template:

1. `phase.complete_message` → falls back to `"World concluido."`
2. `next_phase.unlock_message` → falls back to `"Novo world desbloqueado."`
3. `item.tip || phase.description` → chain extended with `|| "Sem dica adicional."`

Also updated the World Complete trigger condition and critical guard to explicitly include `unused` as a valid terminal status (items with `unused` don't count as pending).

## Anti-Whack-a-Mole Report

| Pattern searched | Files checked | Extra fixes |
|-----------------|---------------|-------------|
| `/quest skip` for not-applicable | All engine/*.md | checklist.md line 229 |
| Achievement conditions without unused | xp-system.md (6 conditions) | All 6 fixed |
| Optional fields without fallback | guide.md templates | 3 fields fixed |
| World Complete unused handling | guide.md | Trigger + guard updated |
