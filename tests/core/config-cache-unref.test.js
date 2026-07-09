'use strict';

/**
 * ConfigCache module-level timer behavior (CORE-SU.A2 / #797)
 *
 * - Production: starts a 60s sweep interval and unrefs it
 * - Jest workers (JEST_WORKER_ID set): must NOT schedule the interval
 */

const path = require('path');

const repoRoot = path.resolve(__dirname, '../..');
const requireFromRoot = (modulePath) => require(path.join(repoRoot, modulePath));

const MODULES = [
  '.aiox-core/core/config/config-cache',
  '.aiox-core/infrastructure/scripts/config-cache',
];

describe('config cache cleanup timers', () => {
  const originalJestWorkerId = process.env.JEST_WORKER_ID;

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetModules();
    if (originalJestWorkerId === undefined) {
      delete process.env.JEST_WORKER_ID;
    } else {
      process.env.JEST_WORKER_ID = originalJestWorkerId;
    }
  });

  describe('under Jest worker (JEST_WORKER_ID set) — residual #797 fix', () => {
    it.each(MODULES)('does not schedule cleanup interval in %s', (modulePath) => {
      process.env.JEST_WORKER_ID = process.env.JEST_WORKER_ID || '1';
      const setIntervalSpy = jest.spyOn(global, 'setInterval');

      const moduleExports = requireFromRoot(modulePath);

      expect(moduleExports.globalConfigCache).toBeDefined();
      expect(typeof moduleExports.disposeConfigCacheTimers).toBe('function');
      expect(setIntervalSpy).not.toHaveBeenCalled();
    });
  });

  describe('outside Jest (no JEST_WORKER_ID) — production path', () => {
    it.each(MODULES)('starts and unrefs cleanup interval in %s', (modulePath) => {
      delete process.env.JEST_WORKER_ID;
      const cleanupTimer = { unref: jest.fn() };
      const setIntervalSpy = jest
        .spyOn(global, 'setInterval')
        .mockImplementation(() => cleanupTimer);

      const moduleExports = requireFromRoot(modulePath);

      expect(moduleExports.globalConfigCache).toBeDefined();
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 60 * 1000);
      expect(cleanupTimer.unref).toHaveBeenCalledTimes(1);

      // dispose clears timer handle
      moduleExports.disposeConfigCacheTimers();
      // start again is idempotent until disposed
      const again = moduleExports.startCacheCleanupTimer();
      expect(again).toBe(cleanupTimer);
      expect(setIntervalSpy).toHaveBeenCalledTimes(2);
      moduleExports.disposeConfigCacheTimers();
    });
  });

  describe('disposeConfigCacheTimers', () => {
    it('is safe when no timer was started (Jest path)', () => {
      process.env.JEST_WORKER_ID = '1';
      const { disposeConfigCacheTimers } = requireFromRoot(MODULES[0]);
      expect(() => disposeConfigCacheTimers()).not.toThrow();
    });
  });
});
