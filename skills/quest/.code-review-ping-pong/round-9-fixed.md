---
protocol: code-review-ping-pong
type: fix
round: 9
date: "2026-04-01"
fixer: "Claude Opus 4.6"
review_file: round-9.md
commit_sha_before: "0fe5002da43f5fd4b1756b4a1f69448982ad66c5"
commit_sha_after: "d6ebb5402b31089f14bf01748621c84ebffe8b25"
branch: chore/devops-10-improvements
issues_fixed: 4
issues_skipped: 0
issues_total: 4
git_diff_stat: "5 files changed, 10 insertions(+), 2 deletions(-)"
quality_checks:
  lint: skipped
  typecheck: skipped
  tests: skipped
fixes:
  - id: "9.1"
    status: FIXED
    file: "engine/guide.md"
    description: "Added explicit Contract block in guide.md §1 Voice Rule 1. Updated SKILL.md to reference all 4 locations. Updated ceremony.md §1.5 to reference all 4 locations."
    deviation: "none"
  - id: "9.2"
    status: FIXED
    file: "engine/ceremony.md"
    description: "Added inline contract reference in Resumption Banner template pointing to §2, guide.md §5, guide.md §6. Full contract already existed at lines 495-502 from round 8."
    deviation: "none"
  - id: "9.3"
    status: FIXED
    file: "engine/checklist.md"
    description: "Added consolidated Contract block in unused items lifecycle section referencing xp-system.md §4, §5, §7 and guide.md §2, §4.2/4.5."
    deviation: "none"
  - id: "9.4"
    status: FIXED
    file: "engine/scanner.md"
    description: "Added drift warning in §6 free-text example table clarifying IDs must be derived from validated pack schemas at runtime, with reference to checklist.md §1."
    deviation: "none"
preserved:
  - "engine/xp-system.md — no changes needed, contracts already reference it correctly"
  - "SKILL.md — updated hero_name fallback contract count from 3 to 4 locations"
---

# Code Ping-Pong — Round 9 Fix Report

## Anti-Whack-a-Mole Analysis

For each issue, grep/search was performed across ALL engine files to find the same pattern:

- **9.1 hero_name fallback:** Grep for "Aventureiro" across all engine files. Found in SKILL.md (line 14), guide.md §1 (line 13), ceremony.md §1.5 (line 116), ceremony.md §7 (line 472-474). Guide.md §1 was the only location missing a standalone contract block. SKILL.md said "three locations" but should say "four" (missing ceremony.md §1.5). Ceremony.md §1.5 said "three locations" but should say "four" (missing ceremony.md §7). All three files updated.
- **9.2 progress bar contract:** Grep for "progress.bar" and "bar visual consistency" across all engine files. Contract already exists at ceremony.md §2 (line 167), ceremony.md §7 (lines 495-502), guide.md §5 (line 659), guide.md §6 (line 674). The template block in §7 was the only location without an inline reference — added.
- **9.3 unused items in streaks/progress:** Grep for "unused.*streak" across all engine files. Found in checklist.md §1 (line 96, 108), xp-system.md §4 (line 135), xp-system.md §10 (line 395). Checklist.md had inline references but lacked a consolidated contract block — added.
- **9.4 hardcoded IDs:** Grep for pack IDs ("app-development", "squad-upgrade") across scanner.md. Only found in the non-normative example table (lines 388-395), already marked as illustrative. Added explicit drift warning.

## Semantic Propagation Analysis

- **9.1 contract:** "Which modules own the hero_name fallback?" — 4 locations: SKILL.md, guide.md §1, ceremony.md §1.5, ceremony.md §7. All four now explicitly reference each other with "All four locations MUST use the same fallback string."
- **9.2 contract:** "Which modules own the progress bar visual contract?" — 4 locations: ceremony.md §2, ceremony.md §7, guide.md §5, guide.md §6. All four already had explicit contracts from previous rounds. Template inline reference added for discoverability.
- **9.3 contract:** "Which modules must exclude unused items?" — 6 enforcement points: xp-system.md §4 (streaks), §5 (counters), §7 (achievements), guide.md §2 (phase unlock), §4.2/4.5 (completion triggers), ceremony.md §7 (stats display). New contract block in checklist.md §1 maps all participants.
- **9.4 contract:** "Which modules must resolve IDs from pack schema?" — scanner.md §3.2 (validates schema), §6 (keyword matching). The example table was already non-normative; drift warning now makes the risk explicit.

## Fixed Issues

### Fix for Issue 9.1

**Voice Rule 1 template error fallback contract is not fully explicit**

Added explicit `**Contract — hero_name fallback (Voice Rule 1):**` block in guide.md §1, after Voice Rule 1. The block references all 4 co-owning locations: SKILL.md, ceremony.md §1.5, ceremony.md §7, and guide.md §1. States that all four MUST use the same fallback string and changes require propagation.

Also updated SKILL.md contract to say "four locations" (was "three") and include ceremony.md §1.5. Updated ceremony.md §1.5 contract to say "four locations" and include ceremony.md §7.

Files changed: `engine/guide.md`, `SKILL.md`, `engine/ceremony.md`

### Fix for Issue 9.2

**Progress bar contract reference missing in ceremony.md §7 Resumption Banner**

Added inline reference `↑ Uses unified progress bar contract — see §2, guide.md §5, guide.md §6` directly in the Resumption Banner template block, below the progress bar line. This makes the contract discoverable when reading the template, complementing the full contract block that already existed at lines 495-502 (added in round 8).

Files changed: `engine/ceremony.md`

### Fix for Issue 9.3

**Edge case for unused items in streak calculation not cross-referenced in checklist.md**

Added consolidated `**Contract — unused items exclusion:**` block at the end of the unused items lifecycle section in checklist.md §1. The block explicitly states that unused items are invisible to streaks (xp-system.md §4), progress (xp-system.md §5), and phase transitions (guide.md §2). Lists all 6 enforcement points and states that any new module consuming item status MUST implement this exclusion.

Files changed: `engine/checklist.md`

### Fix for Issue 9.4

**Free-text table in scanner.md §6 uses hardcoded IDs, not schema-driven**

Added `**⚠️ Drift warning:**` block after the non-normative example table in scanner.md §6. Clarifies that IDs and keywords shown are examples frozen in time, actual pack IDs MUST be derived from validated pack schemas at runtime (§3.1 + §3.2), and hardcoding risks silent drift. References checklist.md §1 for canonical item ID rules.

Files changed: `engine/scanner.md`
