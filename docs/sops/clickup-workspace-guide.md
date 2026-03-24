# ClickUp Workspace Guide — Brand System Service

**Story:** BSS-6.1 | **Version:** 1.0 | **Date:** 2026-03-23 | **Author:** Morgan (PM)

---

## 1. Workspace Overview

### Hierarchy Diagram

```
Workspace: Brand System Service (Business Plan)
  └─ Space: Brand System Service
       ├─ Folder: {client-slug}         (one per client, e.g., acme-corp)
       │    ├─ List: Onboarding
       │    ├─ List: Brand Identity
       │    ├─ List: Creatives
       │    ├─ List: Web
       │    ├─ List: Approvals
       │    └─ List: Retainer
       │
       └─ Folder: test-client           (permanent test environment)
            ├─ List: Onboarding
            ├─ List: Brand Identity
            ├─ List: Creatives
            ├─ List: Web
            ├─ List: Approvals
            └─ List: Retainer
```

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Workspace | Full service name | Brand System Service |
| Space | Same as workspace | Brand System Service |
| Folders | `{client-slug}` (kebab-case) | `acme-corp`, `dental-smile` |
| Lists | Fixed names per client | Onboarding, Brand Identity, Creatives, Web, Approvals, Retainer |

---

## 2. Setup Steps

### Step 1: Provision Workspace

1. Go to [clickup.com](https://clickup.com) and sign in
2. Create a new Workspace named **"Brand System Service"**
3. Select **Business Plan** (required for: workspace-level custom fields, automations, time tracking)
4. Configure billing and subscription

### Step 2: Invite Team Members

Invite at minimum 3 users with these roles:

| Role | ClickUp Permission | Access |
|------|-------------------|--------|
| **Admin** | Admin | Full access + billing + workspace settings |
| **Manager** | Member with elevated permissions | Create/edit projects, assign tasks, manage automations |
| **Member** | Member | Create/edit tasks in assigned projects only |

**How to invite:**
1. Workspace Settings > People > Invite
2. Enter email address
3. Select appropriate role
4. Send invitation

### Step 3: Create Space

1. Click **+ New Space** in the left sidebar
2. Name: **"Brand System Service"**
3. Privacy: Shared (all workspace members can access)
4. Enable features: Lists, Due Dates, Custom Fields, Automations, Time Tracking

### Step 4: Create Test Client Folder

1. Inside the Space, click **+ New Folder**
2. Name: **"test-client"**
3. Create 6 Lists inside the folder:
   - `Onboarding`
   - `Brand Identity`
   - `Creatives`
   - `Web`
   - `Approvals`
   - `Retainer`

### Step 5: Configure Custom Fields (Workspace Level)

Navigate to **Workspace Settings > Custom Fields** (or add from any task and select "Add to Workspace").

Create the following fields:

| Field Name | Type | Options / Range | Scope |
|------------|------|-----------------|-------|
| `client_name` | Text | — | Workspace |
| `tier` | Dropdown | Tier 1, Tier 2, Tier 3 | Workspace |
| `project_status` | Dropdown | Planning, Active, On Hold, Completed | Workspace |
| `deadline` | Date | — | Workspace |
| `approval_status` | Dropdown | Pending, Approved, Needs Revision | Workspace |
| `revision_round` | Number | Range: 1–3 | Workspace |

**Verification:** Create a test task in each of the 6 Lists in `test-client` folder. Confirm all 6 custom fields appear and accept valid input on every task.

### Step 6: Configure Email Notifications

Navigate to **Workspace Settings > Notifications** (each team member configures individually, but set recommended defaults):

**Real-time alerts (immediate email):**
- Task assigned to me
- Task status changed
- New comment on my task
- `approval_status` field changed (configure via Automation — see below)

**Daily digest:**
- General workspace updates
- Tasks due this week

**Approval status change notification (via Automation):**
1. Go to Space > Automations > + New Automation
2. Trigger: Custom field `approval_status` changes
3. Action: Send email notification to task assignee and watchers
4. Scope: Apply to all Folders in Space

---

## 3. Team Roles & Permissions Matrix

| Capability | Admin | Manager | Member |
|-----------|-------|---------|--------|
| Access billing & subscription | Yes | No | No |
| Modify workspace settings | Yes | No | No |
| Create/delete Spaces | Yes | Yes | No |
| Create/delete Folders | Yes | Yes | No |
| Create/delete Lists | Yes | Yes | No |
| Create/edit tasks | Yes | Yes | Yes (assigned projects) |
| Manage custom fields (workspace) | Yes | Yes | No |
| Configure automations | Yes | Yes | No |
| Create dashboards | Yes | Yes | No |
| View dashboards | Yes | Yes | Limited |
| Invite/remove members | Yes | No | No |
| Export data | Yes | Yes | No |

### Permission Validation Test

After setup, log in as a **Member-role** user and verify:
- [ ] Can create tasks in assigned project Lists
- [ ] Can edit task fields (custom fields, status, assignee)
- [ ] Cannot access Workspace Settings
- [ ] Cannot access Billing
- [ ] Cannot create new Spaces or Folders
- [ ] Cannot configure automations

---

## 4. Custom Field Definitions

### `client_name` (Text)
- **Purpose:** Identifies the client associated with a task
- **Who sets it:** Automatically from onboarding form (BSS-6.3) or Manager during manual setup
- **When:** On client folder creation

### `tier` (Dropdown)
- **Purpose:** Client service tier — determines scope and pricing
- **Options:** Tier 1 ($5K one-time), Tier 2 ($10K one-time), Tier 3 ($18K one-time)
- **Who sets it:** Manager during onboarding
- **Impact:** Determines which retainer tasks are active (BSS-6.7)

### `project_status` (Dropdown)
- **Purpose:** Overall project lifecycle stage
- **Options:** Planning → Active → On Hold → Completed
- **Who sets it:** Manager
- **Transitions:** Planning (default) → Active (work starts) → Completed (all deliverables delivered)

### `deadline` (Date)
- **Purpose:** Target completion date for tasks and milestones
- **Who sets it:** Manager during project setup
- **Dashboard use:** Project Timeline widget (BSS-6.6)

### `approval_status` (Dropdown)
- **Purpose:** Tracks client approval state per deliverable
- **Options:** Pending → Approved / Needs Revision
- **Who sets it:** Assignee after client feedback
- **Automation:** Triggers revision workflow (BSS-6.4)

### `revision_round` (Number, 1–3)
- **Purpose:** Tracks which revision round a deliverable is on
- **Range:** 1 (initial), 2 (first revision), 3 (final allowed)
- **CON-14 enforcement:** When reaching 3 + another revision request, automation blocks and alerts Manager
- **Who updates:** Automation increments on Needs Revision; Manager can override

---

## 5. Quick-Reference: New Team Member Onboarding

1. **Get invited** — Admin sends workspace invitation via email
2. **Accept invitation** — Click link, create ClickUp account (or connect existing)
3. **Find your projects** — Navigate to Space > your assigned client Folders
4. **Understand the structure** — Each client has 6 Lists (Onboarding through Retainer)
5. **Check your tasks** — Filter by "Assigned to me" to see your work
6. **Use custom fields** — Always fill `approval_status` and `deliverable_status` when applicable
7. **Follow the SOP** — Reference this guide and the specific workflow SOPs:
   - Client onboarding: `clickup-client-onboarding.md`
   - Approval workflow: `clickup-approval-workflow.md`
   - Deliverables: `clickup-deliverables-guide.md`
   - Dashboard: `clickup-dashboard-guide.md`
   - Retainer: `clickup-retainer-operations.md`

---

## 6. Phase 2 Migration Note

This ClickUp workspace is the MVP operational hub (CON-21). When scaling beyond 40 clients (Phase 2):
- Migrate to proprietary Client Portal (EPIC-BSS-15)
- Export client data via ClickUp API
- Preserve revision history and approval audit trail
- Document export/import mapping in migration guide

---

## References

- **PRD:** FR-8.1 (revised v1.2), NFR-9.10, CON-16, CON-21
- **Story:** BSS-6.1 (ClickUp Workspace Structure)
- **Dependencies:** EPIC-BSS-1 (Foundation), BSS-6.2–6.7 (build on this structure)
