#!/usr/bin/env node
/**
 * Design System Forge — Tailwind Config Generator
 *
 * Converts consolidated tokens into a Tailwind CSS config
 * and CSS custom properties file.
 *
 * Usage:
 *   node generate-tailwind.mjs --input ./design-system/tokens/consolidated.yaml
 *   node generate-tailwind.mjs --input ./consolidated.yaml --css-only
 *   node generate-tailwind.mjs --input ./consolidated.yaml --animations
 */

import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Parse args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
let inputPath = null;
let cssOnly = false;
let animationsOnly = false;
let outputDir = null;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--input' || arg === '-i') {
    inputPath = args[++i];
  } else if (arg === '--output' || arg === '-o') {
    outputDir = args[++i];
  } else if (arg === '--css-only') {
    cssOnly = true;
  } else if (arg === '--animations') {
    animationsOnly = true;
  } else if (arg === '--help' || arg === '-h') {
    console.log(`
Design System Forge — Tailwind Config Generator

Usage:
  node generate-tailwind.mjs --input ./design-system/tokens/consolidated.yaml

Options:
  --input, -i      Path to consolidated.yaml (required)
  --output, -o     Output directory (default: cwd)
  --css-only       Generate only tokens.css (CSS custom properties)
  --animations     Generate only animation/keyframes config
  --help, -h       Show this help
`);
    process.exit(0);
  }
}

if (!inputPath) {
  console.error('Error: --input is required.');
  process.exit(1);
}

if (!fs.existsSync(inputPath)) {
  console.error(`Error: File not found: ${inputPath}`);
  process.exit(1);
}

outputDir = outputDir || process.cwd();

// ---------------------------------------------------------------------------
// Parse consolidated YAML
// ---------------------------------------------------------------------------

function parseConsolidatedYaml(content) {
  const result = {
    light: { colors: [], backgroundColors: [], typography: [], spacing: [], shadows: [], gradients: [] },
    dark: { colors: [], backgroundColors: [], gradients: [] },
  };

  let section = null; // 'light' or 'dark'
  let subsection = null;
  let currentItem = null;

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (trimmed === 'light:') { section = 'light'; continue; }
    if (trimmed === 'dark:') { section = 'dark'; continue; }

    // Subsection
    const subMatch = trimmed.match(/^(\w[\w_]*):\s*$/);
    if (subMatch && section) {
      subsection = subMatch[1];
      continue;
    }

    // Array item
    if (trimmed.startsWith('- value:') && section && subsection) {
      const value = trimmed.replace(/^- value:\s*["']?/, '').replace(/["']$/, '');
      currentItem = { value };
      if (!result[section][subsection]) result[section][subsection] = [];
      result[section][subsection].push(currentItem);
      continue;
    }

    // Item properties
    if (currentItem && trimmed.startsWith('name:')) {
      currentItem.name = trimmed.replace(/^name:\s*["']?/, '').replace(/["']$/, '');
    }
    if (currentItem && trimmed.startsWith('count:')) {
      currentItem.count = parseInt(trimmed.replace(/^count:\s*/, ''));
    }
    if (currentItem && trimmed.startsWith('font_family:')) {
      currentItem.fontFamily = trimmed.replace(/^font_family:\s*["']?/, '').replace(/["']$/, '');
    }
    if (currentItem && trimmed.startsWith('font_size:')) {
      currentItem.fontSize = trimmed.replace(/^font_size:\s*["']?/, '').replace(/["']$/, '');
    }
    if (currentItem && trimmed.startsWith('font_weight:')) {
      currentItem.fontWeight = trimmed.replace(/^font_weight:\s*["']?/, '').replace(/["']$/, '');
    }

    // Simple array items (shadows, gradients)
    if (trimmed.startsWith('- "') && section && subsection) {
      const value = trimmed.replace(/^- ["']/, '').replace(/["']$/, '');
      if (!result[section][subsection]) result[section][subsection] = [];
      result[section][subsection].push(value);
      currentItem = null;
    }

    // Typography array items
    if (trimmed.startsWith('- name:') && section && subsection === 'typography') {
      const name = trimmed.replace(/^- name:\s*["']?/, '').replace(/["']$/, '');
      currentItem = { name };
      result[section][subsection].push(currentItem);
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Color name generator
// ---------------------------------------------------------------------------

function generateColorName(value, index) {
  const parsed = parseColor(value);
  if (!parsed) return `color-${index}`;

  const { r, g, b } = parsed;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  if (brightness < 30) return `dark-${index}`;
  if (brightness > 230) return `light-${index}`;
  if (r > g && r > b) return `red-${index}`;
  if (g > r && g > b) return `green-${index}`;
  if (b > r && b > g) return `blue-${index}`;
  return `neutral-${index}`;
}

function parseColor(str) {
  if (!str) return null;
  const rgbMatch = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) return { r: parseInt(rgbMatch[1]), g: parseInt(rgbMatch[2]), b: parseInt(rgbMatch[3]) };
  const hexMatch = str.match(/^#([0-9a-f]{3,8})$/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    return { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16) };
  }
  return null;
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function colorToHex(str) {
  const parsed = parseColor(str);
  if (!parsed) return str;
  return rgbToHex(parsed.r, parsed.g, parsed.b);
}

// ---------------------------------------------------------------------------
// Generate Tailwind config
// ---------------------------------------------------------------------------

function generateTailwindConfig(tokens) {
  const lines = [
    '// tailwind.config.forge.ts',
    '// Auto-generated by Design System Forge',
    `// Generated: ${new Date().toISOString()}`,
    '//',
    '// Spread this into your main tailwind.config.ts:',
    '//   import forgeConfig from \'./tailwind.config.forge\';',
    '//   export default { ...forgeConfig, ...yourConfig };',
    '',
    'import type { Config } from \'tailwindcss\';',
    '',
    'const forgeConfig: Partial<Config> = {',
    '  theme: {',
    '    extend: {',
  ];

  // Colors
  if (tokens.light.colors.length > 0) {
    lines.push('      colors: {');
    for (let i = 0; i < tokens.light.colors.length; i++) {
      const c = tokens.light.colors[i];
      const name = c.name || generateColorName(c.value, i);
      const hex = colorToHex(c.value);
      lines.push(`        '${name}': '${hex}',`);
    }
    lines.push('      },');
  }

  // Typography
  const fontFamilies = [...new Set(tokens.light.typography.map(t => t.fontFamily).filter(Boolean))];
  if (fontFamilies.length > 0) {
    lines.push('      fontFamily: {');
    for (let i = 0; i < fontFamilies.length; i++) {
      const family = fontFamilies[i];
      const name = family.split(',')[0].trim().toLowerCase().replace(/['"]/g, '').replace(/\s+/g, '-');
      lines.push(`        '${name}': ['${family}'],`);
    }
    lines.push('      },');
  }

  const fontSizes = [...new Set(tokens.light.typography.map(t => t.fontSize).filter(Boolean))];
  if (fontSizes.length > 0) {
    lines.push('      fontSize: {');
    for (const size of fontSizes.sort((a, b) => parseFloat(a) - parseFloat(b))) {
      const name = `fs-${size.replace(/[^0-9.]/g, '')}`;
      lines.push(`        '${name}': '${size}',`);
    }
    lines.push('      },');
  }

  // Spacing
  if (tokens.light.spacing.length > 0) {
    lines.push('      spacing: {');
    for (const s of tokens.light.spacing) {
      const value = s.value || s;
      const name = s.name || `sp-${value.replace(/[^0-9.]/g, '')}`;
      lines.push(`        '${name}': '${value}',`);
    }
    lines.push('      },');
  }

  // Shadows
  if (tokens.light.shadows.length > 0) {
    lines.push('      boxShadow: {');
    for (let i = 0; i < tokens.light.shadows.length; i++) {
      const shadow = tokens.light.shadows[i];
      lines.push(`        'forge-${i}': '${shadow}',`);
    }
    lines.push('      },');
  }

  lines.push('    },'); // close extend
  lines.push('  },'); // close theme
  lines.push('};');
  lines.push('');
  lines.push('export default forgeConfig;');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Generate CSS custom properties
// ---------------------------------------------------------------------------

function generateCssTokens(tokens) {
  const lines = [
    '/* tokens.css */',
    `/* Auto-generated by Design System Forge — ${new Date().toISOString()} */`,
    '',
    ':root {',
  ];

  // Light mode colors
  for (let i = 0; i < tokens.light.colors.length; i++) {
    const c = tokens.light.colors[i];
    const name = c.name || `color-${i}`;
    const hex = colorToHex(c.value);
    lines.push(`  --forge-${name}: ${hex};`);
  }

  // Background colors
  for (let i = 0; i < tokens.light.backgroundColors.length; i++) {
    const c = tokens.light.backgroundColors[i];
    const hex = colorToHex(c.value);
    lines.push(`  --forge-bg-${i}: ${hex};`);
  }

  // Typography
  const fontFamilies = [...new Set(tokens.light.typography.map(t => t.fontFamily).filter(Boolean))];
  for (let i = 0; i < fontFamilies.length; i++) {
    lines.push(`  --forge-font-${i}: ${fontFamilies[i]};`);
  }

  // Spacing
  for (const s of tokens.light.spacing) {
    const value = s.value || s;
    const name = s.name || `sp-${value.replace(/[^0-9.]/g, '')}`;
    lines.push(`  --forge-${name}: ${value};`);
  }

  // Shadows
  for (let i = 0; i < tokens.light.shadows.length; i++) {
    lines.push(`  --forge-shadow-${i}: ${tokens.light.shadows[i]};`);
  }

  lines.push('}');

  // Dark mode
  if (tokens.dark.colors.length > 0) {
    lines.push('');
    lines.push('.dark {');
    for (let i = 0; i < tokens.dark.colors.length; i++) {
      const c = tokens.dark.colors[i];
      const name = `color-${i}`;
      const hex = colorToHex(c.value);
      lines.push(`  --forge-${name}: ${hex};`);
    }
    for (let i = 0; i < tokens.dark.backgroundColors.length; i++) {
      const c = tokens.dark.backgroundColors[i];
      const hex = colorToHex(c.value);
      lines.push(`  --forge-bg-${i}: ${hex};`);
    }
    lines.push('}');
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log(`\n> Generating Tailwind config from ${inputPath}`);

  const content = fs.readFileSync(inputPath, 'utf-8');
  const tokens = parseConsolidatedYaml(content);

  if (cssOnly) {
    const css = generateCssTokens(tokens);
    const outputPath = path.join(outputDir, 'tokens.css');
    fs.writeFileSync(outputPath, css);
    console.log(`  Output: ${outputPath}`);
    return;
  }

  if (animationsOnly) {
    // Load animations from extracted-css.json if available
    const animPath = path.join(process.cwd(), 'design-system', 'animations.json');
    if (fs.existsSync(animPath)) {
      const anims = JSON.parse(fs.readFileSync(animPath, 'utf-8'));
      console.log(`  Keyframes: ${(anims.keyframes || []).length}`);
      console.log(`  Transitions: ${(anims.transitions || []).length}`);
      // Would generate extend.animation + extend.keyframes
    }
    console.log('  Animation generation: use data from animations.json');
    return;
  }

  // Generate both
  const tailwindConfig = generateTailwindConfig(tokens);
  const cssTokens = generateCssTokens(tokens);

  const twPath = path.join(outputDir, 'tailwind.config.forge.ts');
  const cssPath = path.join(outputDir, 'tokens.css');

  fs.writeFileSync(twPath, tailwindConfig);
  fs.writeFileSync(cssPath, cssTokens);

  console.log(`\n> Generation complete!`);
  console.log(`  Tailwind config: ${twPath}`);
  console.log(`  CSS tokens: ${cssPath}`);
  console.log(`  Colors: ${tokens.light.colors.length} light, ${tokens.dark.colors.length} dark`);
  console.log(`  Typography: ${tokens.light.typography.length} entries`);
  console.log(`  Spacing: ${tokens.light.spacing.length} values`);
  console.log(`  Shadows: ${tokens.light.shadows.length} values`);
}

main();
