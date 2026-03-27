#!/usr/bin/env node
/**
 * Design System Forge — Dissect Wrapper
 *
 * Thin wrapper around squads/design/scripts/dissect-artifact.cjs
 * Redirects output to {cwd}/design-system/ and post-processes results.
 *
 * Usage:
 *   node dissect.mjs <url> --name <name> [--mobile] [--split-animations] [--screenshots-only] [--viewports WxH,WxH]
 */

import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

// ---------------------------------------------------------------------------
// Resolve paths
// ---------------------------------------------------------------------------

const AIOS_CORE = process.env.AIOS_CORE || path.resolve(os.homedir(), 'aios-core');
const DISSECT_SCRIPT = path.join(AIOS_CORE, 'squads', 'design', 'scripts', 'dissect-artifact.cjs');

if (!fs.existsSync(DISSECT_SCRIPT)) {
  console.error(`Error: dissect-artifact.cjs not found at ${DISSECT_SCRIPT}`);
  console.error('Ensure aios-core is at ~/aios-core or set AIOS_CORE env var.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Parse args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
let target = null;
let name = null;
let mobile = false;
let splitAnimations = false;
let screenshotsOnly = false;
let viewports = [];
let timeout = 60;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--name' || arg === '-n') {
    name = args[++i];
  } else if (arg === '--mobile') {
    mobile = true;
  } else if (arg === '--split-animations') {
    splitAnimations = true;
  } else if (arg === '--screenshots-only') {
    screenshotsOnly = true;
  } else if (arg === '--viewports') {
    viewports = (args[++i] || '').split(',');
  } else if (arg === '--timeout' || arg === '-t') {
    timeout = parseInt(args[++i]) || 60;
  } else if (arg === '--help' || arg === '-h') {
    console.log(`
Design System Forge — Dissect Wrapper

Usage:
  node dissect.mjs <url> --name <name> [options]

Options:
  --name, -n           Artifact name (required)
  --mobile             Also capture mobile viewport (375x812)
  --split-animations   Post-process: split animations.json + effects.json from extracted-css.json
  --screenshots-only   Only capture screenshots, skip CSS extraction
  --viewports WxH,...  Multiple viewports (e.g., 390x844,768x1024,1440x900)
  --help, -h           Show this help
`);
    process.exit(0);
  } else if (!arg.startsWith('-') && !target) {
    target = arg;
  }
}

if (!target) {
  console.error('Error: URL or path is required.');
  console.error('Usage: node dissect.mjs <url> --name <name> [--mobile]');
  process.exit(1);
}

if (!name) {
  // Auto-generate name from URL
  try {
    const url = new URL(target);
    name = url.hostname.replace(/\./g, '-');
  } catch {
    name = path.basename(target, path.extname(target));
  }
}

// ---------------------------------------------------------------------------
// Output directory — always inside {cwd}/design-system/
// ---------------------------------------------------------------------------

const outputDir = path.join(process.cwd(), 'design-system');
fs.mkdirSync(outputDir, { recursive: true });

// ---------------------------------------------------------------------------
// Run dissect-artifact.cjs
// ---------------------------------------------------------------------------

function runDissect(vpFlag) {
  const dissectArgs = [DISSECT_SCRIPT, target, '--name', name, '--output', outputDir, '--timeout', String(timeout)];

  if (vpFlag) {
    dissectArgs.push('--viewport', vpFlag);
  }

  if (mobile) {
    dissectArgs.push('--mobile');
  }

  console.log(`\n> Dissecting ${target} → ${outputDir}`);
  if (vpFlag) console.log(`  Viewport: ${vpFlag}`);

  try {
    execFileSync('node', dissectArgs, {
      stdio: 'inherit',
      timeout: (timeout + 30) * 1000,
    });
  } catch (err) {
    console.error(`Error running dissect-artifact.cjs: ${err.message}`);
    process.exit(1);
  }
}

// Run for each viewport or default
if (viewports.length > 0) {
  for (const vp of viewports) {
    runDissect(vp.trim());
  }
} else {
  runDissect(null);
}

// ---------------------------------------------------------------------------
// Post-process: split animations
// ---------------------------------------------------------------------------

if (splitAnimations) {
  const extractedPath = path.join(outputDir, 'extracted-css.json');
  if (!fs.existsSync(extractedPath)) {
    console.warn('Warning: extracted-css.json not found, skipping animation split.');
  } else {
    console.log('\n> Splitting animations and effects...');
    try {
      const data = JSON.parse(fs.readFileSync(extractedPath, 'utf-8'));

      const animations = {
        keyframes: data.animations || [],
        transitions: data.transitions || [],
      };

      const effects = {
        gradients: data.gradients || [],
        shadows: data.shadows || [],
        filters: data.filters || [],
        backdropFilters: data.backdropFilters || [],
        clipPaths: data.clipPaths || [],
        transforms: data.transforms || [],
      };

      fs.writeFileSync(
        path.join(outputDir, 'animations.json'),
        JSON.stringify(animations, null, 2)
      );

      fs.writeFileSync(
        path.join(outputDir, 'effects.json'),
        JSON.stringify(effects, null, 2)
      );

      console.log('  Created: animations.json, effects.json');
    } catch (err) {
      console.error(`Error splitting animations: ${err.message}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log('\n> Dissection complete!');
console.log(`  Output: ${outputDir}`);

const files = fs.readdirSync(outputDir).filter(f => !f.startsWith('.'));
console.log(`  Files: ${files.join(', ')}`);
