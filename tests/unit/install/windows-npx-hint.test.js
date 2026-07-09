'use strict';

const {
  isLikelyNpx,
  getWindowsNpxInstallHint,
  printWindowsNpxInstallHint,
  ISSUE_URL,
} = require('../../../.aiox-core/core/install/windows-npx-hint');

describe('windows-npx-hint (CORE-SU.F1)', () => {
  it('detects npx via user agent', () => {
    expect(isLikelyNpx({ npm_config_user_agent: 'npm/10 npx/10 node/v22' })).toBe(
      true,
    );
    expect(isLikelyNpx({ npm_command: 'exec' })).toBe(true);
    expect(isLikelyNpx({})).toBe(false);
  });

  it('hints on win32 under npx', () => {
    const r = getWindowsNpxInstallHint({
      platform: 'win32',
      env: { npm_command: 'exec' },
    });
    expect(r.shouldHint).toBe(true);
    expect(r.message).toMatch(/ECOMPROMISED/);
    expect(r.message).toMatch(/773/);
    expect(r.issueUrl).toBe(ISSUE_URL);
  });

  it('does not hint on darwin by default', () => {
    const r = getWindowsNpxInstallHint({
      platform: 'darwin',
      env: { npm_command: 'exec' },
    });
    expect(r.shouldHint).toBe(false);
  });

  it('force prints on any platform', () => {
    const chunks = [];
    printWindowsNpxInstallHint({
      force: true,
      platform: 'linux',
      stream: { write: (c) => chunks.push(c) },
    });
    expect(chunks.join('')).toMatch(/ECOMPROMISED/);
  });
});

describe('windows-npx-install doctor check', () => {
  const check = require('../../../.aiox-core/core/doctor/checks/windows-npx-install');

  it('PASS on non-windows', async () => {
    const r = await check.run({ platform: 'linux' });
    expect(r.status).toBe('PASS');
  });

  it('WARN on windows', async () => {
    const r = await check.run({ platform: 'win32', env: {} });
    expect(r.status).toBe('WARN');
    expect(r.message).toMatch(/ECOMPROMISED|773/);
  });
});
