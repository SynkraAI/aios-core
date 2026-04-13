#!/usr/bin/env node

// Cleanup old feedback files (>30 days) across all projects.
// Usage: node tools/cleanup-old-feedback.js [--dry-run]

const fs = require('fs');
const path = require('path');
const os = require('os');

const AIOS_CORE = path.join(os.homedir(), 'aios-core');
const MAX_AGE_DAYS = 30;
const dryRun = process.argv.includes('--dry-run');

function findFeedbackDirs() {
  const dirs = [];

  // CENTRALIZED projects
  const projDir = path.join(AIOS_CORE, 'docs', 'projects');
  if (fs.existsSync(projDir)) {
    for (const name of fs.readdirSync(projDir)) {
      const fb = path.join(projDir, name, 'memory', 'feedback');
      if (fs.existsSync(fb) && fs.statSync(fb).isDirectory()) {
        dirs.push(fb);
      }
    }
  }

  // HYBRID projects
  const codeProjDir = path.join(os.homedir(), 'CODE', 'Projects');
  if (fs.existsSync(codeProjDir)) {
    for (const name of fs.readdirSync(codeProjDir)) {
      const fb = path.join(codeProjDir, name, '.aios', 'memory', 'feedback');
      if (fs.existsSync(fb) && fs.statSync(fb).isDirectory()) {
        dirs.push(fb);
      }
    }
  }

  return dirs;
}

function main() {
  console.log(`Cleanup feedback >${MAX_AGE_DAYS} days${dryRun ? ' (DRY RUN)' : ''}\n`);

  const cutoff = Date.now() - (MAX_AGE_DAYS * 24 * 60 * 60 * 1000);
  const dirs = findFeedbackDirs();
  let total = 0;
  let removed = 0;

  for (const dir of dirs) {
    try {
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
      for (const file of files) {
        const fp = path.join(dir, file);
        const stat = fs.statSync(fp);
        total++;

        if (stat.mtimeMs < cutoff) {
          const short = fp.replace(os.homedir(), '~');
          if (dryRun) {
            console.log(`  WOULD REMOVE: ${short}`);
          } else {
            fs.unlinkSync(fp);
            console.log(`  REMOVED: ${short}`);
          }
          removed++;
        }
      }
    } catch {
      // ignore
    }
  }

  console.log(`\n${removed}/${total} feedback files ${dryRun ? 'would be' : ''} removed.`);
}

main();
