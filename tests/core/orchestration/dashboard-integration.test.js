/**
 * Unit tests for dashboard-integration module
 *
 * Tests the DashboardIntegration class that provides real-time
 * orchestrator monitoring with status files, history, and notifications.
 */

jest.mock('fs-extra');
jest.mock('../../../.aios-core/core/events', () => ({
  getDashboardEmitter: () => ({
    emitStoryStatusChange: jest.fn(),
    emitCommandStart: jest.fn(),
    emitCommandComplete: jest.fn(),
    emitCommandError: jest.fn(),
    emitAgentActivated: jest.fn(),
    emitAgentDeactivated: jest.fn(),
  }),
}));

const fs = require('fs-extra');
const { DashboardIntegration, NotificationType } = require('../../../.aios-core/core/orchestration/dashboard-integration');

describe('DashboardIntegration', () => {
  let dashboard;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers();
    fs.ensureDir.mockResolvedValue();
    fs.writeJson.mockResolvedValue();
    dashboard = new DashboardIntegration({ projectRoot: '/project' });
  });

  afterEach(() => {
    dashboard.stop();
    jest.useRealTimers();
  });

  // ============================================================
  // NotificationType
  // ============================================================
  describe('NotificationType', () => {
    test('has all expected types', () => {
      expect(NotificationType.INFO).toBe('info');
      expect(NotificationType.SUCCESS).toBe('success');
      expect(NotificationType.WARNING).toBe('warning');
      expect(NotificationType.ERROR).toBe('error');
      expect(NotificationType.BLOCKED).toBe('blocked');
      expect(NotificationType.COMPLETE).toBe('complete');
    });
  });

  // ============================================================
  // Constructor
  // ============================================================
  describe('constructor', () => {
    test('sets project root', () => {
      expect(dashboard.projectRoot).toBe('/project');
    });

    test('sets dashboard paths', () => {
      expect(dashboard.statusPath).toContain('dashboard');
      expect(dashboard.statusPath).toContain('status.json');
    });

    test('initializes empty state', () => {
      expect(dashboard.history).toEqual([]);
      expect(dashboard.notifications).toEqual([]);
      expect(dashboard.isRunning).toBe(false);
    });

    test('defaults autoUpdate to true', () => {
      expect(dashboard.autoUpdate).toBe(true);
    });

    test('accepts custom options', () => {
      const custom = new DashboardIntegration({
        projectRoot: '/custom',
        autoUpdate: false,
        updateInterval: 10000,
      });
      expect(custom.projectRoot).toBe('/custom');
      expect(custom.autoUpdate).toBe(false);
      expect(custom.updateInterval).toBe(10000);
    });
  });

  // ============================================================
  // start / stop
  // ============================================================
  describe('start / stop', () => {
    test('start creates directories and marks running', async () => {
      await dashboard.start();

      expect(fs.ensureDir).toHaveBeenCalledTimes(2);
      expect(dashboard.isRunning).toBe(true);
    });

    test('start emits started event', async () => {
      const handler = jest.fn();
      dashboard.on('started', handler);

      await dashboard.start();

      expect(handler).toHaveBeenCalled();
    });

    test('start is idempotent', async () => {
      await dashboard.start();
      await dashboard.start();

      // ensureDir should only be called once (from first start)
      expect(fs.ensureDir).toHaveBeenCalledTimes(2);
    });

    test('stop clears timer and marks not running', async () => {
      await dashboard.start();
      dashboard.stop();

      expect(dashboard.isRunning).toBe(false);
      expect(dashboard.updateTimer).toBeNull();
    });

    test('stop emits stopped event', () => {
      const handler = jest.fn();
      dashboard.on('stopped', handler);

      dashboard.stop();

      expect(handler).toHaveBeenCalled();
    });
  });

  // ============================================================
  // updateStatus
  // ============================================================
  describe('updateStatus', () => {
    test('returns undefined when no orchestrator', async () => {
      const result = await dashboard.updateStatus();
      expect(result).toBeUndefined();
    });

    test('writes status to file when orchestrator exists', async () => {
      dashboard.orchestrator = createMockOrchestrator();

      await dashboard.updateStatus();

      expect(fs.writeJson).toHaveBeenCalledWith(
        dashboard.statusPath,
        expect.any(Object),
        { spaces: 2 }
      );
    });

    test('emits statusUpdated event', async () => {
      dashboard.orchestrator = createMockOrchestrator();
      const handler = jest.fn();
      dashboard.on('statusUpdated', handler);

      await dashboard.updateStatus();

      expect(handler).toHaveBeenCalledWith(expect.any(Object));
    });

    test('handles write errors gracefully with error listener', async () => {
      dashboard.orchestrator = createMockOrchestrator();
      fs.writeJson.mockRejectedValue(new Error('write failed'));
      const errorHandler = jest.fn();
      dashboard.on('error', errorHandler);

      await dashboard.updateStatus();

      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'statusUpdate' })
      );
    });

    test('handles write errors with console.warn when no error listener', async () => {
      dashboard.orchestrator = createMockOrchestrator();
      fs.writeJson.mockRejectedValue(new Error('write failed'));
      jest.spyOn(console, 'warn').mockImplementation();

      await dashboard.updateStatus();

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('statusUpdate')
      );
    });
  });

  // ============================================================
  // buildStatus
  // ============================================================
  describe('buildStatus', () => {
    test('returns empty object when no orchestrator', () => {
      expect(dashboard.buildStatus()).toEqual({});
    });

    test('builds status with orchestrator data', () => {
      dashboard.orchestrator = createMockOrchestrator();

      const status = dashboard.buildStatus();

      expect(status.orchestrator).toBeDefined();
      expect(status.orchestrator['story-1']).toBeDefined();
      expect(status.orchestrator['story-1'].status).toBe('running');
      expect(status.orchestrator['story-1'].currentEpic).toBe(3);
    });

    test('includes progress information', () => {
      dashboard.orchestrator = createMockOrchestrator();

      const status = dashboard.buildStatus();
      const storyStatus = status.orchestrator['story-1'];

      expect(storyStatus.progress).toBeDefined();
      expect(storyStatus.progress.overall).toBe(50);
    });

    test('includes history and notifications', () => {
      dashboard.orchestrator = createMockOrchestrator();
      dashboard.addToHistory({ type: 'test' });
      dashboard.addNotification({ type: 'info', title: 'Test' });

      const status = dashboard.buildStatus();
      const storyStatus = status.orchestrator['story-1'];

      expect(storyStatus.history.length).toBe(1);
      expect(storyStatus.notifications.length).toBe(1);
    });

    test('includes logs path', () => {
      dashboard.orchestrator = createMockOrchestrator();

      const status = dashboard.buildStatus();
      const storyStatus = status.orchestrator['story-1'];

      expect(storyStatus.logsPath).toContain('story-1.log');
    });

    test('includes blocked flag', () => {
      const orch = createMockOrchestrator();
      orch.state = 'blocked';
      dashboard.orchestrator = orch;

      const status = dashboard.buildStatus();
      expect(status.orchestrator['story-1'].blocked).toBe(true);
    });
  });

  // ============================================================
  // addToHistory / getHistory
  // ============================================================
  describe('history', () => {
    test('addToHistory adds entry with id', () => {
      dashboard.addToHistory({ type: 'epicComplete', epicNum: 3 });

      expect(dashboard.history).toHaveLength(1);
      expect(dashboard.history[0].id).toMatch(/^hist-/);
      expect(dashboard.history[0].type).toBe('epicComplete');
    });

    test('getHistory returns copy', () => {
      dashboard.addToHistory({ type: 'test' });

      const history = dashboard.getHistory();
      history.push({ type: 'extra' });

      expect(dashboard.history).toHaveLength(1);
    });

    test('getHistoryForEpic filters by epicNum', () => {
      dashboard.addToHistory({ type: 'epicComplete', epicNum: 3 });
      dashboard.addToHistory({ type: 'epicFailed', epicNum: 4 });
      dashboard.addToHistory({ type: 'epicComplete', epicNum: 3 });

      expect(dashboard.getHistoryForEpic(3)).toHaveLength(2);
      expect(dashboard.getHistoryForEpic(4)).toHaveLength(1);
      expect(dashboard.getHistoryForEpic(5)).toHaveLength(0);
    });

    test('history is capped at 100 entries', () => {
      for (let i = 0; i < 110; i++) {
        dashboard.addToHistory({ type: 'test', index: i });
      }

      expect(dashboard.history).toHaveLength(100);
      // Oldest entries should be trimmed
      expect(dashboard.history[0].index).toBe(10);
    });
  });

  // ============================================================
  // Notifications
  // ============================================================
  describe('notifications', () => {
    test('addNotification adds with id and read=false', () => {
      dashboard.addNotification({ type: 'info', title: 'Test' });

      expect(dashboard.notifications).toHaveLength(1);
      expect(dashboard.notifications[0].id).toMatch(/^notif-/);
      expect(dashboard.notifications[0].read).toBe(false);
    });

    test('addNotification emits notification event', () => {
      const handler = jest.fn();
      dashboard.on('notification', handler);

      dashboard.addNotification({ type: 'info', title: 'Test' });

      expect(handler).toHaveBeenCalledWith(expect.objectContaining({ title: 'Test' }));
    });

    test('getNotifications returns all', () => {
      dashboard.addNotification({ type: 'info', title: 'A' });
      dashboard.addNotification({ type: 'error', title: 'B' });

      expect(dashboard.getNotifications()).toHaveLength(2);
    });

    test('getNotifications unread only', () => {
      dashboard.addNotification({ type: 'info', title: 'A' });
      dashboard.addNotification({ type: 'error', title: 'B' });
      dashboard.notifications[0].read = true;

      expect(dashboard.getNotifications(true)).toHaveLength(1);
      expect(dashboard.getNotifications(true)[0].title).toBe('B');
    });

    test('getNotifications returns copy', () => {
      dashboard.addNotification({ type: 'info', title: 'A' });

      const notifs = dashboard.getNotifications();
      notifs.push({ type: 'extra' });

      expect(dashboard.notifications).toHaveLength(1);
    });

    test('markNotificationRead marks specific notification', () => {
      dashboard.addNotification({ type: 'info', title: 'A' });
      const id = dashboard.notifications[0].id;

      dashboard.markNotificationRead(id);

      expect(dashboard.notifications[0].read).toBe(true);
    });

    test('markNotificationRead ignores unknown id', () => {
      dashboard.addNotification({ type: 'info', title: 'A' });

      dashboard.markNotificationRead('nonexistent');

      expect(dashboard.notifications[0].read).toBe(false);
    });

    test('markAllNotificationsRead marks all', () => {
      dashboard.addNotification({ type: 'info', title: 'A' });
      dashboard.addNotification({ type: 'error', title: 'B' });

      dashboard.markAllNotificationsRead();

      expect(dashboard.notifications.every(n => n.read)).toBe(true);
    });

    test('clearNotifications removes all', () => {
      dashboard.addNotification({ type: 'info', title: 'A' });
      dashboard.addNotification({ type: 'error', title: 'B' });

      dashboard.clearNotifications();

      expect(dashboard.notifications).toHaveLength(0);
    });

    test('notifications are capped at 50', () => {
      for (let i = 0; i < 55; i++) {
        dashboard.addNotification({ type: 'info', title: `N${i}` });
      }

      expect(dashboard.notifications).toHaveLength(50);
    });
  });

  // ============================================================
  // getProgressPercentage
  // ============================================================
  describe('getProgressPercentage', () => {
    test('returns 0 when no orchestrator', () => {
      expect(dashboard.getProgressPercentage()).toBe(0);
    });

    test('delegates to orchestrator', () => {
      dashboard.orchestrator = createMockOrchestrator();
      expect(dashboard.getProgressPercentage()).toBe(50);
    });
  });

  // ============================================================
  // getStatusPath / readStatus
  // ============================================================
  describe('getStatusPath / readStatus', () => {
    test('getStatusPath returns status file path', () => {
      expect(dashboard.getStatusPath()).toBe(dashboard.statusPath);
    });

    test('readStatus returns JSON when file exists', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockResolvedValue({ status: 'ok' });

      const result = await dashboard.readStatus();
      expect(result).toEqual({ status: 'ok' });
    });

    test('readStatus returns null when file missing', async () => {
      fs.pathExists.mockResolvedValue(false);

      const result = await dashboard.readStatus();
      expect(result).toBeNull();
    });

    test('readStatus emits error and returns null on failure', async () => {
      fs.pathExists.mockRejectedValue(new Error('read error'));
      const errorHandler = jest.fn();
      dashboard.on('error', errorHandler);

      const result = await dashboard.readStatus();

      expect(result).toBeNull();
      expect(errorHandler).toHaveBeenCalled();
    });
  });

  // ============================================================
  // clear
  // ============================================================
  describe('clear', () => {
    test('clears history and notifications', () => {
      dashboard.addToHistory({ type: 'test' });
      dashboard.addNotification({ type: 'info', title: 'A' });

      dashboard.clear();

      expect(dashboard.history).toHaveLength(0);
      expect(dashboard.notifications).toHaveLength(0);
    });
  });
});

// ============================================================
// Helpers
// ============================================================
function createMockOrchestrator() {
  return {
    storyId: 'story-1',
    state: 'running',
    executionState: {
      currentEpic: 3,
      startedAt: '2026-01-01T00:00:00Z',
      epics: {
        1: { status: 'completed' },
        2: { status: 'completed' },
        3: { status: 'in_progress' },
        4: { status: 'pending' },
      },
      errors: [],
    },
    constructor: {
      EPIC_CONFIG: {
        3: { name: 'Epic 3 - Implementation' },
      },
    },
    getProgressPercentage: jest.fn().mockReturnValue(50),
    on: jest.fn(),
  };
}
