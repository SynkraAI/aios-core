// image-forge — router
// Given an input item, returns { model, priceUsd, reason }.
// Pure function, zero deps. See ../references/models.md for the heuristic spec.

'use strict';

// Price table in USD per image. Keep in sync with references/models.md.
export const PRICE_TABLE = Object.freeze({
  'ideogram-ai/ideogram-v3-turbo': 0.03,
  'ideogram-ai/ideogram-v3': 0.08,
  'black-forest-labs/flux-1.1-pro': 0.04,
  'black-forest-labs/flux-1.1-pro-ultra': 0.06,
  'black-forest-labs/flux-dev': 0.025,
  'black-forest-labs/flux-schnell': 0.003,
  'recraft-ai/recraft-v3': 0.04,
  'recraft-ai/recraft-v3-svg': 0.08,
});

const MODELS = Object.freeze({
  IDEOGRAM_TURBO: 'ideogram-ai/ideogram-v3-turbo',
  FLUX_PRO: 'black-forest-labs/flux-1.1-pro',
  FLUX_SCHNELL: 'black-forest-labs/flux-schnell',
  RECRAFT: 'recraft-ai/recraft-v3',
});

// Signals that suggest Portuguese text will appear inside the image.
const PT_BR_TEXT_SIGNALS = [
  /\bpt-?br\b/i,
  /brazilian portuguese/i,
  /portuguese (title|label|text|caption|phrase)/i,
  /text label/i,
  /title on top/i,
  /[àáâãéêíóôõúç]/i, // actual accented characters in the prompt
];

// Signals that suggest photorealism/cinematic output.
const PHOTO_SIGNALS = [
  /\bphotorealistic\b/i,
  /\bcinematic\b/i,
  /\bphotograph/i,
  /\bfilm still\b/i,
  /\bportrait\b/i,
  /\bgolden hour\b/i,
  /\bdepth of field\b/i,
  /\bbokeh\b/i,
  /vintage sepia/i,
  /documentary style/i,
  /\b(18|19|20)\d0s\b/, // decade markers: 1890s, 1950s, 2020s
  /screenshot/i,
  /mockup/i,
];

// Signals that suggest vector/flat illustration.
const VECTOR_SIGNALS = [
  /\bvector\b/i,
  /\bflat illustration\b/i,
  /\bsvg\b/i,
  /\bline art\b/i,
  /\boutline\b/i,
  /\bgeometric\b/i,
  /\bicon\b/i,
  /minimalist (illustration|logo)/i,
];

// Category keywords (case-insensitive match on item.category).
const CATEGORY_MAP = Object.freeze({
  diagrama: MODELS.IDEOGRAM_TURBO,
  diagram: MODELS.IDEOGRAM_TURBO,
  infographic: MODELS.IDEOGRAM_TURBO,
  infografico: MODELS.IDEOGRAM_TURBO,
  slide: MODELS.FLUX_PRO,
  foto: MODELS.FLUX_PRO,
  photo: MODELS.FLUX_PRO,
  profissao: MODELS.FLUX_PRO,
  icon: MODELS.RECRAFT,
  icone: MODELS.RECRAFT,
  vector: MODELS.RECRAFT,
  vetorial: MODELS.RECRAFT,
  flat: MODELS.RECRAFT,
});

function countMatches(text, patterns) {
  let count = 0;
  for (const pattern of patterns) {
    if (pattern.test(text)) count += 1;
  }
  return count;
}

function countUppercasePortugueseWords(text) {
  // Match sequences of 3+ uppercase chars (possibly with accents).
  const matches = text.match(/\b[A-ZÀ-Ý]{3,}\b/g);
  return matches ? matches.length : 0;
}

/**
 * Resolve the best model for a single input item.
 *
 * @param {object} item                      Input item (from YAML).
 * @param {object} [opts]
 * @param {boolean} [opts.draft=false]       Force flux-schnell for every item.
 * @returns {{ model: string, priceUsd: number, reason: string }}
 */
export function routeItem(item, opts = {}) {
  const draft = opts.draft === true;

  // Draft mode short-circuits everything.
  if (draft) {
    return {
      model: MODELS.FLUX_SCHNELL,
      priceUsd: PRICE_TABLE[MODELS.FLUX_SCHNELL],
      reason: 'draft mode (--draft flag)',
    };
  }

  // Rule 1 — explicit override wins.
  if (typeof item.model === 'string' && item.model.length > 0) {
    const price = PRICE_TABLE[item.model];
    if (price === undefined) {
      throw new Error(
        `router: unknown model "${item.model}" on item "${item.id ?? item.filename}". ` +
          `Add it to PRICE_TABLE in scripts/router.mjs and references/models.md.`,
      );
    }
    return { model: item.model, priceUsd: price, reason: 'explicit override (item.model)' };
  }

  // Rule 2 — category hint.
  if (typeof item.category === 'string') {
    const key = item.category.toLowerCase().trim();
    if (CATEGORY_MAP[key]) {
      const model = CATEGORY_MAP[key];
      return {
        model,
        priceUsd: PRICE_TABLE[model],
        reason: `category "${item.category}" → ${model}`,
      };
    }
  }

  // Collect all text signals from the item.
  const haystack = [item.prompt, item.title, item.id, (item.tags || []).join(' ')]
    .filter(Boolean)
    .join(' ');

  // Rule 3 — Portuguese text in image → Ideogram (highest priority among prompt signals).
  const ptSignals = countMatches(haystack, PT_BR_TEXT_SIGNALS);
  const uppercasePtWords = countUppercasePortugueseWords(haystack);
  if (ptSignals >= 1 || uppercasePtWords >= 4) {
    return {
      model: MODELS.IDEOGRAM_TURBO,
      priceUsd: PRICE_TABLE[MODELS.IDEOGRAM_TURBO],
      reason: `pt-BR text in image (${ptSignals} signals, ${uppercasePtWords} uppercase words)`,
    };
  }

  // Rule 4 — vector/flat → Recraft.
  if (countMatches(haystack, VECTOR_SIGNALS) >= 1) {
    return {
      model: MODELS.RECRAFT,
      priceUsd: PRICE_TABLE[MODELS.RECRAFT],
      reason: 'vector/flat illustration signals',
    };
  }

  // Rule 5 — photorealistic → Flux Pro.
  if (countMatches(haystack, PHOTO_SIGNALS) >= 1) {
    return {
      model: MODELS.FLUX_PRO,
      priceUsd: PRICE_TABLE[MODELS.FLUX_PRO],
      reason: 'photorealistic/cinematic signals',
    };
  }

  // Rule 6 — default fallback.
  return {
    model: MODELS.FLUX_PRO,
    priceUsd: PRICE_TABLE[MODELS.FLUX_PRO],
    reason: 'default (no strong signal)',
  };
}

/**
 * Summarize routing decisions across a batch for the dry-run view.
 */
export function summarizeBatch(items, opts = {}) {
  const decisions = items.map((item) => ({
    id: item.id ?? item.filename,
    filename: item.filename,
    ...routeItem(item, opts),
  }));

  const byModel = new Map();
  let totalUsd = 0;

  for (const d of decisions) {
    totalUsd += d.priceUsd;
    const entry = byModel.get(d.model) ?? { count: 0, usd: 0 };
    entry.count += 1;
    entry.usd += d.priceUsd;
    byModel.set(d.model, entry);
  }

  return {
    decisions,
    totals: {
      count: decisions.length,
      usd: Number(totalUsd.toFixed(4)),
      brl: Number((totalUsd * 5.2).toFixed(2)),
    },
    byModel: Object.fromEntries(byModel),
  };
}
