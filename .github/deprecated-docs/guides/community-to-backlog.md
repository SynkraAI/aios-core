# Community Idea to Backlog Transition Process

This guide documents how community ideas become backlog items and eventually get implemented.

## Overview

```
Community Idea (Discussion)
        │
        │ [Approved by maintainers]
        ▼
Internal Backlog Item (docs/stories/backlog/)
        │
        │ [Prioritized by @po]
        ▼
Sprint Planning (docs/stories/v2.x/sprint-N/)
        │
        │ [Implemented by @dev]
        ▼
Release (credited in CHANGELOG.md)
```

## Transition Process

| Step | Action | Responsible | Output |
|------|--------|-------------|--------|
| 1 | Maintainer approves idea in Discussion | @pm / @po | Label `community-approved` added |
| 2 | @po creates backlog item | @po | New file in `docs/stories/backlog/` |
| 3 | Link Discussion to backlog item | @po | Reference in backlog file header |
| 4 | Prioritize in sprint planning | @po / @sm | Move to sprint folder |
| 5 | Credit contributor in release | @pm | Entry in CHANGELOG.md |

## Step 1: Approval

When a community idea receives enough support and aligns with project goals:

1. A maintainer reviews the idea discussion
2. If approved, the maintainer adds the `community-approved` label
3. The discussion author is notified

**Approval Criteria:**
- Aligns with project vision
- Technically feasible
- Has community support (reactions, comments)
- Fits within roadmap capacity

## Step 2: Backlog Item Creation

The Product Owner (@po) creates a backlog item:

**File Location:** `docs/stories/backlog/`

**Naming Convention:** `story-{id}-{short-description}.md`

**Required Header Fields:**
```yaml
---
community_origin:
  discussion_url: https://github.com/SynkraAI/aios-core/discussions/XXX
  author: @github-username
  approved_date: YYYY-MM-DD
  approved_by: @maintainer-username
---
```

## Step 3: Linking

The backlog item must reference the original discussion:

```markdown
## Origin

This story originated from a community idea:
- **Discussion:** [Title](discussion-url)
- **Author:** @username
- **Approved:** YYYY-MM-DD
```

## Step 4: Sprint Planning

During sprint planning:

1. @po reviews backlog priorities
2. @sm includes approved items in sprint planning
3. Story file moves from `docs/stories/backlog/` to `docs/stories/v2.x/sprint-N/`

## Step 5: Contributor Credit

When the feature is released:

1. **CHANGELOG.md Entry:**
   ```markdown
   ### Features
   - feat: implement feature-name - thanks @contributor-username! (#PR-number)
   ```

2. **PR Description:**
   ```markdown
   ## Community Contribution

   This feature was proposed by @contributor-username in discussion #XXX.
   ```

## Labels

| Label | Color | Description |
|-------|-------|-------------|
| `idea` | #d4c5f9 | Initial community idea |
| `community` | #bfd4f2 | From community member |
| `community-approved` | #2ea44f | Approved for implementation |
| `community-contribution` | #7057ff | Implementation by community member |

## GitHub CLI Commands

Create labels using GitHub CLI:

```bash
# Create idea label
gh label create idea --description "Community idea" --color d4c5f9

# Create community label
gh label create community --description "From community member" --color bfd4f2

# Create community-approved label
gh label create community-approved --description "Approved community idea" --color 2ea44f

# Create community-contribution label
gh label create community-contribution --description "Implementation by community member" --color 7057ff
```

## Roles and Responsibilities

### Product Owner (@po)
- Reviews and approves community ideas
- Creates backlog items from approved ideas
- Prioritizes community contributions
- Ensures proper attribution

### Scrum Master (@sm)
- Includes approved items in sprint planning
- Coordinates with contributors
- Tracks implementation progress

### Project Manager (@pm)
- Strategic alignment review
- Ensures proper credit in releases
- Community communication

## FAQ

**Q: How long does approval take?**
A: We review ideas weekly. Popular ideas with clear value may be fast-tracked.

**Q: Can I implement my own idea?**
A: Yes! Add the `community-contribution` label and open a PR. We welcome contributors.

**Q: What if my idea is rejected?**
A: We'll explain why in the discussion. You can refine and resubmit.

**Q: How do I check the status of my idea?**
A: Watch the discussion for label changes and comments.

---

*See also: [Feature Process](/docs/FEATURE_PROCESS.md) | [Contributing Guide](/CONTRIBUTING.md)*
