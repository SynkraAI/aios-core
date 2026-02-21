/**
 * Unit tests for circuit-breaker module
 *
 * Tests the CircuitBreaker pattern implementation with
 * CLOSED, OPEN, and HALF_OPEN states.
 */

const {
  CircuitBreaker,
  STATE_CLOSED,
  STATE_OPEN,
  STATE_HALF_OPEN,
  DEFAULT_FAILURE_THRESHOLD,
  DEFAULT_SUCCESS_THRESHOLD,
  DEFAULT_RESET_TIMEOUT_MS,
} = require('../../../.aios-core/core/ids/circuit-breaker');

describe('CircuitBreaker', () => {
  let breaker;

  beforeEach(() => {
    breaker = new CircuitBreaker();
  });

  // ============================================================
  // Constants
  // ============================================================
  describe('constants', () => {
    test('state constants are defined', () => {
      expect(STATE_CLOSED).toBe('CLOSED');
      expect(STATE_OPEN).toBe('OPEN');
      expect(STATE_HALF_OPEN).toBe('HALF_OPEN');
    });

    test('default thresholds are defined', () => {
      expect(DEFAULT_FAILURE_THRESHOLD).toBe(5);
      expect(DEFAULT_SUCCESS_THRESHOLD).toBe(3);
      expect(DEFAULT_RESET_TIMEOUT_MS).toBe(60000);
    });
  });

  // ============================================================
  // Constructor
  // ============================================================
  describe('constructor', () => {
    test('starts in CLOSED state', () => {
      expect(breaker.getState()).toBe(STATE_CLOSED);
    });

    test('uses default thresholds', () => {
      const stats = breaker.getStats();
      expect(stats.failureCount).toBe(0);
      expect(stats.successCount).toBe(0);
      expect(stats.totalTrips).toBe(0);
    });

    test('accepts custom options', () => {
      const custom = new CircuitBreaker({
        failureThreshold: 3,
        successThreshold: 2,
        resetTimeoutMs: 30000,
      });
      // Trip it to verify custom threshold
      for (let i = 0; i < 3; i++) custom.recordFailure();
      expect(custom.getState()).toBe(STATE_OPEN);
    });
  });

  // ============================================================
  // isAllowed
  // ============================================================
  describe('isAllowed', () => {
    test('allows requests when CLOSED', () => {
      expect(breaker.isAllowed()).toBe(true);
    });

    test('blocks requests when OPEN', () => {
      // Trip the breaker
      for (let i = 0; i < 5; i++) breaker.recordFailure();
      expect(breaker.getState()).toBe(STATE_OPEN);
      expect(breaker.isAllowed()).toBe(false);
    });

    test('transitions to HALF_OPEN after reset timeout', () => {
      for (let i = 0; i < 5; i++) breaker.recordFailure();
      expect(breaker.getState()).toBe(STATE_OPEN);

      // Simulate timeout passing
      breaker._lastFailureTime = Date.now() - 61000;

      expect(breaker.isAllowed()).toBe(true);
      expect(breaker.getState()).toBe(STATE_HALF_OPEN);
    });

    test('allows one probe in HALF_OPEN', () => {
      breaker._state = STATE_HALF_OPEN;
      breaker._halfOpenProbeInFlight = false;

      expect(breaker.isAllowed()).toBe(true);
      expect(breaker.isAllowed()).toBe(false); // second request blocked
    });
  });

  // ============================================================
  // recordSuccess
  // ============================================================
  describe('recordSuccess', () => {
    test('resets failure count in CLOSED state', () => {
      breaker.recordFailure();
      breaker.recordFailure();
      expect(breaker.getStats().failureCount).toBe(2);

      breaker.recordSuccess();
      expect(breaker.getStats().failureCount).toBe(0);
    });

    test('counts successes in HALF_OPEN', () => {
      breaker._state = STATE_HALF_OPEN;
      breaker._halfOpenProbeInFlight = true;

      breaker.recordSuccess();
      expect(breaker.getStats().successCount).toBe(1);
    });

    test('closes circuit after success threshold in HALF_OPEN', () => {
      breaker._state = STATE_HALF_OPEN;

      for (let i = 0; i < 3; i++) {
        breaker._halfOpenProbeInFlight = true;
        breaker.recordSuccess();
      }

      expect(breaker.getState()).toBe(STATE_CLOSED);
      expect(breaker.getStats().failureCount).toBe(0);
      expect(breaker.getStats().successCount).toBe(0);
    });
  });

  // ============================================================
  // recordFailure
  // ============================================================
  describe('recordFailure', () => {
    test('increments failure count', () => {
      breaker.recordFailure();
      expect(breaker.getStats().failureCount).toBe(1);
    });

    test('opens circuit at threshold', () => {
      for (let i = 0; i < 4; i++) breaker.recordFailure();
      expect(breaker.getState()).toBe(STATE_CLOSED);

      breaker.recordFailure(); // 5th failure
      expect(breaker.getState()).toBe(STATE_OPEN);
    });

    test('increments totalTrips when opening', () => {
      for (let i = 0; i < 5; i++) breaker.recordFailure();
      expect(breaker.getStats().totalTrips).toBe(1);
    });

    test('re-opens circuit from HALF_OPEN on failure', () => {
      breaker._state = STATE_HALF_OPEN;
      breaker._halfOpenProbeInFlight = true;

      breaker.recordFailure();

      expect(breaker.getState()).toBe(STATE_OPEN);
      expect(breaker.getStats().totalTrips).toBe(1);
    });

    test('records lastFailureTime', () => {
      const before = Date.now();
      breaker.recordFailure();
      const after = Date.now();

      expect(breaker.getStats().lastFailureTime).toBeGreaterThanOrEqual(before);
      expect(breaker.getStats().lastFailureTime).toBeLessThanOrEqual(after);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    test('returns complete stats object', () => {
      const stats = breaker.getStats();

      expect(stats).toHaveProperty('state');
      expect(stats).toHaveProperty('failureCount');
      expect(stats).toHaveProperty('successCount');
      expect(stats).toHaveProperty('totalTrips');
      expect(stats).toHaveProperty('lastFailureTime');
    });

    test('lastFailureTime is null initially', () => {
      expect(breaker.getStats().lastFailureTime).toBeNull();
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    test('resets to CLOSED state', () => {
      for (let i = 0; i < 5; i++) breaker.recordFailure();
      expect(breaker.getState()).toBe(STATE_OPEN);

      breaker.reset();

      expect(breaker.getState()).toBe(STATE_CLOSED);
      expect(breaker.getStats().failureCount).toBe(0);
      expect(breaker.getStats().successCount).toBe(0);
    });
  });

  // ============================================================
  // Full lifecycle
  // ============================================================
  describe('full lifecycle', () => {
    test('CLOSED -> OPEN -> HALF_OPEN -> CLOSED', () => {
      // 1. Start CLOSED
      expect(breaker.getState()).toBe(STATE_CLOSED);

      // 2. Trip to OPEN
      for (let i = 0; i < 5; i++) breaker.recordFailure();
      expect(breaker.getState()).toBe(STATE_OPEN);

      // 3. Wait and transition to HALF_OPEN
      breaker._lastFailureTime = Date.now() - 61000;
      breaker.isAllowed();
      expect(breaker.getState()).toBe(STATE_HALF_OPEN);

      // 4. Success probe closes circuit
      breaker.recordSuccess();
      breaker._halfOpenProbeInFlight = true;
      breaker.recordSuccess();
      breaker._halfOpenProbeInFlight = true;
      breaker.recordSuccess();
      expect(breaker.getState()).toBe(STATE_CLOSED);
    });

    test('CLOSED -> OPEN -> HALF_OPEN -> OPEN (failure in half-open)', () => {
      for (let i = 0; i < 5; i++) breaker.recordFailure();
      breaker._lastFailureTime = Date.now() - 61000;
      breaker.isAllowed(); // HALF_OPEN

      breaker.recordFailure(); // re-opens
      expect(breaker.getState()).toBe(STATE_OPEN);
      expect(breaker.getStats().totalTrips).toBe(2);
    });
  });
});
