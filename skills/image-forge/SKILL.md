---
name: image-forge
description: Batch image generator with smart model routing via Replicate. This skill should be used when the user needs to generate multiple images from a list of prompts and wants the best cost/quality trade-off automatically — routing Portuguese-text diagrams to Ideogram, photorealistic slides to Flux 1.1 Pro, vector illustrations to Recraft, and draft/bulk work to Flux Schnell. Use for any request involving "gerar N imagens", "criar lote de imagens", "imagens para apresentação/slide deck/landing page", or when the user is frustrated with the cost of Google Imagen / DALL-E / Midjourney. Replaces manual per-model scripting with a single YAML input + CLI runner. NOT a replacement for image-creator (single one-off generation) or image-fetcher (downloading existing images from URLs).
---

# Image Forge

## Overview

Image Forge is a CLI-first batch image generator that takes a YAML list of image specs and produces final PNGs via Replicate, automatically picking the best model per item. It exists to solve one concrete problem: generating 10–100+ images cheaply and correctly, without the user having to know which model is good at what.

The skill is a pure orchestrator. It does not invent prompts and does not design layouts — the caller supplies those. It decides: *which model, at what cost, in what order, with what fallback*.

## When to Use

Invoke this skill when ALL of the following are true:

- The user has (or can produce) a list of 2+ image prompts with filenames.
- The user wants the images saved to a specific directory with exact filenames.
- Cost matters — the user has either stated a budget or complained about prior generation costs.
- The user accepts Replicate as the provider (others planned; see *Extending*).

Do NOT use this skill for:
- Single one-off image generation → use `image-creator` instead.
- Downloading existing images from URLs → use `image-fetcher` instead.
- Interactive prompt refinement (brainstorm → generate → iterate) → use the provider's web UI.

## Quick Start

```bash
# 1. Make sure the token is set (once per shell, or add to ~/.zshrc)
export REPLICATE_API_TOKEN="r8_..."

# 2. Copy the template and fill in items
cp ~/aios-core/skills/image-forge/assets/input.template.yaml ./my-project.yaml
$EDITOR my-project.yaml

# 3. Dry-run to preview routing and cost (no API calls)
node ~/aios-core/skills/image-forge/scripts/forge.mjs ./my-project.yaml --dry-run

# 4. Run for real
node ~/aios-core/skills/image-forge/scripts/forge.mjs ./my-project.yaml
```

## Workflow (What Claude Should Do)

When the user asks Claude to use this skill, follow this order:

### Step 1 — Discover the input
Ask (or infer from conversation) where the image list lives. Possible sources:
- A block of structured text in the conversation (TS array, JSON, markdown).
- An existing file in the project.
- Verbal description — ask the user to produce the list first.

### Step 2 — Convert to `input.yaml`
Transform whatever the user has into the canonical YAML format. The template at `assets/input.template.yaml` is the source of truth. Required fields per item:

```yaml
- id: d1                           # optional; defaults to filename without extension
  filename: 01-my-diagram.png      # REQUIRED, used as the output file name verbatim
  category: diagrama               # optional; hints the router (see references/models.md)
  aspect_ratio: '16:9'             # optional; defaults to 1:1
  prompt: |                        # REQUIRED; use | for multi-line
    Full prompt text here...
  # model: 'ideogram-ai/...'       # optional; explicit override (disables heuristic)
```

Top-level required: `output_dir: /absolute/path/to/save/`. Place the YAML next to (or inside) the project it belongs to.

### Step 3 — Run `--dry-run` first
Always run the dry-run before spending money:

```bash
node ~/aios-core/skills/image-forge/scripts/forge.mjs <path.yaml> --dry-run
```

Show the routing table and total cost to the user. Wait for explicit confirmation before proceeding.

### Step 4 — Offer draft mode when appropriate
If total estimated cost exceeds ~R$ 20 and the user has not validated the prompts on real output yet, suggest running `--draft` first (forces flux-schnell, ~95% cheaper) to check framing/composition before investing in premium models.

```bash
node ~/aios-core/skills/image-forge/scripts/forge.mjs <path.yaml> --draft
```

### Step 5 — Execute the real run
Run without `--draft`. The script will:
- Print a per-item progress line with colored status.
- Skip items whose output file already exists (resumable).
- Retry transient failures with exponential backoff (3 attempts).
- Exit with code 2 if any item failed, listing failures.

### Step 6 — Report results
Summarize: how many generated, skipped, failed, actual elapsed time, output directory. Surface any failed items with their error messages so the user can decide whether to retry, edit the prompt, or force a different model.

## Routing Logic

The router (`scripts/router.mjs`) picks a model per item using these rules, in order:

1. **Explicit `item.model`** → use it verbatim.
2. **`category: diagrama | infographic`** → Ideogram v3 turbo.
3. **`category: slide | foto | photo`** → Flux 1.1 Pro.
4. **`category: icon | vector | flat`** → Recraft v3.
5. **Prompt contains Portuguese text signals** (pt-BR phrase in quotes, accented chars, "text label", uppercase words) → Ideogram v3 turbo. *Ideogram is the only model that reliably renders pt-BR accents inside images.*
6. **Prompt contains vector keywords** (`vector`, `flat illustration`, `icon`, `SVG`, `line art`) → Recraft v3.
7. **Prompt contains photo keywords** (`photorealistic`, `cinematic`, `golden hour`, decade markers like `1950s`, `screenshot`, `mockup`) → Flux 1.1 Pro.
8. **No signal matched** → Flux 1.1 Pro (safest default).

The full heuristic spec with signal lists is in `references/models.md`. Load that file when the user asks *why* a specific item was routed somewhere, or when adding a new model.

## Cost Model (USD → BRL)

| Model | $/img | R$/img |
|---|---|---|
| Flux Schnell (`--draft`) | $0.003 | ~R$ 0,015 |
| Flux Dev | $0.025 | ~R$ 0,13 |
| Ideogram v3 Turbo | $0.03 | ~R$ 0,15 |
| Flux 1.1 Pro / Recraft v3 | $0.04 | ~R$ 0,20 |
| Flux 1.1 Pro Ultra | $0.06 | ~R$ 0,30 |
| Ideogram v3 (full) | $0.08 | ~R$ 0,40 |

Reference conversion rate lives in `scripts/forge.mjs` as `BRL_RATE` — update quarterly. Current value: **5.2**.

## CLI Reference

```
forge.mjs <input.yaml> [options]

--dry-run           Show routing plan and total cost without calling the API.
--draft             Override all routing to flux-schnell (cheapest). Use for prototyping.
--only=id1,id2      Process only items whose id or filename matches the list.
--output-dir=PATH   Override output_dir from YAML.
-y, --yes           Skip the confirmation gate (non-interactive mode).
-h, --help          Print usage.
```

### Environment variables

- `REPLICATE_API_TOKEN` — **required**. Get one at https://replicate.com/account/api-tokens

## Resumability

The runner treats existing non-empty files in `output_dir` as "already done" and skips them silently. This means:

- A batch that crashed halfway can be resumed by re-running the same command — only missing items will be generated.
- To force regeneration of a specific item, delete its file first: `rm output_dir/<filename>`.
- To regenerate everything, delete the whole output dir.

## Extending

### Adding a new model
1. Add the Replicate slug and price to `PRICE_TABLE` in `scripts/router.mjs`.
2. Add the same entry to the catalog table in `references/models.md`.
3. If the model fills a new niche, add signal patterns and a routing rule in `routeItem()`.
4. Add any model-specific input quirks to `buildModelInput()` in `scripts/replicate-client.mjs`.
5. Validate with `--dry-run` on a sample YAML.

### Adding a new provider (Fal.ai, Together.ai)
1. Create `scripts/fal-client.mjs` mirroring the `replicate-client.mjs` interface (`runPrediction`, `downloadBinary`, `withRetry`).
2. Extend `forge.mjs` to read a `provider:` field per item and dispatch.
3. Keep Replicate as the default when `provider` is unset.

## Files in This Skill

```
image-forge/
├── SKILL.md                         ← this file
├── scripts/
│   ├── forge.mjs                    ← main CLI runner
│   ├── router.mjs                   ← routing heuristic + price table
│   └── replicate-client.mjs         ← zero-dep Replicate REST client
├── references/
│   └── models.md                    ← model catalog, pricing, routing rules spec
└── assets/
    └── input.template.yaml          ← canonical input format to copy from
```

## Integration with AIOS Ecosystem

- **Complements** `skills/image-creator` (single image, interactive) and `skills/image-fetcher` (download existing images).
- **Called from** content pipelines that produce long lists of images (slide decks, landing pages, carousels).
- **CLI First** (Constitution Article I): 100% CLI-driven, no UI dependency.
- **Agent Authority** (Article II): any agent can invoke this skill; pushes/PRs of generated assets remain `@devops` territory.

## Known Limitations

- Replicate-only for now. Fal.ai and Together.ai are planned but not implemented.
- Sequential execution with 2s inter-item delay — a batch of 50 images takes ~5 min. Parallelism is intentionally off for predictable rate-limit behavior and clear logs.
- Ideogram's text rendering is excellent for headlines but still struggles with long body paragraphs in pt-BR. Keep text in images to titles and short labels.
- The `yaml` or `js-yaml` npm package must be resolvable from the runner's working directory. Both exist in `aios-core/node_modules` already.
