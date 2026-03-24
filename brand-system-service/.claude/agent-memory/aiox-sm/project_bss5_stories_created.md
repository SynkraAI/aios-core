---
name: BSS-5 Stories Created
description: All 8 EPIC-BSS-5 (Landing Pages & Sites Static-First) stories drafted in docs/stories/epic-bss-5/
type: project
---

All 8 EPIC-BSS-5 stories were created on 2026-03-16 and placed in `docs/stories/epic-bss-5/`.

**Why:** User requested formal story creation for the Landing Pages & Sites epic. Stories derived from `docs/epics-brand-system-service.md` (lines 291-309), `docs/prd-brand-system-service.md` (FR-3.1-3.10), and the existing placeholder at `brand-system-service/packages/static-generator/src/static-generator.ts`.

**How to apply:** When asked about BSS-5 story status, all 8 are Draft, ready for @po validation. BSS-5.1 is the foundation — must be implemented before all others. BSS-5.6 is optional and isolated. Implement in dependency order: 5.1 → 5.2 → 5.3 → 5.4+5.5 in parallel → 5.7 → 5.8. BSS-5.6 is independent and can be deferred.

**Stories created:**
- `bss-5.1-static-site-build-pipeline.story.md` — Replaces placeholder StaticGenerator, Nunjucks+LightningCSS+esbuild pipeline, relative paths, CLI entry point
- `bss-5.2-landing-page-templates-static.story.md` — 8-section Conversion Architecture Nunjucks templates, 3 breakpoints, WCAG AA
- `bss-5.3-institutional-site-templates-static.story.md` — 10 page types (Home/About/Services/Portfolio/Blog/Contact/etc.), shared _base.njk layout
- `bss-5.4-landing-page-copy-framework.story.md` — CopyBrief → LandingPageCopy contract, CopyValidator (1500-3000 words), copyToTemplateVars adapter
- `bss-5.5-seo-metadata-engine.story.md` — Meta title/desc generation, H1-H6 hierarchy validation, slug, sitemap.xml, robots.txt, Open Graph
- `bss-5.6-cms-integration-optional.story.md` — Payload CMS 3.x, new isolated packages/cms/ package, RBAC, draft/publish, CMSToStaticAdapter
- `bss-5.7-bio-link-and-supporting-pages.story.md` — Bio link (inline CSS, inline SVG icons), Thank You page, Microcopy Guide page + class
- `bss-5.8-static-package-export.story.md` — ZIP export via archiver, README.txt with 4 deployment methods, asset deduplication, ZIP verification

**Key architectural invariant:** Static-first by default. Even BSS-5.6 (CMS) produces static HTML via CMSToStaticAdapter — CMS is content authoring only, not runtime.

**PRs covered by these stories:** FR-3.1, FR-3.2, FR-3.4, FR-3.5 (revised), FR-3.6 (revised), FR-3.7, FR-3.8, FR-3.9, FR-3.10 | NFR-2.1, NFR-3.2, NFR-9.3, NFR-9.5.
