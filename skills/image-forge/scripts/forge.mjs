#!/usr/bin/env node
// image-forge — CLI runner
// Usage:
//   node forge.mjs <input.yaml>                    # generate everything
//   node forge.mjs <input.yaml> --dry-run          # show routing + cost, no API calls
//   node forge.mjs <input.yaml> --draft            # force flux-schnell (cheap)
//   node forge.mjs <input.yaml> --only=d1,d2       # only these item ids
//   node forge.mjs <input.yaml> --yes              # skip confirmation gate
//   node forge.mjs <input.yaml> --output-dir=/path # override output_dir from YAML

'use strict';

import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname, join, isAbsolute } from 'node:path';
import { parseArgs } from 'node:util';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import { routeItem, summarizeBatch, PRICE_TABLE } from './router.mjs';
import { runPrediction, downloadBinary, withRetry } from './replicate-client.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// ---------- constants ----------
const BRL_RATE = 5.2; // USD → BRL multiplier, april 2026
const BETWEEN_ITEMS_MS = 2000; // polite delay between sequential predictions
const RETRY_COUNT = 3;

// ---------- helpers ----------
function color(code, text) {
  return `\x1b[${code}m${text}\x1b[0m`;
}
const c = {
  dim: (t) => color('2', t),
  bold: (t) => color('1', t),
  green: (t) => color('32', t),
  yellow: (t) => color('33', t),
  red: (t) => color('31', t),
  cyan: (t) => color('36', t),
  amber: (t) => color('38;5;214', t),
};

function die(msg, code = 1) {
  process.stderr.write(c.red(`✖ ${msg}`) + '\n');
  process.exit(code);
}

function info(msg) {
  process.stdout.write(msg + '\n');
}

function loadYaml() {
  try {
    return require('yaml');
  } catch {
    try {
      return {
        parse: (src) => require('js-yaml').load(src),
      };
    } catch {
      die(
        'image-forge requires a YAML parser. Install one in the project:\n' +
          '  npm install yaml     # recommended\n' +
          '  npm install js-yaml  # fallback',
      );
    }
  }
  return null;
}

function readInputFile(path) {
  const abs = isAbsolute(path) ? path : resolve(process.cwd(), path);
  if (!existsSync(abs)) die(`input file not found: ${abs}`);
  const raw = readFileSync(abs, 'utf8');
  const yaml = loadYaml();
  let doc;
  try {
    doc = yaml.parse(raw);
  } catch (err) {
    die(`failed to parse YAML at ${abs}: ${err.message}`);
  }
  if (!doc || typeof doc !== 'object') {
    die(`YAML root must be an object with "items" array. Got: ${typeof doc}`);
  }
  if (!Array.isArray(doc.items) || doc.items.length === 0) {
    die('YAML must define a non-empty "items" array');
  }
  return { doc, absPath: abs };
}

function mergeDefaults(doc) {
  const defaults = doc.defaults ?? {};
  return doc.items.map((item, i) => {
    const merged = { ...defaults, ...item };
    if (!merged.filename) die(`item #${i + 1} is missing "filename"`);
    if (!merged.prompt) die(`item "${merged.filename}" is missing "prompt"`);
    if (!merged.aspect_ratio) merged.aspect_ratio = '1:1';
    if (!merged.id) merged.id = merged.filename.replace(/\.[^.]+$/, '');
    return merged;
  });
}

function filterByIds(items, onlyCsv) {
  if (!onlyCsv) return items;
  const wanted = new Set(onlyCsv.split(',').map((s) => s.trim()).filter(Boolean));
  const filtered = items.filter((it) => wanted.has(it.id) || wanted.has(it.filename));
  if (filtered.length === 0) {
    die(`--only=${onlyCsv} matched no items. Available ids: ${items.map((i) => i.id).join(', ')}`);
  }
  return filtered;
}

async function confirm(question) {
  const rl = createInterface({ input, output });
  const answer = (await rl.question(c.amber(`${question} [y/N] `))).trim().toLowerCase();
  rl.close();
  return answer === 'y' || answer === 'yes' || answer === 's' || answer === 'sim';
}

function padRight(str, len) {
  const s = String(str);
  return s.length >= len ? s : s + ' '.repeat(len - s.length);
}

function printRoutingTable(decisions) {
  info('');
  info(c.bold('Routing plan:'));
  info(c.dim('─'.repeat(100)));
  info(
    c.dim(padRight('#', 3) + padRight('filename', 42) + padRight('model', 38) + padRight('$', 8) + 'reason'),
  );
  info(c.dim('─'.repeat(100)));
  decisions.forEach((d, i) => {
    const line =
      padRight(i + 1, 3) +
      padRight(d.filename.slice(0, 40), 42) +
      padRight(d.model.replace(/^[^/]+\//, ''), 38) +
      padRight('$' + d.priceUsd.toFixed(3), 8) +
      c.dim(d.reason);
    info(line);
  });
  info(c.dim('─'.repeat(100)));
}

function printTotals(summary) {
  info('');
  info(c.bold('Totals:'));
  for (const [model, stats] of Object.entries(summary.byModel)) {
    info(
      `  ${padRight(model, 42)} ${padRight(stats.count + ' img', 10)} $${stats.usd.toFixed(3)}`,
    );
  }
  info('');
  info(
    c.amber(
      `  Σ ${summary.totals.count} images  →  $${summary.totals.usd.toFixed(3)} USD  ≈  R$ ${summary.totals.brl.toFixed(2)}`,
    ),
  );
  info('');
}

async function generateOne(item, decision, outputDir, token) {
  const filePath = join(outputDir, item.filename);
  if (existsSync(filePath) && statSync(filePath).size > 0) {
    return { status: 'skipped', path: filePath, reason: 'already exists' };
  }

  const extras = {};
  if (item.seed !== undefined) extras.seed = item.seed;
  if (item.negative_prompt) extras.negative_prompt = item.negative_prompt;

  const { outputUrl, latencyMs } = await withRetry(
    () =>
      runPrediction({
        token,
        model: decision.model,
        prompt: item.prompt,
        aspectRatio: item.aspect_ratio,
        extras,
      }),
    { retries: RETRY_COUNT, label: `predict ${item.filename}` },
  );

  const bin = await withRetry(() => downloadBinary(outputUrl), {
    retries: RETRY_COUNT,
    label: `download ${item.filename}`,
  });

  writeFileSync(filePath, bin);
  return { status: 'ok', path: filePath, latencyMs };
}

async function runBatch(items, opts) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) die('missing REPLICATE_API_TOKEN — export it before running');

  const outputDir = opts.outputDir;
  mkdirSync(outputDir, { recursive: true });

  const results = [];
  const total = items.length;
  const startAll = Date.now();

  for (let i = 0; i < total; i += 1) {
    const item = items[i];
    const decision = routeItem(item, { draft: opts.draft });
    const prefix = c.dim(`[${i + 1}/${total}]`);
    process.stdout.write(
      `${prefix} ${c.cyan(item.filename)} → ${decision.model.replace(/^[^/]+\//, '')} ... `,
    );

    try {
      const res = await generateOne(item, decision, outputDir, token);
      if (res.status === 'skipped') {
        process.stdout.write(c.yellow('skip (exists)\n'));
      } else {
        process.stdout.write(c.green(`ok (${(res.latencyMs / 1000).toFixed(1)}s)\n`));
      }
      results.push({ item, decision, ...res });
    } catch (err) {
      process.stdout.write(c.red(`fail — ${err.message}\n`));
      results.push({ item, decision, status: 'error', error: err.message });
    }

    if (i < total - 1) await new Promise((r) => setTimeout(r, BETWEEN_ITEMS_MS));
  }

  const elapsedSec = ((Date.now() - startAll) / 1000).toFixed(1);
  const ok = results.filter((r) => r.status === 'ok').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;
  const failed = results.filter((r) => r.status === 'error').length;

  info('');
  info(c.bold('Summary:'));
  info(`  ${c.green(`✓ ${ok} generated`)}`);
  if (skipped > 0) info(`  ${c.yellow(`↷ ${skipped} skipped`)}`);
  if (failed > 0) info(`  ${c.red(`✖ ${failed} failed`)}`);
  info(`  ${c.dim(`elapsed: ${elapsedSec}s  |  output: ${outputDir}`)}`);

  if (failed > 0) {
    info('');
    info(c.red('Failed items:'));
    for (const r of results.filter((x) => x.status === 'error')) {
      info(`  ${r.item.filename}: ${r.error}`);
    }
    process.exit(2);
  }
}

// ---------- main ----------
async function main() {
  let parsed;
  try {
    parsed = parseArgs({
      allowPositionals: true,
      options: {
        'dry-run': { type: 'boolean', default: false },
        draft: { type: 'boolean', default: false },
        yes: { type: 'boolean', default: false, short: 'y' },
        only: { type: 'string' },
        'output-dir': { type: 'string' },
        help: { type: 'boolean', default: false, short: 'h' },
      },
    });
  } catch (err) {
    die(err.message);
  }

  if (parsed.values.help || parsed.positionals.length === 0) {
    info(
      [
        c.bold('image-forge') + ' — batch image generator with smart routing',
        '',
        'Usage:',
        '  forge.mjs <input.yaml> [options]',
        '',
        'Options:',
        '  --dry-run           Print routing plan + cost, do not call API',
        '  --draft             Force flux-schnell for all items (~R$0,015/image)',
        '  --only=id1,id2      Only process matching item ids or filenames',
        '  --output-dir=PATH   Override output_dir from YAML',
        '  -y, --yes           Skip confirmation gate',
        '  -h, --help          This help',
        '',
        'Env:',
        '  REPLICATE_API_TOKEN   Required. Get one at https://replicate.com/account/api-tokens',
        '',
      ].join('\n'),
    );
    process.exit(0);
  }

  const inputPath = parsed.positionals[0];
  const { doc } = readInputFile(inputPath);
  let items = mergeDefaults(doc);
  items = filterByIds(items, parsed.values.only);

  // Resolve output dir.
  let outputDir = parsed.values['output-dir'] ?? doc.output_dir;
  if (!outputDir) die('output_dir must be set in YAML or via --output-dir');
  outputDir = isAbsolute(outputDir) ? outputDir : resolve(process.cwd(), outputDir);

  const summary = summarizeBatch(items, { draft: parsed.values.draft });
  printRoutingTable(summary.decisions);
  printTotals(summary);
  info(c.dim(`Output: ${outputDir}`));
  info('');

  if (parsed.values['dry-run']) {
    info(c.amber('Dry run — no API calls made.'));
    process.exit(0);
  }

  if (!parsed.values.yes) {
    const ok = await confirm(`Proceed with ${summary.totals.count} generations?`);
    if (!ok) {
      info(c.dim('Aborted.'));
      process.exit(0);
    }
  }

  await runBatch(items, { outputDir, draft: parsed.values.draft });
}

main().catch((err) => {
  process.stderr.write(c.red(`\nunexpected error: ${err.stack ?? err.message}\n`));
  process.exit(1);
});
