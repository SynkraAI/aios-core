'use strict';

/**
 * Unit tests for CircuitBreaker
 *
 * Covers the three-state machine (CLOSED → OPEN → HALF_OPEN → CLOSED),
 * threshold logic, probe tracking, stats, reset, and edge cases.
 *
 * Fixes #469
 */

const {
  CircuitBreaker,
  STATE_CLOSED,
  STATE_OPEN,
  STATE_HALF_OPEN,
  DEFAULT_FAILURE_THRESHOLD,
  DEFAULT_SUCCESS_THRESHOLD,
  DEFAULT_RESET_TIMEOUT_MS,
} = require('../../../.aiox-core/core/ids/circuit-breaker');

describe('CircuitBreaker', () => {
  // ── Exports ──────────────────────────────────────────────────────

  describe('exports', () => {
    test('exports state constants', () => {
      expect(STATE_CLOSED).toBe('CLOSED');
      expect(STATE_OPEN).toBe('OPEN');
      expect(STATE_HALF_OPEN).toBe('HALF_OPEN');
    });

    test('exports default thresholds', () => {
      expect(DEFAULT_FAILURE_THRESHOLD).toBe(5);
      expect(DEFAULT_SUCCESS_THRESHOLD).toBe(3);
      expect(DEFAULT_RESET_TIMEOUT_MS).toBe(60000);
    });
  });

  // ── Constructor ───────────────────────────────────────────────────

  describe('constructor', () => {
    test('initializes in CLOSED state', () => {
      const cb = new CircuitBreaker();
      expect(cb.getState()).toBe(STATE_CLOSED);
    });

    test('defaults to predefined thresholds', () => {
      const cb = new CircuitBreaker();
      expect(cb._failureThreshold).toBe(DEFAULT_FAILURE_THRESHOLD);
      expect(cb._successThreshold).toBe(DEFAULT_SUCCESS_THRESHOLD);
      expect(cb._resetTimeoutMs).toBe(DEFAULT_RESET_TIMEOUT_MS);
    });

    test('accepts custom thresholds', () => {
      const cb = new CircuitBreaker({ failureThreshold: 3, successThreshold: 2, resetTimeoutMs: 5000 });
      expect(cb._failureThreshold).toBe(3);
      expect(cb._successThreshold).toBe(2);
      expect(cb._resetTimeoutMs).toBe(5000);
    });

    test('starts with zero counters', () => {
      const cb = new CircuitBreaker();
      const stats = cb.getStats();
      expect(stats.failureCount).toBe(0);
      expect(stats.successCount).toBe(0);
      expect(stats.totalTrips).toBe(0);
      expect(stats.lastFailureTime).toBeNull();
    });
  });

  // ── CLOSED state ──────────────────────────────────────────────────

  describe('CLOSED state', () => {
    let cb;

    beforeEach(() => {
      cb = new CircuitBreaker({ failureThreshold: 3, successThreshold: 2, resetTimeoutMs: 1000 });
    });

    test('isAllowed returns true when closed', () => {
      expect(cb.isAllowed()).toBe(true);
    });

    test('recordSuccess in CLOSED resets failure count', () => {
      cb.recordFailure();
      cb.recordFailure();
      cb.recordSuccess();
      expect(cb._failureCount).toBe(0);
      expect(cb.getState()).toBe(STATE_CLOSED);
    });

    test('opens circuit after reaching failureThreshold', () => {
      cb.recordFailure();
      cb.recordFailure();
      expect(cb.getState()).toBe(STATE_CLOSED);
      cb.recordFailure(); // hits threshold
      expect(cb.getState()).toBe(STATE_OPEN);
    });

    test('increments totalTrips on opening', () => {
      cb.recordFailure(); cb.recordFailure(); cb.recordFailure();
      expect(cb.getStats().totalTrips).toBe(1);
    });

    test('failure below threshold keeps circuit closed', () => {
      cb.recordFailure();
      cb.recordFailure();
      expect(cb.getState()).toBe(STATE_CLOSED);
      expect(cb.isAllowed()).toBe(true);
    });

    test('success resets failures so threshold requires fresh consecutive fails', () => {
      cb.recordFailure();
      cb.recordFailure();
      cb.recordSuccess(); // resets failureCount to 0
      cb.recordFailure();
      cb.recordFailure();
      expect(cb.getState()).toBe(STATE_CLOSED); // still needs one more
      cb.recordFailure();
      expect(cb.getState()).toBe(STATE_OPEN);
    });
  });

  // ── OPEN state ────────────────────────────────────────────────────

  describe('OPEN state', () => {
    let cb;

    beforeEach(() => {
      cb = new CircuitBreaker({ failureThreshold: 1, successThreshold: 1, resetTimeoutMs: 1000 });
      cb.recordFailure(); // opens circuit
    });

    test('isAllowed returns false when open', () => {
      expect(cb.getState()).toBe(STATE_OPEN);
      expect(cb.isAllowed()).toBe(false);
    });

    test('transitions to HALF_OPEN after resetTimeout elapses', () => {
      jest.useFakeTimers();
      try {
        const cb2 = new CircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 1000 });
        cb2.recordFailure();

        jest.advanceTimersByTime(999);
        expect(cb2.isAllowed()).toBe(false);

        jest.advanceTimersByTime(2);
        expect(cb2.isAllowed()).toBe(true);
        expect(cb2.getState()).toBe(STATE_HALF_OPEN);
      } finally {
        jest.useRealTimers();
      }
    });

    test('resets successCount to 0 on OPEN→HALF_OPEN transition', () => {
      jest.useFakeTimers();
      try {
        const cb2 = new CircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 500 });
        cb2.recordFailure();
        jest.advanceTimersByTime(600);
        cb2.isAllowed(); // triggers transition
        expect(cb2._successCount).toBe(0);
      } finally {
        jest.useRealTimers();
      }
    });

    // ── BUG #469 regression test ───────────────────────────────────
    test('recordFailure in OPEN state does NOT reset the recovery timeout (fix #469)', () => {
      jest.useFakeTimers();
      try {
        const cb2 = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 1000 });
        cb2.recordFailure(); cb2.recordFailure(); cb2.recordFailure(); // open

        // Advance 900ms — still within timeout
        jest.advanceTimersByTime(900);

        // Someone calls recordFailure() while OPEN (should NOT reset timeout)
        cb2.recordFailure();

        // 200ms more = 1100ms total since circuit opened → should be past timeout
        jest.advanceTimersByTime(200);

        // Circuit should transition to HALF_OPEN, NOT stay OPEN
        const allowed = cb2.isAllowed();
        expect(allowed).toBe(true);
        expect(cb2.getState()).toBe(STATE_HALF_OPEN);
      } finally {
        jest.useRealTimers();
      }
    });
  });

  // ── HALF_OPEN state ───────────────────────────────────────────────

  describe('HALF_OPEN state', () => {
    let cb;

    beforeEach(() => {
      jest.useFakeTimers();
      cb = new CircuitBreaker({ failureThreshold: 1, successThreshold: 2, resetTimeoutMs: 500 });
      cb.recordFailure(); // open
      jest.advanceTimersByTime(600); // wait for timeout
      cb.isAllowed(); // transition to HALF_OPEN, first probe allowed
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('allows exactly one probe when entering HALF_OPEN', () => {
      expect(cb.getState()).toBe(STATE_HALF_OPEN);
      // A second call while probe in flight should be rejected
      expect(cb.isAllowed()).toBe(false);
    });

    test('recordFailure in HALF_OPEN re-opens circuit', () => {
      cb.recordFailure();
      expect(cb.getState()).toBe(STATE_OPEN);
    });

    test('recordFailure in HALF_OPEN resets successCount and increments totalTrips', () => {
      const tripsBefore = cb.getStats().totalTrips;
      cb.recordFailure();
      expect(cb._successCount).toBe(0);
      expect(cb.getStats().totalTrips).toBe(tripsBefore + 1);
    });

    test('allows next probe after successful one', () => {
      cb.recordSuccess(); // clears _halfOpenProbeInFlight
      expect(cb._halfOpenProbeInFlight).toBe(false);
      expect(cb.isAllowed()).toBe(true); // next probe allowed
    });

    test('closes circuit after reaching successThreshold', () => {
      cb.recordSuccess(); // success 1 of 2, clears probe
      cb.isAllowed();     // allows next probe
      cb.recordSuccess(); // success 2 of 2 — closes circuit
      expect(cb.getState()).toBe(STATE_CLOSED);
    });

    test('resets failure and success counts on closing', () => {
      cb.recordSuccess();
      cb.isAllowed();
      cb.recordSuccess(); // closes
      expect(cb._failureCount).toBe(0);
      expect(cb._successCount).toBe(0);
    });
  });

  // ── Full cycle ────────────────────────────────────────────────────

  describe('full state machine cycle', () => {
    test('CLOSED → OPEN → HALF_OPEN → CLOSED', () => {
      jest.useFakeTimers();
      try {
        const cb = new CircuitBreaker({
          failureThreshold: 2,
          successThreshold: 2,
          resetTimeoutMs: 1000,
        });

        // Start closed
        expect(cb.getState()).toBe(STATE_CLOSED);

        // Trip to OPEN
        cb.recordFailure(); cb.recordFailure();
        expect(cb.getState()).toBe(STATE_OPEN);
        expect(cb.isAllowed()).toBe(false);

        // Wait for timeout → HALF_OPEN
        jest.advanceTimersByTime(1001);
        expect(cb.isAllowed()).toBe(true);
        expect(cb.getState()).toBe(STATE_HALF_OPEN);

        // Two successes → back to CLOSED
        cb.recordSuccess();
        cb.isAllowed(); // next probe
        cb.recordSuccess();
        expect(cb.getState()).toBe(STATE_CLOSED);

        // Now fully operational
        expect(cb.isAllowed()).toBe(true);
      } finally {
        jest.useRealTimers();
      }
    });

    test('CLOSED → OPEN → HALF_OPEN → OPEN (failure during probe)', () => {
      jest.useFakeTimers();
      try {
        const cb = new CircuitBreaker({ failureThreshold: 2, resetTimeoutMs: 1000 });
        cb.recordFailure(); cb.recordFailure(); // OPEN
        jest.advanceTimersByTime(1001);
        cb.isAllowed(); // HALF_OPEN, probe in flight
        cb.recordFailure(); // probe fails → back to OPEN
        expect(cb.getState()).toBe(STATE_OPEN);
      } finally {
        jest.useRealTimers();
      }
    });
  });

  // ── getStats ──────────────────────────────────────────────────────

  describe('getStats', () => {
    test('returns all diagnostic fields', () => {
      const cb = new CircuitBreaker({ failureThreshold: 3 });
      cb.recordFailure();

      const stats = cb.getStats();

      expect(stats).toHaveProperty('state', STATE_CLOSED);
      expect(stats).toHaveProperty('failureCount', 1);
      expect(stats).toHaveProperty('successCount', 0);
      expect(stats).toHaveProperty('totalTrips', 0);
      expect(stats).toHaveProperty('lastFailureTime');
      expect(typeof stats.lastFailureTime).toBe('number');
    });

    test('lastFailureTime is null before any failure', () => {
      const cb = new CircuitBreaker();
      expect(cb.getStats().lastFailureTime).toBeNull();
    });
  });

  // ── reset ─────────────────────────────────────────────────────────

  describe('reset', () => {
    test('resets all state to initial values', () => {
      const cb = new CircuitBreaker({ failureThreshold: 2, resetTimeoutMs: 1000 });
      cb.recordFailure(); cb.recordFailure(); // OPEN

      cb.reset();

      expect(cb.getState()).toBe(STATE_CLOSED);
      expect(cb.isAllowed()).toBe(true);
      const stats = cb.getStats();
      expect(stats.failureCount).toBe(0);
      expect(stats.successCount).toBe(0);
      expect(stats.lastFailureTime).toBeNull();
    });

    test('clears halfOpenProbeInFlight on reset', () => {
      jest.useFakeTimers();
      try {
        const cb = new CircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 500 });
        cb.recordFailure();
        jest.advanceTimersByTime(600);
        cb.isAllowed(); // HALF_OPEN with probe in flight

        cb.reset();

        expect(cb._halfOpenProbeInFlight).toBe(false);
      } finally {
        jest.useRealTimers();
      }
    });
  });

  // ── recordSuccess in unexpected states ────────────────────────────

  describe('recordSuccess in unexpected states', () => {
    test('recordSuccess in OPEN state is a no-op', () => {
      const cb = new CircuitBreaker({ failureThreshold: 1 });
      cb.recordFailure(); // OPEN
      cb.recordSuccess(); // should do nothing
      expect(cb.getState()).toBe(STATE_OPEN);
    });
  });
});
