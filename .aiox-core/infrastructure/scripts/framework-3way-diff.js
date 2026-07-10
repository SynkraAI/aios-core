#!/usr/bin/env node
/**
 * Wave 0 — 3-way .aiox-core structural diff (OSS × hub × enterprise).
 *
 * Purpose: keep CORE-SUPER-UPDATE / future harvests from being a one-shot event.
 * Does not copy files. Does not require all three trees (missing peers → WARN).
 *
 * Usage (from aiox-core root):
 *   node .aiox-core/infrastructure/scripts/framework-3way-diff.js
 *   node .aiox-core/infrastructure/scripts/framework-3way-diff.js --hub ../peer-hub --enterprise ../peer-ent --json
 *   AIOX_HUB_ROOT=../peer-hub AIOX_ENTERPRISE_ROOT=../peer-ent npm run diff:framework-3way
 *
 * Portable paths only in defaults — never commit machine-specific roots.
 * Peer discovery via env or --hub/--enterprise flags (no product path tokens in defaults).
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { scanContent } = require('../../core/security/port-denylist');

const CORE_REL = '.aiox-core';
const SKIP_DIR = new Set(['node_modules', '.git', 'coverage', 'dist', 'build', '.cache']);

/** @type {string[]} Modules OSS must not lose in a naive hub merge. */
const OSS_WINS_PREFIXES = [
  'core/errors/',
  'core/external-executors/',
  'core/resilience/',
  'core/pro/',
  'pro/',
];

/** @type {Array<[string, string[]]>} Candidate path prefixes owned by each epic wave. */
const WAVE_PREFIXES = [
  ['A', ['core/permissions/', 'core/security/', 'core/synapse/memory/']],
  [
    'B',
    [
      'development/skills/full-sdc/',
      'development/skills/review-story/',
      'development/skills/close-story/',
    ],
  ],
  ['C', ['core/sdc/', 'cli/commands/sdc/', 'cli/commands/wave/', 'core/orchestration/']],
  ['D', ['infrastructure/scripts/ide-sync/', 'core/synapse/']],
  ['E', ['constitution.md']],
  ['F', ['infrastructure/installer/', 'packages/installer/']],
];

/**
 * Resolve sibling peer roots without embedding product-specific path tokens.
 * @param {string} cwd
 * @param {string[]} candidates folder names under parent of cwd
 * @returns {string} First existing peer root or deterministic fallback.
 */
function resolveSibling(cwd, candidates) {
  const parent = path.join(cwd, '..');
  for (const name of candidates) {
    const p = path.join(parent, name);
    if (fs.existsSync(path.join(p, CORE_REL))) return p;
  }
  return path.join(parent, candidates[0]);
}

/**
 * Parse CLI arguments and environment-backed peer roots.
 * @param {string[]} argv - Raw CLI arguments.
 * @returns {object} Normalized harness options.
 */
function parseArgs(argv) {
  const cwd = process.cwd();
  const args = {
    oss: cwd,
    hub: resolveSibling(cwd, ['hub-framework', 'aiox-hub', 'framework-hub']),
    enterprise: resolveSibling(cwd, ['enterprise-framework', 'aiox-enterprise', 'AIOX-enterprise']),
    json: false,
    out: null,
    quiet: false,
    requireExternal: false,
    includeTimestamp: false,
  };
  if (process.env.AIOX_HUB_ROOT) args.hub = path.resolve(process.env.AIOX_HUB_ROOT);
  if (process.env.AIOX_ENTERPRISE_ROOT) {
    args.enterprise = path.resolve(process.env.AIOX_ENTERPRISE_ROOT);
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--oss') args.oss = path.resolve(argv[++i]);
    else if (a === '--hub') args.hub = path.resolve(argv[++i]);
    else if (a === '--enterprise') args.enterprise = path.resolve(argv[++i]);
    else if (a === '--json') args.json = true;
    else if (a === '--out') args.out = path.resolve(argv[++i]);
    else if (a === '--quiet' || a === '-q') args.quiet = true;
    else if (a === '--require-external') args.requireExternal = true;
    else if (a === '--include-timestamp') args.includeTimestamp = true;
    else if (a === '--help' || a === '-h') {
      console.log(
        'Usage: framework-3way-diff.js [--oss DIR] [--hub DIR] [--enterprise DIR] [--json] [--out FILE] [--require-external] [--include-timestamp]\n' +
          'Env: AIOX_HUB_ROOT, AIOX_ENTERPRISE_ROOT'
      );
      process.exit(0);
    }
  }
  return args;
}

function existsCore(root) {
  return fs.existsSync(path.join(root, CORE_REL));
}

/**
 * @param {string} root
 * @returns {Map<string, { size: number, sha1: string, lines: number }>}
 */
function indexCoreTree(root) {
  const base = path.join(root, CORE_REL);
  const map = new Map();
  if (!fs.existsSync(base)) return map;

  function walk(dir, relBase) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (error) {
      throw new Error(
        `Cannot read framework tree directory "${path.relative(base, dir) || '.'}": ${error.message}`
      );
    }
    for (const ent of entries) {
      if (SKIP_DIR.has(ent.name)) continue;
      const full = path.join(dir, ent.name);
      const rel = path.join(relBase, ent.name).split(path.sep).join('/');
      if (ent.isDirectory()) {
        walk(full, rel);
      } else if (ent.isFile()) {
        try {
          const buf = fs.readFileSync(full);
          const text = buf.toString('utf8');
          const lines = text.length ? text.split(/\r?\n/).length : 0;
          map.set(rel, {
            size: buf.length,
            sha1: crypto.createHash('sha1').update(buf).digest('hex').slice(0, 12),
            lines,
          });
        } catch (error) {
          throw new Error(`Cannot read framework tree file "${rel}": ${error.message}`);
        }
      }
    }
  }
  walk(base, '');
  return map;
}

/**
 * Determine whether a path belongs to an OSS-preserved prefix.
 * @param {string} rel - Framework-relative path.
 * @returns {boolean} True when peer content must not overwrite OSS blindly.
 */
function isOssWins(rel) {
  return OSS_WINS_PREFIXES.some((p) => rel === p.replace(/\/$/, '') || rel.startsWith(p));
}

/**
 * @param {Map} left
 * @param {Map|null} right
 * @param {string} peerName
 * @param {string} [leftName]
 * @returns {object} Stable pairwise counters, path samples, and content deltas.
 */
function comparePair(left, right, peerName, leftName = 'oss') {
  if (!right) {
    return {
      leftName,
      peerName,
      present: false,
      onlyLeft: [],
      onlyRight: [],
      differTop: [],
    };
  }
  const onlyLeft = [];
  const onlyRight = [];
  const differ = [];
  for (const [rel, meta] of left) {
    if (!right.has(rel)) onlyLeft.push(rel);
    else {
      const p = right.get(rel);
      if (p.sha1 !== meta.sha1) {
        differ.push({
          path: rel,
          leftLines: meta.lines,
          rightLines: p.lines,
          deltaLines: p.lines - meta.lines,
          leftBytes: meta.size,
          rightBytes: p.size,
          ...(leftName === 'oss' ? { ossWins: isOssWins(rel) } : {}),
        });
      }
    }
  }
  for (const rel of right.keys()) {
    if (!left.has(rel)) onlyRight.push(rel);
  }
  onlyLeft.sort();
  onlyRight.sort();
  differ.sort(
    (a, b) => Math.abs(b.deltaLines) - Math.abs(a.deltaLines) || a.path.localeCompare(b.path)
  );
  return {
    leftName,
    peerName,
    present: true,
    onlyLeftCount: onlyLeft.length,
    onlyRightCount: onlyRight.length,
    differCount: differ.length,
    onlyLeft: onlyLeft.slice(0, 80),
    onlyRight: onlyRight.slice(0, 80),
    differTop: differ.slice(0, 40),
    differAllCount: differ.length,
  };
}

/** @returns {Record<string, string[]>} Empty stable three-way buckets. */
function createThreeWayBuckets() {
  return {
    allSame: [],
    ossDiffers: [],
    hubDiffers: [],
    enterpriseDiffers: [],
    allDifferent: [],
    onlyOss: [],
    onlyHub: [],
    onlyEnterprise: [],
    ossHubSameOnly: [],
    ossEnterpriseSameOnly: [],
    hubEnterpriseSameOnly: [],
    ossHubDifferentOnly: [],
    ossEnterpriseDifferentOnly: [],
    hubEnterpriseDifferentOnly: [],
  };
}

/**
 * Classify every path across the three indexed trees.
 *
 * @param {Map} oss
 * @param {Map} hub
 * @param {Map} enterprise
 * @returns {{ available: boolean, missingTrees: string[], totalPaths: number, buckets: Record<string, string[]> }} Stable buckets.
 */
function classifyThreeWay(oss, hub, enterprise) {
  const buckets = createThreeWayBuckets();
  const paths = [...new Set([...oss.keys(), ...hub.keys(), ...enterprise.keys()])].sort();
  for (const rel of paths) {
    const o = oss.get(rel);
    const h = hub.get(rel);
    const e = enterprise.get(rel);
    const present = [o, h, e].filter(Boolean).length;
    if (present === 1) {
      buckets[o ? 'onlyOss' : h ? 'onlyHub' : 'onlyEnterprise'].push(rel);
      continue;
    }
    if (present === 2) {
      const same =
        (o && h && o.sha1 === h.sha1) ||
        (o && e && o.sha1 === e.sha1) ||
        (h && e && h.sha1 === e.sha1);
      const pair = o && h ? 'ossHub' : o && e ? 'ossEnterprise' : 'hubEnterprise';
      buckets[`${pair}${same ? 'Same' : 'Different'}Only`].push(rel);
      continue;
    }
    if (o.sha1 === h.sha1 && h.sha1 === e.sha1) buckets.allSame.push(rel);
    else if (h.sha1 === e.sha1) buckets.ossDiffers.push(rel);
    else if (o.sha1 === e.sha1) buckets.hubDiffers.push(rel);
    else if (o.sha1 === h.sha1) buckets.enterpriseDiffers.push(rel);
    else buckets.allDifferent.push(rel);
  }
  return { available: true, missingTrees: [], totalPaths: paths.length, buckets };
}

/**
 * Map candidate paths to the epic wave that owns their review.
 *
 * @param {string[]} paths
 * @returns {Record<string, string[]>} Sorted paths grouped by wave.
 */
function classifyByWave(paths) {
  const grouped = { A: [], B: [], C: [], D: [], E: [], F: [], unclassified: [] };
  for (const rel of [...new Set(paths)].sort()) {
    const match = WAVE_PREFIXES.find(([, prefixes]) =>
      prefixes.some((prefix) => rel === prefix || rel.startsWith(prefix))
    );
    grouped[match ? match[0] : 'unclassified'].push(rel);
  }
  return grouped;
}

/**
 * Scan a peer framework tree for OSS port denylist hits.
 *
 * @param {string} treeName
 * @param {string} root
 * @param {Map} index
 * @returns {Array<object>} Stable findings with tree/path metadata.
 */
function scanTreeDenylist(treeName, root, index) {
  const findings = [];
  for (const rel of [...index.keys()].sort()) {
    const file = path.join(root, CORE_REL, rel);
    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch (error) {
      throw new Error(`Cannot scan ${treeName} framework tree file "${rel}": ${error.message}`);
    }
    for (const hit of scanContent(content, path.join(CORE_REL, rel))) {
      findings.push({ tree: treeName, path: rel, ...hit });
    }
  }
  return findings.sort(
    (a, b) => a.tree.localeCompare(b.tree) || a.path.localeCompare(b.path) || a.line - b.line
  );
}

/**
 * Render a deterministic Markdown report for a semantic diff result.
 * @param {object} result - Result returned by {@link buildResult}.
 * @returns {string} Markdown report ending in a newline.
 */
function formatReport(result) {
  const lines = [];
  lines.push('# Framework 3-way diff (`.aiox-core`)');
  lines.push('');
  if (result.generatedAt) {
    lines.push(`Generated: ${result.generatedAt}`);
    lines.push('');
  }
  lines.push('| Tree | Root | Files | Present |');
  lines.push('|------|------|-------|---------|');
  for (const t of result.trees) {
    lines.push(
      `| ${t.name} | \`${t.root}\` | ${t.fileCount} | ${t.present ? 'yes' : '**missing**'} |`
    );
  }
  lines.push('');
  lines.push('## OSS-wins prefixes (never blind-overwrite)');
  lines.push('');
  for (const p of OSS_WINS_PREFIXES) lines.push(`- \`${p}\``);
  lines.push('');

  for (const pair of result.pairs) {
    const leftLabel = pair.leftName === 'oss' ? 'OSS' : pair.leftName;
    lines.push(`## ${leftLabel} ↔ ${pair.peerName}`);
    lines.push('');
    if (!pair.present) {
      lines.push(`Peer tree not found — skipped.`);
      lines.push('');
      continue;
    }
    lines.push(`- Only in ${leftLabel}: **${pair.onlyLeftCount}** (showing ≤80)`);
    lines.push(`- Only in ${pair.peerName}: **${pair.onlyRightCount}** (showing ≤80)`);
    lines.push(`- Content differs: **${pair.differAllCount}** (top 40 by |Δ lines|)`);
    lines.push('');
    if (pair.differTop.length) {
      const ossWinsColumn = pair.leftName === 'oss' ? ' | OSS-wins?' : '';
      lines.push(
        `| Path | ${leftLabel} lines | ${pair.peerName} lines | Δ lines${ossWinsColumn} |`
      );
      lines.push(
        `|------|------------|------------|---------${pair.leftName === 'oss' ? '|-----------' : ''}|`
      );
      for (const d of pair.differTop) {
        lines.push(
          `| \`${d.path}\` | ${d.leftLines} | ${d.rightLines} | ${d.deltaLines >= 0 ? '+' : ''}${d.deltaLines}${pair.leftName === 'oss' ? ` | ${d.ossWins ? 'YES' : ''}` : ''} |`
        );
      }
      lines.push('');
    }
    if (pair.onlyRight.length) {
      lines.push(`### Sample only-in-${pair.peerName}`);
      lines.push('');
      for (const p of pair.onlyRight.slice(0, 25)) lines.push(`- \`${p}\``);
      lines.push('');
    }
  }

  lines.push('## Three-way buckets');
  lines.push('');
  if (!result.threeWay.available) {
    lines.push(
      `Classification unavailable — missing framework trees: ${result.threeWay.missingTrees.join(', ')}.`
    );
    lines.push('');
  }
  for (const [name, paths] of Object.entries(result.threeWay.buckets)) {
    lines.push(`- ${name}: **${paths.length}**`);
  }
  lines.push('');
  lines.push('## Candidate ports by wave');
  lines.push('');
  for (const [wave, paths] of Object.entries(result.candidatesByWave)) {
    lines.push(`- Wave ${wave}: **${paths.length}**`);
  }
  lines.push('');
  lines.push(`## Port denylist hits: ${result.denylistHits.length}`);
  lines.push('');
  for (const hit of result.denylistHits.slice(0, 50)) {
    lines.push(`- ${hit.tree}: \`${hit.path}:${hit.line}\` [${hit.id}]`);
  }
  lines.push('');

  lines.push('## Harvest heuristics (manual next step)');
  lines.push('');
  lines.push('1. Prefer **enterprise** lean skills when hub is product-bloated (e.g. full-sdc).');
  lines.push('2. Prefer **hub** for runtime guards/tests when OSS is missing modules.');
  lines.push('3. Never overwrite OSS-wins paths with hub/enterprise without explicit review.');
  lines.push(
    '4. `master-orchestrator`: 3-way — enterprise may be *smaller* than OSS; do not regress.'
  );
  lines.push('5. `wave-executor`: often 2-way OSS↔hub (enterprise ≈ OSS).');
  lines.push('');
  return `${lines.join('\n')}\n`;
}

/**
 * Build the complete deterministic three-tree semantic result.
 * @param {object} args - Normalized roots and timestamp option.
 * @returns {object} Trees, pairs, buckets, wave candidates, and denylist hits.
 */
function buildResult(args) {
  const treesSpec = [
    { name: 'oss', root: args.oss },
    { name: 'hub', root: args.hub },
    { name: 'enterprise', root: args.enterprise },
  ];

  const trees = treesSpec.map((t) => {
    const present = existsCore(t.root);
    let index = new Map();
    if (present) {
      try {
        index = indexCoreTree(t.root);
      } catch (error) {
        throw new Error(`Cannot index ${t.name} framework tree at ${t.root}: ${error.message}`);
      }
    }
    return {
      name: t.name,
      root: t.root,
      present,
      fileCount: index.size,
      index,
    };
  });

  const oss = trees.find((t) => t.name === 'oss');
  const hub = trees.find((t) => t.name === 'hub');
  const enterprise = trees.find((t) => t.name === 'enterprise');
  const pairs = [
    comparePair(oss.index, hub.present ? hub.index : null, 'hub'),
    comparePair(oss.index, enterprise.present ? enterprise.index : null, 'enterprise'),
    comparePair(
      hub.present ? hub.index : new Map(),
      hub.present && enterprise.present ? enterprise.index : null,
      'enterprise',
      'hub'
    ),
  ];

  const missingTrees = trees.filter((tree) => !tree.present).map((tree) => tree.name);
  const threeWay =
    missingTrees.length === 0
      ? classifyThreeWay(oss.index, hub.index, enterprise.index)
      : {
          available: false,
          missingTrees,
          totalPaths: 0,
          buckets: createThreeWayBuckets(),
        };
  const candidatePaths = Object.entries(threeWay.buckets)
    .filter(([name]) => !['allSame', 'onlyOss'].includes(name))
    .flatMap(([, paths]) => paths);
  const denylistHits = [
    ...(hub.present ? scanTreeDenylist('hub', hub.root, hub.index) : []),
    ...(enterprise.present
      ? scanTreeDenylist('enterprise', enterprise.root, enterprise.index)
      : []),
  ];

  const result = {
    trees: trees.map(({ name, root, present, fileCount }) => ({
      name,
      root,
      present,
      fileCount,
    })),
    pairs,
    threeWay,
    candidatesByWave: classifyByWave(candidatePaths),
    denylistHits,
    ossWinsPrefixes: OSS_WINS_PREFIXES,
  };
  if (args.includeTimestamp) result.generatedAt = new Date().toISOString();
  return result;
}

/**
 * Execute the CLI harness and set process exit codes for missing required trees.
 * @param {string[]} [argv] - CLI arguments.
 * @returns {object} The semantic result emitted by the selected formatter.
 */
function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const result = buildResult(args);
  const oss = result.trees.find((t) => t.name === 'oss');
  const missingExternal = result.trees.filter((t) => t.name !== 'oss' && !t.present);

  if (args.json) {
    const text = `${JSON.stringify(result, null, 2)}\n`;
    if (args.out) {
      fs.mkdirSync(path.dirname(args.out), { recursive: true });
      fs.writeFileSync(args.out, text, 'utf8');
    } else if (!args.quiet) {
      process.stdout.write(text);
    }
  } else {
    const md = formatReport(result);
    if (args.out) {
      fs.mkdirSync(path.dirname(args.out), { recursive: true });
      fs.writeFileSync(args.out, md, 'utf8');
      if (!args.quiet) console.log(`Wrote ${args.out}`);
    } else if (!args.quiet) {
      process.stdout.write(md);
    }
  }

  if (!oss.present) {
    console.error('OSS .aiox-core not found at', args.oss);
    process.exitCode = 2;
    return result;
  }
  if (args.requireExternal && missingExternal.length > 0) {
    console.error(
      `Required external framework tree(s) missing: ${missingExternal.map((t) => t.name).join(', ')}`
    );
    process.exitCode = 3;
  }
  return result;
}

if (require.main === module) {
  main();
}

module.exports = {
  parseArgs,
  resolveSibling,
  indexCoreTree,
  comparePair,
  classifyThreeWay,
  classifyByWave,
  scanTreeDenylist,
  buildResult,
  main,
  isOssWins,
  OSS_WINS_PREFIXES,
  WAVE_PREFIXES,
  formatReport,
};
