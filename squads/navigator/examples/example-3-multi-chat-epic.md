# Example 3: Multi-Chat Epic Orchestration

This example shows how to use Navigator to orchestrate parallel execution of an epic across multiple Claude Code chat sessions.

---

## Context

**Project:** SaaS Analytics Dashboard
**Epic:** Epic 3.2 - Advanced Reporting Module
**Stories:** 12 stories with complex dependencies
**Team:** Solo developer (but wants parallel execution)
**Challenge:** Execute multiple stories simultaneously without conflicts

---

## Problem: Sequential Bottleneck

**Traditional approach:**
```
Story 1 (4 hours) → Story 2 (3 hours) → Story 3 (5 hours) → ...
Total time: 36 hours (sequential)
```

**With multi-chat orchestration:**
```
Wave 1: Stories 1, 2, 3 (parallel - 5 hours max)
Wave 2: Stories 4, 5, 6 (parallel - 4 hours max)
Wave 3: Stories 7, 8, 9 (parallel - 6 hours max)
Wave 4: Stories 10, 11, 12 (parallel - 3 hours max)

Total time: 18 hours (50% faster)
```

---

## Solution: Multi-Chat Orchestration

### Step 1: Load Epic File

Epic file at `docs/epics/epic-3.2-advanced-reporting.md`:

```markdown
---
id: epic-3.2
title: Advanced Reporting Module
status: in-progress
---

# Epic 3.2: Advanced Reporting Module

## Stories

### Story 3.2.1: Custom Report Builder UI
**Dependencies:** None
**Estimate:** 5 hours
**Status:** pending

### Story 3.2.2: Report Template System
**Dependencies:** None
**Estimate:** 4 hours
**Status:** pending

### Story 3.2.3: Data Export (CSV/PDF)
**Dependencies:** None
**Estimate:** 3 hours
**Status:** pending

### Story 3.2.4: Report Scheduling
**Dependencies:** Story 3.2.1, Story 3.2.2
**Estimate:** 4 hours
**Status:** pending

### Story 3.2.5: Email Report Delivery
**Dependencies:** Story 3.2.4
**Estimate:** 3 hours
**Status:** pending

### Story 3.2.6: Report Analytics Dashboard
**Dependencies:** Story 3.2.1
**Estimate:** 4 hours
**Status:** pending

### Story 3.2.7: Saved Reports Library
**Dependencies:** Story 3.2.2
**Estimate:** 3 hours
**Status:** pending

### Story 3.2.8: Report Sharing & Permissions
**Dependencies:** Story 3.2.7
**Estimate:** 5 hours
**Status:** pending

### Story 3.2.9: Chart Visualizations
**Dependencies:** Story 3.2.1
**Estimate:** 6 hours
**Status:** pending

### Story 3.2.10: Report Caching Layer
**Dependencies:** Story 3.2.4, Story 3.2.6
**Estimate:** 4 hours
**Status:** pending

### Story 3.2.11: Advanced Filters
**Dependencies:** Story 3.2.1, Story 3.2.9
**Estimate:** 5 hours
**Status:** pending

### Story 3.2.12: Report API Endpoints
**Dependencies:** Story 3.2.10
**Estimate:** 3 hours
**Status:** pending
```

---

### Step 2: Run Orchestrate Command

```bash
@navigator
*orchestrate epic-3.2
```

**Navigator analyzes dependencies:**
```
🎭 Analyzing Epic 3.2: Advanced Reporting Module

📊 Total Stories: 12
📈 Dependency Graph:

Wave 1 (No dependencies - can start immediately):
  ├─ Story 3.2.1: Custom Report Builder UI
  ├─ Story 3.2.2: Report Template System
  └─ Story 3.2.3: Data Export (CSV/PDF)

Wave 2 (Depends on Wave 1):
  ├─ Story 3.2.4: Report Scheduling (needs 3.2.1, 3.2.2)
  ├─ Story 3.2.6: Report Analytics Dashboard (needs 3.2.1)
  ├─ Story 3.2.7: Saved Reports Library (needs 3.2.2)
  └─ Story 3.2.9: Chart Visualizations (needs 3.2.1)

Wave 3 (Depends on Wave 2):
  ├─ Story 3.2.5: Email Report Delivery (needs 3.2.4)
  ├─ Story 3.2.8: Report Sharing (needs 3.2.7)
  ├─ Story 3.2.10: Report Caching (needs 3.2.4, 3.2.6)
  └─ Story 3.2.11: Advanced Filters (needs 3.2.1, 3.2.9)

Wave 4 (Depends on Wave 3):
  └─ Story 3.2.12: Report API Endpoints (needs 3.2.10)

⏱️  Estimated Time:
  Sequential: 36 hours
  Parallel (4 chats): 18 hours
  Speedup: 50% faster

✅ Orchestration plan ready!
```

---

### Step 3: Navigator Generates Chat Prompts

Navigator creates 4 prompts for parallel execution:

**Chat 1 (Coordinator):**
```markdown
# Chat 1: Epic Coordinator (@sm)

You are the Scrum Master coordinating Epic 3.2 (Advanced Reporting Module).

## Your Responsibilities:
1. Monitor progress across 3 dev chats
2. Approve wave transitions (Wave 1 → Wave 2 → Wave 3 → Wave 4)
3. Resolve merge conflicts
4. Perform final integration merge

## Wave Execution Order:

### Wave 1: Start Immediately
Dev Chat 2 will execute:
- Story 3.2.1: Custom Report Builder UI
- Story 3.2.2: Report Template System
- Story 3.2.3: Data Export (CSV/PDF)

Wait for Dev Chat 2 to complete ALL Wave 1 stories before approving Wave 2.

### Wave 2: After Wave 1 Complete
Dev Chat 3 will execute:
- Story 3.2.4: Report Scheduling
- Story 3.2.6: Report Analytics Dashboard
- Story 3.2.7: Saved Reports Library
- Story 3.2.9: Chart Visualizations

Wait for Dev Chat 3 to complete ALL Wave 2 stories before approving Wave 3.

### Wave 3: After Wave 2 Complete
Dev Chat 4 will execute:
- Story 3.2.5: Email Report Delivery
- Story 3.2.8: Report Sharing
- Story 3.2.10: Report Caching
- Story 3.2.11: Advanced Filters

Wait for Dev Chat 4 to complete ALL Wave 3 stories before approving Wave 4.

### Wave 4: After Wave 3 Complete
Dev Chat 2 (reuse) will execute:
- Story 3.2.12: Report API Endpoints

### Final Integration:
After Wave 4, perform merge:
1. Pull all branches
2. Resolve conflicts (if any)
3. Run full test suite
4. Create epic completion PR

## Communication Protocol:
- Dev chats will report completion via markdown files in .aios/orchestration/
- Check .aios/orchestration/wave-{N}-status.md for updates
- Do NOT proceed to next wave until current wave shows 100% complete

Ready to begin! Start by telling Dev Chat 2 to begin Wave 1.
```

---

**Chat 2 (Dev - Wave 1 & 4):**
```markdown
# Chat 2: Development - Wave 1 & 4 (@dev)

You are @dev executing Wave 1 stories for Epic 3.2.

## Your Stories (Wave 1):

### Story 3.2.1: Custom Report Builder UI (5 hours)
- Create drag-and-drop report builder component
- Allow users to select data sources
- Configure columns, filters, sorting
- Preview report before saving

**Acceptance Criteria:**
- Component at src/components/ReportBuilder.tsx
- Integration with backend API
- Unit tests (80% coverage)
- Storybook documentation

---

### Story 3.2.2: Report Template System (4 hours)
- Create reusable report templates
- Template CRUD operations
- Template versioning
- Default templates (Sales, User Activity, etc.)

**Acceptance Criteria:**
- Backend API endpoints for templates
- Database schema for templates table
- Frontend template selector
- Unit + integration tests

---

### Story 3.2.3: Data Export (CSV/PDF) (3 hours)
- Export report data to CSV
- Export report to PDF with branding
- Download button in report viewer
- Progress indicator for large exports

**Acceptance Criteria:**
- CSV export with proper encoding
- PDF export using library (pdfmake or similar)
- Unit tests for export logic
- E2E test for download flow

---

## Branch Strategy:
Create branches:
- feat/epic-3.2-story-1-report-builder
- feat/epic-3.2-story-2-templates
- feat/epic-3.2-story-3-export

Work on stories in parallel using git worktrees if possible.

## When Complete:
1. Commit all changes
2. Run tests: `npm test`
3. Create status report at .aios/orchestration/wave-1-status.md:
   ```markdown
   # Wave 1 Status: COMPLETE
   - Story 3.2.1: ✅ Complete
   - Story 3.2.2: ✅ Complete
   - Story 3.2.3: ✅ Complete
   Test Results: All passing
   ```
4. Notify Chat 1 (Coordinator) that Wave 1 is complete

---

## After Wave 3 Complete:
You will be assigned Story 3.2.12 (Wave 4). Wait for Chat 1 approval.

Ready? Begin Wave 1 execution! 🚀
```

---

**Chat 3 (Dev - Wave 2):**
```markdown
# Chat 3: Development - Wave 2 (@dev)

You are @dev executing Wave 2 stories for Epic 3.2.

⚠️ **IMPORTANT:** Do NOT start until Chat 1 (Coordinator) confirms Wave 1 is complete!

## Your Stories (Wave 2):

### Story 3.2.4: Report Scheduling (4 hours)
**Dependencies:** Needs Story 3.2.1 (Report Builder) and 3.2.2 (Templates)

- Schedule reports to run automatically (daily, weekly, monthly)
- Cron job system for scheduled reports
- Email notifications when report ready
- Timezone support

**Acceptance Criteria:**
- Backend scheduler using node-cron or similar
- Database schema for scheduled_reports table
- Frontend UI to configure schedules
- Tests for scheduling logic

---

### Story 3.2.6: Report Analytics Dashboard (4 hours)
**Dependencies:** Needs Story 3.2.1 (Report Builder)

- Dashboard showing report usage metrics
- Most viewed reports
- Report execution times
- User engagement analytics

**Acceptance Criteria:**
- Analytics tracking in report views
- Dashboard component with charts
- Backend endpoint for analytics data
- Real-time updates with WebSockets

---

### Story 3.2.7: Saved Reports Library (3 hours)
**Dependencies:** Needs Story 3.2.2 (Templates)

- Library of saved reports per user
- Organize reports into folders
- Search and filter saved reports
- Quick access to frequently used reports

**Acceptance Criteria:**
- Database schema for saved_reports table
- CRUD API for saved reports
- Frontend library component with folders
- Unit + integration tests

---

### Story 3.2.9: Chart Visualizations (6 hours)
**Dependencies:** Needs Story 3.2.1 (Report Builder)

- Add chart types: bar, line, pie, area
- Interactive charts with drill-down
- Export charts as images
- Responsive design for mobile

**Acceptance Criteria:**
- Integration with charting library (Chart.js, Recharts, etc.)
- Chart configuration in report builder
- Export charts to PNG/SVG
- E2E tests for chart rendering

---

## Branch Strategy:
Create branches:
- feat/epic-3.2-story-4-scheduling
- feat/epic-3.2-story-6-analytics
- feat/epic-3.2-story-7-library
- feat/epic-3.2-story-9-charts

## When Complete:
1. Commit all changes
2. Run tests: `npm test`
3. Create status report at .aios/orchestration/wave-2-status.md
4. Notify Chat 1 (Coordinator) that Wave 2 is complete

Wait for Chat 1 approval before starting! ⏸️
```

---

**Chat 4 (Dev - Wave 3):**
```markdown
# Chat 4: Development - Wave 3 (@dev)

You are @dev executing Wave 3 stories for Epic 3.2.

⚠️ **IMPORTANT:** Do NOT start until Chat 1 (Coordinator) confirms Wave 2 is complete!

## Your Stories (Wave 3):

### Story 3.2.5: Email Report Delivery (3 hours)
**Dependencies:** Needs Story 3.2.4 (Scheduling)

- Send reports via email on schedule
- Email templates for report delivery
- Attachment support (PDF, CSV)
- Email delivery status tracking

---

### Story 3.2.8: Report Sharing & Permissions (5 hours)
**Dependencies:** Needs Story 3.2.7 (Saved Reports)

- Share reports with other users
- Permission levels (view, edit, admin)
- Public link generation for external sharing
- Revoke access functionality

---

### Story 3.2.10: Report Caching Layer (4 hours)
**Dependencies:** Needs Story 3.2.4 (Scheduling) and 3.2.6 (Analytics)

- Cache report results for faster loading
- Invalidation strategy (time-based, on-demand)
- Cache statistics dashboard
- Redis or in-memory cache implementation

---

### Story 3.2.11: Advanced Filters (5 hours)
**Dependencies:** Needs Story 3.2.1 (Builder) and 3.2.9 (Charts)

- Complex filter conditions (AND/OR logic)
- Date range filters with presets
- Multi-select dropdown filters
- Save filter presets

---

## Branch Strategy:
Create branches for each story.

## When Complete:
Create status report at .aios/orchestration/wave-3-status.md
Notify Chat 1 (Coordinator).

Wait for Chat 1 approval before starting! ⏸️
```

---

### Step 4: Execute in Parallel

**Open 4 Claude Code chats** and paste the prompts above.

**Execution Timeline:**
```
Hour 0: Chat 2 starts Wave 1 (Stories 1, 2, 3)
Hour 5: Chat 2 completes Wave 1
Hour 5: Chat 1 approves Wave 2
Hour 5: Chat 3 starts Wave 2 (Stories 4, 6, 7, 9)
Hour 11: Chat 3 completes Wave 2
Hour 11: Chat 1 approves Wave 3
Hour 11: Chat 4 starts Wave 3 (Stories 5, 8, 10, 11)
Hour 17: Chat 4 completes Wave 3
Hour 17: Chat 1 approves Wave 4
Hour 17: Chat 2 starts Wave 4 (Story 12)
Hour 20: Chat 2 completes Wave 4
Hour 20: Chat 1 performs final merge

Total: 20 hours (vs 36 hours sequential)
```

---

### Step 5: Coordinator Merges All Waves

**Chat 1 (Coordinator) final merge:**

```bash
# Pull all branches
git fetch --all

# Merge Wave 1
git merge feat/epic-3.2-story-1-report-builder
git merge feat/epic-3.2-story-2-templates
git merge feat/epic-3.2-story-3-export

# Merge Wave 2
git merge feat/epic-3.2-story-4-scheduling
git merge feat/epic-3.2-story-6-analytics
git merge feat/epic-3.2-story-7-library
git merge feat/epic-3.2-story-9-charts

# Merge Wave 3
git merge feat/epic-3.2-story-5-email
git merge feat/epic-3.2-story-8-sharing
git merge feat/epic-3.2-story-10-caching
git merge feat/epic-3.2-story-11-filters

# Merge Wave 4
git merge feat/epic-3.2-story-12-api

# Run full test suite
npm test

# Create epic completion branch
git checkout -b epic/epic-3.2-advanced-reporting-complete
git push origin epic/epic-3.2-advanced-reporting-complete
```

---

## Results

**Epic 3.2 Complete:**
- ✅ 12 stories implemented
- ✅ All tests passing
- ✅ Time: 20 hours (vs 36 hours)
- ✅ Savings: 44% faster
- ✅ No merge conflicts (thanks to orchestration)

---

## Key Takeaways

1. **Parallel execution is powerful** - Cut time nearly in half
2. **Dependency analysis prevents conflicts** - Navigator detects dependencies automatically
3. **Wave structure ensures correctness** - Each wave builds on previous
4. **Coordinator role is critical** - Prevents chaos, ensures quality
5. **Works for solo devs too** - You can orchestrate your own work across sessions

---

## Pro Tips

- Use git worktrees for true parallel development
- Set up CI/CD to test each wave independently
- Coordinator should review code between waves
- Document decisions in .aios/orchestration/ directory
- Reuse prompts for future epics (templates)

---

## When to Use Multi-Chat Orchestration

**Good for:**
- Large epics (8+ stories)
- Stories with clear dependencies
- Time-sensitive projects
- Learning to work in parallel

**Not good for:**
- Small epics (< 5 stories)
- Highly interdependent stories (sequential is better)
- Exploratory work (direction unclear)

---

*Example completed on 2026-02-15 using Navigator v1.0.0*
