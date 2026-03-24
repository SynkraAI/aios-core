#!/usr/bin/env ts-node

/**
 * CLI runner for W3C DTCG token validation.
 *
 * Usage: pnpm tokens:validate
 *
 * Validates all token files in the tokens/ directory and outputs
 * a human-readable report with PASS/FAIL status per file.
 *
 * Exit codes:
 *   0 — all files pass validation
 *   1 — one or more files have validation errors
 */

import * as path from 'node:path';
import { TokenValidator } from '../src/validator';

const tokensDir = path.resolve(__dirname, '../../../tokens');

const validator = new TokenValidator(tokensDir);

try {
  const result = validator.validate();

  console.log('');
  console.log('=== W3C DTCG Token Validation Report ===');
  console.log(`Prefix: ${validator.getPrefix()}`);
  console.log('');

  for (const fileResult of result.fileResults) {
    const relativePath = path.relative(tokensDir, fileResult.file);
    const status = fileResult.valid ? 'PASS' : 'FAIL';
    const icon = fileResult.valid ? '[OK]' : '[!!]';

    console.log(`${icon} ${status}  ${relativePath} (${fileResult.tokenCount} tokens)`);

    if (!fileResult.valid) {
      for (const error of fileResult.errors) {
        console.log(`       - [${error.code}] ${error.message}`);
      }
    }
  }

  // Show cross-file errors (circular references)
  const crossFileErrors = result.errors.filter((e) => e.file === '');
  if (crossFileErrors.length > 0) {
    console.log('');
    console.log('--- Cross-file Errors ---');
    for (const error of crossFileErrors) {
      console.log(`  [${error.code}] ${error.message}`);
    }
  }

  console.log('');
  console.log(`Total: ${result.totalTokens} tokens across ${result.fileResults.length} files`);
  console.log(`Result: ${result.valid ? 'ALL PASS' : 'VALIDATION FAILED'}`);
  console.log('');

  process.exit(result.valid ? 0 : 1);
} catch (error) {
  console.error(
    `Fatal error during validation: ${error instanceof Error ? error.message : 'Unknown error'}`,
  );
  process.exit(1);
}
