#!/usr/bin/env node
/**
 * Typography CLI — Google Fonts Integration
 *
 * Generates typography metadata and Google Fonts embed tags.
 *
 * Usage:
 *   pnpm typography:generate --heading="Playfair Display" --body="Inter"
 *
 * @see BSS-2.4: Typography System
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { TypographyEngine } from '../src/typography-engine';

/**
 * Parse command-line arguments.
 */
function parseArgs(): { heading: string; body: string } {
  const args = process.argv.slice(2);
  let heading = '';
  let body = '';

  for (const arg of args) {
    if (arg.startsWith('--heading=')) {
      heading = arg.split('=')[1]?.replace(/['"]/g, '') || '';
    } else if (arg.startsWith('--body=')) {
      body = arg.split('=')[1]?.replace(/['"]/g, '') || '';
    }
  }

  if (!heading || !body) {
    console.error('Error: Both --heading and --body arguments are required.');
    console.error('Usage: pnpm typography:generate --heading="Playfair Display" --body="Inter"');
    process.exit(1);
  }

  return { heading, body };
}

/**
 * Main execution.
 */
async function main(): Promise<void> {
  const { heading, body } = parseArgs();

  const engine = new TypographyEngine(true);

  // Validate fonts
  const headingValid = engine.validateGoogleFont(heading);
  const bodyValid = engine.validateGoogleFont(body);

  if (!headingValid) {
    console.warn(`Warning: "${heading}" not found in Google Fonts catalog. Verify manually.`);
  }

  if (!bodyValid) {
    console.warn(`Warning: "${body}" not found in Google Fonts catalog. Verify manually.`);
  }

  // Generate metadata
  const metadata = engine.generateMetadata(heading, body);

  // Write to tokens/typography-meta.json
  const outputPath = path.resolve(__dirname, '../../../tokens/typography-meta.json');
  fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2), 'utf-8');

  console.log('✅ Typography metadata generated successfully.');
  console.log(`📁 Output: ${outputPath}`);
  console.log('\nEmbed tag:');
  console.log(metadata.embedTag);
  console.log('\nLicenses:');
  for (const font of metadata.fonts) {
    console.log(`  - ${font.family}: ${font.license} (${font.sourceUrl})`);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
