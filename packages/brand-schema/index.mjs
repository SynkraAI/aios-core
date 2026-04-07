/**
 * @aios/brand-schema — Unified brand token loader and validator.
 *
 * Canonical brand format for the AIOS content ecosystem.
 * All skills and squads consume brands through this package.
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BRANDS_DIR = resolve(__dirname, 'brands');
const SCHEMA_PATH = resolve(__dirname, 'schema.json');

const REQUIRED_SEMANTIC_COLORS = [
  'background', 'surface', 'text', 'primary', 'accent'
];

const REQUIRED_TYPOGRAPHY = ['display', 'body'];

// js-yaml is available in the ecosystem (used by lp-generator)
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const yaml = require('js-yaml');

/**
 * Load and parse a YAML file.
 * @param {string} filePath - Absolute path to YAML file
 * @returns {object} Parsed YAML content
 */
function loadYaml(filePath) {
  const raw = readFileSync(filePath, 'utf-8');

  // Handle frontmatter format (---\n...\n---\n)
  const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  const yamlContent = frontmatterMatch ? frontmatterMatch[1] : raw;

  return yaml.load(yamlContent);
}

/**
 * Normalize a brand object from various existing formats to canonical schema.
 * Handles: lp-generator format (name at root), BrandCraft format (tokens nested),
 * and already-canonical format.
 *
 * @param {object} raw - Raw parsed brand object
 * @param {string} slug - Brand slug (from filename)
 * @returns {object} Normalized brand in canonical format
 */
function normalize(raw, slug) {
  // Already canonical (has meta.name)
  if (raw.meta?.name) {
    return raw;
  }

  // lp-generator format: name, version, theme at root level
  if (raw.name && raw.colors?.semantic) {
    return {
      meta: {
        name: raw.name,
        slug,
        version: raw.version || 1,
        theme: raw.theme || 'dark',
        source: raw.source || 'manual',
      },
      colors: raw.colors,
      typography: raw.typography,
      spacing: raw.spacing,
      radii: raw.radii,
      shadows: raw.shadows,
      animation: raw.animation,
      motion: raw.motion,
      effects: raw.effects,
      components: raw.components,
      carousel: raw.carousel,
      cover: raw.cover,
      logos: raw.logos || { main: '', icon: '' },
      anti_slop: raw.anti_slop || [],
    };
  }

  // BrandCraft vault format: tokens nested under `tokens` key
  if (raw.tokens) {
    const t = raw.tokens;
    return {
      meta: {
        name: raw.name || slug,
        slug,
        version: 1,
        theme: isLightColor(t.colors?.background) ? 'light' : 'dark',
        source: raw.source_url || 'extracted',
      },
      colors: {
        semantic: {
          background: t.colors?.background || '#000000',
          surface: t.colors?.surface || '#111111',
          text: t.colors?.text_primary || '#FFFFFF',
          text_secondary: t.colors?.text_secondary || '#AAAAAA',
          primary: t.colors?.primary || '#6366F1',
          primary_hover: lighten(t.colors?.primary || '#6366F1', 15),
          accent: t.colors?.accent || t.colors?.secondary || '#EC4899',
          success: '#34D399',
          warning: '#FBBF24',
          error: '#F87171',
          info: '#818CF8',
        },
      },
      typography: {
        family: {
          display: t.typography?.font_heading || 'Inter',
          body: t.typography?.font_body || 'Inter',
        },
        scale: buildScaleFromBrandcraft(t.typography),
      },
      spacing: buildSpacingFromNamed(t.spacing),
      logos: raw.logos || { main: '', icon: '' },
      anti_slop: [],
    };
  }

  // Unknown format — wrap minimally
  return {
    meta: { name: slug, slug, version: 1, theme: 'dark', source: 'unknown' },
    ...raw,
  };
}

/**
 * Validate a brand object against required fields.
 * @param {object} brand - Normalized brand object
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateBrand(brand) {
  const errors = [];

  if (!brand.meta?.name) {
    errors.push('meta.name is required');
  }
  if (!brand.meta?.slug) {
    errors.push('meta.slug is required');
  }
  if (!brand.meta?.theme) {
    errors.push('meta.theme is required (dark|light)');
  }

  // Validate semantic colors
  if (!brand.colors?.semantic) {
    errors.push('colors.semantic is required');
  } else {
    for (const key of REQUIRED_SEMANTIC_COLORS) {
      if (!brand.colors.semantic[key]) {
        errors.push(`colors.semantic.${key} is required`);
      }
    }
  }

  // Validate typography
  if (!brand.typography?.family) {
    errors.push('typography.family is required');
  } else {
    for (const key of REQUIRED_TYPOGRAPHY) {
      if (!brand.typography.family[key]) {
        errors.push(`typography.family.${key} is required`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Load a brand by slug from the brands directory.
 * @param {string} slug - Brand slug (filename without .yaml)
 * @returns {object} Validated, normalized brand object
 */
function loadBrand(slug) {
  const brandPath = resolve(BRANDS_DIR, `${slug}.yaml`);

  if (!existsSync(brandPath)) {
    const available = listBrands();
    throw new Error(
      `Brand "${slug}" not found in brands/. Available: ${available.join(', ')}`
    );
  }

  const raw = loadYaml(brandPath);
  const brand = normalize(raw, slug);
  const { valid, errors } = validateBrand(brand);

  if (!valid) {
    throw new Error(
      `Brand "${slug}" validation failed:\n  - ${errors.join('\n  - ')}`
    );
  }

  return brand;
}

/**
 * Load a brand from an arbitrary file path.
 * @param {string} filePath - Absolute path to brand YAML
 * @returns {object} Validated, normalized brand object
 */
function loadBrandFromPath(filePath) {
  const slug = basename(filePath, '.yaml');
  const raw = loadYaml(filePath);
  const brand = normalize(raw, slug);
  const { valid, errors } = validateBrand(brand);

  if (!valid) {
    throw new Error(
      `Brand "${slug}" validation failed:\n  - ${errors.join('\n  - ')}`
    );
  }

  return brand;
}

/**
 * Load the active brand from data/active-brand.yaml.
 * @param {string} [rootDir] - Project root (defaults to aios-core)
 * @returns {object|null} Active brand or null if not set
 */
function loadActiveBrand(rootDir) {
  const root = rootDir || resolve(__dirname, '..', '..');
  const activePath = resolve(root, 'data', 'active-brand.yaml');

  if (!existsSync(activePath)) {
    return null;
  }

  const active = loadYaml(activePath);

  if (active.path) {
    const brandPath = resolve(root, active.path);
    return loadBrandFromPath(brandPath);
  }

  if (active.slug) {
    return loadBrand(active.slug);
  }

  return null;
}

/**
 * List all available brand slugs.
 * @returns {string[]}
 */
function listBrands() {
  if (!existsSync(BRANDS_DIR)) return [];
  return readdirSync(BRANDS_DIR)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => f.replace('.yaml', ''));
}

// ── Helpers ──────────────────────────────────────────

function isLightColor(hex) {
  if (!hex) return false;
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

function lighten(hex, percent) {
  const h = hex.replace('#', '');
  const r = Math.min(255, parseInt(h.substring(0, 2), 16) + Math.round(255 * percent / 100));
  const g = Math.min(255, parseInt(h.substring(2, 4), 16) + Math.round(255 * percent / 100));
  const b = Math.min(255, parseInt(h.substring(4, 6), 16) + Math.round(255 * percent / 100));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r},${g},${b}`;
}

function buildScaleFromBrandcraft(typo) {
  if (!typo) return {};
  return {
    h1: { size: typo.size_h1 || '48px', weight: typo.weight_heading || 700, line_height: 1.1 },
    h2: { size: typo.size_h2 || '36px', weight: typo.weight_heading || 700, line_height: 1.2 },
    h3: { size: typo.size_h3 || '28px', weight: typo.weight_heading || 600, line_height: 1.3 },
    body: { size: typo.size_body || '16px', weight: typo.weight_body || 400, line_height: 1.6 },
  };
}

function buildSpacingFromNamed(spacing) {
  if (!spacing) return { scale: [4, 8, 16, 24, 32, 48, 64] };
  const values = Object.values(spacing).map((v) => parseInt(v, 10)).filter(Boolean);
  return { scale: values.sort((a, b) => a - b), named: spacing };
}

// ── CLI ──────────────────────────────────────────────

const [, , command, arg] = process.argv;

if (command === 'validate') {
  try {
    const brand = loadBrand(arg);
    console.log(`✓ Brand "${brand.meta.name}" is valid`);
    console.log(`  Theme: ${brand.meta.theme}`);
    console.log(`  Colors: ${Object.keys(brand.colors.semantic || {}).length} semantic tokens`);
    console.log(`  Typography: ${brand.typography.family.display} / ${brand.typography.family.body}`);
    process.exit(0);
  } catch (err) {
    console.error(`✗ ${err.message}`);
    process.exit(1);
  }
}

if (command === 'list') {
  const brands = listBrands();
  if (brands.length === 0) {
    console.log('No brands found in brands/');
  } else {
    console.log(`Available brands (${brands.length}):`);
    brands.forEach((b) => console.log(`  - ${b}`));
  }
  process.exit(0);
}

// ── Exports ──────────────────────────────────────────

export {
  loadBrand,
  loadBrandFromPath,
  loadActiveBrand,
  validateBrand,
  listBrands,
  normalize,
  hexToRgb,
  isLightColor,
  lighten,
};
