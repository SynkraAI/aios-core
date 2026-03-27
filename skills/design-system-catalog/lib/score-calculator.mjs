#!/usr/bin/env node

/**
 * score-calculator.mjs
 *
 * Calculates completeness score for a design system project.
 * Compares generated components vs detected components.
 *
 * Usage:
 *   node score-calculator.mjs --path ~/CODE/design-systems/circle-br/
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const { values: args } = parseArgs({
  options: {
    path: { type: 'string', short: 'p' },
    json: { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h' },
  },
});

if (args.help || !args.path) {
  console.log('Usage: score-calculator.mjs --path <ds-project-dir> [--json]');
  process.exit(0);
}

const PROJECT_DIR = resolve(args.path);

function countDetectedComponents() {
  const componentsFile = join(PROJECT_DIR, 'design-system', 'components.json');
  if (!existsSync(componentsFile)) return 0;
  try {
    const data = JSON.parse(readFileSync(componentsFile, 'utf-8'));
    return Array.isArray(data) ? data.length : 0;
  } catch {
    return 0;
  }
}

function countGeneratedComponents() {
  const componentsDir = join(PROJECT_DIR, 'src', 'components');
  if (!existsSync(componentsDir)) return 0;

  let count = 0;
  for (const level of ['atoms', 'molecules', 'organisms']) {
    const levelDir = join(componentsDir, level);
    if (!existsSync(levelDir)) continue;
    try {
      const dirs = readdirSync(levelDir, { withFileTypes: true });
      count += dirs.filter((d) => d.isDirectory()).length;
    } catch {
      // skip
    }
  }
  return count;
}

function countStories() {
  const componentsDir = join(PROJECT_DIR, 'src', 'components');
  if (!existsSync(componentsDir)) return 0;

  let count = 0;
  for (const level of ['atoms', 'molecules', 'organisms']) {
    const levelDir = join(componentsDir, level);
    if (!existsSync(levelDir)) continue;
    try {
      const dirs = readdirSync(levelDir, { withFileTypes: true });
      for (const d of dirs.filter((d) => d.isDirectory())) {
        const files = readdirSync(join(levelDir, d.name));
        count += files.filter((f) => f.endsWith('.stories.tsx')).length;
      }
    } catch {
      // skip
    }
  }
  return count;
}

function countDocs() {
  const componentsDir = join(PROJECT_DIR, 'src', 'components');
  if (!existsSync(componentsDir)) return 0;

  let count = 0;
  for (const level of ['atoms', 'molecules', 'organisms']) {
    const levelDir = join(componentsDir, level);
    if (!existsSync(levelDir)) continue;
    try {
      const dirs = readdirSync(levelDir, { withFileTypes: true });
      for (const d of dirs.filter((d) => d.isDirectory())) {
        const files = readdirSync(join(levelDir, d.name));
        count += files.filter((f) => f.endsWith('.mdx')).length;
      }
    } catch {
      // skip
    }
  }
  return count;
}

function detectStatus() {
  const hasDesignSystem = existsSync(join(PROJECT_DIR, 'design-system'));
  const hasPackageJson = existsSync(join(PROJECT_DIR, 'package.json'));
  const hasStorybook = existsSync(join(PROJECT_DIR, '.storybook'));
  const hasComponents = existsSync(join(PROJECT_DIR, 'src', 'components', 'atoms'));

  if (!hasDesignSystem) return 'Unknown';
  if (!hasPackageJson || !hasStorybook) return 'Extracted';
  if (!hasComponents) return 'Scaffolded';

  const detected = countDetectedComponents();
  const generated = countGeneratedComponents();
  if (generated >= detected && detected > 0) return 'Complete';
  return 'In Progress';
}

function getSourceUrl() {
  const manifestFile = join(PROJECT_DIR, 'design-system', 'manifest.json');
  if (!existsSync(manifestFile)) return 'unknown';
  try {
    const data = JSON.parse(readFileSync(manifestFile, 'utf-8'));
    return data.source || 'unknown';
  } catch {
    return 'unknown';
  }
}

function getTokenCounts() {
  const tokensFile = join(PROJECT_DIR, 'design-system', 'tokens.yaml');
  if (!existsSync(tokensFile)) return { colors: 0, typography: 0, spacing: 0 };

  const content = readFileSync(tokensFile, 'utf-8');
  const sections = { colors: 0, typography: 0, spacing: 0 };
  let currentSection = null;

  for (const line of content.split('\n')) {
    const sectionMatch = line.match(/^(colors|typography|spacing):\s*$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      continue;
    }
    if (currentSection && /^  \S/.test(line) && !line.includes(':')) {
      // skip
    } else if (currentSection && /^  ["\w]/.test(line) && line.includes(':')) {
      sections[currentSection]++;
    }
    if (/^\S/.test(line) && !line.startsWith('#') && line !== '') {
      if (!['colors', 'typography', 'spacing', 'metadata'].some(s => line.startsWith(s))) {
        currentSection = null;
      }
    }
  }

  return sections;
}

// Main
const detected = countDetectedComponents();
const generated = countGeneratedComponents();
const stories = countStories();
const docs = countDocs();
const status = detectStatus();
const sourceUrl = getSourceUrl();
const tokens = getTokenCounts();
const score = detected > 0 ? Math.round((generated / detected) * 100) : 0;

const result = {
  name: PROJECT_DIR.split('/').pop(),
  path: PROJECT_DIR,
  sourceUrl,
  status,
  detected,
  generated,
  stories,
  docs,
  score,
  tokens,
};

if (args.json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`\n  Design System: ${result.name}`);
  console.log(`  URL:           ${result.sourceUrl}`);
  console.log(`  Path:          ${result.path}`);
  console.log(`  Status:        ${result.status}`);
  console.log(`  Components:    ${result.generated}/${result.detected}`);
  console.log(`  Stories:       ${result.stories}`);
  console.log(`  Docs (MDX):    ${result.docs}`);
  console.log(`  Tokens:        ${result.tokens.colors} colors, ${result.tokens.typography} typography, ${result.tokens.spacing} spacing`);
  console.log(`  Score:         ${result.score}%\n`);
}
