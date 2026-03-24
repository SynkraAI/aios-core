#!/usr/bin/env node

/**
 * CLI entry point for Brand Book static site generation, PDF export, and packaging.
 *
 * Usage:
 *   tsx packages/static-generator/bin/build-brand-book.ts --client=<slug>
 *   tsx packages/static-generator/bin/build-brand-book.ts --client=<slug> --pdf
 *   tsx packages/static-generator/bin/build-brand-book.ts --client=<slug> --package
 *   pnpm build:brand-book --client=<slug>
 *   pnpm build:brand-book-pdf --client=<slug>
 *   pnpm build:brand-book-package --client=<slug>
 */

import path from 'node:path';
import { createLogger } from '@bss/core';
import { StaticGenerator, loadBrandConfig } from '../src/static-generator';
import { PdfGenerator } from '../src/pdf-generator';
import { buildPackage } from '../src/package-builder';

const logger = createLogger('build-brand-book', false);

function parseArgs(): { client: string; debug: boolean; pdf: boolean; package: boolean } {
  const args = process.argv.slice(2);
  let client = 'default';
  let debug = false;
  let pdf = false;
  let pkg = false;

  for (const arg of args) {
    if (arg.startsWith('--client=')) {
      client = arg.replace('--client=', '');
    } else if (arg === '--debug') {
      debug = true;
    } else if (arg === '--pdf') {
      pdf = true;
    } else if (arg === '--package') {
      pkg = true;
    }
  }

  return { client, debug, pdf, package: pkg };
}

async function buildStaticSite(
  client: string,
  projectRoot: string,
  debug: boolean
): Promise<string> {
  const brandConfig = loadBrandConfig(path.join(projectRoot, 'brand.config.json'));
  const generator = new StaticGenerator(debug);

  return generator.generateBrandBook({
    clientSlug: client,
    outputDir: path.join(projectRoot, 'output'),
    tokenDir: path.join(projectRoot, 'tokens'),
    brandConfig,
    debug,
  });
}

async function buildPdf(
  client: string,
  projectRoot: string,
  debug: boolean
): Promise<void> {
  const startTime = Date.now();
  const brandConfig = loadBrandConfig(path.join(projectRoot, 'brand.config.json'));
  const outputDir = path.join(projectRoot, 'output');

  // eslint-disable-next-line no-console
  console.log(`\nGenerating PDF for client "${client}"...`);
  // eslint-disable-next-line no-console
  console.log('This may take up to 60 seconds.\n');

  const pdfGenerator = new PdfGenerator(debug);
  const result = await pdfGenerator.generate({
    clientSlug: client,
    outputDir,
    brandConfig,
    debug,
  });

  const elapsed = Date.now() - startTime;
  const sizeMB = (result.fileSizeBytes / (1024 * 1024)).toFixed(2);

  logger.info('PDF generated successfully', {
    pdfPath: result.pdfPath,
    fileSizeMB: sizeMB,
    elapsed,
  });

  // eslint-disable-next-line no-console
  console.log(`PDF generated at: ${result.pdfPath}`);
  // eslint-disable-next-line no-console
  console.log(`File size: ${sizeMB} MB`);
  // eslint-disable-next-line no-console
  console.log(`Build time: ${elapsed}ms`);
}

async function buildLocalPackage(
  client: string,
  projectRoot: string,
  debug: boolean
): Promise<void> {
  const startTime = Date.now();
  const brandConfig = loadBrandConfig(path.join(projectRoot, 'brand.config.json'));
  const outputDir = path.join(projectRoot, 'output');

  // eslint-disable-next-line no-console
  console.log(`\nBuilding local package for client "${client}"...`);
  // eslint-disable-next-line no-console
  console.log('Pipeline: fonts -> replace links -> validate paths -> ZIP\n');

  const result = await buildPackage({
    clientSlug: client,
    outputDir,
    brandConfig,
    debug,
  });

  const elapsed = Date.now() - startTime;
  const sizeMB = (result.fileSizeBytes / (1024 * 1024)).toFixed(2);

  logger.info('Local package built successfully', {
    zipPath: result.zipPath,
    fileSizeMB: sizeMB,
    fileCount: result.fileCount,
    elapsed,
  });

  // eslint-disable-next-line no-console
  console.log(`ZIP created at: ${result.zipPath}`);
  // eslint-disable-next-line no-console
  console.log(`File size: ${sizeMB} MB (${result.fileCount} files)`);
  // eslint-disable-next-line no-console
  console.log(`Build time: ${elapsed}ms`);
}

async function main(): Promise<void> {
  const startTime = Date.now();
  const args = parseArgs();
  const { client, debug, pdf } = args;
  const pkg = args.package;
  const projectRoot = path.resolve(__dirname, '..', '..', '..');

  logger.info('Brand Book build starting', { client, projectRoot, pdf, package: pkg });

  try {
    if (pkg) {
      // Package mode: build ZIP with fonts, validation, and PDF
      await buildLocalPackage(client, projectRoot, debug);
    } else if (pdf) {
      // PDF mode: verify static site exists, then generate PDF
      await buildPdf(client, projectRoot, debug);
    } else {
      // Static site mode (original behavior)
      const outputDir = await buildStaticSite(client, projectRoot, debug);

      const elapsed = Date.now() - startTime;
      logger.info(`Brand Book generated successfully in ${elapsed}ms`, {
        outputDir,
        client,
        elapsed,
      });

      // eslint-disable-next-line no-console
      console.log(`\nBrand Book generated at: ${outputDir}`);
      // eslint-disable-next-line no-console
      console.log(`Build time: ${elapsed}ms`);
      // eslint-disable-next-line no-console
      console.log(`Open: ${path.join(outputDir, 'index.html')}`);
    }
  } catch (error) {
    logger.error('Brand Book build failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    // eslint-disable-next-line no-console
    console.error(`\nBuild failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

main();
