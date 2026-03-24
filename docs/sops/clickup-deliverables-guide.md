# ClickUp Deliverables Guide — Brand System Service

**Story:** BSS-6.5 | **Version:** 1.0 | **Date:** 2026-03-23 | **Author:** Morgan (PM)

---

## 1. Overview

Every deliverable in the Brand System Service has a dedicated ClickUp task with status tracking, R2 asset links, and version history. This SOP covers how to manage deliverable tasks consistently across all client projects.

---

## 2. Deliverable Status Pipeline

### Custom Field: `deliverable_status`

| Status | Meaning | Who Sets It |
|--------|---------|-------------|
| **Draft** | Work in progress, not yet reviewed | Assignee (default) |
| **In Review** | Internal QA passed, awaiting client review | QA Lead / Assignee |
| **Approved** | Client approved the deliverable | Assignee (after client confirms) |
| **Delivered** | Handoff package sent to client | PM / Assignee |

### Transition Rules

```
Draft ──────► In Review ──────► Approved ──────► Delivered
                 │                   │
                 │                   │  (revision cycle)
                 └───────────────────┘
                 In Review ◄──── Draft
```

- **Forward:** Draft → In Review → Approved → Delivered (standard flow)
- **Reverse:** Approved → In Review (client requests revision after approval)
- **Reverse:** In Review → Draft (internal QA fails, needs rework)
- **Not allowed:** Delivered → any previous status (once delivered, it's final)

### Setup

Add `deliverable_status` at **Workspace level**:
1. Workspace Settings > Custom Fields > + New Field
2. Name: `deliverable_status`
3. Type: Dropdown
4. Options: Draft, In Review, Approved, Delivered
5. Verify the field appears on tasks in all Lists

---

## 3. Deliverable Task Types

### Brand Book (Brand Identity List)

```
## Deliverable: Brand Book
**Type:** Brand Identity
**Tier:** {1 / 2 / 3}

## Asset Links (Current Version)
- v{N} — Complete Brand Book PDF: {R2 signed URL} (expires: {YYYY-MM-DD HH:MM UTC})
- v{N} — Brand Tokens JSON: {R2 signed URL} (expires: {YYYY-MM-DD HH:MM UTC})
- v{N} — Brand Tokens CSS: {R2 signed URL} (expires: {YYYY-MM-DD HH:MM UTC})

## Version History
(maintained via task comments — see comment thread)
```

### Social Creatives Batch (Creatives List)

```
## Deliverable: Social Creatives Batch
**Type:** Creatives
**Tier:** {1 / 2 / 3}
**Batch Size:** 30 posts

## Asset Links (Current Version)
- v{N} — Instagram Posts ZIP: {R2 signed URL} (expires: {YYYY-MM-DD HH:MM UTC})
- v{N} — Facebook Posts ZIP: {R2 signed URL} (expires: {YYYY-MM-DD HH:MM UTC})
- v{N} — LinkedIn Posts ZIP: {R2 signed URL} (expires: {YYYY-MM-DD HH:MM UTC})

## Version History
(maintained via task comments — see comment thread)
```

### Landing Page (Web List)

```
## Deliverable: Landing Page
**Type:** Web
**Tier:** {2 / 3} (Tier 1 does not include web)

## Asset Links (Current Version)
- v{N} — Preview URL: {staging URL}
- v{N} — Production URL: {production URL} (after deployment)
- v{N} — Source Code: {R2 signed URL or Git tag reference}

## Version History
(maintained via task comments — see comment thread)
```

---

## 4. R2 Asset Path Convention

All deliverable assets are stored in Cloudflare R2 following this path structure (per FR-8.3):

```
r2://brand-assets/{client-id}/{deliverable-type}/v{N}/
```

**Examples:**
```
r2://brand-assets/acme-corp/brand-identity/v1/brand-book.pdf
r2://brand-assets/acme-corp/brand-identity/v1/tokens.json
r2://brand-assets/acme-corp/creatives/v2/instagram-batch.zip
r2://brand-assets/acme-corp/web/v1/landing-page.zip
```

### Signed URLs

R2 signed URLs expire in **15 minutes** (FR-8.3). When sharing via ClickUp:
1. Generate a fresh signed URL immediately before adding to the task
2. Note the expiry time in the asset link
3. For long-term reference, use the `r2://` path — it's the stable identifier

---

## 5. Version History Protocol

### When to Create a New Version

- Initial upload = v1
- Each revision cycle that produces new assets = increment version (v2, v3, etc.)
- Minor fixes within the same review cycle = same version (update the asset, add note)

### Version Comment Format (REQUIRED)

When uploading a new version, add a task comment:

```
## Version {N} Uploaded
**Date:** {YYYY-MM-DD}
**Summary:** {brief description of changes from previous version}
**R2 Path:** r2://brand-assets/{client-id}/{deliverable-type}/v{N}/
**Files:**
- {filename 1} — {description}
- {filename 2} — {description}
```

**Example:**
```
## Version 2 Uploaded
**Date:** 2026-04-15
**Summary:** Updated color palette per client revision request — changed primary blue from #1E40AF to #2563EB, adjusted typography contrast ratio
**R2 Path:** r2://brand-assets/acme-corp/brand-identity/v2/
**Files:**
- brand-book-v2.pdf — Updated brand book with revised colors
- tokens-v2.json — Updated design tokens
- tokens-v2.css — Updated CSS variables
```

---

## 6. Automation: Delivered Notification

### Configuration
- **Location:** Client Folder > Automations
- **Trigger:** Custom field `deliverable_status` changes to "Delivered"
- **Action:** Post comment: "@manager {task name} delivered to client — awaiting confirmation"

### Setup Steps
1. Open client Folder > Automations (lightning bolt)
2. + New Automation
3. Trigger: "When custom field changes" > select `deliverable_status` > value = "Delivered"
4. Action: "Post comment" > text: "@manager {task name} delivered to client — awaiting confirmation"
5. Save and enable

---

## 7. Template Integration

All deliverable tasks in the **BSS Client Template** (BSS-6.2) must include:
- `deliverable_status` field set to **Draft** (default)
- Description following the templates in Section 3 (with placeholder values)
- Asset Links section ready for the team to fill in

This is configured during BSS-6.2 template setup. When creating a new client from the template, the deliverable tasks come pre-configured.

---

## 8. Validation Procedure

Test on the `test-client` Folder:

1. **Create a test deliverable task** (e.g., "Test Brand Book") in Brand Identity List
2. **Set fields:** `deliverable_status` = Draft, `deliverable_type` = Brand Identity
3. **Add description** using the Brand Book template from Section 3
4. **Simulate v1 upload:** Add a version comment using the format in Section 5
5. **Move through statuses:** Draft → In Review → Approved → Delivered
6. **Verify automation:** On Delivered, confirm the manager notification comment appears
7. **Verify reverse transition:** Create another test, move to Approved, then back to In Review

**Checklist:**
- [ ] `deliverable_status` field exists and works on all Lists
- [ ] Description template renders correctly
- [ ] Version comment added successfully
- [ ] Status transitions work in correct order
- [ ] Reverse transition (Approved → In Review) works
- [ ] Delivered automation fires within 30 seconds

---

## References

- **PRD:** FR-8.1, FR-8.3, FR-8.4
- **Story:** BSS-6.5 (Deliverables Organization)
- **Related SOPs:** `clickup-workspace-guide.md` (custom fields), `clickup-approval-workflow.md` (approval status integration), `clickup-client-onboarding.md` (template)
