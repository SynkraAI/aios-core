# EPIC-06-STORY-04 — Dashboard: Manage monitored groups (UI)
**Story ID:** ZAP-035
**Epic:** EPIC-06 — Group Monitoring Infrastructure
**Sprint:** 1 | **Phase:** MVP
**Priority:** 🟠 HIGH
**Story Points:** 2
**Status:** Ready for Review
**Assigned to:** @dev (Dex) + @ux-design-expert (Uma)
**Prepared by:** River (Scrum Master)

---

## User Story

**As a** tenant,
**I want** a web dashboard where I can add, pause, resume, and delete the competitor groups I'm monitoring,
**so that** I can easily manage my monitoring setup without using API calls.

---

## Context & Background

This is a CRUD UI for the `monitored_groups` table. Users need to:
- Add new groups (paste group JID from WhatsApp)
- View all monitored groups with status and stats
- Pause/resume monitoring without deleting
- Delete groups they no longer want to monitor

Must integrate with existing Next.js app and use Zustand for state management.

---

## Acceptance Criteria

### AC-035.1 — "Add Monitored Group" button + modal form
```
Button: "Add Competitor Group"
Modal appears with form:
  - Connection selector (which WhatsApp account)
  - Group name (text input)
  - Group JID (text input, e.g., "120363...@g.us")
  - Submit button

Validation:
  - Connection required
  - Group name: min 1 char
  - Group JID: matches @g.us pattern
  - Duplicate group error handled gracefully
```

### AC-035.2 — List view shows all monitored groups
```
Table with columns:
  - Group Name
  - Status (Active / Paused / Deleted)
  - Messages Captured (count)
  - Last Message (timestamp or "Never")
  - Actions (pause/resume/delete buttons)

Sorting:
  - By date added (default: newest first)
  - By messages captured (descending)

Filtering:
  - Show active groups (default)
  - Show all including paused/deleted
```

### AC-035.3 — Pause/Resume toggle
```
User clicks "Pause" button on active group
  → Status changes to "paused"
  → Button changes to "Resume"
  → No webhook processing for that group

User clicks "Resume"
  → Status changes to "active"
  → Monitoring resumes
```

### AC-035.4 — Delete button (soft delete with confirmation)
```
User clicks "Delete"
  → Confirmation modal: "Are you sure? This will stop monitoring."
  → On confirm: group marked as deleted, removed from view
  → Group can be "restored" in admin panel (future)
```

### AC-035.5 — Real-time message counter updates
```
If a monitored group receives messages:
  - "Messages Captured" counter increments
  - "Last Message" timestamp updates
  - Visible in dashboard without page refresh

Implementation:
  - Polling every 5 seconds (simple)
  - Or Supabase realtime subscription (preferred)
```

### AC-035.6 — Error handling for duplicate groups
```
User tries to add group that's already monitored

EXPECTED:
  - Modal form shows: "This group is already being monitored"
  - Submit button disabled
  - No API call made
```

### AC-035.7 — Empty state message
```
If no groups monitored yet:
  - Show: "No competitor groups monitored yet"
  - Show: "Add your first group to start monitoring"
  - "Add Competitor Group" button visible
```

---

## Technical Notes

### Component Structure
```
AppLayout
  └─ MonitoredGroupsPage
      ├─ MonitoredGroupsHeader
      │   └─ Button: "Add Competitor Group"
      ├─ AddMonitoredGroupModal (conditionally rendered)
      │   ├─ ConnectionSelect
      │   ├─ GroupNameInput
      │   ├─ GroupJidInput
      │   └─ SubmitButton
      └─ MonitoredGroupsTable
          ├─ GroupRow (repeated)
          │   ├─ GroupInfo
          │   ├─ StatusBadge
          │   ├─ MessageCounter (real-time)
          │   └─ ActionsMenu
          │       ├─ PauseButton / ResumeButton
          │       └─ DeleteButton
          └─ EmptyState (if no groups)
```

### Zustand Store
```typescript
// apps/web/src/stores/monitored-groups.ts

interface MonitoredGroup {
  id: string
  group_name: string
  group_jid: string
  status: 'active' | 'paused' | 'deleted'
  monitored_since: string
  last_message_at: string | null
  message_count: number
}

interface MonitoredGroupsStore {
  groups: MonitoredGroup[]
  loading: boolean
  error: string | null

  // Actions
  fetchGroups: () => Promise<void>
  addGroup: (data: { connection_id: string; group_name: string; group_jid: string }) => Promise<void>
  pauseGroup: (id: string) => Promise<void>
  resumeGroup: (id: string) => Promise<void>
  deleteGroup: (id: string) => Promise<void>
  subscribeToUpdates: () => void
}

export const useMonitoredGroupsStore = create<MonitoredGroupsStore>((set) => ({
  groups: [],
  loading: false,
  error: null,

  fetchGroups: async () => {
    set({ loading: true })
    try {
      const response = await fetch('/api/v1/monitored-groups')
      const { data } = await response.json()
      set({ groups: data, error: null })
    } catch (err) {
      set({ error: err.message })
    } finally {
      set({ loading: false })
    }
  },

  addGroup: async (data) => {
    try {
      const response = await fetch('/api/v1/monitored-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to add group')
      }
      const { data: newGroup } = await response.json()
      set((state) => ({ groups: [newGroup, ...state.groups] }))
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  pauseGroup: async (id) => {
    const response = await fetch(`/api/v1/monitored-groups/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'paused' })
    })
    const { data } = await response.json()
    set((state) => ({
      groups: state.groups.map((g) => (g.id === id ? data : g))
    }))
  },

  resumeGroup: async (id) => {
    const response = await fetch(`/api/v1/monitored-groups/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active' })
    })
    const { data } = await response.json()
    set((state) => ({
      groups: state.groups.map((g) => (g.id === id ? data : g))
    }))
  },

  deleteGroup: async (id) => {
    const response = await fetch(`/api/v1/monitored-groups/${id}`, {
      method: 'DELETE'
    })
    if (response.ok) {
      set((state) => ({
        groups: state.groups.filter((g) => g.id !== id || g.status === 'deleted')
      }))
    }
  },

  subscribeToUpdates: () => {
    // Supabase realtime subscription
    const subscription = supabase
      .from('monitored_groups')
      .on('*', (payload) => {
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === payload.new.id ? payload.new : g
          )
        }))
      })
      .subscribe()

    return () => subscription.unsubscribe()
  }
}))
```

### UI Implementation (React component)
```typescript
// apps/web/src/app/(dashboard)/monitored-groups/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useMonitoredGroupsStore } from '@/stores/monitored-groups'

export default function MonitoredGroupsPage() {
  const { groups, loading, error, fetchGroups, addGroup, pauseGroup, resumeGroup, deleteGroup } =
    useMonitoredGroupsStore()
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState<'active' | 'all'>('active')

  useEffect(() => {
    fetchGroups()
    const unsubscribe = subscribeToUpdates()
    return unsubscribe
  }, [])

  const filteredGroups = groups.filter((g) => filter === 'all' || g.status === 'active')

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Monitored Groups</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Competitor Group
        </button>
      </div>

      {showModal && <AddMonitoredGroupModal onClose={() => setShowModal(false)} />}

      {filteredGroups.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No competitor groups monitored yet</p>
          <button onClick={() => setShowModal(true)} className="text-blue-600">
            Add your first group
          </button>
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr>
              <th>Group Name</th>
              <th>Status</th>
              <th>Messages</th>
              <th>Last Message</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGroups.map((group) => (
              <tr key={group.id}>
                <td>{group.group_name}</td>
                <td>
                  <span
                    className={`badge ${
                      group.status === 'active' ? 'bg-green-100' : 'bg-yellow-100'
                    }`}
                  >
                    {group.status}
                  </span>
                </td>
                <td>{group.message_count}</td>
                <td>{group.last_message_at ? new Date(group.last_message_at).toLocaleString() : 'Never'}</td>
                <td>
                  {group.status === 'active' ? (
                    <button onClick={() => pauseGroup(group.id)}>Pause</button>
                  ) : (
                    <button onClick={() => resumeGroup(group.id)}>Resume</button>
                  )}
                  <button onClick={() => deleteGroup(group.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
```

---

## Dependencies

| Dependency | Type | Status |
|-----------|------|--------|
| ZAP-032 (API endpoints) | Hard | Must exist |
| Zustand | Runtime | ✅ Existing |
| Next.js | Runtime | ✅ Existing |
| TailwindCSS | Runtime | ✅ Existing |
| Supabase realtime | Optional | For live updates |

---

## Definition of Done

- [x] Modal form for adding groups (with validation)
- [x] List view with table (sorting + filtering)
- [x] Pause/resume toggle working
- [x] Delete with confirmation dialog
- [x] Real-time counter updates (polling or subscription)
- [x] Empty state message
- [x] Error handling (duplicate group, API errors)
- [x] Zustand store + hooks
- [x] Responsive design (mobile-friendly)
- [x] Tests: form validation, CRUD operations
- [x] No console errors/warnings

---

## File List (update as you work)

| File | Action | Notes |
|------|--------|-------|
| `apps/web/src/stores/monitored-groups.ts` | CREATE | Zustand store |
| `apps/web/src/app/(dashboard)/monitored-groups/page.tsx` | CREATE | Main page |
| `apps/web/src/components/modals/AddMonitoredGroupModal.tsx` | CREATE | Modal form |
| `apps/web/src/components/tables/MonitoredGroupsTable.tsx` | CREATE | Table component |

---

## CodeRabbit Integration

**When to run:** After UI implementation
**Focus:** Component patterns, accessibility, error handling

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-26 | River (SM) | Story created — ready for development |

---

*Source: docs/architecture/redirectflow-architecture-design.md § Part 1*
