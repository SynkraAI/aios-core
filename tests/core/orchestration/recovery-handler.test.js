/**
 * Unit tests for recovery-handler module
 *
 * Tests the RecoveryHandler class that manages automatic error recovery
 * for the orchestration pipeline with multiple strategies.
 */

jest.mock('fs-extra');

const fs = require('fs-extra');

const {
  RecoveryHandler,
  RecoveryStrategy,
  RecoveryResult,
} = require('../../../.aios-core/core/orchestration/recovery-handler');

describe('RecoveryHandler', () => {
  let handler;

  beforeEach(() => {
    jest.resetAllMocks();
    fs.ensureDir.mockResolvedValue(undefined);
    fs.writeJson.mockResolvedValue(undefined);
    handler = new RecoveryHandler({
      projectRoot: '/project',
      storyId: 'story-1',
      maxRetries: 3,
    });
  });

  // ============================================================
  // Exports & Constants
  // ============================================================
  describe('exports', () => {
    test('exports RecoveryStrategy enum', () => {
      expect(RecoveryStrategy.RETRY_SAME_APPROACH).toBe('retry_same_approach');
      expect(RecoveryStrategy.ROLLBACK_AND_RETRY).toBe('rollback_and_retry');
      expect(RecoveryStrategy.SKIP_PHASE).toBe('skip_phase');
      expect(RecoveryStrategy.ESCALATE_TO_HUMAN).toBe('escalate_to_human');
      expect(RecoveryStrategy.TRIGGER_RECOVERY_WORKFLOW).toBe('trigger_recovery_workflow');
    });

    test('exports RecoveryResult enum', () => {
      expect(RecoveryResult.SUCCESS).toBe('success');
      expect(RecoveryResult.FAILED).toBe('failed');
      expect(RecoveryResult.ESCALATED).toBe('escalated');
      expect(RecoveryResult.SKIPPED).toBe('skipped');
    });
  });

  // ============================================================
  // Constructor
  // ============================================================
  describe('constructor', () => {
    test('sets defaults correctly', () => {
      expect(handler.projectRoot).toBe('/project');
      expect(handler.storyId).toBe('story-1');
      expect(handler.maxRetries).toBe(3);
      expect(handler.autoEscalate).toBe(true);
      expect(handler.circularDetection).toBe(true);
      expect(handler.attempts).toEqual({});
      expect(handler.logs).toEqual([]);
    });

    test('uses process.cwd when no projectRoot', () => {
      const h = new RecoveryHandler();
      expect(h.projectRoot).toBe(process.cwd());
    });

    test('respects custom options', () => {
      const h = new RecoveryHandler({
        maxRetries: 5,
        autoEscalate: false,
        circularDetection: false,
      });
      expect(h.maxRetries).toBe(5);
      expect(h.autoEscalate).toBe(false);
      expect(h.circularDetection).toBe(false);
    });

    test('extends EventEmitter', () => {
      expect(typeof handler.on).toBe('function');
      expect(typeof handler.emit).toBe('function');
    });
  });

  // ============================================================
  // _classifyError
  // ============================================================
  describe('error classification', () => {
    test('classifies transient errors', () => {
      expect(handler._classifyError('Connection timeout')).toBe('transient');
      expect(handler._classifyError('ECONNREFUSED')).toBe('transient');
      expect(handler._classifyError('ETIMEDOUT error')).toBe('transient');
      expect(handler._classifyError('Network unreachable')).toBe('transient');
      expect(handler._classifyError('fetch request failed')).toBe('transient');
    });

    test('classifies state errors', () => {
      expect(handler._classifyError('State corrupted')).toBe('state');
      expect(handler._classifyError('Inconsistent data')).toBe('state');
      expect(handler._classifyError('Invalid state detected')).toBe('state');
      expect(handler._classifyError('Out of sync')).toBe('state');
    });

    test('classifies configuration errors', () => {
      expect(handler._classifyError('Config missing')).toBe('configuration');
      expect(handler._classifyError('env not set')).toBe('configuration');
      expect(handler._classifyError('Missing config file')).toBe('configuration');
    });

    test('classifies dependency errors', () => {
      expect(handler._classifyError('Cannot find module')).toBe('dependency');
      expect(handler._classifyError('Module not found')).toBe('dependency');
      expect(handler._classifyError('Package not found')).toBe('dependency');
    });

    test('classifies fatal errors', () => {
      expect(handler._classifyError('Fatal error occurred')).toBe('fatal');
      expect(handler._classifyError('Critical failure')).toBe('fatal');
      expect(handler._classifyError('Out of memory')).toBe('fatal');
      expect(handler._classifyError('Heap overflow')).toBe('fatal');
    });

    test('returns unknown for unrecognized errors', () => {
      expect(handler._classifyError('Something went wrong')).toBe('unknown');
      expect(handler._classifyError('')).toBe('unknown');
    });
  });

  // ============================================================
  // _isEpicCritical
  // ============================================================
  describe('epic criticality', () => {
    test('epic 3 and 4 are critical', () => {
      expect(handler._isEpicCritical(3)).toBe(true);
      expect(handler._isEpicCritical(4)).toBe(true);
    });

    test('other epics are not critical', () => {
      expect(handler._isEpicCritical(1)).toBe(false);
      expect(handler._isEpicCritical(5)).toBe(false);
      expect(handler._isEpicCritical(6)).toBe(false);
    });
  });

  // ============================================================
  // _getEpicName
  // ============================================================
  describe('epic names', () => {
    test('returns known epic names', () => {
      expect(handler._getEpicName(3)).toBe('Spec Pipeline');
      expect(handler._getEpicName(4)).toBe('Execution Engine');
      expect(handler._getEpicName(5)).toBe('Recovery System');
      expect(handler._getEpicName(6)).toBe('QA Loop');
      expect(handler._getEpicName(7)).toBe('Memory Layer');
    });

    test('returns fallback for unknown epics', () => {
      expect(handler._getEpicName(99)).toBe('Epic 99');
    });
  });

  // ============================================================
  // _selectRecoveryStrategy
  // ============================================================
  describe('strategy selection', () => {
    test('escalates after max retries with autoEscalate', () => {
      handler.attempts[3] = [{}, {}, {}]; // 3 attempts = maxRetries
      const strategy = handler._selectRecoveryStrategy(3, 'error', { stuck: false });
      expect(strategy).toBe(RecoveryStrategy.ESCALATE_TO_HUMAN);
    });

    test('does not escalate after max retries without autoEscalate', () => {
      handler.autoEscalate = false;
      handler.attempts[3] = [{}, {}, {}];
      const strategy = handler._selectRecoveryStrategy(3, 'error', { stuck: false });
      expect(strategy).not.toBe(RecoveryStrategy.ESCALATE_TO_HUMAN);
    });

    test('rollback on circular approach detection', () => {
      handler.attempts[3] = [{}];
      const strategy = handler._selectRecoveryStrategy(3, 'error', {
        stuck: true, reason: 'circular approach detected',
      });
      expect(strategy).toBe(RecoveryStrategy.ROLLBACK_AND_RETRY);
    });

    test('retry on transient error', () => {
      handler.attempts[3] = [{}];
      const strategy = handler._selectRecoveryStrategy(3, 'Connection timeout', { stuck: false });
      expect(strategy).toBe(RecoveryStrategy.RETRY_SAME_APPROACH);
    });

    test('rollback on state error', () => {
      handler.attempts[3] = [{}];
      const strategy = handler._selectRecoveryStrategy(3, 'State corrupted', { stuck: false });
      expect(strategy).toBe(RecoveryStrategy.ROLLBACK_AND_RETRY);
    });

    test('skip on config error for non-critical epic', () => {
      handler.attempts[6] = [{}];
      const strategy = handler._selectRecoveryStrategy(6, 'Config missing', { stuck: false });
      expect(strategy).toBe(RecoveryStrategy.SKIP_PHASE);
    });

    test('escalates on config error for critical epic', () => {
      handler.attempts[3] = [{}];
      const strategy = handler._selectRecoveryStrategy(3, 'Config missing', { stuck: false });
      expect(strategy).toBe(RecoveryStrategy.ESCALATE_TO_HUMAN);
    });

    test('trigger recovery workflow on dependency error', () => {
      handler.attempts[3] = [{}];
      const strategy = handler._selectRecoveryStrategy(3, 'Cannot find module', { stuck: false });
      expect(strategy).toBe(RecoveryStrategy.TRIGGER_RECOVERY_WORKFLOW);
    });

    test('escalates on fatal error', () => {
      handler.attempts[3] = [{}];
      const strategy = handler._selectRecoveryStrategy(3, 'Fatal error', { stuck: false });
      expect(strategy).toBe(RecoveryStrategy.ESCALATE_TO_HUMAN);
    });

    test('retry on unknown error first attempt', () => {
      handler.attempts[3] = [{}]; // 1 attempt
      const strategy = handler._selectRecoveryStrategy(3, 'weird error', { stuck: false });
      expect(strategy).toBe(RecoveryStrategy.RETRY_SAME_APPROACH);
    });

    test('rollback on unknown error after 2 attempts', () => {
      handler.attempts[3] = [{}, {}]; // 2 attempts
      const strategy = handler._selectRecoveryStrategy(3, 'weird error', { stuck: false });
      expect(strategy).toBe(RecoveryStrategy.ROLLBACK_AND_RETRY);
    });
  });

  // ============================================================
  // handleEpicFailure
  // ============================================================
  describe('handleEpicFailure', () => {
    test('returns result with retry for transient error', async () => {
      const result = await handler.handleEpicFailure(3, 'Connection timeout');

      expect(result.epicNum).toBe(3);
      expect(result.strategy).toBe(RecoveryStrategy.RETRY_SAME_APPROACH);
      expect(result.shouldRetry).toBe(true);
      expect(result.success).toBe(true);
    });

    test('tracks attempts per epic', async () => {
      await handler.handleEpicFailure(3, 'error 1');
      await handler.handleEpicFailure(3, 'error 2');
      await handler.handleEpicFailure(4, 'error 3');

      expect(handler.attempts[3]).toHaveLength(2);
      expect(handler.attempts[4]).toHaveLength(1);
    });

    test('accepts Error objects', async () => {
      const result = await handler.handleEpicFailure(3, new Error('Connection timeout'));

      expect(result.strategy).toBe(RecoveryStrategy.RETRY_SAME_APPROACH);
    });

    test('emits recoveryAttempt event', async () => {
      const events = [];
      handler.on('recoveryAttempt', (e) => events.push(e));

      await handler.handleEpicFailure(3, 'timeout');

      expect(events).toHaveLength(1);
      expect(events[0].epicNum).toBe(3);
      expect(events[0].attempt).toBe(1);
    });

    test('escalates after max retries', async () => {
      await handler.handleEpicFailure(3, 'error 1');
      await handler.handleEpicFailure(3, 'error 2');
      const result = await handler.handleEpicFailure(3, 'error 3');

      expect(result.strategy).toBe(RecoveryStrategy.ESCALATE_TO_HUMAN);
      expect(result.escalated).toBe(true);
      expect(result.success).toBe(false);
    });

    test('records approach in attempt context', async () => {
      await handler.handleEpicFailure(3, 'error', { approach: 'tdd' });

      expect(handler.attempts[3][0].approach).toBe('tdd');
    });

    test('records recovery result in attempt', async () => {
      await handler.handleEpicFailure(3, 'Connection timeout');

      expect(handler.attempts[3][0].recoveryStrategy).toBe(RecoveryStrategy.RETRY_SAME_APPROACH);
      expect(handler.attempts[3][0].recoveryResult).toBe(RecoveryResult.SUCCESS);
    });
  });

  // ============================================================
  // _executeRecoveryStrategy
  // ============================================================
  describe('strategy execution', () => {
    test('RETRY_SAME_APPROACH sets shouldRetry', async () => {
      const result = await handler._executeRecoveryStrategy(
        3, RecoveryStrategy.RETRY_SAME_APPROACH, 'error', {},
      );
      expect(result.shouldRetry).toBe(true);
      expect(result.success).toBe(true);
      expect(result.newApproach).toBe(false);
    });

    test('ROLLBACK_AND_RETRY sets shouldRetry and newApproach', async () => {
      const result = await handler._executeRecoveryStrategy(
        3, RecoveryStrategy.ROLLBACK_AND_RETRY, 'error', {},
      );
      expect(result.shouldRetry).toBe(true);
      expect(result.newApproach).toBe(true);
      expect(result.success).toBe(true);
    });

    test('SKIP_PHASE sets skipped flag', async () => {
      const result = await handler._executeRecoveryStrategy(
        6, RecoveryStrategy.SKIP_PHASE, 'error', {},
      );
      expect(result.skipped).toBe(true);
      expect(result.success).toBe(true);
    });

    test('ESCALATE_TO_HUMAN sets escalated and saves report', async () => {
      const result = await handler._executeRecoveryStrategy(
        3, RecoveryStrategy.ESCALATE_TO_HUMAN, 'fatal error', {},
      );
      expect(result.escalated).toBe(true);
      expect(result.success).toBe(false);
      expect(fs.writeJson).toHaveBeenCalled();
    });

    test('TRIGGER_RECOVERY_WORKFLOW with orchestrator', async () => {
      handler.orchestrator = {
        executeEpic: jest.fn().mockResolvedValue({ success: true, shouldRetry: true }),
      };

      const result = await handler._executeRecoveryStrategy(
        3, RecoveryStrategy.TRIGGER_RECOVERY_WORKFLOW, 'dep error', {},
      );
      expect(result.success).toBe(true);
      expect(result.shouldRetry).toBe(true);
      expect(handler.orchestrator.executeEpic).toHaveBeenCalledWith(5, expect.anything());
    });

    test('TRIGGER_RECOVERY_WORKFLOW without orchestrator', async () => {
      const result = await handler._executeRecoveryStrategy(
        3, RecoveryStrategy.TRIGGER_RECOVERY_WORKFLOW, 'dep error', {},
      );
      expect(result.success).toBe(false);
      expect(result.shouldRetry).toBe(false);
    });

    test('TRIGGER_RECOVERY_WORKFLOW handles orchestrator error', async () => {
      handler.orchestrator = {
        executeEpic: jest.fn().mockRejectedValue(new Error('workflow failed')),
      };

      const result = await handler._executeRecoveryStrategy(
        3, RecoveryStrategy.TRIGGER_RECOVERY_WORKFLOW, 'dep error', {},
      );
      expect(result.success).toBe(false);
    });

    test('unknown strategy logs error', async () => {
      const result = await handler._executeRecoveryStrategy(
        3, 'invalid_strategy', 'error', {},
      );
      expect(result.success).toBe(false);
      expect(result.details.message).toContain('Unknown strategy');
    });

    test('catches errors during strategy execution', async () => {
      handler.orchestrator = {
        // Force an error in ESCALATE by providing a bad orchestrator._log
        _log: jest.fn(),
      };

      // Mock fs to throw during escalation report save
      fs.ensureDir.mockRejectedValueOnce(new Error('disk full'));

      const result = await handler._executeRecoveryStrategy(
        3, RecoveryStrategy.ESCALATE_TO_HUMAN, 'error', {},
      );
      expect(result.success).toBe(false);
      expect(result.details.error).toContain('disk full');
    });
  });

  // ============================================================
  // _escalateToHuman
  // ============================================================
  describe('escalation', () => {
    test('generates escalation report with suggestions', async () => {
      const events = [];
      handler.on('escalation', (e) => events.push(e));
      handler.attempts[3] = [{ approach: 'default', error: 'timeout' }];

      await handler._escalateToHuman(3, 'Connection timeout', {});

      expect(events).toHaveLength(1);
      expect(events[0].storyId).toBe('story-1');
      expect(events[0].epicNum).toBe(3);
      expect(events[0].epicName).toBe('Spec Pipeline');
      expect(events[0].suggestions).toBeDefined();
      expect(events[0].suggestions.length).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // _generateSuggestions
  // ============================================================
  describe('suggestions', () => {
    test('generates transient error suggestions', () => {
      const suggestions = handler._generateSuggestions(3, 'Connection timeout');
      expect(suggestions).toContain('Check network connectivity');
    });

    test('generates state error suggestions', () => {
      const suggestions = handler._generateSuggestions(3, 'State corrupted');
      expect(suggestions).toContain('Check for conflicting changes');
    });

    test('generates config error suggestions', () => {
      const suggestions = handler._generateSuggestions(3, 'Config missing');
      expect(suggestions).toContain('Verify all required environment variables are set');
    });

    test('generates dependency error suggestions', () => {
      const suggestions = handler._generateSuggestions(3, 'Cannot find module');
      expect(suggestions).toContain('Run npm install to ensure all dependencies are installed');
    });

    test('generates unknown error suggestions', () => {
      const suggestions = handler._generateSuggestions(3, 'random error');
      expect(suggestions).toContain('Review error logs for more details');
    });
  });

  // ============================================================
  // Attempt tracking and helpers
  // ============================================================
  describe('attempt tracking', () => {
    test('getAttemptCount returns 0 for new epic', () => {
      expect(handler.getAttemptCount(3)).toBe(0);
    });

    test('getAttemptCount increments', async () => {
      await handler.handleEpicFailure(3, 'error 1');
      await handler.handleEpicFailure(3, 'error 2');
      expect(handler.getAttemptCount(3)).toBe(2);
    });

    test('canRetry returns true when under max', () => {
      expect(handler.canRetry(3)).toBe(true);
    });

    test('canRetry returns false at max retries', async () => {
      await handler.handleEpicFailure(3, 'e1');
      await handler.handleEpicFailure(3, 'e2');
      await handler.handleEpicFailure(3, 'e3');
      expect(handler.canRetry(3)).toBe(false);
    });

    test('resetAttempts clears attempts for epic', async () => {
      await handler.handleEpicFailure(3, 'error');
      handler.resetAttempts(3);
      expect(handler.getAttemptCount(3)).toBe(0);
      expect(handler.canRetry(3)).toBe(true);
    });

    test('getAttemptHistory returns copy', async () => {
      await handler.handleEpicFailure(3, 'error');
      const history = handler.getAttemptHistory();
      history[99] = [];
      expect(handler.attempts[99]).toBeUndefined();
    });
  });

  // ============================================================
  // Logging
  // ============================================================
  describe('logging', () => {
    test('getLogs returns copy of all logs', async () => {
      await handler.handleEpicFailure(3, 'Connection timeout');

      const logs = handler.getLogs();
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0]).toHaveProperty('timestamp');
      expect(logs[0]).toHaveProperty('level');
      expect(logs[0]).toHaveProperty('message');

      logs.push({ fake: true });
      expect(handler.getLogs()).not.toContainEqual({ fake: true });
    });

    test('getEpicLogs filters by epic number', async () => {
      await handler.handleEpicFailure(3, 'error');
      await handler.handleEpicFailure(4, 'error');

      const epic3Logs = handler.getEpicLogs(3);
      const epic4Logs = handler.getEpicLogs(4);

      expect(epic3Logs.length).toBeGreaterThan(0);
      expect(epic4Logs.length).toBeGreaterThan(0);
      for (const log of epic3Logs) {
        expect(log.message).toMatch(/Epic 3|epic-3/);
      }
    });

    test('logs to orchestrator when available', async () => {
      const mockLog = jest.fn();
      handler.orchestrator = { _log: mockLog };

      await handler.handleEpicFailure(3, 'error');
      expect(mockLog).toHaveBeenCalled();
    });
  });

  // ============================================================
  // clear
  // ============================================================
  describe('clear', () => {
    test('resets attempts and logs', async () => {
      await handler.handleEpicFailure(3, 'error');

      handler.clear();

      expect(handler.attempts).toEqual({});
      expect(handler.logs).toEqual([]);
    });
  });
});
