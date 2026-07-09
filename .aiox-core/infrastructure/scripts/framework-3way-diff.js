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

const CORE_REL = '.aiox-core';
const SKIP_DIR = new Set([
  'node_modules',
  '.git',
  'coverage',
  'dist',
  'build',
  '.cache',
]);

/** Modules OSS must not lose in a naive hub merge (merge-blocking). */
const OSS_WINS_PREFIXES = [
  'core/errors/',
  'core/external-executors/',
  'core/resilience/',
  'core/pro/',
  'pro/',
];

/**
 * Resolve sibling peer roots without embedding product-specific path tokens.
 * @param {string} cwd
 * @param {string[]} candidates folder names under parent of cwd
 */
function resolveSibling(cwd, candidates) {
  const parent = path.join(cwd, '..');
  for (const name of candidates) {
    const p = path.join(parent, name);
    if (fs.existsSync(path.join(p, CORE_REL))) return p;
  }
  return path.join(parent, candidates[0]);
}

function parseArgs(argv) {
  const cwd = process.cwd();
  const args = {
    oss: cwd,
    hub: resolveSibling(cwd, ['hub-framework', 'aiox-hub', 'framework-hub']),
    enterprise: resolveSibling(cwd, [
      'enterprise-framework',
      'aiox-enterprise',
      'AIOX-enterprise',
    ]),
    json: false,
    out: null,
    quiet: false,
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
    else if (a === '--help' || a === '-h') {
      console.log(
        'Usage: framework-3way-diff.js [--oss DIR] [--hub DIR] [--enterprise DIR] [--json] [--out FILE]\n' +
          'Env: AIOX_HUB_ROOT, AIOX_ENTERPRISE_ROOT',
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
    } catch {
      return;
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
        } catch {
          /* skip unreadable */
        }
      }
    }
  }
  walk(base, '');
  return map;
}

function isOssWins(rel) {
  return OSS_WINS_PREFIXES.some((p) => rel === p.replace(/\/$/, '') || rel.startsWith(p));
}

/**
 * @param {Map} oss
 * @param {Map|null} peer
 * @param {string} peerName
 */
function comparePair(oss, peer, peerName) {
  if (!peer) {
    return { peerName, present: false, onlyOss: [], onlyPeer: [], differ: [] };
  }
  const onlyOss = [];
  const onlyPeer = [];
  const differ = [];
  for (const [rel, meta] of oss) {
    if (!peer.has(rel)) onlyOss.push(rel);
    else {
      const p = peer.get(rel);
      if (p.sha1 !== meta.sha1) {
        differ.push({
          path: rel,
          ossLines: meta.lines,
          peerLines: p.lines,
          deltaLines: p.lines - meta.lines,
          ossBytes: meta.size,
          peerBytes: p.size,
          ossWins: isOssWins(rel),
        });
      }
    }
  }
  for (const rel of peer.keys()) {
    if (!oss.has(rel)) onlyPeer.push(rel);
  }
  onlyOss.sort();
  onlyPeer.sort();
  differ.sort((a, b) => Math.abs(b.deltaLines) - Math.abs(a.deltaLines));
  return {
    peerName,
    present: true,
    onlyOssCount: onlyOss.length,
    onlyPeerCount: onlyPeer.length,
    differCount: differ.length,
    onlyOss: onlyOss.slice(0, 80),
    onlyPeer: onlyPeer.slice(0, 80),
    differTop: differ.slice(0, 40),
    differAllCount: differ.length,
  };
}

function formatReport(result) {
  const lines = [];
  lines.push('# Framework 3-way diff (`.aiox-core`)');
  lines.push('');
  lines.push(`Generated: ${result.generatedAt}`);
  lines.push('');
  lines.push('| Tree | Root | Files | Present |');
  lines.push('|------|------|-------|---------|');
  for (const t of result.trees) {
    lines.push(
      `| ${t.name} | \`${t.root}\` | ${t.fileCount} | ${t.present ? 'yes' : '**missing**'} |`,
    );
  }
  lines.push('');
  lines.push('## OSS-wins prefixes (never blind-overwrite)');
  lines.push('');
  for (const p of OSS_WINS_PREFIXES) lines.push(`- \`${p}\``);
  lines.push('');

  for (const pair of result.pairs) {
    lines.push(`## OSS ↔ ${pair.peerName}`);
    lines.push('');
    if (!pair.present) {
      lines.push(`Peer tree not found — skipped.`);
      lines.push('');
      continue;
    }
    lines.push(
      `- Only in OSS: **${pair.onlyOssCount}** (showing ≤80)`,
    );
    lines.push(
      `- Only in ${pair.peerName}: **${pair.onlyPeerCount}** (showing ≤80)`,
    );
    lines.push(
      `- Content differs: **${pair.differAllCount}** (top 40 by |Δ lines|)`,
    );
    lines.push('');
    if (pair.differTop.length) {
      lines.push('| Path | OSS lines | Peer lines | Δ lines | OSS-wins? |');
      lines.push('|------|-----------|------------|---------|-----------|');
      for (const d of pair.differTop) {
        lines.push(
          `| \`${d.path}\` | ${d.ossLines} | ${d.peerLines} | ${d.deltaLines >= 0 ? '+' : ''}${d.deltaLines} | ${d.ossWins ? 'YES' : ''} |`,
        );
      }
      lines.push('');
    }
    if (pair.onlyPeer.length) {
      lines.push(`### Sample only-in-${pair.peerName}`);
      lines.push('');
      for (const p of pair.onlyPeer.slice(0, 25)) lines.push(`- \`${p}\``);
      lines.push('');
    }
  }

  lines.push('## Harvest heuristics (manual next step)');
  lines.push('');
  lines.push('1. Prefer **enterprise** lean skills when hub is product-bloated (e.g. full-sdc).');
  lines.push('2. Prefer **hub** for runtime guards/tests when OSS is missing modules.');
  lines.push('3. Never overwrite OSS-wins paths with hub/enterprise without explicit review.');
  lines.push('4. `master-orchestrator`: 3-way — enterprise may be *smaller* than OSS; do not regress.');
  lines.push('5. `wave-executor`: often 2-way OSS↔hub (enterprise ≈ OSS).');
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const treesSpec = [
    { name: 'oss', root: args.oss },
    { name: 'hub', root: args.hub },
    { name: 'enterprise', root: args.enterprise },
  ];

  const trees = treesSpec.map((t) => {
    const present = existsCore(t.root);
    const index = present ? indexCoreTree(t.root) : new Map();
    return {
      name: t.name,
      root: t.root,
      present,
      fileCount: index.size,
      index,
    };
  });

  const oss = trees.find((t) => t.name === 'oss');
  const pairs = ['hub', 'enterprise'].map((name) => {
    const peer = trees.find((t) => t.name === name);
    return comparePair(
      oss.index,
      peer.present ? peer.index : null,
      name,
    );
  });

  const result = {
    generatedAt: new Date().toISOString(),
    trees: trees.map(({ name, root, present, fileCount }) => ({
      name,
      root,
      present,
      fileCount,
    })),
    pairs,
    ossWinsPrefixes: OSS_WINS_PREFIXES,
  };

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

  // Exit 0 even if peers missing (advisory tool). Exit 2 if OSS core missing.
  if (!oss.present) {
    console.error('OSS .aiox-core not found at', args.oss);
    process.exit(2);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  parseArgs,
  resolveSibling,
  indexCoreTree,
  comparePair,
  isOssWins,
  OSS_WINS_PREFIXES,
  formatReport,
};
