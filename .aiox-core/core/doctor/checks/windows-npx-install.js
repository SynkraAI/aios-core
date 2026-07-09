/**
 * Doctor check: Windows npx install guidance (CORE-SU.F1 / #773).
 * Advisory WARN on win32; PASS elsewhere.
 */

'use strict';

const {
  getWindowsNpxInstallHint,
  ISSUE_URL,
} = require('../../install/windows-npx-hint');

const name = 'windows-npx-install';

/**
 * @param {object} context
 * @returns {Promise<object>}
 */
async function run(context = {}) {
  const platform = context.platform || process.platform;
  const { underNpx } = getWindowsNpxInstallHint({
    platform,
    env: context.env || process.env,
    force: false,
  });

  if (platform !== 'win32') {
    return {
      check: name,
      status: 'PASS',
      message: 'Non-Windows platform — ECOMPROMISED npx lock issue N/A',
    };
  }

  // Always advisory on Windows so operators see the known issue
  return {
    check: name,
    status: 'WARN',
    message:
      'Windows: npx install may hit ECOMPROMISED (npm lock timeout) on cold cache. ' +
      'Prefer: npm install -g @aiox-squads/core then aiox-core install. ' +
      `See ${ISSUE_URL}` +
      (underNpx ? ' (currently under npx).' : '.'),
    fixCommand: 'npm install -g @aiox-squads/core',
    docs: 'docs/guides/installation-troubleshooting.md',
  };
}

module.exports = {
  name,
  run,
  severity: 'advisory',
};
