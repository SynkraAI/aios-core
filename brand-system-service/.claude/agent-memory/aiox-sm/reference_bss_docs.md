---
name: Brand System Service Key Document Locations
description: Canonical paths for BSS PRD, epics, architecture, and story templates
type: reference
---

Key documents for Brand System Service story work:

- PRD: `docs/prd-brand-system-service.md` (v1.2, reviewed)
- Epic Map: `docs/epics-brand-system-service.md` (v1.2)
- Architecture: `docs/architecture-brand-system-service.md`
- Stories Active: `docs/stories/epic-bss-2/` (EPIC-BSS-2 stories live here, not in `docs/stories/active/`)
- Story Template: `.aiox-core/product/templates/story-tmpl.yaml`
- Story Checklist: `.aiox-core/product/checklists/story-draft-checklist.md`

Existing code structure:
- `brand-system-service/packages/tokens/` — @bss/tokens package (placeholder token-engine.ts)
- `brand-system-service/packages/static-generator/` — static generator package (placeholder)
- `brand-system-service/packages/creative/` — creative pipeline package (placeholder)
- `brand-system-service/packages/core/` — shared core (logger, config, errors)
