#!/usr/bin/env node
'use strict';

/**
 * CLI: validate OSS port denylist (CORE-SU.A4)
 *
 * Usage:
 *   node scripts/validate-port-denylist.js
 *   node scripts/validate-port-denylist.js --json
 *   node scripts/validate-port-denylist.js --files path1 path2
 */

const { scanProject } = require('../.aiox-core/core/security/port-denylist');

function main(argv = process.argv.slice(2)) {
  const json = argv.includes('--json');
  const filesIdx = argv.indexOf('--files');
  let files;
  if (filesIdx !== -1) {
    files = argv.slice(filesIdx + 1).filter((a) => !a.startsWith('--'));
    if (files.length === 0) {
      console.error('Error: --files provided with no file paths');
      process.exit(2);
    }
  }

  const projectRoot = process.cwd();
  const result = scanProject({ projectRoot, files });

  if (json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    console.log('AIOX OSS Port Denylist Validation');
    console.log(`Files scanned: ${result.filesScanned}`);
    if (result.ok) {
      console.log('✅ No denylist hits');
    } else {
      console.log(`❌ ${result.findings.length} hit(s):\n`);
      for (const f of result.findings.slice(0, 50)) {
        console.log(`  [${f.id}] ${f.file}:${f.line}`);
        console.log(`    ${f.description}`);
        console.log(`    > ${f.excerpt}`);
      }
      if (result.findings.length > 50) {
        console.log(`  … +${result.findings.length - 50} more`);
      }
      console.log('\nSee: docs/framework/epics/core-super-update/ARCHITECTURE-WAVE-A.md §3.4');
    }
  }

  process.exit(result.ok ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = { main };
