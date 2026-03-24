#!/usr/bin/env node

/**
 * CLI entry point for the Static Site Build Pipeline.
 *
 * Usage:
 *   node dist/cli.js --clientId <id> --type <buildType> --out <dir>
 *   node dist/cli.js --clientId <id> --type <buildType> --out <dir> --export <zipPath>
 *
 * Options:
 *   --clientId  Client identifier for token resolution (required)
 *   --type      Build type: landing-page | site | brand-book | bio-link | thank-you | microcopy-guide (required)
 *   --out       Output directory (required)
 *   --export    Export to ZIP after build (optional, path to output ZIP)
 *   --debug     Enable debug logging (optional)
 */

import { StaticGenerator, type BuildType } from './static-generator';
import { StaticPackageExporter } from './exporter';

const VALID_TYPES: BuildType[] = [
  'landing-page', 'site', 'brand-book',
  'bio-link', 'thank-you', 'microcopy-guide',
];

function parseArgs(argv: string[]): {
  clientId: string;
  type: BuildType;
  out: string;
  exportPath?: string;
  debug: boolean;
} {
  const args: Record<string, string> = {};
  let debug = false;

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--debug') {
      debug = true;
      continue;
    }
    if (arg.startsWith('--') && i + 1 < argv.length) {
      const key = arg.slice(2);
      args[key] = argv[++i];
    }
  }

  if (!args['clientId']) {
    throw new Error('Missing required argument: --clientId');
  }
  if (!args['type']) {
    throw new Error('Missing required argument: --type');
  }
  if (!VALID_TYPES.includes(args['type'] as BuildType)) {
    throw new Error(
      `Invalid --type "${args['type']}". Must be one of: ${VALID_TYPES.join(', ')}`
    );
  }
  if (!args['out']) {
    throw new Error('Missing required argument: --out');
  }

  return {
    clientId: args['clientId'],
    type: args['type'] as BuildType,
    out: args['out'],
    exportPath: args['export'],
    debug,
  };
}

async function main(): Promise<void> {
  const parsed = parseArgs(process.argv);

  const generator = new StaticGenerator(parsed.debug);
  const outputDir = await generator.generate({
    clientId: parsed.clientId,
    type: parsed.type,
    outputDir: parsed.out,
    debug: parsed.debug,
  });

  // eslint-disable-next-line no-console
  console.log(`Build complete: ${outputDir}`);

  // Export to ZIP if --export flag provided (BSS-5.8)
  if (parsed.exportPath) {
    const exporter = new StaticPackageExporter();
    const result = await exporter.export({
      clientId: parsed.clientId,
      buildType: parsed.type,
      sourceDir: parsed.out,
      outputPath: parsed.exportPath,
    });

    // eslint-disable-next-line no-console
    console.log(`Export complete: ${result.zipPath} (${result.fileCount} files, ${result.sizeKB} KB)`);
  }
}

main().catch((error: unknown) => {
  console.error(
    `Build failed: ${error instanceof Error ? error.message : String(error)}`
  );
  process.exit(1);
});
