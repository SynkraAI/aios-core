/**
 * Doctor check: advisory Wave-0 3-way framework drift (optional peers).
 * Lightweight only — full scan lives in `npm run diff:framework-3way`.
 * Never FAILs if hub/enterprise missing.
 */

'use strict';

const path = require('path');
const fs = require('fs');

const name = 'framework-3way-diff';

function peerHasCore(root) {
  try {
    return fs.existsSync(path.join(root, '.aiox-core'));
  } catch {
    return false;
  }
}

/**
 * Resolve peer without heavy work. Prefer env; else common sibling folder names.
 * @param {string} projectRoot
 * @param {string[]} candidates
 * @param {string|undefined} envVal
 */
function resolvePeer(projectRoot, candidates, envVal) {
  if (envVal) {
    const p = path.resolve(envVal);
    return peerHasCore(p) ? p : null;
  }
  const parent = path.join(projectRoot, '..');
  for (const name of candidates) {
    const p = path.join(parent, name);
    if (peerHasCore(p)) return p;
  }
  return null;
}

/**
 * @param {object} context
 */
async function run(context = {}) {
  const projectRoot = context.projectRoot || process.cwd();

  const hub = resolvePeer(
    projectRoot,
    ['hub-framework', 'aiox-hub', 'framework-hub'],
    process.env.AIOX_HUB_ROOT,
  );
  // Local lab folder name allowed via env only when set; avoid product tokens in source.
  const ent = resolvePeer(
    projectRoot,
    ['enterprise-framework', 'aiox-enterprise', 'AIOX-enterprise'],
    process.env.AIOX_ENTERPRISE_ROOT,
  );

  if (!hub && !ent) {
    return {
      check: name,
      status: 'PASS',
      message:
        'No sibling hub/enterprise trees — 3-way harvest check skipped (run npm run diff:framework-3way when peers available)',
    };
  }

  const parts = [];
  if (hub) parts.push(`hub@${path.basename(hub)}`);
  if (ent) parts.push(`ent@${path.basename(ent)}`);

  return {
    check: name,
    status: 'WARN',
    message: `Framework peers present (${parts.join(', ')}). Run full drift report: npm run diff:framework-3way`,
    fixCommand: 'npm run diff:framework-3way',
  };
}

module.exports = { name, run, severity: 'advisory' };
