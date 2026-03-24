---
name: EPIC-BSS-4 Stories Created
description: All 7 EPIC-BSS-4 (Creative Production - Social Media & Batch) stories drafted in docs/stories/epic-bss-4/
type: project
---

## Summary

All 7 stories for EPIC-BSS-4 created on 2026-03-16 in `docs/stories/epic-bss-4/`.

**Why:** EPIC-BSS-4 is the Creative Production pillar (Pillar 2) of the Brand System Service. It delivers all social media templates, carousel generation, YouTube thumbnails, batch pipeline, and content calendar.

**How to apply:** When picking up EPIC-BSS-4 work, BSS-4.1 must be implemented first — all other stories depend on the TemplateEngine it establishes. The TEMPLATE_REGISTRY built across BSS-4.2/4.3/4.5 is consumed by BSS-4.6 (BatchPipeline). BSS-4.7 (ContentCalendar) feeds BSS-4.6 via calendarToBatchBrief().

## Files Created

| File | Story | Key Artifact |
|------|-------|-------------|
| `bss-4.1-template-engine-satori-sharp.story.md` | Template Engine | `TemplateEngine` class, `TokenSet`, `PlatformSpec`, replaces `creative-pipeline.ts` placeholder |
| `bss-4.2-instagram-facebook-templates.story.md` | IG/FB Templates | 4 templates × 5 variants, `TEMPLATE_REGISTRY`, `SocialContent` type |
| `bss-4.3-linkedin-twitter-pinterest-templates.story.md` | LI/X/Pinterest | 3 more templates × 5 variants, extends registry |
| `bss-4.4-carousel-template-engine.story.md` | Carousel Engine | `CarouselEngine`, 4 slide types, continuity elements |
| `bss-4.5-youtube-thumbnail-banner-templates.story.md` | YT + Covers | YouTube 5 variants + 7 platform covers, 2MB enforcement |
| `bss-4.6-batch-generation-pipeline.story.md` | Batch Pipeline | `BatchPipeline`, `BatchReport`, R2 upload, API endpoints |
| `bss-4.7-content-calendar-template.story.md` | Content Calendar | `ContentCalendar`, `CalendarExporter`, CONTENT_THEMES, CSV export |

## Critical Constraints

- Satori does NOT support CSS Grid — flexbox only in all creative templates
- YouTube thumbnails max 2MB — PNG → JPG fallback → TemplateSizeError
- BSS-4.1 is a hard prerequisite for all other stories in this epic
- Content themes in BSS-4.7 are static data (no AI calls) in MVP
- In-memory job status Map in BSS-4.6 (no Redis until Phase 2)
