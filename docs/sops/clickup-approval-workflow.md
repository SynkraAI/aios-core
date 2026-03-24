# ClickUp Approval Workflow — Brand System Service

**Story:** BSS-6.4 | **Version:** 1.0 | **Date:** 2026-03-23 | **Author:** Morgan (PM)

---

## 1. Overview

Every client deliverable goes through a structured approval workflow tracked in the **Approvals List** of each client Folder. This SOP covers:

- How to submit a deliverable for client approval
- How to handle revision requests
- How to record revision comments
- What happens at the 3-round revision cap (CON-14)

---

## 2. Approval Workflow Sequence

```
                    ┌─────────────────────────────────┐
                    │  1. Internal team completes      │
                    │     deliverable                  │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │  2. Add deliverable link to      │
                    │     approval task description    │
                    │     (R2 signed URL or preview)   │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │  3. Set approval_status =        │
                    │     "Pending"                    │
                    │     → Client notified            │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │  4. Client reviews deliverable   │
                    └───────┬──────────────┬──────────┘
                            │              │
                   ┌────────▼───┐   ┌──────▼────────┐
                   │  APPROVED  │   │ NEEDS REVISION │
                   └────────┬───┘   └──────┬────────┘
                            │              │
               ┌────────────▼───┐   ┌──────▼──────────────┐
               │ Automation:    │   │ Automation:          │
               │ - Post comment │   │ - Increment          │
               │ - Update       │   │   revision_round     │
               │   deliverable  │   │ - If round=3: CAP    │
               │   task status  │   │   WARNING            │
               └────────────────┘   └──────┬──────────────┘
                                           │
                                    ┌──────▼──────────────┐
                                    │ Team revises,       │
                                    │ resubmits,          │
                                    │ sets Pending again   │
                                    └─────────────────────┘
```

---

## 3. Approval Tasks Setup

Each client Folder's **Approvals List** contains 3 deliverable approval tasks + 1 handoff task:

| Task | `deliverable_type` | `approval_status` | `revision_round` |
|------|--------------------|-------------------|------------------|
| Brand Identity Final Approval | Brand Identity | Pending | 1 |
| Creatives Final Approval | Creatives | Pending | 1 |
| Web Final Approval | Web | Pending | 1 |
| Handoff Package Sent | — | — | — |

### New Custom Field: `deliverable_type`

Add at **Workspace level** if not already present:
- **Name:** `deliverable_type`
- **Type:** Dropdown
- **Options:** Brand Identity, Creatives, Web
- **Path:** Workspace Settings > Custom Fields > + New Field

---

## 4. Step-by-Step: Submitting for Approval

1. **Complete the deliverable** — ensure internal QA is passed
2. **Open the approval task** in the Approvals List (e.g., "Brand Identity Final Approval")
3. **Add deliverable link** to task description:
   ```
   ## Deliverable for Review
   - Preview: {R2 signed URL or staging URL}
   - Generated: {date}
   - Version: v{N}
   ```
4. **Set `approval_status`** to **"Pending"**
5. **Add a comment** tagging the client contact: "@{client-name} Your brand identity deliverables are ready for review. Please review and respond with APPROVED or list your revision requests."
6. **Wait for client response** — monitor via ClickUp notifications

---

## 5. Step-by-Step: Handling Revision Requests

When the client requests revisions:

1. **Read client feedback** from ClickUp task comments
2. **Set `approval_status`** to **"Needs Revision"**
   - Automation auto-increments `revision_round`
   - Automation posts: "@manager Revision requested — please review"
3. **Add a structured revision comment** (REQUIRED):

   ```
   ## Revision Round {N}
   **Date:** {YYYY-MM-DD}
   **Items Changed:**
   - {item 1 description}
   - {item 2 description}
   **Reason:** {client feedback summary}
   **Resolution Target:** {date}
   ```

4. **Execute revisions** on the deliverable
5. **Update the deliverable link** in task description with new version
6. **Set `approval_status`** back to **"Pending"** to restart the review cycle

---

## 6. Revision Cap Enforcement (CON-14)

### Rule
Each deliverable type gets **maximum 3 revision rounds** included in tier pricing.

### What Happens at Round 3

When `revision_round` = 3 and someone sets `approval_status` to "Needs Revision":

**Automation fires:**
- Posts comment: `@manager REVISION CAP REACHED — 3 rounds used for {deliverable_type}. Scope change required before proceeding.`
- Applies tag: `revision-cap-hit`

### Manager Response (Required)

When the cap is reached, the Manager must:
1. Contact the client to discuss scope change
2. If additional revisions are approved (paid scope change):
   - Add a comment documenting the scope change agreement
   - Manually reset `revision_round` to allow further work
   - Apply tag: `scope-change-approved`
3. If no additional revisions:
   - Work with what the client has approved so far
   - Document the decision in task comments

---

## 7. ClickUp Automations Configuration

### Automation A: Revision Round Increment
- **Location:** Client Folder > Automations
- **Trigger:** Custom field `approval_status` changes to "Needs Revision"
- **Action:** Increment `revision_round` by 1
- **Scope:** All tasks in Folder

### Automation B: Revision Cap Warning
- **Location:** Client Folder > Automations
- **Trigger:** Custom field `approval_status` changes to "Needs Revision" AND `revision_round` = 3
- **Actions:**
  1. Post comment: "@manager REVISION CAP REACHED — 3 rounds used for {deliverable_type}. Scope change required before proceeding."
  2. Apply tag: `revision-cap-hit`
- **Note:** ClickUp may not support compound triggers (field change + field value). Alternative: use a single trigger (approval_status changes) with a condition check, or configure via Make.com/Zapier.

### Automation C: Approved Notification
- **Location:** Client Folder > Automations
- **Trigger:** Custom field `approval_status` changes to "Approved"
- **Actions:**
  1. Post comment: "@manager {deliverable_type} approved by client — proceed to delivery"
  2. Update linked deliverable task `deliverable_status` to "Approved"

**ClickUp compound trigger limitation:** If Automation B cannot be configured natively (compound condition), create a Make.com scenario:
1. Trigger: ClickUp webhook — custom field changed
2. Filter: field = approval_status, value = Needs Revision, AND revision_round >= 3
3. Action: ClickUp — post comment + add tag

---

## 8. Revision History & Audit Trail

### Automatic (ClickUp Native)
Every custom field change is logged in the **task activity log** with:
- Timestamp
- User who made the change
- Previous value → New value

This provides a complete, immutable audit trail.

### Required (Manual)
Every `approval_status` change must be accompanied by a structured comment (see Section 5). This ensures human-readable context alongside the automatic log.

---

## 9. Validation Test Procedure

Perform this test on the `test-client` Folder before going live:

### Test: Full 3-Round Revision Cycle

1. Open "Brand Identity Final Approval" task in test-client
2. Set `approval_status` = "Pending" (verify: notification sent)
3. Set `approval_status` = "Needs Revision" (verify: `revision_round` increments to 2)
4. Add revision comment (required format)
5. Set `approval_status` = "Pending" again
6. Set `approval_status` = "Needs Revision" (verify: `revision_round` = 3)
7. Add revision comment
8. Set `approval_status` = "Pending" again
9. Set `approval_status` = "Needs Revision" (verify: CAP WARNING comment posted, `revision-cap-hit` tag applied)
10. Set `approval_status` = "Approved" (verify: approved comment posted)

**Expected results:**
- [ ] revision_round incremented correctly: 1 → 2 → 3
- [ ] Cap warning fired on 4th revision attempt (round 3 + Needs Revision)
- [ ] Approved notification fired correctly
- [ ] All comments posted within 30 seconds of trigger

---

## References

- **PRD:** FR-8.1, FR-8.7, CON-14
- **Story:** BSS-6.4 (Approval Workflow)
- **Related SOPs:** `clickup-workspace-guide.md` (custom fields), `clickup-client-onboarding.md` (template), `clickup-deliverables-guide.md` (deliverable status)
