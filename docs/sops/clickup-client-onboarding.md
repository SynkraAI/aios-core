# ClickUp Client Onboarding — Brand System Service

**Stories:** BSS-6.2 + BSS-6.3 | **Version:** 1.0 | **Date:** 2026-03-23 | **Author:** Morgan (PM)

---

## 1. BSS Client Template Overview

The **"BSS Client Template"** is a reusable ClickUp Folder template that creates a complete client project structure in under 3 minutes.

### What the Template Creates

```
Folder: {client-slug}
  ├─ List: Onboarding (5 tasks)
  ├─ List: Brand Identity (8 tasks)
  ├─ List: Creatives (5 tasks)
  ├─ List: Web (5 tasks)
  ├─ List: Approvals (4 tasks)
  └─ List: Retainer (7 recurring tasks)
  + 5 Milestone tasks
  + 3 Automations
```

---

## 2. Standard Task Set Per List

### Onboarding List

| # | Task Name | Description | Default Fields |
|---|-----------|-------------|----------------|
| 1 | Intake Form Sent | Send client the intake form link. Mark complete when sent. | project_status: Planning |
| 2 | Intake Form Received & Reviewed | Form response received. Review all fields, flag missing info. | project_status: Planning |
| 3 | Discovery Workshop Scheduled | Schedule 60-min discovery call. Include calendar invite link. | project_status: Planning |
| 4 | Discovery Workshop Completed | Document key insights from discovery session in task comments. | project_status: Planning |
| 5 | Project Kick-off Confirmation Sent | Send confirmation email with timeline, deliverables list, and team contacts. | project_status: Active |

### Brand Identity List

| # | Task Name | Description | Default Fields |
|---|-----------|-------------|----------------|
| 1 | AI Analysis Pipeline Run | Execute brand analysis pipeline with intake data. Attach output report. | deliverable_status: Draft |
| 2 | Human Review — Color Palette | Review AI-generated color palette. Adjust and document final selection. | deliverable_status: Draft |
| 3 | Human Review — Typography | Review AI-generated typography recommendations. Select final pairing. | deliverable_status: Draft |
| 4 | Human Review — Moodboard | Review AI moodboard. Curate final visual direction. | deliverable_status: Draft |
| 5 | Human Review — Voice & Manifesto | Review AI brand voice output. Refine tone, personality, manifesto copy. | deliverable_status: Draft |
| 6 | Token File Generation | Generate design tokens (JSON/CSS) from approved brand decisions. | deliverable_status: Draft |
| 7 | Brand Book Draft Published | Compile all brand elements into brand book. Publish draft for internal QA. | deliverable_status: In Review |
| 8 | Brand Book — Client Approval | Send brand book to client for approval. Track in Approvals List. | approval_status: Pending |

### Creatives List

| # | Task Name | Description | Default Fields |
|---|-----------|-------------|----------------|
| 1 | Content Brief Received | Client content brief for social/creative batch. Attach brief doc. | deliverable_status: Draft |
| 2 | Batch Generation Run | Execute AI creative pipeline for social post batch (30 posts). | deliverable_status: Draft |
| 3 | Internal QA — Social Templates | QA each post against brand guidelines, platform specs, copy quality. | deliverable_status: In Review |
| 4 | Client Preview Sent | Share preview link (R2 signed URL) with client for review. | deliverable_status: In Review |
| 5 | Creatives — Client Approval | Client reviews and approves creative batch. Track in Approvals List. | approval_status: Pending |

### Web List

| # | Task Name | Description | Default Fields |
|---|-----------|-------------|----------------|
| 1 | Landing Page Copy Approved | Client approves landing page copy (from creative pipeline or manual). | approval_status: Pending |
| 2 | Landing Page Built | Build static landing page using approved brand tokens and copy. | deliverable_status: Draft |
| 3 | Landing Page — Internal QA | QA: responsive, performance, accessibility, brand compliance. | deliverable_status: In Review |
| 4 | Landing Page — Client Approval | Send preview URL to client for final approval. | approval_status: Pending |
| 5 | Static Site Deployed | Deploy approved landing page to production. Record deploy URL. | deliverable_status: Delivered |

### Approvals List

| # | Task Name | Description | Default Fields |
|---|-----------|-------------|----------------|
| 1 | Brand Identity Final Approval | Master approval task for entire brand identity package. | approval_status: Pending, revision_round: 1, deliverable_type: Brand Identity |
| 2 | Creatives Final Approval | Master approval task for creative batch. | approval_status: Pending, revision_round: 1, deliverable_type: Creatives |
| 3 | Web Final Approval | Master approval task for web deliverables. | approval_status: Pending, revision_round: 1, deliverable_type: Web |
| 4 | Handoff Package Sent | All deliverables approved. Compile and send final handoff package. | project_status: Completed |

### Retainer List

| # | Task Name | Recurrence | Assignee Role | Est. Hours |
|---|-----------|-----------|---------------|------------|
| 1 | Monthly Content Calendar | Monthly, day 1 | Content Lead | 3h |
| 2 | Posts Batch Generation (30 posts) | Monthly, day 3 | Creative Lead | 4h |
| 3 | Email Campaign | Monthly, day 5 | Content Lead | 2h |
| 4 | Blog Post | Monthly, day 5 | Content Lead | 3h |
| 5 | Site Maintenance & Updates | Monthly, day 10 | Dev | 2h |
| 6 | Monthly Analytics Report | Monthly, day 25 | PM | 1h |
| 7 | Monthly Retainer Summary | Monthly, day 1 | PM | 0.5h |

> **Note:** Retainer tasks are created as recurring but **deactivated by default**. Activate when client subscribes to retainer service. See `clickup-retainer-operations.md` for details.

---

## 3. Milestone Tasks

| Milestone | Location | Trigger |
|-----------|----------|---------|
| Onboarding Complete | Onboarding List | All 5 onboarding tasks done |
| Brand Identity Approved | Approvals List | Brand Identity Final Approval = Approved |
| Creatives Delivered | Approvals List | Creatives Final Approval = Approved |
| Web Delivered | Approvals List | Web Final Approval = Approved |
| Project Closed | Approvals List | Handoff Package Sent + all deliverables Delivered |

**How to create milestones in ClickUp:**
1. Create a task with the milestone name
2. Click the task > More options (three dots) > Mark as Milestone
3. Set dependency: milestone depends on the triggering task(s)

---

## 4. Template Automations

Configure these 3 automations at the **Folder level** so they auto-activate on template use.

### Automation 1: Revision Requested
- **Trigger:** Custom field `approval_status` changes to "Needs Revision"
- **Actions:**
  1. Set `project_status` to "Active"
  2. Post comment: "@manager Revision requested — please review"

### Automation 2: All Approvals Complete
- **Trigger:** All tasks in Approvals List have `approval_status` = "Approved"
- **Action:** Post comment: "@manager All approvals complete — ready for delivery"

### Automation 3: Delivered Notification
- **Trigger:** Task status changes to "Delivered"
- **Action:** Send email notification to task assignee

**Setup path:** Open Folder > Automations (lightning bolt icon) > + New Automation

---

## 5. How to Save as Template

1. Create the complete Folder structure with all 6 Lists, tasks, milestones, and automations in a temporary Folder
2. Right-click the Folder name > **Save as Template**
3. Name: **"BSS Client Template"**
4. Include: Tasks, Custom Field Values, Automations, Relationships
5. Verify template is saved in **Workspace Templates** (not Space Templates)

---

## 6. Creating a New Client from Template

### Step-by-Step (Target: Under 3 Minutes)

1. Navigate to Space **"Brand System Service"**
2. Click **+ New Folder**
3. Select **"From Template"** > choose **"BSS Client Template"**
4. Name the Folder using `{client-slug}` convention (e.g., `acme-corp`)
5. Click **Create**
6. Open the new Folder and update:
   - Set `client_name` on all tasks (or use bulk edit)
   - Set `tier` based on client subscription (Tier 1 / 2 / 3)
   - Assign team members to their respective tasks
   - Set `deadline` dates based on project timeline
7. If client has retainer: activate recurring tasks in Retainer List (see `clickup-retainer-operations.md`)

### Bulk Field Update Tip
1. Go to any List view
2. Select all tasks (checkbox at top)
3. Bulk edit > Set `client_name` and `tier` for all tasks at once

---

## 7. Intake Form (BSS-6.3)

### Form Tool: ClickUp Native Forms (Primary)

Use ClickUp Forms as the primary intake tool. If limitations are found (e.g., no slider for brand personality scales), fallback to Tally.so with Zapier/Make integration.

### Form Fields

| Section | Field | Type | Required |
|---------|-------|------|----------|
| **Company Info** | Company Name | Text | Yes |
| | Industry | Dropdown | Yes |
| | Website URL | URL | No |
| | Team Size | Number | No |
| **Brand Personality** | Formal vs Casual (1-5) | Rating/Number | Yes |
| | Traditional vs Modern (1-5) | Rating/Number | Yes |
| | Serious vs Playful (1-5) | Rating/Number | Yes |
| | Conservative vs Bold (1-5) | Rating/Number | Yes |
| | Minimal vs Expressive (1-5) | Rating/Number | Yes |
| **Visual Preferences** | Mood Selection | Multiple Select (4+ options) | Yes |
| **Assets** | Existing Assets Link (Drive/Dropbox) | URL | No |
| **Competitors** | Competitor URL 1-5 | URL (x5) | No |
| **Deliverables** | Selected Deliverables | Checkboxes (Tier 1/2/3 items) | Yes |
| **Notes** | Additional Notes | Long Text | No |
| **Contact** | Contact Email | Email | Yes |

### Form-to-ClickUp Automation

**On form submission, the following should happen automatically:**

1. **Create Folder** from "BSS Client Template" with name = Company Name (slugified)
2. **Set custom fields:** `client_name` = Company Name, `project_status` = Planning
3. **Populate intake task:** Copy all form responses into the "Intake Form Received & Reviewed" task description in the Onboarding List
4. **Send confirmation email** to client Contact Email: "Thank you for submitting your brand intake form. Our team will review your responses and schedule a discovery workshop within 2 business days."
5. **Notify Manager** in ClickUp: "@manager New client intake received: {Company Name}"

### ClickUp Forms Setup

1. Navigate to Space > **Forms** (or Folder > Add View > Form)
2. Build form with all fields from the table above
3. Configure form submission settings:
   - Create task in: Onboarding List of a staging Folder
   - Map fields to task description
4. Set up automation to move/copy the created task to the correct client Folder

### Fallback: Tally.so Setup

If ClickUp Forms cannot support all field types:
1. Create form at [tally.so](https://tally.so)
2. Configure webhook on submission → Make.com scenario
3. Make.com scenario: ClickUp Create Folder from Template → Set Fields → Create Task with form data
4. Configure Tally email confirmation for client

### Form Link

After creation, generate the public shareable link:
- ClickUp: Form settings > Share > Copy link
- Tally: Share > Copy link

Document the live form URL here after creation: `[TO BE ADDED]`

---

## 8. Validation Checklist

### BSS-6.2 Validation
- [ ] Template "BSS Client Template" exists in Workspace Templates
- [ ] Creating a Folder from template produces all 6 Lists with correct tasks
- [ ] All custom fields have correct default values
- [ ] 5 milestones are present with milestone markers
- [ ] 3 automations are active on the new Folder
- [ ] Full creation takes under 3 minutes (timed)

### BSS-6.3 Validation
- [ ] Form is accessible via public link
- [ ] All fields from the field table are present and functional
- [ ] Form completable in under 15 minutes
- [ ] Form submission creates client Folder automatically
- [ ] Client confirmation email received within 5 minutes
- [ ] Manager ClickUp notification fires
- [ ] Form works on mobile (375px viewport)
- [ ] Form works on desktop (1920px viewport)

---

## References

- **PRD:** FR-8.1 (revised v1.2), FR-1.1, FR-8.7, CON-14, NFR-3.1, NFR-3.2
- **Stories:** BSS-6.2 (Client Folder Template), BSS-6.3 (Onboarding Flow)
- **Related SOPs:** `clickup-workspace-guide.md`, `clickup-approval-workflow.md`, `clickup-deliverables-guide.md`, `clickup-retainer-operations.md`
