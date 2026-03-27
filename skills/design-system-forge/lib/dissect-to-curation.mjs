#!/usr/bin/env node

/**
 * dissect-to-curation.mjs
 *
 * Bridge between dissect-artifact.cjs output and the design squad's curation pipeline.
 *
 * Converts:
 *   tokens.yaml + extracted-css.json + components.json
 *     → all-pages-merged.json (format expected by curate_*.cjs scripts)
 *
 * Usage:
 *   node dissect-to-curation.mjs --input ~/CODE/design-systems/circle-br/design-system
 *   node dissect-to-curation.mjs --input ./design-system --output ./extraction
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const { values: args } = parseArgs({
  options: {
    input: { type: 'string', short: 'i' },
    output: { type: 'string', short: 'o' },
    help: { type: 'boolean', short: 'h' },
  },
});

if (args.help || !args.input) {
  console.log(`
Usage: dissect-to-curation.mjs --input <design-system-dir> [--output <extraction-dir>]

Converts dissect-artifact.cjs output into all-pages-merged.json
for the design squad's curation pipeline (curate_*.cjs scripts).

Options:
  -i, --input    Path to design-system/ directory (from dissect)
  -o, --output   Output directory for all-pages-merged.json (default: {input}/../extraction)
  -h, --help     Show this help
`);
  process.exit(0);
}

const INPUT_DIR = resolve(args.input);
const OUTPUT_DIR = args.output
  ? resolve(args.output)
  : join(INPUT_DIR, '..', 'extraction');

// ---------------------------------------------------------------------------
// File readers
// ---------------------------------------------------------------------------

function readJson(filename) {
  const filepath = join(INPUT_DIR, filename);
  if (!existsSync(filepath)) {
    console.warn(`  Warning: ${filename} not found`);
    return null;
  }
  return JSON.parse(readFileSync(filepath, 'utf-8'));
}

function readYaml(filename) {
  const filepath = join(INPUT_DIR, filename);
  if (!existsSync(filepath)) {
    console.warn(`  Warning: ${filename} not found`);
    return null;
  }
  const content = readFileSync(filepath, 'utf-8');
  const result = {};
  let currentSection = null;
  let currentItem = null;

  for (const line of content.split('\n')) {
    const trimmed = line.trimEnd();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const sectionMatch = trimmed.match(/^(\w[\w_]*):\s*$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      result[currentSection] = {};
      currentItem = null;
      continue;
    }

    const itemMatch = trimmed.match(/^  "?([^":\s]+)"?:\s*$/);
    if (itemMatch && currentSection) {
      currentItem = itemMatch[1];
      result[currentSection][currentItem] = {};
      continue;
    }

    const valueMatch = trimmed.match(/^    (\S+):\s*"?([^"]*)"?\s*$/);
    if (valueMatch && currentSection && currentItem) {
      result[currentSection][currentItem][valueMatch[1]] = valueMatch[2];
      continue;
    }

    const flatMatch = trimmed.match(/^  "?([^":\s]+)"?:\s*"?([^"]*)"?\s*$/);
    if (flatMatch && currentSection && !currentItem) {
      result[currentSection][flatMatch[1]] = flatMatch[2];
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Converters
// ---------------------------------------------------------------------------

function convertColors(tokens, css) {
  const colors = [];
  const seen = new Set();

  // From tokens.yaml colors section
  if (tokens?.colors) {
    for (const [name, data] of Object.entries(tokens.colors)) {
      const value = typeof data === 'string' ? data : data.value;
      const count = typeof data === 'string' ? 1 : parseInt(data.occurrences || '1');
      if (!value) continue;

      // Convert rgb() to hex
      const hex = rgbToHex(value) || value;
      if (seen.has(hex)) continue;
      seen.add(hex);

      colors.push({
        hex,
        count,
        opacity: 1,
        contexts: [name.replace(/_/g, '-')],
      });
    }
  }

  // From extracted-css cssRules.colors
  if (css?.cssRules?.colors) {
    for (const item of css.cssRules.colors) {
      const hex = rgbToHex(item.value) || item.value;
      if (seen.has(hex)) continue;
      seen.add(hex);

      colors.push({
        hex,
        count: item.count || 1,
        opacity: 1,
        contexts: ['css-rule'],
      });
    }
  }

  return colors;
}

function convertSpacings(tokens, css) {
  const spacings = [];
  const seen = new Set();

  // From tokens.yaml spacing section
  if (tokens?.spacing) {
    for (const [name, data] of Object.entries(tokens.spacing)) {
      const value = typeof data === 'string' ? data : data.value;
      const count = typeof data === 'string' ? 1 : parseInt(data.occurrences || '1');
      if (!value) continue;

      const px = parseFloat(value);
      if (isNaN(px) || seen.has(px)) continue;
      seen.add(px);

      spacings.push({
        value: px,
        count,
        type: 'padding',
        contexts: [name.replace(/_/g, '-')],
      });
    }
  }

  // From extracted-css cssRules.spacing
  if (css?.cssRules?.spacing) {
    for (const item of css.cssRules.spacing) {
      const px = parseFloat(item.value);
      if (isNaN(px) || seen.has(px)) continue;
      seen.add(px);

      spacings.push({
        value: px,
        count: item.count || 1,
        type: 'mixed',
        contexts: ['css-rule'],
      });
    }
  }

  return spacings;
}

function convertFonts(tokens) {
  const fonts = [];
  const familySeen = new Set();

  if (tokens?.typography) {
    for (const [, data] of Object.entries(tokens.typography)) {
      const family = typeof data === 'string' ? data : data['font-family'];
      const count = typeof data === 'string' ? 1 : parseInt(data.occurrences || '1');
      if (!family || familySeen.has(family)) {
        if (family && familySeen.has(family)) {
          // Accumulate count for seen family
          const existing = fonts.find((f) => f.family === family);
          if (existing) existing.count += count;
        }
        continue;
      }
      familySeen.add(family);
      fonts.push({ family, count });
    }
  }

  return fonts;
}

function convertTextStyles(tokens) {
  const textStyles = [];

  if (tokens?.typography) {
    for (const [, data] of Object.entries(tokens.typography)) {
      if (typeof data === 'string') continue;

      textStyles.push({
        fontSize: data['font-size'] || '16px',
        fontWeight: data['font-weight'] || '400',
        lineHeight: '1.5',
        letterSpacing: '0',
        count: parseInt(data.occurrences || '1'),
        textDecoration: 'NONE',
        textCase: 'ORIGINAL',
      });
    }
  }

  return textStyles;
}

function convertShadows(tokens, css) {
  const shadows = [];

  // From tokens.yaml shadows
  if (tokens?.shadows) {
    for (const [, data] of Object.entries(tokens.shadows)) {
      const value = typeof data === 'string' ? data : data.value;
      const count = typeof data === 'string' ? 1 : parseInt(data.occurrences || '1');
      if (!value) continue;

      const parsed = parseCssShadow(value);
      shadows.push({
        ...parsed,
        count,
        type: 'DROP_SHADOW',
        raw: value,
      });
    }
  }

  // From extracted-css cssRules.shadows
  if (css?.cssRules?.shadows) {
    for (const item of css.cssRules.shadows) {
      const parsed = parseCssShadow(item.value);
      shadows.push({
        ...parsed,
        count: item.count || 1,
        type: 'DROP_SHADOW',
        raw: item.value,
      });
    }
  }

  return shadows;
}

function convertRadii(css) {
  const radii = [];
  const seen = new Set();

  // Extract from extracted-css borders or inline styles
  if (css?.cssRules?.borders) {
    for (const item of css.cssRules.borders) {
      // borders don't directly contain radius, but we can scan
    }
  }

  // Scan components for borderRadius values
  return radii;
}

function convertRadiiFromComponents(components) {
  const radiiMap = new Map();

  if (!components) return [];

  for (const comp of components) {
    for (const sample of comp.samples || []) {
      const br = sample?.styles?.borderRadius;
      if (!br || br === '0px') continue;
      const px = parseInt(br);
      if (isNaN(px)) continue;
      radiiMap.set(px, (radiiMap.get(px) || 0) + (comp.count || 1));
    }
  }

  return [...radiiMap.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value - b.value);
}

function convertComponents(components) {
  if (!components) return [];
  return components.map((c) => ({
    type: c.type,
    count: c.count || 0,
    variants: (c.samples || []).map((s) => ({
      tag: s.tag,
      classes: s.classes || [],
    })),
  }));
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function rgbToHex(value) {
  if (!value) return null;
  if (value.startsWith('#')) return value;

  const match = value.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!match) return null;

  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function parseCssShadow(value) {
  if (!value) return { offsetX: 0, offsetY: 0, blur: 0, spread: 0, color: '#000000' };

  // Simple parser for "Xpx Ypx Bpx Spx color"
  const parts = value.trim().split(/\s+/);
  const nums = parts.filter((p) => /^-?\d/.test(p)).map((p) => parseFloat(p));

  return {
    offsetX: nums[0] || 0,
    offsetY: nums[1] || 0,
    blur: nums[2] || 0,
    spread: nums[3] || 0,
    color: parts.find((p) => p.startsWith('#') || p.startsWith('rgb')) || '#000000',
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log('\n  Dissect → Curation Bridge\n');
  console.log(`  Input:  ${INPUT_DIR}`);
  console.log(`  Output: ${OUTPUT_DIR}\n`);

  // Read dissect outputs
  const tokens = readYaml('tokens.yaml');
  const css = readJson('extracted-css.json');
  const components = readJson('components.json');
  const manifest = readJson('manifest.json');

  if (!tokens && !css) {
    console.error('  Error: need at least tokens.yaml or extracted-css.json');
    process.exit(1);
  }

  // Convert to all-pages-merged format
  const colors = convertColors(tokens, css);
  const spacings = convertSpacings(tokens, css);
  const fonts = convertFonts(tokens);
  const textStyles = convertTextStyles(tokens);
  const shadows = convertShadows(tokens, css);
  const radii = convertRadiiFromComponents(components);
  const comps = convertComponents(components);

  const merged = {
    meta: {
      pagesIncluded: 1,
      source: manifest?.source || 'unknown',
      generatedBy: 'dissect-to-curation.mjs',
      generatedAt: new Date().toISOString(),
      dissectVersion: manifest?.version || '1.0.0',
      stats: {
        colors: colors.length,
        spacings: spacings.length,
        fonts: fonts.length,
        textStyles: textStyles.length,
        shadows: shadows.length,
        radii: radii.length,
        components: comps.length,
      },
    },
    colors,
    spacings,
    fonts,
    textStyles,
    shadows,
    radii,
    components: comps,
  };

  // Write output
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const outputPath = join(OUTPUT_DIR, 'all-pages-merged.json');
  writeFileSync(outputPath, JSON.stringify(merged, null, 2), 'utf-8');

  // Summary
  console.log('  Conversion complete:');
  console.log(`    Colors:      ${colors.length}`);
  console.log(`    Spacings:    ${spacings.length}`);
  console.log(`    Fonts:       ${fonts.length}`);
  console.log(`    Text styles: ${textStyles.length}`);
  console.log(`    Shadows:     ${shadows.length}`);
  console.log(`    Radii:       ${radii.length}`);
  console.log(`    Components:  ${comps.length}`);
  console.log(`\n  Output: ${outputPath}\n`);
}

main();
