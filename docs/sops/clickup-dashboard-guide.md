# ClickUp Dashboard Guide — Brand System Service

**Story:** BSS-6.6 | **Version:** 1.0 | **Date:** 2026-03-23 | **Author:** Morgan (PM)

---

## 1. Overview

The **"BSS Operations"** dashboard provides a single view of operational health across all active client projects. It is visible to Admin and Manager roles at the Workspace level.

---

## 2. Dashboard Setup

1. Navigate to **ClickUp sidebar > Dashboards > + New Dashboard**
2. Name: **"BSS Operations"**
3. Set sharing: **Admin and Manager roles** (not visible to Members)
4. Add the 6 widgets described below

---

## 3. Widget Configuration

### Widget 1: Project Timeline

| Setting | Value |
|---------|-------|
| **Widget type** | Timeline / Gantt or Table |
| **Source** | All active client Folders in "Brand System Service" Space |
| **Filter** | `project_status` IN (Planning, Active) |
| **Fields shown** | Task name (milestone), `deadline`, `project_status`, `client_name` |
| **Purpose** | Show planned vs actual completion dates for all active projects |

**Setup steps:**
1. + Add Widget > Timeline (or Table)
2. Data source: Space "Brand System Service"
3. Filter: `project_status` not equal to "Completed"
4. Columns: task name, deadline, project_status, client_name
5. Sort by: deadline ascending

---

### Widget 2: Deliverables Status

| Setting | Value |
|---------|-------|
| **Widget type** | Table or Board view |
| **Source** | All tasks with `deliverable_status` field set, across active Folders |
| **Filter** | Lists = Brand Identity, Creatives, Web |
| **Group by** | `deliverable_status` (Draft / In Review / Approved / Delivered) |
| **Fields shown** | Task name, `client_name`, `deliverable_status`, assignee |
| **Purpose** | See where every deliverable is in its lifecycle |

**Setup steps:**
1. + Add Widget > Table (or Custom)
2. Data source: Space, filter to Lists named "Brand Identity", "Creatives", "Web"
3. Group by: `deliverable_status`
4. Columns: task name, client_name, deliverable_status, assignee

---

### Widget 3: Approval Velocity

| Setting | Value |
|---------|-------|
| **Widget type** | KPI or Time in Status |
| **Source** | All tasks in Approvals Lists across active Folders |
| **Metric** | Average time from `approval_status` = Pending to = Approved |
| **Purpose** | Track how quickly clients are approving deliverables |

**Setup steps:**
1. + Add Widget > Time in Status (if available) or KPI
2. Data source: Approvals Lists, all active Folders
3. Status to measure: "Pending" (map task status to match approval_status)
4. Display: average time per client

**Workaround (if Time in Status is not available for custom fields):**
- Use task statuses that mirror approval_status: create statuses "Pending", "Approved", "Needs Revision" on the Approvals List
- Set task status = approval_status value (sync manually or via automation)
- Then Time in Status widget can measure time spent in "Pending" status

---

### Widget 4: Revision Count

| Setting | Value |
|---------|-------|
| **Widget type** | Table or Custom Field chart |
| **Source** | All approval tasks across active Folders |
| **Fields** | `client_name`, `deliverable_type`, `revision_round` |
| **Highlight** | Tasks where `revision_round` = 3 (cap approaching/hit) |
| **Purpose** | Identify clients using many revision rounds |

**Setup steps:**
1. + Add Widget > Table
2. Data source: Approvals Lists
3. Columns: client_name, deliverable_type, revision_round
4. Sort by: revision_round descending
5. Conditional formatting (if available): highlight rows where revision_round = 3

---

### Widget 5: Change Requests

| Setting | Value |
|---------|-------|
| **Widget type** | Table or KPI |
| **Source** | Tasks tagged "change-request" across all active Folders |
| **Fields** | Count total, open vs resolved, average resolution time |
| **Purpose** | Track scope change requests across all projects |

**Setup steps:**
1. Create tag `change-request` if it doesn't exist (add to any task > Tags > type "change-request")
2. + Add Widget > Table
3. Data source: Space, filter by tag = "change-request"
4. Columns: task name, client_name, status (open/closed), created date
5. Add a KPI widget showing total count

---

### Widget 6: Client Satisfaction

| Setting | Value |
|---------|-------|
| **Widget type** | KPI or Chart |
| **Source** | `client_satisfaction` field on completed project summary tasks |
| **Metric** | Average score (1-5 scale) per completed project |
| **Purpose** | Track overall client satisfaction across delivered projects |

**New custom field required:**
- **Name:** `client_satisfaction`
- **Type:** Number (range 1-5)
- **Scope:** Workspace level
- **When to fill:** Manager fills after receiving post-delivery survey response from client

**Setup steps:**
1. Create `client_satisfaction` field (Workspace Settings > Custom Fields)
2. + Add Widget > KPI or Custom Field chart
3. Data source: tasks with `project_status` = "Completed"
4. Metric: Average of `client_satisfaction`

---

## 4. Dashboard Refresh

ClickUp dashboards update in **near-real-time** (within 5 minutes of underlying data changes). No manual refresh is typically needed. If data appears stale, click the refresh icon on the dashboard.

---

## 5. Access Control

| Role | Dashboard Access |
|------|-----------------|
| Admin | Full view + edit widgets |
| Manager | Full view + edit widgets |
| Member | No access (unless explicitly shared) |

To change sharing: Dashboard settings (gear icon) > Sharing > Select roles/users.

---

## 6. Validation Checklist

Using `test-client` Folder with sample data:

- [ ] "BSS Operations" dashboard created and accessible
- [ ] Project Timeline widget shows test-client with correct dates
- [ ] Deliverables Status widget groups by deliverable_status correctly
- [ ] Approval Velocity widget displays time metrics (or sensible approximation)
- [ ] Revision Count widget shows revision_round values, highlights round=3
- [ ] Change Requests widget shows tagged tasks with count
- [ ] Client Satisfaction widget shows average score
- [ ] Dashboard visible to Admin and Manager, not to Member
- [ ] Data refreshes within 5 minutes of a field change

---

## References

- **PRD:** FR-8.6 (revised v1.2)
- **Story:** BSS-6.6 (Dashboard & Metrics)
- **Related SOPs:** `clickup-workspace-guide.md` (custom fields), `clickup-approval-workflow.md` (approval data), `clickup-deliverables-guide.md` (deliverable_status)
