---
name: brandcraft
description: |
  Extracts design systems from websites. Generates PDFs, PNGs, PPTX, videos, and social assets — all aligned with brand identity. Quality-validated with objective scoring.
version: 1.0.0
category: business
---

# BrandCraft — Visual Content Production Squad

> Extracts design systems from websites. Generates PDFs, PNGs, PPTX, videos, and social assets — all aligned with brand identity. Quality-validated with objective scoring.

## Quick Start

```
/brandcraft:brandcraft-chief
```

Then use natural language: "Create a carousel about our Q1 results" or use commands like `*extract https://example.com`.

## Agents (9)

| Agent | File | Tier | Role |
|-------|------|------|------|
| Maestro | `brandcraft-chief` | 1 | Pipeline orchestrator — routes to correct workflow |
| Prober | `token-extractor` | 0 | Extracts design tokens from URLs |
| Vault | `template-architect` | 2 | Stores/versions/serves brand templates |
| Forge-Renderer | `doc-generator` | 2 | HTML -> PDF/PNG (Puppeteer + Playwright) |
| Canvas | `pptx-architect` | 2 | PPTX generation (PptxGenJS) |
| Brush | `image-generator` | 2 | AI image generation (4 MCP providers) |
| Director | `video-architect` | 2 | Video composition (Remotion) |
| Scribe | `pdf-extractor` | 0 | PDF content extraction |
| Gauge | `quality-validator` | 3 | Brand consistency scoring (PASS/FAIL) |

## Workflows (5)

| Workflow | Pipeline | Trigger |
|----------|----------|---------|
| Extract & Save | Prober -> Vault | URL provided |
| Create Document | Vault -> Brush -> Forge -> Gauge | PDF/carousel/card request |
| Create PPTX | Vault -> Brush -> Canvas -> Gauge | Presentation request |
| Create Video | Vault -> Director -> Brush -> Gauge | Video/reel request |
| Improve Document | Scribe -> Vault -> Forge -> Gauge | PDF redesign request |

## Output Formats (11)

**Documents:** PDF A4, PDF Slides 16:9, Carousel (1080x1080/1350), Social Card (1200x630), PPTX Widescreen

**Videos:** Reel 9:16, Story 9:16, Landscape 16:9, Square 1:1, Animated Carousel 4:5, GIF

## Quality Scoring

Every output is scored by Gauge across 5 dimensions:

- **>=90**: PASS (Excellent) — immediate delivery
- **70-89**: PASS (Acceptable) — delivery with notes
- **50-69**: FAIL (Partial) — auto-correct + re-validate (max 2x)
- **<50**: FAIL (Critical) — complete re-execution

## Skill Dependencies (reused from AIOS)

| Skill | Used By | Capability |
|-------|---------|-----------|
| `design-system-extractor` | Prober | Token extraction from URLs |
| `md-to-branded-pdf` | Forge-Renderer | Markdown -> branded PDF |
| `image-creator` | Forge-Renderer | HTML -> PNG rendering |
| `canva` | Brush | Canva template integration |
| `image-fetcher` | Brush | Reference image acquisition |
| `instagram-publisher` | Maestro | Direct social publishing |

## Squad Dependencies

| Squad | Used By | Capability |
|-------|---------|-----------|
| `ai-reels` | Director | Remotion video pipeline + avatar + voice |
| `branding` | Maestro | Brand strategy governance |
| `design` | Gauge | Design system validation |

## Enhancements Over Original

| Original BrandCraft | This Version |
|---------------------|-------------|
| Only generates content | **Publishes directly** (Instagram, multi-channel) |
| No landing pages | **Generates branded LPs** (lp-generator) |
| Generic AI image MCPs | **nano-banana** integrated + image-fetcher |
| No avatar/voice | **ai-reels** with ElevenLabs + HeyGen |
| No brand strategy | **branding squad** with 6 elite minds |

## Commands

```
*route {request}     — Auto-classify and dispatch
*extract {url}       — Extract brand from URL
*create-doc {text}   — Generate PDF/carousel/card
*create-pptx {text}  — Generate presentation
*create-video {spec} — Generate video/reel
*improve {pdf}       — Redesign existing PDF
*brands              — List brand templates
*publish {platform}  — Publish last output
*status              — Pipeline status
*help                — All commands
```
