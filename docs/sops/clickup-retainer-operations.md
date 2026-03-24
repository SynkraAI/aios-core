# ClickUp Retainer Operations — Brand System Service

**Story:** BSS-6.7 | **Version:** 1.0 | **Date:** 2026-03-23 | **Author:** Morgan (PM)

---

## 1. Overview

Retainer clients receive monthly recurring deliverables managed via ClickUp recurring tasks. This SOP covers how to activate, manage, adjust, and deactivate retainer operations for any client.

**Retainer add-on pricing:** $2,500/month

---

## 2. Retainer Task Set

### Full Task Matrix

| # | Task Name | Day of Month | Assignee Role | Est. Hours | Tier 1 | Tier 2 | Tier 3 |
|---|-----------|-------------|---------------|------------|--------|--------|--------|
| 1 | Monthly Content Calendar | 1st | Content Lead | 3h | Yes | Yes | Yes |
| 2 | Posts Batch Generation (30 posts) | 3rd | Creative Lead | 4h | Yes | Yes | Yes |
| 3 | Email Campaign | 5th | Content Lead | 2h | No | Yes | Yes |
| 4 | Blog Post | 5th | Content Lead | 3h | No | Yes | Yes |
| 5 | Site Maintenance & Updates | 10th | Dev | 2h | No | No | Yes |
| 6 | Monthly Analytics Report | 25th | PM | 1h | Yes | Yes | Yes |
| 7 | Monthly Retainer Summary | 1st | PM | 0.5h | Yes | Yes | Yes |

### Tier Scope Summary

| Tier | Active Tasks | Monthly Hours |
|------|-------------|---------------|
| Tier 1 | 1, 2, 6, 7 | 8.5h |
| Tier 2 | 1, 2, 3, 4, 6, 7 | 13.5h |
| Tier 3 | All 7 | 15.5h |

---

## 3. Task Description Templates

### Monthly Content Calendar
```
## Monthly Content Calendar — {Month} {Year}
**Client:** {client_name}
**Tier:** {tier}

### Scope
- Plan content themes for the month
- Map 30 posts to calendar dates across platforms
- Align with any seasonal events, campaigns, or client requests

### Acceptance Criteria
- [ ] 30-post calendar with dates, platforms, and content themes
- [ ] Calendar shared with client for approval
- [ ] Aligned with brand voice guidelines

### Deliverable
- Content calendar document (Google Sheets / ClickUp Doc)
```

### Posts Batch Generation (30 posts)
```
## Posts Batch Generation — {Month} {Year}
**Client:** {client_name}
**Batch Size:** 30 posts

### Scope
- Generate 30 social posts using AI creative pipeline
- Apply brand tokens (colors, typography, voice)
- Cover all assigned platforms (Instagram, Facebook, LinkedIn)

### Acceptance Criteria
- [ ] 30 posts generated and QA'd against brand guidelines
- [ ] All posts meet platform-specific size and format requirements
- [ ] Assets uploaded to R2: r2://brand-assets/{client-id}/creatives/retainer/{month}/

### Deliverable
- ZIP per platform uploaded to R2
```

### Email Campaign
```
## Email Campaign — {Month} {Year}
**Client:** {client_name}

### Scope
- Draft email campaign based on monthly content calendar
- Apply brand voice and visual identity
- Set up in email platform (if applicable)

### Acceptance Criteria
- [ ] Email copy drafted and approved
- [ ] Visual template matches brand identity
- [ ] Send schedule confirmed

### Deliverable
- Email draft document or platform preview link
```

### Blog Post
```
## Blog Post — {Month} {Year}
**Client:** {client_name}

### Scope
- Write or generate blog post aligned with monthly content theme
- Apply SEO guidelines and brand voice
- Include featured image from brand assets

### Acceptance Criteria
- [ ] Blog post drafted (800-1500 words)
- [ ] SEO meta title and description included
- [ ] Featured image created using brand tokens

### Deliverable
- Blog post document (Markdown or Google Doc)
```

### Site Maintenance & Updates
```
## Site Maintenance — {Month} {Year}
**Client:** {client_name}

### Scope
- Check site uptime and performance
- Apply content updates (new blog post, updated copy)
- Verify SSL, redirects, analytics tracking

### Acceptance Criteria
- [ ] Site loads under 3 seconds (LCP)
- [ ] No broken links or 404 errors
- [ ] Analytics tracking confirmed active
- [ ] Monthly content updates applied

### Deliverable
- Maintenance report (brief checklist with pass/fail)
```

### Monthly Analytics Report
```
## Monthly Analytics Report — {Month} {Year}
**Client:** {client_name}

### Scope
- Compile social media metrics (reach, engagement, growth)
- Compile website metrics (traffic, bounce rate, conversions)
- Summarize email campaign performance (if applicable)
- Provide actionable insights for next month

### Acceptance Criteria
- [ ] Report covers all active platforms
- [ ] Month-over-month comparison included
- [ ] 3+ actionable recommendations for next month

### Deliverable
- Analytics report PDF or ClickUp Doc
```

### Monthly Retainer Summary
```
## Monthly Retainer Summary — {Month} {Year}
**Client:** {client_name}
**Tier:** {tier}

### Purpose
Parent tracking task for this month's retainer scope. Review all subtasks, confirm completion, report to client.

### Checklist
- [ ] Content Calendar delivered
- [ ] Posts Batch delivered
- [ ] Email Campaign delivered (Tier 2+)
- [ ] Blog Post delivered (Tier 2+)
- [ ] Site Maintenance completed (Tier 3)
- [ ] Analytics Report sent to client
- [ ] Client satisfaction captured (1-5)

### Hours Summary
- Planned: {X}h
- Actual: {X}h
```

---

## 4. How to Activate Retainer for a New Client

### Step-by-Step

1. **Open the client Folder** created from BSS Client Template
2. **Navigate to the Retainer List** — recurring tasks are pre-created but inactive
3. **Determine client tier** from the `tier` custom field
4. **Activate applicable tasks** based on tier matrix (Section 2):
   - Open each applicable task
   - Set due date > Recurring > Monthly > Day {N} (per schedule)
   - Enable recurrence
5. **Disable inapplicable tasks** for the client's tier:
   - Tier 1: Disable Email Campaign, Blog Post, Site Maintenance
   - Tier 2: Disable Site Maintenance
   - Tier 3: Enable all
6. **Assign team members** to each recurring task
7. **Set `deliverable_status`** to Draft on all active tasks
8. **Notify Manager:** Add comment on Monthly Retainer Summary: "@manager Retainer activated for {client_name} — {tier} scope"

---

## 5. Monthly Cycle Management

### Automatic Monthly Creation

ClickUp recurring tasks create a new instance when the previous instance is marked as Done (closed).

**Monthly flow:**
1. **Day 1:** Monthly Content Calendar + Monthly Retainer Summary tasks auto-create
2. **Day 3:** Posts Batch Generation auto-creates
3. **Day 5:** Email Campaign + Blog Post auto-create (Tier 2+)
4. **Day 10:** Site Maintenance auto-creates (Tier 3)
5. **Day 25:** Monthly Analytics Report auto-creates
6. **Before month-end:** PM reviews Monthly Retainer Summary, confirms all subtasks Done

### Manager Notification Automation

**Configuration:**
- **Trigger:** New task created in Retainer List (via recurrence)
- **Condition:** Day = 1st of month
- **Action:** Post comment on Monthly Retainer Summary: "@manager Monthly retainer tasks created for {client_name} — review and assign"

**Setup:**
1. Folder > Automations > + New
2. Trigger: Task created in Retainer List
3. Action: Post comment with manager tag

### Important: Close Tasks Promptly

ClickUp recurring tasks generate the next instance **only when the previous is closed**. If December's tasks are not marked Done by December 31, January's tasks will not auto-create.

**Best practice:** PM closes all completed monthly tasks by the 28th. The Monthly Retainer Summary task should be the last one closed each month.

**Alternative approach:** Use ClickUp Automations (Business plan) to create tasks on a schedule regardless of previous task status:
1. Automation trigger: Every month on Day {N}
2. Action: Create task from template in Retainer List

---

## 6. How to Adjust Monthly Scope

### Adding a Task
1. Create the new task in the Retainer List
2. Set to recurring (monthly, appropriate day)
3. Update the Monthly Retainer Summary checklist to include the new item
4. Document the scope change in the task comments

### Removing a Task
1. Open the recurring task
2. Remove recurrence (due date > Recurring > None)
3. Close the task with a comment: "Scope change: removed from retainer as of {date}"
4. Update the Monthly Retainer Summary checklist

### Tier Upgrade
If a client upgrades their tier (e.g., Tier 1 → Tier 2):
1. Activate the newly applicable tasks (see tier matrix)
2. Set recurrence on each
3. Update the `tier` custom field on all tasks
4. Document: "Tier upgrade: {old} → {new}, effective {date}"

---

## 7. How to Deactivate Retainer

When a client ends their retainer subscription:

1. **Complete current month's work** — finish all open retainer tasks for the current month
2. **Remove recurrence** on all retainer tasks (open each > Due date > Recurring > None)
3. **Close all retainer tasks** with comment: "Retainer deactivated as of {date}"
4. **Update project status:** Set `project_status` to "Completed" (or "On Hold" if temporary)
5. **Final analytics report:** Generate and send final retainer report to client
6. **Document:** Add comment on Monthly Retainer Summary: "Retainer closed. Final report sent {date}."

---

## 8. Validation Procedure

Test on `test-client` Folder:

1. **Activate recurring tasks** for Tier 2 scope (5 active tasks + summary)
2. **Trigger recurrence:** Close a recurring task and verify the next instance creates
3. **Verify fields:** New instance has `deliverable_status: Draft`, correct description, correct assignee role
4. **Verify notification:** Manager notification fires when retainer tasks are created
5. **Test tier adjustment:** Upgrade to Tier 3, activate Site Maintenance
6. **Test deactivation:** Remove recurrence on all tasks, close them

**Checklist:**
- [ ] 7 recurring task types configured correctly
- [ ] Recurrence triggers new instance on task close
- [ ] New instances have correct default field values
- [ ] Manager notification fires on monthly creation
- [ ] Tier-based activation works (only applicable tasks active)
- [ ] Deactivation procedure works cleanly

---

## References

- **PRD:** FR-8.1 (revised v1.2), FR-2.6 (service tiers)
- **Story:** BSS-6.7 (Retainer Operations)
- **Related SOPs:** `clickup-workspace-guide.md` (custom fields), `clickup-deliverables-guide.md` (deliverable_status pipeline), `clickup-client-onboarding.md` (template setup)
- **Related Epics:** EPIC-BSS-3 (creative pipeline feeds batch generation), EPIC-BSS-8 (QA checklists for retainer deliverables)
