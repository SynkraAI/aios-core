---
name: BSS Story Creation Status
description: Tracks which Brand System Service stories have been created and their location across all epics
type: project
---

## EPIC-BSS-1 Stories (docs/stories/active/ — bss-1.X-{slug}.story.md format)

Created 2026-03-16. All 7 stories for EPIC-BSS-1 (Foundation & Simplified Infrastructure).

| Story | File | Status | Notes |
|-------|------|--------|-------|
| BSS-1.1 | `bss-1.1-project-scaffold-tech-stack.story.md` | Done | All ACs complete, QA passed |
| BSS-1.2 | `bss-1.2-cloudflare-r2-asset-storage.story.md` | In Progress | ~70% — ACs 9-10 pending (tests, docs) |
| BSS-1.3 | `bss-1.3-asset-organization-naming.story.md` | In Progress | ~50% — ACs 4-8 pending |
| BSS-1.4 | `bss-1.4-basic-security-hardening.story.md` | Draft | Not started |
| BSS-1.5 | `bss-1.5-gdpr-compliance-data-pipeline.story.md` | Draft | Not started |
| BSS-1.6 | `bss-1.6-static-hosting-configuration.story.md` | In Progress | ~40% — ACs 3-8 pending |
| BSS-1.7 | `bss-1.7-infrastructure-monitoring-setup.story.md` | Draft | ~10% — Sentry DSN in config only |

Note: Legacy stories also exist in `docs/stories/epic-bss-1/` (1.X.slug.md format, more detailed dev agent records). The `docs/stories/active/` files are the formal AIOX-standard story set.

## EPIC-BSS-6 Stories (docs/stories/epic-bss-6/ — bss-6.X-{slug}.story.md format)

Created 2026-03-16. All 7 stories for EPIC-BSS-6 (ClickUp Operations & Approval Workflow). Configuration-only stories — no code, no CodeRabbit. Executor: @pm.

| Story | File | Status |
|-------|------|--------|
| BSS-6.1 | `bss-6.1-clickup-workspace-structure.story.md` | Draft |
| BSS-6.2 | `bss-6.2-client-folder-template.story.md` | Draft |
| BSS-6.3 | `bss-6.3-onboarding-flow-clickup-forms.story.md` | Draft |
| BSS-6.4 | `bss-6.4-approval-workflow.story.md` | Draft |
| BSS-6.5 | `bss-6.5-deliverables-organization.story.md` | Draft |
| BSS-6.6 | `bss-6.6-dashboard-and-metrics.story.md` | Draft |
| BSS-6.7 | `bss-6.7-retainer-operations.story.md` | Draft |

Note: Pre-existing files (6.1-6.7 kebab format, older format) remain in the directory alongside the new canonical AIOX-format files. The `bss-6.X-{slug}.story.md` files are the formal standard.

## EPIC-BSS-2 Stories (docs/stories/epic-bss-2/)

Stories BSS-2.1 through BSS-2.9 all exist (2.1-2.3 pre-existing 2026-03-15, 2.4-2.9 created 2026-03-16).

**Why:** EPIC-BSS-1 is the Wave 1 foundation. BSS-1.2 and BSS-1.3 are in-progress (critical path). BSS-1.4, 1.5, 1.7 are draft and need @dev implementation.

**How to apply:** When next session asks about BSS story work: EPIC-BSS-1 stories exist in `docs/stories/active/`. BSS-1.1 is Done, BSS-1.2 and 1.3 are In Progress. Next logical action is @po validation then @dev implementation of remaining stories. EPIC-BSS-2 stories exist in `docs/stories/epic-bss-2/`.

## EPIC-BSS-4 Stories (docs/stories/epic-bss-4/ — bss-4.X-{slug}.story.md format)

Created 2026-03-16. All 7 stories for EPIC-BSS-4 (Creative Production — Social Media & Batch). FRs covered: FR-2.1–2.8. NFRs: NFR-2.4, NFR-4.2. Dependencies: EPIC-BSS-2 (tokens) + EPIC-BSS-3 (AI pipeline).

| Story | File | Status | Complexity |
|-------|------|--------|-----------|
| BSS-4.1 | `bss-4.1-template-engine-satori-sharp.story.md` | Draft | High |
| BSS-4.2 | `bss-4.2-instagram-facebook-templates.story.md` | Draft | Medium |
| BSS-4.3 | `bss-4.3-linkedin-twitter-pinterest-templates.story.md` | Draft | Medium |
| BSS-4.4 | `bss-4.4-carousel-template-engine.story.md` | Draft | High |
| BSS-4.5 | `bss-4.5-youtube-thumbnail-banner-templates.story.md` | Draft | Medium |
| BSS-4.6 | `bss-4.6-batch-generation-pipeline.story.md` | Draft | High |
| BSS-4.7 | `bss-4.7-content-calendar-template.story.md` | Draft | Medium |

**Key technical decisions made:**
- Tech stack: Satori (`@vercel/satori`) for JSX-to-SVG, Sharp for rasterization (ADR-005)
- Hard Satori constraint: flexbox-only layouts — no CSS Grid anywhere in creative package
- BSS-4.1 replaces the placeholder at `packages/creative/src/creative-pipeline.ts` with real TemplateEngine
- TEMPLATE_REGISTRY pattern (keyed by `platform:format:variant`) established in BSS-4.2, extended in 4.3, 4.4, 4.5
- CarouselEngine (BSS-4.4) is a higher-level orchestrator on top of TemplateEngine
- BatchPipeline (BSS-4.6) is the top-level orchestrator calling all templates + AI copy generation
- ContentCalendar (BSS-4.7) produces BatchBrief via `calendarToBatchBrief()` helper — closes the loop
- YouTube thumbnails: PNG default, JPG fallback if > 2MB (2097152 bytes)
- R2 paths: `{clientId}/batch/{batchId}/{platform}/{filename}.png`
- In-memory job status Map (Phase 2 will migrate to Redis)
- CONTENT_THEMES: static data (200 theme strings, 8 industries × 5 pillars × 5 themes) — no AI in BSS-4.7

**Implementation order:** BSS-4.1 → BSS-4.2 → BSS-4.3 → BSS-4.4 → BSS-4.5 → BSS-4.6 → BSS-4.7 (strict sequential — each depends on prior)

**Next step:** @po `*validate-story-draft` on each story, then @dev implements starting with BSS-4.1.

## EPIC-BSS-5 Stories (docs/stories/epic-bss-5/ — bss-5.X-{slug}.story.md format)

Created 2026-03-16. All 8 stories for EPIC-BSS-5 (Landing Pages & Sites — Static-First). FRs covered: FR-3.1-3.10. Dependencies: EPIC-BSS-1 + EPIC-BSS-2.

| Story | File | Status | Complexity |
|-------|------|--------|-----------|
| BSS-5.1 | `bss-5.1-static-site-build-pipeline.story.md` | Draft | High |
| BSS-5.2 | `bss-5.2-landing-page-templates-static.story.md` | Draft | Medium |
| BSS-5.3 | `bss-5.3-institutional-site-templates-static.story.md` | Draft | Medium-High |
| BSS-5.4 | `bss-5.4-landing-page-copy-framework.story.md` | Draft | Medium |
| BSS-5.5 | `bss-5.5-seo-metadata-engine.story.md` | Draft | Medium |
| BSS-5.6 | `bss-5.6-cms-integration-optional.story.md` | Draft | High |
| BSS-5.7 | `bss-5.7-bio-link-and-supporting-pages.story.md` | Draft | Medium |
| BSS-5.8 | `bss-5.8-static-package-export.story.md` | Draft | Medium |

**Key technical decisions made:**
- Tech stack: Nunjucks (templates), LightningCSS (CSS bundler), esbuild (JS bundler), archiver (ZIP export)
- BSS-5.1 extends the existing placeholder at `packages/static-generator/src/static-generator.ts`
- BSS-5.6 (CMS) is in a new isolated `packages/cms/` package — never auto-imported by default pipeline
- All templates use relative paths exclusively (NFR-9.5 portability)
- Bio link page CSS is fully inline (single-file deployable)
- Social icons use inline SVG (no CDN dependency)

**Next step:** @po `*validate-story-draft` on each story, then @dev implements starting with BSS-5.1 (pipeline foundation).

## EPIC-BSS-8 Stories (docs/stories/epic-bss-8/ — bss-8.X-{slug}.story.md format)

Created 2026-03-16. All 4 stories for EPIC-BSS-8 (Quality Assurance & Review Pipeline). FRs covered: FR-8.5, FR-8.7, FR-8.9. NFRs: NFR-7.1-7.4. Dependencies: EPIC-BSS-3 + EPIC-BSS-4.

| Story | File | Status | Complexity | Executor |
|-------|------|--------|-----------|---------|
| BSS-8.1 | `bss-8.1-quality-review-queue-clickup.story.md` | Draft | Medium | @dev |
| BSS-8.2 | `bss-8.2-per-category-quality-checklists.story.md` | Draft | Medium | @dev |
| BSS-8.3 | `bss-8.3-revision-management-clickup.story.md` | Draft | Medium | @dev |
| BSS-8.4 | `bss-8.4-training-enablement-deliverables.story.md` | Draft | Medium | @dev |

**Key decisions made:**
- BSS-8.2 must complete before BSS-8.1 (checklist content before ClickUp templates)
- New package: `packages/qa-tools/` (@brand-system/qa-tools) with check-contrast.ts and check-dimensions.ts CLI tools
- New package: `packages/training-generator/` (@brand-system/training-generator) for BSS-8.4 HTML generation
- CON-14 (3-round revision cap) enforced via ClickUp automation + custom field in BSS-8.3
- Canonical checklist source: `docs/qa/checklists/{category}-checklist.md` (ClickUp templates are mirrors)
- Training docs use same token injection pattern as brand book (BSS-2.6)

## EPIC-BSS-VAL Stories (docs/stories/epic-bss-val/ — bss-val.X-{slug}.story.md format)

Created 2026-03-16. All 8 stories for EPIC-BSS-VAL (Internal Validation Program). FRs covered: FR-11.1-11.6. NFRs: NFR-9.10-9.13. Dependencies: ALL EPIC-BSS-1 through EPIC-BSS-8.

| Story | File | Status | Complexity | Executor |
|-------|------|--------|-----------|---------|
| BSS-VAL.1 | `bss-val.1-reference-project-planning.story.md` | Draft | Low | @pm |
| BSS-VAL.2 | `bss-val.2-validation-learnings-registry.story.md` | Draft | Medium | @dev |
| BSS-VAL.3 | `bss-val.3-reference-project-1-new-brand.story.md` | Draft | High (execution) | @dev |
| BSS-VAL.4 | `bss-val.4-reference-project-2-rebrand-audit.story.md` | Draft | High (execution) | @dev |
| BSS-VAL.5 | `bss-val.5-reference-project-3-tier3-simulation.story.md` | Draft | High (execution) | @dev |
| BSS-VAL.6 | `bss-val.6-additional-reference-projects.story.md` | Draft | Conditional | @dev |
| BSS-VAL.7 | `bss-val.7-learnings-integration-backlog-update.story.md` | Draft | Medium | @pm |
| BSS-VAL.8 | `bss-val.8-validation-completion-criteria.story.md` | Draft | Low (gate) | @po |

**Key decisions made:**
- BSS-VAL.2 CLI tools: `validation:add-finding` and `validation:export-report` in new `packages/validation-tools/`
- Classification system: A (MVP-blocking), B (Post-MVP), C (Client-specific) — Class A creates ClickUp task automatically
- VAL.6 is conditional — decision gate based on Class A count from Projects 1-3
- BSS-VAL.8 is a hard gate: zero open Class A findings required, no exceptions (CON-20)
- EPIC-BSS-15 (Phase 2 Portal) requires BSS-VAL.8 Done as prerequisite
- Execution sequence: VAL.1 (plan) → VAL.2 (registry) → VAL.3 → VAL.4 → VAL.5 → VAL.6 (conditional) → VAL.7 (integrate) → VAL.8 (gate)
