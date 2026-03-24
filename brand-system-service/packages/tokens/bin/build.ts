#!/usr/bin/env ts-node

/**
 * CLI runner for Style Dictionary token builds.
 *
 * Usage:
 *   pnpm build:tokens                    # Build for default client
 *   pnpm build:tokens --client=acme      # Build for specific client
 *
 * Output: brand-system-service/output/{client-slug}/
 *   - tokens.css          (CSS Custom Properties)
 *   - tokens.scss         (SCSS Variables)
 *   - tailwind-tokens.ts  (Tailwind Config TypeScript)
 *   - tokens.json         (JSON Flat Export)
 *
 * @see BSS-2.2: Style Dictionary Build Pipeline
 */

import { buildTokens } from '../sd.config';

const args = process.argv.slice(2);
let clientSlug = 'default';

for (const arg of args) {
  if (arg.startsWith('--client=')) {
    clientSlug = arg.replace('--client=', '');
  }
}

const startTime = Date.now();

console.log(`\nBuilding tokens for client: ${clientSlug}`);
console.log(`Output: output/${clientSlug}/\n`);

buildTokens(clientSlug)
  .then(() => {
    const elapsed = Date.now() - startTime;
    console.log(`\nBuild complete in ${elapsed}ms`);
    console.log(`Files written to output/${clientSlug}/`);
  })
  .catch((error: unknown) => {
    console.error(
      `\nBuild failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    process.exit(1);
  });
