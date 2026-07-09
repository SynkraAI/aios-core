/**
 * Windows npx ECOMPROMISED guidance (CORE-SU.F1 / #773).
 * Advisory only — never blocks install.
 */

'use strict';

const ISSUE_URL = 'https://github.com/SynkraAI/aiox-core/issues/773';

/**
 * Detect likely npx execution context.
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {boolean}
 */
function isLikelyNpx(env = process.env) {
  env = env || process.env || {};
  if (env.npm_command === 'exec') return true;
  if (env.npm_lifecycle_event === 'npx') return true;
  const ua = String(env.npm_config_user_agent || '');
  if (/\bnpx\b/i.test(ua)) return true;
  // npx extracts under npm cache _npx
  const cwd = process.cwd();
  if (/[\\/]_npx[\\/]/i.test(cwd) || /[\\/]npx-/i.test(cwd)) return true;
  const argv1 = process.argv[1] || '';
  if (/[\\/]_npx[\\/]/i.test(argv1)) return true;
  return false;
}

/**
 * @param {object} [opts]
 * @param {string} [opts.platform]
 * @param {NodeJS.ProcessEnv} [opts.env]
 * @param {boolean} [opts.force] - print even on non-win32 (tests)
 * @returns {{ shouldHint: boolean, message: string }}
 */
function getWindowsNpxInstallHint(opts = {}) {
  const platform = opts.platform || process.platform;
  const env = opts.env || process.env;
  const underNpx = isLikelyNpx(env);
  const shouldHint =
    opts.force === true || (platform === 'win32' && underNpx);

  const message = [
    '',
    '┌─ Windows / npx note (#773) ─────────────────────────────────────┐',
    '│ If install fails with: npm error code ECOMPROMISED              │',
    '│ (Lock compromised), the npx lock timed out while fetching the  │',
    '│ package tree (common on cold cache / slow links).              │',
    '│                                                                │',
    '│ Recommended workarounds:                                       │',
    '│   1) npm install -g @aiox-squads/core                           │',
    '│      then: aiox-core install                                   │',
    '│   2) git clone … && npm install && node bin/aiox.js install    │',
    '│   3) Warm cache: npm cache verify && retry npx                 │',
    '│ Docs: docs/guides/installation-troubleshooting.md              │',
    `│ Issue: ${ISSUE_URL}`.padEnd(65) + '│',
    '└────────────────────────────────────────────────────────────────┘',
    '',
  ].join('\n');

  return { shouldHint, message, underNpx, platform, issueUrl: ISSUE_URL };
}

/**
 * Print hint to a stream when applicable.
 * @param {object} [opts]
 * @param {NodeJS.WritableStream} [opts.stream]
 */
function printWindowsNpxInstallHint(opts = {}) {
  const stream = opts.stream || process.stderr;
  const result = getWindowsNpxInstallHint(opts);
  if (result.shouldHint) {
    stream.write(result.message);
  }
  return result;
}

module.exports = {
  ISSUE_URL,
  isLikelyNpx,
  getWindowsNpxInstallHint,
  printWindowsNpxInstallHint,
};
