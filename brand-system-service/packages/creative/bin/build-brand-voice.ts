#!/usr/bin/env tsx
/**
 * CLI entry point for brand voice generation.
 *
 * Usage:
 *   pnpm build:brand-voice --client=<slug>
 *
 * Reads brand-voice.config.json from project root,
 * writes output/{client}/brand-voice.json.
 */

import fs from 'node:fs';
import path from 'node:path';

import { loadBrandVoiceConfig, createLogger } from '@bss/core';

import { buildBrandVoice } from '../src/brand-voice-generator';

const logger = createLogger('build-brand-voice', false);

function parseArgs(args: string[]): { client: string } {
  const clientArg = args.find((a) => a.startsWith('--client='));
  if (!clientArg) {
    logger.error('Missing required argument: --client=<slug>');
    console.error('Usage: pnpm build:brand-voice --client=<slug>');
    process.exit(1);
  }
  const client = clientArg.split('=')[1];
  if (!client || client.trim().length === 0) {
    logger.error('--client value cannot be empty');
    process.exit(1);
  }
  return { client: client.trim() };
}

function main(): void {
  const { client } = parseArgs(process.argv.slice(2));
  const projectRoot = path.resolve(__dirname, '..', '..', '..');
  const configPath = path.join(projectRoot, 'brand-voice.config.json');

  // Pre-flight: check config exists
  if (!fs.existsSync(configPath)) {
    logger.error('brand-voice.config.json not found', { path: configPath });
    console.error(`Config file not found: ${configPath}`);
    console.error('Create brand-voice.config.json at the project root.');
    process.exit(1);
  }

  logger.info('Loading brand voice config', { configPath });
  const config = loadBrandVoiceConfig(configPath);

  // Build brand voice
  const brandVoice = buildBrandVoice(config, client);

  // Write output
  const outputDir = path.join(projectRoot, 'output');
  const outPath = path.join(outputDir, client, 'brand-voice.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(brandVoice, null, 2), 'utf-8');

  // Summary
  console.log(`Brand voice generated: ${outPath}`);
  console.log(`  Personality: ${brandVoice.personality.length} adjectives`);
  console.log(`  Pillars: ${brandVoice.pillars.length}`);
  console.log(`  Tone channels: ${brandVoice.toneSpectrum.length}`);
  console.log(`  Do entries: ${brandVoice.doList.length}`);
  console.log(`  Don't entries: ${brandVoice.dontList.length}`);
  console.log(`  Taglines: ${brandVoice.taglines.length}`);
  console.log(`  Approved words: ${brandVoice.vocabularyBank.approved.length}`);
  console.log(`  Forbidden words: ${brandVoice.vocabularyBank.forbidden.length}`);
}

main();
