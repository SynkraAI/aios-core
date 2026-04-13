# Models Catalog & Routing Heuristics

Reference for the image-forge skill. Load this file when deciding which model to use or when the user asks about pricing, quality trade-offs, or model capabilities.

---

## Model Catalog (Replicate, April 2026)

All prices are USD per image at default settings. Convert to BRL using ~5x multiplier for user-facing estimates.

### Tier S — Premium (use for final deliverables)

| Model ID (Replicate) | Price USD | BRL | Strong at | Weak at |
|---|---|---|---|---|
| `ideogram-ai/ideogram-v3-turbo` | $0.03 | R$ 0,15 | **Legible text in images, pt-BR accents, typography, editorial diagrams with labels** | Photorealism, complex scenes |
| `ideogram-ai/ideogram-v3` | $0.08 | R$ 0,40 | Same as turbo but higher fidelity. Use only when turbo fails on complex layouts. | Cost |
| `black-forest-labs/flux-1.1-pro` | $0.04 | R$ 0,20 | **Photorealism, cinematic, lighting, editorial photography** | Text rendering (garbles pt-BR) |
| `black-forest-labs/flux-1.1-pro-ultra` | $0.06 | R$ 0,30 | 4MP resolution, finest details, premium photography | Cost, slower |
| `recraft-ai/recraft-v3` | $0.04 | R$ 0,20 | **Vector-style illustrations, clean design, brand-consistent graphics, icons** | Photorealism |
| `recraft-ai/recraft-v3-svg` | $0.08 | R$ 0,40 | Outputs real SVG (not raster) | Limited to vector style |

### Tier A — Budget (use for drafts, bulk, exploration)

| Model ID (Replicate) | Price USD | BRL | Use when |
|---|---|---|---|
| `black-forest-labs/flux-schnell` | $0.003 | R$ 0,015 | Draft mode, cost-sensitive bulk, prototyping before investing in Pro |
| `black-forest-labs/flux-dev` | $0.025 | R$ 0,125 | Middle ground — better than Schnell, cheaper than Pro |

### Deprecated / Avoid

- `stability-ai/sdxl` — inferior quality vs Flux at same price
- `openai/dall-e-3` — not on Replicate; only via OpenAI direct, more expensive, worse than Flux
- Google Imagen via `google/*` — billing required, 2-5x more expensive, pt-BR text often wrong

---

## Routing Heuristic (Decision Tree)

Apply these rules in order. First match wins. All heuristics operate on the combined text of `prompt + title + category + tags` from the input item.

### Rule 1 — Explicit override (highest priority)
If the input item has a `model:` field set, use it verbatim. No heuristic runs.

### Rule 2 — Has Portuguese text labels → Ideogram
Match if ANY of these signals present:
- `category: diagrama` or `category: infographic`
- Prompt contains Portuguese text in quotes (e.g., `'CÓDIGO É COMMODITY'`, `"EXECUTOR"`)
- Prompt contains the phrase `pt-BR`, `Brazilian Portuguese`, or `text label`
- Prompt contains more than 3 uppercase Portuguese words
- Prompt mentions `title:` or `caption:` with Portuguese content

→ Route to `ideogram-ai/ideogram-v3-turbo`

**Reason:** Flux and Recraft mangle Portuguese accents (ç, ã, õ, é). Ideogram is the only production model that renders pt-BR correctly.

### Rule 3 — Vector/editorial/flat illustration → Recraft
Match if prompt contains:
- `vector`, `flat illustration`, `icon`, `SVG`, `minimalist illustration`
- `editorial illustration` WITHOUT photorealistic cues
- `line art`, `outline`, `geometric`

→ Route to `recraft-ai/recraft-v3`

### Rule 4 — Photorealistic/cinematic → Flux 1.1 Pro
Match if prompt contains:
- `photorealistic`, `cinematic`, `photography`, `photo`, `film still`
- `portrait`, `architectural photography`, `golden hour`
- `realistic lighting`, `depth of field`, `bokeh`
- Historical photography cues: `vintage sepia`, `1890s`, `documentary style`
- `screenshot`, `mockup` (UI realism)

→ Route to `black-forest-labs/flux-1.1-pro`

### Rule 5 — Default fallback
If no rule matched, use `black-forest-labs/flux-1.1-pro` (safest general-purpose model).

### Draft mode override
If CLI flag `--draft` is set, replace ALL routing decisions with `black-forest-labs/flux-schnell`. Use for cost-free prototyping before committing to final generation.

---

## Aspect Ratio Mapping

All providers support these ratios. Pass through from input item.

| Input | Flux | Ideogram | Recraft |
|---|---|---|---|
| `16:9` | `16:9` | `16:9` | `1820x1024` |
| `1:1` | `1:1` | `1:1` | `1024x1024` |
| `9:16` | `9:16` | `9:16` | `1024x1820` |
| `4:3` | `4:3` | `4:3` | `1365x1024` |
| `3:4` | `3:4` | `3:4` | `1024x1365` |

Recraft uses explicit pixel sizes. The skill must translate on the fly.

---

## Rate Limits (Replicate, free/hobby tier)

- **Concurrent predictions:** 10
- **Requests per minute:** 600
- **No per-model hard daily cap** (pay-per-use)

Recommendation: sequential execution with 2s delay between requests is safe. Parallelism up to 5 is fine but harder to debug.

---

## Cost Estimation Formula

```
estimated_cost_usd = Σ (model_price[item.resolved_model])
estimated_cost_brl = estimated_cost_usd * 5.2  // april 2026 rate, adjust quarterly
```

Always show BOTH currencies in the confirmation gate before executing.

---

## Adding New Models

To add a new model:
1. Append to this catalog with exact Replicate slug, price, strengths, weaknesses
2. Add routing rule if it fills a new niche (e.g., anime → add `cagliostrolab/animagine`)
3. Update `scripts/router.mjs` PRICE_TABLE and ROUTING_RULES
4. Test with `--dry-run` on sample inputs
