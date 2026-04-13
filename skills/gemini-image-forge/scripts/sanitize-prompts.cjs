#!/usr/bin/env node
/**
 * gemini-image-forge — Prompt sanitizer
 *
 * Removes/replaces content that triggers Gemini's safety filter:
 *   - Real people names (living public figures) → generic silhouettes
 *   - Trademarked names → generic equivalents
 *
 * Usage:
 *   node sanitize-prompts.cjs --input prompts.json [--output prompts.sanitized.json] [--dry]
 *
 * If --output is omitted, creates `<input>.sanitized.json` next to input.
 * --dry prints what would change without writing.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

// ──────────────────────────────────────────────────
// Sanitization rules
// ──────────────────────────────────────────────────
// Each rule: { pattern: RegExp, replacement: string, reason: string }
// Patterns are case-insensitive word boundaries.

const RULES = [
  // Tech founders (most-blocked category)
  { pattern: /\bSteve Jobs\b/gi, replacement: 'a tech visionary silhouette (black turtleneck)', reason: 'real_person_tech' },
  { pattern: /\bBill Gates\b/gi, replacement: 'a tech founder silhouette (glasses)', reason: 'real_person_tech' },
  { pattern: /\bElon Musk\b/gi, replacement: 'an entrepreneur silhouette (rocket icon)', reason: 'real_person_tech' },
  { pattern: /\bMark Zuckerberg\b/gi, replacement: 'a social-media founder silhouette', reason: 'real_person_tech' },
  { pattern: /\bJeff Bezos\b/gi, replacement: 'an e-commerce founder silhouette', reason: 'real_person_tech' },
  { pattern: /\bSam Altman\b/gi, replacement: 'an AI founder silhouette', reason: 'real_person_tech' },
  { pattern: /\bTim Cook\b/gi, replacement: 'a tech CEO silhouette', reason: 'real_person_tech' },
  { pattern: /\bSatya Nadella\b/gi, replacement: 'a software CEO silhouette', reason: 'real_person_tech' },

  // Disney / entertainment founders
  { pattern: /\bWalt Disney\b/gi, replacement: 'an animation studio founder silhouette (vintage hat)', reason: 'real_person_entertainment' },

  // Historical figures OK (public domain) — keep as-is
  // Einstein, Pascal, Newton are fine

  // Business gurus (commonly blocked)
  { pattern: /\bAlex Hormozi\b/gi, replacement: 'a business strategist figure', reason: 'real_person_business' },
  { pattern: /\bCharlie Munger\b/gi, replacement: 'a value investor figure', reason: 'real_person_business' },
  { pattern: /\bWarren Buffett\b/gi, replacement: 'a veteran investor figure', reason: 'real_person_business' },
  { pattern: /\bLeandro Ladeira\b/gi, replacement: 'a sales expert figure', reason: 'real_person_business' },
  { pattern: /\bPaulo Vieira\b/gi, replacement: 'a coach figure', reason: 'real_person_business' },
  { pattern: /\bRobert Cialdini\b/gi, replacement: 'an influence expert figure', reason: 'real_person_business' },
  { pattern: /\bSeth Godin\b/gi, replacement: 'a marketing thinker figure', reason: 'real_person_business' },

  // Brand icons (avoid trademark issues)
  { pattern: /\bApple icon\b/gi, replacement: 'a minimalist fruit icon', reason: 'trademark' },
  { pattern: /\bMicrosoft icon\b/gi, replacement: 'a four-pane window icon', reason: 'trademark' },

  // Safety categories — usually fine but can flag
  // We do NOT touch: editorial, illustration, silhouette, figure, cinematic
];

// ──────────────────────────────────────────────────
// CLI
// ──────────────────────────────────────────────────

const args = parseArgs(process.argv.slice(2));

if (args.help || !args.input) {
  console.log(`
Usage:
  node sanitize-prompts.cjs --input <prompts.json> [--output <path>] [--dry]

Options:
  --input <path>    Path to prompts.json (required)
  --output <path>   Output path (default: <input>.sanitized.json)
  --dry             Print changes without writing
  --verbose         Show every substitution
`);
  process.exit(args.help ? 0 : 1);
}

const INPUT = path.resolve(args.input);
const OUTPUT = args.output
  ? path.resolve(args.output)
  : INPUT.replace(/\.json$/, '.sanitized.json');
const DRY = !!args.dry;
const VERBOSE = !!args.verbose;

if (!fs.existsSync(INPUT)) {
  console.error(`[err] Input not found: ${INPUT}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(INPUT, 'utf8'));

if (!data.items || !Array.isArray(data.items)) {
  console.error('[err] Invalid prompts.json — missing "items" array');
  process.exit(1);
}

// ──────────────────────────────────────────────────
// Apply rules
// ──────────────────────────────────────────────────

let totalReplacements = 0;
const changesByItem = {};

data.items.forEach((item) => {
  if (!item.prompt) return;

  let prompt = item.prompt;
  const itemChanges = [];

  RULES.forEach((rule) => {
    const matches = prompt.match(rule.pattern);
    if (matches) {
      itemChanges.push({
        reason: rule.reason,
        found: matches[0],
        replaced_with: rule.replacement,
        count: matches.length,
      });
      prompt = prompt.replace(rule.pattern, rule.replacement);
      totalReplacements += matches.length;
    }
  });

  if (itemChanges.length > 0) {
    changesByItem[item.id] = itemChanges;
    item.prompt = prompt;
    item._sanitized = true;
    item._sanitization_log = itemChanges;
  }
});

// Add sanitization metadata
data.meta = data.meta || {};
data.meta.sanitized_at = new Date().toISOString();
data.meta.total_replacements = totalReplacements;

// ──────────────────────────────────────────────────
// Report + write
// ──────────────────────────────────────────────────

console.log('');
console.log('\x1b[33m╔══════════════════════════════════════╗\x1b[0m');
console.log('\x1b[33m║\x1b[0m  \x1b[36mPROMPT SANITIZER\x1b[0m                    \x1b[33m║\x1b[0m');
console.log('\x1b[33m╚══════════════════════════════════════╝\x1b[0m');
console.log('');
console.log(`Input:  ${INPUT}`);
console.log(`Output: ${OUTPUT}${DRY ? ' (DRY — not written)' : ''}`);
console.log('');
console.log(`Total items:        ${data.items.length}`);
console.log(`Items modified:     ${Object.keys(changesByItem).length}`);
console.log(`Total replacements: ${totalReplacements}`);
console.log('');

if (VERBOSE || Object.keys(changesByItem).length < 10) {
  console.log('Changes by item:');
  Object.entries(changesByItem).forEach(([id, changes]) => {
    console.log(`  ${id}:`);
    changes.forEach((c) => {
      console.log(`    \x1b[31m- ${c.found}\x1b[0m → \x1b[32m${c.replaced_with}\x1b[0m (${c.reason})`);
    });
  });
} else {
  console.log('(Use --verbose to see all changes)');
  const byReason = {};
  Object.values(changesByItem).forEach((changes) => {
    changes.forEach((c) => {
      byReason[c.reason] = (byReason[c.reason] || 0) + c.count;
    });
  });
  console.log('Changes by reason:');
  Object.entries(byReason).forEach(([reason, count]) => {
    console.log(`  ${reason}: ${count}`);
  });
}

console.log('');

if (!DRY) {
  fs.writeFileSync(OUTPUT, JSON.stringify(data, null, 2));
  console.log(`\x1b[32m[ok]\x1b[0m Written to ${OUTPUT}`);
} else {
  console.log('\x1b[33m[dry]\x1b[0m No file written. Remove --dry to save.');
}

// ──────────────────────────────────────────────────

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        out[key] = true;
      } else {
        out[key] = next;
        i++;
      }
    }
  }
  return out;
}
