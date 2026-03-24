#!/usr/bin/env node
/**
 * CLI Color Palette Generator
 *
 * Generates full color palettes from seed colors with WCAG validation.
 *
 * Usage:
 *   pnpm palette:generate --primary=#0057FF --secondary=#7C3AED
 */

import fs from 'fs/promises';
import path from 'path';
import {
  generateScale,
  generateNeutral,
  generateSemantic,
  generateDarkVariants,
  computeWCAG,
  validateWCAG,
  type DTCGTokenGroup,
} from '../src/color-engine';
import type { TokenGroup } from '../src/types';

/**
 * Parse command-line arguments.
 */
function parseArgs(): { primary?: string; secondary?: string } {
  const args = process.argv.slice(2);
  const result: { primary?: string; secondary?: string } = {};

  args.forEach((arg) => {
    const match = arg.match(/^--(\w+)=(.+)$/);
    if (match) {
      const [, key, value] = match;
      if (key === 'primary' || key === 'secondary') {
        result[key] = value;
      }
    }
  });

  return result;
}

/**
 * Ensure output directories exist.
 */
async function ensureDirectories(): Promise<void> {
  // Go up two levels from packages/tokens to brand-system-service root
  const rootDir = path.resolve(process.cwd(), '../..');
  const tokensDir = path.join(rootDir, 'tokens');
  const primitiveDir = path.join(tokensDir, 'primitive');
  const semanticDir = path.join(tokensDir, 'semantic');

  await fs.mkdir(primitiveDir, { recursive: true });
  await fs.mkdir(semanticDir, { recursive: true });
}

/**
 * Write token file with pretty formatting.
 */
async function writeTokenFile(filePath: string, tokens: TokenGroup): Promise<void> {
  const json = JSON.stringify(tokens, null, 2);
  await fs.writeFile(filePath, json + '\n', 'utf-8');
}

/**
 * Generate palette preview HTML.
 */
function generatePreviewHTML(
  primary: DTCGTokenGroup,
  secondary: DTCGTokenGroup | null,
  neutral: DTCGTokenGroup,
  semantic: Record<string, DTCGTokenGroup>
): string {
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Color Palette Preview</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 2rem;
      background: #f9fafb;
    }
    h1 {
      font-size: 2rem;
      margin-bottom: 2rem;
      color: #111827;
    }
    h2 {
      font-size: 1.5rem;
      margin: 2rem 0 1rem;
      color: #374151;
    }
    .palette-group {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 1rem;
      margin-bottom: 3rem;
    }
    .swatch {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .swatch-color {
      height: 80px;
      width: 100%;
    }
    .swatch-info {
      background: white;
      padding: 0.75rem;
      font-size: 0.875rem;
    }
    .swatch-name {
      font-weight: 600;
      margin-bottom: 0.25rem;
      color: #111827;
    }
    .swatch-hex {
      color: #6b7280;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 0.75rem;
      margin-bottom: 0.5rem;
    }
    .wcag-badges {
      display: flex;
      gap: 0.25rem;
      flex-wrap: wrap;
    }
    .badge {
      padding: 0.125rem 0.375rem;
      border-radius: 4px;
      font-size: 0.625rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-pass {
      background: #d1fae5;
      color: #065f46;
    }
    .badge-fail {
      background: #fee2e2;
      color: #991b1b;
    }
  </style>
</head>
<body>
  <h1>Color Palette Preview</h1>
`;

  const addPaletteSection = (title: string, colors: DTCGTokenGroup, prefix: string): void => {
    html += `  <h2>${title}</h2>\n  <div class="palette-group">\n`;

    Object.entries(colors).forEach(([step, token]) => {
      if ('$value' in token && typeof token.$value === 'string') {
        const hex = token.$value;
        const wcag = computeWCAG(hex);

        html += `    <div class="swatch">
      <div class="swatch-color" style="background-color: ${hex};"></div>
      <div class="swatch-info">
        <div class="swatch-name">${prefix}-${step}</div>
        <div class="swatch-hex">${hex}</div>
        <div class="wcag-badges">
          <span class="badge ${wcag.aa ? 'badge-pass' : 'badge-fail'}">AA ${wcag.aa ? '✓' : '✗'}</span>
          <span class="badge ${wcag.aaa ? 'badge-pass' : 'badge-fail'}">AAA ${wcag.aaa ? '✓' : '✗'}</span>
        </div>
      </div>
    </div>
`;
      }
    });

    html += `  </div>\n`;
  };

  addPaletteSection('Primary', primary, 'primary');
  if (secondary) {
    addPaletteSection('Secondary', secondary, 'secondary');
  }
  addPaletteSection('Neutral', neutral, 'neutral');

  Object.entries(semantic).forEach(([name, colors]) => {
    addPaletteSection(name.charAt(0).toUpperCase() + name.slice(1), colors, name);
  });

  html += `</body>\n</html>\n`;

  return html;
}

/**
 * Main execution.
 */
async function main(): Promise<void> {
  try {
    const args = parseArgs();

    if (!args.primary) {
      console.error('Error: --primary argument is required');
      console.log('\nUsage:');
      console.log('  pnpm palette:generate --primary=#0057FF --secondary=#7C3AED');
      process.exit(1);
    }

    console.log('🎨 Generating color palette...\n');

    // Generate scales
    console.log('📊 Generating color scales...');
    const primaryScale = generateScale(args.primary, 'primary');
    const secondaryScale = args.secondary ? generateScale(args.secondary, 'secondary') : null;
    const neutralScale = generateNeutral(args.primary);

    // Generate semantic colors
    console.log('✨ Generating semantic colors...');
    const semanticColors = generateSemantic();

    // Generate dark mode variants
    console.log('🌙 Generating dark mode variants...');
    const semanticTokens: TokenGroup = {
      background: {
        default: { $value: '#FFFFFF', $type: 'color', $description: 'Default background' },
        subtle: { $value: '#F9FAFB', $type: 'color', $description: 'Subtle background' },
      },
      text: {
        default: { $value: '#111827', $type: 'color', $description: 'Primary text' },
        secondary: { $value: '#6B7280', $type: 'color', $description: 'Secondary text' },
      },
      ...Object.fromEntries(
        Object.entries(semanticColors).map(([name, colors]) => [name, colors])
      ),
    };

    const darkVariants = generateDarkVariants(semanticTokens);

    // Ensure directories exist
    await ensureDirectories();

    // Write primitive colors
    console.log('💾 Writing token files...');
    const rootDir = path.resolve(process.cwd(), '../..');
    const primitiveColors: TokenGroup = {
      color: {
        primary: primaryScale,
        neutral: neutralScale,
        ...(secondaryScale ? { secondary: secondaryScale } : {}),
      },
    };

    await writeTokenFile(
      path.join(rootDir, 'tokens/primitive/colors.json'),
      primitiveColors
    );

    // Write semantic colors
    await writeTokenFile(path.join(rootDir, 'tokens/semantic/colors.json'), semanticTokens);

    // Write dark mode variants
    await writeTokenFile(path.join(rootDir, 'tokens/semantic/colors-dark.json'), darkVariants);

    // WCAG validation
    console.log('\n🔍 WCAG Contrast Validation:\n');

    const reportWCAG = (name: string, hex: string): void => {
      const wcag = computeWCAG(hex);
      const status =
        wcag.aaa ? '✓ AAA' : wcag.aa ? '✓ AA' : wcag.aaLarge ? '✓ AA Large' : '✗ FAIL';
      console.log(`  ${name.padEnd(30)} ${hex.padEnd(10)} ${wcag.onWhite.toFixed(2)}:1  ${status}`);
    };

    console.log('  Color'.padEnd(30) + ' Hex'.padEnd(10) + ' Ratio   Status');
    console.log('  ' + '-'.repeat(60));

    Object.entries(semanticColors).forEach(([name, colors]) => {
      Object.entries(colors).forEach(([tone, token]) => {
        if ('$value' in token && typeof token.$value === 'string') {
          reportWCAG(`${name}-${tone}`, token.$value);
        }
      });
    });

    // Validate semantic tokens (will throw if any fail AA)
    console.log('\n✅ WCAG AA validation...');
    try {
      validateWCAG(semanticTokens);
      console.log('✓ All semantic colors pass WCAG AA');
    } catch (error) {
      if (error instanceof Error) {
        console.error(`\n❌ WCAG validation failed:\n${error.message}`);
        process.exit(1);
      }
    }

    // Generate preview HTML
    console.log('\n🖼️  Generating palette preview...');
    const outputDir = path.join(rootDir, 'output');
    await fs.mkdir(outputDir, { recursive: true });

    const previewHTML = generatePreviewHTML(
      primaryScale,
      secondaryScale,
      neutralScale,
      semanticColors
    );

    const previewPath = path.join(outputDir, 'palette-preview.html');
    await fs.writeFile(previewPath, previewHTML, 'utf-8');

    console.log(`✓ Preview saved to: ${previewPath}`);
    console.log('\n✨ Palette generation complete!\n');
  } catch (error) {
    if (error instanceof Error) {
      console.error(`\n❌ Error: ${error.message}\n`);
      process.exit(1);
    }
  }
}

main();
