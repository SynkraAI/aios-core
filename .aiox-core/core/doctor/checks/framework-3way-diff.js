/**
 * Doctor check: advisory Wave-0 3-way framework drift (optional peers).
 * Never FAILs if hub/enterprise missing — PASS with note or WARN with summary.
 */

'use strict';

const path = require('path');
const fs = require('fs');

const name = 'framework-3way-diff';

/**
 * @param {object} context
 */
async function run(context = {}) {
  const projectRoot = context.projectRoot || process.cwd();
  let script;
  try {
    script = require('../../../infrastructure/scripts/framework-3way-diff');
  } catch (error) {
    return {
      check: name,
      status: 'WARN',
      message: `3-way diff script unavailable: ${error.message}`,
    };
  }

  const hub =
    process.env.AIOX_HUB_ROOT ||
    script.resolveSibling?.(projectRoot, ['hub-framework', 'aiox-hub', 'framework-hub']) ||
    path.resolve(projectRoot, '..', 'hub-framework');
  const ent =
    process.env.AIOX_ENTERPRISE_ROOT ||
    script.resolveSibling?.(projectRoot, [
      'enterprise-framework',
      'aiox-enterprise',
      'AIOX-enterprise',
    ]) ||
    path.resolve(projectRoot, '..', 'enterprise-framework');
  const hubOk = fs.existsSync(path.join(hub, '.aiox-core'));
  const entOk = fs.existsSync(path.join(ent, '.aiox-core'));

  if (!hubOk && !entOk) {
    return {
      check: name,
      status: 'PASS',
      message:
        'No sibling hub/enterprise trees — 3-way harvest check skipped (run npm run diff:framework-3way when peers available)',
    };
  }

  try {
    const ossIdx = script.indexCoreTree(projectRoot);
    const hubIdx = hubOk ? script.indexCoreTree(hub) : null;
    const entIdx = entOk ? script.indexCoreTree(ent) : null;
    const vsHub = script.comparePair(ossIdx, hubIdx, 'hub');
    const vsEnt = script.comparePair(ossIdx, entIdx, 'enterprise');
    const bits = [];
    if (vsHub.present) {
      bits.push(
        `hub: Δfiles=${vsHub.differAllCount} onlyPeer=${vsHub.onlyPeerCount}`,
      );
    }
    if (vsEnt.present) {
      bits.push(
        `ent: Δfiles=${vsEnt.differAllCount} onlyPeer=${vsEnt.onlyPeerCount}`,
      );
    }
    return {
      check: name,
      status: 'WARN',
      message: `Framework drift vs local peers — ${bits.join('; ')}. Run: npm run diff:framework-3way`,
      fixCommand: 'npm run diff:framework-3way',
    };
  } catch (error) {
    return {
      check: name,
      status: 'WARN',
      message: `3-way diff failed: ${error.message}`,
    };
  }
}

module.exports = { name, run, severity: 'advisory' };
