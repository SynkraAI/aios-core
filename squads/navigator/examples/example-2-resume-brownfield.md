# Example 2: Resume Brownfield Project

This example shows how to use Navigator to resume work on an existing project after a break or context loss.

---

## Context

**Project:** Legacy CRM system (brownfield)
**Situation:** Returned after 2-week vacation, forgot current status
**Codebase:** 50,000 lines, multiple features in progress
**Team:** 3 developers
**Goal:** Resume development without wasting time

---

## Problem: Lost Context

You return to your project and have these questions:
- ❓ Which phase am I in?
- ❓ What stories are in progress?
- ❓ What's my next task?
- ❓ Are there any blockers?
- ❓ What did I complete before the break?

**Manual approach would take:** 30-60 minutes (checking git log, reading docs, reviewing stories)

**Navigator approach:** 30 seconds

---

## Solution: Use Navigator

### Step 1: Activate Navigator

```bash
@navigator
```

**Output:**
```
🧭 Navigator Agent ready
```

---

### Step 2: Detect Current Phase

```bash
*where-am-i
```

**Navigator analyzes:**
1. Scans project directory for output files
2. Compares with roadmap pipeline
3. Parses story status from front-matter
4. Identifies blockers

**Output:**
```
📍 CRM System - Current Status

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Current Phase: 7 — Desenvolvimento (67% complete)

✅ Completed Phases:
  1. Pesquisa ✓
  2. PRD ✓
  3. Arquitetura ✓
  4. Épicos ✓
  5. Stories ✓
  6. Validação ✓

🔄 Active Stories (3):
  Story 7.4: Contact management API (in-progress)
  Story 7.7: Email integration (in-progress)
  Story 7.9: Report generation (blocked)

✅ Completed Stories (6):
  Story 7.1: User authentication ✓
  Story 7.2: Dashboard widgets ✓
  Story 7.3: Database migrations ✓
  Story 7.5: Lead tracking ✓
  Story 7.6: Activity logging ✓
  Story 7.8: Notification system ✓

⏳ Pending Stories (2):
  Story 7.10: Export functionality
  Story 7.11: Mobile responsive UI

🚫 Blockers (1):
  Story 7.9 blocked: Waiting for @data-engineer to create aggregation views

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Next Steps:
  1. Continue Story 7.4 (Contact management API)
  2. Complete Story 7.7 (Email integration)
  3. Unblock Story 7.9 (ask @data-engineer for status)

💡 Recommended: Resume with @dev
  Command: @dev

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Time taken:** 3 seconds ✨

---

### Step 3: Review Last Checkpoint

To see what you were working on before the break:

```bash
*checkpoint --list
```

**Output:**
```
📸 Available Checkpoints (12 total)

Recent:
  1. cp-7-auto-20260201-173045.json (2 weeks ago)
     Phase: 7 (Desenvolvimento) - 58% complete
     Git: d4e5f6g
     Description: "Completed Story 7.6 (Activity logging)"

  2. cp-7-manual-20260131-144522.json (2 weeks ago)
     Phase: 7 (Desenvolvimento) - 50% complete
     Git: a1b2c3d
     Description: "Mid-phase checkpoint before vacation"

  3. cp-6-auto-20260128-091233.json (3 weeks ago)
     Phase: 6 (Validação) - 100% complete
     Git: 9z8y7x6
     Description: "All stories validated by @po"

💡 Latest checkpoint shows you were 58% through Development phase
```

---

### Step 4: Load Detailed Context

```bash
*status-report --detailed
```

**Output (markdown file generated):**
```markdown
# CRM System - Detailed Status Report
Generated: 2026-02-15 09:30:00

## Executive Summary
- **Phase:** 7/10 (Desenvolvimento)
- **Progress:** 67% complete
- **Velocity:** 1.5 stories/day (last 7 days)
- **Blockers:** 1 (Story 7.9)
- **ETA to Phase 8:** 3 days

## Active Work

### Story 7.4: Contact Management API (In Progress)
**Owner:** @dev
**Started:** 2026-02-01
**File:** docs/stories/story-7.4.md
**Status:** 75% complete

**Completed:**
- ✅ Database schema for contacts
- ✅ CRUD endpoints (GET, POST, PUT)
- ✅ Validation middleware

**Remaining:**
- ⏳ DELETE endpoint with cascade logic
- ⏳ Search/filter functionality
- ⏳ Unit tests (80% coverage)

**Next Action:** Implement DELETE with soft-delete strategy

---

### Story 7.7: Email Integration (In Progress)
**Owner:** @dev
**Started:** 2026-02-03
**File:** docs/stories/story-7.7.md
**Status:** 40% complete

**Completed:**
- ✅ SMTP configuration
- ✅ Email template system

**Remaining:**
- ⏳ Send email endpoint
- ⏳ Email queue with retry logic
- ⏳ Tracking (opened, clicked)

**Next Action:** Implement send endpoint with validation

---

### Story 7.9: Report Generation (Blocked)
**Owner:** @dev
**Started:** 2026-02-04
**File:** docs/stories/story-7.9.md
**Status:** BLOCKED

**Blocker:** Waiting for database aggregation views from @data-engineer
**Blocking Since:** 2026-02-04 (11 days)

**Action Required:** Ping @data-engineer on Slack

---

## Git Changes Since Last Checkpoint

```bash
# Commits since d4e5f6g (last checkpoint)
- e7f8g9h: feat: add contact validation middleware [Story 7.4]
- f9g0h1i: feat: implement email templates [Story 7.7]
- g1h2i3j: test: add contact API tests [Story 7.4]
- h3i4j5k: fix: email config env variables [Story 7.7]
```

**Files Changed:** 23 files (+847, -234)

---

## Velocity Analysis

| Date | Stories Completed | Points |
|------|------------------|--------|
| 2026-02-14 | 0 (vacation) | 0 |
| 2026-02-13 | 0 (vacation) | 0 |
| ...        | ...          | ... |
| 2026-02-01 | 1 (Story 7.6) | 5 |
| 2026-01-31 | 2 (7.3, 7.5) | 8 |

**Average:** 1.5 stories/day (pre-vacation)

---

## Recommendations

1. **Priority 1:** Complete Story 7.4 (75% done, quick win)
2. **Priority 2:** Continue Story 7.7 (40% done)
3. **Priority 3:** Unblock Story 7.9 (ping @data-engineer)

**Estimated Time to Phase 8 (QA):** 3 days (if no new blockers)
```

---

### Step 5: Resume Development

Now you have full context. Resume work:

```bash
@dev
```

**Dev agent loads:**
```
🔧 Dev Agent ready

📂 Loading context from Navigator...

✅ Context loaded:
  - Current phase: Desenvolvimento (67%)
  - Active stories: 3
  - Next task: Complete DELETE endpoint in Story 7.4

💡 Quick recap:
  You were implementing the Contact Management API (Story 7.4).
  Last completed: Validation middleware
  Next: DELETE endpoint with soft-delete

Ready to code! 🚀
```

---

## Step 6: Handle Blocker

Unblock Story 7.9:

```bash
@navigator
*auto-navigate --resolve-blockers
```

**Output:**
```
🚫 Blocker detected: Story 7.9

Issue: Database aggregation views not created
Owner: @data-engineer
Blocking since: 11 days

💡 Suggested actions:
  1. Ping @data-engineer via Slack
  2. Offer to pair program on views
  3. Create ticket in project management tool

📝 Template message:
  "Hey @data-engineer! Story 7.9 (Report Generation) is blocked
   waiting for the aggregation views. Can you provide an ETA or
   should we pair on this? It's been 11 days. Thanks!"
```

---

## Step 7: Continue Development

Work on active stories until phase complete:

```bash
# After completing Story 7.4
@dev *complete-story 7.4

# After completing Story 7.7
@dev *complete-story 7.7

# Check progress
@navigator *where-am-i
```

**Output:**
```
📍 Current Phase: 7 — Desenvolvimento (92% complete)

11/12 stories completed

Remaining: Story 7.11 (Mobile responsive UI)

🎯 Next: Complete Story 7.11 to advance to QA phase
```

---

## Results

**Before Navigator:**
- ❌ 30-60 minutes reading git logs and docs
- ❌ Confusion about what to work on
- ❌ Risk of missing blockers
- ❌ Uncertain about progress

**After Navigator:**
- ✅ 30 seconds to get full context
- ✅ Clear next actions identified
- ✅ Blockers surfaced immediately
- ✅ Confidence in project status

**Time Saved:** ~45 minutes
**Mental Load:** Significantly reduced
**Productivity:** Higher (jumped straight into coding)

---

## Advanced: Team Handoff

If multiple developers, create handoff document:

```bash
@navigator
*status-report --format handoff --team
```

**Generates:**
```markdown
# CRM Team Handoff - Week of Feb 15

## Dev 1 (You)
- Continue Story 7.4 (Contact API)
- Complete Story 7.7 (Email integration)
- Owner of Phase 7 completion

## Dev 2
- Unblock Story 7.9 (work with @data-engineer)
- Start Story 7.10 (Export functionality)

## Dev 3
- Complete Story 7.11 (Mobile responsive)
- Prepare for Phase 8 (QA setup)

## Team Blockers
- Story 7.9: Database views (11 days old)

## Team Goals
- Complete Phase 7 by EOW (Feb 19)
- Enter Phase 8 (QA) on Monday (Feb 22)
```

---

## Key Takeaways

1. **Never lose context again** - Navigator remembers for you
2. **Resume in seconds** - From vacation or weekend breaks
3. **Blockers surface automatically** - No surprises
4. **Team alignment** - Everyone knows current status
5. **Velocity tracking** - Data-driven progress estimation

---

## Pro Tips

- Run `*where-am-i` every morning as a ritual
- Create manual checkpoints before major changes
- Use `*status-report` for weekly team meetings
- Set up post-commit hooks for automatic checkpoints
- Share roadmap link with stakeholders

---

*Example completed on 2026-02-15 using Navigator v1.0.0*
