/**
 * MemoryBridge heuristic reinforcement (CORE-SU / hub Story 71.1 port)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const {
  MemoryBridge,
  BRIDGE_TIMEOUT_COLD_MS,
  _resetHeuristicRegexCache,
} = require('../../.aiox-core/core/synapse/memory/memory-bridge');

describe('MemoryBridge.processSessionDigest', () => {
  let bridge;

  beforeEach(() => {
    _resetHeuristicRegexCache();
    bridge = new MemoryBridge();
    bridge._reinforceHeuristics = jest.fn();
  });

  afterEach(() => {
    bridge._reset();
    _resetHeuristicRegexCache();
  });

  test('silently ignores null input', () => {
    bridge.processSessionDigest(null);
    expect(bridge._reinforceHeuristics).not.toHaveBeenCalled();
  });

  test('silently ignores undefined input', () => {
    bridge.processSessionDigest(undefined);
    expect(bridge._reinforceHeuristics).not.toHaveBeenCalled();
  });

  test('silently ignores empty string', () => {
    bridge.processSessionDigest('');
    expect(bridge._reinforceHeuristics).not.toHaveBeenCalled();
  });

  test('silently ignores non-string input', () => {
    bridge.processSessionDigest(123);
    expect(bridge._reinforceHeuristics).not.toHaveBeenCalled();
  });

  test('extracts AN_KE heuristic IDs', (done) => {
    bridge._queueReinforcement = jest.fn();
    bridge.processSessionDigest('Applied AN_KE_001 for boundary validation');
    setImmediate(() => {
      expect(bridge._queueReinforcement).toHaveBeenCalledWith(['AN_KE_001']);
      done();
    });
  });

  test('extracts PV_PA heuristic IDs', (done) => {
    bridge._queueReinforcement = jest.fn();
    bridge.processSessionDigest('Used PV_PA_004 and PV_PA_010');
    setImmediate(() => {
      expect(bridge._queueReinforcement).toHaveBeenCalledWith(['PV_PA_004', 'PV_PA_010']);
      done();
    });
  });

  test('extracts multiple mixed-prefix IDs', (done) => {
    bridge._queueReinforcement = jest.fn();
    bridge.processSessionDigest('AN_KE_001 PV_PA_004 SC_HE_002 PV_BS_001');
    setImmediate(() => {
      expect(bridge._queueReinforcement).toHaveBeenCalledWith([
        'AN_KE_001',
        'PV_PA_004',
        'SC_HE_002',
        'PV_BS_001',
      ]);
      done();
    });
  });

  test('deduplicates repeated IDs', (done) => {
    bridge._queueReinforcement = jest.fn();
    bridge.processSessionDigest('AN_KE_001 was used. AN_KE_001 again. PV_PA_004.');
    setImmediate(() => {
      expect(bridge._queueReinforcement).toHaveBeenCalledWith(['AN_KE_001', 'PV_PA_004']);
      done();
    });
  });

  test('does not call reinforce when digest has no heuristic IDs', (done) => {
    bridge._queueReinforcement = jest.fn();
    bridge.processSessionDigest('This is a normal session with no heuristic references.');
    setImmediate(() => {
      expect(bridge._queueReinforcement).not.toHaveBeenCalled();
      done();
    });
  });

  test('regex matches PV_PM_001 from registry/fallback', (done) => {
    const bridge2 = new MemoryBridge();
    bridge2._queueReinforcement = jest.fn();
    bridge2.processSessionDigest('PV_PM_001');
    setImmediate(() => {
      expect(bridge2._queueReinforcement).toHaveBeenCalled();
      bridge2._reset();
      done();
    });
  });

  test('batches multiple digests into single _reinforceHeuristics call', () => {
    jest.useFakeTimers();
    const batchBridge = new MemoryBridge();
    batchBridge._reinforceHeuristics = jest.fn();

    batchBridge._queueReinforcement(['AN_KE_001']);
    batchBridge._queueReinforcement(['PV_PA_004', 'AN_KE_001']);

    expect(batchBridge._reinforceHeuristics).not.toHaveBeenCalled();

    jest.advanceTimersByTime(5100);

    expect(batchBridge._reinforceHeuristics).toHaveBeenCalledTimes(1);
    const batchedIds = batchBridge._reinforceHeuristics.mock.calls[0][0];
    expect(batchedIds).toContain('AN_KE_001');
    expect(batchedIds).toContain('PV_PA_004');
    expect(batchedIds.length).toBe(2);

    batchBridge._reset();
    jest.useRealTimers();
  });

  test('exports cold timeout constant', () => {
    expect(BRIDGE_TIMEOUT_COLD_MS).toBe(150);
  });
});

describe('reinforce-heuristic worker assets', () => {
  const HINTS_PATH = path.join(
    __dirname,
    '..',
    '..',
    '.aiox-core',
    'governance',
    'global-heuristic-hints.yaml',
  );

  test('global heuristic hints file exists', () => {
    expect(fs.existsSync(HINTS_PATH)).toBe(true);
  });

  test('hints file contains heuristic entries with valid ID format', () => {
    const content = fs.readFileSync(HINTS_PATH, 'utf8');
    const ids = content.match(/[A-Z]{2,4}_[A-Z]{2,3}_\d{3}/g) || [];
    expect(ids.length).toBeGreaterThan(0);
  });

  test('worker script exists', () => {
    const workerPath = path.join(
      __dirname,
      '..',
      '..',
      '.aiox-core',
      'scripts',
      'reinforce-heuristic.js',
    );
    expect(fs.existsSync(workerPath)).toBe(true);
  });
});
